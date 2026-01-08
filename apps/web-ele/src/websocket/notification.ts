import { ref, onUnmounted } from 'vue';

let ws: WebSocket | null = null;
const messageHandlers: Array<(data: any) => void> = [];
let reconnectTimer: null | number = null;
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

export function useWebSocket() {
  const connected = ref(false);
  const connecting = ref(false);

  const connect = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (connecting.value) {
      return;
    }

    connecting.value = true;

    const token = localStorage.getItem('token');
    // 使用当前页面的协议和主机，通过代理连接WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}/ws`;

    try {
      ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token || '')}`);

      ws.onopen = () => {
        console.log('WebSocket连接成功');
        connected.value = true;
        connecting.value = false;
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          messageHandlers.forEach((handler) => {
            try {
              handler(data);
            } catch (error) {
              console.error('消息处理器执行失败:', error);
            }
          });
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        connected.value = false;
        connecting.value = false;
      };

      ws.onclose = () => {
        console.log('WebSocket连接关闭');
        connected.value = false;
        connecting.value = false;

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimer = window.setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.error('达到最大重连次数，停止重连');
        }
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      connected.value = false;
      connecting.value = false;
    }
  };

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) {
      ws.close();
      ws = null;
      connected.value = false;
      connecting.value = false;
    }
  };

  const onMessage = (handler: (data: any) => void) => {
    messageHandlers.push(handler);
  };

  const offMessage = (handler: (data: any) => void) => {
    const index = messageHandlers.indexOf(handler);
    if (index > -1) {
      messageHandlers.splice(index, 1);
    }
  };

  const clearMessageHandlers = () => {
    messageHandlers.length = 0;
  };

  onUnmounted(() => {
    disconnect();
    clearMessageHandlers();
  });

  return {
    connected,
    connecting,
    connect,
    disconnect,
    onMessage,
    offMessage,
    clearMessageHandlers,
  };
}
