import { fileUploadRequestClient, requestClient8085 } from '#/api/request';

export namespace WorkLogApi {
  export type WorkType =
    | 'ASSET_DISPOSAL'
    | 'CASE_INVESTIGATION'
    | 'COURT_COMMUNICATION'
    | 'CREDITOR_CONTACT'
    | 'DOCUMENT_PREPARATION'
    | 'MEETING_ORGANIZATION'
    | 'OTHER';

  export type WorkLogStatus = 'ACTIVE' | 'DELETED' | 'INACTIVE';

  export interface WorkLogInfo {
    id: number;
    caseId: number;
    workDate: string;
    workType: WorkType;
    workContent: string;
    workResult: null | string;
    attachmentIds: null | string;
    remark: null | string;
    status: WorkLogStatus;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
    isDeleted: boolean;
  }

  export interface CreateWorkLogRequest {
    caseId: number;
    workDate: string;
    workType: WorkType;
    workContent: string;
    workResult?: string;
    attachmentIds?: string;
    remark?: string;
  }

  export interface UpdateWorkLogRequest {
    caseId?: number;
    workDate?: string;
    workType: WorkType;
    workContent: string;
    workResult?: string;
    attachmentIds?: string;
    remark?: string;
  }

  export interface UpdateWorkLogStatusRequest {
    status: WorkLogStatus;
  }

  export interface WorkLogListQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    workType?: WorkType;
    startDate?: string;
    endDate?: string;
    createUserId?: number;
    status?: WorkLogStatus;
  }

  export interface WorkLogListResponse {
    code: number;
    message: string;
    data: {
      list: WorkLogInfo[];
      total: number;
    };
  }

  export interface WorkLogDetailResponse {
    code: number;
    message: string;
    data: WorkLogInfo;
  }

  export interface CreateWorkLogResponse {
    code: number;
    message: string;
    data: {
      logId: number;
    };
  }

  export interface CreateWorkLogWithFilesRequest {
    caseId: number;
    workDate: string;
    workType: WorkType;
    workContent: string;
    workResult?: string;
    remark?: string;
    files?: File[];
  }

  export interface UploadedFileInfo {
    id: number;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    fileExtension?: string;
    mimeType?: string;
  }

  export interface CreateWorkLogWithFilesResponse {
    code: number;
    message: string;
    data: {
      files: UploadedFileInfo[];
      logId: number;
    };
  }

  export interface WorkLogDetailWithFilesResponse {
    code: number;
    message: string;
    data: WorkLogInfoWithFiles;
  }

  export interface WorkLogInfoWithFiles {
    id: number;
    caseId: number;
    workDate: string;
    workType: WorkType;
    workContent: string;
    workResult: null | string;
    attachmentIds: null | string;
    attachments: UploadedFileInfo[];
    remark: null | string;
    status: WorkLogStatus;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
    isDeleted: boolean;
  }

  export interface UpdateWorkLogWithFilesResponse {
    code: number;
    message: string;
    data: {
      files: UploadedFileInfo[];
      logId: number;
    };
  }

  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }
}

export async function createWorkLogApi(data: WorkLogApi.CreateWorkLogRequest) {
  return requestClient8085.post<WorkLogApi.CreateWorkLogResponse>(
    '/work-log',
    data,
  );
}

export async function getWorkLogListApi(
  params: WorkLogApi.WorkLogListQueryParams = {},
) {
  return requestClient8085.get<WorkLogApi.WorkLogListResponse>(
    '/work-log/list',
    { params },
  );
}

export async function getWorkLogDetailApi(logId: number) {
  return requestClient8085.get<WorkLogApi.WorkLogDetailResponse>(
    `/work-log/${logId}`,
  );
}

export async function updateWorkLogApi(
  logId: number,
  data: WorkLogApi.UpdateWorkLogRequest,
) {
  return requestClient8085.put<WorkLogApi.CommonResponse>(
    `/work-log/${logId}`,
    data,
  );
}

export async function updateWorkLogStatusApi(
  logId: number,
  data: WorkLogApi.UpdateWorkLogStatusRequest,
) {
  return requestClient8085.put<WorkLogApi.CommonResponse>(
    `/work-log/${logId}/status`,
    data,
  );
}

export async function deleteWorkLogApi(logId: number) {
  return requestClient8085.delete<WorkLogApi.CommonResponse>(
    `/work-log/${logId}`,
  );
}

export async function createWorkLogWithFilesApi(formData: FormData) {
  return fileUploadRequestClient.post<WorkLogApi.CreateWorkLogWithFilesResponse>(
    '/api/v1/work-log/with-files',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

export async function getWorkLogWithFilesApi(logId: number) {
  return requestClient8085.get<WorkLogApi.WorkLogDetailWithFilesResponse>(
    `/work-log/${logId}/with-files`,
  );
}

export async function updateWorkLogWithFilesApi(
  logId: number,
  formData: FormData,
) {
  return fileUploadRequestClient.put<WorkLogApi.UpdateWorkLogWithFilesResponse>(
    `/api/v1/work-log/${logId}/with-files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

export async function deleteWorkLogWithFilesApi(logId: number) {
  return fileUploadRequestClient.delete<WorkLogApi.CommonResponse>(
    `/api/v1/work-log/${logId}/with-files`,
  );
}
