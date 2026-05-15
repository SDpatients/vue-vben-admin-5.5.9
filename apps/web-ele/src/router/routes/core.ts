/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';

const BasicLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');

const LICENSE_PATH = '/license';
const PRODUCT_INTRO_PATH = '/product-intro';

const productIntroRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/product-intro/index.vue'),
  meta: {
    hideInTab: true,
    ignoreAccess: true,
    title: '产品介绍',
  },
  name: 'ProductIntro',
  path: PRODUCT_INTRO_PATH,
};

const licenseRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/license/index.vue'),
  meta: {
    hideInTab: true,
    ignoreAccess: true,
    title: '软件授权激活',
  },
  name: 'License',
  path: LICENSE_PATH,
};

const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** 基本路由，这些路由是必须存在的 */
const coreRoutes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: preferences.app.defaultHomePath,
    children: [
      {
        name: 'Terms',
        path: 'terms',
        component: () => import('#/views/_core/terms/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '用户协议',
        },
      },
      {
        name: 'Privacy',
        path: 'privacy',
        component: () => import('#/views/_core/privacy/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '隐私政策',
        },
      },
      {
        name: 'About',
        path: 'about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          ignoreAccess: true,
          title: '关于',
        },
      },
    ],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        name: 'Login',
        path: 'login',
        component: () => import('#/views/_core/authentication/login.vue'),
        meta: {
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          title: $t('page.auth.register'),
        },
      },
    ],
  },
];

export {
  coreRoutes,
  fallbackNotFoundRoute,
  LICENSE_PATH,
  PRODUCT_INTRO_PATH,
  licenseRoute,
  productIntroRoute,
};
