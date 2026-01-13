<script setup lang="ts">
import type { CaseApi } from '#/api/core/case';

import { ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { approveCaseApi, getReviewLogsApi, rejectCaseApi } from '#/api/core/case';

interface Props {
  visible: boolean;
  caseData?: CaseApi.CaseInfo;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = ref(false);
const reviewLogs = ref<CaseApi.CaseReviewLog[]>([]);
const form = ref({
  opinion: '',
  action: 'approve',
});
const loading = ref(false);

watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.caseData) {
      loadReviewLogs();
    }
  },
);

watch(visible, (newVal) => {
  emit('update:visible', newVal);
});

const loadReviewLogs = async () => {
  if (!props.caseData?.案件单据号) return;

  try {
<<<<<<< Updated upstream
    const response = await getReviewLogsApi(props.caseData.案件单据号);
    if (response.status === '1') {
      reviewLogs.value = response.data || [];
    } else {
      reviewLogs.value = [];
    }
=======
    const response = await getReviewLogsApi(props.caseData.id);
    reviewLogs.value =
      response.code === 200 && response.data ? response.data || [] : [];
>>>>>>> Stashed changes
  } catch (error) {
    console.error('加载审核日志失败', error);
    reviewLogs.value = [];
  }
};

const handleApprove = async () => {
  if (!form.value.opinion) {
    ElMessage.warning('请输入审核意见');
    return;
  }

  loading.value = true;
  try {
    const response = await approveCaseApi(props.caseData?.案件单据号 || 0, form.value.opinion);
    if (response.status === '1') {
      ElMessage.success('审核通过');
      visible.value = false;
      emit('success');
    } else {
      ElMessage.error(response.error || '审核失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '审核失败');
  } finally {
    loading.value = false;
  }
};

const handleReject = async () => {
  if (!form.value.opinion) {
    ElMessage.warning('请输入审核意见');
    return;
  }

  loading.value = true;
  try {
    const response = await rejectCaseApi(props.caseData?.案件单据号 || 0, form.value.opinion);
    if (response.status === '1') {
      ElMessage.success('案件已驳回');
      visible.value = false;
      emit('success');
    } else {
      ElMessage.error(response.error || '驳回失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '驳回失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  form.value.opinion = '';
  form.value.action = 'approve';
};

const getLogColor = (action: string) => {
  const colorMap: Record<string, string> = {
    APPROVE: '#67c23a',
    REJECT: '#f56c6c',
  };
  return colorMap[action] || '#409eff';
};

const getActionColor = (action: string) => {
  const colorMap: Record<string, string> = {
    APPROVE: 'success',
    REJECT: 'danger',
  };
  return colorMap[action] || 'info';
};

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    APPROVE: '通过',
    REJECT: '驳回',
  };
  return textMap[action] || action;
};

const formatTime = (time: string) => {
  if (!time) return '';
  return new Date(time).toLocaleString('zh-CN');
};
</script>

<template>
  <ElDialog
    v-model="visible"
    title="案件审核"
    width="600px"
    @close="handleCancel"
  >
    <div class="review-modal">
      <ElCard class="mb-4">
        <div class="case-info">
          <div class="info-item">
            <span class="label">案件名称：</span>
            <span class="value">{{ caseData?.案号 }}</span>
          </div>
          <div class="info-item">
            <span class="label">案号：</span>
            <span class="value">{{ caseData?.案号 }}</span>
          </div>
        </div>
      </ElCard>

      <ElCard class="mb-4">
        <template #header>
          <div class="card-header">
            <span>审核历史</span>
          </div>
        </template>
        <div class="review-history">
          <ElTimeline v-if="reviewLogs.length > 0">
            <ElTimelineItem
              v-for="log in reviewLogs"
              :key="log.logId"
              :color="getLogColor(log.action)"
            >
              <div class="log-item">
                <div class="log-header">
                  <span class="reviewer">{{ log.reviewerName }}</span>
                  <ElTag :type="getActionColor(log.action)" size="small">
                    {{ getActionText(log.action) }}
                  </ElTag>
                  <span class="time">{{ formatTime(log.operateTime) }}</span>
                </div>
                <div v-if="log.opinion" class="log-opinion">
                  {{ log.opinion }}
                </div>
              </div>
            </ElTimelineItem>
          </ElTimeline>
          <ElEmpty v-else description="暂无审核记录" />
        </div>
      </ElCard>

      <ElCard>
        <template #header>
          <div class="card-header">
            <span>审核操作</span>
          </div>
        </template>
        <div class="review-actions">
          <div class="form-item">
            <label class="form-label">审核意见：</label>
            <textarea
              v-model="form.opinion"
              class="form-textarea"
              placeholder="请输入审核意见"
              rows="4"
            ></textarea>
          </div>
          <div class="action-buttons">
            <ElButton type="success" :loading="loading" @click="handleApprove">
              <i class="i-lucide-check mr-1"></i>
              审核通过
            </ElButton>
            <ElButton type="danger" :loading="loading" @click="handleReject">
              <i class="i-lucide-x mr-1"></i>
              驳回
            </ElButton>
            <ElButton @click="handleCancel"> 取消 </ElButton>
          </div>
        </div>
      </ElCard>
    </div>
  </ElDialog>
</template>

<style scoped>
.review-modal {
  .case-info {
    .info-item {
      display: flex;
      margin-bottom: 12px;

      .label {
        width: 80px;
        color: #999;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: #333;
      }
    }
  }

  .review-history {
    .log-item {
      .log-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .reviewer {
          font-weight: 500;
          color: #409eff;
        }

        .time {
          margin-left: auto;
          font-size: 12px;
          color: #999;
        }
      }

      .log-opinion {
        padding: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        font-size: 13px;
        color: #666;
      }
    }
  }

  .review-actions {
    .form-item {
      margin-bottom: 16px;

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .form-textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 14px;
        line-height: 1.5;
        color: #606266;
        background-color: #fff;
        background-image: none;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        resize: vertical;
      }

      .form-textarea:focus {
        outline: none;
        border-color: #409eff;
      }
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}

.card-header {
  font-weight: 600;
  color: #333;
}
</style>
