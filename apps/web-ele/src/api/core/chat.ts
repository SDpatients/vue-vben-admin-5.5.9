import { requestClient } from '#/api/request';

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
}

/**
 * 获取联系人列表
 */
export async function getContactsApi() {
  const response = await requestClient.get<
    ChatApi.BaseResponse<ChatApi.ContactResponse>
  >('http://192.168.0.108:8081/api/web/contact', {
    params: {
      token: '7a7bad27c7be5cced8fd12b796ab2a49',
    },
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
    return response.data.records.map((record) => ({
      id: record['单据号'],
      userId: Number.parseInt(record.userId),
      contactUserId: Number.parseInt(record.contactUserId),
      name: record.name,
      phone: record.phone,
      email: record.email,
      idCard: record.idCard,
      avatar: record.avatar,
      description: record.description,
      isSystemUser: record.isSystemUser ? record.isSystemUser === '1' : null,
      groupId: Number.parseInt(record['分组ID']),
      isOnline: record['在线状态'] === '1',
      lastOnlineTime: record['最后在线时间'],
      isPinned: record['是否置顶'] === '1',
      createdAt: record['创建时间'],
      updatedAt: record['修改时间'] || record['创建时间'],
    })) as ChatApi.Contact[];
  }

  throw new Error(response.error || '获取联系人列表失败');
}

/**
 * 获取联系人分组列表
 */
export async function getContactGroupsApi() {
  const response = await requestClient.get<
    ChatApi.BaseResponse<ChatApi.ContactGroupResponse>
  >('http://192.168.0.108:8081/api/web/contact-groups', {
    params: {
      token: 'e94e143c594a7c829223c342c3b37bcb',
    },
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
    return response.data.records.map((record) => ({
      id: record['单据号'],
      userId: Number.parseInt(record.userId),
      name: record.name,
      sortOrder: Number.parseInt(record.sortOrder),
      color: record['分组颜色'],
      createdAt: record['创建时间'],
    })) as ChatApi.ContactGroup[];
  }

  throw new Error(response.error || '获取联系人分组列表失败');
}

/**
 * 获取特定聊天人的聊天信息
 */
export async function getChatSessionsApi(contactId?: number) {
  const params: any = {
    token: '426830c0e79077b368ff20bbc758a484',
  };

  if (contactId) {
    params.contactId = contactId;
  }

  const response = await requestClient.get<
    ChatApi.BaseResponse<ChatApi.ChatSessionResponse>
  >('http://192.168.0.108:8081/api/web/chatsession', {
    params,
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
    return response.data.records.map((record) => ({
      id: record['单据号'],
      contactId: Number.parseInt(record.contactId),
      lastMessage: record.lastMessage,
      unreadCount: Number.parseInt(record.unreadCount),
      isPinned: record.isPinned.trim() === '1',
      lastActivityTime: record.lastActivityTime,
      createdAt: record['创建时间'],
    })) as ChatApi.ChatSession[];
  }

  throw new Error(response.error || '获取聊天信息失败');
}

/**
 * 获取聊天消息列表
 */
export async function getChatMessagesApi(senderId?: number) {
  const params: any = {
    token: '7aa41b18fd545a069fe1b53ae01df1c4',
  };

  if (senderId) {
    params.SENDERID = senderId;
  }

  const response = await requestClient.get<
    ChatApi.BaseResponse<ChatApi.ChatMessageResponse>
  >('http://192.168.0.108:8081/api/web/message', {
    params,
  });

  // 转换为前端使用的格式
  if (response.status === '1') {
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
 * 更新联系人在线状态
 */
export async function updateContactStatusApi(contactUserId: number, status: string) {
  const response = await requestClient.get<
    ChatApi.BaseResponse<{}>
  >('http://192.168.0.108:8081/api/web/updatestatus', {
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
