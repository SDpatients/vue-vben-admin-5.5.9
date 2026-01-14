import { fundRequestClient } from '../request';

export namespace FundFlowApi {
  export interface FundFlowInfo {
    id: number;
    caseId: number;
    caseName: string;
    accountId: number;
    flowType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    transactionDate: string;
    description: string;
    relatedDocument: string;
    operatorId: number;
    operationTime: string;
    remark: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  export interface CreateFundFlowRequest {
    caseId: number;
    caseName: string;
    accountId: number;
    flowType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    transactionDate: string;
    description?: string;
    relatedDocument?: string;
    remark?: string;
  }

  export interface UpdateFundFlowRequest {
    caseId: number;
    caseName: string;
    accountId: number;
    flowType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    transactionDate: string;
    description?: string;
    relatedDocument?: string;
    operatorId: number;
    operationTime: string;
    remark?: string;
  }

  export interface UpdateStatusRequest {
    status: string;
  }

  export interface FundFlowListParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    accountId?: number;
    flowType?: string;
    status?: string;
  }

  export interface FundFlowListResponse {
    total: number;
    list: FundFlowInfo[];
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function createFundFlow(
  data: FundFlowApi.CreateFundFlowRequest,
): Promise<FundFlowApi.ApiResponse<{ flowId: number }>> {
  return fundRequestClient.post('/v1/fund-flow', data);
}

export async function getFundFlowList(
  params: FundFlowApi.FundFlowListParams,
): Promise<FundFlowApi.ApiResponse<FundFlowApi.FundFlowListResponse>> {
  return fundRequestClient.get('/v1/fund-flow/list', { params });
}

export async function getFundFlowDetail(
  flowId: number,
): Promise<FundFlowApi.ApiResponse<FundFlowApi.FundFlowInfo>> {
  return fundRequestClient.get(`/v1/fund-flow/${flowId}`);
}

export async function updateFundFlow(
  flowId: number,
  data: FundFlowApi.UpdateFundFlowRequest,
): Promise<FundFlowApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/fund-flow/${flowId}`, data);
}

export async function updateFundFlowStatus(
  flowId: number,
  data: FundFlowApi.UpdateStatusRequest,
): Promise<FundFlowApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/fund-flow/${flowId}/status`, data);
}

export async function deleteFundFlow(
  flowId: number,
): Promise<FundFlowApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/fund-flow/${flowId}`);
}
