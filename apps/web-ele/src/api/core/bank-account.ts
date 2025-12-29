import { requestClient8085 } from '#/api/request';

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
    SEP_ID: string; // 银行账户ID
    account_name: string; // 账户名称
    bank_name: string; // 银行名称
    account_number: string; // 账户号码
    account_type: string; // 账户类型
    currency: string; // 币种
    balance: number; // 余额
    KHRQ: string; // 开户日期
    XHRQ: string; // 销户日期
    ZT: string; // 状态
    MM: string; // 密码
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

  /** 新增银行账户请求体 */
  export interface AddBankAccountRequest {
    /** 操作人 */
    sep_auser: string;
    /** 操作日期 */
    sep_adate: string;
    /** 账户名称 */
    account_name: string;
    /** 银行名称 */
    bank_name: string;
    /** 账户号码 */
    account_number: string;
    /** 账户类型 */
    account_type: string;
    /** 币种 */
    currency: string;
    /** 余额 */
    balance: number;
    /** 开户日期 */
    khrq: string;
    /** 销户日期 */
    xhrq: null | string;
    /** 状态 */
    zt: string;
  }

  /** 新增银行账户响应 */
  export interface AddBankAccountResponse {
    status: string;
    error: string;
  }

  /** 更新银行账户请求体 */
  export interface UpdateBankAccountRequest {
    /** 银行账户ID */
    SEP_ID: string;
    /** 操作人 */
    SEP_EUSER: string;
    /** 操作日期 */
    SEP_EDATE: string;
    /** 账户名称 */
    account_name: string;
    /** 银行名称 */
    bank_name: string;
    /** 账户号码 */
    account_number: string;
    /** 账户类型 */
    account_type: string;
    /** 币种 */
    currency: string;
    /** 余额 */
    balance: number | string;
    /** 开户日期 */
    KHRQ: null | string;
    /** 销户日期 */
    XHRQ: null | string;
    /** 状态 */
    ZT: null | string;
  }

  /** 更新银行账户响应 */
  export interface UpdateBankAccountResponse {
    status: string;
    error: string;
  }

  /** 删除银行账户请求体 */
  export interface DeleteBankAccountRequest {
    /** 银行账户ID */
    SEP_ID: string;
  }

  /** 删除银行账户响应 */
  export interface DeleteBankAccountResponse {
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
  return requestClient8085.get<BankAccountApi.BankAccountListResponse>(
    '/api/web/getAllBankAccounts',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}

/**
 * 新增银行账户
 */
export async function addBankAccountApi(
  data: BankAccountApi.AddBankAccountRequest[],
) {
  const token = '170b18cfd8f829e2ecf9bfb0a78019d4';
  return requestClient8085.post<BankAccountApi.AddBankAccountResponse>(
    '/api/web/addBankAccounts',
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
 * 更新银行账户
 */
export async function updateBankAccountApi(
  data: BankAccountApi.UpdateBankAccountRequest,
) {
  const token = '74df58d5a0ff35a6bf1a5f341ab0b509';
  return requestClient8085.post<BankAccountApi.UpdateBankAccountResponse>(
    '/api/web/updateBankAccounts',
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
 * 删除银行账户
 */
export async function deleteBankAccountApi(
  data: BankAccountApi.DeleteBankAccountRequest,
) {
  const token = '46646a032ae30bd8734b8056642bf27e';
  return requestClient8085.post<BankAccountApi.DeleteBankAccountResponse>(
    '/api/web/deleteBankAccounts',
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
