import { onMounted, onUnmounted, ref } from 'vue';

import { defineStore } from 'pinia';

// 导入API函数
import { updateContactStatusApi } from '../../../api/core/chat';
import { useChatStore } from './chat';
import { useContactStore } from './contact';

export const useWebSocketStore = defineStore('websocket', () => {
  // 状态
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = ref(5);
  const heartbeatStatus = ref(false);
  const socket: any = ref(null);
  let heartbeatInterval: null | number = null;

  // 获取其他store
  const chatStore = useChatStore();
  const contactStore = useContactStore();

  // 方法
  function connect(_token: string) {
    try {
      // 使用Socket.IO客户端建立连接
      // 注意：实际项目中需要安装socket.io-client并导入
      // 安装命令：npm install socket.io-client
      // import { io } from 'socket.io-client';
      // socket.value = io('ws://localhost:3000', {
      //   auth: { token },
      //   reconnection: true,
      //   reconnectionAttempts: maxReconnectAttempts.value,
      //   reconnectionDelay: 1000,
      //   reconnectionDelayMax: 5000,
      // });

      // 实际项目中设置事件监听器
      // socket.value.on('connect', handleConnect);
      // socket.value.on('disconnect', handleDisconnect);
      // socket.value.on('message', handleMessage);
      // socket.value.on('typing', handleTyping);
      // socket.value.on('stopTyping', handleStopTyping);
      // socket.value.on('onlineStatusChange', handleOnlineStatusChange);
      // socket.value.on('pong', () => {
      //   // 收到服务器的心跳响应
      //   heartbeatStatus.value = true;
      // });

      // 模拟连接成功
      setTimeout(() => {
        // 调用handleConnect处理连接成功逻辑
        handleConnect();

        // 模拟收到初始在线状态数据
        // 实际项目中，服务器会在连接成功后发送所有联系人的在线状态
        // 这里模拟发送一个在线状态变化事件
        setTimeout(() => {
          handleOnlineStatusChange({ userId: 1, isOnline: true });
          handleOnlineStatusChange({ userId: 2, isOnline: false });
        }, 1000);
      }, 500);
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
        // 移除事件监听器
        socket.value.off('connect', handleConnect);
        socket.value.off('disconnect', handleDisconnect);
        socket.value.off('message', handleMessage);
        socket.value.off('typing', handleTyping);
        socket.value.off('stopTyping', handleStopTyping);
        socket.value.off('onlineStatusChange', handleOnlineStatusChange);

        // 断开连接
        socket.value.disconnect();
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
      setTimeout(() => {
        connect(''); // 实际项目中需要传入token
      }, 1000 * reconnectAttempts.value);
    }
  }

  function sendMessage(message: any) {
    try {
      if (socket.value && isConnected.value) {
        socket.value.emit('message', message);
      }
      console.warn('发送消息:', message);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }

  function startHeartbeat() {
    // 模拟心跳检测
    heartbeatStatus.value = true;
    // 实际项目中应该使用setInterval进行心跳检测
    heartbeatInterval = window.setInterval(() => {
      if (socket.value && isConnected.value) {
        // 发送心跳包
        try {
          socket.value.emit('ping');
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

  // 事件处理函数
  function handleConnect() {
    isConnected.value = true;
    chatStore.setConnectionStatus(true);
    reconnectAttempts.value = 0;
    startHeartbeat();

    // 获取当前用户ID
    const currentUserId = localStorage.getItem('chat_user_id');
    if (currentUserId) {
      // 更新当前用户在线状态为在线（1）
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

    // 获取当前用户ID
    const currentUserId = localStorage.getItem('chat_user_id');
    if (currentUserId) {
      // 更新当前用户在线状态为离线（0）
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

  function handleMessage(message: any) {
    console.warn('收到消息:', message);
    // 处理收到的消息，更新聊天store
    // chatStore.addMessage(message);
  }

  function handleTyping(data: any) {
    console.warn('用户正在输入:', data);
    // 更新输入状态
    // chatStore.setTypingStatus(data.userId, true);
  }

  function handleStopTyping(data: any) {
    console.warn('用户停止输入:', data);
    // 更新输入状态
    // chatStore.setTypingStatus(data.userId, false);
  }

  function handleOnlineStatusChange(data: any) {
    console.warn('在线状态变化:', data);
    // 更新联系人在线状态
    contactStore.updateContactOnlineStatus(data.userId, data.isOnline);
  }

  function $reset() {
    disconnect();
    isConnected.value = false;
    reconnectAttempts.value = 0;
    heartbeatStatus.value = false;
    socket.value = null;
  }

  // 生命周期钩子
  onMounted(() => {
    // 组件挂载时连接WebSocket
    // 实际项目中需要传入真实token
    connect('token');
  });

  onUnmounted(() => {
    // 组件卸载时断开WebSocket连接
    disconnect();
  });

  return {
    // 状态
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    heartbeatStatus,
    // 方法
    connect,
    disconnect,
    reconnect,
    sendMessage,
    $reset,
  };
});
