<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElMessage,
  ElMessageBox,
  ElProgress,
  ElTag,
} from 'element-plus';

// 组件属性
interface Props {
  caseId: string;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  taskStatusChanged: [taskId: string, status: string];
}>();

const router = useRouter();

// 任务数据
const tasks = ref<CaseProcessApi.TaskInfo[]>([
  {
    id: 'session',
    name: '第一次债权人会议',
    status: '未确认',
    apiUrl: '/api/web/getAllSession',
    token: '9d4857cffdfc084f4b4bbea933be29d9',
  },
  {
    id: 'meetingDocuments',
    name: '会议文件',
    status: '未确认',
    apiUrl: '/api/web/getAllMeetingDocuments',
    token: 'd7e31d46d165d1040ebc2537db8ea110',
  },
  {
    id: 'claimConfirmation',
    name: '债权确认',
    status: '待开发',
    apiUrl: '',
    token: '',
    isPending: true,
  },
  {
    id: 'importantActions',
    name: '重要行为',
    status: '未确认',
    apiUrl: '/api/web/getAllImportantActions',
    token: '105e75ba651c5723542fab64984d8f52',
  },
  {
    id: 'setoffReview',
    name: '抵销审核',
    status: '未确认',
    apiUrl: '/api/web/getAllSetoffReview',
    token: 'a0995016aa156d8efc752b7f3895561e',
  },
  {
    id: 'auditReport',
    name: '审计报告',
    status: '未确认',
    apiUrl: '/api/web/getAllAuditReport',
    token: '41b31a3d701e888e11b9d2470b0b2ad9',
  },
]);

const loading = ref(false);

// 计算进度
const progress = computed(() => {
  const totalTasks = tasks.value.filter((task) => !task.isPending).length;
  const completedTasks = tasks.value.filter(
    (task) =>
      (task.status === '完成' || task.status === '跳过') && !task.isPending,
  ).length;
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
});

// 获取状态标签类型
const getStatusType = (status: CaseProcessApi.TaskStatus) => {
  switch (status) {
    case '完成': {
      return 'success';
    }
    case '待开发': {
      return 'info';
    }
    case '跳过': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

// 获取状态样式类
const getStatusClass = (status: CaseProcessApi.TaskStatus) => {
  switch (status) {
    case '完成': {
      return 'status-completed';
    }
    case '待开发': {
      return 'status-pending';
    }
    case '跳过': {
      return 'status-skipped';
    }
    default: {
      return 'status-pending';
    }
  }
};

// 编辑任务
const editTask = (taskId: string) => {
  const task = tasks.value.find((task) => task.id === taskId);
  if (task?.isPending) {
    ElMessage.info('该任务待开发');
    return;
  }
  router.push(`/case-detail/${props.caseId}/task/${taskId}/edit`);
};

// 查看任务
const viewTask = (taskId: string) => {
  const task = tasks.value.find((task) => task.id === taskId);
  if (task?.isPending) {
    ElMessage.info('该任务待开发');
    return;
  }
  router.push(`/case-detail/${props.caseId}/task/${taskId}/view`);
};

// 新增任务
const addTask = (taskId: string) => {
  const task = tasks.value.find((task) => task.id === taskId);
  if (task?.isPending) {
    ElMessage.info('该任务待开发');
    return;
  }
  router.push(`/case-detail/${props.caseId}/task/${taskId}/add`);
};

// 完成任务
const completeTask = async (taskId: string) => {
  const task = tasks.value.find((task) => task.id === taskId);
  if (task?.isPending) {
    ElMessage.info('该任务待开发');
    return;
  }

  try {
    await ElMessageBox.confirm('确认完成该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 更新本地状态
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
      tasks.value[taskIndex].status = '完成';
      // 通知父组件任务状态变更
      emit('taskStatusChanged', taskId, '完成');
      ElMessage.success('任务已完成');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成任务失败:', error);
      ElMessage.error('完成任务失败');
    }
  }
};

// 跳过任务
const skipTask = async (taskId: string) => {
  const task = tasks.value.find((task) => task.id === taskId);
  if (task?.isPending) {
    ElMessage.info('该任务待开发');
    return;
  }

  try {
    // 更新本地状态
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
      tasks.value[taskIndex].status = '跳过';
      // 通知父组件任务状态变更
      emit('taskStatusChanged', taskId, '跳过');
      ElMessage.success('任务已跳过');
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
  }
};

// 撤回跳过任务
const withdrawSkipTask = async (taskId: string) => {
  try {
    // 更新本地状态为未确认
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
      tasks.value[taskIndex].status = '未确认';
      // 通知父组件任务状态变更
      emit('taskStatusChanged', taskId, '未确认');
      ElMessage.success('已撤回跳过操作');
    }
  } catch (error) {
    console.error('撤回跳过任务失败:', error);
    ElMessage.error('撤回跳过任务失败');
  }
};

// 通用API调用函数
const callApi = async (apiUrl: string, token: string, caseId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_GLOB_API_URL}${apiUrl}?token=${token}&SEP_ID=${caseId}&page=1&size=10`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API调用失败 ${apiUrl}:`, error);
    return null;
  }
};

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 调用后端API获取任务数据
    const [
      sessionRes,
      meetingDocumentsRes,
      importantActionsRes,
      setoffReviewRes,
      auditReportRes,
    ] = await Promise.allSettled([
      callApi(
        '/api/web/getAllSession',
        '9d4857cffdfc084f4b4bbea933be29d9',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllMeetingDocuments',
        'd7e31d46d165d1040ebc2537db8ea110',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllImportantActions',
        '105e75ba651c5723542fab64984d8f52',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllSetoffReview',
        'a0995016aa156d8efc752b7f3895561e',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllAuditReport',
        '41b31a3d701e888e11b9d2470b0b2ad9',
        props.caseId,
      ),
    ]);

    // 处理API响应，转换ZT状态为任务状态
    const ztToStatus = (zt: number | undefined): CaseProcessApi.TaskStatus => {
      if (zt === 1) return '完成';
      if (zt === 2) return '跳过';
      return '未确认';
    };

    const getTaskStatus = (
      res: PromiseSettledResult<any>,
    ): CaseProcessApi.TaskStatus => {
      if (
        res.status === 'fulfilled' &&
        res.value &&
        res.value.status === '1' &&
        res.value.data &&
        res.value.data.paras
      ) {
        const zt0Count = Number.parseInt(
          res.value.data.paras.zt0_count || '0',
          10,
        );
        const zt1Count = Number.parseInt(
          res.value.data.paras.zt1_count || '0',
          10,
        );
        const zt2Count = Number.parseInt(
          res.value.data.paras.zt2_count || '0',
          10,
        );

        if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
          return '完成';
        }
        if (zt0Count === 0 && zt2Count > 0) {
          return '跳过';
        }
      }
      return '未确认';
    };

    const getTaskCount = (res: PromiseSettledResult<any>): number => {
      if (res.status === 'fulfilled' && res.value && res.value.status === '1') {
        return res.value.data?.count || 0;
      }
      return 0;
    };

    const getTaskParas = (
      res: PromiseSettledResult<any>,
    ):
      | undefined
      | { zt0_count?: string; zt1_count?: string; zt2_count?: string } => {
      if (
        res.status === 'fulfilled' &&
        res.value &&
        res.value.status === '1' &&
        res.value.data
      ) {
        return res.value.data.paras;
      }
      return undefined;
    };

    tasks.value = [
      {
        id: 'session',
        name: '第一次债权人会议',
        status: getTaskStatus(sessionRes),
        apiUrl: '/api/web/getAllSession',
        token: '9d4857cffdfc084f4b4bbea933be29d9',
        count: getTaskCount(sessionRes),
        paras: getTaskParas(sessionRes),
      },
      {
        id: 'meetingDocuments',
        name: '会议文件',
        status: getTaskStatus(meetingDocumentsRes),
        apiUrl: '/api/web/getAllMeetingDocuments',
        token: 'd7e31d46d165d1040ebc2537db8ea110',
        count: getTaskCount(meetingDocumentsRes),
        paras: getTaskParas(meetingDocumentsRes),
      },
      {
        id: 'claimConfirmation',
        name: '债权确认',
        status: '未确认' as CaseProcessApi.TaskStatus,
        apiUrl: '',
        token: '',
        isPending: true,
        count: 0,
        paras: undefined,
      },
      {
        id: 'importantActions',
        name: '重要行为',
        status: getTaskStatus(importantActionsRes),
        apiUrl: '/api/web/getAllImportantActions',
        token: '105e75ba651c5723542fab64984d8f52',
        count: getTaskCount(importantActionsRes),
        paras: getTaskParas(importantActionsRes),
      },
      {
        id: 'setoffReview',
        name: '抵销审核',
        status: getTaskStatus(setoffReviewRes),
        apiUrl: '/api/web/getAllSetoffReview',
        token: 'a0995016aa156d8efc752b7f3895561e',
        count: getTaskCount(setoffReviewRes),
        paras: getTaskParas(setoffReviewRes),
      },
      {
        id: 'auditReport',
        name: '审计报告',
        status: getTaskStatus(auditReportRes),
        apiUrl: '/api/web/getAllAuditReport',
        token: '41b31a3d701e888e11b9d2470b0b2ad9',
        count: getTaskCount(auditReportRes),
        paras: getTaskParas(auditReportRes),
      },
    ];

    // 检查API响应状态，处理status为"0"的情况
    const allApiResponses = [
      sessionRes,
      meetingDocumentsRes,
      importantActionsRes,
      setoffReviewRes,
      auditReportRes,
    ];

    // 统计失败的API数量
    let failedApis = 0;
    const errorMessages: string[] = [];

    allApiResponses.forEach((res) => {
      if (res.status === 'rejected') {
        failedApis++;
        errorMessages.push(`API调用失败`);
      } else if (res.value && res.value.status === '0') {
        // 处理status为"0"的情况
        failedApis++;
        const errorMsg = res.value.error || '未知错误';
        errorMessages.push(`API返回错误: ${errorMsg}`);
      }
    });

    if (failedApis > 0) {
      // 去重并显示错误信息
      const uniqueErrorMessages = [...new Set(errorMessages)];
      uniqueErrorMessages.forEach((msg) => {
        ElMessage.warning(msg);
      });
      ElMessage.warning(`${failedApis}个API调用失败，使用默认数据`);
    }
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  loadTaskData();
});
</script>

<template>
  <ElCard class="stage-four-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第四阶段：第一次债权人会议至第二次债权人会议前工作</span>
        </div>
        <div class="stage-progress">
          <span class="progress-text">完成进度：{{ progress }}%</span>
          <ElProgress
            :percentage="progress"
            :status="progress === 100 ? 'success' : undefined"
            :stroke-width="8"
            style="width: 200px; margin-left: 12px"
          />
        </div>
      </div>
    </template>

    <div class="tasks-container">
      <div class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          :class="getStatusClass(task.status)"
        >
          <div class="task-info">
            <div class="task-main">
              <div class="task-name">
                {{ task.name }}
                <span
                  v-if="task.count !== undefined && task.count > 0"
                  class="task-count"
                >
                  ({{ task.count }}个)
                </span>
              </div>
              <div class="task-status">
                <ElTag :type="getStatusType(task.status)" size="small">
                  {{ task.status }}
                </ElTag>
              </div>
            </div>
            <div class="task-description">
              当前状态：
              {{
                task.status === '完成'
                  ? '已完成确认'
                  : task.status === '待开发'
                    ? '待开发'
                    : task.status === '跳过'
                      ? '已跳过'
                      : `待确认（${task.paras?.zt0_count || '0'}个），确认（${task.paras?.zt1_count || '0'}个）`
              }}
            </div>
          </div>
          <div class="task-actions">
            <!-- 如果count为0，显示新增和跳过按钮 -->
            <template v-if="task.count === 0 && !task.isPending">
              <ElButton
                type="primary"
                size="small"
                @click="addTask(task.id)"
                :disabled="
                  task.status === '完成' ||
                  task.status === '跳过' ||
                  task.isPending
                "
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>

              <ElButton
                v-if="task.status === '跳过' || task.status === '完成'"
                type="danger"
                size="small"
                @click="withdrawSkipTask(task.id)"
              >
                <Icon icon="lucide:undo" class="mr-1" />
                撤回
              </ElButton>

              <ElButton
                v-else
                type="warning"
                size="small"
                @click="skipTask(task.id)"
                :disabled="task.status === '完成' || task.isPending"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>
            </template>

            <!-- 如果count不为0或任务待开发，显示完整按钮组 -->
            <template v-else>
              <ElButton type="info" size="small" @click="viewTask(task.id)">
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>

              <ElButton
                type="primary"
                size="small"
                @click="editTask(task.id)"
                :disabled="
                  task.status === '完成' ||
                  task.status === '跳过' ||
                  task.isPending
                "
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>

              <ElButton
                type="success"
                size="small"
                @click="completeTask(task.id)"
                :disabled="
                  task.status === '完成' ||
                  task.status === '跳过' ||
                  task.isPending
                "
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>

              <!-- 动态按钮：完成或跳过状态显示撤回，其他状态显示跳过 -->
              <ElButton
                v-if="task.status === '跳过' || task.status === '完成'"
                type="danger"
                size="small"
                @click="withdrawSkipTask(task.id)"
              >
                <Icon icon="lucide:undo" class="mr-1" />
                撤回
              </ElButton>

              <ElButton
                v-else
                type="warning"
                size="small"
                @click="skipTask(task.id)"
                :disabled="task.status === '完成' || task.isPending"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>

              <!-- 新增按钮，仅在任务非待开发且状态非完成/跳过时显示 -->
              <ElButton
                v-if="!task.isPending"
                type="info"
                size="small"
                @click="addTask(task.id)"
                :disabled="task.status === '完成' || task.status === '跳过'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 阶段完成提示 -->
    <div v-if="progress === 100" class="stage-complete">
      <div class="complete-message">
        <Icon icon="lucide:check-circle" class="mr-2 text-green-500" />
        <span>第四阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-four-process {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.stage-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.stage-progress {
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.tasks-container {
  padding: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px 20px;
  transition: all 0.3s ease;
  background: #ffffff;
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 状态样式 */
.status-completed {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.status-skipped {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

.status-pending {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  min-width: 120px;
}

.task-count {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 4px;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
}

.task-status {
  display: flex;
  align-items: center;
}

.task-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.task-actions .el-button {
  min-width: 70px;
}

.stage-complete {
  margin-top: 20px;
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #10b981;
  border-radius: 6px;
  text-align: center;
}

.complete-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stage-progress {
    width: 100%;
    justify-content: space-between;
  }

  .task-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .task-main {
    justify-content: space-between;
  }

  .task-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .task-actions .el-button {
    flex: 1;
    min-width: 80px;
  }
}
</style>
