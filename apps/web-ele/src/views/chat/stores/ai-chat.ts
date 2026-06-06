import { ref } from 'vue';

import { defineStore } from 'pinia';

import {
  createAiChatSessionApi,
  deleteAiChatSessionApi,
  getAiChatSessionsApi,
  getSessionMessagesApi,
  renameAiChatSessionApi,
  sendAiChatMessageStream,
} from '#/api/core/ai-chat';

export interface AiChatMessage {
  id: number;
  sessionId: number;
  caseId: number;
  content: string;
  sender: 'ai' | 'user';
  timestamp: string;
  messageStatus: string;
}

export interface AiChatSession {
  id: number;
  caseId: number;
  userId: number;
  sessionName: string;
  lastMessageTime: string | null;
  messageCount: number;
  createTime: string;
  updateTime: string;
}

export interface StreamingMessage {
  content: string;
  isStreaming: boolean;
}

export const useAiChatStore = defineStore('ai-chat', () => {
  const messages = ref<AiChatMessage[]>([]);
  const sessions = ref<AiChatSession[]>([]);
  const currentSessionId = ref<number>(0);
  const caseId = ref<number>(0);
  const userId = ref<number>(0);
  const loading = ref(false);
  const error = ref<null | string>(null);
  const streamingMessage = ref<StreamingMessage>({
    content: '',
    isStreaming: false,
  });
  const isAiResponding = ref(false);

  let currentAbortController: { abort: () => void } | null = null;

  function getUserId(): number {
    if (userId.value) return userId.value;
    const raw =
      localStorage.getItem('chat_user_id') ||
      localStorage.getItem('chat_userid');
    const uid = raw ? Number.parseInt(raw, 10) : 0;
    userId.value = uid;
    return uid;
  }

  function setCaseId(id: number) {
    caseId.value = id;
  }

  function setCurrentSessionId(id: number) {
    currentSessionId.value = id;
  }

  function addMessage(message: AiChatMessage) {
    messages.value.push(message);
  }

  function setMessages(newMessages: AiChatMessage[]) {
    messages.value = newMessages;
  }

  function clearStreamingMessage() {
    if (streamingMessage.value.content) {
      const aiMessage: AiChatMessage = {
        id: Date.now(),
        sessionId: currentSessionId.value,
        caseId: caseId.value,
        content: streamingMessage.value.content,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        messageStatus: 'SENT',
      };
      messages.value.push(aiMessage);
    }
    streamingMessage.value = { content: '', isStreaming: false };
    isAiResponding.value = false;
  }

  async function fetchSessions() {
    const uid = getUserId();
    if (!caseId.value || !uid) return;

    try {
      const response = await getAiChatSessionsApi(caseId.value, uid);
      if (response.code === 200) {
        sessions.value = response.data;
      }
    } catch (err) {
      console.error('获取AI聊天窗口列表失败:', err);
    }
  }

  async function createSession(name?: string): Promise<AiChatSession | null> {
    const uid = getUserId();
    if (!caseId.value || !uid) return null;

    try {
      const response = await createAiChatSessionApi(
        caseId.value,
        uid,
        name,
      );
      if (response.code === 200) {
        sessions.value.unshift(response.data);
        return response.data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建窗口失败';
    }
    return null;
  }

  async function renameSession(sessionId: number, name: string) {
    const uid = getUserId();
    if (!uid) return;

    try {
      await renameAiChatSessionApi(sessionId, name, uid);
      const session = sessions.value.find((s) => s.id === sessionId);
      if (session) session.sessionName = name;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重命名失败';
    }
  }

  async function deleteSession(sessionId: number) {
    const uid = getUserId();
    if (!uid) return;

    try {
      await deleteAiChatSessionApi(sessionId, uid);
      sessions.value = sessions.value.filter((s) => s.id !== sessionId);
      if (currentSessionId.value === sessionId) {
        messages.value = [];
        currentSessionId.value = 0;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除窗口失败';
    }
  }

  async function switchSession(sessionId: number) {
    if (sessionId === currentSessionId.value) return;
    stopStreaming();
    currentSessionId.value = sessionId;

    loading.value = true;
    messages.value = [];
    try {
      const response = await getSessionMessagesApi(sessionId);
      if (response.code === 200) {
        messages.value = response.data;
      }
    } catch (err) {
      console.error('加载窗口消息失败:', err);
    } finally {
      loading.value = false;
    }
  }

  async function ensureSession(): Promise<number> {
    if (currentSessionId.value > 0) return currentSessionId.value;

    const session = await createSession();
    if (session) {
      currentSessionId.value = session.id;
      return session.id;
    }
    return 0;
  }

  async function sendMessage(content: string) {
    if (!content.trim() || !caseId.value) return;

    const sessionId = await ensureSession();
    if (!sessionId) {
      error.value = '无法创建聊天窗口';
      return;
    }

    const userMessage: AiChatMessage = {
      id: Date.now(),
      sessionId,
      caseId: caseId.value,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageStatus: 'SENT',
    };
    addMessage(userMessage);

    const uid = getUserId();

    isAiResponding.value = true;
    streamingMessage.value = { content: '', isStreaming: true };
    error.value = null;

    currentAbortController = sendAiChatMessageStream(
      {
        caseId: caseId.value,
        content: content.trim(),
        sessionId,
        userId: uid || undefined,
      },
      {
        onChunk: (accumulatedText: string) => {
          streamingMessage.value.content = accumulatedText;
        },
        onComplete: () => {
          clearStreamingMessage();
          currentAbortController = null;
          fetchSessions();
        },
        onError: (err: Error) => {
          const fallbackMsg = '抱歉，AI服务暂时不可用，请稍后重试。';
          if (streamingMessage.value.content) {
            clearStreamingMessage();
          } else {
            const aiMessage: AiChatMessage = {
              id: Date.now(),
              sessionId,
              caseId: caseId.value,
              content: fallbackMsg,
              sender: 'ai',
              timestamp: new Date().toISOString(),
              messageStatus: 'SENT',
            };
            messages.value.push(aiMessage);
          }
          streamingMessage.value = { content: '', isStreaming: false };
          isAiResponding.value = false;
          error.value = err.message;
          currentAbortController = null;
        },
      },
    );
  }

  function stopStreaming() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      clearStreamingMessage();
    }
  }

  function clearMessages() {
    messages.value = [];
  }

  function $reset() {
    messages.value = [];
    sessions.value = [];
    currentSessionId.value = 0;
    caseId.value = 0;
    userId.value = 0;
    loading.value = false;
    error.value = null;
    streamingMessage.value = { content: '', isStreaming: false };
    isAiResponding.value = false;
    currentAbortController = null;
  }

  return {
    messages,
    sessions,
    currentSessionId,
    caseId,
    loading,
    error,
    streamingMessage,
    isAiResponding,
    setCaseId,
    setCurrentSessionId,
    addMessage,
    setMessages,
    clearStreamingMessage,
    fetchSessions,
    createSession,
    renameSession,
    deleteSession,
    switchSession,
    ensureSession,
    sendMessage,
    stopStreaming,
    clearMessages,
    $reset,
  };
});