import { onUnmounted, ref } from 'vue';
import { webSocketService } from '#/services/websocket';

export function useStompWebSocket() {
  const isConnected = ref(webSocketService.getConnectionStatus());
  const syncStatus = ref<'SYNCED' | 'SYNCING' | 'FAILED'>('SYNCED');

  const connect = async () => {
    try {
      // 检查 WebSocket 是否可用
      await webSocketService.connect();
      isConnected.value = true;
      syncStatus.value = 'SYNCED';
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      isConnected.value = false;
      syncStatus.value = 'FAILED';
      // 不抛出错误，避免影响页面加载
    }
  };

  const disconnect = () => {
    webSocketService.disconnect();
    isConnected.value = false;
    syncStatus.value = 'FAILED';
  };

  const sendMessage = (messageData: {
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  }) => {
    return webSocketService.sendMessage(messageData);
  };

  const markMessageAsRead = (messageId: number) => {
    return webSocketService.markMessageRead(messageId);
  };

  const recallMessage = (messageId: number) => {
    return webSocketService.recallMessage(messageId);
  };

  const sendTypingStatus = (conversationId: number) => {
    return webSocketService.sendTypingStatus(conversationId);
  };

  const on = (event: string, handler: (data: any) => void) => {
    webSocketService.on(event, handler);
  };

  const off = (event: string, handler: (data: any) => void) => {
    webSocketService.off(event, handler);
  };

  const getSyncStatus = () => {
    return syncStatus.value;
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    syncStatus,
    getSyncStatus,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage: sendMessage,
    markMessageAsRead,
    recallMessage,
    sendTypingStatus,
    on,
    off,
  };
}
