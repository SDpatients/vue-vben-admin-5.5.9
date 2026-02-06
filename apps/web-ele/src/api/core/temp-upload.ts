import { fileUploadRequestClient } from '#/api/request';

export interface TempUploadToken {
  id: number;
  token: string;
  bizType: string;
  userId: number;
  expireTime: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  fileCount: number;
  description: string;
  createTime: string;
  qrCodeContent: string;
}

export interface TempUploadFile {
  id: number;
  originalFileName: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  description: string;
  uploadTime: string;
  token: string;
}

export interface CreateTokenParams {
  bizType: string;
  description?: string;
  expireMinutes?: number;
}

export interface TransferParams {
  token: string;
  bizType: string;
  bizId: string;
}

/**
 * 创建临时上传Token
 */
export const createTempUploadToken = (params: CreateTokenParams) => {
  return fileUploadRequestClient.post<{ code: number; message: string; data: TempUploadToken }>(
    '/api/v1/temp-upload/token',
    params,
  );
};

/**
 * 获取Token信息
 */
export const getTempUploadToken = (token: string) => {
  return fileUploadRequestClient.get<{ code: number; message: string; data: TempUploadToken }>(
    `/api/v1/temp-upload/token/${token}`,
  );
};

/**
 * 验证Token是否有效
 */
export const validateTempUploadToken = (token: string) => {
  return fileUploadRequestClient.get<{ code: number; message: string; data: boolean }>(
    `/api/v1/temp-upload/token/${token}/validate`,
  );
};

/**
 * 获取Token下的文件列表
 */
export const getTempUploadFiles = (token: string) => {
  return fileUploadRequestClient.get<{ code: number; message: string; data: TempUploadFile[] }>(
    `/api/v1/temp-upload/token/${token}/files`,
  );
};

/**
 * 手机端上传文件（通过Token）
 */
export const mobileUploadFile = (token: string, file: File, description?: string) => {
  const formData = new FormData();
  formData.append('token', token);
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }
  return fileUploadRequestClient.post<{ code: number; message: string; data: TempUploadFile }>(
    '/api/v1/temp-upload/mobile/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

/**
 * 手机端批量上传文件（通过Token）
 */
export const mobileUploadBatch = (
  token: string,
  files: File[],
  descriptions?: string[],
) => {
  const formData = new FormData();
  formData.append('token', token);
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (descriptions) {
    descriptions.forEach((desc) => {
      formData.append('descriptions', desc);
    });
  }
  return fileUploadRequestClient.post<{ code: number; message: string; data: TempUploadFile[] }>(
    '/api/v1/temp-upload/mobile/upload-batch',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

/**
 * 转移临时文件到业务
 */
export const transferTempFiles = (params: TransferParams) => {
  return fileUploadRequestClient.post<{ code: number; message: string; data: TempUploadFile[] }>(
    '/api/v1/temp-upload/transfer',
    params,
  );
};

/**
 * 取消Token
 */
export const cancelTempUploadToken = (token: string) => {
  return fileUploadRequestClient.delete<{ code: number; message: string; data: null }>(
    `/api/v1/temp-upload/token/${token}`,
  );
};
