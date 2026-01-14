import { chatRequestClient } from '#/api/request';

// 定义类型
export namespace ChatApi {
  // 后端返回的基础结构
  export interface BaseResponse<T> {
    data: {
      records: T[];
    };
    status: string;
    error: string;
  }

  // API统一响应格式
  export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }

  // 分页响应格式
  export interface PageResponse<T> {
    records: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }

  // 联系人接口（后端返回格式）
  export interface ContactResponse {
    单据号: number;
    userId: string;
    contactUserId: string;
    name: string;
    phone: string;
    email: string;
    idCard: null | string;
    avatar: null | string;
    description: null | string;
    isSystemUser: null | string;
    分组ID: string;
    在线状态: string;
    最后在线时间: null | string;
    是否置顶: string;
    SEP_LD: any;
    SEP_MD: any;
    SEP_ND: any;
    创建者: string;
    创建时间: string;
    修改者: null | string;
    修改时间: null | string;
  }

  // 联系人分组接口（后端返回格式）
  export interface ContactGroupResponse {
    单据号: number;
    userId: string;
    name: string;
    sortOrder: string;
    分组颜色: string;
    SEP_LD: any;
    SEP_MD: any;
    SEP_ND: any;
    创建者: string;
    创建时间: string;
    修改者: null | string;
    修改时间: null | string;
  }

  // 聊天会话接口（后端返回格式）
  export interface ChatSessionResponse {
    单据号: number;
    contactId: string;
    lastMessage: string;
    unreadCount: string;
    isPinned: string;
    lastActivityTime: string;
    SEP_LD: any;
    SEP_MD: any;
    SEP_ND: any;
    创建者: string;
    创建时间: string;
    修改者: null | string;
    修改时间: null | string;
  }

  // 聊天消息接口（后端返回格式）
  export interface ChatMessageResponse {
    单据号: number;
    senderId: string;
    receiverId: string;
    messageType: string;
    content: string;
    fileUrl: null | string;
    fileName: null | string;
    fileSize: null | string;
    图片缩略图: null | string;
    isRecalled: null | string;
    recallTime: null | string;
    readStatus: string;
    timestamp: string;
    status: string;
    SEP_LD: any;
    SEP_MD: any;
    SEP_ND: any;
    创建者: string;
    创建时间: string;
    修改者: null | string;
    修改时间: null | string;
  }

  // 联系人接口（前端使用格式）
  export interface Contact {
    id: number;
    userId: number;
    contactUserId: number;
    name: string;
    phone: string;
    email: string;
    idCard: null | string;
    avatar: null | string;
    description: null | string;
    isSystemUser: boolean | null;
    groupId: number;
    isOnline: boolean;
    lastOnlineTime: null | string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
  }

  // 联系人分组接口（前端使用格式）
  export interface ContactGroup {
    id: number;
    userId: number;
    name: string;
    sortOrder: number;
    color: string;
    createdAt: string;
  }

  // 聊天会话接口（前端使用格式）
  export interface ChatSession {
    id: number;
    contactId: number;
    lastMessage: string;
    unreadCount: number;
    isPinned: boolean;
    lastActivityTime: string;
    createdAt: string;
  }

  // 聊天消息接口（前端使用格式）
  export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    messageType: 'file' | 'image' | 'system' | 'text';
    content: string;
    fileUrl: null | string;
    fileName: null | string;
    fileSize: null | number;
    thumbnailUrl: null | string;
    isRecalled: boolean;
    recallTime: null | string;
    readStatus: boolean;
    timestamp: string;
    status: 'failed' | 'sending' | 'sent';
    createdAt: string;
  }

  // 新API - 会话接口
  export interface Conversation {
    id: number;
    userId1: number;
    userId2: number;
    lastMessageId: number;
    lastMessageContent: string;
    lastMessageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    lastMessageTime: string;
    user1UnreadCount: number;
    user2UnreadCount: number;
    user1Deleted: boolean;
    user2Deleted: boolean;
    user1Pinned: boolean;
    user2Pinned: boolean;
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
    createTime: string;
    userId1Name?: string;
    userId2Name?: string;
  }

  // 新API - 消息接口
  export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    receiverName: string;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content: string;
    fileId: number | null;
    fileName: string | null;
    fileSize: number | null;
    fileUrl: string | null;
    messageStatus: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    readTime: string | null;
    isDeleted: boolean;
    isRecalled: boolean;
    createTime: string;
    replyToMessageId?: number;
    replyToContent?: string;
    replyToSenderId?: number;
    replyToSenderName?: string;
    isForwarded?: boolean;
    forwardedFromMessageId?: number;
    forwardedFromConversationId?: number;
    forwardedFromSenderId?: number;
    forwardedFromSenderName?: string;
  }

  // 撤回配置接口
  export interface RecallConfig {
    id: number;
    configType: 'GLOBAL' | 'USER' | 'ROLE';
    targetId: number | null;
    recallTimeLimit: number;
    allowRecall: boolean;
    maxRecallTimes: number;
    status: 'ACTIVE' | 'DISABLED';
    createTime: string;
    updateTime: string;
    remark: string;
  }

  // 未读消息数接口
  export interface UnreadCount {
    totalUnread: number;
    conversationUnread: number;
  }

  // 用户接口（基于用户模块CRUD API文档）
  export interface User {
    id: number;
    username: string;
    realName: string;
    mobile: string;
    email: string;
    phone: string;
    isValid: string;
    status: 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'DELETED';
    loginType: string;
    lastLoginTime: string;
    lastLoginIp: string;
    loginCount: number;
    createTime: string;
    updateTime: string;
  }

  // 用户列表响应接口
  export interface UserListResponse {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    users: User[];
  }
}

// 安全的数字转换函数
function safeParseInt(
  value: null | string | undefined,
  defaultValue: number = 0,
): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// 安全的布尔转换函数
function safeParseBoolean(
  value: null | string | undefined,
  defaultValue: boolean = false,
): boolean {
  if (!value) return defaultValue;
  return value === '1' || value.toLowerCase() === 'true';
}

// 转换联系人数据格式
function transformContact(rawContact: ChatApi.ContactResponse): ChatApi.Contact {
  return {
    id: safeParseInt(rawContact['单据号']),
    userId: safeParseInt(rawContact.userId),
    contactUserId: safeParseInt(rawContact.contactUserId),
    name: rawContact.name || '',
    phone: rawContact.phone || '',
    email: rawContact.email || '',
    idCard: rawContact.idCard,
    avatar: rawContact.avatar,
    description: rawContact.description || '',
    isSystemUser: safeParseBoolean(rawContact.isSystemUser),
    groupId: safeParseInt(rawContact['分组ID']),
    isOnline: safeParseBoolean(rawContact['在线状态']),
    lastOnlineTime: rawContact['最后在线时间'],
    isPinned: safeParseBoolean(rawContact['是否置顶']),
    createdAt: rawContact['创建时间'] || '',
    updatedAt: rawContact['修改时间'] || '',
  };
}

// 转换聊天会话数据格式
function transformChatSession(rawSession: ChatApi.ChatSessionResponse): ChatApi.ChatSession {
  return {
    id: safeParseInt(rawSession['单据号']),
    contactId: safeParseInt(rawSession.contactId),
    lastMessage: rawSession.lastMessage || '',
    unreadCount: safeParseInt(rawSession.unreadCount),
    isPinned: safeParseBoolean(rawSession.isPinned),
    lastActivityTime: rawSession.lastActivityTime || '',
    createdAt: rawSession['创建时间'] || '',
  };
}
