const User = require('../models/User');
const { generateToken, hashPassword, comparePassword } = require('../middleware/auth');
const LoginLog = require('../models/LoginLog');

class AuthController {
  // 用户注册
  static async register(req, res) {
    try {
      const { username, password, nickname } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
      }

      // 验证用户名格式
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ success: false, message: '用户名需为3-20位字母或数字' });
      }

      // 验证密码长度
      if (password.length < 6 || password.length > 20) {
        return res.status(400).json({ success: false, message: '密码长度需在6-20位之间' });
      }

      // 检查用户名是否已存在
      if (await User.exists(username)) {
        return res.status(400).json({ success: false, message: '用户名已存在' });
      }

      // 哈希密码
      const hashedPassword = hashPassword(password);

      // 创建用户
      const userId = await User.create({
        username,
        password: hashedPassword,
        nickname: nickname || username
      });

      // 记录登录日志
      await LoginLog.create({
        userId: `user_${userId}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        loginStatus: 1
      });

      res.json({ success: true, message: '注册成功' });
    } catch (err) {
      console.error('注册错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 用户登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
      }

      // 查找用户
      const user = await User.findByUsername(username);
      if (!user) {
        // 记录失败日志
        await LoginLog.create({
          userId: 'unknown',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          loginStatus: 0,
          failReason: '用户不存在'
        });
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }

      // 验证密码
      if (!comparePassword(password, user.password)) {
        // 记录失败日志
        await LoginLog.create({
          userId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          loginStatus: 0,
          failReason: '密码错误'
        });
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }

      // 检查用户状态
      if (user.status !== 1) {
        return res.status(403).json({ success: false, message: '账号已被禁用' });
      }

      // 更新最后登录时间
      await User.updateLastLogin(user.id);

      // 记录成功日志
      await LoginLog.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        loginStatus: 1
      });

      // 生成Token
      const token = generateToken(user);

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar
          }
        }
      });
    } catch (err) {
      console.error('登录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      res.json({ success: true, data: user });
    } catch (err) {
      console.error('获取用户信息错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 更新用户信息
  static async updateProfile(req, res) {
    try {
      const { nickname, avatar, email, phone } = req.body;

      await User.update(req.userId, { nickname, avatar, email, phone });

      res.json({ success: true, message: '更新成功' });
    } catch (err) {
      console.error('更新用户信息错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
      }

      if (newPassword.length < 6 || newPassword.length > 20) {
        return res.status(400).json({ success: false, message: '新密码长度需在6-20位之间' });
      }

      const user = await User.findById(req.userId);
      if (!comparePassword(oldPassword, user.password)) {
        return res.status(400).json({ success: false, message: '原密码错误' });
      }

      await User.updatePassword(req.userId, hashPassword(newPassword));

      res.json({ success: true, message: '密码修改成功' });
    } catch (err) {
      console.error('修改密码错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
}

module.exports = AuthController;
