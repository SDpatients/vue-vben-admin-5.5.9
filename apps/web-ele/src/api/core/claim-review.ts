import { requestClient8085 } from '#/api/request';

export namespace ClaimReviewApi {
  /** 审查状态枚举 */
  export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUPPLEMENT';

  /** 审查结论枚举 */
  export type ReviewConclusion = 'CONFIRMED' | 'PARTIAL_CONFIRMED' | 'UNCONFIRMED';

  /** 证据真实性枚举 */
  export type EvidenceAuthenticity = 'AUTHENTIC' | 'SUSPICIOUS' | 'FAKE';

  /** 证据关联性枚举 */
  export type EvidenceRelevance = 'RELEVANT' | 'IRRELEVANT';

  /** 证据合法性枚举 */
  export type EvidenceLegality = 'LEGAL' | 'ILLEGAL';

  /** 担保有效性枚举 */
  export type CollateralValidity = 'VALID' | 'INVALID' | 'PARTIAL';

  /** 创建债权审查请求 */
  export interface CreateClaimReviewRequest {
    claimRegistrationId: number;
    caseId?: number;
    creditorName?: string;
    reviewDate?: string;
    reviewer?: string;
    reviewRound?: number;
    reviewBasis?: string;
    declaredPrincipal?: number;
    declaredInterest?: number;
    declaredPenalty?: number;
    declaredOtherLosses?: number;
    declaredTotalAmount?: number;
    confirmedPrincipal?: number;
    confirmedInterest?: number;
    confirmedPenalty?: number;
    confirmedOtherLosses?: number;
    confirmedTotalAmount?: number;
    unconfirmedPrincipal?: number;
    unconfirmedInterest?: number;
    unconfirmedPenalty?: number;
    unconfirmedOtherLosses?: number;
    unconfirmedTotalAmount?: number;
    adjustmentReason?: string;
    unconfirmedReason?: string;
    insufficientEvidenceReason?: string;
    expiredReason?: string;
    evidenceAuthenticity?: EvidenceAuthenticity;
    evidenceRelevance?: EvidenceRelevance;
    evidenceLegality?: EvidenceLegality;
    evidenceReviewNotes?: string;
    confirmedClaimNature?: string;
    isJointLiability?: number;
    isConditional?: number;
    isTerm?: number;
    collateralType?: string;
    collateralProperty?: string;
    collateralAmount?: number;
    collateralTerm?: string;
    collateralValidity?: CollateralValidity;
    reviewConclusion?: ReviewConclusion;
    reviewSummary?: string;
    reviewReport?: string;
    reviewAttachments?: string;
    reviewStatus?: ReviewStatus;
    remarks?: string;
  }

  /** 创建债权审查响应 */
  export interface CreateClaimReviewResponse {
    code: number;
    message: string;
    data: {
      reviewId: number;
      reviewRound: number;
    };
  }

  /** 债权审查信息 */
  export interface ClaimReviewInfo {
    id: number;
    claimRegistrationId: number;
    caseId: number;
    creditorName: string;
    reviewDate: string;
    reviewer: string;
    reviewRound: number;
    reviewBasis: string;
    declaredPrincipal: number;
    declaredInterest: number;
    declaredPenalty: number;
    declaredOtherLosses: number;
    declaredTotalAmount: number;
    confirmedPrincipal: number;
    confirmedInterest: number;
    confirmedPenalty: number;
    confirmedOtherLosses: number;
    confirmedTotalAmount: number;
    unconfirmedPrincipal: number;
    unconfirmedInterest: number;
    unconfirmedPenalty: number;
    unconfirmedOtherLosses: number;
    unconfirmedTotalAmount: number;
    adjustmentReason: string;
    unconfirmedReason: string;
    insufficientEvidenceReason: string;
    expiredReason: string;
    evidenceAuthenticity: EvidenceAuthenticity;
    evidenceRelevance: EvidenceRelevance;
    evidenceLegality: EvidenceLegality;
    evidenceReviewNotes: string;
    confirmedClaimNature: string;
    isJointLiability: boolean;
    isConditional: boolean;
    isTerm: boolean;
    collateralType: string;
    collateralProperty: string;
    collateralAmount: number;
    collateralTerm: string;
    collateralValidity: CollateralValidity;
    reviewConclusion: ReviewConclusion;
    reviewSummary: string;
    reviewReport: string;
    reviewAttachments: string;
    reviewStatus: ReviewStatus;
    remarks: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权审查详情响应 */
  export interface ClaimReviewDetailResponse {
    code: number;
    message: string;
    data: ClaimReviewInfo;
  }

  /** 债权审查列表响应 */
  export interface ClaimReviewListResponse {
    code: number;
    message: string;
    data: ClaimReviewInfo[];
  }

  /** 债权审查分页列表响应 */
  export interface ClaimReviewPageResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: ClaimReviewInfo[];
    };
  }

  /** 更新债权审查请求 */
  export interface UpdateClaimReviewRequest {
    creditorName?: string;
    reviewDate?: string;
    reviewer?: string;
    reviewRound?: number;
    reviewBasis?: string;
    declaredPrincipal?: number;
    declaredInterest?: number;
    declaredPenalty?: number;
    declaredOtherLosses?: number;
    declaredTotalAmount?: number;
    confirmedPrincipal?: number;
    confirmedInterest?: number;
    confirmedPenalty?: number;
    confirmedOtherLosses?: number;
    confirmedTotalAmount?: number;
    unconfirmedPrincipal?: number;
    unconfirmedInterest?: number;
    unconfirmedPenalty?: number;
    unconfirmedOtherLosses?: number;
    unconfirmedTotalAmount?: number;
    adjustmentReason?: string;
    unconfirmedReason?: string;
    insufficientEvidenceReason?: string;
    expiredReason?: string;
    evidenceAuthenticity?: EvidenceAuthenticity;
    evidenceRelevance?: EvidenceRelevance;
    evidenceLegality?: EvidenceLegality;
    evidenceReviewNotes?: string;
    confirmedClaimNature?: string;
    isJointLiability?: number;
    isConditional?: number;
    isTerm?: number;
    collateralType?: string;
    collateralProperty?: string;
    collateralAmount?: number;
    collateralTerm?: string;
    collateralValidity?: CollateralValidity;
    reviewConclusion?: ReviewConclusion;
    reviewSummary?: string;
    reviewReport?: string;
    reviewAttachments?: string;
    reviewStatus?: ReviewStatus;
    remarks?: string;
  }

  /** 更新债权审查响应 */
  export interface UpdateClaimReviewResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除债权审查响应 */
  export interface DeleteClaimReviewResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 审查统计响应 */
  export interface ReviewStatisticsResponse {
    code: number;
    message: string;
    data: {
      totalCount: number;
      pendingCount: number;
      inProgressCount: number;
      completedCount: number;
      supplementCount: number;
    };
  }
}

/**
 * 创建债权审查记录
 * POST /api/v1/claim-review
 */
export async function createClaimReviewApi(data: ClaimReviewApi.CreateClaimReviewRequest) {
  return requestClient8085.post<ClaimReviewApi.CreateClaimReviewResponse>('/claim-review', data);
}

/**
 * 获取债权审查详情
 * GET /api/v1/claim-review/{reviewId}
 */
export async function getClaimReviewDetailApi(reviewId: number) {
  return requestClient8085.get<ClaimReviewApi.ClaimReviewDetailResponse>(`/claim-review/${reviewId}`);
}

/**
 * 获取债权的所有审查记录
 * GET /api/v1/claim-review/claim/{claimId}
 */
export async function getClaimReviewsByClaimIdApi(claimId: number) {
  return requestClient8085.get<ClaimReviewApi.ClaimReviewListResponse>(`/claim-review/claim/${claimId}`);
}

/**
 * 获取案件的审查记录列表(分页)
 * GET /api/v1/claim-review/case/{caseId}
 */
export async function getClaimReviewsByCaseIdApi(caseId: number, params: { pageNum?: number; pageSize?: number } = {}) {
  return requestClient8085.get<ClaimReviewApi.ClaimReviewPageResponse>(`/claim-review/case/${caseId}`, { params });
}

/**
 * 更新债权审查记录
 * PUT /api/v1/claim-review/{reviewId}
 */
export async function updateClaimReviewApi(reviewId: number, data: ClaimReviewApi.UpdateClaimReviewRequest) {
  return requestClient8085.put<ClaimReviewApi.UpdateClaimReviewResponse>(`/claim-review/${reviewId}`, data);
}

/**
 * 删除债权审查记录
 * DELETE /api/v1/claim-review/{reviewId}
 */
export async function deleteClaimReviewApi(reviewId: number) {
  return requestClient8085.delete<ClaimReviewApi.DeleteClaimReviewResponse>(`/claim-review/${reviewId}`);
}

/**
 * 提交债权审查
 * POST /api/v1/claim-review/{reviewId}/submit
 */
export async function submitClaimReviewApi(reviewId: number, data?: ClaimReviewApi.CreateClaimReviewRequest) {
  return requestClient8085.post<ClaimReviewApi.CommonResponse>(`/claim-review/${reviewId}/submit`, data);
}

/**
 * 获取待审查的债权
 * GET /api/v1/claim-review/pending/{caseId}
 */
export async function getPendingClaimsForReviewApi(caseId: number) {
  return requestClient8085.get<ClaimReviewApi.ClaimReviewListResponse>(`/claim-review/pending/${caseId}`);
}

/**
 * 获取审查统计
 * GET /api/v1/claim-review/statistics/{caseId}
 */
export async function getReviewStatisticsApi(caseId: number) {
  return requestClient8085.get<ClaimReviewApi.ReviewStatisticsResponse>(`/claim-review/statistics/${caseId}`);
}

export type { ClaimReviewApi };
