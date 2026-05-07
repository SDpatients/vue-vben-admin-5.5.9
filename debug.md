## 一、案件查询 REST API 接口
### 1. 获取案件详情
项目 内容 接口 GET /case/{caseId} 功能 根据案件ID获取单个案件详情 查询字段 caseId (路径参数)

### 2. 案件列表查询（分页）
项目 内容 接口 GET /case/list 功能 查询案件列表，支持分页、状态筛选、进度筛选、关键词搜索 查询字段 pageNum (页码), pageSize (每页大小), caseStatus (案件状态), caseProgress (案件进度), keyword (关键词)

keyword 支持模糊查询的字段 （ BankruptCaseRepository.java:L104 ）：

- 案号 ( caseNumber )
- 案件名称 ( caseName )
- 受理法院 ( acceptanceCourt )
- 指定机构 ( designatedInstitution )
- 主要负责人 ( mainResponsiblePerson )
- 案件来源 ( caseSource )
- 案由 ( caseReason )
- 指定法官 ( designatedJudge )
### 3. 案件简单信息查询（分页）
项目 内容 接口 GET /case/simple-list 功能 查询案件简单信息（ID、案号、案件名称、审核状态） 查询字段 page (页码), size (每页大小), caseNumber (案号，模糊查询)

### 4. 根据用户ID查询案件列表
项目 内容 接口 GET /case/user/{userId}/list 功能 查询指定用户的案件列表 查询字段 userId (路径参数), pageNum (页码), pageSize (每页大小), caseStatus (案件状态), caseNumber (案号，模糊查询)

### 5. 根据用户ID查询案件数量
项目 内容 接口 GET /case/user/{userId}/count 功能 查询指定用户的案件数量 查询字段 userId (路径参数), caseStatus (案件状态), caseNumber (案号，模糊查询)

### 6. 待审核案件列表
项目 内容 接口 GET /case/review/pending 功能 查询待审核案件列表 查询字段 pageNum (页码), pageSize (每页大小), keyword (案号关键词)

### 7. 已审核案件列表
项目 内容 接口 GET /case/review/approved 功能 查询已审核通过案件列表 查询字段 pageNum (页码), pageSize (每页大小), keyword (案号关键词)

### 8. 已驳回案件列表
项目 内容 接口 GET /case/review/rejected 功能 查询已驳回案件列表 查询字段 pageNum (页码), pageSize (每页大小), keyword (案号关键词)

### 9. 指定审核人审核的案件列表
项目 内容 接口 GET /case/review/reviewer/{reviewerId} 功能 查询指定审核人审核过的案件 查询字段 reviewerId (路径参数), pageNum (页码), pageSize (每页大小), reviewStatus (审核状态)

### 10. 审核状态统计
项目 内容 接口 GET /case/review/statistics 功能 查询各审核状态的数量统计 查询字段 无

### 11. 当前用户案件统计
项目 内容 接口 GET /case/my-stats 功能 获取当前登录用户的案件统计数据（总数、进行中、已结案） 查询字段 无

### 12. 案件关联数据查询
项目 内容 接口 GET /case/{caseId}/related-data 功能 查询案件关联数据（审批、流程、文档、归档、公告、资金等） 查询字段 caseId (路径参数)

### 13. 最近查询记录
项目 内容 接口 GET /case/recent-searches 功能 获取当前用户最近查询的案件记录 查询字段 limit (返回数量，默认10条)

## 二、Repository 层支持的查询字段
除了接口层暴露的查询字段外， BankruptCaseRepository 还定义了以下数据库查询方法：

### 单字段精确/模糊查询
查询字段 查询方式 caseNumber (案号) 精确查询、模糊查询 ( LIKE ) caseName (案件名称) 模糊查询 ( LIKE ) caseStatus (案件状态) 精确查询 caseProgress (案件进度) 精确查询 acceptanceCourt (受理法院) 模糊查询 ( LIKE ) designatedInstitution (指定机构) 模糊查询 ( LIKE ) mainResponsiblePerson (主要负责人) 模糊查询 ( LIKE ) caseSource (案件来源) 模糊查询 ( LIKE ) caseReason (案由) 模糊查询 ( LIKE ) designatedJudge (指定法官) 模糊查询 ( LIKE ) createUserId (创建人ID) 精确查询 reviewStatus (审核状态) 精确查询 reviewerId (审核人ID) 精确查询 undertakingPersonnel (承办人员) 精确查询 isSimplifiedTrial (是否简易程序) 精确查询

### 日期范围查询
查询字段 说明 acceptanceDate (受理日期) 支持日期范围查询 ( BETWEEN ) createTime (创建时间) 支持日期范围、年、月、季度查询

### 组合查询
Repository 中支持多种字段组合查询，例如：

- caseStatus + caseProgress
- caseStatus + keyword
- createUserId + caseStatus + caseNumber
- idIn + caseStatus + caseNumber
## 三、案件实体可用字段汇总
BankruptCase.java 实体中定义了以下可用于查询或筛选的字段：

字段名 说明 id 案件ID caseNumber 案号 caseName 案件名称 acceptanceDate 受理日期 caseSource 案件来源 acceptanceCourt 受理法院 designatedInstitution 指定机构 mainResponsiblePerson 主要负责人 isSimplifiedTrial 是否简易程序 caseReason 案由 caseProgress 案件进度 caseType 案件类型 (LIQUIDATION/REORGANIZATION) debtClaimDeadline 债权申报截止日期 filingDate 立案日期 closingDate 结案日期 bankruptcyDate 破产宣告日期 terminationDate 终结日期 cancellationDate 注销日期 archivingDate 归档日期 caseStatus 案件状态 designatedJudge 指定法官 undertakingPersonnel 承办人员 createUserId 创建人ID createTime 创建时间 reviewStatus 审核状态 reviewerId 审核人ID