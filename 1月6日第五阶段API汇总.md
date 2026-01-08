# 第五阶段API汇总文档

## 概述
第五阶段流程处理包含六个主要模块：审计报告、资产评估、财产变价方案、拍卖机构、破产宣告、财产变价实施。本文档详细列出了所有涉及的CRUD API路径、请求参数、返回值及字段说明。

---

## 一、审计报告 (AuditReport)

### 1.1 查询所有审计报告

**接口路径**: `GET /api/case/phase4/auditReport/list`

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
      "sjjg": "审计机构",
      "sjrq": "审计日期",
      "sjzt": "审计状态",
      "sjjg": "审计结果",
      "zt": "0"
    }
  ]
}
```

---

### 1.2 根据案件ID查询审计报告

**接口路径**: `GET /api/case/phase4/auditReport/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同1.1

---

### 1.3 根据ID查询单条审计报告

**接口路径**: `GET /api/case/phase4/auditReport/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 1.4 新增审计报告

**接口路径**: `POST /api/case/phase4/auditReport/add`

**请求参数**: 支持批量新增,传入AuditReport对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "审计报告添加成功，共添加X条记录",
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
- `sjjg`: 审计机构
- `sjrq`: 审计日期
- `sjzt`: 审计状态
- `sjjg`: 审计结果
- `zt`: 状态 (默认值: "0")

---

### 1.5 修改审计报告

**接口路径**: `POST /api/case/phase4/auditReport/update`

**请求参数**: 使用AuditReport实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "审计报告更新成功",
  "data": null
}
```

---

### 1.6 删除审计报告

**接口路径**: `GET /api/case/phase4/auditReport/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 二、资产评估 (AssetValuation)

### 2.1 查询所有资产评估

**接口路径**: `GET /api/case/phase4/assetValuation/list`

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
      "zcmc": "资产名称",
      "zclx": "资产类型",
      "zcpgjg": "资产评估机构",
      "zcpgje": "资产评估金额",
      "zcpgsj": "资产评估时间",
      "zt": "0"
    }
  ]
}
```

---

### 2.2 根据案件ID查询资产评估

**接口路径**: `GET /api/case/phase4/assetValuation/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同2.1

---

### 2.3 根据ID查询单条资产评估

**接口路径**: `GET /api/case/phase4/assetValuation/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 2.4 新增资产评估

**接口路径**: `POST /api/case/phase4/assetValuation/add`

**请求参数**: 支持批量新增,传入AssetValuation对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "资产评估添加成功，共添加X条记录",
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
- `zcmc`: 资产名称
- `zclx`: 资产类型
- `zcpgjg`: 资产评估机构
- `zcpgje`: 资产评估金额
- `zcpgsj`: 资产评估时间
- `zt`: 状态 (默认值: "0")

---

### 2.5 修改资产评估

**接口路径**: `POST /api/case/phase4/assetValuation/update`

**请求参数**: 使用AssetValuation实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "资产评估更新成功",
  "data": null
}
```

---

### 2.6 删除资产评估

**接口路径**: `GET /api/case/phase4/assetValuation/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 三、财产变价方案 (PropertyValuationPlan)

### 3.1 查询所有财产变价方案

**接口路径**: `GET /api/case/phase4/propertyValuationPlan/list`

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
      "famc": "方案名称",
      "fanr": "方案内容",
      "fazt": "方案状态",
      "zt": "0"
    }
  ]
}
```

---

### 3.2 根据案件ID查询财产变价方案

**接口路径**: `GET /api/case/phase4/propertyValuationPlan/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同3.1

---

### 3.3 根据ID查询单条财产变价方案

**接口路径**: `GET /api/case/phase4/propertyValuationPlan/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 3.4 新增财产变价方案

**接口路径**: `POST /api/case/phase4/propertyValuationPlan/add`

**请求参数**: 支持批量新增,传入PropertyValuationPlan对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "财产变价方案添加成功，共添加X条记录",
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
- `famc`: 方案名称
- `fanr`: 方案内容
- `fazt`: 方案状态
- `zt`: 状态 (默认值: "0")

---

### 3.5 修改财产变价方案

**接口路径**: `POST /api/case/phase4/propertyValuationPlan/update`

**请求参数**: 使用PropertyValuationPlan实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "财产变价方案更新成功",
  "data": null
}
```

---

### 3.6 删除财产变价方案

**接口路径**: `GET /api/case/phase4/propertyValuationPlan/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 四、拍卖机构 (AuctionAgency)

### 4.1 查询所有拍卖机构

**接口路径**: `GET /api/case/phase4/auctionAgency/list`

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
      "pmjgmc": "拍卖机构名称",
      "pmjglx": "拍卖机构类型",
      "pmjgdz": "拍卖机构地址",
      "pmjgdh": "拍卖机构电话",
      "zt": "0"
    }
  ]
}
```

---

### 4.2 根据案件ID查询拍卖机构

**接口路径**: `GET /api/case/phase4/auctionAgency/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同4.1

---

### 4.3 根据ID查询单条拍卖机构

**接口路径**: `GET /api/case/phase4/auctionAgency/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 4.4 新增拍卖机构

**接口路径**: `POST /api/case/phase4/auctionAgency/add`

**请求参数**: 支持批量新增,传入AuctionAgency对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "拍卖机构添加成功，共添加X条记录",
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
- `pmjgmc`: 拍卖机构名称
- `pmjglx`: 拍卖机构类型
- `pmjgdz`: 拍卖机构地址
- `pmjgdh`: 拍卖机构电话
- `zt`: 状态 (默认值: "0")

---

### 4.5 修改拍卖机构

**接口路径**: `POST /api/case/phase4/auctionAgency/update`

**请求参数**: 使用AuctionAgency实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "拍卖机构更新成功",
  "data": null
}
```

---

### 4.6 删除拍卖机构

**接口路径**: `GET /api/case/phase4/auctionAgency/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 五、破产宣告 (BankruptcyDeclaration)

### 5.1 查询所有破产宣告

**接口路径**: `GET /api/case/phase4/bankruptcyDeclaration/list`

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
      "pcxbrq": "破产宣告日期",
      "pcxbjg": "破产宣告机构",
      "pcxbzt": "破产宣告状态",
      "zt": "0"
    }
  ]
}
```

---

### 5.2 根据案件ID查询破产宣告

**接口路径**: `GET /api/case/phase4/bankruptcyDeclaration/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同5.1

---

### 5.3 根据ID查询单条破产宣告

**接口路径**: `GET /api/case/phase4/bankruptcyDeclaration/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 5.4 新增破产宣告

**接口路径**: `POST /api/case/phase4/bankruptcyDeclaration/add`

**请求参数**: 支持批量新增,传入BankruptcyDeclaration对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "破产宣告添加成功，共添加X条记录",
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
- `pcxbrq`: 破产宣告日期
- `pcxbjg`: 破产宣告机构
- `pcxbzt`: 破产宣告状态
- `zt`: 状态 (默认值: "0")

---

### 5.5 修改破产宣告

**接口路径**: `POST /api/case/phase4/bankruptcyDeclaration/update`

**请求参数**: 使用BankruptcyDeclaration实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "破产宣告更新成功",
  "data": null
}
```

---

### 5.6 删除破产宣告

**接口路径**: `GET /api/case/phase4/bankruptcyDeclaration/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 六、财产变价实施 (PropertyValuationImplementation)

### 6.1 查询所有财产变价实施

**接口路径**: `GET /api/case/phase4/propertyValuationImplementation/list`

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
      "ccbjmc": "财产变价名称",
      "ccbjfs": "财产变价方式",
      "ccbjje": "财产变价金额",
      "ccbjrq": "财产变价日期",
      "ccbjzt": "财产变价状态",
      "zt": "0"
    }
  ]
}
```

---

### 6.2 根据案件ID查询财产变价实施

**接口路径**: `GET /api/case/phase4/propertyValuationImplementation/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同6.1

---

### 6.3 根据ID查询单条财产变价实施

**接口路径**: `GET /api/case/phase4/propertyValuationImplementation/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

### 6.4 新增财产变价实施

**接口路径**: `POST /api/case/phase4/propertyValuationImplementation/add`

**请求参数**: 支持批量新增,传入PropertyValuationImplementation对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "财产变价实施添加成功，共添加X条记录",
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
- `ccbjmc`: 财产变价名称
- `ccbjfs`: 财产变价方式
- `ccbjje`: 财产变价金额
- `ccbjrq`: 财产变价日期
- `ccbjzt`: 财产变价状态
- `zt`: 状态 (默认值: "0")

---

### 6.5 修改财产变价实施

**接口路径**: `POST /api/case/phase4/propertyValuationImplementation/update`

**请求参数**: 使用PropertyValuationImplementation实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "财产变价实施更新成功",
  "data": null
}
```

---

### 6.6 删除财产变价实施

**接口路径**: `GET /api/case/phase4/propertyValuationImplementation/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "暂未实现",
  "data": null
}
```

---

## 七、阶段更新

### 7.1 更新第四、五阶段

**接口路径**: `POST /api/case/phase4/phase/update`

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
  "message": "第四、五阶段更新成功",
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

### 4. 批量新增
第五阶段的所有新增接口支持批量新增,传入对象数组即可

### 5. 返回值格式
所有接口统一返回格式:
```json
{
  "code": 200,
  "message": "操作成功/错误信息",
  "data": null 或 数据对象
}
```

### 6. 错误处理
当操作失败时,返回值示例:
```json
{
  "code": 500,
  "message": "错误信息",
  "data": null
}
```

### 7. 暂未实现功能
- 根据ID查询单条记录的功能暂未实现
- 删除功能暂未实现

---

## 注意事项

1. 所有接口需要JWT认证,请求头需携带有效的token
2. 案件ID (sepLd) 是必填字段,用于关联具体案件
3. 日期字段格式必须正确,否则会返回格式错误
4. 状态字段默认值为 "0",可以不传
5. 添加用户 (sepAuser) 会自动获取当前登录用户,无需手动传入
6. 新增接口支持批量操作,可以一次添加多条记录
7. 删除和根据ID查询功能暂未实现,请谨慎操作
8. 金额字段注意类型,确保精度正确
