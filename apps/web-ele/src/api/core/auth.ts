import { baseRequestClient, fileUploadRequestClient } from '#/api/request';
import DeviceUtils from '#/utils/device';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    mobile?: string;
    code?: string;
    loginType?: 'mobile' | 'username';
    deviceId?: string;
    deviceInfo?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    data: {
      accessToken: string;
      accessTokenExpire: number;
      refreshToken: string;
      refreshTokenExpire: number;
      user: {
        uDept: string;
        uEmail: string;
        uMobile: string;
        uName: string;
        uPid: number;
        uTel: string;
        uUser: string;
      };
    };
    status: string;
    error: string;
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
  // 获取设备信息
  const deviceId = DeviceUtils.getDeviceId();
  const deviceInfo = DeviceUtils.getDeviceInfoString();

  // 使用POST请求方式调用实际的登录接口
  // 将参数转换为后端期望的格式：username和password
  const postData = {
    username: data.username || '',
    password: data.password || '',
    deviceId,
    deviceInfo,
  };

  // 如果是手机验证码登录，添加手机号和验证码
  if (data.loginType === 'mobile' && data.mobile && data.code) {
    Object.assign(postData, {
      mobile: data.mobile,
      smsCode: data.code,
    });
  }

  const result = await fileUploadRequestClient.post<AuthApi.LoginResult>(
    '/api/web/login',
    postData,
  );

  // 如果登录成功，将用户信息和token存储到本地存储
  if (result && result.status === '1' && result.data) {
    const userInfo = result.data;
    const logintime = new Date().toISOString();

    // 存储用户信息和token到localStorage
    localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
    localStorage.setItem('chat_user_id', userInfo.user.uPid.toString());
    localStorage.setItem('chat_username', userInfo.user.uName);
    localStorage.setItem('chat_logintime', logintime);
    localStorage.setItem('token', userInfo.accessToken);
    localStorage.setItem('refreshToken', userInfo.refreshToken);
    localStorage.setItem(
      'accessTokenExpire',
      userInfo.accessTokenExpire.toString(),
    );
    localStorage.setItem(
      'refreshTokenExpire',
      userInfo.refreshTokenExpire.toString(),
    );

    // 调用添加登录记录接口，使用从登录接口返回的token
    try {
      await addLoginRecordApi(
        {
          uPid: userInfo.user.uPid.toString(),
          logintime,
        },
        userInfo.accessToken,
      );
    } catch (error) {
      console.error('添加登录记录失败:', error);
      // 登录记录添加失败不影响登录流程
    }
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

  // 获取设备信息
  const deviceId = DeviceUtils.getDeviceId();
  const deviceInfo = DeviceUtils.getDeviceInfoString();

  const result = await baseRequestClient.post<{
    data: {
      accessToken: string;
      accessTokenExpire: number;
      refreshToken: string;
      refreshTokenExpire: number;
    };
    error: string;
    status: string;
  }>('/api/web/refreshToken', {
    refreshToken,
    deviceId,
    deviceInfo,
  });

  // 更新本地存储中的token信息
  if (result && result.status === '1' && result.data) {
    const newTokens = result.data;
    localStorage.setItem('token', newTokens.accessToken);
    localStorage.setItem('refreshToken', newTokens.refreshToken);
    localStorage.setItem(
      'accessTokenExpire',
      newTokens.accessTokenExpire.toString(),
    );
    localStorage.setItem(
      'refreshTokenExpire',
      newTokens.refreshTokenExpire.toString(),
    );

    // 更新用户信息中的token
    const chatUserInfo = localStorage.getItem('chat_user_info');
    if (chatUserInfo) {
      const userInfo = JSON.parse(chatUserInfo);
      userInfo.accessToken = newTokens.accessToken;
      userInfo.refreshToken = newTokens.refreshToken;
      userInfo.accessTokenExpire = newTokens.accessTokenExpire;
      userInfo.refreshTokenExpire = newTokens.refreshTokenExpire;
      localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
    }
  }

  return result;
}

/**
 * 退出登录
 */
export async function logoutApi() {
  const refreshToken = localStorage.getItem('refreshToken');
  const result = await baseRequestClient.post('/api/web/logout', {
    refreshToken,
  });

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
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return fileUploadRequestClient.get<string[]>('/auth/codes');
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
 * 获取当前用户信息
 */
export async function getCurrentUserApi() {
  const token = localStorage.getItem('token');
  return fileUploadRequestClient.get<{
    data: {
      uDept: string;
      uEmail: string;
      uMobile: string;
      uName: string;
      uPid: string;
      uTel: string;
      uUser: string;
    };
    error: string;
    status: string;
  }>('/api/web/currentUser', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/**
 * 获取用户权限信息
 */
export async function getPermissionsApi() {
  const token = localStorage.getItem('token');
  return fileUploadRequestClient.get<{
    data: {
      menus: any[];
      permissions: string[];
    };
    error: string;
    status: string;
  }>('/api/web/permissions', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/**
 * 查询登录记录
 */
export async function selectLoginRecordApi(
  data: AuthApi.SelectLoginRecordParams,
  token: string,
) {
  return fileUploadRequestClient.get<AuthApi.LoginRecordResult>(
    '/api/web/LoginRecord',
    {
      params: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
