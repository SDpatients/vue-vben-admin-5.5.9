# 案件流程处理模块 API 文档

## 概述

案件流程处理模块实现了破产案件的全生命周期管理，包含七个阶段共23个核心任务。每个阶段包含特定的法律程序和管理任务。

---

## 一、案件流程七个阶段

### 阶段定义

| 阶段编号 | 阶段名称 | 任务编号范围 | 任务数量 |
|---------|---------|-------------|---------|
| 1 | 申请与受理 | TASK_001 - TASK_002 | 2 |
| 2 | 管理人接管 | TASK_003 - TASK_007 | 5 |
| 3 | 债权申报与审查 | TASK_008 - TASK_011 | 4 |
| 4 | 债权人会议 | TASK_012 - TASK_013 | 2 |
| 5 | 重整和解及破产宣告 | TASK_014 - TASK_016 | 3 |
| 6 | 财产变价与分配 | TASK_017 - TASK_019 | 3 |
| 7 | 程序终结 | TASK_020 - TASK_023 | 4 |

---

### 第一阶段：申请与受理

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_001 | 提交破产申请材料 | 申请人 | 提交破产申请及相关证明材料 |
| TASK_002 | 裁定受理并公告 | 法院 | 法院审查并裁定受理破产申请 |

### 第二阶段：管理人接管

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_003 | 全面接管债务人 | 管理人 | 接管债务人的财产、印章、账簿等 |
| TASK_004 | 管理人印章 | 管理人 | 刻制管理人印章 |
| TASK_005 | 调查财产及经营状况 | 管理人 | 调查债务人财产状况和经营情况 |
| TASK_006 | 追收债务人财产 | 管理人 | 追收债务人对外债权和财产 |
| TASK_007 | 决定合同继续履行或解除 | 管理人 | 决定未履行合同的处理方式 |

### 第三阶段：债权申报与审查

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_008 | 通知已知债权人并公告 | 管理人 | 通知已知债权人申报债权 |
| TASK_009 | 接收、登记债权申报 | 管理人 | 接收并登记债权人申报 |
| TASK_010 | 审查申报债权并编制债权表 | 管理人 | 审查债权并编制债权表 |
| TASK_011 | 债权审查结果通知 | 管理人 | 通知债权人审查结果 |

### 第四阶段：债权人会议

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_012 | 会议资料 | 管理人 | 准备债权人会议资料 |
| TASK_013 | 表决事项和表决结果 | 债权人会议 | 表决事项及结果记录 |

### 第五阶段：重整和解及破产宣告

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_014 | 宣告重整与和解 | 法院 | 裁定重整或和解程序 |
| TASK_015 | 审查宣告破产条件 | 法院 | 审查是否符合破产宣告条件 |
| TASK_016 | 裁定宣告债务人破产及公告 | 法院 | 宣告债务人破产并公告 |

### 第六阶段：财产变价与分配

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_017 | 破产财产变价方案 | 管理人 | 制定财产变价方案 |
| TASK_018 | 破产费用与共益债务 | 管理人 | 确认破产费用和共益债务 |
| TASK_019 | 破产财产分配方案 | 管理人 | 制定财产分配方案 |

### 第七阶段：程序终结

| 任务编码 | 任务名称 | 执行主体 | 说明 |
|---------|---------|---------|------|
| TASK_020 | 提请终结破产程序 | 管理人 | 提请法院终结破产程序 |
| TASK_021 | 法院裁定并公告 | 法院 | 裁定终结破产程序并公告 |
| TASK_022 | 办理企业注销登记 | 管理人 | 办理债务人企业注销登记 |
| TASK_023 | 管理人终止执行职务并归档 | 管理人 | 终止职务并归档 |

---

## 二、案件任务管理 API

### 基础信息

- **基础路径**: `/api/v1/api/case-tasks`
- **Content-Type**: `application/json`

---

### 2.1 查询案件任务列表

**接口地址**: `GET /api/v1/api/case-tasks`

**接口说明**: 分页查询指定案件的任务列表，支持按状态和任务编码筛选

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| status | String | 否 | 任务状态：IN_PROGRESS(进行中)、COMPLETED(已完成)、CLOSED(已关闭) |
| taskCode | String | 否 | 任务编码，如：TASK_001 |
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |

**请求示例**:
```http
GET /api/v1/api/case-tasks?caseId=1&status=IN_PROGRESS&page=1&size=10
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object | 分页数据 |
| data.content | Array | 任务列表 |
| data.content[].id | Long | 任务ID |
| data.content[].caseId | Long | 案件ID |
| data.content[].taskCode | String | 任务编码 |
| data.content[].taskName | String | 任务名称 |
| data.content[].taskDescription | String | 任务描述/执行主体 |
| data.content[].status | String | 任务状态 |
| data.content[].sortOrder | int | 排序号 |
| data.content[].createTime | String | 创建时间 |
| data.content[].updateTime | String | 更新时间 |
| data.totalElements | int | 总记录数 |
| data.totalPages | int | 总页数 |
| data.number | int | 当前页码 |
| data.size | int | 每页大小 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "content": [
      {
        "id": 1,
        "caseId": 1,
        "taskCode": "TASK_001",
        "taskName": "提交破产申请材料",
        "taskDescription": "申请人",
        "status": "IN_PROGRESS",
        "sortOrder": 1,
        "createTime": "2026-01-15T10:30:00",
        "updateTime": "2026-01-15T10:30:00"
      },
      {
        "id": 2,
        "caseId": 1,
        "taskCode": "TASK_002",
        "taskName": "裁定受理并公告",
        "taskDescription": "法院",
        "status": "IN_PROGRESS",
        "sortOrder": 2,
        "createTime": "2026-01-15T10:30:00",
        "updateTime": "2026-01-15T10:30:00"
      }
    ],
    "totalElements": 23,
    "totalPages": 3,
    "number": 0,
    "size": 10
  }
}
```

---

### 2.2 查询单个任务详情

**接口地址**: `GET /api/v1/api/case-tasks/{id}`

**接口说明**: 查询指定任务的详细信息，包含关联的案件信息和文件列表

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 任务ID |

**请求示例**:
```http
GET /api/v1/api/case-tasks/1
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Object | 任务详情 |
| data.id | Long | 任务ID |
| data.caseId | Long | 案件ID |
| data.caseNumber | String | 案件编号 |
| data.taskCode | String | 任务编码 |
| data.taskName | String | 任务名称 |
| data.taskDescription | String | 任务描述 |
| data.status | String | 任务状态 |
| data.createTime | String | 创建时间 |
| data.updateTime | String | 更新时间 |
| data.files | Array | 关联文件列表 |
| data.files[].id | Long | 文件ID |
| data.files[].originalFileName | String | 原始文件名 |
| data.files[].filePath | String | 文件路径 |
| data.files[].fileSize | Long | 文件大小 |
| data.files[].uploadTime | String | 上传时间 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "caseNumber": "(2026)京01破申1号",
    "taskCode": "TASK_001",
    "taskName": "提交破产申请材料",
    "taskDescription": "申请人",
    "status": "IN_PROGRESS",
    "createTime": "2026-01-15T10:30:00",
    "updateTime": "2026-01-15T10:30:00",
    "files": [
      {
        "id": 1,
        "originalFileName": "破产申请书.pdf",
        "filePath": "/uploads/2026/01/15/bankruptcy_application_001.pdf",
        "fileSize": 1024567,
        "uploadTime": "2026-01-15T10:35:00"
      }
    ]
  }
}
```

---

### 2.3 更新任务信息

**接口地址**: `PATCH /api/v1/api/case-tasks/{id}`

**接口说明**: 更新指定任务的信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 任务ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskName | String | 否 | 任务名称 |
| taskDescription | String | 否 | 任务描述 |
| status | String | 否 | 任务状态：IN_PROGRESS、COMPLETED、CLOSED |

**请求示例**:
```http
PATCH /api/v1/api/case-tasks/1
Content-Type: application/json

{
  "taskName": "提交破产申请材料（已更新）",
  "status": "COMPLETED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "taskCode": "TASK_001",
    "taskName": "提交破产申请材料（已更新）",
    "taskDescription": "申请人",
    "status": "COMPLETED",
    "sortOrder": 1,
    "createTime": "2026-01-15T10:30:00",
    "updateTime": "2026-01-15T11:00:00"
  }
}
```

---

### 2.4 批量更新任务状态

**接口地址**: `PUT /api/v1/api/case-tasks/batch-status`

**接口说明**: 批量更新多个任务的状态

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskIds | Array<Long> | 是 | 任务ID列表 |
| status | String | 是 | 目标状态 |

**请求示例**:
```http
PUT /api/v1/api/case-tasks/batch-status
Content-Type: application/json

{
  "taskIds": [1, 2, 3],
  "status": "COMPLETED"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Object | 批量更新结果 |
| data.successCount | int | 成功更新数量 |
| data.failCount | int | 失败更新数量 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "successCount": 3,
    "failCount": 0
  }
}
```

---

### 2.5 案件任务统计

**接口地址**: `GET /api/v1/api/case-tasks/statistics/{caseId}`

**接口说明**: 获取指定案件的任务统计信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |

**请求示例**:
```http
GET /api/v1/api/case-tasks/statistics/1
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Object | 统计数据 |
| data.totalTasks | int | 总任务数 |
| data.completedTasks | int | 已完成任务数 |
| data.inProgressTasks | int | 进行中任务数 |
| data.pendingTasks | int | 待处理任务数 |
| data.completionRate | double | 完成率 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalTasks": 23,
    "completedTasks": 8,
    "inProgressTasks": 10,
    "pendingTasks": 5,
    "completionRate": 34.78
  }
}
```

---

### 2.6 上传任务文件

**接口地址**: `POST /api/v1/api/case-tasks/{taskId}/files`

**接口说明**: 为指定任务上传附件文件

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | Long | 是 | 任务ID |

**请求参数** (multipart/form-data):

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| file | File | 是 | 上传的文件 |
| description | String | 否 | 文件描述 |

**请求示例**:
```http
POST /api/v1/api/case-tasks/1/files
Content-Type: multipart/form-data

file: [二进制文件数据]
description: "破产申请书扫描件"
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Object | 文件信息 |
| data.id | Long | 文件ID |
| data.originalFileName | String | 原始文件名 |
| data.filePath | String | 文件存储路径 |
| data.fileSize | Long | 文件大小（字节） |
| data.uploadTime | String | 上传时间 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalFileName": "破产申请书.pdf",
    "filePath": "/uploads/2026/01/15/bankruptcy_application_001.pdf",
    "fileSize": 1024567,
    "uploadTime": "2026-01-15T10:35:00"
  }
}
```

---

### 2.7 查询任务文件列表

**接口地址**: `GET /api/v1/api/case-tasks/{taskId}/files`

**接口说明**: 查询指定任务的所有附件文件

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | Long | 是 | 任务ID |

**请求示例**:
```http
GET /api/v1/api/case-tasks/1/files
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Array | 文件列表 |
| data[].id | Long | 文件ID |
| data[].originalFileName | String | 原始文件名 |
| data[].filePath | String | 文件路径 |
| data[].fileSize | Long | 文件大小 |
| data[].uploadTime | String | 上传时间 |
| data[].description | String | 文件描述 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "originalFileName": "破产申请书.pdf",
      "filePath": "/uploads/2026/01/15/bankruptcy_application_001.pdf",
      "fileSize": 1024567,
      "uploadTime": "2026-01-15T10:35:00",
      "description": "破产申请书扫描件"
    },
    {
      "id": 2,
      "originalFileName": "财务报表.xlsx",
      "filePath": "/uploads/2026/01/15/financial_report_001.xlsx",
      "fileSize": 512345,
      "uploadTime": "2026-01-15T10:40:00",
      "description": "近三年财务报表"
    }
  ]
}
```

---

### 2.8 删除任务文件

**接口地址**: `DELETE /api/v1/api/case-tasks/{taskId}/files/{fileId}`

**接口说明**: 删除指定任务的附件文件

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | Long | 是 | 任务ID |
| fileId | Long | 是 | 文件ID |

**请求示例**:
```http
DELETE /api/v1/api/case-tasks/1/files/2
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

## 三、案件流程阶段管理 API

### 基础信息

- **基础路径**: `/api/v1/api/case-process-stage`
- **Content-Type**: `application/json`

---

### 3.1 新增阶段数据

**接口地址**: `POST /api/v1/api/case-process-stage`

**接口说明**: 为案件创建流程阶段数据

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| stageNum | Integer | 是 | 阶段编号(1-7) |
| stageName | String | 是 | 阶段名称 |
| moduleCode | String | 是 | 模块编码 |
| moduleName | String | 是 | 模块名称 |
| title | String | 否 | 标题 |
| content | String | 否 | 内容 |
| processDate | String | 否 | 处理日期，格式：yyyy-MM-dd HH:mm:ss |
| fieldData | String | 是 | 模块特有字段数据(JSON格式) |
| status | String | 否 | 状态 |

**请求示例**:
```http
POST /api/v1/api/case-process-stage
Content-Type: application/json

{
  "caseId": 1,
  "stageNum": 1,
  "stageName": "申请与受理",
  "moduleCode": "BANKRUPTCY_APPLY",
  "moduleName": "破产申请",
  "title": "破产申请材料提交",
  "content": "申请人提交了完整的破产申请材料",
  "processDate": "2026-01-15 10:30:00",
  "fieldData": "{\"applicant\": \"张三\", \"applicationDate\": \"2026-01-15\"}",
  "status": "COMPLETED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 3.2 新增阶段数据(带文件)

**接口地址**: `POST /api/v1/api/case-process-stage/with-files`

**接口说明**: 创建阶段数据并上传附件文件

**请求参数** (multipart/form-data):

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| stageNum | Integer | 是 | 阶段编号 |
| stageName | String | 是 | 阶段名称 |
| moduleCode | String | 是 | 模块编码 |
| moduleName | String | 是 | 模块名称 |
| title | String | 否 | 标题 |
| content | String | 否 | 内容 |
| processDate | String | 否 | 处理日期 |
| files | Array<File> | 否 | 附件文件列表 |
| fieldData | String | 是 | 模块字段数据(JSON) |
| status | String | 否 | 状态 |

**请求示例**:
```http
POST /api/v1/api/case-process-stage/with-files
Content-Type: multipart/form-data

caseId: 1
stageNum: 1
stageName: 申请与受理
moduleCode: BANKRUPTCY_APPLY
moduleName: 破产申请
fieldData: {"applicant": "张三"}
files: [文件1, 文件2]
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 3.3 更新阶段数据

**接口地址**: `PUT /api/v1/api/case-process-stage/{id}`

**接口说明**: 更新指定阶段数据

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 阶段数据ID |

**请求体参数**: 同3.1

**请求示例**:
```http
PUT /api/v1/api/case-process-stage/1
Content-Type: application/json

{
  "caseId": 1,
  "stageNum": 1,
  "stageName": "申请与受理",
  "moduleCode": "BANKRUPTCY_APPLY",
  "moduleName": "破产申请",
  "title": "破产申请材料提交（已更新）",
  "content": "更新后的内容",
  "fieldData": "{\"applicant\": \"张三\", \"status\": \"approved\"}"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 3.4 更新阶段数据(带文件)

**接口地址**: `PUT /api/v1/api/case-process-stage/{id}/with-files`

**接口说明**: 更新阶段数据并上传附件

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 阶段数据ID |

**请求参数**: 同3.2（所有字段均为可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 3.5 删除阶段数据

**接口地址**: `DELETE /api/v1/api/case-process-stage/{id}`

**接口说明**: 删除指定阶段数据

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 阶段数据ID |

**请求示例**:
```http
DELETE /api/v1/api/case-process-stage/1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 3.6 查询单个阶段数据

**接口地址**: `GET /api/v1/api/case-process-stage/{id}`

**接口说明**: 查询指定阶段数据详情

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | Long | 是 | 阶段数据ID |

**请求示例**:
```http
GET /api/v1/api/case-process-stage/1
```

**响应参数**:

| 参数名 | 类型 | 说明 |
|-------|------|------|
| code | int | 状态码 |
| message | String | 响应消息 |
| data | Object | 阶段数据详情 |
| data.id | Long | 数据ID |
| data.caseId | Long | 案件ID |
| data.stageNum | Integer | 阶段编号 |
| data.stageName | String | 阶段名称 |
| data.moduleCode | String | 模块编码 |
| data.moduleName | String | 模块名称 |
| data.title | String | 标题 |
| data.content | String | 内容 |
| data.processDate | String | 处理日期 |
| data.attachments | String | 附件信息(JSON) |
| data.fieldData | String | 字段数据(JSON) |
| data.createTime | String | 创建时间 |
| data.updateTime | String | 更新时间 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "stageNum": 1,
    "stageName": "申请与受理",
    "moduleCode": "BANKRUPTCY_APPLY",
    "moduleName": "破产申请",
    "title": "破产申请材料提交",
    "content": "申请人提交了完整的破产申请材料",
    "processDate": "2026-01-15T10:30:00",
    "attachments": "[{\"fileId\": 1, \"fileName\": \"破产申请书.pdf\"}]",
    "fieldData": "{\"applicant\": \"张三\", \"applicationDate\": \"2026-01-15\"}",
    "createTime": "2026-01-15T10:30:00",
    "updateTime": "2026-01-15T11:00:00"
  }
}
```

---

### 3.7 查询案件的所有阶段数据

**接口地址**: `GET /api/v1/api/case-process-stage/case/{caseId}`

**接口说明**: 查询指定案件的所有流程阶段数据

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |

**请求示例**:
```http
GET /api/v1/api/case-process-stage/case/1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "caseId": 1,
      "stageNum": 1,
      "stageName": "申请与受理",
      "moduleCode": "BANKRUPTCY_APPLY",
      "moduleName": "破产申请",
      "title": "破产申请材料提交",
      "content": "申请人提交了完整的破产申请材料",
      "processDate": "2026-01-15T10:30:00",
      "fieldData": "{\"applicant\": \"张三\"}"
    },
    {
      "id": 2,
      "caseId": 1,
      "stageNum": 2,
      "stageName": "管理人接管",
      "moduleCode": "ADMINISTRATOR_TAKEOVER",
      "moduleName": "接管管理",
      "title": "全面接管债务人",
      "content": "管理人已完成对债务人的全面接管",
      "processDate": "2026-01-20T14:00:00",
      "fieldData": "{\"administrator\": \"李四律师事务所\"}"
    }
  ]
}
```

---

### 3.8 查询案件的特定阶段数据

**接口地址**: `GET /api/v1/api/case-process-stage/case/{caseId}/stage/{stageNum}`

**接口说明**: 查询指定案件的特定阶段数据

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| stageNum | Integer | 是 | 阶段编号(1-7) |

**请求示例**:
```http
GET /api/v1/api/case-process-stage/case/1/stage/1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "caseId": 1,
      "stageNum": 1,
      "stageName": "申请与受理",
      "moduleCode": "BANKRUPTCY_APPLY",
      "moduleName": "破产申请",
      "title": "破产申请材料提交",
      "content": "申请人提交了完整的破产申请材料",
      "fieldData": "{\"applicant\": \"张三\"}"
    }
  ]
}
```

---

### 3.9 查询案件的特定模块数据

**接口地址**: `GET /api/v1/api/case-process-stage/case/{caseId}/module/{moduleCode}`

**接口说明**: 查询指定案件的特定模块数据

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| moduleCode | String | 是 | 模块编码 |

**请求示例**:
```http
GET /api/v1/api/case-process-stage/case/1/module/BANKRUPTCY_APPLY
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "caseId": 1,
      "stageNum": 1,
      "stageName": "申请与受理",
      "moduleCode": "BANKRUPTCY_APPLY",
      "moduleName": "破产申请",
      "title": "破产申请材料提交",
      "content": "申请人提交了完整的破产申请材料",
      "fieldData": "{\"applicant\": \"张三\"}"
    }
  ]
}
```

---

### 3.10 根据案件ID和模块编码更新状态

**接口地址**: `PUT /api/v1/api/case-process-stage/update-status`

**接口说明**: 根据案件ID和模块编码批量更新阶段状态

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | Long | 是 | 案件ID |
| moduleCode | String | 是 | 模块编码 |
| status | String | 是 | 目标状态 |

**请求示例**:
```http
PUT /api/v1/api/case-process-stage/update-status
Content-Type: application/json

{
  "caseId": 1,
  "moduleCode": "BANKRUPTCY_APPLY",
  "status": "COMPLETED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

## 四、数据字典

### 4.1 任务状态 (CaseTaskStatus)

| 状态值 | 说明 |
|-------|------|
| IN_PROGRESS | 进行中 |
| COMPLETED | 已完成 |
| CLOSED | 已关闭 |

### 4.2 案件状态 (CaseStatus)

| 状态值 | 说明 |
|-------|------|
| PENDING | 待处理 |
| IN_PROGRESS | 进行中 |
| COMPLETED | 已完成 |
| CLOSED | 已结案 |
| TERMINATED | 已终结 |
| ARCHIVED | 已归档 |

### 4.3 阶段编号与名称对照

| 阶段编号 | 阶段名称 |
|---------|---------|
| 1 | 申请与受理 |
| 2 | 管理人接管 |
| 3 | 债权申报与审查 |
| 4 | 债权人会议 |
| 5 | 重整和解及破产宣告 |
| 6 | 财产变价与分配 |
| 7 | 程序终结 |

---

## 五、错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 六、附录

### 6.1 任务编码规则

任务编码格式：`TASK_XXX`
- TASK_001 至 TASK_002：第一阶段（申请与受理）
- TASK_003 至 TASK_007：第二阶段（管理人接管）
- TASK_008 至 TASK_011：第三阶段（债权申报与审查）
- TASK_012 至 TASK_013：第四阶段（债权人会议）
- TASK_014 至 TASK_016：第五阶段（重整和解及破产宣告）
- TASK_017 至 TASK_019：第六阶段（财产变价与分配）
- TASK_020 至 TASK_023：第七阶段（程序终结）

### 6.2 常用模块编码

| 模块编码 | 模块名称 | 所属阶段 |
|---------|---------|---------|
| BANKRUPTCY_APPLY | 破产申请 | 1 |
| ADMINISTRATOR_TAKEOVER | 接管管理 | 2 |
| CREDITOR_CLAIM | 债权申报 | 3 |
| CREDITOR_MEETING | 债权人会议 | 4 |
| BANKRUPTCY_DECLARATION | 破产宣告 | 5 |
| PROPERTY_DISTRIBUTION | 财产分配 | 6 |
| PROCEDURE_TERMINATION | 程序终结 | 7 |
