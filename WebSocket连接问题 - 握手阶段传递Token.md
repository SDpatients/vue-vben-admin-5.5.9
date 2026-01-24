# WebSocket连接问题 - 握手阶段传递Token

## 核心问题

用户报告：**当输入JWT Token并点击连接后，没有将Token传递到后端**

## 问题分析

### WebSocket连接的两个阶段

WebSocket连接分为**两个关键阶段**，每个阶段都需要正确传递Token：

| 阶段 | 时机 | 负责组件 | Token传递方式 | 失败表现 |
|------|------|----------|--------------|----------|
| 1. 握手阶段 | SockJS实例创建时 | `ChatHandshakeInterceptor` | URL查询参数 | 后端日志显示"未提供Token，拒绝连接" |
| 2. STOMP连接阶段 | stompClient.connect() | STOMP协议 | 连接头（Authorization） | STOMP协议级别的认证失败 |

### 当前代码的问题

**之前的实现只在STOMP连接阶段传递Token**，而在**握手阶段（最重要的阶段）没有传递Token**。

## 解决方案

### 必须在两个阶段都传递Token

#### 阶段1: 握手阶段（SockJS创建时）

```javascript
// 从Token中提取纯Token值（移除Bearer前缀）
const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

// 在URL中添加token查询参数
const sockJsUrl = `${serverUrl}?token=${encodeURIComponent(tokenValue)}`;
const socket = new SockJS(sockJsUrl);
```

#### 阶段2: STOMP连接阶段

```javascript
// 在STOMP连接头中添加Authorization
const headers = {
    'Authorization': token
};

stompClient.connect(headers, 
    function(frame) {
        console.log('连接成功');
    },
    function(error) {
        console.error('连接失败:', error);
    }
);
```

## 后端处理流程

1. **握手阶段**：`ChatHandshakeInterceptor`从URL查询参数中提取Token
2. **验证Token**：验证Token有效性，提取userId和username
3. **存储会话信息**：将用户信息存储到WebSocket会话属性中
4. **STOMP阶段**：`ChatChannelInterceptor`从会话属性中获取用户信息
5. **消息处理**：控制器直接获取有效用户ID，不再使用默认值

## 验证成功的标志

**成功日志**：
```
WebSocket握手成功 - 用户ID: 123, 用户名: testuser
```

**失败日志**（之前的问题）：
```
WebSocket握手 - 未提供Token，拒绝连接
```

## 修复后的测试页面

测试页面已经修复，现在会：
1. 在**握手阶段**将Token作为查询参数添加到URL中
2. 在**STOMP连接阶段**将Token添加到连接头中
3. 记录详细的连接过程日志

## 如何使用

1. 获取有效的JWT Token
2. 在测试页面的"Token"输入框中填入完整的Token（带或不带Bearer前缀）
3. 点击"连接"按钮
4. 查看日志，确认Token已在两个阶段被正确传递

## 注意事项

- Token必须是有效的JWT Token
- 必须在**两个阶段都传递Token**
- 开发环境下，后端可能允许匿名连接
- 生产环境下，必须提供有效Token

## 核心代码改动

```javascript
// 修复前：只在STOMP阶段传递Token
socket = new SockJS(serverUrl.value);

// 修复后：在握手阶段也传递Token
let sockJsUrl = serverUrl.value;
if (token.value) {
  const tokenValue = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value;
  sockJsUrl += `?token=${encodeURIComponent(tokenValue)}`;
}
socket = new SockJS(sockJsUrl);
```

## 结论

WebSocket连接时，**握手阶段**是最关键的阶段，必须确保在这个阶段正确传递Token，否则会被`ChatHandshakeInterceptor`拦截器拒绝连接。

修复后的测试页面现在会在两个阶段都正确传递Token，解决了"输入JWT后没有传递到后端"的问题。