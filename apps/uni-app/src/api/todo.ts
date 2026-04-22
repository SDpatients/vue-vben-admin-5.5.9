import http from './request'

export interface Todo {
  id: number
  userId: number
  userAccount: string
  userName: string
  title: string
  description: string
  type: string
  priority: 'HIGH' | 'NORMAL' | 'LOW'
  status: 'PENDING' | 'COMPLETED'
  deadline: string
  completedTime: string
  caseId?: number
  caseNumber?: string
  relatedId: number
  relatedType: string
  assigneeId: number
  assigneeName: string
  createUserId: number
  createUserName: string
  createTime: string
  updateTime: string
  remark: string
}

export interface CreateTodoParams {
  userId: number
  userAccount: string
  userName: string
  title: string
  description?: string
  type?: string
  priority?: 'HIGH' | 'NORMAL' | 'LOW'
  deadline?: string
  caseNumber?: string
  caseId?: number
  relatedId?: number
  relatedType?: string
  assigneeId?: number
  assigneeName?: string
  remark?: string
}

export interface UpdateTodoParams {
  title?: string
  description?: string
  type?: string
  priority?: 'HIGH' | 'NORMAL' | 'LOW'
  deadline?: string
  caseNumber?: string
  caseId?: number
  relatedId?: number
  relatedType?: string
  assigneeId?: number
  assigneeName?: string
  remark?: string
}

export interface TodoListParams {
  userId: number
  pageNum?: number
  pageSize?: number
  status?: string
  startTime?: string
  endTime?: string
}

export interface TodoSearchParams {
  userId: number
  type?: string
  status?: string
  priority?: string
  pageNum?: number
  pageSize?: number
}

export interface PageResponse<T> {
  list: T[]
  content?: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const createTodo = (data: CreateTodoParams) => {
  return http.post<{ code: number; message: string; data: Todo }>(
    '/todo',
    data
  )
}

export const getTodoById = (todoId: number) => {
  return http.get<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}`
  )
}

export const getTodoList = (params: TodoListParams) => {
  return http.get<{ code: number; message: string; data: PageResponse<Todo> }>(
    '/todo/list',
    params
  )
}

export const searchTodo = (params: TodoSearchParams) => {
  return http.get<{ code: number; message: string; data: PageResponse<Todo> }>(
    '/todo/search',
    params
  )
}

export const getPendingTodo = (userId: number) => {
  return http.get<{ code: number; message: string; data: Todo[] }>(
    '/todo/pending',
    { userId }
  )
}

export const getCompletedTodo = (userId: number) => {
  return http.get<{ code: number; message: string; data: Todo[] }>(
    '/todo/completed',
    { userId }
  )
}

export const getOverdueTodo = (userId: number) => {
  return http.get<{ code: number; message: string; data: Todo[] }>(
    '/todo/overdue',
    { userId }
  )
}

export interface TodoMyStatsResponse {
  code: number
  message: string
  data: {
    inProgressTodos: number
    completedTodos: number
    overdueTodos: number
  }
}

export const getTodoMyStats = (userId: number) => {
  return http.get<TodoMyStatsResponse>('/todo/my-stats', { userId })
}

export const getPendingCount = (userId: number) => {
  return http.get<{ code: number; message: string; data: number }>(
    '/todo/count/pending',
    { userId }
  )
}

export const getCompletedCount = (userId: number) => {
  return http.get<{ code: number; message: string; data: number }>(
    '/todo/count/completed',
    { userId }
  )
}

export const getOverdueCount = (userId: number) => {
  return http.get<{ code: number; message: string; data: number }>(
    '/todo/count/overdue',
    { userId }
  )
}

export const completeTodo = (todoId: number) => {
  return http.put<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}/complete`
  )
}

export const updateTodo = (todoId: number, data: UpdateTodoParams) => {
  return http.put<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}`,
    data
  )
}

export const updateTodoStatus = (todoId: number, status: 'PENDING' | 'COMPLETED') => {
  return http.put<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}/status`,
    null,
    { params: { status } }
  )
}

export const assignTodo = (todoId: number, assigneeId: number, assigneeName: string) => {
  return http.put<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}/assign`,
    null,
    { params: { assigneeId, assigneeName } }
  )
}

export const deleteTodo = (todoId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/todo/${todoId}`
  )
}

export const batchDeleteTodo = (todoIds: number[]) => {
  return http.delete<{ code: number; message: string; data: null }>(
    '/todo/batch',
    todoIds
  )
}

// 案件简单信息接口
export interface SimpleCaseInfo {
  id: number
  caseNumber: string
  caseName: string
  reviewStatus?: string
  reviewOpinion?: string
}

// 案件简单搜索接口
export const searchSimpleCases = (caseNumber: string, page: number = 1, size: number = 10) => {
  return http.get<{
    code: number
    message: string
    data: {
      content: SimpleCaseInfo[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }
  }>('/todo/case/simple-search', { caseNumber, page, size })
}

// 创建带案件的待办
export const createTodoWithCase = (data: CreateTodoParams) => {
  return http.post<{ code: number; message: string; data: Todo }>(
    '/todo/with-case',
    data
  )
}

// 更新带案件的待办
export const updateTodoWithCase = (todoId: number, data: UpdateTodoParams) => {
  return http.put<{ code: number; message: string; data: Todo }>(
    `/todo/${todoId}/with-case`,
    data
  )
}
