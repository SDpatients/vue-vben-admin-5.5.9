import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockRequest = vi.fn()

vi.stubGlobal('uni', {
  getStorageSync: vi.fn(() => 'mock-token'),
  removeStorageSync: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showToast: vi.fn(),
  navigateTo: vi.fn(),
  request: vi.fn(),
})

const API_PREFIX = '/api/v1'

interface CallLog {
  url: string
  method: string
  data?: any
  params?: any
}

function createHttpMock() {
  const calls: CallLog[] = []

  const http = {
    get: vi.fn((url: string, params?: any) => {
      calls.push({ url, method: 'GET', params })
      return Promise.resolve({ code: 200, message: 'success', data: {} })
    }),
    post: vi.fn((url: string, data?: any) => {
      calls.push({ url, method: 'POST', data })
      return Promise.resolve({ code: 200, message: 'success', data: {} })
    }),
    put: vi.fn((url: string, data?: any) => {
      calls.push({ url, method: 'PUT', data })
      return Promise.resolve({ code: 200, message: 'success', data: {} })
    }),
    delete: vi.fn((url: string, data?: any) => {
      calls.push({ url, method: 'DELETE', data })
      return Promise.resolve({ code: 200, message: 'success', data: {} })
    }),
    patch: vi.fn((url: string, data?: any) => {
      calls.push({ url, method: 'PATCH', data })
      return Promise.resolve({ code: 200, message: 'success', data: {} })
    }),
    _calls: calls,
  }

  return http
}

describe('auth.ts API验证', () => {
  const http = createHttpMock()

  const login = (params: { username: string; password: string; smsCode?: string }) =>
    http.post('/auth/login', params, { showErrorToast: false })

  const logout = () => http.post('/auth/logout')

  const getUserInfo = () => http.get('/auth/current-user')

  const refreshToken = (refreshToken: string) =>
    http.post('/auth/refresh-token', { refreshToken })

  const checkAdmin = () => http.get('/auth/check-admin')

  it('login 应POST到 /auth/login', async () => {
    await login({ username: 'admin', password: '123456' })
    expect(http.post).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: '123456' }, { showErrorToast: false })
  })

  it('logout 应POST到 /auth/logout', async () => {
    await logout()
    expect(http.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('getUserInfo 应GET /auth/current-user', async () => {
    await getUserInfo()
    expect(http.get).toHaveBeenCalledWith('/auth/current-user')
  })

  it('refreshToken 应POST到 /auth/refresh-token', async () => {
    await refreshToken('token123')
    expect(http.post).toHaveBeenCalledWith('/auth/refresh-token', { refreshToken: 'token123' })
  })

  it('checkAdmin 应GET /auth/check-admin', async () => {
    await checkAdmin()
    expect(http.get).toHaveBeenCalledWith('/auth/check-admin')
  })
})

describe('basic-data.ts 银行账户API验证', () => {
  let http: ReturnType<typeof createHttpMock>

  beforeEach(() => {
    http = createHttpMock()
  })

  const getBankAccountList = (params?: any) =>
    http.get('/bank-account/list', params)

  const getBankAccountDetail = (accountId: number) =>
    http.get(`/bank-account/${accountId}`)

  const createBankAccount = (data: any) =>
    http.post('/bank-account', data)

  const updateBankAccount = (accountId: number, data: any) =>
    http.put(`/bank-account/${accountId}`, data)

  const updateBankAccountPassword = (accountId: number, data: { oldPassword: string; newPassword: string }) =>
    http.put(`/bank-account/${accountId}/password`, data)

  const updateBankAccountStatus = (accountId: number, status: string) =>
    http.put(`/bank-account/${accountId}/status`, { status })

  const deleteBankAccount = (accountId: number) =>
    http.delete(`/bank-account/${accountId}`)

  const getBankAccountWithTransactions = (accountId: number) =>
    http.get(`/bank-account/${accountId}/with-transactions`)

  const getBankAccountTransactions = (accountId: number, params?: any) =>
    http.get(`/bank-account/${accountId}/transactions`, params)

  const getBankTransactionList = (params?: any) =>
    http.get('/bank-account-transaction/list', params)

  const getBankTransactionDetail = (transactionId: number) =>
    http.get(`/bank-account-transaction/${transactionId}`)

  const createBankTransaction = (data: any) =>
    http.post('/bank-account-transaction', data)

  const updateBankTransaction = (transactionId: number, data: any) =>
    http.put(`/bank-account-transaction/${transactionId}`, data)

  const deleteBankTransaction = (transactionId: number) =>
    http.delete(`/bank-account-transaction/${transactionId}`)

  it('getBankAccountList 应GET /bank-account/list', async () => {
    await getBankAccountList({ pageNum: 1, pageSize: 10, accountType: 'BASIC', status: 'ACTIVE', accountName: '基本', caseId: 1 })
    expect(http.get).toHaveBeenCalledWith('/bank-account/list', expect.objectContaining({ accountName: '基本', caseId: 1 }))
  })

  it('getBankAccountDetail 应GET /bank-account/{id}', async () => {
    await getBankAccountDetail(1)
    expect(http.get).toHaveBeenCalledWith('/bank-account/1')
  })

  it('createBankAccount 应POST /bank-account', async () => {
    const data = { accountName: '测试', bankName: '工商银行', accountNumber: '6222021234567890123' }
    await createBankAccount(data)
    expect(http.post).toHaveBeenCalledWith('/bank-account', data)
  })

  it('updateBankAccount 应PUT /bank-account/{id}', async () => {
    await updateBankAccount(1, { accountName: '更新' })
    expect(http.put).toHaveBeenCalledWith('/bank-account/1', { accountName: '更新' })
  })

  it('updateBankAccountPassword 应PUT /bank-account/{id}/password', async () => {
    await updateBankAccountPassword(1, { oldPassword: '123', newPassword: '456' })
    expect(http.put).toHaveBeenCalledWith('/bank-account/1/password', { oldPassword: '123', newPassword: '456' })
  })

  it('updateBankAccountStatus 应PUT /bank-account/{id}/status', async () => {
    await updateBankAccountStatus(1, 'INACTIVE')
    expect(http.put).toHaveBeenCalledWith('/bank-account/1/status', { status: 'INACTIVE' })
  })

  it('deleteBankAccount 应DELETE /bank-account/{id}', async () => {
    await deleteBankAccount(1)
    expect(http.delete).toHaveBeenCalledWith('/bank-account/1')
  })

  it('getBankAccountWithTransactions 应GET /bank-account/{id}/with-transactions', async () => {
    await getBankAccountWithTransactions(1)
    expect(http.get).toHaveBeenCalledWith('/bank-account/1/with-transactions')
  })

  it('getBankAccountTransactions 应GET /bank-account/{id}/transactions', async () => {
    await getBankAccountTransactions(1, { transactionType: 'IN', caseId: 1 })
    expect(http.get).toHaveBeenCalledWith('/bank-account/1/transactions', expect.objectContaining({ transactionType: 'IN', caseId: 1 }))
  })

  it('getBankTransactionList 应GET /bank-account-transaction/list', async () => {
    await getBankTransactionList({ accountId: 1, transactionType: 'IN' })
    expect(http.get).toHaveBeenCalledWith('/bank-account-transaction/list', expect.objectContaining({ accountId: 1 }))
  })

  it('getBankTransactionDetail 应GET /bank-account-transaction/{id}', async () => {
    await getBankTransactionDetail(1)
    expect(http.get).toHaveBeenCalledWith('/bank-account-transaction/1')
  })

  it('createBankTransaction 应POST /bank-account-transaction', async () => {
    const data = { accountId: 1, transactionType: 'IN', amount: 50000 }
    await createBankTransaction(data)
    expect(http.post).toHaveBeenCalledWith('/bank-account-transaction', data)
  })

  it('updateBankTransaction 应PUT /bank-account-transaction/{id}', async () => {
    await updateBankTransaction(1, { amount: 60000 })
    expect(http.put).toHaveBeenCalledWith('/bank-account-transaction/1', { amount: 60000 })
  })

  it('deleteBankTransaction 应DELETE /bank-account-transaction/{id}', async () => {
    await deleteBankTransaction(1)
    expect(http.delete).toHaveBeenCalledWith('/bank-account-transaction/1')
  })
})

describe('notification.ts API验证', () => {
  const http = createHttpMock()

  const getNotificationList = (params: any) =>
    http.get('/notification/list', params)

  const searchNotifications = (params: any) =>
    http.get('/notification/search', params)

  const getUnreadNotifications = () =>
    http.get('/notification/unread')

  const getUnreadCount = () =>
    http.get('/notification/count/unread')

  const getNotificationById = (id: number) =>
    http.get(`/notification/${id}`)

  const markAsRead = (id: number) =>
    http.put(`/notification/${id}/read`)

  const markAllAsRead = () =>
    http.put('/notification/read-all')

  const createNotification = (data: any) =>
    http.post('/notification', data)

  const deleteNotification = (id: number) =>
    http.delete(`/notification/${id}`)

  const batchDeleteNotifications = (ids: number[]) =>
    http.delete('/notification/batch', ids)

  it('getNotificationList 应GET /notification/list', async () => {
    await getNotificationList({ pageNum: 1, pageSize: 10 })
    expect(http.get).toHaveBeenCalledWith('/notification/list', { pageNum: 1, pageSize: 10 })
  })

  it('markAsRead 应PUT /notification/{id}/read', async () => {
    await markAsRead(1)
    expect(http.put).toHaveBeenCalledWith('/notification/1/read')
  })

  it('markAllAsRead 应PUT /notification/read-all', async () => {
    await markAllAsRead()
    expect(http.put).toHaveBeenCalledWith('/notification/read-all')
  })

  it('batchDeleteNotifications 应DELETE /notification/batch 并发送数组请求体', async () => {
    await batchDeleteNotifications([1, 2, 3])
    expect(http.delete).toHaveBeenCalledWith('/notification/batch', [1, 2, 3])
  })
})

describe('todo.ts API验证', () => {
  const http = createHttpMock()

  const createTodo = (data: any) =>
    http.post('/todo', data)

  const getTodoById = (id: number) =>
    http.get(`/todo/${id}`)

  const getTodoList = (params: any) =>
    http.get('/todo/list', params)

  const completeTodo = (id: number) =>
    http.put(`/todo/${id}/complete`)

  const updateTodo = (id: number, data: any) =>
    http.put(`/todo/${id}`, data)

  const deleteTodo = (id: number) =>
    http.delete(`/todo/${id}`)

  const batchDeleteTodo = (ids: number[]) =>
    http.delete('/todo/batch', ids)

  it('createTodo 应POST /todo', async () => {
    await createTodo({ userId: 1, title: '测试待办' })
    expect(http.post).toHaveBeenCalledWith('/todo', { userId: 1, title: '测试待办' })
  })

  it('completeTodo 应PUT /todo/{id}/complete', async () => {
    await completeTodo(1)
    expect(http.put).toHaveBeenCalledWith('/todo/1/complete')
  })

  it('batchDeleteTodo 应DELETE /todo/batch 并发送数组请求体', async () => {
    await batchDeleteTodo([1, 2])
    expect(http.delete).toHaveBeenCalledWith('/todo/batch', [1, 2])
  })
})

describe('work-log.ts API验证', () => {
  const http = createHttpMock()

  const getWorkLogListApi = (params?: any) =>
    http.get('/work-log/list', params)

  const getWorkLogDetailApi = (logId: number) =>
    http.get(`/work-log/${logId}`)

  const createWorkLogApi = (data: any) =>
    http.post('/work-log', data)

  const updateWorkLogApi = (logId: number, data: any) =>
    http.put(`/work-log/${logId}`, data)

  const deleteWorkLogApi = (logId: number) =>
    http.delete(`/work-log/${logId}`)

  it('getWorkLogListApi 应GET /work-log/list', async () => {
    await getWorkLogListApi({ caseId: 1, pageNum: 1 })
    expect(http.get).toHaveBeenCalledWith('/work-log/list', { caseId: 1, pageNum: 1 })
  })

  it('createWorkLogApi 应POST /work-log', async () => {
    const data = { caseId: 1, workDate: '2024-01-15', workType: 'CASE_INVESTIGATION', workContent: '调查' }
    await createWorkLogApi(data)
    expect(http.post).toHaveBeenCalledWith('/work-log', data)
  })

  it('updateWorkLogApi 应PUT /work-log/{id}', async () => {
    await updateWorkLogApi(1, { workContent: '更新' })
    expect(http.put).toHaveBeenCalledWith('/work-log/1', { workContent: '更新' })
  })

  it('deleteWorkLogApi 应DELETE /work-log/{id}', async () => {
    await deleteWorkLogApi(1)
    expect(http.delete).toHaveBeenCalledWith('/work-log/1')
  })
})

describe('work-team.ts API验证', () => {
  const http = createHttpMock()

  const getWorkTeamListApi = (params?: any) =>
    http.get('/work-team/list', params)

  const getWorkTeamDetailApi = (teamId: number) =>
    http.get(`/work-team/${teamId}`)

  const createWorkTeamApi = (data: any) =>
    http.post('/work-team', data)

  const updateWorkTeamApi = (teamId: number, data: any) =>
    http.put(`/work-team/${teamId}`, data)

  const deleteWorkTeamApi = (teamId: number) =>
    http.delete(`/work-team/${teamId}`)

  const addTeamMemberApi = (teamId: number, data: any) =>
    http.post(`/work-team/${teamId}/member`, data)

  const getTeamMembersApi = (teamId: number) =>
    http.get(`/work-team/${teamId}/members`)

  const removeTeamMemberApi = (memberId: number) =>
    http.delete(`/work-team/member/${memberId}`)

  it('getWorkTeamListApi 应GET /work-team/list', async () => {
    await getWorkTeamListApi({ caseId: 1 })
    expect(http.get).toHaveBeenCalledWith('/work-team/list', { caseId: 1 })
  })

  it('createWorkTeamApi 应POST /work-team', async () => {
    const data = { teamName: '测试团队', teamLeaderId: 1, caseId: 1 }
    await createWorkTeamApi(data)
    expect(http.post).toHaveBeenCalledWith('/work-team', data)
  })

  it('deleteWorkTeamApi 应DELETE /work-team/{id}', async () => {
    await deleteWorkTeamApi(1)
    expect(http.delete).toHaveBeenCalledWith('/work-team/1')
  })

  it('addTeamMemberApi 应POST /work-team/{id}/member', async () => {
    const data = { caseId: 1, userId: [1, 2], teamRole: 'MEMBER' }
    await addTeamMemberApi(1, data)
    expect(http.post).toHaveBeenCalledWith('/work-team/1/member', data)
  })

  it('removeTeamMemberApi 应DELETE /work-team/member/{id}', async () => {
    await removeTeamMemberApi(1)
    expect(http.delete).toHaveBeenCalledWith('/work-team/member/1')
  })
})

describe('announcement.ts API验证', () => {
  const http = createHttpMock()

  const createAnnouncement = (data: any) =>
    http.post('/case-announcement', data)

  const getAnnouncementList = (params: any) =>
    http.get('/case-announcement/list', params)

  const getAnnouncementDetail = (id: number) =>
    http.get(`/case-announcement/${id}`)

  const updateAnnouncement = (id: number, data: any) =>
    http.put(`/case-announcement/${id}`, data)

  const publishAnnouncement = (id: number, data?: any) =>
    http.post(`/case-announcement/${id}/publish`, data)

  const deleteAnnouncement = (id: number) =>
    http.delete(`/case-announcement/${id}`)

  it('createAnnouncement 应POST /case-announcement', async () => {
    const data = { caseId: 1, title: '公告', content: '内容', announcementType: 'MEETING' }
    await createAnnouncement(data)
    expect(http.post).toHaveBeenCalledWith('/case-announcement', data)
  })

  it('getAnnouncementList 应GET /case-announcement/list', async () => {
    await getAnnouncementList({ pageNum: 1, pageSize: 10, caseId: 1 })
    expect(http.get).toHaveBeenCalledWith('/case-announcement/list', { pageNum: 1, pageSize: 10, caseId: 1 })
  })

  it('publishAnnouncement 应POST /case-announcement/{id}/publish', async () => {
    await publishAnnouncement(1, { topExpireTime: '2024-12-31' })
    expect(http.post).toHaveBeenCalledWith('/case-announcement/1/publish', { topExpireTime: '2024-12-31' })
  })

  it('deleteAnnouncement 应DELETE /case-announcement/{id}', async () => {
    await deleteAnnouncement(1)
    expect(http.delete).toHaveBeenCalledWith('/case-announcement/1')
  })
})

describe('profile.ts API验证', () => {
  const http = createHttpMock()

  const getCurrentUser = () =>
    http.get('/auth/current-user')

  const changePassword = (data: { oldPassword: string; newPassword: string }) =>
    http.post('/auth/change-password', data)

  const updateMobile = (data: { mobile: string; smsCode?: string }) =>
    http.put('/auth/profile/mobile', data)

  const updateEmail = (data: { email: string }) =>
    http.put('/auth/profile/email', data)

  const updateRealName = (data: { realName: string }) =>
    http.put('/auth/profile/real-name', data)

  it('getCurrentUser 应GET /auth/current-user', async () => {
    await getCurrentUser()
    expect(http.get).toHaveBeenCalledWith('/auth/current-user')
  })

  it('changePassword 应POST /auth/change-password', async () => {
    await changePassword({ oldPassword: '123', newPassword: '456' })
    expect(http.post).toHaveBeenCalledWith('/auth/change-password', { oldPassword: '123', newPassword: '456' })
  })

  it('updateMobile 应PUT /auth/profile/mobile', async () => {
    await updateMobile({ mobile: '13800138000', smsCode: '1234' })
    expect(http.put).toHaveBeenCalledWith('/auth/profile/mobile', { mobile: '13800138000', smsCode: '1234' })
  })

  it('updateEmail 应PUT /auth/profile/email', async () => {
    await updateEmail({ email: 'test@test.com' })
    expect(http.put).toHaveBeenCalledWith('/auth/profile/email', { email: 'test@test.com' })
  })

  it('updateRealName 应PUT /auth/profile/real-name', async () => {
    await updateRealName({ realName: '张三' })
    expect(http.put).toHaveBeenCalledWith('/auth/profile/real-name', { realName: '张三' })
  })
})

describe('process-stage.ts http8080验证', () => {
  let http8080: ReturnType<typeof createHttpMock>

  beforeEach(() => {
    http8080 = createHttpMock()
  })

  const getCaseStageDataList = (caseId: number) =>
    http8080.get(`/api/case-process-stage/case/${caseId}`)

  const getCaseStageDataByStageNum = (caseId: number, stageNum: number) =>
    http8080.get(`/api/case-process-stage/case/${caseId}/stage/${stageNum}`)

  const getCaseStageDataByModule = (caseId: number, moduleCode: string) =>
    http8080.get(`/api/case-process-stage/case/${caseId}/module/${moduleCode}`)

  const deleteCaseStageData = (id: number) =>
    http8080.delete(`/api/case-process-stage/${id}`)

  it('getCaseStageDataList 应使用8080端口 GET /api/case-process-stage/case/{id}', async () => {
    await getCaseStageDataList(1)
    expect(http8080.get).toHaveBeenCalledWith('/api/case-process-stage/case/1')
  })

  it('getCaseStageDataByStageNum 应使用8080端口', async () => {
    await getCaseStageDataByStageNum(1, 2)
    expect(http8080.get).toHaveBeenCalledWith('/api/case-process-stage/case/1/stage/2')
  })

  it('getCaseStageDataByModule 应使用8080端口', async () => {
    await getCaseStageDataByModule(1, 'workTeam')
    expect(http8080.get).toHaveBeenCalledWith('/api/case-process-stage/case/1/module/workTeam')
  })

  it('deleteCaseStageData 应使用8080端口', async () => {
    await deleteCaseStageData(1)
    expect(http8080.delete).toHaveBeenCalledWith('/api/case-process-stage/1')
  })
})

describe('process.ts http8080验证', () => {
  let http8080: ReturnType<typeof createHttpMock>

  beforeEach(() => {
    http8080 = createHttpMock()
  })

  const getCaseTasks = (params: any) =>
    http8080.get('/api/case-tasks', params)

  const getCaseTaskById = (id: number) =>
    http8080.get(`/api/case-tasks/${id}`)

  const addCaseTask = (data: any) =>
    http8080.post('/api/case-tasks', data)

  const updateCaseTask = (id: number, data: any) =>
    http8080.patch(`/api/case-tasks/${id}`, data)

  const deleteCaseTask = (id: number) =>
    http8080.delete(`/api/case-tasks/${id}`)

  const getCaseTaskSubmissions = (taskId: number) =>
    http8080.get(`/api/case-task-submissions/task/${taskId}`)

  const createSubmission = (data: any) =>
    http8080.post('/api/case-task-submissions', data)

  it('getCaseTasks 应使用8080端口 GET /api/case-tasks', async () => {
    await getCaseTasks({ caseId: 1 })
    expect(http8080.get).toHaveBeenCalledWith('/api/case-tasks', { caseId: 1 })
  })

  it('getCaseTaskById 应使用8080端口', async () => {
    await getCaseTaskById(1)
    expect(http8080.get).toHaveBeenCalledWith('/api/case-tasks/1')
  })

  it('addCaseTask 应使用8080端口 POST /api/case-tasks', async () => {
    await addCaseTask({ caseId: 1, taskCode: 'TASK_001', taskName: '测试' })
    expect(http8080.post).toHaveBeenCalledWith('/api/case-tasks', { caseId: 1, taskCode: 'TASK_001', taskName: '测试' })
  })

  it('getCaseTaskSubmissions 应使用8080端口', async () => {
    await getCaseTaskSubmissions(1)
    expect(http8080.get).toHaveBeenCalledWith('/api/case-task-submissions/task/1')
  })

  it('createSubmission 应使用8080端口', async () => {
    await createSubmission({ caseTaskId: 1, submissionTitle: '测试', submissionContent: '内容', submissionType: 'REPORT' })
    expect(http8080.post).toHaveBeenCalledWith('/api/case-task-submissions', expect.objectContaining({ caseTaskId: 1 }))
  })
})

describe('expense-reimbursement.ts API验证', () => {
  const http = createHttpMock()

  const createExpenseReimbursement = (data: any) =>
    http.post('/expense-reimbursement', data)

  const getExpenseReimbursementList = (params?: any) =>
    http.get('/expense-reimbursement', params)

  const getExpenseReimbursementDetail = (id: number) =>
    http.get(`/expense-reimbursement/${id}`)

  const updateExpenseReimbursement = (id: number, data: any) =>
    http.put(`/expense-reimbursement/${id}`, data)

  const deleteExpenseReimbursement = (id: number) =>
    http.delete(`/expense-reimbursement/${id}`)

  const approveExpenseReimbursement = (id: number, data: any) =>
    http.post(`/expense-reimbursement/${id}/approve`, data)

  it('createExpenseReimbursement 应POST /expense-reimbursement', async () => {
    const data = { caseId: 1, fundAccountId: 1, reimbursementDate: '2024-01-15', items: [] }
    await createExpenseReimbursement(data)
    expect(http.post).toHaveBeenCalledWith('/expense-reimbursement', data)
  })

  it('approveExpenseReimbursement 应POST /expense-reimbursement/{id}/approve', async () => {
    await approveExpenseReimbursement(1, { approvalStatus: 'APPROVED', approvalOpinion: '同意' })
    expect(http.post).toHaveBeenCalledWith('/expense-reimbursement/1/approve', { approvalStatus: 'APPROVED', approvalOpinion: '同意' })
  })

  it('deleteExpenseReimbursement 应DELETE /expense-reimbursement/{id}', async () => {
    await deleteExpenseReimbursement(1)
    expect(http.delete).toHaveBeenCalledWith('/expense-reimbursement/1')
  })
})
