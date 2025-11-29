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
          affixTab: true,
          icon: 'lucide:file-text',
          title: $t('page.law.test'),
        },
      },
      {
        name: 'LawCaseManagement',
        path: '/case-management',
        component: () => import('#/views/law/case-management/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:folder-open',
          title: $t('page.law.caseManagement'),
        },
      },
    ],
  },
];

export default routes;