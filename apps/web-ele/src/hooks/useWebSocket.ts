import { ref, onUnmounted } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { ElMessage } from 'element-plus';

export const useWebSocket = () => {
  const socket = ref<any>(null);
  const stompClient = ref<any>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connectWebSocket = () => {
    try {
      console.log('=== 开始连接WebSocket ===');
      
     // 获取Token
      const token = localStorage.getItem('token');
      
      // 创建SockJS连接（使用相对路径，通过Vite代理）
      let sockJsUrl = '/api/v1/ws';
      
      // 在URL中添加token查询参数（握手阶段需要）
      if (token) {
        const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
        sockJsUrl += `?token=${encodeURIComponent(tokenValue)}`;
        console.log('WebSocket连接URL（带token）:', sockJsUrl);
      }
      
      socket.value = new SockJS(sockJsUrl);
      
      // 创建STOMP客户端
      stompClient.value = Stomp.over(socket.value);
      
      // 配置调试
      stompClient.value.debug = (str: string) => {
        console.log('STOMP调试:', str);
      };
      
      // 连接回调
      const onConnect = (frame: any) => {
        console.log('=== WebSocket连接成功 ===', frame);
        isConnected.value = true;
        reconnectAttempts.value = 0;
        
        // 订阅文件操作通知
        subscribeToFileOperations();
        
        ElMessage.success('WebSocket连接成功');
      };
      
      // 错误回调
      const onError = (error: any) => {
        console.error('=== WebSocket连接错误 ===', error);
        isConnected.value = false;
        
        // 尝试重连
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          console.log(`=== 尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts}) ===`);
          setTimeout(connectWebSocket, reconnectDelay);
        } else {
          ElMessage.error('WebSocket连接失败，请刷新页面重试');
        }
      };
      
      // 断开连接回调
      const onDisconnect = () => {
        console.log('=== WebSocket连接断开 ===');
        isConnected.value = false;
      };
      
      // 准备连接头（STOMP连接阶段需要）
      const headers: any = {};
      if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log('STOMP连接头（带token）:', headers);
      }
      
      // 连接到WebSocket服务器
      stompClient.value.connect(headers, onConnect, onError);
      
      // 监听连接断开
      socket.value.onclose = onDisconnect;
      
    } catch (error) {
      console.error('=== WebSocket连接初始化失败 ===', error);
      ElMessage.error('WebSocket连接初始化失败');
    }
  };

  const disconnectWebSocket = () => {
    try {
      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.disconnect(() => {
          console.log('=== WebSocket断开连接 ===');
          isConnected.value = false;
        });
      }
      
      if (socket.value) {
        socket.value.close();
      }
    } catch (error) {
      console.error('=== WebSocket断开连接失败 ===', error);
    }
  };

  const subscribeToFileOperations = () => {
    if (stompClient.value && stompClient.value.connected) {
      console.log('=== 开始订阅文件操作通知 ===');
      
      // 订阅文件操作通知
      const subscription = stompClient.value.subscribe('/topic/file-operations', (message: any) => {
        console.log('=== 收到文件操作通知 ===', message);
        
        try {
          const fileOperation = JSON.parse(message.body);
          console.log('=== 文件操作通知内容 ===', fileOperation);
          
          // 处理文件操作通知
          handleFileOperationNotification(fileOperation);
          
        } catch (error) {
          console.error('=== 解析文件操作通知失败 ===', error);
        }
      });
      
      console.log('=== 文件操作通知订阅成功 ===', subscription);
    }
  };

  const handleFileOperationNotification = (operation: any) => {
    console.log('=== 处理文件操作通知 ===', operation);
    
    switch (operation.type) {
      case 'FILE_UPLOAD_SUCCESS':
        ElMessage.success(`文件上传成功: ${operation.data.fileName}`);
        break;
      case 'FILE_DELETE_SUCCESS':
        ElMessage.success('文件删除成功');
        break;
      case 'FILE_UPDATE_SUCCESS':
        ElMessage.success('文件更新成功');
        break;
      default:
        console.log('=== 未知文件操作类型 ===', operation.type);
    }
  };

  const sendMessage = (destination: string, message: any) => {
    if (stompClient.value && stompClient.value.connected) {
      try {
        stompClient.value.send(destination, {}, JSON.stringify(message));
        console.log('=== 发送WebSocket消息 ===', destination, message);
        return true;
      } catch (error) {
        console.error('=== 发送WebSocket消息失败 ===', error);
        return false;
      }
    } else {
      console.error('=== WebSocket未连接，无法发送消息 ===');
      return false;
    }
  };

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnectWebSocket();
  });

  return {
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    isConnected
  };
};
