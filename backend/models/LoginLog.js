const pool = require('../config/db');

class LoginLog {
  // 创建登录日志
  static async create({ userId, ipAddress, userAgent, loginStatus, failReason }) {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [result] = await pool.execute(
      'INSERT INTO login_logs (id, user_id, ip_address, user_agent, login_status, fail_reason) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId || 'unknown', ipAddress || null, userAgent || null, loginStatus, failReason || null]
    );
    return result.insertId;
  }

  // 获取用户的登录日志
  static async findByUser(userId, { page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.execute(
      'SELECT * FROM login_logs WHERE user_id = ? ORDER BY login_at DESC LIMIT ? OFFSET ?',
      [userId, parseInt(pageSize), offset]
    );

    return rows;
  }
}

module.exports = LoginLog;
