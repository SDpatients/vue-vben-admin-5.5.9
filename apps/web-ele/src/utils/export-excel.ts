import * as XLSX from 'xlsx';

/**
 * 导出数据为Excel文件的配置选项
 */
export interface ExportExcelOptions<T = any> {
  /** 导出的数据数组 */
  data: T[];
  /** 导出的文件名，不包含扩展名 */
  fileName?: string;
  /** Excel工作表名称 */
  sheetName?: string;
  /** 列配置，用于映射数据字段到Excel列 */
  columns: ExportColumnConfig[];
}

/**
 * 导出列配置
 */
export interface ExportColumnConfig {
  /** 字段名，对应数据对象的属性名 */
  field: string;
  /** 列标题，显示在Excel表头 */
  title: string;
  /** 单元格宽度（可选） */
  width?: number;
  /** 自定义格式化函数（可选） */
  formatter?: (value: any, row: any, index: number) => any;
}

/**
 * 将数据导出为Excel文件
 * @param options 导出配置选项
 */
export function exportToExcel<T = any>(options: ExportExcelOptions<T>): void {
  const {
    data,
    fileName = 'export_data',
    sheetName = 'Sheet1',
    columns,
  } = options;

  // 准备导出数据
  const exportData = data.map((row: any, index: number) => {
    const rowData: Record<string, any> = {};
    columns.forEach((column) => {
      let value = row[column.field as keyof typeof row];
      // 应用自定义格式化函数
      if (column.formatter) {
        value = column.formatter(value, row, index);
      }
      rowData[column.title] = value;
    });
    return rowData;
  });

  // 创建工作簿和工作表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    skipHeader: false,
  });

  // 设置列宽
  const wscols = columns.map((col) => {
    // 优化列宽设置，默认值调整为更合适的12
    const defaultWidth = 12;
    // 如果指定了宽度，则使用指定宽度，否则使用默认宽度
    const width = col.width || defaultWidth;
    // 限制最大宽度为25，防止列宽过大
    const finalWidth = Math.min(width, 25);
    return { wch: finalWidth };
  });
  worksheet['!cols'] = wscols;

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 生成Excel文件的Blob
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // 下载文件
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${Date.now()}.xlsx`;
  link.style.display = 'none';

  document.body.append(link);

  // 使用dispatchEvent确保事件正确触发，提高浏览器兼容性
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  link.dispatchEvent(clickEvent);

  link.remove();

  // 延迟清理URL，确保下载完成
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 从表格数据导出Excel文件（适用于直接从表格组件获取数据的场景）
 */
export interface TableExportOptions {
  /** 表格数据 */
  data: any[];
  /** 表格列配置 */
  columns: any[];
  /** 导出的文件名，不包含扩展名 */
  fileName?: string;
  /** Excel工作表名称 */
  sheetName?: string;
}

/**
 * 从表格配置快速导出Excel（适用于Element Plus等表格组件）
 * @param options 表格导出配置
 */
export function exportFromTable(options: TableExportOptions): void {
  const {
    data,
    columns,
    fileName = 'table_export',
    sheetName = 'Sheet1',
  } = options;

  // 转换表格列配置为导出列配置
  const exportColumns: ExportColumnConfig[] = columns
    .filter((col: any) => !col.hidden && col.prop) // 过滤隐藏列和没有prop的列
    .map((col: any) => ({
      field: col.prop,
      title: col.label || col.title || col.prop,
      width: col.width,
      formatter: col.formatter,
    }));

  // 调用通用导出函数
  exportToExcel({
    data,
    fileName,
    sheetName,
    columns: exportColumns,
  });
}
