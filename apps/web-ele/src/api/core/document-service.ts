import { createRequestClient } from '#/api/request';
import { useAppConfig } from '@vben/hooks';

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
    sendTime: string | null;
    deliveryTime: string | null;
    failureReason: string | null;
    remark: string | null;
    status: string;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
  }

  /** 文书列表响应 */
  export interface DocumentListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: Document[];
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
        fileId: number;
        originalFileName: string;
        storedFileName: string;
        fileSize: number;
        fileExtension: string;
        mimeType: string;
      }[];
    };
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
      timeout: 60000,
    },
  );
}

/**
 * 获取文书送达列表（分页）
 */
export async function getDocumentListApi(params?: {
  pageNum?: number;
  pageSize?: number;
  caseId?: number;
  caseNumber?: string;
  documentType?: string;
  recipientType?: string;
  deliveryMethod?: string;
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
 * 删除文书送达记录
 */
export async function deleteDocumentApi(deliveryId: number) {
  return documentRequestClient.delete<{ code: number; message: string; data: null }>(
    `/api/v1/document-delivery/${deliveryId}`,
  );
}

/**
 * 获取所有文书送达分页列表（支持模糊查询）
 */
export async function getAllDocumentListApi(params?: {
  pageNum?: number;
  pageSize?: number;
  documentType?: string;
  status?: string;
  caseNumber?: string;
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
    status?: string;
    remark?: string;
  },
) {
  return documentRequestClient.put<{ code: number; message: string; data: null }>(
    `/api/v1/document-delivery/${deliveryId}/status-remark`,
    undefined,
    { params: data },
  );
}

/**
 * 更新文书送达发送状态
 */
export async function updateDocumentSendStatusApi(
  deliveryId: number,
  sendStatus: string,
) {
  return documentRequestClient.put<{ code: number; message: string; data: null }>(
    `/api/v1/document-delivery/${deliveryId}/send-status`,
    undefined,
    { params: { sendStatus } },
  );
}

/**
 * 获取文书送达附件列表
 */
export async function getDocumentAttachmentsApi(
  deliveryId: number,
) {
  return documentRequestClient.get<DocumentServiceApi.AttachmentListResponse>(
    `/api/v1/document-delivery/${deliveryId}/attachments`,
  );
}
