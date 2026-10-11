-- Finance Butler Java Database Init Script
-- Database: money_java

CREATE DATABASE IF NOT EXISTS money_java CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE money_java;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    status INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'expense or income',
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INT DEFAULT 0,
    is_system INT DEFAULT 0,
    user_id VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Records table
CREATE TABLE IF NOT EXISTS records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'expense or income',
    amount DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50),
    note VARCHAR(255),
    merchant VARCHAR(100),
    payment_channel VARCHAR(50),
    record_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_record_date (record_date),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment channels table
CREATE TABLE IF NOT EXISTS payment_channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INT DEFAULT 0,
    user_id VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly' COMMENT 'weekly, monthly, yearly',
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exports table
CREATE TABLE IF NOT EXISTS exports (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    export_type VARCHAR(20) NOT NULL COMMENT 'json, csv, excel',
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    record_count INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    login_status INT NOT NULL COMMENT '1: success, 0: failed',
    fail_reason VARCHAR(100),
    login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_login_at (login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert system categories (expense)
INSERT INTO categories (id, name, type, icon, color, sort_order, is_system) VALUES
('cat_dining', '餐饮', 'expense', 'restaurant', '#f8a5ab', 1, 1),
('cat_transit', '交通', 'expense', 'commute', '#ffc2d5', 2, 1),
('cat_shopping', '购物', 'expense', 'shopping_bag', '#ffd19a', 3, 1),
('cat_entertainment', '娱乐', 'expense', 'sports_esports', '#d4bfff', 4, 1),
('cat_health', '医疗', 'expense', 'local_hospital', '#a8d8ff', 5, 1),
('cat_education', '教育', 'expense', 'school', '#98ddca', 6, 1),
('cat_housing', '居住', 'expense', 'home', '#ffd93d', 7, 1),
('cat_other', '其他支出', 'expense', 'more_horiz', '#d0d8e4', 8, 1);

-- Insert system categories (income)
INSERT INTO categories (id, name, type, icon, color, sort_order, is_system) VALUES
('cat_salary', '工资', 'income', 'payments', '#2d8b74', 1, 1),
('cat_bonus', '奖金', 'income', 'card_giftcard', '#4ecdc4', 2, 1),
('cat_investment', '投资', 'income', 'trending_up', '#45b7d1', 3, 1),
('cat_gift', '礼金', 'income', 'card_giftcard', '#f7dc6f', 4, 1),
('cat_other_income', '其他收入', 'income', 'more_horiz', '#d0d8e4', 5, 1);

-- Insert payment channels
INSERT INTO payment_channels (id, name, icon, color, sort_order) VALUES
('pay_alipay', '支付宝', 'account_balance_wallet', '#1677ff', 1),
('pay_wechat', '微信支付', 'chat', '#07c160', 2),
('pay_cash', '现金', 'money', '#ffc107', 3),
('pay_bank', '银行卡', 'credit_card', '#722ed1', 4),
('pay_other', '其他', 'more_horiz', '#8c8c8c', 5);
