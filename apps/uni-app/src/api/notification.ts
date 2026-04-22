import http from './request'

export interface Notification {
  id: number
  userId: number
  userAccount: string
  userName: string
  title: string
  content: string
  type: string
  isRead: boolean
  readTime: string | null
  relatedId: number | null
  relatedType: string | null
  priority: string
  status: string
  expireTime: string | null
  createUserId: number
  createUserName: string
  createTime: string
  updateTime: string
  remark: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface NotificationListParams {
  pageNum?: number
  pageSize?: number
}

export interface NotificationSearchParams {
  type?: string
  isRead?: boolean
  status?: string
  pageNum?: number
  pageSize?: number
}

export interface CreateNotificationParams {
  userId: number
  title: string
  content: string
  type: string
  priority?: string
  relatedId?: number
  relatedType?: string
  expireTime?: string
  remark?: string
}

export const getNotificationList = (params: NotificationListParams) => {
  return http.get<{ code: number; message: string; data: PageResponse<Notification> }>(
    '/notification/list',
    params
  )
}

export const searchNotifications = (params: NotificationSearchParams) => {
  return http.get<{ code: number; message: string; data: PageResponse<Notification> }>(
    '/notification/search',
    params
  )
}

export const getUnreadNotifications = () => {
  return http.get<{ code: number; message: string; data: Notification[] }>(
    '/notification/unread'
  )
}

export const getUnreadCount = () => {
  return http.get<{ code: number; message: string; data: number }>(
    '/notification/count/unread'
  )
}

export const getNotificationById = (notificationId: number) => {
  return http.get<{ code: number; message: string; data: Notification }>(
    `/notification/${notificationId}`
  )
}

export const markAsRead = (notificationId: number) => {
  return http.put<{ code: number; message: string; data: Notification }>(
    `/notification/${notificationId}/read`
  )
}

export const markAllAsRead = () => {
  return http.put<{ code: number; message: string; data: null }>(
    '/notification/read-all'
  )
}

export const createNotification = (data: CreateNotificationParams) => {
  return http.post<{ code: number; message: string; data: Notification }>(
    '/notification',
    data
  )
}

export const deleteNotification = (notificationId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/notification/${notificationId}`
  )
}

export const batchDeleteNotifications = (notificationIds: number[]) => {
  return http.delete<{ code: number; message: string; data: null }>(
    '/notification/batch',
    notificationIds
  )
}

export const updateNotificationStatus = (notificationId: number, status: string) => {
  return http.put<{ code: number; message: string; data: null }>(
    `/notification/${notificationId}/status`,
    null,
    { params: { status } }
  )
}

export const notificationTypeMap: Record<string, { text: string; icon: string }> = {
  CASE_REVIEW: { text: '案件审核', icon: 'file-text' },
  TASK_ASSIGN: { text: '任务分配', icon: 'calendar' },
  SYSTEM: { text: '系统通知', icon: 'settings' },
  MEETING: { text: '会议通知', icon: 'chat' },
  CREDITOR: { text: '债权通知', icon: 'rmb-circle' },
  DEADLINE: { text: '截止提醒', icon: 'clock' },
}

export const notificationPriorityMap: Record<string, { text: string; type: 'warning' | 'error' | 'info' | 'success' | 'primary' }> = {
  HIGH: { text: '高', type: 'error' },
  NORMAL: { text: '中', type: 'warning' },
  LOW: { text: '低', type: 'info' },
}

export const notificationStatusMap: Record<string, { text: string; type: 'warning' | 'error' | 'info' | 'success' | 'primary' }> = {
  ACTIVE: { text: '有效', type: 'success' },
  INACTIVE: { text: '无效', type: 'info' },
  EXPIRED: { text: '过期', type: 'warning' },
}
