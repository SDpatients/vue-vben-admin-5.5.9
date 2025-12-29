import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;

  /**
   * accessToken
   */
  token: string;

  /**
   * refreshToken
   */
  refreshToken?: string;

  /**
   * accessToken过期时间
   */
  accessTokenExpire?: number;

  /**
   * refreshToken过期时间
   */
  refreshTokenExpire?: number;

  /**
   * 权限列表
   */
  permissions?: string[];

  /**
   * 角色列表
   */
  roles?: string[];
}

export type { UserInfo };
