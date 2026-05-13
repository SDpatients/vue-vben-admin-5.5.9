<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
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
  ElTag,
} from 'element-plus';

import FileUpload from '../case-detail/components/FileUpload.vue';

import {
  createAnnouncementApi,
  createAnnouncementWithFilesApi,
  createViewRecordApi,
  getAnnouncementAttachmentsApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  uploadAnnouncementAttachmentsApi,
} from '#/api/core/case-announcement';
import { downloadFileApi } from '#/api/core/file';
import { sanitizeHtml } from '#/utils/htmlSanitizer';
import { fileUploadRequestClient, workTeamRequestClient } from '#/api/request';

interface Announcement {
  id: number;
  caseId: number;
  title: string;
  content: string;
  announcementType: string;
  status: string;
  publisherId: number;
  publisherName: string;
  publishTime: string;
  viewCount: number;
  isTop: boolean;
  topExpireTime: string;
  attachments: any[];
  createTime: string;
  updateTime: string;
}

const announcements = ref<Announcement[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 案号选择相关
const caseOptions = ref<any[]>([]);
const selectedCaseId = ref<number | null>(null);

// 展开状态管理
const expandedAnnouncements = ref<Record<number, boolean>>({});

// 切换展开/收起状态
const toggleExpand = (announcementId: number) => {
  expandedAnnouncements.value[announcementId] = !expandedAnnouncements.value[announcementId];
};

// 获取案号列表
const fetchCaseList = async () => {
  try {
    // 使用项目配置的API客户端，确保路径正确且带有认证信息
    const response = await workTeamRequestClient.get('/case/simple-list', {
      params: {
        page: 1,
        size: 10000
      }
    });
    if (response.code === 200) {
      caseOptions.value = response.data.list || [];
    }
  } catch (error) {
    console.error('获取案号列表失败:', error);
  }
};

// 处理案号选择变化
const handleCaseChange = (caseId: number | null) => {
  selectedCaseId.value = caseId;
  currentPage.value = 1; // 重置页码
  fetchAnnouncements(); // 重新获取公告列表
};

// 处理发布表单中的案件选择变化
const handlePublishFormCaseChange = (caseId: number) => {
  const selectedCase = caseOptions.value.find(c => c.id === caseId);
  if (selectedCase) {
    publishForm.value.caseNumber = selectedCase.caseNumber || '';
    publishForm.value.principalOfficer = selectedCase.principalOfficer || '';
  } else {
    publishForm.value.caseNumber = '';
    publishForm.value.principalOfficer = '';
  }
};

const showDetailDialog = ref(false);
const currentAnnouncement = ref<Announcement | null>(null);
const detailLoading = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewIsImage = ref(false);
const previewIsPdf = ref(false);
const previewFileName = ref('');

const announcementImageUrls = ref<Record<number, string>>({});

const loadAnnouncementImage = async (fileId: number) => {
  if (announcementImageUrls.value[fileId]) return;
  try {
    const blob = await fileUploadRequestClient.get<Blob>(
      `/api/v1/file/preview/${fileId}`,
      { responseType: 'blob' },
    );
    announcementImageUrls.value[fileId] = URL.createObjectURL(blob);
  } catch {
    // ignore
  }
};

const getAnnouncementImageUrl = (fileId: number): string => {
  return announcementImageUrls.value[fileId] || '';
};

const isImageAttachment = (attachment: { file_name?: string; name?: string; type?: string }) => {
  const fileName = attachment.file_name || attachment.name || '';
  const mimeType = attachment.type || '';
  if (mimeType && mimeType.startsWith('image/')) return true;
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext);
};

// 发布公告相关
const showPublishDialog = ref(false);
const publishLoading = ref(false);
const publishForm = ref({
  caseId: 0,
  caseNumber: '',
  principalOfficer: '',
  title: '',
  content: '',
  announcementType: 'ANNOUNCEMENT' as 'ANNOUNCEMENT' | 'NOTICE' | 'WARNING',
  attachments: [] as any[],
});
const publishFormRef = ref<InstanceType<typeof ElForm>>();
const fileUploadRef = ref<any>();

// 手机上传相关
interface LocalFileItem {
  file: File;
  id: string;
  originalFileName: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  uploadTime: string;
}

const announcementTypeMap: Record<string, { label: string; type: string }> = {
  ANNOUNCEMENT: { label: '公告', type: 'info' },
  NOTICE: { label: '通知', type: 'warning' },
  WARNING: { label: '警告', type: 'danger' },
};

const statusMap: Record<string, { label: string; type: string }> = {
  DRAFT: { label: '草稿', type: 'info' },
  PUBLISHED: { label: '已发布', type: 'success' },
  REVOKED: { label: '已撤回', type: 'warning' },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    // 构建请求参数
    const requestParams: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };

    // 如果选择了案号，添加caseId参数
    if (selectedCaseId.value !== null && selectedCaseId.value > 0) {
      requestParams.caseId = selectedCaseId.value;
    }

    const response = await getAnnouncementListApi(requestParams);
    if (response.code === 200) {
      const list = response.data.list || [];
      // 排序：置顶优先，然后按发布时间倒序
      announcements.value = list.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return new Date(b.publishTime || b.createTime).getTime() - new Date(a.publishTime || a.createTime).getTime();
      });
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.message || '未知错误'}`);
      announcements.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
    announcements.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const viewAnnouncementDetail = async (announcement: Announcement) => {
  detailLoading.value = true;
  showDetailDialog.value = true;
  currentAnnouncement.value = announcement;

  try {
    // 调用添加查看记录接口（不阻塞主流程）
    createViewRecordApi({
      announcementId: announcement.id,
      announcementTitle: announcement.title,
      caseId: announcement.caseId,
    }).catch((err) => {
      console.warn('创建查看记录失败:', err);
    });

    const [detailResponse, attachmentsResponse] = await Promise.all([
      getAnnouncementDetailApi(announcement.id),
      getAnnouncementAttachmentsApi(announcement.id),
    ]);

    if (detailResponse.code === 200) {
      const data = detailResponse.data;
      data.attachments = [];

      if (attachmentsResponse.code === 200 && attachmentsResponse.data) {
        data.attachments = attachmentsResponse.data.map((attach: any) => ({
          file_name: attach.originalFileName || '未知文件',
          file_id: attach.id,
          type: attach.mimeType || 'application/octet-stream',
        }));
      }

      currentAnnouncement.value = data;

      if (data.attachments && data.attachments.length > 0) {
        for (const attach of data.attachments) {
          if (isImageAttachment(attach) && attach.file_id) {
            loadAnnouncementImage(Number(attach.file_id));
          }
        }
      }
    }
  } catch (error) {
    console.error('获取公告详情失败:', error);
    ElMessage.error('获取公告详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAnnouncements();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchAnnouncements();
};

/**
 * 下载文件
 */
const downloadFile = async (attachment: {
  file_id: string;
  file_name: string;
  file_url?: string;
}) => {
  if (!attachment.file_id) {
    ElMessage.error('无效的文件ID');
    return;
  }

  const fileId = Number(attachment.file_id);
  if (isNaN(fileId)) {
    ElMessage.error('文件ID格式错误');
    return;
  }

  try {
    ElMessage.info('正在下载文件...');
    // 使用后端提供的下载接口
    const downloadResponse = await downloadFileApi(fileId);

    // 创建下载链接
    const blob = new Blob([downloadResponse], {
      type: downloadResponse.type || 'application/octet-stream',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = attachment.file_name || '下载文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('文件下载完成');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

/**
 * 打开文件预览
 */
const previewFile = async (attachment: {
  file_id: string;
  file_name: string;
  name?: string;
  type?: string;
}) => {
  if (!attachment.file_id) {
    ElMessage.error('无效的文件ID');
    return;
  }

  const fileId = Number(attachment.file_id);
  if (isNaN(fileId)) {
    ElMessage.error('文件ID必须是数字');
    return;
  }

  const fileName = attachment.file_name || attachment.name || '';
  const mimeType = attachment.type || '';

  previewIsImage.value = false;
  previewIsPdf.value = false;
  previewFileName.value = fileName;

  const ext = fileName.toLowerCase().split('.').pop() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];

  try {
    ElMessage.info('正在加载文件...');

    const response = await fileUploadRequestClient.get(
      `/api/v1/file/preview/${fileId}`,
      {
        responseType: 'blob',
      },
    );

    const blob = new Blob([response], {
      type: response.type || 'application/octet-stream',
    });

    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl.value);
    }

    previewUrl.value = window.URL.createObjectURL(blob);

    if (imageExts.includes(ext) || (mimeType && mimeType.startsWith('image/')) || (blob.type && blob.type.startsWith('image/'))) {
      previewIsImage.value = true;
    } else if (ext === 'pdf' || mimeType === 'application/pdf' || blob.type === 'application/pdf') {
      previewIsPdf.value = true;
    }

    showPreviewDialog.value = true;
    ElMessage.success('文件加载成功');
  } catch (error) {
    console.error('文件预览失败:', error);
    ElMessage.error('文件预览失败，请检查文件是否存在或权限是否足够');
  }
};

/**
 * 关闭文件预览对话框
 */
const closePreviewDialog = () => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  previewIsImage.value = false;
  previewIsPdf.value = false;
  previewFileName.value = '';
  showPreviewDialog.value = false;
};

/**
 * 复制附件数据
 */
const copyAttachmentData = () => {
  if (currentAnnouncement.value?.attachments) {
    const textToCopy = typeof currentAnnouncement.value.attachments === 'string'
      ? currentAnnouncement.value.attachments
      : JSON.stringify(currentAnnouncement.value.attachments);
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        ElMessage.success('附件数据已复制到剪贴板');
      })
      .catch((error) => {
        console.error('复制失败:', error);
        ElMessage.error('复制失败，请手动复制');
      });
  }
};

// 打开发布公告对话框
const openPublishDialog = () => {
  // 重置表单
  publishForm.value = {
    caseId: 0,
    caseNumber: '',
    principalOfficer: '',
    title: '',
    content: '',
    announcementType: 'ANNOUNCEMENT',
    attachments: [],
  };
  // 重置文件上传组件
  fileUploadRef.value?.clearLocalFiles?.();
  showPublishDialog.value = true;
};



// 关闭发布公告对话框
const closePublishDialog = () => {
  showPublishDialog.value = false;
};

// 处理本地文件变化
const handleLocalFilesChange = (files: LocalFileItem[]) => {
  console.log('📁 [调试] ========== handleLocalFilesChange 被调用 ==========');
  console.log('📁 [调试] 接收到的文件数量:', files.length);
  console.log('📁 [调试] 接收到的文件详情:', files.map(f => ({
    id: f.id,
    name: f.originalFileName,
    hasFile: !!f.file,
    fileSize: f.fileSize,
  })));
  
  publishForm.value.attachments = files;
  console.log('📁 [调试] publishForm.value.attachments 已更新');
  console.log('📁 [调试] 当前 attachments 数量:', publishForm.value.attachments.length);
  console.log('📁 [调试] ========== handleLocalFilesChange 结束 ==========');
};

// 测试：手动触发事件
const testEvent = () => {
  console.log('🧪 [调试] 测试：手动触发 handleLocalFilesChange');
  handleLocalFilesChange([
    {
      file: new File(['test'], 'test.txt'),
      id: 'test-123',
      originalFileName: 'test.txt',
      fileSize: 4,
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadTime: new Date().toISOString(),
    },
  ]);
};

// 处理手机上传文件
const handleMobileFilesUploaded = (files: any[]) => {
  console.log('📱 [调试] 手机上传了文件:', {
    filesCount: files.length,
    files: files.map(f => ({
      id: f.id,
      name: f.originalFileName,
      size: f.fileSize,
    })),
  });
  ElMessage.success(`手机上传了 ${files.length} 个文件`);
};

// 提交发布公告表单 - 统一流程
const submitPublishForm = async () => {
  console.log('🚀 [调试] 开始提交公告表单');
  console.log('📋 [调试] 当前表单数据:', {
    caseId: publishForm.value.caseId,
    caseNumber: publishForm.value.caseNumber,
    principalOfficer: publishForm.value.principalOfficer,
    title: publishForm.value.title,
  });
  
  if (!publishFormRef.value) {
    console.error('表单引用不存在');
    return;
  }

  try {
    await publishFormRef.value.validate();
    console.log('表单验证通过');
  } catch (error) {
    console.error('表单验证失败:', error);
    ElMessage.error('请填写必填项');
    return;
  }

  publishLoading.value = true;
  
  try {
    // 分离手机上传文件和本地文件
    console.log('📂 [调试] 当前附件总数:', publishForm.value.attachments.length);
    console.log('📂 [调试] 附件详情:', publishForm.value.attachments.map((f: LocalFileItem) => ({
      id: f.id,
      name: f.originalFileName,
      size: f.fileSize,
      idType: typeof f.id,
      isMobile: f.id.startsWith('mobile-'),
      hasFile: !!f.file,
    })));
    
    const mobileFiles = publishForm.value.attachments.filter((f: LocalFileItem) => {
      const isMobile = f.id.startsWith('mobile-');
      console.log(`🔍 [调试] 检查文件 ${f.originalFileName}: id=${f.id}, isMobile=${isMobile}`);
      return isMobile;
    });
    
    const localFiles = publishForm.value.attachments.filter((f: LocalFileItem) => {
      const isLocal = !f.id.startsWith('mobile-');
      console.log(`🔍 [调试] 检查文件 ${f.originalFileName}: id=${f.id}, isLocal=${isLocal}`);
      return isLocal;
    });
    
    const existingFiles = publishForm.value.attachments.filter((f: LocalFileItem) => {
      const isExisting = !f.id.startsWith('mobile-') && typeof f.id === 'number';
      return isExisting;
    });

    console.log('📊 [调试] 文件分类结果:', {
      mobileFilesCount: mobileFiles.length,
      localFilesCount: localFiles.length,
      existingFilesCount: existingFiles.length,
      mobileFiles: mobileFiles.map(f => f.originalFileName),
      localFiles: localFiles.map(f => f.originalFileName),
    });

      console.log('➕ [调试] 进入新增模式');
      
      // 检查是否有文件需要上传
      const hasFiles = mobileFiles.length > 0 || localFiles.length > 0;
      console.log('📊 [调试] 文件检查:', {
        hasFiles,
        mobileFilesCount: mobileFiles.length,
        localFilesCount: localFiles.length,
        localFilesDetails: localFiles.map(f => ({
          id: f.id,
          name: f.originalFileName,
          hasFile: !!f.file,
          fileSize: f.fileSize,
        })),
      });
      
      if (hasFiles) {
        // 使用 with-files 接口一次性创建公告并上传文件
        console.log('📦 [调试] 使用 with-files 接口创建公告并上传文件');
        
        const formData = new FormData();
        formData.append('caseId', String(publishForm.value.caseId));
        formData.append('caseNumber', publishForm.value.caseNumber);
        formData.append('principalOfficer', publishForm.value.principalOfficer);
        formData.append('title', publishForm.value.title);
        formData.append('content', publishForm.value.content);
        formData.append('announcementType', publishForm.value.announcementType);
        
        console.log('📝 [调试] FormData 基本信息:', {
          caseId: publishForm.value.caseId,
          caseNumber: publishForm.value.caseNumber,
          title: publishForm.value.title,
          announcementType: publishForm.value.announcementType,
        });
        
        // 添加本地文件
        if (localFiles.length > 0) {
          console.log('💻 [调试] 添加本地文件到 FormData, 文件数量:', localFiles.length);
          localFiles.forEach((file, index) => {
            console.log(`🔍 [调试] 检查文件 ${index + 1}/${localFiles.length}:`, {
              id: file.id,
              name: file.originalFileName,
              hasFile: !!file.file,
              fileSize: file.fileSize,
            });
            
            if (file.file) {
              formData.append('files', file.file);
              console.log('  ✅ [调试] 成功添加文件到 FormData:', file.originalFileName, '大小:', file.fileSize);
            } else {
              console.error('  ❌ [调试] 文件对象为空，无法添加:', file.originalFileName);
            }
          });
          
          // 验证 FormData 中的文件
          console.log('📋 [调试] FormData 中的文件数量:', formData.getAll('files').length);
          formData.getAll('files').forEach((f: any, i) => {
            console.log(`  📎 [调试] FormData 文件 ${i + 1}:`, {
              name: f.name,
              size: f.size,
              type: f.type,
            });
          });
        } else {
          console.log('⚠️ [调试] localFiles.length 为 0，没有本地文件需要上传');
        }
        
        // 处理手机上传的文件
        if (mobileFiles.length > 0) {
          console.log('📱 [调试] 检测到手机上传文件，使用两步走方案');

          const announcementResponse = await createAnnouncementApi({
            caseId: publishForm.value.caseId,
            caseNumber: publishForm.value.caseNumber,
            principalOfficer: publishForm.value.principalOfficer,
            title: publishForm.value.title,
            content: publishForm.value.content,
            announcementType: publishForm.value.announcementType,
          });

          if (announcementResponse.code !== 200 || !announcementResponse.data) {
            ElMessage.error(`公告创建失败：${announcementResponse.message || '未知错误'}`);
            publishLoading.value = false;
            return;
          }

          const announcementId = announcementResponse.data.announcementId || announcementResponse.data.id;

          // 转移手机上传的文件
          if (fileUploadRef.value && announcementId) {
            await fileUploadRef.value.transferMobileFiles(announcementId);
          }

          // 如果还有本地文件，继续上传
          if (localFiles.length > 0) {
            const localFileItems = localFiles.filter((f: LocalFileItem) => !!f.file && f.file.size > 0);
            if (localFileItems.length > 0) {
              const uploadFormData = new FormData();
              localFileItems.forEach((file: LocalFileItem) => {
                uploadFormData.append('files', file.file);
              });
              await uploadAnnouncementAttachmentsApi(announcementId, localFileItems.map((f: LocalFileItem) => f.file));
            }
          }

          ElMessage.success('公告发布成功');
          closePublishDialog();
          fetchAnnouncements();
          publishLoading.value = false;
          return;
        }
        
        // 只有本地文件时，使用 with-files 接口
        console.log('⏳ [调试] 开始调用 createAnnouncementWithFilesApi');
        console.log('📋 [调试] FormData 最终状态:', {
          caseId: formData.get('caseId'),
          caseNumber: formData.get('caseNumber'),
          title: formData.get('title'),
          content: formData.get('content'),
          announcementType: formData.get('announcementType'),
          filesCount: formData.getAll('files').length,
        });
        
        const response = await createAnnouncementWithFilesApi(formData);
        console.log('📥 [调试] createAnnouncementWithFilesApi 响应:', response);
        
        if (response.code === 200 && response.data) {
          console.log('✅ [调试] 公告创建并文件上传成功');
          ElMessage.success('公告发布成功');
          closePublishDialog();
          fetchAnnouncements();
        } else {
          console.error('❌ [调试] 公告创建失败:', response);
          ElMessage.error(`公告创建失败：${response.message || '未知错误'}`);
        }
      } else {
        // 没有文件，使用普通接口创建
        console.log('📝 [调试] 没有文件，使用普通接口创建公告');
        const announcementResponse = await createAnnouncementApi({
          caseId: publishForm.value.caseId,
          caseNumber: publishForm.value.caseNumber,
          principalOfficer: publishForm.value.principalOfficer,
          title: publishForm.value.title,
          content: publishForm.value.content,
          announcementType: publishForm.value.announcementType,
        });
        console.log('📥 [调试] createAnnouncementApi 响应:', announcementResponse);

        if (announcementResponse.code !== 200 || !announcementResponse.data) {
          console.error('❌ [调试] 公告创建失败:', announcementResponse);
          ElMessage.error(`公告创建失败：${announcementResponse.message || '未知错误'}`);
          publishLoading.value = false;
          return;
        }

        console.log('✅ [调试] 公告创建成功');
        ElMessage.success('公告发布成功');
        closePublishDialog();
        fetchAnnouncements();
      }
  } catch (error) {
    console.error('发布公告失败:', error);
    ElMessage.error('发布公告失败，请稍后重试');
  } finally {
    publishLoading.value = false;
  }
};

onMounted(() => {
  fetchCaseList(); // 先获取案号列表
  // 从URL参数获取caseId
  const urlParams = new URLSearchParams(window.location.search);
  const caseIdParam = urlParams.get('caseId');
  if (caseIdParam) {
    const caseId = Number(caseIdParam);
    if (!isNaN(caseId) && caseId > 0) {
      selectedCaseId.value = caseId;
    }
  }
  fetchAnnouncements(); // 再获取公告列表
});
</script>

<template>
  <div class="announcement-list-wrapper">
    <div class="announcement-container">
      <ElCard shadow="hover">
        <template #header>
          <div class="card-header flex flex-col items-start justify-between w-full">
            <div class="flex items-center w-full justify-between mb-4">
              <div class="flex items-center">
                <Icon icon="lucide:bell" class="mr-2" />
                <span class="text-lg font-semibold">公告列表</span>
              </div>
            </div>
            <div class="w-full">
              <ElSelect
                v-model="selectedCaseId"
                placeholder="请选择案号"
                filterable
                clearable
                style="width: 250px"
                @change="handleCaseChange"
                @clear="handleCaseChange(null)"
              >
                <ElOption
                  v-for="caseItem in caseOptions"
                  :key="caseItem.id"
                  :label="caseItem.caseName"
                  :value="caseItem.id"
                >
                  <div class="flex flex-col">
                    <span>{{ caseItem.caseName }}</span>
                    <span class="text-xs text-gray-500">{{ caseItem.caseNumber }}</span>
                  </div>
                </ElOption>
              </ElSelect>
            </div>
          </div>
        </template>

        <div v-loading="loading" class="announcement-list">
          <!-- 加载中状态：显示骨架屏占位 -->
          <template v-if="loading">
            <div
              v-for="i in 3"
              :key="i"
              class="announcement-item skeleton-item"
            >
              <div class="announcement-header">
                <div class="title-section">
                  <div class="skeleton skeleton-title"></div>
                  <div class="skeleton skeleton-tag ml-2"></div>
                  <div class="skeleton skeleton-tag ml-2"></div>
                </div>
                <div class="skeleton skeleton-button"></div>
              </div>
              <div class="announcement-meta">
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-meta"></div>
              </div>
            </div>
          </template>

          <!-- 空数据状态 -->
          <div v-else-if="announcements.length === 0" class="empty-state">
            <ElEmpty description="暂无公告" />
          </div>

          <!-- 有数据状态 -->
          <template v-else>
            <div
              v-for="item in announcements"
              :key="item.id"
              class="announcement-item"
              :class="{ 'is-top': item.isTop }"
            >
              <div class="announcement-header">
                <div class="title-section">
                  <Icon v-if="item.isTop" icon="lucide:pin" class="top-icon" />
                  <h3 class="announcement-title">{{ item.title }}</h3>
                  <ElTag
                    :type="announcementTypeMap[item.announcementType]?.type || 'info'"
                    size="small"
                    class="ml-2"
                  >
                    {{ announcementTypeMap[item.announcementType]?.label || '公告' }}
                  </ElTag>
                  <ElTag
                    :type="statusMap[item.status]?.type || 'info'"
                    size="small"
                    class="status-tag ml-2"
                  >
                    {{ statusMap[item.status]?.label || item.status }}
                  </ElTag>
                </div>
                <div class="flex gap-2">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="viewAnnouncementDetail(item)"
                  >
                    查看详情
                  </ElButton>
                </div>
              </div>

              <!-- 公告内容 -->
              <div class="announcement-content">
                <div
                  class="content-preview"
                  :class="{ full: expandedAnnouncements[item.id] }"
                  v-html="sanitizeHtml(item.content)"
                ></div>
                <button
                  v-if="item.content && item.content.length > 100"
                  class="expand-btn"
                  @click="toggleExpand(item.id)"
                >
                  {{ expandedAnnouncements[item.id] ? '收起' : '展开' }}
                </button>
              </div>

              <div class="announcement-meta">
                <div class="meta-item">
                  <Icon icon="lucide:user" class="icon" />
                  <span>发布人：{{ item.publisherName || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <Icon icon="lucide:calendar" class="icon" />
                  <span>发布时间：{{ item.publishTime ? formatDate(item.publishTime) : '未发布' }}</span>
                </div>
                <div class="meta-item">
                  <Icon icon="lucide:eye" class="icon" />
                  <span>浏览次数：{{ item.viewCount || 0 }}</span>
                </div>
              </div>
            </div>

            <div v-if="total > 0" class="pagination-container">
              <ElPagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handlePageSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </template>
        </div>
      </ElCard>

      <!-- 公告详情对话框 -->
      <ElDialog
        v-model="showDetailDialog"
        :title="currentAnnouncement?.title || '公告详情'"
        width="70%"
        destroy-on-close
        @close="fetchAnnouncements"
      >
        <div v-loading="detailLoading" class="announcement-detail-container">
          <div v-if="currentAnnouncement" class="detail-content">
            <!-- 元信息区域 -->
            <div class="detail-meta">
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">公告类型</span>
                  <ElTag
                    :type="announcementTypeMap[currentAnnouncement.announcementType]?.type || 'info'"
                    size="small"
                  >
                    {{ announcementTypeMap[currentAnnouncement.announcementType]?.label || '公告' }}
                  </ElTag>
                </div>
                <div class="meta-item">
                  <span class="meta-label">状态</span>
                  <ElTag
                    :type="statusMap[currentAnnouncement.status]?.type || 'info'"
                    size="small"
                  >
                    {{ statusMap[currentAnnouncement.status]?.label || currentAnnouncement.status }}
                  </ElTag>
                </div>
                <div class="meta-item">
                  <span class="meta-label">发布人</span>
                  <span class="meta-value">{{
                    currentAnnouncement.publisherName || '未设置'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">发布时间</span>
                  <span class="meta-value">{{
                    currentAnnouncement.publishTime
                      ? formatDate(currentAnnouncement.publishTime)
                      : '未发布'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">浏览次数</span>
                  <span class="meta-value">{{
                    currentAnnouncement.viewCount || 0
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="detail-body">
              <h4 class="section-title">公告内容</h4>
              <div
                class="content-html"
                v-html="sanitizeHtml(currentAnnouncement?.content)"
              ></div>
            </div>

            <!-- 附件区域 -->
            <div
              v-if="
                currentAnnouncement.attachments &&
                Array.isArray(currentAnnouncement.attachments) &&
                currentAnnouncement.attachments.length > 0
              "
              class="detail-attachments"
            >
              <h4 class="section-title">附件</h4>
              <div class="attachment-list">
                <div
                  v-for="(attachment, index) in currentAnnouncement.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <div class="attachment-info">
                    <Icon icon="lucide:paperclip" class="attachment-icon" />
                    <span class="attachment-name">{{
                      attachment.file_name || attachment.name || '附件'
                    }}</span>
                  </div>
                  <div
                    v-if="isImageAttachment(attachment)"
                    class="attachment-image-preview"
                  >
                    <img
                      v-if="getAnnouncementImageUrl(Number(attachment.file_id))"
                      :src="getAnnouncementImageUrl(Number(attachment.file_id))"
                      :alt="attachment.file_name || attachment.name"
                      class="inline-preview-image"
                      @click="previewFile(attachment)"
                    />
                    <div v-else class="inline-preview-loading" @click="previewFile(attachment)">
                      <Icon icon="lucide:image" style="font-size: 24px; color: #999" />
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <ElButton
                      type="primary"
                      size="small"
                      @click="previewFile(attachment)"
                    >
                      预览
                    </ElButton>
                    <ElButton
                      size="small"
                      class="ml-2"
                      @click="downloadFile(attachment)"
                    >
                      下载
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElDialog>

      <!-- 文件预览对话框 -->
      <ElDialog
        v-model="showPreviewDialog"
        title="文件预览"
        width="95%"
        destroy-on-close
        :fullscreen="previewIsPdf"
        @close="closePreviewDialog"
      >
        <div class="preview-container">
          <div v-if="previewIsImage" class="preview-image-wrapper">
            <img :src="previewUrl" :alt="previewFileName" class="preview-image" />
          </div>
          <iframe
            v-else-if="previewIsPdf"
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
          ></iframe>
          <div v-else class="preview-unsupported">
            <Icon icon="lucide:file-question" style="font-size: 48px; color: #9ca3af;" />
            <p style="margin-top: 16px; color: #6b7280;">该文件类型不支持在线预览，建议下载后查看</p>
          </div>
        </div>
      </ElDialog>

      <!-- 发布按钮 -->
      <div class="publish-btn-container">
        <ElButton
          type="primary"
          size="large"
          @click="openPublishDialog"
        >
          <Icon icon="lucide:plus" class="mr-2" />
          发布新公告
        </ElButton>
      </div>

      <!-- 发布公告对话框 -->
      <ElDialog
        v-model="showPublishDialog"
        title="发布新公告"
        width="800px"
        destroy-on-close
      >
        <ElForm
          ref="publishFormRef"
          :model="publishForm"
          label-width="120px"
          class="publish-form"
        >
          <ElFormItem
            label="选择案件"
            prop="caseId"
            :rules="[
              { required: true, message: '请选择案件', trigger: 'change' },
            ]"
          >
            <ElSelect
              v-model="publishForm.caseId"
              placeholder="请选择案件"
              filterable
              style="width: 100%"
              @change="handlePublishFormCaseChange"
            >
              <ElOption
                v-for="caseItem in caseOptions"
                :key="caseItem.id"
                :label="caseItem.caseName"
                :value="caseItem.id"
              >
                <div class="flex flex-col">
                  <span>{{ caseItem.caseName }}</span>
                  <span class="text-xs text-gray-500">{{ caseItem.caseNumber }}</span>
                </div>
              </ElOption>
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            label="公告标题"
            prop="title"
            :rules="[
              { required: true, message: '请输入公告标题', trigger: 'blur' },
              {
                max: 200,
                message: '标题长度不能超过200个字符',
                trigger: 'blur',
              },
            ]"
          >
            <ElInput
              v-model="publishForm.title"
              placeholder="请输入公告标题"
              maxlength="200"
              show-word-limit
            />
          </ElFormItem>

          <ElFormItem
            label="公告类型"
            prop="announcementType"
            :rules="[
              { required: true, message: '请选择公告类型', trigger: 'change' },
            ]"
          >
            <ElSelect
              v-model="publishForm.announcementType"
              placeholder="请选择公告类型"
            >
              <ElOption label="公告" value="ANNOUNCEMENT" />
              <ElOption label="通知" value="NOTICE" />
              <ElOption label="警告" value="WARNING" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            label="公告内容"
            prop="content"
            :rules="[
              { required: true, message: '请输入公告内容', trigger: 'blur' },
            ]"
          >
            <ElInput
              v-model="publishForm.content"
              type="textarea"
              :rows="8"
              placeholder="请输入公告内容，支持HTML格式"
            />
          </ElFormItem>

          <ElFormItem label="附件">
            <FileUpload
              ref="fileUploadRef"
              :biz-type="'announcement'"
              :biz-id="0"
              accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png,.gif"
              :max-size="50 * 1024 * 1024"
              :multiple="true"
              title="公告附件"
              :disabled="false"
              :local-mode="true"
              @local-files-change="handleLocalFilesChange"
              @mobile-files-uploaded="handleMobileFilesUploaded"
            />
            <div class="upload-hint">
              支持格式：doc, docx, pdf, txt, jpg, jpeg, png, gif，单个文件不超过 50MB
            </div>
          </ElFormItem>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="showPublishDialog = false">取消</ElButton>
            <ElButton
              type="primary"
              @click="submitPublishForm"
              :loading="publishLoading"
            >
              发布
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </div>
  </div>
</template>

<style scoped>
.announcement-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.announcement-list {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

.announcement-item {
  padding: 20px;
  margin-bottom: 16px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.announcement-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.announcement-item.is-top {
  border-left: 4px solid #ef4444;
  background-color: #fef2f2;
}

/* 公告详情弹窗样式 */
.announcement-detail-container {
  padding: 20px;
}

.detail-content {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-meta {
  padding: 20px;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.section-title {
  display: inline-block;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #3b82f6;
}

.detail-body {
  padding: 20px;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.content-html {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

.content-html :deep(p) {
  margin-bottom: 12px;
}

.detail-attachments {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  transition: all 0.2s;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item:hover {
  background: #f3f4f6;
  transform: translateX(2px);
}

.attachment-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.attachment-icon {
  font-size: 16px;
  color: #3b82f6;
}

.attachment-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.attachment-image-preview {
  width: 100%;
  margin: 4px 0;
}

.inline-preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
  object-fit: contain;
  border: 1px solid #e5e7eb;
}

.inline-preview-image:hover {
  transform: scale(1.02);
  border-color: #3b82f6;
}

.preview-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

/* 预览容器样式 */
.preview-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 发布公告表单样式 */
.publish-form {
  padding: 10px 0;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.announcement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-section {
  display: flex;
  flex: 1;
  align-items: center;
}

.top-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #ef4444;
}

.announcement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.announcement-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item .icon {
  margin-right: 0;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.meta-item span {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

/* 公告内容样式 */
.announcement-content {
  margin: 12px 0;
  position: relative;
}

.content-preview {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  max-height: 4.8em; /* 4行 * 1.2行高 */
  overflow: hidden;
  position: relative;
}

.content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 1.6em;
  background: linear-gradient(to top, #fff, transparent);
  pointer-events: none;
}

.content-preview.full {
  max-height: none;
}

.content-preview.full::after {
  display: none;
}

/* 展开按钮 */
.expand-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  border: none;
  outline: none;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.publish-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 20px;
}

.announcement-detail {
  padding: 10px 0;
}

.detail-meta {
  padding: 16px;
  margin-bottom: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-row .label {
  min-width: 80px;
  font-weight: 600;
  color: #374151;
}

.detail-body {
  padding: 20px;
}

.section-title {
  padding-bottom: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
}

.content-html {
  line-height: 1.8;
  color: #374151;
}

.content-html :deep(p) {
  margin-bottom: 12px;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.status-tag {
  color: #000 !important;
}

/* 附件列表样式 */
.attachments-list {
  margin-top: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.attachment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.attachment-info {
  display: flex;
  flex: 1;
  align-items: center;
}

.file-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #3b82f6;
}

.file-name {
  font-size: 14px;
  color: #374151;
  word-break: break-all;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.attachment-actions .ml-2 {
  margin-left: 8px;
}

.preview-container {
  width: 100%;
  height: 85vh;
}

.preview-iframe {
  width: 100%;
  height: 100%;
}

/* 骨架屏样式 */
.skeleton-item {
  pointer-events: none;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 200px;
}

.skeleton-tag {
  height: 22px;
  width: 60px;
}

.skeleton-button {
  height: 32px;
  width: 100px;
  border-radius: 4px;
}

.skeleton-meta {
  height: 18px;
  width: 120px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
