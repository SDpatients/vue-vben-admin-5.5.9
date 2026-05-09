import http, { getBaseUrl } from './request'
import { API_PREFIX } from '@/config'

export interface CaseTask {
  id: number
  caseId: number
  taskCode: string
  taskName: string
  taskDescription: string
  status: string
  fileCount: number
  createTime: string
  updateTime: string
}

export interface CaseTaskDetail extends CaseTask {
  caseNumber: string
  files: TaskFile[]
}

export interface TaskFile {
  id: number
  originalFileName: string
  filePath: string
  fileSize: number
  uploadTime: string
  uploadUserName: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

// ==================== 案件任务 API ====================

export const getCaseTasks = (params: {
  caseId: number
  status?: string
  taskCode?: string
  page?: number
  size?: number
}) => {
  return http.get<{ code: number; message: string; data: PageResponse<CaseTask> }>(
    '/case-tasks',
    params
  )
}

export const getCaseTaskById = (id: number) => {
  return http.get<{ code: number; message: string; data: CaseTaskDetail }>(
    `/case-tasks/${id}`
  )
}

export const addCaseTask = (data: Partial<CaseTask>) => {
  return http.post<{ code: number; message: string; data: CaseTask }>(
    '/case-tasks',
    data
  )
}

export const updateCaseTask = (id: number, data: {
  taskDescription?: string
  status?: string
}) => {
  return http.patch<{ code: number; message: string; data: CaseTask }>(
    `/case-tasks/${id}`,
    data
  )
}

export const deleteCaseTask = (id: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/case-tasks/${id}`
  )
}

export const getTaskFiles = (taskId: number) => {
  return http.get<{ code: number; message: string; data: TaskFile[] }>(
    `/case-tasks/${taskId}/files`
  )
}

export const uploadTaskFile = (taskId: number, filePath: string, fileName: string, description?: string) => {
  return new Promise<{ code: number; message: string; data: TaskFile }>((resolve, reject) => {
    uni.uploadFile({
      url: `${getBaseUrl()}${API_PREFIX}/case-tasks/${taskId}/files`,
      filePath,
      name: 'file',
      formData: description ? { description } : undefined,
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: reject,
    })
  })
}

export const deleteTaskFile = (taskId: number, fileId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/case-tasks/${taskId}/files/${fileId}`
  )
}

export const getFilePreviewUrl = (fileId: number) => {
  return `${getBaseUrl()}${API_PREFIX}/case-tasks/files/preview/${fileId}`
}

// ==================== 案件提交记录 API ====================

export interface SubmissionData {
  id: number
  caseTaskId: number
  submissionTitle: string
  submissionContent: string
  submissionType: string
  status: string
  creatorName: string
  createTime: string
  updateTime: string
  files?: TaskFile[]
}

export const getCaseTaskSubmissions = (taskId: number) => {
  return http.get<{ code: number; message: string; data: SubmissionData[] }>(
    `/case-task-submissions/task/${taskId}`
  )
}

export const getSubmissionById = (id: number) => {
  return http.get<{ code: number; message: string; data: SubmissionData }>(
    `/case-task-submissions/${id}`
  )
}

export const createSubmission = (data: {
  caseTaskId: number
  submissionTitle: string
  submissionContent: string
  submissionType: string
  createTime?: string
}) => {
  return http.post<{ code: number; message: string; data: { submissionId: number } }>(
    '/case-task-submissions',
    data
  )
}

export const updateSubmission = (id: number, data: Partial<SubmissionData>) => {
  return http.put<{ code: number; message: string; data: SubmissionData }>(
    `/case-task-submissions/${id}`,
    data
  )
}

export const deleteSubmission = (id: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/case-task-submissions/${id}`
  )
}

// ==================== 提交文件 API ====================

export const getSubmissionFiles = (submissionId: number) => {
  return http.get<{ code: number; message: string; data: TaskFile[] }>(
    `/case-task-submissions/${submissionId}/files`
  )
}

export const uploadSubmissionFile = (
  submissionId: number,
  filePath: string,
  fileName?: string,
  sortOrder?: number
) => {
  return new Promise<{ code: number; message: string; data: TaskFile }>((resolve, reject) => {
    const formData: Record<string, string> = {}
    if (fileName) formData.fileName = fileName
    if (sortOrder !== undefined) formData.sortOrder = String(sortOrder)

    uni.uploadFile({
      url: `${getBaseUrl()}${API_PREFIX}/case-task-submissions/${submissionId}/files`,
      filePath,
      name: 'file',
      formData,
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: reject,
    })
  })
}

export const deleteSubmissionFile = (submissionId: number, fileId: number) => {
  return http.delete<{ code: number; message: string; data: null }>(
    `/case-task-submissions/${submissionId}/files/${fileId}`
  )
}

// ==================== 批量 API ====================

export const createSubmissionBatch = (data: {
  caseTaskIds: number[]
}) => {
  return http.post<{ code: number; message: string; data: Record<number, SubmissionData[]> }>(
    '/case-task-submissions/latest/batch',
    data
  )
}

export const getSubmissionFilesBatch = (submissionIds: number[]) => {
  return http.post<{ code: number; message: string; data: Record<number, TaskFile[]> }>(
    '/case-task-submissions/files/batch',
    { submissionIds }
  )
}

// ==================== 任务状态更新 ====================

export const updateTaskStatus = (taskId: number, status: string) => {
  return http.patch<{ code: number; message: string; data: CaseTask }>(
    `/case-tasks/${taskId}`,
    { status }
  )
}

// ==================== 状态映射 ====================

export const taskStatusMap: Record<string, { text: string; type: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
  pending: { text: '待处理', type: 'warning' },
  in_progress: { text: '进行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'error' },
  PENDING: { text: '待处理', type: 'warning' },
  IN_PROGRESS: { text: '进行中', type: 'primary' },
  COMPLETED: { text: '已完成', type: 'success' },
  CANCELLED: { text: '已取消', type: 'error' },
}

// ==================== 阶段配置 ====================

export const stageTaskMap: Record<number, string[]> = {
  1: ['TASK_001', 'TASK_002'],
  2: ['TASK_003', 'TASK_004', 'TASK_005', 'TASK_006', 'TASK_007'],
  3: ['TASK_008', 'TASK_009', 'TASK_010', 'TASK_011'],
  4: ['TASK_012', 'TASK_013'],
  5: ['TASK_014', 'TASK_015', 'TASK_016'],
  6: ['TASK_017', 'TASK_018', 'TASK_019'],
  7: ['TASK_020', 'TASK_021', 'TASK_022', 'TASK_023'],
}

export const taskCodeNameMap: Record<string, string> = {
  'TASK_001': '提交破产申请材料',
  'TASK_002': '裁定受理并公告',
  'TASK_003': '全面接管债务人',
  'TASK_004': '管理人印章',
  'TASK_005': '调查财产及经营状况',
  'TASK_006': '追收债务人财产',
  'TASK_007': '决定合同继续履行或解除',
  'TASK_008': '通知已知债权人并公告',
  'TASK_009': '接收、登记债权申报',
  'TASK_010': '审查申报债权并编制债权表',
  'TASK_011': '债权审查结果通知',
  'TASK_012': '会议资料',
  'TASK_013': '表决事项和表决结果',
  'TASK_014': '宣告重整与和解',
  'TASK_015': '审查宣告破产条件',
  'TASK_016': '裁定宣告债务人破产及公告',
  'TASK_017': '破产财产变价方案',
  'TASK_018': '破产费用与共益债务',
  'TASK_019': '破产财产分配方案',
  'TASK_020': '提请终结破产程序',
  'TASK_021': '法院裁定并公告',
  'TASK_022': '办理企业注销登记',
  'TASK_023': '管理人终止执行职务并归档',
}

export const stageConfig = {
  1: {
    name: '一、破产申请与受理',
    description: '本阶段是破产程序的启动阶段，主要包括：1. 申请人向法院提交破产申请书及相关证据材料；2. 法院进行立案形式审查，确认申请材料是否齐全、申请人是否具备主体资格等；3. 法院对债务人是否具备破产原因进行实质审查；4. 法院同步选任管理人，负责后续破产程序的推进；5. 法院裁定受理破产申请并发布公告，通知相关各方。',
    modules: [
      { code: 'workTeam', name: '工作团队' },
      { code: 'workPlan', name: '工作计划' },
      { code: 'acceptance', name: '破产受理' },
      { code: 'assetsAndLiabilities', name: '资产负债' },
      { code: 'noticeAndNotice', name: '通知与公告' },
    ],
  },
  2: {
    name: '二、接管与调查',
    description: '本阶段主要是对债务人进行全面接管与调查，主要包括：1. 管理人接管债务人的财产、印章、文书等资料；2. 对债务人财产状况进行全面调查，梳理财产线索；3. 调查债务人经营状况，了解破产原因；4. 通知已知债权人申报债权；5. 对债务人财产进行保全，防止财产流失。',
    modules: [
      { code: 'takeOver', name: '接管移交' },
      { code: 'auditInvestigation', name: '审计调查' },
      { code: 'propertySearch', name: '财产查控' },
      { code: 'recoverDebt', name: '追收债务' },
      { code: 'administrativeRecovery', name: '行政追收' },
      { code: 'recoveryLawsuit', name: '追收诉讼' },
      { code: 'criminalOffense', name: '刑事追责' },
    ],
  },
  3: {
    name: '三、债权申报与核查',
    description: '本阶段主要进行债权申报与核查工作，主要包括：1. 接受债权人债权申报，登记申报信息；2. 对申报债权进行审查，编制债权表；3. 对有异议的债权进行处理；4. 召开债权人会议核查债权；5. 最终确认债权表，作为后续分配依据。',
    modules: [
      { code: 'debtDeclaration', name: '债权申报' },
      { code: 'creditorRightExamination', name: '债权审查' },
      { code: 'creditor', name: '债权人' },
      { code: 'creditorsMeeting', name: '债权人会议' },
      { code: 'rightOfVoting', name: '表决权' },
      { code: 'creditorsCommittee', name: '债权人委员会' },
      { code: 'postClaimReview', name: '诉后债权复核' },
      { code: 'debtExaminationLitigation', name: '债权核查诉讼' },
    ],
  },
  4: {
    name: '四、债权人会议',
    description: '本阶段主要组织召开债权人会议，主要包括：1. 筹备第一次债权人会议，准备会议材料；2. 召开债权人会议，审议管理人报告；3. 表决各项议案，形成会议决议；4. 处理债权人异议；5. 根据会议决议推进后续工作。',
    modules: [
      { code: 'resolution', name: '会议决议' },
      { code: 'resolutionRecord', name: '表决记录' },
      { code: 'voting', name: '投票' },
      { code: 'meetingMinutes', name: '会议纪要' },
      { code: 'meetingMatters', name: '会议事项' },
      { code: 'meeting', name: '会议' },
      { code: 'notice', name: '通知' },
      { code: 'agenda', name: '议程' },
    ],
  },
  5: {
    name: '五、重整和解及破产宣告',
    description: '本阶段根据案件情况选择程序走向，主要包括：1. 制定重整计划草案；2. 与债权人进行和解谈判；3. 召开债权人会议表决；4. 法院批准或宣告破产；5. 根据程序走向开展相应工作。',
    modules: [
      { code: 'reorganizationPlan', name: '重整计划' },
      { code: 'settlementAgreement', name: '和解协议' },
      { code: 'bankruptcyDeclaration', name: '破产宣告' },
      { code: 'propertyValuationPlan', name: '财产变价方案' },
    ],
  },
  6: {
    name: '六、财产变价与分配',
    description: '本阶段主要进行破产财产的变价与分配，主要包括：1. 制定财产变价方案；2. 通过拍卖、变卖等方式变价财产；3. 制定财产分配方案；4. 召开债权人会议表决；5. 实施财产分配，清偿各类债权。',
    modules: [
      { code: 'assetValuation', name: '资产评估' },
      { code: 'propertyValuationImplementation', name: '财产变价实施' },
      { code: 'bankruptcyDeclaration', name: '破产宣告' },
      { code: 'auctionAgency', name: '拍卖机构' },
      { code: 'propertyDistribution', name: '财产分配' },
      { code: 'auditReport', name: '审计报告' },
    ],
  },
  7: {
    name: '七、程序终结与注销',
    description: '本阶段主要完成破产程序的收尾工作，主要包括：1. 办理破产程序终结手续；2. 完成财务决算，编制财务报告；3. 办理工商、税务等注销登记；4. 移交档案材料；5. 完成其他收尾工作，管理人终止执行职务。',
    modules: [
      { code: 'propertyFinalReport', name: '财产终结报告' },
      { code: 'workSummaryReport', name: '工作总结报告' },
      { code: 'projectClosingApplication', name: '项目结案申请' },
      { code: 'fileArchive', name: '档案归档' },
      { code: 'accountCloseOut', name: '账户销户' },
      { code: 'taxDeregistration', name: '税务注销' },
      { code: 'businessDeregistration', name: '工商注销' },
      { code: 'sealDestruction', name: '印章销毁' },
      { code: 'accountClosing', name: '账户销户' },
    ],
  },
}
