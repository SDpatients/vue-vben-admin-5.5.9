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
} from 'element-plus';
import { useRouter } from 'vue-router';

import { approvalApi, approvalUtils, type ApprovalContentData, type ApprovalAttachmentData } from '#/api/core/approval';
import { downloadFileApi, previewFileApi, downloadFileByPathApi, previewFileByPathApi } from '#/api/core/file';

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadTime: string;
  uploader: string;
}

interface FileItem {
  id: number;
  originalFileName?: string;
  filePath?: string;
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
// 当前选中的任务ID
const selectedTaskId = ref<string | null>(null);
// 图片预览
const previewDialogVisible = ref(false);
const previewImageUrl = ref('');
const previewImageName = ref('');
const approvalForm = ref({
  remark: '',
  status: 'approved' as 'approved' | 'rejected',
});

const contentData = ref<ApprovalContentData | { originalContent: string } | null>(null);
const attachmentData = ref<ApprovalAttachmentData | { originalAttachment: string } | null>(null);
const previewUrls = ref<Record<number, string>>({});
const isLoading = ref(false);

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
  TASK_001: '提交破产申请材料',
  TASK_002: '法院立案形式审查',
  TASK_003: '破产原因实质审查',
  TASK_004: '同步选任管理人',
  TASK_005: '裁定受理并公告',
  TASK_006: '全面接管债务人',
  TASK_007: '调查财产及经营状况',
  TASK_008: '决定合同继续履行或解除',
  TASK_009: '追收债务人财产',
  TASK_010: '通知已知债权人并公告',
  TASK_011: '接收、登记债权申报',
  TASK_012: '审查申报债权并编制债权表',
  TASK_013: '筹备第一次债权人会议',
  TASK_014: '召开会议核查债权与议决事项',
  TASK_015: '表决通过财产变价/分配方案',
  TASK_016: '审查宣告破产条件',
  TASK_017: '裁定宣告债务人破产',
  TASK_018: '拟定并执行财产变价方案',
  TASK_019: '执行破产财产分配',
  TASK_020: '提请终结破产程序',
  TASK_021: '法院裁定并公告',
  TASK_022: '办理企业注销登记',
  TASK_023: '管理人终止执行职务并归档',
};



const statusMap = {
  pending: { text: '待审核', type: 'warning' as const },
  approved: { text: '已通过', type: 'success' as const },
  rejected: { text: '已驳回', type: 'danger' as const },
};

const priorities = [
  { label: '高', value: 'high', type: 'danger' as const },
  { label: '中', value: 'medium', type: 'warning' as const },
  { label: '低', value: 'low', type: 'success' as const },
];

const approvalStatusMap = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'rejected',
};



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
  return apiData.map((item) => ({
    id: item.id,
    caseId: item.caseId,
    caseNumber: item.caseNumber,
    caseTitle: item.approvalTitle || item.caseTitle || item.approvalContent,
    caseType: item.approvalType || 'other',
    submitter: item.realName || '未知提交人',
    submitTime: formatDateTime(item.createTime),
    approvalTime: item.approvalDate ? formatDateTime(item.approvalDate) : undefined,
    status:
      approvalStatusMap[
        item.approvalStatus as keyof typeof approvalStatusMap
      ] || 'pending',
    priority: (item.priority as 'high' | 'low' | 'medium') || 'medium',
    description: item.description || item.approvalContent,
    remark: item.remark,
    attachments: item.attachments || [],
  }));
};

const loadCases = async () => {
  loading.value = true;
  try {
    const approvalStatus = searchForm.value.status
      ? Object.keys(approvalStatusMap).find(
          (key) =>
            approvalStatusMap[key as keyof typeof approvalStatusMap] ===
            searchForm.value.status,
        )
      : '';

    // 根据标签页设置审批类型
    const approvalType = activeTab.value === 'caseApproval' ? 'CASE_SUBMIT' : 'TASK_';

    const response = await approvalApi.getApprovalList({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      approvalStatus: approvalStatus as string,
      approvalType: approvalType,
      approvalTitle: searchForm.value.keyword || undefined,
    });

    // API直接返回data字段的数据
    if (response && response.list) {
      const transformedData = transformApiDataToPageData(response.list);
      caseList.value = transformedData;
      pagination.value.total = response.total || 0;
    } else {
      ElMessage.error('加载案件列表失败');
    }
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

const handleViewDetail = async (row: CaseApproval) => {
  loading.value = true;
  isLoading.value = true;
  try {
    // 调用API获取审批详情
    const approvalDetail = await approvalApi.getApprovalDetail(row.id);
    
    // 更新当前案件数据
    currentCase.value = {
      id: approvalDetail.id,
      caseId: approvalDetail.caseId,
      caseNumber: approvalDetail.caseNumber,
      caseTitle: approvalDetail.approvalTitle || approvalDetail.caseTitle || approvalDetail.approvalContent,
      caseType: approvalDetail.approvalType || 'other',
      submitter: approvalDetail.realName || '未知提交人',
      submitTime: formatDateTime(approvalDetail.createTime),
      approvalTime: approvalDetail.approvalDate ? formatDateTime(approvalDetail.approvalDate) : undefined,
      status: approvalStatusMap[approvalDetail.approvalStatus as keyof typeof approvalStatusMap] || 'pending',
      priority: (approvalDetail.priority as 'high' | 'low' | 'medium') || 'medium',
      description: approvalDetail.approvalContent,
      remark: approvalDetail.remark,
      attachments: approvalDetail.attachments || [],
    };
    
    dialogType.value = 'view';
    
    // 重置解析数据
    contentData.value = null;
    attachmentData.value = null;
    previewUrls.value = {};
    selectedTaskId.value = null;
    
    // 尝试解析 approvalContent 字段
    if (approvalDetail.approvalContent) {
      contentData.value = approvalUtils.parseApprovalContent(approvalDetail.approvalContent);
    }
    
    // 尝试解析 approvalAttachment 字段
    if (approvalDetail.approvalAttachment) {
      console.log('原始附件数据:', approvalDetail.approvalAttachment);
      attachmentData.value = approvalUtils.parseApprovalAttachment(approvalDetail.approvalAttachment);
      console.log('解析后的附件数据:', attachmentData.value);
      
      // 自动选择第一个任务
      if (attachmentData.value && 'files' in attachmentData.value) {
        const taskIds = Object.keys(attachmentData.value.files);
        if (taskIds.length > 0) {
          selectedTaskId.value = taskIds[0];
        }
      }
    } else {
      console.log('无附件数据');
    }
    
    // 先显示弹窗
    dialogVisible.value = true;
    
    // 异步预加载图片
    if (approvalDetail.approvalAttachment) {
      setTimeout(async () => {
        await preloadImages(approvalDetail.id);
        isLoading.value = false;
      }, 100);
    } else {
      isLoading.value = false;
    }
  } catch (error) {
    console.error('获取审批详情失败:', error);
    ElMessage.error('获取审批详情失败');
    isLoading.value = false;
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (row: CaseApproval) => {
  loading.value = true;
  try {
    // 调用API获取审批详情
    const approvalDetail = await approvalApi.getApprovalDetail(row.id);
    
    // 更新当前案件数据
    currentCase.value = {
      id: approvalDetail.id,
      caseId: approvalDetail.caseId,
      caseNumber: approvalDetail.caseNumber,
      caseTitle: approvalDetail.approvalTitle || approvalDetail.caseTitle || approvalDetail.approvalContent,
      caseType: approvalDetail.approvalType || 'other',
      submitter: approvalDetail.realName || '未知提交人',
      submitTime: formatDateTime(approvalDetail.createTime),
      approvalTime: approvalDetail.approvalDate ? formatDateTime(approvalDetail.approvalDate) : undefined,
      status: approvalStatusMap[approvalDetail.approvalStatus as keyof typeof approvalStatusMap] || 'pending',
      priority: (approvalDetail.priority as 'high' | 'low' | 'medium') || 'medium',
      description: approvalDetail.approvalContent,
      remark: approvalDetail.remark,
      attachments: approvalDetail.attachments || [],
    };
    
    dialogType.value = 'approve';
    approvalForm.value = {
      remark: '',
      status: 'approved',
    };
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取审批详情失败:', error);
    ElMessage.error('获取审批详情失败');
  } finally {
    loading.value = false;
  }
};

const handleReject = async (row: CaseApproval) => {
  loading.value = true;
  try {
    // 调用API获取审批详情
    const approvalDetail = await approvalApi.getApprovalDetail(row.id);
    
    // 更新当前案件数据
    currentCase.value = {
      id: approvalDetail.id,
      caseId: approvalDetail.caseId,
      caseNumber: approvalDetail.caseNumber,
      caseTitle: approvalDetail.approvalTitle || approvalDetail.caseTitle || approvalDetail.approvalContent,
      caseType: approvalDetail.approvalType || 'other',
      submitter: approvalDetail.realName || '未知提交人',
      submitTime: formatDateTime(approvalDetail.createTime),
      approvalTime: approvalDetail.approvalDate ? formatDateTime(approvalDetail.approvalDate) : undefined,
      status: approvalStatusMap[approvalDetail.approvalStatus as keyof typeof approvalStatusMap] || 'pending',
      priority: (approvalDetail.priority as 'high' | 'low' | 'medium') || 'medium',
      description: approvalDetail.approvalContent,
      remark: approvalDetail.remark,
      attachments: approvalDetail.attachments || [],
    };
    
    dialogType.value = 'approve';
    approvalForm.value = {
      remark: '',
      status: 'rejected',
    };
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取审批详情失败:', error);
    ElMessage.error('获取审批详情失败');
  } finally {
    loading.value = false;
  }
};



const handleConfirmApproval = async () => {
  if (!currentCase.value) return;

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

// 文件操作函数
const handleDownloadFile = async (fileId: number | null, fileName: string, filePath?: string) => {
  try {
    console.log('handleDownloadFile 参数:', { fileId, fileName, filePath });
    let blob: Blob;
    
    if (filePath && (fileId === null || fileId === 0)) {
      // 旧数据：使用 filePath
      console.log('使用旧数据接口');
      blob = await downloadFileByPathApi(filePath, fileName);
    } else if (fileId !== null && fileId !== 0) {
      // 新数据：使用 fileId
      console.log('使用新数据接口');
      blob = await downloadFileApi(fileId);
    } else {
      throw new Error('文件信息不完整');
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const handlePreviewFile = async (fileId: number | null, filePath?: string) => {
  try {
    console.log('handlePreviewFile 参数:', { fileId, filePath });
    // 检查是否为图片文件
    const file = attachmentData.value?.files[selectedTaskId.value!]?.find(f => f.id === fileId);
    if (file && file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i) && fileId !== null && previewUrls.value[fileId as number]) {
      // 图片文件使用本地预览
      console.log('使用本地图片预览');
      previewImageUrl.value = previewUrls.value[fileId as number];
      previewImageName.value = file.originalFileName || '图片';
      previewDialogVisible.value = true;
    } else if (filePath && (fileId === null || fileId === 0)) {
      // 旧数据：使用 filePath
      console.log('使用旧数据预览接口');
      await previewFileByPathApi(filePath, file?.originalFileName);
    } else if (fileId !== null && fileId !== 0) {
      // 新数据：使用 fileId
      console.log('使用新数据预览接口');
      await previewFileApi(fileId);
    } else {
      throw new Error('文件信息不完整');
    }
  } catch (error) {
    console.error('文件预览失败:', error);
    ElMessage.error('文件预览失败');
  }
};

const canPreviewFile = (fileExtension: string | undefined): boolean => {
  if (!fileExtension) return false;
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv'];
  return previewableTypes.includes(fileExtension.toLowerCase());
};

// 检查缓存
const getCachedImage = (approvalId: number, fileId: number): string | null => {
  try {
    const key = `approval_${approvalId}_file_${fileId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.expiry > Date.now() && data.imageData) {
        return data.imageData;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('读取缓存失败:', error);
  }
  return null;
};

// 缓存图片
const cacheImage = (approvalId: number, fileId: number, imageData: string): void => {
  try {
    const key = `approval_${approvalId}_file_${fileId}`;
    const data = {
      imageData,
      expiry: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('缓存图片失败:', error);
  }
};

// 预加载图片
const preloadImages = async (approvalId: number) => {
  if (!attachmentData.value || !('files' in attachmentData.value)) return;
  
  try {
    // 尝试使用新的批量获取附件接口
    const attachmentsResponse = await approvalApi.getApprovalAttachments(approvalId, {
      includeImages: true,
      includeFiles: true
    });
    
    console.log('批量获取附件成功:', attachmentsResponse);
    
    if (attachmentsResponse && attachmentsResponse.attachments) {
      const { attachments } = attachmentsResponse;
      
      for (const [submissionId, files] of Object.entries(attachments)) {
        for (const file of files) {
          if (file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i) && file.imageData) {
            try {
              // 检查缓存
              const cachedImageData = getCachedImage(approvalId, file.id);
              if (cachedImageData) {
                previewUrls.value[file.id] = cachedImageData;
                console.log('使用缓存图片:', file.id);
                continue;
              }
              
              // 直接使用base64数据
              previewUrls.value[file.id] = file.imageData;
              // 缓存图片
              cacheImage(approvalId, file.id, file.imageData);
              console.log('使用批量接口图片:', file.id);
            } catch (error) {
              console.error('处理批量接口图片失败:', error);
              // 降级到单个文件API
              await loadSingleImage(approvalId, file.id, file.filePath);
            }
          }
        }
      }
      return;
    }
  } catch (error) {
    console.error('调用批量获取附件接口失败:', error);
    // 降级到原有的单个文件加载方式
  }
  
  // 原有逻辑：单个文件加载
  const filesBySubmission = attachmentData.value.files;
  
  for (const [submissionId, files] of Object.entries(filesBySubmission)) {
    for (const file of files) {
      if (file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
        await loadSingleImage(approvalId, file.id, file.filePath);
      }
    }
  }
};

// 加载单个图片
const loadSingleImage = async (approvalId: number, fileId: number | null, filePath?: string) => {
  // 对于旧数据（fileId为null或0），不加载图片预览
  if (fileId === null || fileId === 0) {
    return;
  }
  
  // 先检查缓存
  const cachedImageData = getCachedImage(approvalId, fileId);
  if (cachedImageData) {
    previewUrls.value[fileId] = cachedImageData;
    console.log('使用缓存图片:', fileId);
    return;
  }
  
  try {
    let blob: Blob;
    
    if (filePath) {
      // 旧数据：使用 filePath
      blob = await downloadFileByPathApi(filePath);
    } else {
      // 新数据：使用 fileId
      blob = await downloadFileApi(fileId);
    }
    
    // 将Blob转换为base64字符串
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise<void>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        previewUrls.value[fileId] = base64data;
        // 缓存图片
        cacheImage(approvalId, fileId, base64data);
        console.log('加载并缓存图片:', fileId);
        resolve();
      };
    });
  } catch (error) {
    console.error('加载图片失败:', error);
    // 加载失败时使用默认图标
    previewUrls.value[fileId] = '';
  }
};

onMounted(() => {
  loadCases();
});

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
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

        <ElTableColumn
          prop="status"
          label="审批状态"
          width="120"
          fixed="left"
          align="center"
        >
          <template #default="{ row }">
            <ElTag
              :type="statusMap[row.status].type"
              effect="dark"
              size="large"
              style="font-weight: bold; padding: 8px 12px; font-size: 14px;"
            >
              {{ statusMap[row.status].text }}
            </ElTag>
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
            <div class="tag-container">
              <span class="custom-label">{{ getApprovalTypeName(row.caseType) }}</span>
            </div>
          </template>
        </ElTableColumn>



        <ElTableColumn prop="submitter" label="提交人" width="100" />

        <ElTableColumn prop="submitTime" label="提交时间" width="170" />

        <ElTableColumn prop="approvalTime" label="审批时间" width="170">
          <template #default="{ row }">
            {{ row.approvalTime || '-' }}
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
      width="70vw"
      :fullscreen="false"
    >
      <div v-if="currentCase" class="case-detail">
        <!-- 附件列表 -->
        <div class="attachments-section">
          <div class="section-title">附件列表</div>
          <div class="attachment-content">
            <!-- 任务切换标签栏 -->
            <div v-if="attachmentData && 'files' in attachmentData && Object.keys(attachmentData.files).length > 0" class="task-tabs">
              <ElTabs v-model="selectedTaskId" type="border-card">
                <ElTabPane 
                  v-for="(files, submissionId) in attachmentData.files" 
                  :key="submissionId" 
                  :label="contentData?.task?.taskName || contentData?.submissions?.find(s => s.id.toString() === submissionId)?.submissionTitle || '任务'"
                  :name="submissionId"
                />
              </ElTabs>
            </div>
            
            <!-- 附件列表内容 -->
            <div v-if="attachmentData && 'files' in attachmentData && Object.keys(attachmentData.files).length > 0" class="attachment-list">
              <!-- 当前选中任务的附件 -->
              <div v-if="selectedTaskId && attachmentData.files[selectedTaskId]" class="task-attachments">
                <div class="task-header">
                  <span class="task-title">{{ contentData?.task?.taskName || contentData?.submissions?.find(s => s.id.toString() === selectedTaskId)?.submissionTitle || '任务' }}</span>
                  <span class="file-count">({{ attachmentData.files[selectedTaskId].length }}个文件)</span>
                </div>
                
                <!-- 任务内容 -->
                <div v-if="contentData?.task?.taskDescription || contentData?.submissions?.find(s => s.id.toString() === selectedTaskId)?.submissionContent" class="task-content">
                  <div class="content-label">任务内容：</div>
                  <div class="content-text">{{ contentData?.task?.taskDescription || contentData?.submissions?.find(s => s.id.toString() === selectedTaskId)?.submissionContent }}</div>
                </div>
                
                <!-- 图片文件网格布局 -->
                <div v-if="attachmentData.files[selectedTaskId].some(file => file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i))" class="image-grid">
                  <div 
                    v-for="file in attachmentData.files[selectedTaskId].filter(file => file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i))" 
                    :key="file.id || file.filePath"
                    class="image-item"
                    @click="handlePreviewFile(file.id, file.filePath)"
                  >
                    <div class="image-container">
                      <img 
                        :src="file.id !== null ? (previewUrls[file.id] || '') : ''" 
                        :alt="file.originalFileName"
                        @error="(e) => { e.target.src = ''; e.target.alt = '图片加载失败'; }"
                      />
                      <div v-if="file.id !== null && !previewUrls[file.id]" class="image-loading">
                        <div class="loading-spinner"></div>
                      </div>
                    </div>
                    <div class="image-name">{{ file.originalFileName || '未知文件' }}</div>
                  </div>
                </div>
                
                <!-- 非图片文件列表 -->
                <div v-if="attachmentData.files[selectedTaskId].some(file => !file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i))" class="non-image-files">
                  <div class="section-subtitle">其他文件</div>
                  <div 
                    v-for="file in attachmentData.files[selectedTaskId].filter(file => !file.originalFileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i))" 
                    :key="file.id || file.filePath"
                    class="file-item"
                  >
                    <div class="file-info">
                      <div class="file-icon">
                        <i v-if="file.originalFileName?.includes('.pdf')" class="i-lucide-file-text"></i>
                        <i v-else-if="file.originalFileName?.includes('.doc')" class="i-lucide-file-word"></i>
                        <i v-else-if="file.originalFileName?.includes('.xls')" class="i-lucide-file-excel"></i>
                        <i v-else class="i-lucide-file"></i>
                      </div>
                      <div class="file-details">
                        <div class="file-name">{{ file.originalFileName || '未知文件' }}</div>
                        <div class="file-meta">
                          <span>0 B</span>
                          <span>{{ file.originalFileName ? file.originalFileName.split('.').pop() || '未知' : '未知' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="file-actions">
                      <ElButton 
                        type="primary" 
                        size="small" 
                        link 
                        @click.stop="handlePreviewFile(file.id, file.filePath)"
                      >
                        <i class="i-lucide-eye mr-1"></i>
                        预览
                      </ElButton>
                      <ElButton 
                        type="primary" 
                        size="small" 
                        link 
                        @click.stop="handleDownloadFile(file.id, file.originalFileName || '未知文件', file.filePath)"
                      >
                        <i class="i-lucide-download mr-1"></i>
                        下载
                      </ElButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 解析失败的原始附件内容 -->
            <div v-else-if="attachmentData && 'originalAttachment' in attachmentData" class="content-box">
              {{ attachmentData.originalAttachment }}
            </div>
            
            <!-- 原始附件列表（仅当解析失败时显示） -->
            <div v-else-if="currentCase.attachments && currentCase.attachments.length > 0" class="attachment-list">
              <div class="attachment-items">
                <div v-for="attachment in currentCase.attachments" :key="attachment.id" class="attachment-item">
                  <div class="attachment-info">
                    <div class="attachment-icon">
                      <i v-if="attachment.fileType === 'pdf'" class="i-lucide-file-text"></i>
                      <i v-else-if="['doc', 'docx'].includes(attachment.fileType)" class="i-lucide-file-word"></i>
                      <i v-else-if="['xls', 'xlsx'].includes(attachment.fileType)" class="i-lucide-file-excel"></i>
                      <i v-else-if="['jpg', 'jpeg', 'png', 'gif'].includes(attachment.fileType)" class="i-lucide-file-image"></i>
                      <i v-else class="i-lucide-file"></i>
                    </div>
                    <div class="attachment-details">
                      <div class="attachment-name">{{ attachment.fileName }}</div>
                      <div class="attachment-meta">
                        <span class="attachment-size">{{ (attachment.fileSize / 1024 / 1024).toFixed(2) }} MB</span>
                        <span class="attachment-type">{{ attachment.fileType }}</span>
                        <span class="attachment-time">{{ attachment.uploadTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <ElButton type="primary" size="small" link @click="handleDownloadFile(attachment.id, attachment.fileName, attachment.filePath)">
                      <i class="i-lucide-download mr-1"></i>
                      下载
                    </ElButton>
                    <ElButton type="primary" size="small" link @click="handlePreviewFile(attachment.id, attachment.filePath)">
                      <i class="i-lucide-eye mr-1"></i>
                      预览
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 无附件提示 -->
            <div v-else class="no-attachments">
              <ElEmpty description="暂无附件" />
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
                placeholder="请输入审批意见（可选）"
              />
            </ElFormItem>
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

    <!-- 图片预览弹窗 -->
    <ElDialog
      v-model="previewDialogVisible"
      :title="previewImageName"
      width="70vw"
      top="20px"
    >
      <div class="image-preview-container">
        <img 
          :src="previewImageUrl" 
          :alt="previewImageName"
          class="preview-image"
        />
      </div>
      <template #footer>
        <ElButton @click="previewDialogVisible = false">关闭</ElButton>
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

    .tag-container {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      text-align: left;
    }

    .custom-label {
      display: block;
      font-size: 14px;
      color: #333;
      font-weight: 500;
      padding: 0;
      margin: 0;
      line-height: normal;
      text-align: left;
    }

  .case-detail {
    /* 附件列表 */
    .attachments-section {
      width: 100%;

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
        margin-bottom: 20px;
      }

      .attachment-list {
        margin-bottom: 20px;

        .attachment-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 500px;
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

      .no-attachments {
        padding: 40px 20px;
        text-align: center;
      }

      .task-title {
        font-weight: 600;
        color: #212529;
        margin-right: 8px;
      }

      .file-count {
        font-size: 13px;
        color: #6c757d;
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

      /* 任务切换标签栏 */
      .task-tabs {
        margin-bottom: 20px;
      }

      /* 任务附件 */
      .task-attachments {
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        overflow: hidden;
      }

      .task-header {
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* 任务内容 */
      .task-content {
        padding: 12px 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e4e7ed;
        line-height: 1.6;
      }

      .content-label {
        font-size: 14px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 4px;
      }

      .content-text {
        font-size: 14px;
        color: #495057;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* 图片网格布局 */
      .image-grid {
        padding: 16px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }

      @media (max-width: 768px) {
        .image-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 480px) {
        .image-grid {
          grid-template-columns: 1fr;
        }
      }

      .image-item {
        background: #f8f9fa;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .image-item:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      .image-container {
        width: 100%;
        aspect-ratio: 1/1;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        background: #fff;
        margin-bottom: 8px;
      }

      .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* 图片预览弹窗 */
      .image-preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        min-height: 50vh;
      }

      .preview-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
      }

      .image-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #667eea;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .image-name {
        font-size: 13px;
        font-weight: 500;
        color: #212529;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* 非图片文件 */
      .non-image-files {
        padding: 16px;
        border-top: 1px solid #e4e7ed;
      }

      .section-subtitle {
        font-size: 14px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e9ecef;
      }

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        background: #fafafa;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .file-icon {
        font-size: 20px;
        color: #667eea;
      }

      .file-details {
        flex: 1;
        min-width: 0;
      }

      .file-name {
        font-size: 14px;
        font-weight: 500;
        color: #212529;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-meta {
        font-size: 12px;
        color: #909399;
        display: flex;
        gap: 12px;
      }

      .file-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      /* 审批操作 */
      .approval-section {
        margin-top: 20px;
        width: 100%;

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #667eea;
        }

        .approval-form-item {
          margin-bottom: 0;
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
