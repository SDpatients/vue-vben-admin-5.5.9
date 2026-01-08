import { requestClient } from '#/api/request';

export namespace CaseProcessApi {
  /** 工作计划信息 */
  export interface WorkPlanInfo {
    planId: number;
    caseId: number;
    caseNo: string;
    caseName: string;
    planName: string;
    planContent: string;
    planDate: string;
    actualDate?: string;
    status: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
  }

  /** 工作计划列表响应 */
  export interface WorkPlanListResponse {
    data: {
      count: number;
      pages: number;
      records: WorkPlanInfo[];
    };
    code: number;
    message: string;
  }
}

/**
 * 获取所有工作计划
 */
export async function getAllWorkPlanApi() {
  return requestClient.get<CaseProcessApi.WorkPlanListResponse>('/case-process/work-plans');
}
