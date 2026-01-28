import { requestClient8085 } from '../request';

export interface CaseTaskSubmission {
  id: number;
  caseTaskId: number;
  submissionTitle: string;
  submissionContent: string;
  submissionType: string;
  submissionNumber: number;
  status: string;
  creatorName: string;
  reviewerId: number | null;
  reviewOpinion: string | null;
  reviewTime: string | null;
  createTime: string;
  updateTime: string;
  fileCount: number;
}

export interface SubmissionFile {
  id: number;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  uploadTime: string;
  uploadUserName: string;
  sortOrder?: number;
}

export interface BatchSubmissionsRequest {
  caseTaskIds: number[];
}

export interface BatchSubmissionsResponse {
  [key: string]: CaseTaskSubmission[];
}

export interface BatchFilesRequest {
  submissionIds: number[];
}

export interface BatchFilesResponse {
  [key: string]: SubmissionFile[];
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export namespace CaseTaskSubmissionApi {
  export async function createSubmission(data: {
    caseTaskId: number;
    submissionTitle: string;
    submissionContent?: string;
    submissionType?: string;
  }) {
    return requestClient8085.post<{ submissionId: number; submissionNumber: number }>('/api/case-task-submissions', data);
  }

  export async function getSubmissions(params: {
    caseTaskId: number;
    page?: number;
    size?: number;
  }) {
    return requestClient8085.get<PageResponse<CaseTaskSubmission>>('/api/case-task-submissions', { params });
  }

  export async function getSubmissionById(id: number) {
    return requestClient8085.get<CaseTaskSubmission>(`/api/case-task-submissions/${id}`);
  }

  export async function reviewSubmission(id: number, data: {
    reviewOpinion: string;
    status: 'APPROVED' | 'REJECTED';
  }) {
    return requestClient8085.put<CaseTaskSubmission>(`/api/case-task-submissions/${id}/review`, data);
  }

  export async function deleteSubmission(id: number) {
    return requestClient8085.delete(`/api/case-task-submissions/${id}`);
  }

  export async function updateSubmission(id: number, data: {
    submissionTitle?: string;
    submissionContent?: string;
  }) {
    return requestClient8085.put(`/api/case-task-submissions/${id}`, data);
  }

  export async function getLatestSubmissions(params: {
    caseTaskId: number;
    limit?: number;
  }) {
    return requestClient8085.get<CaseTaskSubmission[]>('/api/case-task-submissions/latest', { params });
  }

  export async function uploadSubmissionFile(submissionId: number, file: File, description?: string, sortOrder?: number) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    if (sortOrder !== undefined) {
      formData.append('sortOrder', sortOrder.toString());
    }
    return requestClient8085.post<SubmissionFile & { sortOrder: number }>(`/api/case-task-submissions/${submissionId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  export async function updateFileSortOrder(submissionId: number, files: Array<{ fileId: number; sortOrder: number }>) {
    return requestClient8085.put(`/api/case-task-submissions/${submissionId}/files/sort-order`, {
      files,
    });
  }

  export async function getSubmissionFiles(submissionId: number) {
    return requestClient8085.get<SubmissionFile[]>(`/api/case-task-submissions/${submissionId}/files`);
  }

  export async function deleteSubmissionFile(submissionId: number, fileId: number) {
    return requestClient8085.delete(`/api/case-task-submissions/${submissionId}/files/${fileId}`);
  }

  export async function getLatestSubmissionsBatch(data: BatchSubmissionsRequest) {
    return requestClient8085.post<BatchSubmissionsResponse>('/api/case-task-submissions/latest/batch', data);
  }

  export async function getSubmissionFilesBatch(data: BatchFilesRequest) {
    return requestClient8085.post<BatchFilesResponse>('/api/case-task-submissions/files/batch', data);
  }
}
