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
  userAccount?: string;
  userName?: string;
  title: string;
  description?: string;
  type?: string;
  priority: string;
  status: string;
  deadline?: string;
  completedTime?: string;
  relatedId?: number;
  relatedType?: string;
  assigneeId?: number;
  assigneeName?: string;
  createUserId?: number;
  createUserName?: string;
  createTime: string;
  updateTime: string;
  remark?: string;
}

export interface TodoDTO {
  userId?: number;
  userAccount?: string;
  userName?: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  deadline?: string;
  remark?: string;
  assigneeId?: number;
  assigneeName?: string;
  createUserId?: number;
  createUserName?: string;
  relatedId?: number;
  relatedType?: string;
  caseNumber?: string;
  caseId?: number;
}

export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  deadline?: string;
  remark?: string;
  relatedId?: number;
  relatedType?: string;
  caseNumber?: string;
  caseId?: number;
}

export interface TodoPageResult {
  content: Todo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MyTodoStatisticsResponse {
  inProgressTodos: number;
  completedTodos: number;
  overdueTodos: number;
}

export interface CaseSimpleInfo {
  id: number;
  caseNumber: string;
  caseName: string;
}

export interface CasePageResult {
  total: number;
  list: CaseSimpleInfo[];
}

/**
 * 统一的响应解析函数
 * 处理后端可能返回的多种格式：
 * 1. { code: 200, message: "success", data: { content: [...], totalElements: ... } }
 * 2. { code: 200, message: "success", data: [...] }
 * 3. { content: [...], totalElements: ... } (直接返回分页对象)
 * 4. [...] (直接返回数组)
 */
function parseApiResponse<T>(res: any): { data: T[]; total?: number; totalPages?: number } {
  // 先解包外层的 ApiResponse
  let payload = res;
  if (res && typeof res === 'object' && 'data' in res && !Array.isArray(res.data)) {
    payload = res.data;
  }

  // 处理直接返回数组的情况
  if (Array.isArray(payload)) {
    return { data: payload as T[], total: payload.length };
  }

  // 处理 { content, totalElements, totalPages } 分页格式 (Spring Data Page)
  if (payload && payload.content && Array.isArray(payload.content)) {
    return {
      data: payload.content as T[],
      total: payload.totalElements ?? payload.content.length,
      totalPages: payload.totalPages ?? 1,
    };
  }

  // 处理 { total, list: [...] } 分页格式
  if (payload && payload.list && Array.isArray(payload.list)) {
    return {
      data: payload.list as T[],
      total: payload.total ?? payload.list.length,
    };
  }

  // 处理 { data: [...] } 格式
  if (payload && payload.data && Array.isArray(payload.data)) {
    return { data: payload.data as T[], total: payload.data.length };
  }

  // 默认返回空数组
  return { data: [] };
}

export const todoApi = {
  // ========== 创建 ==========

  // 创建待办事项（基础版）
  createTodo: (data: TodoDTO) => {
    const userId = getUserId();
    const requestData = { ...data, userId };
    return requestClient.post<Todo>('/api/v1/todo', requestData);
  },

  // 创建待办事项（支持案件关联）
  createTodoWithCase: (data: TodoDTO) => {
    const userId = getUserId();
    const requestData = { ...data, userId };
    return requestClient.post<Todo>('/api/v1/todo/with-case', requestData);
  },

  // ========== 查询（统一使用 searchTodos，避免多个独立接口） ==========

  /**
   * 统一的待办搜索/列表接口
   * 所有列表查询都应通过此接口，使用参数控制筛选条件
   */
  searchTodos: (params: {
    type?: string;
    status?: string;
    priority?: string;
    pageNum?: number;
    pageSize?: number;
  }) => {
    return requestClient.get<TodoPageResult>('/api/v1/todo/search', {
      params,
    });
  },

  /**
   * 获取当前用户待办列表（带时间范围）
   * 注意：此接口与 searchTodos 功能有重叠，优先使用 searchTodos
   */
  getTodoList: (params: {
    pageNum?: number;
    pageSize?: number;
    startTime?: string;
    endTime?: string;
  }) => {
    return requestClient.get<TodoPageResult>('/api/v1/todo/list', {
      params,
    });
  },

  // 获取待办事项详情
  getTodoDetail: (todoId: number) => {
    return requestClient.get<Todo>(`/api/v1/todo/${todoId}`);
  },

  // ========== 统计（统一使用 getMyStats） ==========

  // 获取当前用户的待办统计数据（推荐：一次请求获取所有统计）
  getMyStats: () => {
    return requestClient.get<MyTodoStatisticsResponse>('/api/v1/todo/my-stats');
  },

  // 以下单个统计接口保留但标记为不推荐，建议统一使用 getMyStats
  /** @deprecated 请使用 getMyStats */
  getPendingCount: () => {
    return requestClient.get<number>('/api/v1/todo/count/pending');
  },

  /** @deprecated 请使用 getMyStats */
  getCompletedCount: () => {
    return requestClient.get<number>('/api/v1/todo/count/completed');
  },

  /** @deprecated 请使用 getMyStats */
  getOverdueCount: () => {
    return requestClient.get<number>('/api/v1/todo/count/overdue');
  },

  // ========== 更新 ==========

  // 完成待办事项
  completeTodo: (todoId: number) => {
    return requestClient.put<Todo>(`/api/v1/todo/${todoId}/complete`);
  },

  // 更新待办事项（基础版）
  updateTodo: (todoId: number, data: Partial<TodoDTO>) => {
    return requestClient.put<Todo>(`/api/v1/todo/${todoId}`, data);
  },

  // 更新待办事项（支持案件关联）
  updateTodoWithCase: (todoId: number, data: TodoUpdateRequest) => {
    return requestClient.put<Todo>(`/api/v1/todo/${todoId}/with-case`, data);
  },

  // 更新待办状态
  updateTodoStatus: (todoId: number, status: string) => {
    return requestClient.put<Todo>(`/api/v1/todo/${todoId}/status`, null, {
      params: { status },
    });
  },

  // 分配待办事项
  assignTodo: (todoId: number, assigneeId: number, assigneeName: string) => {
    return requestClient.put<Todo>(`/api/v1/todo/${todoId}/assign`, null, {
      params: { assigneeId, assigneeName },
    });
  },

  // ========== 删除 ==========

  // 删除待办事项
  deleteTodo: (todoId: number) => {
    return requestClient.delete(`/api/v1/todo/${todoId}`);
  },

  // 批量删除待办事项
  batchDeleteTodos: (todoIds: number[]) => {
    return requestClient.delete('/api/v1/todo/batch', {
      data: todoIds,
    });
  },

  // ========== 案件关联 ==========

  // 根据案号模糊查询案件简单信息
  searchCases: (caseNumber: string, page: number = 1, size: number = 10) => {
    return requestClient.get<CasePageResult>('/api/v1/todo/case/simple-search', {
      params: { caseNumber, page, size },
    });
  },

  // ========== 兼容旧方法（标记为废弃） ==========

  /** @deprecated 请使用 searchTodos */
  getPendingTodos: () => {
    return requestClient.get<Todo[]>('/api/v1/todo/search', {
      params: { status: 'PENDING' },
    });
  },

  /** @deprecated 请使用 searchTodos */
  getCompletedTodos: () => {
    return requestClient.get<Todo[]>('/api/v1/todo/search', {
      params: { status: 'COMPLETED' },
    });
  },

  // 获取过期待办事项（后端实时计算：deadline < NOW() AND status = 'PENDING'）
  // 注意：数据库 status 字段没有 OVERDUE 值，不能通过 search?status=OVERDUE 查询
  getOverdueTodos: (pageNum: number = 0, pageSize: number = 10) => {
    return requestClient.get<TodoPageResult>('/api/v1/todo/overdue', {
      params: { pageNum, pageSize },
    });
  },

  /** @deprecated 请使用 searchTodos 或 getTodoList */
  getUserTodoList: (
    targetUserId: number,
    priority?: string,
    pageNum: number = 0,
    pageSize: number = 100,
    startTime?: string,
    endTime?: string,
  ) => {
    let start: string | undefined;
    let end: string | undefined;
    if (startTime && endTime) {
      start = startTime;
      end = endTime;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      start = firstDay.toISOString();
      end = new Date(lastDay.setHours(23, 59, 59, 999)).toISOString();
    }
    return requestClient.get<TodoPageResult>('/api/v1/todo/list', {
      params: { userId: targetUserId, priority, pageNum, pageSize, startTime: start, endTime: end },
    });
  },

  createTodoForUser: (targetUserId: number, data: TodoDTO) => {
    const requestData = { ...data, userId: targetUserId };
    return requestClient.post<Todo>('/api/v1/todo', requestData);
  },

  cancelTodo: (id: number) => {
    return requestClient.put<Todo>(`/api/v1/todo/${id}/cancel`);
  },
};

// 导出解析函数，供页面使用
export { parseApiResponse };
