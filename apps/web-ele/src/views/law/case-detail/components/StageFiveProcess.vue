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
  getAllAssetValuationApi,
  getAllBankruptcyDeclarationApi,
  getAllPropertyVIMApi,
  getAllPropertyVPlanApi,
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
    key: 'assetValuation',
    name: '资产评估',
    icon: 'lucide:scale',
    api: getAllAssetValuationApi,
    fields: [
      { label: '评估机构', prop: 'PGJG' },
      { label: '评估日期', prop: 'PGRQ', isDate: true },
      { label: '评估内容', prop: 'PGNR' },
      { label: '评估总值', prop: 'PGZZ' },
      { label: '评估报告路径', prop: 'PGBGLJ' },
      { label: '审批状态', prop: 'SPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'propertyVPlan',
    name: '财产变价方案',
    icon: 'lucide:file-text',
    api: getAllPropertyVPlanApi,
    fields: [
      { label: '方案名称', prop: 'FAMC' },
      { label: '方案内容', prop: 'FANR' },
      { label: '变价方式', prop: 'BJFS' },
      { label: '预期金额', prop: 'YQJE' },
      { label: '会议表决结果', prop: 'HYBJJG' },
      { label: '法院批准日期', prop: 'FYPZRQ', isDate: true },
      { label: '方案状态', prop: 'FAZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'auctionAgency',
    name: '拍卖机构',
    icon: 'lucide:gavel',
    api: getAllAuctionAgencyApi,
    fields: [
      { label: '机构名称', prop: 'JGMC' },
      { label: '机构类型', prop: 'JGLX' },
      { label: '合同签订日期', prop: 'HTQDRQ', isDate: true },
      { label: '合同内容', prop: 'HTNR' },
      { label: '佣金比例', prop: 'YJBL' },
      { label: '合作状态', prop: 'HZZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'bankruptcyDeclaration',
    name: '破产宣告',
    icon: 'lucide:alert-circle',
    api: getAllBankruptcyDeclarationApi,
    fields: [
      { label: '宣告日期', prop: 'XGRQ', isDate: true },
      { label: '法院裁定文号', prop: 'FYCDWH' },
      { label: '宣告依据', prop: 'XGYJ' },
      { label: '财产核查记录', prop: 'CCHCJL' },
      { label: '破产费用总额', prop: 'PCFYZE' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'propertyVImpl',
    name: '财产变价实施',
    icon: 'lucide:check-circle',
    api: getAllPropertyVIMApi,
    fields: [
      { label: '财产名称', prop: 'CCMC' },
      { label: '财产类型', prop: 'CCLX' },
      { label: '变价金额', prop: 'BJJE' },
      { label: '实施日期', prop: 'SSRQ', isDate: true },
      { label: '实施方式', prop: 'SSFS' },
      { label: '买方信息', prop: 'MFXX' },
      { label: '实施状态', prop: 'SSZT' },
      { label: '参考方案', prop: 'CKFA' },
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
  <div class="stage-five-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:gavel" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段五：第二次债权人会议至破产程序终结工作
              </h2>
              <p class="stage-description">
                完成破产财产分配、员工安置、程序终结等工作
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
.stage-five-container {
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
  color: #67c23a;
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
  color: #67c23a;
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
  color: #67c23a;
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
