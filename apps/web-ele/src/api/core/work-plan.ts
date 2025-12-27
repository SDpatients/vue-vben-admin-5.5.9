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
    ZT: number;
    AJMC: null | string;
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

  /** 更新工作计划请求体 */
  export interface UpdateWorkPlanRequest {
    /** 工作计划ID */
    WP_SEP_ID: number;
    /** 操作人 */
    SEP_EUSER: string;
    /** 操作日期 */
    SEP_EDATE: string;
    /** 计划类型 */
    plan_type: string;
    /** 计划内容 */
    plan_content: string;
    /** 开始日期 */
    start_date: string | null;
    /** 结束日期 */
    end_date: string | null;
    /** 负责人 */
    responsible_person: string;
    /** 状态 */
    plan_status: string;
  }

  /** 更新工作计划响应 */
  export interface UpdateWorkPlanResponse {
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
  return requestClient.get<WorkPlanApi.WorkPlanListResponse>('/api/web/getWorkPlanBCVIEW', {
    params: {
      ...params,
      token,
    },
  });
}

/**
 * 更新工作计划
 */
export async function updateWorkPlanApi(
  data: WorkPlanApi.UpdateWorkPlanRequest,
) {
  const token = 'bfcb667e437fa21701351b7d607f229a';
  return requestClient.post<WorkPlanApi.UpdateWorkPlanResponse>(
    '/api/web/updateWorkPlan',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
}
