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
        
        // 直接存储token到localStorage，确保在微信浏览器中也能正常工作
        localStorage.setItem('token', backendUserInfo.accessToken);
        localStorage.setItem('refreshToken', backendUserInfo.refreshToken);
        
        console.log('Token stored in localStorage:', backendUserInfo.accessToken.substring(0, 30) + '...');
        console.log('Refresh token stored in localStorage:', backendUserInfo.refreshToken.substring(0, 30) + '...');

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          if (onSuccess) {
            await onSuccess?.();
          } else {
            // 检查URL中是否有redirect参数
            const currentRoute = router.currentRoute.value;
            const redirectPath = currentRoute.query.redirect as string;
            
            console.log('Login redirect path:', redirectPath);
            
            const targetPath = 
              redirectPath ? decodeURIComponent(redirectPath) : 
              '/workspace';
            
            console.log('Final target path:', targetPath);
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
      const result = await getCurrentUserApi();

      if (result && result.code === 200 && result.data) {
        const backendUserInfo = result.data;

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

        userStore.setUserInfo(userInfo);
        userStore.setUserRoles(backendUserInfo.roles || []);
        accessStore.setAccessCodes(backendUserInfo.permissions || []);
      }
    } catch (error) {
      // 获取用户信息失败
    }
    return userInfo;
  }

  /**
   * 获取当前用户信息（从后端API）
   */
  async function fetchCurrentUser() {
    try {
      const result = await getCurrentUserApi();
      if (result && result.code === 200 && result.data) {
        const backendUserInfo = result.data;
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
        userStore.setUserInfo(userInfo);
        userStore.setUserRoles(backendUserInfo.roles || []);
        accessStore.setAccessCodes(backendUserInfo.permissions || []);
        return userInfo;
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
