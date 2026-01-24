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
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

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

// 模拟数据
const mockClaims = [
  {
    id: 1,
    claimNo: 'CLM2024001',
    caseName: '某某公司破产清算案',
    debtor: '某某公司',
    creditorName: '张三',
    creditorType: '个人',
    creditCode: '123456789012345678',
    principal: 100000,
    interest: 5000,
    penalty: 0,
    otherLosses: 0,
    totalAmount: 105000,
    claimNature: '普通债权',
    claimType: '合同之债',
    registrationStatus: 'REGISTERED',
    reviewInfo: {
      id: 1,
      reviewStatus: 'COMPLETED',
      reviewConclusion: 'CONFIRMED',
      confirmedTotalAmount: 105000,
    },
    confirmationStatus: 'PENDING',
  },
  {
    id: 2,
    claimNo: 'CLM2024002',
    caseName: '某某公司破产清算案',
    debtor: '某某公司',
    creditorName: '李四',
    creditorType: '个人',
    creditCode: '987654321098765432',
    principal: 200000,
    interest: 10000,
    penalty: 2000,
    otherLosses: 0,
    totalAmount: 212000,
    claimNature: '普通债权',
    claimType: '侵权之债',
    registrationStatus: 'REGISTERED',
    reviewInfo: {
      id: 2,
      reviewStatus: 'COMPLETED',
      reviewConclusion: 'PARTIAL_CONFIRMED',
      confirmedTotalAmount: 200000,
    },
    confirmationStatus: 'PENDING',
  },
  {
    id: 3,
    claimNo: 'CLM2024003',
    caseName: '某某公司破产清算案',
    debtor: '某某公司',
    creditorName: '王五',
    creditorType: '企业',
    creditCode: '111122223333444455',
    principal: 500000,
    interest: 25000,
    penalty: 5000,
    otherLosses: 0,
    totalAmount: 530000,
    claimNature: '优先债权',
    claimType: '担保之债',
    registrationStatus: 'REGISTERED',
    reviewInfo: {
      id: 3,
      reviewStatus: 'COMPLETED',
      reviewConclusion: 'CONFIRMED',
      confirmedTotalAmount: 530000,
    },
    confirmationStatus: 'CONFIRMED',
  },
];

const fetchClaims = async () => {
  loading.value = true;
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 使用模拟数据
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    claims.value = mockClaims.slice(startIndex, endIndex);
    total.value = mockClaims.length;
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
  currentClaim.value = row;
  showDetailDialog.value = true;
};

const openConfirmDialog = async (row: any) => {
  currentClaim.value = row;
  showConfirmDialog.value = true;
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
  currentClaim.value = null;
};

const handleConfirmClaim = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 更新模拟数据
    const index = mockClaims.findIndex(claim => claim.id === currentClaim.value.id);
    if (index !== -1) {
      mockClaims[index].confirmationStatus = 'CONFIRMED';
    }
    
    ElMessage.success('债权确认成功');
    await fetchClaims();
    closeConfirmDialog();
  } catch (error) {
    console.error('债权确认失败:', error);
    ElMessage.error('债权确认失败');
  } finally {
    confirmLoading.value = false;
  }
};

const getConfirmationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待确认' },
    CONFIRMED: { type: 'success', text: '已确认' },
    REJECTED: { type: 'danger', text: '已拒绝' },
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
            <Icon icon="lucide:file-check" class="mr-2 text-primary" />
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
          <ElTableColumn prop="reviewInfo.reviewConclusion" label="审查结论" width="120">
            <template #default="scope">
              <ElTag
                :type="getReviewConclusionTag(scope.row.reviewInfo.reviewConclusion).type"
                size="small"
              >
                {{ getReviewConclusionTag(scope.row.reviewInfo.reviewConclusion).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="reviewInfo.confirmedTotalAmount" label="确认金额" width="120" />
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
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElButton
                link
                size="small"
                @click="openDetailDialog(scope.row)"
              >
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
      title="债权详情"
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
          <ElDescriptionsItem label="申报总金额">
            {{ currentClaim.totalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权性质">
            {{ currentClaim.claimNature || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="债权种类">
            {{ currentClaim.claimType }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审查结论">
            <ElTag
              :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).type"
            >
              {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认金额">
            {{ currentClaim.reviewInfo.confirmedTotalAmount }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认状态">
            <ElTag
              :type="getConfirmationStatusTag(currentClaim.confirmationStatus).type"
            >
              {{ getConfirmationStatusTag(currentClaim.confirmationStatus).text }}
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
                :type="getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).type"
              >
                {{ getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion).text }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="确认金额">
              {{ currentClaim.reviewInfo.confirmedTotalAmount }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="confirm-form-section">
          <h4 class="section-title mb-2">确认操作</h4>
          <ElForm label-width="120px">
            <ElFormItem label="确认意见">
              <ElSelect placeholder="请选择确认意见">
                <ElOption label="确认" value="CONFIRMED" />
                <ElOption label="拒绝" value="REJECTED" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="确认备注">
              <ElInput
                type="textarea"
                :rows="3"
                placeholder="请输入确认备注"
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
