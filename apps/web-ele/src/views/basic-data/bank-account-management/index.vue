<script lang="ts" setup>
import type { BankAccountApi } from '#/api/core/bank-account';
import type { BankAccountTransactionApi } from '#/api/core/bank-account-transaction';
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
  getAccountTransactionSummaryApi,
  getBankAccountListApi,
  updateBankAccountApi,
} from '#/api/core/bank-account';
import {
  createTransactionApi,
  deleteTransactionApi,
  getAccountTransactionsApi,
  getTransactionListApi,
  updateTransactionApi,
} from '#/api/core/bank-account-transaction';
import { getCaseSimpleListApi } from '#/api/core/case';
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
  '总流入',
  '总流出',
  '创建时间',
  '更新时间',
  '状态',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '创建时间',
  '开户行',
  '当前余额',
  '总流入',
  '总流出',
  '更新时间',
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

      // 懒加载：逐个获取账户的总流入和总流出
      loadTransactionSummaries();
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

// 懒加载：逐个获取账户的交易汇总信息（总流入和总流出）
const loadTransactionSummaries = async () => {
  for (const account of bankAccountList.value) {
    try {
      const response = await getAccountTransactionSummaryApi(account.id);
      if (response.code === 200 && response.data) {
        account.totalInflow = response.data.totalInflow || 0;
        account.totalOutflow = response.data.totalOutflow || 0;
      }
    } catch (error) {
      console.error(`获取账户 ${account.id} 的交易汇总失败:`, error);
      account.totalInflow = 0;
      account.totalOutflow = 0;
    }
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

// 账户类型翻译映射
const accountTypeTranslation: Record<string, string> = {
  FOREIGN: '外汇户',
  MARGIN: '保证金户',
  SPECIAL: '专用户',
  GENERAL: '一般户',
  SETTLEMENT: '结算户',
  TEMPORARY: '临时户',
  BASIC: '基本户',
  基本户: '基本户',
  一般户: '一般户',
  专用户: '专用户',
};

// 获取账户类型标签类型
const getAccountType = (type: string) => {
  switch (type) {
    case 'BASIC':
    case 'FOREIGN':
    case '基本户': {
      return 'primary';
    }
    case 'GENERAL':
    case '一般户': {
      return 'success';
    }
    case 'MARGIN': {
      return 'danger';
    }
    case 'SETTLEMENT':
    case 'TEMPORARY': {
      return 'info';
    }
    case 'SPECIAL':
    case '专用户': {
      return 'warning';
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
  editFormData.caseId = row.caseId || 0;
  editFormData.caseNumber = row.caseNumber || '';
  editFormData.accountName = row.accountName;
  editFormData.accountNumber = row.accountNumber;
  editFormData.accountType = row.accountType;
  editFormData.openingBank = row.bankName; // 直接使用bankName
  editFormData.password = '******';
  editFormData.currentBalance = row.currentBalance;
  editFormData.currency = row.currency || '';
  editFormData.openingDate = row.openingDate || '';
  editFormData.closingDate = row.closingDate || null;
  editFormData.status = row.status;
  editFormData.accountPurpose = row.accountPurpose || '';
  // 显示编辑弹窗
  editDialogVisible.value = true;
  // 打开弹窗时加载案号列表
  getCaseList();
};

// 关闭编辑账户弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  editingRow.value = null;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  // 重置案号相关字段
  editFormData.caseId = 0;
  editFormData.caseNumber = '';
};

// 提交编辑账户表单
const handleEditSubmit = async () => {
  if (!editFormRef.value) return;
  if (!editingRow.value) return;

  try {
    await editFormRef.value.validate();
    editFormLoading.value = true;

    // 转换表单数据，将openingBank映射为bankName
    const { password, ...restFormData } = editFormData;
    const submitData = {
      ...restFormData,
      bankName: editFormData.openingBank, // 转换字段名
      openingBank: undefined, // 移除原始字段
    };

    // 调用更新账户API
    const response = await updateBankAccountApi(
      editingRow.value.id,
      submitData,
    );

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
      field: 'accountType',
      title: '账户类型',
      width: 10,
      formatter: (value) => accountTypeTranslation[value] || value || '-',
    },
    { field: 'currency', title: '币种', width: 10 },
    {
      field: 'currentBalance',
      title: '余额',
      width: 12,
      formatter: (value) => formatCurrency(value),
    },
    {
      field: 'totalInflow',
      title: '总流入',
      width: 12,
      formatter: (value) => formatCurrency(value),
    },
    {
      field: 'totalOutflow',
      title: '总流出',
      width: 12,
      formatter: (value) => formatCurrency(value),
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 12,
      formatter: (value) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      field: 'updateTime',
      title: '更新时间',
      width: 12,
      formatter: (value) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      field: 'status',
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

// 案件相关数据
const caseList = ref<any[]>([]);
const caseLoading = ref(false);

// 获取案件列表
const getCaseList = async (query = '') => {
  caseLoading.value = true;
  try {
    const response = await getCaseSimpleListApi({
      page: 1,
      size: 10_000,
      caseNumber: query,
    });

    caseList.value =
      response.code === 200 && response.data?.list ? response.data.list : [];
  } catch (error) {
    console.error('获取案件列表失败:', error);
    caseList.value = [];
  } finally {
    caseLoading.value = false;
  }
};

// 处理案号选择
const handleCaseSelect = (value: string) => {
  formData.caseNumber = value;
  // 根据选中的caseNumber值在caseList中找到对应的项，获取其id
  const selectedCase = caseList.value.find((item) => item.caseNumber === value);
  if (selectedCase) {
    formData.caseId = selectedCase.id;
  }
};

// 新增账户表单数据
const formData = reactive({
  caseId: 0, // 案件ID
  caseNumber: '', // 案号，用于表单显示
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
  accountPurpose: '', // 账户用途
});

// 表单验证规则
const rules = {};

// 编辑银行账户相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editFormLoading = ref(false);
const editingRow = ref<BankAccountApi.BankAccountInfo | null>(null);

// 交易记录相关
const transactionDialogVisible = ref(false);
const transactionList = ref<BankAccountTransactionApi.TransactionInfo[]>([]);
const transactionLoading = ref(false);
const selectedAccount = ref<BankAccountApi.BankAccountInfo | null>(null);
const transactionPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});
const transactionFilters = reactive({
  transactionType: '',
  businessType: '',
  startDate: '',
  endDate: '',
});

// 新增交易记录弹窗
const addTransactionDialogVisible = ref(false);
const addTransactionFormRef = ref();
const addTransactionFormLoading = ref(false);
const addTransactionFormData = reactive({
  accountId: 0,
  transactionType: '',
  amount: 0,
  transactionDate: '',
  summary: '',
  businessType: '',
  counterpartyAccount: '',
  counterpartyName: '',
  remark: '',
  caseId: 0,
});

// 编辑交易记录弹窗
const editTransactionDialogVisible = ref(false);
const editTransactionFormRef = ref();
const editTransactionFormLoading = ref(false);
const editingTransaction =
  ref<BankAccountTransactionApi.TransactionInfo | null>(null);
const editTransactionFormData = reactive({
  transactionType: '',
  amount: 0,
  transactionDate: '',
  summary: '',
  businessType: '',
  counterpartyAccount: '',
  counterpartyName: '',
  remark: '',
});

// 视图切换相关
const viewMode = ref<'account' | 'transaction'>('account');
const latestTransactionList = ref<BankAccountTransactionApi.TransactionInfo[]>(
  [],
);
const latestTransactionLoading = ref(false);
const latestTransactionPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 交易类型选项
const transactionTypeOptions = [
  { label: '流入', value: 'IN' },
  { label: '流出', value: 'OUT' },
];

// 业务类型选项
const businessTypeOptions = [
  { label: '收款', value: '收款' },
  { label: '付款', value: '付款' },
  { label: '转账', value: '转账' },
  { label: '利息收入', value: '利息收入' },
  { label: '手续费', value: '手续费' },
  { label: '其他', value: '其他' },
];

// 获取账户交易记录
const fetchAccountTransactions = async () => {
  if (!selectedAccount.value) return;

  transactionLoading.value = true;
  try {
    const params: BankAccountTransactionApi.TransactionQueryParams = {
      pageNum: transactionPagination.value.page,
      pageSize: transactionPagination.value.pageSize,
      accountId: selectedAccount.value.id,
      transactionType: transactionFilters.transactionType || undefined,
      businessType: transactionFilters.businessType || undefined,
      startDate: transactionFilters.startDate || undefined,
      endDate: transactionFilters.endDate || undefined,
    };

    const response = await getAccountTransactionsApi(
      selectedAccount.value.id,
      params,
    );

    if (response.code === 200) {
      transactionList.value = response.data.list || [];
      transactionPagination.value.total = response.data.total || 0;
    } else {
      ElMessage.error(`API返回错误: ${response.message}`);
      transactionList.value = [];
      transactionPagination.value.total = 0;
    }
  } catch (error) {
    console.error('获取交易记录失败:', error);
    ElMessage.error('获取交易记录失败，请检查网络连接或API服务');
    transactionList.value = [];
    transactionPagination.value.total = 0;
  } finally {
    transactionLoading.value = false;
  }
};

// 查看账户交易记录
const handleViewTransactions = (row: BankAccountApi.BankAccountInfo) => {
  selectedAccount.value = row;
  transactionPagination.value.page = 1;
  transactionFilters.transactionType = '';
  transactionFilters.businessType = '';
  transactionFilters.startDate = '';
  transactionFilters.endDate = '';
  transactionDialogVisible.value = true;
  fetchAccountTransactions();
};

// 关闭交易记录弹窗
const handleCloseTransactionDialog = () => {
  transactionDialogVisible.value = false;
  selectedAccount.value = null;
  transactionList.value = [];
  transactionPagination.value = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
};

// 交易记录分页变化
const handleTransactionPageChange = (page: number) => {
  transactionPagination.value.page = page;
  fetchAccountTransactions();
};

// 交易记录页面大小变化
const handleTransactionSizeChange = (size: number) => {
  transactionPagination.value.pageSize = size;
  transactionPagination.value.page = 1;
  fetchAccountTransactions();
};

// 搜索交易记录
const handleSearchTransactions = () => {
  transactionPagination.value.page = 1;
  fetchAccountTransactions();
};

// 重置交易记录搜索
const handleResetTransactionFilters = () => {
  transactionFilters.transactionType = '';
  transactionFilters.businessType = '';
  transactionFilters.startDate = '';
  transactionFilters.endDate = '';
  transactionPagination.value.page = 1;
  fetchAccountTransactions();
};

// 获取交易类型标签类型
const getTransactionTypeType = (type: string) => {
  return type === 'IN' ? 'danger' : 'success';
};

// 获取交易类型文本
const getTransactionTypeText = (type: string) => {
  return type === 'IN' ? '流入' : '流出';
};

// 获取最新交易记录
const fetchLatestTransactions = async () => {
  latestTransactionLoading.value = true;
  try {
    const params: BankAccountTransactionApi.TransactionQueryParams = {
      pageNum: latestTransactionPagination.value.page,
      pageSize: latestTransactionPagination.value.pageSize,
    };

    const response = await getTransactionListApi(params);

    if (response.code === 200) {
      latestTransactionList.value = response.data.list || [];
      latestTransactionPagination.value.total = response.data.total || 0;
    } else {
      ElMessage.error(`API返回错误: ${response.message}`);
      latestTransactionList.value = [];
      latestTransactionPagination.value.total = 0;
    }
  } catch (error) {
    console.error('获取最新交易记录失败:', error);
    ElMessage.error('获取最新交易记录失败，请检查网络连接或API服务');
    latestTransactionList.value = [];
    latestTransactionPagination.value.total = 0;
  } finally {
    latestTransactionLoading.value = false;
  }
};

// 切换到账户列表视图
const switchToAccountView = () => {
  viewMode.value = 'account';
};

// 切换到交易记录视图
const switchToTransactionView = () => {
  viewMode.value = 'transaction';
  latestTransactionPagination.value.page = 1;
  fetchLatestTransactions();
};

// 最新交易记录分页变化
const handleLatestTransactionPageChange = (page: number) => {
  latestTransactionPagination.value.page = page;
  fetchLatestTransactions();
};

// 最新交易记录页面大小变化
const handleLatestTransactionSizeChange = (size: number) => {
  latestTransactionPagination.value.pageSize = size;
  latestTransactionPagination.value.page = 1;
  fetchLatestTransactions();
};

// 打开新增交易记录弹窗
const handleAddTransaction = () => {
  if (!selectedAccount.value) return;
  addTransactionFormData.accountId = selectedAccount.value.id;
  addTransactionFormData.caseId = selectedAccount.value.caseId || 0;
  addTransactionFormData.transactionType = '';
  addTransactionFormData.amount = 0;
  addTransactionFormData.transactionDate = '';
  addTransactionFormData.summary = '';
  addTransactionFormData.businessType = '';
  addTransactionFormData.counterpartyAccount = '';
  addTransactionFormData.counterpartyName = '';
  addTransactionFormData.remark = '';
  addTransactionDialogVisible.value = true;
};

// 关闭新增交易记录弹窗
const handleCloseAddTransactionDialog = () => {
  addTransactionDialogVisible.value = false;
  if (addTransactionFormRef.value) {
    addTransactionFormRef.value.resetFields();
  }
};

// 提交新增交易记录
const handleSubmitAddTransaction = async () => {
  if (!addTransactionFormRef.value) return;

  try {
    await addTransactionFormRef.value.validate();
    addTransactionFormLoading.value = true;

    const response = await createTransactionApi(addTransactionFormData);

    if (response.code === 200) {
      ElMessage.success('交易记录添加成功');
      handleCloseAddTransactionDialog();
      fetchAccountTransactions();
    } else {
      ElMessage.error(response.message || '交易记录添加失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    // 处理后端返回的业务异常
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      switch (errorMessage) {
        case '账户余额不足，无法完成流出交易':
          ElMessage.error('账户余额不足，无法完成流出交易');
          break;
        case '无效的交易类型，必须是 IN(流入) 或 OUT(流出)':
          ElMessage.error('无效的交易类型，必须是 流入(IN) 或 流出(OUT)');
          break;
        case '银行账户不存在':
          ElMessage.error('银行账户不存在');
          break;
        case '关联银行账户不存在':
          ElMessage.error('关联银行账户不存在');
          break;
        default:
          ElMessage.error(errorMessage);
      }
    } else {
      ElMessage.error('交易记录添加失败，请稍后重试');
    }
    console.error('添加交易记录失败:', error);
  } finally {
    addTransactionFormLoading.value = false;
  }
};

// 打开编辑交易记录弹窗
const handleEditTransaction = (
  row: BankAccountTransactionApi.TransactionInfo,
) => {
  editingTransaction.value = row;
  editTransactionFormData.transactionType = row.transactionType;
  editTransactionFormData.amount = row.amount;
  editTransactionFormData.transactionDate = row.transactionDate;
  editTransactionFormData.summary = row.summary || '';
  editTransactionFormData.businessType = row.businessType || '';
  editTransactionFormData.counterpartyAccount = row.counterpartyAccount || '';
  editTransactionFormData.counterpartyName = row.counterpartyName || '';
  editTransactionFormData.remark = row.remark || '';
  editTransactionDialogVisible.value = true;
};

// 关闭编辑交易记录弹窗
const handleCloseEditTransactionDialog = () => {
  editTransactionDialogVisible.value = false;
  editingTransaction.value = null;
  if (editTransactionFormRef.value) {
    editTransactionFormRef.value.resetFields();
  }
};

// 提交编辑交易记录
const handleSubmitEditTransaction = async () => {
  if (!editTransactionFormRef.value || !editingTransaction.value) return;

  try {
    await editTransactionFormRef.value.validate();
    editTransactionFormLoading.value = true;

    const response = await updateTransactionApi(
      editingTransaction.value.id,
      editTransactionFormData,
    );

    if (response.code === 200) {
      ElMessage.success('交易记录更新成功');
      handleCloseEditTransactionDialog();
      fetchAccountTransactions();
    } else {
      ElMessage.error(response.message || '交易记录更新失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    // 处理后端返回的业务异常
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      switch (errorMessage) {
        case '账户余额不足，无法完成流出交易':
          ElMessage.error('账户余额不足，无法完成流出交易');
          break;
        case '无效的交易类型，必须是 IN(流入) 或 OUT(流出)':
          ElMessage.error('无效的交易类型，必须是 流入(IN) 或 流出(OUT)');
          break;
        case '交易记录不存在':
          ElMessage.error('交易记录不存在');
          break;
        case '无权访问该交易记录':
          ElMessage.error('无权访问该交易记录');
          break;
        default:
          ElMessage.error(errorMessage);
      }
    } else {
      ElMessage.error('交易记录更新失败，请稍后重试');
    }
    console.error('更新交易记录失败:', error);
  } finally {
    editTransactionFormLoading.value = false;
  }
};

// 删除交易记录
const handleDeleteTransaction = async (
  row: BankAccountTransactionApi.TransactionInfo,
) => {
  try {
    await ElMessageBox.confirm('确定要删除该交易记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteTransactionApi(row.id);

    if (response.code === 200) {
      ElMessage.success('交易记录删除成功');
      fetchAccountTransactions();
    } else {
      ElMessage.error(response.message || '交易记录删除失败');
    }
  } catch (error: any) {
    if (error.name === 'ElMessageBoxCancel') {
      return;
    }
    // 处理后端返回的业务异常
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      switch (errorMessage) {
        case '交易记录不存在':
          ElMessage.error('交易记录不存在');
          break;
        case '无权访问该交易记录':
          ElMessage.error('无权访问该交易记录');
          break;
        default:
          ElMessage.error(errorMessage);
      }
    } else {
      ElMessage.error('交易记录删除失败，请稍后重试');
    }
    console.error('删除交易记录失败:', error);
  }
};

// 编辑账户表单数据
const editFormData = reactive({
  caseId: 0, // 案件ID
  caseNumber: '', // 案号，用于表单显示
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
  accountPurpose: '', // 账户用途
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
  { label: '中国邮政储蓄银行', value: '中国邮政储蓄银行' },
  { label: '广发银行', value: '广发银行' },
  { label: '平安银行', value: '平安银行' },
  { label: '华夏银行', value: '华夏银行' },
  { label: '光大银行', value: '光大银行' },
  { label: '北京银行', value: '北京银行' },
  { label: '上海银行', value: '上海银行' },
  { label: '南京银行', value: '南京银行' },
  { label: '宁波银行', value: '宁波银行' },
  { label: '恒丰银行', value: '恒丰银行' },
  { label: '浙商银行', value: '浙商银行' },
  { label: '渤海银行', value: '渤海银行' },
  { label: '杭州银行', value: '杭州银行' },
  { label: '江苏银行', value: '江苏银行' },
  { label: '徽商银行', value: '徽商银行' },
]);

// 账户类型选项
const accountTypeOptions = [
  { label: '基本户', value: '基本户' },
  { label: '一般户', value: '一般户' },
  { label: '专用户', value: '专用户' },
  { label: '外汇户 (FOREIGN)', value: 'FOREIGN' },
  { label: '保证金户 (MARGIN)', value: 'MARGIN' },
  { label: '结算户 (SETTLEMENT)', value: 'SETTLEMENT' },
  { label: '临时户 (TEMPORARY)', value: 'TEMPORARY' },
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

// 账户用途选项
const accountPurposeOptions = [
  { label: '日常经营', value: '日常经营' },
  { label: '项目专用', value: '项目专用' },
  { label: '资金结算', value: '资金结算' },
  { label: '工资发放', value: '工资发放' },
  { label: '其他', value: '其他' },
];

// 打开新增账户弹窗
const handleAddBankAccount = () => {
  dialogVisible.value = true;
  // 打开弹窗时加载案号列表
  getCaseList();
};

// 关闭新增账户弹窗
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 重置案号相关字段
  formData.caseId = 0;
  formData.caseNumber = '';
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
          <div class="flex items-center space-x-4">
            <span class="text-lg font-semibold">银行账户管理</span>
            <div class="flex items-center space-x-2">
              <ElButton
                :type="viewMode === 'account' ? 'primary' : 'default'"
                @click="switchToAccountView"
              >
                <i class="i-lucide-building-2 mr-1"></i>
                账户列表
              </ElButton>
              <ElButton
                :type="viewMode === 'transaction' ? 'primary' : 'default'"
                @click="switchToTransactionView"
              >
                <i class="i-lucide-list mr-1"></i>
                最新交易
              </ElButton>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <ElButton
              type="primary"
              @click="handleAddBankAccount"
              v-if="viewMode === 'account'"
            >
              <i class="i-lucide-plus mr-1"></i>
              新增账户
            </ElButton>
            <ElButton
              type="success"
              @click="exportBankAccountData"
              v-if="viewMode === 'account'"
            >
              <i class="i-lucide-download mr-1"></i>
              导出数据
            </ElButton>
            <ElButton
              type="primary"
              @click="handleRefresh"
              :loading="loading"
              v-if="viewMode === 'account'"
            >
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
            <ElButton
              type="primary"
              @click="fetchLatestTransactions"
              :loading="latestTransactionLoading"
              v-if="viewMode === 'transaction'"
            >
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <ElTable
        v-if="viewMode === 'account'"
        v-loading="loading"
        :data="bankAccountList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <!-- 行号列 -->
        <ElTableColumn type="index" label="序号" width="60" align="center" />

        <!-- 案号列 -->
        <ElTableColumn
          prop="caseNumber"
          label="案号"
          width="200"
          show-overflow-tooltip
        />

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

        <!-- 余额列 -->
        <ElTableColumn
          prop="currentBalance"
          label="当前余额"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.currentBalance) }}
          </template>
        </ElTableColumn>

        <!-- 总流入列 -->
        <ElTableColumn
          prop="totalInflow"
          label="总流入"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span v-if="row.totalInflow !== undefined" style="color: red; font-weight: bold; font-size: 18px;">
              {{ formatCurrency(row.totalInflow) }}
            </span>
            <span v-else style="color: #9ca3af;">
              <i class="i-lucide-loader-2 animate-spin"></i>
            </span>
          </template>
        </ElTableColumn>

        <!-- 总流出列 -->
        <ElTableColumn
          prop="totalOutflow"
          label="总流出"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span v-if="row.totalOutflow !== undefined" style="color: green; font-weight: bold; font-size: 18px;">
              {{ formatCurrency(row.totalOutflow) }}
            </span>
            <span v-else style="color: #9ca3af;">
              <i class="i-lucide-loader-2 animate-spin"></i>
            </span>
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
        <ElTableColumn label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <ElSpace size="small" wrap>
              <ElButton
                size="small"
                text
                @click="() => handleViewTransactions(row)"
                class="text-primary"
              >
                <i class="i-lucide-list mr-1"></i>
                交易记录
              </ElButton>
              <ElButton
                size="small"
                text
                @click="() => handleEditBankAccount(row)"
                class="text-primary"
              >
                <i class="i-lucide-edit mr-1"></i>
                编辑
              </ElButton>
              <ElButton
                size="small"
                text
                @click="() => handleDeleteBankAccount(row)"
                class="text-danger"
              >
                <i class="i-lucide-trash-2 mr-1"></i>
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 最新交易记录表格 -->
      <ElTable
        v-if="viewMode === 'transaction'"
        v-loading="latestTransactionLoading"
        :data="latestTransactionList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />

        <ElTableColumn
          prop="accountName"
          label="账户名称"
          width="150"
          show-overflow-tooltip
        />

        <ElTableColumn
          prop="accountNumber"
          label="账户号码"
          width="180"
          show-overflow-tooltip
        />

        <ElTableColumn
          prop="bankName"
          label="开户行"
          width="120"
          show-overflow-tooltip
        />

        <ElTableColumn
          prop="transactionDate"
          label="交易日期"
          width="120"
          align="center"
        />

        <ElTableColumn
          prop="transactionType"
          label="交易类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag
              :type="getTransactionTypeType(row.transactionType)"
              size="small"
            >
              {{ getTransactionTypeText(row.transactionType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="amount" label="交易金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.amount) }}
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="businessType"
          label="业务类型"
          width="100"
          align="center"
        />

        <ElTableColumn
          prop="summary"
          label="交易摘要"
          width="200"
          show-overflow-tooltip
        />

        <ElTableColumn
          prop="counterpartyName"
          label="对方名称"
          width="120"
          show-overflow-tooltip
        />

        <ElTableColumn
          prop="balanceAfter"
          label="交易后余额"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.balanceAfter) }}
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="createTime"
          label="创建时间"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            {{ new Date(row.createTime).toLocaleString('zh-CN') }}
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页组件 -->
      <div class="mt-4 flex justify-end" v-if="viewMode === 'account'">
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

      <!-- 最新交易记录分页组件 -->
      <div class="mt-4 flex justify-end" v-if="viewMode === 'transaction'">
        <ElPagination
          v-model:current-page="latestTransactionPagination.page"
          v-model:page-size="latestTransactionPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="latestTransactionPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleLatestTransactionSizeChange"
          @current-change="handleLatestTransactionPageChange"
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
              <ElFormItem label="案号" prop="caseNumber">
                <ElSelect
                  v-model="formData.caseNumber"
                  placeholder="请选择或搜索案号"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="getCaseList"
                  :loading="caseLoading"
                  @change="handleCaseSelect"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="item in caseList"
                    :key="item.id"
                    :label="item.caseNumber"
                    :value="item.caseNumber"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
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
          </ElRow>
          <ElRow :gutter="30">
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
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账户用途" prop="accountPurpose">
                <ElSelect
                  v-model="formData.accountPurpose"
                  placeholder="请选择账户用途"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in accountPurposeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
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
              <ElFormItem label="案号" prop="caseNumber">
                <ElSelect
                  v-model="editFormData.caseNumber"
                  placeholder="请选择或搜索案号"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="getCaseList"
                  :loading="caseLoading"
                  @change="
                    (value) => {
                      editFormData.caseNumber = value;
                      const selectedCase = caseList.value.find(
                        (item) => item.caseNumber === value,
                      );
                      if (selectedCase) {
                        editFormData.caseId = selectedCase.id;
                      }
                    }
                  "
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="item in caseList"
                    :key="item.id"
                    :label="item.caseNumber"
                    :value="item.caseNumber"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
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
          </ElRow>
          <ElRow :gutter="30">
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
                  readonly
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
          <ElRow :gutter="30">
            <ElCol :span="12">
              <ElFormItem label="账户用途" prop="accountPurpose">
                <ElSelect
                  v-model="editFormData.accountPurpose"
                  placeholder="请选择账户用途"
                  style="width: 100%"
                  size="large"
                >
                  <ElOption
                    v-for="option in accountPurposeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
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

      <!-- 交易记录弹窗 -->
      <ElDialog
        v-model="transactionDialogVisible"
        :title="`交易记录 - ${selectedAccount?.accountName || ''} (${selectedAccount?.accountNumber || ''})`"
        width="90%"
        :before-close="handleCloseTransactionDialog"
        class="transaction-dialog"
      >
        <!-- 筛选条件 -->
        <div class="mb-4">
          <ElRow :gutter="16">
            <ElCol :span="6">
              <ElFormItem label="交易类型" label-width="80px">
                <ElSelect
                  v-model="transactionFilters.transactionType"
                  placeholder="请选择交易类型"
                  clearable
                  style="width: 100%"
                >
                  <ElOption label="流入" value="IN" />
                  <ElOption label="流出" value="OUT" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="业务类型" label-width="80px">
                <ElSelect
                  v-model="transactionFilters.businessType"
                  placeholder="请选择业务类型"
                  clearable
                  style="width: 100%"
                >
                  <ElOption label="收款" value="收款" />
                  <ElOption label="付款" value="付款" />
                  <ElOption label="转账" value="转账" />
                  <ElOption label="利息收入" value="利息收入" />
                  <ElOption label="手续费" value="手续费" />
                  <ElOption label="其他" value="其他" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="开始日期" label-width="80px">
                <ElDatePicker
                  v-model="transactionFilters.startDate"
                  type="date"
                  placeholder="选择开始日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="结束日期" label-width="80px">
                <ElDatePicker
                  v-model="transactionFilters.endDate"
                  type="date"
                  placeholder="选择结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <div class="mb-4 flex justify-between">
            <div>
              <ElButton type="primary" @click="handleAddTransaction">
                <i class="i-lucide-plus mr-1"></i>
                新增交易记录
              </ElButton>
            </div>
            <div>
              <ElButton type="primary" @click="handleSearchTransactions">
                <i class="i-lucide-search mr-1"></i>
                搜索
              </ElButton>
              <ElButton @click="handleResetTransactionFilters">
                <i class="i-lucide-refresh-cw mr-1"></i>
                重置
              </ElButton>
            </div>
          </div>
        </div>

        <!-- 交易记录表格 -->
        <ElTable
          v-loading="transactionLoading"
          :data="transactionList"
          :border="true"
          :stripe="true"
          :style="{ width: '100%' }"
        >
          <ElTableColumn type="index" label="序号" width="60" align="center" />

          <ElTableColumn
            prop="transactionDate"
            label="交易日期"
            width="120"
            align="center"
          />

          <ElTableColumn
            prop="transactionType"
            label="交易类型"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <ElTag
                :type="getTransactionTypeType(row.transactionType)"
                size="small"
              >
                {{ getTransactionTypeText(row.transactionType) }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="amount"
            label="交易金额"
            width="150"
            align="right"
          >
            <template #default="{ row }">
              <span 
                :style="{
                  color: row.transactionType === 'IN' ? 'red' : 'green',
                  'font-weight': 'bold',
                  'font-size': '18px'
                }"
              >
                {{ formatCurrency(row.amount) }}
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="businessType"
            label="业务类型"
            width="100"
            align="center"
          />

          <ElTableColumn
            prop="summary"
            label="交易摘要"
            width="200"
            show-overflow-tooltip
          />

          <ElTableColumn
            prop="counterpartyName"
            label="对方名称"
            width="120"
            show-overflow-tooltip
          />

          <ElTableColumn
            prop="counterpartyAccount"
            label="对方账户"
            width="180"
            show-overflow-tooltip
          />

          <ElTableColumn
            prop="balanceAfter"
            label="交易后余额"
            width="150"
            align="right"
          >
            <template #default="{ row }">
              {{ formatCurrency(row.balanceAfter) }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="remark"
            label="备注"
            width="200"
            show-overflow-tooltip
          />

          <ElTableColumn
            prop="createTime"
            label="创建时间"
            width="160"
            align="center"
          >
            <template #default="{ row }">
              {{ new Date(row.createTime).toLocaleString('zh-CN') }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton
                size="small"
                text
                @click="() => handleEditTransaction(row)"
                class="text-primary"
              >
                <i class="i-lucide-edit mr-1"></i>
                编辑
              </ElButton>
              <ElButton
                size="small"
                text
                @click="() => handleDeleteTransaction(row)"
                class="text-danger ml-2"
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
            v-model:current-page="transactionPagination.page"
            v-model:page-size="transactionPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="transactionPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleTransactionSizeChange"
            @current-change="handleTransactionPageChange"
          />
        </div>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseTransactionDialog">关闭</ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 新增交易记录弹窗 -->
      <ElDialog
        v-model="addTransactionDialogVisible"
        title="新增交易记录"
        width="700px"
        :before-close="handleCloseAddTransactionDialog"
      >
        <ElForm
          ref="addTransactionFormRef"
          :model="addTransactionFormData"
          label-width="120px"
          label-position="top"
        >
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易类型" required>
                <ElSelect
                  v-model="addTransactionFormData.transactionType"
                  placeholder="请选择交易类型"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in transactionTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="交易金额" required>
                <ElInputNumber
                  v-model="addTransactionFormData.amount"
                  :min="0"
                  :precision="2"
                  placeholder="请输入交易金额"
                  style="width: 100%"
                  :controls="false"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易日期" required>
                <ElDatePicker
                  v-model="addTransactionFormData.transactionDate"
                  type="date"
                  placeholder="选择交易日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="业务类型">
                <ElSelect
                  v-model="addTransactionFormData.businessType"
                  placeholder="请选择业务类型"
                  clearable
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in businessTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="交易摘要">
                <ElInput
                  v-model="addTransactionFormData.summary"
                  placeholder="请输入交易摘要"
                  maxlength="500"
                  show-word-limit
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="对方名称">
                <ElInput
                  v-model="addTransactionFormData.counterpartyName"
                  placeholder="请输入对方名称"
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="对方账户">
                <ElInput
                  v-model="addTransactionFormData.counterpartyAccount"
                  placeholder="请输入对方账户"
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="addTransactionFormData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注"
                  maxlength="500"
                  show-word-limit
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseAddTransactionDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleSubmitAddTransaction"
              :loading="addTransactionFormLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 编辑交易记录弹窗 -->
      <ElDialog
        v-model="editTransactionDialogVisible"
        title="编辑交易记录"
        width="700px"
        :before-close="handleCloseEditTransactionDialog"
      >
        <ElForm
          ref="editTransactionFormRef"
          :model="editTransactionFormData"
          label-width="120px"
          label-position="top"
        >
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易类型" required>
                <ElSelect
                  v-model="editTransactionFormData.transactionType"
                  placeholder="请选择交易类型"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in transactionTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="交易金额" required>
                <ElInputNumber
                  v-model="editTransactionFormData.amount"
                  :min="0"
                  :precision="2"
                  placeholder="请输入交易金额"
                  style="width: 100%"
                  :controls="false"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易日期" required>
                <ElDatePicker
                  v-model="editTransactionFormData.transactionDate"
                  type="date"
                  placeholder="选择交易日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="业务类型">
                <ElSelect
                  v-model="editTransactionFormData.businessType"
                  placeholder="请选择业务类型"
                  clearable
                  style="width: 100%"
                >
                  <ElOption
                    v-for="option in businessTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="交易摘要">
                <ElInput
                  v-model="editTransactionFormData.summary"
                  placeholder="请输入交易摘要"
                  maxlength="500"
                  show-word-limit
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="对方名称">
                <ElInput
                  v-model="editTransactionFormData.counterpartyName"
                  placeholder="请输入对方名称"
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="对方账户">
                <ElInput
                  v-model="editTransactionFormData.counterpartyAccount"
                  placeholder="请输入对方账户"
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput
                  v-model="editTransactionFormData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注"
                  maxlength="500"
                  show-word-limit
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="handleCloseEditTransactionDialog">取消</ElButton>
            <ElButton
              type="primary"
              @click="handleSubmitEditTransaction"
              :loading="editTransactionFormLoading"
            >
              确定
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>
