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
  getLegalProcedureApi,
  getManagementApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
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
    id: 'workTeam',
    name: '工作团队确认',
    status: '未确认',
    apiUrl: '/api/web/getWorkTeam',
    token: '4015f285dc41bd1bb931ba8430966c3f',
  },
  {
    id: 'workPlan',
    name: '工作计划确认',
    status: '未确认',
    apiUrl: '/api/web/getWorkPlan',
    token: '8a62e323a84173fd8ec72557e6fc616d',
  },
  {
    id: 'management',
    name: '管理制度确认',
    status: '未确认',
    apiUrl: '/api/web/getManagement',
    token: '6bbdf0bf97117c1bac495072c961e778',
  },
  {
    id: 'sealManagement',
    name: '印章确认',
    status: '未确认',
    apiUrl: '/api/web/getSealManagement',
    token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
  },
  {
    id: 'legalProcedure',
    name: '法律程序确认',
    status: '未确认',
    apiUrl: '/api/web/getLegalProcedure',
    token: 'a81a3a18b6d52abb4b6c38132e1198da',
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

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 调用后端API获取任务数据
    const [
      workTeamRes,
      workPlanRes,
      managementRes,
      sealManagementRes,
      legalProcedureRes,
    ] = await Promise.allSettled([
      getWorkTeamApi(props.caseId),
      getWorkPlanApi(props.caseId),
      getManagementApi(props.caseId),
      getSealManagementApi(props.caseId),
      getLegalProcedureApi(props.caseId),
    ]);

    // 处理API响应
    tasks.value = [
      {
        id: 'workTeam',
        name: '工作团队确认',
        status:
          workTeamRes.status === 'fulfilled' &&
          workTeamRes.value.status === '1' &&
          workTeamRes.value.data
            ? (workTeamRes.value.data.DQZT as CaseProcessApi.TaskStatus) ||
              '未确认'
            : '未确认',
        apiUrl: '/api/web/getWorkTeam',
        token: '4015f285dc41bd1bb931ba8430966c3f',
      },
      {
        id: 'workPlan',
        name: '工作计划确认',
        status:
          workPlanRes.status === 'fulfilled' &&
          workPlanRes.value.status === '1' &&
          workPlanRes.value.data
            ? (workPlanRes.value.data.DQZT as CaseProcessApi.TaskStatus) ||
              '未确认'
            : '未确认',
        apiUrl: '/api/web/getWorkPlan',
        token: '8a62e323a84173fd8ec72557e6fc616d',
      },
      {
        id: 'management',
        name: '管理制度确认',
        status:
          managementRes.status === 'fulfilled' &&
          managementRes.value.status === '1' &&
          managementRes.value.data
            ? (managementRes.value.data.DQZT as CaseProcessApi.TaskStatus) ||
              '未确认'
            : '未确认',
        apiUrl: '/api/web/getManagement',
        token: '6bbdf0bf97117c1bac495072c961e778',
      },
      {
        id: 'sealManagement',
        name: '印章确认',
        status:
          sealManagementRes.status === 'fulfilled' &&
          sealManagementRes.value.status === '1' &&
          sealManagementRes.value.data
            ? (sealManagementRes.value.data
                .DQZT as CaseProcessApi.TaskStatus) || '未确认'
            : '未确认',
        apiUrl: '/api/web/getSealManagement',
        token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
      },
      {
        id: 'legalProcedure',
        name: '法律程序确认',
        status:
          legalProcedureRes.status === 'fulfilled' &&
          legalProcedureRes.value.status === '1' &&
          legalProcedureRes.value.data
            ? (legalProcedureRes.value.data
                .DQZT as CaseProcessApi.TaskStatus) || '未确认'
            : '未确认',
        apiUrl: '/api/web/getLegalProcedure',
        token: 'a81a3a18b6d52abb4b6c38132e1198da',
      },
    ];

    // 检查是否有API调用失败
    const failedApis = [
      workTeamRes,
      workPlanRes,
      managementRes,
      sealManagementRes,
      legalProcedureRes,
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
  <ElCard class="stage-one-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第一阶段：法院指定管理人至管理人接管破产企业前的工作</span>
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
              <div class="task-name">{{ task.name }}</div>
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
                    : '待确认'
              }}
            </div>
          </div>
          <div class="task-actions">
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

            <!-- 动态按钮：跳过状态显示撤回，其他状态显示跳过 -->
            <ElButton
              v-if="task.status === '跳过'"
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
          </div>
        </div>
      </div>
    </div>

    <!-- 阶段完成提示 -->
    <div v-if="progress === 100" class="stage-complete">
      <div class="complete-message">
        <Icon icon="lucide:check-circle" class="mr-2 text-green-500" />
        <span>第一阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-one-process {
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
