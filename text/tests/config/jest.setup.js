// Jest 全局设置文件
// 作用: 配置测试环境、Mock第三方库、设置全局变量

// 设置测试超时时间
jest.setTimeout(10000);

// 全局Fetch Mock (用于API测试)
global.fetch = jest.fn();

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// 全局Console过滤 (可选，减少测试输出噪音)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn()
// };

// 测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.DB_NAME = 'money_test';

// 全局Teardown (每个测试文件执行后清理)
afterEach(() => {
  jest.clearAllMocks();
});

// 全局Error处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
