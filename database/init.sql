-- ================================================
-- 财务小管家数据库初始化脚本
-- 版本: 1.0.0
-- 创建时间: 2024-10-09
-- ================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `money`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `money`;

-- ================================================
-- 0. 删除所有表（按外键依赖顺序）
-- ================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `login_logs`;
DROP TABLE IF EXISTS `exports`;
DROP TABLE IF EXISTS `records`;
DROP TABLE IF EXISTS `budgets`;
DROP TABLE IF EXISTS `payment_channels`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 1. 用户表 (users)
-- ================================================
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` TEXT DEFAULT NULL COMMENT '头像URL(base64或网络URL)',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ================================================
-- 2. 分类表 (categories)
-- ================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `type` ENUM('expense', 'income') NOT NULL COMMENT '类型: expense-支出, income-收入',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '颜色值',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `is_system` TINYINT DEFAULT 0 COMMENT '是否系统分类: 0-自定义, 1-系统预置',
  `user_id` VARCHAR(50) DEFAULT NULL COMMENT '所属用户(系统分类为NULL)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ================================================
-- 3. 记账记录表 (records)
-- ================================================
DROP TABLE IF EXISTS `records`;
CREATE TABLE `records` (
  `id` VARCHAR(50) NOT NULL COMMENT '记录ID',
  `user_id` VARCHAR(50) NOT NULL COMMENT '用户ID',
  `type` ENUM('expense', 'income') NOT NULL COMMENT '类型: expense-支出, income-收入',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额',
  `category_id` VARCHAR(50) NOT NULL COMMENT '分类ID',
  `note` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `merchant` VARCHAR(100) DEFAULT NULL COMMENT '商户/商家',
  `payment_channel` VARCHAR(50) DEFAULT NULL COMMENT '支付渠道',
  `record_date` DATE NOT NULL COMMENT '记账日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_record_date` (`record_date`),
  KEY `idx_user_date` (`user_id`, `record_date`),
  CONSTRAINT `fk_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_records_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='记账记录表';

-- ================================================
-- 4. 预算表 (budgets)
-- ================================================
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
  `id` VARCHAR(50) NOT NULL COMMENT '预算ID',
  `user_id` VARCHAR(50) NOT NULL COMMENT '用户ID',
  `category_id` VARCHAR(50) DEFAULT NULL COMMENT '分类ID(NULL表示总预算)',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '预算金额',
  `period_type` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly' COMMENT '预算周期',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_period` (`period_type`),
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_budgets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算表';

-- ================================================
-- 5. 支付渠道表 (payment_channels)
-- ================================================
DROP TABLE IF EXISTS `payment_channels`;
CREATE TABLE `payment_channels` (
  `id` VARCHAR(50) NOT NULL COMMENT '渠道ID',
  `name` VARCHAR(50) NOT NULL COMMENT '渠道名称',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '颜色值',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `user_id` VARCHAR(50) DEFAULT NULL COMMENT '所属用户(NULL表示通用)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付渠道表';

-- ================================================
-- 6. 数据导出记录表 (exports)
-- ================================================
DROP TABLE IF EXISTS `exports`;
CREATE TABLE `exports` (
  `id` VARCHAR(50) NOT NULL COMMENT '导出ID',
  `user_id` VARCHAR(50) NOT NULL COMMENT '用户ID',
  `export_type` ENUM('json', 'csv', 'xlsx') NOT NULL COMMENT '导出类型',
  `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
  `file_path` VARCHAR(500) DEFAULT NULL COMMENT '文件路径',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
  `record_count` INT DEFAULT 0 COMMENT '导出记录数',
  `date_from` DATE DEFAULT NULL COMMENT '导出日期范围-开始',
  `date_to` DATE DEFAULT NULL COMMENT '导出日期范围-结束',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '导出时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据导出记录表';

-- ================================================
-- 7. 登录日志表 (login_logs)
-- ================================================
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` VARCHAR(50) NOT NULL COMMENT '日志ID',
  `user_id` VARCHAR(50) NOT NULL COMMENT '用户ID',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器UA',
  `login_status` TINYINT NOT NULL COMMENT '登录状态: 0-失败, 1-成功',
  `fail_reason` VARCHAR(200) DEFAULT NULL COMMENT '失败原因',
  `login_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_login_at` (`login_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ================================================
-- 初始化系统预置数据
-- ================================================

-- 插入系统预置支出分类
INSERT INTO `categories` (`id`, `name`, `type`, `icon`, `color`, `sort_order`, `is_system`) VALUES
('cat_dining', '餐饮', 'expense', 'restaurant', '#f8a5ab', 1, 1),
('cat_transit', '交通', 'expense', 'commute', '#ffc2d5', 2, 1),
('cat_shopping', '购物', 'expense', 'shopping_bag', '#ffd19a', 3, 1),
('cat_entertainment', '娱乐', 'expense', 'sports_esports', '#c5a3ff', 4, 1),
('cat_health', '医疗', 'expense', 'medical_services', '#ff9a9a', 5, 1),
('cat_education', '教育', 'expense', 'school', '#9ad0f5', 6, 1),
('cat_housing', '居住', 'expense', 'home', '#a8d8b9', 7, 1),
('cat_other_expense', '其他', 'expense', 'more_horiz', '#d0d8e4', 8, 1);

-- 插入系统预置收入分类
INSERT INTO `categories` (`id`, `name`, `type`, `icon`, `color`, `sort_order`, `is_system`) VALUES
('cat_salary', '工资', 'income', 'payments', '#6fcfb8', 1, 1),
('cat_bonus', '奖金', 'income', 'card_giftcard', '#98ddca', 2, 1),
('cat_investment', '投资', 'income', 'trending_up', '#b8f0e0', 3, 1),
('cat_gift_income', '礼金', 'income', 'volunteer_activism', '#d4f4e8', 4, 1),
('cat_other_income', '其他', 'income', 'more_horiz', '#e0e8f0', 5, 1);

-- 插入系统预置支付渠道
INSERT INTO `payment_channels` (`id`, `name`, `icon`, `color`, `sort_order`, `user_id`) VALUES
('pay_alipay', '支付宝', 'account_balance_wallet', '#1677ff', 1, NULL),
('pay_wechat', '微信', 'chat', '#07c160', 2, NULL),
('pay_cash', '现金', 'money', '#ffc107', 3, NULL),
('pay_bank', '银行卡', 'credit_card', '#722ed1', 4, NULL),
('pay_other', '其他', 'more_horiz', '#8c8c8c', 5, NULL);

-- 插入演示账号
INSERT INTO `users` (`id`, `username`, `password`, `nickname`, `status`) VALUES
('user_demo', 'demo', 'hash_2021320', '演示用户', 1);

SELECT '数据库初始化完成!' AS message;
