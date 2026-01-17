import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getCurrentUserApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';
import { webSocketService } from '#/services/websocket';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const result = await loginApi(params);

      // 检查返回的数据结构
      if (result && result.code === 200 && result.data) {
        // 登录成功，使用后端返回的用户信息
        const backendUserInfo = result.data;

        // 将用户信息转换为系统需要的格式
        userInfo = {
          userId: backendUserInfo.userId.toString(),
          username: backendUserInfo.username,
          realName: backendUserInfo.realName,
          homePath: preferences.app.defaultHomePath,
          avatar: '',
          desc: '',
          token: backendUserInfo.accessToken,
          refreshToken: backendUserInfo.refreshToken,
          roles: [],
        };

        accessStore.setAccessToken(backendUserInfo.accessToken);
        accessStore.setRefreshToken(backendUserInfo.refreshToken);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          if (onSuccess) {
            await onSuccess?.();
          } else {
            const targetPath =
              userInfo.homePath || preferences.app.defaultHomePath;
            await router.push(targetPath);
          }
        }

        if (userInfo?.realName) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }

        const userId = backendUserInfo.userId;
        localStorage.setItem('chat_user_id', userId.toString());
        localStorage.setItem('chat_username', backendUserInfo.username);
        localStorage.setItem('chat_user_info', JSON.stringify(backendUserInfo));

        webSocketService.connect().catch((error) => {
          console.error('WebSocket 连接失败:', error);
        });
      } else {
        // 登录失败，显示错误信息
        const errorMsg =
          result?.message || $t('authentication.passwordErrorTip');
        ElNotification({
          message: errorMsg,
          title: '登录失败',
          type: 'error',
        });
      }
    } catch (error: any) {
      // 网络错误或其他异常
      ElNotification({
        message: error?.message || '登录请求失败，请检查网络连接',
        title: '登录失败',
        type: 'error',
      });
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {}

    webSocketService.disconnect();

    localStorage.removeItem('chat_user_info');
    localStorage.removeItem('chat_user_id');
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_logintime');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpire');
    localStorage.removeItem('refreshTokenExpire');

    resetAllStores();

    accessStore.setLoginExpired(false);
    accessStore.setAccessToken(null);
    accessStore.setRefreshToken(null);
    accessStore.setAccessCodes([]);
    accessStore.setIsAccessChecked(false);
    accessStore.setAccessMenus([]);
    accessStore.setAccessRoutes([]);

    userStore.setUserInfo(null);
    userStore.setUserRoles([]);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    try {
      console.log('[fetchUserInfo] 开始获取用户信息...');
      const result = await getCurrentUserApi();
      console.log('[fetchUserInfo] API返回结果:', result);

      if (result && result.code === 200 && result.data) {
        const backendUserInfo = result.data;

        console.log('[fetchUserInfo] 后端用户信息:', backendUserInfo);

        userInfo = {
          userId: backendUserInfo.id.toString(),
          username: backendUserInfo.username,
          realName: backendUserInfo.realName,
          homePath: preferences.app.defaultHomePath,
          avatar: '',
          desc: '',
          token: accessStore.accessToken || '',
          refreshToken: accessStore.refreshToken || '',
          roles: backendUserInfo.roles || [],
          permissions: backendUserInfo.permissions || [],
        };

        console.log('[fetchUserInfo] 转换后的用户信息:', userInfo);
        userStore.setUserInfo(userInfo);
        userStore.setUserRoles(backendUserInfo.roles || []);
        accessStore.setAccessCodes(backendUserInfo.permissions || []);

        console.log('[fetchUserInfo] userStore中的用户信息:', userStore.userInfo);
        console.log('[fetchUserInfo] userStore中的角色:', userStore.userRoles);
        console.log('[fetchUserInfo] accessStore中的权限码:', accessStore.accessCodes);
      } else {
        console.log('[fetchUserInfo] API返回数据格式不正确:', result);
      }
    } catch (error) {
      console.error('[fetchUserInfo] 获取用户信息失败:', error);
    }
    return userInfo;
  }

  /**
   * 获取当前用户信息（从后端API）
   */
  async function fetchCurrentUser() {
    console.log('[fetchCurrentUser] 开始获取当前用户信息');
    try {
      const result = await getCurrentUserApi();
      console.log('[fetchCurrentUser] API返回结果:', result);
      if (result && result.code === 200 && result.data) {
        console.log('[fetchCurrentUser] 响应成功，开始映射用户信息');
        const backendUserInfo = result.data;
        console.log('[fetchCurrentUser] 后端用户信息:', backendUserInfo);
        const userInfo: UserInfo = {
          userId: backendUserInfo.id.toString(),
          username: backendUserInfo.username,
          realName: backendUserInfo.realName,
          homePath: preferences.app.defaultHomePath,
          avatar: '',
          desc: '',
          token: accessStore.accessToken || '',
          refreshToken: accessStore.refreshToken || '',
          roles: backendUserInfo.roles || [],
          permissions: backendUserInfo.permissions || [],
        };
        console.log('[fetchCurrentUser] 映射后的用户信息:', userInfo);
        userStore.setUserInfo(userInfo);
        userStore.setUserRoles(backendUserInfo.roles || []);
        accessStore.setAccessCodes(backendUserInfo.permissions || []);
        console.log('[fetchCurrentUser] 用户信息已设置到 store');
        console.log('[fetchCurrentUser] 用户角色:', backendUserInfo.roles);
        console.log('[fetchCurrentUser] 用户权限:', backendUserInfo.permissions);
        return userInfo;
      } else {
        console.warn('[fetchCurrentUser] 响应格式不正确:', result);
      }
    } catch (error) {
      console.error('[fetchCurrentUser] 获取当前用户信息失败:', error);
    }
    return null;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchCurrentUser,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
