import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:user-round-pen',
      order: 1,
      title: $t('page.user.profile'),
    },
    name: 'UserProfile',
    path: '/profile',
    children: [
      {
        name: 'UserProfileIndex',
        path: '',
        component: () => import('#/views/user/profile/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round-pen',
          title: $t('page.user.profile'),
        },
      },
    ],
  },
];

export default routes;
