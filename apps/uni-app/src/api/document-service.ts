import http from './request'

export interface DocumentDelivery {
  id: number
  caseId: number
  caseNumber: string
  caseName: string
  documentName: string
  documentType: string
  recipientName: string
  recipientType: string
  contactPhone: string
  deliveryAddress: string
  deliveryMethod: string
  sendStatus: string
  deliveryContent: string
  documentAttachment: string
  sendTime: null | string
  deliveryTime: null | string
  failureReason: null | string
  remark: null | string
  status: string
  createTime: string
  updateTime: string
  createUserId: number
  updateUserId: number
  documentNumber: string
  abbreviation: string
}

export interface DocumentAttachment {
  id: number
  originalFileName: string
  filePath: string
  fileSize: number
  fileExtension: string
  mimeType: string
  uploadTime: string
  uploadUserId: number
  status: string
}

export interface DocumentListResponse {
  code: number
  message: string
  data: {
    list: DocumentDelivery[]
    total: number
  }
}

export interface DocumentDetailResponse {
  code: number
  message: string
  data: DocumentDelivery
}

export interface AttachmentListResponse {
  code: number
  message: string
  data: DocumentAttachment[]
}

export const documentStatusMap: Record<string, { text: string; class: string }> = {
  PENDING: { text: '待审批', class: 'status-pending' },
  APPROVED: { text: '已通过', class: 'status-approved' },
  REJECTED: { text: '已驳回', class: 'status-rejected' },
}

export const getDocumentStatusText = (status?: string) => {
  return documentStatusMap[status || '']?.text || status || '未知'
}

export const getDocumentStatusClass = (status?: string) => {
  return documentStatusMap[status || '']?.class || ''
}

/** 获取所有文书送达分页列表（含审批状态） */
export const getAllDocumentListApi = (params?: {
  caseNumber?: string
  documentType?: string
  pageNum?: number
  pageSize?: number
  status?: string
}) => {
  return http.get<DocumentListResponse>('/api/v1/document-delivery/all-with-approval', {
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
    ...params,
  })
}

/** 获取文书送达详情（含案件信息） */
export const getDocumentDetailApi = (deliveryId: number) => {
  return http.get<DocumentDetailResponse>(`/api/v1/document-delivery/${deliveryId}/detail`)
}

/** 获取文书送达附件列表 */
export const getDocumentAttachmentsApi = (deliveryId: number) => {
  return http.get<AttachmentListResponse>(`/api/v1/document-delivery/${deliveryId}/attachments`)
}

/** 更新文书送达状态和备注 */
export const updateDocumentStatusRemarkApi = (
  deliveryId: number,
  data: {
    remark?: string
    status?: string
  },
) => {
  return http.put(`/api/v1/document-delivery/${deliveryId}/status-remark`, undefined, {
    params: data,
  })
}

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i]
}