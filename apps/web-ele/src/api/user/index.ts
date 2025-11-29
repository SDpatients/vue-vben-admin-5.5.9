import { requestClient } from '#/api/request';

export interface User {
  row: number;
  U_PID: number;
  U_USER: string;
  U_NAME: string;
  U_TEL: string | null;
  U_EMAIL: string | null;
  U_REMARK: string;
  U_VALID: string;
}

export interface UserListResponse {
  data: {
    paras: any;
    count: number;
    pages: number;
    records: User[];
  };
  status: string;
  error: string;
}

export interface UserForm {
  U_USER: string;
  U_NAME: string;
  U_TEL: string;
  U_EMAIL: string;
  U_REMARK: string;
  U_VALID: string;
}

export interface BaseResponse {
  status: string;
  error: string;
  data?: any;
}

/**
 * 获取所有用户列表
 */
export async function getAllUsers(params?: {
  SearchKeyword?: string;
  page?: number;
  size?: number;
}) {
  // 根据您提供的接口，使用size和page参数
  const queryParams = {
    size: params?.size || 10,
    page: params?.page || 1
  };
  
  return requestClient.get<UserListResponse>('/api/web/selectAllUsers', { params: queryParams });
}

/**
 * 创建用户
 */
export async function createUser(userData: UserForm) {
  return requestClient.post<BaseResponse>('/api/web/createUser', userData);
}

/**
 * 更新用户
 */
export async function updateUser(userId: number, userData: UserForm) {
  return requestClient.put<BaseResponse>(`/api/web/updateUser/${userId}`, userData);
}

/**
 * 删除用户
 */
export async function deleteUser(userId: number) {
  return requestClient.delete<BaseResponse>(`/api/web/deleteUser/${userId}`);
}

// 导出所有API方法
export const userApi = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};