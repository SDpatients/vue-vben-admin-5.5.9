/**
 * 案件节点管理 API
 * 基础路径: /api/v1/case-nodes
 */

import { requestClient } from '#/api/request';
import { getUserCaseListApi } from '#/api/core/case';

export namespace CaseNodeApi {
  export type CaseType = 'COMMON' | 'LIQUIDATION' | 'REORGANIZATION' | 'COMPROMISE';
  export type CaseStage = 'ACCEPTANCE' | 'DECLARATION' | 'MEETING' | 'DISTRIBUTION' | 'CLOSURE';
  export type CalculationBase = 'ANNOUNCEMENT_DATE' | 'ACCEPTANCE_DATE' | 'FILING_DATE' | 'COMPLETION_DATE';
  export type ResponsibleRole = 'ADMINISTRATOR' | 'COURT' | 'CREDITORS_COMMITTEE';
  export type NodeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXTENSION_REQUESTED' | 'EXTENDED';
  export type AlertLevel = 'NORMAL' | 'SOON_DUE' | 'DUE_TODAY' | 'OVERDUE';
  export type NotificationType = 'SYSTEM_MSG' | 'EMAIL' | 'SMS';
  export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

  export interface NodeTemplate {
    id: number;
    nodeCode: string;
    nodeName: string;
    nodeDescription: string;
    caseType: CaseType;
    caseStage: CaseStage;
    legalDeadlineDays: number;
    legalDeadlineDaysMax: number;
    calculationBase: CalculationBase;
    responsibleRole: ResponsibleRole;
    sortOrder: number;
    isMandatory: boolean;
  }

  export interface NodeInstance {
    id: number;
    caseId: number;
    templateId: number;
    nodeCode: string;
    nodeName: string;
    nodeStatus: NodeStatus;
    startDate: string | null;
    deadlineDate: string;
    completedDate: string | null;
    extensionCount: number;
    extensionDays: number;
    responsiblePersonId: number | null;
    responsiblePersonName: string | null;
    alertLevel: AlertLevel;
    sortOrder: number;
  }

  export interface NodeStatistics {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }

  export interface AlertRecord {
    id: number;
    nodeInstanceId: number;
    caseId: number;
    alertLevel: AlertLevel;
    remainingDays: number;
    deadlineDate: string;
    alertDate: string;
    isNotified: boolean;
    notificationType: NotificationType;
    recipientName: string;
  }

  export interface ExtensionApplication {
    id: number;
    nodeInstanceId: number;
    caseId: number;
    extensionDays: number;
    originalDeadline: string;
    newDeadline: string;
    applyReason: string;
    approvalStatus: ApprovalStatus;
    applyUserId: number;
    applyUserName: string;
    applyTime: string;
    approverId?: number;
    approverName?: string;
    approvalOpinion?: string;
    approvalTime?: string;
  }

  export interface ApplyExtensionRequest {
    nodeInstanceId: number;
    caseId: number;
    extensionDays: number;
    applyReason: string;
    applyUserId: number;
    applyUserName: string;
  }

  export interface CommonResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

export async function getAllNodeTemplatesApi() {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeTemplate[]>>('/api/v1/case-nodes/templates');
}

export async function getNodeTemplatesByCaseTypeApi(caseType: CaseNodeApi.CaseType) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeTemplate[]>>(`/api/v1/case-nodes/templates/${caseType}`);
}

export async function getNodeInstancesByCaseIdApi(caseId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance[]>>(`/api/v1/case-nodes/instances/${caseId}`);
}

export async function getNodeInstanceDetailApi(nodeInstanceId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance>>(`/api/v1/case-nodes/instances/detail/${nodeInstanceId}`);
}

export async function startNodeApi(nodeInstanceId: number, userId: number) {
  return requestClient.post<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance>>(`/api/v1/case-nodes/instances/${nodeInstanceId}/start`, null, {
    params: { userId },
  });
}

export async function completeNodeApi(nodeInstanceId: number, userId: number, completionRemark?: string) {
  return requestClient.post<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance>>(`/api/v1/case-nodes/instances/${nodeInstanceId}/complete`, null, {
    params: { userId, completionRemark },
  });
}

export async function updateNodeResponsiblePersonApi(nodeInstanceId: number, responsiblePersonId: number, responsiblePersonName: string) {
  return requestClient.patch<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance>>(
    `/api/v1/case-nodes/instances/${nodeInstanceId}/responsible-person`,
    null,
    { params: { responsiblePersonId, responsiblePersonName } },
  );
}

export async function getNodeStatisticsApi(caseId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeStatistics>>(`/api/v1/case-nodes/instances/statistics/${caseId}`);
}

export async function getAlertDashboardApi(userId?: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance[]>>('/api/v1/case-nodes/alerts/dashboard', {
    params: userId ? { userId } : {},
  });
}

export async function getOverdueNodesApi() {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance[]>>('/api/v1/case-nodes/alerts/overdue');
}

export async function getDueTodayNodesApi() {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance[]>>('/api/v1/case-nodes/alerts/due-today');
}

export async function getSoonDueNodesApi() {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.NodeInstance[]>>('/api/v1/case-nodes/alerts/soon-due');
}

export async function getAlertRecordsByCaseIdApi(caseId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.AlertRecord[]>>(`/api/v1/case-nodes/alerts/records/${caseId}`);
}

export async function applyExtensionApi(data: CaseNodeApi.ApplyExtensionRequest) {
  return requestClient.post<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication>>('/api/v1/case-nodes/extensions/apply', data);
}

export async function approveExtensionApi(extensionId: number, approverId: number, approverName: string, approvalOpinion?: string) {
  return requestClient.post<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication>>(
    `/api/v1/case-nodes/extensions/${extensionId}/approve`,
    null,
    { params: { approverId, approverName, approvalOpinion } },
  );
}

export async function rejectExtensionApi(extensionId: number, approverId: number, approverName: string, approvalOpinion?: string) {
  return requestClient.post<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication>>(
    `/api/v1/case-nodes/extensions/${extensionId}/reject`,
    null,
    { params: { approverId, approverName, approvalOpinion } },
  );
}

export async function getExtensionsByNodeIdApi(nodeInstanceId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication[]>>(`/api/v1/case-nodes/extensions/node/${nodeInstanceId}`);
}

export async function getExtensionsByCaseIdApi(caseId: number) {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication[]>>(`/api/v1/case-nodes/extensions/case/${caseId}`);
}

export async function getPendingExtensionsApi() {
  return requestClient.get<CaseNodeApi.CommonResponse<CaseNodeApi.ExtensionApplication[]>>('/api/v1/case-nodes/extensions/pending');
}

export async function getAllUserNodeInstancesApi(userId: number) {
  try {
    console.log('[getAllUserNodeInstancesApi] 开始获取用户案件列表，userId:', userId);
    
    const caseResponse = await getUserCaseListApi(userId, {
      pageNum: 1,
      pageSize: 1000,
    });

    console.log('[getAllUserNodeInstancesApi] 案件列表响应:', caseResponse);

    const caseList = caseResponse?.data?.list || [];
    console.log('[getAllUserNodeInstancesApi] 案件数量:', caseList.length);

    if (caseList.length === 0) {
      return {
        code: 200,
        message: '该用户没有案件',
        data: [],
      };
    }

    const allNodePromises = caseList.map(async (caseItem: any) => {
      const caseId = caseItem.id || caseItem.caseId;
      const caseName = caseItem.caseName || '';
      const caseNumber = caseItem.caseNumber || '';

      console.log(`[getAllUserNodeInstancesApi] 获取案件${caseId}(${caseName})的节点`);

      try {
        const nodeResponse = await getNodeInstancesByCaseIdApi(caseId);
        console.log(`[getAllUserNodeInstancesApi] 案件${caseId}节点响应:`, nodeResponse);
        console.log(`[getAllUserNodeInstancesApi] 案件${caseId}响应类型:`, Array.isArray(nodeResponse) ? 'Array' : typeof nodeResponse);
        
        let nodes: CaseNodeApi.NodeInstance[] = [];
        
        if (Array.isArray(nodeResponse)) {
          nodes = nodeResponse;
          console.log(`[getAllUserNodeInstancesApi] 案件${caseId}: 直接数组格式，节点数:`, nodes.length);
        } else if (nodeResponse && typeof nodeResponse === 'object') {
          if (Array.isArray((nodeResponse as any).data)) {
            nodes = (nodeResponse as any).data;
            console.log(`[getAllUserNodeInstancesApi] 案件${caseId}: .data数组格式，节点数:`, nodes.length);
          } else if (Array.isArray((nodeResponse as any).data?.list)) {
            nodes = (nodeResponse as any).data.list;
            console.log(`[getAllUserNodeInstancesApi] 案件${caseId}: .data.list数组格式，节点数:`, nodes.length);
          } else if ((nodeResponse as any).code === 200) {
            console.warn(`[getAllUserNodeInstancesApi] 案件${caseId}: 有code=200但没有data数组`, nodeResponse);
          }
        }
        
        console.log(`[getAllUserNodeInstancesApi] 案件${caseId}最终节点数量:`, nodes.length);

        return nodes.map((node: CaseNodeApi.NodeInstance) => ({
          ...node,
          caseName,
          caseNumber,
        }));
      } catch (error) {
        console.warn(`[getAllUserNodeInstancesApi] 获取案件${caseId}的节点失败:`, error);
        return [];
      }
    });

    const allNodeResults = await Promise.all(allNodePromises);
    const allNodes = allNodeResults.flat();

    console.log('[getAllUserNodeInstancesApi] 总节点数量:', allNodes.length);

    return {
      code: 200,
      message: 'success',
      data: allNodes,
    };
  } catch (error) {
    console.error('[getAllUserNodeInstancesApi] 获取用户所有节点失败:', error);
    return {
      code: 500,
      message: '获取用户所有节点失败',
      data: [],
    };
  }
}
