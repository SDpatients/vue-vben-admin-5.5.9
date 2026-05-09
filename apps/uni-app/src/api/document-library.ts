/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import http, { getBaseUrl, http8080 } from './request'
import { API_PREFIX } from '@/config'

// 文档库模块的基础路径
// 注意：使用 http8080 客户端，自动添加 /api/v1/api 双前缀
// 最终路径会是 /api/v1/api/lib/xxx
const BASE_URL = '/lib'

// ================= 类型定义 =================

export interface DocumentItem {
  id: number
  documentName: string
  documentCode?: string
  folderId?: number
  folderName?: string
  folderPath?: string
  documentType: string
  fileName: string
  filePath: string
  fileSize?: number
  fileExtension?: string
  mimeType?: string
  currentVersion?: number
  description?: string
  tags?: string
  isPublic?: boolean
  isLocked?: boolean
  lockedBy?: number
  lockedByName?: string
  lockedTime?: string
  downloadCount?: number
  viewCount?: number
  status: string
  createTime: string
  updateTime?: string
  createUserId?: number
  createUserName?: string
  isFavorited?: boolean
  hasPermission?: boolean
}

export interface FolderItem {
  id: number
  folderName: string
  folderPath?: string
  parentId?: number
  folderLevel?: number
  sortOrder?: number
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  status?: string
  createTime?: string
  updateTime?: string
  createUserId?: number
  createUserName?: string
  documentCount?: number
  subFolderCount?: number
  children?: FolderItem[]
  isLocked?: boolean
  lockedBy?: number
  lockedByName?: string
  lockedTime?: string
}

export interface FolderTreeNode {
  id: number
  name: string
  type: 'folder' | 'root'
  parentId: number | null
  path: string | null
  folderLevel: number | null
  sortOrder: number | null
  documentCount?: number | null
  children?: FolderTreeNode[] | null
  icon?: string | null
  color?: string | null
  isPublic?: boolean | null
  createTime?: string | null
  createUserId?: number | null
  createUserName?: string | null
}

export interface FolderBreadcrumb {
  id: number
  name: string
  type: 'folder' | 'root'
  path: string
  folderLevel: number
}

export interface ShareItem {
  id: number
  documentId: number
  documentName?: string
  shareCode: string
  shareUrl?: string
  sharePassword?: string
  permissionType?: string
  expireTime?: string
  maxAccessCount?: number
  accessCount?: number
  isEnabled?: boolean
  isExpired?: boolean
  status?: string
  createTime?: string
  createUserId?: number
  createUserName?: string
}

export interface FavoriteItem {
  id: number
  documentId: number
  documentName: string
  documentType?: string
  fileName?: string
  fileSize?: number
  folderName?: string
  sortOrder?: number
  createTime: string
  documentCreateTime?: string
}

export interface PermissionItem {
  id: number
  permissionName: string
  permissionCode: string
  permissionType?: string
  description?: string
  sortOrder?: number
  status?: string
  createTime?: string
}

export interface PermissionConfig {
  permissionId: number
  permissionName: string
  permissionCode: string
  targetType: string
  targetId: number
  targetName: string
  isInherit?: boolean
  createTime?: string
}

export interface DashboardStats {
  totalDocuments: number
  totalSize: number
  weeklyUploads: number
  totalViews: number
  typeDistribution: Record<string, number>
  sizeDistribution: Record<string, number>
  monthlyTrend: Array<{
    month: string
    uploads: number
    views: number
  }>
}

export interface DocumentListParams {
  folderId?: number
  documentType?: string
  status?: string
  keyword?: string
  isPublic?: boolean
  createUserId?: number
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: string
}

export interface DocumentListResponse {
  code: number
  message: string
  data: {
    total: number
    page: number
    size: number
    totalPages: number
    documents: DocumentItem[]
  }
}

export interface DocumentDetailResponse {
  code: number
  message: string
  data: DocumentItem
}

export interface FolderListResponse {
  code: number
  message: string
  data: {
    total: number
    list: FolderItem[]
  }
}

export interface FolderTreeResponse {
  code: number
  message: string
  data: FolderTreeNode
}

export interface FavoriteListResponse {
  code: number
  message: string
  data: {
    total: number
    favorites: FavoriteItem[]
  }
}

export interface ShareResponse {
  code: number
  message: string
  data: ShareItem
}

export interface PermissionListResponse {
  code: number
  message: string
  data: PermissionItem[]
}

export interface PermissionConfigListResponse {
  code: number
  message: string
  data: PermissionConfig[]
}

export interface DashboardStatsResponse {
  code: number
  message: string
  data: DashboardStats
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// ================= 文档管理 API =================

export const createDocument = (data: {
  documentName: string
  documentCode?: string
  folderId?: number
  documentType: string
  fileName: string
  filePath: string
  fileSize?: number
  fileExtension?: string
  mimeType?: string
  description?: string
  tags?: string
  isPublic?: boolean
}, config?: { showLoading?: boolean; showErrorToast?: boolean }) => {
  return http8080.post<DocumentDetailResponse>(`${BASE_URL}/documents`, data, config)
}

export const uploadDocument = (filePath: string, params?: {
  folderId?: number
  documentName?: string
  description?: string
  tags?: string
  isPublic?: boolean
}, fileObj?: File) => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  const uploadUrl = `${baseUrl}/api/v1/api${BASE_URL}/documents/upload`

  return new Promise<DocumentDetailResponse>((resolve, reject) => {
    // H5环境且提供了File对象：使用XMLHttpRequest上传
    if (fileObj && typeof window !== 'undefined') {
      const formData = new FormData()
      formData.append('file', fileObj)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
      }

      const xhr = new XMLHttpRequest()
      xhr.open('POST', uploadUrl)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      }
      xhr.onerror = () => reject(new Error('上传请求失败'))
      xhr.send(formData)
      return
    }

    // 小程序/APP环境：使用uni.uploadFile
    uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      formData: params || {},
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.UploadFileSuccessCallbackResult) => {
        try {
          const data = JSON.parse(res.data as string)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        reject(new Error(`上传失败: ${err.errMsg || '未知错误'}`))
      },
    })
  })
}

export const getDocumentList = (params?: DocumentListParams) => {
  return http8080.post<DocumentListResponse>(`${BASE_URL}/documents/list`, params)
}

export const getDocumentDetail = (id: number) => {
  return http8080.get<DocumentDetailResponse>(`${BASE_URL}/documents/${id}`)
}

export const getDocumentByCode = (code: string) => {
  return http8080.get<DocumentDetailResponse>(`${BASE_URL}/documents/code/${code}`)
}

export const updateDocument = (id: number, data: {
  documentName?: string
  folderId?: number
  description?: string
  tags?: string
  isPublic?: boolean
  status?: string
}, config?: { showLoading?: boolean; showErrorToast?: boolean }) => {
  return http8080.put<DocumentDetailResponse>(`${BASE_URL}/documents/${id}`, data, config)
}

export const deleteDocument = (id: number) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/documents/${id}`)
}

export const searchDocuments = (keyword: string, page: number = 1, size: number = 10) => {
  return http8080.get<DocumentListResponse>(`${BASE_URL}/documents/search`, { keyword, page, size })
}

export const getDocumentsByFolder = (folderId: number, page: number = 1, size: number = 10) => {
  return http8080.get<DocumentListResponse>(`${BASE_URL}/documents/folder/${folderId}`, { page, size })
}

export const getMyDocuments = (page: number = 1, size: number = 10) => {
  return http8080.get<DocumentListResponse>(`${BASE_URL}/documents/my`, { page, size })
}

export const downloadDocument = (id: number) => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api/v1/api${BASE_URL}/documents/${id}/download`
}

export const previewDocument = (id: number) => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api/v1/api${BASE_URL}/documents/${id}/preview`
}

export const downloadDocumentWithAuth = (id: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = downloadDocument(id)
    const token = uni.getStorageSync('token')
    
    uni.downloadFile({
      url,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.DownloadSuccessData) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else if (res.statusCode === 401) {
          reject(new Error('登录已过期，请重新登录'))
        } else {
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        reject(new Error(`下载失败: ${err.errMsg || '未知错误'}`))
      },
    })
  })
}

export const openDocumentWithAuth = async (id: number): Promise<void> => {
  try {
    const tempFilePath = await downloadDocumentWithAuth(id)
    return new Promise((resolve, reject) => {
      uni.openDocument({
        filePath: tempFilePath,
        showMenu: true,
        success: () => {
          resolve()
        },
        fail: (err: UniApp.GeneralCallbackResult) => {
          reject(new Error(`打开失败: ${err.errMsg || '未知错误'}`))
        },
      })
    })
  } catch (error) {
    throw error
  }
}

export const saveDocumentWithAuth = async (id: number): Promise<string> => {
  // 直接下载并返回临时文件路径
  // uni.saveFile 在部分平台（如H5、部分小程序）不支持
  // 使用临时文件路径配合 uni.openDocument 打开
  return downloadDocumentWithAuth(id)
}

export const getOfficeConfig = (id: number) => {
  return http8080.get<ApiResponse<any>>(`${BASE_URL}/documents/${id}/office-config`)
}

export const lockDocument = (id: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/documents/${id}/lock`)
}

export const unlockDocument = (id: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/documents/${id}/unlock`)
}

export const moveDocument = (id: number, targetFolderId: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/documents/${id}/move`, null, { params: { targetFolderId } })
}

export const copyDocument = (id: number, targetFolderId?: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/documents/${id}/copy`, null, { params: { targetFolderId } })
}

export const getRecentDocuments = (page: number = 1, size: number = 10) => {
  return http8080.get<DocumentListResponse>(`${BASE_URL}/documents/recent`, { page, size })
}

export const getPopularDocuments = (page: number = 1, size: number = 10, timeRange: string = 'all') => {
  return http8080.get<DocumentListResponse>(`${BASE_URL}/documents/popular`, { page, size, timeRange })
}

// ================= 文件夹管理 API =================

export const createFolder = (data: {
  folderName: string
  parentId?: number
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  sortOrder?: number
}) => {
  return http8080.post<ApiResponse<FolderItem>>(`${BASE_URL}/folders`, data)
}

export const getFolderDetail = (id: number) => {
  return http8080.get<ApiResponse<FolderItem>>(`${BASE_URL}/folders/${id}`)
}

export const updateFolder = (id: number, data: {
  folderName?: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  sortOrder?: number
  parentId?: number
}) => {
  return http8080.put<ApiResponse<FolderItem>>(`${BASE_URL}/folders/${id}`, data)
}

export const deleteFolder = (id: number) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/folders/${id}`)
}

export const getFolderTree = () => {
  return http8080.get<FolderTreeResponse>(`${BASE_URL}/folders/tree`)
}

export const getFolderChildren = (id: number) => {
  return http8080.get<ApiResponse<FolderItem[]>>(`${BASE_URL}/folders/${id}/children`)
}

export const getRootFolders = () => {
  return http8080.get<FolderListResponse>(`${BASE_URL}/folders/root`)
}

export const moveFolder = (id: number, targetFolderId?: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/folders/${id}/move`, null, { params: { targetFolderId } })
}

export const getFolderPath = (id: number) => {
  return http8080.get<ApiResponse<FolderBreadcrumb[]>>(`${BASE_URL}/folders/${id}/path`)
}

export const getFolderDescendants = (id: number) => {
  return http8080.get<ApiResponse<number[]>>(`${BASE_URL}/folders/${id}/descendants`)
}

export const getFoldersByLevel = (level: number) => {
  return http8080.get<ApiResponse<FolderItem[]>>(`${BASE_URL}/folders/level/${level}`)
}

export const updateFolderSort = (id: number, sortOrder: number) => {
  return http8080.put<ApiResponse>(`${BASE_URL}/folders/${id}/sort`, null, { params: { sortOrder } })
}

// ================= 权限管理 API =================

export const getPermissions = () => {
  return http8080.get<PermissionListResponse>(`${BASE_URL}/permissions`)
}

export const getPermissionDetail = (id: number) => {
  return http8080.get<ApiResponse<PermissionItem>>(`${BASE_URL}/permissions/${id}`)
}

export const getPermissionByCode = (code: string) => {
  return http8080.get<ApiResponse<PermissionItem>>(`${BASE_URL}/permissions/code/${code}`)
}

export const grantFolderPermission = (folderId: number, data: {
  permissionId: number
  targetType: string
  targetId: number
  isInherit?: boolean
}) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/folders/${folderId}/permissions`, data)
}

export const revokeFolderPermission = (folderId: number, permissionId: number, params: {
  targetType: string
  targetId: number
}) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/folders/${folderId}/permissions/${permissionId}`, params)
}

export const getFolderPermissions = (folderId: number) => {
  return http8080.get<PermissionConfigListResponse>(`${BASE_URL}/folders/${folderId}/permissions`)
}

export const grantDocumentPermission = (documentId: number, data: {
  permissionId: number
  targetType: string
  targetId: number
  isInherit?: boolean
}) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/documents/${documentId}/permissions`, data)
}

export const revokeDocumentPermission = (documentId: number, permissionId: number, params: {
  targetType: string
  targetId: number
}) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/documents/${documentId}/permissions/${permissionId}`, params)
}

export const getDocumentPermissions = (documentId: number) => {
  return http8080.get<PermissionConfigListResponse>(`${BASE_URL}/documents/${documentId}/permissions`)
}

export const getAccessibleFolders = (permissionType: string) => {
  return http8080.get<ApiResponse<number[]>>(`${BASE_URL}/permissions/accessible-folders`, { permissionType })
}

export const getAccessibleDocuments = (permissionType: string) => {
  return http8080.get<ApiResponse<number[]>>(`${BASE_URL}/permissions/accessible-documents`, { permissionType })
}

// ================= 分享管理 API =================

export const createShare = (data: {
  documentId: number
  sharePassword?: string
  permissionType?: string
  expireTime?: string
  maxAccessCount?: number
}) => {
  return http8080.post<ShareResponse>(`${BASE_URL}/shares`, data)
}

export const getShareByCode = (shareCode: string) => {
  return http8080.get<ShareResponse>(`${BASE_URL}/shares/code/${shareCode}`)
}

export const getShareDetail = (id: number) => {
  return http8080.get<ShareResponse>(`${BASE_URL}/shares/${id}`)
}

export const accessShare = (shareCode: string, password?: string) => {
  return http8080.get<DocumentDetailResponse>(`${BASE_URL}/shares/${shareCode}/access`, { password })
}

export const downloadShare = (shareCode: string, password?: string) => {
  const baseUrl = getBaseUrl()
  let url = `${baseUrl}/api/v1/api${BASE_URL}/shares/${shareCode}/download`
  if (password) {
    url += `?password=${encodeURIComponent(password)}`
  }
  return url
}

export const deleteShare = (id: number) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/shares/${id}`)
}

export const disableShare = (id: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/shares/${id}/disable`)
}

export const enableShare = (id: number) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/shares/${id}/enable`)
}

export const checkShareValid = (shareCode: string) => {
  return http8080.get<ApiResponse<boolean>>(`${BASE_URL}/shares/${shareCode}/valid`)
}

export const checkSharePassword = (shareCode: string, password?: string) => {
  return http8080.post<ApiResponse<boolean>>(`${BASE_URL}/shares/${shareCode}/check-password`, null, { params: { password } })
}

// ================= 收藏管理 API =================

export const addFavorite = (documentId: number, folderName?: string) => {
  return http8080.post<ApiResponse<FavoriteItem>>(`${BASE_URL}/favorites/${documentId}`, null, { params: { folderName } })
}

export const removeFavorite = (documentId: number) => {
  return http8080.delete<ApiResponse>(`${BASE_URL}/favorites/${documentId}`)
}

export const getFavorites = (page: number = 1, size: number = 10) => {
  return http8080.get<FavoriteListResponse>(`${BASE_URL}/favorites`, { page, size })
}

export const getFavoriteFolders = () => {
  return http8080.get<ApiResponse<string[]>>(`${BASE_URL}/favorites/folders`)
}

export const getFavoritesByFolder = (folderName: string, page: number = 1, size: number = 10) => {
  return http8080.get<FavoriteListResponse>(`${BASE_URL}/favorites/folder/${folderName}`, { page, size })
}

export const checkFavorite = (documentId: number) => {
  return http8080.get<ApiResponse<boolean>>(`${BASE_URL}/favorites/${documentId}/check`)
}

export const moveFavorite = (documentId: number, folderName: string) => {
  return http8080.post<ApiResponse>(`${BASE_URL}/favorites/${documentId}/move`, null, { params: { folderName } })
}

// ================= 统计管理 API =================

export const getDashboardStats = () => {
  return http8080.get<DashboardStatsResponse>(`${BASE_URL}/statistics/dashboard`)
}

// ================= 工具函数 =================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getDocumentTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    WORD: '📘',
    EXCEL: '📗',
    PDF: '📕',
    OTHER: '📄',
  }
  return iconMap[type] || iconMap.OTHER
}

export function getDocumentTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    WORD: '#2b579a',
    EXCEL: '#217346',
    PDF: '#f40f02',
    OTHER: '#666666',
  }
  return colorMap[type] || colorMap.OTHER
}
