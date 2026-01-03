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
  getLegalProcedureApi,
  getManagementApi,
  getSealManagementApi,
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
    key: 'management',
    name: '管理制度',
    icon: 'lucide:file-text',
    api: getManagementApi,
    fields: [
      { label: '制度类型', prop: 'zdlx' },
      { label: '制度名称', prop: 'zdmc' },
      { label: '制度内容', prop: 'zdnr' },
      { label: '生效日期', prop: 'sxrq', isDate: true },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'sealManagement',
    name: '账户印章管理',
    icon: 'lucide:stamp',
    api: getSealManagementApi,
    fields: [
      { label: '管理类型', prop: 'gllx' },
      { label: '项目名称', prop: 'xmmc' },
      { label: '处理日期', prop: 'clrq', isDate: true },
      { label: '处理方式', prop: 'clfs' },
      { label: '处理结果', prop: 'cljg' },
      { label: '证明文件路径', prop: 'zmwjlj' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'legalProcedure',
    name: '法律程序',
    icon: 'lucide:gavel',
    api: getLegalProcedureApi,
    fields: [
      { label: '程序类型', prop: 'cxlx' },
      { label: '程序内容', prop: 'cxnr' },
      { label: '执行日期', prop: 'zhrq', isDate: true },
      { label: '状态', prop: 'zt', isStatus: true },
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
    // 适配新的API响应格式
    const isNewFormat = response.code === 200;
    if (isNewFormat) {
      return {
        ...taskConfigItem,
        data: response.data || [],
        count: response.data?.length || 0,
        status: 'loaded',
      };
    } else if (response.status === '1') {
      // 兼容旧的API响应格式
      // 检查response.data是否包含records数组，如果包含则使用records，否则直接使用response.data
      const records =
        response.data.records ||
        (Array.isArray(response.data) ? response.data : []);
      return {
        ...taskConfigItem,
        data: records,
        count: records.length || 0,
        status: 'loaded',
      };
    } else {
      ElMessage.error(
        `获取${taskConfigItem.name}失败：${response.message || response.error}`,
      );
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

const formatTaskDate = (dateStr: string) => {
  if (!dateStr || dateStr === '1900-01-01T00:00:00') {
    return '-';
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

const getStatusInfo = (status: number | string) => {
  const statusNum =
    typeof status === 'string' ? Number.parseInt(status, 10) : status;
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
  <div class="stage-one-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:target" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段一：法院指定管理人至管理人接管破产企业前的工作
              </h2>
              <p class="stage-description">
                完成工作团队组建、工作计划制定、管理制度建立、印章管理和法律程序启动等基础工作
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
                      (
                      {{
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
.stage-one-container {
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
  color: #409eff;
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
  color: #409eff;
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
