<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  getFundAccountListApi,
  addFundAccountApi,
  updateFundAccountApi,
  updateFundAccountStatusApi,
} from '#/api/core/fund';

// 状态管理
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 账户列表数据
const fundAccounts = ref<any[]>([]);

// 搜索表单
const searchForm = reactive({
  caseNo: '',
  caseName: '',
  accountName: '',
});

// 新增/编辑表单
const dialogVisible = ref(false);
const dialogTitle = ref('新增账户');
const editMode = ref(false);
const formRef = ref();
const accountForm = reactive({
  accountId: 0,
  caseNo: '',
  caseName: '',
  accountName: '',
  accountType: '',
  initialBalance: 0,
  currentBalance: 0,
  bankName: '',
  bankAccount: '',
  status: '正常',
  createUser: 'admin',
  updateUser: 'admin',
});

// 账户类型选项
const accountTypeOptions = [
  { label: '基本账户', value: '基本账户' },
  { label: '专用账户', value: '专用账户' },
  { label: '临时账户', value: '临时账户' },
];

// 状态选项
const statusOptions = [
  { label: '正常', value: '正常' },
  { label: '冻结', value: '冻结' },
];

// 案件列表（模拟数据，实际应从API获取）
const caseOptions = [
  { caseNo: 'CASE2025001', caseName: 'XX公司破产清算案' },
  { caseNo: 'CASE2025002', caseName: 'YY企业重整案' },
  { caseNo: 'CASE2025003', caseName: 'ZZ集团破产和解案' },
];

// 银行列表（模拟数据，实际应从API获取）
const bankOptions = [
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
];

// 监听案号变化，自动更新案件名称
const handleCaseNoChange = (value: string) => {
  const selectedCase = caseOptions.find((item) => item.caseNo === value);
  if (selectedCase) {
    accountForm.caseName = selectedCase.caseName;
  }
};

// 监听案件名称变化，自动更新案号
const handleCaseNameChange = (value: string) => {
  const selectedCase = caseOptions.find((item) => item.caseName === value);
  if (selectedCase) {
    accountForm.caseNo = selectedCase.caseNo;
  }
};

// 获取账户列表
const fetchFundAccounts = async () => {
  loading.value = true;
  try {
    const response = await getFundAccountListApi({
      page: currentPage.value,
      size: pageSize.value,
      caseNo: searchForm.caseNo,
      caseName: searchForm.caseName,
      accountName: searchForm.accountName,
    });
    fundAccounts.value = response.data.records;
    total.value = response.data.count;
  } catch (error) {
    ElMessage.error('获取账户列表失败');
    console.error('获取账户列表失败:', error);
    fundAccounts.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchFundAccounts();
};

// 重置搜索
const handleReset = () => {
  searchForm.caseNo = '';
  searchForm.caseName = '';
  searchForm.accountName = '';
  currentPage.value = 1;
  fetchFundAccounts();
};

// 打开新增对话框
const openAddDialog = () => {
  dialogTitle.value = '新增账户';
  editMode.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (account: any) => {
  dialogTitle.value = '编辑账户';
  editMode.value = true;
  Object.assign(accountForm, account);
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(accountForm, {
    accountId: 0,
    caseNo: '',
    caseName: '',
    accountName: '',
    accountType: '',
    initialBalance: 0,
    currentBalance: 0,
    bankName: '',
    bankAccount: '',
    status: '正常',
    createUser: 'admin',
    updateUser: 'admin',
  });
};

// 保存账户
const saveAccount = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        if (editMode.value) {
          // 编辑账户
          await updateFundAccountApi(accountForm);
          ElMessage.success('账户更新成功');
        } else {
          // 新增账户
          await addFundAccountApi(accountForm);
          ElMessage.success('账户新增成功');
        }
        dialogVisible.value = false;
        fetchFundAccounts();
      } catch (error) {
        ElMessage.error(editMode.value ? '账户更新失败' : '账户新增失败');
        console.error('保存账户失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 冻结/解冻账户
const handleStatusChange = async (account: any) => {
  const newStatus = account.status === '正常' ? '冻结' : '正常';
  const actionText = newStatus === '冻结' ? '冻结' : '解冻';

  try {
    await ElMessageBox.confirm(`确定要${actionText}该账户吗？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    await updateFundAccountStatusApi(account.accountId, newStatus);
    ElMessage.success(`账户${actionText}成功`);
    fetchFundAccounts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`账户${actionText}失败`);
      console.error(`${actionText}账户失败:`, error);
    }
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchFundAccounts();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchFundAccounts();
};

// 页面挂载时加载数据
onMounted(() => {
  fetchFundAccounts();
});
</script>

<template>
  <div class="fund-account-page">
    <div class="page-header">
      <h1>账户管理</h1>
    </div>

    <div class="fund-account-content">
      <!-- 搜索区域 -->
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="案号">
            <el-input
              v-model="searchForm.caseNo"
              placeholder="请输入案号"
              clearable
              style="width: 200px"
              @input="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="案件名称">
            <el-input
              v-model="searchForm.caseName"
              placeholder="请输入案件名称"
              clearable
              style="width: 200px"
              @input="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="账户名称">
            <el-input
              v-model="searchForm.accountName"
              placeholder="请输入账户名称"
              clearable
              style="width: 200px"
              @input="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="openAddDialog">
              <i class="el-icon-plus"></i> 新增账户
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 账户列表 -->
      <el-card shadow="hover" class="list-card">
        <el-table v-loading="loading" :data="fundAccounts" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="caseNo" label="案号" width="150" />
          <el-table-column prop="caseName" label="案件名称" width="200" />
          <el-table-column prop="accountName" label="账户名称" width="200" />
          <el-table-column prop="accountType" label="账户类型" width="120">
            <template #default="scope">
              <el-tag type="info">{{ scope.row.accountType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="initialBalance"
            label="初始余额"
            width="150"
            align="right"
          >
            <template #default="scope">
              {{ (scope.row.initialBalance || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column
            prop="currentBalance"
            label="当前余额"
            width="150"
            align="right"
          >
            <template #default="scope">
              <span class="balance-text"
                >{{ (scope.row.currentBalance || 0).toFixed(2) }} 元</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="bankName" label="银行" width="150" />
          <el-table-column prop="bankAccount" label="银行账号" width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === '正常' ? 'success' : 'warning'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              {{
                scope.row.createTime
                  ? new Date(scope.row.createTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column prop="createUser" label="创建人" width="100" />
          <el-table-column prop="updateTime" label="更新时间" width="180">
            <template #default="scope">
              {{
                scope.row.updateTime
                  ? new Date(scope.row.updateTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column prop="updateUser" label="更新人" width="100" />
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="openEditDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                :type="scope.row.status === '正常' ? 'warning' : 'success'"
                size="small"
                @click="handleStatusChange(scope.row)"
                style="margin-left: 8px"
              >
                {{ scope.row.status === '正常' ? '冻结' : '解冻' }}
              </el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="accountForm"
        label-width="120px"
        :rules="{
          caseNo: [{ required: true, message: '请输入案号', trigger: 'blur' }],
          caseName: [
            { required: true, message: '请输入案件名称', trigger: 'blur' },
          ],
          accountName: [
            { required: true, message: '请输入账户名称', trigger: 'blur' },
          ],
          accountType: [
            { required: true, message: '请选择账户类型', trigger: 'change' },
          ],
          initialBalance: [
            { required: true, message: '请输入初始余额', trigger: 'blur' },
          ],
        }"
      >
        <el-form-item label="案号" prop="caseNo">
          <el-select
            v-model="accountForm.caseNo"
            placeholder="请选择案号"
            filterable
            allow-create
            @change="handleCaseNoChange"
          >
            <el-option
              v-for="item in caseOptions"
              :key="item.caseNo"
              :label="item.caseNo"
              :value="item.caseNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="案件名称" prop="caseName">
          <el-select
            v-model="accountForm.caseName"
            placeholder="请选择案件名称"
            filterable
            allow-create
            @change="handleCaseNameChange"
          >
            <el-option
              v-for="item in caseOptions"
              :key="item.caseName"
              :label="item.caseName"
              :value="item.caseName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账户名称" prop="accountName">
          <el-input
            v-model="accountForm.accountName"
            placeholder="请输入账户名称"
          />
        </el-form-item>
        <el-form-item label="账户类型" prop="accountType">
          <el-select
            v-model="accountForm.accountType"
            placeholder="请选择账户类型"
          >
            <el-option
              v-for="option in accountTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="初始余额" prop="initialBalance">
          <el-input-number
            v-model="accountForm.initialBalance"
            :min="0"
            :precision="2"
            placeholder="请输入初始余额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="当前余额" v-if="editMode">
          <el-input-number
            v-model="accountForm.currentBalance"
            :min="0"
            :precision="2"
            placeholder="请输入当前余额"
            style="width: 100%"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="银行">
          <el-select
            v-model="accountForm.bankName"
            placeholder="请选择银行"
            filterable
            allow-create
          >
            <el-option
              v-for="item in bankOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input
            v-model="accountForm.bankAccount"
            placeholder="请输入银行账号"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="accountForm.status" placeholder="请选择状态">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAccount">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.fund-account-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
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

.fund-account-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.balance-text {
  font-weight: 600;
  color: #67c23a;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
