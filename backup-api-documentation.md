# 数据库备份功能 API 文档

## 一、功能概述

项目提供了完整的数据库备份管理功能，包括**定时自动备份**和**手动触发备份**，支持前端查看、下载、删除备份文件。

### 架构说明

| 组件 | 说明 |
|------|------|
| `DatabaseBackupScheduler` | 定时任务调度器，按 cron 表达式自动执行备份 |
| `DatabaseBackupService` | 核心备份服务，通过 `mysqldump` 执行备份、压缩、清理 |
| `DatabaseBackupController` | REST API 控制器，提供前端交互接口 |
| `BackupRecord` | 备份记录实体，持久化到 `tb_backup_record` 表 |
| `BackupProperties` | 备份配置属性，从 `application.yml` 读取 |

### 配置文件（application.yml）

```yaml
backup:
  enabled: true                          # 是否启用自动备份
  cron: "0 0 2 * * ?"                   # 定时备份 cron 表达式（默认每天凌晨2点）
  path: D:\\law-backup                   # 备份文件存放路径
  retention-days: 30                     # 备份文件保留天数
  mysqldump-path: "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe"
  host: localhost                        # 数据库主机
  port: 3306                             # 数据库端口
  username: root                         # 数据库用户名
  password: 123456                       # 数据库密码
  database: law                          # 数据库名称
  compress: true                         # 是否压缩备份文件（GZIP）
```

---

## 二、API 接口总览

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/system/backup/list` | `system:backup:list` | 分页查询备份记录列表（支持筛选） |
| `POST` | `/system/backup/execute` | `system:backup:execute` | 手动触发备份 |
| `GET` | `/system/backup/status` | `system:backup:list` | 获取备份状态和最近备份信息 |
| `GET` | `/system/backup/detail/{id}` | `system:backup:list` | 查询备份详情 |
| `GET` | `/system/backup/download/{id}` | `system:backup:download` | 下载备份文件 |
| `DELETE` | `/system/backup/{id}` | `system:backup:delete` | 删除备份记录和文件 |
| `POST` | `/system/backup/cleanup` | `system:backup:execute` | 清理过期备份 |
| `GET` | `/system/backup/statistics` | `system:backup:list` | 获取备份统计信息（🆕 新增） |

---

## 三、接口详细说明

### 3.1 查询备份记录列表（支持筛选）

```
GET /system/backup/list
```

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `pageNum` | Integer | 否 | 1 | 页码，从1开始 |
| `pageSize` | Integer | 否 | 10 | 每页数量 |
| `status` | String | 否 | - | 备份状态筛选：`PENDING` / `RUNNING` / `SUCCESS` / `FAILED` |
| `backupType` | String | 否 | - | 备份类型筛选：`FULL`（定时自动）/ `MANUAL`（手动触发） |
| `startDate` | String | 否 | - | 备份开始时间起始，格式：`yyyy-MM-dd HH:mm:ss` |
| `endDate` | String | 否 | - | 备份开始时间截止，格式：`yyyy-MM-dd HH:mm:ss` |

#### 请求示例

```http
GET /system/backup/list?pageNum=1&pageSize=10&status=SUCCESS&backupType=MANUAL&startDate=2026-01-01 00:00:00&endDate=2026-12-31 23:59:59
```

#### 返回值

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "list": [
      {
        "id": 128,
        "fileName": "law_backup_20260512_143022.sql.gz",
        "filePath": "D:\\law-backup\\law_backup_20260512_143022.sql.gz",
        "fileSize": 2456780,
        "backupType": "MANUAL",
        "status": "SUCCESS",
        "errorMessage": null,
        "startTime": "2026-05-12T14:30:22",
        "endTime": "2026-05-12T14:30:35",
        "duration": 13200,
        "databaseName": "law",
        "tableCount": null,
        "recordCount": null,
        "isDeleted": false,
        "createTime": "2026-05-12T14:30:22",
        "updateTime": "2026-05-12T14:30:35"
      },
      {
        "id": 127,
        "fileName": "law_backup_20260512_020000.sql.gz",
        "filePath": "D:\\law-backup\\law_backup_20260512_020000.sql.gz",
        "fileSize": 2445678,
        "backupType": "FULL",
        "status": "SUCCESS",
        "errorMessage": null,
        "startTime": "2026-05-12T02:00:00",
        "endTime": "2026-05-12T02:00:14",
        "duration": 14100,
        "databaseName": "law",
        "tableCount": null,
        "recordCount": null,
        "isDeleted": false,
        "createTime": "2026-05-12T02:00:00",
        "updateTime": "2026-05-12T02:00:14"
      }
    ],
    "pageNum": 1,
    "pageSize": 10
  }
}
```

#### BackupRecord 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 备份记录ID |
| `fileName` | String | 备份文件名（压缩后以 `.sql.gz` 结尾） |
| `filePath` | String | 备份文件完整路径 |
| `fileSize` | Long | 文件大小（字节） |
| `backupType` | String | 备份类型：`FULL`（定时）/ `MANUAL`（手动） |
| `status` | String | 状态：`PENDING` / `RUNNING` / `SUCCESS` / `FAILED` |
| `errorMessage` | String | 失败时的错误信息 |
| `startTime` | LocalDateTime | 备份开始时间 |
| `endTime` | LocalDateTime | 备份结束时间 |
| `duration` | Long | 备份耗时（毫秒） |
| `databaseName` | String | 数据库名称 |
| `createTime` | LocalDateTime | 记录创建时间 |

---

### 3.2 手动执行备份

```
POST /system/backup/execute
```

#### 请求参数

无（无需请求体）

#### 请求示例

```http
POST /system/backup/execute
Content-Type: application/json
```

#### 成功返回值

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 129,
    "fileName": "law_backup_20260512_153000.sql.gz",
    "filePath": "D:\\law-backup\\law_backup_20260512_153000.sql.gz",
    "fileSize": 2458120,
    "backupType": "MANUAL",
    "status": "SUCCESS",
    "errorMessage": null,
    "startTime": "2026-05-12T15:30:00",
    "endTime": "2026-05-12T15:30:14",
    "duration": 14200,
    "databaseName": "law",
    "tableCount": null,
    "recordCount": null,
    "isDeleted": false,
    "createTime": "2026-05-12T15:30:00",
    "updateTime": "2026-05-12T15:30:14"
  }
}
```

#### 失败返回值（备份任务正在执行中）

```json
{
  "code": 500,
  "message": "备份任务正在执行中，请稍后再试",
  "data": null
}
```

#### 失败返回值（备份执行失败）

```json
{
  "code": 500,
  "message": "备份执行失败: mysqldump 执行失败: Access denied for user...",
  "data": null
}
```

---

### 3.3 获取备份状态

```
GET /system/backup/status
```

#### 请求示例

```http
GET /system/backup/status
```

#### 返回值

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isRunning": false,
    "latestBackup": {
      "id": 129,
      "fileName": "law_backup_20260512_153000.sql.gz",
      "status": "SUCCESS",
      "startTime": "2026-05-12T15:30:00",
      "endTime": "2026-05-12T15:30:14",
      "fileSize": 2458120,
      "backupType": "MANUAL"
    },
    "latestSuccessBackup": {
      "id": 129,
      "fileName": "law_backup_20260512_153000.sql.gz",
      "startTime": "2026-05-12T15:30:00",
      "fileSize": 2458120
    }
  }
}
```

---

### 3.4 查询备份详情

```
GET /system/backup/detail/{id}
```

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 备份记录ID |

#### 请求示例

```http
GET /system/backup/detail/129
```

#### 返回值

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 129,
    "fileName": "law_backup_20260512_153000.sql.gz",
    "filePath": "D:\\law-backup\\law_backup_20260512_153000.sql.gz",
    "fileSize": 2458120,
    "backupType": "MANUAL",
    "status": "SUCCESS",
    "errorMessage": null,
    "startTime": "2026-05-12T15:30:00",
    "endTime": "2026-05-12T15:30:14",
    "duration": 14200,
    "databaseName": "law",
    "tableCount": null,
    "recordCount": null,
    "isDeleted": false,
    "createTime": "2026-05-12T15:30:00",
    "updateTime": "2026-05-12T15:30:14"
  }
}
```

#### 失败返回值

```json
{
  "code": 500,
  "message": "备份记录不存在",
  "data": null
}
```

---

### 3.5 下载备份文件

```
GET /system/backup/download/{id}
```

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 备份记录ID |

#### 说明

- 返回原始 `.sql` 文件流（如原始文件为 `.gz` 压缩包，服务端自动解压后返回）
- 响应头包含 `Content-Disposition: attachment; filename="xxx.sql"`，浏览器会自动触发下载
- 响应 Content-Type 为 `application/octet-stream`

#### 请求示例

```http
GET /system/backup/download/129
```

#### 成功响应

- HTTP Status: `200 OK`
- 响应体：二进制文件流
- 响应头：
  ```
  Content-Type: application/octet-stream
  Content-Disposition: attachment; filename="law_backup_20260512_153000.sql"
  ```

#### 失败响应（文件不存在）

- HTTP Status: `404 Not Found`

---

### 3.6 删除备份记录

```
DELETE /system/backup/{id}
```

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 备份记录ID |

#### 说明

- 同时删除磁盘上的备份文件和数据库中的记录（逻辑删除，标记 `isDeleted=true`）

#### 请求示例

```http
DELETE /system/backup/129
```

#### 成功返回值

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

#### 失败返回值

```json
{
  "code": 500,
  "message": "删除备份失败",
  "data": null
}
```

---

### 3.7 清理过期备份

```
POST /system/backup/cleanup
```

#### 说明

- 根据配置的 `retention-days`（默认30天），清理超过保留期限的备份记录和文件

#### 请求示例

```http
POST /system/backup/cleanup
Content-Type: application/json
```

#### 成功返回值

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3.8 获取备份统计信息（🆕 新增）

```
GET /system/backup/statistics
```

#### 请求示例

```http
GET /system/backup/statistics
```

#### 返回值

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 128,
    "successCount": 125,
    "failedCount": 3,
    "runningCount": 0,
    "totalFileSize": 314572800,
    "totalFileSizeDisplay": "300.00 MB",
    "lastBackupTime": "2026-05-12T15:30:00",
    "lastSuccessBackupTime": "2026-05-12T15:30:00",
    "lastSuccessFileName": "law_backup_20260512_153000.sql.gz",
    "backupPath": "D:\\law-backup",
    "retentionDays": 30,
    "backupEnabled": true,
    "cronExpression": "0 0 2 * * ?"
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `totalCount` | Long | 备份总次数 |
| `successCount` | Long | 成功次数 |
| `failedCount` | Long | 失败次数 |
| `runningCount` | Long | 正在执行中的数量 |
| `totalFileSize` | Long | 成功备份文件总大小（字节） |
| `totalFileSizeDisplay` | String | 文件总大小（人类可读格式） |
| `lastBackupTime` | LocalDateTime | 最近一次备份时间 |
| `lastSuccessBackupTime` | LocalDateTime | 最近一次成功备份时间 |
| `lastSuccessFileName` | String | 最近成功备份的文件名 |
| `backupPath` | String | 备份文件存放路径 |
| `retentionDays` | Integer | 备份保留天数 |
| `backupEnabled` | Boolean | 自动备份是否启用 |
| `cronExpression` | String | 定时备份 cron 表达式 |

---

## 四、定时自动备份

### 工作机制

- 由 `DatabaseBackupScheduler` 组件驱动，使用 Spring `@Scheduled` 注解
- 默认 cron 表达式：`0 0 2 * * ?`（每天凌晨 2:00 执行）
- 可通过 `application.yml` 中的 `backup.cron` 配置自定义执行时间
- 通过 `backup.enabled` 控制是否启用定时备份（设为 `false` 可关闭）
- 如检测到备份任务正在执行中，会自动跳过当次定时触发，避免并发冲突

### Cron 表达式常见配置示例

| 表达式 | 说明 |
|--------|------|
| `0 0 2 * * ?` | 每天凌晨 2:00 |
| `0 0 0/6 * * ?` | 每 6 小时执行一次 |
| `0 0 2 * * SUN` | 每周日凌晨 2:00 |
| `0 0 2 1 * ?` | 每月 1 日凌晨 2:00 |

### 备份流程

1. 创建备份记录（状态：`PENDING` → `RUNNING`）
2. 通过 `mysqldump` 命令导出 SQL 文件
3. 使用 GZIP 压缩 SQL 文件（如 `backup.compress=true`）
4. 更新备份记录（状态：`SUCCESS` / `FAILED`）
5. 自动清理超过保留期限的旧备份文件

### 备份命令参数

```bash
mysqldump
  -h <host> -P <port> -u <username> -p<password>
  --single-transaction   # 一致性快照备份（不锁表）
  --routines             # 包含存储过程和函数
  --triggers             # 包含触发器
  --events               # 包含事件调度器
  --set-gtid-purged=OFF  # 兼容性设置
  --default-character-set=utf8mb4
  --quick                # 逐行导出（适用于大表）
  --lock-tables=false    # 不锁表
  <database>
```

---

## 五、前端集成指南

### 5.1 所需权限

在前端控制按钮/页面的显示需要检查以下权限码：

| 功能 | 权限码 |
|------|--------|
| 查看备份列表/状态/详情/统计 | `system:backup:list` |
| 手动执行备份 | `system:backup:execute` |
| 下载备份文件 | `system:backup:download` |
| 删除备份记录 | `system:backup:delete` |

### 5.2 典型前端交互流程

1. **备份管理页面** → 调用 `GET /system/backup/statistics` 显示概览卡片
2. **手动备份按钮** → 调用 `POST /system/backup/execute`，成功后刷新列表
3. **备份列表** → 调用 `GET /system/backup/list` 分页展示，支持筛选
4. **下载按钮** → 调用 `GET /system/backup/download/{id}`，以 blob 方式处理
5. **删除按钮** → 二次确认后调用 `DELETE /system/backup/{id}`
6. **状态轮询** → 备份执行中可定时调用 `GET /system/backup/status` 获取进度

### 5.3 前端下载文件示例（JavaScript）

```javascript
async function downloadBackup(recordId, fileName) {
  const response = await fetch(`/system/backup/download/${recordId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('下载失败');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace('.gz', '');
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

## 六、本次优化内容（2026-05-12）

| 优化项 | 说明 |
|--------|------|
| **列表筛选功能** | `GET /system/backup/list` 新增 `status`、`backupType`、`startDate`、`endDate` 可选筛选参数 |
| **备份统计接口** | 新增 `GET /system/backup/statistics`，返回备份总数、成功/失败次数、存储总量、配置信息等 |
| **BackupQueryRequest DTO** | 新建 `dto/request/BackupQueryRequest.java`，统一筛选+分页请求参数 |
| **BackupStatisticsResponse DTO** | 新建 `dto/response/BackupStatisticsResponse.java`，结构化统计响应 |
| **Repository 增强** | 新增 `findAllWithFilters`、`sumSuccessFileSize`、`countAllNotDeleted` 查询方法 |