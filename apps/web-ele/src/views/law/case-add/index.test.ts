import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CaseAdd from '#/views/law/case-add/index.vue';
import * as caseApi from '#/api/core/case';
import * as courtApi from '#/api/core/court';
import * as managerApi from '#/api/core/manager';

vi.mock('#/api/core/case');
vi.mock('#/api/core/court');
vi.mock('#/api/core/manager');

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({
    accessCodes: ['case:add'],
    accessRoutes: [],
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('element-plus', () => ({
  ElLoading: {
    service: vi.fn(() => ({ close: vi.fn() })),
  },
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  ElMessageBox: { confirm: vi.fn().mockResolvedValue('confirm') },
}));

const mockValidate = vi.fn().mockResolvedValue(true);
const mockResetFields = vi.fn();

const baseStubs = {
  'el-card': true,
  'el-form': {
    name: 'ElForm',
    template: '<form><slot /></form>',
    methods: {
      validate: mockValidate,
      resetFields: mockResetFields,
    },
  },
  'el-form-item': true,
  'el-input': true,
  'el-select': true,
  'el-option': true,
  'el-date-picker': true,
  'el-button': true,
  'el-result': true,
  'el-row': true,
  'el-col': true,
  'el-loading': true,
  'el-message': true,
  'el-dialog': true,
  'el-message-box': true,
};

describe('CaseAdd', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('fetches court list on mount', async () => {
    const mockResponse = {
      code: 200,
      data: {
        list: [
          {
            fullName: '上海市第一中级人民法院',
          },
        ],
      },
    };

    vi.mocked(courtApi.getCourtListApi).mockResolvedValue(mockResponse as any);

    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
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

    vi.mocked(managerApi).getManagerListApi.mockResolvedValue(mockResponse as any);

    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    await wrapper.vm.$nextTick();

    expect(managerApi.getManagerListApi).toHaveBeenCalledWith({
      pageNum: 1,
      pageSize: 100,
    });
  });

  it('has default form values', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    // 验证表单默认值设置
    expect(wrapper.vm.form.mainResponsiblePerson).toBe('李国祥');
    expect(wrapper.vm.form.designatedInstitution).toBe('');
    expect(wrapper.vm.form.isSimplifiedTrial).toBe(0);
    expect(wrapper.vm.form.caseProgress).toBe('FIRST');
  });

  it('has form validation rules defined', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    expect(wrapper.vm.rules).toBeDefined();
    expect(wrapper.vm.rules.caseNumber).toBeDefined();
    expect(wrapper.vm.rules.caseName).toBeDefined();
  });

  it('handles file upload correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const event = {
      target: {
        files: [mockFile],
        value: '',
      },
    } as any;

    wrapper.vm.handleFileChange(event);

    expect(wrapper.vm.uploadedFiles.length).toBe(1);
    expect(wrapper.vm.uploadedFiles[0].name).toBe('test.pdf');
  });

  it('removes file correctly', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    wrapper.vm.uploadedFiles = [
      { name: 'test.pdf', file: new File(['test'], 'test.pdf'), url: '', fileId: 0 },
    ];

    wrapper.vm.removeFile(0);

    expect(wrapper.vm.uploadedFiles.length).toBe(0);
  });

  it('handles multiple file uploads', () => {
    const wrapper = mount(CaseAdd, {
      global: {
        plugins: [pinia],
        stubs: baseStubs,
      },
    });

    const mockFile1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
    const mockFile2 = new File(['test2'], 'test2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const event1 = {
      target: {
        files: [mockFile1],
        value: '',
      },
    } as any;

    wrapper.vm.handleFileChange(event1);

    const event2 = {
      target: {
        files: [mockFile2],
        value: '',
      },
    } as any;

    wrapper.vm.handleFileChange(event2);

    expect(wrapper.vm.uploadedFiles.length).toBe(2);
    expect(wrapper.vm.uploadedFiles[0].name).toBe('test1.pdf');
    expect(wrapper.vm.uploadedFiles[1].name).toBe('test2.docx');
  });
});
