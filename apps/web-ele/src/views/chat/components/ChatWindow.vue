<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

// Props
const props = defineProps<{
  contactAvatar: string;
  contactId: number;
  contactName: string;
  isOnline: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'back'): void;
}>();

// 状态
const messageInput = ref('');
const messages = ref<any[]>([]);
const showEmojiPicker = ref(false);
const showFileUpload = ref(false);

// 模拟数据
const mockMessages = [
  {
    id: 1,
    senderId: props.contactId,
    receiverId: 2,
    content: '你好，最近怎么样？',
    timestamp: '2023-05-20T10:30:00',
    status: 'read',
    isSent: false,
  },
  {
    id: 2,
    senderId: 2,
    receiverId: props.contactId,
    content: '挺好的，你呢？',
    timestamp: '2023-05-20T10:31:00',
    status: 'sent',
    isSent: true,
  },
  {
    id: 3,
    senderId: props.contactId,
    receiverId: 2,
    content: '我也不错，最近在忙项目',
    timestamp: '2023-05-20T10:32:00',
    status: 'read',
    isSent: false,
  },
  {
    id: 4,
    senderId: 2,
    receiverId: props.contactId,
    content: '项目进展如何？',
    timestamp: '2023-05-20T10:33:00',
    status: 'sent',
    isSent: true,
  },
];

// 计算属性
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
function sendMessage() {
  if (!messageInput.value.trim()) return;

  const newMessage = {
    id: messages.value.length + 1,
    senderId: 2,
    receiverId: props.contactId,
    content: messageInput.value.trim(),
    timestamp: new Date().toISOString(),
    status: 'sending',
    isSent: true,
  };

  messages.value.push(newMessage);
  messageInput.value = '';

  // 模拟消息发送成功
  setTimeout(() => {
    newMessage.status = 'sent';
  }, 500);

  // 模拟对方回复
  setTimeout(() => {
    const replyMessage = {
      id: messages.value.length + 1,
      senderId: props.contactId,
      receiverId: 2,
      content: `收到你的消息：${newMessage.content}`,
      timestamp: new Date().toISOString(),
      status: 'read',
      isSent: false,
    };
    messages.value.push(replyMessage);
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

function goBack() {
  emit('back');
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

// 生命周期钩子
onMounted(() => {
  messages.value = [...mockMessages];
  scrollToBottom();
});

// 监听消息变化，自动滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);
</script>

<template>
  <div class="chat-window">
    <!-- 顶部联系人信息 -->
    <header class="chat-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-back" @click="goBack">
          返回
        </el-button>
        <el-avatar :src="props.contactAvatar" size="small" />
        <div class="contact-info">
          <div class="contact-name">
            {{ props.contactName }}
            <el-tag v-if="props.isOnline" type="success" size="small">
              在线
            </el-tag>
            <el-tag v-else type="info" size="small">离线</el-tag>
          </div>
          <div class="contact-status">最近活跃：刚刚</div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="text" icon="el-icon-phone" />
        <el-button type="text" icon="el-icon-video-camera" />
        <el-button type="text" icon="el-icon-more">
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>查看详情</el-dropdown-item>
              <el-dropdown-item>设置备注</el-dropdown-item>
              <el-dropdown-item>加入黑名单</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-button>
      </div>
    </header>

    <!-- 消息列表 -->
    <main class="message-list">
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
          :src="props.contactAvatar"
          size="small"
          class="message-avatar"
        />
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
    </main>

    <!-- 消息输入区域 -->
    <footer class="message-input-area">
      <!-- 功能按钮 -->
      <div class="input-tools">
        <el-button type="text" icon="el-icon-plus" @click="toggleFileUpload">
          <template #dropdown v-if="showFileUpload">
            <el-dropdown-menu>
              <el-dropdown-item>
                <i class="el-icon-picture icon-mr"></i>
                <span>发送图片</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <i class="el-icon-document icon-mr"></i>
                <span>发送文件</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-button>
        <el-button
          type="text"
          icon="el-icon-emoji"
          @click="toggleEmojiPicker"
        />
        <el-button type="text" icon="el-icon-camera" />
        <el-button type="text" icon="el-icon-mic" />
      </div>

      <!-- 消息输入框 -->
      <div class="input-container">
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          resize="none"
          @keydown="handleKeyPress"
        />
        <el-button
          type="primary"
          icon="el-icon-send"
          @click="sendMessage"
          :disabled="!messageInput.trim()"
        >
          发送
        </el-button>
      </div>

      <!-- 表情选择器 -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-grid">
          <span
            v-for="emoji in [
              '😀',
              '😃',
              '😄',
              '😁',
              '😆',
              '😅',
              '😂',
              '🤣',
              '😊',
              '😇',
              '🙂',
              '🙃',
              '😉',
              '😌',
              '😍',
              '🥰',
              '😘',
              '😗',
              '😙',
              '😚',
              '😋',
              '😛',
              '😝',
              '😜',
              '🤪',
              '🤨',
              '🧐',
              '🤓',
              '😎',
              '🤩',
              '🥳',
              '😏',
              '😒',
              '😞',
              '😔',
              '😟',
              '😕',
              '🙁',
              '☹️',
              '😣',
              '😖',
              '😫',
              '😩',
              '🥺',
              '😢',
              '😭',
              '😤',
              '😠',
              '😡',
              '🤬',
              '🤯',
              '😳',
              '🥵',
              '🥶',
              '😱',
              '😨',
              '😰',
              '😥',
              '😓',
              '🤗',
              '🤔',
              '🤭',
              '🤫',
              '🤥',
              '😶',
              '😐',
              '😑',
              '😬',
              '🙄',
              '😯',
              '😦',
              '😧',
              '😮',
              '😲',
              '🥱',
              '😴',
              '🤤',
              '😪',
              '😵',
              '🤐',
              '🥴',
              '🤢',
              '🤮',
              '🤧',
              '😷',
              '🤒',
              '🤕',
              '🤑',
              '🤠',
              '😈',
              '👿',
              '👹',
              '👺',
              '🤡',
              '💩',
              '👻',
              '💀',
              '☠️',
              '👽',
              '👾',
              '🤖',
              '🎃',
              '😺',
              '😸',
              '😹',
              '😻',
              '😼',
              '😽',
              '🙀',
              '😿',
              '😾',
            ]"
            :key="emoji"
            class="emoji-item"
            @click="addEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
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
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  padding: 4px;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar,
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track,
.emoji-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.message-list::-webkit-scrollbar-thumb,
.emoji-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover,
.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
