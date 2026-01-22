import { requestClient8085 } from '#/api/request';

export namespace DebtorApi {
  /** 债务人查询参数 */
  export interface DebtorQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    enterpriseName?: string;
    unifiedSocialCreditCode?: string;
    legalRepresentative?: string;
  }

  /** 债务人信息 */
  export interface DebtorInfo {
    id: number;
    caseId: number;
    caseNumber: string;
    caseName: string;
    enterpriseName: string;
    unifiedSocialCreditCode: string;
    legalRepresentative: string;
    registrationAuthority: string;
    establishmentDate: string;
    registeredCapital: number;
    businessScope: string;
    enterpriseType: string;
    industry: string;
    registeredAddress: string;
    contactPhone: string;
    contactPerson: string;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
    isDeleted: boolean;
  }

  /** 债务人列表响应 */
  export interface DebtorListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: DebtorInfo[];
      pageNum: number;
      pageSize: number;
    };
  }

  /** 债务人详情响应 */
  export interface DebtorDetailResponse {
    code: number;
    message: string;
    data: DebtorInfo;
  }

  /** 创建债务人请求体 */
  export interface CreateDebtorRequest {
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

  /** 创建债务人响应 */
  export interface CreateDebtorResponse {
    code: number;
    message: string;
    data: Record<string, any>;
  }

  /** 更新债务人请求体 */
  export interface UpdateDebtorRequest {
    enterpriseName?: string;
    legalRepresentative?: string;
    contactPhone?: string;
    contactPerson?: string;
    businessScope?: string;
    industry?: string;
    registeredAddress?: string;
    unifiedSocialCreditCode?: string;
    establishmentDate?: string;
    registrationAuthority?: string;
    enterpriseType?: string;
    status?: string;
  }

  /** 更新债务人响应 */
  export interface UpdateDebtorResponse {
    code: number;
    message: string;
    data: Record<string, any>;
  }

  /** 删除债务人响应 */
  export interface DeleteDebtorResponse {
    code: number;
    message: string;
    data: Record<string, any>;
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: Record<string, any>;
  }
}

/**
 * 获取债务人列表
 * GET /debtor/list
 */
export async function getDebtorListApi(params: DebtorApi.DebtorQueryParams = {}) {
  return requestClient8085.get<DebtorApi.DebtorListResponse>('/debtor/list', { params });
}

/**
 * 获取债务人详情
 * GET /debtor/{debtorId}
 */
export async function getDebtorDetailApi(debtorId: number) {
  return requestClient8085.get<DebtorApi.DebtorDetailResponse>(`/debtor/${debtorId}`);
}

/**
 * 创建债务人信息
 * POST /debtor
 */
export async function createDebtorApi(data: DebtorApi.CreateDebtorRequest) {
  return requestClient8085.post<DebtorApi.CreateDebtorResponse>('/debtor', data);
}

/**
 * 更新债务人信息
 * PUT /debtor/{debtorId}
 */
export async function updateDebtorApi(debtorId: number, data: DebtorApi.UpdateDebtorRequest) {
  return requestClient8085.put<DebtorApi.UpdateDebtorResponse>(`/debtor/${debtorId}`, data);
}

/**
 * 删除债务人信息
 * DELETE /debtor/{debtorId}
 */
export async function deleteDebtorApi(debtorId: number) {
  return requestClient8085.delete<DebtorApi.DeleteDebtorResponse>(`/debtor/${debtorId}`);
}

export type { DebtorApi };
