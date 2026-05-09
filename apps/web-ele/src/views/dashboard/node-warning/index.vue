<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import {
  ElAlert,
  ElBadge,
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElStatistic,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';
import type { FormInstance } from 'element-plus';

import {
  type CaseNodeApi,
  applyExtensionApi,
  completeNodeApi,
  getAllUserNodeInstancesApi,
  getExtensionsByNodeIdApi,
  startNodeApi,
} from '#/api/core/case-node';

interface DashboardNode {
  id: number;
  caseId: number;
  templateId: number;
  nodeCode: string;
  nodeName: string;
  nodeStatus: CaseNodeApi.NodeStatus;
  startDate: string | null;
  deadlineDate: string;
  completedDate: string | null;
  extensionCount: number;
  extensionDays: number;
  responsiblePersonId: number | null;
  responsiblePersonName: string | null;
  alertLevel: CaseNodeApi.AlertLevel;
  sortOrder: number;
  caseName?: string;
  caseNumber?: string;
  remainingDays?: number;
}

const router = useRouter();
const loading = ref(false);
const activeTab = ref('all');
const selectedStatus = ref('');
const detailDialogVisible = ref(false);
const completeDialogVisible = ref(false);
const extensionDialogVisible = ref(false);
const extensionHistoryVisible = ref(false);
const selectedNode = ref<DashboardNode | null>(null);
const completeFormRef = ref<FormInstance>();
const extensionFormRef = ref<FormInstance>();

const completeForm = ref({
  remark: '',
  completeDate: '',
});

const extensionForm = ref({
  extensionDays: 7,
  applyReason: '',
});

const extensionHistory = ref<CaseNodeApi.ExtensionApplication[]>([]);

const allNodes = ref<DashboardNode[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

const alertLevelMap: Record<string, { label: string; color: string; type: 'error' | 'warning' | 'success' | 'info' }> = {
  OVERDUE: { label: '已逾期', color: '#ff4d4f', type: 'error' },
  DUE_TODAY: { label: '今日到期', color: '#fa8c16', type: 'warning' },
  SOON_DUE: { label: '即将到期', color: '#faad14', type: 'warning' },
  NORMAL: { label: '正常', color: '#52c41a', type: 'success' },
};

const nodeStatusMap: Record<string, string> = {
  PENDING: '待启动',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  EXTENSION_REQUESTED: '延期申请中',
  EXTENDED: '已延期',
};

const nodeStatusTypeMap: Record<string, 'info' | 'primary' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  EXTENSION_REQUESTED: 'warning',
  EXTENDED: 'warning',
};

const statistics = computed(() => {
  return {
    total: allNodes.value.length,
    overdue: allNodes.value.filter((n) => n.alertLevel === 'OVERDUE').length,
    dueToday: allNodes.value.filter((n) => n.alertLevel === 'DUE_TODAY').length,
    soonDue: allNodes.value.filter((n) => n.alertLevel === 'SOON_DUE').length,
    normal: allNodes.value.filter((n) => n.alertLevel === 'NORMAL').length,
  };
});

const filteredNodes = computed(() => {
  let filtered = allNodes.value;

  if (activeTab.value === 'overdue') {
    filtered = filtered.filter((n) => n.alertLevel === 'OVERDUE');
  } else if (activeTab.value === 'dueToday') {
    filtered = filtered.filter((n) => n.alertLevel === 'DUE_TODAY');
  } else if (activeTab.value === 'soonDue') {
    filtered = filtered.filter((n) => n.alertLevel === 'SOON_DUE');
  } else if (activeTab.value === 'normal') {
    filtered = filtered.filter((n) => n.alertLevel === 'NORMAL');
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((n) => n.nodeStatus === selectedStatus.value);
  }

  totalCount.value = filtered.length;

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

const getAlertLevelInfo = (level: string) => {
  return alertLevelMap[level] || { label: level, color: '#999', type: 'info' };
};

const getRemainingDaysText = (node: DashboardNode) => {
  if (node.alertLevel === 'OVERDUE') {
    const days = node.remainingDays ?? Math.ceil((new Date().getTime() - new Date(node.deadlineDate).getTime()) / (1000 * 60 * 60 * 24));
    return `已逾期${Math.abs(days)}天`;
  }
  if (node.alertLevel === 'DUE_TODAY') {
    return '今日到期';
  }
  const days = node.remainingDays ?? Math.ceil((new Date(node.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return `剩余${days}天`;
};



const loadDashboardData = async () => {
  loading.value = true;
  try {
    const chatUserId = localStorage.getItem('chat_user_id');
    const userId = chatUserId ? Number(chatUserId) : undefined;

    if (!userId) {
      ElMessage.warning('未获取到用户信息');
      allNodes.value = [];
      return;
    }

    const response = await getAllUserNodeInstancesApi(userId);
    console.log('[loadDashboardData] API 响应:', response);

    const data = Array.isArray(response?.data) ? response.data : [];
    
    allNodes.value = data.map((item: any) => {
      const remainingDays = calculateRemainingDays(item.deadlineDate);
      const alertLevel = calculateAlertLevel(item.nodeStatus, remainingDays);
      
      return {
        ...item,
        remainingDays,
        alertLevel,
      };
    });
    
    totalCount.value = allNodes.value.length;
    console.log('[loadDashboardData] 数据加载成功，节点数量:', allNodes.value.length);
  } catch (error) {
    console.error('[loadDashboardData] 加载预警数据失败，错误详情:', error);
    ElMessage.error('加载预警数据失败');
    allNodes.value = [];
  } finally {
    loading.value = false;
  }
};

const calculateRemainingDays = (deadlineDate: string): number => {
  if (!deadlineDate) return 999;
  const deadline = new Date(deadlineDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateAlertLevel = (nodeStatus: string, remainingDays: number): CaseNodeApi.AlertLevel => {
  if (nodeStatus === 'COMPLETED') {
    return 'NORMAL';
  }
  
  if (remainingDays < 0) {
    return 'OVERDUE';
  }
  
  if (remainingDays === 0) {
    return 'DUE_TODAY';
  }
  
  if (remainingDays <= 3) {
    return 'SOON_DUE';
  }
  
  return 'NORMAL';
};

const handleTabChange = async (tabName: string) => {
  activeTab.value = tabName;
  currentPage.value = 1;
};

const handleViewDetail = (node: DashboardNode) => {
  selectedNode.value = node;
  detailDialogVisible.value = true;
};

const handleCompleteNode = (node: DashboardNode) => {
  selectedNode.value = node;
  completeForm.value = {
    remark: '',
    completeDate: new Date().toISOString().slice(0, 10),
  };
  completeDialogVisible.value = true;
};

const handleConfirmComplete = async () => {
  if (!completeFormRef.value || !selectedNode.value) return;

  const node = selectedNode.value;
  await completeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const chatUserId = localStorage.getItem('chat_user_id');
        const userId = chatUserId ? Number(chatUserId) : 0;

        const response = await completeNodeApi(
          node.id,
          userId,
          completeForm.value.remark,
        );

        if (response.code === 200) {
          ElMessage.success('节点已完成');
          completeDialogVisible.value = false;
          await loadDashboardData();
        } else {
          ElMessage.error(response.message || '操作失败');
        }
      } catch (error: any) {
        ElMessage.error(error?.message || '完成节点失败');
      }
    }
  });
};

const handleStartNode = async (node: DashboardNode) => {
  try {
    const chatUserId = localStorage.getItem('chat_user_id');
    const userId = chatUserId ? Number(chatUserId) : 0;

    const response = await startNodeApi(node.id, userId);
    if (response.code === 200) {
      ElMessage.success('节点已启动');
      await loadDashboardData();
    } else {
      ElMessage.error(response.message || '启动失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '启动节点失败');
  }
};

const handleApplyExtension = (node: DashboardNode) => {
  selectedNode.value = node;
  extensionForm.value = {
    extensionDays: 7,
    applyReason: '',
  };
  extensionDialogVisible.value = true;
};

const handleConfirmExtension = async () => {
  if (!extensionFormRef.value || !selectedNode.value) return;

  const node = selectedNode.value;
  await extensionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const chatUserId = localStorage.getItem('chat_user_id');
        const chatUserName = localStorage.getItem('chat_user_name');
        const userId = chatUserId ? Number(chatUserId) : 0;
        const userName = chatUserName || '未知用户';

        const response = await applyExtensionApi({
          nodeInstanceId: node.id,
          caseId: node.caseId,
          extensionDays: extensionForm.value.extensionDays,
          applyReason: extensionForm.value.applyReason,
          applyUserId: userId,
          applyUserName: userName,
        });

        if (response.code === 200) {
          ElMessage.success('延期申请已提交');
          extensionDialogVisible.value = false;
          await loadDashboardData();
        } else {
          ElMessage.error(response.message || '申请失败');
        }
      } catch (error: any) {
        ElMessage.error(error?.message || '提交延期申请失败');
      }
    }
  });
};

const handleViewExtensionHistory = async (node: DashboardNode) => {
  try {
    const response = await getExtensionsByNodeIdApi(node.id);
    if (response.code === 200 && response.data) {
      extensionHistory.value = response.data;
      extensionHistoryVisible.value = true;
    } else {
      extensionHistory.value = [];
      ElMessage.info('暂无延期申请记录');
    }
  } catch (error) {
    ElMessage.error('查询延期记录失败');
  }
};

const handleNavigateToCase = (caseId: number) => {
  router.push(`/law/case-detail/${caseId}`);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const approvalStatusMap: Record<string, string> = {
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

const approvalStatusTypeMap: Record<string, 'info' | 'success' | 'danger'> = {
  PENDING: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const nodeCodeDescriptionMap: Record<string, { title: string; description: string; tasks: string[] }> = {
  CLAIM_FILING_PERIOD: {
    title: '债权申报期限',
    description: '自人民法院发布受理破产申请公告之日起，债权人应当在规定期限内向管理人申报债权。',
    tasks: [
      '发布债权申报公告，确定申报期限（一般为30日至90日）',
      '接收债权人提交的债权申报材料',
      '对申报的债权进行登记造册',
      '审查债权的真实性、合法性',
      '编制债权表，记载债权人的姓名、债权数额、债权性质等信息',
      '将债权表提交第一次债权人会议核查',
    ],
  },
  FIRST_CREDITOR_MEETING: {
    title: '第一次债权人会议',
    description: '由人民法院召集，在债权申报期限届满后15日内召开，是破产程序中的重要会议。',
    tasks: [
      '核查债权表，确认无异议债权',
      '选举债权人委员会成员（如需要）',
      '审议管理人报酬方案',
      '决定债务人财产的管理方案',
      '决定继续或停止债务人的营业',
      '通过债务人财产变价方案',
      '通过破产财产分配方案',
    ],
  },
  TAKEOVER_DEBTOR: {
    title: '全面接管债务人',
    description: '管理人自被指定之日起，应当全面接管债务人的财产、印章、账簿、文书等资料。',
    tasks: [
      '接管债务人的全部财产，包括固定资产、流动资产、无形资产等',
      '接管债务人的印章、证照',
      '接管债务人的账簿、文书等资料',
      '调查债务人财产状况，制作财产状况报告',
      '决定债务人的日常开支和其他必要开支',
      '代表债务人参加诉讼、仲裁或其他法律程序',
    ],
  },
  INVESTIGATE_PROPERTY: {
    title: '调查财产及经营状况',
    description: '管理人应当对债务人的财产、债权债务、经营状况等进行全面调查。',
    tasks: [
      '调查债务人的银行存款、不动产、动产、股权等财产',
      '调查债务人的对外债权',
      '调查债务人的经营状况和财务状况',
      '调查债务人是否存在隐匿、转移财产等行为',
      '制作财产状况报告和债权债务清册',
      '向债权人会议报告调查结果',
    ],
  },
  CLAIM_REVIEW: {
    title: '审查申报债权并编制债权表',
    description: '管理人应当对债权人申报的债权进行审查，编制债权表供债权人会议核查。',
    tasks: [
      '审查债权申报材料的完整性和真实性',
      '核实债权的数额、性质、担保情况',
      '对有争议的债权进行标注',
      '编制债权表，分类记载各类债权',
      '将债权表提交债权人会议核查',
      '处理债权异议，必要时提起诉讼',
    ],
  },
  LIQ_PROPERTY_VALUATION: {
    title: '破产财产变价方案',
    description: '管理人应当拟订破产财产变价方案，提交债权人会议讨论通过。',
    tasks: [
      '对破产财产进行评估，确定财产价值',
      '拟订破产财产变价方案',
      '选择适当的变价方式（拍卖、变卖等）',
      '将变价方案提交债权人会议表决',
      '按照通过的方案实施财产变价',
      '记录变价过程和结果',
    ],
  },
  LIQ_PROPERTY_DISTRIBUTION: {
    title: '破产财产分配方案',
    description: '破产财产变价后，管理人应当拟订破产财产分配方案，按照法定顺序进行分配。',
    tasks: [
      '计算可供分配的破产财产总额',
      '确定各类债权的分配顺序和比例',
      '拟订破产财产分配方案',
      '将分配方案提交债权人会议表决',
      '按照分配方案实施财产分配',
      '制作分配记录，记载分配情况',
    ],
  },
  LIQ_TERMINATION: {
    title: '提请终结破产程序',
    description: '破产财产分配完毕后，管理人应当提请人民法院裁定终结破产程序。',
    tasks: [
      '确认破产财产已分配完毕',
      '制作破产财产分配报告',
      '提请人民法院裁定终结破产程序',
      '办理管理人职务终止手续',
      '移交剩余事务',
      '保存破产案件档案',
    ],
  },
  LIQ_ENTERPRISE_CANCELLATION: {
    title: '办理企业注销登记',
    description: '破产程序终结后，管理人应当向企业登记机关办理注销登记。',
    tasks: [
      '准备注销登记所需材料',
      '向市场监督管理部门申请注销登记',
      '缴回营业执照、公章等',
      '办理税务注销',
      '办理社保、公积金等注销',
      '公告企业终止',
    ],
  },
  LIQ_ARCHIVE: {
    title: '破产案件归档',
    description: '破产程序终结后，管理人应当将破产案件的全部材料整理归档。',
    tasks: [
      '收集整理破产程序中的全部文件资料',
      '编制档案目录',
      '按照档案管理规定装订成册',
      '移交档案保管单位',
      '制作档案移交清单',
      '保存电子档案备份',
    ],
  },
};

const getNodeDescription = (nodeCode: string) => {
  return nodeCodeDescriptionMap[nodeCode] || null;
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="node-warning-container">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <Icon icon="lucide:alert-triangle" :size="28" class="title-icon" />
            节点预警看板
          </h2>
          <p class="page-description">
            监控破产案件关键时间节点，及时预警法定期限，确保案件办理合规高效
          </p>
        </div>
        <div class="header-right">
          <ElButton type="primary" size="large" @click="loadDashboardData" :loading="loading">
            <Icon icon="lucide:refresh-cw" :size="16" class="mr-2" />
            刷新数据
          </ElButton>
        </div>
      </div>
    </div>

    <ElAlert
      title="测试提示"
      type="warning"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #default>
        <div class="testing-alert-content">
          <Icon icon="lucide:flask-conical" :size="16" class="testing-alert-icon" />
          <strong>该功能尚在测试中，仅供预览请勿使用</strong>
        </div>
      </template>
    </ElAlert>

    <ElAlert
      title="预警说明"
      type="info"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #default>
        <div class="alert-content">
          <span class="alert-item"><span class="alert-dot" style="background: #ff4d4f;"></span><strong>已逾期：</strong>deadlineDate &lt; 今天，需立即处理</span>
          <span class="alert-item"><span class="alert-dot" style="background: #fa8c16;"></span><strong>今日到期：</strong>deadlineDate = 今天，请尽快完成</span>
          <span class="alert-item"><span class="alert-dot" style="background: #faad14;"></span><strong>即将到期：</strong>deadlineDate &lt;= 今天+3天，请注意跟进</span>
          <span class="alert-item"><span class="alert-dot" style="background: #52c41a;"></span><strong>正常：</strong>&gt;3天，请关注后续节点</span>
        </div>
      </template>
    </ElAlert>

    <ElRow :gutter="20" class="statistics-cards">
      <ElCol :xs="12" :sm="12" :md="6" :lg="6">
        <ElCard shadow="hover" class="stat-card stat-card--overdue" @click="handleTabChange('overdue')">
          <div class="stat-card-content">
            <div class="stat-icon stat-icon--overdue">
              <Icon icon="lucide:alert-octagon" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.overdue }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6" :lg="6">
        <ElCard shadow="hover" class="stat-card stat-card--due-today" @click="handleTabChange('dueToday')">
          <div class="stat-card-content">
            <div class="stat-icon stat-icon--due-today">
              <Icon icon="lucide:alert-circle" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.dueToday }}</div>
              <div class="stat-label">今日到期</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6" :lg="6">
        <ElCard shadow="hover" class="stat-card stat-card--soon-due" @click="handleTabChange('soonDue')">
          <div class="stat-card-content">
            <div class="stat-icon stat-icon--soon-due">
              <Icon icon="lucide:clock" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.soonDue }}</div>
              <div class="stat-label">即将到期</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="12" :sm="12" :md="6" :lg="6">
        <ElCard shadow="hover" class="stat-card stat-card--normal" @click="handleTabChange('normal')">
          <div class="stat-card-content">
            <div class="stat-icon stat-icon--normal">
              <Icon icon="lucide:check-circle" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.normal }}</div>
              <div class="stat-label">正常</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h3>节点列表</h3>
            <ElBadge :value="statistics.total" class="total-badge" />
          </div>
          <div class="card-actions">
            <ElSelect
              v-model="selectedStatus"
              placeholder="节点状态"
              clearable
              style="width: 150px"
              @change="currentPage = 1"
            >
              <ElOption label="全部状态" value="" />
              <ElOption label="待启动" value="PENDING" />
              <ElOption label="进行中" value="IN_PROGRESS" />
              <ElOption label="已完成" value="COMPLETED" />
              <ElOption label="延期申请中" value="EXTENSION_REQUESTED" />
              <ElOption label="已延期" value="EXTENDED" />
            </ElSelect>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeTab" @tab-change="(name) => handleTabChange(name as string)">
        <ElTabPane label="全部节点" name="all">
          <ElBadge :value="statistics.total" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="已逾期" name="overdue">
          <ElBadge :value="statistics.overdue" type="danger" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="今日到期" name="dueToday">
          <ElBadge :value="statistics.dueToday" type="warning" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="即将到期" name="soonDue">
          <ElBadge :value="statistics.soonDue" type="warning" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="正常" name="normal">
          <ElBadge :value="statistics.normal" type="success" class="tab-badge" />
        </ElTabPane>
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="filteredNodes"
        style="width: 100%"
        row-key="id"
        stripe
        empty-text="暂无节点数据"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />

        <ElTableColumn label="案件信息" min-width="200">
          <template #default="{ row }">
            <div class="case-info-cell">
              <ElButton type="primary" link @click="handleNavigateToCase(row.caseId)">
                <Icon icon="lucide:folder-open" :size="14" class="mr-1" />
                {{ row.caseName || `案件#${row.caseId}` }}
              </ElButton>
              <span class="case-number">{{ row.caseNumber || '-' }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="nodeName" label="节点名称" min-width="150">
          <template #default="{ row }">
            <div class="node-name-cell">
              <Icon icon="lucide:calendar-clock" :size="16" />
              <span>{{ row.nodeName }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="节点状态" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="nodeStatusTypeMap[row.nodeStatus] || 'info'" size="small" effect="light">
              {{ nodeStatusMap[row.nodeStatus] || row.nodeStatus }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="截止日期" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.alertLevel === 'OVERDUE', 'text-warning': row.alertLevel === 'DUE_TODAY' }">
              {{ formatDate(row.deadlineDate) }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="预警状态" width="130" align="center">
          <template #default="{ row }">
            <div class="alert-status">
              <ElTag
                :color="getAlertLevelInfo(row.alertLevel).color"
                effect="dark"
                size="small"
              >
                {{ getAlertLevelInfo(row.alertLevel).label }}
              </ElTag>
              <span class="remaining-text">{{ getRemainingDaysText(row) }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="责任人" width="120" align="center">
          <template #default="{ row }">
            <div class="responsible-cell">
              <Icon icon="lucide:user" :size="14" />
              <span>{{ row.responsiblePersonName || '-' }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <ElButton
                type="primary"
                size="small"
                text
                @click="handleViewDetail(row)"
              >
                <Icon icon="lucide:eye" :size="14" class="mr-1" />
                详情
              </ElButton>
              <ElButton
                v-if="row.nodeStatus === 'PENDING'"
                type="success"
                size="small"
                text
                @click="handleStartNode(row)"
              >
                <Icon icon="lucide:play" :size="14" class="mr-1" />
                启动
              </ElButton>
              <ElButton
                v-if="row.nodeStatus === 'IN_PROGRESS'"
                type="success"
                size="small"
                text
                @click="handleCompleteNode(row)"
              >
                <Icon icon="lucide:check" :size="14" class="mr-1" />
                完成
              </ElButton>
              <ElButton
                v-if="row.nodeStatus !== 'COMPLETED'"
                type="warning"
                size="small"
                text
                @click="handleApplyExtension(row)"
              >
                <Icon icon="lucide:clock" :size="14" class="mr-1" />
                延期
              </ElButton>
              <ElButton
                type="info"
                size="small"
                text
                @click="handleViewExtensionHistory(row)"
              >
                <Icon icon="lucide:list" :size="14" class="mr-1" />
                记录
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <div v-if="filteredNodes.length === 0 && !loading" class="empty-container">
        <ElEmpty description="暂无节点数据">
          <template #image>
            <Icon icon="lucide:inbox" :size="64" style="color: #d9d9d9;" />
          </template>
        </ElEmpty>
      </div>

      <div v-if="totalCount > pageSize" class="pagination-container">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- 节点详情对话框 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="节点详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="selectedNode" class="detail-content">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="节点名称" :span="2">
            <span class="detail-text">{{ selectedNode.nodeName }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="节点编码">
            <span class="detail-text">{{ selectedNode.nodeCode }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="所属案件">
            <ElButton type="primary" link @click="handleNavigateToCase(selectedNode.caseId)">
              {{ selectedNode.caseName || `案件#${selectedNode.caseId}` }}
            </ElButton>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="节点状态">
            <ElTag :type="nodeStatusTypeMap[selectedNode.nodeStatus] || 'info'">
              {{ nodeStatusMap[selectedNode.nodeStatus] || selectedNode.nodeStatus }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="预警级别">
            <ElTag :color="getAlertLevelInfo(selectedNode.alertLevel).color" effect="dark">
              {{ getAlertLevelInfo(selectedNode.alertLevel).label }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="开始日期">
            <span class="detail-text">{{ formatDate(selectedNode.startDate) }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="截止日期">
            <span class="detail-text">{{ formatDate(selectedNode.deadlineDate) }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="完成日期">
            <span class="detail-text">{{ formatDate(selectedNode.completedDate) }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="责任人">
            <span class="detail-text">{{ selectedNode.responsiblePersonName || '-' }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="延期次数">
            <span class="detail-text">{{ selectedNode.extensionCount }} 次</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="延期天数">
            <span class="detail-text">{{ selectedNode.extensionDays }} 天</span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="detail-section">
          <h4>预警说明</h4>
          <ElAlert
            :type="getAlertLevelInfo(selectedNode.alertLevel).type"
            :title="getRemainingDaysText(selectedNode)"
            :closable="false"
            show-icon
          />
        </div>

        <div v-if="getNodeDescription(selectedNode.nodeCode)" class="detail-section">
          <h4>节点说明</h4>
          <div class="node-description-card">
            <div class="node-description-header">
              <Icon icon="lucide:info" :size="20" class="node-description-icon" />
              <span class="node-description-title">{{ getNodeDescription(selectedNode.nodeCode)?.title }}</span>
            </div>
            <p class="node-description-text">{{ getNodeDescription(selectedNode.nodeCode)?.description }}</p>
            <div class="node-tasks">
              <div class="node-tasks-title">具体任务：</div>
              <ul class="node-tasks-list">
                <li v-for="(task, index) in getNodeDescription(selectedNode.nodeCode)?.tasks" :key="index" class="node-task-item">
                  <span class="task-number">{{ index + 1 }}</span>
                  <span class="task-text">{{ task }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        <ElButton
          v-if="selectedNode && selectedNode.nodeStatus === 'PENDING'"
          type="primary"
          @click="handleStartNode(selectedNode); detailDialogVisible = false;"
        >
          启动节点
        </ElButton>
        <ElButton
          v-if="selectedNode && selectedNode.nodeStatus === 'IN_PROGRESS'"
          type="success"
          @click="handleCompleteNode(selectedNode); detailDialogVisible = false;"
        >
          标记完成
        </ElButton>
      </template>
    </ElDialog>

    <!-- 标记完成对话框 -->
    <ElDialog
      v-model="completeDialogVisible"
      title="标记节点完成"
      width="500px"
      destroy-on-close
    >
      <ElForm
        ref="completeFormRef"
        :model="completeForm"
        label-width="100px"
      >
        <ElFormItem label="节点名称">
          <span class="form-static-text">{{ selectedNode?.nodeName }}</span>
        </ElFormItem>
        <ElFormItem label="完成日期" prop="completeDate">
          <ElDatePicker
            v-model="completeForm.completeDate"
            type="date"
            placeholder="选择完成日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="完成备注" prop="remark">
          <ElInput
            v-model="completeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入完成备注（可选）"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="completeDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmComplete">
          确认完成
        </ElButton>
      </template>
    </ElDialog>

    <!-- 延期申请对话框 -->
    <ElDialog
      v-model="extensionDialogVisible"
      title="申请延期"
      width="500px"
      destroy-on-close
    >
      <ElForm
        ref="extensionFormRef"
        :model="extensionForm"
        label-width="100px"
      >
        <ElFormItem label="节点名称">
          <span class="form-static-text">{{ selectedNode?.nodeName }}</span>
        </ElFormItem>
        <ElFormItem label="当前截止">
          <span class="form-static-text">{{ formatDate(selectedNode?.deadlineDate || null) }}</span>
        </ElFormItem>
        <ElFormItem label="延期天数" prop="extensionDays" required>
          <ElInput
            v-model.number="extensionForm.extensionDays"
            type="number"
            min="1"
            max="365"
            placeholder="请输入延期天数"
          >
            <template #append>天</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="申请理由" prop="applyReason" required>
          <ElInput
            v-model="extensionForm.applyReason"
            type="textarea"
            :rows="3"
            placeholder="请输入申请延期的理由"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="extensionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmExtension">
          提交申请
        </ElButton>
      </template>
    </ElDialog>

    <!-- 延期记录对话框 -->
    <ElDialog
      v-model="extensionHistoryVisible"
      title="延期申请记录"
      width="700px"
      destroy-on-close
    >
      <ElTimeline v-if="extensionHistory.length > 0">
        <ElTimelineItem
          v-for="record in extensionHistory"
          :key="record.id"
          :type="record.approvalStatus === 'APPROVED' ? 'success' : record.approvalStatus === 'REJECTED' ? 'danger' : 'warning'"
          :timestamp="record.applyTime"
        >
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-title">延期 {{ record.extensionDays }} 天</span>
              <ElTag :type="approvalStatusTypeMap[record.approvalStatus] || 'info'" size="small">
                {{ approvalStatusMap[record.approvalStatus] || record.approvalStatus }}
              </ElTag>
            </div>
            <div class="timeline-detail">
              <p><strong>申请人：</strong>{{ record.applyUserName }}</p>
              <p><strong>申请理由：</strong>{{ record.applyReason }}</p>
              <p><strong>原截止日期：</strong>{{ formatDate(record.originalDeadline) }}</p>
              <p><strong>新截止日期：</strong>{{ formatDate(record.newDeadline) }}</p>
              <p v-if="record.approverName"><strong>审批人：</strong>{{ record.approverName }}</p>
              <p v-if="record.approvalOpinion"><strong>审批意见：</strong>{{ record.approvalOpinion }}</p>
            </div>
          </div>
        </ElTimelineItem>
      </ElTimeline>
      <ElEmpty v-else description="暂无延期申请记录" />
    </ElDialog>
  </div>
</template>

<style scoped>
.node-warning-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-title {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.title-icon {
  color: #faad14;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.mb-4 {
  margin-bottom: 20px;
}

.testing-alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6a23c;
}

.testing-alert-icon {
  animation: testingAlertPulse 2s ease-in-out infinite;
}

@keyframes testingAlertPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.alert-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.statistics-cards {
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  border: none;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon--overdue {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.stat-icon--due-today {
  background: linear-gradient(135deg, #fa8c16 0%, #ffc069 100%);
}

.stat-icon--soon-due {
  background: linear-gradient(135deg, #faad14 0%, #ffd666 100%);
}

.stat-icon--normal {
  background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.table-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-badge {
  margin-left: 4px;
}

.card-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.tab-badge {
  margin-left: 4px;
}

:deep(.el-badge__content) {
  font-size: 11px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
}

.case-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.case-info-cell :deep(.el-button) {
  padding: 0;
  justify-content: flex-start;
  font-weight: 500;
}

.case-number {
  font-size: 12px;
  color: #999;
}

.node-name-cell {
  display: flex;
  gap: 6px;
  align-items: center;
}

.responsible-cell {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.alert-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.remaining-text {
  font-size: 12px;
  color: #666;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.empty-container {
  padding: 60px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-text {
  font-size: 14px;
  color: #303133;
}

.form-static-text {
  font-size: 14px;
  color: #303133;
  line-height: 32px;
}

.text-danger {
  color: #ff4d4f;
  font-weight: 600;
}

.text-warning {
  color: #fa8c16;
  font-weight: 600;
}

.timeline-content {
  padding: 8px 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-title {
  font-weight: 600;
  font-size: 14px;
}

.timeline-detail {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.timeline-detail p {
  margin: 4px 0;
}

.node-description-card {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.node-description-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.node-description-icon {
  color: #409eff;
}

.node-description-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.node-description-text {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #d9d9d9;
}

.node-tasks-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.node-tasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.node-task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.node-task-item:last-child {
  border-bottom: none;
}

.task-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-text {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  flex: 1;
}

.ml-3 {
  margin-left: 12px;
}

.mr-2 {
  margin-right: 8px;
}

.mr-1 {
  margin-right: 4px;
}

@media (max-width: 1200px) {
  .node-warning-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .node-warning-container {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .alert-content {
    flex-direction: column;
    gap: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
  }

  .card-actions .el-select {
    flex: 1;
  }

  .action-buttons {
    justify-content: flex-start;
  }

  .stat-card-content {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
