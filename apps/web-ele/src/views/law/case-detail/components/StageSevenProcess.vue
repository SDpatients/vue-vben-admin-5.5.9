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
  getAccountClosingsByCaseApi,
  getArchivingManagementsByCaseApi,
  getCancellationRegistrationsByCaseApi,
  getDocumentTransfersByCaseApi,
  getDutyReportsByCaseApi,
  getSealDestructionsByCaseApi,
  getTerminationLitigationsByCaseApi,
  getAdditionalDistributionsByCaseApi,
  getAccountSealManagementsPhase7ByCaseApi,
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
    key: 'cancellationRegistration',
    name: '注销登记',
    icon: 'lucide:x-circle',
    api: getCancellationRegistrationsByCaseApi,
    addApi: null,
    fields: [
      { label: '注销类型', prop: 'zxlx' },
      { label: '登记机关', prop: 'djjg' },
      { label: '申请日期', prop: 'sqrq', isDate: true },
      { label: '注销日期', prop: 'zxrq', isDate: true },
      { label: '注销文号', prop: 'zxwh' },
      { label: '注销状态', prop: 'zxzt' },
      { label: '处理人', prop: 'clr' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'terminationLitigation',
    name: '终结诉讼仲裁',
    icon: 'lucide:scale',
    api: getTerminationLitigationsByCaseApi,
    addApi: null,
    fields: [
      { label: '诉讼类型', prop: 'sslx' },
      { label: '相对方', prop: 'xdf' },
      { label: '法院/仲裁机构', prop: 'fyzcjg' },
      { label: '诉讼状态', prop: 'sszt' },
      { label: '处理结果', prop: 'cljg' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'additionalDistribution',
    name: '追加分配',
    icon: 'lucide:trending-up',
    api: getAdditionalDistributionsByCaseApi,
    addApi: null,
    fields: [
      { label: '分配类型', prop: 'fplx' },
      { label: '分配金额', prop: 'fpje' },
      { label: '分配日期', prop: 'fprq', isDate: true },
      { label: '债权人名称', prop: 'zqrmc' },
      { label: '分配依据', prop: 'fpyj' },
      { label: '分配状态', prop: 'fpzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'accountSealManagement',
    name: '账户印章管理',
    icon: 'lucide:stamp',
    api: getAccountSealManagementsPhase7ByCaseApi,
    addApi: null,
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
    key: 'dutyReport',
    name: '职务报告',
    icon: 'lucide:file-text',
    api: getDutyReportsByCaseApi,
    addApi: null,
    fields: [
      { label: '报告类型', prop: 'bglx' },
      { label: '报告内容', prop: 'bgnr' },
      { label: '提交日期', prop: 'tjrq', isDate: true },
      { label: '提交人', prop: 'tjr' },
      { label: '接收方', prop: 'jsf' },
      { label: '审批状态', prop: 'spzt' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'documentTransfer',
    name: '资料移交',
    icon: 'lucide:folder-transfer',
    api: getDocumentTransfersByCaseApi,
    addApi: null,
    fields: [
      { label: '移交类型', prop: 'yjlx' },
      { label: '资料名称', prop: 'zlmc' },
      { label: '移交日期', prop: 'yjrq', isDate: true },
      { label: '移交方', prop: 'yjf' },
      { label: '接收方', prop: 'jsf' },
      { label: '移交内容', prop: 'yjnr' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'archivingManagement',
    name: '归档管理',
    icon: 'lucide:archive',
    api: getArchivingManagementsByCaseApi,
    addApi: null,
    fields: [
      { label: '归档类型', prop: 'gdlx' },
      { label: '归档内容', prop: 'gdnr' },
      { label: '归档日期', prop: 'gdrq', isDate: true },
      { label: '归档位置', prop: 'gdwz' },
      { label: '负责人', prop: 'fzr' },
      { label: '归档状态', prop: 'gdzt' },
      { label: '档案号', prop: 'dah' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'sealDestruction',
    name: '印章销毁',
    icon: 'lucide:trash-2',
    api: getSealDestructionsByCaseApi,
    addApi: null,
    fields: [
      { label: '印章类型', prop: 'yzlx' },
      { label: '印章编号', prop: 'yzbh' },
      { label: '销毁日期', prop: 'xhrq', isDate: true },
      { label: '销毁方式', prop: 'xhfs' },
      { label: '销毁见证人', prop: 'xhjzr' },
      { label: '证明文件', prop: 'zmwj' },
      { label: '印章', prop: 'yz' },
      { label: '状态', prop: 'zt', isStatus: true },
    ],
  },
  {
    key: 'accountClosing',
    name: '账户销户',
    icon: 'lucide:credit-card-off',
    api: getAccountClosingsByCaseApi,
    addApi: null,
    fields: [
      { label: '账户', prop: 'zh' },
      { label: '销户日期', prop: 'xhrq', isDate: true },
      { label: '销户原因', prop: 'xhyy' },
      { label: '余额金额', prop: 'yeje' },
      { label: '销户状态', prop: 'xhzt' },
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
    const isNewFormat = response.code === 200;
    if (isNewFormat) {
      return {
        ...taskConfigItem,
        data: response.data || [],
        count: response.data?.length || 0,
        status: 'loaded',
      };
    } else if (response.status === '1') {
      const records =
        response.data?.records ||
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
  <div class="stage-seven-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="stage-header">
          <div class="stage-info">
            <Icon icon="lucide:archive" class="stage-icon" />
            <div>
              <h2 class="stage-title">
                阶段七：破产程序终结及注销登记工作
              </h2>
              <p class="stage-description">
                完成注销登记、终结诉讼仲裁、账户印章管理、资料移交、归档管理等终结工作
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
                          <ElButton
                            type="primary"
                            size="small"
                            @click="handleView(task, scope.row)"
                          >
                            <Icon icon="lucide:eye" class="mr-1" />
                            查看
                          </ElButton>

                          <template
                            v-if="scope.row.zt === '0' || scope.row.zt === 0"
                          >
                            <ElButton
                              type="primary"
                              size="small"
                              @click="handleEdit(task, scope.row)"
                            >
                              <Icon icon="lucide:pencil" class="mr-1" />
                              编辑
                            </ElButton>

                            <ElButton
                              type="success"
                              size="small"
                              @click="handleComplete(task, scope.row)"
                            >
                              <Icon icon="lucide:check" class="mr-1" />
                              完成
                            </ElButton>

                            <ElButton
                              type="warning"
                              size="small"
                              @click="handleSkip(task, scope.row)"
                            >
                              <Icon icon="lucide:skip-forward" class="mr-1" />
                              跳过
                            </ElButton>
                          </template>

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
