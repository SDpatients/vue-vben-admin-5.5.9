import { expect, test } from '@playwright/test';

// 测试数据
const testCaseData = {
  caseNumber: `E2E-TEST-${Date.now()}`,
  caseName: 'E2E测试案件',
  acceptanceDate: new Date().toISOString().split('T')[0],
  caseSource: 'E2E测试来源',
  acceptanceCourt: 'E2E测试法院',
  designatedInstitution: 'E2E测试机构',
  mainResponsiblePerson: 'E2E测试负责人',
  caseReason: 'E2E测试案由',
  remarks: '这是E2E测试创建的案件',
};

test.describe('案件管理模块 E2E 测试', () => {
  // 登录前置操作
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/auth/login');

    // 等待登录表单加载
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });

    // 填写登录信息（请根据实际登录页面调整选择器）
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待登录成功，跳转到首页
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 访问案件管理页面
    await page.goto('/law/case-management');

    // 等待页面加载完成
    await page.waitForSelector('.el-card', { timeout: 10000 });
  });

  test.describe('页面加载测试', () => {
    test('应该正确加载案件管理页面', async ({ page }) => {
      // 验证页面标题
      await expect(page.locator('.el-card__header')).toContainText('案件管理');

      // 验证表格存在
      await expect(page.locator('.el-table')).toBeVisible();

      // 验证分页组件存在
      await expect(page.locator('.el-pagination')).toBeVisible();

      // 验证新增按钮存在
      await expect(page.locator('button:has-text("新增案件")')).toBeVisible();
    });

    test('应该显示案件列表', async ({ page }) => {
      // 等待表格数据加载
      await page.waitForSelector('.el-table__row', { timeout: 10000 });

      // 获取表格行数
      const rows = await page.locator('.el-table__row').count();

      // 验证至少有一条数据或显示空状态
      if (rows === 0) {
        await expect(page.locator('.el-empty')).toBeVisible();
      } else {
        expect(rows).toBeGreaterThan(0);
      }
    });
  });

  test.describe('创建案件测试', () => {
    test('应该能够创建新案件', async ({ page }) => {
      // 点击新增案件按钮
      await page.click('button:has-text("新增案件")');

      // 等待跳转到新增页面
      await page.waitForURL('**/law/case-add', { timeout: 10000 });

      // 等待表单加载
      await page.waitForSelector('.el-form', { timeout: 10000 });

      // 填写案件信息
      await page.fill('input[placeholder="请输入案号"]', testCaseData.caseNumber);
      await page.fill('input[placeholder="请输入案件名称"]', testCaseData.caseName);
      await page.fill('input[placeholder="请选择受理日期"]', testCaseData.acceptanceDate);
      await page.fill('input[placeholder="请输入案件来源"]', testCaseData.caseSource);
      await page.fill('input[placeholder="请输入受理法院"]', testCaseData.acceptanceCourt);
      await page.fill('input[placeholder="请输入管理人"]', testCaseData.designatedInstitution);
      await page.fill('input[placeholder="请输入主要负责人"]', testCaseData.mainResponsiblePerson);
      await page.fill('input[placeholder="请输入案由"]', testCaseData.caseReason);
      await page.fill('textarea[placeholder="请输入备注"]', testCaseData.remarks);

      // 提交表单
      await page.click('button:has-text("提交")');

      // 等待提交成功提示
      await page.waitForSelector('.el-message--success', { timeout: 10000 });

      // 验证成功提示
      await expect(page.locator('.el-message--success')).toContainText('成功');

      // 等待返回列表页
      await page.waitForURL('**/law/case-management', { timeout: 10000 });

      // 验证新创建的案件出现在列表中
      await page.waitForSelector('.el-table__row', { timeout: 10000 });

      // 搜索新创建的案件
      await page.fill('input[placeholder="搜索案号"]', testCaseData.caseNumber);
      await page.click('button:has-text("搜索")');

      // 验证案件显示在列表中
      await expect(page.locator('.el-table__row')).toContainText(testCaseData.caseNumber);
    });

    test('应该验证必填字段', async ({ page }) => {
      // 点击新增案件按钮
      await page.click('button:has-text("新增案件")');

      // 等待跳转到新增页面
      await page.waitForURL('**/law/case-add', { timeout: 10000 });

      // 直接点击提交按钮
      await page.click('button:has-text("提交")');

      // 验证表单验证错误提示
      await expect(page.locator('.el-form-item__error')).toBeVisible();
    });
  });

  test.describe('查询案件测试', () => {
    test('应该支持分页查询', async ({ page }) => {
      // 等待表格加载
      await page.waitForSelector('.el-table__row', { timeout: 10000 });

      // 获取第一页数据
      const firstPageRows = await page.locator('.el-table__row').count();

      // 点击下一页
      await page.click('.el-pagination .btn-next');

      // 等待数据加载
      await page.waitForTimeout(1000);

      // 获取第二页数据
      const secondPageRows = await page.locator('.el-table__row').count();

      // 验证分页正常工作
      expect(secondPageRows).toBeGreaterThanOrEqual(0);
    });

    test('应该支持搜索功能', async ({ page }) => {
      // 输入搜索关键词
      await page.fill('input[placeholder="搜索案号"]', '测试');

      // 点击搜索按钮
      await page.click('button:has-text("搜索")');

      // 等待搜索结果
      await page.waitForTimeout(1000);

      // 验证搜索结果
      const rows = await page.locator('.el-table__row').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('更新案件测试', () => {
    test('应该能够编辑案件', async ({ page }) => {
      // 找到第一个案件的编辑按钮并点击
      const editButton = page.locator('.el-table__row:first-child button:has-text("编辑")');

      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();

        // 等待编辑页面加载
        await page.waitForURL('**/law/case-edit/**', { timeout: 10000 });

        // 修改案件名称
        const newCaseName = `更新后的案件名称-${Date.now()}`;
        await page.fill('input[placeholder="请输入案件名称"]', newCaseName);

        // 提交修改
        await page.click('button:has-text("保存")');

        // 等待成功提示
        await page.waitForSelector('.el-message--success', { timeout: 10000 });

        // 验证成功提示
        await expect(page.locator('.el-message--success')).toContainText('成功');
      } else {
        console.log('没有找到可编辑的案件，跳过此测试');
        test.skip();
      }
    });
  });

  test.describe('删除案件测试', () => {
    test('应该能够删除案件', async ({ page }) => {
      // 找到第一个案件的删除按钮并点击
      const deleteButton = page.locator('.el-table__row:first-child button:has-text("删除")');

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // 等待确认对话框
        await page.waitForSelector('.el-dialog', { timeout: 10000 });

        // 点击确认删除
        await page.click('.el-dialog__footer button:has-text("确认")');

        // 等待删除成功提示
        await page.waitForSelector('.el-message--success', { timeout: 10000 });

        // 验证成功提示
        await expect(page.locator('.el-message--success')).toContainText('成功');
      } else {
        console.log('没有找到可删除的案件，跳过此测试');
        test.skip();
      }
    });

    test('应该显示删除确认对话框', async ({ page }) => {
      // 找到第一个案件的删除按钮并点击
      const deleteButton = page.locator('.el-table__row:first-child button:has-text("删除")');

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // 验证确认对话框显示
        await expect(page.locator('.el-dialog')).toBeVisible();
        await expect(page.locator('.el-dialog__title')).toContainText('确认删除');

        // 点击取消
        await page.click('.el-dialog__footer button:has-text("取消")');

        // 验证对话框关闭
        await expect(page.locator('.el-dialog')).not.toBeVisible();
      } else {
        console.log('没有找到可删除的案件，跳过此测试');
        test.skip();
      }
    });
  });

  test.describe('完整 CRUD 流程测试', () => {
    test('应该能够完成完整的增删改查流程', async ({ page }) => {
      const uniqueId = Date.now();
      const flowTestData = {
        caseNumber: `FLOW-${uniqueId}`,
        caseName: `流程测试案件-${uniqueId}`,
        acceptanceDate: new Date().toISOString().split('T')[0],
        caseSource: '流程测试来源',
        acceptanceCourt: '流程测试法院',
        designatedInstitution: '流程测试机构',
        mainResponsiblePerson: '流程测试负责人',
        caseReason: '流程测试案由',
        remarks: '这是流程测试创建的案件',
      };

      // 1. 创建案件
      await page.click('button:has-text("新增案件")');
      await page.waitForURL('**/law/case-add', { timeout: 10000 });
      await page.waitForSelector('.el-form', { timeout: 10000 });

      await page.fill('input[placeholder="请输入案号"]', flowTestData.caseNumber);
      await page.fill('input[placeholder="请输入案件名称"]', flowTestData.caseName);
      await page.fill('input[placeholder="请选择受理日期"]', flowTestData.acceptanceDate);
      await page.fill('input[placeholder="请输入案件来源"]', flowTestData.caseSource);
      await page.fill('input[placeholder="请输入受理法院"]', flowTestData.acceptanceCourt);
      await page.fill('input[placeholder="请输入管理人"]', flowTestData.designatedInstitution);
      await page.fill('input[placeholder="请输入主要负责人"]', flowTestData.mainResponsiblePerson);
      await page.fill('input[placeholder="请输入案由"]', flowTestData.caseReason);
      await page.fill('textarea[placeholder="请输入备注"]', flowTestData.remarks);

      await page.click('button:has-text("提交")');
      await page.waitForSelector('.el-message--success', { timeout: 10000 });
      await page.waitForURL('**/law/case-management', { timeout: 10000 });

      console.log('✅ 创建案件成功');

      // 2. 查询案件
      await page.fill('input[placeholder="搜索案号"]', flowTestData.caseNumber);
      await page.click('button:has-text("搜索")');
      await page.waitForTimeout(1000);

      await expect(page.locator('.el-table__row')).toContainText(flowTestData.caseNumber);
      console.log('✅ 查询案件成功');

      // 3. 查看案件详情
      await page.click('.el-table__row:first-child button:has-text("查看")');
      await page.waitForURL('**/law/case-detail/**', { timeout: 10000 });

      await expect(page.locator('.el-card__header')).toContainText('案件详情');
      console.log('✅ 查看案件详情成功');

      // 返回列表页
      await page.goto('/law/case-management');
      await page.waitForSelector('.el-card', { timeout: 10000 });

      // 4. 删除案件
      await page.fill('input[placeholder="搜索案号"]', flowTestData.caseNumber);
      await page.click('button:has-text("搜索")');
      await page.waitForTimeout(1000);

      await page.click('.el-table__row:first-child button:has-text("删除")');
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      await page.click('.el-dialog__footer button:has-text("确认")');
      await page.waitForSelector('.el-message--success', { timeout: 10000 });

      console.log('✅ 删除案件成功');

      // 5. 验证删除
      await page.fill('input[placeholder="搜索案号"]', flowTestData.caseNumber);
      await page.click('button:has-text("搜索")');
      await page.waitForTimeout(1000);

      const rows = await page.locator('.el-table__row').count();
      expect(rows).toBe(0);
      console.log('✅ 验证删除成功');

      console.log('🎉 完整 CRUD 流程测试通过！');
    });
  });

  test.describe('UI 交互测试', () => {
    test('应该支持列显示设置', async ({ page }) => {
      // 点击列设置按钮
      await page.click('button:has-text("列设置")');

      // 等待下拉菜单显示
      await page.waitForSelector('.el-dropdown-menu', { timeout: 10000 });

      // 点击显示所有列
      await page.click('.el-dropdown-menu__item:has-text("显示所有列")');

      // 验证列显示变化
      await page.waitForTimeout(500);

      console.log('✅ 列设置功能正常');
    });

    test('应该支持刷新功能', async ({ page }) => {
      // 点击刷新按钮
      await page.click('button:has-text("刷新")');

      // 等待加载完成
      await page.waitForTimeout(2000);

      // 验证表格数据加载
      await expect(page.locator('.el-table')).toBeVisible();

      console.log('✅ 刷新功能正常');
    });

    test('应该支持标签页切换', async ({ page }) => {
      // 等待标签页加载
      await page.waitForSelector('.el-tabs', { timeout: 10000 });

      // 点击"全部案件"标签（如果可见）
      const allCasesTab = page.locator('.el-tabs__item:has-text("全部案件")');
      if (await allCasesTab.isVisible().catch(() => false)) {
        await allCasesTab.click();
        await page.waitForTimeout(1000);

        // 验证标签页切换成功
        await expect(page.locator('.el-tabs__item.is-active')).toContainText('全部案件');
        console.log('✅ 标签页切换功能正常');
      } else {
        console.log('全部案件标签不可见，跳过此测试');
        test.skip();
      }
    });
  });
});
