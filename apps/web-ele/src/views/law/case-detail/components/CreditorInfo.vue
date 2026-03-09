<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPagination,
  ElSelect,
  ElOption,
  ElTabPane,
  ElTabs,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  queryCreditorClaimsApi,
} from '#/api/core/creditor-claim-query';
import { createCreditorApi, getCreditorDetailApi } from '#/api/core/creditor';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const creditors = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索相关数据
const searchName = ref('');
const searchStatus = ref('');
const searchClaimType = ref('');

// 债权类型选项
const claimTypeOptions = [
  { label: '担保债权', value: '担保债权' },
  { label: '职工债权', value: '职工债权' },
  { label: '优先债权', value: '优先债权' },
  { label: '税款债权', value: '税款债权' },
  { label: '普通债权', value: '普通债权' },
  { label: '劣后债权', value: '劣后债权' },
  { label: '未确认债权', value: '未确认债权' },
];

// 状态映射
const statusMap: Record<string, string> = {
  KNOWN: '已知债权人',
  CONFIRMED: '确认债权人',
};

// 债权人类型选项
const creditorTypeOptions = [
  { label: '金融机构', value: '金融机构' },
  { label: '企业', value: '企业' },
  { label: '个人', value: '个人' },
  { label: '其他', value: '其他' },
];

const fetchCreditors = async () => {
  loading.value = true;
  try {
    const params: any = {
      caseId: Number(props.caseId),
      creditorName: searchName.value,
      claimType: searchClaimType.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };
    
    // 如果是确认债权人标签页，则传递 creditorStatus 参数
    if (searchStatus.value === 'CONFIRMED') {
      params.creditorStatus = 'CONFIRMED';
    }
    
    const response = await queryCreditorClaimsApi(params);
    if (response.code === 200 && response.data) {
      creditors.value = response.data.list || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取债权人列表失败：${response.message || '未知错误'}`);
      creditors.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人列表失败');
    creditors.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCreditors();
};

const handleResetSearch = () => {
  searchName.value = '';
  searchStatus.value = '';
  searchClaimType.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

const showAllCreditors = () => {
  searchStatus.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

const showConfirmedCreditors = () => {
  searchStatus.value = 'CONFIRMED';
  currentPage.value = 1;
  fetchCreditors();
};

const handleTabClick = (tab: any) => {
  // 根据点击的标签页设置 searchStatus
  if (tab.props.name === 'confirmed') {
    searchStatus.value = 'CONFIRMED';
  } else {
    searchStatus.value = '';
  }
  currentPage.value = 1;
  fetchCreditors();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCreditors();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchCreditors();
};

const getCreditorTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    '金融机构': { type: 'success' },
    '企业': { type: 'primary' },
    '个人': { type: 'primary' },
    '其他': { type: 'info' },
  };
  return typeMap[type] || { type: 'info' };
};

const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// 新增债权人相关
const showAddDialog = ref(false);
const addLoading = ref(false);
const addForm = ref({
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: '',
  status: 'KNOWN',
});

// 债权人详情相关
const showDetailDialog = ref(false);
const detailLoading = ref(false);
const detailData = ref<any>(null);

const openAddDialog = () => {
  addForm.value = {
    creditorName: '',
    creditorType: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    idNumber: '',
    legalRepresentative: '',
    registeredCapital: '',
    status: 'KNOWN',
  };
  showAddDialog.value = true;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
};

const handleAddSubmit = async () => {
  if (!addForm.value.creditorName) {
    ElMessage.warning('请输入债权人名称');
    return;
  }
  if (!addForm.value.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }

  addLoading.value = true;
  try {
    const response = await createCreditorApi({
      caseId: Number(props.caseId),
      creditorName: addForm.value.creditorName,
      creditorType: addForm.value.creditorType,
      contactPhone: addForm.value.contactPhone,
      contactEmail: addForm.value.contactEmail,
      address: addForm.value.address,
      idNumber: addForm.value.idNumber,
      legalRepresentative: addForm.value.legalRepresentative,
      registeredCapital: addForm.value.registeredCapital ? Number(addForm.value.registeredCapital) : undefined,
      creditorStatus: addForm.value.status,
    });
    if (response.code === 200) {
      ElMessage.success('成功添加债权人');
      await fetchCreditors();
      closeAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('添加债权人失败:', error);
    ElMessage.error('添加债权人失败');
  } finally {
    addLoading.value = false;
  }
};

const openDetailDialog = async (row: any) => {
  try {
    detailLoading.value = true;
    const response = await getCreditorDetailApi(row.creditorId);
    if (response.code === 200 && response.data) {
      detailData.value = response.data;
      showDetailDialog.value = true;
    } else {
      ElMessage.error('获取债权人详情失败');
    }
  } catch (error) {
    console.error('获取债权人详情失败:', error);
    ElMessage.error('获取债权人详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const closeDetailDialog = () => {
  showDetailDialog.value = false;
  detailData.value = null;
};

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '-';
  }
};

onMounted(() => {
  fetchCreditors();
});
</script>

<template>
  <div class="creditor-info-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="flex flex-col items-start space-y-4 w-full">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center">
              <Icon icon="lucide:users" class="text-primary mr-2" />
              <span class="text-lg font-semibold">债权人信息</span>
            </div>
            <div class="flex space-x-2">
              <ElButton type="primary" @click="openAddDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
            </div>
          </div>
          <ElTabs @tab-click="handleTabClick" class="w-full">
            <ElTabPane label="已知债权人（全部）" name="all"></ElTabPane>
            <ElTabPane label="确认债权人" name="confirmed"></ElTabPane>
          </ElTabs>
        </div>
      </template>

      <div class="mb-4 rounded-lg bg-gray-50 p-4">
        <div class="flex flex-wrap gap-4">
          <ElSelect
            v-model="searchClaimType"
            placeholder="债权类型"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <ElOption
              v-for="option in claimTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
          <ElInput
            v-model="searchName"
            placeholder="债权人名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="lucide:search" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="handleResetSearch">
            <Icon icon="lucide:refresh-cw" class="mr-1" />
            重置
          </ElButton>
        </div>
      </div>

      <div v-loading="loading" class="creditor-list-container">
        <ElTable :data="creditors" border stripe style="width: 100%" class="mb-4" :row-key="row => row.creditorName + row.creditorBankAccount" @row-click="openDetailDialog">
          <ElTableColumn prop="creditorStatus" label="债权人状态" width="120" align="center" fixed="left">
            <template #default="scope">
              <ElTag
                :type="scope.row.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'"
                size="small"
              >
                {{ statusMap[scope.row.creditorStatus] || scope.row.creditorStatus }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="creditorName" label="债权人名称" min-width="150" fixed="left" />
          <ElTableColumn prop="creditorType" label="债权人类型" width="100">
            <template #default="scope">
              <ElTag
                :type="getCreditorTypeTag(scope.row.creditorType).type"
                size="small"
              >
                {{ scope.row.creditorType }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="claimType" label="债权类型" width="120" />
          <ElTableColumn prop="accountName" label="账户名称" min-width="150" />
          <ElTableColumn prop="creditorBankAccount" label="银行账号" width="180" />
          <ElTableColumn prop="bankName" label="开户银行" min-width="150" />
          <ElTableColumn prop="declaredPrincipal" label="申报本金" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.declaredPrincipal) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="declaredInterest" label="申报利息" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.declaredInterest) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="declaredPenalty" label="申报罚金" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.declaredPenalty) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="declaredOtherLosses" label="申报其他损失" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.declaredOtherLosses) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="declaredTotalAmount" label="申报总金额" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.declaredTotalAmount) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="confirmedPrincipal" label="确认本金" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.confirmedPrincipal) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="confirmedInterest" label="确认利息" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.confirmedInterest) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="confirmedPenalty" label="确认违约金" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.confirmedPenalty) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="confirmedOtherLosses" label="确认其他损失" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.confirmedOtherLosses) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="confirmedTotalAmount" label="确认总金额" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.confirmedTotalAmount) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="reductionAmount" label="核减金额" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.reductionAmount) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        </ElTable>

        <div v-if="total > 0" class="pagination-container flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>

        <div v-if="creditors.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债权人信息" />
        </div>
      </div>
    </ElCard>
  </div>

  <!-- 新增债权人对话框 -->
  <ElDialog
    v-model="showAddDialog"
    title="新增债权人"
    width="600px"
    destroy-on-close
  >
    <ElForm label-width="120px" :model="addForm">
      <ElFormItem label="债权人名称" required>
        <ElInput
          v-model="addForm.creditorName"
          placeholder="请输入债权人名称"
        />
      </ElFormItem>
      <ElFormItem label="债权人类型" required>
        <ElSelect
          v-model="addForm.creditorType"
          placeholder="请选择债权人类型"
        >
          <ElOption
            v-for="option in creditorTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="联系电话">
        <ElInput
          v-model="addForm.contactPhone"
          placeholder="请输入联系电话"
        />
      </ElFormItem>
      <ElFormItem label="联系邮箱">
        <ElInput
          v-model="addForm.contactEmail"
          placeholder="请输入联系邮箱"
        />
      </ElFormItem>
      <ElFormItem label="证件号码">
        <ElInput
          v-model="addForm.idNumber"
          placeholder="请输入证件号码"
        />
      </ElFormItem>
      <ElFormItem label="法定代表人">
        <ElInput
          v-model="addForm.legalRepresentative"
          placeholder="请输入法定代表人"
        />
      </ElFormItem>
      <ElFormItem label="地址">
        <ElInput v-model="addForm.address" placeholder="请输入地址" />
      </ElFormItem>
      <ElFormItem label="注册资本">
        <ElInput
          v-model="addForm.registeredCapital"
          placeholder="请输入注册资本"
        />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect
          v-model="addForm.status"
          placeholder="请选择状态"
        >
          <ElOption label="已知债权人" value="KNOWN" />
          <ElOption label="确认债权人" value="CONFIRMED" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="closeAddDialog">取消</ElButton>
        <ElButton
          type="primary"
          @click="handleAddSubmit"
          :loading="addLoading"
        >
          确定
        </ElButton>
      </span>
    </template>
  </ElDialog>

  <!-- 债权人详情对话框 -->
  <ElDialog
    v-model="showDetailDialog"
    :title="`债权人详情 - ${detailData?.creditorName || ''}`"
    width="700px"
    destroy-on-close
  >
    <div v-loading="detailLoading" style="min-height: 400px;">
      <ElDescriptions :column="2" border v-if="detailData">
        <ElDescriptionsItem label="债权人名称">{{ detailData.creditorName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="债权人类型">{{ detailData.creditorType }}</ElDescriptionsItem>
        <ElDescriptionsItem label="债权人状态">
          <ElTag :type="detailData.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'" size="small">
            {{ statusMap[detailData.creditorStatus] || detailData.creditorStatus }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="案件编号">{{ detailData.caseNumber }}</ElDescriptionsItem>
        <ElDescriptionsItem label="案件名称">{{ detailData.caseName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="联系电话">{{ detailData.contactPhone || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="联系邮箱">{{ detailData.contactEmail || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="证件号码">{{ detailData.idNumber || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="法定代表人">{{ detailData.legalRepresentative || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="地址">{{ detailData.address || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="注册资本">{{ detailData.registeredCapital ? formatCurrency(detailData.registeredCapital) : '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ formatDate(detailData.createTime) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ formatDate(detailData.updateTime) }}</ElDescriptionsItem>
      </ElDescriptions>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="closeDetailDialog">关闭</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<style scoped>
.creditor-info-container {
  padding: 5px;
}

.creditor-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

/* 描述列表样式 */
:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #4b5563;
  background-color: #f9fafb;
}

:deep(.el-descriptions__content) {
  color: #111827;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 12px;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .creditor-info-card {
    padding: 20px;
  }
  
  :deep(.el-descriptions :is(.el-descriptions__label, .el-descriptions__content)) {
    font-size: 14px;
  }
}
</style>
