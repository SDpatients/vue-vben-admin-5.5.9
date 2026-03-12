import { fileUploadRequestClient, requestClient } from '#/api/request';

export namespace DocumentLibraryApi {
  export interface Folder {
    id: number;
    folderName: string;
    folderPath: string;
    parentId: number | null;
    folderLevel: number;
    sortOrder: number;
    description: string;
    icon: string;
    color: string;
    isPublic: boolean;
    status: string;
    createTime: string;
    updateTime: string;
    createUserId: number;
    documentCount?: number;
    subFolderCount?: number;
  }

  export interface FolderTreeNode {
    id: number;
    name: string;
    type: 'folder' | 'root';
    parentId: number | null;
    path: string;
    folderLevel: number;
    sortOrder: number;
    documentCount?: number;
    children?: FolderTreeNode[] | null;
    icon?: string;
    color?: string;
    isPublic?: boolean;
    createTime?: string;
  }

  export interface FolderBreadcrumb {
    id: number;
    name: string;
    type: 'folder' | 'root';
    path: string;
    folderLevel: number;
  }

  export interface CreateFolderRequest {
    folderName: string;
    parentId?: number | null;
    description?: string;
    icon?: string;
    color?: string;
    isPublic?: boolean;
    sortOrder?: number;
  }

  export interface UpdateFolderRequest {
    folderName?: string;
    description?: string;
    icon?: string;
    color?: string;
    isPublic?: boolean;
    sortOrder?: number;
  }

  export interface Document {
    id: number;
    documentName: string;
    documentCode: string;
    folderId: number;
    folderName: string;
    documentType: 'WORD' | 'EXCEL' | 'PDF' | 'OTHER';
    fileName: string;
    fileSize: number;
    fileExtension: string;
    currentVersion: number;
    isPublic: boolean;
    isLocked: boolean;
    lockedBy?: number;
    lockedByName?: string;
    downloadCount: number;
    viewCount: number;
    status: string;
    createTime: string;
    updateTime: string;
    description?: string;
    tags?: string;
    isFavorited: boolean;
  }

  export interface UploadDocumentRequest {
    file: File;
    folderId?: number | null;
    documentName?: string;
    description?: string;
    tags?: string;
    isPublic?: boolean;
  }

  export interface UpdateDocumentRequest {
    documentName?: string;
    description?: string;
    tags?: string;
    isPublic?: boolean;
  }

  export interface DocumentListQueryParams {
    folderId?: number;
    documentType?: string;
    status?: string;
    keyword?: string;
    isPublic?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }

  export interface DocumentListResponse {
    documents: Document[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }

  export interface DocumentVersion {
    id: number;
    documentId: number;
    versionNumber: number;
    versionName: string;
    fileName: string;
    fileSize: number;
    changeSummary: string;
    changeType: string;
    isMajor: boolean;
    createTime: string;
    createUserId: number;
    createUserName?: string;
  }

  export interface VersionListResponse {
    total: number;
    versions: DocumentVersion[];
  }

  export interface UploadVersionRequest {
    documentId: number;
    file: File;
    changeSummary?: string;
    isMajor?: boolean;
  }

  export interface ShareInfo {
    id: number;
    documentId: number;
    documentName: string;
    shareCode: string;
    shareUrl: string;
    sharePassword?: string;
    permissionType: 'READ' | 'DOWNLOAD' | 'EDIT';
    expireTime?: string;
    maxAccessCount: number;
    accessCount: number;
    isEnabled: boolean;
    isExpired: boolean;
    createTime: string;
  }

  export interface CreateShareRequest {
    documentId: number;
    sharePassword?: string;
    permissionType?: 'READ' | 'DOWNLOAD' | 'EDIT';
    expireTime?: string;
    maxAccessCount?: number;
  }

  export interface Permission {
    id: number;
    permissionName: string;
    permissionCode: string;
    permissionType: string;
    description: string;
    sortOrder: number;
  }

  export interface GrantPermissionRequest {
    permissionId: number;
    targetType: 'USER' | 'ROLE' | 'DEPARTMENT';
    targetId: number;
    isInherit?: boolean;
  }

  export interface OperationLog {
    id: number;
    documentId: number;
    documentName: string;
    operationType: string;
    operationDesc: string;
    operateTime: string;
    operatorId: number;
    operatorName: string;
    ipAddress?: string;
  }

  export interface OperationLogListResponse {
    code: number;
    message: string;
    data: {
      list: OperationLog[];
      total: number;
    };
  }

  export interface FavoriteItem {
    id: number;
    documentId: number;
    documentName: string;
    documentType: string;
    folderName: string;
    createTime: string;
    folderName2?: string;
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }

  export interface DashboardStatistics {
    totalDocuments: number;
    totalSize: number;
    weeklyUploads: number;
    totalViews: number;
    typeDistribution: Record<string, number>;
    sizeDistribution: Record<string, number>;
    monthlyTrend: MonthlyTrendItem[];
  }

  export interface MonthlyTrendItem {
    month: string;
    uploads: number;
    views: number;
  }

  export interface OfficePreviewConfig {
    documentType: 'word' | 'cell' | 'slide';
    document: {
      fileType: string;
      key: string;
      title: string;
      url: string;
    };
    editorConfig: {
      mode: 'view' | 'edit';
      lang: string;
      user: {
        id: string;
        name: string;
      };
      callbackUrl?: string;
    };
    token?: string;
  }
}

const BASE_URL = '/api/v1/api/lib';

export async function getFolderTreeApi(): Promise<DocumentLibraryApi.FolderTreeNode> {
  return requestClient.get(`${BASE_URL}/folders/tree`);
}

export async function getFolderRootApi(): Promise<DocumentLibraryApi.Folder> {
  return requestClient.get(`${BASE_URL}/folders/root`);
}

export async function getFolderDetailApi(id: number): Promise<DocumentLibraryApi.Folder> {
  return requestClient.get(`${BASE_URL}/folders/${id}`);
}

export async function getFolderChildrenApi(id: number): Promise<DocumentLibraryApi.Folder[]> {
  return requestClient.get(`${BASE_URL}/folders/${id}/children`);
}

export async function getFolderPathApi(id: number): Promise<DocumentLibraryApi.FolderBreadcrumb[]> {
  return requestClient.get(`${BASE_URL}/folders/${id}/path`);
}

export async function getFolderDescendantsApi(id: number): Promise<number[]> {
  return requestClient.get(`${BASE_URL}/folders/${id}/descendants`);
}

export async function getFoldersByLevelApi(level: number): Promise<DocumentLibraryApi.Folder[]> {
  return requestClient.get(`${BASE_URL}/folders/level/${level}`);
}

export async function updateFolderSortApi(id: number, sortOrder: number): Promise<null> {
  return requestClient.put(`${BASE_URL}/folders/${id}/sort`, null, {
    params: { sortOrder },
  });
}

export async function createFolderApi(data: DocumentLibraryApi.CreateFolderRequest): Promise<DocumentLibraryApi.Folder> {
  return requestClient.post(`${BASE_URL}/folders`, data);
}

export async function updateFolderApi(id: number, data: DocumentLibraryApi.UpdateFolderRequest): Promise<DocumentLibraryApi.Folder> {
  return requestClient.put(`${BASE_URL}/folders/${id}`, data);
}

export async function deleteFolderApi(id: number): Promise<null> {
  return requestClient.delete(`${BASE_URL}/folders/${id}`);
}

export async function moveFolderApi(id: number, targetFolderId: number): Promise<null> {
  return requestClient.post(`${BASE_URL}/folders/${id}/move`, null, {
    params: { targetFolderId },
  });
}

export async function getDocumentListApi(params: DocumentLibraryApi.DocumentListQueryParams): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.post(`${BASE_URL}/documents/list`, params);
}

export async function createDocumentApi(data: any): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.post(`${BASE_URL}/documents`, data);
}

export async function getDocumentDetailApi(id: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.get(`${BASE_URL}/documents/${id}`);
}

export async function getDocumentByCodeApi(code: string): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.get(`${BASE_URL}/documents/code/${code}`);
}

export async function getMyDocumentsApi(page: number = 1, size: number = 10): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.get(`${BASE_URL}/documents/my`, {
    params: { page, size },
  });
}

export async function getFolderDocumentsApi(folderId: number, page: number = 1, size: number = 10): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.get(`${BASE_URL}/documents/folder/${folderId}`, {
    params: { page, size },
  });
}

export async function uploadDocumentApi(data: DocumentLibraryApi.UploadDocumentRequest): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.folderId) {
    formData.append('folderId', data.folderId.toString());
  }
  if (data.documentName) {
    formData.append('documentName', data.documentName);
  }
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.tags) {
    formData.append('tags', data.tags);
  }
  if (data.isPublic !== undefined) {
    formData.append('isPublic', data.isPublic.toString());
  }

  return fileUploadRequestClient.post(`${BASE_URL}/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function updateDocumentApi(id: number, data: DocumentLibraryApi.UpdateDocumentRequest): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.put(`${BASE_URL}/documents/${id}`, data);
}

export async function deleteDocumentApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/documents/${id}`);
}

export async function searchDocumentsApi(keyword: string, page: number = 1, size: number = 10): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.get(`${BASE_URL}/documents/search`, {
    params: { keyword, page, size },
  });
}

export async function downloadDocumentApi(id: number): Promise<Blob> {
  return fileUploadRequestClient.get(`${BASE_URL}/documents/${id}/download`, {
    responseType: 'blob',
  });
}

export async function lockDocumentApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/documents/${id}/lock`);
}

export async function unlockDocumentApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/documents/${id}/unlock`);
}

export async function moveDocumentApi(id: number, targetFolderId: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/documents/${id}/move`, null, {
    params: { targetFolderId },
  });
}

export async function copyDocumentApi(id: number, targetFolderId: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.post(`${BASE_URL}/documents/${id}/copy`, null, {
    params: { targetFolderId },
  });
}

export async function getVersionListApi(documentId: number): Promise<DocumentLibraryApi.VersionListResponse> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/versions`);
}

export async function getVersionLatestApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<any>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/versions/latest`);
}

export async function getVersionCountApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<number>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/versions/count`);
}

export async function getVersionNextNumberApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<number>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/versions/next-number`);
}

export async function getVersionDetailApi(documentId: number, versionNumber: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.DocumentVersion>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/versions/${versionNumber}`);
}

export async function uploadVersionApi(documentId: number, data: DocumentLibraryApi.UploadVersionRequest): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.DocumentVersion>> {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.changeSummary) {
    formData.append('changeSummary', data.changeSummary);
  }
  if (data.isMajor !== undefined) {
    formData.append('isMajor', data.isMajor.toString());
  }

  return fileUploadRequestClient.post(`${BASE_URL}/documents/${documentId}/versions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function restoreVersionApi(documentId: number, versionNumber: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/documents/${documentId}/versions/${versionNumber}/restore`);
}

export async function deleteVersionApi(versionId: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/versions/${versionId}`);
}

export async function createShareApi(data: DocumentLibraryApi.CreateShareRequest): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.ShareInfo>> {
  return requestClient.post(`${BASE_URL}/shares`, data);
}

export async function getShareByCodeApi(shareCode: string): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.ShareInfo>> {
  return requestClient.get(`${BASE_URL}/shares/code/${shareCode}`);
}

export async function getShareDetailApi(id: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.ShareInfo>> {
  return requestClient.get(`${BASE_URL}/shares/${id}`);
}

export async function accessShareApi(shareCode: string, password?: string): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Document>> {
  return requestClient.get(`${BASE_URL}/shares/${shareCode}/access`, {
    params: { password },
  });
}

export async function downloadShareApi(shareCode: string, password?: string): Promise<Blob> {
  return requestClient.get(`${BASE_URL}/shares/${shareCode}/download`, {
    params: { password },
    responseType: 'blob',
  });
}

export async function deleteShareApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/shares/${id}`);
}

export async function disableShareApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/shares/${id}/disable`);
}

export async function enableShareApi(id: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/shares/${id}/enable`);
}

export async function checkShareValidApi(shareCode: string): Promise<DocumentLibraryApi.ApiResponse<boolean>> {
  return requestClient.get(`${BASE_URL}/shares/${shareCode}/valid`);
}

export async function checkSharePasswordApi(shareCode: string, password: string): Promise<DocumentLibraryApi.ApiResponse<boolean>> {
  return requestClient.post(`${BASE_URL}/shares/${shareCode}/check-password`, null, {
    params: { password },
  });
}

export async function addFavoriteApi(documentId: number, folderName?: string): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/favorites/${documentId}`, null, {
    params: { folderName },
  });
}

export async function removeFavoriteApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/favorites/${documentId}`);
}

export async function getFavoritesApi(page: number = 1, size: number = 10): Promise<DocumentLibraryApi.ApiResponse<{ favorites: DocumentLibraryApi.FavoriteItem[]; total: number; page: number; size: number; totalPages: number }>> {
  return requestClient.get(`${BASE_URL}/favorites`, {
    params: { page, size },
  });
}

export async function getFavoriteFoldersApi(): Promise<DocumentLibraryApi.ApiResponse<string[]>> {
  return requestClient.get(`${BASE_URL}/favorites/folders`);
}

export async function getFavoriteFolderApi(folderName: string, page: number = 1, size: number = 10): Promise<DocumentLibraryApi.ApiResponse<{ list: DocumentLibraryApi.FavoriteItem[]; total: number }>> {
  return requestClient.get(`${BASE_URL}/favorites/folder/${folderName}`, {
    params: { page, size },
  });
}

export async function checkFavoriteApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<boolean>> {
  return requestClient.get(`${BASE_URL}/favorites/${documentId}/check`);
}

export async function moveFavoriteApi(documentId: number, folderName: string): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/favorites/${documentId}/move`, null, {
    params: { folderName },
  });
}

export async function getPermissionsApi(): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Permission[]>> {
  return requestClient.get(`${BASE_URL}/permissions`);
}

export async function getPermissionByIdApi(id: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Permission>> {
  return requestClient.get(`${BASE_URL}/permissions/${id}`);
}

export async function getPermissionByCodeApi(code: string): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.Permission>> {
  return requestClient.get(`${BASE_URL}/permissions/code/${code}`);
}

export async function getAccessibleFoldersApi(permissionType: string): Promise<DocumentLibraryApi.ApiResponse<any[]>> {
  return requestClient.get(`${BASE_URL}/permissions/accessible-folders`, {
    params: { permissionType },
  });
}

export async function getAccessibleDocumentsApi(permissionType: string): Promise<DocumentLibraryApi.ApiResponse<any[]>> {
  return requestClient.get(`${BASE_URL}/permissions/accessible-documents`, {
    params: { permissionType },
  });
}

export async function grantFolderPermissionApi(folderId: number, data: DocumentLibraryApi.GrantPermissionRequest): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/folders/${folderId}/permissions`, data);
}

export async function revokeFolderPermissionApi(folderId: number, permissionId: number, targetType: string, targetId: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/folders/${folderId}/permissions/${permissionId}`, {
    params: { targetType, targetId },
  });
}

export async function getFolderPermissionsApi(folderId: number): Promise<DocumentLibraryApi.ApiResponse<any[]>> {
  return requestClient.get(`${BASE_URL}/folders/${folderId}/permissions`);
}

export async function grantDocumentPermissionApi(documentId: number, data: DocumentLibraryApi.GrantPermissionRequest): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.post(`${BASE_URL}/documents/${documentId}/permissions`, data);
}

export async function revokeDocumentPermissionApi(documentId: number, permissionId: number, targetType: string, targetId: number): Promise<DocumentLibraryApi.ApiResponse<null>> {
  return requestClient.delete(`${BASE_URL}/documents/${documentId}/permissions/${permissionId}`, {
    params: { targetType, targetId },
  });
}

export async function getDocumentPermissionsApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<any[]>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/permissions`);
}

export async function getDocumentLogsApi(documentId: number, page: number = 1, size: number = 20): Promise<DocumentLibraryApi.OperationLogListResponse> {
  return requestClient.get(`${BASE_URL}/logs/document/${documentId}`, {
    params: { page, size },
  });
}

export async function getMyLogsApi(page: number = 1, size: number = 20): Promise<DocumentLibraryApi.OperationLogListResponse> {
  return requestClient.get(`${BASE_URL}/logs/my`, {
    params: { page, size },
  });
}

export async function getDashboardStatisticsApi(): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.DashboardStatistics>> {
  return requestClient.get(`${BASE_URL}/statistics/dashboard`);
}

export async function getRecentDocumentsApi(page: number = 1, size: number = 5): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.get(`${BASE_URL}/documents/recent`, {
    params: { page, size },
  });
}

export async function getPopularDocumentsApi(page: number = 1, size: number = 5, timeRange: 'all' | 'week' | 'month' | 'year' = 'all'): Promise<DocumentLibraryApi.DocumentListResponse> {
  return requestClient.get(`${BASE_URL}/documents/popular`, {
    params: { page, size, timeRange },
  });
}

export async function getOfficePreviewConfigApi(documentId: number): Promise<DocumentLibraryApi.ApiResponse<DocumentLibraryApi.OfficePreviewConfig>> {
  return requestClient.get(`${BASE_URL}/documents/${documentId}/office-config`);
}

export async function getDocumentPreviewUrl(documentId: number): string {
  return `${BASE_URL}/documents/${documentId}/preview`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDocumentTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    WORD: 'vscode-icons:file-type-word',
    EXCEL: 'vscode-icons:file-type-excel',
    PDF: 'vscode-icons:file-type-pdf2',
    OTHER: 'vscode-icons:default-file',
  };
  return iconMap[type] || iconMap.OTHER;
}

export function getDocumentTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    WORD: '#2b579a',
    EXCEL: '#217346',
    PDF: '#f40f02',
    OTHER: '#666666',
  };
  return colorMap[type] || colorMap.OTHER;
}
