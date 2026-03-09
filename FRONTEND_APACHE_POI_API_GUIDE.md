# Apache POI Word 模板生成 - 前端集成指南

> **文档版本**: v1.0  
> **更新日期**: 2026-03-07  
> **适用对象**: 前端开发人员

---

## 📋 概述

后端基于 **Apache POI 5.2.3** 实现了 Word 文档模板生成和编辑功能，提供了完整的 RESTful API 供前端调用。主要包含两大功能模块：

1. **Word 模板生成** - 基于 Apache POI 动态生成 Word 模板
2. **OnlyOffice 在线编辑** - 集成 OnlyOffice 实现文档在线编辑

---

## 🎯 核心功能

### 1. Word 模板生成

后端使用 Apache POI 动态生成 Word (.docx) 文档模板，支持：
- ✅ 标准数据报告模板
- ✅ 财务报告模板
- ✅ 法律案件报告模板
- ✅ 项目进度报告模板
- ✅ 会议纪要模板
- ✅ 自定义模板

### 2. 模板数据填充

使用 poi-tl 模板引擎将数据填充到 Word 模板中：
- ✅ 文本字段替换
- ✅ 表格数据填充
- ✅ 图表占位符
- ✅ 图片插入

### 3. OnlyOffice 在线编辑

集成 OnlyOffice 实现文档在线编辑：
- ✅ 在线编辑 Word 文档
- ✅ 实时保存
- ✅ 版本管理
- ✅ 协作编辑
- ✅ 文件锁定

---

## 📡 API 接口详解

### 基础信息

- **Base URL**: `http://192.168.0.151:8080/api/v1`
- **认证方式**: JWT Token
- **请求头**: `Authorization: Bearer {token}`
- **Content-Type**: 根据接口要求设置

---

## 一、Word 模板生成 API

### 1.1 生成数据报告模板

**接口**: `POST /api/template/generate/data-report`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateName | String | 是 | 模板名称（不包含扩展名） |

**请求示例**:

```bash
curl -X POST "http://192.168.0.151:8080/api/v1/api/template/generate/data-report?templateName=my_report" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "templatePath": "templates/my_report_template.docx",
    "templateName": "my_report",
    "message": "数据报告模板生成成功"
  }
}
```

**前端使用示例**:

```javascript
async function generateDataReportTemplate(templateName) {
  const response = await fetch(
    `/api/v1/api/template/generate/data-report?templateName=${templateName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    }
  );
  
  const result = await response.json();
  
  if (result.code === 200) {
    console.log('模板生成成功:', result.data.templatePath);
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 使用
generateDataReportTemplate('my_report');
```

---

### 1.2 生成自定义模板

**接口**: `POST /api/template/generate/custom`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateName | String | 是 | 模板名称 |
| title | String | 是 | 模板标题 |
| sections | String[] | 是 | 章节数组 |

**请求示例**:

```bash
curl -X POST "http://192.168.0.151:8080/api/v1/api/template/generate/custom" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "custom_report",
    "title": "我的自定义报告",
    "sections": ["第一章：项目概述", "第二章：实施进度", "第三章：成果展示"]
  }'
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "templatePath": "templates/custom_report_template.docx",
    "templateName": "custom_report",
    "message": "自定义模板生成成功"
  }
}
```

**前端使用示例**:

```javascript
async function generateCustomTemplate(templateName, title, sections) {
  const response = await fetch(
    '/api/v1/api/template/generate/custom',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateName,
        title,
        sections
      })
    }
  );
  
  const result = await response.json();
  return result.data;
}

// 使用
generateCustomTemplate(
  'project_report',
  '项目进度报告',
  ['第一章：项目概述', '第二章：实施进度', '第三章：成果展示']
);
```

---

### 1.3 填充模板数据

**接口**: `POST /api/template/fill`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templatePath | String | 是 | 模板文件路径（URL 参数） |
| 请求体 | Object | 是 | 模板数据（键值对） |

**请求示例**:

```bash
curl -X POST "http://192.168.0.151:8080/api/v1/api/template/fill?templatePath=templates/my_report_template.docx" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "reportTitle": "2024 年度数据分析报告",
    "reportNo": "RPT-2024-001",
    "reportDate": "2024-03-07",
    "company": "某某科技公司",
    "creator": "张三",
    "summary": "本年度公司业务保持稳健增长态势..."
  }'
```

**响应**: 返回填充后的 Word 文档（二进制流）

**响应头**:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="filled_template.docx"
```

**前端使用示例**:

```javascript
async function fillTemplateWithData(templatePath, data) {
  const response = await fetch(
    `/api/v1/api/template/fill?templatePath=${encodeURIComponent(templatePath)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
  
  if (!response.ok) {
    throw new Error('填充失败');
  }
  
  // 返回 Blob 对象
  const blob = await response.blob();
  return blob;
}

// 使用示例
async function downloadFilledReport() {
  const templatePath = 'templates/my_report_template.docx';
  
  const data = {
    reportTitle: '2024 年度报告',
    reportNo: 'RPT-2024-001',
    reportDate: '2024-03-07',
    company: '某某科技',
    creator: '张三',
    summary: '报告摘要内容...'
  };
  
  const blob = await fillTemplateWithData(templatePath, data);
  
  // 下载文件
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filled_report.docx';
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

### 1.4 导出示例报告

**接口**: `POST /api/template/export/sample`

**请求参数**: 无

**请求示例**:

```bash
curl -X POST "http://192.168.0.151:8080/api/v1/api/template/export/sample" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应**: Word 文档（二进制流）

**前端使用示例**:

```javascript
async function exportSampleReport() {
  const response = await fetch(
    '/api/v1/api/template/export/sample',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    }
  );
  
  const blob = await response.blob();
  
  // 下载
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_report.docx';
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

### 1.5 生成模板并填充数据

**接口**: `POST /api/template/generate-and-fill`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateType | String | 是 | 模板类型（URL 参数） |
| 请求体 | Object | 是 | 模板数据 |

**templateType 可选值**:
- `legal` - 法律案件报告
- `project` - 项目进度报告
- `meeting` - 会议纪要
- 其他 - 默认数据报告

**请求示例**:

```bash
curl -X POST "http://192.168.0.151:8080/api/v1/api/template/generate-and-fill?templateType=legal" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "caseNo": "CASE-2024-001",
    "caseType": "民事案件",
    "filingDate": "2024-01-15",
    "lawyer": "李律师",
    "status": "审理中"
  }'
```

**响应**: Word 文档（二进制流）

**前端使用示例**:

```javascript
async function generateAndFillTemplate(templateType, data) {
  const response = await fetch(
    `/api/v1/api/template/generate-and-fill?templateType=${templateType}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
  
  const blob = await response.blob();
  return blob;
}

// 使用示例
async function downloadLegalReport() {
  const data = {
    caseNo: 'CASE-2024-001',
    caseType: '民事案件',
    filingDate: '2024-01-15',
    lawyer: '李律师',
    status: '审理中'
  };
  
  const blob = await generateAndFillTemplate('legal', data);
  
  // 下载
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'legal_report.docx';
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

### 1.6 获取示例数据

**接口**: `GET /api/template/sample-data`

**请求参数**: 无

**请求示例**:

```bash
curl -X GET "http://192.168.0.151:8080/api/v1/api/template/sample-data" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reportTitle": "2024 年度数据分析报告",
    "reportNo": "RPT-2024-001",
    "reportDate": "2024-03-07",
    "company": "某某科技公司",
    "creator": "张三",
    "reviewer": "李四",
    "reportType": "年度报告",
    "summary": "本报告详细分析了 2024 年度的各项业务数据...",
    "conclusion": "基于以上数据分析，我们建议..."
  }
}
```

**前端使用示例**:

```javascript
async function getSampleData() {
  const response = await fetch(
    '/api/v1/api/template/sample-data',
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    }
  );
  
  const result = await response.json();
  return result.data;
}

// 使用
const sampleData = await getSampleData();
console.log('示例数据:', sampleData);
```

---

### 1.7 清理临时模板

**接口**: `DELETE /api/template/cleanup`

**请求参数**: 无

**请求示例**:

```bash
curl -X DELETE "http://192.168.0.151:8080/api/v1/api/template/cleanup" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": "临时模板清理完成"
}
```

---

## 二、文件管理 API

### 2.1 文件上传

**接口**: `POST /file/upload`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 文件对象 |
| bizType | String | 是 | 业务类型 |
| bizId | String | 是 | 业务 ID |

**请求示例**:

```javascript
async function uploadFile(file, bizType, bizId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', bizType);
  formData.append('bizId', bizId);
  
  const response = await fetch('/api/v1/file/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });
  
  const result = await response.json();
  return result.data;
}

// 使用示例
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

uploadFile(file, 'CASE_DOCUMENT', 'case-123')
  .then(fileInfo => {
    console.log('文件上传成功:', fileInfo);
    console.log('文件 ID:', fileInfo.id);
    console.log('文件路径:', fileInfo.filePath);
  });
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 123,
    "originalFileName": "合同.docx",
    "storedFileName": "uuid_contract.docx",
    "filePath": "C:\\law-upload\\2024\\03\\uuid_contract.docx",
    "fileSize": 102400,
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "bizType": "CASE_DOCUMENT",
    "bizId": "case-123",
    "status": "ACTIVE",
    "createTime": "2024-03-07T10:00:00"
  }
}
```

---

### 2.2 文件下载

**接口**: `GET /file/download/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**请求示例**:

```javascript
async function downloadFile(fileId) {
  const response = await fetch(`/api/v1/file/download/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const blob = await response.blob();
  
  // 下载文件
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.docx';
  a.click();
  window.URL.revokeObjectURL(url);
}

// 使用
downloadFile(123);
```

**响应**: 文件二进制流

---

### 2.3 获取文件信息

**接口**: `GET /file/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**请求示例**:

```bash
curl -X GET "http://192.168.0.151:8080/api/v1/file/123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 123,
    "originalFileName": "合同.docx",
    "storedFileName": "uuid_contract.docx",
    "filePath": "C:\\law-upload\\2024\\03\\uuid_contract.docx",
    "fileSize": 102400,
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "bizType": "CASE_DOCUMENT",
    "bizId": "case-123",
    "status": "ACTIVE"
  }
}
```

---

### 2.4 文件列表（分页）

**接口**: `GET /file/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| pageNum | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页大小 |
| bizType | String | 否 | - | 业务类型 |
| bizId | String | 否 | - | 业务 ID |
| status | String | 否 | - | 状态 |

**请求示例**:

```javascript
async function getFileList(pageNum = 1, pageSize = 10, filters = {}) {
  const params = new URLSearchParams({
    pageNum: pageNum.toString(),
    pageSize: pageSize.toString(),
    ...filters
  });
  
  const response = await fetch(`/api/v1/file/list?${params}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  return result.data;
}

// 使用示例
getFileList(1, 10, { bizType: 'CASE_DOCUMENT', bizId: 'case-123' })
  .then(data => {
    console.log('文件列表:', data.list);
    console.log('总数:', data.total);
    console.log('页码:', data.pageNum);
  });
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": 123,
        "originalFileName": "合同.docx",
        "storedFileName": "uuid_contract.docx",
        "fileSize": 102400,
        "createTime": "2024-03-07T10:00:00"
      }
    ],
    "total": 15,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 2
  }
}
```

---

## 三、OnlyOffice 集成 API

### 3.1 获取 OnlyOffice 配置

**接口**: `GET /onlyoffice/config/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**请求示例**:

```javascript
async function getOnlyOfficeConfig(fileId) {
  const response = await fetch(`/api/v1/onlyoffice/config/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  return result.data;
}

// 使用示例
const config = await getOnlyOfficeConfig(123);
console.log('OnlyOffice 配置:', config);
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "document": {
      "fileType": "docx",
      "key": "uuid_contract.docx",
      "title": "合同.docx",
      "url": "http://192.168.0.151:8080/api/v1/file/download/123",
      "permissions": {
        "edit": true,
        "download": true,
        "print": true,
        "copy": true
      }
    },
    "documentType": "word",
    "editorConfig": {
      "callbackUrl": "http://192.168.0.151:8080/api/v1/onlyoffice/callback?fileId=123",
      "user": {
        "id": "1",
        "name": "张三"
      },
      "customization": {
        "autosave": true,
        "forcesave": true,
        "trackChanges": true
      }
    }
  }
}
```

**前端集成 OnlyOffice 完整示例**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OnlyOffice 文档编辑</title>
  <script src="http://localhost:8081/web-apps/apps/api/documents/api.js"></script>
  <style>
    #editor { height: 600px; }
  </style>
</head>
<body>
  <div id="editor"></div>
  
  <script>
    async function initOnlyOffice(fileId) {
      // 1. 获取配置
      const response = await fetch(`/api/v1/onlyoffice/config/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const result = await response.json();
      const config = result.data;
      
      // 2. 初始化编辑器
      const docEditor = new DocsAPI.DocEditor("editor", config);
      
      // 3. 监听事件
      docEditor.onRequestEditRights(function() {
        console.log('请求编辑权限');
      });
      
      docEditor.onRequestSaveAs(function(event) {
        console.log('请求另存为:', event.data);
      });
      
      return docEditor;
    }
    
    // 使用示例
    initOnlyOffice(123);
  </script>
</body>
</html>
```

---

### 3.2 锁定文件

**接口**: `POST /onlyoffice/lock/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**请求示例**:

```javascript
async function lockFile(fileId) {
  const response = await fetch(`/api/v1/onlyoffice/lock/${fileId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  return result;
}

// 使用
lockFile(123).then(() => {
  console.log('文件已锁定');
});
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

---

### 3.3 解锁文件

**接口**: `POST /onlyoffice/unlock/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**请求示例**:

```javascript
async function unlockFile(fileId) {
  const response = await fetch(`/api/v1/onlyoffice/unlock/${fileId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  return result;
}

// 使用
unlockFile(123).then(() => {
  console.log('文件已解锁');
});
```

---

### 3.4 获取编辑历史

**接口**: `GET /onlyoffice/history/{fileId}`

**请求参数**:

| 参数名 | 类型 | 位置 | 说明 |
|--------|------|------|------|
| fileId | Long | URL 路径 | 文件 ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "history": [
      {
        "version": 1,
        "editor": "张三",
        "editTime": "2024-03-07T10:00:00",
        "changes": "创建了文档"
      },
      {
        "version": 2,
        "editor": "李四",
        "editTime": "2024-03-07T14:30:00",
        "changes": "修改了第 3 章内容"
      }
    ]
  }
}
```

---

## 四、模板变量说明

### 4.1 数据报告模板变量

| 变量名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| reportTitle | String | 是 | 报告标题 | 2024 年度数据分析报告 |
| reportNo | String | 是 | 报告编号 | RPT-2024-001 |
| reportDate | String | 是 | 报告日期 | 2024-03-07 |
| company | String | 是 | 编制单位 | 某某科技公司 |
| creator | String | 是 | 编制人 | 张三 |
| reviewer | String | 是 | 审核人 | 李四 |
| reportType | String | 是 | 报告类型 | 年度报告 |
| summary | String | 否 | 报告摘要 | 本报告详细分析了... |
| conclusion | String | 否 | 结论 | 基于以上数据分析... |
| chart1 | String | 否 | 图表 1 占位符 | [图表：趋势图] |
| chart2 | String | 否 | 图表 2 占位符 | [图表：分布图] |

### 4.2 表格数据变量

格式：`{{data 行_列}}`

| 变量名 | 说明 |
|--------|------|
| {{data1_0}} | 第 1 行第 1 列（序号） |
| {{data1_1}} | 第 1 行第 2 列（指标名称） |
| {{data1_2}} | 第 1 行第 3 列（指标值） |
| {{data1_3}} | 第 1 行第 4 列（同比） |
| {{data1_4}} | 第 1 行第 5 列（环比） |

### 4.3 其他变量

| 变量名 | 说明 |
|--------|------|
| {{attachment1}} | 附件 1 |
| {{attachment2}} | 附件 2 |
| {{attachment3}} | 附件 3 |
| {{page}} | 当前页码 |
| {{totalPages}} | 总页数 |

---

## 五、完整使用流程示例

### 场景 1：生成并下载数据报告

```javascript
// 1. 生成模板
async function generateAndDownloadReport() {
  try {
    // 步骤 1: 生成模板
    const templateResult = await fetch(
      '/api/v1/api/template/generate/data-report?templateName=my_report',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    const templateData = await templateResult.json();
    const templatePath = templateData.data.templatePath;
    
    // 步骤 2: 准备数据
    const reportData = {
      reportTitle: '2024 年度数据分析报告',
      reportNo: 'RPT-2024-001',
      reportDate: '2024-03-07',
      company: '某某科技公司',
      creator: '张三',
      reviewer: '李四',
      reportType: '年度报告',
      summary: '本年度公司业务保持稳健增长态势...',
      conclusion: '建议继续加大市场投入...'
    };
    
    // 步骤 3: 填充模板
    const fillResponse = await fetch(
      `/api/v1/api/template/fill?templatePath=${encodeURIComponent(templatePath)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      }
    );
    
    // 步骤 4: 下载文件
    const blob = await fillResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_report.docx';
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('报告下载成功');
    
  } catch (error) {
    console.error('生成报告失败:', error);
  }
}

// 使用
generateAndDownloadReport();
```

---

### 场景 2：OnlyOffice 在线编辑

```javascript
// React 组件示例
import React, { useEffect, useRef } from 'react';

const OnlyOfficeEditor = ({ fileId }) => {
  const editorRef = useRef(null);
  const editorInstance = useRef(null);

  useEffect(() => {
    const initEditor = async () => {
      try {
        // 1. 获取配置
        const response = await fetch(`/api/v1/onlyoffice/config/${fileId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const result = await response.json();
        const config = result.data;
        
        // 2. 初始化编辑器
        editorInstance.current = new DocsAPI.DocEditor(
          editorRef.current,
          config
        );
        
        // 3. 监听事件
        editorInstance.current.onRequestSaveAs((event) => {
          console.log('另存为:', event.data);
        });
        
      } catch (error) {
        console.error('初始化编辑器失败:', error);
      }
    };
    
    if (fileId) {
      initEditor();
    }
    
    // 清理
    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroyEditor();
      }
    };
  }, [fileId]);

  return (
    <div>
      <h2>文档编辑</h2>
      <div ref={editorRef} style={{ height: '600px' }} />
    </div>
  );
};

export default OnlyOfficeEditor;
```

---

### 场景 3：上传文件并在线编辑

```javascript
async function uploadAndEdit() {
  // 1. 选择文件
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('请选择文件');
    return;
  }
  
  // 2. 上传文件
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', 'CASE_DOCUMENT');
  formData.append('bizId', 'case-123');
  
  const uploadResponse = await fetch('/api/v1/file/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });
  
  const uploadResult = await uploadResponse.json();
  const fileId = uploadResult.data.id;
  
  console.log('文件上传成功，文件 ID:', fileId);
  
  // 3. 打开编辑器
  window.open(`/editor/${fileId}`, '_blank');
}

// HTML
<input type="file" id="fileInput" accept=".docx,.doc,.xlsx,.xls" />
<button onclick="uploadAndEdit()">上传并编辑</button>
```

---

## 六、错误处理

### 常见错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 重新登录获取 token |
| 403 | 无权限 | 检查用户权限 |
| 404 | 资源不存在 | 检查文件 ID 或路径 |
| 500 | 服务器错误 | 联系后端开发人员 |

### 错误处理示例

```javascript
async function safeApiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        // 未授权，跳转登录
        window.location.href = '/login';
        throw new Error('未授权');
      }
      
      if (response.status === 404) {
        throw new Error('资源不存在');
      }
      
      throw new Error(`请求失败：${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(result.message || '操作失败');
    }
    
    return result.data;
    
  } catch (error) {
    console.error('API 调用错误:', error);
    throw error;
  }
}

// 使用
safeApiCall('/api/v1/file/123', {
  headers: {
    'Authorization': `Bearer ${getToken()}`
  }
});
```

---

## 七、最佳实践

### 1. Token 管理

```javascript
// token 存储
function setToken(token) {
  localStorage.setItem('access_token', token);
}

function getToken() {
  return localStorage.getItem('access_token');
}

function removeToken() {
  localStorage.removeItem('access_token');
}

// 请求拦截器
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. 文件下载优化

```javascript
// 使用下载管理器
function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// 使用
const blob = await fetchFile();
downloadFile(blob, 'report.docx');
```

### 3. 大文件上传

```javascript
// 分片上传
async function uploadLargeFile(file) {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', i);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', file.name);
    
    await fetch('/api/v1/file/upload-chunk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
  }
}
```

---

## 八、常见问题

### Q1: 如何获取模板的所有可用变量？

**A**: 调用 `GET /api/v1/api/template/sample-data` 获取示例数据，包含所有可用变量。

### Q2: 填充后的文件如何保存？

**A**: API 返回 Blob 对象，可以使用 `window.URL.createObjectURL()` 下载或上传到服务器。

### Q3: OnlyOffice 编辑器无法加载？

**A**: 
1. 检查 OnlyOffice 服务是否启动
2. 检查网络是否可达
3. 检查 CORS 配置

### Q4: 文件上传失败？

**A**: 
1. 检查文件大小限制
2. 检查文件类型是否允许
3. 检查网络连接

---

## 九、技术支持

- **API 文档**: `/api/doc` (Swagger)
- **后端代码**: `src/main/java/com/lawbackend2/lawbackend2/controller/`
- **OnlyOffice 文档**: https://api.onlyoffice.com/

---

**祝开发顺利！** 🎉
