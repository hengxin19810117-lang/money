/**
 * Auth E2E Test - 认证端到端测试
 *
 * 测试目标: 模拟真实用户认证流程
 *
 * 测试场景:
 * 1. 用户注册 → 登录 → 登出
 * 2. 记住登录状态
 * 3. 错误输入处理
 */

const { test, expect } = require('@playwright/test');

test.describe('认证流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('完整登录登出流程', async ({ page }) => {
    // 填写登录表单
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // 点击登录
    await page.click('button[type="submit"]');

    // 验证跳转仪表盘
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=仪表盘')).toBeVisible();

    // 登出
    await page.click('text=退出登录');

    // 验证跳转登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test('登录失败显示错误提示', async ({ page }) => {
    // 填写错误的登录信息
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 点击登录
    await page.click('button[type="submit"]');

    // 等待错误提示出现
    await expect(page.locator('text=用户名或密码错误')).toBeVisible({ timeout: 5000 });
  });

  test('空表单提交验证', async ({ page }) => {
    // 直接点击登录 (不填写表单)
    await page.click('button[type="submit"]');

    // 验证错误提示
    await expect(page.locator('text=请输入用户名和密码')).toBeVisible();
  });

  test('注册新用户', async ({ page }) => {
    // 导航到注册页
    await page.click('text=立即注册');
    await expect(page).toHaveURL(/\/register/);

    // 填写注册表单
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `newuser_${timestamp}`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // 同意条款
    await page.check('input[type="checkbox"]');

    // 点击注册
    await page.click('button[type="submit"]');

    // 验证跳转仪表盘
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('密码不匹配验证', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=两次密码输入不一致')).toBeVisible();
  });
});
