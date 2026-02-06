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
        component: () => import('#/views/dashboard/template-management/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '模板管理',
        },
      },
    ],
  },
  {
    name: 'WebSocketTest',
    path: '/websocket-test',
    component: () => import('#/views/dashboard/websocket-test/index.vue'),
    meta: {
      icon: 'lucide:radio',
      title: 'WebSocket测试',
      ignoreAccess: true, // 允许未登录访问，用于手机扫码上传
      roles: undefined, // 明确覆盖父路由的roles要求
    },
  },
  {
    name: 'MobileUpload',
    path: '/mobile-upload',
    component: () => import('#/views/dashboard/mobile-upload/index.vue'),
    meta: {
      icon: 'lucide:smartphone',
      title: '手机上传',
      ignoreAccess: true, // 允许未登录访问，用于手机扫码上传
      roles: undefined, // 明确覆盖父路由的roles要求
    },
  },
  {
    name: 'EasyExcelTest',
    path: '/easy-excel-test',
    component: () => import('#/views/dashboard/easy-excel-test/index.vue'),
    meta: {
      icon: 'lucide:file-spreadsheet',
      title: 'EasyExcel测试',
    },
  },

];


export default routes;
