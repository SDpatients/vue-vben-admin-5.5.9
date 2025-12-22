# JWT令牌使用指南

## 1. JWT基本概念

JWT（JSON Web Token）是一种用于在网络应用间传递声明的基于JSON的开放标准（RFC 7519）。它可以在客户端和服务器之间安全地传输信息，常用于身份验证和授权。

JWT令牌由三部分组成，用点（.）分隔：
- **Header**：包含令牌类型和签名算法
- **Payload**：包含声明（如用户ID、过期时间等）
- **Signature**：用于验证令牌的真实性

## 2. 登录流程

1. 前端发送登录请求，包含用户名和密码
2. 后端验证用户名和密码
3. 验证成功后，后端生成JWT令牌并返回给前端
4. 前端将JWT令牌存储在本地（通常使用localStorage或sessionStorage）
5. 后续请求中，前端将JWT令牌添加到请求头中

## 3. 前端如何处理JWT令牌

### 3.1 存储JWT令牌

登录成功后，后端会返回JWT令牌，前端需要将其存储在本地：

```javascript
// 登录请求成功后
axios.post('/api/web/login', { username, password })
  .then(response => {
    if (response.status === '1') {
      // 存储JWT令牌到localStorage
      localStorage.setItem('token', response.data.token);
      // 存储用户信息
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // 跳转到首页
      window.location.href = '/home';
    }
  })
  .catch(error => {
    console.error('登录失败:', error);
  });
```

### 3.2 请求时携带JWT令牌

在后续请求中，前端需要将JWT令牌添加到请求头的Authorization字段中，格式为"Bearer {token}"：

```javascript
// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api/web',
  timeout: 10000
});

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage中获取令牌
    const token = localStorage.getItem('token');
    // 如果令牌存在，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 使用api实例发送请求
api.get('/contact')
  .then(response => {
    console.log('联系人列表:', response.data);
  })
  .catch(error => {
    console.error('获取联系人列表失败:', error);
  });
```

### 3.3 WebSocket连接时携带JWT令牌

WebSocket连接时，需要将JWT令牌作为URL参数传递：

```javascript
// 从localStorage中获取令牌
const token = localStorage.getItem('token');
// 创建WebSocket连接，将令牌作为参数传递
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

// 监听连接建立
ws.onopen = function() {
  console.log('WebSocket连接已建立');
};

// 监听消息
ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  console.log('收到消息:', message);
};

// 监听连接关闭
ws.onclose = function() {
  console.log('WebSocket连接已关闭');
};

// 监听错误
ws.onerror = function(error) {
  console.error('WebSocket错误:', error);
};
```

## 4. 令牌处理策略

### 4.1 检查令牌是否存在

在发起请求前，检查令牌是否存在，如果不存在则跳转到登录页面：

```javascript
// 路由守卫（以Vue Router为例）
router.beforeEach((to, from, next) => {
  // 获取令牌
  const token = localStorage.getItem('token');
  
  // 如果要访问需要登录的页面，检查令牌是否存在
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // 令牌不存在，跳转到登录页面
      next({ path: '/login' });
    } else {
      // 令牌存在，继续访问
      next();
    }
  } else {
    // 不需要登录的页面，直接访问
    next();
  }
});
```

### 4.2 处理令牌过期

当令牌过期时，后端会返回401状态码，前端需要捕获这个错误并跳转到登录页面：

```javascript
// 添加响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 检查是否是401错误
    if (error.response && error.response.status === 401) {
      // 令牌过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页面
      window.location.href = '/login';
      // 显示错误提示
      alert('登录已过期，请重新登录');
    }
    return Promise.reject(error);
  }
);
```

### 4.3 处理无效令牌

当令牌无效时，后端会返回错误信息，前端需要捕获这个错误并跳转到登录页面：

```javascript
// 添加响应拦截器
api.interceptors.response.use(
  response => {
    // 检查响应状态
    if (response.data.status === '0') {
      // 错误处理
      if (response.data.error === '未授权' || response.data.error.includes('无效的JWT令牌')) {
        // 令牌无效，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 跳转到登录页面
        window.location.href = '/login';
        // 显示错误提示
        alert('登录已过期或无效，请重新登录');
      }
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);
```

## 5. 登出处理

用户登出时，需要清除本地存储的令牌：

```javascript
function logout() {
  // 清除本地存储的令牌和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 跳转到登录页面
  window.location.href = '/login';
}
```

## 6. 常见问题及解决方案

### 6.1 无效的JWT令牌

**原因**：
- 令牌格式错误
- 令牌已过期
- 令牌被篡改
- 前端未正确携带令牌

**解决方案**：
- 检查令牌格式是否正确，确保包含Bearer前缀
- 检查令牌是否过期，过期则重新登录
- 检查前端是否正确将令牌添加到请求头
- 检查后端JWT密钥配置是否正确

### 6.2 请求头中未携带令牌

**解决方案**：
- 使用axios拦截器自动添加令牌到请求头
- 检查令牌是否存在于本地存储

### 6.3 WebSocket连接失败

**解决方案**：
- 检查WebSocket连接URL是否正确
- 检查令牌是否正确传递到URL参数中
- 检查后端WebSocket配置是否正确

## 7. 最佳实践

1. **使用HTTPS**：确保所有请求都使用HTTPS，防止令牌被窃取
2. **设置合理的过期时间**：令牌过期时间不宜过长，建议设置为24小时
3. **使用refresh token**：为了提高安全性，可以使用refresh token机制，当access token过期时，使用refresh token获取新的access token
4. **不要在JWT中存储敏感信息**：JWT的payload部分是Base64编码的，可以被解码，因此不要存储敏感信息
5. **定期清理无效令牌**：定期检查并清理本地存储中的无效令牌
6. **使用安全的存储方式**：建议使用localStorage或sessionStorage存储令牌，避免使用cookie，防止CSRF攻击

## 8. 示例代码

### 8.1 登录示例

```javascript
// 登录表单提交
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // 发送登录请求
  fetch('http://localhost:8080/api/web/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === '1') {
      // 登录成功，存储令牌
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // 跳转到首页
      window.location.href = '/home';
    } else {
      // 登录失败，显示错误信息
      alert(data.error);
    }
  })
  .catch(error => {
    console.error('登录失败:', error);
  });
});
```

### 8.2 请求示例

```javascript
// 获取联系人列表
function getContacts() {
  const token = localStorage.getItem('token');
  
  fetch('http://localhost:8080/api/web/contact', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === '1') {
      console.log('联系人列表:', data.data);
    } else {
      console.error('获取联系人列表失败:', data.error);
    }
  })
  .catch(error => {
    console.error('获取联系人列表失败:', error);
  });
}
```

### 8.3 WebSocket示例

```javascript
// 创建WebSocket连接
function initWebSocket() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('未找到JWT令牌');
    return;
  }
  
  const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
  
  ws.onopen = function() {
    console.log('WebSocket连接已建立');
    // 发送消息示例
    ws.send(JSON.stringify({
      type: 'message',
      data: {
        receiverId: 2,
        messageType: 1,
        content: '你好'
      }
    }));
  };
  
  ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('收到消息:', message);
  };
  
  ws.onclose = function() {
    console.log('WebSocket连接已关闭');
    // 尝试重新连接
    setTimeout(initWebSocket, 5000);
  };
  
  ws.onerror = function(error) {
    console.error('WebSocket错误:', error);
  };
}

// 初始化WebSocket连接
initWebSocket();
```

## 9. 总结

JWT令牌是一种安全、高效的身份验证机制，前端需要正确处理JWT令牌，包括：

1. 登录成功后存储令牌
2. 请求时携带令牌
3. WebSocket连接时传递令牌
4. 处理令牌过期和无效的情况
5. 登出时清除令牌

遵循上述最佳实践，可以确保JWT令牌的安全使用，避免出现"无效的JWT令牌"等问题。