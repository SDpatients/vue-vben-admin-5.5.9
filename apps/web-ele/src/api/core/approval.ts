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

export interface CaseApproval {
  id: number;
  caseId: number;
  caseNumber: string;
  caseTitle?: string;
  approvalTitle?: string;
  caseType?: string;
  lawyerId: number;
  approvalType: string;
  approvalStatus: string;
  approvalContent: string;
  approvalResult?: string;
  approvalCount: number;
  approverId?: number;
  approvalDate?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  createUserId?: number;
  updateUserId?: number;
  isDeleted: boolean;
  status: string;
  submitter?: string;
  submitTime?: string;
  priority?: string;
  description?: string;
  attachments?: Attachment[];
}

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

export const approvalApi = {
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
};
