import { requestClient8085 } from '#/api/request';

export namespace WorkTeamApi {
<<<<<<< Updated upstream
=======
  /** 团队状态枚举 */
  export type TeamStatus = 'ACTIVE' | 'DELETED' | 'INACTIVE';

  /** 权限级别枚举 */
  export type PermissionLevel = 'ADMIN' | 'EDIT' | 'VIEW';

  /** 成员激活状态 */
  export type IsActive = 0 | 1;

>>>>>>> Stashed changes
  /** 工作团队查询参数 */
  export interface WorkTeamQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    status?: string;
    teamName?: string;
    teamLeaderId?: number;
  }

  /** 案件信息 */
  export interface CaseInfo {
    id: number;
    caseNumber: string;
    caseName: string;
  }

  /** 案件列表查询参数 */
  export interface CaseListQueryParams {
    page?: number;
    size?: number;
    caseNumber?: string;
  }

  /** 案件列表响应 */
  export interface CaseListResponse {
    code: number;
    message: string;
    data: {
      list: CaseInfo[];
      total: number;
    };
  }

  /** 工作团队信息 */
  export interface WorkTeamInfo {
    id: number;
    teamName: string;
    teamLeaderId: number;
    teamLeaderName: string;
    caseId: number;
    caseName: string;
    teamDescription: string;
    status: string;
    createTime: string;
    updateTime?: string;
    memberCount: number;
    // 关联信息
    caseNumber?: string; // 案号
    teamMembers?: string; // 团队成员
    creator?: string; // 创建者
  }

  /** 工作团队列表响应 */
  export interface WorkTeamListResponse {
    code: number;
    message: string;
    data: {
      list: WorkTeamInfo[];
      total: number;
    };
  }

  /** 添加工作团队请求参数 */
  export interface AddWorkTeamRequest {
    teamName: string; // 团队名称
    teamLeaderId: number; // 团队负责人ID
    caseId: number; // 案件ID
    teamDescription?: string; // 团队描述
    memberArray?: number[]; // 团队成员
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
    code: number;
    message: string;
    data: {
      teamId: number;
    };
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
      roleId: number;
      userId: number;
    }[];
    permissions?: {
      isAllowed: boolean;
      memberId: number;
      moduleType: string;
      permissionType: string;
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
      isAllowed: boolean;
      moduleType: string;
      permissionType: string;
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

<<<<<<< Updated upstream
  /** 可访问案件列表响应 */
  export interface AccessibleCaseListResponse {
=======
  /** 分配成员权限请求 */
  export interface AssignMemberPermissionsRequest {
    permissions: {
      isAllowed: IsActive;
      moduleType: string;
      permissionType: string;
    }[];
  }

  /** 工作团队详情（包含成员和权限） */
  export interface WorkTeamDetail {
    id: number;
    teamName: string;
    teamLeaderId: number;
    teamLeaderName?: string;
    caseId: number;
    caseName?: string;
    teamDescription?: string;
    status: TeamStatus;
    createTime: string;
    updateTime?: string;
    members?: TeamMemberInfo[];
  }

  /** 工作团队详情响应 */
  export interface WorkTeamDetailResponse {
>>>>>>> Stashed changes
    code: number;
    message: string;
    data: AccessibleCaseInfo[];
  }

  /** 我的团队成员信息响应 */
  export interface MyTeamMemberInfoResponse {
    code: number;
    message: string;
    data: {
      caseId: number;
      id: number;
      isActive: boolean;
      permissionLevel: string;
      teamRole: string;
      teamRoleName: string;
      userId: number;
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
 * 获取工作团队列表（包含详细信息）
 */
<<<<<<< Updated upstream
export async function getWorkTeamListApi(
  params: WorkTeamApi.WorkTeamQueryParams,
) {
  return requestClient8085.get<WorkTeamApi.WorkTeamListResponse>(
    '/work-team/list/details',
    {
      params,
    },
=======
export async function createWorkTeamApi(
  data: WorkTeamApi.CreateWorkTeamRequest,
) {
  return requestClient8085.post<WorkTeamApi.CreateWorkTeamResponse>(
    '/work-team',
    data,
>>>>>>> Stashed changes
  );
}

/**
 * 添加工作团队
 */
<<<<<<< Updated upstream
export async function addWorkTeamApi(data: WorkTeamApi.AddWorkTeamRequest) {
  return requestClient8085.post<WorkTeamApi.AddWorkTeamResponse>(
    '/work-team',
    data,
=======
export async function getWorkTeamListApi(
  params: WorkTeamApi.WorkTeamQueryParams = {},
) {
  return requestClient8085.get<WorkTeamApi.WorkTeamListResponse>(
    '/work-team/list',
    { params },
>>>>>>> Stashed changes
  );
}

/**
 * 更新工作团队
 */
<<<<<<< Updated upstream
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
=======
export async function getWorkTeamListWithDetailsApi(
  params: WorkTeamApi.WorkTeamQueryParams = {},
) {
  return requestClient8085.get<WorkTeamApi.WorkTeamListResponse>(
    '/work-team/list/details',
    { params },
>>>>>>> Stashed changes
  );
}

/**
 * 设置团队成员（批量）
 */
<<<<<<< Updated upstream
export async function setTeamMembersApi(
  data: WorkTeamApi.SetTeamMembersRequest,
) {
  return requestClient8085.post('/api/web/workteam/setTeamMembers', data);
=======
export async function getWorkTeamDetailApi(teamId: number) {
  return requestClient8085.get<WorkTeamApi.WorkTeamDetailResponse>(
    `/work-team/${teamId}`,
  );
>>>>>>> Stashed changes
}

/**
 * 获取团队成员列表
 */
<<<<<<< Updated upstream
export async function getTeamMembersApi(caseId: number) {
  return requestClient8085.get<WorkTeamApi.TeamMemberListResponse>(
    '/api/web/workteam/getTeamMembers',
    {
      params: { caseId },
    },
=======
export async function getWorkTeamDetailWithMembersApi(teamId: number) {
  return requestClient8085.get<WorkTeamApi.WorkTeamDetailResponse>(
    `/work-team/${teamId}/detail`,
>>>>>>> Stashed changes
  );
}

/**
 * 获取激活的团队成员
 */
<<<<<<< Updated upstream
export async function getActiveTeamMembersApi(caseId: number) {
  return requestClient8085.get<WorkTeamApi.TeamMemberListResponse>(
    '/api/web/workteam/getActiveTeamMembers',
    {
      params: { caseId },
    },
=======
export async function updateWorkTeamApi(
  teamId: number,
  data: WorkTeamApi.UpdateWorkTeamRequest,
) {
  return requestClient8085.put<WorkTeamApi.UpdateWorkTeamResponse>(
    `/work-team/${teamId}`,
    data,
  );
}

/**
 * 删除工作团队
 * DELETE /work-team/{teamId}
 */
export async function deleteWorkTeamApi(teamId: number) {
  return requestClient8085.delete<WorkTeamApi.CommonResponse>(
    `/work-team/${teamId}`,
>>>>>>> Stashed changes
  );
}

/**
 * 添加团队成员
 */
<<<<<<< Updated upstream
export async function addTeamMemberApi(data: WorkTeamApi.AddTeamMemberRequest) {
  return requestClient8085.post('/api/web/workteam/addTeamMember', data);
=======
export async function addTeamMemberApi(
  teamId: number,
  data: WorkTeamApi.AddTeamMemberRequest,
) {
  return requestClient8085.post<WorkTeamApi.AddTeamMemberResponse>(
    `/work-team/${teamId}/member`,
    data,
  );
>>>>>>> Stashed changes
}

/**
 * 更新团队成员
 */
<<<<<<< Updated upstream
export async function updateTeamMemberApi(
  data: WorkTeamApi.UpdateTeamMemberRequest,
) {
  return requestClient8085.post('/api/web/workteam/updateTeamMember', data);
=======
export async function getTeamMembersApi(teamId: number) {
  return requestClient8085.get<WorkTeamApi.TeamMemberListResponse>(
    `/work-team/${teamId}/members`,
  );
>>>>>>> Stashed changes
}

/**
 * 移除团队成员
 */
<<<<<<< Updated upstream
export async function removeTeamMemberApi(memberId: number) {
  return requestClient8085.post('/api/web/workteam/removeTeamMember', null, {
    params: { memberId },
  });
=======
export async function removeTeamMemberApi(teamId: number, memberId: number) {
  return requestClient8085.delete<WorkTeamApi.CommonResponse>(
    `/work-team/${teamId}/member/${memberId}`,
  );
>>>>>>> Stashed changes
}

/**
 * 获取可访问的案件列表
 */
<<<<<<< Updated upstream
export async function getMyAccessibleCasesApi() {
  return requestClient8085.get<WorkTeamApi.AccessibleCaseListResponse>(
    '/api/web/workteam/getMyAccessibleCases',
=======
export async function deleteTeamMemberApi(memberId: number) {
  return requestClient8085.delete<WorkTeamApi.CommonResponse>(
    `/work-team/work-team-member/${memberId}`,
>>>>>>> Stashed changes
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
  return requestClient8085.post(
    '/api/web/workteam/saveMemberPermissions',
    data,
  );
}

/**
 * 获取成员权限
 */
export async function getMemberPermissionsApi(memberId: number) {
  return requestClient8085.get<WorkTeamApi.MemberPermissionListResponse>(
<<<<<<< Updated upstream
    '/api/web/workteam/getMemberPermissions',
    {
      params: { memberId },
    },
=======
    `/work-team/work-team-member/${memberId}/permissions`,
>>>>>>> Stashed changes
  );
}

/**
 * 检查案件访问权限
 */
<<<<<<< Updated upstream
export async function canAccessCaseApi(
  caseId: number,
  permission: string = 'VIEW',
) {
  return requestClient8085.get<WorkTeamApi.PermissionCheckResponse>(
    '/api/web/workteam/canAccessCase',
    {
      params: { caseId, permission },
    },
=======
export async function updateMemberPermissionApi(
  memberId: number,
  data: WorkTeamApi.UpdateMemberPermissionRequest,
) {
  return requestClient8085.put<WorkTeamApi.CommonResponse>(
    `/work-team/work-team-member/${memberId}/permission`,
    data,
>>>>>>> Stashed changes
  );
}

/**
 * 获取我的团队成员信息
 */
<<<<<<< Updated upstream
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

/**
 * 获取案件列表
 */
export async function getCaseListApi(params: WorkTeamApi.CaseListQueryParams) {
  return requestClient8085.get<WorkTeamApi.CaseListResponse>(
    '/case/simple-list',
    {
      params,
    },
  );
}
=======
export async function assignMemberPermissionsApi(
  memberId: number,
  data: WorkTeamApi.AssignMemberPermissionsRequest,
) {
  return requestClient8085.post<WorkTeamApi.CommonResponse>(
    `/work-team/work-team-member/${memberId}/permissions`,
    data,
  );
}

// 获取我的案件列表
// GET /case/user/{userId}/list
export async function selectMyCasesApi(
  userId: number,
  pageNum: number,
  pageSize: number,
) {
  return requestClient8085.get<{
    code: number;
    data: {
      list: any[];
      total: number;
    };
    message: string;
  }>(`/case/user/${userId}/list`, {
    params: { pageNum, pageSize },
  });
}

// 获取团队案件列表
// GET /work-team/list
export async function selectTeamCasesApi(pageNum: number, pageSize: number) {
  return requestClient8085.get<{
    code: number;
    data: {
      list: any[];
      total: number;
    };
    message: string;
  }>('/work-team/list', {
    params: { pageNum, pageSize, status: 'ACTIVE' },
  });
}

export type { WorkTeamApi };
>>>>>>> Stashed changes
