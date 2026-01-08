import { requestClient } from '#/api/request';

export namespace ManagerApi {
  /** 管理人员信息 */
  export interface ManagerInfo {
    managerId: number;
    name: string;
    position: string;
    department: string;
    contactPhone?: string;
    email?: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  /** 管理人员列表响应 */
  export interface ManagerListResponse {
    data: {
      count: number;
      pages: number;
      records: ManagerInfo[];
    };
    code: number;
    message: string;
  }

  /** 管理人员响应 */
  export interface ManagerResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取管理人员列表
 */
export async function getManagerListApi() {
  return requestClient.get<ManagerApi.ManagerListResponse>('/managers');
}

/**
 * 获取管理人员详情
 */
export async function getManagerDetailApi() {
  return requestClient.get<ManagerApi.ManagerInfo>('/managers');
}

/**
 * 新增管理人员
 */
export async function addManagerApi() {
  return requestClient.post<ManagerApi.ManagerResponse>('/managers');
}

/**
 * 更新管理人员
 */
export async function updateManagerApi() {
  return requestClient.put<ManagerApi.ManagerResponse>('/managers');
}

/**
 * 删除管理人员
 */
export async function deleteManagerApi() {
  return requestClient.delete<ManagerApi.ManagerResponse>('/managers');
}
