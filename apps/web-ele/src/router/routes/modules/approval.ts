import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 11,
      title: '批审管理',
      hideInMenu: true,
      authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
    },
    name: 'ApprovalManagementLegacy',
    path: '/approval',
    children: [
      {
        name: 'DocumentApprovalLegacy',
        path: '/approval/document',
        component: () => import('#/views/approval/document/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-check',
          title: '文书审批',
          hideInMenu: true,
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'CaseApprovalLegacy',
        path: '/approval/case',
        component: () => import('#/views/approval/case/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:briefcase',
          title: '案件审批',
          hideInMenu: true,
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'ExpenseApprovalLegacy',
        path: '/approval/expense',
        component: () => import('#/views/approval/expense/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:receipt',
          title: '报销批审',
          hideInMenu: true,
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
      {
        name: 'ApprovalDetailLegacy',
        path: '/approval/detail/:approvalId',
        component: () => import('#/views/approval/detail-view.vue'),
        meta: {
          affixTab: false,
          hideInMenu: true,
          hideInTab: true,
          icon: 'lucide:file-text',
          title: '审批详情',
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
        },
      },
    ],
  },
];

export default routes;
