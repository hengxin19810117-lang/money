/**
 * Record Model Unit Test - 记账记录模型单元测试
 *
 * 测试目标: 验证 Record 模型的所有业务逻辑
 *
 * 测试内容:
 * 1. 记录创建时金额精度处理 (DECIMAL)
 * 2. 记录类型验证 (expense/income)
 * 3. 分类关联验证
 * 4. 日期格式处理
 * 5. 按用户查询记录
 * 6. 记录统计计算
 */

const Record = require('../../../../backend/models/Record');

describe('Record Model', () => {
  describe('create', () => {
    test('should create expense record with correct amount precision', async () => {
      const recordData = {
        user_id: 'test_user_001',
        type: 'expense',
        amount: 123.45,
        category_id: 'cat_exp_餐饮',
        note: '午餐费用',
        record_date: '2024-01-15'
      };

      const record = await Record.create(recordData);

      expect(record.amount).toBe(123.45);
      expect(record.type).toBe('expense');
      expect(record.id).toBeDefined();
    });

    test('should create income record', async () => {
      const recordData = {
        user_id: 'test_user_001',
        type: 'income',
        amount: 5000.00,
        category_id: 'cat_inc_工资',
        note: '月薪',
        record_date: '2024-01-01'
      };

      const record = await Record.create(recordData);

      expect(record.type).toBe('income');
      expect(record.amount).toBe(5000.00);
    });

    test('should reject invalid type', async () => {
      const recordData = {
        user_id: 'test_user_001',
        type: 'invalid_type',
        amount: 100,
        category_id: 'cat_exp_餐饮'
      };

      await expect(Record.create(recordData)).rejects.toThrow();
    });
  });

  describe('findByUserId', () => {
    test('should find records by user id with pagination', async () => {
      const result = await Record.findByUserId('test_user_001', {
        page: 1,
        pageSize: 10
      });

      expect(result.records).toBeDefined();
      expect(Array.isArray(result.records)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    test('should filter by date range', async () => {
      const result = await Record.findByUserId('test_user_001', {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(result.records).toBeDefined();
    });

    test('should filter by category', async () => {
      const result = await Record.findByUserId('test_user_001', {
        categoryId: 'cat_exp_餐饮'
      });

      expect(result.records).toBeDefined();
    });
  });

  describe('calculateStats', () => {
    test('should calculate total expense for user', async () => {
      const stats = await Record.calculateStats('test_user_001', 'expense');

      expect(stats).toBeDefined();
      expect(stats.total).toBeDefined();
      expect(stats.count).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.count).toBe('number');
    });

    test('should calculate total income for user', async () => {
      const stats = await Record.calculateStats('test_user_001', 'income');

      expect(stats).toBeDefined();
      expect(stats.total).toBeDefined();
      expect(stats.count).toBeDefined();
    });
  });

  describe('delete', () => {
    test('should delete record by id', async () => {
      const record = await Record.create({
        user_id: 'test_user_001',
        type: 'expense',
        amount: 50.00,
        category_id: 'cat_exp_交通',
        record_date: '2024-01-15'
      });

      await Record.delete(record.id);

      const deleted = await Record.findById(record.id);
      expect(deleted).toBeUndefined();
    });
  });
});
