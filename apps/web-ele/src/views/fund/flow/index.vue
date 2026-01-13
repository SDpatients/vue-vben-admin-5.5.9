<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  addFundInflowApi,
  addFundOutflowApi,
  getFundAccountListApi,
  getFundCategoryListApi,
  getFundFlowListApi,
} from '#/api/core/fund';

// 状态管理
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 流水列表数据
const fundFlows = ref<any[]>([]);

// 搜索表单
const searchForm = reactive({
  caseNo: '',
  accountId: '',
  flowType: '',
  startDate: '',
  endDate: '',
});

// 账户列表（用于下拉选择）
const accountOptions = ref<any[]>([]);
// 完整账户数据（包含案号信息）
const allAccounts = ref<any[]>([]);
// 案号列表（用于下拉选择）
const caseNoOptions = ref<any[]>([]);

// 分类列表（用于下拉选择）
const categoryOptions = ref<any[]>([]);

// 新增流水对话框
const dialogVisible = ref(false);
const dialogTitle = ref('新增资金流入');
const formRef = ref();
const flowForm = reactive({
  caseNo: '',
  accountId: '',
  flowType: '收入',
  categoryId: '',
  amount: 0,
  transactionDate: new Date().toISOString().slice(0, 16),
  description: '',
  relatedDocument: '',
  operator: 'admin',
});

// 流水类型选项
const flowTypeOptions = [
  { label: '收入', value: '收入' },
  { label: '支出', value: '支出' },
];

// 获取流水列表
const fetchFundFlows = async () => {
  loading.value = true;
  try {
    const response = await getFundFlowListApi({
      page: currentPage.value,
      size: pageSize.value,
      caseNo: searchForm.caseNo,
      accountId: searchForm.accountId,
      flowType: searchForm.flowType,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
    });
    fundFlows.value = response.data.records;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('获取资金流水列表失败');
    console.error('获取资金流水列表失败:', error);
    fundFlows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 获取账户列表
const fetchAccounts = async () => {
  try {
    const response = await getFundAccountListApi({
      page: 1,
      size: 100,
    });

    // 保存完整账户数据
    allAccounts.value = response.data.records;

    // 生成账户选项
    accountOptions.value = allAccounts.value.map((account: any) => ({
      label: account.accountName,
      value: account.accountId,
      caseNo: account.caseNo,
    }));

    // 生成案号列表（去重）
    const caseNoSet = new Set<string>();
    allAccounts.value.forEach((account: any) => {
      if (account.caseNo) {
        caseNoSet.add(account.caseNo);
      }
    });
    caseNoOptions.value = [...caseNoSet].map((caseNo) => ({
      label: caseNo,
      value: caseNo,
    }));
  } catch (error) {
    ElMessage.error('获取账户列表失败');
    console.error('获取账户列表失败:', error);
    accountOptions.value = [];
    allAccounts.value = [];
    caseNoOptions.value = [];
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getFundCategoryListApi({});
    // 处理不同的响应格式
    let categories = [];

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        // 直接数组格式：{ "data": [ { "categoryId": 1, ... } ] }
        categories = response.data;
      } else if (
        response.data.records &&
        Array.isArray(response.data.records)
      ) {
        // 分页格式：{ "data": { "records": [ { "categoryId": 1, ... } ] } }
        categories = response.data.records;
      } else if (response.data.list && Array.isArray(response.data.list)) {
        // 列表格式：{ "data": { "list": [ { "categoryId": 1, ... } ] } }
        categories = response.data.list;
      }
    }

    categoryOptions.value = categories;
  } catch (error) {
    ElMessage.error('获取分类列表失败');
    console.error('获取分类列表失败:', error);
    categoryOptions.value = [];
  }
};

// 根据流水类型过滤分类选项
const getFilteredCategoryOptions = () => {
  return categoryOptions.value
    .filter((category) => category.categoryType === flowForm.flowType)
    .map((category) => ({
      label: category.categoryName,
      value: category.categoryId,
    }));
};

// 根据账户ID获取账户名称
const getAccountName = (accountId: number) => {
  const account = accountOptions.value.find(
    (option) => option.value === accountId,
  );
  return account ? account.label : '未知账户';
};

// 根据分类ID获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = categoryOptions.value.find(
    (option) => option.categoryId === categoryId,
  );
  return category ? category.categoryName : '未知分类';
};

// 处理账户选择变化（搜索表单）
const handleAccountChange = () => {
  if (searchForm.accountId) {
    const selectedAccount = accountOptions.value.find(
      (option) => option.value === searchForm.accountId,
    );
    if (selectedAccount) {
      searchForm.caseNo = selectedAccount.caseNo;
    }
  }
};

// 处理案号选择变化（搜索表单）
const handleCaseNoChange = () => {
  // 清空账户选择，因为案号变化了，可用账户也会变化
  searchForm.accountId = '';
};

// 处理账户选择变化（新增表单）
const handleFlowAccountChange = () => {
  if (flowForm.accountId) {
    const selectedAccount = accountOptions.value.find(
      (option) => option.value === flowForm.accountId,
    );
    if (selectedAccount) {
      flowForm.caseNo = selectedAccount.caseNo;
    }
  }
};

// 处理案号选择变化（新增表单）
const handleFlowCaseNoChange = () => {
  // 清空账户选择，因为案号变化了，可用账户也会变化
  flowForm.accountId = '';
};

// 获取当前可用的账户选项（根据选中的案号过滤）
const getAvailableAccountOptions = (caseNo: string) => {
  if (!caseNo) {
    return accountOptions.value;
  }
  return accountOptions.value.filter((option) => option.caseNo === caseNo);
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchFundFlows();
};

// 重置搜索
const handleReset = () => {
  searchForm.caseNo = '';
  searchForm.accountId = '';
  searchForm.flowType = '';
  searchForm.startDate = '';
  searchForm.endDate = '';
  currentPage.value = 1;
  fetchFundFlows();
};

// 打开新增流水对话框
const openAddFlowDialog = (flowType: string) => {
  dialogTitle.value = flowType === '收入' ? '新增资金流入' : '新增资金流出';
  resetForm();
  flowForm.flowType = flowType;
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(flowForm, {
    caseNo: '',
    accountId: '',
    flowType: '收入',
    categoryId: '',
    amount: 0,
    transactionDate: new Date().toISOString().slice(0, 16),
    description: '',
    relatedDocument: '',
    operator: 'admin',
  });
};

// 保存流水
const saveFlow = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        if (flowForm.flowType === '收入') {
          // 新增资金流入
          await addFundInflowApi(flowForm);
          ElMessage.success('资金流入记录成功');
        } else {
          // 新增资金流出
          await addFundOutflowApi(flowForm);
          ElMessage.success('资金流出记录成功');
        }
        dialogVisible.value = false;
        fetchFundFlows();
      } catch (error) {
        ElMessage.error(
          flowForm.flowType === '收入'
            ? '资金流入记录失败'
            : '资金流出记录失败',
        );
        console.error('保存资金流水失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 导出流水
const exportFlows = () => {
  // 实现导出逻辑
  ElMessage.info('导出功能开发中');
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchFundFlows();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchFundFlows();
};

// 页面挂载时加载数据
onMounted(() => {
  fetchFundFlows();
  fetchAccounts();
  fetchCategories();
});
</script>

<template>
  <div class="fund-flow-page">
    <div class="page-header">
      <h1>资金流水</h1>
    </div>

    <div class="fund-flow-content">
      <!-- 搜索区域 -->
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="案号">
            <el-select
              v-model="searchForm.caseNo"
              placeholder="请选择案号"
              clearable
              style="width: 200px"
              @change="handleCaseNoChange"
            >
              <el-option
                v-for="option in caseNoOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账户">
            <el-select
              v-model="searchForm.accountId"
              placeholder="请选择账户"
              clearable
              style="width: 200px"
              @change="handleAccountChange"
            >
              <el-option
                v-for="option in getAvailableAccountOptions(searchForm.caseNo)"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="流水类型">
            <el-select
              v-model="searchForm.flowType"
              placeholder="请选择流水类型"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="option in flowTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="searchForm.startDate"
              type="datetime"
              placeholder="选择开始日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchForm.endDate"
              type="datetime"
              placeholder="选择结束日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <i class="el-icon-search"></i> 搜索
            </el-button>
            <el-button @click="handleReset">
              <i class="el-icon-refresh"></i> 重置
            </el-button>
            <el-button type="success" @click="openAddFlowDialog('收入')">
              <i class="el-icon-plus"></i> 资金流入
            </el-button>
            <el-button type="warning" @click="openAddFlowDialog('支出')">
              <i class="el-icon-minus"></i> 资金流出
            </el-button>
            <el-button type="info" @click="exportFlows">
              <i class="el-icon-download"></i> 导出
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 流水列表 -->
      <el-card shadow="hover" class="list-card">
        <el-table v-loading="loading" :data="fundFlows" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="caseNo" label="案号" width="150" />
          <el-table-column prop="caseName" label="案件名称" width="200" />
          <el-table-column prop="accountId" label="账户" width="200">
            <template #default="scope">
              {{ getAccountName(scope.row.accountId) }}
            </template>
          </el-table-column>
          <el-table-column prop="flowType" label="流水类型" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.flowType === '收入' ? 'success' : 'warning'"
              >
                {{ scope.row.flowType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="categoryId" label="资金分类" width="150">
            <template #default="scope">
              {{ getCategoryName(scope.row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="150" align="right">
            <template #default="scope">
              <span
                :class="
                  scope.row.flowType === '收入'
                    ? 'income-amount'
                    : 'expense-amount'
                "
              >
                {{ scope.row.flowType === '收入' ? '+' : '-'
                }}{{ (scope.row.amount || 0).toFixed(2) }} 元
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="balanceBefore"
            label="操作前余额"
            width="150"
            align="right"
          >
            <template #default="scope">
              {{ (scope.row.balanceBefore || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column
            prop="balanceAfter"
            label="操作后余额"
            width="150"
            align="right"
          >
            <template #default="scope">
              <span class="balance-text">{{ (scope.row.balanceAfter || 0).toFixed(2) }} 元</span>
            </template>
          </el-table-column>
          <el-table-column prop="transactionDate" label="交易日期" width="180">
            <template #default="scope">
              {{
                scope.row.transactionDate
                  ? new Date(scope.row.transactionDate).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="交易描述"
            min-width="200"
          />
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="operationTime" label="操作时间" width="180">
            <template #default="scope">
              {{
                scope.row.operationTime
                  ? new Date(scope.row.operationTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column prop="relatedDocument" label="关联文档" width="150">
            <template #default="scope">
              {{ scope.row.relatedDocument || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="150">
            <template #default="scope">
              {{ scope.row.remark || '-' }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container" v-if="!loading">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增流水对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="flowForm"
        label-width="120px"
        :rules="{
          caseNo: [{ required: true, message: '请输入案号', trigger: 'blur' }],
          accountId: [
            { required: true, message: '请选择账户', trigger: 'change' },
          ],
          categoryId: [
            { required: true, message: '请选择资金分类', trigger: 'change' },
          ],
          amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
          transactionDate: [
            { required: true, message: '请选择交易日期', trigger: 'change' },
          ],
        }"
      >
        <el-form-item label="案号" prop="caseNo">
          <el-select
            v-model="flowForm.caseNo"
            placeholder="请选择案号"
            @change="handleFlowCaseNoChange"
          >
            <el-option
              v-for="option in caseNoOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账户" prop="accountId">
          <el-select
            v-model="flowForm.accountId"
            placeholder="请选择账户"
            @change="handleFlowAccountChange"
          >
            <el-option
              v-for="option in getAvailableAccountOptions(flowForm.caseNo)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流水类型" prop="flowType">
          <el-select v-model="flowForm.flowType" placeholder="请选择流水类型">
            <el-option
              v-for="option in flowTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="资金分类" prop="categoryId">
          <el-select v-model="flowForm.categoryId" placeholder="请选择资金分类">
            <el-option
              v-for="option in getFilteredCategoryOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="flowForm.amount"
            :min="0.01"
            :precision="2"
            placeholder="请输入金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="交易日期" prop="transactionDate">
          <el-date-picker
            v-model="flowForm.transactionDate"
            type="datetime"
            placeholder="选择交易日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="交易描述">
          <el-input
            v-model="flowForm.description"
            type="textarea"
            placeholder="请输入交易描述"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="关联文档">
          <el-input
            v-model="flowForm.relatedDocument"
            placeholder="请输入关联文档路径或ID"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFlow">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.fund-flow-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.fund-flow-content {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.income-amount {
  font-weight: 600;
  color: #67c23a;
}

.expense-amount {
  font-weight: 600;
  color: #f56c6c;
}

.balance-text {
  font-weight: 600;
  color: #409eff;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
