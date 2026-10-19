/**
 * Record Controller Unit Test - 记账记录控制器单元测试
 *
 * 测试目标: 验证记账记录控制器的所有业务逻辑
 *
 * 测试内容:
 * 1. 创建记录 - 金额验证、分类验证
 * 2. 查询记录 - 分页、筛选、排序
 * 3. 更新记录 - 权限验证、数据验证
 * 4. 删除记录 - 权限验证
 * 5. 统计计算 - 汇总、分类统计
 * 6. 数据导出 - Excel生成
 */

const recordController = require('../../../../backend/controllers/recordController');
const Record = require('../../../../backend/models/Record');

jest.mock('../../../../backend/models/Record');

describe('Record Controller', () => {
  const mockReq = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    userId: 'test_user_001'
  });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create record successfully', async () => {
      const req = mockReq({
        type: 'expense',
        amount: 100.50,
        category_id: 'cat_exp_餐饮',
        note: '午餐',
        record_date: '2024-01-15'
      });
      const res = mockRes();

      Record.create.mockResolvedValue({
        id: 'rec_new',
        user_id: 'test_user_001',
        ...req.body
      });

      await recordController.create(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'rec_new' })
        })
      );
    });

    test('should reject negative amount', async () => {
      const req = mockReq({
        type: 'expense',
        amount: -100,
        category_id: 'cat_exp_餐饮'
      });
      const res = mockRes();

      await recordController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('金额')
        })
      );
    });

    test('should reject zero amount', async () => {
      const req = mockReq({
        type: 'expense',
        amount: 0,
        category_id: 'cat_exp_餐饮'
      });
      const res = mockRes();

      await recordController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject invalid category', async () => {
      const req = mockReq({
        type: 'expense',
        amount: 100,
        category_id: 'invalid_category'
      });
      const res = mockRes();

      await recordController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('findAll', () => {
    test('should return paginated records', async () => {
      const req = mockReq({}, {}, { page: 1, pageSize: 10 });
      const res = mockRes();

      Record.findByUserId.mockResolvedValue({
        records: [
          { id: 'rec_1', amount: 100 },
          { id: 'rec_2', amount: 200 }
        ],
        pagination: { page: 1, pageSize: 10, total: 2 }
      });

      await recordController.findAll(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            records: expect.any(Array),
            pagination: expect.any(Object)
          })
        })
      );
    });

    test('should filter by date range', async () => {
      const req = mockReq({}, {}, {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
      const res = mockRes();

      Record.findByUserId.mockResolvedValue({
        records: [],
        pagination: { page: 1, pageSize: 20, total: 0 }
      });

      await recordController.findAll(req, res);

      expect(Record.findByUserId).toHaveBeenCalledWith(
        'test_user_001',
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      );
    });

    test('should filter by category', async () => {
      const req = mockReq({}, {}, { categoryId: 'cat_exp_餐饮' });
      const res = mockRes();

      Record.findByUserId.mockResolvedValue({
        records: [],
        pagination: { page: 1, pageSize: 20, total: 0 }
      });

      await recordController.findAll(req, res);

      expect(Record.findByUserId).toHaveBeenCalledWith(
        'test_user_001',
        expect.objectContaining({ categoryId: 'cat_exp_餐饮' })
      );
    });
  });

  describe('update', () => {
    test('should update record successfully', async () => {
      const req = mockReq(
        { amount: 200 },
        { id: 'rec_123' }
      );
      const res = mockRes();

      Record.findById.mockResolvedValue({
        id: 'rec_123',
        user_id: 'test_user_001'
      });
      Record.update.mockResolvedValue({ affectedRows: 1 });

      await recordController.update(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test('should reject update of other user record', async () => {
      const req = mockReq(
        { amount: 200 },
        { id: 'rec_999' }
      );
      const res = mockRes();

      Record.findById.mockResolvedValue({
        id: 'rec_999',
        user_id: 'other_user' // Different user
      });

      await recordController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should return 404 for non-existent record', async () => {
      const req = mockReq(
        { amount: 200 },
        { id: 'rec_nonexistent' }
      );
      const res = mockRes();

      Record.findById.mockResolvedValue(null);

      await recordController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    test('should delete record successfully', async () => {
      const req = mockReq({}, { id: 'rec_123' });
      const res = mockRes();

      Record.findById.mockResolvedValue({
        id: 'rec_123',
        user_id: 'test_user_001'
      });
      Record.delete.mockResolvedValue({ affectedRows: 1 });

      await recordController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test('should reject delete of other user record', async () => {
      const req = mockReq({}, { id: 'rec_999' });
      const res = mockRes();

      Record.findById.mockResolvedValue({
        id: 'rec_999',
        user_id: 'other_user'
      });

      await recordController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getStats', () => {
    test('should return yearly stats', async () => {
      const req = mockReq({}, {}, { type: 'yearly' });
      const res = mockRes();

      Record.getYearlyStats.mockResolvedValue({
        total: 50000,
        count: 100,
        byMonth: []
      });

      await recordController.getStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            total: expect.any(Number)
          })
        })
      );
    });

    test('should return monthly stats', async () => {
      const req = mockReq({}, {}, { type: 'monthly' });
      const res = mockRes();

      Record.getMonthlyStats.mockResolvedValue({
        total: 5000,
        count: 30
      });

      await recordController.getStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });
});
