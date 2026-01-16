import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:scale',
      order: 2,
      title: $t('page.law.title'),
      roles: ['USER'],
    },
    name: 'Law',
    path: '/law',
    children: [
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
        name: 'LawServiceOfDocuments',
        path: '/service-of-documents',
        component: () => import('#/views/law/service-of-documents/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:mail',
          title: $t('page.law.serviceOfDocuments'),
        },
      },
      {
        name: 'LawServiceOfDocumentsAdd',
        path: '/service-of-documents/add',
        component: () => import('#/views/law/service-of-documents/add.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:plus',
          title: $t('page.law.serviceOfDocumentsAdd'),
          hideInMenu: true,
        },
      },
      {
        name: 'LawServiceOfDocumentsDetail',
        path: '/service-of-documents/:id',
        component: () => import('#/views/law/service-of-documents/detail.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-text',
          title: `${$t('page.law.serviceOfDocuments')} - 详情`,
          hideInMenu: true,
          hideInBreadcrumb: true,
          hideInTab: true,
        },
      },
      {
        name: 'LawServiceOfDocumentsRecords',
        path: '/service-of-documents/:id/records',
        component: () => import('#/views/law/service-of-documents/records.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:history',
          title: `${$t('page.law.serviceOfDocuments')} - 送达记录`,
          hideInMenu: true,
          hideInBreadcrumb: true,
          hideInTab: true,
        },
      },
      {
        name: 'LawAnnouncementList',
        path: '/announcement-list',
        component: () => import('#/views/law/announcement-list/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bell',
          title: '公告列表',
        },
      },
      {
        name: 'LawArchiveManagement',
        path: '/archive-management/:id',
        component: () => import('#/views/law/archive-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:archive',
          title: '案件卷宗归档',
          hideInMenu: true,
          hideInTab: true,
        },
      },
    ],
  },
];

export default routes;
