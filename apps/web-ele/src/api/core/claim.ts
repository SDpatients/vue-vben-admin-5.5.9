import { requestClient } from '#/api/request';

export namespace ClaimApi {
  /** 债权申报信息 */
  export interface ClaimInfo {
    claimId: number;
    caseId: number;
    caseNo: string;
    caseName: string;
    creditorId: number;
    creditorName: string;
    claimAmount: number;
    principal: number;
    interest: number;
    claimType: string;
    status: string;
    submitDate: string;
    approvalDate?: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权申报列表响应 */
  export interface ClaimListResponse {
    data: {
      count: number;
      pages: number;
      records: ClaimInfo[];
    };
    code: number;
    message: string;
  }

  /** 债权申报响应 */
  export interface ClaimResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取债权申报列表
 */
export async function getClaimListApi() {
  return requestClient.get<ClaimApi.ClaimListResponse>('/claims');
}

/**
 * 获取债权申报详情
 */
export async function getClaimDetailApi() {
  return requestClient.get<ClaimApi.ClaimInfo>('/claims');
}

/**
 * 新增债权申报
 */
export async function addClaimApi() {
  return requestClient.post<ClaimApi.ClaimResponse>('/claims');
}

/**
 * 更新债权申报
 */
export async function updateClaimApi() {
  return requestClient.put<ClaimApi.ClaimResponse>('/claims');
}

/**
 * 删除债权申报
 */
export async function deleteClaimApi() {
  return requestClient.delete<ClaimApi.ClaimResponse>('/claims');
}
