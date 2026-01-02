import { ref } from 'vue';

import { defineStore } from 'pinia';

import { updateContactStatusApi } from '../../../api/core/chat';
import { useChatStore } from './chat';
import { useContactStore } from './contact';

export const useWebSocketStore = defineStore('websocket', () => {
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = ref(5);
  const heartbeatStatus = ref(false);
  const socket: any = ref(null);
  let heartbeatInterval: null | number = null;

  const chatStore = useChatStore();
  const contactStore = useContactStore();

  function connect(token: string) {
    if (!token) {
      console.error('WebSocket连接失败: 缺少token');
      return;
    }

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
      socket.value = new WebSocket(`${wsUrl}?token=${token}`);

      socket.value.onopen = handleConnect;
      socket.value.onclose = handleDisconnect;
      socket.value.onerror = handleError;
      socket.value.onmessage = handleMessage;
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      isConnected.value = false;
      chatStore.setConnectionStatus(false);
      reconnect();
    }
  }

  function disconnect() {
    try {
      if (socket.value) {
        socket.value.onopen = null;
        socket.value.onclose = null;
        socket.value.onerror = null;
        socket.value.onmessage = null;

        socket.value.close();
        socket.value = null;
      }
      stopHeartbeat();
      isConnected.value = false;
      chatStore.setConnectionStatus(false);
    } catch (error) {
      console.error('WebSocket断开连接失败:', error);
    }
  }

  function reconnect() {
    if (reconnectAttempts.value < maxReconnectAttempts.value) {
      reconnectAttempts.value++;
      const delay = 1000 * reconnectAttempts.value;
      console.log(`WebSocket重连中 (${reconnectAttempts.value}/${maxReconnectAttempts.value}), ${delay}ms后重试...`);
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          connect(token);
        }
      }, delay);
    } else {
      console.error('WebSocket达到最大重连次数，停止重连');
    }
  }

  function sendMessage(message: any) {
    try {
      if (socket.value && isConnected.value) {
        socket.value.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket未连接，无法发送消息');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }

  function startHeartbeat() {
    heartbeatStatus.value = true;
    heartbeatInterval = window.setInterval(() => {
      if (socket.value && isConnected.value) {
        try {
          socket.value.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('发送心跳失败:', error);
          stopHeartbeat();
          reconnect();
        }
      }
    }, 30_000);
  }

  function stopHeartbeat() {
    heartbeatStatus.value = false;
    if (heartbeatInterval) {
      window.clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  function handleConnect() {
    isConnected.value = true;
    chatStore.setConnectionStatus(true);
    reconnectAttempts.value = 0;
    startHeartbeat();

    const currentUserId = localStorage.getItem('chat_user_id');
    if (currentUserId) {
      updateContactStatusApi(Number.parseInt(currentUserId), '1')
        .then(() => {
          console.log('更新在线状态成功');
        })
        .catch((error: Error) => {
          console.error('更新在线状态失败:', error);
        });
    }
  }

  function handleDisconnect() {
    isConnected.value = false;
    chatStore.setConnectionStatus(false);
    stopHeartbeat();

    const currentUserId = localStorage.getItem('chat_user_id');
    if (currentUserId) {
      updateContactStatusApi(Number.parseInt(currentUserId), '0')
        .then(() => {
          console.log('更新离线状态成功');
        })
        .catch((error: Error) => {
          console.error('更新离线状态失败:', error);
        });
    }

    reconnect();
  }

  function handleError(error: any) {
    console.error('WebSocket错误:', error);
    isConnected.value = false;
  }

  function handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          chatStore.addMessage(data.payload);
          break;
        case 'typing':
          chatStore.setTypingStatus(data.userId, true);
          break;
        case 'stopTyping':
          chatStore.setTypingStatus(data.userId, false);
          break;
        case 'onlineStatusChange':
          contactStore.updateContactOnlineStatus(data.userId, data.isOnline);
          break;
        case 'pong':
          heartbeatStatus.value = true;
          break;
        default:
          console.warn('未知的WebSocket消息类型:', data.type);
      }
    } catch (error) {
      console.error('处理WebSocket消息失败:', error);
    }
  }

  function $reset() {
    disconnect();
    isConnected.value = false;
    reconnectAttempts.value = 0;
    heartbeatStatus.value = false;
    socket.value = null;
  }

  return {
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    heartbeatStatus,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    $reset,
  };
});
