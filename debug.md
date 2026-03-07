前端需要在调用批量导出接口时，根据 Excel 模板的实际格式传递 headerRow 参数。让我为你提供详细的前端使用指南：

## 📋 前端使用指南
### 1️⃣ 基本调用示例
```
// 场景 1：标准模板（表头在第 1 行）
async function exportStandardExcel
() {
  const response = await fetch('/
  api/v1/document-templates/
  batch-export/excel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/
      json',
      'Authorization': 'Bearer ' + 
      token
    },
    body: JSON.stringify({
      templateId: 7,
      fileName: '债务人批量数据',
      dataList: [
        {
          "序号": 1,
          "债务人名称": "安吉博特汽
          车...",
          "统一社会信用代码": "123123"
        }
      ],
      options: {
        sheetName: '债务人列表',
        startRow: 2,      // 数据从
        第 2 行开始
        headerRow: 1,     // 表头在
        第 1 行（默认值，可不传）
        mergeCells: false,
        addIndex: true
      }
    })
  });
  
  const blob = await response.blob
  ();
  // 下载文件...
}
```
### 2️⃣ 复杂模板调用示例
```
// 场景 2：带标题的模板（表头在第 5 行）
async function exportComplexExcel() 
{
  const response = await fetch('/
  api/v1/document-templates/
  batch-export/excel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/
      json',
      'Authorization': 'Bearer ' + 
      token
    },
    body: JSON.stringify({
      templateId: 8,
      fileName: '债权申报表',
      dataList: [
        {
          "creditor_name": "张三",
          "claim_amount": 100000,
          "reduce_amount": 0,
          "confirm_amount": 100000
        }
      ],
      options: {
        sheetName: 'Sheet1',
        startRow: 6,      // 数据从
        第 6 行开始
        headerRow: 5,     // 表头在
        第 5 行 ⭐ 新增参数
        mergeCells: false,
        addIndex: true
      }
    })
  });
  
  const blob = await response.blob
  ();
  // 下载文件...
}
```
### 3️⃣ Vue/React 组件示例
```
<template>
  <el-button @click="handleExport">
  导出 Excel</el-button>
</template>

<script>
export default {
  methods: {
    async handleExport() {
      // 1. 准备数据
      const dataList = this.
      tableData.map((item, index) 
      => ({
        "序号": index + 1,
        "债权人名称": item.
        creditorName,
        "申报金额": item.claimAmount,
        "核减金额": item.
        reduceAmount,
        "确认金额": item.
        confirmAmount
      }));
      
      // 2. 确定表头位置（根据模板类
      型）
      const templateConfig = {
        'debtor': { headerRow: 1, 
        startRow: 2 },    // 债务人模
        板
        'creditor': { headerRow: 5, 
        startRow: 6 },  // 债权申报模
        板
        'employee': { headerRow: 8, 
        startRow: 9 }   // 职工工资模
        板
      };
      
      const config = templateConfig
      [this.templateType] || { 
      headerRow: 1, startRow: 2 };
      
      // 3. 调用接口
      try {
        const response = await this.
        $axios.post(
          '/document-templates/
          batch-export/excel',
          {
            templateId: this.
            templateId,
            fileName: `${this.
            fileName}_${this.
            formatDate(new Date())}
            `,
            dataList: dataList,
            options: {
              ...config,
              sheetName: this.
              sheetName,
              mergeCells: false,
              addIndex: true
            }
          },
          { responseType: 'blob' }
        );
        
        // 4. 下载文件
        this.downloadFile(response.
        data, `${this.fileName}.
        xlsx`);
      } catch (error) {
        this.$message.error('导出失
        败：' + error.message);
      }
    },
    
    formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth
      () + 1).padStart(2, '0');
      const d = String(date.getDate
      ()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    },
    
    downloadFile(blob, filename) {
      const url = window.URL.
      createObjectURL(blob);
      const link = document.
      createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL
      (url);
    }
  }
}
</script>
```
### 4️⃣ TypeScript 类型定义
```
// types/export.ts
export interface ExportOptions {
  /** 工作表名称 */
  sheetName?: string;
  /** 数据开始行号（从 1 开始），默认 
  2 */
  startRow?: number;
  /** 表头所在行号（从 1 开始），默认 
  1 ⭐ 新增 */
  headerRow?: number;
  /** 是否合并单元格，默认 false */
  mergeCells?: boolean;
  /** 是否添加序号，默认 true */
  addIndex?: boolean;
}

export interface BatchExportRequest 
{
  /** 模板 ID */
  templateId: number;
  /** 文件名 */
  fileName: string;
  /** 数据列表 */
  dataList: Record<string, any>[];
  /** 导出选项 */
  options?: ExportOptions;
}

// 使用示例
const exportRequest: 
BatchExportRequest = {
  templateId: 7,
  fileName: '债权申报表_2026/3/6',
  dataList: [
    { creditor_name: '张三', 
    claim_amount: 100000 }
  ],
  options: {
    headerRow: 5,      // 表头在第 5 
    行
    startRow: 6,       // 数据从第 6 
    行开始
    sheetName: 'Sheet1',
    mergeCells: false,
    addIndex: true
  }
};
```
### 5️⃣ 如何确定表头行号
前端需要根据用户上传的 Excel 模板来确定 headerRow ：

```
// 方法 1：用户上传模板时，前端解析 
Excel 获取表头位置
async function parseExcelTemplate
(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.
      target.result);
      const workbook = XLSX.read
      (data, { type: 'array' });
      const sheet = workbook.Sheets
      [workbook.SheetNames[0]];
      const json = XLSX.utils.
      sheet_to_json(sheet, { 
      header: 1 });
      
      // 找到包含"序号"或"名称"等关键字
      的行
      let headerRow = 1;
      for (let i = 0; i < json.
      length; i++) {
        const row = json[i];
        if (row.some(cell => 
          cell && (cell.includes('序
          号') || cell.includes('名
          称') || cell.includes('金
          额'))
        )) {
          headerRow = i + 1; // 行号
          从 1 开始
          break;
        }
      }
      
      resolve({ headerRow, 
      startRow: headerRow + 1 });
    };
    reader.readAsArrayBuffer(file);
  });
}

// 方法 2：后端存储模板配置
const templateConfigs = {
  'debtor_template': { headerRow: 
  1, startRow: 2 },
  'creditor_template': { headerRow: 
  5, startRow: 6 },
  'employee_template': { headerRow: 
  8, startRow: 9 }
};

// 根据模板类型获取配置
function getTemplateConfig
(templateType) {
  return templateConfigs
  [templateType] || { headerRow: 1, 
  startRow: 2 };
}
```
### 6️⃣ 完整的前端封装函数
```
/**
 * 批量导出 Excel
 * @param {Object} params - 导出参数
 * @param {number} params.
 templateId - 模板 ID
 * @param {string} params.fileName 
 - 文件名
 * @param {Array} params.dataList - 
 数据列表
 * @param {string} params.
 templateType - 模板类型（用于确定表头
 位置）
 * @param {string} params.sheetName 
 - 工作表名称
 */
export async function 
batchExportExcel(params) {
  // 模板配置映射
  const templateConfigMap = {
    'DEBTOR': { headerRow: 1, 
    startRow: 2 },      // 债务人模板
    'CREDITOR': { headerRow: 5, 
    startRow: 6 },    // 债权申报模板
    'EMPLOYEE': { headerRow: 8, 
    startRow: 9 },    // 职工工资模板
    'TAX': { headerRow: 3, 
    startRow: 4 }          // 税款模
    板
  };
  
  const defaultConfig = 
  templateConfigMap[params.
  templateType] || { headerRow: 1, 
  startRow: 2 };
  
  const requestData = {
    templateId: params.templateId,
    fileName: params.fileName,
    dataList: params.dataList,
    options: {
      headerRow: params.
      headerRow || defaultConfig.
      headerRow,
      startRow: params.startRow || 
      defaultConfig.startRow,
      sheetName: params.
      sheetName || 'Sheet1',
      mergeCells: params.
      mergeCells ?? false,
      addIndex: params.addIndex ?? 
      true
    }
  };
  
  const response = await axios.post(
    '/api/v1/document-templates/
    batch-export/excel',
    requestData,
    { responseType: 'blob' }
  );
  
  // 下载文件
  downloadBlob(response.data, `$
  {params.fileName}.xlsx`);
}

// 使用示例
batchExportExcel({
  templateId: 7,
  fileName: `债权申报表_${formatDate
  (new Date())}`,
  dataList: tableData,
  templateType: 'CREDITOR',  // 债权
  申报模板，表头在第 5 行
  sheetName: '抵押担保债权'
});
```
## 📊 总结
前端需要做的改动：

1. 新增 headerRow 参数 ：在 options 中添加表头行号
2. 确定表头位置 ：
   - 方式 1：根据模板类型配置映射表
   - 方式 2：解析用户上传的 Excel 模板自动获取
3. 保持向后兼容 ：不传 headerRow 时默认为 1（第一行）
这样就能支持各种复杂格式的 Excel 模板了！🎉
