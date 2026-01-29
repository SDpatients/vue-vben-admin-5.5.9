<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
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
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  createClaimConfirmationApi,
  finalizeClaimConfirmationApi,
  getClaimConfirmationDetailApi,
  getClaimConfirmationsByCaseIdApi,
  updateClaimConfirmationApi,
} from '#/api/core/claim-confirmation';
import {
  getClaimRegistrationDetailApi,
} from '#/api/core/claim-registration';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const showDetailDialog = ref(false);
const showConfirmDialog = ref(false);
const confirmLoading = ref(false);
const currentClaim = ref<any>(null);

const confirmForm = reactive({
  voteResult: '通过',
  voteNotes: '',
  confirmedAmount: 0,
  meetingType: 'FIRST',
  meetingDate: '',
  meetingLocation: '',
  hasObjection: 0,
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
  hasLawsuit: 0,
  lawsuitCaseNo: '',
  lawsuitStatus: '',
  lawsuitResult: '',
  lawsuitAmount: 0,
  lawsuitNotes: '',
  finalConfirmationDate: '',
  finalConfirmationBasis: '',
  confirmationAttachments: '',
  confirmationStatus: 'CONFIRMED',
  remarks: '',
});

const fetchClaims = async () => {
  loading.value = true;
  try {
    const response = await getClaimConfirmationsByCaseIdApi(Number(props.caseId), {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });

    if (response.code === 200 && response.data) {
      claims.value = response.data.list.map((item: any) => ({
        ...item,
        creditorName: item.creditorName,
        creditorType: item.creditorType || item.creditor_type || '-',
        creditCode: item.creditCode || item.credit_code || '-',
        claimNo: item.claimNo || item.claimRegistrationId,
        principal: item.principal || item.declaredPrincipal || 0,
        totalAmount: item.finalConfirmedAmount || item.confirmedTotalAmount || item.declaredTotalAmount || 0,
        claimNature: item.confirmedClaimNature || item.claimNature || '-',
        claimType: item.claimType || item.claim_type || '-',
        confirmationStatus: item.confirmationStatus || 'PENDING',
        reviewInfo: item.reviewInfo || null,
      }));
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(
        `获取债权确认列表失败：${response.message || '未知错误'}`,
      );
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
    const response = await getClaimConfirmationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      showDetailDialog.value = true;
    } else {
      ElMessage.error('获取确认详情失败');
    }
  } catch (error) {
    console.error('获取确认详情失败:', error);
    ElMessage.error('获取确认详情失败');
  }
};

const openConfirmDialog = async (row: any) => {
  try {
    let response;
    if (row.confirmationInfo) {
      response = await getClaimConfirmationDetailApi(row.confirmationInfo.id);
      console.log('获取确认详情响应:', response);
      if (response.code === 200 && response.data) {
        currentClaim.value = row;
        Object.assign(confirmForm, {
          voteResult: response.data.voteResult === 'AGREE' ? '通过' : response.data.voteResult === 'DISAGREE' ? '不通过' : '待定',
          voteNotes: response.data.voteNotes || '',
          confirmedAmount: response.data.finalConfirmedAmount || response.data.confirmedTotalAmount || row.reviewInfo?.confirmedTotalAmount || 0,
        });
        showConfirmDialog.value = true;
      } else {
        ElMessage.error('获取确认详情失败');
      }
    } else {
      // 没有确认记录，直接使用row数据
      currentClaim.value = row;
      Object.assign(confirmForm, {
        confirmedAmount: row.reviewInfo?.confirmedTotalAmount || row.totalAmount || 0,
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
  confirmForm.voteResult = '通过';
  confirmForm.voteNotes = '';
  confirmForm.confirmedAmount = 0;
  confirmForm.meetingType = 'FIRST';
  confirmForm.meetingDate = '';
  confirmForm.meetingLocation = '';
  confirmForm.hasObjection = 0;
  confirmForm.objector = '';
  confirmForm.objectionReason = '';
  confirmForm.objectionAmount = 0;
  confirmForm.objectionDate = '';
  confirmForm.negotiationResult = '';
  confirmForm.negotiationDate = '';
  confirmForm.negotiationParticipants = '';
  confirmForm.courtRulingDate = '';
  confirmForm.courtRulingNo = '';
  confirmForm.courtRulingResult = '';
  confirmForm.courtRulingAmount = 0;
  confirmForm.courtRulingNotes = '';
  confirmForm.hasLawsuit = 0;
  confirmForm.lawsuitCaseNo = '';
  confirmForm.lawsuitStatus = '';
  confirmForm.lawsuitResult = '';
  confirmForm.lawsuitAmount = 0;
  confirmForm.lawsuitNotes = '';
  confirmForm.finalConfirmationDate = '';
  confirmForm.finalConfirmationBasis = '';
  confirmForm.confirmationAttachments = '';
  confirmForm.confirmationStatus = 'CONFIRMED';
  confirmForm.remarks = '';
};

const handleConfirmClaim = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    // 直接使用 currentClaim.value.id 作为确认记录的 ID
    const confirmationId = currentClaim.value.id;
    
    // 更新确认记录
    await updateClaimConfirmationApi(confirmationId, {
      meetingType: confirmForm.meetingType,
      meetingDate: confirmForm.meetingDate || null,
      meetingLocation: confirmForm.meetingLocation || null,
      voteResult:
        confirmForm.voteResult === '通过'
          ? 'AGREE'
          : confirmForm.voteResult === '不通过'
            ? 'DISAGREE'
            : 'ABSTAIN',
      voteNotes: confirmForm.voteNotes || null,
      hasObjection: confirmForm.hasObjection,
      objector: confirmForm.objector || null,
      objectionReason: confirmForm.objectionReason || null,
      objectionAmount: confirmForm.objectionAmount,
      objectionDate: confirmForm.objectionDate || null,
      negotiationResult: confirmForm.negotiationResult || null,
      negotiationDate: confirmForm.negotiationDate || null,
      negotiationParticipants: confirmForm.negotiationParticipants || null,
      courtRulingDate: confirmForm.courtRulingDate || null,
      courtRulingNo: confirmForm.courtRulingNo || null,
      courtRulingResult: confirmForm.courtRulingResult || null,
      courtRulingAmount: confirmForm.courtRulingAmount,
      courtRulingNotes: confirmForm.courtRulingNotes || null,
      hasLawsuit: confirmForm.hasLawsuit,
      lawsuitCaseNo: confirmForm.lawsuitCaseNo || null,
      lawsuitStatus: confirmForm.lawsuitStatus || null,
      lawsuitResult: confirmForm.lawsuitResult || null,
      lawsuitAmount: confirmForm.lawsuitAmount,
      lawsuitNotes: confirmForm.lawsuitNotes || null,
      finalConfirmedAmount: confirmForm.confirmedAmount,
      finalConfirmationDate: confirmForm.finalConfirmationDate || null,
      finalConfirmationBasis: confirmForm.finalConfirmationBasis || null,
      confirmationAttachments: confirmForm.confirmationAttachments || null,
      confirmationStatus: confirmForm.confirmationStatus,
      remarks: confirmForm.remarks || null,
    });

    // 最终确认债权
    await finalizeClaimConfirmationApi(confirmationId);

    ElMessage.success('债权确认成功');
    await fetchClaims();
    closeConfirmDialog();
  } catch (error: any) {
    console.error('债权确认失败:', error);
    ElMessage.error(error.message || '债权确认失败');
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
      try {
        // 直接使用 row.id 作为确认记录的 ID
        const confirmationId = row.id;
        
        // 更新确认记录为驳回状态
        await updateClaimConfirmationApi(confirmationId, {
          voteResult: 'DISAGREE',
          voteNotes: '驳回',
          confirmationStatus: 'OBJECTION',
        });

        ElMessage.success('债权确认驳回成功');
        await fetchClaims();
      } catch (error) {
        console.error('驳回债权确认失败:', error);
        ElMessage.error('驳回债权确认失败');
      }
    })
    .catch(() => {
      ElMessage.info('已取消驳回操作');
    });
};

const getConfirmationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待确认' },
    CONFIRMED: { type: 'success', text: '已确认' },
    OBJECTION: { type: 'danger', text: '有异议' },
    COURT: { type: 'info', text: '法院裁定中' },
    LAWSUIT: { type: 'warning', text: '诉讼中' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const getReviewConclusionTag = (conclusion: string) => {
  const conclusionMap: Record<string, any> = {
    CONFIRMED: { type: 'success', text: '确认' },
    PARTIAL_CONFIRMED: { type: 'warning', text: '部分确认' },
    UNCONFIRMED: { type: 'danger', text: '不予确认' },
  };
  return conclusionMap[conclusion] || { type: 'info', text: conclusion };
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
                :type="
                  getConfirmationStatusTag(scope.row.confirmationStatus).type
                "
                size="small"
              >
                {{ 
                  getConfirmationStatusTag(scope.row.confirmationStatus).text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="审查结论"
            width="120"
          >
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
          <ElTableColumn
            label="确认金额"
            width="120"
          >
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
          <ElTableColumn label="操作" width="300" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
              <ElButton
                v-if="scope.row.confirmationStatus === 'PENDING'"
                type="primary"
                size="small"
                @click="openConfirmDialog(scope.row)"
              >
                确认
              </ElButton>
              <ElButton
                v-if="scope.row.confirmationStatus === 'PENDING'"
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
              :type="
                getConfirmationStatusTag(currentClaim.confirmationStatus).type
              "
            >
              {{ 
                getConfirmationStatusTag(currentClaim.confirmationStatus).text
              }}
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
          <ElForm label-width="120px" v-model="confirmForm">
            <ElFormItem label="确认金额" required>
              <ElInput
                v-model="confirmForm.confirmedAmount"
                type="number"
                placeholder="请输入确认金额"
                style="width: 100%"
              />
            </ElFormItem>
            <ElFormItem label="表决结果" required>
              <ElSelect
                v-model="confirmForm.voteResult"
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
                v-model="confirmForm.voteNotes"
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
                    v-model="confirmForm.meetingType"
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
                    v-model="confirmForm.meetingDate"
                    type="datetime-local"
                    placeholder="请选择会议日期"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="会议地点">
              <ElInput
                v-model="confirmForm.meetingLocation"
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
                    v-model="confirmForm.hasObjection"
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
                    v-model="confirmForm.objector"
                    placeholder="请输入异议人"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="异议原因">
              <ElInput
                v-model="confirmForm.objectionReason"
                type="textarea"
                :rows="2"
                placeholder="请输入异议原因"
              />
            </ElFormItem>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="异议金额">
                  <ElInput
                    v-model="confirmForm.objectionAmount"
                    type="number"
                    placeholder="请输入异议金额"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="异议日期">
                  <ElInput
                    v-model="confirmForm.objectionDate"
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
                v-model="confirmForm.negotiationResult"
                placeholder="请输入协商结果"
              />
            </ElFormItem>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="协商日期">
                  <ElInput
                    v-model="confirmForm.negotiationDate"
                    type="datetime-local"
                    placeholder="请选择协商日期"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="协商参与人">
                  <ElInput
                    v-model="confirmForm.negotiationParticipants"
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
                    v-model="confirmForm.courtRulingDate"
                    type="datetime-local"
                    placeholder="请选择裁定日期"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="裁定编号">
                  <ElInput
                    v-model="confirmForm.courtRulingNo"
                    placeholder="请输入裁定编号"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="裁定结果">
              <ElInput
                v-model="confirmForm.courtRulingResult"
                placeholder="请输入裁定结果"
              />
            </ElFormItem>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="裁定金额">
                  <ElInput
                    v-model="confirmForm.courtRulingAmount"
                    type="number"
                    placeholder="请输入裁定金额"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="裁定备注">
              <ElInput
                v-model="confirmForm.courtRulingNotes"
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
                    v-model="confirmForm.hasLawsuit"
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
                    v-model="confirmForm.lawsuitCaseNo"
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
                    v-model="confirmForm.lawsuitStatus"
                    placeholder="请输入诉讼状态"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="诉讼结果">
                  <ElInput
                    v-model="confirmForm.lawsuitResult"
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
                    v-model="confirmForm.lawsuitAmount"
                    type="number"
                    placeholder="请输入诉讼金额"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="诉讼备注">
              <ElInput
                v-model="confirmForm.lawsuitNotes"
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
                    v-model="confirmForm.finalConfirmationDate"
                    type="datetime-local"
                    placeholder="请选择最终确认日期"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="最终确认依据">
              <ElInput
                v-model="confirmForm.finalConfirmationBasis"
                type="textarea"
                :rows="2"
                placeholder="请输入最终确认依据"
              />
            </ElFormItem>
            <ElFormItem label="确认附件">
              <ElInput
                v-model="confirmForm.confirmationAttachments"
                placeholder="请输入确认附件"
              />
            </ElFormItem>
            <ElFormItem label="确认状态">
              <ElSelect
                v-model="confirmForm.confirmationStatus"
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
                v-model="confirmForm.remarks"
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
