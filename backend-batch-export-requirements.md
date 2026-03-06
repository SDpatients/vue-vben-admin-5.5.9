# Excel 批量导出接口需求文档

## 📋 接口概述

实现基于模板的 Excel 批量数据导出功能，支持多行数据自动填充到 Excel 表格中。

---

## 🔌 接口定义

### 接口 1：批量导出 Excel（推荐）

```
POST /api/v1/document-templates/batch-export/excel
```

#### 请求参数

```json
{
  "templateId": 4,                    // 模板 ID（必填）
  "fileName": "债务人批量数据",        // 文件名（必填）
  "dataList": [                       // 数据列表（必填）
    {
      "index": 1,
      "债务人名称": "张三公司",
      "法定代表人": "张三",
      "统一社会信用代码": "91110108MA00XXXXXX",
      "注册地址": "北京市朝阳区 XXX 路 XXX 号",
      "联系电话": "13800138000",
      "联系人": "张三",
      "案号": "（2024）京 01 破申 1 号",
      "案件名称": "张三公司破产清算案",
      "businessScope": "软件开发",
      "industry": "信息技术"
    },
    {
      "index": 2,
      "债务人名称": "李四公司",
      "法定代表人": "李四",
      "统一社会信用代码": "91110108MA00YYYYYY",
      "注册地址": "上海市浦东新区 XXX 路 XXX 号",
      "联系电话": "13900139000",
      "联系人": "李四",
      "案号": "（2024）沪 01 破申 2 号",
      "案件名称": "李四公司破产清算案",
      "businessScope": "硬件销售",
      "industry": "批发零售"
    }
  ],
  "options": {                        // 可选配置
    "mergeCells": false,              // 是否合并单元格（可选，默认 false）
    "addIndex": true,                 // 是否添加序号（可选，默认 true）
    "sheetName": "债务人列表",        // Sheet 名称（可选，默认"Sheet1"）
    "startRow": 2                     // 起始行，从 1 开始（可选，默认 2）
  }
}
```

#### 响应

- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="债务人批量数据_2024-03-05.xlsx"`

#### 响应示例

```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="债务人批量数据_2024-03-05.xlsx"

[二进制 Excel 文件数据]
```

---

### 接口 2：通用导出（已存在，需扩展支持 dataList）

```
POST /api/v1/document-templates/{id}/export/excel
```

#### 请求参数（扩展）

```json
{
  "fileName": "债务人数据",
  "data": {                 // 单条数据（保持兼容）
    "债务人名称": "张三公司",
    "法定代表人": "张三"
  },
  "dataList": [             // 新增：多条数据（可选）
    {
      "债务人名称": "张三公司",
      "法定代表人": "张三"
    },
    {
      "债务人名称": "李四公司",
      "法定代表人": "李四"
    }
  ]
}
```

---

## 📝 Excel 模板格式要求

### 模板示例

```
┌─────────────────────────────────────────────────────────────────┐
│ A1: 序号  │ B1: 债务人名称  │ C1: 法定代表人  │ D1: 统一社会信用代码 │ E1: 注册地址 │ ...
├─────────────────────────────────────────────────────────────────┤
│ A2: {{.index}} │ B2: {{.债务人名称}} │ C2: {{.法定代表人}} │ D2: {{.统一社会信用代码}} │ E2: {{.注册地址}} │ ...
└─────────────────────────────────────────────────────────────────┘
```

### 占位符格式

| 类型 | 占位符格式 | 示例 | 说明 |
|-----|-----------|------|------|
| 列表数据 | `{{.字段名}}` | `{{.债务人名称}}` | 用于多行数据填充 |
| 单条数据 | `{{字段名}}` | `{{债务人名称}}` | 用于单条数据填充 |

### 模板制作步骤

1. **创建 Excel 文件**
   - 第 1 行：表头（字段名称）
   - 第 2 行：占位符（使用 `{{.字段名}}` 格式）

2. **设置字段映射**
   - 在模板管理页面配置字段
   - 字段名必须与 `dataList` 中的 key 一致

3. **上传模板**
   - 模板类型选择：EXCEL
   - 模板编码建议：`DEBTOR_BATCH_EXPORT`

---

## 🔧 后端实现要点

### 1. 使用 Apache POI 或 EasyExcel

```java
// 推荐依赖
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>

<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.3.2</version>
</dependency>
```

### 2. 核心处理逻辑

```java
@PostMapping("/batch-export/excel")
public void batchExportExcel(
    @RequestBody BatchExportRequest request,
    HttpServletResponse response
) throws IOException {
    // 1. 获取模板
    DocumentTemplate template = templateService.getById(request.getTemplateId());
    File templateFile = new File(template.getFilePath());
    
    // 2. 加载模板
    Workbook workbook = new XSSFWorkbook(templateFile);
    Sheet sheet = workbook.getSheetAt(0);
    
    // 3. 获取或创建 Sheet
    if (request.getOptions() != null && request.getOptions().getSheetName() != null) {
        String sheetName = request.getOptions().getSheetName();
        Sheet existingSheet = workbook.getSheet(sheetName);
        if (existingSheet != null) {
            sheet = existingSheet;
        } else {
            sheet = workbook.createSheet(sheetName);
        }
    }
    
    // 4. 确定起始行
    int startRow = request.getOptions() != null ? request.getOptions().getStartRow() : 2;
    int rowNum = startRow - 1; // 转换为 0-based 索引
    
    // 5. 遍历数据列表，填充每一行
    for (Map<String, Object> rowData : request.getDataList()) {
        Row row = sheet.createRow(rowNum++);
        
        // 6. 根据模板的表头填充数据
        Row headerRow = sheet.getRow(0); // 假设第 1 行是表头
        if (headerRow != null) {
            for (int cellNum = 0; cellNum < headerRow.getLastCellNum(); cellNum++) {
                Cell headerCell = headerRow.getCell(cellNum);
                if (headerCell != null) {
                    String headerValue = headerCell.getStringCellValue();
                    
                    // 查找匹配的字段
                    Object value = findFieldValue(rowData, headerValue);
                    
                    Cell dataCell = row.createCell(cellNum);
                    if (value != null) {
                        setCellValue(dataCell, value);
                    }
                }
            }
        }
    }
    
    // 7. 自动调整列宽
    for (int i = 0; i < sheet.getRow(0).getLastCellNum(); i++) {
        sheet.autoSizeColumn(i);
    }
    
    // 8. 设置响应头
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setHeader("Content-Disposition", 
        "attachment; filename=\"" + request.getFileName() + ".xlsx\"");
    
    // 9. 输出 Excel 文件
    workbook.write(response.getOutputStream());
    workbook.close();
}

// 辅助方法：查找字段值
private Object findFieldValue(Map<String, Object> rowData, String fieldName) {
    // 直接匹配
    if (rowData.containsKey(fieldName)) {
        return rowData.get(fieldName);
    }
    
    // 去除空格匹配
    String trimmedName = fieldName.trim();
    if (rowData.containsKey(trimmedName)) {
        return rowData.get(trimmedName);
    }
    
    return null;
}

// 辅助方法：设置单元格值
private void setCellValue(Cell cell, Object value) {
    if (value instanceof Number) {
        cell.setCellValue(((Number) value).doubleValue());
    } else if (value instanceof Date) {
        cell.setCellValue((Date) value);
    } else if (value instanceof LocalDateTime) {
        cell.setCellValue(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .format((LocalDateTime) value));
    } else {
        cell.setCellValue(value.toString());
    }
}
```

### 3. 请求对象定义

```java
@Data
public class BatchExportRequest {
    private Long templateId;
    private String fileName;
    private List<Map<String, Object>> dataList;
    private ExportOptions options;
    
    @Data
    public static class ExportOptions {
        private Boolean mergeCells = false;
        private Boolean addIndex = true;
        private String sheetName;
        private Integer startRow = 2;
    }
}
```

---

## 📊 数据库配置

### 模板配置示例

```sql
INSERT INTO tb_document_template (
    template_name, 
    template_code, 
    template_type, 
    description, 
    file_path, 
    status
) VALUES (
    '债务人批量导出模板',
    'DEBTOR_BATCH_EXPORT',
    'EXCEL',
    '用于批量导出债务人数据的 Excel 模板',
    'uploads/templates/debtor_batch_export.xlsx',
    'ACTIVE'
);
```

### 字段配置示例

```sql
INSERT INTO tb_document_template_field (
    template_id, 
    field_name, 
    field_label, 
    field_type, 
    sort_order, 
    is_required
) VALUES
    (1, 'index', '序号', 'NUMBER', 1, false),
    (1, '债务人名称', '债务人名称', 'TEXT', 2, true),
    (1, '法定代表人', '法定代表人', 'TEXT', 3, true),
    (1, '统一社会信用代码', '统一社会信用代码', 'TEXT', 4, true),
    (1, '注册地址', '注册地址', 'TEXT', 5, false),
    (1, '联系电话', '联系电话', 'TEXT', 6, false),
    (1, '联系人', '联系人', 'TEXT', 7, false),
    (1, '案号', '案号', 'TEXT', 8, false),
    (1, '案件名称', '案件名称', 'TEXT', 9, false);
```

---

## ✅ 测试用例

### 测试 1：基本批量导出

```bash
curl -X POST http://localhost:8080/api/v1/document-templates/batch-export/excel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": 1,
    "fileName": "测试批量导出",
    "dataList": [
      {
        "index": 1,
        "债务人名称": "测试公司 1",
        "法定代表人": "张三"
      },
      {
        "index": 2,
        "债务人名称": "测试公司 2",
        "法定代表人": "李四"
      }
    ]
  }' \
  --output test.xlsx
```

### 测试 2：带选项的批量导出

```bash
curl -X POST http://localhost:8080/api/v1/document-templates/batch-export/excel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": 1,
    "fileName": "自定义批量导出",
    "dataList": [...],
    "options": {
      "mergeCells": true,
      "sheetName": "债务人数据",
      "startRow": 3
    }
  }' \
  --output custom.xlsx
```

---

## 📌 注意事项

1. **占位符格式**
   - 列表数据必须使用 `{{.字段名}}` 格式（带点号）
   - 单条数据使用 `{{字段名}}` 格式

2. **字段名匹配**
   - 字段名必须与 Excel 表头完全匹配（包括空格）
   - 建议在表头中使用中文名称

3. **性能优化**
   - 大数据量时建议使用 SXSSFWorkbook（流式写入）
   - 可以添加分页导出功能

4. **错误处理**
   - 模板不存在时返回 404
   - 数据格式错误时返回 400
   - 导出失败时返回 500 并附带错误信息

---

## 🎯 实现优先级

### 第一阶段（必须实现）
- ✅ 基础批量导出接口
- ✅ 支持 `{{.字段名}}` 占位符
- ✅ 基本的 Excel 文件生成

### 第二阶段（推荐实现）
- ⏳ 支持选项配置（sheetName、startRow）
- ⏳ 自动调整列宽
- ⏳ 支持序号自动生成

### 第三阶段（可选实现）
- 🔲 支持单元格合并
- 🔲 支持条件格式
- 🔲 支持公式计算

---

## 📞 联系方式

如有疑问，请联系前端开发团队。
