import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { getChatMessagesApi, getChatSessionsApi } from '#/api/core/chat';

interface Contact {
  avatar: null | string;
  contactUserId: number;
  createdAt: string;
  description: null | string;
  email: string;
  groupId: number;
  id: number;
  idCard: null | string;
  isOnline: boolean;
  isPinned: boolean;
  isSystemUser: boolean | null;
  lastOnlineTime: null | string;
  name: string;
  phone: string;
  updatedAt: string;
  userId: number;
}

interface ChatMessage {
  content: string;
  fileName: null | string;
  fileSize: null | number;
  fileUrl: null | string;
  id: number;
  isRecalled: boolean;
  messageType: 'file' | 'image' | 'system' | 'text';
  readStatus: boolean;
  recallTime: null | string;
  receiverId: number;
  senderId: number;
  status: 'failed' | 'sending' | 'sent';
  thumbnailUrl: null | string;
  timestamp: string;
  createdAt: string;
}

interface ChatSession {
  id: number;
  contactId: number;
  lastMessage: string;
  unreadCount: number;
  isPinned: boolean;
  lastActivityTime: string;
  createdAt: string;
}

export const useChatStore = defineStore('chat', () => {
  const currentContact = ref<Contact | null>(null);
  const sessions = ref<ChatSession[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const isConnected = ref(false);
  const totalUnread = ref(0);
  const typingStatus = ref<Record<number, boolean>>({});
  const loading = ref(false);
  const error = ref<null | string>(null);

  const getCurrentUserId = (): number => {
    const userId = localStorage.getItem('chat_user_id');
    return userId ? Number.parseInt(userId) : 1;
  };

  const currentMessages = computed(() => {
    if (!currentContact.value) return [];
    const currentUserId = getCurrentUserId();
    return messages.value
      .filter(
        (msg) =>
          (msg.senderId === currentContact.value?.id && msg.receiverId === currentUserId) ||
          (msg.senderId === currentUserId && msg.receiverId === currentContact.value?.id),
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  });

  function setCurrentContact(contact: Contact | null) {
    currentContact.value = contact;
  }

  function addSession(session: ChatSession) {
    const existingIndex = sessions.value.findIndex(
      (s) => s.contactId === session.contactId,
    );
    if (existingIndex === -1) {
      sessions.value.push(session);
    } else {
      sessions.value[existingIndex] = session;
    }
    sessions.value.sort(
      (a, b) =>
        new Date(b.lastActivityTime).getTime() -
        new Date(a.lastActivityTime).getTime(),
    );
  }

  function addMessage(message: ChatMessage) {
    messages.value.push(message);
    const currentUserId = getCurrentUserId();
    const session: ChatSession = {
      contactId: message.senderId === currentUserId ? message.receiverId : message.senderId,
      lastMessage: message.content,
      unreadCount: message.receiverId === currentUserId ? 1 : 0,
      isPinned: false,
      lastActivityTime: message.timestamp,
      id: 0,
      createdAt: message.timestamp,
    };
    addSession(session);
    if (message.receiverId === currentUserId && !message.readStatus) {
      totalUnread.value++;
    }
  }

  function markAsRead(contactId: number) {
    messages.value.forEach((msg) => {
      const currentUserId = getCurrentUserId();
      if (msg.receiverId === currentUserId && msg.senderId === contactId) {
        msg.readStatus = true;
      }
    });
    const session = sessions.value.find((s) => s.contactId === contactId);
    if (session) {
      totalUnread.value -= session.unreadCount;
      session.unreadCount = 0;
    }
  }

  function setConnectionStatus(status: boolean) {
    isConnected.value = status;
  }

  function setTypingStatus(contactId: number, isTyping: boolean) {
    typingStatus.value[contactId] = isTyping;
  }

  async function fetchChatSessions(contactId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await getChatSessionsApi(contactId);
      const currentUserId = localStorage.getItem('chat_user_id');
      const filteredSessions = data;
      if (currentUserId) {
      }
      sessions.value = filteredSessions;
      totalUnread.value = filteredSessions.reduce(
        (sum, session) => sum + session.unreadCount,
        0,
      );
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取聊天会话列表失败';
      console.error('获取聊天会话列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  async function fetchChatMessages(params: {
    contactId: number;
    page?: number;
    page_size?: number;
    userId: number;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const data = await getChatMessagesApi(params);
      messages.value = data;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取聊天消息列表失败';
      console.error('获取聊天消息列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  async function initializeData() {
    await fetchChatSessions();
  }

  function $reset() {
    currentContact.value = null;
    sessions.value = [];
    messages.value = [];
    isConnected.value = false;
    totalUnread.value = 0;
    typingStatus.value = {};
    loading.value = false;
    error.value = null;
  }

  return {
    currentContact,
    sessions,
    messages,
    isConnected,
    totalUnread,
    typingStatus,
    loading,
    error,
    currentMessages,
    setCurrentContact,
    addSession,
    addMessage,
    markAsRead,
    setConnectionStatus,
    setTypingStatus,
    fetchChatSessions,
    fetchChatMessages,
    initializeData,
    $reset,
  };
});
