import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 11,
      title: '批审管理',
      roles: ['ADMIN'],
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
        },
      },
    ],
  },
];

export default routes;