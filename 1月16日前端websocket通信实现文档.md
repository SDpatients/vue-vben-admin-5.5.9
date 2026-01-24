# 前端WebSocket通信实现文档

**文档版本**: v1.0  
**创建日期**: 2026年1月16日  
**后端版本**: Spring Boot 2.6.13 + WebSocket + STOMP

---

## 目录

1. [后端配置说明](#后端配置说明)
2. [前端实现步骤](#前端实现步骤)
3. [连接配置](#连接配置)
4. [消息发送](#消息发送)
5. [消息接收](#消息接收)
6. [常见问题](#常见问题)
7. [注意事项](#注意事项)
8. [完整示例代码](#完整示例代码)

---

## 后端配置说明

### WebSocket端点配置

**端点地址**: `/api/v1/ws`  
**协议**: HTTP + SockJS + STOMP  
**认证方式**: JWT Token（可选，支持匿名连接）

### 后端配置详情

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(chatHandshakeInterceptor)
                .withSockJS();  // 重要: 必须使用SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

### 消息路由说明

| 路由类型 | 路径 | 说明 |
|---------|------|------|
| 应用消息 | `/app/**` | 发送到后端的消息 |
| 广播主题 | `/topic/**` | 广播给所有订阅者 |
| 用户队列 | `/user/queue/**` | 发送给特定用户 |
| 正在输入 | `/topic/chat/typing` | 正在输入状态 |

---

## 前端实现步骤

### 步骤1: 引入依赖库

```html
<!-- 方式1: 使用CDN -->
<script src="https://cdn.bootcdn.net/ajax/libs/sockjs-client/1.5.2/sockjs.min.js"></script>
<script src="https://cdn.bootcdn.net/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>

<!-- 方式2: 使用npm -->
npm install sockjs-client stompjs
```

```javascript
// npm引入方式
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
```

### 步骤2: 创建WebSocket连接

```javascript
let stompClient = null;
let connected = false;

function connect() {
    // 服务器地址 - 注意使用HTTP协议，不是WS协议
    const serverUrl = 'http://localhost:8080/api/v1/ws';
    
    // JWT Token（可选）
    const token = 'Bearer your-jwt-token-here';
    
    // 创建SockJS连接
    const socket = new SockJS(serverUrl);
    stompClient = Stomp.over(socket);
    
    // 可选: 禁用调试日志
    stompClient.debug = function(msg) { console.log('STOMP:', msg); };
    
    // 连接头
    const headers = {};
    if (token) {
        headers['Authorization'] = token;
    }
    
    // 建立连接
    stompClient.connect(headers, 
        // 连接成功回调
        function(frame) {
            console.log('连接成功:', frame);
            connected = true;
            
            // 订阅消息（见下方"消息接收"部分）
            subscribeMessages();
        },
        // 连接失败回调
        function(error) {
            console.error('连接失败:', error);
            connected = false;
        }
    );
}
```

### 步骤3: 断开连接

```javascript
function disconnect() {
    if (stompClient && connected) {
        stompClient.disconnect(function() {
            console.log('已断开连接');
            connected = false;
        });
    }
}
```

---

## 连接配置

### ⚠️ 重要注意事项

#### 1. 协议选择

❌ **错误**: 使用原生WebSocket API
```javascript
// 错误示例
const ws = new WebSocket('ws://localhost:8080/api/v1/ws');
```

✅ **正确**: 使用SockJS + STOMP
```javascript
// 正确示例
const socket = new SockJS('http://localhost:8080/api/v1/ws');
const stompClient = Stomp.over(socket);
```

#### 2. URL格式

| 项目 | 值 | 说明 |
|-----|-----|------|
| 协议 | `http://` 或 `https://` | 不是 `ws://` |
| 主机 | `localhost:8080` 或实际域名 | 后端服务器地址 |
| 路径 | `/api/v1/ws` | 包含context-path |

❌ **错误URL**:
- `ws://localhost:8080/api/v1/ws` (协议错误)
- `http://localhost:8080/ws` (缺少context-path)
- `http://localhost:8080/api/v1` (缺少ws端点)

✅ **正确URL**:
- `http://localhost:8080/api/v1/ws` (开发环境)
- `https://your-domain.com/api/v1/ws` (生产环境)

#### 3. Token格式

```javascript
// Token格式
const token = 'Bearer eyJhbGciOiJIUzUxMiJ9...';

// 添加到连接头
const headers = {
    'Authorization': token  // 必须包含 "Bearer " 前缀
};

// 如果Token没有前缀，自动添加
if (!token.startsWith('Bearer ')) {
    headers['Authorization'] = `Bearer ${token}`;
}
```

---

## 消息发送

### 发送聊天消息

```javascript
function sendMessage(receiverId, messageType, content) {
    if (!stompClient || !connected) {
        console.error('未连接到服务器');
        return;
    }
    
    const message = {
        receiverId: receiverId,      // 接收者用户ID
        messageType: messageType,      // 消息类型: TEXT/IMAGE/FILE/VOICE/VIDEO
        content: content             // 消息内容
    };
    
    // 发送到 /app/chat/send
    stompClient.send(
        '/app/chat/send',           // 目标地址
        {},                        // 头信息
        JSON.stringify(message)       // 消息体
    );
}

// 使用示例
sendMessage(2, 'TEXT', '你好！');
```

### 发送正在输入状态

```javascript
function sendTypingStatus(conversationId) {
    if (!stompClient || !connected) {
        return;
    }
    
    // 发送到 /app/chat/typing/{conversationId}
    stompClient.send(`/app/chat/typing/${conversationId}`, {}, '');
}

// 使用示例
sendTypingStatus(1);
```

### 消息类型说明

| 类型值 | 说明 | content字段内容 |
|-------|------|---------------|
| TEXT | 文本消息 | 文本内容 |
| IMAGE | 图片消息 | 图片URL或描述 |
| FILE | 文件消息 | 文件名 |
| VOICE | 语音消息 | 语音URL |
| VIDEO | 视频消息 | 视频URL |

---

## 消息接收

### 订阅个人通知队列

```javascript
function subscribeMessages() {
    // 订阅 /user/queue/notifications
    // 注意: /user 前缀会被替换为当前用户的ID
    const subscription = stompClient.subscribe('/user/queue/notifications', 
        function(message) {
            // 解析消息体
            const notification = JSON.parse(message.body);
            
            console.log('收到通知:', notification);
            
            // 消息结构
            /*
            {
                "type": "NEW_MESSAGE",           // 消息类型
                "userId": 1,                    // 接收者ID
                "title": "新消息",               // 标题
                "content": "消息内容",           // 内容
                "data": {                       // 详细数据
                    "id": 123,
                    "conversationId": 1,
                    "senderId": 2,
                    "senderName": "张三",
                    "messageType": "TEXT",
                    "content": "你好",
                    "createTime": "2026-01-16T09:15:00"
                },
                "timestamp": 1736998500000
            }
            */
            
            // 根据消息类型处理
            handleNotification(notification);
        }
    );
}
```

### 订阅正在输入状态

```javascript
function subscribeTypingStatus() {
    stompClient.subscribe('/topic/chat/typing', 
        function(message) {
            // 消息格式: "userId:conversationId"
            const [userId, conversationId] = message.body.split(':');
            
            console.log(`用户 ${userId} 在会话 ${conversationId} 中正在输入`);
            
            // 显示正在输入提示
            showTypingIndicator(userId, conversationId);
        }
    );
}
```

### 处理不同类型的通知

```javascript
function handleNotification(notification) {
    switch (notification.type) {
        case 'NEW_MESSAGE':
            // 新消息通知
            handleNewMessage(notification.data);
            break;
            
        case 'MESSAGE_READ':
            // 消息已读通知
            handleMessageRead(notification.data);
            break;
            
        case 'MESSAGE_RECALLED':
            // 消息撤回通知
            handleMessageRecalled(notification.data);
            break;
            
        default:
            console.log('未知通知类型:', notification.type);
    }
}
```

---

## 常见问题

### 问题1: 连接失败 - 错误代码1006

**症状**: WebSocket连接立即关闭，错误代码1006

**原因**: 使用了原生WebSocket API，而不是SockJS

**解决方案**:
```javascript
// ❌ 错误
const ws = new WebSocket('ws://localhost:8080/api/v1/ws');

// ✅ 正确
const socket = new SockJS('http://localhost:8080/api/v1/ws');
const stompClient = Stomp.over(socket);
```

### 问题2: 连接超时

**症状**: 连接请求长时间无响应

**可能原因**:
1. 后端服务未启动
2. 端口被占用
3. 防火墙阻止连接

**解决方案**:
```javascript
// 设置连接超时
stompClient.connect(headers, 
    function(frame) {
        console.log('连接成功');
    },
    function(error) {
        console.error('连接失败:', error);
        // 尝试重连
        setTimeout(connect, 5000);
    }
);
```

### 问题3: 收不到消息

**症状**: 连接成功，但收不到通知

**可能原因**:
1. 订阅路径错误
2. 用户ID未正确设置
3. Token无效或过期

**解决方案**:
```javascript
// 检查订阅路径是否正确
stompClient.subscribe('/user/queue/notifications', callback);  // ✅ 正确
stompClient.subscribe('/queue/notifications', callback);      // ❌ 错误

// 确保Token有效
const token = getValidToken();
if (token) {
    headers['Authorization'] = token;
}
```

### 问题4: 消息发送失败

**症状**: 调用send()方法后没有响应

**可能原因**:
1. 未连接到服务器
2. 消息格式错误
3. 接收者ID不存在

**解决方案**:
```javascript
// 检查连接状态
if (!stompClient || !connected) {
    console.error('未连接到服务器');
    return;
}

// 验证消息格式
const message = {
    receiverId: parseInt(receiverId),  // 确保是数字
    messageType: 'TEXT',
    content: '消息内容'
};

// 发送消息
stompClient.send('/app/chat/send', {}, JSON.stringify(message));
```

### 问题5: CDN库加载失败

**症状**: 页面报错 "SockJS is not defined" 或 "Stomp is not defined"

**解决方案**:

**方案1**: 使用多个CDN源
```html
<script src="https://cdn.bootcdn.net/ajax/libs/sockjs-client/1.5.2/sockjs.min.js"></script>
<script src="https://cdn.bootcdn.net/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>
<script>
    // 备用CDN
    if (typeof SockJS === 'undefined') {
        document.write('<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1.5.2/dist/sockjs.min.js"><\/script>');
    }
    if (typeof Stomp === 'undefined') {
        document.write('<script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/dist/stomp.min.js"><\/script>');
    }
</script>
```

**方案2**: 使用npm安装
```bash
npm install sockjs-client stompjs
```

```javascript
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
```

---

## 注意事项

### ⚠️ 易错点总结

#### 1. 协议混淆

| 错误 | 正确 |
|-----|------|
| `ws://` | `http://` |
| 原生WebSocket API | SockJS + STOMP |

#### 2. URL路径错误

| 错误 | 正确 |
|-----|------|
| `/ws` | `/api/v1/ws` |
| `/api/v1` | `/api/v1/ws` |

#### 3. 订阅路径错误

| 错误 | 正确 |
|-----|------|
| `/queue/notifications` | `/user/queue/notifications` |
| `/topic/notifications` | `/user/queue/notifications` |

#### 4. Token格式错误

| 错误 | 正确 |
|-----|------|
| `Authorization: token` | `Authorization: Bearer token` |
| 无前缀 | 必须包含 `Bearer ` 前缀 |

#### 5. 消息格式错误

```javascript
// ❌ 错误: 字符串ID
{
    receiverId: "2",  // 字符串
    messageType: "TEXT",
    content: "消息"
}

// ✅ 正确: 数字ID
{
    receiverId: 2,     // 数字
    messageType: "TEXT",
    content: "消息"
}
```

### 🔒 安全注意事项

1. **Token管理**
   - 不要在前端硬编码Token
   - Token过期后自动刷新
   - 使用HTTPS传输Token

2. **连接安全**
   - 生产环境使用HTTPS
   - 验证服务器证书
   - 限制跨域来源

3. **消息验证**
   - 验证接收者ID存在
   - 过滤敏感内容
   - 限制消息大小

### 📊 性能优化

1. **连接管理**
   - 避免频繁连接/断开
   - 实现自动重连机制
   - 心跳检测保持连接

2. **消息处理**
   - 批量处理消息
   - 使用消息队列
   - 避免UI阻塞

3. **资源释放**
   - 页面卸载时断开连接
   - 取消未使用的订阅
   - 清理事件监听器

---

## 完整示例代码

### React示例

```javascript
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

function WebSocketComponent() {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const stompClientRef = useRef(null);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []);

    const connect = () => {
        const socket = new SockJS('http://localhost:8080/api/v1/ws');
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        stompClient.connect(headers,
            (frame) => {
                console.log('连接成功:', frame);
                setConnected(true);

                // 订阅通知
                stompClient.subscribe('/user/queue/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    console.log('收到通知:', notification);
                    setMessages(prev => [...prev, notification]);
                });

                // 订阅正在输入状态
                stompClient.subscribe('/topic/chat/typing', (message) => {
                    console.log('正在输入:', message.body);
                });
            },
            (error) => {
                console.error('连接失败:', error);
                setConnected(false);
            }
        );
    };

    const disconnect = () => {
        if (stompClientRef.current && connected) {
            stompClientRef.current.disconnect(() => {
                console.log('已断开连接');
                setConnected(false);
            });
        }
    };

    const sendMessage = (receiverId, content) => {
        if (!stompClientRef.current || !connected) {
            console.error('未连接到服务器');
            return;
        }

        const message = {
            receiverId: receiverId,
            messageType: 'TEXT',
            content: content
        };

        stompClientRef.current.send(
            '/app/chat/send',
            {},
            JSON.stringify(message)
        );
    };

    return (
        <div>
            <h2>WebSocket状态: {connected ? '已连接' : '未连接'}</h2>
            <button onClick={connect} disabled={connected}>连接</button>
            <button onClick={disconnect} disabled={!connected}>断开</button>
            
            <div>
                <h3>消息列表</h3>
                {messages.map((msg, index) => (
                    <div key={index}>{JSON.stringify(msg)}</div>
                ))}
            </div>
        </div>
    );
}

export default WebSocketComponent;
```

### Vue示例

```javascript
<template>
  <div>
    <h2>WebSocket状态: {{ connected ? '已连接' : '未连接' }}</h2>
    <button @click="connect" :disabled="connected">连接</button>
    <button @click="disconnect" :disabled="!connected">断开</button>
    
    <div>
      <h3>消息列表</h3>
      <div v-for="(msg, index) in messages" :key="index">
        {{ JSON.stringify(msg) }}
      </div>
    </div>
  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default {
  name: 'WebSocketComponent',
  data() {
    return {
      connected: false,
      messages: [],
      stompClient: null
    };
  },
  mounted() {
    this.connect();
  },
  beforeUnmount() {
    this.disconnect();
  },
  methods: {
    connect() {
      const socket = new SockJS('http://localhost:8080/api/v1/ws');
      this.stompClient = Stomp.over(socket);

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      this.stompClient.connect(
        headers,
        (frame) => {
          console.log('连接成功:', frame);
          this.connected = true;

          this.stompClient.subscribe('/user/queue/notifications', (message) => {
            const notification = JSON.parse(message.body);
            console.log('收到通知:', notification);
            this.messages.push(notification);
          });

          this.stompClient.subscribe('/topic/chat/typing', (message) => {
            console.log('正在输入:', message.body);
          });
        },
        (error) => {
          console.error('连接失败:', error);
          this.connected = false;
        }
      );
    },
    disconnect() {
      if (this.stompClient && this.connected) {
        this.stompClient.disconnect(() => {
          console.log('已断开连接');
          this.connected = false;
        });
      }
    }
  }
};
</script>
```

### 原生JavaScript示例

```javascript
class WebSocketManager {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = [];
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            const socket = new SockJS('http://localhost:8080/api/v1/ws');
            this.stompClient = Stomp.over(socket);

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            this.stompClient.connect(
                headers,
                (frame) => {
                    console.log('连接成功:', frame);
                    this.connected = true;
                    resolve(frame);
                },
                (error) => {
                    console.error('连接失败:', error);
                    this.connected = false;
                    reject(error);
                }
            );
        });
    }

    disconnect() {
        return new Promise((resolve) => {
            if (this.stompClient && this.connected) {
                this.stompClient.disconnect(() => {
                    console.log('已断开连接');
                    this.connected = false;
                    this.subscriptions = [];
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    subscribe(destination, callback) {
        if (!this.stompClient || !this.connected) {
            console.error('未连接到服务器');
            return null;
        }

        const subscription = this.stompClient.subscribe(destination, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        });

        this.subscriptions.push(subscription);
        return subscription;
    }

    send(destination, message) {
        if (!this.stompClient || !this.connected) {
            console.error('未连接到服务器');
            return false;
        }

        try {
            this.stompClient.send(destination, {}, JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('发送消息失败:', error);
            return false;
        }
    }
}

// 使用示例
const wsManager = new WebSocketManager();

// 连接
wsManager.connect('your-jwt-token')
    .then(() => {
        console.log('连接成功');
        
        // 订阅通知
        wsManager.subscribe('/user/queue/notifications', (notification) => {
            console.log('收到通知:', notification);
        });

        // 发送消息
        wsManager.send('/app/chat/send', {
            receiverId: 2,
            messageType: 'TEXT',
            content: '你好！'
        });
    })
    .catch((error) => {
        console.error('连接失败:', error);
    });
```

---

## 附录

### A. 测试工具

项目提供了以下测试工具：

1. **websocket-stomp-test.html** - 完整的STOMP测试工具（推荐）
2. **websocket-sockjs-test.html** - SockJS基础测试
3. **websocket-native-test.html** - 原生WebSocket测试（不兼容）

### B. 参考资源

- [SockJS官方文档](https://sockjs.github.io/sockjs-client/)
- [STOMP协议规范](https://stomp.github.io/stomp-spec.html/)
- [Spring WebSocket文档](https://docs.spring.io/spring-framework/reference/web/websocket.html)

### C. 技术支持

如有问题，请参考：
1. 本文档的"常见问题"章节
2. 后端日志查看详细错误信息
3. 使用测试工具验证连接

---

**文档结束**