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

// 模拟API调用，因为阶段七可能还没有实际的API
const mockApiCall = async (taskType: string, caseId: string, page: number, size: number) => {
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
    key: 'creditorResolution',
    name: '债权人会议决议',
    icon: 'lucide:users-round',
    api: mockApiCall,
    fields: [
      { label: '决议名称', prop: 'JYMCM' },
      { label: '会议日期', prop: 'HYRQ', isDate: true },
      { label: '通过票数', prop: 'TGPF' },
      { label: '反对票数', prop: 'FDPS' },
      { label: '决议内容', prop: 'JYNR' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'terminateLawsuit',
    name: '终止诉讼',
    icon: 'lucide:gavel',
    api: mockApiCall,
    fields: [
      { label: '案件名称', prop: 'AJMC' },
      { label: '法院名称', prop: 'FYMC' },
      { label: '案件编号', prop: 'AJBH' },
      { label: '终止日期', prop: 'ZZRQ', isDate: true },
      { label: '终止原因', prop: 'ZZYY' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'additionalDistribution',
    name: '追加分配',
    icon: 'lucide:pie-chart',
    api: mockApiCall,
    fields: [
      { label: '分配金额', prop: 'FPJE' },
      { label: '分配日期', prop: 'FPRQ', isDate: true },
      { label: '分配对象', prop: 'FPDB' },
      { label: '分配原因', prop: 'FPYY' },
      { label: '审批状态', prop: 'SPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'closingWork',
    name: '收尾工作',
    icon: 'lucide:check-circle',
    api: mockApiCall,
    fields: [
      { label: '工作内容', prop: 'GZNR' },
      { label: '完成日期', prop: 'WCRQ', isDate: true },
      { label: '负责人', prop: 'FZR' },
      { label: '备注', prop: 'BZ' },
      { label: '归档状态', prop: 'GDZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
];

const taskStatusMap = {
  0: { label: '待确认', type: 'info', color: '#409EFF' },
  1: { label: '完成', type: 'success', color: '#13C2C2' },
  2: { label: '跳过', type: 'warning', color: '#E6A23C' },
};

const fetchTaskData = async (taskConfigItem: any) => {
  try {
    const response = await taskConfigItem.api(taskConfigItem.key, props.caseId, 1, 10);
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
  <div class="stage-seven-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:check-circle" class="stage-icon" />
            <div>
              <h2 class="stage-title">阶段七：债权人会议决议等相关工作</h2>
              <p class="stage-description">完成债权人会议决议、终止诉讼、追加分配等收尾工作</p>
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
                    <span class="progress-text">{{ getTaskProgress(task) }}%</span>
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
.stage-seven-container {
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
  color: #13C2C2;
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
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.task-icon {
  font-size: 20px;
  color: #13C2C2;
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
  color: #13C2C2;
}

.task-count {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.task-list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
}

.task-table {
  border-radius: 8px;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
}
</style>
