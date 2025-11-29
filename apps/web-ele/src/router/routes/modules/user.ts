import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 3,
      title: $t('page.user.title'),
    },
    name: 'User',
    path: '/user',
    children: [
      {
        name: 'UserManagement',
        path: '/management',
        component: () => import('#/views/user/management/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:user-cog',
          title: $t('page.user.management'),
        },
      },
    ],
  },
];

export default routes;