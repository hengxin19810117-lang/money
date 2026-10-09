const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 获取所有分类（系统+用户自定义）
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getUserCategories(req.userId);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('获取分类错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 按类型获取分类
router.get('/type/:type', async (req, res) => {
  try {
    const categories = await Category.getByType(req.params.type, req.userId);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('获取分类错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建自定义分类
router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: '请填写必填字段' });
    }
    await Category.create({ name, type, icon, color, userId: req.userId });
    res.json({ success: true, message: '创建成功' });
  } catch (err) {
    console.error('创建分类错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除自定义分类
router.delete('/:id', async (req, res) => {
  try {
    const success = await Category.delete(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ success: false, message: '分类不存在或无权删除' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('删除分类错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
