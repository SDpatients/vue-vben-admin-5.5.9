# 登录接口调用文档

## 1. 接口基本信息

- **接口URL**: `http://localhost:8080/api/web/login`
- **请求方法**: `POST`
- **请求格式**: `application/json`
- **响应格式**: `application/json`

## 2. 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**请求示例**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

## 3. 返回结果

### 3.1 成功响应

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| code | Number | 状态码，成功为200 |
| message | String | 响应消息 |
| data | Object | 用户信息对象 |

**成功响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "uPid": 1,
    "uUser": "admin",
    "uName": "管理员",
    "uDeptid": 1,
    "uDept": "管理部门",
    "uTel": "010-12345678",
    "uMobile": "13800138000",
    "uEmail": "admin@example.com",
    "uRemark": "系统管理员",
    "uValid": "Y",
    "sepAuser": "system",
    "sepAdate": "2023-01-01T00:00:00.000+00:00",
    "sepEuser": "admin",
    "sepEdate": "2023-06-01T00:00:00.000+00:00",
    "uPur1": "1",
    "uPur2": "1",
    "uPur3": "1",
    "uPur4": "1",
    "uPur5": "1"
  }
}
```

### 3.2 失败响应

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| code | Number | 状态码，失败为500 |
| message | String | 错误消息 |
| data | Object | 错误数据（可选） |

**失败响应示例**:
```json
{
  "code": 500,
  "message": "登录失败",
  "data": "用户名或密码错误"
}
```

## 4. 前端调用示例

### 4.1 使用 Fetch API

```javascript
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/web/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      // 登录成功，处理用户信息
      console.log('登录成功', result.data);
      // 保存用户信息到本地存储
      localStorage.setItem('userInfo', JSON.stringify(result.data));
      // 可以进一步获取登录记录
      getLastLoginRecord(result.data.uPid);
    } else {
      // 登录失败，显示错误信息
      console.error('登录失败', result.message);
      alert(result.message);
    }
  } catch (error) {
    console.error('登录请求出错', error);
    alert('网络错误，请稍后重试');
  }
};

// 调用登录函数
login('admin', '123456');
```

### 4.2 使用 Axios

```javascript
import axios from 'axios';

const login = async (username, password) => {
  try {
    const result = await axios.post('http://localhost:8080/api/web/login', {
      username,
      password
    });
    
    if (result.data.code === 200) {
      // 登录成功，处理用户信息
      console.log('登录成功', result.data.data);
      localStorage.setItem('userInfo', JSON.stringify(result.data.data));
      // 获取登录记录
      getLoginRecords(result.data.data.uPid);
    } else {
      // 登录失败
      console.error('登录失败', result.data.message);
      alert(result.data.message);
    }
  } catch (error) {
    console.error('登录请求出错', error);
    alert('网络错误，请稍后重试');
  }
};
```

## 5. 登录后的操作

### 5.1 获取最新登录记录

```javascript
const getLastLoginRecord = async (uPid) => {
  try {
    const result = await fetch('http://localhost:8080/api/web/getLastLoginRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uPid })
    });
    
    const data = await result.json();
    if (data.code === 200) {
      console.log('最新登录记录', data.data);
      localStorage.setItem('lastLoginRecord', JSON.stringify(data.data));
    }
  } catch (error) {
    console.error('获取登录记录失败', error);
  }
};
```

### 5.2 获取登录记录列表

```javascript
const getLoginRecords = async (uPid) => {
  try {
    const result = await fetch('http://localhost:8080/api/web/getLoginRecords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uPid })
    });
    
    const data = await result.json();
    if (data.code === 200) {
      console.log('登录记录列表', data.data);
      // 可以在页面上展示登录记录
    }
  } catch (error) {
    console.error('获取登录记录列表失败', error);
  }
};
```

## 6. 错误处理

### 6.1 常见错误类型

| 错误情况 | 错误信息 | 处理建议 |
| --- | --- | --- |
| 用户不存在 | 用户名或密码错误 | 检查用户名是否正确 |
| 密码错误 | 用户名或密码错误 | 检查密码是否正确 |
| 用户无效 | 用户名或密码错误 | 联系管理员激活账号 |
| 网络错误 | 网络错误，请稍后重试 | 检查网络连接 |
| 服务器错误 | 登录失败 | 联系后端开发人员 |

### 6.2 前端错误处理建议

1. **显示友好的错误信息**：将后端返回的错误消息展示给用户
2. **添加加载状态**：在请求过程中显示加载动画
3. **防止重复提交**：在登录按钮点击后禁用按钮，直到请求完成
4. **添加请求超时处理**：设置合理的超时时间，避免用户长时间等待

## 7. 安全性考虑

1. **密码加密**：建议在前端对密码进行加密处理后再发送（如使用MD5、SHA256等）
2. **HTTPS协议**：生产环境中应使用HTTPS协议传输数据
3. **token存储**：登录成功后，可以考虑使用token进行身份验证，将token存储在localStorage或sessionStorage中
4. **定期清理**：定期清理本地存储的用户信息，尤其是在用户退出登录时

## 8. 测试账号

| 用户名 | 密码 | 备注 |
| --- | --- | --- |
| admin | admin | 系统管理员 |


---

**更新时间**：2025-12-08
**版本**：v1.0
