# EasyExcel 功能使用说明

## 一、功能概述

本项目已集成 EasyExcel 功能，提供以下能力：
1. **Excel 导入**：批量导入债权登记数据
2. **Excel 导出**：导出债权登记数据到 Excel 文件
3. **模板下载**：下载标准 Excel 导入模板

## 二、API 接口说明

### 1. 下载 Excel 导入模板

**接口地址：** `GET /api/v1/claim-registration/template`

**请求参数：** 无

**响应：** 直接下载 Excel 文件（`债权登记导入模板.xlsx`）

**前端调用示例：**
```javascript
// 下载模板
function downloadTemplate() {
  window.location.href = '/api/v1/claim-registration/template';
}

// 或使用 axios
async function downloadTemplate() {
  const response = await axios({
    url: '/api/v1/claim-registration/template',
    method: 'GET',
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '债权登记导入模板.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

### 2. EasyExcel 导入债权登记

**接口地址：** `POST /api/v1/claim-registration/import-easy`

**请求参数：**
- `file` (必填)：Excel 文件（FormData）
- `caseId` (必填)：案件 ID

**请求示例：**
```javascript
async function importExcel(file, caseId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caseId', caseId);
  
  const response = await axios.post('/api/v1/claim-registration/import-easy', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "导入完成，成功5条，失败2条",
  "data": {
    "successCount": 5,
    "failCount": 2,
    "errors": [
      {
        "rowNum": 3,
        "errorMsg": "债权人名称不能为空",
        "creditorName": "张三"
      },
      {
        "rowNum": 7,
        "errorMsg": "总金额必须大于0",
        "creditorName": "李四"
      }
    ]
  }
}
```

### 3. 导出债权登记到 Excel

**接口地址：** `GET /api/v1/claim-registration/export`

**请求参数：**
- `caseId` (可选)：案件 ID，用于筛选特定案件的债权登记
- `registrationStatus` (可选)：登记状态（如 PENDING、APPROVED 等）

**响应：** 直接下载 Excel 文件

**前端调用示例：**
```javascript
// 导出所有债权登记
function exportAll() {
  window.location.href = '/api/v1/claim-registration/export';
}

// 导出特定案件的债权登记
function exportByCase(caseId) {
  window.location.href = `/api/v1/claim-registration/export?caseId=${caseId}`;
}

// 导出特定状态的债权登记
function exportByStatus(status) {
  window.location.href = `/api/v1/claim-registration/export?registrationStatus=${status}`;
}

// 导出特定案件和状态的债权登记
function exportByCaseAndStatus(caseId, status) {
  window.location.href = `/api/v1/claim-registration/export?caseId=${caseId}&registrationStatus=${status}`;
}

// 使用 axios 导出
async function exportExcel(caseId, status) {
  const params = {};
  if (caseId) params.caseId = caseId;
  if (status) params.registrationStatus = status;
  
  const response = await axios({
    url: '/api/v1/claim-registration/export',
    method: 'GET',
    params: params,
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = `债权登记表_${new Date().getTime()}.xlsx`;
  link.setAttribute('download', fileName);
  
  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

## 三、Excel 模板字段说明

导入模板包含以下字段（按顺序）：

| 序号 | 字段名称 | 是否必填 | 字段类型 | 说明 |
|------|---------|---------|---------|------|
| 1 | 案件名称 | 否 | 字符串 | 案件名称 |
| 2 | 债务人 | 否 | 字符串 | 债务人名称 |
| 3 | 债权人名称 | **是** | 字符串 | 债权人姓名或企业名称 |
| 4 | 债权人类型 | **是** | 字符串 | 如：个人、企业 |
| 5 | 统一社会信用代码 | 否 | 字符串 | 企业信用代码 |
| 6 | 法定代表人 | 否 | 字符串 | 法人代表姓名 |
| 7 | 送达地址 | 否 | 字符串 | 送达地址 |
| 8 | 代理人姓名 | 否 | 字符串 | 代理人姓名 |
| 9 | 代理人电话 | 否 | 字符串 | 代理人联系电话 |
| 10 | 代理人身份证 | 否 | 字符串 | 代理人身份证号 |
| 11 | 代理人地址 | 否 | 字符串 | 代理人地址 |
| 12 | 账户名称 | 否 | 字符串 | 账户名称 |
| 13 | 债权人银行账号 | 否 | 字符串 | 银行账号 |
| 14 | 开户行 | 否 | 字符串 | 开户银行 |
| 15 | 本金 | 否 | 数字 | 债权本金金额 |
| 16 | 利息 | 否 | 数字 | 债权利息金额 |
| 17 | 违约金 | 否 | 数字 | 违约金金额 |
| 18 | 其他损失 | 否 | 数字 | 其他损失金额 |
| 19 | 总金额 | **是** | 数字 | 债权总金额（必须大于0） |
| 20 | 是否有法院判决 | 否 | 字符串 | 是/否 |
| 21 | 是否有执行 | 否 | 字符串 | 是/否 |
| 22 | 是否有担保 | 否 | 字符串 | 是/否 |
| 23 | 债权性质 | 否 | 字符串 | 债权性质 |
| 24 | 债权类型 | **是** | 字符串 | 债权类型 |
| 25 | 债权事实 | 否 | 字符串 | 债权事实描述 |
| 26 | 债权标识 | 否 | 字符串 | 债权标识 |
| 27 | 证据清单 | 否 | 字符串 | 证据清单 |
| 28 | 证据材料 | 否 | 字符串 | 证据材料 |
| 29 | 证据附件 | 否 | 字符串 | 证据附件 |
| 30 | 登记日期 | 否 | 日期时间 | 格式：yyyy-MM-dd HH:mm:ss |
| 31 | 登记截止日期 | 否 | 日期时间 | 格式：yyyy-MM-dd HH:mm:ss |
| 32 | 材料接收人 | 否 | 字符串 | 材料接收人 |
| 33 | 材料接收日期 | 否 | 日期时间 | 格式：yyyy-MM-dd HH:mm:ss |
| 34 | 材料完整性 | 否 | 字符串 | 材料完整性 |
| 35 | 备注 | 否 | 字符串 | 备注信息 |

## 四、数据验证规则

导入时会进行以下验证：

1. **必填字段验证**
   - 债权人名称：不能为空
   - 债权人类型：不能为空
   - 债权类型：不能为空
   - 总金额：必须大于 0

2. **数据格式验证**
   - 金额字段：必须是有效的数字
   - 日期字段：格式为 `yyyy-MM-dd HH:mm:ss` 或 `yyyy-MM-dd`
   - 布尔字段：支持"是/否"、"yes/no"、"true/false"、"1/0"

3. **错误处理**
   - 单行数据错误不会影响其他行的导入
   - 导入完成后会返回详细的错误信息，包括行号、错误原因和债权人名称

## 五、前端完整实现示例

### Vue.js 示例

```vue
<template>
  <div>
    <el-card>
      <div slot="header">
        <span>债权登记 Excel 导入导出</span>
      </div>
      
      <el-form :inline="true">
        <el-form-item label="案件ID">
          <el-input v-model="caseId" placeholder="请输入案件ID"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
          <el-button type="success" @click="exportExcel">导出数据</el-button>
        </el-form-item>
      </el-form>
      
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
        action="#">
        <el-button slot="trigger" type="warning">选择 Excel 文件</el-button>
        <el-button type="primary" @click="importExcel" :loading="importing">导入</el-button>
      </el-upload>
      
      <el-alert
        v-if="importResult"
        :title="importResult.message"
        :type="importResult.failCount > 0 ? 'warning' : 'success'"
        :closable="false"
        style="margin-top: 20px">
      </el-alert>
      
      <el-table
        v-if="importResult && importResult.errors.length > 0"
        :data="importResult.errors"
        style="margin-top: 20px">
        <el-table-column prop="rowNum" label="行号" width="80"></el-table-column>
        <el-table-column prop="creditorName" label="债权人" width="150"></el-table-column>
        <el-table-column prop="errorMsg" label="错误信息"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ClaimRegistrationExcel',
  data() {
    return {
      caseId: '',
      selectedFile: null,
      importing: false,
      importResult: null
    };
  },
  methods: {
    downloadTemplate() {
      window.location.href = '/api/v1/claim-registration/template';
    },
    
    handleFileChange(file) {
      this.selectedFile = file.raw;
    },
    
    async importExcel() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择 Excel 文件');
        return;
      }
      
      if (!this.caseId) {
        this.$message.warning('请输入案件ID');
        return;
      }
      
      this.importing = true;
      this.importResult = null;
      
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('caseId', this.caseId);
        
        const response = await axios.post('/api/v1/claim-registration/import-easy', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.importResult = response.data.data;
        
        if (this.importResult.failCount === 0) {
          this.$message.success('导入成功！');
        } else {
          this.$message.warning(`导入完成，成功${this.importResult.successCount}条，失败${this.importResult.failCount}条`);
        }
      } catch (error) {
        this.$message.error('导入失败：' + (error.response?.data?.message || error.message));
      } finally {
        this.importing = false;
      }
    },
    
    exportExcel() {
      const url = this.caseId 
        ? `/api/v1/claim-registration/export?caseId=${this.caseId}`
        : '/api/v1/claim-registration/export';
      window.location.href = url;
      this.$message.success('导出成功！');
    }
  }
};
</script>
```

### React 示例

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Upload, Alert, Table, Card, Form, message } from 'antd';

const ClaimRegistrationExcel = () => {
  const [caseId, setCaseId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const downloadTemplate = () => {
    window.location.href = '/api/v1/claim-registration/template';
  };

  const handleFileChange = (info) => {
    if (info.fileList.length > 0) {
      setSelectedFile(info.fileList[0].originFileObj);
    } else {
      setSelectedFile(null);
    }
  };

  const importExcel = async () => {
    if (!selectedFile) {
      message.warning('请先选择 Excel 文件');
      return;
    }

    if (!caseId) {
      message.warning('请输入案件ID');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caseId', caseId);

      const response = await axios.post('/api/v1/claim-registration/import-easy', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(response.data.data);

      if (response.data.data.failCount === 0) {
        message.success('导入成功！');
      } else {
        message.warning(`导入完成，成功${response.data.data.successCount}条，失败${response.data.data.failCount}条`);
      }
    } catch (error) {
      message.error('导入失败：' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  const exportExcel = () => {
    const url = caseId 
      ? `/api/v1/claim-registration/export?caseId=${caseId}`
      : '/api/v1/claim-registration/export';
    window.location.href = url;
    message.success('导出成功！');
  };

  const columns = [
    { title: '行号', dataIndex: 'rowNum', key: 'rowNum', width: 80 },
    { title: '债权人', dataIndex: 'creditorName', key: 'creditorName', width: 150 },
    { title: '错误信息', dataIndex: 'errorMsg', key: 'errorMsg' }
  ];

  return (
    <Card title="债权登记 Excel 导入导出">
      <Form layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item label="案件ID">
          <Input 
            value={caseId} 
            onChange={(e) => setCaseId(e.target.value)} 
            placeholder="请输入案件ID" 
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={downloadTemplate}>下载模板</Button>
          <Button type="primary" onClick={exportExcel}>导出数据</Button>
        </Form.Item>
      </Form>

      <Upload
        beforeUpload={() => false}
        onChange={handleFileChange}
        maxCount={1}
        accept=".xlsx,.xls"
      >
        <Button>选择 Excel 文件</Button>
      </Upload>
      <Button 
        type="primary" 
        onClick={importExcel} 
        loading={importing}
        style={{ marginTop: 10 }}
      >
        导入
      </Button>

      {importResult && (
        <Alert
          message={importResult.message}
          type={importResult.failCount > 0 ? 'warning' : 'success'}
          style={{ marginTop: 20 }}
        />
      )}

      {importResult && importResult.errors.length > 0 && (
        <Table
          dataSource={importResult.errors}
          columns={columns}
          rowKey="rowNum"
          style={{ marginTop: 20 }}
        />
      )}
    </Card>
  );
};

export default ClaimRegistrationExcel;
```

## 六、测试步骤

### 1. 下载模板测试
1. 点击"下载模板"按钮
2. 验证是否成功下载 `债权登记导入模板.xlsx` 文件
3. 打开模板，检查表头是否正确

### 2. 导入测试
1. 打开下载的模板文件
2. 填写测试数据（至少填写必填字段）
3. 保存文件
4. 在前端页面选择该文件
5. 输入案件ID
6. 点击"导入"按钮
7. 检查导入结果：
   - 成功数量
   - 失败数量
   - 错误信息（如果有）

### 3. 导出测试
1. 确保数据库中有债权登记数据
2. 点击"导出数据"按钮
3. 验证是否成功下载 Excel 文件
4. 打开导出的文件，检查数据是否完整

### 4. 错误处理测试
1. 创建一个包含错误数据的 Excel 文件：
   - 缺少必填字段
   - 总金额为0或负数
   - 日期格式错误
2. 尝试导入该文件
3. 验证是否能正确识别并报告错误

## 七、注意事项

1. **文件格式**：只支持 `.xlsx` 和 `.xls` 格式的 Excel 文件
2. **文件大小**：建议单次导入不超过 10,000 条数据
3. **字符编码**：Excel 文件应使用 UTF-8 编码
4. **日期格式**：日期字段支持 `yyyy-MM-dd HH:mm:ss` 和 `yyyy-MM-dd` 两种格式
5. **布尔字段**：支持"是/否"、"yes/no"、"true/false"、"1/0"等多种表示方式
6. **并发导入**：不建议同时进行多个导入操作
7. **数据备份**：导入前建议先导出当前数据作为备份

## 八、常见问题

### Q1: 导入时提示"Excel文件解析失败"
A: 请检查：
- 文件格式是否正确（.xlsx 或 .xls）
- 文件是否损坏
- 文件是否被其他程序占用

### Q2: 导入后某些数据没有成功
A: 请查看返回的错误信息，常见原因：
- 必填字段为空
- 总金额不大于0
- 数据格式不正确

### Q3: 导出的 Excel 文件打开乱码
A: 请确保使用支持 UTF-8 的 Excel 版本（Excel 2016 及以上）

### Q4: 如何批量导入大量数据？
A: 建议分批导入，每批不超过 10,000 条数据

## 九、技术支持

如有问题，请联系技术支持团队或查看项目文档。
