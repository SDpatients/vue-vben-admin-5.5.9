# 聊天系统API接口文档

## 1. 文档概述

本文档描述了聊天系统的后端API接口，包括联系人管理、聊天消息管理和WebSocket实时通信等功能。

## 2. 基础接口规范

### 2.1 接口前缀
所有聊天相关接口前缀：`/api/web`

### 2.2 请求头
```
Authorization: Bearer {token}  # JWT认证令牌
Content-Type: application/json  # 请求体类型
```

### 2.3 响应格式

```json
{
  "status": "1",  # 1:成功, 0:失败
  "data": {},     # 响应数据
  "error": ""     # 错误信息
}
```

## 3. 联系人管理接口

### 3.1 获取联系人列表

- **接口地址**: `/api/web/contact`
- **请求方式**: GET
- **请求参数**:
  | 参数名 | 类型 | 必填 | 默认值 | 描述 |
  |--------|------|------|--------|------|
  | userId | INT | 是 | - | 用户ID |
  | groupId | INT | 否 | - | 分组ID，用于筛选特定分组的联系人 |
  | keyword | STRING | 否 | - | 搜索关键词，用于模糊搜索联系人 |
  | page | INT | 否 | 1 | 页码 |
  | page_size | INT | 否 | 20 | 每页条数 |

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": [
      {
        "id": 1,
        "userId": 1,
        "contactUserId": 2,
        "name": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com",
        "idCard": null,
        "avatar": null,
        "description": null,
        "isSystemUser": 1,
        "groupId": 1,
        "isOnline": 1,
        "lastOnlineTime": "2023-01-01 12:00:00",
        "isPinned": 0,
        "createdAt": "2023-01-01 00:00:00",
        "updatedAt": "2023-01-01 00:00:00"
      }
    ],
    "error": ""
  }
  ```

### 3.2 新增联系人

- **接口地址**: `/api/web/contact`
- **请求方式**: POST
- **请求体**:
  ```json
  {
    "userId": 1,
    "contactUserId": 2,
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "idCard": null,
    "avatar": null,
    "description": null,
    "isSystemUser": 1,
    "groupId": 1,
    "isPinned": 0
  }
  ```

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": 1,
    "error": ""
  }
  ```

### 3.3 修改联系人

- **接口地址**: `/api/web/contact/:id`
- **请求方式**: PUT
- **请求体**: 同新增联系人
- **响应数据**: 同新增联系人

### 3.4 删除联系人

- **接口地址**: `/api/web/contact/:id`
- **请求方式**: DELETE
- **响应数据**:
  ```json
  {
    "status": "1",
    "data": "删除联系人成功",
    "error": ""
  }
  ```

### 3.5 获取联系人分组列表

- **接口地址**: `/api/web/contact-groups`
- **请求方式**: GET
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |--------|------|------|------|
  | userId | INT | 是 | 用户ID |

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": [
      {
        "id": 1,
        "userId": 1,
        "name": "同事",
        "sortOrder": 0,
        "color": "#409EFF",
        "createdAt": "2023-01-01 00:00:00",
        "updatedAt": "2023-01-01 00:00:00"
      }
    ],
    "error": ""
  }
  ```

### 3.6 新增联系人分组

- **接口地址**: `/api/web/contact-groups`
- **请求方式**: POST
- **请求体**:
  ```json
  {
    "userId": 1,
    "name": "朋友",
    "sortOrder": 1,
    "color": "#67C23A"
  }
  ```

- **响应数据**: 同新增联系人

### 3.7 修改联系人分组

- **接口地址**: `/api/web/contact-groups/:id`
- **请求方式**: PUT
- **请求体**: 同新增联系人分组
- **响应数据**: 同新增联系人

### 3.8 删除联系人分组

- **接口地址**: `/api/web/contact-groups/:id`
- **请求方式**: DELETE
- **响应数据**: 同删除联系人

## 4. 聊天功能接口

### 4.1 获取聊天记录

- **接口地址**: `/api/web/messages/:contactId`
- **请求方式**: GET
- **请求参数**:
  | 参数名 | 类型 | 必填 | 默认值 | 描述 |
  |--------|------|------|--------|------|
  | userId | INT | 是 | - | 用户ID |
  | contactId | INT | 是 | - | 联系人ID |
  | page | INT | 否 | 1 | 页码 |
  | page_size | INT | 否 | 20 | 每页条数 |

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": [
      {
        "id": 1,
        "senderId": 1,
        "receiverId": 2,
        "messageType": 1,
        "content": "你好",
        "fileUrl": null,
        "fileName": null,
        "fileSize": null,
        "thumbnailUrl": null,
        "isRecalled": 0,
        "recallTime": null,
        "readStatus": 1,
        "status": 1,
        "createdAt": "2023-01-01 12:00:00"
      }
    ],
    "error": ""
  }
  ```

### 4.2 发送消息（HTTP备用）

- **接口地址**: `/api/web/messages`
- **请求方式**: POST
- **请求体**:
  ```json
  {
    "senderId": 1,
    "receiverId": 2,
    "messageType": 1,
    "content": "你好",
    "fileUrl": null,
    "fileName": null,
    "fileSize": null,
    "thumbnailUrl": null
  }
  ```

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": 1,
    "error": ""
  }
  ```

### 4.3 撤回消息

- **接口地址**: `/api/web/messages/:id/recall`
- **请求方式**: PUT
- **响应数据**:
  ```json
  {
    "status": "1",
    "data": "撤回消息成功",
    "error": ""
  }
  ```

### 4.4 标记消息为已读

- **接口地址**: `/api/web/messages/read`
- **请求方式**: PUT
- **请求体**:
  ```json
  {
    "contactId": 2,  # 联系人ID
    "receiverId": 1,  # 当前用户ID
    "messageIds": [1, 2, 3]  # 消息ID列表，可为空，为空则标记该联系人所有消息为已读
  }
  ```

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": "标记已读成功",
    "error": ""
  }
  ```

### 4.5 获取聊天会话列表

- **接口地址**: `/api/web/sessions`
- **请求方式**: GET
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |--------|------|------|------|
  | userId | INT | 是 | 用户ID |

- **响应数据**:
  ```json
  {
    "status": "1",
    "data": [
      {
        "id": 1,
        "userId": 1,
        "contactId": 2,
        "lastMessageId": 1,
        "unreadCount": 0,
        "isPinned": 0,
        "lastActivityTime": "2023-01-01 12:00:00",
        "createdAt": "2023-01-01 12:00:00",
        "updatedAt": "2023-01-01 12:00:00"
      }
    ],
    "error": ""
  }
  ```

### 4.6 搜索聊天记录

- **接口地址**: `/api/web/messages/search`
- **请求方式**: GET
- **请求参数**:
  | 参数名 | 类型 | 必填 | 默认值 | 描述 |
  |--------|------|------|--------|------|
  | userId | INT | 是 | - | 用户ID |
  | keyword | STRING | 是 | - | 搜索关键词 |
  | start_time | DATETIME | 否 | - | 开始时间 |
  | end_time | DATETIME | 否 | - | 结束时间 |
  | page | INT | 否 | 1 | 页码 |
  | page_size | INT | 否 | 20 | 每页条数 |

- **响应数据**: 同获取聊天记录

## 5. WebSocket事件定义

### 5.1 WebSocket连接地址

```
ws://{hostname}:{port}/ws?userId={userId}
```

### 5.2 客户端发送事件

| 事件名 | 数据格式 | 描述 |
|--------|----------|------|
| message | `{ receiverId, messageType, content, fileUrl, fileName, fileSize, thumbnailUrl }` | 发送消息 |
| read | `{ contactId, messageIds }` | 标记消息为已读 |
| typing | `{ contactId, isTyping }` | 输入状态通知 |
| ping | 无 | 心跳包 |

### 5.3 服务器推送事件

| 事件名 | 数据格式 | 描述 |
|--------|----------|------|
| message | 完整消息对象 | 新消息通知 |
| messageStatus | `{ messageId, status }` | 消息状态更新 |
| readStatus | `{ messageId, readStatus }` | 阅读状态更新 |
| onlineStatusChange | `{ userId, isOnline, lastOnlineTime }` | 在线状态变化 |
| typing | `{ userId, isTyping }` | 对方输入状态通知 |
| pong | 无 | 心跳响应 |

## 6. 消息类型说明

| 类型值 | 描述 |
|--------|------|
| 1 | 文本消息 |
| 2 | 图片消息 |
| 3 | 文件消息 |
| 4 | 系统消息 |

## 7. 错误码说明

| 错误码 | 描述 |
|--------|------|
| 1 | 成功 |
| 0 | 失败 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 8. 使用示例

### 8.1 获取联系人列表示例

```bash
curl -X GET "http://localhost:8080/api/web/contact?userId=1" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json"
```

### 8.2 发送消息示例

```bash
curl -X POST "http://localhost:8080/api/web/messages" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"senderId":1,"receiverId":2,"messageType":1,"content":"你好"}'
```

### 8.3 WebSocket连接示例

```javascript
// 连接WebSocket
const ws = new WebSocket('ws://localhost:8080/ws?userId=1');

// 监听连接建立
ws.onopen = function() {
    console.log('WebSocket连接已建立');
};

// 发送消息
ws.send(JSON.stringify({
    type: 'message',
    data: {
        receiverId: 2,
        messageType: 1,
        content: '你好'
    }
}));

// 接收消息
ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('收到消息:', message);
};
```