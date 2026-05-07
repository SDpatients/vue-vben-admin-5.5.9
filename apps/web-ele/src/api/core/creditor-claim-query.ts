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
    creditorId: number;
    caseId: number;
    creditorName: string;
    creditorType: string;
    creditorStatus: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    address: string | null;
    idNumber: string | null;
    legalRepresentative: string | null;
    registeredCapital: number | null;
    caseNumber: string | null;
    caseName: string | null;
    createTime: string | null;
    updateTime: string | null;
    claimType: string | null;
    accountName: string | null;
    creditorBankAccount: string | null;
    bankName: string | null;
    declaredPrincipal: number | null;
    declaredInterest: number | null;
    declaredPenalty: number | null;
    declaredOtherLosses: number | null;
    declaredTotalAmount: number | null;
    remarks: string | null;
    confirmedPrincipal: number | null;
    confirmedInterest: number | null;
    confirmedPenalty: number | null;
    confirmedOtherLosses: number | null;
    confirmedTotalAmount: number | null;
    reductionAmount: number | null;
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
