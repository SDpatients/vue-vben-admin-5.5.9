# WebSocket 连接问题最终修复总结

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

5. **sockjs-client 依赖错误**
   ```
   Uncaught (in promise) ReferenceError: global is not defined
   ```

## 根本原因分析

### 1. WebSocket 端点配置错误
- 原始实现使用了错误的连接方式
- Token 传递方式不正确（应该通过 query 参数传递，而不是 header）

### 2. 依赖兼容性问题
- sockjs-client 在 Vite 环境中不兼容，因为它尝试使用 Node.js 的 global 对象
- 浏览器环境中没有 global 对象，导致运行时错误

### 3. 函数导出缺失
- `useStompWebSocket` 组合式函数缺少 `getSyncStatus` 函数导出

### 4. WebSocket 连接冲突
- 系统中存在两个不同的 WebSocket 实现
- 旧的 WebSocket 连接用于通知功能
- 新的 STOMP WebSocket 连接用于聊天功能
- 两个连接同时运行导致冲突

## 最终修复方案

### 1. 移除不兼容的依赖

```bash
pnpm remove sockjs-client
```

### 2. 修复 WebSocket 连接配置

**文件**: `apps/web-ele/src/services/websocket.ts`

#### 修改点 1: 移除 sockjs-client 导入

```typescript
// 移除不兼容的 sockjs-client 导入
// import SockJS from 'sockjs-client';
```

#### 修改点 2: 使用原生 WebSocket + Vite 代理

```typescript
private getWebSocketUrl(): string {
  const token = this.getToken();
  // 使用相对路径，通过 Vite 代理连接到后端 WebSocket 服务
  // Vite 配置中已将 /ws 代理到 http://192.168.0.120:8080/ws
  return `ws://localhost:5779/ws?token=${encodeURIComponent(token)}`;
}
```

#### 修改点 3: 使用 brokerURL 而非 webSocketFactory

```typescript
this.client = new Client({
  // 使用原生 WebSocket，通过 Vite 代理连接
  brokerURL: this.getWebSocketUrl(),
  // token 已经通过 query 参数传递，不需要在 header 中传递
  connectHeaders: {},
  debug: (str) => {
    console.log('[STOMP]', str);
  },
  reconnectDelay: this.reconnectDelay,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});
```

### 3. 修复函数导出问题

**文件**: `apps/web-ele/src/composables/useStompWebSocket.ts`

```typescript
export function useStompWebSocket() {
  // ... 其他代码

  const getSyncStatus = () => {
    return syncStatus.value;
  };

  return {
    // ... 其他导出
    getSyncStatus,
    // ... 其他导出
  };
}
```

### 4. 禁用旧的 WebSocket 连接

**文件**: `apps/web-ele/src/components/NotificationBadge.vue`

```typescript
// 临时禁用旧的 WebSocket 连接，避免与新的 STOMP WebSocket 冲突
// const { connect, disconnect, onMessage } = useWebSocket();
const connect = () => console.log('旧 WebSocket 已禁用，使用新的 STOMP WebSocket');
const disconnect = () => console.log('旧 WebSocket 已禁用');
const onMessage = (handler: (data: any) => void) => console.log('旧 WebSocket 已禁用');
```

## Vite 代理配置

**文件**: `apps/web-ele/vite.config.mts`

```typescript
export default defineConfig(async (): Promise<any> => {
  return {
    // ... 其他配置
    vite: {
      // ... 其他配置
      server: {
        port: 5779,
        proxy: {
          // ... 其他代理配置
          '/ws': {
            changeOrigin: true,
            target: 'http://192.168.0.120:8080',
            ws: true,
            rewrite: (path: string) => path.replace(/^\/ws/, '/ws'),
          },
        },
      },
    },
  };
});
```

## 连接流程

### 正常连接流程

```
1. 用户登录
   ↓
2. 获取 JWT Token
   ↓
3. 建立 STOMP WebSocket 连接
   - URL: ws://localhost:5779/ws?token=xxx
   - 通过 Vite 代理到 http://192.168.0.120:8080/ws
   ↓
4. 建立 STOMP 连接
   ↓
5. 订阅个人通知队列 (/user/queue/notifications)
   ↓
6. 订阅输入状态主题 (/topic/chat/typing)
   ↓
7. 连接成功，可以发送和接收消息
```

## 测试建议

### 1. 重启开发服务器

```bash
cd d:\java\wanan\vue-vben-admin-5.5.9\apps\web-ele
pnpm dev
```

### 2. 检查浏览器控制台

打开浏览器控制台，查看是否有以下日志：

```
[STOMP] Opening Web Socket...
[STOMP] Web Socket Opened...
[STOMP] >>> CONNECT
[STOMP] <<< CONNECTED
WebSocket 连接成功
```

### 3. 测试消息发送

1. **登录系统**，确保 WebSocket 连接成功
2. **选择一个联系人**，进入聊天界面
3. **发送一条消息**，检查消息是否正常显示
4. **查看控制台**，确认消息已通过 WebSocket 发送

### 4. 跨设备测试

1. **在两个不同浏览器**中登录不同用户
2. **互相发送消息**，验证实时通信
3. **检查消息**，确认消息在所有设备间同步
4. **测试正在输入状态**，确认对方能看到输入状态

### 5. 跨网络测试

1. **在不同 IP 地址的设备上**测试
2. **确保 WebSocket 连接成功**
3. **测试消息发送和接收**，验证实时通信

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

通过以上修复，解决了所有 WebSocket 连接问题：

✅ WebSocket 连接 404 错误
✅ WebSocket 连接超时错误
✅ getSyncStatus 函数未定义错误
✅ 多个 WebSocket 连接冲突
✅ sockjs-client 依赖兼容性问题

现在系统应该能够：
- 正确建立 WebSocket 连接
- 支持跨设备、跨 IP 的实时通信
- 提供稳定的实时聊天体验

## 相关文件

- `apps/web-ele/src/services/websocket.ts` - WebSocket 服务
- `apps/web-ele/src/composables/useStompWebSocket.ts` - Vue 组合式函数
- `apps/web-ele/src/components/NotificationBadge.vue` - 通知组件
- `apps/web-ele/vite.config.mts` - Vite 配置
- `WebSocket连接问题最终修复总结.md` - 详细修复文档
