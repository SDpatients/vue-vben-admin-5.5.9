import { requestClient } from '#/api/request';

export namespace FileApi {
  /** 文件信息 */
  export interface FileInfo {
    fileId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    bucketName: string;
    uploadTime: string;
    uploadUser: string;
    status: string;
    caseId?: number;
    caseNo?: string;
  }

  /** 文件列表响应 */
  export interface FileListResponse {
    data: {
      count: number;
      pages: number;
      records: FileInfo[];
    };
    code: number;
    message: string;
  }

  /** 文件响应 */
  export interface FileResponse {
    code: number;
    message: string;
  }
}

/**
 * 上传文件
 */
export async function uploadFileApi() {
  return requestClient.post<FileApi.FileResponse>('/files/upload');
}

/**
 * 下载文件
 */
export async function downloadFileApi() {
  return requestClient.get('/files/download');
}

/**
 * 删除文件
 */
export async function deleteFileApi() {
  return requestClient.delete<FileApi.FileResponse>('/files');
}

/**
 * 批量上传文件
 */
export async function batchUploadCaseFilesApi() {
  return requestClient.post<FileApi.FileResponse>('/files/batch-upload');
}

/**
 * 获取文件列表
 */
export async function getFileListApi(bizType: string, bizId: number) {
  return requestClient.get<FileApi.FileListResponse>('/files/list', {
    params: {
      bizType,
      bizId
    }
  });
}
