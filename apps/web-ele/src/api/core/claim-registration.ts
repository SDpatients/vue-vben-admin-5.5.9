import { requestClient8085 } from '#/api/request';

export namespace ClaimRegistrationApi {
  /** 登记状态枚举 */
  export type RegistrationStatus = 'PENDING' | 'REGISTERED' | 'REJECTED';

  /** 材料完整性枚举 */
  export type MaterialCompleteness = 'COMPLETE' | 'INCOMPLETE' | 'PENDING';

  /** 债权申报查询参数 */
  export interface ClaimRegistrationQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    registrationStatus?: RegistrationStatus;
  }

  /** 债权申报信息 */
  export interface ClaimRegistrationInfo {
    id: number;
    claimNo: string;
    caseId: number;
    caseName: string;
    debtor: string;
    creditorName: string;
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
    materialCompleteness: MaterialCompleteness;
    registrationStatus: RegistrationStatus;
    remarks: string;
    createTime: string;
    updateTime: string;
    reviewInfo?: ReviewInfo;
    confirmationInfo?: ConfirmationInfo;
  }

  /** 审查信息 */
  export interface ReviewInfo {
    id: number;
    reviewDate: string;
    reviewer: string;
    reviewRound: number;
    reviewBasis: string;
    declaredTotalAmount: number;
    confirmedTotalAmount: number;
    unconfirmedTotalAmount: number;
    reviewConclusion: string;
    reviewStatus: string;
  }

  /** 确认信息 */
  export interface ConfirmationInfo {
    id: number;
    meetingType: string;
    meetingDate: string;
    meetingLocation: string;
    voteResult: string;
    hasObjection: boolean;
    finalConfirmedAmount: number;
    finalConfirmationDate: string;
    finalConfirmationBasis: string;
    confirmationStatus: string;
  }

  /** 债权申报列表响应 */
  export interface ClaimRegistrationListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: ClaimRegistrationInfo[];
    };
  }

  /** 债权申报详情响应 */
  export interface ClaimRegistrationDetailResponse {
    code: number;
    message: string;
    data: ClaimRegistrationInfo;
  }

  /** 创建债权申报请求 */
  export interface CreateClaimRegistrationRequest {
    caseId: number;
    caseName?: string;
    debtor?: string;
    creditorName: string;
    creditorType: string;
    creditCode?: string;
    legalRepresentative?: string;
    serviceAddress?: string;
    agentName?: string;
    agentPhone?: string;
    agentIdCard?: string;
    agentAddress?: string;
    accountName?: string;
    creditorBankAccount?: string;
    bankName?: string;
    principal?: number;
    interest?: number;
    penalty?: number;
    otherLosses?: number;
    totalAmount: number;
    hasCourtJudgment?: number;
    hasExecution?: number;
    hasCollateral?: number;
    claimNature?: string;
    claimType: string;
    claimFacts?: string;
    claimIdentifier?: string;
    evidenceList?: string;
    evidenceMaterials?: string;
    evidenceAttachments?: string;
    registrationDate?: string;
    registrationDeadline?: string;
    materialReceiver?: string;
    materialReceiveDate?: string;
    materialCompleteness?: MaterialCompleteness;
    remarks?: string;
  }

  /** 创建债权申报响应 */
  export interface CreateClaimRegistrationResponse {
    code: number;
    message: string;
    data: {
      claimId: number;
      claimNo: string;
    };
  }

  /** 更新债权申报请求 */
  export interface UpdateClaimRegistrationRequest {
    creditorName?: string;
    creditorType?: string;
    creditCode?: string;
    legalRepresentative?: string;
    serviceAddress?: string;
    agentName?: string;
    agentPhone?: string;
    agentIdCard?: string;
    agentAddress?: string;
    accountName?: string;
    creditorBankAccount?: string;
    bankName?: string;
    principal?: number;
    interest?: number;
    penalty?: number;
    otherLosses?: number;
    totalAmount?: number;
    hasCourtJudgment?: number;
    hasExecution?: number;
    hasCollateral?: number;
    claimNature?: string;
    claimType?: string;
    claimFacts?: string;
    claimIdentifier?: string;
    evidenceList?: string;
    evidenceMaterials?: string;
    evidenceAttachments?: string;
    registrationDate?: string;
    registrationDeadline?: string;
    materialReceiver?: string;
    materialReceiveDate?: string;
    materialCompleteness?: MaterialCompleteness;
    registrationStatus?: RegistrationStatus;
    remarks?: string;
  }

  /** 更新债权申报响应 */
  export interface UpdateClaimRegistrationResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除债权申报响应 */
  export interface DeleteClaimRegistrationResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 接收申报材料请求 */
  export interface ReceiveMaterialRequest {
    receiver: string;
    completeness: MaterialCompleteness;
  }

  /** 接收申报材料响应 */
  export interface ReceiveMaterialResponse {
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
}

/**
 * 创建债权申报登记
 * POST /api/v1/claim-registration
 */
export async function createClaimRegistrationApi(data: ClaimRegistrationApi.CreateClaimRegistrationRequest) {
  return requestClient8085.post<ClaimRegistrationApi.CreateClaimRegistrationResponse>('/claim-registration', data);
}

/**
 * 获取债权申报详情
 * GET /api/v1/claim-registration/{claimId}
 */
export async function getClaimRegistrationDetailApi(claimId: number) {
  return requestClient8085.get<ClaimRegistrationApi.ClaimRegistrationDetailResponse>(`/claim-registration/${claimId}`);
}

/**
 * 获取债权申报基本信息
 * GET /api/v1/claim-registration/{claimId}/basic
 */
export async function getClaimRegistrationBasicApi(claimId: number) {
  return requestClient8085.get<ClaimRegistrationApi.ClaimRegistrationDetailResponse>(`/claim-registration/${claimId}/basic`);
}

/**
 * 债权申报列表(分页)
 * GET /api/v1/claim-registration/list
 */
export async function getClaimRegistrationListApi(params: ClaimRegistrationApi.ClaimRegistrationQueryParams = {}) {
  return requestClient8085.get<ClaimRegistrationApi.ClaimRegistrationListResponse>('/claim-registration/list', { params });
}

/**
 * 更新债权申报
 * PUT /api/v1/claim-registration/{claimId}
 */
export async function updateClaimRegistrationApi(claimId: number, data: ClaimRegistrationApi.UpdateClaimRegistrationRequest) {
  return requestClient8085.put<ClaimRegistrationApi.UpdateClaimRegistrationResponse>(`/claim-registration/${claimId}`, data);
}

/**
 * 删除债权申报
 * DELETE /api/v1/claim-registration/{claimId}
 */
export async function deleteClaimRegistrationApi(claimId: number) {
  return requestClient8085.delete<ClaimRegistrationApi.DeleteClaimRegistrationResponse>(`/claim-registration/${claimId}`);
}

/**
 * 更新债权申报状态
 * PUT /api/v1/claim-registration/{claimId}/status
 */
export async function updateClaimRegistrationStatusApi(claimId: number, status: ClaimRegistrationApi.RegistrationStatus) {
  return requestClient8085.put<ClaimRegistrationApi.CommonResponse>(`/claim-registration/${claimId}/status`, null, {
    params: { status },
  });
}

/**
 * 接收申报材料
 * POST /api/v1/claim-registration/{claimId}/material
 */
export async function receiveClaimMaterialApi(claimId: number, data: ClaimRegistrationApi.ReceiveMaterialRequest) {
  return requestClient8085.post<ClaimRegistrationApi.ReceiveMaterialResponse>(`/claim-registration/${claimId}/material`, null, {
    params: data,
  });
}

export type { ClaimRegistrationApi };
