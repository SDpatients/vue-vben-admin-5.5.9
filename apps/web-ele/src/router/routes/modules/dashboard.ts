import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// 预导入待办事项页面组件，避免动态导入问题
import TodoItemsPage from '#/views/dashboard/activity-todo/index.vue';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
      roles: ['USER'],
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'CaseOverview',
        path: 'overview',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.overview'),
        },
      },
      {
        name: 'DataDashboard',
        path: 'data-dashboard',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'TodoItems',
        path: 'todo-items',
        component: TodoItemsPage,
        meta: {
          affixTab: false,
          icon: 'lucide:list-checks',
          title: $t('page.dashboard.todo'),
        },
      },
      {
        name: 'NodeWarnings',
        path: 'node-warnings',
        component: () => import('#/views/dashboard/node-warning/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:alert-triangle',
          title: $t('page.dashboard.warning'),
        },
      },
    ],
  },
  {
    name: 'MobileUpload',
    path: '/mobile-upload',
    component: () => import('#/views/dashboard/mobile-upload/index.vue'),
    meta: {
      icon: 'lucide:smartphone',
      title: '手机上传',
      hideInMenu: true,
      ignoreAccess: true,
      roles: undefined,
    },
  },
  {
    name: 'WorkspaceLegacy',
    path: '/workspace',
    component: () => import('#/views/dashboard/workspace/index.vue'),
    meta: {
      icon: 'carbon:workspace',
      title: '工作台',
      hideInMenu: true,
      hideInTab: true,
    },
  },
  {
    name: 'AnalyticsLegacy',
    path: '/analytics',
    component: () => import('#/views/dashboard/analytics/index.vue'),
    meta: {
      icon: 'lucide:area-chart',
      title: '分析页',
      hideInMenu: true,
      hideInTab: true,
    },
  },

];


export default routes;
