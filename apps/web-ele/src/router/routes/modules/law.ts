import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:scale',
      order: 2,
      title: $t('page.law.title'),
    },
    name: 'Law',
    path: '/law',
    children: [
      {
        name: 'LawTest',
        path: '/test',
        component: () => import('#/views/law/test.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-text',
          title: $t('page.law.test'),
        },
      },
      {
        name: 'LawCaseManagement',
        path: '/case-management',
        component: () => import('#/views/law/case-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:folder-open',
          title: $t('page.law.caseManagement'),
        },
      },
      {
        name: 'LawCaseDetail',
        path: '/case-detail/:id',
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
        path: '/case-add',
        component: () => import('#/views/law/case-add/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:plus',
          title: $t('page.law.caseAdd'),
          hideInMenu: true,
        },
      },
      {
        name: 'LawTaskEdit',
        path: '/case-detail/:caseId/task/:taskId/edit',
        component: () => import('#/views/law/case-detail/TaskEdit.vue'),
        meta: {
          affixTab: false,
          hideInTab: true,
          icon: 'lucide:edit-3',
          title: $t('page.law.taskEdit'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
