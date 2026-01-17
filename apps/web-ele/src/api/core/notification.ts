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
  getNotificationList: (userId: number, pageNum: number = 0, pageSize: number = 20) => {
    return requestClient.get<NotificationListResponse>('/api/v1/notification/list', {
      params: { userId, pageNum, pageSize },
    });
  },

  getUnreadCount: () => {
    return requestClient.get<{ code: string; message: string; data: number }>(
      '/api/v1/notification/count/unread',
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
    return requestClient.put('/api/v1/notification/read/all');
  },

  deleteNotification: (id: number) => {
    return requestClient.delete(`/api/v1/notification/${id}`);
  },
};
