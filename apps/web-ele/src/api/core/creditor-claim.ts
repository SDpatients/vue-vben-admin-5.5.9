import { requestClient8085 } from '#/api/request';

export namespace CreditorClaimApi {
  /** 债权申报审核请求 */
  export interface ReviewClaimRequest {
    registrationStatus: string;       // 必填，登记状态
    reviewOpinion: string;             // 必填，审核意见
    claimNatureManager?: string;       // 债权性质管理人
  }

  /** 债权申报审核响应 */
  export interface ReviewClaimResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 债权申报审核状态响应 */
  export interface ReviewStatusResponse {
    code: number;
    message: string;
    data: {
      id: number;
      creditorName: string;
      registrationStatus: string;
      claimNatureManager: string;
      reviewOpinion: string;
    };
  }

  /** 债权申报统计查询参数 */
  export interface ClaimStatisticsQueryParams {
    caseId?: number;
    startDate?: string;
    endDate?: string;
    registrationStatus?: string;
    claimType?: string;
    claimNature?: string;
  }

  /** 债权申报统计数据 */
  export interface ClaimStatisticsInfo {
    totalClaims: number;                     // 总债权数
    pendingClaims: number;                   // 待处理债权数
    registeredClaims: number;                // 已登记债权数
    rejectedClaims: number;                  // 已拒绝债权数
    statusDistribution: Record<string, number>; // 状态分布
    claimTypeDistribution: Record<string, number>; // 债权类型分布
    claimNatureDistribution: Record<string, number>; // 债权性质分布
    totalPrincipalAmount: number;            // 总本金
    totalInterestAmount: number;             // 总利息
    totalPenaltyAmount: number;              // 总违约金
    totalOtherLossesAmount: number;          // 总其他损失
    totalClaimAmount: number;                // 总债权金额
    averageClaimAmount: number;              // 平均债权金额
    todayCreatedClaims: number;              // 今日新增债权数
    monthCreatedClaims: number;              // 本月新增债权数
    yearCreatedClaims: number;               // 本年新增债权数
    hasCourtJudgmentClaims: number;          // 有法院判决书的债权数
    hasExecutionClaims: number;              // 有执行文书的债权数
    hasCollateralClaims: number;             // 有担保的债权数
  }

  /** 债权申报统计响应 */
  export interface ClaimStatisticsResponse {
    code: number;
    message: string;
    data: ClaimStatisticsInfo;
  }
}

/**
 * 债权申报审核
 * POST /api/v1/creditor-claim/{claimId}/review
 */
export async function reviewCreditorClaimApi(claimId: number, data: CreditorClaimApi.ReviewClaimRequest) {
  return requestClient8085.post<CreditorClaimApi.ReviewClaimResponse>(`/creditor-claim/${claimId}/review`, data);
}

/**
 * 查询债权申报审核状态
 * GET /api/v1/creditor-claim/{claimId}/review-status
 */
export async function getCreditorClaimReviewStatusApi(claimId: number) {
  return requestClient8085.get<CreditorClaimApi.ReviewStatusResponse>(`/creditor-claim/${claimId}/review-status`);
}

/**
 * 获取债权申报统计数据
 * GET /api/v1/creditor-claim-statistics
 */
export async function getCreditorClaimStatisticsApi(params: CreditorClaimApi.ClaimStatisticsQueryParams = {}) {
  return requestClient8085.get<CreditorClaimApi.ClaimStatisticsResponse>('/creditor-claim-statistics', { params });
}

export type { CreditorClaimApi };
