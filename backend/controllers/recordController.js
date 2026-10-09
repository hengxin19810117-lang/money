const Record = require('../models/Record');

class RecordController {
  // 创建记账记录
  static async create(req, res) {
    try {
      const { type, amount, categoryId, note, merchant, paymentChannel, recordDate } = req.body;

      if (!type || !amount || !categoryId || !recordDate) {
        return res.status(400).json({ success: false, message: '请填写必填字段' });
      }

      if (amount <= 0) {
        return res.status(400).json({ success: false, message: '金额必须大于0' });
      }

      await Record.create({
        userId: req.userId,
        type,
        amount: parseFloat(amount),
        categoryId,
        note,
        merchant,
        paymentChannel,
        recordDate
      });

      res.json({ success: true, message: '记账成功' });
    } catch (err) {
      console.error('创建记录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 获取记账记录列表
  static async list(req, res) {
    try {
      const { page, pageSize, type, categoryId, startDate, endDate } = req.query;

      const result = await Record.findByUser(req.userId, {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
        type,
        categoryId,
        startDate,
        endDate
      });

      res.json({ success: true, data: result });
    } catch (err) {
      console.error('获取记录列表错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 获取今日记账记录
  static async getToday(req, res) {
    try {
      const records = await Record.getToday(req.userId);
      res.json({ success: true, data: records });
    } catch (err) {
      console.error('获取今日记录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 更新记账记录
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { amount, categoryId, note, merchant, paymentChannel, recordDate } = req.body;

      const success = await Record.update(id, req.userId, {
        amount: parseFloat(amount),
        categoryId,
        note,
        merchant,
        paymentChannel,
        recordDate
      });

      if (!success) {
        return res.status(404).json({ success: false, message: '记录不存在或无权修改' });
      }

      res.json({ success: true, message: '更新成功' });
    } catch (err) {
      console.error('更新记录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 删除记账记录
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const success = await Record.delete(id, req.userId);

      if (!success) {
        return res.status(404).json({ success: false, message: '记录不存在或无权删除' });
      }

      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('删除记录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 获取月度统计
  static async getMonthlyStats(req, res) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({ success: false, message: '请指定年份和月份' });
      }

      const stats = await Record.getMonthlyStats(req.userId, parseInt(year), parseInt(month));
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error('获取月度统计错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 获取日度趋势
  static async getDailyTrend(req, res) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({ success: false, message: '请指定年份和月份' });
      }

      const trend = await Record.getDailyTrend(req.userId, parseInt(year), parseInt(month));
      res.json({ success: true, data: trend });
    } catch (err) {
      console.error('获取日度趋势错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 导出数据
  static async export(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const records = await Record.getByDateRange(req.userId, startDate, endDate);
      res.json({ success: true, data: records });
    } catch (err) {
      console.error('导出数据错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
}

module.exports = RecordController;
