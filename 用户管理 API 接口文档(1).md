# 用户管理 API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5779/api/v1`
- **认证方式**: JWT Token (通过请求头 `Authorization: Bearer {token}` 传递)
- **权限要求**: 
  - 管理员接口需要对应权限 (`system:user:edit`, `system:user:query`, `system:user:add`, `system:user:delete`)
  - 用户个人信息修改接口无需特殊权限，登录即可访问

---

## 0. 🔐 个人信息修改接口（用户自己）

### 0.1 修改当前用户手机号

**接口**: `PUT /auth/profile/mobile`

**描述**: 当前登录用户修改自己的手机号

**权限**: 登录用户

**请求体**:
```json
{
  "mobile": "13900139000",
  "smsCode": "123456"
}
```

**参数说明**:
- `mobile` (必填): 新手机号
- `smsCode` (可选): 短信验证码

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/auth/profile/mobile" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "13900139000",
    "smsCode": "123456"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13900139000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

---

### 0.2 修改当前用户邮箱

**接口**: `PUT /auth/profile/email`

**描述**: 当前登录用户修改自己的邮箱

**权限**: 登录用户

**请求体**:
```json
{
  "email": "zhangsan_new@example.com"
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/auth/profile/email" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhangsan_new@example.com"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan_new@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

---

### 0.3 修改当前用户密码

**接口**: `PUT /auth/profile/password`

**描述**: 当前登录用户修改自己的密码（无需提供原密码）

**权限**: 登录用户

**请求体**:
```json
{
  "newPassword": "newpass123"
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/auth/profile/password" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newpass123"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 1. 👤 用户查询接口

### 1.1 根据用户名查询用户

**接口**: `GET /users/username/{username}`

**描述**: 根据用户名查询用户详情

**权限**: `system:user:query`

**请求参数**: 
- `username` (路径参数，必填): 用户名

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/users/username/zhangsan" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T10:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

### 1.2 根据手机号查询用户

**接口**: `GET /users/mobile/{mobile}`

**描述**: 根据手机号查询用户详情

**权限**: `system:user:query`

**请求参数**: 
- `mobile` (路径参数，必填): 手机号

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/users/mobile/13800138000" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T10:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

## 2. ✏️ 用户信息修改接口

### 2.1 更新用户状态

**接口**: `PUT /users/{id}/status`

**描述**: 更新指定用户的状态

**权限**: `system:user:edit`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求体**:
```json
{
  "status": "ACTIVE"
}
```

**状态说明**:
- `ACTIVE`: 正常
- `INACTIVE`: 禁用
- `LOCKED`: 锁定

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/users/1/status" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "用户状态不正确",
  "data": null
}
```

---

### 2.2 更新用户手机号

**接口**: `PUT /users/{id}/mobile`

**描述**: 更新指定用户的手机号

**权限**: `system:user:edit`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求体**:
```json
{
  "mobile": "13900139000",
  "smsCode": "123456"
}
```

**参数说明**:
- `mobile` (必填): 新手机号，格式为 11 位数字
- `smsCode` (可选): 短信验证码

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/users/1/mobile" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "13900139000",
    "smsCode": "123456"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13900139000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "手机号已被使用",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "短信验证码错误或已过期",
  "data": null
}
```

---

### 2.3 更新用户邮箱

**接口**: `PUT /users/{id}/email`

**描述**: 更新指定用户的邮箱

**权限**: `system:user:edit`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求体**:
```json
{
  "email": "zhangsan_new@example.com"
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/users/1/email" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhangsan_new@example.com"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan_new@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "邮箱已被使用",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "邮箱格式不正确",
  "data": null
}
```

---

## 3. 📦 批量操作接口

### 3.1 批量更新用户状态

**接口**: `PUT /users/batch/status`

**描述**: 批量更新多个用户的状态

**权限**: `system:user:edit`

**请求体**:
```json
{
  "userIds": [1, 2, 3, 4, 5],
  "status": "ACTIVE"
}
```

**参数说明**:
- `userIds` (必填): 用户 ID 列表
- `status` (必填): 目标状态 (ACTIVE/INACTIVE/LOCKED)

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/users/batch/status" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [1, 2, 3, 4, 5],
    "status": "ACTIVE"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "用户 ID 列表不能为空",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "用户状态不正确",
  "data": null
}
```

---

## 4. 📋 已有接口回顾

### 4.1 创建用户

**接口**: `POST /users`

**权限**: `system:user:add`

**请求体**:
```json
{
  "username": "zhangsan",
  "password": "Test1234!",
  "realName": "张三",
  "mobile": "13800138000",
  "email": "zhangsan@example.com",
  "phone": "010-12345678",
  "status": "ACTIVE"
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/users" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "Test1234!",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "status": "ACTIVE"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "createTime": "2026-03-10T10:00:00",
    "updateTime": "2026-03-10T10:00:00"
  }
}
```

---

### 4.2 获取用户列表

**接口**: `GET /users`

**请求参数**:
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量
- `sortField` (查询参数，默认 createTime): 排序字段
- `sortOrder` (查询参数，默认 DESC): 排序方向 (ASC/DESC)
- `keyword` (查询参数，可选): 搜索关键词
- `status` (查询参数，可选): 用户状态

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/users?page=1&size=10&keyword=张&status=ACTIVE" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "size": 10,
    "totalPages": 3,
    "users": [
      {
        "id": 1,
        "username": "zhangsan",
        "realName": "张三",
        "mobile": "13800138000",
        "email": "zhangsan@example.com",
        "phone": "010-12345678",
        "isValid": "1",
        "status": "ACTIVE",
        "loginType": "1",
        "lastLoginTime": "2026-03-10T10:00:00",
        "lastLoginIp": "192.168.1.100",
        "loginCount": 25,
        "createTime": "2026-01-01T00:00:00",
        "updateTime": "2026-03-10T10:00:00"
      }
    ]
  }
}
```

---

### 4.3 获取单个用户

**接口**: `GET /users/{id}`

**权限**: `system:user:query`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/users/1" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T10:00:00"
  }
}
```

---

### 4.4 更新用户（全量）

**接口**: `PUT /users/{id}`

**权限**: `system:user:edit`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求体**:
```json
{
  "username": "zhangsan",
  "password": "Test1234!",
  "realName": "张三",
  "mobile": "13800138000",
  "email": "zhangsan@example.com",
  "phone": "010-12345678",
  "status": "ACTIVE"
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/users/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "Test1234!",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "status": "ACTIVE"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

---

### 4.5 部分更新用户

**接口**: `PATCH /users/{id}`

**权限**: `system:user:edit`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求体** (只传需要更新的字段):
```json
{
  "realName": "张三更新",
  "phone": "010-87654321"
}
```

**请求示例**:
```bash
curl -X PATCH "http://localhost:5779/api/v1/users/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "realName": "张三更新",
    "phone": "010-87654321"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三更新",
    "mobile": "13800138000",
    "email": "zhangsan@example.com",
    "phone": "010-87654321",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2026-03-10T10:00:00",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 25,
    "createTime": "2026-01-01T00:00:00",
    "updateTime": "2026-03-10T11:00:00"
  }
}
```

---

### 4.6 删除用户

**接口**: `DELETE /users/{id}`

**权限**: `system:user:delete`

**请求参数**: 
- `id` (路径参数，必填): 用户 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/users/1" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 4.7 获取所有管理员用户

**接口**: `GET /users/admins`

**描述**: 获取所有 role_code 为 ADMIN 的用户基本信息

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/users/admins" \
  -H "Authorization: Bearer {token}"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "mobile": "13800138000",
      "email": "admin@example.com",
      "phone": "010-12345678",
      "isValid": "1",
      "status": "ACTIVE",
      "loginType": "1",
      "lastLoginTime": "2026-03-10T10:00:00",
      "lastLoginIp": "192.168.1.1",
      "loginCount": 100,
      "createTime": "2026-01-01T00:00:00",
      "updateTime": "2026-03-10T10:00:00"
    }
  ]
}
```

---

## 5. 数据字典

### 5.1 用户状态 (status)

| 状态码 | 说明 | 描述 |
|--------|------|------|
| `ACTIVE` | 正常 | 用户可以正常登录和使用系统 |
| `INACTIVE` | 禁用 | 用户被禁用，无法登录 |
| `LOCKED` | 锁定 | 用户被临时锁定，无法登录 |
| `DELETED` | 已删除 | 用户已被逻辑删除 |

### 5.2 是否有效 (isValid)

| 值 | 说明 |
|----|------|
| `1` | 有效 |
| `0` | 无效 |

### 5.3 登录类型 (loginType)

| 值 | 说明 |
|----|------|
| `1` | 账号密码登录 |
| `2` | 短信验证码登录 |
| `3` | 第三方登录 |

---

## 6. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 7. 注意事项

1. **管理员修改操作**需要 `system:user:edit` 权限
2. **用户个人信息修改**接口（`/auth/profile/*`）无需特殊权限，登录即可访问
3. **删除操作**是逻辑删除，会将 `is_deleted` 标记为 `true`，`status` 设置为 `DELETED`
4. **更新状态为 LOCKED 或 INACTIVE**时，会自动撤销该用户的所有 Token
5. **手机号和邮箱**具有唯一性，更新时会检查是否已被其他用户使用
6. **更新手机号**时可以选择提供短信验证码进行验证
7. **批量更新状态**时，如果部分用户不存在或已删除，会跳过这些用户继续处理
8. **查询接口**默认过滤掉已删除的用户（`is_deleted = false`）
9. **密码长度**必须在 6-20 位之间，且必须包含字母和数字
10. **手机号和邮箱**不需要进行格式校验

---

## 8. 接口变更说明

本次新增的接口：
- ✅ `GET /users/username/{username}` - 根据用户名查询
- ✅ `GET /users/mobile/{mobile}` - 根据手机号查询
- ✅ `PUT /users/{id}/status` - 更新用户状态
- ✅ `PUT /users/{id}/mobile` - 更新用户手机号
- ✅ `PUT /users/{id}/email` - 更新用户邮箱
- ✅ `PUT /users/batch/status` - 批量更新用户状态
- ✅ `PUT /auth/profile/mobile` - 用户修改自己的手机号
- ✅ `PUT /auth/profile/email` - 用户修改自己的邮箱
- ✅ `PUT /auth/profile/password` - 用户修改自己的密码（无需原密码）
