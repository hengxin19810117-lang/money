# 财务小管家 测试工程

## 目录结构

```
tests/
├── config/                 # 测试配置文件
│   ├── jest.config.js      # Jest配置 (后端单元测试)
│   ├── jest.setup.js       # Jest全局设置
│   └── playwright.config.js # Playwright配置 (E2E测试)
├── unit/                   # 单元测试
│   ├── backend/           # 后端单元测试
│   │   ├── models/        # 数据模型测试
│   │   │   ├── User.test.js
│   │   │   ├── Record.test.js
│   │   │   ├── Budget.test.js
│   │   │   └── Category.test.js
│   │   ├── middleware/    # 中间件测试
│   │   │   └── auth.test.js
│   │   └── controllers/   # 控制器测试
│   │       ├── auth.test.js
│   │       └── record.test.js
│   └── frontend/          # 前端单元测试
│       ├── context/       # React Context测试
│       │   └── AuthContext.test.jsx
│       ├── hooks/         # 自定义Hook测试
│       │   └── useAuth.test.js
│       └── pages/         # 页面组件测试
│           ├── LoginPage.test.jsx
│           └── DashboardPage.test.jsx
├── integration/           # 集成测试
│   ├── api/               # API端到端测试
│   │   ├── auth.test.js
│   │   ├── records.test.js
│   │   └── admin.test.js
│   └── database/          # 数据库集成测试
│       └── transactions.test.js
├── e2e/                   # 端到端测试 (Playwright)
│   ├── specs/
│   │   ├── auth.spec.js
│   │   ├── record.spec.js
│   │   ├── budget.spec.js
│   │   └── admin.spec.js
│   └── fixtures/
│       └── test-data.json
├── performance/           # 性能测试
│   ├── k6/
│   │   ├── login.test.js
│   │   ├── records.test.js
│   │   └── export.test.js
│   └── results/           # 测试结果输出
├── security/              # 安全测试
│   ├── sql-injection.test.js
│   ├── xss.test.js
│   └── auth-security.test.js
├── fixtures/              # 测试数据fixtures
│   ├── users.json
│   ├── categories.json
│   └── records.json
├── reports/               # 测试报告输出目录
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── performance/
│   └── security/
└── package.json           # 测试工程依赖
```

## 测试文件作用说明

| 文件/目录 | 作用 |
|----------|------|
| `config/jest.config.js` | Jest测试框架配置，定义测试环境、覆盖率阈值、文件匹配规则 |
| `config/jest.setup.js` | Jest全局设置，mock第三方库，设置测试超时时间 |
| `config/playwright.config.js` | Playwright配置，定义浏览器、视口、测试目录 |
| `unit/backend/models/*.test.js` | 测试后端数据模型的业务逻辑：密码哈希、字段验证、关联关系 |
| `unit/backend/middleware/auth.test.js` | 测试JWT认证中间件：Token生成、验证、过期处理 |
| `unit/backend/controllers/*.test.js` | 测试控制器业务逻辑：参数校验、错误处理、响应格式 |
| `unit/frontend/context/*.test.jsx` | 测试React Context：状态管理、数据流、副作用处理 |
| `unit/frontend/hooks/*.test.js` | 测试自定义Hook：状态逻辑、依赖处理、清理函数 |
| `unit/frontend/pages/*.test.jsx` | 测试页面组件：渲染、用户交互、API调用 |
| `integration/api/*.test.js` | API端到端测试：验证完整API调用链路 |
| `integration/database/*.test.js` | 数据库集成测试：事务、回滚、并发、性能 |
| `e2e/specs/*.spec.js` | Playwright E2E测试：模拟真实用户操作流程 |
| `performance/k6/*.test.js` | k6性能测试脚本：负载测试、压力测试、稳定性测试 |
| `security/*.test.js` | 安全测试：SQL注入、XSS、CSRF、越权访问 |
| `fixtures/*.json` | 测试数据模板：用户、分类、记录数据 |
| `reports/` | 测试报告输出目录：Jest覆盖率报告、Playwright HTML报告 |

## 快速开始

```bash
# 安装依赖
cd tests
npm install

# 运行所有单元测试
npm run test:unit

# 运行所有集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e

# 运行性能测试
npm run test:performance

# 运行安全测试
npm run test:security

# 生成完整测试报告
npm run test:all

# 查看测试报告
npm run report
```

## 测试报告输出

| 报告类型 | 输出位置 | 格式 |
|---------|---------|------|
| 单元测试报告 | `reports/unit/` | HTML, JSON, LCov |
| 集成测试报告 | `reports/integration/` | HTML, JSON |
| E2E测试报告 | `reports/e2e/` | HTML, Screenshots |
| 性能测试报告 | `reports/performance/` | JSON, HTML |
| 安全测试报告 | `reports/security/` | JSON, HTML |

## 注意事项

1. **不影响业务代码** - 所有测试文件独立于 `backend/` 和 `fronted-react/` 目录
2. **隔离测试环境** - 使用独立的测试数据库 `money_test`
3. **测试数据** - 使用 `fixtures/` 中的测试数据，不使用生产数据
4. **并行执行** - 支持 `npm run test:unit -- --parallel` 并行执行加速
5. **覆盖率要求** - 后端80%+，前端70%+
