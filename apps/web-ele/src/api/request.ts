/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 *
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
import { logger } from '#/utils/logger';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

// 统一的请求头处理逻辑
async function addAuthHeader(config: any) {
  config.headers['Accept-Language'] = preferences.app.locale;
  const token = localStorage.getItem('token');
  if (token) {
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = formattedToken;
  }
  return config;
}

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    logger.warn('Access token or refresh token is invalid or expired. ');
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
    return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: addAuthHeader,
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor({
    fulfilled: (response) => {
      if (response === null || response === undefined) {
        return {
          config: { responseReturn: 'data' },
          data: { code: 200, data: null },
          status: 200,
          statusText: 'OK',
          headers: {},
        } as any;
      }
      return response;
    },
    rejected: (error) => Promise.reject(error),
  });

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

// 创建一个不带认证拦截器的简单请求客户端，用于许可证相关 API
export const baseRequestClient = (() => {
  const client = new RequestClient({
    baseURL: apiURL,
    responseReturn: 'body',
  });
  client.addResponseInterceptor({
    fulfilled: (response) => {
      if (response && response.data) {
        return response.data;
      }
      return response;
    },
  });
  return client;
})();

export { createRequestClient };

// 预定义常用 baseURL
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/v1';
const API_URL_8080 = import.meta.env.VITE_API_URL_8080 || '/api/v1';

// 聊天API客户端
export const chatRequestClient = createRequestClient(CHAT_API_URL, {
  responseReturn: 'body',
});

// 8080端口API客户端
export const requestClient8080 = createRequestClient(API_URL_8080, {
  responseReturn: 'body',
});

// 文件下载专用API客户端
export const fileDownloadRequestClient8080 = (() => {
  const client = new RequestClient({
    baseURL: API_URL_8080,
    responseReturn: 'body',
  });
  client.addRequestInterceptor({
    fulfilled: addAuthHeader,
  });
  return client;
})();

// 文件上传API客户端
export const fileUploadRequestClient = (() => {
  const client = createRequestClient(apiURL, {
    responseReturn: 'body',
  });
  client.addRequestInterceptor({
    fulfilled: addAuthHeader,
  });
  return client;
})();

// 资金管理API客户端
export const fundRequestClient = createRequestClient('/api', {
  responseReturn: 'body',
});

// 工作团队API客户端
export const workTeamRequestClient = createRequestClient('/api/v1', {
  responseReturn: 'body',
});

// Actuator API 专用客户端
export const actuatorRequestClient = (() => {
  const client = new RequestClient({
    baseURL: apiURL,
    responseReturn: 'body',
  });
  client.addRequestInterceptor({
    fulfilled: addAuthHeader,
  });
  client.addResponseInterceptor({
    fulfilled: (response) => {
      if (response && response.data) {
        return response.data;
      }
      return response;
    },
    rejected: (error) => Promise.reject(error),
  });
  return client;
})();

// 所有需要跟踪的客户端列表
const trackedClients = [
  requestClient,
  chatRequestClient,
  requestClient8080,
  fileUploadRequestClient,
  fundRequestClient,
  workTeamRequestClient,
];

// 延迟初始化API跟踪拦截器
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const { createApiTrackingInterceptor } = await import('./operation-tracker');
      const apiTrackingInterceptor = createApiTrackingInterceptor();

      for (const client of trackedClients) {
        client.addRequestInterceptor(apiTrackingInterceptor.requestInterceptor);
        client.addResponseInterceptor(apiTrackingInterceptor.responseInterceptor);
      }
    } catch (error) {
      logger.warn('API跟踪拦截器加载失败:', error);
    }
  }, 0);
}
