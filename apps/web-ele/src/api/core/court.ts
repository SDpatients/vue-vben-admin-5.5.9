import { requestClient } from '#/api/request';

export namespace CourtApi {
  /** 法院查询参数 */
  export interface CourtQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }

  /** 法院信息 */
  export interface CourtInfo {
    row: number;
    FYQC: string; // 法院全称
    FYJC: string; // 法院简称
    FYJB: string; // 法院级别
    DZ: string; // 地址
    LXDH: string; // 联系电话
    FZR: string; // 负责人
    CBFG: string; // 承办法官
  }

  /** 法院列表响应 */
  export interface CourtListResponse {
    data: {
      count: number;
      pages: number;
      records: CourtInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取法院列表
 */
export async function getCourtListApi(params: CourtApi.CourtQueryParams) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient.get<CourtApi.CourtListResponse>('/api/web/getAllCourt', {
    params: {
      ...params,
      token,
    },
  });
}

/** 添加法院请求 */
export interface AddCourtRequest {
  sep_auser: string;
  sep_adate: string;
  fyqc: string;
  fyjc: string;
  fyjb: string;
  dz: string;
  lxdh: string;
  fzr: string;
  cbfg: string;
  scbj: string;
}

/** 添加法院响应 */
export interface AddCourtResponse {
  status: string;
  error: string;
}

/**
 * 添加法院信息
 */
export async function addCourtApi(data: AddCourtRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient.post<AddCourtResponse>('/api/web/addCourt', [data], {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      token,
    },
  });
}
