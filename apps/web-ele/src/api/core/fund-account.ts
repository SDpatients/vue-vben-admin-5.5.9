import { fundRequestClient } from '../request';

export namespace FundAccountApi {
  export interface FundAccountInfo {
    id: number;
    accountId: number;
    caseId: number;
    caseName: string;
    accountName: string;
    accountType: string;
    initialBalance: number;
    currentBalance: number;
    bankName: string;
    bankAccount: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  export interface CreateFundAccountRequest {
    accountId: number;
    caseId: number;
    caseName: string;
    accountName: string;
    accountType: string;
    initialBalance: number;
    bankName: string;
    bankAccount: string;
  }

  export interface UpdateFundAccountRequest {
    accountId: number;
    caseId: number;
    caseName: string;
    accountName: string;
    accountType: string;
    bankName: string;
    bankAccount: string;
  }

  export interface UpdateBalanceRequest {
    currentBalance: number;
  }

  export interface UpdateStatusRequest {
    status: string;
  }

  export interface FundAccountListParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    status?: string;
  }

  export interface FundAccountListResponse {
    total: number;
    list: FundAccountInfo[];
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function createFundAccount(
  data: FundAccountApi.CreateFundAccountRequest,
): Promise<FundAccountApi.ApiResponse<{ fundAccountId: number }>> {
  return fundRequestClient.post('/v1/fund-account', data);
}

export async function getFundAccountList(
  params: FundAccountApi.FundAccountListParams,
): Promise<FundAccountApi.ApiResponse<FundAccountApi.FundAccountListResponse>> {
  return fundRequestClient.get('/v1/fund-account/list', { params });
}

export async function getFundAccountDetail(
  fundAccountId: number,
): Promise<FundAccountApi.ApiResponse<FundAccountApi.FundAccountInfo>> {
  return fundRequestClient.get(`/v1/fund-account/${fundAccountId}`);
}

export async function updateFundAccount(
  fundAccountId: number,
  data: FundAccountApi.UpdateFundAccountRequest,
): Promise<FundAccountApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/fund-account/${fundAccountId}`, data);
}

export async function updateFundAccountBalance(
  fundAccountId: number,
  data: FundAccountApi.UpdateBalanceRequest,
): Promise<FundAccountApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/fund-account/${fundAccountId}/balance`, data);
}

export async function updateFundAccountStatus(
  fundAccountId: number,
  data: FundAccountApi.UpdateStatusRequest,
): Promise<FundAccountApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/fund-account/${fundAccountId}/status`, data);
}

export async function deleteFundAccount(
  fundAccountId: number,
): Promise<FundAccountApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/fund-account/${fundAccountId}`);
}
