import { workTeamRequestClient } from '#/api/request';

export namespace WorkTeamApi {
  /** 团队状态枚举 */
  export type TeamStatus = 'ACTIVE' | 'DELETED' | 'INACTIVE';

  /** 权限级别枚举 */
  export type PermissionLevel = 'ADMIN' | 'EDIT' | 'VIEW';

  /** 成员激活状态 */
  export type IsActive = 0 | 1;

  /** 工作团队查询参数 */
  export interface WorkTeamQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    status?: TeamStatus;
    teamName?: string;
    teamLeaderId?: number;
  }

  /** 工作团队信息 */
  export interface WorkTeamInfo {
    id: number;
    teamName: string;
    teamLeaderId: number;
    teamLeaderName?: string;
    caseId: number;
    caseName?: string;
    caseNumber?: string;
    teamDescription?: string;
    status: TeamStatus;
    createTime: string;
    updateTime?: string;
    memberCount?: number;
    teamMembers?: string;
    creator?: string;
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

  /** 创建工作团队请求 */
  export interface CreateWorkTeamRequest {
    teamName: string;
    teamLeaderId: number;
    caseId: number;
    teamDescription?: string;
  }

  /** 创建工作团队响应 */
  export interface CreateWorkTeamResponse {
    code: number;
    message: string;
    data: {
      teamId: number;
    };
  }

  /** 更新工作团队请求 */
  export interface UpdateWorkTeamRequest {
    teamName?: string;
    teamDescription?: string;
    status?: TeamStatus;
  }

  /** 更新工作团队响应 */
  export interface UpdateWorkTeamResponse {
    code: number;
    message: string;
    data: null;
  }

  /** 团队成员信息 */
  export interface TeamMemberInfo {
    id: number;
    teamId: number;
    caseId: number;
    userId: number;
    userName?: string;
    userRealName?: string;
    teamRole?: string;
    permissionLevel?: PermissionLevel;
    isActive: IsActive;
    status: TeamStatus;
    createTime: string;
    updateTime?: string;
    permissions?: MemberPermissionInfo[];
  }

  /** 团队成员列表响应 */
  export interface TeamMemberListResponse {
    code: number;
    message: string;
    data: TeamMemberInfo[];
  }

  /** 添加团队成员请求 */
  export interface AddTeamMemberRequest {
    caseId: number;
    userId: number;
    teamRole: string;
    permissionLevel?: PermissionLevel;
  }

  /** 添加团队成员响应 */
  export interface AddTeamMemberResponse {
    code: number;
    message: string;
    data: {
      memberId: number;
    };
  }

  /** 成员权限信息 */
  export interface MemberPermissionInfo {
    id: number;
    teamMemberId: number;
    moduleType: string;
    permissionType: string;
    isAllowed: IsActive;
    status: TeamStatus;
    createTime: string;
    updateTime?: string;
  }

  /** 成员权限列表响应 */
  export interface MemberPermissionListResponse {
    code: number;
    message: string;
    data: MemberPermissionInfo[];
  }

  /** 更新成员权限请求 */
  export interface UpdateMemberPermissionRequest {
    permissionLevel: PermissionLevel;
  }

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
    code: number;
    message: string;
    data: WorkTeamDetail;
  }

  /** 通用响应 */
  export interface CommonResponse {
    code: number;
    message: string;
    data: null;
  }
}

/**
 * 创建工作团队
 * POST /work-team
 */
export async function createWorkTeamApi(
  data: WorkTeamApi.CreateWorkTeamRequest,
) {
  return workTeamRequestClient.post<WorkTeamApi.CreateWorkTeamResponse>(
    '/work-team',
    data,
  );
}

/**
 * 工作团队列表（分页）
 * GET /work-team/list
 */
export async function getWorkTeamListApi(
  params: WorkTeamApi.WorkTeamQueryParams = {},
) {
  return workTeamRequestClient.get<WorkTeamApi.WorkTeamListResponse>(
    '/work-team/list',
    { params },
  );
}

/**
 * 工作团队列表（分页，包含详细信息）
 * GET /work-team/list/details
 */
export async function getWorkTeamListWithDetailsApi(
  params: WorkTeamApi.WorkTeamQueryParams = {},
) {
  return workTeamRequestClient.get<WorkTeamApi.WorkTeamListResponse>(
    '/work-team/list/details',
    { params },
  );
}

/**
 * 获取工作团队详情
 * GET /work-team/{teamId}
 */
export async function getWorkTeamDetailApi(teamId: number) {
  return workTeamRequestClient.get<WorkTeamApi.WorkTeamDetailResponse>(
    `/work-team/${teamId}`,
  );
}

/**
 * 获取工作团队详情（包含成员和权限）
 * GET /work-team/{teamId}/detail
 */
export async function getWorkTeamDetailWithMembersApi(teamId: number) {
  return workTeamRequestClient.get<WorkTeamApi.WorkTeamDetailResponse>(
    `/work-team/${teamId}/detail`,
  );
}

/**
 * 更新工作团队信息
 * PUT /work-team/{teamId}
 */
export async function updateWorkTeamApi(
  teamId: number,
  data: WorkTeamApi.UpdateWorkTeamRequest,
) {
  return workTeamRequestClient.put<WorkTeamApi.UpdateWorkTeamResponse>(
    `/work-team/${teamId}`,
    data,
  );
}

/**
 * 删除工作团队
 * DELETE /work-team/{teamId}
 */
export async function deleteWorkTeamApi(teamId: number) {
  return workTeamRequestClient.delete<WorkTeamApi.CommonResponse>(
    `/work-team/${teamId}`,
  );
}

/**
 * 添加团队成员
 * POST /work-team/{teamId}/member
 */
export async function addTeamMemberApi(
  teamId: number,
  data: WorkTeamApi.AddTeamMemberRequest,
) {
  return workTeamRequestClient.post<WorkTeamApi.AddTeamMemberResponse>(
    `/work-team/${teamId}/member`,
    data,
  );
}

/**
 * 团队成员列表
 * GET /work-team/{teamId}/members
 */
export async function getTeamMembersApi(teamId: number) {
  return workTeamRequestClient.get<WorkTeamApi.TeamMemberListResponse>(
    `/work-team/${teamId}/members`,
  );
}

/**
 * 移除团队成员
 * DELETE /work-team/{teamId}/member/{memberId}
 */
export async function removeTeamMemberApi(teamId: number, memberId: number) {
  return workTeamRequestClient.delete<WorkTeamApi.CommonResponse>(
    `/work-team/${teamId}/member/${memberId}`,
  );
}

/**
 * 删除团队成员
 * DELETE /work-team/work-team-member/{memberId}
 */
export async function deleteTeamMemberApi(memberId: number) {
  return workTeamRequestClient.delete<WorkTeamApi.CommonResponse>(
    `/work-team/work-team-member/${memberId}`,
  );
}

/**
 * 获取团队成员权限
 * GET /work-team/work-team-member/{memberId}/permissions
 */
export async function getMemberPermissionsApi(memberId: number) {
  return workTeamRequestClient.get<WorkTeamApi.MemberPermissionListResponse>(
    `/work-team/work-team-member/${memberId}/permissions`,
  );
}

/**
 * 更新团队成员权限
 * PUT /work-team/member/{memberId}/permission
 */
export async function updateMemberPermissionApi(
  memberId: number,
  data: WorkTeamApi.UpdateMemberPermissionRequest & { permissionType: string },
) {
  return workTeamRequestClient.put<WorkTeamApi.CommonResponse>(
    `/work-team/member/${memberId}/permission`,
    data,
  );
}

/**
 * 分配团队成员权限
 * POST /work-team/member/{memberId}/permissions
 */
export async function assignMemberPermissionsApi(
  memberId: number,
  data: WorkTeamApi.AssignMemberPermissionsRequest,
) {
  return workTeamRequestClient.post<WorkTeamApi.CommonResponse>(
    `/work-team/member/${memberId}/permissions`,
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
  return workTeamRequestClient.get<{
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
  return workTeamRequestClient.get<{
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
