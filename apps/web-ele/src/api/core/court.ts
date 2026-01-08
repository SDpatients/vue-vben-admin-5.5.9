import { requestClient } from '#/api/request';

export namespace CourtApi {
  /** 法院信息 */
  export interface CourtInfo {
    courtId: number;
    courtName: string;
    courtCode: string;
    region: string;
    address?: string;
    contactPhone?: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 法院列表响应 */
  export interface CourtListResponse {
    data: {
      count: number;
      pages: number;
      records: CourtInfo[];
    };
    code: number;
    message: string;
  }

  /** 法院响应 */
  export interface CourtResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取法院列表
 */
export async function getCourtListApi() {
  return requestClient.get<CourtApi.CourtListResponse>('/courts');
}

/**
 * 获取法院详情
 */
export async function getCourtDetailApi() {
  return requestClient.get<CourtApi.CourtInfo>('/courts');
}

/**
 * 新增法院
 */
export async function addCourtApi() {
  return requestClient.post<CourtApi.CourtResponse>('/courts');
}

/**
 * 更新法院
 */
export async function updateCourtApi() {
  return requestClient.put<CourtApi.CourtResponse>('/courts');
}

/**
 * 删除法院
 */
export async function deleteCourtApi() {
  return requestClient.delete<CourtApi.CourtResponse>('/courts');
}
