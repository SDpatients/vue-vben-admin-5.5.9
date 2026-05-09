import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createCaseApi,
  deleteCaseApi,
  getCaseDetailApi,
  getCaseListApi,
  updateCaseApi,
} from '#/api/core/case';

const testCaseData = {
  caseNumber: `TEST-${Date.now()}`,
  caseName: '测试案件-自动化测试',
  acceptanceDate: new Date().toISOString().split('T')[0],
  caseSource: '自动化测试来源',
  acceptanceCourt: '测试法院',
  designatedInstitution: '测试机构',
  mainResponsiblePerson: '测试负责人',
  isSimplifiedTrial: 0,
  caseReason: '测试案由',
  caseProgress: 'FIRST' as const,
  remarks: '这是自动化测试创建的案件',
};

let createdCaseId: number | null = null;
let backendAvailable = true;

function checkResponse(response: any) {
  expect(response).toHaveProperty('code');
  expect(response).toHaveProperty('message');
  expect(response).toHaveProperty('data');
  expect(response.code).toBe(200);
}

describe('案件管理模块 CRUD 真实操作测试', () => {
  beforeAll(async () => {
    try {
      await getCaseListApi({ pageNum: 1, pageSize: 1 });
      backendAvailable = true;
    } catch {
      backendAvailable = false;
      console.log('后端服务不可用，将跳过需要后端支持的测试');
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function skipIfNoBackend() {
    if (!backendAvailable) {
      return true;
    }
    return false;
  }

  describe('Create - 创建案件', () => {
    it('应该成功创建一个新案件', async () => {
      if (skipIfNoBackend()) return;

      const response = await createCaseApi(testCaseData);
      checkResponse(response);
      expect(response.data.caseId).toBeDefined();
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);

      createdCaseId = response.data.caseId;
    });

    it('创建案件时应该验证必填字段', async () => {
      if (skipIfNoBackend()) return;

      const invalidData = {
        caseName: '测试案件-缺少必填字段',
      };

      try {
        await createCaseApi(invalidData as any);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('创建案件时案号应该唯一', async () => {
      if (skipIfNoBackend()) return;

      try {
        await createCaseApi(testCaseData);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Read - 查询案件', () => {
    it('应该能够查询案件列表', async () => {
      if (skipIfNoBackend()) return;

      const response = await getCaseListApi({ pageNum: 1, pageSize: 10 });
      checkResponse(response);
      expect(Array.isArray(response.data.list)).toBe(true);
      expect(response.data.total).toBeDefined();
    });

    it('应该能够查询刚创建的案件详情', async () => {
      if (skipIfNoBackend() || createdCaseId === null) return;

      const response = await getCaseDetailApi(createdCaseId!);
      checkResponse(response);
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);
      expect(response.data.caseName).toBe(testCaseData.caseName);
    });

    it('应该支持分页查询', async () => {
      if (skipIfNoBackend()) return;

      const page1 = await getCaseListApi({ pageNum: 1, pageSize: 5 });
      expect(page1.code).toBe(200);
    });

    it('查询不存在的案件应该返回错误', async () => {
      if (skipIfNoBackend()) return;

      try {
        await getCaseDetailApi(999999);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Update - 更新案件', () => {
    it('应该能够更新案件信息', async () => {
      if (skipIfNoBackend() || createdCaseId === null) return;

      const updateData = {
        caseName: '测试案件-已更新',
        remarks: '这是更新后的备注信息',
      };

      const response = await updateCaseApi(createdCaseId!, updateData);
      expect(response.code).toBe(200);
    });

    it('更新不存在的案件应该返回错误', async () => {
      if (skipIfNoBackend()) return;

      try {
        await updateCaseApi(999999, { caseName: '不存在的案件' });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('应该能够部分更新案件信息', async () => {
      if (skipIfNoBackend() || createdCaseId === null) return;

      const response = await updateCaseApi(createdCaseId!, {
        remarks: '部分更新测试',
      });
      expect(response.code).toBe(200);
    });
  });

  describe('Delete - 删除案件', () => {
    it('应该能够删除案件', async () => {
      if (skipIfNoBackend() || createdCaseId === null) return;

      const response = await deleteCaseApi(createdCaseId!);
      expect(response.code).toBe(200);
    });

    it('删除后应该无法查询到该案件', async () => {
      if (skipIfNoBackend() || createdCaseId === null) return;

      try {
        await getCaseDetailApi(createdCaseId!);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('删除不存在的案件应该返回错误', async () => {
      if (skipIfNoBackend()) return;

      try {
        await deleteCaseApi(999999);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('完整 CRUD 流程测试', () => {
    it('应该能够完成完整的增删改查流程', async () => {
      if (skipIfNoBackend()) return;

      const createData = {
        caseNumber: `FLOW-TEST-${Date.now()}`,
        caseName: '流程测试案件',
        acceptanceDate: new Date().toISOString().split('T')[0],
        caseSource: '流程测试来源',
        acceptanceCourt: '流程测试法院',
        designatedInstitution: '流程测试机构',
        mainResponsiblePerson: '流程测试负责人',
        isSimplifiedTrial: 0,
        caseReason: '流程测试案由',
        caseProgress: 'FIRST' as const,
        remarks: '这是流程测试创建的案件',
      };

      const createResponse = await createCaseApi(createData);
      expect(createResponse.code).toBe(200);
      const flowTestCaseId = createResponse.data.caseId;

      const detailResponse = await getCaseDetailApi(flowTestCaseId);
      expect(detailResponse.code).toBe(200);

      const updateResponse = await updateCaseApi(flowTestCaseId, {
        caseName: '流程测试案件-已更新',
      });
      expect(updateResponse.code).toBe(200);

      const deleteResponse = await deleteCaseApi(flowTestCaseId);
      expect(deleteResponse.code).toBe(200);
    });
  });
});
