import { createRequestClient } from '#/api/request';

const announcementRequestClient = createRequestClient('http://localhost:8080', {
  responseReturn: 'body',
});

announcementRequestClient.addRequestInterceptor({
  fulfilled: async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

export namespace CaseAnnouncementApi {
  /** 公告类型枚举 */
  export type AnnouncementType = 'ANNOUNCEMENT' | 'NOTICE' | 'WARNING';

  /** 公告状态枚举 */
  export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED';

  /** 公告信息 */
  export interface Announcement {
    id: number;
    caseId: number;
    caseNumber: string;
    principalOfficer: string;
    title: string;
    content: string;
    announcementType: AnnouncementType;
    status: AnnouncementStatus;
    publisherId: number;
    publisherName: string;
    publishTime: string;
    viewCount: number;
    isTop: boolean;
    topExpireTime: string;
    attachments: any[];
    createTime: string;
    updateTime: string;
  }

  /** 公告列表响应 */
  export interface AnnouncementListResponse {
    code: number;
    message: string;
    data: {
      list: Announcement[];
      total: number;
    };
  }

  /** 公告详情响应 */
  export interface AnnouncementDetailResponse {
    code: number;
    message: string;
    data: Announcement;
  }

  /** 创建公告请求 */
  export interface CreateAnnouncementRequest {
    caseId: number;
    caseNumber: string;
    principalOfficer: string;
    title: string;
    content: string;
    announcementType: AnnouncementType;
    attachments?: string;
  }

  /** 创建公告响应 */
  export interface CreateAnnouncementResponse {
    code: number;
    message: string;
    data: {
      announcementId: number;
    };
  }

  /** 更新公告请求 */
  export interface UpdateAnnouncementRequest {
    caseNumber?: string;
    principalOfficer?: string;
    title?: string;
    content?: string;
    announcementType?: AnnouncementType;
    attachments?: string;
  }

  /** 更新公告响应 */
  export interface UpdateAnnouncementResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 发布公告请求 */
  export interface PublishAnnouncementRequest {
    topExpireTime?: string;
  }

  /** 发布公告响应 */
  export interface PublishAnnouncementResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 置顶公告请求 */
  export interface TopAnnouncementRequest {
    topExpireTime: string;
  }

  /** 置顶公告响应 */
  export interface TopAnnouncementResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除公告响应 */
  export interface DeleteAnnouncementResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 公告查看记录信息 */
  export interface AnnouncementViewRecord {
    id: number;
    announcementId: number;
    announcementTitle: string;
    caseId: number;
    caseName: string;
    viewerId: number;
    viewerName: string;
    viewerType: string;
    viewTime: string;
    ipAddress: string;
    userAgent: string;
    viewDuration: number;
    deviceType: string;
    browserType: string;
    osType: string;
    location: string;
    createTime: string;
    updateTime: string;
  }

  /** 创建查看记录请求 */
  export interface CreateViewRecordRequest {
    announcementId: number;
    announcementTitle?: string;
    caseId?: number;
    caseName?: string;
    viewerId?: number;
    viewerName?: string;
    viewerType?: string;
    ipAddress?: string;
    userAgent?: string;
    viewDuration?: number;
    deviceType?: string;
    browserType?: string;
    osType?: string;
    location?: string;
  }

  /** 创建查看记录响应 */
  export interface CreateViewRecordResponse {
    code: number;
    message: string;
    data: AnnouncementViewRecord;
  }

  /** 查看记录列表响应 */
  export interface ViewRecordListResponse {
    code: number;
    message: string;
    data: AnnouncementViewRecord[];
  }

  /** 查看次数响应 */
  export interface ViewCountResponse {
    code: number;
    message: string;
    data: number;
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 创建案件公告
 * POST /api/v1/case-announcement
 */
export async function createAnnouncementApi(
  data: CaseAnnouncementApi.CreateAnnouncementRequest,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.CreateAnnouncementResponse>(
    '/api/v1/case-announcement',
    data,
  );
}

/**
 * 获取案件公告列表
 * GET /api/v1/case-announcement/list
 */
export async function getAnnouncementListApi(
  params: {
    caseId?: number;
    pageNum?: number;
    pageSize?: number;
    status?: string;
  } = {},
) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementListResponse>(
    '/api/v1/case-announcement/list',
    { params },
  );
}

/**
 * 获取公告详情
 * GET /api/v1/case-announcement/{announcementId}
 */
export async function getAnnouncementDetailApi(announcementId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementDetailResponse>(
    `/api/v1/case-announcement/${announcementId}`,
  );
}

/**
 * 更新案件公告
 * PUT /api/v1/case-announcement/{announcementId}
 */
export async function updateAnnouncementApi(
  announcementId: number,
  data: CaseAnnouncementApi.UpdateAnnouncementRequest,
) {
  return announcementRequestClient.put<CaseAnnouncementApi.UpdateAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}`,
    data,
  );
}

/**
 * 发布公告
 * POST /api/v1/case-announcement/{announcementId}/publish
 */
export async function publishAnnouncementApi(
  announcementId: number,
  data: CaseAnnouncementApi.PublishAnnouncementRequest = {},
) {
  return announcementRequestClient.post<CaseAnnouncementApi.PublishAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}/publish`,
    data,
  );
}

/**
 * 置顶公告
 * POST /api/v1/case-announcement/{announcementId}/top
 */
export async function topAnnouncementApi(
  announcementId: number,
  data: CaseAnnouncementApi.TopAnnouncementRequest,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.TopAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}/top`,
    data,
  );
}

/**
 * 取消置顶公告
 * DELETE /api/v1/case-announcement/{announcementId}/top
 */
export async function unTopAnnouncementApi(
  announcementId: number,
) {
  return announcementRequestClient.delete<CaseAnnouncementApi.TopAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}/top`,
  );
}

/**
 * 删除案件公告
 * DELETE /api/v1/case-announcement/{announcementId}
 */
export async function deleteAnnouncementApi(announcementId: number) {
  return announcementRequestClient.delete<CaseAnnouncementApi.DeleteAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}`,
  );
}

/**
 * 创建公告查看记录
 * POST /api/v1/announcement-view-record
 */
export async function createViewRecordApi(
  data: CaseAnnouncementApi.CreateViewRecordRequest,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.CreateViewRecordResponse>(
    '/api/v1/announcement-view-record',
    data,
  );
}

/**
 * 获取公告查看记录详情
 * GET /api/v1/announcement-view-record/{recordId}
 */
export async function getViewRecordDetailApi(recordId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.CreateViewRecordResponse>(
    `/api/v1/announcement-view-record/${recordId}`,
  );
}

/**
 * 获取公告查看记录列表
 * GET /api/v1/announcement-view-record/list
 */
export async function getViewRecordListApi(
  params: {
    announcementId?: number;
    caseId?: number;
    page?: number;
    size?: number;
    viewerId?: number;
  } = {},
) {
  return announcementRequestClient.get<CaseAnnouncementApi.ViewRecordListResponse>(
    '/api/v1/announcement-view-record/list',
    { params },
  );
}

/**
 * 获取公告查看次数
 * GET /api/v1/announcement-view-record/count/announcement/{announcementId}
 */
export async function getAnnouncementViewCountApi(announcementId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.ViewCountResponse>(
    `/api/v1/announcement-view-record/count/announcement/${announcementId}`,
  );
}

/**
 * 获取案件公告查看次数
 * GET /api/v1/announcement-view-record/count/case/{caseId}
 */
export async function getCaseViewCountApi(caseId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.ViewCountResponse>(
    `/api/v1/announcement-view-record/count/case/${caseId}`,
  );
}

/**
 * 获取用户查看次数
 * GET /api/v1/announcement-view-record/count/viewer/{viewerId}
 */
export async function getViewerViewCountApi(viewerId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.ViewCountResponse>(
    `/api/v1/announcement-view-record/count/viewer/${viewerId}`,
  );
}

/**
 * 删除公告查看记录
 * DELETE /api/v1/announcement-view-record/{recordId}
 */
export async function deleteViewRecordApi(recordId: number) {
  return announcementRequestClient.delete<CaseAnnouncementApi.CommonResponse>(
    `/api/v1/announcement-view-record/${recordId}`,
  );
}

/**
 * 获取公告浏览记录列表
 * GET /api/v1/announcement-view-record/list
 */
export async function getAnnouncementViewsApi(
  announcementId: number,
  page: number = 1,
  size: number = 10,
) {
  return announcementRequestClient.get<CaseAnnouncementApi.ViewRecordListResponse>(
    '/api/v1/announcement-view-record/list',
    {
      params: { announcementId, page, size },
    },
  );
}

export type { CaseAnnouncementApi };
