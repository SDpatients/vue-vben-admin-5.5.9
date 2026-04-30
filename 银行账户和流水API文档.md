# 银行账户和银行账户流水 API 接口文档

## 接口概述

本文档描述了银行账户管理和银行账户流水相关的API接口，包括账户的增删改查、密码管理、状态管理，以及交易流水的增删改查等功能。

---

## 通用说明

### 基础信息

- **基础路径**: 根据实际部署环境配置
- **认证方式**: 需要用户登录认证（JWT Token）
- **用户ID**: 系统自动从认证信息中获取当前用户ID，无需前端传递

### 统一响应格式

所有接口返回的数据格式如下：

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

**响应字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 响应状态码，200表示成功，500表示失败 |
| message | String | 响应消息 |
| data | Object | 响应数据，具体内容因接口而异 |

### 分页响应格式

列表接口返回的分页数据格式：

```json
{
  "total": 100,
  "list": [],
  "pageNum": 1,
  "pageSize": 10
}
```

**分页字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | Long | 总记录数 |
| list | Array | 当前页数据列表 |
| pageNum | Integer | 当前页码 |
| pageSize | Integer | 每页大小 |

### 枚举值说明

**账户状态 (status):**
- `ACTIVE`: 正常
- `INACTIVE`: 停用
- `DELETED`: 已删除

**账户类型 (accountType):**
- 根据实际业务定义，如：`BASIC`: 基本户, `GENERAL`: 一般户, `SPECIAL`: 专户等

**交易类型 (transactionType):**
- `IN`: 流入（收入）
- `OUT`: 流出（支出）

**业务类型 (businessType):**
- 根据实际业务定义

**币种 (currency):**
- 默认值: `CNY`（人民币）

---

## 一、银行账户管理

**基础路径**: `/bank-account`

### 1.1 创建银行账户

创建一个新的银行账户。

- **接口地址**: `POST /bank-account`
- **接口说明**: 创建银行账户，账户自动关联到当前登录用户

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountName | String | 否 | 账户名称 |
| bankName | String | 否 | 银行名称 |
| accountNumber | String | 否 | 账号 |
| accountType | String | 否 | 账户类型 |
| currency | String | 否 | 币种，默认CNY |
| currentBalance | BigDecimal | 否 | 当前余额 |
| openingDate | LocalDate | 否 | 开户日期，格式: yyyy-MM-dd |
| password | String | 否 | 账户密码 |
| caseId | Long | 否 | 关联的案件ID |

**请求示例:**

```json
{
  "accountName": "基本账户",
  "bankName": "中国工商银行",
  "accountNumber": "6222021234567890123",
  "accountType": "BASIC",
  "currency": "CNY",
  "currentBalance": 100000.00,
  "openingDate": "2024-01-01",
  "password": "123456",
  "caseId": 1
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accountId": 123
  }
}
```

---

### 1.2 银行账户列表（分页）

获取当前用户的银行账户列表，支持分页和多条件筛选。

- **接口地址**: `GET /bank-account/list`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| accountType | String | 否 | 账户类型筛选 |
| status | String | 否 | 账户状态筛选 |
| accountName | String | 否 | 账户名称（支持模糊查询） |
| caseId | Long | 否 | 案件ID筛选 |

**请求示例:**

```
GET /bank-account/list?pageNum=1&pageSize=10&accountType=BASIC&status=ACTIVE&caseId=1
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1,
        "accountName": "基本账户",
        "bankName": "中国工商银行",
        "accountNumber": "6222021234567890123",
        "accountType": "BASIC",
        "currency": "CNY",
        "currentBalance": 100000.00,
        "openingDate": "2024-01-01",
        "closingDate": null,
        "status": "ACTIVE",
        "caseId": 1,
        "caseNumber": "CASE20240001",
        "caseName": "某某破产案件",
        "createTime": "2024-01-01T10:00:00",
        "updateTime": "2024-01-01T10:00:00",
        "createUserId": 1,
        "updateUserId": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

**响应数据字段说明 (BankAccountResponse):**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 账户ID |
| accountName | String | 账户名称 |
| bankName | String | 银行名称 |
| accountNumber | String | 账号 |
| accountType | String | 账户类型 |
| currency | String | 币种 |
| currentBalance | BigDecimal | 当前余额 |
| openingDate | LocalDate | 开户日期 |
| closingDate | LocalDate | 销户日期 |
| status | String | 账户状态 |
| caseId | Long | 案件ID |
| caseNumber | String | 案件编号 |
| caseName | String | 案件名称 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| createUserId | Long | 创建人ID |
| updateUserId | Long | 更新人ID |

---

### 1.3 获取银行账户详情

获取指定银行账户的详细信息。

- **接口地址**: `GET /bank-account/{accountId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求示例:**

```
GET /bank-account/1
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "accountName": "基本账户",
    "bankName": "中国工商银行",
    "accountNumber": "6222021234567890123",
    "accountType": "BASIC",
    "currency": "CNY",
    "currentBalance": 100000.00,
    "openingDate": "2024-01-01",
    "closingDate": null,
    "status": "ACTIVE",
    "caseId": 1,
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-01T10:00:00",
    "createUserId": 1,
    "updateUserId": 1
  }
}
```

---

### 1.4 更新银行账户信息

更新指定银行账户的信息。

- **接口地址**: `PUT /bank-account/{accountId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountName | String | **是** | 账户名称 |
| currentBalance | BigDecimal | **是** | 当前余额（必须大于0） |
| caseId | Long | 否 | 案件ID |
| accountNumber | String | 否 | 账号 |
| accountType | String | 否 | 账户类型 |
| password | String | 否 | 密码 |
| currency | String | 否 | 币种 |
| openingDate | LocalDate | 否 | 开户日期 |
| closingDate | LocalDate | 否 | 销户日期 |
| status | String | 否 | 账户状态 |
| bankName | String | 否 | 银行名称 |

**请求示例:**

```json
{
  "accountName": "基本账户（已更新）",
  "currentBalance": 150000.00,
  "caseId": 1,
  "accountNumber": "6222021234567890123",
  "accountType": "BASIC",
  "currency": "CNY",
  "openingDate": "2024-01-01",
  "bankName": "中国工商银行"
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 1.5 修改银行账户密码

修改指定银行账户的密码。

- **接口地址**: `PUT /bank-account/{accountId}/password`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | String | **是** | 原密码 |
| newPassword | String | **是** | 新密码 |

**请求示例:**

```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 1.6 银行账户状态管理

修改银行账户的状态（启用/停用/删除）。

- **接口地址**: `PUT /bank-account/{accountId}/status`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | **是** | 状态值，可选: ACTIVE、INACTIVE、DELETED |

**请求示例:**

```json
{
  "status": "INACTIVE"
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 1.7 删除银行账户

删除指定的银行账户。

- **接口地址**: `DELETE /bank-account/{accountId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求示例:**

```
DELETE /bank-account/1
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 1.8 获取银行账户交易明细

获取指定银行账户的交易明细列表（分页）。

- **接口地址**: `GET /bank-account/{accountId}/transactions`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| transactionType | String | 否 | 交易类型: IN（流入）/ OUT（流出） |
| businessType | String | 否 | 业务类型 |
| startDate | LocalDate | 否 | 开始日期，格式: yyyy-MM-dd |
| endDate | LocalDate | 否 | 结束日期，格式: yyyy-MM-dd |

**请求示例:**

```
GET /bank-account/1/transactions?pageNum=1&pageSize=10&transactionType=IN&startDate=2024-01-01&endDate=2024-12-31
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "accountId": 1,
        "accountName": "基本账户",
        "accountNumber": "6222021234567890123",
        "bankName": "中国工商银行",
        "transactionType": "IN",
        "amount": 50000.00,
        "transactionDate": "2024-01-15",
        "summary": "收入款项",
        "businessType": "PAYMENT",
        "counterpartyAccount": "6222029876543210987",
        "counterpartyName": "对方公司",
        "balanceAfter": 150000.00,
        "attachmentId": null,
        "relatedBusinessId": null,
        "remark": "备注信息",
        "caseId": 1,
        "caseNumber": "CASE20240001",
        "caseName": "某某破产案件",
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "updateUserId": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 1.9 获取银行账户及全部交易明细

获取指定银行账户的详细信息以及所有交易记录，同时包含总流入和总流出金额。

- **接口地址**: `GET /bank-account/{accountId}/with-transactions`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求示例:**

```
GET /bank-account/1/with-transactions
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "accountName": "基本账户",
    "bankName": "中国工商银行",
    "accountNumber": "6222021234567890123",
    "accountType": "BASIC",
    "currency": "CNY",
    "currentBalance": 100000.00,
    "openingDate": "2024-01-01",
    "closingDate": null,
    "status": "ACTIVE",
    "caseId": 1,
    "caseNumber": "CASE20240001",
    "caseName": "某某破产案件",
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-01T10:00:00",
    "createUserId": 1,
    "updateUserId": 1,
    "transactions": [
      {
        "id": 1,
        "accountId": 1,
        "accountName": "基本账户",
        "accountNumber": "6222021234567890123",
        "bankName": "中国工商银行",
        "transactionType": "IN",
        "amount": 50000.00,
        "transactionDate": "2024-01-15",
        "summary": "收入款项",
        "businessType": "PAYMENT",
        "counterpartyAccount": "6222029876543210987",
        "counterpartyName": "对方公司",
        "balanceAfter": 150000.00,
        "attachmentId": null,
        "relatedBusinessId": null,
        "remark": "备注信息",
        "caseId": 1,
        "caseNumber": "CASE20240001",
        "caseName": "某某破产案件",
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "updateUserId": 1
      }
    ],
    "totalInflow": 200000.00,
    "totalOutflow": 50000.00
  }
}
```

**响应数据字段说明 (BankAccountWithTransactionsResponse):**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 账户ID |
| accountName | String | 账户名称 |
| bankName | String | 银行名称 |
| accountNumber | String | 账号 |
| accountType | String | 账户类型 |
| currency | String | 币种 |
| currentBalance | BigDecimal | 当前余额 |
| openingDate | LocalDate | 开户日期 |
| closingDate | LocalDate | 销户日期 |
| status | String | 账户状态 |
| caseId | Long | 案件ID |
| caseNumber | String | 案件编号 |
| caseName | String | 案件名称 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| createUserId | Long | 创建人ID |
| updateUserId | Long | 更新人ID |
| transactions | Array | 交易记录列表（BankAccountTransactionResponse） |
| totalInflow | BigDecimal | 总流入金额 |
| totalOutflow | BigDecimal | 总流出金额 |

---

## 二、账户交易明细管理

**基础路径**: `/bank-account-transaction`

### 2.1 创建交易记录

创建一条新的银行账户交易记录。

- **接口地址**: `POST /bank-account-transaction`
- **接口说明**: 创建交易记录，自动关联到当前登录用户

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 否 | 账户ID |
| transactionType | String | 否 | 交易类型: IN（流入）/ OUT（流出） |
| amount | BigDecimal | 否 | 交易金额 |
| transactionDate | LocalDate | 否 | 交易日期，格式: yyyy-MM-dd |
| summary | String | 否 | 交易摘要 |
| businessType | String | 否 | 业务类型 |
| counterpartyAccount | String | 否 | 对方账号 |
| counterpartyName | String | 否 | 对方户名 |
| balanceAfter | BigDecimal | 否 | 交易后余额 |
| attachmentId | Long | 否 | 附件ID |
| relatedBusinessId | Long | 否 | 关联业务ID |
| remark | String | 否 | 备注 |
| caseId | Long | 否 | 案件ID |

**请求示例:**

```json
{
  "accountId": 1,
  "transactionType": "IN",
  "amount": 50000.00,
  "transactionDate": "2024-01-15",
  "summary": "收入款项",
  "businessType": "PAYMENT",
  "counterpartyAccount": "6222029876543210987",
  "counterpartyName": "对方公司",
  "balanceAfter": 150000.00,
  "attachmentId": null,
  "relatedBusinessId": null,
  "remark": "备注信息",
  "caseId": 1
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "transactionId": 456
  }
}
```

---

### 2.2 交易记录列表（分页）

获取交易记录列表，支持分页和多条件筛选。

- **接口地址**: `GET /bank-account-transaction/list`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| accountId | Long | 否 | 账户ID筛选 |
| transactionType | String | 否 | 交易类型: IN（流入）/ OUT（流出） |
| businessType | String | 否 | 业务类型 |
| startDate | LocalDate | 否 | 开始日期，格式: yyyy-MM-dd |
| endDate | LocalDate | 否 | 结束日期，格式: yyyy-MM-dd |
| caseId | Long | 否 | 案件ID筛选 |

**请求示例:**

```
GET /bank-account-transaction/list?pageNum=1&pageSize=10&accountId=1&transactionType=IN&caseId=1&startDate=2024-01-01&endDate=2024-12-31
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "accountId": 1,
        "accountName": "基本账户",
        "accountNumber": "6222021234567890123",
        "bankName": "中国工商银行",
        "transactionType": "IN",
        "amount": 50000.00,
        "transactionDate": "2024-01-15",
        "summary": "收入款项",
        "businessType": "PAYMENT",
        "counterpartyAccount": "6222029876543210987",
        "counterpartyName": "对方公司",
        "balanceAfter": 150000.00,
        "attachmentId": null,
        "relatedBusinessId": null,
        "remark": "备注信息",
        "caseId": 1,
        "caseNumber": "CASE20240001",
        "caseName": "某某破产案件",
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "updateUserId": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

**响应数据字段说明 (BankAccountTransactionResponse):**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 交易记录ID |
| accountId | Long | 账户ID |
| accountName | String | 账户名称 |
| accountNumber | String | 账号 |
| bankName | String | 银行名称 |
| transactionType | String | 交易类型 |
| amount | BigDecimal | 交易金额 |
| transactionDate | LocalDate | 交易日期 |
| summary | String | 交易摘要 |
| businessType | String | 业务类型 |
| counterpartyAccount | String | 对方账号 |
| counterpartyName | String | 对方户名 |
| balanceAfter | BigDecimal | 交易后余额 |
| attachmentId | Long | 附件ID |
| relatedBusinessId | Long | 关联业务ID |
| remark | String | 备注 |
| caseId | Long | 案件ID |
| caseNumber | String | 案件编号 |
| caseName | String | 案件名称 |
| status | String | 状态 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| createUserId | Long | 创建人ID |
| updateUserId | Long | 更新人ID |

---

### 2.3 获取交易记录详情

获取指定交易记录的详细信息。

- **接口地址**: `GET /bank-account-transaction/{transactionId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| transactionId | Long | 是 | 交易记录ID |

**请求示例:**

```
GET /bank-account-transaction/1
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "accountId": 1,
    "accountName": "基本账户",
    "accountNumber": "6222021234567890123",
    "bankName": "中国工商银行",
    "transactionType": "IN",
    "amount": 50000.00,
    "transactionDate": "2024-01-15",
    "summary": "收入款项",
    "businessType": "PAYMENT",
    "counterpartyAccount": "6222029876543210987",
    "counterpartyName": "对方公司",
    "balanceAfter": 150000.00,
    "attachmentId": null,
    "relatedBusinessId": null,
    "remark": "备注信息",
    "caseId": 1,
    "status": "ACTIVE",
    "createTime": "2024-01-15T10:00:00",
    "updateTime": "2024-01-15T10:00:00",
    "createUserId": 1,
    "updateUserId": 1
  }
}
```

---

### 2.4 更新交易记录

更新指定交易记录的信息。

- **接口地址**: `PUT /bank-account-transaction/{transactionId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| transactionId | Long | 是 | 交易记录ID |

**请求参数:**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| transactionType | String | 否 | 交易类型: IN（流入）/ OUT（流出） |
| amount | BigDecimal | 否 | 交易金额 |
| transactionDate | LocalDate | 否 | 交易日期，格式: yyyy-MM-dd |
| summary | String | 否 | 交易摘要 |
| businessType | String | 否 | 业务类型 |
| counterpartyAccount | String | 否 | 对方账号 |
| counterpartyName | String | 否 | 对方户名 |
| balanceAfter | BigDecimal | 否 | 交易后余额 |
| attachmentId | Long | 否 | 附件ID |
| relatedBusinessId | Long | 否 | 关联业务ID |
| remark | String | 否 | 备注 |

**请求示例:**

```json
{
  "transactionType": "IN",
  "amount": 60000.00,
  "transactionDate": "2024-01-15",
  "summary": "收入款项（已更新）",
  "businessType": "PAYMENT",
  "counterpartyAccount": "6222029876543210987",
  "counterpartyName": "对方公司",
  "balanceAfter": 160000.00,
  "remark": "更新后的备注"
}
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 2.5 删除交易记录

删除指定的交易记录。

- **接口地址**: `DELETE /bank-account-transaction/{transactionId}`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| transactionId | Long | 是 | 交易记录ID |

**请求示例:**

```
DELETE /bank-account-transaction/1
```

**响应示例:**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 三、接口汇总

### 银行账户管理接口

| 序号 | 接口名称 | 请求方法 | 接口路径 | 说明 |
|------|---------|---------|---------|------|
| 1 | 创建银行账户 | POST | `/bank-account` | 创建新的银行账户 |
| 2 | 银行账户列表 | GET | `/bank-account/list` | 分页查询账户列表 |
| 3 | 获取账户详情 | GET | `/bank-account/{accountId}` | 获取单个账户详情 |
| 4 | 更新账户信息 | PUT | `/bank-account/{accountId}` | 更新账户基本信息 |
| 5 | 修改账户密码 | PUT | `/bank-account/{accountId}/password` | 修改账户密码 |
| 6 | 账户状态管理 | PUT | `/bank-account/{accountId}/status` | 修改账户状态 |
| 7 | 删除银行账户 | DELETE | `/bank-account/{accountId}` | 删除账户 |
| 8 | 获取交易明细 | GET | `/bank-account/{accountId}/transactions` | 分页查询交易明细 |
| 9 | 账户及全部交易 | GET | `/bank-account/{accountId}/with-transactions` | 获取账户及所有交易记录和汇总 |

### 账户交易明细管理接口

| 序号 | 接口名称 | 请求方法 | 接口路径 | 说明 |
|------|---------|---------|---------|------|
| 1 | 创建交易记录 | POST | `/bank-account-transaction` | 创建新的交易记录 |
| 2 | 交易记录列表 | GET | `/bank-account-transaction/list` | 分页查询交易记录 |
| 3 | 获取交易详情 | GET | `/bank-account-transaction/{transactionId}` | 获取单个交易记录详情 |
| 4 | 更新交易记录 | PUT | `/bank-account-transaction/{transactionId}` | 更新交易记录信息 |
| 5 | 删除交易记录 | DELETE | `/bank-account-transaction/{transactionId}` | 删除交易记录 |

---

## 四、注意事项

1. **认证要求**: 所有接口都需要用户登录后携带有效的JWT Token才能访问
2. **用户隔离**: 系统自动根据当前登录用户ID进行数据隔离，用户只能操作自己创建的账户和交易记录
3. **日期格式**: 所有日期字段格式均为 `yyyy-MM-dd`，如: `2024-01-15`
4. **时间格式**: 时间字段格式为 ISO 8601，如: `2024-01-15T10:00:00`
5. **金额精度**: 金额字段使用 BigDecimal 类型，建议前端保留两位小数
6. **分页参数**: 分页接口默认第一页，每页10条数据
7. **必填校验**: 标注为"必填"的字段必须传递，否则接口会返回参数校验错误
8. **状态值**: 状态字段必须使用规定的枚举值，否则会导致校验失败

---

## 五、错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 500 | 服务器内部错误 |
| 其他 | 具体错误信息请参考 message 字段 |

---

## 六、常见问题

### Q1: 如何关联案件？

在创建或更新银行账户、交易记录时，通过传递 `caseId` 字段来关联到指定案件。

### Q2: 交易明细和账户的关系？

交易记录通过 `accountId` 关联到银行账户。可以通过账户ID查询该账户的所有交易明细，也可以通过交易列表接口按账户ID筛选。

### Q3: 如何获取账户的总流入和总流出？

使用接口 `GET /bank-account/{accountId}/with-transactions` 可以获取账户详情、所有交易记录以及总流入(`totalInflow`)和总流出(`totalOutflow`)金额。

### Q4: 账户状态有哪些？

- `ACTIVE`: 正常状态
- `INACTIVE`: 停用状态
- `DELETED`: 已删除状态

### Q5: 交易类型有哪些？

- `IN`: 流入（收入）
- `OUT`: 流出（支出）
