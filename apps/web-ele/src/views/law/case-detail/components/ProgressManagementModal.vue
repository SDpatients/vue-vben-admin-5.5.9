<script setup lang="ts">
import { computed, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDialog,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

interface StageOption {
  id: number;
  name: string;
  description: string;
  progressValue: string; // 对应API的进度值，如FIRST、SECOND等
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

// 所有进度阶段选项，包含API所需的进度值
const progressStages = ref<StageOption[]>([
  {
    id: 1,
    name: '一、申请与受理',
    description:
      '包括提交破产申请材料、法院立案审查、破产原因实质审查、同步选任管理人和裁定受理并公告',
    progressValue: 'FIRST',
  },
  {
    id: 2,
    name: '二、管理人履职与财产接管',
    description:
      '包括全面接管债务人、调查财产及经营状况、决定合同继续履行或解除、追收债务人财产',
    progressValue: 'SECOND',
  },
  {
    id: 3,
    name: '三、债权申报与核查',
    description:
      '包括通知已知债权人并公告、接收登记债权申报、审查申报债权并编制债权表',
    progressValue: 'THIRD',
  },
  {
    id: 4,
    name: '四、债权人会议',
    description:
      '包括筹备第一次债权人会议、召开会议核查债权与议决事项、表决通过财产变价/分配方案',
    progressValue: 'FOURTH',
  },
  {
    id: 5,
    name: '五、破产宣告',
    description: '包括审查宣告破产条件、裁定宣告债务人破产',
    progressValue: 'FIFTH',
  },
  {
    id: 6,
    name: '六、财产变价与分配',
    description: '包括拟定并执行财产变价方案、执行破产财产分配',
    progressValue: 'SIXTH',
  },
  {
    id: 7,
    name: '七、程序终结',
    description:
      '包括提请终结破产程序、法院裁定并公告、办理企业注销登记、管理人终止执行职务并归档',
    progressValue: 'SEVENTH',
  },
]);

// 当前选择的阶段ID
const selectedStageId = ref(2); // 默认阶段二
const loading = ref(false);

// 自定义API请求函数，使用正确的端点和参数格式
const updateCaseProgressApi = async (
  caseId: number | string,
  progressValue: string,
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/case/${caseId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ caseProgress: progressValue }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 更新案件进度
const updateProgress = async () => {
  if (!props.caseId) {
    ElMessage.error('案件ID不能为空');
    return;
  }

  loading.value = true;
  try {
    // 获取当前选择的阶段
    const selectedStage = progressStages.value.find(
      (stage) => stage.id === selectedStageId.value,
    );

    if (!selectedStage) {
      ElMessage.error('无效的阶段选择');
      return;
    }

    // 调用API更新进度，传入合法的案件进度值
    await updateCaseProgressApi(props.caseId, selectedStage.progressValue);

    ElMessage.success('案件进度更新成功');
    emit('progress-updated', selectedStageId.value);
    closeDialog();
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
    width="500px"
    :close-on-click-modal="false"
    class="progress-management-dialog"
  >
    <div class="progress-content">
      <div class="current-stage-section">
        <div class="stage-header">
          <Icon icon="lucide:layers" class="stage-icon" />
          <span class="stage-label">选择案件阶段</span>
        </div>

        <!-- 进度跳转选择器 -->
        <div class="progress-jump-section">
          <ElSelect
            v-model="selectedStageId"
            placeholder="选择案件进度阶段"
            class="stage-selector"
            size="large"
            style="width: 100%; margin-top: 16px"
          >
            <ElOption
              v-for="stage in progressStages"
              :key="stage.id"
              :label="stage.name"
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="updateProgress" type="primary" :loading="loading">
          <Icon icon="lucide:arrow-right" class="mr-1" />
          更新进度
        </ElButton>
        <ElButton @click="closeDialog">
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
}

.stage-selector {
  width: 100%;
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
</style>
