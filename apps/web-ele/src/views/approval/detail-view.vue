<script setup lang="ts">
import type { CaseApproval } from '#/api/core/approval';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { approvalApi } from '#/api/core/approval';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const approval = ref<CaseApproval | null>(null);
const approvalHistory = ref<any[]>([]);
const approvalOpinion = ref('');
const approvalDialogVisible = ref(false);
const approvalAction = ref<'approve' | 'reject'>('approve');

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadApprovalDetail = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.approvalId);
    const res = await approvalApi.getApprovalDetail(id);
    approval.value = res.data;
  } catch (error) {
    console.error('加载审批详情失败:', error);
    ElMessage.error('加载审批详情失败');
  } finally {
    loading.value = false;
  }
};

const loadApprovalHistory = async () => {
  try {
    const id = Number(route.params.approvalId);
    const res = await approvalApi.getApprovalHistory(id);
    approvalHistory.value = res.data?.list || [];
  } catch (error) {
    console.error('加载审批历史失败:', error);
  }
};

const handleApproveClick = () => {
  approvalAction.value = 'approve';
  approvalOpinion.value = '';
  approvalDialogVisible.value = true;
};

const handleRejectClick = () => {
  approvalAction.value = 'reject';
  approvalOpinion.value = '';
  approvalDialogVisible.value = true;
};

const handleConfirmApproval = async () => {
  if (!approval.value) return;

  if (approvalAction.value === 'reject' && !approvalOpinion.value.trim()) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  try {
    await approvalApi.approve(approval.value.id, {
      approvalResult: approvalAction.value === 'approve' ? 'PASS' : 'FAIL',
      approvalOpinion: approvalOpinion.value,
      approverId: 1,
    });
    ElMessage.success(
      approvalAction.value === 'approve' ? '审批通过' : '已驳回',
    );
    approvalDialogVisible.value = false;
    await loadApprovalDetail();
    await loadApprovalHistory();
  } catch (error) {
    console.error('审批操作失败:', error);
    ElMessage.error('审批操作失败');
  }
};

const goBack = () => {
  router.back();
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, any> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info',
  };
  return colorMap[status] || 'info';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    CANCELLED: '已取消',
  };
  return textMap[status] || status;
};

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    CASE_SUBMIT: '案件提交',
    CASE_CLOSE: '案件结案',
    FEE_APPLY: '费用申请',
    EVIDENCE_UPLOAD: '证据上传',
  };
  return textMap[type] || type;
};

const getResultText = (result: string) => {
  const textMap: Record<string, string> = {
    PASS: '通过',
    FAIL: '未通过',
  };
  return textMap[result] || result;
};

const getResultColor = (result: string) => {
  const colorMap: Record<string, string> = {
    PASS: 'success',
    FAIL: 'danger',
  };
  return colorMap[result] || 'info';
};

onMounted(() => {
  loadApprovalDetail();
  loadApprovalHistory();
});
</script>

<template>
  <div class="approval-detail-page">
    <div class="page-header">
      <ElButton icon="ArrowLeft" @click="goBack"> 返回 </ElButton>
      <h2>审批详情</h2>
      <div class="header-actions">
        <ElButton
          v-if="approval && approval.approvalStatus === 'PENDING'"
          type="success"
          @click="handleApproveClick"
        >
          通过
        </ElButton>
        <ElButton
          v-if="approval && approval.approvalStatus === 'PENDING'"
          type="danger"
          @click="handleRejectClick"
        >
          驳回
        </ElButton>
      </div>
    </div>

    <div class="page-content">
      <div v-loading="loading" class="content-wrapper">
        <ElEmpty v-if="!approval && !loading" description="审批不存在" />

        <div v-if="approval" class="detail-sections">
          <ElCard shadow="hover" class="detail-card">
            <template #header>
              <div class="card-header">
                <span>审批信息</span>
                <ElTag
                  :type="getStatusColor(approval.approvalStatus)"
                  size="small"
                >
                  {{ getStatusText(approval.approvalStatus) }}
                </ElTag>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">审批ID:</span>
                <span class="value">{{ approval.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">案件编号:</span>
                <span class="value">{{ approval.caseNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">审批类型:</span>
                <span class="value">{{
                  getTypeText(approval.approvalType)
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">审批标题:</span>
                <span class="value">{{ approval.approvalTitle }}</span>
              </div>
              <div class="info-item">
                <span class="label">提交人:</span>
                <span class="value">{{ approval.realName }}</span>
              </div>
              <div class="info-item">
                <span class="label">审批次数:</span>
                <span class="value">{{ approval.approvalCount }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatTime(approval.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">更新时间:</span>
                <span class="value">{{ formatTime(approval.updateTime) }}</span>
              </div>
              <div v-if="approval.approvalDate" class="info-item">
                <span class="label">审批时间:</span>
                <span class="value">{{
                  formatTime(approval.approvalDate)
                }}</span>
              </div>
              <div v-if="approval.approvalResult" class="info-item">
                <span class="label">审批结果:</span>
                <ElTag
                  :type="getResultColor(approval.approvalResult)"
                  size="small"
                >
                  {{ getResultText(approval.approvalResult) }}
                </ElTag>
              </div>
              <div class="info-item full-width">
                <span class="label">审批内容:</span>
                <div class="value content-text">
                  {{ approval.approvalContent }}
                </div>
              </div>
              <div
                v-if="approval.approvalAttachment"
                class="info-item full-width"
              >
                <span class="label">审批附件:</span>
                <div class="value">{{ approval.approvalAttachment }}</div>
              </div>
              <div v-if="approval.remark" class="info-item full-width">
                <span class="label">备注:</span>
                <div class="value">{{ approval.remark }}</div>
              </div>
            </div>
          </ElCard>

          <ElCard shadow="hover" class="detail-card">
            <template #header>
              <span>审批历史</span>
            </template>
            <ElTimeline v-if="approvalHistory.length > 0">
              <ElTimelineItem
                v-for="item in approvalHistory"
                :key="item.id"
                :timestamp="formatTime(item.createTime)"
                placement="top"
              >
                <div class="history-item">
                  <div class="history-header">
                    <span class="history-action">{{
                      getTypeText(item.approvalType)
                    }}</span>
                    <ElTag
                      :type="getStatusColor(item.approvalStatus)"
                      size="small"
                    >
                      {{ getStatusText(item.approvalStatus) }}
                    </ElTag>
                  </div>
                  <div v-if="item.approvalOpinion" class="history-opinion">
                    审批意见: {{ item.approvalOpinion }}
                  </div>
                </div>
              </ElTimelineItem>
            </ElTimeline>
            <ElEmpty v-else description="暂无审批历史" />
          </ElCard>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="approvalDialogVisible"
      :title="approvalAction === 'approve' ? '确认通过' : '确认驳回'"
      width="500px"
    >
      <ElForm label-width="80px">
        <ElFormItem label="审批意见">
          <ElInput
            v-model="approvalOpinion"
            type="textarea"
            :rows="4"
            :placeholder="
              approvalAction === 'reject'
                ? '请输入驳回原因（必填）'
                : '请输入审批意见（选填）'
            "
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="approvalDialogVisible = false">取消</ElButton>
        <ElButton
          :type="approvalAction === 'approve' ? 'success' : 'danger'"
          @click="handleConfirmApproval"
        >
          {{ approvalAction === 'approve' ? '通过' : '驳回' }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.approval-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.page-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.content-wrapper {
  min-height: 400px;
}

.detail-sections {
  display: grid;
  gap: 20px;
}

.detail-card {
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item .label {
  font-size: 13px;
  color: #909399;
}

.info-item .value {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.info-item .content-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.history-action {
  font-size: 14px;
  font-weight: 500;
}

.history-opinion {
  margin-top: 4px;
  font-size: 13px;
  color: #606266;
}
</style>
