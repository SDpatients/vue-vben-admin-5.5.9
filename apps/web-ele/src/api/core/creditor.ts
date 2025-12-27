// AxiosResponse 类型未使用，已移除
import { requestClient } from '../request';

declare namespace CreditorApi {
  /** 债权人查询参数 */
  interface CreditorQueryParams {
    page: number;
    size: number;
    token: string;
    /** 债权人 */
    ZQR?: string;
    /** 证件号码 */
    ZJHM?: string;
    /** 法定代表人 */
    FDDBRQY?: string;
  }

  /** 债权人信息 */
  interface CreditorInfo {
    /** 行号 */
    row: number;
    /** 债权人ID */
    SEP_ID: string;
    /** 债权人名称 */
    ZQR: string;
    /** 债权人分类 */
    ZQRFL: string;
    /** 证件号码 */
    ZJHM: string;
    /** 法定代表人（企业） */
    FDDBRQY: string;
    /** 注册地址 */
    ZCDZ: string;
    /** 经营范围（企业） */
    JYFWQY: string;
    /** 行业分类 */
    HYFL: string;
    /** 成立日期（企业） */
    CLRQQY: null | string;
    /** 注册资本（企业） */
    ZCZBQY: number;
    /** 关联案件ID */
    GLAJID: string;
    /** 案号 */
    AH: string;
  }

  /** 债权人列表响应 */
  interface CreditorListResponse {
    data: {
      /** 总记录数 */
      count: number;
      /** 总页数 */
      pages: number;
      /** 债权人记录列表 */
      records: CreditorInfo[];
    };
    /** 状态码 */
    status: string;
    /** 错误信息 */
    error: string;
  }

  /** 债权人详情响应 */
  interface CreditorDetailResponse {
    data: CreditorInfo;
    status: string;
    error: string;
  }

  /** 添加债权人请求体 */
  interface AddCreditorRequest {
    sep_ld: string;
    sep_auser: string;
    sep_adate: string;
    zqr: string;
    zqrfl: string;
    zjhm: string;
    fddbrqy: string;
    zcdz: string;
    jyfwqy: string;
    hyfl: string;
    clrqqy: null | string;
    zczbqy: number;
    zt: string;
  }

  /** 添加债权人响应 */
  interface AddCreditorResponse {
    status: string;
    error: string;
  }

  /** 编辑债权人请求体 */
  interface EditCreditorRequest {
    /** 当前登录用户 */
    SEP_EUSER: string;
    /** 当前北京时间，datetime格式 */
    SEP_EDATE: string;
    /** 债权人ID */
    SEP_ID: string;
    /** 债权人名称 */
    ZQR: string;
    /** 债权人分类 */
    ZQRFL: string;
    /** 证件号码 */
    ZJHM: string;
    /** 法定代表人（企业） */
    FDDBRQY: string;
    /** 注册地址 */
    ZCDZ: string;
    /** 经营范围（企业） */
    JYFWQY: string;
    /** 行业分类 */
    HYFL: string;
    /** 成立日期（企业） */
    CLRQQY: null | string;
    /** 注册资本（企业） */
    ZCZBQY: number;
    /** 状态，默认为null */
    ZT: string | null;
  }

  /** 编辑债权人响应 */
  interface EditCreditorResponse {
    status: string;
    error: string;
  }

  /** 删除债权人请求体 */
  interface DeleteCreditorRequest {
    /** 债权人ID */
    SEP_ID: string;
  }

  /** 删除债权人响应 */
  interface DeleteCreditorResponse {
    status: string;
    error: string;
  }
}

/**
 * 获取债权人列表
 */
export async function getCreditorListApi(
  params: CreditorApi.CreditorQueryParams,
) {
  return requestClient.get<CreditorApi.CreditorListResponse>(
    '/api/web/getAllCreditor',
    { params },
  );
}

/**
 * 获取债权人详情
 */
export async function getCreditorDetailApi(creditorId: string, token: string) {
  return requestClient.get<CreditorApi.CreditorDetailResponse>(
    '/api/web/selectOneCreditor',
    { params: { creditorId, token } },
  );
}

/**
 * 添加债权人信息
 */
export async function addCreditorApi(data: CreditorApi.AddCreditorRequest) {
  // 将数据包装为数组格式，符合后端要求的[{}]格式
  return requestClient.post<CreditorApi.AddCreditorResponse>(
    '/api/web/addCreditor',
    [data],
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 编辑债权人信息
 */
export async function editCreditorApi(
  data: CreditorApi.EditCreditorRequest,
  token: string,
) {
  return requestClient.post<CreditorApi.EditCreditorResponse>(
    '/api/web/updateCreditor',
    data,
    {
      params: { token },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 删除债权人信息
 */
export async function deleteCreditorApi(
  data: CreditorApi.DeleteCreditorRequest,
  token: string,
) {
  return requestClient.post<CreditorApi.DeleteCreditorResponse>(
    '/api/web/deleteCreditor',
    data,
    {
      params: { token },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export type { CreditorApi };
