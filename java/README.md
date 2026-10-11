# 财务小管家 - Java API 服务

基于 Spring Boot + JPA + JWT 的财务管理系统后端 API

## 技术栈

- **Spring Boot 3.2.0** - Web 框架
- **Spring Data JPA** - 持久层框架
- **Spring Security** - 安全框架
- **JWT (jjwt 0.12.3)** - 身份认证
- **MySQL** - 数据库
- **Lombok** - 简化代码

## 项目结构

```
java/
├── src/main/java/com/finance/
│   ├── FinanceApplication.java     # 应用入口
│   ├── config/
│   │   └── SecurityConfig.java     # 安全配置
│   ├── controller/
│   │   ├── AuthController.java     # 认证接口
│   │   ├── RecordController.java   # 记账记录接口
│   │   └── HealthController.java   # 健康检查接口
│   ├── dto/
│   │   ├── ApiResponse.java        # 统一响应格式
│   │   ├── LoginRequest.java       # 登录请求
│   │   └── RegisterRequest.java    # 注册请求
│   ├── entity/
│   │   ├── User.java               # 用户实体
│   │   ├── Record.java             # 记账记录实体
│   │   └── Category.java           # 分类实体
│   ├── repository/
│   │   ├── UserRepository.java     # 用户数据访问
│   │   └── RecordRepository.java   # 记录数据访问
│   ├── security/
│   │   ├── JwtTokenProvider.java   # JWT 工具类
│   │   ├── JwtAuthenticationFilter.java  # JWT 过滤器
│   │   └── UserPrincipal.java      # 用户主体
│   └── service/
│       ├── AuthService.java        # 认证服务
│       └── RecordService.java      # 记账服务
├── src/main/resources/
│   └── application.yml             # 应用配置
└── pom.xml                         # Maven 配置
```

## API 接口

### 认证接口

| 方法 | 路径 | 说明 | 参数 |
|-----|------|------|------|
| POST | /api/auth/register | 用户注册 | username, password, nickname |
| POST | /api/auth/login | 用户登录 | username, password |
| GET | /api/auth/user | 获取当前用户 | Bearer Token |

### 记账接口

| 方法 | 路径 | 说明 | 参数 |
|-----|------|------|------|
| POST | /api/records | 创建记账记录 | type, amount, categoryId, recordDate... |
| GET | /api/records | 获取记账列表 | page, pageSize, type, startDate, endDate |
| GET | /api/records/today | 获取今日记录 | - |
| GET | /api/records/stats/monthly | 月度统计 | year, month (可选) |
| GET | /api/records/stats/daily | 日度趋势 | year, month (可选), day (可选) |
| DELETE | /api/records/{id} | 删除记录 | - |

### 健康检查

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/health | 服务健康检查 |

## 启动方式

### 1. 配置数据库

编辑 `src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/money
    username: root
    password: 123456
```

### 2. 运行项目

```bash
# 使用 Maven
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/finance-butler-1.0.0.jar
```

### 3. 验证服务

访问 http://localhost:8080/api/health

## 数据库说明

项目使用已有的 `money` 数据库，主要表结构：

- **users** - 用户表
- **records** - 记账记录表
- **categories** - 分类表（系统预设）
- **payment_channels** - 支付渠道表

JPA 的 `ddl-auto: update` 模式会自动管理表结构。

## 前端对接

前端可连接此 API：
- 开发环境：http://localhost:8080
- 需在请求头携带：`Authorization: Bearer <token>`

## 测试账号

| 用户名 | 密码 |
|-------|------|
| demo | 123456 |
| 3124000638 | free66LHY |
