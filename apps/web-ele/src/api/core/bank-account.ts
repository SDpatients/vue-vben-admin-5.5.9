import { requestClient } from '#/api/request';

export namespace BankAccountApi {
  /** 银行账户查询参数 */
  export interface BankAccountQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }

  /** 银行账户信息 */
  export interface BankAccountInfo {
    row: number;
    CASEID: string; // 案件ID
    account_name: string; // 账户名称
    bank_name: string; // 银行名称
    account_number: string; // 账户号码
    account_type: string; // 账户类型
    currency: string; // 币种
    balance: number; // 余额
    KHRQ: string; // 开户日期
    XHRQ: string; // 销户日期
    ZT: string; // 状态
    AH: string; // 案号
    MM: string; // 密码
    ZHID: null | string; // 账户ID
  }

  /** 银行账户列表响应 */
  export interface BankAccountListResponse {
    data: {
      count: number;
      pages: number;
      records: BankAccountInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取银行账户列表
 */
export async function getBankAccountListApi(
  params: BankAccountApi.BankAccountQueryParams,
) {
  const token = 'fefd6e9ec409dae4290d2386001ff028';
  return requestClient.get<BankAccountApi.BankAccountListResponse>(
    '/api/web/getAllBankAccounts',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}
