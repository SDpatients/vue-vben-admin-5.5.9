import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 3,
      title: $t('page.user.title'),
      authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
    },
    name: 'User',
    path: '/user',
    children: [
      {
        name: 'UserManagement',
        path: '/management',
        component: () => import('#/views/user/management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-cog',
          title: $t('page.user.management'),
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
    ],
  },
];

export default routes;
