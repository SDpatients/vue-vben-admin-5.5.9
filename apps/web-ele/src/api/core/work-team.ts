import { requestClient } from '#/api/request';

export namespace WorkTeamApi {
  /** 工作团队查询参数 */
  export interface WorkTeamQueryParams {
    page?: number;
    size?: number;
    token?: string;
    TDFZR?: string;
  }

  /** 工作团队信息 */
  export interface WorkTeamInfo {
    row: number;
    SEP_ID: number;
    TDFZR: null | string; // 团队负责人
    ZHZCY: null | string; // 综合组成员
    CXZCY: null | string; // 程序组成员
    CCGLZCY: null | string; // 财产管理组成员
    ZQSHZCY: null | string; // 债权审核组成员
    LDRSZCY: null | string; // 劳动人事组成员
    ZZQLZCY: null | string; // 资产清理组成员
    AH: null | string; // 案号
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

  /** 添加工作团队请求参数 */
  export interface AddWorkTeamRequest {
    sep_ld: string; // 示例值
    tdfzr: string; // 团队负责人
    zhzcy: string; // 综合组成员
    cxzcy: string; // 程序组成员
    ccglzcy: string; // 财产管理组成员
    zqshzcy: string; // 债权审核组成员
    ldrszcy: string; // 劳动人事组成员
    zzqlzcy: string; // 资产清理组成员
    sepauser: string; // 操作人
    sepadate: string; // 操作日期
    ZT: string; // 状态字段，默认为0（string类型）
  }

  /** 更新工作团队请求参数 */
  export interface UpdateWorkTeamRequest {
    // 必须的参数
    SEP_EUSER: string;
    SEP_EDATE: string;
    OperateType: string | number;
    
    // 可选参数
    SEP_ID?: string;
    SEP_LD?: string;
    TDFZR?: string;
    ZHZCY?: string;
    CXZCY?: string;
    CCGLZCY?: string;
    ZQSHZCY?: string;
    LDRSZCY?: string;
    ZZQLZCY?: string;
    ZT?: string | number;
    JHLX?: string;
    JHNR?: string;
    KSRQ?: string;
    JSRQ?: string;
    FZR?: string;
    ZDLX?: string;
    ZDMC?: string;
    ZDNR?: string;
    SXRQ?: string;
    YZLX?: string;
    YZBH?: string;
    YZYBLJ?: string;
    BARQ?: string;
    YZMC?: string;
    CXLX?: string;
    CXNR?: string;
    ZHRQ?: string;
  }

  /** 添加工作团队响应 */
  export interface AddWorkTeamResponse {
    status: string;
    error: string;
  }

  /** 更新工作团队响应 */
  export interface UpdateWorkTeamResponse {
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
  const token = 'f438aa4e6ec2436a8b6adf70f0062670';
  // 根据是否有搜索条件动态选择API
  const apiUrl = params.TDFZR
    ? '/api/web/getAllWorkTeam'
    : '/api/web/getWorkTeamBaseView';
  return requestClient.get<WorkTeamApi.WorkTeamListResponse>(apiUrl, {
    params: {
      ...params,
      token,
    },
  });
}

/**
 * 添加工作团队
 */
export async function addWorkTeamApi(data: WorkTeamApi.AddWorkTeamRequest) {
  const token = 'f438aa4e6ec2436a8b6adf70f0062670';
  return requestClient.post<WorkTeamApi.AddWorkTeamResponse>(
    '/api/web/addWorkTeam',
    [data],
    {
      params: {
        token,
      },
    },
  );
}

/**
 * 更新工作团队
 */
export async function update1(data: WorkTeamApi.UpdateWorkTeamRequest) {
  const token = 'f438aa4e6ec2436a8b6adf70f0062670';
  
  // 确保只传递后端需要的参数
  const filteredData = {
    // 必须的参数
    SEP_EUSER: data.SEP_EUSER,
    SEP_EDATE: data.SEP_EDATE,
    OperateType: data.OperateType,
    
    // 可选参数，只传递存在的值
    ...(data.SEP_ID && { SEP_ID: data.SEP_ID }),
    ...(data.SEP_LD && { SEP_LD: data.SEP_LD }),
    ...(data.TDFZR && { TDFZR: data.TDFZR }),
    ...(data.ZHZCY && { ZHZCY: data.ZHZCY }),
    ...(data.CXZCY && { CXZCY: data.CXZCY }),
    ...(data.CCGLZCY && { CCGLZCY: data.CCGLZCY }),
    ...(data.ZQSHZCY && { ZQSHZCY: data.ZQSHZCY }),
    ...(data.LDRSZCY && { LDRSZCY: data.LDRSZCY }),
    ...(data.ZZQLZCY && { ZZQLZCY: data.ZZQLZCY }),
    ...(data.ZT !== undefined && { ZT: data.ZT }),
    ...(data.JHLX && { JHLX: data.JHLX }),
    ...(data.JHNR && { JHNR: data.JHNR }),
    ...(data.KSRQ && { KSRQ: data.KSRQ }),
    ...(data.JSRQ && { JSRQ: data.JSRQ }),
    ...(data.FZR && { FZR: data.FZR }),
    ...(data.ZDLX && { ZDLX: data.ZDLX }),
    ...(data.ZDMC && { ZDMC: data.ZDMC }),
    ...(data.ZDNR && { ZDNR: data.ZDNR }),
    ...(data.SXRQ && { SXRQ: data.SXRQ }),
    ...(data.YZLX && { YZLX: data.YZLX }),
    ...(data.YZBH && { YZBH: data.YZBH }),
    ...(data.YZYBLJ && { YZYBLJ: data.YZYBLJ }),
    ...(data.BARQ && { BARQ: data.BARQ }),
    ...(data.YZMC && { YZMC: data.YZMC }),
    ...(data.CXLX && { CXLX: data.CXLX }),
    ...(data.CXNR && { CXNR: data.CXNR }),
    ...(data.ZHRQ && { ZHRQ: data.ZHRQ }),
  };
  
  return requestClient.post<WorkTeamApi.UpdateWorkTeamResponse>(
    '/api/web/update1',
    filteredData,
    {
      params: {
        token,
      },
    },
  );
}
