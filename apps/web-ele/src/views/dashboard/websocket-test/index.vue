<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import { ElButton, ElDialog, ElMessage } from 'element-plus';

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
  const sockjsAvailable = (window as any).SockJS !== undefined;
  const stompAvailable = (window as any).Stomp !== undefined;

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

  if ((window as any).SockJS === undefined) {
    addLog('SockJS库未加载，请检查index.html中的CDN引用', 'error');
    ElMessage.error('SockJS库未加载');
    connecting.value = false;
    return;
  }

  if ((window as any).Stomp === undefined) {
    addLog('STOMP库未加载，请检查index.html中的CDN引用', 'error');
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
    
    socket = new (window as any).SockJS(sockJsUrl);
    stompClient = new (window as any).Stomp.over(socket);

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
    return;
  }

  addLog('订阅 /user/queue/notifications');
  stompClient.subscribe('/user/queue/notifications', (message: any) => {
    try {
      const notification = JSON.parse(message.body);
      messages.value.unshift(notification);
      addLog(`收到通知: ${notification.type}`);
    } catch {
      addLog('解析消息失败');
    }
  });

  addLog('订阅 /topic/chat/typing');
  stompClient.subscribe('/topic/chat/typing', (message: any) => {
    addLog(`正在输入: ${message.body}`);
  });

  // 订阅在线用户列表主题
  addLog('订阅 /topic/onlineUsers');
  stompClient.subscribe('/topic/onlineUsers', (message: any) => {
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

  // 订阅用户状态广播主题
  addLog('订阅 /topic/broadcast');
  stompClient.subscribe('/topic/broadcast', (message: any) => {
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
    const message = {
      receiverId: Number.parseInt(receiverId.value),
      messageType: messageType.value,
      content: messageContent.value,
    };

    stompClient.send('/app/chat/send', {}, JSON.stringify(message));
    addLog(`发送消息: ${messageContent.value}`);
    ElMessage.success('消息已发送');
    messageContent.value = '';
  } catch (error: any) {
    addLog(`发送失败: ${error.message}`);
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

onMounted(() => {
  addLog('WebSocket测试页面已加载');
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    token.value = savedToken;
    addLog('已从本地存储加载Token');
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
        <h2 class="mb-4 text-xl font-semibold">WebSocket 测试工具</h2>

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
                  v-if="messages.length === 0"
                  class="py-10 text-center text-gray-400"
                >
                  暂无消息
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(msg, index) in messages"
                    :key="index"
                    class="rounded border bg-white p-3 text-sm"
                  >
                    <div class="mb-1 font-medium text-blue-600">
                      {{ msg.type }}
                    </div>
                    <div class="text-gray-600">{{ JSON.stringify(msg) }}</div>
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
</style>
