# 破产管理人管理系统 - 菜单优化分析报告

## 一、当前菜单结构观察

### 1. 现有菜单层级结构

```
├─ 概览 (Dashboard) [order: -1]
│  ├─ 分析页 (/analytics)
│  ├─ 工作台 (/workspace)
│  ├─ 模板管理 (/template-management)
│  ├─ 个人中心 (/dashboard/profile)
│  └─ 系统健康监控 (/dashboard/system-monitor) [仅管理员]
│
├─ 法律模块 (Law) [order: 2]
│  ├─ 案件管理 (/law/case-management)
│  ├─ 公告列表 (/law/announcement-list)
│  ├─ 案件卷宗归档 [hideInMenu]
│  └─ 破产案件流程处理 [hideInMenu]
│
├─ 基础资料 (BasicData) [order: 3]
│  ├─ 债权人管理
│  ├─ 债务人管理
│  ├─ 法院管理
│  ├─ 管理人银行账户
│  ├─ 工作计划管理
│  ├─ 管理人信息
│  └─ 员工管理
│
├─ 用户管理 (User) [order: 4]
│  ├─ 用户列表 (/user/management)
│  └─ 个人中心 (/user/profile)
│
├─ 文档库 (DocumentLibrary) [order: 1]
│  ├─ 仪表盘
│  ├─ 文档管理
│  ├─ 我的收藏
│  └─ 文档搜索
│
├─ 费用报销 (ExpenseReimbursement) [order: 3]
│  ├─ 报销单列表
│  ├─ 新增报销单 [hideInMenu]
│  └─ 报销单详情 [hideInMenu]
│
├─ 批审管理 (ApprovalManagement) [order: 11] [仅管理员]
│  ├─ 文书审批
│  ├─ 案件审批
│  ├─ 报销批审
│  └─ 审批详情 [hideInMenu]
│
├─ 资金管控 (Fund) [order: 未定义]
│  ├─ 账户管理 (/fund/account)
│  ├─ 资金流水 (/fund/flow)
│  └─ 统计报表 (/fund/report)
│
└─ 通信功能 (Chat) [hideInMenu]
   ├─ 聊天主页
   └─ 聊天详情 [hideInMenu]
```

### 2. 当前菜单问题诊断

| 问题类型 | 具体表现 |
|---------|---------|
| **命名不够业务化** | "法律模块"过于技术化，"概览"过于泛化 |
| **层级分散** | 相同业务域的菜单分散在多个一级菜单下（如"费用报销"与"批审管理"分开） |
| **顺序不合理** | "文档库" order:1 却排在最后显示，"基础资料"和"费用报销"都是 order:3 |
| **功能重复** | "个人中心"在 Dashboard 和 User 模块都有定义 |
| **缺失业务节点** | 缺少"待办事项"、"节点预警"等业务刚需入口 |
| **模块归属混乱** | "管理人银行账户"在"基础资料"下，但"资金管控"是独立模块 |
| **隐藏菜单过多** | 多个业务流程相关页面未展示在菜单中 |

### 3. 与目标结构对比分析

| 目标一级菜单 | 当前对应模块 | 差异分析 |
|-------------|-------------|---------|
| **案件总览** | 概览(Dashboard) | 需要新增待办事项、节点预警；分析页需并入数据仪表盘 |
| **案件管理** | 法律模块(Law) + 基础资料部分 | 需要将债权人/债务人/法院/管理人/员工从基础资料移入 |
| **基础管控** | 基础资料 + 文档库 | 需要重新归类文档相关功能；银行账户归属需调整 |
| **费用与系统** | 费用报销 + 批审管理 + 用户管理 | 需要合并费用与审批；模板管理需调整归属 |

### 4. 当前文件映射关系

| 路由模块文件 | 对应视图目录 | 包含的菜单项 |
|-------------|-------------|-------------|
| `dashboard.ts` | `views/dashboard/` | 概览、分析页、工作台、模板管理、个人中心、系统健康监控 |
| `law.ts` | `views/law/` | 法律模块、案件管理、公告列表 |
| `basic-data.ts` | `views/basic-data/` | 基础资料、债权人/债务人/法院管理、银行账户、工作计划、管理人信息、员工管理 |
| `document-library.ts` | `views/document-library/` | 文档库、仪表盘、文档管理、我的收藏、文档搜索 |
| `expense-reimbursement.ts` | `views/expense-reimbursement/` | 费用报销、报销单列表 |
| `approval.ts` | `views/approval/` | 批审管理、文书审批、案件审批、报销批审 |
| `fund.ts` | `views/fund/` | 资金管控、账户管理、资金流水、统计报表 |
| `user.ts` | `views/user/` | 用户管理、用户列表、个人中心 |
| `notification.ts` | `views/notification/` | 通知中心 (hideInMenu) |
| `chat.ts` | `views/chat/` | 通信功能 (hideInMenu) |

---

## 二、即将执行的操作计划

### Phase 1: 路由模块重构（核心）

#### 1.1 新建/修改路由模块文件

| 操作 | 文件 | 说明 |
|-----|------|------|
| **修改** | `dashboard.ts` → 重构为"案件总览"模块 | 调整菜单结构，新增待办事项、节点预警路由 |
| **修改** | `law.ts` → 重构为"案件管理"模块 | 重命名，将债权人/债务人等从 basic-data 迁移过来 |
| **修改** | `basic-data.ts` → 重构为"基础管控"模块 | 整合文档库功能，移除已迁移的主体管理 |
| **新建/修改** | `expense-system.ts` → 新建"费用与系统"模块 | 合并费用报销、批审管理、模板管理、个人中心 |
| **保留** | `fund.ts` | 可并入基础管控或保持独立，视业务需求 |
| **处理** | `notification.ts` | 决定是否作为独立菜单或并入案件总览 |

#### 1.2 路由结构调整细节

**案件总览模块 (dashboard.ts)**
```
├─ 案件概览 (原分析页调整)
├─ 数据仪表盘 (原工作台调整)
├─ 待办事项 (新增)
└─ 节点预警 (新增)
```

**案件管理模块 (law.ts)**
```
├─ 案件列表 (原案件管理)
├─ 债权人管理 (从 basic-data 迁移)
├─ 债务人管理 (从 basic-data 迁移)
├─ 法院管理 (从 basic-data 迁移)
├─ 管理人信息 (从 basic-data 保留)
├─ 工作计划管理 (从 basic-data 迁移)
├─ 员工管理 (从 basic-data 迁移)
└─ 案件公告 (原公告列表)
```

**基础管控模块 (basic-data.ts 或新建)**
```
├─ 基础信息维护 (原基础资料)
├─ 文档库
│  ├─ 文档管理
│  ├─ 我的收藏
│  └─ 文档搜索
└─ 账户管理 (原管理人银行账户)
```

**费用与系统模块 (expense-system.ts)**
```
├─ 费用管理
│  ├─ 费用报销
│  └─ 报销单列表
├─ 模板管理
└─ 个人中心
```

### Phase 2: 国际化文件更新

修改 `apps/web-ele/src/locales/langs/zh-CN/page.json`，更新所有菜单标题：

| 原键值 | 新键值 | 原值 | 新值 |
|--------|--------|------|------|
| `page.dashboard.title` | - | "概览" | "案件总览" |
| `page.dashboard.analytics` | - | "分析页" | "数据仪表盘" |
| `page.law.title` | - | "法律模块" | "案件管理" |
| `page.law.caseManagement` | - | "案件管理" | "案件列表" |
| `page.basicData.title` | - | "基础资料" | "基础管控" |
| `page.documentLibrary.title` | - | "文档库" | 保持或调整 |

### Phase 3: 视图文件迁移（如需要）

根据路由调整，可能需要移动视图文件：

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `views/basic-data/creditor-management/` | `views/case/creditor-management/` | 归入案件管理 |
| `views/basic-data/debtor-management/` | `views/case/debtor-management/` | 归入案件管理 |
| `views/basic-data/court-management/` | `views/case/court-management/` | 归入案件管理 |
| `views/basic-data/work-plan-management/` | `views/case/work-plan-management/` | 归入案件管理 |
| `views/basic-data/staff-management/` | `views/case/staff-management/` | 归入案件管理 |

### Phase 4: 路由导入顺序调整

修改路由模块的 `order` 值，确保菜单显示顺序符合业务逻辑：

| 模块 | 新 order 值 | 显示顺序 |
|------|------------|---------|
| 案件总览 | -1 | 第 1 位 |
| 案件管理 | 1 | 第 2 位 |
| 基础管控 | 2 | 第 3 位 |
| 费用与系统 | 3 | 第 4 位 |

---

## 三、执行前注意事项

1. **兼容性**：所有路由变更需保持原有 URL 路径的兼容性，或做好 302 重定向
2. **权限配置**：原 `roles` 和 `authority` 配置需迁移至新路由结构
3. **动态菜单**：若系统支持后端动态菜单，需同步更新后端菜单配置
4. **收藏/书签**：用户可能收藏了原有 URL，需评估影响范围
5. **测试覆盖**：路由变更后需验证所有页面跳转、面包屑导航是否正常

---

## 四、建议执行顺序

1. 先修改国际化文件 (`page.json`)
2. 再调整路由模块文件的 `meta.title` 和 `order`
3. 然后重构路由层级结构（合并/拆分模块）
4. 最后迁移视图文件（如有必要）
5. 全量测试验证

---

**报告生成时间**: 2026-04-24  
**分析范围**: `apps/web-ele/src/router/routes/modules/*` + `apps/web-ele/src/locales/langs/zh-CN/page.json`
