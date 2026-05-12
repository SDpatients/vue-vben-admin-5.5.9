import http from './request'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type ApprovalType =
  | 'CASE_SUBMIT'
  | 'CASE_CLOSE'
  | 'FEE_APPLY'
  | 'EVIDENCE_UPLOAD'
  | 'TASK_001'
  | 'TASK_002'
  | 'TASK_003'
  | 'TASK_004'
  | 'TASK_005'
  | 'TASK_006'
  | 'TASK_007'
  | 'TASK_008'
  | 'TASK_009'
  | 'TASK_010'
  | 'TASK_011'
  | 'TASK_012'
  | 'TASK_013'
  | 'TASK_014'
  | 'TASK_015'
  | 'TASK_016'
  | 'TASK_017'
  | 'TASK_018'
  | 'TASK_019'
  | 'TASK_020'
  | 'TASK_021'
  | 'TASK_022'
  | 'TASK_023'
  | string

export interface ApprovalFile {
  id: number
  originalFileName: string
  filePath: string
  fileSize: number
  fileExtension: string
  mimeType: string
  sortOrder: number
  uploadTime: string
  imageData?: string
}

export interface ApprovalSubmission {
  id: number
  submissionTitle: string
  submissionContent: string
  submissionType: string
  submissionNumber: number
  status: string
  reviewerId?: number
  reviewOpinion?: string
  reviewTime?: string
  createTime: string
}

export interface ApprovalTask {
  id: number
  taskCode: string
  taskName: string
  taskDescription?: string
  status: string
  sortOrder: number
}

export interface ApprovalContentData {
  task: ApprovalTask
  submissions: ApprovalSubmission[]
}

export interface ApprovalAttachmentData {
  files: Record<string, ApprovalFile[]>
}

export interface Approval {
  id: number
  caseId: number
  caseNumber: string
  lawyerId: number
  approvalType: ApprovalType
  approvalStatus: ApprovalStatus
  approvalTitle: string
  approvalContent: string
  approvalAttachment: string
  approvalResult: string
  approvalCount: number
  approverId: number
  approvalDate: string
  remark: string
  status: string
  isDeleted: boolean
  createTime: string
  updateTime: string
  createUserId: number
  updateUserId: number
  realName: string
}

export interface ApprovalListParams {
  pageNum?: number
  pageSize?: number
  caseId?: number
  lawyerId?: number
  approvalType?: string
  approvalStatus?: string
  status?: string
  approvalTitle?: string
}

export interface ApprovalOperationDTO {
  approvalResult: string
  approvalOpinion: string
  approverId: number
}

export interface ApprovalHistoryItem {
  id: number
  approvalType: string
  approvalStatus: string
  approvalOpinion?: string
  createTime: string
}

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

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ApprovalAttachmentsResponse {
  code: number
  message: string
  attachments: Record<string, ApprovalFile[]>
}

export interface PendingCountResponse {
  code: number
  message: string
  count: number
}

/** 完整的审批类型名称映射（含TASK_001-TASK_023） */
export const approvalTypes: Record<string, string> = {
  CASE_SUBMIT: '案件提交',
  CASE_CLOSE: '案件结案',
  FEE_APPLY: '费用申请',
  EVIDENCE_UPLOAD: '证据上传',
  TASK_001: '提交破产申请材料',
  TASK_002: '裁定受理并公告',
  TASK_003: '全面接管债务人',
  TASK_004: '管理人印章',
  TASK_005: '调查财产及经营状况',
  TASK_006: '追收债务人财产',
  TASK_007: '决定合同继续履行或解除',
  TASK_008: '通知已知债权人并公告',
  TASK_009: '接收、登记债权申报',
  TASK_010: '审查申报债权并编制债权表',
  TASK_011: '债权审查结果通知',
  TASK_012: '会议资料',
  TASK_013: '表决事项和表决结果',
  TASK_014: '宣告重整与和解',
  TASK_015: '审查宣告破产条件',
  TASK_016: '裁定宣告债务人破产及公告',
  TASK_017: '破产财产变价方案',
  TASK_018: '破产费用与共益债务',
  TASK_019: '破产财产分配方案',
  TASK_020: '提请终结破产程序',
  TASK_021: '法院裁定并公告',
  TASK_022: '办理企业注销登记',
  TASK_023: '管理人终止执行职务并归档',
}

/** API→UI状态映射 */
export const approvalStatusMap: Record<string, string> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'rejected',
}

/** 获取审批列表 */
export const getApprovalList = (params?: ApprovalListParams) => {
  return http.get<PageResponse<Approval>>('/approval/list', {
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
    ...params,
  })
}

/** 获取审批详情 */
export const getApprovalDetail = (id: number | string) => {
  return http.get<ApiResponse<Approval>>(`/approval/${id}`)
}

/** 审批操作（通过/驳回） */
export const approveApproval = (id: number | string, data: ApprovalOperationDTO) => {
  return http.post<ApiResponse<null>>(`/approval/${id}/approve`, data)
}

/** 获取审批历史记录 */
export const getApprovalHistory = (id: number | string, params?: {
  pageNum?: number
  pageSize?: number
}) => {
  return http.get<PageResponse<ApprovalHistoryItem>>(`/approval/${id}/history`, {
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
  })
}

/** 批量获取审批附件 */
export const getApprovalAttachments = (id: number | string, params?: {
  includeImages?: boolean
  includeFiles?: boolean
}) => {
  return http.get<ApprovalAttachmentsResponse>(`/approval/${id}/attachments`, {
    includeImages: params?.includeImages ?? false,
    includeFiles: params?.includeFiles ?? true,
  })
}

/** 获取CASE_SUBMIT类型待审批数量 */
export const getPendingCaseSubmitCount = () => {
  return http.get<PendingCountResponse>('/approval/pending/case-submit/count')
}

/** 获取TASK_类型待审批数量 */
export const getPendingTaskCount = () => {
  return http.get<PendingCountResponse>('/approval/pending/task/count')
}

/** 获取待审批总数量 */
export const getPendingTotalCount = () => {
  return http.get<PendingCountResponse>('/approval/pending/total/count')
}

// ================= 辅助函数 =================

export const getApprovalStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    CANCELLED: '已取消',
  }
  return map[status || ''] || status || '未知'
}

export const getApprovalStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    CANCELLED: 'status-cancelled',
  }
  return map[status || ''] || ''
}

export const getApprovalTypeText = (type?: string) => {
  return approvalTypes[type || ''] || type || '未知'
}

export const getApprovalResultText = (result?: string) => {
  const map: Record<string, string> = {
    PASS: '通过',
    FAIL: '未通过',
  }
  return map[result || ''] || result || ''
}

export const getApprovalResultClass = (result?: string) => {
  const map: Record<string, string> = {
    PASS: 'result-pass',
    FAIL: 'result-fail',
  }
  return map[result || ''] || ''
}

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i]
}

// ================= 审批工具函数 =================

/** 解析审批内容JSON（包含task和submissions） */
export const parseApprovalContent = (content: string | null | undefined): ApprovalContentData | { originalContent: string } | null => {
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object') {
      if ('task' in parsed && 'submissions' in parsed) {
        return parsed as ApprovalContentData
      }
      if ('task' in parsed) {
        return parsed as ApprovalContentData
      }
    }
    return { originalContent: content }
  } catch {
    return { originalContent: content }
  }
}

/** 解析审批附件JSON */
export const parseApprovalAttachment = (attachment: string | null | undefined): ApprovalAttachmentData | { originalAttachment: string } | null => {
  if (!attachment) return null
  try {
    const parsed = JSON.parse(attachment)
    if (parsed && typeof parsed === 'object') {
      if ('files' in parsed && typeof parsed.files === 'object' && !Array.isArray(parsed.files)) {
        const result: ApprovalAttachmentData = { files: {} }
        for (const [submissionId, files] of Object.entries(parsed.files)) {
          if (Array.isArray(files)) {
            result.files[submissionId] = files.map((file: any) => ({
              id: file.id,
              originalFileName: file.originalFileName,
              filePath: file.filePath || '',
              fileSize: file.fileSize || 0,
              fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
              mimeType: file.mimeType || '',
              sortOrder: file.sortOrder || 0,
              uploadTime: file.uploadTime || '',
              imageData: file.imageData,
            }))
          }
        }
        if (parsed.frontendAttachment) {
          try {
            const frontendParsed = JSON.parse(parsed.frontendAttachment)
            if (frontendParsed && Array.isArray(frontendParsed.files)) {
              result.files['case_files'] = frontendParsed.files.map((file: any) => ({
                id: file.id,
                originalFileName: file.originalFileName,
                filePath: file.filePath || '',
                fileSize: file.fileSize || 0,
                fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
                mimeType: file.mimeType || '',
                sortOrder: file.sortOrder || 0,
                uploadTime: file.uploadTime || '',
                imageData: file.imageData,
              }))
            }
          } catch {
            // 解析失败，忽略
          }
        }
        return result
      }
      if ('files' in parsed && Array.isArray(parsed.files)) {
        return {
          files: {
            case_files: parsed.files.map((file: any) => ({
              id: file.id,
              originalFileName: file.originalFileName,
              filePath: file.filePath || '',
              fileSize: file.fileSize || 0,
              fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
              mimeType: file.mimeType || '',
              sortOrder: file.sortOrder || 0,
              uploadTime: file.uploadTime || '',
              imageData: file.imageData,
            })),
          },
        }
      }
    }
    return { originalAttachment: attachment }
  } catch {
    return { originalAttachment: attachment }
  }
}

/** 审批类型筛选选项（完整27种） */
export const approvalTypeOptions = [
  { label: '案件提交', value: 'CASE_SUBMIT' },
  { label: '案件结案', value: 'CASE_CLOSE' },
  { label: '费用申请', value: 'FEE_APPLY' },
  { label: '证据上传', value: 'EVIDENCE_UPLOAD' },
  { label: '提交破产申请材料', value: 'TASK_001' },
  { label: '裁定受理并公告', value: 'TASK_002' },
  { label: '全面接管债务人', value: 'TASK_003' },
  { label: '管理人印章', value: 'TASK_004' },
  { label: '调查财产及经营状况', value: 'TASK_005' },
  { label: '追收债务人财产', value: 'TASK_006' },
  { label: '决定合同继续履行或解除', value: 'TASK_007' },
  { label: '通知已知债权人并公告', value: 'TASK_008' },
  { label: '接收、登记债权申报', value: 'TASK_009' },
  { label: '审查申报债权并编制债权表', value: 'TASK_010' },
  { label: '债权审查结果通知', value: 'TASK_011' },
  { label: '会议资料', value: 'TASK_012' },
  { label: '表决事项和表决结果', value: 'TASK_013' },
  { label: '宣告重整与和解', value: 'TASK_014' },
  { label: '审查宣告破产条件', value: 'TASK_015' },
  { label: '裁定宣告债务人破产及公告', value: 'TASK_016' },
  { label: '破产财产变价方案', value: 'TASK_017' },
  { label: '破产费用与共益债务', value: 'TASK_018' },
  { label: '破产财产分配方案', value: 'TASK_019' },
  { label: '提请终结破产程序', value: 'TASK_020' },
  { label: '法院裁定并公告', value: 'TASK_021' },
  { label: '办理企业注销登记', value: 'TASK_022' },
  { label: '管理人终止执行职务并归档', value: 'TASK_023' },
]

/** 审批状态筛选选项 */
export const approvalStatusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
]