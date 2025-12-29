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
}

export const todoApi = {
  getTodoList: (status?: string, priority?: string, page: number = 1, pageSize: number = 20) => {
    return requestClient.get('/api/todo/list', {
      params: { status, priority, page, pageSize },
    });
  },

  createTodo: (data: TodoDTO) => {
    return requestClient.post('/api/todo', data);
  },

  updateTodo: (id: number, data: Partial<TodoDTO>) => {
    return requestClient.put(`/api/todo/${id}`, data);
  },

  completeTodo: (id: number) => {
    return requestClient.put(`/api/todo/${id}/complete`);
  },

  cancelTodo: (id: number) => {
    return requestClient.put(`/api/todo/${id}/cancel`);
  },

  deleteTodo: (id: number) => {
    return requestClient.delete(`/api/todo/${id}`);
  },
};
