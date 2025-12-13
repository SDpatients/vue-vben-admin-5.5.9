<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { CaseApi } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElPagination,
  ElPopover,
  ElRow,
  ElSpace,
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

// 图表相关数据
const chartRef3 = ref<EchartsUIType>();

const { renderEcharts: renderEcharts3 } = useEcharts(chartRef3);

// 图表切换选项
const chartType3 = ref('bar'); // 案件处理进度：bar 或 horizontal-bar

// 案件处理进度数据
const caseProgressData = computed(() => {
  const progressMap = new Map<string, number>();
  caseList.value.forEach((item) => {
    // 根据案件状态或时间计算进度
    const status = item['会计账簿'] || '其他';
    progressMap.set(status, (progressMap.get(status) || 0) + 1);
  });
  return [...progressMap.entries()].map(([name, value]) => ({
    name,
    value,
  }));
});

// 渲染案件处理进度图表
const renderCaseProgressChart = () => {
  const data = caseProgressData.value;
  const isHorizontal = chartType3.value === 'horizontal-bar';

  renderEcharts3({
    grid: {
      bottom: 30,
      containLabel: true,
      left: isHorizontal ? '15%' : '3%',
      right: isHorizontal ? '4%' : '4%',
      top: '10%',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: isHorizontal
      ? {
          type: 'value',
          name: '案件数量',
        }
      : {
          data: data.map((item) => item.name),
          type: 'category',
          axisLabel: {
            rotate: 45,
          },
        },
    yAxis: isHorizontal
      ? {
          data: data.map((item) => item.name),
          type: 'category',
        }
      : {
          type: 'value',
          name: '案件数量',
        },
    series: [
      {
        data: isHorizontal ? data.map((item) => item.value) : data,
        type: 'bar',
        barMaxWidth: 50,
        itemStyle: {
          color: '#4f69fd',
        },
      },
    ],
  });
};

// 监听图表类型变化，重新渲染对应图表
watch(chartType3, () => renderCaseProgressChart());

// 监听案件列表变化，重新渲染图表
watch(
  caseList,
  () => {
    renderCaseProgressChart();
  },
  { deep: true },
);

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

const accessStore = useAccessStore();

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
      // API请求成功后渲染图表
      renderCaseProgressChart();
    } else {
      ElMessage.error(response.error || '获取案件列表失败，已使用模拟数据');
      // API请求失败，响应状态: response.status
      // 使用模拟数据作为后备
      generateMockData();
      // 模拟数据加载后渲染图表
      renderCaseProgressChart();
    }
  } catch {
    // 显示错误提示
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 使用模拟数据作为后备
    generateMockData();
    // 模拟数据加载后渲染图表
    renderCaseProgressChart();
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

// 监听数据加载完成后渲染图表
watch(
  () => caseList.value.length,
  (newLength) => {
    if (newLength > 0) {
      renderCaseProgressChart();
    }
  },
  { immediate: true },
);

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

// 格式化数字（处理大数字显示）
const formatNumber = (value: number) => {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(2)}亿`;
  } else if (value >= 10_000) {
    return `${(value / 10_000).toFixed(2)}万`;
  } else {
    return new Intl.NumberFormat('zh-CN').format(value);
  }
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

      <ElSpace direction="vertical" size="large" class="w-full">
        <!-- 案件处理进度图表 -->
        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElCard header="案件处理进度" size="small">
              <template #header>
                <div class="flex items-center justify-between">
                  <span>案件处理进度</span>
                  <ElRadioGroup v-model="chartType3" size="small">
                    <ElRadio label="bar">柱状图</ElRadio>
                    <ElRadio label="horizontal-bar">横向柱状图</ElRadio>
                  </ElRadioGroup>
                </div>
              </template>
              <div class="h-[300px]">
                <EchartsUI ref="chartRef3" />
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <!-- 案件列表表格 -->
        <ElCard header="案件列表" size="small">
          <ElTable
            :data="caseList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%', maxHeight: '500px' }"
            scrollable
          >
            <!-- 案号 -->
            <ElTableColumn
              v-if="isColumnVisible('案号')"
              prop="案号"
              label="案号"
              width="180"
              show-overflow-tooltip
            />

            <!-- 案由 -->
            <ElTableColumn
              v-if="isColumnVisible('案由')"
              prop="案由"
              label="案由"
              width="200"
              show-overflow-tooltip
            />

            <!-- 承办人 -->
            <ElTableColumn
              v-if="isColumnVisible('承办人')"
              prop="承办人"
              label="承办人"
              width="100"
              show-overflow-tooltip
            />

            <!-- 法院 -->
            <ElTableColumn
              v-if="isColumnVisible('法院')"
              prop="法院"
              label="法院"
              width="200"
              show-overflow-tooltip
            />

            <!-- 管理人 -->
            <ElTableColumn
              v-if="isColumnVisible('管理人')"
              prop="管理人"
              label="管理人"
              width="120"
              show-overflow-tooltip
            />

            <!-- 债权人数 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人数')"
              prop="债权人数"
              label="债权人数"
              width="100"
              align="center"
            />

            <!-- 债权总额 -->
            <ElTableColumn
              v-if="isColumnVisible('债权总额')"
              prop="债权总额"
              label="债权总额"
              width="120"
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
              width="120"
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
              width="100"
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
              width="100"
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
              width="80"
              align="center"
            />

            <!-- 银行账户总余额 -->
            <ElTableColumn
              v-if="isColumnVisible('银行账户总余额')"
              prop="银行账户总余额"
              label="账户余额"
              width="120"
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
              width="80"
              align="center"
            />

            <!-- 操作列 -->
            <ElTableColumn label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="viewCaseDetail(row)"
                >
                  查看
                </ElButton>
                <ElButton type="info" size="small" link>编辑</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

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
      </ElSpace>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.vben-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  font-size: 12px;
}

:deep(.el-table .cell) {
  line-height: 1.4;
  padding: 4px 8px;
}

:deep(.el-table__header-wrapper) {
  font-weight: 600;
}

:deep(.el-table--scrollable-x .el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table--scrollable-y .el-table__body-wrapper) {
  max-height: 500px;
  overflow-y: auto;
}

/* 响应式表格样式 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 11px;
  }

  :deep(.el-table .cell) {
    padding: 3px 6px;
  }
}

/* 表格列宽自适应优化 */
:deep(.el-table__body) {
  min-width: fit-content;
}

/* 操作列样式优化 */
:deep(.el-table__fixed-right) {
  z-index: 3;
}

/* 统计卡片样式优化 */
.stat-card {
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(240, 249, 255, 0.8),
    rgba(240, 249, 255, 1)
  );
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 统计图标样式 */
.stat-icon {
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

/* 数字显示优化 */
.number-value {
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  max-width: 100%;
  line-height: 1.3;
  min-height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 8px;
  white-space: normal;
  word-wrap: break-word;
}

/* 统计卡片容器优化 */
:deep(.el-col) {
  min-width: 0;
}

/* 响应式统计卡片 */
@media (max-width: 1200px) {
  .stat-card {
    min-height: 130px;
    padding: 16px 10px;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .number-value {
    font-size: 1.75rem;
    line-height: 1.2;
    padding: 0 6px;
  }
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 120px;
    padding: 14px 8px;
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .number-value {
    font-size: 1.5rem;
    line-height: 1.1;
    padding: 0 4px;
  }
}

@media (max-width: 576px) {
  .stat-card {
    min-height: 110px;
    padding: 12px 6px;
  }

  .stat-icon {
    font-size: 1.75rem;
    margin-bottom: 6px;
  }

  .number-value {
    font-size: 1.25rem;
    line-height: 1;
    padding: 0 2px;
  }
}
</style>
