import { requestClient8085 } from '#/api/request';

export namespace CreditorApi {
  /** 债权人查询参数 */
  export interface CreditorQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    creditorType?: string;
    creditorName?: string;
    idNumber?: string;
    legalRepresentative?: string;
    status?: string;
  }

  /** 债权人信息 */
  export interface CreditorInfo {
    id: number;
    caseId: number;
    creditorName: string;
    creditorType: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    idNumber: string;
    legalRepresentative: string;
    registeredCapital: number;
    status?: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权人列表响应 */
  export interface CreditorListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: CreditorInfo[];
    };
  }

  /** 债权人详情响应 */
  export interface CreditorDetailResponse {
    code: number;
    message: string;
    data: CreditorInfo;
  }

  /** 创建债权人请求 */
  export interface CreateCreditorRequest {
    caseId: number;
    creditorName: string;
    creditorType: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    idNumber?: string;
    legalRepresentative?: string;
    registeredCapital?: number;
    status?: string;
  }

  /** 创建债权人响应 */
  export interface CreateCreditorResponse {
    code: number;
    message: string;
    data: {
      creditorId: number;
    };
  }

  /** 更新债权人请求 */
  export interface UpdateCreditorRequest {
    creditorName?: string;
    creditorType?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    idNumber?: string;
    legalRepresentative?: string;
    registeredCapital?: number;
    status?: string;
    creditorId?: number;
  }

  /** 更新债权人响应 */
  export interface UpdateCreditorResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除债权人响应 */
  export interface DeleteCreditorResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 批量添加债权人请求 */
  export interface BatchAddCreditorsRequest {
    caseId: string;
    creditorsList: Array<{
      creditor_name: string;
      creditor_type: string;
      contact_phone: string;
      contact_email: string;
      address: string;
      id_number: string;
      legal_representative: string;
      registered_capital: string;
      status: string;
      created_by: string;
    }>;
  }

  /** 批量添加债权人响应 */
  export interface BatchAddCreditorsResponse {
    code: number;
    message: string;
    data: {
      successCount: number;
    };
  }

  /** 债权人搜索参数 */
  export interface CreditorSearchParams {
    caseId: number;
    creditorName: string;
    limit?: number;
  }

  /** 债权人搜索结果 */
  export interface CreditorSearchResult {
    id: number;
    caseId: number;
    creditorName: string;
    idNumber: string;
    creditorType: string;
  }

  /** 债权人搜索响应 */
  export interface CreditorSearchResponse {
    code: number;
    message: string;
    data: CreditorSearchResult[];
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 债权申报阶段信息 */
  export interface ClaimRegistrationInfo {
    id: number;
    claimNo: string;
    caseId: number;
    caseName: string;
    debtor: string;
    creditorType: string;
    creditCode: string;
    legalRepresentative: string;
    serviceAddress: string;
    agentName: string;
    agentPhone: string;
    agentIdCard: string;
    agentAddress: string;
    accountName: string;
    creditorBankAccount: string;
    bankName: string;
    principal: number;
    interest: number;
    penalty: number;
    otherLosses: number;
    totalAmount: number;
    hasCourtJudgment: boolean;
    hasExecution: boolean;
    hasCollateral: boolean;
    claimNature: string;
    claimType: string;
    claimFacts: string;
    claimIdentifier: string;
    evidenceList: string;
    evidenceMaterials: string;
    evidenceAttachments: string;
    registrationDate: string;
    registrationDeadline: string;
    materialReceiver: string;
    materialReceiveDate: string;
    materialCompleteness: string;
    registrationStatus: string;
    remarks: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权审查阶段信息 */
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
    evidenceAuthenticity: string;
    evidenceRelevance: string;
    evidenceLegality: string;
    evidenceReviewNotes: string;
    confirmedClaimNature: string;
    isJointLiability: boolean;
    isConditional: boolean;
    isTerm: boolean;
    collateralType: string;
    collateralProperty: string;
    collateralAmount: number;
    collateralTerm: string;
    collateralValidity: string;
    reviewConclusion: string;
    reviewSummary: string;
    reviewReport: string;
    reviewAttachments: string;
    reviewStatus: string;
    remarks: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权确认阶段信息 */
  export interface ClaimConfirmationInfo {
    id: number;
    claimRegistrationId: number;
    caseId: number;
    creditorName: string;
    meetingType: string;
    meetingDate: string;
    meetingLocation: string;
    voteResult: string;
    voteNotes: string;
    hasObjection: boolean;
    objector: string;
    objectionReason: string;
    objectionAmount: number | null;
    objectionDate: string | null;
    negotiationResult: string;
    negotiationDate: string;
    negotiationParticipants: string;
    courtRulingDate: string | null;
    courtRulingNo: string;
    courtRulingResult: string;
    courtRulingAmount: number | null;
    courtRulingNotes: string;
    hasLawsuit: boolean;
    lawsuitCaseNo: string;
    lawsuitStatus: string;
    lawsuitResult: string;
    lawsuitAmount: number | null;
    lawsuitNotes: string;
    finalConfirmedAmount: number;
    finalConfirmationDate: string;
    finalConfirmationBasis: string;
    confirmationAttachments: string;
    confirmationStatus: string;
    remarks: string;
    createTime: string;
    updateTime: string;
  }

  /** 债权人债权阶段详情响应 */
  export interface CreditorClaimStagesResponse {
    code: number;
    message: string;
    data: {
      creditorId: number;
      creditorName: string;
      claimRegistrations: ClaimRegistrationInfo[];
      claimReviews: ClaimReviewInfo[];
      claimConfirmations: ClaimConfirmationInfo[];
    };
  }
}

/**
 * 创建债权人
 * POST /creditor
 */
export async function createCreditorApi(data: CreditorApi.CreateCreditorRequest) {
  return requestClient8085.post<CreditorApi.CreateCreditorResponse>('/creditor', data);
}

/**
 * 获取债权人详情
 * GET /creditor/{creditorId}
 */
export async function getCreditorDetailApi(creditorId: number) {
  return requestClient8085.get<CreditorApi.CreditorDetailResponse>(`/creditor/${creditorId}`);
}

/**
 * 债权人列表（分页）
 * GET /creditor/list
 */
export async function getCreditorListApi(params: CreditorApi.CreditorQueryParams = {}) {
  return requestClient8085.get<CreditorApi.CreditorListResponse>('/creditor/list', { params });
}

/**
 * 更新债权人信息
 * PUT /creditor/{creditorId}
 */
export async function updateCreditorApi(creditorId: number, data: CreditorApi.UpdateCreditorRequest) {
  return requestClient8085.put<CreditorApi.UpdateCreditorResponse>(`/creditor/${creditorId}`, data);
}

/**
 * 删除债权人
 * DELETE /creditor/{creditorId}
 */
export async function deleteCreditorApi(creditorId: number) {
  return requestClient8085.delete<CreditorApi.DeleteCreditorResponse>(`/creditor/${creditorId}`);
}

/**
 * 批量添加债权人
 * POST /creditor/batch
 */
export async function batchAddCreditorsApi(data: CreditorApi.BatchAddCreditorsRequest) {
  return requestClient8085.post<CreditorApi.BatchAddCreditorsResponse>('/creditor/batch', data);
}

/**
 * 获取债权人债权阶段详情
 * GET /creditor/{creditorId}/claim-stages
 */
export async function getCreditorClaimStagesApi(creditorId: number) {
  return requestClient8085.get<CreditorApi.CreditorClaimStagesResponse>(`/creditor/${creditorId}/claim-stages`);
}

/**
 * 搜索债权人（模糊查询）
 * GET /creditor/search
 */
export async function searchCreditorApi(params: CreditorApi.CreditorSearchParams) {
  return requestClient8085.get<CreditorApi.CreditorSearchResponse>('/creditor/search', { params });
}

export type { CreditorApi };
