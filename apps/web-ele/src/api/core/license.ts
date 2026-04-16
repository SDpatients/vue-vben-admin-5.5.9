import { baseRequestClient, fileUploadRequestClient } from '#/api/request';

export namespace LicenseApi {
  export interface LicenseInfo {
    licenseId: string;
    customerName: string;
    modules: string[];
    maxUsers: number;
    expireDate: string;
    createTime?: string;
  }

  export interface LicenseStatus {
    valid: boolean;
    expired: boolean;
    remainingDays: number;
    licenseInfo: LicenseInfo | null;
    machineCode?: string;
    errorMessage?: string;
    enabled?: boolean;
    strictMode?: boolean;
  }

  export interface LicenseStatusResult {
    code: number;
    message: string;
    data: LicenseStatus;
  }

  export interface MachineCodeData {
    machineCode: string;
  }

  export interface MachineCodeResult {
    code: number;
    message: string;
    data: MachineCodeData;
  }

  export interface UploadSuccessData {
    valid: boolean;
    message: string;
    licenseInfo: LicenseInfo;
  }

  export interface UploadResult {
    code: number;
    message: string;
    data: UploadSuccessData;
  }
}

// 使用 baseRequestClient，不经过认证拦截器，允许未登录访问
export async function getLicenseStatusApi() {
  return baseRequestClient.get<LicenseApi.LicenseStatusResult>('/api/v1/system/license/status');
}

// 使用 baseRequestClient，不经过认证拦截器，允许未登录访问
export async function getMachineCodeApi() {
  return baseRequestClient.get<LicenseApi.MachineCodeResult>('/api/v1/system/license/machine-code');
}

// 文件上传使用 fileUploadRequestClient
export async function uploadLicenseApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return fileUploadRequestClient.post<LicenseApi.UploadResult>(
    '/api/v1/system/license/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
