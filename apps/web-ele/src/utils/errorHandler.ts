import { ElMessage, ElNotification } from 'element-plus';

interface ApiError {
  code: number;
  message: string;
  data: any;
}

export function handleApiError(error: any): void {
  console.error('API错误:', error);

  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        ElMessage.error(data?.message || '请求参数错误');
        break;
      case 401:
        ElMessage.error('未授权，请重新登录');
        break;
      case 403:
        ElMessage.error('禁止访问');
        break;
      case 404:
        ElMessage.error('资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(data?.message || '请求失败');
    }
  } else if (error instanceof Error) {
    ElMessage.error(error.message);
  } else {
    ElMessage.error('未知错误');
  }
}

export function handleChatError(error: any): void {
  console.error('聊天功能错误:', error);
  
  if (error instanceof Error) {
    const errorMessage = error.message;
    
    if (errorMessage.includes('不能给自己发送消息')) {
      ElMessage.warning('不能给自己发送消息');
    } else if (errorMessage.includes('超过2分钟，无法撤回消息')) {
      ElMessage.warning('超过2分钟，无法撤回消息');
    } else if (errorMessage.includes('无权操作此消息')) {
      ElMessage.warning('无权操作此消息');
    } else if (errorMessage.includes('无权操作此会话')) {
      ElMessage.warning('无权操作此会话');
    } else if (errorMessage.includes('不能与自己创建会话')) {
      ElMessage.warning('不能与自己创建会话');
    } else {
      ElMessage.error(errorMessage);
    }
  } else {
    ElMessage.error('操作失败，请稍后重试');
  }
}

export function showSuccessMessage(message: string): void {
  ElMessage.success(message);
}

export function showWarningMessage(message: string): void {
  ElMessage.warning(message);
}

export function showNotification(title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info'): void {
  ElNotification({
    title,
    message,
    type,
    duration: 3000,
  });
}

export function handleWebSocketError(error: any): void {
  console.error('WebSocket错误:', error);
  
  if (error.message) {
    ElNotification({
      title: '连接错误',
      message: 'WebSocket连接失败，正在尝试重连...',
      type: 'error',
      duration: 5000,
    });
  }
}

export function handleWebSocketReconnected(): void {
  ElNotification({
    title: '连接成功',
    message: 'WebSocket已重新连接',
    type: 'success',
    duration: 3000,
  });
}

export function handleNewMessageNotification(senderName: string, content: string): void {
  ElNotification({
    title: `新消息 - ${senderName}`,
    message: content.length > 50 ? content.substring(0, 50) + '...' : content,
    type: 'info',
    duration: 3000,
  });
}
