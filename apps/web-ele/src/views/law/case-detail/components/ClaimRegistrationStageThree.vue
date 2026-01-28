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

import {
  createClaimConfirmationApi,
  finalizeClaimConfirmationApi,
  updateClaimConfirmationApi,
} from '#/api/core/claim-confirmation';
import {
  getClaimRegistrationDetailApi,
  getClaimRegistrationListApi,
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
});

const fetchClaims = async () => {
  loading.value = true;
  try {
    const response = await getClaimRegistrationListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });

    if (response.code === 200 && response.data) {
      claims.value = response.data.list.map((item: any) => ({
        ...item,
        confirmationStatus:
          item.confirmationInfo?.confirmationStatus || 'PENDING',
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

const openConfirmDialog = async (row: any) => {
  currentClaim.value = row;
  showConfirmDialog.value = true;
};

const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
  currentClaim.value = null;
  confirmForm.voteResult = '通过';
  confirmForm.voteNotes = '';
};

const handleConfirmClaim = async () => {
  if (!currentClaim.value) return;

  confirmLoading.value = true;
  try {
    // 检查是否已有确认记录
    let confirmationId: number;

    if (currentClaim.value.confirmationInfo) {
      // 已有确认记录，直接提交表决
      confirmationId = currentClaim.value.confirmationInfo.id;
      await updateClaimConfirmationApi(confirmationId, {
        voteResult:
          confirmForm.voteResult === '通过'
            ? 'AGREE'
            : confirmForm.voteResult === '不通过'
              ? 'DISAGREE'
              : 'ABSTAIN',
        voteNotes: confirmForm.voteNotes,
      });
    } else {
      // 创建新的确认记录
      const createResponse = await createClaimConfirmationApi({
        claimRegistrationId: currentClaim.value.id,
        caseId: currentClaim.value.caseId,
        creditorName: currentClaim.value.creditorName,
        meetingType: 'FIRST',
        voteResult:
          confirmForm.voteResult === '通过'
            ? 'AGREE'
            : confirmForm.voteResult === '不通过'
              ? 'DISAGREE'
              : 'ABSTAIN',
        voteNotes: confirmForm.voteNotes,
        confirmationStatus: 'CONFIRMED',
      });

      if (createResponse.code !== 200) {
        throw new Error(createResponse.message || '创建确认记录失败');
      }

      confirmationId = createResponse.data.confirmationId;
    }

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
          <ElTableColumn label="操作" width="200" fixed="right">
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
              v-if="currentClaim.reviewInfo"
              :type="
                getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion)
                  .type
              "
            >
              {{ 
                getReviewConclusionTag(currentClaim.reviewInfo.reviewConclusion)
                  .text
              }}
            </ElTag>
            <ElTag v-else type="info">
              待审查
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="确认金额">
            {{ currentClaim.reviewInfo?.confirmedTotalAmount || 0 }}
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
