/**
 * Admin Integration Test - 管理后台集成测试
 *
 * 测试目标: 验证管理后台完整功能
 *
 * 测试内容:
 * 1. 管理员登录 → 获取Token → 访问管理接口
 * 2. 用户管理 (列表、详情、状态更新)
 * 3. 记录管理 (查看所有记录)
 * 4. 统计数据 (报表)
 * 5. 权限验证 (普通用户不能访问)
 */

const request = require('supertest');
const app = require('../../../../admin-panel/backend/index');

describe('Admin Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    // 管理员登录
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    adminToken = res.body.data.token;
  });

  describe('Admin Authentication', () => {
    test('should login with admin credentials', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Dashboard', () => {
    test('GET /api/admin/dashboard → 200', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalRecords');
      expect(res.body.data).toHaveProperty('monthlyNewUsers');
      expect(res.body.data).toHaveProperty('monthlyRecords');
    });

    test('GET /api/admin/dashboard → 401 (no token)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard');

      expect(res.status).toBe(401);
    });
  });

  describe('User Management', () => {
    test('GET /api/admin/users → 200 (paginated list)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    test('GET /api/admin/users?username=xxx → 200 (filtered)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .query({ username: 'admin' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/admin/users/:id → 200 (user detail)', async () => {
      // 先获取用户列表
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = listRes.body.data.users[0].id;

      // 获取用户详情
      const res = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stats');
    });

    test('GET /api/admin/users/:id → 404 (non-existent)', async () => {
      const res = await request(app)
        .get('/api/admin/users/non_existent_id_12345')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    test('PUT /api/admin/users/:id/status → 200 (disable user)', async () => {
      // 先获取一个用户
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = listRes.body.data.users[0].id;

      // 禁用用户
      const res = await request(app)
        .put(`/api/admin/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'disabled' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('PUT /api/admin/users/:id/status → 200 (enable user)', async () => {
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = listRes.body.data.users[0].id;

      const res = await request(app)
        .put(`/api/admin/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(res.status).toBe(200);
    });
  });

  describe('Records Management', () => {
    test('GET /api/admin/records → 200 (paginated)', async () => {
      const res = await request(app)
        .get('/api/admin/records')
        .query({ page: 1, pageSize: 20 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.records)).toBe(true);
    });

    test('GET /api/admin/records?type=expense → 200 (filtered)', async () => {
      const res = await request(app)
        .get('/api/admin/records')
        .query({ type: 'expense' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/admin/records?userId=xxx → 200 (by user)', async () => {
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = listRes.body.data.users[0].id;

      const res = await request(app)
        .get('/api/admin/records')
        .query({ userId })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Statistics', () => {
    test('GET /api/admin/statistics → 200', async () => {
      const res = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('expenseRanking');
      expect(res.body.data).toHaveProperty('incomeRanking');
      expect(res.body.data).toHaveProperty('monthlyNewUsers');
      expect(res.body.data).toHaveProperty('monthlyRecords');
      expect(res.body.data).toHaveProperty('expenseRatio');
      expect(res.body.data).toHaveProperty('incomeRatio');
    });
  });

  describe('Authorization', () => {
    test('should reject non-admin user', async () => {
      // 创建一个普通用户
      const userRes = await request(app)
        .post('/api/auth/register') // 使用主后端注册
        .send({
          username: `nonadmin_${Date.now()}`,
          password: 'TestPassword123!'
        });

      // 尝试访问管理接口
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userRes.body.data.token}`);

      expect(res.status).toBe(403);
    });
  });
});
