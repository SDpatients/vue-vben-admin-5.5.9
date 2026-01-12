import { requestClient } from '#/api/request';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  relatedType?: string;
  relatedId?: number;
  isRead: boolean;
  priority: string;
  status: string;
  createTime: string;
  readTime?: string;
}

export interface NotificationListResponse {
  code: string;
  message: string;
  data: Notification[];
}

export const notificationApi = {
  getNotificationList: (page: number = 1, pageSize: number = 20) => {
    return requestClient.get<NotificationListResponse>('/api/notification/list', {
      params: { page, pageSize },
    });
  },

  getUnreadCount: () => {
    return requestClient.get<{ code: string; message: string; data: number }>(
      '/api/notification/unread/count',
    );
  },

  getUnreadNotifications: (userId: number) => {
    return requestClient.get<NotificationListResponse>('/api/v1/notification/unread', {
      params: { userId },
    });
  },

  markAsRead: (id: number) => {
    return requestClient.put(`/api/v1/notification/${id}/read`);
  },

  markAllAsRead: () => {
    return requestClient.put('/api/notification/read/all');
  },

  deleteNotification: (id: number) => {
    return requestClient.delete(`/api/notification/${id}`);
  },
};
