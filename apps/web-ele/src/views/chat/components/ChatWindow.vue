<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { useChatStore } from '../stores/chat';

// Props
const props = defineProps<{
  contactAvatar: string;
  contactId: number;
  contactName: string;
  isOnline: boolean;
  conversationId: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'back'): void;
}>();

// Store
const chatStore = useChatStore();

// 状态
const messageInput = ref('');
const showEmojiPicker = ref(false);
const showFileUpload = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);
const typingTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);
const isTyping = ref(false);

// 获取当前用户ID
const getCurrentUserId = (): number => {
  const userId = localStorage.getItem('chat_user_id');
  return userId ? Number.parseInt(userId) : 1;
};

// 计算属性
const currentUserId = computed(() => getCurrentUserId());

const formattedMessages = computed(() => {
  return chatStore.currentMessages.map((msg) => ({
    ...msg,
    formattedTime: new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isSent: msg.senderId === currentUserId.value,
  }));
});

const isTypingWithContact = computed(() => {
  return chatStore.typingStatus[props.contactId] || false;
});

// 方法
async function sendMessage() {
  if (!messageInput.value.trim()) return;

  const content = messageInput.value.trim();
  messageInput.value = '';

  try {
    await chatStore.sendMessage({
      senderId: currentUserId.value,
      receiverId: props.contactId,
      messageType: 'TEXT',
      content,
    });

    scrollToBottom();
  } catch (error) {
    console.error('发送消息失败:', error);
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  } else {
    handleTyping();
  }
}

function handleTyping() {
  if (!isTyping.value) {
    isTyping.value = true;
    webSocketService.sendTypingStatus(props.conversationId);
  }

  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
  }

  typingTimeoutRef.value = setTimeout(() => {
    isTyping.value = false;
  }, 3000);
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

async function recallMessage(messageId: number) {
  try {
    await chatStore.recallMessage(messageId, currentUserId.value);
  } catch (error) {
    console.error('撤回消息失败:', error);
  }
}

async function deleteMessage(messageId: number) {
  try {
    await chatStore.deleteMessage(messageId, currentUserId.value);
  } catch (error) {
    console.error('删除消息失败:', error);
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// 生命周期钩子
onMounted(async () => {
  try {
    await chatStore.fetchChatMessages({
      conversationId: props.conversationId,
      pageNum: 1,
      pageSize: 50,
    });

    await chatStore.markConversationAsRead(props.conversationId, currentUserId.value);

    scrollToBottom();
  } catch (error) {
    console.error('加载消息失败:', error);
  }
});

onUnmounted(() => {
  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
  }
});

// 监听消息变化，自动滚动到底部
watch(
  () => chatStore.currentMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// 组件卸载时清理 typing 定时器（防止内存泄漏）
onUnmounted(() => {
  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
    typingTimeoutRef.value = null;
  }
});
</script>

<template>
  <div class="chat-window">
    <!-- 顶部联系人信息 -->
    <header class="chat-header">
      <div class="header-left">
        <el-button link icon="el-icon-back" @click="goBack">
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
        <el-button link icon="el-icon-phone" />
        <el-button link icon="el-icon-video-camera" />
        <el-button link icon="el-icon-more">
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
            <div v-if="message.isRecalled" class="message-text recalled">
              消息已撤回
            </div>
            <div v-else class="message-text">{{ message.content }}</div>
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
                  v-else-if="message.readStatus"
                  class="status-icon el-icon-check-double"
                ></i>
              </span>
            </div>
            <el-dropdown
              v-if="message.isSent && !message.isRecalled"
              class="message-actions"
            >
              <el-button link size="small" icon="el-icon-more" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="recallMessage(message.id)">
                    撤回
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteMessage(message.id)">
                    删除
                  </el-dropdown-item>
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
      
      <!-- 正在输入提示 -->
      <div v-if="isTypingWithContact" class="typing-indicator">
        <el-avatar :src="props.contactAvatar" size="small" />
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <!-- 滚动锚点 -->
      <div ref="messagesEndRef"></div>
    </main>

    <!-- 消息输入区域 -->
    <footer class="message-input-area">
      <!-- 功能按钮 -->
      <div class="input-tools">
        <el-button link icon="el-icon-plus" @click="toggleFileUpload">
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

.message-text.recalled {
  color: #909399;
  font-style: italic;
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

/* 正在输入提示样式 */
.typing-indicator {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 20px;
}

.typing-bubble {
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background-color: #909399;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
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
