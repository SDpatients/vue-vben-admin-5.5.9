import { requestClient } from '#/api/request';

export namespace WorkTeamApi {
  /** 工作团队查询参数 */
  export interface WorkTeamQueryParams {
    page?: number;
    size?: number;
    token?: string;
  }

  /** 工作团队信息 */
  export interface WorkTeamInfo {
    row: number;
    TDID: null | string; // 团队ID
    GLAJBH: string; // 关联案件编号
    TDFZR: null | string; // 团队负责人
    ZHZCY: null | string; // 综合组成员
    CXZCY: null | string; // 程序组成员
    CCGLZCY: null | string; // 财产管理组成员
    ZQSHZCY: null | string; // 债权审核组成员
    LDRSZCY: null | string; // 劳动人事组成员
    ZZQLZCY: null | string; // 资产清理组成员
    AH: string; // 案号
    DQZT: null | string; // 当前状态
  }

  /** 工作团队列表响应 */
  export interface WorkTeamListResponse {
    data: {
      count: number;
      pages: number;
      records: WorkTeamInfo[];
    };
    status: string;
    error: string;
  }
}

/**
 * 获取工作团队列表
 */
export async function getWorkTeamListApi(
  params: WorkTeamApi.WorkTeamQueryParams,
) {
  const token = '8a3bc057fec451a4c8f8b76eb983f4a6';
  return requestClient.get<WorkTeamApi.WorkTeamListResponse>(
    '/api/web/getAllWorkTeam',
    {
      params: {
        ...params,
        token,
      },
    },
  );
}
