# 文档库模块API文档

> 本文档供前端uni-app开发人员参考，包含文档库完整功能的API接口说明。

---

## 目录

- [一、通用说明](#一通用说明)
- [二、文档管理API](#二文档管理api)
- [三、文件夹管理API](#三文件夹管理api)
- [四、版本管理API](#四版本管理api)
- [五、权限管理API](#五权限管理api)
- [六、分享管理API](#六分享管理api)
- [七、收藏管理API](#七收藏管理api)
- [八、统计管理API](#八统计管理api)

---

## 一、通用说明

### 1.1 基础URL

```
http://your-domain/api
```

### 1.2 通用响应格式

所有接口统一返回以下格式：

```json
{
    "code": 200,
    "message": "success",
    "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功，其他表示失败 |
| message | String | 响应消息 |
| data | Object | 响应数据 |

### 1.3 认证说明

所有接口需要在请求头中携带Token：

```
Authorization: Bearer {token}
```

---

## 二、文档管理API

### 2.1 创建文档记录

**接口地址**：`POST /api/lib/documents`

**接口描述**：创建一条新的文档记录（不包含文件上传）

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentName | String | 是 | 文档名称（最长255字符） |
| documentCode | String | 否 | 文档编码 |
| folderId | Long | 否 | 所属文件夹ID |
| documentType | String | 是 | 文档类型 |
| fileName | String | 是 | 文件名 |
| filePath | String | 是 | 文件路径 |
| fileSize | Long | 否 | 文件大小（字节） |
| fileExtension | String | 否 | 文件扩展名 |
| mimeType | String | 否 | MIME类型 |
| description | String | 否 | 描述 |
| tags | String | 否 | 标签 |
| isPublic | Boolean | 否 | 是否公开，默认false |

**请求示例**：
```json
{
    "documentName": "破产清算方案",
    "documentCode": "DOC2024001",
    "folderId": 1,
    "documentType": "CONTRACT",
    "fileName": "破产清算方案.pdf",
    "filePath": "/upload/documents/2024/01/xxx.pdf",
    "fileSize": 1024000,
    "fileExtension": "pdf",
    "mimeType": "application/pdf",
    "description": "XX公司破产清算方案",
    "tags": "破产,清算",
    "isPublic": false
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "documentName": "破产清算方案",
        "documentCode": "DOC2024001",
        "folderId": 1,
        "folderName": "合同文件",
        "folderPath": "/合同文件",
        "documentType": "CONTRACT",
        "fileName": "破产清算方案.pdf",
        "filePath": "/upload/documents/2024/01/xxx.pdf",
        "fileSize": 1024000,
        "fileExtension": "pdf",
        "mimeType": "application/pdf",
        "currentVersion": 1,
        "description": "XX公司破产清算方案",
        "tags": "破产,清算",
        "isPublic": false,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 0,
        "viewCount": 0,
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "createUserName": "管理员",
        "isFavorited": false,
        "hasPermission": true
    }
}
```

---

### 2.2 上传文档

**接口地址**：`POST /api/lib/documents/upload`

**接口描述**：上传文档文件并创建记录

**请求头**：
```
Content-Type: multipart/form-data
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件 |
| folderId | Long | 否 | 所属文件夹ID |
| documentName | String | 否 | 文档名称 |
| description | String | 否 | 描述 |
| tags | String | 否 | 标签 |
| isPublic | Boolean | 否 | 是否公开，默认false |

**请求示例（FormData）**：
```
file: [File]
folderId: 1
documentName: 破产清算方案
description: XX公司破产清算方案
tags: 破产,清算
isPublic: false
```

**响应示例**：同2.1响应示例

---

### 2.3 查询文档列表

**接口地址**：`POST /api/lib/documents/list`

**接口描述**：分页查询文档列表，支持多条件筛选

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| folderId | Long | 否 | - | 文件夹ID |
| documentType | String | 否 | - | 文档类型 |
| status | String | 否 | - | 状态 |
| keyword | String | 否 | - | 关键词 |
| isPublic | Boolean | 否 | - | 是否公开 |
| createUserId | Long | 否 | - | 创建人ID |
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |
| sortBy | String | 否 | createTime | 排序字段 |
| sortOrder | String | 否 | desc | 排序方向(asc/desc) |

**请求示例**：
```json
{
    "folderId": 1,
    "documentType": "CONTRACT",
    "status": "ACTIVE",
    "keyword": "破产",
    "isPublic": false,
    "page": 1,
    "size": 10,
    "sortBy": "createTime",
    "sortOrder": "desc"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "page": 1,
        "size": 10,
        "totalPages": 10,
        "documents": [
            {
                "id": 1,
                "documentName": "破产清算方案",
                "documentCode": "DOC2024001",
                "folderId": 1,
                "folderName": "合同文件",
                "folderPath": "/合同文件",
                "documentType": "CONTRACT",
                "fileName": "破产清算方案.pdf",
                "filePath": "/upload/documents/2024/01/xxx.pdf",
                "fileSize": 1024000,
                "fileExtension": "pdf",
                "mimeType": "application/pdf",
                "currentVersion": 1,
                "description": "XX公司破产清算方案",
                "tags": "破产,清算",
                "isPublic": false,
                "isLocked": false,
                "lockedBy": null,
                "lockedByName": null,
                "lockedTime": null,
                "downloadCount": 50,
                "viewCount": 200,
                "status": "ACTIVE",
                "createTime": "2024-01-15T10:00:00",
                "updateTime": "2024-01-15T10:00:00",
                "createUserId": 1,
                "createUserName": "管理员",
                "isFavorited": false,
                "hasPermission": true
            }
        ]
    }
}
```

---

### 2.4 获取文档详情

**接口地址**：`GET /api/lib/documents/{id}`

**接口描述**：根据ID获取文档详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1
```

**响应示例**：同2.1响应示例

---

### 2.5 根据编码获取文档

**接口地址**：`GET /api/lib/documents/code/{code}`

**接口描述**：根据文档编码获取文档详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | 是 | 文档编码 |

**请求示例**：
```
GET /api/lib/documents/code/DOC2024001
```

**响应示例**：同2.1响应示例

---

### 2.6 更新文档

**接口地址**：`PUT /api/lib/documents/{id}`

**接口描述**：更新文档信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentName | String | 否 | 文档名称（最长255字符） |
| folderId | Long | 否 | 所属文件夹ID |
| description | String | 否 | 描述 |
| tags | String | 否 | 标签 |
| isPublic | Boolean | 否 | 是否公开 |
| status | String | 否 | 状态 |

**请求示例**：
```json
{
    "documentName": "破产清算方案（修订版）",
    "description": "更新后的描述",
    "tags": "破产,清算,修订"
}
```

**响应示例**：同2.1响应示例

---

### 2.7 删除文档

**接口地址**：`DELETE /api/lib/documents/{id}`

**接口描述**：删除指定文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
DELETE /api/lib/documents/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 2.8 搜索文档

**接口地址**：`GET /api/lib/documents/search`

**接口描述**：根据关键词搜索文档

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| keyword | String | 是 | - | 搜索关键词 |
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/documents/search?keyword=破产&page=1&size=10
```

**响应示例**：同2.3响应示例

---

### 2.9 获取文件夹下的文档

**接口地址**：`GET /api/lib/documents/folder/{folderId}`

**接口描述**：获取指定文件夹下的所有文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderId | Long | 是 | 文件夹ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/documents/folder/1?page=1&size=10
```

**响应示例**：同2.3响应示例

---

### 2.10 获取我的文档

**接口地址**：`GET /api/lib/documents/my`

**接口描述**：获取当前用户上传的所有文档

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/documents/my?page=1&size=10
```

**响应示例**：同2.3响应示例

---

### 2.11 下载文档

**接口地址**：`GET /api/lib/documents/{id}/download`

**接口描述**：下载指定文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/download
```

**响应**：文件流下载

---

### 2.12 预览文档

**接口地址**：`GET /api/lib/documents/{id}/preview`

**接口描述**：在线预览文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/preview
```

**响应**：文件流（用于在线预览）

---

### 2.13 获取Office预览配置

**接口地址**：`GET /api/lib/documents/{id}/office-config`

**接口描述**：获取OnlyOffice在线编辑器预览配置

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/office-config
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "documentType": "word",
        "document": {
            "fileType": "docx",
            "key": "unique-document-key",
            "title": "破产清算方案.docx",
            "url": "http://server-url/upload/documents/xxx.docx"
        },
        "editorConfig": {
            "mode": "edit",
            "lang": "zh-CN",
            "user": {
                "id": "1",
                "name": "管理员"
            }
        }
    }
}
```

---

### 2.14 锁定文档

**接口地址**：`POST /api/lib/documents/{id}/lock`

**接口描述**：锁定文档，防止他人编辑

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
POST /api/lib/documents/1/lock
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 2.15 解锁文档

**接口地址**：`POST /api/lib/documents/{id}/unlock`

**接口描述**：解锁文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求示例**：
```
POST /api/lib/documents/1/unlock
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 2.16 移动文档

**接口地址**：`POST /api/lib/documents/{id}/move`

**接口描述**：将文档移动到指定文件夹

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| targetFolderId | Long | 是 | 目标文件夹ID |

**请求示例**：
```
POST /api/lib/documents/1/move?targetFolderId=2
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 2.17 复制文档

**接口地址**：`POST /api/lib/documents/{id}/copy`

**接口描述**：复制文档到指定文件夹

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| targetFolderId | Long | 否 | 目标文件夹ID（不传则复制到当前文件夹） |

**请求示例**：
```
POST /api/lib/documents/1/copy?targetFolderId=2
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 2.18 获取最近上传的文档

**接口地址**：`GET /api/lib/documents/recent`

**接口描述**：获取最近上传的文档列表

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/documents/recent?page=1&size=10
```

**响应示例**：同2.3响应示例

---

### 2.19 获取热门文档

**接口地址**：`GET /api/lib/documents/popular`

**接口描述**：获取热门文档列表（按下载量/查看量排序）

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |
| timeRange | String | 否 | all | 时间范围(all/week/month) |

**请求示例**：
```
GET /api/lib/documents/popular?page=1&size=10&timeRange=week
```

**响应示例**：同2.3响应示例

---

## 三、文件夹管理API

### 3.1 创建文件夹

**接口地址**：`POST /api/lib/folders`

**接口描述**：创建新文件夹

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderName | String | 是 | 文件夹名称（最长100字符） |
| parentId | Long | 否 | 父文件夹ID（不传则为根目录） |
| description | String | 否 | 描述 |
| icon | String | 否 | 图标 |
| color | String | 否 | 颜色 |
| isPublic | Boolean | 否 | 是否公开，默认false |
| sortOrder | Integer | 否 | 排序号，默认0 |

**请求示例**：
```json
{
    "folderName": "合同文件",
    "parentId": null,
    "description": "存放合同相关文档",
    "icon": "folder",
    "color": "#1890ff",
    "isPublic": false,
    "sortOrder": 1
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "folderName": "合同文件",
        "folderPath": "/合同文件",
        "parentId": null,
        "folderLevel": 1,
        "sortOrder": 1,
        "description": "存放合同相关文档",
        "icon": "folder",
        "color": "#1890ff",
        "isPublic": false,
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "updateTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "createUserName": "管理员",
        "documentCount": 0,
        "subFolderCount": 0,
        "children": null,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null
    }
}
```

---

### 3.2 获取文件夹详情

**接口地址**：`GET /api/lib/folders/{id}`

**接口描述**：根据ID获取文件夹详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求示例**：
```
GET /api/lib/folders/1
```

**响应示例**：同3.1响应示例

---

### 3.3 更新文件夹

**接口地址**：`PUT /api/lib/folders/{id}`

**接口描述**：更新文件夹信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderName | String | 否 | 文件夹名称（最长100字符） |
| description | String | 否 | 描述 |
| icon | String | 否 | 图标 |
| color | String | 否 | 颜色 |
| isPublic | Boolean | 否 | 是否公开 |
| sortOrder | Integer | 否 | 排序号 |
| parentId | Long | 否 | 父文件夹ID |

**请求示例**：
```json
{
    "folderName": "合同文件（更新）",
    "description": "更新后的描述"
}
```

**响应示例**：同3.1响应示例

---

### 3.4 删除文件夹

**接口地址**：`DELETE /api/lib/folders/{id}`

**接口描述**：删除指定文件夹（需确保文件夹为空）

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求示例**：
```
DELETE /api/lib/folders/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 3.5 获取文件夹树

**接口地址**：`GET /api/lib/folders/tree`

**接口描述**：获取完整的文件夹树形结构

**请求示例**：
```
GET /api/lib/folders/tree
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "根目录",
        "type": "folder",
        "parentId": null,
        "path": "/根目录",
        "folderLevel": 1,
        "sortOrder": 1,
        "icon": "folder",
        "color": "#1890ff",
        "documentCount": 5,
        "createTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "createUserName": "管理员",
        "children": [
            {
                "id": 2,
                "name": "合同文件",
                "type": "folder",
                "parentId": 1,
                "path": "/根目录/合同文件",
                "folderLevel": 2,
                "sortOrder": 1,
                "icon": "folder",
                "color": "#52c41a",
                "documentCount": 3,
                "createTime": "2024-01-15T10:00:00",
                "createUserId": 1,
                "createUserName": "管理员",
                "children": []
            }
        ]
    }
}
```

---

### 3.6 获取子文件夹列表

**接口地址**：`GET /api/lib/folders/{id}/children`

**接口描述**：获取指定文件夹的直接子文件夹

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 父文件夹ID |

**请求示例**：
```
GET /api/lib/folders/1/children
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 2,
            "folderName": "合同文件",
            "folderPath": "/根目录/合同文件",
            "parentId": 1,
            "folderLevel": 2,
            "sortOrder": 1,
            "description": "存放合同相关文档",
            "icon": "folder",
            "color": "#52c41a",
            "isPublic": false,
            "status": "ACTIVE",
            "createTime": "2024-01-15T10:00:00",
            "updateTime": "2024-01-15T10:00:00",
            "createUserId": 1,
            "createUserName": "管理员",
            "documentCount": 3,
            "subFolderCount": 0,
            "children": null,
            "isLocked": false,
            "lockedBy": null,
            "lockedByName": null,
            "lockedTime": null
        }
    ]
}
```

---

### 3.7 获取根文件夹列表

**接口地址**：`GET /api/lib/folders/root`

**接口描述**：获取根目录下的所有文件夹

**请求示例**：
```
GET /api/lib/folders/root
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 5,
        "list": [
            {
                "id": 1,
                "folderName": "合同文件",
                "folderPath": "/合同文件",
                "parentId": null,
                "folderLevel": 1,
                "sortOrder": 1,
                "documentCount": 10,
                "subFolderCount": 2
            }
        ]
    }
}
```

---

### 3.8 移动文件夹

**接口地址**：`POST /api/lib/folders/{id}/move`

**接口描述**：将文件夹移动到指定父文件夹下

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| targetFolderId | Long | 否 | 目标父文件夹ID（不传则移动到根目录） |

**请求示例**：
```
POST /api/lib/folders/2/move?targetFolderId=3
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 3.9 获取文件夹路径

**接口地址**：`GET /api/lib/folders/{id}/path`

**接口描述**：获取从根目录到当前文件夹的完整路径（面包屑导航）

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求示例**：
```
GET /api/lib/folders/5/path
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "name": "根目录",
            "type": "folder",
            "parentId": null,
            "path": "/根目录",
            "folderLevel": 1
        },
        {
            "id": 2,
            "name": "合同文件",
            "type": "folder",
            "parentId": 1,
            "path": "/根目录/合同文件",
            "folderLevel": 2
        },
        {
            "id": 5,
            "name": "2024年合同",
            "type": "folder",
            "parentId": 2,
            "path": "/根目录/合同文件/2024年合同",
            "folderLevel": 3
        }
    ]
}
```

---

### 3.10 获取所有子孙文件夹ID

**接口地址**：`GET /api/lib/folders/{id}/descendants`

**接口描述**：获取指定文件夹下所有子孙文件夹的ID列表

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求示例**：
```
GET /api/lib/folders/1/descendants
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [2, 3, 4, 5, 6]
}
```

---

### 3.11 按层级获取文件夹

**接口地址**：`GET /api/lib/folders/level/{level}`

**接口描述**：获取指定层级的所有文件夹

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| level | Integer | 是 | 层级（1为根目录） |

**请求示例**：
```
GET /api/lib/folders/level/2
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 2,
            "folderName": "合同文件",
            "folderPath": "/根目录/合同文件",
            "parentId": 1,
            "folderLevel": 2,
            "sortOrder": 1,
            "documentCount": 10,
            "subFolderCount": 2
        }
    ]
}
```

---

### 3.12 更新文件夹排序

**接口地址**：`PUT /api/lib/folders/{id}/sort`

**接口描述**：更新文件夹的排序号

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sortOrder | Integer | 是 | 排序号 |

**请求示例**：
```
PUT /api/lib/folders/1/sort?sortOrder=5
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

## 四、版本管理API

### 4.1 上传新版本

**接口地址**：`POST /api/lib/documents/{documentId}/versions`

**接口描述**：为文档上传新版本

**请求头**：
```
Content-Type: multipart/form-data
```

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件 |
| changeSummary | String | 否 | 变更说明 |
| isMajor | Boolean | 否 | 是否大版本更新，默认false |

**请求示例（FormData）**：
```
file: [File]
changeSummary: 修订了第三章内容
isMajor: false
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 101,
        "documentId": 1,
        "versionNumber": 2,
        "versionName": "v1.1",
        "fileName": "破产清算方案_v1.1.pdf",
        "filePath": "/upload/documents/2024/01/xxx_v1.1.pdf",
        "fileSize": 1025000,
        "changeSummary": "修订了第三章内容",
        "changeType": "MINOR",
        "isMajor": false,
        "status": "ACTIVE",
        "createTime": "2024-01-16T10:00:00",
        "createUserId": 1,
        "createUserName": "管理员"
    }
}
```

---

### 4.2 获取文档版本列表

**接口地址**：`GET /api/lib/documents/{documentId}/versions`

**接口描述**：获取文档的所有历史版本

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/versions
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 3,
        "versions": [
            {
                "id": 103,
                "documentId": 1,
                "versionNumber": 3,
                "versionName": "v2.0",
                "fileName": "破产清算方案_v2.0.pdf",
                "filePath": "/upload/documents/2024/01/xxx_v2.0.pdf",
                "fileSize": 1030000,
                "changeSummary": "重大更新",
                "changeType": "MAJOR",
                "isMajor": true,
                "status": "ACTIVE",
                "createTime": "2024-01-17T10:00:00",
                "createUserId": 1,
                "createUserName": "管理员"
            },
            {
                "id": 102,
                "documentId": 1,
                "versionNumber": 2,
                "versionName": "v1.1",
                "fileName": "破产清算方案_v1.1.pdf",
                "filePath": "/upload/documents/2024/01/xxx_v1.1.pdf",
                "fileSize": 1025000,
                "changeSummary": "修订了第三章内容",
                "changeType": "MINOR",
                "isMajor": false,
                "status": "ACTIVE",
                "createTime": "2024-01-16T10:00:00",
                "createUserId": 1,
                "createUserName": "管理员"
            },
            {
                "id": 101,
                "documentId": 1,
                "versionNumber": 1,
                "versionName": "v1.0",
                "fileName": "破产清算方案.pdf",
                "filePath": "/upload/documents/2024/01/xxx.pdf",
                "fileSize": 1024000,
                "changeSummary": "初始版本",
                "changeType": "MAJOR",
                "isMajor": true,
                "status": "ACTIVE",
                "createTime": "2024-01-15T10:00:00",
                "createUserId": 1,
                "createUserName": "管理员"
            }
        ]
    }
}
```

---

### 4.3 获取指定版本

**接口地址**：`GET /api/lib/documents/{documentId}/versions/{versionNumber}`

**接口描述**：获取文档的指定版本信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |
| versionNumber | Integer | 是 | 版本号 |

**请求示例**：
```
GET /api/lib/documents/1/versions/2
```

**响应示例**：同4.1响应示例

---

### 4.4 获取最新版本

**接口地址**：`GET /api/lib/documents/{documentId}/versions/latest`

**接口描述**：获取文档的最新版本信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/versions/latest
```

**响应示例**：同4.1响应示例

---

### 4.5 恢复到指定版本

**接口地址**：`POST /api/lib/documents/{documentId}/versions/{versionNumber}/restore`

**接口描述**：将文档恢复到指定历史版本

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |
| versionNumber | Integer | 是 | 版本号 |

**请求示例**：
```
POST /api/lib/documents/1/versions/2/restore
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 4.6 删除版本

**接口地址**：`DELETE /api/lib/versions/{versionId}`

**接口描述**：删除指定的文档版本

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| versionId | Long | 是 | 版本ID |

**请求示例**：
```
DELETE /api/lib/versions/101
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 4.7 获取下一个版本号

**接口地址**：`GET /api/lib/documents/{documentId}/versions/next-number`

**接口描述**：获取文档的下一个版本号

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/versions/next-number
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": 4
}
```

---

### 4.8 获取版本总数

**接口地址**：`GET /api/lib/documents/{documentId}/versions/count`

**接口描述**：获取文档的版本总数

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/versions/count
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": 3
}
```

---

## 五、权限管理API

### 5.1 获取所有权限定义

**接口地址**：`GET /api/lib/permissions`

**接口描述**：获取系统中所有权限定义列表

**请求示例**：
```
GET /api/lib/permissions
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "permissionName": "查看",
            "permissionCode": "READ",
            "permissionType": "DOCUMENT",
            "description": "查看文档权限",
            "sortOrder": 1,
            "status": "ACTIVE",
            "createTime": "2024-01-01T00:00:00"
        },
        {
            "id": 2,
            "permissionName": "编辑",
            "permissionCode": "WRITE",
            "permissionType": "DOCUMENT",
            "description": "编辑文档权限",
            "sortOrder": 2,
            "status": "ACTIVE",
            "createTime": "2024-01-01T00:00:00"
        },
        {
            "id": 3,
            "permissionName": "删除",
            "permissionCode": "DELETE",
            "permissionType": "DOCUMENT",
            "description": "删除文档权限",
            "sortOrder": 3,
            "status": "ACTIVE",
            "createTime": "2024-01-01T00:00:00"
        }
    ]
}
```

---

### 5.2 根据ID获取权限定义

**接口地址**：`GET /api/lib/permissions/{id}`

**接口描述**：根据ID获取权限定义详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 权限ID |

**请求示例**：
```
GET /api/lib/permissions/1
```

**响应示例**：同5.1响应示例中的单个对象

---

### 5.3 根据编码获取权限定义

**接口地址**：`GET /api/lib/permissions/code/{code}`

**接口描述**：根据权限编码获取权限定义

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | 是 | 权限编码 |

**请求示例**：
```
GET /api/lib/permissions/code/READ
```

**响应示例**：同5.1响应示例中的单个对象

---

### 5.4 授予文件夹权限

**接口地址**：`POST /api/lib/folders/{folderId}/permissions`

**接口描述**：为用户或角色授予文件夹权限

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderId | Long | 是 | 文件夹ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| permissionId | Long | 是 | 权限ID |
| targetType | String | 是 | 目标类型(USER/ROLE) |
| targetId | Long | 是 | 目标ID（用户ID或角色ID） |
| isInherit | Boolean | 否 | 是否继承到子文件夹，默认true |

**请求示例**：
```json
{
    "permissionId": 1,
    "targetType": "USER",
    "targetId": 10,
    "isInherit": true
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 5.5 撤销文件夹权限

**接口地址**：`DELETE /api/lib/folders/{folderId}/permissions/{permissionId}`

**接口描述**：撤销用户或角色的文件夹权限

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderId | Long | 是 | 文件夹ID |
| permissionId | Long | 是 | 权限ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| targetType | String | 是 | 目标类型(USER/ROLE) |
| targetId | Long | 是 | 目标ID |

**请求示例**：
```
DELETE /api/lib/folders/1/permissions/1?targetType=USER&targetId=10
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 5.6 获取文件夹权限列表

**接口地址**：`GET /api/lib/folders/{folderId}/permissions`

**接口描述**：获取文件夹的所有权限配置

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderId | Long | 是 | 文件夹ID |

**请求示例**：
```
GET /api/lib/folders/1/permissions
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "permissionId": 1,
            "permissionName": "查看",
            "permissionCode": "READ",
            "targetType": "USER",
            "targetId": 10,
            "targetName": "张三",
            "isInherit": true,
            "createTime": "2024-01-15T10:00:00"
        }
    ]
}
```

---

### 5.7 授予文档权限

**接口地址**：`POST /api/lib/documents/{documentId}/permissions`

**接口描述**：为用户或角色授予文档权限

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求参数**：同5.4

**请求示例**：
```json
{
    "permissionId": 1,
    "targetType": "USER",
    "targetId": 10,
    "isInherit": false
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 5.8 撤销文档权限

**接口地址**：`DELETE /api/lib/documents/{documentId}/permissions/{permissionId}`

**接口描述**：撤销用户或角色的文档权限

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |
| permissionId | Long | 是 | 权限ID |

**请求参数**：同5.5

**请求示例**：
```
DELETE /api/lib/documents/1/permissions/1?targetType=USER&targetId=10
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 5.9 获取文档权限列表

**接口地址**：`GET /api/lib/documents/{documentId}/permissions`

**接口描述**：获取文档的所有权限配置

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/documents/1/permissions
```

**响应示例**：同5.6

---

### 5.10 获取用户可访问的文件夹ID列表

**接口地址**：`GET /api/lib/permissions/accessible-folders`

**接口描述**：获取当前用户有指定权限的文件夹ID列表

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| permissionType | String | 是 | 权限类型(READ/WRITE/DELETE) |

**请求示例**：
```
GET /api/lib/permissions/accessible-folders?permissionType=READ
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [1, 2, 3, 5, 8]
}
```

---

### 5.11 获取用户可访问的文档ID列表

**接口地址**：`GET /api/lib/permissions/accessible-documents`

**接口描述**：获取当前用户有指定权限的文档ID列表

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| permissionType | String | 是 | 权限类型(READ/WRITE/DELETE) |

**请求示例**：
```
GET /api/lib/permissions/accessible-documents?permissionType=READ
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [1, 2, 3, 10, 15]
}
```

---

## 六、分享管理API

### 6.1 创建分享链接

**接口地址**：`POST /api/lib/shares`

**接口描述**：为文档创建分享链接

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |
| sharePassword | String | 否 | 分享密码 |
| permissionType | String | 否 | 权限类型，默认READ |
| expireTime | DateTime | 否 | 过期时间 |
| maxAccessCount | Integer | 否 | 最大访问次数，默认0（无限制） |

**请求示例**：
```json
{
    "documentId": 1,
    "sharePassword": "123456",
    "permissionType": "READ",
    "expireTime": "2024-02-15T00:00:00",
    "maxAccessCount": 100
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "documentId": 1,
        "documentName": "破产清算方案",
        "shareCode": "AbCdEfGh",
        "shareUrl": "http://your-domain/share/AbCdEfGh",
        "sharePassword": "123456",
        "permissionType": "READ",
        "expireTime": "2024-02-15T00:00:00",
        "maxAccessCount": 100,
        "accessCount": 0,
        "isEnabled": true,
        "isExpired": false,
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00",
        "createUserId": 1,
        "createUserName": "管理员"
    }
}
```

---

### 6.2 根据分享码获取分享信息

**接口地址**：`GET /api/lib/shares/code/{shareCode}`

**接口描述**：根据分享码获取分享信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shareCode | String | 是 | 分享码 |

**请求示例**：
```
GET /api/lib/shares/code/AbCdEfGh
```

**响应示例**：同6.1响应示例

---

### 6.3 根据ID获取分享信息

**接口地址**：`GET /api/lib/shares/{id}`

**接口描述**：根据ID获取分享信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 分享ID |

**请求示例**：
```
GET /api/lib/shares/1
```

**响应示例**：同6.1响应示例

---

### 6.4 访问分享文档

**接口地址**：`GET /api/lib/shares/{shareCode}/access`

**接口描述**：通过分享链接访问文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shareCode | String | 是 | 分享码 |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| password | String | 否 | 分享密码（如需要） |

**请求示例**：
```
GET /api/lib/shares/AbCdEfGh/access?password=123456
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "documentName": "破产清算方案",
        "documentCode": "DOC2024001",
        "folderId": 1,
        "folderName": "合同文件",
        "folderPath": "/合同文件",
        "documentType": "CONTRACT",
        "fileName": "破产清算方案.pdf",
        "filePath": "/upload/documents/2024/01/xxx.pdf",
        "fileSize": 1024000,
        "fileExtension": "pdf",
        "mimeType": "application/pdf",
        "currentVersion": 1,
        "description": "XX公司破产清算方案",
        "tags": "破产,清算",
        "isPublic": false,
        "isLocked": false,
        "downloadCount": 50,
        "viewCount": 200,
        "status": "ACTIVE",
        "createTime": "2024-01-15T10:00:00"
    }
}
```

---

### 6.5 下载分享文档

**接口地址**：`GET /api/lib/shares/{shareCode}/download`

**接口描述**：通过分享链接下载文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shareCode | String | 是 | 分享码 |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| password | String | 否 | 分享密码（如需要） |

**请求示例**：
```
GET /api/lib/shares/AbCdEfGh/download?password=123456
```

**响应**：文件流下载

---

### 6.6 删除分享链接

**接口地址**：`DELETE /api/lib/shares/{id}`

**接口描述**：删除分享链接

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 分享ID |

**请求示例**：
```
DELETE /api/lib/shares/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 6.7 禁用分享链接

**接口地址**：`POST /api/lib/shares/{id}/disable`

**接口描述**：禁用分享链接

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 分享ID |

**请求示例**：
```
POST /api/lib/shares/1/disable
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 6.8 启用分享链接

**接口地址**：`POST /api/lib/shares/{id}/enable`

**接口描述**：启用已禁用的分享链接

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 分享ID |

**请求示例**：
```
POST /api/lib/shares/1/enable
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 6.9 验证分享链接是否有效

**接口地址**：`GET /api/lib/shares/{shareCode}/valid`

**接口描述**：验证分享链接是否有效（未过期、未禁用）

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shareCode | String | 是 | 分享码 |

**请求示例**：
```
GET /api/lib/shares/AbCdEfGh/valid
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": true
}
```

---

### 6.10 验证分享密码

**接口地址**：`POST /api/lib/shares/{shareCode}/check-password`

**接口描述**：验证分享密码是否正确

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shareCode | String | 是 | 分享码 |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| password | String | 否 | 分享密码 |

**请求示例**：
```
POST /api/lib/shares/AbCdEfGh/check-password?password=123456
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": true
}
```

---

## 七、收藏管理API

### 7.1 添加收藏

**接口地址**：`POST /api/lib/favorites/{documentId}`

**接口描述**：将文档添加到收藏

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderName | String | 否 | 收藏夹名称 |

**请求示例**：
```
POST /api/lib/favorites/1?folderName=常用文档
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "documentId": 1,
        "documentName": "破产清算方案",
        "documentType": "CONTRACT",
        "fileName": "破产清算方案.pdf",
        "fileSize": 1024000,
        "folderName": "常用文档",
        "sortOrder": 1,
        "createTime": "2024-01-15T10:00:00",
        "documentCreateTime": "2024-01-14T09:00:00"
    }
}
```

---

### 7.2 取消收藏

**接口地址**：`DELETE /api/lib/favorites/{documentId}`

**接口描述**：取消文档收藏

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
DELETE /api/lib/favorites/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

### 7.3 获取我的收藏列表

**接口地址**：`GET /api/lib/favorites`

**接口描述**：获取当前用户的所有收藏

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/favorites?page=1&size=10
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 25,
        "favorites": [
            {
                "id": 1,
                "documentId": 1,
                "documentName": "破产清算方案",
                "documentType": "CONTRACT",
                "fileName": "破产清算方案.pdf",
                "fileSize": 1024000,
                "folderName": "常用文档",
                "sortOrder": 1,
                "createTime": "2024-01-15T10:00:00",
                "documentCreateTime": "2024-01-14T09:00:00"
            }
        ]
    }
}
```

---

### 7.4 获取收藏夹列表

**接口地址**：`GET /api/lib/favorites/folders`

**接口描述**：获取当前用户的所有收藏夹名称

**请求示例**：
```
GET /api/lib/favorites/folders
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": ["常用文档", "重要文件", "待处理"]
}
```

---

### 7.5 获取收藏夹内的文档

**接口地址**：`GET /api/lib/favorites/folder/{folderName}`

**接口描述**：获取指定收藏夹内的所有文档

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderName | String | 是 | 收藏夹名称 |

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |

**请求示例**：
```
GET /api/lib/favorites/folder/常用文档?page=1&size=10
```

**响应示例**：同7.3响应示例

---

### 7.6 检查是否已收藏

**接口地址**：`GET /api/lib/favorites/{documentId}/check`

**接口描述**：检查文档是否已被当前用户收藏

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求示例**：
```
GET /api/lib/favorites/1/check
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": true
}
```

---

### 7.7 移动收藏到其他收藏夹

**接口地址**：`POST /api/lib/favorites/{documentId}/move`

**接口描述**：将收藏的文档移动到其他收藏夹

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| documentId | Long | 是 | 文档ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderName | String | 是 | 目标收藏夹名称 |

**请求示例**：
```
POST /api/lib/favorites/1/move?folderName=重要文件
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": null
}
```

---

## 八、统计管理API

### 8.1 获取仪表盘统计数据

**接口地址**：`GET /api/lib/statistics/dashboard`

**接口描述**：获取文档库仪表盘统计数据

**请求示例**：
```
GET /api/lib/statistics/dashboard
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "totalDocuments": 1250,
        "totalSize": 53687091200,
        "weeklyUploads": 45,
        "totalViews": 15680,
        "typeDistribution": {
            "CONTRACT": 350,
            "REPORT": 280,
            "LEGAL": 420,
            "OTHER": 200
        },
        "sizeDistribution": {
            "0-1MB": 800,
            "1-10MB": 350,
            "10-50MB": 80,
            "50MB+": 20
        },
        "monthlyTrend": [
            {
                "month": "2024-01",
                "uploads": 120,
                "views": 2500
            },
            {
                "month": "2024-02",
                "uploads": 95,
                "views": 2100
            },
            {
                "month": "2024-03",
                "uploads": 150,
                "views": 3200
            }
        ]
    }
}
```

---

## 九、数据字典

### 9.1 文档状态(status)

| 值 | 说明 |
|----|------|
| ACTIVE | 正常 |
| ARCHIVED | 已归档 |
| DELETED | 已删除 |

### 9.2 文档类型(documentType)

| 值 | 说明 |
|----|------|
| CONTRACT | 合同文件 |
| REPORT | 报告文件 |
| LEGAL | 法律文件 |
| FINANCIAL | 财务文件 |
| OTHER | 其他文件 |

### 9.3 权限类型(permissionType)

| 值 | 说明 |
|----|------|
| READ | 查看权限 |
| WRITE | 编辑权限 |
| DELETE | 删除权限 |
| ADMIN | 管理权限 |

### 9.4 目标类型(targetType)

| 值 | 说明 |
|----|------|
| USER | 用户 |
| ROLE | 角色 |

### 9.5 变更类型(changeType)

| 值 | 说明 |
|----|------|
| MAJOR | 大版本更新 |
| MINOR | 小版本更新 |

### 9.6 时间范围(timeRange)

| 值 | 说明 |
|----|------|
| all | 全部时间 |
| week | 最近一周 |
| month | 最近一月 |

---

## 十、错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token失效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如名称重复） |
| 500 | 服务器内部错误 |

---

## 十一、注意事项

1. 所有接口需要在请求头中携带`Authorization: Bearer {token}`
2. 文件上传接口需要使用`multipart/form-data`格式
3. 日期时间格式为ISO 8601标准：`yyyy-MM-ddTHH:mm:ss`
4. 分页参数从1开始计数
5. 文件大小单位为字节（Byte）
6. 删除文件夹前需确保文件夹为空
7. 锁定文档后只有锁定者可以解锁
8. 分享链接过期后将无法访问
