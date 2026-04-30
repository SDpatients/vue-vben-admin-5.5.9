import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:landmark',
      order: 2,
      title: $t('page.fund.title'),
      hideInMenu: true,
      roles: ['USER'],
    },
    name: 'FundManagementLegacy',
    path: '/fund-management',
    children: [
      {
        name: 'FundAccountLegacy',
        path: 'account',
        component: () => import('#/views/fund/account/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:wallet',
          title: $t('page.fund.account'),
          hideInMenu: true,
        },
      },
      {
        name: 'FundFlowLegacy',
        path: 'flow',
        component: () => import('#/views/fund/flow/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:arrow-left-right',
          title: $t('page.fund.flow'),
          hideInMenu: true,
        },
      },
      {
        name: 'FundReportLegacy',
        path: 'report',
        component: () => import('#/views/fund/report/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bar-chart-3',
          title: $t('page.fund.report'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
