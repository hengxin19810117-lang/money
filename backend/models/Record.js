const pool = require('../config/db');

class Record {
  // 创建记账记录
  static async create({ userId, type, amount, categoryId, note, merchant, paymentChannel, recordDate }) {
    const [result] = await pool.query(
      `INSERT INTO records (id, user_id, type, amount, category_id, note, merchant, payment_channel, record_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`rec_${Date.now()}`, userId, type, amount, categoryId, note, merchant, paymentChannel, recordDate]
    );
    return result.insertId;
  }

  // 获取用户的记账记录（分页）
  static async findByUser(userId, { page = 1, pageSize = 20, type, categoryId, startDate, endDate } = {}) {
    let where = 'WHERE r.user_id = ?';
    const params = [userId];

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
      `SELECT COUNT(*) as total FROM records r ${where}`,
      params
    );
    const total = countResult[0].total;

    // 获取分页数据
    const offset = (page - 1) * pageSize;
    params.push(parseInt(pageSize), offset);

    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       ${where}
       ORDER BY r.record_date DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );

    return {
      records: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // 获取今日记账记录
  static async getToday(userId) {
    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.user_id = ? AND r.record_date = CURDATE()
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // 更新记账记录
  static async update(id, userId, { amount, categoryId, note, merchant, paymentChannel, recordDate }) {
    const [result] = await pool.query(
      `UPDATE records SET amount = ?, category_id = ?, note = ?, merchant = ?, payment_channel = ?, record_date = ?
       WHERE id = ? AND user_id = ?`,
      [amount, categoryId, note, merchant, paymentChannel, recordDate, id, userId]
    );
    return result.affectedRows > 0;
  }

  // 删除记账记录
  static async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM records WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  // 获取年度统计
  static async getYearlyStats(userId, year) {
    const [rows] = await pool.query(
      `SELECT
        type,
        MONTH(record_date) as month,
        SUM(amount) as total_amount,
        COUNT(*) as record_count
       FROM records
       WHERE user_id = ? AND YEAR(record_date) = ?
       GROUP BY type, MONTH(record_date)
       ORDER BY type, month`,
      [userId, year]
    );
    return rows;
  }

  // 获取月度统计
  static async getMonthlyStats(userId, year, month) {
    let startDate, endDate;

    if (month) {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    const [rows] = await pool.query(
      `SELECT
        r.type,
        r.category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        SUM(r.amount) as total_amount,
        COUNT(*) as record_count
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.user_id = ? AND r.record_date BETWEEN ? AND ?
       GROUP BY r.type, r.category_id, c.name, c.icon, c.color
       ORDER BY r.type, total_amount DESC`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  // 获取日度趋势
  static async getDailyTrend(userId, year, month, day) {
    let startDate, endDate;

    if (day) {
      startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      endDate = startDate;
    } else if (month) {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    const [rows] = await pool.query(
      `SELECT
        record_date,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
       FROM records
       WHERE user_id = ? AND record_date BETWEEN ? AND ?
       GROUP BY record_date
       ORDER BY record_date`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  // 获取指定日期范围的数据
  static async getByDateRange(userId, startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.user_id = ? AND r.record_date BETWEEN ? AND ?
       ORDER BY r.record_date DESC, r.created_at DESC`,
      [userId, startDate, endDate]
    );
    return rows;
  }
}

module.exports = Record;
