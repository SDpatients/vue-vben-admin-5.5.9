import { requestClient } from '#/api/request';

export namespace ChatApi {
  /** 联系人信息 */
  export interface ContactInfo {
    contactId: number;
    userId: number;
    userName: string;
    avatar?: string;
    status: string;
    lastMessage?: string;
    lastMessageTime?: string;
  }

  /** 联系人组信息 */
  export interface ContactGroupInfo {
    groupId: number;
    groupName: string;
    contacts: ContactInfo[];
  }

  /** 聊天会话信息 */
  export interface ChatSessionInfo {
    sessionId: number;
    sessionType: string;
    targetId: number;
    targetName: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
  }

  /** 聊天消息信息 */
  export interface ChatMessageInfo {
    messageId: number;
    sessionId: number;
    senderId: number;
    senderName: string;
    content: string;
    messageType: string;
    sendTime: string;
    status: string;
  }

  /** 联系人列表响应 */
  export interface ContactListResponse {
    data: ContactGroupInfo[];
    code: number;
    message: string;
  }

  /** 聊天会话列表响应 */
  export interface ChatSessionListResponse {
    data: ChatSessionInfo[];
    code: number;
    message: string;
  }

  /** 聊天消息列表响应 */
  export interface ChatMessageListResponse {
    data: {
      count: number;
      pages: number;
      records: ChatMessageInfo[];
    };
    code: number;
    message: string;
  }

  /** 聊天响应 */
  export interface ChatResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取联系人列表
 */
export async function getContactsApi() {
  return requestClient.get<ChatApi.ContactListResponse>('/chat/contacts');
}

/**
 * 获取联系人分组列表
 */
export async function getContactGroupsApi() {
  return requestClient.get<ChatApi.ContactGroupInfo[]>('/chat/contact-groups');
}

/**
 * 获取聊天会话列表
 */
export async function getChatSessionsApi() {
  return requestClient.get<ChatApi.ChatSessionListResponse>('/chat/sessions');
}

/**
 * 获取聊天消息列表
 */
export async function getChatMessagesApi() {
  return requestClient.get<ChatApi.ChatMessageListResponse>('/chat/messages');
}

/**
 * 发送聊天消息
 */
export async function sendChatMessageApi() {
  return requestClient.post<ChatApi.ChatResponse>('/chat/messages');
}
