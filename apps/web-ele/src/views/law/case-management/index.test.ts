import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CaseManagement from '#/views/law/case-management/index.vue';
import * as caseApi from '#/api/core/case';
import * as workTeamApi from '#/api/core/work-team';

vi.mock('#/api/core/case');
vi.mock('#/api/core/work-team');

describe('CaseManagement', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders correctly', () => {
    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('fetches case list on mount', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        total: 1,
        list: [
          {
            id: 1,
            caseNumber: '（2024）沪02破1号',
            caseName: '测试案件',
            caseProgress: 'FIRST',
            caseStatus: 'IN_PROGRESS',
            createTime: '2024-01-01T00:00:00',
          },
        ],
      },
    };

    vi.mocked(caseApi).getCaseListApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(caseApi.getCaseListApi).toHaveBeenCalledWith({
      pageNum: 1,
      pageSize: 10,
    });
  });

  it('fetches my cases when tab is myCases', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        total: 1,
        list: [
          {
            id: 1,
            caseNumber: '（2024）沪02破1号',
            caseName: '我的案件',
            caseProgress: 'FIRST',
            caseStatus: 'IN_PROGRESS',
            createTime: '2024-01-01T00:00:00',
          },
        ],
      },
    };

    vi.mocked(workTeamApi).selectMyCasesApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    wrapper.vm.activeTab = 'myCases';
    wrapper.vm.currentUserId = 1;
    await wrapper.vm.fetchCaseList();

    expect(workTeamApi.selectMyCasesApi).toHaveBeenCalledWith(1, 1, 10);
  });

  it('fetches team cases when tab is teamCases', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        total: 1,
        list: [
          {
            id: 1,
            caseNumber: '（2024）沪02破1号',
            caseName: '团队案件',
            caseProgress: 'FIRST',
            caseStatus: 'IN_PROGRESS',
            createTime: '2024-01-01T00:00:00',
          },
        ],
      },
    };

    vi.mocked(workTeamApi).selectTeamCasesApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    wrapper.vm.activeTab = 'teamCases';
    await wrapper.vm.fetchCaseList();

    expect(workTeamApi.selectTeamCasesApi).toHaveBeenCalledWith(1, 10);
  });

  it('handles pagination changes', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        total: 20,
        list: [],
      },
    };

    vi.mocked(caseApi).getCaseListApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    wrapper.vm.handlePageChange(2);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.pagination.page).toBe(2);
    expect(caseApi.getCaseListApi).toHaveBeenCalledWith({
      pageNum: 2,
      pageSize: 10,
    });
  });

  it('handles page size changes', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        total: 20,
        list: [],
      },
    };

    vi.mocked(caseApi).getCaseListApi.mockResolvedValue(mockResponse);

    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    wrapper.vm.handleSizeChange(20);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.pagination.pageSize).toBe(20);
    expect(wrapper.vm.pagination.page).toBe(1);
  });

  it('maps case progress correctly', () => {
    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    expect(wrapper.vm.getCaseProgressType('第一阶段')).toBe('primary');
    expect(wrapper.vm.getCaseProgressType('已结案')).toBe('success');
  });

  it('maps case status correctly', () => {
    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    expect(wrapper.vm.getCaseStatusType('待处理')).toBe('info');
    expect(wrapper.vm.getCaseStatusType('进行中')).toBe('primary');
    expect(wrapper.vm.getCaseStatusType('已完成')).toBe('success');
    expect(wrapper.vm.getCaseStatusType('已结案')).toBe('success');
    expect(wrapper.vm.getCaseStatusType('已终结')).toBe('warning');
  });

  it('maps review status correctly', () => {
    const wrapper = mount(CaseManagement, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-pagination': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-tag': true,
        },
      },
    });

    expect(wrapper.vm.getReviewStatusType('待审核')).toBe('warning');
    expect(wrapper.vm.getReviewStatusType('已通过')).toBe('success');
    expect(wrapper.vm.getReviewStatusType('已驳回')).toBe('danger');
  });
});
