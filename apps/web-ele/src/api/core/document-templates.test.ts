import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { documentTemplatesApi } from './document-templates';
import { requestClient8085 } from '#/api/request';
import type { DocumentTemplateRequest, TemplateType, DocumentTemplate, ExportHistory } from './document-templates';

// Mock request client
vi.mock('#/api/request', () => ({
  requestClient8085: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('documentTemplatesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const mockRequest: DocumentTemplateRequest = {
        templateName: '测试模板',
        templateCode: 'TEST_001',
        templateType: 'WORD',
        description: '测试描述',
        configJson: '{"layout": "A4"}',
        isDefault: false,
        fields: [
          {
            fieldName: 'caseName',
            fieldLabel: '案件名称',
            fieldType: 'TEXT',
            sourceField: 'bankruptCase.caseName',
            sortOrder: 1,
            isRequired: true,
          },
        ],
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 1,
            ...mockRequest,
            status: 'ACTIVE',
            createTime: '2024-01-01T00:00:00',
            updateTime: '2024-01-01T00:00:00',
          } as DocumentTemplate,
        },
      };

      vi.mocked(requestClient8085.post).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.createTemplate(mockRequest);

      expect(requestClient8085.post).toHaveBeenCalledWith('/document-templates', mockRequest);
      expect(result.data.code).toBe(200);
      expect(result.data.data.templateName).toBe('测试模板');
    });

    it('should create template with minimal data', async () => {
      const mockRequest: DocumentTemplateRequest = {
        templateName: '最小模板',
        templateCode: 'MIN_001',
        templateType: 'EXCEL',
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id: 2,
            ...mockRequest,
            isDefault: false,
            status: 'ACTIVE',
            createTime: '2024-01-01T00:00:00',
            updateTime: '2024-01-01T00:00:00',
          } as DocumentTemplate,
        },
      };

      vi.mocked(requestClient8085.post).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.createTemplate(mockRequest);

      expect(requestClient8085.post).toHaveBeenCalledWith('/document-templates', mockRequest);
      expect(result.data.code).toBe(200);
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const id = 1;
      const updateData: Partial<DocumentTemplateRequest> = {
        templateName: '更新后的模板名称',
        description: '更新后的描述',
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id,
            templateName: '更新后的模板名称',
            templateCode: 'TEST_001',
            templateType: 'WORD',
            description: '更新后的描述',
            isDefault: false,
            status: 'ACTIVE',
            createTime: '2024-01-01T00:00:00',
            updateTime: '2024-01-02T00:00:00',
          } as DocumentTemplate,
        },
      };

      vi.mocked(requestClient8085.put).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.updateTemplate(id, updateData);

      expect(requestClient8085.put).toHaveBeenCalledWith(`/document-templates/${id}`, updateData);
      expect(result.data.code).toBe(200);
      expect(result.data.data.templateName).toBe('更新后的模板名称');
    });

    it('should update template fields', async () => {
      const id = 1;
      const updateData: Partial<DocumentTemplateRequest> = {
        fields: [
          {
            fieldName: 'newField',
            fieldLabel: '新字段',
            fieldType: 'NUMBER',
            sourceField: 'test.source',
            sortOrder: 1,
            isRequired: true,
            formatPattern: '#,##0.00',
          },
        ],
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            id,
            templateName: '测试模板',
            templateCode: 'TEST_001',
            templateType: 'WORD',
            fields: updateData.fields,
            isDefault: false,
            status: 'ACTIVE',
            createTime: '2024-01-01T00:00:00',
            updateTime: '2024-01-02T00:00:00',
          } as DocumentTemplate,
        },
      };

      vi.mocked(requestClient8085.put).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.updateTemplate(id, updateData);

      expect(requestClient8085.put).toHaveBeenCalledWith(`/document-templates/${id}`, updateData);
      expect(result.data.data.fields).toHaveLength(1);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const id = 1;

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: null,
        },
      };

      vi.mocked(requestClient8085.delete).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.deleteTemplate(id);

      expect(requestClient8085.delete).toHaveBeenCalledWith(`/document-templates/${id}`);
      expect(result.data.code).toBe(200);
    });
  });

  describe('getTemplates', () => {
    it('should get all templates', async () => {
      const mockTemplates: DocumentTemplate[] = [
        {
          id: 1,
          templateName: 'Word模板',
          templateCode: 'WORD_001',
          templateType: 'WORD',
          isDefault: true,
          status: 'ACTIVE',
          createTime: '2024-01-01T00:00:00',
          updateTime: '2024-01-01T00:00:00',
        },
        {
          id: 2,
          templateName: 'Excel模板',
          templateCode: 'EXCEL_001',
          templateType: 'EXCEL',
          isDefault: false,
          status: 'ACTIVE',
          createTime: '2024-01-02T00:00:00',
          updateTime: '2024-01-02T00:00:00',
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockTemplates,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplates();

      expect(requestClient8085.get).toHaveBeenCalledWith('/document-templates');
      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].templateType).toBe('WORD');
      expect(result.data.data[1].templateType).toBe('EXCEL');
    });

    it('should return empty array when no templates', async () => {
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: [],
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplates();

      expect(result.data.data).toHaveLength(0);
    });
  });

  describe('getTemplatesByType', () => {
    it('should get templates by WORD type', async () => {
      const templateType: TemplateType = 'WORD';

      const mockTemplates: DocumentTemplate[] = [
        {
          id: 1,
          templateName: 'Word模板1',
          templateCode: 'WORD_001',
          templateType: 'WORD',
          isDefault: true,
          status: 'ACTIVE',
          createTime: '2024-01-01T00:00:00',
          updateTime: '2024-01-01T00:00:00',
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockTemplates,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplatesByType(templateType);

      expect(requestClient8085.get).toHaveBeenCalledWith(`/document-templates/type/${templateType}`);
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].templateType).toBe('WORD');
    });

    it('should get templates by EXCEL type', async () => {
      const templateType: TemplateType = 'EXCEL';

      const mockTemplates: DocumentTemplate[] = [
        {
          id: 2,
          templateName: 'Excel模板1',
          templateCode: 'EXCEL_001',
          templateType: 'EXCEL',
          isDefault: false,
          status: 'ACTIVE',
          createTime: '2024-01-01T00:00:00',
          updateTime: '2024-01-01T00:00:00',
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockTemplates,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplatesByType(templateType);

      expect(result.data.data[0].templateType).toBe('EXCEL');
    });
  });

  describe('getTemplateById', () => {
    it('should get template by id', async () => {
      const id = 1;

      const mockTemplate: DocumentTemplate = {
        id,
        templateName: '测试模板',
        templateCode: 'TEST_001',
        templateType: 'WORD',
        description: '详细描述',
        filePath: 'uploads/templates/test.docx',
        configJson: '{"layout": "A4"}',
        isDefault: true,
        status: 'ACTIVE',
        createTime: '2024-01-01T00:00:00',
        updateTime: '2024-01-01T00:00:00',
        createUserId: 1,
        updateUserId: 1,
        fields: [
          {
            fieldName: 'caseName',
            fieldLabel: '案件名称',
            fieldType: 'TEXT',
            sourceField: 'bankruptCase.caseName',
            sortOrder: 1,
            isRequired: true,
          },
        ],
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockTemplate,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplateById(id);

      expect(requestClient8085.get).toHaveBeenCalledWith(`/document-templates/${id}`);
      expect(result.data.data.id).toBe(id);
      expect(result.data.data.fields).toHaveLength(1);
    });
  });

  describe('getTemplateByCode', () => {
    it('should get template by code', async () => {
      const templateCode = 'TEST_001';

      const mockTemplate: DocumentTemplate = {
        id: 1,
        templateName: '测试模板',
        templateCode,
        templateType: 'WORD',
        isDefault: false,
        status: 'ACTIVE',
        createTime: '2024-01-01T00:00:00',
        updateTime: '2024-01-01T00:00:00',
      };

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockTemplate,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplateByCode(templateCode);

      expect(requestClient8085.get).toHaveBeenCalledWith(`/document-templates/code/${templateCode}`);
      expect(result.data.data.templateCode).toBe(templateCode);
    });
  });

  describe('setDefaultTemplate', () => {
    it('should set template as default', async () => {
      const id = 1;
      const templateType: TemplateType = 'WORD';

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: null,
        },
      };

      vi.mocked(requestClient8085.post).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.setDefaultTemplate(id, templateType);

      expect(requestClient8085.post).toHaveBeenCalledWith(
        `/document-templates/${id}/set-default`,
        null,
        { params: { templateType } }
      );
      expect(result.data.code).toBe(200);
    });
  });

  describe('uploadTemplateFile', () => {
    it('should upload template file', async () => {
      const id = 1;
      const file = new File(['test content'], 'template.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: 'uploads/templates/template.docx',
        },
      };

      vi.mocked(requestClient8085.post).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.uploadTemplateFile(id, file);

      expect(requestClient8085.post).toHaveBeenCalledWith(
        `/document-templates/${id}/upload`,
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result.data.code).toBe(200);
      expect(result.data.data).toBe('uploads/templates/template.docx');
    });
  });

  describe('exportWord', () => {
    it('should export Word document', async () => {
      const templateId = 1;
      const exportData = {
        templateId,
        fileName: '债权申报合同',
        data: {
          caseName: '某某公司破产清算案',
          creditorName: '张三',
          claimAmount: 1500000.00,
          registerDate: '2026-02-04T10:30:00',
        },
      };

      const mockBlob = new Blob(['word content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      vi.mocked(requestClient8085.post).mockResolvedValue({ data: mockBlob });

      const result = await documentTemplatesApi.exportWord(templateId, exportData);

      expect(requestClient8085.post).toHaveBeenCalledWith(
        `/document-templates/${templateId}/export/word`,
        exportData,
        { responseType: 'blob' }
      );
      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('exportExcel', () => {
    it('should export Excel file', async () => {
      const templateId = 2;
      const exportData = {
        templateId,
        fileName: '债权人清单',
        data: {
          caseName: '某某公司破产清算案',
          exportDate: '2026-02-04',
          creditorList: [
            { creditorName: '张三', claimAmount: 1000000 },
            { creditorName: '李四', claimAmount: 2000000 },
          ],
        },
      };

      const mockBlob = new Blob(['excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      vi.mocked(requestClient8085.post).mockResolvedValue({ data: mockBlob });

      const result = await documentTemplatesApi.exportExcel(templateId, exportData);

      expect(requestClient8085.post).toHaveBeenCalledWith(
        `/document-templates/${templateId}/export/excel`,
        exportData,
        { responseType: 'blob' }
      );
      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('getExportHistory', () => {
    it('should get all export history', async () => {
      const mockHistory: ExportHistory[] = [
        {
          id: 1,
          templateId: 1,
          templateName: '债权申报合同模板',
          exportType: 'WORD',
          fileName: '债权申报合同_20260204103000.docx',
          fileSize: 25600,
          exportStatus: 'SUCCESS',
          exportedBy: 1,
          exportedByName: '管理员',
          exportedTime: '2026-02-04T10:30:00',
          processingTime: 1500,
          createTime: '2026-02-04T10:30:00',
        },
        {
          id: 2,
          templateId: 2,
          templateName: '债权人清单报表',
          exportType: 'EXCEL',
          fileName: '债权人清单_20260204110000.xlsx',
          fileSize: 15360,
          exportStatus: 'SUCCESS',
          exportedBy: 1,
          exportedByName: '管理员',
          exportedTime: '2026-02-04T11:00:00',
          processingTime: 800,
          createTime: '2026-02-04T11:00:00',
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockHistory,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getExportHistory();

      expect(requestClient8085.get).toHaveBeenCalledWith('/document-templates/export-history');
      expect(result.data.code).toBe(200);
      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].exportType).toBe('WORD');
      expect(result.data.data[1].exportType).toBe('EXCEL');
    });
  });

  describe('getTemplateExportHistory', () => {
    it('should get export history for specific template', async () => {
      const templateId = 1;

      const mockHistory: ExportHistory[] = [
        {
          id: 1,
          templateId,
          templateName: '债权申报合同模板',
          exportType: 'WORD',
          fileName: '债权申报合同_20260204103000.docx',
          fileSize: 25600,
          exportStatus: 'SUCCESS',
          exportedBy: 1,
          exportedByName: '管理员',
          exportedTime: '2026-02-04T10:30:00',
          processingTime: 1500,
          createTime: '2026-02-04T10:30:00',
        },
      ];

      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: mockHistory,
        },
      };

      vi.mocked(requestClient8085.get).mockResolvedValue(mockResponse);

      const result = await documentTemplatesApi.getTemplateExportHistory(templateId);

      expect(requestClient8085.get).toHaveBeenCalledWith(`/document-templates/${templateId}/export-history`);
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].templateId).toBe(templateId);
    });
  });
});
