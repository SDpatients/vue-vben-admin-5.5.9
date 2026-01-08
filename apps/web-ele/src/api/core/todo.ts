import { requestClient } from '#/api/request';

export namespace TodoApi {
  /** 待办事项信息 */
  export interface TodoInfo {
    todoId: number;
    todoTitle: string;
    todoContent: string;
    todoStatus: string;
    priority: string;
    deadline?: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
  }

  /** 待办事项列表响应 */
  export interface TodoListResponse {
    data: {
      count: number;
      pages: number;
      records: TodoInfo[];
    };
    code: number;
    message: string;
  }

  /** 待办事项响应 */
  export interface TodoResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取待办事项列表
 */
export async function getTodoListApi() {
  return requestClient.get<TodoApi.TodoListResponse>('/todos');
}

/**
 * 获取待办事项详情
 */
export async function getTodoDetailApi() {
  return requestClient.get<TodoApi.TodoInfo>('/todos');
}

/**
 * 新增待办事项
 */
export async function addTodoApi() {
  return requestClient.post<TodoApi.TodoResponse>('/todos');
}

/**
 * 更新待办事项
 */
export async function updateTodoApi() {
  return requestClient.put<TodoApi.TodoResponse>('/todos');
}

/**
 * 删除待办事项
 */
export async function deleteTodoApi() {
  return requestClient.delete<TodoApi.TodoResponse>('/todos');
}
