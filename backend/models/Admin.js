const pool = require('../config/db');

class Admin {
  // 管理员登录验证
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // 更新最后登录时间
  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE admins SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
  }

  // 获取总用户数
  static async getTotalUsers() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  }

  // 获取总记录数
  static async getTotalRecords() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM records');
    return rows[0].count;
  }

  // 获取本月新增用户数
  static async getMonthlyNewUsers(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at BETWEEN ? AND ?',
      [startDate, endDate]
    );
    return rows[0].count;
  }

  // 获取本月记录数
  static async getMonthlyRecords(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM records WHERE record_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    return rows[0].count;
  }

  // 获取近7日新增用户趋势
  static async getUserTrend(days = 7) {
    const [rows] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days - 1]);
    return rows;
  }

  // 获取近7日记账趋势
  static async getRecordTrend(days = 7) {
    const [rows] = await pool.query(`
      SELECT DATE(record_date) as date, COUNT(*) as count
      FROM records
      WHERE record_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(record_date)
      ORDER BY date
    `, [days - 1]);
    return rows;
  }

  // 获取所有用户（分页）
  static async getUsers({ page = 1, pageSize = 20, username, startDate, endDate } = {}) {
    let where = '1=1';
    const params = [];

    if (username) {
      where += ' AND username LIKE ?';
      params.push(`%${username}%`);
    }
    if (startDate) {
      where += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      where += ' AND created_at <= ?';
      params.push(`${endDate} 23:59:59`);
    }

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users WHERE ${where}`,
      params
    );
    const total = countResult[0].total;

    // 获取分页数据
    const offset = (page - 1) * pageSize;
    params.push(parseInt(pageSize), offset);

    const [rows] = await pool.query(
      `SELECT id, username, nickname, avatar, created_at, last_login_at, status
       FROM users WHERE ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );

    return { users: rows, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  // 获取用户详情
  static async getUserById(userId) {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, avatar, created_at, last_login_at, status FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  }

  // 获取用户的记账统计
  static async getUserStats(userId) {
    const [expenseRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM records WHERE user_id = ? AND type = 'expense'`,
      [userId]
    );
    const [incomeRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM records WHERE user_id = ? AND type = 'income'`,
      [userId]
    );
    return {
      total_expense: parseFloat(expenseRows[0].total),
      expense_count: expenseRows[0].count,
      total_income: parseFloat(incomeRows[0].total),
      income_count: incomeRows[0].count
    };
  }

  // 获取所有记录（分页）
  static async getRecords({ page = 1, pageSize = 20, userId, type, categoryId, startDate, endDate } = {}) {
    let where = '1=1';
    const params = [];

    if (userId) {
      where += ' AND r.user_id = ?';
      params.push(userId);
    }
    if (type) {
      where += ' AND r.type = ?';
      params.push(type);
    }
    if (categoryId) {
      where += ' AND r.category_id = ?';
      params.push(categoryId);
    }
    if (startDate) {
      where += ' AND r.record_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      where += ' AND r.record_date <= ?';
      params.push(endDate);
    }

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM records r WHERE ${where}`,
      params
    );
    const total = countResult[0].total;

    // 获取分页数据
    const offset = (page - 1) * pageSize;
    params.push(parseInt(pageSize), offset);

    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
              u.username as user_username
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE ${where}
       ORDER BY r.record_date DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );

    return { records: rows, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  // 获取全局支出排名
  static async getExpenseRanking(limit = 10) {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.icon, c.color, SUM(r.amount) as total_amount, COUNT(*) as record_count
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.type = 'expense'
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total_amount DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // 获取全局收入排名
  static async getIncomeRanking(limit = 10) {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.icon, c.color, SUM(r.amount) as total_amount, COUNT(*) as record_count
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.type = 'income'
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total_amount DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // 获取月度新增用户
  static async getMonthlyNewUsers(months = 6) {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `, [months]);
    return rows;
  }

  // 获取月度记录数
  static async getMonthlyRecords(months = 6) {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(record_date, '%Y-%m') as month, COUNT(*) as count
      FROM records
      WHERE record_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(record_date, '%Y-%m')
      ORDER BY month
    `, [months]);
    return rows;
  }

  // 获取分类占比
  static async getCategoryRatio(type = 'expense') {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.icon, c.color, SUM(r.amount) as total_amount
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.type = ?
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total_amount DESC
    `, [type]);
    return rows;
  }

  // 禁用/启用用户
  static async updateUserStatus(userId, status) {
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Admin;
