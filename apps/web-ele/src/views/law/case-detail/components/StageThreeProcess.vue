<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElEmpty,
  ElMessage,
  ElProgress,
  ElRow,
  ElSkeleton,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  addBankExpensesApi,
  addCreditorClaimApi,
  addLitigationArbitrationApi,
  addPropertyInvestigationApi,
  addReclaimReviewApi,
  addRightsClaimApi,
  addSocialSecurtyFeesApi,
  addTaxVerificationApi,
  getAllBankExpensesApi,
  getAllCreditorClaimApi,
  getAllLitigationArbitrationApi,
  getAllPropertyInvestigationApi,
  getAllReclaimReviewApi,
  getAllRightsClaimApi,
  getAllSociaSFApi,
  getAllTaxVerificationApi,
} from '#/api/core/case-process';

import TaskEdit from '../TaskEdit.vue';

interface Props {
  caseId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const tasks = ref<any[]>([]);
const showTaskEdit = ref(false);
const currentTask = ref<any>(null);
const currentTaskType = ref('');
const currentMode = ref<'add' | 'complete' | 'edit' | 'skip' | 'view'>('add');

const taskConfig = [
  {
    key: 'propertyInvestigation',
    name: '财产调查',
    icon: 'lucide:search',
    api: getAllPropertyInvestigationApi,
    addApi: addPropertyInvestigationApi,
    operateType: 0,
    fields: [
      { label: '调查类型', prop: 'tclx' },
      { label: '调查内容', prop: 'tcnr' },
      { label: '调查日期', prop: 'tcrq', isDate: true },
      { label: '调查人', prop: 'tcr' },
      { label: '调查发现', prop: 'tcfx' },
      { label: '调查状态', prop: 'tczt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'bankExpenses',
    name: '破产费用管理',
    icon: 'lucide:dollar-sign',
    api: getAllBankExpensesApi,
    addApi: addBankExpensesApi,
    operateType: 1,
    fields: [
      { label: '费用类型', prop: 'fylx' },
      { label: '费用名称', prop: 'fymc' },
      { label: '金额', prop: 'je', isNumber: true },
      { label: '支付日期', prop: 'zfrq', isDate: true },
      { label: '支付状态', prop: 'zfzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'rightsClaim',
    name: '权利主张',
    icon: 'lucide:scale',
    api: getAllRightsClaimApi,
    addApi: addRightsClaimApi,
    operateType: 2,
    fields: [
      { label: '主张类型', prop: 'zzlxcx' },
      { label: '主张内容', prop: 'zznr' },
      { label: '主张日期', prop: 'zzrq', isDate: true },
      { label: '主张人', prop: 'zzr' },
      { label: '法院回应', prop: 'fyhy' },
      { label: '主张状态', prop: 'zzzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'reclaimReview',
    name: '取回权审查',
    icon: 'lucide:arrow-left-circle',
    api: getAllReclaimReviewApi,
    addApi: addReclaimReviewApi,
    operateType: 3,
    fields: [
      { label: '权利人名称', prop: 'qlrmc' },
      { label: '取回权基础', prop: 'qhqjc' },
      { label: '财产是否存在', prop: 'ccsfcz' },
      { label: '对待给付义务', prop: 'ddgfyw' },
      { label: '审查日期', prop: 'scrq', isDate: true },
      { label: '审查人', prop: 'scr' },
      { label: '审查决定', prop: 'scjd' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'litigationArbitration',
    name: '诉讼仲裁',
    icon: 'lucide:gavel',
    api: getAllLitigationArbitrationApi,
    addApi: addLitigationArbitrationApi,
    operateType: 4,
    fields: [
      { label: '类型', prop: 'lx' },
      { label: '相对方', prop: 'xdf' },
      { label: '法院', prop: 'fy' },
      { label: '诉讼内容', prop: 'ssnr' },
      { label: '诉讼状态', prop: 'sszt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },

  {
    key: 'socialSecurityFees',
    name: '社保费用',
    icon: 'lucide:users',
    api: getAllSociaSFApi,
    addApi: addSocialSecurtyFeesApi,
    operateType: 6,
    fields: [
      { label: '费用类型', prop: 'fylx' },
      { label: '费用金额', prop: 'fyje', isNumber: true },
      { label: '社保机构', prop: 'sbjg' },
      { label: '核定日期', prop: 'hdrq', isDate: true },
      { label: '核定人', prop: 'hdr' },
      { label: '核定状态', prop: 'hdzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'taxVerification',
    name: '税收核定',
    icon: 'lucide:calculator',
    api: getAllTaxVerificationApi,
    addApi: addTaxVerificationApi,
    operateType: 7,
    fields: [
      { label: '税种', prop: 'sz' },
      { label: '税款金额', prop: 'skje', isNumber: true },
      { label: '税务机关', prop: 'swjg' },
      { label: '核定日期', prop: 'hdrq', isDate: true },
      { label: '核定人', prop: 'hdr' },
      { label: '核定状态', prop: 'hdzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
];

const taskStatusMap = {
  0: { label: '待确认', type: 'info', color: '#409EFF' },
  1: { label: '完成', type: 'success', color: '#67C23A' },
  2: { label: '跳过', type: 'warning', color: '#E6A23C' },
};

const fieldNameMap: Record<string, Record<string, string>> = {
  propertyInvestigation: {
    investigationType: 'tclx',
    investigationContent: 'tcnr',
    investigationDate: 'tcrq',
    investigator: 'tcr',
    investigationFindings: 'tcfx',
    investigationStatus: 'tczt',
    status: 'zt',
    sepId: 'sepId',
  },
  bankExpenses: {
    expenseType: 'fylx',
    expenseName: 'fymc',
    amount: 'je',
    paymentDate: 'zfrq',
    paymentStatus: 'zfzt',
    status: 'zt',
    sepId: 'sepId',
  },
  rightsClaim: {
    claimType: 'zzlxcx',
    claimContent: 'zznr',
    claimDate: 'zzrq',
    claimant: 'zzr',
    courtResponse: 'fyhy',
    claimStatus: 'zzzt',
    status: 'zt',
    sepId: 'sepId',
  },
  reclaimReview: {
    claimantName: 'qlrmc',
    reclaimRightBasis: 'qhqjc',
    propertyExists: 'ccsfcz',
    reciprocalObligation: 'ddgfyw',
    reviewDate: 'scrq',
    reviewer: 'scr',
    reviewDecision: 'scjd',
    status: 'zt',
    sepId: 'sepId',
  },
  litigationArbitration: {
    type: 'lx',
    oppositeParty: 'xdf',
    court: 'fy',
    litigationContent: 'ssnr',
    litigationStatus: 'sszt',
    status: 'zt',
    sepId: 'sepId',
  },

  socialSecurityFees: {
    feeType: 'fylx',
    feeAmount: 'fyje',
    socialSecurityAgency: 'sbjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
    status: 'zt',
    sepId: 'sepId',
  },
  taxVerification: {
    taxType: 'sz',
    taxAmount: 'skje',
    taxAuthority: 'swjg',
    verificationDate: 'hdrq',
    verifier: 'hdr',
    verificationStatus: 'hdzt',
    status: 'zt',
    sepId: 'sepId',
  },
};

const transformData = (taskKey: string, data: any[]) => {
  const map = fieldNameMap[taskKey];
  if (!map) return data;

  return data.map((item) => {
    const transformed: any = {};
    Object.keys(item).forEach((key) => {
      // 特殊处理sepId字段
      if (key === 'sepId' || key === 'SEP_ID' || key === 'row') {
        transformed.sepId = item[key];
      } else if (map[key]) {
        // 如果有映射，使用映射后的小写字段名
        transformed[map[key]] = item[key];
      } else {
        // 否则直接使用原字段名
        transformed[key] = item[key];
      }
    });
    return transformed;
  });
};

const fetchTaskData = async (taskConfigItem: any) => {
  try {
    const response = await taskConfigItem.api(props.caseId, 1, 10);

    // 添加调试日志
    console.log(`=== ${taskConfigItem.name} API响应调试信息 ===`);
    console.log('完整响应:', response);
    console.log('响应状态码:', response.code || response.status);
    console.log('响应数据:', response.data);

    // 检查响应结构，兼容不同的响应格式
    const isSuccess = response.code === 200 || response.status === '1';
    const responseData = response.data?.records || response.data || [];

    // 转换字段名从大写改为小写
    const transformedData = transformData(taskConfigItem.key, responseData);

    if (isSuccess) {
      return {
        ...taskConfigItem,
        data: transformedData,
        count: response.data?.count || responseData.length,
        status: 'loaded',
      };
    } else {
      const errorMsg = response.message || response.error || '未知错误';
      console.error(`获取${taskConfigItem.name}失败:`, errorMsg);
      ElMessage.error(`获取${taskConfigItem.name}失败：${errorMsg}`);
      return {
        ...taskConfigItem,
        data: [],
        count: 0,
        status: 'error',
      };
    }
  } catch (error: any) {
    console.error(`获取${taskConfigItem.name}失败:`, error);
    ElMessage.error(
      `获取${taskConfigItem.name}失败：${error.message || '网络异常'}`,
    );
    return {
      ...taskConfigItem,
      data: [],
      count: 0,
      status: 'error',
    };
  }
};

const loadAllTasks = async () => {
  loading.value = true;
  try {
    const promises = taskConfig.map((config) => fetchTaskData(config));
    const results = await Promise.allSettled(promises);
    tasks.value = results
      .map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error('任务加载失败:', result.reason);
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error('加载任务失败:', error);
    ElMessage.error('加载任务失败');
  } finally {
    loading.value = false;
  }
};

const getTaskStatus = (task: any) => {
  if (task.data && task.data.length > 0) {
    const completedCount = task.data.filter(
      (item: any) =>
        item.zt === '1' || item.zt === 1 || item.zt === '2' || item.zt === 2,
    ).length;
    if (completedCount === task.data.length) {
      return 1;
    } else if (completedCount > 0) {
      return 0;
    }
  }
  return 0;
};

const getTaskProgress = (task: any) => {
  if (task.data && task.data.length > 0) {
    const completedCount = task.data.filter(
      (item: any) =>
        item.zt === '1' || item.zt === 1 || item.zt === '2' || item.zt === 2,
    ).length;
    return Math.round((completedCount / task.data.length) * 100);
  }
  return 0;
};

const getTaskStatusInfo = (task: any) => {
  const status = getTaskStatus(task);
  return (
    taskStatusMap[status as keyof typeof taskStatusMap] || taskStatusMap[0]
  );
};

const getStatusInfo = (status: string) => {
  const statusNum = Number.parseInt(status, 10);
  return (
    taskStatusMap[statusNum as keyof typeof taskStatusMap] || taskStatusMap[0]
  );
};

const formatTaskDate = (dateStr: string) => {
  if (!dateStr || dateStr === '1900-01-01T00:00:00') {
    return '-';
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

const handleAdd = (task: any) => {
  currentTask.value = null;
  currentTaskType.value = task.key;
  currentMode.value = 'add';
  showTaskEdit.value = true;
};

const handleEdit = (task: any, item: any) => {
  // 确保传递的数据包含sepId字段（从原始数据中获取）
  const taskData = {
    ...item,
    sepId: item.sepId || item.SEP_ID || item.row,
  };
  currentTask.value = taskData;
  currentTaskType.value = task.key;
  currentMode.value = 'edit';
  showTaskEdit.value = true;
};

const handleView = (task: any, item: any) => {
  const taskData = {
    ...item,
    sepId: item.sepId || item.SEP_ID || item.row,
  };
  currentTask.value = taskData;
  currentTaskType.value = task.key;
  currentMode.value = 'view';
  showTaskEdit.value = true;
};

const handleComplete = async (task: any, item: any) => {
  const taskData = {
    ...item,
    sepId: item.sepId || item.SEP_ID || item.row,
  };
  currentTask.value = taskData;
  currentTaskType.value = task.key;
  currentMode.value = 'complete';
  showTaskEdit.value = true;
};

const handleSkip = async (task: any, item: any) => {
  const taskData = {
    ...item,
    sepId: item.sepId || item.SEP_ID || item.row,
  };
  currentTask.value = taskData;
  currentTaskType.value = task.key;
  currentMode.value = 'skip';
  showTaskEdit.value = true;
};

const handleRevoke = (task: any, item: any) => {
  const taskData = {
    ...item,
    sepId: item.sepId || item.SEP_ID || item.row,
  };
  currentTask.value = taskData;
  currentTaskType.value = task.key;
  currentMode.value = 'revoke';
  showTaskEdit.value = true;
};

const handleTaskEditClose = () => {
  showTaskEdit.value = false;
  currentTask.value = null;
  currentTaskType.value = '';
};

const handleTaskSaved = () => {
  loadAllTasks();
  handleTaskEditClose();
};

onMounted(() => {
  loadAllTasks();
});
</script>

<template>
  <div class="stage-three-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:search" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段三：管理人调查审查破产企业至第一次债权人会议前工作
              </h2>
              <p class="stage-description">
                完成财产调查、破产费用管理、权利主张、取回权审查、诉讼仲裁、债权申报、社保费用和税收核定等工作
              </p>
            </div>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <ElSkeleton :rows="5" animated />
      </div>

      <div v-else class="tasks-container">
        <ElRow :gutter="20">
          <ElCol
            v-for="task in tasks"
            :key="task.key"
            :xs="24"
            :sm="24"
            :lg="24"
            class="task-col"
          >
            <ElCard class="task-card" shadow="hover">
              <template #header>
                <div class="task-card-header">
                  <div class="task-title">
                    <Icon :icon="task.icon" class="task-icon" />
                    <span>{{ task.name }}</span>
                  </div>
                  <div style="display: flex; gap: 12px; align-items: center">
                    <ElTag :type="getTaskStatusInfo(task).type" size="small">
                      {{ getTaskStatusInfo(task).label }}
                    </ElTag>
                    <ElButton
                      type="primary"
                      size="small"
                      @click="handleAdd(task)"
                    >
                      <Icon icon="lucide:plus" class="mr-1" />
                      新增
                    </ElButton>
                  </div>
                </div>
              </template>

              <div class="task-content">
                <div class="task-progress mb-4">
                  <div class="progress-info">
                    <span>完成进度</span>
                    <span class="progress-text">{{ getTaskProgress(task) }}%</span>
                  </div>
                  <ElProgress
                    :percentage="getTaskProgress(task)"
                    :color="getTaskStatusInfo(task).color"
                    :stroke-width="8"
                  />
                  <div class="task-count">
                    <span>
                      <span style="color: #67c23a">
                        {{
                          task.data?.filter(
                            (item: any) => item.zt === '1' || item.zt === 1,
                          ).length || 0
                        }}
                      </span>
                      <span style="margin: 0 4px">+</span>
                      <span style="color: #e6a23c">
                        {{
                          task.data?.filter(
                            (item: any) => item.zt === '2' || item.zt === 2,
                          ).length || 0
                        }}
                      </span>
                    </span>
                    <span>/</span>
                    <span>{{ task.count || 0 }}</span>
                    <span>项已完成</span>
                    <span
                      style="margin-left: 8px; font-size: 11px; color: #999"
                    >
                      ({{
                        task.data?.filter(
                          (item: any) => item.zt === '1' || item.zt === 1,
                        ).length || 0
                      }}完成,
                      {{
                        task.data?.filter(
                          (item: any) => item.zt === '2' || item.zt === 2,
                        ).length || 0
                      }}跳过)
                    </span>
                  </div>
                </div>

                <div v-if="task.data && task.data.length > 0" class="task-list">
                  <ElTable
                    :data="task.data"
                    size="small"
                    :show-header="true"
                    class="task-table"
                  >
                    <ElTableColumn
                      v-for="field in task.fields"
                      :key="field.prop"
                      :prop="field.prop"
                      :label="field.label"
                      min-width="150"
                      show-overflow-tooltip
                    >
                      <template #default="scope">
                        <span v-if="field.isDate">{{
                          formatTaskDate(scope.row[field.prop])
                        }}</span>
                        <ElTag
                          v-else-if="field.isStatus"
                          :type="getStatusInfo(scope.row[field.prop]).type"
                          size="small"
                        >
                          {{ getStatusInfo(scope.row[field.prop]).label }}
                        </ElTag>
                        <span v-else>{{ scope.row[field.prop] || '-' }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn width="350" fixed="right">
                      <template #default="scope">
                        <div class="action-buttons">
                          <!-- 查看按钮 - 所有状态都显示 -->
                          <ElButton
                            type="primary"
                            size="small"
                            @click="handleView(task, scope.row)"
                          >
                            <Icon icon="lucide:eye" class="mr-1" />
                            查看
                          </ElButton>

                          <!-- 待确认状态 (zt=0) - 显示编辑、完成、跳过按钮 -->
                          <template
                            v-if="scope.row.zt === '0' || scope.row.zt === 0"
                          >
                            <!-- 编辑按钮 -->
                            <ElButton
                              type="primary"
                              size="small"
                              @click="handleEdit(task, scope.row)"
                            >
                              <Icon icon="lucide:pencil" class="mr-1" />
                              编辑
                            </ElButton>

                            <!-- 完成按钮 -->
                            <ElButton
                              type="success"
                              size="small"
                              @click="handleComplete(task, scope.row)"
                            >
                              <Icon icon="lucide:check" class="mr-1" />
                              完成
                            </ElButton>

                            <!-- 跳过按钮 -->
                            <ElButton
                              type="warning"
                              size="small"
                              @click="handleSkip(task, scope.row)"
                            >
                              <Icon icon="lucide:skip-forward" class="mr-1" />
                              跳过
                            </ElButton>
                          </template>

                          <!-- 已完成或已跳过状态 (zt=1 或 zt=2) - 显示撤回按钮 -->
                          <ElButton
                            v-else-if="
                              scope.row.zt === '1' ||
                              scope.row.zt === 1 ||
                              scope.row.zt === '2' ||
                              scope.row.zt === 2
                            "
                            type="danger"
                            size="small"
                            @click="handleRevoke(task, scope.row)"
                          >
                            <Icon icon="lucide:rotate-ccw" class="mr-1" />
                            撤回
                          </ElButton>
                        </div>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>

                <div v-else class="empty-task">
                  <ElEmpty description="暂无数据" :image-size="60" />
                  <ElButton type="primary" @click="handleAdd(task)">
                    <Icon icon="lucide:plus" class="mr-1" />
                    新增
                  </ElButton>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    </ElCard>

    <TaskEdit
      v-if="showTaskEdit"
      :case-id="props.caseId"
      :task-type="currentTaskType"
      :task-data="currentTask"
      :mode="currentMode"
      @close="handleTaskEditClose"
      @saved="handleTaskSaved"
    />
  </div>
</template>

<style scoped>
.stage-three-container {
  padding: 20px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.stage-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  color: #909399;
}

.stage-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.stage-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.loading-container {
  padding: 40px 20px;
}

.tasks-container {
  min-height: 400px;
}

.task-col {
  margin-bottom: 20px;
}

.task-card {
  height: 100%;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 8px 16px rgb(0 0 0 / 10%);
  transform: translateY(-4px);
}

.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.task-icon {
  width: 20px;
  height: 20px;
  color: #909399;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-progress {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
}

.progress-text {
  font-weight: 600;
  color: #1f2937;
}

.task-count {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.task-count span {
  margin: 0 2px;
}

.task-count span:first-child {
  font-weight: 600;
  color: #67c23a;
}

.task-list {
  flex: 1;
  overflow-x: auto;
}

.task-table {
  min-width: 800px;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.action-buttons .el-button {
  padding: 4px 6px;
  font-size: 12px;
}

.empty-task {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

@media (max-width: 768px) {
  .stage-info {
    flex-direction: column;
    gap: 12px;
  }

  .stage-icon {
    width: 40px;
    height: 40px;
  }

  .task-col {
    margin-bottom: 16px;
  }
}
</style>
