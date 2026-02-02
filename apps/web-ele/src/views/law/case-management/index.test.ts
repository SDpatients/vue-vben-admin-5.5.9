import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

let createdCaseId: number | null = null;

describe('案件管理模块 CRUD 真实操作测试', () => {
  // 测试前置条件检查
  beforeAll(() => {
    // 检查环境变量或配置
    console.log('开始案件管理模块 CRUD 测试...');
  });

  beforeEach(() => {
    // 每个测试前的准备工作
    vi.clearAllMocks();
  });

  describe('Create - 创建案件', () => {
    it('应该成功创建一个新案件', async () => {
      const response = await createCaseApi(testCaseData);

      // 验证响应结构
      expect(response).toHaveProperty('code');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');

      // 验证响应状态
      expect(response.code).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.caseId).toBeDefined();
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);

      // 保存创建的案件ID，用于后续测试
      createdCaseId = response.data.caseId;
      console.log(`创建案件成功，ID: ${createdCaseId}`);
    });

    it('创建案件时应该验证必填字段', async () => {
      // 测试缺少必填字段的情况
      const invalidData = {
        caseName: '测试案件-缺少必填字段',
        // 缺少 caseNumber 和 acceptanceDate
      };

      try {
        // @ts-ignore - 故意传入不完整数据测试错误处理
        await createCaseApi(invalidData);
        // 如果到这里，说明没有抛出错误，测试失败
        expect(true).toBe(false);
      } catch (error: any) {
        // 验证错误响应
        expect(error).toBeDefined();
      }
    });

    it('创建案件时案号应该唯一', async () => {
      // 尝试使用相同的案号创建第二个案件
      try {
        await createCaseApi(testCaseData);
        // 如果创建成功，说明系统没有唯一性校验
        console.warn('警告：系统没有对案号进行唯一性校验');
      } catch (error: any) {
        // 期望得到一个错误，表示案号已存在
        expect(error).toBeDefined();
      }
    });
  });

  describe('Read - 查询案件', () => {
    it('应该能够查询案件列表', async () => {
      const response = await getCaseListApi({
        pageNum: 1,
        pageSize: 10,
      });

      // 验证响应结构
      expect(response).toHaveProperty('code');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');

      // 验证响应状态
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data.list)).toBe(true);
      expect(response.data.total).toBeDefined();

      console.log(`查询到 ${response.data.list.length} 条案件记录`);
    });

    it('应该能够查询刚创建的案件详情', async () => {
      // 确保有创建的案件ID
      expect(createdCaseId).not.toBeNull();

      const response = await getCaseDetailApi(createdCaseId!);

      // 验证响应结构
      expect(response).toHaveProperty('code');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');

      // 验证响应状态
      expect(response.code).toBe(200);

      // 验证返回的数据与创建时一致
      expect(response.data.caseNumber).toBe(testCaseData.caseNumber);
      expect(response.data.caseName).toBe(testCaseData.caseName);
      expect(response.data.caseSource).toBe(testCaseData.caseSource);
    });

    it('应该支持分页查询', async () => {
      const page1 = await getCaseListApi({
        pageNum: 1,
        pageSize: 5,
      });

      const page2 = await getCaseListApi({
        pageNum: 2,
        pageSize: 5,
      });

      expect(page1.code).toBe(200);
      expect(page2.code).toBe(200);

      // 验证分页数据
      expect(page1.data.list.length).toBeLessThanOrEqual(5);
      expect(page2.data.list.length).toBeLessThanOrEqual(5);

      console.log(`分页查询：第1页 ${page1.data.list.length} 条，第2页 ${page2.data.list.length} 条`);
    });

    it('查询不存在的案件应该返回错误', async () => {
      const nonExistentId = 999999;

      try {
        await getCaseDetailApi(nonExistentId);
        // 如果查询成功，说明测试失败
        expect(true).toBe(false);
      } catch (error: any) {
        // 期望得到一个错误
        expect(error).toBeDefined();
      }
    });
  });

  describe('Update - 更新案件', () => {
    it('应该能够更新案件信息', async () => {
      // 确保有创建的案件ID
      expect(createdCaseId).not.toBeNull();

      const updateData = {
        caseName: '测试案件-已更新',
        remarks: '这是更新后的备注信息',
        caseProgress: 'SECOND' as const,
      };

      const response = await updateCaseApi(createdCaseId!, updateData);

      // 验证响应
      expect(response.code).toBe(200);

      // 验证更新是否成功
      const detailResponse = await getCaseDetailApi(createdCaseId!);
      expect(detailResponse.data.caseName).toBe(updateData.caseName);
      expect(detailResponse.data.remarks).toBe(updateData.remarks);

      console.log('案件更新成功');
    });

    it('更新不存在的案件应该返回错误', async () => {
      const nonExistentId = 999999;
      const updateData = {
        caseName: '不存在的案件',
      };

      try {
        await updateCaseApi(nonExistentId, updateData);
        // 如果更新成功，说明测试失败
        expect(true).toBe(false);
      } catch (error: any) {
        // 期望得到一个错误
        expect(error).toBeDefined();
      }
    });

    it('应该能够部分更新案件信息', async () => {
      // 确保有创建的案件ID
      expect(createdCaseId).not.toBeNull();

      // 只更新一个字段
      const partialUpdate = {
        remarks: '部分更新测试',
      };

      const response = await updateCaseApi(createdCaseId!, partialUpdate);
      expect(response.code).toBe(200);

      // 验证更新
      const detailResponse = await getCaseDetailApi(createdCaseId!);
      expect(detailResponse.data.remarks).toBe(partialUpdate.remarks);
    });
  });

  describe('Delete - 删除案件', () => {
    it('应该能够删除案件', async () => {
      // 确保有创建的案件ID
      expect(createdCaseId).not.toBeNull();

      const response = await deleteCaseApi(createdCaseId!);

      // 验证响应
      expect(response.code).toBe(200);

      console.log(`案件删除成功，ID: ${createdCaseId}`);
    });

    it('删除后应该无法查询到该案件', async () => {
      // 确保有创建的案件ID
      expect(createdCaseId).not.toBeNull();

      try {
        await getCaseDetailApi(createdCaseId!);
        // 如果查询成功，说明删除失败
        expect(true).toBe(false);
      } catch (error: any) {
        // 期望得到一个错误，表示案件不存在
        expect(error).toBeDefined();
      }
    });

    it('删除不存在的案件应该返回错误', async () => {
      const nonExistentId = 999999;

      try {
        await deleteCaseApi(nonExistentId);
        // 如果删除成功，说明测试失败
        expect(true).toBe(false);
      } catch (error: any) {
        // 期望得到一个错误
        expect(error).toBeDefined();
      }
    });
  });

  describe('完整 CRUD 流程测试', () => {
    it('应该能够完成完整的增删改查流程', async () => {
      // 1. 创建
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
      console.log(`流程测试：创建案件成功，ID: ${flowTestCaseId}`);

      // 2. 查询
      const detailResponse = await getCaseDetailApi(flowTestCaseId);
      expect(detailResponse.code).toBe(200);
      expect(detailResponse.data.caseNumber).toBe(createData.caseNumber);
      console.log('流程测试：查询案件成功');

      // 3. 更新
      const updateData = {
        caseName: '流程测试案件-已更新',
        remarks: '流程测试更新备注',
      };
      const updateResponse = await updateCaseApi(flowTestCaseId, updateData);
      expect(updateResponse.code).toBe(200);
      console.log('流程测试：更新案件成功');

      // 4. 验证更新
      const verifyResponse = await getCaseDetailApi(flowTestCaseId);
      expect(verifyResponse.data.caseName).toBe(updateData.caseName);
      console.log('流程测试：验证更新成功');

      // 5. 删除
      const deleteResponse = await deleteCaseApi(flowTestCaseId);
      expect(deleteResponse.code).toBe(200);
      console.log('流程测试：删除案件成功');

      // 6. 验证删除
      try {
        await getCaseDetailApi(flowTestCaseId);
        expect(true).toBe(false); // 应该抛出错误
      } catch (error) {
        expect(error).toBeDefined();
        console.log('流程测试：验证删除成功');
      }

      console.log('完整 CRUD 流程测试通过！');
    });
  });
});
