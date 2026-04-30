# 待办事项(Todo) API 接口文档

## 基础信息

- **Base URL**: `/todo`
- **Controller**: [TodoController.java](file:///d:/Ai/lawbackend2/src/main/java/com/lawbackend2/lawbackend2/controller/TodoController.java)
- **Tag**: 待办管理

---

## 通用响应结构

### ApiResponse<T>

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段    | 类型    | 说明       |
| ------- | ------- | ---------- |
| code    | Integer | 状态码     |
| message | String  | 响应消息   |
| data    | T       | 响应数据   |

### PageResult<T>

```json
{
  "total": 100,
  "list": [],
  "pageNum": 1,
  "pageSize": 10
}
```

| 字段     | 类型    | 说明       |
| -------- | ------- | ---------- |
| total    | Long    | 总记录数   |
| list     | List<T> | 数据列表   |
| pageNum  | Integer | 当前页码   |
| pageSize | Integer | 每页大小   |

---

## 1. 根据案号模糊查询案件简单信息

- **接口地址**: `GET /todo/case/simple-search`
- **说明**: 根据案号模糊查询案件的简单信息（ID、案号、案件名称）

### 请求参数

| 参数名     | 类型    | 是否必填 | 说明               |
| ---------- | ------- | -------- | ------------------ |
| caseNumber | String  | 是       | 案号（支持模糊查询）|
| page       | Integer | 否       | 页码，默认1        |
| size       | Integer | 否       | 每页大小，默认10   |

### 返回值

`Result<PageResult<CaseSimpleInfo>>`

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 1,
        "caseNumber": "（2024）粤01破1号",
        "caseName": "某某公司破产清算案",
        "reviewStatus": "已通过",
        "reviewOpinion": "符合受理条件"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

## 2. 创建待办事项（支持案件关联）

- **接口地址**: `POST /todo/with-case`
- **说明**: 创建新的待办事项，支持通过案号或案件ID自动关联案件

### 请求参数 (Body - TodoCreateRequest)

| 字段名         | 类型         | 是否必填 | 说明                                   |
| -------------- | ------------ | -------- | -------------------------------------- |
| userId         | Long         | 是       | 用户ID                                 |
| userAccount    | String       | 否       | 用户账号                               |
| userName       | String       | 否       | 用户姓名                               |
| title          | String       | 是       | 待办标题                               |
| description    | String       | 否       | 待办描述                               |
| type           | String       | 否       | 待办类型                               |
| priority       | String       | 否       | 优先级，默认NORMAL                     |
| deadline       | LocalDateTime| 否       | 截止时间                               |
| remark         | String       | 否       | 备注                                   |
| assigneeId     | Long         | 否       | 被分配人ID                             |
| assigneeName   | String       | 否       | 被分配人姓名                           |
| createUserId   | Long         | 否       | 创建人ID                               |
| createUserName | String       | 否       | 创建人姓名                             |
| relatedId      | Long         | 否       | 关联ID                                 |
| relatedType    | String       | 否       | 关联类型                               |
| caseNumber     | String       | 否       | 案号（用于自动关联案件）               |
| caseId         | Long         | 否       | 案件ID（用于自动关联案件）             |

### 请求示例

```json
{
  "userId": 1,
  "userAccount": "admin",
  "userName": "管理员",
  "title": "审查案件材料",
  "description": "审查某某公司破产清算案的相关材料",
  "type": "CASE_REVIEW",
  "priority": "HIGH",
  "deadline": "2024-12-31T23:59:59",
  "remark": "请尽快处理",
  "assigneeId": 2,
  "assigneeName": "张三",
  "createUserId": 1,
  "createUserName": "管理员",
  "caseNumber": "（2024）粤01破1号"
}
```

### 返回值

`ApiResponse<Todo>`

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "userAccount": "admin",
    "userName": "管理员",
    "title": "审查案件材料",
    "description": "审查某某公司破产清算案的相关材料",
    "type": "CASE_REVIEW",
    "priority": "HIGH",
    "status": "PENDING",
    "deadline": "2024-12-31 23:59:59",
    "completedTime": null,
    "relatedId": 1,
    "relatedType": "BANKRUPT_CASE",
    "assigneeId": 2,
    "assigneeName": "张三",
    "createUserId": 1,
    "createUserName": "管理员",
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00",
    "remark": "请尽快处理"
  }
}
```

---

## 3. 更新待办事项（支持案件关联）

- **接口地址**: `PUT /todo/{todoId}/with-case`
- **说明**: 更新待办事项信息，支持通过案号或案件ID自动关联案件

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 请求参数 (Body - TodoUpdateRequest)

| 字段名      | 类型          | 是否必填 | 说明                       |
| ----------- | ------------- | -------- | -------------------------- |
| title       | String        | 否       | 待办标题                   |
| description | String        | 否       | 待办描述                   |
| type        | String        | 否       | 待办类型                   |
| priority    | String        | 否       | 优先级                     |
| deadline    | LocalDateTime | 否       | 截止时间                   |
| remark      | String        | 否       | 备注                       |
| relatedId   | Long          | 否       | 关联ID                     |
| relatedType | String        | 否       | 关联类型                   |
| caseNumber  | String        | 否       | 案号（用于自动关联案件）   |
| caseId      | Long          | 否       | 案件ID（用于自动关联案件） |

### 请求示例

```json
{
  "title": "审查案件材料（更新）",
  "description": "更新后的描述",
  "priority": "NORMAL",
  "deadline": "2025-01-31T23:59:59",
  "remark": "更新备注",
  "caseNumber": "（2024）粤01破2号"
}
```

### 返回值

`ApiResponse<Todo>`

---

## 4. 创建待办事项（基础版）

- **接口地址**: `POST /todo`
- **说明**: 创建新的待办事项

### 请求参数 (Body - Todo)

与 Todo 实体字段一致，参考 Todo 实体定义。

### 返回值

`ApiResponse<Todo>`

---

## 5. 获取当前用户待办列表

- **接口地址**: `GET /todo/list`
- **说明**: 分页获取当前用户的待办事项列表，支持时间范围查询

### 请求参数

| 参数名    | 类型          | 是否必填 | 说明                    |
| --------- | ------------- | -------- | ----------------------- |
| pageNum   | Integer       | 否       | 页码，默认0             |
| pageSize  | Integer       | 否       | 每页大小，默认10        |
| startTime | LocalDateTime | 否       | 开始时间（ISO格式）     |
| endTime   | LocalDateTime | 否       | 结束时间（ISO格式）     |

### 返回值

`ApiResponse<Page<Todo>>`

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 1,
        "title": "审查案件材料",
        "status": "PENDING",
        "priority": "HIGH",
        "deadline": "2024-12-31 23:59:59",
        "createTime": "2024-01-15 10:30:00"
      }
    ],
    "totalElements": 20,
    "totalPages": 2,
    "size": 10,
    "number": 0
  }
}
```

---

## 6. 搜索当前用户待办事项

- **接口地址**: `GET /todo/search`
- **说明**: 根据条件搜索当前用户待办事项

### 请求参数

| 参数名   | 类型    | 是否必填 | 说明             |
| -------- | ------- | -------- | ---------------- |
| type     | String  | 否       | 待办类型         |
| status   | String  | 否       | 待办状态         |
| priority | String  | 否       | 优先级           |
| pageNum  | Integer | 否       | 页码，默认0      |
| pageSize | Integer | 否       | 每页大小，默认10 |

### 返回值

`ApiResponse<Page<Todo>>`

---

## 7. 获取当前用户待处理待办事项

- **接口地址**: `GET /todo/pending`
- **说明**: 获取当前用户的所有待处理待办事项

### 返回值

`ApiResponse<List<Todo>>`

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "审查案件材料",
      "status": "PENDING",
      "priority": "HIGH",
      "deadline": "2024-12-31 23:59:59",
      "createTime": "2024-01-15 10:30:00"
    }
  ]
}
```

---

## 8. 获取当前用户已完成待办事项

- **接口地址**: `GET /todo/completed`
- **说明**: 获取当前用户的所有已完成待办事项

### 返回值

`ApiResponse<List<Todo>>`

---

## 9. 获取当前用户过期待办事项

- **接口地址**: `GET /todo/overdue`
- **说明**: 获取当前用户的所有过期待办事项

### 返回值

`ApiResponse<List<Todo>>`

---

## 10. 获取当前用户待处理待办数量

- **接口地址**: `GET /todo/count/pending`
- **说明**: 统计当前用户的待处理待办事项数量

### 返回值

`ApiResponse<Long>`

```json
{
  "code": 200,
  "message": "success",
  "data": 5
}
```

---

## 11. 获取当前用户已完成待办数量

- **接口地址**: `GET /todo/count/completed`
- **说明**: 统计当前用户的已完成待办事项数量

### 返回值

`ApiResponse<Long>`

---

## 12. 获取当前用户过期待办数量

- **接口地址**: `GET /todo/count/overdue`
- **说明**: 统计当前用户的过期待办事项数量

### 返回值

`ApiResponse<Long>`

---

## 13. 获取当前用户的待办统计数据

- **接口地址**: `GET /todo/my-stats`
- **说明**: 返回当前登录用户的待办事项统计数据：进行中、已完成、已逾期数量

### 返回值

`ApiResponse<MyTodoStatisticsResponse>`

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "inProgressTodos": 5,
    "completedTodos": 12,
    "overdueTodos": 2
  }
}
```

| 字段            | 类型 | 说明               |
| --------------- | ---- | ------------------ |
| inProgressTodos | Long | 进行中待办数量     |
| completedTodos  | Long | 已完成待办数量     |
| overdueTodos    | Long | 已逾期待办数量     |

---

## 14. 获取待办事项详情

- **接口地址**: `GET /todo/{todoId}`
- **说明**: 根据待办事项ID获取详情

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 返回值

`ApiResponse<Todo>`

---

## 15. 完成待办事项

- **接口地址**: `PUT /todo/{todoId}/complete`
- **说明**: 将待办事项标记为已完成

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 返回值

`ApiResponse<Todo>`

---

## 16. 更新待办事项（基础版）

- **接口地址**: `PUT /todo/{todoId}`
- **说明**: 更新待办事项信息

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 请求参数 (Body - Todo)

与 Todo 实体字段一致。

### 返回值

`ApiResponse<Todo>`

---

## 17. 更新待办状态

- **接口地址**: `PUT /todo/{todoId}/status`
- **说明**: 更新待办事项的状态

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 请求参数

| 参数名 | 类型   | 是否必填 | 说明         |
| ------ | ------ | -------- | ------------ |
| status | String | 是       | 待办状态     |

### 返回值

`ApiResponse<Todo>`

---

## 18. 分配待办事项

- **接口地址**: `PUT /todo/{todoId}/assign`
- **说明**: 将待办事项分配给指定用户

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 请求参数

| 参数名       | 类型   | 是否必填 | 说明         |
| ------------ | ------ | -------- | ------------ |
| assigneeId   | Long   | 是       | 被分配人ID   |
| assigneeName | String | 是       | 被分配人姓名 |

### 返回值

`ApiResponse<Todo>`

---

## 19. 删除待办事项

- **接口地址**: `DELETE /todo/{todoId}`
- **说明**: 删除指定的待办事项

### 路径参数

| 参数名 | 类型 | 是否必填 | 说明         |
| ------ | ---- | -------- | ------------ |
| todoId | Long | 是       | 待办事项ID   |

### 返回值

`ApiResponse<Void>`

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 20. 批量删除待办事项

- **接口地址**: `DELETE /todo/batch`
- **说明**: 批量删除多个待办事项

### 请求参数 (Body)

| 参数名  | 类型       | 是否必填 | 说明             |
| ------- | ---------- | -------- | ---------------- |
| todoIds | List<Long> | 是       | 待办事项ID列表   |

### 请求示例

```json
[1, 2, 3, 4, 5]
```

### 返回值

`ApiResponse<Void>`

---

## 实体定义

### Todo 实体

| 字段名         | 类型          | 说明           |
| -------------- | ------------- | -------------- |
| id             | Long          | 主键ID         |
| userId         | Long          | 用户ID         |
| userAccount    | String        | 用户账号       |
| userName       | String        | 用户姓名       |
| title          | String        | 待办标题       |
| description    | String        | 待办描述       |
| type           | String        | 待办类型       |
| priority       | String        | 优先级，默认NORMAL |
| status         | String        | 状态，默认PENDING  |
| deadline       | LocalDateTime | 截止时间       |
| completedTime  | LocalDateTime | 完成时间       |
| relatedId      | Long          | 关联ID         |
| relatedType    | String        | 关联类型       |
| assigneeId     | Long          | 被分配人ID     |
| assigneeName   | String        | 被分配人姓名   |
| createUserId   | Long          | 创建人ID       |
| createUserName | String        | 创建人姓名     |
| createTime     | LocalDateTime | 创建时间       |
| updateTime     | LocalDateTime | 更新时间       |
| remark         | String        | 备注           |

### 状态枚举值

| 状态值    | 说明       |
| --------- | ---------- |
| PENDING   | 待处理     |
| COMPLETED | 已完成     |
| OVERDUE   | 已逾期     |

### 优先级枚举值

| 优先级值 | 说明   |
| -------- | ------ |
| HIGH     | 高     |
| NORMAL   | 普通   |
| LOW      | 低     |
