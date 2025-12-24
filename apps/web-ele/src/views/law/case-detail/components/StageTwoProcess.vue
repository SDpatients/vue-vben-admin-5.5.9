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
  getBusinessManagementApi,
  getEmergencyApi,
  getInternalAffairsApi,
  getPersonnelEmpApi,
  getPropertyPlanApi,
  getPropertyReceiptApi,
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
    id: 'propertyReceipt',
    name: '财产接管确认',
    status: '未确认',
    apiUrl: '/api/web/getPropertyReceipt',
    token: '699a11d9338b983ce9eafc5e75f1833f',
  },
  {
    id: 'emergency',
    name: '应急预案确认',
    status: '未确认',
    apiUrl: '/api/web/getEmergency',
    token: 'c6c85c5e695fec908ded4f05f9e9bfc9',
  },
  {
    id: 'propertyPlan',
    name: '财产处置计划确认',
    status: '未确认',
    apiUrl: '/api/web/getPropertyPlan',
    token: '924180f974b81f375d6625ab0fd59f60',
  },
  {
    id: 'personnelEmp',
    name: '人事管理确认',
    status: '未确认',
    apiUrl: '/api/web/getPersonnelEmp',
    token: 'ae3987ea39249e94edb9bdccf1c859d7',
  },
  {
    id: 'internalAffairs',
    name: '内部事务确认',
    status: '未确认',
    apiUrl: '/api/web/getInternalAffairs',
    token: 'ba251b8fffee8a47a71b3429ab9cccb5',
  },
  {
    id: 'businessManagement',
    name: '经营管理确认',
    status: '未确认',
    apiUrl: '/api/web/getBusinessManagement',
    token: '0611b92b9a4bd76e5fc315d145a90fc2',
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

// 任务类型映射到OperateType
const taskTypeToOperateType: Record<string, string> = {
  propertyReceipt: '5',
  emergency: '6',
  propertyPlan: '7',
  personnelEmp: '8',
  internalAffairs: '9',
  businessManagement: '10',
};

// 编辑任务
const editTask = (taskId: string) => {
  router.push(`/case-detail/${props.caseId}/task/${taskId}/edit`);
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

    // 获取当前任务信息
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) {
      ElMessage.error('任务不存在');
      return;
    }

    // 从本地存储获取操作人信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const SEP_EUSER = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
    const SEP_EDATE = new Date().toISOString();

    // 准备统一API参数
    const params = {
      SEP_LD: props.caseId,
      ZT: '1', // 完成状态
      OperateType: taskTypeToOperateType[taskId] || '5',
      SEP_EDATE,
      SEP_EUSER,
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
    const SEP_EUSER = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
    const SEP_EDATE = new Date().toISOString();

    let addResponse: any;
    let updateResult: any;

    // 根据任务是否存在（count为0表示不存在）来决定调用哪个API
    if (task.count === 0) {
      // 任务不存在，调用新增API
      switch (taskId) {
        case 'businessManagement': {
          // 准备经营管理默认数据
          const businessManagementData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            yyqktc: '',
            fxlzbg: '',
            jdnr: '',
            fypzrq: SEP_EDATE,
            sszt: '',
            fzr: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '10',
          };

          // 调用添加经营管理API
          const { addBusinessManagementApi } =
            await import('#/api/core/case-process');
          addResponse = await addBusinessManagementApi(businessManagementData);
          break;
        }

        case 'emergency': {
          // 准备应急预案默认数据
          const emergencyData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            fzr: '',
            abcs: '',
            bxxx: '',
            bzcccl: '',
            qlsxyqj: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '6',
          };

          // 调用添加应急预案API
          const { addEmergencyApi } = await import('#/api/core/case-process');
          addResponse = await addEmergencyApi(emergencyData);
          break;
        }

        case 'internalAffairs': {
          // 准备内部事务默认数据
          const internalAffairsData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            swlx: '',
            swnr: '',
            jdrq: SEP_EDATE,
            jdr: '',
            kzje: '',
            kzsm: '',
            clzt: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '9',
          };

          // 调用添加内部事务API
          const { addInternalAffairsApi } =
            await import('#/api/core/case-process');
          addResponse = await addInternalAffairsApi(internalAffairsData);
          break;
        }

        case 'personnelEmp': {
          // 准备人事管理默认数据
          const personnelEmpData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            ygxm: '',
            yglx: '',
            zw: '',
            pyrq: SEP_EDATE,
            xcxx: '',
            fypzqk: '',
            pyzt: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '8',
          };

          // 调用添加人事管理API
          const { addPersonnelEmploymentApi } =
            await import('#/api/core/case-process');
          addResponse = await addPersonnelEmploymentApi(personnelEmpData);
          break;
        }

        case 'propertyPlan': {
          // 准备财产处置计划默认数据
          const propertyPlanData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            famc: '',
            bdcglcs: '',
            dcglcs: '',
            hbccglcs: '',
            wxccglcs: '',
            dwtzglcs: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '7',
          };

          // 调用添加财产处置计划API
          const { addPropertyPlanApi } =
            await import('#/api/core/case-process');
          addResponse = await addPropertyPlanApi(propertyPlanData);
          break;
        }

        case 'propertyReceipt': {
          // 准备财产接管默认数据
          const propertyReceiptData = {
            sep_ld: props.caseId,
            SEP_EUSER,
            SEP_EDATE,
            jjhyrq: SEP_EDATE,
            chry: '',
            cczksm: '',
            jjrq: SEP_EDATE,
            jjr: '',
            jsr: '',
            jszt: '',
            cclx: '',
            ccmc: '',
            ccje: '',
            cfdd: '',
            zt: '2', // 跳过状态默认为2
            OperateType: taskTypeToOperateType[taskId] || '5',
          };

          // 调用添加财产接管API
          const { addPropertyReceiptApi } =
            await import('#/api/core/case-process');
          addResponse = await addPropertyReceiptApi(propertyReceiptData);
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
        OperateType: taskTypeToOperateType[taskId] || '5',
        SEP_EDATE,
        SEP_EUSER,
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

    // 从本地存储获取操作人信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const SEP_EUSER = chatUserInfo ? JSON.parse(chatUserInfo).U_USER : 'admin';
    const SEP_EDATE = new Date().toISOString();

    // 准备统一API参数
    const params = {
      SEP_LD: props.caseId,
      ZT: '0', // 未确认状态
      OperateType: taskTypeToOperateType[taskId] || '5',
      SEP_EDATE,
      SEP_EUSER,
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
      propertyReceiptRes,
      emergencyRes,
      propertyPlanRes,
      personnelEmpRes,
      internalAffairsRes,
      businessManagementRes,
    ] = await Promise.allSettled([
      getPropertyReceiptApi(props.caseId, 1, 10),
      getEmergencyApi(props.caseId, 1, 10),
      getPropertyPlanApi(props.caseId, 1, 10),
      getPersonnelEmpApi(props.caseId, 1, 10),
      getInternalAffairsApi(props.caseId, 1, 10),
      getBusinessManagementApi(props.caseId, 1, 10),
    ]);

    // 处理API响应
    tasks.value = [
      {
        id: 'propertyReceipt',
        name: '财产接管确认',
        status:
          propertyReceiptRes.status === 'fulfilled' &&
          propertyReceiptRes.value.status === '1' &&
          propertyReceiptRes.value.data &&
          Number.parseInt(
            propertyReceiptRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getPropertyReceipt',
        token: '699a11d9338b983ce9eafc5e75f1833f',
        count:
          (propertyReceiptRes.status === 'fulfilled' &&
            propertyReceiptRes.value.data?.count) ||
          0,
        paras:
          propertyReceiptRes.status === 'fulfilled' &&
          propertyReceiptRes.value.data
            ? propertyReceiptRes.value.data.paras
            : undefined,
      },
      {
        id: 'emergency',
        name: '应急预案确认',
        status:
          emergencyRes.status === 'fulfilled' &&
          emergencyRes.value.status === '1' &&
          emergencyRes.value.data &&
          Number.parseInt(emergencyRes.value.data.paras?.zt2_count || '0') > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getEmergency',
        token: 'c6c85c5e695fec908ded4f05f9e9bfc9',
        count:
          (emergencyRes.status === 'fulfilled' &&
            emergencyRes.value.data?.count) ||
          0,
        paras:
          emergencyRes.status === 'fulfilled' && emergencyRes.value.data
            ? emergencyRes.value.data.paras
            : undefined,
      },
      {
        id: 'propertyPlan',
        name: '财产处置计划确认',
        status:
          propertyPlanRes.status === 'fulfilled' &&
          propertyPlanRes.value.status === '1' &&
          propertyPlanRes.value.data &&
          Number.parseInt(propertyPlanRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getPropertyPlan',
        token: '924180f974b81f375d6625ab0fd59f60',
        count:
          (propertyPlanRes.status === 'fulfilled' &&
            propertyPlanRes.value.data?.count) ||
          0,
        paras:
          propertyPlanRes.status === 'fulfilled' && propertyPlanRes.value.data
            ? propertyPlanRes.value.data.paras
            : undefined,
      },
      {
        id: 'personnelEmp',
        name: '人事管理确认',
        status:
          personnelEmpRes.status === 'fulfilled' &&
          personnelEmpRes.value.status === '1' &&
          personnelEmpRes.value.data &&
          Number.parseInt(personnelEmpRes.value.data.paras?.zt2_count || '0') >
            0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getPersonnelEmp',
        token: 'ae3987ea39249e94edb9bdccf1c859d7',
        count:
          (personnelEmpRes.status === 'fulfilled' &&
            personnelEmpRes.value.data?.count) ||
          0,
        paras:
          personnelEmpRes.status === 'fulfilled' && personnelEmpRes.value.data
            ? personnelEmpRes.value.data.paras
            : undefined,
      },
      {
        id: 'internalAffairs',
        name: '内部事务确认',
        status:
          internalAffairsRes.status === 'fulfilled' &&
          internalAffairsRes.value.status === '1' &&
          internalAffairsRes.value.data &&
          Number.parseInt(
            internalAffairsRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getInternalAffairs',
        token: 'ba251b8fffee8a47a71b3429ab9cccb5',
        count:
          (internalAffairsRes.status === 'fulfilled' &&
            internalAffairsRes.value.data?.count) ||
          0,
        paras:
          internalAffairsRes.status === 'fulfilled' &&
          internalAffairsRes.value.data
            ? internalAffairsRes.value.data.paras
            : undefined,
      },
      {
        id: 'businessManagement',
        name: '经营管理确认',
        status:
          businessManagementRes.status === 'fulfilled' &&
          businessManagementRes.value.status === '1' &&
          businessManagementRes.value.data &&
          Number.parseInt(
            businessManagementRes.value.data.paras?.zt2_count || '0',
          ) > 0
            ? '跳过'
            : '未确认',
        apiUrl: '/api/web/getBusinessManagement',
        token: '0611b92b9a4bd76e5fc315d145a90fc2',
        count:
          (businessManagementRes.status === 'fulfilled' &&
            businessManagementRes.value.data?.count) ||
          0,
        paras:
          businessManagementRes.status === 'fulfilled' &&
          businessManagementRes.value.data
            ? businessManagementRes.value.data.paras
            : undefined,
      },
    ];

    // 检查是否有API调用失败
    const failedApis = [
      propertyReceiptRes,
      emergencyRes,
      propertyPlanRes,
      personnelEmpRes,
      internalAffairsRes,
      businessManagementRes,
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
  <ElCard class="stage-two-process" v-loading="loading">
    <template #header>
      <div class="stage-header">
        <div class="stage-title">
          <Icon icon="lucide:workflow" class="mr-2" />
          <span>第二阶段：管理人接管破产企业至调查审查破产企业前的工作</span>
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
        <span>第二阶段所有任务已完成！</span>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-two-process {
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
