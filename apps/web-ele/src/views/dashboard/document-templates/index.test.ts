import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import DocumentTemplates from './index.vue';
import { documentTemplatesApi } from '#/api/core/document-templates';
import type { DocumentTemplate, ExportHistory } from '#/api/core/document-templates';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElCard: { name: 'ElCard', template: '<div class="el-card"><slot /></div>' },
  ElTable: { name: 'ElTable', template: '<table class="el-table"><slot /></table>', props: ['data', 'v-loading'] },
  ElTableColumn: { name: 'ElTableColumn', template: '<td class="el-table-column"><slot /><slot name="default" :row="{}" /></td>', props: ['prop', 'label', 'width', 'min-width', 'fixed'] },
  ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>', props: ['type', 'size'] },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'active-value', 'inactive-value'],
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue" class="el-dialog"><slot /><slot name="footer" /></div>',
    props: ['modelValue', 'title', 'width', 'close-on-click-modal', 'destroy-on-close'],
  },
  ElForm: { name: 'ElForm', template: '<form><slot /></form>', props: ['model', 'rules', 'label-width', 'label-position'] },
  ElFormItem: { name: 'ElFormItem', template: '<div class="el-form-item"><slot /></div>', props: ['label', 'prop', 'required'] },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'type', 'rows', 'disabled'],
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'min', 'style'],
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot /></div>',
    props: ['modelValue'],
  },
  ElRadioButton: {
    name: 'ElRadioButton',
    template: '<label class="el-radio-button"><slot /></label>',
    props: ['label'],
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot /><slot name="dropdown" /></div>',
    props: ['trigger'],
  },
  ElDropdownMenu: { name: 'ElDropdownMenu', template: '<div class="el-dropdown-menu"><slot /></div>' },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item"><slot /></div>',
    props: ['command', 'disabled', 'divided'],
  },
  ElIcon: { name: 'ElIcon', template: '<span class="el-icon"><slot /></span>' },
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  ElMessageBox: {
    confirm: vi.fn(),
  },
  ElAlert: { name: 'ElAlert', template: '<div class="el-alert"><slot name="title" /><slot /></div>', props: ['type', 'closable'] },
  ElUpload: {
    name: 'ElUpload',
    template: '<div class="el-upload"><slot /><slot name="tip" /></div>',
    props: ['action', 'auto-upload', 'limit', 'accept', 'drag'],
  },
  ElDivider: { name: 'ElDivider', template: '<hr class="el-divider" />' },
  vLoading: {},
}));

// Mock API
vi.mock('#/api/core/document-templates', () => ({
  documentTemplatesApi: {
    getTemplates: vi.fn(() => Promise.resolve({
      data: { code: 200, message: 'success', data: [] }
    })),
    getTemplateById: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    setDefaultTemplate: vi.fn(),
    uploadTemplateFile: vi.fn(),
    exportWord: vi.fn(),
    exportExcel: vi.fn(),
    getTemplateExportHistory: vi.fn(),
  },
}));

// Mock DocumentFormDesigner component
vi.mock('#/components/DocumentFormDesigner.vue', () => ({
  default: {
    name: 'DocumentFormDesigner',
    template: '<div class="document-form-designer-mock"><slot /></div>',
    props: ['initialTemplateType'],
    methods: {
      getTemplateFields: vi.fn(() => []),
      setTemplateFields: vi.fn(),
    },
  },
}));

describe('DocumentTemplates Page', () => {
  const mockTemplates: DocumentTemplate[] = [
    {
      id: 1,
      templateName: 'Word模板1',
      templateCode: 'WORD_001',
      templateType: 'WORD',
      description: '测试Word模板',
      isDefault: true,
      status: 'ACTIVE',
      createTime: '2024-01-01T00:00:00',
      updateTime: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      templateName: 'Excel模板1',
      templateCode: 'EXCEL_001',
      templateType: 'EXCEL',
      description: '测试Excel模板',
      isDefault: false,
      status: 'ACTIVE',
      createTime: '2024-01-02T00:00:00',
      updateTime: '2024-01-02T00:00:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(documentTemplatesApi.getTemplates).mockResolvedValue({
      data: { code: 200, message: 'success', data: mockTemplates },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.document-templates-page').exists()).toBe(true);
  });

  it('displays page header correctly', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    expect(wrapper.find('h2').text()).toBe('文档模板管理');
    expect(wrapper.find('.subtitle').text()).toContain('管理Word和Excel文档模板');
  });

  it('loads templates on mount', async () => {
    mount(DocumentTemplates);
    await flushPromises();

    expect(documentTemplatesApi.getTemplates).toHaveBeenCalled();
  });

  it('displays correct statistics', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    const stats = wrapper.findAll('.stat-value');
    expect(stats[0].text()).toBe('2'); // total
    expect(stats[1].text()).toBe('1'); // word
    expect(stats[2].text()).toBe('1'); // excel
    expect(stats[3].text()).toBe('1'); // default
  });

  it('filters templates by type', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    // Initially shows all templates
    expect(wrapper.vm.filteredTemplates).toHaveLength(2);

    // Filter by WORD
    wrapper.vm.filterType = 'WORD';
    await nextTick();
    expect(wrapper.vm.filteredTemplates).toHaveLength(1);
    expect(wrapper.vm.filteredTemplates[0].templateType).toBe('WORD');

    // Filter by EXCEL
    wrapper.vm.filterType = 'EXCEL';
    await nextTick();
    expect(wrapper.vm.filteredTemplates).toHaveLength(1);
    expect(wrapper.vm.filteredTemplates[0].templateType).toBe('EXCEL');
  });

  it('opens create dialog when clicking new template button', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    // Find and click the new template button
    const newButton = wrapper.findAll('button').find(btn => btn.text().includes('新建模板'));
    if (newButton) {
      await newButton.trigger('click');
      await nextTick();

      expect(wrapper.vm.dialogVisible).toBe(true);
      expect(wrapper.vm.dialogTitle).toBe('新建模板');
    }
  });

  it('opens edit dialog with correct data', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    // Simulate clicking edit on first template
    wrapper.vm.showEditDialog(mockTemplates[0]);
    await nextTick();

    expect(wrapper.vm.dialogVisible).toBe(true);
    expect(wrapper.vm.dialogTitle).toBe('编辑模板');
    expect(wrapper.vm.templateForm.templateName).toBe('Word模板1');
    expect(wrapper.vm.templateForm.templateCode).toBe('WORD_001');
  });

  it('creates new template successfully', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.createTemplate).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        data: { id: 3, ...mockTemplates[0] },
      },
    });

    // Open create dialog
    wrapper.vm.showCreateDialog();
    await nextTick();

    // Fill form
    wrapper.vm.templateForm.templateName = '新模板';
    wrapper.vm.templateForm.templateCode = 'NEW_001';
    wrapper.vm.templateForm.templateType = 'WORD';
    await nextTick();

    // Save
    await wrapper.vm.saveTemplate();

    expect(documentTemplatesApi.createTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateName: '新模板',
        templateCode: 'NEW_001',
        templateType: 'WORD',
      })
    );
  });

  it('updates template successfully', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.updateTemplate).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        data: mockTemplates[0],
      },
    });

    // Open edit dialog
    wrapper.vm.showEditDialog(mockTemplates[0]);
    await nextTick();

    // Modify form
    wrapper.vm.templateForm.templateName = '更新后的名称';
    await nextTick();

    // Save
    await wrapper.vm.saveTemplate();

    expect(documentTemplatesApi.updateTemplate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        templateName: '更新后的名称',
      })
    );
  });

  it('deletes template after confirmation', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.deleteTemplate).mockResolvedValue({
      data: { code: 200, message: 'success', data: null },
    });

    // Mock confirm
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm');

    // Delete first template
    await wrapper.vm.handleDelete(mockTemplates[0]);

    expect(documentTemplatesApi.deleteTemplate).toHaveBeenCalledWith(1);
  });

  it('sets template as default', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.setDefaultTemplate).mockResolvedValue({
      data: { code: 200, message: 'success', data: null },
    });

    await wrapper.vm.handleSetDefault(mockTemplates[1]);

    expect(documentTemplatesApi.setDefaultTemplate).toHaveBeenCalledWith(
      2,
      'EXCEL'
    );
  });

  it('opens design dialog with correct template', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.getTemplateById).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        data: {
          ...mockTemplates[0],
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
        },
      },
    });

    await wrapper.vm.showDesignDialog(mockTemplates[0]);
    await flushPromises();

    expect(wrapper.vm.designerVisible).toBe(true);
    expect(wrapper.vm.currentTemplate).toEqual(mockTemplates[0]);
    expect(documentTemplatesApi.getTemplateById).toHaveBeenCalledWith(1);
  });

  it('opens export dialog with correct template', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    wrapper.vm.showExportDialog(mockTemplates[0]);
    await nextTick();

    expect(wrapper.vm.exportVisible).toBe(true);
    expect(wrapper.vm.currentTemplate).toEqual(mockTemplates[0]);
    expect(wrapper.vm.exportForm.fileName).toBe('Word模板1');
  });

  it('exports Word document successfully', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    const mockBlob = new Blob(['word content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    vi.mocked(documentTemplatesApi.exportWord).mockResolvedValue({ data: mockBlob });

    // Open export dialog
    wrapper.vm.showExportDialog(mockTemplates[0]);
    await nextTick();

    // Set export data
    wrapper.vm.exportForm.fileName = '测试导出';
    wrapper.vm.exportForm.dataJson = '{"caseName": "测试案件"}';
    await nextTick();

    // Export
    await wrapper.vm.handleExport();

    expect(documentTemplatesApi.exportWord).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        templateId: 1,
        fileName: '测试导出',
        data: { caseName: '测试案件' },
      })
    );
  });

  it('exports Excel document successfully', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    const mockBlob = new Blob(['excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    vi.mocked(documentTemplatesApi.exportExcel).mockResolvedValue({ data: mockBlob });

    // Open export dialog for Excel template
    wrapper.vm.showExportDialog(mockTemplates[1]);
    await nextTick();

    // Set export data
    wrapper.vm.exportForm.fileName = '测试导出';
    wrapper.vm.exportForm.dataJson = '{"creditorList": [{"name": "张三"}]}';
    await nextTick();

    // Export
    await wrapper.vm.handleExport();

    expect(documentTemplatesApi.exportExcel).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        templateId: 2,
        fileName: '测试导出',
        data: { creditorList: [{ name: '张三' }] },
      })
    );
  });

  it('shows error for invalid JSON in export', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    // Open export dialog
    wrapper.vm.showExportDialog(mockTemplates[0]);
    await nextTick();

    // Set invalid JSON
    wrapper.vm.exportForm.dataJson = 'invalid json';
    await nextTick();

    // Try to export
    await wrapper.vm.handleExport();

    // Should not call API
    expect(documentTemplatesApi.exportWord).not.toHaveBeenCalled();
  });

  it('loads export history', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    const mockHistory: ExportHistory[] = [
      {
        id: 1,
        templateId: 1,
        templateName: 'Word模板1',
        exportType: 'WORD',
        fileName: '导出文件.docx',
        fileSize: 10240,
        exportStatus: 'SUCCESS',
        exportedBy: 1,
        exportedByName: '管理员',
        exportedTime: '2024-01-01T00:00:00',
        processingTime: 1000,
        createTime: '2024-01-01T00:00:00',
      },
    ];

    vi.mocked(documentTemplatesApi.getTemplateExportHistory).mockResolvedValue({
      data: { code: 200, message: 'success', data: mockHistory },
    });

    await wrapper.vm.loadExportHistory(1);

    expect(documentTemplatesApi.getTemplateExportHistory).toHaveBeenCalledWith(1);
    expect(wrapper.vm.exportHistory).toEqual(mockHistory);
  });

  it('formats date correctly', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    const dateStr = '2024-01-15T10:30:00';
    const formatted = wrapper.vm.formatDate(dateStr);

    expect(formatted).not.toBe('-');
    expect(formatted).toContain('2024');
  });

  it('formats file size correctly', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    expect(wrapper.vm.formatFileSize(500)).toBe('500 B');
    expect(wrapper.vm.formatFileSize(1024)).toBe('1.0 KB');
    expect(wrapper.vm.formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('returns correct status type', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    expect(wrapper.vm.getStatusType('SUCCESS')).toBe('success');
    expect(wrapper.vm.getStatusType('FAILED')).toBe('danger');
    expect(wrapper.vm.getStatusType('PROCESSING')).toBe('warning');
    expect(wrapper.vm.getStatusType('UNKNOWN')).toBe('info');
  });

  it('returns correct status label', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    expect(wrapper.vm.getStatusLabel('SUCCESS')).toBe('成功');
    expect(wrapper.vm.getStatusLabel('FAILED')).toBe('失败');
    expect(wrapper.vm.getStatusLabel('PROCESSING')).toBe('处理中');
  });

  it('handles status change', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.updateTemplate).mockResolvedValue({
      data: { code: 200, message: 'success', data: mockTemplates[0] },
    });

    const template = { ...mockTemplates[0] };
    await wrapper.vm.handleStatusChange(template, 'INACTIVE');

    expect(documentTemplatesApi.updateTemplate).toHaveBeenCalledWith(
      1,
      { status: 'INACTIVE' }
    );
  });

  it('handles upload file', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    vi.mocked(documentTemplatesApi.uploadTemplateFile).mockResolvedValue({
      data: { code: 200, message: 'success', data: 'uploads/test.docx' },
    });

    // Set current template
    wrapper.vm.currentTemplate = mockTemplates[0];

    // Create a mock file
    const file = new File(['test'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    wrapper.vm.selectedFile = file;

    await wrapper.vm.handleUpload();

    expect(documentTemplatesApi.uploadTemplateFile).toHaveBeenCalledWith(1, file);
  });

  it('handles command correctly', async () => {
    const wrapper = mount(DocumentTemplates);
    await flushPromises();

    // Test upload command
    wrapper.vm.handleCommand('upload', mockTemplates[0]);
    expect(wrapper.vm.uploadVisible).toBe(true);

    // Test history command
    vi.mocked(documentTemplatesApi.getTemplateExportHistory).mockResolvedValue({
      data: { code: 200, message: 'success', data: [] },
    });
    await wrapper.vm.handleCommand('history', mockTemplates[0]);
    expect(wrapper.vm.historyVisible).toBe(true);
  });
});
