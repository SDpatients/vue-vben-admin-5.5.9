import { fileUploadRequestClient, requestClient8085 } from '#/api/request';

export namespace ArchiveApi {
  /** 归档分类 */
  export interface Category {
    id: number;
    categoryCode: string;
    categoryName: string;
    parentId: number | null;
    level: number;
    sortOrder: number;
    isRequired: boolean;
    status: string;
    description: string;
    children?: Category[];
  }

  /** 文件信息 */
  export interface FileInfo {
    id: number;
    originalFileName: string;
    fileSize: number;
    fileExtension: string;
    mimeType: string;
  }

  /** 归档记录 */
  export interface ArchiveRecord {
    id: number;
    caseId: number;
    categoryCode: string;
    categoryName: string;
    fileId: number;
    archiveNo: string;
    fileTitle: string;
    fileDescription: string;
    uploadUserId: number;
    uploadUserName: string;
    uploadTime: string;
    status: string;
    isConfidential: boolean;
    accessLevel: string;
    version: number;
    parentVersionId: number | null;
    file: FileInfo;
  }

  /** 归档记录列表响应 */
  export interface ArchiveListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      pageNum: number;
      pageSize: number;
      list: ArchiveRecord[];
    };
  }

  /** 归档记录详情响应 */
  export interface ArchiveDetailResponse {
    code: number;
    message: string;
    data: ArchiveRecord;
  }

  /** 上传归档文件请求 */
  export interface UploadArchiveRequest {
    file: File;
    categoryCode: string;
    fileTitle?: string;
    fileDescription?: string;
    isConfidential?: boolean;
    accessLevel?: string;
  }

  /** 上传归档文件响应 */
  export interface UploadArchiveResponse {
    code: number;
    message: string;
    data: ArchiveRecord;
  }

  /** 更新归档记录请求 */
  export interface UpdateArchiveRequest {
    fileTitle?: string;
    fileDescription?: string;
    isConfidential?: boolean;
    accessLevel?: string;
  }

  /** 更新归档记录响应 */
  export interface UpdateArchiveResponse {
    code: number;
    message: string;
    data: ArchiveRecord;
  }

  /** 删除归档记录响应 */
  export interface DeleteArchiveResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 归档统计响应 */
  export interface StatisticsResponse {
    code: number;
    message: string;
    data: number;
  }

  /** 访问级别枚举 */
  export type AccessLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'TOP_SECRET';

  /** 记录状态枚举 */
  export type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

  /** 归档文件列表查询参数 */
  export interface ArchiveListQueryParams {
    categoryCode?: string;
    pageNum?: number;
    pageSize?: number;
    status?: string;
    keyword?: string;
  }
}

/**
 * 获取归档分类树
 * GET /api/v1/archive/categories
 */
export async function getCategoryTreeApi(status: string = 'ACTIVE') {
  return requestClient8085.get<{
    code: number;
    message: string;
    data: ArchiveApi.Category[];
  }>('/archive/categories', {
    params: { status },
  });
}

/**
 * 上传归档文件
 * POST /api/v1/archive/{caseId}/upload
 */
export async function uploadArchiveFileApi(
  caseId: number,
  data: ArchiveApi.UploadArchiveRequest,
) {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('categoryCode', data.categoryCode);
  
  if (data.fileTitle) {
    formData.append('fileTitle', data.fileTitle);
  }
  if (data.fileDescription) {
    formData.append('fileDescription', data.fileDescription);
  }
  if (data.isConfidential !== undefined) {
    formData.append('isConfidential', String(data.isConfidential));
  }
  if (data.accessLevel) {
    formData.append('accessLevel', data.accessLevel);
  }

  return requestClient8085.post<ArchiveApi.UploadArchiveResponse>(
    `/archive/${caseId}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 获取归档文件列表
 * GET /api/v1/archive/{caseId}/files
 */
export async function getArchiveFilesApi(
  caseId: number,
  params: ArchiveApi.ArchiveListQueryParams = {},
) {
  return requestClient8085.get<ArchiveApi.ArchiveListResponse>(
    `/archive/${caseId}/files`,
    { params },
  );
}

/**
 * 获取归档记录详情
 * GET /api/v1/archive/record/{recordId}
 */
export async function getArchiveRecordApi(recordId: number) {
  return requestClient8085.get<ArchiveApi.ArchiveDetailResponse>(
    `/archive/record/${recordId}`,
  );
}

/**
 * 更新归档记录
 * PUT /api/v1/archive/record/{recordId}
 */
export async function updateArchiveRecordApi(
  recordId: number,
  data: ArchiveApi.UpdateArchiveRequest,
) {
  return requestClient8085.put<ArchiveApi.UpdateArchiveResponse>(
    `/archive/record/${recordId}`,
    data,
  );
}

/**
 * 删除归档文件
 * DELETE /api/v1/archive/record/{recordId}
 */
export async function deleteArchiveRecordApi(recordId: number) {
  return requestClient8085.delete<ArchiveApi.DeleteArchiveResponse>(
    `/archive/record/${recordId}`,
  );
}

/**
 * 批量删除归档文件
 * DELETE /api/v1/archive/records/batch
 */
export async function batchDeleteArchiveRecordsApi(recordIds: number[]) {
  return requestClient8085.delete<ArchiveApi.DeleteArchiveResponse>(
    '/archive/records/batch',
    {
      data: recordIds,
    },
  );
}

/**
 * 获取归档文件统计
 * GET /api/v1/archive/{caseId}/statistics
 */
export async function getArchiveStatisticsApi(
  caseId: number,
  categoryCode?: string,
  status: string = 'ACTIVE',
) {
  return requestClient8085.get<ArchiveApi.StatisticsResponse>(
    `/archive/${caseId}/statistics`,
    {
      params: {
        categoryCode,
        status,
      },
    },
  );
}

/**
 * 下载归档文件
 * GET /api/v1/archive/file/{fileId}/download
 */
export async function downloadArchiveFileApi(fileId: number): Promise<Blob> {
  return requestClient8085.get<Blob>(`/archive/file/${fileId}/download`, {
    responseType: 'blob',
  });
}

/**
 * 预览归档文件
 * GET /api/v1/archive/file/{fileId}/preview
 */
export async function previewArchiveFileApi(fileId: number): Promise<Blob> {
  return requestClient8085.get<Blob>(`/archive/file/${fileId}/preview`, {
    responseType: 'blob',
  });
}

/**
 * 获取归档文件预览URL
 */
export function getArchivePreviewUrl(fileId: number): string {
  return `/api/v1/archive/file/${fileId}/preview`;
}

/**
 * 获取归档文件下载URL
 */
export function getArchiveDownloadUrl(fileId: number): string {
  return `/api/v1/archive/file/${fileId}/download`;
}

/**
 * 访问级别映射表
 */
export const AccessLevelMap = {
  PUBLIC: '公开',
  INTERNAL: '内部',
  CONFIDENTIAL: '机密',
  TOP_SECRET: '绝密',
} as const;

/**
 * 记录状态映射表
 */
export const RecordStatusMap = {
  ACTIVE: '激活',
  INACTIVE: '停用',
  DELETED: '删除',
} as const;

/**
 * 支持的文件格式
 */
export const SupportedFileFormats = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'txt',
];

/**
 * 文件大小限制（MB）
 */
export const MaxFileSizeMB = 50;

/**
 * 文件大小限制（字节）
 */
export const MaxFileSizeBytes = MaxFileSizeMB * 1024 * 1024;

/**
 * 验证文件格式
 */
export function validateFileFormat(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? SupportedFileFormats.includes(extension) : false;
}

/**
 * 验证文件大小
 */
export function validateFileSize(fileSize: number): boolean {
  return fileSize <= MaxFileSizeBytes;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
