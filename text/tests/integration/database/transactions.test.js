/**
 * Database Transaction Integration Test - 数据库事务集成测试
 *
 * 测试目标: 验证数据库事务的正确性
 *
 * 测试内容:
 * 1. 事务回滚机制
 * 2. 并发写入数据一致性
 * 3. 外键约束验证
 * 4. 大数据量查询性能
 */

const request = require('supertest');
const app = require('../../../../backend/index');

describe('Database Transaction Integration Tests', () => {
  describe('Transaction Rollback', () => {
    test('should rollback on validation failure', async () => {
      // 记录初始状态
      const beforeRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${global.testToken}`);

      const beforeCount = beforeRes.body.data.records.length;

      // 尝试创建无效记录 (应该失败)
      await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send({
          type: 'invalid_type',
          amount: -100,
          category_id: 'invalid'
        });

      // 验证记录数未变化
      const afterRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${global.testToken}`);

      const afterCount = afterRes.body.data.records.length;
      expect(afterCount).toBe(beforeCount);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent record creation', async () => {
      // 获取token
      const username = `concurrent_${Date.now()}`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 并发创建10条记录
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/records')
            .set('Authorization', `Bearer ${token}`)
            .send({
              type: 'expense',
              amount: 10 * (i + 1),
              category_id: 'cat_exp_餐饮',
              record_date: '2024-01-15'
            })
        );
      }

      const results = await Promise.all(promises);

      // 所有请求都应该成功
      results.forEach(res => {
        expect(res.status).toBe(201);
      });

      // 验证记录数
      const listRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.body.data.records.length).toBeGreaterThanOrEqual(10);
    });

    test('should maintain data consistency under load', async () => {
      const username = `consistency_${Date.now()}`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 并发读写
      const promises = [];

      // 5次写入
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/records')
            .set('Authorization', `Bearer ${token}`)
            .send({
              type: 'expense',
              amount: 100,
              category_id: 'cat_exp_餐饮',
              record_date: '2024-01-15'
            })
        );
      }

      // 5次读取
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/records')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      await Promise.all(promises);

      // 最终记录数应该正确
      const finalRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);

      expect(finalRes.body.data.records.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should reject record with non-existent category', async () => {
      const username = `fkey_${Date.now()}`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'expense',
          amount: 100,
          category_id: 'non_existent_category_12345',
          record_date: '2024-01-15'
        });

      expect(res.status).toBe(400);
    });

    test('should allow record with system category', async () => {
      const username = `syscat_${Date.now()}`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'expense',
          amount: 100,
          category_id: 'cat_exp_餐饮', // 系统预置分类
          record_date: '2024-01-15'
        });

      expect(res.status).toBe(201);
    });
  });

  describe('Query Performance', () => {
    test('should handle large result set with pagination', async () => {
      const username = `perf_${Date.now()}`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'TestPassword123!'
        });

      const token = registerRes.body.data.token;

      // 创建20条记录
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/records')
          .set('Authorization', `Bearer ${token}`)
          .send({
            type: 'expense',
            amount: 10 * (i + 1),
            category_id: 'cat_exp_餐饮',
            record_date: '2024-01-15'
          });
      }

      // 分页查询
      const res = await request(app)
        .get('/api/records')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBe(10);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(20);
      expect(res.body.data.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });
  });
});
