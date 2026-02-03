import { fileUploadRequestClient } from '#/api/request';

export namespace FileApi {
  /** 文件记录信息 */
  export interface FileRecord {
    id: number;
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    fileSize: number;
    fileExtension: string;
    mimeType: string;
    fileHash: string | null;
    bizType: string;
    bizId: number;
    uploadTime: string;
    uploadUserId: number;
    fileStatus: number;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 文件上传请求 */
  export interface UploadRequest {
    file: File;
    bizType: string;
    bizId: number;
  }

  /** 文件上传响应 */
  export interface UploadResponse {
    code: number;
    message: string;
    data: FileRecord;
  }

  /** 批量上传响应 */
  export interface BatchUploadResponse {
    code: number;
    message: string;
    data: FileRecord[];
  }

  /** 文件列表响应 */
  export interface FileListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: FileRecord[];
    };
  }

  /** 删除响应 */
  export interface DeleteResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 文件统计响应 */
  export interface StatisticsResponse {
    code: number;
    message: string;
    data: {
      totalFiles: number;
      totalSize: number;
      totalSizeMB: number;
      statusCount: Record<string, number>;
      extensionCount: Record<string, number>;
    };
  }
}

/**
 * 单文件上传
 * @param file 文件对象
 * @param bizType 业务类型 (case, creditor, debtor, claim, announcement, fund, common等)
 * @param bizId 业务ID
 */
export async function uploadFileApi(
  file: File,
  bizType: string,
  bizId: number,
): Promise<FileApi.UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', bizType);
  formData.append('bizId', bizId.toString());

  return fileUploadRequestClient.post<FileApi.UploadResponse>(
    '/api/v1/file/upload',
    formData
  );
}

/**
 * 批量文件上传（循环调用单文件上传）
 * @param files 文件数组
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function batchUploadFilesApi(
  files: File[],
  bizType: string,
  bizId: number,
): Promise<FileApi.BatchUploadResponse> {
  const uploadPromises = files.map(file => uploadFileApi(file, bizType, bizId));
  const results = await Promise.all(uploadPromises);
  
  const successResults = results.filter(r => r.code === 200).map(r => r.data);
  
  return {
    code: 200,
    message: 'success',
    data: successResults
  };
}

/**
 * 获取文件列表（分页）
 * @param bizType 业务类型
 * @param bizId 业务ID
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @param status 状态筛选
 */
export async function getFileListApi(
  bizType: string,
  bizId: number,
  pageNum: number = 1,
  pageSize: number = 10,
  status?: string,
): Promise<FileApi.FileListResponse> {
  return fileUploadRequestClient.get<FileApi.FileListResponse>(
    '/api/v1/file/list',
    {
      params: {
        pageNum,
        pageSize,
        bizType,
        bizId,
        status,
      },
    },
  );
}

/**
 * 下载文件
 * @param fileId 文件记录ID
 */
export async function downloadFileApi(fileId: number): Promise<Blob> {
  return fileUploadRequestClient.get<Blob>(`/api/v1/file/download/${fileId}`, {
    responseType: 'blob',
  });
}

/**
 * 预览文件（在新窗口中打开）
 * @param fileId 文件记录ID
 */
export async function previewFileApi(fileId: number): Promise<void> {
  const blob = await fileUploadRequestClient.get<Blob>(
    `/api/v1/file/preview/${fileId}`,
    {
      responseType: 'blob',
    },
  );
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * 获取文件信息
 * @param fileId 文件记录ID
 */
export async function getFileInfoApi(
  fileId: number,
): Promise<FileApi.UploadResponse> {
  return fileUploadRequestClient.get<FileApi.UploadResponse>(
    `/api/v1/file/${fileId}`,
  );
}

/**
 * 获取文件预览URL
 * @param fileId 文件记录ID
 */
export function getFilePreviewUrl(fileId: number): string {
  return `/api/v1/file/preview/${fileId}`;
}

/**
 * 获取完整的文件预览URL（带域名）
 * @param fileId 文件记录ID
 */
export function getFullFilePreviewUrl(fileId: number): string {
  // 从request-client获取baseURL，或者使用当前页面的域名
  const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${baseURL}/api/v1/file/preview/${fileId}`;
}

/**
 * 删除文件
 * @param fileId 文件记录ID
 */
export async function deleteFileApi(
  fileId: number,
): Promise<FileApi.DeleteResponse> {
  return fileUploadRequestClient.delete<FileApi.DeleteResponse>(
    `/api/v1/file/${fileId}`,
  );
}

/**
 * 批量删除文件
 * @param fileIds 文件ID列表
 */
export async function batchDeleteFilesApi(
  fileIds: number[],
): Promise<FileApi.DeleteResponse> {
  return fileUploadRequestClient.delete<FileApi.DeleteResponse>(
    '/api/v1/file/batch',
    {
      data: fileIds,
    },
  );
}

/**
 * 文件重命名
 * @param fileId 文件记录ID
 * @param newFileName 新文件名
 */
export async function renameFileApi(
  fileId: number,
  newFileName: string,
): Promise<FileApi.UploadResponse> {
  const formData = new FormData();
  formData.append('newFileName', newFileName);

  return fileUploadRequestClient.put<FileApi.UploadResponse>(
    `/api/v1/file/${fileId}/rename`,
    formData,
  );
}

/**
 * 更新文件状态
 * @param fileId 文件记录ID
 * @param status 状态值（ACTIVE/INACTIVE）
 */
export async function updateFileStatusApi(
  fileId: number,
  status: string,
): Promise<FileApi.UploadResponse> {
  const formData = new FormData();
  formData.append('status', status);

  return fileUploadRequestClient.put<FileApi.UploadResponse>(
    `/api/v1/file/${fileId}/status`,
    formData,
  );
}

/**
 * 批量更新文件状态
 * @param fileIds 文件ID列表
 * @param status 状态值（ACTIVE/INACTIVE）
 */
export async function batchUpdateFileStatusApi(
  fileIds: number[],
  status: string,
): Promise<FileApi.DeleteResponse> {
  return fileUploadRequestClient.put<FileApi.DeleteResponse>(
    '/api/v1/file/batch/status',
    null,
    {
      params: {
        fileIds: fileIds.join(','),
        status,
      },
    },
  );
}

/**
 * 获取文件统计信息
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function getFileStatisticsApi(
  bizType?: string,
  bizId?: number,
): Promise<FileApi.StatisticsResponse> {
  return fileUploadRequestClient.get<FileApi.StatisticsResponse>(
    '/api/v1/file/statistics',
    {
      params: {
        bizType,
        bizId,
      },
    },
  );
}

/**
 * 获取业务的所有文件（不分页）
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function getAllFilesByBizApi(
  bizType: string,
  bizId: number,
): Promise<{ code: number; message: string; data: FileApi.FileRecord[] }> {
  return fileUploadRequestClient.get<{ code: number; message: string; data: FileApi.FileRecord[] }>(
    '/api/v1/file/all',
    {
      params: {
        bizType,
        bizId,
      },
    },
  );
}

/**
 * 下载文件（旧数据，使用 filePath）
 * @param filePath 文件路径
 * @param fileName 文件名（可选）
 */
export async function downloadFileByPathApi(
  filePath: string,
  fileName?: string,
): Promise<Blob> {
  const params: Record<string, string> = {
    filePath: encodeURIComponent(filePath),
  };
  if (fileName) {
    params.fileName = encodeURIComponent(fileName);
  }
  return fileUploadRequestClient.get<Blob>('/api/v1/file/download-by-path', {
    params,
    responseType: 'blob',
  });
}

/**
 * 预览文件（旧数据，使用 filePath）
 * @param filePath 文件路径
 * @param fileName 文件名（可选）
 */
export async function previewFileByPathApi(
  filePath: string,
  fileName?: string,
): Promise<void> {
  const params: Record<string, string> = {
    filePath: encodeURIComponent(filePath),
  };
  if (fileName) {
    params.fileName = encodeURIComponent(fileName);
  }
  const blob = await fileUploadRequestClient.get<Blob>('/api/v1/file/preview-by-path', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * 业务类型映射表
 */
export const BizTypeMap = {
  case: 'case',
  creditor: 'creditor',
  debtor: 'debtor',
  claim: 'claim',
  announcement: 'announcement',
  fund: 'fund',
  common: 'common',
  process: 'process',
  archive: 'archive',
  notice: 'notice',
} as const;

export type BizType = keyof typeof BizTypeMap;
