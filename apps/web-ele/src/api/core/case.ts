import { downloadFileApi } from '#/api/core/file';
import { fileUploadRequestClient, requestClient8085 } from '#/api/request';

export namespace CaseApi {
<<<<<<< Updated upstream
  /** 案件查询参数 */
  export interface CaseQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }
=======
  /** 案件状态枚举 */
  export type CaseStatus =
    | 'ARCHIVED'
    | 'CLOSED'
    | 'COMPLETED'
    | 'IN_PROGRESS'
    | 'PENDING'
    | 'TERMINATED';

  /** 案件进度枚举 */
  export type CaseProgress =
    | 'FIFTH'
    | 'FIRST'
    | 'FOURTH'
    | 'SECOND'
    | 'SEVENTH'
    | 'SIXTH'
    | 'THIRD';

  /** 审核状态枚举 */
  export type ReviewStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
>>>>>>> Stashed changes

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
      list: SimpleCaseInfo[];
      total: number;
    };
  }

  /** 案件处理进度数据 */
  export interface CaseProgressInfo {
    AJJD: string;
  }

  /** 案件处理进度响应 */
  export interface CaseProgressResponse {
    data: {
      records: CaseProgressInfo[];
    };
    status: string;
    error: string;
  }

  /** 案件信息 */
  export interface CaseInfo {
<<<<<<< Updated upstream
    row: number;
    案件单据号: number;
    案号: string;
    案由: string;
    案件名称: string;
    案件来源: string;
    案件进度: string;
    受理法院: string;
    主要负责人: string;
    创建者: string;
    创建时间: number;
    修改者?: string;
    修改时间?: number;
    管理人: string;
    是否简化审: string;
    备注: string;
    立案日期?: number;
    文件上传?: string;
=======
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
    closingDate: null | string;
    bankruptcyDate: null | string;
    terminationDate: null | string;
    cancellationDate: null | string;
    archivingDate: null | string;
    remarks: string;
    fileUploadPath: string;
    undertakingPersonnel: string;
    creatorId: number;
    creatorName: string;
    reviewerId: null | number;
    reviewStatus: ReviewStatus;
    reviewTime: null | string;
    reviewOpinion: null | string;
    reviewCount: number;
    caseStatus: CaseStatus;
    designatedJudge: string;
    createTime: string;
    updateTime: string;
>>>>>>> Stashed changes
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    data: {
<<<<<<< Updated upstream
      count: number;
      pages: number;
      records: CaseInfo[];
    };
    status: string;
    error: string;
=======
      list: CaseInfo[];
      total: number;
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
      caseName: string;
      caseNumber: string;
      caseStatus: CaseStatus;
      id: number;
      reviewCount: number;
      reviewerId: number;
      reviewOpinion: string;
      reviewStatus: ReviewStatus;
      reviewTime: string;
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
>>>>>>> Stashed changes
  }

  /** 工作团队成员参数 */
  export interface WorkTeamMember {
    userId: number;
    roleId: number;
    permissions?: string[];
  }

  /** 添加案件请求体 */
  export interface AddCaseRequest {
    ah: string;
    ajmc: string;
    slrq?: string;
    ajly?: string;
    slfy?: string;
    zdjg?: string;
    glrfzr?: number;
    sfjhs?: string;
    ay?: string;
    ajjd?: string;
    zqsbjzsj?: string;
    larq?: string;
    jarq?: string;
    pcsj?: string;
    zjsj?: string;
    zxsj?: string;
    gdsj?: string;
    beizhu?: string;
    wjsc?: string;
    sepLd?: number;
    sepMd?: number;
    sepNd?: string;
    selectedManagers?: string[];
    cbry?: number[];
    reviewerId?: number;
    teamMembers?: WorkTeamMember[];
  }

  /** 添加案件响应 */
  export interface AddCaseResponse {
    status: string;
    error: string;
    data: string;
  }

  /** 更新案件请求体 */
  export interface UpdateCaseRequest {
    AJID: string;
    AH?: string;
    AJMC?: string;
    SLRQ?: string;
    AJLY?: string;
    SLFY?: string;
    ZDJG?: string;
    GLRFZR?: string;
    SFJHS?: string;
    AY?: string;
    AJJD?: string;
    ZQSBJZSJ?: string;
    LARQ?: string;
    JARQ?: string;
    PCSJ?: string;
    ZJSJ?: string;
    ZXSJ?: string;
    GDSJ?: string;
    BEIZHU?: string;
    SEP_EUSER?: string;
    SEP_EDATE?: string;
    GLRID?: string;
    GLRLX?: string;
    FZRID?: string;
    LXDH?: string;
    LXYX?: string;
    BGDZ?: string;
    ZT?: string;
    ZQRID?: string;
    ZQR?: string;
    ZQRFL?: string;
    ZJHM?: string;
    FDDBRQY?: string;
    ZCDZ?: string;
    JYFWQY?: string;
    HYFL?: string;
    CLRQQY?: string;
    ZCZBQY?: string;
    ZQSBID?: string;
    ZQRMC?: string;
    ZQRLX?: string;
    SBJE?: string;
    SBYJ?: string;
    JSR?: string;
    SBLX?: string;
    BZ?: string;
    ZQQRID?: string;
    FYCDRQ?: string;
    CDWH?: string;
    ZZJE?: string;
  }

  /** 更新案件响应 */
  export interface UpdateCaseResponse {
    status: string;
    error: string;
    data: string;
  }

  /** 审核日志 */
  export interface CaseReviewLog {
    logId: number;
    caseId: number;
    reviewerId: number;
    reviewerName: string;
    action: string;
    opinion?: string;
    operateTime: string;
    remark?: string;
  }

  /** 审核日志响应 */
  export interface ReviewLogsResponse {
    status: string;
    error: string;
    data: CaseReviewLog[];
  }

  /** 审核请求 */
  export interface ReviewRequest {
    caseId: number;
    opinion: string;
  }

  /** 审核响应 */
  export interface ReviewResponse {
    status: string;
    error: string;
    data: string;
  }

  /** 删除案件响应 */
  export interface DeleteCaseResponse {
    status: string;
    error: string;
    data: string;
  }
}

/** 案件详情响应 */
export interface CaseDetailResponse {
  data: {
    修改时间: string;
    修改者: string;
    债权人名称: string;
    债权人类型: string;
    债权申报截止时间: string;
    创建时间: string;
    创建者: string;
    办公地址: string;
    受理日期: string;
    受理法院: string;
    备注: string;
    归档时间: string;
    律师事务所: string;
    成立日期: string;
    指定机构: string;
    接收人: string;
    是否简化审: string;
    最终金额: string;
    案件单据号: string;
    案件名称: string;
    案件来源: string;
    案件进度: string;
    案号: string;
    案由: string;
    法定代表人: string;
    法院裁定日期: string;
    注册地址: string;
    注册资本: string;
    注销时间: string;
    申报依据: string;
    申报债权人名称: string;
    申报债权人类型: string;
    申报备注: string;
    申报类型: string;
    申报金额: string;
    破产时间: string;
    立案日期: string;
    管理人状态: string;
    管理人类型: string;
    管理人负责人: string;
    终结时间: string;
    经营范围: string;
    结案日期: string;
    联系电话: string;
    联系邮箱: string;
    行业分类: string;
    裁定文号: string;
    证件号码: string;
    负责人: string;
  };
  status: string;
  error: string;
}

/**
 * 获取案件列表
 */
export async function getCaseListApi(params: {
  AH?: string;
  AJZT?: string;
  page: number;
  size: number;
  token?: string;
}) {
  return requestClient8085.get<CaseApi.CaseListResponse>(
    '/api/web/selectAllCase',
    {
      params,
    },
  );
}

/**
 * 获取所有案件
 */
export async function getAllCasesApi(
  params: { page?: number; size?: number } = {},
) {
  const { page = 1, size = 10 } = params;
  return requestClient8085.get('/api/web/selectAllCase', {
    params: { page, size },
  });
}

/**
 * 获取所有案件（别名，兼容旧代码）
 */
export const getAllCases = getAllCasesApi;

/**
 * 获取案件详情
 */
export async function getCaseDetailApi(serialNumber: string) {
  const token = '2855cad9ddb695a4ce1210e79a14b66e';
  return requestClient8085.get<CaseDetailResponse>('/api/web/selectOneCase', {
    params: {
      token,
      SEP_ID: serialNumber,
    },
  });
}

/**
 * 添加单个破产案件
 */
<<<<<<< Updated upstream
export async function addOneCaseApi(data: CaseApi.AddCaseRequest) {
  // 直接发送数据对象，不需要数组包装
  return requestClient8085.post<CaseApi.AddCaseResponse>(
    '/api/web/AddOneCase',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
=======
export async function updateCaseApi(
  caseId: number,
  data: CaseApi.UpdateCaseRequest,
) {
  return requestClient8085.put<CaseApi.UpdateCaseResponse>(
    `/case/${caseId}`,
    data,
  );
}

/**
 * 案件状态流转
 * PUT /api/v1/case/{caseId}/status
 */
export async function updateCaseStatusApi(
  caseId: number,
  data: CaseApi.UpdateCaseStatusRequest,
) {
  return requestClient8085.put<CaseApi.UpdateCaseStatusResponse>(
    `/case/${caseId}/status`,
    data,
  );
}

/**
 * 案件进度更新
 * PUT /api/v1/case/{caseId}/progress
 */
export async function updateCaseProgressApi(
  caseId: number,
  data: CaseApi.UpdateCaseProgressRequest,
) {
  return requestClient8085.put<CaseApi.UpdateCaseProgressResponse>(
    `/case/${caseId}/progress`,
    data,
  );
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
export async function reviewCaseApi(
  caseId: number,
  data: CaseApi.ReviewCaseRequest,
) {
  return requestClient8085.post<CaseApi.ReviewCaseResponse>(
    `/case/${caseId}/review`,
    data,
  );
}

/**
 * 查询案件审核状态
 * GET /api/v1/case/{caseId}/review-status
 */
export async function getCaseReviewStatusApi(caseId: number) {
  return requestClient8085.get<CaseApi.ReviewStatusResponse>(
    `/case/${caseId}/review-status`,
  );
}

/**
 * 案件简单信息查询(分页)
 * GET /api/v1/case/simple-list
 */
export async function getCaseSimpleListApi(
  params: CaseApi.SimpleCaseListQueryParams = {},
) {
  return requestClient8085.get<CaseApi.SimpleCaseListResponse>(
    '/case/simple-list',
    { params },
  );
}

/**
 * 案件列表(分页)
 * GET /api/v1/case/list
 */
export async function getCaseListApi(params: CaseApi.CaseListQueryParams = {}) {
  return requestClient8085.get<CaseApi.CaseListResponse>('/case/list', {
    params,
  });
}

/**
 * 删除案件
 * DELETE /api/v1/case/{caseId}
 */
export async function deleteCaseApi(caseId: number) {
  return requestClient8085.delete<CaseApi.CommonResponse>(`/case/${caseId}`);
>>>>>>> Stashed changes
}

/**
 * 上传案件文件
 */
export async function uploadCaseFileApi(
  file: File,
  SEP_ID: string,
  moduleType: string = 'task',
) {
  const token =
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA';
  const formData = new FormData();
  formData.append('file', file);
<<<<<<< Updated upstream
  return fileUploadRequestClient.post<any>(
    '/api/web/uploadCaseFile',
    formData,
    {
      params: {
        token,
        SEP_ID,
        moduleType,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
=======
  formData.append('bizType', moduleType);
  formData.append('bizId', caseId.toString());

  return fileUploadRequestClient.post<any>('/api/v1/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
>>>>>>> Stashed changes
    },
  });
}

/**
 * 批量上传案件文件
 */
export async function batchUploadCaseFilesApi(
  files: File[],
  SEP_ID: string,
  moduleType: string = 'task',
) {
<<<<<<< Updated upstream
  const token =
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA';
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return fileUploadRequestClient.post<any>(
    '/api/web/batchUploadCaseFiles',
    formData,
    {
      params: {
        token,
        SEP_ID,
        moduleType,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
=======
  const uploadPromises = files.map((file) =>
    uploadCaseFileApi(file, caseId, moduleType),
  );
  const results = await Promise.all(uploadPromises);

  const successResults = results
    .filter((r) => r.code === 200)
    .map((r) => r.data);

  return {
    code: 200,
    message: 'success',
    data: successResults,
  };
>>>>>>> Stashed changes
}

/**
 * 获取案件文件列表
 */
export async function getCaseFilesApi(
  SEP_ID: string,
  moduleType?: string,
  page?: number,
  size?: number,
) {
  const token =
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA';
  return fileUploadRequestClient.get<any>('/api/web/getCaseFiles', {
    params: {
      token,
      SEP_ID,
      moduleType,
      page,
      size,
    },
  });
}

/**
 * 删除案件文件
 */
<<<<<<< Updated upstream
export async function deleteCaseFileApi(fileId: string) {
  const token =
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA';
  return fileUploadRequestClient.delete<any>(
    `/api/web/deleteCaseFile/${fileId}`,
    {
      params: {
        token,
      },
    },
  );
=======
export async function deleteCaseFileApi(fileId: number) {
  return fileUploadRequestClient.delete<any>(`/api/v1/file/${fileId}`);
>>>>>>> Stashed changes
}

/**
 * 下载案件文件
 * @param fileId 文件记录ID (Long类型)
 */
export async function downloadCaseFileApi(fileId: number) {
  return downloadFileApi(fileId);
}

/**
 * 获取案件处理进度数据
 */
<<<<<<< Updated upstream
export async function getCaseProgressApi() {
  const token = '03f07901573e624060991494b3a22422';
  return requestClient8085.get<CaseApi.CaseProgressResponse>(
    '/api/web/selectAllCaseFor',
    {
      params: {
        token,
      },
    },
  );
}

/**
 * 更新案件信息
 */
export async function updateCaseApi(data: CaseApi.UpdateCaseRequest) {
  const token = '03f07901573e624060991494b3a22422';
  return requestClient8085.post<CaseApi.UpdateCaseResponse>(
    '/api/web/updateBCase',
    data,
    {
      params: {
        token,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
=======
export async function getCaseProgressApi(caseId: number) {
  return requestClient8085.get<CaseApi.CommonResponse>(
    `/case/${caseId}/progress`,
>>>>>>> Stashed changes
  );
}

/**
 * 审核通过案件
 */
export async function approveCaseApi(caseId: number, opinion: string) {
  return requestClient8085.post<CaseApi.ReviewResponse>(
    '/api/web/approveCase',
    null,
    {
      params: {
        caseId,
        opinion,
      },
    },
  );
}

/**
 * 驳回案件
 */
export async function rejectCaseApi(caseId: number, opinion: string) {
  return requestClient8085.post<CaseApi.ReviewResponse>(
    '/api/web/rejectCase',
    null,
    {
      params: {
        caseId,
        opinion,
      },
    },
  );
}

/**
 * 获取审核日志
 */
export async function getReviewLogsApi(caseId: number) {
<<<<<<< Updated upstream
  return requestClient8085.get<CaseApi.ReviewLogsResponse>(
    '/api/web/getReviewLogs',
    {
      params: {
        caseId,
      },
    },
=======
  return requestClient8085.get<CaseApi.CommonResponse>(
    `/case/${caseId}/review-logs`,
>>>>>>> Stashed changes
  );
}

/**
 * 删除案件
 */
export async function deleteCaseApi(caseId: number) {
  return requestClient8085.post<CaseApi.DeleteCaseResponse>(
    '/api/web/deleteCase',
    null,
    {
      params: {
        caseId,
      },
    },
  );
}

/**
 * 获取案件简单列表
 */
<<<<<<< Updated upstream
export async function getCaseSimpleListApi(params: {
  caseNumber?: string;
  page?: number;
  size?: number;
}) {
  return requestClient8085.get<CaseApi.SimpleCaseListResponse>(
    '/case/simple-list',
    {
      params,
    },
  );
}
=======
export const addOneCaseApi = createCaseApi;

/**
 * 获取案件列表（兼容旧代码）
 */
export const getCaseListApiOld = async (params: {
  AH?: string;
  AJZT?: string;
  page: number;
  size: number;
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
  const caseId = Number.parseInt(serialNumber, 10);
  return getCaseDetailApi(caseId);
};
>>>>>>> Stashed changes
