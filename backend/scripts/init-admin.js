const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function initAdmin() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'money',
  });

  try {
    // 创建 admins 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME
      )
    `);
    console.log('✓ admins 表创建成功');

    // 生成密码哈希
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('✓ 密码哈希生成成功');

    // 插入管理员账号
    const adminId = 'admin_' + Date.now();
    await pool.query(
      'INSERT INTO admins (id, username, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      [adminId, 'admin', hash, hash]
    );
    console.log('✓ 管理员账号创建成功');
    console.log('  用户名: admin');
    console.log('  密码: admin123');

  } catch (err) {
    console.error('初始化失败:', err.message);
  } finally {
    await pool.end();
  }
}

initAdmin();
