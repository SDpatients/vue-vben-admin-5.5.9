# 债权管理系统 API 文档

## 1. 债权申报登记 (claim_registration)

### 1.1 查询债权列表

**接口地址**: `GET /api/web/getClaims`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| caseId | String | 是 | 案件ID |
| page | Integer | 是 | 页码 |
| size | Integer | 是 | 每页条数 |
| creditorName | String | 否 | 债权人名称（模糊查询） |
| registrationStatus | String | 否 | 登记状态（PENDING/APPROVED/REJECTED） |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 100,
    "pages": 10,
    "records": [
      {
        "id": 1,
        "case_id": "CASE001",
        "case_name": "测试案件",
        "debtor": "测试债务人",
        "polizi_account": "123456",
        "creditor_name": "测试债权人",
        "creditor_type": "企业",
        "credit_code": "91110000MA12345678",
        "legal_representative": "张三",
        "service_address": "北京市朝阳区",
        "agent_name": "李四",
        "agent_phone": "13800138000",
        "agent_id_card": "110101199001011234",
        "agent_address": "上海市浦东新区",
        "account_name": "测试账户",
        "bank_account": "6222021234567890123",
        "bank_name": "中国工商银行",
        "principal": 1000000.00,
        "interest": 50000.00,
        "penalty": 10000.00,
        "other_losses": 0.00,
        "total_amount": 1060000.00,
        "has_court_judgment": false,
        "has_execution": false,
        "has_collateral": false,
        "claim_nature": "普通债权",
        "claim_type": "合同纠纷",
        "claim_facts": "借款合同纠纷",
        "creditor_category": "金融机构",
        "claim_nature_manager": "管理员",
        "claim_identifier": "CLAIM001",
        "evidence_list": "证据清单",
        "evidence_materials": "证据材料",
        "evidence_attachments": "附件URL",
        "remarks": "备注信息",
        "registration_status": "PENDING",
        "created_by": "admin",
        "created_time": "2026-01-01T00:00:00",
        "updated_by": "admin",
        "updated_time": "2026-01-01T00:00:00"
      }
    ]
  }
}
```

### 1.2 添加债权申报

**接口地址**: `POST /api/web/addClaim`

**请求体**:

```json
{
  "case_id": "CASE001",
  "case_name": "测试案件",
  "debtor": "测试债务人",
  "polizi_account": "123456",
  "creditor_name": "测试债权人",
  "creditor_type": "企业",
  "credit_code": "91110000MA12345678",
  "legal_representative": "张三",
  "service_address": "北京市朝阳区",
  "agent_name": "李四",
  "agent_phone": "13800138000",
  "agent_id_card": "110101199001011234",
  "agent_address": "上海市浦东新区",
  "account_name": "测试账户",
  "bank_account": "6222021234567890123",
  "bank_name": "中国工商银行",
  "principal": 1000000.00,
  "interest": 50000.00,
  "penalty": 10000.00,
  "other_losses": 0.00,
  "total_amount": 1060000.00,
  "has_court_judgment": false,
  "has_execution": false,
  "has_collateral": false,
  "claim_nature": "普通债权",
  "claim_type": "合同纠纷",
  "claim_facts": "借款合同纠纷",
  "creditor_category": "金融机构",
  "claim_nature_manager": "管理员",
  "claim_identifier": "CLAIM001",
  "evidence_list": "证据清单",
  "evidence_materials": "证据材料",
  "evidence_attachments": "附件URL",
  "remarks": "备注信息",
  "registration_status": "PENDING",
  "created_by": "admin"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1"
  }
}
```

### 1.3 获取债权详情

**接口地址**: `GET /api/web/getClaimDetail/{claimId}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| claimId | Long | 是 | 债权ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "case_id": "CASE001",
    "case_name": "测试案件",
    "debtor": "测试债务人",
    "polizi_account": "123456",
    "creditor_name": "测试债权人",
    "creditor_type": "企业",
    "credit_code": "91110000MA12345678",
    "legal_representative": "张三",
    "service_address": "北京市朝阳区",
    "agent_name": "李四",
    "agent_phone": "13800138000",
    "agent_id_card": "110101199001011234",
    "agent_address": "上海市浦东新区",
    "account_name": "测试账户",
    "bank_account": "6222021234567890123",
    "bank_name": "中国工商银行",
    "principal": 1000000.00,
    "interest": 50000.00,
    "penalty": 10000.00,
    "other_losses": 0.00,
    "total_amount": 1060000.00,
    "has_court_judgment": false,
    "has_execution": false,
    "has_collateral": false,
    "claim_nature": "普通债权",
    "claim_type": "合同纠纷",
    "claim_facts": "借款合同纠纷",
    "creditor_category": "金融机构",
    "claim_nature_manager": "管理员",
    "claim_identifier": "CLAIM001",
    "evidence_list": "证据清单",
    "evidence_materials": "证据材料",
    "evidence_attachments": "附件URL",
    "remarks": "备注信息",
    "registration_status": "PENDING",
    "created_by": "admin",
    "created_time": "2026-01-01T00:00:00",
    "updated_by": "admin",
    "updated_time": "2026-01-01T00:00:00"
  }
}
```

### 1.4 更新债权信息

**接口地址**: `POST /api/web/updateClaim/{claimId}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| claimId | Long | 是 | 债权ID |

**请求体**:

```json
{
  "case_name": "更新后的案件名称",
  "debtor": "更新后的债务人",
  "creditor_name": "更新后的债权人",
  "principal": 1200000.00,
  "interest": 60000.00,
  "total_amount": 1260000.00,
  "registration_status": "APPROVED",
  "updated_by": "admin"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success"
}
```

### 1.5 删除债权

**接口地址**: `POST /api/web/deleteClaim/{claimId}`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| claimId | Long | 是 | 债权ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success"
}
```

## 2. 债权人信息管理 (creditor_info)

### 2.1 批量添加债权人

**接口地址**: `POST /api/web/batchAddCreditors`

**请求体**:

```json
{
  "caseId": "CASE001",
  "creditorsList": [
    {
      "creditor_name": "债权人1",
      "creditor_type": "企业",
      "contact_phone": "13800138000",
      "contact_email": "test1@example.com",
      "address": "北京市朝阳区",
      "id_number": "91110000MA12345678",
      "legal_representative": "张三",
      "registered_capital": "1000万",
      "created_by": "admin"
    },
    {
      "creditor_name": "债权人2",
      "creditor_type": "个人",
      "contact_phone": "13900139000",
      "contact_email": "test2@example.com",
      "address": "上海市浦东新区",
      "id_number": "110101199001011234",
      "created_by": "admin"
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "successCount": 2,
    "failedCount": 0
  }
}
```

### 2.2 添加单个债权人

**接口地址**: `POST /api/web/addCreditor`

**请求体**:

```json
{
  "case_id": "CASE001",
  "creditor_name": "测试债权人",
  "creditor_type": "企业",
  "contact_phone": "13800138000",
  "contact_email": "test@example.com",
  "address": "北京市朝阳区",
  "id_number": "91110000MA12345678",
  "legal_representative": "张三",
  "registered_capital": "1000万",
  "status": "ACTIVE",
  "created_by": "admin"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success"
}
```

### 2.3 更新债权人信息

**接口地址**: `POST /api/web/updateCreditor`

**请求体**:

```json
{
  "id": 1,
  "case_id": "CASE001",
  "creditor_name": "更新后的债权人",
  "creditor_type": "企业",
  "contact_phone": "13800138000",
  "contact_email": "updated@example.com",
  "address": "北京市海淀区",
  "id_number": "91110000MA12345678",
  "legal_representative": "李四",
  "registered_capital": "2000万",
  "status": "ACTIVE",
  "updated_by": "admin"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": 1
}
```

### 2.4 删除债权人

**接口地址**: `POST /api/web/deleteCreditor`

**请求体**:

```json
{
  "id": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": 1
}
```

## 3. 通用数据结构

### 3.1 响应格式

所有API返回统一的响应格式:

```json
{
  "code": 200,          // 状态码，200表示成功，其他表示失败
  "message": "success", // 响应消息
  "data": {}            // 响应数据，根据接口不同而变化
}
```

### 3.2 分页结果

分页查询接口返回的数据结构:

```json
{
  "count": 100,         // 总记录数
  "pages": 10,          // 总页数
  "records": []         // 当前页记录列表
}
```

## 4. 状态码说明

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或登录过期 |
| 403 | 没有权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 5. 注意事项

1. 所有日期时间格式均为ISO 8601格式，如：`2026-01-01T00:00:00`
2. 金额类型均为Decimal(18,2)，保留两位小数
3. 布尔类型字段使用true/false
4. 所有请求需要在请求头中携带有效的token
5. 上传文件时需要使用multipart/form-data格式
6. 批量操作时，建议每次不超过100条数据
