import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录响应 */
  export interface LoginResponse {
    data: {
      accessToken: string;
      refreshToken: string;
      userInfo: {
        avatar: string;
        name: string;
        roles: string[];
        userId: number;
        username: string;
      };
    };
    code: number;
    message: string;
  }

  /** 刷新token响应 */
  export interface RefreshTokenResponse {
    data: {
      accessToken: string;
      refreshToken: string;
    };
    code: number;
    message: string;
  }
}

/**
 * 登录
 */
export async function loginApi() {
  return requestClient.post<AuthApi.LoginResponse>('/auth/login');
}

/**
 * 登出
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout');
}

/**
 * 刷新token
 */
export async function refreshTokenApi() {
  return requestClient.post<AuthApi.RefreshTokenResponse>('/auth/refresh');
}
