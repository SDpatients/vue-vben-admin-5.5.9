import { requestClient } from '#/api/request';

export namespace FundApi {
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
    code: number;
    message: string;
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
    code: number;
    message: string;
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
    code: number;
    message: string;
  }

  /** 资金响应 */
  export interface FundResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取资金账户列表
 */
export async function getFundAccountListApi() {
  return requestClient.get<FundApi.FundAccountListResponse>('/fund/accounts');
}

/**
 * 新增资金账户
 */
export async function addFundAccountApi() {
  return requestClient.post<FundApi.FundResponse>('/fund/accounts');
}

/**
 * 更新资金账户
 */
export async function updateFundAccountApi() {
  return requestClient.put<FundApi.FundResponse>('/fund/accounts');
}

/**
 * 冻结/解冻资金账户
 */
export async function updateFundAccountStatusApi() {
  return requestClient.put<FundApi.FundResponse>('/fund/accounts/status');
}

/**
 * 获取资金分类列表
 */
export async function getFundCategoryListApi() {
  return requestClient.get<FundApi.FundCategoryListResponse>('/fund/categories');
}

/**
 * 获取资金流水列表
 */
export async function getFundFlowListApi() {
  return requestClient.get<FundApi.FundFlowListResponse>('/fund/flows');
}

/**
 * 记录资金流入
 */
export async function addFundInflowApi() {
  return requestClient.post<FundApi.FundResponse>('/fund/flows/in');
}

/**
 * 记录资金流出
 */
export async function addFundOutflowApi() {
  return requestClient.post<FundApi.FundResponse>('/fund/flows/out');
}
