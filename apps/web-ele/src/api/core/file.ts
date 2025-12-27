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
    fileHash: string;
    bizType: string;
    bizId: number;
    uploadTime: string;
    uploadUser: string;
    fileStatus: number;
    isDeleted: boolean;
  }

  /** 文件上传请求 */
  export interface UploadRequest {
    file: File;
    bizType: string;
    bizId: number;
  }

  /** 文件上传响应 */
  export interface UploadResponse {
    status: string;
    msg: string;
    data: FileRecord;
  }

  /** 批量上传响应 */
  export interface BatchUploadResponse {
    status: string;
    msg: string;
    data: FileRecord[];
  }

  /** 文件列表响应 */
  export interface FileListResponse {
    status: string;
    msg: string;
    data: FileRecord[];
  }

  /** 删除响应 */
  export interface DeleteResponse {
    status: string;
    msg: string;
  }
}

/**
 * 获取认证token
 */
const getToken = () => {
  return (
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA'
  );
};

/**
 * 单文件上传
 * @param file 文件对象
 * @param bizType 业务类型 (case, process, notice等)
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
    '/api/file/upload',
    formData,
    {
      params: {
        token: getToken(),
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 批量文件上传
 * @param files 文件数组
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function batchUploadFilesApi(
  files: File[],
  bizType: string,
  bizId: number,
): Promise<FileApi.BatchUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('bizType', bizType);
  formData.append('bizId', bizId.toString());

  return fileUploadRequestClient.post<FileApi.BatchUploadResponse>(
    '/api/file/batchUpload',
    formData,
    {
      params: {
        token: getToken(),
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 获取文件列表
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function getFileListApi(
  bizType: string,
  bizId: number,
): Promise<FileApi.FileListResponse> {
  return fileUploadRequestClient.get<FileApi.FileListResponse>(
    '/api/file/list',
    {
      params: {
        token: getToken(),
        bizType,
        bizId,
      },
    },
  );
}

/**
 * 下载文件
 * @param fileId 文件记录ID
 */
export async function downloadFileApi(fileId: number): Promise<Blob> {
  return fileUploadRequestClient.get<Blob>(`/api/file/download/${fileId}`, {
    params: {
      token: getToken(),
    },
    responseType: 'blob',
  });
}

/**
 * 获取文件预览URL
 * @param fileId 文件记录ID
 */
export function getFilePreviewUrl(fileId: number): string {
  return `http://192.168.0.120:8080/api/file/view/${fileId}?token=${getToken()}`;
}

/**
 * 删除文件
 * @param fileId 文件记录ID
 */
export async function deleteFileApi(
  fileId: number,
): Promise<FileApi.DeleteResponse> {
  return fileUploadRequestClient.delete<FileApi.DeleteResponse>(
    `/api/file/${fileId}`,
    {
      params: {
        token: getToken(),
      },
    },
  );
}

/**
 * 批量删除文件（按业务）
 * @param bizType 业务类型
 * @param bizId 业务ID
 */
export async function deleteFilesByBizApi(
  bizType: string,
  bizId: number,
): Promise<FileApi.DeleteResponse> {
  return fileUploadRequestClient.delete<FileApi.DeleteResponse>(
    '/api/file/byBiz',
    {
      params: {
        token: getToken(),
        bizType,
        bizId,
      },
    },
  );
}

/**
 * 业务类型映射表
 */
export const BizTypeMap = {
  case: 'case',
  process: 'process',
  notice: 'notice',
} as const;

export type BizType = keyof typeof BizTypeMap;
