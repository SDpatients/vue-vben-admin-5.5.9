import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_ANT_PREVIEW_URL,
  VBEN_DOC_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
} from '@vben/constants';
import { SvgAntdvLogoIcon } from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      icon: VBEN_LOGO_URL,
      order: 9998,
      title: $t('demos.vben.title'),
    },
    name: 'VbenProject',
    path: '/vben-admin',
    children: [
      {
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: VBEN_DOC_URL,
          title: $t('demos.vben.document'),
        },
      },
      {
        name: 'VbenGithub',
        path: '/vben-admin/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: VBEN_GITHUB_URL,
          title: 'Github',
        },
      },
      {
        name: 'VbenNaive',
        path: '/vben-admin/naive',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: 'logos:naiveui',
          link: VBEN_NAIVE_PREVIEW_URL,
          title: $t('demos.vben.naive-ui'),
        },
      },
      {
        name: 'VbenAntd',
        path: '/vben-admin/antd',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: SvgAntdvLogoIcon,
          link: VBEN_ANT_PREVIEW_URL,
          title: $t('demos.vben.antdv'),
        },
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:info',
      order: 9999,
      title: $t('demos.vben.aboutUs'),
    },
    name: 'VbenAboutUs',
    path: '/about-us',
    children: [
      {
        name: 'VbenAbout',
        path: '/about-us/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          title: $t('demos.vben.about'),
        },
      },
      {
        name: 'VbenProductIntro',
        path: '/about-us/product-intro',
        component: () => import('#/views/_core/about/product-intro.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: $t('demos.vben.productIntro'),
        },
      },
      {
        name: 'VbenChangelog',
        path: '/about-us/changelog',
        component: () => import('#/views/_core/about/changelog.vue'),
        meta: {
          icon: 'lucide:scroll-text',
          title: $t('demos.vben.changelog'),
        },
      },
    ],
  },
];

export default routes;
