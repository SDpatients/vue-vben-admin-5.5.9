import { requestClient } from '#/api/request';

export interface Notification {
  id: number;
  userId: number;
  userAccount?: string;
  userName?: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  readTime?: string;
  relatedId?: number;
  relatedType?: string;
  priority: string;
  status: string;
  expireTime?: string;
  createUserId?: number;
  createUserName?: string;
  createTime: string;
  updateTime?: string;
  remark?: string;
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
    return requestClient.put('/api/v1/notification/read-all');
  },

  deleteNotification: (id: number) => {
    return requestClient.delete(`/api/v1/notification/${id}`);
  },
};
