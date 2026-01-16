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
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseDetailApi, updateCaseApi } from '#/api/core/case';
import {
  createAnnouncementApi,
  createViewRecordApi,
  deleteAnnouncementApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  getAnnouncementViewsApi,
  publishAnnouncementApi,
  topAnnouncementApi,
  unTopAnnouncementApi,
  updateAnnouncementApi,
} from '#/api/core/case-announcement';
import { deleteFileApi, downloadFileApi, uploadFileApi } from '#/api/core/file';
import { getManagerListApi } from '#/api/core/manager';
import { getUserByDeptIdApi, getUsersApi } from '#/api/core/user';
import {
  addTeamMemberApi,
  createWorkTeamApi,
  getMemberPermissionsApi,
  getWorkTeamDetailWithMembersApi,
  getWorkTeamListWithDetailsApi,
  removeTeamMemberApi,
  updateMemberPermissionApi,
} from '#/api/core/work-team';

import RichTextEditor from '../../../components/RichTextEditor.vue';
import ArchiveDrawer from './components/ArchiveDrawer.vue';
import AssetManagement from './components/AssetManagement.vue';
import ClaimRegistrationTabs from './components/ClaimRegistrationTabs.vue';
import CreditorInfo from './components/CreditorInfo.vue';
import DebtorInfo from './components/DebtorInfo.vue';
import FundControlDrawer from './components/FundControlDrawer.vue';

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const caseId = ref(route.params.id as string);
const loading = ref(false);
const caseDetail = ref<any>(null);
const isInfoCollapsed = ref(false);
const isEditing = ref(false);
const editedData = reactive<any>({});
const saveLoading = ref(false);

// 权限控制相关
const canEdit = ref(false);
const canDelete = ref(false);
const isCreator = ref(false);
const teamMemberInfo = ref<any>(null);

// 案件卷宗归档相关
const archiveDrawerRef = ref<InstanceType<typeof ArchiveDrawer> | null>(null);

// 工作团队相关
const workTeams = ref<any[]>([]);
const teamMembers = ref<any[]>([]);
const teamRoles = ref<any[]>([]);
const availableUsers = ref<any[]>([]);
const workTeamLoading = ref(false);
const memberDialogVisible = ref(false);
const memberDialogTitle = ref('添加成员');
const memberForm = ref<any>({
  id: null,
  userId: [],
  teamRole: '',
  permissionLevel: 'VIEW',
});
const selectedTeamId = ref<null | number>(null);
const expandedTeams = ref<Set<number>>(new Set());

// 添加工作团队相关
const addTeamDialogVisible = ref(false);
const addTeamForm = ref<any>({
  teamName: '',
  teamLeaderId: null,
  teamDescription: '',
});
const teamLeaderList = ref<any[]>([]);
const teamLeaderLoading = ref(false);

// 管理员机构和用户选择相关
const administrators = ref<any[]>([]);
const loadingAdministrators = ref(false);
const loadingUsers = ref(false);
const selectedDeptId = ref<null | number>(null);
const selectedUser = ref<any[]>([]);

// 保存成员时的加载状态
const savingMember = ref(false);

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

// 监听activeTab变化，加载对应数据
watch(activeTab, async (newTab) => {
  if (newTab === 'announcement') {
    await fetchAnnouncements();
  } else if (newTab === 'workTeam') {
    await fetchWorkTeams();
    fetchTeamRoles();
    await loadAdministrators();
    fetchAvailableUsers();
  }
});

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

const showTopDialog = ref(false);
const topExpireTime = ref('');
const currentTopAnnouncementId = ref<null | string>(null);

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

const fundControlDrawerRef = ref<InstanceType<typeof FundControlDrawer> | null>(
  null,
);

const showAssetManagementDialog = ref(false);

// 公告主要负责人候选列表
const announcementPrincipalOfficerOptions = ref<any[]>([]);

// 预览附件
const viewAttachment = async (attachment: any) => {
  try {
    previewLoading.value = true;
    previewAttachment.value = attachment;

    // 确定文件类型
    const fileName = attachment.file_name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeType = attachment.type || '';
    const fileId = attachment.file_id;
    const token = localStorage.getItem('token');

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
    if (isImage.value) {
      // 对于图片，使用fetch获取blob并转换为URL，以便添加认证头
      const response = await fetch(`/api/v1/file/preview/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        previewUrl.value = URL.createObjectURL(blob);
        showPreviewDialog.value = true;
      } else {
        throw new Error('预览失败');
      }
      previewLoading.value = false;
    } else if (isPdf.value) {
      // 对于PDF，由于直接使用iframe无法添加请求头，我们需要先获取blob再转换为URL
      const response = await fetch(`/api/v1/file/preview/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        previewUrl.value = URL.createObjectURL(blob);
        showPreviewDialog.value = true;
      } else {
        throw new Error('预览失败');
      }
      previewLoading.value = false;
    } else if (isText.value) {
      // 对于文本文件，使用预览URL获取文本内容，并添加认证头
      const response = await fetch(`/api/v1/file/preview/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
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
  // 释放通过URL.createObjectURL创建的URL对象
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
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
    const response = await getAnnouncementListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number.parseInt(caseId.value),
      status: statusFilter.value || undefined,
    });
    if (response.code === 200 && response.data) {
      // 将驼峰命名转换为下划线命名，以匹配表格组件的预期
      const list = (response.data.list || []).map((item: any) => ({
        ...item,
        announcement_type: item.announcementType,
        is_top: item.isTop ? 1 : 0,
        top_expire_time: item.topExpireTime,
        publisher_name: item.publisherName,
        publish_time: item.publishTime,
        view_count: item.viewCount,
      }));
      announcements.value = list;
      totalAnnouncements.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.message || '未知错误'}`);
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

    // 准备请求数据
    const requestData = {
      caseId: Number(caseId.value),
      caseNumber: isEditing
        ? announcementData.caseNumber
        : caseDetail.value?.案号 || '',
      principalOfficer: announcementData.principalOfficer || '',
      title: announcementData.title,
      content: announcementData.content,
      announcementType: announcementData.announcement_type,
      attachments: announcementData.attachments
        ? JSON.stringify(announcementData.attachments)
        : undefined,
    };

    if (isEditing && announcementId) {
      console.log('4. 进入更新公告分支');
      // 更新现有公告
      response = await updateAnnouncementApi(announcementId, requestData);
      console.log('5. updateAnnouncementApi 响应:', response);
      if (response.code === 200) {
        ElMessage.success('公告更新成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告更新失败：${response.message || '未知错误'}`);
      }
    } else {
      console.log('4. 进入发布新公告分支');
      // 发布新公告
      response = await createAnnouncementApi(requestData);
      console.log('5. createAnnouncementApi 响应:', response);
      if (response.code === 200) {
        ElMessage.success('公告发布成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告发布失败：${response.message || '未知错误'}`);
      }
    }
  } catch (error) {
    console.error('保存公告失败:', error);
    ElMessage.error('保存公告失败');
  }
};

// 发布公告
const publishAnnouncement = async (
  announcementId: string,
  topExpireTime?: string,
) => {
  try {
    const response = await publishAnnouncementApi(Number(announcementId), {
      topExpireTime,
    });
    ElMessage.success('公告发布成功');
    await fetchAnnouncements();
  } catch (error) {
    console.error('发布公告失败:', error);
    ElMessage.error('发布公告失败');
  }
};

// 撤销公告（将已发布改为草稿）
const revokeAnnouncement = async (announcementId: string) => {
  currentRevokeAnnouncementId.value = announcementId;
  revokeReason.value = '';
  showRevokeDialog.value = true;
};

const confirmRevokeAnnouncement = async () => {
  if (!currentRevokeAnnouncementId.value) return;

  try {
    const response = await updateAnnouncementApi(
      Number(currentRevokeAnnouncementId.value),
      { status: 'DRAFT' as any },
    );
    ElMessage.success('公告已撤回为草稿');
    await fetchAnnouncements();
    showRevokeDialog.value = false;
    revokeReason.value = '';
    currentRevokeAnnouncementId.value = null;
  } catch (error) {
    console.error('撤回公告失败:', error);
    ElMessage.error('撤回公告失败');
  }
};

const topAnnouncement = (announcementId: string) => {
  currentTopAnnouncementId.value = announcementId;
  topExpireTime.value = '';
  showTopDialog.value = true;
};

const confirmTopAnnouncement = async () => {
  if (!currentTopAnnouncementId.value) return;

  try {
    const response = await topAnnouncementApi(
      Number(currentTopAnnouncementId.value),
      { topExpireTime: topExpireTime.value },
    );
    ElMessage.success('公告置顶成功');
    await fetchAnnouncements();
    showTopDialog.value = false;
    topExpireTime.value = '';
    currentTopAnnouncementId.value = null;
  } catch (error) {
    console.error('置顶公告失败:', error);
    ElMessage.error('置顶公告失败');
  }
};

// 取消置顶公告
const unTopAnnouncement = async (announcementId: string) => {
  try {
    const response = await unTopAnnouncementApi(Number(announcementId));
    ElMessage.success('公告取消置顶成功');
    await fetchAnnouncements();
  } catch (error) {
    console.error('取消置顶公告失败:', error);
    ElMessage.error('取消置顶公告失败');
  }
};

// 删除公告
const deleteAnnouncement = async (announcementId: string) => {
  try {
    const response = await deleteAnnouncementApi(Number(announcementId));
    ElMessage.success('公告删除成功');
    await fetchAnnouncements();
  } catch (error) {
    console.error('删除公告失败:', error);
    ElMessage.error('删除公告失败');
  }
};

// 编辑公告
const editAnnouncement = async (announcement: any) => {
  console.log('=== 编辑公告调试信息 ===');
  console.log('公告对象:', announcement);

  isEditingAnnouncement.value = true;

  // 加载工作团队成员列表作为主要负责人候选
  await loadAnnouncementPrincipalOfficerOptions();

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
    announcement.announcementType ||
    announcement.announcement_type ||
    'ANNOUNCEMENT';
  announcementData.status = announcement.status || 'DRAFT';
  announcementData.is_top = Boolean(announcement.isTop || announcement.is_top);
  announcementData.top_expire_time =
    announcement.topExpireTime || announcement.top_expire_time || '';

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

  // 处理附件字段映射，确保使用正确的file_id
  attachments = attachments.map((attach: any) => ({
    ...attach,
    file_name: attach.name || attach.file_name || '未知文件',
    file_id: attach.file_id || attach.id || attach.uid || Date.now(),
    type: attach.type || 'application/octet-stream',
  }));

  announcementData.attachments = attachments;
  announcementData.caseNumber =
    announcement.caseNumber || announcement.ah || '';
  announcementData.principalOfficer =
    announcement.principalOfficer || announcement.glyfrz || '';

  showAnnouncementDialog.value = true;
};

const viewAnnouncementDetail = async (announcement: any) => {
  console.log('=== 开始执行 viewAnnouncementDetail 函数 ===');
  console.log('传入的 announcement 对象:', announcement);

  detailLoading.value = true;
  console.log('设置 detailLoading 为 true:', detailLoading.value);

  showDetailDialog.value = true;
  console.log('设置 showDetailDialog 为 true:', showDetailDialog.value);

  try {
    const announcementId =
      announcement.id ||
      announcement.announcement_id ||
      announcement.announcementId;
    console.log('提取到的 announcementId:', announcementId);

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
    console.log('获取到的查看者信息:', { viewerId, viewerName });

    // 调用查看记录接口
    await createViewRecordApi({
      announcementId: Number(announcementId),
      announcementTitle: announcement.title,
      caseId: Number(caseId.value),
      viewerId: Number(viewerId) || undefined,
      viewerName: viewerName || undefined,
    });
    console.log('查看记录接口调用成功');

    const response = await getAnnouncementDetailApi(Number(announcementId));
    console.log('getAnnouncementDetailApi 响应:', response);

    let detail = response.data;
    console.log('从响应中提取的 detail:', detail);

    // 将驼峰命名转换为下划线命名
    detail = {
      ...detail,
      announcement_type: detail.announcementType,
      is_top: detail.isTop ? 1 : 0,
      top_expire_time: detail.topExpireTime,
      publisher_name: detail.publisherName,
      publish_time: detail.publishTime,
      view_count: detail.viewCount,
    };
    console.log('转换后的 detail 数据:', detail);

    // 确保attachments字段是数组
    if (!detail.attachments) {
      detail.attachments = [];
    } else if (typeof detail.attachments === 'string') {
      try {
        detail.attachments = JSON.parse(detail.attachments);
        // 处理附件字段映射，确保文件名字段正确
        detail.attachments = detail.attachments.map((attach: any) => ({
          ...attach,
          file_name: attach.name || attach.file_name || '未知文件',
          file_id: attach.file_id || attach.id || attach.uid || Date.now(),
          type: attach.type || 'application/octet-stream',
        }));
      } catch (error) {
        console.error('解析attachments失败:', error);
        detail.attachments = [];
      }
    } else {
      // 处理附件字段映射，确保文件名字段正确
      detail.attachments = detail.attachments.map((attach: any) => ({
        ...attach,
        file_name: attach.name || attach.file_name || '未知文件',
        file_id: attach.file_id || attach.id || attach.uid || Date.now(),
        type: attach.type || 'application/octet-stream',
      }));
    }
    console.log('处理后的 attachments:', detail.attachments);

    currentAnnouncementDetail.value = detail;
    console.log(
      '设置 currentAnnouncementDetail:',
      currentAnnouncementDetail.value,
    );
    console.log('当前 showDetailDialog 状态:', showDetailDialog.value);

    ElMessage.success('公告详情加载成功');
  } catch (error) {
    console.error('获取公告详情失败:', error);
    ElMessage.error('获取公告详情失败');
  } finally {
    detailLoading.value = false;
    console.log('设置 detailLoading 为 false:', detailLoading.value);
  }
  console.log('=== viewAnnouncementDetail 函数执行结束 ===');
};

// 打开新增公告对话框
const openNewAnnouncementDialog = async () => {
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
  dialogTitle.value = '发布新公告';
  resetAnnouncement();

  // 自动设置案号
  announcementData.caseNumber = caseDetail.value?.案号 || '';

  // 加载工作团队成员列表作为主要负责人候选
  await loadAnnouncementPrincipalOfficerOptions();

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
  announcementData.announcement_type = 'ANNOUNCEMENT';
  announcementData.status = 'DRAFT';
  announcementData.is_top = false;
  announcementData.top_expire_time = '';
  announcementData.attachments = [];
  announcementData.caseNumber = '';
  announcementData.principalOfficer = '';
  // 重置编辑状态
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
};

// 加载公告主要负责人候选列表（从工作团队成员中获取）
const loadAnnouncementPrincipalOfficerOptions = async () => {
  try {
    const response = await getWorkTeamListWithDetailsApi({
      caseId: Number(caseId.value),
      pageNum: 1,
      pageSize: 100,
    });

    if (response.data && response.data.list) {
      // 提取所有团队成员
      const allMembers: any[] = [];
      response.data.list.forEach((team: any) => {
        if (team.members && Array.isArray(team.members)) {
          team.members.forEach((member: any) => {
            allMembers.push({
              label: member.userRealName || member.userName,
              value: member.userRealName || member.userName,
              userId: member.userId,
            });
          });
        }
      });

      // 去重
      const uniqueMembers = allMembers.filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.value === member.value),
      );

      announcementPrincipalOfficerOptions.value = uniqueMembers;
    } else {
      announcementPrincipalOfficerOptions.value = [];
    }
  } catch (error) {
    console.error('加载工作团队成员失败:', error);
    announcementPrincipalOfficerOptions.value = [];
  }
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

const handleAttachmentChange = async (file: any, fileList: any[]) => {
  console.log('附件变化:', file, fileList);

  // 检查文件状态，如果是新上传的文件（status为ready）且有原始文件对象，则调用上传接口
  if (file.status === 'ready' && file.raw) {
    try {
      // 确保案件ID有效
      const currentCaseId = Number(caseId.value);
      if (isNaN(currentCaseId) || currentCaseId <= 0) {
        throw new Error('无效的案件ID');
      }

      // 调用文件上传接口，使用bizType为announcement，bizId为当前案件ID
      const response = await uploadFileApi(
        file.raw,
        'announcement',
        currentCaseId,
      );

      if (response.code === 200 && response.data) {
        // 上传成功，更新文件信息
        const uploadedFile = response.data;
        // 更新fileList中的文件状态和信息
        const updatedFileList = [...fileList];
        const index = updatedFileList.findIndex(
          (item) => item.uid === file.uid,
        );
        if (index !== -1) {
          updatedFileList[index] = {
            ...updatedFileList[index],
            status: 'success',
            response: uploadedFile,
            file_id: uploadedFile.id,
            file_name: uploadedFile.originalFileName,
            type: uploadedFile.mimeType,
            size: uploadedFile.fileSize,
          };
          // 更新公告数据中的附件列表
          announcementData.attachments = updatedFileList;
        }
      } else {
        ElMessage.error(`文件上传失败：${response.message || '未知错误'}`);
      }
    } catch (error: any) {
      console.error('文件上传失败:', error);
      ElMessage.error(`文件上传失败：${error.message || '未知错误'}`);
    }
  }
};

const handleAttachmentRemove = async (file: any, fileList: any[]) => {
  console.log('附件删除:', file, fileList);

  // 如果文件已经上传到服务器，调用后端删除接口
  if (file.file_id && file.file_id !== undefined) {
    try {
      const response = await deleteFileApi(Number(file.file_id));
      ElMessage.success('文件删除成功');
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
    const downloadResponse = await downloadFileApi(attachment.file_id);

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

    // 处理浏览记录数据，将驼峰命名转换为下划线命名，以匹配表格组件的预期
    let records = response.data || [];

    // 确保records是数组
    if (!Array.isArray(records)) {
      console.error('浏览记录数据格式错误，预期是数组:', records);
      records = [];
    }

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
    // API文档没有返回总数，这里使用列表长度
    viewsTotal.value = records.length;
    console.log('处理后的浏览记录数据:', records);
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

const openArchiveDrawer = () => {
  archiveDrawerRef.value?.openDrawer();
};

const openFundControlDrawer = () => {
  fundControlDrawerRef.value?.openDrawer();
};

const openAssetManagementDialog = () => {
  showAssetManagementDialog.value = true;
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
    // 适配新的API请求格式
    const updateData: any = {
      caseName: editedData.案件名称 || caseDetail.value?.caseName,
      caseReason: editedData.案由 || caseDetail.value?.caseReason,
      remarks: editedData.备注 || caseDetail.value?.remarks,
      filingDate:
        formatDateForApi(editedData.立案日期) || caseDetail.value?.filingDate,
      caseProgress: editedData.案件进度 || caseDetail.value?.caseProgress,
      mainResponsiblePerson:
        editedData.管理人负责人 || caseDetail.value?.mainResponsiblePerson,
      designatedInstitution:
        editedData.指定机构 || caseDetail.value?.designatedInstitution,
      acceptanceCourt: editedData.受理法院 || caseDetail.value?.acceptanceCourt,
      debtClaimDeadline:
        formatDateForApi(editedData.债权申报截止时间) ||
        caseDetail.value?.debtClaimDeadline,
    };

    await updateCaseApi(Number.parseInt(caseId.value, 10), updateData);
    Object.assign(caseDetail.value, editedData);
    isEditing.value = false;
    ElMessage.success('案件信息已保存');
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
    const response = await getCaseDetailApi(Number.parseInt(caseId.value, 10));

    // 使用类型断言处理响应数据
    const responseData = response as any;

    // 检查API响应结构 - 适配新的API响应格式
    if (responseData.code === 200 && responseData.data) {
      const caseData = responseData.data;

      if (caseData) {
        // 映射API返回的英文字段为中文显示
        caseDetail.value = {
          案件ID: caseData.id || caseId.value,
          案号: caseData.caseNumber,
          案件名称: caseData.caseName,
          受理日期: caseData.acceptanceDate,
          案件来源: caseData.caseSource,
          受理法院: caseData.acceptanceCourt,
          管理人负责人: caseData.mainResponsiblePerson,
          承办法官: caseData.designatedJudge,
          案由: caseData.caseReason,
          债权申报截止时间: caseData.debtClaimDeadline,
          是否简化审: caseData.isSimplifiedTrial ? '是' : '否',
          案件进度: mapCaseProgress(caseData.caseProgress),
          立案日期: caseData.filingDate,
          破产时间: caseData.bankruptcyDate,
          终结时间: caseData.terminationDate,
          注销时间: caseData.cancellationDate,
          归档时间: caseData.archivingDate,
          结案日期: caseData.closingDate,
          指定机构: caseData.designatedInstitution,
          承办人: caseData.undertakingPersonnel,
          创建者: caseData.creatorName,
          审核状态: mapReviewStatus(caseData.reviewStatus),
          审核时间: caseData.reviewTime,
          审核意见: caseData.reviewOpinion,
          审核次数: caseData.reviewCount,
          案件状态: mapCaseStatus(caseData.caseStatus),
          创建时间: caseData.createTime,
          修改时间: caseData.updateTime,
          备注: caseData.remarks,
          文件上传路径: caseData.fileUploadPath,
        };
        ElMessage.success('案件详情加载成功');
      } else {
        throw new Error('API返回的数据结构异常');
      }
    } else {
      const errorMsg =
        responseData.message || responseData.data?.error || '未知错误';
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
        立案日期: '2023-01-10',
        破产时间: '2023-01-20',
        终结时间: '',
        注销时间: '',
        归档时间: '',
        结案日期: '',
        指定机构: '某律师事务所',
        承办人: '李四',
        创建者: '管理员',
        审核状态: '待审核',
        审核时间: '',
        审核意见: '',
        审核次数: 0,
        案件状态: '进行中',
        创建时间: '2023-01-10 10:00:00',
        修改时间: '2023-01-10 10:00:00',
        备注: '备注信息',
        文件上传路径: '/files/case/123',
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
      立案日期: '2023-01-10',
      破产时间: '2023-01-20',
      归档时间: '',
      注销时间: '',
      结案日期: '',
      指定机构: '某律师事务所',
      承办人: '李四',
      创建者: '管理员',
      审核状态: '待审核',
      审核时间: '',
      审核意见: '',
      审核次数: 0,
      案件状态: '进行中',
      创建时间: '2023-01-10 10:00:00',
      修改时间: '2023-01-10 10:00:00',
      备注: '备注信息',
      文件上传路径: '/files/case/123',
    };
  } finally {
    loading.value = false;
  }

  // 检查权限
  await checkPermissions();
});

// 映射案件进度
const mapCaseProgress = (progress: string): string => {
  const progressMap: Record<string, string> = {
    FIRST: '第一阶段',
    SECOND: '第二阶段',
    THIRD: '第三阶段',
    FOURTH: '第四阶段',
    FIFTH: '第五阶段',
    SIXTH: '第六阶段',
    SEVENTH: '第七阶段',
  };
  return progressMap[progress] || progress;
};

// 映射审核状态
const mapReviewStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
  };
  return statusMap[status] || status;
};

// 映射案件状态
const mapCaseStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: '待处理',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CLOSED: '已结案',
    TERMINATED: '已终结',
    ARCHIVED: '已归档',
  };
  return statusMap[status] || status;
};

// 获取管理员机构列表
const loadAdministrators = async () => {
  loadingAdministrators.value = true;
  try {
    const response = await getManagerListApi({});
    if (response.data && response.data.list) {
      administrators.value = response.data.list
        .filter((admin: any) => admin && admin.id != null)
        .map((admin: any) => ({
          ...admin,
          sepId: admin.id, // 使用id作为sepId
        }));
    }
  } catch (error) {
    console.error('获取管理员机构失败:', error);
    ElMessage.error('获取管理员机构失败');
  } finally {
    loadingAdministrators.value = false;
  }
};

// 加载部门下的用户列表
const loadUsersByDeptId = async (deptId: number, includeExisting = false) => {
  // 调试日志：检查传入的 deptId 值
  console.log(
    'loadUsersByDeptId 收到的 deptId:',
    deptId,
    '类型:',
    typeof deptId,
  );

  if (!deptId || Number.isNaN(deptId)) {
    console.warn('无效的部门ID:', deptId);
    availableUsers.value = [];
    return;
  }

  loadingUsers.value = true;
  try {
    const response = await getUserByDeptIdApi(deptId);
    console.log('getUserByDeptIdApi响应:', response);

    let userList = [];
    // 处理API响应结构：{ code: 200, message: "success", data: [成员数组] }
    if (
      response.code === 200 &&
      response.data &&
      Array.isArray(response.data)
    ) {
      // 正确的API响应结构
      userList = response.data;
    } else if (response.data && Array.isArray(response.data)) {
      // 直接返回数组的备用结构
      userList = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      // 包含data.data的备用结构
      userList = response.data.data;
    }

    let filteredUsers = userList.filter((user) => user && user.userId != null);

    // 如果不是编辑模式，则过滤掉已经存在于该团队的成员
    if (!includeExisting) {
      filteredUsers = filteredUsers.filter((user) => {
        // 过滤掉已经存在于该团队的成员
        // 注意：这里使用teamMembers.value可能已经不准确，因为我们已经改为直接使用team.members
        // 但这个函数主要用于添加成员时，此时teamMembers.value仍然是当前团队的成员列表
        const isMemberInTeam = teamMembers.value.some(
          (member) => member.userId === user.userId,
        );
        return !isMemberInTeam;
      });
    }

    availableUsers.value = filteredUsers.map((user) => ({
      ...user,
      uPid: user.userId, // 映射 userId 到 uPid
      uName: user.name, // 映射 name 到 uName
      uUser: user.name, // 映射 name 到 uUser
    }));

    console.log('处理后的availableUsers:', availableUsers.value);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    availableUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

// 监听部门ID变化，加载对应用户
watch(selectedDeptId, async (newVal) => {
  if (newVal && selectedTeamId.value) {
    // 重新获取当前团队的成员列表，确保过滤的是最新数据
    await fetchTeamMembers(selectedTeamId.value);
    loadUsersByDeptId(newVal);
    selectedUser.value = [];
    memberForm.value.userId = [];
  }
});

// 监听用户变化，更新表单中的userId
watch(selectedUser, (newVal) => {
  memberForm.value.userId =
    newVal && Array.isArray(newVal) ? newVal.map((user) => user.uPid) : [];
});

// 重置选择状态
const resetSelections = () => {
  selectedDeptId.value = null;
  selectedUser.value = [];
  availableUsers.value = [];
  memberForm.value.userId = [];
};

// 获取工作团队列表
const fetchWorkTeams = async () => {
  console.log('开始获取工作团队列表');
  workTeamLoading.value = true;
  try {
    const response = await getWorkTeamListWithDetailsApi({
      caseId: Number(caseId.value),
      pageNum: 1,
      pageSize: 100,
    });
    console.log('getWorkTeamListWithDetailsApi响应:', response);

    if (response.data && response.data.list) {
      workTeams.value = response.data.list;
      console.log('工作团队列表:', workTeams.value);
    } else {
      workTeams.value = [];
      console.log('该案件下没有工作团队');
    }
  } catch (error: any) {
    console.error('获取工作团队列表失败:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      '获取工作团队列表失败';
    ElMessage.error(errorMessage);
    workTeams.value = [];
  } finally {
    workTeamLoading.value = false;
    console.log('获取工作团队列表结束，loading:', workTeamLoading.value);
  }
};

// 获取指定团队的成员列表
const fetchTeamMembers = async (teamId: number) => {
  console.log('开始获取团队成员列表，teamId:', teamId);
  workTeamLoading.value = true;
  try {
    const response = await getWorkTeamDetailWithMembersApi(teamId);
    console.log('getWorkTeamDetailWithMembersApi响应:', response);

    let members = [];
    if (response.members) {
      members = response.members;
    } else if (response.data && response.data.members) {
      members = response.data.members;
    }

    teamMembers.value = members || [];
    console.log('工作团队成员列表:', teamMembers.value);
  } catch (error: any) {
    console.error('获取工作团队成员列表失败:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      '获取工作团队成员列表失败';
    ElMessage.error(errorMessage);
    teamMembers.value = [];
  } finally {
    workTeamLoading.value = false;
    console.log('获取工作团队成员列表结束，loading:', workTeamLoading.value);
  }
};

// 静态团队角色列表
const fetchTeamRoles = () => {
  // 使用静态角色列表替代后端接口调用，移除"查看者"角色
  teamRoles.value = [
    { roleCode: 'LEADER', roleName: '团队负责人' },
    { roleCode: 'MEMBER', roleName: '团队成员' },
  ];
};

// 监听团队角色变化，自动设置权限级别
watch(
  () => memberForm.value.teamRole,
  (newRole) => {
    if (newRole === 'LEADER') {
      memberForm.value.permissionLevel = 'ADMIN'; // 负责人默认权限是管理
    } else if (newRole === 'MEMBER') {
      memberForm.value.permissionLevel = 'VIEW'; // 成员默认权限是查看
    }
  },
);

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

// 获取团队负责人列表
const fetchTeamLeaders = async () => {
  teamLeaderLoading.value = true;
  try {
    // 这里需要根据实际情况获取管理人ID，暂时使用mock数据
    const administratorId = 1;
    const response = await getUserByDeptIdApi(administratorId);

    let staffList = [];
    if (response.data && Array.isArray(response.data)) {
      // 直接返回数组的响应结构
      staffList = response.data;
    } else if (
      response.data &&
      response.data.list &&
      Array.isArray(response.data.list)
    ) {
      // 包含data.list的响应结构
      staffList = response.data.list;
    }

    teamLeaderList.value = staffList
      .filter((staff: any) => staff && staff.userId != null)
      .map((staff: any) => ({
        label: staff.name,
        value: staff.userId,
      }));
  } catch (error) {
    console.error('获取团队负责人列表失败:', error);
    ElMessage.error('获取团队负责人列表失败');
    teamLeaderList.value = [];
  } finally {
    teamLeaderLoading.value = false;
  }
};

// 创建工作团队
const handleCreateWorkTeam = async () => {
  if (!addTeamForm.value.teamName || !addTeamForm.value.teamLeaderId) {
    ElMessage.warning('请填写完整的团队信息');
    return;
  }

  try {
    const response = await createWorkTeamApi({
      teamName: addTeamForm.value.teamName,
      teamLeaderId: addTeamForm.value.teamLeaderId,
      caseId: Number(caseId.value),
      teamDescription: addTeamForm.value.teamDescription,
    });

    ElMessage.success('工作团队创建成功');
    addTeamDialogVisible.value = false;
    await fetchWorkTeams();
  } catch (error: any) {
    console.error('创建工作团队失败:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || '创建工作团队失败';
    ElMessage.error(errorMessage);
  }
};

// 远程搜索团队负责人
const handleSearchLeader = async (keyword: string) => {
  if (!keyword) {
    teamLeaderList.value = [];
    return;
  }

  teamLeaderLoading.value = true;
  try {
    const response = await getUsersApi(keyword);

    let staffList = [];
    if (
      response.data &&
      response.data.users &&
      Array.isArray(response.data.users)
    ) {
      // 后端返回的数据结构：data.users
      staffList = response.data.users;
    } else if (response.data && Array.isArray(response.data)) {
      // 直接返回数组的响应结构
      staffList = response.data;
    } else if (
      response.data &&
      response.data.list &&
      Array.isArray(response.data.list)
    ) {
      // 包含data.list的响应结构
      staffList = response.data.list;
    }

    teamLeaderList.value = staffList
      .filter((staff: any) => staff && staff.id != null)
      .map((staff: any) => ({
        label: staff.realName || staff.name,
        value: staff.id,
      }));
  } catch (error) {
    console.error('搜索团队负责人失败:', error);
    ElMessage.error('搜索团队负责人失败');
    teamLeaderList.value = [];
  } finally {
    teamLeaderLoading.value = false;
  }
};

// 打开添加工作团队对话框
const openAddTeamDialog = () => {
  addTeamForm.value = {
    teamName: '',
    teamLeaderId: null,
    teamDescription: '',
  };
  addTeamDialogVisible.value = true;
};

// 添加成员
const handleAddMember = async (teamId: number) => {
  selectedTeamId.value = teamId;
  memberDialogTitle.value = '添加成员';
  memberForm.value = {
    id: null,
    userId: [],
    teamRole: '',
    permissionLevel: 'VIEW',
  };
  resetSelections();
  // 先获取该团队的成员列表，以便过滤掉已存在的成员
  await fetchTeamMembers(teamId);
  memberDialogVisible.value = true;
};

// 展开/收起团队成员列表
const toggleTeamMembers = (teamId: number) => {
  if (expandedTeams.value.has(teamId)) {
    expandedTeams.value.delete(teamId);
  } else {
    expandedTeams.value.add(teamId);
    // 直接使用API返回的团队成员数据，不再单独获取
  }
};

// 判断团队是否展开
const isTeamExpanded = (teamId: number) => {
  return expandedTeams.value.has(teamId);
};

// 获取团队状态标签类型
const getTeamStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    DELETED: 'danger',
  };
  return types[status] || 'info';
};

// 获取团队状态标签文本
const getTeamStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: '激活',
    INACTIVE: '停用',
    DELETED: '已删除',
  };
  return labels[status] || status;
};

// 编辑成员
const handleEditMember = async (row: any) => {
  memberDialogTitle.value = '编辑成员';

  // 设置selectedTeamId，确保保存时能通过验证
  selectedTeamId.value = row.teamId;

  memberForm.value = {
    id: row.id,
    userId: [row.userId], // 改为数组格式，兼容多选
    teamRole: row.teamRole,
    permissionLevel: row.permissionLevel,
  };

  // 编辑模式下，需要找到该成员所属的管理员机构并加载用户列表
  // 1. 先获取所有管理员机构
  if (administrators.value.length === 0) {
    await loadAdministrators();
  }

  // 2. 选择第一个管理员机构作为默认值（在实际应用中，应该根据成员信息找到正确的机构）
  if (administrators.value.length > 0) {
    selectedDeptId.value = administrators.value[0].sepId;

    // 3. 加载该机构下的用户列表，includeExisting为true表示包含已存在的成员
    await loadUsersByDeptId(selectedDeptId.value, true);

    // 4. 找到当前编辑的成员并设置到selectedUser中
    const currentUser = availableUsers.value.find(
      (user) => user.uPid === row.userId,
    );
    if (currentUser) {
      selectedUser.value = [currentUser];
    } else {
      // 如果没找到，手动创建一个用户对象
      selectedUser.value = [
        {
          uPid: row.userId,
          uName: row.userRealName || row.userName || '未知用户',
          uUser: row.userRealName || row.userName || '未知用户',
          userId: row.userId,
          name: row.userRealName || row.userName || '未知用户',
        },
      ];
    }
  }

  memberDialogVisible.value = true;
};

// 保存成员
const handleSaveMember = async () => {
  try {
    if (
      !selectedTeamId.value ||
      !memberForm.value.userId ||
      memberForm.value.userId.length === 0 ||
      !memberForm.value.teamRole ||
      !memberForm.value.permissionLevel
    ) {
      ElMessage.warning('请填写完整信息');
      return;
    }

    savingMember.value = true;

    const data = {
      caseId: Number(caseId.value),
      userId: memberForm.value.userId,
      teamRole: memberForm.value.teamRole,
      permissionLevel: memberForm.value.permissionLevel,
    };

    if (memberForm.value.id) {
      // 更新团队成员权限和角色
      // 将英文转换为中文：permissionLevel -> permission_level，teamRole -> team_role
      const updateData = {
        permission_level:
          memberForm.value.permissionLevel === 'VIEW'
            ? '查看'
            : memberForm.value.permissionLevel === 'EDIT'
              ? '编辑'
              : '管理',
      };

      // 如果有teamRole，也添加到更新数据中
      if (memberForm.value.teamRole) {
        updateData.team_role =
          memberForm.value.teamRole === 'LEADER' ? '负责人' : '成员';
      }

      await updateMemberPermissionApi(memberForm.value.id, updateData);
      ElMessage.success('更新团队成员成功');
    } else {
      // 添加新成员时，确保userId是单个值，而不是数组
      const addData = {
        caseId: Number(caseId.value),
        userId: data.userId[0], // 从数组中取出第一个元素
        team_role: data.teamRole === 'LEADER' ? '负责人' : '成员',
        permission_level:
          data.permissionLevel === 'VIEW'
            ? '查看'
            : data.permissionLevel === 'EDIT'
              ? '编辑'
              : '管理',
      };
      await addTeamMemberApi(selectedTeamId.value, addData);
      ElMessage.success('添加团队成员成功');
    }

    memberDialogVisible.value = false;
    // 重新获取工作团队列表，更新所有团队的成员信息
    await fetchWorkTeams();
  } catch (error: any) {
    console.error('保存团队成员失败:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || '保存团队成员失败';
    ElMessage.error(errorMessage);
  } finally {
    savingMember.value = false;
  }
};

// 移除成员
const handleRemoveMember = async (teamId: number, memberId: number) => {
  try {
    await removeTeamMemberApi(teamId, memberId);
    ElMessage.success('移除团队成员成功');
    // 重新获取工作团队列表，更新所有团队的成员信息
    await fetchWorkTeams();
  } catch (error: any) {
    console.error('移除团队成员失败:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || '移除团队成员失败';
    ElMessage.error(errorMessage);
  }
};

// 获取权限标签类型
const getPermissionTagType = (level: string) => {
  const types: Record<string, any> = {
    VIEW: 'info',
    EDIT: 'warning',
    ADMIN: 'danger',
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

// 格式化日期时间
const formatDateTime = (dateTime: null | string | undefined) => {
  if (!dateTime) return '-';
  try {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateTime;
  }
};

// 权限详情对话框相关
const permissionDialogVisible = ref(false);
const currentMemberPermissions = ref<any[]>([]);
const currentMemberName = ref('');

// 查看成员权限详情
const handleViewPermissions = async (row: any) => {
  try {
    currentMemberName.value = row.userRealName || row.userName || '未知用户';
    permissionDialogVisible.value = true;

    if (row.permissions && row.permissions.length > 0) {
      currentMemberPermissions.value = row.permissions;
    } else if (row.id) {
      const response = await getMemberPermissionsApi(row.id);
      currentMemberPermissions.value = response || [];
    } else {
      currentMemberPermissions.value = [];
    }
  } catch (error) {
    console.error('获取成员权限失败:', error);
    ElMessage.error('获取成员权限失败');
    currentMemberPermissions.value = [];
  }
};

// 检查权限
const checkPermissions = async () => {
  try {
    // TODO: 根据API文档，暂时没有权限检查的API
    // 这里先设置为默认值，等待后端提供权限检查接口
    canEdit.value = true;
    canDelete.value = true;
    isCreator.value = true;
    console.log('权限检查完成（使用默认值）');
  } catch (error) {
    console.error('检查权限失败:', error);
    // 如果发生异常，默认将当前用户视为创建者
    canEdit.value = true;
    canDelete.value = true;
    isCreator.value = true;
    console.log('检查权限异常，使用默认权限设置');
  }
};
</script>

<template>
  <div class="law-case-detail-wrapper">
    <div>
      <!-- 页面标题和返回按钮 -->
      <div class="page-header">
        <ElButton type="primary" link @click="goBack">
          <Icon icon="lucide:arrow-left" class="mr-2" />
          返回案件列表
        </ElButton>
        <h1 class="page-title">案件详情</h1>
        <div class="header-actions">
          <ElButton type="primary" @click="openAssetManagementDialog">
            <Icon icon="lucide:landmark" class="mr-2" />
            资金管控
          </ElButton>
          <ElButton type="primary" @click="openArchiveDrawer">
            <Icon icon="lucide:archive" class="mr-2" />
            案件卷宗归档
          </ElButton>
          <ElButton
            type="primary"
            @click="router.push('/basic-data/work-plan-management')"
          >
            <Icon icon="lucide:calendar" class="mr-2" />
            工作计划
          </ElButton>
        </div>
      </div>

      <!-- 内容类型切换 -->
      <div class="content-tabs mb-6">
        <ElRadioGroup v-model="activeTab" size="large" class="tabs-container">
          <ElRadioButton value="caseInfo" class="tab-button">
            案件基本信息
          </ElRadioButton>
          <ElRadioButton value="workTeam" class="tab-button">
            工作团队
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
                    <div
                      class="key-info-value text-xl font-bold text-green-600"
                    >
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

            <!-- 详细信息 -->
            <div v-show="!isInfoCollapsed" class="detail-info-grid">
              <div class="detail-info-content">
                <div class="detail-info-row">
                  <div class="detail-info-item">
                    <div class="detail-info-label">案件名称</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件名称"
                          size="small"
                          placeholder="请输入案件名称"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.案件名称 }}
                      </template>
                    </div>
                  </div>
                  <div class="detail-info-item">
                    <div class="detail-info-label">案由</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案由"
                          size="small"
                          placeholder="请输入案由"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.案由 }}
                      </template>
                    </div>
                  </div>
                </div>
                <div class="detail-info-row">
                  <div class="detail-info-item">
                    <div class="detail-info-label">受理日期</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.受理日期"
                          size="small"
                          placeholder="请输入受理日期"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.受理日期 }}
                      </template>
                    </div>
                  </div>
                  <div class="detail-info-item">
                    <div class="detail-info-label">案件来源</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.案件来源"
                          size="small"
                          placeholder="请输入案件来源"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.案件来源 }}
                      </template>
                    </div>
                  </div>
                </div>
                <div class="detail-info-row">
                  <div class="detail-info-item">
                    <div class="detail-info-label">主要负责人</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.管理人负责人"
                          size="small"
                          placeholder="请输入主要负责人"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.管理人负责人 }}
                      </template>
                    </div>
                  </div>
                  <div class="detail-info-item">
                    <div class="detail-info-label">指定法官</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.承办法官"
                          size="small"
                          placeholder="请输入指定法官"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.承办法官 }}
                      </template>
                    </div>
                  </div>
                </div>
                <div class="detail-info-row">
                  <div class="detail-info-item">
                    <div class="detail-info-label">承办人</div>
                    <div class="detail-info-value">
                      <template v-if="isEditing">
                        <ElInput
                          v-model="editedData.承办人"
                          size="small"
                          placeholder="请输入承办人"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ caseDetail.承办人 }}
                      </template>
                    </div>
                  </div>
                  <div class="detail-info-item">
                    <div class="detail-info-label">创建者</div>
                    <div class="detail-info-value">{{ caseDetail.创建者 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElCard>

        <DebtorInfo :case-id="caseId" />
      </div>

      <!-- 流程处理 -->
      <div v-if="activeTab === 'process'" class="process-content">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:flow-chart" class="mr-2 text-blue-500" />
                <span class="text-lg font-semibold">破产流程处理</span>
              </div>
            </div>
          </template>

          <!-- 阶段切换 -->
          <div class="stage-tabs mb-6">
            <ElRadioGroup
              v-model="currentStage"
              size="large"
              class="tabs-container"
            >
              <ElRadioButton
                v-for="stage in stages"
                :key="stage.id"
                :value="stage.id"
                class="tab-button"
              >
                {{ stage.name }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>

          <!-- 阶段内容 -->
          <div class="stage-content">
            <component
              :is="`stage-${currentStage}-process`"
              :case-id="caseId"
            />
          </div>
        </ElCard>
      </div>

      <!-- 债权人信息 -->
      <div v-if="activeTab === 'creditorInfo'" class="creditor-info-content">
        <CreditorInfo :case-id="caseId" />
      </div>

      <!-- 债权登记表 -->
      <div
        v-if="activeTab === 'claimRegistration'"
        class="claim-registration-content"
      >
        <ClaimRegistrationTabs :case-id="caseId" />
      </div>

      <!-- 公告管理 -->
      <div v-if="activeTab === 'announcement'" class="announcement-content">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:megaphone" class="mr-2 text-blue-500" />
                <span class="text-lg font-semibold">公告管理</span>
              </div>
              <div class="flex space-x-2">
                <ElButton type="primary" @click="openNewAnnouncementDialog">
                  <Icon icon="lucide:plus" class="mr-1" />
                  发布新公告
                </ElButton>
              </div>
            </div>
          </template>

          <!-- 公告列表 -->
          <div class="announcements-container">
            <!-- 公告列表内容将在这里展示 -->
            <div v-if="loadingAnnouncements" class="loading-container">
              <ElSkeleton :rows="5" animated />
            </div>
            <ElEmpty
              v-else-if="announcements.length === 0"
              description="暂无公告"
            />
            <div v-else>
              <ElTable
                :data="announcements"
                border
                style="width: 100%"
                :row-key="(row) => row.id"
              >
                <ElTableColumn prop="title" label="公告标题" min-width="200" />
                <ElTableColumn
                  prop="announcement_type"
                  label="公告类型"
                  width="150"
                />
                <ElTableColumn
                  prop="publisher_name"
                  label="发布人"
                  width="120"
                />
                <ElTableColumn
                  prop="publish_time"
                  label="发布时间"
                  width="180"
                />
                <ElTableColumn prop="view_count" label="查看次数" width="100" />
                <ElTableColumn prop="status" label="状态" width="100">
                  <template #default="scope">
                    <ElTag
                      :type="
                        scope.row.status === 'PUBLISHED' ? 'success' : 'info'
                      "
                    >
                      {{ scope.row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="350" fixed="right">
                  <template #default="scope">
                    <ElButton
                      v-if="scope.row.status === 'DRAFT'"
                      type="success"
                      link
                      size="small"
                      @click="publishAnnouncement(scope.row.id)"
                    >
                      发布
                    </ElButton>
                    <ElButton
                      v-if="scope.row.is_top === 0"
                      type="warning"
                      link
                      size="small"
                      @click="topAnnouncement(scope.row.id)"
                    >
                      置顶
                    </ElButton>
                    <ElButton
                      v-if="scope.row.is_top === 1"
                      type="warning"
                      link
                      size="small"
                      @click="unTopAnnouncement(scope.row.id)"
                    >
                      取消置顶
                    </ElButton>
                    <ElButton
                      type="primary"
                      link
                      size="small"
                      @click="viewAnnouncementDetail(scope.row)"
                    >
                      详情
                    </ElButton>
                    <ElButton
                      v-if="scope.row.status !== 'PUBLISHED'"
                      type="primary"
                      link
                      size="small"
                      @click="editAnnouncement(scope.row)"
                    >
                      编辑
                    </ElButton>
                    <ElPopconfirm
                      title="确定要删除该公告吗？"
                      @confirm="deleteAnnouncement(scope.row.id)"
                      confirm-button-text="确定"
                      cancel-button-text="取消"
                    >
                      <template #reference>
                        <ElButton type="danger" link size="small">
                          删除
                        </ElButton>
                      </template>
                    </ElPopconfirm>
                  </template>
                </ElTableColumn>
              </ElTable>

              <!-- 分页 -->
              <div class="pagination-container mt-4">
                <ElPagination
                  :current-page="currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalAnnouncements"
                  @size-change="handlePageSizeChange"
                  @current-change="handlePageChange"
                />
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 工作团队卡片 -->
      <div v-if="activeTab === 'workTeam'" style="margin: 20px 0">
        <div
          style="
            overflow: hidden;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
          "
        >
          <!-- 标题和操作按钮 -->
          <div
            style="
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-bottom: 1px solid #e9ecef;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div style="display: flex; gap: 12px; align-items: center">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    background: rgb(255 255 255 / 20%);
                    border-radius: 50%;
                  "
                >
                  <Icon
                    icon="lucide:users"
                    style="font-size: 24px; color: white"
                  />
                </div>
                <div>
                  <h2
                    style="
                      margin: 0;
                      font-size: 20px;
                      font-weight: 600;
                      color: white;
                    "
                  >
                    工作团队管理
                  </h2>
                  <p
                    style="
                      margin: 4px 0 0;
                      font-size: 14px;
                      color: rgb(255 255 255 / 80%);
                    "
                  >
                    共 {{ workTeams.length }} 个工作团队
                  </p>
                </div>
              </div>
              <div style="display: flex; gap: 10px">
                <ElButton
                  type="primary"
                  @click="openAddTeamDialog"
                  v-if="isCreator"
                  style="color: white; background: #4caf50; border: none"
                >
                  <Icon icon="lucide:plus" class="mr-1" />
                  添加工作团队
                </ElButton>
              </div>
            </div>
          </div>

          <div
            v-if="workTeamLoading"
            class="loading-container"
            style="padding: 40px"
          >
            <ElSkeleton :rows="8" animated />
          </div>

          <div v-else class="case-info-content" style="padding: 20px">
            <!-- 工作团队列表 -->
            <div v-if="workTeams.length > 0">
              <div
                v-for="team in workTeams"
                :key="team.id"
                style="
                  margin-bottom: 20px;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                  background: #fff;
                  transition: all 0.3s ease;
                "
                :style="{
                  boxShadow: isTeamExpanded(team.id)
                    ? '0 4px 12px rgb(0 0 0 / 10%)'
                    : '0 2px 4px rgb(0 0 0 / 5%)',
                }"
              >
                <!-- 团队基本信息 -->
                <div
                  style="
                    padding: 20px;
                    background: linear-gradient(
                      135deg,
                      #f5f7fa 0%,
                      #c3cfe2 100%
                    );
                    border-bottom: 1px solid #e5e7eb;
                  "
                >
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <div style="display: flex; gap: 16px; align-items: center">
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          width: 56px;
                          height: 56px;
                          background: linear-gradient(
                            135deg,
                            #667eea 0%,
                            #764ba2 100%
                          );
                          border-radius: 12px;
                          box-shadow: 0 4px 8px rgb(102 126 234 / 30%);
                        "
                      >
                        <Icon
                          icon="lucide:building-2"
                          style="font-size: 28px; color: white"
                        />
                      </div>
                      <div>
                        <h3
                          style="
                            margin: 0 0 8px;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                          "
                        >
                          {{ team.teamName }}
                        </h3>
                        <div
                          style="
                            display: flex;
                            gap: 16px;
                            align-items: center;
                            font-size: 14px;
                            color: #6b7280;
                          "
                        >
                          <span
                            style="display: flex; gap: 4px; align-items: center"
                          >
                            <Icon icon="lucide:user" style="font-size: 16px" />
                            负责人：{{ team.teamLeaderName || '-' }}
                          </span>
                          <span
                            style="display: flex; gap: 4px; align-items: center"
                          >
                            <Icon icon="lucide:users" style="font-size: 16px" />
                            成员数：{{ team.members?.length || 0 }}
                          </span>
                          <ElTag
                            :type="getTeamStatusTagType(team.status)"
                            size="small"
                          >
                            {{ getTeamStatusLabel(team.status) }}
                          </ElTag>
                        </div>
                      </div>
                    </div>
                    <div style="display: flex; gap: 8px">
                      <ElButton
                        size="small"
                        @click="toggleTeamMembers(team.id)"
                        :type="isTeamExpanded(team.id) ? 'warning' : 'primary'"
                      >
                        <Icon
                          :icon="
                            isTeamExpanded(team.id)
                              ? 'lucide:chevron-up'
                              : 'lucide:chevron-down'
                          "
                          class="mr-1"
                        />
                        {{ isTeamExpanded(team.id) ? '收起成员' : '查看成员' }}
                      </ElButton>
                      <ElButton
                        size="small"
                        type="success"
                        @click="handleAddMember(team.id)"
                        v-if="isCreator"
                      >
                        <Icon icon="lucide:plus" class="mr-1" />
                        添加成员
                      </ElButton>
                    </div>
                  </div>
                </div>

                <!-- 团队成员列表（可展开/收起） -->
                <div
                  v-if="isTeamExpanded(team.id)"
                  style="padding: 20px"
                  class="team-members-section"
                >
                  <div
                    v-if="team.members?.length > 0"
                    style="
                      background: #f9fafb;
                      border-radius: 8px;
                      padding: 16px;
                    "
                  >
                    <ElTable
                      :data="team.members"
                      style="width: 100%"
                      :header-cell-style="{
                        background: '#f5f7fa',
                        color: '#606266',
                        fontWeight: '600',
                      }"
                      :row-style="{ height: '56px' }"
                      stripe
                    >
                      <ElTableColumn
                        prop="userRealName"
                        label="真实姓名"
                        width="120"
                      >
                        <template #default="{ row }">
                          {{ row.userRealName || row.userName || '-' }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn prop="userName" label="用户名" width="120">
                        <template #default="{ row }">
                          {{ row.userName || '-' }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn
                        prop="teamRole"
                        label="团队角色"
                        width="120"
                      >
                        <template #default="{ row }">
                          {{ row.teamRole || '-' }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn
                        prop="permissionLevel"
                        label="权限级别"
                        width="100"
                      >
                        <template #default="{ row }">
                          <ElTag
                            :type="getPermissionTagType(row.permissionLevel)"
                          >
                            {{ getPermissionLabel(row.permissionLevel) }}
                          </ElTag>
                        </template>
                      </ElTableColumn>
                      <ElTableColumn prop="isActive" label="状态" width="80">
                        <template #default="{ row }">
                          <ElTag :type="row.isActive ? 'success' : 'danger'">
                            {{ row.isActive ? '激活' : '禁用' }}
                          </ElTag>
                        </template>
                      </ElTableColumn>
                      <ElTableColumn
                        prop="createTime"
                        label="加入时间"
                        width="160"
                      >
                        <template #default="{ row }">
                          {{ formatDateTime(row.createTime) }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn
                        label="操作"
                        width="200"
                        fixed="right"
                        v-if="isCreator"
                      >
                        <template #default="{ row }">
                          <ElButton
                            size="small"
                            @click="handleEditMember(row)"
                            type="primary"
                            plain
                          >
                            <Icon icon="lucide:pencil" class="mr-1" />
                            编辑
                          </ElButton>
                          <ElPopconfirm
                            title="确定要移除该成员吗？"
                            @confirm="handleRemoveMember(team.id, row.id)"
                          >
                            <template #reference>
                              <ElButton
                                size="small"
                                type="danger"
                                plain
                                style="margin-left: 8px"
                              >
                                <Icon icon="lucide:trash-2" class="mr-1" />
                                移除
                              </ElButton>
                            </template>
                          </ElPopconfirm>
                        </template>
                      </ElTableColumn>
                    </ElTable>
                  </div>

                  <div v-else class="empty-state" style="padding: 40px 20px">
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 20px;
                        background: linear-gradient(
                          135deg,
                          #667eea 0%,
                          #764ba2 100%
                        );
                        border-radius: 50%;
                      "
                    >
                      <Icon
                        icon="lucide:users"
                        style="font-size: 36px; color: white"
                      />
                    </div>
                    <ElEmpty description="暂无团队成员" :image-size="0">
                      <template #description>
                        <p
                          style="
                            margin-top: 16px;
                            font-size: 14px;
                            color: #909399;
                          "
                        >
                          该团队暂无成员，点击上方"添加成员"按钮开始添加
                        </p>
                      </template>
                    </ElEmpty>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state" style="padding: 60px 20px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 120px;
                  height: 120px;
                  margin: 0 auto 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 50%;
                "
              >
                <Icon
                  icon="lucide:users"
                  style="font-size: 48px; color: white"
                />
              </div>
              <ElEmpty description="暂无工作团队" :image-size="0">
                <template #description>
                  <p style="margin-top: 16px; font-size: 14px; color: #909399">
                    该案件暂无工作团队，点击上方"添加工作团队"按钮开始创建
                  </p>
                </template>
              </ElEmpty>
            </div>
          </div>
        </div>

        <!-- 添加/编辑成员对话框 -->
        <ElDialog
          v-model="memberDialogVisible"
          :title="memberDialogTitle"
          width="600px"
          destroy-on-close
          :close-on-click-modal="false"
        >
          <div style="padding: 20px 0">
            <ElForm :model="memberForm" label-width="100px">
              <ElFormItem label="管理员机构" required>
                <ElSelect
                  v-model="selectedDeptId"
                  placeholder="请选择管理员机构"
                  style="width: 100%"
                  filterable
                  :loading="loadingAdministrators"
                  clearable
                  :disabled="memberDialogTitle === '编辑成员'"
                >
                  <ElOption
                    v-for="admin in administrators"
                    :key="admin.sepId"
                    :label="admin.administratorName"
                    :value="admin.sepId"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="成员" required>
                <ElSelect
                  v-model="selectedUser"
                  placeholder="请选择成员"
                  style="width: 100%"
                  filterable
                  :loading="loadingUsers"
                  :disabled="
                    !selectedDeptId || memberDialogTitle === '编辑成员'
                  "
                  value-key="uPid"
                  clearable
                  multiple
                >
                  <ElOption
                    v-for="user in availableUsers"
                    :key="user.uPid"
                    :label="user.uName"
                    :value="user"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="团队角色" required>
                <ElSelect
                  v-model="memberForm.teamRole"
                  placeholder="选择角色"
                  style="width: 100%"
                  clearable
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
                  clearable
                  :disabled="true"
                >
                  <ElOption label="查看" value="VIEW" />
                  <ElOption label="编辑" value="EDIT" />
                  <ElOption label="管理" value="ADMIN" />
                </ElSelect>
              </ElFormItem>
            </ElForm>
          </div>
          <template #footer>
            <div style="display: flex; gap: 12px; justify-content: flex-end">
              <ElButton @click="memberDialogVisible = false" size="large">
                取消
              </ElButton>
              <ElButton
                type="primary"
                @click="handleSaveMember"
                :loading="savingMember"
                size="large"
              >
                <Icon v-if="!savingMember" icon="lucide:check" class="mr-1" />
                确定
              </ElButton>
            </div>
          </template>
        </ElDialog>

        <!-- 权限详情对话框 -->
        <ElDialog
          v-model="permissionDialogVisible"
          :title="`${currentMemberName} 的权限详情`"
          width="800px"
          destroy-on-close
        >
          <div v-if="currentMemberPermissions.length > 0">
            <ElTable :data="currentMemberPermissions" style="width: 100%">
              <ElTableColumn prop="moduleType" label="模块类型" width="200" />
              <ElTableColumn
                prop="permissionType"
                label="权限类型"
                width="150"
              />
              <ElTableColumn prop="isAllowed" label="是否允许" width="100">
                <template #default="{ row }">
                  <ElTag :type="row.isAllowed ? 'success' : 'danger'">
                    {{ row.isAllowed ? '允许' : '禁止' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <ElTag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
                    {{ row.status === 'ACTIVE' ? '激活' : '禁用' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="createTime" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createTime) }}
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
          <div v-else class="empty-permissions">
            <ElEmpty description="暂无权限信息" />
          </div>
          <template #footer>
            <ElButton type="primary" @click="permissionDialogVisible = false">
              关闭
            </ElButton>
          </template>
        </ElDialog>

        <!-- 添加工作团队对话框 -->
        <ElDialog
          v-model="addTeamDialogVisible"
          title="添加工作团队"
          width="600px"
        >
          <ElForm label-width="120px" style="margin-top: 20px">
            <ElFormItem label="团队名称" required>
              <ElInput
                v-model="addTeamForm.teamName"
                placeholder="请输入团队名称"
                style="width: 100%"
              />
            </ElFormItem>
            <ElFormItem label="团队负责人" required>
              <ElSelect
                v-model="addTeamForm.teamLeaderId"
                placeholder="请选择团队负责人"
                style="width: 100%"
                remote
                filterable
                :remote-method="handleSearchLeader"
                :loading="teamLeaderLoading"
              >
                <ElOption
                  v-for="leader in teamLeaderList"
                  :key="leader.value"
                  :label="leader.label"
                  :value="leader.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="团队描述">
              <ElInput
                v-model="addTeamForm.teamDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入团队描述"
                style="width: 100%"
              />
            </ElFormItem>
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="addTeamDialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handleCreateWorkTeam">
                确定
              </ElButton>
            </div>
          </template>
        </ElDialog>

        <!-- 公告详情对话框 -->
        <ElDialog
          v-model="showDetailDialog"
          title="公告详情"
          width="80%"
          destroy-on-close
        >
          <div class="announcement-detail-container">
            <div v-loading="detailLoading" class="detail-content-wrapper">
              <!-- 加载完成且有数据 -->
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
                          : 'warning'
                      "
                      size="small"
                    >
                      {{
                        currentAnnouncementDetail.status === 'PUBLISHED'
                          ? '已发布'
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
                    <span>{{ currentAnnouncementDetail.caseNumber }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="label">主要负责人：</span>
                    <span>{{
                      currentAnnouncementDetail.principalOfficer
                    }}</span>
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
                        currentAnnouncementDetail.is_top === 1
                          ? 'danger'
                          : 'info'
                      "
                      size="small"
                    >
                      {{
                        currentAnnouncementDetail.is_top === 1
                          ? '已置顶'
                          : '未置顶'
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
          </div>
        </ElDialog>

        <!-- 文件预览对话框 -->
        <ElDialog
          v-model="showPreviewDialog"
          :title="previewAttachment?.file_name || '文件预览'"
          width="90%"
          destroy-on-close
        >
          <div class="file-preview-container">
            <div v-loading="previewLoading" class="preview-content">
              <div v-if="previewAttachment">
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
              <div v-else class="no-preview">
                <ElEmpty description="暂无预览内容" />
              </div>
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
            <!-- 表格内容始终渲染，即使数据为空 -->
            <ElTable :data="viewsList" border stripe style="width: 100%">
              <ElTableColumn prop="viewer_name" label="浏览人" width="150" />
              <ElTableColumn prop="view_time" label="浏览时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.view_time) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="ip_address" label="IP地址" width="150" />
            </ElTable>

            <!-- 分页始终渲染，v-if 只控制是否显示 -->
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

            <!-- 空状态：无论加载状态如何，当列表为空时显示 -->
            <div v-if="viewsList.length === 0" class="empty-state">
              <ElEmpty description="暂无浏览记录" />
            </div>
          </div>
        </ElDialog>
      </div>
    </div>

    <!-- 案件卷宗归档抽屉 -->
    <ArchiveDrawer ref="archiveDrawerRef" :case-id="caseId" />

    <!-- 资金管理组件 -->
    <ElDialog
      v-model="showAssetManagementDialog"
      title="资产管理"
      width="90%"
      :close-on-click-modal="false"
    >
      <AssetManagement
        :case-id="caseId"
        :case-name="caseDetail?.案件名称 || ''"
      />
    </ElDialog>

    <!-- 独立的公告详情对话框 - 确保在所有标签页都能显示 -->
    <ElDialog
      v-model="showDetailDialog"
      :title="currentAnnouncementDetail?.title || '公告详情'"
      width="70%"
      destroy-on-close
      @open="
        console.log('=== 独立公告详情弹窗被打开 ===', {
          showDetailDialog,
          currentAnnouncementDetail,
        })
      "
      @close="console.log('=== 独立公告详情弹窗被关闭 ===')"
    >
      <div class="announcement-detail-container">
        <div v-loading="detailLoading" class="detail-content-wrapper">
          <!-- 加载完成且有数据 -->
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
                      : 'warning'
                  "
                  size="small"
                >
                  {{
                    currentAnnouncementDetail.status === 'PUBLISHED'
                      ? '已发布'
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
                <span>{{ currentAnnouncementDetail.caseNumber }}</span>
              </div>
              <div class="meta-row">
                <span class="label">主要负责人：</span>
                <span>{{ currentAnnouncementDetail.principalOfficer }}</span>
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
      </div>
    </ElDialog>

    <!-- 独立的浏览记录对话框 - 确保在所有标签页都能显示 -->
    <ElDialog
      v-model="showViewsDialog"
      title="浏览记录"
      width="70%"
      destroy-on-close
      @open="
        console.log('=== 独立浏览记录弹窗被打开 ===', {
          showViewsDialog,
          viewsList,
        })
      "
      @close="console.log('=== 独立浏览记录弹窗被关闭 ===')"
    >
      <div v-loading="viewsLoading" class="views-container">
        <!-- 表格内容始终渲染，即使数据为空 -->
        <ElTable :data="viewsList" border stripe style="width: 100%">
          <ElTableColumn prop="viewer_name" label="浏览人" width="150" />
          <ElTableColumn prop="view_time" label="浏览时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.view_time) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="ip_address" label="IP地址" width="150" />
        </ElTable>

        <!-- 分页始终渲染，v-if 只控制是否显示 -->
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

        <!-- 空状态：无论加载状态如何，当列表为空时显示 -->
        <div v-if="viewsList.length === 0" class="empty-state">
          <ElEmpty description="暂无浏览记录" />
        </div>
      </div>
    </ElDialog>

    <!-- 独立的公告编辑对话框 - 确保在所有标签页都能显示 -->
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
                <ElOption label="公告" value="ANNOUNCEMENT" />
                <ElOption label="通知" value="NOTICE" />
                <ElOption label="警告" value="WARNING" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="公告状态">
              <ElTag type="info" size="large">草稿</ElTag>
            </ElFormItem>
            <ElFormItem label="案号">
              <ElInput
                v-model="announcementData.caseNumber"
                placeholder="请输入案号"
                size="large"
                disabled
              />
            </ElFormItem>
            <ElFormItem label="主要负责人">
              <ElSelect
                v-model="announcementData.principalOfficer"
                placeholder="请选择主要负责人"
                size="large"
                filterable
                clearable
              >
                <ElOption
                  v-for="member in announcementPrincipalOfficerOptions"
                  :key="member.value"
                  :label="member.label"
                  :value="member.value"
                />
              </ElSelect>
            </ElFormItem>
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

    <!-- 独立的撤回公告对话框 - 确保在所有标签页都能显示 -->
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

    <!-- 独立的置顶公告对话框 - 确保在所有标签页都能显示 -->
    <ElDialog
      v-model="showTopDialog"
      title="置顶公告"
      width="500px"
      destroy-on-close
    >
      <div class="top-dialog-container">
        <ElForm label-width="120px">
          <ElFormItem label="置顶过期时间" required>
            <ElDatePicker
              v-model="topExpireTime"
              type="datetime"
              placeholder="选择置顶过期时间"
              size="large"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </ElFormItem>
          <div style="margin-top: 10px; font-size: 12px; color: #909399">
            <Icon icon="lucide:info" style="margin-right: 4px" />
            设置置顶过期时间后，公告将在该时间后自动取消置顶
          </div>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showTopDialog = false">取消</ElButton>
          <ElButton type="primary" @click="confirmTopAnnouncement">
            确认置顶
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 独立的文件预览对话框 - 确保在所有标签页都能显示 -->
    <ElDialog
      v-model="showPreviewDialog"
      :title="previewAttachment?.file_name || '文件预览'"
      width="80%"
      destroy-on-close
    >
      <div class="preview-dialog-container">
        <div v-loading="previewLoading" class="preview-content">
          <template v-if="isImage">
            <div class="image-preview">
              <img :src="previewUrl" alt="图片预览" />
            </div>
          </template>
          <template v-else-if="isPdf">
            <div class="pdf-preview">
              <iframe :src="previewUrl" width="100%" height="600px"></iframe>
            </div>
          </template>
          <template v-else-if="isText">
            <div class="text-preview">
              <ElInput
                v-model="textContent"
                type="textarea"
                :rows="20"
                readonly
                placeholder="文本内容"
              />
            </div>
          </template>
          <template v-else>
            <div class="other-preview">
              <ElEmpty description="不支持的文件类型预览" />
              <div class="preview-actions">
                <ElButton
                  type="primary"
                  @click="downloadAttachment(previewAttachment)"
                >
                  下载文件
                </ElButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.case-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.content-tabs {
  margin-bottom: 24px;
}

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-button {
  margin-right: 8px;
  margin-bottom: 8px;
}

.case-info-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px 0;
}

.key-info-overview {
  margin-bottom: 24px;
}

.key-info-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.key-info-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.key-info-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.key-info-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.detail-info-grid {
  margin-top: 24px;
}

.detail-info-content {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.detail-info-row {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
}

.detail-info-row:last-child {
  border-bottom: none;
}

.detail-info-item {
  flex: 1;
  min-width: 50%;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-info-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  width: 80px;
}

.detail-info-value {
  font-size: 14px;
  color: #1f2937;
  flex: 1;
  white-space: normal;
  word-break: break-word;
}

.work-team-content {
  margin-bottom: 24px;
}

.team-members-container {
  margin-top: 16px;
}

.process-content {
  margin-bottom: 24px;
}

.stage-tabs {
  margin-bottom: 24px;
}

.stage-content {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.announcement-content {
  margin-bottom: 24px;
}

.announcements-container {
  margin-top: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 公告对话框样式 */
.dialog-form {
  padding: 20px 0;
}

.form-item {
  margin-bottom: 20px;
}

/* 公告详情弹窗样式 */
.announcement-detail-container {
  padding: 20px;
}

.detail-content-wrapper {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  flex: 1;
  flex-basis: calc(50% - 12px);
  margin-bottom: 8px;
}

.meta-row .label {
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
}

.meta-row .value {
  color: #1f2937;
  font-size: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
  display: inline-block;
}

.detail-body {
  margin-bottom: 24px;
  line-height: 1.6;
}

.content-html {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-height: 120px;
}

.content-html p {
  margin-bottom: 12px;
}

.content-html p:last-child {
  margin-bottom: 0;
}

/* 附件列表样式 */
.detail-attachments {
  margin-top: 24px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.attachment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.attachment-icon {
  margin-right: 16px;
  font-size: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 浏览记录样式 */
.views-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.views-container .empty-state {
  padding: 40px 0;
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

.debtor-info-content {
  margin-bottom: 24px;
}
</style>
