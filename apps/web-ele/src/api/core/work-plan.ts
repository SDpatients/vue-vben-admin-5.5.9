import { requestClient } from '#/api/request';

export namespace WorkPlanApi {
  /** 工作计划查询参数 */
  export interface WorkPlanQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }

  /** 工作计划信息 */
  export interface WorkPlanInfo {
    row: number;
    SEP_ID: number;
    JHLX: null | string;
    JHNR: null | string;
    KSRQ: null | string;
    JSRQ: null | string;
    FZR: null | string;
    ZHZT: null | string;
    AH: string;
    DQZT: null | string;
  }

  /** 工作计划列表响应 */
  export interface WorkPlanListResponse {
    data: {
      count: number;
      pages: number;
      records: WorkPlanInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取工作计划列表
 */
export async function getWorkPlanListApi(
  params: WorkPlanApi.WorkPlanQueryParams,
) {
  const token = '3a4ba2bad1d89f5483940004de8bc922';
  return requestClient.get<WorkPlanApi.WorkPlanListResponse>(
    '/api/web/getAllWorkPlan',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}
