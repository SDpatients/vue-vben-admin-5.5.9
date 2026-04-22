import http from './request'

export namespace WorkLogApi {
  export type WorkType =
    | 'ASSET_DISPOSAL'
    | 'CASE_INVESTIGATION'
    | 'COURT_COMMUNICATION'
    | 'CREDITOR_CONTACT'
    | 'DOCUMENT_PREPARATION'
    | 'MEETING_ORGANIZATION'
    | 'OTHER'

  export type WorkLogStatus = 'ACTIVE' | 'DELETED' | 'INACTIVE'

  export interface WorkLogInfo {
    id: number
    caseId: number
    workDate: string
    workType: WorkType
    workContent: string
    workResult: null | string
    attachmentIds: null | string
    remark: null | string
    status: WorkLogStatus
    createTime: string
    updateTime: string
    createUserId: number
    updateUserId: number
    isDeleted: boolean
    creatorName?: string
    createUserName?: string
  }

  export interface CreateWorkLogRequest {
    caseId: number
    workDate: string
    workType: WorkType
    workContent: string
    workResult?: string
    attachmentIds?: string
    remark?: string
  }

  export interface UpdateWorkLogRequest {
    caseId?: number
    workDate?: string
    workType: WorkType
    workContent: string
    workResult?: string
    attachmentIds?: string
    remark?: string
  }

  export interface UpdateWorkLogStatusRequest {
    status: WorkLogStatus
  }

  export interface WorkLogListQueryParams {
    pageNum?: number
    pageSize?: number
    caseId?: number
    workType?: WorkType
    startDate?: string
    endDate?: string
    createUserId?: number
    status?: WorkLogStatus
  }

  export interface WorkLogListResponse {
    code: number
    message: string
    data: {
      list: WorkLogInfo[]
      total: number
    }
  }

  export interface WorkLogDetailResponse {
    code: number
    message: string
    data: WorkLogInfo
  }

  export interface CreateWorkLogResponse {
    code: number
    message: string
    data: {
      logId: number
    }
  }

  export interface CommonResponse {
    code: number
    message: string
    data: null
  }
}

export const workTypeMap: Record<WorkLogApi.WorkType, string> = {
  ASSET_DISPOSAL: '资产处置',
  CASE_INVESTIGATION: '案件调查',
  COURT_COMMUNICATION: '法院沟通',
  CREDITOR_CONTACT: '债权人联系',
  DOCUMENT_PREPARATION: '文档准备',
  MEETING_ORGANIZATION: '会议组织',
  OTHER: '其他',
}

export function getWorkLogListApi(params: WorkLogApi.WorkLogListQueryParams = {}) {
  return http.get<WorkLogApi.WorkLogListResponse>('/work-log/list', params)
}

export function getWorkLogDetailApi(logId: number) {
  return http.get<WorkLogApi.WorkLogDetailResponse>(`/work-log/${logId}`)
}

export function createWorkLogApi(data: WorkLogApi.CreateWorkLogRequest) {
  return http.post<WorkLogApi.CreateWorkLogResponse>('/work-log', data)
}

export function updateWorkLogApi(logId: number, data: WorkLogApi.UpdateWorkLogRequest) {
  return http.put<WorkLogApi.CommonResponse>(`/work-log/${logId}`, data)
}

export function updateWorkLogStatusApi(logId: number, data: WorkLogApi.UpdateWorkLogStatusRequest) {
  return http.put<WorkLogApi.CommonResponse>(`/work-log/${logId}/status`, data)
}

export function deleteWorkLogApi(logId: number) {
  return http.delete<WorkLogApi.CommonResponse>(`/work-log/${logId}`)
}
