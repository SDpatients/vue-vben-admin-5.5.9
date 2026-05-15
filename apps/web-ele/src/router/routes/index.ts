/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModulesAsync, traverseTreeValues } from '@vben/utils';

import { coreRoutes, fallbackNotFoundRoute, licenseRoute, productIntroRoute } from './core';

const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts');

const staticRoutes: RouteRecordRaw[] = [];
const externalRoutes: RouteRecordRaw[] = [];

const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  licenseRoute,
  productIntroRoute,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

let cachedAccessRoutes: RouteRecordRaw[] | null = null;

async function getAccessRoutes(): Promise<RouteRecordRaw[]> {
  if (cachedAccessRoutes) {
    return cachedAccessRoutes;
  }

  const dynamicRoutes = await mergeRouteModulesAsync(dynamicRouteFiles);
  cachedAccessRoutes = [...dynamicRoutes, ...staticRoutes];
  return cachedAccessRoutes;
}

export { coreRouteNames, getAccessRoutes, routes };
