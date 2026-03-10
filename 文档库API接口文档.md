# 文档库 API 接口文档

## 概述

文档库模块提供了完整的文档管理功能，包括文件夹管理、文档管理、版本管理、权限控制、收藏和分享等功能。

**基础路径**: `/api/lib`

**认证方式**: JWT Token（需要在请求头中携带 `Authorization: Bearer <token>`）

---

## 1. 文件夹管理 API

### 1.1 创建文件夹

**接口**: `POST /api/lib/folders`

**描述**: 创建新的文件夹

**请求体**:
```json
{
  "folderName": "合同文档",
  "parentId": null,
  "description": "存放合同相关文档",
  "icon": "folder",
  "color": "#1890ff",
  "isPublic": false,
  "sortOrder": 0
}
```

**请求参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderName | String | 是 | 文件夹名称，最长100字符 |
| parentId | Long | 否 | 父文件夹ID，null表示根目录 |
| description | String | 否 | 文件夹描述 |
| icon | String | 否 | 文件夹图标 |
| color | String | 否 | 文件夹颜色 |
| isPublic | Boolean | 否 | 是否公开，默认false |
| sortOrder | Integer | 否 | 排序序号，默认0 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "合同文档",
    "folderPath": "/合同文档",
    "parentId": null,
    "folderLevel": 1,
    "sortOrder": 0,
    "description": "存放合同相关文档",
    "icon": "folder",
    "color": "#1890ff",
    "isPublic": false,
    "status": "ACTIVE",
    "createTime": "2026-03-09T10:30:00",
    "updateTime": "2026-03-09T10:30:00",
    "createUserId": 1
  }
}
```

---

### 1.2 获取文件夹详情

**接口**: `GET /api/lib/folders/{id}`

**描述**: 根据ID获取文件夹详细信息

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 文件夹ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "合同文档",
    "folderPath": "/合同文档",
    "parentId": null,
    "folderLevel": 1,
    "sortOrder": 0,
    "description": "存放合同相关文档",
    "documentCount": 5,
    "subFolderCount": 2,
    "isPublic": false,
    "status": "ACTIVE",
    "createTime": "2026-03-09T10:30:00"
  }
}
```

---

### 1.3 更新文件夹

**接口**: `PUT /api/lib/folders/{id}`

**描述**: 更新文件夹信息

**请求体**:
```json
{
  "folderName": "合同文档2024",
  "description": "2024年合同文档",
  "color": "#52c41a"
}
```

---

### 1.4 删除文件夹

**接口**: `DELETE /api/lib/folders/{id}`

**描述**: 删除指定文件夹（软删除）

**注意**: 文件夹下存在文档或子文件夹时无法删除

---

### 1.5 获取文件夹树

**接口**: `GET /api/lib/folders/tree`

**描述**: 获取完整的文件夹树形结构

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 0,
    "name": "文档库",
    "type": "root",
    "children": [
      {
        "id": 1,
        "name": "合同文档",
        "type": "folder",
        "path": "/合同文档",
        "documentCount": 5,
        "children": [
          {
            "id": 2,
            "name": "2024年",
            "type": "folder",
            "path": "/合同文档/2024年",
            "documentCount": 3
          }
        ]
      }
    ]
  }
}
```

---

### 1.6 移动文件夹

**接口**: `PUT /api/lib/folders/{id}/move`

**描述**: 将文件夹移动到新的父文件夹下

**请求参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| newParentId | Long | 新父文件夹ID |

---

## 2. 文档管理 API

### 2.1 上传文档

**接口**: `POST /api/lib/documents/upload`

**描述**: 上传文档文件

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 文档文件 |
| folderId | Long | 否 | 文件夹ID |
| documentName | String | 否 | 文档名称，默认使用文件名 |
| description | String | 否 | 描述 |
| tags | String | 否 | 标签，逗号分隔 |
| isPublic | Boolean | 否 | 是否公开，默认false |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "采购合同",
    "documentCode": "DOC20260309103000ABCD1234",
    "folderId": 1,
    "folderName": "合同文档",
    "documentType": "WORD",
    "fileName": "采购合同.docx",
    "fileSize": 102400,
    "fileExtension": "docx",
    "currentVersion": 1,
    "isPublic": false,
    "isLocked": false,
    "downloadCount": 0,
    "viewCount": 0,
    "status": "ACTIVE",
    "createTime": "2026-03-09T10:30:00",
    "isFavorited": false
  }
}
```

---

### 2.2 获取文档详情

**接口**: `GET /api/lib/documents/{id}`

**描述**: 根据ID获取文档详细信息

---

### 2.3 更新文档

**接口**: `PUT /api/lib/documents/{id}`

**描述**: 更新文档信息

**请求体**:
```json
{
  "documentName": "采购合同v2",
  "description": "更新后的采购合同",
  "tags": "采购,合同,2024",
  "isPublic": true
}
```

---

### 2.4 删除文档

**接口**: `DELETE /api/lib/documents/{id}`

**描述**: 删除指定文档（软删除）

---

### 2.5 获取文档列表

**接口**: `GET /api/lib/documents`

**描述**: 分页查询文档列表

**请求参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| folderId | Long | - | 文件夹ID |
| documentType | String | - | 文档类型: WORD/EXCEL/PDF/OTHER |
| status | String | - | 状态 |
| keyword | String | - | 搜索关键词 |
| isPublic | Boolean | - | 是否公开 |
| page | Integer | 1 | 页码 |
| size | Integer | 10 | 每页数量 |
| sortBy | String | createTime | 排序字段 |
| sortOrder | String | desc | 排序方向: asc/desc |

---

### 2.6 搜索文档

**接口**: `GET /api/lib/documents/search`

**描述**: 根据关键词搜索文档

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 是 | 搜索关键词 |
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

---

### 2.7 下载文档

**接口**: `GET /api/lib/documents/{id}/download`

**描述**: 下载指定文档

**响应**: 文件流

---

### 2.8 锁定/解锁文档

**锁定**: `PUT /api/lib/documents/{id}/lock`

**解锁**: `PUT /api/lib/documents/{id}/unlock`

**描述**: 锁定文档防止他人编辑，只有锁定者可以解锁

---

### 2.9 移动文档

**接口**: `PUT /api/lib/documents/{id}/move`

**描述**: 将文档移动到其他文件夹

**请求参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| targetFolderId | Long | 目标文件夹ID |

---

### 2.10 复制文档

**接口**: `POST /api/lib/documents/{id}/copy`

**描述**: 复制文档到其他文件夹

**请求参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| targetFolderId | Long | 目标文件夹ID |

---

## 3. 版本管理 API

### 3.1 上传新版本

**接口**: `POST /api/lib/versions/upload`

**描述**: 上传文档的新版本文件

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| documentId | Long | 是 | 文档ID |
| file | File | 是 | 新版本文件 |
| changeSummary | String | 否 | 变更说明 |
| isMajor | Boolean | 否 | 是否主版本，默认false |

---

### 3.2 获取版本列表

**接口**: `GET /api/lib/versions/document/{documentId}`

**描述**: 获取指定文档的所有版本

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "versions": [
      {
        "id": 3,
        "documentId": 1,
        "versionNumber": 3,
        "versionName": "v3",
        "fileName": "采购合同v3.docx",
        "fileSize": 102400,
        "changeSummary": "更新付款条款",
        "changeType": "UPDATE",
        "isMajor": false,
        "createTime": "2026-03-09T14:00:00",
        "createUserId": 1
      },
      {
        "id": 2,
        "documentId": 1,
        "versionNumber": 2,
        "versionName": "v2",
        "fileName": "采购合同v2.docx",
        "fileSize": 102000,
        "changeSummary": "修改交货日期",
        "changeType": "UPDATE",
        "isMajor": false,
        "createTime": "2026-03-09T12:00:00"
      },
      {
        "id": 1,
        "documentId": 1,
        "versionNumber": 1,
        "versionName": "v1",
        "fileName": "采购合同.docx",
        "fileSize": 100000,
        "changeSummary": "初始版本",
        "changeType": "CREATE",
        "isMajor": true,
        "createTime": "2026-03-09T10:30:00"
      }
    ]
  }
}
```

---

### 3.3 恢复版本

**接口**: `POST /api/lib/versions/document/{documentId}/restore/{versionNumber}`

**描述**: 将文档恢复到指定版本

---

## 4. 分享管理 API

### 4.1 创建分享链接

**接口**: `POST /api/lib/share`

**描述**: 创建文档分享链接

**请求体**:
```json
{
  "documentId": 1,
  "sharePassword": "123456",
  "permissionType": "READ",
  "expireTime": "2026-03-16T10:30:00",
  "maxAccessCount": 100
}
```

**请求参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| documentId | Long | 是 | 文档ID |
| sharePassword | String | 否 | 分享密码，可选 |
| permissionType | String | 否 | 权限类型: READ/DOWNLOAD/EDIT，默认READ |
| expireTime | DateTime | 否 | 过期时间，null表示永久有效 |
| maxAccessCount | Integer | 否 | 最大访问次数，0表示不限制 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentId": 1,
    "documentName": "采购合同",
    "shareCode": "ABC123DEF456",
    "shareUrl": "/api/lib/share/ABC123DEF456",
    "sharePassword": "123456",
    "permissionType": "READ",
    "expireTime": "2026-03-16T10:30:00",
    "maxAccessCount": 100,
    "accessCount": 0,
    "isEnabled": true,
    "isExpired": false,
    "createTime": "2026-03-09T10:30:00"
  }
}
```

---

### 4.2 访问分享文档

**接口**: `GET /api/lib/share/{shareCode}/access`

**描述**: 通过分享链接访问文档

**请求参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| shareCode | String | 分享码 |
| password | String | 分享密码（如有） |

---

### 4.3 下载分享文档

**接口**: `GET /api/lib/share/{shareCode}/download`

**描述**: 通过分享链接下载文档

**注意**: 只有权限类型为 DOWNLOAD 或 EDIT 的分享链接才支持下载

---

### 4.4 禁用/启用分享链接

**禁用**: `PUT /api/lib/share/{id}/disable`

**启用**: `PUT /api/lib/share/{id}/enable`

---

## 5. 收藏管理 API

### 5.1 收藏文档

**接口**: `POST /api/lib/favorites/{documentId}`

**描述**: 将文档添加到收藏

**请求参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| folderName | String | 收藏夹名称，可选 |

---

### 5.2 取消收藏

**接口**: `DELETE /api/lib/favorites/{documentId}`

---

### 5.3 获取我的收藏

**接口**: `GET /api/lib/favorites`

**请求参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | Integer | 1 | 页码 |
| size | Integer | 10 | 每页数量 |

---

### 5.4 获取收藏夹列表

**接口**: `GET /api/lib/favorites/folders`

**描述**: 获取当前用户的所有收藏夹名称

---

## 6. 权限管理 API

### 6.1 获取所有权限

**接口**: `GET /api/lib/permissions`

**描述**: 获取系统定义的所有权限列表

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "permissionName": "查看权限",
      "permissionCode": "DOC_READ",
      "permissionType": "READ",
      "description": "查看文档内容和信息",
      "sortOrder": 1
    },
    {
      "id": 2,
      "permissionName": "编辑权限",
      "permissionCode": "DOC_WRITE",
      "permissionType": "WRITE",
      "description": "编辑文档内容",
      "sortOrder": 2
    },
    {
      "id": 3,
      "permissionName": "删除权限",
      "permissionCode": "DOC_DELETE",
      "permissionType": "DELETE",
      "description": "删除文档",
      "sortOrder": 3
    },
    {
      "id": 4,
      "permissionName": "下载权限",
      "permissionCode": "DOC_DOWNLOAD",
      "permissionType": "DOWNLOAD",
      "description": "下载文档到本地",
      "sortOrder": 4
    },
    {
      "id": 5,
      "permissionName": "管理权限",
      "permissionCode": "DOC_ADMIN",
      "permissionType": "ADMIN",
      "description": "管理文档权限和设置",
      "sortOrder": 5
    },
    {
      "id": 6,
      "permissionName": "分享权限",
      "permissionCode": "DOC_SHARE",
      "permissionType": "SHARE",
      "description": "创建文档分享链接",
      "sortOrder": 6
    }
  ]
}
```

---

### 6.2 授予文件夹权限

**接口**: `POST /api/lib/permissions/folder/{folderId}`

**请求体**:
```json
{
  "permissionId": 1,
  "targetType": "USER",
  "targetId": 2,
  "isInherit": true
}
```

**请求参数说明**:

| 参数 | 类型 | 说明 |
|------|------|------|
| permissionId | Long | 权限ID |
| targetType | String | 目标类型: USER/ROLE/DEPARTMENT |
| targetId | Long | 目标ID |
| isInherit | Boolean | 是否继承到子文件夹 |

---

### 6.3 授予文档权限

**接口**: `POST /api/lib/permissions/document/{documentId}`

**请求体**: 同上

---

### 6.4 获取文件夹权限列表

**接口**: `GET /api/lib/permissions/folder/{folderId}`

---

### 6.5 获取文档权限列表

**接口**: `GET /api/lib/permissions/document/{documentId}`

---

## 7. 操作日志 API

### 7.1 获取文档操作日志

**接口**: `GET /api/lib/logs/document/{documentId}`

**请求参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | Integer | 1 | 页码 |
| size | Integer | 20 | 每页数量 |

---

### 7.2 获取我的操作日志

**接口**: `GET /api/lib/logs/my`

---

## 8. 操作类型说明

| 操作类型 | 说明 |
|---------|------|
| CREATE | 创建 |
| UPDATE | 更新 |
| DELETE | 删除 |
| UPLOAD | 上传 |
| DOWNLOAD | 下载 |
| VIEW | 查看 |
| MOVE | 移动 |
| COPY | 复制 |
| RENAME | 重命名 |
| LOCK | 锁定 |
| UNLOCK | 解锁 |
| RESTORE | 恢复版本 |
| SHARE | 分享 |
| FAVORITE | 收藏 |
| UNFAVORITE | 取消收藏 |

---

## 9. 文档类型说明

| 类型 | 说明 | 支持的扩展名 |
|------|------|-------------|
| WORD | Word文档 | .doc, .docx |
| EXCEL | Excel表格 | .xls, .xlsx |
| PDF | PDF文档 | .pdf |
| OTHER | 其他类型 | 其他 |

---

## 10. 注意事项

### 10.1 认证要求
- 所有接口（除分享访问接口外）均需要 JWT Token 认证
- Token 需要在请求头中携带：`Authorization: Bearer <token>`

### 10.2 文件上传
- 上传接口使用 `multipart/form-data` 格式
- 文件大小限制由服务器配置决定
- 支持的文件类型：Word (.doc, .docx)、Excel (.xls, .xlsx)、PDF (.pdf) 及其他

### 10.3 文件夹删除
- 文件夹下存在文档或子文件夹时无法删除
- 删除操作为软删除，数据不会真正删除

### 10.4 文档锁定
- 文档被锁定后，只有锁定者可以编辑和解锁
- 锁定状态会在一定时间后自动解除（可配置）

### 10.5 分享链接
- 分享链接可设置密码保护
- 分享链接可设置过期时间和访问次数限制
- 分享权限分为：仅查看(READ)、可下载(DOWNLOAD)、可编辑(EDIT)

### 10.6 权限继承
- 文件夹权限可设置是否继承到子文件夹
- 文档权限优先于文件夹权限

### 10.7 版本管理
- 每次上传新文件会自动创建新版本
- 版本号自动递增
- 可恢复到任意历史版本

---

## 11. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "code": 400,
  "message": "文件夹名称不能为空",
  "data": null
}
```

---

## 12. 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-09 | 初始版本，实现文档库基础功能 |
