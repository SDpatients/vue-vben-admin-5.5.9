# 第七阶段 API 接口文档

## 概述

本文档描述了第七阶段破产管理系统的所有API接口，包括注销登记、终结诉讼仲裁、追加分配、账户印章管理、职务报告、资料移交、归档管理、印章销毁、账户销户等9个模块。

## 统一响应格式

所有API接口返回统一的JSON格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

- `code`: 状态码，200表示成功，其他表示失败
- `message`: 提示信息
- `data`: 返回的数据

---

## 1. 注销登记 (CANCELLATION_REGISTRATION)

### 1.1 查询所有注销登记

**接口路径**: `/api/web/getAllCancellationRegistrations`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "zxlx": "注销类型",
      "djjg": "登记机关",
      "sqrq": "2026-01-01",
      "zxrq": "2026-01-05",
      "zxwh": "注销文号",
      "zxzt": "注销状态",
      "djsx": "登记事项",
      "djhm": "登记号码",
      "zxyy": "注销原因",
      "clr": "处理人",
      "zt": "0"
    }
  ]
}
```

### 1.2 根据ID查询注销登记

**接口路径**: `/api/web/getCancellationRegistrationById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

**返回示例**: 同1.1，但只返回一条记录

### 1.3 根据案件ID查询注销登记

**接口路径**: `/api/web/getCancellationRegistrationsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

**返回示例**: 同1.1

### 1.4 添加注销登记

**接口路径**: `/api/web/addCancellationRegistration`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "zxlx": "注销类型",
  "djjg": "登记机关",
  "sqrq": "2026-01-01",
  "zxrq": "2026-01-05",
  "zxwh": "注销文号",
  "zxzt": "注销状态",
  "djsx": "登记事项",
  "djhm": "登记号码",
  "zxyy": "注销原因",
  "clr": "处理人",
  "zt": "0"
}
```

**返回示例**:
```json
{
  "code": 200,
  "message": "注销登记添加成功",
  "data": null
}
```

**说明**:
- `sepId` 会自动生成（查询当前最大值+1）
- `sepLd` 关联案件ID
- `sepMd` 和 `sepNd` 默认为空
- `sepAuser` 和 `sepEuser` 自动从当前登录用户获取
- `sepAdate` 和 `sepEdate` 自动设置为当前时间
- `zt` 默认为 "0"

### 1.5 更新注销登记

**接口路径**: `/api/web/updateCancellationRegistration`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "zxlx": "注销类型",
  "djjg": "登记机关",
  "sqrq": "2026-01-01",
  "zxrq": "2026-01-05",
  "zxwh": "注销文号",
  "zxzt": "注销状态",
  "djsx": "登记事项",
  "djhm": "登记号码",
  "zxyy": "注销原因",
  "clr": "处理人",
  "zt": "1"
}
```

**返回示例**:
```json
{
  "code": 200,
  "message": "注销登记更新成功",
  "data": null
}
```

### 1.6 根据案件ID更新注销登记

**接口路径**: `/api/web/updateCancellationRegistrationByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "zxlx": "注销类型",
  "djjg": "登记机关",
  "zt": "1"
}
```

**返回示例**: 同1.5

### 1.7 删除注销登记

**接口路径**: `/api/web/deleteCancellationRegistration`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

**返回示例**:
```json
{
  "code": 200,
  "message": "注销登记删除成功",
  "data": null
}
```

---

## 2. 终结诉讼仲裁 (TERMINATION_LITIGATION)

### 2.1 查询所有终结诉讼仲裁

**接口路径**: `/api/web/getAllTerminationLitigations`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "sslx": "诉讼类型",
      "xdf": "相对方",
      "fyzcjg": "法院/仲裁机构",
      "sszt": "诉讼状态",
      "cljg": "处理结果",
      "zt": "0"
    }
  ]
}
```

### 2.2 根据ID查询终结诉讼仲裁

**接口路径**: `/api/web/getTerminationLitigationById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 2.3 根据案件ID查询终结诉讼仲裁

**接口路径**: `/api/web/getTerminationLitigationsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 2.4 添加终结诉讼仲裁

**接口路径**: `/api/web/addTerminationLitigation`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "sslx": "诉讼类型",
  "xdf": "相对方",
  "fyzcjg": "法院/仲裁机构",
  "sszt": "诉讼状态",
  "cljg": "处理结果",
  "zt": "0"
}
```

### 2.5 更新终结诉讼仲裁

**接口路径**: `/api/web/updateTerminationLitigation`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "sslx": "诉讼类型",
  "xdf": "相对方",
  "fyzcjg": "法院/仲裁机构",
  "sszt": "诉讼状态",
  "cljg": "处理结果",
  "zt": "1"
}
```

### 2.6 根据案件ID更新终结诉讼仲裁

**接口路径**: `/api/web/updateTerminationLitigationByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "sslx": "诉讼类型",
  "sszt": "诉讼状态",
  "zt": "1"
}
```

### 2.7 删除终结诉讼仲裁

**接口路径**: `/api/web/deleteTerminationLitigation`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 3. 追加分配 (ADDITIONAL_DISTRIBUTION)

### 3.1 查询所有追加分配

**接口路径**: `/api/web/getAllAdditionalDistributions`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "fplx": "分配类型",
      "fpje": 10000.000,
      "fprq": "2026-01-05",
      "zqrmc": "债权人名称",
      "fpyj": "分配依据",
      "fpzt": "分配状态",
      "zt": "0"
    }
  ]
}
```

### 3.2 根据ID查询追加分配

**接口路径**: `/api/web/getAdditionalDistributionById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 3.3 根据案件ID查询追加分配

**接口路径**: `/api/web/getAdditionalDistributionsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 3.4 添加追加分配

**接口路径**: `/api/web/addAdditionalDistribution`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "fplx": "分配类型",
  "fpje": 10000.000,
  "fprq": "2026-01-05",
  "zqrmc": "债权人名称",
  "fpyj": "分配依据",
  "fpzt": "分配状态",
  "zt": "0"
}
```

### 3.5 更新追加分配

**接口路径**: `/api/web/updateAdditionalDistribution`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "fplx": "分配类型",
  "fpje": 10000.000,
  "fprq": "2026-01-05",
  "zqrmc": "债权人名称",
  "fpyj": "分配依据",
  "fpzt": "分配状态",
  "zt": "1"
}
```

### 3.6 根据案件ID更新追加分配

**接口路径**: `/api/web/updateAdditionalDistributionByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "fplx": "分配类型",
  "fpzt": "分配状态",
  "zt": "1"
}
```

### 3.7 删除追加分配

**接口路径**: `/api/web/deleteAdditionalDistribution`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 4. 账户印章管理 (ACCOUNT_SEAL_MANAGEMENT)

### 4.1 查询所有账户印章管理

**接口路径**: `/api/web/getAllAccountSealManagements`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "gllx": "管理类型",
      "xmmc": "项目名称",
      "clrq": "2026-01-05",
      "clfs": "处理方式",
      "cljg": "处理结果",
      "zmwjlj": "证明文件路径",
      "zt": "0"
    }
  ]
}
```

### 4.2 根据ID查询账户印章管理

**接口路径**: `/api/web/getAccountSealManagementById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 4.3 根据案件ID查询账户印章管理

**接口路径**: `/api/web/getAccountSealManagementsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 4.4 添加账户印章管理

**接口路径**: `/api/web/addAccountSealManagement`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "gllx": "管理类型",
  "xmmc": "项目名称",
  "clrq": "2026-01-05",
  "clfs": "处理方式",
  "cljg": "处理结果",
  "zmwjlj": "证明文件路径",
  "zt": "0"
}
```

### 4.5 更新账户印章管理

**接口路径**: `/api/web/updateAccountSealManagement`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "gllx": "管理类型",
  "xmmc": "项目名称",
  "clrq": "2026-01-05",
  "clfs": "处理方式",
  "cljg": "处理结果",
  "zmwjlj": "证明文件路径",
  "zt": "1"
}
```

### 4.6 根据案件ID更新账户印章管理

**接口路径**: `/api/web/updateAccountSealManagementByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "gllx": "管理类型",
  "cljg": "处理结果",
  "zt": "1"
}
```

### 4.7 删除账户印章管理

**接口路径**: `/api/web/deleteAccountSealManagement`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 5. 职务报告 (DUTY_REPORT)

### 5.1 查询所有职务报告

**接口路径**: `/api/web/getAllDutyReports`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "bglx": "报告类型",
      "bgnr": "报告内容",
      "tjrq": "2026-01-05",
      "tjr": "提交人",
      "jsf": "接收方",
      "spzt": "审批状态",
      "zt": "0"
    }
  ]
}
```

### 5.2 根据ID查询职务报告

**接口路径**: `/api/web/getDutyReportById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 5.3 根据案件ID查询职务报告

**接口路径**: `/api/web/getDutyReportsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 5.4 添加职务报告

**接口路径**: `/api/web/addDutyReport`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "bglx": "报告类型",
  "bgnr": "报告内容",
  "tjrq": "2026-01-05",
  "tjr": "提交人",
  "jsf": "接收方",
  "spzt": "审批状态",
  "zt": "0"
}
```

### 5.5 更新职务报告

**接口路径**: `/api/web/updateDutyReport`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "bglx": "报告类型",
  "bgnr": "报告内容",
  "tjrq": "2026-01-05",
  "tjr": "提交人",
  "jsf": "接收方",
  "spzt": "审批状态",
  "zt": "1"
}
```

### 5.6 根据案件ID更新职务报告

**接口路径**: `/api/web/updateDutyReportByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "bglx": "报告类型",
  "spzt": "审批状态",
  "zt": "1"
}
```

### 5.7 删除职务报告

**接口路径**: `/api/web/deleteDutyReport`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 6. 资料移交 (DOCUMENT_TRANSFER)

### 6.1 查询所有资料移交

**接口路径**: `/api/web/getAllDocumentTransfers`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "yjlx": "移交类型",
      "zlmc": "资料名称",
      "yjrq": "2026-01-05",
      "yjf": "移交方",
      "jsf": "接收方",
      "yjnr": "移交内容",
      "zt": "0"
    }
  ]
}
```

### 6.2 根据ID查询资料移交

**接口路径**: `/api/web/getDocumentTransferById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 6.3 根据案件ID查询资料移交

**接口路径**: `/api/web/getDocumentTransfersByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 6.4 添加资料移交

**接口路径**: `/api/web/addDocumentTransfer`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "yjlx": "移交类型",
  "zlmc": "资料名称",
  "yjrq": "2026-01-05",
  "yjf": "移交方",
  "jsf": "接收方",
  "yjnr": "移交内容",
  "zt": "0"
}
```

### 6.5 更新资料移交

**接口路径**: `/api/web/updateDocumentTransfer`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "yjlx": "移交类型",
  "zlmc": "资料名称",
  "yjrq": "2026-01-05",
  "yjf": "移交方",
  "jsf": "接收方",
  "yjnr": "移交内容",
  "zt": "1"
}
```

### 6.6 根据案件ID更新资料移交

**接口路径**: `/api/web/updateDocumentTransferByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "yjlx": "移交类型",
  "zt": "1"
}
```

### 6.7 删除资料移交

**接口路径**: `/api/web/deleteDocumentTransfer`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 7. 归档管理 (ARCHIVING_MANAGEMENT)

### 7.1 查询所有归档管理

**接口路径**: `/api/web/getAllArchivingManagements`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "gdlx": "归档类型",
      "gdnr": "归档内容",
      "gdrq": "2026-01-05",
      "gdwz": "归档位置",
      "fzr": "负责人",
      "gdzt": "归档状态",
      "dah": "档案号",
      "zt": "0"
    }
  ]
}
```

### 7.2 根据ID查询归档管理

**接口路径**: `/api/web/getArchivingManagementById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 7.3 根据案件ID查询归档管理

**接口路径**: `/api/web/getArchivingManagementsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 7.4 添加归档管理

**接口路径**: `/api/web/addArchivingManagement`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "gdlx": "归档类型",
  "gdnr": "归档内容",
  "gdrq": "2026-01-05",
  "gdwz": "归档位置",
  "fzr": "负责人",
  "gdzt": "归档状态",
  "dah": "档案号",
  "zt": "0"
}
```

### 7.5 更新归档管理

**接口路径**: `/api/web/updateArchivingManagement`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "gdlx": "归档类型",
  "gdnr": "归档内容",
  "gdrq": "2026-01-05",
  "gdwz": "归档位置",
  "fzr": "负责人",
  "gdzt": "归档状态",
  "dah": "档案号",
  "zt": "1"
}
```

### 7.6 根据案件ID更新归档管理

**接口路径**: `/api/web/updateArchivingManagementByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "gdlx": "归档类型",
  "gdzt": "归档状态",
  "zt": "1"
}
```

### 7.7 删除归档管理

**接口路径**: `/api/web/deleteArchivingManagement`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 8. 印章销毁 (SEAL_DESTRUCTION)

### 8.1 查询所有印章销毁

**接口路径**: `/api/web/getAllSealDestructions`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "yzlx": "印章类型",
      "yzbh": "印章编号",
      "xhrq": "2026-01-05",
      "xhfs": "销毁方式",
      "xhjzr": "销毁见证人",
      "zmwj": "证明文件",
      "yz": "印章",
      "zt": "0"
    }
  ]
}
```

### 8.2 根据ID查询印章销毁

**接口路径**: `/api/web/getSealDestructionById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 8.3 根据案件ID查询印章销毁

**接口路径**: `/api/web/getSealDestructionsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 8.4 添加印章销毁

**接口路径**: `/api/web/addSealDestruction`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "yzlx": "印章类型",
  "yzbh": "印章编号",
  "xhrq": "2026-01-05",
  "xhfs": "销毁方式",
  "xhjzr": "销毁见证人",
  "zmwj": "证明文件",
  "yz": "印章",
  "zt": "0"
}
```

### 8.5 更新印章销毁

**接口路径**: `/api/web/updateSealDestruction`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "yzlx": "印章类型",
  "yzbh": "印章编号",
  "xhrq": "2026-01-05",
  "xhfs": "销毁方式",
  "xhjzr": "销毁见证人",
  "zmwj": "证明文件",
  "yz": "印章",
  "zt": "1"
}
```

### 8.6 根据案件ID更新印章销毁

**接口路径**: `/api/web/updateSealDestructionByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "yzlx": "印章类型",
  "xhfs": "销毁方式",
  "zt": "1"
}
```

### 8.7 删除印章销毁

**接口路径**: `/api/web/deleteSealDestruction`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 9. 账户销户 (ACCOUNT_CLOSING)

### 9.1 查询所有账户销户

**接口路径**: `/api/web/getAllAccountClosings`

**请求方法**: GET

**请求参数**: 无

**返回示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": null,
      "sepNd": null,
      "sepAuser": "admin",
      "sepAdate": "2026-01-07T10:00:00",
      "sepEuser": "admin",
      "sepEdate": "2026-01-07T10:00:00",
      "zh": "账户",
      "xhrq": "2026-01-05",
      "xhyy": "销户原因",
      "yeje": "10000.00",
      "xhzt": "销户状态",
      "zt": "0"
    }
  ]
}
```

### 9.2 根据ID查询账户销户

**接口路径**: `/api/web/getAccountClosingById`

**请求方法**: GET

**请求参数**:
- `sepId` (Integer, 必填): 单据号

### 9.3 根据案件ID查询账户销户

**接口路径**: `/api/web/getAccountClosingsByCaseId`

**请求方法**: GET

**请求参数**:
- `sepLd` (Integer, 必填): 案件ID

### 9.4 添加账户销户

**接口路径**: `/api/web/addAccountClosing`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "zh": "账户",
  "xhrq": "2026-01-05",
  "xhyy": "销户原因",
  "yeje": "10000.00",
  "xhzt": "销户状态",
  "zt": "0"
}
```

### 9.5 更新账户销户

**接口路径**: `/api/web/updateAccountClosing`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepId": 1,
  "sepLd": 100,
  "zh": "账户",
  "xhrq": "2026-01-05",
  "xhyy": "销户原因",
  "yeje": "10000.00",
  "xhzt": "销户状态",
  "zt": "1"
}
```

### 9.6 根据案件ID更新账户销户

**接口路径**: `/api/web/updateAccountClosingByCaseId`

**请求方法**: POST

**请求参数** (JSON Body):
```json
{
  "sepLd": 100,
  "zh": "账户",
  "xhzt": "销户状态",
  "zt": "1"
}
```

### 9.7 删除账户销户

**接口路径**: `/api/web/deleteAccountClosing`

**请求方法**: POST

**请求参数**:
- `sepId` (Integer, 必填): 单据号

---

## 通用说明

### 字段说明

所有模块都包含以下通用字段：

- `sepId` (Integer): 单据号，主键，自动生成
- `sepLd` (Integer): 案件ID，关联案件表
- `sepMd` (Integer): 模块ID，默认为空
- `sepNd` (String): 年度，默认为空
- `sepAuser` (String): 创建者，自动从当前登录用户获取
- `sepAdate` (DateTime): 创建时间，自动设置为当前时间
- `sepEuser` (String): 修改者，自动从当前登录用户获取
- `sepEdate` (DateTime): 修改时间，自动设置为当前时间
- `zt` (String): 状态，默认为 "0"

### SEP_ID 自增逻辑

新增记录时，系统会自动执行以下步骤：
1. 查询当前表中 SEP_ID 的最大值
2. 如果最大值为空，则 SEP_ID 设为 1
3. 否则 SEP_ID 设为最大值 + 1

### 权限验证

所有接口都需要用户登录，系统会通过 JWT Token 验证用户身份。如果用户未登录，将返回错误信息：
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

### 异常处理

所有接口都包含异常处理，如果操作失败，将返回错误信息：
```json
{
  "code": 500,
  "message": "操作失败: 错误详情",
  "data": null
}
```

### 事务管理

所有数据库操作都在事务中执行，确保数据一致性。如果操作失败，将自动回滚。

### 日志记录

系统会记录所有关键操作的日志，包括：
- 用户操作日志
- 系统错误日志
- 数据库操作日志

---

## API 接口汇总

| 模块 | 接口数量 | 主要功能 |
|------|---------|---------|
| 注销登记 | 7 | 查询、添加、更新、删除注销登记信息 |
| 终结诉讼仲裁 | 7 | 查询、添加、更新、删除诉讼仲裁信息 |
| 追加分配 | 7 | 查询、添加、更新、删除分配信息 |
| 账户印章管理 | 7 | 查询、添加、更新、删除印章管理信息 |
| 职务报告 | 7 | 查询、添加、更新、删除职务报告信息 |
| 资料移交 | 7 | 查询、添加、更新、删除资料移交信息 |
| 归档管理 | 7 | 查询、添加、更新、删除归档管理信息 |
| 印章销毁 | 7 | 查询、添加、更新、删除印章销毁信息 |
| 账户销户 | 7 | 查询、添加、更新、删除账户销户信息 |
| **总计** | **63** | - |

---

## 注意事项

1. 所有日期字段格式为 `yyyy-MM-dd`
2. 所有日期时间字段格式为 `yyyy-MM-ddTHH:mm:ss`
3. 金额字段使用 `BigDecimal` 类型，保留3位小数
4. 所有接口都需要在请求头中携带有效的 JWT Token
5. 更新操作只更新传入的非空字段
6. 删除操作为物理删除，不可恢复

---

## 技术栈

- **框架**: Spring Boot + Spring MVC + MyBatis
- **数据库**: SQL Server
- **认证**: JWT Token
- **日志**: SLF4J + Logback
- **异常处理**: 全局异常处理器
- **事务管理**: Spring Transaction Management
