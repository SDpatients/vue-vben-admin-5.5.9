import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 11,
      title: '批审管理',
      authority: ['ADMIN'],
    },
    name: 'ApprovalManagement',
    path: '/approval',
    children: [
      {
        name: 'DocumentApproval',
        path: '/approval/document',
        component: () => import('#/views/approval/document/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-check',
          title: '文书审批',
          authority: ['ADMIN'],
        },
      },
      {
        name: 'CaseApproval',
        path: '/approval/case',
        component: () => import('#/views/approval/case/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:briefcase',
          title: '案件审批',
          authority: ['ADMIN'],
        },
      },
    ],
  },
];

export default routes;
