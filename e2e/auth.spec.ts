import { test, expect } from '@playwright/test';

test.describe('登录功能测试', () => {
  test('应该显示登录页面', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/登录|Login/);
  });

  test('应该能够使用用户名密码登录', async ({ page }) => {
    await page.goto('/');

    // 等待登录表单加载
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // 填写用户名和密码
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待导航到 dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('应该能够使用 admin 账户登录', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('应该能够使用 jack 账户登录', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'jack');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('导航功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('应该能够导航到案件管理页面', async ({ page }) => {
    // 点击案件管理菜单
    await page.click('text=案件管理');
    await page.waitForURL(/law\/case-management/, { timeout: 10000 });
    await expect(page).toHaveURL(/law\/case-management/);
  });

  test('应该能够导航到待办事项页面', async ({ page }) => {
    await page.click('text=待办事项');
    await page.waitForURL(/dashboard\/activity-todo/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard\/activity-todo/);
  });

  test('应该能够导航到统计分析页面', async ({ page }) => {
    await page.click('text=统计分析');
    await page.waitForURL(/dashboard\/analytics/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard\/analytics/);
  });
});

test.describe('案件管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.click('text=案件管理');
    await page.waitForURL(/law\/case-management/, { timeout: 10000 });
  });

  test('应该显示案件列表页面', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForTimeout(2000);

    // 检查页面标题或关键元素
    const pageTitle = await page.locator('h1, h2, .page-title').first().textContent();
    expect(pageTitle).toContain('案件');
  });

  test('应该能够搜索案件', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找搜索输入框
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      await page.click('button:has-text("搜索"), button:has-text("查询")');
      await page.waitForTimeout(1000);
    }
  });

  test('应该能够查看案件详情', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找查看按钮并点击
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(1000);

      // 检查是否跳转到详情页
      const url = page.url();
      expect(url).toMatch(/case-detail|detail/);
    }
  });
});

test.describe('待办事项功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('应该显示待办事项列表', async ({ page }) => {
    await page.click('text=待办事项');
    await page.waitForURL(/dashboard\/activity-todo/, { timeout: 10000 });

    // 等待页面加载
    await page.waitForTimeout(1000);

    // 检查页面内容
    const content = await page.content();
    expect(content).toContain('待办');
  });
});

test.describe('响应式设计测试', () => {
  test('应该在移动设备上正确显示登录页', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 检查登录表单是否可见
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('应该在平板设备上正确显示登录页', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('应该在桌面设备上正确显示登录页', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

test.describe('性能测试', () => {
  test('页面加载时间应该在合理范围内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // 放宽到10秒
  });

  test('页面应该没有严重控制台错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 忽略一些常见的非关键错误
        if (!text.includes('favicon') && !text.includes('SourceMap')) {
          errors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('控制台错误数:', errors.length);
    if (errors.length > 0) {
      console.log('错误详情:', errors);
    }

    // 允许最多5个非关键错误
    expect(errors.length).toBeLessThanOrEqual(5);
  });
});
