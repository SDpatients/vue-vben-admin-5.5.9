<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElPopover,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import { deleteCaseApi, getCaseListApi } from '#/api/core/case';
import { selectMyCasesApi, selectTeamCasesApi } from '#/api/core/work-team';

import ReviewModal from './components/ReviewModal.vue';

const accessStore = useAccessStore();
const permissions = computed(() => accessStore.accessCodes || []);

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

// 标签页控制
const activeTab = ref('allCases');

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
      row: 1,
      案件单据号: 34,
      案号: 'dddd',
      案由: '',
      案件来源: '',
      创建者: '测试用户',
      备注: '',
      案件名称: '44124124',
      管理人: '',
      案件进度: '已结案',
      创建时间: 1_766_943_984_000,
      是否简化审: '',
      主要负责人: '',
      受理法院: '',
    } as CaseApi.CaseInfo,
    {
      row: 2,
      案件单据号: 33,
      案号: 'fff',
      案由: 'fffffffffff',
      案件来源: '',
      创建者: '测试用户',
      备注: '',
      案件名称: '333333333333333',
      管理人: '',
      修改时间: 1_766_937_600_000,
      案件进度: '第五阶段',
      创建时间: 1_766_943_057_000,
      是否简化审: 'f',
      修改者: '',
      主要负责人: '',
      受理法院: '',
    } as CaseApi.CaseInfo,
    {
      row: 3,
      案件单据号: 24,
      案号: '123',
      案由: '',
      案件来源: '',
      创建者: 'admin',
      备注: '',
      案件名称: '333',
      管理人: '',
      修改时间: 1_766_419_200_000,
      案件进度: '第六阶段',
      创建时间: 1_765_179_418_000,
      是否简化审: '',
      修改者: '2222',
      文件上传: '1',
      主要负责人: '',
      受理法院: '',
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
      response = await selectMyCasesApi(
        pagination.value.page,
        pagination.value.pageSize,
      );
    } else if (activeTab.value === 'teamCases') {
      // 获取团队案件
      response = await selectTeamCasesApi(
        pagination.value.page,
        pagination.value.pageSize,
      );
    } else {
      // 获取全部案件（有权限的）
      const token = '03f07901573e624060991494b3a22422';
      const params = {
        page: pagination.value.page,
        size: pagination.value.pageSize,
        token,
      };
      response = await getCaseListApi(params);
    }

    if (response.status === '1' && response.data) {
      caseList.value = response.data.records || [];
      pagination.value.itemCount = response.data.count || 0;
      pagination.value.pages = response.data.pages || 0;
      ElMessage.success('案件列表加载成功');
    } else {
      ElMessage.error(response.error || '获取案件列表失败，已使用模拟数据');
      generateMockData();
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    generateMockData();
  } finally {
    loading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  pagination.value.page = 1;
  fetchCaseList();
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
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchCaseList();
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
    case '已结案': {
      return 'success';
    }
    case '第一阶段':
    case '第七阶段':
    case '第三阶段':
    case '第二阶段':
    case '第五阶段':
    case '第六阶段':
    case '第四阶段': {
      return 'primary';
    }
    default: {
      return 'info';
    }
  }
};

// 查看案件详情
const router = useRouter();
const viewCaseDetail = (row: any) => {
  if (row.案件单据号) {
    router.push(`/case-detail/${row.案件单据号}`);
  } else {
    ElMessage.warning('案件ID不存在，无法查看详情');
  }
};

// 显示审核弹窗
const showReviewModal = (row: CaseApi.CaseInfo) => {
  currentCase.value = row;
  reviewModalVisible.value = true;
};

// 删除案件
const deleteCase = async (row: CaseApi.CaseInfo) => {
  try {
    await ElMessageBox.confirm(`确认删除案件"${row.案号}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteCaseApi(row.案件单据号);
    if (response.status === '1') {
      ElMessage.success('删除成功');
      fetchCaseList();
    } else {
      ElMessage.error(response.error || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 检查是否有权限
const hasPermission = (perm: string | string[]) => {
  if (Array.isArray(perm)) {
    return perm.some((p) => permissions.value.includes(p));
  }
  return permissions.value.includes(perm);
};

// 检查是否可以审核
const canReview = (row: CaseApi.CaseInfo) => {
  return hasPermission('case:review');
};

// 检查是否可以删除
const canDelete = () => {
  return hasPermission('case:delete');
};
</script>

<template>
  <div class="p-6">
    <ElCard header="案件管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件管理</span>
          <div class="flex items-center space-x-2">
            <ElButton
              v-permission="'case:add'"
              type="primary"
              @click="router.push('/case-add')"
            >
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
        <ElTabPane label="团队案件" name="teamCases">
          <span class="text-sm text-gray-500">显示您作为团队成员的案件</span>
        </ElTabPane>
        <ElTabPane label="全部案件" name="allCases">
          <span class="text-sm text-gray-500">显示所有有权限访问的案件</span>
        </ElTabPane>
      </ElTabs>

      <!-- 案件列表表格 -->
      <ElCard header="案件列表" size="small">
        <div class="table-wrapper">
          <ElTable
            :data="caseList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%' }"
          >
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
                  <ElButton
                    v-if="canDelete()"
                    type="danger"
                    size="small"
                    @click="deleteCase(row)"
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
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 0;
}
</style>
