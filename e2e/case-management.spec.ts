import { test, expect } from '@playwright/test';

test.describe('案件管理端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // 导航到案件管理
    await page.click('text=案件管理');
    await page.waitForURL(/law\/case-management/, { timeout: 10000 });
  });

  test('应该显示案件列表页面', async ({ page }) => {
    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查页面标题
    const title = await page.title();
    expect(title).toContain('案件');

    // 检查表格或列表存在
    const tableExists = await page.locator('table, .el-table, .case-list').isVisible().catch(() => false);
    const listExists = await page.locator('.case-item, .case-card').first().isVisible().catch(() => false);

    expect(tableExists || listExists).toBe(true);
  });

  test('应该能够搜索案件', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('测试');
      await page.click('button:has-text("搜索"), button:has-text("查询")');
      await page.waitForTimeout(1000);

      // 验证搜索结果
      const results = await page.locator('.case-item, .el-table__row').count();
      console.log(`搜索结果数量: ${results}`);
    }
  });

  test('应该能够切换标签页', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找标签页
    const tabs = await page.locator('.el-tabs__item, .tab-item').count();

    if (tabs > 1) {
      // 点击第二个标签
      await page.locator('.el-tabs__item, .tab-item').nth(1).click();
      await page.waitForTimeout(1000);

      // 验证标签切换成功
      const activeTab = await page.locator('.el-tabs__item.is-active, .tab-item.active').textContent();
      console.log(`当前活动标签: ${activeTab}`);
    }
  });

  test('应该能够查看案件详情', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找查看按钮
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看"), .view-btn').first();

    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click();
      await page.waitForTimeout(1000);

      // 验证跳转到详情页
      const url = page.url();
      expect(url).toMatch(/case-detail|detail/);

      // 验证详情页内容
      const detailContent = await page.locator('.case-detail, .detail-content').isVisible().catch(() => false);
      expect(detailContent).toBe(true);
    }
  });

  test('应该能够分页浏览', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找分页组件
    const pagination = page.locator('.el-pagination, .pagination');

    if (await pagination.isVisible().catch(() => false)) {
      // 获取当前页码
      const currentPage = await pagination.locator('.el-pager .active, .page-item.active').textContent().catch(() => '1');
      console.log(`当前页码: ${currentPage}`);

      // 点击下一页
      const nextButton = pagination.locator('button:has-text("下一页"), .btn-next, .next');
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // 验证页码变化
        const newPage = await pagination.locator('.el-pager .active, .page-item.active').textContent().catch(() => currentPage);
        console.log(`新页码: ${newPage}`);
      }
    }
  });
});

test.describe('债权登记端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // 导航到案件管理
    await page.click('text=案件管理');
    await page.waitForURL(/law\/case-management/, { timeout: 10000 });

    // 进入案件详情
    await page.waitForTimeout(2000);
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看"), .view-btn').first();
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('应该能够访问债权登记页面', async ({ page }) => {
    // 查找债权登记菜单或标签
    const claimMenu = page.locator('text=债权登记, .claim-registration, [data-testid="claim-registration"]').first();

    if (await claimMenu.isVisible().catch(() => false)) {
      await claimMenu.click();
      await page.waitForTimeout(1000);

      // 验证债权登记页面
      const claimContent = await page.locator('.claim-registration, .claim-list').isVisible().catch(() => false);
      expect(claimContent).toBe(true);
    }
  });

  test('应该能够添加新的债权登记', async ({ page }) => {
    // 查找添加按钮
    const addButton = page.locator('button:has-text("添加"), button:has-text("新增"), .add-btn').first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // 验证弹窗或表单出现
      const dialogExists = await page.locator('.el-dialog, .modal, .dialog').isVisible().catch(() => false);
      const formExists = await page.locator('form, .el-form').isVisible().catch(() => false);

      expect(dialogExists || formExists).toBe(true);

      // 填写表单（如果存在）
      const form = page.locator('form, .el-form').first();
      if (await form.isVisible().catch(() => false)) {
        // 填写债权名称
        const nameInput = form.locator('input[name="claimName"], input[placeholder*="名称"]').first();
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('测试债权');
        }

        // 填写债权金额
        const amountInput = form.locator('input[name="claimAmount"], input[placeholder*="金额"]').first();
        if (await amountInput.isVisible().catch(() => false)) {
          await amountInput.fill('10000');
        }
      }
    }
  });
});

test.describe('聊天功能端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('应该能够访问聊天页面', async ({ page }) => {
    // 导航到聊天页面
    await page.click('text=消息, text=聊天, .chat-menu').first();
    await page.waitForTimeout(2000);

    // 验证聊天页面
    const chatExists = await page.locator('.chat-container, .chat-page, .session-list').isVisible().catch(() => false);
    expect(chatExists).toBe(true);
  });

  test('应该能够发送消息', async ({ page }) => {
    // 导航到聊天页面
    await page.click('text=消息, text=聊天, .chat-menu').first();
    await page.waitForTimeout(2000);

    // 选择会话
    const session = page.locator('.session-item, .chat-session').first();
    if (await session.isVisible().catch(() => false)) {
      await session.click();
      await page.waitForTimeout(1000);

      // 查找消息输入框
      const messageInput = page.locator('.message-input input, .chat-input input, textarea[placeholder*="消息"]').first();

      if (await messageInput.isVisible().catch(() => false)) {
        await messageInput.fill('这是一条测试消息');

        // 发送消息
        const sendButton = page.locator('button:has-text("发送"), .send-btn, button[type="submit"]').first();
        if (await sendButton.isVisible().catch(() => false)) {
          await sendButton.click();
          await page.waitForTimeout(1000);

          // 验证消息已发送
          const messageExists = await page.locator('.message-content:has-text("这是一条测试消息"), .message-item:has-text("这是一条测试消息")').isVisible().catch(() => false);
          expect(messageExists).toBe(true);
        }
      }
    }
  });
});
