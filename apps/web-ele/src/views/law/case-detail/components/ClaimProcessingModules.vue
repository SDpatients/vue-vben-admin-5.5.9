<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
  ElLoading,
  ElDialog,
  ElUpload,
  ElMessage,
} from 'element-plus';

import {
  getClaimRegistrationListApi,
  receiveClaimMaterialApi,
  updateClaimRegistrationStatusApi,
  importClaimRegistrationApi,
  createClaimRegistrationApi,
} from '#/api/core/claim-registration';

import FileUpload from './FileUpload.vue';

import { getClaimReviewsByCaseIdApi } from '#/api/core/claim-review';
import { CaseTaskApi } from '#/api/core/case-tasks';

const props = defineProps<{
  caseId: string;
  moduleType?: 'registration' | 'review';
  taskId?: number;
  taskStatus?: string;
}>();
const { moduleType, taskId, taskStatus } = props;
const emit = defineEmits<{
  (e: 'updateTaskStatus', status: string): void;
}>();
const loading = ref(false);
const claims = ref<any[]>([]);
const reviewClaims = ref<any[]>([]);
const total = ref(0);
const reviewTotal = ref(0);
const currentPage = ref(1);
const reviewCurrentPage = ref(1);
const pageSize = ref(10);

const refreshKey = ref(0);

// 模块完成状态
const registrationModuleCompleted = ref(false);
const reviewModuleCompleted = ref(false);

// Excel导入相关变量
const showImportDialog = ref(false);
const importLoading = ref(false);
const importResult = ref<any>(null);
const showImportErrorDialog = ref(false);

// 新增债权相关变量
const showAddDialog = ref(false);
const addLoading = ref(false);
const importing = ref(false);
const selectedFile = ref<File | null>(null);
const uploadRef = ref<HTMLInputElement | null>(null);
const fileUploadRef = ref<any>(null);

// 债务人列表
const debtorList = ref([
  { label: '债务人1', value: '债务人1' },
  { label: '债务人2', value: '债务人2' },
]);

// 新增债权表单数据
const claimForm = reactive({
  caseId: Number(props.caseId),
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
  principal: 0,
  interest: 0,
  penalty: 0,
  otherLosses: 0,
  totalAmount: 0,
  claimNature: '',
  claimType: '',
  claimFacts: '',
  claimIdentifier: '',
  hasCourtJudgment: false,
  courtJudgmentNo: '',
  judgmentDate: '',
  judgmentAmount: 0,
  remarks: '',
  evidenceAttachments: [] as any[],
});

// 计算申报总金额
const totalAmount = computed(() => {
  return (claimForm.principal || 0) + (claimForm.interest || 0) + (claimForm.penalty || 0) + (claimForm.otherLosses || 0);
});

// 处理Excel导入
const handleImport = async (file: File) => {
  importLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', props.caseId);

    const response = await importClaimRegistrationApi(formData);
    if (response.code === 200) {
      ElMessage.success('Excel导入成功');
      await fetchClaims();
      showImportDialog.value = false;
    } else {
      ElMessage.error(`Excel导入失败: ${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('Excel导入失败:', error);
    ElMessage.error('Excel导入失败');
  } finally {
    importLoading.value = false;
  }
};

// 打开导入对话框
const openImportDialog = () => {
  showImportDialog.value = true;
};

// 关闭导入对话框
const closeImportDialog = () => {
  showImportDialog.value = false;
  importResult.value = null;
};

// 打开新增债权对话框
const openAddDialog = () => {
  // 重置表单
  Object.assign(claimForm, {
    caseId: Number(props.caseId),
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
    principal: 0,
    interest: 0,
    penalty: 0,
    otherLosses: 0,
    claimNature: '',
    claimType: '',
    claimFacts: '',
    claimIdentifier: '',
    hasCourtJudgment: false,
    courtJudgmentNo: '',
    judgmentDate: '',
    judgmentAmount: 0,
    remarks: '',
    evidenceAttachments: [] as any[],
  });
  selectedFile.value = null;
  showAddDialog.value = true;
};

// 关闭新增债权对话框
const closeAddDialog = () => {
  showAddDialog.value = false;
  selectedFile.value = null;
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

// 导入Excel并自动填充
const handleImportExcel = async () => {
  if (!selectedFile.value) return;
  
  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    
    // 调用parse-excel接口
    const response = await requestClient8085.post('/claim-registration/parse-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.code === 200 && response.data) {
      // 根据响应数据自动填充表单
      const data = response.data;
      
      // 填充总金额
      if (data.declaredAmount) {
        claimForm.totalAmount = parseFloat(data.declaredAmount) || 0;
      }
      
      // 填充联系电话
      if (data.contactPhone) {
        claimForm.agentPhone = data.contactPhone;
      }
      
      ElMessage.success('Excel导入成功，已自动填充表单');
    } else {
      ElMessage.error(response.message || 'Excel解析失败');
    }
  } catch (error) {
    console.error('Excel导入失败:', error);
    ElMessage.error('Excel导入失败');
  } finally {
    importing.value = false;
  }
};

// 提交新增债权
const handleAddClaim = async () => {
  // 验证表单
  if (!claimForm.creditorName || !claimForm.creditorType || !claimForm.claimType) {
    ElMessage.error('请填写必填字段');
    return;
  }
  
  addLoading.value = true;
  try {
    const response = await createClaimRegistrationApi({
      caseId: claimForm.caseId,
      caseName: '',
      debtor: claimForm.debtor,
      creditorName: claimForm.creditorName,
      creditorType: claimForm.creditorType,
      creditCode: claimForm.creditCode,
      legalRepresentative: claimForm.legalRepresentative,
      serviceAddress: claimForm.serviceAddress,
      agentName: claimForm.agentName,
      agentPhone: claimForm.agentPhone,
      agentIdCard: claimForm.agentIdCard,
      agentAddress: claimForm.agentAddress,
      accountName: claimForm.accountName,
      creditorBankAccount: claimForm.bankAccount,
      bankName: claimForm.bankName,
      principal: claimForm.principal,
      interest: claimForm.interest,
      penalty: claimForm.penalty,
      otherLosses: claimForm.otherLosses,
      totalAmount: totalAmount.value,
      hasCourtJudgment: claimForm.hasCourtJudgment ? 1 : 0,
      claimNature: claimForm.claimNature,
      claimType: claimForm.claimType,
      claimFacts: claimForm.claimFacts,
      claimIdentifier: claimForm.claimIdentifier,
      remarks: claimForm.remarks,
    });
    
    if (response.code === 200) {
      ElMessage.success('新增债权申报成功');
      closeAddDialog();
      await fetchClaims();
    } else {
      ElMessage.error(response.message || '新增债权申报失败');
    }
  } catch (error) {
    console.error('新增债权申报失败:', error);
    ElMessage.error('新增债权申报失败');
  } finally {
    addLoading.value = false;
  }
};

// 完成审查操作
const handleCompleteReview = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要完成审查吗？', '完成审查', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const claimId = row.claimRegistrationId || row.id;
    const response = await updateClaimRegistrationStatusApi(claimId, 'REVIEW_COMPLETED');
    if (response.code === 200) {
      ElMessage.success('审查完成');
      await fetchClaims();
    } else {
      ElMessage.error(response.message || '审查完成失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成审查失败:', error);
      ElMessage.error('完成审查失败');
    }
  }
};

// 驳回操作
const handleRejectReview = async (row: any) => {
  try {
    const claimId = row.claimRegistrationId || row.id;
    const response = await updateClaimRegistrationStatusApi(claimId, 'REJECTED');
    if (response.code === 200) {
      ElMessage.success('已驳回');
      await fetchClaims();
    } else {
      ElMessage.error(response.message || '驳回失败');
    }
  } catch (error) {
    console.error('驳回失败:', error);
    ElMessage.error('驳回失败');
  }
};

// 标记模块完成
const handleMarkModuleComplete = async (moduleType: 'registration' | 'review') => {
  if (!taskId) {
    ElMessage.warning('任务ID不存在，无法标记完成状态');
    return;
  }
  
  const completed = taskStatus === 'COMPLETED';
  const newStatus = completed ? 'IN_PROGRESS' : 'COMPLETED';
  
  try {
    const response = await CaseTaskApi.updateCaseTask(taskId, {
      status: newStatus,
    });
    
    if (response.code === 200) {
      ElMessage.success(completed ? '已取消完成标记' : '已标记为完成');
      emit('updateTaskStatus', newStatus);
    } else {
      ElMessage.error(response.message || '更新任务状态失败');
    }
  } catch (error) {
    console.error('标记完成失败:', error);
    ElMessage.error('标记完成失败');
  }
};

const fetchClaims = async () => {
  loading.value = true;
  try {
    const response = await getClaimRegistrationListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });
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
    }
  } catch (error) {
    console.error('获取债权数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchReviewClaims = async () => {
  loading.value = true;
  try {
    const response = await getClaimReviewsByCaseIdApi(Number(props.caseId), {
      pageNum: reviewCurrentPage.value,
      pageSize: pageSize.value,
    });
    if (response.code === 200 && response.data) {
      reviewClaims.value = response.data.list || [];
      reviewTotal.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取债权审查数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number, isReview: boolean = false) => {
  if (isReview) {
    reviewCurrentPage.value = page;
    fetchReviewClaims();
  } else {
    currentPage.value = page;
    fetchClaims();
  }
};

const handlePageSizeChange = (size: number, isReview: boolean = false) => {
  pageSize.value = size;
  if (isReview) {
    reviewCurrentPage.value = 1;
    fetchReviewClaims();
  } else {
    currentPage.value = 1;
    fetchClaims();
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

const getReviewConclusionTag = (conclusion: string) => {
  const conclusionMap: Record<string, any> = {
    CONFIRMED: { type: 'success', text: '确认' },
    REJECTED: { type: 'danger', text: '驳回' },
    PARTIAL: { type: 'warning', text: '部分确认' },
  };
  return conclusionMap[conclusion] || { type: 'info', text: conclusion };
};

const handleReceiveMaterial = async (row: any) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在处理...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    const response = await receiveClaimMaterialApi(row.id, {
      receiver: '当前用户',
      completeness: 'COMPLETE',
    });
    if (response.code === 200) {
        const statusResponse = await updateClaimRegistrationStatusApi(
          row.id,
          'REVIEWING'
        );
        if (statusResponse.code === 200) {
          await fetchClaims();
        }
      }
  } catch (error) {
    console.error('接收材料失败:', error);
  } finally {
    loadingInstance.close();
  }
};

const filteredClaimsForRegistration = computed(() => {
  return claims.value;
});

const filteredClaimsForReview = computed(() => {
  return claims.value.filter(item => 
    item.registration_status === 'REGISTERED' && 
    (!item.reviewInfo || item.reviewInfo.reviewStatus !== 'COMPLETED')
  );
});

onMounted(() => {
  if (props.moduleType === 'review') {
    fetchReviewClaims();
  } else {
    fetchClaims();
  }
});

watch(() => props.caseId, () => {
  if (props.moduleType === 'review') {
    reviewCurrentPage.value = 1;
    fetchReviewClaims();
  } else {
    currentPage.value = 1;
    fetchClaims();
  }
});

watch(() => props.moduleType, () => {
  if (props.moduleType === 'review') {
    reviewCurrentPage.value = 1;
    fetchReviewClaims();
  } else {
    currentPage.value = 1;
    fetchClaims();
  }
});
</script>

<template>
  <div class="claim-processing-modules">
    <!-- 接收、登记债权申报模块 -->
    <ElCard v-if="!props.moduleType || props.moduleType === 'registration'" shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:file-text" class="text-primary mr-2" />
              <span class="text-lg font-semibold">接收、登记债权申报</span>
            </div>
            <div class="flex space-x-2">
              <ElButton 
                type="primary" 
                @click="openAddDialog"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增债权
              </ElButton>
              <ElButton 
                type="success" 
                @click="openImportDialog"
                :loading="importLoading"
              >
                <Icon icon="lucide:file-spreadsheet" class="mr-1" />
                导入
              </ElButton>
              <ElButton 
                type="primary" 
                @click="props.moduleType === 'review' ? fetchReviewClaims() : fetchClaims()"
                :loading="loading"
              >
                <Icon icon="lucide:refresh-cw" class="mr-1" />
                刷新数据
              </ElButton>
              <ElButton 
                v-if="moduleType === 'registration' && taskStatus === 'COMPLETED'"
                type="danger" 
                @click="handleMarkModuleComplete('registration')"
                :loading="loading"
              >
                <Icon icon="lucide:rotate-ccw" class="mr-1" />
                撤回
              </ElButton>
              <ElButton 
                v-if="moduleType === 'registration' && taskStatus !== 'COMPLETED'"
                type="success" 
                @click="handleMarkModuleComplete('registration')"
                :loading="loading"
              >
                <Icon icon="lucide:check" class="mr-1" />
                标记完成
              </ElButton>
            </div>
          </div>
      </template>

      <div v-loading="loading" class="module-content">
        <ElTable 
          :data="filteredClaimsForRegistration" 
          border 
          stripe 
          style="width: 100%" 
          class="mb-4"
        >
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
                {{ getRegistrationStatusTag(scope.row.registration_status).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="150" fixed="right">
            <template #default="scope">
              <ElButton 
                type="primary" 
                size="small" 
                @click="handleReceiveMaterial(scope.row)"
                :loading="loading"
              >
                接收登记
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="filteredClaimsForRegistration.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无待登记的债权申报" />
        </div>

        <div v-if="filteredClaimsForRegistration.length > 0" class="pagination-container">
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
      </div>
    </ElCard>

    <!-- 审查申报债权并编制债权表模块 -->
    <ElCard v-if="!props.moduleType || props.moduleType === 'review'" shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
            <div class="flex items-center">
              <Icon icon="lucide:check-square" class="text-primary mr-2" />
              <span class="text-lg font-semibold">审查申报债权并编制债权表</span>
            </div>
            <div class="flex space-x-2">
              <ElButton 
                type="success" 
                @click="openImportDialog"
                :loading="importLoading"
              >
                <Icon icon="lucide:file-spreadsheet" class="mr-1" />
                导入
              </ElButton>
              <ElButton 
                type="primary" 
                @click="props.moduleType === 'review' ? fetchReviewClaims() : fetchClaims()"
                :loading="loading"
              >
                <Icon icon="lucide:refresh-cw" class="mr-1" />
                刷新数据
              </ElButton>
              <ElButton 
                v-if="moduleType === 'review' && taskStatus === 'COMPLETED'"
                type="danger" 
                @click="handleMarkModuleComplete('review')"
                :loading="loading"
              >
                <Icon icon="lucide:rotate-ccw" class="mr-1" />
                撤回
              </ElButton>
              <ElButton 
                v-if="moduleType === 'review' && taskStatus !== 'COMPLETED'"
                type="success" 
                @click="handleMarkModuleComplete('review')"
                :loading="loading"
              >
                <Icon icon="lucide:check" class="mr-1" />
                标记完成
              </ElButton>
            </div>
          </div>
      </template>

      <div v-loading="loading" class="module-content">
        <ElTable 
          :data="reviewClaims" 
          border 
          stripe 
          style="width: 100%" 
          class="mb-4"
        >
          <ElTableColumn
            prop="creditorName"
            label="债权人姓名或名称"
            min-width="180"
          />
          <ElTableColumn prop="declaredPrincipal" label="申报本金" width="120" />
          <ElTableColumn prop="declaredInterest" label="申报利息" width="120" />
          <ElTableColumn prop="declaredTotalAmount" label="申报总金额" width="120" />
          <ElTableColumn prop="confirmedPrincipal" label="确认本金" width="120" />
          <ElTableColumn prop="confirmedInterest" label="确认利息" width="120" />
          <ElTableColumn prop="confirmedTotalAmount" label="确认总金额" width="120" />
          <ElTableColumn
            prop="reviewStatus"
            label="审查状态"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="
                  getReviewStatusTag(scope.row.reviewStatus).type
                "
                size="small"
              >
                {{ getReviewStatusTag(scope.row.reviewStatus).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="reviewConclusion"
            label="审查结论"
            width="100"
          >
            <template #default="scope">
              <ElTag
                :type="
                  getReviewConclusionTag(scope.row.reviewConclusion).type
                "
                size="small"
              >
                {{ getReviewConclusionTag(scope.row.reviewConclusion).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="150" fixed="right">
            <template #default="scope">
              <ElButton 
                type="text" 
                size="small" 
                @click="handleCompleteReview(scope.row)"
                :loading="loading"
                class="text-primary"
              >
                完成审查
              </ElButton>
              <ElButton 
                type="text" 
                size="small" 
                @click="handleRejectReview(scope.row)"
                :loading="loading"
                class="text-danger"
              >
                驳回
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="reviewClaims.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无待审查的债权申报" />
        </div>

        <div v-if="reviewClaims.length > 0" class="pagination-container">
          <ElPagination
            v-model:current-page="reviewCurrentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="reviewTotal"
            @size-change="(size) => handlePageSizeChange(size, true)"
            @current-change="(page) => handlePageChange(page, true)"
          />
        </div>
      </div>
    </ElCard>

    <!-- Excel导入对话框 -->
    <ElDialog
      v-model="showImportDialog"
      title="Excel导入债权申报"
      width="600px"
      destroy-on-close
    >
      <div class="import-dialog-container">
        <div class="template-description mb-4">
          <p class="mb-2 text-sm text-gray-600">
            请上传Excel文件导入债权申报数据：
          </p>
          <div class="template-example rounded bg-gray-50 p-3 text-sm">
            <p class="mb-1 font-semibold">文件格式要求：</p>
            <p class="text-gray-700">
              1. 支持.xlsx、.xls格式
            </p>
            <p class="text-gray-700">
              2. 文件第一行为表头，包含必要字段
            </p>
            <p class="text-gray-700">
              3. 请确保数据格式正确，避免导入失败
            </p>
          </div>
        </div>

        <div class="upload-container">
          <ElUpload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :on-change="(file) => handleImport(file.raw)"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :disabled="importLoading"
          >
            <ElButton type="primary" :loading="importLoading">
              <Icon icon="lucide:upload" class="mr-1" />
              选择Excel文件
            </ElButton>
          </ElUpload>
          <p class="mt-2 text-xs text-gray-500">
            请选择要导入的Excel文件，系统将自动解析并导入数据
          </p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeImportDialog">取消</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 新增债权对话框 -->
    <ElDialog
      v-model="showAddDialog"
      title="新增债权申报"
      width="1200px"
      destroy-on-close
    >
      <div class="add-claim-dialog">
        <div class="excel-upload-section mb-4">
          <ElAlert title="文件导入" type="info" :closable="false" class="mb-2">
            <p>上传Excel文件可自动填充表单字段</p>
          </ElAlert>
          <div class="flex items-center gap-2">
            <input
              ref="uploadRef"
              type="file"
              accept=".xls,.xlsx"
              @change="handleFileChange"
              style="display: none"
            />
            <ElButton @click="uploadRef?.click()">
              <Icon icon="lucide:upload" class="mr-1" />
              选择Excel文件
            </ElButton>
            <ElButton
              type="success"
              @click="handleImportExcel"
              :loading="importing"
              :disabled="!selectedFile"
            >
              <Icon icon="lucide:magic-wand" class="mr-1" />
              导入并自动填充
            </ElButton>
            <span v-if="selectedFile" class="text-sm text-gray-600">
              已选择: {{ selectedFile.name }}
            </span>
          </div>
        </div>

        <ElForm label-width="120px" :model="claimForm">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件编号">
                <ElInput
                  v-model="claimForm.caseNumber"
                  placeholder="请输入案件编号"
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
                  <ElOption
                    v-for="debtor in debtorList"
                    :key="debtor.value"
                    :label="debtor.label"
                    :value="debtor.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称" required>
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人类型" required>
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="自然人" value="自然人" />
                  <ElOption label="法人" value="法人" />
                  <ElOption label="其他组织" value="其他组织" />
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
            <ElCol :span="24">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">代理人信息</h4>
          </div>

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
              <ElFormItem label="代理人身份证号">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">银行账户信息</h4>
          </div>

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
            <ElCol :span="24">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="6">
              <ElFormItem label="本金">
                <ElInput
                  v-model="claimForm.principal"
                  type="number"
                  placeholder="请输入本金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="利息">
                <ElInput
                  v-model="claimForm.interest"
                  type="number"
                  placeholder="请输入利息"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  type="number"
                  placeholder="请输入违约金"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  type="number"
                  placeholder="请输入其他损失"
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
            <h4 class="section-title">债权信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElInput
                  v-model="claimForm.claimNature"
                  placeholder="请输入债权性质"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类" required>
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="担保债权" value="担保债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="债权事实">
                <ElInput
                  v-model="claimForm.claimFacts"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入债权事实"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElInput
                  v-model="claimForm.claimIdentifier"
                  placeholder="请输入债权标识"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="是否有判决书">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决书编号">
                <ElInput
                  v-model="claimForm.courtJudgmentNo"
                  placeholder="请输入判决书编号"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="判决日期">
                <ElInput
                  v-model="claimForm.judgmentDate"
                  type="datetime-local"
                  placeholder="请选择判决日期"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="claimForm.hasCourtJudgment" :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="判决金额">
                <ElInput
                  v-model="claimForm.judgmentAmount"
                  type="number"
                  placeholder="请输入判决金额"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="claimForm.remarks"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">附件上传</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="24">
              <FileUpload
                ref="fileUploadRef"
                v-model="claimForm.evidenceAttachments"
                :biz-type="'claim'"
                :biz-id="0"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                :max-size="50 * 1024 * 1024"
                :multiple="true"
                title="债权申报附件"
                :disabled="false"
                :local-mode="true"
              />
            </ElCol>
          </ElRow>
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
            提交
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-processing-modules {
  width: 100%;
}

.card-header {
  width: 100%;
}

.module-content {
  width: 100%;
}

.empty-state {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Excel导入对话框样式 */
.import-dialog-container {
  max-height: 400px;
  overflow-y: auto;
}

.template-description {
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.template-example {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.template-example p {
  margin: 4px 0;
}

.upload-container {
  margin: 20px 0;
}

.upload-demo {
  margin: 20px 0;
}

/* 新增债权对话框样式 */
.add-claim-dialog {
  max-height: 700px;
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
  margin-bottom: 16px;
}

.excel-upload-section {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1200px) {
  .el-table {
    font-size: 13px;
  }

  .el-table th,
  .el-table td {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .el-table {
    font-size: 12px;
  }

  .el-table th,
  .el-table td {
    padding: 6px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card-header .flex {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
