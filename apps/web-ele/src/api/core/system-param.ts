import { requestClient8080 } from '#/api/request';

export namespace SystemParamApi {
  export interface SystemParam {
    id: number;
    configKey: string;
    configValue: string;
    configDesc: string;
    configGroup: string;
    sortOrder: number;
    status: string;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
  }

  export interface SystemParamQueryParams {
    pageNum?: number;
    pageSize?: number;
    configGroup?: string;
    status?: string;
  }

  export interface SystemParamListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: SystemParam[];
      pageNum: number;
      pageSize: number;
    };
  }

  export interface SystemParamDetailResponse {
    code: number;
    message: string;
    data: SystemParam;
  }

  export interface SystemParamOperationResponse {
    code: number;
    message: string;
    data: any;
  }

  export interface CreateSystemParamRequest {
    configKey: string;
    configValue: string;
    configDesc?: string;
    configGroup?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateSystemParamRequest {
    configValue?: string;
    configDesc?: string;
    configGroup?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateSystemParamStatusRequest {
    status: string;
  }
}

export async function getSystemParamListApi(
  params: SystemParamApi.SystemParamQueryParams,
) {
  return requestClient8080.get<SystemParamApi.SystemParamListResponse>(
    '/system-param/list',
    { params },
  );
}

export async function getSystemParamByKeyApi(configKey: string) {
  return requestClient8080.get<SystemParamApi.SystemParamDetailResponse>(
    `/system-param/${configKey}`,
  );
}

export async function addSystemParamApi(
  data: SystemParamApi.CreateSystemParamRequest,
) {
  return requestClient8080.post<SystemParamApi.SystemParamOperationResponse>(
    '/system-param',
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateSystemParamApi(
  configKey: number | string,
  data: SystemParamApi.UpdateSystemParamRequest,
) {
  return requestClient8080.put<SystemParamApi.SystemParamOperationResponse>(
    `/system-param/${configKey}`,
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateSystemParamStatusApi(
  configId: number | string,
  data: SystemParamApi.UpdateSystemParamStatusRequest,
) {
  return requestClient8080.put<SystemParamApi.SystemParamOperationResponse>(
    `/system-param/${configId}/status`,
    null,
    { params: { status: data.status } },
  );
}

export async function deleteSystemParamApi(configId: number | string) {
  return requestClient8080.delete<SystemParamApi.SystemParamOperationResponse>(
    `/system-param/${configId}`,
  );
}
