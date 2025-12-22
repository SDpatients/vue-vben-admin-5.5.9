<script lang="ts" setup>
import type { CaseApi } from '#/api';

import { onMounted, ref } from 'vue';
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
  ElPagination,
  ElPopover,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCaseListApi } from '#/api/core/case';

// 响应式数据
const caseList = ref<CaseApi.CaseInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

const accessStore = useAccessStore();

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '案号',
  '案由',
  '承办人',
  '法院',
  '管理人',
  '债权人数',
  '债权总额',
  '财产金额',
  '财产比例',
  '会计账簿',
  '银行账户数',
  '银行账户总余额',
  '有效账户数',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '会计账簿',
  '债权人数',
  '债权总额',
  '案号',
  '案由',
  '财产金额',
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

// 生成模拟数据
const generateMockData = () => {
  const mockCases: CaseApi.CaseInfo[] = [
    {
      row: 1,
      序号: 1,
      年度: '2024',
      案号: '(2024)沪01破1号',
      申请人: '上海银行',
      债务人: '上海某科技公司',
      案由: '破产清算',
      立案时间: '2024-01-15',
      破产时间: '2024-01-20',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '已移交',
      办理期限: '2024-12-31',
      承办人: '张三',
      法院: '上海市第一中级人民法院',
      管理人: '李四律师事务所',
      债权人数: 25,
      债权总额: 15_000_000,
      财产金额: 8_000_000,
      财产比例: 0.53,
      银行账户数: 3,
      银行账户总余额: 1_200_000,
      有效账户数: 2,
    } as CaseApi.CaseInfo,
    {
      row: 2,
      序号: 2,
      年度: '2024',
      案号: '(2024)京02破5号',
      申请人: '建设银行',
      债务人: '北京某房地产公司',
      案由: '破产重整',
      立案时间: '2024-02-10',
      破产时间: '2024-02-15',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '未移交',
      办理期限: '2025-02-28',
      承办人: '王五',
      法院: '北京市第二中级人民法院',
      管理人: '赵六会计师事务所',
      债权人数: 48,
      债权总额: 28_000_000,
      财产金额: 15_000_000,
      财产比例: 0.54,
      银行账户数: 5,
      银行账户总余额: 3_500_000,
      有效账户数: 4,
    } as CaseApi.CaseInfo,
    {
      row: 3,
      序号: 3,
      年度: '2024',
      案号: '(2024)深03破8号',
      申请人: '招商银行',
      债务人: '深圳某电子公司',
      案由: '破产清算',
      立案时间: '2024-03-05',
      破产时间: '2024-03-10',
      终结时间: null,
      注销时间: null,
      归档时间: null,
      会计账簿: '部分移交',
      办理期限: '2024-09-30',
      承办人: '孙七',
      法院: '深圳市中级人民法院',
      管理人: '钱八律师事务所',
      债权人数: 32,
      债权总额: 9_500_000,
      财产金额: 5_200_000,
      财产比例: 0.55,
      银行账户数: 2,
      银行账户总余额: 850_000,
      有效账户数: 1,
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
    const token = accessStore.accessToken || '1ae18aba1f1b430c8cf22d2f668a9b79';
    const params = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
    };

    const response = await getCaseListApi(params);

    if (response.status === '1' && response.data) {
      caseList.value = response.data.records || [];
      pagination.value.itemCount = response.data.count || 0;
      pagination.value.pages = response.data.pages || 0;
      ElMessage.success('案件列表加载成功');
    } else {
      ElMessage.error(response.error || '获取案件列表失败，已使用模拟数据');
      // API请求失败，响应状态: response.status
      // 使用模拟数据作为后备
      generateMockData();
    }
  } catch {
    // 显示错误提示
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 使用模拟数据作为后备
    generateMockData();
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

// 格式化金额显示
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

// 格式化百分比
const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
};

// 获取会计账簿状态标签类型
const getAccountBookType = (status: string) => {
  switch (status) {
    case '已移交': {
      return 'success';
    }
    case '未移交': {
      return 'warning';
    }
    case '部分移交': {
      return 'info';
    }
    default: {
      return 'danger';
    }
  }
};

// 查看案件详情
const router = useRouter();
const viewCaseDetail = (row: any) => {
  if (row.序号) {
    router.push(`/case-detail/${row.序号}`);
  } else {
    ElMessage.warning('案件序号不存在，无法查看详情');
  }
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
                      <div class="space-y-2">
                        <div class="mb-2 text-sm text-gray-500">
                          选择要显示的列：
                        </div>
                        <ElCheckboxGroup v-model="columnVisible">
                          <div class="grid grid-cols-2 gap-2">
                            <ElCheckbox label="案号" name="案号">
                              案号
                            </ElCheckbox>
                            <ElCheckbox label="案由" name="案由">
                              案由
                            </ElCheckbox>
                            <ElCheckbox label="承办人" name="承办人">
                              承办人
                            </ElCheckbox>
                            <ElCheckbox label="法院" name="法院">
                              法院
                            </ElCheckbox>
                            <ElCheckbox label="管理人" name="管理人">
                              管理人
                            </ElCheckbox>
                            <ElCheckbox label="债权人数" name="债权人数">
                              债权人数
                            </ElCheckbox>
                            <ElCheckbox label="债权总额" name="债权总额">
                              债权总额
                            </ElCheckbox>
                            <ElCheckbox label="财产金额" name="财产金额">
                              财产金额
                            </ElCheckbox>
                            <ElCheckbox label="财产比例" name="财产比例">
                              财产比例
                            </ElCheckbox>
                            <ElCheckbox label="会计账簿" name="会计账簿">
                              会计账簿
                            </ElCheckbox>
                            <ElCheckbox label="银行账户数" name="银行账户数">
                              银行账户数
                            </ElCheckbox>
                            <ElCheckbox
                              label="银行账户总余额"
                              name="银行账户总余额"
                            >
                              账户余额
                            </ElCheckbox>
                            <ElCheckbox label="有效账户数" name="有效账户数">
                              有效账户
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
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

            <!-- 承办人 -->
            <ElTableColumn
              v-if="isColumnVisible('承办人')"
              prop="承办人"
              label="承办人"
              min-width="100"
              show-overflow-tooltip
            />

            <!-- 法院 -->
            <ElTableColumn
              v-if="isColumnVisible('法院')"
              prop="法院"
              label="法院"
              min-width="200"
              show-overflow-tooltip
            />

            <!-- 管理人 -->
            <ElTableColumn
              v-if="isColumnVisible('管理人')"
              prop="管理人"
              label="管理人"
              min-width="120"
              show-overflow-tooltip
            />

            <!-- 债权人数 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人数')"
              prop="债权人数"
              label="债权人数"
              min-width="100"
              align="center"
            />

            <!-- 债权总额 -->
            <ElTableColumn
              v-if="isColumnVisible('债权总额')"
              prop="债权总额"
              label="债权总额"
              min-width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['债权总额']) }}
              </template>
            </ElTableColumn>

            <!-- 财产金额 -->
            <ElTableColumn
              v-if="isColumnVisible('财产金额')"
              prop="财产金额"
              label="财产金额"
              min-width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['财产金额']) }}
              </template>
            </ElTableColumn>

            <!-- 财产比例 -->
            <ElTableColumn
              v-if="isColumnVisible('财产比例')"
              prop="财产比例"
              label="财产比例"
              min-width="100"
              align="center"
            >
              <template #default="{ row }">
                {{ formatPercentage(row['财产比例']) }}
              </template>
            </ElTableColumn>

            <!-- 会计账簿 -->
            <ElTableColumn
              v-if="isColumnVisible('会计账簿')"
              prop="会计账簿"
              label="会计账簿"
              min-width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getAccountBookType(row['会计账簿'])" size="small">
                  {{ row['会计账簿'] }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 银行账户数 -->
            <ElTableColumn
              v-if="isColumnVisible('银行账户数')"
              prop="银行账户数"
              label="账户数"
              min-width="80"
              align="center"
            />

            <!-- 银行账户总余额 -->
            <ElTableColumn
              v-if="isColumnVisible('银行账户总余额')"
              prop="银行账户总余额"
              label="账户余额"
              min-width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row['银行账户总余额']) }}
              </template>
            </ElTableColumn>

            <!-- 有效账户数 -->
            <ElTableColumn
              v-if="isColumnVisible('有效账户数')"
              prop="有效账户数"
              label="有效账户"
              min-width="80"
              align="center"
            />

            <!-- 操作列 -->
            <ElTableColumn label="操作" min-width="80">
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="viewCaseDetail(row)"
                >
                  查看
                </ElButton>
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
  </div>
</template>

<style scoped>
/* 表格单元格样式 */
:deep(.el-table .cell) {
  white-space: nowrap;
}

/* 确保表格容器可以滚动 */
.table-wrapper {
  overflow-x: auto;
  width: 100%;
}
</style>
