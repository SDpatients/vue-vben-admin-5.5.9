import { requestClient } from '#/api/request';

export namespace CaseApi {
  /** 案件信息 */
  export interface CaseInfo {
    caseId: number;
    caseNo: string;
    caseName: string;
    caseType: string;
    status: string;
    courtId: number;
    courtName: string;
    plaintiff: string;
    defendant: string;
    startDate: string;
    endDate?: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    data: {
      count: number;
      pages: number;
      records: CaseInfo[];
    };
    code: number;
    message: string;
  }

  /** 案件响应 */
  export interface CaseResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取案件列表
 */
export async function getCaseListApi() {
  return requestClient.get<CaseApi.CaseListResponse>('/cases');
}

/**
 * 获取案件详情
 */
export async function getCaseDetailApi() {
  return requestClient.get<CaseApi.CaseInfo>('/cases');
}

/**
 * 新增案件
 */
export async function addCaseApi() {
  return requestClient.post<CaseApi.CaseResponse>('/cases');
}

/**
 * 更新案件
 */
export async function updateCaseApi() {
  return requestClient.put<CaseApi.CaseResponse>('/cases');
}

/**
 * 删除案件
 */
export async function deleteCaseApi() {
  return requestClient.delete<CaseApi.CaseResponse>('/cases');
}
