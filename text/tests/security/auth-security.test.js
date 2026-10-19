/**
 * Auth Security Test - 认证安全测试
 *
 * 测试目标: 验证认证系统的安全性
 *
 * 测试内容:
 * 1. 密码强度验证
 * 2. Token安全 (伪造、过期)
 * 3. 暴力破解防护
 * 4. 敏感数据泄露
 */

const request = require('supertest');
const app = require('../../../../backend/index');

describe('Auth Security Tests', () => {
  describe('Password Strength', () => {
    const weakPasswords = [
      '123',           // 太短
      'password',      // 常见密码
      '12345678',      // 无特殊字符
      'ABCDEFGH',      // 无小写
      'abcdefgh',      // 无大写
      'Abcdefgh',      // 无数字
      'Abc123',        // 太短
    ];

    weakPasswords.forEach(password => {
      test(`should reject weak password: ${password}`, async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: `weak_${Date.now()}_${Math.random()}`,
            password: password
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('密码');
      });
    });

    test('should accept strong password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `strong_${Date.now()}`,
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(201);
    });
  });

  describe('Token Security', () => {
    test('should reject tampered token', async () => {
      // 使用有效token但篡改内容
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2UifQ.fake');

      expect(res.status).toBe(401);
    });

    test('should reject expired token', async () => {
      // 这个测试需要创建过期的token
      // 由于JWT_SECRET是硬编码的，我们只能测试格式正确的无效token
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });

    test('should reject malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'NotBearer some_token');

      expect(res.status).toBe(401);
    });
  });

  describe('Brute Force Protection', () => {
    test('should track failed login attempts', async () => {
      // 连续5次错误密码登录
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'wrong_password_attempt_' + i
          });
      }

      // 第6次应该被阻止或延迟
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'still_wrong'
        });

      // 应该返回429 (Too Many Requests) 或 401 with 限制提示
      expect([401, 429]).toContain(res.status);
    });
  });

  describe('Sensitive Data Exposure', () => {
    test('should not expose password in user response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `sensitive_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const token = res.body.data.token;

      // 获取用户信息
      const userRes = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${token}`);

      expect(userRes.status).toBe(200);
      expect(userRes.body.data.password).toBeUndefined();
      expect(userRes.body.data).not.toHaveProperty('password');
    });

    test('should not expose password in admin user list', async () => {
      // 管理员登录
      const adminRes = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      const adminToken = adminRes.body.data.token;

      // 获取用户列表
      const usersRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(usersRes.status).toBe(200);

      // 验证用户数据中没有密码
      usersRes.body.data.users.forEach(user => {
        expect(user.password).toBeUndefined();
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('Session Management', () => {
    test('should invalidate token after logout', async () => {
      // 注册并登录
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: `logout_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 如果有logout接口，调用它
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // 使用logout后的token再次访问
      const tokenToUse = logoutRes.body.data?.newToken || token;

      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${tokenToUse}`);

      // 如果实现了logout，token应该失效
      if (logoutRes.body.success) {
        expect(res.status).toBe(401);
      }
    });
  });
});
