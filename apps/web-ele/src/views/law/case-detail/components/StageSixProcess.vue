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
  getBankruptcyDistPlanApi,
  getDepositManagementApi,
  getEmployeeSPlanApi,
  getPriorityPaymentApi,
  getPropertyDECApi,
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
    id: 'bankruptcyDistPlan',
    name: '破产财产分配方案',
    status: '未确认',
    apiUrl: '/api/web/getAllBankruptcyDistPlan',
    token: '1cf410da5126134db95b41ad20557098',
  },
  {
    id: 'employeeSPlan',
    name: '员工安置方案',
    status: '未确认',
    apiUrl: '/api/web/getAllEmployeeSPlan',
    token: '15e4fe855b3ac9217ba42ac37a049026',
  },
  {
    id: 'priorityPayment',
    name: '优先受偿权',
    status: '未确认',
    apiUrl: '/api/web/getAllPriorityPayment',
    token: 'd8b58a8dade9ee9f4047c0faef6b701b',
  },
  {
    id: 'propertyDEC',
    name: '财产状况说明',
    status: '未确认',
    apiUrl: '/api/web/getAllPropertyDEC',
    token: '7b23de744671f96a654bdf843b092808',
  },
  {
    id: 'depositManagement',
    name: '存款管理',
    status: '未确认',
    apiUrl: '/api/web/getAllDepositManagement',
    token: '0e422bd12a2426db4878f646d7815302',
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
    // 调用后端API获取任务数据，传递page和size参数
    const [
      bankruptcyDistPlanRes,
      employeeSPlanRes,
      priorityPaymentRes,
      propertyDECRes,
      depositManagementRes,
    ] = await Promise.allSettled([
      getBankruptcyDistPlanApi(props.caseId, 1, 10),
      getEmployeeSPlanApi(props.caseId, 1, 10),
      getPriorityPaymentApi(props.caseId, 1, 10),
      getPropertyDECApi(props.caseId, 1, 10),
      getDepositManagementApi(props.caseId, 1, 10),
    ]);

    // 处理API响应
    tasks.value = [
      {
        id: 'bankruptcyDistPlan',
        name: '破产财产分配方案',
        status:
          bankruptcyDistPlanRes.status === 'fulfilled' &&
          bankruptcyDistPlanRes.value.status === '1' &&
          bankruptcyDistPlanRes.value.data &&
          Number.parseInt(
            bankruptcyDistPlanRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllBankruptcyDistPlan',
        token: '1cf410da5126134db95b41ad20557098',
        count:
          bankruptcyDistPlanRes.status === 'fulfilled' &&
          bankruptcyDistPlanRes.value.data
            ? bankruptcyDistPlanRes.value.data.count || 0
            : 0,
        paras:
          bankruptcyDistPlanRes.status === 'fulfilled' &&
          bankruptcyDistPlanRes.value.data
            ? bankruptcyDistPlanRes.value.data.paras
            : undefined,
      },
      {
        id: 'employeeSPlan',
        name: '员工安置方案',
        status:
          employeeSPlanRes.status === 'fulfilled' &&
          employeeSPlanRes.value.status === '1' &&
          employeeSPlanRes.value.data &&
          Number.parseInt(employeeSPlanRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllEmployeeSPlan',
        token: '15e4fe855b3ac9217ba42ac37a049026',
        count:
          employeeSPlanRes.status === 'fulfilled' && employeeSPlanRes.value.data
            ? employeeSPlanRes.value.data.count || 0
            : 0,
        paras:
          employeeSPlanRes.status === 'fulfilled' && employeeSPlanRes.value.data
            ? employeeSPlanRes.value.data.paras
            : undefined,
      },
      {
        id: 'priorityPayment',
        name: '优先受偿权',
        status:
          priorityPaymentRes.status === 'fulfilled' &&
          priorityPaymentRes.value.status === '1' &&
          priorityPaymentRes.value.data &&
          Number.parseInt(priorityPaymentRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllPriorityPayment',
        token: 'd8b58a8dade9ee9f4047c0faef6b701b',
        count:
          priorityPaymentRes.status === 'fulfilled' && priorityPaymentRes.value.data
            ? priorityPaymentRes.value.data.count || 0
            : 0,
        paras:
          priorityPaymentRes.status === 'fulfilled' && priorityPaymentRes.value.data
            ? priorityPaymentRes.value.data.paras
            : undefined,
      },
      {
        id: 'propertyDEC',
        name: '财产状况说明',
        status:
          propertyDECRes.status === 'fulfilled' &&
          propertyDECRes.value.status === '1' &&
          propertyDECRes.value.data &&
          Number.parseInt(propertyDECRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllPropertyDEC',
        token: '7b23de744671f96a654bdf843b092808',
        count:
          propertyDECRes.status === 'fulfilled' && propertyDECRes.value.data
            ? propertyDECRes.value.data.count || 0
            : 0,
        paras:
          propertyDECRes.status === 'fulfilled' && propertyDECRes.value.data
            ? propertyDECRes.value.data.paras
            : undefined,
      },
      {
        id: 'depositManagement',
        name: '存款管理',
        status:
          depositManagementRes.status === 'fulfilled' &&
          depositManagementRes.value.status === '1' &&
          depositManagementRes.value.data &&
          Number.parseInt(
            depositManagementRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllDepositManagement',
        token: '0e422bd12a2426db4878f646d7815302',
        count:
          depositManagementRes.status === 'fulfilled' && depositManagementRes.value.data
            ? depositManagementRes.value.data.count || 0
            : 0,
        paras:
          depositManagementRes.status === 'fulfilled' && depositManagementRes.value.data
            ? depositManagementRes.value.data.paras
            : undefined,
      },
    ];

    // 检查是否有API调用失败
    const failedApis = [
      bankruptcyDistPlanRes,
      employeeSPlanRes,
      priorityPaymentRes,
      propertyDECRes,
      depositManagementRes,
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
  <ElCard class="stage-six-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第六阶段：破产财产分配方案等相关工作</span>
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
                @click="editTask(task.id)"
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
                @click="editTask(task.id)"
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
        <span>第六阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-six-process {
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
