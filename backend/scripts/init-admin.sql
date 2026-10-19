-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- 插入默认管理员账号 (密码: admin123)
-- 密码使用 bcrypt 加密
INSERT INTO admins (id, username, password) VALUES
('admin_1', 'admin', '$2a$10$5/XqJG2Z7Z9Y8vJvRj8FeOKqgYKj.q.Y3R0mH8aZM0sY5wXqJG2Ze')
ON DUPLICATE KEY UPDATE username = username;
