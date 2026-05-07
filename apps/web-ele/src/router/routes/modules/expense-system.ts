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
