import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAccessStore } from './access';

describe('useAccessStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('updates accessMenus state', () => {
    const store = useAccessStore();
    expect(store.accessMenus).toEqual([]);
    store.setAccessMenus([{ name: 'Dashboard', path: '/dashboard' }]);
    expect(store.accessMenus).toEqual([
      { name: 'Dashboard', path: '/dashboard' },
    ]);
  });

  it('updates accessToken state correctly', () => {
    const store = useAccessStore();
    expect(store.accessToken).toBeNull();
    store.setAccessToken('abc123');
    expect(store.accessToken).toBe('abc123');
  });

  it('returns correct accessToken', () => {
    const store = useAccessStore();
    store.setAccessToken('xyz789');
    expect(store.accessToken).toBe('xyz789');
  });

  it('handles empty accessMenus correctly', () => {
    const store = useAccessStore();
    store.setAccessMenus([]);
    expect(store.accessMenus).toEqual([]);
  });

  it('handles empty accessRoutes correctly', () => {
    const store = useAccessStore();
    store.setAccessRoutes([]);
    expect(store.accessRoutes).toEqual([]);
  });

  it('updates accessCodes correctly', () => {
    const store = useAccessStore();
    expect(store.accessCodes).toEqual([]);
    store.setAccessCodes(['read', 'write', 'delete']);
    expect(store.accessCodes).toEqual(['read', 'write', 'delete']);
  });

  it('updates accessRoutes correctly', () => {
    const store = useAccessStore();
    const routes = [
      { path: '/dashboard', component: 'Dashboard' },
      { path: '/settings', component: 'Settings' },
    ];
    store.setAccessRoutes(routes as any);
    expect(store.accessRoutes).toEqual(routes);
  });

  it('updates refreshToken correctly', () => {
    const store = useAccessStore();
    expect(store.refreshToken).toBeNull();
    store.setRefreshToken('refresh-token-123');
    expect(store.refreshToken).toBe('refresh-token-123');
  });

  it('updates isAccessChecked correctly', () => {
    const store = useAccessStore();
    expect(store.isAccessChecked).toBe(false);
    store.setIsAccessChecked(true);
    expect(store.isAccessChecked).toBe(true);
  });

  it('updates loginExpired correctly', () => {
    const store = useAccessStore();
    expect(store.loginExpired).toBe(false);
    store.setLoginExpired(true);
    expect(store.loginExpired).toBe(true);
  });

  it('locks screen with password', () => {
    const store = useAccessStore();
    expect(store.isLockScreen).toBe(false);
    expect(store.lockScreenPassword).toBeUndefined();

    store.lockScreen('password123');

    expect(store.isLockScreen).toBe(true);
    expect(store.lockScreenPassword).toBe('password123');
  });

  it('unlocks screen and clears password', () => {
    const store = useAccessStore();
    store.lockScreen('password123');
    expect(store.isLockScreen).toBe(true);
    expect(store.lockScreenPassword).toBe('password123');

    store.unlockScreen();

    expect(store.isLockScreen).toBe(false);
    expect(store.lockScreenPassword).toBeUndefined();
  });

  it('finds menu by path in top level', () => {
    const store = useAccessStore();
    const menus = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Settings', path: '/settings' },
    ];
    store.setAccessMenus(menus as any);

    const menu = store.getMenuByPath('/dashboard');
    expect(menu).toEqual({ name: 'Dashboard', path: '/dashboard' });
  });

  it('finds menu by path in nested level', () => {
    const store = useAccessStore();
    const menus = [
      {
        name: 'System',
        path: '/system',
        children: [
          { name: 'Users', path: '/system/users' },
          { name: 'Roles', path: '/system/roles' },
        ],
      },
    ];
    store.setAccessMenus(menus as any);

    const menu = store.getMenuByPath('/system/users');
    expect(menu).toEqual({ name: 'Users', path: '/system/users' });
  });

  it('returns undefined for non-existent menu path', () => {
    const store = useAccessStore();
    const menus = [{ name: 'Dashboard', path: '/dashboard' }];
    store.setAccessMenus(menus as any);

    const menu = store.getMenuByPath('/non-existent');
    expect(menu).toBeUndefined();
  });

  it('returns undefined when searching in empty menus', () => {
    const store = useAccessStore();
    store.setAccessMenus([]);

    const menu = store.getMenuByPath('/dashboard');
    expect(menu).toBeUndefined();
  });

  it('clears accessToken correctly', () => {
    const store = useAccessStore();
    store.setAccessToken('token123');
    expect(store.accessToken).toBe('token123');

    store.setAccessToken(null);
    expect(store.accessToken).toBeNull();
  });

  it('clears refreshToken correctly', () => {
    const store = useAccessStore();
    store.setRefreshToken('refresh123');
    expect(store.refreshToken).toBe('refresh123');

    store.setRefreshToken(null);
    expect(store.refreshToken).toBeNull();
  });
});
