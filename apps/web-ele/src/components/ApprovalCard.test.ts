import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ApprovalCard from './ApprovalCard.vue';
import { approvalApi } from '#/api/core/approval';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>', props: ['type'] },
  ElCard: { name: 'ElCard', template: '<div class="el-card"><slot /></div>' },
  ElMessage: { success: vi.fn(), error: vi.fn() },
  ElMessageBox: {
    confirm: vi.fn(),
    prompt: vi.fn(),
  },
  ElInput: { name: 'ElInput', template: '<input />' },
}));

// Mock Icon 组件
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span class="icon" />' },
}));

// Mock API
vi.mock('#/api/core/approval', () => ({
  approvalApi: {
    approve: vi.fn(),
  },
  approvalUtils: {
    parseApprovalContent: vi.fn((content) => {
      if (!content) return null;
      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    }),
  },
}));

describe('ApprovalCard', () => {
  const mockApproval = {
    id: 1,
    approvalTitle: '测试审批',
    caseNumber: '（2024）沪02破1号',
    approvalType: 'CASE',
    approvalStatus: 'PENDING',
    createTime: '2024-01-15T10:30:00',
    realName: '张三',
    approvalContent: JSON.stringify({
      task: {
        taskName: '测试任务',
        taskCode: 'TASK_001',
      },
      submissions: [{ id: 1 }],
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => '1'),
      },
      writable: true,
    });
  });

  it('renders correctly with pending status', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.approval-card').exists()).toBe(true);
  });

  it('renders correctly with readonly mode', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: true,
      },
    });

    // 在 readonly 模式下，不应该显示操作按钮
    expect(wrapper.find('.approval-actions').exists()).toBe(false);
  });

  it('displays approval title correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.text()).toContain('测试审批');
  });

  it('displays case number correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.text()).toContain('（2024）沪02破1号');
  });

  it('displays approval type correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.text()).toContain('案件审核');
  });

  it('displays submitter name correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.text()).toContain('张三');
  });

  it('formats time correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    // 检查时间是否被格式化显示
    const text = wrapper.text();
    expect(text).toContain('2024');
  });

  it('returns empty string for invalid time', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: {
          ...mockApproval,
          createTime: '',
        },
      },
    });

    // 组件应该正常渲染，即使时间为空
    expect(wrapper.exists()).toBe(true);
  });

  it('gets correct status color', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.vm.getStatusColor('PENDING')).toBe('warning');
    expect(wrapper.vm.getStatusColor('APPROVED')).toBe('success');
    expect(wrapper.vm.getStatusColor('REJECTED')).toBe('danger');
    expect(wrapper.vm.getStatusColor('CANCELLED')).toBe('info');
    expect(wrapper.vm.getStatusColor('UNKNOWN')).toBe('info');
  });

  it('gets correct status text', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.vm.getStatusText('PENDING')).toBe('待审核');
    expect(wrapper.vm.getStatusText('APPROVED')).toBe('已通过');
    expect(wrapper.vm.getStatusText('REJECTED')).toBe('已驳回');
    expect(wrapper.vm.getStatusText('CANCELLED')).toBe('已取消');
    expect(wrapper.vm.getStatusText('UNKNOWN')).toBe('UNKNOWN');
  });

  it('gets correct type text', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    expect(wrapper.vm.getTypeText('CASE')).toBe('案件审核');
    expect(wrapper.vm.getTypeText('DOCUMENT')).toBe('文书审核');
    expect(wrapper.vm.getTypeText('INFO')).toBe('信息审核');
    expect(wrapper.vm.getTypeText('TASK_001')).toBe('提交破产申请材料');
    expect(wrapper.vm.getTypeText('UNKNOWN')).toBe('UNKNOWN');
  });

  it('parses approval content correctly', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
      },
    });

    const contentData = wrapper.vm.contentData;
    expect(contentData).not.toBeNull();
    expect(contentData.task.taskName).toBe('测试任务');
    expect(contentData.task.taskCode).toBe('TASK_001');
  });

  it('handles approve action', async () => {
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true);
    vi.mocked(approvalApi.approve).mockResolvedValue({ code: 200 } as any);

    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    await wrapper.vm.handleApprove();

    expect(ElMessageBox.confirm).toHaveBeenCalled();
    expect(approvalApi.approve).toHaveBeenCalledWith(1, {
      approvalResult: 'PASS',
      approvalOpinion: '审核通过',
      approverId: 1,
    });
  });

  it('handles reject action', async () => {
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.prompt).mockResolvedValue({ value: '不符合要求' });
    vi.mocked(approvalApi.approve).mockResolvedValue({ code: 200 } as any);

    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    await wrapper.vm.handleReject();

    expect(ElMessageBox.prompt).toHaveBeenCalled();
    expect(approvalApi.approve).toHaveBeenCalledWith(1, {
      approvalResult: 'REJECT',
      approvalOpinion: '不符合要求',
      approverId: 1,
    });
  });

  it('emits refresh event after approve', async () => {
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true);
    vi.mocked(approvalApi.approve).mockResolvedValue({ code: 200 } as any);

    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    await wrapper.vm.handleApprove();

    expect(wrapper.emitted('refresh')).toBeTruthy();
  });

  it('emits refresh event after reject', async () => {
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.prompt).mockResolvedValue({ value: '' });
    vi.mocked(approvalApi.approve).mockResolvedValue({ code: 200 } as any);

    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    await wrapper.vm.handleReject();

    expect(wrapper.emitted('refresh')).toBeTruthy();
  });

  it('handles cancel action gracefully', async () => {
    const { ElMessageBox } = await import('element-plus');
    vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel');

    const wrapper = mount(ApprovalCard, {
      props: {
        approval: mockApproval,
        readonly: false,
      },
    });

    // 不应该抛出错误
    await expect(wrapper.vm.handleApprove()).resolves.not.toThrow();
  });

  it('displays approval date when available', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: {
          ...mockApproval,
          approvalDate: '2024-01-16T14:00:00',
        },
      },
    });

    expect(wrapper.text()).toContain('审核时间');
  });

  it('displays remark when available', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: {
          ...mockApproval,
          remark: '这是备注信息',
        },
      },
    });

    expect(wrapper.text()).toContain('这是备注信息');
  });

  it('uses fallback values for missing fields', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        approval: {
          id: 1,
          approvalStatus: 'PENDING',
          createTime: '2024-01-15T10:30:00',
        },
      },
    });

    // 应该使用默认值
    expect(wrapper.text()).toContain('审核申请');
    expect(wrapper.text()).toContain('系统');
  });
});
