# 案件管理 API 文档

> 本文档面向前端开发人员，详细说明案件管理模块所有 API 的使用方式、请求参数、返回值及示例。
>
> 基础路径：`/case`
> 统一返回格式：`Result<T>`
> 分页返回格式：`PageResult<T>`

---

## 一、通用说明

### 1.1 统一响应结构

所有接口均返回以下结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | Integer | 状态码，`200` 表示成功，`500` 表示失败 |
| `message` | String | 响应消息 |
| `data` | T | 实际业务数据 |

### 1.2 分页响应结构

列表查询接口返回分页结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | Long | 总记录数 |
| `list` | Array | 当前页数据列表 |
| `pageNum` | Integer | 当前页码 |
| `pageSize` | Integer | 每页大小 |

### 1.3 案件状态说明

| 状态值 | 说明 | 可执行操作 |
|--------|------|-----------|
| `PENDING` | 待处理 | 编辑、提交审核 |
| `ONGOING` | 进行中 | 编辑、提交审核、业务操作 |
| `AWAITING` | 报结中 | 等待审核，不可编辑 |
| `COMPLETED` | 已结案 | 仅查看、可归档 |
| `ARCHIVED` | 已归档 | 仅查看、可撤销归档 |

### 1.4 审核状态说明

| 状态值 | 说明 |
|--------|------|
| `PENDING` | 待审核 |
| `APPROVED` | 已通过 |
| `REJECTED` | 已驳回 |

### 1.5 案件类型说明

| 类型值 | 说明 |
|--------|------|
| `LIQUIDATION` | 破产清算 |
| `REORGANIZATION` | 破产重整 |

---

## 二、案件实体字段说明

### BankruptCase（案件完整信息）

| 字段 | 类型 | 说明 | 可识别数据示例 |
|------|------|------|---------------|
| `id` | Long | 案件ID | 1, 2, 3... |
| `caseNumber` | String | 案号 | "(2024)粤01破1号" |
| `caseName` | String | 案件名称 | "XX公司破产清算案" |
| `acceptanceDate` | String | 受理日期 | "2024-01-15" |
| `caseSource` | String | 案件来源 | "当事人申请", "法院指定" |
| `acceptanceCourt` | String | 受理法院 | "广州市中级人民法院" |
| `designatedInstitution` | String | 指定机构 | "XX律师事务所" |
| `mainResponsiblePerson` | String | 主要负责人 | "张三" |
| `designatedJudge` | String | 指定法官 | "李法官" |
| `undertakingPersonnel` | String | 承办人员 | "王五" |
| `isSimplifiedTrial` | Boolean | 是否简易程序 | true/false |
| `caseReason` | String | 案由 | "破产清算" |
| `caseProgress` | String | 案件进度 | "FIRST", "SECOND" 等 |
| `caseType` | String | 案件类型 | "LIQUIDATION", "REORGANIZATION" |
| `debtClaimDeadline` | String | 债权申报截止日期 | "2024-03-15T00:00:00" |
| `filingDate` | String | 立案日期 | "2024-01-10" |
| `closingDate` | String | 结案日期 | "2024-12-01" |
| `bankruptcyDate` | String | 破产宣告日期 | "2024-06-01" |
| `terminationDate` | String | 终结日期 | "2024-12-01" |
| `cancellationDate` | String | 注销日期 | "2025-01-01" |
| `archivingDate` | String | 归档日期 | "2025-01-15" |
| `remarks` | String | 备注 | "案件备注信息" |
| `caseStatus` | String | 案件状态 | "PENDING", "ONGOING", "AWAITING", "COMPLETED", "ARCHIVED" |
| `createUserId` | Long | 创建人ID | 1 |
| `createTime` | String | 创建时间 | "2024-01-15T10:30:00" |
| `updateTime` | String | 更新时间 | "2024-01-15T10:30:00" |

---

## 三、API 接口详情

### 3.1 创建案件

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case` |
| **接口说明** | 创建新案件，创建后案件状态默认为 `ONGOING`（进行中） |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseNumber` | String | 是 | 案号 | "(2024)粤01破1号" |
| `caseName` | String | 是 | 案件名称 | "XX公司破产清算案" |
| `acceptanceDate` | String | 是 | 受理日期 | "2024-01-15" |
| `caseSource` | String | 否 | 案件来源 | "当事人申请" |
| `acceptanceCourt` | String | 否 | 受理法院 | "广州市中级人民法院" |
| `designatedInstitution` | String | 否 | 指定机构 | "XX律师事务所" |
| `mainResponsiblePerson` | String | 否 | 主要负责人 | "张三" |
| `designatedJudge` | String | 否 | 指定法官 | "李法官" |
| `undertakingPersonnel` | String | 否 | 承办人员 | "王五" |
| `isSimplifiedTrial` | Integer | 否 | 是否简易程序 | 0-否, 1-是 |
| `caseReason` | String | 否 | 案由 | "破产清算" |
| `caseProgress` | String | 否 | 案件进度 | "FIRST" |
| `caseType` | String | 否 | 案件类型 | "LIQUIDATION" |
| `debtClaimDeadline` | String | 否 | 债权申报截止日期 | "2024-03-15" |
| `filingDate` | String | 否 | 立案日期 | "2024-01-10" |
| `remarks` | String | 否 | 备注 | "案件备注" |

**请求示例**

```json
{
  "caseNumber": "(2024)粤01破1号",
  "caseName": "XX科技有限公司破产清算案",
  "acceptanceDate": "2024-01-15",
  "caseSource": "当事人申请",
  "acceptanceCourt": "广州市中级人民法院",
  "designatedInstitution": "XX律师事务所",
  "mainResponsiblePerson": "张三",
  "designatedJudge": "李法官",
  "undertakingPersonnel": "王五",
  "isSimplifiedTrial": 0,
  "caseReason": "破产清算",
  "caseProgress": "FIRST",
  "caseType": "LIQUIDATION",
  "debtClaimDeadline": "2024-03-15",
  "filingDate": "2024-01-10",
  "remarks": "这是一个测试案件"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "caseId": 1,
    "caseNumber": "(2024)粤01破1号"
  }
}
```

---

### 3.2 获取案件详情

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/{caseId}` |
| **接口说明** | 根据案件ID获取案件完整详情 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "caseNumber": "(2024)粤01破1号",
    "caseName": "XX科技有限公司破产清算案",
    "acceptanceDate": "2024-01-15",
    "caseSource": "当事人申请",
    "acceptanceCourt": "广州市中级人民法院",
    "designatedInstitution": "XX律师事务所",
    "mainResponsiblePerson": "张三",
    "isSimplifiedTrial": false,
    "caseReason": "破产清算",
    "caseProgress": "FIRST",
    "caseType": "LIQUIDATION",
    "debtClaimDeadline": "2024-03-15T00:00:00",
    "filingDate": "2024-01-10",
    "closingDate": null,
    "bankruptcyDate": null,
    "terminationDate": null,
    "cancellationDate": null,
    "archivingDate": null,
    "remarks": "案件备注",
    "undertakingPersonnel": "王五",
    "caseStatus": "ONGOING",
    "designatedJudge": "李法官",
    "createUserId": 1,
    "createTime": "2024-01-15T10:30:00",
    "updateTime": "2024-01-15T10:30:00"
  }
}
```

---

### 3.3 案件列表查询（分页）

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/list` |
| **接口说明** | 查询案件列表，支持分页、状态筛选、进度筛选、关键词搜索。关键词支持多字段模糊搜索。 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10, 20, 50 |
| `caseStatus` | String | 否 | 案件状态筛选 | "PENDING", "ONGOING", "AWAITING", "COMPLETED", "ARCHIVED" |
| `caseProgress` | String | 否 | 案件进度筛选 | "FIRST", "SECOND" 等 |
| `keyword` | String | 否 | 关键词，支持多字段模糊搜索 | "XX公司", "2024", "广州中院" |

**keyword 可搜索字段说明**

关键词 `keyword` 会在以下字段中进行模糊匹配：
- 案号 (`caseNumber`)
- 案件名称 (`caseName`)
- 受理法院 (`acceptanceCourt`)
- 指定机构 (`designatedInstitution`)
- 主要负责人 (`mainResponsiblePerson`)
- 案件来源 (`caseSource`)
- 案由 (`caseReason`)
- 指定法官 (`designatedJudge`)

**请求示例**

```
GET /case/list?pageNum=1&pageSize=10&caseStatus=ONGOING&keyword=XX公司
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "acceptanceDate": "2024-01-15",
        "caseStatus": "ONGOING",
        "caseProgress": "FIRST",
        "mainResponsiblePerson": "张三",
        "acceptanceCourt": "广州市中级人民法院",
        "createTime": "2024-01-15T10:30:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.4 更新案件信息

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `PUT` |
| **请求路径** | `/case/{caseId}` |
| **接口说明** | 更新案件信息，只更新传入的字段 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseName` | String | 否 | 案件名称 | "XX公司破产清算案（更新）" |
| `caseReason` | String | 否 | 案由 | "破产清算" |
| `remarks` | String | 否 | 备注 | "更新备注" |
| `filingDate` | String | 否 | 立案日期 | "2024-01-10" |
| `caseProgress` | String | 否 | 案件进度 | "SECOND" |
| `caseType` | String | 否 | 案件类型 | "LIQUIDATION" |
| `mainResponsiblePerson` | String | 否 | 主要负责人 | "李四" |
| `designatedInstitution` | String | 否 | 指定机构 | "YY律师事务所" |
| `acceptanceCourt` | String | 否 | 受理法院 | "深圳市中级人民法院" |
| `debtClaimDeadline` | String | 否 | 债权申报截止日期 | "2024-06-15" |

**请求示例**

```json
{
  "caseName": "XX科技有限公司破产清算案（更新）",
  "caseProgress": "SECOND",
  "remarks": "案件进度已更新"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.5 案件状态流转

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `PUT` |
| **请求路径** | `/case/{caseId}/status` |
| **接口说明** | 直接更新案件状态（通用状态更新接口） |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseStatus` | String | 是 | 目标案件状态 | "PENDING", "ONGOING", "AWAITING", "COMPLETED", "ARCHIVED" |
| `remark` | String | 否 | 备注 | "状态变更备注" |

**请求示例**

```json
{
  "caseStatus": "COMPLETED",
  "remark": "案件已结案"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.6 案件进度更新

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `PUT` |
| **请求路径** | `/case/{caseId}/progress` |
| **接口说明** | 更新案件进度 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseProgress` | String | 是 | 案件进度 | "FIRST", "SECOND", "THIRD" 等 |

**请求示例**

```json
{
  "caseProgress": "SECOND"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.7 提交案件审核

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/submit-review` |
| **接口说明** | 将案件提交审核，状态从 `ONGOING` 变为 `AWAITING` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.8 案件审核

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/review` |
| **接口说明** | 审核案件，审核通过后状态变为 `COMPLETED`，驳回后变为 `ONGOING` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `reviewStatus` | String | 是 | 审核结果 | "APPROVED"-通过, "REJECTED"-驳回 |
| `reviewOpinion` | String | 是 | 审核意见 | "审核通过，同意结案" |

**请求示例**

```json
{
  "reviewStatus": "APPROVED",
  "reviewOpinion": "案件材料齐全，审核通过"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.9 撤销案件审核

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/withdraw-review` |
| **接口说明** | 撤销已提交的审核申请，状态从 `AWAITING` 恢复为 `ONGOING` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.10 重新提交案件审核

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/resubmit-review` |
| **接口说明** | 被驳回后重新提交审核，状态从驳回状态变为 `AWAITING` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.11 撤销审核结果

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/revoke-review` |
| **接口说明** | 撤销已完成的审核结果，状态恢复为 `AWAITING` |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.12 批量审核案件

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/batch-review` |
| **接口说明** | 批量审核多个案件 |

**请求参数（Body）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseIds` | Array | 是 | 案件ID列表 | [1, 2, 3] |
| `reviewStatus` | String | 是 | 审核结果 | "APPROVED" 或 "REJECTED" |
| `reviewOpinion` | String | 否 | 审核意见 | "批量审核通过" |

**请求示例**

```json
{
  "caseIds": [1, 2, 3],
  "reviewStatus": "APPROVED",
  "reviewOpinion": "批量审核通过"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "success": 3
  }
}
```

---

### 3.13 案件归档（已结案→已归档）

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/archive` |
| **接口说明** | 将已结案案件归档，状态从 `COMPLETED` 变为 `ARCHIVED`，并记录归档日期 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**业务规则**
- 只有 `COMPLETED`（已结案）状态的案件才能归档
- 归档后会自动设置 `archivingDate` 为当前日期

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误示例**

```json
{
  "code": 500,
  "message": "只有已结案的案件才能归档",
  "data": null
}
```

---

### 3.14 撤销案件归档（已归档→已结案）

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `POST` |
| **请求路径** | `/case/{caseId}/unarchive` |
| **接口说明** | 撤销案件归档，状态从 `ARCHIVED` 恢复为 `COMPLETED`，清空归档日期 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**业务规则**
- 只有 `ARCHIVED`（已归档）状态的案件才能撤销归档
- 撤销后会清空 `archivingDate` 字段

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误示例**

```json
{
  "code": 500,
  "message": "只有已归档的案件才能撤销归档",
  "data": null
}
```

---

### 3.15 查询案件审核状态

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/{caseId}/review-status` |
| **接口说明** | 查询案件的审核状态信息 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "caseNumber": "(2024)粤01破1号",
    "caseName": "XX科技有限公司破产清算案",
    "reviewStatus": "PENDING",
    "reviewOpinion": null,
    "reviewTime": null,
    "reviewCount": 0
  }
}
```

---

### 3.16 获取当前用户案件统计

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/my-stats` |
| **接口说明** | 获取当前登录用户的案件统计数据 |

**响应参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `totalCases` | Long | 所有案件数量 |
| `inProgressCases` | Long | 进行中案件数量（PENDING + ONGOING） |
| `completedCases` | Long | 已结案数量（COMPLETED + ARCHIVED） |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCases": 50,
    "inProgressCases": 30,
    "completedCases": 20
  }
}
```

---

### 3.17 案件简单信息查询（分页）

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/simple-list` |
| **接口说明** | 查询案件简单信息，返回案件ID、案号、案件名称、审核状态 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `page` | Integer | 否 | 页码，默认1 | 1 |
| `size` | Integer | 否 | 每页大小，默认10 | 10 |
| `caseNumber` | String | 否 | 案号，支持模糊查询 | "2024" |

**响应参数（CaseSimpleInfo）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 案件ID |
| `caseNumber` | String | 案号 |
| `caseName` | String | 案件名称 |
| `reviewStatus` | String | 审核状态 |
| `reviewOpinion` | String | 审核意见 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "reviewStatus": "PENDING",
        "reviewOpinion": null
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.18 根据用户ID查询案件列表

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/user/{userId}/list` |
| **接口说明** | 查询指定用户的案件列表 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | Long | 是 | 用户ID |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10 |
| `caseStatus` | String | 否 | 案件状态筛选 | "ONGOING" |
| `caseNumber` | String | 否 | 案号，模糊查询 | "2024" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "caseStatus": "ONGOING",
        "caseProgress": "FIRST",
        "mainResponsiblePerson": "张三"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.19 根据用户ID查询案件数量

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/user/{userId}/count` |
| **接口说明** | 查询指定用户的案件数量 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | Long | 是 | 用户ID |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `caseStatus` | String | 否 | 案件状态筛选 | "ONGOING" |
| `caseNumber` | String | 否 | 案号，模糊查询 | "2024" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": 20
}
```

---

### 3.20 查询待审核案件列表

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/review/pending` |
| **接口说明** | 查询待审核案件列表 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10 |
| `keyword` | String | 否 | 案号关键词 | "2024" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "caseStatus": "AWAITING",
        "reviewStatus": "PENDING"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.21 查询已审核案件列表

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/review/approved` |
| **接口说明** | 查询已审核通过的案件列表 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10 |
| `keyword` | String | 否 | 案号关键词 | "2024" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "caseStatus": "COMPLETED",
        "reviewStatus": "APPROVED"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.22 查询已驳回案件列表

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/review/rejected` |
| **接口说明** | 查询已驳回的案件列表 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10 |
| `keyword` | String | 否 | 案号关键词 | "2024" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "caseStatus": "ONGOING",
        "reviewStatus": "REJECTED"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.23 查询指定审核人审核的案件列表

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/review/reviewer/{reviewerId}` |
| **接口说明** | 查询指定审核人审核过的案件列表 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `reviewerId` | Long | 是 | 审核人ID |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `pageNum` | Integer | 否 | 页码，默认1 | 1 |
| `pageSize` | Integer | 否 | 每页大小，默认10 | 10 |
| `reviewStatus` | String | 否 | 审核状态筛选 | "APPROVED", "REJECTED" |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "list": [
      {
        "id": 1,
        "caseNumber": "(2024)粤01破1号",
        "caseName": "XX科技有限公司破产清算案",
        "reviewStatus": "APPROVED",
        "reviewTime": "2024-02-01T10:00:00"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 3.24 查询审核状态统计

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/review/statistics` |
| **接口说明** | 查询各审核状态的数量统计 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "reviewStatus": "PENDING",
      "count": 10
    },
    {
      "reviewStatus": "APPROVED",
      "count": 15
    },
    {
      "reviewStatus": "REJECTED",
      "count": 5
    }
  ]
}
```

---

### 3.25 删除案件

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `DELETE` |
| **请求路径** | `/case/{caseId}` |
| **接口说明** | 硬删除案件及其所有关联数据 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.26 查询案件关联数据

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/{caseId}/related-data` |
| **接口说明** | 查询案件关联数据统计（审批、流程、文档、归档、公告、资金等） |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应参数说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `caseInfo` | Object | 案件基本信息 |
| `caseInfo.id` | Long | 案件ID |
| `caseInfo.caseNumber` | String | 案号 |
| `caseInfo.caseName` | String | 案件名称 |
| `caseInfo.caseStatus` | String | 案件状态 |
| `approvalData` | Object | 审批数据 |
| `approvalData.approvalCount` | Integer | 审批记录数 |
| `approvalData.approvalHistoryCount` | Integer | 审批历史数 |
| `processData` | Object | 流程数据 |
| `processData.processStageCount` | Integer | 流程阶段数 |
| `documentData` | Object | 文档数据 |
| `documentData.documentDeliveryCount` | Integer | 文书送达数 |
| `archiveData` | Object | 归档数据 |
| `archiveData.archiveRecordCount` | Integer | 归档记录数 |
| `announcementData` | Object | 公告数据 |
| `announcementData.announcementCount` | Integer | 公告数 |
| `announcementData.announcementViewCount` | Integer | 公告查看数 |
| `fundData` | Object | 资金数据 |
| `fundData.fundReimbursementCount` | Integer | 资金报销数 |
| `fundData.fundFlowCount` | Integer | 资金流水数 |
| `fundData.fundOperationLogCount` | Integer | 资金操作日志数 |
| `fundData.fundBudgetCount` | Integer | 资金预算数 |
| `fundData.escrowManagementCount` | Integer | 托管管理数 |
| `fundData.fundAccountCount` | Integer | 资金账户数 |
| `fundData.fundApprovalCount` | Integer | 资金审批数 |
| `fundData.bankruptcyExpenseCount` | Integer | 破产费用数 |
| `distributionData` | Object | 分配数据 |
| `distributionData.distributionDetailCount` | Integer | 分配明细数 |
| `distributionData.distributionExecutionCount` | Integer | 分配执行数 |
| `debtData` | Object | 债务数据 |
| `debtData.commonDebtCount` | Integer | 共益债务数 |
| `claimData` | Object | 债权数据 |
| `claimData.claimConfirmationCount` | Integer | 债权确认数 |
| `claimData.creditorClaimCount` | Integer | 债权人申报数 |
| `claimData.creditorInfoCount` | Integer | 债权人信息数 |
| `claimData.claimRegistrationCount` | Integer | 债权登记数 |
| `claimData.claimReviewCount` | Integer | 债权审核数 |
| `workData` | Object | 工作数据 |
| `workData.administratorCount` | Integer | 管理人数量 |
| `workData.workTeamCount` | Integer | 工作团队数 |
| `workData.workPlanCount` | Integer | 工作计划数 |
| `workData.workLogCount` | Integer | 工作日志数 |
| `workData.caseProgressCount` | Integer | 案件进度记录数 |
| `enterpriseData` | Object | 企业数据 |
| `enterpriseData.debtorEnterpriseCount` | Integer | 债务人企业数 |
| `taskData` | Object | 任务数据 |
| `taskData.caseTaskCount` | Integer | 案件任务数 |
| `taskData.caseTaskSubmissionCount` | Integer | 任务提交数 |
| `accountData` | Object | 账户数据 |
| `accountData.bankAccountCount` | Integer | 银行账户数 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "caseInfo": {
      "id": 1,
      "caseNumber": "(2024)粤01破1号",
      "caseName": "XX科技有限公司破产清算案",
      "caseStatus": "ONGOING"
    },
    "approvalData": {
      "approvalCount": 5,
      "approvalHistoryCount": 10
    },
    "processData": {
      "processStageCount": 3
    },
    "documentData": {
      "documentDeliveryCount": 8
    },
    "archiveData": {
      "archiveRecordCount": 2
    },
    "announcementData": {
      "announcementCount": 3,
      "announcementViewCount": 50
    },
    "fundData": {
      "fundReimbursementCount": 5,
      "fundFlowCount": 20,
      "fundOperationLogCount": 15,
      "fundBudgetCount": 2,
      "escrowManagementCount": 1,
      "fundAccountCount": 3,
      "fundApprovalCount": 4,
      "bankruptcyExpenseCount": 2
    },
    "distributionData": {
      "distributionDetailCount": 10,
      "distributionExecutionCount": 5
    },
    "debtData": {
      "commonDebtCount": 3
    },
    "claimData": {
      "claimConfirmationCount": 8,
      "creditorClaimCount": 15,
      "creditorInfoCount": 12,
      "claimRegistrationCount": 20,
      "claimReviewCount": 10
    },
    "workData": {
      "administratorCount": 2,
      "workTeamCount": 1,
      "workPlanCount": 5,
      "workLogCount": 30,
      "caseProgressCount": 8
    },
    "enterpriseData": {
      "debtorEnterpriseCount": 1
    },
    "taskData": {
      "caseTaskCount": 10,
      "caseTaskSubmissionCount": 8
    },
    "accountData": {
      "bankAccountCount": 2
    }
  }
}
```

---

### 3.27 获取用户最近查询的案件记录

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `GET` |
| **请求路径** | `/case/recent-searches` |
| **接口说明** | 获取当前用户最近查询的案件记录 |

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 | 可识别数据示例 |
|------|------|------|------|---------------|
| `limit` | Integer | 否 | 返回数量，默认10条 | 5, 10, 20 |

**响应参数（RecentCaseSearchRecord）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `caseId` | Long | 案件ID |
| `caseNumber` | String | 案号 |
| `caseName` | String | 案件名称 |
| `caseStatus` | String | 案件状态 |
| `caseProgress` | String | 案件进度 |
| `searchTime` | String | 查询时间 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "caseId": 1,
      "caseNumber": "(2024)粤01破1号",
      "caseName": "XX科技有限公司破产清算案",
      "caseStatus": "ONGOING",
      "caseProgress": "FIRST",
      "searchTime": "2024-03-15T14:30:00"
    }
  ]
}
```

---

### 3.28 清除用户最近查询的案件记录

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `DELETE` |
| **请求路径** | `/case/recent-searches` |
| **接口说明** | 清除当前用户的所有最近查询记录 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.29 移除指定的最近查询案件记录

**接口信息**

| 项目 | 内容 |
|------|------|
| **请求方式** | `DELETE` |
| **请求路径** | `/case/recent-searches/{caseId}` |
| **接口说明** | 移除指定案件的最近查询记录 |

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caseId` | Long | 是 | 案件ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 四、状态流转图

```
                    ┌─────────────┐
                    │   PENDING   │
                    │   待处理    │
                    └──────┬──────┘
                           │ 创建后自动进入
                           ▼
┌──────────┐      ┌─────────────┐      ┌─────────────┐
│ REJECTED │◄─────│   ONGOING   │─────►│  AWAITING   │
│  已驳回   │      │   进行中    │ 提交 │   报结中    │
└────┬─────┘      └─────────────┘ 审核 └──────┬──────┘
     │ 重新提交                                  │
     └──────────────────────────────────────────┘
                           │ 审核通过
                           ▼
                    ┌─────────────┐
                    │  COMPLETED  │
                    │   已结案    │
                    └──────┬──────┘
                           │ 归档
                           ▼
                    ┌─────────────┐
                    │  ARCHIVED   │◄────┐
                    │   已归档    │     │
                    └─────────────┘     │
                                        │ 撤销归档
                                        └────┘
```

---

## 五、错误码说明

| 错误码 | 说明 | 常见场景 |
|--------|------|----------|
| `200` | 成功 | 请求处理成功 |
| `500` | 服务器内部错误 | 业务异常、系统异常 |
| `400` | 请求参数错误 | 参数校验失败 |
| `401` | 未授权 | 用户未登录或Token过期 |
| `403` | 禁止访问 | 无权限访问该资源 |
| `404` | 资源不存在 | 案件不存在 |

---

## 六、前端开发建议

### 6.1 案件列表页

建议使用 `/case/list` 接口，支持以下筛选条件：
- **状态筛选**：下拉框选择 `caseStatus`（全部/待处理/进行中/报结中/已结案/已归档）
- **进度筛选**：下拉框选择 `caseProgress`
- **关键词搜索**：输入框输入案号、案件名称、法院等关键词

### 6.2 案件详情页

- 使用 `/case/{caseId}` 获取案件详情
- 使用 `/case/{caseId}/related-data` 获取关联数据统计，用于展示各模块数据量

### 6.3 审核流程

1. 案件创建后状态为 `ONGOING`
2. 点击"提交审核"调用 `/case/{caseId}/submit-review`，状态变为 `AWAITING`
3. 管理员在待审核列表 `/case/review/pending` 查看
4. 管理员审核调用 `/case/{caseId}/review`，通过变为 `COMPLETED`，驳回变为 `ONGOING`
5. 已结案案件可点击"归档"调用 `/case/{caseId}/archive`，状态变为 `ARCHIVED`

### 6.4 数据统计

- 首页统计卡片使用 `/case/my-stats` 接口
- 审核统计使用 `/case/review/statistics` 接口
