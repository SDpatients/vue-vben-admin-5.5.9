import { requestClient } from '#/api/request';

export namespace WorkTeamApi {
  /** 工作团队信息 */
  export interface WorkTeamInfo {
    teamId: number;
    teamName: string;
    teamType: string;
    description?: string;
    status: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
    members?: {
      joinTime: string;
      memberId: number;
      role: string;
      teamId: number;
      userId: number;
      userName: string;
    }[];
  }

  /** 工作团队列表响应 */
  export interface WorkTeamListResponse {
    data: {
      count: number;
      pages: number;
      records: WorkTeamInfo[];
    };
    code: number;
    message: string;
  }

  /** 工作团队响应 */
  export interface WorkTeamResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取工作团队列表
 */
export async function getWorkTeamListApi() {
  return requestClient.get<WorkTeamApi.WorkTeamListResponse>('/work-teams');
}

/**
 * 获取工作团队详情
 */
export async function getWorkTeamDetailApi() {
  return requestClient.get<WorkTeamApi.WorkTeamInfo>('/work-teams');
}

/**
 * 新增工作团队
 */
export async function addWorkTeamApi() {
  return requestClient.post<WorkTeamApi.WorkTeamResponse>('/work-teams');
}

/**
 * 更新工作团队
 */
export async function updateWorkTeamApi() {
  return requestClient.put<WorkTeamApi.WorkTeamResponse>('/work-teams');
}

/**
 * 删除工作团队
 */
export async function deleteWorkTeamApi() {
  return requestClient.delete<WorkTeamApi.WorkTeamResponse>('/work-teams');
}
