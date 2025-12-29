<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { approvalApi, type Approval } from '#/api/core/approval';
import ApprovalCard from '#/components/ApprovalCard.vue';
import { Icon } from '@iconify/vue';
import { ElButton, ElTag, ElCard, ElTimeline, ElTimelineItem, ElEmpty, ElMessage, ElMessageBox, ElInput } from 'element-plus';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const approval = ref<Approval | null>(null);
const logs = ref<any[]>([]);

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
    const id = Number(route.params.id);
    const res = await approvalApi.getApprovalDetail(id);
    approval.value = res.data;
  } catch (error) {
    console.error('加载审核详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadApprovalLogs = async () => {
  try {
    const id = Number(route.params.id);
    const res = await approvalApi.getApprovalLogs(id);
    logs.value = res.data || [];
  } catch (error) {
    console.error('加载审核日志失败:', error);
  }
};

const handleApprove = async () => {
  if (!approval.value) return;
  try {
    await ElMessageBox.confirm('确认通过该审核申请吗？', '确认通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    await approvalApi.approve(approval.value.id, '审核通过');
    ElMessage.success('审核通过');
    loadApprovalDetail();
    loadApprovalLogs();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const handleReject = async () => {
  if (!approval.value) return;
  try {
    const { value: opinion } = await ElMessageBox.prompt('请输入驳回原因', '确认驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回原因不能为空',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回原因',
    });
    await approvalApi.reject(approval.value.id, opinion);
    ElMessage.success('已驳回');
    loadApprovalDetail();
    loadApprovalLogs();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const handleCancel = async () => {
  if (!approval.value) return;
  try {
    await ElMessageBox.confirm('确认取消该审核申请吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await approvalApi.cancel(approval.value.id);
    ElMessage.success('已取消');
    loadApprovalDetail();
    loadApprovalLogs();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
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
    CASE: '案件审核',
    DOCUMENT: '文书审核',
    INFO: '信息审核',
  };
  return textMap[type] || type;
};

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    SUBMIT: '提交审核',
    APPROVE: '审核通过',
    REJECT: '审核驳回',
    CANCEL: '取消审核',
  };
  return textMap[action] || action;
};

const getActionColor = (action: string) => {
  const colorMap: Record<string, string> = {
    SUBMIT: '#1890ff',
    APPROVE: '#52c41a',
    REJECT: '#ff4d4f',
    CANCEL: '#999',
  };
  return colorMap[action] || '#999';
};

onMounted(() => {
  loadApprovalDetail();
  loadApprovalLogs();
});
</script>

<template>
  <div class="approval-detail-page">
    <div class="page-header">
      <ElButton :icon="Icon({ icon: 'lucide:arrow-left' })" @click="goBack">
        返回
      </ElButton>
      <h2>审核详情</h2>
      <div class="header-actions">
        <ElButton
          v-if="approval && approval.status === 'PENDING'"
          type="primary"
          @click="handleApprove"
        >
          <Icon icon="lucide:check" :size="16" class="mr-1" />
          通过
        </ElButton>
        <ElButton
          v-if="approval && approval.status === 'PENDING'"
          type="danger"
          @click="handleReject"
        >
          <Icon icon="lucide:x" :size="16" class="mr-1" />
          驳回
        </ElButton>
        <ElButton
          v-if="approval && approval.status === 'PENDING'"
          @click="handleCancel"
        >
          <Icon icon="lucide:x-circle" :size="16" class="mr-1" />
          取消
        </ElButton>
      </div>
    </div>

    <div class="page-content">
      <div v-loading="loading" class="content-wrapper">
        <ElEmpty v-if="!approval && !loading" description="审核不存在" />

        <div v-if="approval" class="detail-sections">
          <ElCard shadow="hover" class="detail-card">
            <template #header>
              <div class="card-header">
                <span>审核信息</span>
                <ElTag :type="getStatusColor(approval.status)" size="small">
                  {{ getStatusText(approval.status) }}
                </ElTag>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">审核编号:</span>
                <span class="value">{{ approval.approvalNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">审核类型:</span>
                <span class="value">{{ getTypeText(approval.type) }}</span>
              </div>
              <div class="info-item">
                <span class="label">标题:</span>
                <span class="value">{{ approval.title }}</span>
              </div>
              <div class="info-item">
                <span class="label">申请人:</span>
                <span class="value">{{ approval.applicantName }}</span>
              </div>
              <div v-if="approval.approverName" class="info-item">
                <span class="label">审核人:</span>
                <span class="value">{{ approval.approverName }}</span>
              </div>
              <div class="info-item">
                <span class="label">申请时间:</span>
                <span class="value">{{ formatTime(approval.applyTime) }}</span>
              </div>
              <div v-if="approval.approveTime" class="info-item">
                <span class="label">审核时间:</span>
                <span class="value">{{ formatTime(approval.approveTime) }}</span>
              </div>
              <div v-if="approval.description" class="info-item full-width">
                <span class="label">描述:</span>
                <span class="value">{{ approval.description }}</span>
              </div>
              <div v-if="approval.businessData" class="info-item full-width">
                <span class="label">业务数据:</span>
                <pre class="value json-data">{{ approval.businessData }}</pre>
              </div>
            </div>
          </ElCard>

          <ElCard shadow="hover" class="detail-card">
            <template #header>
              <span>审核日志</span>
            </template>
            <ElTimeline>
              <ElTimelineItem
                v-for="log in logs"
                :key="log.id"
                :color="getActionColor(log.action)"
                :timestamp="formatTime(log.operateTime)"
                placement="top"
              >
                <div class="log-item">
                  <div class="log-header">
                    <span class="log-action">{{ getActionText(log.action) }}</span>
                    <span class="log-operator">{{ log.operatorName }}</span>
                  </div>
                  <div v-if="log.opinion" class="log-opinion">
                    意见: {{ log.opinion }}
                  </div>
                  <div v-if="log.remark" class="log-remark">
                    备注: {{ log.remark }}
                  </div>
                </div>
              </ElTimelineItem>
              <ElEmpty v-if="logs.length === 0" description="暂无审核日志" />
            </ElTimeline>
          </ElCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approval-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
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
  justify-content: space-between;
  align-items: center;
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

.info-item .json-data {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.log-item {
  padding: 8px 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-action {
  font-weight: 500;
  font-size: 14px;
}

.log-operator {
  font-size: 12px;
  color: #909399;
}

.log-opinion,
.log-remark {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}

.mr-1 {
  margin-right: 4px;
}
</style>
