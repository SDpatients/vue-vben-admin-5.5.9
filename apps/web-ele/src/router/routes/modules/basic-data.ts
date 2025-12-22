import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:database',
      order: 3,
      title: $t('page.basicData.title'),
    },
    name: 'BasicData',
    path: '/basic-data',
    children: [
      {
        name: 'BasicDataCreditorManagement',
        path: 'creditor-management',
        component: () =>
          import('#/views/basic-data/creditor-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.basicData.creditorManagement'),
        },
      },

      {
        name: 'BasicDataDebtorManagement',
        path: 'debtor-management',
        component: () =>
          import('#/views/basic-data/debtor-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-minus',
          title: $t('page.basicData.debtorManagement'),
        },
      },

      {
        name: 'BasicDataCourtManagement',
        path: 'court-management',
        component: () =>
          import('#/views/basic-data/court-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:scale',
          title: $t('page.basicData.courtManagement'),
        },
      },

      {
        name: 'BasicDataBankAccountManagement',
        path: 'bank-account-management',
        component: () =>
          import('#/views/basic-data/bank-account-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:credit-card',
          title: $t('page.basicData.bankAccountManagement'),
        },
      },

      {
        name: 'BasicDataWorkPlanManagement',
        path: 'work-plan-management',
        component: () =>
          import('#/views/basic-data/work-plan-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('page.basicData.workPlanManagement'),
        },
      },

      {
        name: 'BasicDataWorkTeamManagement',
        path: 'work-team-management',
        component: () =>
          import('#/views/basic-data/work-team-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.basicData.workTeamManagement'),
        },
        children: [
          {
            name: 'BasicDataWorkTeamEdit',
            path: 'edit/:sepId',
            component: () =>
              import('#/views/basic-data/work-team-management/WorkTeamEdit.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:edit',
              title: $t('page.basicData.workTeamEdit'),
            },
          },
        ],
      },
    ],
  },
];

export default routes;
