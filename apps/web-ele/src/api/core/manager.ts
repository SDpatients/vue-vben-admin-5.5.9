import { requestClient8085 } from '#/api/request';

export namespace ManagerApi {
  /** 管理人查询参数 */
  export interface ManagerQueryParams {
    page?: number;
    size?: number;
    token?: string;
    LSWS?: string;
    GLRType?: string;
    FZR?: string;
  }

  /** 管理人信息 */
  export interface ManagerInfo {
    row: number;
    SEP_ID: string; // 管理人ID
    LSWS: string; // 律师事务所
    GLRType: string; // 管理人类型
    FZR: string; // 负责人
    LXDH: string; // 联系电话
    LXEmail: string; // 联系邮箱
    BGAddress: string; // 办公地址
    ZT: string; // 状态
    SEP_AUSER: string; // 创建者
    SEP_ADATE: string; // 创建时间
    SEP_EUSER: string; // 修改者
    SEP_EDATE: string; // 修改时间
  }

  /** 管理人列表响应 */
  export interface ManagerListResponse {
    data: {
      count: number;
      pages: number;
      records: ManagerInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取管理人列表
 */
export async function getManagerListApi(params: ManagerApi.ManagerQueryParams) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.get<ManagerApi.ManagerListResponse>(
    '/api/web/getAllAdministrator',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}

/** 添加管理人请求 */
export interface AddManagerRequest {
  sep_auser: string;
  sep_adate: string;
  lsws: string;
  glrtype: string;
  fzr: string;
  lxdh: string;
  lxemail: string;
  bgaddress: string;
  zt: string;
}

/** 添加管理人响应 */
export interface AddManagerResponse {
  status: string;
  error: string;
}

/**
 * 添加管理人信息
 */
export async function addManagerApi(data: AddManagerRequest[]) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<AddManagerResponse>('/api/web/addAdministrator', data, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      token,
    },
  });
}

/** 更新管理人请求 */
export interface UpdateManagerRequest {
  SEP_EUSER: string;
  SEP_EDATE: string;
  SEP_ID: string;
  LSWS: string;
  GLRType: string;
  FZR: string;
  LXDH: string;
  LXEmail: string;
  BGAddress: string;
  ZT: string;
}

/** 更新管理人响应 */
export interface UpdateManagerResponse {
  status: string;
  error: string;
}

/**
 * 更新管理人信息
 */
export async function updateManagerApi(data: UpdateManagerRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<UpdateManagerResponse>('/api/web/updateManager', [data], {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      token,
    },
  });
}

/** 删除管理人请求 */
export interface DeleteManagerRequest {
  SEP_ID: string;
}

/** 删除管理人响应 */
export interface DeleteManagerResponse {
  status: string;
  error: string;
}

/**
 * 删除管理人信息
 */
export async function deleteManagerApi(data: DeleteManagerRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<DeleteManagerResponse>('/api/web/deleteAdministrator', data, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      token,
    },
  });
}
