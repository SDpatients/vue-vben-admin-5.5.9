import { requestClient8085, fileDownloadRequestClient8085 } from '#/api/request';

// 字段类型枚举
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'LIST' | 'IMAGE' | 'TABLE';

// 模板类型枚举
export type TemplateType = 'WORD' | 'EXCEL';

// 模板状态枚举
export type TemplateStatus = 'ACTIVE' | 'INACTIVE';

// 导出状态枚举
export type ExportStatus = 'SUCCESS' | 'FAILED' | 'PROCESSING';

// 模板字段定义
export interface TemplateField {
  id?: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  sourceField: string;
  defaultValue?: string;
  sortOrder: number;
  isRequired: boolean;
  formatPattern?: string;
}

// 模板请求数据
export interface DocumentTemplateRequest {
  id?: number;
  templateName: string;
  templateCode: string;
  templateType: TemplateType;
  description?: string;
  configJson?: string;
  isDefault?: boolean;
  status?: TemplateStatus;
  fields?: TemplateField[];
}

// 模板响应数据
export interface DocumentTemplate {
  id: number;
  templateName: string;
  templateCode: string;
  templateType: TemplateType;
  description?: string;
  filePath?: string;
  configJson?: string;
  isDefault: boolean;
  status: TemplateStatus;
  createTime: string;
  updateTime: string;
  createUserId?: number;
  updateUserId?: number;
  fields?: TemplateField[];
}

// 导出历史记录
export interface ExportHistory {
  id: number;
  templateId: number;
  templateName: string;
  exportType: TemplateType;
  fileName: string;
  fileSize: number;
  exportStatus: ExportStatus;
  exportedBy: number;
  exportedByName: string;
  exportedTime: string;
  processingTime?: number;
  createTime: string;
}

// Word导出请求
export interface WordExportRequest {
  templateId: number;
  fileName: string;
  data: Record<string, any>;
}

// Excel导出请求
export interface ExcelExportRequest {
  templateId: number;
  fileName: string;
  data: Record<string, any>;
}

// 通用响应
interface CommonResponse<T = null> {
  code: number;
  message: string;
  data: T;
}

// 列表响应
interface ListResponse<T> {
  code: number;
  message: string;
  data: T[];
}

/**
 * 文档模板管理API
 */
export const documentTemplatesApi = {
  /**
   * 1.1 创建模板
   * POST /api/v1/document-templates
   */
  createTemplate: (data: DocumentTemplateRequest) => {
    return requestClient8085.post<CommonResponse<DocumentTemplate>>(
      '/document-templates',
      data,
    );
  },

  /**
   * 1.2 更新模板
   * PUT /api/v1/document-templates/{id}
   */
  updateTemplate: (id: number, data: Partial<DocumentTemplateRequest>) => {
    return requestClient8085.put<CommonResponse<DocumentTemplate>>(
      `/document-templates/${id}`,
      data,
    );
  },

  /**
   * 1.3 删除模板（软删除）
   * DELETE /api/v1/document-templates/{id}
   */
  deleteTemplate: (id: number) => {
    return requestClient8085.delete<CommonResponse>(`/document-templates/${id}`);
  },

  /**
   * 1.4 获取模板列表
   * GET /api/v1/document-templates
   */
  getTemplates: () => {
    return requestClient8085.get<ListResponse<DocumentTemplate>>(
      '/document-templates',
    );
  },

  /**
   * 1.5 按类型获取模板
   * GET /api/v1/document-templates/type/{templateType}
   */
  getTemplatesByType: (templateType: TemplateType) => {
    return requestClient8085.get<ListResponse<DocumentTemplate>>(
      `/document-templates/type/${templateType}`,
    );
  },

  /**
   * 1.6 获取模板详情
   * GET /api/v1/document-templates/{id}
   */
  getTemplateById: (id: number) => {
    return requestClient8085.get<CommonResponse<DocumentTemplate>>(
      `/document-templates/${id}`,
    );
  },

  /**
   * 1.7 根据编码获取模板
   * GET /api/v1/document-templates/code/{templateCode}
   */
  getTemplateByCode: (templateCode: string) => {
    return requestClient8085.get<CommonResponse<DocumentTemplate>>(
      `/document-templates/code/${templateCode}`,
    );
  },

  /**
   * 1.8 获取模板字段配置
   * GET /api/v1/document-templates/{id}/fields
   */
  getTemplateFields: (id: number) => {
    return requestClient8085.get<CommonResponse<TemplateField[]>>(
      `/document-templates/${id}/fields`,
    );
  },

  /**
   * 1.9 设置默认模板
   * POST /api/v1/document-templates/{id}/set-default
   */
  setDefaultTemplate: (id: number, templateType: TemplateType) => {
    return requestClient8085.post<CommonResponse>(
      `/document-templates/${id}/set-default`,
      null,
      {
        params: { templateType },
      },
    );
  },

  /**
   * 1.10 上传模板文件
   * POST /api/v1/document-templates/{id}/upload
   */
  uploadTemplateFile: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return requestClient8085.post<CommonResponse<string>>(
      `/document-templates/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  /**
   * 2.1 导出Word文档
   * POST /api/v1/document-templates/{id}/export/word
   */
  exportWord: (templateId: number, data: WordExportRequest) => {
    return fileDownloadRequestClient8085.post<Blob>(
      `/document-templates/${templateId}/export/word`,
      data,
      {
        responseType: 'blob',
      },
    );
  },

  /**
   * 2.2 导出Excel表格
   * POST /api/v1/document-templates/{id}/export/excel
   */
  exportExcel: (templateId: number, data: ExcelExportRequest) => {
    return fileDownloadRequestClient8085.post<Blob>(
      `/document-templates/${templateId}/export/excel`,
      data,
      {
        responseType: 'blob',
      },
    );
  },

  /**
   * 3.1 获取导出历史
   * GET /api/v1/document-templates/export-history
   */
  getExportHistory: () => {
    return requestClient8085.get<ListResponse<ExportHistory>>(
      '/document-templates/export-history',
    );
  },

  /**
   * 3.2 获取指定模板的导出历史
   * GET /api/v1/document-templates/{id}/export-history
   */
  getTemplateExportHistory: (id: number) => {
    return requestClient8085.get<ListResponse<ExportHistory>>(
      `/document-templates/${id}/export-history`,
    );
  },

  /**
   * 4.1 预览Word文档模板
   * GET /api/v1/document-templates/{id}/preview
   */
  previewTemplate: (id: number) => {
    return requestClient8085.get<any>(
      `/document-templates/${id}/preview`,
      {
        responseType: 'blob',
      }
    );
  },
};
