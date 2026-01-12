# 资金管理API文档

**文档版本**: 1.0
**编写日期**: 2026-01-08
**适用项目**: 破产案件管理系统

---

## 目录

- [API概述](#api概述)
- [基础URL](#基础url)
- [认证方式](#认证方式)
- [通用响应格式](#通用响应格式)
- [错误码说明](#错误码说明)
- [资金账户管理API](#资金账户管理api)
- [资金流水管理API](#资金流水管理api)
- [资金审批管理API](#资金审批管理api)
- [资金操作日志API](#资金操作日志api)
- [接口调用顺序说明](#接口调用顺序说明)
- [注意事项](#注意事项)

---

## API概述

本API文档提供了资金管理相关的完整接口，包括资金账户管理、资金流水管理、资金审批管理和资金操作日志管理。所有接口均遵循RESTful设计规范，支持JSON格式的请求和响应。

### 功能模块

1. **资金账户管理**：管理破产案件中的资金账户，包括账户的创建、查询、更新、删除和余额管理
2. **资金流水管理**：记录和管理资金账户的收支流水，包括流水的创建、查询、更新和删除
3. **资金审批管理**：管理资金操作的审批流程，包括审批的创建、查询、审批和状态管理
4. **资金操作日志**：记录所有资金相关的操作日志，包括日志的创建、查询、更新和删除

### 技术架构

- **框架**: Spring Boot + Spring MVC + JPA
- **数据库**: MySQL 8.0
- **认证方式**: JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 基础URL

```
开发环境: http://localhost:8080/api
测试环境: http://test.example.com/api
生产环境: http://prod.example.com/api
```

---

## 认证方式

所有API接口（除登录接口外）都需要在请求头中携带JWT Token进行身份认证。

### 请求头格式

```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Token获取

通过用户登录接口获取Token，Token有效期为24小时。

---

## 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": []
  }
}
```

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 操作成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权或Token过期 | 重新登录获取新Token |
| 403 | 无权限访问 | 检查用户权限配置 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 500 | 服务器内部错误 | 联系系统管理员 |
| 1001 | 资金账户不存在 | 检查账户ID是否正确 |
| 1002 | 资金流水不存在 | 检查流水ID是否正确 |
| 1003 | 资金审批不存在 | 检查审批ID是否正确 |
| 1004 | 资金操作日志不存在 | 检查日志ID是否正确 |
| 1005 | 该审批已处理，无法重复审批 | 检查审批状态 |
| 1006 | 余额不足 | 检查账户余额是否足够 |

---

## 资金账户管理API

### 1. 创建资金账户

**接口描述**: 创建新的资金账户

**请求路径**: `/fund-account`

**请求方法**: `POST`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "accountId": 1,
  "caseId": 1,
  "caseName": "某某公司破产案",
  "accountName": "破产资金专户",
  "accountType": "基本户",
  "initialBalance": 1000000.00,
  "bankName": "中国银行",
  "bankAccount": "1234567890123456"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| accountId | Long | 是 | 银行账户ID | - |
| caseId | Long | 是 | 案件ID | - |
| caseName | String | 是 | 案件名称 | - |
| accountName | String | 是 | 账户名称 | - |
| accountType | String | 是 | 账户类型（基本户/一般户/专用户） | - |
| initialBalance | BigDecimal | 是 | 初始余额 | - |
| bankName | String | 是 | 银行名称 | - |
| bankAccount | String | 是 | 银行账号 | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "fundAccountId": 1
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
```

---

### 2. 资金账户列表（分页）

**接口描述**: 查询资金账户列表，支持分页和条件筛选

**请求路径**: `/fund-account/list`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "accountId": 1,
        "caseId": 1,
        "caseName": "某某公司破产案",
        "accountName": "破产资金专户",
        "accountType": "基本户",
        "initialBalance": 1000000.00,
        "currentBalance": 950000.00,
        "bankName": "中国银行",
        "bankAccount": "1234567890123456",
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 3. 获取资金账户详情

**接口描述**: 根据ID获取资金账户详细信息

**请求路径**: `/fund-account/{fundAccountId}`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fundAccountId | Long | 是 | 资金账户ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "accountId": 1,
    "caseId": 1,
    "caseName": "某某公司破产案",
    "accountName": "破产资金专户",
    "accountType": "基本户",
    "initialBalance": 1000000.00,
    "currentBalance": 950000.00,
    "bankName": "中国银行",
    "bankAccount": "1234567890123456",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 4. 更新资金账户信息

**接口描述**: 更新资金账户的基本信息

**请求路径**: `/fund-account/{fundAccountId}`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fundAccountId | Long | 是 | 资金账户ID |

**请求体**:
```json
{
  "accountId": 1,
  "caseId": 1,
  "caseName": "某某公司破产案（更新）",
  "accountName": "破产资金专户（更新）",
  "accountType": "基本户",
  "bankName": "中国银行",
  "bankAccount": "1234567890123456"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 银行账户ID |
| caseId | Long | 是 | 案件ID |
| caseName | String | 是 | 案件名称 |
| accountName | String | 是 | 账户名称 |
| accountType | String | 是 | 账户类型 |
| bankName | String | 是 | 银行名称 |
| bankAccount | String | 是 | 银行账号 |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 5. 更新资金账户余额

**接口描述**: 更新资金账户的当前余额

**请求路径**: `/fund-account/{fundAccountId}/balance`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fundAccountId | Long | 是 | 资金账户ID |

**请求体**:
```json
{
  "currentBalance": 900000.00
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| currentBalance | BigDecimal | 是 | 当前余额 |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 6. 更新资金账户状态

**接口描述**: 更新资金账户的状态

**请求路径**: `/fund-account/{fundAccountId}/status`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fundAccountId | Long | 是 | 资金账户ID |

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 是 | 状态（ACTIVE/INACTIVE/DELETED） |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 7. 删除资金账户

**接口描述**: 删除资金账户

**请求路径**: `/fund-account/{fundAccountId}`

**请求方法**: `DELETE`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fundAccountId | Long | 是 | 资金账户ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

## 资金流水管理API

### 1. 创建资金流水

**接口描述**: 创建新的资金流水记录

**请求路径**: `/fund-flow`

**请求方法**: `POST`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "caseId": 1,
  "caseName": "某某公司破产案",
  "accountId": 1,
  "flowType": "INCOME",
  "amount": 50000.00,
  "balanceBefore": 900000.00,
  "balanceAfter": 950000.00,
  "transactionDate": "2026-01-08T10:00:00",
  "description": "收到债权人还款",
  "relatedDocument": "还款凭证001",
  "remark": "备注信息"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| caseId | Long | 是 | 案件ID | - |
| caseName | String | 是 | 案件名称 | - |
| accountId | Long | 是 | 账户ID | - |
| flowType | String | 是 | 流水类型（INCOME/EXPENSE） | - |
| amount | BigDecimal | 是 | 金额 | - |
| balanceBefore | BigDecimal | 是 | 变动前余额 | - |
| balanceAfter | BigDecimal | 是 | 变动后余额 | - |
| transactionDate | LocalDateTime | 是 | 交易日期 | - |
| description | String | 否 | 描述 | - |
| relatedDocument | String | 否 | 相关文档 | - |
| remark | String | 否 | 备注 | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "flowId": 1
  }
}
```

---

### 2. 资金流水列表（分页）

**接口描述**: 查询资金流水列表，支持分页和条件筛选

**请求路径**: `/fund-flow/list`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| accountId | Long | 否 | 资金账户ID | - |
| flowType | String | 否 | 流水类型（INCOME/EXPENSE） | - |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "caseName": "某某公司破产案",
        "accountId": 1,
        "flowType": "INCOME",
        "amount": 50000.00,
        "balanceBefore": 900000.00,
        "balanceAfter": 950000.00,
        "transactionDate": "2026-01-08T10:00:00",
        "description": "收到债权人还款",
        "relatedDocument": "还款凭证001",
        "operatorId": 1,
        "operationTime": "2026-01-08T10:00:00",
        "remark": "备注信息",
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 3. 获取资金流水详情

**接口描述**: 根据ID获取资金流水详细信息

**请求路径**: `/fund-flow/{flowId}`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| flowId | Long | 是 | 流水ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "caseName": "某某公司破产案",
    "accountId": 1,
    "flowType": "INCOME",
    "amount": 50000.00,
    "balanceBefore": 900000.00,
    "balanceAfter": 950000.00,
    "transactionDate": "2026-01-08T10:00:00",
    "description": "收到债权人还款",
    "relatedDocument": "还款凭证001",
    "operatorId": 1,
    "operationTime": "2026-01-08T10:00:00",
    "remark": "备注信息",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 4. 更新资金流水信息

**接口描述**: 更新资金流水的基本信息

**请求路径**: `/fund-flow/{flowId}`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| flowId | Long | 是 | 流水ID |

**请求体**:
```json
{
  "caseId": 1,
  "caseName": "某某公司破产案",
  "accountId": 1,
  "flowType": "INCOME",
  "amount": 50000.00,
  "balanceBefore": 900000.00,
  "balanceAfter": 950000.00,
  "transactionDate": "2026-01-08T10:00:00",
  "description": "收到债权人还款（更新）",
  "relatedDocument": "还款凭证001",
  "operatorId": 1,
  "operationTime": "2026-01-08T10:00:00",
  "remark": "备注信息"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 5. 更新资金流水状态

**接口描述**: 更新资金流水的状态

**请求路径**: `/fund-flow/{flowId}/status`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| flowId | Long | 是 | 流水ID |

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 6. 删除资金流水

**接口描述**: 删除资金流水

**请求路径**: `/fund-flow/{flowId}`

**请求方法**: `DELETE`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| flowId | Long | 是 | 流水ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

## 资金审批管理API

### 1. 创建资金审批

**接口描述**: 创建新的资金审批记录

**请求路径**: `/fund-approval`

**请求方法**: `POST`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "flowId": 1,
  "caseId": 1,
  "amount": 50000.00,
  "approvalContent": "申请支付债权人款项"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| flowId | Long | 是 | 流水ID | - |
| caseId | Long | 是 | 案件ID | - |
| amount | BigDecimal | 是 | 金额 | - |
| approvalContent | String | 否 | 审批内容 | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "approvalId": 1
  }
}
```

---

### 2. 资金审批列表（分页）

**接口描述**: 查询资金审批列表，支持分页和条件筛选

**请求路径**: `/fund-approval/list`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| approvalStatus | String | 否 | 审批状态（PENDING/APPROVED/REJECTED） | - |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "flowId": 1,
        "caseId": 1,
        "amount": 50000.00,
        "approvalStatus": "PENDING",
        "approvalContent": "申请支付债权人款项",
        "approverId": null,
        "approvalTime": null,
        "approvalOpinion": null,
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 3. 获取资金审批详情

**接口描述**: 根据ID获取资金审批详细信息

**请求路径**: `/fund-approval/{approvalId}`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalId | Long | 是 | 审批ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "flowId": 1,
    "caseId": 1,
    "amount": 50000.00,
    "approvalStatus": "PENDING",
    "approvalContent": "申请支付债权人款项",
    "approverId": null,
    "approvalTime": null,
    "approvalOpinion": null,
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 4. 更新资金审批信息

**接口描述**: 更新资金审批的基本信息

**请求路径**: `/fund-approval/{approvalId}`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalId | Long | 是 | 审批ID |

**请求体**:
```json
{
  "flowId": 1,
  "caseId": 1,
  "amount": 50000.00,
  "approvalContent": "申请支付债权人款项（更新）"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 5. 资金审批

**接口描述**: 对资金审批进行审批操作

**请求路径**: `/fund-approval/{approvalId}/approve`

**请求方法**: `POST`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalId | Long | 是 | 审批ID |

**请求体**:
```json
{
  "approvalStatus": "APPROVED",
  "approvalOpinion": "同意支付"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalStatus | String | 是 | 审批状态（APPROVED/REJECTED） |
| approvalOpinion | String | 否 | 审批意见 |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 6. 更新资金审批状态

**接口描述**: 更新资金审批的状态

**请求路径**: `/fund-approval/{approvalId}/status`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalId | Long | 是 | 审批ID |

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 7. 删除资金审批

**接口描述**: 删除资金审批

**请求路径**: `/fund-approval/{approvalId}`

**请求方法**: `DELETE`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalId | Long | 是 | 审批ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

## 资金操作日志API

### 1. 创建资金操作日志

**接口描述**: 创建新的资金操作日志

**请求路径**: `/fund-operation-log`

**请求方法**: `POST`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "caseId": 1,
  "operationType": "ACCOUNT_CREATE",
  "operationContent": "创建资金账户",
  "operatorId": 1,
  "ipAddress": "192.168.1.1",
  "browserInfo": "Chrome 120.0"
}
```

**请求参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| caseId | Long | 否 | 案件ID | - |
| operationType | String | 是 | 操作类型 | - |
| operationContent | String | 是 | 操作内容 | - |
| operatorId | Long | 是 | 操作人ID | - |
| ipAddress | String | 否 | IP地址 | - |
| browserInfo | String | 否 | 浏览器信息 | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "logId": 1
  }
}
```

---

### 2. 资金操作日志列表（分页）

**接口描述**: 查询资金操作日志列表，支持分页和条件筛选

**请求路径**: `/fund-operation-log/list`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| operationType | String | 否 | 操作类型 | - |
| status | String | 否 | 状态（ACTIVE/INACTIVE/DELETED） | - |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "operationType": "ACCOUNT_CREATE",
        "operationContent": "创建资金账户",
        "operatorId": 1,
        "operationTime": "2026-01-08T10:00:00",
        "ipAddress": "192.168.1.1",
        "browserInfo": "Chrome 120.0",
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 3. 获取资金操作日志详情

**接口描述**: 根据ID获取资金操作日志详细信息

**请求路径**: `/fund-operation-log/{logId}`

**请求方法**: `GET`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logId | Long | 是 | 日志ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "operationType": "ACCOUNT_CREATE",
    "operationContent": "创建资金账户",
    "operatorId": 1,
    "operationTime": "2026-01-08T10:00:00",
    "ipAddress": "192.168.1.1",
    "browserInfo": "Chrome 120.0",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 4. 更新资金操作日志信息

**接口描述**: 更新资金操作日志的基本信息

**请求路径**: `/fund-operation-log/{logId}`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logId | Long | 是 | 日志ID |

**请求体**:
```json
{
  "caseId": 1,
  "operationType": "ACCOUNT_CREATE",
  "operationContent": "创建资金账户（更新）",
  "operatorId": 1,
  "ipAddress": "192.168.1.1",
  "browserInfo": "Chrome 120.0"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 5. 更新资金操作日志状态

**接口描述**: 更新资金操作日志的状态

**请求路径**: `/fund-operation-log/{logId}/status`

**请求方法**: `PUT`

**请求头**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logId | Long | 是 | 日志ID |

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 6. 删除资金操作日志

**接口描述**: 删除资金操作日志

**请求路径**: `/fund-operation-log/{logId}`

**请求方法**: `DELETE`

**请求头**:
```http
Authorization: Bearer {token}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| logId | Long | 是 | 日志ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

## 接口调用顺序说明

### 资金账户管理流程

1. **创建账户**: 调用 `POST /fund-account` 创建新的资金账户
2. **查询账户**: 调用 `GET /fund-account/list` 查询账户列表或 `GET /fund-account/{fundAccountId}` 查询账户详情
3. **更新账户**: 调用 `PUT /fund-account/{fundAccountId}` 更新账户信息
4. **更新余额**: 调用 `PUT /fund-account/{fundAccountId}/balance` 更新账户余额
5. **删除账户**: 调用 `DELETE /fund-account/{fundAccountId}` 删除账户

### 资金流水管理流程

1. **创建流水**: 调用 `POST /fund-flow` 创建新的资金流水
2. **查询流水**: 调用 `GET /fund-flow/list` 查询流水列表或 `GET /fund-flow/{flowId}` 查询流水详情
3. **更新流水**: 调用 `PUT /fund-flow/{flowId}` 更新流水信息
4. **删除流水**: 调用 `DELETE /fund-flow/{flowId}` 删除流水

### 资金审批管理流程

1. **创建审批**: 调用 `POST /fund-approval` 创建新的资金审批
2. **查询审批**: 调用 `GET /fund-approval/list` 查询审批列表或 `GET /fund-approval/{approvalId}` 查询审批详情
3. **审批操作**: 调用 `POST /fund-approval/{approvalId}/approve` 进行审批
4. **删除审批**: 调用 `DELETE /fund-approval/{approvalId}` 删除审批

### 资金操作日志管理流程

1. **创建日志**: 调用 `POST /fund-operation-log` 创建新的操作日志
2. **查询日志**: 调用 `GET /fund-operation-log/list` 查询日志列表或 `GET /fund-operation-log/{logId}` 查询日志详情
3. **更新日志**: 调用 `PUT /fund-operation-log/{logId}` 更新日志信息
4. **删除日志**: 调用 `DELETE /fund-operation-log/{logId}` 删除日志

---

## 注意事项

### 1. 权限控制

- 所有接口都需要有效的JWT Token
- 不同角色可能有不同的操作权限
- 建议在调用接口前先验证用户权限

### 2. 数据验证

- 所有必填参数必须提供
- 金额字段必须为正数
- 日期时间格式必须符合ISO 8601标准
- 字符串字段长度不能超过数据库定义的最大长度

### 3. 业务约束

- 删除资金账户前，需确保该账户下没有未完成的流水或审批
- 资金审批只能审批一次，重复审批会返回错误
- 账户余额不能为负数
- 流水的balanceBefore和balanceAfter必须与账户余额一致

### 4. 性能优化

- 分页查询建议每页不超过100条记录
- 避免频繁调用详情接口，建议使用列表接口
- 大批量操作建议使用批量接口（如有）

### 5. 安全性

- Token需要妥善保管，避免泄露
- 敏感操作建议记录操作日志
- 定期更换Token
- 使用HTTPS协议传输数据

### 6. 错误处理

- 所有接口返回统一的错误格式
- 遇到错误时，请根据错误码和错误信息进行相应处理
- 如遇未知错误，请联系系统管理员

### 7. 数据一致性

- 更新操作会自动更新updateTime字段
- 删除操作建议使用逻辑删除（设置status为DELETED）
- 关联数据删除时需注意外键约束

### 8. 日志记录

- 所有关键操作都会自动记录到操作日志
- 日志包含操作人、操作时间、IP地址等信息
- 日志查询支持按操作类型和时间范围筛选

### 9. 并发控制

- 同一资源的并发更新可能导致数据不一致
- 建议使用乐观锁或悲观锁机制
- 批量操作建议使用事务控制

### 10. 测试建议

- 开发环境可以使用测试数据
- 生产环境操作前务必在测试环境验证
- 建议编写自动化测试用例
- 定期进行接口回归测试

---

## 附录

### 数据字典

#### 资金账户状态

| 状态值 | 说明 |
|--------|------|
| ACTIVE | 激活 |
| INACTIVE | 停用 |
| DELETED | 已删除 |

#### 流水类型

| 类型值 | 说明 |
|--------|------|
| INCOME | 收入 |
| EXPENSE | 支出 |

#### 审批状态

| 状态值 | 说明 |
|--------|------|
| PENDING | 待审批 |
| APPROVED | 已通过 |
| REJECTED | 已驳回 |

#### 操作类型

| 类型值 | 说明 |
|--------|------|
| ACCOUNT_CREATE | 创建账户 |
| ACCOUNT_UPDATE | 更新账户 |
| ACCOUNT_DELETE | 删除账户 |
| FLOW_CREATE | 创建流水 |
| FLOW_UPDATE | 更新流水 |
| FLOW_DELETE | 删除流水 |
| APPROVAL_CREATE | 创建审批 |
| APPROVAL_UPDATE | 更新审批 |
| APPROVAL_DELETE | 删除审批 |

---

## 联系方式

如有疑问或建议，请联系：

- **技术负责人**: [技术负责人姓名]
- **邮箱**: [技术负责人邮箱]
- **电话**: [技术负责人电话]

---

**文档结束**
