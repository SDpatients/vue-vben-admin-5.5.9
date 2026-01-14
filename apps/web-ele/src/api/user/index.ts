import { chatRequestClient } from '#/api/request';

export interface User {
  id: number;
  username: string;
  realName: string;
  mobile: string;
  email: string;
  phone: string;
  isValid: string;
  status: string;
  loginType: string;
  lastLoginTime: string;
  lastLoginIp: string;
  loginCount: number;
  createTime: string;
  updateTime: string;
}

export interface UserListResponse {
  code: number;
  message: string;
  data: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    users: User[];
  };
}

export interface UserForm {
  username: string;
  password: string;
  realName: string;
  mobile: string;
  email?: string;
  status?: string;
}

export interface BaseResponse {
  code: number;
  message: string;
  data?: any;
}

/**
 * 获取所有用户列表
 */
export async function getAllUsers(params?: {
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: string;
  keyword?: string;
  status?: string;
}) {
  const queryParams = {
    page: params?.page || 1,
    size: params?.size || 10,
    sortField: params?.sortField || 'createTime',
    sortOrder: params?.sortOrder || 'DESC',
    keyword: params?.keyword,
    status: params?.status,
  };

  return chatRequestClient.get<UserListResponse>('/users', {
    params: queryParams,
  });
}

/**
 * 创建用户
 */
export async function createUser(userData: UserForm) {
  return requestClient.post<UserListResponse>('/api/v1/users', userData);
}

/**
 * 修改用户
 */
export async function updateUser(userId: number, userData: Partial<UserForm>) {
  return requestClient.put<UserListResponse>(`/api/v1/users/${userId}`, userData);
}

/**
 * 删除用户
 */
export async function deleteUser(userId: number) {
  return requestClient.delete<UserListResponse>(`/api/v1/users/${userId}`);
}

// 导出所有API方法
export const userApi = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
