# 第二阶段API汇总文档

## 概述
第二阶段流程处理包含十个主要模块：管理制度、印章管理、法律程序、财产接管、应急预案、财产处置计划、人事管理、内部事务、合同管理、经营管理。本文档详细列出了所有涉及的CRUD API路径、请求参数、返回值及字段说明。

---

## 一、管理制度 (ManagementSystem)

### 1.1 查询所有管理制度

**接口路径**: `GET /api/case/phase2/managementSystem/list`

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
      "zdlx": "制度类型",
      "zdmc": "制度名称",
      "zdnr": "制度内容",
      "sxrq": "2024-01-01T00:00:00",
      "zt": "0"
    }
  ]
}
```

---

### 1.2 根据案件ID查询管理制度

**接口路径**: `GET /api/case/phase2/managementSystem/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同1.1

---

### 1.3 新增管理制度

**接口路径**: `POST /api/case/phase2/managementSystem/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "zdlx": "制度类型 (String, 可选)",
  "zdmc": "制度名称 (String, 可选)",
  "zdnr": "制度内容 (String, 可选)",
  "sxrq": "生效日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "管理制度添加成功",
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
- `zdlx`: 制度类型
- `zdmc`: 制度名称
- `zdnr`: 制度内容
- `sxrq`: 生效日期
- `zt`: 状态 (默认值: "0")

---

### 1.4 修改管理制度

**接口路径**: `POST /api/case/phase2/managementSystem/update`

**请求参数**:
```json
{
  "sepId": "记录ID (Integer, 必填)",
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选)",
  "sepEuser": "编辑用户 (String, 可选)",
  "zdlx": "制度类型 (String, 可选)",
  "zdmc": "制度名称 (String, 可选)",
  "zdnr": "制度内容 (String, 可选)",
  "sxrq": "生效日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "管理制度更新成功",
  "data": null
}
```

---

### 1.5 根据ID查询单条管理制度

**接口路径**: `GET /api/case/phase2/managementSystem/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "sepId": 1,
    "sepLd": 100,
    "sepMd": 1,
    "sepNd": "内容描述",
    "sepAuser": "张三",
    "sepAdate": "2024-01-01T00:00:00",
    "sepEuser": "李四",
    "sepEdate": "2024-01-02T00:00:00",
    "zdlx": "制度类型",
    "zdmc": "制度名称",
    "zdnr": "制度内容",
    "sxrq": "2024-01-01T00:00:00",
    "zt": "0"
  }
}
```

---

### 1.6 删除管理制度

**接口路径**: `GET /api/case/phase2/managementSystem/delete/{id}`

**路径参数**:
- `id`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 500,
  "message": "删除功能暂未实现",
  "data": null
}
```

---

## 二、印章管理 (AccountSealManagement)

### 2.1 查询所有印章管理

**接口路径**: `GET /api/case/phase2/accountSeal/list`

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
      "gllx": "管理类型",
      "xmmc": "项目名称",
      "clrq": "2024-01-01T00:00:00",
      "clfs": "处理方式",
      "cljg": "处理结果",
      "zmwjlj": "证明文件路径",
      "zt": "0"
    }
  ]
}
```

---

### 2.2 根据案件ID查询印章管理

**接口路径**: `GET /api/case/phase2/accountSeal/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同2.1

---

### 2.3 新增印章管理

**接口路径**: `POST /api/case/phase2/accountSeal/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "gllx": "管理类型 (String, 可选)",
  "xmmc": "项目名称 (String, 可选)",
  "clrq": "处理日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "clfs": "处理方式 (String, 可选)",
  "cljg": "处理结果 (String, 可选)",
  "zmwjlj": "证明文件路径 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "印章管理添加成功",
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
- `gllx`: 管理类型
- `xmmc`: 项目名称
- `clrq`: 处理日期
- `clfs`: 处理方式
- `cljg`: 处理结果
- `zmwjlj`: 证明文件路径
- `zt`: 状态 (默认值: "0")

---

## 三、法律程序 (LegalProcedure)

### 3.1 查询所有法律程序

**接口路径**: `GET /api/case/phase2/legalProcedure/list`

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
      "cxlx": "程序类型",
      "cxnr": "程序内容",
      "zhrq": "2024-01-01T00:00:00",
      "zt": "0"
    }
  ]
}
```

---

### 3.2 根据案件ID查询法律程序

**接口路径**: `GET /api/case/phase2/legalProcedure/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同3.1

---

### 3.3 新增法律程序

**接口路径**: `POST /api/case/phase2/legalProcedure/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "cxlx": "程序类型 (String, 可选)",
  "cxnr": "程序内容 (String, 可选)",
  "zhrq": "执行日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "法律程序添加成功",
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
- `cxlx`: 程序类型
- `cxnr`: 程序内容
- `zhrq`: 执行日期
- `zt`: 状态 (默认值: "0")

---

## 四、财产接管 (PropertyReceipt)

### 4.1 查询所有财产接管

**接口路径**: `GET /api/case/phase2/propertyReceipt/list`

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
      "ccmc": "财产名称",
      "cclx": "财产类型",
      "ccje": 10000.00,
      "cczksm": "财产状况说明",
      "cfdd": "存放地点",
      "chry": "保管人",
      "jjr": "交接人",
      "jjrq": "2024-01-01T00:00:00",
      "jjhyrq": "2024-01-02T00:00:00",
      "jsr": "接收人",
      "jszt": "接收状态",
      "zt": "0"
    }
  ]
}
```

---

### 4.2 根据案件ID查询财产接管

**接口路径**: `GET /api/case/phase2/propertyReceipt/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同4.1

---

### 4.3 新增财产接管

**接口路径**: `POST /api/case/phase2/propertyReceipt/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "ccmc": "财产名称 (String, 可选)",
  "cclx": "财产类型 (String, 可选)",
  "ccje": "财产金额 (BigDecimal, 可选)",
  "cczksm": "财产状况说明 (String, 可选)",
  "cfdd": "存放地点 (String, 可选)",
  "chry": "保管人 (String, 可选)",
  "jjr": "交接人 (String, 可选)",
  "jjrq": "交接日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "jjhyrq": "交接会议日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "jsr": "接收人 (String, 可选)",
  "jszt": "接收状态 (String, 可选)",
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "财产接管添加成功",
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
- `ccmc`: 财产名称
- `cclx`: 财产类型
- `ccje`: 财产金额 (BigDecimal类型)
- `cczksm`: 财产状况说明
- `cfdd`: 存放地点
- `chry`: 保管人
- `jjr`: 交接人
- `jjrq`: 交接日期
- `jjhyrq`: 交接会议日期
- `jsr`: 接收人
- `jszt`: 接收状态
- `zt`: 状态

---

### 4.4 修改财产接管

**接口路径**: `POST /api/case/phase2/propertyReceipt/update`

**请求参数**: 同4.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "财产接管更新成功",
  "data": null
}
```

---

## 五、应急预案 (EmergencyManagement)

### 5.1 查询所有应急预案

**接口路径**: `GET /api/case/phase2/emergency/list`

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
      "bxxx": "保险信息",
      "abcs": "安保措施",
      "bzcccl": "保障措施",
      "qlsxyqj": "其他需要说明",
      "fzr": "负责人",
      "zt": "0"
    }
  ]
}
```

---

### 5.2 根据案件ID查询应急预案

**接口路径**: `GET /api/case/phase2/emergency/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同5.1

---

### 5.3 新增应急预案

**接口路径**: `POST /api/case/phase2/emergency/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "bxxx": "保险信息 (String, 可选)",
  "abcs": "安保措施 (String, 可选)",
  "bzcccl": "保障措施 (String, 可选)",
  "qlsxyqj": "其他需要说明 (String, 可选)",
  "fzr": "负责人 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "应急预案添加成功",
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
- `bxxx`: 保险信息
- `abcs`: 安保措施
- `bzcccl`: 保障措施
- `qlsxyqj`: 其他需要说明
- `fzr`: 负责人
- `zt`: 状态 (默认值: "0")

---

## 六、财产处置计划 (PropertyManagementPlan)

### 6.1 查询所有财产处置计划

**接口路径**: `GET /api/case/phase2/propertyPlan/list`

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
      "dcglcs": "动产管理措施",
      "hbccglcs": "货币财产管理措施",
      "wxccglcs": "无形财产管理措施",
      "bdcglcs": "不动产管理措施",
      "dwtzglcs": "对外投资管理措施",
      "zt": "0"
    }
  ]
}
```

---

### 6.2 根据案件ID查询财产处置计划

**接口路径**: `GET /api/case/phase2/propertyPlan/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同6.1

---

### 6.3 新增财产处置计划

**接口路径**: `POST /api/case/phase2/propertyPlan/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "famc": "方案名称 (String, 可选)",
  "dcglcs": "动产管理措施 (String, 可选)",
  "hbccglcs": "货币财产管理措施 (String, 可选)",
  "wxccglcs": "无形财产管理措施 (String, 可选)",
  "bdcglcs": "不动产管理措施 (String, 可选)",
  "dwtzglcs": "对外投资管理措施 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "财产处置计划添加成功",
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
- `famc`: 方案名称
- `dcglcs`: 动产管理措施
- `hbccglcs`: 货币财产管理措施
- `wxccglcs`: 无形财产管理措施
- `bdcglcs`: 不动产管理措施
- `dwtzglcs`: 对外投资管理措施
- `zt`: 状态 (默认值: "0")

---

### 6.4 修改财产处置计划

**接口路径**: `POST /api/case/phase2/propertyPlan/update`

**请求参数**: 同6.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "财产处置计划更新成功",
  "data": null
}
```

---

## 七、人事管理 (PersonnelEmployment)

### 7.1 查询所有人事管理

**接口路径**: `GET /api/case/phase2/personnelEmp/list`

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
      "ygxm": "员工姓名",
      "yglx": "员工类型",
      "zw": "职位",
      "xcxx": "薪资信息",
      "pyrq": "聘用日期",
      "pyzt": "聘用状态",
      "fypzqk": "安置情况",
      "zt": "0"
    }
  ]
}
```

---

### 7.2 根据案件ID查询人事管理

**接口路径**: `GET /api/case/phase2/personnelEmp/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同7.1

---

### 7.3 新增人事管理

**接口路径**: `POST /api/case/phase2/personnelEmp/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "ygxm": "员工姓名 (String, 可选)",
  "yglx": "员工类型 (String, 可选)",
  "zw": "职位 (String, 可选)",
  "xcxx": "薪资信息 (String, 可选)",
  "pyrq": "聘用日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "pyzt": "聘用状态 (String, 可选)",
  "fypzqk": "安置情况 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "人事管理添加成功",
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
- `ygxm`: 员工姓名
- `yglx`: 员工类型
- `zw`: 职位
- `xcxx`: 薪资信息
- `pyrq`: 聘用日期
- `pyzt`: 聘用状态
- `fypzqk`: 安置情况
- `zt`: 状态 (默认值: "0")

---

### 7.4 修改人事管理

**接口路径**: `POST /api/case/phase2/personnelEmp/update`

**请求参数**: 同7.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "人事管理更新成功",
  "data": null
}
```

---

## 八、内部事务 (InternalAffairs)

### 8.1 查询所有内部事务

**接口路径**: `GET /api/case/phase2/internalAffairs/list`

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
      "swlx": "事务类型",
      "swnr": "事务内容",
      "clzt": "处理状态",
      "jdr": "经办人",
      "jdrq": "经办日期",
      "kzje": 10000.00,
      "kzsm": "开支说明",
      "zt": "0"
    }
  ]
}
```

---

### 8.2 根据案件ID查询内部事务

**接口路径**: `GET /api/case/phase2/internalAffairs/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同8.1

---

### 8.3 新增内部事务

**接口路径**: `POST /api/case/phase2/internalAffairs/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "swlx": "事务类型 (String, 可选)",
  "swnr": "事务内容 (String, 可选)",
  "clzt": "处理状态 (String, 可选)",
  "jdr": "经办人 (String, 可选)",
  "jdrq": "经办日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "kzje": "开支金额 (BigDecimal, 可选)",
  "kzsm": "开支说明 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "内部事务添加成功",
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
- `swlx`: 事务类型
- `swnr`: 事务内容
- `clzt`: 处理状态
- `jdr`: 经办人
- `jdrq`: 经办日期
- `kzje`: 开支金额 (BigDecimal类型)
- `kzsm`: 开支说明
- `zt`: 状态 (默认值: "0")

---

### 8.4 修改内部事务

**接口路径**: `POST /api/case/phase2/internalAffairs/update`

**请求参数**: 同8.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "内部事务更新成功",
  "data": null
}
```

---

## 九、合同管理 (ContractManagement)

### 9.1 查询所有合同管理

**接口路径**: `GET /api/case/phase2/contractManagement/list`

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
      "htmc": "合同名称",
      "htlx": "合同类型",
      "htxdf": "合同相对方",
      "htnr": "合同内容",
      "scr": "审查人",
      "scrq": "审查日期",
      "lhz": "流转状态",
      "zt": "0"
    }
  ]
}
```

---

### 9.2 根据案件ID查询合同管理

**接口路径**: `GET /api/case/phase2/contractManagement/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同9.1

---

### 9.3 新增合同管理

**接口路径**: `POST /api/case/phase2/contractManagement/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "htmc": "合同名称 (String, 可选)",
  "htlx": "合同类型 (String, 可选)",
  "htxdf": "合同相对方 (String, 可选)",
  "htnr": "合同内容 (String, 可选)",
  "scr": "审查人 (String, 可选)",
  "scrq": "审查日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "lhz": "流转状态 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "合同管理添加成功",
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
- `htmc`: 合同名称
- `htlx`: 合同类型
- `htxdf`: 合同相对方
- `htnr`: 合同内容
- `scr`: 审查人
- `scrq`: 审查日期
- `lhz`: 流转状态
- `zt`: 状态 (默认值: "0")

---

### 9.4 修改合同管理

**接口路径**: `POST /api/case/phase2/contractManagement/update`

**请求参数**: 同9.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "合同管理更新成功",
  "data": null
}
```

---

## 十、经营管理 (BusinessManagement)

### 10.1 查询所有经营管理

**接口路径**: `GET /api/case/phase2/businessManagement/list`

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
      "jdnr": "经营内容",
      "fzr": "负责人",
      "fypzrq": "经营批准日期",
      "sszt": "实施状态",
      "yyqktc": "经营情况",
      "fxlzbg": "法律状态报告",
      "zt": "0"
    }
  ]
}
```

---

### 10.2 根据案件ID查询经营管理

**接口路径**: `GET /api/case/phase2/businessManagement/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (String, 必填)

**返回值**: 同10.1

---

### 10.3 新增经营管理

**接口路径**: `POST /api/case/phase2/businessManagement/add`

**请求参数**:
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选, 自动获取当前用户)",
  "sepEuser": "编辑用户 (String, 可选)",
  "jdnr": "经营内容 (String, 可选)",
  "fzr": "负责人 (String, 可选)",
  "fypzrq": "经营批准日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "sszt": "实施状态 (String, 可选)",
  "yyqktc": "经营情况 (String, 可选)",
  "fxlzbg": "法律状态报告 (String, 可选)",
  "ZT": "状态 (String, 可选, 默认值: '0')"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "经营管理添加成功",
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
- `jdnr`: 经营内容
- `fzr`: 负责人
- `fypzrq`: 经营批准日期
- `sszt`: 实施状态
- `yyqktc`: 经营情况
- `fxlzbg`: 法律状态报告
- `zt`: 状态 (默认值: "0")

---

### 10.4 修改经营管理

**接口路径**: `POST /api/case/phase2/businessManagement/update`

**请求参数**: 同10.3, 需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "经营管理更新成功",
  "data": null
}
```

---

## 十一、工作团队视图

### 11.1 查询工作团队视图

**接口路径**: `GET /api/case/phase2/workTeamBaseView/list`

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "工作团队视图数据"
    }
  ]
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
- `zt` 或 `ZT`: 状态字段,默认值为 `"0"`

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

### 6. 删除功能
目前删除功能暂未实现,调用删除接口会返回:
```json
{
  "code": 500,
  "message": "删除功能暂未实现",
  "data": null
}
```

---

## 注意事项

1. 所有接口需要JWT认证,请求头需携带有效的token
2. 案件ID (sepLd) 是必填字段,用于关联具体案件
3. 日期字段格式必须正确,否则会返回格式错误
4. 状态字段默认值为 "0",可以不传
5. 添加用户 (sepAuser) 会自动获取当前登录用户,无需手动传入
6. 删除操作暂未实现,请谨慎操作
7. 金额字段使用BigDecimal类型,确保精度
