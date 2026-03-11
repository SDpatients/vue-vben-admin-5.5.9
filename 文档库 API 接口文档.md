# 文档库 API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5779/api/v1`
- **认证方式**: JWT Token (通过请求头 `Authorization: Bearer {token}` 传递)
- **用户 ID**: 通过请求头 `X-User-Id` 传递，默认值为 1

---

## 1. 📊 仪表盘统计 API

### 1.1 获取仪表盘统计数据

**接口**: `GET /api/lib/statistics/dashboard`

**请求参数**: 无

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/statistics/dashboard" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalDocuments": 150,
    "totalSize": 104857600,
    "weeklyUploads": 12,
    "totalViews": 1250,
    "typeDistribution": {
      "WORD": 50,
      "EXCEL": 30,
      "PDF": 40,
      "OTHER": 30
    },
    "sizeDistribution": {
      "WORD": 20971520,
      "EXCEL": 31457280,
      "PDF": 41943040,
      "OTHER": 10485760
    },
    "monthlyTrend": [
      {
        "month": "2026-01",
        "uploads": 15,
        "views": 120
      },
      {
        "month": "2026-02",
        "uploads": 22,
        "views": 180
      },
      {
        "month": "2026-03",
        "uploads": 18,
        "views": 150
      }
    ]
  }
}
```

---

## 2. 📁 文件夹管理 API

### 2.1 创建文件夹

**接口**: `POST /api/lib/folders`

**请求参数**:
```json
{
  "folderName": "合同文件",
  "parentFolderId": 1,
  "description": "存放所有合同相关文档",
  "sortOrder": 1
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/folders" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "folderName": "合同文件",
    "parentFolderId": 1,
    "description": "存放所有合同相关文档",
    "sortOrder": 1
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "folderName": "合同文件",
    "folderPath": "/根文件夹/合同文件",
    "parentFolderId": 1,
    "description": "存放所有合同相关文档",
    "sortOrder": 1,
    "createTime": "2026-03-10T10:00:00",
    "createUserId": 10
  }
}
```

### 2.2 获取文件夹详情

**接口**: `GET /api/lib/folders/{id}`

**请求参数**: 
- `id` (路径参数): 文件夹 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/folders/5" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "folderName": "合同文件",
    "folderPath": "/根文件夹/合同文件",
    "parentFolderId": 1,
    "description": "存放所有合同相关文档",
    "sortOrder": 1,
    "documentCount": 10,
    "createTime": "2026-03-10T10:00:00",
    "updateTime": "2026-03-10T10:00:00"
  }
}
```

### 2.3 更新文件夹

**接口**: `PUT /api/lib/folders/{id}`

**请求参数**:
```json
{
  "folderName": "合同文件 (更新)",
  "description": "更新后的描述",
  "sortOrder": 2
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/api/lib/folders/5" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "folderName": "合同文件 (更新)",
    "description": "更新后的描述",
    "sortOrder": 2
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "folderName": "合同文件 (更新)",
    "folderPath": "/根文件夹/合同文件 (更新)",
    "parentFolderId": 1,
    "description": "更新后的描述",
    "sortOrder": 2,
    "updateTime": "2026-03-10T11:00:00",
    "updateUserId": 10
  }
}
```

### 2.4 删除文件夹

**接口**: `DELETE /api/lib/folders/{id}`

**请求参数**: 
- `id` (路径参数): 文件夹 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/folders/5" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 2.5 获取文件夹树

**接口**: `GET /api/lib/folders/tree`

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/folders/tree" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "根文件夹",
    "folderPath": "/根文件夹",
    "children": [
      {
        "id": 2,
        "folderName": "行政文件",
        "folderPath": "/根文件夹/行政文件",
        "children": []
      },
      {
        "id": 3,
        "folderName": "财务文件",
        "folderPath": "/根文件夹/财务文件",
        "children": [
          {
            "id": 4,
            "folderName": "发票",
            "folderPath": "/根文件夹/财务文件/发票",
            "children": []
          }
        ]
      }
    ]
  }
}
```

### 2.6 获取子文件夹列表

**接口**: `GET /api/lib/folders/{id}/children`

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/folders/1/children" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "folderName": "行政文件",
      "folderPath": "/根文件夹/行政文件",
      "parentFolderId": 1,
      "createTime": "2026-03-01T10:00:00"
    },
    {
      "id": 3,
      "folderName": "财务文件",
      "folderPath": "/根文件夹/财务文件",
      "parentFolderId": 1,
      "createTime": "2026-03-02T10:00:00"
    }
  ]
}
```

### 2.7 移动文件夹

**接口**: `POST /api/lib/folders/{id}/move`

**请求参数**:
- `targetFolderId` (查询参数): 目标文件夹 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/folders/2/move?targetFolderId=3" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 3. 📄 文档管理 API

### 3.1 上传文档

**接口**: `POST /api/lib/documents/upload`

**请求参数** (FormData):
- `file` (必填): 文件对象
- `folderId` (必填): 文件夹 ID
- `documentName` (可选): 文档名称
- `description` (可选): 描述
- `tags` (可选): 标签
- `isPublic` (可选): 是否公开

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/upload" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -F "file=@/path/to/document.doc" \
  -F "folderId=1" \
  -F "documentName=采购合同" \
  -F "description=2026 年采购合同" \
  -F "isPublic=true"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "采购合同",
    "documentCode": "DOC20260310100000ABCD1234",
    "folderId": 1,
    "documentType": "WORD",
    "fileName": "采购合同.doc",
    "filePath": "D:\\lawbackend2\\uploads\\documents\\folder_1\\20260310100000_采购合同.doc",
    "fileSize": 102400,
    "fileExtension": "doc",
    "mimeType": "application/msword",
    "currentVersion": 1,
    "description": "2026 年采购合同",
    "tags": null,
    "isPublic": true,
    "isLocked": false,
    "downloadCount": 0,
    "viewCount": 0,
    "createTime": "2026-03-10T10:00:00",
    "createUserId": 10,
    "hasPermission": true
  }
}
```

### 3.2 获取文档详情

**接口**: `GET /api/lib/documents/{id}`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "采购合同",
    "documentCode": "DOC20260310100000ABCD1234",
    "folderId": 1,
    "folderName": "合同文件",
    "folderPath": "/合同文件",
    "documentType": "WORD",
    "fileName": "采购合同.doc",
    "filePath": "D:\\lawbackend2\\uploads\\documents\\folder_1\\20260310100000_采购合同.doc",
    "fileSize": 102400,
    "fileExtension": "doc",
    "mimeType": "application/msword",
    "currentVersion": 1,
    "description": "2026 年采购合同",
    "tags": null,
    "isPublic": true,
    "isLocked": false,
    "downloadCount": 5,
    "viewCount": 20,
    "createTime": "2026-03-10T10:00:00",
    "updateTime": "2026-03-10T10:00:00",
    "createUserId": 10,
    "createUserName": "张三",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

### 3.3 查询文档列表

**接口**: `POST /api/lib/documents/list`

**请求参数**:
```json
{
  "folderId": 1,
  "page": 1,
  "size": 10
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/list" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "folderId": 1,
    "page": 1,
    "size": 10
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "size": 10,
    "totalPages": 3,
    "documents": [
      {
        "id": 1,
        "documentName": "采购合同",
        "documentCode": "DOC20260310100000ABCD1234",
        "folderId": 1,
        "documentType": "WORD",
        "fileName": "采购合同.doc",
        "fileSize": 102400,
        "isPublic": true,
        "isLocked": false,
        "viewCount": 20,
        "downloadCount": 5,
        "createTime": "2026-03-10T10:00:00",
        "hasPermission": true
      }
    ]
  }
}
```

### 3.4 搜索文档

**接口**: `GET /api/lib/documents/search`

**请求参数**:
- `keyword` (查询参数): 搜索关键词
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/search?keyword=合同&page=1&size=10" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "totalPages": 1,
    "documents": [
      {
        "id": 1,
        "documentName": "采购合同",
        "documentCode": "DOC20260310100000ABCD1234",
        "folderId": 1,
        "documentType": "WORD",
        "fileName": "采购合同.doc",
        "fileSize": 102400,
        "description": "2026 年采购合同",
        "viewCount": 20,
        "downloadCount": 5,
        "createTime": "2026-03-10T10:00:00",
        "hasPermission": true
      }
    ]
  }
}
```

### 3.5 获取文件夹下的文档

**接口**: `GET /api/lib/documents/folder/{folderId}`

**请求参数**:
- `folderId` (路径参数): 文件夹 ID
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/folder/1?page=1&size=10" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "page": 1,
    "size": 10,
    "totalPages": 2,
    "documents": [...]
  }
}
```

### 3.6 获取我的文档

**接口**: `GET /api/lib/documents/my`

**请求参数**:
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/my?page=1&size=10" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 8,
    "page": 1,
    "size": 10,
    "totalPages": 1,
    "documents": [...]
  }
}
```

### 3.7 更新文档

**接口**: `PUT /api/lib/documents/{id}`

**请求参数**:
```json
{
  "documentName": "采购合同 (更新版)",
  "description": "更新后的描述",
  "tags": "合同，采购，2026",
  "isPublic": true
}
```

**请求示例**:
```bash
curl -X PUT "http://localhost:5779/api/v1/api/lib/documents/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "documentName": "采购合同 (更新版)",
    "description": "更新后的描述",
    "tags": "合同，采购，2026",
    "isPublic": true
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "采购合同 (更新版)",
    "documentCode": "DOC20260310100000ABCD1234",
    "folderId": 1,
    "documentType": "WORD",
    "fileName": "采购合同.doc",
    "fileSize": 102400,
    "description": "更新后的描述",
    "tags": "合同，采购，2026",
    "isPublic": true,
    "updateTime": "2026-03-10T11:00:00",
    "updateUserId": 10,
    "hasPermission": true
  }
}
```

### 3.8 删除文档

**接口**: `DELETE /api/lib/documents/{id}`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/documents/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.9 下载文档

**接口**: `GET /api/lib/documents/{id}/download`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/download" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  --output 采购合同.doc
```

**响应**: 返回文件流

### 3.10 预览文档

**接口**: `GET /api/lib/documents/{id}/preview`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/preview" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应**: 返回文件流（inline 方式）

### 3.11 获取 Office 预览配置

**接口**: `GET /api/lib/documents/{id}/office-config`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/office-config" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "documentType": "word",
    "document": {
      "fileType": "doc",
      "key": "doc_1_1234567890",
      "title": "采购合同.doc",
      "url": "http://localhost:5779/api/v1/api/lib/documents/1/preview"
    },
    "editorConfig": {
      "mode": "view",
      "lang": "zh-CN",
      "user": {
        "id": "10",
        "name": "用户"
      }
    }
  }
}
```

### 3.12 锁定文档

**接口**: `POST /api/lib/documents/{id}/lock`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/lock" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.13 解锁文档

**接口**: `POST /api/lib/documents/{id}/unlock`

**请求参数**: 
- `id` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/unlock" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.14 移动文档

**接口**: `POST /api/lib/documents/{id}/move`

**请求参数**:
- `id` (路径参数): 文档 ID
- `targetFolderId` (查询参数): 目标文件夹 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/move?targetFolderId=2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.15 复制文档

**接口**: `POST /api/lib/documents/{id}/copy`

**请求参数**:
- `id` (路径参数): 文档 ID
- `targetFolderId` (查询参数，可选): 目标文件夹 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/copy?targetFolderId=2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 4. 📌 收藏管理 API

### 4.1 添加收藏

**接口**: `POST /api/lib/favorites/{documentId}`

**请求参数**:
- `documentId` (路径参数): 文档 ID
- `folderName` (查询参数，可选): 收藏夹名称

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/favorites/1?folderName=常用文档" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentId": 1,
    "documentName": "采购合同",
    "documentType": "WORD",
    "fileName": "采购合同.doc",
    "fileSize": 102400,
    "folderName": "常用文档",
    "sortOrder": 0,
    "createTime": "2026-03-10T10:00:00",
    "documentCreateTime": "2026-03-10T10:00:00"
  }
}
```

### 4.2 取消收藏

**接口**: `DELETE /api/lib/favorites/{documentId}`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/favorites/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 4.3 获取我的收藏列表

**接口**: `GET /api/lib/favorites`

**请求参数**:
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/favorites?page=1&size=10" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "totalPages": 1,
    "favorites": [
      {
        "id": 1,
        "documentId": 1,
        "documentName": "采购合同",
        "documentType": "WORD",
        "fileName": "采购合同.doc",
        "fileSize": 102400,
        "folderName": "常用文档",
        "sortOrder": 0,
        "createTime": "2026-03-10T10:00:00",
        "documentCreateTime": "2026-03-10T10:00:00"
      }
    ]
  }
}
```

### 4.4 获取收藏夹列表

**接口**: `GET /api/lib/favorites/folders`

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/favorites/folders" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "常用文档",
    "重要合同",
    "参考资料"
  ]
}
```

### 4.5 获取收藏夹内的文档

**接口**: `GET /api/lib/favorites/folder/{folderName}`

**请求参数**:
- `folderName` (路径参数): 收藏夹名称
- `page` (查询参数，默认 1): 页码
- `size` (查询参数，默认 10): 每页数量

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/favorites/folder/常用文档?page=1&size=10" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "page": 1,
    "size": 10,
    "totalPages": 1,
    "favorites": [...]
  }
}
```

### 4.6 检查是否已收藏

**接口**: `GET /api/lib/favorites/{documentId}/check`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/favorites/1/check" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

### 4.7 移动收藏到其他收藏夹

**接口**: `POST /api/lib/favorites/{documentId}/move`

**请求参数**:
- `documentId` (路径参数): 文档 ID
- `folderName` (查询参数): 新收藏夹名称

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/favorites/1/move?folderName=重要合同" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 5. 🔗 分享管理 API

### 5.1 创建分享链接

**接口**: `POST /api/lib/shares`

**请求参数**:
```json
{
  "documentId": 1,
  "permissionType": "READ",
  "expireTime": "2026-04-10T10:00:00",
  "maxAccessCount": 100,
  "isEnabled": true,
  "sharePassword": "123456"
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/shares" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "permissionType": "READ",
    "expireTime": "2026-04-10T10:00:00",
    "maxAccessCount": 100,
    "isEnabled": true,
    "sharePassword": "123456"
  }'
```

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
    "sharePassword": "123456",
    "permissionType": "READ",
    "expireTime": "2026-04-10T10:00:00",
    "maxAccessCount": 100,
    "accessCount": 0,
    "isEnabled": true,
    "createTime": "2026-03-10T10:00:00",
    "createUserId": 10
  }
}
```

### 5.2 根据分享码获取分享信息

**接口**: `GET /api/lib/shares/code/{shareCode}`

**请求参数**: 
- `shareCode` (路径参数): 分享码

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/shares/code/ABC123DEF456" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

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
    "permissionType": "READ",
    "expireTime": "2026-04-10T10:00:00",
    "accessCount": 5,
    "isEnabled": true
  }
}
```

### 5.3 访问分享文档

**接口**: `GET /api/lib/shares/{shareCode}/access`

**请求参数**:
- `shareCode` (路径参数): 分享码
- `password` (查询参数，可选): 分享密码

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/shares/ABC123DEF456/access?password=123456" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "采购合同",
    "documentCode": "DOC20260310100000ABCD1234",
    "documentType": "WORD",
    "fileName": "采购合同.doc",
    "fileSize": 102400,
    "hasPermission": true
  }
}
```

### 5.4 下载分享文档

**接口**: `GET /api/lib/shares/{shareCode}/download`

**请求参数**:
- `shareCode` (路径参数): 分享码
- `password` (查询参数，可选): 分享密码

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/shares/ABC123DEF456/download?password=123456" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  --output 采购合同.doc
```

**响应**: 返回文件流

### 5.5 删除分享链接

**接口**: `DELETE /api/lib/shares/{id}`

**请求参数**: 
- `id` (路径参数): 分享 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/shares/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 5.6 禁用分享链接

**接口**: `POST /api/lib/shares/{id}/disable`

**请求参数**: 
- `id` (路径参数): 分享 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/shares/1/disable" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 5.7 启用分享链接

**接口**: `POST /api/lib/shares/{id}/enable`

**请求参数**: 
- `id` (路径参数): 分享 ID

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/shares/1/enable" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 5.8 验证分享链接是否有效

**接口**: `GET /api/lib/shares/{shareCode}/valid`

**请求参数**: 
- `shareCode` (路径参数): 分享码

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/shares/ABC123DEF456/valid" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

### 5.9 验证分享密码

**接口**: `POST /api/lib/shares/{shareCode}/check-password`

**请求参数**:
- `shareCode` (路径参数): 分享码
- `password` (查询参数): 密码

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/shares/ABC123DEF456/check-password?password=123456" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

---

## 6. 📜 版本管理 API

### 6.1 创建文档版本

**接口**: `POST /api/lib/documents/{documentId}/versions`

**请求参数**:
```json
{
  "file": "文件对象 (FormData)",
  "versionName": "v2",
  "changeSummary": "更新了合同条款",
  "changeType": "UPDATE",
  "isMajor": true
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/versions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -F "file=@/path/to/document_v2.doc" \
  -F "versionName=v2" \
  -F "changeSummary=更新了合同条款" \
  -F "changeType=UPDATE" \
  -F "isMajor=true"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "documentId": 1,
    "versionNumber": 2,
    "versionName": "v2",
    "fileName": "采购合同_v2.doc",
    "filePath": "D:\\lawbackend2\\uploads\\documents\\versions\\20260310110000_采购合同_v2.doc",
    "fileSize": 105000,
    "changeSummary": "更新了合同条款",
    "changeType": "UPDATE",
    "isMajor": true,
    "createTime": "2026-03-10T11:00:00",
    "createUserId": 10
  }
}
```

### 6.2 获取文档版本列表

**接口**: `GET /api/lib/documents/{documentId}/versions`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/versions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "versions": [
      {
        "id": 1,
        "documentId": 1,
        "versionNumber": 1,
        "versionName": "v1",
        "fileName": "采购合同.doc",
        "fileSize": 102400,
        "changeSummary": "初始版本",
        "changeType": "CREATE",
        "isMajor": true,
        "createTime": "2026-03-10T10:00:00"
      },
      {
        "id": 2,
        "documentId": 1,
        "versionNumber": 2,
        "versionName": "v2",
        "fileName": "采购合同_v2.doc",
        "fileSize": 105000,
        "changeSummary": "更新了合同条款",
        "changeType": "UPDATE",
        "isMajor": true,
        "createTime": "2026-03-10T11:00:00"
      }
    ]
  }
}
```

### 6.3 获取指定版本

**接口**: `GET /api/lib/documents/{documentId}/versions/{versionNumber}`

**请求参数**:
- `documentId` (路径参数): 文档 ID
- `versionNumber` (路径参数): 版本号

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/versions/2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "documentId": 1,
    "versionNumber": 2,
    "versionName": "v2",
    "fileName": "采购合同_v2.doc",
    "filePath": "D:\\lawbackend2\\uploads\\documents\\versions\\20260310110000_采购合同_v2.doc",
    "fileSize": 105000,
    "changeSummary": "更新了合同条款",
    "changeType": "UPDATE",
    "isMajor": true,
    "createTime": "2026-03-10T11:00:00",
    "createUserId": 10
  }
}
```

### 6.4 获取最新版本

**接口**: `GET /api/lib/documents/{documentId}/versions/latest`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/versions/latest" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "documentId": 1,
    "versionNumber": 2,
    "versionName": "v2",
    "fileName": "采购合同_v2.doc",
    "fileSize": 105000,
    "changeSummary": "更新了合同条款",
    "changeType": "UPDATE",
    "isMajor": true,
    "createTime": "2026-03-10T11:00:00"
  }
}
```

### 6.5 恢复到指定版本

**接口**: `POST /api/lib/documents/{documentId}/versions/{versionNumber}/restore`

**请求参数**:
- `documentId` (路径参数): 文档 ID
- `versionNumber` (路径参数): 版本号

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/versions/1/restore" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 6.6 删除版本

**接口**: `DELETE /api/lib/versions/{versionId}`

**请求参数**: 
- `versionId` (路径参数): 版本 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/versions/2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 6.7 获取下一个版本号

**接口**: `GET /api/lib/documents/{documentId}/versions/next-number`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/versions/next-number" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": 3
}
```

### 6.8 获取版本总数

**接口**: `GET /api/lib/documents/{documentId}/versions/count`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/versions/count" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": 3
}
```

---

## 7. 🔐 权限管理 API

### 7.1 获取所有权限定义

**接口**: `GET /api/lib/permissions`

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/permissions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

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
      "permissionCode": "DOC_EDIT",
      "permissionType": "EDIT",
      "description": "编辑文档内容和属性",
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
      "description": "下载文档文件",
      "sortOrder": 4
    }
  ]
}
```

### 7.2 根据 ID 获取权限定义

**接口**: `GET /api/lib/permissions/{id}`

**请求参数**: 
- `id` (路径参数): 权限 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/permissions/1" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "permissionName": "查看权限",
    "permissionCode": "DOC_READ",
    "permissionType": "READ",
    "description": "查看文档内容和信息",
    "sortOrder": 1
  }
}
```

### 7.3 根据编码获取权限定义

**接口**: `GET /api/lib/permissions/code/{code}`

**请求参数**: 
- `code` (路径参数): 权限编码

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/permissions/code/DOC_READ" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "permissionName": "查看权限",
    "permissionCode": "DOC_READ",
    "permissionType": "READ",
    "description": "查看文档内容和信息",
    "sortOrder": 1
  }
}
```

### 7.4 授予文件夹权限

**接口**: `POST /api/lib/folders/{folderId}/permissions`

**请求参数**:
```json
{
  "permissionId": 1,
  "targetType": "USER",
  "targetId": 2,
  "isInherit": true
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/folders/1/permissions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionId": 1,
    "targetType": "USER",
    "targetId": 2,
    "isInherit": true
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 7.5 撤销文件夹权限

**接口**: `DELETE /api/lib/folders/{folderId}/permissions/{permissionId}`

**请求参数**:
- `folderId` (路径参数): 文件夹 ID
- `permissionId` (路径参数): 权限 ID
- `targetType` (查询参数): 目标类型 (USER/ROLE/DEPARTMENT)
- `targetId` (查询参数): 目标 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/folders/1/permissions/1?targetType=USER&targetId=2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 7.6 获取文件夹权限列表

**接口**: `GET /api/lib/folders/{folderId}/permissions`

**请求参数**: 
- `folderId` (路径参数): 文件夹 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/folders/1/permissions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "folderId": 1,
      "permissionId": 1,
      "permissionName": "查看权限",
      "permissionCode": "DOC_READ",
      "targetType": "USER",
      "targetId": 2,
      "targetName": "李四",
      "isInherit": true,
      "createTime": "2026-03-10T10:00:00"
    }
  ]
}
```

### 7.7 授予文档权限

**接口**: `POST /api/lib/documents/{documentId}/permissions`

**请求参数**:
```json
{
  "permissionId": 1,
  "targetType": "USER",
  "targetId": 2
}
```

**请求示例**:
```bash
curl -X POST "http://localhost:5779/api/v1/api/lib/documents/1/permissions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionId": 1,
    "targetType": "USER",
    "targetId": 2
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 7.8 撤销文档权限

**接口**: `DELETE /api/lib/documents/{documentId}/permissions/{permissionId}`

**请求参数**:
- `documentId` (路径参数): 文档 ID
- `permissionId` (路径参数): 权限 ID
- `targetType` (查询参数): 目标类型
- `targetId` (查询参数): 目标 ID

**请求示例**:
```bash
curl -X DELETE "http://localhost:5779/api/v1/api/lib/documents/1/permissions/1?targetType=USER&targetId=2" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 7.9 获取文档权限列表

**接口**: `GET /api/lib/documents/{documentId}/permissions`

**请求参数**: 
- `documentId` (路径参数): 文档 ID

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/documents/1/permissions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "documentId": 1,
      "permissionId": 1,
      "permissionName": "查看权限",
      "permissionCode": "DOC_READ",
      "targetType": "USER",
      "targetId": 2,
      "targetName": "李四",
      "createTime": "2026-03-10T10:00:00"
    }
  ]
}
```

### 7.10 获取用户可访问的文件夹 ID 列表

**接口**: `GET /api/lib/permissions/accessible-folders`

**请求参数**:
- `permissionType` (查询参数): 权限类型 (READ/EDIT/DELETE/DOWNLOAD)

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/permissions/accessible-folders?permissionType=READ" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [1, 2, 3, 5, 8]
}
```

### 7.11 获取用户可访问的文档 ID 列表

**接口**: `GET /api/lib/permissions/accessible-documents`

**请求参数**:
- `permissionType` (查询参数): 权限类型

**请求示例**:
```bash
curl -X GET "http://localhost:5779/api/v1/api/lib/permissions/accessible-documents?permissionType=READ" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: 10"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [1, 3, 5, 7, 9, 10]
}
```

---

## 错误响应示例

### 业务异常
```json
{
  "code": 500,
  "message": "文档不存在",
  "data": null
}
```

### 权限不足
```json
{
  "code": 403,
  "message": "没有权限访问该资源",
  "data": null
}
```

### 参数验证失败
```json
{
  "code": 400,
  "message": "参数验证失败：folderId 不能为空",
  "data": null
}
```

### 未授权
```json
{
  "code": 401,
  "message": "未授权访问",
  "data": null
}
```

---

## 注意事项

1. **所有文档查询接口**默认只返回 `is_deleted = false` 的文档（软删除过滤）
2. **上传文档**时必须提供 `folderId` 参数
3. **文件上传**使用 FormData 格式，Content-Type 应为 `multipart/form-data`
4. **浏览次数**在查看文档详情、预览、下载时会自动增加
5. **权限控制**支持用户级、角色级、部门级三种维度
6. **分享链接**支持密码保护和过期时间设置
7. **版本管理**支持版本历史查看和版本回滚
