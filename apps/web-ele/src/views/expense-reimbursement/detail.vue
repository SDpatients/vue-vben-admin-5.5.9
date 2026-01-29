<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import { Loading } from '@element-plus/icons-vue';
import { ElImageViewer, ElMessage, ElMessageBox } from 'element-plus';

import {
  approveReimbursement,
  deleteReimbursement,
  downloadReimbursementAttachment,
  getReimbursementDetail,
  previewReimbursementAttachment,
} from '#/api/core/expense-reimbursement';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const fileLoading = ref(false);
const detail = ref<any>(null);

const imageViewerVisible = ref(false);
const currentImageUrl = ref('');
const imagePreviewUrls = ref<Record<number, string>>({});

const canApprove = computed(() => {
  const roles = userStore.getUserRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
});

const canEdit = computed(() => {
  return detail.value && detail.value.approvalStatus === 'PENDING';
});

const fetchDetail = async (id: number) => {
  loading.value = true;
  try {
    const response = await getReimbursementDetail(id);
    detail.value = response.data;

    imagePreviewUrls.value = {};
    if (detail.value.attachments && detail.value.attachments.length > 0) {
      for (const attachment of detail.value.attachments) {
        if (isImageType(attachment.fileType)) {
          try {
            const blob = await previewReimbursementAttachment(attachment.id);
            imagePreviewUrls.value[attachment.id] = URL.createObjectURL(blob);
          } catch (error) {
            console.error('预加载图片失败:', attachment.fileName, error);
          }
        }
      }
    }
  } catch (error) {
    ElMessage.error('获取报销单详情失败');
    console.error('获取报销单详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/expense-reimbursement/edit/${detail.value.id}`);
};

const handleDelete = async () => {
  if (!canEdit.value) {
    ElMessage.warning('只能删除待审批状态的报销单');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除该报销单吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    await deleteReimbursement(detail.value.id);
    ElMessage.success('删除成功');
    router.push('/expense-reimbursement');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('删除报销单失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleApprove = async () => {
  if (!canEdit.value) {
    ElMessage.warning('只能审批待审批状态的报销单');
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入审批意见', '审批操作', {
      confirmButtonText: '通过',
      cancelButtonText: '拒绝',
      distinguishCancelAndClose: true,
      inputPattern: /.+/,
      inputErrorMessage: '请输入审批意见',
    });

    loading.value = true;
    await approveReimbursement(detail.value.id, {
      approvalStatus: 'APPROVED',
      approvalOpinion: value,
    });
    ElMessage.success('审批通过');
    fetchDetail(detail.value.id);
  } catch (error: any) {
    if (error === 'cancel') {
      try {
        const { value } = await ElMessageBox.prompt(
          '请输入拒绝理由（可选）',
          '拒绝操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          },
        );

        loading.value = true;
        await approveReimbursement(detail.value.id, {
          approvalStatus: 'REJECTED',
          approvalOpinion: value,
        });
        ElMessage.success('已拒绝该报销单');
        fetchDetail(detail.value.id);
      } catch (error_: any) {
        if (error_ !== 'cancel') {
          ElMessage.error('操作失败');
          console.error('拒绝报销单失败:', error_);
        }
      }
    } else {
      ElMessage.error('操作失败');
      console.error('审批报销单失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push('/expense-reimbursement');
};

const getApprovalStatusTag = (status: string) => {
  const map: Record<string, { text: string; type: string }> = {
    PENDING: { type: 'warning', text: '待审批' },
    APPROVED: { type: 'success', text: '已通过' },
    REJECTED: { type: 'danger', text: '已拒绝' },
  };
  return map[status] || { type: 'info', text: status };
};

const isImageType = (fileType: string) => {
  return [
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
  ].includes(fileType);
};

const previewFile = async (attachment: any) => {
  fileLoading.value = true;
  try {
    const blob = await previewReimbursementAttachment(attachment.id);
    const url = URL.createObjectURL(blob);

    if (isImageType(attachment.fileType)) {
      currentImageUrl.value = url;
      imageViewerVisible.value = true;
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  } catch (error) {
    ElMessage.error('预览文件失败');
    console.error('预览文件失败:', error);
  } finally {
    fileLoading.value = false;
  }
};

const openImageViewer = (url: string) => {
  currentImageUrl.value = url;
  imageViewerVisible.value = true;
};

const downloadFile = async (attachment: any) => {
  fileLoading.value = true;
  try {
    const blob = await downloadReimbursementAttachment(attachment.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载文件失败');
    console.error('下载文件失败:', error);
  } finally {
    fileLoading.value = false;
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchDetail(id);
  }
});
</script>

<template>
  <div class="expense-reimbursement-detail-page">
    <div class="page-header">
      <h1>报销单详情</h1>
      <el-button @click="handleBack">返回列表</el-button>
    </div>

    <div class="expense-reimbursement-detail-content" v-loading="loading">
      <el-card shadow="hover" class="info-card" v-if="detail">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag
              :type="getApprovalStatusTag(detail.approvalStatus).type"
              effect="dark"
              size="large"
              style="font-weight: bold; padding: 8px 16px; font-size: 15px;"
            >
              {{ getApprovalStatusTag(detail.approvalStatus).text }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="报销单号">
            {{ detail.reimbursementNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="案件名称">
            {{ detail.caseName }}
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ detail.applicantName }}
          </el-descriptions-item>
          <el-descriptions-item label="收款账户">
            {{ detail.fundAccountName }}
          </el-descriptions-item>
          <el-descriptions-item label="银行">
            {{ detail.bankName }}
          </el-descriptions-item>
          <el-descriptions-item label="银行账号">
            {{ detail.bankAccount }}
          </el-descriptions-item>
          <el-descriptions-item label="报销金额">
            <span class="amount">{{ (detail.totalAmount || 0).toFixed(2) }} 元</span>
          </el-descriptions-item>
          <el-descriptions-item label="报销日期">
            {{ detail.reimbursementDate }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{
              detail.createTime
                ? new Date(detail.createTime).toLocaleString('zh-CN')
                : '-'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="报销说明" :span="3">
            {{ detail.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审批人" :span="1">
            {{ detail.approverName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" :span="1">
            {{
              detail.approvalTime
                ? new Date(detail.approvalTime).toLocaleString('zh-CN')
                : '-'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="1">
            {{ detail.approvalOpinion || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="hover" class="items-card" v-if="detail">
        <template #header>
          <span>报销明细</span>
        </template>
        <el-table :data="detail.items" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="itemName" label="费用名称" width="200" />
          <el-table-column
            prop="itemAmount"
            label="费用金额"
            width="150"
            align="right"
          >
            <template #default="scope">
              {{ (scope.row.itemAmount || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="itemDescription" label="费用说明" />
        </el-table>
        <div class="total-amount">
          <span>总金额：</span>
          <span class="amount">{{ (detail.totalAmount || 0).toFixed(2) }} 元</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="attachments-card" v-if="detail">
        <template #header>
          <span>附件</span>
        </template>
        <el-table :data="detail.attachments" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="fileName" label="文件名" width="250">
            <template #default="scope">
              <div class="file-name-cell">
                <img
                  v-if="imagePreviewUrls[scope.row.id]"
                  :src="imagePreviewUrls[scope.row.id]"
                  class="file-thumbnail"
                  @click="openImageViewer(imagePreviewUrls[scope.row.id])"
                />
                <span>{{ scope.row.fileName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fileSize" label="文件大小" width="150">
            <template #default="scope">
              {{ (scope.row.fileSize / 1024).toFixed(2) }} KB
            </template>
          </el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180">
            <template #default="scope">
              {{
                scope.row.uploadTime
                  ? new Date(scope.row.uploadTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="previewFile(scope.row)"
              >
                预览
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="downloadFile(scope.row)"
              >
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="action-buttons" v-if="detail">
        <el-button @click="handleBack">返回</el-button>
        <el-button v-if="canEdit" type="primary" @click="handleEdit">
          编辑
        </el-button>
        <el-button
          v-if="canApprove && canEdit"
          type="warning"
          @click="handleApprove"
        >
          审批
        </el-button>
        <el-button v-if="canEdit" type="danger" @click="handleDelete">
          删除
        </el-button>
      </div>

      <!-- 图片查看器 -->
      <ElImageViewer
        v-if="imageViewerVisible"
        :url-list="[currentImageUrl]"
        @close="imageViewerVisible = false"
      />

      <!-- 文件操作遮罩层 -->
      <div v-if="fileLoading" class="file-loading-mask">
        <Loading class="is-loading" />
        <span>文件处理中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expense-reimbursement-detail-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.expense-reimbursement-detail-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.info-card,
.items-card,
.attachments-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.total-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  font-size: 16px;
}

.total-amount .amount {
  margin-left: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.file-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
  font-size: 16px;
  gap: 10px;
}

.file-loading-mask .is-loading {
  font-size: 32px;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.file-thumbnail:hover {
  border-color: #409eff;
  transform: scale(1.05);
}
</style>
