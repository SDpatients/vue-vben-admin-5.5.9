import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, logoutApi } from '#/api';
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
          userId: backendUserInfo.U_USER,
          username: backendUserInfo.U_USER,
          realName: backendUserInfo.U_NAME,
          homePath: preferences.app.defaultHomePath,
          avatar: '', // 默认头像
          desc: '', // 用户描述
          token: backendUserInfo.token, // 使用后端返回的accessToken
          // 其他必要字段
        };

        // 设置从后端获取的accessToken
        accessStore.setAccessToken(backendUserInfo.token);

        // 设置用户信息
        userStore.setUserInfo(userInfo);

        // 设置模拟权限码
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
        const errorMsg =
          result?.error ||
          $t('authentication.passwordErrorTip');
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
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
