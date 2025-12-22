# 案件管理系统 - 前端登录JWT指南

## 1. 概述

本文档详细描述了案件管理系统中前端JWT（JSON Web Token）认证的实现指南，包括登录流程、JWT存储、请求拦截、错误处理等内容，旨在帮助前端开发人员快速集成JWT认证功能。

## 2. JWT基本概念

### 2.1 什么是JWT

JWT（JSON Web Token）是一种用于在网络应用间传递声明的开放标准（RFC 7519）。JWT由三部分组成：

- **Header（头部）**：包含令牌类型和签名算法
- **Payload（负载）**：包含声明信息，如用户ID、过期时间等
- **Signature（签名）**：使用密钥对头部和负载进行签名，用于验证令牌的真实性

### 2.2 JWT的优点

- 无状态：服务器不需要存储会话信息，便于水平扩展
- 跨域支持：可以在不同域之间安全传递
- 自包含：令牌包含了所有必要的信息，减少了数据库查询
- 易于集成：可以轻松集成到各种前端框架和语言中

## 3. 前端登录流程

### 3.1 登录流程

1. **用户输入用户名和密码**
2. **前端发送登录请求**：向 `/api/web/login` 接口发送POST请求，包含用户名和密码
3. **后端验证用户身份**：验证用户名和密码是否正确
4. **后端生成JWT令牌**：如果验证通过，生成JWT令牌并返回给前端
5. **前端存储JWT令牌**：将令牌存储在本地（如localStorage、sessionStorage或Cookie）
6. **前端发送请求时携带JWT令牌**：在后续请求中，将令牌添加到请求头或请求参数中
7. **后端验证JWT令牌**：验证令牌的真实性和有效性
8. **后端返回响应**：如果令牌有效，返回请求的数据；否则返回401未授权错误

### 3.2 登录API接口

#### 请求信息
- **URL**：`/api/web/login`
- **方法**：`POST`
- **请求类型**：`application/json`

#### 请求参数
```json
{
  "username": "用户名",
  "password": "密码"
}
```

#### 成功响应
```json
{
  "status": "1",
  "msg": "登录成功",
  "data": {
    "token": "JWT令牌",
    "user": {
      "uPid": 1,
      "uUser": "用户名",
      "uName": "真实姓名",
      "uDept": "部门名称",
      "uTel": "电话",
      "uMobile": "手机",
      "uEmail": "邮箱"
    }
  }
}
```

#### 失败响应
```json
{
  "status": "0",
  "msg": "登录失败",
  "data": "用户名或密码错误"
}
```

## 4. 前端JWT实现示例

### 4.1 使用原生JavaScript实现

```javascript
// 登录函数
function login(username, password) {
    const loginData = {
        username: username,
        password: password
    };

    fetch('/api/web/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === '1') {
            // 登录成功，存储JWT令牌
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // 跳转到首页或其他页面
            window.location.href = '/home.html';
        } else {
            // 登录失败，显示错误信息
            alert('登录失败：' + data.data);
        }
    })
    .catch(error => {
        console.error('登录请求失败：', error);
        alert('登录请求失败，请检查网络连接');
    });
}

// 发送带JWT令牌的请求
function sendRequest(url, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    // 将JWT令牌添加到请求头
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options)
        .then(response => {
            if (response.status === 401) {
                // JWT令牌无效或过期，跳转到登录页面
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                throw new Error('未授权');
            }
            return response.json();
        })
        .catch(error => {
            console.error('请求失败：', error);
            throw error;
        });
}

// 示例：获取案件文件列表
function getCaseFiles(caseId) {
    sendRequest(`/api/web/getCaseFiles?SEP_ID=${caseId}&token=${localStorage.getItem('token')}`, 'GET')
        .then(data => {
            if (data.status === '1') {
                // 处理文件列表数据
                console.log('文件列表：', data.data.records);
            } else {
                alert('获取文件列表失败：' + data.msg);
            }
        })
        .catch(error => {
            console.error('获取文件列表失败：', error);
        });
}
```

### 4.2 使用Axios实现

```javascript
// 安装Axios：npm install axios
import axios from 'axios';

// 设置Axios默认配置
axios.defaults.baseURL = 'http://localhost:8080'; // 后端服务地址

// 创建Axios实例
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器：添加JWT令牌到请求头
apiClient.interceptors.request.use(
    config => {
        // 从localStorage中获取令牌
        const token = localStorage.getItem('token');
        
        // 如果令牌存在，添加到请求头
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    error => {
        // 处理请求错误
        return Promise.reject(error);
    }
);

// 响应拦截器：处理JWT令牌无效的情况
apiClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            // JWT令牌无效或过期
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // 跳转到登录页面
            window.location.href = '/login.html';
        }
        return Promise.reject(error);
    }
);

// 登录函数
export async function login(username, password) {
    try {
        const response = await apiClient.post('/api/web/login', {
            username,
            password
        });
        
        if (response.data.status === '1') {
            // 登录成功，存储JWT令牌和用户信息
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            
            return response.data.data;
        } else {
            throw new Error(response.data.data);
        }
    } catch (error) {
        console.error('登录失败：', error);
        throw error;
    }
}

// 登出函数
export function logout() {
    // 清除存储的令牌和用户信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 跳转到登录页面
    window.location.href = '/login.html';
}

// 获取当前用户信息
export function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// 检查是否已登录
export function isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
}

// 示例：获取案件文件列表
export async function getCaseFiles(caseId) {
    try {
        const response = await apiClient.get('/api/web/getCaseFiles', {
            params: {
                SEP_ID: caseId
            }
        });
        
        if (response.data.status === '1') {
            return response.data.data;
        } else {
            throw new Error(response.data.msg);
        }
    } catch (error) {
        console.error('获取文件列表失败：', error);
        throw error;
    }
}

// 示例：上传文件
export async function uploadFile(file, caseId) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('SEP_ID', caseId);
        
        const response = await apiClient.post('/api/web/uploadCaseFile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.status === '1') {
            return response.data.data;
        } else {
            throw new Error(response.data.msg);
        }
    } catch (error) {
        console.error('上传文件失败：', error);
        throw error;
    }
}
```

### 4.3 使用Vue + Axios实现

```vue
<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="loginForm.username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="loginForm.password" required>
      </div>
      <div class="form-group">
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.post('/api/web/login', this.loginForm);
        
        if (response.data.status === '1') {
          // 登录成功，存储JWT令牌和用户信息
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          
          // 跳转到首页
          this.$router.push('/home');
        } else {
          this.error = response.data.data;
        }
      } catch (error) {
        console.error('登录失败：', error);
        this.error = error.message || '登录失败，请检查网络连接';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
```

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// 设置Axios默认配置
axios.defaults.baseURL = 'http://localhost:8080';

// 请求拦截器：添加JWT令牌
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理JWT令牌无效
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 清除本地存储的令牌和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页面
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

// 将Axios添加到Vue原型，方便在组件中使用
Vue.prototype.$axios = axios;

// 路由导航守卫：检查是否已登录
router.beforeEach((to, from, next) => {
  // 不需要登录的页面（如登录页）
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');
  
  if (authRequired && !loggedIn) {
    // 需要登录但未登录，跳转到登录页面
    next('/login');
  } else {
    // 已登录或不需要登录，继续导航
    next();
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```

### 4.4 使用React + Axios实现

```javascript
// src/services/api.js
import axios from 'axios';

// 创建Axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 登录函数
export const login = async (username, password) => {
  const response = await apiClient.post('/api/web/login', { username, password });
  return response.data;
};

// 获取案件文件列表
export const getCaseFiles = async (caseId) => {
  const response = await apiClient.get(`/api/web/getCaseFiles?SEP_ID=${caseId}`);
  return response.data;
};

// 上传文件
export const uploadFile = async (file, caseId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('SEP_ID', caseId);
  
  const response = await apiClient.post('/api/web/uploadCaseFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// 导出API客户端
export default apiClient;
```

```javascript
// src/components/Login.jsx
import React, { useState } from 'react';
import { login } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(username, password);
      
      if (response.status === '1') {
        // 登录成功，存储令牌和用户信息
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // 跳转到首页
        window.location.href = '/home';
      } else {
        setError(response.data);
      }
    } catch (err) {
      console.error('登录失败：', err);
      setError('登录失败，请检查网络连接或用户名密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>登录</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
```

## 5. JWT存储方式

### 5.1 localStorage

- **优点**：
  - 存储容量大（约5MB）
  - 持久化存储，刷新页面后数据不会丢失
  - 易于使用

- **缺点**：
  - 存在XSS（跨站脚本攻击）风险
  - 不支持跨域

```javascript
// 存储JWT令牌
localStorage.setItem('token', token);
// 获取JWT令牌
const token = localStorage.getItem('token');
// 删除JWT令牌
localStorage.removeItem('token');
```

### 5.2 sessionStorage

- **优点**：
  - 存储容量大（约5MB）
  - 会话结束后自动清除，安全性较高
  - 易于使用

- **缺点**：
  - 存在XSS风险
  - 页面刷新后数据不会丢失，但关闭标签页或浏览器后会丢失
  - 不支持跨域

```javascript
// 存储JWT令牌
sessionStorage.setItem('token', token);
// 获取JWT令牌
const token = sessionStorage.getItem('token');
// 删除JWT令牌
sessionStorage.removeItem('token');
```

### 5.3 Cookie

- **优点**：
  - 支持跨域（通过设置domain和path属性）
  - 可以设置HttpOnly属性，防止XSS攻击
  - 可以设置Secure属性，只在HTTPS连接中传输
  - 可以设置SameSite属性，防止CSRF攻击

- **缺点**：
  - 存储容量小（约4KB）
  - 每次HTTP请求都会自动携带，增加带宽消耗
  - 易于受到CSRF攻击（需要设置SameSite属性）

```javascript
// 设置Cookie
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/" + ";HttpOnly;Secure;SameSite=Strict";
}

// 获取Cookie
function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";
}

// 删除Cookie
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
```

### 5.4 推荐存储方式

- **开发环境**：可以使用localStorage，方便调试
- **生产环境**：推荐使用Cookie，并设置HttpOnly、Secure和SameSite属性，提高安全性

## 6. JWT刷新机制

### 6.1 为什么需要刷新机制

JWT令牌通常有过期时间（如24小时），过期后需要重新登录。为了提高用户体验，可以实现JWT刷新机制：

1. 后端返回两个令牌：
   - **访问令牌（Access Token）**：有效期较短（如15分钟），用于API请求
   - **刷新令牌（Refresh Token）**：有效期较长（如7天），用于获取新的访问令牌

2. 前端存储访问令牌和刷新令牌

3. 当访问令牌过期时，使用刷新令牌获取新的访问令牌

4. 如果刷新令牌也过期了，需要重新登录

### 6.2 实现示例

```javascript
// 登录成功后存储访问令牌和刷新令牌
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// 响应拦截器：处理访问令牌过期
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 如果是401错误且不是刷新令牌请求
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 使用刷新令牌获取新的访问令牌
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/web/refreshToken', {
          refreshToken: refreshToken
        });
        
        if (response.data.status === '1') {
          // 更新访问令牌
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          // 更新请求头中的令牌
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // 重试原始请求
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // 刷新令牌也过期了，需要重新登录
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 7. 错误处理

### 7.1 常见错误类型

- **401 Unauthorized**：JWT令牌无效或过期
- **403 Forbidden**：没有权限访问资源
- **400 Bad Request**：请求参数错误
- **500 Internal Server Error**：服务器内部错误

### 7.2 错误处理示例

```javascript
try {
  const response = await apiClient.get('/api/web/getCaseFiles', {
    params: {
      SEP_ID: caseId
    }
  });
  
  if (response.data.status === '1') {
    // 处理成功响应
    console.log('文件列表：', response.data.data.records);
  } else {
    // 处理业务错误
    alert('获取文件列表失败：' + response.data.msg);
  }
} catch (error) {
  if (error.response) {
    // 服务器返回了错误状态码
    console.error('服务器错误：', error.response.status, error.response.data);
    
    if (error.response.status === 401) {
      // JWT令牌无效，跳转到登录页面
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response.status === 403) {
      alert('没有权限访问该资源');
    } else if (error.response.status === 400) {
      alert('请求参数错误：' + error.response.data.msg);
    } else {
      alert('服务器内部错误，请稍后重试');
    }
  } else if (error.request) {
    // 请求发送成功但没有收到响应
    console.error('网络错误：', error.request);
    alert('网络错误，请检查网络连接');
  } else {
    // 请求配置错误
    console.error('请求错误：', error.message);
    alert('请求错误：' + error.message);
  }
}
```

## 8. 安全性最佳实践

### 8.1 防止XSS攻击

- 使用HttpOnly Cookie存储JWT令牌
- 对用户输入进行过滤和转义
- 使用Content Security Policy (CSP) 限制脚本执行
- 定期更新依赖库，修复安全漏洞

### 8.2 防止CSRF攻击

- 使用SameSite=Strict属性设置Cookie
- 实现CSRF令牌验证
- 验证请求头中的Origin或Referer字段
- 对敏感操作使用POST请求

### 8.3 其他安全措施

- 使用HTTPS协议传输JWT令牌
- 不要在JWT令牌中存储敏感信息（如密码）
- 设置合理的令牌过期时间
- 实现令牌黑名单机制，用于吊销令牌
- 定期轮换JWT密钥

## 9. 常见问题及解决方案

### 9.1 问题：JWT令牌过期后如何处理？
解决方案：
- 实现JWT刷新机制，使用刷新令牌获取新的访问令牌
- 在响应拦截器中捕获401错误，跳转到登录页面

### 9.2 问题：如何防止JWT令牌被窃取？
解决方案：
- 使用HTTPS协议传输JWT令牌
- 使用HttpOnly Cookie存储JWT令牌
- 设置合理的令牌过期时间
- 实现令牌黑名单机制

### 9.3 问题：如何处理跨域请求？
解决方案：
- 确保后端配置了正确的CORS头
- 使用代理服务器
- 在开发环境中配置Webpack Dev Server代理

### 9.4 问题：如何调试JWT令牌？
解决方案：
- 使用JWT.io网站解码和验证令牌
- 在浏览器控制台中查看存储的令牌
- 在请求拦截器中打印请求头，检查令牌是否正确添加

## 10. 总结

本文档详细介绍了案件管理系统中前端JWT认证的实现指南，包括登录流程、JWT存储、请求拦截、错误处理等内容。前端开发人员可以根据本文档选择适合自己项目的实现方式，快速集成JWT认证功能。

在实现过程中，建议前端开发人员注意安全性问题，如防止XSS和CSRF攻击，使用安全的存储方式，设置合理的令牌过期时间等。同时，要考虑用户体验，如实现JWT刷新机制，避免频繁登录，提供友好的错误提示等。

通过正确实现JWT认证，可以提高系统的安全性和扩展性，为用户提供更好的使用体验。