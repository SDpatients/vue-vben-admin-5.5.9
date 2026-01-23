import { onUnmounted, ref } from 'vue';

interface WebSocketMessage {
  type:
    | 'CONVERSATION_DELETE'
    | 'CONVERSATION_UPDATE'
    | 'MESSAGE_READ'
    | 'MESSAGE_RECALLED'
    | 'NEW_MESSAGE'
    | 'TYPING'
    | 'USER_OFFLINE'
    | 'USER_ONLINE';
  userId: number;
  title: string;
  content: string;
  data: any;
  timestamp: number;
}

interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: null | number;
  pendingMessages: number;
  errorCount: number;
}

export function useRealTimeSync() {
  const isConnected = ref(false);
  const ws = ref<null | WebSocket>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 10;
  const reconnectInterval = 3000;
  const heartbeatInterval = 30_000;
  let heartbeatTimer: null | number = null;
  let reconnectTimer: null | number = null;

  const syncStatus = ref<SyncStatus>({
    isConnected: false,
    lastSyncTime: null,
    pendingMessages: 0,
    errorCount: 0,
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
          ws.value.send(
            JSON.stringify({ type: 'PING', timestamp: Date.now() }),
          );
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

    const event = new CustomEvent('sync-status', {
      detail: syncStatus.value,
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
    const delay = Math.min(
      reconnectInterval * 2 ** (reconnectAttempts.value - 1),
      30_000,
    );

    reconnectTimer = window.setTimeout(() => {
      reconnect();
    }, delay);
  };

  const reconnect = async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      updateSyncStatus({
        errorCount: syncStatus.value.errorCount + 1,
      });
      return;
    }

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
        isConnected: false,
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
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      updateSyncStatus({
        errorCount: syncStatus.value.errorCount + 1,
        pendingMessages: syncStatus.value.pendingMessages + 1,
      });
      return false;
    }
  };

  const sendChatMessage = (messageData: {
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    messageType: 'FILE' | 'IMAGE' | 'TEXT' | 'VIDEO' | 'VOICE';
    receiverId: number;
  }) => {
    return send({
      type: 'SEND_MESSAGE',
      data: messageData,
      timestamp: Date.now(),
    });
  };

  const markMessageAsRead = (messageId: number) => {
    return send({
      type: 'MARK_READ',
      data: { messageId },
      timestamp: Date.now(),
    });
  };

  const recallMessage = (messageId: number) => {
    return send({
      type: 'RECALL_MESSAGE',
      data: { messageId },
      timestamp: Date.now(),
    });
  };

  const sendTypingStatus = (conversationId: number) => {
    return send({
      type: 'TYPING',
      data: { conversationId },
      timestamp: Date.now(),
    });
  };

  const requestConversationSync = (conversationId: number) => {
    return send({
      type: 'REQUEST_CONVERSATION_SYNC',
      data: { conversationId },
      timestamp: Date.now(),
    });
  };

  const requestConversationListSync = (userId: number) => {
    return send({
      type: 'REQUEST_CONVERSATION_LIST_SYNC',
      data: { userId },
      timestamp: Date.now(),
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
    requestConversationListSync,
  };
}
