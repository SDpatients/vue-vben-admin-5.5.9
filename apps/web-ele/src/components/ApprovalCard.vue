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
    // 根据API要求，传递正确的参数格式
    await approvalApi.approve(props.approval.id, {
      approvalResult: 'PASS',
      approvalOpinion: '审核通过',
      approverId: Number(localStorage.getItem('user_id') || '0')
    });
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
    // 由于API中没有reject方法，我们可以使用approve方法，将approvalResult设置为REJECT
    await approvalApi.approve(props.approval.id, {
      approvalResult: 'REJECT',
      approvalOpinion: opinion,
      approverId: Number(localStorage.getItem('user_id') || '0')
    });
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
    CASE_SUBMIT: '案件提交审核',
    TASK_002: '流程审批',
  };
  return textMap[type] || type;
};
</script>

<template>
  <ElCard shadow="hover" class="approval-card">
    <div class="approval-header">
      <div class="approval-title">{{ approval.approvalTitle || approval.caseTitle || '审核申请' }}</div>
      <ElTag :type="getStatusColor(approval.approvalStatus || approval.status)" size="small">
        {{ getStatusText(approval.approvalStatus || approval.status) }}
      </ElTag>
    </div>
    <div class="approval-body">
      <div class="approval-info">
        <div class="info-row">
          <span class="label">案号:</span>
          <span class="value">{{ approval.caseNumber }}</span>
        </div>
        <div class="info-row">
          <span class="label">审核类型:</span>
          <span class="value">{{ getTypeText(approval.approvalType) }}</span>
        </div>
        <div class="info-row">
          <span class="label">提交时间:</span>
          <span class="value">{{ formatTime(approval.createTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">提交人:</span>
          <span class="value">{{ approval.submitter || approval.createUserName || '系统' }}</span>
        </div>
        <div v-if="approval.approvalDate" class="info-row">
          <span class="label">审核时间:</span>
          <span class="value">{{ formatTime(approval.approvalDate) }}</span>
        </div>
        <div v-if="approval.approvalContent" class="info-row">
          <span class="label">审核内容:</span>
          <span class="value">{{ approval.approvalContent }}</span>
        </div>
        <div v-if="approval.remark" class="info-row">
          <span class="label">备注:</span>
          <span class="value">{{ approval.remark }}</span>
        </div>
      </div>
    </div>
    <div v-if="!readonly && (approval.approvalStatus || approval.status) === 'PENDING'" class="approval-actions">
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.approval-title {
  font-size: 15px;
  font-weight: 500;
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
  flex-shrink: 0;
  width: 80px;
  color: #909399;
}

.info-row .value {
  flex: 1;
  color: #606266;
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
