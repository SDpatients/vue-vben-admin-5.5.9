# 通知管理API文档

## 目录
- [接口概览](#接口概览)
- [创建通知](#创建通知)
- [获取通知详情](#获取通知详情)
- [获取用户通知列表](#获取用户通知列表)
- [搜索通知](#搜索通知)
- [获取未读通知列表](#获取未读通知列表)
- [获取未读通知数量](#获取未读通知数量)
- [标记通知为已读](#标记通知为已读)
- [标记所有通知为已读](#标记所有通知为已读)
- [删除通知](#删除通知)
- [批量删除通知](#批量删除通知)
- [更新通知状态](#更新通知状态)
- [常见错误码](#常见错误码)
- [接口调用注意事项](#接口调用注意事项)

---

## 接口概览

通知管理模块提供完整的通知创建、查询、更新和删除功能，支持实时推送和批量操作。

**基础URL**: `/api/v1/notification`

**认证方式**: 所有接口需要JWT Token认证（在请求头中携带 `Authorization: Bearer {token}`）

---

## 创建通知

创建新的系统通知，支持实时推送给目标用户。

### 接口信息

- **URL**: `/api/v1/notification`
- **方法**: `POST`
- **功能描述**: 创建新的系统通知并实时推送给用户

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| userId | Long | 是 | 接收通知的用户ID | 1 |
| userAccount | String | 否 | 用户账号，用于记录 | "testuser" |
| userName | String | 否 | 用户姓名，用于记录 | "张三" |
| title | String | 是 | 通知标题，最大200字符 | "您有新的待办事项" |
| content | String | 否 | 通知内容，支持长文本 | "请及时处理案号为XXX的待办事项" |
| type | String | 是 | 通知类型，最大50字符 | "SYSTEM" |
| isRead | Boolean | 否 | 是否已读，默认false | false |
| readTime | LocalDateTime | 否 | 阅读时间，标记已读时自动设置 | null |
| relatedId | Long | 否 | 关联业务ID | 1001 |
| relatedType | String | 否 | 关联业务类型，最大100字符 | "TODO" |
| priority | String | 否 | 优先级，默认"NORMAL"，最大20字符 | "HIGH" |
| status | String | 否 | 通知状态，默认"ACTIVE"，最大20字符 | "ACTIVE" |
| expireTime | LocalDateTime | 否 | 过期时间，过期后自动清理 | "2026-01-10T12:00:00" |
| createUserId | Long | 否 | 创建者用户ID | 2 |
| createUserName | String | 否 | 创建者姓名，最大100字符 | "管理员" |
| remark | String | 否 | 备注，最大500字符 | "系统自动生成" |

### 通知类型说明

| 类型值 | 说明 | 使用场景 |
|--------|------|----------|
| SYSTEM | 系统通知 | 系统公告、维护通知等 |
| TODO | 待办通知 | 待办事项提醒 |
| CASE | 案件通知 | 案件进度更新、审核通知等 |
| FUND | 资金通知 | 资金审批、流水提醒等 |
| ANNOUNCEMENT | 公告通知 | 公告发布提醒 |
| MESSAGE | 消息通知 | 用户间消息提醒 |

### 优先级说明

| 优先级值 | 说明 | 使用场景 |
|----------|------|----------|
| LOW | 低优先级 | 一般性通知 |
| NORMAL | 普通优先级 | 常规通知（默认） |
| HIGH | 高优先级 | 重要通知 |
| URGENT | 紧急优先级 | 紧急通知 |

### 状态说明

| 状态值 | 说明 |
|--------|------|
| ACTIVE | 活跃状态（默认） |
| ARCHIVED | 已归档 |
| DELETED | 已删除 |

### 请求示例

```json
{
  "userId": 1,
  "userAccount": "testuser",
  "userName": "张三",
  "title": "您有新的待办事项",
  "content": "请及时处理案号为CASE-2026-001的待办事项，截止时间为2026-01-10",
  "type": "TODO",
  "relatedId": 1001,
  "relatedType": "TODO",
  "priority": "HIGH",
  "status": "ACTIVE",
  "expireTime": "2026-01-10T18:00:00",
  "createUserId": 2,
  "createUserName": "管理员",
  "remark": "系统自动生成"
}
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "userAccount": "testuser",
    "userName": "张三",
    "title": "您有新的待办事项",
    "content": "请及时处理案号为CASE-2026-001的待办事项，截止时间为2026-01-10",
    "type": "TODO",
    "isRead": false,
    "readTime": null,
    "relatedId": 1001,
    "relatedType": "TODO",
    "priority": "HIGH",
    "status": "ACTIVE",
    "expireTime": "2026-01-10T18:00:00",
    "createUserId": 2,
    "createUserName": "管理员",
    "createTime": "2026-01-09T10:30:00",
    "updateTime": null,
    "remark": "系统自动生成"
  }
}
```

### 错误响应

**状态码**: 400 Bad Request

```json
{
  "code": 400,
  "message": "参数校验失败: userId不能为空"
}
```

**状态码**: 500 Internal Server Error

```json
{
  "code": 500,
  "message": "系统异常，请联系管理员"
}
```

---

## 获取通知详情

根据通知ID获取通知的详细信息。

### 接口信息

- **URL**: `/api/v1/notification/{notificationId}`
- **方法**: `GET`
- **功能描述**: 根据通知ID获取通知详情

### 路径参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| notificationId | Long | 是 | 通知ID | 1 |

### 请求示例

```http
GET /api/v1/notification/1
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "userAccount": "testuser",
    "userName": "张三",
    "title": "您有新的待办事项",
    "content": "请及时处理案号为CASE-2026-001的待办事项",
    "type": "TODO",
    "isRead": false,
    "readTime": null,
    "relatedId": 1001,
    "relatedType": "TODO",
    "priority": "HIGH",
    "status": "ACTIVE",
    "expireTime": null,
    "createUserId": 2,
    "createUserName": "管理员",
    "createTime": "2026-01-09T10:30:00",
    "updateTime": null,
    "remark": "系统自动生成"
  }
}
```

### 错误响应

**状态码**: 200 OK（业务异常）

```json
{
  "code": 500,
  "message": "通知不存在"
}
```

---

## 获取用户通知列表

分页获取指定用户的通知列表，按创建时间倒序排列。

### 接口信息

- **URL**: `/api/v1/notification/list`
- **方法**: `GET`
- **功能描述**: 分页获取用户的通知列表

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例值 |
|--------|------|------|------|--------|--------|
| userId | Long | 是 | 用户ID | - | 1 |
| pageNum | Integer | 否 | 页码（从0开始） | 0 | 0 |
| pageSize | Integer | 否 | 每页大小 | 10 | 10 |

### 请求示例

```http
GET /api/v1/notification/list?userId=1&pageNum=0&pageSize=10
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 2,
        "userId": 1,
        "title": "案件进度更新",
        "content": "您的案件CASE-2026-001已进入审核阶段",
        "type": "CASE",
        "isRead": false,
        "priority": "NORMAL",
        "status": "ACTIVE",
        "createTime": "2026-01-09T11:00:00"
      },
      {
        "id": 1,
        "userId": 1,
        "title": "您有新的待办事项",
        "content": "请及时处理案号为CASE-2026-001的待办事项",
        "type": "TODO",
        "isRead": true,
        "priority": "HIGH",
        "status": "ACTIVE",
        "createTime": "2026-01-09T10:30:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 2,
    "totalPages": 1,
    "last": true,
    "first": true,
    "numberOfElements": 2,
    "size": 10,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "empty": false
  }
}
```

---

## 搜索通知

根据多个条件组合搜索用户的通知，支持灵活的筛选条件。

### 接口信息

- **URL**: `/api/v1/notification/search`
- **方法**: `GET`
- **功能描述**: 根据条件搜索用户通知

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| userId | Long | 是 | 用户ID | 1 |
| type | String | 否 | 通知类型 | "TODO" |
| isRead | Boolean | 否 | 是否已读 | false |
| status | String | 否 | 通知状态 | "ACTIVE" |
| pageNum | Integer | 否 | 页码（从0开始） | 0 |
| pageSize | Integer | 否 | 每页大小 | 10 |

### 请求示例

```http
GET /api/v1/notification/search?userId=1&type=TODO&isRead=false&status=ACTIVE&pageNum=0&pageSize=10
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 1,
        "title": "您有新的待办事项",
        "content": "请及时处理案号为CASE-2026-001的待办事项",
        "type": "TODO",
        "isRead": false,
        "priority": "HIGH",
        "status": "ACTIVE",
        "createTime": "2026-01-09T10:30:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "pageNumber": 0,
    "pageSize": 10
  }
}
```

---

## 获取未读通知列表

获取用户的所有未读通知，按创建时间倒序排列。

### 接口信息

- **URL**: `/api/v1/notification/unread`
- **方法**: `GET`
- **功能描述**: 获取用户的所有未读通知

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| userId | Long | 是 | 用户ID | 1 |

### 请求示例

```http
GET /api/v1/notification/unread?userId=1
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "userId": 1,
      "title": "案件进度更新",
      "content": "您的案件CASE-2026-001已进入审核阶段",
      "type": "CASE",
      "isRead": false,
      "priority": "NORMAL",
      "status": "ACTIVE",
      "createTime": "2026-01-09T11:00:00"
    },
    {
      "id": 1,
      "userId": 1,
      "title": "您有新的待办事项",
      "content": "请及时处理案号为CASE-2026-001的待办事项",
      "type": "TODO",
      "isRead": false,
      "priority": "HIGH",
      "status": "ACTIVE",
      "createTime": "2026-01-09T10:30:00"
    }
  ]
}
```

---

## 获取未读通知数量

统计用户的未读通知数量，用于显示未读消息角标。

### 接口信息

- **URL**: `/api/v1/notification/count/unread`
- **方法**: `GET`
- **功能描述**: 统计用户的未读通知数量

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| userId | Long | 是 | 用户ID | 1 |

### 请求示例

```http
GET /api/v1/notification/count/unread?userId=1
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": 5
}
```

---

## 标记通知为已读

将指定的通知标记为已读状态，并自动设置阅读时间。

### 接口信息

- **URL**: `/api/v1/notification/{notificationId}/read`
- **方法**: `PUT`
- **功能描述**: 将指定通知标记为已读状态

### 路径参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| notificationId | Long | 是 | 通知ID | 1 |

### 请求示例

```http
PUT /api/v1/notification/1/read
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "您有新的待办事项",
    "content": "请及时处理案号为CASE-2026-001的待办事项",
    "type": "TODO",
    "isRead": true,
    "readTime": "2026-01-09T12:00:00",
    "priority": "HIGH",
    "status": "ACTIVE",
    "createTime": "2026-01-09T10:30:00",
    "updateTime": "2026-01-09T12:00:00"
  }
}
```

### 错误响应

**状态码**: 200 OK（业务异常）

```json
{
  "code": 500,
  "message": "通知不存在"
}
```

---

## 标记所有通知为已读

将用户的所有通知标记为已读状态，用于一键清空未读消息。

### 接口信息

- **URL**: `/api/v1/notification/read-all`
- **方法**: `PUT`
- **功能描述**: 将用户的所有通知标记为已读状态

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| userId | Long | 是 | 用户ID | 1 |

### 请求示例

```http
PUT /api/v1/notification/read-all?userId=1
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 删除通知

删除指定的通知记录。

### 接口信息

- **URL**: `/api/v1/notification/{notificationId}`
- **方法**: `DELETE`
- **功能描述**: 删除指定的通知

### 路径参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| notificationId | Long | 是 | 通知ID | 1 |

### 请求示例

```http
DELETE /api/v1/notification/1
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 错误响应

**状态码**: 200 OK（业务异常）

```json
{
  "code": 500,
  "message": "通知不存在"
}
```

---

## 批量删除通知

批量删除多个通知，提高删除效率。

### 接口信息

- **URL**: `/api/v1/notification/batch`
- **方法**: `DELETE`
- **功能描述**: 批量删除多个通知

### 请求体

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| notificationIds | List<Long> | 是 | 通知ID列表 | [1, 2, 3] |

### 请求示例

```json
DELETE /api/v1/notification/batch

{
  "notificationIds": [1, 2, 3, 4, 5]
}
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 更新通知状态

更新通知的状态，如将通知归档或删除。

### 接口信息

- **URL**: `/api/v1/notification/{notificationId}/status`
- **方法**: `PUT`
- **功能描述**: 更新通知的状态

### 路径参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| notificationId | Long | 是 | 通知ID | 1 |

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| status | String | 是 | 通知状态 | "ARCHIVED" |

### 请求示例

```http
PUT /api/v1/notification/1/status?status=ARCHIVED
```

### 成功响应

**状态码**: 200 OK

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 错误响应

**状态码**: 200 OK（业务异常）

```json
{
  "code": 500,
  "message": "通知不存在"
}
```

---

## 常见错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|------------|------|----------|
| 200 | 200 | 业务异常（如通知不存在） | 检查通知ID是否正确 |
| 400 | 400 | 参数校验失败 | 检查请求参数格式和必填项 |
| 500 | 500 | 系统异常 | 联系系统管理员 |

### 错误响应示例

**参数校验失败**:

```json
{
  "code": 400,
  "message": "userId不能为空"
}
```

**通知不存在**:

```json
{
  "code": 500,
  "message": "通知不存在"
}
```

**系统异常**:

```json
{
  "code": 500,
  "message": "系统异常，请联系管理员"
}
```

---

## 接口调用注意事项

### 1. 认证要求

所有接口都需要在请求头中携带有效的JWT Token：

```http
Authorization: Bearer {your_token_here}
```

### 2. 参数验证

- **必填参数**: userId、title、type 为必填参数，必须提供有效值
- **字符串长度**: 注意各字符串字段的长度限制
- **日期格式**: 日期时间字段使用 ISO 8601 格式，如 `2026-01-09T10:30:00`

### 3. 分页参数

- pageNum 从 0 开始计数
- 建议合理设置 pageSize，避免一次查询过多数据
- 默认排序按创建时间倒序

### 4. 实时推送

创建通知时会通过 WebSocket 实时推送给目标用户，前端需要监听 WebSocket 消息：

```javascript
// WebSocket 连接示例
const ws = new WebSocket('ws://your-server/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'NEW_NOTIFICATION') {
    // 处理新通知
    console.log('收到新通知:', message);
    // 更新UI显示未读数量
    updateUnreadCount();
  }
};
```

### 5. 通知过期

- 可以设置 expireTime 字段指定通知过期时间
- 系统会定期清理过期通知
- 过期通知不会在查询结果中显示

### 6. 批量操作

- 批量删除操作时，确保 notificationIds 列表中的通知ID都存在
- 建议分批处理大量通知，避免单次请求超时

### 7. 性能优化

- 使用搜索接口时，尽量提供具体的筛选条件，减少查询结果
- 对于未读通知数量，建议缓存结果，避免频繁查询
- 定期清理已读和过期通知，保持数据库性能

### 8. 最佳实践

1. **创建通知**:
   - 设置合适的 type 和 priority，帮助用户识别重要程度
   - 对于重要通知，设置较短的 expireTime
   - 提供清晰的 title 和 content，便于用户理解

2. **查询通知**:
   - 使用分页查询，避免一次加载过多数据
   - 优先使用未读通知列表，提高用户体验
   - 使用搜索接口进行精确筛选

3. **标记已读**:
   - 用户点击通知时，立即标记为已读
   - 提供"全部标记为已读"功能，提升用户体验

4. **删除通知**:
   - 提供批量删除功能，方便用户清理
   - 建议在删除前进行二次确认

### 9. 前端集成示例

```javascript
// 创建通知
async function createNotification(notificationData) {
  const response = await fetch('/api/v1/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(notificationData)
  });
  return await response.json();
}

// 获取未读通知数量
async function getUnreadCount(userId) {
  const response = await fetch(`/api/v1/notification/count/unread?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  const result = await response.json();
  return result.data;
}

// 标记为已读
async function markAsRead(notificationId) {
  const response = await fetch(`/api/v1/notification/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return await response.json();
}
```

### 10. 数据库索引

系统已为以下字段创建索引，优化查询性能：

- idx_user_id: 用户ID索引
- idx_is_read: 已读状态索引
- idx_type: 通知类型索引
- idx_status: 通知状态索引
- idx_create_time: 创建时间索引

---

## 附录

### 通知实体完整字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | Long | 否 | 自增 | 主键ID |
| userId | Long | 是 | - | 接收通知的用户ID |
| userAccount | String | 否 | null | 用户账号，最大100字符 |
| userName | String | 否 | null | 用户姓名，最大100字符 |
| title | String | 是 | - | 通知标题，最大200字符 |
| content | String | 否 | null | 通知内容，TEXT类型 |
| type | String | 是 | - | 通知类型，最大50字符 |
| isRead | Boolean | 否 | false | 是否已读 |
| readTime | LocalDateTime | 否 | null | 阅读时间 |
| relatedId | Long | 否 | null | 关联业务ID |
| relatedType | String | 否 | null | 关联业务类型，最大100字符 |
| priority | String | 否 | "NORMAL" | 优先级，最大20字符 |
| status | String | 否 | "ACTIVE" | 通知状态，最大20字符 |
| expireTime | LocalDateTime | 否 | null | 过期时间 |
| createUserId | Long | 否 | null | 创建者用户ID |
| createUserName | String | 否 | null | 创建者姓名，最大100字符 |
| createTime | LocalDateTime | 否 | 当前时间 | 创建时间，自动生成 |
| updateTime | LocalDateTime | 否 | null | 更新时间，自动更新 |
| remark | String | 否 | null | 备注，最大500字符 |

### 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始版本，完成通知管理API文档 |

---

**文档维护**: 后端开发团队
**最后更新**: 2026-01-09
**联系方式**: 如有疑问请联系后端开发团队
