/**
 * Auth Integration Test - 认证模块集成测试
 *
 * 测试目标: 验证完整认证流程
 *
 * 测试内容:
 * 1. 用户注册 → 登录 → Token验证 → 登出
 * 2. 完整API调用链路
 * 3. 数据库操作验证
 */

const request = require('supertest');
const app = require('../../../../backend/index');
const User = require('../../../../backend/models/User');

describe('Auth Integration Tests', () => {
  const testUser = {
    username: `test_${Date.now()}`,
    password: 'TestPassword123!',
    nickname: '集成测试用户'
  };

  describe('Full Auth Flow', () => {
    test('POST /api/auth/register → 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe(testUser.username);
    });

    test('POST /api/auth/login → 200 (valid credentials)', async () => {
      // 先注册
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // 再登录
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login → 401 (wrong password)', async () => {
      // 先注册
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // 用错误密码登录
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login → 401 (non-existent user)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent_user_12345',
          password: 'somepassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/user → 200 (with valid token)', async () => {
      // 注册并获取token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const token = registerRes.body.data.token;

      // 用token获取用户信息
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data.password).toBeUndefined(); // 密码不应返回
    });

    test('GET /api/auth/user → 401 (without token)', async () => {
      const res = await request(app)
        .get('/api/auth/user');

      expect(res.status).toBe(401);
    });

    test('GET /api/auth/user → 401 (with invalid token)', async () => {
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer invalid_token_123');

      expect(res.status).toBe(401);
    });
  });

  describe('Token Persistence', () => {
    test('should maintain session across requests', async () => {
      // 注册
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: `persist_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 多个请求使用同一token
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .get('/api/auth/user')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
      }
    });

    test('should reject token after logout', async () => {
      // 注册
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: `logout_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 登出 (如果实现的话)
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // 再次使用token应该失败
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Password Security', () => {
    test('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `weak_${Date.now()}`,
          password: '123' // 太简单
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject duplicate username', async () => {
      const username = `dup_${Date.now()}`;

      // 第一次注册
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      // 第二次注册同一用户名
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(400);
    });
  });
});
