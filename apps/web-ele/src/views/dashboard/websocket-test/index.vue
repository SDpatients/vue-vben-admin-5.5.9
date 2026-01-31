<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import { ElButton, ElDialog, ElMessage } from 'element-plus';
import QRCode from 'qrcode.vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient: any = null;
let socket: any = null;
const connected = ref(false);
const connecting = ref(false);
const messages = ref<any[]>([]);
const serverUrl = ref('http://localhost:8080/api/v1/ws');
const token = ref('');
const receiverId = ref('');
const messageContent = ref('');
const messageType = ref('TEXT');
const conversationId = ref('');
const logMessages = ref<string[]>([]);
const showDiagnostic = ref(false);
const diagnosticResults = ref<any[]>([]);

// 在线用户相关
const onlineUsers = ref<any[]>([]);
const showUserInfo = ref(false);
const selectedUser = ref<any>(null);
const userInfoDialogVisible = ref(false);

// 文件上传相关
const showFileUpload = ref(false);
const uploadedFiles = ref<any[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const fileInputRef = ref<HTMLInputElement | null>(null);
const bizType = ref('common');
const bizId = ref('1');
const filePageNum = ref(1);
const filePageSize = ref(10);
const fileTotal = ref(0);
const showRenameDialog = ref(false);
const currentRenameFile = ref<any>(null);
const newFileName = ref('');

// 移动端上传配置
const mobileUploadConfig = ref({
  ip: '',
  port: 5779,
  autoDetect: true
});

const addLog = (
  message: string,
  type: 'error' | 'info' | 'success' | 'warning' = 'info',
) => {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  const prefix =
    type === 'error'
      ? '❌'
      : type === 'success'
        ? '✅'
        : type === 'warning'
          ? '⚠️'
          : 'ℹ️';
  logMessages.value.push(`[${timestamp}] ${prefix} ${message}`);
  if (logMessages.value.length > 100) {
    logMessages.value.shift();
  }
};

const addDiagnostic = (check: string, result: boolean, message: string) => {
  diagnosticResults.value.push({
    check,
    result,
    message,
    timestamp: new Date().toLocaleTimeString('zh-CN'),
  });
};

const checkServerAvailability = async () => {
  addDiagnostic('检查服务器可访问性', false, '开始检查...');
  try {
    const wsUrl = serverUrl.value;
    const response = await fetch(wsUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok || response.status === 401) {
      addDiagnostic(
        '检查服务器可访问性',
        true,
        '服务器可访问（返回401说明需要认证）',
      );
      return true;
    } else if (response.status === 404) {
      addDiagnostic(
        '检查服务器可访问性',
        false,
        'WebSocket端点不存在（404），请检查后端配置',
      );
      return false;
    } else {
      addDiagnostic(
        '检查服务器可访问性',
        false,
        `服务器返回状态码: ${response.status}`,
      );
      return false;
    }
  } catch (error: any) {
    addDiagnostic(
      '检查服务器可访问性',
      false,
      `无法连接到服务器: ${error.message}`,
    );
    return false;
  }
};

const checkLibraries = () => {
  const sockjsAvailable = SockJS !== undefined;
  const stompAvailable = Stomp !== undefined;

  addDiagnostic(
    '检查SockJS库',
    sockjsAvailable,
    sockjsAvailable ? 'SockJS已加载' : 'SockJS未加载',
  );
  addDiagnostic(
    '检查STOMP库',
    stompAvailable,
    stompAvailable ? 'STOMP已加载' : 'STOMP未加载',
  );

  return sockjsAvailable && stompAvailable;
};

const checkSockJSResources = async () => {
  addDiagnostic('检查SockJS资源', false, '开始检查...');
  try {
    // 检查 ws/info 端点（重要）
    const infoUrl = `${serverUrl.value}/info`;
    const response = await fetch(infoUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok) {
      const info = await response.json();
      if (info.websocket === true) {
        addDiagnostic(
          '检查SockJS资源',
          true,
          '✅ ws/info端点返回{"websocket":true}，服务器支持WebSocket',
        );

        // 检查 iframe.html（404是正常现象）
        const iframeUrl = `${serverUrl.value}/iframe.html`;
        const iframeResponse = await fetch(iframeUrl, {
          method: 'GET',
          mode: 'cors',
        });

        if (iframeResponse.status === 404) {
          addDiagnostic(
            '检查SockJS资源',
            true,
            '⚠️ iframe.html 404是正常现象，不影响使用（优先使用WebSocket）',
          );
        } else {
          addDiagnostic('检查SockJS资源', true, '✅ iframe.html可访问');
        }

        return true;
      } else {
        addDiagnostic(
          '检查SockJS资源',
          false,
          '❌ ws/info端点返回{"websocket":false}，服务器不支持WebSocket',
        );
        return false;
      }
    } else {
      addDiagnostic(
        '检查SockJS资源',
        false,
        `❌ ws/info端点返回状态码: ${response.status}`,
      );
      return false;
    }
  } catch (error: any) {
    addDiagnostic(
      '检查SockJS资源',
      false,
      `❌ 无法访问ws/info端点: ${error.message}`,
    );
    return false;
  }
};

const runDiagnostics = async () => {
  showDiagnostic.value = true;
  diagnosticResults.value = [];
  addLog('开始诊断...', 'info');

  await checkServerAvailability();
  checkLibraries();
  await checkSockJSResources();

  const allPassed = diagnosticResults.value.every((r) => r.result);
  if (allPassed) {
    addLog('诊断完成，所有检查通过', 'success');
  } else {
    addLog('诊断完成，发现一些问题', 'warning');
  }
};

const connect = () => {
  if (connected.value) {
    ElMessage.warning('已经连接到服务器');
    return;
  }

  connecting.value = true;
  addLog('开始连接WebSocket服务器...', 'info');
  console.log('=== 开始连接WebSocket服务器 ===');
  console.log('当前时间:', new Date().toISOString());
  console.log('服务器地址:', serverUrl.value);
  console.log('Token:', token.value);
  console.log('SockJS可用:', SockJS !== undefined);
  console.log('STOMP可用:', Stomp !== undefined);

  if (SockJS === undefined) {
    addLog('SockJS库未加载', 'error');
    ElMessage.error('SockJS库未加载');
    connecting.value = false;
    return;
  }

  if (Stomp === undefined) {
    addLog('STOMP库未加载', 'error');
    ElMessage.error('STOMP库未加载');
    connecting.value = false;
    return;
  }

  try {
    // 创建SockJS连接 - 握手阶段需要传递Token
    let sockJsUrl = serverUrl.value;
    
    // 方法1: 在URL中添加token查询参数（握手阶段需要）
    if (token.value) {
      const tokenValue = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value;
      sockJsUrl += `?token=${encodeURIComponent(tokenValue)}`;
      addLog(`在URL中添加token查询参数: ${sockJsUrl}`, 'info');
    }
    
    socket = new SockJS(sockJsUrl);
    stompClient = Stomp.over(socket);

    stompClient.debug = (msg: string) => {
      addLog(`STOMP: ${msg}`, 'info');
    };

    socket.addEventListener('close', (event: any) => {
      if (connected.value) {
        addLog(`连接关闭: code=${event.code}, reason=${event.reason}`, 'error');
        connected.value = false;
      }
    });

    socket.onerror = (error: any) => {
      addLog(`Socket错误: ${JSON.stringify(error)}`, 'error');
    };

    // 方法2: 在STOMP连接头中添加Authorization（STOMP协议阶段需要）
    const headers: any = {};
    if (token.value) {
      headers.Authorization = token.value.startsWith('Bearer ') ? token.value : `Bearer ${token.value}`;
      addLog('在STOMP连接头中添加Authorization', 'info');
      console.log('STOMP连接头:', headers);
    }

    addLog(`尝试连接到: ${serverUrl.value}`, 'info');
    console.log('开始STOMP连接...');

    stompClient.connect(
      headers,
      (frame: any) => {
        connected.value = true;
        connecting.value = false;
        addLog('✅ 连接成功', 'success');
        console.log('STOMP连接成功，frame:', frame);
        ElMessage.success('连接成功');

        // 调试：检查当前用户信息
        const currentUserId = localStorage.getItem('chat_user_id');
        const currentUsername = localStorage.getItem('chat_username');
        console.log('当前用户ID:', currentUserId);
        console.log('当前用户名:', currentUsername);
        
        // 调试：检查localStorage中的所有内容
        console.log('localStorage中的所有内容:', Object.fromEntries(Object.entries(localStorage)));
        
        // 调试：检查STOMP客户端状态
        console.log('=== STOMP连接成功，客户端状态 ===');
        console.log('stompClient对象:', stompClient);
        console.log('stompClient.connected:', stompClient.connected);
        console.log('stompClient.ws:', stompClient.ws);
        console.log('frame对象:', frame);
        console.log('frame.headers:', frame.headers);
        
        subscribeMessages();
      },
      (error: any) => {
        connected.value = false;
        connecting.value = false;
        
        // 解析错误信息
        let errorMsg = `连接失败: ${error}`;
        let errorType = 'error';
        
        if (error && typeof error === 'object' && error.headers) {
          // 处理STOMP错误
          errorMsg = `连接失败: ${error.headers['message'] || error.message || JSON.stringify(error)}`;
        } else if (error.indexOf && error.indexOf('Token') > -1) {
          errorMsg = `❌ 连接失败: 未提供有效的Token，后端ChatHandshakeInterceptor拦截了连接`;
          errorType = 'error';
        } else if (error.indexOf && error.indexOf('handshake') > -1) {
          errorMsg = `❌ 连接失败: WebSocket握手被拒绝，请检查Token是否有效`;
          errorType = 'error';
        } else if (error.indexOf && error.indexOf('401') > -1) {
          errorMsg = `❌ 连接失败: 认证失败，请检查Token是否有效`;
          errorType = 'error';
        } else if (error.indexOf && error.indexOf('403') > -1) {
          errorMsg = `❌ 连接失败: 权限不足，请检查Token权限`;
          errorType = 'error';
        }
        
        addLog(errorMsg, errorType as any);
        
        // 显示更友好的错误提示
        if (errorMsg.includes('Token')) {
          ElMessage.error({
            message: errorMsg,
            duration: 5000
          });
        } else {
          ElMessage.error('连接失败，请检查日志获取详细信息');
        }
      }
    );
  } catch (error: any) {
    connected.value = false;
    connecting.value = false;
    addLog(`连接异常: ${error.message}`, 'error');
    ElMessage.error('连接异常');
  }
};

const disconnect = () => {
  if (stompClient && connected.value) {
    stompClient.disconnect(() => {
      connected.value = false;
      addLog('已断开连接', 'info');
      ElMessage.info('已断开连接');
    });
  }
};

const subscribeMessages = () => {
  if (!stompClient || !connected.value) {
    console.error('无法订阅：STOMP客户端或连接状态无效');
    return;
  }

  console.log('=== 开始订阅所有主题 ===');
  console.log('STOMP客户端状态:', stompClient);
  console.log('连接状态:', connected.value);
  console.log('当前用户ID:', localStorage.getItem('chat_user_id'));

  addLog('订阅 /user/queue/notifications');
  const notificationSubscription = stompClient.subscribe('/user/queue/notifications', (message: any) => {
    try {
      addLog(`收到通知消息: ${message.body}`);
      console.log('完整通知消息:', message);
      const notification = JSON.parse(message.body);
      console.log('解析后的通知数据:', notification);
      messages.value.unshift(notification);
      addLog(`收到通知: ${notification.type}`);
      console.log('当前消息列表:', messages.value);
    } catch (error: any) {
      addLog(`解析消息失败: ${error.message}`);
      console.error('解析通知消息失败:', error, '消息内容:', message.body);
    }
  });
  console.log('已订阅 /user/queue/notifications，订阅ID:', notificationSubscription.id);

  addLog('订阅 /topic/chat/typing');
  const typingSubscription = stompClient.subscribe('/topic/chat/typing', (message: any) => {
    addLog(`正在输入: ${message.body}`);
    console.log('正在输入消息:', message);
  });
  console.log('已订阅 /topic/chat/typing，订阅ID:', typingSubscription.id);

  // 订阅文件操作通知
  addLog('订阅 /topic/file/upload');
  console.log('=== 开始订阅文件操作通知 ===');
  console.log('订阅主题:', '/topic/file/upload');
  console.log('STOMP客户端状态:', {
    connected: stompClient.connected,
    subscriptions: Object.keys(stompClient.subscriptions).length
  });
  
  const fileNotificationSubscription = stompClient.subscribe('/topic/file/upload', (message: any) => {
    try {
      console.log('=== 收到文件操作通知 ===');
      console.log('当前时间:', new Date().toISOString());
      console.log('完整文件操作通知:', message);
      console.log('消息头:', message.headers);
      console.log('消息体:', message.body);
      
      addLog(`收到文件操作通知: ${message.body}`);
      
      const notification = JSON.parse(message.body);
      console.log('解析后的文件操作通知:', notification);
      
      // 检查通知类型
      if (notification.type === 'FILE_UPLOADED') {
        addLog(`文件上传成功: ${notification.fileName || '未知文件'}`, 'success');
        console.log('文件上传成功，刷新文件列表...');
      } else if (notification.type === 'FILE_DELETED') {
        addLog(`文件删除成功: ${notification.fileName || '未知文件'}`, 'success');
        console.log('文件删除成功，刷新文件列表...');
      } else if (notification.type === 'FILE_RENAMED') {
        addLog(`文件重命名成功: ${notification.oldFileName || '未知文件'} -> ${notification.newFileName || '未知文件'}`, 'success');
        console.log('文件重命名成功，刷新文件列表...');
      } else {
        addLog(`收到未知类型的文件操作通知: ${notification.type}`, 'info');
        console.log('未知通知类型:', notification.type);
      }
      
      // 所有文件操作都刷新文件列表
      console.log('准备刷新文件列表...');
      loadFileList();
      console.log('文件列表刷新完成');
    } catch (error: any) {
      addLog(`解析文件操作通知失败: ${error.message}`);
      console.error('解析文件操作通知失败:', error, '消息内容:', message.body);
    }
  });
  console.log('已订阅 /topic/file/upload，订阅ID:', fileNotificationSubscription.id);
  console.log('文件操作通知订阅成功，等待接收通知...');

  // 订阅聊天消息主题
  addLog('订阅 /user/queue/chat');
  console.log('=== 准备订阅聊天消息主题 ===');
  console.log('订阅主题:', '/user/queue/chat');
  console.log('当前用户ID:', localStorage.getItem('chat_user_id'));
  
  // 直接订阅，使用普通函数作为回调
  console.log('开始订阅 /user/queue/chat...');
  const subscriptionResult = stompClient.subscribe('/user/queue/chat', function(message: any) {
    console.log('=== 聊天消息订阅回调被触发 ===');
    console.log('回调参数类型:', typeof message);
    console.log('回调参数:', message);
    
    try {
      addLog(`收到聊天消息: ${message.body}`);
      console.log('=== 收到聊天消息 ===');
      console.log('完整聊天消息对象:', message);
      console.log('消息头:', message.headers);
      console.log('消息体:', message.body);
      
      // 检查消息是否来自正确的目的地
      console.log('消息目的地:', message.headers.destination);
      
      const chatMessage = JSON.parse(message.body);
      console.log('解析后的聊天消息数据:', chatMessage);
      console.log('消息类型:', chatMessage.type);
      console.log('消息数据:', chatMessage.data);
      
      // 根据消息类型进行不同处理
      if (chatMessage.type === 'NEW_MESSAGE') {
        // 新消息
        const messageData = chatMessage.data || chatMessage;
        console.log('处理新消息:', messageData);
        console.log('准备添加到消息列表，当前列表长度:', messages.value.length);
        
        // 使用Vue的响应式更新
        messages.value = [messageData, ...messages.value];
        addLog(`收到新消息: ${messageData.content || '无内容'}`);
        console.log('消息添加到列表后，列表长度:', messages.value.length);
        console.log('当前消息列表:', messages.value);
      } else if (chatMessage.type === 'MESSAGE_READ') {
        // 消息已读
        console.log('处理消息已读:', chatMessage.data);
        addLog(`消息已读: ${chatMessage.data?.messageId}`);
        // 更新消息已读状态
        const msgIndex = messages.value.findIndex(m => m.id === chatMessage.data?.messageId);
        if (msgIndex !== -1) {
          messages.value[msgIndex].readStatus = true;
        }
      } else if (chatMessage.type === 'MESSAGE_RECALLED') {
        // 消息撤回
        console.log('处理消息撤回:', chatMessage.data);
        addLog(`消息撤回: ${chatMessage.data?.messageId}`);
        // 从列表中移除消息
        messages.value = messages.value.filter(m => m.id !== chatMessage.data?.messageId);
      } else {
        // 其他类型的消息，直接添加到列表
        console.log('处理其他类型消息:', chatMessage);
        messages.value.unshift(chatMessage);
        addLog(`收到消息，类型: ${chatMessage.type || 'UNKNOWN'}`);
        console.log('当前消息列表:', messages.value);
      }
      
    } catch (error: any) {
      addLog(`解析聊天消息失败: ${error.message}`);
      console.error('解析聊天消息失败:', error, '消息内容:', message.body);
      console.error('错误堆栈:', error.stack);
    }
  });
  
  // 检查订阅结果
  console.log('订阅操作结果:', subscriptionResult);
  console.log('订阅结果类型:', typeof subscriptionResult);
  console.log('=== 聊天消息主题订阅完成 ===');
  
  // 调试：检查STOMP客户端的订阅状态
  console.log('=== STOMP客户端状态检查 ===');
  console.log('STOMP客户端连接状态:', stompClient.connected);
  console.log('STOMP客户端WebSocket对象:', stompClient.ws);
  console.log('STOMP客户端订阅数量:', Object.keys(stompClient.subscriptions).length);
  console.log('STOMP客户端所有订阅:', stompClient.subscriptions);
  console.log('STOMP客户端配置:', {
    brokerURL: stompClient.brokerURL,
    heartbeat: stompClient.heartbeat,
    reconnectDelay: stompClient.reconnectDelay,
  });

  // 订阅在线用户列表主题
  addLog('订阅 /topic/onlineUsers');
  const onlineUsersSubscription = stompClient.subscribe('/topic/onlineUsers', (message: any) => {
    try {
      addLog(`收到在线用户列表消息: ${message.body}`);
      console.log('完整在线用户列表消息:', message);
      const data = JSON.parse(message.body);
      console.log('解析后的在线用户列表数据:', data);
      
      // 处理在线用户列表
      if (data.type === 'ONLINE_USERS_LIST') {
          const users = data.users || [];
        
        // 转换数字数组为对象数组，适配模板要求
        const userObjects = users.map((userId: any) => {
          // 如果是对象，直接返回；如果是数字，转换为对象
          if (typeof userId === 'number') {
            return { id: userId, username: `用户${userId}` };
          }
          return userId;
        });
        
        onlineUsers.value = userObjects;
        addLog(`收到在线用户列表，共 ${userObjects.length} 人在线`);
        
        // 调试：检查当前用户是否在列表中
        const currentUserId = localStorage.getItem('chat_user_id');
        if (currentUserId) {
          const userIdNum = parseInt(currentUserId);
          const isCurrentUserOnline = userObjects.some((user: any) => user.id === userIdNum);
          console.log(`当前用户ID ${userIdNum} 是否在在线列表中:`, isCurrentUserOnline);
          if (isCurrentUserOnline) {
            const currentUser = userObjects.find((user: any) => user.id === userIdNum);
            console.log('当前用户信息:', currentUser);
          }
        }
      }
    } catch (error: any) {
      addLog(`解析在线用户列表失败: ${error.message}`);
      console.error('在线用户列表解析错误:', error, '消息内容:', message.body);
    }
  });
  console.log('已订阅 /topic/onlineUsers，订阅ID:', onlineUsersSubscription.id);

  // 订阅用户状态广播主题
  addLog('订阅 /topic/broadcast');
  const broadcastSubscription = stompClient.subscribe('/topic/broadcast', (message: any) => {
    try {
      addLog(`收到用户状态广播消息: ${message.body}`);
      console.log('完整用户状态广播消息:', message);
      const data = JSON.parse(message.body);
      console.log('解析后的用户状态广播数据:', data);
      
      // 处理用户状态通知
      if (data.type === 'USER_ONLINE' || data.type === 'USER_OFFLINE') {
        const userId = data.userId || data.data?.userId;
        
        if (data.type === 'USER_ONLINE') {
          // 用户上线，添加到列表
          let user = data.data?.user;
          
          // 如果是数字ID，转换为对象；如果没有user对象，创建一个
          if (!user) {
            user = { id: userId, username: `用户${userId}` };
          } else if (typeof user === 'number') {
            user = { id: user, username: `用户${user}` };
          }
          
          if (!onlineUsers.value.some(u => u.id === userId)) {
            onlineUsers.value.push(user);
            addLog(`用户 ${user.username || `用户${userId}`} 上线`);
            console.log('用户上线，更新后的在线列表:', onlineUsers.value);
          }
        } else if (data.type === 'USER_OFFLINE') {
          // 用户下线，从列表移除
          onlineUsers.value = onlineUsers.value.filter(user => user.id !== userId);
          addLog(`用户 ${userId} 下线`);
          console.log('用户下线，更新后的在线列表:', onlineUsers.value);
        }
      }
    } catch (error: any) {
      addLog(`解析用户状态广播失败: ${error.message}`);
      console.error('用户状态广播解析错误:', error, '消息内容:', message.body);
    }
  });
  console.log('已订阅 /topic/broadcast，订阅ID:', broadcastSubscription.id);

  // 订阅广播聊天消息（备用）
  addLog('订阅 /topic/chat/broadcast');
  const chatBroadcastSubscription = stompClient.subscribe('/topic/chat/broadcast', (message: any) => {
    try {
      addLog(`收到广播聊天消息: ${message.body}`);
      console.log('=== 收到广播聊天消息 ===');
      console.log('完整广播聊天消息对象:', message);
      console.log('消息头:', message.headers);
      console.log('消息体:', message.body);
      
      const chatMessage = JSON.parse(message.body);
      console.log('解析后的广播聊天消息数据:', chatMessage);
      console.log('消息类型:', chatMessage.type);
      console.log('消息数据:', chatMessage.data);
      
      // 处理广播消息
      if (chatMessage.type === 'NEW_MESSAGE') {
        const messageData = chatMessage.data || chatMessage;
        console.log('处理广播新消息:', messageData);
        
        // 检查消息是否已存在
        const existingMessage = messages.value.find(m => m.id === messageData.id);
        if (!existingMessage) {
          messages.value = [messageData, ...messages.value];
          addLog(`收到广播新消息: ${messageData.content || '无内容'}`);
          console.log('广播消息添加到列表后，列表长度:', messages.value.length);
        }
      }
    } catch (error: any) {
      addLog(`解析广播聊天消息失败: ${error.message}`);
      console.error('解析广播聊天消息失败:', error, '消息内容:', message.body);
    }
  });
  console.log('已订阅 /topic/chat/broadcast，订阅ID:', chatBroadcastSubscription.id);

  // 发送获取在线用户列表请求
  addLog('请求在线用户列表');
  try {
    stompClient.send('/app/chat/onlineUsers', {}, JSON.stringify({}));
    addLog('已发送在线用户列表请求');
    console.log('已发送在线用户列表请求');
  } catch (error: any) {
    addLog(`发送在线用户列表请求失败: ${error.message}`);
    console.error('发送在线用户列表请求失败:', error);
  }
  
  console.log('=== 所有主题订阅完成 ===');
  console.log('当前消息列表长度:', messages.value.length);
  console.log('当前在线用户数量:', onlineUsers.value.length);
};

const sendMessage = () => {
  if (!stompClient || !connected.value) {
    ElMessage.error('未连接到服务器');
    return;
  }

  if (!receiverId.value || !messageContent.value) {
    ElMessage.warning('请填写接收者ID和消息内容');
    return;
  }

  try {
    const currentUserId = localStorage.getItem('chat_user_id');
    const message = {
      senderId: currentUserId ? Number.parseInt(currentUserId) : 1,
      receiverId: Number.parseInt(receiverId.value),
      messageType: messageType.value,
      content: messageContent.value,
    };

    addLog(`准备发送消息: ${JSON.stringify(message)}`);
    console.log('=== 准备发送消息 ===');
    console.log('消息内容:', message);
    console.log('当前连接状态:', connected.value);
    console.log('STOMP客户端状态:', stompClient);
    console.log('当前用户ID:', currentUserId);
    
    stompClient.send('/app/chat/send', {}, JSON.stringify(message));
    addLog(`发送消息: ${messageContent.value}`);
    console.log('=== 消息已发送到 /app/chat/send ===');
    ElMessage.success('消息已发送');
    messageContent.value = '';
  } catch (error: any) {
    addLog(`发送失败: ${error.message}`);
    console.error('发送消息失败:', error);
    ElMessage.error('发送失败');
  }
};

const sendTypingStatus = () => {
  if (!stompClient || !connected.value) {
    ElMessage.error('未连接到服务器');
    return;
  }

  if (!conversationId.value) {
    ElMessage.warning('请填写会话ID');
    return;
  }

  try {
    stompClient.send(`/app/chat/typing/${conversationId.value}`, {}, '');
    addLog(`发送正在输入状态: 会话 ${conversationId.value}`);
    ElMessage.success('已发送正在输入状态');
  } catch (error: any) {
    addLog(`发送失败: ${error.message}`);
    ElMessage.error('发送失败');
  }
};

const clearMessages = () => {
  messages.value = [];
  addLog('清空消息列表');
};

const clearLogs = () => {
  logMessages.value = [];
};

// 显示用户详细信息
const showUserDetails = (user: any) => {
  console.log('显示用户详细信息:', user);
  selectedUser.value = user;
  userInfoDialogVisible.value = true;
};

// 关闭用户信息对话框
const closeUserInfoDialog = () => {
  userInfoDialogVisible.value = false;
  selectedUser.value = null;
};

const messageTypes = [
  { label: '文本消息', value: 'TEXT' },
  { label: '图片消息', value: 'IMAGE' },
  { label: '文件消息', value: 'FILE' },
  { label: '语音消息', value: 'VOICE' },
  { label: '视频消息', value: 'VIDEO' },
];

// 文件上传相关函数
const generateQRCode = () => {
  let baseUrl = window.location.origin;
  
  // 强制使用配置的端口
  const currentUrl = new URL(window.location.href);
  if (mobileUploadConfig.value.ip) {
    // 使用配置的IP和端口
    baseUrl = `http://${mobileUploadConfig.value.ip}:${mobileUploadConfig.value.port}`;
  } else {
    // 使用当前主机名和配置的端口
    baseUrl = `http://${currentUrl.hostname}:${mobileUploadConfig.value.port}`;
  }
  
  let uploadUrl = `${baseUrl}/websocket-test?mode=upload&bizType=${bizType.value}&bizId=${bizId.value}`;
  
  // 添加JWT token
  if (token.value) {
    const tokenValue = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value;
    uploadUrl += `&token=${encodeURIComponent(tokenValue)}`;
  }
  
  return uploadUrl;
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    await uploadFile(files[0]);
  }
  if (target) {
    target.value = '';
  }
};

const uploadFile = async (file: File) => {
  if (!token.value) {
    ElMessage.error('请先设置Token');
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bizType', bizType.value);
    formData.append('bizId', bizId.value);

    const response = await fetch('/api/v1/file/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件上传成功');
      addLog(`文件上传成功: ${file.name}`, 'success');
      
      // 发送文件上传通知（如果WebSocket已连接）
      if (stompClient && connected.value) {
        try {
          const uploadNotification = {
            type: 'FILE_UPLOADED',
            fileName: file.name,
            fileId: result.data.id,
            bizType: bizType.value,
            bizId: bizId.value,
            uploadTime: new Date().toISOString()
          };
          
          console.log('=== 发送文件上传通知 ===');
          console.log('通知内容:', uploadNotification);
          console.log('发送主题:', '/app/file/upload/notify');
          console.log('STOMP客户端状态:', {
            connected: stompClient.connected,
            subscriptions: Object.keys(stompClient.subscriptions).length
          });
          
          stompClient.send('/app/file/upload/notify', {}, JSON.stringify(uploadNotification));
          addLog('发送文件上传通知成功', 'info');
          console.log('文件上传通知发送成功');
        } catch (error: any) {
          addLog(`发送文件上传通知失败: ${error.message}`, 'warning');
          console.error('发送文件上传通知失败:', error);
          console.error('STOMP客户端状态:', stompClient);
        }
      } else {
        console.log('WebSocket未连接，跳过发送通知');
        console.log('stompClient:', stompClient);
        console.log('connected:', connected.value);
      }
      
      await loadFileList();
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件上传失败');
    addLog(`文件上传失败: ${error.message}`, 'error');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const loadFileList = async () => {
  try {
    const params = new URLSearchParams({
      pageNum: filePageNum.value.toString(),
      pageSize: filePageSize.value.toString(),
      bizType: bizType.value,
      bizId: bizId.value,
    });

    const response = await fetch(`/api/v1/file/list?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    const result = await response.json();

    if (result.code === 200) {
      uploadedFiles.value = result.data.list;
      fileTotal.value = result.data.total;
    }
  } catch (error: any) {
    console.error('加载文件列表失败:', error);
  }
};

const downloadFile = (fileId: number, fileName: string) => {
  const downloadUrl = `/api/v1/file/download/${fileId}`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.setAttribute('target', '_blank');
  
  // 创建一个XMLHttpRequest来处理带header的下载
  const xhr = new XMLHttpRequest();
  xhr.open('GET', downloadUrl, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token.value}`);
  xhr.responseType = 'blob';
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };
  
  xhr.send();
  addLog(`下载文件: ${fileName}`, 'info');
};

const deleteFile = async (fileId: number, fileName: string) => {
  if (!confirm(`确定要删除文件 "${fileName}" 吗？`)) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/file/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件删除成功');
      addLog(`删除文件成功: ${fileName}`, 'success');
      
      // 发送文件删除通知（如果WebSocket已连接）
      if (stompClient && connected.value) {
        try {
          const deleteNotification = {
            type: 'FILE_DELETED',
            fileName: fileName,
            fileId: fileId,
            bizType: bizType.value,
            bizId: bizId.value,
            deleteTime: new Date().toISOString()
          };
          
          stompClient.send('/app/file/delete/notify', {}, JSON.stringify(deleteNotification));
          addLog('发送文件删除通知成功', 'info');
        } catch (error: any) {
          addLog(`发送文件删除通知失败: ${error.message}`, 'warning');
          console.error('发送文件删除通知失败:', error);
        }
      }
      
      await loadFileList();
    } else {
      throw new Error(result.message || '删除失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件删除失败');
    addLog(`删除文件失败: ${error.message}`, 'error');
  }
};

const showRenameFileDialog = (file: any) => {
  currentRenameFile.value = file;
  newFileName.value = file.originalFileName;
  showRenameDialog.value = true;
};

const renameFile = async () => {
  if (!newFileName.value.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('newFileName', newFileName.value);

    const response = await fetch(
      `/api/v1/file/${currentRenameFile.value.id}/rename`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件重命名成功');
      addLog(`重命名文件成功: ${currentRenameFile.value.originalFileName} -> ${newFileName.value}`, 'success');
      
      // 发送文件重命名通知（如果WebSocket已连接）
      if (stompClient && connected.value) {
        try {
          const renameNotification = {
            type: 'FILE_RENAMED',
            oldFileName: currentRenameFile.value.originalFileName,
            newFileName: newFileName.value,
            fileId: currentRenameFile.value.id,
            bizType: bizType.value,
            bizId: bizId.value,
            renameTime: new Date().toISOString()
          };
          
          stompClient.send('/app/file/rename/notify', {}, JSON.stringify(renameNotification));
          addLog('发送文件重命名通知成功', 'info');
        } catch (error: any) {
          addLog(`发送文件重命名通知失败: ${error.message}`, 'warning');
          console.error('发送文件重命名通知失败:', error);
        }
      }
      
      showRenameDialog.value = false;
      await loadFileList();
    } else {
      throw new Error(result.message || '重命名失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件重命名失败');
    addLog(`重命名文件失败: ${error.message}`, 'error');
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getFileIcon = (extension: string) => {
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text',
    docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
    mp4: 'lucide:video',
    mp3: 'lucide:music',
    zip: 'lucide:archive',
    rar: 'lucide:archive',
  };
  return iconMap[extension.toLowerCase()] || 'lucide:file';
};

// 检测本机局域网IP地址
const detectLocalIP = async () => {
  try {
    addLog('开始检测本机IP地址...', 'info');
    
    // 方法1: 通过WebRTC获取本地IP
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    const offer = await rtc.createOffer();
    await rtc.setLocalDescription(offer);
    
    return new Promise<string>((resolve) => {
      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match && !match[1].startsWith('127.')) {
            rtc.close();
            const ip = match[1];
            addLog(`检测到本机IP: ${ip}`, 'success');
            mobileUploadConfig.value.ip = ip;
            resolve(ip);
          }
        }
      };
      
      // 超时处理
      setTimeout(() => {
        rtc.close();
        addLog('IP检测超时，请手动设置IP地址', 'warning');
        resolve('');
      }, 3000);
    });
  } catch (error: any) {
    addLog(`IP检测失败: ${error.message}`, 'error');
    return '';
  }
};

// 获取当前页面的实际URL
const getCurrentPageUrl = () => {
  return window.location.href;
};

// 检查是否为上传模式
const isUploadMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mode') === 'upload';
};

// 检测是否为移动端
const isMobile = ref(false);
const showMobileHint = ref(false);
const isWeChatBrowser = ref(false);
const showWeChatHint = ref(false);

// 监听文件上传对话框打开，自动加载文件列表
watch(showFileUpload, (newVal) => {
  if (newVal) {
    loadFileList();
  }
});

onMounted(async () => {
  addLog('WebSocket测试页面已加载');
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    token.value = savedToken;
    addLog('已从本地存储加载Token');
  }
  
  // 检测移动端和微信浏览器
  const userAgent = navigator.userAgent;
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  isWeChatBrowser.value = /MicroMessenger/i.test(userAgent);
  
  if (isWeChatBrowser.value) {
    addLog('检测到微信浏览器访问', 'info');
  }
  
  // 自动检测本机IP地址
  if (mobileUploadConfig.value.autoDetect) {
    await detectLocalIP();
  }
  
  // 检查URL参数，如果是上传模式，自动打开文件上传对话框
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'upload') {
    const urlBizType = urlParams.get('bizType');
    const urlBizId = urlParams.get('bizId');
    if (urlBizType) bizType.value = urlBizType;
    if (urlBizId) bizId.value = urlBizId;
    
    if (isWeChatBrowser.value) {
      // 微信浏览器中，显示特殊提示
      showWeChatHint.value = true;
      addLog('检测到微信浏览器上传模式，显示微信上传提示', 'info');
    } else {
      // 非微信浏览器，直接打开上传对话框
      showFileUpload.value = true;
      addLog('检测到上传模式，自动打开文件上传对话框', 'info');
    }
  } else if (isMobile.value) {
    // 移动端但不是上传模式，显示友好提示
    showMobileHint.value = true;
    addLog('检测到移动端访问，显示上传提示', 'info');
  }
});

onBeforeUnmount(() => {
  if (stompClient && connected.value) {
    disconnect();
  }
});
</script>

<template>
  <div class="websocket-test-container">
    <div class="p-5">
      <div class="mb-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">WebSocket 测试工具</h2>
          <button
            @click="showFileUpload = true"
            class="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          >
            文件上传
          </button>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div class="space-y-4">
            <div class="rounded-lg bg-white p-4 shadow">
              <h3 class="mb-3 text-lg font-medium">连接配置</h3>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >服务器地址</label
                  >
                  <input
                    v-model="serverUrl"
                    type="text"
                    placeholder="http://localhost:8080/api/v1/ws"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >Token (可选)</label
                  >
                  <input
                    v-model="token"
                    type="password"
                    placeholder="Bearer your-jwt-token"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    @click="runDiagnostics"
                    class="flex-1 rounded-md bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
                  >
                    诊断
                  </button>
                  <button
                    @click="connect"
                    :disabled="connected || connecting"
                    class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Icon
                      v-if="connecting"
                      icon="lucide:loader-2"
                      class="mr-1 inline animate-spin"
                    />
                    {{ connecting ? '连接中...' : '连接' }}
                  </button>
                  <button
                    @click="disconnect"
                    :disabled="!connected"
                    class="flex-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    断开
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="h-3 w-3 rounded-full"
                    :class="connected ? 'bg-green-500' : 'bg-red-500'"
                  ></div>
                  <span class="text-sm">
                    {{ connected ? '已连接' : '未连接' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="rounded-lg bg-white p-4 shadow">
              <h3 class="mb-3 text-lg font-medium">发送消息</h3>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >接收者ID</label
                  >
                  <input
                    v-model="receiverId"
                    type="number"
                    placeholder="请输入接收者用户ID"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >消息类型</label
                  >
                  <select
                    v-model="messageType"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option
                      v-for="type in messageTypes"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >消息内容</label
                  >
                  <textarea
                    v-model="messageContent"
                    placeholder="请输入消息内容"
                    rows="3"
                    class="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  @click="sendMessage"
                  :disabled="!connected"
                  class="w-full rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  发送消息
                </button>
              </div>
            </div>

            <div class="rounded-lg bg-white p-4 shadow">
              <h3 class="mb-3 text-lg font-medium">发送正在输入状态</h3>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700"
                    >会话ID</label
                  >
                  <input
                    v-model="conversationId"
                    type="number"
                    placeholder="请输入会话ID"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  @click="sendTypingStatus"
                  :disabled="!connected"
                  class="w-full rounded-md bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  发送正在输入状态
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="h-[300px] rounded-lg bg-white p-4 shadow">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-lg font-medium">消息列表</h3>
                <button
                  @click="clearMessages"
                  class="text-sm text-blue-500 hover:text-blue-600"
                >
                  清空
                </button>
              </div>
              <div
                class="h-[220px] overflow-y-auto rounded-md border bg-gray-50 p-2"
              >
                <div
                  v-if="messages.filter(msg => isCurrentUserInvolved(msg)).length === 0"
                  class="py-10 text-center text-gray-400"
                >
                  暂无消息
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(msg, index) in messages.filter(msg => isCurrentUserInvolved(msg))"
                    :key="msg.id || index"
                    class="rounded border bg-white p-3 text-sm"
                    :class="isCurrentUserInvolved(msg) ? 'border-blue-200' : ''"
                  >
                    <div class="mb-1 font-medium text-blue-600">
                      {{ msg.type || '消息' }}
                    </div>
                    <div class="text-gray-600">
                      <div v-if="msg.type === 'NEW_MESSAGE' && msg.data">
                        <div class="mb-1">发送者: {{ msg.data.senderName || msg.data.senderId }}</div>
                        <div class="mb-1">接收者: {{ msg.data.receiverName || msg.data.receiverId }}</div>
                        <div class="mb-1">消息类型: {{ msg.data.messageType }}</div>
                        <div class="mb-1">内容: {{ msg.data.content }}</div>
                        <div class="text-xs text-gray-400">时间: {{ msg.data.createTime }}</div>
                      </div>
                      <div v-else-if="msg.senderId && msg.receiverId">
                        <!-- 直接的消息对象，没有type字段 -->
                        <div class="mb-1">发送者: {{ msg.senderName || msg.senderId }}</div>
                        <div class="mb-1">接收者: {{ msg.receiverName || msg.receiverId }}</div>
                        <div class="mb-1">消息类型: {{ msg.messageType }}</div>
                        <div class="mb-1">内容: {{ msg.content }}</div>
                        <div class="text-xs text-gray-400">时间: {{ msg.createTime }}</div>
                      </div>
                      <div v-else>
                        {{ JSON.stringify(msg) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 在线用户列表 -->
            <div class="h-[250px] rounded-lg bg-white p-4 shadow">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-lg font-medium">在线用户 ({{ onlineUsers.length }})</h3>
              </div>
              <div
                class="h-[170px] overflow-y-auto rounded-md border bg-gray-50 p-2"
              >
                <div
                  v-if="onlineUsers.length === 0"
                  class="py-10 text-center text-gray-400"
                >
                  暂无在线用户
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(user, index) in onlineUsers"
                    :key="user.id || index"
                    @click="showUserDetails(user)"
                    class="cursor-pointer rounded border bg-white p-3 text-sm hover:bg-blue-50 transition-colors"
                  >
                    <div class="flex items-center justify-between">
                      <div class="font-medium text-blue-600">
                        {{ user.username || `用户${user.id}` }}
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="h-2 w-2 rounded-full bg-green-500"></div>
                        <span class="text-xs text-gray-500">在线</span>
                      </div>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      用户ID: {{ user.id }}
                      <span v-if="user.email" class="ml-2">{{ user.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="h-[calc(100%-578px)] min-h-[250px] rounded-lg bg-white p-4 shadow"
            >
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-lg font-medium">操作日志</h3>
                <button
                  @click="clearLogs"
                  class="text-sm text-blue-500 hover:text-blue-600"
                >
                  清空
                </button>
              </div>
              <div
                class="h-[calc(100%-40px)] overflow-y-auto rounded-md border bg-gray-900 p-2 font-mono text-xs text-green-400"
              >
                <div
                  v-if="logMessages.length === 0"
                  class="py-10 text-center text-gray-500"
                >
                  暂无日志
                </div>
                <div v-else class="space-y-1">
                  <div v-for="(log, index) in logMessages" :key="index">
                    {{ log }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="showDiagnostic"
      title="连接诊断"
      width="600px"
      destroy-on-close
    >
      <div class="diagnostic-content">
        <div
          v-if="diagnosticResults.length === 0"
          class="py-10 text-center text-gray-500"
        >
          暂无诊断结果
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(result, index) in diagnosticResults"
            :key="index"
            class="diagnostic-item"
            :class="result.result ? 'success' : 'error'"
          >
            <div class="flex items-center gap-2">
              <Icon
                :icon="
                  result.result ? 'lucide:check-circle' : 'lucide:x-circle'
                "
                :class="result.result ? 'text-green-500' : 'text-red-500'"
              />
              <span class="font-medium">{{ result.check }}</span>
              <span class="ml-auto text-xs text-gray-500">{{
                result.timestamp
              }}</span>
            </div>
            <div class="ml-6 mt-1 text-sm text-gray-600">
              {{ result.message }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showDiagnostic = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 文件上传对话框 -->
    <ElDialog
      v-model="showFileUpload"
      title="文件上传管理"
      width="90%"
      :style="{ maxWidth: '1200px' }"
      destroy-on-close
    >
      <div class="file-upload-container">
        <!-- IP地址配置区域 -->
        <div class="mb-6 rounded-lg bg-yellow-50 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-medium text-gray-700">移动端访问配置</h4>
            <button
              @click="detectLocalIP"
              class="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
            >
              重新检测IP
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">IP地址</label>
              <input
                v-model="mobileUploadConfig.ip"
                type="text"
                placeholder="自动检测或手动输入"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">端口</label>
              <input
                v-model="mobileUploadConfig.port"
                type="number"
                placeholder="5779"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">业务类型</label>
              <input
                v-model="bizType"
                type="text"
                placeholder="如case、creditor等"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">业务ID</label>
              <input
                v-model="bizId"
                type="text"
                placeholder="业务唯一标识"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">当前访问URL</label>
              <div class="flex items-center gap-2">
                <input
                  :value="getCurrentPageUrl()"
                  type="text"
                  readonly
                  class="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-600">
            <p>💡 提示：手机扫描二维码前，请确保IP地址和端口配置正确</p>
            <p>📱 手机和电脑需要在同一局域网内</p>
            <p v-if="isUploadMode()" class="text-blue-600 font-medium">
              🔗 已从二维码获取任务参数，将上传到对应业务记录
            </p>
          </div>
        </div>

        <!-- 二维码生成区域 -->
        <div class="mb-6 rounded-lg bg-blue-50 p-4">
          <h4 class="mb-3 font-medium text-gray-700">手机扫码上传</h4>
          <div class="flex flex-col items-center gap-4">
            <div class="rounded-lg bg-white p-4 shadow">
              <QRCode
                :value="generateQRCode()"
                :size="200"
                level="H"
              />
            </div>
            <p class="text-sm text-gray-600">
              使用手机扫描二维码，即可上传文件
            </p>
            <p class="text-xs text-gray-500">
              上传链接: {{ generateQRCode() }}
            </p>
          </div>
        </div>

        <!-- 文件上传区域 -->
        <div class="mb-6">
          <h4 class="mb-3 font-medium text-gray-700">上传文件</h4>
          <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">业务类型</label>
              <select
                v-model="bizType"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="case">案件文件</option>
                <option value="creditor">债权人文件</option>
                <option value="debtor">债务人文件</option>
                <option value="claim">债权申报文件</option>
                <option value="announcement">公告文件</option>
                <option value="fund">资金文件</option>
                <option value="common">通用文件</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">业务ID</label>
              <input
                v-model="bizId"
                type="text"
                placeholder="请输入业务ID"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <input
            ref="fileInputRef"
            type="file"
            @change="handleFileChange"
            style="display: none"
          />
          
          <button
            @click="triggerFileUpload"
            :disabled="uploading"
            class="w-full rounded-md bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Icon
              v-if="uploading"
              icon="lucide:loader-2"
              class="mr-2 inline animate-spin"
            />
            {{ uploading ? '上传中...' : '选择文件上传' }}
          </button>
          
          <div v-if="uploading" class="mt-3">
            <div class="mb-1 flex justify-between text-sm">
              <span>上传进度</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="h-2 rounded-full bg-gray-200">
              <div
                class="h-2 rounded-full bg-blue-500 transition-all"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-medium text-gray-700">已上传文件 ({{ fileTotal }})</h4>
            <button
              @click="loadFileList"
              class="text-sm text-blue-500 hover:text-blue-600"
            >
              刷新
            </button>
          </div>
          
          <div v-if="uploadedFiles.length === 0" class="py-10 text-center text-gray-400">
            暂无文件
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="file in uploadedFiles"
              :key="file.id"
              class="rounded border bg-white p-4 shadow-sm"
            >
              <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <Icon
                      :icon="getFileIcon(file.fileExtension)"
                      class="text-2xl text-blue-500"
                    />
                    <span class="font-medium text-gray-900">{{ file.originalFileName }}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <span class="mr-3">{{ formatFileSize(file.fileSize) }}</span>
                    <span class="mr-3">{{ file.bizType }}</span>
                    <span>{{ formatDate(file.uploadTime) }}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="downloadFile(file.id, file.originalFileName)"
                    class="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
                  >
                    下载
                  </button>
                  <button
                    @click="showRenameFileDialog(file)"
                    class="rounded-md bg-yellow-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-yellow-600"
                  >
                    重命名
                  </button>
                  <button
                    @click="deleteFile(file.id, file.originalFileName)"
                    class="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="fileTotal > filePageSize" class="mt-4 flex justify-center gap-2">
            <button
              @click="filePageNum--"
              :disabled="filePageNum <= 1"
              class="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              上一页
            </button>
            <span class="flex items-center px-4 text-sm text-gray-600">
              第 {{ filePageNum }} 页，共 {{ Math.ceil(fileTotal / filePageSize) }} 页
            </span>
            <button
              @click="filePageNum++"
              :disabled="filePageNum >= Math.ceil(fileTotal / filePageSize)"
              class="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showFileUpload = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 文件重命名对话框 -->
    <ElDialog
      v-model="showRenameDialog"
      title="重命名文件"
      width="400px"
      destroy-on-close
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">新文件名</label>
          <input
            v-model="newFileName"
            type="text"
            placeholder="请输入新文件名"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <template #footer>
        <ElButton @click="showRenameDialog = false">取消</ElButton>
        <ElButton type="primary" @click="renameFile">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 移动端提示对话框 -->
    <ElDialog
      v-model="showMobileHint"
      title="手机上传提示"
      width="90%"
      :style="{ maxWidth: '500px' }"
      destroy-on-close
    >
      <div class="space-y-4">
        <div class="text-center">
          <Icon icon="lucide:smartphone" class="mx-auto mb-3 text-4xl text-blue-500" />
          <h3 class="mb-2 text-lg font-medium text-gray-900">手机上传提示</h3>
          <p class="text-gray-600">
            请在电脑端打开文件上传对话框，扫描二维码后上传文件
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-green-50 border border-green-200" v-if="isUploadMode()">
          <h4 class="mb-2 font-medium text-green-800 flex items-center gap-2">
            <Icon icon="lucide:check-circle" class="text-green-600" />
            任务参数已获取
          </h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-sm font-medium">业务类型：</span>
              <span class="text-sm font-medium text-green-700">{{ bizType }}</span>
            </div>
            <div>
              <span class="text-sm font-medium">业务ID：</span>
              <span class="text-sm font-medium text-green-700">{{ bizId }}</span>
            </div>
          </div>
          <p class="mt-2 text-sm text-green-700">
            文件将自动上传到对应业务记录中
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-blue-50">
          <h4 class="mb-2 font-medium text-blue-800">使用步骤：</h4>
          <ol class="list-decimal list-inside space-y-2 text-blue-700">
            <li>在电脑上打开 WebSocket 测试工具</li>
            <li>点击 "文件上传" 按钮</li>
            <li>扫描显示的二维码</li>
            <li>在手机上选择文件上传</li>
            <li>等待上传完成，文件将自动显示在附件列表中</li>
          </ol>
        </div>
        
        <div class="p-4 rounded-lg bg-yellow-50">
          <h4 class="mb-2 font-medium text-yellow-800">注意事项：</h4>
          <ul class="list-disc list-inside space-y-2 text-yellow-700">
            <li>请确保手机和电脑在同一局域网内</li>
            <li>上传文件大小限制为 50MB</li>
            <li>支持大多数文件类型</li>
            <li>上传过程中请勿关闭浏览器</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <ElButton type="primary" @click="showMobileHint = false">我知道了</ElButton>
      </template>
    </ElDialog>

    <!-- 微信浏览器提示对话框 -->
    <ElDialog
      v-model="showWeChatHint"
      title="微信上传提示"
      width="90%"
      :style="{ maxWidth: '500px' }"
      destroy-on-close
    >
      <div class="space-y-4">
        <div class="text-center">
          <Icon icon="lucide:message-circle" class="mx-auto mb-3 text-4xl text-green-500" />
          <h3 class="mb-2 text-lg font-medium text-gray-900">微信文件上传</h3>
          <p class="text-gray-600">
            检测到您正在使用微信浏览器
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-orange-50 border border-orange-200">
          <h4 class="mb-2 font-medium text-orange-800 flex items-center gap-2">
            <Icon icon="lucide:alert-triangle" class="text-orange-600" />
            重要提示
          </h4>
          <p class="text-sm text-orange-700 mb-2">
            微信浏览器可能存在安全限制，建议使用系统浏览器进行文件上传，以获得更好的体验。
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-green-50">
          <h4 class="mb-2 font-medium text-green-800">推荐上传方式：</h4>
          <ol class="list-decimal list-inside space-y-2 text-green-700">
            <li>点击右上角的 <Icon icon="lucide:more-horizontal" class="inline" /> 按钮</li>
            <li>选择 "在浏览器中打开" 选项</li>
            <li>在新打开的浏览器中选择文件上传</li>
            <li>上传完成后可返回微信</li>
          </ol>
        </div>
        
        <div class="p-4 rounded-lg bg-blue-50">
          <h4 class="mb-2 font-medium text-blue-800">推荐浏览器：</h4>
          <ul class="list-disc list-inside space-y-2 text-blue-700">
            <li>iOS: Safari 浏览器</li>
            <li>Android: Chrome 浏览器</li>
            <li>其他: 系统自带浏览器</li>
          </ul>
        </div>
        
        <div class="p-4 rounded-lg bg-gray-50">
          <h4 class="mb-2 font-medium text-gray-800">当前配置信息：</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>IP地址: {{ mobileUploadConfig.ip || '未设置' }}</li>
            <li>端口: {{ mobileUploadConfig.port }}</li>
            <li>业务类型: {{ bizType }}</li>
            <li>业务ID: {{ bizId }}</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showWeChatHint = false">关闭</ElButton>
        <ElButton type="primary" @click="showWeChatHint = false; showFileUpload = true">继续上传</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.websocket-test-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
}

.diagnostic-content {
  max-height: 400px;
  overflow-y: auto;
}

.diagnostic-item {
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
}

.diagnostic-item.success {
  background-color: #f0f9ff;
  border-left-color: #10b981;
}

.diagnostic-item.error {
  background-color: #fef2f2;
  border-left-color: #ef4444;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.file-upload-container {
  max-height: 70vh;
  overflow-y: auto;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .file-upload-container {
    max-height: 80vh;
  }
  
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:flex-row {
    flex-direction: column;
  }
  
  .md\:items-center {
    align-items: flex-start;
  }
  
  .md\:justify-between {
    justify-content: flex-start;
  }
}
</style>  
