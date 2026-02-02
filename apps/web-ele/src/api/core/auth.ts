import { baseRequestClient, fileUploadRequestClient } from '#/api/request';

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
      realName: string;
      refreshToken: string;
      userId: number;
      username: string;
    };
  }

  /** 当前用户信息 */
  export interface CurrentUser {
    id: number;
    username: string;
    realName: string;
    mobile: string;
    email: string;
    phone: string;
    status: string;
    roles: string[];
    permissions: string[];
  }

  /** 当前用户信息返回值 */
  export interface CurrentUserResult {
    code: number;
    message: string;
    data: CurrentUser;
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
      count: number;
      pages: number;
      records: Array<{
        logintime: string;
        userid: string;
        username: string;
      }>;
    };
    status: string;
    error: string;
  }

  /** 发送短信验证码参数 */
  export interface SendSmsCodeParams {
    mobile: string;
    smsType: 'bind' | 'login' | 'register' | 'reset_pwd';
  }

  /** 发送短信验证码返回值 */
  export interface SendSmsCodeResult {
    status: string;
    error: string;
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
      realName: string;
      refreshToken: string;
      userId: number;
      username: string;
    };
    message: string;
  }>('/api/v1/auth/refresh-token', {
    refreshToken,
  });

  if (result && result.code === 200 && result.data) {
    const newTokens = result.data;
    localStorage.setItem('token', newTokens.accessToken);
    localStorage.setItem('refreshToken', newTokens.refreshToken);

    const userInfo = {
      userId: newTokens.userId,
      username: newTokens.username,
      realName: newTokens.realName,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
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
 * 添加登录记录
 */
export async function addLoginRecordApi(
  data: AuthApi.LoginRecordParams,
  token: string,
) {
  return fileUploadRequestClient.post<AuthApi.LoginResult>(
    '/api/web/LoginRecord',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * 发送短信验证码
 */
export async function sendSmsCodeApi(data: AuthApi.SendSmsCodeParams) {
  const result = await fileUploadRequestClient.post<AuthApi.SendSmsCodeResult>(
    '/api/web/sendSmsCode',
    data,
  );
  return result;
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/**
 * 修改密码
 */
export async function changePasswordApi(data: ChangePasswordParams) {
  const token = localStorage.getItem('token');
  const result = await baseRequestClient.post<{
    code: number;
    data: null;
    message: string;
  }>(
    '/api/v1/auth/change-password',
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return result;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserApi() {
  const token = localStorage.getItem('token');

  const result = await fileUploadRequestClient.get<AuthApi.CurrentUserResult>(
    '/api/v1/auth/current-user',
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  return result;
}

/**
 * 查询登录记录
 */
export async function selectLoginRecordApi(
  data: AuthApi.SelectLoginRecordParams,
  token: string,
) {
  return fileUploadRequestClient.get<AuthApi.LoginRecordResult>(
    '/api/v1/web/LoginRecord',
    {
      params: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
