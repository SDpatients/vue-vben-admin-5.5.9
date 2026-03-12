# 案件任务表 (tb_case_task) 数据说明

## 概述

当新建一个破产案件后，系统会自动在 `tb_case_task` 表中创建 **23条** 任务记录，用于跟踪案件的全流程进度。

---

## 触发时机

- **触发点**: 创建新案件时
- **调用位置**: `BankruptCaseServiceImpl.createCase()` 方法
- **执行逻辑**: 案件保存成功后，自动调用 `caseTaskService.createTasksForCase(caseId)` 创建任务

---

## 新增数据详情

### 任务列表

| 序号 | task_code | task_name | task_description |
|------|-----------|-----------|------------------|
| 1 | TASK_001 | 提交破产申请材料 | 申请人 |
| 2 | TASK_002 | 裁定受理并公告 | 法院 |
| 3 | TASK_003 | 全面接管债务人 | 管理人 |
| 4 | TASK_004 | 管理人印章 | 管理人 |
| 5 | TASK_005 | 调查财产及经营状况 | 管理人 |
| 6 | TASK_006 | 决定合同继续履行或解除 | 管理人 |
| 7 | TASK_007 | 追收债务人财产 | 管理人 |
| 8 | TASK_008 | 通知已知债权人并公告 | 管理人 |
| 9 | TASK_009 | 接收、登记债权申报 | 管理人 |
| 10 | TASK_010 | 审查申报债权并编制债权表 | 管理人 |
| 11 | TASK_011 | 筹备第一次债权人会议 | 管理人 |
| 12 | TASK_012 | 召开会议核查债权与议决事项 | 债权人会议 |
| 13 | TASK_013 | 表决通过财产变价/分配方案 | 债权人会议、法院 |
| 14 | TASK_014 | 宣告重整与和解 | 法院 |
| 15 | TASK_015 | 审查宣告破产条件 | 法院 |
| 16 | TASK_016 | 裁定宣告债务人破产 | 法院 |
| 17 | TASK_017 | 拟定并执行财产变价方案 | 管理人 |
| 18 | TASK_018 | 执行破产财产分配 | 管理人 |
| 19 | TASK_019 | 破产费用与共益债务 | 管理人 |
| 20 | TASK_020 | 提请终结破产程序 | 管理人 |
| 21 | TASK_021 | 法院裁定并公告 | 法院 |
| 22 | TASK_022 | 办理企业注销登记 | 管理人 |
| 23 | TASK_023 | 管理人终止执行职务并归档 | 管理人 |

---

## 字段说明

### 每条记录的字段值

| 字段名 | 类型 | 说明 | 初始值 |
|--------|------|------|--------|
| `id` | bigint | 主键ID | 自增 |
| `case_id` | bigint | 案件ID | 新建案件的ID |
| `task_code` | varchar(20) | 任务编号 | TASK_001 ~ TASK_023 |
| `task_name` | varchar(255) | 任务名称 | 见上表 |
| `task_description` | text | 任务描述（责任主体） | 见上表 |
| `status` | varchar(20) | 任务状态 | `IN_PROGRESS` |
| `sort_order` | int | 排序序号 | 1 ~ 23 |
| `create_time` | datetime | 创建时间 | 当前时间 |
| `update_time` | datetime | 更新时间 | 当前时间 |
| `create_user_id` | bigint | 创建者ID | 案件创建者ID |
| `update_user_id` | bigint | 更新者ID | 案件创建者ID |
| `is_deleted` | tinyint(1) | 是否删除 | 0 |
| `status_audit` | varchar(20) | 审计状态 | `ACTIVE` |

---

## 任务状态枚举

| 状态值 | 中文说明 |
|--------|----------|
| `IN_PROGRESS` | 进行中（初始状态） |
| `COMPLETED` | 已完成 |
| `REVIEWING` | 核审中 |
| `SKIPPED` | 跳过 |
| `REJECTED` | 被驳回 |

---

## 任务阶段划分

### 第一阶段：申请与受理
- TASK_001 ~ TASK_002

### 第二阶段：管理人接管
- TASK_003 ~ TASK_007

### 第三阶段：债权申报与审查
- TASK_008 ~ TASK_010

### 第四阶段：债权人会议
- TASK_011 ~ TASK_013

### 第五阶段：重整与和解
- TASK_014

### 第六阶段：破产宣告
- TASK_015 ~ TASK_016

### 第七阶段：财产变价与分配
- TASK_017 ~ TASK_019

### 第八阶段：程序终结
- TASK_020 ~ TASK_023

---

## 相关API

### 获取案件任务列表
```
GET /api/case-tasks/case/{caseId}
```

### 获取任务统计
```
GET /api/case-tasks/case/{caseId}/statistics
```

### 更新任务状态
```
PUT /api/case-tasks/{taskId}
```

---

## 注意事项

1. 每个案件的23个任务在案件创建时自动生成
2. 同一案件下 `task_code` 唯一
3. 任务按 `sort_order` 字段排序显示
4. 任务支持文件上传，通过 `tb_file_record` 表关联（biz_type = 'CASE_TASK'）
