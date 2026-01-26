import { useUserStore } from '@vben/stores';

import type { Pinia } from 'pinia';

import { requestClient } from '#/api/request';

// 创建一个简单的pinia实例用于获取用户信息
let userStoreInstance: null | ReturnType<typeof useUserStore> = null;

function getUserStore() {
  if (!userStoreInstance) {
    // 尝试从全局获取pinia实例
    const pinia = (window as any).__PINIA__ as Pinia;
    if (pinia) {
      userStoreInstance = useUserStore(pinia);
    }
  }
  return userStoreInstance;
}

// 从多个来源获取用户ID的辅助函数
function getUserId(): number {
  // 1. 首先尝试从localStorage获取chat_user_id
  const chatUserId = localStorage.getItem('chat_user_id');
  if (chatUserId) {
    return Number(chatUserId);
  }

  // 2. 尝试从userStore获取用户信息
  const userStore = getUserStore();
  if (userStore && userStore.userInfo?.userId) {
    return Number(userStore.userInfo.userId);
  }

  // 3. 尝试从chat_user_info中解析userId
  const chatUserInfo = localStorage.getItem('chat_user_info');
  if (chatUserInfo) {
    try {
      const userInfo = JSON.parse(chatUserInfo);
      if (userInfo.userId) {
        return Number(userInfo.userId);
      }
    } catch (error) {
      console.error('解析chat_user_info失败:', error);
    }
  }

  // 4. 尝试从userStore的userInfo中获取userId
  if (userStore && userStore.userInfo?.userId) {
    return Number(userStore.userInfo.userId);
  }

  // 所有尝试都失败，抛出错误
  throw new Error('无法获取用户ID');
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  deadline?: string;
  sourceType?: string;
  sourceId?: number;
  relatedType?: string;
  relatedId?: number;
  completedTime?: string;
  createTime: string;
  updateTime: string;
}

export interface TodoDTO {
  title: string;
  description?: string;
  priority?: string;
  deadline?: string;
  relatedType?: string;
  relatedId?: number;
  userId?: number;
  userAccount?: string;
  userName?: string;
  type?: string;
  status?: string;
  assigneeId?: number;
  assigneeName?: string;
  createUserId?: number;
  createUserName?: string;
  remark?: string;
}

export const todoApi = {
  getTodoList: (
    status?: string,
    priority?: string,
    pageNum: number = 0,
    pageSize: number = 10,
  ) => {
    const userId = getUserId();
    return requestClient.get('/api/v1/todo/list', {
      params: { userId, status, priority, pageNum, pageSize },
    });
  },

  // 获取待处理待办事项
  getPendingTodos: () => {
    const userId = getUserId();
    return requestClient.get('/api/v1/todo/pending', {
      params: { userId },
    });
  },

  // 获取已完成待办事项
  getCompletedTodos: () => {
    const userId = getUserId();
    return requestClient.get('/api/v1/todo/COMPLETED', {
      params: { userId },
    });
  },

  // 获取过期待办事项
  getOverdueTodos: () => {
    const userId = getUserId();
    return requestClient.get('/api/v1/todo/overdue', {
      params: { userId },
    });
  },

  getUserTodoList: (
    targetUserId: number,
    status?: string,
    priority?: string,
    pageNum: number = 0,
    pageSize: number = 10,
  ) => {
    return requestClient.get(`/api/v1/todo/list`, {
      params: { userId: targetUserId, status, priority, pageNum, pageSize },
    });
  },

  createTodo: (data: TodoDTO) => {
    const userId = getUserId();
    // 添加userId到请求数据
    const requestData = {
      ...data,
      userId,
    };
    return requestClient.post('/api/v1/todo', requestData);
  },

  createTodoForUser: (targetUserId: number, data: TodoDTO) => {
    // 添加userId到请求数据，使用targetUserId作为userId
    const requestData = {
      ...data,
      userId: targetUserId,
    };
    return requestClient.post('/api/v1/todo', requestData);
  },

  updateTodo: (id: number, data: Partial<TodoDTO>) => {
    return requestClient.put(`/api/v1/todo/${id}`, data);
  },

  completeTodo: (id: number) => {
    return requestClient.put(`/api/v1/todo/${id}/complete`);
  },

  cancelTodo: (id: number) => {
    return requestClient.put(`/api/v1/todo/${id}/cancel`);
  },

  deleteTodo: (id: number) => {
    return requestClient.delete(`/api/v1/todo/${id}`);
  },
};
