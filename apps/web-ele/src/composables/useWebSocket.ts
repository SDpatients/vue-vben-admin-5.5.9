import { onUnmounted, ref } from 'vue';

interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'MESSAGE_RECALLED' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE';
  userId: number;
  title: string;
  content: string;
  data: any;
  timestamp: number;
}

export function useWebSocket() {
  const isConnected = ref(false);
  const ws = ref<WebSocket | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;
  const messageHandlers = new Map<string, (data: any) => void>();

  const getToken = (): string => {
    return localStorage.getItem('token') || '';
  };

  const getWebSocketUrl = (): string => {
    throw new Error('WebSocket连接已禁用');
  };

  const connect = () => {
    return Promise.reject(new Error('WebSocket连接已禁用'));
  };

  const disconnect = () => {
    if (ws.value && isConnected.value) {
      ws.value.close(1000, '用户主动断开');
      isConnected.value = false;
      ws.value = null;
    }
  };

  const reconnect = async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      return;
    }

    reconnectAttempts.value++;
    console.log(`尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts})...`);

    try {
      await connect();
    } catch (error) {
      console.error('重连失败:', error);
      setTimeout(() => {
        reconnect();
      }, reconnectInterval);
    }
  };

  const send = (data: any) => {
    if (!ws.value || !isConnected.value) {
      console.warn('WebSocket未连接，无法发送消息');
      return false;
    }

    try {
      ws.value.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
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
    });
  };

  const markMessageAsRead = (messageId: number) => {
    return send({
      type: 'MARK_READ',
      data: { messageId },
    });
  };

  const recallMessage = (messageId: number) => {
    return send({
      type: 'RECALL_MESSAGE',
      data: { messageId },
    });
  };

  const sendTypingStatus = (conversationId: number) => {
    return send({
      type: 'TYPING',
      data: { conversationId },
    });
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    reconnect,
    send,
    sendChatMessage,
    markMessageAsRead,
    recallMessage,
    sendTypingStatus,
  };
}
