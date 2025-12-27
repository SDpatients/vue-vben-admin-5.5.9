import { baseRequestClient, fileUploadRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    data: {
      token: string;
      U_NAME: string;
      U_PID: string;
      U_TEL: string;
      U_USER: string;
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
    userid: string;
    username: string;
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
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  // 使用POST请求方式调用实际的登录接口
  // 将参数转换为后端期望的格式：UserName和Pwd
  const postData = {
    UserName: data.username || '',
    Pwd: data.password || '',
  };
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
    localStorage.setItem('chat_user_id', userInfo.U_PID);
    localStorage.setItem('chat_username', userInfo.U_NAME);
    localStorage.setItem('chat_logintime', logintime);
    localStorage.setItem('token', userInfo.token);

    // 调用添加登录记录接口，使用从登录接口返回的token
    try {
      await addLoginRecordApi(
        {
          userid: userInfo.U_PID,
          username: userInfo.U_NAME,
          logintime,
        },
        userInfo.token,
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
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  const result = await baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });

  // 清除本地存储中的聊天相关信息和token
  localStorage.removeItem('chat_user_info');
  localStorage.removeItem('chat_user_id');
  localStorage.removeItem('chat_username');
  localStorage.removeItem('chat_logintime');
  localStorage.removeItem('token');

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
      params: {
        token,
      },
    },
  );
}

/**
 * 查询登录记录
 */
export async function selectLoginRecordApi(
  data: AuthApi.SelectLoginRecordParams,
  token: string,
) {
  return fileUploadRequestClient.get<AuthApi.LoginRecordResult>(
    '/api/web/selectLoginRecord',
    {
      params: {
        token,
        ...data,
      },
    },
  );
}
