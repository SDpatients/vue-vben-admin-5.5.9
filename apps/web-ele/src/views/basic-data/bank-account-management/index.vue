<script lang="ts" setup>
import type { BankAccountApi } from '#/api/core/bank-account';
import type { ExportColumnConfig } from '#/utils/export-excel';

import { onMounted, ref, reactive } from 'vue';

import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElPopover,
  ElRow,
  ElSelect,
  ElOption,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { addBankAccountApi, getBankAccountListApi, updateBankAccountApi, deleteBankAccountApi } from '#/api/core/bank-account';
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
  '币种',
  '余额',
  '开户日期',
  '销户日期',
  '状态',
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
  // router.push(`/basic-data/bank-account-management/detail/${row.row}`);
};

// 编辑银行账户
const handleEditBankAccount = (row: BankAccountApi.BankAccountInfo) => {
  editingRow.value = row;
  // 填充编辑表单数据
  editFormData.SEP_ID = row.SEP_ID;
  editFormData.account_name = row.account_name;
  editFormData.bank_name = row.bank_name;
  editFormData.account_number = row.account_number;
  editFormData.account_type = row.account_type;
  editFormData.currency = row.currency;
  editFormData.balance = row.balance;
  editFormData.KHRQ = row.KHRQ;
  editFormData.XHRQ = row.XHRQ;
  editFormData.ZT = row.ZT;
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

  try {
    // 自动填写SEP_EUSER：从本地存储获取chat_user_info.user.uName
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    if (chatUserInfoStr) {
      try {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        editFormData.SEP_EUSER = chatUserInfo.user?.uName || chatUserInfo.uName || chatUserInfo.U_NAME || '';
      } catch (error) {
        console.error('解析chat_user_info失败:', error);
      }
    }

    // 自动填写SEP_EDATE：使用ISO格式的日期时间字符串
    editFormData.SEP_EDATE = new Date().toISOString().slice(0, 19);

    // 处理KHRQ和XHRQ：如果为空则设为null
    if (!editFormData.KHRQ) {
      editFormData.KHRQ = null;
    }
    if (!editFormData.XHRQ) {
      editFormData.XHRQ = null;
    }

    await editFormRef.value.validate();
    editFormLoading.value = true;

    // 调用更新账户API
    const response = await updateBankAccountApi(editFormData);

    if (response.status === '1') {
      ElMessage.success('银行账户更新成功');
      handleCloseEditDialog();
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.error || '银行账户更新失败');
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
    const response = await deleteBankAccountApi({ SEP_ID: row.SEP_ID });

    if (response.status === '1') {
      ElMessage.success('银行账户删除成功');
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.error || '银行账户删除失败');
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
    { field: 'row', title: '行号', width: 8 },
    { field: 'account_name', title: '账户名称', width: 15 },
    { field: 'bank_name', title: '银行名称', width: 12 },
    { field: 'account_number', title: '账户号码', width: 18 },
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

// 新增账户表单数据
const formData = reactive({
  sep_auser: '',
  sep_adate: '',
  account_name: '',
  bank_name: '',
  account_number: '',
  account_type: '',
  currency: '',
  balance: 0,
  khrq: '',
  xhrq: null as string | null,
  zt: '启用',
});

// 表单验证规则
const rules = {
  account_name: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  account_number: [{ required: true, message: '请输入账号', trigger: 'blur' }],
};

// 编辑银行账户相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editFormLoading = ref(false);
const editingRow = ref<BankAccountApi.BankAccountInfo | null>(null);

// 编辑账户表单数据
const editFormData = reactive({
  SEP_ID: '',
  SEP_EUSER: '',
  SEP_EDATE: '',
  account_name: '',
  bank_name: '',
  account_number: '',
  account_type: '',
  currency: '',
  balance: 0,
  KHRQ: '',
  XHRQ: null as string | null,
  ZT: null as string | null,
});

// 账户类型选项
const accountTypeOptions = [
  { label: '基本户', value: '基本户' },
  { label: '一般户', value: '一般户' },
  { label: '专用户', value: '专用户' },
];

// 从本地存储获取保存的自定义币种
const getSavedCurrencyOptions = () => {
  const saved = localStorage.getItem('customCurrencyOptions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('解析自定义币种失败:', error);
    }
  }
  return [];
};

// 币种选项 - 合并默认选项和自定义选项
const defaultCurrencyOptions = [
  { label: '人民币', value: '人民币' },
  { label: '美元', value: '美元' },
  { label: '欧元', value: '欧元' },
  { label: '日元', value: '日元' },
];

// 保存自定义币种到本地存储
const saveCustomCurrency = (value) => {
  if (!value || defaultCurrencyOptions.some(opt => opt.value === value)) {
    return;
  }
  
  const savedOptions = getSavedCurrencyOptions();
  if (!savedOptions.some(opt => opt.value === value)) {
    savedOptions.push({ label: value, value });
    localStorage.setItem('customCurrencyOptions', JSON.stringify(savedOptions));
    // 更新币种选项
    currencyOptions.value = [...defaultCurrencyOptions, ...savedOptions];
  }
};

// 删除自定义币种
const deleteCustomCurrency = (value) => {
  // 不能删除默认币种
  if (defaultCurrencyOptions.some(opt => opt.value === value)) {
    return;
  }
  
  // 更新本地存储
  const savedOptions = getSavedCurrencyOptions();
  const updatedOptions = savedOptions.filter(opt => opt.value !== value);
  localStorage.setItem('customCurrencyOptions', JSON.stringify(updatedOptions));
  
  // 更新币种选项
  currencyOptions.value = [...defaultCurrencyOptions, ...updatedOptions];
  
  // 如果当前选中的是被删除的币种，清空选择
  if (formData.currency === value) {
    formData.currency = '';
  }
};

// 响应式币种选项
const currencyOptions = ref([...defaultCurrencyOptions, ...getSavedCurrencyOptions()]);

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
    // 自动填写sep_auser：从本地存储获取chat_user_info.user.uName
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    if (chatUserInfoStr) {
      try {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        formData.sep_auser = chatUserInfo.user?.uName || chatUserInfo.uName || chatUserInfo.U_NAME || '';
      } catch (error) {
        console.error('解析chat_user_info失败:', error);
      }
    }

    // 自动填写sep_adate：使用ISO格式的日期时间字符串
    formData.sep_adate = new Date().toISOString().slice(0, 19);

    await formRef.value.validate();
    formLoading.value = true;

    // 创建表单数据副本并处理khrq字段：如果为空则设为null
    const formDataCopy = { ...formData };
    if (!formDataCopy.khrq) {
      formDataCopy.khrq = null;
    }

    // 调用新增账户API
    const response = await addBankAccountApi([formDataCopy]);

    if (response.status === '1') {
      ElMessage.success('银行账户添加成功');
      dialogVisible.value = false;
      // 刷新银行账户列表
      fetchBankAccountList();
    } else {
      ElMessage.error(response.error || '银行账户添加失败');
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
              prop="account_name"
              label="账户名称"
              width="150"
              show-overflow-tooltip
            />

            <!-- 银行名称列 -->
            <ElTableColumn
              prop="bank_name"
              label="银行名称"
              width="120"
              show-overflow-tooltip
            />

            <!-- 账户号码列 -->
            <ElTableColumn
              prop="account_number"
              label="账户号码"
              width="180"
              show-overflow-tooltip
            />

            <!-- 账户类型列 -->
            <ElTableColumn
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
              prop="currency"
              label="币种"
              width="120"
              align="center"
            />

            <!-- 余额列 -->
            <ElTableColumn
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
              prop="ZT"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag :type="getStatusType(row.ZT)" size="small">
                  {{ row.ZT }}
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
                  <ElFormItem label="账户名称" prop="account_name">
                    <ElInput
                      v-model="formData.account_name"
                      placeholder="请输入账户名称"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="银行名称" prop="bank_name">
                    <ElInput
                      v-model="formData.bank_name"
                      placeholder="请输入银行名称"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow :gutter="30">
                <ElCol :span="12">
                  <ElFormItem label="账号" prop="account_number">
                    <ElInput
                      v-model="formData.account_number"
                      placeholder="请输入账号"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="账户类型" prop="account_type">
                    <ElSelect
                      v-model="formData.account_type"
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
                  <ElFormItem label="币种" prop="currency">
                    <ElSelect
                      v-model="formData.currency"
                      placeholder="请选择或输入币种"
                      style="width: 100%"
                      size="large"
                      filterable
                      allow-create
                      @change="(value) => saveCustomCurrency(value)"
                    >
                      <ElOption
                        v-for="option in currencyOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        <div class="flex items-center justify-between">
                          <span>{{ option.label }}</span>
                          <!-- 只有自定义币种才显示删除按钮 -->
                          <ElButton
                            v-if="!defaultCurrencyOptions.some(opt => opt.value === option.value)"
                            type="text"
                            size="small"
                            @click.stop="deleteCustomCurrency(option.value)"
                            class="text-red-500 hover:text-red-700"
                          >
                            <i class="i-lucide-x"></i>
                          </ElButton>
                        </div>
                      </ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="当前余额" prop="balance">
                    <ElInputNumber
                      v-model="formData.balance"
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
                  <ElFormItem label="开户日期" prop="khrq">
                    <ElDatePicker
                      v-model="formData.khrq"
                      type="datetime"
                      placeholder="请选择开户日期"
                      style="width: 100%"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="销户日期">
                    <ElDatePicker
                      v-model="formData.xhrq"
                      type="datetime"
                      placeholder="请选择销户日期"
                      style="width: 100%"
                      size="large"
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
                  <ElFormItem label="账户名称" prop="account_name">
                    <ElInput
                      v-model="editFormData.account_name"
                      placeholder="请输入账户名称"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="银行名称" prop="bank_name">
                    <ElInput
                      v-model="editFormData.bank_name"
                      placeholder="请输入银行名称"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow :gutter="30">
                <ElCol :span="12">
                  <ElFormItem label="账号" prop="account_number">
                    <ElInput
                      v-model="editFormData.account_number"
                      placeholder="请输入账号"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="账户类型" prop="account_type">
                    <ElSelect
                      v-model="editFormData.account_type"
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
                  <ElFormItem label="币种" prop="currency">
                    <ElSelect
                      v-model="editFormData.currency"
                      placeholder="请选择或输入币种"
                      style="width: 100%"
                      size="large"
                      filterable
                      allow-create
                      @change="(value) => saveCustomCurrency(value)"
                    >
                      <ElOption
                        v-for="option in currencyOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        <div class="flex items-center justify-between">
                          <span>{{ option.label }}</span>
                          <!-- 只有自定义币种才显示删除按钮 -->
                          <ElButton
                            v-if="!defaultCurrencyOptions.some(opt => opt.value === option.value)"
                            type="text"
                            size="small"
                            @click.stop="deleteCustomCurrency(option.value)"
                            class="text-red-500 hover:text-red-700"
                          >
                            <i class="i-lucide-x"></i>
                          </ElButton>
                        </div>
                      </ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="当前余额" prop="balance">
                    <ElInputNumber
                      v-model="editFormData.balance"
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
                  <ElFormItem label="开户日期">
                    <ElDatePicker
                      v-model="editFormData.KHRQ"
                      type="datetime"
                      placeholder="请选择开户日期"
                      style="width: 100%"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="销户日期">
                    <ElDatePicker
                      v-model="editFormData.XHRQ"
                      type="datetime"
                      placeholder="请选择销户日期"
                      style="width: 100%"
                      size="large"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow :gutter="30">
                <ElCol :span="12">
                  <ElFormItem label="状态">
                    <ElSelect
                      v-model="editFormData.ZT"
                      placeholder="请选择状态"
                      style="width: 100%"
                      size="large"
                    >
                      <ElOption label="启用" value="启用" />
                      <ElOption label="冻结" value="冻结" />
                      <ElOption label="销户" value="销户" />
                    </ElSelect>
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
