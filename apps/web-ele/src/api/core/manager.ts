import { requestClient8085 } from '#/api/request';

export namespace ManagerApi {
  /** 管理人查询参数 */
  export interface ManagerQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
  }

  /** 管理人信息 */
  export interface ManagerInfo {
    id: number; // 管理人ID
    caseId: number; // 案件ID
    administratorName: string; // 管理人名称（律师事务所）
    contactPhone: string; // 联系电话
    contactEmail: string; // 联系邮箱
    officeAddress: string; // 办公地址
    responsiblePersonId: number; // 负责人ID
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
  }

  /** 管理人列表响应 */
  export interface ManagerListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: ManagerInfo[];
    };
  }

  /** 管理人操作响应 */
  export interface ManagerOperationResponse {
    code: number;
    message: string;
    data?: {
      administratorId?: number;
    };
  }
}

/**
 * 获取管理人列表（分页）
 */
export async function getManagerListApi(params: ManagerApi.ManagerQueryParams) {
  return requestClient8085.get<ManagerApi.ManagerListResponse>('/administrator/list', {
    params,
  });
}

/** 添加管理人请求 */
export interface AddManagerRequest {
  caseId: number;
  administratorName: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  responsiblePersonId: number;
}

/**
 * 添加管理人信息
 */
export async function addManagerApi(data: AddManagerRequest) {
  return requestClient8085.post<ManagerApi.ManagerOperationResponse>('/administrator', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 更新管理人请求 */
export interface UpdateManagerRequest {
  contactPhone?: string;
  contactEmail?: string;
  officeAddress?: string;
}

/**
 * 更新管理人信息
 */
export async function updateManagerApi(administratorId: number | string, data: UpdateManagerRequest) {
  return requestClient8085.put<ManagerApi.ManagerOperationResponse>(`/administrator/${administratorId}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 删除管理人信息
 */
export async function deleteManagerApi(administratorId: number | string) {
  return requestClient8085.delete<ManagerApi.ManagerOperationResponse>(`/administrator/${administratorId}`);
}
