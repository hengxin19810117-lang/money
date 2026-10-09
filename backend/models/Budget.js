const pool = require('../config/db');

class Budget {
  // 创建预算
  static async create({ userId, categoryId, amount, periodType, startDate, endDate }) {
    const [result] = await pool.execute(
      `INSERT INTO budgets (id, user_id, category_id, amount, period_type, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`bud_${Date.now()}`, userId, categoryId, amount, periodType, startDate, endDate]
    );
    return result.insertId;
  }

  // 获取用户的所有预算
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // 获取用户的预算使用情况
  static async getBudgetUsage(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT
        b.id as budget_id,
        b.amount as budget_amount,
        b.category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(SUM(r.amount), 0) as spent_amount
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN records r ON b.category_id = r.category_id
         AND r.user_id = b.user_id
         AND r.record_date BETWEEN ? AND ?
         AND r.type = 'expense'
       WHERE b.user_id = ? AND b.start_date <= ? AND (b.end_date IS NULL OR b.end_date >= ?)
       GROUP BY b.id, b.amount, b.category_id, c.name, c.icon, c.color`,
      [startDate, endDate, userId, endDate, startDate]
    );
    return rows;
  }

  // 更新预算
  static async update(id, userId, { amount, periodType, startDate, endDate }) {
    const [result] = await pool.execute(
      `UPDATE budgets SET amount = ?, period_type = ?, start_date = ?, end_date = ?
       WHERE id = ? AND user_id = ?`,
      [amount, periodType, startDate, endDate, id, userId]
    );
    return result.affectedRows > 0;
  }

  // 删除预算
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Budget;
