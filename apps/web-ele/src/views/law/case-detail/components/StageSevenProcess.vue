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
import {
  getCancellationRegistrationApi,
  getTerminationLitiApi,
  getAdditionalDisiributionApi,
  getAccountSealManagementApi,
  getDutyReportApi,
  getDocumentTransferApi,
  getArchivingManagementApi,
  getSealDestructionApi,
  getAccountClosingApi,
} from '#/api/core/case-process';

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
    icon: 'lucide:file-x',
    api: getCancellationRegistrationApi,
    fields: [
      { label: '注销类型', prop: 'ZXLX' },
      { label: '登记机关', prop: 'DJJG' },
      { label: '申请日期', prop: 'SQRQ', isDate: true },
      { label: '注销日期', prop: 'ZXRQ', isDate: true },
      { label: '注销文号', prop: 'ZXWH' },
      { label: '注销状态', prop: 'ZXZT' },
      { label: '登记事项', prop: 'DJSX' },
      { label: '登记号码', prop: 'DJHM' },
      { label: '注销原因', prop: 'ZXYY' },
      { label: '处理人', prop: 'CLR' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'terminationLitigation',
    name: '终结诉讼仲裁',
    icon: 'lucide:gavel',
    api: getTerminationLitiApi,
    fields: [
      { label: '诉讼类型', prop: 'SSLX' },
      { label: '相对方', prop: 'XDF' },
      { label: '法院/仲裁机构', prop: 'FYZCJG' },
      { label: '诉讼状态', prop: 'SSZT' },
      { label: '处理结果', prop: 'CLJG' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'additionalDistribution',
    name: '追加分配',
    icon: 'lucide:pie-chart',
    api: getAdditionalDisiributionApi,
    fields: [
      { label: '分配类型', prop: 'FPLX' },
      { label: '分配金额', prop: 'FPJE' },
      { label: '分配日期', prop: 'FPRQ', isDate: true },
      { label: '债权人名称', prop: 'ZQRMC' },
      { label: '分配依据', prop: 'FPYJ' },
      { label: '分配状态', prop: 'FPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'accountSealManagement',
    name: '账户印章管理',
    icon: 'lucide:key',
    api: getAccountSealManagementApi,
    fields: [
      { label: '管理类型', prop: 'GLLX' },
      { label: '项目名称', prop: 'XMMC' },
      { label: '处理日期', prop: 'CLRQ', isDate: true },
      { label: '处理方式', prop: 'CLFS' },
      { label: '处理结果', prop: 'CLJG' },
      { label: '证明文件路径', prop: 'ZMWJLJ' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'dutyReport',
    name: '职务报告',
    icon: 'lucide:file-text',
    api: getDutyReportApi,
    fields: [
      { label: '报告类型', prop: 'BGLX' },
      { label: '报告内容', prop: 'BGNR' },
      { label: '提交日期', prop: 'TJRQ', isDate: true },
      { label: '提交人', prop: 'TJR' },
      { label: '接收方', prop: 'JSF' },
      { label: '审批状态', prop: 'SPZT' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'documentTransfer',
    name: '资料移交',
    icon: 'lucide:folder-open',
    api: getDocumentTransferApi,
    fields: [
      { label: '移交类型', prop: 'YJLX' },
      { label: '资料名称', prop: 'ZLMC' },
      { label: '移交日期', prop: 'YJRQ', isDate: true },
      { label: '移交方', prop: 'YJF' },
      { label: '接收方', prop: 'JSF' },
      { label: '移交内容', prop: 'YJNR' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'archivingManagement',
    name: '归档管理',
    icon: 'lucide:archive',
    api: getArchivingManagementApi,
    fields: [
      { label: '归档类型', prop: 'GDLX' },
      { label: '归档内容', prop: 'GDNR' },
      { label: '归档日期', prop: 'GDRQ', isDate: true },
      { label: '归档位置', prop: 'GDWZ' },
      { label: '负责人', prop: 'FZR' },
      { label: '归档状态', prop: 'GDZT' },
      { label: '档案号', prop: 'DAH' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'sealDestruction',
    name: '印章销毁',
    icon: 'lucide:trash-2',
    api: getSealDestructionApi,
    fields: [
      { label: '印章类型', prop: 'YZLX' },
      { label: '印章编号', prop: 'YZBH' },
      { label: '销毁日期', prop: 'XHRQ', isDate: true },
      { label: '销毁方式', prop: 'XHFS' },
      { label: '销毁见证人', prop: 'XHJZR' },
      { label: '证明文件', prop: 'ZMWJ' },
      { label: '印章', prop: 'YZ' },
      { label: '状态', prop: 'ZT', isStatus: true },
    ],
  },
  {
    key: 'accountClosing',
    name: '账户销户',
    icon: 'lucide:credit-card',
    api: getAccountClosingApi,
    fields: [
      { label: '账户', prop: 'ZH' },
      { label: '销户日期', prop: 'XHRQ', isDate: true },
      { label: '销户原因', prop: 'XHYY' },
      { label: '余额金额', prop: 'YEJE' },
      { label: '销户状态', prop: 'XHZT' },
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
      (item: any) =>
        item.ZT === '1' || item.ZT === 1 || item.ZT === '2' || item.ZT === 2,
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
        item.ZT === '1' || item.ZT === 1 || item.ZT === '2' || item.ZT === 2,
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
              <h2 class="stage-title">阶段七：收尾工作</h2>
              <p class="stage-description">
                完成注销登记、终结诉讼仲裁、追加分配、账户印章管理、职务报告、资料移交、归档管理、印章销毁、账户销户等收尾工作
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

                          <!-- 待确认状态 (ZT=0) - 显示编辑、完成、跳过按钮 -->
                          <template
                            v-if="scope.row.ZT === '0' || scope.row.ZT === 0"
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

                          <!-- 已完成或已跳过状态 (ZT=1 或 ZT=2) - 显示撤回按钮 -->
                          <ElButton
                            v-else-if="
                              scope.row.ZT === '1' ||
                              scope.row.ZT === 1 ||
                              scope.row.ZT === '2' ||
                              scope.row.ZT === 2
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
  color: #13c2c2;
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
  color: #13c2c2;
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
  color: #13c2c2;
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