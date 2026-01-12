# 文件管理API文档

## API概述

本文档描述了法律案件管理系统中的文件管理相关API接口，提供完整的文件上传、下载、查询、更新、删除等功能。所有API遵循RESTful设计规范，支持文件的完整生命周期管理。

### 功能特性

- 文件上传（支持最大50MB）
- 文件下载
- 文件信息查询
- 文件列表分页查询
- 文件重命名
- 文件状态管理
- 批量操作（删除、状态更新）
- 文件统计信息
- 文件预览（支持图片、文本、PDF）

### 技术规范

- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **文件大小限制**: 50MB

## 基础URL

```
http://localhost:8081/api/v1
```

生产环境请替换为实际的服务器地址。

## 认证方式

当前版本暂未实现认证机制，后续版本将添加JWT Token认证。

**认证头格式**（待实现）：
```
Authorization: Bearer {token}
```

## 通用响应格式

所有API响应遵循统一的格式：

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null
}
```

## API端点详细说明

### 1. 文件上传

#### 基本信息

- **路径**: `/file/upload`
- **方法**: `POST`
- **Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件（最大50MB） |
| bizType | String | 是 | 业务类型（如：case、document、evidence等） |
| bizId | Long | 是 | 业务ID（关联的业务记录ID） |

#### 请求示例

```bash
curl -X POST "http://localhost:8081/api/v1/file/upload" \
  -F "file=@test.txt" \
  -F "bizType=case" \
  -F "bizId=1"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalFileName": "test.txt",
    "storedFileName": "abc123-def456_test.txt",
    "filePath": "C:\\law-upload\\case\\2026-01-08\\abc123-def456_test.txt",
    "fileSize": 1024,
    "fileExtension": "txt",
    "mimeType": "text/plain",
    "bizType": "case",
    "bizId": 1,
    "uploadTime": "2026-01-08T15:30:00",
    "uploadUserId": 1,
    "fileStatus": 1,
    "status": "ACTIVE",
    "createTime": "2026-01-08T15:30:00",
    "updateTime": "2026-01-08T15:30:00"
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 文件不能为空 |
| 400 | 文件大小不能超过50MB |
| 500 | 文件上传失败 |

---

### 2. 文件下载

#### 基本信息

- **路径**: `/file/download/{fileId}`
- **方法**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 请求示例

```bash
curl -X GET "http://localhost:8081/api/v1/file/download/1" \
  --output downloaded_file.txt
```

#### 响应

- **Content-Type**: 根据文件MIME类型自动设置
- **Content-Disposition**: `attachment; filename="{原始文件名}"`
- **Body**: 文件二进制内容

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 404 | 文件不存在 |
| 500 | 文件下载失败 |

---

### 3. 获取文件信息

#### 基本信息

- **路径**: `/file/{fileId}`
- **方法**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 请求示例

```bash
curl -X GET "http://localhost:8081/api/v1/file/1"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalFileName": "test.txt",
    "storedFileName": "abc123-def456_test.txt",
    "filePath": "C:\\law-upload\\case\\2026-01-08\\abc123-def456_test.txt",
    "fileSize": 1024,
    "fileExtension": "txt",
    "mimeType": "text/plain",
    "bizType": "case",
    "bizId": 1,
    "uploadTime": "2026-01-08T15:30:00",
    "uploadUserId": 1,
    "fileStatus": 1,
    "status": "ACTIVE",
    "createTime": "2026-01-08T15:30:00",
    "updateTime": "2026-01-08T15:30:00"
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 404 | 文件不存在 |

---

### 4. 获取文件列表（分页）

#### 基本信息

- **路径**: `/file/list`
- **方法**: `GET`

#### 查询参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| pageNum | Integer | 否 | 1 | 页码（从1开始） |
| pageSize | Integer | 否 | 10 | 每页大小 |
| bizType | String | 否 | null | 业务类型（过滤条件） |
| bizId | Long | 否 | null | 业务ID（过滤条件） |
| status | String | 否 | null | 文件状态（过滤条件） |

#### 请求示例

```bash
curl -X GET "http://localhost:8081/api/v1/file/list?pageNum=1&pageSize=10&bizType=case&status=ACTIVE"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "originalFileName": "test.txt",
        "storedFileName": "abc123-def456_test.txt",
        "filePath": "C:\\law-upload\\case\\2026-01-08\\abc123-def456_test.txt",
        "fileSize": 1024,
        "fileExtension": "txt",
        "mimeType": "text/plain",
        "bizType": "case",
        "bizId": 1,
        "uploadTime": "2026-01-08T15:30:00",
        "uploadUserId": 1,
        "fileStatus": 1,
        "status": "ACTIVE",
        "createTime": "2026-01-08T15:30:00",
        "updateTime": "2026-01-08T15:30:00"
      }
    ]
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 分页参数错误 |

---

### 5. 删除文件

#### 基本信息

- **路径**: `/file/{fileId}`
- **方法**: `DELETE`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 请求示例

```bash
curl -X DELETE "http://localhost:8081/api/v1/file/1"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 404 | 文件不存在 |
| 500 | 文件删除失败 |

---

### 6. 批量删除文件

#### 基本信息

- **路径**: `/file/batch`
- **方法**: `DELETE`
- **Content-Type**: `application/json`

#### 请求体

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileIds | Array[Long] | 是 | 文件ID列表 |

#### 请求示例

```bash
curl -X DELETE "http://localhost:8081/api/v1/file/batch" \
  -H "Content-Type: application/json" \
  -d "[1, 2, 3]"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 文件ID列表不能为空 |
| 404 | 文件不存在 |
| 500 | 批量删除文件失败 |

---

### 7. 文件重命名

#### 基本信息

- **路径**: `/file/{fileId}/rename`
- **方法**: `PUT`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| newFileName | String | 是 | 新文件名 |

#### 请求示例

```bash
curl -X PUT "http://localhost:8081/api/v1/file/1/rename?newFileName=new_name.txt"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalFileName": "new_name.txt",
    "storedFileName": "xyz789-uvw012_new_name.txt",
    "filePath": "C:\\law-upload\\case\\2026-01-08\\xyz789-uvw012_new_name.txt",
    "fileSize": 1024,
    "fileExtension": "txt",
    "mimeType": "text/plain",
    "bizType": "case",
    "bizId": 1,
    "uploadTime": "2026-01-08T15:30:00",
    "uploadUserId": 1,
    "fileStatus": 1,
    "status": "ACTIVE",
    "createTime": "2026-01-08T15:30:00",
    "updateTime": "2026-01-08T15:35:00"
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 新文件名不能为空 |
| 404 | 文件不存在 |
| 500 | 文件重命名失败 |

---

### 8. 更新文件状态

#### 基本信息

- **路径**: `/file/{fileId}/status`
- **方法**: `PUT`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 是 | 文件状态（ACTIVE、ARCHIVED、DELETED等） |

#### 请求示例

```bash
curl -X PUT "http://localhost:8081/api/v1/file/1/status?status=ARCHIVED"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalFileName": "test.txt",
    "storedFileName": "abc123-def456_test.txt",
    "filePath": "C:\\law-upload\\case\\2026-01-08\\abc123-def456_test.txt",
    "fileSize": 1024,
    "fileExtension": "txt",
    "mimeType": "text/plain",
    "bizType": "case",
    "bizId": 1,
    "uploadTime": "2026-01-08T15:30:00",
    "uploadUserId": 1,
    "fileStatus": 1,
    "status": "ARCHIVED",
    "createTime": "2026-01-08T15:30:00",
    "updateTime": "2026-01-08T15:36:00"
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 状态不能为空 |
| 404 | 文件不存在 |

---

### 9. 批量更新文件状态

#### 基本信息

- **路径**: `/file/batch/status`
- **方法**: `PUT`
- **Content-Type**: `application/json`

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | String | 是 | 文件状态 |

#### 请求体

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileIds | Array[Long] | 是 | 文件ID列表 |

#### 请求示例

```bash
curl -X PUT "http://localhost:8081/api/v1/file/batch/status?status=ACTIVE" \
  -H "Content-Type: application/json" \
  -d "[1, 2, 3]"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 文件ID列表不能为空 |
| 400 | 状态不能为空 |
| 404 | 文件不存在 |
| 500 | 批量更新文件状态失败 |

---

### 10. 获取文件统计信息

#### 基本信息

- **路径**: `/file/statistics`
- **方法**: `GET`

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| bizType | String | 否 | 业务类型（过滤条件） |
| bizId | Long | 否 | 业务ID（过滤条件） |

#### 请求示例

```bash
curl -X GET "http://localhost:8081/api/v1/file/statistics?bizType=case"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalFiles": 100,
    "totalSize": 104857600,
    "totalSizeMB": 100.0,
    "statusCount": {
      "ACTIVE": 80,
      "ARCHIVED": 15,
      "DELETED": 5
    },
    "extensionCount": {
      "pdf": 40,
      "doc": 30,
      "docx": 20,
      "txt": 10
    }
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| totalFiles | Long | 文件总数 |
| totalSize | Long | 文件总大小（字节） |
| totalSizeMB | Double | 文件总大小（MB） |
| statusCount | Object | 各状态文件数量统计 |
| extensionCount | Object | 各文件扩展名数量统计 |

---

### 11. 文件预览

#### 基本信息

- **路径**: `/file/preview/{fileId}`
- **方法**: `GET`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Long | 是 | 文件ID |

#### 请求示例

```bash
curl -X GET "http://localhost:8081/api/v1/file/preview/1" \
  --output preview_file.txt
```

#### 响应

- **Content-Type**: 根据文件MIME类型自动设置
- **Content-Disposition**: `inline; filename="{原始文件名}"`
- **Body**: 文件二进制内容

#### 支持的文件类型

- 图片文件：`image/*`（如：image/jpeg、image/png等）
- 文本文件：`text/*`（如：text/plain、text/html等）
- PDF文件：`application/pdf`

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 该文件类型不支持预览 |
| 404 | 文件不存在 |

---

## 完整错误码列表

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 操作成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和内容 |
| 400 | 文件不能为空 | 确保上传了文件 |
| 400 | 文件大小不能超过50MB | 压缩文件或分批上传 |
| 400 | 新文件名不能为空 | 提供有效的文件名 |
| 400 | 状态不能为空 | 提供有效的状态值 |
| 400 | 文件ID列表不能为空 | 提供有效的文件ID列表 |
| 404 | 文件不存在 | 确认文件ID是否正确 |
| 500 | 文件上传失败 | 检查服务器存储空间和权限 |
| 500 | 文件下载失败 | 检查文件是否存在和权限 |
| 500 | 文件删除失败 | 检查文件权限和服务器状态 |
| 500 | 文件重命名失败 | 检查文件权限和服务器状态 |
| 500 | 批量删除文件失败 | 检查服务器状态和日志 |
| 500 | 批量更新文件状态失败 | 检查服务器状态和日志 |
| 400 | 该文件类型不支持预览 | 使用下载功能查看文件 |

## 数据模型

### FileRecord（文件记录）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 文件ID（主键） |
| originalFileName | String | 原始文件名 |
| storedFileName | String | 存储文件名（UUID+原始文件名） |
| filePath | String | 文件存储路径 |
| fileSize | Long | 文件大小（字节） |
| fileExtension | String | 文件扩展名 |
| mimeType | String | MIME类型 |
| bizType | String | 业务类型 |
| bizId | Long | 业务ID |
| uploadTime | LocalDateTime | 上传时间 |
| uploadUserId | Long | 上传用户ID |
| fileStatus | Integer | 文件状态（1-正常，0-删除） |
| status | String | 状态（ACTIVE、ARCHIVED、DELETED等） |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |

## 使用场景和注意事项

### 使用场景

1. **案件文件上传**
   - 上传案件相关的文档、证据材料
   - 业务类型：`case`
   - 业务ID：案件ID

2. **文档管理**
   - 上传和管理各类文档
   - 业务类型：`document`
   - 业务ID：文档ID

3. **证据材料管理**
   - 上传和管理证据材料
   - 业务类型：`evidence`
   - 业务ID：证据ID

### 注意事项

1. **文件大小限制**
   - 单个文件最大50MB
   - 超过限制的文件需要压缩或分批上传

2. **文件存储**
   - 文件按业务类型和日期组织目录结构
   - 存储路径：`{uploadPath}/{bizType}/{yyyy-MM-dd}/{storedFileName}`

3. **文件命名**
   - 系统自动生成唯一文件名（UUID+原始文件名）
   - 重命名会生成新的存储文件名

4. **文件删除**
   - 删除操作会同时删除物理文件和数据库记录
   - 删除操作不可恢复，请谨慎操作

5. **文件预览**
   - 仅支持图片、文本、PDF文件
   - 其他文件类型请使用下载功能

6. **批量操作**
   - 批量操作失败时会抛出异常，不会部分成功
   - 建议分批处理大量文件

7. **状态管理**
   - 常用状态：ACTIVE（活跃）、ARCHIVED（归档）、DELETED（删除）
   - 状态值可根据业务需求自定义

## 测试建议

### 单元测试

- 测试每个API的正常场景
- 测试边界条件（如：文件大小限制、空文件等）
- 测试异常场景（如：文件不存在、参数错误等）

### 集成测试

- 测试完整的文件生命周期
- 测试批量操作的正确性
- 测试并发上传和下载

### 性能测试

- 测试大文件上传性能
- 测试并发上传性能
- 测试批量操作性能

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-08 | 初始版本，实现基础CRUD功能 |

## 联系方式

如有问题或建议，请联系开发团队。

---

**文档版本**: 1.0.0  
**最后更新**: 2026-01-08  
**维护者**: 开发团队
