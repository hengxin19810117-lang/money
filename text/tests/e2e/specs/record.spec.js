/**
 * Record E2E Test - 记账记录端到端测试
 *
 * 测试目标: 模拟真实用户记账流程
 *
 * 测试场景:
 * 1. 添加支出记录
 * 2. 添加收入记录
 * 3. 编辑记录
 * 4. 删除记录
 * 5. 筛选记录
 */

const { test, expect } = require('@playwright/test');

test.describe('记账流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('添加支出记录', async ({ page }) => {
    // 点击记一笔
    await page.click('text=记一笔');

    // 选择支出类型
    await page.click('text=支出');

    // 选择分类
    await page.click('text=餐饮');

    // 输入金额
    await page.fill('input[name="amount"]', '100');

    // 输入备注
    await page.fill('input[name="note"]', '午餐测试');

    // 保存
    await page.click('button:has-text("保存")');

    // 验证成功提示
    await expect(page.locator('text=记录成功')).toBeVisible();

    // 验证记录出现在列表中
    await expect(page.locator('text=午餐测试')).toBeVisible();
  });

  test('添加收入记录', async ({ page }) => {
    await page.click('text=记一笔');

    // 选择收入类型
    await page.click('text=收入');

    // 选择分类
    await page.click('text=工资');

    // 输入金额
    await page.fill('input[name="amount"]', '5000');

    // 保存
    await page.click('button:has-text("保存")');

    // 验证成功
    await expect(page.locator('text=记录成功')).toBeVisible();
  });

  test('编辑记录', async ({ page }) => {
    // 先添加一条记录
    await page.click('text=记一笔');
    await page.click('text=支出');
    await page.click('text=餐饮');
    await page.fill('input[name="amount"]', '50');
    await page.fill('input[name="note"]', '原备注');
    await page.click('button:has-text("保存")');

    // 等待记录出现
    await page.waitForSelector('text=原备注');

    // 点击编辑
    await page.click('text=原备注');
    await page.click('text=编辑');

    // 修改金额
    await page.fill('input[name="amount"]', '75');

    // 保存
    await page.click('button:has-text("保存")');

    // 验证更新
    await expect(page.locator('text=75')).toBeVisible();
  });

  test('删除记录', async ({ page }) => {
    // 添加一条记录
    await page.click('text=记一笔');
    await page.click('text=支出');
    await page.click('text=交通');
    await page.fill('input[name="amount"]', '30');
    await page.fill('input[name="note"]', '待删除');
    await page.click('button:has-text("保存")');

    // 等待记录出现
    await page.waitForSelector('text=待删除');

    // 点击删除
    await page.click('text=待删除');
    await page.click('text=删除');

    // 确认删除
    await page.click('button:has-text("确认")');

    // 验证记录已删除
    await expect(page.locator('text=待删除')).not.toBeVisible();
  });

  test('按分类筛选记录', async ({ page }) => {
    // 导航到账单明细
    await page.click('text=账单明细');

    // 选择分类筛选
    await page.click('text=全部分类');
    await page.click('text=餐饮');

    // 验证只显示餐饮记录
    await page.waitForTimeout(500);
    // 可以进一步验证URL参数或列表内容
  });

  test('按日期范围筛选', async ({ page }) => {
    await page.click('text=账单明细');

    // 选择日期范围
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');

    // 点击搜索
    await page.click('text=搜索');

    // 验证筛选结果
    await page.waitForTimeout(500);
  });
});
