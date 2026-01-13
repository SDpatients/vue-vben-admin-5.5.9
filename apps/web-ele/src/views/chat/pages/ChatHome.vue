<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ChatLayout from '../components/ChatLayout.vue';
import { useChatStore } from '../stores/chat';
import { useContactStore } from '../stores/contact';

// 获取状态管理store
const contactStore = useContactStore();
const chatStore = useChatStore();
const route = useRoute();

// 从store获取数据
const { fetchContacts, fetchUsers, getUserName, initMockData } = contactStore;
const { sessions, fetchChatSessions, initMockData: initChatMockData } = chatStore;

// 当前选中的联系人ID
const selectedContactId = ref<number | null>(null);

// 从路由参数中获取联系人ID
const routeContactId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

// 状态
const messageInput = ref('');
const messages = ref<any[]>([]);
const showEmojiPicker = ref(false);
const showFileUpload = ref(false);

// 计算属性
const selectedContact = computed(() => {
  if (!selectedContactId.value) return null;
  return contactStore.contacts.find((c) => c.contactUserId === selectedContactId.value) || null;
});

const formattedMessages = computed(() => {
  return messages.value.map((msg) => ({
    ...msg,
    formattedTime: new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
});

// 方法
function handleContactClick(contactId: number) {
  console.log('===== 点击联系人 =====');
  console.log('联系人ID:', contactId);
  
  // 1. 设置选中的联系人ID
  selectedContactId.value = contactId;
  
  // 2. 调用users接口，获取用户列表数据 - 严格按照要求调用API
  console.log('开始调用API: users?page=1&size=10&sortField=createTime&sortOrder=DESC');
  
  fetchUsers({
    page: 1,
    size: 10,
    sortField: 'createTime',
    sortOrder: 'DESC'
  }).then(userData => {
    console.log('✅ API调用成功，返回数据:', userData);
    // 更新联系人列表显示
    console.log('联系人列表已更新，共', contactStore.contacts.length, '个联系人');
  }).catch(error => {
    console.error('❌ API调用失败:', error);
    console.error('错误详情:', error.message || error);
  });
  
  // 3. 加载聊天记录
  loadMessages(contactId);
}

function handleSessionClick(contactId: number) {
  selectedContactId.value = contactId;
  loadMessages(contactId);
}

function loadMessages(contactId: number) {
  console.log('开始加载联系人', contactId, '的聊天记录...');
  
  // 调用真实API获取聊天记录
  chatStore.fetchChatMessages({
    contactId: contactId,
    page: 1,
    size: 100,
    sortField: 'createTime',
    sortOrder: 'DESC'
  });
  
  // 滚动到底部
  setTimeout(scrollToBottom, 100);
}

// 监听chatStore中的messages变化，更新本地messages
watch(
  () => chatStore.messages,
  (newMessages) => {
    console.log('收到新的聊天记录:', newMessages);
    messages.value = newMessages.map(msg => ({
      ...msg,
      isSent: msg.senderId === 1, // 假设当前登录用户ID是1
      isRecalled: msg.isRecalled || false
    }));
    setTimeout(scrollToBottom, 100);
  },
  { immediate: true }
);

function sendMessage() {
  if (!messageInput.value.trim() || !selectedContactId.value) return;

  const newMessage = {
    id: messages.value.length + 1,
    senderId: 1,
    receiverId: selectedContactId.value,
    content: messageInput.value.trim(),
    timestamp: new Date().toISOString(),
    status: 'sending',
    isSent: true,
    isRecalled: false,
  };

  messages.value.push(newMessage);
  messageInput.value = '';
  scrollToBottom();

  // 模拟消息发送成功
  setTimeout(() => {
    newMessage.status = 'sent';
  }, 500);

  // 模拟对方回复
  setTimeout(() => {
    if (!selectedContactId.value) return;
    const replyMessage = {
      id: messages.value.length + 1,
      senderId: selectedContactId.value,
      receiverId: 1,
      content: `收到你的消息：${newMessage.content}`,
      timestamp: new Date().toISOString(),
      status: 'read',
      isSent: false,
      isRecalled: false,
    };
    messages.value.push(replyMessage);
    scrollToBottom();
  }, 1000);
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value;
}

function toggleFileUpload() {
  showFileUpload.value = !showFileUpload.value;
}

function addEmoji(emoji: string) {
  messageInput.value += emoji;
  showEmojiPicker.value = false;
}

function recallMessage(messageId: number) {
  const message = messages.value.find((msg) => msg.id === messageId);
  if (message && message.isSent) {
    message.content = '[消息已撤回]';
    message.isRecalled = true;
  }
}

// 滚动到底部
function scrollToBottom() {
  setTimeout(() => {
    const messageContainer = document.querySelector('.message-list');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, 100);
}

// 监听消息变化，自动滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// 监听路由参数变化，自动选择联系人
watch(
  routeContactId,
  (newId) => {
    if (newId) {
      selectedContactId.value = newId;
      loadMessages(newId);
    }
  },
  { immediate: true },
);

// 初始化数据
onMounted(() => {
  // 使用真实API获取数据，fetchContacts内部会调用getUserListApi获取用户列表
  fetchContacts();
  fetchChatSessions();
  
  // 如果路由中有id参数，自动选择联系人
  if (routeContactId.value) {
    selectedContactId.value = routeContactId.value;
    loadMessages(routeContactId.value);
  }
});

// 格式化时间
function formatTime(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }
  // 其他情况显示完整日期
  return date.toLocaleDateString();
}

// 获取联系人名称 - 优先使用username字段
function getContactName(contactId: number) {
  // 先从联系人列表中查找
  const contact = contactStore.contacts.find((c) => c.contactUserId === contactId);
  if (contact) {
    return contact.name;
  }
  // 如果没有找到,从用户列表中查找
  return getUserName(contactId);
}


</script>

<template>
  <ChatLayout>
    <!-- 联系人列表 -->
    <template #contact-list>
      <div class="contact-list-container">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            placeholder="搜索联系人"
            prefix-icon="el-icon-search"
            size="small"
          />
        </div>

        <!-- 联系人列表 -->
        <div class="contact-items">
          <!-- 加载中状态 -->
          <div v-if="contactStore.loading" class="loading-state">
            <i class="el-icon-loading loading-icon"></i>
            <span>加载中...</span>
          </div>
          <!-- 错误状态 -->
          <div v-else-if="contactStore.error" class="error-state">
            <i class="el-icon-circle-close error-icon"></i>
            <span>{{ contactStore.error }}</span>
          </div>
          <!-- 空状态 -->
          <div v-else-if="contactStore.contacts.length === 0" class="empty-state">
            <i class="el-icon-user empty-icon"></i>
            <span>暂无联系人</span>
          </div>
          <!-- 联系人列表 -->
          <div
            v-for="contact in contactStore.contacts"
            :key="contact.id"
            class="contact-item"
            @click="handleContactClick(contact.contactUserId)"
          >
            <el-avatar size="small">
              {{ contact.name.charAt(contact.name.length - 1) }}
            </el-avatar>
            <div class="contact-info">
              <div class="contact-name">
                {{ contact.name }}
                <el-tag v-if="contact.isOnline" type="success" size="small">
                  在线
                </el-tag>
                <el-tag v-else type="info" size="small">离线</el-tag>
              </div>
              <div class="contact-last-message">
                <!-- 暂时使用静态文本，后续可从消息列表中获取 -->
                暂无消息
              </div>
            </div>
            <div class="contact-time">
              {{ 
                contact.lastOnlineTime 
                  ? formatTime(contact.lastOnlineTime) 
                  : '' 
              }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 会话列表 -->
    <template #message-list>
      <div class="session-list-container">
        <!-- 会话列表头部 -->
        <div class="session-header">
          <h3>会话</h3>
          <el-button type="text" icon="el-icon-plus" size="small">
            新建会话
          </el-button>
        </div>

        <!-- 会话列表内容 -->
        <div class="session-items">
          <!-- 加载中状态 -->
          <div v-if="chatStore.loading" class="loading-state">
            <i class="el-icon-loading loading-icon"></i>
            <span>加载中...</span>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="chatStore.error" class="error-state">
            <i class="el-icon-circle-close error-icon"></i>
            <span>{{ chatStore.error }}</span>
            <el-button type="primary" size="small" @click="fetchChatSessions">
              重试
            </el-button>
          </div>

          <!-- 空状态 -->
          <div v-else-if="sessions.length === 0" class="empty-state">
            <i class="el-icon-message empty-icon"></i>
            <span>暂无会话</span>
          </div>

          <!-- 会话列表 -->
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ 'session-item-pinned': session.isPinned }"
            @click="handleSessionClick(session.contactId)"
          >
            <!-- 根据contactId获取联系人信息 -->
            <el-avatar size="small">
              {{ getContactName(session.contactId).charAt(getContactName(session.contactId).length - 1) }}
            </el-avatar>
            <div class="session-info">
              <div class="session-name-row">
                <div class="session-name">
                  {{ getContactName(session.contactId) }}
                </div>
                <div class="session-time">
                  {{ formatTime(session.lastActivityTime) }}
                </div>
              </div>
              <div class="session-last-message-row">
                <div class="session-last-message">
                  {{ session.lastMessage }}
                </div>
                <el-badge
                  v-if="session.unreadCount > 0"
                  :value="session.unreadCount"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 聊天对象信息（用于ChatLayout头部显示） -->
    <template #userAvatar v-if="selectedContact">
      <el-avatar size="small">
        {{ selectedContact.name.charAt(selectedContact.name.length - 1) }}
      </el-avatar>
    </template>
    <template #userName v-if="selectedContact">
      <div class="user-name">{{ selectedContact.name }}</div>
    </template>
    <template #userStatus v-if="selectedContact">
      <div class="user-status">{{ selectedContact.isOnline ? '在线' : '离线' }}</div>
    </template>
    
    <!-- 聊天消息列表 -->
    <template #chat-messages>
      <div v-if="selectedContact" class="message-list">
        <div
          v-for="message in formattedMessages"
          :key="message.id"
          class="message-item"
          :class="{
            'message-sent': message.isSent,
            'message-received': !message.isSent,
          }"
        >
          <el-avatar
            v-if="!message.isSent"
            size="small"
            class="message-avatar"
          >
            {{ selectedContact.name.charAt(selectedContact.name.length - 1) }}
          </el-avatar>
          <div class="message-content">
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-status">
                <span class="message-time">{{ message.formattedTime }}</span>
                <span v-if="message.isSent" class="message-delivery-status">
                  <i
                    v-if="message.status === 'sending'"
                    class="status-icon el-icon-loading"
                  ></i>
                  <i
                    v-else-if="message.status === 'sent'"
                    class="status-icon el-icon-check"
                  ></i>
                  <i
                    v-else-if="message.status === 'read'"
                    class="status-icon el-icon-check-double"
                  ></i>
                </span>
              </div>
              <el-dropdown
                v-if="message.isSent && !message.isRecalled"
                class="message-actions"
              >
                <el-button type="text" size="small" icon="el-icon-more" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="recallMessage(message.id)">
                      撤回
                    </el-dropdown-item>
                    <el-dropdown-item>复制</el-dropdown-item>
                    <el-dropdown-item>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-avatar
            v-if="message.isSent"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            size="small"
            class="message-avatar"
          />
        </div>
      </div>
      
      <!-- 欢迎页面 -->
      <div v-else class="welcome-container">
        <div class="welcome-content">
          <div class="welcome-icon">
            <i class="el-icon-message"></i>
          </div>
          <h2>欢迎使用通信功能</h2>
          <p>选择一个联系人或会话开始聊天</p>
        </div>
      </div>
    </template>
    
    <!-- 消息输入区域 -->
    <template #message-input v-if="selectedContact">
      <footer class="message-input-area">
        <!-- 表情选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker modern-emoji-picker">
          <div class="emoji-tabs">
            <div class="emoji-tab active">😀</div>
            <div class="emoji-tab">😂</div>
            <div class="emoji-tab">😍</div>
            <div class="emoji-tab">🤔</div>
            <div class="emoji-tab">😎</div>
          </div>
          <div class="emoji-grid">
            <span
              v-for="emoji in [
                '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
                '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
                '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
                '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
                '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
              ]"
              :key="emoji"
              class="emoji-item"
              @click="addEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </div>

        <!-- 文件上传区域 -->
        <div v-if="showFileUpload" class="file-upload-container">
          <div class="file-upload-tabs">
            <div class="file-upload-tab active">图片</div>
            <div class="file-upload-tab">文件</div>
            <div class="file-upload-tab">文档</div>
          </div>
          <div class="file-upload-content">
            <div class="file-upload-drag-area">
              <i class="el-icon-upload2"></i>
              <div class="file-upload-text">拖拽文件到此处或</div>
              <el-button type="primary" size="small">选择文件</el-button>
            </div>
            <div class="file-upload-hint">支持上传 JPG、PNG、PDF 等格式，单文件不超过 20MB</div>
          </div>
        </div>

        <!-- 简洁的功能按钮区域 -->
        <div class="input-tools-simple">
          <div class="tool-icon-btn" @click="toggleEmojiPicker" :class="{ 'active': showEmojiPicker }">
            😀
          </div>
          <div class="tool-icon-btn" @click="toggleFileUpload" :class="{ 'active': showFileUpload }">
            📷
          </div>
          <div class="tool-icon-btn" @click="toggleFileUpload">
            📁
          </div>
          <div class="tool-icon-btn">
            ✂️
          </div>
          <div class="tool-icon-btn dropdown-btn">
            ⋮
            <div class="dropdown-menu">
              <div class="dropdown-item">
                📹 视频通话
              </div>
              <div class="dropdown-item">
                📞 语音通话
              </div>
              <div class="dropdown-item">
                📍 位置共享
              </div>
            </div>
          </div>
        </div>
        
        <!-- 简洁的消息输入框容器 -->
        <div class="input-main-simple">
          <div class="input-wrapper-simple">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="2"
              placeholder="输入消息..."
              resize="none"
              @keydown="handleKeyPress"
              class="simple-input"
            />
            <div class="send-btn-simple" @click="sendMessage" :class="{ 'disabled': !messageInput.trim() }">
              发送(S)
            </div>
          </div>
        </div>
      </footer>
    </template>
    
    <!-- 未选择联系人时的欢迎页面 -->
    <template #chat-messages v-else>
      <div class="welcome-container">
        <div class="welcome-content">
          <div class="welcome-icon">
            <i class="el-icon-message"></i>
          </div>
          <h2>欢迎使用通信功能</h2>
          <p>选择一个联系人或会话开始聊天</p>
        </div>
      </div>
    </template>
  </ChatLayout>
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.contact-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-bar {
  margin-bottom: 16px;
}

.contact-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item .el-avatar {
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.contact-last-message {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.contact-time {
  margin-left: 8px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 会话列表样式 */
.session-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.session-items {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

/* 状态样式 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.loading-icon,
.error-icon,
.empty-icon {
  margin-bottom: 16px;
  font-size: 48px;
}

.loading-icon {
  animation: rotate 2s linear infinite;
}

.error-icon {
  color: #f56c6c;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item-pinned {
  background-color: #ecf5ff;
}

.session-item .el-avatar {
  margin-right: 12px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.session-time {
  font-size: 12px;
  color: #c0c4cc;
}

.session-last-message-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-last-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

/* 欢迎页面样式 */
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
}

.welcome-content {
  padding: 40px;
  text-align: center;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.welcome-icon {
  margin-bottom: 16px;
  font-size: 64px;
  color: #408aed;
}

.welcome-content h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.welcome-content p {
  margin: 0 0 24px;
  font-size: 16px;
  color: #606266;
}

.welcome-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 聊天详情样式 */
.chat-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}

/* 聊天头部样式 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  flex-shrink: 0;
  height: 56px;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.contact-status {
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 消息列表样式 */
.message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 56px - 200px);
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 60%;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  word-wrap: break-word;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.message-sent .message-bubble {
  color: #fff;
  background-color: #408aed;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  color: #303133;
  background-color: #fff;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-status {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  font-size: 11px;
  opacity: 0.8;
}

.message-time {
  color: inherit;
}

.message-delivery-status {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 12px;
}

.message-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

/* 消息输入区域样式 */
.message-input-area {
  padding: 12px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  height: 200px;
}

.input-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container :deep(.el-textarea) {
  flex: 1;
  margin-bottom: 0;
}

.input-container :deep(.el-textarea__inner) {
  min-height: 60px;
  max-height: 120px;
  resize: none;
  border-radius: 16px;
}

/* 表情选择器样式 */
.emoji-picker {
  position: absolute;
  bottom: 120px;
  left: 20px;
  z-index: 100;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
  min-width: 350px;
}

/* 现代化表情选择器 */
.modern-emoji-picker {
  border-radius: 16px;
  overflow: hidden;
}

.emoji-tabs {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.emoji-tab {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
}

.emoji-tab:hover {
  background-color: #f0f0f0;
}

.emoji-tab.active {
  background-color: #409eff;
  color: white;
  transform: scale(1.1);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  padding: 12px;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fff;
}

.emoji-item {
  padding: 6px;
  font-size: 24px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: transparent;
  user-select: none;
}

.emoji-item:hover {
  background-color: #f0f9ff;
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 文件上传容器 */
.file-upload-container {
  position: absolute;
  bottom: 120px;
  left: 20px;
  z-index: 100;
  width: 350px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
  overflow: hidden;
}

.file-upload-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.file-upload-tab {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
  font-weight: 500;
}

.file-upload-tab:hover {
  background-color: #f0f0f0;
}

.file-upload-tab.active {
  background-color: #409eff;
  color: white;
}

.file-upload-content {
  padding: 20px;
}

.file-upload-drag-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.file-upload-drag-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.file-upload-drag-area i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
  transition: color 0.2s ease;
}

.file-upload-drag-area:hover i {
  color: #409eff;
}

.file-upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.file-upload-hint {
  margin-top: 16px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

/* 消息输入区域现代化样式 */
.message-input-area {
  padding: 16px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  height: auto;
  min-height: 120px;
  position: relative;
}

/* 主输入容器 */
.input-main-container {
  width: 100%;
}

/* 输入框包装器 */
.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background-color: #f5f7fa;
  border-radius: 24px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.input-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 左侧工具按钮 */
.input-left-tools {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

/* 右侧工具按钮 */
.input-right-tools {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

/* 输入工具按钮 */
.input-tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  font-size: 18px;
  color: #606266;
}

.input-tool-btn:hover {
  background-color: #e9ecef;
  color: #409eff;
  transform: scale(1.1);
}

.input-tool-btn.active {
  background-color: #409eff;
  color: white;
}

/* 简洁的功能按钮区域 */
.input-tools-simple {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: flex-start;
  align-items: center;
  padding: 4px 0;
}

/* 简洁的工具图标按钮 */
.tool-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  position: relative;
  color: #606266;
  background-color: transparent;
  border: none;
}

.tool-icon-btn:hover {
  background-color: #f0f0f0;
  color: #409eff;
}

.tool-icon-btn.active {
  background-color: #e6f0ff;
  color: #409eff;
}

/* 下拉菜单样式 */
.dropdown-btn {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1000;
  display: none;
}

.dropdown-btn:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* 输入区域 */
.input-area {
  flex: 1;
  min-width: 0;
}

/* 简洁的输入框容器 */
.input-main-simple {
  width: 100%;
}

/* 简洁的输入框包装器 */
.input-wrapper-simple {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 简洁的输入框 */
.simple-input {
  border: none;
  resize: none;
  outline: none;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  min-height: 80px;
  max-height: 150px;
  padding: 12px;
  background-color: transparent;
}

.simple-input:focus {
  box-shadow: none;
}

/* 简洁输入框内部样式 */
.simple-input :deep(.el-textarea__inner) {
  border: none;
  resize: none;
  outline: none;
  background-color: transparent;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  min-height: 80px;
  max-height: 150px;
  padding: 0;
  border-radius: 0;
}

.simple-input :deep(.el-textarea__inner):focus {
  box-shadow: none;
  border: none;
}

/* 简洁的发送按钮 */
.send-btn-simple {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 4px;
  user-select: none;
}

.send-btn-simple:hover:not(.disabled) {
  background-color: #e6f0ff;
  border-color: #409eff;
  color: #409eff;
}

.send-btn-simple.disabled {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 滚动条样式 */
.chat-main-messages::-webkit-scrollbar,
.emoji-grid::-webkit-scrollbar,
.session-items::-webkit-scrollbar,
.contact-items::-webkit-scrollbar {
  width: 6px;
}

.chat-main-messages::-webkit-scrollbar-track,
.emoji-grid::-webkit-scrollbar-track,
.session-items::-webkit-scrollbar-track,
.contact-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-main-messages::-webkit-scrollbar-thumb,
.emoji-grid::-webkit-scrollbar-thumb,
.session-items::-webkit-scrollbar-thumb,
.contact-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.chat-main-messages::-webkit-scrollbar-thumb:hover,
.emoji-grid::-webkit-scrollbar-thumb:hover,
.session-items::-webkit-scrollbar-thumb:hover,
.contact-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 用户详情面板样式 */
.user-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid #e4e7ed;
}

.user-detail-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.user-info-section,
.user-contact-section,
.user-status-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.info-item {
  display: flex;
  gap: 12px;
}

.info-label {
  width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  text-align: right;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.status-description {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 会话和联系人项高亮样式 */
.session-item-active,
.contact-item-active {
  background-color: #ecf5ff !important;
  border-left: 4px solid #409eff;
}
</style>
