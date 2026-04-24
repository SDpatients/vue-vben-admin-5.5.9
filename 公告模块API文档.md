# 公告模块API文档

> 本文档供前端uni-app开发人员参考，包含案件公告管理和公告查看记录两个子模块的API接口。

---

## 目录

- [一、通用说明](#一通用说明)
- [二、案件公告管理API](#二案件公告管理api)
- [三、公告查看记录API](#三公告查看记录api)

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

### 1.3 分页响应格式

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "list": [ ... ],
        "pageNum": 1,
        "pageSize": 10
    }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| total | Long | 总记录数 |
| list | Array | 数据列表 |
| pageNum | Integer | 当前页码 |
| pageSize | Integer | 每页大小 |

---

## 二、案件公告管理API

### 2.1 创建案件公告

**接口地址**：`POST /case-announcement`

**接口描述**：创建一条新的案件公告

**请求头**：
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| caseNumber | String | 否 | 案件编号 |
| principalOfficer | String | 否 | 负责人 |
| title | String | 是 | 公告标题 |
| content | String | 是 | 公告内容 |
| announcementType | String | 是 | 公告类型 |
| attachments | String | 否 | 附件信息(JSON字符串) |

**请求示例**：
```json
{
    "caseId": 1001,
    "caseNumber": "CASE2024001",
    "principalOfficer": "张三",
    "title": "关于召开债权人会议的公告",
    "content": "兹定于2024年2月1日召开第一次债权人会议...",
    "announcementType": "MEETING",
    "attachments": "[]"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "announcementId": 1
    }
}
```

---

### 2.2 创建案件公告（带文件上传）

**接口地址**：`POST /case-announcement/with-files`

**接口描述**：创建案件公告并同时上传附件

**请求头**：
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |
| caseNumber | String | 否 | 案件编号 |
| principalOfficer | String | 否 | 负责人 |
| title | String | 是 | 公告标题 |
| content | String | 是 | 公告内容 |
| announcementType | String | 是 | 公告类型 |
| files | File[] | 是 | 上传的文件列表 |
| fileDescriptions | String[] | 否 | 文件描述列表 |

**请求示例（FormData）**：
```
caseId: 1001
caseNumber: CASE2024001
principalOfficer: 张三
title: 关于召开债权人会议的公告
content: 兹定于2024年2月1日召开第一次债权人会议...
announcementType: MEETING
files: [File, File]
fileDescriptions: ["会议通知", "议程安排"]
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "announcementId": 1,
        "title": "关于召开债权人会议的公告",
        "announcementType": "MEETING",
        "status": "DRAFT",
        "files": [
            {
                "id": 101,
                "originalFileName": "会议通知.pdf",
                "storedFileName": "uuid.pdf",
                "filePath": "/upload/announcement/1/uuid.pdf",
                "fileSize": 102400,
                "fileExtension": "pdf",
                "mimeType": "application/pdf",
                "bizType": "announcement",
                "bizId": "1",
                "uploadTime": "2024-01-15T10:30:00",
                "uploadUserId": 1,
                "fileStatus": 1,
                "description": "会议通知",
                "sortOrder": 1
            }
        ]
    }
}
```

---

### 2.3 获取案件公告列表

**接口地址**：`GET /case-announcement/list`

**接口描述**：分页获取案件公告列表

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| pageNum | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页大小 |
| caseId | Long | 否 | - | 案件ID（筛选） |
| status | String | 否 | - | 状态（筛选） |

**请求示例**：
```
GET /case-announcement/list?pageNum=1&pageSize=10&caseId=1001&status=PUBLISHED
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 25,
        "list": [
            {
                "id": 1,
                "caseId": 1001,
                "caseNumber": "CASE2024001",
                "principalOfficer": "张三",
                "title": "关于召开债权人会议的公告",
                "content": "兹定于2024年2月1日召开第一次债权人会议...",
                "announcementType": "MEETING",
                "status": "PUBLISHED",
                "publisherId": 1,
                "publisherName": "管理员",
                "publishTime": "2024-01-15T10:00:00",
                "viewCount": 150,
                "isTop": true,
                "topExpireTime": "2024-02-15T00:00:00",
                "attachments": "[]",
                "createTime": "2024-01-14T09:00:00",
                "updateTime": "2024-01-15T10:00:00"
            }
        ],
        "pageNum": 1,
        "pageSize": 10
    }
}
```

---

### 2.4 获取公告详情

**接口地址**：`GET /case-announcement/{announcementId}`

**接口描述**：根据ID获取公告详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求示例**：
```
GET /case-announcement/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "caseId": 1001,
        "caseNumber": "CASE2024001",
        "principalOfficer": "张三",
        "title": "关于召开债权人会议的公告",
        "content": "兹定于2024年2月1日召开第一次债权人会议...",
        "announcementType": "MEETING",
        "status": "PUBLISHED",
        "publisherId": 1,
        "publisherName": "管理员",
        "publishTime": "2024-01-15T10:00:00",
        "viewCount": 150,
        "isTop": true,
        "topExpireTime": "2024-02-15T00:00:00",
        "attachments": "[]",
        "createTime": "2024-01-14T09:00:00",
        "updateTime": "2024-01-15T10:00:00"
    }
}
```

---

### 2.5 更新案件公告

**接口地址**：`PUT /case-announcement/{announcementId}`

**接口描述**：更新公告信息

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | String | 否 | 公告标题 |
| content | String | 否 | 公告内容 |
| announcementType | String | 否 | 公告类型 |
| attachments | String | 否 | 附件信息(JSON字符串) |

**请求示例**：
```json
{
    "title": "关于召开债权人会议的公告（修订版）",
    "content": "更新后的公告内容...",
    "announcementType": "MEETING"
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

### 2.6 发布公告

**接口地址**：`POST /case-announcement/{announcementId}/publish`

**接口描述**：将草稿状态的公告发布

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| topExpireTime | DateTime | 否 | 置顶过期时间 |

**请求示例**：
```json
{
    "topExpireTime": "2024-02-15T00:00:00"
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

### 2.7 置顶公告

**接口地址**：`POST /case-announcement/{announcementId}/top`

**接口描述**：将公告设置为置顶状态

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| topExpireTime | DateTime | 否 | 置顶过期时间 |

**请求示例**：
```json
{
    "topExpireTime": "2024-02-15T00:00:00"
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

### 2.8 取消置顶公告

**接口地址**：`DELETE /case-announcement/{announcementId}/top`

**接口描述**：取消公告的置顶状态

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求示例**：
```
DELETE /case-announcement/1/top
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

### 2.9 删除案件公告

**接口地址**：`DELETE /case-announcement/{announcementId}`

**接口描述**：删除指定的公告

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求示例**：
```
DELETE /case-announcement/1
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

### 2.10 获取公告附件列表

**接口地址**：`GET /case-announcement/{announcementId}/attachments`

**接口描述**：获取公告关联的所有附件

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求示例**：
```
GET /case-announcement/1/attachments
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 101,
            "originalFileName": "会议通知.pdf",
            "storedFileName": "uuid.pdf",
            "filePath": "/upload/announcement/1/uuid.pdf",
            "fileSize": 102400,
            "fileExtension": "pdf",
            "mimeType": "application/pdf",
            "bizType": "announcement",
            "bizId": "1",
            "uploadTime": "2024-01-15T10:30:00",
            "uploadUserId": 1,
            "fileStatus": 1,
            "description": "会议通知",
            "sortOrder": 1
        }
    ]
}
```

---

### 2.11 上传公告附件

**接口地址**：`POST /case-announcement/{announcementId}/attachments/upload`

**接口描述**：为已存在的公告上传附件

**请求头**：
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| files | File[] | 是 | 上传的文件列表 |

**请求示例（FormData）**：
```
files: [File, File]
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 102,
            "originalFileName": "补充材料.docx",
            "storedFileName": "uuid.docx",
            "filePath": "/upload/announcement/1/uuid.docx",
            "fileSize": 51200,
            "fileExtension": "docx",
            "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "bizType": "announcement",
            "bizId": "1",
            "uploadTime": "2024-01-16T14:20:00",
            "uploadUserId": 1,
            "fileStatus": 1,
            "sortOrder": 2
        }
    ]
}
```

---

## 三、公告查看记录API

### 3.1 创建公告查看记录

**接口地址**：`POST /announcement-view-record`

**接口描述**：记录用户查看公告的行为，同时更新公告的查看次数

**请求头**：
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |
| announcementTitle | String | 否 | 公告标题 |
| caseId | Long | 否 | 案件ID |
| caseName | String | 否 | 案件名称 |
| viewerId | Long | 否 | 查看人ID |
| viewerName | String | 否 | 查看人姓名 |
| viewerType | String | 否 | 查看人类型 |
| ipAddress | String | 否 | IP地址 |
| userAgent | String | 否 | 用户代理 |
| viewDuration | Integer | 否 | 查看时长(秒) |
| deviceType | String | 否 | 设备类型 |
| browserType | String | 否 | 浏览器类型 |
| osType | String | 否 | 操作系统类型 |
| location | String | 否 | 地理位置 |

**请求示例**：
```json
{
    "announcementId": 1,
    "announcementTitle": "关于召开债权人会议的公告",
    "caseId": 1001,
    "caseName": "XX公司破产清算案",
    "viewerId": 10,
    "viewerName": "李四",
    "viewerType": "CREDITOR",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "viewDuration": 120,
    "deviceType": "PC",
    "browserType": "Chrome",
    "osType": "Windows",
    "location": "北京市朝阳区"
}
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1001,
        "announcementId": 1,
        "announcementTitle": "关于召开债权人会议的公告",
        "caseId": 1001,
        "caseName": "XX公司破产清算案",
        "viewerId": 10,
        "viewerName": "李四",
        "viewerType": "CREDITOR",
        "viewTime": "2024-01-16T15:30:00",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "viewDuration": 120,
        "deviceType": "PC",
        "browserType": "Chrome",
        "osType": "Windows",
        "location": "北京市朝阳区",
        "createTime": "2024-01-16T15:30:00"
    }
}
```

---

### 3.2 获取公告查看记录详情

**接口地址**：`GET /announcement-view-record/{recordId}`

**接口描述**：根据记录ID获取查看记录详情

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordId | Long | 是 | 记录ID |

**请求示例**：
```
GET /announcement-view-record/1001
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1001,
        "announcementId": 1,
        "announcementTitle": "关于召开债权人会议的公告",
        "caseId": 1001,
        "caseName": "XX公司破产清算案",
        "viewerId": 10,
        "viewerName": "李四",
        "viewerType": "CREDITOR",
        "viewTime": "2024-01-16T15:30:00",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "viewDuration": 120,
        "deviceType": "PC",
        "browserType": "Chrome",
        "osType": "Windows",
        "location": "北京市朝阳区",
        "createTime": "2024-01-16T15:30:00"
    }
}
```

---

### 3.3 获取公告查看记录列表

**接口地址**：`GET /announcement-view-record/list`

**接口描述**：分页获取查看记录列表，支持多条件筛选

**请求参数**：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| size | Integer | 否 | 10 | 每页大小 |
| announcementId | Long | 否 | - | 公告ID（筛选） |
| caseId | Long | 否 | - | 案件ID（筛选） |
| viewerId | Long | 否 | - | 查看人ID（筛选） |

**请求示例**：
```
GET /announcement-view-record/list?page=1&size=10&announcementId=1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1001,
            "announcementId": 1,
            "announcementTitle": "关于召开债权人会议的公告",
            "caseId": 1001,
            "caseName": "XX公司破产清算案",
            "viewerId": 10,
            "viewerName": "李四",
            "viewerType": "CREDITOR",
            "viewTime": "2024-01-16T15:30:00",
            "ipAddress": "192.168.1.100",
            "userAgent": "Mozilla/5.0...",
            "viewDuration": 120,
            "deviceType": "PC",
            "browserType": "Chrome",
            "osType": "Windows",
            "location": "北京市朝阳区",
            "createTime": "2024-01-16T15:30:00"
        }
    ]
}
```

---

### 3.4 获取公告查看次数

**接口地址**：`GET /announcement-view-record/count/announcement/{announcementId}`

**接口描述**：根据公告ID获取该公告的总查看次数

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求示例**：
```
GET /announcement-view-record/count/announcement/1
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": 150
}
```

---

### 3.5 获取案件公告查看次数

**接口地址**：`GET /announcement-view-record/count/case/{caseId}`

**接口描述**：根据案件ID获取该案件所有公告的总查看次数

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Long | 是 | 案件ID |

**请求示例**：
```
GET /announcement-view-record/count/case/1001
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": 500
}
```

---

### 3.6 获取用户查看次数

**接口地址**：`GET /announcement-view-record/count/viewer/{viewerId}`

**接口描述**：根据用户ID获取该用户查看公告的总次数

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| viewerId | Long | 是 | 查看人ID |

**请求示例**：
```
GET /announcement-view-record/count/viewer/10
```

**响应示例**：
```json
{
    "code": 200,
    "message": "success",
    "data": 25
}
```

---

### 3.7 删除公告查看记录

**接口地址**：`DELETE /announcement-view-record/{recordId}`

**接口描述**：删除指定的查看记录

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordId | Long | 是 | 记录ID |

**请求示例**：
```
DELETE /announcement-view-record/1001
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

## 四、数据字典

### 4.1 公告状态(status)

| 值 | 说明 |
|----|------|
| DRAFT | 草稿 |
| PUBLISHED | 已发布 |

### 4.2 公告类型(announcementType)

| 值 | 说明 |
|----|------|
| MEETING | 债权人会议公告 |
| CLAIM | 债权申报公告 |
| AUCTION | 拍卖公告 |
| OTHER | 其他公告 |

### 4.3 查看人类型(viewerType)

| 值 | 说明 |
|----|------|
| ADMIN | 管理员 |
| MANAGER | 管理人 |
| CREDITOR | 债权人 |
| DEBTOR | 债务人 |
| OTHER | 其他 |

### 4.4 设备类型(deviceType)

| 值 | 说明 |
|----|------|
| PC | 电脑 |
| MOBILE | 手机 |
| TABLET | 平板 |

---

## 五、错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token失效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 六、注意事项

1. 所有需要认证的接口都需要在请求头中携带`Authorization: Bearer {token}`
2. 文件上传接口需要使用`multipart/form-data`格式
3. 日期时间格式为ISO 8601标准：`yyyy-MM-ddTHH:mm:ss`
4. 分页参数从1开始计数
5. 创建查看记录时会自动更新对应公告的`viewCount`字段
