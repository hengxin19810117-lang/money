const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }

    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 更新最后登录时间
    await Admin.updateLastLogin(admin.id);

    // 生成 Token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin.id, username: admin.username }
      }
    });
  } catch (err) {
    console.error('管理员登录错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 管理员中间件
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token无效' });
  }
};

// 获取仪表盘数据
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [totalUsers, totalRecords, monthlyNewUsers, monthlyRecords, userTrend, recordTrend] = await Promise.all([
      Admin.getTotalUsers(),
      Admin.getTotalRecords(),
      Admin.getMonthlyNewUsers(year, month),
      Admin.getMonthlyRecords(year, month),
      Admin.getUserTrend(7),
      Admin.getRecordTrend(7)
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRecords,
        monthlyNewUsers,
        monthlyRecords,
        userTrend,
        recordTrend
      }
    });
  } catch (err) {
    console.error('获取仪表盘数据错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户列表
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page, pageSize, username, startDate, endDate } = req.query;

    const result = await Admin.getUsers({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      username,
      startDate,
      endDate
    });

    // 脱敏处理
    const users = result.users.map(user => ({
      ...user,
      username: maskUsername(user.username)
    }));

    res.json({ success: true, data: { ...result, users } });
  } catch (err) {
    console.error('获取用户列表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户详情
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await Admin.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const stats = await Admin.getUserStats(req.params.id);

    res.json({
      success: true,
      data: {
        ...user,
        username: maskUsername(user.username),
        stats
      }
    });
  } catch (err) {
    console.error('获取用户详情错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新用户状态
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态' });
    }

    const success = await Admin.updateUserStatus(req.params.id, status);
    if (!success) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, message: '状态更新成功' });
  } catch (err) {
    console.error('更新用户状态错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取记录列表
router.get('/records', adminAuth, async (req, res) => {
  try {
    const { page, pageSize, userId, type, categoryId, startDate, endDate } = req.query;

    const result = await Admin.getRecords({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      userId,
      type,
      categoryId,
      startDate,
      endDate
    });

    // 脱敏处理用户名
    const records = result.records.map(record => ({
      ...record,
      user_username: maskUsername(record.user_username)
    }));

    res.json({ success: true, data: { ...result, records } });
  } catch (err) {
    console.error('获取记录列表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取统计报表
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const [expenseRanking, incomeRanking, monthlyNewUsers, monthlyRecords, expenseRatio, incomeRatio] = await Promise.all([
      Admin.getExpenseRanking(10),
      Admin.getIncomeRanking(10),
      Admin.getMonthlyNewUsers(6),
      Admin.getMonthlyRecords(6),
      Admin.getCategoryRatio('expense'),
      Admin.getCategoryRatio('income')
    ]);

    res.json({
      success: true,
      data: {
        expenseRanking,
        incomeRanking,
        monthlyNewUsers,
        monthlyRecords,
        expenseRatio,
        incomeRatio
      }
    });
  } catch (err) {
    console.error('获取统计报表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 工具函数：脱敏用户名
function maskUsername(username) {
  if (!username) return '';
  if (username.length <= 2) return '**';
  return username.substring(0, 2) + '***';
}

module.exports = router;
module.exports.adminAuth = adminAuth;
