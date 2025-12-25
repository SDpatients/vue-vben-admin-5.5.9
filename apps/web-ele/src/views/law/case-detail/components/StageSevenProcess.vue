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

import {
  getAdditionalDisiributionApi,
  getCanRRInfoApi,
  getTerminationLitiApi,
  updateTaskStatusApi,
} from '#/api/core/case-process';

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
    id: 'canRR',
    name: '债权人会议决议',
    status: '未确认',
    apiUrl: '/api/web/getAllCanRR',
    token: 'b9687d9bae9050728ce5f471ae32c737',
  },
  {
    id: 'terminationLiti',
    name: '终止诉讼',
    status: '未确认',
    apiUrl: '/api/web/getAllTerminationLiti',
    token: '8e4a5f0694dc40db05031994e3b3b332',
  },
  {
    id: 'additionalDisiribution',
    name: '追加分配',
    status: '未确认',
    apiUrl: '/api/web/getAllAdditionalDisiribution',
    token: '17da492375ef4f11867f65c39406594c',
  },
]);

const loading = ref(false);

// 计算进度
const progress = computed(() => {
  const completedTasks = tasks.value.filter(
    (task) => task.status === '完成' || task.status === '跳过',
  ).length;
  return Math.round((completedTasks / tasks.value.length) * 100);
});

// 获取状态标签类型
const getStatusType = (status: CaseProcessApi.TaskStatus) => {
  switch (status) {
    case '完成': {
      return 'success';
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
  router.push(`/case-detail/${props.caseId}/task/${taskId}/edit`);
};

// 查看任务
const viewTask = (taskId: string) => {
  router.push(`/case-detail/${props.caseId}/task/${taskId}/view`);
};

// 新增任务
const addTask = (taskId: string) => {
  router.push(`/case-detail/${props.caseId}/task/${taskId}/add`);
};

// 完成任务
const completeTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确认完成该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 调用API更新任务状态
    const result = await updateTaskStatusApi(taskId, props.caseId, '完成');

    if (result && result.status === '1') {
      // 更新本地状态
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = '完成';
        // 通知父组件任务状态变更
        emit('taskStatusChanged', taskId, '完成');
        ElMessage.success('任务已完成');
      }
    } else {
      ElMessage.error('更新任务状态失败');
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
  try {
    // 调用API更新任务状态
    const result = await updateTaskStatusApi(taskId, props.caseId, '跳过');

    if (result && result.status === '1') {
      // 更新本地状态
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = '跳过';
        // 通知父组件任务状态变更
        emit('taskStatusChanged', taskId, '跳过');
        ElMessage.success('任务已跳过');
      }
    } else {
      ElMessage.error('更新任务状态失败');
    }
  } catch (error) {
    console.error('跳过任务失败:', error);
    ElMessage.error('跳过任务失败');
  }
};

// 撤回跳过任务
const withdrawSkipTask = async (taskId: string) => {
  try {
    // 调用API更新任务状态为未确认
    const result = await updateTaskStatusApi(taskId, props.caseId, '未确认');

    if (result && result.status === '1') {
      // 更新本地状态
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = '未确认';
        // 通知父组件任务状态变更
        emit('taskStatusChanged', taskId, '未确认');
        ElMessage.success('已撤回跳过操作');
      }
    } else {
      ElMessage.error('撤回操作失败');
    }
  } catch (error) {
    console.error('撤回跳过任务失败:', error);
    ElMessage.error('撤回跳过任务失败');
  }
};

// ZT状态映射函数
const ztToStatus = (zt: number | undefined): CaseProcessApi.TaskStatus => {
  if (zt === 1) return '完成';
  if (zt === 2) return '跳过';
  return '未确认';
};

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 调用后端API获取任务数据，传递page和size参数
    const [canRRRes, terminationLitiRes, additionalDisiributionRes] =
      await Promise.allSettled([
        getCanRRInfoApi(props.caseId, 1, 10),
        getTerminationLitiApi(props.caseId, 1, 10),
        getAdditionalDisiributionApi(props.caseId, 1, 10),
      ]);

    // 处理API响应
    tasks.value = [
      {
        id: 'canRR',
        name: '债权人会议决议',
        status:
          canRRRes.status === 'fulfilled' &&
          canRRRes.value.status === '1' &&
          canRRRes.value.data &&
          Number.parseInt(canRRRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllCanRR',
        token: 'b9687d9bae9050728ce5f471ae32c737',
        count:
          canRRRes.status === 'fulfilled' && canRRRes.value.data
            ? canRRRes.value.data.count || 0
            : 0,
        paras:
          canRRRes.status === 'fulfilled' && canRRRes.value.data
            ? canRRRes.value.data.paras
            : undefined,
      },
      {
        id: 'terminationLiti',
        name: '终止诉讼',
        status:
          terminationLitiRes.status === 'fulfilled' &&
          terminationLitiRes.value.status === '1' &&
          terminationLitiRes.value.data &&
          Number.parseInt(
            terminationLitiRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllTerminationLiti',
        token: '8e4a5f0694dc40db05031994e3b3b332',
        count:
          terminationLitiRes.status === 'fulfilled' &&
          terminationLitiRes.value.data
            ? terminationLitiRes.value.data.count || 0
            : 0,
        paras:
          terminationLitiRes.status === 'fulfilled' &&
          terminationLitiRes.value.data
            ? terminationLitiRes.value.data.paras
            : undefined,
      },
      {
        id: 'additionalDisiribution',
        name: '追加分配',
        status:
          additionalDisiributionRes.status === 'fulfilled' &&
          additionalDisiributionRes.value.status === '1' &&
          additionalDisiributionRes.value.data &&
          Number.parseInt(
            additionalDisiributionRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllAdditionalDisiribution',
        token: '17da492375ef4f11867f65c39406594c',
        count:
          additionalDisiributionRes.status === 'fulfilled' &&
          additionalDisiributionRes.value.data
            ? additionalDisiributionRes.value.data.count || 0
            : 0,
        paras:
          additionalDisiributionRes.status === 'fulfilled' &&
          additionalDisiributionRes.value.data
            ? additionalDisiributionRes.value.data.paras
            : undefined,
      },
    ];

    // 检查是否有API调用失败
    const failedApis = [
      canRRRes,
      terminationLitiRes,
      additionalDisiributionRes,
    ].filter((res) => res.status === 'rejected').length;

    if (failedApis > 0) {
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
  <ElCard class="stage-seven-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第七阶段：债权人会议决议等相关工作</span>
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
                  ({{ task.count }})
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
                  : task.status === '跳过'
                    ? '已跳过'
                    : `待确认（${task.paras?.zt0_count || '0'}个），确认（${task.paras?.zt1_count || '0'}个）`
              }}
            </div>
          </div>
          <div class="task-actions">
            <!-- 动态按钮渲染 -->
            <template v-if="task.count === 0">
              <ElButton
                type="primary"
                size="small"
                @click="addTask(task.id)"
                :disabled="task.status === '完成' || task.status === '跳过'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <!-- 跳过/撤回按钮 -->
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
                :disabled="task.status === '完成'"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>
            </template>
            <template v-else>
              <ElButton type="info" size="small" @click="viewTask(task.id)">
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="editTask(task.id)"
                :disabled="task.status === '完成' || task.status === '跳过'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="completeTask(task.id)"
                :disabled="task.status === '完成' || task.status === '跳过'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>
              <!-- 跳过/撤回按钮 -->
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
                :disabled="task.status === '完成'"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>
              <!-- 新增按钮 -->
              <ElButton
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
        <span>第七阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-seven-process {
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
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 10px;
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
