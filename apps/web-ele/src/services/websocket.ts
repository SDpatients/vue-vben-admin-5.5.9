import type { StompSubscription } from '@stomp/stompjs';

import { Client } from '@stomp/stompjs';

interface WebSocketMessage {
  type:
    | 'MESSAGE_READ'
    | 'MESSAGE_RECALLED'
    | 'NEW_MESSAGE'
    | 'TYPING'
    | 'USER_OFFLINE'
    | 'USER_ONLINE';
  userId: number;
  title: string;
  content: string;
  data: any;
  timestamp: number;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private maxReconnectAttempts = 5;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private reconnectDelay = 5000;
  private subscriptions: Map<string, StompSubscription> = new Map();

  connect(): Promise<void> {
    return Promise.reject(new Error('WebSocket连接已禁用'));
  }

  disconnect(): void {
    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
      console.log('WebSocket 已断开连接');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  markMessageRead(messageId: number): boolean {
    console.warn('WebSocket已禁用，无法标记消息已读');
    return false;
  }

  off(event: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  on(event: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  recallMessage(messageId: number): boolean {
    console.warn('WebSocket已禁用，无法撤回消息');
    return false;
  }

  sendMessage(messageData: {
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    messageType: 'FILE' | 'IMAGE' | 'TEXT' | 'VIDEO' | 'VOICE';
    receiverId: number;
  }): boolean {
    console.warn('WebSocket已禁用，无法发送消息');
    return false;
  }

  sendTypingStatus(conversationId: number): boolean {
    console.warn('WebSocket已禁用，无法发送输入状态');
    return false;
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

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getUserId(): string {
    return localStorage.getItem('chat_user_id') || '1';
  }

  private getWebSocketUrl(): string {
    throw new Error('WebSocket连接已禁用');
  }

  private handleNotification(data: WebSocketMessage): void {
    switch (data.type) {
      case 'MESSAGE_READ': {
        this.emit('MESSAGE_READ', data);
        break;
      }
      case 'MESSAGE_RECALLED': {
        this.emit('MESSAGE_RECALLED', data);
        break;
      }
      case 'NEW_MESSAGE': {
        this.emit('NEW_MESSAGE', data);
        break;
      }
      case 'USER_OFFLINE': {
        this.emit('USER_OFFLINE', data);
        break;
      }
      case 'USER_ONLINE': {
        this.emit('USER_ONLINE', data);
        break;
      }
      default: {
        break;
      }
    }
  }

  private handleTypingStatus(data: string): void {
    const [userId, conversationId] = data.split(':');
    this.emit('TYPING', {
      userId: Number.parseInt(userId),
      conversationId: Number.parseInt(conversationId),
    });
  }

  private subscribeToNotifications(): void {
  }

  private subscribeToTypingStatus(): void {
  }
}

export const webSocketService = new WebSocketService();
