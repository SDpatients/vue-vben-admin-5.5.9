<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
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
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import FileUpload from './FileUpload.vue';

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

const { confirmationForm, resetConfirmationForm } = useConfirmationForm();

const showDetailDialog = ref(false);
const showConfirmDialog = ref(false);
const confirmLoading = ref(false);
const currentClaim = ref<any>(null);

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
  // 如果有confirmationInfo，则调用确认详情接口
  if (row.confirmationInfo) {
    result = await ClaimService.getConfirmationDetail(row.confirmationInfo.id);
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

const openConfirmDialog = async (row: any) => {
  try {
    // 首先确保状态为 CONFIRMING
    if (row.registration_status !== 'CONFIRMING') {
      const startConfirmResult = await ClaimService.startConfirmation(row.id);
      if (startConfirmResult.success) {
        // 重新获取数据以更新状态
        await fetchClaims();
        // 从重新获取的数据中找到对应的行
        const updatedRow = claims.value.find(item => item.id === row.id);
        if (updatedRow) {
          row = updatedRow;
        }
      } else {
        ElMessage.error('开始确认失败');
        return;
      }
    }

    // 直接使用确认信息或创建新的确认记录
    if (row.confirmationInfo) {
      // 如果有确认信息，获取确认详情
      const result = await ClaimService.getConfirmationDetail(row.confirmationInfo.id);
      if (result.success) {
        // 保持currentClaim的结构与row一致，包含confirmationInfo字段
        currentClaim.value = {
          ...row,
          confirmationInfo: result.data
        };
        
        // 完整填充确认表单数据
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
          hasObjection: result.data.hasObjection || '0',
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
          hasLawsuit: result.data.hasLawsuit || '0',
          lawsuitCaseNo: result.data.lawsuitCaseNo || '',
          lawsuitStatus: result.data.lawsuitStatus || '',
          lawsuitResult: result.data.lawsuitResult || '',
          lawsuitAmount: result.data.lawsuitAmount || 0,
          lawsuitNotes: result.data.lawsuitNotes || '',
          finalConfirmedAmount:
            result.data.finalConfirmedAmount ||
            result.data.confirmedTotalAmount ||
            row.reviewInfo?.confirmedTotalAmount ||
            0,
          finalConfirmationDate: result.data.finalConfirmationDate || '',
          finalConfirmationBasis: result.data.finalConfirmationBasis || '',
          confirmationAttachments: result.data.confirmationAttachments || '',
          remarks: result.data.remarks || '',
        });
      } else {
        ElMessage.error('获取确认详情失败');
        return;
      }
    } else {
      // 没有确认信息，使用基本信息初始化
      currentClaim.value = row;
      
      // 初始化表单数据
      Object.assign(confirmationForm, {
        meetingType: '',
        meetingDate: '',
        meetingLocation: '',
        voteResult: '待定',
        voteNotes: '',
        hasObjection: '0',
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
        hasLawsuit: '0',
        lawsuitCaseNo: '',
        lawsuitStatus: '',
        lawsuitResult: '',
        lawsuitAmount: 0,
        lawsuitNotes: '',
        finalConfirmedAmount:
          row.reviewInfo?.confirmedTotalAmount || row.totalAmount || 0,
        finalConfirmationDate: '',
        finalConfirmationBasis: '',
        confirmationAttachments: '',
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
  resetConfirmationForm();
};

const handleSaveConfirmation = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    const claimId = currentClaim.value.claimRegistrationId || currentClaim.value.id;
  const requestData: any = {
    claimRegistrationId: claimId,
    caseId: currentClaim.value.caseId || currentClaim.value.caseId,
    creditorName: currentClaim.value.creditorName || currentClaim.value.creditorName,
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
    if (currentClaim.value.confirmationInfo) {
      result = await ClaimService.updateConfirmation(
        currentClaim.value.confirmationInfo.id,
        requestData,
      );
    } else {
      result = await ClaimService.createConfirmation(requestData);
    }

    if (result.success) {
      await fetchClaims();
      closeConfirmDialog();
    }
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
      // 先检查是否有确认信息，如果没有，创建一个默认的
      if (!row.confirmationInfo) {
        const requestData: any = {
          claimRegistrationId: claimId,
          caseId: row.caseId,
          creditorName: row.creditorName,
          voteResult: 'AGREE',
          finalConfirmedAmount: row.reviewInfo?.confirmedTotalAmount || row.totalAmount || 0,
        };
        const createResult = await ClaimService.createConfirmation(requestData);
        if (!createResult.success) {
          ElMessage.error('创建确认信息失败');
          return;
        }
      }
      
      // 完成确认状态更新
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
      const requestData: any = {
        claimRegistrationId: claimId,
        caseId: row.caseId,
        creditorName: row.creditorName,
        voteResult: 'DISAGREE',
        voteNotes: '驳回',
      };

      let result;
      if (row.confirmationInfo) {
        result = await ClaimService.updateConfirmation(
          row.confirmationInfo.id,
          requestData,
        );
      } else {
        result = await ClaimService.createConfirmation(requestData);
      }

      if (result.success) {
        const completeResult = await ClaimService.completeConfirmation(claimId);
        if (completeResult.success) {
          await fetchClaims();
        }
      }
    })
    .catch(() => {
      ElMessage.info('已取消驳回操作');
    });
};

onMounted(() => {
  fetchClaims();
});
</script>

<template>
  <div class="claim-confirmation-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-check" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权确认</span>
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
          <ElTableColumn label="申报状态" width="100">
            <template #default="scope">
              <ElTag
                :type="getRegistrationStatusTag(scope.row.registration_status).type"
                size="small"
              >
                {{ getRegistrationStatusTag(scope.row.registration_status).text }}
              </ElTag>
            </template>
          </ElTableColumn>
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
          <ElTableColumn label="审查结论" width="120">
            <template #default="scope">
              <ElTag
                v-if="scope.row.reviewInfo"
                :type="
                  getReviewConclusionTag(scope.row.reviewInfo.reviewConclusion)
                    .type
                "
                size="small"
              >
                {{
                  getReviewConclusionTag(scope.row.reviewInfo.reviewConclusion)
                    .text
                }}
              </ElTag>
              <ElTag v-else type="info" size="small">
                待审查
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
                type="danger"
                size="small"
                @click="handleRejectClaim(scope.row)"
              >
                驳回
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
      title="债权确认详情"
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
          :biz-type="'claim-confirmation'"
          :biz-id="currentClaim.confirmationInfo.id"
          :model-value="[]"
          :disabled="true"
          title="债权确认附件"
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
      title="债权确认"
      width="50%"
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
              {{ currentClaim.totalAmount }}
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
              {{ currentClaim.reviewInfo?.confirmedTotalAmount || 0 }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="confirm-form-section">
          <h4 class="section-title mb-2">确认操作</h4>
          <ElForm label-width="120px" :model="confirmationForm">
            <ElFormItem label="确认金额" required>
              <ElInput
                v-model="confirmationForm.finalConfirmedAmount"
                type="number"
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

            <div class="section-divider mb-4">
              <h4 class="section-title">会议信息</h4>
            </div>
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

            <div class="section-divider mb-4">
              <h4 class="section-title">异议信息</h4>
            </div>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="是否有异议">
                  <ElSelect
                    v-model="confirmationForm.hasObjection"
                    placeholder="请选择是否有异议"
                    style="width: 100%"
                  >
                    <ElOption label="否" value="0" />
                    <ElOption label="是" value="1" />
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

            <div class="section-divider mb-4">
              <h4 class="section-title">协商信息</h4>
            </div>
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

            <div class="section-divider mb-4">
              <h4 class="section-title">法院裁定信息</h4>
            </div>
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

            <div class="section-divider mb-4">
              <h4 class="section-title">诉讼信息</h4>
            </div>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="是否有诉讼">
                  <ElSelect
                    v-model="confirmationForm.hasLawsuit"
                    placeholder="请选择是否有诉讼"
                    style="width: 100%"
                  >
                    <ElOption label="否" value="0" />
                    <ElOption label="是" value="1" />
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

            <div class="section-divider mb-4">
              <h4 class="section-title">最终确认信息</h4>
            </div>
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

          <div class="section-divider mb-4">
            <h4 class="section-title">附件上传</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <FileUpload
                v-model="confirmationForm.confirmationAttachments"
                :biz-type="'claim-confirmation'"
                :biz-id="currentClaim?.confirmationInfo?.id || 0"
                :accept="'.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar'"
                :max-size="50 * 1024 * 1024"
                :multiple="true"
                title="债权确认附件"
                :disabled="false"
              />
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="confirmationForm.remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                />
              </ElFormItem>
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
