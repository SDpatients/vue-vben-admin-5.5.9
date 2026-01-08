# 第一阶段API汇总文档

## 概述
第一阶段流程处理包含三个主要模块：制度管理、账户印章管理、法律程序。本文档详细列出了所有涉及的CRUD API路径、请求参数、返回值及字段说明。

---

## 一、制度管理 (ManagementSystem)

### 1.1 新增制度管理

**接口路径**: `POST /api/case/phase1/managementSystem/add`

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
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `zdlx`: 制度类型
- `zdmc`: 制度名称
- `zdnr`: 制度内容
- `sxrq`: 生效日期
- `zt`: 状态

---

### 1.2 修改制度管理

**接口路径**: `POST /api/case/phase1/managementSystem/update`

**请求参数** (按sepId更新单条):
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

**请求参数** (按sepLd批量更新):
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
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
  "message": "操作成功",
  "data": null
}
```

---

### 1.3 删除制度管理

**接口路径**: `GET /api/case/phase1/managementSystem/delete/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 1.4 查询单条制度管理

**接口路径**: `GET /api/case/phase1/managementSystem/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

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

### 1.5 根据案件ID查询制度管理列表

**接口路径**: `GET /api/case/phase1/managementSystem/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (Integer, 必填)

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

### 1.6 查询所有制度管理

**接口路径**: `GET /api/case/phase1/managementSystem/list`

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

## 二、账户印章管理 (AccountSealManagement)

### 2.1 新增账户印章管理

**接口路径**: `POST /api/case/phase1/accountSeal/add`

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
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `gllx`: 管理类型
- `xmmc`: 项目名称
- `clrq`: 处理日期
- `clfs`: 处理方式
- `cljg`: 处理结果
- `zmwjlj`: 证明文件路径
- `zt`: 状态

---

### 2.2 修改账户印章管理

**接口路径**: `POST /api/case/phase1/accountSeal/update`

**请求参数** (按sepId更新单条):
```json
{
  "sepId": "记录ID (Integer, 必填)",
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选)",
  "sepEuser": "编辑用户 (String, 可选)",
  "gllx": "管理类型 (String, 可选)",
  "xmmc": "项目名称 (String, 可选)",
  "clrq": "处理日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "clfs": "处理方式 (String, 可选)",
  "cljg": "处理结果 (String, 可选)",
  "zmwjlj": "证明文件路径 (String, 可选)",
  "zt": "状态 (String, 可选)"
}
```

**请求参数** (按sepLd批量更新):
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepEuser": "编辑用户 (String, 可选)",
  "gllx": "管理类型 (String, 可选)",
  "xmmc": "项目名称 (String, 可选)",
  "clrq": "处理日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "clfs": "处理方式 (String, 可选)",
  "cljg": "处理结果 (String, 可选)",
  "zmwjlj": "证明文件路径 (String, 可选)",
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 2.3 删除账户印章管理

**接口路径**: `GET /api/case/phase1/accountSeal/delete/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 2.4 查询单条账户印章管理

**接口路径**: `GET /api/case/phase1/accountSeal/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

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
    "gllx": "管理类型",
    "xmmc": "项目名称",
    "clrq": "2024-01-01T00:00:00",
    "clfs": "处理方式",
    "cljg": "处理结果",
    "zmwjlj": "证明文件路径",
    "zt": "0"
  }
}
```

---

### 2.5 根据案件ID查询账户印章管理列表

**接口路径**: `GET /api/case/phase1/accountSeal/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (Integer, 必填)

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

### 2.6 查询所有账户印章管理

**接口路径**: `GET /api/case/phase1/accountSeal/list`

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

## 三、法律程序 (LegalProcedure)

### 3.1 新增法律程序

**接口路径**: `POST /api/case/phase1/legalProcedure/add`

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
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**涉及字段说明**:
- `sepId`: 主键ID (自动生成)
- `sepLd`: 案件ID (关联案件)
- `sepMd`: 模块ID
- `sepNd`: 内容描述
- `sepAuser`: 添加用户
- `sepAdate`: 添加时间 (自动生成)
- `sepEuser`: 编辑用户
- `sepEdate`: 编辑时间
- `cxlx`: 程序类型
- `cxnr`: 程序内容
- `zhrq`: 执行日期
- `zt`: 状态

---

### 3.2 修改法律程序

**接口路径**: `POST /api/case/phase1/legalProcedure/update`

**请求参数** (按sepId更新单条):
```json
{
  "sepId": "记录ID (Integer, 必填)",
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepAuser": "添加用户 (String, 可选)",
  "sepEuser": "编辑用户 (String, 可选)",
  "cxlx": "程序类型 (String, 可选)",
  "cxnr": "程序内容 (String, 可选)",
  "zhrq": "执行日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "zt": "状态 (String, 可选)"
}
```

**请求参数** (按sepLd批量更新):
```json
{
  "sepLd": "案件ID (Integer, 必填)",
  "sepMd": "模块ID (Integer, 可选)",
  "sepNd": "内容描述 (String, 可选)",
  "sepEuser": "编辑用户 (String, 可选)",
  "cxlx": "程序类型 (String, 可选)",
  "cxnr": "程序内容 (String, 可选)",
  "zhrq": "执行日期 (Date, 可选, 格式: yyyy-MM-dd)",
  "zt": "状态 (String, 可选)"
}
```

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 3.3 删除法律程序

**接口路径**: `GET /api/case/phase1/legalProcedure/delete/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

**返回值**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 3.4 查询单条法律程序

**接口路径**: `GET /api/case/phase1/legalProcedure/{sepId}`

**路径参数**:
- `sepId`: 记录ID (Integer, 必填)

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
    "cxlx": "程序类型",
    "cxnr": "程序内容",
    "zhrq": "2024-01-01T00:00:00",
    "zt": "0"
  }
}
```

---

### 3.5 根据案件ID查询法律程序列表

**接口路径**: `GET /api/case/phase1/legalProcedure/listByCase/{sepLd}`

**路径参数**:
- `sepLd`: 案件ID (Integer, 必填)

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

### 3.6 查询所有法律程序

**接口路径**: `GET /api/case/phase1/legalProcedure/list`

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

## 通用说明

### 1. 日期格式
所有日期字段支持以下格式:
- 字符串格式: `yyyy-MM-dd` (例如: `2024-01-01`)
- Date对象格式

### 2. 用户认证
所有新增和修改接口会自动从请求中获取当前登录用户信息:
- `sepAuser`: 添加用户 (自动获取当前用户名)
- `sepAdate`: 添加时间 (自动生成当前时间)
- `sepEuser`: 编辑用户 (需要手动传入)
- `sepEdate`: 编辑时间 (自动生成当前时间)

### 3. 状态字段
- `zt`: 状态字段,默认值为 `"0"`

### 4. 批量更新说明
修改接口支持两种更新方式:
- 按sepId更新单条记录 (需要提供sepId)
- 按sepLd批量更新同一案件下的所有记录 (不需要提供sepId)

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

---

## 注意事项

1. 所有接口需要JWT认证,请求头需携带有效的token
2. 案件ID (sepLd) 是必填字段,用于关联具体案件
3. 日期字段格式必须正确,否则会返回格式错误
4. 批量更新时,只更新传入的字段,未传入的字段保持不变
5. 删除操作为物理删除,请谨慎操作
