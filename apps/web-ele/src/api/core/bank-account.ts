import { requestClient } from '#/api/request';

export namespace BankAccountApi {
  /** 银行账户信息 */
  export interface BankAccountInfo {
    accountId: number;
    accountName: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    currency: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 银行账户列表响应 */
  export interface BankAccountListResponse {
    data: {
      count: number;
      pages: number;
      records: BankAccountInfo[];
    };
    code: number;
    message: string;
  }

  /** 银行账户响应 */
  export interface BankAccountResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取银行账户列表
 */
export async function getBankAccountListApi() {
  return requestClient.get<BankAccountApi.BankAccountListResponse>('/bank-accounts');
}

/**
 * 获取银行账户详情
 */
export async function getBankAccountDetailApi() {
  return requestClient.get<BankAccountApi.BankAccountInfo>('/bank-accounts');
}

/**
 * 新增银行账户
 */
export async function addBankAccountApi() {
  return requestClient.post<BankAccountApi.BankAccountResponse>('/bank-accounts');
}

/**
 * 更新银行账户
 */
export async function updateBankAccountApi() {
  return requestClient.put<BankAccountApi.BankAccountResponse>('/bank-accounts');
}

/**
 * 删除银行账户
 */
export async function deleteBankAccountApi() {
  return requestClient.delete<BankAccountApi.BankAccountResponse>('/bank-accounts');
}
