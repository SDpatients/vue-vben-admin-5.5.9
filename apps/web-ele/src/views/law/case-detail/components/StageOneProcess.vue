<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElMessage,
  ElProgress,
  ElTag,
} from 'element-plus';

import {
  getLegalProcedureApi,
  getManagementApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
  unifiedTaskOperationApi,
} from '#/api/core/case-process';

import { taskConfigs } from '../config/task-config';
import {
  calculateTaskStatus,
  getStatusClass,
  getStatusType,
} from '../utils/task-utils';

interface Props {
  caseId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  taskStatusChanged: [taskId: string, status: string];
}>();

const router = useRouter();

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

const progress = computed(() => {
  const completedTasks = tasks.value.filter(
    (task) => task.status === '完成' || task.status === '跳过',
  ).length;
  return Math.round((completedTasks / tasks.value.length) * 100);
});

const handleAddWorkTeam = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-team/add`,
  });
};

const handleEditWorkTeam = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-team/edit`,
    query: {
      taskId: 'workTeam',
    },
  });
};

const handleViewWorkTeam = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-team/view`,
    query: {
      taskId: 'workTeam',
    },
  });
};

const handleAddWorkPlan = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-plan/add`,
  });
};

const handleEditWorkPlan = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-plan/edit`,
    query: {
      taskId: 'workPlan',
    },
  });
};

const handleViewWorkPlan = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/work-plan/view`,
    query: {
      taskId: 'workPlan',
    },
  });
};

const handleAddManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/management/add`,
  });
};

const handleEditManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/management/edit`,
    query: {
      taskId: 'management',
    },
  });
};

const handleViewManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/management/view`,
    query: {
      taskId: 'management',
    },
  });
};

const handleAddSealManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/seal-management/add`,
  });
};

const handleEditSealManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/seal-management/edit`,
    query: {
      taskId: 'sealManagement',
    },
  });
};

const handleViewSealManagement = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/seal-management/view`,
    query: {
      taskId: 'sealManagement',
    },
  });
};

const handleAddLegalProcedure = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/legal-procedure/add`,
  });
};

const handleEditLegalProcedure = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/legal-procedure/edit`,
    query: {
      taskId: 'legalProcedure',
    },
  });
};

const handleViewLegalProcedure = () => {
  router.push({
    path: `/law/case-detail/${props.caseId}/legal-procedure/view`,
    query: {
      taskId: 'legalProcedure',
    },
  });
};

const handleCompleteTask = async (taskId: string) => {
  try {
    await unifiedTaskOperationApi({
      SEP_LD: props.caseId,
      OperateType: '1',
      taskId,
    });
    ElMessage.success('任务完成成功');
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      task.status = '完成';
      emit('taskStatusChanged', taskId, '完成');
    }
  } catch (error) {
    console.error('任务完成失败:', error);
    ElMessage.error('任务完成失败');
  }
};

const handleSkipTask = async (taskId: string) => {
  try {
    await unifiedTaskOperationApi({
      SEP_LD: props.caseId,
      OperateType: '2',
      taskId,
    });
    ElMessage.success('任务跳过成功');
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      task.status = '跳过';
      emit('taskStatusChanged', taskId, '跳过');
    }
  } catch (error) {
    console.error('任务跳过失败:', error);
    ElMessage.error('任务跳过失败');
  }
};

const loadTaskData = async () => {
  loading.value = true;
  try {
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

    tasks.value = [
      {
        id: 'workTeam',
        name: '工作团队确认',
        status: calculateTaskStatus(workTeamRes),
        apiUrl: '/api/web/getAllWorkTeam',
        token: '4015f285dc41bd1bb931ba8430966c3f',
        count: (workTeamRes.status === 'fulfilled' && workTeamRes.value.data?.count) || 0,
        paras: workTeamRes.status === 'fulfilled' && workTeamRes.value.data ? workTeamRes.value.data.paras : undefined,
      },
      {
        id: 'workPlan',
        name: '工作计划确认',
        status: calculateTaskStatus(workPlanRes),
        apiUrl: '/api/web/getAllWorkPlan',
        token: '8a62e323a84173fd8ec72557e6fc616d',
        count: (workPlanRes.status === 'fulfilled' && workPlanRes.value.data?.count) || 0,
        paras: workPlanRes.status === 'fulfilled' && workPlanRes.value.data ? workPlanRes.value.data.paras : undefined,
      },
      {
        id: 'management',
        name: '管理制度确认',
        status: calculateTaskStatus(managementRes),
        apiUrl: '/api/web/getAllManagement',
        token: '6bbdf0bf97117c1bac495072c961e778',
        count: (managementRes.status === 'fulfilled' && managementRes.value.data?.count) || 0,
        paras: managementRes.status === 'fulfilled' && managementRes.value.data ? managementRes.value.data.paras : undefined,
      },
      {
        id: 'sealManagement',
        name: '印章确认',
        status: calculateTaskStatus(sealManagementRes),
        apiUrl: '/api/web/getSealManagement',
        token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
        count: (sealManagementRes.status === 'fulfilled' && sealManagementRes.value.data?.count) || 0,
        paras: sealManagementRes.status === 'fulfilled' && sealManagementRes.value.data ? sealManagementRes.value.data.paras : undefined,
      },
      {
        id: 'legalProcedure',
        name: '法律程序确认',
        status: calculateTaskStatus(legalProcedureRes),
        apiUrl: '/api/web/getAllLegalProcedure',
        token: 'a81a3a18b6d52abb4b6c38132e1198da',
        count: (legalProcedureRes.status === 'fulfilled' && legalProcedureRes.value.data?.count) || 0,
        paras: legalProcedureRes.status === 'fulfilled' && legalProcedureRes.value.data ? legalProcedureRes.value.data.paras : undefined,
      },
    ];

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
            <template v-if="task.count === 0">
              <ElButton
                type="primary"
                size="small"
                @click="handleAddWorkTeam"
                v-if="task.id === 'workTeam'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleAddWorkPlan"
                v-if="task.id === 'workPlan'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleAddManagement"
                v-if="task.id === 'management'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleAddSealManagement"
                v-if="task.id === 'sealManagement'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleAddLegalProcedure"
                v-if="task.id === 'legalProcedure'"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleSkipTask(task.id)"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>
            </template>

            <template v-else>
              <ElButton
                type="info"
                size="small"
                @click="handleViewWorkTeam"
                v-if="task.id === 'workTeam'"
              >
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleEditWorkTeam"
                v-if="task.id === 'workTeam'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleCompleteTask(task.id)"
                v-if="task.id === 'workTeam'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>

              <ElButton
                type="info"
                size="small"
                @click="handleViewWorkPlan"
                v-if="task.id === 'workPlan'"
              >
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleEditWorkPlan"
                v-if="task.id === 'workPlan'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleCompleteTask(task.id)"
                v-if="task.id === 'workPlan' && task.status !== '完成'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>

              <ElButton
                type="danger"
                size="small"
                @click="handleSkipTask(task.id)"
                v-if="task.id === 'workPlan' && task.status === '完成'"
              >
                <Icon icon="lucide:undo" class="mr-1" />
                撤回
              </ElButton>

              <ElButton
                type="info"
                size="small"
                @click="handleViewManagement"
                v-if="task.id === 'management'"
              >
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleEditManagement"
                v-if="task.id === 'management'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleCompleteTask(task.id)"
                v-if="task.id === 'management'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleSkipTask(task.id)"
                v-if="task.id === 'management'"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>

              <ElButton
                type="info"
                size="small"
                @click="handleViewSealManagement"
                v-if="task.id === 'sealManagement'"
              >
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleEditSealManagement"
                v-if="task.id === 'sealManagement'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleCompleteTask(task.id)"
                v-if="task.id === 'sealManagement'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleSkipTask(task.id)"
                v-if="task.id === 'sealManagement'"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>

              <ElButton
                type="info"
                size="small"
                @click="handleViewLegalProcedure"
                v-if="task.id === 'legalProcedure'"
              >
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton
                type="primary"
                size="small"
                @click="handleEditLegalProcedure"
                v-if="task.id === 'legalProcedure'"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleCompleteTask(task.id)"
                v-if="task.id === 'legalProcedure'"
              >
                <Icon icon="lucide:check" class="mr-1" />
                完成
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleSkipTask(task.id)"
                v-if="task.id === 'legalProcedure'"
              >
                <Icon icon="lucide:skip-forward" class="mr-1" />
                跳过
              </ElButton>
            </template>
          </div>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.stage-one-process {
  margin: 0;
  padding: 0;
  border-radius: 8px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.stage-progress {
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #666;
}

.tasks-container {
  margin-top: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-completed {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.status-skipped {
  background-color: #fffbeb;
  border-color: #fde68a;
}

.status-pending {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.task-info {
  margin-bottom: 12px;
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-name {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
}

.task-count {
  font-size: 13px;
  color: #6b7280;
  margin-left: 8px;
  background-color: #e5e7eb;
  padding: 2px 8px;
  border-radius: 12px;
}

.task-status {
  display: flex;
  align-items: center;
}

.task-description {
  font-size: 14px;
  color: #6b7280;
}

.task-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
