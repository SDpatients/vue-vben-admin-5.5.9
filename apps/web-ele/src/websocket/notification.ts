import { ref, onUnmounted } from 'vue';

let ws: WebSocket | null = null;
const messageHandlers: Array<(data: any) => void> = [];

export function useWebSocket() {
  const connected = ref(false);

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('token');
    ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket连接成功');
      connected.value = true;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      connected.value = false;
    };

    ws.onclose = () => {
      console.log('WebSocket连接关闭');
      connected.value = false;
      setTimeout(() => {
        connect();
      }, 5000);
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
      connected.value = false;
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

  onUnmounted(() => {
    disconnect();
  });

  return {
    connected,
    connect,
    disconnect,
    onMessage,
    offMessage,
  };
}
