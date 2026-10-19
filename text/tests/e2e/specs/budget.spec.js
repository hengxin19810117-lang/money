/**
 * Budget E2E Test - 预算管理端到端测试
 *
 * 测试目标: 模拟真实用户预算管理流程
 *
 * 测试场景:
 * 1. 设置月预算
 * 2. 设置分类预算
 * 3. 查看预算使用情况
 * 4. 预算超支提醒
 */

const { test, expect } = require('@playwright/test');

test.describe('预算管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('设置月总预算', async ({ page }) => {
    // 导航到设置
    await page.click('text=个人与设置');

    // 点击预算管理
    await page.click('text=预算设置');

    // 设置月预算
    await page.fill('input[name="monthlyBudget"]', '5000');

    // 保存
    await page.click('button:has-text("保存")');

    // 验证成功
    await expect(page.locator('text=预算设置成功')).toBeVisible();
  });

  test('设置分类预算', async ({ page }) => {
    await page.click('text=个人与设置');
    await page.click('text=预算设置');

    // 设置餐饮分类预算
    await page.fill('input[name="categoryBudget_餐饮"]', '1500');

    // 保存
    await page.click('button:has-text("保存")');

    await expect(page.locator('text=预算设置成功')).toBeVisible();
  });

  test('查看预算使用率', async ({ page }) => {
    // 添加消费记录
    await page.click('text=记一笔');
    await page.click('text=支出');
    await page.click('text=餐饮');
    await page.fill('input[name="amount"]', '100');
    await page.click('button:has-text("保存")');

    // 返回仪表盘查看预算使用情况
    await page.click('text=仪表盘');

    // 验证显示预算使用进度条
    await expect(page.locator('text=预算使用')).toBeVisible();
  });

  test('预算超支提醒', async ({ page }) => {
    // 设置一个较小的预算
    await page.click('text=个人与设置');
    await page.click('text=预算设置');
    await page.fill('input[name="monthlyBudget"]', '50');
    await page.click('button:has-text("保存")');

    // 添加超过预算的消费
    await page.click('text=记一笔');
    await page.click('text=支出');
    await page.click('text=餐饮');
    await page.fill('input[name="amount"]', '100'); // 超过50的预算
    await page.click('button:has-text("保存")');

    // 验证超支提醒
    await expect(page.locator(/超支|已达预算/)).toBeVisible({ timeout: 3000 });
  });
});
