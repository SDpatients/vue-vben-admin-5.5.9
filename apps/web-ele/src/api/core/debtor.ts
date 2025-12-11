// AxiosResponse 类型未使用，已移除

import { requestClient } from '../request';

declare namespace DebtorApi {
  /** 债务人查询参数 */
  interface DebtorQueryParams {
    page: number;
    size: number;
    token: string;
  }

  /** 债务人信息 */
  interface DebtorInfo {
    /** 行号 */
    row: number;
    /** 企业ID */
    QYID: string;
    /** 案件ID */
    AJID: string;
    /** 企业名称 */
    QYMC: string;
    /** 统一社会信用代码 */
    TYSHXYDM: string;
    /** 法定代表人 */
    FDDBR: string;
    /** 登记机关 */
    DJJG: string;
    /** 成立日期 */
    CLRQ: string;
    /** 注册资本 */
    ZCZB: string;
    /** 经营范围 */
    JYFW: string;
    /** 企业类型 */
    QYLX: string;
    /** 所属行业 */
    SSHY: string;
    /** 注册地址 */
    ZCDZ: string;
    /** 联系电话 */
    LXDH: string;
    /** 联系人 */
    LXR: string;
    /** 状态 */
    ZT: string;
  }

  /** 债务人列表响应 */
  interface DebtorListResponse {
    data: {
      /** 总记录数 */
      count: number;
      /** 总页数 */
      pages: number;
      /** 债务人记录列表 */
      records: DebtorInfo[];
    };
    /** 状态码 */
    status: string;
    /** 错误信息 */
    error: string;
  }

  /** 债务人详情响应 */
  interface DebtorDetailResponse {
    data: DebtorInfo;
    status: string;
    error: string;
  }
}

/**
 * 获取债务人列表
 */
export async function getDebtorListApi(params: DebtorApi.DebtorQueryParams) {
  return requestClient.get<DebtorApi.DebtorListResponse>(
    '/api/web/selectAllDebtor',
    { params },
  );
}

/**
 * 获取债务人详情
 */
export async function getDebtorDetailApi(debtorId: string, token: string) {
  return requestClient.get<DebtorApi.DebtorDetailResponse>(
    '/api/web/selectDebtorById',
    { params: { debtorId, token } },
  );
}

export type { DebtorApi };
