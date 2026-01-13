import { mount } from '@vue/test-utils';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as caseApi from '#/api/core/case';
import * as courtApi from '#/api/core/court';
import * as managerApi from '#/api/core/manager';
import CaseAdd from '#/views/law/case-add/index.vue';

vi.mock('#/api/core/case');
vi.mock('#/api/core/court');
vi.mock('#/api/core/manager');

describe('caseAdd', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('shows no permission message when user does not have case:add permission', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    expect(wrapper.find('.no-permission').exists()).toBe(true);
  });

  it('fetches court list on mount', async () => {
    const mockResponse = {
      status: '1',
      data: {
        records: [
          {
            FYQC: '上海市第一中级人民法院',
          },
        ],
      },
    };

    vi.mocked(courtApi).getCourtListApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(courtApi.getCourtListApi).toHaveBeenCalledWith({
      page: 1,
      size: 100,
    });
  });

  it('fetches manager list on mount', async () => {
    const mockResponse = {
      code: 200,
      data: {
        list: [
          {
            id: 1,
            administratorName: '张三',
          },
        ],
      },
    };

    vi.mocked(managerApi).getManagerListApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(managerApi.getManagerListApi).toHaveBeenCalledWith({
      pageNum: 1,
      pageSize: 100,
    });
  });

  it('validates required fields', async () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    await wrapper.vm.submitForm();

    expect(wrapper.vm.formRef.validate).toHaveBeenCalled();
  });

  it('submits form with correct data', async () => {
    const mockResponse = {
      code: 200,
      data: {
        caseId: 1,
        caseNumber: '（2024）沪02破1号',
      },
    };

    vi.mocked(caseApi).addOneCaseApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    wrapper.vm.form.caseNumber = '（2024）沪02破1号';
    wrapper.vm.form.caseName = '测试案件';
    wrapper.vm.form.acceptanceDate = '2024-01-01';

    await wrapper.vm.submitForm();

    expect(caseApi.addOneCaseApi).toHaveBeenCalledWith({
      caseNumber: '（2024）沪02破1号',
      caseName: '测试案件',
      acceptanceDate: '2024-01-01',
      caseSource: '',
      acceptanceCourt: '',
      designatedInstitution: '浙江浦源律师事务所',
      mainResponsiblePerson: '',
      isSimplifiedTrial: 0,
      caseReason: '',
      caseProgress: 'FIRST',
      debtClaimDeadline: '',
      filingDate: '',
      remarks: '',
    });
  });

  it('resets form correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    wrapper.vm.form.caseNumber = '（2024）沪02破1号';
    wrapper.vm.resetForm();

    expect(wrapper.vm.form.caseNumber).toBe('');
  });

  it('validates case number format', async () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    wrapper.vm.form.caseNumber = 'invalid@case#number';

    const isValid = await wrapper.vm.formRef.validate();
    expect(isValid).toBe(false);
  });

  it('validates field lengths', async () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    wrapper.vm.form.caseNumber = 'a'.repeat(51);

    const isValid = await wrapper.vm.formRef.validate();
    expect(isValid).toBe(false);
  });

  it('handles file upload correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    const mockFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf',
    });
    const event = {
      target: {
        files: [mockFile],
      },
    };

    wrapper.vm.handleFileChange(event);

    expect(wrapper.vm.uploadedFiles.length).toBe(1);
    expect(wrapper.vm.uploadedFiles[0].name).toBe('test.pdf');
  });

  it('removes file correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-result': true,
        },
      },
    });

    wrapper.vm.uploadedFiles = [
      { name: 'test.pdf', file: new File(['test'], 'test.pdf'), url: '' },
    ];

    wrapper.vm.removeFile(0);

    expect(wrapper.vm.uploadedFiles.length).toBe(0);
  });
});
