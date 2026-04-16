import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModulesAsync, traverseTreeValues } from '@vben/utils';

import { coreRoutes, fallbackNotFoundRoute, licenseRoute } from './core';

const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts');

const staticRoutes: RouteRecordRaw[] = [];
const externalRoutes: RouteRecordRaw[] = [];

const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  licenseRoute,
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
