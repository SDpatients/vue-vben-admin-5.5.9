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
};

export const approvalUtils = {
  parseApprovalContent: (content: string | null | undefined): ApprovalContentData | { originalContent: string } | null => {
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
      // 验证解析结果是否符合预期格式
      if (parsed && typeof parsed === 'object' && 'task' in parsed && 'submissions' in parsed) {
        return parsed;
      } else {
        // 格式不符合预期，返回原始内容
        return { originalContent: content };
      }
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
      if (parsed && typeof parsed === 'object' && 'files' in parsed) {
        return parsed;
      } else {
        // 格式不符合预期，返回原始内容
        return { originalAttachment: attachment };
      }
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
