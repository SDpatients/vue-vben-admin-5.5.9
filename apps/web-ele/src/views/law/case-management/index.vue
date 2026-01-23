<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElMessage,
  ElPagination,
  ElPopover,
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

// 响应式数据
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

// 确保表格数据始终为数组
const safeCaseList = computed(() =>
  Array.isArray(caseList.value) ? caseList.value : [],
);

// 判断用户是否为管理员
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

// 根据角色确定默认标签页
const getDefaultTab = () => {
  if (isAdmin.value) {
    return 'allCases';
  }
  return 'myCases';
};

// 标签页控制
const activeTab = ref(getDefaultTab());

// 判断是否显示全部案件标签页
const showAllCasesTab = computed(() => isAdmin.value);

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '案号',
  '案由',
  '案件名称',
  '案件来源',
  '案件进度',
  '受理法院',
  '主要负责人',
  '承办人员',
  '创建时间',
  '修改者',
  '修改时间',
  '管理人',
  '是否简化审',
  '立案日期',
  '文件上传',
  '备注',
  '案件状态',
  '审核状态',
  '审核时间',
  '审核意见',
  '审核次数',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '创建时间',
  '承办人员',
  '案件名称',
  '案件进度',
  '案号',
  '管理人',
]);

// 检查列是否可见（用于表格列的 v-if）
const isColumnVisible = (columnName: string) => {
  return columnVisible.value.includes(columnName);
};

// 初始化列显示状态
const initColumnVisibility = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
};

// 格式化时间戳
const formatTimestamp = (timestamp: number | undefined) => {
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

// 获取案件列表
const fetchCaseList = async () => {
  loading.value = true;
  try {
    let response;

    if (activeTab.value === 'myCases') {
      // 获取我的案件
      if (!currentUserId.value) {
        ElMessage.warning('请先登录以查看您的案件');
        loading.value = false;
        return;
      }
      response = await getUserCaseListApi(currentUserId.value, {
        pageNum: pagination.value.page,
        pageSize: pagination.value.pageSize,
      });
    } else {
      // 获取全部案件（有权限的）
      const params: CaseApi.CaseListQueryParams = {
        pageNum: pagination.value.page,
        pageSize: pagination.value.pageSize,
      };
      response = await getCaseListApi(params);
    }

    // 适配新的API响应格式
    if (response.code === 200 && response.data) {
      // 将API返回的英文字段映射为表格期望的中文prop名称
      const mappedCases = response.data.list.map((item: any) => {
        // 映射案件进度
        const caseProgressMap: Record<string, string> = {
          FIRST: '第一阶段',
          SECOND: '第二阶段',
          THIRD: '第三阶段',
          FOURTH: '第四阶段',
          FIFTH: '第五阶段',
          SIXTH: '第六阶段',
          SEVENTH: '第七阶段',
        };

        // 映射案件状态
        const caseStatusMap: Record<string, string> = {
          PENDING: '待处理',
          ONGOING: '在办',
          AWAITING: '报结',
          IN_PROGRESS: '进行中',
          COMPLETED: '已结',
          CLOSED: '已结案',
          TERMINATED: '已终结',
          ARCHIVED: '已归档',
        };

        // 映射审核状态
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

      // 更新分页信息，使用 API 返回的值
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

// 处理标签页切换
const handleTabChange = async (tabName: number | string) => {
  const tabNameStr = String(tabName);
  // 如果不是管理员且尝试访问全部案件，强制切换到我的案件
  if (tabNameStr === 'allCases' && !isAdmin.value) {
    ElMessage.warning('您无权查看全部案件');
    activeTab.value = 'myCases';
    return;
  }

  activeTab.value = tabNameStr;
  pagination.value.page = 1;
  loading.value = true;
  try {
    // 当切换到我的案件时，先尝试获取用户信息
    if (tabNameStr === 'myCases') {
      await authStore.fetchCurrentUser();
    }
    await fetchCaseList();
  } catch {
    // 忽略错误，UI已显示loading状态
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCaseList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCaseList();
};

// 刷新案件列表
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

// 页面加载时获取数据
onMounted(() => {
  initColumnVisibility();
  fetchCaseList();
});

// 重置列显示状态
const resetColumns = () => {
  initColumnVisibility();
  ElMessage.success('已重置为默认列显示');
};

// 显示所有列
const showAllColumns = () => {
  columnVisible.value = [...availableColumns];
  ElMessage.success('已显示所有列');
};

// 隐藏所有非核心列
const hideNonCoreColumns = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
  ElMessage.success('已隐藏非核心列');
};

// 获取案件进度标签类型
const getCaseProgressType = (progress: string) => {
  switch (progress) {
    case 'FIFTH':
    case 'FOURTH':
    case 'SECOND':
    case 'SEVENTH':
    case 'SIXTH':
    case 'THIRD':
    case '第一阶段':
    case '第七阶段':
    case '第三阶段':
    case '第二阶段':
    case '第五阶段':
    case '第六阶段':
    case '第四阶段': {
      return 'primary';
    }
    case '已结案': {
      return 'success';
    }
    default: {
      return 'info';
    }
  }
};

// 获取案件状态标签类型
const getCaseStatusType = (status: string) => {
  switch (status) {
    case 'ONGOING':
    case '进行中':
    case '在办': {
      return 'primary';
    }
    case '已完成':
    case 'COMPLETED':
    case '已结': {
      return 'success';
    }
    case '已归档': {
      return 'info';
    }
    case '已终结': {
      return 'warning';
    }
    case '已结案': {
      return 'success';
    }
    case '待处理': {
      return 'info';
    }
    case 'AWAITING':
    case '报结': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

// 获取审核状态标签类型
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

// 查看案件详情
const router = useRouter();
const viewCaseDetail = (row: any) => {
  if (row.id) {
    router.push(`/law/case-detail/${row.id}`);
  } else {
    ElMessage.warning('案件ID不存在，无法查看详情');
  }
};

// 显示审核弹窗
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
            <ElDropdown trigger="click">
              <ElButton type="info" size="small">
                <i class="i-lucide-settings mr-1"></i>
                列设置
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="showAllColumns">
                    显示所有列
                  </ElDropdownItem>
                  <ElDropdownItem @click="hideNonCoreColumns">
                    仅显示核心列
                  </ElDropdownItem>
                  <ElDropdownItem @click="resetColumns">
                    重置为默认
                  </ElDropdownItem>
                  <ElDropdownItem divided>
                    <ElPopover
                      placement="right"
                      width="300"
                      trigger="click"
                      title="自定义列显示"
                    >
                      <template #reference>
                        <span>自定义列显示</span>
                      </template>
                      <div class="space-y-3">
                        <div class="mb-2 flex items-center justify-between">
                          <div class="text-sm font-medium text-gray-700">
                            选择要显示的列：
                          </div>
                          <div class="flex space-x-2">
                            <ElButton
                              size="small"
                              link
                              @click="columnVisible = [...availableColumns]"
                            >
                              全选
                            </ElButton>
                            <ElButton
                              size="small"
                              link
                              @click="columnVisible = []"
                            >
                              取消全选
                            </ElButton>
                          </div>
                        </div>
                        <ElCheckboxGroup v-model="columnVisible">
                          <div
                            class="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto"
                          >
                            <ElCheckbox value="案号" name="案号">
                              案号
                            </ElCheckbox>
                            <ElCheckbox value="案由" name="案由">
                              案由
                            </ElCheckbox>
                            <ElCheckbox value="承办人" name="承办人">
                              承办人
                            </ElCheckbox>
                            <ElCheckbox value="法院" name="法院">
                              法院
                            </ElCheckbox>
                            <ElCheckbox value="管理人" name="管理人">
                              管理人
                            </ElCheckbox>
                            <ElCheckbox value="债权人数" name="债权人数">
                              债权人数
                            </ElCheckbox>
                            <ElCheckbox value="债权总额" name="债权总额">
                              债权总额
                            </ElCheckbox>
                            <ElCheckbox value="财产金额" name="财产金额">
                              财产金额
                            </ElCheckbox>
                            <ElCheckbox value="财产比例" name="财产比例">
                              财产比例
                            </ElCheckbox>
                            <ElCheckbox value="会计账簿" name="会计账簿">
                              会计账簿
                            </ElCheckbox>
                            <ElCheckbox value="银行账户数" name="银行账户数">
                              银行账户数
                            </ElCheckbox>
                            <ElCheckbox
                              value="银行账户总余额"
                              name="银行账户总余额"
                            >
                              账户余额
                            </ElCheckbox>
                            <ElCheckbox value="有效账户数" name="有效账户数">
                              有效账户
                            </ElCheckbox>
                            <ElCheckbox value="案件进度" name="案件进度">
                              案件进度
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
                        <div class="pt-2 text-center text-xs text-gray-500">
                          提示：勾选的列将在表格中显示
                        </div>
                      </div>
                    </ElPopover>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
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

      <!-- 案件列表表格 -->
      <ElCard header="案件列表" size="small">
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
            <!-- 案号 -->
            <ElTableColumn
              v-if="isColumnVisible('案号')"
              prop="案号"
              label="案号"
              min-width="180"
              show-overflow-tooltip
            />

            <!-- 案由 -->
            <ElTableColumn
              v-if="isColumnVisible('案由')"
              prop="案由"
              label="案由"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 案件名称 -->
            <ElTableColumn
              v-if="isColumnVisible('案件名称')"
              prop="案件名称"
              label="案件名称"
              min-width="180"
              show-overflow-tooltip
            />

            <!-- 案件来源 -->
            <ElTableColumn
              v-if="isColumnVisible('案件来源')"
              prop="案件来源"
              label="案件来源"
              min-width="150"
              show-overflow-tooltip
            />

            <!-- 案件进度 -->
            <ElTableColumn
              v-if="isColumnVisible('案件进度')"
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

            <!-- 受理法院 -->
            <ElTableColumn
              v-if="isColumnVisible('受理法院')"
              prop="受理法院"
              label="受理法院"
              min-width="180"
              show-overflow-tooltip
            />

            <!-- 主要负责人 -->
            <ElTableColumn
              v-if="isColumnVisible('主要负责人')"
              prop="主要负责人"
              label="主要负责人"
              min-width="150"
              show-overflow-tooltip
            />

            <!-- 创建者 -->
            <ElTableColumn
              v-if="isColumnVisible('创建者')"
              prop="创建者"
              label="创建者"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 创建时间 -->
            <ElTableColumn
              v-if="isColumnVisible('创建时间')"
              prop="创建时间"
              label="创建时间"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['创建时间']) }}
              </template>
            </ElTableColumn>

            <!-- 修改者 -->
            <ElTableColumn
              v-if="isColumnVisible('修改者')"
              prop="修改者"
              label="修改者"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 修改时间 -->
            <ElTableColumn
              v-if="isColumnVisible('修改时间')"
              prop="修改时间"
              label="修改时间"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['修改时间']) }}
              </template>
            </ElTableColumn>

            <!-- 管理人 -->
            <ElTableColumn
              v-if="isColumnVisible('管理人')"
              prop="管理人"
              label="管理人"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 是否简化审 -->
            <ElTableColumn
              v-if="isColumnVisible('是否简化审')"
              prop="是否简化审"
              label="是否简化审"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 立案日期 -->
            <ElTableColumn
              v-if="isColumnVisible('立案日期')"
              prop="立案日期"
              label="立案日期"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['立案日期']) }}
              </template>
            </ElTableColumn>

            <!-- 文件上传 -->
            <ElTableColumn
              v-if="isColumnVisible('文件上传')"
              prop="文件上传"
              label="文件上传"
              min-width="100"
              align="center"
            />

            <!-- 备注 -->
            <ElTableColumn
              v-if="isColumnVisible('备注')"
              prop="备注"
              label="备注"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 案件状态 -->
            <ElTableColumn
              v-if="isColumnVisible('案件状态')"
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

            <!-- 审核状态 -->
            <ElTableColumn
              v-if="isColumnVisible('审核状态')"
              prop="审核状态"
              label="审核状态"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <ElTag
                  :type="getReviewStatusType(row['审核状态'])"
                  size="small"
                >
                  {{ row['审核状态'] || '未设置' }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 审核时间 -->
            <ElTableColumn
              v-if="isColumnVisible('审核时间')"
              prop="审核时间"
              label="审核时间"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ formatTimestamp(row['审核时间']) }}
              </template>
            </ElTableColumn>

            <!-- 审核意见 -->
            <ElTableColumn
              v-if="isColumnVisible('审核意见')"
              prop="审核意见"
              label="审核意见"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 审核次数 -->
            <ElTableColumn
              v-if="isColumnVisible('审核次数')"
              prop="审核次数"
              label="审核次数"
              min-width="100"
              align="center"
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
                  <ElButton
                    v-if="canDeleteCase"
                    type="danger"
                    size="small"
                    @click="showDeleteDialog(row)"
                    :loading="deleteLoading && currentDeleteCase?.id === row.id"
                  >
                    删除
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
/* 响应式设计 */
@media (max-width: 768px) {
  .p-6 {
    padding: 1rem;
  }

  /* 调整卡片头部按钮布局 */
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: stretch;
  }

  .flex.items-center.space-x-2 {
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  /* 调整按钮大小 */
  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
  }

  /* 调整表格字体大小 */
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

  /* 调整分页组件 */
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

/* 按钮样式优化 */
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

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

:deep(.el-dropdown-item) {
  transition: all 0.2s ease;
}

:deep(.el-dropdown-item:hover) {
  color: #409eff;
  background-color: #f5f7fa;
}

/* 表格样式优化 */
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

/* 标签样式优化 */
:deep(.el-tag) {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

/* 表格单元格样式 */
:deep(.el-table .cell) {
  white-space: nowrap;
}

/* 确保表格容器可以滚动 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

/* 滚动条样式优化 */
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

/* 卡片样式增强 */

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons .el-button {
  margin: 0;
}
</style>
