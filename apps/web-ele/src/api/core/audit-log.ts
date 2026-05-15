import { requestClient8080 } from '#/api/request';

export namespace AuditLogApi {
  export interface AuditLog {
    id: number;
    userId: number;
    userAccount: string;
    userName: string;
    module: string;
    moduleName: string;
    operationType: string;
    operationName: string;
    businessType: string;
    businessId: number;
    businessName: string;
    requestMethod: string;
    requestUrl: string;
    requestParams: string;
    dataBefore: string;
    dataAfter: string;
    status: string;
    ipAddress: string;
    browser: string;
    os: string;
    createTime: string;
    hashValue: string;
    previousHash: string;
    chainSequence: number;
    integrityStatus: string;
  }

  export interface AuditLogListParams {
    userId?: number;
    module?: string;
    operationType?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    keyword?: string;
    page: number;
    size: number;
  }

  export interface AuditLogListResponse {
    code: number;
    message: string;
    data: {
      list: AuditLog[];
      total: number;
      page: number;
      size: number;
    };
  }

  export interface AuditLogDetailResponse {
    code: number;
    message: string;
    data: AuditLog;
  }

  export interface ModuleStatisticsResponse {
    code: number;
    message: string;
    data: Record<string, number>;
  }

  export interface OperationStatisticsResponse {
    code: number;
    message: string;
    data: Record<string, number>;
  }

  export interface TrendItem {
    date: string;
    count: number;
  }

  export interface TrendStatisticsResponse {
    code: number;
    message: string;
    data: TrendItem[];
  }

  export interface TamperedLog {
    id: number;
    userAccount: string;
    operationName: string;
    createTime: string;
    integrityStatus: string;
  }

  export interface IntegrityReportData {
    totalCount: number;
    verifiedCount: number;
    tamperedCount: number;
    pendingCount: number;
    integrityRate: number;
    lastVerificationTime: string;
  }

  export interface IntegrityReportResponse {
    code: number;
    message: string;
    data: IntegrityReportData;
  }
}

const BASE_PATH = '/system/audit-log';

export async function getAuditLogListApi(params: AuditLogApi.AuditLogListParams) {
  return requestClient8080.get<AuditLogApi.AuditLogListResponse>(
    `${BASE_PATH}/list`,
    { params },
  );
}

export async function getAuditLogDetailApi(id: number) {
  return requestClient8080.get<AuditLogApi.AuditLogDetailResponse>(
    `${BASE_PATH}/${id}`,
  );
}

export async function getUserAuditLogsApi(userId: number, page: number, size: number) {
  return requestClient8080.get<AuditLogApi.AuditLogListResponse>(
    `${BASE_PATH}/user/${userId}`,
    { params: { page, size } },
  );
}

export async function getBusinessAuditLogsApi(
  businessType: string,
  businessId: number,
  page: number,
  size: number,
) {
  return requestClient8080.get<AuditLogApi.AuditLogListResponse>(
    `${BASE_PATH}/business`,
    { params: { businessType, businessId, page, size } },
  );
}

export async function getModuleStatisticsApi(startTime?: string, endTime?: string) {
  return requestClient8080.get<AuditLogApi.ModuleStatisticsResponse>(
    `${BASE_PATH}/statistics/module`,
    { params: { startTime, endTime } },
  );
}

export async function getOperationStatisticsApi(startTime?: string, endTime?: string) {
  return requestClient8080.get<AuditLogApi.OperationStatisticsResponse>(
    `${BASE_PATH}/statistics/operation`,
    { params: { startTime, endTime } },
  );
}

export async function getTrendStatisticsApi(startTime?: string, endTime?: string) {
  return requestClient8080.get<AuditLogApi.TrendStatisticsResponse>(
    `${BASE_PATH}/statistics/trend`,
    { params: { startTime, endTime } },
  );
}

export async function verifyAuditLogIntegrityApi(id: number) {
  return requestClient8080.get<{ code: number; message: string; data: boolean }>(
    `${BASE_PATH}/integrity/verify/${id}`,
  );
}

export async function verifyAllAuditLogsIntegrityApi() {
  return requestClient8080.post<{ code: number; message: string; data: AuditLogApi.TamperedLog[] }>(
    `${BASE_PATH}/integrity/verify-all`,
  );
}

export async function getIntegrityReportApi() {
  return requestClient8080.get<AuditLogApi.IntegrityReportResponse>(
    `${BASE_PATH}/integrity/report`,
  );
}