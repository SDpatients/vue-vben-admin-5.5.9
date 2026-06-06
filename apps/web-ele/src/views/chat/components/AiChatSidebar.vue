<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { useAiChatStore } from '#/views/chat/stores/ai-chat';

import MarkdownRender from './MarkdownRender.vue';

const props = defineProps<{
  caseId: number;
  caseName?: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const aiChatStore = useAiChatStore();
const messageInput = ref('');
const messagesContainerRef = ref<HTMLElement | null>(null);
const editingSessionId = ref(0);
const editingSessionName = ref('');

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop =
        messagesContainerRef.value.scrollHeight;
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

function handleClear() {
  aiChatStore.clearMessages();
}

function handleQuickQuestion(question: string) {
  messageInput.value = question;
  handleSendMessage();
}

function close() {
  emit('update:visible', false);
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function handleCreateSession() {
  const session = await aiChatStore.createSession();
  if (session) {
    await aiChatStore.switchSession(session.id);
    scrollToBottom();
  }
}

async function handleSwitchSession(id: number) {
  await aiChatStore.switchSession(id);
  scrollToBottom();
}

async function handleDeleteSession(id: number) {
  await aiChatStore.deleteSession(id);
  if (aiChatStore.sessions.length > 0) {
    const first = aiChatStore.sessions[0];
    await aiChatStore.switchSession(first.id);
  } else {
    aiChatStore.clearMessages();
  }
  scrollToBottom();
}

function startRename(session: { id: number; sessionName: string }) {
  editingSessionId.value = session.id;
  editingSessionName.value = session.sessionName;
  nextTick(() => {
    const el = document.querySelector('.rename-input') as HTMLInputElement;
    if (el) {
      el.focus();
      el.select();
    }
  });
}

async function commitRename() {
  const name = editingSessionName.value.trim();
  if (name && editingSessionId.value > 0) {
    await aiChatStore.renameSession(editingSessionId.value, name);
  }
  editingSessionId.value = 0;
  editingSessionName.value = '';
}

function cancelRename() {
  editingSessionId.value = 0;
  editingSessionName.value = '';
}

async function init() {
  aiChatStore.setCaseId(props.caseId);
  await aiChatStore.fetchSessions();
  if (aiChatStore.sessions.length > 0) {
    const first = aiChatStore.sessions[0];
    await aiChatStore.switchSession(first.id);
    scrollToBottom();
  }
}

watch(
  () => [aiChatStore.messages, aiChatStore.streamingMessage.content],
  () => {
    scrollToBottom();
  },
  { deep: true },
);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      init();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.visible) {
    init();
  }
});

onUnmounted(() => {
  aiChatStore.stopStreaming();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar">
      <div v-if="visible" class="ai-sidebar-overlay" @click.self="close">
        <div class="ai-sidebar-panel">
          <header class="panel-header">
            <div class="panel-title-row">
              <div class="panel-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="18"
                  height="18"
                >
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>AI 法律助手</span>
                <span class="panel-badge">LegalOne-8B</span>
              </div>
              <div class="panel-actions">
                <button class="panel-btn" title="清空当前对话" @click="handleClear">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="panel-btn panel-btn-close" title="关闭" @click="close">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="props.caseName" class="case-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2v6h6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ props.caseName }}</span>
            </div>

            <div class="session-tabs">
              <template v-for="s in aiChatStore.sessions" :key="s.id">
                <div
                  v-if="editingSessionId !== s.id"
                  class="session-tab"
                  :class="{ active: s.id === aiChatStore.currentSessionId }"
                  @click="handleSwitchSession(s.id)"
                >
                  <span
                    class="session-tab-name"
                    @dblclick.stop="startRename(s)"
                  >
                    {{ s.sessionName }}
                  </span>
                  <button
                    class="session-tab-close"
                    @click.stop="handleDeleteSession(s.id)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                      <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="session-tab editing">
                  <input
                    v-model="editingSessionName"
                    class="rename-input"
                    maxlength="30"
                    @keyup.enter="commitRename"
                    @keyup.escape="cancelRename"
                    @blur="commitRename"
                  />
                </div>
              </template>

              <button
                class="session-tab session-tab--add"
                :disabled="aiChatStore.sessions.length >= 10"
                title="新建窗口"
                @click="handleCreateSession"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          <main ref="messagesContainerRef" class="panel-body">
            <div v-if="aiChatStore.loading" class="state-loading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" class="spin-icon">
                <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                  <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.2s" repeatCount="indefinite"/>
                </circle>
              </svg>
              加载中...
            </div>

            <div
              v-else-if="aiChatStore.messages.length === 0 && !aiChatStore.streamingMessage.isStreaming"
              class="state-empty"
            >
              <p class="state-intro">
                基于 LegalOne-8B 法律大模型，为您分析当前破产案件的数据情况。
              </p>
              <div class="quick-list">
                <button
                  v-for="q in [
                    '请分析当前案件的总体情况',
                    '债权申报进展如何',
                    '分析案件的债务情况',
                    '当前资金状况如何',
                  ]"
                  :key="q"
                  class="quick-item"
                  @click="handleQuickQuestion(q)"
                >
                  {{ q }}
                </button>
              </div>
            </div>

            <template v-else>
              <div
                v-for="message in aiChatStore.messages"
                :key="message.id"
                class="msg-row"
                :class="message.sender === 'user' ? 'msg-row--user' : 'msg-row--ai'"
              >
                <div v-if="message.sender === 'ai'" class="msg-avatar ai-avatar">AI</div>

                <div class="msg-body" :class="message.sender === 'ai' ? 'msg-body--ai' : 'msg-body--user'">
                  <MarkdownRender v-if="message.sender === 'ai'" :content="message.content" class="msg-text" />
                  <div v-else class="msg-text">{{ message.content }}</div>
                  <div class="msg-meta">{{ formatTime(message.timestamp) }}</div>
                </div>

                <div v-if="message.sender === 'user'" class="msg-avatar user-avatar">我</div>
              </div>

              <div
                v-if="aiChatStore.streamingMessage.isStreaming"
                class="msg-row msg-row--ai"
              >
                <div class="msg-avatar ai-avatar">AI</div>
                <div class="msg-body msg-body--ai msg-body--streaming">
                  <div class="msg-text">
                    <template v-if="aiChatStore.streamingMessage.content">
                      <MarkdownRender :content="aiChatStore.streamingMessage.content" />
                    </template>
                    <span v-else>分析中...</span>
                    <span class="cursor-blink">|</span>
                  </div>
                </div>
              </div>
            </template>
          </main>

          <footer class="panel-footer">
            <div v-if="aiChatStore.error" class="error-tip">
              <span>{{ aiChatStore.error }}</span>
              <button class="error-dismiss" @click="aiChatStore.error = null">关闭</button>
            </div>

            <div class="input-group">
              <input
                v-model="messageInput"
                type="text"
                class="input-field"
                placeholder="请输入您的问题，Enter 发送"
                :disabled="aiChatStore.isAiResponding"
                @keydown="handleKeyPress"
              />
              <button
                v-if="!aiChatStore.isAiResponding"
                class="btn-send"
                :disabled="!messageInput.trim()"
                @click="handleSendMessage"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
              <button
                v-else
                class="btn-stop"
                title="停止"
                @click="handleStopStreaming"
              >
                停止
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from .ai-sidebar-panel,
.sidebar-leave-to .ai-sidebar-panel {
  transform: translateX(60px);
}

.sidebar-enter-active .ai-sidebar-panel,
.sidebar-leave-active .ai-sidebar-panel {
  transition: transform 0.25s ease;
}

.ai-sidebar-overlay {
  position: fixed;
  inset: 0 0 0 0;
  z-index: 9990;
  display: flex;
  justify-content: flex-end;
  background: rgb(0 0 0 / 30%);
}

.ai-sidebar-panel {
  display: flex;
  flex-direction: column;
  width: 520px;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 24px rgb(0 0 0 / 10%);
}

.panel-header {
  background: #1e293b;
  color: #f1f5f9;
  flex-shrink: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.panel-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.panel-badge {
  font-size: 10px;
  padding: 2px 7px;
  background: rgb(255 255 255 / 12%);
  border-radius: 3px;
  font-weight: 400;
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  border-radius: 5px;
  color: #94a3b8;
  cursor: pointer;
}

.panel-btn:hover {
  background: rgb(255 255 255 / 10%);
  color: #e2e8f0;
}

.panel-btn-close:hover {
  color: #f87171;
}

.case-bar {
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 6px 20px 8px;
  font-size: 12px;
  color: #94a3b8;
}

.session-tabs {
  display: flex;
  align-items: flex-end;
  padding: 0 16px 0 16px;
  gap: 2px;
  overflow-x: auto;
  border-top: 1px solid rgb(255 255 255 / 8%);
}

.session-tabs::-webkit-scrollbar {
  height: 2px;
}

.session-tabs::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 12%);
}

.session-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: rgb(255 255 255 / 5%);
  border: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  max-width: 160px;
  flex-shrink: 0;
}

.session-tab:hover {
  background: rgb(255 255 255 / 10%);
  color: #cbd5e1;
}

.session-tab.active {
  background: #fff;
  color: #1e293b;
  font-weight: 500;
}

.session-tab.editing {
  background: rgb(255 255 255 / 8%);
  padding: 8px 10px;
}

.session-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  border-radius: 3px;
  flex-shrink: 0;
}

.session-tab:hover .session-tab-close {
  opacity: 1;
}

.session-tab-close:hover {
  background: rgb(0 0 0 / 10%);
}

.session-tab.active .session-tab-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.rename-input {
  width: 100px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 4px;
  background: rgb(0 0 0 / 20%);
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
}

.rename-input:focus {
  border-color: rgb(255 255 255 / 50%);
  background: #1e293b;
}

.session-tab--add {
  width: 36px;
  justify-content: center;
  border-radius: 6px;
  margin-left: 2px;
}

.session-tab--add:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.panel-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #f8fafc;
}

.panel-body::-webkit-scrollbar {
  width: 5px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.state-loading,
.state-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
}

.spin-icon {
  color: #94a3b8;
}

.state-intro {
  font-size: 15px;
  line-height: 1.7;
  max-width: 360px;
  margin: 0;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 360px;
}

.quick-item {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  text-align: left;
  cursor: pointer;
}

.quick-item:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.msg-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.msg-row--user {
  justify-content: flex-end;
}

.msg-row--ai {
  justify-content: flex-start;
}

.msg-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.ai-avatar {
  background: #334155;
  color: #e2e8f0;
}

.user-avatar {
  background: #dbeafe;
  color: #1e40af;
}

.msg-body {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.65;
}

.msg-body--user {
  color: #fff;
  background: #1d4ed8;
  border-bottom-right-radius: 4px;
}

.msg-body--ai {
  color: #1e293b;
  background: #fff;
  border-bottom-left-radius: 4px;
  border: 1px solid #e2e8f0;
}

.msg-body--streaming {
  border: 1px solid #94a3b8;
}

.msg-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  color: #1d4ed8;
  font-weight: 700;
}

@keyframes blink {
  0%, 100% { visibility: visible; }
  50% { visibility: hidden; }
}

.msg-meta {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.55;
  text-align: right;
}

.panel-footer {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.error-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.error-dismiss {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-field {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  background: #f8fafc;
}

.input-field:focus {
  border-color: #1d4ed8;
  background: #fff;
  box-shadow: 0 0 0 3px rgb(29 78 216 / 10%);
}

.input-field:disabled {
  background: #f1f5f9;
  color: #94a3b8;
}

.btn-send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #1d4ed8;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-send:not(:disabled):hover {
  background: #1e40af;
}

.btn-stop {
  height: 44px;
  padding: 0 16px;
  background: #dc2626;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-stop:hover {
  background: #b91c1c;
}
</style>