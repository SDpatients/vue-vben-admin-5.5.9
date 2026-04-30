import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:database',
      order: 2,
      title: $t('page.basicData.title'),
      roles: ['USER'],
    },
    name: 'BasicControl',
    path: '/basic-control',
    children: [
      {
        name: 'BasicInfoMaintenance',
        path: 'info-maintenance',
        component: () => import('#/views/_core/fallback/building.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:settings',
          title: $t('page.basicData.infoMaintenance'),
        },
      },
      {
        name: 'DocumentLibrary',
        path: 'document-library',
        redirect: '/basic-control/document-library/dashboard',
        meta: {
          icon: 'lucide:folder-archive',
          title: $t('page.documentLibrary.title'),
        },
        children: [
          {
            name: 'DocumentLibraryDashboard',
            path: 'dashboard',
            component: () => import('#/views/document-library/dashboard.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:layout-dashboard',
              title: $t('page.documentLibrary.dashboard'),
            },
          },
          {
            name: 'DocumentLibraryManagement',
            path: 'management',
            component: () => import('#/views/document-library/index.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:folder-open',
              title: $t('page.documentLibrary.management'),
            },
          },
          {
            name: 'DocumentLibraryFavorites',
            path: 'favorites',
            component: () => import('#/views/document-library/favorites.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:star',
              title: $t('page.documentLibrary.favorites'),
            },
          },
          {
            name: 'DocumentLibrarySearch',
            path: 'search',
            component: () => import('#/views/document-library/search.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:search',
              title: $t('page.documentLibrary.search'),
            },
          },
        ],
      },
      {
        name: 'BankAccountManagement',
        path: 'bank-account-management',
        component: () =>
          import('#/views/basic-data/bank-account-management/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:credit-card',
          title: $t('page.basicData.bankAccountManagement'),
        },
      },
    ],
  },
];

export default routes;
