import { createRequestClient } from '#/api/request';

// 文书服务管理专用客户端，使用指定的基础URL
const documentRequestClient = createRequestClient('http://192.168.0.120:8080', {
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
  /** 文书信息 */
  export interface Document {
    SEP_ID: string;
    caseId: string;
    caseName: string;
    documentName: string;
    documentType: string;
    recipient: string;
    recipientType: string;
    recipientPhone: string;
    recipientAddress: string;
    serviceMethod: string;
    serviceDate: string;
    deliverer: string;
    delivererPhone: string;
    status: string;
    serviceContent: string;
    sendStatus: string;
    createTime: string;
    updateTime: string;
  }

  /** 文书附件信息 */
  export interface DocumentAttachment {
    SEP_ID: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadTime: string;
  }

  /** 送达记录信息 */
  export interface ServiceRecord {
    SEP_ID: string;
    serviceMethod: string;
    serviceDate: string;
    serviceResult: string;
    serviceContent: string;
    operator: string;
    remark: string;
  }

  /** 文书列表响应 */
  export interface DocumentListResponse {
    data: {
      count: number;
      records: Document[];
    };
    status: string;
    error: string;
  }

  /** 文书详情响应 */
  export interface DocumentDetailResponse {
    data: Document & {
      attachments?: DocumentAttachment[];
    };
    status: string;
    error: string;
  }

  /** 文书创建响应 */
  export interface DocumentCreateResponse {
    data: {
      createTime: null | string;
      SEP_ID: string;
    };
    status: string;
    error: string;
  }

  /** 创建/更新文书请求体 */
  export interface DocumentRequest {
    caseId: string;
    caseName: string;
    documentName: string;
    documentType: string;
    recipient: string;
    recipientType: string;
    recipientPhone: string;
    recipientAddress: string;
    serviceMethod: string;
    serviceContent: string;
    sendStatus: string;
    status: string;
    createBy: string;
    updateBy: string;
    deliverer: string;
    delivererPhone: string;
  }

  /** 更新文书状态请求体 */
  export interface UpdateDocumentStatusRequest {
    status: string;
    remark?: string;
  }

  /** 送达记录列表响应 */
  export interface ServiceRecordListResponse {
    data: {
      count: number;
      records: ServiceRecord[];
    };
    status: string;
    error: string;
  }

  /** 添加送达记录请求体 */
  export interface AddServiceRecordRequest {
    serviceMethod: string;
    serviceResult: string;
    serviceContent: string;
    operator: string;
    remark?: string;
  }

  /** 送达统计数据响应 */
  export interface ServiceStatisticsResponse {
    data: {
      failedCount: number;
      methodDistribution: Record<string, number>;
      pendingCount: number;
      successCount: number;
      totalCount: number;
    };
    status: string;
    error: string;
  }
}

/**
 * 创建文书
 */
export async function createDocumentApi(
  data: DocumentServiceApi.DocumentRequest,
) {
  return documentRequestClient.post<DocumentServiceApi.DocumentCreateResponse>(
    '/api/document/create',
    data,
  );
}

/**
 * 获取文书列表
 */
export async function getDocumentListApi(params?: {
  caseId?: string;
  documentName?: string;
  page?: number;
  senderType?: string;
  sendStatus?: string;
  size?: number;
  status?: string;
}) {
  return documentRequestClient.get<DocumentServiceApi.DocumentListResponse>(
    '/api/document/list',
    { params },
  );
}

/**
 * 获取文书详情
 */
export async function getDocumentDetailApi(SEP_ID: string) {
  return documentRequestClient.get<DocumentServiceApi.DocumentDetailResponse>(
    `/api/document/${SEP_ID}`,
  );
}

/**
 * 更新文书状态
 */
export async function updateDocumentStatusApi(
  SEP_ID: string,
  data: DocumentServiceApi.UpdateDocumentStatusRequest,
) {
  return documentRequestClient.put<DocumentServiceApi.DocumentDetailResponse>(
    `/api/document/${SEP_ID}/status`,
    data,
  );
}

/**
 * 上传文书附件
 */
export async function uploadDocumentAttachmentApi(
  documentId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentId', documentId);

  return documentRequestClient.post<DocumentServiceApi.DocumentAttachment>(
    '/api/document/attachment/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 下载文书附件
 */
export async function downloadDocumentAttachmentApi(SEP_ID: string) {
  return documentRequestClient.get<Blob>(
    `/api/document/attachment/download/${SEP_ID}`,
    {
      responseType: 'blob',
    },
  );
}

/**
 * 删除文书附件
 */
export async function deleteDocumentAttachmentApi(SEP_ID: string) {
  return documentRequestClient.delete<{ error: string; status: string }>(
    `/api/document/attachment/${SEP_ID}`,
  );
}

/**
 * 获取送达记录列表
 */
export async function getServiceRecordListApi(
  documentId: string,
  params?: {
    page?: number;
    size?: number;
  },
) {
  return documentRequestClient.get<DocumentServiceApi.ServiceRecordListResponse>(
    `/api/document/${documentId}/records`,
    { params },
  );
}

/**
 * 添加送达记录
 */
export async function addServiceRecordApi(
  documentId: string,
  data: DocumentServiceApi.AddServiceRecordRequest,
) {
  return documentRequestClient.post<{ error: string; status: string }>(
    `/api/document/${documentId}/record/add`,
    data,
  );
}

/**
 * 获取送达统计数据
 */
export async function getServiceStatisticsApi(params?: {
  caseId?: string;
  endTime?: string;
  startTime?: string;
}) {
  return documentRequestClient.get<DocumentServiceApi.ServiceStatisticsResponse>(
    '/api/document/statistics',
    { params },
  );
}
