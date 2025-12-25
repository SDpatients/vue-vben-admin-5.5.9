import { createRequestClient } from '#/api/request';

// 案件公告管理专用客户端，使用指定的基础URL
const announcementRequestClient = createRequestClient(
  'http://192.168.0.120:8080',
  {
    responseReturn: 'body',
  },
);

// 获取token，用于查询参数
const getToken = () => {
  return (
    localStorage.getItem('token') ||
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA'
  );
};

export namespace CaseAnnouncementApi {
  /** 公告附件 */
  export interface AnnouncementAttachment {
    file_id: string;
    file_name: string;
    file_url: string;
  }

  /** 公告信息 */
  export interface Announcement {
    id: string;
    sep_id: string;
    title: string;
    content: string;
    announcement_type: string;
    status: string;
    publisher_id: string;
    publisher_name: string;
    publish_time: string;
    view_count: number;
    is_top: number;
    top_expire_time: string;
    attachments: AnnouncementAttachment[];
    create_time: string;
    update_time: string;
  }

  /** 公告列表响应 */
  export interface AnnouncementListResponse {
    data: {
      count: number;
      pages: number;
      records: Announcement[];
    };
    status: string;
    error: string;
  }

  /** 公告详情响应 */
  export interface AnnouncementDetailResponse {
    data: Announcement;
    status: string;
    error: string;
  }

  /** 创建公告请求体 */
  export interface CreateAnnouncementRequest {
    sep_id: string;
    title: string;
    content: string;
    announcement_type?: string;
    is_top?: boolean;
    top_expire_time?: string;
    attachments?: AnnouncementAttachment[];
  }

  /** 更新公告请求体 */
  export interface UpdateAnnouncementRequest {
    announcement_id: string;
    title?: string;
    content?: string;
    announcement_type?: string;
    status?: string;
    is_top?: boolean;
    top_expire_time?: string;
    attachments?: AnnouncementAttachment[];
  }

  /** 撤回公告请求体 */
  export interface RetractAnnouncementRequest {
    announcement_id: string;
    retract_reason?: string;
  }

  /** 公告浏览记录 */
  export interface AnnouncementView {
    id: string;
    announcement_id: string;
    viewer_name: string;
    view_time: string;
    ip_address: string;
  }

  /** 公告浏览记录响应 */
  export interface AnnouncementViewListResponse {
    data: {
      count: number;
      pages: number;
      records: AnnouncementView[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取案件公告列表
 */
export async function getAnnouncementListApi(
  sepId: string,
  page?: number,
  size?: number,
) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementListResponse>(
    '/api/web/getCaseAnnouncements',
    {
      params: {
        token: getToken(),
        sep_id: sepId,
        page,
        size,
      },
    },
  );
}

/**
 * 获取公告详情
 */
export async function getAnnouncementDetailApi(announcementId: string) {
  return announcementRequestClient.get<CaseAnnouncementApi.AnnouncementDetailResponse>(
    '/api/web/getAnnouncementDetail',
    {
      params: {
        token: getToken(),
        announcement_id: announcementId,
      },
    },
  );
}

/**
 * 发布公告
 */
export async function publishAnnouncementApi(
  sepId: string,
  data: Omit<CaseAnnouncementApi.CreateAnnouncementRequest, 'sep_id'>,
) {
  return announcementRequestClient.post<CaseAnnouncementApi.AnnouncementDetailResponse>(
    '/api/web/publishAnnouncement',
    {
      ...data,
      sep_id: sepId,
    },
    {
      params: {
        token: getToken(),
      },
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
        token: getToken(),
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
        token: getToken(),
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
        token: getToken(),
      },
    },
  );
}

/**
 * 记录公告浏览
 */
export async function recordAnnouncementViewApi(announcementId: string) {
  return announcementRequestClient.post<{ error: string; status: string }>(
    '/api/web/recordAnnouncementView',
    {
      announcement_id: announcementId,
    },
    {
      params: {
        token: getToken(),
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
        token: getToken(),
        announcement_id: announcementId,
        page,
        size,
      },
    },
  );
}
