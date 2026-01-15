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
    const token = getToken();
    const userId = getUserId();
    
    // 尝试多种可能的WebSocket URL格式
    const baseUrl = 'http://localhost:5779';
    const wsUrl1 = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/ws?token=${token}&userId=${userId}`;
    const wsUrl2 = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/chat/ws?token=${token}&userId=${userId}`;
    const wsUrl3 = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/websocket?token=${token}&userId=${userId}`;
    
    console.log('===== WebSocket URL 测试 =====');
    console.log('Token:', token);
    console.log('用户ID:', userId);
    console.log('基础URL:', baseUrl);
    console.log('尝试URL1:', wsUrl1);
    console.log('尝试URL2:', wsUrl2);
    console.log('尝试URL3:', wsUrl3);
    
    // 先尝试第一种URL格式
    return wsUrl1;
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
    return new Promise<void>((resolve, reject) => {
      try {
        const url = getWebSocketUrl();
        console.log('===== WebSocket连接开始 =====');
        console.log('WebSocket URL:', url);
        console.log('Token:', getToken());
        console.log('用户ID:', getUserId());
        
        if (!getToken()) {
          console.error('❌ Token为空，无法连接WebSocket');
          updateSyncStatus({
            isConnected: false,
            errorCount: syncStatus.value.errorCount + 1
          });
          reject(new Error('Token为空'));
          return;
        }
        
        ws.value = new WebSocket(url);
        
        // 设置连接超时
        const connectionTimeout = setTimeout(() => {
          if (!isConnected.value) {
            console.error('❌ WebSocket连接超时（5秒）');
            ws.value?.close();
            updateSyncStatus({
              isConnected: false,
              errorCount: syncStatus.value.errorCount + 1
            });
            reject(new Error('WebSocket连接超时'));
          }
        }, 5000);
        
        ws.value.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket连接成功');
          console.log('连接状态:', ws.value?.readyState);
          isConnected.value = true;
          reconnectAttempts.value = 0;
          
          updateSyncStatus({
            isConnected: true,
            lastSyncTime: Date.now(),
            errorCount: 0
          });
          
          // 启动心跳
          startHeartbeat();
          
          // 触发连接成功事件
          const event = new CustomEvent('ws-connected', {
            detail: { timestamp: Date.now(), readyState: ws.value?.readyState }
          });
          window.dispatchEvent(event);
          
          resolve();
        };
        
        ws.value.onmessage = (event: MessageEvent) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('收到WebSocket消息:', message);
            
            // 更新最后同步时间
            updateSyncStatus({
              lastSyncTime: Date.now()
            });
            
            // 处理不同类型的消息
            if (message.type === 'NEW_MESSAGE') {
              const event = new CustomEvent('chat-message', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'MESSAGE_READ') {
              const event = new CustomEvent('chat-message-read', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'MESSAGE_RECALLED') {
              const event = new CustomEvent('chat-message-recalled', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'CONVERSATION_UPDATE') {
              const event = new CustomEvent('conversation-update', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'CONVERSATION_DELETE') {
              const event = new CustomEvent('conversation-delete', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'TYPING') {
              const event = new CustomEvent('chat-typing', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'USER_ONLINE') {
              const event = new CustomEvent('chat-user-online', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'USER_OFFLINE') {
              const event = new CustomEvent('chat-user-offline', {
                detail: message,
              });
              window.dispatchEvent(event);
            } else if (message.type === 'PONG') {
              console.log('收到心跳响应');
            }
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
            updateSyncStatus({
              errorCount: syncStatus.value.errorCount + 1
            });
          }
        };
        
        ws.value.onerror = (error: Event) => {
          console.error('❌ WebSocket错误:', error);
          console.error('错误类型:', error.type);
          console.error('错误消息:', error.message);
          console.error('当前连接状态:', ws.value?.readyState);
          
          isConnected.value = false;
          
          updateSyncStatus({
            isConnected: false,
            errorCount: syncStatus.value.errorCount + 1
          });
          
          // 触发连接错误事件
          const event = new CustomEvent('ws-error', {
            detail: { error, timestamp: Date.now() }
          });
          window.dispatchEvent(event);
          
          reject(error);
        };
        
        ws.value.onclose = (event: CloseEvent) => {
          console.log('WebSocket连接关闭:', event);
          isConnected.value = false;
          
          updateSyncStatus({
            isConnected: false
          });
          
          // 停止心跳
          stopHeartbeat();
          
          // 清除连接超时
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
          }
          
          // 触发连接关闭事件
          const closeEvent = new CustomEvent('ws-closed', {
            detail: { event, timestamp: Date.now() }
          });
          window.dispatchEvent(closeEvent);
          
          if (!event.wasClean && reconnectAttempts.value < maxReconnectAttempts) {
            console.log('WebSocket异常关闭，尝试重连...');
            scheduleReconnect();
          } else if (reconnectAttempts.value >= maxReconnectAttempts) {
            console.error('达到最大重连次数，停止重连');
            updateSyncStatus({
              errorCount: syncStatus.value.errorCount + 1
            });
          }
        };
      } catch (error) {
        console.error('WebSocket初始化失败:', error);
        updateSyncStatus({
          errorCount: syncStatus.value.errorCount + 1
        });
        reject(error);
      }
    });
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
