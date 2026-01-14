import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:message-circle',
      order: 4,
      title: $t('page.chat.title'),
      hideInMenu: false,
    },
    name: 'Chat',
    path: '/chat',
    children: [
      {
        name: 'ChatHome',
        path: '',
        component: () => import('#/views/chat/pages/ChatHome.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:home',
          title: $t('page.chat.home'),
        },
      },
      {
        name: 'ChatDetail',
        path: 'contact/:id',
        component: () => import('#/views/chat/pages/ChatHome.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:message-square',
          title: $t('page.chat.detail'),
          hideInMenu: true,
          hideInTab: true,
        },
      },
    ],
  },
];

export default routes;
