import { requestClient8080, fileDownloadRequestClient8080 } from '#/api/request';

export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'LIST' | 'IMAGE' | 'TABLE';

export type TemplateType = 'WORD' | 'EXCEL';

export type TemplateStatus = 'ACTIVE' | 'INACTIVE';

export type ExportStatus = 'SUCCESS' | 'FAILED' | 'PROCESSING';

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
  mappings?: Array<{ excelHeader: string; targetField: string }>;
}

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

export interface ExportRequest {
  fileName: string;
  data: Record<string, any>;
  dataList?: Array<Record<string, any>>;  // 支持列表数据
}

export interface BatchExportRequest {
  templateId: number;
  fileName: string;
  dataList: Array<Record<string, any>>;
  options?: {
    mergeCells?: boolean;      // 是否合并单元格
    addIndex?: boolean;        // 是否添加序号
    sheetName?: string;        // Sheet 名称
    startRow?: number;         // 起始行（从 1 开始）
    headerRow?: number;        // 表头所在行（从 1 开始）
  };
}

export interface ImageUploadResponse {
  filePath: string;
  fileName: string;
  imageType: string;
}

interface CommonResponse<T = null> {
  code: number;
  message: string;
  data: T;
}

interface ListResponse<T> {
  code: number;
  message: string;
  data: T[];
}

export const documentTemplatesApi = {
  createTemplate: (data: DocumentTemplateRequest) => {
    return requestClient8080.post<CommonResponse<DocumentTemplate>>(
      '/document-templates',
      data,
    );
  },

  updateTemplate: (id: number, data: Partial<DocumentTemplateRequest>) => {
    return requestClient8080.put<CommonResponse<DocumentTemplate>>(
      `/document-templates/${id}`,
      data,
    );
  },

  deleteTemplate: (id: number) => {
    return requestClient8080.delete<CommonResponse>(`/document-templates/${id}`);
  },

  getTemplates: () => {
    return requestClient8080.get<ListResponse<DocumentTemplate>>(
      '/document-templates',
    );
  },

  getTemplatesByType: (templateType: TemplateType) => {
    return requestClient8080.get<ListResponse<DocumentTemplate>>(
      `/document-templates/type/${templateType}`,
    );
  },

  getTemplatesByDescription: (description: string) => {
    return requestClient8080.get<ListResponse<DocumentTemplate>>(
      '/document-templates',
      { params: { description } },
    );
  },

  getTemplateById: (id: number) => {
    return requestClient8080.get<CommonResponse<DocumentTemplate>>(
      `/document-templates/${id}`,
    );
  },

  getTemplateByCode: (templateCode: string) => {
    return requestClient8080.get<CommonResponse<DocumentTemplate>>(
      `/document-templates/code/${templateCode}`,
    );
  },

  getTemplateDetail: (id: number) => {
    return requestClient8080.get<CommonResponse<DocumentTemplate>>(
      `/document-templates/${id}/detail`,
    );
  },

  getTemplateFields: (id: number) => {
    return requestClient8080.get<CommonResponse<TemplateField[]>>(
      `/document-templates/${id}/fields`,
    );
  },

  setDefaultTemplate: (id: number, templateType: TemplateType) => {
    return requestClient8080.post<CommonResponse>(
      `/document-templates/${id}/set-default`,
      null,
      {
        params: { templateType },
      },
    );
  },

  uploadTemplateFile: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return requestClient8080.post<CommonResponse<string>>(
      `/document-templates/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  uploadTemplateImage: (id: number, file: File, imageType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (imageType) {
      formData.append('imageType', imageType);
    }
    return requestClient8080.post<CommonResponse<ImageUploadResponse>>(
      `/document-templates/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  exportWord: (id: number, data: ExportRequest) => {
    return fileDownloadRequestClient8080.post<Blob>(
      `/document-templates/${id}/export/word`,
      data,
      {
        responseType: 'blob',
      },
    );
  },

  exportExcel: (id: number, data: ExportRequest) => {
    return fileDownloadRequestClient8080.post<Blob>(
      `/document-templates/${id}/export/excel`,
      data,
      {
        responseType: 'blob',
      },
    );
  },

  batchExportExcel: (data: BatchExportRequest) => {
    return fileDownloadRequestClient8080.post<Blob>(
      '/document-templates/batch-export/excel',
      data,
      {
        responseType: 'blob',
      },
    );
  },

  exportPdf: (id: number, data: ExportRequest) => {
    return fileDownloadRequestClient8080.post<Blob>(
      `/document-templates/${id}/export/pdf`,
      data,
      {
        responseType: 'blob',
      },
    );
  },

  previewTemplate: (id: number) => {
    return requestClient8080.get<Blob>(
      `/document-templates/${id}/preview`,
      {
        responseType: 'blob',
      },
    );
  },

  previewPdf: (id: number) => {
    return requestClient8080.get<Blob>(
      `/document-templates/${id}/preview/pdf`,
      {
        responseType: 'blob',
      },
    );
  },

  getExportHistory: () => {
    return requestClient8080.get<ListResponse<ExportHistory>>(
      '/document-templates/export-history',
    );
  },

  getTemplateExportHistory: (id: number) => {
    return requestClient8080.get<ListResponse<ExportHistory>>(
      `/document-templates/${id}/export-history`,
    );
  },
};
