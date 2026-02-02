import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ApprovalList from './list.vue';
import { approvalApi } from '#/api/core/approval';

// Mock Vue Router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API
vi.mock('#/api/core/approval', () => ({
  approvalApi: {
    getApprovalList: vi.fn(),
  },
}));

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElSelect: { name: 'ElSelect', template: '<select><slot /></select>' },
  ElOption: { name: 'ElOption', template: '<option><slot /></option>' },
  ElTabs: { name: 'ElTabs', template: '<div><slot /></div>' },
  ElTabPane: { name: 'ElTabPane', template: '<div><slot /></div>' },
  ElScrollbar: { name: 'ElScrollbar', template: '<div><slot /></div>' },
  ElEmpty: { name: 'ElEmpty', template: '<div>暂无数据</div>' },
  ElMessage: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

// Mock Icon 组件
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span class="icon"><slot /></span>' },
}));

// Mock ApprovalCard 组件
vi.mock('#/components/ApprovalCard.vue', () => ({
  default: { name: 'ApprovalCard', template: '<div class="approval-card"><slot /></div>' },
}));

describe('ApprovalList', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.approval-list-page').exists()).toBe(true);
  });

  it('loads pending approvals on mount', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            id: 1,
            approvalTitle: '测试审批1',
            approvalStatus: 'PENDING',
            createTime: '2024-01-01T10:00:00',
          },
          {
            id: 2,
            approvalTitle: '测试审批2',
            approvalStatus: 'PENDING',
            createTime: '2024-01-02T11:00:00',
          },
        ],
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    // 验证 API 被调用，状态为 PENDING
    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'PENDING',
      pageNum: 1,
      pageSize: 20,
    });
  });

  it('switches tabs correctly', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: [],
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    // 切换到已审批标签
    wrapper.vm.handleTabChange('approved');

    expect(wrapper.vm.activeTab).toBe('approved');
    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'APPROVED',
      pageNum: 1,
      pageSize: 20,
    });

    // 切换到已拒绝标签
    wrapper.vm.handleTabChange('rejected');

    expect(wrapper.vm.activeTab).toBe('rejected');
    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'REJECTED',
      pageNum: 1,
      pageSize: 20,
    });
  });

  it('filters by type correctly', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: [],
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    // 选择审批类型
    wrapper.vm.selectedType = 'CASE';
    wrapper.vm.handleTypeChange();

    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'PENDING',
      approvalType: 'CASE',
      pageNum: 1,
      pageSize: 20,
    });
  });

  it('loads more approvals correctly', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            id: 3,
            approvalTitle: '测试审批3',
            approvalStatus: 'PENDING',
            createTime: '2024-01-03T12:00:00',
          },
        ],
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    // 设置初始数据
    wrapper.vm.approvals = [
      { id: 1, approvalTitle: '测试审批1' },
      { id: 2, approvalTitle: '测试审批2' },
    ];

    await wrapper.vm.loadMore();

    expect(wrapper.vm.currentPage).toBe(2);
    expect(wrapper.vm.approvals).toHaveLength(3);
    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'PENDING',
      pageNum: 2,
      pageSize: 20,
    });
  });

  it('formats time correctly', () => {
    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    const formatted = wrapper.vm.formatTime('2024-01-15T10:30:00');

    expect(formatted).toContain('2024');
    expect(formatted).toContain('01');
    expect(formatted).toContain('15');
  });

  it('returns empty string for invalid time', () => {
    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.vm.formatTime('')).toBe('');
    expect(wrapper.vm.formatTime(null as any)).toBe('');
    expect(wrapper.vm.formatTime(undefined as any)).toBe('');
  });

  it('navigates to detail page correctly', () => {
    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    wrapper.vm.goToDetail(123);

    expect(mockPush).toHaveBeenCalledWith('/approval/detail/123');
  });

  it('navigates to submit page correctly', () => {
    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    wrapper.vm.goToSubmit();

    expect(mockPush).toHaveBeenCalledWith('/approval/submit');
  });

  it('refreshes list correctly', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: [],
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();

    wrapper.vm.handleRefresh();

    expect(approvalApi.getApprovalList).toHaveBeenCalledWith({
      approvalStatus: 'PENDING',
      pageNum: 1,
      pageSize: 20,
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(approvalApi.getApprovalList).mockRejectedValue(new Error('API Error'));

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    // 即使 API 失败，组件也应该正常渲染
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm.loading).toBe(false);
  });

  it('sets hasMore correctly when list length equals pageSize', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: Array(20).fill({
          id: 1,
          approvalTitle: '测试审批',
          approvalStatus: 'PENDING',
        }),
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasMore).toBe(true);
  });

  it('sets hasMore to false when list length is less than pageSize', async () => {
    const mockResponse = {
      code: 200,
      message: 'success',
      data: {
        list: Array(10).fill({
          id: 1,
          approvalTitle: '测试审批',
          approvalStatus: 'PENDING',
        }),
      },
    };

    vi.mocked(approvalApi.getApprovalList).mockResolvedValue(mockResponse);

    const wrapper = mount(ApprovalList, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasMore).toBe(false);
  });
});
