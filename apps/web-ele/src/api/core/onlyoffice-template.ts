import { fileUploadRequestClient, requestClient } from '#/api/request';

export namespace OnlyOfficeTemplateApi {
  export interface GenerateTemplateResponse {
    code: number;
    message: string;
    data: {
      templatePath: string;
      templateName: string;
      message: string;
    };
  }

  export interface CustomTemplateRequest {
    templateName: string;
    title: string;
    sections: string[];
  }

  export interface SampleDataResponse {
    code: number;
    message: string;
    data: Record<string, any>;
  }

  export interface OnlyOfficeConfigResponse {
    code: number;
    message: string;
    data: {
      document: {
        fileType: string;
        key: string;
        title: string;
        url: string;
        permissions: {
          edit: boolean;
          download: boolean;
          print: boolean;
          copy: boolean;
        };
      };
      documentType: string;
      editorConfig: {
        callbackUrl: string;
        user: {
          id: string;
          name: string;
        };
        customization: {
          autosave: boolean;
          forcesave: boolean;
          trackChanges: boolean;
        };
      };
    };
  }

  export interface EditHistoryResponse {
    code: number;
    message: string;
    data: {
      history: Array<{
        version: number;
        editor: string;
        editTime: string;
        changes: string;
      }>;
    };
  }

  export interface CollaboratorsResponse {
    code: number;
    message: string;
    data: Array<{
      id: string;
      name: string;
      email?: string;
      avatar?: string;
      isEditing: boolean;
      lastActive: string;
    }>;
  }

  export interface CleanupResponse {
    code: number;
    message: string;
    data: string;
  }
}

export async function generateDataReportTemplateApi(
  templateName: string,
): Promise<OnlyOfficeTemplateApi.GenerateTemplateResponse> {
  return requestClient.post<OnlyOfficeTemplateApi.GenerateTemplateResponse>(
    '/api/v1/api/template/generate/data-report',
    null,
    {
      params: { templateName },
    },
  );
}

export async function generateCustomTemplateApi(
  data: OnlyOfficeTemplateApi.CustomTemplateRequest,
): Promise<OnlyOfficeTemplateApi.GenerateTemplateResponse> {
  return requestClient.post<OnlyOfficeTemplateApi.GenerateTemplateResponse>(
    '/api/v1/api/template/generate/custom',
    data,
  );
}

export async function fillTemplateApi(
  templatePath: string,
  data: Record<string, any>,
): Promise<Blob> {
  return fileUploadRequestClient.post<Blob>(
    '/api/v1/api/template/fill',
    data,
    {
      params: { templatePath },
      responseType: 'blob',
    },
  );
}

export async function exportSampleReportApi(): Promise<Blob> {
  return fileUploadRequestClient.post<Blob>(
    '/api/v1/api/template/export/sample',
    null,
    {
      responseType: 'blob',
    },
  );
}

export async function generateAndFillTemplateApi(
  templateType: string,
  data: Record<string, any>,
): Promise<Blob> {
  return fileUploadRequestClient.post<Blob>(
    '/api/v1/api/template/generate-and-fill',
    data,
    {
      params: { templateType },
      responseType: 'blob',
    },
  );
}

export async function getSampleDataApi(): Promise<OnlyOfficeTemplateApi.SampleDataResponse> {
  return requestClient.get<OnlyOfficeTemplateApi.SampleDataResponse>(
    '/api/v1/api/template/sample-data',
  );
}

export async function cleanupTemplatesApi(): Promise<OnlyOfficeTemplateApi.CleanupResponse> {
  return requestClient.delete<OnlyOfficeTemplateApi.CleanupResponse>(
    '/api/v1/api/template/cleanup',
  );
}

export async function getOnlyOfficeConfigApi(
  fileId: number,
): Promise<OnlyOfficeTemplateApi.OnlyOfficeConfigResponse> {
  return requestClient.get<OnlyOfficeTemplateApi.OnlyOfficeConfigResponse>(
    `/api/v1/onlyoffice/config/${fileId}`,
  );
}

export async function lockFileApi(fileId: number): Promise<{ code: number; message: string; data: null }> {
  return requestClient.post<{ code: number; message: string; data: null }>(
    `/api/v1/onlyoffice/lock/${fileId}`,
  );
}

export async function unlockFileApi(fileId: number): Promise<{ code: number; message: string; data: null }> {
  return requestClient.post<{ code: number; message: string; data: null }>(
    `/api/v1/onlyoffice/unlock/${fileId}`,
  );
}

export async function getEditHistoryApi(
  fileId: number,
): Promise<OnlyOfficeTemplateApi.EditHistoryResponse> {
  return requestClient.get<OnlyOfficeTemplateApi.EditHistoryResponse>(
    `/api/v1/onlyoffice/history/${fileId}`,
  );
}

export async function getCollaboratorsApi(
  fileId: number,
): Promise<OnlyOfficeTemplateApi.CollaboratorsResponse> {
  return requestClient.get<OnlyOfficeTemplateApi.CollaboratorsResponse>(
    `/api/v1/onlyoffice/collaborators/${fileId}`,
  );
}
