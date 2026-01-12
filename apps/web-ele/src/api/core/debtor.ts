// AxiosResponse 类型未使用，已移除

import { requestClient8085 } from '../request';

declare namespace DebtorApi {
  /** 债务人查询参数 */
  interface DebtorQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    enterpriseName?: string;
    unifiedSocialCreditCode?: string;
    legalRepresentative?: string;
  }

  /** 债务人信息 */
  interface DebtorInfo {
    /** 债务人ID */
    id: number;
    /** 案件ID */
    caseId: number;
    /** 案件名称 */
    caseName: string;
    /** 案号 */
    caseNumber: string;
    /** 企业名称 */
    enterpriseName: string;
    /** 统一社会信用代码 */
    unifiedSocialCreditCode: string;
    /** 法定代表人 */
    legalRepresentative: string;
    /** 联系电话 */
    contactPhone: string;
    /** 联系人 */
    contactPerson: string;
    /** 经营范围 */
    businessScope: string;
    /** 行业 */
    industry: string;
    /** 注册地址 */
    registeredAddress: string;
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime: string;
  }

  /** 债务人列表响应 */
  interface DebtorListResponse {
    /** 状态码 */
    code: number;
    /** 响应信息 */
    message: string;
    /** 响应数据 */
    data: {
      /** 债务人记录列表 */
      list: DebtorInfo[];
      /** 总条数 */
      total: number;
    };
  }

  /** 债务人详情响应 */
  interface DebtorDetailResponse {
    /** 状态码 */
    status: string;
    /** 错误信息 */
    error: string;
    /** 债务人信息 */
    data: DebtorInfo;
  }

  /** 添加债务人请求体 */
  interface AddDebtorRequest {
    caseId: number;
    enterpriseName: string;
    unifiedSocialCreditCode: string;
    legalRepresentative: string;
    registrationAuthority?: string;
    establishmentDate?: string;
    registeredCapital?: number;
    businessScope?: string;
    enterpriseType?: string;
    industry?: string;
    registeredAddress?: string;
    contactPhone?: string;
    contactPerson?: string;
  }

  /** 添加债务人响应 */
  interface AddDebtorResponse {
    code: number;
    message: string;
    data: {
      debtorId: number;
    };
  }

  /** 更新债务人请求体 */
  interface UpdateDebtorRequest {
    enterpriseName?: string;
    legalRepresentative?: string;
    contactPhone?: string;
    contactPerson?: string;
    businessScope?: string;
    industry?: string;
    registeredAddress?: string;
  }

  /** 更新债务人响应 */
  interface UpdateDebtorResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 获取债务人列表
 */
export async function getDebtorListApi(params: DebtorApi.DebtorQueryParams) {
  return requestClient8085.get<DebtorApi.DebtorListResponse>('/debtor/list', {
    params,
  });
}

/**
 * 获取债务人详情
 */
export async function getDebtorDetailApi(debtorId: string, token: string) {
  return requestClient8085.get<DebtorApi.DebtorDetailResponse>(
    '/api/web/selectDebtorById',
    { params: { debtorId, token } },
  );
}

/**
 * 添加债务人企业信息
 */
export async function addDebtorApi(data: DebtorApi.AddDebtorRequest) {
  // 直接传递JSON对象格式
  return requestClient8085.post<DebtorApi.AddDebtorResponse>('/debtor', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 编辑债务人信息
 */
export async function editDebtorApi(
  debtorId: number,
  data: DebtorApi.UpdateDebtorRequest,
) {
  return requestClient8085.put<DebtorApi.UpdateDebtorResponse>(
    `/debtor/${debtorId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

/**
 * 删除债务人信息
 */
export async function deleteDebtorApi(debtorId: number) {
  return requestClient8085.delete<DebtorApi.UpdateDebtorResponse>(
    `/debtor/${debtorId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export type { DebtorApi };
