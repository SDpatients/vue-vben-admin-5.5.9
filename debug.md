让我为您整理前端调用文档导出模板相关API的方式：

## 📋 文档导出模板 API 接口汇总
### 基础URL
```
http://192.168.0.151:8080/api/v1
```
### 1. 获取所有模板列表
```
// GET /document-templates
const getTemplates = async () => {
  const response = await fetch
  ('http://192.168.0.151:8080/api/
  v1/document-templates', {
    headers: {
      'Authorization': `Bearer $
      {token}`
    }
  });
  return response.json();
};

// 响应示例
{
  "code": 200,
  "data": [
    {
      "id": 4,
      "templateName": "债权人签到表",
      "templateCode": 
      "CLAIM_CHECKIN_001",
      "templateType": "WORD",
      "description": "描述",
      "filePath": 
      "uploads\\templates\\xxx.
      docx",
      "isDefault": true,
      "status": "ACTIVE",
      "createTime": 
      "2026-03-05T11:00:00"
    }
  ]
}
```
### 2. 获取单个模板详情
```
// GET /document-templates/{id}
const getTemplate = async (id: 
number) => {
  const response = await fetch
  (`http://192.168.0.151:8080/api/
  v1/document-templates/${id}`, {
    headers: {
      'Authorization': `Bearer $
      {token}`
    }
  });
  return response.json();
};
```
### 3. 获取模板详情（包含字段映射）✨推荐
```
// GET /document-templates/{id}/
detail
const getTemplateWithFields = async 
(id: number) => {
  const response = await fetch
  (`http://192.168.0.151:8080/api/
  v1/document-templates/${id}/
  detail`, {
    headers: {
      'Authorization': `Bearer $
      {token}`
    }
  });
  return response.json();
};

// 响应示例
{
  "code": 200,
  "data": {
    "id": 4,
    "templateName": "债权人签到表",
    "templateCode": 
    "CLAIM_CHECKIN_001",
    "templateType": "WORD",
    "filePath": 
    "uploads\\templates\\xxx.docx",
    "isDefault": true,
    "status": "ACTIVE",
    "fields": [
      {
        "id": 1,
        "fieldName": "meetingTime",
        "fieldLabel": "会议时间",
        "fieldType": "DATE",
        "defaultValue": null,
        "sortOrder": 1,
        "isRequired": true
      },
      {
        "id": 2,
        "fieldName": 
        "meetingLocation",
        "fieldLabel": "会议地点",
        "fieldType": "TEXT",
        "defaultValue": null,
        "sortOrder": 2,
        "isRequired": false
      }
    ]
  }
}
```
### 4. 获取模板字段列表
```
// GET /document-templates/{id}/
fields
const getTemplateFields = async 
(id: number) => {
  const response = await fetch
  (`http://192.168.0.151:8080/api/
  v1/document-templates/${id}/
  fields`, {
    headers: {
      'Authorization': `Bearer $
      {token}`
    }
  });
  return response.json();
};
```
### 5. 上传模板文件
```
// POST /document-templates/{id}/
upload
const uploadTemplateFile = async 
(id: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch
  (`http://192.168.0.151:8080/api/
  v1/document-templates/${id}/
  upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer $
      {token}`
    },
    body: formData
  });
  return response.json();
};
```
### 6. 导出Word文档
```
// POST /document-templates/{id}/
export/word
const exportWord = async (id: 
number, data: Record<string, any>, 
fileName?: string) => {
  const response = await fetch
  (`http://192.168.0.151:8080/api/
  v1/document-templates/${id}/
  export/word`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer $
      {token}`,
      'Content-Type': 'application/
      json'
    },
    body: JSON.stringify({
      fileName: fileName || 
      'document',
      data: data  // { 
      "meetingTime": "2026-03-05", 
      "meetingLocation": "会议室A" }
    })
  });
  
  // 下载文件
  const blob = await response.blob
  ();
  const url = window.URL.
  createObjectURL(blob);
  const a = document.createElement
  ('a');
  a.href = url;
  a.download = `${fileName || 
  'document'}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```
### 7. 完整的前端服务示例
```
// documentTemplateService.ts
const BASE_URL = 'http://192.168.0.
151:8080/api/v1';

const getHeaders = (token: string) 
=> ({
  'Authorization': `Bearer ${token}
  `,
  'Content-Type': 'application/json'
});

export const 
documentTemplateService = {
  // 获取所有模板
  getAll: async (token: string) => {
    const res = await fetch(`$
    {BASE_URL}/document-templates`, 
    {
      headers: { 'Authorization': 
      `Bearer ${token}` }
    });
    return res.json();
  },

  // 获取模板详情（含字段）
  getDetail: async (id: number, 
  token: string) => {
    const res = await fetch(`$
    {BASE_URL}/document-templates/$
    {id}/detail`, {
      headers: { 'Authorization': 
      `Bearer ${token}` }
    });
    return res.json();
  },

  // 上传模板文件
  uploadFile: async (id: number, 
  file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`$
    {BASE_URL}/document-templates/$
    {id}/upload`, {
      method: 'POST',
      headers: { 'Authorization': 
      `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },

  // 导出Word
  exportWord: async (id: number, 
  data: Record<string, any>, 
  fileName: string, token: string) 
  => {
    const res = await fetch(`$
    {BASE_URL}/document-templates/$
    {id}/export/word`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ 
      fileName, data })
    });
    const blob = await res.blob();
    const url = window.URL.
    createObjectURL(blob);
    const a = document.createElement
    ('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // 导出PDF
  exportPdf: async (id: number, 
  data: Record<string, any>, 
  fileName: string, token: string) 
  => {
    const res = await fetch(`$
    {BASE_URL}/document-templates/$
    {id}/export/pdf`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ 
      fileName, data })
    });
    const blob = await res.blob();
    const url = window.URL.
    createObjectURL(blob);
    const a = document.createElement
    ('a');
    a.href = url;
    a.download = `${fileName}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
```
### 📊 数据表结构对应
数据库字段 API返回字段 说明 id id 主键 template_name templateName 模板名称 template_code templateCode 模板编码 template_type templateType 类型(WORD/EXCEL) description description 描述 file_path filePath 上传文件路径 config_json configJson 配置JSON is_default isDefault 是否默认 status status 状态 create_time createTime 创建时间 update_time updateTime 更新时间
