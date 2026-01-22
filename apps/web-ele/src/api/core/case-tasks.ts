import { requestClient8085 } from '../request';

export interface CaseTask {
  id: number;
  caseId: number;
  taskCode: string;
  taskName: string;
  taskDescription: string;
  status: string;
  fileCount: number;
  createTime: string;
  updateTime: string;
}

export interface CaseTaskDetail extends CaseTask {
  caseNumber: string;
  files: TaskFile[];
}

export interface TaskFile {
  id: number;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  uploadTime: string;
  uploadUserName: string;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewingTasks: number;
  skippedTasks: number;
  rejectedTasks: number;
  completionRate: number;
  totalFiles: number;
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

export namespace CaseTaskApi {
  export async function getCaseTasks(params: {
    caseId: number;
    status?: string;
    taskCode?: string;
    page?: number;
    size?: number;
  }) {
    return requestClient8085.get<PageResponse<CaseTask>>('/api/case-tasks', { params });
  }

  export async function getCaseTaskById(id: number) {
    return requestClient8085.get<CaseTaskDetail>(`/api/case-tasks/${id}`);
  }

  export async function updateCaseTask(id: number, data: {
    taskDescription?: string;
    status?: string;
  }) {
    return requestClient8085.patch<CaseTask>(`/api/case-tasks/${id}`, data);
  }

  export async function batchUpdateTaskStatus(data: {
    taskIds: number[];
    status: string;
  }) {
    return requestClient8085.put<{ successCount: number; failCount: number }>('/api/case-tasks/batch-status', data);
  }

  export async function getTaskStatistics(caseId: number) {
    return requestClient8085.get<TaskStatistics>(`/api/case-tasks/statistics/${caseId}`);
  }

  export async function uploadTaskFile(taskId: number, file: File, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return requestClient8085.post<TaskFile>(`/api/case-tasks/${taskId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  export async function getTaskFiles(taskId: number) {
    return requestClient8085.get<TaskFile[]>(`/api/case-tasks/${taskId}/files`);
  }

  export async function deleteTaskFile(taskId: number, fileId: number) {
    return requestClient8085.delete(`/api/case-tasks/${taskId}/files/${fileId}`);
  }
}
