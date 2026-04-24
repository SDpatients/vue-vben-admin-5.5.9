/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import http from './request'

// ================= 公告类型定义 =================

export interface Announcement {
  id: number
  caseId: number
  caseNumber: string
  principalOfficer: string
  title: string
  content: string
  announcementType: string
  status: 'DRAFT' | 'PUBLISHED'
  publisherId: number
  publisherName: string
  publishTime: string
  viewCount: number
  isTop: boolean
  topExpireTime: string
  attachments: string
  createTime: string
  updateTime: string
}

export interface AnnouncementAttachment {
  id: number
  originalFileName: string
  storedFileName: string
  filePath: string
  fileSize: number
  fileExtension: string
  mimeType: string
  bizType: string
  bizId: string
  uploadTime: string
  uploadUserId: number
  fileStatus: number
  description: string
  sortOrder: number
}

export interface AnnouncementViewRecord {
  id: number
  announcementId: number
  announcementTitle: string
  caseId: number
  caseName: string
  viewerId: number
  viewerName: string
  viewerType: string
  viewTime: string
  ipAddress: string
  userAgent: string
  viewDuration: number
  deviceType: string
  browserType: string
  osType: string
  location: string
  createTime: string
}

export interface CreateAnnouncementParams {
  caseId: number
  caseNumber?: string
  principalOfficer?: string
  title: string
  content: string
  announcementType: string
  attachments?: string
}

export interface CreateAnnouncementWithFilesParams {
  caseId: number
  caseNumber?: string
  principalOfficer?: string
  title: string
  content: string
  announcementType: string
  files: File[]
  fileDescriptions?: string[]
}

export interface UpdateAnnouncementParams {
  title?: string
  content?: string
  announcementType?: string
  attachments?: string
}

export interface PublishAnnouncementParams {
  topExpireTime?: string
}

export interface TopAnnouncementParams {
  topExpireTime?: string
}

export interface CreateViewRecordParams {
  announcementId: number
  announcementTitle?: string
  caseId?: number
  caseName?: string
  viewerId?: number
  viewerName?: string
  viewerType?: string
  ipAddress?: string
  userAgent?: string
  viewDuration?: number
  deviceType?: string
  browserType?: string
  osType?: string
  location?: string
}

export interface AnnouncementListParams {
  pageNum?: number
  pageSize?: number
  caseId?: number
  status?: string
}

export interface ViewRecordListParams {
  page?: number
  size?: number
  announcementId?: number
  caseId?: number
  viewerId?: number
}

export interface AnnouncementListResponse {
  code: number
  message: string
  data: {
    total: number
    list: Announcement[]
    pageNum: number
    pageSize: number
  }
}

export interface AnnouncementDetailResponse {
  code: number
  message: string
  data: Announcement
}

export interface AnnouncementCreateResponse {
  code: number
  message: string
  data: {
    announcementId: number
  }
}

export interface AnnouncementWithFilesResponse {
  code: number
  message: string
  data: {
    announcementId: number
    title: string
    announcementType: string
    status: string
    files: AnnouncementAttachment[]
  }
}

export interface AttachmentListResponse {
  code: number
  message: string
  data: AnnouncementAttachment[]
}

export interface ViewRecordResponse {
  code: number
  message: string
  data: AnnouncementViewRecord
}

export interface ViewRecordListResponse {
  code: number
  message: string
  data: AnnouncementViewRecord[]
}

export interface CountResponse {
  code: number
  message: string
  data: number
}

// ================= 公告类型字典 =================

export const announcementTypeMap: Record<string, { text: string; color: string; icon: string }> = {
  MEETING: { text: '债权人会议', color: '#1890ff', icon: 'calendar' },
  CLAIM: { text: '债权申报', color: '#52c41a', icon: 'file-text' },
  AUCTION: { text: '拍卖公告', color: '#fa8c16', icon: 'shopping-cart' },
  OTHER: { text: '其他公告', color: '#8c8c8c', icon: 'notification' },
}

export const announcementStatusMap: Record<string, { text: string; color: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
  DRAFT: { text: '草稿', color: '#999', type: 'info' },
  PUBLISHED: { text: '已发布', color: '#52c41a', type: 'success' },
}

export const viewerTypeMap: Record<string, string> = {
  ADMIN: '管理员',
  MANAGER: '管理人',
  CREDITOR: '债权人',
  DEBTOR: '债务人',
  OTHER: '其他',
}

export const deviceTypeMap: Record<string, string> = {
  PC: '电脑',
  MOBILE: '手机',
  TABLET: '平板',
}

// ================= 案件公告管理 API =================

/**
 * 创建案件公告
 * POST /case-announcement
 */
export const createAnnouncement = (data: CreateAnnouncementParams) => {
  return http.post<AnnouncementCreateResponse>('/case-announcement', data)
}

/**
 * 创建案件公告（带文件上传）
 * POST /case-announcement/with-files
 */
export const createAnnouncementWithFiles = (data: FormData) => {
  return http.post<AnnouncementWithFilesResponse>('/case-announcement/with-files', data)
}

/**
 * 获取案件公告列表
 * GET /case-announcement/list
 */
export const getAnnouncementList = (params: AnnouncementListParams) => {
  return http.get<AnnouncementListResponse>('/case-announcement/list', params)
}

/**
 * 获取公告详情
 * GET /case-announcement/{announcementId}
 */
export const getAnnouncementDetail = (announcementId: number) => {
  return http.get<AnnouncementDetailResponse>(`/case-announcement/${announcementId}`)
}

/**
 * 更新案件公告
 * PUT /case-announcement/{announcementId}
 */
export const updateAnnouncement = (announcementId: number, data: UpdateAnnouncementParams) => {
  return http.put<{ code: number; message: string; data: null }>(`/case-announcement/${announcementId}`, data)
}

/**
 * 发布公告
 * POST /case-announcement/{announcementId}/publish
 */
export const publishAnnouncement = (announcementId: number, data?: PublishAnnouncementParams) => {
  return http.post<{ code: number; message: string; data: null }>(`/case-announcement/${announcementId}/publish`, data)
}

/**
 * 置顶公告
 * POST /case-announcement/{announcementId}/top
 */
export const topAnnouncement = (announcementId: number, data?: TopAnnouncementParams) => {
  return http.post<{ code: number; message: string; data: null }>(`/case-announcement/${announcementId}/top`, data)
}

/**
 * 取消置顶公告
 * DELETE /case-announcement/{announcementId}/top
 */
export const cancelTopAnnouncement = (announcementId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/case-announcement/${announcementId}/top`)
}

/**
 * 删除案件公告
 * DELETE /case-announcement/{announcementId}
 */
export const deleteAnnouncement = (announcementId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/case-announcement/${announcementId}`)
}

/**
 * 获取公告附件列表
 * GET /case-announcement/{announcementId}/attachments
 */
export const getAnnouncementAttachments = (announcementId: number) => {
  return http.get<AttachmentListResponse>(`/case-announcement/${announcementId}/attachments`)
}

/**
 * 上传公告附件
 * POST /case-announcement/{announcementId}/attachments/upload
 */
export const uploadAnnouncementAttachments = (announcementId: number, formData: FormData) => {
  return http.post<AttachmentListResponse>(`/case-announcement/${announcementId}/attachments/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ================= 公告查看记录 API =================

/**
 * 创建公告查看记录
 * POST /announcement-view-record
 */
export const createViewRecord = (data: CreateViewRecordParams) => {
  return http.post<ViewRecordResponse>('/announcement-view-record', data)
}

/**
 * 获取公告查看记录详情
 * GET /announcement-view-record/{recordId}
 */
export const getViewRecordDetail = (recordId: number) => {
  return http.get<ViewRecordResponse>(`/announcement-view-record/${recordId}`)
}

/**
 * 获取公告查看记录列表
 * GET /announcement-view-record/list
 */
export const getViewRecordList = (params: ViewRecordListParams) => {
  return http.get<ViewRecordListResponse>('/announcement-view-record/list', params)
}

/**
 * 获取公告查看次数
 * GET /announcement-view-record/count/announcement/{announcementId}
 */
export const getAnnouncementViewCount = (announcementId: number) => {
  return http.get<CountResponse>(`/announcement-view-record/count/announcement/${announcementId}`)
}

/**
 * 获取案件公告查看次数
 * GET /announcement-view-record/count/case/{caseId}
 */
export const getCaseAnnouncementViewCount = (caseId: number) => {
  return http.get<CountResponse>(`/announcement-view-record/count/case/${caseId}`)
}

/**
 * 获取用户查看次数
 * GET /announcement-view-record/count/viewer/{viewerId}
 */
export const getViewerViewCount = (viewerId: number) => {
  return http.get<CountResponse>(`/announcement-view-record/count/viewer/${viewerId}`)
}

/**
 * 删除公告查看记录
 * DELETE /announcement-view-record/{recordId}
 */
export const deleteViewRecord = (recordId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(`/announcement-view-record/${recordId}`)
}

// ================= 工具函数 =================

/**
 * 获取公告类型文本
 */
export const getAnnouncementTypeText = (type?: string) => {
  return announcementTypeMap[type || '']?.text || type || '其他'
}

/**
 * 获取公告类型颜色
 */
export const getAnnouncementTypeColor = (type?: string) => {
  return announcementTypeMap[type || '']?.color || '#8c8c8c'
}

/**
 * 获取公告类型图标
 */
export const getAnnouncementTypeIcon = (type?: string) => {
  return announcementTypeMap[type || '']?.icon || 'notification'
}

/**
 * 获取公告状态文本
 */
export const getAnnouncementStatusText = (status?: string) => {
  return announcementStatusMap[status || '']?.text || status || '未知'
}

/**
 * 获取公告状态颜色
 */
export const getAnnouncementStatusColor = (status?: string) => {
  return announcementStatusMap[status || '']?.color || '#999'
}

/**
 * 获取查看人类型文本
 */
export const getViewerTypeText = (type?: string) => {
  return viewerTypeMap[type || ''] || type || '其他'
}

/**
 * 获取设备类型文本
 */
export const getDeviceTypeText = (type?: string) => {
  return deviceTypeMap[type || ''] || type || '未知'
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
