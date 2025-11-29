import type { UserInfo } from '@vben/types';

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
