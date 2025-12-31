import { requestClient8085 } from '#/api/request';

export namespace PermissionApi {
  /** 角色信息 */
  export interface Role {
    roleId: number;
    roleCode: string;
    roleName: string;
    roleDesc?: string;
    isSystem?: string;
    sortOrder?: number;
  }

  /** 用户角色 */
  export interface UserRole {
    userId: number;
    roleId: number;
    roleCode: string;
    roleName: string;
  }

  /** 角色列表响应 */
  export interface RolesResponse {
    status: string;
    error: string;
    data: Role[];
  }

  /** 用户角色列表响应 */
  export interface UserRolesResponse {
    status: string;
    error: string;
    data: UserRole[];
  }

  /** 用户列表响应 */
  export interface UsersResponse {
    status: string;
    error: string;
    data: Array<{
      userId: number;
      username: string;
      realName?: string;
    }>;
  }

  /** 通用响应 */
  export interface CommonResponse {
    status: string;
    error: string;
    data: string;
  }

  /** 检查角色响应 */
  export interface CheckRoleResponse {
    status: string;
    error: string;
    data: {
      hasRole: boolean;
      userId: number;
      roleCode: string;
    };
  }
}

/**
 * 获取用户角色列表
 */
export async function getRolesByUserIdApi(userId: number) {
  return requestClient8085.get<PermissionApi.RolesResponse>(
    '/api/web/userRole/getRolesByUserId',
    {
      params: { userId },
    },
  );
}

/**
 * 为用户分配角色
 */
export async function assignRoleApi(userId: number, roleId: number) {
  return requestClient8085.post<PermissionApi.CommonResponse>(
    '/api/web/userRole/assignRole',
    null,
    {
      params: { userId, roleId },
    },
  );
}

/**
 * 移除用户角色
 */
export async function removeRoleApi(userId: number, roleId: number) {
  return requestClient8085.post<PermissionApi.CommonResponse>(
    '/api/web/userRole/removeRole',
    null,
    {
      params: { userId, roleId },
    },
  );
}

/**
 * 设置用户角色（覆盖模式）
 */
export async function setUserRolesApi(userId: number, roleIds: number[]) {
  return requestClient8085.post<PermissionApi.CommonResponse>(
    '/api/web/userRole/setUserRoles',
    roleIds,
    {
      params: { userId },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 获取所有角色
 */
export async function getAllRolesApi() {
  return requestClient8085.get<PermissionApi.RolesResponse>(
    '/api/web/userRole/getAllRoles',
  );
}

/**
 * 获取某角色的所有用户
 */
export async function getUsersByRoleCodeApi(roleCode: string) {
  return requestClient8085.get<PermissionApi.UsersResponse>(
    '/api/web/userRole/getUsersByRoleCode',
    {
      params: { roleCode },
    },
  );
}

/**
 * 检查用户是否有某角色
 */
export async function checkUserRoleApi(userId: number, roleCode: string) {
  return requestClient8085.get<PermissionApi.CheckRoleResponse>(
    '/api/web/userRole/checkUserRole',
    {
      params: { userId, roleCode },
    },
  );
}

/**
 * 获取用户角色ID
 */
export async function getUserRoleIdsApi(userId: number) {
  return requestClient8085.get<PermissionApi.CommonResponse>(
    '/api/web/userRole/getUserRoleIds',
    {
      params: { userId },
    },
  );
}

/**
 * 更新用户角色
 */
export async function updateTBUserRoleApi(data: {
  u_pid: number;
  u_user: string;
  u_name: string;
  role_id: number;
}) {
  return requestClient8085.post<PermissionApi.CommonResponse>(
    '/api/web/userRole/updateTBUserRole',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
