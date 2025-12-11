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
    id: 'assetValuation',
    name: '资产价值评估',
    status: '未确认',
    apiUrl: '/api/web/getAllAssetValuation',
    token: '786eca97a5c1b3271231f4f0dad8b3cf',
  },
  {
    id: 'propertyVPlan',
    name: '财产变价方案',
    status: '未确认',
    apiUrl: '/api/web/getAllPropertyVPlan',
    token: '033f7b7923ec289a820c8034eae68148',
  },
  {
    id: 'bankruptcyDeclaration',
    name: '破产宣告',
    status: '未确认',
    apiUrl: '/api/web/getAllBankruptcyDeclaration',
    token: '79f1d12edeabe1bcd74c915a9e18d698',
  },
  {
    id: 'propertyVIM',
    name: '财产分配方案',
    status: '未确认',
    apiUrl: '/api/web/getAllPropertyVIM',
    token: '09bc23e906457a5f0748765a0e95c7f3',
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
      `${import.meta.env.VITE_GLOB_API_URL}${apiUrl}?token=${token}&GLAJBH=${caseId}&page=1&size=10`,
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
      assetValuationRes,
      propertyVPlanRes,
      bankruptcyDeclarationRes,
      propertyVIMRes,
    ] = await Promise.allSettled([
      callApi(
        '/api/web/getAllAssetValuation',
        '786eca97a5c1b3271231f4f0dad8b3cf',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllPropertyVPlan',
        '033f7b7923ec289a820c8034eae68148',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllBankruptcyDeclaration',
        '79f1d12edeabe1bcd74c915a9e18d698',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllPropertyVIM',
        '09bc23e906457a5f0748765a0e95c7f3',
        props.caseId,
      ),
    ]);

    // 处理API响应
    const getStatus = (
      res: PromiseSettledResult<any>,
    ): CaseProcessApi.TaskStatus => {
      if (
        res.status === 'fulfilled' &&
        res.value &&
        res.value.status === '1' &&
        res.value.data?.records?.length > 0
      ) {
        return (
          (res.value.data.records[0].DQZT as CaseProcessApi.TaskStatus) ||
          '未确认'
        );
      }
      return '未确认';
    };

    tasks.value = [
      {
        id: 'assetValuation',
        name: '资产价值评估',
        status: getStatus(assetValuationRes),
        apiUrl: '/api/web/getAllAssetValuation',
        token: '786eca97a5c1b3271231f4f0dad8b3cf',
      },
      {
        id: 'propertyVPlan',
        name: '财产变价方案',
        status: getStatus(propertyVPlanRes),
        apiUrl: '/api/web/getAllPropertyVPlan',
        token: '033f7b7923ec289a820c8034eae68148',
      },
      {
        id: 'bankruptcyDeclaration',
        name: '破产宣告',
        status: getStatus(bankruptcyDeclarationRes),
        apiUrl: '/api/web/getAllBankruptcyDeclaration',
        token: '79f1d12edeabe1bcd74c915a9e18d698',
      },
      {
        id: 'propertyVIM',
        name: '财产分配方案',
        status: getStatus(propertyVIMRes),
        apiUrl: '/api/web/getAllPropertyVIM',
        token: '09bc23e906457a5f0748765a0e95c7f3',
      },
    ];

    // 检查API响应状态，处理status为"0"的情况
    const allApiResponses = [
      assetValuationRes,
      propertyVPlanRes,
      bankruptcyDeclarationRes,
      propertyVIMRes,
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
    const uniqueErrorMessages = Array.from(new Set(errorMessages));
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
  <ElCard class="stage-five-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第五阶段：第二次债权人会议至破产宣告前工作</span>
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
              当前状态：{{
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
        <span>第五阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-five-process {
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

.text-green-500 {
  color: #10b981;
}

.mr-1 {
  margin-right: 4px;
}

.mr-2 {
  margin-right: 8px;
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
