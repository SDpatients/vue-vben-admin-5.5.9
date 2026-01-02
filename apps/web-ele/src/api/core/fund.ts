import { requestClient8085 } from '#/api/request';

// 驼峰命名转下划线命名
function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = camelToSnake(obj[key]);
    }
  }
  return result;
}

// 下划线命名转驼峰命名
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return result;
}

export namespace FundApi {
  /** 案件信息 */
  export interface CaseInfo {
    sepId: string;
    ah: string;
    ajmc: string;
  }

  /** 资金账户查询参数 */
  export interface FundAccountQueryParams {
    page?: number;
    size?: number;
    token?: string;
    caseNo?: string;
    caseName?: string;
    accountName?: string;
  }

  /** 资金账户信息 */
  export interface FundAccountInfo {
    accountId: number;
    caseNo: string;
    caseName: string;
    accountName: string;
    accountType: string;
    initialBalance: number;
    currentBalance: number;
    bankName: string;
    bankAccount: string;
    status: string;
    createTime: string;
    createUser: string;
    updateTime: string;
    updateUser: string;
  }

  /** 资金账户列表响应 */
  export interface FundAccountListResponse {
    data: {
      count: number;
      pages: number;
      records: FundAccountInfo[];
    };
    status: string;
    error: string;
  }

  /** 新增资金账户请求体 */
  export interface AddFundAccountRequest {
    caseNo: string;
    caseName: string;
    accountName: string;
    accountType: string;
    initialBalance: number;
    bankName?: string;
    bankAccount?: string;
    status: string;
    createUser: string;
  }

  /** 新增资金账户响应 */
  export interface AddFundAccountResponse {
    status: string;
    error: string;
  }

  /** 更新资金账户请求体 */
  export interface UpdateFundAccountRequest {
    accountId: number;
    accountName?: string;
    accountType?: string;
    bankName?: string;
    bankAccount?: string;
    status?: string;
    updateUser: string;
  }

  /** 更新资金账户响应 */
  export interface UpdateFundAccountResponse {
    status: string;
    error: string;
  }

  /** 资金分类查询参数 */
  export interface FundCategoryQueryParams {
    page?: number;
    size?: number;
    token?: string;
    categoryType?: string;
  }

  /** 资金分类信息 */
  export interface FundCategoryInfo {
    categoryId: number;
    categoryName: string;
    categoryType: string;
    parentId?: number;
    sortOrder: number;
    status: string;
    createTime: string;
    createUser: string;
  }

  /** 资金分类列表响应 */
  export interface FundCategoryListResponse {
    data: {
      count: number;
      pages: number;
      records: FundCategoryInfo[];
    };
    status: string;
    error: string;
  }

  /** 资金流水查询参数 */
  export interface FundFlowQueryParams {
    page?: number;
    size?: number;
    token?: string;
    caseNo?: string;
    accountId?: number;
    flowType?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    amountMin?: number;
    amountMax?: number;
  }

  /** 资金流水信息 */
  export interface FundFlowInfo {
    flowId: number;
    caseNo: string;
    caseName?: string;
    accountId: number;
    flowType: string;
    categoryId: number;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    transactionDate: string;
    description?: string;
    relatedDocument?: string;
    operator: string;
    operationTime: string;
    remark?: string;
    // 关联信息
    accountName?: string;
    categoryName?: string;
  }

  /** 资金流水列表响应 */
  export interface FundFlowListResponse {
    data: {
      count: number;
      pages: number;
      records: FundFlowInfo[];
    };
    status: string;
    error: string;
  }

  /** 资金流入请求体 */
  export interface FundInflowRequest {
    caseNo: string;
    caseName: string;
    accountId: number;
    categoryId: number;
    amount: number;
    transactionDate: string;
    description?: string;
    relatedDocument?: string;
    operator: string;
  }

  /** 资金流出请求体 */
  export interface FundOutflowRequest {
    caseNo: string;
    caseName: string;
    accountId: number;
    categoryId: number;
    amount: number;
    transactionDate: string;
    description?: string;
    relatedDocument?: string;
    operator: string;
  }

  /** 资金流水响应 */
  export interface FundFlowResponse {
    status: string;
    error: string;
  }

  /** 资金统计请求参数 */
  export interface FundReportQueryParams {
    caseNo?: string;
    accountId?: number;
    startDate?: string;
    endDate?: string;
    reportType: string;
  }

  /** 资金统计响应 */
  export interface FundReportResponse {
    data: any;
    status: string;
    error: string;
  }

  /** 操作日志查询参数 */
  export interface FundLogQueryParams {
    page?: number;
    size?: number;
    token?: string;
    caseNo?: string;
    operationType?: string;
    operator?: string;
    startTime?: string;
    endTime?: string;
  }

  /** 操作日志信息 */
  export interface FundLogInfo {
    logId: number;
    caseNo?: string;
    operationType: string;
    operationContent: string;
    operator: string;
    operationTime: string;
    ipAddress?: string;
    browserInfo?: string;
  }

  /** 操作日志列表响应 */
  export interface FundLogListResponse {
    data: {
      count: number;
      pages: number;
      records: FundLogInfo[];
    };
    status: string;
    error: string;
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    data: CaseInfo[];
    status: string;
    error: string;
  }
}

/**
 * 获取资金账户列表
 */
export async function getFundAccountListApi(
  params: FundApi.FundAccountQueryParams,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/fund/account/list',
    {
      params: {
        ...camelToSnake(params),
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundAccountListResponse;
}

/**
 * 新增资金账户
 */
export async function addFundAccountApi(
  data: FundApi.AddFundAccountRequest,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.post<any>(
    '/api/fund/account',
    camelToSnake(data),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.AddFundAccountResponse;
}

/**
 * 更新资金账户
 */
export async function updateFundAccountApi(
  data: FundApi.UpdateFundAccountRequest,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.put<any>(
    `/api/fund/account/${data.accountId}`,
    camelToSnake(data),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.UpdateFundAccountResponse;
}

/**
 * 冻结/解冻资金账户
 */
export async function updateFundAccountStatusApi(
  accountId: number,
  status: string,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.put<any>(
    `/api/fund/account/${accountId}/status`,
    { status },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.UpdateFundAccountResponse;
}

/**
 * 获取资金分类列表
 */
export async function getFundCategoryListApi(
  params: FundApi.FundCategoryQueryParams,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/fund/category/list',
    {
      params: {
        ...camelToSnake(params),
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundCategoryListResponse;
}

/**
 * 获取资金流水列表
 */
export async function getFundFlowListApi(
  params: FundApi.FundFlowQueryParams,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/fund/flow/list',
    {
      params: {
        ...camelToSnake(params),
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundFlowListResponse;
}

/**
 * 记录资金流入
 */
export async function addFundInflowApi(
  data: FundApi.FundInflowRequest,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.post<any>(
    '/api/fund/flow/in',
    camelToSnake(data),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundFlowResponse;
}

/**
 * 记录资金流出
 */
export async function addFundOutflowApi(
  data: FundApi.FundOutflowRequest,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.post<any>(
    '/api/fund/flow/out',
    camelToSnake(data),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundFlowResponse;
}

/**
 * 获取资金统计报表
 */
export async function getFundReportApi(
  params: FundApi.FundReportQueryParams,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/fund/report',
    {
      params: {
        ...camelToSnake(params),
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundReportResponse;
}

/**
 * 获取操作日志列表
 */
export async function getFundLogListApi(
  params: FundApi.FundLogQueryParams,
) {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/fund/log/list',
    {
      params: {
        ...camelToSnake(params),
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.FundLogListResponse;
}

/**
 * 获取所有案件列表
 */
export async function getAllCasesApi() {
  const token = localStorage.getItem('token') || '';
  const response = await requestClient8085.get<any>(
    '/api/web/getAllAHandAJMC',
    {
      params: {
        token,
      },
    },
  );
  return snakeToCamel(response) as FundApi.CaseListResponse;
}
