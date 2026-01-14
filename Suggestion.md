
          
根据我对项目的详细分析，以下是**新增案件的逻辑和参数**以及**工作团队权限实现**的完整说明：

## 一、新增案件的逻辑和参数

### 1.1 API接口
- **接口路径**: `POST /case`
- **Controller**: [BankruptCaseController.java](file:///d:\Ai\lawbackend2\src\main\java\com\lawbackend2\lawbackend2\controller\BankruptCaseController.java#L33-L44)
- **Service**: [BankruptCaseServiceImpl.java](file:///d:\Ai\lawbackend2\src\main\java\com\lawbackend2\lawbackend2\service\impl\BankruptCaseServiceImpl.java#L30-L44)

### 1.2 请求参数（CaseCreateRequest）

```java
{
  "caseNumber": "案号（必填，唯一）",
  "caseName": "案件名称（必填）",
  "acceptanceDate": "受理日期（必填，格式：yyyy-MM-dd）",
  "caseSource": "案件来源（可选）",
  "acceptanceCourt": "受理法院（可选）",
  "designatedInstitution": "指定机构（可选）",
  "mainResponsiblePerson": "主要负责人（可选）",
  "isSimplifiedTrial": 0,  // 是否简易程序（0-否，1-是，默认0）
  "caseReason": "案件事由（可选）",
  "caseProgress": "FIRST",  // 案件进度（默认FIRST）
  "debtClaimDeadline": "债权申报截止时间（可选，格式：yyyy-MM-dd HH:mm:ss）",
  "filingDate": "立案日期（可选，格式：yyyy-MM-dd）",
  "remarks": "备注（可选）"
}
```

### 1.3 创建逻辑流程

1. **验证案号唯一性**：检查案号是否已存在
2. **创建案件实体**：将请求参数映射到 `BankruptCase` 实体
3. **设置创建人信息**：从当前登录用户获取 `creatorId` 和 `createUserId`
4. **设置默认值**：`caseStatus` 默认为 `PENDING`，`reviewStatus` 默认为 `PENDING`
5. **保存到数据库**：保存到 `tb_bankrupt_case` 表
6. **返回结果**：返回案件ID和案号

### 1.4 涉及的表（tb_bankrupt_case）

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | bigint | 主键ID | 自动生成 |
| case_number | varchar(100) | 案号（唯一） | 是 |
| case_name | varchar(255) | 案件名称 | 是 |
| acceptance_date | date | 受理日期 | 是 |
| case_source | varchar(100) | 案件来源 | 否 |
| acceptance_court | varchar(255) | 受理法院 | 否 |
| designated_institution | varchar(255) | 指定机构 | 否 |
| main_responsible_person | varchar(100) | 主要负责人 | 否 |
| is_simplified_trial | tinyint(1) | 是否简易程序 | 否 |
| case_reason | varchar(255) | 案件事由 | 否 |
| case_progress | varchar(50) | 案件进度 | 否 |
| debt_claim_deadline | datetime | 债权申报截止时间 | 否 |
| filing_date | date | 立案日期 | 否 |
| case_status | varchar(50) | 案件状态 | 否（默认PENDING） |
| review_status | varchar(20) | 审核状态 | 否（默认PENDING） |
| creator_id | bigint | 创建人ID | 自动填充 |
| reviewer_id | bigint | 审核人ID | 否 |

---

## 二、工作团队权限实现

### 2.1 完整业务流程

```
律师用户创建案件 → 创建工作团队 → 添加团队成员 → 分配权限 → 团队成员可查看和操作案件
```

### 2.2 详细步骤说明

#### 步骤1：创建案件（已完成）
- 调用 `POST /case` 接口
- 获得案件ID（caseId）

#### 步骤2：创建工作团队
- **接口**: `POST /work-team`
- **Controller**: [WorkTeamController.java](file:///d:\Ai\lawbackend2\src\main\java\com\lawbackend2\lawbackend2\controller\WorkTeamController.java#L42-L51)
- **请求参数**:
```java
{
  "teamName": "团队名称（必填）",
  "teamLeaderId": "团队负责人ID（必填，关联tb_user.id）",
  "caseId": "案件ID（必填，关联tb_bankrupt_case.id）",
  "teamDescription": "团队描述（可选）"
}
```
- **涉及表**: `tb_work_team`

#### 步骤3：添加团队成员
- **接口**: `POST /work-team/{teamId}/member`
- **Controller**: [WorkTeamController.java](file:///d:\Ai\lawbackend2\src\main\java\com\lawbackend2\lawbackend2\controller\WorkTeamController.java#L98-L110)
- **请求参数**:
```java
{
  "caseId": "案件ID（必填）",
  "userId": "用户ID（必填，关联tb_user.id）",
  "teamRole": "团队角色（必填，如：律师、法官、管理员等）",
  "permissionLevel": "权限级别（可选，默认VIEW，可选值：VIEW/EDIT/ADMIN）"
}
```
- **涉及表**: `tb_work_team_member`

#### 步骤4：分配团队成员权限
- **接口**: `POST /work-team/member/{memberId}/permissions`
- **Controller**: [WorkTeamController.java](file:///d:\Ai\lawbackend2\src\main\java\com\lawbackend2\lawbackend2\controller\WorkTeamController.java#L150-L158)
- **请求参数**:
```java
{
  "permissions": [
    {
      "moduleType": "模块类型（必填，如：CASE_INFO/FUND_MANAGEMENT/CREDITOR_INFO/DOCUMENT_MANAGEMENT等）",
      "permissionType": "权限类型（必填，如：VIEW/EDIT/DELETE/EXPORT/APPROVE等）",
      "isAllowed": 1  // 是否允许（0-否，1-是）
    }
  ]
}
```
- **涉及表**: `tb_work_team_permission`

---

## 三、四张表的详细结构和关系

### 3.1 tb_work_team（工作团队表）

```sql
CREATE TABLE `tb_work_team` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `team_name` varchar(100) NOT NULL COMMENT '团队名称',
  `team_leader_id` bigint DEFAULT NULL COMMENT '团队负责人ID（关联tb_user.id）',
  `case_id` bigint DEFAULT NULL COMMENT '案件ID（关联tb_bankrupt_case.id）',
  `team_description` text COMMENT '团队描述',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `create_user_id` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_user_id` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_team_leader_id` (`team_leader_id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  CONSTRAINT `fk_work_team_leader` FOREIGN KEY (`team_leader_id`) REFERENCES `tb_user` (`id`),
  CONSTRAINT `fk_work_team_case` FOREIGN KEY (`case_id`) REFERENCES `tb_bankrupt_case` (`id`)
)
```

### 3.2 tb_work_team_member（工作团队成员表）

```sql
CREATE TABLE `tb_work_team_member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `team_id` bigint NOT NULL COMMENT '团队ID（关联tb_work_team.id）',
  `case_id` bigint NOT NULL COMMENT '案件ID（关联tb_bankrupt_case.id）',
  `user_id` bigint NOT NULL COMMENT '用户ID（关联tb_user.id）',
  `team_role` varchar(50) DEFAULT NULL COMMENT '团队角色（如：律师、法官、管理员等）',
  `permission_level` varchar(20) DEFAULT 'VIEW' COMMENT '权限级别（VIEW/EDIT/ADMIN）',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `create_user_id` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_user_id` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_team_role` (`team_role`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
)
```

### 3.3 tb_work_team_permission（工作团队权限表）

```sql
CREATE TABLE `tb_work_team_permission` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `team_member_id` bigint NOT NULL COMMENT '团队成员ID（关联tb_work_team_member.id）',
  `module_type` varchar(50) NOT NULL COMMENT '模块类型（如：CASE_INFO/FUND_MANAGEMENT等）',
  `permission_type` varchar(50) NOT NULL COMMENT '权限类型（如：VIEW/EDIT/DELETE等）',
  `is_allowed` tinyint(1) DEFAULT '1' COMMENT '是否允许（0-否，1-是）',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `create_user_id` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_user_id` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_team_member_id` (`team_member_id`),
  KEY `idx_module_type` (`module_type`),
  KEY `idx_permission_type` (`permission_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_work_team_permission_member` FOREIGN KEY (`team_member_id`) REFERENCES `tb_work_team_member` (`id`) ON DELETE CASCADE
)
```

### 3.4 tb_user（用户表）

```sql
CREATE TABLE `tb_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户账号',
  `password` varchar(100) NOT NULL COMMENT '用户密码',
  `real_name` varchar(50) NOT NULL COMMENT '用户姓名',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '用户状态（ACTIVE/INACTIVE/LOCKED/DELETED）',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `create_user_id` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_user_id` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_mobile` (`mobile`),
  UNIQUE KEY `uk_email` (`email`)
)
```

---

## 四、表关系图

```
tb_user (用户表)
    ↓ (1:N)
tb_work_team (工作团队表)
    ↓ (1:N)
tb_work_team_member (团队成员表)
    ↓ (1:N)
tb_work_team_permission (团队成员权限表)

同时：
tb_work_team.case_id → tb_bankrupt_case.id (工作团队关联案件)
tb_work_team_member.case_id → tb_bankrupt_case.id (团队成员关联案件)
tb_work_team_member.user_id → tb_user.id (团队成员关联用户)
```

---

## 五、权限控制机制

### 5.1 三级权限控制

1. **系统级权限**（用户角色）
   - 通过 `RoleService.isAdministrator(userId)` 判断是否为管理员
   - 管理员可以查看所有团队和案件

2. **团队级权限**（permission_level）
   - `VIEW` - 查看权限
   - `EDIT` - 编辑权限
   - `ADMIN` - 管理权限（最高权限）

3. **模块级权限**（module_type + permission_type）
   - `module_type`: CASE_INFO（案件信息）、FUND_MANAGEMENT（资金管理）、CREDITOR_INFO（债权人信息）、DOCUMENT_MANAGEMENT（文档管理）等
   - `permission_type`: VIEW（查看）、EDIT（编辑）、DELETE（删除）、EXPORT（导出）、APPROVE（审批）等
   - `is_allowed`: 0-不允许，1-允许

### 5.2 权限验证逻辑

当团队成员访问案件时，系统会：
1. 验证用户是否为该案件的团队成员（通过 `tb_work_team_member` 表）
2. 检查团队成员的 `permission_level`（VIEW/EDIT/ADMIN）
3. 检查具体模块的权限（通过 `tb_work_team_permission` 表）
4. 非管理员只能查看自己创建的团队

---

## 六、团队成员查看和操作案件的实现

### 6.1 查看案件逻辑

团队成员登录后，系统会：
1. 通过用户ID查询 `tb_work_team_member` 表，找到该用户所属的所有团队
2. 通过团队ID或案件ID查询 `tb_work_team` 表，获取团队关联的案件
3. 返回该用户有权限访问的案件列表

### 6.2 操作案件逻辑

团队成员对案件进行操作时，系统会：
1. 验证用户是否为该案件的团队成员
2. 检查用户的 `permission_level` 是否支持该操作
3. 检查用户是否有该模块的具体权限（通过 `tb_work_team_permission` 表）
4. 如果所有验证通过，允许执行操作

---

## 七、总结

**当前项目已经完整实现了以下功能**：

✅ **案件创建**：律师用户可以创建案件，包含完整的案件信息  
✅ **工作团队创建**：可以为案件创建工作团队，设置团队负责人  
✅ **团队成员管理**：可以添加团队成员到团队，设置团队角色和权限级别  
✅ **权限分配**：可以为团队成员分配具体模块的权限（查看、编辑、删除等）  
✅ **权限控制**：团队成员可以查看和操作被分配的案件，权限受三级控制  

**核心实现**：
- 通过 `tb_work_team` 表关联案件和工作团队
- 通过 `tb_work_team_member` 表关联用户、团队和案件
- 通过 `tb_work_team_permission` 表为团队成员分配细粒度的模块权限
- 通过 `tb_user` 表存储用户信息

**业务流程**：
```
创建案件 → 创建工作团队 → 添加团队成员 → 分配权限 → 团队成员可查看和操作案件
```

这个设计实现了灵活的团队协作和权限管理机制，能够满足律师事务所团队协作办案的需求。