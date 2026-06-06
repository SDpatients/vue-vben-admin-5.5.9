<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';

import { useAiChatStore } from '../stores/ai-chat';

const props = defineProps<{
  caseId: number;
  caseName?: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const aiChatStore = useAiChatStore();
const messageInput = ref('');
const messagesEndRef = ref<HTMLElement | null>(null);

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

async function handleSendMessage() {
  if (!messageInput.value.trim() || aiChatStore.isAiResponding) return;

  const content = messageInput.value;
  messageInput.value = '';

  await aiChatStore.sendMessage(content);
  scrollToBottom();
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}

function handleStopStreaming() {
  aiChatStore.stopStreaming();
}

function goBack() {
  emit('back');
}

watch(
  () => [aiChatStore.messages, aiChatStore.streamingMessage.content],
  () => {
    scrollToBottom();
  },
  { deep: true },
);

onUnmounted(() => {
  aiChatStore.stopStreaming();
});
</script>

<template>
  <div class="ai-chat-window">
    <header class="ai-chat-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <i class="el-icon-back"></i>
          返回
        </el-button>
        <div class="ai-icon-wrapper">
          <svg
            viewBox="0 0 24 24"
            class="ai-icon"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 12h8M12 8v8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="header-info">
          <div class="header-title">
            AI 法律助手
            <el-tag size="small" type="warning" effect="plain">
              LegalOne-8B
            </el-tag>
          </div>
          <div class="header-subtitle">
            {{ props.caseName ? `案件: ${props.caseName}` : '破产案件智能分析' }}
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button link @click="aiChatStore.clearMessages()">
          <i class="el-icon-delete"></i>
          清空对话
        </el-button>
      </div>
    </header>

    <main class="ai-message-list">
      <div v-if="aiChatStore.loading" class="loading-state">
        <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
        <span>加载历史记录...</span>
      </div>

      <div
        v-else-if="aiChatStore.messages.length === 0 && !aiChatStore.streamingMessage.isStreaming"
        class="empty-state"
      >
        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="empty-title">AI 法律助手</p>
        <p class="empty-desc">
          基于 LegalOne-8B 法律大模型，为您提供破产案件智能分析。<br />
          请输入您的问题，AI 将结合案件数据为您解答。
        </p>
        <div class="quick-questions">
          <el-button
            text
            class="quick-btn"
            @click="messageInput = '请分析当前案件的总体情况'; handleSendMessage()"
          >
            分析案件总体情况
          </el-button>
          <el-button
            text
            class="quick-btn"
            @click="messageInput = '当前案件的债权申报进展如何？'; handleSendMessage()"
          >
            债权申报进展
          </el-button>
          <el-button
            text
            class="quick-btn"
            @click="messageInput = '请分析案件的债务情况'; handleSendMessage()"
          >
            分析债务情况
          </el-button>
          <el-button
            text
            class="quick-btn"
            @click="messageInput = '案件的资金状况如何？'; handleSendMessage()"
          >
            查看资金状况
          </el-button>
        </div>
      </div>

      <template v-else>
        <div
          v-for="message in aiChatStore.messages"
          :key="message.id"
          class="ai-message-item"
          :class="{
            'message-user': message.sender === 'user',
            'message-ai': message.sender === 'ai',
          }"
        >
          <div v-if="message.sender === 'ai'" class="ai-avatar-badge">
            <span>AI</span>
          </div>

          <div class="message-content">
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <div v-if="message.sender === 'user'" class="user-avatar-badge">
            <span>我</span>
          </div>
        </div>

        <div
          v-if="aiChatStore.streamingMessage.isStreaming"
          class="ai-message-item message-ai"
        >
          <div class="ai-avatar-badge">
            <span>AI</span>
          </div>
          <div class="message-content">
            <div class="message-bubble streaming">
              <div class="message-text">
                {{ aiChatStore.streamingMessage.content || '思考中...' }}
                <span class="streaming-cursor">|</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div ref="messagesEndRef"></div>
    </main>

    <footer class="ai-input-area">
      <div v-if="aiChatStore.error" class="error-bar">
        <span>{{ aiChatStore.error }}</span>
        <el-button link type="danger" @click="aiChatStore.error = null">
          关闭
        </el-button>
      </div>

      <div class="input-container">
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="2"
          placeholder="输入您的问题，如：分析当前案件的债权情况..."
          resize="none"
          :disabled="aiChatStore.isAiResponding"
          @keydown="handleKeyPress"
        />
        <el-button
          v-if="!aiChatStore.isAiResponding"
          type="primary"
          :disabled="!messageInput.trim()"
          @click="handleSendMessage"
        >
          <i class="el-icon-send"></i>
          发送
        </el-button>
        <el-button
          v-else
          type="danger"
          @click="handleStopStreaming"
        >
          <i class="el-icon-close"></i>
          停止
        </el-button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.ai-chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f0f2f5;
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgb(102 126 234 / 30%);
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ai-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgb(255 255 255 / 20%);
  border-radius: 10px;
}

.ai-icon {
  width: 22px;
  height: 22px;
  color: #fff;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 12px;
  opacity: 0.85;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-right :deep(.el-button) {
  color: rgb(255 255 255 / 85%);
}

.header-right :deep(.el-button:hover) {
  color: #fff;
}

.ai-message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-icon svg {
  width: 64px;
  height: 64px;
  color: #c0c4cc;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.empty-desc {
  font-size: 14px;
  color: #909399;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 12px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 480px;
}

.quick-btn {
  font-size: 13px;
  color: #667eea;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  padding: 6px 16px;
  transition: all 0.2s;
}

.quick-btn:hover {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.ai-message-item {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-user {
  justify-content: flex-end;
}

.message-ai {
  justify-content: flex-start;
}

.ai-avatar-badge,
.user-avatar-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.ai-avatar-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.user-avatar-badge {
  background: #e8f4ff;
  color: #409eff;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  word-wrap: break-word;
  line-height: 1.6;
}

.message-user .message-bubble {
  color: #fff;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgb(64 158 255 / 25%);
}

.message-ai .message-bubble {
  color: #303133;
  background: #fff;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.message-bubble.streaming {
  border: 1px solid #e8eaed;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.streaming-cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
  color: #667eea;
  font-weight: 700;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.message-ai .message-time {
  text-align: left;
}

.message-user .message-time {
  text-align: right;
}

.ai-input-area {
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.error-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #f56c6c;
  background: #fef0f0;
  border-radius: 8px;
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
  min-height: 48px;
  max-height: 120px;
  resize: none;
  border-radius: 12px;
  font-size: 14px;
}

.ai-message-list::-webkit-scrollbar {
  width: 6px;
}

.ai-message-list::-webkit-scrollbar-track {
  background: transparent;
}

.ai-message-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.ai-message-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>