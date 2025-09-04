import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/config/prisma';

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'jest_user',
    email: 'jest@example.com',
    password: 'Password123!',
  };

  // Clean up before and after tests
  beforeAll(async () => {
    // Make sure test user doesn't exist before starting
    await cleanupTestUser();
  });

  afterAll(async () => {
    // Clean up test user and disconnect
    await cleanupTestUser();
    await prisma.$disconnect();
  });

  // Helper function to properly clean up test user and related data
  const cleanupTestUser = async () => {
    // First, find the user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: testUser.email },
          { username: testUser.username }
        ]
      }
    });

    if (user) {
      // Delete refresh tokens first (due to foreign key constraint)
      await prisma.refreshToken.deleteMany({
        where: { user_id: user.user_id }
      });

      // Delete user profile if exists
      await prisma.userProfile.deleteMany({
        where: { user_id: user.user_id }
      });

      // Now delete the user
      await prisma.user.deleteMany({
        where: { user_id: user.user_id }
      });
    }
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user_id');
      expect(res.body.data).toHaveProperty('username', testUser.username);
      expect(res.body.data).toHaveProperty('email', testUser.email);
      // Password hash should not be returned
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    it('should not register user with duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not register user with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test' }); // Missing email and password

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login the user with username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ 
          username: testUser.username, 
          password: testUser.password 
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', testUser.username);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should login the user with email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ 
          username: testUser.email, // Using email as username
          password: testUser.password 
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ 
          username: testUser.username, 
          password: 'wrongpassword' 
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ 
          username: 'nonexistent', 
          password: 'somepassword' 
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid username or password');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      // Login to get a valid refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validRefreshToken = loginRes.body.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: validRefreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      
      // Update the refresh token for next test
      validRefreshToken = res.body.refreshToken;
    });

    it('should not refresh with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalid_token'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      // Login to get a valid refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validRefreshToken = loginRes.body.refreshToken;
    });

    it('should logout successfully with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: validRefreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should handle logout with already used/invalid refresh token', async () => {
      // Try to use the same refresh token again (should be revoked)
      const res = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: validRefreshToken // This token was already used in previous test
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should handle logout with completely invalid token gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'completely_invalid_token'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing fields in registration', async () => {
      const testCases = [
        { username: 'test' }, // missing email and password
        { email: 'test@test.com' }, // missing username and password
        { password: 'password123' }, // missing username and email
        { username: 'test', email: 'test@test.com' }, // missing password
        { username: 'test', password: 'password123' }, // missing email
        { email: 'test@test.com', password: 'password123' }, // missing username
      ];

      for (const testCase of testCases) {
        const res = await request(app)
          .post('/api/auth/register')
          .send(testCase);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('error', 'Missing required fields');
      }
    });

    it('should handle missing fields in login', async () => {
      const testCases = [
        { username: 'test' }, // missing password
        { password: 'password123' }, // missing username
        {}, // missing both
      ];

      for (const testCase of testCases) {
        const res = await request(app)
          .post('/api/auth/login')
          .send(testCase);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
      }
    });
  });
});