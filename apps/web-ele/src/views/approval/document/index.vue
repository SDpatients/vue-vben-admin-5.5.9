<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';

interface DocumentApproval {
  id: number;
  documentTitle: string;
  documentType: string;
  submitter: string;
  submitTime: string;
  status: 'approved' | 'pending' | 'rejected';
  content: string;
  remark?: string;
}

const loading = ref(false);
const documentList = ref<DocumentApproval[]>([]);
const dialogVisible = ref(false);
const currentDocument = ref<DocumentApproval | null>(null);
const approvalForm = ref({
  remark: '',
  status: 'approved' as 'approved' | 'rejected',
});

const searchForm = ref({
  status: '',
  documentType: '',
  keyword: '',
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const documentTypes = [
  { label: '起诉状', value: 'complaint' },
  { label: '答辩状', value: 'defense' },
  { label: '证据清单', value: 'evidence' },
  { label: '法律意见书', value: 'legal_opinion' },
  { label: '其他', value: 'other' },
];

const statusMap = {
  pending: { text: '待审批', type: 'warning' as const },
  approved: { text: '已通过', type: 'success' as const },
  rejected: { text: '已驳回', type: 'danger' as const },
};

const mockData: DocumentApproval[] = [
  {
    id: 1,
    documentTitle: '张三起诉状',
    documentType: 'complaint',
    submitter: '李四',
    submitTime: '2026-01-07 14:30:00',
    status: 'pending',
    content: '张三因合同纠纷起诉李四，要求赔偿损失...',
  },
  {
    id: 2,
    documentTitle: '王五答辩状',
    documentType: 'defense',
    submitter: '赵六',
    submitTime: '2026-01-07 10:15:00',
    status: 'pending',
    content: '针对张三的起诉状提出答辩...',
  },
  {
    id: 3,
    documentTitle: '证据清单-合同纠纷案',
    documentType: 'evidence',
    submitter: '李四',
    submitTime: '2026-01-06 16:45:00',
    status: 'approved',
    content: '包含合同原件、转账记录等证据...',
  },
  {
    id: 4,
    documentTitle: '法律意见书-劳动争议',
    documentType: 'legal_opinion',
    submitter: '王五',
    submitTime: '2026-01-06 09:20:00',
    status: 'rejected',
    content: '关于劳动争议案件的法律意见...',
    remark: '需要补充相关证据材料',
  },
  {
    id: 5,
    documentTitle: '补充材料-房产纠纷',
    documentType: 'other',
    submitter: '赵六',
    submitTime: '2026-01-05 15:30:00',
    status: 'pending',
    content: '房产过户相关补充材料...',
  },
];

const loadDocuments = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    documentList.value = mockData;
    pagination.value.total = mockData.length;
  } catch {
    ElMessage.error('加载文书列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  loadDocuments();
};

const handleReset = () => {
  searchForm.value = {
    status: '',
    documentType: '',
    keyword: '',
  };
  pagination.value.current = 1;
  loadDocuments();
};

const handleViewDetail = (row: DocumentApproval) => {
  currentDocument.value = row;
  dialogVisible.value = true;
};

const handleApprove = (row: DocumentApproval) => {
  currentDocument.value = row;
  approvalForm.value = {
    remark: '',
    status: 'approved',
  };
  dialogVisible.value = true;
};

const handleReject = (row: DocumentApproval) => {
  currentDocument.value = row;
  approvalForm.value = {
    remark: '',
    status: 'rejected',
  };
  dialogVisible.value = true;
};

const handleConfirmApproval = async () => {
  if (!currentDocument.value) return;

  if (
    approvalForm.value.status === 'rejected' &&
    !approvalForm.value.remark.trim()
  ) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = documentList.value.findIndex(
      (doc) => doc.id === currentDocument.value?.id,
    );
    if (index !== -1) {
      documentList.value[index].status = approvalForm.value.status;
      if (approvalForm.value.remark) {
        documentList.value[index].remark = approvalForm.value.remark;
      }
    }

    ElMessage.success(
      approvalForm.value.status === 'approved' ? '审批通过' : '已驳回',
    );
    dialogVisible.value = false;
  } catch {
    ElMessage.error('审批失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadDocuments();
};

const getDocumentTypeName = (type: string) => {
  const item = documentTypes.find((t) => t.value === type);
  return item?.label || type;
};

onMounted(() => {
  loadDocuments();
});
</script>

<template>
  <div class="document-approval-page p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">文书审批</span>
          <ElButton type="primary" @click="loadDocuments">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <div class="mb-4">
        <ElForm :model="searchForm" inline>
          <ElFormItem label="文书类型">
            <ElSelect
              v-model="searchForm.documentType"
              placeholder="请选择文书类型"
              clearable
              style="width: 180px"
            >
              <ElOption
                v-for="type in documentTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审批状态">
            <ElSelect
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <ElOption
                v-for="(item, key) in statusMap"
                :key="key"
                :label="item.text"
                :value="key"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="关键词">
            <ElInput
              v-model="searchForm.keyword"
              placeholder="请输入文书标题或提交人"
              clearable
              style="width: 200px"
            />
          </ElFormItem>

          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">
              <i class="i-lucide-search mr-1"></i>
              查询
            </ElButton>
            <ElButton @click="handleReset">
              <i class="i-lucide-rotate-ccw mr-1"></i>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <ElTable
        :data="documentList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <ElTableColumn label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </ElTableColumn>

        <ElTableColumn prop="documentTitle" label="文书标题" min-width="200">
          <template #default="{ row }">
            <ElTooltip :content="row.documentTitle" placement="top">
              <span class="truncate-text">{{ row.documentTitle }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="documentType" label="文书类型" width="120">
          <template #default="{ row }">
            <ElTag type="info" size="small">
              {{ getDocumentTypeName(row.documentType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="submitter" label="提交人" width="120" />

        <ElTableColumn prop="submitTime" label="提交时间" width="180" />

        <ElTableColumn
          prop="status"
          label="审批状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="statusMap[row.status].type" size="small">
              {{ statusMap[row.status].text }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              <i class="i-lucide-eye mr-1"></i>
              查看详情
            </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              link
              @click="handleApprove(row)"
            >
              <i class="i-lucide-check mr-1"></i>
              通过
            </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              link
              @click="handleReject(row)"
            >
              <i class="i-lucide-x mr-1"></i>
              驳回
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div v-if="documentList.length === 0 && !loading" class="mt-8">
        <ElEmpty description="暂无文书审批数据" />
      </div>

      <div v-if="documentList.length > 0" class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="currentDocument?.status === 'pending' ? '审批文书' : '文书详情'"
      width="700px"
    >
      <div v-if="currentDocument" class="document-detail">
        <ElForm :model="currentDocument" label-width="100px">
          <ElFormItem label="文书标题">
            <span class="detail-value">{{
              currentDocument.documentTitle
            }}</span>
          </ElFormItem>

          <ElFormItem label="文书类型">
            <ElTag type="info" size="small">
              {{ getDocumentTypeName(currentDocument.documentType) }}
            </ElTag>
          </ElFormItem>

          <ElFormItem label="提交人">
            <span class="detail-value">{{ currentDocument.submitter }}</span>
          </ElFormItem>

          <ElFormItem label="提交时间">
            <span class="detail-value">{{ currentDocument.submitTime }}</span>
          </ElFormItem>

          <ElFormItem label="当前状态">
            <ElTag :type="statusMap[currentDocument.status].type" size="small">
              {{ statusMap[currentDocument.status].text }}
            </ElTag>
          </ElFormItem>

          <ElFormItem label="文书内容">
            <div class="content-box">
              {{ currentDocument.content }}
            </div>
          </ElFormItem>

          <ElFormItem v-if="currentDocument.remark" label="审批意见">
            <div class="remark-box">
              {{ currentDocument.remark }}
            </div>
          </ElFormItem>

          <ElFormItem
            v-if="currentDocument.status === 'pending'"
            label="审批意见"
          >
            <ElInput
              v-model="approvalForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见（驳回时必填）"
            />
          </ElFormItem>
        </ElForm>
      </div>

      <template #footer v-if="currentDocument?.status === 'pending'">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="success"
          :loading="loading"
          @click="
            approvalForm.status = 'approved';
            handleConfirmApproval();
          "
        >
          <i class="i-lucide-check mr-1"></i>
          通过
        </ElButton>
        <ElButton
          type="danger"
          :loading="loading"
          @click="
            approvalForm.status = 'rejected';
            handleConfirmApproval();
          "
        >
          <i class="i-lucide-x mr-1"></i>
          驳回
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.document-approval-page {
  .truncate-text {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .document-detail {
    .detail-value {
      color: #303133;
      font-weight: 500;
    }

    .content-box {
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
      color: #606266;
      min-height: 80px;
    }

    .remark-box {
      padding: 12px;
      background-color: #fef0f0;
      border-radius: 4px;
      line-height: 1.6;
      color: #f56c6c;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>
