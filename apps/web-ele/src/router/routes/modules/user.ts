import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 4,
      title: $t('page.user.title'),
      hideInMenu: true,
      authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
    },
    name: 'UserLegacy',
    path: '/user',
    children: [
      {
        name: 'UserManagementLegacy',
        path: '/management',
        component: () => import('#/views/user/management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-cog',
          title: $t('page.user.management'),
          hideInMenu: true,
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'UserProfileLegacy',
        path: 'profile',
        component: () => import('#/views/user/profile/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user',
          title: $t('page.user.profile'),
          hideInMenu: true,
          authority: [],
        },
      },
    ],
  },
];

export default routes;
