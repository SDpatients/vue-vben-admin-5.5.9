<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore, useUserStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
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

import { getCaseListApi, getUserCaseListApi } from '#/api/core/case';
import { useAuthStore } from '#/store/auth';

import ReviewModal from './components/ReviewModal.vue';

const accessStore = useAccessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const currentUserId = computed(() => {
  const userId = userStore.userInfo?.userId;
  console.log('[currentUserId] userStore.userInfo:', userStore.userInfo);
  console.log('[currentUserId] userStore.userInfo?.userId:', userId);
  if (userId) {
    const parsedId = Number.parseInt(userId, 10);
    console.log('[currentUserId] 从 store 获取 userId:', parsedId);
    return parsedId;
  }
  const localStorageUserId = localStorage.getItem('chat_user_id');
  console.log('[currentUserId] localStorage chat_user_id:', localStorageUserId);
  if (localStorageUserId) {
    const parsedId = Number.parseInt(localStorageUserId, 10);
    console.log('[currentUserId] 从 localStorage 获取 userId:', parsedId);
    return parsedId;
  }
  console.warn('[currentUserId] 未找到 userId，返回 0');
  return 0;
});

// 响应式数据
const caseList = ref<CaseApi.CaseInfo[]>([]);
const loading = ref(false);
const reviewModalVisible = ref(false);
const currentCase = ref<CaseApi.CaseInfo | undefined>(undefined);
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
  return roles.includes('ADMIN') || roles.includes('admin');
});

// 判断用户是否为律师
const isLawyer = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('LAWYER') || roles.includes('律师');
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
  '创建者',
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
  '创建者',
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

// 生成模拟数据
const generateMockData = () => {
  const mockCases: CaseApi.CaseInfo[] = [
    {
      id: 1,
      案号: '（2024）沪02破1号',
      案由: '经营困难',
      案件名称: '上海某实业公司破产重整案',
      案件来源: '债权人申请',
      案件进度: '第二阶段',
      受理法院: '上海市第二中级人民法院',
      主要负责人: '陈律师',
      管理人: '上海某会计师事务所',
      是否简化审: '是',
      创建者: '系统管理员',
      创建时间: '2024-05-10T10:00:00',
      修改时间: '2024-05-10T10:00:00',
      案件状态: '进行中',
      指定法官: '孙法官',
      承办人: '陈律师',
    } as CaseApi.CaseInfo,
    {
      id: 2,
      案号: '（2024）京01破2号',
      案由: '资不抵债',
      案件名称: '北京某科技公司破产清算案',
      案件来源: '债务人申请',
      案件进度: '第一阶段',
      受理法院: '北京市第一中级人民法院',
      主要负责人: '李律师',
      管理人: '北京某律师事务所',
      是否简化审: '否',
      创建者: '系统管理员',
      创建时间: '2024-06-20T14:30:00',
      修改时间: '2024-06-20T14:30:00',
      案件状态: '进行中',
      指定法官: '王法官',
      承办人: '李律师',
    } as CaseApi.CaseInfo,
    {
      id: 3,
      案号: '（2024）粤03破3号',
      案由: '经营不善',
      案件名称: '深圳某贸易公司破产和解案',
      案件来源: '债权人申请',
      案件进度: '第三阶段',
      受理法院: '深圳市中级人民法院',
      主要负责人: '张律师',
      管理人: '深圳某破产清算有限公司',
      是否简化审: '是',
      创建者: '系统管理员',
      创建时间: '2024-07-25T09:15:00',
      修改时间: '2024-07-25T09:15:00',
      案件状态: '进行中',
      指定法官: '刘法官',
      承办人: '张律师',
    } as CaseApi.CaseInfo,
  ];

  caseList.value = mockCases;
  pagination.value.itemCount = 3;
  pagination.value.pages = 1;
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
          ONGOING: '进行中',
          IN_PROGRESS: '进行中',
          COMPLETED: '已完成',
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
      if (response.data.pageNum) {
        pagination.value.page = response.data.pageNum;
      }
      if (response.data.pageSize) {
        pagination.value.pageSize = response.data.pageSize;
      }

      if (mappedCases.length > 0) {
        ElMessage.success(`成功加载 ${mappedCases.length} 条案件记录`);
      }
    } else {
      ElMessage.error(response.message || '获取案件列表失败');
      generateMockData();
    }
  } catch (error) {
    ElMessage.error('获取案件列表失败，请检查网络连接');
    generateMockData();
  } finally {
    loading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = async (tabName: string) => {
  // 如果不是管理员且尝试访问全部案件，强制切换到我的案件
  if (tabName === 'allCases' && !isAdmin.value) {
    ElMessage.warning('您无权查看全部案件');
    activeTab.value = 'myCases';
    return;
  }
  
  activeTab.value = tabName;
  pagination.value.page = 1;
  loading.value = true;
  try {
    // 当切换到我的案件时，先尝试获取用户信息
    if (tabName === 'myCases') {
      await authStore.fetchCurrentUser();
    }
    await fetchCaseList();
  } catch (error) {
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
  console.log('[onMounted] 页面挂载，开始初始化');
  console.log('[onMounted] 当前用户信息:', userStore.userInfo);
  console.log(
    '[onMounted] localStorage chat_user_id:',
    localStorage.getItem('chat_user_id'),
  );
  console.log('[onMounted] 当前用户ID:', currentUserId.value);
  console.log('[onMounted] 当前标签页:', activeTab.value);
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
    case '进行中': {
      return 'primary';
    }
    case '已完成': {
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

// 检查是否可以审核
const canReview = (row: CaseApi.CaseInfo) => {
  return false;
};
</script>

<template>
  <div class="p-6">
    <ElCard header="案件管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="router.push('/case-add')">
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
          <span class="text-sm text-gray-500">仅显示您创建的案件</span>
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
                    v-if="canReview(row)"
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
