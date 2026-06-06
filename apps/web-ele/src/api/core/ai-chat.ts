import { chatRequestClient } from '#/api/request';

export namespace AiChatApi {
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

  export interface AiChatHistoryResponse {
    code: number;
    message: string;
    data: AiChatMessage[];
  }

  export interface AiChatSessionsResponse {
    code: number;
    message: string;
    data: AiChatSession[];
  }

  export interface AiChatSessionResponse {
    code: number;
    message: string;
    data: AiChatSession;
  }

  export interface StreamChunkCallback {
    (accumulatedText: string): void;
  }

  export interface StreamCompleteCallback {
    (): void;
  }

  export interface StreamErrorCallback {
    (error: Error): void;
  }

  export interface StreamCallbacks {
    onChunk: StreamChunkCallback;
    onComplete: StreamCompleteCallback;
    onError: StreamErrorCallback;
  }
}

export async function getAiChatSessionsApi(
  caseId: number,
  userId: number,
): Promise<AiChatApi.AiChatSessionsResponse> {
  return chatRequestClient.get<AiChatApi.AiChatSessionsResponse>(
    '/ai/chat/sessions',
    { params: { caseId, userId } },
  );
}

export async function createAiChatSessionApi(
  caseId: number,
  userId: number,
  sessionName?: string,
): Promise<AiChatApi.AiChatSessionResponse> {
  return chatRequestClient.post<AiChatApi.AiChatSessionResponse>(
    '/ai/chat/session',
    null,
    { params: { caseId, userId, sessionName } },
  );
}

export async function renameAiChatSessionApi(
  sessionId: number,
  sessionName: string,
  userId: number,
): Promise<AiChatApi.AiChatSessionResponse> {
  return chatRequestClient.put<AiChatApi.AiChatSessionResponse>(
    `/ai/chat/session/${sessionId}/rename`,
    null,
    { params: { sessionName, userId } },
  );
}

export async function deleteAiChatSessionApi(
  sessionId: number,
  userId: number,
): Promise<{ code: number; message: string }> {
  return chatRequestClient.delete(
    `/ai/chat/session/${sessionId}`,
    { params: { userId } },
  );
}

export async function getAiChatHistoryApi(
  caseId: number,
): Promise<AiChatApi.AiChatHistoryResponse> {
  return chatRequestClient.get<AiChatApi.AiChatHistoryResponse>(
    '/ai/chat/history',
    { params: { caseId } },
  );
}

export async function getSessionMessagesApi(
  sessionId: number,
): Promise<AiChatApi.AiChatHistoryResponse> {
  return chatRequestClient.get<AiChatApi.AiChatHistoryResponse>(
    `/ai/chat/session/${sessionId}/messages`,
  );
}

export function sendAiChatMessageStream(
  params: {
    caseId: number;
    content: string;
    sessionId?: number;
    userId?: number;
  },
  callbacks: AiChatApi.StreamCallbacks,
): { abort: () => void } {
  const abortController = new AbortController();

  const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || '/api/v1';

  fetch(`${chatApiUrl}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify(params),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text().catch(() => '未知错误');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let eventType = '';
      let dataLines: string[] = [];

      function flushData() {
        if (dataLines.length === 0) return;
        const fullData = dataLines.join('\n');

        if (eventType === 'chunk') {
          callbacks.onChunk(fullData);
        } else if (eventType === 'complete') {
          callbacks.onComplete();
        } else if (eventType === 'error') {
          callbacks.onError(new Error(fullData));
        }
        dataLines = [];
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          flushData();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            flushData();
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5));
          } else {
            dataLines.push(line);
          }
        }

        flushData();
      }
    })
    .catch((error) => {
      if ((error as Error).name === 'AbortError') return;
      callbacks.onError(
        error instanceof Error ? error : new Error(String(error)),
      );
    });

  return { abort: () => abortController.abort() };
}
