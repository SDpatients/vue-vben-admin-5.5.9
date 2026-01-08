import { requestClient } from '#/api/request';

export namespace ActivityApi {
  /** 活动信息 */
  export interface Activity {
    activityId: number;
    title: string;
    content: string;
    startTime: string;
    endTime: string;
    status: string;
    createTime: string;
    updateTime: string;
    createUser: string;
  }

  /** 活动列表响应 */
  export interface ActivityListResponse {
    data: {
      count: number;
      pages: number;
      records: Activity[];
    };
    code: number;
    message: string;
  }

  /** 活动响应 */
  export interface ActivityResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取活动列表
 */
export async function activityApi() {
  return requestClient.get<ActivityApi.ActivityListResponse>('/activities');
}

/**
 * 获取活动详情
 */
export async function getActivityDetailApi() {
  return requestClient.get<ActivityApi.Activity>('/activities');
}

/**
 * 新增活动
 */
export async function addActivityApi() {
  return requestClient.post<ActivityApi.ActivityResponse>('/activities');
}

/**
 * 更新活动
 */
export async function updateActivityApi() {
  return requestClient.put<ActivityApi.ActivityResponse>('/activities');
}

/**
 * 删除活动
 */
export async function deleteActivityApi() {
  return requestClient.delete<ActivityApi.ActivityResponse>('/activities');
}
