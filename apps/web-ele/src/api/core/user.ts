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
 * 根据部门ID获取用户列表
 * @param deptId 部门ID
 */
export async function getUserByDeptIdApi(deptId: number) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.get<UserApi.UserListResponse>(
    '/api/web/getUserByDeptid',
    {
      params: {
        token,
        deptId,
      },
    },
  );
}
