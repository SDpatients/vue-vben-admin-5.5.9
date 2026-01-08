# 第四阶段API汇总文档

## 概述
第四阶段流程处理包含六个主要模块：债权人会议、债权人会议文件、债权确认、报酬方案、重要行为报告、抵消权审查。本文档详细列出了所有涉及的CRUD API路径、请求参数、返回值及字段说明。

---

## 一、债权人会议 (Session)

### 1.1 查询所有债权人会议

**接口路径**: `GET /api/case/phase4/session/list`

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
      "hyrq": "会议日期",
      "hydd": "会议地点",
      "hyzt": "会议状态",
      "hyjl": "会议记录",
      "zt": "0"
    }
  ]
}
```

---

### 1.2 根据案件ID查询债权人会议

**接口路径**: `GET /api/case/phase4/session/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同1.1

---

### 1.3 根据ID查询单条债权人会议

**接口路径**: `GET /api/case/phase4/session/{id}`

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

### 1.4 新增债权人会议

**接口路径**: `POST /api/case/phase4/session/add`

**请求参数**: 支持批量新增,传入Session对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "债权人会议添加成功，共添加X条记录",
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
- `hyrq`: 会议日期
- `hydd`: 会议地点
- `hyzt`: 会议状态
- `hyjl`: 会议记录
- `zt`: 状态 (默认值: "0")

---

### 1.5 修改债权人会议

**接口路径**: `POST /api/case/phase4/session/update`

**请求参数**: 使用Session实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "债权人会议更新成功",
  "data": null
}
```

---

### 1.6 删除债权人会议

**接口路径**: `GET /api/case/phase4/session/delete/{id}`

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

## 二、债权人会议文件 (MeetingDocuments)

### 2.1 查询所有债权人会议文件

**接口路径**: `GET /api/case/phase4/meetingDocuments/list`

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
      "wjmc": "文件名称",
      "wjlx": "文件类型",
      "wjlj": "文件路径",
      "zt": "0"
    }
  ]
}
```

---

### 2.2 根据案件ID查询债权人会议文件

**接口路径**: `GET /api/case/phase4/meetingDocuments/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同2.1

---

### 2.3 根据ID查询单条债权人会议文件

**接口路径**: `GET /api/case/phase4/meetingDocuments/{id}`

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

### 2.4 新增债权人会议文件

**接口路径**: `POST /api/case/phase4/meetingDocuments/add`

**请求参数**: 支持批量新增,传入MeetingDocuments对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "债权人会议文件添加成功，共添加X条记录",
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
- `wjmc`: 文件名称
- `wjlx`: 文件类型
- `wjlj`: 文件路径
- `zt`: 状态 (默认值: "0")

---

### 2.5 修改债权人会议文件

**接口路径**: `POST /api/case/phase4/meetingDocuments/update`

**请求参数**: 使用MeetingDocuments实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "债权人会议文件更新成功",
  "data": null
}
```

---

### 2.6 删除债权人会议文件

**接口路径**: `GET /api/case/phase4/meetingDocuments/delete/{id}`

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

## 三、债权确认 (ClaimConfirmation)

### 3.1 查询所有债权确认

**接口路径**: `GET /api/case/phase4/claimConfirmation/list`

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
      "zqzqje": "债权金额",
      "zqzqzt": "债权状态",
      "zqzqrq": "债权日期",
      "zqzqqr": "债权确认人",
      "zt": "0"
    }
  ]
}
```

---

### 3.2 根据案件ID查询债权确认

**接口路径**: `GET /api/case/phase4/claimConfirmation/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同3.1

---

### 3.3 根据ID查询单条债权确认

**接口路径**: `GET /api/case/phase4/claimConfirmation/{id}`

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

### 3.4 新增债权确认

**接口路径**: `POST /api/case/phase4/claimConfirmation/add`

**请求参数**: 支持批量新增,传入ClaimConfirmation对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "债权确认添加成功，共添加X条记录",
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
- `zqzqje`: 债权金额
- `zqzqzt`: 债权状态
- `zqzqrq`: 债权日期
- `zqzqqr`: 债权确认人
- `zt`: 状态 (默认值: "0")

---

### 3.5 修改债权确认

**接口路径**: `POST /api/case/phase4/claimConfirmation/update`

**请求参数**: 使用ClaimConfirmation实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "债权确认更新成功",
  "data": null
}
```

---

### 3.6 删除债权确认

**接口路径**: `GET /api/case/phase4/claimConfirmation/delete/{id}`

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

## 四、报酬方案 (RemunerationPlan)

### 4.1 查询所有报酬方案

**接口路径**: `GET /api/case/phase4/remunerationPlan/list`

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
      "famc": "方案内容",
      "fazt": "方案状态",
      "zt": "0"
    }
  ]
}
```

---

### 4.2 根据案件ID查询报酬方案

**接口路径**: `GET /api/case/phase4/remunerationPlan/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同4.1

---

### 4.3 根据ID查询单条报酬方案

**接口路径**: `GET /api/case/phase4/remunerationPlan/{id}`

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

### 4.4 新增报酬方案

**接口路径**: `POST /api/case/phase4/remunerationPlan/add`

**请求参数**: 支持批量新增,传入RemunerationPlan对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "报酬方案添加成功，共添加X条记录",
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

### 4.5 修改报酬方案

**接口路径**: `POST /api/case/phase4/remunerationPlan/update`

**请求参数**: 使用RemunerationPlan实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "报酬方案更新成功",
  "data": null
}
```

---

### 4.6 删除报酬方案

**接口路径**: `GET /api/case/phase4/remunerationPlan/delete/{id}`

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

## 五、重要行为报告 (ImportantActions)

### 5.1 查询所有重要行为报告

**接口路径**: `GET /api/case/phase4/importantActions/list`

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
      "zysx": "重要事项",
      "zysxnr": "重要事项内容",
      "zysxrq": "重要事项日期",
      "zysxzr": "重要事项责任人",
      "zt": "0"
    }
  ]
}
```

---

### 5.2 根据案件ID查询重要行为报告

**接口路径**: `GET /api/case/phase4/importantActions/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同5.1

---

### 5.3 根据ID查询单条重要行为报告

**接口路径**: `GET /api/case/phase4/importantActions/{id}`

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

### 5.4 新增重要行为报告

**接口路径**: `POST /api/case/phase4/importantActions/add`

**请求参数**: 支持批量新增,传入ImportantActions对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "重要行为报告添加成功，共添加X条记录",
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
- `zysx`: 重要事项
- `zysxnr`: 重要事项内容
- `zysxrq`: 重要事项日期
- `zysxzr`: 重要事项责任人
- `zt`: 状态 (默认值: "0")

---

### 5.5 修改重要行为报告

**接口路径**: `POST /api/case/phase4/importantActions/update`

**请求参数**: 使用ImportantActions实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "重要行为报告更新成功",
  "data": null
}
```

---

### 5.6 删除重要行为报告

**接口路径**: `GET /api/case/phase4/importantActions/delete/{id}`

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

## 六、抵消权审查 (SetoffReview)

### 6.1 查询所有抵消权审查

**接口路径**: `GET /api/case/phase4/setoffReview/list`

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
      "dxqmc": "抵消权名称",
      "dxqje": "抵消权金额",
      "dxqzt": "抵消权状态",
      "dxqrq": "抵消权日期",
      "dxqqr": "抵消权确认人",
      "zt": "0"
    }
  ]
}
```

---

### 6.2 根据案件ID查询抵消权审查

**接口路径**: `GET /api/case/phase4/setoffReview/listByCase/{caseId}`

**路径参数**:
- `caseId`: 案件ID (Integer, 必填)

**返回值**: 同6.1

---

### 6.3 根据ID查询单条抵消权审查

**接口路径**: `GET /api/case/phase4/setoffReview/{id}`

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

### 6.4 新增抵消权审查

**接口路径**: `POST /api/case/phase4/setoffReview/add`

**请求参数**: 支持批量新增,传入SetoffReview对象数组

**返回值**:
```json
{
  "code": 200,
  "message": "抵消权审查添加成功，共添加X条记录",
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
- `dxqmc`: 抵消权名称
- `dxqje`: 抵消权金额
- `dxqzt`: 抵消权状态
- `dxqrq`: 抵消权日期
- `dxqqr`: 抵消权确认人
- `zt`: 状态 (默认值: "0")

---

### 6.5 修改抵消权审查

**接口路径**: `POST /api/case/phase4/setoffReview/update`

**请求参数**: 使用SetoffReview实体对象,需要包含 `sepId`

**返回值**:
```json
{
  "code": 200,
  "message": "抵消权审查更新成功",
  "data": null
}
```

---

### 6.6 删除抵消权审查

**接口路径**: `GET /api/case/phase4/setoffReview/delete/{id}`

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
第四阶段的所有新增接口支持批量新增,传入对象数组即可

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
