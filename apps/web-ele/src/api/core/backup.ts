import { fundRequestClient } from '../request';

export namespace BackupApi {
  export interface BackupRecord {
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    backupType: 'FULL' | 'MANUAL';
    status: 'FAILED' | 'PENDING' | 'RUNNING' | 'SUCCESS';
    errorMessage: null | string;
    startTime: string;
    endTime: string;
    duration: number;
    databaseName: string;
    tableCount: null | number;
    recordCount: null | number;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
  }

  export interface BackupListParams {
    pageNum?: number;
    pageSize?: number;
    status?: 'FAILED' | 'PENDING' | 'RUNNING' | 'SUCCESS';
    backupType?: 'FULL' | 'MANUAL';
    startDate?: string;
    endDate?: string;
  }

  export interface BackupListResponse {
    total: number;
    list: BackupRecord[];
    pageNum: number;
    pageSize: number;
  }

  export interface BackupStatusResponse {
    isRunning: boolean;
    latestBackup: null | {
      id: number;
      fileName: string;
      status: string;
      startTime: string;
      endTime: string;
      fileSize: number;
      backupType: string;
    };
    latestSuccessBackup: null | {
      id: number;
      fileName: string;
      startTime: string;
      fileSize: number;
    };
  }

  export interface BackupStatisticsResponse {
    totalCount: number;
    successCount: number;
    failedCount: number;
    runningCount: number;
    totalFileSize: number;
    totalFileSizeDisplay: string;
    lastBackupTime: null | string;
    lastSuccessBackupTime: null | string;
    lastSuccessFileName: null | string;
    backupPath: string;
    retentionDays: number;
    backupEnabled: boolean;
    cronExpression: string;
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function getBackupListApi(
  params: BackupApi.BackupListParams,
): Promise<BackupApi.ApiResponse<BackupApi.BackupListResponse>> {
  return fundRequestClient.get('/v1/system/backup/list', { params });
}

export async function executeBackupApi(): Promise<
  BackupApi.ApiResponse<BackupApi.BackupRecord>
> {
  return fundRequestClient.post('/v1/system/backup/execute');
}

export async function getBackupStatusApi(): Promise<
  BackupApi.ApiResponse<BackupApi.BackupStatusResponse>
> {
  return fundRequestClient.get('/v1/system/backup/status');
}

export async function getBackupDetailApi(
  id: number,
): Promise<BackupApi.ApiResponse<BackupApi.BackupRecord>> {
  return fundRequestClient.get(`/v1/system/backup/detail/${id}`);
}

export async function downloadBackupApi(id: number): Promise<Blob> {
  return fundRequestClient.get(`/v1/system/backup/download/${id}`, {
    responseType: 'blob',
  });
}

export async function deleteBackupApi(
  id: number,
  password: string,
): Promise<BackupApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/system/backup/${id}`, {
    data: { password },
  });
}

export async function cleanupBackupApi(): Promise<
  BackupApi.ApiResponse<null>
> {
  return fundRequestClient.post('/v1/system/backup/cleanup');
}

export async function getBackupStatisticsApi(): Promise<
  BackupApi.ApiResponse<BackupApi.BackupStatisticsResponse>
> {
  return fundRequestClient.get('/v1/system/backup/statistics');
}