<script lang="ts" setup>
import type { CreditorApi } from '#/api/core/creditor';

import { onMounted, ref } from 'vue';

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
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopover,
  ElRow,
  ElSelect,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getCreditorListApi } from '#/api/core/creditor';

// 响应式数据
const creditorList = ref<CreditorApi.CreditorInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 搜索相关数据
const searchKeyword = ref('');
const searchType = ref(''); // 债权人/案号
const searchOptions = [
  { label: '债权人', value: '债权人' },
  { label: '案号', value: '案号' },
];

// 搜索功能
const handleSearch = () => {
  if (!searchType.value) {
    ElMessage.warning('请选择搜索类型');
    return;
  }
  if (!searchKeyword.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  pagination.value.page = 1;
  fetchCreditorList();
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  searchType.value = '';
  pagination.value.page = 1;
  fetchCreditorList();
};

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '债权人ID',
  '债权人名称',
  '债权人分类',
  '证件号码',
  '法定代表人',
  '注册地址',
  '经营范围',
  '行业分类',
  '成立日期',
  '注册资本',
  '关联案件ID',
  '案号',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '债权人ID',
  '债权人分类',
  '债权人名称',
  '法定代表人',
  '注册资本',
  '行号',
  '证件号码',
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

// 获取债权人列表
const fetchCreditorList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || 'ff60b33806869ab08153b1ef4fd75ea3';
    const params: CreditorApi.CreditorQueryParams = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
      SearchKeyword: searchKeyword.value,
      SearchType: searchType.value,
    };

    const response = await getCreditorListApi(params);

    if (response.status === '1') {
      creditorList.value = response.data.records;
      pagination.value.itemCount = response.data.count;
      pagination.value.pages = response.data.pages;
      ElMessage.success(`成功加载 ${creditorList.value.length} 条债权人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
      creditorList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人列表失败，请检查网络连接或API服务');
    creditorList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchCreditorList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchCreditorList();
};

// 刷新债权人列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchCreditorList();
};

// 页面加载时获取数据
onMounted(() => {
  initColumnVisibility();
  fetchCreditorList();
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

// 格式化日期显示
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 格式化货币显示
const formatCurrency = (amount: number) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(amount);
};

// 获取债权人类型标签
const getCreditorType = (type: string) => {
  switch (type) {
    case '个人': {
      return 'primary';
    }
    case '企业': {
      return 'success';
    }
    default: {
      return 'info';
    }
  }
};

// 查看债权人详情
const viewCreditorDetail = (row: CreditorApi.CreditorInfo) => {
  if (row.ZQRID) {
    ElMessage.info(`查看债权人详情: ${row.ZQR}`);
    // 后续可添加路由跳转逻辑
    // const router = useRouter();
    // router.push(`/creditor-detail/${row.ZQRID}`);
  } else {
    ElMessage.warning('债权人ID不存在，无法查看详情');
  }
};

// 新增债权人
const handleAddCreditor = () => {
  ElMessage.info('新增债权人功能待实现');
};

// 编辑债权人
const handleEditCreditor = (row: CreditorApi.CreditorInfo) => {
  ElMessage.info(`编辑债权人: ${row.ZQR}`);
};
</script>

<template>
  <div class="p-6">
    <ElCard header="债权人管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">债权人管理</span>
          <div class="flex items-center space-x-2">
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
                            <ElCheckbox label="行号" name="行号">
                              行号
                            </ElCheckbox>
                            <ElCheckbox label="债权人ID" name="债权人ID">
                              债权人ID
                            </ElCheckbox>
                            <ElCheckbox label="债权人名称" name="债权人名称">
                              债权人名称
                            </ElCheckbox>
                            <ElCheckbox label="债权人分类" name="债权人分类">
                              债权人分类
                            </ElCheckbox>
                            <ElCheckbox label="证件号码" name="证件号码">
                              证件号码
                            </ElCheckbox>
                            <ElCheckbox label="法定代表人" name="法定代表人">
                              法定代表人
                            </ElCheckbox>
                            <ElCheckbox label="注册地址" name="注册地址">
                              注册地址
                            </ElCheckbox>
                            <ElCheckbox label="经营范围" name="经营范围">
                              经营范围
                            </ElCheckbox>
                            <ElCheckbox label="行业分类" name="行业分类">
                              行业分类
                            </ElCheckbox>
                            <ElCheckbox label="成立日期" name="成立日期">
                              成立日期
                            </ElCheckbox>
                            <ElCheckbox label="注册资本" name="注册资本">
                              注册资本
                            </ElCheckbox>
                            <ElCheckbox label="关联案件ID" name="关联案件ID">
                              关联案件ID
                            </ElCheckbox>
                            <ElCheckbox label="案号" name="案号">
                              案号
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
                      </div>
                    </ElPopover>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton type="primary" @click="handleAddCreditor">
              <i class="i-lucide-plus mr-1"></i>
              新增债权人
            </ElButton>
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <ElSpace direction="vertical" size="large" class="w-full">
        <!-- 搜索区域 -->
        <ElCard size="small">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">搜索类型：</span>
              <ElSelect
                v-model="searchType"
                placeholder="请选择搜索类型"
                size="small"
                style="width: 150px"
              >
                <ElOption
                  v-for="option in searchOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">搜索关键词：</span>
              <ElInput
                v-model="searchKeyword"
                placeholder="请输入搜索关键词"
                size="small"
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <ElButton size="small" type="primary" @click="handleSearch">
                    搜索
                  </ElButton>
                </template>
              </ElInput>
            </div>
            <ElButton size="small" @click="resetSearch">
              重置
            </ElButton>
            <div class="ml-auto text-sm text-gray-500">
              提示：只能选择一种搜索类型进行搜索
            </div>
          </div>
        </ElCard>

        <!-- 债权人统计信息 -->
        <ElCard header="债权人统计概览" size="small">
          <ElRow :gutter="20">
            <ElCol :span="6">
              <div class="stat-card rounded bg-blue-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-blue-600">
                  {{ pagination.itemCount }}
                </div>
                <div class="mt-2 text-sm text-gray-500">总债权人数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-green-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-green-600">
                  {{
                    creditorList.filter((item) => item.ZQRFL === '个人').length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">个人债权人</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-purple-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-purple-600">
                  {{
                    creditorList.filter((item) => item.ZQRFL === '企业').length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">企业债权人</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-orange-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-orange-600">
                  {{
                    creditorList.filter(
                      (item) => item.GLAJID && item.GLAJID !== '',
                    ).length
                  }}
                </div>
                <div class="mt-2 text-sm text-gray-500">已关联案件</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>

        <!-- 债权人列表表格 -->
        <ElCard header="债权人列表" size="small">
          <ElTable
            :data="creditorList"
            v-loading="loading"
            stripe
            border
            size="small"
            :style="{ width: '100%', maxHeight: '600px' }"
            scrollable
          >
            <!-- 行号 -->
            <ElTableColumn
              v-if="isColumnVisible('行号')"
              prop="row"
              label="行号"
              width="60"
              fixed="left"
              align="center"
            />

            <!-- 债权人ID -->
            <ElTableColumn
              v-if="isColumnVisible('债权人ID')"
              prop="ZQRID"
              label="债权人ID"
              width="120"
              fixed="left"
              show-overflow-tooltip
            />

            <!-- 债权人名称 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人名称')"
              prop="ZQR"
              label="债权人名称"
              width="150"
              show-overflow-tooltip
            />

            <!-- 债权人分类 -->
            <ElTableColumn
              v-if="isColumnVisible('债权人分类')"
              prop="ZQRFL"
              label="债权人分类"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getCreditorType(row.ZQRFL)" size="small">
                  {{ row.ZQRFL }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 证件号码 -->
            <ElTableColumn
              v-if="isColumnVisible('证件号码')"
              prop="ZJHM"
              label="证件号码"
              width="150"
              show-overflow-tooltip
            />

            <!-- 法定代表人 -->
            <ElTableColumn
              v-if="isColumnVisible('法定代表人')"
              prop="FDDBRQY"
              label="法定代表人"
              width="120"
              show-overflow-tooltip
            />

            <!-- 注册地址 -->
            <ElTableColumn
              v-if="isColumnVisible('注册地址')"
              prop="ZCDZ"
              label="注册地址"
              width="200"
              show-overflow-tooltip
            />

            <!-- 经营范围 -->
            <ElTableColumn
              v-if="isColumnVisible('经营范围')"
              prop="JYFWQY"
              label="经营范围"
              width="200"
              show-overflow-tooltip
            />

            <!-- 行业分类 -->
            <ElTableColumn
              v-if="isColumnVisible('行业分类')"
              prop="HYFL"
              label="行业分类"
              width="120"
              show-overflow-tooltip
            />

            <!-- 成立日期 -->
            <ElTableColumn
              v-if="isColumnVisible('成立日期')"
              prop="CLRQQY"
              label="成立日期"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                {{ formatDate(row.CLRQQY) }}
              </template>
            </ElTableColumn>

            <!-- 注册资本 -->
            <ElTableColumn
              v-if="isColumnVisible('注册资本')"
              prop="ZCZBQY"
              label="注册资本"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row.ZCZBQY) }}
              </template>
            </ElTableColumn>

            <!-- 关联案件ID -->
            <ElTableColumn
              v-if="isColumnVisible('关联案件ID')"
              prop="GLAJID"
              label="关联案件ID"
              width="120"
              show-overflow-tooltip
            />

            <!-- 案号 -->
            <ElTableColumn
              v-if="isColumnVisible('案号')"
              prop="AH"
              label="案号"
              width="150"
              show-overflow-tooltip
            />

            <!-- 操作列 -->
            <ElTableColumn label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="viewCreditorDetail(row)"
                >
                  查看
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  link
                  @click="handleEditCreditor(row)"
                >
                  编辑
                </ElButton>
                <ElButton type="danger" size="small" link> 删除 </ElButton>
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
    padding: 2px 4px;
  }
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.number-value {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
