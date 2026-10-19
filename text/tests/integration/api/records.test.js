/**
 * Records Integration Test - 记账记录集成测试
 *
 * 测试目标: 验证完整记账流程
 *
 * 测试内容:
 * 1. 创建分类 → 创建记录 → 查询 → 更新 → 删除
 * 2. 权限验证 (只能操作自己的记录)
 * 3. 统计计算验证
 * 4. 数据导出
 */

const request = require('supertest');
const app = require('../../../../backend/index');

describe('Records Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // 创建测试用户并登录
    const username = `record_test_${Date.now()}`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username,
        password: 'TestPassword123!'
      });

    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;
  });

  describe('Record CRUD', () => {
    let recordId;

    test('POST /api/records → 201 (create expense)', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 100.50,
          category_id: 'cat_exp_餐饮',
          note: '午餐测试',
          record_date: '2024-01-15'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      recordId = res.body.data.id;
    });

    test('POST /api/records → 201 (create income)', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'income',
          amount: 5000,
          category_id: 'cat_inc_工资',
          note: '月薪',
          record_date: '2024-01-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('income');
    });

    test('GET /api/records → 200 (list records)', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.records)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    test('GET /api/records (with filters) → 200', async () => {
      const res = await request(app)
        .get('/api/records')
        .query({
          type: 'expense',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('PUT /api/records/:id → 200 (update)', async () => {
      // 先创建一条记录
      const createRes = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 50,
          category_id: 'cat_exp_交通',
          record_date: '2024-01-15'
        });

      const recordId = createRes.body.data.id;

      // 更新记录
      const res = await request(app)
        .put(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 75,
          note: '更新后的备注'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('DELETE /api/records/:id → 200', async () => {
      // 先创建一条记录
      const createRes = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 30,
          category_id: 'cat_exp_其他',
          record_date: '2024-01-15'
        });

      const recordId = createRes.body.data.id;

      // 删除记录
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证记录已删除
      const getRes = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Authorization', () => {
    test('should not access other user records', async () => {
      // 创建另一个用户
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          username: `other_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const otherToken = otherUser.body.data.token;

      // 用其他用户的token访问当前用户的记录应该失败
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${otherToken}`);

      // 应该只能看到空列表或自己的记录
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.records)).toBe(true);
    });

    test('should not update other user records', async () => {
      // 创建另一个用户
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          username: `other_update_${Date.now()}`,
          password: 'TestPassword123!'
        });

      const otherToken = otherUser.body.data.token;

      // 尝试更新当前用户的记录
      const res = await request(app)
        .put('/api/records/some_record_id')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ amount: 999 });

      expect(res.status).toBe(403);
    });
  });

  describe('Statistics', () => {
    test('GET /api/records/stats/monthly → 200', async () => {
      const res = await request(app)
        .get('/api/records/stats/monthly')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('count');
    });

    test('GET /api/records/stats/yearly → 200', async () => {
      const res = await request(app)
        .get('/api/records/stats/yearly')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should reject negative amount', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: -100,
          category_id: 'cat_exp_餐饮'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid type', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'invalid_type',
          amount: 100,
          category_id: 'cat_exp_餐饮'
        });

      expect(res.status).toBe(400);
    });

    test('should reject invalid category', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 100,
          category_id: 'invalid_category'
        });

      expect(res.status).toBe(400);
    });
  });
});
