import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:receipt',
      order: 3,
      title: '费用报销',
      roles: ['USER'],
    },
    name: 'ExpenseReimbursement',
    path: '/expense-reimbursement',
    children: [
      {
        name: 'ExpenseReimbursementList',
        path: '',
        component: () => import('#/views/expense-reimbursement/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:list',
          title: '报销单列表',
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
        name: 'ExpenseReimbursementEdit',
        path: 'edit/:id',
        component: () => import('#/views/expense-reimbursement/form.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:edit',
          title: '编辑报销单',
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
];

export default routes;
