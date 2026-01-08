# 后端权限API与数据库汇总

> 生成日期：2026年1月7日

## 一、权限管理系统概述

本文档详细列出了后端系统中所有与权限管理设计相关的API接口，包括API端点URL、请求方法、请求参数、响应格式及状态码。同时明确了每个API接口所关联的数据表名称，并详细说明了每个数据表支持的具体操作类型。

### 1.1 权限管理架构

系统采用基于RBAC（Role-Based Access Control）的权限管理模型，主要包含以下核心组件：

- **用户（User）**：系统使用者
- **角色（Role）**：权限的集合，代表一组权限的逻辑分组
- **权限（Permission）**：具体的操作权限，如菜单权限、按钮权限等
- **用户角色关联（UserRole）**：用户与角色的多对多关系
- **角色权限关联（RolePermission）**：角色与权限的多对多关系

### 1.2 权限校验机制

系统通过以下组件实现权限校验：

- **@RequiresPermission注解**：用于标注需要特定权限才能访问的接口
- **PermissionInterceptor权限拦截器**：在请求到达控制器之前进行权限校验
- **JwtInterceptor令牌拦截器**：验证用户身份并解析用户信息
- **CasePermissionUtils权限工具类**：提供便捷的权限判断方法

## 二、认证相关API

### 2.1 用户登录

**API端点**：`/api/web/login`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码（明文，接口内部进行MD5加密） |
| deviceId | String | 否 | 设备ID，用于设备绑定 |
| deviceInfo | String | 否 | 设备信息 |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpire": 900000,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenExpire": 604800000,
    "user": {
      "uPid": 1,
      "uUser": "admin",
      "uName": "管理员",
      "uDept": "破产管理部",
      "uTel": "13800138000",
      "uMobile": "13800138000",
      "uEmail": "admin@example.com"
    }
  }
}
```

**响应格式**（失败）：

```json
{
  "status": "0",
  "msg": "用户名或密码错误",
  "data": null
}
```

**状态码**：
- 200：请求成功
- 401：认证失败（用户名密码错误、用户被禁用、设备未绑定等）

**关联数据表**：`user`（用户表）、`login_record`（登录记录表）、`token`（令牌表）

**数据表操作类型**：
- `user`：查询（根据用户名查询用户信息）、更新（更新登录信息）
- `login_record`：新增（记录登录日志）
- `token`：新增（存储访问令牌和刷新令牌）

---

### 2.2 发送登录验证码

**API端点**：`/api/web/sendLoginSms`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| mobile | String | 是 | 手机号（格式：1[3-9]开头的11位数字） |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "验证码发送成功",
  "data": null
}
```

**响应格式**（失败）：

```json
{
  "status": "0",
  "msg": "手机号格式不正确",
  "data": null
}
```

**关联数据表**：`user`（用户表）、`sms_code`（短信验证码表）

**数据表操作类型**：
- `user`：查询（根据手机号查找用户）
- `sms_code`：新增（存储验证码）、查询（验证验证码）

---

### 2.3 手机号登录

**API端点**：`/api/web/loginBySms`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| mobile | String | 是 | 手机号 |
| smsCode | String | 是 | 验证码（6位数字） |
| deviceId | String | 否 | 设备ID |
| deviceInfo | String | 否 | 设备信息 |

**响应格式**：与密码登录相同

**关联数据表**：`user`（用户表）、`sms_code`（短信验证码表）、`login_record`（登录记录表）、`token`（令牌表）

**数据表操作类型**：
- `user`：查询（根据手机号查询）、更新（更新登录信息）
- `sms_code`：查询（验证验证码）
- `login_record`：新增（记录登录日志）
- `token`：新增（存储令牌）

---

### 2.4 刷新令牌

**API端点**：`/api/web/refreshToken`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refreshToken | String | 是 | 刷新令牌 |
| deviceId | 设备ID |

 String | 否 |**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "令牌刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpire": 900000,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenExpire": 604800000
  }
}
```

**关联数据表**：`token`（令牌表）

**数据表操作类型**：
- `token`：查询（验证刷新令牌）、更新（更新令牌信息）、删除（使旧令牌失效）

---

### 2.5 退出登录

**API端点**：`/api/web/logout`

**请求方法**：POST

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | String | 是 | Bearer {accessToken} |

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refreshToken | String | 否 | 刷新令牌 |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "登出成功",
  "data": null
}
```

**关联数据表**：`token`（令牌表）

**数据表操作类型**：
- `token`：删除（使令牌失效）

---

### 2.6 获取当前用户信息

**API端点**：`/api/web/currentUser`

**请求方法**：GET

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | String | 是 | Bearer {accessToken} |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": {
    "uPid": 1,
    "uUser": "admin",
    "uName": "管理员",
    "uDept": "破产管理部",
    "uTel": "13800138000",
    "uMobile": "13800138000",
    "uEmail": "admin@example.com"
  }
}
```

**关联数据表**：`user`（用户表）

**数据表操作类型**：
- `user`：查询（根据用户ID查询用户信息）

---

### 2.7 获取用户权限和菜单

**API端点**：`/api/web/permissions`

**请求方法**：GET

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | String | 是 | Bearer {accessToken} |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": {
    "permissions": [
      "case:view",
      "case:edit",
      "case:delete",
      "admin:view",
      "user:role:assign"
    ],
    "menus": [
      {
        "permId": 1,
        "permCode": "system",
        "permName": "系统管理",
        "permType": "1",
        "path": "/system",
        "component": "Layout",
        "icon": "setting",
        "sortOrder": 1,
        "children": [
          {
            "permId": 2,
            "permCode": "system:user",
            "permName": "用户管理",
            "permType": "1",
            "path": "/system/user",
            "component": "system/user/index",
            "icon": "user",
            "sortOrder": 1,
            "children": []
          }
        ]
      }
    ]
  }
}
```

**关联数据表**：`user`（用户表）、`role`（角色表）、`permission`（权限表）、`user_role`（用户角色关联表）、`role_permission`（角色权限关联表）

**数据表操作类型**：
- `user`：查询（根据用户ID查询）
- `role`：查询（查询用户角色）
- `permission`：查询（查询所有权限）
- `user_role`：查询（查询用户角色关联）
- `role_permission`：查询（查询角色权限关联）

## 三、用户角色管理API

### 3.1 获取用户角色列表

**API端点**：`/api/web/userRole/getRolesByUserId`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": [
    {
      "roleId": 1,
      "roleCode": "ADMIN",
      "roleName": "管理员",
      "roleDesc": "系统管理员",
      "isSystem": "1",
      "status": "1",
      "sortOrder": 1
    }
  ]
}
```

**关联数据表**：`role`（角色表）、`user_role`（用户角色关联表）

**数据表操作类型**：
- `role`：查询
- `user_role`：查询（根据用户ID查询角色ID列表）

---

### 3.2 分配角色

**API端点**：`/api/web/userRole/assignRole`

**请求方法**：POST

**权限要求**：需要`user:role:assign`权限

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户ID |
| roleId | Integer | 是 | 角色ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "角色分配成功",
  "data": null
}
```

**响应格式**（失败）：

```json
{
  "status": "0",
  "msg": "角色已分配，无需重复分配",
  "data": null
}
```

**关联数据表**：`user_role`（用户角色关联表）

**数据表操作类型**：
- `user_role`：查询（检查是否已分配）、新增（分配角色）

---

### 3.3 移除角色

**API端点**：`/api/web/userRole/removeRole`

**请求方法**：POST

**权限要求**：需要`user:role:assign`权限

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户ID |
| roleId | Integer | 是 | 角色ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "角色移除成功",
  "data": null
}
```

**关联数据表**：`user_role`（用户角色关联表）

**数据表操作类型**：
- `user_role`：删除（移除用户角色关联）

---

### 3.4 设置用户角色（批量）

**API端点**：`/api/web/userRole/setUserRoles`

**请求方法**：POST

**权限要求**：需要`user:role:assign`权限

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Content-Type | String | 是 | application/json |

**请求参数**（JSON Body）：

```json
{
  "userId": 1,
  "roleIds": [1, 2, 3]
}
```

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "用户角色设置成功，共分配 3 个角色",
  "data": null
}
```

**关联数据表**：`user_role`（用户角色关联表）

**数据表操作类型**：
- `user_role`：删除（删除用户所有角色）、新增（批量插入角色）

---

### 3.5 获取所有角色列表

**API端点**：`/api/web/userRole/getAllRoles`

**请求方法**：GET

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": [
    {
      "roleId": 1,
      "roleCode": "SUPER_ADMIN",
      "roleName": "超级管理员",
      "roleDesc": "拥有所有权限",
      "isSystem": "1",
      "status": "1",
      "sortOrder": 1
    },
    {
      "roleId": 2,
      "roleCode": "ADMIN",
      "roleName": "管理员",
      "roleDesc": "系统管理员",
      "isSystem": "1",
      "status": "1",
      "sortOrder": 2
    },
    {
      "roleId": 3,
      "roleCode": "USER",
      "roleName": "普通用户",
      "roleDesc": "普通用户角色",
      "isSystem": "1",
      "status": "1",
      "sortOrder": 3
    }
  ]
}
```

**关联数据表**：`role`（角色表）

**数据表操作类型**：
- `role`：查询（查询所有角色）

---

### 3.6 根据角色代码获取用户列表

**API端点**：`/api/web/userRole/getUsersByRoleCode`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| roleCode | String | 是 | 角色代码（如：ADMIN、SUPER_ADMIN、USER） |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": [
    {
      "uPid": 1,
      "uUser": "admin",
      "uName": "管理员",
      "uDept": "破产管理部",
      "uTel": "13800138000",
      "uMobile": "13800138000"
    }
  ]
}
```

**关联数据表**：`user`（用户表）、`role`（角色表）、`user_role`（用户角色关联表）

**数据表操作类型**：
- `user`：查询
- `role`：查询
- `user_role`：查询（根据角色ID查询用户ID列表）

---

### 3.7 检查用户是否拥有特定角色

**API端点**：`/api/web/userRole/checkUserRole`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户ID |
| roleCode | String | 是 | 角色代码 |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": {
    "hasRole": true
  }
}
```

**关联数据表**：`user_role`（用户角色关联表）、`role`（角色表）

**数据表操作类型**：
- `user_role`：查询（根据用户ID查询角色）
- `role`：查询

---

### 3.8 获取用户角色ID列表

**API端点**：`/api/web/userRole/getUserRoleIds`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取成功",
  "data": [1, 2, 3]
}
```

**关联数据表**：`user_role`（用户角色关联表）

**数据表操作类型**：
- `user_role`：查询（根据用户ID查询角色ID列表）

---

### 3.9 更新用户角色（老系统兼容）

**API端点**：`/api/web/userRole/updateTBUserRole`

**请求方法**：POST

**权限要求**：需要`user:role:assign`权限

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| u_pid | Integer | 是 | 用户ID |
| role_id | Integer | 是 | 角色ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "用户权限修改成功",
  "data": null
}
```

**关联数据表**：`user_role`（用户角色关联表）

**数据表操作类型**：
- `user_role`：更新（更新用户角色）

## 四、用户管理API

### 4.1 添加用户

**API端点**：`/api/web/addUser`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uUser | String | 是 | 用户名（唯一） |
| uPwd | String | 是 | 密码（明文，接口内部加密） |
| uName | String | 否 | 真实姓名 |
| uDeptid | Integer | 否 | 部门ID |
| uDept | String | 否 | 部门名称 |
| uTel | String | 否 | 电话 |
| uMobile | String | 否 | 手机号 |
| uEmail | String | 否 | 邮箱 |
| uRemark | String | 否 | 备注 |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "添加用户成功",
  "data": {
    "uPid": 100,
    "uUser": "testuser",
    "uName": "测试用户",
    "uDept": "测试部门"
  }
}
```

**关联数据表**：`user`（用户表）

**数据表操作类型**：
- `user`：新增

---

### 4.2 根据部门ID获取用户列表

**API端点**：`/api/web/getUserByDeptid`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptId | Integer | 是 | 部门ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取用户列表成功",
  "data": [
    {
      "uPid": 1,
      "uUser": "admin",
      "uName": "管理员",
      "uDept": "破产管理部"
    }
  ]
}
```

**关联数据表**：`user`（用户表）

**数据表操作类型**：
- `user`：查询（根据部门ID查询用户）

---

### 4.3 获取用户登录记录

**API端点**：`/api/web/getLoginRecords`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uPid | String | 是 | 用户ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取登录记录成功",
  "data": [
    {
      "id": 1,
      "userId": "1",
      "loginTime": "2026-01-07 10:00:00",
      "loginIp": "192.168.1.100",
      "deviceInfo": "Mozilla/5.0...",
      "loginType": "1"
    }
  ]
}
```

**关联数据表**：`login_record`（登录记录表）

**数据表操作类型**：
- `login_record`：查询（根据用户ID查询登录记录）

---

### 4.4 获取用户最新登录记录

**API端点**：`/api/web/getLastLoginRecord`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uPid | String | 是**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": " | 用户ID |

获取最新登录记录成功",
  "data": {
    "id": 1,
    "userId": "1",
    "loginTime": "2026-01-07 10:00:00",
    "loginIp": "192.168.1.100"
  }
}
```

**关联数据表**：`login_record`（登录记录表）

**数据表操作类型**：
- `login_record`：查询（根据用户ID查询最新登录记录）

## 五、管理员管理API

### 5.1 获取所有管理员列表

**API端点**：`/api/web/getAllAdministrator`

**请求方法**：GET

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取管理人列表成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 10001,
      "sepName": "破产管理人A",
      "sepPhone": "13800138000",
      "sepAddress": "北京市朝阳区...",
      "lsswsid": "LSSWS001"
    }
  ]
}
```

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：查询（查询所有管理员）

---

### 5.2 根据ID获取管理员信息

**API端点**：`/api/web/getAdministratorById`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepId | Integer | 是 | 管理人ID（单据号） |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "获取管理人信息成功",
  "data": {
    "sepId": 1,
    "sepLd": 10001,
    "sepName": "破产管理人A",
    "sepPhone": "13800138000"
  }
}
```

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：查询（根据ID查询管理员）

---

### 5.3 添加管理员

**API端点**：`/api/web/addAdministrator`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepLd | Integer | 是 | 登录ID |
| sepName | String | 是 | 管理人名称 |
| sepPhone | String | 否 | 联系电话 |
| sepAddress | String | 否 | 地址 |
| lsswsid | String | 否 | 律师事务所ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "添加管理人成功",
  "data": null
}
```

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：新增

---

### 5.4 更新管理员信息

**API端点**：`/api/web/updateAdministrator`

**请求方法**：POST

**请求参数**（JSON Body）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepId | Integer | 是 | 管理人ID |
| sepName | String | 否 | 管理人名称 |
| sepPhone | String | 否 | 联系电话 |
| sepAddress | String | 否 | 地址 |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "更新管理人成功",
  "data": null
}
```

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：更新

---

### 5.5 删除管理员

**API端点**：`/api/web/deleteAdministrator`

**请求方法**：POST

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepId | Integer | 是 | 管理人ID |

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "删除管理人成功",
  "data": null
}
```

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：删除

---

### 5.6 根据登录ID获取管理人列表

**API端点**：`/api/web/getAdministratorBySepLd`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepLd | Integer | 是 | 登录ID |

**关联数据表**：`administrator`（管理人表）

**数据表操作类型**：
- `administrator`：查询（根据登录ID查询管理员）

---

### 5.7 根据管理人ID获取用户列表

**API端点**：`/api/web/getUsersBySepId`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sepId | Integer | 是 | 管理人ID |

**关联数据表**：`administrator`（管理人表）、`user`（用户表）

**数据表操作类型**：
- `administrator`：查询
- `user`：查询

---

### 5.8 根据律师事务所ID获取用户列表

**API端点**：`/api/web/getUsersByLsswsid`

**请求方法**：GET

**请求参数**（Query）：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| lsswsid | String | 是 | 律师事务所ID |

**关联数据表**：`user`（用户表）

**数据表操作类型**：
- `user`：查询（根据律师事务所ID查询用户）

## 六、权限测试API

### 6.1 无需权限的测试接口

**API端点**：`/api/test/permission/no-perm`

**请求方法**：GET

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "无需权限的接口访问成功",
  "data": null
}
```

**关联数据表**：无

---

### 6.2 需要特定权限的测试接口

**API端点**：`/api/test/permission/require-perm`

**请求方法**：GET

**权限要求**：需要`test:permission:view`权限

**响应格式**（成功）：

```json
{
  "status": "1",
  "msg": "需要权限的接口访问成功",
  "data": null
}
```

**响应格式**（无权限）：

```json
{
  "status": "0",
  "error": "无权访问该资源",
  "code": 403,
  "data": null
}
```

---

### 6.3 需要管理员权限的测试接口

**API端点**：`/api/test/permission/admin-only`

**请求方法**：GET

**权限要求**：需要`admin:view`权限

**关联数据表**：无

---

### 6.4 需要超级管理员权限的测试接口

**API端点**：`/api/test/permission/super-admin`

**请求方法**：GET

**权限要求**：需要`super_admin:view`权限

**关联数据表**：无

## 七、数据库表结构汇总

### 7.1 用户表（user）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| uPid | Integer | 用户ID（主键） | 查询、新增、更新 |
| uUser | String | 用户名（唯一） | 查询、新增、更新 |
| uName | String | 真实姓名 | 查询、新增、更新 |
| uPwd | String | 密码（MD5加密） | 查询、新增、更新 |
| uDeptid | Integer | 部门ID | 查询、新增、更新 |
| uDept | String | 部门名称 | 查询、新增、更新 |
| uTel | String | 电话 | 查询、新增、更新 |
| uMobile | String | 手机号 | 查询、新增、更新 |
| uEmail | String | 邮箱 | 查询、新增、更新 |
| uStatus | String | 用户状态（1-正常 2-锁定 3-禁用） | 查询、更新 |
| uLoginType | String | 登录方式（1-用户名 2-手机号） | 查询 |
| uBindDevice | String | 绑定设备ID | 查询、更新 |
| uLastLoginTime | Date | 最后登录时间 | 查询、更新 |
| uLastLoginIp | String | 最后登录IP | 查询、更新 |
| uLoginCount | Integer | 登录次数 | 查询、更新 |
| uPwdErrorCount | Integer | 密码错误次数 | 查询、更新 |
| uPwdErrorTime | Date | 最后密码错误时间 | 查询、更新 |
| uPwdExpireTime | Date | 密码过期时间 | 查询、更新 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）

---

### 7.2 角色表（role）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| roleId | Integer | 角色ID（主键） | 查询、新增、更新、删除 |
| roleCode | String | 角色代码（唯一） | 查询、新增、更新 |
| roleName | String | 角色名称 | 查询、新增、更新 |
| roleDesc | String | 角色描述 | 查询、新增、更新 |
| isSystem | String | 是否系统角色（1-是 0-否） | 查询、新增、更新 |
| status | String | 状态（1-启用 0-禁用） | 查询、新增、更新 |
| sortOrder | Integer | 排序号 | 查询、新增、更新 |
| sepAuser | String | 创建人 | 查询、新增、更新 |
| sepAdate | Date | 创建时间 | 查询、新增、更新 |
| sepEuser | String | 更新人 | 查询、更新 |
| sepEdate | Date | 更新时间 | 查询、更新 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.3 权限表（permission）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| permId | Integer | 权限ID（主键） | 查询、新增、更新、删除 |
| permCode | String | 权限代码（唯一） | 查询、新增、更新 |
| permName | String | 权限名称 | 查询、新增、更新 |
| permType | String | 权限类型（1-菜单 2-按钮 3-接口） | 查询、新增、更新 |
| parentId | Integer | 父级权限ID | 查询、新增、更新 |
| path | String | 路由路径 | 查询、新增、更新 |
| component | String | 组件路径 | 查询、新增、更新 |
| icon | String | 图标 | 查询、新增、更新 |
| sortOrder | Integer | 排序号 | 查询、新增、更新 |
| status | String | 状态（1-启用 0-禁用） | 查询、新增、更新 |
| isExternal | String | 是否外链（1-是 0-否） | 查询、新增、更新 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.4 用户角色关联表（user_role）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| userId | Integer | 用户ID | 查询、新增、删除 |
| roleId | Integer | 角色ID | 查询、新增、删除 |

**支持的操作类型**：查询（Query）、新增（Insert）、删除（Delete）

---

### 7.5 角色权限关联表（role_permission）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| roleId | Integer | 角色ID | 查询、新增、删除 |
| permId | Integer | 权限ID | 查询、新增、删除 |

**支持的操作类型**：查询（Query）、新增（Insert）、删除（Delete）

---

### 7.6 登录记录表（login_record）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| id | Integer | 记录ID（主键） | 查询、新增 |
| userId | String | 用户ID | 查询、新增 |
| loginTime | Date | 登录时间 | 查询、新增 |
| loginIp | String | 登录IP | 查询、新增 |
| deviceInfo | String | 设备信息 | 查询、新增 |
| loginType | String | 登录方式（1-用户名 2-手机号） | 查询、新增 |
| status | String | 状态（1-成功 0-失败） | 查询、新增 |

**支持的操作类型**：查询（Query）、新增（Insert）

---

### 7.7 令牌表（token）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| token | String | 令牌（主键） | 查询、新增、删除、更新 |
| userId | Integer | 用户ID | 查询、新增、更新 |
| deviceId | String | 设备ID | 查询、新增、更新 |
| tokenType | String | 令牌类型（1-accessToken 2-refreshToken） | 查询、新增 |
| expireTime | Date | 过期时间 | 查询、新增、更新 |
| status | String | 状态（1-有效 0-无效） | 查询、更新、删除 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.8 短信验证码表（sms_code）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| id | Integer | 记录ID（主键） | 查询、新增、删除 |
| mobile | String | 手机号 | 查询、新增、删除 |
| code | String | 验证码 | 查询、新增 |
| type | String | 验证码类型（1-登录 2-注册 3-重置密码） | 查询、新增 |
| expireTime | Date | 过期时间 | 查询、新增 |
| status | String | 状态（1-未使用 0-已使用） | 查询、新增、更新、删除 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.9 管理人表（administrator）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| sepId | Integer | 管理人ID（主键） | 查询、新增、更新、删除 |
| sepLd | Integer | 登录ID | 查询、新增、更新 |
| sepName | String | 管理人名称 | 查询、新增、更新 |
| sepPhone | String | 联系电话 | 查询、新增、更新 |
| sepAddress | String | 地址 | 查询、新增、更新 |
| lsswsid | String | 律师事务所ID | 查询、新增、更新 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.10 工作组权限表（work_team_permission）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| id | Integer | 记录ID（主键） | 查询、新增、更新、删除 |
| teamMemberId | Integer | 工作组成员ID | 查询、新增、更新、删除 |
| moduleType | String | 模块类型 | 查询、新增、更新、删除 |
| permissionType | String | 权限类型（VIEW/EDIT/DELETE） | 查询、新增、更新、删除 |
| isAllowed | Boolean | 是否允许 | 查询、新增、更新、删除 |

**支持的操作类型**：查询（Query）、新增（Insert）、更新（Update）、删除（Delete）

---

### 7.11 工作组角色字典表（work_team_role_dict）

| 字段名 | 类型 | 说明 | 操作类型 |
|--------|------|------|----------|
| roleCode | String | 角色代码（主键） | 查询 |
| roleName | String | 角色名称 | 查询 |
| roleDesc | String | 角色描述 | 查询 |
| sortOrder | Integer | 排序号 | 查询 |
| status | String | 状态 | 查询 |

**支持的操作类型**：查询（Query）

## 八、权限编码规范

### 8.1 权限编码格式

系统采用冒号分隔的权限编码格式：`模块:操作:对象`

**示例权限编码**：

| 权限编码 | 说明 | 关联角色 |
|----------|------|----------|
| case:view | 查看案件 | 普通用户及以上 |
| case:edit | 编辑案件 | 案件管理员及以上 |
| case:delete | 删除案件 | 管理员及以上 |
| case:view:all | 查看所有案件 | 管理员及以上 |
| case:review | 审核案件 | 审核员及以上 |
| user:role:assign | 分配用户角色 | 管理员及以上 |
| admin:view | 访问管理员功能 | 管理员及以上 |
| super_admin:view | 访问超级管理员功能 | 超级管理员 |

### 8.2 角色编码

| 角色编码 | 角色名称 | 权限级别 |
|----------|----------|----------|
| SUPER_ADMIN | 超级管理员 | 最高（可绕过所有权限检查） |
| ADMIN | 管理员 | 高（管理功能） |
| USER | 普通用户 | 低（基本功能） |

## 九、响应格式统一规范

### 9.1 成功响应

```json
{
  "status": "1",
  "msg": "操作成功",
  "data": { }
}
```

### 9.2 失败响应

```json
{
  "status": "0",
  "msg": "错误信息描述",
  "data": null
}
```

### 9.3 认证失败响应

```json
{
  "status": "0",
  "msg": "未提供认证令牌",
  "code": 401,
  "data": null
}
```

### 9.4 权限不足响应

```json
{
  "status": "0",
  "error": "无权访问该资源",
  "code": 403,
  "data": null
}
```

## 十、总结

本文档详细列出了后端权限管理系统的所有API接口，包括：

1. **认证相关API**（5个）：登录、登出、令牌刷新、获取当前用户信息、获取权限
2. **用户角色管理API**（9个）：获取角色、分配角色、移除角色、设置用户角色等
3. **用户管理API**（4个）：添加用户、获取用户列表、登录记录等
4. **管理员管理API**（8个）：管理人的增删改查及用户关联
5. **权限测试API**（4个）：测试不同权限级别的接口

涉及的核心数据表包括：`user`、`role`、`permission`、`user_role`、`role_permission`、`login_record`、`token`、`sms_code`、`administrator`、`work_team_permission`、`work_team_role_dict`等11张表。

系统采用JWT令牌进行身份认证，结合基于RBAC的权限模型，通过`@RequiresPermission`注解和`PermissionInterceptor`拦截器实现细粒度的权限控制。
