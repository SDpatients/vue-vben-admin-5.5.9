import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bank',
      order: 4,
      title: $t('page.fund.title'),
    },
    name: 'Fund',
    path: '/fund',
    children: [
      {
        name: 'FundAccount',
        path: 'account',
        component: () => import('#/views/fund/account/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:banknote',
          title: $t('page.fund.account'),
        },
      },
      {
        name: 'FundFlow',
        path: 'flow',
        component: () => import('#/views/fund/flow/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:arrow-up-down',
          title: $t('page.fund.flow'),
        },
      },
      {
        name: 'FundReport',
        path: 'report',
        component: () => import('#/views/fund/report/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bar-chart-3',
          title: $t('page.fund.report'),
        },
      },
    ],
  },
];

export default routes;
