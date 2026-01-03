# 案件详情页面第一阶段任务完整API文档

## 1. 制度管理 API

### 1.1 新增制度管理

**接口地址**: `POST /api/case/phase1/managementSystem/add`

**请求体**:
```json
{
  "sepLd": 1,                // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "zdlx": "财务制度",        // 制度类型
  "zdmc": "财务管理制度",    // 制度名称
  "zdnr": "财务管理制度内容", // 制度内容
  "sxrq": "2024-01-01",     // 生效日期
  "zt": "1",                // 状态
  "sepAuser": "admin"       // 创建者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 1.2 修改制度管理

**接口地址**: `POST /api/case/phase1/managementSystem/update`

**请求体**:
```json
{
  "sepId": 1,                // 单据号
  "sepLd": 1,                // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "zdlx": "财务制度",        // 制度类型
  "zdmc": "财务管理制度(修订)", // 制度名称
  "zdnr": "修订后的财务管理制度内容", // 制度内容
  "sxrq": "2024-01-01",     // 生效日期
  "zt": "1",                // 状态
  "sepEuser": "admin"       // 修改者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 1.3 删除制度管理

**接口地址**: `GET /api/case/phase1/managementSystem/delete/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 1.4 根据ID获取制度管理

**接口地址**: `GET /api/case/phase1/managementSystem/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sepId": 1,
    "sepLd": 1,
    "sepMd": 1,
    "sepNd": "2024",
    "zdlx": "财务制度",
    "zdmc": "财务管理制度",
    "zdnr": "财务管理制度内容",
    "sxrq": "2024-01-01T00:00:00",
    "zt": "1",
    "sepAuser": "admin",
    "sepAdate": "2024-01-01T10:00:00",
    "sepEuser": null,
    "sepEdate": null
  }
}
```

### 1.5 根据案件ID获取制度管理列表

**接口地址**: `GET /api/case/phase1/managementSystem/listByCase/{sepLd}`

**请求参数**:
- `sepLd`: 案件ID (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": 1,
      "sepLd": 1,
      "sepMd": 1,
      "sepNd": "2024",
      "zdlx": "财务制度",
      "zdmc": "财务管理制度",
      "zdnr": "财务管理制度内容",
      "sxrq": "2024-01-01T00:00:00",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

### 1.6 获取所有制度管理

**接口地址**: `GET /api/case/phase1/managementSystem/list`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": 1,
      "sepLd": 1,
      "sepMd": 1,
      "sepNd": "2024",
      "zdlx": "财务制度",
      "zdmc": "财务管理制度",
      "zdnr": "财务管理制度内容",
      "sxrq": "2024-01-01T00:00:00",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

## 2. 账户印章管理 API

### 2.1 新增账户印章管理

**接口地址**: `POST /api/case/phase1/accountSeal/add`

**请求体**:
```json
{
  "sepLd": "1",              // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "gllx": "账户管理",        // 管理类型
  "xmmc": "基本账户",        // 项目名称
  "clrq": "2024-01-01",     // 处理日期
  "clfs": "银行办理",        // 处理方式
  "cljg": "已完成",          // 处理结果
  "zmwjlj": "/upload/files/123.pdf", // 证明文件路径
  "zt": "1",                // 状态
  "sepAuser": "admin"       // 创建者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 2.2 修改账户印章管理

**接口地址**: `POST /api/case/phase1/accountSeal/update`

**请求体**:
```json
{
  "sepId": "1",              // 单据号
  "sepLd": "1",              // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "gllx": "账户管理",        // 管理类型
  "xmmc": "基本账户",        // 项目名称
  "clrq": "2024-01-01",     // 处理日期
  "clfs": "银行办理",        // 处理方式
  "cljg": "已完成",          // 处理结果
  "zmwjlj": "/upload/files/123.pdf", // 证明文件路径
  "zt": "1",                // 状态
  "sepEuser": "admin"       // 修改者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 2.3 删除账户印章管理

**接口地址**: `GET /api/case/phase1/accountSeal/delete/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 2.4 根据ID获取账户印章管理

**接口地址**: `GET /api/case/phase1/accountSeal/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sepId": "1",
    "sepLd": "1",
    "sepMd": 1,
    "sepNd": "2024",
    "gllx": "账户管理",
    "xmmc": "基本账户",
    "clrq": "2024-01-01T00:00:00",
    "clfs": "银行办理",
    "cljg": "已完成",
    "zmwjlj": "/upload/files/123.pdf",
    "zt": "1",
    "sepAuser": "admin",
    "sepAdate": "2024-01-01T10:00:00",
    "sepEuser": null,
    "sepEdate": null
  }
}
```

### 2.5 根据案件ID获取账户印章管理列表

**接口地址**: `GET /api/case/phase1/accountSeal/listByCase/{sepLd}`

**请求参数**:
- `sepLd`: 案件ID (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": "1",
      "sepLd": "1",
      "sepMd": 1,
      "sepNd": "2024",
      "gllx": "账户管理",
      "xmmc": "基本账户",
      "clrq": "2024-01-01T00:00:00",
      "clfs": "银行办理",
      "cljg": "已完成",
      "zmwjlj": "/upload/files/123.pdf",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

### 2.6 获取所有账户印章管理

**接口地址**: `GET /api/case/phase1/accountSeal/list`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": "1",
      "sepLd": "1",
      "sepMd": 1,
      "sepNd": "2024",
      "gllx": "账户管理",
      "xmmc": "基本账户",
      "clrq": "2024-01-01T00:00:00",
      "clfs": "银行办理",
      "cljg": "已完成",
      "zmwjlj": "/upload/files/123.pdf",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

## 3. 法律程序 API

### 3.1 新增法律程序

**接口地址**: `POST /api/case/phase1/legalProcedure/add`

**请求体**:
```json
{
  "sepLd": 1,                // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "cxlx": "破产申请",        // 程序类型
  "cxnr": "破产申请内容",    // 程序内容
  "zhrq": "2024-01-01",     // 执行日期
  "zt": "1",                // 执行状态
  "sepAuser": "admin"       // 创建者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.2 修改法律程序

**接口地址**: `POST /api/case/phase1/legalProcedure/update`

**请求体**:
```json
{
  "sepId": 1,                // 单据号
  "sepLd": 1,                // 案件ID
  "sepMd": 1,                // 模块ID
  "sepNd": "2024",          // 年度
  "cxlx": "破产申请",        // 程序类型
  "cxnr": "修订后的破产申请内容", // 程序内容
  "zhrq": "2024-01-01",     // 执行日期
  "zt": "2",                // 执行状态
  "sepEuser": "admin"       // 修改者
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.3 删除法律程序

**接口地址**: `GET /api/case/phase1/legalProcedure/delete/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.4 根据ID获取法律程序

**接口地址**: `GET /api/case/phase1/legalProcedure/{sepId}`

**请求参数**:
- `sepId`: 单据号 (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sepId": 1,
    "sepLd": 1,
    "sepMd": 1,
    "sepNd": "2024",
    "cxlx": "破产申请",
    "cxnr": "破产申请内容",
    "zhrq": "2024-01-01T00:00:00",
    "zt": "1",
    "sepAuser": "admin",
    "sepAdate": "2024-01-01T10:00:00",
    "sepEuser": null,
    "sepEdate": null
  }
}
```

### 3.5 根据案件ID获取法律程序列表

**接口地址**: `GET /api/case/phase1/legalProcedure/listByCase/{sepLd}`

**请求参数**:
- `sepLd`: 案件ID (路径参数)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": 1,
      "sepLd": 1,
      "sepMd": 1,
      "sepNd": "2024",
      "cxlx": "破产申请",
      "cxnr": "破产申请内容",
      "zhrq": "2024-01-01T00:00:00",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

### 3.6 获取所有法律程序

**接口地址**: `GET /api/case/phase1/legalProcedure/list`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sepId": 1,
      "sepLd": 1,
      "sepMd": 1,
      "sepNd": "2024",
      "cxlx": "破产申请",
      "cxnr": "破产申请内容",
      "zhrq": "2024-01-01T00:00:00",
      "zt": "1",
      "sepAuser": "admin",
      "sepAdate": "2024-01-01T10:00:00",
      "sepEuser": null,
      "sepEdate": null
    }
  ]
}
```

## 4. 通用响应格式

所有API返回统一的响应格式:

```json
{
  "code": 200,          // 状态码，200表示成功，其他表示失败
  "message": "success", // 响应消息
  "data": {}            // 响应数据，根据接口不同而变化
}
```

## 5. 状态码说明

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 6. 数据字典

### 6.1 制度管理(ManagementSystem)

| 字段名 | 类型 | 说明 |
|-------|------|------|
| sepId | Integer | 单据号 |
| sepLd | Integer | 案件ID |
| sepMd | Integer | 模块ID |
| sepNd | String | 年度 |
| zdlx | String | 制度类型 |
| zdmc | String | 制度名称 |
| zdnr | String | 制度内容 |
| sxrq | Date | 生效日期 |
| zt | String | 状态 |
| sepAuser | String | 创建者 |
| sepAdate | Date | 创建时间 |
| sepEuser | String | 修改者 |
| sepEdate | Date | 修改时间 |

### 6.2 账户印章管理(AccountSealManagement)

| 字段名 | 类型 | 说明 |
|-------|------|------|
| sepId | String | 单据号 |
| sepLd | String | 案件ID |
| sepMd | Integer | 模块ID |
| sepNd | String | 年度 |
| gllx | String | 管理类型 |
| xmmc | String | 项目名称 |
| clrq | Date | 处理日期 |
| clfs | String | 处理方式 |
| cljg | String | 处理结果 |
| zmwjlj | String | 证明文件路径 |
| zt | String | 状态 |
| sepAuser | String | 创建者 |
| sepAdate | Date | 创建时间 |
| sepEuser | String | 修改者 |
| sepEdate | Date | 修改时间 |

### 6.3 法律程序(LegalProcedure)

| 字段名 | 类型 | 说明 |
|-------|------|------|
| sepId | Integer | 单据号 |
| sepLd | Integer | 案件ID |
| sepMd | Integer | 模块ID |
| sepNd | String | 年度 |
| cxlx | String | 程序类型 |
| cxnr | String | 程序内容 |
| zhrq | Date | 执行日期 |
| zt | String | 执行状态 |
| sepAuser | String | 创建者 |
| sepAdate | Date | 创建时间 |
| sepEuser | String | 修改者 |
| sepEdate | Date | 修改时间 |
