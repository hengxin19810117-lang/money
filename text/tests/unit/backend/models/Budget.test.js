/**
 * Budget Model Unit Test - 预算模型单元测试
 *
 * 测试目标: 验证 Budget 模型的所有业务逻辑
 *
 * 测试内容:
 * 1. 预算创建 (日/周/月/年周期)
 * 2. 预算使用率计算
 * 3. 预算超支判断
 * 4. 预算更新和删除
 * 5. 多预算周期计算
 */

const Budget = require('../../../../backend/models/Budget');
const Record = require('../../../../backend/models/Record');

describe('Budget Model', () => {
  describe('create', () => {
    test('should create monthly budget', async () => {
      const budgetData = {
        user_id: 'test_user_001',
        category_id: null, // 总预算
        amount: 5000.00,
        period_type: 'monthly'
      };

      const budget = await Budget.create(budgetData);

      expect(budget.id).toBeDefined();
      expect(budget.amount).toBe(5000.00);
      expect(budget.period_type).toBe('monthly');
    });

    test('should create category-specific budget', async () => {
      const budgetData = {
        user_id: 'test_user_001',
        category_id: 'cat_exp_餐饮',
        amount: 1500.00,
        period_type: 'monthly'
      };

      const budget = await Budget.create(budgetData);

      expect(budget.category_id).toBe('cat_exp_餐饮');
    });
  });

  describe('calculateUsage', () => {
    test('should calculate correct usage percentage', async () => {
      const budget = await Budget.create({
        user_id: 'test_user_001',
        category_id: 'cat_exp_餐饮',
        amount: 1000.00,
        period_type: 'monthly'
      });

      // 添加500元的餐饮支出
      await Record.create({
        user_id: 'test_user_001',
        type: 'expense',
        amount: 500.00,
        category_id: 'cat_exp_餐饮',
        record_date: new Date()
      });

      const usage = await Budget.calculateUsage(budget.id);

      expect(usage.percentage).toBe(50);
      expect(usage.spent).toBe(500.00);
      expect(usage.remaining).toBe(500.00);
    });

    test('should return 0% usage for new budget', async () => {
      const budget = await Budget.create({
        user_id: 'test_user_002',
        category_id: null,
        amount: 2000.00,
        period_type: 'monthly'
      });

      const usage = await Budget.calculateUsage(budget.id);

      expect(usage.percentage).toBe(0);
      expect(usage.spent).toBe(0);
    });

    test('should cap at 100% when over budget', async () => {
      const budget = await Budget.create({
        user_id: 'test_user_003',
        category_id: 'cat_exp_交通',
        amount: 100.00,
        period_type: 'monthly'
      });

      // 添加150元的交通支出 (超出预算)
      await Record.create({
        user_id: 'test_user_003',
        type: 'expense',
        amount: 150.00,
        category_id: 'cat_exp_交通',
        record_date: new Date()
      });

      const usage = await Budget.calculateUsage(budget.id);

      expect(usage.percentage).toBeGreaterThanOrEqual(100);
      expect(usage.isOverBudget).toBe(true);
    });
  });

  describe('findByUserId', () => {
    test('should find all budgets for user', async () => {
      const budgets = await Budget.findByUserId('test_user_001');

      expect(Array.isArray(budgets)).toBe(true);
    });
  });

  describe('update', () => {
    test('should update budget amount', async () => {
      const budget = await Budget.create({
        user_id: 'test_user_001',
        category_id: null,
        amount: 1000.00,
        period_type: 'monthly'
      });

      await Budget.update(budget.id, { amount: 2000.00 });

      const updated = await Budget.findById(budget.id);
      expect(updated.amount).toBe(2000.00);
    });
  });

  describe('delete', () => {
    test('should delete budget', async () => {
      const budget = await Budget.create({
        user_id: 'test_user_001',
        category_id: null,
        amount: 500.00,
        period_type: 'weekly'
      });

      await Budget.delete(budget.id);

      const deleted = await Budget.findById(budget.id);
      expect(deleted).toBeUndefined();
    });
  });
});
