# tb_case_task 表 - 新建案件数据说明

## 概述

当新建一个案件（BankruptCase）后，系统会自动为该案件创建 **23个核心任务** 记录到 `tb_case_task` 表中。

---

## 表结构

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 主键，自增 |
| case_id | Long | 案件ID（关联破产案件） |
| task_code | String(20) | 任务代码 |
| task_name | String(255) | 任务名称 |
| task_description | Text | 任务描述（执行主体） |
| status | String(20) | 任务状态，默认 `IN_PROGRESS` |
| sort_order | Integer | 排序顺序 |
| is_deleted | Boolean | 是否删除，默认 `false` |
| create_time | DateTime | 创建时间，自动生成 |
| update_time | DateTime | 更新时间，自动更新 |
| create_user_id | Long | 创建人ID |
| update_user_id | Long | 更新人ID |

---

## 任务状态枚举

| 状态值 | 中文描述 |
|--------|----------|
| IN_PROGRESS | 进行中 |
| COMPLETED | 已完成 |
| REVIEWING | 核审中 |
| SKIPPED | 跳过 |
| REJECTED | 被驳回 |

---

## 新建案件时插入的23条任务数据

| sort_order | task_code | task_name | task_description | status |
|------------|-----------|-----------|------------------|--------|
| 1 | TASK_001 | 提交破产申请材料 | 申请人 | IN_PROGRESS |
| 2 | TASK_002 | 裁定受理并公告 | 法院 | IN_PROGRESS |
| 3 | TASK_003 | 全面接管债务人 | 管理人 | IN_PROGRESS |
| 4 | TASK_004 | 管理人印章 | 管理人 | IN_PROGRESS |
| 5 | TASK_005 | 调查财产及经营状况 | 管理人 | IN_PROGRESS |
| 6 | TASK_006 | 追收债务人财产 | 管理人 | IN_PROGRESS |
| 7 | TASK_007 | 决定合同继续履行或解除 | 管理人 | IN_PROGRESS |
| 8 | TASK_008 | 通知已知债权人并公告 | 管理人 | IN_PROGRESS |
| 9 | TASK_009 | 接收、登记债权申报 | 管理人 | IN_PROGRESS |
| 10 | TASK_010 | 审查申报债权并编制债权表 | 管理人 | IN_PROGRESS |
| 11 | TASK_011 | 债权审查结果通知 | 管理人 | IN_PROGRESS |
| 12 | TASK_012 | 会议资料 | 管理人 | IN_PROGRESS |
| 13 | TASK_013 | 表决事项和表决结果 | 债权人会议 | IN_PROGRESS |
| 14 | TASK_014 | 宣告重整与和解 | 法院 | IN_PROGRESS |
| 15 | TASK_015 | 审查宣告破产条件 | 法院 | IN_PROGRESS |
| 16 | TASK_016 | 裁定宣告债务人破产及公告 | 法院 | IN_PROGRESS |
| 17 | TASK_017 | 破产财产变价方案 | 管理人 | IN_PROGRESS |
| 18 | TASK_018 | 破产费用与共益债务 | 管理人 | IN_PROGRESS |
| 19 | TASK_019 | 破产财产分配方案 | 管理人 | IN_PROGRESS |
| 20 | TASK_020 | 提请终结破产程序 | 管理人 | IN_PROGRESS |
| 21 | TASK_021 | 法院裁定并公告 | 法院 | IN_PROGRESS |
| 22 | TASK_022 | 办理企业注销登记 | 管理人 | IN_PROGRESS |
| 23 | TASK_023 | 管理人终止执行职务并归档 | 管理人 | IN_PROGRESS |

---

## 数据示例

假设新建案件 `case_id = 100`，则插入的数据示例：

```json
[
  {
    "id": 1,
    "case_id": 100,
    "task_code": "TASK_001",
    "task_name": "提交破产申请材料",
    "task_description": "申请人",
    "status": "IN_PROGRESS",
    "sort_order": 1,
    "is_deleted": false,
    "create_time": "2026-03-14T10:00:00",
    "update_time": "2026-03-14T10:00:00"
  },
  {
    "id": 2,
    "case_id": 100,
    "task_code": "TASK_002",
    "task_name": "裁定受理并公告",
    "task_description": "法院",
    "status": "IN_PROGRESS",
    "sort_order": 2,
    "is_deleted": false,
    "create_time": "2026-03-14T10:00:00",
    "update_time": "2026-03-14T10:00:00"
  }
  // ... 其余21条任务记录
]
```

---

## 执行主体统计

| 执行主体 | 任务数量 |
|----------|----------|
| 管理人 | 15个 |
| 法院 | 5个 |
| 债权人会议 | 1个 |
| 申请人 | 1个 |
| 合计 | 22个 |

> 注：task_description 字段存储的是执行主体信息

---

## 相关接口

- **查询案件任务列表**: `GET /api/cases/{caseId}/tasks`
- **更新任务状态**: `PUT /api/cases/tasks/{taskId}`
- **批量更新任务状态**: `PUT /api/cases/tasks/batch-status`
- **获取任务统计**: `GET /api/cases/{caseId}/tasks/statistics`

---

## 代码位置

- 实体类: `src/main/java/com/lawbackend2/lawbackend2/entity/CaseTask.java`
- 服务实现: `src/main/java/com/lawbackend2/lawbackend2/service/impl/CaseTaskServiceImpl.java`
- 状态枚举: `src/main/java/com/lawbackend2/lawbackend2/enums/CaseTaskStatus.java`
