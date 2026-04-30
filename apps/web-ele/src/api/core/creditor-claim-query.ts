import { requestClient8080 } from '#/api/request';

export namespace CreditorClaimQueryApi {
  /** 债权申报查询参数 */
  export interface ClaimQueryParams {
    caseId: number | string;
    creditorName?: string;
    creditorType?: string;
    claimType?: string;
    creditorStatus?: string;
    pageNum?: number;
    pageSize?: number;
  }

  /** 债权申报信息 */
  export interface ClaimInfo {
    creditorName: string;
    creditorType: string;
    creditorStatus: string;
    claimType: string;
    accountName: string;
    creditorBankAccount: string;
    bankName: string;
    declaredPrincipal: number;
    declaredInterest: number;
    declaredPenalty: number;
    declaredOtherLosses: number;
    declaredTotalAmount: number;
    remarks: string;
    confirmedPrincipal: number;
    confirmedInterest: number;
    confirmedPenalty: number;
    confirmedOtherLosses: number;
    confirmedTotalAmount: number;
    reductionAmount: number;
  }

  /** 分页响应数据类型 */
  export interface PagedResponse {
    total: number;
    list: ClaimInfo[];
    pageNum: number;
    pageSize: number;
  }

  /** 统一响应类型 */
  export type ApiResponse<T = any> = {
    code: number;
    message: string;
    data: T;
  };
}

/**
 * 条件查询债权申报信息
 * POST /creditor-claim-query/query
 */
export async function queryCreditorClaimsApi(
  params: CreditorClaimQueryApi.ClaimQueryParams = {},
) {
  return requestClient8080.post<CreditorClaimQueryApi.ApiResponse<CreditorClaimQueryApi.PagedResponse>>(
    '/creditor-claim-query/query',
    params,
  );
}
