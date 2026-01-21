<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElEmpty,
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
} from '#/api/core/case-announcement';
import {
  createDocumentApi,
  deleteDocumentApi,
  getDocumentAttachmentsApi,
  getDocumentDetailApi,
  getDocumentListApi,
  updateDocumentApi,
  updateDocumentSendStatusApi,
} from '#/api/core/document-service';
import { deleteFileApi, downloadFileApi, uploadFileApi } from '#/api/core/file';
import { getManagerListApi } from '#/api/core/manager';
import {
  getAdminUsersApi,
  getUserByDeptIdApi,
  getUsersApi,
} from '#/api/core/user';
import {
  createWorkLogApi,
  deleteWorkLogApi,
  getWorkLogListApi,
  updateWorkLogApi,
} from '#/api/core/work-log';
import {
  addTeamMemberApi,
  createWorkTeamApi,
  getMemberPermissionsApi,
  getWorkTeamDetailWithMembersApi,
  getWorkTeamListWithDetailsApi,
  removeTeamMemberApi,
  updateTeamMemberApi,
} from '#/api/core/work-team';
import { fileUploadRequestClient } from '#/api/request';

import RichTextEditor from '../../../components/RichTextEditor.vue';
import BankruptcyProcess from '../bankruptcy-process/index.vue';
import ArchiveDrawer from './components/ArchiveDrawer.vue';
import AssetManagement from './components/AssetManagement.vue';
import ClaimRegistrationTabs from './components/ClaimRegistrationTabs.vue';
import CreditorInfo from './components/CreditorInfo.vue';
import DebtorInfo from './components/DebtorInfo.vue';
import FundControlDrawer from './components/FundControlDrawer.vue';
import ProgressManagementModal from './components/ProgressManagementModal.vue';

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

// 进度管理弹窗相关
const showProgressManagement = ref(false);

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
  userName: '',
  deptId: '',
  deptName: '',
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

// 团队负责人选择对话框相关
const leaderSelectDialogVisible = ref(false);
const administratorsForLeader = ref<any[]>([]);
const administratorsStaffMap = ref<Map<number, any[]>>(new Map());
const loadingAdministratorsForLeader = ref(false);
const loadingStaffForLeader = ref(false);
const selectedLeader = ref<any>(null);
const selectedLeaderAdministratorId = ref<null | number>(null);

// 管理员机构和用户选择相关
const administrators = ref<any[]>([]);
const loadingAdministrators = ref(false);
const loadingUsers = ref(false);
const selectedDeptId = ref<null | number>(null);
const selectedUser = ref<any>(null);

// 保存成员时的加载状态
const savingMember = ref(false);

const currentStage = ref(1);
const stages = [
  {
    id: 1,
    name: '一、破产申请与受理',
    description: '包含破产申请材料提交、法院审查、管理人选任等工作',
    modules: [
      { code: 'TASK_001', name: '提交破产申请材料' },
      { code: 'TASK_002', name: '法院立案形式审查' },
      { code: 'TASK_003', name: '破产原因实质审查' },
      { code: 'TASK_004', name: '同步选任管理人' },
      { code: 'TASK_005', name: '裁定受理并公告' },
    ],
  },
  {
    id: 2,
    name: '二、接管与调查',
    description: '管理人全面接管债务人并调查财产经营状况',
    modules: [
      { code: 'TASK_006', name: '全面接管债务人' },
      { code: 'TASK_007', name: '调查财产及经营状况' },
      { code: 'TASK_008', name: '决定合同继续履行或解除' },
      { code: 'TASK_009', name: '追收债务人财产' },
    ],
  },
  {
    id: 3,
    name: '三、债权申报与核查',
    description: '通知债权人申报、接收登记并审查债权',
    modules: [
      { code: 'TASK_010', name: '通知已知债权人并公告' },
      { code: 'TASK_011', name: '接收、登记债权申报' },
      { code: 'TASK_012', name: '审查申报债权并编制债权表' },
    ],
  },
  {
    id: 4,
    name: '四、债权人会议',
    description: '筹备和召开债权人会议，核查债权并议决事项',
    modules: [
      { code: 'TASK_013', name: '筹备第一次债权人会议' },
      { code: 'TASK_014', name: '召开会议核查债权与议决事项' },
      { code: 'TASK_015', name: '表决通过财产变价/分配方案' },
    ],
  },
  {
    id: 5,
    name: '五、破产宣告',
    description: '审查并裁定宣告债务人破产',
    modules: [
      { code: 'TASK_016', name: '审查宣告破产条件' },
      { code: 'TASK_017', name: '裁定宣告债务人破产' },
    ],
  },
  {
    id: 6,
    name: '六、财产变价与分配',
    description: '拟定执行财产变价方案并分配破产财产',
    modules: [
      { code: 'TASK_018', name: '拟定并执行财产变价方案' },
      { code: 'TASK_019', name: '执行破产财产分配' },
    ],
  },
  {
    id: 7,
    name: '七、程序终结与注销',
    description: '终结破产程序、办理企业注销并归档',
    modules: [
      { code: 'TASK_020', name: '提请终结破产程序' },
      { code: 'TASK_021', name: '法院裁定并公告' },
      { code: 'TASK_022', name: '办理企业注销登记' },
      { code: 'TASK_023', name: '管理人终止执行职务并归档' },
    ],
  },
];

// 页面内容类型切换
const activeTab = ref('caseInfo');

// 工作日志相关状态
const workLogs = ref<any[]>([]);
const showWorkLogDialog = ref(false);
const isEditingWorkLog = ref(false);
const savingWorkLog = ref(false);
const currentWorkLogId = ref<null | number>(null);
const workLogFormRef = ref();
const workLogForm = reactive({
  workDate: '',
  workType: 'CASE_INVESTIGATION',
  workContent: '',
  workResult: '',
  attachmentIds: '',
  remark: '',
});

const workLogFormRules = {
  workDate: [{ required: true, message: '请选择工作日期', trigger: 'change' }],
  workType: [{ required: true, message: '请选择工作类型', trigger: 'change' }],
  workContent: [{ required: true, message: '请输入工作内容', trigger: 'blur' }],
};

const workTypeOptions = [
  { label: '案件调查', value: 'CASE_INVESTIGATION' },
  { label: '债权人联系', value: 'CREDITOR_CONTACT' },
  { label: '资产处置', value: 'ASSET_DISPOSAL' },
  { label: '法院沟通', value: 'COURT_COMMUNICATION' },
  { label: '文书准备', value: 'DOCUMENT_PREPARATION' },
  { label: '会议组织', value: 'MEETING_ORGANIZATION' },
  { label: '其他', value: 'OTHER' },
];

const workLogLoading = ref(false);
const workLogPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const getWorkTypeLabel = (type: string) => {
  const option = workTypeOptions.find((opt) => opt.value === type);
  return option ? option.label : type;
};

const fetchWorkLogs = async () => {
  try {
    workLogLoading.value = true;
    const response = await getWorkLogListApi({
      caseId: Number(caseId.value),
      pageNum: workLogPagination.pageNum,
      pageSize: workLogPagination.pageSize,
    });
    if (response.code === 200) {
      workLogs.value = response.data.list;
      workLogPagination.total = response.data.total;
    }
  } catch (error) {
    console.error('获取工作日志失败:', error);
    ElMessage.error('获取工作日志失败');
  } finally {
    workLogLoading.value = false;
  }
};

const openAddWorkLogDialog = () => {
  isEditingWorkLog.value = false;
  currentWorkLogId.value = null;
  workLogForm.workDate = new Date().toISOString().split('T')[0];
  workLogForm.workType = 'CASE_INVESTIGATION';
  workLogForm.workContent = '';
  workLogForm.workResult = '';
  workLogForm.attachmentIds = '';
  workLogForm.remark = '';
  showWorkLogDialog.value = true;
};

const editWorkLog = (log: any) => {
  isEditingWorkLog.value = true;
  currentWorkLogId.value = log.id;
  workLogForm.workDate = log.workDate;
  workLogForm.workType = log.workType;
  workLogForm.workContent = log.workContent;
  workLogForm.workResult = log.workResult || '';
  workLogForm.attachmentIds = log.attachmentIds || '';
  workLogForm.remark = log.remark || '';
  showWorkLogDialog.value = true;
};

const saveWorkLog = async () => {
  try {
    await workLogFormRef.value?.validate();
    savingWorkLog.value = true;

    const logData = {
      caseId: Number(caseId.value),
      workDate: workLogForm.workDate,
      workType: workLogForm.workType,
      workContent: workLogForm.workContent,
      workResult: workLogForm.workResult || undefined,
      attachmentIds: workLogForm.attachmentIds || undefined,
      remark: workLogForm.remark || undefined,
    };

    if (isEditingWorkLog.value && currentWorkLogId.value) {
      const response = await updateWorkLogApi(currentWorkLogId.value, logData);
      if (response.code === 200) {
        ElMessage.success('工作日志更新成功');
        await fetchWorkLogs();
      }
    } else {
      const response = await createWorkLogApi(logData);
      if (response.code === 200) {
        ElMessage.success('工作日志创建成功');
        await fetchWorkLogs();
      }
    }

    showWorkLogDialog.value = false;
  } catch (error) {
    console.error('保存工作日志失败:', error);
    ElMessage.error('保存工作日志失败');
  } finally {
    savingWorkLog.value = false;
  }
};

const deleteWorkLog = async (id: number) => {
  try {
    const response = await deleteWorkLogApi(id);
    if (response.code === 200) {
      ElMessage.success('工作日志删除成功');
      await fetchWorkLogs();
    }
  } catch (error) {
    console.error('删除工作日志失败:', error);
    ElMessage.error('删除工作日志失败');
  }
};

// 监听activeTab变化，加载对应数据
watch(activeTab, async (newTab, oldTab) => {
  console.log('activeTab变化:', oldTab, '->', newTab);
  switch (newTab) {
    case 'announcement': {
      await fetchAnnouncements();

      break;
    }
    case 'documentService': {
      await fetchDocumentList();

      break;
    }
    case 'workLog': {
      await fetchWorkLogs();

      break;
    }
    case 'workTeam': {
      console.log('切换到工作团队标签，开始加载数据');
      await fetchWorkTeams();
      fetchTeamRoles();
      await loadAdministrators();
      fetchAvailableUsers();

      break;
    }
    // 加载文书送达列表
    // No default
  }
});

// 公告管理相关
const announcementData = reactive({
  title: '',
  content: '',
  announcement_type: 'ANNOUNCEMENT',
  status: 'DRAFT',
  is_top: false,
  top_expire_time: '',
  attachments: [],
  caseNumber: '',
  principalOfficer: '',
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

// 批审相关
const showReviewDialog = ref(false);
const reviewForm = reactive({
  reviewType: 'CASE_REVIEW',
  reviewers: [],
  reviewContent: '',
  attachments: [],
});

const reviewTypeOptions = [
  { label: '案件审批', value: 'CASE_REVIEW' },
  { label: '流程审批', value: 'PROCESS_REVIEW' },
  { label: '文书审批', value: 'DOCUMENT_REVIEW' },
];

// 审批人选项，从API获取
const reviewerOptions = ref<any[]>([]);
const loadingReviewers = ref(false);

// 获取管理员用户列表
const fetchAdminUsers = async () => {
  loadingReviewers.value = true;
  try {
    const response = await getAdminUsersApi();
    if (response.code === 200 && response.data) {
      reviewerOptions.value = response.data.map((user: any) => ({
        label: user.name || user.uName || '未知用户',
        value: user.id || user.uPid || '',
      }));
    } else {
      ElMessage.error('获取管理员列表失败');
      reviewerOptions.value = [];
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    ElMessage.error('获取管理员列表失败');
    reviewerOptions.value = [];
  } finally {
    loadingReviewers.value = false;
  }
};

// 打开审批弹窗时加载管理员列表
const openReviewDialog = () => {
  fetchAdminUsers();
  showReviewDialog.value = true;
};

const reviewHistory = ref([
  {
    id: 1,
    reviewer: '张三',
    reviewDate: '2023-05-10 14:30:00',
    status: '已通过',
    comment: '审批通过，无异议',
  },
  {
    id: 2,
    reviewer: '李四',
    reviewDate: '2023-05-09 09:15:00',
    status: '已通过',
    comment: '同意审批',
  },
]);

const submitReview = () => {
  // 这里可以添加提交批审的逻辑
  ElMessage.success('批审已提交');
  showReviewDialog.value = false;
};

// 公告主要负责人候选列表
const announcementPrincipalOfficerOptions = ref<any[]>([]);

// 文书送达相关
const documentList = ref<any[]>([]);
const documentLoading = ref(false);
const documentPagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

// 新增文书送达弹窗
const showAddDocumentDialog = ref(false);

// 编辑状态
const isEditingDocument = ref(false);
const currentDocumentId = ref<null | number>(null);

// 文书表单数据
const documentForm = reactive({
  caseId: '',
  caseNumber: '',
  caseName: '',
  documentName: '',
  documentType: '',
  recipient: '',
  recipientType: '主要负责人',
  recipientPhone: '',
  recipientAddress: '',
  serviceMethod: '',
  serviceContent: '',
  attachment: '',
  sendStatus: '已发送',
});

// 文书类型选项
const documentTypeOptions = [
  { label: '起诉状', value: '起诉状' },
  { label: '答辩状', value: '答辩状' },
  { label: '上诉状', value: '上诉状' },
  { label: '申请书', value: '申请书' },
  { label: '通知书', value: '通知书' },
  { label: '判决书', value: '判决书' },
  { label: '裁定书', value: '裁定书' },
  { label: '调解书', value: '调解书' },
  { label: '决定书', value: '决定书' },
  { label: '其他', value: '其他' },
];

// 受送达人类型选项
const recipientTypeOptions = [
  { label: '债权人', value: '债权人' },
  { label: '债务人', value: '债务人' },
  { label: '法院', value: '法院' },
  { label: '主要负责人', value: '主要负责人' },
  { label: '承办人', value: '承办人' },
  { label: '其他', value: '其他' },
];

// 送达方式选项
const serviceMethodOptions = [
  { label: '电子送达', value: '电子送达' },
  { label: '邮寄送达', value: '邮寄送达' },
  { label: '直接送达', value: '直接送达' },
  { label: '公告送达', value: '公告送达' },
  { label: '委托送达', value: '委托送达' },
];

// 上传文件相关
const uploadedFiles = ref<
  { file: File; fileId: string; name: string; url: string }[]
>([]);
const fileUploadLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// 文书表单验证规则
const documentFormRules = {
  documentName: [
    { required: true, message: '请输入文书名称', trigger: 'blur' },
  ],
  recipient: [{ required: true, message: '请输入受送达人', trigger: 'blur' }],
};

// 获取文书列表
const fetchDocumentList = async () => {
  documentLoading.value = true;
  try {
    const response = await getDocumentListApi({
      caseId: Number(caseId.value),
      pageNum: documentPagination.value.page,
      pageSize: documentPagination.value.size,
    });
    if (response.code === 200) {
      documentList.value = response.data.list;
      documentPagination.value.total = response.data.total;
    } else {
      throw new Error(response.message || '获取文书列表失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文书列表失败');
    console.error('获取文书列表失败:', error);
  } finally {
    documentLoading.value = false;
  }
};

// 打开新增文书送达弹窗
const openAddDocumentDialog = () => {
  // 重置表单
  resetDocumentForm();
  // 设置案件ID、案号和名称
  documentForm.caseId = caseId.value;
  documentForm.caseNumber = caseDetail.value?.案号 || '';
  documentForm.caseName = caseDetail.value?.案件名称 || '';
  showAddDocumentDialog.value = true;
};

// 编辑文书
const editDocument = (row: any) => {
  // 设置编辑状态
  isEditingDocument.value = true;
  currentDocumentId.value = row.id;

  // 填充表单数据
  documentForm.caseId = row.caseId;
  documentForm.caseNumber = row.caseNumber;
  documentForm.caseName = row.caseName;
  documentForm.documentName = row.documentName;
  documentForm.documentType = row.documentType;
  documentForm.recipient = row.recipientName;
  documentForm.recipientType = row.recipientType;
  documentForm.recipientPhone = row.contactPhone;
  documentForm.recipientAddress = row.deliveryAddress;
  documentForm.serviceMethod = row.deliveryMethod;
  documentForm.serviceContent = row.deliveryContent;
  documentForm.attachment = row.documentAttachment;
  documentForm.sendStatus = row.sendStatus === 'SENT' ? '已发送' : '暂存送达';

  // 打开弹窗
  showAddDocumentDialog.value = true;
};

// 重置文书表单
const resetDocumentForm = () => {
  documentForm.caseId = '';
  documentForm.caseNumber = '';
  documentForm.caseName = '';
  documentForm.documentName = '';
  documentForm.documentType = '';
  documentForm.recipient = '';
  documentForm.recipientType = '主要负责人';
  documentForm.recipientPhone = '';
  documentForm.recipientAddress = '';
  documentForm.serviceMethod = '';
  documentForm.serviceContent = '';
  documentForm.attachment = '';
  documentForm.sendStatus = '已发送';

  // 清理文件
  uploadedFiles.value.forEach((file) => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  });
  uploadedFiles.value = [];

  // 重置编辑状态
  isEditingDocument.value = false;
  currentDocumentId.value = null;
};

// 关闭新增文书送达弹窗
const closeAddDocumentDialog = () => {
  showAddDocumentDialog.value = false;
  resetDocumentForm();
};

// 提交文书表单
const submitDocumentForm = async () => {
  // 表单验证
  // 实际应用中应添加表单验证

  // 提交数据
  fileUploadLoading.value = true;
  try {
    const requestData: any = {
      caseId: Number(documentForm.caseId),
      documentName: documentForm.documentName,
      documentType: documentForm.documentType,
      recipientName: documentForm.recipient,
      recipientType: documentForm.recipientType,
      contactPhone: documentForm.recipientPhone,
      deliveryAddress: documentForm.recipientAddress,
      deliveryMethod: documentForm.serviceMethod,
      deliveryContent: documentForm.serviceContent,
      sendStatus: documentForm.sendStatus === '已发送' ? 'SENT' : 'PENDING',
      deliveryTime:
        documentForm.sendStatus === '已发送' ? new Date().toISOString() : null,
    };

    if (uploadedFiles.value.length > 0) {
      const file = uploadedFiles.value[0].file;
      const uploadResponse = await uploadFileApi(
        file,
        'document',
        Number(documentForm.caseId),
      );

      if (uploadResponse.code === 200 && uploadResponse.data) {
        requestData.documentAttachment =
          uploadResponse.data.filePath || uploadResponse.data.storedFileName;
      }
    }

    let response;
    response = await (isEditingDocument.value && currentDocumentId.value
      ? updateDocumentApi(currentDocumentId.value, requestData)
      : createDocumentApi(requestData));

    if (response.code === 200) {
      ElMessage.success(
        isEditingDocument.value ? '文书送达更新成功' : '文书送达创建成功',
      );
      showAddDocumentDialog.value = false;
      resetDocumentForm();
      fetchDocumentList();
    } else {
      ElMessage.error(
        response.message ||
          (isEditingDocument.value ? '文书送达更新失败' : '文书送达创建失败'),
      );
    }
  } catch (error: any) {
    ElMessage.error(
      error.message ||
        (isEditingDocument.value ? '文书送达更新失败' : '文书送达创建失败'),
    );
    console.error(
      isEditingDocument.value ? '更新文书失败:' : '创建文书失败:',
      error,
    );
  } finally {
    fileUploadLoading.value = false;
  }
};

// 处理文件变化
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    // 文件验证
    const maxFileSize = 10 * 1024 * 1024;
    const allowedTypes = new Set([
      '.doc',
      '.docx',
      '.jpg',
      '.pdf',
      '.png',
      '.xls',
      '.xlsx',
    ]);
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;

    if (!allowedTypes.has(fileExtension)) {
      ElMessage.error(
        '不支持的文件类型，请上传PDF、DOC、DOCX、XLS、XLSX、JPG、PNG格式文件',
      );
      return;
    }

    if (file.size > maxFileSize) {
      ElMessage.error(
        `文件大小超过限制：${(file.size / 1024 / 1024).toFixed(2)}MB，单个文件大小不超过10MB`,
      );
      return;
    }

    try {
      fileUploadLoading.value = true;

      // 暂存文件
      uploadedFiles.value.push({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
        fileId: Date.now().toString(),
      });

      documentForm.attachment = file.name;

      fileUploadLoading.value = false;
      ElMessage.success('文件已暂存，将在提交表单时上传');
    } catch (error: any) {
      fileUploadLoading.value = false;
      ElMessage.error(`文件处理失败：${error.message || '网络错误'}`);
    }
  }
  input.value = '';
};

// 删除文件
const removeFile = (index: number) => {
  const file = uploadedFiles.value[index];
  if (file && file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url);
  }

  uploadedFiles.value.splice(index, 1);
  documentForm.attachment = '';

  ElMessage.success('文件已删除');
};

// 下载文件
const downloadFile = (file: any) => {
  if (file.url) {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.append(a);
    a.click();
    a.remove();
  }
};

// 文书详情弹窗相关
const showDocumentDetailDialog = ref(false);
const documentDetail = ref<any>(null);
const documentDetailLoading = ref(false);
const documentAttachments = ref<any[]>([]);
const documentAttachmentsLoading = ref(false);

// 查看文书详情
const viewDocumentDetail = async (documentId: number) => {
  documentDetailLoading.value = true;
  documentAttachmentsLoading.value = true;
  try {
    const response = await getDocumentDetailApi(documentId);
    if (response.code === 200) {
      documentDetail.value = response.data;
      showDocumentDetailDialog.value = true;

      // 加载附件列表
      await loadDocumentAttachments(documentId);
    } else {
      throw new Error(response.message || '获取文书详情失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文书详情失败');
    console.error('获取文书详情失败:', error);
  } finally {
    documentDetailLoading.value = false;
    documentAttachmentsLoading.value = false;
  }
};

// 加载文书附件列表
const loadDocumentAttachments = async (documentId: number) => {
  try {
    const response = await getDocumentAttachmentsApi(documentId);
    if (response.code === 200) {
      documentAttachments.value = response.data || [];
    }
  } catch (error: any) {
    console.error('加载附件列表失败:', error);
    ElMessage.error('加载附件列表失败');
  }
};

// 下载文书附件
const downloadDocumentAttachment = async (attachment: any) => {
  try {
    const blob = await downloadFileApi(attachment.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.originalFileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载成功');
  } catch (error: any) {
    console.error('下载文件失败:', error);
    ElMessage.error('文件下载失败');
  }
};

// 查看送达记录
const viewServiceRecords = (documentId: string) => {
  // 跳转到送达记录页面
  router.push(`/service-of-documents/${documentId}/records`);
};

// 发送文书
const sendDocument = async (documentId: number) => {
  try {
    const response = await updateDocumentSendStatusApi(documentId, 'SENT');
    if (response.code === 200) {
      ElMessage.success('文书发送成功');
      // 刷新列表
      fetchDocumentList();
    } else {
      ElMessage.error(response.message || '文书发送失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文书发送失败');
    console.error('发送文书失败:', error);
  }
};

// 删除文书送达记录
const deleteDocument = async (documentId: number) => {
  try {
    // 先获取文书详情，检查状态
    const document = documentList.value.find((item) => item.id === documentId);
    if (document && document.status === 'PENDING') {
      ElMessage.warning('待审批中的文书不能删除');
      return;
    }

    const response = await deleteDocumentApi(documentId);
    if (response.code === 200) {
      ElMessage.success('文书送达记录删除成功');
      // 刷新列表
      fetchDocumentList();
    } else {
      ElMessage.error(response.message || '文书送达记录删除失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文书送达记录删除失败');
    console.error('删除文书送达记录失败:', error);
  }
};

// 分页变化处理
const handleDocumentPageChange = (page: number) => {
  documentPagination.value.page = page;
  fetchDocumentList();
};

// 页面大小变化处理
const handleDocumentPageSizeChange = (size: number) => {
  documentPagination.value.size = size;
  documentPagination.value.page = 1;
  fetchDocumentList();
};

// 预览附件
const viewAttachment = async (attachment: any) => {
  try {
    // 检查file_id是否存在且有效
    if (!attachment.file_id) {
      ElMessage.error('无效的文件ID');
      return;
    }

    // 确保file_id是数字
    const fileId = Number(attachment.file_id);
    if (isNaN(fileId)) {
      ElMessage.error('文件ID必须是数字');
      return;
    }

    previewLoading.value = true;
    previewAttachment.value = attachment;

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
        URL.revokeObjectURL(previewUrl.value);
      }

      previewUrl.value = URL.createObjectURL(blob);
      showPreviewDialog.value = true;
      ElMessage.success('文件加载成功');
    } catch (error) {
      console.error('预览附件失败:', error);
      ElMessage.error('文件预览失败，请检查文件是否存在或权限是否足够');
    } finally {
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

const getDocumentAttachmentUrl = (attachmentPath: string) => {
  if (!attachmentPath) return '';
  if (attachmentPath.startsWith('http')) {
    return attachmentPath;
  }
  return `${import.meta.env.VITE_API_BASE_URL || window.location.origin}${attachmentPath}`;
};

const formatDateOnly = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForApi = (dateStr: string) => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
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

    console.log(
      '保存公告前的announcementData.attachments:',
      announcementData.attachments,
    );

    // 准备请求数据
    const requestData = {
      caseId: Number(caseId.value),
      caseNumber: isEditingAnnouncement.value
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

    console.log('保存公告的请求数据:', requestData);

    if (isEditingAnnouncement.value && currentAnnouncementId.value) {
      // 更新现有公告
      response = await updateAnnouncementApi(
        currentAnnouncementId.value,
        requestData,
      );
      if (response.code === 200) {
        ElMessage.success('公告更新成功');
        await fetchAnnouncements();
        closeAnnouncementDialog();
      } else {
        ElMessage.error(`公告更新失败：${response.message || '未知错误'}`);
      }
    } else {
      // 发布新公告
      response = await createAnnouncementApi(requestData);
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
  isEditingAnnouncement.value = true;

  // 检查公告对象的ID字段，可能是id或announcement_id
  const announcementId =
    announcement.id ||
    announcement.announcement_id ||
    announcement.announcementId;

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
    file_id:
      attach.file_id ||
      attach.id ||
      attach.fileId ||
      attach.response?.id ||
      attach.uid ||
      '',
    type: attach.type || 'application/octet-stream',
  }));

  // 过滤掉没有有效file_id的附件
  attachments = attachments.filter((attach: any) => {
    return attach.file_id && !isNaN(Number(attach.file_id));
  });

  announcementData.attachments = attachments;
  announcementData.caseNumber =
    announcement.caseNumber || announcement.ah || '';
  announcementData.principalOfficer =
    announcement.principalOfficer || announcement.glyfrz || '';

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

    // 调用查看记录接口
    await createViewRecordApi({
      announcementId: Number(announcementId),
      announcementTitle: announcement.title,
      caseId: Number(caseId.value),
      viewerId: Number(viewerId) || undefined,
      viewerName: viewerName || undefined,
    });

    const response = await getAnnouncementDetailApi(Number(announcementId));
    let detail = response.data;

    console.log('公告详情原始数据:', detail);

    const [attachmentsResponse] = await Promise.all([
      getAnnouncementAttachmentsApi(Number(announcementId)),
    ]);

    detail.attachments = [];

    if (attachmentsResponse.code === 200 && attachmentsResponse.data) {
      detail.attachments = attachmentsResponse.data.map((attach: any) => ({
        file_name: attach.originalFileName || '未知文件',
        file_id: attach.id,
        type: attach.mimeType || 'application/octet-stream',
      }));
    }

    console.log('处理后的attachments:', detail.attachments);

    detail = {
      id: detail.id,
      title: detail.title,
      content: detail.content,
      announcement_type: detail.announcementType,
      status: detail.status,
      is_top: detail.isTop ? 1 : 0,
      top_expire_time: detail.topExpireTime,
      publisher_name: detail.publisherName,
      publish_time: detail.publishTime,
      view_count: detail.viewCount,
      attachments: detail.attachments,
    };

    console.log('处理后的detail:', detail);

    // 确保attachments字段是数组
    if (!detail.attachments) {
      console.log('attachments为空，设置为空数组');
      detail.attachments = [];
    } else if (typeof detail.attachments === 'string') {
      try {
        const parsedAttachments = JSON.parse(detail.attachments);
        console.log('解析后的attachments数组:', parsedAttachments);
        // 处理附件字段映射，确保文件名字段正确
        detail.attachments = parsedAttachments.map((attach: any) => {
          const fileId =
            attach.file_id ||
            attach.id ||
            attach.fileId ||
            attach.response?.id ||
            attach.uid ||
            attach.raw?.uid ||
            '';
          const mappedAttach = {
            ...attach,
            file_name:
              attach.name ||
              attach.file_name ||
              attach.originalFileName ||
              '未知文件',
            file_id: fileId,
            type: attach.type || attach.mimeType || 'application/octet-stream',
          };
          console.log('附件字段映射:', {
            原始数据: attach,
            映射后: mappedAttach,
          });
          return mappedAttach;
        });
        console.log('字段映射后的attachments:', detail.attachments);
        // 过滤掉没有有效file_id的附件
        detail.attachments = detail.attachments.filter((attach: any) => {
          const hasValidId = attach.file_id && !isNaN(Number(attach.file_id));
          console.log(
            `附件 ${attach.file_name} 的file_id: ${attach.file_id}, 有效: ${hasValidId}`,
          );
          return hasValidId;
        });
        console.log('过滤后的attachments:', detail.attachments);

        // 如果过滤后附件为空，但原始有附件数据，说明数据结构有问题
        if (detail.attachments.length === 0 && parsedAttachments.length > 0) {
          console.warn(
            '警告：附件数据被全部过滤，可能是后端返回的数据结构不正确',
          );
          console.warn(
            '期望的附件数据结构应包含 file_id、id、fileId、response.id 或 uid 字段',
          );
          console.warn('实际收到的数据:', parsedAttachments);
          console.warn('这是一个后端数据问题，请联系后端开发人员修复');
        }
      } catch (error) {
        console.error('解析attachments失败:', error);
        detail.attachments = [];
      }
    } else {
      // 处理附件字段映射，确保文件名字段正确
      detail.attachments = detail.attachments.map((attach: any) => {
        const fileId =
          attach.file_id ||
          attach.id ||
          attach.fileId ||
          attach.response?.id ||
          attach.uid ||
          attach.raw?.uid ||
          '';
        const mappedAttach = {
          ...attach,
          file_name:
            attach.name ||
            attach.file_name ||
            attach.originalFileName ||
            '未知文件',
          file_id: fileId,
          type: attach.type || attach.mimeType || 'application/octet-stream',
        };
        console.log('附件字段映射:', {
          原始数据: attach,
          映射后: mappedAttach,
        });
        return mappedAttach;
      });
      console.log('字段映射后的attachments:', detail.attachments);
      // 过滤掉没有有效file_id的附件
      detail.attachments = detail.attachments.filter((attach: any) => {
        const hasValidId = attach.file_id && !isNaN(Number(attach.file_id));
        console.log(
          `附件 ${attach.file_name} 的file_id: ${attach.file_id}, 有效: ${hasValidId}`,
        );
        return hasValidId;
      });
      console.log('过滤后的attachments:', detail.attachments);

      // 如果过滤后附件为空，但原始有附件数据，说明数据结构有问题
      const originalAttachments = detail.attachments;
      if (detail.attachments.length === 0 && originalAttachments.length > 0) {
        console.warn(
          '警告：附件数据被全部过滤，可能是后端返回的数据结构不正确',
        );
        console.warn(
          '期望的附件数据结构应包含 file_id、id、fileId、response.id 或 uid 字段',
        );
        console.warn('实际收到的数据:', originalAttachments);
        console.warn('这是一个后端数据问题，请联系后端开发人员修复');
      }
    }

    currentAnnouncementDetail.value = detail;
    ElMessage.success('公告详情加载成功');
  } catch (error) {
    console.error('获取公告详情失败:', error);
    ElMessage.error('获取公告详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 打开新增公告对话框
const openNewAnnouncementDialog = async () => {
  isEditingAnnouncement.value = false;
  currentAnnouncementId.value = null;
  dialogTitle.value = '发布新公告';
  resetAnnouncement();

  // 自动设置案号
  announcementData.caseNumber = caseDetail.value?.案号 || '';

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

const customUpload = async (options: any) => {
  const { file, onSuccess, onError, onProgress } = options;
  try {
    const currentCaseId = Number(caseId.value);
    if (isNaN(currentCaseId) || currentCaseId <= 0) {
      throw new Error('无效的案件ID');
    }

    const response = await uploadFileApi(file, 'announcement', currentCaseId);

    if (response.code === 200 && response.data) {
      const uploadedFile = response.data;
      onSuccess({
        file_id: uploadedFile.id,
        file_name: uploadedFile.originalFileName,
        type: uploadedFile.mimeType,
        size: uploadedFile.fileSize,
        response: uploadedFile,
      });
    } else {
      onError(new Error(response.message || '上传失败'));
    }
  } catch (error: any) {
    console.error('文件上传失败:', error);
    onError(error);
  }
};

const downloadAttachment = async (attachment: any) => {
  try {
    // 检查file_id是否存在且有效
    if (!attachment.file_id) {
      ElMessage.error('无效的文件ID');
      return;
    }

    // 确保file_id是数字
    const fileId = Number(attachment.file_id);
    if (isNaN(fileId)) {
      ElMessage.error('文件ID必须是数字');
      return;
    }

    // 使用后端提供的下载接口
    const downloadResponse = await downloadFileApi(fileId);

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

    const response = await getAnnouncementViewsApi(
      announcementId,
      viewsCurrentPage.value,
      viewsPageSize.value,
    );

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

const getCaseStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    在办: 'primary',
    报结: 'warning',
    已结: 'success',
  };
  return typeMap[status] || 'info';
};

const getReviewStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    待审核: 'warning',
    已通过: 'success',
    已驳回: 'danger',
  };
  return typeMap[status] || 'info';
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
      undertakingPersonnel:
        editedData.承办人员 || caseDetail.value?.undertakingPersonnel,
      designatedJudge: editedData.指定法官 || caseDetail.value?.designatedJudge,
      isSimplifiedTrial:
        editedData.是否简化审 === '是'
          ? 1
          : editedData.是否简化审 === '否'
            ? 0
            : caseDetail.value?.isSimplifiedTrial,
      acceptanceDate:
        formatDateForApi(editedData.受理日期) ||
        caseDetail.value?.acceptanceDate,
      closingDate:
        formatDateForApi(editedData.结案日期) || caseDetail.value?.closingDate,
      bankruptcyDate:
        formatDateForApi(editedData.破产时间) ||
        caseDetail.value?.bankruptcyDate,
      terminationDate:
        formatDateForApi(editedData.终结时间) ||
        caseDetail.value?.terminationDate,
      cancellationDate:
        formatDateForApi(editedData.注销时间) ||
        caseDetail.value?.cancellationDate,
      archivingDate:
        formatDateForApi(editedData.归档时间) ||
        caseDetail.value?.archivingDate,
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

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  // 清空编辑数据
  Object.keys(editedData).forEach((key) => {
    delete editedData[key];
  });
  ElMessage.info('已取消编辑');
};

// 处理进度更新事件
const handleProgressUpdated = () => {
  ElMessage.success('案件进度已更新');
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
          承办人员: caseData.undertakingPersonnel,
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
        承办人员: '李四',
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
      承办人员: '李四',
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
    ONGOING: '在办',
    AWAITING: '报结',
    COMPLETED: '已结',
  };
  return statusMap[status] || status;
};

// 根据案件进度获取初始阶段索引
const getInitialStageIndex = (): number => {
  if (!caseDetail.value) return 0;

  const progress = caseDetail.value.案件进度;
  const progressIndexMap: Record<string, number> = {
    第一阶段: 0,
    第二阶段: 1,
    第三阶段: 2,
    第四阶段: 3,
    第五阶段: 4,
    第六阶段: 5,
    第七阶段: 6,
  };

  return progressIndexMap[progress] || 0;
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
  if (!deptId || Number.isNaN(deptId)) {
    console.warn('无效的部门ID:', deptId);
    availableUsers.value = [];
    return;
  }

  loadingUsers.value = true;
  try {
    const response = await getUserByDeptIdApi(deptId);

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
    await fetchTeamMembers(selectedTeamId.value);
    loadUsersByDeptId(newVal);
    selectedUser.value = null;
    memberForm.value.userId = [];
  }
});

watch(selectedUser, (newVal) => {
  memberForm.value.userId = newVal ? [newVal.uPid] : [];
});

const resetSelections = () => {
  selectedDeptId.value = null;
  selectedUser.value = null;
  availableUsers.value = [];
  memberForm.value.userId = [];
};

// 获取工作团队列表
const fetchWorkTeams = async () => {
  workTeamLoading.value = true;
  try {
    console.log(
      '开始获取工作团队列表，caseId:',
      caseId.value,
      'Number(caseId.value):',
      Number(caseId.value),
    );
    const response = await getWorkTeamListWithDetailsApi({
      caseId: Number(caseId.value),
      pageNum: 1,
      pageSize: 100,
    });

    console.log('工作团队API返回:', response);

    // 检查响应格式
    if (response && response.code === 200) {
      if (response.data && response.data.list) {
        console.log('工作团队列表:', response.data.list);

        // 处理API返回数据，确保members字段存在
        const processedTeams = response.data.list.map((team: any) => {
          // 兼容处理：如果返回的是teamMembers，转换为members
          if (team.teamMembers && !team.members) {
            try {
              // 尝试将teamMembers字符串解析为数组
              team.members = JSON.parse(team.teamMembers);
            } catch (error) {
              console.error('解析teamMembers失败:', error);
              team.members = [];
            }
          }
          // 确保members字段是数组
          if (!team.members || !Array.isArray(team.members)) {
            team.members = [];
          }
          return team;
        });

        workTeams.value = processedTeams;
      } else {
        console.error(
          'API返回数据结构异常，缺少data或data.list:',
          response.data,
        );
        workTeams.value = [];
      }
    } else {
      console.error('API返回错误:', response.code, response.message);
      workTeams.value = [];
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
  }
};

// 获取指定团队的成员列表
const fetchTeamMembers = async (teamId: number) => {
  workTeamLoading.value = true;
  try {
    const response = await getWorkTeamDetailWithMembersApi(teamId);

    let members = [];
    if (response.members) {
      members = response.members;
    } else if (response.data && response.data.members) {
      members = response.data.members;
    }

    teamMembers.value = members || [];
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
    switch (newRole) {
      case 'GUEST': {
        memberForm.value.permissionLevel = 'VIEW';

        break;
      }
      case 'LEADER': {
        memberForm.value.permissionLevel = 'ADMIN';

        break;
      }
      case 'MEMBER': {
        memberForm.value.permissionLevel = 'ADMIN';

        break;
      }
      // No default
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
  selectedLeader.value = null;
  addTeamDialogVisible.value = true;
};

// 打开团队负责人选择对话框
const openLeaderSelectDialog = () => {
  selectedLeader.value = null;
  selectedLeaderAdministratorId.value = null;
  leaderSelectDialogVisible.value = true;
  loadAdministratorsForLeader();
};

// 加载管理人列表（用于选择团队负责人）
const loadAdministratorsForLeader = async () => {
  loadingAdministratorsForLeader.value = true;
  try {
    const response = await getManagerListApi({});
    if (response.data && response.data.list) {
      administratorsForLeader.value = response.data.list
        .filter((admin: any) => admin && admin.id != null)
        .map((admin: any) => ({
          ...admin,
          sepId: admin.id,
          lsswsid: admin.administratorName,
        }));
    }
  } catch (error) {
    console.error('加载管理人列表失败:', error);
    ElMessage.error('加载管理人列表失败');
  } finally {
    loadingAdministratorsForLeader.value = false;
  }
};

// 加载管理人对应的员工列表
const loadStaffForLeader = async (administratorId: number) => {
  loadingStaffForLeader.value = true;
  selectedLeaderAdministratorId.value = administratorId;

  try {
    const response = await getUserByDeptIdApi(administratorId);
    let staffList = [];

    if (
      response.code === 200 &&
      response.data &&
      Array.isArray(response.data)
    ) {
      staffList = response.data;
    }

    administratorsStaffMap.value.set(administratorId, staffList);
  } catch (error) {
    console.error('加载员工列表失败:', error);
    ElMessage.error('加载员工列表失败');
  } finally {
    loadingStaffForLeader.value = false;
  }
};

// 选择团队负责人
const selectLeader = (staff: any, administratorId: number) => {
  selectedLeader.value = staff;
  selectedLeaderAdministratorId.value = administratorId;
};

// 确认选择团队负责人
const confirmSelectLeader = () => {
  if (!selectedLeader.value) {
    ElMessage.warning('请选择团队负责人');
    return;
  }

  addTeamForm.value.teamLeaderId = selectedLeader.value.userId;
  leaderSelectDialogVisible.value = false;
  ElMessage.success(`已选择负责人：${selectedLeader.value.name}`);
};

// 添加成员
const handleAddMember = async (teamId: number) => {
  selectedTeamId.value = teamId;
  memberDialogTitle.value = '添加成员';
  memberForm.value = {
    id: null,
    userId: [],
    userName: '',
    deptId: '',
    deptName: '',
    teamRole: '',
    permissionLevel: 'VIEW',
  };
  resetSelections();

  if (administrators.value.length === 0) {
    await loadAdministrators();
  }

  await fetchTeamMembers(teamId);
  memberDialogVisible.value = true;
};

// 展开/收起团队成员列表
const toggleTeamMembers = (teamId: number) => {
  if (expandedTeams.value.has(teamId)) {
    expandedTeams.value.delete(teamId);
  } else {
    expandedTeams.value.add(teamId);
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

  selectedTeamId.value = row.teamId;

  memberForm.value = {
    id: row.id,
    userId: [row.userId],
    userName: row.userRealName || row.userName || '',
    deptId: '',
    deptName: '',
    teamRole: row.teamRole,
    permissionLevel: row.permissionLevel,
  };

  if (administrators.value.length === 0) {
    await loadAdministrators();
  }

  if (administrators.value.length > 0) {
    selectedDeptId.value = administrators.value[0].sepId;
    memberForm.value.deptId = administrators.value[0].sepId.toString();
    memberForm.value.deptName = administrators.value[0].lsswsid || '';

    await loadUsersByDeptId(selectedDeptId.value, true);

    const currentUser = availableUsers.value.find(
      (user) => user.uPid === row.userId,
    );
    selectedUser.value = currentUser || {
      uPid: row.userId,
      uName: row.userRealName || row.userName || '未知用户',
      uUser: row.userRealName || row.userName || '未知用户',
      userId: row.userId,
      name: row.userRealName || row.userName || '未知用户',
    };
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
      !memberForm.value.teamRole
    ) {
      ElMessage.warning('请填写完整信息');
      return;
    }

    savingMember.value = true;

    if (memberForm.value.id) {
      await updateTeamMemberApi(memberForm.value.id, {
        teamRole: memberForm.value.teamRole,
        permissionLevel: memberForm.value.permissionLevel,
      });
      ElMessage.success('更新团队成员信息成功');
    } else {
      const addData = {
        caseId: Number(caseId.value),
        userId: memberForm.value.userId,
        teamRole: memberForm.value.teamRole,
        permissionLevel: memberForm.value.permissionLevel,
      };
      await addTeamMemberApi(selectedTeamId.value, addData);
      ElMessage.success('添加团队成员成功');
    }

    memberDialogVisible.value = false;
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
    ADMIN: '管理',
    FULL: '完全控制',
  };
  return labels[level] || level;
};

// 获取团队角色标签文本
const getTeamRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    LEADER: '团队负责人',
    MEMBER: '团队成员',
    VIEWER: '查看者',
    GUEST: '访客',
  };
  return labels[role] || role;
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

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
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
      <!-- 白色卡片容器 -->
      <ElCard
        shadow="hover"
        class="main-content-card"
        style="margin-bottom: 0; padding-bottom: 0"
      >
        <!-- 页面标题和返回按钮 -->
        <template #header>
          <div class="page-header">
            <ElButton link @click="goBack">
              <Icon icon="lucide:arrow-left" class="mr-2" />
              返回案件列表
            </ElButton>
            <h1 class="page-title">{{ caseDetail?.案号 || '' }}</h1>
            <div class="header-actions">
              <ElButton type="primary" @click="openFundControlDrawer">
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
              <ElButton type="primary" @click="openReviewDialog">
                <Icon icon="lucide:check-square" class="mr-2" />
                提交批审
              </ElButton>
            </div>
          </div>

          <!-- 内容类型切换 -->
          <div class="content-tabs mb-6">
            <ElRadioGroup
              v-model="activeTab"
              size="large"
              class="tabs-container"
            >
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
              <ElRadioButton value="documentService" class="tab-button">
                文书送达
              </ElRadioButton>
              <ElRadioButton value="workLog" class="tab-button">
                工作日志
              </ElRadioButton>
              <ElRadioButton value="announcement" class="tab-button">
                公告管理
              </ElRadioButton>
            </ElRadioGroup>
          </div>
        </template>

        <!-- 案件基本信息卡片 -->
        <div v-if="activeTab === 'caseInfo'">
          <ElCard
            class="case-info-card"
            :class="{ editing: isEditing }"
            shadow="hover"
          >
            <template #header>
              <div
                class="card-header flex items-center justify-between"
                :class="{ editing: isEditing }"
              >
                <div class="flex items-center">
                  <Icon icon="lucide:file-text" class="text-primary mr-2" />
                  <span class="text-lg font-semibold">案件基本信息</span>

                  <ElTag
                    v-if="caseDetail"
                    :type="getCaseStatusTagType(caseDetail.案件状态)"
                    class="ml-3"
                    size="small"
                  >
                    案件状态：{{ caseDetail.案件状态 }}
                  </ElTag>
                  <ElTag
                    v-if="caseDetail?.管理人负责人"
                    type="info"
                    class="ml-3"
                    size="small"
                  >
                    主要负责人：{{ caseDetail.管理人负责人 }}
                  </ElTag>
                  <span v-if="isEditing" class="edit-indicator ml-3">编辑中</span>
                </div>
                <div class="flex space-x-2">
                  <template v-if="!isEditing && canEdit">
                    <ElButton type="primary" @click="startEditing">
                      <Icon icon="lucide:pencil" class="mr-1" />
                      编辑
                    </ElButton>
                    <ElButton
                      type="primary"
                      @click="showProgressManagement = true"
                    >
                      <Icon icon="lucide:bar-chart-2" class="mr-1" />
                      进度管理
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
                  <ElCol :xs="24" :sm="8" :md="6">
                    <div
                      class="key-info-item rounded-lg bg-blue-50 p-4 text-center"
                    >
                      <div class="key-info-label mb-1 text-sm text-gray-500">
                        承办人员
                      </div>
                      <div
                        class="key-info-value text-lg font-semibold text-blue-600"
                      >
                        {{ caseDetail.承办人员 || '-' }}
                      </div>
                    </div>
                  </ElCol>
                </ElRow>
              </div>

              <!-- 详细信息 -->
              <div v-show="!isInfoCollapsed" class="detail-info-grid">
                <div class="detail-info-content">
                  <div class="detail-info-row">
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        案件名称
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
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
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        案由
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
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
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        受理日期
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
                        <template v-if="isEditing">
                          <ElDatePicker
                            v-model="editedData.受理日期"
                            type="date"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            placeholder="请选择受理日期"
                            style="width: 100%"
                          />
                        </template>
                        <template v-else>
                          {{ formatDateOnly(caseDetail.受理日期) }}
                        </template>
                      </div>
                    </div>
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        案件来源
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
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
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        主要负责人
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
                        <template v-if="isEditing">
                          <ElInput
                            v-model="editedData.管理人负责人"
                            size="small"
                            placeholder="请输入主要负责人"
                            style="width: 100%"
                          />
                        </template>
                        <template v-else>
                          {{ caseDetail.管理人负责人 || '-' }}
                        </template>
                      </div>
                    </div>
                  </div>
                  <div class="detail-info-row">
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        指定法官
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
                        <template v-if="isEditing">
                          <ElInput
                            v-model="editedData.指定法官"
                            size="small"
                            placeholder="请输入指定法官"
                            style="width: 100%"
                          />
                        </template>
                        <template v-else>
                          {{ caseDetail.指定法官 }}
                        </template>
                      </div>
                    </div>
                  </div>
                  <div class="detail-info-row">
                    <div
                      class="detail-info-item"
                      :class="{ editing: isEditing }"
                    >
                      <div
                        class="detail-info-label"
                        :class="{ editing: isEditing }"
                      >
                        是否简化审
                      </div>
                      <div
                        class="detail-info-value"
                        :class="{ editing: isEditing }"
                      >
                        <template v-if="isEditing">
                          <ElSelect
                            v-model="editedData.是否简化审"
                            size="small"
                            placeholder="请选择是否简化审"
                            style="width: 100%"
                          >
                            <ElOption label="否" value="否" />
                            <ElOption label="是" value="是" />
                          </ElSelect>
                        </template>
                        <template v-else>
                          {{ caseDetail.是否简化审 }}
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElCard>

          <ElCard
            class="case-time-card"
            :class="{ editing: isEditing }"
            shadow="hover"
            style="margin-top: 20px"
          >
            <template #header>
              <div
                class="card-header flex items-center justify-between"
                :class="{ editing: isEditing }"
              >
                <div class="flex items-center">
                  <Icon icon="lucide:clock" class="text-primary mr-2" />
                  <span class="text-lg font-semibold">案件相关时间</span>
                  <span v-if="isEditing" class="edit-indicator ml-3"
                    >编辑中</span
                  >
                </div>
              </div>
            </template>

            <div v-if="loading" class="loading-container">
              <ElSkeleton :rows="5" animated />
            </div>

            <div v-else-if="caseDetail" class="case-time-content">
              <ElRow :gutter="20">
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      受理日期
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.受理日期"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择受理日期"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.受理日期) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      债权申报截止时间
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.债权申报截止时间"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择债权申报截止时间"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.债权申报截止时间) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      立案日期
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.立案日期"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择立案日期"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.立案日期) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      结案日期
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.结案日期"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择结案日期"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.结案日期) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      破产时间
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.破产时间"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择破产时间"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.破产时间) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      终结时间
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.终结时间"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择终结时间"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.终结时间) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      注销时间
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.注销时间"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择注销时间"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.注销时间) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="8">
                  <div class="time-item" :class="{ editing: isEditing }">
                    <div class="time-label" :class="{ editing: isEditing }">
                      归档时间
                    </div>
                    <div class="time-value" :class="{ editing: isEditing }">
                      <template v-if="isEditing">
                        <ElDatePicker
                          v-model="editedData.归档时间"
                          type="date"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择归档时间"
                          style="width: 100%"
                        />
                      </template>
                      <template v-else>
                        {{ formatDateOnly(caseDetail.归档时间) }}
                      </template>
                    </div>
                  </div>
                </ElCol>
              </ElRow>
            </div>
          </ElCard>

          <DebtorInfo :case-id="caseId" />
        </div>

        <!-- 流程处理 -->
        <div v-if="activeTab === 'process'" class="process-content">
          <BankruptcyProcess
            :case-id="caseId"
            :initial-stage="getInitialStageIndex()"
          />
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

        <!-- 文书送达 -->
        <div
          v-if="activeTab === 'documentService'"
          class="document-service-content"
        >
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header flex items-center justify-between">
                <div class="flex items-center">
                  <Icon icon="lucide:file-text" class="text-primary mr-2" />
                  <span class="text-lg font-semibold">文书送达</span>
                </div>
                <div class="flex space-x-2">
                  <ElButton type="primary" @click="openAddDocumentDialog">
                    <Icon icon="lucide:plus" class="mr-1" />
                    新增送达
                  </ElButton>
                </div>
              </div>
            </template>

            <!-- 文书送达列表 -->
            <div class="document-list-container">
              <div v-if="documentLoading" class="loading-container">
                <ElSkeleton :rows="5" animated />
              </div>
              <ElEmpty
                v-else-if="documentList.length === 0"
                description="暂无文书送达记录"
              />
              <div v-else>
                <ElTable
                  :data="documentList"
                  border
                  style="width: 100%"
                  :row-key="(row) => row.id"
                >
                  <ElTableColumn prop="documentName" label="文书名称" />
                  <ElTableColumn prop="recipientName" label="受送达人" />
                  <ElTableColumn prop="recipientType" label="受送达人类型">
                    <template #default="scope">
                      {{
                        scope.row.recipientType === 'CREDITOR'
                          ? '债权人'
                          : scope.row.recipientType === 'DEBTOR'
                            ? '债务人'
                            : scope.row.recipientType === 'COURT'
                              ? '法院'
                              : scope.row.recipientType
                      }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="deliveryMethod" label="送达方式">
                    <template #default="scope">
                      {{
                        scope.row.deliveryMethod === 'ELECTRONIC'
                          ? '电子送达'
                          : scope.row.deliveryMethod === 'MAIL'
                            ? '邮寄送达'
                            : scope.row.deliveryMethod === 'IN_PERSON'
                              ? '直接送达'
                              : scope.row.deliveryMethod === 'PUBLICATION'
                                ? '公告送达'
                                : scope.row.deliveryMethod
                      }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="sendStatus" label="送达状态">
                    <template #default="scope">
                      <ElTag
                        :type="
                          scope.row.sendStatus === 'COMPLETED'
                            ? 'success'
                            : scope.row.sendStatus === 'PENDING'
                              ? 'warning'
                              : scope.row.sendStatus === 'SENT'
                                ? 'primary'
                                : scope.row.sendStatus === 'FAILED'
                                  ? 'danger'
                                  : 'info'
                        "
                      >
                        {{
                          scope.row.sendStatus === 'COMPLETED'
                            ? '已送达'
                            : scope.row.sendStatus === 'PENDING'
                              ? '待送达'
                              : scope.row.sendStatus === 'SENT'
                                ? '已发送'
                                : scope.row.sendStatus === 'FAILED'
                                  ? '送达失败'
                                  : scope.row.sendStatus
                        }}
                      </ElTag>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="deliveryTime" label="送达日期" />
                  <ElTableColumn prop="status" label="审核状态">
                    <template #default="scope">
                      <ElTag
                        :type="
                          scope.row.status === 'APPROVED'
                            ? 'success'
                            : scope.row.status === 'PENDING'
                              ? 'warning'
                              : scope.row.status === 'REJECTED'
                                ? 'danger'
                                : 'info'
                        "
                      >
                        {{
                          scope.row.status === 'APPROVED'
                            ? '已通过'
                            : scope.row.status === 'PENDING'
                              ? '待审批'
                              : scope.row.status === 'REJECTED'
                                ? '已驳回'
                                : scope.row.status
                        }}
                      </ElTag>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="操作" width="400" fixed="right">
                    <template #default="scope">
                      <!-- 所有状态都显示查看详情按钮 -->
                      <ElButton
                        type="text"
                        :style="{ color: '#000000', textDecoration: 'none' }"
                        size="small"
                        @click="viewDocumentDetail(scope.row.id)"
                        class="no-hover-effect mr-2"
                      >
                        查看详情
                      </ElButton>

                      <!-- 待送达状态：修改、发送 -->
                      <template v-if="scope.row.sendStatus === 'PENDING'">
                        <ElButton
                          type="text"
                          :style="{ color: '#C29D59', textDecoration: 'none' }"
                          size="small"
                          @click="editDocument(scope.row)"
                          class="no-hover-effect mr-2"
                        >
                          修改
                        </ElButton>
                        <ElButton
                          type="text"
                          :style="{ color: '#1890ff', textDecoration: 'none' }"
                          size="small"
                          @click="sendDocument(scope.row.id)"
                          class="no-hover-effect mr-2"
                        >
                          发送
                        </ElButton>
                      </template>

                      <!-- 所有状态都显示删除按钮 -->
                      <ElPopconfirm
                        title="确定要删除该文书送达记录吗？"
                        @confirm="deleteDocument(scope.row.id)"
                      >
                        <template #reference>
                          <ElButton
                            type="text"
                            :style="{
                              color: '#ff4d4f',
                              textDecoration: 'none',
                            }"
                            size="small"
                            class="no-hover-effect"
                          >
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
                    :current-page="documentPagination.page"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="documentPagination.size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="documentPagination.total"
                    @size-change="handleDocumentPageSizeChange"
                    @current-change="handleDocumentPageChange"
                  />
                </div>
              </div>
            </div>
          </ElCard>
        </div>

        <!-- 公告管理 -->
        <div v-if="activeTab === 'announcement'" class="announcement-content">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header flex items-center justify-between">
                <div class="flex items-center">
                  <Icon icon="lucide:megaphone" class="text-primary mr-2" />
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
                  <ElTableColumn
                    prop="title"
                    label="公告标题"
                    min-width="200"
                  />
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
                  <ElTableColumn
                    prop="view_count"
                    label="查看次数"
                    width="100"
                  />
                  <ElTableColumn prop="status" label="状态" width="100">
                    <template #default="scope">
                      <ElTag
                        :type="
                          scope.row.status === 'PUBLISHED' ? 'success' : 'info'
                        "
                      >
                        {{
                          scope.row.status === 'PUBLISHED' ? '已发布' : '草稿'
                        }}
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
          <ElCard shadow="hover" :body-style="{ padding: 0 }">
            <!-- 标题和操作按钮 -->
            <div
              style="
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                background: #ffffff;
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
                      background: #f0f2f5;
                      border-radius: 8px;
                    "
                  >
                    <Icon
                      icon="lucide:users"
                      style="font-size: 24px; color: #409eff"
                    />
                  </div>
                  <div>
                    <h2
                      style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #303133;
                      "
                    >
                      工作团队管理
                    </h2>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #909399">
                      共 {{ workTeams.length }} 个工作团队
                    </p>
                  </div>
                </div>
                <div style="display: flex; gap: 10px">
                  <ElButton
                    type="primary"
                    @click="openAddTeamDialog"
                    v-if="isCreator"
                  >
                    <Icon icon="lucide:plus" class="mr-1" />
                    添加工作团队
                  </ElButton>
                </div>
              </div>
            </div>

            <!-- 工作团队列表 -->
            <div v-if="workTeams.length > 0" style="padding: 20px">
              <div
                v-for="team in workTeams"
                :key="team.id"
                style="
                  margin-bottom: 16px;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;
                  overflow: hidden;
                  background: #fff;
                "
              >
                <!-- 团队基本信息 -->
                <div
                  style="
                    padding: 16px;
                    border-bottom: 1px solid #ebeef5;
                    background: #fafafa;
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
                          background: #ecf5ff;
                          border-radius: 8px;
                        "
                      >
                        <Icon
                          icon="lucide:building-2"
                          style="font-size: 24px; color: #409eff"
                        />
                      </div>
                      <div>
                        <h3
                          style="
                            margin: 0 0 4px;
                            font-size: 16px;
                            font-weight: 600;
                            color: #303133;
                          "
                        >
                          {{ team.teamName }}
                        </h3>
                        <div
                          style="
                            display: flex;
                            gap: 16px;
                            align-items: center;
                            font-size: 13px;
                            color: #606266;
                          "
                        >
                          <span
                            style="display: flex; gap: 4px; align-items: center"
                          >
                            <Icon icon="lucide:user" style="font-size: 14px" />
                            负责人：{{ team.teamLeaderName || '-' }}
                          </span>
                          <span
                            style="display: flex; gap: 4px; align-items: center"
                          >
                            <Icon icon="lucide:users" style="font-size: 14px" />
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
                        type="default"
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
                        type="primary"
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
                  style="padding: 16px"
                  class="team-members-section"
                >
                  <div v-if="team.members?.length > 0">
                    <ElTable
                      :data="team.members"
                      style="width: 100%"
                      size="small"
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
                          {{ getTeamRoleLabel(row.teamRole) }}
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
                            size="small"
                          >
                            {{ getPermissionLabel(row.permissionLevel) }}
                          </ElTag>
                        </template>
                      </ElTableColumn>
                      <ElTableColumn prop="isActive" label="状态" width="80">
                        <template #default="{ row }">
                          <ElTag
                            :type="row.isActive ? 'success' : 'danger'"
                            size="small"
                          >
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
                        width="150"
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
                  <div
                    v-else
                    style="
                      text-align: center;
                      padding: 20px;
                      color: #909399;
                      border: 1px dashed #ebeef5;
                      border-radius: 4px;
                      background: #fafafa;
                    "
                  >
                    该团队暂无成员
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="!workTeamLoading"
              style="text-align: center; padding: 40px; color: #909399"
            >
              暂无工作团队，点击上方"添加工作团队"按钮创建
            </div>
            <div
              v-else
              style="display: flex; justify-content: center; padding: 40px"
            >
              <ElSkeleton :rows="5" animated />
            </div>
          </ElCard>
        </div>

        <!-- 工作日志卡片 -->
        <div v-if="activeTab === 'workLog'">
          <div
            style="
              overflow: hidden;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            "
          >
            <!-- 标题和操作按钮 -->
            <div
              style="
                padding: 20px;
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
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
                      background: rgba(255, 255, 255, 0.2);
                      border-radius: 50%;
                    "
                  >
                    <Icon
                      icon="lucide:calendar-check"
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
                      工作日志管理
                    </h2>
                    <p
                      style="
                        margin: 4px 0 0;
                        font-size: 14px;
                        color: rgba(255, 255, 255, 0.8);
                      "
                    >
                      记录案件处理过程中的重要工作内容
                    </p>
                  </div>
                </div>
                <div style="display: flex; gap: 10px">
                  <ElButton
                    type="primary"
                    @click="openAddWorkLogDialog"
                    style="color: #4caf50; background: white; border: none"
                  >
                    <Icon icon="lucide:plus" class="mr-1" />
                    添加日志
                  </ElButton>
                </div>
              </div>
            </div>

            <!-- 筛选区域 -->
            <div
              style="
                padding: 16px 20px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
              "
            >
              <div style="display: flex; gap: 12px; align-items: center">
                <ElSelect
                  v-model="workLogForm.workType"
                  placeholder="工作类型"
                  clearable
                  style="width: 150px"
                  @change="fetchWorkLogs"
                >
                  <ElOption
                    v-for="item in workTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
                <ElButton @click="fetchWorkLogs" type="primary">
                  <Icon icon="lucide:refresh-cw" class="mr-1" />
                  刷新
                </ElButton>
              </div>
            </div>

            <!-- 工作日志列表 -->
            <div style="padding: 20px">
              <div
                v-if="workLogLoading"
                style="display: flex; justify-content: center; padding: 40px"
              >
                <ElSkeleton :rows="5" animated />
              </div>
              <div v-else-if="workLogs.length > 0" class="work-log-list">
                <div
                  v-for="log in workLogs"
                  :key="log.id"
                  style="
                    margin-bottom: 16px;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #4caf50;
                    transition: all 0.3s ease;
                  "
                  :style="{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }"
                >
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      margin-bottom: 12px;
                    "
                  >
                    <div style="display: flex; gap: 12px; align-items: center">
                      <ElTag size="small" type="success">
                        {{ getWorkTypeLabel(log.workType) }}
                      </ElTag>
                      <div
                        style="font-size: 14px; font-weight: 600; color: #666"
                      >
                        {{ formatDate(log.workDate) }}
                      </div>
                    </div>
                    <div style="display: flex; gap: 8px">
                      <ElButton
                        type="primary"
                        size="small"
                        @click="editWorkLog(log)"
                        style="padding: 4px 12px; font-size: 12px"
                      >
                        <Icon icon="lucide:pencil" class="mr-1" />
                        编辑
                      </ElButton>
                      <ElPopconfirm
                        title="确定要删除这条日志吗？"
                        @confirm="deleteWorkLog(log.id)"
                      >
                        <template #reference>
                          <ElButton
                            type="danger"
                            size="small"
                            style="padding: 4px 12px; font-size: 12px"
                          >
                            <Icon icon="lucide:trash-2" class="mr-1" />
                            删除
                          </ElButton>
                        </template>
                      </ElPopconfirm>
                    </div>
                  </div>
                  <div
                    style="
                      margin-bottom: 12px;
                      font-size: 14px;
                      line-height: 1.6;
                      color: #333;
                      white-space: pre-wrap;
                    "
                  >
                    <div
                      style="
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: #2c3e50;
                      "
                    >
                      工作内容：
                    </div>
                    {{ log.workContent }}
                  </div>
                  <div
                    v-if="log.workResult"
                    style="
                      margin-bottom: 12px;
                      font-size: 14px;
                      line-height: 1.6;
                      color: #666;
                      white-space: pre-wrap;
                    "
                  >
                    <div
                      style="
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: #2c3e50;
                      "
                    >
                      工作结果：
                    </div>
                    {{ log.workResult }}
                  </div>
                  <div
                    v-if="log.remark"
                    style="
                      margin-bottom: 12px;
                      font-size: 13px;
                      line-height: 1.6;
                      color: #999;
                      white-space: pre-wrap;
                    "
                  >
                    <div
                      style="
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: #2c3e50;
                      "
                    >
                      备注：
                    </div>
                    {{ log.remark }}
                  </div>
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      font-size: 12px;
                      color: #999;
                    "
                  >
                    <span>创建时间：{{ formatDateTime(log.createTime) }}</span>
                    <span v-if="log.updateTime !== log.createTime">
                      更新时间：{{ formatDateTime(log.updateTime) }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-else
                style="text-align: center; padding: 40px; color: #909399"
              >
                <Icon
                  icon="lucide:book-open"
                  style="font-size: 64px; margin-bottom: 16px; color: #e0e0e0"
                />
                <p>暂无工作日志</p>
                <ElButton
                  type="primary"
                  @click="openAddWorkLogDialog"
                  style="margin-top: 16px"
                >
                  <Icon icon="lucide:plus" class="mr-1" />
                  添加第一条日志
                </ElButton>
              </div>
              <div
                v-if="workLogs.length > 0"
                style="display: flex; justify-content: center; margin-top: 20px"
              >
                <ElPagination
                  v-model:current-page="workLogPagination.pageNum"
                  v-model:page-size="workLogPagination.pageSize"
                  :total="workLogPagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="fetchWorkLogs"
                  @current-change="fetchWorkLogs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 添加/编辑日志对话框 -->
        <ElDialog
          v-model="showWorkLogDialog"
          :title="isEditingWorkLog ? '编辑工作日志' : '添加工作日志'"
          width="600px"
          destroy-on-close
        >
          <ElForm
            ref="workLogFormRef"
            :model="workLogForm"
            :rules="workLogFormRules"
            label-width="100px"
          >
            <ElFormItem label="工作日期" prop="workDate">
              <ElDatePicker
                v-model="workLogForm.workDate"
                type="date"
                placeholder="请选择工作日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </ElFormItem>
            <ElFormItem label="工作类型" prop="workType">
              <ElSelect
                v-model="workLogForm.workType"
                placeholder="请选择工作类型"
                style="width: 100%"
              >
                <ElOption
                  v-for="item in workTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="工作内容" prop="workContent">
              <ElInput
                v-model="workLogForm.workContent"
                type="textarea"
                :rows="4"
                placeholder="请输入工作内容"
                resize="vertical"
              />
            </ElFormItem>
            <ElFormItem label="工作结果">
              <ElInput
                v-model="workLogForm.workResult"
                type="textarea"
                :rows="3"
                placeholder="请输入工作结果（可选）"
                resize="vertical"
              />
            </ElFormItem>
            <ElFormItem label="附件ID">
              <ElInput
                v-model="workLogForm.attachmentIds"
                placeholder="请输入附件ID，多个ID用逗号分隔（可选）"
              />
            </ElFormItem>
            <ElFormItem label="备注">
              <ElInput
                v-model="workLogForm.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息（可选）"
                resize="vertical"
              />
            </ElFormItem>
          </ElForm>

          <template #footer>
            <ElButton @click="showWorkLogDialog = false">取消</ElButton>
            <ElButton
              type="primary"
              @click="saveWorkLog"
              :loading="savingWorkLog"
            >
              保存
            </ElButton>
          </template>
        </ElDialog>

        <!-- 案件卷宗归档抽屉 -->
        <ArchiveDrawer ref="archiveDrawerRef" :case-id="caseId" />

        <!-- 资金管控抽屉 -->
        <FundControlDrawer
          ref="fundControlDrawerRef"
          :case-id="caseId"
          :case-no="caseDetail?.案号 || ''"
          :case-name="caseDetail?.案件名称 || ''"
        />

        <!-- 资金管理组件 - 保留但不再使用 -->
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

        <!-- 公告置顶对话框 -->
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

        <!-- 公告发布对话框 -->
        <ElDialog
          v-model="showAnnouncementDialog"
          :title="dialogTitle"
          width="80%"
          destroy-on-close
        >
          <div class="dialog-form">
            <ElFormItem label="公告标题" required>
              <ElInput
                v-model="announcementData.title"
                placeholder="请输入公告标题"
                size="large"
              />
            </ElFormItem>
            <ElFormItem label="公告类型" required>
              <ElSelect
                v-model="announcementData.announcement_type"
                placeholder="请选择公告类型"
                size="large"
              >
                <ElOption label="普通公告" value="ANNOUNCEMENT" />
                <ElOption label="重要公告" value="IMPORTANT" />
                <ElOption label="紧急公告" value="URGENT" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="公告内容" required>
              <RichTextEditor
                v-model="announcementData.content"
                placeholder="请输入公告内容"
              />
            </ElFormItem>
            <ElFormItem label="附件">
              <ElUpload
                v-model:file-list="announcementData.attachments"
                :http-request="customUpload"
                :on-remove="handleAttachmentRemove"
                :before-upload="handleAnnouncementFileBeforeUpload"
                multiple
                :limit="10"
              >
                <ElButton type="primary" size="small">
                  <Icon icon="lucide:upload" class="mr-1" />
                  上传附件
                </ElButton>
                <template #tip>
                  <div class="el-upload__tip">
                    支持上传 doc、docx、pdf、txt、jpg、jpeg、png、gif
                    格式文件，单个文件不超过 50MB
                  </div>
                </template>
              </ElUpload>
            </ElFormItem>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="closeAnnouncementDialog">取消</ElButton>
              <ElButton type="primary" @click="saveAnnouncement">保存</ElButton>
            </div>
          </template>
        </ElDialog>

        <!-- 公告详情对话框 -->
        <ElDialog
          v-model="showDetailDialog"
          :title="currentAnnouncementDetail?.title || '公告详情'"
          width="80%"
          destroy-on-close
        >
          <div class="announcement-detail-container">
            <div v-loading="detailLoading" class="detail-content-wrapper">
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
                    <span class="label">查看次数：</span>
                    <span>{{ currentAnnouncementDetail.view_count || 0 }}</span>
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

        <!-- 添加工作团队对话框 -->
        <ElDialog
          v-model="addTeamDialogVisible"
          title="添加工作团队"
          width="600px"
          destroy-on-close
          :close-on-click-modal="false"
        >
          <div style="padding: 20px 0">
            <ElForm :model="addTeamForm" label-width="100px">
              <ElFormItem label="团队名称" required>
                <ElInput
                  v-model="addTeamForm.teamName"
                  placeholder="请输入团队名称"
                  clearable
                />
              </ElFormItem>

              <ElFormItem label="团队负责人" required>
                <div style="display: flex; gap: 10px; width: 100%">
                  <ElInput
                    :value="
                      selectedLeader?.name || addTeamForm.teamLeaderId || ''
                    "
                    placeholder="请选择团队负责人"
                    readonly
                    style="flex: 1"
                  />
                  <ElButton type="primary" @click="openLeaderSelectDialog">
                    选择负责人
                  </ElButton>
                </div>
              </ElFormItem>

              <ElFormItem label="团队描述">
                <ElInput
                  v-model="addTeamForm.teamDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入团队描述"
                  clearable
                />
              </ElFormItem>
            </ElForm>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="addTeamDialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handleCreateWorkTeam">
                确定
              </ElButton>
            </div>
          </template>
        </ElDialog>

        <!-- 团队负责人选择对话框 -->
        <ElDialog
          v-model="leaderSelectDialogVisible"
          title="选择团队负责人"
          width="900px"
          destroy-on-close
          :close-on-click-modal="false"
        >
          <div
            v-loading="loadingAdministratorsForLeader"
            style="min-height: 400px"
          >
            <div v-if="administratorsForLeader.length > 0">
              <div
                v-for="admin in administratorsForLeader"
                :key="admin.sepId"
                style="
                  margin-bottom: 20px;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;
                  overflow: hidden;
                "
              >
                <div
                  style="
                    padding: 12px 16px;
                    background: #f5f7fa;
                    border-bottom: 1px solid #ebeef5;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  "
                >
                  <div style="display: flex; align-items: center; gap: 8px">
                    <Icon
                      icon="lucide:building-2"
                      style="font-size: 18px; color: #409eff"
                    />
                    <span style="font-weight: 600; font-size: 15px">{{
                      admin.lsswsid
                    }}</span>
                  </div>
                  <ElButton
                    size="small"
                    type="primary"
                    link
                    @click="loadStaffForLeader(admin.sepId)"
                    :loading="
                      loadingStaffForLeader &&
                      selectedLeaderAdministratorId === admin.sepId
                    "
                  >
                    <Icon icon="lucide:users" class="mr-1" />
                    查看员工
                  </ElButton>
                </div>

                <div
                  v-if="administratorsStaffMap.has(admin.sepId)"
                  style="padding: 16px"
                >
                  <div
                    v-if="administratorsStaffMap.get(admin.sepId)?.length > 0"
                    style="
                      display: grid;
                      grid-template-columns: repeat(
                        auto-fill,
                        minmax(280px, 1fr)
                      );
                      gap: 12px;
                    "
                  >
                    <div
                      v-for="staff in administratorsStaffMap.get(admin.sepId)"
                      :key="staff.id"
                      class="staff-card"
                      :class="[{ selected: selectedLeader?.id === staff.id }]"
                      style="
                        padding: 12px;
                        border: 1px solid #dcdfe6;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.3s;
                        background: #fff;
                      "
                      @click="selectLeader(staff, admin.sepId)"
                    >
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          gap: 10px;
                          margin-bottom: 8px;
                        "
                      >
                        <div
                          style="
                            width: 40px;
                            height: 40px;
                            background: #ecf5ff;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          "
                        >
                          <Icon
                            icon="lucide:user"
                            style="font-size: 20px; color: #409eff"
                          />
                        </div>
                        <div style="flex: 1">
                          <div
                            style="
                              font-weight: 600;
                              font-size: 14px;
                              color: #303133;
                            "
                          >
                            {{ staff.name }}
                          </div>
                          <div style="font-size: 12px; color: #909399">
                            {{ staff.staffType }}
                          </div>
                        </div>
                        <Icon
                          v-if="selectedLeader?.id === staff.id"
                          icon="lucide:check-circle"
                          style="font-size: 20px; color: #67c23a"
                        />
                      </div>
                      <div
                        style="
                          font-size: 12px;
                          color: #606266;
                          line-height: 1.6;
                        "
                      >
                        <div>联系电话：{{ staff.contactPhone || '-' }}</div>
                        <div>邮箱：{{ staff.email || '-' }}</div>
                        <div>入职日期：{{ staff.appointmentDate || '-' }}</div>
                      </div>
                    </div>
                  </div>
                  <ElEmpty v-else description="暂无员工数据" :image-size="80" />
                </div>
              </div>
            </div>
            <ElEmpty v-else description="暂无管理人数据" :image-size="80" />
          </div>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="leaderSelectDialogVisible = false">
                取消
              </ElButton>
              <ElButton type="primary" @click="confirmSelectLeader">
                确定
              </ElButton>
            </div>
          </template>
        </ElDialog>

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
              <ElFormItem v-if="!memberForm.id" label="管理员机构" required>
                <ElSelect
                  v-model="selectedDeptId"
                  placeholder="请选择管理员机构"
                  style="width: 100%"
                  filterable
                  :loading="loadingAdministrators"
                  clearable
                >
                  <ElOption
                    v-for="admin in administrators"
                    :key="admin.sepId"
                    :label="admin.lsswsid"
                    :value="admin.sepId"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem v-if="!memberForm.id" label="成员" required>
                <ElSelect
                  v-model="selectedUser"
                  placeholder="请选择成员"
                  style="width: 100%"
                  filterable
                  :loading="loadingUsers"
                  :disabled="!selectedDeptId"
                  value-key="uPid"
                  clearable
                >
                  <ElOption
                    v-for="user in availableUsers"
                    :key="user.uPid"
                    :label="user.uName"
                    :value="user"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem v-if="memberForm.id" label="管理员机构">
                <ElInput
                  v-model="memberForm.deptName"
                  placeholder="管理员机构"
                  disabled
                />
              </ElFormItem>

              <ElFormItem v-if="memberForm.id" label="成员">
                <ElInput
                  v-model="memberForm.userName"
                  placeholder="成员"
                  disabled
                />
              </ElFormItem>

              <ElFormItem label="团队角色" required>
                <ElSelect
                  v-model="memberForm.teamRole"
                  placeholder="选择角色"
                  style="width: 100%"
                  clearable
                >
                  <ElOption label="负责人" value="LEADER" />
                  <ElOption label="成员" value="MEMBER" />
                  <ElOption label="访客" value="GUEST" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="权限级别">
                <ElSelect
                  v-model="memberForm.permissionLevel"
                  placeholder="权限级别"
                  style="width: 100%"
                  disabled
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

        <!-- 新增文书送达弹窗 -->
        <ElDialog
          v-model="showAddDocumentDialog"
          title="新增文书送达"
          width="80%"
          destroy-on-close
          :close-on-click-modal="false"
          :close-on-press-escape="false"
        >
          <div class="document-add-dialog">
            <ElCard>
              <ElForm
                :model="documentForm"
                :rules="documentFormRules"
                label-width="120px"
                class="document-form"
              >
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="案号">
                      <ElInput
                        v-model="documentForm.caseNumber"
                        placeholder="自动填充"
                        disabled
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="案件名称">
                      <ElInput
                        v-model="documentForm.caseName"
                        placeholder="自动填充"
                        disabled
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="文书名称" prop="documentName">
                      <ElInput
                        v-model="documentForm.documentName"
                        placeholder="请输入文书名称"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="文书类型" prop="documentType">
                      <ElSelect
                        v-model="documentForm.documentType"
                        placeholder="请选择文书类型"
                        style="width: 100%"
                      >
                        <ElOption
                          v-for="item in documentTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElDivider content-position="left">受送达人信息</ElDivider>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="受送达人" prop="recipient">
                      <ElInput
                        v-model="documentForm.recipient"
                        placeholder="请输入受送达人姓名"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="受送达人类型" prop="recipientType">
                      <ElSelect
                        v-model="documentForm.recipientType"
                        placeholder="请选择受送达人类型"
                        style="width: 100%"
                      >
                        <ElOption
                          v-for="item in recipientTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="联系电话" prop="recipientPhone">
                      <ElInput
                        v-model="documentForm.recipientPhone"
                        placeholder="请输入联系电话"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="送达地址" prop="recipientAddress">
                      <ElInput
                        v-model="documentForm.recipientAddress"
                        placeholder="请输入送达地址"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElDivider content-position="left">送达信息</ElDivider>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="送达方式" prop="serviceMethod">
                      <ElSelect
                        v-model="documentForm.serviceMethod"
                        placeholder="请选择送达方式"
                        style="width: 100%"
                      >
                        <ElOption
                          v-for="item in serviceMethodOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="发送状态">
                      <ElSelect
                        v-model="documentForm.sendStatus"
                        placeholder="请选择发送状态"
                        style="width: 100%"
                      >
                        <ElOption label="已发送" value="已发送" />
                        <ElOption label="暂存送达" value="暂存送达" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElFormItem label="送达内容" prop="serviceContent">
                  <RichTextEditor
                    v-model="documentForm.serviceContent"
                    placeholder="请输入送达内容"
                  />
                </ElFormItem>

                <ElDivider content-position="left">文书附件</ElDivider>

                <ElFormItem label="上传文书">
                  <div class="file-upload-container">
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".doc,.docx,.pdf,.jpg,.png,.xls,.xlsx"
                      class="file-input"
                      @change="handleFileChange"
                    />
                    <ElButton
                      type="primary"
                      @click="fileInput?.click()"
                      :loading="fileUploadLoading"
                    >
                      <Icon icon="lucide:upload" class="mr-1" />
                      选择文件
                    </ElButton>
                    <span class="ml-2 text-sm text-gray-500">
                      支持上传文档、图片等文件，单个文件不超过10MB
                    </span>
                  </div>

                  <div v-if="uploadedFiles.length > 0" class="mt-3">
                    <ElTable :data="uploadedFiles" style="width: 100%">
                      <ElTableColumn prop="name" label="文件名称" />
                      <ElTableColumn prop="size" label="文件大小" width="120">
                        <template #default="scope">
                          {{
                            ((scope.row.file?.size || 0) / 1024 / 1024).toFixed(
                              2,
                            )
                          }}
                          MB
                        </template>
                      </ElTableColumn>
                      <ElTableColumn label="操作" width="150">
                        <template #default="scope">
                          <ElButton
                            type="primary"
                            size="small"
                            @click="downloadFile(scope.row)"
                          >
                            下载
                          </ElButton>
                          <ElButton
                            type="danger"
                            size="small"
                            @click="removeFile(scope.$index)"
                          >
                            删除
                          </ElButton>
                        </template>
                      </ElTableColumn>
                    </ElTable>
                  </div>
                </ElFormItem>

                <ElFormItem>
                  <div class="form-actions flex justify-end gap-3">
                    <ElButton @click="closeAddDocumentDialog">取消</ElButton>
                    <ElButton @click="resetDocumentForm">重置</ElButton>
                    <ElButton
                      type="primary"
                      @click="submitDocumentForm"
                      :loading="fileUploadLoading"
                    >
                      提交
                    </ElButton>
                  </div>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </div>
        </ElDialog>

        <!-- 文书详情弹窗 -->
        <ElDialog
          v-model="showDocumentDetailDialog"
          title="文书详情"
          width="800px"
          destroy-on-close
        >
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="showDocumentDetailDialog = false">
                关闭
              </ElButton>
            </div>
          </template>

          <div v-if="documentDetailLoading" class="loading-container">
            <ElSkeleton :rows="8" animated />
          </div>

          <div v-else-if="documentDetail" class="document-detail-container">
            <div class="detail-section">
              <h3 class="section-title">基本信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">文书名称：</span>
                  <span class="detail-value">{{
                    documentDetail.documentName
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">文书类型：</span>
                  <span class="detail-value">{{
                    documentDetail.documentType
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">案号：</span>
                  <span class="detail-value">{{
                    documentDetail.caseNumber
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">案件名称：</span>
                  <span class="detail-value">{{
                    documentDetail.caseName
                  }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">送达信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">受送达人：</span>
                  <span class="detail-value">{{
                    documentDetail.recipientName
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">受送达人类型：</span>
                  <span class="detail-value">{{
                    documentDetail.recipientType === 'CREDITOR'
                      ? '债权人'
                      : documentDetail.recipientType === 'DEBTOR'
                        ? '债务人'
                        : documentDetail.recipientType === 'COURT'
                          ? '法院'
                          : documentDetail.recipientType
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">联系电话：</span>
                  <span class="detail-value">{{
                    documentDetail.contactPhone || '-'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">送达地址：</span>
                  <span class="detail-value">{{
                    documentDetail.deliveryAddress || '-'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">送达方式：</span>
                  <span class="detail-value">{{
                    documentDetail.deliveryMethod === 'ELECTRONIC'
                      ? '电子送达'
                      : documentDetail.deliveryMethod === 'MAIL'
                        ? '邮寄送达'
                        : documentDetail.deliveryMethod === 'IN_PERSON'
                          ? '直接送达'
                          : documentDetail.deliveryMethod === 'PUBLICATION'
                            ? '公告送达'
                            : documentDetail.deliveryMethod
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">送达状态：</span>
                  <span class="detail-value">
                    <ElTag
                      :type="
                        documentDetail.sendStatus === 'COMPLETED'
                          ? 'success'
                          : documentDetail.sendStatus === 'PENDING'
                            ? 'warning'
                            : documentDetail.sendStatus === 'SENT'
                              ? 'primary'
                              : documentDetail.sendStatus === 'FAILED'
                                ? 'danger'
                                : 'info'
                      "
                    >
                      {{
                        documentDetail.sendStatus === 'COMPLETED'
                          ? '已送达'
                          : documentDetail.sendStatus === 'PENDING'
                            ? '待送达'
                            : documentDetail.sendStatus === 'SENT'
                              ? '已发送'
                              : documentDetail.sendStatus === 'FAILED'
                                ? '送达失败'
                                : documentDetail.sendStatus
                      }}
                    </ElTag>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">审核状态：</span>
                  <span class="detail-value">
                    <ElTag
                      :type="
                        documentDetail.status === 'APPROVED'
                          ? 'success'
                          : documentDetail.status === 'PENDING'
                            ? 'warning'
                            : documentDetail.status === 'REJECTED'
                              ? 'danger'
                              : 'info'
                      "
                    >
                      {{
                        documentDetail.status === 'APPROVED'
                          ? '已通过'
                          : documentDetail.status === 'PENDING'
                            ? '待审批'
                            : documentDetail.status === 'REJECTED'
                              ? '已驳回'
                              : documentDetail.status
                      }}
                    </ElTag>
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">送达内容</h3>
              <div
                class="detail-content"
                v-html="documentDetail.deliveryContent"
              ></div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">附件信息</h3>
              <div v-if="documentAttachmentsLoading" class="loading-container">
                <ElSkeleton :rows="3" animated />
              </div>
              <div
                v-else-if="documentAttachments.length > 0"
                class="attachments-list"
              >
                <div
                  v-for="attachment in documentAttachments"
                  :key="attachment.id"
                  class="attachment-item"
                >
                  <div class="attachment-icon">
                    <Icon
                      :icon="
                        attachment.fileExtension === 'pdf'
                          ? 'lucide:file-text'
                          : attachment.fileExtension === 'doc' ||
                              attachment.fileExtension === 'docx'
                            ? 'lucide:file-word'
                            : attachment.fileExtension === 'xls' ||
                                attachment.fileExtension === 'xlsx'
                              ? 'lucide:file-spreadsheet'
                              : 'lucide:file'
                      "
                    />
                  </div>
                  <div class="attachment-info">
                    <div class="attachment-name">
                      {{ attachment.originalFileName }}
                    </div>
                    <div class="attachment-meta">
                      <span>{{ formatFileSize(attachment.fileSize) }}</span>
                      <span class="separator">·</span>
                      <span>{{ formatDateTime(attachment.uploadTime) }}</span>
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <ElButton
                      type="primary"
                      size="small"
                      link
                      @click="downloadDocumentAttachment(attachment)"
                    >
                      <Icon icon="lucide:download" class="mr-1" />
                      下载
                    </ElButton>
                  </div>
                </div>
              </div>
              <div v-else class="empty-attachments">
                <ElEmpty description="暂无附件" />
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">时间信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">创建时间：</span>
                  <span class="detail-value">{{
                    formatDateTime(documentDetail.createTime)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">送达时间：</span>
                  <span class="detail-value">{{
                    formatDateTime(documentDetail.deliveryTime)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">发送时间：</span>
                  <span class="detail-value">{{
                    formatDateTime(documentDetail.sendTime)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">更新时间：</span>
                  <span class="detail-value">{{
                    formatDateTime(documentDetail.updateTime)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-detail">
            <ElEmpty description="暂无文书详情" />
          </div>
        </ElDialog>
      </ElCard>

      <!-- 批审对话框 -->
      <ElDialog
        v-model="showReviewDialog"
        title="提交批审"
        width="80%"
        destroy-on-close
      >
        <div class="review-dialog-content">
          <!-- 批审表单 -->
          <ElCard class="review-form-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="text-lg font-semibold">批审信息</span>
              </div>
            </template>

            <ElRow :gutter="20">
              <ElCol :xs="24" :sm="12">
                <ElFormItem label="审批类型">
                  <ElSelect
                    v-model="reviewForm.reviewType"
                    placeholder="请选择审批类型"
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="option in reviewTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :sm="12">
                <ElFormItem label="审批人">
                  <ElSelect
                    v-model="reviewForm.reviewers"
                    multiple
                    placeholder="请选择审批人"
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="option in reviewerOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24">
                <ElFormItem label="审批内容">
                  <ElInput
                    v-model="reviewForm.reviewContent"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入审批内容"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24">
                <ElFormItem label="附件">
                  <ElUpload
                    action="#"
                    :auto-upload="false"
                    :file-list="reviewForm.attachments"
                    list-type="text"
                  >
                    <ElButton type="primary">
                      <Icon icon="lucide:paperclip" class="mr-2" />
                      上传附件
                    </ElButton>
                  </ElUpload>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElCard>

          <!-- 审批历史 -->
          <ElCard
            class="review-history-card"
            shadow="hover"
            style="margin-top: 20px"
          >
            <template #header>
              <div class="card-header">
                <span class="text-lg font-semibold">审批历史</span>
              </div>
            </template>

            <ElTable :data="reviewHistory" stripe style="width: 100%">
              <ElTableColumn prop="reviewer" label="审批人" width="120" />
              <ElTableColumn prop="reviewDate" label="审批时间" width="200" />
              <ElTableColumn prop="status" label="审批状态" width="120">
                <template #default="scope">
                  <ElTag
                    :type="scope.row.status === '已通过' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="comment" label="审批意见" />
            </ElTable>
          </ElCard>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="showReviewDialog = false">取消</ElButton>
            <ElButton type="primary" @click="submitReview">提交批审</ElButton>
          </div>
        </template>
      </ElDialog>

      <ProgressManagementModal
        v-model:visible="showProgressManagement"
        :case-id="caseId"
        @progress-updated="handleProgressUpdated"
      />
    </div>
  </div>
</template>

<style scoped>
/* 页面基础样式 */
.law-case-detail-wrapper {
  padding: 0;
  min-height: 100vh;
  background-color: white;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 内容标签样式 */
.content-tabs {
  display: flex;
  margin-top: 6px;
  margin-bottom: 24px;
}

.tabs-container {
  display: flex;
  background: #f8fafc;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.tab-button {
  min-width: 120px;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片样式 */
.main-content-card {
  background: white;
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
}

.case-info-card {
  margin-top: 0px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 关键信息概览样式 */
.key-info-overview {
  margin-bottom: 24px;
}

.key-info-item {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.key-info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.key-info-label {
  color: #6b7280;
  margin-bottom: 8px;
}

.key-info-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* 详细信息样式 */
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

/* 案件相关时间样式 */
.case-time-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.case-time-content {
  padding: 8px 0;
}

.time-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.time-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.time-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.time-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 600;
}

/* 工作团队样式 */
.work-team-content {
  margin-bottom: 0;
}

.team-members-container {
  margin-top: 16px;
}

/* 流程处理样式 */
.process-content {
  margin-bottom: 0;
}

.stage-tabs {
  margin-bottom: 24px;
}

.stage-content {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

/* 公告管理样式 */
.announcement-content {
  margin-bottom: 0;
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

/* 公告详情样式 */
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

/* 文书送达样式 */
.document-service-content {
  margin-bottom: 0;
}

.document-list-container {
  margin-top: 16px;
}

/* 去除操作按钮hover效果 */
.no-hover-effect {
  &:hover {
    color: inherit !important;
    background-color: transparent !important;
    text-decoration: none !important;
  }
}

/* 新增文书送达弹窗样式 */
.document-add-dialog {
  padding: 0;
}

.document-form {
  padding: 20px 0;
}

.form-actions {
  padding: 20px 0 0;
  border-top: 1px solid #e5e7eb;
}

.file-upload-container {
  display: flex;
  align-items: center;
}

.file-input {
  display: none;
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

/* 其他组件样式 */
.debtor-info-content {
  margin-bottom: 0;
}

/* 文书详情弹窗样式 */
.document-detail-container {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: #1f2937;
  word-break: break-word;
}

.detail-content {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  line-height: 1.6;
}

.attachment-info {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.attachment-link {
  color: #3b82f6;
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.attachment-item:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  font-size: 24px;
  color: #6b7280;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.attachment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  word-break: break-all;
}

.attachment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.attachment-meta .separator {
  color: #9ca3af;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.empty-attachments {
  padding: 32px;
  text-align: center;
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* 团队负责人选择对话框样式 */
.staff-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.staff-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

/* 编辑模式美化样式 */
.case-info-card.editing {
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.case-time-card.editing {
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.detail-info-item {
  transition: all 0.3s ease;
}

.detail-info-item:hover {
  background: #f9fafb;
  border-radius: 4px;
}

.detail-info-item.editing {
  background: transparent;
  border-radius: 4px;
  padding: 16px;
  border: 1px solid #dbeafe;
}

.detail-info-label.editing {
  color: #374151;
  font-weight: 500;
}

.detail-info-value.editing {
  color: #111827;
}

.time-item {
  transition: all 0.3s ease;
}

.time-item:hover {
  background: #f9fafb;
  border-radius: 4px;
}

.time-item.editing {
  background: transparent;
  border: 1px solid #dbeafe;
  transform: none;
  box-shadow: none;
}

.time-item.editing:hover {
  transform: none;
  box-shadow: none;
}

.time-label.editing {
  color: #374151;
  font-weight: 500;
}

.time-value.editing {
  color: #111827;
}

/* 编辑框美化 */
:deep(.el-input__wrapper) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
  transform: scale(1.02);
}

:deep(.el-select .el-input__wrapper) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
  border-color: #8b5cf6;
  transform: scale(1.02);
}

:deep(.el-date-editor) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-date-editor:hover) {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

:deep(.el-date-editor.is-active) {
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  border-color: #10b981;
  transform: scale(1.02);
}

/* 编辑按钮美化 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* 编辑状态指示器 */
.edit-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #dbeafe;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #1d4ed8;
}

.edit-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

/* 编辑模式下的卡片头部 */
.card-header.editing {
  background: transparent;
  border-radius: 8px 8px 0 0;
  padding: 16px;
  margin: -16px -16px 16px -16px;
}

/* Element Plus 标签按钮样式优化 */
:deep(.el-radio-group) {
  display: flex;
  width: 100%;
  background: transparent;
  border: none !important;
}

:deep(.el-radio-button) {
  flex: 1;
  text-align: center;
  border: none !important;
  background: transparent !important;
  color: #64748b !important;
  font-weight: 500;
  font-size: 14px;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 8px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none !important;
  overflow: visible !important;
}

:deep(.el-radio-button:hover) {
  background: #e2e8f0 !important;
  color: #334155 !important;
  transform: translateY(-1px);
  box-shadow: none !important;
}

:deep(.el-radio-button__inner) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 12px 24px !important;
  margin: 0 !important;
  color: inherit !important;
  font-weight: inherit !important;
  font-size: inherit !important;
  transition: none !important;
  border-radius: 8px !important;
  position: relative !important;
  z-index: 1 !important;
  overflow: visible !important;
  background-clip: padding-box !important;
}

:deep(.el-radio-button__inner:hover) {
  background: transparent !important;
  color: inherit !important;
  box-shadow: none !important;
}

:deep(.el-radio-button.is-active) {
  background: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  transform: translateY(-2px);
  border: none !important;
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: transparent !important;
  color: white !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.el-radio-button.is-active:hover) {
  background: #2563eb !important;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4) !important;
}

:deep(.el-radio-button:first-child) {
  border-radius: 8px 0 0 8px !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px 0 0 8px !important;
  border-right: none !important;
}

:deep(.el-radio-button:last-child) {
  border-radius: 0 8px 8px 0 !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0 !important;
  border-left: none !important;
}

/* 中间按钮样式 */
:deep(.el-radio-button:not(:first-child):not(:last-child)) {
  border-radius: 0 !important;
}

:deep(
  .el-radio-button:not(:first-child):not(:last-child) .el-radio-button__inner
) {
  border-radius: 0 !important;
  border-left: none !important;
  border-right: none !important;
}

/* 移除Element Plus默认的边框和背景 */
:deep(.el-radio-group::before),
:deep(.el-radio-group::after) {
  display: none !important;
}

:deep(.el-radio-button::before) {
  display: none !important;
}

/* 移除所有可能的边框样式 */
:deep(.el-radio-button--default.is-active .el-radio-button__inner) {
  border-color: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.el-radio-button--default .el-radio-button__inner) {
  border-color: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.el-radio-button--default.is-active:not(:first-child)::before) {
  display: none !important;
}

:deep(.el-radio-button--default:not(:first-child)::before) {
  display: none !important;
}

/* 移除所有相邻按钮之间的边框 */
:deep(.el-radio-button + .el-radio-button) {
  border-left: none !important;
  margin-left: 0 !important;
}

:deep(.el-radio-button + .el-radio-button .el-radio-button__inner) {
  border-left: none !important;
}

/* 移除所有可能的边框，包括嵌套结构 */
:deep(.el-radio-button),
:deep(.el-radio-button *) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

/* 确保没有任何边框样式 */
:deep(.el-radio-button__inner) {
  border: none !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
}

/* 移除所有伪元素的边框 */
:deep(.el-radio-button::before),
:deep(.el-radio-button::after),
:deep(.el-radio-button__inner::before),
:deep(.el-radio-button__inner::after) {
  display: none !important;
  border: none !important;
  background: none !important;
}

/* 确保没有任何边框相关的样式 */
:deep(.el-radio-button--default) {
  border: none !important;
}

:deep(.el-radio-button--default.is-active) {
  border: none !important;
}

:deep(.el-radio-button--default.is-active .el-radio-button__inner) {
  border: none !important;
}

:deep(.el-radio-button--default .el-radio-button__inner:hover) {
  border-color: transparent !important;
  background-color: transparent !important;
}

:deep(.el-radio-button--default.is-active .el-radio-button__inner:hover) {
  border-color: transparent !important;
  background-color: transparent !important;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
