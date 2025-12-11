<script lang="ts" setup>
import type { DebtorApi } from '#/api/core/debtor';

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

import { getDebtorListApi } from '#/api/core/debtor';

// 响应式数据
const debtorList = ref<DebtorApi.DebtorInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 搜索相关数据
const searchKeyword = ref('');
const searchType = ref(''); // 企业名称/联系人
const searchOptions = [
  { label: '企业名称', value: '企业名称' },
  { label: '联系人', value: '联系人' },
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
  fetchDebtorList();
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  searchType.value = '';
  pagination.value.page = 1;
  fetchDebtorList();
};

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '企业ID',
  '案件ID',
  '企业名称',
  '统一社会信用代码',
  '法定代表人',
  '登记机关',
  '成立日期',
  '注册资本',
  '经营范围',
  '企业类型',
  '所属行业',
  '注册地址',
  '联系电话',
  '联系人',
  '状态',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '企业ID',
  '企业名称',
  '法定代表人',
  '状态',
  '统一社会信用代码',
  '行号',
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

// 获取债务人列表
const fetchDebtorList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || '7b9d4b2ec1199667e87ebf863b4d0c83';
    const params = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
      SearchKeyword: searchKeyword.value,
    };

    const response = await getDebtorListApi(params);

    if (response.status === '1') {
      debtorList.value = response.data.records;
      pagination.value.itemCount = response.data.count;
      pagination.value.pages = response.data.pages;
      ElMessage.success(`成功加载 ${debtorList.value.length} 条债务人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
      debtorList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取债务人列表失败:', error);
    ElMessage.error('获取债务人列表失败，请检查网络连接或API服务');
    debtorList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchDebtorList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchDebtorList();
};

// 刷新债务人列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchDebtorList();
};

// 页面加载时获取数据
onMounted(() => {
  initColumnVisibility();
  fetchDebtorList();
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

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '停业': {
      return 'warning';
    }
    case '在营': {
      return 'success';
    }
    case '注销': {
      return 'danger';
    }
    default: {
      return 'info';
    }
  }
};

// 查看债务人详情
const viewDebtorDetail = (row: DebtorApi.DebtorInfo) => {
  if (row.QYID) {
    ElMessage.info(`查看债务人详情: ${row.QYMC}`);
    // 后续可添加路由跳转逻辑
    // const router = useRouter();
    // router.push(`/debtor-detail/${row.QYID}`);
  } else {
    ElMessage.warning('债务人ID不存在，无法查看详情');
  }
};

// 新增债务人
const handleAddDebtor = () => {
  ElMessage.info('新增债务人功能待实现');
};

// 编辑债务人
const handleEditDebtor = (row: DebtorApi.DebtorInfo) => {
  ElMessage.info(`编辑债务人: ${row.QYMC}`);
};
</script>

<template>
  <div class="p-6">
    <ElCard header="债务人管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">债务人管理</span>
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
                            <ElCheckbox label="企业ID" name="企业ID">
                              企业ID
                            </ElCheckbox>
                            <ElCheckbox label="案件ID" name="案件ID">
                              案件ID
                            </ElCheckbox>
                            <ElCheckbox label="企业名称" name="企业名称">
                              企业名称
                            </ElCheckbox>
                            <ElCheckbox
                              label="统一社会信用代码"
                              name="统一社会信用代码"
                            >
                              统一社会信用代码
                            </ElCheckbox>
                            <ElCheckbox label="法定代表人" name="法定代表人">
                              法定代表人
                            </ElCheckbox>
                            <ElCheckbox label="登记机关" name="登记机关">
                              登记机关
                            </ElCheckbox>
                            <ElCheckbox label="成立日期" name="成立日期">
                              成立日期
                            </ElCheckbox>
                            <ElCheckbox label="注册资本" name="注册资本">
                              注册资本
                            </ElCheckbox>
                            <ElCheckbox label="经营范围" name="经营范围">
                              经营范围
                            </ElCheckbox>
                            <ElCheckbox label="企业类型" name="企业类型">
                              企业类型
                            </ElCheckbox>
                            <ElCheckbox label="所属行业" name="所属行业">
                              所属行业
                            </ElCheckbox>
                            <ElCheckbox label="注册地址" name="注册地址">
                              注册地址
                            </ElCheckbox>
                            <ElCheckbox label="联系电话" name="联系电话">
                              联系电话
                            </ElCheckbox>
                            <ElCheckbox label="联系人" name="联系人">
                              联系人
                            </ElCheckbox>
                            <ElCheckbox label="状态" name="状态">
                              状态
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
                      </div>
                    </ElPopover>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton type="primary" @click="handleAddDebtor">
              <i class="i-lucide-plus mr-1"></i>
              新增债务人
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
            <ElButton size="small" @click="resetSearch"> 重置 </ElButton>
            <div class="ml-auto text-sm text-gray-500">
              提示：只能选择一种搜索类型进行搜索
            </div>
          </div>
        </ElCard>

        <!-- 债务人统计信息 -->
        <ElCard header="债务人统计概览" size="small">
          <ElRow :gutter="20">
            <ElCol :span="6">
              <div class="stat-card rounded bg-blue-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-blue-600">
                  {{ pagination.itemCount }}
                </div>
                <div class="mt-2 text-sm text-gray-500">总债务人数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-green-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-green-600">
                  {{ debtorList.filter((item) => item.ZT === '在营').length }}
                </div>
                <div class="mt-2 text-sm text-gray-500">在营状态</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-purple-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-purple-600">
                  {{ debtorList.filter((item) => item.ZT === '注销').length }}
                </div>
                <div class="mt-2 text-sm text-gray-500">注销状态</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card rounded bg-orange-50 p-5 text-center">
                <div class="number-value text-2xl font-bold text-orange-600">
                  {{ debtorList.filter((item) => item.ZT === '停业').length }}
                </div>
                <div class="mt-2 text-sm text-gray-500">停业状态</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>

        <!-- 债务人列表表格 -->
        <ElCard header="债务人列表" size="small">
          <ElTable
            :data="debtorList"
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
              width="80"
              fixed="left"
              align="center"
            />

            <!-- 企业ID -->
            <ElTableColumn
              v-if="isColumnVisible('企业ID')"
              prop="QYID"
              label="企业ID"
              width="120"
              fixed="left"
              show-overflow-tooltip
            />

            <!-- 案件ID -->
            <ElTableColumn
              v-if="isColumnVisible('案件ID')"
              prop="AJID"
              label="案件ID"
              width="120"
              show-overflow-tooltip
            />

            <!-- 企业名称 -->
            <ElTableColumn
              v-if="isColumnVisible('企业名称')"
              prop="QYMC"
              label="企业名称"
              width="180"
              show-overflow-tooltip
            />

            <!-- 统一社会信用代码 -->
            <ElTableColumn
              v-if="isColumnVisible('统一社会信用代码')"
              prop="TYSHXYDM"
              label="统一社会信用代码"
              width="150"
              show-overflow-tooltip
            />

            <!-- 法定代表人 -->
            <ElTableColumn
              v-if="isColumnVisible('法定代表人')"
              prop="FDDBR"
              label="法定代表人"
              width="120"
              show-overflow-tooltip
            />

            <!-- 登记机关 -->
            <ElTableColumn
              v-if="isColumnVisible('登记机关')"
              prop="DJJG"
              label="登记机关"
              width="150"
              show-overflow-tooltip
            />

            <!-- 成立日期 -->
            <ElTableColumn
              v-if="isColumnVisible('成立日期')"
              prop="CLRQ"
              label="成立日期"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                {{ formatDate(row.CLRQ) }}
              </template>
            </ElTableColumn>

            <!-- 注册资本 -->
            <ElTableColumn
              v-if="isColumnVisible('注册资本')"
              prop="ZCZB"
              label="注册资本"
              width="120"
              show-overflow-tooltip
            />

            <!-- 经营范围 -->
            <ElTableColumn
              v-if="isColumnVisible('经营范围')"
              prop="JYFW"
              label="经营范围"
              width="200"
              show-overflow-tooltip
            />

            <!-- 企业类型 -->
            <ElTableColumn
              v-if="isColumnVisible('企业类型')"
              prop="QYLX"
              label="企业类型"
              width="150"
              show-overflow-tooltip
            />

            <!-- 所属行业 -->
            <ElTableColumn
              v-if="isColumnVisible('所属行业')"
              prop="SSHY"
              label="所属行业"
              width="150"
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

            <!-- 联系电话 -->
            <ElTableColumn
              v-if="isColumnVisible('联系电话')"
              prop="LXDH"
              label="联系电话"
              width="120"
              show-overflow-tooltip
            />

            <!-- 联系人 -->
            <ElTableColumn
              v-if="isColumnVisible('联系人')"
              prop="LXR"
              label="联系人"
              width="120"
              show-overflow-tooltip
            />

            <!-- 状态 -->
            <ElTableColumn
              v-if="isColumnVisible('状态')"
              prop="ZT"
              label="状态"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getStatusType(row.ZT)" size="small">
                  {{ row.ZT }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 操作列 -->
            <ElTableColumn label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="viewDebtorDetail(row)"
                >
                  查看
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  link
                  @click="handleEditDebtor(row)"
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
