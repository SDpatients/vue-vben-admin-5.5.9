import { requestClient8085 } from '#/api/request';

export namespace CourtApi {
  /** 法院查询参数 */
  export interface CourtQueryParams {
    page?: number;
    size?: number;
    token?: string;
    FYQC?: string;
    FYJC?: string;
    FYJB?: string;
  }

  /** 法院信息 */
  export interface CourtInfo {
    sep_id: string; // 法院ID（不需要展示）
    sep_ld: string; // 不需要展示
    sep_md: string; // 不需要展示
    sep_nd: string; // 不需要展示
    sep_auser: string; // 不需要展示
    sep_adate: string; // 不需要展示
    sep_euser: string; // 不需要展示
    sep_edate: string; // 不需要展示
    fyqc: string; // 法院全称（需要展示）
    fyjc: string; // 法院简称（需要展示）
    fyjb: string; // 法院级别（需要展示）
    dz: string; // 地址（需要展示）
    lxdh: string; // 联系电话（需要展示）
    fzr: string; // 负责人（需要展示）
    cbfg: string; // 承办法官（需要展示）
    scbj: string; // 不需要展示
  }

  /** 法院列表响应 */
  export interface CourtListResponse {
    status: string;
    error: string;
    data: {
      pages: number;
      records: CourtInfo[];
      count?: number;
    };
  }
}

/**
 * 获取法院列表
 */
export async function getCourtListApi(params: CourtApi.CourtQueryParams) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.get<CourtApi.CourtListResponse>(
    '/api/web/getAllCourt',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}

/** 添加法院请求 */
export interface AddCourtRequest {
  sep_auser: string;
  sep_adate: string;
  fyqc: string;
  fyjc: string;
  fyjb: string;
  dz: string;
  lxdh: string;
  fzr: string;
  cbfg: string;
  scbj: string;
}

/** 添加法院响应 */
export interface AddCourtResponse {
  status: string;
  error: string;
}

/**
 * 添加法院信息
 */
export async function addCourtApi(data: AddCourtRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<AddCourtResponse>('/api/web/addCourt', data, {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      token,
    },
  });
}

/** 更新法院请求 */
export interface UpdateCourtRequest {
  SEP_EUSER: string;
  SEP_EDATE: string;
  SEP_ID: string;
  FYQC: string;
  FYJC: string;
  FYJB: string;
  DZ: string;
  LXDH: string;
  FZR: string;
  CBFG: string;
}

/** 更新法院响应 */
export interface UpdateCourtResponse {
  status: string;
  error: string;
}

/**
 * 更新法院信息
 */
export async function updateCourtApi(data: UpdateCourtRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<UpdateCourtResponse>(
    '/api/web/updateCourt',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
}

/** 删除法院请求 */
export interface DeleteCourtRequest {
  SEP_ID: string;
}

/** 删除法院响应 */
export interface DeleteCourtResponse {
  status: string;
  error: string;
}

/**
 * 删除法院信息
 */
export async function deleteCourtApi(data: DeleteCourtRequest) {
  const token = 'cb0d42b3fe5d7ba756e723a5a26724d7';
  return requestClient8085.post<DeleteCourtResponse>(
    '/api/web/deleteCourt',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        token,
      },
    },
  );
}
