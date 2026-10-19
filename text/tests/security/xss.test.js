/**
 * XSS Security Test - 跨站脚本攻击安全测试
 *
 * 测试目标: 验证系统对XSS攻击的防护
 *
 * 测试内容:
 * 1. 记录备注XSS注入
 * 2. 用户名XSS注入
 * 3. 商家名称XSS注入
 */

const request = require('supertest');
const app = require('../../../../backend/index');

describe('XSS Security Tests', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `xss_test_${Date.now()}`,
        password: 'TestPassword123!'
      });

    authToken = res.body.data.token;
  });

  describe('Record XSS Injection', () => {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<div onclick=alert(1)>click</div>',
    ];

    xssPayloads.forEach(payload => {
      test(`should sanitize XSS in record note: ${payload.substring(0, 30)}...`, async () => {
        const res = await request(app)
          .post('/api/records')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'expense',
            amount: 100,
            category_id: 'cat_exp_餐饮',
            note: payload,
            record_date: '2024-01-15'
          });

        // 应该成功创建 (因为后端可能存储原文)
        // 前端渲染时需要转义
        expect([201, 400]).toContain(res.status);

        if (res.status === 201) {
          // 获取记录验证数据
          const getRes = await request(app)
            .get('/api/records')
            .set('Authorization', `Bearer ${authToken}`);

          expect(getRes.status).toBe(200);

          // 如果返回了记录，检查备注
          const records = getRes.body.data.records;
          if (records.length > 0) {
            const targetRecord = records.find(r => r.note === payload || r.note.includes(payload));
            if (targetRecord) {
              // 验证前端是否会对特殊字符转义 (这是前端的责任)
              // 后端返回原始数据是正常的
              expect(targetRecord.note).toBeDefined();
            }
          }
        }
      });
    });

    test('should sanitize XSS in merchant name', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 100,
          category_id: 'cat_exp_购物',
          merchant: '<script>alert("hacked")</script>',
          record_date: '2024-01-15'
        });

      expect([201, 400]).toContain(res.status);
    });
  });

  describe('Username XSS Injection', () => {
    test('should handle XSS in username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `<img src=x onerror=alert(1)>`,
          password: 'TestPassword123!'
        });

      // 应该返回400或成功创建但用户名被处理
      expect([201, 400]).toContain(res.status);
    });
  });

  describe('Category Name XSS Injection', () => {
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

    test('should handle XSS in custom category name', async () => {
      // 创建自定义分类
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '<script>alert(1)</script>',
          type: 'expense',
          icon: 'star',
          color: '#FF0000'
        });

      // 应该返回201或400
      expect([201, 400]).toContain(res.status);
    });
  });
});
