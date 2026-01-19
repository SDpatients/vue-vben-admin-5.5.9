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
  ElProgress,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
  ElUpload,
} from 'element-plus';

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadTime: string;
  uploader: string;
}

interface CaseApproval {
  id: number;
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  submitter: string;
  submitTime: string;
  approvalTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  description: string;
  remark?: string;
  attachments?: Attachment[];
}

const loading = ref(false);
const caseList = ref<CaseApproval[]>([]);
const dialogVisible = ref(false);
const currentCase = ref<CaseApproval | null>(null);
const approvalForm = ref({
  remark: '',
  status: 'approved' as 'approved' | 'rejected',
});

const searchForm = ref({
  status: '',
  keyword: '',
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const caseTypes = [
  { label: '合同纠纷', value: 'contract' },
  { label: '劳动争议', value: 'labor' },
  { label: '房产纠纷', value: 'property' },
  { label: '侵权纠纷', value: 'tort' },
  { label: '婚姻家庭', value: 'family' },
  { label: '其他', value: 'other' },
];

const priorities = [
  { label: '高', value: 'high', type: 'danger' as const },
  { label: '中', value: 'medium', type: 'warning' as const },
  { label: '低', value: 'low', type: 'info' as const },
];

const statusMap = {
  pending: { text: '待审批', type: 'warning' as const },
  approved: { text: '已通过', type: 'success' as const },
  rejected: { text: '已驳回', type: 'danger' as const },
};

const mockData: CaseApproval[] = [
  {
    id: 1,
    caseNumber: 'CASE-2026-0001',
    caseTitle: '张三诉李四合同纠纷案',
    caseType: 'contract',
    submitter: '王律师',
    submitTime: '2026-01-07 14:30:00',
    status: 'pending',
    priority: 'high',
    description: '张三与李四签订的买卖合同存在违约行为，要求赔偿损失。根据《中华人民共和国民法典》相关规定，被告李四未按照合同约定履行义务，给原告张三造成了经济损失。原告要求被告赔偿人民币10万元，并承担本案诉讼费用。',
    attachments: [
      {
        id: 1,
        fileName: '合同原件.pdf',
        fileSize: 1024 * 1024 * 2,
        fileType: 'pdf',
        filePath: '/uploads/case/1/contract.pdf',
        uploadTime: '2026-01-07 14:25:00',
        uploader: '王律师'
      },
      {
        id: 2,
        fileName: '违约证据.jpg',
        fileSize: 1024 * 1024 * 1.5,
        fileType: 'jpg',
        filePath: '/uploads/case/1/evidence.jpg',
        uploadTime: '2026-01-07 14:26:00',
        uploader: '王律师'
      }
    ]
  },
  {
    id: 2,
    caseNumber: 'CASE-2026-0002',
    caseTitle: '王五诉赵六劳动争议案',
    caseType: 'labor',
    submitter: '李律师',
    submitTime: '2026-01-07 10:15:00',
    status: 'pending',
    priority: 'medium',
    description: '王五与赵六公司存在劳动争议，要求支付工资和赔偿金。根据《中华人民共和国劳动法》相关规定，赵六公司未按时支付工资，且未依法缴纳社会保险，严重侵犯了劳动者的合法权益。',
    attachments: [
      {
        id: 3,
        fileName: '劳动合同.docx',
        fileSize: 1024 * 1024 * 3,
        fileType: 'docx',
        filePath: '/uploads/case/2/contract.docx',
        uploadTime: '2026-01-07 10:10:00',
        uploader: '李律师'
      }
    ]
  },
  {
    id: 3,
    caseNumber: 'CASE-2026-0003',
    caseTitle: '孙七诉周八房产纠纷案',
    caseType: 'property',
    submitter: '张律师',
    submitTime: '2026-01-06 16:45:00',
    approvalTime: '2026-01-06 18:30:00',
    status: 'approved',
    priority: 'high',
    description: '孙七与周八的房产过户纠纷，要求完成过户手续。双方于2025年6月签订房屋买卖合同，约定在合同签订后30日内完成过户手续，但被告至今未履行过户义务，严重损害了原告的合法权益。',
    remark: '材料齐全，符合审批条件',
    attachments: [
      {
        id: 4,
        fileName: '房产证明.pdf',
        fileSize: 1024 * 1024 * 2.5,
        fileType: 'pdf',
        filePath: '/uploads/case/3/property.pdf',
        uploadTime: '2026-01-06 16:40:00',
        uploader: '张律师'
      },
      {
        id: 5,
        fileName: '过户协议.jpg',
        fileSize: 1024 * 1024 * 1.2,
        fileType: 'jpg',
        filePath: '/uploads/case/3/agreement.jpg',
        uploadTime: '2026-01-06 16:42:00',
        uploader: '张律师'
      },
      {
        id: 6,
        fileName: '补充协议.jpg',
        fileSize: 1024 * 1024 * 1.8,
        fileType: 'jpg',
        filePath: '/uploads/case/3/agreement2.jpg',
        uploadTime: '2026-01-06 16:43:00',
        uploader: '张律师'
      }
    ]
  },
  {
    id: 4,
    caseNumber: 'CASE-2026-0004',
    caseTitle: '吴九诉郑十侵权纠纷案',
    caseType: 'tort',
    submitter: '赵律师',
    submitTime: '2026-01-06 09:20:00',
    approvalTime: '2026-01-06 11:00:00',
    status: 'rejected',
    priority: 'low',
    description: '吴九指控郑十侵犯其知识产权，要求停止侵权并赔偿。原告郑十未经许可，擅自使用原告注册的商标和专利技术，生产并销售同类产品，严重侵犯了原告的知识产权，造成了巨大的经济损失。',
    remark: '证据不足，需要补充相关材料',
    attachments: [
      {
        id: 7,
        fileName: '知识产权证书.pdf',
        fileSize: 1024 * 1024 * 4,
        fileType: 'pdf',
        filePath: '/uploads/case/4/certificate.pdf',
        uploadTime: '2026-01-06 09:15:00',
        uploader: '赵律师'
      }
    ]
  },
  {
    id: 5,
    caseNumber: 'CASE-2026-0005',
    caseTitle: '陈十一诉刘十二婚姻家庭案',
    caseType: 'family',
    submitter: '孙律师',
    submitTime: '2026-01-05 15:30:00',
    status: 'pending',
    priority: 'medium',
    description: '陈十一与刘十二离婚纠纷，涉及财产分割和子女抚养权。双方于2023年登记结婚，婚后因性格不合经常发生矛盾，现已分居满一年，感情确已破裂，无和好可能，请求法院判决离婚并依法分割夫妻共同财产。',
    attachments: [
      {
        id: 8,
        fileName: '结婚证.jpg',
        fileSize: 1024 * 1024 * 2.2,
        fileType: 'jpg',
        filePath: '/uploads/case/5/marriage.jpg',
        uploadTime: '2026-01-05 15:25:00',
        uploader: '孙律师'
      },
      {
        id: 9,
        fileName: '财产证明.xlsx',
        fileSize: 1024 * 1024 * 1.5,
        fileType: 'xlsx',
        filePath: '/uploads/case/5/assets.xlsx',
        uploadTime: '2026-01-05 15:28:00',
        uploader: '孙律师'
      }
    ]
  },
];

// 附件上传相关状态
const fileList = ref<{name: string, url: string, file: File}[]>([]);
const uploadProgress = ref(0);
const uploading = ref(false);

const loadCases = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    caseList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error) {
    ElMessage.error('加载案件列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  loadCases();
};

const handleReset = () => {
  searchForm.value = {
    status: '',
    keyword: '',
  };
  pagination.value.current = 1;
  loadCases();
};

const handleViewDetail = (row: CaseApproval) => {
  currentCase.value = row;
  dialogVisible.value = true;
};

const handleApprove = (row: CaseApproval) => {
  currentCase.value = row;
  approvalForm.value = {
    remark: '',
    status: 'approved',
  };
  dialogVisible.value = true;
};

const handleReject = (row: CaseApproval) => {
  currentCase.value = row;
  approvalForm.value = {
    remark: '',
    status: 'rejected',
  };
  dialogVisible.value = true;
};

const handleUploadAttachments = async () => {
  if (!currentCase.value || fileList.value.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 模拟上传过程
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      uploadProgress.value = i;
    }
    
    // 上传完成，将文件添加到附件列表
    const uploadedTime = new Date().toLocaleString('zh-CN');
    const newAttachments: Attachment[] = fileList.value.map((file, index) => ({
      id: currentCase.value!.attachments?.length ? Math.max(...currentCase.value.attachments.map(a => a.id)) + index + 1 : index + 1,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.name.split('.').pop() || 'file',
      filePath: `/uploads/case/${currentCase.value.id}/file_${Date.now()}_${index}.${file.name.split('.').pop()}`,
      uploadTime: uploadedTime,
      uploader: '当前用户' // 实际应该从登录信息获取
    }));

    if (!currentCase.value.attachments) {
      currentCase.value.attachments = [];
    }
    currentCase.value.attachments.push(...newAttachments);

    // 更新列表数据
    const index = caseList.value.findIndex(c => c.id === currentCase.value?.id);
    if (index !== -1) {
      if (!caseList.value[index].attachments) {
        caseList.value[index].attachments = [];
      }
      caseList.value[index].attachments.push(...newAttachments);
    }

    ElMessage.success(`成功上传 ${fileList.value.length} 个文件`);
    fileList.value = [];
    uploadProgress.value = 0;
  } catch (error) {
    ElMessage.error('文件上传失败');
    console.error('上传失败:', error);
  } finally {
    uploading.value = false;
  }
};

const handleConfirmApproval = async () => {
  if (!currentCase.value) return;

  if (approvalForm.value.status === 'rejected' && !approvalForm.value.remark.trim()) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = caseList.value.findIndex(c => c.id === currentCase.value?.id);
    if (index !== -1) {
      const approvalTime = new Date().toLocaleString('zh-CN');
      caseList.value[index].status = approvalForm.value.status;
      caseList.value[index].approvalTime = approvalTime;
      if (approvalForm.value.remark) {
        caseList.value[index].remark = approvalForm.value.remark;
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
  loadCases();
};

const getCaseTypeName = (type: string) => {
  const item = caseTypes.find(t => t.value === type);
  return item?.label || type;
};

const getPriorityInfo = (priority: string) => {
  const item = priorities.find(p => p.value === priority);
  return item || { label: priority, type: 'info' as const };
};

onMounted(() => {
  loadCases();
});
</script>

<template>
  <div class="case-approval-page p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件审批</span>
          <ElButton type="primary" @click="loadCases">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <div class="mb-4">
        <ElForm :model="searchForm" inline>
          <ElFormItem label="审批状态">
            <ElSelect
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <ElOption
                v-for="(item, key) in statusMap"
                :key="key"
                :label="item.text"
                :value="key"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="案件标题">
            <ElInput
              v-model="searchForm.keyword"
              placeholder="请输入案件标题"
              clearable
              style="width: 220px"
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
        :data="caseList"
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

        <ElTableColumn prop="caseNumber" label="案号" width="150" />

        <ElTableColumn prop="caseTitle" label="案件标题" min-width="220">
          <template #default="{ row }">
            <ElTooltip :content="row.caseTitle" placement="top">
              <span class="truncate-text">{{ row.caseTitle }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="caseType" label="案件类型" width="110">
          <template #default="{ row }">
            <ElTag type="info" size="small">
              {{ getCaseTypeName(row.caseType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="getPriorityInfo(row.priority).type" size="small">
              {{ getPriorityInfo(row.priority).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="submitter" label="提交人" width="100" />

        <ElTableColumn prop="submitTime" label="提交时间" width="170" />

        <ElTableColumn prop="approvalTime" label="审批时间" width="170">
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

      <div v-if="caseList.length === 0 && !loading" class="mt-8">
        <ElEmpty description="暂无案件审批数据" />
      </div>

      <div v-if="caseList.length > 0" class="mt-4 flex justify-end">
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
      :title="currentCase?.status === 'pending' ? '审批案件' : '案件详情'"
      width="1100px"
    >
      <div v-if="currentCase" class="case-detail">
        <!-- 顶部信息板块 -->
        <div class="header-info-section">
          <div class="header-info-item">
            <span class="header-label">案件标题</span>
            <span class="header-value">{{ currentCase.caseTitle }}</span>
          </div>
          <div class="header-info-item">
            <span class="header-label">提交人</span>
            <span class="header-value">{{ currentCase.submitter }}</span>
          </div>
          <div class="header-info-item">
            <span class="header-label">提交时间</span>
            <span class="header-value">{{ currentCase.submitTime }}</span>
          </div>
        </div>

        <!-- 案件基本信息 -->
        <div class="basic-info-section">
          <div class="info-item">
            <span class="info-label">案号</span>
            <span class="info-value">{{ currentCase.caseNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">案件类型</span>
            <ElTag type="info" size="small">
              {{ getCaseTypeName(currentCase.caseType) }}
            </ElTag>
          </div>
          <div class="info-item">
            <span class="info-label">优先级</span>
            <ElTag :type="getPriorityInfo(currentCase.priority).type" size="small">
              {{ getPriorityInfo(currentCase.priority).label }}
            </ElTag>
          </div>
          <div class="info-item">
            <span class="info-label">审批状态</span>
            <ElTag :type="statusMap[currentCase.status].type" size="small">
              {{ statusMap[currentCase.status].text }}
            </ElTag>
          </div>
          <div v-if="currentCase.approvalTime" class="info-item">
            <span class="info-label">审批时间</span>
            <span class="info-value">{{ currentCase.approvalTime }}</span>
          </div>
        </div>

        <!-- 内容区域：案件描述和附件列表左右并排 -->
        <div class="content-section">
          <!-- 左侧：案件描述 -->
          <div class="description-section">
            <div class="section-title">案件描述</div>
            <div class="content-box">
              {{ currentCase.description }}
            </div>
            
            <!-- 审批意见 -->
            <div v-if="currentCase.remark" class="remark-section">
              <div class="section-title">审批意见</div>
              <div class="remark-box">
                {{ currentCase.remark }}
              </div>
            </div>

            <!-- 审批操作 -->
            <div v-if="currentCase.status === 'pending'" class="approval-section">
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
          <div class="attachments-section">
            <div class="section-title">附件列表</div>
            <div class="attachment-content">
              <!-- 附件列表 -->
              <div v-if="currentCase.attachments && currentCase.attachments.length > 0" class="attachment-list">
                <div class="attachment-items">
                  <div 
                    v-for="attachment in currentCase.attachments" 
                    :key="attachment.id"
                    class="attachment-item"
                  >
                    <div class="attachment-info">
                      <div class="attachment-icon">
                        <i v-if="attachment.fileType === 'pdf'" class="i-lucide-file-text"></i>
                        <i v-else-if="attachment.fileType === 'doc' || attachment.fileType === 'docx'" class="i-lucide-file-word"></i>
                        <i v-else-if="attachment.fileType === 'xls' || attachment.fileType === 'xlsx'" class="i-lucide-file-excel"></i>
                        <i v-else-if="attachment.fileType === 'jpg' || attachment.fileType === 'jpeg' || attachment.fileType === 'png'" class="i-lucide-file-image"></i>
                        <i v-else class="i-lucide-file"></i>
                      </div>
                      <div class="attachment-details">
                        <div class="attachment-name">{{ attachment.fileName }}</div>
                        <div class="attachment-meta">
                          <span class="attachment-size">{{ (attachment.fileSize / 1024 / 1024).toFixed(2) }} MB</span>
                          <span class="attachment-uploader">{{ attachment.uploader }}</span>
                          <span class="attachment-time">{{ attachment.uploadTime }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="attachment-actions">
                      <ElButton type="primary" size="small" link>
                        <i class="i-lucide-download mr-1"></i>
                        下载
                      </ElButton>
                      <ElButton type="primary" size="small" link>
                        <i class="i-lucide-eye mr-1"></i>
                        预览
                      </ElButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 附件上传区域 -->
              <div v-if="currentCase.status === 'pending'" class="upload-section">
                <div class="upload-title">上传附件</div>
                <ElUpload
                  v-model:file-list="fileList"
                  :auto-upload="false"
                  :on-change="(file) => console.log('文件选择:', file)"
                  multiple
                  :limit="10"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                >
                  <ElButton type="primary">
                    <i class="i-lucide-upload mr-1"></i>
                    选择文件
                  </ElButton>
                  <template #tip>
                    <div class="upload-tip">
                      支持上传 PDF、Word、Excel、图片等格式，单个文件不超过 10MB，最多上传 10 个文件
                    </div>
                  </template>
                </ElUpload>

                <!-- 上传进度 -->
                <div v-if="uploading" class="upload-progress-container">
                  <ElProgress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
                  <div class="progress-text">
                    {{ uploadProgress === 100 ? '上传完成' : `正在上传... ${uploadProgress}%` }}
                  </div>
                </div>

                <!-- 已选择文件列表 -->
                <div v-if="fileList.length > 0" class="selected-files">
                  <div class="selected-files-title">已选择 {{ fileList.length }} 个文件</div>
                  <div class="selected-file-items">
                    <div v-for="(file, index) in fileList" :key="index" class="selected-file-item">
                      <div class="file-info">
                        <i class="i-lucide-file-text mr-2"></i>
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
                      </div>
                      <ElButton 
                        type="danger" 
                        size="small" 
                        link 
                        @click="fileList.splice(index, 1)"
                      >
                        <i class="i-lucide-trash-2"></i>
                      </ElButton>
                    </div>
                  </div>

                  <div class="upload-actions">
                    <ElButton 
                      type="success" 
                      :loading="uploading" 
                      @click="handleUploadAttachments"
                      :disabled="fileList.length === 0"
                    >
                      <i class="i-lucide-upload-cloud mr-1"></i>
                      开始上传
                    </ElButton>
                    <ElButton 
                      @click="fileList = []" 
                      :disabled="fileList.length === 0 || uploading"
                    >
                      清空选择
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer v-if="currentCase?.status === 'pending'">
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
.case-approval-page {
  .truncate-text {
    display: inline-block;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .case-detail {
    /* 顶部信息板块 */
    .header-info-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 20px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);

      .header-info-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .header-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
        }

        .header-value {
          font-size: 15px;
          color: #ffffff;
          font-weight: 600;
          word-break: break-word;
        }
      }
    }

    /* 案件基本信息 */
    .basic-info-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px;
      margin-bottom: 24px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .info-label {
          font-size: 14px;
          color: #495057;
          font-weight: 500;
          min-width: 80px;
        }

        .info-value {
          font-size: 14px;
          color: #212529;
          font-weight: 600;
        }
      }
    }

    /* 内容区域：左右并排布局 */
    .content-section {
      display: flex;
      gap: 24px;
      align-items: flex-start;

      @media (max-width: 1200px) {
        flex-direction: column;
      }
    }

    /* 左侧：案件描述 */
    .description-section {
      flex: 1;
      min-width: 0;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #667eea;
      }

      .content-box {
        min-height: 120px;
        padding: 16px;
        line-height: 1.8;
        color: #495057;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        margin-bottom: 24px;
      }

      .remark-section {
        margin-bottom: 24px;

        .remark-box {
          padding: 16px;
          line-height: 1.6;
          color: #dc3545;
          background-color: #f8d7da;
          border-radius: 8px;
          border: 1px solid #f5c6cb;
        }
      }

      .approval-section {
        .approval-form-item {
          margin-bottom: 0;
        }
      }
    }

    /* 右侧：附件列表 */
    .attachments-section {
      width: 400px;
      flex-shrink: 0;

      @media (max-width: 1200px) {
        width: 100%;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #667eea;
      }

      .attachment-content {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e9ecef;
      }

      .attachment-list {
        margin-bottom: 20px;

        .attachment-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 14px 16px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
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
          color: #667eea;
          width: 36px;
          text-align: center;
          flex-shrink: 0;
        }

        .attachment-details {
          flex: 1;
          min-width: 0;
        }

        .attachment-name {
          font-size: 14px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .attachment-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #6c757d;

          .attachment-size,
          .attachment-uploader,
          .attachment-time {
            display: flex;
            align-items: center;
          }
        }

        .attachment-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      .upload-section {
        .upload-title {
          font-size: 14px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 12px;
        }

        .upload-tip {
          font-size: 12px;
          color: #6c757d;
          margin-top: 8px;
        }

        .upload-progress-container {
          margin: 16px 0;

          .progress-text {
            text-align: center;
            margin-top: 8px;
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
          }
        }

        .selected-files {
          margin-top: 16px;
          padding: 16px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;

          .selected-files-title {
            font-size: 14px;
            font-weight: 600;
            color: #212529;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #dee2e6;
          }

          .selected-file-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 16px;
          }

          .selected-file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            transition: all 0.2s ease;

            &:hover {
              background: #e9ecef;
            }
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
          }

          .file-name {
            font-size: 13px;
            color: #212529;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            font-size: 12px;
            color: #6c757d;
            flex-shrink: 0;
          }

          .upload-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
        }
      }
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
