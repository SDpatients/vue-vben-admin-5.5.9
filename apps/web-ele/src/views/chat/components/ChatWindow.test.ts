import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ChatWindow from './ChatWindow.vue';
import { nextTick } from 'vue';

// Mock chat store
const mockSendMessage = vi.fn();
const mockFetchChatMessages = vi.fn();
const mockMarkConversationAsRead = vi.fn();
const mockRecallMessage = vi.fn();
const mockDeleteMessage = vi.fn();

vi.mock('../stores/chat', () => ({
  useChatStore: vi.fn(() => ({
    currentMessages: [],
    typingStatus: {},
    sendMessage: mockSendMessage,
    fetchChatMessages: mockFetchChatMessages,
    markConversationAsRead: mockMarkConversationAsRead,
    recallMessage: mockRecallMessage,
    deleteMessage: mockDeleteMessage,
  })),
}));

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElInput: { name: 'ElInput', template: '<input />' },
  ElAvatar: { name: 'ElAvatar', template: '<div class="avatar" />' },
  ElBadge: { name: 'ElBadge', template: '<div class="badge"><slot /></div>' },
  ElDropdown: { name: 'ElDropdown', template: '<div><slot /></div>' },
  ElDropdownItem: { name: 'ElDropdownItem', template: '<div><slot /></div>' },
  ElDropdownMenu: { name: 'ElDropdownMenu', template: '<div><slot /></div>' },
  ElPopover: { name: 'ElPopover', template: '<div><slot /></div>' },
  ElScrollbar: { name: 'ElScrollbar', template: '<div class="scrollbar"><slot /></div>' },
  ElTooltip: { name: 'ElTooltip', template: '<div><slot /></div>' },
  ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>' },
}));

// Mock Icon
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span class="icon" />' },
}));

describe('ChatWindow', () => {
  let pinia: any;
  const defaultProps = {
    contactAvatar: 'https://example.com/avatar.png',
    contactId: 1,
    contactName: '张三',
    isOnline: true,
    conversationId: 1,
  };

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => '1'),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with props', () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('displays contact name correctly', () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    expect(wrapper.text()).toContain('张三');
  });

  it('displays online status correctly', () => {
    const wrapper = mount(ChatWindow, {
      props: { ...defaultProps, isOnline: true },
      global: { plugins: [pinia] },
    });

    expect(wrapper.text()).toContain('在线');
  });

  it('displays offline status correctly', () => {
    const wrapper = mount(ChatWindow, {
      props: { ...defaultProps, isOnline: false },
      global: { plugins: [pinia] },
    });

    expect(wrapper.text()).toContain('离线');
  });

  it('emits back event when goBack is called', async () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    wrapper.vm.goBack();

    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('formats messages correctly', async () => {
    const { useChatStore } = await import('../stores/chat');
    const mockStore = useChatStore();
    mockStore.currentMessages = [
      {
        id: 1,
        senderId: 1,
        content: 'Hello',
        timestamp: new Date('2024-01-15T10:30:00').toISOString(),
        messageType: 'TEXT',
      },
      {
        id: 2,
        senderId: 2,
        content: 'Hi there',
        timestamp: new Date('2024-01-15T10:31:00').toISOString(),
        messageType: 'TEXT',
      },
    ];

    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    await nextTick();

    const formattedMessages = wrapper.vm.formattedMessages;
    expect(formattedMessages).toHaveLength(2);
    expect(formattedMessages[0].isSent).toBe(true);
    expect(formattedMessages[1].isSent).toBe(false);
  });

  it('handles message input', async () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    wrapper.vm.messageInput = 'Test message';

    expect(wrapper.vm.messageInput).toBe('Test message');
  });

  it('sends message successfully', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    wrapper.vm.messageInput = 'Test message';
    await wrapper.vm.sendMessage();

    expect(mockSendMessage).toHaveBeenCalledWith({
      senderId: 1,
      receiverId: 1,
      messageType: 'TEXT',
      content: 'Test message',
    });
    expect(wrapper.vm.messageInput).toBe('');
  });

  it('does not send empty message', async () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    wrapper.vm.messageInput = '   ';
    await wrapper.vm.sendMessage();

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('toggles emoji picker', async () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.showEmojiPicker).toBe(false);

    wrapper.vm.toggleEmojiPicker();

    expect(wrapper.vm.showEmojiPicker).toBe(true);

    wrapper.vm.toggleEmojiPicker();

    expect(wrapper.vm.showEmojiPicker).toBe(false);
  });

  it('toggles file upload', async () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.showFileUpload).toBe(false);

    wrapper.vm.toggleFileUpload();

    expect(wrapper.vm.showFileUpload).toBe(true);
  });

  it('adds emoji to message', () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    wrapper.vm.messageInput = 'Hello';
    wrapper.vm.addEmoji('😀');

    expect(wrapper.vm.messageInput).toBe('Hello😀');
    expect(wrapper.vm.showEmojiPicker).toBe(false);
  });

  it('computes current user id correctly', () => {
    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.currentUserId).toBe(1);
  });

  it('recalls message successfully', async () => {
    mockRecallMessage.mockResolvedValue(undefined);

    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    await wrapper.vm.recallMessage(123);

    expect(mockRecallMessage).toHaveBeenCalledWith(123, 1);
  });

  it('deletes message successfully', async () => {
    mockDeleteMessage.mockResolvedValue(undefined);

    const wrapper = mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    await wrapper.vm.deleteMessage(123);

    expect(mockDeleteMessage).toHaveBeenCalledWith(123, 1);
  });

  it('fetches messages on mount', async () => {
    mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    await nextTick();

    expect(mockFetchChatMessages).toHaveBeenCalledWith({
      conversationId: 1,
      pageNum: 1,
      pageSize: 50,
    });
  });

  it('marks conversation as read on mount', async () => {
    mount(ChatWindow, {
      props: defaultProps,
      global: { plugins: [pinia] },
    });

    await nextTick();

    expect(mockMarkConversationAsRead).toHaveBeenCalledWith(1, 1);
  });
});
