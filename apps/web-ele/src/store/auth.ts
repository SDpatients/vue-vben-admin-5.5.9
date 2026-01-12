import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { $t } from '#/locales';

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

      // 使用虚拟数据模拟登录成功
      const mockResult = {
        status: '1',
        data: {
          user: {
            uUser: params.username || 'admin',
            uName: params.username || 'Admin',
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          accessTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天过期
          refreshTokenExpire: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天过期
        },
      };

      // 检查返回的数据结构
      if (mockResult && mockResult.status === '1' && mockResult.data) {
        // 登录成功，使用虚拟用户信息
        const backendUserInfo = mockResult.data;

        // 将用户信息转换为系统需要的格式
        userInfo = {
          userId: backendUserInfo.user.uUser,
          username: backendUserInfo.user.uUser,
          realName: backendUserInfo.user.uName,
          homePath: preferences.app.defaultHomePath,
          avatar: '', // 默认头像
          desc: '', // 用户描述
          token: backendUserInfo.accessToken, // 使用虚拟accessToken
          refreshToken: backendUserInfo.refreshToken, // 使用虚拟refreshToken
          accessTokenExpire: backendUserInfo.accessTokenExpire,
          refreshTokenExpire: backendUserInfo.refreshTokenExpire,
          roles: [],
          permissions: [],
        };

        // 设置虚拟accessToken和refreshToken
        accessStore.setAccessToken(backendUserInfo.accessToken);
        accessStore.setRefreshToken(backendUserInfo.refreshToken);

        // 设置用户信息
        userStore.setUserInfo(userInfo);

        // 设置权限码
        accessStore.setAccessCodes(['admin']);

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
    // 清除所有用户相关的localStorage信息，保留设备ID
    localStorage.removeItem('chat_user_info');
    localStorage.removeItem('chat_user_id');
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_logintime');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpire');
    localStorage.removeItem('refreshTokenExpire');

    // 重置所有 store
    resetAllStores();

    // 确保 accessStore 中的状态被正确重置
    accessStore.setLoginExpired(false);
    accessStore.setAccessToken(null);
    accessStore.setRefreshToken(null);
    accessStore.setAccessCodes([]);
    accessStore.setIsAccessChecked(false);
    accessStore.setAccessMenus([]);
    accessStore.setAccessRoutes([]);

    // 确保 userStore 中的状态被正确重置
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
    // 使用虚拟数据模拟获取用户信息
    const userInfo: UserInfo = {
      userId: 'admin',
      username: 'admin',
      realName: 'Admin',
      homePath: preferences.app.defaultHomePath,
      avatar: '',
      desc: '',
      token: accessStore.accessToken || 'mock_access_token',
      refreshToken: accessStore.refreshToken || 'mock_refresh_token',
      accessTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      refreshTokenExpire: Date.now() + 30 * 24 * 60 * 60 * 1000,
      roles: [],
      permissions: [],
    };
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 获取当前用户信息（使用虚拟数据）
   */
  async function fetchCurrentUser() {
    // 使用虚拟数据模拟获取当前用户信息
    const backendUserInfo = {
      uUser: 'admin',
      uName: 'Admin',
    };
    const userInfo: UserInfo = {
      userId: backendUserInfo.uUser,
      username: backendUserInfo.uUser,
      realName: backendUserInfo.uName,
      homePath: preferences.app.defaultHomePath,
      avatar: '',
      desc: '',
      token: accessStore.accessToken || 'mock_access_token',
      refreshToken: accessStore.refreshToken || 'mock_refresh_token',
      roles: [],
      permissions: [],
    };
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 获取用户权限信息（使用虚拟数据）
   */
  async function fetchPermissions() {
    // 使用虚拟数据模拟获取权限信息
    const mockPermissions = ['admin', 'user', 'system'];
    const mockMenus = [];

    accessStore.setAccessCodes(mockPermissions);
    return { permissions: mockPermissions, menus: mockMenus };
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchCurrentUser,
    fetchPermissions,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
