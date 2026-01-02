import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getCurrentUserApi,
  getPermissionsApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
} from '#/api';
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
      const result = await loginApi(params);

      // 检查返回的数据结构
      if (result && result.status === '1' && result.data) {
        // 登录成功，使用后端返回的用户信息
        const backendUserInfo = result.data;

        // 将用户信息转换为系统需要的格式
        userInfo = {
          userId: backendUserInfo.user.uUser,
          username: backendUserInfo.user.uUser,
          realName: backendUserInfo.user.uName,
          homePath: preferences.app.defaultHomePath,
          avatar: '', // 默认头像
          desc: '', // 用户描述
          token: backendUserInfo.accessToken, // 使用后端返回的accessToken
          refreshToken: backendUserInfo.refreshToken, // 使用后端返回的refreshToken
          accessTokenExpire: backendUserInfo.accessTokenExpire,
          refreshTokenExpire: backendUserInfo.refreshTokenExpire,
          roles: [],
          permissions: [],
        };

        // 设置从后端获取的accessToken和refreshToken
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
      } else {
        // 登录失败，显示错误信息
        const errorMsg = result?.error || $t('authentication.passwordErrorTip');
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
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

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
      userInfo = await getUserInfoApi();
      userStore.setUserInfo(userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
    return userInfo;
  }

  /**
   * 获取当前用户信息（从后端API）
   */
  async function fetchCurrentUser() {
    try {
      const result = await getCurrentUserApi();
      if (result && result.status === '1' && result.data) {
        const backendUserInfo = result.data;
        const userInfo: UserInfo = {
          userId: backendUserInfo.uUser,
          username: backendUserInfo.uUser,
          realName: backendUserInfo.uName,
          homePath: preferences.app.defaultHomePath,
          avatar: '',
          desc: '',
          token: accessStore.accessToken || '',
          refreshToken: accessStore.refreshToken || '',
          roles: [],
          permissions: [],
        };
        userStore.setUserInfo(userInfo);
        return userInfo;
      }
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
    }
    return null;
  }

  /**
   * 获取用户权限信息
   */
  async function fetchPermissions() {
    try {
      const result = await getPermissionsApi();
      if (result && result.status === '1' && result.data) {
        const { permissions, menus } = result.data;
        
        const accessCodes = permissions || [];
        
        if (menus && menus.length > 0) {
          const extractPermCodes = (menuList: any[]): string[] => {
            const codes: string[] = [];
            menuList.forEach((menu) => {
              if (menu.permCode) {
                codes.push(menu.permCode);
              }
              if (menu.children && menu.children.length > 0) {
                codes.push(...extractPermCodes(menu.children));
              }
            });
            return codes;
          };
          
          accessCodes.push(...extractPermCodes(menus));
        }
        
        accessStore.setAccessCodes(accessCodes);
        return { permissions, menus };
      }
    } catch (error) {
      console.error('获取权限信息失败:', error);
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
    fetchPermissions,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
