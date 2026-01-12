# 1月9日工作团队API汇总

## 概述

本文档详细说明工作团队管理相关的所有API接口，包括团队管理、成员管理和权限管理等功能。

## 数据库表结构

### 表关系说明

1. **tb_work_team（工作团队表）**
   - 主键：id
   - 关联字段：team_leader_id（关联tb_user）、case_id（关联tb_bankrupt_case）
   - 与tb_work_team_member为一对多关系

2. **tb_work_team_member（工作团队成员表）**
   - 主键：id
   - 关联字段：team_id（关联tb_work_team）、case_id（关联tb_bankrupt_case）、user_id（关联tb_user）
   - 与tb_work_team_permission为一对多关系

3. **tb_work_team_permission（工作团队权限表）**
   - 主键：id
   - 关联字段：team_member_id（关联tb_work_team_member）
   - 与tb_work_team_member为一对多关系

### 表关系图

```
tb_user (用户表)
    ↓ (1:N)
tb_work_team (工作团队表)
    ↓ (1:N)
tb_work_team_member (工作团队成员表)
    ↓ (1:N)
tb_work_team_permission (工作团队权限表)
```

---

## API接口列表

### 一、工作团队管理

#### 1. 创建工作团队

**功能描述**：创建一个新的工作团队

**请求URL**：`POST /work-team`

**请求方法**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamName | String | 是 | 团队名称 |
| teamLeaderId | Long | 是 | 团队负责人ID |
| caseId | Long | 是 | 案件ID |
| teamDescription | String | 否 | 团队描述 |

**请求示例**：

```json
{
  "teamName": "案件处理团队A",
  "teamLeaderId": 1,
  "caseId": 100,
  "teamDescription": "负责案件A的处理工作"
}
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "teamId": 1
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null
}
```

---

#### 2. 工作团队列表（分页）

**功能描述**：获取工作团队列表，支持分页和多条件查询

**请求URL**：`GET /work-team/list`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| caseId | Long | 否 | 案件ID |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） |
| teamName | String | 否 | 团队名称（模糊查询） |
| teamLeaderId | Long | 否 | 团队负责人ID |

**请求示例**：

```
GET /work-team/list?pageNum=1&pageSize=10&caseId=100&status=ACTIVE
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "teamName": "案件处理团队A",
        "teamLeaderId": 1,
        "caseId": 100,
        "teamDescription": "负责案件A的处理工作",
        "status": "ACTIVE",
        "createTime": "2026-01-09T10:00:00",
        "updateTime": "2026-01-09T10:00:00"
      }
    ]
  }
}
```

---

#### 3. 工作团队列表（分页，包含详细信息）

**功能描述**：获取工作团队列表，包含负责人姓名、案件名称和成员数量等详细信息

**请求URL**：`GET /work-team/list/details`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| caseId | Long | 否 | 案件ID |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） |
| teamName | String | 否 | 团队名称（模糊查询） |
| teamLeaderId | Long | 否 | 团队负责人ID |

**请求示例**：

```
GET /work-team/list/details?pageNum=1&pageSize=10&caseId=100&status=ACTIVE
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "teamName": "案件处理团队A",
        "teamLeaderId": 1,
        "teamLeaderName": "张三",
        "caseId": 100,
        "caseName": "案件A",
        "teamDescription": "负责案件A的处理工作",
        "status": "ACTIVE",
        "createTime": "2026-01-09T10:00:00",
        "memberCount": 5
      }
    ]
  }
}
```

---

#### 4. 获取工作团队详情

**功能描述**：根据团队ID获取工作团队详细信息

**请求URL**：`GET /work-team/{teamId}`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID（路径参数） |

**请求示例**：

```
GET /work-team/1
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "teamName": "案件处理团队A",
    "teamLeaderId": 1,
    "caseId": 100,
    "teamDescription": "负责案件A的处理工作",
    "status": "ACTIVE",
    "createTime": "2026-01-09T10:00:00",
    "updateTime": "2026-01-09T10:00:00"
  }
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "工作团队不存在",
  "data": null
}
```

---

#### 5. 获取工作团队详情（包含成员和权限）

**功能描述**：获取工作团队详细信息，包含团队成员列表及其权限信息

**请求URL**：`GET /work-team/{teamId}/detail`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID（路径参数） |

**请求示例**：

```
GET /work-team/1/detail
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "teamName": "案件处理团队A",
    "teamLeaderId": 1,
    "teamLeaderName": "张三",
    "caseId": 100,
    "caseName": "案件A",
    "teamDescription": "负责案件A的处理工作",
    "status": "ACTIVE",
    "createTime": "2026-01-09T10:00:00",
    "updateTime": "2026-01-09T10:00:00",
    "members": [
      {
        "id": 1,
        "teamId": 1,
        "caseId": 100,
        "userId": 2,
        "userName": "lisi",
        "userRealName": "李四",
        "teamRole": "律师",
        "permissionLevel": "EDIT",
        "isActive": 1,
        "status": "ACTIVE",
        "createTime": "2026-01-09T10:00:00",
        "permissions": [
          {
            "id": 1,
            "teamMemberId": 1,
            "moduleType": "案件管理",
            "permissionType": "查看",
            "isAllowed": 1,
            "status": "ACTIVE",
            "createTime": "2026-01-09T10:00:00"
          }
        ]
      }
    ]
  }
}
```

---

#### 6. 更新工作团队信息

**功能描述**：更新工作团队的基本信息

**请求URL**：`PUT /work-team/{teamId}`

**请求方法**：PUT

**请求参数**：

| 路径参数 | | | |
|----------|---|---|
| teamId | Long | 是 | 团队ID |

| 请求体参数 | | | |
|-----------|---|---|
| teamName | String | 否 | 团队名称 |
| teamDescription | String | 否 | 团队描述 |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） |

**请求示例**：

```json
{
  "teamName": "案件处理团队A（更新）",
  "teamDescription": "负责案件A的处理工作（更新）",
  "status": "ACTIVE"
}
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "工作团队不存在",
  "data": null
}
```

---

#### 7. 删除工作团队

**功能描述**：删除指定的工作团队

**请求URL**：`DELETE /work-team/{teamId}`

**请求方法**：DELETE

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID（路径参数） |

**请求示例**：

```
DELETE /work-team/1
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "工作团队不存在",
  "data": null
}
```

---

### 二、团队成员管理

#### 8. 添加团队成员

**功能描述**：向指定团队添加成员

**请求URL**：`POST /work-team/{teamId}/member`

**请求方法**：POST

**请求参数**：

| 路径参数 | | | |
|----------|---|---|
| teamId | Long | 是 | 团队ID |

| 请求体参数 | | | |
|-----------|---|---|
| caseId | Long | 是 | 案件ID |
| userId | Long | 是 | 用户ID |
| teamRole | String | 是 | 团队角色 |
| permissionLevel | String | 否 | 权限级别（VIEW/EDIT/ADMIN） |

**请求示例**：

```json
{
  "caseId": 100,
  "userId": 2,
  "teamRole": "律师",
  "permissionLevel": "EDIT"
}
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "memberId": 1
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "权限级别不正确",
  "data": null
}
```

---

#### 9. 团队成员列表

**功能描述**：获取指定团队的所有成员

**请求URL**：`GET /work-team/{teamId}/members`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID（路径参数） |

**请求示例**：

```
GET /work-team/1/members
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "teamId": 1,
      "caseId": 100,
      "userId": 2,
      "teamRole": "律师",
      "permissionLevel": "EDIT",
      "isActive": 1,
      "status": "ACTIVE",
      "createTime": "2026-01-09T10:00:00",
      "updateTime": "2026-01-09T10:00:00"
    }
  ]
}
```

---

#### 10. 移除团队成员

**功能描述**：从指定团队中移除成员

**请求URL**：`DELETE /work-team/{teamId}/member/{memberId}`

**请求方法**：DELETE

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID（路径参数） |
| memberId | Long | 是 | 成员ID（路径参数） |

**请求示例**：

```
DELETE /work-team/1/member/1
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "团队成员不存在",
  "data": null
}
```

---

#### 11. 删除团队成员

**功能描述**：删除指定的团队成员记录

**请求URL**：`DELETE /work-team/work-team-member/{memberId}`

**请求方法**：DELETE

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| memberId | Long | 是 | 成员ID（路径参数） |

**请求示例**：

```
DELETE /work-team/work-team-member/1
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "团队成员不存在",
  "data": null
}
```

---

### 三、团队成员权限管理

#### 12. 获取团队成员权限

**功能描述**：获取指定团队成员的所有权限

**请求URL**：`GET /work-team/work-team-member/{memberId}/permissions`

**请求方法**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| memberId | Long | 是 | 成员ID（路径参数） |

**请求示例**：

```
GET /work-team/work-team-member/1/permissions
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "teamMemberId": 1,
      "moduleType": "案件管理",
      "permissionType": "查看",
      "isAllowed": 1,
      "status": "ACTIVE",
      "createTime": "2026-01-09T10:00:00",
      "updateTime": "2026-01-09T10:00:00"
    }
  ]
}
```

---

#### 13. 更新团队成员权限

**功能描述**：根据权限级别更新团队成员的所有权限

**请求URL**：`PUT /work-team/work-team-member/{memberId}/permission`

**请求方法**：PUT

**请求参数**：

| 路径参数 | | | |
|----------|---|---|
| memberId | Long | 是 | 成员ID |

| 请求体参数 | | | |
|-----------|---|---|
| permissionLevel | String | 是 | 权限级别（VIEW/EDIT/ADMIN） |

**请求示例**：

```json
{
  "permissionLevel": "ADMIN"
}
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "团队成员不存在",
  "data": null
}
```

---

#### 14. 分配团队成员权限

**功能描述**：为指定团队成员分配权限列表

**请求URL**：`POST /work-team/work-team-member/{memberId}/permissions`

**请求方法**：POST

**请求参数**：

| 路径参数 | | | |
|----------|---|---|
| memberId | Long | 是 | 成员ID |

| 请求体参数 | | | |
|-----------|---|---|
| permissions | Array | 是 | 权限列表 |
| permissions[].moduleType | String | 是 | 模块类型 |
| permissions[].permissionType | String | 是 | 权限类型 |
| permissions[].isAllowed | Integer | 是 | 是否允许（0-否，1-是） |

**请求示例**：

```json
{
  "permissions": [
    {
      "moduleType": "案件管理",
      "permissionType": "查看",
      "isAllowed": 1
    },
    {
      "moduleType": "案件管理",
      "permissionType": "编辑",
      "isAllowed": 1
    },
    {
      "moduleType": "资金管理",
      "permissionType": "查看",
      "isAllowed": 0
    }
  ]
}
```

**响应格式**：

**成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 404,
  "message": "团队成员不存在",
  "data": null
}
```

---

## 接口调用注意事项

### 1. 认证与授权

- 所有接口都需要在请求头中携带有效的JWT Token
- Token格式：`Authorization: Bearer {token}`
- Token过期后需要重新登录获取新Token

### 2. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 3. 数据类型说明

- **Long**：长整型，用于ID字段
- **String**：字符串类型
- **Integer**：整型，用于状态、标志位等
- **Boolean**：布尔类型，true/false
- **Array**：数组类型
- **DateTime**：日期时间类型，格式为ISO 8601（如：2026-01-09T10:00:00）

### 4. 状态值说明

#### 团队状态（status）
- `ACTIVE`：激活
- `INACTIVE`：停用
- `DELETED`：删除

#### 权限级别（permissionLevel）
- `VIEW`：查看
- `EDIT`：编辑
- `ADMIN`：管理

#### 成员激活状态（isActive）
- `0`：未激活
- `1`：已激活

### 5. 分页参数说明

- `pageNum`：页码，从1开始
- `pageSize`：每页大小，建议值为10、20、50
- 返回结果中包含`total`（总记录数）和`list`（当前页数据列表）

### 6. 模糊查询说明

- 支持模糊查询的字段：teamName
- 模糊查询使用LIKE操作符，无需添加通配符

### 7. 级联删除说明

- 删除工作团队时，会级联删除该团队的所有成员
- 删除团队成员时，会级联删除该成员的所有权限

### 8. 数据验证

- 所有必填字段不能为空
- 枚举类型字段必须使用预定义的值
- 日期时间字段必须符合ISO 8601格式

### 9. 性能优化建议

- 使用分页接口时，尽量指定合理的pageSize
- 使用详情接口时，尽量使用包含详细信息的接口以减少请求次数
- 避免频繁调用列表接口，建议使用缓存

### 10. 安全建议

- 不要在前端代码中硬编码Token
- 使用HTTPS协议进行通信
- 定期更换Token
- 对敏感数据进行加密传输

---

## 附录

### A. 完整的请求头示例

```http
POST /work-team HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Length: 123

{
  "teamName": "案件处理团队A",
  "teamLeaderId": 1,
  "caseId": 100,
  "teamDescription": "负责案件A的处理工作"
}
```

### B. 完整的响应头示例

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Content-Length: 456

{
  "code": 200,
  "message": "success",
  "data": {
    "teamId": 1
  }
}
```

### C. 常见错误场景及处理

1. **Token过期**
   - 错误码：401
   - 处理方式：重新登录获取新Token

2. **参数校验失败**
   - 错误码：400
   - 处理方式：检查请求参数格式和必填字段

3. **资源不存在**
   - 错误码：404
   - 处理方式：检查ID是否正确，资源是否已被删除

4. **无权限访问**
   - 错误码：403
   - 处理方式：检查用户权限，联系管理员

### D. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始版本，包含工作团队管理、成员管理和权限管理功能 |

---

## 联系方式

如有问题或建议，请联系开发团队。
