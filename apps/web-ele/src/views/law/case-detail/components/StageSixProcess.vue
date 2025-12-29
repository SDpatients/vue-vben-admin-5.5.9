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

// 模拟API调用，因为阶段六可能还没有实际的API
const mockApiCall = async (
  taskType: string,
  caseId: string,
  page: number,
  size: number,
) => {
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
    key: 'distributionPlan',
    name: '破产财产分配方案',
    icon: 'lucide:pie-chart',
    api: mockApiCall,
    fields: [
      { label: '方案名称', prop: 'FAMC' },
      { label: '制定日期', prop: 'ZDRQ', isDate: true },
      { label: '审批状态', prop: 'SPZT' },
      { label: '分配总额', prop: 'FPZE' },
      { label: '分配方式', prop: 'FPFS' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'staffPlacementPlan',
    name: '员工安置方案',
    icon: 'lucide:users',
    api: mockApiCall,
    fields: [
      { label: '方案名称', prop: 'FAMC' },
      { label: '制定日期', prop: 'ZDRQ', isDate: true },
      { label: '安置人数', prop: 'AZRS' },
      { label: '安置总额', prop: 'AZZE' },
      { label: '审批状态', prop: 'SPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'priorityConfirmation',
    name: '优先受偿权确认',
    icon: 'lucide:shield-check',
    api: mockApiCall,
    fields: [
      { label: '债权人名称', prop: 'ZQRMC' },
      { label: '债权金额', prop: 'ZQJE' },
      { label: '受偿金额', prop: 'SCJE' },
      { label: '确认日期', prop: 'QRRQ', isDate: true },
      { label: '优先类型', prop: 'YXLX' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'taxSettlementPlan',
    name: '税费结算方案',
    icon: 'lucide:file-text',
    api: mockApiCall,
    fields: [
      { label: '方案名称', prop: 'FAMC' },
      { label: '制定日期', prop: 'ZDRQ', isDate: true },
      { label: '应缴税费', prop: 'YJSF' },
      { label: '实缴税费', prop: 'SJSF' },
      { label: '审批状态', prop: 'SPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
];

const taskStatusMap = {
  0: { label: '待确认', type: 'info', color: '#409EFF' },
  1: { label: '完成', type: 'success', color: '#722ED1' },
  2: { label: '跳过', type: 'warning', color: '#E6A23C' },
};

const fetchTaskData = async (taskConfigItem: any) => {
  try {
    const response = await taskConfigItem.api(
      taskConfigItem.key,
      props.caseId,
      1,
      10,
    );
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

const formatTaskDate = (dateStr: string) => {
  if (!dateStr || dateStr === '1900-01-01T00:00:00') {
    return '-';
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

const getStatusInfo = (status: string) => {
  const statusNum = Number.parseInt(status, 10);
  return (
    taskStatusMap[statusNum as keyof typeof taskStatusMap] || taskStatusMap[0]
  );
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
  <div class="stage-six-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:pie-chart" class="stage-icon" />
            <div>
              <h2 class="stage-title">阶段六：破产财产分配方案等相关工作</h2>
              <p class="stage-description">
                完成破产财产分配方案制定、员工安置方案、优先受偿权确认等工作
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
.stage-six-container {
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
  color: #722ed1;
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
  padding: 40px 0;
}

.tasks-container {
  padding: 20px 0;
}

.task-col {
  margin-bottom: 20px;
}

.task-card {
  height: 100%;
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
  font-size: 16px;
  font-weight: 600;
}

.task-icon {
  font-size: 20px;
  color: #722ed1;
}

.task-content {
  padding: 10px 0;
}

.task-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-text {
  font-weight: 600;
  color: #722ed1;
}

.task-count {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.task-list {
  max-height: 400px;
  overflow: auto;
}

.task-table {
  min-width: 800px;
  overflow: hidden;
  font-size: 13px;
  border-radius: 8px;
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
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 40px 0;
}
</style>
