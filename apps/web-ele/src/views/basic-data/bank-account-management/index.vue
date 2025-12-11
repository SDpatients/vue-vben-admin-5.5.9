<script lang="ts" setup>
import type { BankAccountApi } from '#/api/core/bank-account';

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
  ElMessage,
  ElPagination,
  ElPopover,
  ElRow,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { getBankAccountListApi } from '#/api/core/bank-account';

// 响应式数据
const bankAccountList = ref<BankAccountApi.BankAccountInfo[]>([]);
const loading = ref(false);
interface Pagination {
  page: number;
  pageSize: number;
  itemCount: number;
  pages: number;
}

const pagination = ref<Pagination>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '案件ID',
  '账户名称',
  '银行名称',
  '账户号码',
  '账户类型',
  '币种',
  '余额',
  '开户日期',
  '销户日期',
  '状态',
  '案号',
  '账户ID',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '余额',
  '开户日期',
  '状态',
  '账户号码',
  '账户名称',
  '账户类型',
  '银行名称',
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

// 获取银行账户列表
const fetchBankAccountList = async () => {
  loading.value = true;
  try {
    const token = accessStore.accessToken || 'fefd6e9ec409dae4290d2386001ff028';
    const params: BankAccountApi.BankAccountQueryParams = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
    };

    const response = await getBankAccountListApi(params);

    if (response.status === '1') {
      bankAccountList.value = response.data.records;
      pagination.value.itemCount = response.data.count;
      pagination.value.pages = response.data.pages;
      ElMessage.success(
        `成功加载 ${bankAccountList.value.length} 条银行账户记录`,
      );
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
      bankAccountList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取银行账户列表失败:', error);
    ElMessage.error('获取银行账户列表失败，请检查网络连接或API服务');
    bankAccountList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchBankAccountList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchBankAccountList();
};

// 刷新银行账户列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchBankAccountList();
};

// 页面加载时获取数据
onMounted(() => {
  initColumnVisibility();
  fetchBankAccountList();
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
    minimumFractionDigits: 2,
  }).format(amount);
};

// 获取账户状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '冻结': {
      return 'danger';
    }
    case '启动': {
      return 'success';
    }
    case '销户': {
      return 'info';
    }
    default: {
      return 'warning';
    }
  }
};

// 获取账户类型标签
const getAccountType = (type: string) => {
  switch (type) {
    case '一般户': {
      return 'success';
    }
    case '专用户': {
      return 'warning';
    }
    case '基本户': {
      return 'primary';
    }
    default: {
      return 'info';
    }
  }
};

// 查看银行账户详情
const viewBankAccountDetail = (row: BankAccountApi.BankAccountInfo) => {
  ElMessage.info(`查看银行账户详情: ${row.account_name}`);
  // 后续可添加路由跳转逻辑
  // const router = useRouter();
  // router.push(`/basic-data/bank-account-management/detail/${row.ZHID || row.row}`);
};

// 编辑银行账户
const handleEditBankAccount = (row: BankAccountApi.BankAccountInfo) => {
  ElMessage.info(`编辑银行账户: ${row.account_name}`);
  // 后续可添加编辑弹窗逻辑
};
</script>

<template>
  <div class="bank-account-management">
    <!-- 页面标题 -->
    <ElCard class="mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">银行账户管理</h1>
          <p class="mt-1 text-gray-600">管理系统中的银行账户信息</p>
        </div>
        <ElButton type="primary" @click="handleRefresh"> 刷新数据 </ElButton>
      </div>
    </ElCard>

    <!-- 主要内容区域 -->
    <ElCard>
      <ElSpace direction="vertical" class="w-full" :size="20">
        <!-- 工具栏 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <ElDropdown>
              <ElButton type="primary" plain> 列显示控制 </ElButton>
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
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <!-- 列显示选择器 -->
            <ElPopover
              placement="bottom-start"
              title="选择显示的列"
              :width="300"
              trigger="click"
            >
              <template #reference>
                <ElButton type="info" plain> 自定义列 </ElButton>
              </template>
              <div class="p-2">
                <ElCheckboxGroup v-model="columnVisible">
                  <ElRow :gutter="10">
                    <ElCol
                      v-for="column in availableColumns"
                      :key="column"
                      :span="12"
                    >
                      <ElCheckbox :label="column">
                        {{ column }}
                      </ElCheckbox>
                    </ElCol>
                  </ElRow>
                </ElCheckboxGroup>
              </div>
            </ElPopover>
          </div>

          <div class="flex items-center space-x-2">
            <ElButton type="primary"> 新增账户 </ElButton>
            <ElButton type="success"> 导出数据 </ElButton>
          </div>
        </div>

        <!-- 数据表格 -->
        <ElCard>
          <ElTable
            v-loading="loading"
            :data="bankAccountList"
            :border="true"
            :stripe="true"
            :style="{ width: '100%' }"
            class="bank-account-table"
          >
            <!-- 行号列 -->
            <ElTableColumn
              v-if="isColumnVisible('行号')"
              prop="row"
              label="行号"
              width="80"
              align="center"
              fixed="left"
            />

            <!-- 案件ID列 -->
            <ElTableColumn
              v-if="isColumnVisible('案件ID')"
              prop="CASEID"
              label="案件ID"
              width="180"
              show-overflow-tooltip
            />

            <!-- 账户名称列 -->
            <ElTableColumn
              v-if="isColumnVisible('账户名称')"
              prop="account_name"
              label="账户名称"
              width="150"
              show-overflow-tooltip
            />

            <!-- 银行名称列 -->
            <ElTableColumn
              v-if="isColumnVisible('银行名称')"
              prop="bank_name"
              label="银行名称"
              width="120"
              show-overflow-tooltip
            />

            <!-- 账户号码列 -->
            <ElTableColumn
              v-if="isColumnVisible('账户号码')"
              prop="account_number"
              label="账户号码"
              width="180"
              show-overflow-tooltip
            />

            <!-- 账户类型列 -->
            <ElTableColumn
              v-if="isColumnVisible('账户类型')"
              prop="account_type"
              label="账户类型"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getAccountType(row.account_type)" size="small">
                  {{ row.account_type }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 币种列 -->
            <ElTableColumn
              v-if="isColumnVisible('币种')"
              prop="currency"
              label="币种"
              width="120"
              align="center"
            />

            <!-- 余额列 -->
            <ElTableColumn
              v-if="isColumnVisible('余额')"
              prop="balance"
              label="余额"
              width="150"
              align="right"
            >
              <template #default="{ row }">
                {{ formatCurrency(row.balance) }}
              </template>
            </ElTableColumn>

            <!-- 开户日期列 -->
            <ElTableColumn
              v-if="isColumnVisible('开户日期')"
              prop="KHRQ"
              label="开户日期"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                {{ formatDate(row.KHRQ) }}
              </template>
            </ElTableColumn>

            <!-- 销户日期列 -->
            <ElTableColumn
              v-if="isColumnVisible('销户日期')"
              prop="XHRQ"
              label="销户日期"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                {{ formatDate(row.XHRQ) }}
              </template>
            </ElTableColumn>

            <!-- 状态列 -->
            <ElTableColumn
              v-if="isColumnVisible('状态')"
              prop="ZT"
              label="状态"
              width="100"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <ElTag :type="getStatusType(row.ZT)" size="small">
                  {{ row.ZT }}
                </ElTag>
              </template>
            </ElTableColumn>

            <!-- 案号列 -->
            <ElTableColumn
              v-if="isColumnVisible('案号')"
              prop="AH"
              label="案号"
              width="200"
              show-overflow-tooltip
            />

            <!-- 账户ID列 -->
            <ElTableColumn
              v-if="isColumnVisible('账户ID')"
              prop="ZHID"
              label="账户ID"
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
                  @click="viewBankAccountDetail(row)"
                >
                  查看
                </ElButton>
                <ElButton
                  type="info"
                  size="small"
                  link
                  @click="handleEditBankAccount(row)"
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
.bank-account-management {
  padding: 20px;
}

.bank-account-table {
  margin-top: 0;
}

.bank-account-table :deep(.el-table__row) {
  transition: background-color 0.3s ease;
}

.bank-account-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.bank-account-table :deep(.el-table__cell) {
  padding: 12px 0;
}

.bank-account-table :deep(.el-table__header) {
  background-color: #f8fafc;
}
</style>
