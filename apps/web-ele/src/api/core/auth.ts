import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    username: string;
    password: string;
    smsCode?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    code: number;
    message: string;
    data: {
      accessToken: string;
      permissions: string[];
      realName: string;
      refreshToken: string;
      userId: number;
      username: string;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 登录记录接口参数 */
  export interface LoginRecordParams {
    uPid: string;
    logintime: string;
  }

  /** 查询登录记录接口参数 */
  export interface SelectLoginRecordParams {
    username: string;
    page: number;
    size: number;
  }

  /** 登录记录返回值 */
  export interface LoginRecordResult {
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
export async function loginApi(data: AuthApi.LoginParams) {
  const result = await fileUploadRequestClient.post<AuthApi.LoginResult>(
    '/api/v1/auth/login',
    data,
  );

  // 如果登录成功，将用户信息和token存储到本地存储
  if (result && result.code === 200 && result.data) {
    const userInfo = result.data;
    const logintime = new Date().toISOString();

    // 存储用户信息和token到localStorage
    localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
    localStorage.setItem('chat_user_id', userInfo.userId.toString());
    localStorage.setItem('chat_username', userInfo.username);
    localStorage.setItem('chat_logintime', logintime);
    localStorage.setItem('token', userInfo.accessToken);
    localStorage.setItem('refreshToken', userInfo.refreshToken);
  }

  return result;
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  // 获取当前的refreshToken
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const result = await baseRequestClient.post<{
    code: number;
    data: {
      accessToken: string;
      permissions: string[];
      realName: string;
      refreshToken: string;
      userId: number;
      username: string;
    };
    message: string;
  }>('/api/v1/auth/refresh-token', {
    refreshToken,
  });

  // 更新本地存储中的token信息
  if (result && result.code === 200 && result.data) {
    const newTokens = result.data;
    localStorage.setItem('token', newTokens.accessToken);
    localStorage.setItem('refreshToken', newTokens.refreshToken);

    // 更新用户信息
    const userInfo = {
      userId: newTokens.userId,
      username: newTokens.username,
      realName: newTokens.realName,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      permissions: newTokens.permissions,
    };
    localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
  }

  return result;
}

/**
 * 退出登录
 */
export async function logoutApi() {
  const token = localStorage.getItem('token');
  const result = await baseRequestClient.post<{
    code: number;
    data: null;
    message: string;
  }>(
    '/api/v1/auth/logout',
    {},
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  // 清除本地存储中的聊天相关信息和token
  localStorage.removeItem('chat_user_info');
  localStorage.removeItem('chat_user_id');
  localStorage.removeItem('chat_username');
  localStorage.removeItem('chat_logintime');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessTokenExpire');
  localStorage.removeItem('refreshTokenExpire');

  return result;
}

/**
 * 刷新token
 */
export async function refreshTokenApi() {
  return requestClient.post<AuthApi.RefreshTokenResponse>('/auth/refresh');
}
