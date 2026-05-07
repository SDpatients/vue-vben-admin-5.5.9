<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import {
  deleteCaseApi,
  getCaseListApi,
  getCaseRelatedDataApi,
  getUserCaseListApi,
} from '#/api/core/case';
import { useAuthStore } from '#/store/auth';

import ReviewModal from './components/ReviewModal.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const currentUserId = computed(() => {
  const userId = userStore.userInfo?.userId;
  if (userId) {
    const parsedId = Number.parseInt(userId, 10);
    return parsedId;
  }
  const localStorageUserId = localStorage.getItem('chat_user_id');
  if (localStorageUserId) {
    const parsedId = Number.parseInt(localStorageUserId, 10);
    return parsedId;
  }
  return 0;
});

const caseList = ref<any[]>([]);
const loading = ref(false);
const reviewModalVisible = ref(false);
const currentCase = ref<CaseApi.CaseInfo | undefined>(undefined);
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const relatedData = ref<any>(null);
const currentDeleteCase = ref<any>(null);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

const filterForm = reactive({
  keyword: '',
  caseStatus: '' as string,
  caseProgress: '' as string,
});

const safeCaseList = computed(() =>
  Array.isArray(caseList.value) ? caseList.value : [],
);

const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('ADMIN') || roles.includes('admin') || roles.includes('管理员');
});

const isSuperAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('超级管理员');
});

const canDeleteCase = computed(() => {
  return isAdmin.value || isSuperAdmin.value;
});

const getDefaultTab = () => {
  if (isAdmin.value) {
    return 'allCases';
  }
  return 'myCases';
};

const activeTab = ref(getDefaultTab());

const showAllCasesTab = computed(() => isAdmin.value);

const caseStatusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '进行中', value: 'ONGOING' },
  { label: '报结中', value: 'AWAITING' },
  { label: '已结案', value: 'COMPLETED' },
  { label: '已归档', value: 'ARCHIVED' },
];

const caseProgressOptions = [
  { label: '一、申请与受理', value: 'FIRST' },
  { label: '二、管理人履职与财产接管', value: 'SECOND' },
  { label: '三、债权申报与核查', value: 'THIRD' },
  { label: '四、债权人会议', value: 'FOURTH' },
  { label: '五、重整和解及破产宣告', value: 'FIFTH' },
  { label: '六、财产变价与分配', value: 'SIXTH' },
  { label: '七、程序终结', value: 'SEVENTH' },
];

const hasActiveFilters = computed(() => {
  return !!(
    filterForm.keyword ||
    filterForm.caseStatus ||
    filterForm.caseProgress
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filterForm.keyword) count++;
  if (filterForm.caseStatus) count++;
  if (filterForm.caseProgress) count++;
  return count;
});

const buildQueryParams = (): CaseApi.CaseListQueryParams => {
  const params: CaseApi.CaseListQueryParams = {
    pageNum: pagination.value.page,
    pageSize: pagination.value.pageSize,
  };

  if (filterForm.keyword) params.keyword = filterForm.keyword;
  if (filterForm.caseStatus) params.caseStatus = filterForm.caseStatus as CaseApi.CaseStatus;
  if (filterForm.caseProgress) params.caseProgress = filterForm.caseProgress as CaseApi.CaseProgress;

  return params;
};

const formatTimestamp = (timestamp: number | string | undefined) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const fetchCaseList = async () => {
  loading.value = true;
  try {
    let response;

    if (activeTab.value === 'myCases') {
      if (!currentUserId.value) {
        ElMessage.warning('请先登录以查看您的案件');
        loading.value = false;
        return;
      }
      const userParams: Record<string, any> = {
        pageNum: pagination.value.page,
        pageSize: pagination.value.pageSize,
      };
      if (filterForm.keyword) userParams.caseNumber = filterForm.keyword;
      if (filterForm.caseStatus) userParams.caseStatus = filterForm.caseStatus;
      response = await getUserCaseListApi(currentUserId.value, userParams);
    } else {
      const params = buildQueryParams();
      response = await getCaseListApi(params);
    }

    if (response.code === 200 && response.data) {
      const mappedCases = response.data.list.map((item: any) => {
        const caseProgressMap: Record<string, string> = {
          FIRST: '一、申请与受理',
          SECOND: '二、管理人履职与财产接管',
          THIRD: '三、债权申报与核查',
          FOURTH: '四、债权人会议',
          FIFTH: '五、重整和解及破产宣告',
          SIXTH: '六、财产变价与分配',
          SEVENTH: '七、程序终结',
        };

        const caseStatusMap: Record<string, string> = {
          PENDING: '待处理',
          ONGOING: '进行中',
          AWAITING: '报结中',
          COMPLETED: '已结案',
          ARCHIVED: '已归档',
        };

        const reviewStatusMap: Record<string, string> = {
          PENDING: '待审核',
          APPROVED: '已通过',
          REJECTED: '已驳回',
        };

        const mappedItem = {
          id: item.id,
          案号: item.caseNumber,
          案由: item.caseReason,
          案件名称: item.caseName,
          案件来源: item.caseSource,
          案件进度: caseProgressMap[item.caseProgress] || item.caseProgress,
          受理法院: item.acceptanceCourt,
          主要负责人: item.mainResponsiblePerson,
          管理人: item.designatedInstitution,
          是否简化审: item.isSimplifiedTrial ? '是' : '否',
          承办人员: item.undertakingPersonnel,
          创建者: item.creatorName,
          创建时间: item.createTime,
          修改时间: item.updateTime,
          案件状态: caseStatusMap[item.caseStatus] || item.caseStatus,
          指定法官: item.designatedJudge,
          承办人: item.undertakingPersonnel,
          审核状态: reviewStatusMap[item.reviewStatus] || item.reviewStatus,
          审核时间: item.reviewTime,
          审核意见: item.reviewOpinion,
          审核次数: item.reviewCount,
          立案日期: item.filingDate,
          受理日期: item.acceptanceDate,
          债权申报截止日期: item.debtClaimDeadline,
          备注: item.remarks,
        };

        return mappedItem;
      });

      caseList.value = mappedCases;
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages = Math.ceil(
        pagination.value.itemCount / pagination.value.pageSize,
      );

      if ('pageNum' in response.data && response.data.pageNum) {
        pagination.value.page = response.data.pageNum;
      }
      if ('pageSize' in response.data && response.data.pageSize) {
        pagination.value.pageSize = response.data.pageSize;
      }

      if (mappedCases.length > 0) {
        ElMessage.success(`成功加载 ${mappedCases.length} 条案件记录`);
      }
    } else {
      ElMessage.error(response.message || '获取案件列表失败');
      caseList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch {
    ElMessage.error('获取案件列表失败，请检查网络连接');
    caseList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.page = 1;
  fetchCaseList();
};

const handleReset = () => {
  filterForm.keyword = '';
  filterForm.caseStatus = '';
  filterForm.caseProgress = '';
  pagination.value.page = 1;
  fetchCaseList();
};

const handleTabChange = async (tabName: number | string) => {
  const tabNameStr = String(tabName);
  if (tabNameStr === 'allCases' && !isAdmin.value) {
    ElMessage.warning('您无权查看全部案件');
    activeTab.value = 'myCases';
    return;
  }

  activeTab.value = tabNameStr;
  pagination.value.page = 1;
  loading.value = true;
  try {
    if (tabNameStr === 'myCases') {
      await authStore.fetchCurrentUser();
    }
    await fetchCaseList();
  } catch {
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCaseList();
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCaseList();
};

const handleRefresh = async () => {
  try {
    pagination.value.page = 1;
    await fetchCaseList();
    ElMessage.success('刷新成功');
  } catch (error) {
    console.error('刷新失败:', error);
    ElMessage.error('刷新失败，请重试');
  }
};

onMounted(() => {
  fetchCaseList();
});

const getCaseProgressType = (progress: string) => {
  const progressColorMap: Record<string, string> = {
    'FIRST': 'primary',
    'SECOND': 'success',
    'THIRD': 'warning',
    'FOURTH': 'danger',
    'FIFTH': 'info',
    'SIXTH': 'primary',
    'SEVENTH': 'success',
    '第一阶段': 'primary',
    '第二阶段': 'success',
    '第三阶段': 'warning',
    '第四阶段': 'danger',
    '第五阶段': 'info',
    '第六阶段': 'primary',
    '第七阶段': 'success',
    '一、申请与受理': 'primary',
    '二、管理人履职与财产接管': 'success',
    '三、债权申报与核查': 'warning',
    '四、债权人会议': 'danger',
    '五、重整和解及破产宣告': 'info',
    '六、财产变价与分配': 'primary',
    '七、程序终结': 'success',
    '已结案': 'success',
  };

  return progressColorMap[progress] || 'info';
};

const getCaseStatusType = (status: string) => {
  switch (status) {
    case 'ONGOING':
    case '进行中': {
      return 'primary';
    }
    case 'COMPLETED':
    case '已结案': {
      return 'success';
    }
    case 'ARCHIVED':
    case '已归档': {
      return 'info';
    }
    case 'PENDING':
    case '待处理': {
      return 'info';
    }
    case 'AWAITING':
    case '报结中': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

const getReviewStatusType = (status: string) => {
  switch (status) {
    case '已通过': {
      return 'success';
    }
    case '已驳回': {
      return 'danger';
    }
    case '待审核': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

const router = useRouter();
const viewCaseDetail = (row: any) => {
  if (row.id) {
    router.push(`/law/case-detail/${row.id}`);
  } else {
    ElMessage.warning('案件ID不存在，无法查看详情');
  }
};

const showReviewModal = (row: CaseApi.CaseInfo) => {
  currentCase.value = row;
  reviewModalVisible.value = true;
};

const canReview = () => {
  return false;
};

const showDeleteDialog = async (row: any) => {
  currentDeleteCase.value = row;
  deleteLoading.value = true;
  try {
    const response = await getCaseRelatedDataApi(row.id);
    if (response.code === 200 && response.data) {
      relatedData.value = response.data;
      deleteDialogVisible.value = true;
    } else {
      ElMessage.error(response.message || '获取案件关联数据失败');
    }
  } catch {
    ElMessage.error('获取案件关联数据失败');
  } finally {
    deleteLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!currentDeleteCase.value) return;
  deleteLoading.value = true;
  try {
    const response = await deleteCaseApi(currentDeleteCase.value.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      deleteDialogVisible.value = false;
      relatedData.value = null;
      currentDeleteCase.value = null;
      await fetchCaseList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch {
    ElMessage.error('删除失败');
  } finally {
    deleteLoading.value = false;
  }
};

const cancelDelete = () => {
  deleteDialogVisible.value = false;
  relatedData.value = null;
  currentDeleteCase.value = null;
};
</script>

<template>
  <div class="p-6">
    <ElCard header="案件管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="router.push('/law/case-add')">
              <i class="i-lucide-plus mr-1"></i>
              新增案件
            </ElButton>

            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 标签页切换 -->
      <ElTabs v-model="activeTab" @tab-change="handleTabChange" class="mb-4">
        <ElTabPane label="我的案件" name="myCases">
          <span class="text-sm text-gray-500">仅显示您的案件</span>
        </ElTabPane>
        <ElTabPane v-if="showAllCasesTab" label="全部案件" name="allCases">
          <span class="text-sm text-gray-500">显示所有有权限访问的案件</span>
        </ElTabPane>
      </ElTabs>

      <!-- 筛选条件区域 -->
      <ElCard size="small" class="mb-4 filter-card">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="i-lucide-search text-blue-500"></i>
              <span class="font-medium">筛选条件</span>
              <ElTag v-if="activeFilterCount > 0" type="primary" size="small" round>
                {{ activeFilterCount }} 个条件
              </ElTag>
            </div>
            <div class="flex items-center gap-2">
              <ElButton type="primary" size="small" @click="handleSearch" :loading="loading">
                <i class="i-lucide-search mr-1"></i>
                查询
              </ElButton>
              <ElButton size="small" @click="handleReset">
                <i class="i-lucide-rotate-ccw mr-1"></i>
                重置
              </ElButton>
            </div>
          </div>
        </template>

        <ElForm :model="filterForm" label-width="90px" label-position="right" size="default">
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="关键词搜索">
                <ElInput
                  v-model="filterForm.keyword"
                  placeholder="案号/名称/法院/管理人/负责人/案由/法官/来源"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="案件状态">
                <ElSelect
                  v-model="filterForm.caseStatus"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in caseStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="案件进度">
                <ElSelect
                  v-model="filterForm.caseProgress"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in caseProgressOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCard>

      <!-- 案件列表表格 -->
      <ElCard header="案件列表" size="small">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">案件列表</span>
            <span v-if="hasActiveFilters" class="text-sm text-gray-400">
              已筛选，共 {{ pagination.itemCount }} 条记录
            </span>
          </div>
        </template>
        <div class="table-wrapper">
          <ElTable
            :data="safeCaseList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%' }"
          >
            <template #empty>
              <ElEmpty description="暂无案件数据" />
            </template>
            <!-- 案件ID -->
            <ElTableColumn
              prop="id"
              label="案件ID"
              min-width="100"
              show-overflow-tooltip
            />

            <!-- 案号 -->
            <ElTableColumn

              prop="案号"
              label="案号"
              min-width="180"
              show-overflow-tooltip
            />



            <!-- 案件名称 -->
            <ElTableColumn

              prop="案件名称"
              label="案件名称"
              min-width="180"
              show-overflow-tooltip
            />

            <!-- 案件状态 -->
            <ElTableColumn

              prop="案件状态"
              label="案件状态"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <ElTag :type="getCaseStatusType(row['案件状态'])" size="small">
                  {{ row['案件状态'] || '未设置' }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 案件进度 -->
            <ElTableColumn

              prop="案件进度"
              label="案件进度"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <ElTag
                  :type="getCaseProgressType(row['案件进度'])"
                  size="small"
                >
                  {{ row['案件进度'] || '未设置' }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 案由 -->
            <ElTableColumn

              prop="案由"
              label="案由"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 受理法院 -->
            <ElTableColumn

              prop="受理法院"
              label="受理法院"
              min-width="180"
              show-overflow-tooltip
            />

            <!-- 主要负责人 -->
            <ElTableColumn

              prop="主要负责人"
              label="主要负责人"
              min-width="150"
              show-overflow-tooltip
            />

            <!-- 承办人员 -->
            <ElTableColumn

              prop="承办人员"
              label="承办人员"
              min-width="150"
              show-overflow-tooltip
            />

            <!-- 受理日期 -->
            <ElTableColumn

              prop="受理日期"
              label="受理日期"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['受理日期']) }}
              </template>
            </ElTableColumn>

            <!-- 案件来源 -->
            <ElTableColumn

              prop="案件来源"
              label="案件来源"
              min-width="150"
              show-overflow-tooltip
            />

            <!-- 管理人 -->
            <ElTableColumn

              prop="管理人"
              label="管理人"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 是否简化审 -->
            <ElTableColumn

              prop="是否简化审"
              label="是否简化审"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 立案日期 -->
            <ElTableColumn

              prop="立案日期"
              label="立案日期"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['立案日期']) }}
              </template>
            </ElTableColumn>

            <!-- 备注 -->
            <ElTableColumn

              prop="备注"
              label="备注"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 操作列 -->
            <ElTableColumn label="操作" min-width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="viewCaseDetail(row)"
                  >
                    查看
                  </ElButton>
                  <ElButton
                    v-if="canReview()"
                    type="success"
                    size="small"
                    @click="showReviewModal(row)"
                  >
                    审核
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- 分页组件 -->
        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.itemCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </ElCard>
    </ElCard>

    <!-- 审核弹窗 -->
    <ReviewModal
      v-model:visible="reviewModalVisible"
      :case-data="currentCase"
      @success="fetchCaseList"
    />

    <!-- 删除确认弹窗 -->
    <ElDialog
      v-model="deleteDialogVisible"
      title="确认删除案件"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="relatedData">
        <div class="mb-4">
          <p class="mb-2 text-lg font-semibold">案件基本信息</p>
          <div class="rounded bg-gray-50 p-4">
            <p><strong>案号：</strong>{{ relatedData.caseInfo?.caseNumber }}</p>
            <p>
              <strong>案件名称：</strong>{{ relatedData.caseInfo?.caseName }}
            </p>
            <p>
              <strong>案件状态：</strong>{{ relatedData.caseInfo?.caseStatus }}
            </p>
          </div>
        </div>

        <div class="mb-4">
          <p class="mb-2 text-lg font-semibold text-red-600">关联数据统计</p>
          <p class="mb-4 text-sm text-gray-500">
            删除案件将同时删除以下所有关联数据，此操作不可恢复！
          </p>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="relatedData.approvalData" class="rounded bg-blue-50 p-3">
              <p class="font-medium text-blue-700">审批数据</p>
              <p class="text-sm">
                审批数：{{ relatedData.approvalData.approvalCount }}
              </p>
              <p class="text-sm">
                审批历史：{{ relatedData.approvalData.approvalHistoryCount }}
              </p>
            </div>

            <div v-if="relatedData.processData" class="rounded bg-green-50 p-3">
              <p class="font-medium text-green-700">流程数据</p>
              <p class="text-sm">
                流程阶段：{{ relatedData.processData.processStageCount }}
              </p>
            </div>

            <div
              v-if="relatedData.documentData"
              class="rounded bg-yellow-50 p-3"
            >
              <p class="font-medium text-yellow-700">文档数据</p>
              <p class="text-sm">
                文书送达：{{ relatedData.documentData.documentDeliveryCount }}
              </p>
            </div>

            <div
              v-if="relatedData.archiveData"
              class="rounded bg-purple-50 p-3"
            >
              <p class="font-medium text-purple-700">归档数据</p>
              <p class="text-sm">
                归档记录：{{ relatedData.archiveData.archiveRecordCount }}
              </p>
            </div>

            <div
              v-if="relatedData.announcementData"
              class="rounded bg-orange-50 p-3"
            >
              <p class="font-medium text-orange-700">公告数据</p>
              <p class="text-sm">
                公告数：{{ relatedData.announcementData.announcementCount }}
              </p>
              <p class="text-sm">
                公告查看：{{
                  relatedData.announcementData.announcementViewCount
                }}
              </p>
            </div>

            <div v-if="relatedData.fundData" class="rounded bg-red-50 p-3">
              <p class="font-medium text-red-700">资金数据</p>
              <p class="text-sm">
                资金报销：{{ relatedData.fundData.fundReimbursementCount }}
              </p>
              <p class="text-sm">
                资金流水：{{ relatedData.fundData.fundFlowCount }}
              </p>
              <p class="text-sm">
                操作日志：{{ relatedData.fundData.fundOperationLogCount }}
              </p>
              <p class="text-sm">
                预算：{{ relatedData.fundData.fundBudgetCount }}
              </p>
              <p class="text-sm">
                托管管理：{{ relatedData.fundData.escrowManagementCount }}
              </p>
              <p class="text-sm">
                资金账户：{{ relatedData.fundData.fundAccountCount }}
              </p>
              <p class="text-sm">
                资金审批：{{ relatedData.fundData.fundApprovalCount }}
              </p>
              <p class="text-sm">
                破产费用：{{ relatedData.fundData.bankruptcyExpenseCount }}
              </p>
            </div>

            <div
              v-if="relatedData.distributionData"
              class="rounded bg-indigo-50 p-3"
            >
              <p class="font-medium text-indigo-700">分配数据</p>
              <p class="text-sm">
                分配明细：{{
                  relatedData.distributionData.distributionDetailCount
                }}
              </p>
              <p class="text-sm">
                分配执行：{{
                  relatedData.distributionData.distributionExecutionCount
                }}
              </p>
            </div>

            <div v-if="relatedData.debtData" class="rounded bg-teal-50 p-3">
              <p class="font-medium text-teal-700">债务数据</p>
              <p class="text-sm">
                普通债务：{{ relatedData.debtData.commonDebtCount }}
              </p>
            </div>

            <div v-if="relatedData.claimData" class="rounded bg-cyan-50 p-3">
              <p class="font-medium text-cyan-700">债权数据</p>
              <p class="text-sm">
                债权确认：{{ relatedData.claimData.claimConfirmationCount }}
              </p>
              <p class="text-sm">
                债权人债权：{{ relatedData.claimData.creditorClaimCount }}
              </p>
              <p class="text-sm">
                债权人信息：{{ relatedData.claimData.creditorInfoCount }}
              </p>
              <p class="text-sm">
                债权申报：{{ relatedData.claimData.claimRegistrationCount }}
              </p>
              <p class="text-sm">
                债权审查：{{ relatedData.claimData.claimReviewCount }}
              </p>
            </div>

            <div v-if="relatedData.workData" class="rounded bg-pink-50 p-3">
              <p class="font-medium text-pink-700">工作数据</p>
              <p class="text-sm">
                管理员：{{ relatedData.workData.administratorCount }}
              </p>
              <p class="text-sm">
                工作组：{{ relatedData.workData.workTeamCount }}
              </p>
              <p class="text-sm">
                工作计划：{{ relatedData.workData.workPlanCount }}
              </p>
              <p class="text-sm">
                工作日志：{{ relatedData.workData.workLogCount }}
              </p>
              <p class="text-sm">
                案件进度：{{ relatedData.workData.caseProgressCount }}
              </p>
            </div>

            <div
              v-if="relatedData.enterpriseData"
              class="rounded bg-lime-50 p-3"
            >
              <p class="font-medium text-lime-700">企业数据</p>
              <p class="text-sm">
                债务企业：{{ relatedData.enterpriseData.debtorEnterpriseCount }}
              </p>
            </div>

            <div v-if="relatedData.taskData" class="rounded bg-amber-50 p-3">
              <p class="font-medium text-amber-700">任务数据</p>
              <p class="text-sm">
                案件任务：{{ relatedData.taskData.caseTaskCount }}
              </p>
              <p class="text-sm">
                任务提交：{{ relatedData.taskData.caseTaskSubmissionCount }}
              </p>
            </div>

            <div
              v-if="relatedData.accountData"
              class="rounded bg-emerald-50 p-3"
            >
              <p class="font-medium text-emerald-700">账户数据</p>
              <p class="text-sm">
                银行账户：{{ relatedData.accountData.bankAccountCount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <ElButton @click="cancelDelete">取消</ElButton>
          <ElButton
            type="danger"
            @click="confirmDelete"
            :loading="deleteLoading"
          >
            确认删除
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .p-6 {
    padding: 1rem;
  }

  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: stretch;
  }

  .flex.items-center.space-x-2 {
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
  }

  :deep(.el-table__header-wrapper th) {
    padding: 8px 0;
    font-size: 12px;
  }

  :deep(.el-table__body-wrapper tr) {
    font-size: 11px;
  }

  :deep(.el-table__body-wrapper td) {
    padding: 8px 0;
  }

  :deep(.el-pagination) {
    font-size: 12px;
  }

  :deep(.el-pagination__sizes .el-input__inner) {
    width: 80px;
  }
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  box-shadow: 0 4px 16px 0 rgb(0 0 0 / 15%);
}

:deep(.el-button) {
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 2px 8px rgb(64 158 255 / 30%);
}

:deep(.el-button--info) {
  background-color: #909399;
  border-color: #909399;
}

:deep(.el-button--info:hover) {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}

:deep(.el-table) {
  overflow: hidden;
  border-radius: 6px;
}

:deep(.el-table__header-wrapper th) {
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background-color: #fafafa;
}

:deep(.el-table__body-wrapper tr) {
  font-size: 13px;
  transition: all 0.2s ease;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: #f5f7fa !important;
}

:deep(.el-table__body-wrapper td) {
  padding: 12px 0;
  color: #606266;
}

:deep(.el-tag) {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons .el-button {
  margin: 0;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-card :deep(.el-select) {
  width: 100%;
}
</style>
