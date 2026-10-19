/**
 * Category Model Unit Test - 分类模型单元测试
 *
 * 测试目标: 验证 Category 模型的所有业务逻辑
 *
 * 测试内容:
 * 1. 系统预置分类查询
 * 2. 用户自定义分类创建
 * 3. 分类类型过滤 (expense/income)
 * 4. 自定义分类删除权限
 * 5. 分类关联记录数查询
 */

const Category = require('../../../../backend/models/Category');
const Record = require('../../../../backend/models/Record');

describe('Category Model', () => {
  describe('findAll', () => {
    test('should return all categories', async () => {
      const categories = await Category.findAll();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should include system categories', async () => {
      const categories = await Category.findAll();
      const systemCategories = categories.filter(c => c.is_system === 1);

      expect(systemCategories.length).toBeGreaterThan(0);
    });
  });

  describe('findByType', () => {
    test('should return only expense categories', async () => {
      const categories = await Category.findByType('expense');

      categories.forEach(cat => {
        expect(cat.type).toBe('expense');
      });
    });

    test('should return only income categories', async () => {
      const categories = await Category.findByType('income');

      categories.forEach(cat => {
        expect(cat.type).toBe('income');
      });
    });
  });

  describe('create (custom category)', () => {
    test('should create user custom category', async () => {
      const categoryData = {
        name: '自定义分类',
        type: 'expense',
        icon: 'star',
        color: '#FF5733',
        is_system: 0,
        user_id: 'test_user_001'
      };

      const category = await Category.create(categoryData);

      expect(category.id).toBeDefined();
      expect(category.name).toBe('自定义分类');
      expect(category.is_system).toBe(0);
    });

    test('should not allow duplicate custom category name for same user', async () => {
      const categoryData = {
        name: '重复分类',
        type: 'expense',
        user_id: 'test_user_001'
      };

      await Category.create(categoryData);

      await expect(Category.create(categoryData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    test('should not allow deleting system category', async () => {
      const systemCategory = await Category.findAll({ is_system: 1, limit: 1 });

      if (systemCategory.length > 0) {
        await expect(
          Category.delete(systemCategory[0].id)
        ).rejects.toThrow('Cannot delete system category');
      }
    });

    test('should allow deleting custom category without records', async () => {
      const customCategory = await Category.create({
        name: '待删除分类',
        type: 'expense',
        user_id: 'test_user_001'
      });

      await Category.delete(customCategory.id);

      const deleted = await Category.findById(customCategory.id);
      expect(deleted).toBeUndefined();
    });

    test('should not allow deleting category with records', async () => {
      // 创建一个有关联记录的分类
      const category = await Category.create({
        name: '有关联记录的分类',
        type: 'expense',
        user_id: 'test_user_001'
      });

      await Record.create({
        user_id: 'test_user_001',
        type: 'expense',
        amount: 100,
        category_id: category.id,
        record_date: new Date()
      });

      await expect(Category.delete(category.id))
        .rejects.toThrow('Cannot delete category with records');
    });
  });

  describe('getRecordCount', () => {
    test('should return record count for category', async () => {
      const count = await Category.getRecordCount('cat_exp_餐饮');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
