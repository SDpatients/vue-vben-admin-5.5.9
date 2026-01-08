import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { ElMessage } from 'element-plus';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { isAdmin } from '#/utils/role';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // 获取当前用户角色
  const isUserAdmin = isAdmin();

  // 过滤路由：根据角色显示/隐藏对应的菜单
  const filteredRoutes = options.routes.filter((route) => {
    const routeRoles = route.meta?.roles as string[] | undefined;

    // 如果没有设置roles，默认显示
    if (!routeRoles || routeRoles.length === 0) {
      return true;
    }

    // 如果是管理员，显示所有标记为ADMIN的路由
    if (isUserAdmin && routeRoles.includes('ADMIN')) {
      return true;
    }

    // 如果是普通用户，显示所有标记为USER的路由
    if (!isUserAdmin && routeRoles.includes('USER')) {
      return true;
    }

    // 其他情况不显示
    return false;
  });

  // 直接使用前端路由配置，不从后端获取菜单
  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    routes: filteredRoutes,
    fetchMenuListAsync: async () => {
      ElMessage({
        duration: 1500,
        message: `${$t('common.loadingMenu')}...`,
      });
      return [];
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
