# 财务小管家 - 数据库设计

## 概述

本数据库用于财务小管家应用的持久化存储，支持多用户记账功能。

## 表结构

### 1. users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 用户ID (主键) |
| username | VARCHAR(50) | 用户名 (唯一) |
| password | VARCHAR(100) | 密码哈希 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | TEXT | 头像URL |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| last_login_at | DATETIME | 最后登录时间 |
| status | TINYINT | 状态 (0-禁用, 1-正常) |

### 2. categories - 分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 分类ID (主键) |
| name | VARCHAR(50) | 分类名称 |
| type | ENUM | 类型 (expense/income) |
| icon | VARCHAR(50) | 图标名称 |
| color | VARCHAR(20) | 颜色值 |
| sort_order | INT | 排序顺序 |
| is_system | TINYINT | 是否系统分类 |
| user_id | VARCHAR(50) | 所属用户 |

### 3. records - 记账记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 记录ID (主键) |
| user_id | VARCHAR(50) | 用户ID (外键) |
| type | ENUM | 类型 (expense/income) |
| amount | DECIMAL(12,2) | 金额 |
| category_id | VARCHAR(50) | 分类ID (外键) |
| note | VARCHAR(500) | 备注 |
| merchant | VARCHAR(100) | 商户 |
| payment_channel | VARCHAR(50) | 支付渠道 |
| record_date | DATE | 记账日期 |

### 4. budgets - 预算表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 预算ID (主键) |
| user_id | VARCHAR(50) | 用户ID (外键) |
| category_id | VARCHAR(50) | 分类ID (外键) |
| amount | DECIMAL(12,2) | 预算金额 |
| period_type | ENUM | 周期 (daily/weekly/monthly/yearly) |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |

### 5. payment_channels - 支付渠道表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 渠道ID (主键) |
| name | VARCHAR(50) | 渠道名称 |
| icon | VARCHAR(50) | 图标名称 |
| color | VARCHAR(20) | 颜色值 |
| sort_order | INT | 排序顺序 |
| user_id | VARCHAR(50) | 所属用户 |

### 6. exports - 数据导出记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 导出ID (主键) |
| user_id | VARCHAR(50) | 用户ID (外键) |
| export_type | ENUM | 导出类型 (json/csv/xlsx) |
| file_name | VARCHAR(200) | 文件名 |
| file_path | VARCHAR(500) | 文件路径 |
| file_size | BIGINT | 文件大小 |
| record_count | INT | 导出记录数 |
| date_from | DATE | 导出日期范围-开始 |
| date_to | DATE | 导出日期范围-结束 |

### 7. login_logs - 登录日志表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) | 日志ID (主键) |
| user_id | VARCHAR(50) | 用户ID (外键) |
| ip_address | VARCHAR(50) | IP地址 |
| user_agent | VARCHAR(500) | 浏览器UA |
| login_status | TINYINT | 登录状态 |
| fail_reason | VARCHAR(200) | 失败原因 |
| login_at | DATETIME | 登录时间 |

## 初始化

执行 SQL 脚本创建数据库和表：

```bash
mysql -u root -p < init.sql
```

或登录 MySQL 后执行：

```sql
source /path/to/database/init.sql
```

## 预置数据

初始化脚本会自动创建：
- 8 个支出分类（餐饮、交通、购物等）
- 5 个收入分类（工资、奖金、投资等）
- 5 个支付渠道（支付宝、微信、现金等）
- 1 个演示账号（demo / 123456）
