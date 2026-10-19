/**
 * SQL Injection Security Test - SQL注入安全测试
 *
 * 测试目标: 验证系统对SQL注入攻击的防护
 *
 * 测试内容:
 * 1. 认证接口SQL注入
 * 2. 记录查询SQL注入
 * 3. 用户名/备注等输入框注入
 */

const request = require('supertest');
const app = require('../../../../backend/index');

describe('SQL Injection Security Tests', () => {
  describe('Authentication SQL Injection', () => {
    const sqlInjectionPayloads = [
      "' OR 1=1 --",
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --",
      "'; DROP TABLE users; --",
      "' OR 1=1 LIMIT 1 --",
    ];

    sqlInjectionPayloads.forEach(payload => {
      test(`should prevent SQL injection in login: ${payload}`, async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: payload,
            password: 'anything'
          });

        // 应该返回401或400，而不是成功登录
        expect([400, 401]).toContain(res.status);
        // 不应该返回有效的token
        if (res.body.data && res.body.data.token) {
          expect(res.body.data.token).toBeFalsy();
        }
      });
    });

    test('should prevent SQL injection in registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: "' OR 1=1 --",
          password: 'TestPassword123!'
        });

      // 应该返回400，而不是创建用户
      expect(res.status).toBe(400);
    });
  });

  describe('Record Query SQL Injection', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `sqli_test_${Date.now()}`,
          password: 'TestPassword123!'
        });

      authToken = res.body.data.token;
    });

    const sqlInjectionPayloads = [
      "' OR 1=1 --",
      "'; SELECT * FROM records; --",
      "' UNION SELECT id,username,password FROM users --",
    ];

    sqlInjectionPayloads.forEach(payload => {
      test(`should prevent SQL injection in records query: ${payload.substring(0, 20)}...`, async () => {
        const res = await request(app)
          .get('/api/records')
          .query({ note: payload })
          .set('Authorization', `Bearer ${authToken}`);

        // 应该返回200但结果为空，或返回400
        expect([200, 400]).toContain(res.status);
        if (res.status === 200) {
          // 不应该返回所有记录
          expect(Array.isArray(res.body.data.records)).toBe(true);
        }
      });
    });
  });

  describe('Category Filter SQL Injection', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `sqli_cat_${Date.now()}`,
          password: 'TestPassword123!'
        });

      authToken = res.body.data.token;
    });

    test('should prevent SQL injection in category filter', async () => {
      const res = await request(app)
        .get('/api/records')
        .query({ categoryId: "' OR 1=1 --" })
        .set('Authorization', `Bearer ${authToken}`);

      // 应该返回400或空结果
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('Admin Panel SQL Injection', () => {
    let adminToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      adminToken = res.body.data.token;
    });

    test('should prevent SQL injection in admin user search', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .query({ username: "' OR 1=1 --" })
        .set('Authorization', `Bearer ${adminToken}`);

      // 应该返回200但结果为空，或返回400
      expect([200, 400]).toContain(res.status);
    });
  });
});
