// Playwright Configuration - E2E测试配置
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // 测试目录
  testDir: './e2e/specs',

  // 完全隔离每个测试
  fullyParallel: true,

  // 失败时重新运行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // 并行workers
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html' }],
    ['json', { outputFile: 'reports/e2e/results.json' }],
    ['list']
  ],

  // 全局超时
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // 全局预配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',

    // 跟踪依赖
    trace: 'on-first-retry',

    // 截图
    screenshot: 'only-on-failure',

    // 视频
    video: 'retain-on-failure'
  },

  // 浏览器配置
  projects: [
    // Chromium (主要测试浏览器)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    // Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    // Webkit (Safari)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // 移动端Chrome
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },

    // 移动端Safari
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  // 输出目录
  outputDir: 'reports/e2e/artifacts',

  // Web服务器配置 (如果需要自动启动)
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
});
