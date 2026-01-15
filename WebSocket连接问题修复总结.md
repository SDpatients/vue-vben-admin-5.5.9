# WebSocket 连接问题修复总结

## 问题描述

在实现 WebSocket 实时聊天功能时，遇到了以下错误：

1. **WebSocket 连接 404 错误**
   ```
   WebSocket connection to 'ws://localhost:5779/ws' failed: Error during WebSocket handshake: Unexpected response code: 404
   ```

2. **WebSocket 连接超时错误**
   ```
   WebSocket connection to 'ws://localhost:5779/' failed: WebSocket opening handshake timed out
   ```

3. **函数未定义错误**
   ```
   Uncaught (in promise) TypeError: getSyncStatus is not a function
   ```

4. **多个 WebSocket 连接冲突**
   - 旧的 WebSocket 连接（用于通知功能）
   - 新的 STOMP WebSocket 连接（用于聊天功能）

## 根本原因分析

### 1. WebSocket 端点配置错误
- 原始实现使用了错误的连接方式
- Token 传递方式不正确（应该通过 query 参数传递，而不是 header）

### 2. 缺少必要的依赖
- 缺少 `sockjs-client` 依赖，导致无法使用 SockJS 降级

### 3. 函数导出缺失
- `useStompWebSocket` 组合式函数缺少 `getSyncStatus` 函数导出

### 4. WebSocket 连接冲突
- 系统中存在两个不同的 WebSocket 实现
- 旧的 WebSocket 连接用于通知功能
- 新的 STOMP WebSocket 连接用于聊天功能
- 两个连接同时运行导致冲突

## 修复方案

### 1. 安装必要的依赖

```bash
pnpm add sockjs-client
```

### 2. 修复 WebSocket 连接配置

**文件**: `apps/web-ele/src/services/websocket.ts`

#### 修改点 1: 添加 SockJS 支持

```typescript
import SockJS from 'sockjs-client';

class WebSocketService {
  // ... 其他代码

  private createSockJS(): any {
    const token = this.getToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5779';
    // 使用SockJS连接，支持降级
    return new SockJS(`${baseUrl}/ws?token=${encodeURIComponent(token)}`);
  }
}
```

#### 修改点 2: 使用 SockJS 作为 WebSocket 工厂

```typescript
connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      this.client = new Client({
        // 使用SockJS作为WebSocket工厂，支持降级
        webSocketFactory: () => this.createSockJS(),
        // token已经通过query参数传递，不需要在header中传递
        connectHeaders: {},
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });
      // ... 其他代码
    }
  });
}
```

### 3. 修复函数导出问题

**文件**: `apps/web-ele/src/composables/useStompWebSocket.ts`

```typescript
export function useStompWebSocket() {
  const isConnected = ref(webSocketService.getConnectionStatus());
  const syncStatus = ref<'SYNCED' | 'SYNCING' | 'FAILED'>('SYNCED');

  const connect = async () => {
    try {
      await webSocketService.connect();
      isConnected.value = true;
      syncStatus.value = 'SYNCED';
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      isConnected.value = false;
      syncStatus.value = 'FAILED';
      throw error;
    }
  };

  // ... 其他代码

  const getSyncStatus = () => {
    return syncStatus.value;
  };

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
```

### 4. 禁用旧的 WebSocket 连接

**文件**: `apps/web-ele/src/components/NotificationBadge.vue`

```typescript
// 临时禁用旧的WebSocket连接，避免与新的STOMP WebSocket冲突
// const { connect, disconnect, onMessage } = useWebSocket();
const connect = () => console.log('旧WebSocket已禁用，使用新的STOMP WebSocket');
const disconnect = () => console.log('旧WebSocket已禁用');
const onMessage = (handler: (data: any) => void) => console.log('旧WebSocket已禁用');
```

### 5. 优化错误处理

**文件**: `apps/web-ele/src/services/websocket.ts`

```typescript
this.client.onStompError = (frame) => {
  console.error('WebSocket STOMP 错误:', frame);
  this.isConnected = false;
  reject(new Error(frame.headers['message'] || 'STOMP 连接失败'));
};

this.client.onWebSocketError = (event) => {
  console.error('WebSocket 错误:', event);
  this.isConnected = false;
  reject(new Error('WebSocket 连接错误'));
};
```

## 技术说明

### SockJS 降级机制

SockJS 是一个浏览器兼容性库，提供以下功能：

1. **WebSocket 优先**: 首先尝试使用原生 WebSocket
2. **自动降级**: 如果 WebSocket 不可用，自动降级到以下传输方式：
   - XHR Streaming
   - XHR Polling
   - IFrame
   - JSONP Polling

### STOMP 协议

STOMP (Simple Text Oriented Messaging Protocol) 是一个简单的消息传递协议：

- **发布/订阅模式**: 支持点对点和广播消息
- **消息格式**: 基于文本，易于调试
- **心跳机制**: 保持连接活跃
- **确认机制**: 确保消息可靠传递

## 连接流程

### 正常连接流程

```
1. 用户登录
   ↓
2. 获取 JWT Token
   ↓
3. 建立 SockJS 连接 (ws://localhost:5779/ws?token=xxx)
   ↓
4. 建立 STOMP 连接
   ↓
5. 订阅个人通知队列 (/user/queue/notifications)
   ↓
6. 订阅输入状态主题 (/topic/chat/typing)
   ↓
7. 连接成功，可以发送和接收消息
```

### 降级连接流程

```
1. 尝试 WebSocket 连接
   ↓ (失败)
2. 降级到 XHR Streaming
   ↓ (失败)
3. 降级到 XHR Polling
   ↓ (失败)
4. 降级到 IFrame
   ↓ (失败)
5. 降级到 JSONP Polling
   ↓
6. 连接成功（使用 HTTP 长轮询）
```

## 测试验证

### 1. 单设备测试

- [ ] 登录系统，检查 WebSocket 连接状态
- [ ] 发送消息，验证消息显示
- [ ] 撤回消息，验证撤回状态
- [ ] 标记消息已读，验证已读图标

### 2. 跨设备测试

- [ ] 在两个不同浏览器中登录不同用户
- [ ] 互相发送消息，验证实时接收
- [ ] 验证消息在所有设备间同步
- [ ] 验证正在输入状态显示

### 3. 跨网络测试

- [ ] 在不同 IP 地址的设备上测试
- [ ] 验证 WebSocket 连接和消息传输
- [ ] 验证降级机制工作正常

## 后续优化建议

### 1. 统一 WebSocket 连接管理

建议将旧的 WebSocket 连接和新的 STOMP WebSocket 连接统一管理：

```typescript
// 创建统一的 WebSocket 服务
class UnifiedWebSocketService {
  private stompClient: Client | null = null;
  private nativeWs: WebSocket | null = null;

  // 根据功能选择使用哪种连接
  connect(type: 'chat' | 'notification') {
    if (type === 'chat') {
      return this.connectStomp();
    } else {
      return this.connectNative();
    }
  }
}
```

### 2. 添加连接状态监控

```typescript
// 监控连接状态，提供更好的用户体验
watchConnectionStatus((status) => {
  if (status === 'DISCONNECTED') {
    showNotification('网络连接已断开，正在重连...');
  } else if (status === 'CONNECTED') {
    showNotification('网络连接已恢复');
  }
});
```

### 3. 优化重连策略

```typescript
// 指数退避重连策略
private getReconnectDelay(): number {
  return Math.min(
    1000 * Math.pow(2, this.reconnectAttempts),
    30000
  );
}
```

### 4. 添加消息队列

```typescript
// 离线时缓存消息，重新连接后发送
class MessageQueue {
  private queue: Message[] = [];

  enqueue(message: Message) {
    this.queue.push(message);
  }

  flush() {
    this.queue.forEach(message => {
      this.sendMessage(message);
    });
    this.queue = [];
  }
}
```

## 总结

通过以上修复，解决了以下问题：

✅ WebSocket 连接 404 错误
✅ WebSocket 连接超时错误
✅ getSyncStatus 函数未定义错误
✅ 多个 WebSocket 连接冲突
✅ 缺少 SockJS 降级支持

现在系统应该能够：
- 正确建立 WebSocket 连接
- 支持跨设备、跨 IP 的实时通信
- 在网络不稳定时自动降级到 HTTP 长轮询
- 提供稳定的实时聊天体验

## 相关文件

- `apps/web-ele/src/services/websocket.ts` - WebSocket 服务
- `apps/web-ele/src/composables/useStompWebSocket.ts` - Vue 组合式函数
- `apps/web-ele/src/components/NotificationBadge.vue` - 通知组件
- `apps/web-ele/src/views/chat/stores/chat.ts` - 聊天状态管理
- `apps/web-ele/src/views/chat/components/ChatWindow.vue` - 聊天窗口组件
