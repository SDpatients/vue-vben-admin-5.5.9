<script setup lang="ts">
import type { ClaimRegistrationApi } from '#/api/core/claim-registration';

import { computed, onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElAlert,
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
  ElPopconfirm,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCurrentUserApi } from '#/api/core/auth';
import { getCaseReviewStatusApi } from '#/api/core/case';
import {
  createClaimRegistrationApi,
  deleteClaimRegistrationApi,
  getClaimRegistrationDetailApi,
  getClaimRegistrationListApi,
  receiveClaimMaterialApi,
  updateClaimRegistrationStatusApi,
} from '#/api/core/claim-registration';
import { getCreditorListApi } from '#/api/core/creditor';
import { getDebtorListApi } from '#/api/core/debtor';

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

const showAddDialog = ref(false);
const showDetailDialog = ref(false);
const showMaterialDialog = ref(false);
const addLoading = ref(false);
const materialLoading = ref(false);
const currentClaim = ref<ClaimRegistrationApi.ClaimRegistrationInfo | null>(
  null,
);

const materialForm = reactive({
  receiver: '',
  completeness: 'COMPLETE' as ClaimRegistrationApi.MaterialCompleteness,
});

const claimForm = reactive({
  caseNumber: '',
  debtor: '',
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

const fileList = ref<any[]>([]);

const debtorList = ref<any[]>([]);
const creditorList = ref<any[]>([]);
const debtorListLoading = ref(false);
const creditorListLoading = ref(false);

const totalAmount = computed(() => {
  const principal = Number.parseFloat(claimForm.principal) || 0;
  const interest = Number.parseFloat(claimForm.interest) || 0;
  const penalty = Number.parseFloat(claimForm.penalty) || 0;
  const otherLosses = Number.parseFloat(claimForm.otherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
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
    console.log('获取待登记债权列表响应:', response);
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
        material_completeness: item.materialCompleteness,
      }));
      claims.value = formattedList;
      total.value = response.data.total || 0;
      console.log(
        '更新待登记债权列表，数量:',
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

const fetchDebtorList = async () => {
  debtorListLoading.value = true;
  try {
    const response = await getDebtorListApi({
      caseId: Number(props.caseId),
      pageNum: 1,
      pageSize: 100,
    });
    if (response.code === 200 && response.data?.list) {
      debtorList.value = response.data.list.map((debtor: any) => ({
        label: debtor.enterpriseName,
        value: debtor.id,
        caseNumber: debtor.caseNumber,
        caseName: debtor.caseName,
      }));
    }
  } catch (error) {
    console.error('获取债务人列表失败:', error);
  } finally {
    debtorListLoading.value = false;
  }
};

const fetchCreditorList = async (keyword: string = '') => {
  creditorListLoading.value = true;
  try {
    const response = await getCreditorListApi({
      caseId: Number(props.caseId),
      creditorName: keyword || undefined,
      pageNum: 1,
      pageSize: 100,
    });
    if (response.code === 200 && response.data?.list) {
      creditorList.value = response.data.list.map((creditor: any) => ({
        label: creditor.creditorName,
        value: creditor.id,
        creditorType: creditor.creditorType,
        caseNumber: creditor.caseNumber,
        caseName: creditor.caseName,
      }));
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
  } finally {
    creditorListLoading.value = false;
  }
};

const openDetailDialog = async (row: any) => {
  console.log('点击查看详情，row:', row);
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    console.log('获取债权详情响应:', response);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;
      console.log('债权详情数据:', currentClaim.value);
      showDetailDialog.value = true;
      console.log('showDetailDialog设置为true');
    } else {
      console.error('响应code或data异常:', response);
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const openMaterialDialog = async (row: any) => {
  try {
    const response = await getClaimRegistrationDetailApi(row.id);
    if (response.code === 200 && response.data) {
      currentClaim.value = response.data;

      try {
        const userResponse = await getCurrentUserApi();
        if (userResponse.code === 200 && userResponse.data) {
          materialForm.receiver = userResponse.data.realName || '当前用户';
          console.log('获取当前用户信息成功，接收人:', materialForm.receiver);
        } else {
          materialForm.receiver = '当前用户';
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
        materialForm.receiver = '当前用户';
      }

      materialForm.completeness = 'COMPLETE';
      showMaterialDialog.value = true;
    } else {
      ElMessage.error('获取债权详情失败');
    }
  } catch (error) {
    console.error('获取债权详情失败:', error);
    ElMessage.error('获取债权详情失败');
  }
};

const closeMaterialDialog = () => {
  showMaterialDialog.value = false;
  currentClaim.value = null;
  materialForm.receiver = '';
  materialForm.completeness = 'COMPLETE';
};

const handleReceiveMaterial = async () => {
  if (!currentClaim.value) {
    ElMessage.warning('请先选择债权');
    return;
  }

  if (!materialForm.receiver) {
    ElMessage.warning('请输入接收人');
    return;
  }

  materialLoading.value = true;
  try {
    const response = await receiveClaimMaterialApi(currentClaim.value.id, {
      receiver: materialForm.receiver,
      completeness: materialForm.completeness,
    });
    if (response.code === 200) {
      ElMessage.success('接收材料成功');
      await fetchClaims();
      closeMaterialDialog();
    } else {
      ElMessage.error(`接收材料失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('接收材料失败:', error);
    ElMessage.error('接收材料失败');
  } finally {
    materialLoading.value = false;
  }
};

const handleRegisterClaim = async (row: any) => {
  // 添加确认机制
  ElMessageBox.confirm('确定要完成债权申报登记吗？', '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await receiveClaimMaterialApi(row.id, {
          receiver: '当前用户',
          completeness: 'COMPLETE',
        });
        if (response.code === 200) {
          const statusResponse = await updateClaimRegistrationStatusApi(
            row.id,
            'REGISTERED',
          );
          if (statusResponse.code === 200) {
            ElMessage.success('债权申报登记成功');
            await fetchClaims();
          } else {
            ElMessage.error(
              `状态更新失败：${statusResponse.message || '未知错误'}`,
            );
          }
        } else {
          ElMessage.error(`操作失败：${response.message || '未知错误'}`);
        }
      } catch (error) {
        console.error('债权申报登记失败:', error);
        ElMessage.error('债权申报登记失败');
      }
    })
    .catch(() => {
      console.log('用户取消了债权申报登记操作');
      ElMessage.info('已取消债权申报登记');
    });
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

// 新增债权相关方法
const handleCreditorChange = (value: string) => {
  const selectedCreditor = creditorList.value.find(
    (creditor) => creditor.label === value,
  );
  if (selectedCreditor) {
    claimForm.creditorType = selectedCreditor.creditorType;
  }
};

const openAddDialog = async () => {
  showAddDialog.value = true;
  await fetchDebtorList();
  await fetchCreditorList();

  // Fetch current case detail to get caseNumber
  try {
    const caseResponse = await getCaseReviewStatusApi(Number(props.caseId));
    if (caseResponse.code === 200 && caseResponse.data?.caseNumber) {
      claimForm.caseNumber = caseResponse.data.caseNumber;
    }
  } catch (error) {
    console.error('获取案件详情失败:', error);
  }
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  resetForm();
};

const resetForm = () => {
  claimForm.caseNumber = '';
  claimForm.debtor = '';
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

  const calculatedTotalAmount = Number.parseFloat(totalAmount.value) || 0;
  if (calculatedTotalAmount === 0) {
    ElMessage.warning('申报总金额不能为0，请输入有效的金额信息');
    return;
  }

  addLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      caseNumber: claimForm.caseNumber || undefined,
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

    const response = await createClaimRegistrationApi(requestData);
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

const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待登记' },
    REGISTERED: { type: 'success', text: '已登记' },
    REJECTED: { type: 'danger', text: '已驳回' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

const getMaterialCompletenessTag = (completeness: string) => {
  const statusMap: Record<string, any> = {
    COMPLETE: { type: 'success', text: '完整' },
    INCOMPLETE: { type: 'warning', text: '不完整' },
    PENDING: { type: 'info', text: '待补充' },
  };
  return statusMap[completeness] || { type: 'info', text: completeness };
};

defineExpose({
  openAddDialog,
});

onMounted(() => {
  console.log('债权申报登记页面已挂载，props.caseId:', props.caseId);
  fetchClaims();
});
</script>

<template>
  <div class="claim-registration-page">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-text" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权申报登记</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="primary" @click="fetchClaims">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <ElAlert title="说明" type="info" :closable="false" class="mb-4">
        <div>
          <p>本页面展示所有债权申报记录。</p>
          <p>点击"查看详情"可查看债权详细信息。</p>
          <p>点击"接收材料"可记录材料接收情况。</p>
          <p>点击"登记"可将债权状态更新为"已登记"。</p>
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
            prop="material_completeness"
            label="材料完整性"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="
                  getMaterialCompletenessTag(scope.row.material_completeness)
                    .type
                "
                size="small"
              >
                {{
                  getMaterialCompletenessTag(scope.row.material_completeness)
                    .text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
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
          <ElTableColumn label="操作" width="350" fixed="right">
            <template #default="scope">
              <ElButton link size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
              <ElButton
                link
                size="small"
                @click="handleRegisterClaim(scope.row)"
              >
                登记
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
          <ElEmpty description="暂无债权申报信息" />
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
              :type="
                currentClaim.materialCompleteness === 'COMPLETE'
                  ? 'success'
                  : 'warning'
              "
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
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">代理人信息</h4>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="代理人姓名">
            {{ currentClaim.agentName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人电话">
            {{ currentClaim.agentPhone || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人身份证">
            {{ currentClaim.agentIdCard || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="代理人地址">
            {{ currentClaim.agentAddress || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">银行账户信息</h4>
        </div>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="账户名称">
            {{ currentClaim.accountName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="银行账户">
            {{ currentClaim.creditorBankAccount || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="银行名称">
            {{ currentClaim.bankName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="服务地址">
            {{ currentClaim.serviceAddress || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-divider mb-4 mt-4">
          <h4 class="section-title">其他信息</h4>
        </div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="备注">
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
      v-model="showMaterialDialog"
      title="接收申报材料"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentClaim" class="material-dialog-container">
        <ElDescriptions :column="1" border class="mb-4">
          <ElDescriptionsItem label="债权人">
            {{ currentClaim.creditorName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <ElForm label-width="120px">
          <ElFormItem label="接收人" required>
            <ElInput
              v-model="materialForm.receiver"
              placeholder="请输入接收人姓名"
            />
          </ElFormItem>
          <ElFormItem label="材料完整性" required>
            <ElSelect
              v-model="materialForm.completeness"
              placeholder="请选择材料完整性"
              style="width: 100%"
            >
              <ElOption label="完整" value="COMPLETE" />
              <ElOption label="不完整" value="INCOMPLETE" />
              <ElOption label="待补充" value="PENDING" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeMaterialDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleReceiveMaterial"
            :loading="materialLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 新增债权对话框 -->
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
              <ElFormItem label="案号">
                <ElInput
                  v-model="claimForm.caseNumber"
                  placeholder="请输入案号"
                  disabled
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  :loading="debtorListLoading"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="debtor in debtorList"
                    :key="debtor.value"
                    :label="`${debtor.label} (${debtor.caseNumber})`"
                    :value="debtor.label"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称" required>
                <ElSelect
                  v-model="claimForm.creditorName"
                  placeholder="请选择或输入债权人姓名或名称"
                  filterable
                  allow-create
                  :loading="creditorListLoading"
                  @change="handleCreditorChange"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="creditor in creditorList"
                    :key="creditor.value"
                    :label="creditor.label"
                    :value="creditor.label"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人类型" required>
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
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号码">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号码"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人联系地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人联系地址"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
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
                  :model-value="totalAmount"
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
              <ElFormItem label="债权种类" required>
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

          <ElFormItem label="证据清单">
            <ElInput
              v-model="claimForm.evidenceList"
              type="textarea"
              :rows="3"
              placeholder="请输入证据清单"
            />
          </ElFormItem>

          <ElFormItem label="证据材料">
            <ElInput
              v-model="claimForm.evidenceMaterials"
              type="textarea"
              :rows="3"
              placeholder="请输入证据材料"
            />
          </ElFormItem>

          <div class="section-divider mb-4">
            <h4 class="section-title">登记信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="登记日期">
                <ElInput
                  v-model="claimForm.registrationDate"
                  type="datetime-local"
                  placeholder="请选择登记日期"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="登记截止日期">
                <ElInput
                  v-model="claimForm.registrationDeadline"
                  type="datetime-local"
                  placeholder="请选择登记截止日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

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

          <ElFormItem label="备注">
            <ElInput
              v-model="claimForm.remarks"
              type="textarea"
              :rows="3"
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
  </div>
</template>

<style scoped>
.claim-registration-page {
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
.material-dialog-container,
.add-dialog-container {
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
