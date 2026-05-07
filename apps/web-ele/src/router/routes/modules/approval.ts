import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 4,
      title: $t('page.approval.title'),
      authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
    },
    name: 'ApprovalManagement',
    path: '/approval',
    redirect: '/approval/document',
    children: [
      {
        name: 'DocumentApproval',
        path: 'document',
        component: () => import('#/views/approval/document/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-check',
          title: $t('page.approval.documentApproval'),
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'CaseApproval',
        path: 'case',
        component: () => import('#/views/approval/case/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:briefcase',
          title: $t('page.approval.caseApproval'),
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'ExpenseApproval',
        path: 'expense',
        component: () => import('#/views/approval/expense/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:receipt',
          title: $t('page.approval.expenseApproval'),
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'ApprovalDetail',
        path: 'detail/:approvalId',
        component: () => import('#/views/approval/detail-view.vue'),
        meta: {
          affixTab: false,
          hideInMenu: true,
          icon: 'lucide:file-text',
          title: '审批详情',
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
    ],
  },
];

export default routes;
