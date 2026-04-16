<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElCollapse,
  ElCollapseItem,
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
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import FileUpload from './FileUpload.vue';

import { getAllFilesByClaimRegistrationApi } from '#/api/core/file';
import { ClaimService } from './services/claimService';
import { useConfirmationForm } from './composables/useClaimForm';
import { useClaimPagination } from './composables/useClaimPagination';
import {
  getConfirmationStatusTag,
  getRegistrationStatusTag,
  getReviewConclusionTag,
} from './utils/claimStatusMapper';
import { confirmationFormRules } from './utils/claimFormRules';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);

const { currentPage, pageSize, total } = useClaimPagination();
const confirmationStatusFilter = ref<string>('');
const showAllConfirmations = ref(true);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchClaims();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchClaims();
};

const { confirmationForm, resetConfirmationForm } = useConfirmationForm();

const showDetailDialog = ref(false);
const showConfirmDialog = ref(false);
const confirmLoading = ref(false);
const confirmationUploadRef = ref<any>();
const currentClaim = ref<any>(null);
const confirmationCollapseActive = ref<string[]>([]);
const confirmationExistingFiles = ref<any[]>([]);

watch(confirmationCollapseActive, () => {}, { deep: true });

const fetchClaims = async () => {
  loading.value = true;
  try {
    const result = await ClaimService.fetchConfirmations(
      Number(props.caseId),
      currentPage.value,
      pageSize.value,
      confirmationStatusFilter.value || undefined,
    );
    if (result.success) {
      claims.value = result.data;
      total.value = result.total;
    }
  } finally {
    loading.value = false;
  }
};

const openDetailDialog = async (row: any) => {
  let result;
  if (row.confirmationInfo) {
    result = await ClaimService.getConfirmationDetail(row.confirmationInfo.id);
  } else {
    const claimId = row.claimRegistrationId || row.id;
    result = await ClaimService.getClaimDetail(claimId);
  }
  if (result.success) {
    currentClaim.value = result.data;
    showDetailDialog.value = true;
  }
};

const openConfirmDialog = async (row: any) => {
  try {
    if (row.registration_status !== 'CONFIRMING') {
      const startConfirmResult = await ClaimService.startConfirmation(row.id);
      if (startConfirmResult.success) {
        await fetchClaims();
        const updatedRow = claims.value.find(item => item.id === row.id);
        if (updatedRow) {
          row = updatedRow;
        }
      } else {
        ElMessage.error('开始确认失败');
        return;
      }
    }

    const hasConfirmationRecord = row.finalConfirmedAmount !== undefined || row.confirmationStatus !== undefined;
    
    if (hasConfirmationRecord) {
      const claimRegistrationId = row.claimRegistrationId || row.id;
      
      let claimDetailData: any = null;
      try {
        const claimDetailResult = await ClaimService.getClaimDetail(claimRegistrationId);
        if (claimDetailResult.success) {
          claimDetailData = claimDetailResult.data;
        }
      } catch (error) {
        // 继续使用现有数据
      }
      
      const result = await ClaimService.getConfirmationDetailByClaimId(claimRegistrationId);
      
      if (result.success) {
        const confirmationId = result.data.id || row.id;
        const syncResult = await ClaimService.syncReviewData(confirmationId);
        if (syncResult.success) {
          const refreshedResult = await ClaimService.getConfirmationDetailByClaimId(claimRegistrationId);
          if (refreshedResult.success) {
            const reviewInfo = claimDetailData?.reviewInfo || row.reviewInfo;
            currentClaim.value = {
              ...row,
              declaredPrincipal: reviewInfo?.declaredPrincipal ?? row.declaredPrincipal ?? 0,
              declaredInterest: reviewInfo?.declaredInterest ?? row.declaredInterest ?? 0,
              declaredPenalty: reviewInfo?.declaredPenalty ?? row.declaredPenalty ?? 0,
              declaredOtherLosses: reviewInfo?.declaredOtherLosses ?? row.declaredOtherLosses ?? 0,
              declaredTotalAmount: reviewInfo?.declaredTotalAmount ?? row.declaredTotalAmount ?? row.totalAmount ?? 0,
              confirmedPrincipal: reviewInfo?.confirmedPrincipal ?? 0,
              confirmedInterest: reviewInfo?.confirmedInterest ?? 0,
              confirmedPenalty: reviewInfo?.confirmedPenalty ?? 0,
              confirmedOtherLosses: reviewInfo?.confirmedOtherLosses ?? 0,
              confirmedTotalAmount: reviewInfo?.confirmedTotalAmount ?? refreshedResult.data.confirmedTotalAmount ?? 0,
              unconfirmedPrincipal: reviewInfo?.unconfirmedPrincipal ?? 0,
              unconfirmedInterest: reviewInfo?.unconfirmedInterest ?? 0,
              unconfirmedPenalty: reviewInfo?.unconfirmedPenalty ?? 0,
              unconfirmedOtherLosses: reviewInfo?.unconfirmedOtherLosses ?? 0,
              unconfirmedTotalAmount: reviewInfo?.unconfirmedTotalAmount ?? 0,
              reviewInfo: reviewInfo,
              confirmationInfo: refreshedResult.data
            };
            
            const targetAmount = refreshedResult.data.finalConfirmedAmount ||
              refreshedResult.data.confirmedTotalAmount ||
              row.confirmedTotalAmount ||
              0;
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            Object.assign(confirmationForm, {
              meetingType: refreshedResult.data.meetingType || '',
              meetingDate: refreshedResult.data.meetingDate || '',
              meetingLocation: refreshedResult.data.meetingLocation || '',
              voteResult:
                refreshedResult.data.voteResult === 'AGREE'
                  ? '通过'
                  : refreshedResult.data.voteResult === 'DISAGREE'
                    ? '不通过'
                    : '待定',
              voteNotes: refreshedResult.data.voteNotes || '',
              hasObjection: refreshedResult.data.hasObjection || false,
              objector: refreshedResult.data.objector || '',
              objectionReason: refreshedResult.data.objectionReason || '',
              objectionAmount: refreshedResult.data.objectionAmount || 0,
              objectionDate: refreshedResult.data.objectionDate || '',
              negotiationResult: refreshedResult.data.negotiationResult || '',
              negotiationDate: refreshedResult.data.negotiationDate || '',
              negotiationParticipants: refreshedResult.data.negotiationParticipants || '',
              courtRulingDate: refreshedResult.data.courtRulingDate || '',
              courtRulingNo: refreshedResult.data.courtRulingNo || '',
              courtRulingResult: refreshedResult.data.courtRulingResult || '',
              courtRulingAmount: refreshedResult.data.courtRulingAmount || 0,
              courtRulingNotes: refreshedResult.data.courtRulingNotes || '',
              hasLawsuit: refreshedResult.data.hasLawsuit || false,
              lawsuitCaseNo: refreshedResult.data.lawsuitCaseNo || '',
              lawsuitStatus: refreshedResult.data.lawsuitStatus || '',
              lawsuitResult: refreshedResult.data.lawsuitResult || '',
              lawsuitAmount: refreshedResult.data.lawsuitAmount || 0,
              lawsuitNotes: refreshedResult.data.lawsuitNotes || '',
              finalConfirmedAmount: targetAmount,
              finalConfirmationDate: refreshedResult.data.finalConfirmationDate || '',
              finalConfirmationBasis: refreshedResult.data.finalConfirmationBasis || '',
              confirmationAttachments: refreshedResult.data.confirmationAttachments || [],
              remarks: refreshedResult.data.remarks || '',
            });
            
            // 获取该债权申报的所有附件文件
            try {
              const filesResponse = await getAllFilesByClaimRegistrationApi(claimRegistrationId);
              if (filesResponse.code === 200 && filesResponse.data) {
                const files = filesResponse.data.map((file: any) => ({
                  id: file.id,
                  originalFileName: file.originalFileName || file.fileName,
                  fileSize: file.fileSize,
                  fileExtension: file.fileExtension,
                  mimeType: file.mimeType,
                  uploadTime: file.uploadTime,
                  filePath: file.filePath,
                }));
                confirmationExistingFiles.value = files;
                confirmationForm.confirmationAttachments = [...files];
              }
            } catch (error) {
              confirmationExistingFiles.value = [];
            }
          }
        } else {
          const reviewInfo = claimDetailData?.reviewInfo || row.reviewInfo;
          currentClaim.value = {
            ...row,
            declaredPrincipal: reviewInfo?.declaredPrincipal ?? row.declaredPrincipal ?? 0,
            declaredInterest: reviewInfo?.declaredInterest ?? row.declaredInterest ?? 0,
            declaredPenalty: reviewInfo?.declaredPenalty ?? row.declaredPenalty ?? 0,
            declaredOtherLosses: reviewInfo?.declaredOtherLosses ?? row.declaredOtherLosses ?? 0,
            declaredTotalAmount: reviewInfo?.declaredTotalAmount ?? row.declaredTotalAmount ?? row.totalAmount ?? 0,
            confirmedPrincipal: reviewInfo?.confirmedPrincipal ?? 0,
            confirmedInterest: reviewInfo?.confirmedInterest ?? 0,
            confirmedPenalty: reviewInfo?.confirmedPenalty ?? 0,
            confirmedOtherLosses: reviewInfo?.confirmedOtherLosses ?? 0,
            confirmedTotalAmount: reviewInfo?.confirmedTotalAmount ?? result.data.confirmedTotalAmount ?? 0,
            unconfirmedPrincipal: reviewInfo?.unconfirmedPrincipal ?? 0,
            unconfirmedInterest: reviewInfo?.unconfirmedInterest ?? 0,
            unconfirmedPenalty: reviewInfo?.unconfirmedPenalty ?? 0,
            unconfirmedOtherLosses: reviewInfo?.unconfirmedOtherLosses ?? 0,
            unconfirmedTotalAmount: reviewInfo?.unconfirmedTotalAmount ?? 0,
            reviewInfo: reviewInfo,
            confirmationInfo: result.data
          };
          
          const targetAmount = result.data.finalConfirmedAmount ||
            result.data.confirmedTotalAmount ||
            row.confirmedTotalAmount ||
            0;
          
          Object.assign(confirmationForm, {
            meetingType: result.data.meetingType || '',
            meetingDate: result.data.meetingDate || '',
            meetingLocation: result.data.meetingLocation || '',
            voteResult:
              result.data.voteResult === 'AGREE'
                ? '通过'
                : result.data.voteResult === 'DISAGREE'
                  ? '不通过'
                  : '待定',
            voteNotes: result.data.voteNotes || '',
            hasObjection: result.data.hasObjection || false,
            objector: result.data.objector || '',
            objectionReason: result.data.objectionReason || '',
            objectionAmount: result.data.objectionAmount || 0,
            objectionDate: result.data.objectionDate || '',
            negotiationResult: result.data.negotiationResult || '',
            negotiationDate: result.data.negotiationDate || '',
            negotiationParticipants: result.data.negotiationParticipants || '',
            courtRulingDate: result.data.courtRulingDate || '',
            courtRulingNo: result.data.courtRulingNo || '',
            courtRulingResult: result.data.courtRulingResult || '',
            courtRulingAmount: result.data.courtRulingAmount || 0,
            courtRulingNotes: result.data.courtRulingNotes || '',
            hasLawsuit: result.data.hasLawsuit || false,
            lawsuitCaseNo: result.data.lawsuitCaseNo || '',
            lawsuitStatus: result.data.lawsuitStatus || '',
            lawsuitResult: result.data.lawsuitResult || '',
            lawsuitAmount: result.data.lawsuitAmount || 0,
            lawsuitNotes: result.data.lawsuitNotes || '',
            finalConfirmedAmount: targetAmount,
            finalConfirmationDate: result.data.finalConfirmationDate || '',
            finalConfirmationBasis: result.data.finalConfirmationBasis || '',
            confirmationAttachments: result.data.confirmationAttachments || [],
            remarks: result.data.remarks || '',
          });
          
          // 获取该债权申报的所有附件文件
          try {
            const filesResponse = await getAllFilesByClaimRegistrationApi(claimRegistrationId);
            if (filesResponse.code === 200 && filesResponse.data) {
              const files = filesResponse.data.map((file: any) => ({
                id: file.id,
                originalFileName: file.originalFileName || file.fileName,
                fileSize: file.fileSize,
                fileExtension: file.fileExtension,
                mimeType: file.mimeType,
                uploadTime: file.uploadTime,
                filePath: file.filePath,
              }));
              confirmationExistingFiles.value = files;
              confirmationForm.confirmationAttachments = [...files];
            }
          } catch (error) {
            confirmationExistingFiles.value = [];
          }
        }
      } else {
        ElMessage.error('获取确认详情失败');
        return;
      }
    } else {
      const claimRegistrationId = row.claimRegistrationId || row.id;
      let claimDetailData: any = null;
      try {
        const claimDetailResult = await ClaimService.getClaimDetail(claimRegistrationId);
        if (claimDetailResult.success) {
          claimDetailData = claimDetailResult.data;
        }
      } catch (error) {
        // 继续使用现有数据
      }
      
      const reviewInfo = claimDetailData?.reviewInfo || row.reviewInfo;
      currentClaim.value = {
        ...row,
        declaredPrincipal: reviewInfo?.declaredPrincipal ?? row.declaredPrincipal ?? row.principal ?? 0,
        declaredInterest: reviewInfo?.declaredInterest ?? row.declaredInterest ?? row.interest ?? 0,
        declaredPenalty: reviewInfo?.declaredPenalty ?? row.declaredPenalty ?? row.penalty ?? 0,
        declaredOtherLosses: reviewInfo?.declaredOtherLosses ?? row.declaredOtherLosses ?? row.otherLosses ?? 0,
        declaredTotalAmount: reviewInfo?.declaredTotalAmount ?? row.declaredTotalAmount ?? row.totalAmount ?? 0,
        confirmedPrincipal: reviewInfo?.confirmedPrincipal ?? 0,
        confirmedInterest: reviewInfo?.confirmedInterest ?? 0,
        confirmedPenalty: reviewInfo?.confirmedPenalty ?? 0,
        confirmedOtherLosses: reviewInfo?.confirmedOtherLosses ?? 0,
        confirmedTotalAmount: reviewInfo?.confirmedTotalAmount ?? row.confirmedTotalAmount ?? 0,
        unconfirmedPrincipal: reviewInfo?.unconfirmedPrincipal ?? 0,
        unconfirmedInterest: reviewInfo?.unconfirmedInterest ?? 0,
        unconfirmedPenalty: reviewInfo?.unconfirmedPenalty ?? 0,
        unconfirmedOtherLosses: reviewInfo?.unconfirmedOtherLosses ?? 0,
        unconfirmedTotalAmount: reviewInfo?.unconfirmedTotalAmount ?? 0,
        reviewInfo: reviewInfo,
      };
      
      try {
        const filesResponse = await getAllFilesByClaimRegistrationApi(claimRegistrationId);
        
        if (filesResponse.code === 200 && filesResponse.data) {
          const files = filesResponse.data.map((file: any) => ({
            id: file.id,
            originalFileName: file.originalFileName || file.fileName,
            fileSize: file.fileSize,
            fileExtension: file.fileExtension,
            mimeType: file.mimeType,
            uploadTime: file.uploadTime,
            filePath: file.filePath,
          }));
          
          confirmationExistingFiles.value = files;
          confirmationForm.confirmationAttachments = [...files];
        }
      } catch (error) {
        // 加载文件失败，继续
      }
      
      const targetAmount = reviewInfo?.confirmedTotalAmount || row.confirmedTotalAmount || row.totalAmount || 0;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      Object.assign(confirmationForm, {
        meetingType: '',
        meetingDate: '',
        meetingLocation: '',
        voteResult: '待定',
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
        courtRulingResult: '',
        courtRulingAmount: 0,
        courtRulingNotes: '',
        hasLawsuit: false,
        lawsuitCaseNo: '',
        lawsuitStatus: '',
        lawsuitResult: '',
        lawsuitAmount: 0,
        lawsuitNotes: '',
        finalConfirmedAmount: targetAmount,
        finalConfirmationDate: '',
        finalConfirmationBasis: '',
        remarks: '',
      });
    }
    
    showConfirmDialog.value = true;
  } catch (error) {
    ElMessage.error('打开确认对话框失败');
  }
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
  currentClaim.value = null;
  resetConfirmationForm();
  confirmationCollapseActive.value = [];
  confirmationExistingFiles.value = [];
};

const handleConfirmationCollapseChange = (_activeNames: string | string[]) => {};

const handleSaveConfirmation = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    const claimId = currentClaim.value.claimRegistrationId || currentClaim.value.id;
    const requestData: any = {
      claimRegistrationId: claimId,
      caseId: currentClaim.value.caseId,
      creditorName: currentClaim.value.creditorName,
      meetingType: confirmationForm.meetingType,
      meetingDate: confirmationForm.meetingDate || null,
      meetingLocation: confirmationForm.meetingLocation || null,
      voteResult:
        confirmationForm.voteResult === '通过'
          ? 'AGREE'
          : confirmationForm.voteResult === '不通过'
            ? 'DISAGREE'
            : 'ABSTAIN',
      voteNotes: confirmationForm.voteNotes || null,
      hasObjection: confirmationForm.hasObjection,
      objector: confirmationForm.objector || null,
      objectionReason: confirmationForm.objectionReason || null,
      objectionAmount: confirmationForm.objectionAmount,
      objectionDate: confirmationForm.objectionDate || null,
      negotiationResult: confirmationForm.negotiationResult || null,
      negotiationDate: confirmationForm.negotiationDate || null,
      negotiationParticipants: confirmationForm.negotiationParticipants || null,
      courtRulingDate: confirmationForm.courtRulingDate || null,
      courtRulingNo: confirmationForm.courtRulingNo || null,
      courtRulingResult: confirmationForm.courtRulingResult || null,
      courtRulingAmount: confirmationForm.courtRulingAmount,
      courtRulingNotes: confirmationForm.courtRulingNotes || null,
      hasLawsuit: confirmationForm.hasLawsuit,
      lawsuitCaseNo: confirmationForm.lawsuitCaseNo || null,
      lawsuitStatus: confirmationForm.lawsuitStatus || null,
      lawsuitResult: confirmationForm.lawsuitResult || null,
      lawsuitAmount: confirmationForm.lawsuitAmount,
      lawsuitNotes: confirmationForm.lawsuitNotes || null,
      finalConfirmedAmount: confirmationForm.finalConfirmedAmount,
      finalConfirmationDate: confirmationForm.finalConfirmationDate || null,
      finalConfirmationBasis: confirmationForm.finalConfirmationBasis || null,
      confirmationAttachments: confirmationForm.confirmationAttachments || null,
      remarks: confirmationForm.remarks || null,
    };

    let result;
    let confirmationId: number;
    
    const existingConfirmationId = currentClaim.value.confirmationInfo?.id || currentClaim.value.id;
    
    if (existingConfirmationId) {
      result = await ClaimService.updateConfirmation(
        existingConfirmationId,
        requestData,
      );
      confirmationId = existingConfirmationId;
    } else {
      result = await ClaimService.createConfirmation(requestData);
      confirmationId = result.data?.id || result.data?.confirmationId;
    }

    if (result.success) {
      // 文件应该关联到债权申报，而不是确认记录
      const fileBizId = claimId;
      
      let allUploadedFileIds: number[] = [];
      
      // 1. 首先转移手机上传的临时文件
      if (confirmationUploadRef.value && confirmationUploadRef.value.getHasUntransferredFiles()) {
        const transferredFiles = await confirmationUploadRef.value.transferMobileFiles(fileBizId);
        
        if (transferredFiles && transferredFiles.length > 0) {
          allUploadedFileIds = transferredFiles.map(f => f.id);
        }
      }
      
      // 2. 上传本地文件（电脑选择的文件）
      if (confirmationUploadRef.value && confirmationForm.confirmationAttachments && confirmationForm.confirmationAttachments.length > 0) {
        const uploadedIds = await confirmationUploadRef.value.uploadLocalFiles(fileBizId);
        
        if (uploadedIds && uploadedIds.length > 0) {
          allUploadedFileIds = [...allUploadedFileIds, ...uploadedIds];
        }
      }
      
      await fetchClaims();
      closeConfirmDialog();
      ElMessage.success('保存成功');
    }
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    confirmLoading.value = false;
  }
};

const handleCompleteConfirmation = async (row: any) => {
  ElMessageBox.confirm('确定要完成债权确认吗？', '完成确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const claimId = row.claimRegistrationId || row.id;
      const result = await ClaimService.completeConfirmation(claimId);
      if (result.success) {
        await fetchClaims();
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleRejectClaim = async (row: any) => {
  ElMessageBox.confirm('确定要驳回这条债权确认吗？', '驳回确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const claimId = row.claimRegistrationId || row.id;
      const result = await ClaimService.completeConfirmation(claimId);
      if (result.success) {
        await fetchClaims();
      }
    })
    .catch(() => {
      ElMessage.info('已取消驳回操作');
    });
};

onMounted(() => {
  fetchClaims();
});

defineExpose({
  refresh: fetchClaims,
});
</script>

<template>
  <div class="claim-confirmation-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-check" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权复查</span>
          </div>
          <div class="flex space-x-2">
            <ElSelect v-model="confirmationStatusFilter" placeholder="选择确认状态" style="width: 200px" @change="fetchClaims">
              <ElOption label="全部" value="" />
              <ElOption label="进行中" value="IN_PROGRESS" />
              <ElOption label="已完成" value="CONFIRMED" />
              <ElOption label="异议" value="OBJECTION" />
              <ElOption label="诉讼中" value="LAWSUIT" />
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
          <p>本页面展示所有待确认的债权申报记录。</p>
          <p>点击"确认"可进行债权确认操作。</p>
          <p>点击"完成确认"可完成债权确认流程。</p>
        </div>
      </ElAlert>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">

          <ElTableColumn prop="confirmationStatus" label="确认状态" width="120">
            <template #default="scope">
              <ElTag
                :type="getConfirmationStatusTag(scope.row.confirmationStatus).type"
                size="small"
              >
                {{ getConfirmationStatusTag(scope.row.confirmationStatus).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="确认金额" width="120">
            <template #default="scope">
              {{ scope.row.confirmationInfo?.finalConfirmedAmount || scope.row.reviewInfo?.confirmedTotalAmount || 0 }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="creditorName"
            label="债权人姓名或名称"
            min-width="180"
          />
          <ElTableColumn prop="creditorType" label="债权人类型" width="120" />
          <ElTableColumn prop="claimNo" label="债权编号" width="140" />
          <ElTableColumn prop="principal" label="申报本金" width="120" />
          <ElTableColumn prop="totalAmount" label="申报总金额" width="120" />
          <ElTableColumn prop="claimNature" label="债权性质" width="120" />
          <ElTableColumn prop="claimType" label="债权种类" width="120" />
          <ElTableColumn label="操作" width="450" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
              <ElButton
                v-if="
                  scope.row.registration_status === 'CONFIRMING' ||
                  scope.row.registration_status === 'REVIEW_COMPLETED'
                "
                type="primary"
                size="small"
                @click="openConfirmDialog(scope.row)"
              >
                确认
              </ElButton>

              <ElButton
                v-if="
                  scope.row.registration_status === 'CONFIRMING'
                "
                type="success"
                size="small"
                @click="handleCompleteConfirmation(scope.row)"
              >
                完成确认
              </ElButton>
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
          <ElEmpty description="暂无待确认的债权信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showDetailDialog"
      title="债权复查详情"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="detail-dialog-container">
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
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报状态">
            <ElTag
              :type="getRegistrationStatusTag(currentClaim.registrationStatus).type"
            >
              {{ getRegistrationStatusTag(currentClaim.registrationStatus).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记日期">
            {{ currentClaim.registrationDate }}
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
          <ElDescriptionsItem label="审查结论">
            <ElTag
              :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).type"
            >
              {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认总金额">
            {{ currentClaim.reviewInfo.confirmedTotalAmount || 0 }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div v-if="currentClaim.confirmationInfo" class="section-divider mb-4 mt-4">
          <h4 class="section-title">确认信息</h4>
        </div>
        <ElDescriptions v-if="currentClaim.confirmationInfo" :column="2" border>
          <ElDescriptionsItem label="会议类型">
            {{ currentClaim.confirmationInfo.meetingType || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="会议日期">
            {{ currentClaim.confirmationInfo.meetingDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="会议地点">
            {{ currentClaim.confirmationInfo.meetingLocation || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="表决结果">
            {{ currentClaim.confirmationInfo.voteResult || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="表决说明">
            {{ currentClaim.confirmationInfo.voteNotes || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有异议">
            {{ currentClaim.confirmationInfo.hasObjection ? '是' : '否' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议人">
            {{ currentClaim.confirmationInfo.objector || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议原因">
            {{ currentClaim.confirmationInfo.objectionReason || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议金额">
            {{ currentClaim.confirmationInfo.objectionAmount || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议日期">
            {{ currentClaim.confirmationInfo.objectionDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="协商结果">
            {{ currentClaim.confirmationInfo.negotiationResult || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="协商日期">
            {{ currentClaim.confirmationInfo.negotiationDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="裁定日期">
            {{ currentClaim.confirmationInfo.courtRulingDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="裁定编号">
            {{ currentClaim.confirmationInfo.courtRulingNo || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="裁定结果">
            {{ currentClaim.confirmationInfo.courtRulingResult || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="裁定金额">
            {{ currentClaim.confirmationInfo.courtRulingAmount || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有诉讼">
            {{ currentClaim.confirmationInfo.hasLawsuit ? '是' : '否' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="诉讼案号">
            {{ currentClaim.confirmationInfo.lawsuitCaseNo || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认金额">
            {{ currentClaim.confirmationInfo.finalConfirmedAmount || 0 }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认日期">
            {{ currentClaim.confirmationInfo.finalConfirmationDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认依据">
            {{ currentClaim.confirmationInfo.finalConfirmationBasis || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认状态">
            <ElTag
              :type="getConfirmationStatusTag(currentClaim.confirmationInfo.confirmationStatus).type"
            >
              {{ getConfirmationStatusTag(currentClaim.confirmationInfo.confirmationStatus).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="备注">
            {{ currentClaim.confirmationInfo.remarks || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div v-if="currentClaim.confirmationInfo" class="section-divider mb-4 mt-4">
          <h4 class="section-title">附件信息</h4>
        </div>
        <FileUpload
          v-if="currentClaim.confirmationInfo"
          :biz-type="'claim'"
          :biz-id="currentClaim.claimRegistrationId || currentClaim.id"
          :model-value="[]"
          :disabled="true"
          title="债权确认附件"
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
      v-model="showConfirmDialog"
      title="债权复查"
      width="70%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="confirm-dialog-container">
        <div class="claim-info-section mb-4">
          <h4 class="section-title mb-2">债权基本信息</h4>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权人">
              {{ currentClaim.creditorName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报总金额">
              {{ currentClaim.totalAmount || currentClaim.declaredTotalAmount || 0 }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审查结论">
              <ElTag
                :type="
                  getReviewConclusionTag(
                    currentClaim.reviewInfo?.reviewConclusion || 'UNCONFIRMED',
                  ).type
                "
              >
                {{
                  getReviewConclusionTag(
                    currentClaim.reviewInfo?.reviewConclusion || 'UNCONFIRMED',
                  ).text
                }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认金额">
              {{ currentClaim.reviewInfo?.confirmedTotalAmount || currentClaim.confirmedTotalAmount || 0 }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="amount-detail-section mb-4">
          <h4 class="section-title mb-2">金额明细</h4>
          <ElTable :data="[{}]" border style="width: 100%" :show-header="true" size="small">
            <ElTableColumn label="项目" width="120" fixed>
              <template #default>
                <div style="font-weight: 600">申报金额</div>
                <div style="font-weight: 600; color: #409EFF">确认金额</div>
                <div style="font-weight: 600; color: #F56C6C">未确认金额</div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="本金" width="120" align="right">
              <template #default>
                <div>{{ (currentClaim.declaredPrincipal || 0).toFixed(2) }}</div>
                <div style="color: #409EFF">{{ (currentClaim.confirmedPrincipal || 0).toFixed(2) }}</div>
                <div style="color: #F56C6C">{{ (currentClaim.unconfirmedPrincipal || 0).toFixed(2) }}</div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="利息" width="120" align="right">
              <template #default>
                <div>{{ (currentClaim.declaredInterest || 0).toFixed(2) }}</div>
                <div style="color: #409EFF">{{ (currentClaim.confirmedInterest || 0).toFixed(2) }}</div>
                <div style="color: #F56C6C">{{ (currentClaim.unconfirmedInterest || 0).toFixed(2) }}</div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="违约金" width="120" align="right">
              <template #default>
                <div>{{ (currentClaim.declaredPenalty || 0).toFixed(2) }}</div>
                <div style="color: #409EFF">{{ (currentClaim.confirmedPenalty || 0).toFixed(2) }}</div>
                <div style="color: #F56C6C">{{ (currentClaim.unconfirmedPenalty || 0).toFixed(2) }}</div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="其他损失" width="120" align="right">
              <template #default>
                <div>{{ (currentClaim.declaredOtherLosses || 0).toFixed(2) }}</div>
                <div style="color: #409EFF">{{ (currentClaim.confirmedOtherLosses || 0).toFixed(2) }}</div>
                <div style="color: #F56C6C">{{ (currentClaim.unconfirmedOtherLosses || 0).toFixed(2) }}</div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="合计" width="120" align="right" fixed="right">
              <template #default>
                <div style="font-weight: 600">{{ (currentClaim.declaredTotalAmount || 0).toFixed(2) }}</div>
                <div style="font-weight: 600; color: #409EFF">{{ (currentClaim.confirmedTotalAmount || 0).toFixed(2) }}</div>
                <div style="font-weight: 600; color: #F56C6C">{{ (currentClaim.unconfirmedTotalAmount || 0).toFixed(2) }}</div>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="confirm-form-section">
          <h4 class="section-title mb-2">确认操作</h4>
          <ElForm label-width="120px" :model="confirmationForm">
            <ElFormItem label="确认金额" required>
              <ElInput
                v-model="confirmationForm.finalConfirmedAmount"
                type="text"
                placeholder="请输入确认金额"
                style="width: 100%"
              />
            </ElFormItem>
            <ElFormItem label="表决结果" required>
              <ElSelect
                v-model="confirmationForm.voteResult"
                placeholder="请选择表决结果"
                style="width: 100%"
              >
                <ElOption label="通过" value="通过" />
                <ElOption label="不通过" value="不通过" />
                <ElOption label="弃权" value="弃权" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="表决说明">
              <ElInput
                v-model="confirmationForm.voteNotes"
                type="textarea"
                :rows="3"
                placeholder="请输入表决说明"
                style="width: 100%"
              />
            </ElFormItem>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
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
                      <ElInput
                        v-model="confirmationForm.meetingDate"
                        type="datetime-local"
                        placeholder="请选择会议日期"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="会议地点">
                  <ElInput
                    v-model="confirmationForm.meetingLocation"
                    placeholder="请输入会议地点"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
              <ElCollapseItem title="异议信息" name="objection">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="是否有异议">
                      <ElSelect
                        v-model="confirmationForm.hasObjection"
                        placeholder="请选择是否有异议"
                        style="width: 100%"
                      >
                        <ElOption label="否" :value="false" />
                        <ElOption label="是" :value="true" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="异议人">
                      <ElInput
                        v-model="confirmationForm.objector"
                        placeholder="请输入异议人"
                        style="width: 100%"
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
                    style="width: 100%"
                  />
                </ElFormItem>
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="异议金额">
                      <ElInput
                        v-model="confirmationForm.objectionAmount"
                        type="number"
                        placeholder="请输入异议金额"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="异议日期">
                      <ElInput
                        v-model="confirmationForm.objectionDate"
                        type="datetime-local"
                        placeholder="请选择异议日期"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
              <ElCollapseItem title="协商信息" name="negotiation">
                <ElFormItem label="协商结果">
                  <ElInput
                    v-model="confirmationForm.negotiationResult"
                    placeholder="请输入协商结果"
                    style="width: 100%"
                  />
                </ElFormItem>
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="协商日期">
                      <ElInput
                        v-model="confirmationForm.negotiationDate"
                        type="datetime-local"
                        placeholder="请选择协商日期"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="协商参与人">
                      <ElInput
                        v-model="confirmationForm.negotiationParticipants"
                        placeholder="请输入协商参与人"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
              <ElCollapseItem title="法院裁定信息" name="court">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="裁定日期">
                      <ElInput
                        v-model="confirmationForm.courtRulingDate"
                        type="datetime-local"
                        placeholder="请选择裁定日期"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="裁定编号">
                      <ElInput
                        v-model="confirmationForm.courtRulingNo"
                        placeholder="请输入裁定编号"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="裁定结果">
                  <ElInput
                    v-model="confirmationForm.courtRulingResult"
                    placeholder="请输入裁定结果"
                    style="width: 100%"
                  />
                </ElFormItem>
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="裁定金额">
                      <ElInput
                        v-model="confirmationForm.courtRulingAmount"
                        type="number"
                        placeholder="请输入裁定金额"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="裁定备注">
                  <ElInput
                    v-model="confirmationForm.courtRulingNotes"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入裁定备注"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
              <ElCollapseItem title="诉讼信息" name="lawsuit">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="是否有诉讼">
                      <ElSelect
                        v-model="confirmationForm.hasLawsuit"
                        placeholder="请选择是否有诉讼"
                        style="width: 100%"
                      >
                        <ElOption label="否" :value="false" />
                        <ElOption label="是" :value="true" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="案号">
                      <ElInput
                        v-model="confirmationForm.lawsuitCaseNo"
                        placeholder="请输入案号"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="诉讼状态">
                      <ElInput
                        v-model="confirmationForm.lawsuitStatus"
                        placeholder="请输入诉讼状态"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="诉讼结果">
                      <ElInput
                        v-model="confirmationForm.lawsuitResult"
                        placeholder="请输入诉讼结果"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="诉讼金额">
                      <ElInput
                        v-model="confirmationForm.lawsuitAmount"
                        type="number"
                        placeholder="请输入诉讼金额"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="诉讼备注">
                  <ElInput
                    v-model="confirmationForm.lawsuitNotes"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入诉讼备注"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

            <ElCollapse v-model="confirmationCollapseActive" class="mb-4" @change="handleConfirmationCollapseChange">
              <ElCollapseItem title="最终确认信息" name="final">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="最终确认日期">
                      <ElInput
                        v-model="confirmationForm.finalConfirmationDate"
                        type="datetime-local"
                        placeholder="请选择最终确认日期"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="最终确认依据">
                  <ElInput
                    v-model="confirmationForm.finalConfirmationBasis"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入最终确认依据"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCollapseItem>
            </ElCollapse>

          <div class="section-divider mb-4">
            <h4 class="section-title">附件上传</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <FileUpload
                ref="confirmationUploadRef"
                v-model="confirmationForm.confirmationAttachments"
                :biz-type="'claim'"
                :biz-id="currentClaim?.claimRegistrationId || currentClaim?.id || 0"
                :accept="'.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar'"
                :max-size="50 * 1024 * 1024"
                :multiple="true"
                title="债权确认附件"
                :disabled="false"
                :local-mode="true"
                :existing-files="confirmationExistingFiles"
                @local-files-change="(files) => { confirmationForm.confirmationAttachments = files; }"
              />
            </ElCol>
          </ElRow>
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
            保存
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-confirmation-page {
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
.confirm-dialog-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
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

.amount-detail-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.amount-detail-section .el-table {
  font-size: 13px;
}

.amount-detail-section .el-table .cell {
  padding: 8px 0;
}
</style>
