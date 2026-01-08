# 我的案件和团队案件API文档

## 一、案件查询接口

### 1. 查询我创建的案件
**接口地址**: `GET /api/web/selectMyCases`

**请求参数**:
- `page` (可选): 页码，默认1
- `size` (可选): 每页数量，默认10

**请求头**:
- `Authorization`: Bearer {token}

**响应示例**:
```json
{
  "status": "1",
  "msg": "success",
  "data": {
    "count": 100,
    "pages": 10,
    "records": [
      {
        "sepId": 1,
        "ah": "案号",
        "ajmc": "案件名称",
        "creatorId": 5,
        "reviewStatus": "PENDING"
      }
    ]
  }
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `bankruptCaseService.selectCaseByCreatorId(userId, page, size)` 查询该用户创建的所有案件
3. 返回分页结果

---

### 2. 查询团队案件
**接口地址**: `GET /api/web/selectTeamCases`

**请求参数**:
- `page` (可选): 页码，默认1
- `size` (可选): 每页数量，默认10

**请求头**:
- `Authorization`: Bearer {token}

**响应示例**:
```json
{
  "status": "1",
  "msg": "success",
  "data": {
    "count": 50,
    "pages": 5,
    "records": [
      {
        "sepId": 2,
        "ah": "案号2",
        "ajmc": "案件名称2",
        "creatorId": 3,
        "reviewStatus": "APPROVED"
      }
    ]
  }
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `workTeamService.getAccessibleCases(userId)` 获取用户可访问的所有案件
3. 包括：
   - 用户创建的案件
   - 用户作为团队成员加入的案件
4. 返回分页结果

---

### 3. 查询所有案件（管理员）
**接口地址**: `GET /api/web/selectAllCase`

**请求参数**:
- `page` (可选): 页码，默认1
- `size` (可选): 每页数量，默认10

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 检查用户权限：
   - 如果是管理员（ADMIN或SUPER_ADMIN）或有 `case:view:all` 权限，返回所有案件
   - 否则，返回用户可访问的案件（通过 `workTeamService.getAccessibleCases(userId)`）

---

### 4. 查询单个案件详情
**接口地址**: `GET /api/web/selectOneCase`

**请求参数**:
- `SEP_ID`: 案件ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件信息
3. 权限检查：
   - 如果是管理员，允许查看
   - 如果是案件创建者，允许查看
   - 如果是团队成员且有VIEW权限，允许查看
   - 否则返回"无权查看该案件"

---

## 二、案件操作接口

### 1. 添加案件
**接口地址**: `POST /api/web/AddOneCase`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "ah": "案号",
  "ajmc": "案件名称",
  "teamMembers": [
    {
      "userId": 10,
      "teamRole": "MEMBER",
      "permissionLevel": "VIEW"
    }
  ]
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 权限检查：检查用户是否有 `case:add` 权限
3. 设置案件创建者ID和更新者ID
4. 如果请求体包含团队成员，调用 `addOneCaseWithTeam()` 同时创建案件和团队
5. 否则，只创建案件

---

### 2. 更新案件
**接口地址**: `POST /api/web/updateCase`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "sepId": 1,
  "ah": "新案号",
  "ajmc": "新案件名称"
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件是否存在
3. 权限检查：调用 `CasePermissionUtils.canEditCase(userId, caseId)` 检查编辑权限
   - 案件创建者可以编辑
   - 团队成员有EDIT或FULL权限可以编辑
   - 管理员可以编辑所有案件
4. 更新案件信息

---

### 3. 删除案件
**接口地址**: `POST /api/web/deleteCase`

**请求参数**:
- `caseId`: 案件ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件是否存在
3. 权限检查：调用 `CasePermissionUtils.canDeleteCase(userId, caseId)` 检查删除权限
   - 案件创建者可以删除
   - 团队成员有FULL权限可以删除
   - 管理员可以删除所有案件
4. 删除案件

---

## 三、团队管理接口

### 1. 设置团队成员（批量）
**接口地址**: `POST /api/web/workteam/setTeamMembers`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "caseId": 1,
  "members": [
    {
      "userId": 10,
      "teamRole": "MEMBER",
      "permissionLevel": "VIEW",
      "isActive": true
    },
    {
      "userId": 11,
      "teamRole": "MANAGER",
      "permissionLevel": "EDIT",
      "isActive": true
    }
  ],
  "permissions": [
    {
      "moduleType": "DEBTOR",
      "permissionType": "EDIT",
      "isAllowed": true
    }
  ]
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件是否存在
3. 权限检查：只有案件创建者可以设置团队成员
4. 调用 `workTeamService.setTeamMembers()` 批量设置成员
   - 删除不在新列表中的成员
   - 更新已存在的成员
   - 添加新成员
5. 如果包含权限设置，调用 `saveMemberPermissions()` 保存权限

---

### 2. 添加团队成员
**接口地址**: `POST /api/web/workteam/addTeamMember`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "caseId": 1,
  "userId": 10,
  "teamRole": "MEMBER",
  "permissionLevel": "VIEW",
  "isActive": true
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件是否存在
3. 权限检查：只有案件创建者可以添加团队成员
4. 调用 `workTeamService.addTeamMember()` 添加成员
   - 如果成员已存在，更新成员信息并激活
   - 如果成员不存在，插入新记录

---

### 3. 更新团队成员
**接口地址**: `POST /api/web/workteam/updateTeamMember`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "id": 1,
  "caseId": 1,
  "userId": 10,
  "teamRole": "MANAGER",
  "permissionLevel": "EDIT",
  "isActive": true
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询案件是否存在
3. 权限检查：只有案件创建者可以修改团队成员
4. 调用 `workTeamService.updateTeamMember()` 更新成员信息

---

### 4. 移除团队成员
**接口地址**: `POST /api/web/workteam/removeTeamMember`

**请求参数**:
- `memberId`: 团队成员ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询团队成员是否存在
3. 查询案件是否存在
4. 权限检查：只有案件创建者可以移除团队成员
5. 调用 `workTeamService.removeTeamMember()` 删除成员及其权限

---

### 5. 获取案件所有团队成员
**接口地址**: `GET /api/web/workteam/getTeamMembers`

**请求参数**:
- `caseId`: 案件ID

**请求头**:
- `Authorization`: Bearer {token}

**响应示例**:
```json
{
  "status": "1",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "caseId": 1,
      "userId": 10,
      "teamRole": "MEMBER",
      "permissionLevel": "VIEW",
      "isActive": true
    }
  ]
}
```

**后端处理逻辑**:
1. 调用 `workTeamService.getTeamMembersByCaseId(caseId)` 查询案件所有团队成员

---

### 6. 获取活跃团队成员
**接口地址**: `GET /api/web/workteam/getActiveTeamMembers`

**请求参数**:
- `caseId`: 案件ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 调用 `workTeamService.getActiveTeamMembersByCaseId(caseId)` 查询案件的活跃团队成员（isActive=true）

---

## 四、权限管理接口

### 1. 保存成员权限
**接口地址**: `POST /api/web/workteam/saveMemberPermissions`

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**请求体**:
```json
{
  "memberId": 1,
  "permissions": [
    {
      "moduleType": "DEBTOR",
      "permissionType": "EDIT",
      "isAllowed": true
    },
    {
      "moduleType": "CREDITOR",
      "permissionType": "VIEW",
      "isAllowed": true
    }
  ]
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 查询团队成员是否存在
3. 查询案件是否存在
4. 权限检查：只有案件创建者可以设置权限
5. 调用 `workTeamService.saveMemberPermissions()` 保存权限

---

### 2. 获取成员权限
**接口地址**: `GET /api/web/workteam/getMemberPermissions`

**请求参数**:
- `memberId`: 团队成员ID

**请求头**:
- `Authorization`: Bearer {token}

**响应示例**:
```json
{
  "status": "1",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "teamMemberId": 1,
      "moduleType": "DEBTOR",
      "permissionType": "EDIT",
      "isAllowed": true
    }
  ]
}
```

**后端处理逻辑**:
1. 调用 `workTeamService.getMemberPermissions(memberId)` 查询成员的所有权限

---

### 3. 检查案件权限
**接口地址**: `GET /api/web/checkCasePermission`

**请求参数**:
- `caseId`: 案件ID
- `permission` (可选): 权限类型，默认"VIEW"，可选值：VIEW、EDIT、DELETE、FULL

**请求头**:
- `Authorization`: Bearer {token}

**响应示例**:
```json
{
  "status": "1",
  "msg": "success",
  "data": true
}
```

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `CasePermissionUtils.canAccessCase(userId, caseId, permission)` 检查权限

---

### 4. 检查是否可访问案件
**接口地址**: `GET /api/web/workteam/canAccessCase`

**请求参数**:
- `caseId`: 案件ID
- `permission` (可选): 权限类型，默认"VIEW"

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `workTeamService.canAccessCase(userId, caseId, permission)` 检查访问权限

---

## 五、角色管理接口

### 1. 获取所有团队角色
**接口地址**: `GET /api/web/workteam/getAllTeamRoles`

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 调用 `workTeamService.getAllTeamRoles()` 查询所有团队角色

---

### 2. 获取活跃团队角色
**接口地址**: `GET /api/web/workteam/getActiveTeamRoles`

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 调用 `workTeamService.getActiveTeamRoles()` 查询所有活跃的团队角色

---

## 六、其他接口

### 1. 获取我可访问的案件
**接口地址**: `GET /api/web/workteam/getMyAccessibleCases`

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `workTeamService.getAccessibleCases(userId)` 获取用户可访问的所有案件

---

### 2. 获取我的团队成员信息
**接口地址**: `GET /api/web/getMyTeamMemberInfo`

**请求参数**:
- `caseId`: 案件ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 从请求头中解析token，获取当前用户ID
2. 调用 `CasePermissionUtils.getTeamMemberRole(userId, caseId)` 获取用户在该案件中的角色信息

---

### 3. 根据案件和用户获取成员信息
**接口地址**: `GET /api/web/workteam/getTeamMemberByCaseAndUser`

**请求参数**:
- `caseId`: 案件ID
- `userId`: 用户ID

**请求头**:
- `Authorization`: Bearer {token}

**后端处理逻辑**:
1. 调用 `workTeamService.getTeamMemberByCaseIdAndUserId(caseId, userId)` 查询成员信息

---

## 七、权限控制机制

### 1. 权限级别

团队成员的权限级别（permissionLevel）：
- **VIEW**: 查看权限 - 只能查看案件信息
- **EDIT**: 编辑权限 - 可以编辑案件信息
- **FULL**: 完全权限 - 包括查看、编辑和删除

### 2. 权限检查流程

后端在处理每个请求时，会按照以下流程检查权限：

1. **获取当前用户ID**: 从请求头的token中解析用户ID
2. **检查是否为管理员**: 
   - ADMIN或SUPER_ADMIN角色可以查看所有案件
3. **检查是否为案件创建者**: 
   - 案件创建者拥有完全权限
4. **检查团队成员权限**:
   - 查询用户是否为该案件的团队成员
   - 检查成员的权限级别是否满足要求
5. **检查具体权限**:
   - 根据请求的操作类型（VIEW、EDIT、DELETE）检查权限

### 3. 全局权限码

系统支持的全局权限码：
- `case:add`: 添加案件权限
- `case:view:all`: 查看所有案件权限
- `case:edit`: 编辑案件权限
- `case:delete`: 删除案件权限
- `case:review`: 审核案件权限

### 4. 模块级权限

除了基本的权限级别，系统还支持模块级权限控制：
- **moduleType**: 模块类型（如DEBTOR、CREDITOR等）
- **permissionType**: 权限类型（VIEW、EDIT等）
- **isAllowed**: 是否允许

---

## 八、接口实现状态

### 已实现的接口

✅ 案件查询接口
- ✅ 查询我创建的案件
- ✅ 查询团队案件
- ✅ 查询所有案件
- ✅ 查询单个案件详情

✅ 案件操作接口
- ✅ 添加案件（支持同时设置团队成员）
- ✅ 更新案件
- ✅ 删除案件
- ✅ 审核通过案件
- ✅ 驳回案件
- ✅ 获取审核日志

✅ 团队管理接口
- ✅ 设置团队成员（批量）
- ✅ 添加团队成员
- ✅ 更新团队成员
- ✅ 移除团队成员
- ✅ 获取案件所有团队成员
- ✅ 获取活跃团队成员

✅ 权限管理接口
- ✅ 保存成员权限
- ✅ 获取成员权限
- ✅ 检查案件权限
- ✅ 检查是否可访问案件

✅ 角色管理接口
- ✅ 获取所有团队角色
- ✅ 获取活跃团队角色

✅ 其他接口
- ✅ 获取我可访问的案件
- ✅ 获取我的团队成员信息
- ✅ 根据案件和用户获取成员信息

### 总结

所有与案件权限设置相关的接口都已完整实现，包括：
1. 案件的创建、查询、修改、删除
2. 团队成员的添加、修改、删除、查询
3. 权限的设置和查询
4. 权限检查和访问控制

后端通过多层权限控制机制（全局权限、案件级权限、模块级权限）确保了数据的安全性和操作的合规性。