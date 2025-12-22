import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:credit-card',
      order: 3,
      title: $t('page.payment.title'),
      hideInMenu: true,
    },
    name: 'Payment',
    path: '/payment',
    children: [
      {
        name: 'PaymentIndex',
        path: '',
        component: () => import('#/views/payment/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:list',
          title: $t('page.payment.list'),
        },
      },
      {
        name: 'PaymentDetail',
        path: 'detail/:id',
        component: () => import('#/views/payment/detail.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-text',
          title: $t('page.payment.detail'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
