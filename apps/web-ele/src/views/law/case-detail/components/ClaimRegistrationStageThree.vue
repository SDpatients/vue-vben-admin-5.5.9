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

import { ClaimService } from './services/claimService';
import { useConfirmationForm } from './composables/useClaimForm';
import { useClaimPagination } from './composables/useClaimPagination';
import {
  getConfirmationStatusTag,
  getReviewConclusionTag,
} from './utils/claimStatusMapper';
import { confirmationFormRules } from './utils/claimFormRules';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);

const { currentPage, pageSize, total, handlePageChange, handlePageSizeChange } =
  useClaimPagination();

const { confirmationForm, resetConfirmationForm } = useConfirmationForm();

const showDetailDialog = ref(false);
const showConfirmDialog = ref(false);
const confirmLoading = ref(false);
const currentClaim = ref<any>(null);

const fetchClaims = async () => {
  loading.value = true;
  try {
    const result = await ClaimService.fetchClaimConfirmations(
      Number(props.caseId),
      currentPage.value,
      pageSize.value,
      undefined,
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
  const result = await ClaimService.getConfirmationDetail(row.id);
  if (result.success) {
    currentClaim.value = result.data;
    showDetailDialog.value = true;
  }
};

const openConfirmDialog = async (row: any) => {
  try {
    let result;
    if (row.confirmationInfo) {
      result = await ClaimService.getConfirmationDetail(row.confirmationInfo.id);
      if (result.success) {
        currentClaim.value = row;
        Object.assign(confirmationForm, {
          voteResult:
            result.data.voteResult === 'AGREE'
              ? '通过'
              : result.data.voteResult === 'DISAGREE'
                ? '不通过'
                : '待定',
          voteNotes: result.data.voteNotes || '',
          finalConfirmedAmount:
            result.data.finalConfirmedAmount ||
            result.data.confirmedTotalAmount ||
            row.reviewInfo?.confirmedTotalAmount ||
            0,
        });
        showConfirmDialog.value = true;
      }
    } else {
      currentClaim.value = row;
      Object.assign(confirmationForm, {
        finalConfirmedAmount:
          row.reviewInfo?.confirmedTotalAmount || row.totalAmount || 0,
      });
      showConfirmDialog.value = true;
    }
  } catch (error) {
    console.error('获取确认详情失败:', error);
    ElMessage.error('获取确认详情失败');
  }
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
  currentClaim.value = null;
  resetConfirmationForm();
};

const handleConfirmClaim = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    const confirmationId = currentClaim.value.id;

    await ClaimService.updateConfirmation(confirmationId, {
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
      confirmationStatus: 'CONFIRMED',
      remarks: confirmationForm.remarks || null,
    });

    await fetchClaims();
    closeConfirmDialog();
  } finally {
    confirmLoading.value = false;
  }
};

const handleRejectClaim = async (row: any) => {
  ElMessageBox.confirm('确定要驳回这条债权确认吗？', '驳回确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const confirmationId = row.id;
      await ClaimService.updateConfirmation(confirmationId, {
        voteResult: 'DISAGREE',
        voteNotes: '驳回',
        confirmationStatus: 'OBJECTION',
      });
      await fetchClaims();
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
            <ElButton type="primary" @click="fetchClaims">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">
          <ElTableColumn prop="confirmationStatus" label="确认状态" width="120">
            <template #default="scope">
              <ElTag
                :type="getConfirmationStatusTag(scope.row.confirmationStatus || scope.row.confirmationStatus).type"
                size="small"
              >
                {{ getConfirmationStatusTag(scope.row.confirmationStatus || scope.row.confirmationStatus).text }}
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
              {{ scope.row.reviewInfo?.confirmedTotalAmount || 0 }}
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
          <ElTableColumn label="操作" width="350" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
              <ElButton
                v-if="
                  scope.row.confirmationStatus === 'PENDING' ||
                  scope.row.confirmationStatus === 'IN_PROGRESS'
                "
                type="primary"
                size="small"
                @click="openConfirmDialog(scope.row)"
              >
                确认
              </ElButton>
              <ElButton
                v-if="
                  scope.row.confirmationStatus === 'PENDING' ||
                  scope.row.confirmationStatus === 'IN_PROGRESS'
                "
                type="danger"
                size="small"
                @click="handleRejectClaim(scope.row)"
              >
                驳回
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
          <ElDescriptionsItem label="确认ID">
            {{ currentClaim.id }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权登记ID">
            {{ currentClaim.claimRegistrationId }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="案件ID">
            {{ currentClaim.caseId }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="会议类型">
            {{ currentClaim.meetingType || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="会议日期">
            {{ currentClaim.meetingDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="会议地点">
            {{ currentClaim.meetingLocation || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="表决结果">
            {{ currentClaim.voteResult || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="表决说明">
            {{ currentClaim.voteNotes || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有异议">
            {{ currentClaim.hasObjection ? '是' : '否' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议人">
            {{ currentClaim.objector || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议原因">
            {{ currentClaim.objectionReason || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议金额">
            {{ currentClaim.objectionAmount || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="异议日期">
            {{ currentClaim.objectionDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否有诉讼">
            {{ currentClaim.hasLawsuit ? '是' : '否' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="诉讼案号">
            {{ currentClaim.lawsuitCaseNo || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认金额">
            {{ currentClaim.finalConfirmedAmount || 0 }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认日期">
            {{ currentClaim.finalConfirmationDate || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最终确认依据">
            {{ currentClaim.finalConfirmationBasis || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认状态">
            <ElTag
              :type="getConfirmationStatusTag(currentClaim.confirmationStatus).type"
            >
              {{ getConfirmationStatusTag(currentClaim.confirmationStatus).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="备注">
            {{ currentClaim.remarks || '-' }}
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
      v-model="showConfirmDialog"
      title="债权确认"
      width="600px"
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
              />
            </ElFormItem>
            <ElFormItem label="确认附件">
              <ElInput
                v-model="confirmationForm.confirmationAttachments"
                placeholder="请输入确认附件"
              />
            </ElFormItem>
            <ElFormItem label="确认状态">
              <ElSelect
                v-model="confirmationForm.confirmationStatus"
                placeholder="请选择确认状态"
                style="width: 100%"
              >
                <ElOption label="待确认" value="PENDING" />
                <ElOption label="已确认" value="CONFIRMED" />
                <ElOption label="有异议" value="OBJECTION" />
                <ElOption label="法院裁定中" value="COURT" />
                <ElOption label="诉讼中" value="LAWSUIT" />
              </ElSelect>
            </ElFormItem>
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
            @click="handleConfirmClaim"
            :loading="confirmLoading"
          >
            确认
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
</style>
