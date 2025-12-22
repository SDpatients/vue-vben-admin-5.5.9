import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:message-circle',
      order: 4,
      title: $t('page.chat.title'),
      hideInMenu: true,
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
        component: () => import('#/views/chat/pages/ChatDetail.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:message-square',
          title: $t('page.chat.detail'),
          hideInMenu: true,
          hideInTab: true,
        },
      },
      {
        name: 'ContactManagement',
        path: 'contacts',
        component: () => import('#/views/chat/pages/ContactManagement.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.chat.contactManagement'),
        },
      },
      {
        name: 'ContactAdd',
        path: 'contacts/add',
        component: () => import('#/views/chat/pages/ContactEdit.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-plus',
          title: $t('page.chat.contactAdd'),
          hideInMenu: true,
          hideInTab: true,
        },
      },
      {
        name: 'ContactEdit',
        path: 'contacts/edit/:id',
        component: () => import('#/views/chat/pages/ContactEdit.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-edit',
          title: $t('page.chat.contactEdit'),
          hideInMenu: true,
          hideInTab: true,
        },
      },
    ],
  },
];

export default routes;
