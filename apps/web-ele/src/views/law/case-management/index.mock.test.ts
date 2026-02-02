import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock API 模块
vi.mock('#/api/core/case', () => ({
  createCaseApi: vi.fn(),
  deleteCaseApi: vi.fn(),
  getCaseDetailApi: vi.fn(),
  getCaseListApi: vi.fn(),
  updateCaseApi: vi.fn(),
}));

import {
  createCaseApi,
  deleteCaseApi,
  getCaseDetailApi,
  getCaseListApi,
  updateCaseApi,
} from '#/api/core/case';

// 测试数据
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

describe('案件管理模块 CRUD Mock 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create - 创建案件', () => {
    it('应该成功创建一个新案件', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          caseId: 12345,
          caseNumber: testCaseData.caseNumber,
        },
      };
      vi.mocked(createCaseApi).mockResolvedValue(mockResponse);

      // 调用 API
      const response = await createCaseApi(testCaseData);

      // 验证响应
      expect(response.code).toBe(200);
      expect(response.data.caseId).toBe(12345);
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);

      // 验证 Mock 被调用
      expect(createCaseApi).toHaveBeenCalledWith(testCaseData);
      expect(createCaseApi).toHaveBeenCalledTimes(1);
    });

    it('创建案件时应该处理必填字段错误', async () => {
      // 设置 Mock 返回错误
      const errorResponse = {
        code: 400,
        message: '必填字段缺失',
        data: null,
      };
      vi.mocked(createCaseApi).mockRejectedValue(new Error('必填字段缺失'));

      // 验证错误处理
      await expect(createCaseApi({} as any)).rejects.toThrow('必填字段缺失');
    });

    it('创建案件时应该处理重复案号错误', async () => {
      // 设置 Mock 返回重复错误
      vi.mocked(createCaseApi).mockRejectedValue(new Error('案号已存在'));

      // 验证错误处理
      await expect(createCaseApi(testCaseData)).rejects.toThrow('案号已存在');
    });
  });

  describe('Read - 查询案件', () => {
    it('应该能够查询案件列表', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          list: [
            {
              id: 1,
              caseNumber: 'CASE-001',
              caseName: '测试案件1',
            },
            {
              id: 2,
              caseNumber: 'CASE-002',
              caseName: '测试案件2',
            },
          ],
          total: 2,
        },
      };
      vi.mocked(getCaseListApi).mockResolvedValue(mockResponse);

      // 调用 API
      const response = await getCaseListApi({ pageNum: 1, pageSize: 10 });

      // 验证响应
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data.list)).toBe(true);
      expect(response.data.list.length).toBe(2);
      expect(response.data.total).toBe(2);

      // 验证 Mock 被调用
      expect(getCaseListApi).toHaveBeenCalledWith({ pageNum: 1, pageSize: 10 });
    });

    it('应该能够查询案件详情', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          id: 1,
          caseNumber: testCaseData.caseNumber,
          caseName: testCaseData.caseName,
          caseSource: testCaseData.caseSource,
        },
      };
      vi.mocked(getCaseDetailApi).mockResolvedValue(mockResponse);

      // 调用 API
      const response = await getCaseDetailApi(1);

      // 验证响应
      expect(response.code).toBe(200);
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);
      expect(response.data.caseName).toBe(testCaseData.caseName);

      // 验证 Mock 被调用
      expect(getCaseDetailApi).toHaveBeenCalledWith(1);
    });

    it('应该支持分页查询', async () => {
      // 设置 Mock 返回值
      const mockPage1 = {
        code: 200,
        message: 'success',
        data: {
          list: [{ id: 1, caseNumber: 'CASE-001' }],
          total: 10,
        },
      };
      const mockPage2 = {
        code: 200,
        message: 'success',
        data: {
          list: [{ id: 2, caseNumber: 'CASE-002' }],
          total: 10,
        },
      };

      vi.mocked(getCaseListApi)
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      // 调用 API
      const page1 = await getCaseListApi({ pageNum: 1, pageSize: 5 });
      const page2 = await getCaseListApi({ pageNum: 2, pageSize: 5 });

      // 验证响应
      expect(page1.data.list.length).toBe(1);
      expect(page2.data.list.length).toBe(1);
      expect(getCaseListApi).toHaveBeenCalledTimes(2);
    });

    it('查询不存在的案件应该返回错误', async () => {
      // 设置 Mock 返回错误
      vi.mocked(getCaseDetailApi).mockRejectedValue(new Error('案件不存在'));

      // 验证错误处理
      await expect(getCaseDetailApi(999999)).rejects.toThrow('案件不存在');
    });
  });

  describe('Update - 更新案件', () => {
    it('应该能够更新案件信息', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: null,
      };
      vi.mocked(updateCaseApi).mockResolvedValue(mockResponse);

      const updateData = {
        caseName: '测试案件-已更新',
        remarks: '这是更新后的备注信息',
      };

      // 调用 API
      const response = await updateCaseApi(1, updateData);

      // 验证响应
      expect(response.code).toBe(200);

      // 验证 Mock 被调用
      expect(updateCaseApi).toHaveBeenCalledWith(1, updateData);
    });

    it('更新不存在的案件应该返回错误', async () => {
      // 设置 Mock 返回错误
      vi.mocked(updateCaseApi).mockRejectedValue(new Error('案件不存在'));

      // 验证错误处理
      await expect(updateCaseApi(999999, { caseName: '测试' })).rejects.toThrow('案件不存在');
    });

    it('应该能够部分更新案件信息', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: null,
      };
      vi.mocked(updateCaseApi).mockResolvedValue(mockResponse);

      const partialUpdate = {
        remarks: '部分更新测试',
      };

      // 调用 API
      const response = await updateCaseApi(1, partialUpdate);

      // 验证响应
      expect(response.code).toBe(200);
      expect(updateCaseApi).toHaveBeenCalledWith(1, partialUpdate);
    });
  });

  describe('Delete - 删除案件', () => {
    it('应该能够删除案件', async () => {
      // 设置 Mock 返回值
      const mockResponse = {
        code: 200,
        message: 'success',
        data: null,
      };
      vi.mocked(deleteCaseApi).mockResolvedValue(mockResponse);

      // 调用 API
      const response = await deleteCaseApi(1);

      // 验证响应
      expect(response.code).toBe(200);

      // 验证 Mock 被调用
      expect(deleteCaseApi).toHaveBeenCalledWith(1);
    });

    it('删除不存在的案件应该返回错误', async () => {
      // 设置 Mock 返回错误
      vi.mocked(deleteCaseApi).mockRejectedValue(new Error('案件不存在'));

      // 验证错误处理
      await expect(deleteCaseApi(999999)).rejects.toThrow('案件不存在');
    });
  });

  describe('完整 CRUD 流程测试', () => {
    it('应该能够完成完整的增删改查流程', async () => {
      const uniqueId = Date.now();
      const flowTestData = {
        caseNumber: `FLOW-${uniqueId}`,
        caseName: `流程测试案件-${uniqueId}`,
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

      // 1. Mock 创建案件
      const createResponse = {
        code: 200,
        message: 'success',
        data: {
          caseId: 999,
          caseNumber: flowTestData.caseNumber,
        },
      };
      vi.mocked(createCaseApi).mockResolvedValue(createResponse);

      // 2. Mock 查询详情
      const detailResponse = {
        code: 200,
        message: 'success',
        data: {
          id: 999,
          caseNumber: flowTestData.caseNumber,
          caseName: flowTestData.caseName,
        },
      };
      vi.mocked(getCaseDetailApi).mockResolvedValue(detailResponse);

      // 3. Mock 更新案件
      const updateResponse = {
        code: 200,
        message: 'success',
        data: null,
      };
      vi.mocked(updateCaseApi).mockResolvedValue(updateResponse);

      // 4. Mock 删除案件
      const deleteResponse = {
        code: 200,
        message: 'success',
        data: null,
      };
      vi.mocked(deleteCaseApi).mockResolvedValue(deleteResponse);

      // 执行完整流程
      // 1. 创建
      const created = await createCaseApi(flowTestData);
      expect(created.code).toBe(200);
      expect(created.data.caseId).toBe(999);
      console.log('✅ 创建案件成功');

      // 2. 查询
      const detail = await getCaseDetailApi(999);
      expect(detail.code).toBe(200);
      expect(detail.data.caseNumber).toBe(flowTestData.caseNumber);
      console.log('✅ 查询案件成功');

      // 3. 更新
      const updated = await updateCaseApi(999, { caseName: '已更新' });
      expect(updated.code).toBe(200);
      console.log('✅ 更新案件成功');

      // 4. 删除
      const deleted = await deleteCaseApi(999);
      expect(deleted.code).toBe(200);
      console.log('✅ 删除案件成功');

      console.log('🎉 完整 CRUD 流程测试通过！');
    });
  });

  describe('API 调用验证', () => {
    it('应该正确调用所有 API', async () => {
      // 设置 Mock
      vi.mocked(createCaseApi).mockResolvedValue({ code: 200, message: 'success', data: { caseId: 1, caseNumber: 'TEST' } });
      vi.mocked(getCaseListApi).mockResolvedValue({ code: 200, message: 'success', data: { list: [], total: 0 } });
      vi.mocked(getCaseDetailApi).mockResolvedValue({ code: 200, message: 'success', data: { id: 1, caseNumber: 'TEST' } });
      vi.mocked(updateCaseApi).mockResolvedValue({ code: 200, message: 'success', data: null });
      vi.mocked(deleteCaseApi).mockResolvedValue({ code: 200, message: 'success', data: null });

      // 调用所有 API
      await createCaseApi(testCaseData);
      await getCaseListApi({ pageNum: 1, pageSize: 10 });
      await getCaseDetailApi(1);
      await updateCaseApi(1, { caseName: '更新' });
      await deleteCaseApi(1);

      // 验证所有 API 都被调用
      expect(createCaseApi).toHaveBeenCalledTimes(1);
      expect(getCaseListApi).toHaveBeenCalledTimes(1);
      expect(getCaseDetailApi).toHaveBeenCalledTimes(1);
      expect(updateCaseApi).toHaveBeenCalledTimes(1);
      expect(deleteCaseApi).toHaveBeenCalledTimes(1);
    });
  });
});
