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

// 导入API函数和类型
import {
  getLegalProcedureApi,
  getManagementApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
  unifiedTaskOperationApi,
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
    apiUrl: '/api/web/getAllWorkTeam',
    token: '4015f285dc41bd1bb931ba8430966c3f',
  },
  {
    id: 'workPlan',
    name: '工作计划确认',
    status: '未确认',
    apiUrl: '/api/web/getAllWorkPlan',
    token: '8a62e323a84173fd8ec72557e6fc616d',
  },
  {
    id: 'management',
    name: '管理制度确认',
    status: '未确认',
    apiUrl: '/api/web/getAllManagement',
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
    apiUrl: '/api/web/getAllLegalProcedure',
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
  // 从当前caseDetail中获取SEP_ID和案号，这里假设caseDetail可以通过某种方式获取
  // 由于当前组件没有直接访问caseDetail，我需要修改调用方式或添加props
  // 暂时先按原方式跳转，后面再处理案件信息的传递
  router.push(`/case-detail/${props.caseId}/task/${taskId}/edit`);
};

// 任务类型映射到OperateType
const taskTypeToOperateType: Record<string, string> = {
  workTeam: '0',
  workPlan: '1',
  management: '2',
  sealManagement: '3',
  legalProcedure: '4',
};

// 完成任务
const completeTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确认完成该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 获取当前任务信息
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) {
      ElMessage.error('任务不存在');
      return;
    }

    // 准备统一API参数
    const params = {
      SEP_LD: props.caseId,
      ZT: '1', // 完成状态
      OperateType: taskTypeToOperateType[taskId] || '0',
      ...task, // 上传所有任务数据
    };

    // 调用统一API
    const result = await unifiedTaskOperationApi(params);

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
      ElMessage.error(`更新任务状态失败：${result.error || '未知错误'}`);
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
    await ElMessageBox.confirm('确认跳过该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 获取当前任务信息
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) {
      ElMessage.error('任务不存在');
      return;
    }

    // 从本地存储获取操作人信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const sep_auser = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
    const sep_adate = new Date().toISOString();

    let addResponse: any;
    let updateResult: any;

    // 根据任务是否存在（count为0表示不存在）来决定调用哪个API
    if (task.count === 0) {
      // 任务不存在，调用新增API
      switch (taskId) {
        case 'legalProcedure': {
          // 准备法律程序默认数据
          const legalProcedureData = {
            sep_ld: props.caseId,
            sep_auser,
            sep_adate,
            cxlx: '',
            cxnr: '',
            zhrq: sep_adate,
            fzr: '',
            zt: '2', // 跳过状态默认为2
          };

          // 调用添加法律程序API
          const { addLegalProcedureApi } =
            await import('#/api/core/case-process');
          addResponse = await addLegalProcedureApi(legalProcedureData);
          break;
        }

        case 'management': {
          // 准备管理制度默认数据
          const managementData = {
            sep_ld: props.caseId,
            sep_auser,
            sep_adate,
            zdlx: '',
            zdmc: '',
            zdnr: '',
            sxrq: sep_adate,
            zt: '2', // 跳过状态默认为2
          };

          // 调用添加管理制度API
          const { addManagementApi } = await import('#/api/core/case-process');
          addResponse = await addManagementApi(managementData);
          break;
        }

        case 'sealManagement': {
          // 准备印章管理默认数据
          const sealManagementData = {
            sep_ld: props.caseId,
            sep_auser,
            sep_adate,
            yzlx: '',
            yzbh: '',
            yzyblj: '',
            zt: '2', // 跳过状态默认为2
            barq: sep_adate,
            yzmc: '',
          };

          // 调用添加印章管理API
          const { addSealManagementApi } =
            await import('#/api/core/case-process');
          addResponse = await addSealManagementApi(sealManagementData);
          break;
        }

        case 'workPlan': {
          // 准备工作计划默认数据
          const workPlanData = {
            sep_ld: props.caseId,
            sep_auser,
            sep_adate,
            jhlx: '',
            jhnr: '',
            ksrq: sep_adate,
            jsrq: sep_adate,
            fzr: '',
            zt: '2', // 跳过状态默认为2
          };

          // 调用添加工作计划API
          const { addWorkPlanApi } = await import('#/api/core/case-process');
          addResponse = await addWorkPlanApi(workPlanData);
          break;
        }

        case 'workTeam': {
          // 准备默认数据
          const workTeamData = {
            sep_ld: props.caseId, // 使用案件ID作为sep_ld
            tdfzr: '', // 团队负责人，默认空
            zhzcy: '', // 综合组成员，默认空
            cxzcy: '', // 程序组成员，默认空
            ccglzcy: '', // 财产管理组成员，默认空
            zqshzcy: '', // 债权审核组成员，默认空
            ldrszcy: '', // 劳动人事组成员，默认空
            zzqlzcy: '', // 资产清理组成员，默认空
            sepauser: sep_auser, // 从本地存储获取操作人
            sepadate: sep_adate, // 操作日期，当前时间
            ZT: '2', // 状态字段，默认为2（跳过状态）
          };

          // 动态导入addWorkTeamApi，避免循环依赖
          const { addWorkTeamApi } = await import('#/api/core/work-team');
          // 调用添加工作团队API
          addResponse = await addWorkTeamApi(workTeamData);
          break;
        }

        default: {
          break;
        }
      }

      // 检查API调用结果
      if (addResponse && addResponse.status !== '1') {
        ElMessage.error(`添加数据失败：${addResponse.error || '未知错误'}`);
        return;
      }
    } else {
      // 任务存在，调用统一API更新状态
      // 准备统一API参数
      const params = {
        SEP_LD: props.caseId,
        ZT: '2', // 跳过状态
        OperateType: taskTypeToOperateType[taskId] || '0',
      };

      // 调用统一API
      updateResult = await unifiedTaskOperationApi(params);

      if (updateResult && updateResult.status !== '1') {
        ElMessage.error(
          `更新任务状态失败：${updateResult.error || '未知错误'}`,
        );
        return;
      }
    }

    // 更新本地状态
    const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
      tasks.value[taskIndex].status = '跳过';
      // 通知父组件任务状态变更
      emit('taskStatusChanged', taskId, '跳过');
      ElMessage.success('任务已跳过');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('跳过任务失败:', error);
      ElMessage.error('跳过任务失败');
    }
  }
};

// 撤回任务（跳过或完成）
const withdrawSkipTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确认撤回该任务操作吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 准备统一API参数
    const params = {
      SEP_LD: props.caseId,
      ZT: '0', // 未确认状态
      OperateType: taskTypeToOperateType[taskId] || '0',
    };

    // 调用统一API
    const result = await unifiedTaskOperationApi(params);

    if (result && result.status === '1') {
      // 更新本地状态
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = '未确认';
        // 通知父组件任务状态变更
        emit('taskStatusChanged', taskId, '未确认');
        ElMessage.success('已撤回操作');
      }
    } else {
      ElMessage.error(`撤回操作失败：${result.error || '未知错误'}`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回操作失败:', error);
      ElMessage.error('撤回操作失败');
    }
  }
};

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 调用后端API获取任务数据，传递page和size参数
    const [
      workTeamRes,
      workPlanRes,
      managementRes,
      sealManagementRes,
      legalProcedureRes,
    ] = await Promise.allSettled([
      getWorkTeamApi(props.caseId, 1, 10),
      getWorkPlanApi(props.caseId, 1, 10),
      getManagementApi(props.caseId, 1, 10),
      getSealManagementApi(props.caseId, 1, 10),
      getLegalProcedureApi(props.caseId, 1, 10),
    ]);

    // 处理API响应，从分页数据中获取记录
    tasks.value = [
      {
        id: 'workTeam',
        name: '工作团队确认',
        status:
          workTeamRes.status === 'fulfilled' &&
          workTeamRes.value.status === '1' &&
          workTeamRes.value.data &&
          Number.parseInt(workTeamRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllWorkTeam',
        token: '4015f285dc41bd1bb931ba8430966c3f',
        count:
          (workTeamRes.status === 'fulfilled' &&
            workTeamRes.value.data?.count) ||
          0,
        paras:
          workTeamRes.status === 'fulfilled' && workTeamRes.value.data
            ? workTeamRes.value.data.paras
            : undefined,
      },
      {
        id: 'workPlan',
        name: '工作计划确认',
        status:
          workPlanRes.status === 'fulfilled' &&
          workPlanRes.value.status === '1' &&
          workPlanRes.value.data &&
          Number.parseInt(workPlanRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllWorkPlan',
        token: '8a62e323a84173fd8ec72557e6fc616d',
        count:
          (workPlanRes.status === 'fulfilled' &&
            workPlanRes.value.data?.count) ||
          0,
        paras:
          workPlanRes.status === 'fulfilled' && workPlanRes.value.data
            ? workPlanRes.value.data.paras
            : undefined,
      },
      {
        id: 'management',
        name: '管理制度确认',
        status:
          managementRes.status === 'fulfilled' &&
          managementRes.value.status === '1' &&
          managementRes.value.data &&
          Number.parseInt(managementRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllManagement',
        token: '6bbdf0bf97117c1bac495072c961e778',
        count:
          (managementRes.status === 'fulfilled' &&
            managementRes.value.data?.count) ||
          0,
        paras:
          managementRes.status === 'fulfilled' && managementRes.value.data
            ? managementRes.value.data.paras
            : undefined,
      },
      {
        id: 'sealManagement',
        name: '印章确认',
        status:
          sealManagementRes.status === 'fulfilled' &&
          sealManagementRes.value.status === '1' &&
          sealManagementRes.value.data &&
          Number.parseInt(
            sealManagementRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getSealManagement',
        token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
        count:
          (sealManagementRes.status === 'fulfilled' &&
            sealManagementRes.value.data?.count) ||
          0,
        paras:
          sealManagementRes.status === 'fulfilled' &&
          sealManagementRes.value.data
            ? sealManagementRes.value.data.paras
            : undefined,
      },
      {
        id: 'legalProcedure',
        name: '法律程序确认',
        status:
          legalProcedureRes.status === 'fulfilled' &&
          legalProcedureRes.value.status === '1' &&
          legalProcedureRes.value.data &&
          Number.parseInt(
            legalProcedureRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getAllLegalProcedure',
        token: 'a81a3a18b6d52abb4b6c38132e1198da',
        count:
          (legalProcedureRes.status === 'fulfilled' &&
            legalProcedureRes.value.data?.count) ||
          0,
        paras:
          legalProcedureRes.status === 'fulfilled' &&
          legalProcedureRes.value.data
            ? legalProcedureRes.value.data.paras
            : undefined,
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
                @click="editTask(task.id)"
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
