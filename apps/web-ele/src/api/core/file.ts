import { requestClient } from '#/api/request';

export namespace FileApi {
  /** 文件信息 */
  export interface FileInfo {
    fileId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
<<<<<<< Updated upstream
    filePath: string;
    bucketName: string;
=======
    fileExtension: string;
    mimeType: string;
    fileHash: null | string;
    bizType: string;
    bizId: number;
>>>>>>> Stashed changes
    uploadTime: string;
    uploadUser: string;
    status: string;
    caseId?: number;
    caseNo?: string;
  }

  /** 文件列表响应 */
  export interface FileListResponse {
    data: {
<<<<<<< Updated upstream
      count: number;
      pages: number;
      records: FileInfo[];
=======
      list: FileRecord[];
      total: number;
>>>>>>> Stashed changes
    };
    code: number;
    message: string;
  }

  /** 文件响应 */
  export interface FileResponse {
    code: number;
    message: string;
<<<<<<< Updated upstream
=======
    data: {
      extensionCount: Record<string, number>;
      statusCount: Record<string, number>;
      totalFiles: number;
      totalSize: number;
      totalSizeMB: number;
    };
>>>>>>> Stashed changes
  }
}

/**
 * 上传文件
 */
<<<<<<< Updated upstream
export async function uploadFileApi() {
  return requestClient.post<FileApi.FileResponse>('/files/upload');
=======
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
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
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
  const uploadPromises = files.map((file) =>
    uploadFileApi(file, bizType, bizId),
  );
  const results = await Promise.all(uploadPromises);

  const successResults = results
    .filter((r) => r.code === 200)
    .map((r) => r.data);

  return {
    code: 200,
    message: 'success',
    data: successResults,
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
>>>>>>> Stashed changes
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
