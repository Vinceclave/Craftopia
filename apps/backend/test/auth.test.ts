import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/config/prisma';
import { generateEmailToken } from '../src/utils/token';

describe('Auth Endpoints Integration Test', () => {
  const testUser = {
    username: 'jest_user',
    email: 'jest@example.com',
    password: 'Password123!',
  };

  let accessToken: string;
  let refreshToken: string;
  let emailToken: string;

  // Helper: Clean up test user and related data
  const cleanupTestUser = async () => {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: testUser.email }, { username: testUser.username }] },
    });

    if (user) {
      await prisma.refreshToken.deleteMany({ where: { user_id: user.user_id } });
      await prisma.userProfile.deleteMany({ where: { user_id: user.user_id } });
      await prisma.user.deleteMany({ where: { user_id: user.user_id } });
    }
  };

  beforeAll(async () => await cleanupTestUser());
  afterAll(async () => { await cleanupTestUser(); await prisma.$disconnect(); });

  // ======================
  // Registration Tests
  // ======================
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    it('should not register duplicate username/email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ======================
  // Login Tests
  // ======================
  describe('POST /api/auth/login', () => {
    it('should login with username', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('should login with email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'notexist',
        password: 'password',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ======================
  // Refresh Token Tests
  // ======================
  describe('POST /api/auth/refresh-token', () => {
    it('should refresh tokens', async () => {
      const res = await request(app).post('/api/auth/refresh-token').send({ refreshToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      // Update refreshToken for logout test
      refreshToken = res.body.refreshToken;
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh-token').send({ refreshToken: 'invalid' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ======================
  // Logout Tests
  // ======================
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout').send({ refreshToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle already revoked/invalid token', async () => {
      const res = await request(app).post('/api/auth/logout').send({ refreshToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ======================
  // Email Verification Tests
  // ======================
  describe('Email Verification', () => {
    beforeAll(async () => {
      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      emailToken = generateEmailToken(user!.user_id);
    });

    it('should verify email', async () => {
      const res = await request(app).get('/api/auth/verify-email').query({ token: emailToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Email verified successfully');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app).get('/api/auth/verify-email').query({ token: 'invalid' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should resend verification email if not verified', async () => {
      // Mark email as unverified again
      const user = await prisma.user.findUnique({ where: { email: testUser.email } });
      await prisma.user.update({ where: { user_id: user!.user_id }, data: { is_email_verified: false } });

      const res = await request(app).post('/api/auth/resend-verification').send({ email: testUser.email });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Verification email sent successfully');
    });
  });

  // ======================
  // Change Password Tests
  // ======================
  describe('Change Password', () => {
    beforeAll(async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password,
      });
      accessToken = loginRes.body.accessToken;
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: testUser.password, newPassword: 'NewPassword123!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'NewPassword123!' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
