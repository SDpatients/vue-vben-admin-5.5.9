# WebSocket连接问题解决方案

## 当前诊断结果

根据诊断结果，发现以下情况：

### ✅ 正常项
- SockJS库已加载
- STOMP库已加载
- 服务器可访问
- ws/info端点返回{"websocket":true}，说明服务器支持WebSocket

### ⚠️ 注意事项
- **iframe.html 404** - 这是正常现象，SockJS优先使用WebSocket，只有WebSocket失败时才会使用iframe回退
- **X-Frame-Options: sameorigin** - 阻止了SockJS的iframe回退机制，但不影响WebSocket使用

### ❌ 核心问题
- **WebSocket握手被拒绝** - 后端`ChatHandshakeInterceptor`要求提供Token，否则拒绝连接

**后端日志**:
```
[http-nio-8080-exec-6] WARN  c.l.l.c.ChatHandshakeInterceptor - WebSocket握手 - 未提供Token，拒绝连接
```

## 核心问题分析

### 核心问题：WebSocket握手被拒绝

**错误信息**:
```
[http-nio-8080-exec-6] WARN  c.l.l.c.ChatHandshakeInterceptor - WebSocket握手 - 未提供Token，拒绝连接
```

**原因**: 后端配置了`ChatHandshakeInterceptor`拦截器，要求WebSocket连接时必须提供有效的Token。

**影响**: 所有未提供Token的WebSocket连接都会被拒绝，无法建立连接。

### 关于iframe.html 404

**重要说明**: 这是正常现象！

**SockJS工作原理**:
1. SockJS会先尝试使用WebSocket协议
2. 如果WebSocket失败，才会使用iframe回退机制
3. 现代浏览器中，通常优先使用WebSocket

**验证方法**:
- 检查 ws/info 端点返回 `{"websocket":true}`，说明服务器支持WebSocket
- 客户端会优先使用WebSocket，不会使用iframe回退
- 因此 iframe.html 404不影响正常使用

### 关于X-Frame-Options阻止

**错误信息**:
```
Refused to display 'http://localhost:8080/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
```

**原因**: 后端安全策略设置了`X-Frame-Options: sameorigin`，阻止了SockJS使用iframe进行回退。

**影响**: 仅当WebSocket失败时才会受影响，正常情况下不影响使用。

## 解决方案

### 方案1: 提供有效的Token（推荐）

**核心问题**: WebSocket握手被`ChatHandshakeInterceptor`拦截器拒绝，因为未提供Token。

**关键知识点**: WebSocket连接分为两个阶段：
1. **握手阶段** - SockJS创建连接时，后端`ChatHandshakeInterceptor`拦截并检查Token
2. **STOMP连接阶段** - STOMP协议建立时，传递连接头

**解决步骤**:

#### 1.1 获取有效的Token

首先需要获取一个有效的JWT Token，可以通过以下方式：

**方法1: 从登录接口获取**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

**方法2: 从浏览器本地存储获取**
如果已经登录过，Token可能存储在localStorage或sessionStorage中：
```javascript
// 在浏览器控制台执行
localStorage.getItem('token');
// 或
localStorage.getItem('access_token');
```

#### 1.2 在WebSocket连接中使用Token

**必须在两个阶段都传递Token**:

**阶段1: 握手阶段（SockJS创建时）**
```javascript
// 在URL中添加token查询参数（握手阶段需要）
const token = 'your-valid-token';
const sockJsUrl = `http://localhost:8080/api/v1/ws?token=${encodeURIComponent(token)}`;
const socket = new SockJS(sockJsUrl);
```

**阶段2: STOMP连接阶段**
```javascript
const stompClient = Stomp.over(socket);

// 添加连接头 - STOMP连接阶段需要
const headers = {
    'Authorization': `Bearer ${token}`
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

**完整代码示例**:
```javascript
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const token = 'your-valid-token';

// 阶段1: 握手阶段，在URL中传递Token
const sockJsUrl = `http://localhost:8080/api/v1/ws?token=${encodeURIComponent(token)}`;
const socket = new SockJS(sockJsUrl);

const stompClient = Stomp.over(socket);

// 阶段2: STOMP连接阶段，在连接头中传递Token
const headers = {
    'Authorization': `Bearer ${token}`
};

stompClient.connect(headers, 
    function(frame) {
        console.log('WebSocket连接成功:', frame);
    },
    function(error) {
        console.error('WebSocket连接失败:', error);
    }
);
```

#### 1.3 检查后端拦截器配置

如果是后端开发人员，需要检查`ChatHandshakeInterceptor`配置：

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 关键：必须使用 .withSockJS()
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // 允许所有来源
                .addInterceptors(chatHandshakeInterceptor)  // ⚠️ 这里添加了拦截器
                .withSockJS();  // ⚠️ 必须启用SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 启用简单消息代理
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 设置应用目的地前缀
        registry.setApplicationDestinationPrefixes("/app");
        
        // 设置用户目的地前缀
        registry.setUserDestinationPrefix("/user");
    }
}
```

### 方案2: 临时禁用WebSocket拦截器（仅用于开发）

如果是后端开发人员，可以临时禁用`ChatHandshakeInterceptor`拦截器，方便开发和测试：

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            // .addInterceptors(chatHandshakeInterceptor)  // 暂时注释掉拦截器
            .withSockJS();
}
```

### 方案3: 调整拦截器配置，允许匿名访问

修改`ChatHandshakeInterceptor`，允许某些情况的匿名访问：

```java
package com.yourpackage.interceptor;

import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class ChatHandshakeInterceptor implements HandshakeInterceptor {
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, 
                                 ServerHttpResponse response,
                                 WebSocketHandler wsHandler, 
                                 Map<String, Object> attributes) throws Exception {
        
        // 获取Authorization头
        HttpHeaders headers = request.getHeaders();
        List<String> authorizationHeaders = headers.get("Authorization");
        
        // 允许特定路径或条件的匿名访问
        String path = request.getURI().getPath();
        if (path.contains("/ws/test") || path.contains("/ws/dev")) {
            return true;  // 允许匿名访问
        }
        
        // 正常的Token验证逻辑
        if (authorizationHeaders != null && !authorizationHeaders.isEmpty()) {
            String token = authorizationHeaders.get(0);
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
                // 验证Token...
                return true;
            }
        }
        
        return true;  // 临时允许所有访问，方便测试
        // return false;  // 正常情况下应该拒绝
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, 
                              ServerHttpResponse response,
                              WebSocketHandler wsHandler, 
                              Exception exception) {
        // 握手后处理
    }
}
```

#### 1.2 检查application.yml配置

```yaml
server:
  port: 8080
  servlet:
    context-path: /api/v1  # 如果配置了这个，端点就是 /api/v1/ws

spring:
  mvc:
    static-path-pattern: /static/**
```

#### 1.3 验证端点路径

确保前端连接URL与后端配置一致：

| 后端配置 | 前端连接URL | 说明 |
|---------|-------------|------|
| context-path: /api/v1, endpoint: /ws | http://localhost:8080/api/v1/ws | ✅ 正确 |
| context-path: /, endpoint: /ws | http://localhost:8080/ws | ✅ 正确 |
| context-path: /api, endpoint: /v1/ws | http://localhost:8080/api/v1/ws | ✅ 正确 |

### 方案2: 配置Spring Security允许WebSocket

#### 2.1 允许WebSocket端点访问

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（WebSocket不需要）
            .csrf(csrf -> csrf.disable())
            
            // 配置CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 配置授权
            .authorizeHttpRequests(auth -> auth
                // 允许WebSocket端点（不需要认证）
                .requestMatchers("/ws/**").permitAll()
                
                // 允许SockJS资源（不需要认证）
                .requestMatchers("/ws/**").permitAll()
                
                // 其他请求需要认证
                .anyRequest().authenticated()
            )
            
            // 配置headers
            .headers(headers -> headers
                // 允许同源iframe（SockJS需要）
                .frameOptions(frame -> frame.sameOrigin())
                
                // 禁用HSTS（可选）
                .httpStrictTransportSecurity(hsts -> hsts.disable())
            );
            
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 允许所有来源
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 允许的请求头
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 允许携带凭证
        configuration.setAllowCredentials(true);
        
        // 预检请求缓存时间（秒）
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
```

#### 2.2 或者使用更宽松的配置（仅用于开发）

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // 允许所有请求（仅用于开发）
            )
            .headers(headers -> headers.disable());  // 禁用所有headers限制
        return http.build();
    }
}
```

### 方案3: 检查依赖配置

#### 3.1 确认pom.xml依赖

```xml
<dependencies>
    <!-- Spring Boot WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Spring Boot Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

#### 3.2 检查Spring Boot版本

确保使用支持WebSocket的Spring Boot版本：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.6.13</version>  <!-- 或更高版本 -->
    <relativePath/>
</parent>
```

### 方案4: 添加WebSocket处理器（可选）

如果需要自定义WebSocket行为，可以添加处理器：

```java
package com.yourpackage.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

@Component
public class CustomWebSocketHandler extends WebSocketHandlerDecorator {
    
    public CustomWebSocketHandler(TextWebSocketHandler delegate) {
        super(delegate);
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WebSocket连接建立: " + session.getId());
        super.afterConnectionEstablished(session);
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("WebSocket连接关闭: " + session.getId() + ", 状态: " + status);
        super.afterConnectionClosed(session, status);
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket传输错误: " + session.getId());
        exception.printStackTrace();
        super.handleTransportError(session, exception);
    }
}
```

## 验证步骤

### 1. 重启后端服务

```bash
# 停止当前服务
Ctrl + C

# 重新编译并启动
mvn clean install
mvn spring-boot:run
```

### 2. 检查后端日志

查看启动日志，确认WebSocket配置正确：

```
✅ 成功日志示例:
Mapped "{[/ws],methods=[GET],produces=[application/json]}" onto ...
Mapped "{[/ws/**],methods=[GET]}" onto ...

❌ 失败日志示例:
No endpoint mapping found for ...
```

### 3. 测试WebSocket端点

使用curl测试端点是否可访问：

```bash
# 测试WebSocket端点
curl -I http://localhost:8080/api/v1/ws

# 预期返回:
# HTTP/1.1 200 OK
# Content-Type: text/plain;charset=UTF-8
```

### 4. 使用测试页面连接

1. 打开WebSocket测试页面
2. 点击"诊断"按钮
3. 确认所有检查通过
4. 点击"连接"按钮

## 常见错误及解决

### 错误1: WebSocket握手被拒绝 - 未提供Token

**错误日志**:
```
[http-nio-8080-exec-6] WARN  c.l.l.c.ChatHandshakeInterceptor - WebSocket握手 - 未提供Token，拒绝连接
```

**原因**: 后端`ChatHandshakeInterceptor`拦截器要求WebSocket连接时必须提供Token

**解决**: 
1. 获取有效的JWT Token
2. 在WebSocket连接头中添加`Authorization: Bearer your-token`
3. 或临时禁用拦截器（仅开发环境）

### 错误2: X-Frame-Options: sameorigin

**原因**: Spring Security阻止了iframe

**影响**: 仅当WebSocket失败时才会影响SockJS的iframe回退，正常情况下不影响使用

**解决**: 配置`.frameOptions(frame -> frame.sameOrigin())`

### 错误3: 401 Unauthorized

**原因**: WebSocket端点需要认证

**解决**: 在Security配置中添加`.requestMatchers("/ws/**").permitAll()`

### 错误4: CORS错误

**原因**: 跨域请求被阻止

**解决**: 配置CORS允许所有来源

## 快速修复清单

- [ ] WebSocket配置类中有`.withSockJS()`
- [ ] Security配置中允许`/ws/**`访问
- [ ] Security配置中设置`frameOptions.sameOrigin()`（可选，仅影响WebSocket失败时的回退）
- [ ] CORS配置允许所有来源
- [ ] context-path配置正确
- [ ] 重启后端服务
- [ ] 查看后端日志无错误
- [ ] 使用测试页面诊断通过

## 前端连接示例

```javascript
const socket = new SockJS('http://localhost:8080/api/v1/ws');
const stompClient = Stomp.over(socket);

// 添加连接头
const headers = {
    'Authorization': 'Bearer your-token'
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

## ✅ 总结

### 核心问题
WebSocket握手被后端`ChatHandshakeInterceptor`拦截器拒绝，因为未提供有效的Token。

### 解决方案
1. **获取有效的JWT Token**
2. **在WebSocket连接头中添加Token**
3. **或临时调整后端配置**

### 关键结论
- ✅ 服务器支持WebSocket，ws/info端点返回{"websocket":true}
- ✅ iframe.html 404是正常现象，不影响使用
- ✅ 客户端优先使用WebSocket，不会使用iframe回退
- ✅ X-Frame-Options: sameorigin不影响正常WebSocket连接
- ⚠️ **必须提供有效的Token才能建立连接**

### 快速测试步骤
1. 从登录接口或浏览器存储获取Token
2. 打开WebSocket测试页面
3. 在"Token"输入框中填入有效的Token
4. 点击"连接"按钮
5. 查看连接状态

**预期结果**: 连接成功，日志显示"✅ 连接成功"

**后续操作**: 可以发送测试消息，验证WebSocket通信是否正常

## 联系后端开发

如果以上方案都无法解决，请向后端开发人员提供以下信息：

1. 错误日志截图
2. 诊断结果截图
3. 浏览器控制台完整错误信息
4. 后端WebSocket配置代码
5. 后端Security配置代码

## 参考文档

- [Spring WebSocket官方文档](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [SockJS官方文档](https://sockjs.github.io/sockjs-client/)
- [STOMP协议规范](https://stomp.github.io/stomp-spec.html/)
