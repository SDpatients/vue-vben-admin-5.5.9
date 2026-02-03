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
    name: '一、破产申请与受理',
    description:
      '本阶段是破产程序的启动阶段，主要包括：1. 申请人向法院提交破产申请书及相关证据材料；2. 法院进行立案形式审查，确认申请材料是否齐全、申请人是否具备主体资格等；3. 法院对债务人是否具备破产原因进行实质审查；4. 法院同步选任管理人，负责后续破产程序的推进；5. 法院裁定受理破产申请并发布公告，通知相关各方。',
    progressValue: 'FIRST',
  },
  {
    id: 2,
    name: '二、接管与调查',
    description:
      '本阶段是管理人全面介入的关键阶段，主要包括：1. 管理人全面接管债务人的财产、印章、账簿、文书等资料，确保破产程序的顺利进行；2. 管理人对债务人的财产状况、经营状况等进行深入调查，编制财产状况报告和经营状况报告；3. 管理人根据实际情况决定债务人未履行完毕合同的继续履行或解除；4. 管理人积极追收债务人的财产，包括到期债权、出资人未缴出资、抽逃出资等，最大限度保护债权人利益。',
    progressValue: 'SECOND',
  },
  {
    id: 3,
    name: '三、债权申报与核查',
    description:
      '本阶段是保障债权人合法权益的重要环节，主要包括：1. 管理人通知已知债权人申报债权，并在指定媒体发布债权申报公告，明确申报期限、地点、方式等信息；2. 管理人接收债权人的债权申报材料并进行登记，确保申报信息的准确完整；3. 管理人对申报的债权进行审查，核实债权的真实性、合法性和有效性，并编制债权表，为后续的债权核查和清偿做准备。',
    progressValue: 'THIRD',
  },
  {
    id: 4,
    name: '四、债权人会议',
    description:
      '本阶段是债权人行使权利、参与破产程序的重要平台，主要包括：1. 管理人筹备第一次债权人会议，准备会议议程、会议材料等；2. 召开债权人会议，核查债权并议决相关事项，确保债权人充分了解破产案件情况；3. 债权人会议表决通过财产变价方案和分配方案，为后续的财产处置和分配奠定基础。',
    progressValue: 'FOURTH',
  },
  {
    id: 5,
    name: '五、破产宣告',
    description:
      '本阶段是破产程序的重要转折点，主要包括：1. 法院审查债务人是否符合宣告破产的条件，即债务人是否存在不能清偿到期债务且资产不足以清偿全部债务，或明显缺乏清偿能力的情形，且无法达成和解或重整协议；2. 法院裁定宣告债务人破产，并发布破产宣告公告，正式启动破产清算程序。',
    progressValue: 'FIFTH',
  },
  {
    id: 6,
    name: '六、财产变价与分配',
    description:
      '本阶段是实现债权人利益的核心阶段，主要包括：1. 管理人拟定财产变价方案，经债权人会议表决通过后执行，通过拍卖、变卖等方式将债务人财产转化为货币形式；2. 管理人审核确认破产费用和共益债务，确保破产程序的顺利进行；3. 管理人执行破产财产分配方案，按照法定顺序对债权人进行清偿，最大限度实现债权人的合法权益。',
    progressValue: 'SIXTH',
  },
  {
    id: 7,
    name: '七、程序终结与注销',
    description:
      '本阶段是破产程序的收尾阶段，主要包括：1. 管理人提请法院终结破产程序，提交破产财产分配报告和管理人工作报告；2. 法院裁定终结破产程序并公告，标志着破产程序的正式结束；3. 管理人办理债务人企业注销登记，完成企业法人资格的终止；4. 管理人终止执行职务并将相关资料归档，确保破产案件的完整记录。',
    progressValue: 'SEVENTH',
  },
]);

// 当前选择的阶段ID
const selectedStageId = ref(2); // 默认阶段二
const loading = ref(false);

// 当前选择的阶段信息
const currentStage = computed(() => {
  return progressStages.value.find(stage => stage.id === selectedStageId.value) || progressStages.value[0];
});

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
    width="700px"
    :close-on-click-modal="false"
    class="progress-management-dialog"
  >
    <div class="progress-content">
      <div class="current-stage-section">
        <div class="stage-header">
          <Icon icon="lucide:layers" class="stage-icon" />
          <span class="stage-label">选择案件阶段</span>
        </div>

        <!-- 当前阶段详细描述 -->
        <div class="stage-description-section" v-if="currentStage">
          <div class="stage-name">{{ currentStage.name }}</div>
          <div class="stage-description">{{ currentStage.description }}</div>
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
  padding: 0;
}

.current-stage-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 0;
  color: #343a40;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 进度跳转样式 */
.progress-jump-section {
  margin-top: 24px;
}

.stage-selector {
  width: 100%;
}

:deep(.stage-selector .el-select__input) {
  color: #343a40;
}

:deep(.stage-selector .el-select__caret) {
  color: #6c757d;
}

:deep(.stage-selector .el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #ced4da;
  color: #343a40;
  transition: all 0.3s ease;
}

:deep(.stage-selector .el-input__wrapper:hover) {
  border-color: #adb5bd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.stage-selector .el-input__wrapper.is-focus) {
  border-color: #495057;
  box-shadow: 0 0 0 2px rgba(73, 80, 87, 0.1);
}

:deep(.stage-selector .el-select-dropdown) {
  background: white;
  color: #343a40;
  max-height: 400px;
  max-width: 650px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.stage-selector .el-select-dropdown__wrap) {
  max-height: 380px;
}

:deep(.stage-selector .el-option) {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.2s ease;
}

:deep(.stage-selector .el-option:hover) {
  background-color: #f8f9fa;
}

:deep(.stage-selector .el-option:last-child) {
  border-bottom: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-title {
  font-weight: 600;
  font-size: 14px;
  color: #343a40;
}

.option-description {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.5;
  max-width: 600px;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.progress-management-dialog .el-button) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.progress-management-dialog .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.progress-management-dialog .el-button--primary) {
  background-color: #495057;
  border-color: #495057;
}

:deep(.progress-management-dialog .el-button--primary:hover) {
  background-color: #343a40;
  border-color: #343a40;
}

.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.stage-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #495057;
}

.stage-label {
  font-size: 16px;
  font-weight: 600;
  color: #343a40;
  opacity: 1;
}

.stage-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #343a40;
  margin-bottom: 8px;
}

.stage-description-section {
  margin: 16px 0;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border-left: 4px solid #495057;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stage-description-section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stage-description {
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
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
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

:deep(.progress-management-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.progress-management-dialog .el-dialog__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 24px;
}

:deep(.progress-management-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
}
</style>
