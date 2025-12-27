# 文件上传功能分离方案

## 1. 问题分析
当前CASE_FILES表同时管理了任务管理和按键管理两个模块的文件上传，导致数据混乱，需要进行分离。

## 2. 现有表结构
```sql
CREATE TABLE [dbo].[CASE_FILES] (
  [SEP_ID] int  NOT NULL,
  [SEP_LD] int  NULL,
  [SEP_MD] int  NULL,
  [SEP_ND] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [SEP_AUSER] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [SEP_ADATE] datetime  NULL,
  [SEP_EUSER] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [SEP_EDATE] datetime  NULL,
  [case_id] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [ZBID] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [file_name] nvarchar(255) COLLATE Chinese_PRC_CI_AS  NULL,
  [file_path] nvarchar(255) COLLATE Chinese_PRC_CI_AS  NULL,
  [file_url] nvarchar(255) COLLATE Chinese_PRC_CI_AS  NULL,
  [file_size] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [WJLX] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  [file_type] nvarchar(255) COLLATE Chinese_PRC_CI_AS  NULL,
  [is_deleted] nvarchar(50) COLLATE Chinese_PRC_CI_AS DEFAULT 0 NULL,
  [ID] nvarchar(50) COLLATE Chinese_PRC_CI_AS  NULL,
  CONSTRAINT [PK_CASE_FILES] PRIMARY KEY CLUSTERED ([SEP_ID])
)
```

## 3. 分离方案

### 方案A：添加模块区分字段（推荐）
在现有表中添加MODULE_TYPE字段，用于标识文件所属模块。

**优点：**
- 改动最小，兼容性最好
- 不需要迁移数据
- 可以明确区分不同模块的文件

**缺点：**
- 表中仍然存储了两个模块的数据

### 方案B：创建新表分离
创建新的表存储其中一个模块的文件。

**优点：**
- 数据完全分离，结构更清晰

**缺点：**
- 需要迁移数据
- 改动较大，可能影响现有功能
- 增加了维护成本

### 方案C：使用现有字段区分
使用现有字段（如case_id和ZBID）来区分模块。

**优点：**
- 不需要修改表结构

**缺点：**
- 逻辑不清晰，容易出错
- 不利于后续扩展

## 4. 推荐方案

推荐使用**方案A**，即在现有表中添加MODULE_TYPE字段。

### 具体实施步骤

1. **修改数据库表结构**
   - 添加MODULE_TYPE字段，用于标识模块类型
   - 建议值："task"（任务管理）、"key"（按键管理）

2. **更新后端API**
   - 修改所有文件上传相关API，添加模块类型参数
   - 在保存文件时，记录模块类型
   - 在查询文件时，根据模块类型过滤

3. **更新前端代码**
   - 在文件上传时，传递正确的模块类型
   - 在文件查询时，添加模块类型条件

4. **数据迁移**
   - 为现有数据添加合适的MODULE_TYPE值

## 5. 预期效果

- 任务管理和按键管理的文件数据清晰分离
- 两个模块的文件上传功能互不影响
- 便于后续功能扩展和维护

## 6. 实施计划

| 阶段 | 任务 | 负责人 | 完成时间 |
|------|------|--------|----------|
| 1 | 修改数据库表结构 | 后端开发 | 2天 |
| 2 | 更新后端API | 后端开发 | 3天 |
| 3 | 更新前端代码 | 前端开发 | 2天 |
| 4 | 数据迁移 | DBA | 1天 |
| 5 | 测试验证 | 测试人员 | 2天 |
