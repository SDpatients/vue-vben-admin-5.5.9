import http from './request'

export interface BaseDataListParams {
  pageNum?: number
  pageSize?: number
}

export interface BaseListResponse<T> {
  code: number
  message: string
  data: {
    total: number
    list: T[]
  }
}

export interface BaseDetailResponse<T> {
  code: number
  message: string
  data: T
}

export interface BaseIdResponse {
  code: number
  message: string
  data: {
    id: number
  }
}

export interface BaseNullResponse {
  code: number
  message: string
  data: null
}

export interface CreditorItem {
  id: number
  caseId: number
  caseNo: string
  caseName: string
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

export interface DebtorItem {
  id: number
  caseId: number
  caseNo: string
  caseName: string
  enterpriseName: string
  unifiedSocialCreditCode: string
  legalRepresentative: string
  contactPhone: string
  contactPerson: string
  businessScope: string
  industry: string
  registeredAddress: string
  createTime: string
  updateTime: string
}

export interface CourtItem {
  id: number
  caseId: number
  caseNo: string
  caseName: string
  fullName: string
  shortName: string
  courtLevel: string
  contactPhone: string
  undertakingJudge: string
  responsibleUserId: number
  createTime: string
  updateTime: string
}

export interface BankAccountItem {
  id: number
  accountName: string
  accountNumber: string
  accountType: string
  bankName: string
  openingBank: string
  currentBalance: number
  status: string
  caseId: number
  caseNumber: string
  caseName: string
  currency?: string
  openingDate?: string
  closingDate?: string | null
  password?: string
  createTime: string
  updateTime: string
  createUserId?: number
  updateUserId?: number
  totalInflow?: number
  totalOutflow?: number
}

export interface BankTransactionItem {
  id: number
  accountId: number
  accountName: string
  accountNumber: string
  bankName: string
  transactionType: 'IN' | 'OUT'
  amount: number
  transactionDate: string
  summary?: string
  businessType?: string
  counterpartyAccount?: string
  counterpartyName?: string
  balanceAfter: number
  attachmentId?: number | null
  relatedBusinessId?: number | null
  remark?: string
  caseId: number
  caseNumber?: string
  caseName?: string
  status?: string
  createTime: string
  updateTime: string
  createUserId?: number
  updateUserId?: number
}

export interface WorkPlanItem {
  id: number
  caseId: number
  planType: string
  planContent: string
  startDate: string
  endDate: string
  responsibleUserId: number
  executionStatus: string
  status: string
  createTime: string
  updateTime: string
}

export interface WorkTeamItem {
  id: number
  caseId: number
  caseNo: string
  caseName: string
  teamName: string
  teamLeaderId: number
  teamDescription: string
  status: string
  createTime: string
  updateTime: string
}

export interface TeamMemberItem {
  id: number
  teamId: number
  teamName: string
  caseId: number
  caseName: string
  userId: number
  userName: string
  userRealName: string
  teamRole: string
  permissionLevel: string
  isActive: number
  status: string
  createTime: string
  updateTime: string
}

export interface WorkTeamMemberPermission {
  id: number
  teamMemberId: number
  permissionType: string
  isAllowed: number
  createTime: string
  updateTime: string
}

export interface AdministratorItem {
  id: number
  caseId: number
  administratorName: string
  contactPhone: string
  contactEmail: string
  officeAddress: string
  responsiblePersonId: number
  createTime: string
  updateTime: string
}

export interface StaffItem {
  id: number
  status: string
  isDeleted: boolean
  createTime: string
  updateTime: string
  createUserId: number | null
  updateUserId: number | null
  administratorId: number
  name: string
  staffType: string | null
  idNumber: string | null
  lawyerLicenseNumber: string | null
  contactPhone: string | null
  email: string | null
  responsibility: string | null
  appointmentDate: string | null
  userId: number | null
}

export const getCreditorList = (params?: BaseDataListParams & { caseId?: number; caseNumber?: string; creditorType?: string; creditorName?: string; status?: string }) => {
  return http.get<BaseListResponse<CreditorItem>>('/creditor/list', params)
}

export const getCreditorDetail = (creditorId: number) => {
  return http.get<BaseDetailResponse<CreditorItem>>(`/creditor/${creditorId}`)
}

export const createCreditor = (data: Partial<CreditorItem>) => {
  return http.post<BaseIdResponse>('/creditor', data)
}

export const updateCreditor = (creditorId: number, data: Partial<CreditorItem>) => {
  return http.put<BaseNullResponse>(`/creditor/${creditorId}`, data)
}

export const deleteCreditor = (creditorId: number) => {
  return http.delete<BaseNullResponse>(`/creditor/${creditorId}`)
}

export const getDebtorList = (params?: BaseDataListParams & { caseId?: number; enterpriseName?: string; unifiedSocialCreditCode?: string; legalRepresentative?: string; industry?: string }) => {
  return http.get<BaseListResponse<DebtorItem>>('/debtor/list', params)
}

export const getDebtorDetail = (debtorId: number) => {
  return http.get<BaseDetailResponse<DebtorItem>>(`/debtor/${debtorId}`)
}

export const createDebtor = (data: Partial<DebtorItem>) => {
  return http.post<BaseIdResponse>('/debtor', data)
}

export const updateDebtor = (debtorId: number, data: Partial<DebtorItem>) => {
  return http.put<BaseNullResponse>(`/debtor/${debtorId}`, data)
}

export const deleteDebtor = (debtorId: number) => {
  return http.delete<BaseNullResponse>(`/debtor/${debtorId}`)
}

export const getCourtList = (params?: BaseDataListParams & { courtLevel?: string; shortName?: string; fullName?: string }) => {
  return http.get<BaseListResponse<CourtItem>>('/court/list', params)
}

export const getCourtDetail = (courtId: number) => {
  return http.get<BaseDetailResponse<CourtItem>>(`/court/${courtId}`)
}

export const createCourt = (data: Partial<CourtItem>) => {
  return http.post<BaseIdResponse>('/court', data)
}

export const updateCourt = (courtId: number, data: Partial<CourtItem>) => {
  return http.put<BaseNullResponse>(`/court/${courtId}`, data)
}

export const deleteCourt = (courtId: number) => {
  return http.delete<BaseNullResponse>(`/court/${courtId}`)
}

export const getBankAccountList = (params?: BaseDataListParams & { accountType?: string; status?: string; accountName?: string; caseId?: number }) => {
  return http.get<BaseListResponse<BankAccountItem>>('/bank-account/list', params)
}

export const getBankAccountDetail = (accountId: number) => {
  return http.get<BaseDetailResponse<BankAccountItem>>(`/bank-account/${accountId}`)
}

export const createBankAccount = (data: Partial<BankAccountItem>) => {
  return http.post<BaseIdResponse>('/bank-account', data)
}

export const updateBankAccount = (accountId: number, data: Partial<BankAccountItem>) => {
  return http.put<BaseNullResponse>(`/bank-account/${accountId}`, data)
}

export const updateBankAccountPassword = (accountId: number, data: { oldPassword: string; newPassword: string }) => {
  return http.put<BaseNullResponse>(`/bank-account/${accountId}/password`, data)
}

export const updateBankAccountStatus = (accountId: number, status: string) => {
  return http.put<BaseNullResponse>(`/bank-account/${accountId}/status`, { status })
}

export const deleteBankAccount = (accountId: number) => {
  return http.delete<BaseNullResponse>(`/bank-account/${accountId}`)
}

export const getBankAccountWithTransactions = (accountId: number) => {
  return http.get<BaseDetailResponse<BankAccountItem & { transactions: BankTransactionItem[]; totalInflow: number; totalOutflow: number }>>(`/bank-account/${accountId}/with-transactions`)
}

export const getBankAccountTransactions = (accountId: number, params?: BaseDataListParams & { transactionType?: string; businessType?: string; startDate?: string; endDate?: string; caseId?: number }) => {
  return http.get<BaseListResponse<BankTransactionItem>>(`/bank-account/${accountId}/transactions`, params)
}

export const getBankTransactionList = (params?: BaseDataListParams & { accountId?: number; transactionType?: string; businessType?: string; startDate?: string; endDate?: string; caseId?: number }) => {
  return http.get<BaseListResponse<BankTransactionItem>>('/bank-account-transaction/list', params)
}

export const getBankTransactionDetail = (transactionId: number) => {
  return http.get<BaseDetailResponse<BankTransactionItem>>(`/bank-account-transaction/${transactionId}`)
}

export const createBankTransaction = (data: Partial<BankTransactionItem>) => {
  return http.post<BaseIdResponse>('/bank-account-transaction', data)
}

export const updateBankTransaction = (transactionId: number, data: Partial<BankTransactionItem>) => {
  return http.put<BaseNullResponse>(`/bank-account-transaction/${transactionId}`, data)
}

export const deleteBankTransaction = (transactionId: number) => {
  return http.delete<BaseNullResponse>(`/bank-account-transaction/${transactionId}`)
}

export const getWorkPlanList = (params?: BaseDataListParams & { caseId?: number; planType?: string; executionStatus?: string; status?: string; planContent?: string }) => {
  return http.get<BaseListResponse<WorkPlanItem>>('/work-plan/list', params)
}

export const getWorkPlanDetail = (planId: number) => {
  return http.get<BaseDetailResponse<WorkPlanItem>>(`/work-plan/${planId}`)
}

export const createWorkPlan = (data: Partial<WorkPlanItem>) => {
  return http.post<BaseIdResponse>('/work-plan', data)
}

export const updateWorkPlan = (planId: number, data: Partial<WorkPlanItem>) => {
  return http.put<BaseNullResponse>(`/work-plan/${planId}`, data)
}

export const updateWorkPlanExecutionStatus = (planId: number, executionStatus: string) => {
  return http.put<BaseNullResponse>(`/work-plan/${planId}/execution-status`, { executionStatus })
}

export const deleteWorkPlan = (planId: number) => {
  return http.delete<BaseNullResponse>(`/work-plan/${planId}`)
}

export const getWorkTeamList = (params?: BaseDataListParams & { caseId?: number; status?: string }) => {
  return http.get<BaseListResponse<WorkTeamItem>>('/work-team/list', params)
}

export const getWorkTeamDetail = (teamId: number) => {
  return http.get<BaseDetailResponse<WorkTeamItem>>(`/work-team/${teamId}`)
}

export const createWorkTeam = (data: Partial<WorkTeamItem>) => {
  return http.post<BaseIdResponse>('/work-team', data)
}

export const updateWorkTeam = (teamId: number, data: Partial<WorkTeamItem>) => {
  return http.put<BaseNullResponse>(`/work-team/${teamId}`, data)
}

export const deleteWorkTeam = (teamId: number) => {
  return http.delete<BaseNullResponse>(`/work-team/${teamId}`)
}

export const addTeamMember = (teamId: number, data: { userId: number; role?: string; status?: string }) => {
  return http.post<BaseIdResponse>(`/work-team/${teamId}/member`, data)
}

export const getTeamMembers = (teamId: number) => {
  return http.get<{ code: number; message: string; data: TeamMemberItem[] }>(`/work-team/${teamId}/members`)
}

export const getTeamMemberPermissions = (memberId: number) => {
  return http.get<{ code: number; message: string; data: WorkTeamMemberPermission[] }>(`/work-team/work-team-member/${memberId}/permissions`)
}

export const updateTeamMemberPermission = (memberId: number, permissionLevel: string) => {
  return http.put<BaseNullResponse>(`/work-team/work-team-member/${memberId}/permission`, { permissionLevel })
}

export const getAdministratorList = (params?: BaseDataListParams & { caseId?: number }) => {
  return http.get<BaseListResponse<AdministratorItem>>('/administrator/list', params)
}

export const getAdministratorDetail = (administratorId: number) => {
  return http.get<BaseDetailResponse<AdministratorItem>>(`/administrator/${administratorId}`)
}

export const createAdministrator = (data: Partial<AdministratorItem>) => {
  return http.post<BaseIdResponse>('/administrator', data)
}

export const updateAdministrator = (administratorId: number, data: Partial<AdministratorItem>) => {
  return http.put<BaseNullResponse>(`/administrator/${administratorId}`, data)
}

export const deleteAdministrator = (administratorId: number) => {
  return http.delete<BaseNullResponse>(`/administrator/${administratorId}`)
}

export const addAdministratorStaff = (administratorId: number, data: Partial<StaffItem>) => {
  return http.post<BaseIdResponse>(`/administrator/${administratorId}/staff`, data)
}

export const getAdministratorStaffList = (administratorId: number) => {
  return http.get<{ code: number; message: string; data: StaffItem[] }>(`/administrator/${administratorId}/staff/list`)
}

export const getAdministratorStaffDetail = (administratorId: number, staffId: number) => {
  return http.get<BaseDetailResponse<StaffItem>>(`/administrator/${administratorId}/staff/${staffId}`)
}
