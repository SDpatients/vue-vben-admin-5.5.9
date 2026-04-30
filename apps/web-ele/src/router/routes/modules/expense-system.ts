import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:wallet',
      order: 3,
      title: $t('page.expenseSystem.title'),
      roles: ['USER'],
    },
    name: 'ExpenseSystem',
    path: '/expense-system',
    children: [
      {
        name: 'ExpenseReimbursement',
        path: 'expense-reimbursement',
        redirect: '/expense-system/expense-reimbursement/list',
        meta: {
          icon: 'lucide:receipt',
          title: $t('page.expenseSystem.expenseManagement'),
        },
        children: [
          {
            name: 'ExpenseReimbursementList',
            path: 'list',
            component: () => import('#/views/expense-reimbursement/index.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:list',
              title: $t('page.expenseSystem.reimbursementList'),
            },
          },
          {
            name: 'ExpenseReimbursementAdd',
            path: 'add',
            component: () => import('#/views/expense-reimbursement/form.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:plus',
              title: '新增报销单',
              hideInMenu: true,
              hideInTab: true,
            },
          },
          {
            name: 'ExpenseReimbursementDetail',
            path: 'detail/:id',
            component: () => import('#/views/expense-reimbursement/detail.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:file-text',
              title: '报销单详情',
              hideInMenu: true,
              hideInTab: true,
            },
          },
        ],
      },
      {
        name: 'ApprovalManagement',
        path: 'approval',
        redirect: '/expense-system/approval/document',
        meta: {
          icon: 'lucide:clipboard-check',
          title: $t('page.expenseSystem.approvalManagement'),
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
        children: [
          {
            name: 'DocumentApproval',
            path: 'document',
            component: () => import('#/views/approval/document/index.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:file-check',
              title: $t('page.expenseSystem.documentApproval'),
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
              title: $t('page.expenseSystem.caseApproval'),
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
              title: $t('page.expenseSystem.expenseApproval'),
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
      {
        name: 'TemplateManagement',
        path: 'template-management',
        component: () => import('#/views/dashboard/template-management/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.expenseSystem.templateManagement'),
        },
      },
      {
        name: 'UserProfile',
        path: 'user-profile',
        component: () => import('#/views/user/profile/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round-pen',
          title: $t('page.expenseSystem.userProfile'),
        },
      },
    ],
  },
];

export default routes;
