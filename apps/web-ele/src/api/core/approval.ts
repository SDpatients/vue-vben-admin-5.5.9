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

export interface Approval {
  id: number;
  approvalNo: string;
  type: string;
  applicantId: number;
  applicantName: string;
  approverId?: number;
  approverName?: string;
  status: string;
  title: string;
  description?: string;
  businessData?: string;
  applyTime: string;
  approveTime?: string;
  createTime: string;
  updateTime: string;
  attachments?: Attachment[];
}

export interface ApprovalSubmitDTO {
  type: string;
  applicantName: string;
  approverId: number;
  approverName: string;
  title: string;
  description?: string;
  businessData?: Record<string, any>;
}

export const approvalApi = {
  getApprovalList: (status?: string, type?: string, page: number = 1, pageSize: number = 20) => {
    return requestClient.get('/api/approval/list', {
      params: { status, type, page, pageSize },
    });
  },

  getPendingApprovals: (page: number = 1, pageSize: number = 20) => {
    return requestClient.get('/api/approval/pending', {
      params: { page, pageSize },
    });
  },

  getApprovalDetail: (id: number) => {
    return requestClient.get(`/api/approval/${id}`);
  },

  submitApproval: (data: ApprovalSubmitDTO) => {
    return requestClient.post('/api/approval', data);
  },

  approve: (id: number, opinion?: string) => {
    return requestClient.put(`/api/approval/${id}/approve`, { opinion });
  },

  reject: (id: number, opinion?: string) => {
    return requestClient.put(`/api/approval/${id}/reject`, { opinion });
  },

  cancel: (id: number) => {
    return requestClient.put(`/api/approval/${id}/cancel`);
  },

  getApprovalLogs: (id: number) => {
    return requestClient.get(`/api/approval/${id}/logs`);
  },
};
