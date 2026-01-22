import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bell',
      order: 10,
      title: $t('page.notification.title'),
      roles: ['ADMIN'],
      hideInMenu: true,
    },
    name: 'Notification',
    path: '/notification',
    children: [
      {
        name: 'NotificationCenter',
        path: '/notification/index',
        component: () => import('#/views/notification/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bell',
          title: '通知中心',
        },
      },
    ],
  },
];

export default routes;
