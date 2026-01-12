// AxiosResponse 类型未使用，已移除
import { requestClient8085 } from '../request';

declare namespace CreditorApi {
  /** 债权人查询参数 */
  interface CreditorQueryParams {
    pageNum: number;
    pageSize: number;
    caseId?: string;
    creditorType?: string;
    creditorName?: string;
    idNumber?: string;
    legalRepresentative?: string;
  }

  /** 债权人信息 */
  interface CreditorInfo {
    /** 债权人ID */
    id: number;
    /** 案件ID */
    caseId: number;
    /** 债权人名称 */
    creditorName: string;
    /** 债权人分类 */
    creditorType: string;
    /** 联系电话 */
    contactPhone: string;
    /** 邮箱 */
    contactEmail: string;
    /** 注册地址 */
    address: string;
    /** 证件号码 */
    idNumber: string;
    /** 法定代表人 */
    legalRepresentative: string;
    /** 注册资本 */
    registeredCapital: number;
    /** 创建时间 */
    createTime: string;
    /** 修改时间 */
    updateTime: string;
    /** 案件名称 */
    caseName: string;
    /** 案号 */
    caseNumber: string;
  }

  /** 债权人列表响应 */
  interface CreditorListResponse {
    /** 状态码 */
    code: number;
    /** 响应消息 */
    message: string;
    /** 响应数据 */
    data: {
      /** 总记录数 */
      total: number;
      /** 债权人记录列表 */
      list: CreditorInfo[];
    };
  }

  /** 债权人详情响应 */
  interface CreditorDetailResponse {
    /** 状态码 */
    status: string;
    /** 错误信息 */
    error: string;
    /** 债权人信息 */
    data: CreditorInfo;
  }

  /** 单个债权人请求体 */
  interface SingleCreditorRequest {
    caseId: number;
    creditorName: string;
    creditorType: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    idNumber: string;
    legalRepresentative?: string;
    registeredCapital?: number;
  }

  /** 案件列表查询参数 */
  interface CaseListQueryParams {
    page?: number;
    size?: number;
    caseNumber?: string;
  }

  /** 案件信息 */
  interface CaseInfo {
    id: number;
    caseNumber: string;
    caseName: string;
  }

  /** 案件列表响应 */
  interface CaseListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: CaseInfo[];
    };
  }

  /** 创建债权人响应 */
  interface CreateCreditorResponse {
    code: number;
    message: string;
    data: {
      creditorId: number;
    };
  }

  /** 批量添加债权人请求体 */
  interface BatchAddCreditorsRequest {
    caseId: string;
    creditorsList: Array<{
      creditor_name: string;
      creditor_type: string;
      contact_phone: string;
      contact_email: string;
      address: string;
      id_number: string;
      legal_representative?: string;
      registered_capital?: string;
      status?: string;
      created_by?: string;
    }>;
  }

  /** 批量添加债权人响应 */
  interface BatchAddCreditorsResponse {
    code: number;
    message: string;
    data: {
      successCount: number;
      failedCount: number;
    };
  }

  /** 更新债权人请求体 */
  interface UpdateCreditorRequest {
    creditorId: number;
    creditorName: string;
    creditorType: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    idNumber: string;
    legalRepresentative?: string;
    registeredCapital?: number;
  }

  /** 删除债权人请求体 */
  interface DeleteCreditorRequest {
    id: number;
  }

  /** 通用响应 */
  interface CommonResponse {
    code: number;
    message: string;
    data?: any;
  }
}

/**
 * 获取债权人列表
 */
export async function getCreditorListApi(
  params: CreditorApi.CreditorQueryParams,
) {
  return requestClient8085.get<CreditorApi.CreditorListResponse>(
    '/creditor/list',
    { params },
  );
}

/**
 * 获取债权人详情
 */
export async function getCreditorDetailApi(creditorId: number) {
  return requestClient8085.get<CreditorApi.CreditorDetailResponse>(
    `/api/web/selectOneCreditor/${creditorId}`,
  );
}

/**
 * 获取案件列表
 */
export async function getCaseListApi(params: CreditorApi.CaseListQueryParams) {
  return requestClient8085.get<CreditorApi.CaseListResponse>(
    '/case/simple-list',
    { params },
  );
}

/**
 * 添加单个债权人信息
 */
export async function addCreditorApi(data: CreditorApi.SingleCreditorRequest) {
  return requestClient8085.post<CreditorApi.CreateCreditorResponse>(
    '/creditor',
    data,
  );
}

/**
 * 编辑债权人信息
 */
export async function editCreditorApi(
  data: CreditorApi.UpdateCreditorRequest,
) {
  return requestClient8085.put<CreditorApi.CommonResponse>(
    `/creditor/${data.creditorId}`,
    data,
  );
}

/**
 * 删除债权人信息
 */
export async function deleteCreditorApi(
  { id }: CreditorApi.DeleteCreditorRequest,
) {
  return requestClient8085.delete<CreditorApi.CommonResponse>(
    `/creditor/${id}`,
  );
}

export async function getCreditorsApi(
  caseId: string,
  page: number,
  size: number,
) {
  return requestClient8085.get<CreditorApi.CreditorListResponse>(
    '/api/web/getCreditorsByCase',
    { params: { caseId, page, size } },
  );
}

export async function batchAddCreditorsApi(
  data: CreditorApi.BatchAddCreditorsRequest,
) {
  return requestClient8085.post<CreditorApi.BatchAddCreditorsResponse>(
    '/api/web/batchAddCreditors',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export type { CreditorApi };
