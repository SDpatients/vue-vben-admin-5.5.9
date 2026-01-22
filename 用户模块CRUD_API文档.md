# 用户模块CRUD API文档

## 概述

本文档描述了用户模块的完整CRUD API系统，包括用户创建、查询、更新和删除等功能。

## 技术栈

- **后端框架**: Spring Boot 2.6.13
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA
- **安全框架**: Spring Security + JWT
- **API文档**: Swagger/OpenAPI 3.0
- **缓存**: Redis
- **测试**: JUnit 5, Mockito

## 基础信息

- **Base URL**: `http://192.168.0.120:8080`
- **API前缀**: `/api/users`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证说明

所有API端点（除了认证相关）都需要在请求头中携带JWT Token：

```
Authorization: Bearer {access_token}
```

## 数据模型

### User实体

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 用户ID（自动生成） |
| username | String | 是 | 用户名（3-50字符，唯一） |
| password | String | 是 | 密码（加密存储） |
| realName | String | 是 | 真实姓名 |
| mobile | String | 是 | 手机号（唯一） |
| email | String | 否 | 邮箱（唯一） |
| phone | String | 否 | 电话号码 |
| status | String | 否 | 用户状态（ACTIVE/LOCKED/INACTIVE/DELETED） |
| loginType | Character | 否 | 登录类型 |
| lastLoginTime | LocalDateTime | 否 | 最后登录时间 |
| lastLoginIp | String | 否 | 最后登录IP |
| loginCount | Integer | 否 | 登录次数 |
| createTime | LocalDateTime | 是 | 创建时间 |
| updateTime | LocalDateTime | 是 | 更新时间 |

## API端点

### 1. 创建用户

**端点**: `POST /api/users`

**权限要求**: `user:create`

**请求频率限制**: 10次/分钟

**请求体**:

```json
{
  "username": "newuser",
  "password": "NewUser@123",
  "realName": "新用户",
  "mobile": "13900139000",
  "email": "newuser@example.com",
  "phone": "010-12345678",
  "status": "ACTIVE"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| username | String | 是 | 3-50字符，唯一 |
| password | String | 是 | 8-20字符，必须包含大小写字母、数字和特殊字符 |
| realName | String | 是 | 最大50字符 |
| mobile | String | 是 | 有效的手机号格式，唯一 |
| email | String | 否 | 有效的邮箱格式，唯一 |
| phone | String | 否 | 有效的电话号码格式 |
| status | String | 否 | ACTIVE/LOCKED/INACTIVE，默认ACTIVE |

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "newuser",
    "realName": "新用户",
    "mobile": "13900139000",
    "email": "newuser@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": null,
    "lastLoginIp": null,
    "loginCount": 0,
    "createTime": "2024-01-09T10:00:00",
    "updateTime": "2024-01-09T10:00:00"
  }
}
```

**错误响应**:

- 400 用户名已存在
- 400 手机号已注册
- 400 邮箱已注册
- 400 参数验证失败

### 2. 获取用户列表

**端点**: `GET /api/users`

**权限要求**: `user:read`

**请求频率限制**: 50次/分钟

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码（从1开始） |
| size | Integer | 否 | 10 | 每页数量（1-100） |
| sortField | String | 否 | createTime | 排序字段 |
| sortOrder | String | 否 | DESC | 排序方向（ASC/DESC） |
| keyword | String | 否 | - | 搜索关键词（用户名/姓名/手机号） |
| status | String | 否 | - | 用户状态筛选 |

**请求示例**:

```
GET /api/users?page=1&size=10&sortField=createTime&sortOrder=DESC&status=ACTIVE
```

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 10,
    "totalPages": 10,
    "users": [
      {
        "id": 1,
        "username": "user1",
        "realName": "用户1",
        "mobile": "13800138001",
        "email": "user1@example.com",
        "phone": "010-12345678",
        "isValid": "1",
        "status": "ACTIVE",
        "loginType": "1",
        "lastLoginTime": "2024-01-09T09:00:00",
        "lastLoginIp": "192.168.1.1",
        "loginCount": 5,
        "createTime": "2024-01-01T10:00:00",
        "updateTime": "2024-01-09T09:00:00"
      }
    ]
  }
}
```

### 3. 获取单个用户

**端点**: `GET /api/users/{id}`

**权限要求**: `user:read`

**请求频率限制**: 100次/分钟

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求示例**:

```
GET /api/users/1
```

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "user1",
    "realName": "用户1",
    "mobile": "13800138001",
    "email": "user1@example.com",
    "phone": "010-12345678",
    "isValid": "1",
    "status": "ACTIVE",
    "loginType": "1",
    "lastLoginTime": "2024-01-09T09:00:00",
    "lastLoginIp": "192.168.1.1",
    "loginCount": 5,
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-09T09:00:00"
  }
}
```

**错误响应**:

- 404 用户不存在

### 4. 更新用户（全量更新）

**端点**: `PUT /api/users/{id}`

**权限要求**: `user:update`

**请求频率限制**: 20次/分钟

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求体**:

```json
{
  "username": "updateduser",
  "password": "Updated@123",
  "realName": "更新后的用户",
  "mobile": "13900139999",
  "email": "updated@example.com",
  "phone": "010-87654321",
  "status": "ACTIVE"
}
```

**注意**: 此接口为全量更新，所有字段都会被更新。如果某个字段不需要更新，请使用PATCH接口。

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "updateduser",
    "realName": "更新后的用户",
    "mobile": "13900139999",
    "email": "updated@example.com",
    "phone": "010-87654321",
    "status": "ACTIVE",
    "updateTime": "2024-01-09T11:00:00"
  }
}
```

**错误响应**:

- 400 用户名已存在
- 400 手机号已被使用
- 400 邮箱已被使用
- 404 用户不存在

### 5. 部分更新用户

**端点**: `PATCH /api/users/{id}`

**权限要求**: `user:update`

**请求频率限制**: 20次/分钟

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求体**:

```json
{
  "realName": "部分更新的用户",
  "phone": "010-55555555"
}
```

**注意**: 此接口为部分更新，只更新请求体中包含的字段。

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "user1",
    "realName": "部分更新的用户",
    "mobile": "13800138001",
    "email": "user1@example.com",
    "phone": "010-55555555",
    "status": "ACTIVE",
    "updateTime": "2024-01-09T11:00:00"
  }
}
```

**错误响应**:

- 400 用户名已存在
- 400 手机号已被使用
- 400 邮箱已被使用
- 404 用户不存在

### 6. 删除用户

**端点**: `DELETE /api/users/{id}`

**权限要求**: `user:delete`

**请求频率限制**: 10次/分钟

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 用户ID |

**请求示例**:

```
DELETE /api/users/1
```

**成功响应** (200):

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**注意**: 此接口为逻辑删除，用户状态会被设置为DELETED，isDeleted字段会被设置为true，但数据不会从数据库中物理删除。

**错误响应**:

- 404 用户不存在

## 统一错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 安全特性

### 1. 密码安全

- 密码使用BCrypt算法加密存储
- 密码强度要求：8-20字符，必须包含大小写字母、数字和特殊字符
- 密码修改后会重置密码错误计数

### 2. 请求频率限制

- 创建用户：10次/分钟
- 获取用户列表：50次/分钟
- 获取单个用户：100次/分钟
- 更新用户：20次/分钟
- 删除用户：10次/分钟

### 3. 权限控制

- `user:create`: 创建用户权限
- `user:read`: 读取用户权限
- `user:update`: 更新用户权限
- `user:delete`: 删除用户权限

### 4. 数据验证

- 用户名：3-50字符，唯一
- 手机号：有效的手机号格式，唯一
- 邮箱：有效的邮箱格式，唯一
- 密码：8-20字符，必须包含大小写字母、数字和特殊字符

## 性能优化

### 1. 数据库索引

- `idx_status`: 状态字段索引
- `idx_create_time`: 创建时间索引

### 2. 分页查询

- 支持分页查询，避免一次性加载大量数据
- 最大每页数量限制为100条

### 3. 缓存机制

- 使用Redis缓存用户数据（可选）
- 请求频率限制使用Redis实现

## 测试

### 单元测试

运行单元测试：

```bash
mvn test -Dtest=UserServiceCRUDTest
```

### 集成测试

运行集成测试：

```bash
mvn test -Dtest=UserControllerCRUDIntegrationTest
```

### 所有测试

运行所有测试：

```bash
mvn test
```

## 部署说明

### 环境要求

- JDK 11+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 配置文件

在 `application.yml` 中配置数据库连接和Redis连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/law_db?useSSL=false&serverTimezone=UTC
    username: root
    password: your_password
  
  redis:
    host: localhost
    port: 6379
    password: your_redis_password
```

### 启动应用

```bash
mvn clean package
java -jar target/lawbackend2-0.0.1-SNAPSHOT.jar
```

### 访问Swagger文档

启动应用后，访问以下地址查看API文档：

```
http://192.168.0.120:8080/swagger-ui.html
```

## 使用示例

### cURL示例

#### 创建用户

```bash
curl -X POST http://192.168.0.120:8080/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "NewUser@123",
    "realName": "新用户",
    "mobile": "13900139000",
    "email": "newuser@example.com",
    "status": "ACTIVE"
  }'
```

#### 获取用户列表

```bash
curl -X GET "http://192.168.0.120:8080/api/users?page=1&size=10&status=ACTIVE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 获取单个用户

```bash
curl -X GET http://192.168.0.120:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 更新用户

```bash
curl -X PUT http://192.168.0.120:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realName": "更新后的用户",
    "phone": "010-87654321"
  }'
```

#### 删除用户

```bash
curl -X DELETE http://192.168.0.120:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 注意事项

1. 所有API端点都需要有效的JWT Token认证
2. 请求频率限制基于IP地址和端点
3. 密码修改后，用户的所有Token会被撤销
4. 删除用户为逻辑删除，数据不会物理删除
5. 用户名、手机号、邮箱必须唯一
6. 分页查询的page参数从1开始，不是0

## 联系方式

如有问题，请联系开发团队。
