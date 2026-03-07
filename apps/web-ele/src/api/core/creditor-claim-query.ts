import { requestClient8085 } from '#/api/request';

export namespace CreditorClaimQueryApi {
  /** 债权申报查询参数 */
  export interface ClaimQueryParams {
    caseId: number | string;
    creditorName?: string;
    creditorType?: string;
    claimType?: string;
  }

  /** 债权申报信息 */
  export interface ClaimInfo {
    creditorName: string;
    creditorType: string;
    claimType: string;
    declaredAmount: number;
    confirmedAmount: number;
    unconfirmedAmount: number;
    registrationStatus: string;
    registrationStatusDesc: string;
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
  return requestClient8085.post<CreditorClaimQueryApi.ApiResponse<CreditorClaimQueryApi.ClaimInfo[]>>(
    '/creditor-claim-query/query',
    params,
  );
}
