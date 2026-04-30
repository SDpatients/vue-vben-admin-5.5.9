# 项目 API URL 前缀分析报告

## 1. 统一 API URL 前缀说明

本项目配置了全局的 `context-path`：

- **配置项**: `server.servlet.context-path: /api/v1`
- **配置文件**: `application.yml`、`application-prod.yml`

这意味着**所有 Controller 中定义的路径都会自动加上 `/api/v1` 前缀**。

例如：
- Controller 中定义 `@RequestMapping("/auth")`
- 实际访问路径为：`/api/v1/auth`

---

## 2. 普通/标准前缀的接口（与统一前缀一致）

以下模块的接口**没有额外的自定义前缀**，仅通过 `context-path` 自动加上 `/api/v1`，属于**标准统一前缀**：

| 模块 | Controller 类 | 定义路径 | 实际完整路径 |
|------|--------------|---------|-------------|
| 用户认证 | AuthController | `/auth` | `/api/v1/auth` |
| 登录日志 | LoginRecordController | `/auth` | `/api/v1/auth` |
| 用户管理 | UserController | `/users` | `/api/v1/users` |
| 角色管理 | RoleController | `/roles` | `/api/v1/roles` |
| 用户角色管理 | UserRoleController | `/user-roles` | `/api/v1/user-roles` |
| 权限管理 | PermissionController | `/permissions` | `/api/v1/permissions` |
| 案件管理 | BankruptCaseController | `/case` | `/api/v1/case` |
| 案件搜索 | CaseSearchController | `/case-search` | `/api/v1/case-search` |
| 案件进度 | CaseProgressController | `/case-progress` | `/api/v1/case-progress` |
| 案件节点 | CaseNodeController | `/case-nodes` | `/api/v1/case-nodes` |
| 公告管理 | CaseAnnouncementController | `/case-announcement` | `/api/v1/case-announcement` |
| 公告查看记录 | AnnouncementViewRecordController | `/announcement-view-record` | `/api/v1/announcement-view-record` |
| 债权申报登记 | ClaimRegistrationController | `/claim-registration` | `/api/v1/claim-registration` |
| 债权审查 | ClaimReviewController | `/claim-review` | `/api/v1/claim-review` |
| 债权确认与异议 | ClaimConfirmationController | `/claim-confirmation` | `/api/v1/claim-confirmation` |
| 债权申报 | CreditorClaimController | `/creditor-claim` | `/api/v1/creditor-claim` |
| 债权申报查询 | CreditorClaimQueryController | `/creditor-claim-query` | `/api/v1/creditor-claim-query` |
| 债权申报统计 | CreditorClaimStatisticsController | `/creditor-claim-statistics` | `/api/v1/creditor-claim-statistics` |
| 债权人信息 | CreditorInfoController | `/creditor` | `/api/v1/creditor` |
| 共益债务 | CommonDebtController | `/common-debt` | `/api/v1/common-debt` |
| 债务人信息 | DebtorEnterpriseController | `/debtor` | `/api/v1/debtor` |
| 资金流水 | FundFlowController | `/fund-flow` | `/api/v1/fund-flow` |
| 资金账户 | FundAccountController | `/fund-account` | `/api/v1/fund-account` |
| 资金审批 | FundApprovalController | `/fund-approval` | `/api/v1/fund-approval` |
| 资金预算 | FundBudgetController | `/fund-budget` | `/api/v1/fund-budget` |
| 费用报销 | FundReimbursementController | `/fund-reimbursement` | `/api/v1/fund-reimbursement` |
| 破产费用 | BankruptcyExpenseController | `/bankruptcy-expense` | `/api/v1/bankruptcy-expense` |
| 提存管理 | EscrowManagementController | `/escrow-management` | `/api/v1/escrow-management` |
| 分配执行 | DistributionExecutionController | `/distribution-execution` | `/api/v1/distribution-execution` |
| 分配明细 | DistributionDetailController | `/distribution-detail` | `/api/v1/distribution-detail` |
| 银行账户 | BankAccountController | `/bank-account` | `/api/v1/bank-account` |
| 账户交易明细 | BankAccountTransactionController | `/bank-account-transaction` | `/api/v1/bank-account-transaction` |
| 资金操作日志 | FundOperationLogController | `/fund-operation-log` | `/api/v1/fund-operation-log` |
| 工作团队 | WorkTeamController | `/work-team` | `/api/v1/work-team` |
| 工作计划 | WorkPlanController | `/work-plan` | `/api/v1/work-plan` |
| 工作日志 | WorkLogController | `/work-log` | `/api/v1/work-log` |
| 审批管理 | ApprovalController | `/approval` | `/api/v1/approval` |
| 管理人信息 | AdministratorController | `/administrator` | `/api/v1/administrator` |
| 法院信息 | CourtController | `/court` | `/api/v1/court` |
| 文书送达 | DocumentDeliveryController | `/document-delivery` | `/api/v1/document-delivery` |
| 归档管理 | ArchiveController | `/archive` | `/api/v1/archive` |
| 文件管理 | FileController | `/file` | `/api/v1/file` |
| 视频管理 | VideoController | `/video` | `/api/v1/video` |
| 临时文件上传 | TempUploadController | `/temp-upload` | `/api/v1/temp-upload` |
| 文档导出模板 | DocumentExportController | `/document-templates` | `/api/v1/document-templates` |
| 统计管理 | StatisticsController | `/statistics` | `/api/v1/statistics` |
| 案件统计 | CaseStatisticsController | `/case-statistics` | `/api/v1/case-statistics` |
| 待办管理 | TodoController | `/todo` | `/api/v1/todo` |
| 通知管理 | NotificationController | `/notification` | `/api/v1/notification` |
| 聊天管理 | ChatController | `/chat` | `/api/v1/chat` |
| AI聊天 | AiChatController | `/ai/chat` | `/api/v1/ai/chat` |
| 系统配置 | SystemConfigController | `/config` | `/api/v1/config` |
| 审计日志 | AuditLogController | `/system/audit-log` | `/api/v1/system/audit-log` |
| 数据库备份 | DatabaseBackupController | `/system/backup` | `/api/v1/system/backup` |
| 缓存管理 | CacheController | `/admin/cache` | `/api/v1/admin/cache` |
| 操作日志 | ActivityController | `/activity` | `/api/v1/activity` |
| Excel导入模板 | ExcelTemplateController | `/excel-templates` | `/api/v1/excel-templates` |

---

## 3. 与统一前缀不同的接口（特殊前缀）

以下模块的接口在 Controller 中**显式定义了包含 `/api` 或 `/api/v1` 的前缀**，导致实际路径与统一前缀**不同**：

### 3.1 带有 `/api/xxx` 前缀的接口（双 api 前缀）

这些 Controller 显式写了 `/api/xxx`，加上 `context-path` 的 `/api/v1` 后，实际路径为 `/api/v1/api/xxx`：

| 模块 | Controller 类 | 定义路径 | 实际完整路径 | 说明 |
|------|--------------|---------|-------------|------|
| 案件任务 | CaseTaskController | `/api/case-tasks` | `/api/v1/api/case-tasks` | 流程处理中的任务接口 |
| 案件任务提交 | CaseTaskSubmissionController | `/api/case-task-submissions` | `/api/v1/api/case-task-submissions` | 流程处理中的提交接口 |
| 案件流程阶段 | CaseProcessStageController | `/api/case-process-stage` | `/api/v1/api/case-process-stage` | 流程处理中的阶段接口 |
| 会议投票项 | MeetingVoteItemController | `/api/vote-items` | `/api/v1/api/vote-items` | 会议投票相关 |
| 会议视频标签 | MeetingVideoTagController | `/api/video-tags` | `/api/v1/api/video-tags` | 会议视频相关 |
| 文档库文档 | LibDocumentController | `/api/lib/documents` | `/api/v1/api/lib/documents` | 文档库模块 |
| 文档库文件夹 | LibDocumentFolderController | `/api/lib/folders` | `/api/v1/api/lib/folders` | 文档库模块 |
| 文档库版本 | LibDocumentVersionController | `/api/lib` | `/api/v1/api/lib` | 文档库模块（版本接口） |
| 文档库权限 | LibDocumentPermissionController | `/api/lib` | `/api/v1/api/lib` | 文档库模块（权限接口） |
| 文档库分享 | LibDocumentShareController | `/api/lib/shares` | `/api/v1/api/lib/shares` | 文档库模块 |
| 文档库收藏 | LibDocumentFavoriteController | `/api/lib/favorites` | `/api/v1/api/lib/favorites` | 文档库模块 |
| 文档库统计 | LibDocumentStatisticsController | `/api/lib/statistics` | `/api/v1/api/lib/statistics` | 文档库模块 |
| Word模板 | WordTemplateController | `/api/template` | `/api/v1/api/template` | 模板生成接口 |
| Excel导入历史 | ExcelImportHistoryController | `/api/excel-import-history` | `/api/v1/api/excel-import-history` | Excel导入历史 |
| Excel字段验证规则 | ExcelFieldValidationRuleController | `/api/excel-field-validation-rules` | `/api/v1/api/excel-field-validation-rules` | Excel字段验证 |

### 3.2 带有 `/api/v1/xxx` 前缀的接口（与 context-path 一致但重复）

这些 Controller 显式写了 `/api/v1/xxx`，加上 `context-path` 的 `/api/v1` 后，实际路径为 `/api/v1/api/v1/xxx`：

| 模块 | Controller 类 | 定义路径 | 实际完整路径 | 说明 |
|------|--------------|---------|-------------|------|
| OnlyOffice集成 | OnlyOfficeController | `/api/v1/onlyoffice` | `/api/v1/api/v1/onlyoffice` | OnlyOffice文档编辑 |

### 3.3 其他特殊前缀（非 `/api` 开头但显式自定义）

| 模块 | Controller 类 | 定义路径 | 实际完整路径 | 说明 |
|------|--------------|---------|-------------|------|
| 公共Web接口 | WebController | `/web` | `/api/v1/web` | 公共Web接口 |
| WebSocket管理 | WebSocketController | `/websocket` | `/api/v1/websocket` | WebSocket状态/广播 |
| 许可证管理 | LicenseController | `/system/license` | `/api/v1/system/license` | 软件许可证管理 |

> 注：`/web`、`/websocket`、`/system/license` 虽然路径特殊，但仍然是基于 `context-path` 的标准路径，只是功能模块划分不同。

---

## 4. WebSocket STOMP 消息映射（非 HTTP 接口）

以下接口使用 WebSocket/STOMP 协议，不是传统的 HTTP REST 接口，路径体系独立：

| 模块 | Controller 类 | 消息映射路径 | 说明 |
|------|--------------|-------------|------|
| 聊天WebSocket | ChatWebSocketController | `/chat/onlineUsers` | 获取在线用户列表 |
| 聊天WebSocket | ChatWebSocketController | `/chat/send` | 发送聊天消息 |
| 聊天WebSocket | ChatWebSocketController | `/chat/read` | 标记消息已读 |
| 聊天WebSocket | ChatWebSocketController | `/chat/typing` | 输入状态通知 |

> WebSocket 接口通过 STOMP 协议访问，前缀通常由 `WebSocketConfig` 中配置的 `applicationDestinationPrefixes` 决定，与 HTTP 的 `context-path` 无关。

---

## 5. 总结

### 5.1 真正"与统一 API URL 不同"的接口

以下模块在 Controller 中**显式硬编码了 `/api` 或 `/api/v1` 前缀**，导致实际 URL 与项目的统一前缀规则不一致：

1. **流程处理相关（每个阶段接口都有 `api/v1` 前缀）**：
   - `CaseTaskController` → `/api/v1/api/case-tasks`
   - `CaseTaskSubmissionController` → `/api/v1/api/case-task-submissions`
   - `CaseProcessStageController` → `/api/v1/api/case-process-stage`

2. **会议相关**：
   - `MeetingVoteItemController` → `/api/v1/api/vote-items`
   - `MeetingVideoTagController` → `/api/v1/api/video-tags`

3. **文档库相关**：
   - `LibDocumentController` → `/api/v1/api/lib/documents`
   - `LibDocumentFolderController` → `/api/v1/api/lib/folders`
   - `LibDocumentVersionController` → `/api/v1/api/lib`
   - `LibDocumentPermissionController` → `/api/v1/api/lib`
   - `LibDocumentShareController` → `/api/v1/api/lib/shares`
   - `LibDocumentFavoriteController` → `/api/v1/api/lib/favorites`
   - `LibDocumentStatisticsController` → `/api/v1/api/lib/statistics`

4. **模板与Excel相关**：
   - `WordTemplateController` → `/api/v1/api/template`
   - `ExcelImportHistoryController` → `/api/v1/api/excel-import-history`
   - `ExcelFieldValidationRuleController` → `/api/v1/api/excel-field-validation-rules`

5. **OnlyOffice（最特殊，双 `api/v1` 前缀）**：
   - `OnlyOfficeController` → `/api/v1/api/v1/onlyoffice`

### 5.2 建议

建议统一将所有 Controller 中的硬编码 `/api` 和 `/api/v1` 前缀移除，统一依赖 `server.servlet.context-path` 配置，以保持全项目 API URL 风格一致。
