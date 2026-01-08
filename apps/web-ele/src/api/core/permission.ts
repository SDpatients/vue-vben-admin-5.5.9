import { requestClient } from '#/api/request';

export namespace PermissionApi {
  /** 角色信息 */
  export interface RoleInfo {
    roleId: number;
    roleName: string;
    roleCode: string;
    description?: string;
    status: string;
    createTime: string;
    updateTime: string;
    menuIds: number[];
  }

  /** 角色列表响应 */
  export interface RoleListResponse {
    data: {
      count: number;
      pages: number;
      records: RoleInfo[];
    };
    code: number;
    message: string;
  }

  /** 角色响应 */
  export interface RoleResponse {
    code: number;
    message: string;
  }

  /** 用户角色响应 */
  export interface UserRoleResponse {
    data: {
      roleIds: number[];
    };
    code: number;
    message: string;
  }
}

/**
 * 获取角色列表
 */
export async function getRoleListApi() {
  return requestClient.get<PermissionApi.RoleListResponse>('/roles');
}

/**
 * 获取角色详情
 */
export async function getRoleDetailApi() {
  return requestClient.get<PermissionApi.RoleInfo>('/roles');
}

/**
 * 新增角色
 */
export async function addRoleApi() {
  return requestClient.post<PermissionApi.RoleResponse>('/roles');
}

/**
 * 更新角色
 */
export async function updateRoleApi() {
  return requestClient.put<PermissionApi.RoleResponse>('/roles');
}

/**
 * 删除角色
 */
export async function deleteRoleApi() {
  return requestClient.delete<PermissionApi.RoleResponse>('/roles');
}

/**
 * 获取用户角色
 */
export async function getUserRolesApi() {
  return requestClient.get<PermissionApi.UserRoleResponse>('/users/roles');
}

/**
 * 分配角色给用户
 */
export async function assignRolesToUserApi() {
  return requestClient.post<PermissionApi.RoleResponse>('/users/roles');
}
