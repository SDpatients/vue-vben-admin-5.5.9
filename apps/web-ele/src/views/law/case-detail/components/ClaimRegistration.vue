<script setup lang="ts">
import type { ClaimConfirmationApi } from '#/api/core/claim-confirmation';
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';
import type { ClaimReviewApi } from '#/api/core/claim-review';

import { computed, onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElAlert,
  ElButton,
  ElCard,
  ElCheckbox,
  ElCol,
  ElDescriptions,
  ElDescriptionsItem,
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
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
  ElUpload,
} from 'element-plus';

import { getCurrentUserApi } from '#/api/core/auth';
import { batchImportClaimsApi, exportClaimsApi } from '#/api/core/claim';
import {
  finalizeClaimConfirmationApi,
  submitObjectionApi,
  submitVoteApi,
} from '#/api/core/claim-confirmation';
import {
  createClaimRegistrationApi,
  deleteClaimRegistrationApi,
  getClaimRegistrationDetailApi,
  getClaimRegistrationListApi,
  receiveClaimMaterialApi,
  updateClaimRegistrationApi,
  updateClaimRegistrationStatusApi,
} from '#/api/core/claim-registration';
import {
  createClaimReviewApi,
  submitClaimReviewApi,
} from '#/api/core/claim-review';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// 检查是否为开发环境
const isDevelopment = ref(import.meta.env.DEV);

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showDetailDialog = ref(false);
const showReviewDialog = ref(false);
const showConfirmationDialog = ref(false);
const showStageOneDialog = ref(false);
const showStageTwoDialog = ref(false);
const showStageThreeDialog = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const showImportDialog = ref(false);
const importLoading = ref(false);
const stageOneLoading = ref(false);
const stageTwoLoading = ref(false);
const stageThreeLoading = ref(false);

const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(
  null,
);
const currentReview = ref<ClaimReviewApi.ClaimReviewInfo | null>(null);
const currentConfirmation =
  ref<ClaimConfirmationApi.ClaimConfirmationInfo | null>(null);
const activeTab = ref('basic');

const claimForm = reactive({
  caseName: '',
  debtor: '',
  account: '',
  creditorName: '',
  creditorType: '',
  creditCode: '',
  legalRepresentative: '',
  serviceAddress: '',
  agentName: '',
  agentPhone: '',
  agentIdCard: '',
  agentAddress: '',
  accountName: '',
  bankAccount: '',
  bankName: '',
  principal: '',
  interest: '',
  penalty: '',
  otherLosses: '',
  totalAmount: '',
  hasCourtJudgment: false,
  hasExecution: false,
  hasCollateral: false,
  claimNature: '',
  claimType: '',
  claimFacts: '',
  claimIdentifier: '',
  evidenceList: '',
  evidenceMaterials: '',
  evidenceAttachments: [],
  registrationDate: '',
  registrationDeadline: '',
  materialReceiver: '',
  materialReceiveDate: '',
  materialCompleteness: 'COMPLETE' as ClaimRegistrationApi.MaterialCompleteness,
  remarks: '',
  registrationStatus: 'PENDING' as ClaimRegistrationApi.RegistrationStatus,
});

const reviewForm = reactive({
  reviewDate: '',
  reviewer: '',
  reviewRound: 1,
  reviewBasis: '',
  declaredPrincipal: 0,
  declaredInterest: 0,
  declaredPenalty: 0,
  declaredOtherLosses: 0,
  declaredTotalAmount: 0,
  confirmedPrincipal: 0,
  confirmedInterest: 0,
  confirmedPenalty: 0,
  confirmedOtherLosses: 0,
  confirmedTotalAmount: 0,
  unconfirmedPrincipal: 0,
  unconfirmedInterest: 0,
  unconfirmedPenalty: 0,
  unconfirmedOtherLosses: 0,
  unconfirmedTotalAmount: 0,
  adjustmentReason: '',
  unconfirmedReason: '',
  insufficientEvidenceReason: '',
  expiredReason: '',
  evidenceAuthenticity: 'AUTHENTIC' as ClaimReviewApi.EvidenceAuthenticity,
  evidenceRelevance: 'RELEVANT' as ClaimReviewApi.EvidenceRelevance,
  evidenceLegality: 'LEGAL' as ClaimReviewApi.EvidenceLegality,
  evidenceReviewNotes: '',
  confirmedClaimNature: '',
  isJointLiability: false,
  isConditional: false,
  isTerm: false,
  collateralType: '',
  collateralProperty: '',
  collateralAmount: 0,
  collateralTerm: '',
  collateralValidity: 'VALID' as ClaimReviewApi.CollateralValidity,
  reviewConclusion: 'CONFIRMED' as ClaimReviewApi.ReviewConclusion,
  reviewSummary: '',
  reviewReport: '',
  reviewAttachments: '',
  reviewStatus: 'COMPLETED' as ClaimReviewApi.ReviewStatus,
  remarks: '',
});

const confirmationForm = reactive({
  meetingType: 'FIRST' as ClaimConfirmationApi.MeetingType,
  meetingDate: '',
  meetingLocation: '',
  voteResult: 'AGREE' as ClaimConfirmationApi.VoteResult,
  voteNotes: '',
  hasObjection: false,
  objector: '',
  objectionReason: '',
  objectionAmount: 0,
  objectionDate: '',
  negotiationResult: '',
  negotiationDate: '',
  negotiationParticipants: '',
  courtRulingDate: '',
  courtRulingNo: '',
  courtRulingResult: 'CONFIRMED' as ClaimConfirmationApi.CourtRulingResult,
  courtRulingAmount: 0,
  courtRulingNotes: '',
  hasLawsuit: false,
  lawsuitCaseNo: '',
  lawsuitStatus: 'PENDING' as ClaimConfirmationApi.LawsuitStatus,
  lawsuitResult: 'WIN' as ClaimConfirmationApi.LawsuitResult,
  lawsuitAmount: 0,
  lawsuitNotes: '',
  finalConfirmedAmount: 0,
  finalConfirmationDate: '',
  finalConfirmationBasis:
    'MEETING' as ClaimConfirmationApi.FinalConfirmationBasis,
  confirmationAttachments: '',
  confirmationStatus: 'PENDING' as ClaimConfirmationApi.ConfirmationStatus,
  remarks: '',
});

const fileList = ref<any[]>([]);

const totalAmount = computed(() => {
  const principal = Number.parseFloat(claimForm.principal) || 0;
  const interest = Number.parseFloat(claimForm.interest) || 0;
  const penalty = Number.parseFloat(claimForm.penalty) || 0;
  const otherLosses = Number.parseFloat(claimForm.otherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
});

// 第二阶段：审查阶段总金额计算
const declaredTotalAmount = computed(() => {
  const principal = Number(reviewForm.declaredPrincipal) || 0;
  const interest = Number(reviewForm.declaredInterest) || 0;
  const penalty = Number(reviewForm.declaredPenalty) || 0;
  const otherLosses = Number(reviewForm.declaredOtherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
});

const confirmedTotalAmount = computed(() => {
  const principal = Number(reviewForm.confirmedPrincipal) || 0;
  const interest = Number(reviewForm.confirmedInterest) || 0;
  const penalty = Number(reviewForm.confirmedPenalty) || 0;
  const otherLosses = Number(reviewForm.confirmedOtherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
});

const unconfirmedTotalAmount = computed(() => {
  const principal = Number(reviewForm.unconfirmedPrincipal) || 0;
  const interest = Number(reviewForm.unconfirmedInterest) || 0;
  const penalty = Number(reviewForm.unconfirmedPenalty) || 0;
  const otherLosses = Number(reviewForm.unconfirmedOtherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
});

// 第三阶段：确认阶段总金额计算
const finalConfirmedAmount = computed(() => {
  // 根据不同的确认依据计算最终确认金额
  if (
    confirmationForm.finalConfirmationBasis === 'COURT' &&
    confirmationForm.courtRulingAmount
  ) {
    // 如果是法院裁定，使用法院裁定金额
    return confirmationForm.courtRulingAmount.toFixed(2);
  } else if (confirmationForm.hasLawsuit && confirmationForm.lawsuitAmount) {
    // 如果有诉讼，使用诉讼金额
    return confirmationForm.lawsuitAmount.toFixed(2);
  } else if (
    confirmationForm.hasObjection &&
    confirmationForm.objectionAmount
  ) {
    // 如果有异议，使用异议金额
    return confirmationForm.objectionAmount.toFixed(2);
  } else {
    // 默认使用当前确认金额
    return Number(confirmationForm.finalConfirmedAmount).toFixed(2);
  }
});

const fetchClaims = async () => {
  console.log('开始获取债权列表，参数:', {
    caseId: Number(props.caseId),
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  });
  loading.value = true;
  try {
    const response = await getClaimRegistrationListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });
    console.log('获取债权列表响应:', response);
    if (response.code === 200 && response.data) {
      // 将驼峰命名转换为下划线命名，以匹配表格组件的prop
      const formattedList = (response.data.list || []).map((item: any) => ({
        ...item,
        creditor_name: item.creditorName,
        creditor_type: item.creditorType,
        credit_code: item.creditCode,
        total_amount: item.totalAmount,
        claim_nature: item.claimNature,
        claim_type: item.claimType,
        registration_status: item.registrationStatus,
        material_completeness: item.materialCompleteness,
        // 处理关联对象的状态
        ...(item.reviewInfo && {
          reviewInfo: {
            ...item.reviewInfo,
            review_status: item.reviewInfo.reviewStatus,
            review_conclusion: item.reviewInfo.reviewConclusion,
          },
        }),
        ...(item.confirmationInfo && {
          confirmationInfo: {
            ...item.confirmationInfo,
            confirmation_status: item.confirmationInfo.confirmationStatus,
          },
        }),
      }));
      claims.value = formattedList;
      total.value = response.data.total || 0;
      console.log(
        '更新债权列表，数量:',
        claims.value.length,
        '总数量:',
        total.value,
      );
    } else {
      ElMessage.error(`获取债权登记表失败：${response.message || '未知错误'}`);
      claims.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权登记表失败:', error);
    ElMessage.error('获取债权登记表失败');
    claims.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
    console.log('获取债权列表完成，loading状态:', loading.value);
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchClaims();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchClaims();
};

const openAddDialog = () => {
  showAddDialog.value = true;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  resetForm();
};

const resetForm = () => {
  claimForm.caseName = '';
  claimForm.debtor = '';
  claimForm.account = '';
  claimForm.creditorName = '';
  claimForm.creditorType = '';
  claimForm.creditCode = '';
  claimForm.legalRepresentative = '';
  claimForm.serviceAddress = '';
  claimForm.agentName = '';
  claimForm.agentPhone = '';
  claimForm.agentIdCard = '';
  claimForm.agentAddress = '';
  claimForm.accountName = '';
  claimForm.bankAccount = '';
  claimForm.bankName = '';
  claimForm.principal = '';
  claimForm.interest = '';
  claimForm.penalty = '';
  claimForm.otherLosses = '';
  claimForm.totalAmount = '';
  claimForm.hasCourtJudgment = false;
  claimForm.hasExecution = false;
  claimForm.hasCollateral = false;
  claimForm.claimNature = '';
  claimForm.claimType = '';
  claimForm.claimFacts = '';
  claimForm.claimIdentifier = '';
  claimForm.evidenceList = '';
  claimForm.evidenceMaterials = '';
  claimForm.evidenceAttachments = [];
  claimForm.registrationDate = '';
  claimForm.registrationDeadline = '';
  claimForm.materialReceiver = '';
  claimForm.materialReceiveDate = '';
  claimForm.materialCompleteness = 'COMPLETE';
  claimForm.remarks = '';
  claimForm.registrationStatus = 'PENDING';
  fileList.value = [];
};

const handleAddClaim = async () => {
  // 验证必填字段
  if (!claimForm.creditorName) {
    ElMessage.warning('请输入债权人姓名或名称');
    return;
  }
  if (!claimForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }
  if (!claimForm.claimType) {
    ElMessage.warning('请选择债权种类');
    return;
  }
  // 总金额由系统自动计算，无需验证claimForm.totalAmount
  const calculatedTotalAmount = Number.parseFloat(totalAmount.value) || 0;
  if (calculatedTotalAmount === 0) {
    ElMessage.warning('申报总金额不能为0，请输入有效的金额信息');
    return;
  }

  addLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      caseName: claimForm.caseName || undefined,
      debtor: claimForm.debtor || undefined,
      creditorName: claimForm.creditorName,
      creditorType: claimForm.creditorType,
      creditCode: claimForm.creditCode || undefined,
      legalRepresentative: claimForm.legalRepresentative || undefined,
      serviceAddress: claimForm.serviceAddress || undefined,
      agentName: claimForm.agentName || undefined,
      agentPhone: claimForm.agentPhone || undefined,
      agentIdCard: claimForm.agentIdCard || undefined,
      agentAddress: claimForm.agentAddress || undefined,
      accountName: claimForm.accountName || undefined,
      creditorBankAccount: claimForm.bankAccount || undefined,
      bankName: claimForm.bankName || undefined,
      principal: Number.parseFloat(claimForm.principal) || 0,
      interest: Number.parseFloat(claimForm.interest) || 0,
      penalty: Number.parseFloat(claimForm.penalty) || 0,
      otherLosses: Number.parseFloat(claimForm.otherLosses) || 0,
      totalAmount: Number.parseFloat(totalAmount.value) || 0,
      hasCourtJudgment: claimForm.hasCourtJudgment ? 1 : 0,
      hasExecution: claimForm.hasExecution ? 1 : 0,
      hasCollateral: claimForm.hasCollateral ? 1 : 0,
      claimNature: claimForm.claimNature || undefined,
      claimType: claimForm.claimType,
      claimFacts: claimForm.claimFacts || undefined,
      claimIdentifier: claimForm.claimIdentifier || undefined,
      evidenceList: claimForm.evidenceList || undefined,
      evidenceMaterials: claimForm.evidenceMaterials || undefined,
      evidenceAttachments:
        claimForm.evidenceAttachments &&
        claimForm.evidenceAttachments.length > 0
          ? claimForm.evidenceAttachments
          : null,
      registrationDate: claimForm.registrationDate || null,
      registrationDeadline: claimForm.registrationDeadline || null,
      materialReceiver: claimForm.materialReceiver || undefined,
      materialReceiveDate: claimForm.materialReceiveDate || null,
      materialCompleteness: claimForm.materialCompleteness,
      remarks: claimForm.remarks || undefined,
    };

    console.log('提交新增债权请求:', requestData);
    const response = await createClaimRegistrationApi(requestData);
    console.log('新增债权响应:', response);
    if (response.code === 200) {
      ElMessage.success('成功添加债权登记');
      await fetchClaims();
      closeAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('添加债权登记失败:', error);
    ElMessage.error('添加债权登记失败');
  } finally {
    addLoading.value = false;
  }
};

const openImportDialog = () => {
  showImportDialog.value = true;
};

const closeImportDialog = () => {
  showImportDialog.value = false;
  fileList.value = [];
};

const handleFileChange = (file: any) => {
  fileList.value = [file];
};

const handleImport = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }

  importLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', fileList.value[0].raw);
    formData.append('caseId', props.caseId);

    const response = await batchImportClaimsApi(formData);
    if (response.status === '1') {
      ElMessage.success(
        `成功导入${response.data?.successCount || 0}条债权记录`,
      );
      await fetchClaims();
      closeImportDialog();
    } else {
      ElMessage.error(`导入失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败');
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  try {
    const response = await exportClaimsApi(props.caseId);
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = `债权登记表_${props.caseId}_${Date.now()}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error: any) {
    ElMessage.error(`导出失败：${error.message || '未知错误'}`);
  }
};

const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待登记' },
    REGISTERED: { type: 'success', text: '已登记' },
    REJECTED: { type: 'danger', text: '已驳回' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const getReviewStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待审查' },
    IN_PROGRESS: { type: 'primary', text: '审查中' },
    COMPLETED: { type: 'success', text: '已完成' },
    SUPPLEMENT: { type: 'danger', text: '待补充' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const getConfirmationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待确认' },
    CONFIRMED: { type: 'success', text: '已确认' },
    OBJECTION: { type: 'danger', text: '有异议' },
    COURT: { type: 'primary', text: '法院裁定' },
    LAWSUIT: { type: 'info', text: '诉讼中' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const openDetailDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      showDetailDialog.value = true;
    } else {
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const openEditDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      // 确保evidenceAttachments始终是数组类型
      const claimData = { ...response.data };
      if (claimData.evidenceAttachments === null) {
        claimData.evidenceAttachments = [];
      }
      Object.assign(claimForm, claimData);
      currentClaim.value = response.data;
      showEditDialog.value = true;
    } else {
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  resetForm();
};

const handleEditClaim = async () => {
  if (!currentClaim.value) return;

  editLoading.value = true;
  try {
    const requestData = {
      creditorName: claimForm.creditorName,
      creditorType: claimForm.creditorType,
      creditCode: claimForm.creditCode || undefined,
      legalRepresentative: claimForm.legalRepresentative || undefined,
      serviceAddress: claimForm.serviceAddress || undefined,
      agentName: claimForm.agentName || undefined,
      agentPhone: claimForm.agentPhone || undefined,
      agentIdCard: claimForm.agentIdCard || undefined,
      agentAddress: claimForm.agentAddress || undefined,
      accountName: claimForm.accountName || undefined,
      creditorBankAccount: claimForm.bankAccount || undefined,
      bankName: claimForm.bankName || undefined,
      principal: Number.parseFloat(claimForm.principal) || 0,
      interest: Number.parseFloat(claimForm.interest) || 0,
      penalty: Number.parseFloat(claimForm.penalty) || 0,
      otherLosses: Number.parseFloat(claimForm.otherLosses) || 0,
      totalAmount: Number.parseFloat(totalAmount.value) || 0,
      hasCourtJudgment: claimForm.hasCourtJudgment ? 1 : 0,
      hasExecution: claimForm.hasExecution ? 1 : 0,
      hasCollateral: claimForm.hasCollateral ? 1 : 0,
      claimNature: claimForm.claimNature || undefined,
      claimType: claimForm.claimType,
      claimFacts: claimForm.claimFacts || undefined,
      claimIdentifier: claimForm.claimIdentifier || undefined,
      evidenceList: claimForm.evidenceList || undefined,
      evidenceMaterials: claimForm.evidenceMaterials || undefined,
      evidenceAttachments:
        claimForm.evidenceAttachments &&
        claimForm.evidenceAttachments.length > 0
          ? claimForm.evidenceAttachments
          : null,
      registrationStatus: claimForm.registrationStatus,
      remarks: claimForm.remarks || undefined,
    };

    const response = await updateClaimRegistrationApi(
      currentClaim.value.id,
      requestData,
    );
    if (response.code === 200) {
      ElMessage.success('修改成功');
      await fetchClaims();
      closeEditDialog();
    } else {
      ElMessage.error(`修改失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('修改债权登记失败:', error);
    ElMessage.error('修改债权登记失败');
  } finally {
    editLoading.value = false;
  }
};

const handleDeleteClaim = async (row: any) => {
  try {
    const response = await deleteClaimRegistrationApi(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      await fetchClaims();
    } else {
      ElMessage.error(`删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除债权登记失败:', error);
    ElMessage.error('删除债权登记失败');
  }
};

const handleReceiveMaterial = async (row: any) => {
  try {
    const response = await receiveClaimMaterialApi(row.id, {
      receiver: '当前用户',
      completeness: 'COMPLETE',
    });
    if (response.code === 200) {
      ElMessage.success('接收材料成功');
      await fetchClaims();
    } else {
      ElMessage.error(`接收材料失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('接收材料失败:', error);
    ElMessage.error('接收材料失败');
  }
};

const handleUpdateStatus = async (
  row: any,
  status: ClaimRegistrationApi.RegistrationStatus,
) => {
  try {
    const response = await updateClaimRegistrationStatusApi(row.id, status);
    if (response.code === 200) {
      ElMessage.success('状态更新成功');
      await fetchClaims();
    } else {
      ElMessage.error(`状态更新失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('状态更新失败:', error);
    ElMessage.error('状态更新失败');
  }
};

const openReviewDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      if (response.data.reviewInfo) {
        Object.assign(reviewForm, response.data.reviewInfo);
      } else {
        reviewForm.declaredPrincipal = response.data.principal || 0;
        reviewForm.declaredInterest = response.data.interest || 0;
        reviewForm.declaredPenalty = response.data.penalty || 0;
        reviewForm.declaredOtherLosses = response.data.otherLosses || 0;
        reviewForm.declaredTotalAmount = response.data.totalAmount || 0;
        reviewForm.confirmedPrincipal = response.data.principal || 0;
        reviewForm.confirmedInterest = response.data.interest || 0;
        reviewForm.confirmedPenalty = response.data.penalty || 0;
        reviewForm.confirmedOtherLosses = response.data.otherLosses || 0;
        reviewForm.confirmedTotalAmount = response.data.totalAmount || 0;
      }
      showReviewDialog.value = true;
    } else {
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeReviewDialog = () => {
  showReviewDialog.value = false;
  resetReviewForm();
};

const resetReviewForm = () => {
  Object.assign(reviewForm, {
    reviewDate: '',
    reviewer: '',
    reviewRound: 1,
    reviewBasis: '',
    declaredPrincipal: 0,
    declaredInterest: 0,
    declaredPenalty: 0,
    declaredOtherLosses: 0,
    declaredTotalAmount: 0,
    confirmedPrincipal: 0,
    confirmedInterest: 0,
    confirmedPenalty: 0,
    confirmedOtherLosses: 0,
    confirmedTotalAmount: 0,
    unconfirmedPrincipal: 0,
    unconfirmedInterest: 0,
    unconfirmedPenalty: 0,
    unconfirmedOtherLosses: 0,
    unconfirmedTotalAmount: 0,
    adjustmentReason: '',
    unconfirmedReason: '',
    insufficientEvidenceReason: '',
    expiredReason: '',
    evidenceAuthenticity: 'AUTHENTIC' as ClaimReviewApi.EvidenceAuthenticity,
    evidenceRelevance: 'RELEVANT' as ClaimReviewApi.EvidenceRelevance,
    evidenceLegality: 'LEGAL' as ClaimReviewApi.EvidenceLegality,
    evidenceReviewNotes: '',
    confirmedClaimNature: '',
    isJointLiability: false,
    isConditional: false,
    isTerm: false,
    collateralType: '',
    collateralProperty: '',
    collateralAmount: 0,
    collateralTerm: '',
    collateralValidity: 'VALID' as ClaimReviewApi.CollateralValidity,
    reviewConclusion: 'CONFIRMED' as ClaimReviewApi.ReviewConclusion,
    reviewSummary: '',
    reviewReport: '',
    reviewAttachments: '',
    reviewStatus: 'COMPLETED' as ClaimReviewApi.ReviewStatus,
    remarks: '',
  });
};

const handleSaveReview = async () => {
  if (!currentClaim.value) return;

  try {
    const requestData: ClaimReviewApi.CreateClaimReviewRequest = {
      claimRegistrationId: currentClaim.value.id,
      caseId: currentClaim.value.caseId,
      creditorName: currentClaim.value.creditorName,
      reviewDate: reviewForm.reviewDate || null,
      reviewer: reviewForm.reviewer || null,
      reviewRound: Number(reviewForm.reviewRound) || 1,
      reviewBasis: reviewForm.reviewBasis || null,
      declaredPrincipal: Number(reviewForm.declaredPrincipal) || 0,
      declaredInterest: Number(reviewForm.declaredInterest) || 0,
      declaredPenalty: Number(reviewForm.declaredPenalty) || 0,
      declaredOtherLosses: Number(reviewForm.declaredOtherLosses) || 0,
      declaredTotalAmount: Number(reviewForm.declaredTotalAmount) || 0,
      confirmedPrincipal: Number(reviewForm.confirmedPrincipal) || 0,
      confirmedInterest: Number(reviewForm.confirmedInterest) || 0,
      confirmedPenalty: Number(reviewForm.confirmedPenalty) || 0,
      confirmedOtherLosses: Number(reviewForm.confirmedOtherLosses) || 0,
      confirmedTotalAmount: Number(reviewForm.confirmedTotalAmount) || 0,
      unconfirmedPrincipal: Number(reviewForm.unconfirmedPrincipal) || 0,
      unconfirmedInterest: Number(reviewForm.unconfirmedInterest) || 0,
      unconfirmedPenalty: Number(reviewForm.unconfirmedPenalty) || 0,
      unconfirmedOtherLosses: Number(reviewForm.unconfirmedOtherLosses) || 0,
      unconfirmedTotalAmount: Number(reviewForm.unconfirmedTotalAmount) || 0,
      adjustmentReason: reviewForm.adjustmentReason || null,
      unconfirmedReason: reviewForm.unconfirmedReason || null,
      insufficientEvidenceReason: reviewForm.insufficientEvidenceReason || null,
      expiredReason: reviewForm.expiredReason || null,
      evidenceAuthenticity: reviewForm.evidenceAuthenticity,
      evidenceRelevance: reviewForm.evidenceRelevance || null,
      evidenceLegality: reviewForm.evidenceLegality || null,
      evidenceReviewNotes: reviewForm.evidenceReviewNotes || null,
      confirmedClaimNature: reviewForm.confirmedClaimNature || null,
      isJointLiability: reviewForm.isJointLiability ? 1 : 0,
      isConditional: reviewForm.isConditional ? 1 : 0,
      isTerm: reviewForm.isTerm ? 1 : 0,
      collateralType: reviewForm.collateralType || null,
      collateralProperty: reviewForm.collateralProperty || null,
      collateralAmount: Number(reviewForm.collateralAmount) || null,
      collateralTerm: reviewForm.collateralTerm || null,
      collateralValidity: reviewForm.collateralValidity,
      reviewConclusion: reviewForm.reviewConclusion,
      reviewSummary: reviewForm.reviewSummary || null,
      reviewReport: reviewForm.reviewReport || null,
      reviewAttachments: reviewForm.reviewAttachments || null,
      reviewStatus: reviewForm.reviewStatus,
      remarks: reviewForm.remarks || null,
    };

    const response = await createClaimReviewApi(requestData);
    if (response.code === 200) {
      ElMessage.success('保存审查记录成功');
      await fetchClaims();
      closeReviewDialog();
    } else {
      ElMessage.error(`保存失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('保存审查记录失败:', error);
    ElMessage.error('保存审查记录失败');
  }
};

const handleSubmitReview = async () => {
  if (!currentClaim.value || !currentClaim.value.reviewInfo) return;

  try {
    const response = await submitClaimReviewApi(
      currentClaim.value.reviewInfo.id,
    );
    if (response.code === 200) {
      ElMessage.success('提交审查成功');
      await fetchClaims();
      closeReviewDialog();
    } else {
      ElMessage.error(`提交失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('提交审查失败:', error);
    ElMessage.error('提交审查失败');
  }
};

const openConfirmationDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      if (response.data.confirmationInfo) {
        Object.assign(confirmationForm, response.data.confirmationInfo);
      }
      showConfirmationDialog.value = true;
    } else {
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeConfirmationDialog = () => {
  showConfirmationDialog.value = false;
  resetConfirmationForm();
};

const resetConfirmationForm = () => {
  Object.assign(confirmationForm, {
    meetingType: 'FIRST' as ClaimConfirmationApi.MeetingType,
    meetingDate: '',
    meetingLocation: '',
    voteResult: 'AGREE' as ClaimConfirmationApi.VoteResult,
    voteNotes: '',
    hasObjection: false,
    objector: '',
    objectionReason: '',
    objectionAmount: 0,
    objectionDate: '',
    negotiationResult: '',
    negotiationDate: '',
    negotiationParticipants: '',
    courtRulingDate: '',
    courtRulingNo: '',
    courtRulingResult: 'CONFIRMED' as ClaimConfirmationApi.CourtRulingResult,
    courtRulingAmount: 0,
    courtRulingNotes: '',
    hasLawsuit: false,
    lawsuitCaseNo: '',
    lawsuitStatus: 'PENDING' as ClaimConfirmationApi.LawsuitStatus,
    lawsuitResult: 'WIN' as ClaimConfirmationApi.LawsuitResult,
    lawsuitAmount: 0,
    lawsuitNotes: '',
    finalConfirmedAmount: 0,
    finalConfirmationDate: '',
    finalConfirmationBasis:
      'MEETING' as ClaimConfirmationApi.FinalConfirmationBasis,
    confirmationAttachments: '',
    confirmationStatus: 'PENDING' as ClaimConfirmationApi.ConfirmationStatus,
    remarks: '',
  });
};

const handleSubmitVote = async () => {
  if (!currentClaim.value) return;

  try {
    const response = await submitVoteApi(currentClaim.value.id, {
      voteResult: confirmationForm.voteResult,
      voteNotes: confirmationForm.voteNotes,
    });
    if (response.code === 200) {
      ElMessage.success('提交表决成功');
      await fetchClaims();
      closeConfirmationDialog();
    } else {
      ElMessage.error(`提交失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('提交表决失败:', error);
    ElMessage.error('提交表决失败');
  }
};

const handleSubmitObjection = async () => {
  if (!currentClaim.value) return;

  try {
    const response = await submitObjectionApi(currentClaim.value.id);
    if (response.code === 200) {
      ElMessage.success('提交异议成功');
      await fetchClaims();
      closeConfirmationDialog();
    } else {
      ElMessage.error(`提交失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('提交异议失败:', error);
    ElMessage.error('提交异议失败');
  }
};

const handleFinalizeConfirmation = async () => {
  if (!currentClaim.value) return;

  try {
    const response = await finalizeClaimConfirmationApi(currentClaim.value.id);
    if (response.code === 200) {
      ElMessage.success('最终确认成功');
      await fetchClaims();
      closeConfirmationDialog();
    } else {
      ElMessage.error(`确认失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('最终确认失败:', error);
    ElMessage.error('最终确认失败');
  }
};

const openStageOneDialog = async (row: any) => {
  console.log(
    '打开债权申报登记对话框，行数据:',
    row.id,
    '当前状态:',
    row.registration_status,
  );
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;

      try {
        const userResponse = await getCurrentUserApi();
        if (userResponse.code === 200 && userResponse.data) {
          claimForm.materialReceiver = userResponse.data.realName || '当前用户';
          console.log(
            '获取当前用户信息成功，接收人:',
            claimForm.materialReceiver,
          );
        } else {
          claimForm.materialReceiver = '当前用户';
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
        claimForm.materialReceiver = '当前用户';
      }

      showStageOneDialog.value = true;
      console.log(
        '成功打开债权申报登记对话框，currentClaim:',
        currentClaim.value.id,
      );
    } else {
      ElMessage.error('获取债权详情失败');
      console.error('获取债权详情失败:', response.message);
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeStageOneDialog = () => {
  showStageOneDialog.value = false;
  currentClaim.value = null;
};

const handleStageOneSubmit = async () => {
  console.log('开始债权申报登记提交，currentClaim:', currentClaim.value?.id);
  if (!currentClaim.value) {
    console.error('currentClaim为空，无法提交');
    return;
  }

  if (!claimForm.materialReceiver) {
    ElMessage.warning('请输入接收人');
    return;
  }

  stageOneLoading.value = true;
  console.log('设置stageOneLoading:', stageOneLoading.value);
  try {
    const requestData = {
      receiver: claimForm.materialReceiver,
      completeness: 'COMPLETE' as ClaimRegistrationApi.MaterialCompleteness,
    };
    console.log('提交债权申报登记请求数据:', requestData);

    const response = await receiveClaimMaterialApi(
      currentClaim.value.id,
      requestData,
    );
    console.log('接收债权材料响应:', response);
    if (response.code === 200) {
      console.log('接收债权材料成功，开始更新登记状态');
      const statusResponse = await updateClaimRegistrationStatusApi(
        currentClaim.value.id,
        'REGISTERED',
      );
      console.log('更新登记状态响应:', statusResponse);
      if (statusResponse.code === 200) {
        ElMessage.success('债权申报登记成功');
        console.log('债权申报登记成功，开始刷新列表');
        await fetchClaims();
        closeStageOneDialog();
        console.log('关闭债权申报登记对话框');
      } else {
        ElMessage.error(
          `状态更新失败：${statusResponse.message || '未知错误'}`,
        );
        console.error('状态更新失败:', statusResponse.message);
      }
    } else {
      ElMessage.error(`操作失败：${response.message || '未知错误'}`);
      console.error('操作失败:', response.message);
    }
  } catch (error) {
    console.error('债权申报登记失败:', error);
    ElMessage.error('债权申报登记失败');
  } finally {
    stageOneLoading.value = false;
    console.log('设置stageOneLoading:', stageOneLoading.value);
  }
};

const openStageTwoDialog = async (row: any) => {
  console.log(
    '打开债权审查对话框，行数据:',
    row.id,
    '当前状态:',
    row.registration_status,
    '审查状态:',
    row.reviewInfo?.reviewStatus,
  );
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      if (response.data.reviewInfo) {
        Object.assign(reviewForm, response.data.reviewInfo);
        console.log('使用现有审查信息填充表单');
      } else {
        reviewForm.declaredPrincipal = response.data.principal || 0;
        reviewForm.declaredInterest = response.data.interest || 0;
        reviewForm.declaredPenalty = response.data.penalty || 0;
        reviewForm.declaredOtherLosses = response.data.otherLosses || 0;
        reviewForm.declaredTotalAmount = response.data.totalAmount || 0;
        reviewForm.confirmedPrincipal = response.data.principal || 0;
        reviewForm.confirmedInterest = response.data.interest || 0;
        reviewForm.confirmedPenalty = response.data.penalty || 0;
        reviewForm.confirmedOtherLosses = response.data.otherLosses || 0;
        reviewForm.confirmedTotalAmount = response.data.totalAmount || 0;
        console.log('使用申报信息初始化审查表单');
      }
      showStageTwoDialog.value = true;
      console.log(
        '成功打开债权审查对话框，currentClaim:',
        currentClaim.value.id,
      );
    } else {
      ElMessage.error('获取债权详情失败');
      console.error('获取债权详情失败:', response.message);
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeStageTwoDialog = () => {
  showStageTwoDialog.value = false;
  resetReviewForm();
  currentClaim.value = null;
};

const handleStageTwoSubmit = async () => {
  console.log('开始债权审查提交，currentClaim:', currentClaim.value?.id);
  if (!currentClaim.value) {
    console.error('currentClaim为空，无法提交');
    return;
  }

  if (!reviewForm.reviewConclusion) {
    ElMessage.warning('请选择审查结论');
    console.warn('未选择审查结论');
    return;
  }

  stageTwoLoading.value = true;
  console.log('设置stageTwoLoading:', stageTwoLoading.value);
  try {
    const requestData: ClaimReviewApi.CreateClaimReviewRequest = {
      claimRegistrationId: currentClaim.value.id,
      caseId: currentClaim.value.caseId,
      creditorName: currentClaim.value.creditorName,
      reviewDate: reviewForm.reviewDate || null,
      reviewer: reviewForm.reviewer || null,
      reviewRound: Number(reviewForm.reviewRound) || 1,
      reviewBasis: reviewForm.reviewBasis || null,
      declaredPrincipal: Number(reviewForm.declaredPrincipal) || 0,
      declaredInterest: Number(reviewForm.declaredInterest) || 0,
      declaredPenalty: Number(reviewForm.declaredPenalty) || 0,
      declaredOtherLosses: Number(reviewForm.declaredOtherLosses) || 0,
      declaredTotalAmount: Number(reviewForm.declaredTotalAmount) || 0,
      confirmedPrincipal: Number(reviewForm.confirmedPrincipal) || 0,
      confirmedInterest: Number(reviewForm.confirmedInterest) || 0,
      confirmedPenalty: Number(reviewForm.confirmedPenalty) || 0,
      confirmedOtherLosses: Number(reviewForm.confirmedOtherLosses) || 0,
      confirmedTotalAmount: Number(reviewForm.confirmedTotalAmount) || 0,
      unconfirmedPrincipal: Number(reviewForm.unconfirmedPrincipal) || 0,
      unconfirmedInterest: Number(reviewForm.unconfirmedInterest) || 0,
      unconfirmedPenalty: Number(reviewForm.unconfirmedPenalty) || 0,
      unconfirmedOtherLosses: Number(reviewForm.unconfirmedOtherLosses) || 0,
      unconfirmedTotalAmount: Number(reviewForm.unconfirmedTotalAmount) || 0,
      adjustmentReason: reviewForm.adjustmentReason || null,
      unconfirmedReason: reviewForm.unconfirmedReason || null,
      insufficientEvidenceReason: reviewForm.insufficientEvidenceReason || null,
      expiredReason: reviewForm.expiredReason || null,
      evidenceAuthenticity: reviewForm.evidenceAuthenticity,
      evidenceRelevance: reviewForm.evidenceRelevance || null,
      evidenceLegality: reviewForm.evidenceLegality || null,
      evidenceReviewNotes: reviewForm.evidenceReviewNotes || null,
      confirmedClaimNature: reviewForm.confirmedClaimNature || null,
      isJointLiability: reviewForm.isJointLiability ? 1 : 0,
      isConditional: reviewForm.isConditional ? 1 : 0,
      isTerm: reviewForm.isTerm ? 1 : 0,
      collateralType: reviewForm.collateralType || null,
      collateralProperty: reviewForm.collateralProperty || null,
      collateralAmount: Number(reviewForm.collateralAmount) || null,
      collateralTerm: reviewForm.collateralTerm || null,
      collateralValidity: reviewForm.collateralValidity,
      reviewConclusion: reviewForm.reviewConclusion,
      reviewSummary: reviewForm.reviewSummary || null,
      reviewReport: reviewForm.reviewReport || null,
      reviewAttachments: reviewForm.reviewAttachments || null,
      reviewStatus: 'COMPLETED' as ClaimReviewApi.ReviewStatus,
      remarks: reviewForm.remarks || null,
    };
    console.log('提交债权审查请求数据:', requestData);

    const response = await createClaimReviewApi(requestData);
    console.log('保存债权审查响应:', response);
    if (response.code === 200) {
      const reviewId = response.data?.reviewId;
      console.log('保存审查成功，reviewId:', reviewId);
      if (reviewId) {
        console.log('开始提交审查结果，reviewId:', reviewId);
        const submitResponse = await submitClaimReviewApi(reviewId);
        console.log('提交审查响应:', submitResponse);
        if (submitResponse.code === 200) {
          ElMessage.success('债权审查提交成功');
          console.log('债权审查提交成功，开始刷新列表');
          await fetchClaims();
          closeStageTwoDialog();
          console.log('关闭债权审查对话框');
        } else {
          ElMessage.error(
            `提交审查失败：${submitResponse.message || '未知错误'}`,
          );
          console.error('提交审查失败:', submitResponse.message);
        }
      } else {
        ElMessage.success('债权审查保存成功');
        console.log('债权审查保存成功，开始刷新列表');
        await fetchClaims();
        closeStageTwoDialog();
        console.log('关闭债权审查对话框');
      }
    } else {
      ElMessage.error(`保存失败：${response.message || '未知错误'}`);
      console.error('保存失败:', response.message);
    }
  } catch (error) {
    console.error('债权审查失败:', error);
    ElMessage.error('债权审查失败');
  } finally {
    stageTwoLoading.value = false;
    console.log('设置stageTwoLoading:', stageTwoLoading.value);
  }
};

const openStageThreeDialog = async (row: any) => {
  console.log(
    '打开债权确认对话框，行数据:',
    row.id,
    '审查状态:',
    row.reviewInfo?.reviewStatus,
    '确认状态:',
    row.confirmationInfo?.confirmationStatus,
  );
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      if (response.data.confirmationInfo) {
        Object.assign(confirmationForm, response.data.confirmationInfo);
        console.log('使用现有确认信息填充表单');
      }
      showStageThreeDialog.value = true;
      console.log(
        '成功打开债权确认对话框，currentClaim:',
        currentClaim.value.id,
      );
    } else {
      ElMessage.error('获取债权详情失败');
      console.error('获取债权详情失败:', response.message);
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeStageThreeDialog = () => {
  showStageThreeDialog.value = false;
  resetConfirmationForm();
  currentClaim.value = null;
};

const handleStageThreeSubmit = async () => {
  console.log('开始债权确认提交，currentClaim:', currentClaim.value?.id);
  if (!currentClaim.value) {
    console.error('currentClaim为空，无法提交');
    return;
  }

  if (!confirmationForm.voteResult) {
    ElMessage.warning('请选择表决结果');
    console.warn('未选择表决结果');
    return;
  }

  stageThreeLoading.value = true;
  console.log('设置stageThreeLoading:', stageThreeLoading.value);
  try {
    const response = await submitVoteApi(currentClaim.value.id, {
      voteResult: confirmationForm.voteResult,
      voteNotes: confirmationForm.voteNotes,
    });
    console.log('提交表决响应:', response);
    if (response.code === 200) {
      console.log('提交表决成功，hasObjection:', confirmationForm.hasObjection);
      if (confirmationForm.hasObjection) {
        console.log('开始提交异议');
        const objectionResponse = await submitObjectionApi(
          currentClaim.value.id,
        );
        console.log('提交异议响应:', objectionResponse);
        if (objectionResponse.code === 200) {
          ElMessage.success('债权确认与异议提交成功');
          console.log('债权确认与异议提交成功，开始刷新列表');
          await fetchClaims();
          closeStageThreeDialog();
          console.log('关闭债权确认对话框');
        } else {
          ElMessage.error(
            `提交异议失败：${objectionResponse.message || '未知错误'}`,
          );
          console.error('提交异议失败:', objectionResponse.message);
        }
      } else {
        console.log('开始最终确认债权');
        const finalizeResponse = await finalizeClaimConfirmationApi(
          currentClaim.value.id,
        );
        console.log('最终确认响应:', finalizeResponse);
        if (finalizeResponse.code === 200) {
          ElMessage.success('债权最终确认成功');
          console.log('债权最终确认成功，开始刷新列表');
          await fetchClaims();
          closeStageThreeDialog();
          console.log('关闭债权确认对话框');
        } else {
          ElMessage.error(
            `最终确认失败：${finalizeResponse.message || '未知错误'}`,
          );
          console.error('最终确认失败:', finalizeResponse.message);
        }
      }
    } else {
      ElMessage.error(`提交表决失败：${response.message || '未知错误'}`);
      console.error('提交表决失败:', response.message);
    }
  } catch (error) {
    console.error('债权确认失败:', error);
    ElMessage.error('债权确认失败');
  } finally {
    stageThreeLoading.value = false;
    console.log('设置stageThreeLoading:', stageThreeLoading.value);
  }
};

const getClaimStageStatus = (row: any) => {
  const registrationStatus = row.registration_status;
  const reviewStatus = row.reviewInfo?.reviewStatus;
  const confirmationStatus = row.confirmationInfo?.confirmationStatus;

  if (registrationStatus === 'PENDING') {
    return { stage: 1, label: '待登记', type: 'warning' };
  } else if (
    registrationStatus === 'REGISTERED' &&
    (!reviewStatus || reviewStatus === 'PENDING')
  ) {
    return { stage: 2, label: '待审查', type: 'primary' };
  } else if (
    reviewStatus === 'COMPLETED' &&
    (!confirmationStatus || confirmationStatus === 'PENDING')
  ) {
    return { stage: 3, label: '待确认', type: 'info' };
  } else if (confirmationStatus === 'CONFIRMED') {
    return { stage: 4, label: '已完成', type: 'success' };
  } else if (registrationStatus === 'REJECTED') {
    return { stage: 0, label: '已驳回', type: 'danger' };
  }
  return { stage: 0, label: '未知', type: 'info' };
};

onMounted(() => {
  console.log('ClaimRegistration组件已挂载，props.caseId:', props.caseId);
  fetchClaims();
});
</script>

<template>
  <div class="claim-registration-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-text" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权登记表</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="primary" @click="openAddDialog">
              <Icon icon="lucide:plus" class="mr-1" />
              新增
            </ElButton>
            <ElButton type="success" @click="openImportDialog">
              <Icon icon="lucide:upload" class="mr-1" />
              批量导入
            </ElButton>
            <ElButton type="info" @click="handleExport">
              <Icon icon="lucide:download" class="mr-1" />
              一键导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 调试信息区域 -->
      <ElAlert
        v-if="isDevelopment"
        title="调试信息"
        type="info"
        :closable="false"
        class="mb-4"
      >
        <div class="debug-info">
          <div>案件ID: {{ caseId }}</div>
          <div>当前页面: {{ currentPage }}</div>
          <div>每页条数: {{ pageSize }}</div>
          <div>债权总数: {{ total }}</div>
          <div>当前债权列表数量: {{ claims.length }}</div>
          <div>组件状态: 已挂载</div>
          <div class="mt-2 text-sm text-gray-500">
            <strong>调试说明:</strong> 请打开浏览器控制台查看详细日志
          </div>
        </div>
      </ElAlert>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">
          <ElTableColumn
            prop="creditor_name"
            label="债权人姓名或名称"
            min-width="180"
          />
          <ElTableColumn prop="creditor_type" label="债权人类型" width="120" />
          <ElTableColumn
            prop="credit_code"
            label="统一社会信用代码"
            width="180"
          />
          <ElTableColumn prop="principal" label="申报本金" width="120" />
          <ElTableColumn prop="interest" label="申报利息" width="120" />
          <ElTableColumn prop="total_amount" label="申报总金额" width="120" />
          <ElTableColumn prop="claim_nature" label="债权性质" width="120" />
          <ElTableColumn prop="claim_type" label="债权种类" width="120" />
          <ElTableColumn
            prop="registration_status"
            label="登记状态"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="
                  getRegistrationStatusTag(scope.row.registration_status).type
                "
                size="small"
              >
                {{
                  getRegistrationStatusTag(scope.row.registration_status).text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="claims.some((c) => c.reviewInfo)"
            label="审查状态"
            width="100"
          >
            <template #default="scope">
              <ElTag
                v-if="scope.row.reviewInfo"
                :type="
                  getReviewStatusTag(scope.row.reviewInfo.reviewStatus).type
                "
                size="small"
              >
                {{ getReviewStatusTag(scope.row.reviewInfo.reviewStatus).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="claims.some((c) => c.confirmationInfo)"
            label="确认状态"
            width="100"
          >
            <template #default="scope">
              <ElTag
                v-if="scope.row.confirmationInfo"
                :type="
                  getConfirmationStatusTag(
                    scope.row.confirmationInfo.confirmationStatus,
                  ).type
                "
                size="small"
              >
                {{
                  getConfirmationStatusTag(
                    scope.row.confirmationInfo.confirmationStatus,
                  ).text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="450" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                详情
              </ElButton>
              <ElButton link size="small" @click="openEditDialog(scope.row)">
                编辑
              </ElButton>

              <ElButton
                v-if="scope.row.registration_status === 'PENDING'"
                link
                size="small"
                @click="openStageOneDialog(scope.row)"
              >
                债权申报登记
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'REGISTERED' &&
                  (!scope.row.reviewInfo ||
                    scope.row.reviewInfo.reviewStatus === 'PENDING')
                "
                link
                size="small"
                @click="openStageTwoDialog(scope.row)"
              >
                债权审查
              </ElButton>
              <ElButton
                v-if="
                  scope.row.reviewInfo &&
                  scope.row.reviewInfo.reviewStatus === 'COMPLETED' &&
                  (!scope.row.confirmationInfo ||
                    scope.row.confirmationInfo.confirmationStatus === 'PENDING')
                "
                link
                size="small"
                @click="openStageThreeDialog(scope.row)"
              >
                债权确认
              </ElButton>

              <ElPopconfirm
                title="确定要删除这条债权登记吗？"
                @confirm="handleDeleteClaim(scope.row)"
              >
                <template #reference>
                  <ElButton link size="small"> 删除 </ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="total > 0" class="pagination-container flex justify-end">
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

        <div v-if="claims.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债权登记信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showAddDialog"
      title="新增债权登记"
      width="90%"
      destroy-on-close
    >
      <div class="add-dialog-container">
        <ElForm label-width="180px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件名称">
                <ElInput
                  v-model="claimForm.caseName"
                  placeholder="请输入案件名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  style="width: 100%"
                >
                  <ElOption label="债务人1" value="debtor1" />
                  <ElOption label="债务人2" value="debtor2" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账号">
                <ElInput v-model="claimForm.account" placeholder="请输入账号" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称">
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人类型">
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="金融机构" value="金融机构" />
                  <ElOption label="企业" value="企业" />
                  <ElOption label="个人" value="个人" />
                  <ElOption label="其他" value="其他" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号码">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人联系地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人联系地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报本金">
                <ElInput
                  v-model="claimForm.principal"
                  placeholder="请输入申报本金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报利息">
                <ElInput
                  v-model="claimForm.interest"
                  placeholder="请输入申报利息"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  placeholder="请输入申报违约金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  placeholder="请输入申报其他损失"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额" :required="false">
                <ElInput
                  v-model="totalAmount"
                  placeholder="自动计算"
                  disabled
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权其他信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="是否有法院判决或仲裁裁决">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否已申请执行">
                <ElCheckbox v-model="claimForm.hasExecution">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否有抵押物或质押物">
                <ElCheckbox v-model="claimForm.hasCollateral">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">申报时间信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报日期">
                <ElInput
                  v-model="claimForm.registrationDate"
                  type="datetime-local"
                  placeholder="请选择申报日期"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报截止日期">
                <ElInput
                  v-model="claimForm.registrationDeadline"
                  type="datetime-local"
                  placeholder="请选择申报截止日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">材料接收信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="材料接收人">
                <ElInput
                  v-model="claimForm.materialReceiver"
                  placeholder="请输入材料接收人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="材料接收日期">
                <ElInput
                  v-model="claimForm.materialReceiveDate"
                  type="datetime-local"
                  placeholder="请选择材料接收日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="材料完整性">
                <ElSelect
                  v-model="claimForm.materialCompleteness"
                  placeholder="请选择材料完整性"
                  style="width: 100%"
                >
                  <ElOption label="完整" value="COMPLETE" />
                  <ElOption label="不完整" value="INCOMPLETE" />
                  <ElOption label="待补充" value="PENDING" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElSelect
                  v-model="claimForm.claimNature"
                  placeholder="请选择债权性质"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="有财产担保债权" value="有财产担保债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类">
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="借款债权" value="借款债权" />
                  <ElOption label="货款债权" value="货款债权" />
                  <ElOption label="工程款债权" value="工程款债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权事实与理由描述">
            <ElInput
              v-model="claimForm.claimFacts"
              type="textarea"
              :rows="3"
              placeholder="请输入债权事实与理由描述"
            />
          </ElFormItem>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElInput
                  v-model="claimForm.claimIdentifier"
                  placeholder="请输入债权标识"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权申报证据清单">
            <ElInput
              v-model="claimForm.evidenceList"
              type="textarea"
              :rows="2"
              placeholder="请输入债权申报证据清单"
            />
          </ElFormItem>

          <ElFormItem label="证据材料">
            <ElInput
              v-model="claimForm.evidenceMaterials"
              type="textarea"
              :rows="2"
              placeholder="请输入证据材料"
            />
          </ElFormItem>

          <ElFormItem label="证据材料附件">
            <ElUpload
              v-model:file-list="claimForm.evidenceAttachments"
              :auto-upload="false"
              :limit="5"
              multiple
            >
              <ElButton type="primary" size="small">
                <Icon icon="lucide:upload" class="mr-1" />
                点击上传
              </ElButton>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传文档、图片等文件，单个文件不超过50MB
                </div>
              </template>
            </ElUpload>
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="claimForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleAddClaim"
            :loading="addLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showImportDialog"
      title="批量导入债权登记"
      width="600px"
      destroy-on-close
    >
      <div class="import-dialog-container">
        <div class="import-description mb-4">
          <p class="mb-2 text-sm text-gray-600">
            请上传Excel文件，支持批量导入债权登记信息。
          </p>
          <ElButton type="primary" link size="small">
            <Icon icon="lucide:download" class="mr-1" />
            下载导入模板
          </ElButton>
        </div>

        <ElUpload
          v-model:file-list="fileList"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls"
          drag
        >
          <Icon icon="lucide:upload-cloud" class="upload-icon" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传 .xlsx 或 .xls 文件</div>
          </template>
        </ElUpload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeImportDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleImport"
            :loading="importLoading"
          >
            导入
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showDetailDialog"
      title="债权登记详情"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="detail-dialog-container">
        <ElTabs v-model="activeTab">
          <ElTabPane label="基本信息" name="basic">
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem label="债权编号">
                {{ currentClaim.claimNo }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="案件名称">
                {{ currentClaim.caseName }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="债权人">
                {{ currentClaim.creditorName }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="债权人类型">
                {{ currentClaim.creditorType }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="统一社会信用代码">
                {{ currentClaim.creditCode }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="法定代表人">
                {{ currentClaim.legalRepresentative }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="申报本金">
                {{ currentClaim.principal }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="申报利息">
                {{ currentClaim.interest }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="申报罚金">
                {{ currentClaim.penalty }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="申报其他损失">
                {{ currentClaim.otherLosses }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="申报总金额">
                {{ currentClaim.totalAmount }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="登记状态">
                <ElTag
                  :type="
                    getRegistrationStatusTag(currentClaim.registrationStatus)
                      .type
                  "
                >
                  {{
                    getRegistrationStatusTag(currentClaim.registrationStatus)
                      .text
                  }}
                </ElTag>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElTabPane>
          <ElTabPane label="审查信息" name="review">
            <div v-if="currentClaim.reviewInfo">
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="审查日期">
                  {{ currentClaim.reviewInfo.reviewDate }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查人">
                  {{ currentClaim.reviewInfo.reviewer }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查轮次">
                  {{ currentClaim.reviewInfo.reviewRound }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查依据">
                  {{ currentClaim.reviewInfo.reviewBasis }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查结论">
                  <ElTag>{{ currentClaim.reviewInfo.reviewConclusion }}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查状态">
                  <ElTag
                    :type="
                      getReviewStatusTag(currentClaim.reviewInfo.reviewStatus)
                        .type
                    "
                  >
                    {{
                      getReviewStatusTag(currentClaim.reviewInfo.reviewStatus)
                        .text
                    }}
                  </ElTag>
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">申报金额</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="申报本金">
                  {{ currentClaim.reviewInfo.declaredPrincipal || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="申报利息">
                  {{ currentClaim.reviewInfo.declaredInterest || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="申报罚金">
                  {{ currentClaim.reviewInfo.declaredPenalty || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="申报其他损失">
                  {{ currentClaim.reviewInfo.declaredOtherLosses || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="申报总金额">
                  {{ currentClaim.reviewInfo.declaredTotalAmount }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">确认金额</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="确认本金">
                  {{ currentClaim.reviewInfo.confirmedPrincipal || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认利息">
                  {{ currentClaim.reviewInfo.confirmedInterest || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认罚金">
                  {{ currentClaim.reviewInfo.confirmedPenalty || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认其他损失">
                  {{ currentClaim.reviewInfo.confirmedOtherLosses || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认总金额">
                  {{ currentClaim.reviewInfo.confirmedTotalAmount }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">不予确认金额</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="不予确认本金">
                  {{ currentClaim.reviewInfo.unconfirmedPrincipal || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="不予确认利息">
                  {{ currentClaim.reviewInfo.unconfirmedInterest || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="不予确认罚金">
                  {{ currentClaim.reviewInfo.unconfirmedPenalty || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="不予确认其他损失">
                  {{ currentClaim.reviewInfo.unconfirmedOtherLosses || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="不予确认总金额">
                  {{ currentClaim.reviewInfo.unconfirmedTotalAmount }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">审查说明</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="金额调整理由" :span="2">
                  {{ currentClaim.reviewInfo.adjustmentReason || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="不予确认理由" :span="2">
                  {{ currentClaim.reviewInfo.unconfirmedReason || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="证据不足理由" :span="2">
                  {{
                    currentClaim.reviewInfo.insufficientEvidenceReason || '-'
                  }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="超过诉讼时效理由" :span="2">
                  {{ currentClaim.reviewInfo.expiredReason || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">证据审查</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="证据真实性">
                  <ElTag>
                    {{ currentClaim.reviewInfo.evidenceAuthenticity }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="证据关联性">
                  <ElTag>{{ currentClaim.reviewInfo.evidenceRelevance }}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="证据合法性">
                  <ElTag>{{ currentClaim.reviewInfo.evidenceLegality }}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认债权性质">
                  {{ currentClaim.reviewInfo.confirmedClaimNature || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="是否连带责任" :span="2">
                  <ElTag
                    :type="
                      currentClaim.reviewInfo.isJointLiability
                        ? 'success'
                        : 'info'
                    "
                  >
                    {{ currentClaim.reviewInfo.isJointLiability ? '是' : '否' }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="是否附条件" :span="2">
                  <ElTag
                    :type="
                      currentClaim.reviewInfo.isConditional ? 'success' : 'info'
                    "
                  >
                    {{ currentClaim.reviewInfo.isConditional ? '是' : '否' }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="是否附期限" :span="2">
                  <ElTag
                    :type="currentClaim.reviewInfo.isTerm ? 'success' : 'info'"
                  >
                    {{ currentClaim.reviewInfo.isTerm ? '是' : '否' }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="证据审查说明" :span="2">
                  {{ currentClaim.reviewInfo.evidenceReviewNotes || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">担保信息</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="担保类型">
                  {{ currentClaim.reviewInfo.collateralType || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="担保财产">
                  {{ currentClaim.reviewInfo.collateralProperty || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="担保金额">
                  {{ currentClaim.reviewInfo.collateralAmount || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="担保期限">
                  {{ currentClaim.reviewInfo.collateralTerm || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="担保有效性">
                  <ElTag>
                    {{ currentClaim.reviewInfo.collateralValidity }}
                  </ElTag>
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">审查总结</h4>
              </div>
              <ElDescriptions :column="1" border>
                <ElDescriptionsItem label="审查总结">
                  {{ currentClaim.reviewInfo.reviewSummary || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="审查报告">
                  {{ currentClaim.reviewInfo.reviewReport || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="备注">
                  {{ currentClaim.reviewInfo.remarks || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>
            </div>
            <ElEmpty v-else description="暂无审查信息" />
          </ElTabPane>
          <ElTabPane label="确认信息" name="confirmation">
            <div v-if="currentClaim.confirmationInfo">
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="会议类型">
                  {{ currentClaim.confirmationInfo.meetingType }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="会议日期">
                  {{ currentClaim.confirmationInfo.meetingDate }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="会议地点">
                  {{ currentClaim.confirmationInfo.meetingLocation }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="表决结果">
                  <ElTag>{{ currentClaim.confirmationInfo.voteResult }}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="表决说明">
                  {{ currentClaim.confirmationInfo.voteNotes || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="是否有异议">
                  <ElTag
                    :type="
                      currentClaim.confirmationInfo.hasObjection
                        ? 'danger'
                        : 'success'
                    "
                  >
                    {{
                      currentClaim.confirmationInfo.hasObjection ? '是' : '否'
                    }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="确认状态">
                  <ElTag
                    :type="
                      getConfirmationStatusTag(
                        currentClaim.confirmationInfo.confirmationStatus,
                      ).type
                    "
                  >
                    {{
                      getConfirmationStatusTag(
                        currentClaim.confirmationInfo.confirmationStatus,
                      ).text
                    }}
                  </ElTag>
                </ElDescriptionsItem>
              </ElDescriptions>

              <div
                v-if="currentClaim.confirmationInfo.hasObjection"
                class="section-divider mb-4 mt-4"
              >
                <h4 class="section-title">异议信息</h4>
              </div>
              <ElDescriptions
                v-if="currentClaim.confirmationInfo.hasObjection"
                :column="2"
                border
              >
                <ElDescriptionsItem label="异议人">
                  {{ currentClaim.confirmationInfo.objector || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="异议金额">
                  {{ currentClaim.confirmationInfo.objectionAmount || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="异议日期">
                  {{ currentClaim.confirmationInfo.objectionDate || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="异议理由" :span="2">
                  {{ currentClaim.confirmationInfo.objectionReason || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div
                v-if="currentClaim.confirmationInfo.hasObjection"
                class="section-divider mb-4 mt-4"
              >
                <h4 class="section-title">协商信息</h4>
              </div>
              <ElDescriptions
                v-if="currentClaim.confirmationInfo.hasObjection"
                :column="2"
                border
              >
                <ElDescriptionsItem label="协商结果">
                  {{ currentClaim.confirmationInfo.negotiationResult || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="协商日期">
                  {{ currentClaim.confirmationInfo.negotiationDate || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="协商参与人" :span="2">
                  {{
                    currentClaim.confirmationInfo.negotiationParticipants || '-'
                  }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div
                v-if="currentClaim.confirmationInfo.hasObjection"
                class="section-divider mb-4 mt-4"
              >
                <h4 class="section-title">法院裁定信息</h4>
              </div>
              <ElDescriptions
                v-if="currentClaim.confirmationInfo.hasObjection"
                :column="2"
                border
              >
                <ElDescriptionsItem label="法院裁定文号">
                  {{ currentClaim.confirmationInfo.courtRulingNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="法院裁定结果">
                  <ElTag>
                    {{ currentClaim.confirmationInfo.courtRulingResult }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="法院裁定金额">
                  {{ currentClaim.confirmationInfo.courtRulingAmount || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="法院裁定日期">
                  {{ currentClaim.confirmationInfo.courtRulingDate || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="法院裁定说明" :span="2">
                  {{ currentClaim.confirmationInfo.courtRulingNotes || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div
                v-if="currentClaim.confirmationInfo.hasLawsuit"
                class="section-divider mb-4 mt-4"
              >
                <h4 class="section-title">诉讼信息</h4>
              </div>
              <ElDescriptions
                v-if="currentClaim.confirmationInfo.hasLawsuit"
                :column="2"
                border
              >
                <ElDescriptionsItem label="诉讼案号">
                  {{ currentClaim.confirmationInfo.lawsuitCaseNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="诉讼状态">
                  <ElTag>
                    {{ currentClaim.confirmationInfo.lawsuitStatus }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="诉讼结果">
                  <ElTag>
                    {{ currentClaim.confirmationInfo.lawsuitResult }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="诉讼金额">
                  {{ currentClaim.confirmationInfo.lawsuitAmount || 0 }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="诉讼说明" :span="2">
                  {{ currentClaim.confirmationInfo.lawsuitNotes || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>

              <div class="section-divider mb-4 mt-4">
                <h4 class="section-title">最终确认信息</h4>
              </div>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="最终确认金额">
                  {{ currentClaim.confirmationInfo.finalConfirmedAmount }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="最终确认日期">
                  {{ currentClaim.confirmationInfo.finalConfirmationDate }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="最终确认依据">
                  <ElTag>
                    {{ currentClaim.confirmationInfo.finalConfirmationBasis }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="最终确认依据说明" :span="2">
                  {{
                    currentClaim.confirmationInfo.finalConfirmationBasis || '-'
                  }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="备注" :span="2">
                  {{ currentClaim.confirmationInfo.remarks || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>
            </div>
            <ElEmpty v-else description="暂无确认信息" />
          </ElTabPane>
        </ElTabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showDetailDialog = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showEditDialog"
      title="编辑债权登记"
      width="90%"
      destroy-on-close
    >
      <div class="add-dialog-container">
        <ElForm label-width="180px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件名称">
                <ElInput
                  v-model="claimForm.caseName"
                  placeholder="请输入案件名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  style="width: 100%"
                >
                  <ElOption label="债务人1" value="debtor1" />
                  <ElOption label="债务人2" value="debtor2" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账号">
                <ElInput v-model="claimForm.account" placeholder="请输入账号" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称">
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人类型">
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="金融机构" value="金融机构" />
                  <ElOption label="企业" value="企业" />
                  <ElOption label="个人" value="个人" />
                  <ElOption label="其他" value="其他" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号码">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人联系地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人联系地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报本金">
                <ElInput
                  v-model="claimForm.principal"
                  placeholder="请输入申报本金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报利息">
                <ElInput
                  v-model="claimForm.interest"
                  placeholder="请输入申报利息"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  placeholder="请输入申报违约金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  placeholder="请输入申报其他损失"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  v-model="totalAmount"
                  placeholder="自动计算"
                  disabled
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权其他信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="是否有法院判决或仲裁裁决">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否已申请执行">
                <ElCheckbox v-model="claimForm.hasExecution">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否有抵押物或质押物">
                <ElCheckbox v-model="claimForm.hasCollateral">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElSelect
                  v-model="claimForm.claimNature"
                  placeholder="请选择债权性质"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="有财产担保债权" value="有财产担保债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类">
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="借款债权" value="借款债权" />
                  <ElOption label="货款债权" value="货款债权" />
                  <ElOption label="工程款债权" value="工程款债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权事实与理由描述">
            <ElInput
              v-model="claimForm.claimFacts"
              type="textarea"
              :rows="3"
              placeholder="请输入债权事实与理由描述"
            />
          </ElFormItem>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人类别">
                <ElInput
                  v-model="claimForm.creditorCategory"
                  placeholder="请输入债权人类别"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权性质(管理人自填)">
                <ElInput
                  v-model="claimForm.claimNatureManager"
                  placeholder="请输入债权性质"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElSelect
                  v-model="claimForm.claimIdentifier"
                  placeholder="请选择债权标识"
                  style="width: 100%"
                >
                  <ElOption label="已确认" value="已确认" />
                  <ElOption label="待确认" value="待确认" />
                  <ElOption label="有异议" value="有异议" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="登记状态">
                <ElSelect
                  v-model="claimForm.registrationStatus"
                  placeholder="请选择登记状态"
                  style="width: 100%"
                >
                  <ElOption label="待登记" value="PENDING" />
                  <ElOption label="已登记" value="REGISTERED" />
                  <ElOption label="已驳回" value="REJECTED" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权申报证据清单">
            <ElInput
              v-model="claimForm.evidenceList"
              type="textarea"
              :rows="2"
              placeholder="请输入债权申报证据清单"
            />
          </ElFormItem>

          <ElFormItem label="证据材料">
            <ElInput
              v-model="claimForm.evidenceMaterials"
              type="textarea"
              :rows="2"
              placeholder="请输入证据材料"
            />
          </ElFormItem>

          <ElFormItem label="证据材料附件">
            <ElUpload
              v-model:file-list="claimForm.evidenceAttachments"
              :auto-upload="false"
              :limit="5"
              multiple
            >
              <ElButton type="primary" size="small">
                <Icon icon="lucide:upload" class="mr-1" />
                点击上传
              </ElButton>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传文档、图片等文件，单个文件不超过50MB
                </div>
              </template>
            </ElUpload>
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="claimForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeEditDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleEditClaim"
            :loading="editLoading"
          >
            保存
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showReviewDialog"
      title="债权审查"
      width="90%"
      destroy-on-close
    >
      <div class="review-dialog-container">
        <ElForm label-width="180px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="审查日期">
                <ElDatePicker
                  v-model="reviewForm.reviewDate"
                  type="datetime"
                  placeholder="请选择审查日期"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="审查人">
                <ElInput
                  v-model="reviewForm.reviewer"
                  placeholder="请输入审查人"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="审查轮次">
                <ElInput v-model="reviewForm.reviewRound" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="审查结论">
                <ElSelect
                  v-model="reviewForm.reviewConclusion"
                  placeholder="请选择审查结论"
                  style="width: 100%"
                >
                  <ElOption label="确认" value="CONFIRMED" />
                  <ElOption label="部分确认" value="PARTIAL_CONFIRMED" />
                  <ElOption label="不予确认" value="UNCONFIRMED" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="审查依据">
            <ElInput
              v-model="reviewForm.reviewBasis"
              type="textarea"
              :rows="3"
              placeholder="请输入审查依据"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">申报金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报本金">
                <ElInput v-model="reviewForm.declaredPrincipal" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报利息">
                <ElInput v-model="reviewForm.declaredInterest" type="number" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报罚金">
                <ElInput v-model="reviewForm.declaredPenalty" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报其他损失">
                <ElInput
                  v-model="reviewForm.declaredOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  v-model="reviewForm.declaredTotalAmount"
                  :value="declaredTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">确认金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认本金">
                <ElInput
                  v-model="reviewForm.confirmedPrincipal"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="确认利息">
                <ElInput v-model="reviewForm.confirmedInterest" type="number" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认罚金">
                <ElInput v-model="reviewForm.confirmedPenalty" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="确认其他损失">
                <ElInput
                  v-model="reviewForm.confirmedOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认总金额">
                <ElInput
                  v-model="reviewForm.confirmedTotalAmount"
                  :value="confirmedTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">不予确认金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认本金">
                <ElInput
                  v-model="reviewForm.unconfirmedPrincipal"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="不予确认利息">
                <ElInput
                  v-model="reviewForm.unconfirmedInterest"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认罚金">
                <ElInput
                  v-model="reviewForm.unconfirmedPenalty"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="不予确认其他损失">
                <ElInput
                  v-model="reviewForm.unconfirmedOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认总金额">
                <ElInput
                  v-model="reviewForm.unconfirmedTotalAmount"
                  :value="unconfirmedTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="金额调整理由">
            <ElInput
              v-model="reviewForm.adjustmentReason"
              type="textarea"
              :rows="2"
              placeholder="请输入金额调整理由"
            />
          </ElFormItem>

          <ElFormItem label="不予确认理由">
            <ElInput
              v-model="reviewForm.unconfirmedReason"
              type="textarea"
              :rows="2"
              placeholder="请输入不予确认理由"
            />
          </ElFormItem>

          <ElFormItem label="证据不足理由">
            <ElInput
              v-model="reviewForm.insufficientEvidenceReason"
              type="textarea"
              :rows="2"
              placeholder="请输入证据不足理由"
            />
          </ElFormItem>

          <ElFormItem label="超过诉讼时效理由">
            <ElInput
              v-model="reviewForm.expiredReason"
              type="textarea"
              :rows="2"
              placeholder="请输入超过诉讼时效理由"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">证据审查</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="证据真实性">
                <ElSelect
                  v-model="reviewForm.evidenceAuthenticity"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="真实" value="AUTHENTIC" />
                  <ElOption label="可疑" value="SUSPICIOUS" />
                  <ElOption label="虚假" value="FAKE" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="证据关联性">
                <ElSelect
                  v-model="reviewForm.evidenceRelevance"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="相关" value="RELEVANT" />
                  <ElOption label="不相关" value="IRRELEVANT" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="证据合法性">
                <ElSelect
                  v-model="reviewForm.evidenceLegality"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="合法" value="LEGAL" />
                  <ElOption label="不合法" value="ILLEGAL" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="证据审查说明">
            <ElInput
              v-model="reviewForm.evidenceReviewNotes"
              type="textarea"
              :rows="3"
              placeholder="请输入证据审查说明"
            />
          </ElFormItem>

          <ElFormItem label="审查总结">
            <ElInput
              v-model="reviewForm.reviewSummary"
              type="textarea"
              :rows="3"
              placeholder="请输入审查总结"
            />
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="reviewForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeReviewDialog">取消</ElButton>
          <ElButton type="primary" @click="handleSaveReview">保存</ElButton>
          <ElButton
            v-if="currentClaim?.reviewInfo"
            type="success"
            @click="handleSubmitReview"
          >
            提交审查
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showConfirmationDialog"
      title="债权确认"
      width="90%"
      destroy-on-close
    >
      <div class="confirmation-dialog-container">
        <ElForm label-width="180px">
          <div class="section-divider mb-4">
            <h4 class="section-title">债权人会议信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="会议类型">
                <ElSelect
                  v-model="confirmationForm.meetingType"
                  placeholder="请选择会议类型"
                  style="width: 100%"
                >
                  <ElOption label="第一次债权人会议" value="FIRST" />
                  <ElOption label="第二次债权人会议" value="SECOND" />
                  <ElOption label="临时债权人会议" value="TEMPORARY" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="会议日期">
                <ElInput
                  v-model="confirmationForm.meetingDate"
                  placeholder="请输入会议日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="会议地点">
                <ElInput
                  v-model="confirmationForm.meetingLocation"
                  placeholder="请输入会议地点"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="表决结果">
                <ElSelect
                  v-model="confirmationForm.voteResult"
                  placeholder="请选择表决结果"
                  style="width: 100%"
                >
                  <ElOption label="同意" value="AGREE" />
                  <ElOption label="不同意" value="DISAGREE" />
                  <ElOption label="弃权" value="ABSTAIN" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="表决说明">
            <ElInput
              v-model="confirmationForm.voteNotes"
              type="textarea"
              :rows="2"
              placeholder="请输入表决说明"
            />
          </ElFormItem>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="是否有异议">
                <ElCheckbox v-model="confirmationForm.hasObjection">
                  是
                </ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div
            v-if="confirmationForm.hasObjection"
            class="section-divider mb-4"
          >
            <h4 class="section-title">异议信息</h4>
          </div>

          <ElRow v-if="confirmationForm.hasObjection" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="异议人">
                <ElInput
                  v-model="confirmationForm.objector"
                  placeholder="请输入异议人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="异议金额">
                <ElInput
                  v-model="confirmationForm.objectionAmount"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem v-if="confirmationForm.hasObjection" label="异议理由">
            <ElInput
              v-model="confirmationForm.objectionReason"
              type="textarea"
              :rows="3"
              placeholder="请输入异议理由"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">最终确认</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="最终确认金额">
                <ElInput
                  v-model="confirmationForm.finalConfirmedAmount"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="最终确认日期">
                <ElInput
                  v-model="confirmationForm.finalConfirmationDate"
                  placeholder="请输入最终确认日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="最终确认依据">
                <ElSelect
                  v-model="confirmationForm.finalConfirmationBasis"
                  placeholder="请选择最终确认依据"
                  style="width: 100%"
                >
                  <ElOption label="债权人会议" value="MEETING" />
                  <ElOption label="法院裁定" value="COURT" />
                  <ElOption label="和解" value="SETTLEMENT" />
                  <ElOption label="其他" value="OTHER" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="备注">
            <ElInput
              v-model="confirmationForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeConfirmationDialog">取消</ElButton>
          <ElButton type="primary" @click="handleSubmitVote">提交表决</ElButton>
          <ElButton
            v-if="confirmationForm.hasObjection"
            type="danger"
            @click="handleSubmitObjection"
          >
            提交异议
          </ElButton>
          <ElButton
            v-if="
              currentClaim?.confirmationInfo &&
              currentClaim.confirmationInfo.confirmationStatus !== 'CONFIRMED'
            "
            type="success"
            @click="handleFinalizeConfirmation"
          >
            最终确认
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showStageOneDialog"
      title="阶段一：债权申报登记"
      width="70%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="stage-dialog-container">
        <div class="stage-header mb-4">
          <div class="stage-title">
            <Icon icon="lucide:file-text" class="mr-2" />
            债权申报登记
          </div>
          <ElTag type="warning" size="large">阶段一</ElTag>
        </div>

        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="债权编号">
            {{ currentClaim.claimNo }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记状态">
            <ElTag
              :type="
                getRegistrationStatusTag(currentClaim.registrationStatus).type
              "
            >
              {{
                getRegistrationStatusTag(currentClaim.registrationStatus).text
              }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>

        <ElAlert title="操作说明" type="info" :closable="false" class="mb-4">
          <p>
            此步骤将接收债权申报材料并完成债权登记。确认材料完整性后，债权状态将更新为"已登记"。
          </p>
        </ElAlert>

        <div class="stage-actions">
          <ElFormItem label="材料完整性">
            <ElRadioGroup v-model="claimForm.materialCompleteness">
              <ElRadioButton label="COMPLETE">完整</ElRadioButton>
              <ElRadioButton label="INCOMPLETE">不完整</ElRadioButton>
              <ElRadioButton label="PENDING">待补充</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label="材料接收人">
            <ElInput
              v-model="claimForm.materialReceiver"
              placeholder="请输入材料接收人"
            />
          </ElFormItem>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeStageOneDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleStageOneSubmit"
            :loading="stageOneLoading"
          >
            <Icon icon="lucide:check" class="mr-1" />
            确认登记
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showStageTwoDialog"
      title="阶段二：债权审查"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="stage-dialog-container">
        <div class="stage-header mb-4">
          <div class="stage-title">
            <Icon icon="lucide:search" class="mr-2" />
            债权审查
          </div>
          <ElTag type="primary" size="large">阶段二</ElTag>
        </div>

        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="债权编号">
            {{ currentClaim.claimNo }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记状态">
            <ElTag
              :type="
                getRegistrationStatusTag(currentClaim.registrationStatus).type
              "
            >
              {{
                getRegistrationStatusTag(currentClaim.registrationStatus).text
              }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>

        <ElAlert title="操作说明" type="info" :closable="false" class="mb-4">
          <p>
            此步骤将对债权进行审查，包括金额确认、证据审查等。请填写完整的审查信息并提交。
          </p>
        </ElAlert>

        <ElForm label-width="180px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="审查日期">
                <ElDatePicker
                  v-model="reviewForm.reviewDate"
                  type="datetime"
                  placeholder="请选择审查日期"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="审查人">
                <ElInput
                  v-model="reviewForm.reviewer"
                  placeholder="请输入审查人"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="审查轮次">
                <ElInput v-model="reviewForm.reviewRound" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="审查结论">
                <ElSelect
                  v-model="reviewForm.reviewConclusion"
                  placeholder="请选择审查结论"
                  style="width: 100%"
                >
                  <ElOption label="确认" value="CONFIRMED" />
                  <ElOption label="部分确认" value="PARTIAL_CONFIRMED" />
                  <ElOption label="不予确认" value="UNCONFIRMED" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="审查依据">
            <ElInput
              v-model="reviewForm.reviewBasis"
              type="textarea"
              :rows="3"
              placeholder="请输入审查依据"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">申报金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报本金">
                <ElInput v-model="reviewForm.declaredPrincipal" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报利息">
                <ElInput v-model="reviewForm.declaredInterest" type="number" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报罚金">
                <ElInput v-model="reviewForm.declaredPenalty" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报其他损失">
                <ElInput
                  v-model="reviewForm.declaredOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  v-model="reviewForm.declaredTotalAmount"
                  :value="declaredTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">确认金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认本金">
                <ElInput
                  v-model="reviewForm.confirmedPrincipal"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="确认利息">
                <ElInput v-model="reviewForm.confirmedInterest" type="number" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认罚金">
                <ElInput v-model="reviewForm.confirmedPenalty" type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="确认其他损失">
                <ElInput
                  v-model="reviewForm.confirmedOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="确认总金额">
                <ElInput
                  v-model="reviewForm.confirmedTotalAmount"
                  :value="confirmedTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">不予确认金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认本金">
                <ElInput
                  v-model="reviewForm.unconfirmedPrincipal"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="不予确认利息">
                <ElInput
                  v-model="reviewForm.unconfirmedInterest"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认罚金">
                <ElInput
                  v-model="reviewForm.unconfirmedPenalty"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="不予确认其他损失">
                <ElInput
                  v-model="reviewForm.unconfirmedOtherLosses"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="不予确认总金额">
                <ElInput
                  v-model="reviewForm.unconfirmedTotalAmount"
                  :value="unconfirmedTotalAmount"
                  type="number"
                  readonly
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="金额调整理由">
            <ElInput
              v-model="reviewForm.adjustmentReason"
              type="textarea"
              :rows="2"
              placeholder="请输入金额调整理由"
            />
          </ElFormItem>

          <ElFormItem label="不予确认理由">
            <ElInput
              v-model="reviewForm.unconfirmedReason"
              type="textarea"
              :rows="2"
              placeholder="请输入不予确认理由"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">证据审查</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="证据真实性">
                <ElSelect
                  v-model="reviewForm.evidenceAuthenticity"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="真实" value="AUTHENTIC" />
                  <ElOption label="可疑" value="SUSPICIOUS" />
                  <ElOption label="虚假" value="FAKE" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="证据关联性">
                <ElSelect
                  v-model="reviewForm.evidenceRelevance"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="相关" value="RELEVANT" />
                  <ElOption label="不相关" value="IRRELEVANT" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="证据合法性">
                <ElSelect
                  v-model="reviewForm.evidenceLegality"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <ElOption label="合法" value="LEGAL" />
                  <ElOption label="不合法" value="ILLEGAL" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="证据审查说明">
            <ElInput
              v-model="reviewForm.evidenceReviewNotes"
              type="textarea"
              :rows="3"
              placeholder="请输入证据审查说明"
            />
          </ElFormItem>

          <ElFormItem label="审查总结">
            <ElInput
              v-model="reviewForm.reviewSummary"
              type="textarea"
              :rows="3"
              placeholder="请输入审查总结"
            />
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="reviewForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeStageTwoDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleStageTwoSubmit"
            :loading="stageTwoLoading"
          >
            <Icon icon="lucide:check" class="mr-1" />
            提交审查
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showStageThreeDialog"
      title="阶段三：债权确认"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="stage-dialog-container">
        <div class="stage-header mb-4">
          <div class="stage-title">
            <Icon icon="lucide:check-circle" class="mr-2" />
            债权确认
          </div>
          <ElTag type="warning" size="large">阶段三</ElTag>
        </div>

        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="债权编号">
            {{ currentClaim.claimNo }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认总金额">
            <ElTag type="success">
              {{ currentClaim.reviewInfo?.confirmedTotalAmount || 0 }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>

        <ElAlert title="操作说明" type="info" :closable="false" class="mb-4">
          <p>
            此步骤将在债权人会议上对债权进行表决确认。如有异议，可提交异议处理流程。
          </p>
        </ElAlert>

        <ElForm label-width="180px">
          <div class="section-divider mb-4">
            <h4 class="section-title">债权人会议信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="会议类型">
                <ElSelect
                  v-model="confirmationForm.meetingType"
                  placeholder="请选择会议类型"
                  style="width: 100%"
                >
                  <ElOption label="第一次债权人会议" value="FIRST" />
                  <ElOption label="第二次债权人会议" value="SECOND" />
                  <ElOption label="临时债权人会议" value="TEMPORARY" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="会议日期">
                <ElInput
                  v-model="confirmationForm.meetingDate"
                  placeholder="请输入会议日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="会议地点">
                <ElInput
                  v-model="confirmationForm.meetingLocation"
                  placeholder="请输入会议地点"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="表决结果">
                <ElSelect
                  v-model="confirmationForm.voteResult"
                  placeholder="请选择表决结果"
                  style="width: 100%"
                >
                  <ElOption label="同意" value="AGREE" />
                  <ElOption label="不同意" value="DISAGREE" />
                  <ElOption label="弃权" value="ABSTAIN" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="表决说明">
            <ElInput
              v-model="confirmationForm.voteNotes"
              type="textarea"
              :rows="2"
              placeholder="请输入表决说明"
            />
          </ElFormItem>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="是否有异议">
                <ElCheckbox v-model="confirmationForm.hasObjection">
                  是
                </ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div
            v-if="confirmationForm.hasObjection"
            class="section-divider mb-4"
          >
            <h4 class="section-title">异议信息</h4>
          </div>

          <ElRow v-if="confirmationForm.hasObjection" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="异议人">
                <ElInput
                  v-model="confirmationForm.objector"
                  placeholder="请输入异议人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="异议金额">
                <ElInput
                  v-model="confirmationForm.objectionAmount"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem v-if="confirmationForm.hasObjection" label="异议理由">
            <ElInput
              v-model="confirmationForm.objectionReason"
              type="textarea"
              :rows="3"
              placeholder="请输入异议理由"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">最终确认</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="最终确认金额">
                <ElInput
                  v-model="confirmationForm.finalConfirmedAmount"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="最终确认日期">
                <ElInput
                  v-model="confirmationForm.finalConfirmationDate"
                  placeholder="请输入最终确认日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="最终确认依据">
                <ElSelect
                  v-model="confirmationForm.finalConfirmationBasis"
                  placeholder="请选择最终确认依据"
                  style="width: 100%"
                >
                  <ElOption label="债权人会议" value="MEETING" />
                  <ElOption label="法院裁定" value="COURT" />
                  <ElOption label="和解" value="SETTLEMENT" />
                  <ElOption label="其他" value="OTHER" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="备注">
            <ElInput
              v-model="confirmationForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeStageThreeDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleStageThreeSubmit"
            :loading="stageThreeLoading"
          >
            <Icon icon="lucide:check" class="mr-1" />
            提交确认
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-registration-container {
  padding: 20px;
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

.claim-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

.add-dialog-container {
  max-height: 600px;
  padding: 10px 0;
  overflow-y: auto;
}

.section-divider {
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.import-dialog-container {
  padding: 10px 0;
}

.import-description {
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
}

.stage-dialog-container {
  max-height: 600px;
  padding: 10px 0;
  overflow-y: auto;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin-bottom: 20px;
}

.stage-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.stage-actions {
  padding: 20px;
  background: #f9fafb;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .stage-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .stage-dialog-container {
    padding: 10px;
  }
}
</style>
