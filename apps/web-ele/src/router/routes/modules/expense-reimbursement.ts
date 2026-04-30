import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:receipt',
      order: 3,
      title: '费用报销',
      hideInMenu: true,
      roles: ['USER'],
    },
    name: 'ExpenseReimbursementLegacy',
    path: '/expense-reimbursement',
    children: [
      {
        name: 'ExpenseReimbursementListLegacy',
        path: '',
        component: () => import('#/views/expense-reimbursement/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:list',
          title: '报销单列表',
          hideInMenu: true,
        },
      },
      {
        name: 'ExpenseReimbursementAddLegacy',
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
        name: 'ExpenseReimbursementDetailLegacy',
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
