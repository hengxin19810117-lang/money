const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 获取用户的所有预算
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.findByUser(req.userId);
    res.json({ success: true, data: budgets });
  } catch (err) {
    console.error('获取预算错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取预算使用情况
router.get('/usage', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const usage = await Budget.getBudgetUsage(req.userId, startDate, endDate);
    res.json({ success: true, data: usage });
  } catch (err) {
    console.error('获取预算使用情况错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建预算
router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, periodType, startDate, endDate } = req.body;
    if (!amount || !startDate) {
      return res.status(400).json({ success: false, message: '请填写必填字段' });
    }
    await Budget.create({ userId: req.userId, categoryId, amount, periodType, startDate, endDate });
    res.json({ success: true, message: '创建成功' });
  } catch (err) {
    console.error('创建预算错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新预算
router.put('/:id', async (req, res) => {
  try {
    const { amount, periodType, startDate, endDate } = req.body;
    const success = await Budget.update(req.params.id, req.userId, { amount, periodType, startDate, endDate });
    if (!success) {
      return res.status(404).json({ success: false, message: '预算不存在或无权修改' });
    }
    res.json({ success: true, message: '更新成功' });
  } catch (err) {
    console.error('更新预算错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除预算
router.delete('/:id', async (req, res) => {
  try {
    const success = await Budget.delete(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ success: false, message: '预算不存在或无权删除' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('删除预算错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
