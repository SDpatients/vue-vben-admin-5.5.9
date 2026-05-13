<script lang="ts" setup>
import type { BankAccountApi } from '#/api/core/bank-account';
import type { BankAccountTransactionApi } from '#/api/core/bank-account-transaction';
import type { ExportColumnConfig } from '#/utils/export-excel';
import type { FormInstance, FormRules } from 'element-plus';

import { onMounted, reactive, ref } from 'vue';

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
import { SensitiveDataApi } from '#/api/core/sensitive-data';
import { exportToExcel } from '#/utils/export-excel';
import { isMaskedDisplayValue } from '#/utils/password-validator';
import SensitiveDataDialog from '#/components/SensitiveDataDialog.vue';
import TemplateExportDialog from '#/components/TemplateExportDialog.vue';

// ==================== 响应式数据 ====================
const bankAccountList = ref<BankAccountApi.BankAccountInfo[]>([]);
const loading = ref(false);

interface Pagination {
  page: number;
  pageSize: number;
  itemCount: number;
  pages: number;
}

const pagination = ref<Pagination>(({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
}));

// 搜索关键词
const searchKeyword = ref('');

// 模板导出相关
const templateExportVisible = ref(false);
const selectedBankAccountIds = ref<number[]>([]);

const sensitiveDialogVisible = ref(false);
const sensitiveDataType = ref('');
const sensitiveId = ref(0);
const sensitiveLabel = ref('');

const openSensitiveDialog = (dataType: string, id: number, label: string) => {
  sensitiveDataType.value = dataType;
  sensitiveId.value = id;
  sensitiveLabel.value = label;
  sensitiveDialogVisible.value = true;
};

// 银行账户字段与模板字段的映射
const bankAccountFieldMapping: Record<string, string> = {
  caseNumber: '案号',
  accountName: '账户名称',
  accountNumber: '账户号码',
  bankName: '银行名称',
  accountType: '账户类型',
  currentBalance: '当前余额',
  totalInflow: '总流入',
  totalOutflow: '总流出',
  status: '状态',
};

// 处理表格多选变化
const handleSelectionChange = (selection: any[]) => {
  selectedBankAccountIds.value = selection.map((item) => item.id);
};

// 获取选中的银行账户数据
const getSelectedBankAccountData = () => {
  return bankAccountList.value.filter((b) =>
    selectedBankAccountIds.value.includes(b.id),
  );
};

// ==================== 列显示控制 ====================
const columnVisible = ref<string[]>([]);

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

const isColumnVisible = (columnName: string) => {
  return columnVisible.value.includes(columnName);
};

const initColumnVisibility = () => {
  columnVisible.value = availableColumns.filter((column) =>
    defaultColumns.has(column),
  );
};

// ==================== 银行账户列表 ====================
const fetchBankAccountList = async () => {
  loading.value = true;
  try {
    const params: BankAccountApi.BankAccountQueryParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };

    // 如果有搜索关键词，添加到参数
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim();
    }

    const response = await getBankAccountListApi(params);

    if (response.code === 200) {
      bankAccountList.value = response.data.list || [];
      pagination.value.itemCount = response.data.total || 0;
      pagination.value.pages =
        Math.ceil(pagination.value.itemCount / pagination.value.pageSize) || 0;

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

// 搜索银行账户
const handleSearch = () => {
  pagination.value.page = 1;
  fetchBankAccountList();
};

// 重置搜索
const handleResetSearch = () => {
  searchKeyword.value = '';
  pagination.value.page = 1;
  fetchBankAccountList();
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

// ==================== 格式化函数 ====================
const formatDateTime = (timestamp: number | string | undefined) => {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '-';
  }
};

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '-';
  if (amount === 0) return '¥0.00';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
};

// ==================== 状态相关 ====================
const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case '启动': {
      return 'success';
    }
    case 'INACTIVE':
    case '销户': {
      return 'info';
    }
    case '冻结': {
      return 'danger';
    }
    default: {
      return 'warning';
    }
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': {
      return '正常';
    }
    case 'INACTIVE': {
      return '停用';
    }
    default: {
      return status;
    }
  }
};

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

// ==================== 编辑银行账户 ====================
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const editFormLoading = ref(false);
const editingRow = ref<BankAccountApi.BankAccountInfo | null>(null);

const editFormData = reactive({
  caseId: 0,
  caseNumber: '',
  accountName: '',
  accountNumber: '',
  accountType: '',
  openingBank: '',
  password: '',
  currentBalance: 0,
  currency: '',
  openingDate: '',
  closingDate: null as null | string,
  status: 'ACTIVE',
  accountPurpose: '',
});

const handleEditBankAccount = (row: BankAccountApi.BankAccountInfo) => {
  editingRow.value = row;
  editFormData.caseId = row.caseId || 0;
  editFormData.caseNumber = row.caseNumber || '';
  editFormData.accountName = row.accountName;
  editFormData.accountNumber = row.accountNumber;
  editFormData.accountType = row.accountType;
  editFormData.openingBank = row.bankName;
  editFormData.password = '******';
  editFormData.currentBalance = row.currentBalance;
  editFormData.currency = row.currency || '';
  editFormData.openingDate = row.openingDate || '';
  editFormData.closingDate = row.closingDate || null;
  editFormData.status = row.status;
  editFormData.accountPurpose = row.accountPurpose || '';
  editDialogVisible.value = true;
};

const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  editingRow.value = null;
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

const handleEditSubmit = async () => {
  if (!editFormRef.value || !editingRow.value) return;

  try {
    await editFormRef.value.validate();
    editFormLoading.value = true;

    const { password, ...restFormData } = editFormData;
    const submitData = {
      ...restFormData,
      bankName: editFormData.openingBank,
      openingBank: undefined,
    };

    const response = await updateBankAccountApi(
      editingRow.value.id,
      submitData,
    );

    if (response.code === 200) {
      ElMessage.success('银行账户更新成功');
      handleCloseEditDialog();
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '银行账户更新失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    ElMessage.error('银行账户更新失败，请稍后重试');
    console.error('更新银行账户失败:', error);
  } finally {
    editFormLoading.value = false;
  }
};

// ==================== 删除银行账户 ====================
const handleDeleteBankAccount = async (
  row: BankAccountApi.BankAccountInfo,
) => {
  try {
    await ElMessageBox.confirm('确定要删除该银行账户吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteBankAccountApi(row.id);

    if (response.code === 200) {
      ElMessage.success('银行账户删除成功');
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

// ==================== 导出Excel ====================
const exportBankAccountData = () => {
  if (bankAccountList.value.length === 0) {
    ElMessage.warning('当前没有数据可导出');
    return;
  }

  const exportColumns: ExportColumnConfig[] = [
    { field: 'id', title: 'ID', width: 8 },
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
      formatter: (value) => formatDateTime(value),
    },
    {
      field: 'updateTime',
      title: '更新时间',
      width: 12,
      formatter: (value) => formatDateTime(value),
    },
    {
      field: 'status',
      title: '状态',
      width: 8,
      formatter: (value) => getStatusText(value) || '-',
    },
  ];

  try {
    exportToExcel({
      data: bankAccountList.value,
      fileName: '管理人银行账户数据',
      sheetName: '银行账户',
      columns: exportColumns,
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('数据导出失败，请重试');
  }
};

// ==================== 新增银行账户 ====================
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formLoading = ref(false);

const statusOptions = [
  { label: '激活', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
];

const caseList = ref<any[]>([]);
const caseLoading = ref(false);

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

const handleCaseSelect = (value: string) => {
  formData.caseNumber = value;
  const selectedCase = caseList.value.find(
    (item) => item.caseNumber === value,
  );
  if (selectedCase) {
    formData.caseId = selectedCase.id;
  }
};

const formData = reactive({
  caseId: 0,
  caseNumber: '',
  accountName: '',
  accountNumber: '',
  accountType: '',
  openingBank: '',
  password: '',
  currentBalance: 0,
  currency: '',
  openingDate: '',
  closingDate: null as null | string,
  status: 'ACTIVE',
  accountPurpose: '',
});

// 表单验证规则
const rules: FormRules = {
  accountName: [
    { required: true, message: '请输入账户名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  accountNumber: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 5, max: 50, message: '长度在 5 到 50 个字符', trigger: 'blur' },
  ],
  openingBank: [
    { required: true, message: '请选择开户行', trigger: 'change' },
  ],
  accountType: [
    { required: true, message: '请选择账户类型', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' },
  ],
  currentBalance: [
    { required: true, message: '请输入当前余额', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

const handleAddBankAccount = () => {
  dialogVisible.value = true;
  getCaseList();
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.caseId = 0;
  formData.caseNumber = '';
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    formLoading.value = true;

    const submitData = {
      ...formData,
      bankName: formData.openingBank,
      openingBank: undefined,
    };

    const response = await addBankAccountApi(submitData);

    if (response.code === 200) {
      ElMessage.success('银行账户添加成功');
      dialogVisible.value = false;
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '银行账户添加失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    ElMessage.error('银行账户添加失败，请稍后重试');
    console.error('添加银行账户失败:', error);
  } finally {
    formLoading.value = false;
  }
};

// ==================== 交易记录（流水模块）====================
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
const addTransactionFormRef = ref<FormInstance>();
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
const editTransactionFormRef = ref<FormInstance>();
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

// 交易记录表单验证规则
const transactionRules: FormRules = {
  transactionType: [
    { required: true, message: '请选择交易类型', trigger: 'change' },
  ],
  amount: [
    { required: true, message: '请输入交易金额', trigger: 'blur' },
    {
      type: 'number',
      min: 0.01,
      message: '金额必须大于0',
      trigger: 'blur',
    },
  ],
  transactionDate: [
    { required: true, message: '请选择交易日期', trigger: 'change' },
  ],
};

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

const transactionTypeOptions = [
  { label: '流入', value: 'IN' },
  { label: '流出', value: 'OUT' },
];

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

// 获取交易类型标签类型 - 流入用success(绿色/红色表示收入)，流出用danger
const getTransactionTypeType = (type: string) => {
  return type === 'IN' ? 'success' : 'danger';
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
      // 刷新账户列表以更新余额
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '交易记录添加失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
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
      // 刷新账户列表以更新余额
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '交易记录更新失败');
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') {
      return;
    }
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
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
      // 刷新账户列表以更新余额
      fetchBankAccountList();
    } else {
      ElMessage.error(response.message || '交易记录删除失败');
    }
  } catch (error: any) {
    if (error.name === 'ElMessageBoxCancel') {
      return;
    }
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('交易记录删除失败，请稍后重试');
    }
    console.error('删除交易记录失败:', error);
  }
};

// ==================== 选项数据 ====================
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

const accountTypeOptions = [
  { label: '基本户', value: '基本户' },
  { label: '一般户', value: '一般户' },
  { label: '专用户', value: '专用户' },
  { label: '外汇户 (FOREIGN)', value: 'FOREIGN' },
  { label: '保证金户 (MARGIN)', value: 'MARGIN' },
  { label: '结算户 (SETTLEMENT)', value: 'SETTLEMENT' },
  { label: '临时户 (TEMPORARY)', value: 'TEMPORARY' },
];

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

const accountPurposeOptions = [
  { label: '日常经营', value: '日常经营' },
  { label: '项目专用', value: '项目专用' },
  { label: '资金结算', value: '资金结算' },
  { label: '工资发放', value: '工资发放' },
  { label: '其他', value: '其他' },
];
</script>

<template>
  <div class="p-6">
    <ElCard header="管理人银行账户" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-lg font-semibold">管理人银行账户</span>
            <span class="ml-3 text-sm text-gray-400"
              >（仅能查看到自己创建的银行账户）</span
            >
            <div class="flex items-center space-x-2 ml-4">
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
            <template v-if="viewMode === 'account'">
              <ElButton type="primary" @click="handleAddBankAccount">
                <i class="i-lucide-plus mr-1"></i>
                新增账户
              </ElButton>
              <ElButton type="success" @click="exportBankAccountData">
                <i class="i-lucide-download mr-1"></i>
                导出数据
              </ElButton>
              <ElButton
                type="primary"
                @click="handleRefresh"
                :loading="loading"
              >
                <i class="i-lucide-refresh-cw mr-1"></i>
                刷新
              </ElButton>
            </template>
            <template v-else>
              <ElButton
                type="primary"
                @click="fetchLatestTransactions"
                :loading="latestTransactionLoading"
              >
                <i class="i-lucide-refresh-cw mr-1"></i>
                刷新
              </ElButton>
            </template>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div v-if="viewMode === 'account'" class="mb-4">
        <ElRow :gutter="16">
          <ElCol :span="6">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索账户名称/账号"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <i class="i-lucide-search"></i>
              </template>
            </ElInput>
          </ElCol>
          <ElCol :span="6">
            <ElButton type="primary" @click="handleSearch">搜索</ElButton>
            <ElButton @click="handleResetSearch">重置</ElButton>
          </ElCol>
        </ElRow>
      </div>

      <!-- 账户列表表格 -->
      <ElTable
        v-if="viewMode === 'account'"
        v-loading="loading"
        :data="bankAccountList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <ElTableColumn type="selection" width="55" />
        <!-- 行号列 -->
        <ElTableColumn type="index" label="序号" width="60" align="center" />

        <!-- 案号列 -->
        <ElTableColumn
          v-if="isColumnVisible('行号')"
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

        <!-- 银行名称列 -->
        <ElTableColumn
          v-if="isColumnVisible('银行名称')"
          prop="bankName"
          label="开户行"
          width="150"
          show-overflow-tooltip
        />

        <!-- 账户号码列 -->
        <ElTableColumn
          v-if="isColumnVisible('账户号码')"
          prop="accountNumber"
          label="账户号码"
          width="250"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="mono-text">{{ row.accountNumber }}</span>
            <ElButton
              v-if="isMaskedDisplayValue(row.accountNumber)"
              size="small"
              text
              type="primary"
              class="ml-1"
              @click="openSensitiveDialog('BANK_ACCOUNT_NUMBER', row.id, SensitiveDataApi.DataTypeLabels.BANK_ACCOUNT_NUMBER)"
            >
              查看
            </ElButton>
          </template>
        </ElTableColumn>

        <!-- 账户类型列 -->
        <ElTableColumn
          v-if="isColumnVisible('账户类型')"
          prop="accountType"
          label="账户类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getAccountType(row.accountType)" size="small">
              {{ accountTypeTranslation[row.accountType] || row.accountType }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 余额列 -->
        <ElTableColumn
          v-if="isColumnVisible('当前余额')"
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
          v-if="isColumnVisible('总流入')"
          prop="totalInflow"
          label="总流入"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span
              v-if="row.totalInflow !== undefined"
              style="color: #67c23a; font-weight: bold"
            >
              {{ formatCurrency(row.totalInflow) }}
            </span>
            <span v-else style="color: #9ca3af">
              <i class="i-lucide-loader-2 animate-spin"></i>
            </span>
          </template>
        </ElTableColumn>

        <!-- 总流出列 -->
        <ElTableColumn
          v-if="isColumnVisible('总流出')"
          prop="totalOutflow"
          label="总流出"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span
              v-if="row.totalOutflow !== undefined"
              style="color: #f56c6c; font-weight: bold"
            >
              {{ formatCurrency(row.totalOutflow) }}
            </span>
            <span v-else style="color: #9ca3af">
              <i class="i-lucide-loader-2 animate-spin"></i>
            </span>
          </template>
        </ElTableColumn>

        <!-- 创建时间列 -->
        <ElTableColumn
          v-if="isColumnVisible('创建时间')"
          prop="createTime"
          label="创建时间"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </ElTableColumn>

        <!-- 状态列 -->
        <ElTableColumn
          v-if="isColumnVisible('状态')"
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <ElSpace size="small" wrap>
              <ElButton
                size="small"
                text
                @click="() => handleViewTransactions(row)"
                class="text-primary"
              >
                <i class="i-lucide-list mr-1"></i>
                流水记录
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
          width="250"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="mono-text">{{ row.accountNumber }}</span>
            <ElButton
              v-if="isMaskedDisplayValue(row.accountNumber)"
              size="small"
              text
              type="primary"
              class="ml-1"
              @click="openSensitiveDialog('BANK_ACCOUNT_NUMBER', row.accountId, SensitiveDataApi.DataTypeLabels.BANK_ACCOUNT_NUMBER)"
            >
              查看
            </ElButton>
          </template>
        </ElTableColumn>

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
            <span
              :style="{
                color: row.transactionType === 'IN' ? '#67c23a' : '#f56c6c',
                fontWeight: 'bold',
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
            {{ formatDateTime(row.createTime) }}
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

      <!-- ==================== 新增银行账户弹窗 ==================== -->
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
          </ElRow>
          <ElRow :gutter="30">
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
          </ElRow>
          <ElRow :gutter="30">
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

      <!-- ==================== 编辑银行账户弹窗 ==================== -->
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
          </ElRow>
          <ElRow :gutter="30">
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
          </ElRow>
          <ElRow :gutter="30">
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

      <!-- ==================== 交易记录（流水）弹窗 ==================== -->
      <ElDialog
        v-model="transactionDialogVisible"
        :title="`流水记录 - ${selectedAccount?.accountName || ''} (${selectedAccount?.accountNumber || ''})`"
        width="90%"
        :before-close="handleCloseTransactionDialog"
        class="transaction-dialog"
        destroy-on-close
      >
        <!-- 账户信息摘要 -->
        <div
          v-if="selectedAccount"
          class="mb-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center"
        >
          <div class="flex space-x-6">
            <div>
              <span class="text-gray-500">当前余额：</span>
              <span class="text-lg font-bold text-primary">{{
                formatCurrency(selectedAccount.currentBalance)
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">开户行：</span>
              <span>{{ selectedAccount.bankName }}</span>
            </div>
            <div>
              <span class="text-gray-500">案号：</span>
              <span>{{ selectedAccount.caseNumber || '-' }}</span>
            </div>
          </div>
          <div>
            <ElTag :type="getStatusType(selectedAccount.status)" size="small">
              {{ getStatusText(selectedAccount.status) }}
            </ElTag>
          </div>
        </div>

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
                新增流水
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
          <ElTableColumn
            type="index"
            label="序号"
            width="60"
            align="center"
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

          <ElTableColumn
            prop="amount"
            label="交易金额"
            width="150"
            align="right"
          >
            <template #default="{ row }">
              <span
                :style="{
                  color: row.transactionType === 'IN' ? '#67c23a' : '#f56c6c',
                  fontWeight: 'bold',
                  fontSize: '16px',
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
              {{ formatDateTime(row.createTime) }}
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

      <!-- ==================== 新增流水弹窗 ==================== -->
      <ElDialog
        v-model="addTransactionDialogVisible"
        title="新增流水记录"
        width="700px"
        :before-close="handleCloseAddTransactionDialog"
      >
        <ElForm
          ref="addTransactionFormRef"
          :model="addTransactionFormData"
          :rules="transactionRules"
          label-width="120px"
          label-position="top"
        >
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易类型" prop="transactionType">
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
              <ElFormItem label="交易金额" prop="amount">
                <ElInputNumber
                  v-model="addTransactionFormData.amount"
                  :min="0.01"
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
              <ElFormItem label="交易日期" prop="transactionDate">
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

      <!-- ==================== 编辑流水弹窗 ==================== -->
      <ElDialog
        v-model="editTransactionDialogVisible"
        title="编辑流水记录"
        width="700px"
        :before-close="handleCloseEditTransactionDialog"
      >
        <ElForm
          ref="editTransactionFormRef"
          :model="editTransactionFormData"
          :rules="transactionRules"
          label-width="120px"
          label-position="top"
        >
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="交易类型" prop="transactionType">
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
              <ElFormItem label="交易金额" prop="amount">
                <ElInputNumber
                  v-model="editTransactionFormData.amount"
                  :min="0.01"
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
              <ElFormItem label="交易日期" prop="transactionDate">
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
            <ElButton @click="handleCloseEditTransactionDialog"
              >取消</ElButton
            >
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

      <!-- 模板导出对话框 -->
      <TemplateExportDialog
        v-model:visible="templateExportVisible"
        :selected-data="getSelectedBankAccountData()"
        :field-mapping="bankAccountFieldMapping"
        default-file-name="银行账户批量数据"
        default-sheet-name="银行账户列表"
      />

      <!-- 查看敏感数据弹窗 -->
      <SensitiveDataDialog
        v-model:visible="sensitiveDialogVisible"
        :data-type="sensitiveDataType"
        :id="sensitiveId"
        :label="sensitiveLabel"
      />
    </ElCard>
  </div>
</template>

<style scoped>
.bank-account-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.bank-account-form :deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 4px;
}

.transaction-dialog :deep(.el-dialog__body) {
  padding: 15px 20px;
}

.text-primary {
  color: var(--el-color-primary);
}

.text-danger {
  color: var(--el-color-danger);
}

.mono-text {
  font-family: monospace;
}
</style>
