import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { defineStore } from 'pinia';

import { webSocketService } from '#/services/websocket';
import {
  getConversationsApi,
  getConversationMessagesApi,
  sendMessageApi,
  recallMessageApi,
  deleteMessageApi,
  pinConversationApi,
  deleteConversationApi,
  markMessageAsReadApi,
  markConversationAsReadApi,
  getUnreadCountApi,
  getConversationUnreadCountApi,
  getOrCreateConversationApi,
  getPinnedConversationsApi,
  getUnpinnedConversationsApi,
} from '../../../api/core/chat';



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

  const handleNewMessage = (data: any) => {
    console.log('收到新消息:', data);
    const messageData = data.data || data;
    const chatMessage: ChatMessage = {
      id: messageData.id || Date.now(),
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      messageType: messageData.messageType?.toLowerCase() as 'file' | 'image' | 'system' | 'text',
      content: messageData.content || '',
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      thumbnailUrl: null,
      isRecalled: messageData.isRecalled || false,
      recallTime: null,
      readStatus: messageData.messageStatus === 'READ',
      timestamp: messageData.createTime || new Date().toISOString(),
      status: messageData.messageStatus === 'SENT' ? 'sent' : 'failed',
      createdAt: messageData.createTime || new Date().toISOString(),
    };
    addMessage(chatMessage);
  };

  const handleMessageRead = (data: any) => {
    console.log('消息已读:', data);
    const messageData = data.data || data;
    const msgIndex = messages.value.findIndex((m) => m.id === messageData.messageId);
    if (msgIndex !== -1) {
      messages.value[msgIndex].readStatus = true;
    }
  };

  const handleMessageRecalled = (data: any) => {
    console.log('消息已撤回:', data);
    const messageData = data.data || data;
    const msgIndex = messages.value.findIndex((m) => m.id === messageData.messageId);
    if (msgIndex !== -1) {
      messages.value[msgIndex].isRecalled = true;
    }
  };

  const handleTyping = (data: any) => {
    console.log('正在输入:', data);
    if (data.userId && data.conversationId) {
      typingStatus.value[data.userId] = true;
      setTimeout(() => {
        typingStatus.value[data.userId] = false;
      }, 3000);
    }
  };

  const setupWebSocketListeners = () => {
    webSocketService.on('NEW_MESSAGE', handleNewMessage);
    webSocketService.on('MESSAGE_READ', handleMessageRead);
    webSocketService.on('MESSAGE_RECALLED', handleMessageRecalled);
    webSocketService.on('TYPING', handleTyping);
  };

  const cleanupWebSocketListeners = () => {
    webSocketService.off('NEW_MESSAGE', handleNewMessage);
    webSocketService.off('MESSAGE_READ', handleMessageRead);
    webSocketService.off('MESSAGE_RECALLED', handleMessageRecalled);
    webSocketService.off('TYPING', handleTyping);
  };

  onMounted(() => {
    setupWebSocketListeners();
  });

  onUnmounted(() => {
    cleanupWebSocketListeners();
  });

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

  function initMockData() {
    const currentUserId = getCurrentUserId();

    const mockSessions: ChatSession[] = [
      {
        id: 1,
        contactId: 2,
        lastMessage: '没问题，到时候见！',
        unreadCount: 2,
        isPinned: true,
        lastActivityTime: new Date().toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        contactId: 3,
        lastMessage: '好的，我会准备好资料的',
        unreadCount: 0,
        isPinned: false,
        lastActivityTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        contactId: 4,
        lastMessage: '项目进展顺利，预计下周可以完成',
        unreadCount: 1,
        isPinned: false,
        lastActivityTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        contactId: 5,
        lastMessage: '周末一起去爬山吗？',
        unreadCount: 0,
        isPinned: false,
        lastActivityTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        contactId: 6,
        lastMessage: '这份报告已经修改好了，你可以看看',
        unreadCount: 3,
        isPinned: false,
        lastActivityTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockMessages: ChatMessage[] = [
      // 张三的聊天记录
      {
        id: 1,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '你好，最近怎么样？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '挺好的，你呢？最近在忙什么？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '我也不错，最近在忙一个新项目，需要赶进度',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '新项目听起来很有趣，是什么类型的？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '是一个企业级的聊天应用，类似我们现在用的这个，但功能更丰富',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 6,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '那很棒啊！你们都实现了哪些功能？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
      {
        id: 7,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '目前已经实现了：\n- 实时消息发送\n- 消息撤回功能\n- 消息已读状态\n- 图片和文件发送\n- 消息搜索',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 8,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '哇，功能很全面啊！你们用了什么技术栈？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      },
      {
        id: 9,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '前端用的是 Vue 3 + TypeScript + Vite，后端是 Java + Spring Boot，数据库用的是 MySQL',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        id: 10,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '技术栈很主流啊！有机会可以分享一下经验',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        id: 11,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '没问题啊，等项目上线后可以写个总结',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 30 * 1000).toISOString(),
      },
      {
        id: 12,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '期待你的分享！对了，周末有空一起吃饭吗？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 10 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 10 * 1000).toISOString(),
      },
      {
        id: 13,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '好啊，周末几点？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 5 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 5 * 1000).toISOString(),
      },
      {
        id: 14,
        senderId: currentUserId,
        receiverId: 2,
        messageType: 'text',
        content: '周六下午6点怎么样？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 2 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 2 * 1000).toISOString(),
      },
      {
        id: 15,
        senderId: 2,
        receiverId: currentUserId,
        messageType: 'text',
        content: '没问题，到时候见！',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date().toISOString(),
        status: 'sent',
        createdAt: new Date().toISOString(),
      },
      // 李四的聊天记录
      {
        id: 16,
        senderId: 3,
        receiverId: currentUserId,
        messageType: 'text',
        content: '明天开会记得准备资料',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 17,
        senderId: currentUserId,
        receiverId: 3,
        messageType: 'text',
        content: '好的，我会准备好资料的',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
      // 王五的聊天记录
      {
        id: 18,
        senderId: 4,
        receiverId: currentUserId,
        messageType: 'text',
        content: '项目进度如何？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 19,
        senderId: currentUserId,
        receiverId: 4,
        messageType: 'text',
        content: '项目进展顺利，预计下周可以完成',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 20,
        senderId: 4,
        receiverId: currentUserId,
        messageType: 'text',
        content: '太好了，到时候记得通知我',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      // 赵六的聊天记录
      {
        id: 21,
        senderId: 5,
        receiverId: currentUserId,
        messageType: 'text',
        content: '周末一起去爬山吗？',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 22,
        senderId: currentUserId,
        receiverId: 5,
        messageType: 'text',
        content: '不好意思，周末我有其他安排了',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: true,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      },
      // 孙七的聊天记录
      {
        id: 23,
        senderId: 6,
        receiverId: currentUserId,
        messageType: 'text',
        content: '这份报告已经修改好了，你可以看看',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 24,
        senderId: 6,
        receiverId: currentUserId,
        messageType: 'text',
        content: '主要修改了以下内容：\n1. 调整了报告结构\n2. 更新了数据统计\n3. 补充了结论部分',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: 25,
        senderId: 6,
        receiverId: currentUserId,
        messageType: 'text',
        content: '如果有问题，随时告诉我',
        fileUrl: null,
        fileName: null,
        fileSize: null,
        thumbnailUrl: null,
        isRecalled: false,
        recallTime: null,
        readStatus: false,
        timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
        status: 'sent',
        createdAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
      },
    ];

    sessions.value = mockSessions;
    messages.value = mockMessages;
    totalUnread.value = mockSessions.reduce((sum, s) => sum + s.unreadCount, 0);
  }

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

  function setMessages(newMessages: any[]) {
    messages.value = newMessages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      messageType: msg.messageType.toLowerCase() as 'file' | 'image' | 'system' | 'text',
      content: msg.content,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      thumbnailUrl: null,
      isRecalled: msg.isRecalled || false,
      recallTime: null,
      readStatus: msg.messageStatus === 'READ',
      timestamp: msg.createTime,
      status: msg.messageStatus === 'SENT' ? 'sent' : 'failed',
      createdAt: msg.createTime,
    }));
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

  async function fetchChatSessions(userId?: number) {
    loading.value = true;
    error.value = null;
    try {
      console.log('开始获取聊天会话列表...');
      
      const currentUserId = userId || getCurrentUserId();
      
      const response = await getConversationsApi({
        userId: currentUserId,
      });
      
      if (response.code !== 200) {
        throw new Error(response.message || '获取会话列表失败');
      }
      
      console.log('获取会话列表成功:', response);
      
      const transformedSessions = response.data.map((conversation) => {
        const contactId = conversation.userId1 === currentUserId ? conversation.userId2 : conversation.userId1;
        const unreadCount = conversation.userId1 === currentUserId ? conversation.user1UnreadCount : conversation.user2UnreadCount;
        const isPinned = conversation.userId1 === currentUserId ? conversation.user1Pinned : conversation.user2Pinned;
        
        return {
          id: conversation.id,
          contactId: contactId,
          lastMessage: conversation.lastMessageContent || '',
          unreadCount: unreadCount,
          isPinned: isPinned,
          lastActivityTime: conversation.lastMessageTime || '',
          createdAt: conversation.createTime || '',
        };
      });
      
      sessions.value = transformedSessions;
      totalUnread.value = transformedSessions.reduce(
        (sum, session) => sum + session.unreadCount,
        0,
      );
      
      console.log('会话列表更新完成，共', transformedSessions.length, '个会话');
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : '获取聊天会话列表失败';
      console.error('获取聊天会话列表失败:', error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  }

  async function fetchChatMessages(params: {
    conversationId: number;
    pageNum?: number;
    pageSize?: number;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await getConversationMessagesApi(params);
      // 处理新的数据格式，消息列表在data.list中
      const records = response.data.data.list;
      messages.value = records.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        messageType: msg.messageType.toLowerCase() as
          | 'file'
          | 'image'
          | 'system'
          | 'text',
        content: msg.content,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        thumbnailUrl: null,
        isRecalled: msg.isRecalled,
        recallTime: null,
        readStatus: msg.messageStatus === 'READ',
        timestamp: msg.createTime,
        status: msg.messageStatus === 'SENT' ? 'sent' : 'failed',
        createdAt: msg.createTime,
      }));
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取聊天消息列表失败';
      console.error('获取聊天消息列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(params: {
    senderId: number;
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  }) {
    try {
      const response = await sendMessageApi({
        senderId: params.senderId,
        data: {
          receiverId: params.receiverId,
          messageType: params.messageType,
          content: params.content,
          fileId: params.fileId,
          fileName: params.fileName,
          fileSize: params.fileSize,
          fileUrl: params.fileUrl,
        },
      });

      // 消息数据在response.data中，而不是直接在response中
      const message = response.data || {};
      const messageData = message.data || {};

      const chatMessage: ChatMessage = {
        id: messageData.id || Date.now(), // 如果没有id，使用时间戳作为临时id
        senderId: messageData.senderId || params.senderId,
        receiverId: messageData.receiverId || params.receiverId,
        messageType: (messageData.messageType || params.messageType).toLowerCase() as
          | 'file'
          | 'image'
          | 'system'
          | 'text',
        content: messageData.content || params.content || '',
        fileUrl: messageData.fileUrl || params.fileUrl,
        fileName: messageData.fileName || params.fileName,
        fileSize: messageData.fileSize || params.fileSize,
        thumbnailUrl: null,
        isRecalled: messageData.isRecalled || false,
        recallTime: null,
        readStatus: messageData.messageStatus === 'READ',
        timestamp: messageData.createTime || new Date().toISOString(),
        status: messageData.messageStatus === 'SENT' ? 'sent' : 'failed',
        createdAt: messageData.createTime || new Date().toISOString(),
      };

      addMessage(chatMessage);
      return chatMessage;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '发送消息失败';
      console.error('发送消息失败:', error_);
      throw error_;
    }
  }

  async function recallMessage(messageId: number, userId: number) {
    try {
      const message = await recallMessageApi({
        userId,
        data: { messageId },
      });

      const msgIndex = messages.value.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        messages.value[msgIndex].isRecalled = true;
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '撤回消息失败';
      console.error('撤回消息失败:', error_);
      throw error_;
    }
  }

  async function deleteMessage(messageId: number, userId: number) {
    try {
      const response = await deleteMessageApi({
        userId,
        data: { messageId },
      });

      if (response.code !== 200) {
        throw new Error(response.message || '删除消息失败');
      }

      messages.value = messages.value.filter((m) => m.id !== messageId);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '删除消息失败';
      console.error('删除消息失败:', error_);
      throw error_;
    }
  }

  // 标记单条消息为已读
  async function markMessageAsRead(messageId: number) {
    try {
      const userId = getCurrentUserId();
      console.log('标记消息已读:', { messageId, userId });
      
      // 调用API标记消息为已读
      await markMessageAsReadApi({
        userId,
        messageId
      });
      
      // 更新本地消息状态
      const msgIndex = messages.value.findIndex((msg) => msg.id === messageId);
      if (msgIndex !== -1) {
        messages.value[msgIndex].readStatus = true;
      }
      
      console.log('消息已标记为已读');
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '标记消息已读失败';
      console.error('标记消息已读失败:', error_);
      throw error_;
    }
  }

  async function pinConversation(
    conversationId: number,
    pinned: boolean,
    userId: number,
  ) {
    try {
      await pinConversationApi({
        userId,
        data: { conversationId, pinned },
      });

      const session = sessions.value.find((s) => s.id === conversationId);
      if (session) {
        session.isPinned = pinned;
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '置顶/取消置顶会话失败';
      console.error('置顶/取消置顶会话失败:', error_);
      throw error_;
    }
  }

  async function deleteConversation(conversationId: number, userId: number) {
    try {
      await deleteConversationApi({
        userId,
        conversationId,
      });

      sessions.value = sessions.value.filter((s) => s.id !== conversationId);
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '删除会话失败';
      console.error('删除会话失败:', error_);
      throw error_;
    }
  }

  async function markMessageAsRead(messageId: number, userId: number) {
    try {
      await markMessageAsReadApi({
        userId,
        data: { messageId },
      });

      const msgIndex = messages.value.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        messages.value[msgIndex].readStatus = true;
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '标记消息已读失败';
      console.error('标记消息已读失败:', error_);
      throw error_;
    }
  }

  async function markConversationAsRead(conversationId: number, userId: number) {
    try {
      const response = await markConversationAsReadApi({
        userId,
        conversationId,
      });

      if (response.code !== 200) {
        throw new Error(response.message || '标记会话已读失败');
      }

      const session = sessions.value.find((s) => s.id === conversationId);
      if (session) {
        totalUnread.value -= session.unreadCount;
        session.unreadCount = 0;
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '标记会话已读失败';
      console.error('标记会话已读失败:', error_);
      throw error_;
    }
  }

  async function fetchUnreadCount(userId?: number) {
    try {
      const currentUserId = userId || getCurrentUserId();
      const data = await getUnreadCountApi({ userId: currentUserId });
      totalUnread.value = data.totalUnread;
      return data;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取未读消息数失败';
      console.error('获取未读消息数失败:', error_);
      throw error_;
    }
  }

  async function getOrCreateConversation(userId1: number, userId2: number) {
    try {
      const response = await getOrCreateConversationApi({
        userId1,
        userId2,
      });

      if (response.code !== 200) {
        throw new Error(response.message || '获取或创建会话失败');
      }

      const conversation = response.data;
      const currentUserId = getCurrentUserId();
      const contactId = conversation.userId1 === currentUserId ? conversation.userId2 : conversation.userId1;
      const unreadCount = conversation.userId1 === currentUserId ? conversation.user1UnreadCount : conversation.user2UnreadCount;
      const isPinned = conversation.userId1 === currentUserId ? conversation.user1Pinned : conversation.user2Pinned;
      
      const session: ChatSession = {
        id: conversation.id,
        contactId: contactId,
        lastMessage: conversation.lastMessageContent || '',
        unreadCount: unreadCount,
        isPinned: isPinned,
        lastActivityTime: conversation.lastMessageTime || '',
        createdAt: conversation.createTime || '',
      };

      addSession(session);
      return session;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取或创建会话失败';
      console.error('获取或创建会话失败:', error_);
      throw error_;
    }
  }

  async function fetchPinnedConversations(userId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const currentUserId = userId || getCurrentUserId();
      
      const response = await getPinnedConversationsApi({
        userId: currentUserId,
      });

      if (response.code !== 200) {
        throw new Error(response.message || '获取置顶会话失败');
      }
      
      const transformedSessions = response.data.map((conversation) => {
        const contactId = conversation.userId1 === currentUserId ? conversation.userId2 : conversation.userId1;
        const unreadCount = conversation.userId1 === currentUserId ? conversation.user1UnreadCount : conversation.user2UnreadCount;
        
        return {
          id: conversation.id,
          contactId: contactId,
          lastMessage: conversation.lastMessageContent || '',
          unreadCount: unreadCount,
          isPinned: true,
          lastActivityTime: conversation.lastMessageTime || '',
          createdAt: conversation.createTime || '',
        };
      });
      
      return transformedSessions;
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : '获取置顶会话失败';
      console.error('获取置顶会话失败:', error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnpinnedConversations(userId?: number) {
    loading.value = true;
    error.value = null;
    try {
      const currentUserId = userId || getCurrentUserId();
      
      const response = await getUnpinnedConversationsApi({
        userId: currentUserId,
      });

      if (response.code !== 200) {
        throw new Error(response.message || '获取未置顶会话失败');
      }
      
      const transformedSessions = response.data.map((conversation) => {
        const contactId = conversation.userId1 === currentUserId ? conversation.userId2 : conversation.userId1;
        const unreadCount = conversation.userId1 === currentUserId ? conversation.user1UnreadCount : conversation.user2UnreadCount;
        
        return {
          id: conversation.id,
          contactId: contactId,
          lastMessage: conversation.lastMessageContent || '',
          unreadCount: unreadCount,
          isPinned: false,
          lastActivityTime: conversation.lastMessageTime || '',
          createdAt: conversation.createTime || '',
        };
      });
      
      return transformedSessions;
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : '获取未置顶会话失败';
      console.error('获取未置顶会话失败:', error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  }

  async function fetchConversationUnreadCount(conversationId: number, userId?: number) {
    try {
      const currentUserId = userId || getCurrentUserId();
      const response = await getConversationUnreadCountApi({
        userId: currentUserId,
        conversationId,
      });

      if (response.code !== 200) {
        throw new Error(response.message || '获取会话未读消息数失败');
      }
      
      return response.data;
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取会话未读消息数失败';
      console.error('获取会话未读消息数失败:', error_);
      throw error_;
    }
  }

  async function initializeData() {
    await fetchChatSessions();
    await fetchUnreadCount();
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
    markMessageAsRead,
    setConnectionStatus,
    setTypingStatus,
    fetchChatSessions,
    fetchChatMessages,
    sendMessage,
    recallMessage,
    deleteMessage,
    pinConversation,
    deleteConversation,
    markMessageAsRead,
    markConversationAsRead,
    fetchUnreadCount,
    getOrCreateConversation,
    fetchPinnedConversations,
    fetchUnpinnedConversations,
    fetchConversationUnreadCount,
    initializeData,
    setMessages,
    setupWebSocketListeners,
    cleanupWebSocketListeners,
    $reset,
  };
});
