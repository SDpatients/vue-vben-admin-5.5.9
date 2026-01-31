import { requestClient8085 } from '#/api/request';

export namespace BankAccountApi {
  /** 银行账户查询参数 */
  export interface BankAccountQueryParams {
    pageNum?: number;
    pageSize?: number;
    accountType?: string;
    status?: string;
  }

  /** 银行账户信息 */
export interface BankAccountInfo {
  id: number; // 银行账户ID
  accountName: string; // 账户名称
  accountNumber: string; // 账户号码
  accountType: string; // 账户类型
  bankName: string; // 银行名称/开户行
  currentBalance: number; // 当前余额
  status: string; // 状态
  caseId: number;
  caseNumber: string; // 案号
  caseName: string; // 案件名称
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
  password?: string; // 密码
  currency?: string; // 币种
  openingDate?: string; // 开户日期
  closingDate?: string | null; // 销户日期
}

  /** 银行账户列表响应 */
  export interface BankAccountListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: BankAccountInfo[];
    };
  }

  /** 新增银行账户请求体 */
  export interface AddBankAccountRequest {
    accountName: string;
    accountNumber: string;
    accountType: string;
    bankName: string; // 开户行字段改为bankName
    password: string;
    currentBalance: number;
    currency?: string;
    openingDate?: string;
    closingDate?: string | null;
    status?: string;
    caseId?: number;
  }

  /** 新增银行账户响应 */
  export interface AddBankAccountResponse {
    code: number;
    message: string;
    data: {
      accountId: number;
    };
  }

  /** 更新银行账户请求体 */
  export interface UpdateBankAccountRequest {
    accountName?: string;
    currentBalance?: number;
    accountNumber?: string;
    accountType?: string;
    bankName?: string; // 开户行字段改为bankName
    password?: string;
    currency?: string;
    openingDate?: string;
    closingDate?: string | null;
    status?: string;
    caseId?: number;
  }

  /** 更新银行账户响应 */
  export interface UpdateBankAccountResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除银行账户响应 */
  export interface DeleteBankAccountResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 账户交易汇总信息 */
  export interface AccountTransactionSummary {
    id: number;
    accountName: string;
    bankName: string;
    accountNumber: string;
    currentBalance: number;
    transactions: any[];
    totalInflow: number;
    totalOutflow: number;
  }

  /** 账户交易汇总响应 */
  export interface AccountTransactionSummaryResponse {
    code: number;
    message: string;
    data: AccountTransactionSummary;
  }
}

/**
 * 获取银行账户列表
 */
export async function getBankAccountListApi(
  params: BankAccountApi.BankAccountQueryParams,
) {
  return requestClient8085.get<BankAccountApi.BankAccountListResponse>(
    '/bank-account/list',
    {
      params,
    },
  );
}

/**
 * 新增银行账户
 */
export async function addBankAccountApi(
  data: BankAccountApi.AddBankAccountRequest,
) {
  return requestClient8085.post<BankAccountApi.AddBankAccountResponse>(
    '/bank-account',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 更新银行账户
 */
export async function updateBankAccountApi(
  accountId: number,
  data: BankAccountApi.UpdateBankAccountRequest,
) {
  return requestClient8085.put<BankAccountApi.UpdateBankAccountResponse>(
    `/bank-account/${accountId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 删除银行账户
 */
export async function deleteBankAccountApi(
  accountId: number,
) {
  return requestClient8085.delete<BankAccountApi.DeleteBankAccountResponse>(
    `/bank-account/${accountId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 获取账户交易汇总信息（包含总流入和总流出）
 */
export async function getAccountTransactionSummaryApi(
  accountId: number,
) {
  return requestClient8085.get<BankAccountApi.AccountTransactionSummaryResponse>(
    `/bank-account/${accountId}/with-transactions`,
  );
}
