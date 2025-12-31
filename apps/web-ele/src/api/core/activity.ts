import { requestClient } from '#/api/request';

export interface Activity {
  id: number;
  userId: number;
  userName: string;
  type: string;
  content: string;
  relatedType?: string;
  relatedId?: number;
  createTime: string;
}

export const activityApi = {
  getActivityList: (type?: string, page: number = 1, pageSize: number = 20) => {
    return requestClient.get('/api/activity/list', {
      params: { type, page, pageSize },
    });
  },

  getMyActivityList: (page: number = 1, pageSize: number = 20) => {
    return requestClient.get('/api/activity/my', {
      params: { page, pageSize },
    });
  },

  getUserActivityList: (targetUserId: number, page: number = 1, pageSize: number = 20) => {
    return requestClient.get(`/api/activity/user/${targetUserId}`, {
      params: { page, pageSize },
    });
  },
};
