<script setup lang="ts">
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';
import type { ClaimReviewApi } from '#/api/core/claim-review';

import { computed, onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
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

import { getClaimRegistrationDetailApi } from '#/api/core/claim-registration';

import { useReviewForm } from './composables/useClaimForm';
import { useClaimPagination } from './composables/useClaimPagination';
import { ClaimService } from './services/claimService';
import {
  getRegistrationStatusTag,
  getReviewConclusionTag,
  getReviewStatusTag,
} from './utils/claimStatusMapper';
import { reviewFormRules } from './utils/claimFormRules';

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);

const showDetailDialog = ref(false);
const showReviewDialog = ref(false);
const reviewLoading = ref(false);
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(null);
const currentReview = ref<ClaimReviewApi.ClaimReviewInfo | null>(null);

const { reviewForm, declaredTotalAmount, confirmedTotalAmount, unconfirmedTotalAmount, resetReviewForm } = useReviewForm();
const { currentPage, pageSize, total, handlePageChange, handlePageSizeChange } = useClaimPagination();

const fetchClaims = async () => {
  loading.value = true;
  const result = await ClaimService.fetchClaims(
    Number(props.caseId),
    currentPage.value,
    pageSize.value,
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
  const result = await ClaimService.getClaimDetail(row.id);
  if (result.success) {
    currentClaim.value = result.data;
    showDetailDialog.value = true;
  }
};

const openReviewDialog = async (row: any) => {
  let response;
  try {
    if (row.reviewInfo) {
      const result = await ClaimService.getReviewDetail(row.reviewInfo.id);
      if (result.success) {
        response = result.data;
        currentClaim.value = row;
        Object.assign(reviewForm, result.data);
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
};

const handleSaveReview = async () => {
  if (!currentClaim.value) return;

  if (!reviewForm.reviewConclusion) {
    ElMessage.warning('请选择审查结论');
    return;
  }

  reviewLoading.value = true;
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
  if (currentClaim.value.reviewInfo) {
    result = await ClaimService.updateReview(currentClaim.value.reviewInfo.id, requestData);
  } else {
    result = await ClaimService.createReview(requestData);
  }

  try {
    if (result.success) {
      await fetchClaims();
      closeReviewDialog();
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
      const result = await ClaimService.startReview(row.id);
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
      const result = await ClaimService.completeReview(row.id);
      if (result.success) {
        await fetchClaims();
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleRejectReview = async (row: any) => {
  ElMessageBox.confirm('确定要驳回这条债权审查吗？', '驳回确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const requestData: ClaimReviewApi.CreateClaimReviewRequest = {
        claimRegistrationId: row.id,
        caseId: row.caseId,
        creditorName: row.creditorName,
        reviewConclusion: 'UNCONFIRMED' as ClaimReviewApi.ReviewConclusion,
      };

      let result;
      if (row.reviewInfo) {
        result = await ClaimService.updateReview(row.reviewInfo.id, requestData);
      } else {
        result = await ClaimService.createReview(requestData);
      }

      if (result.success) {
        const completeResult = await ClaimService.completeReview(row.id);
        if (completeResult.success) {
          await fetchClaims();
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
      const result = await ClaimService.startConfirmation(row.id);
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

onMounted(() => {
  fetchClaims();
});
</script>

<template>
  <div class="claim-review-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-search" class="mr-2 text-primary" />
            <span class="text-lg font-semibold">债权审查</span>
          </div>
          <div class="flex space-x-2">
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
            label="申报状态"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="getRegistrationStatusTag(scope.row.registration_status).type"
                size="small"
              >
                {{ getRegistrationStatusTag(scope.row.registration_status).text }}
              </ElTag>
            </template>
          </ElTableColumn>
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
                  scope.row.registration_status === 'REVIEW_COMPLETED'
                "
                link
                size="small"
                type="primary"
                @click="handleStartConfirmation(scope.row)"
              >
                开始确认
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
          <ElEmpty description="暂无待审查的债权申报信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showDetailDialog"
      title="债权申报详情"
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
            {{ currentClaim.reviewInfo.reviewRound }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审查依据">
            {{ currentClaim.reviewInfo.reviewBasis || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认本金">
            {{ currentClaim.reviewInfo.confirmedPrincipal }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认利息">
            {{ currentClaim.reviewInfo.confirmedInterest }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认罚金">
            {{ currentClaim.reviewInfo.confirmedPenalty }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认其他损失">
            {{ currentClaim.reviewInfo.confirmedOtherLosses }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认总金额">
            {{ currentClaim.reviewInfo.confirmedTotalAmount || 0 }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审查结论">
            <ElTag
              :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).type"
            >
              {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审查摘要" :span="2">
            {{ currentClaim.reviewInfo.reviewSummary || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showDetailDialog = false">关闭</ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showReviewDialog"
      title="债权审查"
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
              {{ currentClaim.totalAmount }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="review-form-section">
          <h4 class="section-title mb-2">审查信息</h4>
          <ElForm label-width="150px" :rules="reviewFormRules">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="审查日期" prop="reviewDate">
                  <ElInput
                    v-model="reviewForm.reviewDate"
                    type="datetime-local"
                    placeholder="请选择审查日期"
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
                    placeholder="未确认本金"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认利息">
                  <ElInput
                    v-model="reviewForm.unconfirmedInterest"
                    type="number"
                    placeholder="未确认利息"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认违约金">
                  <ElInput
                    v-model="reviewForm.unconfirmedPenalty"
                    type="number"
                    placeholder="未确认违约金"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="未确认其他损失">
                  <ElInput
                    v-model="reviewForm.unconfirmedOtherLosses"
                    type="number"
                    placeholder="未确认其他损失"
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

            <div class="section-divider mb-4">
              <h4 class="section-title">调整原因</h4>
            </div>

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

            <div class="section-divider mb-4">
              <h4 class="section-title">证据评估</h4>
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

            <div class="section-divider mb-4">
              <h4 class="section-title">债权性质确认</h4>
            </div>

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

            <div class="section-divider mb-4">
              <h4 class="section-title">担保信息</h4>
            </div>

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
.review-dialog-container {
  max-height: 600px;
  overflow-y: auto;
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
</style>
