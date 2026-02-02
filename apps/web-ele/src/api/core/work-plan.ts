import { requestClient8085 } from '#/api/request';

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
    start_date: null | string;
    /** 结束日期 */
    end_date: null | string;
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

  /** 创建工作计划请求体 */
  export interface CreateWorkPlanRequest {
    /** 案件ID */
    caseId: number;
    /** 计划类型 */
    planType: string;
    /** 计划内容 */
    planContent: string;
    /** 开始日期 */
    startDate: string;
    /** 结束日期 */
    endDate: string;
    /** 负责人ID */
    responsibleUserId: number;
  }

  /** 创建工作计划响应 */
  export interface CreateWorkPlanResponse {
    code: number;
    message: string;
    data: {
      planId: number;
    };
  }

  /** 工作计划详情响应 */
  export interface WorkPlanDetailResponse {
    code: number;
    message: string;
    data: {
      id: number;
      caseId: number;
      planType: string;
      planContent: string;
      startDate: string;
      endDate: string;
      responsibleUserId: number;
      executionStatus: string;
      status: string;
      createTime: string;
      updateTime: string;
    };
  }

  /** 删除工作计划响应 */
  export interface DeleteWorkPlanResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 获取工作计划列表
 */
export async function getWorkPlanListApi(
  params: WorkPlanApi.WorkPlanQueryParams,
) {
  const token = '3a4ba2bad1d89f5483940004de8bc922';
  return requestClient8085.get<WorkPlanApi.WorkPlanListResponse>(
    '/api/web/getWorkPlanBCVIEW',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}

/**
 * 更新工作计划
 */
export async function updateWorkPlanApi(
  data: WorkPlanApi.UpdateWorkPlanRequest,
) {
  const token = 'bfcb667e437fa21701351b7d607f229a';
  return requestClient8085.post<WorkPlanApi.UpdateWorkPlanResponse>(
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

/**
 * 创建工作计划
 */
export async function createWorkPlanApi(
  data: WorkPlanApi.CreateWorkPlanRequest,
) {
  return requestClient8085.post<WorkPlanApi.CreateWorkPlanResponse>(
    '/work-plan',
    data,
  );
}

/**
 * 获取工作计划详情
 */
export async function getWorkPlanDetailApi(
  planId: number,
) {
  return requestClient8085.get<WorkPlanApi.WorkPlanDetailResponse>(
    `/work-plan/${planId}`,
  );
}

/**
 * 删除工作计划
 */
export async function deleteWorkPlanApi(
  planId: number,
) {
  return requestClient8085.delete<WorkPlanApi.DeleteWorkPlanResponse>(
    `/work-plan/${planId}`,
  );
}

/**
 * 获取工作计划列表（分页）
 */
export async function getWorkPlanListByTimeApi(
  caseId?: number,
  planType?: string,
  executionStatus?: string,
  status?: string,
  pageNum: number = 1,
  pageSize: number = 10,
) {
  return requestClient8085.get<{
    code: number;
    message: string;
    data: {
      total: number;
      list: Array<{
        id: number;
        caseId: number;
        planType: string;
        planContent: string;
        startDate: string;
        endDate: string;
        responsibleUserId: number;
        executionStatus: string;
        status: string;
        createTime: string;
        updateTime: string;
      }>;
    };
  }>('/work-plan/list', {
    params: {
      caseId,
      planType,
      executionStatus,
      status,
      pageNum,
      pageSize,
    },
  });
}

/**
 * 根据案件ID获取工作计划列表
 */
export async function getWorkPlanListByCaseIdApi(
  caseId: number,
  pageNum: number = 1,
  pageSize: number = 10,
) {
  return requestClient8085.get<{
    code: number;
    message: string;
    data: {
      total: number;
      list: Array<{
        id: number;
        caseId: number;
        planType: string;
        planContent: string;
        startDate: string;
        endDate: string;
        responsibleUserId: number;
        executionStatus: string;
        status: string;
        createTime: string;
        updateTime: string;
      }>;
    };
  }>('/work-plan/list', {
    params: {
      caseId,
      pageNum,
      pageSize,
    },
  });
}
