// Jest Configuration - 后端单元测试配置
module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配规则
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/tests/security/**/*.test.js'
  ],

  // 忽略文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/fronted-react/',
    '/admin-panel/'
  ],

  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    // 后端源码覆盖率
    '../../backend/**/*.js',
    // 排除测试文件和配置
    '!**/node_modules/**',
    '!**/config/**',
    '!**/index.js'
  ],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['html', 'lcov', 'text', 'clover', 'json'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // 全局设置
  setupFilesAfterEnv: ['./config/jest.setup.js'],

  // 测试超时时间 (毫秒)
  testTimeout: 10000,

  // 转换规则 (处理ES6模块)
  transform: {},

  // 模块路径解析
  moduleDirectories: ['node_modules'],

  // 清晰输出
  verbose: true,

  // 报告格式
  coverageReportFormat: 'html',

  // 输出目录
  resultsOutputDirectory: 'reports/unit'
};
