import { useAppConfig } from '@vben/hooks';

import { createRequestClient } from '#/api/request';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

// 文书服务管理专用客户端，使用默认配置
const documentRequestClient = createRequestClient(apiURL, {
  responseReturn: 'body',
});

// 为文书服务API客户端添加JWT请求拦截器
documentRequestClient.addRequestInterceptor({
  fulfilled: (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

export namespace DocumentServiceApi {
  /** 文书送达信息 */
  export interface Document {
    id: number;
    caseId: number;
    caseNumber: string;
    caseName: string;
    documentName: string;
    documentType: string;
    recipientName: string;
    recipientType: string;
    contactPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    sendStatus: string;
    deliveryContent: string;
    documentAttachment: string;
    sendTime: null | string;
    deliveryTime: null | string;
    failureReason: null | string;
    remark: null | string;
    status: string;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
    documentNumber: string;
    abbreviation: string;
  }

  /** 文书列表响应 */
  export interface DocumentListResponse {
    code: number;
    message: string;
    data: {
      list: Document[];
      total: number;
    };
  }

  /** 文书详情响应 */
  export interface DocumentDetailResponse {
    code: number;
    message: string;
    data: Document;
  }

  /** 文书创建响应 */
  export interface DocumentCreateResponse {
    code: number;
    message: string;
    data: {
      deliveryId: number;
    };
  }

  /** 创建/更新文书请求体 */
  export interface DocumentRequest {
    caseId: number;
    documentName: string;
    documentType?: string;
    recipientName: string;
    recipientType?: string;
    contactPhone?: string;
    deliveryAddress?: string;
    deliveryMethod?: string;
    deliveryContent?: string;
    documentAttachment?: string;
  }

  /** 更新文书请求体 */
  export interface UpdateDocumentRequest {
    caseId?: number;
    caseNumber?: string;
    caseName?: string;
    documentName?: string;
    documentType?: string;
    recipientName?: string;
    recipientType?: string;
    contactPhone?: string;
    deliveryAddress?: string;
    deliveryMethod?: string;
    sendStatus?: string;
    deliveryContent?: string;
    documentAttachment?: string;
    failureReason?: string;
  }

  /** 附件信息 */
  export interface Attachment {
    id: number;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    fileExtension: string;
    mimeType: string;
    uploadTime: string;
    uploadUserId: number;
    status: string;
  }

  /** 附件列表响应 */
  export interface AttachmentListResponse {
    code: number;
    message: string;
    data: Attachment[];
  }

  /** 创建文书送达（含文件）响应 */
  export interface DocumentCreateWithFilesResponse {
    code: number;
    message: string;
    data: {
      deliveryId: number;
      files: {
        fileExtension: string;
        fileId: number;
        fileSize: number;
        mimeType: string;
        originalFileName: string;
        storedFileName: string;
      }[];
    };
  }

  /** 文书送达审批请求体 */
  export interface DocumentDeliveryApprovalRequest {
    caseId: number;
    documentName: string;
    documentType?: string;
    recipientName: string;
    recipientType?: string;
    contactPhone?: string;
    deliveryAddress?: string;
    deliveryMethod?: string;
    deliveryContent?: string;
    approvalTitle: string;
    approvalContent?: string;
    remark?: string;
  }
}

/**
 * 创建文书送达
 */
export async function createDocumentApi(
  data: DocumentServiceApi.DocumentRequest,
) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateResponse>(
    '/api/v1/document-delivery',
    data,
  );
}

/**
 * 创建文书送达（含文件上传）
 * 使用 FormData 方式提交，支持同时上传多个文件
 */
export async function createDocumentWithFilesApi(formData: FormData) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateWithFilesResponse>(
    '/api/v1/document-delivery/with-files',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60_000,
    },
  );
}

/**
 * 获取文书送达列表（分页）
 */
export async function getDocumentListApi(params?: {
  caseId?: number;
  caseNumber?: string;
  deliveryMethod?: string;
  documentType?: string;
  pageNum?: number;
  pageSize?: number;
  recipientType?: string;
  sendStatus?: string;
  status?: string;
}) {
  return documentRequestClient.get<DocumentServiceApi.DocumentListResponse>(
    '/api/v1/document-delivery/list',
    { params },
  );
}

/**
 * 获取文书送达详情（含案件信息）
 */
export async function getDocumentDetailApi(deliveryId: number) {
  return documentRequestClient.get<DocumentServiceApi.DocumentDetailResponse>(
    `/api/v1/document-delivery/${deliveryId}/detail`,
  );
}

/**
 * 更新文书送达信息
 */
export async function updateDocumentApi(
  deliveryId: number,
  data: DocumentServiceApi.UpdateDocumentRequest,
) {
  return documentRequestClient.put<DocumentServiceApi.DocumentDetailResponse>(
    `/api/v1/document-delivery/${deliveryId}`,
    data,
  );
}

/**
 * 更新文书送达信息（带文件上传）
 * 更新文书信息并新增文件
 */
export async function updateDocumentWithFilesApi(
  deliveryId: number,
  formData: FormData,
) {
  return documentRequestClient.put<DocumentServiceApi.DocumentDetailResponse>(
    `/api/v1/document-delivery/${deliveryId}/with-files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60_000,
    },
  );
}

/**
 * 删除文书送达记录
 */
export async function deleteDocumentApi(deliveryId: number) {
  return documentRequestClient.delete<{
    code: number;
    data: null;
    message: string;
  }>(`/api/v1/document-delivery/${deliveryId}`);
}

/**
 * 删除文书送达附件
 * 删除指定的文书附件
 */
export async function deleteDocumentAttachmentApi(
  deliveryId: number,
  fileId: number,
) {
  return documentRequestClient.delete<{
    code: number;
    data: null;
    message: string;
  }>(`/api/v1/document-delivery/${deliveryId}/attachments/${fileId}`);
}

/**
 * 获取所有文书送达分页列表（支持模糊查询）
 */
export async function getAllDocumentListApi(params?: {
  caseNumber?: string;
  documentType?: string;
  pageNum?: number;
  pageSize?: number;
  status?: string;
}) {
  return documentRequestClient.get<DocumentServiceApi.DocumentListResponse>(
    '/api/v1/document-delivery/all',
    { params },
  );
}

/**
 * 更新文书送达状态和备注
 */
export async function updateDocumentStatusRemarkApi(
  deliveryId: number,
  data: {
    remark?: string;
    status?: string;
  },
) {
  return documentRequestClient.put<{
    code: number;
    data: null;
    message: string;
  }>(`/api/v1/document-delivery/${deliveryId}/status-remark`, undefined, {
    params: data,
  });
}

/**
 * 更新文书送达发送状态
 */
export async function updateDocumentSendStatusApi(
  deliveryId: number,
  sendStatus: string,
) {
  return documentRequestClient.put<{
    code: number;
    data: null;
    message: string;
  }>(`/api/v1/document-delivery/${deliveryId}/send-status`, undefined, {
    params: { sendStatus },
  });
}

/**
 * 获取文书送达附件列表
 */
export async function getDocumentAttachmentsApi(deliveryId: number) {
  return documentRequestClient.get<DocumentServiceApi.AttachmentListResponse>(
    `/api/v1/document-delivery/${deliveryId}/attachments`,
  );
}

/**
 * 文书上传（直接上传，无需审批）
 * 状态自动设置为 APPROVED，不需要管理员审批
 */
export async function directUploadDocumentApi(
  data: DocumentServiceApi.DocumentRequest,
) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateResponse>(
    '/api/v1/document-delivery/direct-upload',
    data,
  );
}

/**
 * 文书审批提交（需要审批流程）
 * 提交文书审批申请，状态设置为 PENDING，同时创建审批记录
 */
export async function submitDocumentForApprovalApi(
  data: DocumentServiceApi.DocumentDeliveryApprovalRequest,
) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateResponse>(
    '/api/v1/document-delivery/submit-for-approval',
    data,
  );
}

/**
 * 文书上传（直接上传，无需审批，带文件）
 * 一次性完成文件上传和文书上传，无需审批
 */
export async function directUploadDocumentWithFilesApi(formData: FormData) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateWithFilesResponse>(
    '/api/v1/document-delivery/direct-upload-with-files',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60_000,
    },
  );
}

/**
 * 文书审批提交（需要审批流程，带文件）
 * 一次性完成文件上传和文书上传，需要管理员审批
 */
export async function submitDocumentForApprovalWithFilesApi(
  formData: FormData,
) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateWithFilesResponse>(
    '/api/v1/document-delivery/submit-for-approval-with-files',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60_000,
    },
  );
}

/**
 * 获取最新文书编号缩写
 * 用于前端自动填充缩写字段
 */
export async function getLatestAbbreviationApi() {
  return documentRequestClient.get<{ code: number; message: string; data: string }>(
    '/api/v1/document-delivery/latest-abbreviation',
  );
}
