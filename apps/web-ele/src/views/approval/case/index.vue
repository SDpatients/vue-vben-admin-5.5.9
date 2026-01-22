<script setup lang="ts">
import type { CaseApproval as ApiCaseApproval } from '#/api/core/approval';

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
  ElTabs,
  ElTabPane,
  ElTooltip,
  ElUpload,
} from 'element-plus';
import { useRouter } from 'vue-router';

import { approvalApi } from '#/api/core/approval';

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
  caseId: number;
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  submitter: string;
  submitTime: string;
  approvalTime?: string;
  status: 'approved' | 'pending' | 'rejected';
  priority: 'high' | 'low' | 'medium';
  description: string;
  remark?: string;
  attachments?: Attachment[];
}

const router = useRouter();
const loading = ref(false);
const caseList = ref<CaseApproval[]>([]);
const dialogVisible = ref(false);
const currentCase = ref<CaseApproval | null>(null);
// 弹窗类型：view-查看详情，approve-审批操作
const dialogType = ref<'view' | 'approve'>('view');
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

// 激活的标签页
const activeTab = ref('caseApproval');

// 跳转到案件详情
const goToCaseDetail = (caseId: number) => {
  router.push(`/law/case-detail/${caseId}`);
};

const caseTypes = [
  { label: '合同纠纷', value: 'contract' },
  { label: '劳动争议', value: 'labor' },
  { label: '房产纠纷', value: 'property' },
  { label: '侵权纠纷', value: 'tort' },
  { label: '婚姻家庭', value: 'family' },
  { label: '其他', value: 'other' },
];

const approvalTypes = {
  CASE_SUBMIT: '案件提交',
  CASE_CLOSE: '案件结案',
  FEE_APPLY: '费用申请',
  EVIDENCE_UPLOAD: '证据上传',
};



const statusMap = {
  pending: { text: '待审批', type: 'warning' as const },
  approved: { text: '已通过', type: 'success' as const },
  rejected: { text: '已驳回', type: 'danger' as const },
};

const approvalStatusMap = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'rejected',
};

// 附件上传相关状态
const fileList = ref<{ file: File; name: string; url: string }[]>([]);
const uploadProgress = ref(0);
const uploading = ref(false);

// 格式化时间为YYYY-MM-DD HH:mm:ss
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取审核类型名称
const getApprovalTypeName = (type: string): string => {
  return approvalTypes[type as keyof typeof approvalTypes] || type;
};

// 转换API响应数据为页面所需格式
const transformApiDataToPageData = (
  apiData: ApiCaseApproval[],
): CaseApproval[] => {
  console.log('[transformApiDataToPageData] 输入数据:', apiData);

  const result = apiData.map((item, index) => {
    console.log(`[transformApiDataToPageData] 处理第${index}项:`, item);

    const transformed = {
      id: item.id,
      caseNumber: item.caseNumber,
      caseTitle: item.approvalTitle || item.caseTitle || item.approvalContent,
      caseType: item.caseType || 'other',
      submitter: item.submitter || '未知提交人',
      submitTime: item.createTime,
      approvalTime: item.approvalDate,
      status:
        approvalStatusMap[
          item.approvalStatus as keyof typeof approvalStatusMap
        ] || 'pending',
      priority: (item.priority as 'high' | 'low' | 'medium') || 'medium',
      description: item.description || item.approvalContent,
      remark: item.remark,
      attachments: item.attachments || [],
    };

    console.log(
      `[transformApiDataToPageData] 第${index}项转换结果:`,
      transformed,
    );
    return transformed;
  });

  console.log('[transformApiDataToPageData] 转换完成，结果:', result);
  return result;
};

const loadCases = async () => {
  loading.value = true;
  try {
    console.log('[loadCases] 开始加载案件列表');

    const approvalStatus = searchForm.value.status
      ? Object.keys(approvalStatusMap).find(
          (key) =>
            approvalStatusMap[key as keyof typeof approvalStatusMap] ===
            searchForm.value.status,
        )
      : '';

    console.log('[loadCases] 请求参数:', {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      approvalStatus: approvalStatus as string,
    });

    const response = await approvalApi.getApprovalList({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      approvalStatus: approvalStatus as string,
      approvalType: approvalType,
      approvalTitle: searchForm.value.keyword || undefined,
    });

    console.log('[loadCases] API响应:', response);

    if (response.code === 200 && response.data) {
      console.log('[loadCases] 原始数据列表:', response.data.list);
      console.log('[loadCases] 开始转换数据...');

      const transformedData = transformApiDataToPageData(response.data.list);
      console.log('[loadCases] 转换后的数据:', transformedData);

      caseList.value = transformedData;
      pagination.value.total = response.data.total || 0;

      console.log('[loadCases] 数据加载成功, 总数:', pagination.value.total);
    } else {
      console.error('[loadCases] 响应状态码不是200:', response);
      ElMessage.error(response.message || '加载案件列表失败');
    }
  } catch (error) {
    console.error('[loadCases] 加载案件列表失败:', error);
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
  dialogType.value = 'view';
  dialogVisible.value = true;
};

const handleApprove = (row: CaseApproval) => {
  currentCase.value = row;
  dialogType.value = 'approve';
  approvalForm.value = {
    remark: '',
    status: 'approved',
  };
  dialogVisible.value = true;
};

const handleReject = (row: CaseApproval) => {
  currentCase.value = row;
  dialogType.value = 'approve';
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      uploadProgress.value = i;
    }

    // 上传完成，将文件添加到附件列表
    const uploadedTime = new Date().toLocaleString('zh-CN');
    const newAttachments: Attachment[] = fileList.value.map((file, index) => ({
      id: currentCase.value!.attachments?.length
        ? Math.max(...currentCase.value.attachments.map((a) => a.id)) +
          index +
          1
        : index + 1,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.name.split('.').pop() || 'file',
      filePath: `/uploads/case/${currentCase.value.id}/file_${Date.now()}_${index}.${file.name.split('.').pop()}`,
      uploadTime: uploadedTime,
      uploader: '当前用户', // 实际应该从登录信息获取
    }));

    if (!currentCase.value.attachments) {
      currentCase.value.attachments = [];
    }
    currentCase.value.attachments.push(...newAttachments);

    // 更新列表数据
    const index = caseList.value.findIndex(
      (c) => c.id === currentCase.value?.id,
    );
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

  if (
    approvalForm.value.status === 'rejected' &&
    !approvalForm.value.remark.trim()
  ) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  loading.value = true;
  try {
    // 执行审批操作
    await approvalApi.approve(currentCase.value.id, {
      approvalResult:
        approvalForm.value.status === 'approved' ? 'PASS' : 'FAIL',
      approvalOpinion: approvalForm.value.remark,
      approverId: 1, // 实际应该从登录信息获取
    });

    // 刷新列表
    await loadCases();

    ElMessage.success(
      approvalForm.value.status === 'approved' ? '审批通过' : '已驳回',
    );
    dialogVisible.value = false;
  } catch (error) {
    console.error('审批失败:', error);
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
  const item = caseTypes.find((t) => t.value === type);
  return item?.label || type;
};

const getPriorityInfo = (priority: string) => {
  const item = priorities.find((p) => p.value === priority);
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
          <ElTabs v-model="activeTab" @tab-change="handleSearch">
            <ElTabPane label="案件审批" name="caseApproval" />
            <ElTabPane label="文件审核" name="fileApproval" />
          </ElTabs>
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
              @change="handleSearch"
            >
              <ElOption
                v-for="(item, key) in statusMap"
                :key="key"
                :label="item.text"
                :value="key"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审核标题">
            <ElInput
              v-model="searchForm.keyword"
              placeholder="请输入审核标题"
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

        <ElTableColumn prop="caseNumber" label="案号" width="150">
          <template #default="{ row }">
            <ElButton 
              type="primary" 
              size="small" 
              link 
              @click="goToCaseDetail(row.caseId)"
            >
              {{ row.caseNumber }}
            </ElButton>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="caseTitle" label="审核标题" min-width="220">
          <template #default="{ row }">
            <ElTooltip :content="row.caseTitle" placement="top">
              <span class="truncate-text">{{ row.caseTitle }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="caseType" label="审核类型" width="110">
          <template #default="{ row }">
            <ElTag type="info" size="small">
              {{ getApprovalTypeName(row.caseType) }}
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

      <div v-if="caseList.length === 0 && !loading" class="mt-8 text-center text-gray-500 py-8">
        暂无数据
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
            <span class="header-label">审核标题</span>
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
            <span class="info-value">
              <ElButton 
                type="primary" 
                size="small" 
                link 
                @click="goToCaseDetail(currentCase.caseId)"
              >
                {{ currentCase.caseNumber }}
              </ElButton>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">审核类型</span>
            <ElTag type="info" size="small">
              {{ getApprovalTypeName(currentCase.caseType) }}
            </ElTag>
          </div>
          <div class="info-item">
            <span class="info-label">优先级</span>
            <ElTag
              :type="getPriorityInfo(currentCase.priority).type"
              size="small"
            >
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
              <div class="section-title">备注</div>
              <div class="remark-box">
                {{ currentCase.remark }}
              </div>
            </div>

            <!-- 审批操作 -->
            <div
              v-if="currentCase.status === 'pending'"
              class="approval-section"
            >
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
              <div
                v-if="
                  currentCase.attachments && currentCase.attachments.length > 0
                "
                class="attachment-list"
              >
                <div class="attachment-items">
                  <div
                    v-for="attachment in currentCase.attachments"
                    :key="attachment.id"
                    class="attachment-item"
                  >
                    <div class="attachment-info">
                      <div class="attachment-icon">
                        <i
                          v-if="attachment.fileType === 'pdf'"
                          class="i-lucide-file-text"
                        ></i>
                        <i
                          v-else-if="
                            attachment.fileType === 'doc' ||
                            attachment.fileType === 'docx'
                          "
                          class="i-lucide-file-word"
                        ></i>
                        <i
                          v-else-if="
                            attachment.fileType === 'xls' ||
                            attachment.fileType === 'xlsx'
                          "
                          class="i-lucide-file-excel"
                        ></i>
                        <i
                          v-else-if="
                            attachment.fileType === 'jpg' ||
                            attachment.fileType === 'jpeg' ||
                            attachment.fileType === 'png'
                          "
                          class="i-lucide-file-image"
                        ></i>
                        <i v-else class="i-lucide-file"></i>
                      </div>
                      <div class="attachment-details">
                        <div class="attachment-name">
                          {{ attachment.fileName }}
                        </div>
                        <div class="attachment-meta">
                          <span class="attachment-size"
                            >{{
                              (attachment.fileSize / 1024 / 1024).toFixed(2)
                            }}
                            MB</span
                          >
                          <span class="attachment-uploader">{{
                            attachment.uploader
                          }}</span>
                          <span class="attachment-time">{{
                            attachment.uploadTime
                          }}</span>
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
              <div
                v-if="currentCase.status === 'pending'"
                class="upload-section"
              >
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
                      支持上传 PDF、Word、Excel、图片等格式，单个文件不超过
                      10MB，最多上传 10 个文件
                    </div>
                  </template>
                </ElUpload>

                <!-- 上传进度 -->
                <div v-if="uploading" class="upload-progress-container">
                  <ElProgress
                    :percentage="uploadProgress"
                    :status="uploadProgress === 100 ? 'success' : undefined"
                  />
                  <div class="progress-text">
                    {{
                      uploadProgress === 100
                        ? '上传完成'
                        : `正在上传... ${uploadProgress}%`
                    }}
                  </div>
                </div>

                <!-- 已选择文件列表 -->
                <div v-if="fileList.length > 0" class="selected-files">
                  <div class="selected-files-title">
                    已选择 {{ fileList.length }} 个文件
                  </div>
                  <div class="selected-file-items">
                    <div
                      v-for="(file, index) in fileList"
                      :key="index"
                      class="selected-file-item"
                    >
                      <div class="file-info">
                        <i class="i-lucide-file-text mr-2"></i>
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size"
                          >({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span
                        >
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

      <!-- 查看详情时只显示取消按钮 -->
      <template #footer v-if="dialogType === 'view'">
        <ElButton @click="dialogVisible = false">取消</ElButton>
      </template>
      
      <!-- 审批操作时根据状态显示不同按钮 -->
      <template #footer v-else-if="dialogType === 'approve'">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        
        <!-- 当审批状态为approved时显示通过按钮 -->
        <ElButton
          v-if="approvalForm.status === 'approved'"
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
        
        <!-- 当审批状态为rejected时显示驳回按钮 -->
        <ElButton
          v-if="approvalForm.status === 'rejected'"
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
