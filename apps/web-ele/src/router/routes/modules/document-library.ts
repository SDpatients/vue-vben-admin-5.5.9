import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:folder-archive',
      order: 1,
      title: $t('page.documentLibrary.title'),
      hideInMenu: true,
      roles: ['USER'],
    },
    name: 'DocumentLibraryLegacy',
    path: '/document-library',
    children: [
      {
        name: 'DocumentLibraryDashboardLegacy',
        path: 'dashboard',
        component: () => import('#/views/document-library/dashboard.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:layout-dashboard',
          title: $t('page.documentLibrary.dashboard'),
          hideInMenu: true,
        },
      },
      {
        name: 'DocumentLibraryManagementLegacy',
        path: 'management',
        component: () => import('#/views/document-library/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:folder-open',
          title: $t('page.documentLibrary.management'),
          hideInMenu: true,
        },
      },
      {
        name: 'DocumentLibraryFavoritesLegacy',
        path: 'favorites',
        component: () => import('#/views/document-library/favorites.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:star',
          title: $t('page.documentLibrary.favorites'),
          hideInMenu: true,
        },
      },
      {
        name: 'DocumentLibrarySearchLegacy',
        path: 'search',
        component: () => import('#/views/document-library/search.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:search',
          title: $t('page.documentLibrary.search'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
