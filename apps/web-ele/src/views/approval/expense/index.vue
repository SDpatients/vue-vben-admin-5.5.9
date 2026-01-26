<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { ElImageViewer } from 'element-plus';
import { getReimbursementList, approveReimbursement, getReimbursementDetail, previewReimbursementAttachment, downloadReimbursementAttachment } from '#/api/core/expense-reimbursement';
import { getCaseSimpleListApi } from '#/api/core/case';

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const reimbursements = ref<any[]>([]);

const searchForm = reactive({
  caseId: undefined as number | undefined,
  approvalStatus: 'PENDING' as string | undefined,
  reimbursementDate: '',
});

const caseOptions = ref<any[]>([]);

const approvalStatusOptions = [
  { label: '待审批', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const selectedRows = ref<any[]>([]);

const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const fileLoading = ref(false);
const currentDetail = ref<any>(null);
const imageViewerVisible = ref(false);
const currentImageUrl = ref('');
const imagePreviewUrls = ref<Record<number, string>>({});

const fetchReimbursements = async () => {
  loading.value = true;
  try {
    const response = await getReimbursementList({
      page: currentPage.value,
      size: pageSize.value,
      caseId: searchForm.caseId,
      approvalStatus: searchForm.approvalStatus as any,
      reimbursementDate: searchForm.reimbursementDate,
    });
    reimbursements.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取报销单列表失败');
    console.error('获取报销单列表失败:', error);
    reimbursements.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const fetchCaseOptions = async () => {
  try {
    const response = await getCaseSimpleListApi({ page: 1, size: 100 });
    caseOptions.value = response.data.list;
  } catch (error) {
    console.error('获取案件列表失败:', error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchReimbursements();
};

const handleReset = () => {
  searchForm.caseId = undefined;
  searchForm.approvalStatus = 'PENDING';
  searchForm.reimbursementDate = '';
  currentPage.value = 1;
  fetchReimbursements();
};

const handleView = async (row: any) => {
  detailDialogVisible.value = true;
  await fetchDetail(row.id);
};

const fetchDetail = async (id: number) => {
  detailLoading.value = true;
  try {
    const response = await getReimbursementDetail(id);
    currentDetail.value = response.data;

    imagePreviewUrls.value = {};
    if (currentDetail.value.attachments && currentDetail.value.attachments.length > 0) {
      for (const attachment of currentDetail.value.attachments) {
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
    detailLoading.value = false;
  }
};

const handleApprove = async () => {
  if (!currentDetail.value || currentDetail.value.approvalStatus !== 'PENDING') {
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

    detailLoading.value = true;
    await approveReimbursement(currentDetail.value.id, {
      approvalStatus: 'APPROVED',
      approvalOpinion: value,
    });
    ElMessage.success('审批通过');
    await fetchDetail(currentDetail.value.id);
    fetchReimbursements();
  } catch (error: any) {
    if (error === 'cancel') {
      try {
        const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入拒绝理由',
        });

        detailLoading.value = true;
        await approveReimbursement(currentDetail.value.id, {
          approvalStatus: 'REJECTED',
          approvalOpinion: value,
        });
        ElMessage.success('已拒绝该报销单');
        await fetchDetail(currentDetail.value.id);
        fetchReimbursements();
      } catch (error2: any) {
        if (error2 !== 'cancel') {
          ElMessage.error('操作失败');
          console.error('拒绝报销单失败:', error2);
        }
      }
    } else {
      ElMessage.error('操作失败');
      console.error('审批报销单失败:', error);
    }
  } finally {
    detailLoading.value = false;
  }
};

const handleBatchApprove = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审批的报销单');
    return;
  }

  const pendingRows = selectedRows.value.filter((row) => row.approvalStatus === 'PENDING');
  if (pendingRows.length === 0) {
    ElMessage.warning('只能审批待审批状态的报销单');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量通过选中的 ${pendingRows.length} 条报销单吗？`,
      '批量审批确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    loading.value = true;
    for (const row of pendingRows) {
      await approveReimbursement(row.id, {
        approvalStatus: 'APPROVED',
        approvalOpinion: '批量审批通过',
      });
    }
    ElMessage.success(`成功审批 ${pendingRows.length} 条报销单`);
    selectedRows.value = [];
    fetchReimbursements();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量审批失败');
      console.error('批量审批失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleBatchReject = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要拒绝的报销单');
    return;
  }

  const pendingRows = selectedRows.value.filter((row) => row.approvalStatus === 'PENDING');
  if (pendingRows.length === 0) {
    ElMessage.warning('只能拒绝待审批状态的报销单');
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝理由', '批量拒绝确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由',
    });

    loading.value = true;
    for (const row of pendingRows) {
      await approveReimbursement(row.id, {
        approvalStatus: 'REJECTED',
        approvalOpinion: value,
      });
    }
    ElMessage.success(`成功拒绝 ${pendingRows.length} 条报销单`);
    selectedRows.value = [];
    fetchReimbursements();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量拒绝失败');
      console.error('批量拒绝失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchReimbursements();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchReimbursements();
};

const getApprovalStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    PENDING: { type: 'warning', text: '待审批' },
    APPROVED: { type: 'success', text: '已通过' },
    REJECTED: { type: 'danger', text: '已拒绝' },
  };
  return map[status] || { type: 'info', text: status };
};

const canBatchApprove = computed(() => {
  return selectedRows.value.some((row) => row.approvalStatus === 'PENDING');
});

const canApprove = computed(() => {
  return currentDetail.value && currentDetail.value.approvalStatus === 'PENDING';
});

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

const handleCloseDialog = () => {
  detailDialogVisible.value = false;
  currentDetail.value = null;
  imagePreviewUrls.value = {};
};

onMounted(() => {
  fetchReimbursements();
  fetchCaseOptions();
});
</script>

<template>
  <div class="expense-approval-page">
    <div class="page-header">
      <h1>报销批审</h1>
    </div>

    <div class="expense-approval-content">
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="案件">
            <el-select
              v-model="searchForm.caseId"
              placeholder="请选择案件"
              clearable
              style="width: 200px"
              @change="handleSearch"
            >
              <el-option
                v-for="item in caseOptions"
                :key="item.id"
                :label="`${item.caseNumber} - ${item.caseName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批状态">
            <el-select
              v-model="searchForm.approvalStatus"
              placeholder="请选择审批状态"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option
                v-for="item in approvalStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="报销日期">
            <el-date-picker
              v-model="searchForm.reimbursementDate"
              type="date"
              placeholder="请选择报销日期"
              value-format="YYYY-MM-DD"
              style="width: 200px"
              @change="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="list-card">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button
              type="success"
              :disabled="!canBatchApprove"
              @click="handleBatchApprove"
            >
              批量通过
            </el-button>
            <el-button
              type="danger"
              :disabled="!canBatchApprove"
              @click="handleBatchReject"
            >
              批量拒绝
            </el-button>
          </div>
          <div class="toolbar-right">
            <span class="selected-count">
              已选择 {{ selectedRows.length }} 条记录
            </span>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="reimbursements"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="reimbursementNumber" label="报销单号" width="180" />
          <el-table-column prop="caseName" label="案件名称" width="200" />
          <el-table-column prop="applicantName" label="申请人" width="120" />
          <el-table-column prop="fundAccountName" label="收款账户" width="150" />
          <el-table-column prop="bankAccount" label="银行账号" width="180" />
          <el-table-column prop="totalAmount" label="报销金额" width="120" align="right">
            <template #default="scope">
              {{ (scope.row.totalAmount || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementDate" label="报销日期" width="120" />
          <el-table-column prop="approvalStatus" label="审批状态" width="100">
            <template #default="scope">
              <el-tag :type="getApprovalStatusTag(scope.row.approvalStatus).type">
                {{ getApprovalStatusTag(scope.row.approvalStatus).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="approverName" label="审批人" width="120" />
          <el-table-column prop="approvalTime" label="审批时间" width="180">
            <template #default="scope">
              {{
                scope.row.approvalTime
                  ? new Date(scope.row.approvalTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              {{
                scope.row.createTime
                  ? new Date(scope.row.createTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleView(scope.row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="!loading">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      title="报销单详情"
      width="80%"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <div v-loading="detailLoading" class="detail-content">
        <el-card shadow="hover" class="info-card" v-if="currentDetail">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="getApprovalStatusTag(currentDetail.approvalStatus).type">
                {{ getApprovalStatusTag(currentDetail.approvalStatus).text }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="报销单号">
              {{ currentDetail.reimbursementNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="案件名称">
              {{ currentDetail.caseName }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">
              {{ currentDetail.applicantName }}
            </el-descriptions-item>
            <el-descriptions-item label="收款账户">
              {{ currentDetail.fundAccountName }}
            </el-descriptions-item>
            <el-descriptions-item label="银行">
              {{ currentDetail.bankName }}
            </el-descriptions-item>
            <el-descriptions-item label="银行账号">
              {{ currentDetail.bankAccount }}
            </el-descriptions-item>
            <el-descriptions-item label="报销金额">
              <span class="amount">{{ (currentDetail.totalAmount || 0).toFixed(2) }} 元</span>
            </el-descriptions-item>
            <el-descriptions-item label="报销日期">
              {{ currentDetail.reimbursementDate }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{
                currentDetail.createTime
                  ? new Date(currentDetail.createTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="报销说明" :span="3">
              {{ currentDetail.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="审批人" :span="1">
              {{ currentDetail.approverName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="审批时间" :span="1">
              {{
                currentDetail.approvalTime
                  ? new Date(currentDetail.approvalTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="审批意见" :span="1">
              {{ currentDetail.approvalOpinion || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="hover" class="items-card" v-if="currentDetail">
          <template #header>
            <span>报销明细</span>
          </template>
          <el-table :data="currentDetail.items" style="width: 100%">
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
            <span class="amount">{{ (currentDetail.totalAmount || 0).toFixed(2) }} 元</span>
          </div>
        </el-card>

        <el-card shadow="hover" class="attachments-card" v-if="currentDetail">
          <template #header>
            <span>附件</span>
          </template>
          <el-table :data="currentDetail.attachments" style="width: 100%">
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
      </div>

      <template #footer>
        <el-button @click="handleCloseDialog">关闭</el-button>
        <el-button
          v-if="canApprove"
          type="warning"
          @click="handleApprove"
        >
          审批
        </el-button>
      </template>
    </el-dialog>

    <ElImageViewer
      v-if="imageViewerVisible"
      :url-list="[currentImageUrl]"
      @close="imageViewerVisible = false"
    />

    <div v-if="fileLoading" class="file-loading-mask">
      <Loading class="is-loading" />
      <span>文件处理中...</span>
    </div>
  </div>
</template>

<style scoped>
.expense-approval-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.expense-approval-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.selected-count {
  color: #606266;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
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
