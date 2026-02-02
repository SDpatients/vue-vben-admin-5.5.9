/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    const resp = await refreshTokenApi();
    if (resp && resp.code === 200 && resp.data) {
      const newTokens = resp.data;
      accessStore.setAccessToken(newTokens.accessToken);
      accessStore.setRefreshToken(newTokens.refreshToken);

      const userInfo = {
        userId: newTokens.userId.toString(),
        username: newTokens.username,
        realName: newTokens.realName,
        homePath: preferences.app.defaultHomePath,
        avatar: '',
        desc: '',
        token: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        roles: [],
      };
      authStore.userStore.setUserInfo(userInfo);

      return newTokens.accessToken;
    }
    throw new Error('Failed to refresh token');
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      config.headers['Accept-Language'] = preferences.app.locale;
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 200,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      let errorMessage = responseData?.error ?? responseData?.message ?? '';

      // 过滤掉类似 [0xc00764f9e0 0xc00764fa10 0xc00764fa40] 这样的无效日志
      const memoryAddressPattern =
        /^\[0x[0-9a-f]+\s+0x[0-9a-f]+\s+0x[0-9a-f]+\]$/i;
      if (memoryAddressPattern.test(errorMessage)) {
        errorMessage = '';
      }

      // 过滤掉没有权限查看统计数据的错误提示
      if (errorMessage.includes('您没有权限查看统计数据')) {
        errorMessage = '';
      }

      // 如果没有有效错误信息，则不显示提示
      if (errorMessage) {
        ElMessage.error(errorMessage || msg);
      }
    }),
  );

  return client;
}

// 默认API客户端，使用环境变量中的API_URL
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });

export { createRequestClient };

export const chatRequestClient = createRequestClient(
  import.meta.env.VITE_CHAT_API_URL || '/api/v1',
  {
    responseReturn: 'body',
  },
);

export const requestClient8085 = createRequestClient(
  import.meta.env.VITE_API_URL_8085 || '/api/v1',
  {
    responseReturn: 'body',
  },
);

// 文件上传API客户端，使用环境变量中的API URL，通过Vite代理
export const fileUploadRequestClient = createRequestClient(apiURL, {
  responseReturn: 'body',
});

// 资金管理API客户端，使用Vite代理
export const fundRequestClient = createRequestClient(
  '/api',
  {
    responseReturn: 'body',
  },
);

// 工作团队API客户端，使用Vite代理
export const workTeamRequestClient = createRequestClient(
  '/api/v1',
  {
    responseReturn: 'body',
  },
);

// 延迟初始化API跟踪拦截器
if (typeof window !== 'undefined') {
  // 在浏览器环境中，延迟添加API跟踪拦截器
  setTimeout(async () => {
    try {
      const { createApiTrackingInterceptor } = await import('./operation-tracker');
      const apiTrackingInterceptor = createApiTrackingInterceptor();

      // 为所有客户端添加拦截器
      requestClient.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      requestClient.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);

      chatRequestClient.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      chatRequestClient.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);

      requestClient8085.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      requestClient8085.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);

      fileUploadRequestClient.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      fileUploadRequestClient.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);

      fundRequestClient.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      fundRequestClient.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);

      workTeamRequestClient.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
      workTeamRequestClient.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);
    } catch (error) {
      console.warn('API跟踪拦截器加载失败:', error);
    }
  }, 0);
}
