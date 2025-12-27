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
  getBusinessManagementApi,
  getEmergencyApi,
  getInternalAffairsApi,
  getPersonnelEmpApi,
  getPropertyPlanApi,
  getPropertyReceiptApi,
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
    key: 'propertyReceipt',
    name: '财产接管',
    icon: 'lucide:handshake',
    api: getPropertyReceiptApi,
    fields: [
      { label: '接管名称', prop: 'JCMC' },
      { label: '接管内容', prop: 'JCNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
    ],
  },
  {
    key: 'emergency',
    name: '应急预案',
    icon: 'lucide:alert-triangle',
    api: getEmergencyApi,
    fields: [
      { label: '预案名称', prop: 'YJMC' },
      { label: '预案内容', prop: 'YJNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
    ],
  },
  {
    key: 'propertyPlan',
    name: '财产处置计划',
    icon: 'lucide:clipboard-list',
    api: getPropertyPlanApi,
    fields: [
      { label: '处置名称', prop: 'CZMC' },
      { label: '处置内容', prop: 'CZNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
    ],
  },
  {
    key: 'personnelEmp',
    name: '人事管理',
    icon: 'lucide:user',
    api: getPersonnelEmpApi,
    fields: [
      { label: '人事名称', prop: 'RSMC' },
      { label: '人事内容', prop: 'RSNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
    ],
  },
  {
    key: 'internalAffairs',
    name: '内部事务',
    icon: 'lucide:building',
    api: getInternalAffairsApi,
    fields: [
      { label: '事务名称', prop: 'NBMC' },
      { label: '事务内容', prop: 'NBNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
    ],
  },
  {
    key: 'businessManagement',
    name: '经营管理',
    icon: 'lucide:briefcase',
    api: getBusinessManagementApi,
    fields: [
      { label: '经营名称', prop: 'JYMC' },
      { label: '经营内容', prop: 'JYNR' },
      { label: '负责人', prop: 'FZR' },
      { label: '执行状态', prop: 'ZT', isStatus: true },
      { label: '当前状态', prop: 'DQZT' },
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
  <div class="stage-two-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:construction" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段二：管理人接管破产企业至调查审查破产企业前的工作
              </h2>
              <p class="stage-description">
                完成财产接管、应急预案制定、财产处置计划、人事管理和内部事务等工作
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
                        <ElTag
                          v-if="field.isStatus"
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
.stage-two-container {
  padding: 20px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stage-icon {
  width: 48px;
  height: 48px;
  color: #e6a23c;
  flex-shrink: 0;
}

.stage-title {
  margin: 0 0 8px 0;
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
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
}

.task-icon {
  width: 20px;
  height: 20px;
  color: #e6a23c;
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
  font-size: 13px;
  min-width: 800px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: 4px 6px;
  font-size: 12px;
}

.empty-task {
  flex: 1;
  display: flex;
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
