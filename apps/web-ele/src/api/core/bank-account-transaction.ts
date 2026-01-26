import { requestClient8085 } from '#/api/request';

export namespace BankAccountTransactionApi {
  /** 交易记录查询参数 */
  export interface TransactionQueryParams {
    pageNum?: number;
    pageSize?: number;
    accountId?: number;
    transactionType?: string;
    businessType?: string;
    startDate?: string;
    endDate?: string;
    caseId?: number;
  }

  /** 交易记录信息 */
  export interface TransactionInfo {
    id: number;
    accountId: number;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    transactionType: string;
    amount: number;
    transactionDate: string;
    summary?: string;
    businessType?: string;
    counterpartyAccount?: string;
    counterpartyName?: string;
    balanceAfter?: number;
    attachmentId?: number;
    relatedBusinessId?: number;
    remark?: string;
    caseId?: number;
    caseNumber?: string;
    caseName?: string;
    status?: string;
    createTime: string;
    updateTime: string;
  }

  /** 交易记录列表响应 */
  export interface TransactionListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: TransactionInfo[];
    };
  }

  /** 交易记录详情响应 */
  export interface TransactionDetailResponse {
    code: number;
    message: string;
    data: TransactionInfo;
  }

  /** 创建交易记录请求体 */
  export interface CreateTransactionRequest {
    accountId: number;
    transactionType: string;
    amount: number;
    transactionDate: string;
    summary?: string;
    businessType?: string;
    counterpartyAccount?: string;
    counterpartyName?: string;
    balanceAfter?: number;
    attachmentId?: number;
    relatedBusinessId?: number;
    remark?: string;
    caseId?: number;
  }

  /** 创建交易记录响应 */
  export interface CreateTransactionResponse {
    code: number;
    message: string;
    data: {
      transactionId: number;
    };
  }

  /** 更新交易记录请求体 */
  export interface UpdateTransactionRequest {
    transactionType?: string;
    amount?: number;
    transactionDate?: string;
    summary?: string;
    businessType?: string;
    counterpartyAccount?: string;
    counterpartyName?: string;
    balanceAfter?: number;
    attachmentId?: number;
    relatedBusinessId?: number;
    remark?: string;
  }

  /** 更新交易记录响应 */
  export interface UpdateTransactionResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 删除交易记录响应 */
  export interface DeleteTransactionResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 获取交易记录列表
 */
export async function getTransactionListApi(
  params: BankAccountTransactionApi.TransactionQueryParams,
) {
  return requestClient8085.get<BankAccountTransactionApi.TransactionListResponse>(
    '/bank-account-transaction/list',
    {
      params,
    },
  );
}

/**
 * 获取交易记录详情
 */
export async function getTransactionDetailApi(
  transactionId: number,
) {
  return requestClient8085.get<BankAccountTransactionApi.TransactionDetailResponse>(
    `/bank-account-transaction/${transactionId}`,
  );
}

/**
 * 创建交易记录
 */
export async function createTransactionApi(
  data: BankAccountTransactionApi.CreateTransactionRequest,
) {
  return requestClient8085.post<BankAccountTransactionApi.CreateTransactionResponse>(
    '/bank-account-transaction',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 更新交易记录
 */
export async function updateTransactionApi(
  transactionId: number,
  data: BankAccountTransactionApi.UpdateTransactionRequest,
) {
  return requestClient8085.put<BankAccountTransactionApi.UpdateTransactionResponse>(
    `/bank-account-transaction/${transactionId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 删除交易记录
 */
export async function deleteTransactionApi(
  transactionId: number,
) {
  return requestClient8085.delete<BankAccountTransactionApi.DeleteTransactionResponse>(
    `/bank-account-transaction/${transactionId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 获取银行账户交易明细
 */
export async function getAccountTransactionsApi(
  accountId: number,
  params?: Omit<BankAccountTransactionApi.TransactionQueryParams, 'accountId'>,
) {
  return requestClient8085.get<BankAccountTransactionApi.TransactionListResponse>(
    `/bank-account/${accountId}/transactions`,
    {
      params,
    },
  );
}
