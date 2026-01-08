import { requestClient } from '#/api/request';

export namespace UserApi {
  /** 用户信息 */
  export interface UserInfo {
    userId: number;
    username: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status: string;
    createTime: string;
    updateTime: string;
    roles: {
      roleCode: string;
      roleId: number;
      roleName: string;
    }[];
  }

  /** 用户列表响应 */
  export interface UserListResponse {
    data: {
      count: number;
      pages: number;
      records: UserInfo[];
    };
    code: number;
    message: string;
  }

  /** 用户响应 */
  export interface UserResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取用户列表
 */
export async function getUserListApi() {
  return requestClient.get<UserApi.UserListResponse>('/users');
}

/**
 * 获取用户详情
 */
export async function getUserDetailApi() {
  return requestClient.get<UserApi.UserInfo>('/users');
}

/**
 * 新增用户
 */
export async function addUserApi() {
  return requestClient.post<UserApi.UserResponse>('/users');
}

/**
 * 更新用户
 */
export async function updateUserApi() {
  return requestClient.put<UserApi.UserResponse>('/users');
}

/**
 * 删除用户
 */
export async function deleteUserApi() {
  return requestClient.delete<UserApi.UserResponse>('/users');
}

/**
 * 更新用户状态
 */
export async function updateUserStatusApi() {
  return requestClient.put<UserApi.UserResponse>('/users/status');
}
