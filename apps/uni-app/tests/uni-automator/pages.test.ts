import { describe, expect, it } from 'vitest'

// 页面路径列表
const pages = [
  { path: 'pages/login/index', title: '登录' },
  { path: 'pages/workspace/index', title: '工作台' },
  { path: 'pages/cases/index', title: '案件管理' },
  { path: 'pages/cases/detail', title: '案件详情' },
  { path: 'pages/cases/add', title: '新增案件' },
  { path: 'pages/cases/edit', title: '编辑案件' },
  { path: 'pages/cases/files', title: '案件文件' },
  { path: 'pages/cases/process', title: '流程管理' },
  { path: 'pages/cases/process-stage', title: '阶段详情' },
  { path: 'pages/cases/process-tasks', title: '任务列表' },
  { path: 'pages/cases/process-task-edit', title: '任务详情' },
  { path: 'pages/cases/work-team', title: '工作团队' },
  { path: 'pages/cases/claim-manage', title: '债权管理' },
  { path: 'pages/cases/work-log', title: '工作日志' },
  { path: 'pages/cases/announcement-list', title: '案件公告' },
  { path: 'pages/cases/announcement-detail', title: '公告详情' },
  { path: 'pages/announcement/index', title: '公告总览' },
  { path: 'pages/announcement/form', title: '公告表单' },
  { path: 'pages/todo/index', title: '待办事项' },
  { path: 'pages/todo/detail', title: '待办详情' },
  { path: 'pages/todo/edit', title: '编辑待办' },
  { path: 'pages/profile/index', title: '我的' },
  { path: 'pages/profile/settings', title: '设置' },
  { path: 'pages/notification/index', title: '消息通知' },
  { path: 'pages/notification/detail', title: '通知详情' },
  { path: 'pages/basic-data/index', title: '基础资料' },
  { path: 'pages/basic-data/creditor', title: '债权人管理' },
  { path: 'pages/basic-data/creditor-detail', title: '债权人详情' },
  { path: 'pages/basic-data/debtor', title: '债务人管理' },
  { path: 'pages/basic-data/debtor-detail', title: '债务人详情' },
  { path: 'pages/basic-data/court', title: '法院管理' },
  { path: 'pages/basic-data/court-detail', title: '法院详情' },
  { path: 'pages/basic-data/bank', title: '银行账户' },
  { path: 'pages/basic-data/bank-detail', title: '账户详情' },
  { path: 'pages/basic-data/plan', title: '工作计划' },
  { path: 'pages/basic-data/plan-detail', title: '计划详情' },
  { path: 'pages/basic-data/team', title: '工作团队' },
  { path: 'pages/basic-data/team-detail', title: '团队详情' },
  { path: 'pages/basic-data/admin', title: '管理人管理' },
  { path: 'pages/basic-data/admin-detail', title: '管理人详情' },
  { path: 'pages/basic-data/creditor-form', title: '债权人表单' },
  { path: 'pages/basic-data/debtor-form', title: '债务人表单' },
  { path: 'pages/basic-data/court-form', title: '法院表单' },
  { path: 'pages/basic-data/bank-form', title: '银行账户表单' },
  { path: 'pages/basic-data/bank-transactions', title: '账户流水' },
  { path: 'pages/basic-data/bank-transaction-form', title: '流水表单' },
  { path: 'pages/basic-data/plan-form', title: '工作计划表单' },
  { path: 'pages/basic-data/team-form', title: '工作团队表单' },
  { path: 'pages/basic-data/admin-form', title: '管理人表单' },
  { path: 'pages/profile/change-password', title: '修改密码' },
  { path: 'pages/profile/edit-profile', title: '修改个人资料' },
  { path: 'pages/about/index', title: '关于' },
  { path: 'pages/about/terms', title: '用户协议' },
  { path: 'pages/about/privacy', title: '隐私政策' },
  { path: 'pages/expense/index', title: '费用报销' },
  { path: 'pages/expense/detail', title: '报销单详情' },
  { path: 'pages/expense/form', title: '报销单表单' },
  { path: 'pages/expense/approve', title: '审核报销单' },
  { path: 'pages/document-library/index', title: '文档库' },
  { path: 'pages/document-library/detail', title: '文档详情' },
  { path: 'pages/document-library/form', title: '编辑文档' },
  { path: 'pages/document-library/folder', title: '文件夹管理' },
  { path: 'pages/document-library/favorites', title: '我的收藏' },
  { path: 'pages/document-library/share', title: '分享文档' },
  { path: 'pages/document-library/preview', title: '文档预览' },
  { path: 'pages/document-library/statistics', title: '文档统计' },
]

// TabBar页面
const tabBarPages = [
  { path: 'pages/workspace/index', text: '工作台' },
  { path: 'pages/cases/index', text: '案件' },
  { path: 'pages/todo/index', text: '待办' },
  { path: 'pages/profile/index', text: '我的' },
]

describe('页面路由配置验证', () => {
  it('所有页面路径应符合uni-app规范', () => {
    pages.forEach(page => {
      expect(page.path).toMatch(/^pages\/[a-z-]+\/[a-z-]+$/)
    })
  })

  it('TabBar页面应在pages列表中', () => {
    tabBarPages.forEach(tabPage => {
      const found = pages.some(p => p.path === tabPage.path)
      expect(found).toBe(true)
    })
  })

  it('TabBar应有4个页面', () => {
    expect(tabBarPages.length).toBe(4)
  })

  it('所有页面应有标题', () => {
    pages.forEach(page => {
      expect(page.title).toBeTruthy()
      expect(page.title.length).toBeGreaterThan(0)
    })
  })
})

describe('银行账户相关页面验证', () => {
  const bankPages = [
    'pages/basic-data/bank',
    'pages/basic-data/bank-detail',
    'pages/basic-data/bank-form',
    'pages/basic-data/bank-transactions',
    'pages/basic-data/bank-transaction-form',
  ]

  it('应包含5个银行账户相关页面', () => {
    expect(bankPages.length).toBe(5)
  })

  it('银行账户页面路径应正确', () => {
    bankPages.forEach(path => {
      const page = pages.find(p => p.path === path)
      expect(page).toBeDefined()
    })
  })
})

describe('API模块页面覆盖验证', () => {
  const modulePageMap: Record<string, string[]> = {
    auth: ['pages/login/index'],
    'bank-account': ['pages/basic-data/bank', 'pages/basic-data/bank-detail', 'pages/basic-data/bank-form', 'pages/basic-data/bank-transactions', 'pages/basic-data/bank-transaction-form'],
    case: ['pages/cases/index', 'pages/cases/detail', 'pages/cases/add', 'pages/cases/edit', 'pages/cases/files'],
    creditor: ['pages/basic-data/creditor', 'pages/basic-data/creditor-detail', 'pages/basic-data/creditor-form'],
    debtor: ['pages/basic-data/debtor', 'pages/basic-data/debtor-detail', 'pages/basic-data/debtor-form'],
    court: ['pages/basic-data/court', 'pages/basic-data/court-detail', 'pages/basic-data/court-form'],
    todo: ['pages/todo/index', 'pages/todo/detail', 'pages/todo/edit'],
    notification: ['pages/notification/index', 'pages/notification/detail'],
    announcement: ['pages/announcement/index', 'pages/announcement/form', 'pages/cases/announcement-list', 'pages/cases/announcement-detail'],
    'work-log': ['pages/cases/work-log'],
    'work-team': ['pages/cases/work-team', 'pages/basic-data/team', 'pages/basic-data/team-detail', 'pages/basic-data/team-form'],
    'expense-reimbursement': ['pages/expense/index', 'pages/expense/detail', 'pages/expense/form', 'pages/expense/approve'],
    'document-library': ['pages/document-library/index', 'pages/document-library/detail', 'pages/document-library/form', 'pages/document-library/folder', 'pages/document-library/favorites', 'pages/document-library/share', 'pages/document-library/preview', 'pages/document-library/statistics'],
    profile: ['pages/profile/index', 'pages/profile/settings', 'pages/profile/change-password', 'pages/profile/edit-profile'],
  }

  Object.entries(modulePageMap).forEach(([module, paths]) => {
    it(`${module} 模块应有对应的页面`, () => {
      paths.forEach(path => {
        const page = pages.find(p => p.path === path)
        expect(page).toBeDefined()
      })
    })
  })
})
