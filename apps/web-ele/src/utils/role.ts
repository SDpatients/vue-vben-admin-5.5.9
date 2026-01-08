import { getUserRoleByUserIdApi } from '#/api/core/permission';
import type { PermissionApi } from '#/api/core/permission';

export interface RoleInfo {
  roleId: number;
  roleCode: string;
  roleName: string;
  roleDesc: string;
  isSystem: string;
  status: string;
  sortOrder: number;
}

export interface UserRoleCheckResult {
  isAdmin: boolean;
  roleCode: string;
  roleName: string;
  roleInfo: RoleInfo | null;
}

const ADMIN_ROLE_CODE = 'ADMIN';

export async function getUserRoleByUserId(
  userId: number
): Promise<UserRoleCheckResult> {
  try {
    const response = await getUserRoleByUserIdApi(userId);

    if (response.status === '1' && response.data && response.data.length > 0) {
      const roleData = response.data[0];

      const roleInfo: RoleInfo = {
        roleId: roleData.role_id,
        roleCode: roleData.role_code,
        roleName: roleData.role_name,
        roleDesc: roleData.role_desc || '',
        isSystem: roleData.is_system || '0',
        status: roleData.status || '0',
        sortOrder: roleData.sort_order || 0,
      };

      const isAdmin = roleData.role_code === ADMIN_ROLE_CODE;

      return {
        isAdmin,
        roleCode: roleData.role_code,
        roleName: roleData.role_name,
        roleInfo,
      };
    }

    return {
      isAdmin: false,
      roleCode: '',
      roleName: '',
      roleInfo: null,
    };
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return {
      isAdmin: false,
      roleCode: '',
      roleName: '',
      roleInfo: null,
    };
  }
}

export function checkUserRoleFromStorage(): UserRoleCheckResult | null {
  const userIdStr = localStorage.getItem('chat_user_id');

  if (!userIdStr) {
    return null;
  }

  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) {
    return null;
  }

  const roleCode = localStorage.getItem('chat_role_code');
  const roleName = localStorage.getItem('chat_role_name');

  if (!roleCode) {
    return null;
  }

  const isAdmin = roleCode === ADMIN_ROLE_CODE;

  return {
    isAdmin,
    roleCode,
    roleName: roleName || '',
    roleInfo: null,
  };
}

export function saveUserRoleToStorage(roleInfo: RoleInfo): void {
  localStorage.setItem('chat_role_code', roleInfo.roleCode);
  localStorage.setItem('chat_role_name', roleInfo.roleName);
}

export function clearUserRoleFromStorage(): void {
  localStorage.removeItem('chat_role_code');
  localStorage.removeItem('chat_role_name');
}

export function isAdmin(): boolean {
  const result = checkUserRoleFromStorage();
  return result?.isAdmin || false;
}

export function getCurrentRoleCode(): string {
  const result = checkUserRoleFromStorage();
  return result?.roleCode || '';
}

export function canAccessAdminModule(): boolean {
  return isAdmin();
}