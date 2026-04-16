import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

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
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
      {
        name: 'TemplateManagement',
        path: '/template-management',
        component: () => import('#/views/_core/fallback/building.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '模板管理',
        },
      },
      {
        name: 'UserProfile',
        path: 'profile',
        component: () => import('#/views/user/profile/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round-pen',
          title: '个人中心',
        },
      },
      {
        name: 'SystemMonitor',
        path: 'system-monitor',
        component: () => import('#/views/dashboard/system-monitor/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:activity',
          title: '系统健康监控',
          roles: ['超级管理员', '管理员'],
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

];


export default routes;
