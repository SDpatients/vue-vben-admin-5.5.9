import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { selectLoginRecordApi } from '#/api/core/auth';
import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 检查token是否过期
    const accessTokenExpire = localStorage.getItem('accessTokenExpire');
    if (accessTokenExpire) {
      const expireTime = parseInt(accessTokenExpire, 10);
      const currentTime = Date.now();
      // 如果token已过期，跳转登录页
      if (currentTime >= expireTime) {
        await authStore.logout(false);
        return {
          path: LOGIN_PATH,
          query: { redirect: encodeURIComponent(to.fullPath) },
          replace: true,
        };
      }
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 聊天功能守卫配置
 * @param router
 */
function setupChatGuard(router: Router) {
  router.beforeEach(async (to) => {
    // 检查是否是聊天相关路由
    if (to.path.startsWith('/chat')) {
      // 检查本地存储中是否有登录信息
      const chatUserId = localStorage.getItem('chat_user_id');
      const chatLogintime = localStorage.getItem('chat_logintime');
      const chatUsername = localStorage.getItem('chat_username');

      // 如果本地没有登录信息，尝试从后端获取
      if (!chatUserId || !chatLogintime) {
        if (!chatUsername) {
          // 如果没有用户名，跳转到登录页面
          return {
            path: LOGIN_PATH,
            query: { redirect: encodeURIComponent(to.fullPath) },
            replace: true,
          };
        }

        try {
          // 调用后端查询登录记录接口，使用从登录接口返回的token
          const token = localStorage.getItem('token');
          if (!token) {
            return {
              path: LOGIN_PATH,
              query: { redirect: encodeURIComponent(to.fullPath) },
              replace: true,
            };
          }

          const result = await selectLoginRecordApi(
            {
              username: chatUsername,
              page: 1,
              size: 1,
            },
            token,
          );

          if (
            result.status === '1' &&
            result.data?.records &&
            result.data.records.length > 0
          ) {
            // 从记录中获取最新的登录信息
            const latestRecord = result.data.records[0];

            // 存储到本地存储
            if (latestRecord) {
              localStorage.setItem('chat_user_id', latestRecord.userid);
              localStorage.setItem('chat_logintime', latestRecord.logintime);
            }

            // 继续访问聊天页面
            return true;
          } else {
            // 后端也没有记录，跳转到登录页面
            return {
              path: LOGIN_PATH,
              query: { redirect: encodeURIComponent(to.fullPath) },
              replace: true,
            };
          }
        } catch (error) {
          console.error('查询登录记录失败:', error);
          // 查询失败，跳转到登录页面
          return {
            path: LOGIN_PATH,
            query: { redirect: encodeURIComponent(to.fullPath) },
            replace: true,
          };
        }
      }
    }

    // 不是聊天相关路由，直接通过
    return true;
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
  /** 聊天功能 */
  setupChatGuard(router);
}

export { createRouterGuard };
