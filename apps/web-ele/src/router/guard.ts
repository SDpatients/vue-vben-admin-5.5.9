import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { selectLoginRecordApi } from '#/api/core/auth';
import { LICENSE_PATH } from '#/router/routes/core';
import { coreRouteNames, getAccessRoutes } from '#/router/routes';
import { useAuthStore, useLicenseStore } from '#/store';

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

    // 优先检查ignoreAccess，确保即使没有accessToken也能访问
    if (to.meta.ignoreAccess) {
      console.log('Route ignoreAccess is true for:', to.path);
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
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
    const userRoles = userInfo?.roles ?? [];

    // 异步加载路由模块
    const accessRoutes = await getAccessRoutes();

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

    let redirectPath = to.fullPath;
    
    if (to.query.redirect) {
      redirectPath = decodeURIComponent(to.query.redirect as string);
    } else if (from.query.redirect) {
      redirectPath = decodeURIComponent(from.query.redirect as string);
    } else if (to.path === preferences.app.defaultHomePath) {
      redirectPath = userInfo?.homePath || preferences.app.defaultHomePath;
    }

    console.log('[RouterGuard] Final redirect path:', redirectPath);

    return {
      ...router.resolve(redirectPath),
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
      console.log('ChatGuard: Checking chat route:', to.path);
      // 检查本地存储中是否有登录信息
      const chatUserId = localStorage.getItem('chat_user_id');
      const chatLogintime = localStorage.getItem('chat_logintime');
      const chatUsername = localStorage.getItem('chat_username');
      
      console.log('ChatGuard: chatUserId:', chatUserId);
      console.log('ChatGuard: chatLogintime:', chatLogintime);
      console.log('ChatGuard: chatUsername:', chatUsername);
      
      // 如果本地没有登录信息，尝试从后端获取
      if (!chatUserId || !chatLogintime) {
        if (!chatUsername) {
          // 如果没有用户名，跳转到登录页面
          console.log('ChatGuard: No chat username, redirecting to login');
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
            console.log('ChatGuard: No token in localStorage, redirecting to login');
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
            
            console.log('ChatGuard: Chat user info loaded, allowing access');
            // 继续访问聊天页面
            return true;
          } else {
            // 后端也没有记录，跳转到登录页面
            console.log('ChatGuard: No chat records, redirecting to login');
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
      
      console.log('ChatGuard: Chat user exists, allowing access');
      // 不是聊天相关路由，直接通过
      return true;
    }
    
    console.log('ChatGuard: Not a chat route, allowing access:', to.path);
    // 不是聊天相关路由，直接通过
    return true;
  });
}

/**
 * 案件详情页面权限守卫配置
 * 用于在进入案件详情页面前进行基本的权限检查
 * 注意：具体的案件访问权限检查在页面组件中进行
 * @param router
 */
function setupCaseDetailGuard(router: Router) {
  router.beforeEach(async (to) => {
    if (to.name === 'LawCaseDetail') {
      const caseId = to.params.id;
      
      if (!caseId || Number.isNaN(Number.parseInt(caseId as string, 10))) {
        console.log('CaseDetailGuard: Invalid case ID:', caseId);
        return {
          path: '/law/case-management',
          replace: true,
        };
      }
      
      console.log('CaseDetailGuard: Valid case ID, proceeding to page for permission check:', caseId);
      return true;
    }
    
    return true;
  });
}

/**
 * 许可证守卫配置
 * 检查许可证是否有效，无效则跳转到许可证激活页面
 * @param router
 */
function setupLicenseGuard(router: Router) {
  router.beforeEach(async (to) => {
    console.log('LicenseGuard: 检查路由', to.path);

    // 如果已经在许可证页面，不跳转
    if (to.path === LICENSE_PATH) {
      console.log('LicenseGuard: 已在许可证页面，放行');
      return true;
    }

    // 如果页面明确标记为忽略访问控制（如许可证页面），不检查
    if (to.meta.ignoreAccess) {
      console.log('LicenseGuard: 页面标记为ignoreAccess，放行');
      return true;
    }

    const licenseStore = useLicenseStore();

    // 如果还没有检查过许可证状态，先获取
    if (!licenseStore.licenseChecked) {
      console.log('LicenseGuard: 正在获取许可证状态...');
      try {
        await licenseStore.fetchLicenseStatus();
        console.log('LicenseGuard: 许可证状态获取完成', licenseStore.licenseStatus);
      } catch (error) {
        console.error('LicenseGuard: 检查许可证状态失败:', error);
      }
    }

    // 如果许可证无效，跳转到许可证页面
    if (!licenseStore.isValid()) {
      console.log('LicenseGuard: 许可证无效，跳转到许可证页面');
      return {
        path: LICENSE_PATH,
        replace: true,
      };
    }

    console.log('LicenseGuard: 许可证有效，放行');

    // 检查模块级权限
    if (to.meta.requiredModules && Array.isArray(to.meta.requiredModules)) {
      const requiredModules = to.meta.requiredModules as string[];
      const hasAllModules = requiredModules.every((mod) =>
        licenseStore.hasModule(mod),
      );

      if (!hasAllModules) {
        console.log('LicenseGuard: 缺少必要的模块授权:', requiredModules);
        return {
          path: '/fallback/forbidden',
          replace: true,
        };
      }
    }

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
  /** 许可证检查 - 必须在权限访问守卫之前执行 */
  setupLicenseGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
  /** 聊天功能 */
  setupChatGuard(router);
  /** 案件详情权限 */
  setupCaseDetailGuard(router);
}

export { createRouterGuard };
