# 待办事项 API 接口文档

> 基础路径：`/api/v1/todo`
>
> 统一响应格式：`ApiResponse<T>`（code=200 表示成功）

---

## 目录

1. [创建待办事项](#1-创建待办事项)
2. [创建待办事项（支持案件关联）](#2-创建待办事项支持案件关联)
3. [获取待办事项详情](#3-获取待办事项详情)
4. [获取用户待办列表](#4-获取用户待办列表)
5. [搜索待办事项](#5-搜索待办事项)
6. [获取待处理待办事项](#6-获取待处理待办事项)
7. [获取已完成待办事项](#7-获取已完成待办事项)
8. [获取过期待办事项](#8-获取过期待办事项)
9. [获取待处理待办数量](#9-获取待处理待办数量)
10. [获取已完成待办数量](#10-获取已完成待办数量)
11. [获取过期待办数量](#11-获取过期待办数量)
12. [获取当前用户的待办统计数据](#12-获取当前用户的待办统计数据)
13. [完成待办事项](#13-完成待办事项)
14. [更新待办事项](#14-更新待办事项)
15. [更新待办事项（支持案件关联）](#15-更新待办事项支持案件关联)
16. [更新待办状态](#16-更新待办状态)
17. [分配待办事项](#17-分配待办事项)
18. [删除待办事项](#18-删除待办事项)
19. [批量删除待办事项](#19-批量删除待办事项)
20. [根据案号模糊查询案件简单信息](#20-根据案号模糊查询案件简单信息)

---

## 数据模型

### Todo 实体

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 主键ID |
| userId | Long | 用户ID（必填） |
| userAccount | String | 用户账号 |
| userName | String | 用户姓名 |
| title | String | 待办标题（必填） |
| description | String | 待办描述 |
| type | String | 待办类型 |
| priority | String | 优先级，默认 NORMAL |
| status | String | 状态，默认 PENDING |
| deadline | LocalDateTime | 截止时间 |
| completedTime | LocalDateTime | 完成时间 |
| relatedId | Long | 关联ID |
| relatedType | String | 关联类型 |
| assigneeId | Long | 被分配人ID |
| assigneeName | String | 被分配人姓名 |
| createUserId | Long | 创建人ID |
| createUserName | String | 创建人姓名 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| remark | String | 备注 |

### TodoCreateRequest（创建请求）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| title | String | 是 | 待办标题 |
| userAccount | String | 否 | 用户账号 |
| userName | String | 否 | 用户姓名 |
| description | String | 否 | 待办描述 |
| type | String | 否 | 待办类型 |
| priority | String | 否 | 优先级，默认 NORMAL |
| deadline | LocalDateTime | 否 | 截止时间 |
| remark | String | 否 | 备注 |
| assigneeId | Long | 否 | 被分配人ID |
| assigneeName | String | 否 | 被分配人姓名 |
| createUserId | Long | 否 | 创建人ID |
| createUserName | String | 否 | 创建人姓名 |
| relatedId | Long | 否 | 关联ID |
| relatedType | String | 否 | 关联类型 |
| caseNumber | String | 否 | 案号（用于自动关联案件） |
| caseId | Long | 否 | 案件ID（用于自动关联案件） |

### TodoUpdateRequest（更新请求）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | String | 否 | 待办标题 |
| description | String | 否 | 待办描述 |
| type | String | 否 | 待办类型 |
| priority | String | 否 | 优先级 |
| deadline | LocalDateTime | 否 | 截止时间 |
| remark | String | 否 | 备注 |
| relatedId | Long | 否 | 关联ID |
| relatedType | String | 否 | 关联类型 |
| caseNumber | String | 否 | 案号（用于自动关联案件） |
| caseId | Long | 否 | 案件ID（用于自动关联案件） |

### MyTodoStatisticsResponse（统计数据）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| inProgressTodos | Long | 进行中待办数量（未完成的） |
| completedTodos | Long | 已完成待办数量 |
| overdueTodos | Long | 已逾期数量 |

---

## 1. 创建待办事项

- **接口**：`POST /api/v1/todo`
- **说明**：创建新的待办事项

### 请求参数（Body）

`Todo` 实体对象

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 7,
    "title": "测试待办",
    "status": "PENDING",
    "priority": "NORMAL",
    "createTime": "2025-01-15 10:00:00"
  }
}
```

---

## 2. 创建待办事项（支持案件关联）

- **接口**：`POST /api/v1/todo/with-case`
- **说明**：创建待办事项，支持通过案号或案件ID自动关联案件

### 请求参数（Body）

`TodoCreateRequest` 对象

### 案件关联规则

1. 如果提供了 `caseId`，直接通过案件ID关联
2. 如果提供了 `caseNumber`，先精确匹配案号，若不存在则模糊匹配
3. 如果都未提供，创建常规待办事项（不关联案件）

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 7,
    "title": "审查案件材料",
    "relatedId": 100,
    "relatedType": "CASE",
    "status": "PENDING"
  }
}
```

---

## 3. 获取待办事项详情

- **接口**：`GET /api/v1/todo/{todoId}`
- **说明**：根据待办事项ID获取详情

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 7,
    "title": "测试待办",
    "status": "PENDING",
    "priority": "NORMAL",
    "deadline": "2025-01-20 18:00:00",
    "createTime": "2025-01-15 10:00:00"
  }
}
```

---

## 4. 获取用户待办列表

- **接口**：`GET /api/v1/todo/list`
- **说明**：分页获取用户的待办事项列表，支持时间范围查询

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| userId | Long | 是 | - | 用户ID |
| pageNum | Integer | 否 | 0 | 页码（从0开始） |
| pageSize | Integer | 否 | 10 | 每页大小 |
| startTime | LocalDateTime | 否 | - | 开始时间（ISO格式） |
| endTime | LocalDateTime | 否 | - | 结束时间（ISO格式） |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 7,
        "title": "测试待办",
        "status": "PENDING",
        "createTime": "2025-01-15 10:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

## 5. 搜索待办事项

- **接口**：`GET /api/v1/todo/search`
- **说明**：根据条件搜索用户待办事项

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| userId | Long | 是 | - | 用户ID |
| type | String | 否 | - | 待办类型 |
| status | String | 否 | - | 待办状态（PENDING/COMPLETED） |
| priority | String | 否 | - | 优先级（LOW/NORMAL/HIGH/URGENT） |
| pageNum | Integer | 否 | 0 | 页码（从0开始） |
| pageSize | Integer | 否 | 10 | 每页大小 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 7,
        "title": "测试待办",
        "type": "WORK",
        "status": "PENDING",
        "priority": "HIGH"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

## 6. 获取待处理待办事项

- **接口**：`GET /api/v1/todo/pending`
- **说明**：获取用户的所有待处理待办事项，按截止时间升序排列

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 7,
      "title": "紧急待办",
      "status": "PENDING",
      "deadline": "2025-01-16 12:00:00"
    },
    {
      "id": 2,
      "userId": 7,
      "title": "普通待办",
      "status": "PENDING",
      "deadline": "2025-01-20 18:00:00"
    }
  ]
}
```

---

## 7. 获取已完成待办事项

- **接口**：`GET /api/v1/todo/COMPLETED`
- **说明**：获取用户的所有已完成待办事项，按完成时间降序排列

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 3,
      "userId": 7,
      "title": "已完成待办",
      "status": "COMPLETED",
      "completedTime": "2025-01-14 15:30:00"
    }
  ]
}
```

---

## 8. 获取过期待办事项

- **接口**：`GET /api/v1/todo/overdue`
- **说明**：获取用户的所有过期待办事项（截止时间小于当前时间且状态为 PENDING）

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 4,
      "userId": 7,
      "title": "已逾期待办",
      "status": "PENDING",
      "deadline": "2025-01-10 18:00:00"
    }
  ]
}
```

---

## 9. 获取待处理待办数量

- **接口**：`GET /api/v1/todo/count/pending`
- **说明**：统计用户的待处理待办事项数量

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": 5
}
```

---

## 10. 获取已完成待办数量

- **接口**：`GET /api/v1/todo/count/completed`
- **说明**：统计用户的已完成待办事项数量

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": 10
}
```

---

## 11. 获取过期待办数量

- **接口**：`GET /api/v1/todo/count/overdue`
- **说明**：统计用户的过期待办事项数量

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": 2
}
```

---

## 12. 获取当前用户的待办统计数据

- **接口**：`GET /api/v1/todo/my-stats`
- **说明**：返回当前登录用户的待办事项统计数据：进行中、已完成、已逾期数量

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "inProgressTodos": 5,
    "completedTodos": 10,
    "overdueTodos": 2
  }
}
```

---

## 13. 完成待办事项

- **接口**：`PUT /api/v1/todo/{todoId}/complete`
- **说明**：将待办事项标记为已完成

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "测试待办",
    "status": "COMPLETED",
    "completedTime": "2025-01-15 16:00:00"
  }
}
```

### 错误情况

- 如果待办事项已经是 COMPLETED 状态，返回错误：`"待办事项已完成"`

---

## 14. 更新待办事项

- **接口**：`PUT /api/v1/todo/{todoId}`
- **说明**：更新待办事项信息

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 请求参数（Body）

`Todo` 实体对象

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "description": "更新后的描述",
    "priority": "HIGH"
  }
}
```

---

## 15. 更新待办事项（支持案件关联）

- **接口**：`PUT /api/v1/todo/{todoId}/with-case`
- **说明**：更新待办事项信息，支持通过案号或案件ID自动关联案件

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 请求参数（Body）

`TodoUpdateRequest` 对象

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "relatedId": 100,
    "relatedType": "CASE"
  }
}
```

---

## 16. 更新待办状态

- **接口**：`PUT /api/v1/todo/{todoId}/status`
- **说明**：更新待办事项的状态

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 是 | 待办状态（PENDING/COMPLETED 等） |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "测试待办",
    "status": "COMPLETED",
    "completedTime": "2025-01-15 16:00:00"
  }
}
```

---

## 17. 分配待办事项

- **接口**：`PUT /api/v1/todo/{todoId}/assign`
- **说明**：将待办事项分配给指定用户

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| assigneeId | Long | 是 | 被分配人ID |
| assigneeName | String | 是 | 被分配人姓名 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "测试待办",
    "assigneeId": 8,
    "assigneeName": "张三"
  }
}
```

---

## 18. 删除待办事项

- **接口**：`DELETE /api/v1/todo/{todoId}`
- **说明**：删除指定的待办事项

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| todoId | Long | 是 | 待办事项ID |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 19. 批量删除待办事项

- **接口**：`DELETE /api/v1/todo/batch`
- **说明**：批量删除多个待办事项

### 请求参数（Body）

待办事项ID列表：`List<Long>`

### 请求示例

```json
[1, 2, 3]
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 20. 根据案号模糊查询案件简单信息

- **接口**：`GET /api/v1/todo/case/simple-search`
- **说明**：根据案号模糊查询案件的简单信息（ID、案号、案件名称）

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| caseNumber | String | 是 | - | 案号（支持模糊查询） |
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 100,
        "caseNumber": "（2025）京01破1号",
        "caseName": "某某公司破产清算案"
      }
    ]
  }
}
```

---

## 状态说明

| 状态值 | 说明 |
|--------|------|
| PENDING | 待处理 |
| COMPLETED | 已完成 |

## 优先级说明

| 优先级值 | 说明 |
|----------|------|
| LOW | 低 |
| NORMAL | 普通（默认） |
| HIGH | 高 |
| URGENT | 紧急 |

---

> 文档生成时间：2026-04-27
