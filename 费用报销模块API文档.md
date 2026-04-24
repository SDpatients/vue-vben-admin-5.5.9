# 费用报销模块API文档

> 本文档供前端uni-app开发人员参考，包含费用报销管理的API接口说明。

---

## 目录

- [一、通用说明](#一通用说明)
- [二、报销单管理API](#二报销单管理api)
- [三、报销明细管理API](#三报销明细管理api)
- [四、报销附件管理API](#四报销附件管理api)
- [五、数据字典](#五数据字典)

---

## 一、通用说明

### 1.1 基础URL

```
http://your-domain/api
```

### 1.2 通用响应格式

所有接口统一返回以下格式：

```json
{
    "code": 200,
    "message": "success",
    "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功，其他表示失败 |
| message | String | 响应消息 |
| data | Object | 响应数据 |

### 1.3 分页响应格式

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "list": [ ... ],
        "pageNum": 1,
        "pageSize": 10
    }
}
```

### 1.4 认证说明

所有接口需要在请求头中携带Token：

```
Authorization: Bearer {token}
```

### 1.5 权限说明

- **普通用户**：只能查看和管理自己提交的报销单
- **管理员(ADMIN/SUPER_ADMIN)**：可以查看和管理所有报销单，并进行审批操作

---

## 二、报销单管理API

### 2.1 创建报销单

**接口地址**：`POST /expense-reimbursement`

**接口描述**：创建新的费用报销单

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| fundAccountId | Long | 是 | 银行账户ID |
| reimbursementDate | Date | 是 | 报销日期 |
| description | String | 否 | 报销说明（最长500字符） |
| items | Array | 是 | 报销明细列表（至少1条） |

**items数组元素**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| itemName | String | 是 | 费用名称（最长100字符） |
| itemAmount | Decimal | 是 | 费用金额（大于0，最多2位小数） |
| itemDescription | String | 否 | 费用说明（最长500字符） |

**请求示例**：
```json
{
    "caseId": 1001,
    "fundAccountId": 1,
    "reimbursementDate": "2024-01-15",
    "description": "2024年1月差旅费用报销",
    "items": [
        {
            "itemName": "交通费",
            "itemAmount": 500.00,
            "itemDescription": "北京-上海往返机票"
        },
        {
            "itemName": "住宿费",
            "itemAmount": 800.00,
            "itemDescription": "上海酒店住宿2晚"
        },
        {
            "itemName": "餐饮费",
            "itemAmount": 300.00,
            "itemDescription": "出差期间餐饮费用"
        }
    ]
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "reimbursementId": 1
    }
}
```

---

### 2.2 查询报销单列表

**接口地址**：`GET /expense-reimbursement`

**接口描述**：分页查询报销单列表

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |
| caseId | Long | 否 | - | 案件ID（筛选） |
| applicantId | Long | 否 | - | 申请人ID（筛选） |
| approvalStatus | String | 否 | - | 审批状态（筛选） |
| reimbursementDate | Date | 否 | - | 报销日期（筛选） |

**请求示例**：
```
GET /expense-reimbursement?page=1&size=10&approvalStatus=PENDING
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 50,
        "list": [
            {
                "id": 1,
                "reimbursementNumber": "BX202401150001",
                "caseId": 1001,
                "caseName": "XX公司破产清算案",
                "applicantId": 10,
                "applicantName": "张三",
                "fundAccountId": 1,
                "fundAccountName": "管理人账户",
                "bankName": "中国银行",
                "bankAccount": "6217****1234",
                "totalAmount": 1600.00,
                "reimbursementDate": "2024-01-15",
                "description": "2024年1月差旅费用报销",
                "approvalStatus": "PENDING",
                "approverId": null,
                "approverName": null,
                "approvalTime": null,
                "approvalOpinion": null,
                "createTime": "2024-01-15T10:00:00",
                "updateTime": "2024-01-15T10:00:00",
                "items": [
                    {
                        "id": 1,
                        "reimbursementId": 1,
                        "itemName": "交通费",
                        "itemAmount": 500.00,
                        "itemDescription": "北京-上海往返机票",
                        "sortOrder": 1
                    },
                    {
                        "id": 2,
                        "reimbursementId": 1,
                        "itemName": "住宿费",
                        "itemAmount": 800.00,
                        "itemDescription": "上海酒店住宿2晚",
                        "sortOrder": 2
                    },
                    {
                        "id": 3,
                        "reimbursementId": 1,
                        "itemName": "餐饮费",
                        "itemAmount": 300.00,
                        "itemDescription": "出差期间餐饮费用",
                        "sortOrder": 3
                    }
                ],
                "attachments": []
            }
        ],
        "pageNum": 1,
        "pageSize": 10
    }
}
```

---

### 2.3 查询报销单详情

**接口地址**：`GET /expense-reimbursement/{id}`

**接口描述**：根据ID获取报销单详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求示例**：
```
GET /expense-reimbursement/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "reimbursementNumber": "BX202401150001",
        "caseId": 1001,
        "caseName": "XX公司破产清算案",
        "applicantId": 10,
        "applicantName": "张三",
        "fundAccountId": 1,
        "fundAccountName": "管理人账户",
        "bankName": "中国银行",
        "bankAccount": "6217****1234",
        "totalAmount": 1600.00,
        "reimbursementDate": "2024-01-15",
        "description": "2024年1月差旅费用报销",
        "approvalStatus": "PENDING",
        "approverId": null,
        "approverName": null,
        "approvalTime": null,
        "approvalOpinion": null,
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "items": [
            {
                "id": 1,
                "reimbursementId": 1,
                "itemName": "交通费",
                "itemAmount": 500.00,
                "itemDescription": "北京-上海往返机票",
                "sortOrder": 1
            },
            {
                "id": 2,
                "reimbursementId": 1,
                "itemName": "住宿费",
                "itemAmount": 800.00,
                "itemDescription": "上海酒店住宿2晚",
                "sortOrder": 2
            },
            {
                "id": 3,
                "reimbursementId": 1,
                "itemName": "餐饮费",
                "itemAmount": 300.00,
                "itemDescription": "出差期间餐饮费用",
                "sortOrder": 3
            }
        ],
        "attachments": [
            {
                "id": 1,
                "reimbursementId": 1,
                "fileName": "发票.pdf",
                "filePath": "/uploads/expense/2024/01/15/xxx.pdf",
                "fileSize": 102400,
                "fileType": "application/pdf",
                "uploadTime": "2024-01-15T10:30:00",
                "sortOrder": 1
            }
        ]
    }
}
```

---

### 2.4 更新报销单

**接口地址**：`PUT /expense-reimbursement/{id}`

**接口描述**：更新报销单基本信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| fundAccountId | Long | 是 | 银行账户ID |
| reimbursementDate | Date | 是 | 报销日期 |
| description | String | 否 | 报销说明（最长500字符） |

**请求示例**：
```json
{
    "caseId": 1001,
    "fundAccountId": 1,
    "reimbursementDate": "2024-01-16",
    "description": "2024年1月差旅费用报销（更新）"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

**注意事项**：
- 只有待审批状态的报销单可以更新
- 只有申请人本人可以更新

---

### 2.5 删除报销单

**接口地址**：`DELETE /expense-reimbursement/{id}`

**接口描述**：删除报销单

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求示例**：
```
DELETE /expense-reimbursement/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

**注意事项**：
- 只有待审批状态的报销单可以删除
- 只有申请人本人可以删除

---

### 2.6 审批报销单

**接口地址**：`POST /expense-reimbursement/{id}/approve`

**接口描述**：审批报销单（通过或拒绝）

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approvalStatus | String | 是 | 审批状态（APPROVED/REJECTED） |
| approvalOpinion | String | 否 | 审批意见（最长500字符） |

**请求示例**：
```json
{
    "approvalStatus": "APPROVED",
    "approvalOpinion": "材料齐全，同意报销"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

**注意事项**：
- 只有管理员(ADMIN/SUPER_ADMIN)可以进行审批操作
- 只有待审批状态的报销单可以审批

---

## 三、报销明细管理API

### 3.1 添加报销明细

**接口地址**：`POST /expense-reimbursement/{id}/items`

**接口描述**：为报销单添加一条报销明细

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| itemName | String | 是 | 费用名称（最长100字符） |
| itemAmount | Decimal | 是 | 费用金额（大于0，最多2位小数） |
| itemDescription | String | 否 | 费用说明（最长500字符） |

**请求示例**：
```json
{
    "itemName": "通讯费",
    "itemAmount": 200.00,
    "itemDescription": "出差期间电话费"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "itemId": 4
    }
}
```

**注意事项**：
- 只有待审批状态的报销单可以添加明细
- 添加明细后，报销单总金额会自动更新

---

### 3.2 删除报销明细

**接口地址**：`DELETE /expense-reimbursement/{id}/items/{itemId}`

**接口描述**：删除报销单中的一条明细

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |
| itemId | Long | 是 | 明细ID |

**请求示例**：
```
DELETE /expense-reimbursement/1/items/4
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

**注意事项**：
- 只有待审批状态的报销单可以删除明细
- 删除明细后，报销单总金额会自动更新
- 报销单至少需要保留一条明细

---

## 四、报销附件管理API

### 4.1 上传报销附件

**接口地址**：`POST /expense-reimbursement/{id}/attachments`

**接口描述**：为报销单上传附件（发票、凭证等）

**请求头**：
```
Content-Type: multipart/form-data
```

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件 |

**请求示例（FormData）**：
```
file: [File]
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "attachmentId": 1,
        "filePath": "/uploads/expense/2024/01/15/xxx.pdf"
    }
}
```

**注意事项**：
- 只有待审批状态的报销单可以上传附件
- 支持常见文件格式：PDF、JPG、PNG、DOC、DOCX等

---

### 4.2 关联已存在的文件

**接口地址**：`POST /expense-reimbursement/{id}/attachments/{fileId}`

**接口描述**：将已上传的文件关联到报销单

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |
| fileId | Long | 是 | 文件记录ID |

**请求示例**：
```
POST /expense-reimbursement/1/attachments/101
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "attachmentId": 2
    }
}
```

---

### 4.3 删除报销附件

**接口地址**：`DELETE /expense-reimbursement/{id}/attachments/{attachmentId}`

**接口描述**：删除报销单的附件

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 报销单ID |
| attachmentId | Long | 是 | 附件ID |

**请求示例**：
```
DELETE /expense-reimbursement/1/attachments/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 4.4 预览附件

**接口地址**：`GET /expense-reimbursement/attachments/{attachmentId}/preview`

**接口描述**：在线预览附件

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attachmentId | Long | 是 | 附件ID |

**请求示例**：
```
GET /expense-reimbursement/attachments/1/preview
```

**响应**：文件流（用于在线预览）

---

### 4.5 下载附件

**接口地址**：`GET /expense-reimbursement/attachments/{attachmentId}/download`

**接口描述**：下载附件

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| attachmentId | Long | 是 | 附件ID |

**请求示例**：
```
GET /expense-reimbursement/attachments/1/download
```

**响应**：文件流下载

---

## 五、数据字典

### 5.1 审批状态(approvalStatus)

| 值 | 说明 |
|----|------|
| PENDING | 待审批 |
| APPROVED | 已通过 |
| REJECTED | 已拒绝 |

### 5.2 费用类型参考

| 类型 | 说明 |
|------|------|
| 交通费 | 飞机、火车、汽车等交通费用 |
| 住宿费 | 酒店住宿费用 |
| 餐饮费 | 餐饮费用 |
| 通讯费 | 电话、网络等通讯费用 |
| 办公费 | 办公用品、打印等费用 |
| 其他费用 | 其他类型费用 |

---

## 六、错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token失效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

---

## 七、业务流程说明

### 7.1 报销流程

```
1. 申请人创建报销单 → 状态：PENDING（待审批）
2. 上传相关附件（发票、凭证等）
3. 添加报销明细
4. 提交等待审批
5. 管理员审批 → 状态：APPROVED（通过）或 REJECTED（拒绝）
6. 审批通过后，报销金额将计入案件费用
```

### 7.2 权限控制

| 操作 | 申请人 | 管理员 |
|------|--------|--------|
| 创建报销单 | ✓ | ✓ |
| 查看报销单 | 仅自己 | 全部 |
| 更新报销单 | 仅自己的待审批 | 全部待审批 |
| 删除报销单 | 仅自己的待审批 | 全部待审批 |
| 审批报销单 | ✗ | ✓ |
| 添加/删除明细 | 仅自己的待审批 | 全部待审批 |
| 上传/删除附件 | 仅自己的待审批 | 全部待审批 |

---

## 八、注意事项

1. 所有接口需要在请求头中携带`Authorization: Bearer {token}`
2. 文件上传接口需要使用`multipart/form-data`格式
3. 日期格式为`yyyy-MM-dd`（如：2024-01-15）
4. 日期时间格式为ISO 8601标准：`yyyy-MM-ddTHH:mm:ss`
5. 金额字段使用Decimal类型，最多保留2位小数
6. 分页参数从1开始计数
7. 报销单创建后自动生成报销单编号
8. 报销单总金额根据明细自动计算
9. 只有待审批状态的报销单可以编辑
10. 审批操作只有管理员可以执行
