import { requestClient } from '#/api/request';

export namespace CaseApi {
  /** 案件查询参数 */
  export interface CaseQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }

  /** 案件信息 */
  export interface CaseInfo {
    row: number;
    案件ID: string;
    序号: number;
    年度: null | string;
    案号: string;
    申请人: null | string;
    债务人: null | string;
    案由: string;
    立案时间: null | string;
    破产时间: null | string;
    终结时间: null | string;
    注销时间: null | string;
    归档时间: null | string;
    会计账簿: string;
    办理期限: null | string;
    承办人: string;
    法院: string;
    管理人: string;
    债权人数: number;
    债权总额: number;
    财产金额: number;
    财产比例: number;
    银行账户数: number;
    银行账户总余额: number;
    有效账户数: number;
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    data: {
      count: number;
      pages: number;
      records: CaseInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取案件列表
 */
export async function getCaseListApi(params: CaseApi.CaseQueryParams) {
  return requestClient.get<CaseApi.CaseListResponse>('/api/web/selectAllCase', {
    params,
  });
}
