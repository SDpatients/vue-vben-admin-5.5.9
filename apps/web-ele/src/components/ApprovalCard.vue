<script setup lang="ts">
import { approvalApi, type Approval } from '#/api/core/approval';
import { Icon } from '@iconify/vue';
import { ElButton, ElTag, ElCard, ElMessage, ElMessageBox, ElInput } from 'element-plus';

interface Props {
  approval: Approval;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

const emit = defineEmits(['refresh']);

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

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确认通过该审核申请吗？', '确认通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    await approvalApi.approve(props.approval.id, '审核通过');
    ElMessage.success('审核通过');
    emit('refresh');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const handleReject = async () => {
  try {
    const { value: opinion } = await ElMessageBox.prompt('请输入驳回原因', '确认驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回原因不能为空',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回原因',
    });
    await approvalApi.reject(props.approval.id, opinion);
    ElMessage.success('已驳回');
    emit('refresh');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
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
    CASE: '案件审核',
    DOCUMENT: '文书审核',
    INFO: '信息审核',
  };
  return textMap[type] || type;
};
</script>

<template>
  <ElCard shadow="hover" class="approval-card">
    <div class="approval-header">
      <div class="approval-title">{{ approval.title }}</div>
      <ElTag :type="getStatusColor(approval.status)" size="small">
        {{ getStatusText(approval.status) }}
      </ElTag>
    </div>
    <div class="approval-body">
      <div class="approval-info">
        <div class="info-row">
          <span class="label">审核编号:</span>
          <span class="value">{{ approval.approvalNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">审核类型:</span>
          <span class="value">{{ getTypeText(approval.type) }}</span>
        </div>
        <div class="info-row">
          <span class="label">申请人:</span>
          <span class="value">{{ approval.applicantName }}</span>
        </div>
        <div v-if="approval.approverName" class="info-row">
          <span class="label">审核人:</span>
          <span class="value">{{ approval.approverName }}</span>
        </div>
        <div class="info-row">
          <span class="label">申请时间:</span>
          <span class="value">{{ formatTime(approval.applyTime) }}</span>
        </div>
        <div v-if="approval.approveTime" class="info-row">
          <span class="label">审核时间:</span>
          <span class="value">{{ formatTime(approval.approveTime) }}</span>
        </div>
        <div v-if="approval.description" class="info-row">
          <span class="label">描述:</span>
          <span class="value">{{ approval.description }}</span>
        </div>
      </div>
    </div>
    <div v-if="!readonly && approval.status === 'PENDING'" class="approval-actions">
      <ElButton type="primary" size="small" @click="handleApprove">
        <Icon icon="lucide:check" :size="14" class="mr-1" />
        通过
      </ElButton>
      <ElButton type="danger" size="small" @click="handleReject">
        <Icon icon="lucide:x" :size="14" class="mr-1" />
        驳回
      </ElButton>
    </div>
  </ElCard>
</template>

<style scoped>
.approval-card {
  margin-bottom: 16px;
  transition: all 0.3s;
}

.approval-card:hover {
  transform: translateY(-2px);
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.approval-title {
  font-weight: 500;
  font-size: 15px;
  color: #303133;
}

.approval-body {
  margin-bottom: 16px;
}

.approval-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  font-size: 13px;
  line-height: 1.5;
}

.info-row .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #606266;
  flex: 1;
  word-break: break-all;
}

.approval-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.mr-1 {
  margin-right: 4px;
}
</style>
