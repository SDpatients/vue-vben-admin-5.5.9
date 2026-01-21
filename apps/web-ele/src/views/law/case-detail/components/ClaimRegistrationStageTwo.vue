<script setup lang="ts">
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
  ElRadioGroup,
  ElRadioButton,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  createClaimReviewApi,
  submitClaimReviewApi,
} from '#/api/core/claim-review';
import {
  getClaimRegistrationDetailApi,
  getClaimRegistrationListApi,
} from '#/api/core/claim-registration';

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const showDetailDialog = ref(false);
const showReviewDialog = ref(false);
const reviewLoading = ref(false);
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(null);
const currentReview = ref<ClaimReviewApi.ClaimReviewInfo | null>(null);

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

const fetchClaims = async () => {
  console.log('开始获取待审查债权列表，参数:', {
    caseId: Number(props.caseId),
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    registrationStatus: 'REGISTERED',
  });
  loading.value = true;
  try {
    const response = await getClaimRegistrationListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      registrationStatus: 'REGISTERED',
    });
    console.log('获取待审查债权列表响应:', response);
    if (response.code === 200 && response.data) {
      const formattedList = (response.data.list || []).map((item: any) => ({
        ...item,
        creditor_name: item.creditorName,
        creditor_type: item.creditorType,
        credit_code: item.creditCode,
        total_amount: item.totalAmount,
        claim_nature: item.claimNature,
        claim_type: item.claimType,
        registration_status: item.registrationStatus,
        ...(item.reviewInfo && {
          reviewInfo: {
            ...item.reviewInfo,
            review_status: item.reviewInfo.reviewStatus,
            review_conclusion: item.reviewInfo.reviewConclusion,
          },
        }),
      }));
      claims.value = formattedList;
      total.value = response.data.total || 0;
      console.log(
        '更新待审查债权列表，数量:',
        claims.value.length,
        '总数量:',
        total.value,
      );
    } else {
      ElMessage.error(`获取债权审查列表失败：${response.message || '未知错误'}`);
      claims.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权审查列表失败:', error);
    ElMessage.error('获取债权审查列表失败');
    claims.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
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

const openDetailDialog = async (row: any) => {
  console.log('[ClaimRegistrationStageTwo] 打开详情对话框，行数据:', row);
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('[ClaimRegistrationStageTwo] 获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      console.log('[ClaimRegistrationStageTwo] 设置 currentClaim:', response.data);
      currentClaim.value = response.data;
      showDetailDialog.value = true;
    } else {
      console.error('[ClaimRegistrationStageTwo] 获取债权详情失败:', response.message);
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('[ClaimRegistrationStageTwo] 获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const openReviewDialog = async (row: any) => {
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
  currentClaim.value = null;
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

  if (!reviewForm.reviewConclusion) {
    ElMessage.warning('请选择审查结论');
    return;
  }

  reviewLoading.value = true;
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
  } finally {
    reviewLoading.value = false;
  }
};

const handleSubmitReview = async () => {
  if (!currentClaim.value || !currentClaim.value.reviewInfo) return;

  reviewLoading.value = true;
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
  } finally {
    reviewLoading.value = false;
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

onMounted(() => {
  console.log('债权审查页面已挂载，props.caseId:', props.caseId);
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
          <p>本页面展示所有已登记但待审查的债权申报记录。</p>
          <p>点击"查看详情"可查看债权详细信息。</p>
          <p>点击"审查"可进行债权审查操作。</p>
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
              <ElTag v-else type="warning" size="small"> 待审查 </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="250" fixed="right">
            <template #default="scope">
              <ElButton
                link
                size="small"
                @click="openDetailDialog(scope.row)"
              >
                查看详情
              </ElButton>
              <ElButton
                v-if="
                  !scope.row.reviewInfo ||
                  scope.row.reviewInfo.reviewStatus === 'PENDING'
                "
                link
                size="small"
                @click="openReviewDialog(scope.row)"
              >
                审查
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
          <ElDescriptionsItem label="证据清单" :span="2">
            {{ currentClaim.evidenceList || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="证据材料" :span="2">
            {{ currentClaim.evidenceMaterials || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="证据附件" :span="2">
            {{ currentClaim.evidenceAttachments || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有法院判决">
            <ElTag :type="currentClaim.hasCourtJudgment ? 'success' : 'info'">
              {{ currentClaim.hasCourtJudgment ? '是' : '否' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有执行">
            <ElTag :type="currentClaim.hasExecution ? 'success' : 'info'">
              {{ currentClaim.hasExecution ? '是' : '否' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有担保">
            <ElTag :type="currentClaim.hasCollateral ? 'success' : 'info'">
              {{ currentClaim.hasCollateral ? '是' : '否' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记状态">
            <ElTag :type="getRegistrationStatusTag(currentClaim.registrationStatus).type">
              {{ getRegistrationStatusTag(currentClaim.registrationStatus).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记日期">
            {{ currentClaim.registrationDate }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="登记截止日期">
            {{ currentClaim.registrationDeadline || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料接收人">
            {{ currentClaim.materialReceiver }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料接收日期">
            {{ currentClaim.materialReceiveDate }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="材料完整性">
            <ElTag
              :type="currentClaim.materialCompleteness === 'COMPLETE' ? 'success' : 'warning'"
            >
              {{
                currentClaim.materialCompleteness === 'COMPLETE'
                  ? '完整'
                  : currentClaim.materialCompleteness === 'INCOMPLETE'
                    ? '不完整'
                    : '待补充'
              }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="备注" :span="2">
            {{ currentClaim.remarks || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">
            {{ currentClaim.createTime }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">
            {{ currentClaim.updateTime }}
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
          <ElForm label-width="150px">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="审查日期">
                  <ElInput
                    v-model="reviewForm.reviewDate"
                    type="datetime-local"
                    placeholder="请选择审查日期"
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
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报利息">
                  <ElInput
                    v-model="reviewForm.declaredInterest"
                    type="number"
                    placeholder="申报利息"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报违约金">
                  <ElInput
                    v-model="reviewForm.declaredPenalty"
                    type="number"
                    placeholder="申报违约金"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="申报其他损失">
                  <ElInput
                    v-model="reviewForm.declaredOtherLosses"
                    type="number"
                    placeholder="申报其他损失"
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
                <ElFormItem label="审查结论" required>
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
          <ElButton
            v-if="currentClaim?.reviewInfo"
            type="success"
            @click="handleSubmitReview"
            :loading="reviewLoading"
          >
            提交
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-review-page {
  padding: 20px;
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
