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

interface DocumentAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
  filePath: string;
}

interface DocumentApproval {
  id: number;
  documentTitle: string;
  documentType: string;
  content: string;
  submitter: string;
  submitTime: string;
  approvalTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
  attachments: DocumentAttachment[];
}

const loading = ref(false);
const documentList = ref<DocumentApproval[]>([]);
const dialogVisible = ref(false);
const currentDocument = ref<DocumentApproval | null>(null);
const approvalForm = ref({
  remark: '',
  status: 'approved' as 'approved' | 'rejected',
});

// 新增响应式变量
const showFullContent = ref(false);
const previewDialogVisible = ref(false);
const previewingFile = ref<DocumentAttachment | null>(null);
const previewTextContent = ref('');

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
};

// 判断文件是否可预览
const canPreview = (fileType: string): boolean => {
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'txt'];
  return previewableTypes.includes(fileType.toLowerCase());
};

// 预览文件
const previewFile = (file: DocumentAttachment) => {
  previewingFile.value = file;
  
  // 如果是文本文件，可以模拟读取内容
  if (file.fileType === 'txt') {
    previewTextContent.value = `这是 ${file.fileName} 的预览内容。\n\n实际应用中，这里会显示文本文件的真实内容。`;
  }
  
  previewDialogVisible.value = true;
};

// 下载文件
const downloadFile = (file: DocumentAttachment) => {
  // 实际应用中，这里会调用后端API下载文件
  ElMessage.success(`开始下载 ${file.fileName}`);
  console.log('下载文件:', file.filePath);
};

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
    content: '张三因合同纠纷起诉李四，要求赔偿损失。根据《中华人民共和国民法典》相关规定，被告李四未按照合同约定履行义务，给原告张三造成了经济损失。原告要求被告赔偿人民币10万元，并承担本案诉讼费用。',
    attachments: [
      {
        id: 1,
        fileName: '合同原件.pdf',
        fileSize: 1234567,
        fileType: 'pdf',
        uploadTime: '2026-01-07 14:25:00',
        filePath: '/uploads/contract.pdf',
      },
      {
        id: 2,
        fileName: '转账记录.jpg',
        fileSize: 567890,
        fileType: 'jpg',
        uploadTime: '2026-01-07 14:26:00',
        filePath: '/uploads/transfer.jpg',
      },
    ],
  },
  {
    id: 2,
    documentTitle: '王五答辩状',
    documentType: 'defense',
    submitter: '赵六',
    submitTime: '2026-01-07 10:15:00',
    status: 'pending',
    content: '针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。针对张三的起诉状提出答辩。被告认为原告所述与事实不符，被告已经按照合同约定履行了全部义务。原告的损失与被告无关，请求法院驳回原告的全部诉讼请求。',
    attachments: [
      {
        id: 3,
        fileName: '答辩证据清单.docx',
        fileSize: 890123,
        fileType: 'docx',
        uploadTime: '2026-01-07 10:10:00',
        filePath: '/uploads/defense_evidence.docx',
      },
    ],
  },
  {
    id: 3,
    documentTitle: '证据清单-合同纠纷案',
    documentType: 'evidence',
    submitter: '李四',
    submitTime: '2026-01-06 16:45:00',
    approvalTime: '2026-01-06 17:30:00',
    status: 'approved',
    content: '包含合同原件、转账记录、证人证言等证据，证明被告未履行合同义务，给原告造成了经济损失。',
    attachments: [
      {
        id: 4,
        fileName: '证据清单.pdf',
        fileSize: 2345678,
        fileType: 'pdf',
        uploadTime: '2026-01-06 16:40:00',
        filePath: '/uploads/evidence_list.pdf',
      },
      {
        id: 5,
        fileName: '证人证言.txt',
        fileSize: 123456,
        fileType: 'txt',
        uploadTime: '2026-01-06 16:42:00',
        filePath: '/uploads/witness.txt',
      },
      {
        id: 6,
        fileName: '损失计算表.xlsx',
        fileSize: 456789,
        fileType: 'xlsx',
        uploadTime: '2026-01-06 16:43:00',
        filePath: '/uploads/loss_calculation.xlsx',
      },
    ],
  },
  {
    id: 4,
    documentTitle: '法律意见书-劳动争议',
    documentType: 'legal_opinion',
    submitter: '王五',
    submitTime: '2026-01-06 09:20:00',
    approvalTime: '2026-01-06 10:30:00',
    status: 'rejected',
    content: '关于劳动争议案件的法律意见。根据《中华人民共和国劳动法》和《中华人民共和国劳动合同法》相关规定，分析本案的法律适用和可能的判决结果。',
    remark: '需要补充相关证据材料',
    attachments: [
      {
        id: 7,
        fileName: '法律意见书正文.pdf',
        fileSize: 3456789,
        fileType: 'pdf',
        uploadTime: '2026-01-06 09:15:00',
        filePath: '/uploads/legal_opinion.pdf',
      },
    ],
  },
  {
    id: 5,
    documentTitle: '补充材料-房产纠纷',
    documentType: 'other',
    submitter: '赵六',
    submitTime: '2026-01-05 15:30:00',
    status: 'pending',
    content: '房产过户相关补充材料，包括房屋产权证书、买卖合同、付款凭证等。',
    attachments: [
      {
        id: 8,
        fileName: '房屋产权证书.jpg',
        fileSize: 678901,
        fileType: 'jpg',
        uploadTime: '2026-01-05 15:25:00',
        filePath: '/uploads/property_certificate.jpg',
      },
      {
        id: 9,
        fileName: '买卖合同.pdf',
        fileSize: 1234567,
        fileType: 'pdf',
        uploadTime: '2026-01-05 15:26:00',
        filePath: '/uploads/sales_contract.pdf',
      },
      {
        id: 10,
        fileName: '付款凭证.pdf',
        fileSize: 890123,
        fileType: 'pdf',
        uploadTime: '2026-01-05 15:27:00',
        filePath: '/uploads/payment_voucher.pdf',
      },
    ],
  },
];

const loadDocuments = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    documentList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error) {
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

  if (approvalForm.value.status === 'rejected' && !approvalForm.value.remark.trim()) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = documentList.value.findIndex(doc => doc.id === currentDocument.value?.id);
    if (index !== -1) {
      const approvalTime = new Date().toLocaleString('zh-CN');
      documentList.value[index].status = approvalForm.value.status;
      documentList.value[index].approvalTime = approvalTime;
      if (approvalForm.value.remark) {
        documentList.value[index].remark = approvalForm.value.remark;
      }
    }

    ElMessage.success(approvalForm.value.status === 'approved' ? '审批通过' : '已驳回');
    dialogVisible.value = false;
  } catch (error) {
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
  const item = documentTypes.find(t => t.value === type);
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

        <ElTableColumn prop="content" label="文书内容" min-width="250">
          <template #default="{ row }">
            <ElTooltip :content="row.content" placement="top">
              <span class="truncate-text">{{ row.content }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="submitter" label="提交人" width="120" />

        <ElTableColumn prop="submitTime" label="提交时间" width="180" />

        <ElTableColumn prop="approvalTime" label="审批时间" width="180">
          <template #default="{ row }">
            {{ row.approvalTime || '-' }}
          </template>
        </ElTableColumn>

        <ElTableColumn prop="status" label="审批状态" width="100" align="center">
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
      width="900px"
      destroy-on-close
    >
      <div v-if="currentDocument" class="document-detail">
        <div class="document-header">
          <div class="header-item">
            <span class="label">文书标题：</span>
            <span class="value">{{ currentDocument.documentTitle }}</span>
          </div>
          <div class="header-item">
            <span class="label">文书类型：</span>
            <ElTag type="info" size="small">
              {{ getDocumentTypeName(currentDocument.documentType) }}
            </ElTag>
          </div>
          <div class="header-item">
            <span class="label">提交人：</span>
            <span class="value">{{ currentDocument.submitter }}</span>
          </div>
          <div class="header-item">
            <span class="label">提交时间：</span>
            <span class="value">{{ currentDocument.submitTime }}</span>
          </div>
          <div class="header-item">
            <span class="label">当前状态：</span>
            <ElTag :type="statusMap[currentDocument.status].type" size="small">
              {{ statusMap[currentDocument.status].text }}
            </ElTag>
          </div>
        </div>

        <div class="document-content-container">
          <!-- 左侧：文书内容 -->
          <div class="content-section">
            <div class="section-title">文书内容</div>
            <div 
              class="content-box"
              @click="showFullContent = true"
              :class="{ 'clickable': true }"
            >
              <div v-if="!showFullContent" class="content-preview">
                {{ currentDocument.content }}
              </div>
              <div v-else class="content-full">
                {{ currentDocument.content }}
                <ElButton 
                  type="text" 
                  size="small" 
                  @click.stop="showFullContent = false"
                  class="collapse-btn"
                >
                  <i class="i-lucide-chevron-up mr-1"></i>
                  收起
                </ElButton>
              </div>
            </div>

            <div v-if="currentDocument.remark" class="remark-section">
              <div class="section-title">审批意见</div>
              <div class="remark-box">
                {{ currentDocument.remark }}
              </div>
            </div>

            <div v-if="currentDocument.status === 'pending'" class="approval-section">
              <div class="section-title">审批操作</div>
              <ElFormItem label="审批意见" class="approval-form-item">
                <ElInput
                  v-model="approvalForm.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入审批意见（驳回时必填）"
                />
              </ElFormItem>
            </div>
          </div>

          <!-- 右侧：附件列表 -->
          <div class="attachment-section">
            <div class="section-title">附件列表</div>
            <div v-if="currentDocument.attachments.length > 0" class="attachment-list">
              <div 
                v-for="attachment in currentDocument.attachments" 
                :key="attachment.id"
                class="attachment-item"
              >
                <div class="attachment-info">
                  <div class="attachment-icon">
                    <i v-if="attachment.fileType === 'pdf'" class="i-lucide-file-text"></i>
                    <i v-else-if="attachment.fileType === 'doc' || attachment.fileType === 'docx'" class="i-lucide-file-word"></i>
                    <i v-else-if="attachment.fileType === 'xls' || attachment.fileType === 'xlsx'" class="i-lucide-file-excel"></i>
                    <i v-else-if="attachment.fileType === 'jpg' || attachment.fileType === 'jpeg' || attachment.fileType === 'png'" class="i-lucide-file-image"></i>
                    <i v-else-if="attachment.fileType === 'txt'" class="i-lucide-file-letter"></i>
                    <i v-else class="i-lucide-file"></i>
                  </div>
                  <div class="attachment-details">
                    <div class="attachment-name">{{ attachment.fileName }}</div>
                    <div class="attachment-meta">
                      <span>{{ formatFileSize(attachment.fileSize) }}</span>
                      <span class="dot">·</span>
                      <span>{{ attachment.uploadTime }}</span>
                    </div>
                  </div>
                </div>
                <div class="attachment-actions">
                  <ElButton 
                    type="primary" 
                    size="small" 
                    link
                    @click="previewFile(attachment)"
                    :disabled="!canPreview(attachment.fileType)"
                  >
                    <i class="i-lucide-eye mr-1"></i>
                    预览
                  </ElButton>
                  <ElButton 
                    type="success" 
                    size="small" 
                    link
                    @click="downloadFile(attachment)"
                  >
                    <i class="i-lucide-download mr-1"></i>
                    下载
                  </ElButton>
                </div>
              </div>
            </div>
            <div v-else class="empty-attachments">
              <ElEmpty description="暂无附件" />
            </div>
          </div>
        </div>
      </div>

      <!-- 文件预览弹窗 -->
      <ElDialog
        v-model="previewDialogVisible"
        :title="previewingFile?.fileName || '文件预览'"
        width="800px"
      >
        <div v-if="previewingFile" class="file-preview-container">
          <div v-if="previewingFile.fileType === 'pdf'" class="file-preview pdf-preview">
            <iframe 
              :src="previewingFile.filePath" 
              frameborder="0"
              width="100%"
              height="500px"
            ></iframe>
          </div>
          <div v-else-if="previewingFile.fileType === 'jpg' || previewingFile.fileType === 'jpeg' || previewingFile.fileType === 'png'" class="file-preview image-preview">
            <img :src="previewingFile.filePath" alt="预览图片" class="preview-image">
          </div>
          <div v-else-if="previewingFile.fileType === 'txt'" class="file-preview text-preview">
            <pre class="preview-text">{{ previewTextContent }}</pre>
          </div>
          <div v-else class="file-preview unsupported-preview">
            <ElEmpty description="不支持的文件格式" />
            <div class="preview-actions">
              <ElButton type="primary" @click="downloadFile(previewingFile)">
                <i class="i-lucide-download mr-1"></i>
                下载文件
              </ElButton>
            </div>
          </div>
        </div>
        <template #footer>
          <ElButton @click="previewDialogVisible = false">关闭</ElButton>
          <ElButton type="success" @click="downloadFile(previewingFile)">
            <i class="i-lucide-download mr-1"></i>
            下载
          </ElButton>
        </template>
      </ElDialog>

      <template #footer v-if="currentDocument?.status === 'pending'">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="success"
          :loading="loading"
          @click="approvalForm.status = 'approved'; handleConfirmApproval()"
        >
          <i class="i-lucide-check mr-1"></i>
          通过
        </ElButton>
        <ElButton
          type="danger"
          :loading="loading"
          @click="approvalForm.status = 'rejected'; handleConfirmApproval()"
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
      font-weight: 500;
      color: #303133;
    }

    .document-header {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px 24px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .header-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-weight: 500;
          color: #606266;
          min-width: 80px;
        }

        .value {
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .document-content-container {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .content-section {
      flex: 1;
      min-width: 0;
    }

    .attachment-section {
      width: 320px;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }

    .content-box {
      min-height: 120px;
      padding: 16px;
      line-height: 1.6;
      color: #606266;
      background-color: #f5f7fa;
      border-radius: 4px;
      border: 1px solid #ebeef5;
      transition: all 0.3s;

      &.clickable {
        cursor: pointer;
        &:hover {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .content-preview {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .content-full {
      max-height: 500px;
      overflow-y: auto;
      position: relative;
    }

    .collapse-btn {
      display: block;
      margin-top: 12px;
      padding: 0;
      font-size: 13px;
      color: #409eff;
    }

    .remark-section {
      margin-top: 24px;
    }

    .remark-box {
      padding: 16px;
      line-height: 1.6;
      color: #f56c6c;
      background-color: #fef0f0;
      border-radius: 4px;
      border: 1px solid #fbc4ab;
    }

    .approval-section {
      margin-top: 24px;
    }

    .approval-form-item {
      margin-bottom: 0;
    }

    .attachment-list {
      background-color: #f5f7fa;
      border-radius: 4px;
      padding: 12px;
      max-height: 500px;
      overflow-y: auto;
    }

    .attachment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #fff;
      border-radius: 4px;
      margin-bottom: 8px;
      border: 1px solid #ebeef5;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .attachment-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .attachment-icon {
      font-size: 24px;
      color: #409eff;
      flex-shrink: 0;
    }

    .attachment-details {
      flex: 1;
      min-width: 0;
    }

    .attachment-name {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .attachment-meta {
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;

      .dot {
        margin: 0 2px;
      }
    }

    .attachment-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .empty-attachments {
      background-color: #f5f7fa;
      border-radius: 4px;
      padding: 40px 20px;
      text-align: center;
    }
  }

  .file-preview-container {
    .file-preview {
      margin: 0 -20px -20px;
      padding: 0 20px 20px;

      &.pdf-preview {
        iframe {
          border: 1px solid #ebeef5;
          border-radius: 4px;
        }
      }

      &.image-preview {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 500px;
        background-color: #fafafa;
        border-radius: 4px;
        overflow: hidden;

        .preview-image {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
        }
      }

      &.text-preview {
        pre {
          max-height: 500px;
          overflow: auto;
          padding: 16px;
          background-color: #f5f7fa;
          border: 1px solid #ebeef5;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.5;
        }
      }

      &.unsupported-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 16px;

        .preview-actions {
          margin-top: 16px;
        }
      }
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item.approval-form-item) {
  margin-bottom: 0;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>
