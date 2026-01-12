import { createRequestClient } from '#/api/request';

// 案件公告管理专用客户端，使用指定的基础URL
const announcementRequestClient = createRequestClient(
  'http://localhost:5779',
  {
    responseReturn: 'body',
  },
);

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
    data: AnnouncementListData;
  }

  /** 公告详情响应 */
  export interface AnnouncementDetailResponse {
    code: number;
    message: string;
    data: Announcement;
  }
}

/**
 * 获取案件公告列表
 */
export async function getAnnouncementListApi(
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
  );
}

/**
 * 获取公告详情
 */
export async function getAnnouncementDetailApi(announcementId: number | string) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementDetailResponse>(
    `/api/v1/case-announcement/${announcementId}`,
  );
}

/**
 * 发布公告
 */
export async function publishAnnouncementApi(
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
  );
}

/**
 * 更新公告
 */
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
  );
}

/**
 * 删除公告
 */
export async function deleteAnnouncementApi(announcementId: string) {
  return announcementRequestClient.delete<{ error: string; status: string }>(
    `/api/web/deleteAnnouncement/${announcementId}`,
    {
      params: {
        token: localStorage.getItem('token'),
      },
    },
  );
}

/**
 * 撤回公告
 */
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
  );
}

/**
 * 记录公告浏览
 */
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
  );
}

/**
 * 获取公告浏览记录
 */
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
