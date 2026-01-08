import { requestClient8085 } from '#/api/request';

export namespace PermissionApi {
  /** 角色信息 */
  export interface Role {
    roleId: number;
    roleCode: string;
    roleName: string;
    roleDesc?: string;
    isSystem?: string;
    status?: string;
    sortOrder?: number;
    sepAuser?: any;
    sepAdate?: string;
    sepEuser?: any;
    sepEdate?: string;
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

  /** 用户信息 */
  export interface User {
    u_pid: number;
    u_user: string;
    u_name: string;
    u_pwd: string;
    u_deptid: number;
    u_dept: string;
    u_tel: string | null;
    u_mobile: string | null;
    u_email: string;
    u_remark: string | null;
    u_valid: string;
    u_status: string;
    u_login_type: string;
    u_bind_device: any;
    u_last_login_time: string;
    u_last_login_ip: string;
    u_login_count: number;
    u_pwd_error_count: number;
    u_pwd_error_time: any;
    u_pwd_expire_time: any;
    sep_auser: string;
    sep_adate: string;
    sep_euser: any;
    sep_edate: string;
    u_pur1: any;
    u_pur2: any;
    u_pur3: any;
    u_pur4: any;
    u_pur5: any;
    roles: any;
    permissions: any;
  }

  /** 用户列表响应 */
  export interface UsersResponse {
    status: string;
    error: string;
    data: User[];
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

/**
 * 根据用户ID获取用户角色
 */
export async function getUserRoleByUserIdApi(userId: number) {
  return requestClient8085.get<PermissionApi.RolesResponse>(
    '/api/web/userRole/getUserRoleByUserId',
    {
      params: { userId },
    },
  );
}
