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
    console.warn('WebSocket连接已禁用');
    connecting.value = false;
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
