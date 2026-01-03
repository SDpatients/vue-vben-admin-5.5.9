import { downloadFileApi } from '#/api/core/file';
import { fileUploadRequestClient, requestClient8085 } from '#/api/request';

export namespace CaseApi {
  /** 案件查询参数 */
  export interface CaseQueryParams {
    page?: number;
    size?: number;
    token?: string;
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
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    data: {
      count: number;
      pages: number;
      records: CaseInfo[];
    };
    status: string;
    error: string;
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
export async function getCaseListApi(params: CaseApi.CaseQueryParams) {
  return requestClient8085.get<CaseApi.CaseListResponse>(
    '/api/web/selectAllCase',
    {
      params,
    },
  );
}

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
export async function addOneCaseApi(data: CaseApi.AddCaseRequest) {
  // 将数据包装为数组格式，符合后端要求的[{}]格式
  return requestClient8085.post<CaseApi.AddCaseResponse>(
    '/api/web/AddOneCase',
    [data],
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
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
    },
  );
}

/**
 * 批量上传案件文件
 */
export async function batchUploadCaseFilesApi(
  files: File[],
  SEP_ID: string,
  moduleType: string = 'task',
) {
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
  return requestClient8085.get<CaseApi.ReviewLogsResponse>(
    '/api/web/getReviewLogs',
    {
      params: {
        caseId,
      },
    },
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

