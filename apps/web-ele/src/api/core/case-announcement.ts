import { requestClient } from '#/api/request';

export namespace CaseAnnouncementApi {
  /** 案件公告信息 */
  export interface CaseAnnouncementInfo {
    announcementId: number;
    caseId: number;
    caseNo: string;
    caseName: string;
    title: string;
    content: string;
    publishDate: string;
    status: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
  }

  /** 案件公告列表响应 */
  export interface CaseAnnouncementListResponse {
    data: {
      count: number;
      pages: number;
      records: CaseAnnouncementInfo[];
    };
    code: number;
    message: string;
  }

  /** 案件公告响应 */
  export interface CaseAnnouncementResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取案件公告列表
 */
export async function getCaseAnnouncementListApi() {
  return requestClient.get<CaseAnnouncementApi.CaseAnnouncementListResponse>('/case-announcements');
}

/**
 * 获取案件公告详情
 */
export async function getCaseAnnouncementDetailApi() {
  return requestClient.get<CaseAnnouncementApi.CaseAnnouncementInfo>('/case-announcements');
}

/**
 * 新增案件公告
 */
export async function addCaseAnnouncementApi() {
  return requestClient.post<CaseAnnouncementApi.CaseAnnouncementResponse>('/case-announcements');
}

/**
 * 更新案件公告
 */
export async function updateCaseAnnouncementApi() {
  return requestClient.put<CaseAnnouncementApi.CaseAnnouncementResponse>('/case-announcements');
}

/**
 * 删除案件公告
 */
export async function deleteCaseAnnouncementApi() {
  return requestClient.delete<CaseAnnouncementApi.CaseAnnouncementResponse>('/case-announcements');
}
