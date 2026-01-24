# WebSocket连接问题排查指南

## 问题现象

根据错误日志，发现以下问题：

1. **WebSocket连接失败** - `ws://localhost:8080/api/v1/ws/...` 连接失败
2. **SockJS回退失败** - iframe.html、jsonp等回退方式都返回404
3. **X-Frame-Options阻止** - 后端设置了`X-Frame-Options: deny`

## 可能原因

### 1. 后端服务器未运行
- Spring Boot应用没有启动
- 端口8080被占用
- 服务器地址配置错误

### 2. WebSocket端点配置错误
- 端点路径不匹配
- SockJS未正确配置
- CORS配置问题

### 3. 安全策略限制
- X-Frame-Options设置过于严格
- CORS未允许跨域请求
- 防火墙或代理阻止连接

## 解决方案

### 方案1：检查后端服务器状态

#### 1.1 确认后端服务是否运行

```bash
# 检查8080端口是否被占用
netstat -ano | findstr :8080

# 或者使用PowerShell
Get-NetTCPConnection -LocalPort 8080 -State Listen
```

#### 1.2 启动后端服务

确保Spring Boot应用正在运行：

```bash
# 进入后端项目目录
cd your-spring-boot-project

# 启动应用
mvn spring-boot:run

# 或者运行打包后的jar文件
java -jar target/your-app.jar
```

#### 1.3 验证后端健康状态

```bash
# 检查后端健康接口
curl http://localhost:8080/actuator/health

# 或者检查WebSocket端点
curl http://localhost:8080/api/v1/ws
```

### 方案2：检查WebSocket配置

#### 2.1 确认WebSocket配置类

检查后端是否有正确的WebSocket配置：

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")  // 注意：这里注册的是/ws
                .setAllowedOriginPatterns("*")
                .addInterceptors(chatHandshakeInterceptor)
                .withSockJS();  // 必须使用SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

#### 2.2 检查Context Path配置

如果Spring Boot配置了context-path，需要确保URL正确：

```yaml
# application.yml
server:
  servlet:
    context-path: /api/v1  # 如果配置了这个，完整路径就是 /api/v1/ws
```

#### 2.3 验证端点路径

确保前端连接的URL与后端配置一致：

| 后端配置 | 前端连接URL | 说明 |
|---------|-------------|------|
| context-path: /api/v1, endpoint: /ws | http://localhost:8080/api/v1/ws | 正确 |
| context-path: /, endpoint: /ws | http://localhost:8080/ws | 正确 |
| context-path: /api, endpoint: /v1/ws | http://localhost:8080/api/v1/ws | 正确 |

### 方案3：配置CORS

#### 3.1 在WebSocket配置中添加CORS支持

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")  // 允许所有来源
            .withSockJS();
}
```

#### 3.2 全局CORS配置

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 方案4：调整安全策略

#### 4.1 配置Spring Security允许WebSocket

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/ws/**").permitAll()  // 允许WebSocket端点
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

#### 4.2 移除X-Frame-Options限制

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())  // 允许同源iframe
                .httpStrictTransportSecurity(hsts -> hsts.disable())
            );
        return http.build();
    }
}
```

### 方案5：检查依赖

#### 5.1 确认Spring Boot WebSocket依赖

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

#### 5.2 确认STOMP依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

## 测试步骤

### 1. 使用测试页面诊断

1. 打开WebSocket测试页面
2. 点击"诊断"按钮
3. 查看诊断结果

### 2. 检查浏览器控制台

打开浏览器开发者工具（F12），查看Console标签页：

- 查看是否有SockJS/STOMP相关的错误
- 查看Network标签页，确认HTTP请求状态
- 查看WebSocket连接状态

### 3. 使用Postman测试

```bash
# 测试WebSocket端点是否可访问
curl -I http://localhost:8080/api/v1/ws

# 预期返回：
# HTTP/1.1 200 OK
# Content-Type: text/plain;charset=UTF-8
```

## 常见问题FAQ

### Q1: 连接时显示"ERR_BLOCKED_BY_RESPONSE 404"

**原因**: 后端WebSocket端点不存在或路径错误

**解决**:
1. 检查后端WebSocket配置类
2. 确认端点路径是否正确
3. 检查context-path配置

### Q2: 连接时显示"X-Frame-Options: deny"

**原因**: 后端安全策略阻止了iframe嵌入

**解决**:
1. 配置Spring Security允许同源iframe
2. 或者移除X-Frame-Options限制

### Q3: 连接超时

**原因**: 后端服务未运行或网络问题

**解决**:
1. 确认后端服务正在运行
2. 检查防火墙设置
3. 检查端口是否被占用

### Q4: 收不到消息

**原因**: 订阅路径错误或Token无效

**解决**:
1. 检查订阅路径是否为`/user/queue/notifications`
2. 确认Token格式正确（Bearer前缀）
3. 检查用户ID是否正确设置

## 后端检查清单

- [ ] 后端服务正在运行
- [ ] 端口8080未被占用
- [ ] WebSocket配置类正确
- [ ] 端点路径正确（/ws或/api/v1/ws）
- [ ] SockJS已启用（.withSockJS()）
- [ ] CORS已配置
- [ ] Spring Security允许WebSocket访问
- [ ] 依赖已正确添加
- [ ] 日志中没有WebSocket相关错误

## 前端检查清单

- [ ] SockJS库已加载
- [ ] STOMP库已加载
- [ ] 服务器地址正确
- [ ] Token格式正确（如有）
- [ ] 订阅路径正确
- [ ] 浏览器控制台无错误

## 联系支持

如果以上方案都无法解决问题，请：

1. 查看后端日志，寻找WebSocket相关错误
2. 查看浏览器控制台的详细错误信息
3. 确认后端和前端版本是否匹配
4. 联系后端开发人员协助排查
