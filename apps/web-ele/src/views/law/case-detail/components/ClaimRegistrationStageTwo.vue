<script setup lang="ts">
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';
import type { ClaimReviewApi } from '#/api/core/claim-review';
import type { ClaimConfirmationApi } from '#/api/core/claim-confirmation';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElRadioGroup,
  ElRadioButton,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import FileUpload from './FileUpload.vue';

import { getClaimRegistrationDetailApi } from '#/api/core/claim-registration';
import { getAllFilesByClaimRegistrationApi } from '#/api/core/file';

import { useReviewForm, useConfirmationForm } from './composables/useClaimForm';
import { useClaimPagination } from './composables/useClaimPagination';
import { ClaimService } from './services/claimService';
import {
  getConfirmationStatusTag,
  getRegistrationStatusTag,
  getReviewConclusionTag,
  getReviewStatusTag,
} from './utils/claimStatusMapper';
import { reviewFormRules } from './utils/claimFormRules';

const props = defineProps<{
  caseId: string;
  isCaseArchived?: boolean;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);

const showDetailDialog = ref(false);
const showReviewDialog = ref(false);
const reviewLoading = ref(false);
const reviewUploadRef = ref<any>();
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(null);
const currentReview = ref<ClaimReviewApi.ClaimReviewInfo | null>(null);
const reviewStatusFilter = ref<string>(''); // 空字符串表示全部
const reviewCollapseActive = ref<string[]>([]);
const reviewExistingFiles = ref<any[]>([]);

// 监听折叠状态变化，用于调试
watch(reviewCollapseActive, (newVal) => {
  console.log('审查对话框折叠状态变化:', newVal);
}, { deep: true });

const { reviewForm, declaredTotalAmount, confirmedTotalAmount, unconfirmedTotalAmount, resetReviewForm } = useReviewForm();
const { confirmationForm, resetConfirmationForm } = useConfirmationForm();
const { currentPage, pageSize, total } = useClaimPagination();

const showConfirmDialog = ref(false);
const confirmLoading = ref(false);
const currentConfirmationId = ref<number | null>(null);
const confirmCollapseActive = ref<string[]>([]);

// 自定义分页处理函数
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchClaims();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchClaims();
};

const fetchClaims = async () => {
  loading.value = true;
  const result = await ClaimService.fetchReviews(
    Number(props.caseId),
    currentPage.value,
    pageSize.value,
    reviewStatusFilter.value || undefined,
  );
  if (result.success) {
    claims.value = result.data;
    total.value = result.total;
  } else {
    claims.value = [];
    total.value = 0;
  }
  loading.value = false;
};

const openDetailDialog = async (row: any) => {
  let result;
  // 如果有reviewInfo，则调用审查详情接口
  if (row.reviewInfo) {
    result = await ClaimService.getReviewDetail(row.reviewInfo.id);
  } else {
    // 否则调用债权详情接口
    const claimId = row.claimRegistrationId || row.id;
    result = await ClaimService.getClaimDetail(claimId);
  }
  if (result.success) {
    currentClaim.value = result.data;
    showDetailDialog.value = true;
  }
};

const openReviewDialog = async (row: any) => {
  let response;
  try {
    const claimRegistrationId = row.claimRegistrationId || row.id;
    
    if (row.reviewInfo) {
      const result = await ClaimService.getReviewDetail(row.reviewInfo.id);
      if (result.success) {
        response = result.data;
        currentClaim.value = row;
        Object.assign(reviewForm, result.data);
        // 确保reviewAttachments是数组
        if (!Array.isArray(reviewForm.reviewAttachments)) {
          reviewForm.reviewAttachments = [];
        }
      } else {
        ElMessage.error('获取审查详情失败');
        return;
      }
    } else {
      const result = await ClaimService.getClaimDetail(row.id);
      if (result.success) {
        response = result.data;
        currentClaim.value = result.data;

        reviewForm.declaredPrincipal = result.data.principal || 0;
        reviewForm.declaredInterest = result.data.interest || 0;
        reviewForm.declaredPenalty = result.data.penalty || 0;
        reviewForm.declaredOtherLosses = result.data.otherLosses || 0;
        reviewForm.declaredTotalAmount = result.data.totalAmount || 0;

        if (!result.data.reviewInfo || result.data.reviewInfo.confirmedPrincipal === null) {
          reviewForm.confirmedPrincipal = result.data.principal || 0;
          reviewForm.confirmedInterest = result.data.interest || 0;
          reviewForm.confirmedPenalty = result.data.penalty || 0;
          reviewForm.confirmedOtherLosses = result.data.otherLosses || 0;
          reviewForm.confirmedTotalAmount = result.data.totalAmount || 0;
        }
      } else {
        ElMessage.error('获取债权详情失败');
        return;
      }
    }

    // 获取该债权申报的所有附件文件
    try {
      console.log('获取债权申报附件，claimRegistrationId:', claimRegistrationId);
      const filesResponse = await getAllFilesByClaimRegistrationApi(claimRegistrationId);
      if (filesResponse.code === 200 && filesResponse.data) {
        console.log('获取到的附件文件:', filesResponse.data);
        reviewExistingFiles.value = filesResponse.data.map((file: any) => ({
          id: file.id,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          fileExtension: file.fileExtension,
          mimeType: file.mimeType,
          uploadTime: file.uploadTime,
          filePath: file.filePath,
        }));
        // 同时初始化 reviewAttachments
        reviewForm.reviewAttachments = [...reviewExistingFiles.value];
      } else {
        reviewExistingFiles.value = [];
        reviewForm.reviewAttachments = [];
      }
    } catch (fileError) {
      console.error('获取债权申报附件失败:', fileError);
      reviewExistingFiles.value = [];
      reviewForm.reviewAttachments = [];
    }

    // 设置默认审查日期为今天（北京时间），覆盖响应中的数据
    const now = new Date();
    // 获取北京时间（UTC+8）
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingTime = new Date(utcTime + 8 * 60 * 60 * 1000);
    reviewForm.reviewDate = beijingTime;

    // 从本地存储获取审查人，覆盖响应中的数据
    try {
      const chatUserInfoStr = localStorage.getItem('chat_user_info');
      if (chatUserInfoStr) {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        reviewForm.reviewer = chatUserInfo.realName || '';
      }
    } catch (error) {
      console.error('获取本地存储用户信息失败:', error);
    }

    if (response) {
      // 如果状态不是 REVIEWING，自动更新为 REVIEWING
      if (row.registration_status !== 'REVIEWING') {
        const startReviewResult = await ClaimService.startReview(row.id);
        if (startReviewResult.success) {
          // 重新获取数据以更新状态
          await fetchClaims();
          // 重新获取当前债权详情
          const claimResult = await ClaimService.getClaimDetail(row.id);
          if (claimResult.success) {
            currentClaim.value = claimResult.data;
          }
        } else {
          ElMessage.error('开始审查失败');
          return;
        }
      }
      showReviewDialog.value = true;
    }
  } catch (error) {
    console.error('打开审查对话框失败:', error);
    ElMessage.error('打开审查对话框失败');
  }
};

const closeReviewDialog = () => {
  showReviewDialog.value = false;
  resetReviewForm();
  currentClaim.value = null;
  reviewCollapseActive.value = [];
  reviewExistingFiles.value = [];
  console.log('关闭审查对话框，重置折叠状态');
};

const handleReviewCollapseChange = (activeNames: string | string[]) => {
  console.log('审查对话框折叠面板变化:', activeNames);
};

const handleSaveReview = async () => {
  if (!currentClaim.value) return;

  if (!reviewForm.reviewConclusion) {
    ElMessage.warning('请选择审查结论');
    return;
  }

  reviewLoading.value = true;
  const claimId = currentClaim.value.claimRegistrationId || currentClaim.value.id;
  const requestData: ClaimReviewApi.CreateClaimReviewRequest = {
    claimRegistrationId: claimId,
    caseId: currentClaim.value.caseId || currentClaim.value.caseId,
    creditorName: currentClaim.value.creditorName || currentClaim.value.creditorName,
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
    confirmedTotalAmount: Number(confirmedTotalAmount.value) || 0,
    unconfirmedPrincipal: Number(reviewForm.unconfirmedPrincipal) || 0,
    unconfirmedInterest: Number(reviewForm.unconfirmedInterest) || 0,
    unconfirmedPenalty: Number(reviewForm.unconfirmedPenalty) || 0,
    unconfirmedOtherLosses: Number(reviewForm.unconfirmedOtherLosses) || 0,
    unconfirmedTotalAmount: Number(unconfirmedTotalAmount.value) || 0,
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
    remarks: reviewForm.remarks || null,
  };

  let result;
  let reviewId: number;
  
  if (currentClaim.value.reviewInfo) {
    result = await ClaimService.updateReview(currentClaim.value.reviewInfo.id, requestData);
    reviewId = currentClaim.value.reviewInfo.id;
  } else {
    result = await ClaimService.createReview(requestData);
    reviewId = result.data?.id || result.data?.reviewId;
  }

  try {
    if (result.success) {
      // 文件上传使用债权申报ID，而不是审查记录ID
      const fileUploadBizId = claimId;
      
      // 1. 首先转移手机上传的临时文件（如果有）
      let allUploadedFileIds: number[] = [];
      
      if (reviewUploadRef.value && reviewUploadRef.value.getHasUntransferredFiles()) {
        console.log('发现手机上传的临时文件，开始转移...');
        const transferredFiles = await reviewUploadRef.value.transferMobileFiles(fileUploadBizId);
        console.log('转移成功的文件:', transferredFiles);
        
        // 收集转移的文件 ID
        if (transferredFiles && transferredFiles.length > 0) {
          allUploadedFileIds = transferredFiles.map(f => f.id);
        }
      }
      
      // 2. 上传本地文件（电脑选择的文件）
      if (reviewUploadRef.value && reviewForm.reviewAttachments && reviewForm.reviewAttachments.length > 0) {
        console.log('=== 准备债权审查文件上传 ===');
        console.log('reviewForm.reviewAttachments:', reviewForm.reviewAttachments);
        console.log('reviewUploadRef.value.getLocalFiles():', reviewUploadRef.value?.getLocalFiles());
        console.log('文件上传 bizId:', fileUploadBizId);
        
        // 筛选出需要上传的新文件（没有file_id的文件，且不是手机上传的文件）
        const filesToUpload = reviewForm.reviewAttachments
          .filter((attach: any) => {
            // 过滤掉已有文件和手机上传的文件
            const isExisting = attach.file_id || attach.id?.toString().startsWith('existing-');
            const isMobile = attach.id?.toString().startsWith('mobile-');
            console.log('检查文件:', attach.originalFileName || attach.name, {
              isExisting,
              isMobile,
              hasFile: !!attach.file,
              id: attach.id
            });
            return !isExisting && !isMobile && attach.file;
          })
          .map((attach: any) => attach.file);

        console.log('需要上传的文件数量:', filesToUpload.length);
        console.log('需要上传的文件:', filesToUpload);

        if (filesToUpload.length > 0) {
          try {
            console.log('开始上传本地文件...');
            const uploadedIds = await reviewUploadRef.value.uploadLocalFiles(fileUploadBizId);
            console.log('上传成功的文件 ID:', uploadedIds);
            
            if (uploadedIds && uploadedIds.length > 0) {
              allUploadedFileIds = [...allUploadedFileIds, ...uploadedIds];
            }
          } catch (error: any) {
            console.error('文件上传失败:', error);
            ElMessage.warning(`审查保存成功，但文件上传失败：${error.message || '未知错误'}`);
          }
        }
      }
      
      await fetchClaims();
      closeReviewDialog();
      ElMessage.success('审查保存成功');
    }
  } finally {
    reviewLoading.value = false;
  }
};

const handleStartReview = async (row: any) => {
  ElMessageBox.confirm('确定要开始审查这条债权吗？', '开始审查', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      const claimId = row.claimRegistrationId || row.id;
      const result = await ClaimService.startReview(claimId);
      if (result.success) {
        await fetchClaims();
        await openReviewDialog(row);
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleCompleteReview = async (row: any) => {
  ElMessageBox.confirm('确定要完成审查吗？', '完成审查', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const claimId = row.claimRegistrationId || row.id;
      const result = await ClaimService.completeReview(claimId);
      if (result.success) {
        await fetchClaims();
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleRejectReview = async (row: any) => {
  ElMessageBox.prompt('请输入驳回理由', '驳回确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入驳回理由',
    type: 'warning',
  })
    .then(async ({ value }) => {
      if (!value || value.trim() === '') {
        ElMessage.warning('请输入驳回理由');
        return;
      }
      
      const claimId = row.claimRegistrationId || row.id;
      
      if (row.reviewInfo) {
        // 已有审查记录，使用驳回接口
        const rejectResult = await ClaimService.rejectClaimReview(row.reviewInfo.id, value.trim());
        if (rejectResult.success) {
          const completeResult = await ClaimService.completeReview(claimId);
          if (completeResult.success) {
            await fetchClaims();
          }
        }
      } else {
        // 无审查记录，创建审查记录并设置为驳回
        const requestData: ClaimReviewApi.CreateClaimReviewRequest = {
          claimRegistrationId: claimId,
          caseId: row.caseId,
          creditorName: row.creditorName,
          reviewConclusion: 'UNCONFIRMED' as ClaimReviewApi.ReviewConclusion,
          remarks: value.trim(),
        };
        const createResult = await ClaimService.createReview(requestData);
        if (createResult.success) {
          const completeResult = await ClaimService.completeReview(claimId);
          if (completeResult.success) {
            await fetchClaims();
          }
        }
      }
    })
    .catch(() => {
      ElMessage.info('已取消驳回操作');
    });
};

const handleStartConfirmation = async (row: any) => {
  ElMessageBox.confirm('确定要开始债权确认流程吗？', '开始确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      const claimId = row.claimRegistrationId || row.id;
      const result = await ClaimService.startConfirmation(claimId);
      if (result.success) {
        ElMessage.success('已开始债权确认流程');
        await fetchClaims();
        emit('switch-tab', 'stage3');
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleViewConfirmation = async (row: any) => {
  try {
    const claimId = row.claimRegistrationId || row.id;
    const result = await ClaimService.getConfirmationDetailByClaimId(claimId);
    if (result.success) {
      currentClaim.value = result.data;
      showDetailDialog.value = true;
    }
  } catch (error) {
    console.error('查看确认详情失败:', error);
    ElMessage.error('查看确认详情失败');
  }
};

const openConfirmDialog = async (row: any) => {
  try {
    const claimRegistrationId = row.claimRegistrationId || row.id;
    currentClaim.value = row;
    currentConfirmationId.value = null;

    const result = await ClaimService.getConfirmationDetailByClaimId(claimRegistrationId);
    if (result.success && result.data) {
      currentConfirmationId.value = result.data.id;
      const data = result.data;

      Object.assign(confirmationForm, {
        meetingType: data.meetingType || 'FIRST',
        meetingDate: data.meetingDate || '',
        meetingLocation: data.meetingLocation || '',
        voteResult: data.voteResult || 'AGREE',
        voteNotes: data.voteNotes || '',
        hasObjection: data.hasObjection || false,
        objector: data.objector || '',
        objectionReason: data.objectionReason || '',
        objectionAmount: data.objectionAmount || 0,
        objectionDate: data.objectionDate || '',
        negotiationResult: data.negotiationResult || '',
        negotiationDate: data.negotiationDate || '',
        negotiationParticipants: data.negotiationParticipants || '',
        courtRulingDate: data.courtRulingDate || '',
        courtRulingNo: data.courtRulingNo || '',
        courtRulingResult: data.courtRulingResult || 'CONFIRMED',
        courtRulingAmount: data.courtRulingAmount || 0,
        courtRulingNotes: data.courtRulingNotes || '',
        hasLawsuit: data.hasLawsuit || false,
        lawsuitCaseNo: data.lawsuitCaseNo || '',
        lawsuitStatus: data.lawsuitStatus || 'PENDING',
        lawsuitResult: data.lawsuitResult || 'WIN',
        lawsuitAmount: data.lawsuitAmount || 0,
        lawsuitNotes: data.lawsuitNotes || '',
        finalConfirmedAmount: data.finalConfirmedAmount || 0,
        finalConfirmationDate: data.finalConfirmationDate || '',
        finalConfirmationBasis: data.finalConfirmationBasis || 'MEETING',
        confirmationAttachments: data.confirmationAttachments || [],
        confirmationStatus: data.confirmationStatus || 'PENDING',
        remarks: data.remarks || '',
      });
    } else {
      const reviewInfo = row.reviewInfo;
      Object.assign(confirmationForm, {
        meetingType: 'FIRST',
        meetingDate: '',
        meetingLocation: '',
        voteResult: 'AGREE',
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
        courtRulingResult: 'CONFIRMED',
        courtRulingAmount: 0,
        courtRulingNotes: '',
        hasLawsuit: false,
        lawsuitCaseNo: '',
        lawsuitStatus: 'PENDING',
        lawsuitResult: 'WIN',
        lawsuitAmount: 0,
        lawsuitNotes: '',
        finalConfirmedAmount: reviewInfo?.confirmedTotalAmount || row.total_amount || 0,
        finalConfirmationDate: '',
        finalConfirmationBasis: 'MEETING',
        confirmationAttachments: [],
        confirmationStatus: 'PENDING',
        remarks: '',
      });
    }

    showConfirmDialog.value = true;
  } catch (error) {
    console.error('打开确认对话框失败:', error);
    ElMessage.error('打开确认对话框失败');
  }
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
  currentClaim.value = null;
  currentConfirmationId.value = null;
  resetConfirmationForm();
  confirmCollapseActive.value = [];
};

const handleSaveConfirmation = async () => {
  if (!currentConfirmationId.value) {
    ElMessage.warning('未找到确认记录ID，无法更新');
    return;
  }

  confirmLoading.value = true;
  try {
    const requestData: ClaimConfirmationApi.UpdateClaimConfirmationRequest = {
      finalConfirmedAmount: Number(confirmationForm.finalConfirmedAmount) || 0,
      finalConfirmationDate: confirmationForm.finalConfirmationDate || undefined,
      finalConfirmationBasis: confirmationForm.finalConfirmationBasis || undefined,
      confirmationStatus: confirmationForm.confirmationStatus || undefined,
      remarks: confirmationForm.remarks || undefined,
      meetingType: confirmationForm.meetingType || undefined,
      meetingDate: confirmationForm.meetingDate || undefined,
      meetingLocation: confirmationForm.meetingLocation || undefined,
      voteResult: confirmationForm.voteResult || undefined,
      voteNotes: confirmationForm.voteNotes || undefined,
      hasObjection: confirmationForm.hasObjection ? 1 : 0,
      objectionReason: confirmationForm.objectionReason || undefined,
      objectionAmount: Number(confirmationForm.objectionAmount) || undefined,
      courtRulingAmount: Number(confirmationForm.courtRulingAmount) || undefined,
      confirmedPrincipal: Number(confirmationForm.finalConfirmedAmount) || 0,
      confirmedInterest: 0,
      confirmedPenalty: 0,
      confirmedOtherLosses: 0,
      confirmedTotalAmount: Number(confirmationForm.finalConfirmedAmount) || 0,
    };

    const result = await ClaimService.updateConfirmation(
      currentConfirmationId.value,
      requestData,
    );

    if (result.success) {
      await fetchClaims();
      closeConfirmDialog();
      ElMessage.success('确认提交成功');
    }
  } catch (error) {
    console.error('确认提交失败:', error);
    ElMessage.error('确认提交失败');
  } finally {
    confirmLoading.value = false;
  }
};

onMounted(() => {
  fetchClaims();
});

defineExpose({
  refresh: fetchClaims,
});
</script>

<template>
  <div class="claim-review-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-search" class="mr-2 text-primary" />
            <span class="text-lg font-semibold">债权审查与确认</span>
          </div>
          <div class="flex space-x-2">
            <ElSelect v-model="reviewStatusFilter" placeholder="选择审查状态" style="width: 200px" @change="fetchClaims">
              <ElOption label="全部" value="" />
              <ElOption label="进行中" value="IN_PROGRESS" />
              <ElOption label="已完成" value="COMPLETED" />
            </ElSelect>
            <ElButton type="primary" @click="fetchClaims">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <ElAlert
        title="说明"
        type="info"
        :closable="false"
        class="mb-4"
      >
        <div>
          <p>本页面展示所有待审查的债权申报记录。</p>
          <p>点击"开始审查"可开始债权审查流程。</p>
          <p>点击"审查"可填写审查信息。</p>
          <p>点击"完成审查"可完成审查并进入确认阶段。</p>
        </div>
      </ElAlert>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">

          <ElTableColumn
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
              <ElTag v-else type="warning" size="small"> 待审查 </ElTag>
            </template>
          </ElTableColumn>
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
          <ElTableColumn label="操作" width="450" fixed="right">
            <template #default="scope">
              <ElButton
                link
                size="small"
                @click="openDetailDialog(scope.row)"
              >
                查看详情
              </ElButton>
              <ElButton
                v-if="scope.row.registration_status === 'REGISTERED'"
                link
                size="small"
                type="primary"
                @click="handleStartReview(scope.row)"
              >
                开始审查
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'REVIEWING' ||
                  (scope.row.reviewInfo &&
                  (scope.row.reviewInfo.reviewStatus === 'PENDING' ||
                   scope.row.reviewInfo.reviewStatus === 'IN_PROGRESS'))
                "
                link
                size="small"
                @click="openReviewDialog(scope.row)"
              >
                审查
              </ElButton>
              <ElButton
                v-if="scope.row.registration_status === 'REVIEWING'"
                type="success"
                size="small"
                @click="handleCompleteReview(scope.row)"
              >
                完成审查
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'REVIEWING'
                "
                link
                size="small"
                type="danger"
                @click="handleRejectReview(scope.row)"
              >
                驳回
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'REVIEW_COMPLETED' &&
                  scope.row.reviewInfo.review_status === 'COMPLETED'
                "
                link
                size="small"
                type="primary"
                @click="handleStartConfirmation(scope.row)"
              >
                进入确认阶段
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'CONFIRMING'
                "
                type="primary"
                size="small"
                @click="openConfirmDialog(scope.row)"
              >
                确认
              </ElButton>

              <ElTag
                v-else-if="
                  scope.row.reviewInfo.review_status === 'COMPLETED' &&
                  scope.row.registration_status === 'CONFIRMED'
                "
                type="success"
                size="small"
              >
                确认完成
              </ElTag>
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
          <ElEmpty description="暂无待审查的债权申报信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showDetailDialog"
      title="债权审查与确认详情"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="detail-dialog-container">
        <!-- 根据数据类型展示不同的详情模板 -->
        <template v-if="currentClaim.reviewStatus">
          <!-- 审查详情模板 -->
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权人">
              {{ currentClaim.creditorName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="案件ID">
              {{ currentClaim.caseId }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权登记ID">
              {{ currentClaim.claimRegistrationId }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查日期">
              {{ currentClaim.reviewDate }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查人">
              {{ currentClaim.reviewer || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查轮次">
              {{ currentClaim.reviewRound || 1 }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查依据">
              {{ currentClaim.reviewBasis || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查状态">
              <ElTag
                :type="getReviewStatusTag(currentClaim.reviewStatus).type"
              >
                {{ getReviewStatusTag(currentClaim.reviewStatus).text }}
              </ElTag>
            </ElDescriptionsItem>
          </ElDescriptions>

          <div class="section-divider mb-4 mt-4">
            <h4 class="section-title">申报金额</h4>
          </div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="申报本金">
              <span class="amount-highlight">{{ currentClaim.declaredPrincipal }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报利息">
              <span class="amount-highlight">{{ currentClaim.declaredInterest }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报罚金">
              <span class="amount-highlight">{{ currentClaim.declaredPenalty }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报其他损失">
              <span class="amount-highlight">{{ currentClaim.declaredOtherLosses }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报总金额">
              <span class="amount-highlight amount-total">{{ currentClaim.declaredTotalAmount }}</span>
            </ElDescriptionsItem>
          </ElDescriptions>

          <div class="section-divider mb-4 mt-4">
            <h4 class="section-title">确认金额</h4>
          </div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="确认本金">
              <span class="amount-confirmed">{{ currentClaim.confirmedPrincipal || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认利息">
              <span class="amount-confirmed">{{ currentClaim.confirmedInterest || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认罚金">
              <span class="amount-confirmed">{{ currentClaim.confirmedPenalty || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认其他损失">
              <span class="amount-confirmed">{{ currentClaim.confirmedOtherLosses || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认总金额">
              <span class="amount-confirmed amount-total-green">{{ currentClaim.confirmedTotalAmount || 0 }}</span>
            </ElDescriptionsItem>
          </ElDescriptions>

          <div v-if="currentClaim.reviewConclusion" class="section-divider mb-4 mt-4">
            <h4 class="section-title">审查结论</h4>
          </div>
          <ElDescriptions v-if="currentClaim.reviewConclusion" :column="2" border>
            <ElDescriptionsItem label="审查结论">
              <ElTag
                :type="getReviewConclusionTag(currentClaim.reviewConclusion).type"
              >
                {{ getReviewConclusionTag(currentClaim.reviewConclusion).text }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查摘要">
              {{ currentClaim.reviewSummary || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </template>

        <template v-else>
          <!-- 债权详情模板 -->
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权编号">
              {{ currentClaim.claimNo }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="案件名称">
              {{ currentClaim.caseName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债务人">
              {{ currentClaim.debtor }}
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
            <ElDescriptionsItem label="债权类型">
              {{ currentClaim.claimType }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权性质">
              {{ currentClaim.claimNature || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权标识">
              {{ currentClaim.claimIdentifier || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权事实" :span="2">
              {{ currentClaim.claimFacts || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报状态">
              <ElTag
                :type="
                  getRegistrationStatusTag(currentClaim.registrationStatus).type
                "
              >
                {{ getRegistrationStatusTag(currentClaim.registrationStatus).text }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登记日期">
              {{ currentClaim.registrationDate }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="材料接收人">
              {{ currentClaim.materialReceiver }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="材料接收日期">
              {{ currentClaim.materialReceiveDate }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="材料完整性">
              <ElTag
                :type="
                  currentClaim.materialCompleteness === 'COMPLETE'
                    ? 'success'
                    : 'warning'
                "
              >
                {{ currentClaim.materialCompleteness === 'COMPLETE' ? '完整' : currentClaim.materialCompleteness === 'INCOMPLETE' ? '不完整' : '待补充' }}
              </ElTag>
            </ElDescriptionsItem>
          </ElDescriptions>

          <div v-if="currentClaim.reviewInfo" class="section-divider mb-4 mt-4">
            <h4 class="section-title">审查信息</h4>
          </div>
          <ElDescriptions v-if="currentClaim.reviewInfo" :column="2" border>
            <ElDescriptionsItem label="审查日期">
              {{ currentClaim.reviewInfo.reviewDate || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查人">
              {{ currentClaim.reviewInfo.reviewer || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查轮次">
              {{ currentClaim.reviewInfo.reviewRound || 1 }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查依据">
              {{ currentClaim.reviewInfo.reviewBasis || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认本金">
              <span class="amount-confirmed">{{ currentClaim.reviewInfo.confirmedPrincipal || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认利息">
              <span class="amount-confirmed">{{ currentClaim.reviewInfo.confirmedInterest || '-' }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认总金额">
              <span class="amount-confirmed amount-total-green">{{ currentClaim.reviewInfo.confirmedTotalAmount || 0 }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查结论">
              <ElTag
                :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).type"
              >
                {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).text }}
              </ElTag>
            </ElDescriptionsItem>
          </ElDescriptions>
        </template>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">附件信息</h4>
        </div>
        <FileUpload
          v-model="reviewForm.reviewAttachments"
          :biz-type="'claim'"
          :biz-id="currentClaim.claimRegistrationId || currentClaim.id"
          :disabled="true"
          title="债权审查附件"
          use-claim-registration-api
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showDetailDialog = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showReviewDialog"
      title="债权审查与确认"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="review-dialog-container">
        <div class="claim-info-section mb-4">
          <h4 class="section-title mb-2">债权基本信息</h4>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权人">
              {{ currentClaim.creditorName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报总金额">
              {{ declaredTotalAmount }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="review-form-section">
          <h4 class="section-title mb-2">审查信息</h4>
          <ElForm label-width="150px" :model="reviewForm" :rules="reviewFormRules">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="审查日期" prop="reviewDate">
                  <ElDatePicker
                    v-model="reviewForm.reviewDate"
                    type="datetime"
                    placeholder="请选择审查日期"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="审查人" prop="reviewer">
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
                  <ElInput
                    v-model="reviewForm.reviewRound"
                    type="number"
                    placeholder="请输入审查轮次"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="审查依据">
                  <ElInput
                    v-model="reviewForm.reviewBasis"
                    placeholder="请输入审查依据"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <div class="section-divider mb-4">
              <h4 class="section-title">申报金额</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="6">
                <ElFormItem label="申报本金">
                  <ElInput
                    v-model="reviewForm.declaredPrincipal"
                    type="number"
                    placeholder="申报本金"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报利息">
                  <ElInput
                    v-model="reviewForm.declaredInterest"
                    type="number"
                    placeholder="申报利息"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报违约金">
                  <ElInput
                    v-model="reviewForm.declaredPenalty"
                    type="number"
                    placeholder="申报违约金"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报其他损失">
                  <ElInput
                    v-model="reviewForm.declaredOtherLosses"
                    type="number"
                    placeholder="申报其他损失"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="申报总金额">
                  <ElInput
                    :model-value="declaredTotalAmount"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <div class="section-divider mb-4">
              <h4 class="section-title">确认金额</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="6">
                <ElFormItem label="确认本金">
                  <ElInput
                    v-model="reviewForm.confirmedPrincipal"
                    type="number"
                    placeholder="确认本金"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="确认利息">
                  <ElInput
                    v-model="reviewForm.confirmedInterest"
                    type="number"
                    placeholder="确认利息"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="确认违约金">
                  <ElInput
                    v-model="reviewForm.confirmedPenalty"
                    type="number"
                    placeholder="确认违约金"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="确认其他损失">
                  <ElInput
                    v-model="reviewForm.confirmedOtherLosses"
                    type="number"
                    placeholder="确认其他损失"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="确认总金额">
                  <ElInput
                    :model-value="confirmedTotalAmount"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <div class="section-divider mb-4">
              <h4 class="section-title">未确认金额</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="6">
                <ElFormItem label="未确认本金">
                  <ElInput
                    v-model="reviewForm.unconfirmedPrincipal"
                    type="number"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认利息">
                  <ElInput
                    v-model="reviewForm.unconfirmedInterest"
                    type="number"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认违约金">
                  <ElInput
                    v-model="reviewForm.unconfirmedPenalty"
                    type="number"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认其他损失">
                  <ElInput
                    v-model="reviewForm.unconfirmedOtherLosses"
                    type="number"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="未确认总金额">
                  <ElInput
                    :model-value="unconfirmedTotalAmount"
                    placeholder="自动计算"
                    disabled
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElCollapse v-model="reviewCollapseActive" class="mb-4" @change="handleReviewCollapseChange">
              <ElCollapseItem title="调整原因" name="adjustment">
                <ElFormItem label="调整原因">
                  <ElInput
                    v-model="reviewForm.adjustmentReason"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入调整原因"
                  />
                </ElFormItem>
                <ElFormItem label="未确认原因">
                  <ElInput
                    v-model="reviewForm.unconfirmedReason"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入未确认原因"
                  />
                </ElFormItem>
                <ElFormItem label="证据不足原因">
                  <ElInput
                    v-model="reviewForm.insufficientEvidenceReason"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入证据不足原因"
                  />
                </ElFormItem>
                <ElFormItem label="过期原因">
                  <ElInput
                    v-model="reviewForm.expiredReason"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入过期原因"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="reviewCollapseActive" class="mb-4" @change="handleReviewCollapseChange">
              <ElCollapseItem title="证据评估" name="evidence">
                <ElRow :gutter="20">
                  <ElCol :span="8">
                    <ElFormItem label="证据真实性">
                      <ElSelect
                        v-model="reviewForm.evidenceAuthenticity"
                        placeholder="请选择"
                        style="width: 100%"
                      >
                        <ElOption label="真实" value="AUTHENTIC" />
                        <ElOption label="存疑" value="SUSPICIOUS" />
                        <ElOption label="不真实" value="FAKE" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="8">
                    <ElFormItem label="证据相关性">
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

                <ElFormItem label="证据审查备注">
                  <ElInput
                    v-model="reviewForm.evidenceReviewNotes"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入证据审查备注"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="reviewCollapseActive" class="mb-4" @change="handleReviewCollapseChange">
              <ElCollapseItem title="债权性质确认" name="nature">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="确认债权性质">
                      <ElInput
                        v-model="reviewForm.confirmedClaimNature"
                        placeholder="请输入确认债权性质"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="8">
                    <ElFormItem label="是否连带责任">
                      <ElCheckbox v-model="reviewForm.isJointLiability">是</ElCheckbox>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="8">
                    <ElFormItem label="是否附条件">
                      <ElCheckbox v-model="reviewForm.isConditional">是</ElCheckbox>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="8">
                    <ElFormItem label="是否附期限">
                      <ElCheckbox v-model="reviewForm.isTerm">是</ElCheckbox>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="reviewCollapseActive" class="mb-4" @change="handleReviewCollapseChange">
              <ElCollapseItem title="担保信息" name="collateral">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="担保类型">
                      <ElInput
                        v-model="reviewForm.collateralType"
                        placeholder="请输入担保类型"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="担保财产">
                      <ElInput
                        v-model="reviewForm.collateralProperty"
                        placeholder="请输入担保财产"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="担保金额">
                      <ElInput
                        v-model="reviewForm.collateralAmount"
                        type="number"
                        placeholder="请输入担保金额"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="担保期限">
                      <ElInput
                        v-model="reviewForm.collateralTerm"
                        placeholder="请输入担保期限"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="担保有效性">
                      <ElSelect
                        v-model="reviewForm.collateralValidity"
                        placeholder="请选择"
                        style="width: 100%"
                      >
                        <ElOption label="有效" value="VALID" />
                        <ElOption label="无效" value="INVALID" />
                        <ElOption label="部分有效" value="PARTIAL" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>

            <div class="section-divider mb-4">
              <h4 class="section-title">审查结论</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="审查结论" prop="reviewConclusion">
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

            <ElFormItem label="审查摘要">
              <ElInput
                v-model="reviewForm.reviewSummary"
                type="textarea"
                :rows="3"
                placeholder="请输入审查摘要"
              />
            </ElFormItem>
            <ElFormItem label="审查报告">
              <ElInput
                v-model="reviewForm.reviewReport"
                type="textarea"
                :rows="3"
                placeholder="请输入审查报告"
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

        <div class="section-divider mb-4">
          <h4 class="section-title">附件上传</h4>
        </div>

        <ElRow :gutter="20">
          <ElCol :span="24">
            <FileUpload
              ref="reviewUploadRef"
              v-model="reviewForm.reviewAttachments"
              :biz-type="'claim'"
              :biz-id="currentClaim?.claimRegistrationId || currentClaim?.id || 0"
              :accept="'.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar'"
              :max-size="50 * 1024 * 1024"
              :multiple="true"
              title="债权审查附件"
              :disabled="false"
              :local-mode="true"
              :existing-files="reviewExistingFiles"
              @local-files-change="(files) => { console.log('债权审查附件变化:', files); reviewForm.reviewAttachments = files; }"
            />
          </ElCol>
        </ElRow>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeReviewDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSaveReview"
            :loading="reviewLoading"
          >
            保存
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showConfirmDialog"
      title="债权确认"
      width="70%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="confirm-dialog-container">
        <div class="claim-info-section mb-4">
          <h4 class="section-title mb-2">债权基本信息</h4>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权人">
              {{ currentClaim.creditor_name || currentClaim.creditorName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报总金额">
              {{ currentClaim.total_amount || currentClaim.declaredTotalAmount || 0 }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查结论">
              <ElTag
                v-if="currentClaim.reviewInfo"
                :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion || currentClaim.reviewInfo.review_conclusion).type"
              >
                {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion || currentClaim.reviewInfo.review_conclusion).text }}
              </ElTag>
              <span v-else>-</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认金额">
              <span class="amount-confirmed amount-total-green">{{ currentClaim.reviewInfo?.confirmedTotalAmount || 0 }}</span>
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="confirm-form-section">
          <h4 class="section-title mb-2">确认信息</h4>
          <ElForm label-width="140px" :model="confirmationForm">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="最终确认金额" required>
                  <ElInput
                    v-model="confirmationForm.finalConfirmedAmount"
                    type="number"
                    placeholder="请输入最终确认金额"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="确认状态">
                  <ElSelect
                    v-model="confirmationForm.confirmationStatus"
                    placeholder="请选择确认状态"
                    style="width: 100%"
                  >
                    <ElOption label="待确认" value="PENDING" />
                    <ElOption label="已确认" value="CONFIRMED" />
                    <ElOption label="有异议" value="OBJECTION" />
                    <ElOption label="法院裁定" value="COURT" />
                    <ElOption label="诉讼中" value="LAWSUIT" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="最终确认日期">
                  <ElDatePicker
                    v-model="confirmationForm.finalConfirmationDate"
                    type="datetime"
                    placeholder="请选择最终确认日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="最终确认依据">
                  <ElSelect
                    v-model="confirmationForm.finalConfirmationBasis"
                    placeholder="请选择最终确认依据"
                    style="width: 100%"
                  >
                    <ElOption label="债权人会议" value="MEETING" />
                    <ElOption label="法院裁定" value="COURT" />
                    <ElOption label="和解协议" value="SETTLEMENT" />
                    <ElOption label="其他" value="OTHER" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElCollapse v-model="confirmCollapseActive" class="mb-4">
              <ElCollapseItem title="会议信息" name="meeting">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="会议类型">
                      <ElSelect
                        v-model="confirmationForm.meetingType"
                        placeholder="请选择会议类型"
                        style="width: 100%"
                      >
                        <ElOption label="第一次会议" value="FIRST" />
                        <ElOption label="第二次会议" value="SECOND" />
                        <ElOption label="临时会议" value="TEMPORARY" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="会议日期">
                      <ElDatePicker
                        v-model="confirmationForm.meetingDate"
                        type="datetime"
                        placeholder="请选择会议日期"
                        style="width: 100%"
                        value-format="YYYY-MM-DDTHH:mm:ss"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="会议地点">
                  <ElInput
                    v-model="confirmationForm.meetingLocation"
                    placeholder="请输入会议地点"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmCollapseActive" class="mb-4">
              <ElCollapseItem title="表决信息" name="vote">
                <ElRow :gutter="20">
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
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmCollapseActive" class="mb-4">
              <ElCollapseItem title="异议信息" name="objection">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="是否有异议">
                      <ElSelect
                        v-model="confirmationForm.hasObjection"
                        placeholder="请选择"
                        style="width: 100%"
                      >
                        <ElOption label="否" :value="false" />
                        <ElOption label="是" :value="true" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="异议金额">
                      <ElInput
                        v-model="confirmationForm.objectionAmount"
                        type="number"
                        placeholder="请输入异议金额"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="异议原因">
                  <ElInput
                    v-model="confirmationForm.objectionReason"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入异议原因"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmCollapseActive" class="mb-4">
              <ElCollapseItem title="法院裁定信息" name="court">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="法院裁定金额">
                      <ElInput
                        v-model="confirmationForm.courtRulingAmount"
                        type="number"
                        placeholder="请输入法院裁定金额"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>

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
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeConfirmDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSaveConfirmation"
            :loading="confirmLoading"
          >
            确认提交
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-review-page {
  padding: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.claim-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 40px 0;
}

.detail-dialog-container,
.review-dialog-container,
.confirm-dialog-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-divider {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  margin-top: 16px;
}

.amount-highlight {
  color: #f5222d;
  font-weight: 700;
  font-size: 15px;
}

.amount-total {
  font-size: 18px;
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #ffa39e;
}

.amount-confirmed {
  color: #52c41a;
  font-weight: 700;
  font-size: 15px;
}

.amount-total-green {
  font-size: 18px;
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #b7eb8f;
}
</style>
