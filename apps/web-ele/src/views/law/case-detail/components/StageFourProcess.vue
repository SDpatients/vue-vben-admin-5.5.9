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
  getAllAuditReportApi,
  getAllClaimConfirmationApi,
  getAllImportantActionsApi,
  getAllMeetingDocumentsApi,
  getAllRemunerationPlanApi,
  getAllSessionApi,
  getAllSetoffReviewApi,
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

// 模拟API调用函数
const mockApiCall = async (
  taskType: string,
  caseId: string,
  page: number,
  size: number,
) => {
  // 模拟API响应
  return {
    status: '1',
    error: '',
    data: {
      records: [],
      count: 0,
    },
  };
};

const taskConfig = [
  {
    key: 'session',
    name: '债权人会议',
    icon: 'lucide:users',
    api: getAllSessionApi,
    fields: [
      { label: '会议名称', prop: 'HYMC' },
      { label: '会议开始时间', prop: 'HYKSSJ', isDate: true },
      { label: '会议主题', prop: 'HYZT' },
      { label: '会议地点', prop: 'HYDD' },
      { label: '参会人员', prop: 'CHRY' },
      { label: '会议结果', prop: 'HYJG' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'meetingDocuments',
    name: '债权人会议文件管理',
    icon: 'lucide:file-text',
    api: getAllMeetingDocumentsApi,
    fields: [
      { label: '文件类型', prop: 'WJLX' },
      { label: '文件名称', prop: 'WJMC' },
      { label: '提交日期', prop: 'TJRQ', isDate: true },
      { label: '审批状态', prop: 'SPZT' },
      { label: '会议名称', prop: 'HYMC' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'claimConfirmation',
    name: '债权确认',
    icon: 'lucide:check-circle',
    api: getAllClaimConfirmationApi,
    fields: [
      { label: '法院裁定日期', prop: 'FYCDRQ', isDate: true },
      { label: '裁定文号', prop: 'CDWH' },
      { label: '最终金额', prop: 'ZZJE' },
      { label: '申报金额', prop: 'SBJE' },
      { label: '申报ID', prop: 'SBID' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'remunerationPlan',
    name: '报酬方案',
    icon: 'lucide:wallet',
    api: getAllRemunerationPlanApi,
    fields: [
      { label: '方案内容', prop: 'FANR' },
      { label: '报酬金额', prop: 'BCJE' },
      { label: '计算依据', prop: 'JSYJ' },
      { label: '会议表决结果', prop: 'HYBJJG' },
      { label: '法院批准日期', prop: 'FYPZRQ', isDate: true },
      { label: '方案状态', prop: 'FAZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'importantActions',
    name: '重要行为报告',
    icon: 'lucide:file-warning',
    api: getAllImportantActionsApi,
    fields: [
      { label: '行为类型', prop: 'HWLX' },
      { label: '行为内容', prop: 'HWNR' },
      { label: '行为日期', prop: 'HWRQ', isDate: true },
      { label: '报告日期', prop: 'BGRQ', isDate: true },
      { label: '报告接收方', prop: 'BGJSF' },
      { label: '批准状态', prop: 'PZZT' },
      { label: '影响评估', prop: 'YXPG' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'setoffReview',
    name: '抵消权审查',
    icon: 'lucide:scale',
    api: getAllSetoffReviewApi,
    fields: [
      { label: '债权人名称', prop: 'ZQRMC' },
      { label: '抵消金额', prop: 'DXJE' },
      { label: '抵消依据', prop: 'DXYJ' },
      { label: '审查日期', prop: 'SCRQ', isDate: true },
      { label: '审查人', prop: 'SCR' },
      { label: '审查决定', prop: 'SCJD' },
      { label: '差额金额', prop: 'CEJE' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'auditReport',
    name: '审计报告',
    icon: 'lucide:clipboard-check',
    api: getAllAuditReportApi,
    fields: [
      { label: '审计机构', prop: 'SJJG' },
      { label: '审计日期', prop: 'SJRQ', isDate: true },
      { label: '审计内容', prop: 'SJNR' },
      { label: '破产条件认定', prop: 'PCTJRD' },
      { label: '提交日期', prop: 'TJRQ', isDate: true },
      { label: '提交人', prop: 'TJR' },
      { label: '法院回应', prop: 'FYHY' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
];

const taskStatusMap = {
  0: { label: '待确认', type: 'info', color: '#409EFF' },
  1: { label: '完成', type: 'success', color: '#67C23A' },
  2: { label: '跳过', type: 'warning', color: '#E6A23C' },
};

const fetchTaskData = async (taskConfigItem: any) => {
  try {
    const response = await taskConfigItem.api(props.caseId, 1, 10);
    if (response.status === '1') {
      return {
        ...taskConfigItem,
        data: response.data.records || [],
        count: response.data.count || 0,
        status: 'loaded',
      };
    } else {
      ElMessage.error(`获取${taskConfigItem.name}失败：${response.error}`);
      return {
        ...taskConfigItem,
        data: [],
        count: 0,
        status: 'error',
      };
    }
  } catch (error) {
    console.error(`获取${taskConfigItem.name}失败:`, error);
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
      (item: any) => item.ZT === '1',
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
      (item: any) => item.ZT === '1',
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
  currentTask.value = item;
  currentTaskType.value = task.key;
  currentMode.value = 'edit';
  showTaskEdit.value = true;
};

const handleView = (task: any, item: any) => {
  currentTask.value = item;
  currentTaskType.value = task.key;
  currentMode.value = 'view';
  showTaskEdit.value = true;
};

const handleComplete = async (task: any, item: any) => {
  currentTask.value = item;
  currentTaskType.value = task.key;
  currentMode.value = 'complete';
  showTaskEdit.value = true;
};

const handleSkip = async (task: any, item: any) => {
  currentTask.value = item;
  currentTaskType.value = task.key;
  currentMode.value = 'skip';
  showTaskEdit.value = true;
};

const handleRevoke = (task: any, item: any) => {
  currentTask.value = item;
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
  <div class="stage-four-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:users" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段四：第一次债权人会议至第二次债权人会议前工作
              </h2>
              <p class="stage-description">
                完成债权确认、资产处置、第二次债权人会议准备等工作
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
                  <ElTag :type="getTaskStatusInfo(task).type" size="small">
                    {{ getTaskStatusInfo(task).label }}
                  </ElTag>
                </div>
              </template>

              <div class="task-content">
                <div class="task-progress mb-4">
                  <div class="progress-info">
                    <span>完成进度</span>
                    <span class="progress-text"
                      >{{ getTaskProgress(task) }}%</span
                    >
                  </div>
                  <ElProgress
                    :percentage="getTaskProgress(task)"
                    :color="getTaskStatusInfo(task).color"
                    :stroke-width="8"
                  />
                  <div class="task-count">
                    <span>{{
                      task.data?.filter((item: any) => item.ZT === '1')
                        .length || 0
                    }}</span>
                    <span>/</span>
                    <span>{{ task.count || 0 }}</span>
                    <span>项已完成</span>
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
                    <ElTableColumn width="280" fixed="right">
                      <template #default="scope">
                        <div class="action-buttons">
                          <ElButton
                            type="primary"
                            size="small"
                            @click="handleView(task, scope.row)"
                          >
                            <Icon icon="lucide:eye" class="mr-1" />
                            查看
                          </ElButton>
                          <ElButton
                            v-if="scope.row.ZT === '0'"
                            type="primary"
                            size="small"
                            @click="handleEdit(task, scope.row)"
                          >
                            <Icon icon="lucide:pencil" class="mr-1" />
                            编辑
                          </ElButton>
                          <ElButton
                            v-if="scope.row.ZT === '0'"
                            type="success"
                            size="small"
                            @click="handleComplete(task, scope.row)"
                          >
                            <Icon icon="lucide:check" class="mr-1" />
                            完成
                          </ElButton>
                          <ElButton
                            v-if="scope.row.ZT === '0'"
                            type="warning"
                            size="small"
                            @click="handleSkip(task, scope.row)"
                          >
                            <Icon icon="lucide:skip-forward" class="mr-1" />
                            跳过
                          </ElButton>
                          <ElButton
                            v-if="scope.row.ZT === '1' || scope.row.ZT === '2'"
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
.stage-four-container {
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
  color: #f56c6c;
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
  color: #f56c6c;
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
