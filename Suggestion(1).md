
根据对后端代码的分析，我来详细说明前端应该如何实现聊天模块和实时通讯。

## 后端架构总结

### WebSocket配置
- **连接端点**: `/ws` (支持SockJS降级)
- **消息代理**: `/topic` (广播)、`/queue` (点对点)
- **应用前缀**: `/app`
- **用户前缀**: `/user`
- **认证方式**: JWT Token

### 核心接口
**WebSocket实时接口:**
- `/app/chat/send` - 发送消息
- `/app/chat/read/{messageId}` - 标记消息已读
- `/app/chat/recall/{messageId}` - 撤回消息
- `/app/chat/typing/{conversationId}` - 正在输入状态

**REST API接口:**
- 会话管理：获取/创建会话、会话列表、置顶、删除
- 消息管理：发送、撤回、删除、已读标记
- 未读统计：总未读数、会话未读数

---

## 前端实现方案

### 1. 技术栈选择

```javascript
// 推荐技术栈
- WebSocket库: @stomp/stompjs 或 sockjs-client + stompjs
- 状态管理: Redux Toolkit / Zustand / Pinia
- UI框架: React / Vue 3
- HTTP客户端: Axios
```

### 2. WebSocket连接管理

```javascript
// services/websocket.js
import { Client } from '@stomp/stompjs';
import { getToken } from './auth';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
  }

  connect() {
    const token = getToken();
    
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket连接成功');
      this.subscribeToNotifications();
      this.subscribeToTypingStatus();
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket错误:', frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  // 订阅个人通知队列
  subscribeToNotifications() {
    this.subscriptions.notifications = this.client.subscribe(
      '/user/queue/notifications',
      (message) => {
        const data = JSON.parse(message.body);
        this.handleNotification(data);
      }
    );
  }

  // 订阅正在输入状态
  subscribeToTypingStatus() {
    this.subscriptions.typing = this.client.subscribe(
      '/topic/chat/typing',
      (message) => {
        const data = message.body;
        this.handleTypingStatus(data);
      }
    );
  }

  // 发送消息
  sendMessage(messageData) {
    this.client.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(messageData)
    });
  }

  // 标记消息已读
  markMessageRead(messageId) {
    this.client.publish({
      destination: `/app/chat/read/${messageId}`,
      body: JSON.stringify({})
    });
  }

  // 撤回消息
  recallMessage(messageId) {
    this.client.publish({
      destination: `/app/chat/recall/${messageId}`,
      body: JSON.stringify({})
    });
  }

  // 发送正在输入状态
  sendTypingStatus(conversationId) {
    this.client.publish({
      destination: `/app/chat/typing/${conversationId}`,
      body: JSON.stringify({})
    });
  }

  handleNotification(data) {
    // 处理不同类型的通知
    switch (data.type) {
      case 'NEW_MESSAGE':
        // 新消息通知
        break;
      case 'MESSAGE_READ':
        // 消息已读通知
        break;
      case 'MESSAGE_RECALLED':
        // 消息撤回通知
        break;
      default:
        break;
    }
  }

  handleTypingStatus(data) {
    // 处理正在输入状态
    const [userId, conversationId] = data.split(':');
    // 更新UI显示正在输入状态
  }
}

export default new WebSocketService();
```

### 3. 聊天状态管理 (Zustand示例)

```javascript
// stores/chatStore.js
import { create } from 'zustand';
import { chatApi } from '@/api/chat';

export const useChatStore = create((set, get) => ({
  // 状态
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  typingUsers: new Map(),

  // 获取会话列表
  fetchConversations: async (userId) => {
    const response = await chatApi.getConversations(userId);
    set({ conversations: response.data });
  },

  // 获取当前会话消息
  fetchMessages: async (conversationId, pageNum = 1) => {
    const response = await chatApi.getMessages(conversationId, pageNum);
    set((state) => ({
      messages: pageNum === 1 
        ? response.data.list 
        : [...response.data.list, ...state.messages]
    }));
  },

  // 发送消息
  sendMessage: async (senderId, messageData) => {
    const response = await chatApi.sendMessage(senderId, messageData);
    set((state) => ({
      messages: [...state.messages, response.data]
    }));
    return response.data;
  },

  // 标记消息已读
  markMessageRead: async (userId, messageId) => {
    const response = await chatApi.markMessageRead(userId, messageId);
    set((state) => ({
      messages: state.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...response.data } : msg
      )
    }));
  },

  // 标记会话已读
  markConversationRead: async (userId, conversationId) => {
    await chatApi.markConversationRead(userId, conversationId);
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    }));
  },

  // 撤回消息
  recallMessage: async (userId, messageId) => {
    const response = await chatApi.recallMessage(userId, messageId);
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...response.data } : msg
      )
    }));
  },

  // 删除消息
  deleteMessage: async (userId, messageId) => {
    await chatApi.deleteMessage(userId, messageId);
    set((state) => ({
      messages: state.messages.filter(msg => msg.id !== messageId)
    }));
  },

  // 置顶会话
  pinConversation: async (userId, conversationId, pinned) => {
    await chatApi.pinConversation(userId, conversationId, pinned);
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId ? { ...conv, pinned } : conv
      )
    }));
  },

  // 获取未读消息数
  fetchUnreadCount: async (userId) => {
    const response = await chatApi.getUnreadCount(userId);
    set({ unreadCount: response.data.totalUnread });
  },

  // 设置当前会话
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  // 添加新消息
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  // 更新正在输入状态
  setTypingStatus: (conversationId, userId, isTyping) => {
    set((state) => {
      const typingUsers = new Map(state.typingUsers);
      if (isTyping) {
        typingUsers.set(`${conversationId}-${userId}`, Date.now());
      } else {
        typingUsers.delete(`${conversationId}-${userId}`);
      }
      return { typingUsers };
    });
  },
}));
```

### 4. API服务封装

```javascript
// api/chat.js
import request from './request';

export const chatApi = {
  // 获取或创建会话
  getOrCreateConversation: (userId1, userId2) => {
    return request.get('/chat/conversation', {
      params: { userId1, userId2 }
    });
  },

  // 获取会话列表
  getConversations: (userId) => {
    return request.get('/chat/conversations', {
      params: { userId }
    });
  },

  // 获取置顶会话
  getPinnedConversations: (userId) => {
    return request.get('/chat/conversations/pinned', {
      params: { userId }
    });
  },

  // 获取未置顶会话
  getUnpinnedConversations: (userId) => {
    return request.get('/chat/conversations/unpinned', {
      params: { userId }
    });
  },

  // 获取会话消息
  getMessages: (conversationId, pageNum = 1, pageSize = 20) => {
    return request.get('/chat/messages', {
      params: { conversationId, pageNum, pageSize }
    });
  },

  // 发送消息
  sendMessage: (senderId, data) => {
    return request.post('/chat/messages', data, {
      params: { senderId }
    });
  },

  // 标记消息已读
  markMessageRead: (userId, messageId) => {
    return request.put('/chat/messages/read', { messageId }, {
      params: { userId }
    });
  },

  // 标记会话已读
  markConversationRead: (userId, conversationId) => {
    return request.put('/chat/conversations/read', null, {
      params: { userId, conversationId }
    });
  },

  // 撤回消息
  recallMessage: (userId, messageId) => {
    return request.put('/chat/messages/recall', { messageId }, {
      params: { userId }
    });
  },

  // 删除消息
  deleteMessage: (userId, messageId) => {
    return request.delete('/chat/messages', {
      data: { messageId },
      params: { userId }
    });
  },

  // 删除会话
  deleteConversation: (userId, conversationId) => {
    return request.delete('/chat/conversations', {
      params: { userId, conversationId }
    });
  },

  // 置顶/取消置顶会话
  pinConversation: (userId, conversationId, pinned) => {
    return request.put('/chat/conversations/pin', 
      { conversationId, pinned },
      { params: { userId } }
    );
  },

  // 获取总未读消息数
  getUnreadCount: (userId) => {
    return request.get('/chat/unread/count', {
      params: { userId }
    });
  },

  // 获取会话未读消息数
  getConversationUnreadCount: (userId, conversationId) => {
    return request.get('/chat/conversations/unread/count', {
      params: { userId, conversationId }
    });
  }
};
```

### 5. 聊天组件实现

```javascript
// components/Chat/ChatWindow.jsx
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { webSocketService } from '@/services/websocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversation }) => {
  const { user } = useAuthStore();
  const { 
    messages, 
    fetchMessages, 
    sendMessage,
    markConversationRead,
    setTypingStatus
  } = useChatStore();
  
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
      markConversationRead(user.id, conversation.id);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content, messageType = 'TEXT', fileData = null) => {
    const messageData = {
      receiverId: conversation.userId1 === user.id 
        ? conversation.userId2 
        : conversation.userId1,
      messageType,
      content,
      ...fileData
    };

    // 通过REST API发送消息
    await sendMessage(user.id, messageData);
    
    // 同时通过WebSocket发送（可选，取决于后端实现）
    // webSocketService.sendMessage(messageData);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      webSocketService.sendTypingStatus(conversation.id);
    }

    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3秒后停止输入状态
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{conversation.otherUserName}</h3>
      </div>
      
      <MessageList 
        messages={messages}
        currentUserId={user.id}
        messagesEndRef={messagesEndRef}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;
```

### 6. 应用初始化

```javascript
// App.jsx 或 main.js
import { useEffect } from 'react';
import { webSocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.token) {
      // 用户登录后连接WebSocket
      webSocketService.connect();
    }

    return () => {
      // 组件卸载时断开连接
      webSocketService.disconnect();
    };
  }, [user]);

  return (
    // 你的应用组件
  );
}

export default App;
```

---

## 实时通讯实现要点

### 1. 连接管理
- **登录后连接**: 用户登录成功后立即建立WebSocket连接
- **Token传递**: 在连接头中携带JWT Token进行认证
- **断线重连**: 配置自动重连机制（5秒间隔）
- **心跳保活**: 配置心跳机制保持连接活跃

### 2. 消息订阅
- **个人队列**: `/user/queue/notifications` - 接收个人通知
- **广播主题**: `/topic/chat/typing` - 接收正在输入状态
- **会话订阅**: 可以为每个会话创建独立订阅

### 3. 消息发送
- **REST API + WebSocket**: 可以同时使用两种方式发送消息
- **消息确认**: 发送后等待服务器确认
- **错误处理**: 处理发送失败情况，提供重试机制

### 4. 状态同步
- **实时更新**: 通过WebSocket实时接收新消息
- **已读状态**: 实时同步消息已读状态
- **撤回通知**: 实时接收消息撤回通知
- **正在输入**: 显示对方正在输入状态

### 5. 优化建议
- **消息缓存**: 本地缓存消息历史，减少网络请求
- **分页加载**: 实现消息分页加载，支持滚动加载历史消息
- **离线消息**: 处理离线期间的消息同步
- **消息去重**: 避免重复显示同一条消息

---

## 总结

后端已经提供了完整的WebSocket和REST API支持，前端需要：

1. **使用STOMP协议**建立WebSocket连接
2. **订阅个人通知队列**接收实时消息
3. **封装API服务**处理REST API调用
4. **使用状态管理**管理聊天状态
5. **实现UI组件**展示聊天界面
6. **处理实时事件**更新UI状态

这样可以实现一个功能完整、实时性强的聊天系统。