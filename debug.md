## 临时文件上传接口文档
### 业务流程说明
```
1. PC端点击"上传文件" → 调用创建Token接
口
2. 后端返回Token和二维码内容 → PC端展示
二维码
3. 手机扫描二维码 → 获取Token
4. 手机选择文件上传 → 调用手机上传接口
（携带Token）
5. PC端轮询或WebSocket获取已上传文件列
表
6. PC端提交业务表单 → 调用转移接口将文件
关联到业务
```
### 1. 创建临时上传Token
接口 : POST /api/v1/temp-upload/token

用途 : PC端在打开上传弹窗时调用，获取Token和二维码内容

请求参数 :

```
{
  "bizType": "DOCUMENT",      // 业
  务类型，如：DOCUMENT(文书)、
  CASE_PROGRESS(案件流程)等
  "description": "文书上传",   // 
  Token描述，可选
  "expireMinutes": 30         // 过
  期时间（分钟），默认30分钟，可选
}
```
响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "token": 
    "TEMP550E8400E29B41D4A7164466554
    40000",
    "bizType": "DOCUMENT",
    "userId": 1,
    "expireTime": 
    "2026-02-04T17:00:00",
    "status": "ACTIVE",
    "fileCount": 0,
    "description": "文书上传",
    "createTime": 
    "2026-02-04T16:30:00",
    "qrCodeContent": "http://
    localhost:8080/api/v1/
    temp-upload/mobile?
    token=TEMP550E8400E29B41D4A71644
    6655440000"
  }
}
```
前端使用 : 使用 qrCodeContent 生成二维码展示给用户扫描

### 2. 获取Token信息
接口 : GET /api/v1/temp-upload/token/{token}

用途 : 查询Token的详细信息和已上传文件数量

响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "token": 
    "TEMP550E8400E29B41D4A7164466554
    40000",
    "bizType": "DOCUMENT",
    "userId": 1,
    "expireTime": 
    "2026-02-04T17:00:00",
    "status": "ACTIVE",
    "fileCount": 2,
    "description": "文书上传",
    "createTime": 
    "2026-02-04T16:30:00"
  }
}
```
### 3. 验证Token是否有效
接口 : GET /api/v1/temp-upload/token/{token}/validate

用途 : 手机端扫码后验证Token是否可用

响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": true   // true-有效，
  false-无效或过期
}
```
### 4. 获取Token下的文件列表
接口 : GET /api/v1/temp-upload/token/{token}/files

用途 : PC端轮询获取手机已上传的文件列表

响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "originalFileName": "合同.
      pdf",
      "fileSize": 1024576,
      "fileExtension": "pdf",
      "mimeType": "application/pdf",
      "description": "主合同文件",
      "uploadTime": 
      "2026-02-04T16:35:00",
      "token": 
      "TEMP550E8400E29B41D4A71644665
      5440000"
    },
    {
      "id": 102,
      "originalFileName": "附件.
      jpg",
      "fileSize": 204800,
      "fileExtension": "jpg",
      "mimeType": "image/jpeg",
      "description": null,
      "uploadTime": 
      "2026-02-04T16:36:00",
      "token": 
      "TEMP550E8400E29B41D4A71644665
      5440000"
    }
  ]
}
```
### 5. 手机端上传文件（通过Token）
接口 : POST /api/v1/temp-upload/mobile/upload

用途 : 手机端上传单个文件

请求参数 (multipart/form-data):

```
token: 
TEMP550E8400E29B41D4A716446655440000
   // Token
file: (二进制文
件)                              // 
文件
description: 文件描
述                           // 可选
```
响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 103,
    "originalFileName": "新文件.
    docx",
    "fileSize": 51200,
    "fileExtension": "docx",
    "mimeType": "application/vnd.
    openxmlformats-officedocument.
    wordprocessingml.document",
    "description": "补充材料",
    "uploadTime": 
    "2026-02-04T16:40:00",
    "token": 
    "TEMP550E8400E29B41D4A7164466554
    40000"
  }
}
```
### 6. 手机端批量上传文件（通过Token）
接口 : POST /api/v1/temp-upload/mobile/upload-batch

用途 : 手机端同时上传多个文件

请求参数 (multipart/form-data):

```
token: 
TEMP550E8400E29B41D4A716446655440000
   // Token
files: (二进制文件
1)                            // 文
件列表
files: (二进制文件2)
descriptions: 文件1描
述                         // 描述列
表（与文件顺序对应）
descriptions: 文件2描述
```
响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 104,
      "originalFileName": "文件1.
      pdf",
      "fileSize": 102400,
      "fileExtension": "pdf",
      "mimeType": "application/pdf",
      "description": "文件1描述",
      "uploadTime": 
      "2026-02-04T16:45:00",
      "token": 
      "TEMP550E8400E29B41D4A71644665
      5440000"
    },
    {
      "id": 105,
      "originalFileName": "文件2.
      jpg",
      "fileSize": 204800,
      "fileExtension": "jpg",
      "mimeType": "image/jpeg",
      "description": "文件2描述",
      "uploadTime": 
      "2026-02-04T16:45:00",
      "token": 
      "TEMP550E8400E29B41D4A71644665
      5440000"
    }
  ]
}
```
### 7. 转移临时文件到业务
接口 : POST /api/v1/temp-upload/transfer

用途 : PC端提交业务表单后，将Token关联的文件转移到真实业务下

请求参数 :

```
{
  "token": 
  "TEMP550E8400E29B41D4A716446655440
  000",  // 临时Token
  "bizType": 
  "DOCUMENT",                       
         // 业务类型
  "bizId": 
  "10086"                           
           // 业务ID（新建业务后返回的
  ID）
}
```
响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "originalFileName": "合同.
      pdf",
      "fileSize": 1024576,
      "fileExtension": "pdf",
      "mimeType": "application/pdf",
      "description": "主合同文件",
      "uploadTime": 
      "2026-02-04T16:35:00",
      "token": 
      "TEMP550E8400E29B41D4A71644665
      5440000"
    }
  ]
}
```
注意 : 转移成功后，Token状态会变为 USED ，文件将关联到指定的业务ID下

### 8. 取消Token
接口 : DELETE /api/v1/temp-upload/token/{token}

用途 : 用户取消上传或关闭弹窗时调用，清理临时文件

响应示例 :

```
{
  "code": 200,
  "message": "success",
  "data": null
}
```
## 前端完整使用示例
### PC端代码示例
```
// 1. 打开上传弹窗时创建Token
async function openUploadModal
(bizType) {
  const res = await fetch('/api/v1/
  temp-upload/token', {
    method: 'POST',
    headers: { 'Content-Type': 
    'application/json' },
    body: JSON.stringify({
      bizType: bizType,  // 如 
      'DOCUMENT'
      description: '上传文件'
    })
  });
  const { data } = await res.json();
  
  // 显示二维码
  showQRCode(data.qrCodeContent);
  
  // 保存Token用于后续操作
  this.currentToken = data.token;
  
  // 开始轮询获取文件列表
  this.startPolling(data.token);
}

// 2. 轮询获取已上传文件
async function startPolling(token) {
  this.pollingTimer = setInterval
  (async () => {
    const res = await fetch(`/api/
    v1/temp-upload/token/${token}/
    files`);
    const { data } = await res.json
    ();
    this.updateFileList(data);
  }, 3000); // 每3秒轮询一次
}

// 3. 提交业务表单后转移文件
async function submitBusinessForm
(formData) {
  // 先创建业务获取业务ID
  const businessRes = await fetch('/
  api/v1/document/create', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  const { data: business } = await 
  businessRes.json();
  
  // 转移文件
  await fetch('/api/v1/temp-upload/
  transfer', {
    method: 'POST',
    headers: { 'Content-Type': 
    'application/json' },
    body: JSON.stringify({
      token: this.currentToken,
      bizType: 'DOCUMENT',
      bizId: business.id.toString()
    })
  });
  
  // 清理
  clearInterval(this.pollingTimer);
}
```
### 手机端代码示例
```
// 扫码后获取Token
const token = extractTokenFromQRCode
(qrCodeContent);

// 验证Token
const validateRes = await fetch(`/
api/v1/temp-upload/token/${token}/
validate`);
const { data: isValid } = await 
validateRes.json();

if (isValid) {
  // 选择文件并上传
  const file = await selectFile();
  const formData = new FormData();
  formData.append('token', token);
  formData.append('file', file);
  formData.append('description', '手
  机上传的文件');
  
  await fetch('/api/v1/temp-upload/
  mobile/upload', {
    method: 'POST',
    body: formData
  });
}
```
## 配置说明
在 application.yml 中可配置：

```
file:
  upload:
    path: 
    C:\law-upload                   
     # 文件存储路径
    temp-token-expire-minutes: 
    30          # Token默认过期时间
    （分钟）
```
## 数据库表
系统会自动创建 tb_temp_upload_token 表，包含以下字段：

- id : 主键
- token : Token字符串（唯一索引）
- biz_type : 业务类型
- user_id : 创建用户ID
- expire_time : 过期时间
- status : 状态（ACTIVE/USED/EXPIRED/CANCELLED）
- file_count : 已上传文件数量
- description : 描述
- create_time : 创建时间
- update_time : 更新时间
