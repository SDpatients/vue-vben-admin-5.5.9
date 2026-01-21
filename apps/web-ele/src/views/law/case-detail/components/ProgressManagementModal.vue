<script setup lang="ts">
import { computed, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDialog,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

interface TaskItem {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface ProgressData {
  currentStage: string;
  tasks: TaskItem[];
}

interface StageOption {
  id: number;
  name: string;
  description: string;
}

const props = defineProps<{
  caseId?: number | string;
  visible: boolean;
}>();

const emit = defineEmits<{
  'progress-updated': [stageId: number];
  'update:visible': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// 所有进度阶段选项
const progressStages = ref<StageOption[]>([
  {
    id: 1,
    name: '阶段一',
    description: '法院指定管理人至管理人接管破产企业前的工作',
  },
  {
    id: 2,
    name: '阶段二',
    description: '管理人接管破产企业至调查审查破产企业前的工作',
  },
  {
    id: 3,
    name: '阶段三',
    description: '管理人调查审查破产企业至第一次债权人会议前工作',
  },
  {
    id: 4,
    name: '阶段四',
    description: '第一次债权人会议至第二次债权人会议前工作',
  },
  {
    id: 5,
    name: '阶段五',
    description: '第二次债权人会议至破产程序终结工作',
  },
  {
    id: 6,
    name: '阶段六',
    description: '破产财产分配方案等相关工作',
  },
  {
    id: 7,
    name: '阶段七',
    description: '债权人会议决议等相关工作',
  },
]);

// 当前选择的阶段ID
const selectedStageId = ref(2); // 默认阶段二
const loading = ref(false);

const progressData = ref<ProgressData>({
  currentStage: '阶段二：管理人接管破产企业至调查审查破产企业前的工作',
  tasks: [
    {
      id: 1,
      name: '接管破产企业资产',
      description:
        '完成对破产企业所有资产的清点和接管工作，包括固定资产、流动资产、知识产权等',
      status: 'completed',
    },
    {
      id: 2,
      name: '审查破产企业财务状况',
      description:
        '对破产企业的财务报表、账簿、凭证进行全面审查，核实资产负债情况',
      status: 'in_progress',
    },
    {
      id: 3,
      name: '调查破产企业债权债务',
      description: '调查并核实破产企业的债权债务关系，编制债权债务清单',
      status: 'pending',
    },
    {
      id: 4,
      name: '制定财产管理方案',
      description: '根据调查结果，制定破产财产的管理、变价和分配方案',
      status: 'pending',
    },
    {
      id: 5,
      name: '准备债权人会议材料',
      description: '整理并准备第一次债权人会议所需的相关材料和报告',
      status: 'pending',
    },
  ],
});

const getStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
  };
  return statusMap[status] || 'info';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
  };
  return statusMap[status] || '未知';
};

const getStatusIcon = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'lucide:circle',
    in_progress: 'lucide:clock',
    completed: 'lucide:check-circle',
  };
  return statusMap[status] || 'lucide:circle';
};

// 模拟API调用 - 实际项目中应替换为真实API
const updateCaseProgressApi = async (
  caseId: number | string,
  progressStatus: number,
) => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 模拟API响应
  return {
    success: true,
    data: {
      caseId,
      progressStatus,
      updatedAt: new Date().toISOString(),
    },
  };
};

// 更新案件进度
const updateProgress = async () => {
  if (!props.caseId) {
    ElMessage.error('案件ID不能为空');
    return;
  }

  loading.value = true;
  try {
    const response = await updateCaseProgressApi(
      props.caseId,
      selectedStageId.value,
    );
    if (response.success) {
      // 更新当前阶段显示
      const selectedStage = progressStages.value.find(
        (stage) => stage.id === selectedStageId.value,
      );
      if (selectedStage) {
        progressData.value.currentStage = `${selectedStage.name}：${selectedStage.description}`;
      }

      ElMessage.success('案件进度更新成功');
      emit('progress-updated', selectedStageId.value);
    } else {
      ElMessage.error('案件进度更新失败');
    }
  } catch (error) {
    console.error('更新案件进度失败:', error);
    ElMessage.error('案件进度更新失败');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    title="进度管理"
    width="700px"
    :close-on-click-modal="false"
    class="progress-management-dialog"
  >
    <div class="progress-content">
      <div class="current-stage-section">
        <div class="stage-header">
          <Icon icon="lucide:layers" class="stage-icon" />
          <span class="stage-label">当前阶段</span>
        </div>
        <div class="stage-name">{{ progressData.currentStage }}</div>

        <!-- 进度跳转选择器 -->
        <div class="progress-jump-section">
          <div class="jump-label">跳转至:</div>
          <ElSelect
            v-model="selectedStageId"
            placeholder="选择新的进度阶段"
            class="stage-selector"
            size="large"
          >
            <ElOption
              v-for="stage in progressStages"
              :key="stage.id"
              :label="`${stage.name} - ${stage.description}`"
              :value="stage.id"
            >
              <div class="option-content">
                <div class="option-title">{{ stage.name }}</div>
                <div class="option-description">{{ stage.description }}</div>
              </div>
            </ElOption>
          </ElSelect>
        </div>
      </div>

      <div class="tasks-section">
        <div class="tasks-header">
          <Icon icon="lucide:list-todo" class="tasks-icon" />
          <span class="tasks-label">流程任务列表</span>
        </div>
        <ElTimeline class="tasks-timeline">
          <ElTimelineItem
            v-for="task in progressData.tasks"
            :key="task.id"
            :icon="getStatusIcon(task.status)"
            :type="getStatusType(task.status)"
            placement="top"
            class="task-item"
          >
            <div class="task-content">
              <div class="task-header">
                <span class="task-name">{{ task.name }}</span>
                <ElTag :type="getStatusType(task.status)" size="small">
                  {{ getStatusText(task.status) }}
                </ElTag>
              </div>
              <div class="task-description">{{ task.description }}</div>
            </div>
          </ElTimelineItem>
        </ElTimeline>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="updateProgress" type="success" :loading="loading">
          <Icon icon="lucide:arrow-right" class="mr-1" />
          更新进度
        </ElButton>
        <ElButton @click="closeDialog" type="primary">
          <Icon icon="lucide:x" class="mr-1" />
          关闭
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.progress-content {
  padding: 10px 0;
}

.current-stage-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
}

/* 进度跳转样式 */
.progress-jump-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
}

.jump-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  min-width: 60px;
}

.stage-selector {
  flex: 1;
  min-width: 200px;
}

:deep(.stage-selector .el-select__input) {
  color: white;
}

:deep(.stage-selector .el-select__caret) {
  color: white;
}

:deep(.stage-selector .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

:deep(.stage-selector .el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.5);
}

:deep(.stage-selector .el-input__wrapper.is-focus) {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

:deep(.stage-selector .el-select-dropdown) {
  background: white;
  color: #2c3e50;
}

:deep(.stage-selector .el-option) {
  padding: 12px 16px;
}

.option-content {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.option-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.stage-icon {
  font-size: 20px;
  margin-right: 8px;
}

.stage-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.stage-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.tasks-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.tasks-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.tasks-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #667eea;
}

.tasks-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.tasks-timeline {
  padding-left: 10px;
}

.task-item {
  margin-bottom: 24px;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-content {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.task-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
}

:deep(.progress-management-dialog .el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

:deep(.progress-management-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.progress-management-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.progress-management-dialog .el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
}

:deep(.progress-management-dialog .el-timeline-item__timestamp) {
  display: none;
}

:deep(.progress-management-dialog .el-timeline-item__icon) {
  font-size: 16px;
}

@media (max-width: 768px) {
  .progress-management-dialog {
    width: 90% !important;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stage-name {
    font-size: 16px;
  }
}
</style>
