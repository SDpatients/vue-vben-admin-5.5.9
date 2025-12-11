// AxiosResponse 类型未使用，已移除
import { requestClient } from '../request';

declare namespace CreditorApi {
  /** 债权人查询参数 */
  interface CreditorQueryParams {
    page: number;
    size: number;
    token: string;
    SearchKeyword?: string;
    SearchType?: string;
  }

  /** 债权人信息 */
  interface CreditorInfo {
    /** 行号 */
    row: number;
    /** 债权人ID */
    ZQRID: string;
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
    CLRQQY: string;
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

export type { CreditorApi };
