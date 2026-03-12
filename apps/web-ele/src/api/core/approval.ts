import { requestClient } from '#/api/request';

export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadTime: string;
  uploader: string;
}

export interface ApprovalFile {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  description?: string;
  sortOrder: number;
  uploadTime: string;
  imageData?: string;
}

export interface ApprovalSubmission {
  id: number;
  submissionTitle: string;
  submissionContent: string;
  submissionType: string;
  submissionNumber: number;
  status: string;
  reviewerId?: number;
  reviewOpinion?: string;
  reviewTime?: string;
  createTime: string;
}

export interface ApprovalTask {
  id: number;
  taskCode: string;
  taskName: string;
  taskDescription?: string;
  status: string;
  sortOrder: number;
}

export interface ApprovalContentData {
  task: ApprovalTask;
  submissions: ApprovalSubmission[];
}

export interface ApprovalAttachmentData {
  files: Record<string, ApprovalFile[]>;
}

export interface CaseApproval {
  id: number;
  caseId: number;
  caseNumber: string;
  lawyerId: number;
  approvalType: string;
  approvalStatus: string;
  approvalTitle: string;
  approvalContent: string;
  approvalAttachment: string;
  approvalResult: string;
  approvalCount: number;
  approverId: number;
  approvalDate: string;
  remark: string;
  status: string;
  isDeleted: boolean;
  createTime: string;
  updateTime: string;
  createUserId: number;
  updateUserId: number;
  realName: string;
}

// 添加Approval类型作为CaseApproval的别名，用于兼容现有组件
export type Approval = CaseApproval;

export interface ApprovalOperationDTO {
  approvalResult: string;
  approvalOpinion: string;
  approverId: number;
}

export interface UpdateApprovalStatusDTO {
  approvalStatus: string;
}

export interface UpdateApprovalInfoDTO {
  approvalContent?: string;
  remark?: string;
}

export interface CreateApprovalDTO {
  caseId: number;
  approvalType: string;
  approvalTitle: string;
  approvalContent: string;
  approvalAttachment?: string;
  remark?: string;
}

export const approvalApi = {
  // 创建审批
  createApproval: (data: CreateApprovalDTO) => {
    return requestClient.post('/api/v1/approval', data);
  },

  // 获取审批列表
  getApprovalList: (params?: {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    lawyerId?: number;
    approvalType?: string;
    approvalStatus?: string;
    status?: string;
    approvalTitle?: string;
  }) => {
    return requestClient.get('/api/v1/approval/list', {
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params,
      },
    });
  },

  // 获取审批详情
  getApprovalDetail: (approvalId: number) => {
    return requestClient.get(`/api/v1/approval/${approvalId}`);
  },

  // 更新审批信息
  updateApprovalInfo: (approvalId: number, data: UpdateApprovalInfoDTO) => {
    return requestClient.put(`/api/v1/approval/${approvalId}`, data);
  },

  // 审批操作
  approve: (approvalId: number, data: ApprovalOperationDTO) => {
    return requestClient.post(`/api/v1/approval/${approvalId}/approve`, data);
  },

  // 更新审批状态
  updateApprovalStatus: (approvalId: number, data: UpdateApprovalStatusDTO) => {
    return requestClient.put(`/api/v1/approval/${approvalId}/status`, data);
  },

  // 删除审批
  deleteApproval: (approvalId: number) => {
    return requestClient.delete(`/api/v1/approval/${approvalId}`);
  },

  // 获取审批历史记录
  getApprovalHistory: (approvalId: number, params?: {
    pageNum?: number;
    pageSize?: number;
  }) => {
    return requestClient.get(`/api/v1/approval/${approvalId}/history`, {
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params,
      },
    });
  },

  // 获取审批附件（批量）
  getApprovalAttachments: (approvalId: number, params?: {
    includeImages?: boolean;
    includeFiles?: boolean;
  }) => {
    return requestClient.get(`/api/v1/approval/${approvalId}/attachments`, {
      params: {
        includeImages: params?.includeImages || false,
        includeFiles: params?.includeFiles || true,
        ...params,
      },
    });
  },

  // 获取待审批的CASE_SUBMIT类型数量
  getPendingCaseSubmitCount: () => {
    return requestClient.get('/api/v1/approval/pending/case-submit/count');
  },

  // 获取待审批的TASK_类型数量
  getPendingTaskCount: () => {
    return requestClient.get('/api/v1/approval/pending/task/count');
  },

  // 获取待审批的总数量
  getPendingTotalCount: () => {
    return requestClient.get('/api/v1/approval/pending/total/count');
  },
};

export const approvalUtils = {
  parseApprovalContent: (content: string | null | undefined): ApprovalContentData | { originalContent: string } | null => {
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
      // 验证解析结果是否符合预期格式
      if (parsed && typeof parsed === 'object') {
        // 新格式：{ task: {...}, submissions: [...] }
        if ('task' in parsed && 'submissions' in parsed) {
          return parsed as ApprovalContentData;
        }
        // 旧格式：{ task: {...}, submissions: {...} }
        if ('task' in parsed) {
          return parsed as ApprovalContentData;
        }
      }
      // 格式不符合预期，返回原始内容
      return { originalContent: content };
    } catch (e) {
      // 如果不是 JSON，返回原始内容，不打印错误信息
      return { originalContent: content };
    }
  },

  parseApprovalAttachment: (attachment: string | null | undefined): ApprovalAttachmentData | { originalAttachment: string } | null => {
    if (!attachment) return null;
    try {
      const parsed = JSON.parse(attachment);
      // 验证解析结果是否符合预期格式
      if (parsed && typeof parsed === 'object') {
        // 新格式：{ frontendAttachment: "...", files: { "85": [...], "86": [...] } }
        if ('files' in parsed && typeof parsed.files === 'object' && !Array.isArray(parsed.files)) {
          // 按提交ID分组的文件格式
          const result: ApprovalAttachmentData = { files: {} };
          
          for (const [submissionId, files] of Object.entries(parsed.files)) {
            if (Array.isArray(files)) {
              result.files[submissionId] = files.map((file: any) => ({
                id: file.id,
                originalFileName: file.originalFileName,
                storedFileName: file.originalFileName,
                filePath: file.filePath || '',
                fileSize: file.fileSize || 0,
                fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
                mimeType: file.mimeType || '',
                sortOrder: file.sortOrder || 0,
                uploadTime: file.uploadTime || '',
                imageData: file.imageData
              }));
            }
          }
          
          // 如果有 frontendAttachment，也解析它
          if (parsed.frontendAttachment) {
            try {
              const frontendParsed = JSON.parse(parsed.frontendAttachment);
              if (frontendParsed && Array.isArray(frontendParsed.files)) {
                // 将前端文件添加到 case_files 分组
                result.files['case_files'] = frontendParsed.files.map((file: any) => ({
                  id: file.id,
                  originalFileName: file.originalFileName,
                  storedFileName: file.originalFileName,
                  filePath: file.filePath || '',
                  fileSize: file.fileSize || 0,
                  fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
                  mimeType: file.mimeType || '',
                  sortOrder: file.sortOrder || 0,
                  uploadTime: file.uploadTime || '',
                  imageData: file.imageData
                }));
              }
            } catch (e) {
              // frontendAttachment 解析失败，忽略
            }
          }
          
          return result;
        }
        
        // 旧格式：{ files: [...] } 数组格式
        if ('files' in parsed && Array.isArray(parsed.files)) {
          return {
            files: {
              "case_files": parsed.files.map((file: any) => ({
                id: file.id,
                originalFileName: file.originalFileName,
                storedFileName: file.originalFileName,
                filePath: file.filePath || '',
                fileSize: file.fileSize || 0,
                fileExtension: file.originalFileName ? file.originalFileName.split('.').pop() || '' : '',
                mimeType: file.mimeType || '',
                sortOrder: file.sortOrder || 0,
                uploadTime: file.uploadTime || '',
                imageData: file.imageData
              }))
            }
          };
        }
        
        // 原始格式：{ "files": { "任务ID": [文件数组] } }
        if ('files' in parsed) {
          return parsed;
        }
      }
      // 格式不符合预期，返回原始内容
      return { originalAttachment: attachment };
    } catch (e) {
      // 如果不是 JSON，返回原始内容，不打印错误信息
      return { originalAttachment: attachment };
    }
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
