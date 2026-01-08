# 第三阶段API汇总文档

## 概述
第三阶段流程处理包含八个主要模块：财产调查、破产费用、权利主张、取回权审查、诉讼仲裁、债权申报、社保费用、税收核定。本文档详细列出了所有涉及的CRUD API路径、请求参数、返回值及字段说明。

---

## 一、财产调查 (PropertyInvestigation)

### 1.1 查询所有财产调查

**接口路径**: `GET /api/case/phase3/propertyInvestigation/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "tclx": "调查类型",
      "tcnr": "调查内容",
      "tcrq": "2024-01-01T00:00:00",
      "tcr": "调查人",
      "tcfx": "调查分析",
      "tczt": "调查状态",
      "zt": "0"
    }
  ]
}
```

---

### 1.2 根据案件ID查询财产调查

**接口路径**: `GET /api/case/phase3/propertyInvestigation/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同1.1

---

### 1.3 新增财产调查

**接口路径**: `POST /api/case/phase3/propertyInvestigation/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "tclx": "调查类型 (String, 可选)",
  "tcnr": "调查内容 (String, 可选)",
  "tcrq": "调查日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "tcr": "调查人 (String, 可选)",
  "tcfx": "调查分析 (String, 可选)",
  "tczt": "调查状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "财产调查表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `tclx`: 调查类型
- `tcnr`: 调查内容
- `tcrq`: 调查日期
- `tcr`: 调查人
- `tcfx`: 调查分析
- `tczt`: 调查状态
- `zt`: 状态 (默认值: "0")

---

### 1.4 修改财产调查

**接口路径**: `POST /api/case/phase3/propertyInvestigation/update`

**请求参数**: 同1.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "财产调查表更新成功",
  "data": null
}
```

---

## 二、破产费用 (BankruptcyExpenses)

### 2.1 查询所有破产费用

**接口路径**: `GET /api/case/phase3/bankruptcyExpenses/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "fylx": "费用类型",
      "fymc": "费用名称",
      "je": 10000.00,
      "zfrq": "2024-01-01T00:00:00",
      "zfzt": "支付状态",
      "zt": "0"
    }
  ]
}
```

---

### 2.2 根据案件ID查询破产费用

**接口路径**: `GET /api/case/phase3/bankruptcyExpenses/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同2.1

---

### 2.3 新增破产费用

**接口路径**: `POST /api/case/phase3/bankruptcyExpenses/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "fylx": "费用类型 (String, 可选)",
  "fymc": "费用名称 (String, 可选)",
  "je": "金额 (Double, 可选)",
  "zfrq": "支付日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "zfzt": "支付状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "破产费用添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `fylx`: 费用类型
- `fymc`: 费用名称
- `je`: 金额 (Double类型)
- `zfrq`: 支付日期
- `zfzt`: 支付状态
- `zt`: 状态 (默认值: "0")

---

### 2.4 修改破产费用

**接口路径**: `POST /api/case/phase3/bankruptcyExpenses/update`

**请求参数**: 同2.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "破产费用更新成功",
  "data": null
}
```

---

## 三、权利主张 (RightsClaim)

### 3.1 查询所有权利主张

**接口路径**: `GET /api/case/phase3/rightsClaim/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "zzlxcx": "主张类型查询",
      "zznr": "主张内容",
      "zzrq": "2024-01-01T00:00:00",
      "zzr": "主张人",
      "fyhy": "费用汇总",
      "zzzt": "主张状态",
      "zt": "0"
    }
  ]
}
```

---

### 3.2 根据案件ID查询权利主张

**接口路径**: `GET /api/case/phase3/rightsClaim/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同3.1

---

### 3.3 新增权利主张

**接口路径**: `POST /api/case/phase3/rightsClaim/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "zzlxcx": "主张类型查询 (String, 可选)",
  "zznr": "主张内容 (String, 可选)",
  "zzrq": "主张日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "zzr": "主张人 (String, 可选)",
  "fyhy": "费用汇总 (String, 可选)",
  "zzzt": "主张状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "权利主张表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `zzlxcx`: 主张类型查询
- `zznr`: 主张内容
- `zzrq`: 主张日期
- `zzr`: 主张人
- `fyhy`: 费用汇总
- `zzzt`: 主张状态
- `zt`: 状态 (默认值: "0")

---

### 3.4 修改权利主张

**接口路径**: `POST /api/case/phase3/rightsClaim/update`

**请求参数**: 同3.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "权利主张表更新成功",
  "data": null
}
```

---

## 四、取回权审查 (ReclaimReview)

### 4.1 查询所有取回权审查

**接口路径**: `GET /api/case/phase3/reclaimReview/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "qlrmc": "权利人名称",
      "qhqjc": "取回权基础",
      "ccsfcz": "是否审查",
      "ddgfyw": "待定法务业务",
      "scrq": "审查日期",
      "scr": "审查人",
      "scjd": "审查进度",
      "zt": "0"
    }
  ]
}
```

---

### 4.2 根据案件ID查询取回权审查

**接口路径**: `GET /api/case/phase3/reclaimReview/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同4.1

---

### 4.3 新增取回权审查

**接口路径**: `POST /api/case/phase3/reclaimReview/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "qlrmc": "权利人名称 (String, 可选)",
  "qhqjc": "取回权基础 (String, 可选)",
  "ccsfcz": "是否审查 (String, 可选)",
  "ddgfyw": "待定法务业务 (String, 可选)",
  "scrq": "审查日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "scr": "审查人 (String, 可选)",
  "scjd": "审查进度 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "取回权审查表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `qlrmc`: 权利人名称
- `qhqjc`: 取回权基础
- `ccsfcz`: 是否审查
- `ddgfyw`: 待定法务业务
- `scrq`: 审查日期
- `scr`: 审查人
- `scjd`: 审查进度
- `zt`: 状态 (默认值: "0")

---

### 4.4 修改取回权审查

**接口路径**: `POST /api/case/phase3/reclaimReview/update`

**请求参数**: 同4.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "取回权审查表更新成功",
  "data": null
}
```

---

## 五、诉讼仲裁 (LitigationArbitration)

### 5.1 查询所有诉讼仲裁

**接口路径**: `GET /api/case/phase3/litigationArbitration/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "lx": "类型",
      "xdf": "相对方",
      "fy": "法院",
      "ssnr": "诉讼内容",
      "sszt": "诉讼状态",
      "zt": "0"
    }
  ]
}
```

---

### 5.2 根据案件ID查询诉讼仲裁

**接口路径**: `GET /api/case/phase3/litigationArbitration/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同5.1

---

### 5.3 新增诉讼仲裁

**接口路径**: `POST /api/case/phase3/litigationArbitration/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "lx": "类型 (String, 可选)",
  "xdf": "相对方 (String, 可选)",
  "fy": "法院 (String, 可选)",
  "ssnr": "诉讼内容 (String, 可选)",
  "sszt": "诉讼状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "诉讼仲裁表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `lx`: 类型
- `xdf`: 相对方
- `fy`: 法院
- `ssnr`: 诉讼内容
- `sszt`: 诉讼状态
- `zt`: 状态 (默认值: "0")

---

### 5.4 修改诉讼仲裁

**接口路径**: `POST /api/case/phase3/litigationArbitration/update`

**请求参数**: 同5.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "诉讼仲裁表更新成功",
  "data": null
}
```

---

## 六、债权申报 (CreditorClaim)

### 6.1 查询所有债权申报

**接口路径**: `GET /api/case/phase3/creditorClaim/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "zqzqrmc": "债权人名称",
      "zqzqrlx": "债权人类型",
      "zqzqrsfzh": "债权人身份证号",
      "zqzqrdh": "债权人电话",
      "zqzqrdz": "债权人地址",
      "zqzqjje": "债权金额",
      "zqzqjjebz": "债权金额币种",
      "zqzqjzqsj": "债权时间",
      "zqzqjzqsjbz": "债权时间备注",
      "zqzqjzqsjzdy": "债权时间证据",
      "zqzqjzqsjzdydz": "债权时间证据地址",
      "zqzqjzqsjzdydzbz": "债权时间证据地址备注",
      "zqzqjzqsjzdydzlxdh": "债权时间证据地址联系电话",
      "zqzqjzqsjzdydzlxdhbz": "债权时间证据地址联系电话备注",
      "zqzqjzqsjzdydzlxdzyx": "债权时间证据地址联系电话邮箱",
      "zqzqjzqsjzdydzlxdhyxbz": "债权时间证据地址联系电话邮箱备注",
      "zqzqjzqsjzdydzlxdhzj": "债权时间证据地址联系电话证件",
      "zqzqjzqsjzdydzlxdhzjbz": "债权时间证据地址联系电话证件备注",
      "zqzqjzqsjzdydzlxdhzjlx": "债权时间证据地址联系电话证件类型",
      "zqzqjzqsjzdydzlxdhzjlxbz": "债权时间证据地址联系电话证件类型备注",
      "zqzqjzqsjzdydzlxdhzjlxmc": "债权时间证据地址联系电话证件类型名称",
      "zqzqjzqsjzdydzlxdhzjlxmcbz": "债权时间证据地址联系电话证件类型名称备注",
      "zqzqjzqsjzdydzlxdhzjlxmcdz": "债权时间证据地址联系电话证件类型名称地址",
      "zqzqjzqsjzdydzlxdhzjlxmcdzbz": "债权时间证据地址联系电话证件类型名称地址备注",
      "zqzqjzqsjzdydzlxdhzjlxmcdzdh": "债权时间证据地址联系电话证件类型名称地址电话",
      "zqzqjzqsjzdydzlxdhzjlxmcdzdhbz": "债权时间证据地址联系电话证件类型名称地址电话备注",
      "zqzqjzqsjzdydzlxdhzjlxmcdzdhyx": "债权时间证据地址联系电话证件类型名称地址电话邮箱",
      "zqzqjzqsjzdydzlxdhzjlxmcdzdhyxbz": "债权时间证据地址联系电话证件类型名称地址电话邮箱备注",
      "zt": "0"
    }
  ]
}
```

---

### 6.2 根据案件ID查询债权申报

**接口路径**: `GET /api/case/phase3/creditorClaim/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同6.1

---

### 6.3 新增债权申报

**接口路径**: `POST /api/case/phase3/creditorClaim/add`

**请求参数**: 使用CreditorClaim实体对象,包含所有债权申报字段

**返回值**:
```json
{
  "code": 200,
  "message": "债权申报表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成当前时间)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `zqzqrmc`: 债权人名称
- `zqzqrlx`: 债权人类型
- `zqzqrsfzh`: 债权人身份证号
- `zqzqrdh`: 债权人电话
- `zqzqrdz`: 债权人地址
- `zqzqjje`: 债权金额
- `zqzqjjebz`: 债权金额币种
- `zqzqjzqsj`: 债权时间
- `zqzqjzqsjbz`: 债权时间备注
- `zqzqjzqsjzdy`: 债权时间证据
- `zqzqjzqsjzdydz`: 债权时间证据地址
- `zqzqjzqsjzdydzbz`: 债权时间证据地址备注
- `zqzqjzqsjzdydzlxdh`: 债权时间证据地址联系电话
- `zqzqjzqsjzdydzlxdhbz`: 债权时间证据地址联系电话备注
- `zqzqjzqsjzdydzlxdhyx`: 债权时间证据地址联系电话邮箱
- `zqzqjzqsjzdydzlxdhyxbz`: 债权时间证据地址联系电话邮箱备注
- `zqzqjzqsjzdydzlxdhzj`: 债权时间证据地址联系电话证件
- `zqzqjzqsjzdydzlxdhzjbz`: 债权时间证据地址联系电话证件备注
- `zqzqjzqsjzdydzlxdhzjlx`: 债权时间证据地址联系电话证件类型
- `zqzqjzqsjzdydzlxdhzjlxbz`: 债权时间证据地址联系电话证件类型备注
- `zqzqjzqsjzdydzlxdhzjlxmc`: 债权时间证据地址联系电话证件类型名称
- `zqzqjzqsjzdydzlxdhzjlxmcbz`: 债权时间证据地址联系电话证件类型名称备注
- `zqzqjzqsjzdydzlxdhzjlxmcdz`: 债权时间证据地址联系电话证件类型名称地址
- `zqzqjzqsjzdydzlxdhzjlxmcdzbz`: 债权时间证据地址联系电话证件类型名称地址备注
- `zqzqjzqsjzdydzlxdhzjlxmcdzdh`: 债权时间证据地址联系电话证件类型名称地址电话
- `zqzqjzqsjzdydzlxdhzjlxmcdzdhbz`: 债权时间证据地址联系电话证件类型名称地址电话备注
- `zqzqjzqsjzdydzlxdhzjlxmcdzdhyx`: 债权时间证据地址联系电话证件类型名称地址电话邮箱
- `zqzqjzqsjzdydzlxdhzjlxmcdzdhyxbz`: 债权时间证据地址联系电话证件类型名称地址电话邮箱备注
- `zt`: 状态 (默认值: "0")

---

### 6.4 修改债权申报

**接口路径**: `POST /api/case/phase3/creditorClaim/update`

**请求参数**: 使用CreditorClaim实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "债权申报表更新成功",
  "data": null
}
```

---

## 七、社保费用 (SocialSecurityFees)

### 7.1 查询所有社保费用

**接口路径**: `GET /api/case/phase3/socialSecurityFees/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "fylx": "费用类型",
      "fyje": 10000.00,
      "sbjg": "社保机构",
      "hdrq": "2024-01-01T00:00:00",
      "hdr": "核定人",
      "hdzt": "核定状态",
      "zt": "0"
    }
  ]
}
```

---

### 7.2 根据案件ID查询社保费用

**接口路径**: `GET /api/case/phase3/socialSecurityFees/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同7.1

---

### 7.3 新增社保费用

**接口路径**: `POST /api/case/phase3/socialSecurityFees/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "fylx": "费用类型 (String, 可选)",
  "fyje": "费用金额 (Double, 可选)",
  "sbjg": "社保机构 (String, 可选)",
  "hdrq": "核定日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "hdr": "核定人 (String, 可选)",
  "hdzt": "核定状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "社保费用表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `fylx`: 费用类型
- `fyje`: 费用金额 (Double类型)
- `sbjg`: 社保机构
- `hdrq`: 核定日期
- `hdr`: 核定人
- `hdzt`: 核定状态
- `zt`: 状态 (默认值: "0")

---

### 7.4 修改社保费用

**接口路径**: `POST /api/case/phase3/socialSecurityFees/update`

**请求参数**: 同7.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "社保费用表更新成功",
  "data": null
}
```

---

## 八、税收核定 (TaxVerification)

### 8.1 查询所有税收核定

**接口路径**: `GET /api/case/phase3/taxVerification/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "sepId": 1,
      "sepLd": 100,
      "sepMd": 1,
      "sepNd": "内容描述",
      "sepAuser": "张三",
      "sepAdate": "2024-01-01T00:00:00",
      "sepEuser": "李四",
      "sepEdate": "2024-01-02T00:00:00",
      "sz": "税种",
      "skje": 10000.00,
      "swjg": "税务机关",
      "hdrq": "2024-01-01T00:00:00",
      "hdr": "核定人",
      "hdzt": "核定状态",
      "zt": "0"
    }
  ]
}
```

---

### 8.2 根据案件ID查询税收核定

**接口路径**: `GET /api/case/phase3/taxVerification/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同8.1

---

### 8.3 新增税收核定

**接口路径**: `POST /api/case/phase3/taxVerification/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "sz": "税种 (String, 可选)",
  "skje": "税款金额 (Double, 可选)",
  "swjg": "税务机关 (String, 可选)",
  "hdrq": "核定日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "hdr": "核定人 (String, 可选)",
  "hdzt": "核定状态 (String, 可选)",
  "zt": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "税收核定表添加成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户 (自动获取当前用户)
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `sz`: 税种
- `skje`: 税款金额 (Double类型)
- `swjg`: 税务机关
- `hdrq`: 核定日期
- `hdr`: 核定人
- `hdzt`: 核定状态
- `zt`: 状态 (默认值: "0")

---

### 8.4 修改税收核定

**接口路径**: `POST /api/case/phase3/taxVerification/update`

**请求参数**: 同8.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "税收核定表更新成功",
  "data": null
}
```

---

## 九、阶段更新

### 9.1 更新第三阶段

**接口路径**: `POST /api/case/phase3/update`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "其他更新字段": "根据需要更新"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "第三阶段更新成功",
  "data": null
}
```

---

## 通用说明

### 1. 日期格式
所有日期字段支持以下格式:
- 字符串格式: `yyyy-MM-dd` (例如: `2024-01-01`)
- Date对象格式

### 2. 用户认证
所有新增接口会自动从请求中获取当前登录用户信息:
- `sepAuser`: 添加用户 (自动获取当前用户名)
- `sepAdate`: 添加时间 (自动生成当前时间)
- `sepEuser`: 编辑用户 (需要手动传入)
- `sepEdate`: 编辑时间 (自动生成当前时间)

### 3. 状态字段
- `zt`: 状态字段,默认值为 `"0"`

### 4. 返回值格式
所有接口统一返回格式:
```json
{
  "code": 200,
  "message": "操作成功/错误信息",
  "data": null 或 数据对象
}
```

### 5. 错误处理
当操作失败时,返回值示例:
```json
{
  "code": 500,
  "message": "错误信息",
  "data": null
}
```

### 6. 金额字段
- `je`, `fyje`, `skje`: 金额字段使用Double类型
- `ccje`, `kzje`: 金额字段使用BigDecimal类型 (第二阶段)

---

## 注意事项

1. 所有接口需要JWT认证,请求头需携带有效的token
2. 案件ID (sepLd) 是必填字段,用于关联具体案件
3. 日期字段格式必须正确,否则会返回格式错误
4. 状态字段默认值为 "0",可以不传
5. 添加用户 (sepAuser) 会自动获取当前登录用户,无需手动传入
6. 债权申报模块字段较多,请确保所有必填字段都已提供
7. 金额字段注意类型,确保精度正确
