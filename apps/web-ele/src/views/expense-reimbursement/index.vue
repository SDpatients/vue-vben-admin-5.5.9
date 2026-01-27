<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

import {
  getReimbursementList,
  deleteReimbursement,
  approveReimbursement,
} from '#/api/core/expense-reimbursement';
import { getCaseSimpleListApi } from '#/api/core/case';
import { getBankAccountListApi } from '#/api/core/bank-account';
import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const reimbursements = ref<any[]>([]);

const searchForm = reactive({
  caseId: undefined as number | undefined,
  approvalStatus: undefined as string | undefined,
  reimbursementDate: '',
});

const caseOptions = ref<any[]>([]);
const bankAccountOptions = ref<any[]>([]);

const approvalStatusOptions = [
  { label: '待审批', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const canApprove = computed(() => {
  const roles = userStore.getUserRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
});

const fetchReimbursements = async () => {
  loading.value = true;
  try {
    const response = await getReimbursementList({
      page: currentPage.value,
      size: pageSize.value,
      caseId: searchForm.caseId,
      approvalStatus: searchForm.approvalStatus as any,
      reimbursementDate: searchForm.reimbursementDate,
    });
    reimbursements.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取报销单列表失败');
    console.error('获取报销单列表失败:', error);
    reimbursements.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const fetchCaseOptions = async () => {
  try {
    const response = await getCaseSimpleListApi({ page: 1, size: 100 });
    caseOptions.value = response.data.list;
  } catch (error) {
    console.error('获取案件列表失败:', error);
  }
};

const fetchBankAccountOptions = async () => {
  try {
    const response = await getBankAccountListApi({ pageNum: 1, pageSize: 100 });
    bankAccountOptions.value = response.data.list;
  } catch (error) {
    console.error('获取银行账户列表失败:', error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchReimbursements();
};

const handleReset = () => {
  searchForm.caseId = undefined;
  searchForm.approvalStatus = undefined;
  searchForm.reimbursementDate = '';
  currentPage.value = 1;
  fetchReimbursements();
};

const handleAdd = () => {
  router.push('/expense-reimbursement/add');
};

const handleEdit = (row: any) => {
  router.push(`/expense-reimbursement/edit/${row.id}`);
};

const handleView = (row: any) => {
  router.push(`/expense-reimbursement/detail/${row.id}`);
};

const handleDelete = async (row: any) => {
  if (row.approvalStatus !== 'PENDING') {
    ElMessage.warning('只能删除待审批状态的报销单');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除该报销单吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    await deleteReimbursement(row.id);
    ElMessage.success('删除成功');
    fetchReimbursements();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('删除报销单失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (row: any) => {
  if (row.approvalStatus !== 'PENDING') {
    ElMessage.warning('只能审批待审批状态的报销单');
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入审批意见', '审批操作', {
      confirmButtonText: '通过',
      cancelButtonText: '拒绝',
      distinguishCancelAndClose: true,
      inputPattern: /.+/,
      inputErrorMessage: '请输入审批意见',
    });

    loading.value = true;
    await approveReimbursement(row.id, {
      approvalStatus: 'APPROVED',
      approvalOpinion: value,
    });
    ElMessage.success('审批通过');
    fetchReimbursements();
  } catch (error: any) {
    if (error === 'cancel') {
      try {
        const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入拒绝理由',
        });

        loading.value = true;
        await approveReimbursement(row.id, {
          approvalStatus: 'REJECTED',
          approvalOpinion: value,
        });
        ElMessage.success('已拒绝该报销单');
        fetchReimbursements();
      } catch (error2: any) {
        if (error2 !== 'cancel') {
          ElMessage.error('操作失败');
          console.error('拒绝报销单失败:', error2);
        }
      }
    } else {
      ElMessage.error('操作失败');
      console.error('审批报销单失败:', error);
    }
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchReimbursements();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchReimbursements();
};

const getApprovalStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    PENDING: { type: 'warning', text: '待审批' },
    APPROVED: { type: 'success', text: '已通过' },
    REJECTED: { type: 'danger', text: '已拒绝' },
  };
  return map[status] || { type: 'info', text: status };
};

onMounted(() => {
  fetchReimbursements();
  fetchCaseOptions();
  fetchBankAccountOptions();
});
</script>

<template>
  <div class="expense-reimbursement-page">
    <div class="page-header">
      <h1>费用报销</h1>
    </div>

    <div class="expense-reimbursement-content">
      <el-card shadow="hover" class="search-card">
        <el-form :model="searchForm" inline label-width="80px">
          <el-form-item label="案件">
            <el-select
              v-model="searchForm.caseId"
              placeholder="请选择案件"
              clearable
              style="width: 200px"
              @change="handleSearch"
            >
              <el-option
                v-for="item in caseOptions"
                :key="item.id"
                :label="`${item.caseNumber} - ${item.caseName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批状态">
            <el-select
              v-model="searchForm.approvalStatus"
              placeholder="请选择审批状态"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option
                v-for="item in approvalStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="报销日期">
            <el-date-picker
              v-model="searchForm.reimbursementDate"
              type="date"
              placeholder="请选择报销日期"
              value-format="YYYY-MM-DD"
              style="width: 200px"
              @change="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleAdd">
              <i class="el-icon-plus"></i> 新增报销单
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="list-card">
        <el-table v-loading="loading" :data="reimbursements" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="approvalStatus" label="审批状态" width="120" fixed="left">
            <template #default="scope">
              <el-tag
                :type="getApprovalStatusTag(scope.row.approvalStatus).type"
                effect="dark"
                size="large"
                style="font-weight: bold; padding: 8px 12px; font-size: 14px;"
              >
                {{ getApprovalStatusTag(scope.row.approvalStatus).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementNumber" label="报销单号" width="180" />
          <el-table-column prop="caseName" label="案件名称" width="200" />
          <el-table-column prop="applicantName" label="申请人" width="120" />
          <el-table-column prop="fundAccountName" label="收款账户" width="150" />
          <el-table-column prop="bankAccount" label="银行账号" width="180" />
          <el-table-column prop="totalAmount" label="报销金额" width="120" align="right">
            <template #default="scope">
              {{ (scope.row.totalAmount || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementDate" label="报销日期" width="120" />
          <el-table-column prop="approverName" label="审批人" width="120" />
          <el-table-column prop="approvalTime" label="审批时间" width="180">
            <template #default="scope">
              {{
                scope.row.approvalTime
                  ? new Date(scope.row.approvalTime).toLocaleString('zh-CN')
                  : '-'
              }}
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
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button
                v-if="scope.row.approvalStatus === 'PENDING'"
                type="success"
                size="small"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canApprove && scope.row.approvalStatus === 'PENDING'"
                type="warning"
                size="small"
                @click="handleApprove(scope.row)"
              >
                审批
              </el-button>
              <el-button
                v-if="scope.row.approvalStatus === 'PENDING'"
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

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
  </div>
</template>

<style scoped>
.expense-reimbursement-page {
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

.expense-reimbursement-content {
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
