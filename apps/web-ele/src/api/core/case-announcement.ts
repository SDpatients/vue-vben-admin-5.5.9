import { createRequestClient } from '#/api/request';

<<<<<<< Updated upstream
// 案件公告管理专用客户端，使用指定的基础URL
const announcementRequestClient = createRequestClient('http://localhost:5779', {
=======
const announcementRequestClient = createRequestClient('http://localhost:8081', {
>>>>>>> Stashed changes
  responseReturn: 'body',
});

// 为案件公告客户端添加JWT令牌请求拦截器
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
  /** 公告信息 */
  export interface Announcement {
    id: number;
    caseId: number;
    title: string;
    content: string;
    announcementType: string;
    status: string;
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

  /** 公告列表响应数据 */
  export interface AnnouncementListData {
    total: number;
    list: Announcement[];
  }

  /** 公告列表响应 */
  export interface AnnouncementListResponse {
    code: number;
    message: string;
<<<<<<< Updated upstream
    data: AnnouncementListData;
=======
    data: {
      list: Announcement[];
      total: number;
    };
>>>>>>> Stashed changes
  }

  /** 公告详情响应 */
  export interface AnnouncementDetailResponse {
    code: number;
    message: string;
    data: Announcement;
  }
<<<<<<< Updated upstream
=======

  /** 创建公告请求 */
  export interface CreateAnnouncementRequest {
    caseId: number;
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
>>>>>>> Stashed changes
}

/**
 * 获取案件公告列表
 */
export async function getAnnouncementListApi(
<<<<<<< Updated upstream
  pageNum?: number,
  pageSize?: number,
  caseId?: number,
  status?: string,
) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementListResponse>(
    '/api/v1/case-announcement/list',
    {
      params: {
        pageNum,
        pageSize,
        caseId,
        status,
      },
    },
=======
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
>>>>>>> Stashed changes
  );
}

/**
 * 获取公告详情
 */
<<<<<<< Updated upstream
export async function getAnnouncementDetailApi(
  announcementId: number | string,
) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementDetailResponse>(
    `/api/v1/case-announcement/${announcementId}`,
  );
=======
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
>>>>>>> Stashed changes
}

/**
 * 发布公告
 */
export async function publishAnnouncementApi(
<<<<<<< Updated upstream
  sepId: string,
  data: Omit<CaseAnnouncementApi.CreateAnnouncementRequest, 'sep_id'>,
) {
  const chatUserInfo = localStorage.getItem('chat_user_info');
  let publisherId = '';
  let publisherName = '';

  try {
    if (chatUserInfo) {
      const userInfo = JSON.parse(chatUserInfo);
      publisherId = userInfo.user?.uPid || '';
      publisherName = userInfo.user?.uName || '';
    }
  } catch (error) {
    console.error('解析用户信息失败:', error);
  }

  return announcementRequestClient.post<CaseAnnouncementApi.AnnouncementDetailResponse>(
    '/api/web/publishAnnouncement',
    {
      ...data,
      sep_id: sepId,
      publisher_id: publisherId,
      publisher_name: publisherName,
    },
=======
  announcementId: number,
  data: CaseAnnouncementApi.PublishAnnouncementRequest = {},
) {
  return announcementRequestClient.post<CaseAnnouncementApi.PublishAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}/publish`,
    null,
    { params: data },
>>>>>>> Stashed changes
  );
}

/**
 * 更新公告
 */
<<<<<<< Updated upstream
export async function updateAnnouncementApi(
  announcementId: string,
  data: Omit<CaseAnnouncementApi.UpdateAnnouncementRequest, 'announcement_id'>,
) {
  return announcementRequestClient.put<CaseAnnouncementApi.AnnouncementDetailResponse>(
    '/api/web/updateAnnouncement',
    {
      ...data,
      announcement_id: announcementId,
    },
    {
      params: {
        token: localStorage.getItem('token'),
      },
    },
=======
export async function topAnnouncementApi(
  announcementId: number,
  data: CaseAnnouncementApi.TopAnnouncementRequest,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.TopAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}/top`,
    data,
>>>>>>> Stashed changes
  );
}

/**
 * 删除公告
 */
<<<<<<< Updated upstream
export async function deleteAnnouncementApi(announcementId: string) {
  return announcementRequestClient.delete<{ error: string; status: string }>(
    `/api/web/deleteAnnouncement/${announcementId}`,
    {
      params: {
        token: localStorage.getItem('token'),
      },
    },
=======
export async function deleteAnnouncementApi(announcementId: number) {
  return announcementRequestClient.delete<CaseAnnouncementApi.DeleteAnnouncementResponse>(
    `/api/v1/case-announcement/${announcementId}`,
>>>>>>> Stashed changes
  );
}

/**
 * 撤回公告
 */
<<<<<<< Updated upstream
export async function revokeAnnouncementApi(
  announcementId: string,
  retractReason?: string,
) {
  return announcementRequestClient.put<{ error: string; status: string }>(
    '/api/web/retractAnnouncement',
    {
      announcement_id: announcementId,
      retract_reason: retractReason,
    },
    {
      params: {
        token: localStorage.getItem('token'),
      },
    },
=======
export async function createViewRecordApi(
  data: CaseAnnouncementApi.CreateViewRecordRequest,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.CreateViewRecordResponse>(
    '/api/v1/announcement-view-record',
    data,
>>>>>>> Stashed changes
  );
}

/**
 * 记录公告浏览
 */
<<<<<<< Updated upstream
export async function recordAnnouncementViewApi(
  announcementId: string,
  ajid: string,
  viewerId: string,
  viewerName: string,
) {
  return announcementRequestClient.post<{ error: string; status: string }>(
    '/api/web/recordAnnouncementView',
    {
      announcement_id: announcementId,
      ajid,
      viewer_id: viewerId,
      viewer_name: viewerName,
    },
    {
      params: {
        token: localStorage.getItem('token'),
      },
    },
=======
export async function getViewRecordDetailApi(recordId: number) {
  return announcementRequestClient.get<CaseAnnouncementApi.CreateViewRecordResponse>(
    `/api/v1/announcement-view-record/${recordId}`,
>>>>>>> Stashed changes
  );
}

/**
 * 获取公告浏览记录
 */
<<<<<<< Updated upstream
export async function getAnnouncementViewsApi(
  announcementId: string,
  page?: number,
  size?: number,
) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementViewListResponse>(
    '/api/web/getAnnouncementViews',
    {
      params: {
        token: localStorage.getItem('token'),
        announcement_id: announcementId,
        page,
        size,
      },
    },
  );
}
=======
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
>>>>>>> Stashed changes
