import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:scale',
      order: 1,
      title: $t('page.law.title'),
      roles: ['USER'],
    },
    name: 'Law',
    path: '/law',
    children: [
      {
        name: 'LawCaseList',
        path: 'case-list',
        component: () => import('#/views/law/case-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:folder-open',
          title: $t('page.law.caseList'),
        },
      },
      {
        name: 'LawCaseDetail',
        path: 'case-detail/:id',
        component: () => import('#/views/law/case-detail/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-text',
          title: $t('page.law.caseDetail'),
          hideInMenu: true,
          hideInTab: true,
        },
      },
      {
        name: 'LawCaseAdd',
        path: 'case-add',
        component: () => import('#/views/law/case-add/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:plus',
          title: $t('page.law.caseAdd'),
          hideInMenu: true,
        },
      },
      {
        name: 'LawCreditorManagement',
        path: 'creditor-management',
        component: () => import('#/views/basic-data/creditor-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.law.creditorManagement'),
        },
      },
      {
        name: 'LawDebtorManagement',
        path: 'debtor-management',
        component: () => import('#/views/basic-data/debtor-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-minus',
          title: $t('page.law.debtorManagement'),
        },
      },
      {
        name: 'LawCourtManagement',
        path: 'court-management',
        component: () => import('#/views/basic-data/court-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:scale',
          title: $t('page.law.courtManagement'),
        },
      },
      {
        name: 'LawManagerInfo',
        path: 'manager-info',
        component: () => import('#/views/basic-data/manager-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user',
          title: $t('page.law.managerInfo'),
        },
      },
      {
        name: 'LawWorkPlanManagement',
        path: 'work-plan-management',
        component: () => import('#/views/basic-data/work-plan-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('page.law.workPlanManagement'),
        },
      },
      {
        name: 'LawStaffManagement',
        path: 'staff-management',
        component: () => import('#/views/basic-data/staff-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('page.law.staffManagement'),
        },
      },
      {
        name: 'LawAnnouncementList',
        path: 'announcement-list',
        component: () => import('#/views/law/announcement-list/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bell',
          title: $t('page.law.announcement'),
        },
      },
      {
        name: 'LawArchiveManagement',
        path: 'archive-management/:id',
        component: () => import('#/views/law/archive-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:archive',
          title: '案件卷宗归档',
          hideInMenu: true,
          hideInTab: true,
        },
      },
      {
        name: 'LawBankruptcyProcess',
        path: 'bankruptcy-process/:id',
        component: () => import('#/views/law/bankruptcy-process/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:workflow',
          title: '破产案件流程处理',
          hideInMenu: true,
          hideInTab: true,
        },
      },
    ],
  },
];

export default routes;
