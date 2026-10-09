const express = require('express');
const router = express.Router();
const PaymentChannel = require('../models/PaymentChannel');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 获取支付渠道
router.get('/', async (req, res) => {
  try {
    const channels = await PaymentChannel.getUserChannels(req.userId);
    res.json({ success: true, data: channels });
  } catch (err) {
    console.error('获取支付渠道错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建自定义支付渠道
router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: '请填写必填字段' });
    }
    await PaymentChannel.create({ name, icon, color, userId: req.userId });
    res.json({ success: true, message: '创建成功' });
  } catch (err) {
    console.error('创建支付渠道错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除自定义支付渠道
router.delete('/:id', async (req, res) => {
  try {
    const success = await PaymentChannel.delete(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ success: false, message: '支付渠道不存在或无权删除' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('删除支付渠道错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
