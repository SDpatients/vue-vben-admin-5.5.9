/**
 * 费用报销模块API
 */

import http from './request'
import { getBaseUrl, API_PREFIX } from '@/config'

// ================= 数据类型定义 =================

/** 审批状态 */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** 报销明细项 */
export interface ExpenseItem {
  id?: number
  reimbursementId?: number
  itemName: string
  itemAmount: number
  itemDescription?: string
  sortOrder?: number
}

/** 报销附件 */
export interface ExpenseAttachment {
  id: number
  reimbursementId: number
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  uploadTime: string
  sortOrder: number
}

/** 报销单 */
export interface ExpenseReimbursement {
  id: number
  reimbursementNumber: string
  caseId: number
  caseName: string
  applicantId: number
  applicantName: string
  fundAccountId: number
  fundAccountName: string
  bankName: string
  bankAccount: string
  totalAmount: number
  reimbursementDate: string
  description: string
  approvalStatus: ApprovalStatus
  approverId: number | null
  approverName: string | null
  approvalTime: string | null
  approvalOpinion: string | null
  createTime: string
  updateTime: string
  items: ExpenseItem[]
  attachments: ExpenseAttachment[]
}

/** 报销单列表查询参数 */
export interface ExpenseListParams {
  page?: number
  size?: number
  caseId?: number
  applicantId?: number
  approvalStatus?: ApprovalStatus | string
  reimbursementDate?: string
}

/** 创建报销单参数 */
export interface CreateExpenseParams {
  caseId: number
  fundAccountId: number
  reimbursementDate: string
  description?: string
  items: {
    itemName: string
    itemAmount: number
    itemDescription?: string
  }[]
}

/** 更新报销单参数 */
export interface UpdateExpenseParams {
  caseId: number
  fundAccountId: number
  reimbursementDate: string
  description?: string
}

/** 审批参数 */
export interface ApproveParams {
  approvalStatus: 'APPROVED' | 'REJECTED'
  approvalOpinion?: string
}

/** 添加明细参数 */
export interface AddItemParams {
  itemName: string
  itemAmount: number
  itemDescription?: string
}

/** 分页响应 */
export interface PageResponse<T> {
  code: number
  message: string
  data: {
    total: number
    list: T[]
    pageNum: number
    pageSize: number
  }
}

/** 通用响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// ================= API 接口 =================

/**
 * 创建报销单
 * POST /expense-reimbursement
 */
export const createExpenseReimbursement = (data: CreateExpenseParams) => {
  return http.post<ApiResponse<{ reimbursementId: number }>>('/expense-reimbursement', data)
}

/**
 * 查询报销单列表
 * GET /expense-reimbursement
 */
export const getExpenseReimbursementList = (params?: ExpenseListParams) => {
  return http.get<PageResponse<ExpenseReimbursement>>('/expense-reimbursement', params)
}

/**
 * 查询报销单详情
 * GET /expense-reimbursement/{id}
 */
export const getExpenseReimbursementDetail = (id: number | string) => {
  return http.get<ApiResponse<ExpenseReimbursement>>(`/expense-reimbursement/${id}`)
}

/**
 * 更新报销单
 * PUT /expense-reimbursement/{id}
 */
export const updateExpenseReimbursement = (id: number | string, data: UpdateExpenseParams) => {
  return http.put<ApiResponse<null>>(`/expense-reimbursement/${id}`, data)
}

/**
 * 删除报销单
 * DELETE /expense-reimbursement/{id}
 */
export const deleteExpenseReimbursement = (id: number | string) => {
  return http.delete<ApiResponse<null>>(`/expense-reimbursement/${id}`)
}

/**
 * 审批报销单
 * POST /expense-reimbursement/{id}/approve
 */
export const approveExpenseReimbursement = (id: number | string, data: ApproveParams) => {
  return http.post<ApiResponse<null>>(`/expense-reimbursement/${id}/approve`, data)
}

/**
 * 添加报销明细
 * POST /expense-reimbursement/{id}/items
 */
export const addExpenseItem = (id: number | string, data: AddItemParams) => {
  return http.post<ApiResponse<{ itemId: number }>>(`/expense-reimbursement/${id}/items`, data)
}

/**
 * 删除报销明细
 * DELETE /expense-reimbursement/{id}/items/{itemId}
 */
export const deleteExpenseItem = (id: number | string, itemId: number | string) => {
  return http.delete<ApiResponse<null>>(`/expense-reimbursement/${id}/items/${itemId}`)
}

/**
 * 上传报销附件
 * POST /expense-reimbursement/{id}/attachments
 */
export const uploadExpenseAttachment = (id: number | string, filePath: string) => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')

  return new Promise<ApiResponse<{ attachmentId: number; filePath: string }>>((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}${API_PREFIX}/expense-reimbursement/${id}/attachments`,
      filePath: filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.UploadFileSuccessCallbackResult) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200 || data.code === 0) {
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

/**
 * 关联已存在的文件
 * POST /expense-reimbursement/{id}/attachments/{fileId}
 */
export const linkExpenseAttachment = (id: number | string, fileId: number | string) => {
  return http.post<ApiResponse<{ attachmentId: number }>>(`/expense-reimbursement/${id}/attachments/${fileId}`)
}

/**
 * 删除报销附件
 * DELETE /expense-reimbursement/{id}/attachments/{attachmentId}
 */
export const deleteExpenseAttachment = (id: number | string, attachmentId: number | string) => {
  return http.delete<ApiResponse<null>>(`/expense-reimbursement/${id}/attachments/${attachmentId}`)
}

/**
 * 预览附件 - 下载文件并返回本地路径
 * GET /expense-reimbursement/attachments/{attachmentId}/preview
 */
export const downloadAndPreviewAttachment = (attachmentId: number | string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const baseUrl = getBaseUrl()
    const token = uni.getStorageSync('token')
    const url = `${baseUrl}${API_PREFIX}/expense-reimbursement/attachments/${attachmentId}/preview`
    
    uni.downloadFile({
      url: url,
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

/**
 * 下载附件
 * GET /expense-reimbursement/attachments/{attachmentId}/download
 */
export const downloadAttachmentFile = (attachmentId: number | string, fileName?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const baseUrl = getBaseUrl()
    const token = uni.getStorageSync('token')
    const url = `${baseUrl}${API_PREFIX}/expense-reimbursement/attachments/${attachmentId}/download`
    
    uni.downloadFile({
      url: url,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.DownloadSuccessData) => {
        if (res.statusCode === 200) {
          // 打开文档
          uni.openDocument({
            filePath: res.tempFilePath,
            fileName: fileName,
            success: () => {
              resolve(res.tempFilePath)
            },
            fail: (err: UniApp.GeneralCallbackResult) => {
              reject(new Error(`打开文件失败: ${err.errMsg || '未知错误'}`))
            },
          })
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

// ================= 辅助函数 =================

/** 获取审批状态文本 */
export const getApprovalStatusText = (status?: ApprovalStatus | string) => {
  const map: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
  }
  return map[status || ''] || status || '未知'
}

/** 获取审批状态样式类 */
export const getApprovalStatusClass = (status?: ApprovalStatus | string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  }
  return map[status || ''] || ''
}

/** 费用类型选项 */
export const expenseTypeOptions = [
  { label: '交通费', value: '交通费' },
  { label: '住宿费', value: '住宿费' },
  { label: '餐饮费', value: '餐饮费' },
  { label: '通讯费', value: '通讯费' },
  { label: '办公费', value: '办公费' },
  { label: '其他费用', value: '其他费用' },
]
