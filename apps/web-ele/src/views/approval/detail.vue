<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { approvalApi, type Approval, type Attachment } from '#/api/core/approval';
import ApprovalCard from '#/components/ApprovalCard.vue';
import { Icon } from '@iconify/vue';
import { ElButton, ElTag, ElCard, ElTimeline, ElTimelineItem, ElEmpty, ElMessage, ElMessageBox, ElInput, ElUpload, ElProgress, ElImage, ElDialog } from 'element-plus';
import 'element-plus/es/components/upload/style/css';
import 'element-plus/es/components/progress/style/css';
import 'element-plus/es/components/image/style/css';
import 'element-plus/es/components/dialog/style/css';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const approval = ref<Approval | null>(null);
const logs = ref<any[]>([]);

// 附件相关状态
const attachments = ref<Attachment[]>([]);
const uploadFiles = ref<any[]>([]);
const uploadProgress = ref(0);
const isUploading = ref(false);
const previewImage = ref('');
const previewDialogVisible = ref(false);

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

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 处理文件上传前的验证
const handleBeforeUpload = (file: any) => {
  // 限制文件大小为50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB');
    return false;
  }
  return true;
};

// 处理文件上传进度
const handleUploadProgress = (event: any) => {
  if (event.total) {
    uploadProgress.value = Math.round((event.loaded / event.total) * 100);
  }
};

// 处理文件上传成功
const handleUploadSuccess = (response: any, file: any) => {
  ElMessage.success('文件上传成功');
  // 添加到附件列表
  if (response.data) {
    attachments.value.push(response.data);
    approval.value!.attachments = attachments.value;
  }
  // 移除上传队列中的文件
  uploadFiles.value = uploadFiles.value.filter(f => f.uid !== file.uid);
  uploadProgress.value = 0;
  isUploading.value = false;
};

// 处理文件上传失败
const handleUploadError = (error: any, file: any) => {
  ElMessage.error('文件上传失败');
  // 移除上传队列中的文件
  uploadFiles.value = uploadFiles.value.filter(f => f.uid !== file.uid);
  uploadProgress.value = 0;
  isUploading.value = false;
};

// 处理文件预览
const handlePreview = (file: any, attachment?: Attachment) => {
  const target = attachment || file.response?.data;
  if (!target) return;
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  if (imageTypes.includes(target.fileType.toLowerCase())) {
    previewImage.value = target.filePath;
    previewDialogVisible.value = true;
  } else {
    // 非图片文件直接下载
    handleDownload(target);
  }
};

// 处理文件下载
const handleDownload = (attachment: Attachment) => {
  // 这里应该调用后端的下载接口
  ElMessage.info('文件下载功能开发中');
};

// 处理文件删除
const handleRemove = (file: any, attachment?: Attachment) => {
  // 这里应该调用后端的删除接口
  ElMessage.info('文件删除功能开发中');
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

          <!-- 附件上传和展示 -->
          <ElCard shadow="hover" class="detail-card">
            <template #header>
              <span>审批附件</span>
            </template>
            
            <!-- 附件上传区域 -->
            <div class="attachment-upload-section">
              <ElUpload
                v-model:file-list="uploadFiles"
                action="/api/upload"
                :on-progress="handleUploadProgress"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :before-upload="handleBeforeUpload"
                :auto-upload="true"
                multiple
                :disabled="isUploading.value || approval.status !== 'PENDING'"
                list-type="text"
              >
                <ElButton type="primary" :disabled="isUploading.value || approval.status !== 'PENDING'">
                  <Icon icon="lucide:upload" :size="16" class="mr-1" />
                  上传附件
                </ElButton>
                <div class="upload-hint">支持多文件上传，单个文件不超过50MB</div>
              </ElUpload>
              
              <!-- 上传进度显示 -->
              <div v-if="uploadProgress > 0" class="upload-progress">
                <ElProgress :percentage="uploadProgress" :stroke-width="2" />
              </div>
            </div>
            
            <!-- 附件列表 -->
            <div class="attachment-list" v-if="attachments.length > 0">
              <h4 class="attachment-list-title">已上传附件</h4>
              <div class="attachment-items">
                <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
                  <div class="attachment-info">
                    <div class="attachment-name">
                      <Icon icon="lucide:file" :size="18" class="mr-2" />
                      {{ attachment.fileName }}
                    </div>
                    <div class="attachment-meta">
                      <span class="file-size">{{ formatFileSize(attachment.fileSize) }}</span>
                      <span class="file-type">{{ attachment.fileType }}</span>
                      <span class="upload-time">{{ formatTime(attachment.uploadTime) }}</span>
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <ElButton 
                      size="small" 
                      type="text" 
                      @click="handlePreview(null, attachment)"
                      title="预览"
                    >
                      <Icon icon="lucide:eye" :size="16" />
                    </ElButton>
                    <ElButton 
                      size="small" 
                      type="text" 
                      @click="handleDownload(attachment)"
                      title="下载"
                    >
                      <Icon icon="lucide:download" :size="16" />
                    </ElButton>
                    <ElButton 
                      v-if="approval.status === 'PENDING'"
                      size="small" 
                      type="text" 
                      @click="handleRemove(null, attachment)"
                      title="删除"
                    >
                      <Icon icon="lucide:trash-2" :size="16" />
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <ElEmpty v-else description="暂无附件" />
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
        
        <!-- 图片预览弹窗 -->
        <ElDialog v-model="previewDialogVisible" title="图片预览" width="80%" append-to-body>
          <ElImage
            :src="previewImage"
            fit="contain"
            style="width: 100%; height: 60vh;"
          />
        </ElDialog>
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

.info-item .json-data {
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.log-item {
  padding: 8px 0;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.log-action {
  font-size: 14px;
  font-weight: 500;
}

.log-operator {
  font-size: 12px;
  color: #909399;
}

.log-opinion,
.log-remark {
  margin-top: 4px;
  font-size: 13px;
  color: #606266;
}

.mr-1 {
    margin-right: 4px;
  }

  /* 附件上传相关样式 */
  .attachment-upload-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;
  }

  .upload-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }

  .upload-progress {
    margin-top: 12px;
    width: 100%;
  }

  .attachment-list {
    margin-top: 20px;
  }

  .attachment-list-title {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .attachment-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .attachment-item:hover {
    background: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .attachment-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .attachment-name {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .attachment-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #909399;
  }

  .attachment-actions {
    display: flex;
    gap: 8px;
  }
</style>
