import { createRequestClient } from '#/api/request';

// 案件公告管理专用客户端，使用指定的基础URL
const announcementRequestClient = createRequestClient(
  'http://192.168.0.107:8080',
  {
    responseReturn: 'body',
  },
);

// 获取token，用于查询参数
const getToken = () => {
  return localStorage.getItem('token') || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzY2MzgyNzczLCJleHAiOjE3NjY0NjkxNzN9.qky_uzMPfWbUhrYDlS_qlghkKOWAHVojWAkw84SHqhRg4PlEWplLv8ph1H21-tKhBorfb3sVpL0xfj20rhBxnA';
};

export namespace CaseAnnouncementApi {
  /** 公告信息 */
  export interface Announcement {
    id: string;
    caseId: string;
    title: string;
    content: string;
    publishDate: string;
    author: string;
    status: string;
  }

  /** 公告列表响应 */
  export interface AnnouncementListResponse {
    data: {
      count: number;
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

  /** 创建/更新公告请求体 */
  export interface AnnouncementRequest {
    title: string;
    content: string;
    status: string;
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
  data: CaseAnnouncementApi.AnnouncementRequest,
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
  data: CaseAnnouncementApi.AnnouncementRequest,
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
  return announcementRequestClient.put<CaseAnnouncementApi.AnnouncementDetailResponse>(
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
