import { requestClient8085 } from '#/api/request';

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
    OperateType: number | string;

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
    ZT?: number | string;
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

  /** 团队成员信息 */
  export interface TeamMemberInfo {
    id: number;
    caseId: number;
    userId: number;
    userName: string;
    userCode: string;
    teamRole: string;
    teamRoleName: string;
    permissionLevel: string;
    isActive: boolean;
  }

  /** 团队成员列表响应 */
  export interface TeamMemberListResponse {
    code: number;
    message: string;
    data: TeamMemberInfo[];
  }

  /** 设置团队成员请求 */
  export interface SetTeamMembersRequest {
    caseId: number;
    members: {
      userId: number;
      roleId: number;
    }[];
    permissions?: {
      memberId: number;
      moduleType: string;
      permissionType: string;
      isAllowed: boolean;
    }[];
  }

  /** 添加团队成员请求 */
  export interface AddTeamMemberRequest {
    caseId: number;
    userId: number;
    roleId: number;
  }

  /** 更新团队成员请求 */
  export interface UpdateTeamMemberRequest {
    id: number;
    caseId: number;
    userId: number;
    roleId: number;
  }

  /** 团队角色信息 */
  export interface TeamRoleInfo {
    roleCode: string;
    roleName: string;
    roleDesc: string;
    sortOrder: number;
    status: string;
  }

  /** 团队角色列表响应 */
  export interface TeamRoleListResponse {
    code: number;
    message: string;
    data: TeamRoleInfo[];
  }

  /** 成员权限信息 */
  export interface MemberPermissionInfo {
    id: number;
    teamMemberId: number;
    moduleType: string;
    permissionType: string;
    isAllowed: boolean;
  }

  /** 保存成员权限请求 */
  export interface SaveMemberPermissionsRequest {
    memberId: number;
    permissions: {
      moduleType: string;
      permissionType: string;
      isAllowed: boolean;
    }[];
  }

  /** 成员权限列表响应 */
  export interface MemberPermissionListResponse {
    code: number;
    message: string;
    data: MemberPermissionInfo[];
  }

  /** 可访问案件信息 */
  export interface AccessibleCaseInfo {
    sepId: number;
    ah: string;
    ajmc: string;
    creatorId: number;
    slfy: string;
  }

  /** 可访问案件列表响应 */
  export interface AccessibleCaseListResponse {
    code: number;
    message: string;
    data: AccessibleCaseInfo[];
  }

  /** 我的团队成员信息响应 */
  export interface MyTeamMemberInfoResponse {
    code: number;
    message: string;
    data: {
      id: number;
      caseId: number;
      userId: number;
      teamRole: string;
      teamRoleName: string;
      permissionLevel: string;
      isActive: boolean;
    };
  }

  /** 权限检查响应 */
  export interface PermissionCheckResponse {
    code: number;
    message: string;
    data: boolean;
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
  return requestClient8085.get<WorkTeamApi.WorkTeamListResponse>(apiUrl, {
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
  return requestClient8085.post<WorkTeamApi.AddWorkTeamResponse>(
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

  return requestClient8085.post<WorkTeamApi.UpdateWorkTeamResponse>(
    '/api/web/update1',
    filteredData,
    {
      params: {
        token,
      },
    },
  );
}

/**
 * 设置团队成员（批量）
 */
export async function setTeamMembersApi(
  data: WorkTeamApi.SetTeamMembersRequest,
) {
  return requestClient8085.post('/api/web/workteam/setTeamMembers', data);
}

/**
 * 获取团队成员列表
 */
export async function getTeamMembersApi(caseId: number) {
  return requestClient8085.get<WorkTeamApi.TeamMemberListResponse>(
    '/api/web/workteam/getTeamMembers',
    {
      params: { caseId },
    },
  );
}

/**
 * 获取激活的团队成员
 */
export async function getActiveTeamMembersApi(caseId: number) {
  return requestClient8085.get<WorkTeamApi.TeamMemberListResponse>(
    '/api/web/workteam/getActiveTeamMembers',
    {
      params: { caseId },
    },
  );
}

/**
 * 添加团队成员
 */
export async function addTeamMemberApi(
  data: WorkTeamApi.AddTeamMemberRequest,
) {
  return requestClient8085.post('/api/web/workteam/addTeamMember', data);
}

/**
 * 更新团队成员
 */
export async function updateTeamMemberApi(
  data: WorkTeamApi.UpdateTeamMemberRequest,
) {
  return requestClient8085.post('/api/web/workteam/updateTeamMember', data);
}

/**
 * 移除团队成员
 */
export async function removeTeamMemberApi(memberId: number) {
  return requestClient8085.post('/api/web/workteam/removeTeamMember', null, {
    params: { memberId },
  });
}

/**
 * 获取可访问的案件列表
 */
export async function getMyAccessibleCasesApi() {
  return requestClient8085.get<WorkTeamApi.AccessibleCaseListResponse>(
    '/api/web/workteam/getMyAccessibleCases',
  );
}

/**
 * 获取所有团队角色
 */
export async function getAllTeamRolesApi() {
  return requestClient8085.get<WorkTeamApi.TeamRoleListResponse>(
    '/api/web/workteam/getAllTeamRoles',
  );
}

/**
 * 获取激活的团队角色
 */
export async function getActiveTeamRolesApi() {
  return requestClient8085.get<WorkTeamApi.TeamRoleListResponse>(
    '/api/web/workteam/getActiveTeamRoles',
  );
}

/**
 * 保存成员权限（细粒度）
 */
export async function saveMemberPermissionsApi(
  data: WorkTeamApi.SaveMemberPermissionsRequest,
) {
  return requestClient8085.post('/api/web/workteam/saveMemberPermissions', data);
}

/**
 * 获取成员权限
 */
export async function getMemberPermissionsApi(memberId: number) {
  return requestClient8085.get<WorkTeamApi.MemberPermissionListResponse>(
    '/api/web/workteam/getMemberPermissions',
    {
      params: { memberId },
    },
  );
}

/**
 * 检查案件访问权限
 */
export async function canAccessCaseApi(
  caseId: number,
  permission: string = 'VIEW',
) {
  return requestClient8085.get<WorkTeamApi.PermissionCheckResponse>(
    '/api/web/workteam/canAccessCase',
    {
      params: { caseId, permission },
    },
  );
}

/**
 * 获取我的团队成员信息
 */
export async function getMyTeamMemberInfoApi(caseId: number) {
  return requestClient8085.get<WorkTeamApi.MyTeamMemberInfoResponse>(
    '/api/web/getMyTeamMemberInfo',
    {
      params: { caseId },
    },
  );
}

/**
 * 检查案件权限
 */
export async function checkCasePermissionApi(
  caseId: number,
  permission: string = 'VIEW',
) {
  return requestClient8085.get<WorkTeamApi.PermissionCheckResponse>(
    '/api/web/checkCasePermission',
    {
      params: { caseId, permission },
    },
  );
}

/**
 * 查询我的案件
 */
export async function selectMyCasesApi(page: number = 1, size: number = 10) {
  return requestClient8085.get('/api/web/selectMyCases', {
    params: { page, size },
  });
}

/**
 * 查询团队案件
 */
export async function selectTeamCasesApi(page: number = 1, size: number = 10) {
  return requestClient8085.get('/api/web/selectTeamCases', {
    params: { page, size },
  });
}
