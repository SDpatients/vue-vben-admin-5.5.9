import { downloadFileApi } from '#/api/core/file';
import { fileUploadRequestClient, requestClient8085 } from '#/api/request';

export namespace CaseApi {
  /** 案件状态枚举 */
  export type CaseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'TERMINATED' | 'ARCHIVED';

  /** 案件进度枚举 */
  export type CaseProgress = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH' | 'SIXTH' | 'SEVENTH';

  /** 审核状态枚举 */
  export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

  /** 案件简单信息 */
  export interface SimpleCaseInfo {
    id: number;
    caseNumber: string;
    caseName: string;
  }

  /** 案件简单列表响应 */
  export interface SimpleCaseListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: SimpleCaseInfo[];
    };
  }

  /** 案件信息 */
  export interface CaseInfo {
    id: number;
    caseNumber: string;
    caseName: string;
    acceptanceDate: string;
    caseSource: string;
    acceptanceCourt: string;
    designatedInstitution: string;
    mainResponsiblePerson: string;
    isSimplifiedTrial: boolean;
    caseReason: string;
    caseProgress: CaseProgress;
    debtClaimDeadline: string;
    filingDate: string;
    closingDate: string | null;
    bankruptcyDate: string | null;
    terminationDate: string | null;
    cancellationDate: string | null;
    archivingDate: string | null;
    remarks: string;
    fileUploadPath: string;
    undertakingPersonnel: string;
    creatorId: number;
    creatorName: string;
    reviewerId: number | null;
    reviewStatus: ReviewStatus;
    reviewTime: string | null;
    reviewOpinion: string | null;
    reviewCount: number;
    caseStatus: CaseStatus;
    designatedJudge: string;
    createTime: string;
    updateTime: string;
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: CaseInfo[];
    };
  }

  /** 创建案件请求体 */
  export interface CreateCaseRequest {
    caseNumber: string;
    caseName: string;
    acceptanceDate: string;
    caseSource?: string;
    acceptanceCourt?: string;
    designatedInstitution?: string;
    mainResponsiblePerson?: string;
    isSimplifiedTrial?: number;
    caseReason?: string;
    caseProgress?: CaseProgress;
    debtClaimDeadline?: string;
    filingDate?: string;
    remarks?: string;
  }

  /** 创建案件响应 */
  export interface CreateCaseResponse {
    code: number;
    message: string;
    data: {
      caseId: number;
      caseNumber: string;
    };
  }

  /** 更新案件请求体 */
  export interface UpdateCaseRequest {
    caseName?: string;
    caseReason?: string;
    remarks?: string;
    filingDate?: string;
    caseProgress?: CaseProgress;
    mainResponsiblePerson?: string;
    designatedInstitution?: string;
    acceptanceCourt?: string;
    debtClaimDeadline?: string;
  }

  /** 更新案件响应 */
  export interface UpdateCaseResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 案件状态流转请求体 */
  export interface UpdateCaseStatusRequest {
    caseStatus: CaseStatus;
    remark?: string;
  }

  /** 案件状态流转响应 */
  export interface UpdateCaseStatusResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 案件进度更新请求体 */
  export interface UpdateCaseProgressRequest {
    stageName?: string;
    stageDescription?: string;
    startDate?: string;
    endDate?: string;
    expectedEndDate?: string;
    progressStatus?: string;
    completionPercentage?: number;
    keyTasks?: string;
    completedTasks?: string;
    pendingTasks?: string;
    issues?: string;
    solutions?: string;
    attachments?: string;
    responsiblePerson?: string;
    responsiblePersonId?: number;
    remarks?: string;
    isCompleted?: boolean;
  }

  /** 案件进度更新响应 */
  export interface UpdateCaseProgressResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 案件审核请求体 */
  export interface ReviewCaseRequest {
    reviewStatus: ReviewStatus;
    reviewOpinion: string;
  }

  /** 案件审核响应 */
  export interface ReviewCaseResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 案件审核状态响应 */
  export interface ReviewStatusResponse {
    code: number;
    message: string;
    data: {
      id: number;
      caseNumber: string;
      caseName: string;
      reviewStatus: ReviewStatus;
      reviewTime: string;
      reviewOpinion: string;
      reviewCount: number;
      reviewerId: number;
      caseStatus: CaseStatus;
    };
  }

  /** 案件列表查询参数 */
  export interface CaseListQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseStatus?: CaseStatus;
    caseProgress?: CaseProgress;
  }

  /** 案件简单列表查询参数 */
  export interface SimpleCaseListQueryParams {
    page?: number;
    size?: number;
    caseNumber?: string;
  }

  /** 工作团队成员参数 */
  export interface WorkTeamMember {
    userId: number;
    roleId: number;
    permissions?: string[];
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: any;
  }
}

/**
 * 获取案件详情
 * GET /api/v1/case/{caseId}
 */
export async function getCaseDetailApi(caseId: number) {
  return requestClient8085.get<CaseApi.CommonResponse>(`/case/${caseId}`);
}

/**
 * 更新案件信息
 * PUT /api/v1/case/{caseId}
 */
export async function updateCaseApi(caseId: number, data: CaseApi.UpdateCaseRequest) {
  return requestClient8085.put<CaseApi.UpdateCaseResponse>(`/case/${caseId}`, data);
}

/**
 * 案件状态流转
 * PUT /api/v1/case/{caseId}/status
 */
export async function updateCaseStatusApi(caseId: number, data: CaseApi.UpdateCaseStatusRequest) {
  return requestClient8085.put<CaseApi.UpdateCaseStatusResponse>(`/case/${caseId}/status`, data);
}

/**
 * 案件进度更新
 * PUT /api/v1/case/{caseId}/progress
 */
export async function updateCaseProgressApi(caseId: number, data: CaseApi.UpdateCaseProgressRequest) {
  return requestClient8085.put<CaseApi.UpdateCaseProgressResponse>(`/case/${caseId}/progress`, data);
}

/**
 * 创建案件
 * POST /api/v1/case
 */
export async function createCaseApi(data: CaseApi.CreateCaseRequest) {
  return requestClient8085.post<CaseApi.CreateCaseResponse>('/case', data);
}

/**
 * 案件审核
 * POST /api/v1/case/{caseId}/review
 */
export async function reviewCaseApi(caseId: number, data: CaseApi.ReviewCaseRequest) {
  return requestClient8085.post<CaseApi.ReviewCaseResponse>(`/case/${caseId}/review`, data);
}

/**
 * 查询案件审核状态
 * GET /api/v1/case/{caseId}/review-status
 */
export async function getCaseReviewStatusApi(caseId: number) {
  return requestClient8085.get<CaseApi.ReviewStatusResponse>(`/case/${caseId}/review-status`);
}

/**
 * 案件简单信息查询(分页)
 * GET /api/v1/case/simple-list
 */
export async function getCaseSimpleListApi(params: CaseApi.SimpleCaseListQueryParams = {}) {
  return requestClient8085.get<CaseApi.SimpleCaseListResponse>('/case/simple-list', { params });
}

/**
 * 案件列表(分页)
 * GET /api/v1/case/list
 */
export async function getCaseListApi(params: CaseApi.CaseListQueryParams = {}) {
  return requestClient8085.get<CaseApi.CaseListResponse>('/case/list', { params });
}

/**
 * 删除案件
 * DELETE /api/v1/case/{caseId}
 */
export async function deleteCaseApi(caseId: number) {
  return requestClient8085.delete<CaseApi.CommonResponse>(`/case/${caseId}`);
}

/**
 * 上传案件文件
 */
export async function uploadCaseFileApi(
  file: File,
  caseId: number,
  moduleType: string = 'case',
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', moduleType);
  formData.append('bizId', caseId.toString());
  
  return fileUploadRequestClient.post<any>(
    '/api/v1/file/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 批量上传案件文件（循环调用单文件上传）
 */
export async function batchUploadCaseFilesApi(
  files: File[],
  caseId: number,
  moduleType: string = 'case',
) {
  const uploadPromises = files.map(file => uploadCaseFileApi(file, caseId, moduleType));
  const results = await Promise.all(uploadPromises);
  
  const successResults = results.filter(r => r.code === 200).map(r => r.data);
  
  return {
    code: 200,
    message: 'success',
    data: successResults
  };
}

/**
 * 获取案件文件列表（分页）
 */
export async function getCaseFilesApi(
  caseId: number,
  moduleType: string = 'case',
  pageNum: number = 1,
  pageSize: number = 10,
  status?: string,
) {
  return fileUploadRequestClient.get<any>('/api/v1/file/list', {
    params: {
      pageNum,
      pageSize,
      bizType: moduleType,
      bizId: caseId,
      status,
    },
  });
}

/**
 * 删除案件文件
 */
export async function deleteCaseFileApi(fileId: number) {
  return fileUploadRequestClient.delete<any>(
    `/api/v1/file/${fileId}`,
  );
}

/**
 * 下载案件文件
 */
export async function downloadCaseFileApi(fileId: number) {
  return downloadFileApi(fileId);
}

/**
 * 获取案件处理进度数据
 */
export async function getCaseProgressApi(caseId: number) {
  return requestClient8085.get<CaseApi.CommonResponse>(`/case/${caseId}/progress`);
}

/**
 * 审核通过案件
 * @deprecated 请使用 reviewCaseApi 替代
 */
export async function approveCaseApi(caseId: number, opinion: string) {
  return reviewCaseApi(caseId, {
    reviewStatus: 'APPROVED',
    reviewOpinion: opinion,
  });
}

/**
 * 驳回案件
 * @deprecated 请使用 reviewCaseApi 替代
 */
export async function rejectCaseApi(caseId: number, opinion: string) {
  return reviewCaseApi(caseId, {
    reviewStatus: 'REJECTED',
    reviewOpinion: opinion,
  });
}

/**
 * 获取审核日志
 */
export async function getReviewLogsApi(caseId: number) {
  return requestClient8085.get<CaseApi.CommonResponse>(`/case/${caseId}/review-logs`);
}

/**
 * 获取所有案件（别名，兼容旧代码）
 */
export const getAllCasesApi = getCaseListApi;
export const getAllCases = getAllCasesApi;

/**
 * 添加单个破产案件（别名，兼容旧代码）
 */
export const addOneCaseApi = createCaseApi;

/**
 * 获取案件列表（兼容旧代码）
 */
export const getCaseListApiOld = async (params: {
  page: number;
  size: number;
  AJZT?: string;
  AH?: string;
  token?: string;
}) => {
  const queryParams: CaseApi.CaseListQueryParams = {
    pageNum: params.page,
    pageSize: params.size,
  };
  if (params.AJZT) {
    queryParams.caseStatus = params.AJZT as CaseApi.CaseStatus;
  }
  return getCaseListApi(queryParams);
};

/**
 * 获取案件详情（兼容旧代码）
 */
export const getCaseDetailApiOld = async (serialNumber: string) => {
  const caseId = parseInt(serialNumber, 10);
  return getCaseDetailApi(caseId);
};
