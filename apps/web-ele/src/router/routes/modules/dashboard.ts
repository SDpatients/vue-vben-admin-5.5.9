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
        name: 'OperationRecord',
        path: '/operation-record',
        component: () => import('#/views/dashboard/operation-record/index.vue'),
        meta: {
          icon: 'lucide:clock',
          title: '操作记录',
        },
      },
      {
        name: 'ActivityTodo',
        path: '/activity-todo',
        component: () => import('#/views/dashboard/activity-todo/index.vue'),
        meta: {
          icon: 'lucide:activity',
          title: '动态与待办',
        },
      },
      {
        name: 'FileUploadTest',
        path: '/file-upload-test',
        component: () => import('#/views/test/file-upload-test.vue'),
        meta: {
          icon: 'lucide:upload-cloud',
          title: '文件上传测试',
        },
      },
    ],
  },
];

export default routes;
