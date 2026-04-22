# 基础资料模块API文档

> **基础路径**: 根据项目配置，所有接口需在请求头中携带 `Authorization: Bearer {token}`
> 
> **统一响应格式**:
> ```json
> {
>   "code": 200,
>   "message": "成功",
>   "data": { ... }
> }
> ```

---

## 目录

- [一、债权人管理模块](#一债权人管理模块)
- [二、债务人管理模块](#二债务人管理模块)
- [三、法院管理模块](#三法院管理模块)
- [四、银行账户管理模块](#四银行账户管理模块)
- [五、工作计划管理模块](#五工作计划管理模块)
- [六、工作团队管理模块](#六工作团队管理模块)
- [七、管理人管理模块](#七管理人管理模块)

---

## 一、债权人管理模块

### 1. 创建债权人

**接口路径**: `POST /creditor`

**请求方法**: POST

**请求参数**:
```json
{
  "caseId": 1,
  "creditorName": "张三",
  "creditorType": "个人",
  "contactPhone": "13800138000",
  "contactEmail": "zhangsan@example.com",
  "address": "北京市朝阳区",
  "idNumber": "110101199001011234",
  "legalRepresentative": "张三",
  "registeredCapital": 1000000.00,
  "status": "KNOWN"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| creditorName | String | 是 | 债权人名称 |
| creditorType | String | 是 | 债权人类型（个人/企业） |
| contactPhone | String | 否 | 联系电话 |
| contactEmail | String | 否 | 联系邮箱 |
| address | String | 否 | 地址 |
| idNumber | String | 否 | 身份证号/统一社会信用代码 |
| legalRepresentative | String | 否 | 法定代表人 |
| registeredCapital | BigDecimal | 否 | 注册资本 |
| status | String | 否 | 状态（KNOWN-已知/CONFIRMED-确认） |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "creditorId": 1
  }
}
```

---

### 2. 获取债权人详情

**接口路径**: `GET /creditor/{creditorId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| creditorId | Long | 是 | 债权人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "creditorName": "张三",
    "creditorType": "个人",
    "contactPhone": "13800138000",
    "contactEmail": "zhangsan@example.com",
    "address": "北京市朝阳区",
    "idNumber": "110101199001011234",
    "legalRepresentative": "张三",
    "registeredCapital": 1000000.00,
    "status": "KNOWN",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 债权人列表（分页）

**接口路径**: `GET /creditor/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| creditorType | String | 否 | 债权人类型 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "creditorName": "张三",
        "creditorType": "个人",
        "contactPhone": "13800138000",
        "contactEmail": "zhangsan@example.com",
        "status": "KNOWN",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新债权人信息

**接口路径**: `PUT /creditor/{creditorId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| creditorId | Long | 是 | 债权人ID |

**请求参数**:
```json
{
  "creditorName": "李四",
  "creditorType": "企业",
  "contactPhone": "13900139000",
  "contactEmail": "lisi@example.com",
  "address": "上海市浦东新区",
  "status": "CONFIRMED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 删除债权人

**接口路径**: `DELETE /creditor/{creditorId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| creditorId | Long | 是 | 债权人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 二、债务人管理模块

### 1. 创建债务人信息

**接口路径**: `POST /debtor`

**请求方法**: POST

**请求参数**:
```json
{
  "caseId": 1,
  "enterpriseName": "某某科技有限公司",
  "unifiedSocialCreditCode": "91110000MA12345678",
  "legalRepresentative": "王五",
  "contactPhone": "13700137000",
  "contactPerson": "赵六",
  "businessScope": "软件开发",
  "industry": "信息技术",
  "registeredAddress": "北京市海淀区"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| enterpriseName | String | 是 | 企业名称 |
| unifiedSocialCreditCode | String | 是 | 统一社会信用代码 |
| legalRepresentative | String | 否 | 法定代表人 |
| contactPhone | String | 否 | 联系电话 |
| contactPerson | String | 否 | 联系人 |
| businessScope | String | 否 | 经营范围 |
| industry | String | 否 | 所属行业 |
| registeredAddress | String | 否 | 注册地址 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "debtorId": 1
  }
}
```

---

### 2. 获取债务人详情

**接口路径**: `GET /debtor/{debtorId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debtorId | Long | 是 | 债务人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "enterpriseName": "某某科技有限公司",
    "unifiedSocialCreditCode": "91110000MA12345678",
    "legalRepresentative": "王五",
    "contactPhone": "13700137000",
    "contactPerson": "赵六",
    "businessScope": "软件开发",
    "industry": "信息技术",
    "registeredAddress": "北京市海淀区",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 债务人列表（分页）

**接口路径**: `GET /debtor/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| enterpriseName | String | 否 | 企业名称 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "enterpriseName": "某某科技有限公司",
        "unifiedSocialCreditCode": "91110000MA12345678",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新债务人信息

**接口路径**: `PUT /debtor/{debtorId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debtorId | Long | 是 | 债务人ID |

**请求参数**:
```json
{
  "enterpriseName": "某某科技有限公司（更新）",
  "legalRepresentative": "王五（更新）",
  "contactPhone": "13700137001"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 删除债务人信息

**接口路径**: `DELETE /debtor/{debtorId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debtorId | Long | 是 | 债务人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 三、法院管理模块

### 1. 创建法院信息

**接口路径**: `POST /court`

**请求方法**: POST

**请求参数**:
```json
{
  "fullName": "北京市第一中级人民法院",
  "shortName": "北京一中院",
  "courtLevel": "中级人民法院",
  "contactPhone": "010-12345678",
  "undertakingJudge": "张法官",
  "responsibleUserId": 1
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fullName | String | 是 | 法院全称 |
| shortName | String | 是 | 法院简称 |
| courtLevel | String | 是 | 法院级别 |
| contactPhone | String | 否 | 联系电话 |
| undertakingJudge | String | 否 | 承办法官 |
| responsibleUserId | Long | 否 | 负责人用户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "courtId": 1
  }
}
```

---

### 2. 获取法院详情

**接口路径**: `GET /court/{courtId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| courtId | Long | 是 | 法院ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "fullName": "北京市第一中级人民法院",
    "shortName": "北京一中院",
    "courtLevel": "中级人民法院",
    "contactPhone": "010-12345678",
    "undertakingJudge": "张法官",
    "responsibleUserId": 1,
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 法院列表（分页）

**接口路径**: `GET /court/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| courtLevel | String | 否 | 法院级别 | - |
| shortName | String | 否 | 法院简称 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "fullName": "北京市第一中级人民法院",
        "shortName": "北京一中院",
        "courtLevel": "中级人民法院",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新法院信息

**接口路径**: `PUT /court/{courtId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| courtId | Long | 是 | 法院ID |

**请求参数**:
```json
{
  "fullName": "北京市第一中级人民法院（更新）",
  "shortName": "北京一中院（更新）",
  "contactPhone": "010-12345679",
  "undertakingJudge": "张法官（更新）"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 删除法院信息

**接口路径**: `DELETE /court/{courtId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| courtId | Long | 是 | 法院ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 四、银行账户管理模块

### 1. 创建银行账户

**接口路径**: `POST /bank-account`

**请求方法**: POST

**请求参数**:
```json
{
  "accountName": "某某银行账户",
  "accountNumber": "6222021234567890123",
  "accountType": "基本存款账户",
  "bankName": "中国工商银行",
  "openingBank": "工行北京分行",
  "password": "123456",
  "currentBalance": 1000000.00,
  "caseId": 1
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountName | String | 是 | 账户名称 |
| accountNumber | String | 是 | 账号 |
| accountType | String | 是 | 账户类型 |
| bankName | String | 是 | 银行名称 |
| openingBank | String | 是 | 开户行 |
| password | String | 是 | 账户密码 |
| currentBalance | BigDecimal | 是 | 当前余额 |
| caseId | Long | 是 | 案件ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "accountId": 1
  }
}
```

---

### 2. 获取银行账户详情

**接口路径**: `GET /bank-account/{accountId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "accountName": "某某银行账户",
    "accountNumber": "6222021234567890123",
    "accountType": "基本存款账户",
    "bankName": "中国工商银行",
    "openingBank": "工行北京分行",
    "currentBalance": 1000000.00,
    "status": "ACTIVE",
    "caseId": 1,
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 银行账户列表（分页）

**接口路径**: `GET /bank-account/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| accountType | String | 否 | 账户类型 | - |
| status | String | 否 | 状态 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "accountName": "某某银行账户",
        "accountNumber": "6222021234567890123",
        "accountType": "基本存款账户",
        "bankName": "中国工商银行",
        "currentBalance": 1000000.00,
        "status": "ACTIVE",
        "caseId": 1,
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新银行账户信息

**接口路径**: `PUT /bank-account/{accountId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数**:
```json
{
  "accountName": "某某银行账户（更新）",
  "currentBalance": 2000000.00
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 修改银行账户密码

**接口路径**: `PUT /bank-account/{accountId}/password`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数**:
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | String | 是 | 原密码 |
| newPassword | String | 是 | 新密码 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 6. 银行账户状态管理

**接口路径**: `PUT /bank-account/{accountId}/status`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**请求参数**:
```json
{
  "status": "ACTIVE"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 是 | 状态（ACTIVE/INACTIVE等） |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 7. 删除银行账户

**接口路径**: `DELETE /bank-account/{accountId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | Long | 是 | 账户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 五、工作计划管理模块

### 1. 创建工作计划

**接口路径**: `POST /work-plan`

**请求方法**: POST

**请求参数**:
```json
{
  "caseId": 1,
  "planType": "案件审理计划",
  "planContent": "完成案件审理准备工作",
  "startDate": "2026-01-10",
  "endDate": "2026-01-20",
  "responsibleUserId": 1
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| planType | String | 是 | 计划类型 |
| planContent | String | 是 | 计划内容 |
| startDate | String | 否 | 开始日期 |
| endDate | String | 否 | 结束日期 |
| responsibleUserId | Long | 否 | 负责人用户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "planId": 1
  }
}
```

---

### 2. 获取工作计划详情

**接口路径**: `GET /work-plan/{planId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | Long | 是 | 计划ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "planType": "案件审理计划",
    "planContent": "完成案件审理准备工作",
    "startDate": "2026-01-10",
    "endDate": "2026-01-20",
    "responsibleUserId": 1,
    "executionStatus": "NOT_STARTED",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 工作计划列表（分页）

**接口路径**: `GET /work-plan/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| planType | String | 否 | 计划类型 | - |
| executionStatus | String | 否 | 执行状态 | - |
| status | String | 否 | 状态 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "planType": "案件审理计划",
        "planContent": "完成案件审理准备工作",
        "executionStatus": "NOT_STARTED",
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新工作计划

**接口路径**: `PUT /work-plan/{planId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | Long | 是 | 计划ID |

**请求参数**:
```json
{
  "planContent": "完成案件审理准备工作（更新）",
  "startDate": "2026-01-11",
  "endDate": "2026-01-21",
  "responsibleUserId": 2
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 更新工作计划执行状态

**接口路径**: `PUT /work-plan/{planId}/execution-status`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | Long | 是 | 计划ID |

**请求参数**:
```json
{
  "executionStatus": "IN_PROGRESS"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| executionStatus | String | 是 | 执行状态（NOT_STARTED/IN_PROGRESS/COMPLETED等） |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 6. 删除工作计划

**接口路径**: `DELETE /work-plan/{planId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| planId | Long | 是 | 计划ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 六、工作团队管理模块

### 1. 创建工作团队

**接口路径**: `POST /work-team`

**请求方法**: POST

**请求参数**:
```json
{
  "caseId": 1,
  "teamName": "案件审理团队",
  "teamDescription": "负责案件审理相关工作",
  "status": "ACTIVE"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| teamName | String | 是 | 团队名称 |
| teamDescription | String | 否 | 团队描述 |
| status | String | 否 | 状态 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "teamId": 1
  }
}
```

---

### 2. 获取工作团队详情

**接口路径**: `GET /work-team/{teamId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "teamName": "案件审理团队",
    "teamDescription": "负责案件审理相关工作",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 工作团队列表（分页）

**接口路径**: `GET /work-team/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |
| status | String | 否 | 状态 | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "teamName": "案件审理团队",
        "teamDescription": "负责案件审理相关工作",
        "status": "ACTIVE",
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新工作团队信息

**接口路径**: `PUT /work-team/{teamId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID |

**请求参数**:
```json
{
  "teamName": "案件审理团队（更新）",
  "teamDescription": "负责案件审理相关工作（更新）",
  "status": "ACTIVE"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 删除工作团队

**接口路径**: `DELETE /work-team/{teamId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 6. 添加团队成员

**接口路径**: `POST /work-team/{teamId}/member`

**请求方法**: POST

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID |

**请求参数**:
```json
{
  "userId": 1,
  "role": "成员",
  "status": "ACTIVE"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| role | String | 否 | 角色 |
| status | String | 否 | 状态 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "memberId": 1
  }
}
```

---

### 7. 团队成员列表

**接口路径**: `GET /work-team/{teamId}/members`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teamId | Long | 是 | 团队ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "teamId": 1,
      "userId": 1,
      "role": "成员",
      "status": "ACTIVE",
      "isActive": 1,
      "createTime": "2026-01-08T10:00:00",
      "updateTime": "2026-01-08T10:00:00"
    }
  ]
}
```

---

### 8. 获取团队成员权限

**接口路径**: `GET /work-team/work-team-member/{memberId}/permissions`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| memberId | Long | 是 | 成员ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "teamMemberId": 1,
      "permissionType": "查看",
      "isAllowed": 1,
      "createTime": "2026-01-08T10:00:00",
      "updateTime": "2026-01-08T10:00:00"
    }
  ]
}
```

---

### 9. 更新团队成员权限

**接口路径**: `PUT /work-team/work-team-member/{memberId}/permission`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| memberId | Long | 是 | 成员ID |

**请求参数**:
```json
{
  "permissionLevel": "ADMIN"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| permissionLevel | String | 是 | 权限级别 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 七、管理人管理模块

### 1. 创建管理人信息

**接口路径**: `POST /administrator`

**请求方法**: POST

**请求参数**:
```json
{
  "caseId": 1,
  "administratorName": "某某律师事务所",
  "contactPhone": "010-87654321",
  "contactEmail": "lawfirm@example.com",
  "officeAddress": "北京市朝阳区某某大厦",
  "responsiblePersonId": 1
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| administratorName | String | 是 | 管理人名称 |
| contactPhone | String | 否 | 联系电话 |
| contactEmail | String | 否 | 联系邮箱 |
| officeAddress | String | 否 | 办公地址 |
| responsiblePersonId | Long | 否 | 负责人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "administratorId": 1
  }
}
```

---

### 2. 获取管理人详情

**接口路径**: `GET /administrator/{administratorId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "administratorName": "某某律师事务所",
    "contactPhone": "010-87654321",
    "contactEmail": "lawfirm@example.com",
    "officeAddress": "北京市朝阳区某某大厦",
    "responsiblePersonId": 1,
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

### 3. 管理人列表（分页）

**接口路径**: `GET /administrator/list`

**请求方法**: GET

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| pageNum | Integer | 否 | 页码 | 1 |
| pageSize | Integer | 否 | 每页大小 | 10 |
| caseId | Long | 否 | 案件ID | - |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "administratorName": "某某律师事务所",
        "contactPhone": "010-87654321",
        "contactEmail": "lawfirm@example.com",
        "officeAddress": "北京市朝阳区某某大厦",
        "responsiblePersonId": 1,
        "createTime": "2026-01-08T10:00:00",
        "updateTime": "2026-01-08T10:00:00"
      }
    ]
  }
}
```

---

### 4. 更新管理人信息

**接口路径**: `PUT /administrator/{administratorId}`

**请求方法**: PUT

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |

**请求参数**:
```json
{
  "contactPhone": "010-87654322",
  "contactEmail": "lawfirm2@example.com",
  "officeAddress": "北京市朝阳区某某大厦（更新）"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 5. 删除管理人信息

**接口路径**: `DELETE /administrator/{administratorId}`

**请求方法**: DELETE

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

### 6. 添加管理人员工

**接口路径**: `POST /administrator/{administratorId}/staff`

**请求方法**: POST

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |

**请求参数**:
```json
{
  "staffName": "张律师",
  "staffPosition": "合伙人",
  "contactPhone": "13800138001",
  "contactEmail": "zhang@example.com",
  "status": "ACTIVE"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| staffName | String | 是 | 员工姓名 |
| staffPosition | String | 否 | 职位 |
| contactPhone | String | 否 | 联系电话 |
| contactEmail | String | 否 | 联系邮箱 |
| status | String | 否 | 状态 |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "staffId": 1
  }
}
```

---

### 7. 员工列表

**接口路径**: `GET /administrator/{administratorId}/staff/list`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "administratorId": 1,
      "staffName": "张律师",
      "staffPosition": "合伙人",
      "contactPhone": "13800138001",
      "contactEmail": "zhang@example.com",
      "status": "ACTIVE",
      "createTime": "2026-01-08T10:00:00",
      "updateTime": "2026-01-08T10:00:00"
    }
  ]
}
```

---

### 8. 获取员工详情

**接口路径**: `GET /administrator/{administratorId}/staff/{staffId}`

**请求方法**: GET

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| administratorId | Long | 是 | 管理人ID |
| staffId | Long | 是 | 员工ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "administratorId": 1,
    "staffName": "张律师",
    "staffPosition": "合伙人",
    "contactPhone": "13800138001",
    "contactEmail": "zhang@example.com",
    "status": "ACTIVE",
    "createTime": "2026-01-08T10:00:00",
    "updateTime": "2026-01-08T10:00:00"
  }
}
```

---

## 附录：通用说明

### 响应码说明

| 响应码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 注意事项

1. **认证要求**: 所有接口需要在请求头中携带有效的JWT Token
   ```
   Authorization: Bearer {token}
   ```

2. **请求格式**: 所有POST和PUT请求的Content-Type必须为`application/json`

3. **时间格式**: 所有日期时间字段采用ISO 8601格式（如：`2026-01-08T10:00:00`）

4. **分页参数**:
   - `pageNum`从1开始
   - `pageSize`建议不超过100

5. **ID参数**: 所有ID参数均为Long类型

6. **必填参数**: 文档中标注为"必填"的参数必须提供，否则会返回400错误

7. **Swagger文档**: 完整的API文档可通过访问 Swagger UI 查看（应用启动后访问：`http://localhost:8080/swagger-ui.html`）

---

**文档生成日期**: 2026-04-21
