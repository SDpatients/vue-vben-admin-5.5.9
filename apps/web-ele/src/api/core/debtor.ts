import { requestClient } from '#/api/request';

export namespace DebtorApi {
  /** 债务人信息 */
  export interface DebtorInfo {
    debtorId: number;
    debtorName: string;
    debtorType: string;
    idNumber: string;
    contactPerson?: string;
    contactPhone?: string;
    address?: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 债务人列表响应 */
  export interface DebtorListResponse {
    data: {
      count: number;
      pages: number;
      records: DebtorInfo[];
    };
    code: number;
    message: string;
  }

  /** 债务人响应 */
  export interface DebtorResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取债务人列表
 */
export async function getDebtorListApi() {
  return requestClient.get<DebtorApi.DebtorListResponse>('/debtors');
}

/**
 * 获取债务人详情
 */
export async function getDebtorDetailApi() {
  return requestClient.get<DebtorApi.DebtorInfo>('/debtors');
}

/**
 * 新增债务人
 */
export async function addDebtorApi() {
  return requestClient.post<DebtorApi.DebtorResponse>('/debtors');
}

/**
 * 更新债务人
 */
export async function updateDebtorApi() {
  return requestClient.put<DebtorApi.DebtorResponse>('/debtors');
}

/**
 * 删除债务人
 */
export async function deleteDebtorApi() {
  return requestClient.delete<DebtorApi.DebtorResponse>('/debtors');
}
