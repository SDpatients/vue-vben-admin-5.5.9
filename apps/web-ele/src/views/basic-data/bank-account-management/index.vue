<script lang="ts" setup>
import type { BankAccountApi } from '#/api/core/bank-account';
import type { ExportColumnConfig } from '#/utils/export-excel';

import { onMounted, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  addBankAccountApi,
  deleteBankAccountApi,
  getBankAccountListApi,
  updateBankAccountApi,
} from '#/api/core/bank-account';
import { exportToExcel } from '#/utils/export-excel';

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
  '账户名称',
  '银行名称',
  '账户号码',
  '账户类型',
  '开户行',
  '当前余额',
  '创建时间',
  '更新时间',
  '状态',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '当前余额',
  '创建时间',
  '更新时间',
  '状态',
  '账户号码',
  '账户名称',
  '账户类型',
  '银行名称',
  '开户行',
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
    const params: BankAccountApi.BankAccountQueryParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };

    const response = await getBankAccountListApi(params);

    if (response.code === 200) {
      bankAccountList.value = response.data.list || [];
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages =
        Math.ceil(pagination.value.itemCount / pagination.value.pageSize) || 0;
      ElMessage.success(
        `成功加载 ${bankAccountList.value.length} 条银行账户记录`,
      );
    } else {
      ElMessage.error(`API返回错误: ${response.message}`);
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
const formatDate = (timestamp: number) => {
  // 特殊处理无效时间戳
  if (!timestamp || timestamp === -2_209_017_600_000) return '-';
  return new Date(timestamp).toLocaleDateString('zh-CN');
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
  ElMessage.info(`查看银行账户详情: ${row.accountName}`);
  // 后续可添加路由跳转逻辑
  // const router = useRouter();
  // router.push(`/basic-data/bank-account-management/detail/${row.sepId}`);
};

// 编辑银行账户
const handleEditBankAccount = (row: BankAccountApi.BankAccountInfo) => {
  editingRow.value = row;
  // 填充编辑表单数据
  editFormData.accountName = row.accountName;
  editFormData.accountNumber = row.accountNumber;
  editFormData.accountType = row.accountType;
  editFormData.openingBank = row.bankName; // 直接使用bankName
  editFormData.currentBalance = row.currentBalance;
  editFormData.status = row.status;
  // 显示编辑弹窗
  editDialogVisible.value = true;
};

// 关闭编辑账户弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  editingRow.value = null;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

// 提交编辑账户表单
const handleEditSubmit = async () => {
  if (!editFormRef.value) return;
  if (!editingRow.value) return;

  try {
    await editFormRef.value.validate();
    editFormLoading.value = true;

    // 转换表单数据，将openingBank映射为bankName
    const submitData = {
      ...editFormData,
      bankName: editFormData.openingBank, // 转换字段名
      openingBank: undefined, // 移除原始字段
    };

    // 调用更新账户API
    const response = await updateBankAccountApi(editingRow.value.id, submitData);

    if (response.code === 200) {
      ElMessage.success('银行账户更新成功');
      handleCloseEditDialog();
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '银行账户更新失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      // 表单验证失败，已经有提示
      return;
    }
    ElMessage.error('银行账户更新失败，请稍后重试');
    console.error('更新银行账户失败:', error);
  } finally {
    editFormLoading.value = false;
  }
};

// 删除银行账户
const handleDeleteBankAccount = async (row: BankAccountApi.BankAccountInfo) => {
  try {
    // 确认删除
    await ElMessageBox.confirm('确定要删除该银行账户吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 调用删除账户API
    const response = await deleteBankAccountApi(row.id);

    if (response.code === 200) {
      ElMessage.success('银行账户删除成功');
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '银行账户删除失败');
    }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') {
      ElMessage.error('银行账户删除失败，请稍后重试');
      console.error('删除银行账户失败:', error);
    }
  }
};

// 导出银行账户数据为Excel
const exportBankAccountData = () => {
  if (bankAccountList.value.length === 0) {
    ElMessage.warning('当前没有数据可导出');
    return;
  }

  // 定义导出列配置
  const exportColumns: ExportColumnConfig[] = [
    { field: 'sepId', title: '行号', width: 8 },
    { field: 'accountName', title: '账户名称', width: 15 },
    { field: 'bankName', title: '银行名称', width: 12 },
    { field: 'accountNumber', title: '账户号码', width: 18 },
    {
      field: 'account_type',
      title: '账户类型',
      width: 10,
      formatter: (value) => value || '-',
    },
    { field: 'currency', title: '币种', width: 10 },
    {
      field: 'balance',
      title: '余额',
      width: 12,
      formatter: (value) => formatCurrency(value),
    },
    {
      field: 'KHRQ',
      title: '开户日期',
      width: 12,
      formatter: (value) => formatDate(value),
    },
    {
      field: 'XHRQ',
      title: '销户日期',
      width: 12,
      formatter: (value) => formatDate(value),
    },
    {
      field: 'ZT',
      title: '状态',
      width: 8,
      formatter: (value) => value || '-',
    },
  ];

  try {
    exportToExcel({
      data: bankAccountList.value,
      fileName: '银行账户管理数据',
      sheetName: '银行账户',
      columns: exportColumns,
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('数据导出失败，请重试');
  }
};

// 新增银行账户相关
const dialogVisible = ref(false);
const formRef = ref();
const formLoading = ref(false);

// 状态选项
const statusOptions = [
  { label: '激活', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
];

// 新增账户表单数据
const formData = reactive({
  accountName: '',
  accountNumber: '',
  accountType: '',
  openingBank: '', // 表单使用openingBank，提交时转换为bank_name
  password: '',
  currentBalance: 0,
  currency: '',
  openingDate: '',
  closingDate: null as null | string,
  status: 'ACTIVE',
});

// 表单验证规则
const rules = {};

// 编辑银行账户相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editFormLoading = ref(false);
const editingRow = ref<BankAccountApi.BankAccountInfo | null>(null);

// 编辑账户表单数据
const editFormData = reactive({
  accountName: '',
  accountNumber: '',
  accountType: '',
  openingBank: '', // 表单使用openingBank，提交时转换为bank_name
  password: '',
  currentBalance: 0,
  currency: '',
  openingDate: '',
  closingDate: null as null | string,
  status: 'ACTIVE',
});

// 开户行选项
const bankOptions = ref([
  { label: '中国工商银行', value: '中国工商银行' },
  { label: '中国建设银行', value: '中国建设银行' },
  { label: '中国农业银行', value: '中国农业银行' },
  { label: '中国银行', value: '中国银行' },
  { label: '招商银行', value: '招商银行' },
  { label: '交通银行', value: '交通银行' },
  { label: '浦发银行', value: '浦发银行' },
  { label: '中信银行', value: '中信银行' },
  { label: '兴业银行', value: '兴业银行' },
  { label: '民生银行', value: '民生银行' },
]);

// 账户类型选项
const accountTypeOptions = [
  { label: '基本户', value: '基本户' },
  { label: '一般户', value: '一般户' },
  { label: '专用户', value: '专用户' },
];

// 币种选项 (3位大写字母)
const currencyOptions = ref([
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '日元 (JPY)', value: 'JPY' },
  { label: '英镑 (GBP)', value: 'GBP' },
  { label: '港币 (HKD)', value: 'HKD' },
  { label: '澳元 (AUD)', value: 'AUD' },
  { label: '加元 (CAD)', value: 'CAD' },
  { label: '瑞士法郎 (CHF)', value: 'CHF' },
  { label: '新加坡元 (SGD)', value: 'SGD' },
]);

// 打开新增账户弹窗
const handleAddBankAccount = () => {
  dialogVisible.value = true;
};

// 关闭新增账户弹窗
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交新增账户表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;

    // 转换表单数据，将openingBank映射为bankName
    const submitData = {
      ...formData,
      bankName: formData.openingBank, // 转换字段名
      openingBank: undefined, // 移除原始字段
    };

    // 调用新增账户API
    const response = await addBankAccountApi(submitData);

    if (response.code === 200) {
      ElMessage.success('银行账户添加成功');
      dialogVisible.value = false;
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '银行账户添加失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      // 表单验证失败，已经有提示
      return;
    }
    ElMessage.error('银行账户添加失败，请稍后重试');
    console.error('添加银行账户失败:', error);
  } finally {
    formLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6">
    <ElCard header="银行账户管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">银行账户管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="handleAddBankAccount">
              <i class="i-lucide-plus mr-1"></i>
              新增账户
            </ElButton>
            <ElButton type="success" @click="exportBankAccountData">
              <i class="i-lucide-download mr-1"></i>
              导出数据
            </ElButton>
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="bankAccountList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <!-- 行号列 -->
        <ElTableColumn type="index" label="序号" width="60" align="center" />

        <!-- 账户名称列 -->
        <ElTableColumn
          prop="accountName"
          label="账户名称"
          width="150"
          show-overflow-tooltip
        />

        <!-- 账户号码列 -->
        <ElTableColumn
          prop="accountNumber"
          label="账户号码"
          width="180"
          show-overflow-tooltip
        />

        <!-- 账户类型列 -->
        <ElTableColumn
          prop="accountType"
          label="账户类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getAccountType(row.accountType)" size="small">
              {{ row.accountType }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 银行名称/开户行列 -->
        <ElTableColumn
          prop="bankName"
          label="开户行"
          width="150"
          show-overflow-tooltip
        />

        <!-- 余额列 -->
        <ElTableColumn prop="currentBalance" label="当前余额" width="150" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.currentBalance) }}
          </template>
        </ElTableColumn>

        <!-- 创建时间列 -->
        <ElTableColumn prop="createTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ new Date(row.createTime).toLocaleString('zh-CN') }}
          </template>
        </ElTableColumn>

        <!-- 更新时间列 -->
        <ElTableColumn prop="updateTime" label="更新时间" width="160" align="center">
          <template #default="{ row }">
            {{ new Date(row.updateTime).toLocaleString('zh-CN') }}
          </template>
        </ElTableColumn>

        <!-- 状态列 -->
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              @click="() => handleEditBankAccount(row)"
              class="mr-2"
            >
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="() => handleDeleteBankAccount(row)"
            >
              <i class="i-lucide-trash-2 mr-1"></i>
              删除
            </ElButton>
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

      <!-- 新增银行账户模态框 -->
      <ElDialog
        v-model="dialogVisible"
        title="新增银行账户"
        width="800px"
        :before-close="handleCloseDialog"
        class="bank-account-dialog"
      >
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          label-position="top"
          class="bank-account-form"
        >
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账户名称" prop="accountName">
                <ElInput
                  v-model="formData.accountName"
                  placeholder="请输入账户名称"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="开户行" prop="openingBank">
                <ElSelect
                  v-model="formData.openingBank"
                  placeholder="请选择开户行"
                  size="large"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in bankOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账号" prop="accountNumber">
                <ElInput
                  v-model="formData.accountNumber"
                  placeholder="请输入账号"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="账户类型" prop="accountType">
                <ElSelect
                  v-model="formData.accountType"
                  placeholder="请选择账户类型"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in accountTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="密码" prop="password">
                <ElInput
                  v-model="formData.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="当前余额" prop="currentBalance">
                <ElInputNumber
                  v-model="formData.currentBalance"
                  :min="0"
                  :precision="2"
                  placeholder="请输入当前余额"
                  size="large"
                  style="width: 100%"
                  :controls="false"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="币种" prop="currency">
                <ElSelect
                  v-model="formData.currency"
                  placeholder="请选择币种"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="状态" prop="status">
                <ElSelect
                  v-model="formData.status"
                  placeholder="请选择状态"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="开户日期" prop="openingDate">
                <ElDatePicker
                  v-model="formData.openingDate"
                  type="datetime"
                  placeholder="请选择开户日期"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="销户日期" prop="closingDate">
                <ElDatePicker
                  v-model="formData.closingDate"
                  type="datetime"
                  placeholder="请选择销户日期"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleSubmit"
              :loading="formLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 编辑银行账户模态框 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑银行账户"
        width="800px"
        :before-close="handleCloseEditDialog"
        class="bank-account-dialog"
      >
        <ElForm
          ref="editFormRef"
          :model="editFormData"
          :rules="rules"
          label-width="120px"
          label-position="top"
          class="bank-account-form"
        >
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账户名称" prop="accountName">
                <ElInput
                  v-model="editFormData.accountName"
                  placeholder="请输入账户名称"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="开户行" prop="openingBank">
                <ElSelect
                  v-model="editFormData.openingBank"
                  placeholder="请选择开户行"
                  size="large"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in bankOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账号" prop="accountNumber">
                <ElInput
                  v-model="editFormData.accountNumber"
                  placeholder="请输入账号"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="账户类型" prop="accountType">
                <ElSelect
                  v-model="editFormData.accountType"
                  placeholder="请选择账户类型"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in accountTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="密码" prop="password">
                <ElInput
                  v-model="editFormData.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="当前余额" prop="currentBalance">
                <ElInputNumber
                  v-model="editFormData.currentBalance"
                  :min="0"
                  :precision="2"
                  placeholder="请输入当前余额"
                  size="large"
                  style="width: 100%"
                  :controls="false"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="币种" prop="currency">
                <ElSelect
                  v-model="editFormData.currency"
                  placeholder="请选择币种"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="状态" prop="status">
                <ElSelect
                  v-model="editFormData.status"
                  placeholder="请选择状态"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="开户日期" prop="openingDate">
                <ElDatePicker
                  v-model="editFormData.openingDate"
                  type="datetime"
                  placeholder="请选择开户日期"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="销户日期" prop="closingDate">
                <ElDatePicker
                  v-model="editFormData.closingDate"
                  type="datetime"
                  placeholder="请选择销户日期"
                  size="large"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseEditDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleEditSubmit"
              :loading="editFormLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>
