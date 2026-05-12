import { fundRequestClient } from '../request';

export namespace UserManagementApi {
  export interface UserInfo {
    id: number;
    username: string;
    realName: string;
    mobile: string;
    email: string;
    phone: string;
    isValid: string;
    status: 'ACTIVE' | 'DELETED' | 'INACTIVE' | 'LOCKED';
    loginType: string;
    lastLoginTime: null | string;
    lastLoginIp: null | string;
    loginCount: number;
    createTime: string;
    updateTime: string;
  }

  export interface UserWithRoles extends UserInfo {
    roles: RoleInfo[];
  }

  export interface RoleInfo {
    id: number;
    roleCode: string;
    roleName: string;
    roleDesc: string;
    isSystem: string;
    status: string;
    sortOrder: number;
    createTime?: string;
    updateTime?: string;
    createUserId?: number;
    updateUserId?: number;
    permissionIds?: number[];
    permissionCount?: number;
  }

  export interface CreateUserRequest {
    username: string;
    password: string;
    realName?: string;
    mobile?: string;
    email?: string;
    phone?: string;
    status?: string;
  }

  export interface UserListParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortOrder?: string;
    keyword?: string;
    status?: string;
  }

  export interface UserListResponse {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    users: UserInfo[];
  }

  export interface RoleListParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortOrder?: string;
    keyword?: string;
    status?: string;
  }

  export interface RoleListResponse {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    roles: RoleInfo[];
  }

  export interface AssignRoleRequest {
    roleIds: number[];
  }

  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function createUserApi(
  data: UserManagementApi.CreateUserRequest,
): Promise<UserManagementApi.ApiResponse<UserManagementApi.UserInfo>> {
  return fundRequestClient.post('/v1/users', data);
}

export async function getUserListApi(
  params: UserManagementApi.UserListParams,
): Promise<UserManagementApi.ApiResponse<UserManagementApi.UserListResponse>> {
  return fundRequestClient.get('/v1/users', { params });
}

export async function getUserDetailApi(
  id: number,
): Promise<UserManagementApi.ApiResponse<UserManagementApi.UserInfo>> {
  return fundRequestClient.get(`/v1/users/${id}`);
}

export async function deleteUserApi(
  id: number,
): Promise<UserManagementApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/users/${id}`);
}

export async function getAdminListApi(): Promise<
  UserManagementApi.ApiResponse<UserManagementApi.UserInfo[]>
> {
  return fundRequestClient.get('/v1/users/admins');
}

export async function getUserRoleListApi(): Promise<
  UserManagementApi.ApiResponse<UserManagementApi.UserWithRoles[]>
> {
  return fundRequestClient.get('/v1/user-roles/list');
}

export async function assignUserRoleApi(
  userId: number,
  data: UserManagementApi.AssignRoleRequest,
): Promise<UserManagementApi.ApiResponse<null>> {
  return fundRequestClient.post(`/v1/user-roles/${userId}/roles`, data);
}

export async function getUserRolesApi(
  userId: number,
): Promise<UserManagementApi.ApiResponse<number[]>> {
  return fundRequestClient.get(`/v1/user-roles/${userId}/roles`);
}

export async function removeUserRoleApi(
  userId: number,
  data: UserManagementApi.AssignRoleRequest,
): Promise<UserManagementApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/user-roles/${userId}/roles`, { data });
}

export async function clearUserRolesApi(
  userId: number,
): Promise<UserManagementApi.ApiResponse<null>> {
  return fundRequestClient.delete(`/v1/user-roles/${userId}/roles/all`);
}

export async function getRoleListApi(
  params?: UserManagementApi.RoleListParams,
): Promise<
  UserManagementApi.ApiResponse<UserManagementApi.RoleListResponse>
> {
  return fundRequestClient.get('/v1/roles', { params });
}