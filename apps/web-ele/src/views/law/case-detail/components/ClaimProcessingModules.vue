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
} from '#/api/core/claim-registration';

import { getClaimReviewsByCaseIdApi } from '#/api/core/claim-review';

const props = defineProps<{
  caseId: string;
  moduleType?: 'registration' | 'review';
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

// Excel导入相关变量
const showImportDialog = ref(false);
const importLoading = ref(false);
const importResult = ref<any>(null);
const showImportErrorDialog = ref(false);

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
        'REGISTERED'
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
                type="success" 
                @click="openImportDialog"
                :loading="importLoading"
              >
                <Icon icon="lucide:file-spreadsheet" class="mr-1" />
                新增
              </ElButton>
              <ElButton 
                type="primary" 
                @click="props.moduleType === 'review' ? fetchReviewClaims() : fetchClaims()"
                :loading="loading"
              >
                <Icon icon="lucide:refresh-cw" class="mr-1" />
                刷新数据
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
                新增
              </ElButton>
              <ElButton 
                type="primary" 
                @click="props.moduleType === 'review' ? fetchReviewClaims() : fetchClaims()"
                :loading="loading"
              >
                <Icon icon="lucide:refresh-cw" class="mr-1" />
                刷新数据
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
