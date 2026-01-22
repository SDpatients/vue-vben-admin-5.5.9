import { ref, onUnmounted } from 'vue';

interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'MESSAGE_RECALLED' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE' | 'CONVERSATION_UPDATE' | 'CONVERSATION_DELETE';
  userId: number;
  title: string;
  content: string;
  data: any;
  timestamp: number;
}

interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: number | null;
  pendingMessages: number;
  errorCount: number;
}

export function useRealTimeSync() {
  const isConnected = ref(false);
  const ws = ref<WebSocket | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 10;
  const reconnectInterval = 3000;
  const heartbeatInterval = 30000;
  let heartbeatTimer: number | null = null;
  let reconnectTimer: number | null = null;
  
  const syncStatus = ref<SyncStatus>({
    isConnected: false,
    lastSyncTime: null,
    pendingMessages: 0,
    errorCount: 0
  });
  
  const getToken = (): string => {
    return localStorage.getItem('token') || '';
  };
  
  const getUserId = (): string => {
    return localStorage.getItem('chat_user_id') || '1';
  };
  
  const getWebSocketUrl = (): string => {
    throw new Error('WebSocket连接已禁用');
  };
  
  const startHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    
    heartbeatTimer = window.setInterval(() => {
      if (ws.value && isConnected.value) {
        try {
          ws.value.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
          console.log('发送心跳包');
        } catch (error) {
          console.error('发送心跳包失败:', error);
        }
      }
    }, heartbeatInterval);
  };
  
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };
  
  const updateSyncStatus = (status: Partial<SyncStatus>) => {
    syncStatus.value = { ...syncStatus.value, ...status };
    console.log('同步状态更新:', syncStatus.value);
    
    // 触发同步状态事件
    const event = new CustomEvent('sync-status', {
      detail: syncStatus.value
    });
    window.dispatchEvent(event);
  };
  
  const connect = () => {
    return Promise.reject(new Error('WebSocket连接已禁用'));
  };
  
  const scheduleReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    
    reconnectAttempts.value++;
    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts.value - 1), 30000);
    
    console.log(`计划在${delay}ms后重连 (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
    
    reconnectTimer = window.setTimeout(() => {
      reconnect();
    }, delay);
  };
  
  const reconnect = async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      updateSyncStatus({
        errorCount: syncStatus.value.errorCount + 1
      });
      return;
    }
    
    console.log(`尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
    
    try {
      await connect();
    } catch (error) {
      console.error('重连失败:', error);
      scheduleReconnect();
    }
  };
  
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    stopHeartbeat();
    
    if (ws.value && isConnected.value) {
      ws.value.close(1000, '用户主动断开');
      isConnected.value = false;
      ws.value = null;
      
      updateSyncStatus({
        isConnected: false
      });
    }
  };
  
  const send = (data: any) => {
    if (!ws.value || !isConnected.value) {
      console.warn('WebSocket未连接，无法发送消息');
      return false;
    }
    
    try {
      const message = JSON.stringify(data);
      ws.value.send(message);
      console.log('发送WebSocket消息:', data);
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      updateSyncStatus({
        errorCount: syncStatus.value.errorCount + 1,
        pendingMessages: syncStatus.value.pendingMessages + 1
      });
      return false;
    }
  };
  
  const sendChatMessage = (messageData: {
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  }) => {
    return send({
      type: 'SEND_MESSAGE',
      data: messageData,
      timestamp: Date.now()
    });
  };
  
  const markMessageAsRead = (messageId: number) => {
    return send({
      type: 'MARK_READ',
      data: { messageId },
      timestamp: Date.now()
    });
  };
  
  const recallMessage = (messageId: number) => {
    return send({
      type: 'RECALL_MESSAGE',
      data: { messageId },
      timestamp: Date.now()
    });
  };
  
  const sendTypingStatus = (conversationId: number) => {
    return send({
      type: 'TYPING',
      data: { conversationId },
      timestamp: Date.now()
    });
  };
  
  const requestConversationSync = (conversationId: number) => {
    return send({
      type: 'REQUEST_CONVERSATION_SYNC',
      data: { conversationId },
      timestamp: Date.now()
    });
  };
  
  const requestConversationListSync = (userId: number) => {
    return send({
      type: 'REQUEST_CONVERSATION_LIST_SYNC',
      data: { userId },
      timestamp: Date.now()
    });
  };
  
  const getSyncStatus = () => {
    return syncStatus.value;
  };
  
  onUnmounted(() => {
    disconnect();
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    
    stopHeartbeat();
  });
  
  return {
    isConnected,
    syncStatus,
    getSyncStatus,
    connect,
    disconnect,
    reconnect,
    send,
    sendChatMessage,
    markMessageAsRead,
    recallMessage,
    sendTypingStatus,
    requestConversationSync,
    requestConversationListSync
  };
}
