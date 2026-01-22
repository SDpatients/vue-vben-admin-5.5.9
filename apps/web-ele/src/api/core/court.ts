import { requestClient8085 } from '#/api/request';

export namespace CourtApi {
  /** 法院查询参数 */
  export interface CourtQueryParams {
    pageNum?: number;
    pageSize?: number;
    courtLevel?: string;
    shortName?: string;
  }

  /** 法院信息 */
  export interface CourtInfo {
    id: number; // 法院ID
    fullName: string; // 法院全称
    shortName: string; // 法院简称
    courtLevel: string; // 法院级别
    contactPhone: string; // 联系电话
    undertakingJudge: string; // 承办法官
    responsibleUserId: number; // 负责人ID
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
    address: string; // 地址
    // 兼容旧字段
    sep_id?: string;
    fyqc?: string;
    fyjc?: string;
    fyjb?: string;
    dz?: string;
    lxdh?: string;
    fzr?: string;
    cbfg?: string;
  }

  /** 法院列表响应 */
  export interface CourtListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: CourtInfo[];
    };
  }
}

/**
 * 获取法院列表
 */
export async function getCourtListApi(params: CourtApi.CourtQueryParams) {
  return requestClient8085.get<CourtApi.CourtListResponse>(
    '/court/list',
    {
      params,
    },
  );
}

/** 创建法院请求 */
export interface CreateCourtRequest {
  fullName: string; // 法院全称
  shortName: string; // 法院简称
  courtLevel: string; // 法院级别
  address?: string; // 地址
  contactPhone?: string; // 联系电话
  responsibleUserId?: number; // 负责人ID
  undertakingJudge?: string; // 承办法官
}

/** 更新法院请求 */
export interface UpdateCourtRequest {
  fullName?: string; // 法院全称
  shortName?: string; // 法院简称
  courtLevel?: string; // 法院级别
  address?: string; // 地址
  contactPhone?: string; // 联系电话
  undertakingJudge?: string; // 承办法官
}

/** 法院操作响应 */
export interface CourtOperationResponse {
  code: number;
  message: string;
  data: any;
}

/**
 * 创建法院信息
 */
export async function addCourtApi(data: CreateCourtRequest) {
  return requestClient8085.post<CourtOperationResponse>('/court', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 更新法院信息
 */
export async function updateCourtApi(courtId: number | string, data: UpdateCourtRequest) {
  return requestClient8085.put<CourtOperationResponse>(`/court/${courtId}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 删除法院信息
 */
export async function deleteCourtApi(id: number | string) {
  return requestClient8085.delete<CourtOperationResponse>(`/court/${id}`);
}
