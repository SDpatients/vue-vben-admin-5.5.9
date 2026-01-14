# 案件公告API文档

## 1. 案件公告管理API

### 1.1 创建案件公告

**API端点URL**: `http://localhost:8080/api/v1/case-announcement`
**请求方法**: POST
**功能描述**: 创建新的案件公告

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |
| Authorization | string | 是 | Bearer + 访问令牌 |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| caseId | Long | 是 | 案件ID |
| title | String | 是 | 公告标题，最大长度200 |
| content | String | 是 | 公告内容，支持HTML |
| announcementType | String | 是 | 公告类型，如：ANNOUNCEMENT（公告）、NOTICE（通知）、WARNING（警告） |
| attachments | String | 否 | 附件JSON字符串，格式：[{"fileName": "文件名", "fileUrl": "文件URL", "fileType": "文件类型"}] |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "announcementId": 1
  }
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

**错误码说明**:
| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数格式错误，请检查JSON格式 |
| 401 | 用户名或密码错误 |
| 403 | 没有权限执行此操作 |

**示例请求**:
```json
{
  "caseId": 1,
  "title": "关于北京某科技有限公司破产清算案的债权申报公告",
  "content": "根据《中华人民共和国企业破产法》相关规定，现就北京某科技有限公司破产清算案债权申报事宜公告如下：...",
  "announcementType": "ANNOUNCEMENT"
}
```

### 1.2 获取案件公告列表

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/list`
**请求方法**: GET
**功能描述**: 获取案件公告列表，支持分页和筛选

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| pageNum | Integer | 否 | 页码，默认值：1 |
| pageSize | Integer | 否 | 每页大小，默认值：10 |
| caseId | Long | 否 | 案件ID，用于筛选特定案件的公告 |
| status | String | 否 | 公告状态，用于筛选特定状态的公告，如：DRAFT（草稿）、PUBLISHED（已发布） |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "caseId": 1,
        "title": "关于北京某科技有限公司破产清算案的债权申报公告",
        "content": "根据《中华人民共和国企业破产法》相关规定...",
        "announcementType": "ANNOUNCEMENT",
        "status": "PUBLISHED",
        "publisherId": 2,
        "publisherName": "张律师",
        "publishTime": "2024-01-16T10:00:00",
        "viewCount": 150,
        "isTop": true,
        "topExpireTime": "2024-02-16T10:00:00",
        "attachments": null,
        "createTime": "2024-01-15T09:00:00",
        "updateTime": "2024-01-16T10:00:00"
      }
    ]
  }
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 1.3 获取公告详情

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/{announcementId}`
**请求方法**: GET
**功能描述**: 根据公告ID获取公告详情

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "caseId": 1,
    "title": "关于北京某科技有限公司破产清算案的债权申报公告",
    "content": "根据《中华人民共和国企业破产法》相关规定...",
    "announcementType": "ANNOUNCEMENT",
    "status": "PUBLISHED",
    "publisherId": 2,
    "publisherName": "张律师",
    "publishTime": "2024-01-16T10:00:00",
    "viewCount": 150,
    "isTop": true,
    "topExpireTime": "2024-02-16T10:00:00",
    "attachments": null,
    "createTime": "2024-01-15T09:00:00",
    "updateTime": "2024-01-16T10:00:00"
  }
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | 未授权访问 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

### 1.4 更新案件公告

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/{announcementId}`
**请求方法**: PUT
**功能描述**: 更新案件公告信息

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| title | String | 否 | 公告标题，最大长度200 |
| content | String | 否 | 公告内容，支持HTML |
| announcementType | String | 否 | 公告类型 |
| attachments | String | 否 | 附件JSON字符串 |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 更新成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

### 1.5 发布公告

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/{announcementId}/publish`
**请求方法**: POST
**功能描述**: 发布案件公告，只有草稿状态的公告才能发布

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| topExpireTime | LocalDateTime | 否 | 置顶过期时间，格式：yyyy-MM-ddTHH:mm:ss |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 发布成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

**错误码说明**:
| 错误码 | 说明 |
|--------|------|
| 400 | 只有草稿状态的公告才能发布 |

### 1.6 置顶公告

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/{announcementId}/top`
**请求方法**: POST
**功能描述**: 置顶案件公告

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| topExpireTime | LocalDateTime | 是 | 置顶过期时间，格式：yyyy-MM-ddTHH:mm:ss |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 置顶成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

### 1.7 删除案件公告

**API端点URL**: `http://localhost:8080/api/v1/case-announcement/{announcementId}`
**请求方法**: DELETE
**功能描述**: 删除案件公告，只有草稿状态的公告才能删除

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 删除成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

**错误码说明**:
| 错误码 | 说明 |
|--------|------|
| 400 | 已发布的公告不能删除 |

## 2. 公告查看记录API

### 2.1 创建公告查看记录

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record`
**请求方法**: POST
**功能描述**: 创建公告查看记录，同时更新公告的查看次数

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |
| announcementTitle | String | 否 | 公告标题 |
| caseId | Long | 否 | 案件ID |
| caseName | String | 否 | 案件名称 |
| viewerId | Long | 否 | 查看人ID |
| viewerName | String | 否 | 查看人姓名 |
| viewerType | String | 否 | 查看人类型，如：ADMIN（管理员）、LAWYER（律师）、CREDITOR（债权人） |
| ipAddress | String | 否 | 查看人IP地址 |
| userAgent | String | 否 | 浏览器User-Agent |
| viewDuration | Integer | 否 | 查看时长（秒），默认值：0 |
| deviceType | String | 否 | 设备类型，如：PC、MOBILE、TABLET |
| browserType | String | 否 | 浏览器类型，如：Chrome、Firefox、Safari |
| osType | String | 否 | 操作系统类型，如：Windows、MacOS、iOS、Android |
| location | String | 否 | 查看人地理位置 |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "announcementId": 1,
    "announcementTitle": "关于北京某科技有限公司破产清算案的债权申报公告",
    "caseId": 1,
    "caseName": "北京某科技有限公司破产清算案",
    "viewerId": 3,
    "viewerName": "李律师",
    "viewerType": "LAWYER",
    "viewTime": "2024-01-18T14:30:00",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "viewDuration": 60,
    "deviceType": "PC",
    "browserType": "Chrome",
    "osType": "Windows",
    "location": "北京市朝阳区",
    "createTime": "2024-01-18T14:30:00",
    "updateTime": "2024-01-18T14:30:00"
  }
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 创建成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

**错误码说明**:
| 错误码 | 说明 |
|--------|------|
| 400 | 公告不存在 |

### 2.2 获取公告查看记录详情

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/{recordId}`
**请求方法**: GET
**功能描述**: 根据记录ID获取公告查看记录详情

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| recordId | Long | 是 | 记录ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "announcementId": 1,
    "announcementTitle": "关于北京某科技有限公司破产清算案的债权申报公告",
    "caseId": 1,
    "caseName": "北京某科技有限公司破产清算案",
    "viewerId": 3,
    "viewerName": "李律师",
    "viewerType": "LAWYER",
    "viewTime": "2024-01-18T14:30:00",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "viewDuration": 60,
    "deviceType": "PC",
    "browserType": "Chrome",
    "osType": "Windows",
    "location": "北京市朝阳区",
    "createTime": "2024-01-18T14:30:00",
    "updateTime": "2024-01-18T14:30:00"
  }
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | 未授权访问 |
| 404 | 记录不存在 |
| 500 | 服务器内部错误 |

### 2.3 获取公告查看记录列表

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/list`
**请求方法**: GET
**功能描述**: 获取公告查看记录列表，支持分页和筛选

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**请求参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| page | Integer | 否 | 页码，默认值：1 |
| size | Integer | 否 | 每页大小，默认值：10 |
| announcementId | Long | 否 | 按公告ID筛选 |
| caseId | Long | 否 | 按案件ID筛选 |
| viewerId | Long | 否 | 按查看人ID筛选 |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "announcementId": 1,
      "announcementTitle": "关于北京某科技有限公司破产清算案的债权申报公告",
      "caseId": 1,
      "caseName": "北京某科技有限公司破产清算案",
      "viewerId": 3,
      "viewerName": "李律师",
      "viewerType": "LAWYER",
      "viewTime": "2024-01-18T14:30:00",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
      "viewDuration": 60,
      "deviceType": "PC",
      "browserType": "Chrome",
      "osType": "Windows",
      "location": "北京市朝阳区",
      "createTime": "2024-01-18T14:30:00",
      "updateTime": "2024-01-18T14:30:00"
    }
  ]
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 2.4 获取公告查看次数

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/count/announcement/{announcementId}`
**请求方法**: GET
**功能描述**: 根据公告ID获取公告的查看次数

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 否 | Bearer + 访问令牌（可选，部分场景可能需要） |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| announcementId | Long | 是 | 公告ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": 150
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 404 | 公告不存在 |
| 500 | 服务器内部错误 |

### 2.5 获取案件公告查看次数

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/count/case/{caseId}`
**请求方法**: GET
**功能描述**: 根据案件ID获取案件所有公告的查看次数

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 否 | Bearer + 访问令牌（可选，部分场景可能需要） |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| caseId | Long | 是 | 案件ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": 200
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 404 | 案件不存在 |
| 500 | 服务器内部错误 |

### 2.6 获取用户查看次数

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/count/viewer/{viewerId}`
**请求方法**: GET
**功能描述**: 根据用户ID获取用户查看公告的次数

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| viewerId | Long | 是 | 用户ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": 50
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 2.7 删除公告查看记录

**API端点URL**: `http://localhost:8080/api/v1/announcement-view-record/{recordId}`
**请求方法**: DELETE
**功能描述**: 根据记录ID删除公告查看记录

**请求头**:
| 头名称 | 类型 | 必选 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer + 访问令牌 |

**路径参数**:
| 参数名 | 数据类型 | 必选 | 说明 |
|--------|----------|------|------|
| recordId | Long | 是 | 记录ID |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**响应状态码**:
| 状态码 | 说明 |
|--------|------|
| 200 | 删除成功 |
| 401 | 未授权访问 |
| 404 | 记录不存在 |
| 500 | 服务器内部错误 |

## 3. 通用响应格式说明

所有API响应均采用统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 响应状态码，200表示成功，其他表示失败 |
| message | String | 响应消息，成功时为"操作成功"，失败时为具体错误信息 |
| data | Object | 响应数据，根据不同API返回不同的数据结构 |

## 4. 错误码列表

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问，请先登录 |
| 403 | 没有权限执行此操作 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 5. 权限说明

| API端点 | 所需权限 |
|----------|----------|
| 创建案件公告 | case:announcement:create |
| 获取案件公告列表 | case:announcement:query |
| 获取公告详情 | case:announcement:query |
| 更新案件公告 | case:announcement:update |
| 发布公告 | case:announcement:publish |
| 置顶公告 | case:announcement:top |
| 删除案件公告 | case:announcement:delete |
| 创建公告查看记录 | case:announcement:view |
| 获取公告查看记录列表 | case:announcement:view:query |
| 删除公告查看记录 | case:announcement:view:delete |

## 6. 数据格式说明

### 6.1 日期时间格式

所有日期时间字段均采用ISO 8601格式：
- 格式：yyyy-MM-ddTHH:mm:ss
- 示例：2024-01-16T10:00:00

### 6.2 附件格式

附件字段为JSON字符串，格式如下：

```json
[
  {
    "fileName": "文件1.pdf",
    "fileUrl": "http://example.com/files/1.pdf",
    "fileType": "pdf"
  },
  {
    "fileName": "文件2.jpg",
    "fileUrl": "http://example.com/files/2.jpg",
    "fileType": "image"
  }
]
```

## 7. 安全注意事项

1. 所有API请求必须携带有效的访问令牌（Authorization头）
2. 敏感操作（如发布公告、删除公告等）需要特定权限
3. 客户端应妥善保管访问令牌，避免泄露
4. 访问令牌有效期为2小时，过期后需重新获取
5. 密码必须通过HTTPS传输，避免明文泄露
6. 客户端应验证服务器返回的状态码和错误信息，妥善处理异常情况

## 8. 测试账号

| 用户名 | 密码 | 角色 | 权限范围 |
|--------|------|------|----------|
| admin | 123456 | 超级管理员 | 所有权限 |
| lawyer01 | 123456 | 律师 | 案件相关权限 |
| staff01 | 123456 | 工作人员 | 查看和部分编辑权限 |

## 9. 联系方式

如有任何问题或建议，请联系：
- 技术负责人：XXX
- 邮箱：XXX@example.com
- 电话：XXX-XXXXXXX

## 10. 版本历史

| 版本 | 更新日期 | 更新内容 |
|------|----------|----------|
| 1.0 | 2026-01-08 | 初始版本，包含案件公告管理和公告查看记录相关API |
