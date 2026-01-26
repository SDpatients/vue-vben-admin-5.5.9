import { fundRequestClient } from '../request';

export namespace ExpenseReimbursementApi {
  export interface ReimbursementItem {
    id: number;
    reimbursementId: number;
    itemName: string;
    itemAmount: number;
    itemDescription: string;
    sortOrder: number;
  }

  export interface ReimbursementAttachment {
    id: number;
    reimbursementId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    uploadTime: string;
    sortOrder: number;
  }

  export interface ReimbursementInfo {
    id: number;
    reimbursementNumber: string;
    caseId: number;
    caseName: string;
    applicantId: number;
    applicantName: string;
    fundAccountId: number;
    fundAccountName: string;
    bankName: string;
    bankAccount: string;
    totalAmount: number;
    reimbursementDate: string;
    description: string;
    approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
    approverId: null | number;
    approverName: null | string;
    approvalTime: null | string;
    approvalOpinion: null | string;
    createTime: string;
    updateTime: string;
    items: ReimbursementItem[];
    attachments: ReimbursementAttachment[];
  }

  export interface CreateReimbursementRequest {
    caseId: number;
    fundAccountId: number;
    reimbursementDate: string;
    description?: string;
    items: Array<{
      itemAmount: number;
      itemDescription?: string;
      itemName: string;
    }>;
  }

  export interface UpdateReimbursementRequest {
    caseId: number;
    fundAccountId: number;
    reimbursementDate: string;
    description?: string;
  }

  export interface ApproveReimbursementRequest {
    approvalStatus: 'APPROVED' | 'REJECTED';
    approvalOpinion?: string;
  }

  export interface AddItemRequest {
    itemName: string;
    itemAmount: number;
    itemDescription?: string;
  }

  export interface ReimbursementListParams {
    page?: number;
    size?: number;
    caseId?: number;
    applicantId?: number;
    approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
    reimbursementDate?: string;
  }

  export interface ReimbursementListResponse {
    total: number;
    list: ReimbursementInfo[];
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function createReimbursement(
  data: ExpenseReimbursementApi.CreateReimbursementRequest,
): Promise<ExpenseReimbursementApi.ApiResponse<{ reimbursementId: number }>> {
  return fundRequestClient.post('/v1/expense-reimbursement', data);
}

export async function getReimbursementDetail(
  id: number,
): Promise<
  ExpenseReimbursementApi.ApiResponse<ExpenseReimbursementApi.ReimbursementInfo>
> {
  return fundRequestClient.get(`/v1/expense-reimbursement/${id}`);
}

export async function getReimbursementList(
  params: ExpenseReimbursementApi.ReimbursementListParams,
): Promise<
  ExpenseReimbursementApi.ApiResponse<ExpenseReimbursementApi.ReimbursementListResponse>
> {
  return fundRequestClient.get('/v1/expense-reimbursement', { params });
}

export async function updateReimbursement(
  id: number,
  data: ExpenseReimbursementApi.UpdateReimbursementRequest,
): Promise<ExpenseReimbursementApi.ApiResponse<null>> {
  return fundRequestClient.put(`/v1/expense-reimbursement/${id}`, {
    ...data,
    id,
  });
}

export async function deleteReimbursement(
  id: number,
): Promise<ExpenseReimbursementApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/expense-reimbursement/${id}`);
}

export async function approveReimbursement(
  id: number,
  data: ExpenseReimbursementApi.ApproveReimbursementRequest,
): Promise<ExpenseReimbursementApi.ApiResponse<null>> {
  return fundRequestClient.post(
    `/v1/expense-reimbursement/${id}/approve`,
    data,
  );
}

export async function addReimbursementItem(
  id: number,
  data: ExpenseReimbursementApi.AddItemRequest,
): Promise<ExpenseReimbursementApi.ApiResponse<{ itemId: number }>> {
  return fundRequestClient.post(`/v1/expense-reimbursement/${id}/items`, data);
}

export async function deleteReimbursementItem(
  id: number,
  itemId: number,
): Promise<ExpenseReimbursementApi.ApiResponse<null>> {
  return fundRequestClient.delete(
    `/v1/expense-reimbursement/${id}/items/${itemId}`,
  );
}

export async function uploadReimbursementAttachment(
  id: number,
  file: File,
): Promise<
  ExpenseReimbursementApi.ApiResponse<{
    attachmentId: number;
    filePath: string;
  }>
> {
  const formData = new FormData();
  formData.append('file', file);
  return fundRequestClient.post(
    `/v1/expense-reimbursement/${id}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

export async function deleteReimbursementAttachment(
  id: number,
  attachmentId: number,
): Promise<ExpenseReimbursementApi.ApiResponse<null>> {
  return fundRequestClient.delete(
    `/v1/expense-reimbursement/${id}/attachments/${attachmentId}`,
  );
}

export async function previewReimbursementAttachment(
  attachmentId: number,
): Promise<Blob> {
  return fundRequestClient.get(
    `/v1/expense-reimbursement/attachments/${attachmentId}/preview`,
    {
      responseType: 'blob',
    },
  );
}

export async function downloadReimbursementAttachment(
  attachmentId: number,
): Promise<Blob> {
  return fundRequestClient.get(
    `/v1/expense-reimbursement/attachments/${attachmentId}/download`,
    {
      responseType: 'blob',
    },
  );
}
