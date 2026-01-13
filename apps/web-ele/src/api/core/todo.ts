import { requestClient } from '#/api/request';

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
  getTodoList: (status?: string, priority?: string, pageNum: number = 0, pageSize: number = 10) => {
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return requestClient.get('/api/v1/todo/list', {
      params: { userId: Number(userId), status, priority, pageNum, pageSize },
    });
  },

  // 获取待处理待办事项
  getPendingTodos: () => {
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return requestClient.get('/api/v1/todo/pending', {
      params: { userId: Number(userId) },
    });
  },

  // 获取已完成待办事项
  getCompletedTodos: () => {
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return requestClient.get('/api/v1/todo/COMPLETED', {
      params: { userId: Number(userId) },
    });
  },

  // 获取过期待办事项
  getOverdueTodos: () => {
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return requestClient.get('/api/v1/todo/overdue', {
      params: { userId: Number(userId) },
    });
  },

  getUserTodoList: (targetUserId: number, status?: string, priority?: string, pageNum: number = 0, pageSize: number = 10) => {
    return requestClient.get(`/api/v1/todo/list`, {
      params: { userId: targetUserId, status, priority, pageNum, pageSize },
    });
  },

  createTodo: (data: TodoDTO) => {
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    // 添加userId到请求数据
    const requestData = {
      ...data,
      userId: Number(userId),
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
