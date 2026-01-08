import { requestClient } from '#/api/request';

export namespace CreditorApi {
  /** 债权人信息 */
  export interface CreditorInfo {
    creditorId: number;
    creditorName: string;
    creditorType: string;
    idNumber: string;
    contactPerson?: string;
    contactPhone?: string;
    address?: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权人列表响应 */
  export interface CreditorListResponse {
    data: {
      count: number;
      pages: number;
      records: CreditorInfo[];
    };
    code: number;
    message: string;
  }

  /** 债权人响应 */
  export interface CreditorResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取债权人列表
 */
export async function getCreditorListApi() {
  return requestClient.get<CreditorApi.CreditorListResponse>('/creditors');
}

/**
 * 获取债权人详情
 */
export async function getCreditorDetailApi() {
  return requestClient.get<CreditorApi.CreditorInfo>('/creditors');
}

/**
 * 新增债权人
 */
export async function addCreditorApi() {
  return requestClient.post<CreditorApi.CreditorResponse>('/creditors');
}

/**
 * 更新债权人
 */
export async function updateCreditorApi() {
  return requestClient.put<CreditorApi.CreditorResponse>('/creditors');
}

/**
 * 删除债权人
 */
export async function deleteCreditorApi() {
  return requestClient.delete<CreditorApi.CreditorResponse>('/creditors');
}
