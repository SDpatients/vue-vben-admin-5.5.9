<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElSkeleton,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  downloadCaseFileApi,
  getCaseDetailApi,
  updateCaseApi,
} from '#/api/core/case';
import {
  deleteAnnouncementApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  getAnnouncementViewsApi,
  publishAnnouncementApi,
  recordAnnouncementViewApi,
  revokeAnnouncementApi,
  updateAnnouncementApi,
} from '#/api/core/case-announcement';
import { downloadFileApi, uploadFileApi } from '#/api/core/file';
import {
  addTeamMemberApi,
  canAccessCaseApi,
  getActiveTeamRolesApi,
  getMyTeamMemberInfoApi,
  getTeamMembersApi,
  removeTeamMemberApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';

import FileUploader from '../../../components/FileUploader.vue';
import RichTextEditor from '../../../components/RichTextEditor.vue';
import ClaimRegistration from './components/ClaimRegistration.vue';
import CreditorInfo from './components/CreditorInfo.vue';
import StageFiveProcess from './components/StageFiveProcess.vue';
import StageFourProcess from './components/StageFourProcess.vue';
import StageOneProcess from './components/StageOneProcess.vue';
import StageSevenProcess from './components/StageSevenProcess.vue';
import StageSixProcess from './components/StageSixProcess.vue';
import StageThreeProcess from './components/StageThreeProcess.vue';
import StageTwoProcess from './components/StageTwoProcess.vue';
import TeamMemberManage from './components/TeamMemberManage.vue';

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const caseId = ref(route.params.id as string);
const loading = ref(false);
const caseDetail = ref<any>(null);
const isInfoCollapsed = ref(true);
const isEditing = ref(false);
const editedData = reactive<any>({});
const saveLoading = ref(false);

// 权限控制相关
const canEdit = ref(false);
const canDelete = ref(false);
const isCreator = ref(false);
const teamMemberInfo = ref<any>(null);

// 工作团队相关
const teamMembers = ref<any[]>([]);
const teamRoles = ref<any[]>([]);
const availableUsers = ref<any[]>([]);
const workTeamLoading = ref(false);
const memberDialogVisible = ref(false);
const memberDialogTitle = ref('添加成员');
const memberForm = ref<any>({
  id: null,
  userId: null,
  teamRole: '',
  permissionLevel: 'VIEW',
});

const currentStage = ref(1);
const stages = [
  {
    id: 1,
    name: '阶段一',
    description: '法院指定管理人至管理人接管破产企业前的工作',
  },
  {
    id: 2,
    name: '阶段二',
    description: '管理人接管破产企业至调查审查破产企业前的工作',
  },
  {
    id: 3,
    name: '阶段三',
    description: '管理人调查审查破产企业至第一次债权人会议前工作',
  },
  {
    id: 4,
    name: '阶段四',
    description: '第一次债权人会议至第二次债权人会议前工作',
  },
  { id: 5, name: '阶段五', description: '第二次债权人会议至破产程序终结工作' },
  { id: 6, name: '阶段六', description: '破产财产分配方案等相关工作' },
  { id: 7, name: '阶段七', description: '债权人会议决议等相关工作' },
];

// 页面内容类型切换
const activeTab = ref('caseInfo');

// 公告管理相关
const announcementData = reactive({
  title: '',
  content: '',
  announcement_type: 'NORMAL',
  status: 'PUBLISHED',
  is_top: false,
  top_expire_time: '',
  attachments: [],
});

const announcements = ref<any[]>([]);
const totalAnnouncements = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const loadingAnnouncements = ref(false);
const showAnnouncementDialog = ref(false);
const isEditingAnnouncement = ref(false);
const currentAnnouncementId = ref<null | string>(null);
const dialogTitle = ref('发布新公告');

const showRevokeDialog = ref(false);
const revokeReason = ref('');
const currentRevokeAnnouncementId = ref<null | string>(null);

const showDetailDialog = ref(false);
const currentAnnouncementDetail = ref<any>(null);
const detailLoading = ref(false);

const showViewsDialog = ref(false);
const viewsList = ref<any[]>([]);
const viewsTotal = ref(0);
const viewsCurrentPage = ref(1);
const viewsPageSize = ref(10);
const viewsLoading = ref(false);

// 文件预览相关
const showPreviewDialog = ref(false);
const previewAttachment = ref<any>(null);
const previewUrl = ref('');
const previewType = ref('');
const isImage = ref(false);
const isPdf = ref(false);
const isText = ref(false);
const textContent = ref('');
const previewLoading = ref(false);

// 预览附件
const viewAttachment = async (attachment: any) => {
  try {
    previewLoading.value = true;
    previewAttachment.value = attachment;

    // 确定文件类型
    const fileName = attachment.file_name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeType = attachment.type || '';

    // 设置预览类型
    isImage.value =
      ['bmp', 'gif', 'jpeg', 'jpg', 'png'].includes(fileExtension) ||
      mimeType.startsWith('image/');
    isPdf.value = fileExtension === 'pdf' || mimeType === 'application/pdf';
    isText.value =
      ['css', 'html', 'js', 'json', 'log', 'md', 'ts', 'txt', 'xml'].includes(
        fileExtension,
      ) || mimeType.startsWith('text/');

    // 根据文件类型生成预览URL或内容
    if (isImage.value || isPdf.value) {
      // 对于图片和PDF，下载文件内容并生成本地预览URL
      const response = await downloadFileApi(attachment.file_id);
      const blob = new Blob([response], { type: mimeType });
      previewUrl.value = URL.createObjectURL(blob);
      showPreviewDialog.value = true;
      previewLoading.value = false;
    } else if (isText.value) {
      // 对于文本文件，下载并显示内容
      const response = await downloadFileApi(attachment.file_id);
      const blob = new Blob([response], { type: 'text/plain' });
      const text = await blob.text();
      textContent.value = text;
      showPreviewDialog.value = true;
      previewLoading.value = false;
    } else {
      // 对于其他类型，提示无法预览，建议下载
      ElMessage.info('该文件类型不支持在线预览，建议下载后查看');
      previewLoading.value = false;
    }
  } catch (error) {
    console.error('预览附件失败:', error);
    ElMessage.error('文件预览失败');
    previewLoading.value = false;
  }
};

// 关闭预览对话框
const closePreviewDialog = () => {
  showPreviewDialog.value = false;
  previewUrl.value = '';
  textContent.value = '';
  isImage.value = false;
  isPdf.value = false;
  isText.value = false;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 从后端获取公告列表
const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true;
  try {
    const response = await getAnnouncementListApi(
      caseId.value,
      currentPage.value,
      pageSize.value,
      statusFilter.value || undefined,
    );
    if (response.status === '1') {
      let records = response.data.records || [];

      // 解析每个公告的attachments字段，将JSON字符串转换为数组
      records = records.map((announcement: any) => {
        const processed = { ...announcement };
        if (
          processed.attachments &&
          typeof processed.attachments === 'string'
        ) {
          try {
            processed.attachments = JSON.parse(processed.attachments);
          } catch (error) {
            console.error('解析attachments失败:', error);
            processed.attachments = [];
          }
        } else if (!processed.attachments) {
          processed.attachments = [];
        }

        // 处理附件数据，确保file_url是完整的可访问URL
        if (processed.attachments && Array.isArray(processed.attachments)) {
          processed.attachments = processed.attachments.map((att: any) => ({
            ...att,
            file_url: att.file_url?.startsWith('http')
              ? att.file_url
              : att.file_url?.startsWith('/')
                ? `http://192.168.0.120:8080${att.file_url}`
                : att.file_url,
          }));
        }

        return processed;
      });

      announcements.value = records;
      totalAnnouncements.value = response.data.count || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.error || '未知错误'}`);
      announcements.value = [];
      totalAnnouncements.value = 0;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
    announcements.value = [];
    totalAnnouncements.value = 0;
  } finally {
    loadingAnnouncements.value = false;
  }
};

// 保存公告
const saveAnnouncement = async () => {
  try {
    let response;

    // 添加调试日志
    console.log('=== 保存公告调试信息 ===');
    console.log('1. 函数开始，响应式变量值:');
    console.log('   isEditingAnnouncement.value:', isEditingAnnouncement.value);
    console.log('   currentAnnouncementId.value:', currentAnnouncementId.value);
    console.log('   announcementData:', announcementData);

    // 在条件判断之前保存编辑状态和当前公告ID
    const isEditing = isEditingAnnouncement.value;
    const announcementId = currentAnnouncementId.value;

    console.log('2. 保存到本地变量后的值:');
    console.log('   isEditing:', isEditing);
    console.log('   announcementId:', announcementId);

    console.log('3. 条件判断结果:');
    console.log('   isEditing && announcementId:', isEditing && announcementId);

    // 处理附件上传
    const uploadedAttachments = [];
    // 过滤出需要上传的文件（status为ready的文件）
    const filesToUpload = announcementData.attachments.filter(
      (file: any) => file.status === 'ready',
    );

    if (filesToUpload.length > 0) {
      ElMessage.info(`正在上传${filesToUpload.length}个文件...`);

      // 逐个上传文件
      for (const file of filesToUpload) {
        try {
          // 公告附件使用统一文件上传接口，bizType为notice
          const uploadResponse = await uploadFileApi(
            file.raw,
            'notice',
            Number(caseId.value),
          );
          if (uploadResponse.status === '1') {
            // 上传成功，将返回的文件信息添加到已上传列表
            uploadedAttachments.push({
              file_id: uploadResponse.data.id,
              file_name: uploadResponse.data.originalFileName,
              file_url: `http://192.168.0.120:8080/api/file/view/${uploadResponse.data.id}?token=${localStorage.getItem('token') || ''}`,
            });
            ElMessage.success(`文件${file.name}上传成功`);
          } else {
            ElMessage.error(
              `文件${file.name}上传失败：${uploadResponse.msg || '未知错误'}`,
            );
            return; // 中断执行
          }
        } catch (error) {
          console.error(`上传文件${file.name}失败:`, error);
          ElMessage.error(`文件${file.name}上传失败`);
          return; // 中断执行
        }
      }

      // 过滤出已存在的文件（非ready状态）
      const existingAttachments = announcementData.attachments.filter(
        (file: any) => file.status !== 'ready',
      );

      // 将已存在的文件转换为后端需要的格式
      const formattedExistingAttachments = existingAttachments.map(
        (file: any) => ({
          file_id: file.file_id || file.uid,
          file_name: file.file_name || file.name,
          file_url: file.file_url || file.url,
        }),
      );

      // 更新公告数据中的附件，使用上传成功后的文件信息
      announcementData.attachments = [
        ...formattedExistingAttachments,
        ...uploadedAttachments,
      ];
    } else {
      // 没有需要上传的文件，将现有的附件转换为后端需要的格式
      announcementData.attachments = announcementData.attachments.map(
        (file: any) => ({
          file_id: file.file_id || file.uid,
          file_name: file.file_name || file.name,
          file_url: file.file_url || file.url,
        }),
      );
    }

    if (isEditing && announcementId) {
      console.log('4. 进入更新公告分支');
      // 更新现有公告
      response = await updateAnnouncementApi(announcementId, announcementData);
      console.log('5. updateAnnouncementApi 响应:', response);
      if (response.status === '1') {
        ElMessage.success('公告更新成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告更新失败：${response.error || '未知错误'}`);
      }
    } else {
      console.log('4. 进入发布新公告分支');
      // 发布新公告
      response = await publishAnnouncementApi(caseId.value, announcementData);
      console.log('5. publishAnnouncementApi 响应:', response);
      if (response.status === '1') {
        ElMessage.success('公告发布成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告发布失败：${response.error || '未知错误'}`);
      }
    }
  } catch (error) {
    console.error('保存公告失败:', error);
    ElMessage.error('保存公告失败');
  }
};

// 发布公告
const publishAnnouncement = async (announcementId: string) => {
  try {
    // 由于我们没有直接的发布API，我们可以跳转到编辑页面让用户修改状态
    // 或者使用updateAnnouncementApi更新状态
    ElMessage.info('请使用编辑功能修改公告状态');
  } catch (error) {
    console.error('发布公告失败:', error);
    ElMessage.error('发布公告失败');
  }
};

// 撤销公告
const revokeAnnouncement = async (announcementId: string) => {
  currentRevokeAnnouncementId.value = announcementId;
  revokeReason.value = '';
  showRevokeDialog.value = true;
};

const confirmRevokeAnnouncement = async () => {
  if (!currentRevokeAnnouncementId.value) return;

  try {
    const response = await revokeAnnouncementApi(
      currentRevokeAnnouncementId.value,
      revokeReason.value,
    );
    if (response.status === '1') {
      ElMessage.success('公告撤销成功');
      await fetchAnnouncements();
      showRevokeDialog.value = false;
      revokeReason.value = '';
      currentRevokeAnnouncementId.value = null;
    } else {
      ElMessage.error(`公告撤销失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('撤销公告失败:', error);
    ElMessage.error('撤销公告失败');
  }
};

// 删除公告
const deleteAnnouncement = async (announcementId: string) => {
  try {
    const response = await deleteAnnouncementApi(announcementId);
    if (response.status === '1') {
      ElMessage.success('公告删除成功');
      await fetchAnnouncements();
    } else {
      ElMessage.error(`公告删除失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除公告失败:', error);
    ElMessage.error('删除公告失败');
  }
};

// 编辑公告
const editAnnouncement = (announcement: any) => {
  console.log('=== 编辑公告调试信息 ===');
  console.log('公告对象:', announcement);

  isEditingAnnouncement.value = true;

  // 检查公告对象的ID字段，可能是id或announcement_id
  const announcementId =
    announcement.id ||
    announcement.announcement_id ||
    announcement.announcementId;
  console.log('提取到的公告ID:', announcementId);

  currentAnnouncementId.value = announcementId;
  dialogTitle.value = '编辑公告';
  announcementData.title = announcement.title;
  announcementData.content = announcement.content;
  announcementData.announcement_type =
    announcement.announcement_type || 'NORMAL';
  announcementData.status = announcement.status || 'PUBLISHED';
  announcementData.is_top = Boolean(announcement.is_top);
  announcementData.top_expire_time = announcement.top_expire_time || '';

  // 处理attachments字段，确保是数组格式
  let attachments = announcement.attachments || [];
  if (typeof attachments === 'string') {
    try {
      attachments = JSON.parse(attachments);
    } catch (error) {
      console.error('解析attachments失败:', error);
      attachments = [];
    }
  }
  announcementData.attachments = attachments;

  showAnnouncementDialog.value = true;
};

const viewAnnouncementDetail = async (announcement: any) => {
  detailLoading.value = true;
  showDetailDialog.value = true;

  try {
    const announcementId =
      announcement.id ||
      announcement.announcement_id ||
      announcement.announcementId;

    // 从localStorage获取用户信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let viewerId = '';
    let viewerName = '';

    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        viewerId = userInfo.user?.uPid || '';
        viewerName = userInfo.user?.uName || '';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }

    // 调用浏览记录接口，传入ajid、viewer_id、viewer_name
    await recordAnnouncementViewApi(
      announcementId,
      caseId.value,
      viewerId,
      viewerName,
    );

    const response = await getAnnouncementDetailApi(announcementId);
    if (response.status === '1') {
      let detail = response.data;

      // 解析attachments字段，将JSON字符串转换为数组
      if (detail.attachments && typeof detail.attachments === 'string') {
        try {
          detail = {
            ...detail,
            attachments: JSON.parse(detail.attachments),
          };
        } catch (error) {
          console.error('解析attachments失败:', error);
          detail = {
            ...detail,
            attachments: [],
          };
        }
      } else if (!detail.attachments) {
        detail = {
          ...detail,
          attachments: [],
        };
      }

      // 确保浏览次数字段存在
      if (detail.view_count === undefined && detail.viewCount === undefined) {
        detail.view_count = 0;
        detail.viewCount = 0;
      } else if (
        detail.view_count !== undefined &&
        detail.viewCount === undefined
      ) {
        detail.viewCount = detail.view_count;
      } else if (
        detail.viewCount !== undefined &&
        detail.view_count === undefined
      ) {
        detail.view_count = detail.viewCount;
      }

      // 处理附件数据，确保file_url是完整的可访问URL
      if (detail.attachments && Array.isArray(detail.attachments)) {
        detail.attachments = detail.attachments.map((att: any) => ({
          ...att,
          file_url: att.file_url?.startsWith('http')
            ? att.file_url
            : att.file_url?.startsWith('/')
              ? `http://192.168.0.120:8080${att.file_url}`
              : att.file_url,
        }));
      }

      currentAnnouncementDetail.value = detail;
      ElMessage.success('公告详情加载成功');
    }
  } catch (error) {
    console.error('获取公告详情失败:', error);
    ElMessage.error('获取公告详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 打开新增公告对话框
const openNewAnnouncementDialog = () => {
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
  dialogTitle.value = '发布新公告';
  resetAnnouncement();
  showAnnouncementDialog.value = true;
};

// 关闭公告对话框
const closeAnnouncementDialog = () => {
  showAnnouncementDialog.value = false;
  resetAnnouncement();
};

// 重置公告表单
const resetAnnouncement = () => {
  // 重置表单数据
  announcementData.title = '';
  announcementData.content = '';
  announcementData.announcement_type = 'NORMAL';
  announcementData.status = 'PUBLISHED';
  announcementData.is_top = false;
  announcementData.top_expire_time = '';
  announcementData.attachments = [];
  // 重置编辑状态
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
};

/**
 * 公告附件上传前的验证
 */
const handleAnnouncementFileBeforeUpload = (file: any) => {
  // 验证文件大小，限制为50MB
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    ElMessage.error(`单个文件大小不能超过50MB`);
    return false;
  }
  return true;
};

const handleAttachmentChange = (file: any, fileList: any[]) => {
  console.log('附件变化:', file, fileList);
};

const handleAttachmentRemove = async (file: any, fileList: any[]) => {
  console.log('附件删除:', file, fileList);

  // 如果文件已经上传到服务器，调用后端删除接口
  if (file.file_id) {
    try {
      const response = await deleteFileApi(file.file_id);
      if (response.status === '1') {
        ElMessage.success('文件删除成功');
      } else {
        ElMessage.error(`文件删除失败：${response.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      ElMessage.error('文件删除失败');
    }
  }

  // 更新公告数据中的附件列表
  announcementData.attachments = fileList;
};

const downloadAttachment = async (attachment: any) => {
  try {
    // 使用后端提供的下载接口
    const downloadResponse = await downloadCaseFileApi(attachment.file_id);

    // 创建下载链接
    const blob = new Blob([downloadResponse], {
      type: attachment.type || 'application/octet-stream',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = attachment.file_name;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success('文件下载开始');
  } catch (error: any) {
    ElMessage.error(`文件下载失败：${error.message || '未知错误'}`);
  }
};

const viewAnnouncementViews = async (announcement: any) => {
  viewsLoading.value = true;
  showViewsDialog.value = true;
  viewsCurrentPage.value = 1;

  try {
    const announcementId =
      announcement.id ||
      announcement.announcement_id ||
      announcement.announcementId;

    if (!announcementId) {
      ElMessage.error('无效的公告ID');
      viewsLoading.value = false;
      return;
    }

    console.log('调用 getAnnouncementViewsApi，公告ID:', announcementId);
    const response = await getAnnouncementViewsApi(
      announcementId,
      viewsCurrentPage.value,
      viewsPageSize.value,
    );

    console.log('getAnnouncementViewsApi 响应:', response);

    if (response.status === '1') {
      // 处理浏览记录数据，将驼峰命名转换为下划线命名，以匹配表格组件的预期
      let records = response.data.records || [];

      records = records.map((record: any) => {
        // 将驼峰命名转换为下划线命名
        return {
          id: record.id,
          viewer_name: record.viewerName || record.viewer_name || '',
          view_time: record.viewTime || record.view_time || '',
          ip_address: record.ipAddress || record.ip_address || '',
          // 保留原始字段，确保数据完整性
          ...record,
        };
      });

      viewsList.value = records;
      viewsTotal.value = response.data.count || 0;
      console.log('处理后的浏览记录数据:', records);
    } else {
      ElMessage.error(`获取浏览记录失败：${response.error || '未知错误'}`);
      viewsList.value = [];
      viewsTotal.value = 0;
    }
  } catch (error) {
    console.error('获取浏览记录失败:', error);
    ElMessage.error('获取浏览记录失败');
    viewsList.value = [];
    viewsTotal.value = 0;
  } finally {
    viewsLoading.value = false;
  }
};

const handleViewsPageChange = (page: number) => {
  viewsCurrentPage.value = page;
  viewAnnouncementViews(currentAnnouncementDetail.value);
};

const handleViewsPageSizeChange = (size: number) => {
  viewsPageSize.value = size;
  viewsCurrentPage.value = 1;
  viewAnnouncementViews(currentAnnouncementDetail.value);
};

// 监听分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAnnouncements();
};

// 监听页面大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchAnnouncements();
};

const handleStatusFilterChange = () => {
  currentPage.value = 1;
  fetchAnnouncements();
};

// 当切换到公告管理标签页时，自动加载公告列表
watch(activeTab, (newTab) => {
  if (newTab === 'announcement') {
    fetchAnnouncements();
  } else if (newTab === 'workTeam') {
    fetchTeamMembers();
    fetchTeamRoles();
    fetchAvailableUsers();
  }
});

// 破产流程阶段数据

// 计算属性

// 方法
const getCaseStatusStyle = (status: string) => {
  const colorMap: Record<string, any> = {
    破产申请与受理: { backgroundColor: '#409EFF', color: '#000000' },
    债权申报核查与债权人会议: { backgroundColor: '#E6A23C', color: '#000000' },
    资产处理: { backgroundColor: '#909399', color: '#000000' },
    财产处置: { backgroundColor: '#F56C6C', color: '#000000' },
    破产财产分配: { backgroundColor: '#67C23A', color: '#000000' },
    程序终结与注销: { backgroundColor: '#8590A6', color: '#000000' },
    复权程序: { backgroundColor: '#722ED1', color: '#000000' },
    已结案: { backgroundColor: '#13C2C2', color: '#000000' },
  };
  return colorMap[status] || { backgroundColor: '#909399', color: '#000000' };
};

const goBack = () => {
  router.back();
};

// 开始编辑
const startEditing = () => {
  isEditing.value = true;
  // 复制当前数据到编辑对象
  Object.assign(editedData, caseDetail.value);
};

// 保存编辑
const saveEditing = async () => {
  saveLoading.value = true;
  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const updateData = {
      AJID: caseId.value,
      AH: editedData.案号 || '',
      AJMC: editedData.案件名称 || '',
      SLRQ: formatDateForApi(editedData.受理日期),
      AJLY: editedData.案件来源 || '',
      SLFY: editedData.受理法院 || '',
      ZDJG: editedData.指定机构 || '',
      GLRFZR: editedData.管理人负责人 || '',
      SFJHS: editedData.是否简化审 || '',
      AY: editedData.案由 || '',
      AJJD: editedData.案件进度 || '',
      ZQSBJZSJ: formatDateForApi(editedData.债权申报截止时间),
      LARQ: formatDateForApi(editedData.立案日期),
      JARQ: formatDateForApi(editedData.结案日期),
      PCSJ: formatDateForApi(editedData.破产时间),
      ZJSJ: formatDateForApi(editedData.终结时间),
      ZXSJ: formatDateForApi(editedData.注销时间),
      GDSJ: formatDateForApi(editedData.归档时间),
      BEIZHU: editedData.备注 || '',
      SEP_EUSER: editedData.修改者 || '',
      SEP_EDATE: formatDateForApi(editedData.修改时间) || currentDate,
      GLRID: caseId.value,
      GLRLX: editedData.管理人类型 || '',
      FZRID: editedData.负责人 || '',
      LXDH: editedData.联系电话 || '',
      LXYX: editedData.联系邮箱 || '',
      BGDZ: editedData.办公地址 || '',
      ZT: editedData.管理人状态 || '',
      ZQRID: caseId.value,
      ZQR: editedData.债权人名称 || '',
      ZQRFL: editedData.债权人类型 || '',
      ZJHM: editedData.证件号码 || '',
      FDDBRQY: editedData.法定代表人 || '',
      ZCDZ: editedData.注册地址 || '',
      JYFWQY: editedData.经营范围 || '',
      HYFL: editedData.行业分类 || '',
      CLRQQY: formatDateForApi(editedData.成立日期),
      ZCZBQY: editedData.注册资本 || '',
      ZQSBID: caseId.value,
      ZQRMC: editedData.申报债权人名称 || '',
      ZQRLX: editedData.申报债权人类型 || '',
      SBJE: editedData.申报金额 || '',
      SBYJ: editedData.申报依据 || '',
      JSR: editedData.接收人 || '',
      SBLX: editedData.申报类型 || '',
      BZ: editedData.申报备注 || '',
      ZQQRID: caseId.value,
      FYCDRQ: formatDateForApi(editedData.法院裁定日期),
      CDWH: editedData.裁定文号 || '',
      ZZJE: editedData.最终金额 || '',
    };

    const response = await updateCaseApi(updateData);

    if (response.status === '1') {
      Object.assign(caseDetail.value, editedData);
      isEditing.value = false;
      ElMessage.success('案件信息已保存');
    } else {
      ElMessage.error(`保存失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('保存案件信息失败:', error);
    ElMessage.error('保存案件信息失败');
  } finally {
    saveLoading.value = false;
  }
};

const formatDateForApi = (date: any): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return undefined;
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  // 清空编辑数据
  Object.keys(editedData).forEach((key) => {
    delete editedData[key];
  });
  ElMessage.info('已取消编辑');
};

// 生命周期
onMounted(async () => {
  loading.value = true;
  try {
    // 调用真实API获取案件详情
    const response = await getCaseDetailApi(caseId.value);

    // 使用类型断言处理响应数据
    const responseData = response as any;

    // 检查API响应结构
    // API响应数据: responseData

    if (responseData.status === '1' || responseData.data?.status === '1') {
      // 根据不同的响应结构获取数据
      const caseData = responseData.data?.data || responseData.data;

      if (caseData) {
        caseDetail.value = caseData;
        ElMessage.success('案件详情加载成功');
      } else {
        throw new Error('API返回的数据结构异常');
      }
    } else {
      const errorMsg =
        responseData.error || responseData.data?.error || '未知错误';
      ElMessage.error(`获取案件详情失败：${errorMsg}`);

      // 如果API调用失败，使用虚拟数据作为备用
      caseDetail.value = {
        案件ID: caseId.value || 'AJ2023001',
        案号: '(2023)破字第001号',
        案件名称: '某某公司破产清算案',
        受理日期: '2023-01-15',
        案件来源: '债权人申请',
        受理法院: '某某市中级人民法院',
        管理人负责人: '李经理',
        承办法官: '张法官',
        案由: '破产清算',
        债权申报截止时间: '2023-03-15',
        是否简化审: '否',
        案件进度: '审理中',
        // 新增债务人信息
        债务人: '某某公司',
        法定代表人: '王某某',
        注册地址: '某某市某某区某某路123号',
        注册资本: '1000万',
        // 新增债权人信息
        债权人名称: '某某银行股份有限公司',
        债权人类型: '金融机构',
        // 新增法院相关信息
        会议庭成员: '张法官、李法官、王法官',
        受理庭室: '破产审判庭',
        // 新增案件状态信息
        立案日期: '2023-01-10',
        破产时间: '2023-01-20',
        归档时间: '',
        注销时间: '',
        // 新增管理人信息
        管理人类型: '律师事务所',
        管理人联系方式: '13800138000',
      };
    }
  } catch (error) {
    console.error('获取案件详情失败:', error);
    ElMessage.error('获取案件详情失败，使用虚拟数据');

    // 如果API调用失败，使用虚拟数据作为备用
    caseDetail.value = {
      案件ID: caseId.value || 'AJ2023001',
      案号: '(2023)破字第001号',
      案件名称: '某某公司破产清算案',
      受理日期: '2023-01-15',
      案件来源: '债权人申请',
      受理法院: '某某市中级人民法院',
      管理人负责人: '李经理',
      承办法官: '张法官',
      案由: '破产清算',
      债权申报截止时间: '2023-03-15',
      是否简化审: '否',
      案件进度: '审理中',
      // 新增债务人信息
      债务人: '某某公司',
      法定代表人: '王某某',
      注册地址: '某某市某某区某某路123号',
      注册资本: '1000万',
      // 新增债权人信息
      债权人名称: '某某银行股份有限公司',
      债权人类型: '金融机构',
      // 新增法院相关信息
      会议庭成员: '张法官、李法官、王法官',
      受理庭室: '破产审判庭',
      // 新增案件状态信息
      立案日期: '2023-01-10',
      破产时间: '2023-01-20',
      归档时间: '',
      注销时间: '',
      // 新增管理人信息
      管理人类型: '律师事务所',
      管理人联系方式: '13800138000',
    };
  } finally {
    loading.value = false;
  }

  // 检查权限
  await checkPermissions();
});

// 获取工作团队成员列表
const fetchTeamMembers = async () => {
  console.log('开始获取工作团队成员列表');
  workTeamLoading.value = true;
  try {
    const response = await getTeamMembersApi(Number(caseId.value));
    console.log('getTeamMembersApi响应:', response);
    if (response.code === 200) {
      teamMembers.value = response.data || [];
      console.log('工作团队成员列表:', teamMembers.value);
    } else {
      teamMembers.value = [];
      console.log('没有工作团队成员数据');
    }
  } catch (error) {
    console.error('获取工作团队成员列表失败:', error);
    ElMessage.error('获取工作团队成员列表失败');
    teamMembers.value = [];
  } finally {
    workTeamLoading.value = false;
    console.log('获取工作团队成员列表结束，loading:', workTeamLoading.value);
  }
};

// 获取团队角色列表
const fetchTeamRoles = async () => {
  try {
    const response = await getActiveTeamRolesApi();
    console.log('getActiveTeamRolesApi响应:', response);
    if (response.code === 200) {
      teamRoles.value = response.data || [];
      console.log('团队角色列表:', teamRoles.value);
    } else {
      teamRoles.value = [];
    }
  } catch (error) {
    console.error('获取团队角色列表失败:', error);
    teamRoles.value = [];
  }
};

// 获取可用用户列表
const fetchAvailableUsers = async () => {
  try {
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const userInfo = chatUserInfo ? JSON.parse(chatUserInfo) : null;

    availableUsers.value =
      userInfo && userInfo.user && userInfo.user.uPid ? [userInfo.user] : [];
  } catch (error) {
    console.error('获取可用用户列表失败:', error);
    availableUsers.value = [];
  }
};

// 添加成员
const handleAddMember = () => {
  memberDialogTitle.value = '添加成员';
  memberForm.value = {
    id: null,
    userId: null,
    teamRole: '',
    permissionLevel: 'VIEW',
  };
  memberDialogVisible.value = true;
};

// 编辑成员
const handleEditMember = (row: any) => {
  memberDialogTitle.value = '编辑成员';
  memberForm.value = {
    id: row.id,
    userId: row.userId,
    teamRole: row.teamRole,
    permissionLevel: row.permissionLevel,
  };
  memberDialogVisible.value = true;
};

// 保存成员
const handleSaveMember = async () => {
  try {
    if (
      !memberForm.value.userId ||
      !memberForm.value.teamRole ||
      !memberForm.value.permissionLevel
    ) {
      ElMessage.error('请填写完整信息');
      return;
    }

    const data = {
      caseId: Number(caseId.value),
      userId: memberForm.value.userId,
      teamRole: memberForm.value.teamRole,
      permissionLevel: memberForm.value.permissionLevel,
    };

    if (memberForm.value.id) {
      await updateTeamMemberApi({
        id: memberForm.value.id,
        ...data,
      });
      ElMessage.success('更新团队成员成功');
    } else {
      await addTeamMemberApi(data);
      ElMessage.success('添加团队成员成功');
    }

    memberDialogVisible.value = false;
    await fetchTeamMembers();
  } catch (error) {
    console.error('保存团队成员失败:', error);
    ElMessage.error('保存团队成员失败');
  }
};

// 移除成员
const handleRemoveMember = async (row: any) => {
  try {
    await removeTeamMemberApi(row.id);
    ElMessage.success('移除团队成员成功');
    await fetchTeamMembers();
  } catch (error) {
    console.error('移除团队成员失败:', error);
    ElMessage.error('移除团队成员失败');
  }
};

// 获取权限标签类型
const getPermissionTagType = (level: string) => {
  const types: Record<string, any> = {
    VIEW: 'info',
    EDIT: 'warning',
    FULL: 'danger',
  };
  return types[level] || 'info';
};

// 获取权限标签文本
const getPermissionLabel = (level: string) => {
  const labels: Record<string, string> = {
    VIEW: '查看',
    EDIT: '编辑',
    FULL: '完全控制',
  };
  return labels[level] || level;
};

// 检查权限
const checkPermissions = async () => {
  try {
    // 检查编辑权限
    const editResponse = await canAccessCaseApi(Number(caseId.value), 'EDIT');
    canEdit.value = editResponse.code === 200 && editResponse.data;

    // 检查删除权限
    const deleteResponse = await canAccessCaseApi(
      Number(caseId.value),
      'DELETE',
    );
    canDelete.value = deleteResponse.code === 200 && deleteResponse.data;

    // 获取我的团队成员信息
    const memberResponse = await getMyTeamMemberInfoApi(Number(caseId.value));
    if (memberResponse.code === 200 && memberResponse.data) {
      teamMemberInfo.value = memberResponse.data;
      // 判断是否是创建者（通过权限级别判断）
      isCreator.value = memberResponse.data.permissionLevel === 'FULL';
    }
  } catch (error) {
    console.error('检查权限失败:', error);
  }
};
</script>

<template>
  <div class="case-detail-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <ElButton type="primary" link @click="goBack">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件列表
      </ElButton>
      <h1 class="page-title">案件详情</h1>
      <ElButton type="primary" @click="router.push('/basic-data/work-plan-management')">
        <Icon icon="lucide:calendar" class="mr-2" />
        工作计划
      </ElButton>
    </div>

    <!-- 内容类型切换 -->
    <div class="content-tabs mb-6">
      <ElRadioGroup v-model="activeTab" size="large" class="tabs-container">
        <ElRadioButton value="caseInfo" class="tab-button">
          案件基本信息
        </ElRadioButton>
        <ElRadioButton value="process" class="tab-button">
          流程处理
        </ElRadioButton>
        <ElRadioButton value="creditorInfo" class="tab-button">
          债权人信息
        </ElRadioButton>
        <ElRadioButton value="claimRegistration" class="tab-button">
          债权登记表
        </ElRadioButton>
        <ElRadioButton value="announcement" class="tab-button">
          公告管理
        </ElRadioButton>
        <ElRadioButton value="teamManage" class="tab-button" v-if="isCreator">
          团队管理
        </ElRadioButton>
        <ElRadioButton value="workTeam" class="tab-button">
          工作团队
        </ElRadioButton>
      </ElRadioGroup>
    </div>

    <!-- 案件基本信息卡片 -->
    <div v-if="activeTab === 'caseInfo'">
      <ElCard class="case-info-card" shadow="hover">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
              <span class="text-lg font-semibold">案件基本信息</span>
            </div>
            <div class="flex space-x-2">
              <template v-if="!isEditing && canEdit">
                <ElButton type="primary" @click="startEditing">
                  <Icon icon="lucide:pencil" class="mr-1" />
                  编辑
                </ElButton>
              </template>
              <template v-else-if="isEditing && canEdit">
                <ElButton
                  type="success"
                  @click="saveEditing"
                  :loading="saveLoading"
                >
                  <Icon icon="lucide:save" class="mr-1" />
                  保存
                </ElButton>
                <ElButton @click="cancelEditing" :disabled="saveLoading">
                  <Icon icon="lucide:x" class="mr-1" />
                  取消
                </ElButton>
              </template>
              <ElButton link @click="isInfoCollapsed = !isInfoCollapsed">
                <Icon
                  :icon="
                    isInfoCollapsed
                      ? 'lucide:chevron-down'
                      : 'lucide:chevron-up'
                  "
                  class="ml-1"
                />
                {{ isInfoCollapsed ? '展开详情' : '收起详情' }}
              </ElButton>
            </div>
          </div>
        </template>

        <div v-if="loading" class="loading-container">
          <ElSkeleton :rows="5" animated />
        </div>

        <div v-else-if="caseDetail" class="case-info-content">
          <!-- 关键信息概览 -->
          <div class="key-info-overview mb-6">
            <ElRow :gutter="20">
              <ElCol :xs="24" :sm="8" :md="6">
                <div
                  class="key-info-item rounded-lg bg-green-50 p-4 text-center"
                >
                  <div class="key-info-label mb-1 text-sm text-gray-500">
                    案号
                  </div>
                  <div class="key-info-value text-xl font-bold text-green-600">
                    {{ caseDetail.案号 }}
                  </div>
                </div>
              </ElCol>
              <ElCol :xs="24" :sm="8" :md="6">
                <div
                  class="key-info-item rounded-lg bg-purple-50 p-4 text-center"
                >
                  <div class="key-info-label mb-1 text-sm text-gray-500">
                    案件进度
                  </div>
                  <div class="key-info-value">
                    <div
                      :style="getCaseStatusStyle(caseDetail.案件进度)"
                      class="inline-block rounded-full px-4 py-1 text-base font-semibold"
                    >
                      {{ caseDetail.案件进度 }}
                    </div>
                  </div>
                </div>
              </ElCol>
              <ElCol :xs="24" :sm="8" :md="6">
                <div
                  class="key-info-item rounded-lg bg-orange-50 p-4 text-center"
                >
                  <div class="key-info-label mb-1 text-sm text-gray-500">
                    受理法院
                  </div>
                  <div
                    class="key-info-value text-lg font-semibold text-orange-600"
                  >
                    {{ caseDetail.受理法院 }}
                  </div>
                </div>
              </ElCol>
            </ElRow>
          </div>

          <!-- 按类别分组展示详细信息 - 可折叠 -->
          <div
            v-show="!isInfoCollapsed"
            class="category-sections transition-all duration-300 ease-in-out"
          >
            <!-- 案件基本信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
                  <span class="text-md font-semibold">案件基本信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件名称：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件名称"
                          size="small"
                          placeholder="请输入案件名称"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件名称
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >受理日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.受理日期"
                          type="date"
                          size="small"
                          placeholder="请选择受理日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.受理日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件来源：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件来源"
                          size="small"
                          placeholder="请输入案件来源"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件来源
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >受理法院：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.受理法院"
                          size="small"
                          placeholder="请输入受理法院"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.受理法院
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案由：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案由"
                          size="small"
                          placeholder="请输入案由"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案由
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >案件进度：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件进度"
                          size="small"
                          placeholder="请输入案件进度"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.案件进度
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >是否简化审：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.是否简化审"
                          size="small"
                          placeholder="请输入是否简化审"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.是否简化审
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 时间相关信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:calendar" class="mr-2 text-green-500" />
                  <span class="text-md font-semibold">时间相关信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >立案日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.立案日期"
                          type="date"
                          size="small"
                          placeholder="请选择立案日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.立案日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >结案日期：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.结案日期"
                          type="date"
                          size="small"
                          placeholder="请选择结案日期"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.结案日期
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >破产时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.破产时间"
                          type="date"
                          size="small"
                          placeholder="请选择破产时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.破产时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >终结时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.终结时间"
                          type="date"
                          size="small"
                          placeholder="请选择终结时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.终结时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >注销时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.注销时间"
                          type="date"
                          size="small"
                          placeholder="请选择注销时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.注销时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >归档时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.归档时间"
                          type="date"
                          size="small"
                          placeholder="请选择归档时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.归档时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权申报截止时间：</span
                      >
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.债权申报截止时间"
                          type="date"
                          size="small"
                          placeholder="请选择债权申报截止时间"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权申报截止时间
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 管理人信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:users" class="mr-2 text-purple-500" />
                  <span class="text-md font-semibold">管理人信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人负责人：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人负责人"
                          size="small"
                          placeholder="请输入管理人负责人"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人负责人
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人类型：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人类型"
                          size="small"
                          placeholder="请输入管理人类型"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人类型
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >管理人状态：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人状态"
                          size="small"
                          placeholder="请输入管理人状态"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.管理人状态
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >律师事务所：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.律师事务所"
                          size="small"
                          placeholder="请输入律师事务所"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.律师事务所
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>

            <!-- 债权人信息 -->
            <ElCard class="category-card mb-4" shadow="hover">
              <template #header>
                <div class="category-header">
                  <Icon icon="lucide:handshake" class="mr-2 text-orange-500" />
                  <span class="text-md font-semibold">债权人信息</span>
                </div>
              </template>
              <div class="category-content">
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权人名称：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.债权人名称"
                          size="small"
                          placeholder="请输入债权人名称"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权人名称
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >债权人类型：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.债权人类型"
                          size="small"
                          placeholder="请输入债权人类型"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.债权人类型
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >联系电话：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.联系电话"
                          size="small"
                          placeholder="请输入联系电话"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.联系电话
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="12" :md="8" :lg="6">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >联系邮箱：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.联系邮箱"
                          size="small"
                          placeholder="请输入联系邮箱"
                          style="width: 160px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.联系邮箱
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                  <ElCol :xs="24" :sm="24" :md="16" :lg="12">
                    <div
                      class="detail-info-item flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <span class="detail-info-label font-medium text-gray-600"
                        >办公地址：</span
                      >
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.办公地址"
                          size="small"
                          placeholder="请输入办公地址"
                          style="width: 300px"
                        />
                      </template>
                      <template v-else>
                        <span class="detail-info-value text-gray-900">{{
                          caseDetail.办公地址
                        }}</span>
                      </template>
                    </div>
                  </ElCol>
                </ElRow>
              </div>
            </ElCard>
          </div>
        </div>

        <div v-else class="error-container">
          <ElEmpty description="案件信息加载失败" />
        </div>
      </ElCard>

      <!-- 文件上传组件 -->
      <FileUploader :biz-id="Number(caseId)" biz-type="case" multiple />
    </div>

    <!-- 流程处理 -->
    <div v-if="activeTab === 'process'">
      <ElCard shadow="hover">
        <template #header>
          <div class="process-header">
            <h2 class="process-title">案件流程处理</h2>
            <p class="process-description">管理破产案件的七个阶段流程</p>
          </div>
        </template>

        <div class="process-content">
          <div class="stage-navigation">
            <div class="stage-indicators">
              <div
                v-for="stage in stages"
                :key="stage.id"
                class="stage-dot"
                :class="[{ active: currentStage === stage.id }]"
                @click="currentStage = stage.id"
              >
                <span class="stage-number">{{ stage.id }}</span>
                <div class="stage-tooltip">
                  <div class="stage-tooltip-name">{{ stage.name }}</div>
                  <div class="stage-tooltip-desc">{{ stage.description }}</div>
                </div>
              </div>
            </div>
            <div class="stage-controls">
              <ElButton
                :disabled="currentStage === 1"
                @click="currentStage--"
                size="small"
              >
                <Icon icon="lucide:chevron-left" class="mr-1" />
                上一阶段
              </ElButton>
              <ElButton
                :disabled="currentStage === 7"
                @click="currentStage++"
                type="primary"
                size="small"
              >
                下一阶段
                <Icon icon="lucide:chevron-right" class="ml-1" />
              </ElButton>
            </div>
          </div>

          <div class="stage-content">
            <StageOneProcess v-if="currentStage === 1" :case-id="caseId" />
            <StageTwoProcess v-else-if="currentStage === 2" :case-id="caseId" />
            <StageThreeProcess
              v-else-if="currentStage === 3"
              :case-id="caseId"
            />
            <StageFourProcess
              v-else-if="currentStage === 4"
              :case-id="caseId"
            />
            <StageFiveProcess
              v-else-if="currentStage === 5"
              :case-id="caseId"
            />
            <StageSixProcess v-else-if="currentStage === 6" :case-id="caseId" />
            <StageSevenProcess
              v-else-if="currentStage === 7"
              :case-id="caseId"
            />
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 债权人信息 -->
    <div v-if="activeTab === 'creditorInfo'">
      <CreditorInfo :case-id="caseId" />
    </div>

    <!-- 债权登记表 -->
    <div v-if="activeTab === 'claimRegistration'">
      <ClaimRegistration :case-id="caseId" />
    </div>

    <!-- 公告管理 -->
    <div v-if="activeTab === 'announcement'">
      <ElCard class="case-info-card" shadow="hover">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:bullhorn" class="mr-2 text-blue-500" />
              <span class="text-lg font-semibold">公告管理</span>
            </div>
            <div class="flex items-center space-x-2">
              <ElSelect
                v-model="statusFilter"
                placeholder="筛选状态"
                clearable
                size="default"
                @change="handleStatusFilterChange"
                style="width: 150px"
              >
                <ElOption label="全部" value="" />
                <ElOption label="草稿" value="DRAFT" />
                <ElOption label="已发布" value="PUBLISHED" />
                <ElOption label="已撤回" value="RETRACTED" />
              </ElSelect>
              <ElButton type="primary" @click="openNewAnnouncementDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                发布新公告
              </ElButton>
            </div>
          </div>
        </template>

        <!-- 公告列表 -->
        <div class="announcement-list-container">
          <ElTable
            v-loading="loadingAnnouncements"
            :data="announcements"
            border
            stripe
            style="width: 100%"
            class="mb-4"
          >
            <ElTableColumn prop="title" label="公告标题" min-width="200">
              <template #default="scope">
                <div class="title-cell">
                  <Icon
                    v-if="scope.row.is_top === 1"
                    icon="lucide:pin"
                    class="top-icon"
                  />
                  <span>{{ scope.row.title }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="announcement_type"
              label="公告类型"
              width="100"
            >
              <template #default="scope">
                <ElTag
                  :type="
                    scope.row.announcement_type === 'URGENT'
                      ? 'danger'
                      : scope.row.announcement_type === 'IMPORTANT'
                        ? 'warning'
                        : 'info'
                  "
                  size="small"
                >
                  {{
                    scope.row.announcement_type === 'URGENT'
                      ? '紧急'
                      : scope.row.announcement_type === 'IMPORTANT'
                        ? '重要'
                        : '普通'
                  }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="publishTime" label="发布时间" width="180">
              <template #default="scope">
                {{ formatDateOnly(scope.row.publishTime) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="publisherName" label="发布人" width="120" />
            <ElTableColumn prop="ah" label="案号" min-width="150" />
            <ElTableColumn prop="glyfrz" label="主要负责人" width="150" />
            <ElTableColumn prop="viewCount" label="浏览次数" width="100">
              <template #default="scope">
                <div class="view-count-cell">
                  <Icon icon="lucide:eye" class="eye-icon" />
                  <span>{{ scope.row.viewCount || 0 }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="附件" width="100">
              <template #default="scope">
                <div
                  v-if="
                    scope.row.attachments && scope.row.attachments.length > 0
                  "
                  class="attachment-count-cell"
                >
                  <Icon icon="lucide:paperclip" class="attachment-icon" />
                  <span>{{ scope.row.attachments.length }}</span>
                </div>
                <span v-else class="no-attachment">无</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="状态" width="120">
              <template #default="scope">
                <ElTag
                  :type="
                    scope.row.status === 'PUBLISHED'
                      ? 'success'
                      : scope.row.status === 'RETRACTED'
                        ? 'info'
                        : 'warning'
                  "
                  class="status-tag"
                >
                  {{
                    scope.row.status === 'PUBLISHED'
                      ? '已发布'
                      : scope.row.status === 'RETRACTED'
                        ? '已撤回'
                        : '草稿'
                  }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="350" fixed="right">
              <template #default="scope">
                <ElButton
                  type="success"
                  size="small"
                  @click="viewAnnouncementDetail(scope.row)"
                >
                  查看详情
                </ElButton>
                <ElButton
                  v-if="scope.row.status === 'DRAFT'"
                  type="primary"
                  size="small"
                  @click="publishAnnouncement(scope.row.id)"
                  style="margin-left: 8px"
                >
                  发布
                </ElButton>
                <ElButton
                  v-else-if="scope.row.status === 'PUBLISHED'"
                  type="warning"
                  size="small"
                  @click="revokeAnnouncement(scope.row.id)"
                  style="margin-left: 8px"
                >
                  撤销
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  @click="editAnnouncement(scope.row)"
                  style="margin-left: 8px"
                >
                  编辑
                </ElButton>
                <ElPopconfirm
                  title="确定要删除这条公告吗？"
                  @confirm="deleteAnnouncement(scope.row.id)"
                >
                  <ElButton type="danger" size="small" style="margin-left: 8px">
                    删除
                  </ElButton>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页 -->
          <div class="pagination-container flex justify-end">
            <ElPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalAnnouncements"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 团队管理卡片 -->
    <div v-if="activeTab === 'teamManage'">
      <TeamMemberManage :case-id="Number(caseId)" :is-creator="isCreator" />
    </div>

    <!-- 工作团队卡片 -->
    <div v-if="activeTab === 'workTeam'" style="margin: 20px 0">
      <div
        style="
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        "
      >
        <!-- 标题和操作按钮 -->
        <div
          style="
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <h2 style="color: #333; margin: 0; font-size: 18px">
              工作团队成员管理
            </h2>
            <div style="display: flex; gap: 10px">
              <ElButton
                type="primary"
                @click="handleAddMember"
                v-if="isCreator"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                添加成员
              </ElButton>
            </div>
          </div>
        </div>

        <div v-if="workTeamLoading" class="loading-container">
          <ElSkeleton :rows="5" animated />
        </div>

        <div v-else class="case-info-content">
          <ElCard class="category-card mb-4" shadow="hover">
            <template #header>
              <div class="category-header">
                <Icon icon="lucide:users" class="mr-2 text-blue-500" />
                <span class="text-md font-semibold">团队成员列表</span>
              </div>
            </template>
            <div class="category-content">
              <ElTable :data="teamMembers" style="width: 100%">
                <ElTableColumn prop="userName" label="成员姓名" width="150" />
                <ElTableColumn prop="userCode" label="用户编码" width="150" />
                <ElTableColumn
                  prop="teamRoleName"
                  label="团队角色"
                  width="150"
                />
                <ElTableColumn
                  prop="permissionLevel"
                  label="权限级别"
                  width="120"
                >
                  <template #default="{ row }">
                    <ElTag :type="getPermissionTagType(row.permissionLevel)">
                      {{ getPermissionLabel(row.permissionLevel) }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="isActive" label="状态" width="100">
                  <template #default="{ row }">
                    <ElTag :type="row.isActive ? 'success' : 'danger'">
                      {{ row.isActive ? '激活' : '禁用' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="200" v-if="isCreator">
                  <template #default="{ row }">
                    <ElButton size="small" @click="handleEditMember(row)">
                      <Icon icon="lucide:pencil" class="mr-1" />
                      编辑
                    </ElButton>
                    <ElPopconfirm
                      title="确定要移除该成员吗？"
                      @confirm="handleRemoveMember(row)"
                    >
                      <ElButton
                        size="small"
                        type="danger"
                        style="margin-left: 8px"
                      >
                        <Icon icon="lucide:trash-2" class="mr-1" />
                        移除
                      </ElButton>
                    </ElPopconfirm>
                  </template>
                </ElTableColumn>
              </ElTable>

              <div
                v-if="teamMembers.length === 0"
                class="empty-state"
                style="padding: 40px; text-align: center"
              >
                <ElEmpty description="暂无团队成员" />
              </div>
            </div>
          </ElCard>
        </div>
      </div>

      <!-- 添加/编辑成员对话框 -->
      <ElDialog
        v-model="memberDialogVisible"
        :title="memberDialogTitle"
        width="600px"
        destroy-on-close
      >
        <ElForm :model="memberForm" label-width="100px">
          <ElFormItem label="成员" required>
            <ElSelect
              v-model="memberForm.userId"
              filterable
              placeholder="选择成员"
              style="width: 100%"
            >
              <ElOption
                v-for="user in availableUsers"
                :key="user.uPid"
                :label="user.uName"
                :value="user.uPid"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="团队角色" required>
            <ElSelect
              v-model="memberForm.teamRole"
              placeholder="选择角色"
              style="width: 100%"
            >
              <ElOption
                v-for="role in teamRoles"
                :key="role.roleCode"
                :label="role.roleName"
                :value="role.roleCode"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="权限级别" required>
            <ElSelect
              v-model="memberForm.permissionLevel"
              placeholder="选择权限"
              style="width: 100%"
            >
              <ElOption label="查看" value="VIEW" />
              <ElOption label="编辑" value="EDIT" />
              <ElOption label="完全控制" value="FULL" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="memberDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSaveMember">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 公告编辑对话框 -->
      <ElDialog
        v-model="showAnnouncementDialog"
        :title="dialogTitle"
        width="80%"
        destroy-on-close
      >
        <div class="announcement-editor-container">
          <div class="mb-4">
            <ElForm label-width="80px">
              <ElFormItem label="公告标题" required>
                <ElInput
                  v-model="announcementData.title"
                  placeholder="请输入公告标题"
                  size="large"
                />
              </ElFormItem>
              <ElFormItem label="公告内容" required>
                <RichTextEditor
                  v-model="announcementData.content"
                  placeholder="请输入公告内容"
                  height="400px"
                />
              </ElFormItem>
              <ElFormItem label="公告类型">
                <ElSelect
                  v-model="announcementData.announcement_type"
                  size="large"
                >
                  <ElOption label="普通" value="NORMAL" />
                  <ElOption label="紧急" value="URGENT" />
                  <ElOption label="重要" value="IMPORTANT" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="公告状态">
                <ElSelect v-model="announcementData.status" size="large">
                  <ElOption label="草稿" value="DRAFT" />
                  <ElOption label="已发布" value="PUBLISHED" />
                  <ElOption label="已撤回" value="RETRACTED" />
                </ElSelect>
              </ElFormItem>
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <ElFormItem label="是否置顶">
                    <ElSwitch v-model="announcementData.is_top" size="large" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem
                    label="置顶过期时间"
                    v-if="announcementData.is_top"
                  >
                    <ElDatePicker
                      v-model="announcementData.top_expire_time"
                      type="datetime"
                      placeholder="选择置顶过期时间"
                      size="large"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElFormItem label="公告附件">
                <ElUpload
                  v-model:file-list="announcementData.attachments"
                  :auto-upload="false"
                  :on-change="handleAttachmentChange"
                  :on-remove="handleAttachmentRemove"
                  :before-upload="handleAnnouncementFileBeforeUpload"
                  :limit="10"
                  multiple
                  class="attachment-upload"
                >
                  <ElButton type="primary" size="small">
                    <Icon icon="lucide:paperclip" class="mr-1" />
                    添加附件
                  </ElButton>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持上传文档、图片等文件，单个文件不超过50MB
                    </div>
                  </template>
                </ElUpload>
              </ElFormItem>
            </ElForm>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="closeAnnouncementDialog">取消</ElButton>
            <ElButton type="primary" @click="saveAnnouncement">确定</ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 撤回公告对话框 -->
      <ElDialog
        v-model="showRevokeDialog"
        title="撤回公告"
        width="500px"
        destroy-on-close
      >
        <div class="revoke-dialog-container">
          <ElForm label-width="80px">
            <ElFormItem label="撤回原因">
              <ElInput
                v-model="revokeReason"
                type="textarea"
                :rows="4"
                placeholder="请输入撤回原因（可选）"
              />
            </ElFormItem>
          </ElForm>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="showRevokeDialog = false">取消</ElButton>
            <ElButton type="danger" @click="confirmRevokeAnnouncement">
              确认撤回
            </ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 公告详情对话框 -->
      <ElDialog
        v-model="showDetailDialog"
        :title="currentAnnouncementDetail?.title"
        width="70%"
        destroy-on-close
      >
        <div v-loading="detailLoading" class="announcement-detail-container">
          <div v-if="currentAnnouncementDetail" class="detail-content">
            <div class="detail-meta">
              <div class="meta-row">
                <span class="label">公告类型：</span>
                <ElTag
                  :type="
                    currentAnnouncementDetail.announcement_type === 'URGENT'
                      ? 'danger'
                      : currentAnnouncementDetail.announcement_type ===
                          'IMPORTANT'
                        ? 'warning'
                        : 'info'
                  "
                  size="small"
                >
                  {{
                    currentAnnouncementDetail.announcement_type === 'URGENT'
                      ? '紧急'
                      : currentAnnouncementDetail.announcement_type ===
                          'IMPORTANT'
                        ? '重要'
                        : '普通'
                  }}
                </ElTag>
              </div>
              <div class="meta-row">
                <span class="label">状态：</span>
                <ElTag
                  :type="
                    currentAnnouncementDetail.status === 'PUBLISHED'
                      ? 'success'
                      : currentAnnouncementDetail.status === 'RETRACTED'
                        ? 'info'
                        : 'warning'
                  "
                  size="small"
                >
                  {{
                    currentAnnouncementDetail.status === 'PUBLISHED'
                      ? '已发布'
                      : currentAnnouncementDetail.status === 'RETRACTED'
                        ? '已撤回'
                        : '草稿'
                  }}
                </ElTag>
              </div>
              <div class="meta-row">
                <span class="label">发布人：</span>
                <span>{{ currentAnnouncementDetail.publisher_name }}</span>
              </div>
              <div class="meta-row">
                <span class="label">发布时间：</span>
                <span>{{
                  formatDateOnly(currentAnnouncementDetail.publish_time)
                }}</span>
              </div>
              <div class="meta-row">
                <span class="label">案号：</span>
                <span>{{ currentAnnouncementDetail.ah }}</span>
              </div>
              <div class="meta-row">
                <span class="label">主要负责人：</span>
                <span>{{ currentAnnouncementDetail.glyfrz }}</span>
              </div>
              <div class="meta-row">
                <span class="label">浏览次数：</span>
                <span>{{
                  currentAnnouncementDetail.viewCount ||
                  currentAnnouncementDetail.view_count ||
                  0
                }}</span>
                <ElButton
                  link
                  type="primary"
                  size="small"
                  @click="viewAnnouncementViews(currentAnnouncementDetail)"
                  style="margin-left: 12px"
                >
                  查看浏览记录
                </ElButton>
              </div>
              <div class="meta-row">
                <span class="label">是否置顶：</span>
                <ElTag
                  :type="
                    currentAnnouncementDetail.is_top === 1 ? 'danger' : 'info'
                  "
                  size="small"
                >
                  {{
                    currentAnnouncementDetail.is_top === 1 ? '已置顶' : '未置顶'
                  }}
                </ElTag>
              </div>
              <div
                v-if="
                  currentAnnouncementDetail.is_top === 1 &&
                  currentAnnouncementDetail.top_expire_time
                "
                class="meta-row"
              >
                <span class="label">置顶过期时间：</span>
                <span>{{
                  formatDate(currentAnnouncementDetail.top_expire_time)
                }}</span>
              </div>
            </div>

            <div class="detail-body">
              <h4 class="section-title">公告内容</h4>
              <div
                class="content-html"
                v-html="currentAnnouncementDetail.content"
              ></div>
            </div>

            <div
              v-if="
                currentAnnouncementDetail.attachments &&
                currentAnnouncementDetail.attachments.length > 0
              "
              class="detail-attachments"
            >
              <h4 class="section-title">附件</h4>
              <div class="attachment-list">
                <div
                  v-for="(
                    attachment, index
                  ) in currentAnnouncementDetail.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <Icon icon="lucide:paperclip" class="attachment-icon" />
                  <span class="attachment-name">{{
                    attachment.file_name
                  }}</span>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="viewAttachment(attachment)"
                    style="margin-right: 8px"
                  >
                    查看
                  </ElButton>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click="downloadAttachment(attachment)"
                  >
                    下载
                  </ElButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElDialog>

      <!-- 文件预览对话框 -->
      <ElDialog
        v-model="showPreviewDialog"
        :title="previewAttachment?.file_name || '文件预览'"
        width="90%"
        destroy-on-close
      >
        <div
          v-loading="previewLoading"
          class="file-preview-container"
          v-if="previewAttachment"
        >
          <!-- 图片预览 -->
          <div v-if="isImage" class="image-preview">
            <img :src="previewUrl" alt="文件预览" />
          </div>

          <!-- PDF预览 -->
          <div v-else-if="isPdf" class="pdf-preview">
            <iframe :src="previewUrl" frameborder="0"></iframe>
          </div>

          <!-- 文本预览 -->
          <div v-else-if="isText" class="text-preview">
            <ElScrollbar height="600px">
              <pre>{{ textContent }}</pre>
            </ElScrollbar>
          </div>

          <!-- 不支持的文件类型 -->
          <div v-else class="unsupported-preview">
            <Icon icon="lucide:file-question" class="unsupported-icon" />
            <h3>不支持的文件类型</h3>
            <p>该文件类型不支持在线预览，建议下载后查看</p>
            <ElButton
              type="primary"
              @click="downloadAttachment(previewAttachment)"
              style="margin-top: 16px"
            >
              <Icon icon="lucide:download" class="mr-1" />
              下载文件
            </ElButton>
          </div>
        </div>
      </ElDialog>

      <!-- 浏览记录对话框 -->
      <ElDialog
        v-model="showViewsDialog"
        title="浏览记录"
        width="70%"
        destroy-on-close
      >
        <div v-loading="viewsLoading" class="views-container">
          <ElTable :data="viewsList" border stripe style="width: 100%">
            <ElTableColumn prop="viewer_name" label="浏览人" width="150" />
            <ElTableColumn prop="view_time" label="浏览时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.view_time) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="ip_address" label="IP地址" width="150" />
          </ElTable>

          <div v-if="viewsTotal > 0" class="pagination-container">
            <ElPagination
              v-model:current-page="viewsCurrentPage"
              v-model:page-size="viewsPageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              :total="viewsTotal"
              @size-change="handleViewsPageSizeChange"
              @current-change="handleViewsPageChange"
            />
          </div>

          <div
            v-if="viewsList.length === 0 && !viewsLoading"
            class="empty-state"
          >
            <ElEmpty description="暂无浏览记录" />
          </div>
        </div>
      </ElDialog>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .case-detail-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .page-title {
    font-size: 20px;
  }
}

.case-detail-container {
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
  background: #fff;
}

.page-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.content-tabs {
  margin-bottom: 20px;
}

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tabs-container :deep(.el-radio-button) {
  margin: 0 !important;
}

.tab-button {
  min-width: 120px;
}

.case-info-card {
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.key-info-overview {
  margin-bottom: 24px;
}

.key-info-item {
  background: #fff;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.key-info-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.detail-info-grid {
  overflow: hidden;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
}

.detail-info-item {
  background: #fff;
  transition: background-color 0.2s ease;
}

.detail-info-item:hover {
  background-color: #f8fafc;
}

.detail-info-label {
  min-width: 120px;
  font-weight: 500;
  color: #6b7280;
}

.detail-info-value {
  font-weight: 400;
  color: #1f2937;
  text-align: right;
  word-break: break-all;
}

.loading-container {
  padding: 20px;
  background: #fff;
}

.announcement-editor-container {
  padding: 20px;
}

.editor-wrapper {
  width: 100%;
}

.error-container {
  padding: 40px 20px;
  background: #fff;
}

/* 确保所有文本都有足够的对比度 */
:deep(.el-card__body) {
  color: #1f2937;
}

:deep(.el-table) {
  color: #1f2937;
}

:deep(.el-tag) {
  color: #fff;
}

.status-tag {
  color: #000 !important;
}

.process-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.process-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.process-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.process-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stage-navigation {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.stage-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.stage-dot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.stage-dot:hover {
  background: #9ca3af;
  transform: scale(1.1);
}

.stage-dot.active {
  background: #409eff;
  box-shadow: 0 0 0 4px rgb(64 158 255 / 20%);
  transform: scale(1.2);
}

.stage-number {
  z-index: 1;
}

.stage-tooltip {
  position: absolute;
  bottom: 50px;
  left: 50%;
  z-index: 10;
  visibility: hidden;
  min-width: 150px;
  padding: 8px 12px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  background: #1f2937;
  border-radius: 6px;
  opacity: 0;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

.stage-tooltip::after {
  position: absolute;
  top: 100%;
  left: 50%;
  content: '';
  border: 6px solid transparent;
  border-top-color: #1f2937;
  transform: translateX(-50%);
}

.stage-dot:hover .stage-tooltip {
  bottom: 55px;
  visibility: visible;
  opacity: 1;
}

.stage-tooltip-name {
  margin-bottom: 4px;
  font-weight: 600;
}

.stage-tooltip-desc {
  font-size: 11px;
  color: #d1d5db;
}

.stage-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.stage-content {
  min-height: 400px;
}

.title-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.top-icon {
  font-size: 16px;
  color: #ef4444;
}

.view-count-cell {
  display: flex;
  gap: 4px;
  align-items: center;
}

.eye-icon {
  font-size: 14px;
  color: #6b7280;
}

.attachment-count-cell {
  display: flex;
  gap: 4px;
  align-items: center;
}

.attachment-count-cell .attachment-icon {
  margin-right: 4px;
  font-size: 14px;
  color: #6b7280;
}

.no-attachment {
  font-size: 13px;
  color: #9ca3af;
}

.revoke-dialog-container {
  padding: 10px 0;
}

.attachment-upload {
  width: 100%;
}

.attachment-upload :deep(.el-upload-list) {
  max-height: 200px;
  overflow-y: auto;
}

.attachment-upload :deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.announcement-detail-container {
  padding: 10px 0;
}

.detail-content {
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
  min-width: 100px;
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

.detail-attachments {
  padding: 20px;
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.3s;
}

.attachment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgb(59 130 246 / 10%);
}

.attachment-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #6b7280;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
}

.views-container {
  padding: 10px 0;
}

.empty-state {
  padding: 60px 0;
}

/* 文件预览对话框样式 */
.file-preview-container {
  max-height: 700px;
  padding: 20px;
}

.image-preview img {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.pdf-preview iframe {
  width: 100%;
  height: 600px;
}

.text-preview pre {
  padding: 10px;
  margin: 0;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.unsupported-preview {
  padding: 40px;
  color: #909399;
  text-align: center;
}

.unsupported-icon {
  margin-bottom: 20px;
  font-size: 64px;
  color: #e6a23c;
}

.unsupported-preview h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #606266;
}

.unsupported-preview p {
  margin-bottom: 20px;
  color: #909399;
}
</style>
