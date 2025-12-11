import { computed, onMounted, ref } from 'vue';

import { defineStore } from 'pinia';

// 导入API函数
import { getChatMessagesApi, getChatSessionsApi } from '#/api/core/chat';

// 定义类型
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
  // 状态
  const currentContact = ref<Contact | null>(null);
  const sessions = ref<ChatSession[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const isConnected = ref(false);
  const totalUnread = ref(0);
  const typingStatus = ref<Record<number, boolean>>({});
  const loading = ref(false);
  const error = ref<null | string>(null);

  // 计算属性
  const currentMessages = computed(() => {
    if (!currentContact.value) return [];
    return messages.value
      .filter(
        (msg) =>
          (msg.senderId === currentContact.value?.id && msg.receiverId === 1) ||
          (msg.senderId === 1 && msg.receiverId === currentContact.value?.id),
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  });

  // 方法
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
    // 按最后活动时间排序
    sessions.value.sort(
      (a, b) =>
        new Date(b.lastActivityTime).getTime() -
        new Date(a.lastActivityTime).getTime(),
    );
  }

  function addMessage(message: ChatMessage) {
    messages.value.push(message);
    // 更新会话
    const session: ChatSession = {
      contactId: message.senderId === 1 ? message.receiverId : message.senderId,
      lastMessage: message.content,
      unreadCount: message.receiverId === 1 ? 1 : 0,
      isPinned: false,
      lastActivityTime: message.timestamp,
      id: 0, // 添加默认id
      createdAt: message.timestamp, // 添加默认createdAt
    };
    addSession(session);
    // 更新未读消息总数
    if (message.receiverId === 1 && !message.readStatus) {
      totalUnread.value++;
    }
  }

  function markAsRead(contactId: number) {
    // 标记消息为已读
    messages.value.forEach((msg) => {
      if (msg.receiverId === 1 && msg.senderId === contactId) {
        msg.readStatus = true;
      }
    });
    // 更新会话未读计数
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

  // 从API获取聊天会话列表
  async function fetchChatSessions(contactId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await getChatSessionsApi(contactId);

      // 获取当前登录用户ID
      const currentUserId = localStorage.getItem('chat_user_id');

      // 如果有当前用户ID，只展示该用户的会话
      const filteredSessions = data;
      if (currentUserId) {
        // 这里需要根据实际业务逻辑调整过滤条件
        // 假设会话与用户ID的关联逻辑
        // filteredSessions = data.filter(session => session.userId === parseInt(currentUserId));
      }

      sessions.value = filteredSessions;
      // 更新未读消息总数
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

  // 从API获取聊天消息列表
  async function fetchChatMessages(senderId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await getChatMessagesApi(senderId);
      messages.value = data;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取聊天消息列表失败';
      console.error('获取聊天消息列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  // 初始化数据
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

  // 组件挂载时初始化数据
  onMounted(() => {
    initializeData();
  });

  return {
    // 状态
    currentContact,
    sessions,
    messages,
    isConnected,
    totalUnread,
    typingStatus,
    loading,
    error,
    // 计算属性
    currentMessages,
    // 方法
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
