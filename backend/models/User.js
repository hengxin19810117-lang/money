const pool = require('../config/db');

class User {
  // 创建用户
  static async create({ username, password, nickname, email, phone }) {
    const [result] = await pool.execute(
      'INSERT INTO users (id, username, password, nickname, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [`user_${Date.now()}`, username, password, nickname, email, phone]
    );
    return result.insertId;
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // 根据ID查找用户
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, avatar, email, phone, created_at, last_login_at, status FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // 更新最后登录时间
  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
  }

  // 更新用户信息
  static async update(id, { nickname, avatar, email, phone }) {
    await pool.execute(
      'UPDATE users SET nickname = ?, avatar = ?, email = ?, phone = ? WHERE id = ?',
      [nickname, avatar, email, phone, id]
    );
  }

  // 更新密码
  static async updatePassword(id, password) {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [password, id]
    );
  }

  // 检查用户名是否存在
  static async exists(username) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [username]
    );
    return rows[0].count > 0;
  }
}

module.exports = User;
