const pool = require('../config/db');

class Category {
  // 获取所有系统分类
  static async getSystemCategories() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE is_system = 1 ORDER BY type, sort_order'
    );
    return rows;
  }

  // 获取用户的自定义分类
  static async getUserCategories(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY type, sort_order',
      [userId]
    );
    return rows;
  }

  // 按类型获取分类
  static async getByType(type, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE type = ? AND (user_id = ? OR user_id IS NULL) ORDER BY sort_order',
      [type, userId]
    );
    return rows;
  }

  // 创建自定义分类
  static async create({ name, type, icon, color, userId }) {
    const [result] = await pool.execute(
      'INSERT INTO categories (id, name, type, icon, color, user_id, is_system) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [`cat_${Date.now()}`, name, type, icon, color, userId]
    );
    return result.insertId;
  }

  // 删除自定义分类
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_system = 0',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Category;
