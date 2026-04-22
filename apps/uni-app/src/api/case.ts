import http from './request'

// 后端返回的案件数据结构
export interface CaseItem {
  id: number
  caseNumber: string // 案件编号
  caseName: string // 案件名称
  status: string // ACTIVE/INACTIVE
  caseStatus: string // ONGOING/CLOSED 等案件状态
  caseProgress: string // FIRST/SECOND 等案件进度
  acceptanceCourt: string // 受理法院
  mainResponsiblePerson: string // 主要负责人
  createTime: string
  updateTime: string
  acceptanceDate: string // 受理日期
  isDeleted: boolean
  createUserId: number
  updateUserId: number
  caseSource?: string // 案件来源
  designatedInstitution?: string // 指定机构
  isSimplifiedTrial?: boolean // 是否简易审理
  caseReason?: string // 案由
  debtClaimDeadline?: string // 债权申报截止日期
  filingDate?: string // 立案日期
  closingDate?: string // 结案日期
  bankruptcyDate?: string // 破产日期
  terminationDate?: string // 终止日期
  cancellationDate?: string // 注销日期
  archivingDate?: string // 归档日期
  remarks?: string // 备注
  fileUploadPath?: string // 文件上传路径
  undertakingPersonnel?: string // 承办人员
  designatedJudge?: string // 指定法官
}

export interface CaseDetail extends CaseItem {
  // 详情页可能需要的额外字段
  creditorCount?: number // 债权人数量
  claimAmount?: number // 申报债权金额
  confirmedAmount?: number // 确认债权金额
  managerName?: string // 管理人名称
  managerPhone?: string // 管理人电话
  description?: string // 案件描述
}

export interface CaseListParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  caseNumber?: string
  caseName?: string
  caseStatus?: string
  caseProgress?: string
  acceptanceCourt?: string
  designatedInstitution?: string
  mainResponsiblePerson?: string
  caseSource?: string
  caseReason?: string
  designatedJudge?: string
  acceptanceDateStart?: string
  acceptanceDateEnd?: string
  filingDateStart?: string
  filingDateEnd?: string
  createDateStart?: string
  createDateEnd?: string
  reviewStatus?: string
  isSimplifiedTrial?: boolean
  undertakingPersonnel?: string
  sortField?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CaseListResponse {
  code: number
  message: string
  data: {
    list: CaseItem[]
    total: number
    pageNum?: number
    pageSize?: number
  }
}

export interface CaseDetailResponse {
  code: number
  message: string
  data: CaseDetail
}

export interface UpdateCaseParams {
  caseName?: string
  caseReason?: string
  remarks?: string
  filingDate?: string
  caseProgress?: string
  mainResponsiblePerson?: string
  designatedInstitution?: string
  acceptanceCourt?: string
  debtClaimDeadline?: string
  designatedJudge?: string
  acceptanceDate?: string
}

export interface FileItem {
  id: number
  fileName: string
  originalFileName: string
  fileSize: number
  fileExtension: string
  filePath: string
  uploadTime: string
  mimeType?: string
  bizType?: string
  bizId?: number
  uploadUserId?: number
  fileStatus?: number
  status?: string
  createTime?: string
  updateTime?: string
}

export interface FileListResponse {
  code: number
  message: string
  data: {
    list: FileItem[]
    total: number
  }
}

export interface FileUploadResponse {
  code: number
  message: string
  data: FileItem
}

export interface FileStatisticsResponse {
  code: number
  message: string
  data: {
    totalFiles: number
    totalSize: number
    totalSizeMB: number
    statusCount: Record<string, number>
    extensionCount: Record<string, number>
  }
}

export interface CaseMyStatsResponse {
  code: number
  message: string
  data: {
    totalCases: number
    inProgressCases: number
    completedCases: number
  }
}

// ================= 债权管理 API =================

export interface ClaimRegistrationItem {
  id: number
  claimNo: string
  caseId: number
  caseName: string
  debtor: string
  creditorName: string
  creditorType: string
  creditCode: string
  principal: number
  interest: number
  penalty: number
  otherLosses: number
  totalAmount: number
  claimNature: string
  claimType: string
  registrationStatus: string
  materialCompleteness: string
  registrationDate: string
  createTime: string
  updateTime: string
  reviewInfo: ClaimReviewItem | null
}

export interface ClaimRegistrationListResponse {
  code: number
  message: string
  data: {
    total: number
    list: ClaimRegistrationItem[]
  }
}

export interface ClaimReviewItem {
  id: number
  claimRegistrationId: number
  caseId: number
  creditorName: string
  reviewDate: string
  reviewer: string
  reviewRound: number
  declaredPrincipal: number
  declaredInterest: number
  declaredTotalAmount: number
  confirmedPrincipal: number
  confirmedInterest: number
  confirmedTotalAmount: number
  unconfirmedPrincipal: number
  unconfirmedInterest: number
  unconfirmedTotalAmount: number
  reviewConclusion: string
  reviewSummary: string
  reviewStatus: string
  createTime: string
  updateTime: string
}

export interface ClaimReviewListResponse {
  code: number
  message: string
  data: {
    total: number
    list: ClaimReviewItem[]
  }
}

export interface ClaimConfirmationItem {
  id: number
  claimRegistrationId: number
  caseId: number
  creditorName: string
  meetingType: string
  meetingDate: string
  voteResult: string
  hasObjection: boolean
  objectionReason: string
  objectionAmount: number | null
  finalConfirmedAmount: number
  finalConfirmationDate: string
  confirmationStatus: string
  createTime: string
  updateTime: string
}

export interface ClaimConfirmationListResponse {
  code: number
  message: string
  data: {
    total: number
    list: ClaimConfirmationItem[]
  }
}

export interface ClaimStatsResponse {
  code: number
  message: string
  data: {
    totalClaims: number
    pendingClaims: number
    registeredClaims: number
    reviewingClaims: number
    confirmedClaims: number
    rejectedClaims: number
    totalDeclaredAmount: number
    totalConfirmedAmount: number
  }
}

// ================= 债权人 API =================

export interface CreditorItem {
  id: number
  caseId: number
  creditorName: string
  creditorType: string
  contactPhone: string
  contactEmail: string
  address: string
  idNumber: string
  legalRepresentative: string
  registeredCapital: number
  status: string
  createTime: string
  updateTime: string
}

export interface CreditorListResponse {
  code: number
  message: string
  data: {
    total: number
    list: CreditorItem[]
  }
}

export interface CreditorDetailResponse {
  code: number
  message: string
  data: CreditorItem
}

export const getMyCaseStats = () => {
  return http.get<CaseMyStatsResponse>('/case/my-stats')
}

// ================= 债权申报阶段 API =================

export const getClaimRegistrationList = (params: { caseId?: number; pageNum?: number; pageSize?: number; registrationStatus?: string }) => {
  return http.get<ClaimRegistrationListResponse>('/claim-registration/list', params)
}

export const getClaimRegistrationDetail = (claimId: number) => {
  return http.get<{ code: number; message: string; data: ClaimRegistrationItem }>(`/claim-registration/${claimId}`)
}

export const createClaimRegistration = (data: {
  caseId: number
  claimNo?: string
  caseName?: string
  debtor?: string
  creditorName: string
  creditorType: string
  creditCode?: string
  principal: number
  interest: number
  penalty: number
  otherLosses: number
  claimNature: string
  claimType: string
  registrationStatus: string
  materialCompleteness: string
  registrationDate: string
}) => {
  return http.post<{ code: number; message: string; data: { claimId: number } }>('/claim-registration', data)
}

export const updateClaimRegistration = (claimId: number, data: {
  principal?: number
  interest?: number
  penalty?: number
  otherLosses?: number
  claimNature?: string
  claimType?: string
  materialCompleteness?: string
}) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}`, data)
}

export const deleteClaimRegistration = (claimId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}`)
}

export const receiveClaimMaterial = (claimId: number, params: { receiver: string; completeness: string }) => {
  return http.post<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}/material`, null, { params })
}

export const updateClaimStatus = (claimId: number, status: string) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}/status`, null, { params: { status } })
}

export const rejectClaim = (claimId: number, reason: string) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}/reject`, `rejectReason=${encodeURIComponent(reason)}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}

export const submitClaimRegistration = (claimId: number) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}/submit`)
}

export const confirmRegistrationMaterial = (claimId: number) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-registration/${claimId}/material-confirm`)
}

export const getClaimStats = (caseId: number) => {
  return http.get<ClaimStatsResponse>(`/claim-registration/stats/${caseId}`)
}

// ================= 债权审查阶段 API =================

export const getClaimReviewList = (caseId: number, params?: { pageNum?: number; pageSize?: number }) => {
  return http.get<ClaimReviewListResponse>(`/claim-review/case/${caseId}`, params)
}

export const getClaimReviewDetail = (reviewId: number) => {
  return http.get<{ code: number; message: string; data: ClaimReviewItem }>(`/claim-review/${reviewId}`)
}

export const createClaimReview = (data: {
  claimRegistrationId: number
  caseId: number
  creditorName: string
  reviewRound: number
  reviewDate: string
  reviewer: string
  declaredPrincipal: number
  declaredInterest: number
  declaredPenalty: number
  declaredOtherLosses: number
  declaredTotalAmount: number
  confirmedPrincipal: number
  confirmedInterest: number
  confirmedPenalty: number
  confirmedOtherLosses: number
  confirmedTotalAmount: number
  unconfirmedPrincipal: number
  unconfirmedInterest: number
  unconfirmedPenalty: number
  unconfirmedOtherLosses: number
  unconfirmedTotalAmount: number
  reviewConclusion: string
  reviewSummary: string
  reviewStatus: string
}) => {
  return http.post<{ code: number; message: string; data: { reviewId: number } }>('/claim-review', data)
}

export const updateClaimReview = (reviewId: number, data: {
  reviewDate?: string
  reviewRound?: number
  reviewer?: string
  declaredPrincipal?: number
  declaredInterest?: number
  declaredPenalty?: number
  declaredOtherLosses?: number
  declaredTotalAmount?: number
  confirmedPrincipal?: number
  confirmedInterest?: number
  confirmedPenalty?: number
  confirmedOtherLosses?: number
  confirmedTotalAmount?: number
  unconfirmedPrincipal?: number
  unconfirmedInterest?: number
  unconfirmedPenalty?: number
  unconfirmedOtherLosses?: number
  unconfirmedTotalAmount?: number
  reviewConclusion?: string
  reviewSummary?: string
  reviewStatus?: string
}) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-review/${reviewId}`, data)
}

export const deleteClaimReview = (reviewId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/claim-review/${reviewId}`)
}

export const submitClaimReview = (reviewId: number) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-review/${reviewId}/submit`)
}

export const startClaimReview = (reviewId: number, params: { reviewer: string }) => {
  return http.post<{ code: number; message: string; data: null }>(`/claim-review/${reviewId}/start`, null, { params })
}

export const getClaimReviewStats = (caseId: number) => {
  return http.get<{ code: number; message: string; data: { totalReviews: number; pendingReviews: number; inProgressReviews: number; completedReviews: number; supplementReviews: number } }>(`/claim-review/stats/${caseId}`)
}

// ================= 债权确认阶段 API =================

export const getClaimConfirmationList = (caseId: number, params?: { pageNum?: number; pageSize?: number }) => {
  return http.get<ClaimConfirmationListResponse>(`/claim-confirmation/case/${caseId}`, params)
}

export const getClaimConfirmationDetail = (confirmationId: number) => {
  return http.get<{ code: number; message: string; data: ClaimConfirmationItem }>(`/claim-confirmation/${confirmationId}`)
}

export const createClaimConfirmation = (data: {
  claimRegistrationId: number
  caseId: number
  creditorName: string
  meetingType: string
  meetingDate: string
  voteResult: string
  hasObjection: boolean
  objectionReason?: string
  objectionAmount?: number
  finalConfirmedAmount: number
  finalConfirmationDate: string
  confirmationStatus: string
}) => {
  return http.post<{ code: number; message: string; data: { confirmationId: number } }>('/claim-confirmation', data)
}

export const updateClaimConfirmation = (confirmationId: number, data: {
  meetingType?: string
  meetingDate?: string
  voteResult?: string
  hasObjection?: boolean
  objectionReason?: string
  objectionAmount?: number
  finalConfirmedAmount?: number
  finalConfirmationDate?: string
  confirmationStatus?: string
}) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-confirmation/${confirmationId}`, data)
}

export const deleteClaimConfirmation = (confirmationId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/claim-confirmation/${confirmationId}`)
}

export const confirmClaimAmount = (confirmationId: number) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-confirmation/${confirmationId}/confirm`)
}

export const raiseClaimObjection = (confirmationId: number, data: { reason: string; amount: number }) => {
  return http.put<{ code: number; message: string; data: null }>(`/claim-confirmation/${confirmationId}/objection`, data)
}

export const getClaimConfirmationStats = (caseId: number) => {
  return http.get<{ code: number; message: string; data: { totalConfirmations: number; pendingConfirmations: number; confirmedCount: number; rejectedCount: number } }>(`/claim-confirmation/stats/${caseId}`)
}

export const getCreditorList = (params: { caseId?: number; pageNum?: number; pageSize?: number; creditorType?: string; status?: string }) => {
  return http.get<CreditorListResponse>('/creditor/list', params)
}

export const getCreditorDetail = (creditorId: number) => {
  return http.get<CreditorDetailResponse>(`/creditor/${creditorId}`)
}

export const createCreditor = (data: {
  caseId: number
  creditorName: string
  creditorType: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  idNumber?: string
  legalRepresentative?: string
  registeredCapital?: number
  status?: string
}) => {
  return http.post<{ code: number; message: string; data: { creditorId: number } }>('/creditor', data)
}

export const updateCreditor = (creditorId: number, data: {
  creditorName?: string
  creditorType?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  idNumber?: string
  legalRepresentative?: string
  registeredCapital?: number
  status?: string
}) => {
  return http.put<{ code: number; message: string; data: null }>(`/creditor/${creditorId}`, data)
}

export const deleteCreditor = (creditorId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/creditor/${creditorId}`)
}

export const batchAddCreditors = (data: { caseId: string; creditorsList: Array<Record<string, string>> }) => {
  return http.post<{ code: number; message: string; data: { successCount: number } }>('/creditor/batch', data)
}

export const searchCreditor = (params: { caseId: number; creditorName: string; limit?: number; status?: string }) => {
  return http.get<{ code: number; message: string; data: { id: number; caseId: number; creditorName: string; idNumber: string; creditorType: string }[] }>('/creditor/search', params)
}

export const getCaseList = (params?: CaseListParams) => {
  console.log('[API] getCaseList called:', params)
  return http.get<CaseListResponse>('/case/list', params)
}

export const advancedCaseSearch = (params: CaseListParams) => {
  console.log('[API] advancedCaseSearch called:', params)
  return http.post<CaseListResponse>('/case-search/advanced', {
    page: params.pageNum || 1,
    pageSize: params.pageSize || 10,
    ...params,
  })
}

export const keywordCaseSearch = (keyword: string, page: number = 1, size: number = 10) => {
  console.log('[API] keywordCaseSearch called:', { keyword, page, size })
  return http.get<CaseListResponse>('/case-search/keyword', {
    keyword,
    page,
    size,
  })
}

export const keywordAndStatusSearch = (
  keyword: string,
  caseStatus: string,
  page: number = 1,
  size: number = 10
) => {
  console.log('[API] keywordAndStatusSearch called:', { keyword, caseStatus, page, size })
  return http.get<CaseListResponse>('/case-search/keyword-and-status', {
    keyword,
    caseStatus,
    page,
    size,
  })
}

export const keywordAndProgressSearch = (
  keyword: string,
  caseProgress: string,
  page: number = 1,
  size: number = 10
) => {
  console.log('[API] keywordAndProgressSearch called:', { keyword, caseProgress, page, size })
  return http.get<CaseListResponse>('/case-search/keyword-and-progress', {
    keyword,
    caseProgress,
    page,
    size,
  })
}

export const keywordStatusProgressSearch = (
  keyword: string,
  caseStatus: string,
  caseProgress: string,
  page: number = 1,
  size: number = 10
) => {
  console.log('[API] keywordStatusProgressSearch called:', { keyword, caseStatus, caseProgress, page, size })
  return http.get<CaseListResponse>('/case-search/keyword-and-status-and-progress', {
    keyword,
    caseStatus,
    caseProgress,
    page,
    size,
  })
}

export const getCaseDetail = (id: string | number) => {
  return http.get<CaseDetailResponse>(`/case/${id}`)
}

export const createCase = (data: Partial<CaseDetail>) => {
  return http.post<{ code: number; message: string; data: CaseItem }>('/case', data)
}

export const updateCase = (id: string | number, data: UpdateCaseParams) => {
  return http.put<{ code: number; message: string; data: null }>(`/case/${id}`, data)
}

export const deleteCase = (id: string | number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/case/${id}`)
}

export const getCaseFiles = (
  caseId: number,
  params?: { pageNum?: number; pageSize?: number; status?: string }
) => {
  console.log('[API] getCaseFiles called:', { caseId, params })
  return http.get<FileListResponse>('/file/list', {
    bizType: 'case',
    bizId: caseId,
    ...params
  })
}

export const getCaseFileInfo = (fileId: number) => {
  console.log('[API] getCaseFileInfo called:', { fileId })
  return http.get<FileUploadResponse>(`/file/${fileId}`)
}

export const deleteCaseFile = (fileId: number) => {
  console.log('[API] deleteCaseFile called:', { fileId })
  return http.delete<{ code: number; message: string; data: null }>(`/file/${fileId}`)
}

export const batchDeleteCaseFiles = (fileIds: number[]) => {
  console.log('[API] batchDeleteCaseFiles called:', { fileIds })
  return http.delete<{ code: number; message: string; data: null }>('/file/batch', fileIds)
}

export const renameCaseFile = (fileId: number, newFileName: string) => {
  console.log('[API] renameCaseFile called:', { fileId, newFileName })
  return http.put<FileUploadResponse>(`/file/${fileId}/rename`, { newFileName })
}

export const updateCaseFileStatus = (fileId: number, status: string) => {
  console.log('[API] updateCaseFileStatus called:', { fileId, status })
  return http.put<FileUploadResponse>(`/file/${fileId}/status`, { status })
}

export const getCaseFileStatistics = (caseId: number) => {
  console.log('[API] getCaseFileStatistics called:', { caseId })
  return http.get<FileStatisticsResponse>('/file/statistics', {
    bizType: 'case',
    bizId: caseId
  })
}

export const getAllCaseFiles = (caseId: number) => {
  console.log('[API] getAllCaseFiles called:', { caseId })
  return http.get<{ code: number; message: string; data: FileItem[] }>('/file/all', {
    bizType: 'case',
    bizId: caseId
  })
}
