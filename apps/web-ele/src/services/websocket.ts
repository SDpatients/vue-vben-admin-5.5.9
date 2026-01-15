import { Client, type StompSubscription } from '@stomp/stompjs';

interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'MESSAGE_RECALLED' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE';
  userId: number;
  title: string;
  content: string;
  data: any;
  timestamp: number;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isConnected = false;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getUserId(): string {
    return localStorage.getItem('chat_user_id') || '1';
  }

  private getWebSocketUrl(): string {
    const token = this.getToken();
    // 使用相对路径，通过Vite代理连接到后端WebSocket服务
    // Vite配置中已将/ws代理到http://192.168.0.120:8080/ws
    return `ws://localhost:5779/ws?token=${encodeURIComponent(token)}`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          // 使用原生WebSocket，通过Vite代理连接
          brokerURL: this.getWebSocketUrl(),
          // token已经通过query参数传递，不需要在header中传递
          connectHeaders: {},
          debug: (str) => {
            console.log('[STOMP]', str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log('WebSocket 连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.subscribeToNotifications();
          this.subscribeToTypingStatus();
          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error('WebSocket STOMP 错误:', frame);
          this.isConnected = false;
          reject(new Error(frame.headers['message'] || 'STOMP 连接失败'));
        };

        this.client.onWebSocketClose = () => {
          console.log('WebSocket 连接关闭');
          this.isConnected = false;
          this.subscriptions.clear();
        };

        this.client.onWebSocketError = (event) => {
          console.error('WebSocket 错误:', event);
          this.isConnected = false;
          reject(new Error('WebSocket 连接错误'));
        };

        this.client.activate();
      } catch (error) {
        console.error('WebSocket 初始化失败:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
      console.log('WebSocket 已断开连接');
    }
  }

  private subscribeToNotifications(): void {
    if (!this.client) return;

    const subscription = this.client.subscribe('/user/queue/notifications', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('收到通知:', data);
        this.handleNotification(data);
      } catch (error) {
        console.error('解析通知消息失败:', error);
      }
    });

    this.subscriptions.set('notifications', subscription);
  }

  private subscribeToTypingStatus(): void {
    if (!this.client) return;

    const subscription = this.client.subscribe('/topic/chat/typing', (message) => {
      try {
        const data = message.body;
        console.log('收到输入状态:', data);
        this.handleTypingStatus(data);
      } catch (error) {
        console.error('解析输入状态消息失败:', error);
      }
    });

    this.subscriptions.set('typing', subscription);
  }

  private handleNotification(data: WebSocketMessage): void {
    switch (data.type) {
      case 'NEW_MESSAGE':
        this.emit('NEW_MESSAGE', data);
        break;
      case 'MESSAGE_READ':
        this.emit('MESSAGE_READ', data);
        break;
      case 'MESSAGE_RECALLED':
        this.emit('MESSAGE_RECALLED', data);
        break;
      case 'USER_ONLINE':
        this.emit('USER_ONLINE', data);
        break;
      case 'USER_OFFLINE':
        this.emit('USER_OFFLINE', data);
        break;
      default:
        break;
    }
  }

  private handleTypingStatus(data: string): void {
    const [userId, conversationId] = data.split(':');
    this.emit('TYPING', { userId: Number.parseInt(userId), conversationId: Number.parseInt(conversationId) });
  }

  sendMessage(messageData: {
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  }): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat/send',
        body: JSON.stringify(messageData),
      });
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  }

  markMessageRead(messageId: number): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket 未连接，无法标记消息已读');
      return false;
    }

    try {
      this.client.publish({
        destination: `/app/chat/read/${messageId}`,
        body: JSON.stringify({}),
      });
      return true;
    } catch (error) {
      console.error('标记消息已读失败:', error);
      return false;
    }
  }

  recallMessage(messageId: number): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket 未连接，无法撤回消息');
      return false;
    }

    try {
      this.client.publish({
        destination: `/app/chat/recall/${messageId}`,
        body: JSON.stringify({}),
      });
      return true;
    } catch (error) {
      console.error('撤回消息失败:', error);
      return false;
    }
  }

  sendTypingStatus(conversationId: number): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket 未连接，无法发送输入状态');
      return false;
    }

    try {
      this.client.publish({
        destination: `/app/chat/typing/${conversationId}`,
        body: JSON.stringify({}),
      });
      return true;
    } catch (error) {
      console.error('发送输入状态失败:', error);
      return false;
    }
  }

  on(event: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`处理事件 ${event} 时出错:`, error);
        }
      });
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
