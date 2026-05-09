# 文档库模块 API 集合

**日期：2026年5月8日**

---

## 目录

1. [文件夹管理 API](#文件夹管理-api)
   - [创建文件夹](#1-创建文件夹)
   - [获取文件夹详情](#2-获取文件夹详情)
   - [更新文件夹](#3-更新文件夹)
   - [删除文件夹](#4-删除文件夹)
   - [获取文件夹树](#5-获取文件夹树)
   - [获取子文件夹列表](#6-获取子文件夹列表)
   - [获取根文件夹列表](#7-获取根文件夹列表)
   - [移动文件夹](#8-移动文件夹)
   - [获取文件夹路径](#9-获取文件夹路径)
   - [获取所有子孙文件夹ID](#10-获取所有子孙文件夹id)
   - [按层级获取文件夹](#11-按层级获取文件夹)
   - [更新文件夹排序](#12-更新文件夹排序)

2. [文档管理 API](#文档管理-api)
   - [创建文档记录](#1-创建文档记录)
   - [上传文档](#2-上传文档)
   - [获取文档详情](#3-获取文档详情)
   - [根据编码获取文档](#4-根据编码获取文档)
   - [更新文档](#5-更新文档)
   - [删除文档](#6-删除文档)
   - [查询文档列表](#7-查询文档列表)
   - [搜索文档](#8-搜索文档)
   - [获取文件夹下的文档](#9-获取文件夹下的文档)
   - [获取我的文档](#10-获取我的文档)
   - [下载文档](#11-下载文档)
   - [预览文档](#12-预览文档)
   - [获取Office预览配置](#13-获取office预览配置)
   - [锁定文档](#14-锁定文档)
   - [解锁文档](#15-解锁文档)
   - [移动文档](#16-移动文档)
   - [复制文档](#17-复制文档)
   - [获取最近上传的文档](#18-获取最近上传的文档)
   - [获取热门文档](#19-获取热门文档)

---

# 文件夹管理 API

## 1. 创建文件夹

**请求 URL:** `http://localhost:5779/api/lib/folders`

**请求方法:** `POST`

**请求头:** `Content-Type: application/json`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderName | String | 是 | 文件夹名称（最长100字符） |
| parentId | Long | 否 | 父文件夹ID，为空则创建根文件夹 |
| description | String | 否 | 文件夹描述 |
| icon | String | 否 | 文件夹图标 |
| color | String | 否 | 文件夹颜色 |
| isPublic | Boolean | 否 | 是否公开，默认false |
| sortOrder | Integer | 否 | 排序顺序，默认0 |

**请求示例：**
```json
{
  "folderName": "合同文件夹",
  "parentId": null,
  "description": "存放所有合同文档",
  "icon": "folder",
  "color": "#409EFF",
  "isPublic": true,
  "sortOrder": 0
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "parentId": null,
    "folderLevel": 1,
    "sortOrder": 0,
    "description": "存放所有合同文档",
    "icon": "folder",
    "color": "#409EFF",
    "isPublic": true,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T10:30:00",
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

## 2. 获取文件夹详情

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "parentId": null,
    "folderLevel": 1,
    "sortOrder": 0,
    "description": "存放所有合同文档",
    "icon": "folder",
    "color": "#409EFF",
    "isPublic": true,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T10:30:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "documentCount": 10,
    "subFolderCount": 2,
    "children": null,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null
  }
}
```

---

## 3. 更新文件夹

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}`

**请求方法:** `PUT`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderName | String | 否 | 文件夹名称（最长100字符） |
| parentId | Long | 否 | 父文件夹ID |
| description | String | 否 | 文件夹描述 |
| icon | String | 否 | 文件夹图标 |
| color | String | 否 | 文件夹颜色 |
| isPublic | Boolean | 否 | 是否公开 |
| sortOrder | Integer | 否 | 排序顺序 |

**请求示例：**
```json
{
  "folderName": "更新后的文件夹名称",
  "description": "更新后的描述",
  "icon": "folder-open",
  "color": "#67C23A",
  "isPublic": false,
  "sortOrder": 1
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "folderName": "更新后的文件夹名称",
    "folderPath": "/更新后的文件夹名称",
    "parentId": null,
    "folderLevel": 1,
    "sortOrder": 1,
    "description": "更新后的描述",
    "icon": "folder-open",
    "color": "#67C23A",
    "isPublic": false,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T11:00:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "documentCount": 10,
    "subFolderCount": 2,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null
  }
}
```

---

## 4. 删除文件夹

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}`

**请求方法:** `DELETE`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 5. 获取文件夹树

**请求 URL:** `http://localhost:5779/api/lib/folders/tree`

**请求方法:** `GET`

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "合同文件夹",
      "type": "folder",
      "parentId": null,
      "path": "/合同文件夹",
      "folderLevel": 1,
      "sortOrder": 0,
      "icon": "folder",
      "color": "#409EFF",
      "documentCount": 10,
      "createTime": "2026-05-08T10:30:00",
      "createUserId": 1,
      "createUserName": "管理员",
      "children": [
        {
          "id": 2,
          "name": "子文件夹A",
          "type": "folder",
          "parentId": 1,
          "path": "/合同文件夹/子文件夹A",
          "folderLevel": 2,
          "sortOrder": 0,
          "icon": "folder",
          "color": "#409EFF",
          "documentCount": 5,
          "createTime": "2026-05-08T10:35:00",
          "createUserId": 1,
          "createUserName": "管理员",
          "children": []
        }
      ]
    }
  ]
}
```

---

## 6. 获取子文件夹列表

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}/children`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 父文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "folderName": "子文件夹A",
      "folderPath": "/合同文件夹/子文件夹A",
      "parentId": 1,
      "folderLevel": 2,
      "sortOrder": 0,
      "description": null,
      "icon": "folder",
      "color": "#409EFF",
      "isPublic": true,
      "status": "ACTIVE",
      "createTime": "2026-05-08T10:35:00",
      "updateTime": "2026-05-08T10:35:00",
      "createUserId": 1,
      "createUserName": "管理员",
      "documentCount": 5,
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

## 7. 获取根文件夹列表

**请求 URL:** `http://localhost:5779/api/lib/folders/root`

**请求方法:** `GET`

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "page": 1,
    "size": 100,
    "totalPages": 1,
    "folders": [
      {
        "id": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "parentId": null,
        "folderLevel": 1,
        "sortOrder": 0,
        "description": "存放所有合同文档",
        "icon": "folder",
        "color": "#409EFF",
        "isPublic": true,
        "status": "ACTIVE",
        "createTime": "2026-05-08T10:30:00",
        "updateTime": "2026-05-08T10:30:00",
        "createUserId": 1,
        "createUserName": "管理员",
        "documentCount": 10,
        "subFolderCount": 2,
        "children": null,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null
      }
    ]
  }
}
```

---

## 8. 移动文件夹

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}/move`

**请求方法:** `POST`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 要移动的文件夹ID |

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetFolderId | Long | 否 | 目标文件夹ID，为空则移动到根目录 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 9. 获取文件夹路径

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}/path`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "合同文件夹",
      "type": "folder",
      "parentId": null,
      "path": "/合同文件夹",
      "folderLevel": 1,
      "sortOrder": 0,
      "icon": "folder",
      "color": "#409EFF",
      "documentCount": 10,
      "createTime": "2026-05-08T10:30:00",
      "createUserId": 1,
      "createUserName": "管理员",
      "children": null
    },
    {
      "id": 2,
      "name": "子文件夹A",
      "type": "folder",
      "parentId": 1,
      "path": "/合同文件夹/子文件夹A",
      "folderLevel": 2,
      "sortOrder": 0,
      "icon": "folder",
      "color": "#409EFF",
      "documentCount": 5,
      "createTime": "2026-05-08T10:35:00",
      "createUserId": 1,
      "createUserName": "管理员",
      "children": null
    }
  ]
}
```

---

## 10. 获取所有子孙文件夹ID

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}/descendants`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [2, 3, 4, 5]
}
```

---

## 11. 按层级获取文件夹

**请求 URL:** `http://localhost:5779/api/lib/folders/level/{level}`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| level | Integer | 是 | 文件夹层级（1=根目录，2=二级，以此类推） |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "folderName": "合同文件夹",
      "folderPath": "/合同文件夹",
      "parentId": null,
      "folderLevel": 1,
      "sortOrder": 0,
      "description": "存放所有合同文档",
      "icon": "folder",
      "color": "#409EFF",
      "isPublic": true,
      "status": "ACTIVE",
      "createTime": "2026-05-08T10:30:00",
      "updateTime": "2026-05-08T10:30:00",
      "createUserId": 1,
      "createUserName": "管理员",
      "documentCount": 10,
      "subFolderCount": 2,
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

## 12. 更新文件夹排序

**请求 URL:** `http://localhost:5779/api/lib/folders/{id}/sort`

**请求方法:** `PUT`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文件夹ID |

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sortOrder | Integer | 是 | 排序顺序 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

# 文档管理 API

## 1. 创建文档记录

**请求 URL:** `http://localhost:5779/api/lib/documents`

**请求方法:** `POST`

**请求头:** `Content-Type: application/json`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| documentName | String | 是 | 文档名称（最长255字符） |
| documentCode | String | 否 | 文档编码 |
| folderId | Long | 否 | 所属文件夹ID |
| documentType | String | 是 | 文档类型（如：docx, pdf, xlsx） |
| fileName | String | 是 | 文件名 |
| filePath | String | 是 | 文件路径 |
| fileSize | Long | 否 | 文件大小（字节） |
| fileExtension | String | 否 | 文件扩展名 |
| mimeType | String | 否 | MIME类型 |
| description | String | 否 | 文档描述 |
| tags | String | 否 | 标签（逗号分隔） |
| isPublic | Boolean | 否 | 是否公开，默认false |

**请求示例：**
```json
{
  "documentName": "JD合同模板",
  "documentCode": "DOC001",
  "folderId": 1,
  "documentType": "docx",
  "fileName": "jd_contract.docx",
  "filePath": "/uploads/documents/jd_contract.docx",
  "fileSize": 102400,
  "fileExtension": "docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "description": "JD合同模板文档",
  "tags": "合同,JD",
  "isPublic": true
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "JD合同模板",
    "documentCode": "DOC001",
    "folderId": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "documentType": "docx",
    "fileName": "jd_contract.docx",
    "filePath": "/uploads/documents/jd_contract.docx",
    "fileSize": 102400,
    "fileExtension": "docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "currentVersion": 1,
    "description": "JD合同模板文档",
    "tags": "合同,JD",
    "isPublic": true,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null,
    "downloadCount": 0,
    "viewCount": 0,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T10:30:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

---

## 2. 上传文档

**请求 URL:** `http://localhost:5779/api/lib/documents/upload`

**请求方法:** `POST`

**请求格式:** `multipart/form-data`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 上传的文件 |
| folderId | Long | 否 | 所属文件夹ID |
| documentName | String | 否 | 文档名称（不传则使用文件名） |
| description | String | 否 | 文档描述 |
| tags | String | 否 | 标签（逗号分隔） |
| isPublic | Boolean | 否 | 是否公开，默认false |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "documentName": "上传的文件名.docx",
    "documentCode": null,
    "folderId": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "documentType": "docx",
    "fileName": "上传的文件名.docx",
    "filePath": "/uploads/documents/xxx.docx",
    "fileSize": 204800,
    "fileExtension": "docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "currentVersion": 1,
    "description": null,
    "tags": null,
    "isPublic": false,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null,
    "downloadCount": 0,
    "viewCount": 0,
    "status": "ACTIVE",
    "createTime": "2026-05-08T11:00:00",
    "updateTime": "2026-05-08T11:00:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

---

## 3. 获取文档详情

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "JD合同模板",
    "documentCode": "DOC001",
    "folderId": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "documentType": "docx",
    "fileName": "jd_contract.docx",
    "filePath": "/uploads/documents/jd_contract.docx",
    "fileSize": 102400,
    "fileExtension": "docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "currentVersion": 1,
    "description": "JD合同模板文档",
    "tags": "合同,JD",
    "isPublic": true,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null,
    "downloadCount": 10,
    "viewCount": 50,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T10:30:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

---

## 4. 根据编码获取文档

**请求 URL:** `http://localhost:5779/api/lib/documents/code/{code}`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | String | 是 | 文档编码 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "JD合同模板",
    "documentCode": "DOC001",
    "folderId": 1,
    "folderName": "合同文件夹",
    "folderPath": "/合同文件夹",
    "documentType": "docx",
    "fileName": "jd_contract.docx",
    "filePath": "/uploads/documents/jd_contract.docx",
    "fileSize": 102400,
    "fileExtension": "docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "currentVersion": 1,
    "description": "JD合同模板文档",
    "tags": "合同,JD",
    "isPublic": true,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null,
    "downloadCount": 10,
    "viewCount": 50,
    "status": "ACTIVE",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T10:30:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

---

## 5. 更新文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}`

**请求方法:** `PUT`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| documentName | String | 否 | 文档名称（最长255字符） |
| folderId | Long | 否 | 所属文件夹ID |
| description | String | 否 | 文档描述 |
| tags | String | 否 | 标签（逗号分隔） |
| isPublic | Boolean | 否 | 是否公开 |
| status | String | 否 | 状态（ACTIVE, ARCHIVED, DELETED） |

**请求示例：**
```json
{
  "documentName": "更新的文档名称",
  "folderId": 2,
  "description": "更新后的描述",
  "tags": "更新,标签",
  "isPublic": false,
  "status": "ARCHIVED"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "documentName": "更新的文档名称",
    "documentCode": "DOC001",
    "folderId": 2,
    "folderName": "子文件夹A",
    "folderPath": "/合同文件夹/子文件夹A",
    "documentType": "docx",
    "fileName": "jd_contract.docx",
    "filePath": "/uploads/documents/jd_contract.docx",
    "fileSize": 102400,
    "fileExtension": "docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "currentVersion": 1,
    "description": "更新后的描述",
    "tags": "更新,标签",
    "isPublic": false,
    "isLocked": false,
    "lockedBy": null,
    "lockedByName": null,
    "lockedTime": null,
    "downloadCount": 10,
    "viewCount": 50,
    "status": "ARCHIVED",
    "createTime": "2026-05-08T10:30:00",
    "updateTime": "2026-05-08T12:00:00",
    "createUserId": 1,
    "createUserName": "管理员",
    "isFavorited": false,
    "hasPermission": true
  }
}
```

---

## 6. 删除文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}`

**请求方法:** `DELETE`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 7. 查询文档列表

**请求 URL:** `http://localhost:5779/api/lib/documents/list`

**请求方法:** `POST`

**请求头:** `Content-Type: application/json`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |
| sortBy | String | 否 | 排序字段，默认createTime |
| sortOrder | String | 否 | 排序方向（asc/desc），默认desc |
| keyword | String | 否 | 文档名称关键字（模糊匹配） |
| documentType | String | 否 | 文档类型，如：docx, pdf, xlsx |
| status | String | 否 | 状态：ACTIVE, ARCHIVED, DELETED |
| isPublic | Boolean | 否 | 是否公开：true/false |
| folderId | Long | 否 | 文件夹ID |

**请求示例 - 按关键字搜索：**
```json
{
  "page": 1,
  "size": 10,
  "sortBy": "createTime",
  "sortOrder": "desc",
  "keyword": "jd"
}
```

**请求示例 - 按文档类型筛选：**
```json
{
  "page": 1,
  "size": 10,
  "sortBy": "createTime",
  "sortOrder": "desc",
  "documentType": "docx"
}
```

**请求示例 - 组合筛选：**
```json
{
  "page": 1,
  "size": 10,
  "sortBy": "createTime",
  "sortOrder": "desc",
  "documentType": "docx",
  "status": "ARCHIVED",
  "isPublic": true,
  "folderId": 1
}
```

**响应示例：**
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
        "documentName": "JD合同模板.docx",
        "documentCode": "DOC001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "jd_contract.docx",
        "filePath": "/uploads/documents/jd_contract.docx",
        "fileSize": 102400,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "JD合同模板",
        "tags": "合同,JD",
        "isPublic": true,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 10,
        "viewCount": 50,
        "status": "ACTIVE",
        "createTime": "2026-05-08T10:30:00",
        "updateTime": "2026-05-08T10:30:00",
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

## 8. 搜索文档

**请求 URL:** `http://localhost:5779/api/lib/documents/search`

**请求方法:** `GET`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 是 | 搜索关键字 |
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "totalPages": 5,
    "documents": [
      {
        "id": 1,
        "documentName": "JD合同模板.docx",
        "documentCode": "DOC001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "jd_contract.docx",
        "filePath": "/uploads/documents/jd_contract.docx",
        "fileSize": 102400,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "JD合同模板",
        "tags": "合同,JD",
        "isPublic": true,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 10,
        "viewCount": 50,
        "status": "ACTIVE",
        "createTime": "2026-05-08T10:30:00",
        "updateTime": "2026-05-08T10:30:00",
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

## 9. 获取文件夹下的文档

**请求 URL:** `http://localhost:5779/api/lib/documents/folder/{folderId}`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderId | Long | 是 | 文件夹ID |

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "page": 1,
    "size": 10,
    "totalPages": 2,
    "documents": [
      {
        "id": 1,
        "documentName": "JD合同模板.docx",
        "documentCode": "DOC001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "jd_contract.docx",
        "filePath": "/uploads/documents/jd_contract.docx",
        "fileSize": 102400,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "JD合同模板",
        "tags": "合同,JD",
        "isPublic": true,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 10,
        "viewCount": 50,
        "status": "ACTIVE",
        "createTime": "2026-05-08T10:30:00",
        "updateTime": "2026-05-08T10:30:00",
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

## 10. 获取我的文档

**请求 URL:** `http://localhost:5779/api/lib/documents/my`

**请求方法:** `GET`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "page": 1,
    "size": 10,
    "totalPages": 2,
    "documents": [
      {
        "id": 1,
        "documentName": "我的文档.docx",
        "documentCode": "MYDOC001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "my_document.docx",
        "filePath": "/uploads/documents/my_document.docx",
        "fileSize": 51200,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "我的私有文档",
        "tags": "私有",
        "isPublic": false,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 0,
        "viewCount": 5,
        "status": "ACTIVE",
        "createTime": "2026-05-08T09:00:00",
        "updateTime": "2026-05-08T09:00:00",
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

## 11. 下载文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/download`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应：** 文件流（Content-Type 根据文件 MIME 类型设置）

---

## 12. 预览文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/preview`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应：** 文件流（Content-Type 根据文件 MIME 类型设置）

---

## 13. 获取Office预览配置

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/office-config`

**请求方法:** `GET`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "documentId": 1,
    "documentName": "JD合同模板.docx",
    "filePath": "/uploads/documents/jd_contract.docx",
    "serverUrl": "http://localhost:8080",
    "previewUrl": "http://localhost:8080/onlineEditor?documentId=1"
  }
}
```

---

## 14. 锁定文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/lock`

**请求方法:** `POST`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 15. 解锁文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/unlock`

**请求方法:** `POST`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 16. 移动文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/move`

**请求方法:** `POST`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetFolderId | Long | 是 | 目标文件夹ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 17. 复制文档

**请求 URL:** `http://localhost:5779/api/lib/documents/{id}/copy`

**请求方法:** `POST`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 文档ID |

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetFolderId | Long | 否 | 目标文件夹ID，为空则复制到根目录 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 18. 获取最近上传的文档

**请求 URL:** `http://localhost:5779/api/lib/documents/recent`

**请求方法:** `GET`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "page": 1,
    "size": 10,
    "totalPages": 3,
    "documents": [
      {
        "id": 5,
        "documentName": "最新上传的文档.docx",
        "documentCode": "RECENT001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "recent.docx",
        "filePath": "/uploads/documents/recent.docx",
        "fileSize": 25600,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "最近上传",
        "tags": null,
        "isPublic": true,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 0,
        "viewCount": 2,
        "status": "ACTIVE",
        "createTime": "2026-05-08T14:00:00",
        "updateTime": "2026-05-08T14:00:00",
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

## 19. 获取热门文档

**请求 URL:** `http://localhost:5779/api/lib/documents/popular`

**请求方法:** `GET`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |
| timeRange | String | 否 | 时间范围：all(全部)、day(今天)、week(本周)、month(本月)，默认all |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "totalPages": 5,
    "documents": [
      {
        "id": 1,
        "documentName": "热门文档.docx",
        "documentCode": "POP001",
        "folderId": 1,
        "folderName": "合同文件夹",
        "folderPath": "/合同文件夹",
        "documentType": "docx",
        "fileName": "popular.docx",
        "filePath": "/uploads/documents/popular.docx",
        "fileSize": 102400,
        "fileExtension": "docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "currentVersion": 1,
        "description": "热门文档",
        "tags": "热门",
        "isPublic": true,
        "isLocked": false,
        "lockedBy": null,
        "lockedByName": null,
        "lockedTime": null,
        "downloadCount": 100,
        "viewCount": 500,
        "status": "ACTIVE",
        "createTime": "2026-05-01T10:00:00",
        "updateTime": "2026-05-01T10:00:00",
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

## 通用响应格式

所有接口均返回统一的响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object | 响应数据（失败时为null） |

---

## 认证说明

所有接口需要在请求头中携带用户身份信息，系统通过 `@CurrentUserId` 注解自动获取当前登录用户ID。

---

## 错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
