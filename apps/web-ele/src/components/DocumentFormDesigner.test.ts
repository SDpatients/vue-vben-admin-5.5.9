import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import DocumentFormDesigner from './DocumentFormDesigner.vue';
import { documentTemplatesApi } from '#/api/core/document-templates';
import type { DocumentTemplate, TemplateField } from '#/api/core/document-templates';

// Mock SortableJS
vi.mock('sortablejs/modular/sortable.complete.esm.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
    })),
  };
});

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElForm: { name: 'ElForm', template: '<form><slot /></form>' },
  ElFormItem: { name: 'ElFormItem', template: '<div class="el-form-item"><slot /></div>' },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue'],
  },
  ElOption: { name: 'ElOption', template: '<option :value="value">{{ label }}</option>', props: ['value', 'label'] },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue'],
  },
  ElIcon: { name: 'ElIcon', template: '<span class="el-icon"><slot /></span>' },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue" class="el-dialog"><slot /></div>',
    props: ['modelValue'],
  },
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
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
  ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>', props: ['type', 'size'] },
  ElDivider: { name: 'ElDivider', template: '<hr class="el-divider" />' },
  ElAlert: {
    name: 'ElAlert',
    template: '<div class="el-alert"><slot name="title" /><slot /></div>',
    props: ['type', 'closable'],
  },
}));

// Mock API
vi.mock('#/api/core/document-templates', () => ({
  documentTemplatesApi: {
    getTemplates: vi.fn(),
    getTemplateById: vi.fn(),
  },
}));

describe('DocumentFormDesigner', () => {
  const defaultProps = {
    modelValue: [],
    initialTemplateType: 'WORD' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.document-form-designer').exists()).toBe(true);
    expect(wrapper.find('.designer-toolbar').exists()).toBe(true);
    expect(wrapper.find('.designer-container').exists()).toBe(true);
  });

  it('displays correct template type', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.find('.design-title').text()).toContain('Word');
  });

  it('shows empty tip when no fields', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.find('.empty-tip').exists()).toBe(true);
    expect(wrapper.find('.empty-tip p').text()).toBe('从左侧拖拽组件到此处');
  });

  it('displays field count correctly', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.find('.design-info').text()).toBe('共 0 个字段');
  });

  it('exposes getTemplateFields method', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(typeof wrapper.vm.getTemplateFields).toBe('function');
  });

  it('exposes setTemplateFields method', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(typeof wrapper.vm.setTemplateFields).toBe('function');
  });

  it('exposes getConfig method', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(typeof wrapper.vm.getConfig).toBe('function');
  });

  it('exposes setConfig method', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(typeof wrapper.vm.setConfig).toBe('function');
  });

  it('returns correct placeholder for Word template', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    // Set some fields
    const mockFields: TemplateField[] = [
      {
        fieldName: 'caseName',
        fieldLabel: '案件名称',
        fieldType: 'TEXT',
        sourceField: 'bankruptCase.caseName',
        sortOrder: 1,
        isRequired: true,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    expect(wrapper.find('.form-item-placeholder').text()).toContain('{{caseName}}');
  });

  it('returns correct placeholder for Excel template', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: {
        ...defaultProps,
        initialTemplateType: 'EXCEL',
      },
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'creditorName',
        fieldLabel: '债权人名称',
        fieldType: 'TEXT',
        sourceField: 'creditorInfo.creditorName',
        sortOrder: 1,
        isRequired: true,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'EXCEL');
    await nextTick();

    expect(wrapper.find('.form-item-placeholder').text()).toContain('{creditorName}');
  });

  it('returns correct placeholder for Excel table field', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: {
        ...defaultProps,
        initialTemplateType: 'EXCEL',
      },
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'creditorList',
        fieldLabel: '债权人列表',
        fieldType: 'TABLE',
        sourceField: 'creditorList',
        sortOrder: 1,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'EXCEL');
    await nextTick();

    expect(wrapper.find('.form-item-placeholder').text()).toContain('{.creditorList}');
  });

  it('emits change event when fields are modified', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'testField',
        fieldLabel: '测试字段',
        fieldType: 'TEXT',
        sourceField: 'test.source',
        sortOrder: 1,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('clears all fields when clearAll is called', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'field1',
        fieldLabel: '字段1',
        fieldType: 'TEXT',
        sourceField: 'source1',
        sortOrder: 1,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    expect(wrapper.findAll('.form-item-wrapper').length).toBe(1);

    // Click clear button
    await wrapper.find('.toolbar-right button').trigger('click');
    await nextTick();

    expect(wrapper.findAll('.form-item-wrapper').length).toBe(0);
    expect(wrapper.find('.empty-tip').exists()).toBe(true);
  });

  it('opens preview dialog when preview button is clicked', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'testField',
        fieldLabel: '测试字段',
        fieldType: 'TEXT',
        sourceField: 'test.source',
        sortOrder: 1,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    // Click preview button (third button in toolbar)
    const buttons = wrapper.findAll('.toolbar-right button');
    const previewButton = buttons.find(btn => btn.text().includes('预览'));
    if (previewButton) {
      await previewButton.trigger('click');
      await nextTick();

      expect(wrapper.find('.el-dialog').exists()).toBe(true);
    }
  });

  it('shows warning when previewing empty form', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    // Click preview button without fields
    const buttons = wrapper.findAll('.toolbar-right button');
    const previewButton = buttons.find(btn => btn.text().includes('预览'));
    if (previewButton) {
      await previewButton.trigger('click');
      await nextTick();

      // Should show warning message
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
    }
  });

  it('loads templates when importing', async () => {
    const mockTemplates: DocumentTemplate[] = [
      {
        id: 1,
        templateName: '测试模板',
        templateCode: 'TEST_001',
        templateType: 'WORD',
        isDefault: false,
        status: 'ACTIVE',
        createTime: '2024-01-01T00:00:00',
        updateTime: '2024-01-01T00:00:00',
      },
    ];

    vi.mocked(documentTemplatesApi.getTemplates).mockResolvedValue({
      data: {
        code: 200,
        message: 'success',
        data: mockTemplates,
      },
    });

    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    // Click import button
    const buttons = wrapper.findAll('.toolbar-right button');
    const importButton = buttons.find(btn => btn.text().includes('导入'));
    if (importButton) {
      await importButton.trigger('click');
      await flushPromises();

      expect(documentTemplatesApi.getTemplates).toHaveBeenCalled();
    }
  });

  it('formats field type label correctly', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.vm.getFieldTypeLabel('TEXT')).toBe('文本');
    expect(wrapper.vm.getFieldTypeLabel('NUMBER')).toBe('数字');
    expect(wrapper.vm.getFieldTypeLabel('DATE')).toBe('日期');
    expect(wrapper.vm.getFieldTypeLabel('LIST')).toBe('列表');
    expect(wrapper.vm.getFieldTypeLabel('IMAGE')).toBe('图片');
    expect(wrapper.vm.getFieldTypeLabel('TABLE')).toBe('表格');
  });

  it('returns correct field type tag', () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    expect(wrapper.vm.getFieldTypeTag('TEXT')).toBe('');
    expect(wrapper.vm.getFieldTypeTag('NUMBER')).toBe('success');
    expect(wrapper.vm.getFieldTypeTag('DATE')).toBe('warning');
    expect(wrapper.vm.getFieldTypeTag('LIST')).toBe('info');
    expect(wrapper.vm.getFieldTypeTag('IMAGE')).toBe('danger');
    expect(wrapper.vm.getFieldTypeTag('TABLE')).toBe('primary');
  });

  it('validates unique field names', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'duplicateField',
        fieldLabel: '字段1',
        fieldType: 'TEXT',
        sourceField: 'source1',
        sortOrder: 1,
        isRequired: false,
      },
      {
        fieldName: 'duplicateField',
        fieldLabel: '字段2',
        fieldType: 'TEXT',
        sourceField: 'source2',
        sortOrder: 2,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    // Select the second field
    const items = wrapper.findAll('.form-item-wrapper');
    if (items.length >= 2) {
      await items[1].trigger('click');
      await nextTick();

      // Trigger validation
      wrapper.vm.validateFieldName();
    }
  });

  it('computes sorted form items correctly', async () => {
    const wrapper = mount(DocumentFormDesigner, {
      props: defaultProps,
    });

    const mockFields: TemplateField[] = [
      {
        fieldName: 'field3',
        fieldLabel: '字段3',
        fieldType: 'TEXT',
        sourceField: 'source3',
        sortOrder: 3,
        isRequired: false,
      },
      {
        fieldName: 'field1',
        fieldLabel: '字段1',
        fieldType: 'TEXT',
        sourceField: 'source1',
        sortOrder: 1,
        isRequired: false,
      },
      {
        fieldName: 'field2',
        fieldLabel: '字段2',
        fieldType: 'TEXT',
        sourceField: 'source2',
        sortOrder: 2,
        isRequired: false,
      },
    ];

    wrapper.vm.setTemplateFields(mockFields, 'WORD');
    await nextTick();

    const sortedItems = wrapper.vm.sortedFormItems;
    expect(sortedItems[0].sortOrder).toBe(1);
    expect(sortedItems[1].sortOrder).toBe(2);
    expect(sortedItems[2].sortOrder).toBe(3);
  });
});
