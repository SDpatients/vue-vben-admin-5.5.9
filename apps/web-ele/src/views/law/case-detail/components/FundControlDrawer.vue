<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import { Icon } from '@iconify/vue';
import {
  ElDrawer,
  ElTabs,
  ElTabPane,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElDatePicker,
  ElPagination,
  ElDialog,
} from 'element-plus';

import {
  getFundAccountList,
  createFundAccount,
  updateFundAccount,
  updateFundAccountStatus,
} from '#/api/core/fund-account';
import {
  getFundFlowList,
  createFundFlow,
} from '#/api/core/fund-flow';
import {
  getFundCategoryListApi,
} from '#/api/core/fund';

const props = defineProps<{
  caseId: string;
  caseNo: string;
  caseName: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const drawerVisible = ref(false);
const activeTab = ref('account');

const openDrawer = () => {
  drawerVisible.value = true;
  if (activeTab.value === 'account') {
    fetchFundAccounts();
  } else {
    fetchFundFlows();
  }
};

const closeDrawer = () => {
  drawerVisible.value = false;
  emit('close');
};

const handleTabChange = (tabName: string) => {
  if (tabName === 'account') {
    fetchFundAccounts();
  } else {
    fetchFundFlows();
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

const formatAmount = (amount: number) => {
  return (amount || 0).toFixed(2);
};

defineExpose({
  openDrawer,
});

const accountLoading = ref(false);
const accountCurrentPage = ref(1);
const accountPageSize = ref(10);
const accountTotal = ref(0);
const fundAccounts = ref<any[]>([]);

const accountSearchForm = reactive({
  accountName: '',
});

const accountDialogVisible = ref(false);
const accountDialogTitle = ref('新增账户');
const accountEditMode = ref(false);
const accountFormRef = ref();
const accountForm = reactive({
  accountId: 0,
  caseNo: props.caseNo,
  caseName: props.caseName,
  accountName: '',
  accountType: '',
  initialBalance: 0,
  currentBalance: 0,
  bankName: '',
  bankAccount: '',
  status: 'ACTIVE',
  createUser: 'admin',
  updateUser: 'admin',
});

const accountTypeOptions = [
  { label: '基本户', value: '基本户' },
  { label: '一般户', value: '一般户' },
  { label: '专用户', value: '专用户' },
];

const statusOptions = [
  { label: '正常', value: 'ACTIVE' },
  { label: '冻结', value: 'INACTIVE' },
];

const bankOptions = [
  { label: '中国银行', value: '中国银行' },
  { label: '中国建设银行', value: '中国建设银行' },
  { label: '中国工商银行', value: '中国工商银行' },
  { label: '中国农业银行', value: '中国农业银行' },
  { label: '招商银行', value: '招商银行' },
  { label: '交通银行', value: '交通银行' },
];

const fetchFundAccounts = async () => {
  accountLoading.value = true;
  try {
    const response = await getFundAccountList({
      pageNum: accountCurrentPage.value,
      pageSize: accountPageSize.value,
      caseId: Number(props.caseId),
      status: 'ACTIVE',
    });
    fundAccounts.value = response.data.list;
    accountTotal.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取账户列表失败');
    console.error('获取账户列表失败:', error);
    fundAccounts.value = [];
    accountTotal.value = 0;
  } finally {
    accountLoading.value = false;
  }
};

const handleAccountSearch = () => {
  accountCurrentPage.value = 1;
  fetchFundAccounts();
};

const handleAccountReset = () => {
  accountSearchForm.accountName = '';
  accountCurrentPage.value = 1;
  fetchFundAccounts();
};

const openAddAccountDialog = () => {
  accountDialogTitle.value = '新增账户';
  accountEditMode.value = false;
  resetAccountForm();
  accountDialogVisible.value = true;
};

const openEditAccountDialog = (account: any) => {
  accountDialogTitle.value = '编辑账户';
  accountEditMode.value = true;
  Object.assign(accountForm, account);
  accountDialogVisible.value = true;
};

const resetAccountForm = () => {
  if (accountFormRef.value) {
    accountFormRef.value.resetFields();
  }
  Object.assign(accountForm, {
    accountId: 0,
    caseNo: props.caseNo,
    caseName: props.caseName,
    accountName: '',
    accountType: '',
    initialBalance: 0,
    currentBalance: 0,
    bankName: '',
    bankAccount: '',
    status: 'ACTIVE',
    createUser: 'admin',
    updateUser: 'admin',
  });
};

const saveAccount = async () => {
  if (!accountFormRef.value) return;
  
  await accountFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      accountLoading.value = true;
      try {
        if (accountEditMode.value) {
          await updateFundAccount(accountForm.accountId, {
            accountId: accountForm.accountId,
            caseId: Number(props.caseId),
            caseName: accountForm.caseName,
            accountName: accountForm.accountName,
            accountType: accountForm.accountType,
            bankName: accountForm.bankName,
            bankAccount: accountForm.bankAccount,
          });
          ElMessage.success('账户更新成功');
        } else {
          await createFundAccount({
            accountId: accountForm.accountId || 0,
            caseId: Number(props.caseId),
            caseName: accountForm.caseName,
            accountName: accountForm.accountName,
            accountType: accountForm.accountType,
            initialBalance: accountForm.initialBalance,
            bankName: accountForm.bankName,
            bankAccount: accountForm.bankAccount,
          });
          ElMessage.success('账户新增成功');
        }
        accountDialogVisible.value = false;
        fetchFundAccounts();
      } catch (error) {
        ElMessage.error(accountEditMode.value ? '账户更新失败' : '账户新增失败');
        console.error('保存账户失败:', error);
      } finally {
        accountLoading.value = false;
      }
    }
  });
};

const handleAccountStatusChange = async (account: any) => {
  const newStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const actionText = newStatus === 'INACTIVE' ? '冻结' : '解冻';
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}该账户吗？`,
      '操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    accountLoading.value = true;
    await updateFundAccountStatus(account.id, { status: newStatus });
    ElMessage.success(`账户${actionText}成功`);
    fetchFundAccounts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`账户${actionText}失败`);
      console.error(`${actionText}账户失败:`, error);
    }
  } finally {
    accountLoading.value = false;
  }
};

const handleAccountSizeChange = (size: number) => {
  accountPageSize.value = size;
  fetchFundAccounts();
};

const handleAccountCurrentChange = (current: number) => {
  accountCurrentPage.value = current;
  fetchFundAccounts();
};

const flowLoading = ref(false);
const flowCurrentPage = ref(1);
const flowPageSize = ref(10);
const flowTotal = ref(0);
const fundFlows = ref<any[]>([]);

const flowSearchForm = reactive({
  accountId: '',
  flowType: '',
  startDate: '',
  endDate: '',
});

const accountOptions = ref<any[]>([]);
const allAccounts = ref<any[]>([]);
const categoryOptions = ref<any[]>([]);

const flowDialogVisible = ref(false);
const flowDialogTitle = ref('新增资金流入');
const flowFormRef = ref();
const flowForm = reactive({
  caseNo: props.caseNo,
  accountId: '',
  flowType: 'INCOME',
  categoryId: '',
  amount: 0,
  transactionDate: new Date().toISOString().slice(0, 16),
  description: '',
  relatedDocument: '',
  operator: 'admin',
});

const flowTypeOptions = [
  { label: '收入', value: 'INCOME' },
  { label: '支出', value: 'EXPENSE' },
];

const fetchFundFlows = async () => {
  flowLoading.value = true;
  try {
    let flowTypeParam;
    if (flowSearchForm.flowType === 'INCOME') {
      flowTypeParam = 'INCOME';
    } else if (flowSearchForm.flowType === 'EXPENSE') {
      flowTypeParam = 'EXPENSE';
    }

    const response = await getFundFlowList({
      pageNum: flowCurrentPage.value,
      pageSize: flowPageSize.value,
      caseId: Number(props.caseId),
      accountId: flowSearchForm.accountId ? Number(flowSearchForm.accountId) : undefined,
      flowType: flowTypeParam,
      status: 'ACTIVE',
    });
    fundFlows.value = response.data.list;
    flowTotal.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取资金流水列表失败');
    console.error('获取资金流水列表失败:', error);
    fundFlows.value = [];
    flowTotal.value = 0;
  } finally {
    flowLoading.value = false;
  }
};

const fetchAccounts = async () => {
  try {
    const response = await getFundAccountList({
      pageNum: 1,
      pageSize: 100,
      caseId: Number(props.caseId),
      status: 'ACTIVE',
    });
    
    allAccounts.value = response.data.list;
    
    accountOptions.value = allAccounts.value.map((account: any) => ({
      label: account.accountName,
      value: account.id,
      caseNo: account.caseName,
    }));
  } catch (error) {
    ElMessage.error('获取账户列表失败');
    console.error('获取账户列表失败:', error);
    accountOptions.value = [];
    allAccounts.value = [];
  }
};

const fetchCategories = async () => {
  try {
    // 尝试从后端获取分类列表
    const response = await getFundCategoryListApi({});
    let categories = [];
    
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (response.data.records && Array.isArray(response.data.records)) {
        categories = response.data.records;
      } else if (response.data.list && Array.isArray(response.data.list)) {
        categories = response.data.list;
      }
    }
    
    // 如果后端没有返回分类数据，使用默认分类
    if (categories.length === 0) {
      // 默认收入分类
      categories.push(
        // 收入分类
        { categoryId: 1, categoryName: '破产财产变价收入', categoryType: 'INCOME' },
        { categoryId: 2, categoryName: '债权回收收入', categoryType: 'INCOME' },
        { categoryId: 3, categoryName: '孳息收入', categoryType: 'INCOME' },
        { categoryId: 4, categoryName: '其他收入', categoryType: 'INCOME' },
        // 支出分类
        { categoryId: 5, categoryName: '破产费用', categoryType: 'EXPENSE' },
        { categoryId: 6, categoryName: '共益债务', categoryType: 'EXPENSE' },
        { categoryId: 7, categoryName: '职工债权', categoryType: 'EXPENSE' },
        { categoryId: 8, categoryName: '税款债权', categoryType: 'EXPENSE' },
        { categoryId: 9, categoryName: '普通债权', categoryType: 'EXPENSE' },
        { categoryId: 10, categoryName: '其他支出', categoryType: 'EXPENSE' }
      );
    }
    
    categoryOptions.value = categories;
  } catch (error) {
    console.error('获取分类列表失败，使用默认分类:', error);
    // 后端请求失败时，使用默认分类
    categoryOptions.value = [
      // 收入分类
      { categoryId: 1, categoryName: '破产财产变价收入', categoryType: 'INCOME' },
      { categoryId: 2, categoryName: '债权回收收入', categoryType: 'INCOME' },
      { categoryId: 3, categoryName: '孳息收入', categoryType: 'INCOME' },
      { categoryId: 4, categoryName: '其他收入', categoryType: 'INCOME' },
      // 支出分类
      { categoryId: 5, categoryName: '破产费用', categoryType: 'EXPENSE' },
      { categoryId: 6, categoryName: '共益债务', categoryType: 'EXPENSE' },
      { categoryId: 7, categoryName: '职工债权', categoryType: 'EXPENSE' },
      { categoryId: 8, categoryName: '税款债权', categoryType: 'EXPENSE' },
      { categoryId: 9, categoryName: '普通债权', categoryType: 'EXPENSE' },
      { categoryId: 10, categoryName: '其他支出', categoryType: 'EXPENSE' }
    ];
  }
};

const getFilteredCategoryOptions = () => {
  // 根据流水类型过滤分类选项
  const filtered = categoryOptions.value.filter(category => 
    category.categoryType === flowForm.flowType
  ).map(category => ({
    label: category.categoryName,
    value: category.categoryId,
  }));
  
  // 如果没有匹配的分类，添加一个默认的"其他"选项
  if (filtered.length === 0) {
    filtered.push({
      label: flowForm.flowType === 'INCOME' ? '其他收入' : '其他支出',
      value: flowForm.flowType === 'INCOME' ? 4 : 10,
    });
  }
  
  return filtered;
};

const getAccountName = (accountId: number) => {
  const account = accountOptions.value.find(option => option.value === accountId);
  return account ? account.label : '未知账户';
};

const getCategoryName = (categoryId: number) => {
  const category = categoryOptions.value.find(option => option.categoryId === categoryId);
  return category ? category.categoryName : '未知分类';
};

const handleFlowAccountChange = () => {
  if (flowForm.accountId) {
    const selectedAccount = accountOptions.value.find(option => option.value === flowForm.accountId);
    if (selectedAccount) {
      flowForm.caseNo = selectedAccount.caseNo;
    }
  }
};

const handleFlowSearch = () => {
  flowCurrentPage.value = 1;
  fetchFundFlows();
};

const handleFlowReset = () => {
  flowSearchForm.accountId = '';
  flowSearchForm.flowType = '';
  flowSearchForm.startDate = '';
  flowSearchForm.endDate = '';
  flowCurrentPage.value = 1;
  fetchFundFlows();
};

const openAddFlowDialog = (flowType: string) => {
  flowDialogTitle.value = flowType === 'INCOME' ? '新增资金流入' : '新增资金流出';
  resetFlowForm();
  flowForm.flowType = flowType;
  flowDialogVisible.value = true;
};

const resetFlowForm = () => {
  if (flowFormRef.value) {
    flowFormRef.value.resetFields();
  }
  Object.assign(flowForm, {
    caseNo: props.caseNo,
    accountId: '',
    flowType: 'INCOME',
    categoryId: '',
    amount: 0,
    transactionDate: new Date().toISOString().slice(0, 16),
    description: '',
    relatedDocument: '',
    operator: 'admin',
  });
};

const saveFlow = async () => {
  if (!flowFormRef.value) return;
  
  await flowFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      flowLoading.value = true;
      try {
        const account = allAccounts.value.find((a: any) => a.id === flowForm.accountId);
        const balanceBefore = account ? account.currentBalance : 0;
        const balanceAfter = flowForm.flowType === 'INCOME' 
          ? balanceBefore + flowForm.amount 
          : balanceBefore - flowForm.amount;
        
        // 获取选中的分类名称作为费用类型
        const selectedCategory = categoryOptions.value.find(category => category.categoryId === flowForm.categoryId);
        const expenseType = selectedCategory ? selectedCategory.categoryName : '';

        await createFundFlow({
          caseId: Number(props.caseId),
          caseName: props.caseName,
          accountId: Number(flowForm.accountId),
          flowType: flowForm.flowType === 'INCOME' ? 'INCOME' : 'EXPENSE',
          amount: flowForm.amount,
          balanceBefore,
          balanceAfter,
          transactionDate: new Date(flowForm.transactionDate).toISOString(),
          description: flowForm.description,
          relatedDocument: flowForm.relatedDocument,
          remark: flowForm.remark || '',
          expenseType: expenseType,
        });
        ElMessage.success('资金流水记录成功');
        flowDialogVisible.value = false;
        fetchFundFlows();
        fetchFundAccounts();
        fetchAccounts(); // 更新账户列表，确保下次使用最新余额
      } catch (error) {
        ElMessage.error('资金流水记录失败');
        console.error('保存资金流水失败:', error);
      } finally {
        flowLoading.value = false;
      }
    }
  });
};

const handleFlowSizeChange = (size: number) => {
  flowPageSize.value = size;
  fetchFundFlows();
};

const handleFlowCurrentChange = (current: number) => {
  flowCurrentPage.value = current;
  fetchFundFlows();
};

onMounted(() => {
  fetchAccounts();
  fetchCategories();
});
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    title="资金管控"
    direction="rtl"
    size="80%"
    @close="closeDrawer"
  >
    <div class="fund-control-container">
      <ElTabs v-model="activeTab" @tab-change="handleTabChange" class="fund-tabs">
        <ElTabPane label="账户管理" name="account">
          <div class="account-content">
            <ElCard shadow="hover" class="search-card">
              <ElForm :model="accountSearchForm" inline label-width="80px">
                <ElFormItem label="账户名称">
                  <ElInput
                    v-model="accountSearchForm.accountName"
                    placeholder="请输入账户名称"
                    clearable
                    style="width: 200px"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleAccountSearch">
                    <Icon icon="lucide:search" class="mr-1" />
                    搜索
                  </ElButton>
                  <ElButton @click="handleAccountReset">
                    <Icon icon="lucide:refresh-cw" class="mr-1" />
                    重置
                  </ElButton>
                  <ElButton type="success" @click="openAddAccountDialog">
                    <Icon icon="lucide:plus" class="mr-1" />
                    新增账户
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>

            <ElCard shadow="hover" class="list-card">
              <ElTable
                v-loading="accountLoading"
                :data="fundAccounts"
                style="width: 100%"
              >
                <ElTableColumn type="index" label="序号" width="80" />
                <ElTableColumn prop="accountName" label="账户名称" width="200" />
                <ElTableColumn prop="accountType" label="账户类型" width="120">
                  <template #default="scope">
                    <ElTag type="info">{{ scope.row.accountType }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="initialBalance" label="初始余额" width="150" align="right">
                  <template #default="scope">
                    {{ formatAmount(scope.row.initialBalance) }} 元
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="currentBalance" label="当前余额" width="150" align="right">
                  <template #default="scope">
                    <span class="balance-text">{{ formatAmount(scope.row.currentBalance) }} 元</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="bankName" label="银行" width="150" />
                <ElTableColumn prop="bankAccount" label="银行账号" width="200" />
                <ElTableColumn prop="status" label="状态" width="100">
                  <template #default="scope">
                    <ElTag
                      :type="scope.row.status === 'ACTIVE' ? 'success' : 'warning'"
                    >
                      {{ scope.row.status === 'ACTIVE' ? '正常' : '冻结' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createTime" label="创建时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.createTime) }}
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="250" fixed="right">
                  <template #default="scope">
                    <ElButton
                      type="primary"
                      size="small"
                      @click="openEditAccountDialog(scope.row)"
                    >
                      编辑
                    </ElButton>
                    <ElButton
                      :type="scope.row.status === 'ACTIVE' ? 'warning' : 'success'"
                      size="small"
                      @click="handleAccountStatusChange(scope.row)"
                      style="margin-left: 8px"
                    >
                      {{ scope.row.status === 'ACTIVE' ? '冻结' : '解冻' }}
                    </ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>

              <div class="pagination-container" v-if="!accountLoading">
                <ElPagination
                  v-model:current-page="accountCurrentPage"
                  v-model:page-size="accountPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="accountTotal"
                  @size-change="handleAccountSizeChange"
                  @current-change="handleAccountCurrentChange"
                />
              </div>
            </ElCard>
          </div>
        </ElTabPane>

        <ElTabPane label="资金流水" name="flow">
          <div class="flow-content">
            <ElCard shadow="hover" class="search-card">
              <ElForm :model="flowSearchForm" inline label-width="80px">
                <ElFormItem label="账户">
                  <ElSelect
                    v-model="flowSearchForm.accountId"
                    placeholder="请选择账户"
                    clearable
                    style="width: 200px"
                  >
                    <ElOption
                      v-for="option in accountOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="流水类型">
                  <ElSelect
                    v-model="flowSearchForm.flowType"
                    placeholder="请选择流水类型"
                    clearable
                    style="width: 200px"
                  >
                    <ElOption
                      v-for="option in flowTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="开始日期">
                  <ElDatePicker
                    v-model="flowSearchForm.startDate"
                    type="datetime"
                    placeholder="选择开始日期"
                    style="width: 200px"
                  />
                </ElFormItem>
                <ElFormItem label="结束日期">
                  <ElDatePicker
                    v-model="flowSearchForm.endDate"
                    type="datetime"
                    placeholder="选择结束日期"
                    style="width: 200px"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleFlowSearch">
                    <Icon icon="lucide:search" class="mr-1" />
                    搜索
                  </ElButton>
                  <ElButton @click="handleFlowReset">
                    <Icon icon="lucide:refresh-cw" class="mr-1" />
                    重置
                  </ElButton>
                  <ElButton type="success" @click="openAddFlowDialog('INCOME')">
                    <Icon icon="lucide:plus" class="mr-1" />
                    资金流入
                  </ElButton>
                  <ElButton type="warning" @click="openAddFlowDialog('EXPENSE')">
                    <Icon icon="lucide:minus" class="mr-1" />
                    资金流出
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>

            <ElCard shadow="hover" class="list-card">
              <ElTable
                v-loading="flowLoading"
                :data="fundFlows"
                style="width: 100%"
              >
                <ElTableColumn type="index" label="序号" width="80" />
                <ElTableColumn prop="accountId" label="账户" width="200">
                  <template #default="scope">
                    {{ getAccountName(scope.row.accountId) }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="flowType" label="流水类型" width="100">
                  <template #default="scope">
                    <ElTag
                      :type="scope.row.flowType === 'INCOME' ? 'success' : 'warning'"
                    >
                      {{ scope.row.flowType === 'INCOME' ? '收入' : '支出' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="categoryId" label="费用类型" width="150">
                  <template #default="scope">
                    {{ getCategoryName(scope.row.categoryId) }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="amount" label="金额" width="150" align="right">
                  <template #default="scope">
                    <span :class="scope.row.flowType === 'INCOME' ? 'income-amount' : 'expense-amount'">
                      {{ scope.row.flowType === 'INCOME' ? '+' : '-' }}{{ formatAmount(scope.row.amount) }} 元
                    </span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="balanceBefore" label="操作前余额" width="150" align="right">
                  <template #default="scope">
                    {{ formatAmount(scope.row.balanceBefore) }} 元
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="balanceAfter" label="操作后余额" width="150" align="right">
                  <template #default="scope">
                    <span class="balance-text">{{ formatAmount(scope.row.balanceAfter) }} 元</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="transactionDate" label="交易日期" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.transactionDate) }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="description" label="交易描述" min-width="200" />
                <ElTableColumn prop="operator" label="操作人" width="100" />
              </ElTable>

              <div class="pagination-container" v-if="!flowLoading">
                <ElPagination
                  v-model:current-page="flowCurrentPage"
                  v-model:page-size="flowPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="flowTotal"
                  @size-change="handleFlowSizeChange"
                  @current-change="handleFlowCurrentChange"
                />
              </div>
            </ElCard>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <ElDialog
      v-model="accountDialogVisible"
      :title="accountDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="accountFormRef"
        :model="accountForm"
        label-width="120px"
        :rules="{
          accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
          accountType: [{ required: true, message: '请选择账户类型', trigger: 'change' }],
          initialBalance: [{ required: true, message: '请输入初始余额', trigger: 'blur' }],
        }"
      >
        <ElFormItem label="账户名称" prop="accountName">
          <ElInput v-model="accountForm.accountName" placeholder="请输入账户名称" />
        </ElFormItem>
        <ElFormItem label="账户类型" prop="accountType">
          <ElSelect v-model="accountForm.accountType" placeholder="请选择账户类型">
            <ElOption
              v-for="option in accountTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="初始余额" prop="initialBalance">
          <ElInputNumber
            v-model="accountForm.initialBalance"
            :min="0"
            :precision="2"
            placeholder="请输入初始余额"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="当前余额" v-if="accountEditMode">
          <ElInputNumber
            v-model="accountForm.currentBalance"
            :min="0"
            :precision="2"
            placeholder="请输入当前余额"
            style="width: 100%"
            :disabled="true"
          />
        </ElFormItem>
        <ElFormItem label="银行">
          <ElSelect 
            v-model="accountForm.bankName" 
            placeholder="请选择银行"
            filterable
            allow-create
          >
            <ElOption
              v-for="item in bankOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="银行账号">
          <ElInput v-model="accountForm.bankAccount" placeholder="请输入银行账号" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="accountForm.status" placeholder="请选择状态">
            <ElOption
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="accountDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="saveAccount">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="flowDialogVisible"
      :title="flowDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="flowFormRef"
        :model="flowForm"
        label-width="120px"
        :rules="{
          accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
          categoryId: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
          amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
          transactionDate: [{ required: true, message: '请选择交易日期', trigger: 'change' }],
        }"
      >
        <ElFormItem label="账户" prop="accountId">
          <ElSelect 
            v-model="flowForm.accountId" 
            placeholder="请选择账户"
            @change="handleFlowAccountChange"
          >
            <ElOption
              v-for="option in accountOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="流水类型" prop="flowType">
          <ElSelect v-model="flowForm.flowType" placeholder="请选择流水类型">
            <ElOption
              v-for="option in flowTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="费用类型" prop="categoryId">
          <ElSelect v-model="flowForm.categoryId" placeholder="请选择费用类型">
            <ElOption
              v-for="option in getFilteredCategoryOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="金额" prop="amount">
          <ElInputNumber
            v-model="flowForm.amount"
            :min="0.01"
            :precision="2"
            placeholder="请输入金额"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="交易日期" prop="transactionDate">
          <ElDatePicker
            v-model="flowForm.transactionDate"
            type="datetime"
            placeholder="选择交易日期"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="交易描述">
          <ElInput
            v-model="flowForm.description"
            type="textarea"
            placeholder="请输入交易描述"
            :rows="3"
          />
        </ElFormItem>
        <ElFormItem label="关联文档">
          <ElInput v-model="flowForm.relatedDocument" placeholder="请输入关联文档路径或ID" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="flowDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="saveFlow">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<style scoped>
.fund-control-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fund-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fund-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}

.fund-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.account-content,
.flow-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  flex-shrink: 0;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-card :deep(.el-table) {
  flex: 1;
}

.balance-text {
  font-weight: 600;
  color: #67c23a;
}

.income-amount {
  font-weight: 600;
  color: #67c23a;
}

.expense-amount {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
