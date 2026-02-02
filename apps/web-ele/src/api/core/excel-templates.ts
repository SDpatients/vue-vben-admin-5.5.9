import { requestClient8085 } from '#/api/request';

interface TemplateRequest {
  templateName: string;
  templateCode: string;
  description?: string;
  fieldMappings?: Record<string, string>;
  isActive?: boolean;
}

interface TemplateResponse {
  id: string;
  templateName: string;
  templateCode: string;
  description?: string;
  fieldMappings?: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
  createdTime?: string;
  createdBy?: string;
}

interface TemplateListResponse {
  code: number;
  message: string;
  data: TemplateResponse[];
}

interface TemplateDetailResponse {
  code: number;
  message: string;
  data: TemplateResponse;
}

interface CommonResponse {
  code: number;
  message: string;
  data: null;
}

interface MappingsResponse {
  code: number;
  message: string;
  data: Record<string, string>;
}

interface SystemField {
  id?: number;
  groupName: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}

interface SystemFieldGroup {
  group: string;
  fields: Array<{
    label: string;
    value: string;
    sortOrder: number;
    description?: string;
  }>;
}

interface SystemFieldsResponse {
  code: number;
  message: string;
  data: SystemFieldGroup[];
}

interface SystemFieldListResponse {
  code: number;
  message: string;
  data: SystemField[];
}

interface SystemFieldDetailResponse {
  code: number;
  message: string;
  data: SystemField;
}

export const excelTemplatesApi = {
  /**
   * 创建模板
   */
  createTemplate: (data: TemplateRequest) => {
    return requestClient8085.post<TemplateDetailResponse>('/excel-templates', data);
  },

  /**
   * 更新模板
   */
  updateTemplate: (id: string, data: Partial<TemplateRequest>) => {
    return requestClient8085.put<TemplateDetailResponse>(`/excel-templates/${id}`, data);
  },

  /**
   * 删除模板
   */
  deleteTemplate: (id: string) => {
    return requestClient8085.delete<CommonResponse>(`/excel-templates/${id}`);
  },

  /**
   * 获取所有模板
   */
  getTemplates: () => {
    return requestClient8085.get<TemplateListResponse>('/excel-templates');
  },

  /**
   * 设置默认模板
   */
  setDefaultTemplate: (id: string) => {
    return requestClient8085.post<CommonResponse>(`/excel-templates/${id}/set-default`);
  },

  /**
   * 获取模板字段映射
   */
  getTemplateMappings: (code: string) => {
    return requestClient8085.get<MappingsResponse>(`/excel-templates/${code}/mappings`);
  },

  /**
   * 下载Excel模板
   * @param templateCode 模板编码，不传则下载默认模板
   */
  downloadTemplate: (templateCode?: string) => {
    const url = templateCode
      ? `/excel-templates/template?templateCode=${templateCode}`
      : '/excel-templates/template';
    return requestClient8085.get<Blob>(url, {
      responseType: 'blob',
    });
  },

  /**
   * 导入Excel数据
   * @param file Excel文件
   * @param templateCode 使用的模板编码
   * @param caseId 案件ID（可选）
   * @param sheetIndex Sheet索引，默认0（可选）
   */
  importExcel: (file: File, templateCode?: string, caseId?: string, sheetIndex?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (templateCode) {
      formData.append('templateCode', templateCode);
    }
    if (caseId) {
      formData.append('caseId', caseId);
    }
    if (sheetIndex !== undefined) {
      formData.append('sheetIndex', sheetIndex.toString());
    }
    return requestClient8085.post<{
      code: number;
      message: string;
      data: {
        successCount: number;
        failCount: number;
        totalCount: number;
        message: string;
        errors: Array<{
          row: number;
          message: string;
          data: string;
        }>;
        templateCode: string;
        caseId?: number;
      };
    }>('/excel-templates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 导出债权数据
   * @param templateCode 模板编码（必填）
   * @param caseId 案件ID（可选）
   * @param registrationStatus 登记状态（可选）
   */
  exportData: (templateCode: string, caseId?: string, registrationStatus?: string) => {
    const params: Record<string, string> = {};
    params.templateCode = templateCode;
    if (caseId) {
      params.caseId = caseId;
    }
    if (registrationStatus) {
      params.registrationStatus = registrationStatus;
    }
    return requestClient8085.get<Blob>('/excel-templates/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * 获取系统字段分组列表
   */
  getSystemFields: () => {
    return requestClient8085.get<SystemFieldsResponse>('/excel-templates/system-fields');
  },

  /**
   * 获取指定分组的系统字段
   * @param groupName 分组名称
   */
  getSystemFieldsByGroup: (groupName: string) => {
    return requestClient8085.get<SystemFieldListResponse>(`/excel-templates/system-fields/group/${encodeURIComponent(groupName)}`);
  },

  /**
   * 获取单个系统字段
   * @param id 系统字段ID
   */
  getSystemFieldById: (id: number) => {
    return requestClient8085.get<SystemFieldDetailResponse>(`/excel-templates/system-fields/${id}`);
  },

  /**
   * 创建系统字段
   * @param data 系统字段数据
   */
  createSystemField: (data: Omit<SystemField, 'id'>) => {
    return requestClient8085.post<CommonResponse>('/excel-templates/system-fields', data);
  },

  /**
   * 更新系统字段
   * @param id 系统字段ID
   * @param data 系统字段数据
   */
  updateSystemField: (id: number, data: Partial<SystemField>) => {
    return requestClient8085.put<CommonResponse>(`/excel-templates/system-fields/${id}`, data);
  },

  /**
   * 删除系统字段
   * @param id 系统字段ID
   */
  deleteSystemField: (id: number) => {
    return requestClient8085.delete<CommonResponse>(`/excel-templates/system-fields/${id}`);
  },
};
