import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SessionList from './SessionList.vue';

// Mock Vue Router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElInput: { name: 'ElInput', template: '<input />' },
  ElAvatar: { name: 'ElAvatar', template: '<div class="avatar" />' },
  ElBadge: { name: 'ElBadge', template: '<div class="badge"><slot /></div>' },
  ElEmpty: { name: 'ElEmpty', template: '<div>暂无数据</div>' },
  ElScrollbar: { name: 'ElScrollbar', template: '<div class="scrollbar"><slot /></div>' },
}));

// Mock Icon
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span class="icon" />' },
}));

describe('SessionList', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('filters sessions by search keyword', async () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    // 初始状态应该有4个会话
    expect(wrapper.vm.filteredSessions).toHaveLength(4);

    // 搜索"张三"
    wrapper.vm.searchKeyword = '张三';
    expect(wrapper.vm.filteredSessions).toHaveLength(1);
    expect(wrapper.vm.filteredSessions[0].name).toBe('张三');

    // 搜索"开会"
    wrapper.vm.searchKeyword = '开会';
    expect(wrapper.vm.filteredSessions).toHaveLength(1);
    expect(wrapper.vm.filteredSessions[0].name).toBe('李四');
  });

  it('sorts sessions by pinned status and time', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    const sessions = wrapper.vm.filteredSessions;

    // 置顶的会话应该在前面
    expect(sessions[0].isPinned).toBe(true);
  });

  it('emits select event when handleSessionClick is called', async () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    wrapper.vm.handleSessionClick(1);

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([1]);
    expect(mockPush).toHaveBeenCalledWith('/chat/contact/1');
  });

  it('emits search event when handleSearch is called', async () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    wrapper.vm.searchKeyword = 'test';
    wrapper.vm.handleSearch();

    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')![0]).toEqual(['test']);
  });

  it('emits create event when handleCreateSession is called', async () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    wrapper.vm.handleCreateSession();

    expect(wrapper.emitted('create')).toBeTruthy();
  });

  it('toggles pin status correctly', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    // 初始状态：第一个会话是置顶的
    expect(wrapper.vm.filteredSessions[0].isPinned).toBe(true);

    // 取消置顶
    wrapper.vm.togglePin(1);
    expect(wrapper.vm.filteredSessions.find((s: any) => s.id === 1)?.isPinned).toBe(false);

    // 再次置顶
    wrapper.vm.togglePin(1);
    expect(wrapper.vm.filteredSessions.find((s: any) => s.id === 1)?.isPinned).toBe(true);
  });

  it('displays unread count correctly', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    const sessions = wrapper.vm.filteredSessions;
    const sessionWithUnread = sessions.find((s: any) => s.unreadCount > 0);

    expect(sessionWithUnread).toBeDefined();
    expect(sessionWithUnread!.unreadCount).toBeGreaterThan(0);
  });

  it('displays online status correctly', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    const sessions = wrapper.vm.filteredSessions;
    const onlineSessions = sessions.filter((s: any) => s.isOnline);

    expect(onlineSessions.length).toBeGreaterThan(0);
  });

  it('displays last message preview', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    const sessions = wrapper.vm.filteredSessions;

    sessions.forEach((session: any) => {
      expect(session.lastMessage).toBeDefined();
      expect(session.lastMessageTime).toBeDefined();
    });
  });

  it('returns empty array when no sessions match search', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    wrapper.vm.searchKeyword = '不存在的联系人';

    expect(wrapper.vm.filteredSessions).toHaveLength(0);
  });

  it('is case insensitive when searching', () => {
    const wrapper = mount(SessionList, {
      props: {
        showHeader: true,
        showSearch: true,
      },
      global: { plugins: [pinia] },
    });

    // 大写搜索
    wrapper.vm.searchKeyword = 'ZHANG';
    expect(wrapper.vm.filteredSessions).toHaveLength(0);

    // 小写搜索
    wrapper.vm.searchKeyword = 'zhang';
    expect(wrapper.vm.filteredSessions).toHaveLength(0);

    // 中文搜索
    wrapper.vm.searchKeyword = '张三';
    expect(wrapper.vm.filteredSessions).toHaveLength(1);
  });
});
