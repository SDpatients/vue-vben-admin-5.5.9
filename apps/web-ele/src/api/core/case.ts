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

/** 案件详情响应 */
export interface CaseDetailResponse {
  data: {
    会议庭成员: string;
    债务人: string;
    债权人ID: string;
    债权人名称: string;
    债权人类型: string;
    债权申报截止时间: string;
    办公地址: string;
    受理庭室: string;
    受理日期: string;
    受理法院: string;
    备注: string;
    币种: string;
    开户日期: string;
    开户行: string;
    归档时间: string;
    当前余额: string;
    律师事务所: string;
    成立日期: string;
    承办法官: string;
    指定机构: string;
    接收人: string;
    是否简化审: string;
    案件ID: string;
    案件单据号: string;
    案件名称: string;
    案件来源: string;
    案件进度: string;
    案号: string;
    案由: string;
    法定代表人: string;
    法院裁定日期: string;
    注册地址: string;
    注册资本: string;
    注销时间: string;
    申报ID: string;
    申报依据: string;
    申报债权人名称: string;
    申报债权人类型: string;
    申报备注: string;
    申报状态: string;
    申报类型: string;
    申报金额: string;
    破产时间: string;
    确认ID: string;
    确认日期: string;
    确认金额: string;
    立案日期: string;
    管理人ID: string;
    管理人状态: string;
    管理人类型: string;
    管理人联系方式: string;
    管理人负责人: string;
    终结时间: string;
    经营范围: string;
    结案日期: string;
    联系电话: string;
    联系邮箱: string;
    行业分类: string;
    裁定文号: string;
    证件号码: string;
    负责人: string;
    账号: string;
    账户ID: string;
    账户名称: string;
    账户状态: string;
    账户类型: string;
    销户日期: string;
  };
  status: string;
  error: string;
}

/**
 * 获取案件列表
 */
export async function getCaseListApi(params: CaseApi.CaseQueryParams) {
  return requestClient.get<CaseApi.CaseListResponse>('/api/web/selectAllCase', {
    params,
  });
}

/**
 * 获取案件详情
 */
export async function getCaseDetailApi(caseId: string) {
  const token = '61486a5c55e64e5bd24061ff1f724d40';
  return requestClient.get<CaseDetailResponse>('/api/web/selectOneCase', {
    params: {
      token,
      AJID: caseId,
    },
  });
}
