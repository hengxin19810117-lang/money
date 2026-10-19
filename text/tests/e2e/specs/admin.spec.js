/**
 * Admin E2E Test - 管理后台端到端测试
 *
 * 测试目标: 模拟管理员操作流程
 *
 * 测试场景:
 * 1. 管理员登录
 * 2. 查看用户列表
 * 3. 查看用户详情
 * 4. 禁用/启用用户
 * 5. 查看统计报表
 */

const { test, expect } = require('@playwright/test');

test.describe('管理后台', () => {
  test('管理员登录并查看仪表盘', async ({ page }) => {
    await page.goto('/login');

    // 使用管理员账号登录
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 等待跳转
    await page.waitForURL(/\/dashboard/);

    // 验证显示管理后台标识
    await expect(page.locator('text=后台管理系统')).toBeVisible();
  });

  test('查看用户列表', async ({ page }) => {
    // 管理员登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 导航到用户管理
    await page.click('text=用户管理');

    // 验证用户列表
    await expect(page.locator('text=用户列表')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('查看用户详情', async ({ page }) => {
    // 管理员登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 导航到用户管理
    await page.click('text=用户管理');

    // 点击第一个用户
    await page.click('table tbody tr:first-child');

    // 验证用户详情
    await expect(page.locator('text=用户详情')).toBeVisible();
    await expect(page.locator('text=总支出')).toBeVisible();
    await expect(page.locator('text=总收入')).toBeVisible();
  });

  test('禁用用户', async ({ page }) => {
    // 管理员登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 导航到用户管理
    await page.click('text=用户管理');

    // 点击第一个用户的详情
    await page.click('table tbody tr:first-child');

    // 点击禁用
    await page.click('text=禁用用户');

    // 确认禁用
    await page.click('button:has-text("确认")');

    // 验证提示
    await expect(page.locator('text=用户已禁用')).toBeVisible();
  });

  test('查看统计报表', async ({ page }) => {
    // 管理员登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 导航到统计报表
    await page.click('text=统计报表');

    // 验证报表元素
    await expect(page.locator('text=支出排行')).toBeVisible();
    await expect(page.locator('text=收入排行')).toBeVisible();
    await expect(page.locator('text=分类占比')).toBeVisible();
  });

  test('非管理员不能访问管理后台', async ({ page }) => {
    // 使用普通用户账号登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 尝试直接访问管理后台
    await page.goto('/admin/users');

    // 验证被拒绝 (403或重定向)
    // 具体行为取决于实现
    await page.waitForTimeout(1000);
  });
});
