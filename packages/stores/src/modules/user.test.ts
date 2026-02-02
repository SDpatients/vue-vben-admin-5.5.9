import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useUserStore } from './user';

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns correct userInfo', () => {
    const store = useUserStore();
    const userInfo: any = {
      avatar: 'avatar.jpg',
      realName: 'Jane Doe',
      roles: ['admin'],
      userId: '123',
      username: 'jane',
    };
    store.setUserInfo(userInfo);
    expect(store.userInfo).toEqual(userInfo);
  });

  it('clears userInfo and userRoles when setting null userInfo', () => {
    const store = useUserStore();
    store.setUserInfo({
      avatar: 'avatar.jpg',
      realName: 'Jane Doe',
      roles: ['admin'],
      userId: '123',
      username: 'jane',
    } as any);
    expect(store.userInfo).not.toBeNull();
    expect(store.userRoles.length).toBeGreaterThan(0);

    store.setUserInfo(null as any);
    expect(store.userInfo).toBeNull();
    expect(store.userRoles).toEqual([]);
  });

  it('returns an empty array for userRoles if not set', () => {
    const store = useUserStore();
    expect(store.userRoles).toEqual([]);
  });

  it('sets userRoles correctly', () => {
    const store = useUserStore();
    const roles = ['admin', 'user', 'editor'];
    store.setUserRoles(roles);
    expect(store.userRoles).toEqual(roles);
  });

  it('updates userRoles when setUserInfo is called', () => {
    const store = useUserStore();
    const userInfo: any = {
      avatar: 'avatar.jpg',
      realName: 'John Doe',
      roles: ['admin', 'editor'],
      userId: '456',
      username: 'john',
    };
    store.setUserInfo(userInfo);
    expect(store.userRoles).toEqual(['admin', 'editor']);
  });

  it('handles empty roles array in userInfo', () => {
    const store = useUserStore();
    const userInfo: any = {
      avatar: 'avatar.jpg',
      realName: 'Test User',
      roles: [],
      userId: '789',
      username: 'test',
    };
    store.setUserInfo(userInfo);
    expect(store.userRoles).toEqual([]);
  });

  it('handles missing roles in userInfo', () => {
    const store = useUserStore();
    const userInfo: any = {
      avatar: 'avatar.jpg',
      realName: 'No Roles User',
      userId: '999',
      username: 'noroles',
    };
    store.setUserInfo(userInfo);
    expect(store.userRoles).toEqual([]);
  });

  it('updates userInfo completely', () => {
    const store = useUserStore();
    const userInfo1: any = {
      avatar: 'avatar1.jpg',
      realName: 'User One',
      roles: ['user'],
      userId: '1',
      username: 'user1',
    };
    store.setUserInfo(userInfo1);

    const userInfo2: any = {
      avatar: 'avatar2.jpg',
      realName: 'User Two',
      roles: ['admin'],
      userId: '2',
      username: 'user2',
    };
    store.setUserInfo(userInfo2);

    expect(store.userInfo).toEqual(userInfo2);
    expect(store.userRoles).toEqual(['admin']);
  });

  it('clears userRoles with empty array', () => {
    const store = useUserStore();
    store.setUserRoles(['admin', 'user']);
    expect(store.userRoles).toHaveLength(2);

    store.setUserRoles([]);
    expect(store.userRoles).toEqual([]);
  });

  it('handles all userInfo fields', () => {
    const store = useUserStore();
    const userInfo: any = {
      avatar: 'https://example.com/avatar.jpg',
      realName: 'Full Name',
      roles: ['super-admin'],
      userId: 'unique-id-123',
      username: 'username',
      extraField: 'custom field',
    };
    store.setUserInfo(userInfo);
    expect(store.userInfo).toEqual(userInfo);
    expect(store.userInfo?.avatar).toBe('https://example.com/avatar.jpg');
    expect(store.userInfo?.realName).toBe('Full Name');
    expect(store.userInfo?.userId).toBe('unique-id-123');
    expect(store.userInfo?.username).toBe('username');
  });
});
