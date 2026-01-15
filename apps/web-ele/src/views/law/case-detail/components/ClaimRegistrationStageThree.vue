<script setup lang="ts">
import type { ClaimConfirmationApi } from '#/api/core/claim-confirmation';
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';

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
  finalizeClaimConfirmationApi,
  submitObjectionApi,
  submitVoteApi,
} from '#/api/core/claim-confirmation';
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
const showConfirmationDialog = ref(false);
const confirmationLoading = ref(false);
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(null);
const currentConfirmation =
  ref<ClaimConfirmationApi.ClaimConfirmationInfo | null>(null);

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

const finalConfirmedAmount = computed(() => {
  if (
    confirmationForm.finalConfirmationBasis === 'COURT' &&
    confirmationForm.courtRulingAmount
  ) {
    return confirmationForm.courtRulingAmount.toFixed(2);
  } else if (confirmationForm.hasLawsuit && confirmationForm.lawsuitAmount) {
    return confirmationForm.lawsuitAmount.toFixed(2);
  } else if (
    confirmationForm.hasObjection &&
    confirmationForm.objectionAmount
  ) {
    return confirmationForm.objectionAmount.toFixed(2);
  } else {
    return Number(confirmationForm.finalConfirmedAmount).toFixed(2);
  }
});

const fetchClaims = async () => {
  console.log('开始获取待确认债权列表，参数:', {
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
    console.log('获取待确认债权列表响应:', response);
    if (response.code === 200 && response.data) {
      const formattedList = (response.data.list || [])
        .filter((item: any) => {
          return (
            item.reviewInfo &&
            item.reviewInfo.reviewStatus === 'COMPLETED' &&
            (!item.confirmationInfo ||
              item.confirmationInfo.confirmationStatus === 'PENDING')
          );
        })
        .map((item: any) => ({
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
          ...(item.confirmationInfo && {
            confirmationInfo: {
              ...item.confirmationInfo,
              confirmation_status: item.confirmationInfo.confirmationStatus,
            },
          }),
        }));
      claims.value = formattedList;
      total.value = formattedList.length;
      console.log(
        '更新待确认债权列表，数量:',
        claims.value.length,
        '总数量:',
        total.value,
      );
    } else {
      ElMessage.error(`获取债权确认列表失败：${response.message || '未知错误'}`);
      claims.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权确认列表失败:', error);
    ElMessage.error('获取债权确认列表失败');
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

const openConfirmationDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      if (response.data.confirmationInfo) {
        Object.assign(confirmationForm, response.data.confirmationInfo);
        console.log('使用现有确认信息填充表单');
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
  currentClaim.value = null;
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

  if (!confirmationForm.voteResult) {
    ElMessage.warning('请选择表决结果');
    return;
  }

  confirmationLoading.value = true;
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
  } finally {
    confirmationLoading.value = false;
  }
};

const handleSubmitObjection = async () => {
  if (!currentClaim.value) return;

  confirmationLoading.value = true;
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
  } finally {
    confirmationLoading.value = false;
  }
};

const handleFinalizeConfirmation = async () => {
  if (!currentClaim.value) return;

  confirmationLoading.value = true;
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
  } finally {
    confirmationLoading.value = false;
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

onMounted(() => {
  console.log('债权确认页面已挂载，props.caseId:', props.caseId);
  fetchClaims();
});
</script>

<template>
  <div class="claim-confirmation-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-check" class="mr-2 text-blue-500" />
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

      <ElAlert
        title="说明"
        type="info"
        :closable="false"
        class="mb-4"
      >
        <div>
          <p>本页面展示所有已审查完成但待确认的债权申报记录。</p>
          <p>点击"查看详情"可查看债权详细信息。</p>
          <p>点击"确认"可进行债权确认操作。</p>
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
              <ElTag v-else type="warning" size="small"> 待确认 </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="250" fixed="right">
            <template #default="scope">
              <ElButton
                link
                type="primary"
                size="small"
                @click="openDetailDialog(scope.row)"
              >
                查看详情
              </ElButton>
              <ElButton
                v-if="
                  !scope.row.confirmationInfo ||
                  scope.row.confirmationInfo.confirmationStatus === 'PENDING'
                "
                link
                type="success"
                size="small"
                @click="openConfirmationDialog(scope.row)"
              >
                确认
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
          <ElEmpty description="暂无待确认的债权申报信息" />
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
              :type="getRegistrationStatusTag(currentClaim.registrationStatus).type"
            >
              {{ getRegistrationStatusTag(currentClaim.registrationStatus).text }}
            </ElTag>
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
      v-model="showConfirmationDialog"
      title="债权确认"
      width="90%"
      destroy-on-close
    >
      <div v-if="currentClaim" class="confirmation-dialog-container">
        <div class="claim-info-section mb-4">
          <h4 class="section-title mb-2">债权基本信息</h4>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="债权人">
              {{ currentClaim.creditorName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="申报总金额">
              {{ currentClaim.totalAmount }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认总金额">
              {{
                currentClaim.reviewInfo
                  ? currentClaim.reviewInfo.confirmedTotalAmount
                  : currentClaim.totalAmount
              }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="confirmation-form-section">
          <h4 class="section-title mb-2">确认信息</h4>
          <ElForm label-width="150px">
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
                    type="datetime-local"
                    placeholder="请选择会议日期"
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
                <ElFormItem label="表决结果" required>
                  <ElSelect
                    v-model="confirmationForm.voteResult"
                    placeholder="请选择表决结果"
                    style="width: 100%"
                  >
                    <ElOption label="通过" value="AGREE" />
                    <ElOption label="不通过" value="DISAGREE" />
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

            <div class="section-divider mb-4">
              <h4 class="section-title">异议处理</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="是否有异议">
                  <ElCheckbox v-model="confirmationForm.hasObjection">是</ElCheckbox>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <template v-if="confirmationForm.hasObjection">
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <ElFormItem label="异议人">
                    <ElInput
                      v-model="confirmationForm.objector"
                      placeholder="请输入异议人"
                    />
                  </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="异议日期">
                      <ElInput
                        v-model="confirmationForm.objectionDate"
                        type="datetime-local"
                        placeholder="请选择异议日期"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
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

                <ElFormItem label="协商结果">
                  <ElInput
                    v-model="confirmationForm.negotiationResult"
                    type="textarea"
                    :rows="2"
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
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="协商参与人">
                      <ElInput
                        v-model="confirmationForm.negotiationParticipants"
                        placeholder="请输入协商参与人"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </template>

            <div class="section-divider mb-4">
              <h4 class="section-title">法院裁定</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="法院裁定文号">
                  <ElInput
                    v-model="confirmationForm.courtRulingNo"
                    placeholder="请输入法院裁定文号"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="法院裁定日期">
                  <ElInput
                    v-model="confirmationForm.courtRulingDate"
                    type="datetime-local"
                    placeholder="请选择法院裁定日期"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="裁定结果">
                  <ElSelect
                    v-model="confirmationForm.courtRulingResult"
                    placeholder="请选择裁定结果"
                    style="width: 100%"
                  >
                    <ElOption label="确认" value="CONFIRMED" />
                    <ElOption label="部分确认" value="PARTIAL_CONFIRMED" />
                    <ElOption label="不予确认" value="UNCONFIRMED" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="裁定金额">
                  <ElInput
                    v-model="confirmationForm.courtRulingAmount"
                    type="number"
                    placeholder="请输入裁定金额"
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
                  <ElCheckbox v-model="confirmationForm.hasLawsuit">是</ElCheckbox>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <template v-if="confirmationForm.hasLawsuit">
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <ElFormItem label="诉讼案号">
                    <ElInput
                      v-model="confirmationForm.lawsuitCaseNo"
                      placeholder="请输入诉讼案号"
                    />
                  </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="诉讼状态">
                      <ElSelect
                        v-model="confirmationForm.lawsuitStatus"
                        placeholder="请选择诉讼状态"
                        style="width: 100%"
                      >
                        <ElOption label="未起诉" value="PENDING" />
                        <ElOption label="进行中" value="TRIALING" />
                        <ElOption label="已判决" value="JUDGED" />
                        <ElOption label="已执行" value="EXECUTING" />
                        <ElOption label="已完成" value="COMPLETED" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="诉讼结果">
                      <ElSelect
                        v-model="confirmationForm.lawsuitResult"
                        placeholder="请选择诉讼结果"
                        style="width: 100%"
                      >
                        <ElOption label="胜诉" value="WIN" />
                        <ElOption label="败诉" value="LOSE" />
                        <ElOption label="部分胜诉" value="PARTIAL" />
                        <ElOption label="和解" value="SETTLED" />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="诉讼金额">
                      <ElInput
                        v-model="confirmationForm.lawsuitAmount"
                        type="number"
                        placeholder="请输入诉讼金额"
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
              </template>

            <div class="section-divider mb-4">
              <h4 class="section-title">最终确认</h4>
            </div>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="最终确认金额">
                  <ElInput
                    v-model="confirmationForm.finalConfirmedAmount"
                    type="number"
                    placeholder="请输入最终确认金额"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="最终确认日期">
                  <ElInput
                    v-model="confirmationForm.finalConfirmationDate"
                    type="datetime-local"
                    placeholder="请选择最终确认日期"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="确认依据">
                  <ElSelect
                    v-model="confirmationForm.finalConfirmationBasis"
                    placeholder="请选择确认依据"
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

            <ElFormItem label="最终确认金额(自动计算)">
              <ElInput
                :model-value="finalConfirmedAmount"
                placeholder="自动计算"
                disabled
              />
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
          <ElButton @click="closeConfirmationDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSubmitVote"
            :loading="confirmationLoading"
          >
            提交表决
          </ElButton>
          <ElButton
            v-if="confirmationForm.hasObjection"
            type="warning"
            @click="handleSubmitObjection"
            :loading="confirmationLoading"
          >
            提交异议
          </ElButton>
          <ElButton
            v-if="!confirmationForm.hasObjection"
            type="success"
            @click="handleFinalizeConfirmation"
            :loading="confirmationLoading"
          >
            最终确认
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-confirmation-page {
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
.confirmation-dialog-container {
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
