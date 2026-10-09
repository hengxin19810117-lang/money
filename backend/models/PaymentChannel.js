const pool = require('../config/db');

class PaymentChannel {
  // 获取所有系统支付渠道
  static async getSystemChannels() {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_channels WHERE user_id IS NULL ORDER BY sort_order'
    );
    return rows;
  }

  // 获取用户的支付渠道（包括系统渠道）
  static async getUserChannels(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_channels WHERE user_id IS NULL OR user_id = ? ORDER BY sort_order',
      [userId]
    );
    return rows;
  }

  // 创建自定义渠道
  static async create({ name, icon, color, userId }) {
    const [result] = await pool.execute(
      'INSERT INTO payment_channels (id, name, icon, color, user_id) VALUES (?, ?, ?, ?, ?)',
      [`pay_${Date.now()}`, name, icon, color, userId]
    );
    return result.insertId;
  }

  // 删除自定义渠道
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM payment_channels WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = PaymentChannel;
