import { requestClient8085 } from '#/api/request';

export namespace WorkLogApi {
  export type WorkType = 'CASE_INVESTIGATION' | 'CREDITOR_CONTACT' | 'ASSET_DISPOSAL' | 'COURT_COMMUNICATION' | 'DOCUMENT_PREPARATION' | 'MEETING_ORGANIZATION' | 'OTHER';

  export type WorkLogStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

  export interface WorkLogInfo {
    id: number;
    caseId: number;
    workDate: string;
    workType: WorkType;
    workContent: string;
    workResult: string | null;
    attachmentIds: string | null;
    remark: string | null;
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
      total: number;
      list: WorkLogInfo[];
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

  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }
}

export async function createWorkLogApi(data: WorkLogApi.CreateWorkLogRequest) {
  return requestClient8085.post<WorkLogApi.CreateWorkLogResponse>('/work-log', data);
}

export async function getWorkLogListApi(params: WorkLogApi.WorkLogListQueryParams = {}) {
  return requestClient8085.get<WorkLogApi.WorkLogListResponse>('/work-log/list', { params });
}

export async function getWorkLogDetailApi(logId: number) {
  return requestClient8085.get<WorkLogApi.WorkLogDetailResponse>(`/work-log/${logId}`);
}

export async function updateWorkLogApi(logId: number, data: WorkLogApi.UpdateWorkLogRequest) {
  return requestClient8085.put<WorkLogApi.CommonResponse>(`/work-log/${logId}`, data);
}

export async function updateWorkLogStatusApi(logId: number, data: WorkLogApi.UpdateWorkLogStatusRequest) {
  return requestClient8085.put<WorkLogApi.CommonResponse>(`/work-log/${logId}/status`, data);
}

export async function deleteWorkLogApi(logId: number) {
  return requestClient8085.delete<WorkLogApi.CommonResponse>(`/work-log/${logId}`);
}
