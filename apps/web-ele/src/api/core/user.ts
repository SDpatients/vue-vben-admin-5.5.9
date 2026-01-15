import type { UserInfo } from '@vben/types';

import { requestClient8085 } from '#/api/request';

export namespace UserApi {
  /** 用户信息 */
  export interface UserInfo {
    uPid: number;
    uName: string;
    uCode: string;
    uDeptId: number;
    uDeptName: string;
    uRole: string;
    uStatus: string;
  }

  /** 用户列表响应 */
  export interface UserListResponse {
    data: UserInfo[];
    status: string;
    error: string;
  }

  /** 员工信息 */
  export interface StaffInfo {
    id: number;
    status: string;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
    administratorId: number;
    name: string;
    staffType: string;
    idNumber: string;
    lawyerLicenseNumber: string;
    contactPhone: string;
    email: string;
    responsibility: string;
    appointmentDate: string;
    userId: number;
  }

  /** 员工列表响应 */
  export interface StaffListResponse {
    code: number;
    message: string;
    data: StaffInfo[];
  }
}

/**
 * 获取用户信息
 * 由于后端没有/user/info接口，返回模拟数据
 */
export async function getUserInfoApi() {
  // 返回模拟的用户信息
  const mockUserInfo: UserInfo = {
    userId: 'admin',
    username: 'admin',
    realName: '管理员',
    avatar: '',
    homePath: '/dashboard',
    desc: '系统管理员',
    token: 'mock_token',
    roles: ['admin'],
  };

  // 模拟异步请求延迟
  return new Promise<UserInfo>((resolve) => {
    setTimeout(() => resolve(mockUserInfo), 100);
  });
}

/**
 * 根据管理人ID获取员工列表
 * @param administratorId 管理人ID
 */
export async function getUserByDeptIdApi(administratorId: number) {
  return requestClient8085.get<UserApi.StaffListResponse>(
    `/administrator/${administratorId}/staff/list`,
  );
}

/**
 * 根据关键词获取用户列表
 * @param keyword 搜索关键词
 */
export async function getUsersApi(keyword: string) {
  return requestClient8085.get<UserApi.StaffListResponse>('/users', {
    params: { keyword },
  });
}
