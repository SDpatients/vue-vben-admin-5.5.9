import http from './request'

export namespace WorkTeamApi {
  export type TeamStatus = 'ACTIVE' | 'DELETED' | 'INACTIVE'
  export type PermissionLevel = 'ADMIN' | 'EDIT' | 'VIEW'
  export type IsActive = 0 | 1

  export interface WorkTeamQueryParams {
    pageNum?: number
    pageSize?: number
    caseId?: number
    status?: TeamStatus
    teamName?: string
    teamLeaderId?: number
  }

  export interface WorkTeamInfo {
    id: number
    teamName: string
    teamLeaderId: number
    teamLeaderName?: string
    caseId: number
    caseName?: string
    caseNumber?: string
    teamDescription?: string
    status: TeamStatus
    createTime: string
    updateTime?: string
    memberCount?: number
    teamMembers?: string
    creator?: string
    members?: TeamMemberInfo[]
    membersLoading?: boolean
  }

  export interface WorkTeamListResponse {
    code: number
    message: string
    data: {
      list: WorkTeamInfo[]
      total: number
    }
  }

  export interface WorkTeamDetailResponse {
    code: number
    message: string
    data: WorkTeamInfo
    members?: TeamMemberInfo[]
    roles?: TeamRoleInfo[]
  }

  export interface CreateWorkTeamRequest {
    teamName: string
    teamLeaderId: number
    caseId: number
    teamDescription?: string
  }

  export interface CreateWorkTeamResponse {
    code: number
    message: string
    data: {
      teamId: number
    }
  }

  export interface UpdateWorkTeamRequest {
    teamName?: string
    teamDescription?: string
    status?: TeamStatus
  }

  export interface UpdateWorkTeamResponse {
    code: number
    message: string
    data: null
  }

  export interface TeamMemberInfo {
    id: number
    teamId: number
    caseId: number
    userId: number
    userName?: string
    userRealName?: string
    teamRole?: string
    permissionLevel?: PermissionLevel
    isActive: IsActive
    status: TeamStatus
    createTime: string
    updateTime?: string
    permissions?: MemberPermissionInfo[]
  }

  export interface TeamMemberListResponse {
    code: number
    message: string
    data: TeamMemberInfo[]
  }

  export interface AddTeamMemberRequest {
    caseId: number
    userId: number[]
    teamRole: string
    permissionLevel?: PermissionLevel
  }

  export interface AddTeamMemberResponse {
    code: number
    message: string
    data: {
      memberId: number
    }
  }

  export interface UpdateTeamMemberRequest {
    teamRole?: string
    permissionLevel?: PermissionLevel
    isActive?: IsActive
  }

  export interface RemoveTeamMemberResponse {
    code: number
    message: string
    data: null
  }

  export interface MemberPermissionInfo {
    id: number
    teamMemberId: number
    moduleType: string
    permissionType: string
    isAllowed: IsActive
    status: TeamStatus
    createTime: string
    updateTime?: string
  }

  export interface MemberPermissionListResponse {
    code: number
    message: string
    data: MemberPermissionInfo[]
  }

  export interface TeamRoleInfo {
    id: number
    roleName: string
    roleCode?: string
    roleDescription?: string
    status: TeamStatus
    createTime: string
  }

  export interface TeamRoleListResponse {
    code: number
    message: string
    data: TeamRoleInfo[]
  }

  export interface CommonResponse {
    code: number
    message: string
    data: null
  }
}

export function getWorkTeamListApi(params: WorkTeamApi.WorkTeamQueryParams = {}) {
  return http.get<WorkTeamApi.WorkTeamListResponse>('/work-team/list', params)
}

export function getWorkTeamListWithDetailsApi(params: WorkTeamApi.WorkTeamQueryParams = {}) {
  return http.get<WorkTeamApi.WorkTeamListResponse>('/work-team/list/details', params)
}

export function getWorkTeamDetailApi(teamId: number) {
  return http.get<WorkTeamApi.WorkTeamDetailResponse>(`/work-team/${teamId}`)
}

export function getWorkTeamDetailWithMembersApi(teamId: number) {
  return http.get<WorkTeamApi.WorkTeamDetailResponse>(`/work-team/${teamId}/detail`)
}

export function createWorkTeamApi(data: WorkTeamApi.CreateWorkTeamRequest) {
  return http.post<WorkTeamApi.CreateWorkTeamResponse>('/work-team', data)
}

export function updateWorkTeamApi(teamId: number, data: WorkTeamApi.UpdateWorkTeamRequest) {
  return http.put<WorkTeamApi.UpdateWorkTeamResponse>(`/work-team/${teamId}`, data)
}

export function deleteWorkTeamApi(teamId: number) {
  return http.delete<WorkTeamApi.CommonResponse>(`/work-team/${teamId}`)
}

export function addTeamMemberApi(teamId: number, data: WorkTeamApi.AddTeamMemberRequest) {
  return http.post<WorkTeamApi.AddTeamMemberResponse>(`/work-team/${teamId}/member`, data)
}

export function getTeamMembersApi(teamId: number) {
  return http.get<WorkTeamApi.TeamMemberListResponse>(`/work-team/${teamId}/members`)
}

export function updateTeamMemberApi(memberId: number, data: WorkTeamApi.UpdateTeamMemberRequest) {
  return http.put<WorkTeamApi.CommonResponse>(`/work-team/member/${memberId}`, data)
}

export function removeTeamMemberApi(memberId: number) {
  return http.delete<WorkTeamApi.RemoveTeamMemberResponse>(`/work-team/member/${memberId}`)
}

export function getMemberPermissionsApi(memberId: number) {
  return http.get<WorkTeamApi.MemberPermissionListResponse>(`/work-team/work-team-member/${memberId}/permissions`)
}

// 团队角色列表为静态配置，不从后端获取
export const teamRolesList: WorkTeamApi.TeamRoleInfo[] = [
  { id: 1, roleName: '团队负责人', roleCode: 'LEADER', status: 'ACTIVE', createTime: '' },
  { id: 2, roleName: '团队成员', roleCode: 'MEMBER', status: 'ACTIVE', createTime: '' },
]

// 获取团队角色列表（返回静态数据）
export function getTeamRolesApi() {
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: teamRolesList,
  })
}

export function getTeamMembersByCaseIdApi(caseId: number) {
  return http.get<WorkTeamApi.TeamMemberListResponse>('/work-team/members/by-case', { caseId })
}
