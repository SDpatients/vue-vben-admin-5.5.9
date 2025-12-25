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
    id: 'propertyInvestigation',
    name: '财产调查',
    status: '未确认',
    apiUrl: '/api/web/getAllPropertyInvestigation',
    token: '17fce65ebabe3088ab45b97f77f91b5a',
  },
  {
    id: 'bankExpenses',
    name: '银行费用',
    status: '未确认',
    apiUrl: '/api/web/getAllBankExpenses',
    token: 'ff7185ba1adffaa6630ec57062ae6473',
  },
  {
    id: 'rightsClaim',
    name: '权利主张',
    status: '未确认',
    apiUrl: '/api/web/getAllRightsClaim',
    token: '0ce8909084c3cd60a2e2f8ba450df13a',
  },
  {
    id: 'reclaimReview',
    name: '回收审核',
    status: '未确认',
    apiUrl: '/api/web/getAllReclaimReview',
    token: 'dcdc3c95faccd88d495c94923f8e2148',
  },
  {
    id: 'litigationArbitration',
    name: '诉讼仲裁',
    status: '未确认',
    apiUrl: '/api/web/getAllLitigationArbitration',
    token: '7adbf35a9986045cb55ce9e1d8d8b90c',
  },
  {
    id: 'creditorClaim',
    name: '债权人申报',
    status: '未确认',
    apiUrl: '/api/web/getAllCreditorClaim',
    token: '7fb219c01b0107dc5cb58d173ce87664',
  },
  {
    id: 'socialSF',
    name: '社保费用表',
    status: '未确认',
    apiUrl: '/api/web/getAllSociaSF',
    token: 'a8990ffa15ebbd2bff6aed37db08cadf',
  },
  {
    id: 'taxVerification',
    name: '税收核定表',
    status: '未确认',
    apiUrl: '/api/web/getAllTaxVerification',
    token: '59a21e973cc5a522c63b11c19a988d0b',
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
      propertyInvestigationRes,
      bankExpensesRes,
      rightsClaimRes,
      reclaimReviewRes,
      litigationArbitrationRes,
      creditorClaimRes,
      socialSFRes,
      taxVerificationRes,
    ] = await Promise.allSettled([
      callApi(
        '/api/web/getAllPropertyInvestigation',
        '17fce65ebabe3088ab45b97f77f91b5a',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllBankExpenses',
        'ff7185ba1adffaa6630ec57062ae6473',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllRightsClaim',
        '0ce8909084c3cd60a2e2f8ba450df13a',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllReclaimReview',
        'dcdc3c95faccd88d495c94923f8e2148',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllLitigationArbitration',
        '7adbf35a9986045cb55ce9e1d8d8b90c',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllCreditorClaim',
        '7fb219c01b0107dc5cb58d173ce87664',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllSociaSF',
        'a8990ffa15ebbd2bff6aed37db08cadf',
        props.caseId,
      ),
      callApi(
        '/api/web/getAllTaxVerification',
        '59a21e973cc5a522c63b11c19a988d0b',
        props.caseId,
      ),
    ]);

    // 处理API响应，转换ZT状态为任务状态
    const ztToStatus = (zt: number | undefined): CaseProcessApi.TaskStatus => {
      if (zt === 1) return '完成';
      if (zt === 2) return '跳过';
      return '未确认';
    };

    // 处理API响应
    tasks.value = [
      {
        id: 'propertyInvestigation',
        name: '财产调查',
        status:
          propertyInvestigationRes.status === 'fulfilled' &&
          propertyInvestigationRes.value &&
          propertyInvestigationRes.value.status === '1' &&
          propertyInvestigationRes.value.data &&
          Number.parseInt(
            propertyInvestigationRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllPropertyInvestigation',
        token: '17fce65ebabe3088ab45b97f77f91b5a',
        count:
          propertyInvestigationRes.status === 'fulfilled' &&
          propertyInvestigationRes.value
            ? propertyInvestigationRes.value.data?.count || 0
            : 0,
        paras:
          propertyInvestigationRes.status === 'fulfilled' &&
          propertyInvestigationRes.value
            ? propertyInvestigationRes.value.data.paras
            : undefined,
      },
      {
        id: 'bankExpenses',
        name: '银行费用',
        status:
          bankExpensesRes.status === 'fulfilled' &&
          bankExpensesRes.value &&
          bankExpensesRes.value.status === '1' &&
          bankExpensesRes.value.data &&
          Number.parseInt(bankExpensesRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllBankExpenses',
        token: 'ff7185ba1adffaa6630ec57062ae6473',
        count:
          bankExpensesRes.status === 'fulfilled' && bankExpensesRes.value
            ? bankExpensesRes.value.data?.count || 0
            : 0,
        paras:
          bankExpensesRes.status === 'fulfilled' && bankExpensesRes.value
            ? bankExpensesRes.value.data.paras
            : undefined,
      },
      {
        id: 'rightsClaim',
        name: '权利主张',
        status:
          rightsClaimRes.status === 'fulfilled' &&
          rightsClaimRes.value &&
          rightsClaimRes.value.status === '1' &&
          rightsClaimRes.value.data &&
          Number.parseInt(rightsClaimRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllRightsClaim',
        token: '0ce8909084c3cd60a2e2f8ba450df13a',
        count:
          rightsClaimRes.status === 'fulfilled' && rightsClaimRes.value
            ? rightsClaimRes.value.data?.count || 0
            : 0,
        paras:
          rightsClaimRes.status === 'fulfilled' && rightsClaimRes.value
            ? rightsClaimRes.value.data.paras
            : undefined,
      },
      {
        id: 'reclaimReview',
        name: '回收审核',
        status:
          reclaimReviewRes.status === 'fulfilled' &&
          reclaimReviewRes.value &&
          reclaimReviewRes.value.status === '1' &&
          reclaimReviewRes.value.data &&
          Number.parseInt(reclaimReviewRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllReclaimReview',
        token: 'dcdc3c95faccd88d495c94923f8e2148',
        count:
          reclaimReviewRes.status === 'fulfilled' && reclaimReviewRes.value
            ? reclaimReviewRes.value.data?.count || 0
            : 0,
        paras:
          reclaimReviewRes.status === 'fulfilled' && reclaimReviewRes.value
            ? reclaimReviewRes.value.data.paras
            : undefined,
      },
      {
        id: 'litigationArbitration',
        name: '诉讼仲裁',
        status:
          litigationArbitrationRes.status === 'fulfilled' &&
          litigationArbitrationRes.value &&
          litigationArbitrationRes.value.status === '1' &&
          litigationArbitrationRes.value.data &&
          Number.parseInt(
            litigationArbitrationRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllLitigationArbitration',
        token: '7adbf35a9986045cb55ce9e1d8d8b90c',
        count:
          litigationArbitrationRes.status === 'fulfilled' &&
          litigationArbitrationRes.value
            ? litigationArbitrationRes.value.data?.count || 0
            : 0,
        paras:
          litigationArbitrationRes.status === 'fulfilled' &&
          litigationArbitrationRes.value
            ? litigationArbitrationRes.value.data.paras
            : undefined,
      },
      {
        id: 'creditorClaim',
        name: '债权人申报',
        status:
          creditorClaimRes.status === 'fulfilled' &&
          creditorClaimRes.value &&
          creditorClaimRes.value.status === '1' &&
          creditorClaimRes.value.data &&
          Number.parseInt(creditorClaimRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllCreditorClaim',
        token: '7fb219c01b0107dc5cb58d173ce87664',
        count:
          creditorClaimRes.status === 'fulfilled' && creditorClaimRes.value
            ? creditorClaimRes.value.data?.count || 0
            : 0,
        paras:
          creditorClaimRes.status === 'fulfilled' && creditorClaimRes.value
            ? creditorClaimRes.value.data.paras
            : undefined,
      },
      {
        id: 'socialSF',
        name: '社保费用表',
        status:
          socialSFRes.status === 'fulfilled' &&
          socialSFRes.value &&
          socialSFRes.value.status === '1' &&
          socialSFRes.value.data &&
          Number.parseInt(socialSFRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllSociaSF',
        token: 'a8990ffa15ebbd2bff6aed37db08cadf',
        count:
          socialSFRes.status === 'fulfilled' && socialSFRes.value
            ? socialSFRes.value.data?.count || 0
            : 0,
        paras:
          socialSFRes.status === 'fulfilled' && socialSFRes.value
            ? socialSFRes.value.data.paras
            : undefined,
      },
      {
        id: 'taxVerification',
        name: '税收核定表',
        status:
          taxVerificationRes.status === 'fulfilled' &&
          taxVerificationRes.value &&
          taxVerificationRes.value.status === '1' &&
          taxVerificationRes.value.data &&
          Number.parseInt(
            taxVerificationRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllTaxVerification',
        token: '59a21e973cc5a522c63b11c19a988d0b',
        count:
          taxVerificationRes.status === 'fulfilled' && taxVerificationRes.value
            ? taxVerificationRes.value.data?.count || 0
            : 0,
        paras:
          taxVerificationRes.status === 'fulfilled' && taxVerificationRes.value
            ? taxVerificationRes.value.data.paras
            : undefined,
      },
    ];

    // 检查API响应状态，处理status为"0"的情况
    const allApiResponses = [
      propertyInvestigationRes,
      bankExpensesRes,
      rightsClaimRes,
      reclaimReviewRes,
      litigationArbitrationRes,
      creditorClaimRes,
      socialSFRes,
      taxVerificationRes,
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
  <ElCard class="stage-three-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第三阶段：管理人调查审查破产企业至第一次债权人会议前工作</span>
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
            <!-- 如果count为0，显示新增和跳过按钮 -->
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
            </template>

            <!-- 如果count不为0，显示编辑、完成、跳过和新增按钮 -->
            <template v-else>
              <ElButton
                type="info"
                size="small"
                @click="viewTask(task.id)"
              >
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
        <span>第三阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-three-process {
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
