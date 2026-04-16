import type { RouteRecordRaw } from 'vue-router';

interface RouteModuleType {
  default: RouteRecordRaw[];
}

function mergeRouteModules(
  routeModules: Record<string, unknown>,
): RouteRecordRaw[] {
  const mergedRoutes: RouteRecordRaw[] = [];

  for (const routeModule of Object.values(routeModules)) {
    const moduleRoutes = (routeModule as RouteModuleType)?.default;
    if (Array.isArray(moduleRoutes)) {
      mergedRoutes.push(...moduleRoutes);
    }
  }

  return mergedRoutes;
}

async function mergeRouteModulesAsync(
  routeModules: Record<string, () => Promise<unknown>>,
): Promise<RouteRecordRaw[]> {
  const mergedRoutes: RouteRecordRaw[] = [];

  const modulePromises = Object.values(routeModules).map((loadModule) =>
    loadModule(),
  );

  const loadedModules = await Promise.all(modulePromises);

  for (const routeModule of loadedModules) {
    const moduleRoutes = (routeModule as RouteModuleType)?.default;
    if (Array.isArray(moduleRoutes)) {
      mergedRoutes.push(...moduleRoutes);
    }
  }

  return mergedRoutes;
}

export { mergeRouteModules, mergeRouteModulesAsync };

export type { RouteModuleType };
