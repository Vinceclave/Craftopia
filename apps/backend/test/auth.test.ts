import request from 'supertest';
import app from '../src/index'; // <-- use index.ts
import { prisma } from '../src/config/prisma';

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'jest_user',
    email: 'jest@example.com',
    password: 'Password123!',
  };

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('user_id');
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
