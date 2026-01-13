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

// 数据转换工具函数
const transformContact = (
  record: ChatApi.ContactResponse,
): ChatApi.Contact => ({
  id: record['单据号'],
  userId: safeParseInt(record.userId),
  contactUserId: safeParseInt(record.contactUserId),
  name: record.name,
  phone: record.phone,
  email: record.email,
  idCard: record.idCard,
  avatar: record.avatar,
  description: record.description,
  isSystemUser: record.isSystemUser
    ? safeParseBoolean(record.isSystemUser)
    : null,
  groupId: safeParseInt(record['分组ID']),
  isOnline: safeParseBoolean(record['在线状态']),
  lastOnlineTime: record['最后在线时间'],
  isPinned: safeParseBoolean(record['是否置顶']),
  createdAt: record['创建时间'],
  updatedAt: record['修改时间'] || record['创建时间'],
});



const transformChatSession = (
  record: ChatApi.ChatSessionResponse,
): ChatApi.ChatSession => ({
  id: record['单据号'],
  contactId: safeParseInt(record.contactId),
  lastMessage: record.lastMessage,
  unreadCount: safeParseInt(record.unreadCount),
  isPinned: safeParseBoolean(record.isPinned),
  lastActivityTime: record.lastActivityTime,
  createdAt: record['创建时间'],
});

const transformChatMessage = (
  record: ChatApi.ChatMessageResponse,
): ChatApi.ChatMessage => {
  const validMessageTypes = ['file', 'image', 'system', 'text'] as const;
  const messageType = validMessageTypes.includes(record.messageType as any)
    ? (record.messageType as any)
    : 'text';

  return {
    id: record['单据号'],
    senderId: safeParseInt(record.senderId),
    receiverId: safeParseInt(record.receiverId),
    messageType,
    content: record.content,
    fileUrl: record.fileUrl,
    fileName: record.fileName,
    fileSize: record.fileSize ? safeParseInt(record.fileSize) : null,
    thumbnailUrl: record['图片缩略图'],
    isRecalled: safeParseBoolean(record.isRecalled),
    recallTime: record.recallTime,
    readStatus: safeParseBoolean(record.readStatus),
    timestamp: record.timestamp,
    status: safeParseBoolean(record.status) ? 'sent' : 'failed',
    createdAt: record['创建时间'],
  };
};

/**
 * 获取联系人列表
 */
export async function getContactsApi(params?: {
  groupId?: number;
  keyword?: string;
  page?: number;
  page_size?: number;
  userId?: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.BaseResponse<ChatApi.ContactResponse>
  >('/api/web/contact', {
    params: {
      token: localStorage.getItem('token') || '',
      ...params,
    },
  });

  if (response.status === '1') {
    if (!response.data?.records) {
      console.warn('API返回数据缺少records字段:', response.data);
      return [] as ChatApi.Contact[];
    }
    return response.data.records.map(transformContact);
  }

  throw new Error(response.error || '获取联系人列表失败');
}



/**
 * 获取聊天会话列表
 */
export async function getChatSessionsApi(userId?: number) {
  const response = await chatRequestClient.get<
    ChatApi.BaseResponse<ChatApi.ChatSessionResponse>
  >('/api/web/sessions', {
    params: {
      token: localStorage.getItem('token') || '',
      ...(userId && { userId }),
    },
  });

  if (response.status === '1') {
    if (!response.data?.records) {
      console.warn('API返回数据缺少records字段:', response.data);
      return [] as ChatApi.ChatSession[];
    }
    return response.data.records.map(transformChatSession);
  }

  throw new Error(response.error || '获取聊天会话列表失败');
}

/**
 * 获取聊天记录
 */
export async function getChatMessagesApi(params: {
  contactId: number;
  page?: number;
  page_size?: number;
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.BaseResponse<ChatApi.ChatMessageResponse>
  >(`/api/web/messages/${params.contactId}`, {
    params: {
      token: '7aa41b18fd545a069fe1b53ae01df1c4',
      ...params,
    },
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
    if (!response.data?.records) {
      console.warn('API返回数据缺少records字段:', response.data);
      return [] as ChatApi.ChatMessage[];
    }
    return response.data.records.map((record) => ({
      id: record['单据号'],
      senderId: Number.parseInt(record.senderId),
      receiverId: Number.parseInt(record.receiverId),
      messageType: record.messageType as 'file' | 'image' | 'system' | 'text',
      content: record.content,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileSize: record.fileSize ? Number.parseInt(record.fileSize) : null,
      thumbnailUrl: record['图片缩略图'],
      isRecalled: record.isRecalled ? record.isRecalled === '1' : false,
      recallTime: record.recallTime,
      readStatus: record.readStatus === '1',
      timestamp: record.timestamp,
      status: record.status === '1' ? 'sent' : 'failed',
      createdAt: record['创建时间'],
    })) as ChatApi.ChatMessage[];
  }

  throw new Error(response.error || '获取聊天消息列表失败');
}

/**
 * 发送消息（HTTP备用）
 */
export async function sendMessageApi(data: {
  content: string;
  fileName?: null | string;
  fileSize?: null | number;
  fileUrl?: null | string;
  messageType: number;
  receiverId: number;
  senderId: number;
  thumbnailUrl?: null | string;
}) {
  const response = await chatRequestClient.post<{
    data: number;
    error: string;
    status: string;
  }>('/api/web/messages', {
    params: {
      token: '7aa41b18fd545a069fe1b53ae01df1c4',
    },
    data,
  });

  if (response.status === '1') {
    return response.data;
  }

  throw new Error(response.error || '发送消息失败');
}

/**
 * 撤回消息
 */
export async function recallMessageApi(id: number) {
  const response = await chatRequestClient.put<{
    data: string;
    error: string;
    status: string;
  }>(`/api/web/messages/${id}/recall`, {
    params: {
      token: '7aa41b18fd545a069fe1b53ae01df1c4',
    },
  });

  if (response.status === '1') {
    return response.data;
  }

  throw new Error(response.error || '撤回消息失败');
}

/**
 * 标记消息为已读
 */
export async function markMessagesAsReadApi(data: {
  contactId: number;
  messageIds?: number[];
  receiverId: number;
}) {
  const response = await chatRequestClient.put<{
    data: string;
    error: string;
    status: string;
  }>('/api/web/messages/read', {
    params: {
      token: localStorage.getItem('token') || '',
    },
    data,
  });

  if (response.status === '1') {
    return response.data;
  }

  throw new Error(response.error || '标记消息为已读失败');
}

/**
 * 搜索聊天记录
 */
export async function searchChatMessagesApi(params: {
  end_time?: string;
  keyword: string;
  page?: number;
  page_size?: number;
  start_time?: string;
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.BaseResponse<ChatApi.ChatMessageResponse>
  >('/api/web/messages/search', {
    params: {
      token: '7aa41b18fd545a069fe1b53ae01df1c4',
      ...params,
    },
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
    if (!response.data?.records) {
      console.warn('API返回数据缺少records字段:', response.data);
      return [] as ChatApi.ChatMessage[];
    }
    return response.data.records.map((record) => ({
      id: record['单据号'],
      senderId: Number.parseInt(record.senderId),
      receiverId: Number.parseInt(record.receiverId),
      messageType: record.messageType as 'file' | 'image' | 'system' | 'text',
      content: record.content,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileSize: record.fileSize ? Number.parseInt(record.fileSize) : null,
      thumbnailUrl: record['图片缩略图'],
      isRecalled: record.isRecalled ? record.isRecalled === '1' : false,
      recallTime: record.recallTime,
      readStatus: record.readStatus === '1',
      timestamp: record.timestamp,
      status: record.status === '1' ? 'sent' : 'failed',
      createdAt: record['创建时间'],
    })) as ChatApi.ChatMessage[];
  }

  throw new Error(response.error || '搜索聊天记录失败');
}

/**
 * 更新联系人在线状态
 */
export async function updateContactStatusApi(
  contactUserId: number,
  status: string,
) {
  const response = await chatRequestClient.get<{
    data: any;
    error: string;
    status: string;
  }>('/api/web/updatestatus', {
    params: {
      token: '37433bd455313db96e6cc8f8302f7196',
      contactuserid: contactUserId,
      status,
    },
  });

  if (response.status === '1') {
    return response.data;
  }

  throw new Error(response.error || '更新联系人在线状态失败');
}

// ==================== 新增聊天API (基于1月12日和1月13日API文档) ====================

/**
 * 1. 获取或创建会话
 */
export async function getOrCreateConversationApi(params: {
  userId1: number;
  userId2: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.Conversation>
  >('/chat/conversation', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取或创建会话失败');
}

/**
 * 2. 获取用户会话列表
 */
export async function getUserConversationsApi(params: {
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.Conversation[]>
  >('/chat/conversations', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取用户会话列表失败');
}

/**
 * 3. 获取置顶会话
 */
export async function getPinnedConversationsApi(params: {
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.Conversation[]>
  >('/chat/conversations/pinned', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取置顶会话失败');
}

/**
 * 4. 获取未置顶会话
 */
export async function getUnpinnedConversationsApi(params: {
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.Conversation[]>
  >('/chat/conversations/unpinned', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取未置顶会话失败');
}

/**
 * 5. 获取会话消息
 */
export async function getConversationMessagesApi(params: {
  conversationId: number;
  pageNum?: number;
  pageSize?: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.PageResponse<ChatApi.Message>>
  >('/chat/messages', {
    params: {
      pageNum: 1,
      pageSize: 20,
      ...params,
    },
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取会话消息失败');
}

/**
 * 6. 发送消息
 */
export async function sendMessageApiV2(params: {
  senderId: number;
  data: {
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  };
}) {
  const response = await chatRequestClient.post<
    ChatApi.ApiResponse<ChatApi.Message>
  >(`/chat/messages?senderId=${params.senderId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '发送消息失败');
}

/**
 * 7. 标记消息已读
 */
export async function markMessageAsReadApi(params: {
  userId: number;
  data: {
    messageId: number;
  };
}) {
  const response = await chatRequestClient.put<
    ChatApi.ApiResponse<ChatApi.Message>
  >(`/chat/messages/read?userId=${params.userId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '标记消息已读失败');
}

/**
 * 8. 标记会话已读
 */
export async function markConversationAsReadApi(params: {
  userId: number;
  conversationId: number;
}) {
  const response = await chatRequestClient.put<ChatApi.ApiResponse<null>>(
    `/chat/conversations/read?userId=${params.userId}&conversationId=${params.conversationId}`,
  );

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '标记会话已读失败');
}

/**
 * 9. 撤回消息
 */
export async function recallMessageApiV2(params: {
  userId: number;
  data: {
    messageId: number;
  };
}) {
  const response = await chatRequestClient.put<
    ChatApi.ApiResponse<ChatApi.Message>
  >(`/chat/messages/recall?userId=${params.userId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '撤回消息失败');
}

/**
 * 10. 删除消息
 */
export async function deleteMessageApi(params: {
  userId: number;
  data: {
    messageId: number;
  };
}) {
  const response = await chatRequestClient.delete<ChatApi.ApiResponse<null>>(
    `/chat/messages?userId=${params.userId}`,
    { data: params.data },
  );

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '删除消息失败');
}

/**
 * 11. 删除会话
 */
export async function deleteConversationApi(params: {
  userId: number;
  conversationId: number;
}) {
  const response = await chatRequestClient.delete<ChatApi.ApiResponse<null>>(
    `/chat/conversations?userId=${params.userId}&conversationId=${params.conversationId}`,
  );

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '删除会话失败');
}

/**
 * 12. 置顶/取消置顶会话
 */
export async function pinConversationApi(params: {
  userId: number;
  data: {
    conversationId: number;
    pinned: boolean;
  };
}) {
  const response = await chatRequestClient.put<ChatApi.ApiResponse<null>>(
    `/chat/conversations/pin?userId=${params.userId}`,
    params.data,
  );

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '置顶/取消置顶会话失败');
}

/**
 * 13. 获取未读消息数
 */
export async function getUnreadCountApi(params: {
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.UnreadCount>
  >('/chat/unread/count', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取未读消息数失败');
}

/**
 * 14. 获取会话未读消息数
 */
export async function getConversationUnreadCountApi(params: {
  userId: number;
  conversationId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.UnreadCount>
  >('/chat/conversations/unread/count', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取会话未读消息数失败');
}

// ==================== 拓展功能API (基于1月13日API文档) ====================

/**
 * 15. 搜索消息
 */
export async function searchMessagesApi(params: {
  userId: number;
  data: {
    conversationId: number;
    keyword?: string;
    senderId?: number;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    startTime?: string;
    endTime?: string;
    includeDeleted?: boolean;
    includeRecalled?: boolean;
    pageNum?: number;
    pageSize?: number;
  };
}) {
  const response = await chatRequestClient.post<
    ChatApi.ApiResponse<ChatApi.PageResponse<ChatApi.Message>>
  >(`/chat/messages/search?userId=${params.userId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '搜索消息失败');
}

/**
 * 16. 回复消息
 */
export async function replyMessageApi(params: {
  senderId: number;
  data: {
    replyToMessageId: number;
    receiverId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
    content?: string;
    fileId?: number;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  };
}) {
  const response = await chatRequestClient.post<
    ChatApi.ApiResponse<ChatApi.Message>
  >(`/chat/messages/reply?senderId=${params.senderId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '回复消息失败');
}

/**
 * 17. 转发消息
 */
export async function forwardMessagesApi(params: {
  senderId: number;
  data: {
    targetConversationId: number;
    targetReceiverId: number;
    messageIds: number[];
    forwardComment?: string;
  };
}) {
  const response = await chatRequestClient.post<
    ChatApi.ApiResponse<ChatApi.Message[]>
  >(`/chat/messages/forward?senderId=${params.senderId}`, params.data);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '转发消息失败');
}

/**
 * 18. 更新撤回配置
 */
export async function updateRecallConfigApi(data: {
  configType: 'GLOBAL' | 'USER' | 'ROLE';
  targetId?: number;
  recallTimeLimit?: number;
  allowRecall?: boolean;
  maxRecallTimes?: number;
  remark?: string;
}) {
  const response = await chatRequestClient.put<ChatApi.ApiResponse<null>>(
    '/chat/recall/config',
    data,
  );

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '更新撤回配置失败');
}

/**
 * 19. 获取撤回配置
 */
export async function getRecallConfigApi(params: {
  userId: number;
}) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.RecallConfig>
  >('/chat/recall/config', {
    params,
  });

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取撤回配置失败');
}

// ==================== 用户模块API (基于用户模块CRUD API文档) ====================

/**
 * 20. 获取用户列表
 */
export async function getUserListApi(params?: {
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  keyword?: string;
  status?: 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'DELETED';
}) {
  // 构建最终的API参数
  const finalParams = {
    page: 1,
    size: 10000,
    sortField: 'createTime',
    sortOrder: 'DESC',
    ...params,
  };
  
  console.log('🔧 getUserListApi 内部处理');
  console.log('🔧 原始传入参数:', params);
  console.log('🔧 最终API参数:', finalParams);
  console.log('🔧 调用API URL:', `/users?${new URLSearchParams(finalParams as any).toString()}`);
  
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.UserListResponse>
  >('/users', {
    params: finalParams,
  });

  if (response.code === 200) {
    console.log('✅ API响应成功，状态码:', response.code);
    console.log('✅ API响应数据:', response.data);
    return response.data;
  }

  console.error('❌ API响应失败，状态码:', response.code);
  console.error('❌ API错误信息:', response.message);
  throw new Error(response.message || '获取用户列表失败');
}

/**
 * 21. 获取单个用户
 */
export async function getUserByIdApi(id: number) {
  const response = await chatRequestClient.get<
    ChatApi.ApiResponse<ChatApi.User>
  >(`/users/${id}`);

  if (response.code === 200) {
    return response.data;
  }

  throw new Error(response.message || '获取用户信息失败');
}
