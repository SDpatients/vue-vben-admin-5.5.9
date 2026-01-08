import { requestClient } from '#/api/request';

export namespace NotificationApi {
  /** 通知信息 */
  export interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    status: string;
    createTime: string;
    readTime?: string;
  }

  /** 通知列表响应 */
  export interface NotificationListResponse {
    data: {
      count: number;
      pages: number;
      records: Notification[];
    };
    code: number;
    message: string;
  }

  /** 通知响应 */
  export interface NotificationResponse {
    code: number;
    message: string;
  }
}

export type Notification = NotificationApi.Notification;

/**
 * 获取通知列表
 */
export async function notificationApi() {
  return requestClient.get<NotificationApi.NotificationListResponse>(
    '/notifications',
  );
}

/**
 * 标记通知为已读
 */
export async function markNotificationReadApi() {
  return requestClient.put<NotificationApi.NotificationResponse>(
    '/notifications/read',
  );
}

/**
 * 删除通知
 */
export async function deleteNotificationApi() {
  return requestClient.delete<NotificationApi.NotificationResponse>(
    '/notifications',
  );
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCountApi() {
  return requestClient.get<{ count: number }>('/notifications/unread-count');
}
