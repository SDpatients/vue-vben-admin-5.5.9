import { requestClient8085 } from '#/api/request';

export namespace CreditorApi {
  /** 债权人查询参数 */
  export interface CreditorQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    creditorType?: string;
    creditorName?: string;
    idNumber?: string;
    legalRepresentative?: string;
    status?: string;
  }

  /** 债权人信息 */
  export interface CreditorInfo {
    id: number;
    caseId: number;
    creditorName: string;
    creditorType: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    idNumber: string;
    legalRepresentative: string;
    registeredCapital: number;
    status?: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权人列表响应 */
  export interface CreditorListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: CreditorInfo[];
    };
  }

  /** 债权人详情响应 */
  export interface CreditorDetailResponse {
    code: number;
    message: string;
    data: CreditorInfo;
  }

  /** 创建债权人请求 */
  export interface CreateCreditorRequest {
    caseId: number;
    creditorName: string;
    creditorType: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    idNumber?: string;
    legalRepresentative?: string;
    registeredCapital?: number;
    status?: string;
  }

  /** 创建债权人响应 */
  export interface CreateCreditorResponse {
    code: number;
    message: string;
    data: {
      creditorId: number;
    };
  }

  /** 更新债权人请求 */
  export interface UpdateCreditorRequest {
    creditorName?: string;
    creditorType?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    idNumber?: string;
    legalRepresentative?: string;
    registeredCapital?: number;
    creditorId?: number;
  }

  /** 更新债权人响应 */
  export interface UpdateCreditorResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除债权人响应 */
  export interface DeleteCreditorResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 创建债权人
 * POST /creditor
 */
export async function createCreditorApi(data: CreditorApi.CreateCreditorRequest) {
  return requestClient8085.post<CreditorApi.CreateCreditorResponse>('/creditor', data);
}

/**
 * 获取债权人详情
 * GET /creditor/{creditorId}
 */
export async function getCreditorDetailApi(creditorId: number) {
  return requestClient8085.get<CreditorApi.CreditorDetailResponse>(`/creditor/${creditorId}`);
}

/**
 * 债权人列表（分页）
 * GET /creditor/list
 */
export async function getCreditorListApi(params: CreditorApi.CreditorQueryParams = {}) {
  return requestClient8085.get<CreditorApi.CreditorListResponse>('/creditor/list', { params });
}

/**
 * 更新债权人信息
 * PUT /creditor/{creditorId}
 */
export async function updateCreditorApi(creditorId: number, data: CreditorApi.UpdateCreditorRequest) {
  return requestClient8085.put<CreditorApi.UpdateCreditorResponse>(`/creditor/${creditorId}`, data);
}

/**
 * 删除债权人
 * DELETE /creditor/{creditorId}
 */
export async function deleteCreditorApi(creditorId: number) {
  return requestClient8085.delete<CreditorApi.DeleteCreditorResponse>(`/creditor/${creditorId}`);
}

export type { CreditorApi };
