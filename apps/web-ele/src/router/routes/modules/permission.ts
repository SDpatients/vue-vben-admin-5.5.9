import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shield-check',
      order: 3,
      title: $t('page.permission.title'),
    },
    name: 'Permission',
    path: '/permission',
    children: [
      {
        name: 'PermissionIndex',
        path: '/permission',
        component: () => import('#/views/permission/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.permission.index'),
        },
      },
    ],
  },
];

export default routes;
