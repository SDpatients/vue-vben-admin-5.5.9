import { requestClient } from '#/api/request';

export namespace ApprovalApi {
  /** 审批信息 */
  export interface ApprovalInfo {
    approvalId: number;
    approvalType: string;
    approvalTitle: string;
    approvalContent: string;
    approvalStatus: string;
    createTime: string;
    updateTime: string;
    createUser: string;
    updateUser: string;
    approvalHistory?: {
      approvalComment: string;
      approvalId: number;
      approvalStatus: string;
      approvalTime: string;
      approvalUser: string;
      historyId: number;
    }[];
  }

  /** 审批列表响应 */
  export interface ApprovalListResponse {
    data: {
      count: number;
      pages: number;
      records: ApprovalInfo[];
    };
    code: number;
    message: string;
  }

  /** 审批响应 */
  export interface ApprovalResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取审批列表
 */
export async function getApprovalListApi() {
  return requestClient.get<ApprovalApi.ApprovalListResponse>('/approvals');
}

/**
 * 获取审批详情
 */
export async function getApprovalDetailApi() {
  return requestClient.get<ApprovalApi.ApprovalInfo>('/approvals');
}

/**
 * 提交审批
 */
export async function submitApprovalApi() {
  return requestClient.post<ApprovalApi.ApprovalResponse>('/approvals');
}

/**
 * 审批操作
 */
export async function approvalOperationApi() {
  return requestClient.put<ApprovalApi.ApprovalResponse>(
    '/approvals/operation',
  );
}
