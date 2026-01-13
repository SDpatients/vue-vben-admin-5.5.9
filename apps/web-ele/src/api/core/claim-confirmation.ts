import { requestClient8085 } from '#/api/request';

export namespace ClaimConfirmationApi {
  /** 确认状态枚举 */
  export type ConfirmationStatus =
    | 'CONFIRMED'
    | 'COURT'
    | 'LAWSUIT'
    | 'OBJECTION'
    | 'PENDING';

  /** 表决结果枚举 */
  export type VoteResult = 'ABSTAIN' | 'AGREE' | 'DISAGREE';

  /** 会议类型枚举 */
  export type MeetingType = 'FIRST' | 'SECOND' | 'TEMPORARY';

  /** 裁定结果枚举 */
  export type CourtRulingResult =
    | 'CONFIRMED'
    | 'PARTIAL_CONFIRMED'
    | 'UNCONFIRMED';

  /** 诉讼状态枚举 */
  export type LawsuitStatus =
    | 'COMPLETED'
    | 'EXECUTING'
    | 'JUDGED'
    | 'PENDING'
    | 'TRIALING';

  /** 诉讼结果枚举 */
  export type LawsuitResult = 'LOSE' | 'PARTIAL' | 'SETTLED' | 'WIN';

  /** 最终确认依据枚举 */
  export type FinalConfirmationBasis =
    | 'COURT'
    | 'MEETING'
    | 'OTHER'
    | 'SETTLEMENT';

  /** 创建债权确认请求 */
  export interface CreateClaimConfirmationRequest {
    claimRegistrationId: number;
    caseId?: number;
    creditorName?: string;
    meetingType?: MeetingType;
    meetingDate?: string;
    meetingLocation?: string;
    voteResult?: VoteResult;
    voteNotes?: string;
    hasObjection?: number;
    objector?: string;
    objectionReason?: string;
    objectionAmount?: number;
    objectionDate?: string;
    negotiationResult?: string;
    negotiationDate?: string;
    negotiationParticipants?: string;
    courtRulingDate?: string;
    courtRulingNo?: string;
    courtRulingResult?: CourtRulingResult;
    courtRulingAmount?: number;
    courtRulingNotes?: string;
    hasLawsuit?: number;
    lawsuitCaseNo?: string;
    lawsuitStatus?: LawsuitStatus;
    lawsuitResult?: LawsuitResult;
    lawsuitAmount?: number;
    lawsuitNotes?: string;
    finalConfirmedAmount?: number;
    finalConfirmationDate?: string;
    finalConfirmationBasis?: FinalConfirmationBasis;
    confirmationAttachments?: string;
    confirmationStatus?: ConfirmationStatus;
    remarks?: string;
  }

  /** 创建债权确认响应 */
  export interface CreateClaimConfirmationResponse {
    code: number;
    message: string;
    data: {
      confirmationId: number;
    };
  }

  /** 债权确认信息 */
  export interface ClaimConfirmationInfo {
    id: number;
    claimRegistrationId: number;
    caseId: number;
    creditorName: string;
    meetingType: MeetingType;
    meetingDate: string;
    meetingLocation: string;
    voteResult: VoteResult;
    voteNotes: string;
    hasObjection: boolean;
    objector: string;
    objectionReason: string;
    objectionAmount: number;
    objectionDate: string;
    negotiationResult: string;
    negotiationDate: string;
    negotiationParticipants: string;
    courtRulingDate: string;
    courtRulingNo: string;
    courtRulingResult: CourtRulingResult;
    courtRulingAmount: number;
    courtRulingNotes: string;
    hasLawsuit: boolean;
    lawsuitCaseNo: string;
    lawsuitStatus: LawsuitStatus;
    lawsuitResult: LawsuitResult;
    lawsuitAmount: number;
    lawsuitNotes: string;
    finalConfirmedAmount: number;
    finalConfirmationDate: string;
    finalConfirmationBasis: FinalConfirmationBasis;
    confirmationAttachments: string;
    confirmationStatus: ConfirmationStatus;
    remarks: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权确认详情响应 */
  export interface ClaimConfirmationDetailResponse {
    code: number;
    message: string;
    data: ClaimConfirmationInfo;
  }

  /** 债权确认列表响应 */
  export interface ClaimConfirmationListResponse {
    code: number;
    message: string;
    data: {
      list: ClaimConfirmationInfo[];
      total: number;
    };
  }

  /** 更新债权确认请求 */
  export interface UpdateClaimConfirmationRequest {
    creditorName?: string;
    meetingType?: MeetingType;
    meetingDate?: string;
    meetingLocation?: string;
    voteResult?: VoteResult;
    voteNotes?: string;
    hasObjection?: number;
    objector?: string;
    objectionReason?: string;
    objectionAmount?: number;
    objectionDate?: string;
    negotiationResult?: string;
    negotiationDate?: string;
    negotiationParticipants?: string;
    courtRulingDate?: string;
    courtRulingNo?: string;
    courtRulingResult?: CourtRulingResult;
    courtRulingAmount?: number;
    courtRulingNotes?: string;
    hasLawsuit?: number;
    lawsuitCaseNo?: string;
    lawsuitStatus?: LawsuitStatus;
    lawsuitResult?: LawsuitResult;
    lawsuitAmount?: number;
    lawsuitNotes?: string;
    finalConfirmedAmount?: number;
    finalConfirmationDate?: string;
    finalConfirmationBasis?: FinalConfirmationBasis;
    confirmationAttachments?: string;
    confirmationStatus?: ConfirmationStatus;
    remarks?: string;
  }

  /** 更新债权确认响应 */
  export interface UpdateClaimConfirmationResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除债权确认响应 */
  export interface DeleteClaimConfirmationResponse {
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

  /** 确认统计响应 */
  export interface ConfirmationStatisticsResponse {
    code: number;
    message: string;
    data: {
      confirmedCount: number;
      courtCount: number;
      lawsuitCount: number;
      objectionCount: number;
      pendingCount: number;
      totalCount: number;
    };
  }
}

/**
 * 创建债权确认记录
 * POST /api/v1/claim-confirmation
 */
export async function createClaimConfirmationApi(
  data: ClaimConfirmationApi.CreateClaimConfirmationRequest,
) {
  return requestClient8085.post<ClaimConfirmationApi.CreateClaimConfirmationResponse>(
    '/claim-confirmation',
    data,
  );
}

/**
 * 获取债权确认详情
 * GET /api/v1/claim-confirmation/{confirmationId}
 */
export async function getClaimConfirmationDetailApi(confirmationId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationDetailResponse>(
    `/claim-confirmation/${confirmationId}`,
  );
}

/**
 * 获取债权的确认记录
 * GET /api/v1/claim-confirmation/claim/{claimId}
 */
export async function getClaimConfirmationByClaimIdApi(claimId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationDetailResponse>(
    `/claim-confirmation/claim/${claimId}`,
  );
}

/**
 * 获取案件的确认记录列表(分页)
 * GET /api/v1/claim-confirmation/case/{caseId}
 */
export async function getClaimConfirmationsByCaseIdApi(
  caseId: number,
  params: { pageNum?: number; pageSize?: number } = {},
) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationListResponse>(
    `/claim-confirmation/case/${caseId}`,
    { params },
  );
}

/**
 * 更新债权确认记录
 * PUT /api/v1/claim-confirmation/{confirmationId}
 */
export async function updateClaimConfirmationApi(
  confirmationId: number,
  data: ClaimConfirmationApi.UpdateClaimConfirmationRequest,
) {
  return requestClient8085.put<ClaimConfirmationApi.UpdateClaimConfirmationResponse>(
    `/claim-confirmation/${confirmationId}`,
    data,
  );
}

/**
 * 删除债权确认记录
 * DELETE /api/v1/claim-confirmation/{confirmationId}
 */
export async function deleteClaimConfirmationApi(confirmationId: number) {
  return requestClient8085.delete<ClaimConfirmationApi.DeleteClaimConfirmationResponse>(
    `/claim-confirmation/${confirmationId}`,
  );
}

/**
 * 提交债权人会议表决
 * POST /api/v1/claim-confirmation/{confirmationId}/vote
 */
export async function submitVoteApi(
  confirmationId: number,
  params: { voteNotes?: string; voteResult: ClaimConfirmationApi.VoteResult },
) {
  return requestClient8085.post<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/vote`,
    null,
    { params },
  );
}

/**
 * 提交债权异议
 * POST /api/v1/claim-confirmation/{confirmationId}/objection
 */
export async function submitObjectionApi(confirmationId: number) {
  return requestClient8085.post<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/objection`,
  );
}

/**
 * 处理异议协商
 * POST /api/v1/claim-confirmation/{confirmationId}/negotiation
 */
export async function handleNegotiationApi(
  confirmationId: number,
  params: { result: string },
) {
  return requestClient8085.post<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/negotiation`,
    null,
    { params },
  );
}

/**
 * 提交法院裁定
 * POST /api/v1/claim-confirmation/{confirmationId}/court-ruling
 */
export async function submitCourtRulingApi(confirmationId: number) {
  return requestClient8085.post<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/court-ruling`,
  );
}

/**
 * 更新诉讼状态
 * PUT /api/v1/claim-confirmation/{confirmationId}/lawsuit-status
 */
export async function updateLawsuitStatusApi(
  confirmationId: number,
  status: ClaimConfirmationApi.LawsuitStatus,
) {
  return requestClient8085.put<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/lawsuit-status`,
    null,
    { params: { status } },
  );
}

/**
 * 最终确认债权
 * POST /api/v1/claim-confirmation/{confirmationId}/finalize
 */
export async function finalizeClaimConfirmationApi(confirmationId: number) {
  return requestClient8085.post<ClaimConfirmationApi.CommonResponse>(
    `/claim-confirmation/${confirmationId}/finalize`,
  );
}

/**
 * 获取有异议的债权
 * GET /api/v1/claim-confirmation/objections/{caseId}
 */
export async function getObjectionClaimsApi(caseId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationListResponse>(
    `/claim-confirmation/objections/${caseId}`,
  );
}

/**
 * 获取有诉讼的债权
 * GET /api/v1/claim-confirmation/lawsuits/{caseId}
 */
export async function getLawsuitClaimsApi(caseId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationListResponse>(
    `/claim-confirmation/lawsuits/${caseId}`,
  );
}

/**
 * 获取待确认的债权
 * GET /api/v1/claim-confirmation/pending/{caseId}
 */
export async function getPendingClaimsForConfirmationApi(caseId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ClaimConfirmationListResponse>(
    `/claim-confirmation/pending/${caseId}`,
  );
}

/**
 * 获取确认统计
 * GET /api/v1/claim-confirmation/statistics/{caseId}
 */
export async function getConfirmationStatisticsApi(caseId: number) {
  return requestClient8085.get<ClaimConfirmationApi.ConfirmationStatisticsResponse>(
    `/claim-confirmation/statistics/${caseId}`,
  );
}

export type { ClaimConfirmationApi };
