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
import { createCreditorApi, getCreditorClaimStagesApi } from '#/api/core/creditor';
import { getSensitiveDataViewApi } from '#/api/core/sensitive-data';

const props = defineProps<{
  caseId: string;
  isCaseArchived?: boolean;
}>();

const loading = ref(false);
const creditors = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const searchName = ref('');
const searchStatus = ref('');
const searchClaimType = ref('');

const activeTab = ref('all');
const detailActiveTab = ref('registration');

const claimTypeOptions = [
  { label: '担保债权', value: '担保债权' },
  { label: '职工债权', value: '职工债权' },
  { label: '优先债权', value: '优先债权' },
  { label: '税款债权', value: '税款债权' },
  { label: '普通债权', value: '普通债权' },
  { label: '劣后债权', value: '劣后债权' },
  { label: '未确认债权', value: '未确认债权' },
];

const statusMap: Record<string, string> = {
  KNOWN: '已知债权人',
  CONFIRMED: '确认债权人',
};

const creditorTypeMap: Record<string, string> = {
  NATURAL_PERSON: '自然人',
  LEGAL_PERSON: '法人',
  FINANCIAL_INSTITUTION: '金融机构',
  OTHER: '其他',
};

const creditorTypeOptions = [
  { label: '自然人', value: 'NATURAL_PERSON' },
  { label: '法人', value: 'LEGAL_PERSON' },
  { label: '金融机构', value: 'FINANCIAL_INSTITUTION' },
  { label: '其他', value: 'OTHER' },
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

const handleTabClick = (tab: any) => {
  if (tab.props.name === 'confirmed') {
    searchStatus.value = 'CONFIRMED';
    activeTab.value = 'confirmed';
  } else {
    searchStatus.value = '';
    activeTab.value = 'all';
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
    'NATURAL_PERSON': { type: 'primary', label: '自然人' },
    'LEGAL_PERSON': { type: 'primary', label: '法人' },
    'FINANCIAL_INSTITUTION': { type: 'success', label: '金融机构' },
    'OTHER': { type: 'info', label: '其他' },
  };
  return typeMap[type] || { type: 'info', label: creditorTypeMap[type] || type };
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
  creditorStatus: 'KNOWN',
});

const showDetailDialog = ref(false);
const detailLoading = ref(false);
const creditorDetailData = ref<any>(null);

const showPasswordDialog = ref(false);
const passwordLoading = ref(false);
const passwordForm = ref({
  password: '',
});
const currentSensitiveField = ref<{
  dataType: string;
  id: number;
  rowKey: string;
} | null>(null);
const revealedDataMap = ref<Record<string, string>>({});

const sensitiveFieldConfig = [
  { prop: 'contactPhone', dataType: 'CREDITOR_CONTACT_PHONE', label: '联系电话' },
  { prop: 'idNumber', dataType: 'CREDITOR_ID_NUMBER', label: '证件号码' },
  { prop: 'creditorBankAccount', dataType: 'CREDITOR_BANK_ACCOUNT', label: '银行账号' },
];

function maskSensitiveValue(value: string | undefined | null): string {
  if (!value) return '-';
  const str = String(value);
  if (str.length <= 2) return str;
  if (str.length <= 4) return str[0] + '*'.repeat(str.length - 1);
  return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
}

function getDisplayValue(row: any, prop: string, dataType: string): string {
  const rowKey = `${row.creditorId}-${dataType}`;
  if (revealedDataMap.value[rowKey]) {
    return revealedDataMap.value[rowKey];
  }
  return maskSensitiveValue(row[prop]);
}

function isRevealed(row: any, dataType: string): boolean {
  const rowKey = `${row.creditorId}-${dataType}`;
  return !!revealedDataMap.value[rowKey];
}

function openPasswordDialog(row: any, dataType: string) {
  currentSensitiveField.value = {
    dataType,
    id: row.creditorId,
    rowKey: `${row.creditorId}-${dataType}`,
  };
  passwordForm.value.password = '';
  showPasswordDialog.value = true;
}

async function handlePasswordConfirm() {
  if (!passwordForm.value.password) {
    ElMessage.warning('请输入密码');
    return;
  }
  if (!currentSensitiveField.value) return;

  passwordLoading.value = true;
  try {
    const response = await getSensitiveDataViewApi({
      dataType: currentSensitiveField.value.dataType,
      id: currentSensitiveField.value.id,
      password: passwordForm.value.password,
    });
    if (response.code === 200 && response.data) {
      revealedDataMap.value[currentSensitiveField.value.rowKey] = response.data.plainTextValue;
      ElMessage.success('验证通过');
      showPasswordDialog.value = false;
    } else {
      ElMessage.error(response.message || '密码验证失败');
    }
  } catch (error) {
    ElMessage.error('密码验证失败');
  } finally {
    passwordLoading.value = false;
  }
}

function closePasswordDialog() {
  showPasswordDialog.value = false;
  currentSensitiveField.value = null;
}

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
    creditorStatus: 'KNOWN',
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
      creditorStatus: addForm.value.creditorStatus,
    });
    if (response.code === 200) {
      ElMessage.success('成功添加债权人');
      await fetchCreditors();
      closeAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    ElMessage.error('添加债权人失败');
  } finally {
    addLoading.value = false;
  }
};

const openDetailDialog = async (row: any) => {
  try {
    detailLoading.value = true;
    const response = await getCreditorClaimStagesApi(row.creditorId);
    if (response.code === 200 && response.data) {
      creditorDetailData.value = response.data;
      showDetailDialog.value = true;
    } else {
      ElMessage.error('获取债权人详情失败');
    }
  } catch (error) {
    ElMessage.error('获取债权人详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const closeDetailDialog = () => {
  showDetailDialog.value = false;
  creditorDetailData.value = null;
};

const formatDateTime = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '-';
  }
};

const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, { text: string; type: string }> = {
    'REGISTERED': { text: '已登记', type: 'success' },
    'CONFIRMING': { text: '确认中', type: 'warning' },
    'REVIEWING': { text: '审查中', type: 'warning' },
    'REVIEW_COMPLETED': { text: '审查完成', type: 'info' },
    'CONFIRMED': { text: '已确认', type: 'success' },
    'REJECTED': { text: '已驳回', type: 'danger' },
    'PENDING': { text: '待处理', type: 'info' },
    'registered': { text: '已登记', type: 'success' },
    'confirming': { text: '确认中', type: 'warning' },
    'reviewing': { text: '审查中', type: 'warning' },
    'review_completed': { text: '审查完成', type: 'info' },
    'confirmed': { text: '已确认', type: 'success' },
    'rejected': { text: '已驳回', type: 'danger' },
    'pending': { text: '待处理', type: 'info' },
  };
  if (status && statusMap[status]) {
    return statusMap[status];
  }
  if (status) {
    const upperStatus = status.toUpperCase();
    if (statusMap[upperStatus]) {
      return statusMap[upperStatus];
    }
  }
  return { text: '未知', type: 'info' };
};

const getReviewStatusTag = (status: string) => {
  const statusMap: Record<string, { text: string; type: string }> = {
    'COMPLETED': { text: '已完成', type: 'success' },
    'IN_PROGRESS': { text: '进行中', type: 'warning' },
    'PENDING': { text: '待审查', type: 'info' },
    'REVIEWING': { text: '审查中', type: 'warning' },
    'REVIEW_COMPLETED': { text: '审查完成', type: 'success' },
    'SUPPLEMENT': { text: '待补充', type: 'danger' },
    'CONFIRMING': { text: '确认中', type: 'info' },
    'REJECTED': { text: '已驳回', type: 'danger' },
    'completed': { text: '已完成', type: 'success' },
    'in_progress': { text: '进行中', type: 'warning' },
    'pending': { text: '待审查', type: 'info' },
    'reviewing': { text: '审查中', type: 'warning' },
    'review_completed': { text: '审查完成', type: 'success' },
    'supplement': { text: '待补充', type: 'danger' },
    'confirming': { text: '确认中', type: 'info' },
    'rejected': { text: '已驳回', type: 'danger' },
  };
  if (status && statusMap[status]) {
    return statusMap[status];
  }
  if (status) {
    const upperStatus = status.toUpperCase();
    if (statusMap[upperStatus]) {
      return statusMap[upperStatus];
    }
  }
  return { text: '未知', type: 'info' };
};

const getConfirmationStatusTag = (status: string) => {
  const statusMap: Record<string, { text: string; type: string }> = {
    'COMPLETED': { text: '已完成', type: 'success' },
    'IN_PROGRESS': { text: '进行中', type: 'warning' },
    'PENDING': { text: '待确认', type: 'info' },
    'CONFIRMED': { text: '已确认', type: 'success' },
    'CONFIRMING': { text: '确认中', type: 'info' },
    'OBJECTION': { text: '有异议', type: 'danger' },
    'COURT': { text: '法院裁定', type: 'primary' },
    'LAWSUIT': { text: '诉讼中', type: 'info' },
    'completed': { text: '已完成', type: 'success' },
    'in_progress': { text: '进行中', type: 'warning' },
    'pending': { text: '待确认', type: 'info' },
    'confirmed': { text: '已确认', type: 'success' },
    'confirming': { text: '确认中', type: 'info' },
    'objection': { text: '有异议', type: 'danger' },
    'court': { text: '法院裁定', type: 'primary' },
    'lawsuit': { text: '诉讼中', type: 'info' },
  };
  if (status && statusMap[status]) {
    return statusMap[status];
  }
  if (status) {
    const upperStatus = status.toUpperCase();
    if (statusMap[upperStatus]) {
      return statusMap[upperStatus];
    }
  }
  return { text: '未知', type: 'info' };
};

const getReviewConclusionTag = (conclusion: string) => {
  const conclusionMap: Record<string, { text: string; type: string }> = {
    'CONFIRMED': { text: '确认', type: 'success' },
    'PARTIAL_CONFIRMED': { text: '部分确认', type: 'warning' },
    'UNCONFIRMED': { text: '不确认', type: 'danger' },
    'confirmed': { text: '确认', type: 'success' },
    'partial_confirmed': { text: '部分确认', type: 'warning' },
    'unconfirmed': { text: '不确认', type: 'danger' },
    'REJECTED': { text: '驳回', type: 'danger' },
    'rejected': { text: '驳回', type: 'danger' },
    'PARTIAL': { text: '部分确认', type: 'warning' },
    'partial': { text: '部分确认', type: 'warning' },
  };
  if (conclusion && conclusionMap[conclusion]) {
    return conclusionMap[conclusion];
  }
  if (conclusion) {
    const upperConclusion = conclusion.toUpperCase();
    if (conclusionMap[upperConclusion]) {
      return conclusionMap[upperConclusion];
    }
  }
  return { text: '待定', type: 'info' };
};

const getVoteResultTag = (result: string) => {
  const resultMap: Record<string, { text: string; type: string }> = {
    'AGREE': { text: '通过', type: 'success' },
    'DISAGREE': { text: '不通过', type: 'danger' },
    'ABSTAIN': { text: '弃权', type: 'info' },
  };
  return resultMap[result] || { text: result || '待定', type: 'info' };
};

onMounted(() => {
  fetchCreditors();
});

defineExpose({
  refresh: fetchCreditors,
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
              <ElButton v-if="!isCaseArchived" type="primary" @click="openAddDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
            </div>
          </div>
          <ElTabs v-model="activeTab" @tab-click="handleTabClick" class="w-full">
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
        <ElTable :data="creditors" border stripe style="width: 100%" class="mb-4" :row-key="(row: any) => row.creditorId">
          <ElTableColumn prop="creditorName" label="债权人名称" min-width="150" fixed="left" />
          <ElTableColumn prop="creditorType" label="债权人类型" width="120" align="center">
            <template #default="scope">
              <ElTag
                :type="getCreditorTypeTag(scope.row.creditorType).type"
                size="small"
              >
                {{ getCreditorTypeTag(scope.row.creditorType).label }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="creditorStatus" label="债权人状态" width="120" align="center">
            <template #default="scope">
              <ElTag
                v-if="scope.row.creditorStatus"
                :type="scope.row.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'"
                size="small"
              >
                {{ statusMap[scope.row.creditorStatus] || scope.row.creditorStatus }}
              </ElTag>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="contactPhone" label="联系电话" width="180">
            <template #default="scope">
              <div class="sensitive-field-cell">
                <span>{{ getDisplayValue(scope.row, 'contactPhone', 'CREDITOR_CONTACT_PHONE') }}</span>
                <ElButton
                  v-if="!isRevealed(scope.row, 'CREDITOR_CONTACT_PHONE')"
                  link
                  type="primary"
                  size="small"
                  @click.stop="openPasswordDialog(scope.row, 'CREDITOR_CONTACT_PHONE')"
                >
                  查看全部
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="idNumber" label="证件号码" width="200" show-overflow-tooltip>
            <template #default="scope">
              <div class="sensitive-field-cell">
                <span>{{ getDisplayValue(scope.row, 'idNumber', 'CREDITOR_ID_NUMBER') }}</span>
                <ElButton
                  v-if="!isRevealed(scope.row, 'CREDITOR_ID_NUMBER')"
                  link
                  type="primary"
                  size="small"
                  @click.stop="openPasswordDialog(scope.row, 'CREDITOR_ID_NUMBER')"
                >
                  查看全部
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right">
            <template #default="scope">
              <ElButton link type="primary" size="small" @click="openDetailDialog(scope.row)">
                查看详情
              </ElButton>
            </template>
          </ElTableColumn>
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
          v-model="addForm.creditorStatus"
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

  <!-- 债权人债权详情对话框 -->
  <ElDialog
    v-model="showDetailDialog"
    title="债权人债权详情"
    width="95%"
    destroy-on-close
  >
    <div v-loading="detailLoading" class="creditor-detail-container">
      <div v-if="creditorDetailData" class="creditor-detail-content">
        <div class="creditor-header mb-6">
          <h4 class="creditor-header-title">债权人基本信息</h4>
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem label="债权人名称">
              <span class="creditor-name-text">{{ creditorDetailData.creditorName }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权人类型">
              <ElTag
                :type="getCreditorTypeTag(creditorDetailData.creditorType).type"
                size="small"
              >
                {{ getCreditorTypeTag(creditorDetailData.creditorType).label }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="债权人状态">
              <ElTag
                v-if="creditorDetailData.creditorStatus"
                :type="creditorDetailData.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'"
                size="small"
              >
                {{ statusMap[creditorDetailData.creditorStatus] || creditorDetailData.creditorStatus }}
              </ElTag>
              <span v-else class="text-gray-400">-</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="联系电话">
              {{ creditorDetailData.contactPhone || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="证件号码">
              {{ creditorDetailData.idNumber || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <ElTabs v-model="detailActiveTab" type="border-card">
          <ElTabPane label="债权申报阶段" name="registration">
            <div v-if="creditorDetailData.claimRegistrations && creditorDetailData.claimRegistrations.length > 0">
              <div
                v-for="(claim, index) in creditorDetailData.claimRegistrations"
                :key="claim.id"
                class="claim-card mb-4"
              >
                <div class="claim-card-header">
                  <span class="claim-index">申报 {{ index + 1 }}</span>
                  <ElTag :type="getRegistrationStatusTag(claim.registrationStatus).type" size="small">
                    {{ getRegistrationStatusTag(claim.registrationStatus).text }}
                  </ElTag>
                </div>
                <ElDescriptions :column="2" border class="mt-3">
                  <ElDescriptionsItem label="债权编号">{{ claim.claimNo || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="案件名称">{{ claim.caseName || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="债务人">{{ claim.debtor || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="债权人类型">{{ creditorTypeMap[claim.creditorType] || claim.creditorType || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="统一社会信用代码">{{ claim.creditCode || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="法定代表人">{{ claim.legalRepresentative || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报本金">{{ formatCurrency(claim.principal) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报利息">{{ formatCurrency(claim.interest) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报罚金">{{ formatCurrency(claim.penalty) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报其他损失">{{ formatCurrency(claim.otherLosses) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报总金额">
                    <span class="amount-highlight">{{ formatCurrency(claim.totalAmount) }}</span>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="债权性质">{{ claim.claimNature || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="债权种类">{{ claim.claimType || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="债权标识">{{ claim.claimIdentifier || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="是否有法院判决">
                    <ElTag :type="claim.hasCourtJudgment ? 'success' : 'info'" size="small">
                      {{ claim.hasCourtJudgment ? '是' : '否' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="是否有执行">
                    <ElTag :type="claim.hasExecution ? 'success' : 'info'" size="small">
                      {{ claim.hasExecution ? '是' : '否' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="是否有担保">
                    <ElTag :type="claim.hasCollateral ? 'success' : 'info'" size="small">
                      {{ claim.hasCollateral ? '是' : '否' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="登记日期">{{ formatDateTime(claim.registrationDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="材料接收人">{{ claim.materialReceiver || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="材料接收日期">{{ formatDateTime(claim.materialReceiveDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="材料完整性">{{ claim.materialCompleteness || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="备注" :span="2">{{ claim.remarks || '-' }}</ElDescriptionsItem>
                </ElDescriptions>
              </div>
            </div>
            <ElEmpty v-else description="暂无债权申报记录" />
          </ElTabPane>

          <ElTabPane label="债权审查与确认阶段" name="review">
            <div v-if="creditorDetailData.claimReviews && creditorDetailData.claimReviews.length > 0">
              <div
                v-for="(review, index) in creditorDetailData.claimReviews"
                :key="review.id"
                class="claim-card mb-4"
              >
                <div class="claim-card-header">
                  <span class="claim-index">审查 {{ index + 1 }}</span>
                  <ElTag :type="getReviewStatusTag(review.reviewStatus).type" size="small">
                    {{ getReviewStatusTag(review.reviewStatus).text }}
                  </ElTag>
                </div>
                <ElDescriptions :column="2" border class="mt-3">
                  <ElDescriptionsItem label="审查日期">{{ formatDateTime(review.reviewDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="审查人">{{ review.reviewer || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="审查轮次">{{ review.reviewRound || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="审查结论">
                    <ElTag :type="getReviewConclusionTag(review.reviewConclusion).type" size="small">
                      {{ getReviewConclusionTag(review.reviewConclusion).text }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="申报本金">{{ formatCurrency(review.declaredPrincipal) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报利息">{{ formatCurrency(review.declaredInterest) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报罚金">{{ formatCurrency(review.declaredPenalty) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报其他损失">{{ formatCurrency(review.declaredOtherLosses) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="申报总金额">
                    <span class="amount-highlight">{{ formatCurrency(review.declaredTotalAmount) }}</span>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="确认本金">{{ formatCurrency(review.confirmedPrincipal) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="确认利息">{{ formatCurrency(review.confirmedInterest) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="确认罚金">{{ formatCurrency(review.confirmedPenalty) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="确认其他损失">{{ formatCurrency(review.confirmedOtherLosses) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="确认总金额">
                    <span class="amount-highlight">{{ formatCurrency(review.confirmedTotalAmount) }}</span>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认本金">{{ formatCurrency(review.unconfirmedPrincipal) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认利息">{{ formatCurrency(review.unconfirmedInterest) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认罚金">{{ formatCurrency(review.unconfirmedPenalty) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认其他损失">{{ formatCurrency(review.unconfirmedOtherLosses) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认总金额">{{ formatCurrency(review.unconfirmedTotalAmount) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="确认债权性质">{{ review.confirmedClaimNature || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="证据真实性">
                    <ElTag :type="review.evidenceAuthenticity === 'AUTHENTIC' ? 'success' : review.evidenceAuthenticity === 'FAKE' ? 'danger' : 'warning'" size="small">
                      {{ review.evidenceAuthenticity === 'AUTHENTIC' ? '真实' : review.evidenceAuthenticity === 'FAKE' ? '伪造' : '存疑' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="证据相关性">
                    <ElTag :type="review.evidenceRelevance === 'RELEVANT' ? 'success' : 'danger'" size="small">
                      {{ review.evidenceRelevance === 'RELEVANT' ? '相关' : '不相关' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="证据合法性">
                    <ElTag :type="review.evidenceLegality === 'LEGAL' ? 'success' : 'danger'" size="small">
                      {{ review.evidenceLegality === 'LEGAL' ? '合法' : '不合法' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="担保类型">{{ review.collateralType || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="担保物">{{ review.collateralProperty || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="担保金额">{{ formatCurrency(review.collateralAmount) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="担保期限">{{ review.collateralTerm || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="担保有效性">
                    <ElTag :type="review.collateralValidity === 'VALID' ? 'success' : 'danger'" size="small">
                      {{ review.collateralValidity === 'VALID' ? '有效' : '无效' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="调整原因" :span="2">{{ review.adjustmentReason || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="未确认原因" :span="2">{{ review.unconfirmedReason || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="审查摘要" :span="2">{{ review.reviewSummary || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="备注" :span="2">{{ review.remarks || '-' }}</ElDescriptionsItem>
                </ElDescriptions>
              </div>
            </div>
            <ElEmpty v-else description="暂无债权审查记录" />
          </ElTabPane>

          <ElTabPane label="债权复查阶段" name="confirmation">
            <div v-if="creditorDetailData.claimConfirmations && creditorDetailData.claimConfirmations.length > 0">
              <div
                v-for="(confirmation, index) in creditorDetailData.claimConfirmations"
                :key="confirmation.id"
                class="claim-card mb-4"
              >
                <div class="claim-card-header">
                  <span class="claim-index">复查 {{ index + 1 }}</span>
                  <ElTag :type="getConfirmationStatusTag(confirmation.confirmationStatus).type" size="small">
                    {{ getConfirmationStatusTag(confirmation.confirmationStatus).text }}
                  </ElTag>
                </div>
                <ElDescriptions :column="2" border class="mt-3">
                  <ElDescriptionsItem label="会议类型">{{ confirmation.meetingType || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="会议日期">{{ formatDateTime(confirmation.meetingDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="会议地点">{{ confirmation.meetingLocation || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="表决结果">
                    <ElTag :type="getVoteResultTag(confirmation.voteResult).type" size="small">
                      {{ getVoteResultTag(confirmation.voteResult).text }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.voteNotes" label="表决说明">{{ confirmation.voteNotes }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="是否有异议">
                    <ElTag :type="confirmation.hasObjection ? 'danger' : 'success'" size="small">
                      {{ confirmation.hasObjection ? '是' : '否' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.objector" label="异议人">{{ confirmation.objector }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.objectionReason" label="异议原因">{{ confirmation.objectionReason }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.objectionAmount != null && confirmation.objectionAmount !== '' && Number(confirmation.objectionAmount) !== 0" label="异议金额">{{ formatCurrency(confirmation.objectionAmount) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.objectionDate" label="异议日期">{{ formatDateTime(confirmation.objectionDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.negotiationResult" label="协商结果">{{ confirmation.negotiationResult }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.negotiationDate" label="协商日期">{{ formatDateTime(confirmation.negotiationDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.negotiationParticipants" label="协商参与人">{{ confirmation.negotiationParticipants }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.courtRulingDate" label="裁定日期">{{ formatDateTime(confirmation.courtRulingDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.courtRulingNo" label="裁定编号">{{ confirmation.courtRulingNo }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.courtRulingResult" label="裁定结果">{{ confirmation.courtRulingResult }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.courtRulingAmount != null && confirmation.courtRulingAmount !== '' && Number(confirmation.courtRulingAmount) !== 0" label="裁定金额">{{ formatCurrency(confirmation.courtRulingAmount) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.courtRulingNotes" label="裁定备注">{{ confirmation.courtRulingNotes }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="是否有诉讼">
                    <ElTag :type="confirmation.hasLawsuit ? 'danger' : 'success'" size="small">
                      {{ confirmation.hasLawsuit ? '是' : '否' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.lawsuitCaseNo" label="诉讼案号">{{ confirmation.lawsuitCaseNo }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.lawsuitStatus" label="诉讼状态">{{ confirmation.lawsuitStatus }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.lawsuitResult" label="诉讼结果">{{ confirmation.lawsuitResult }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.lawsuitAmount != null && confirmation.lawsuitAmount !== '' && Number(confirmation.lawsuitAmount) !== 0" label="诉讼金额">{{ formatCurrency(confirmation.lawsuitAmount) }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.lawsuitNotes" label="诉讼备注">{{ confirmation.lawsuitNotes }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="最终确认金额">
                    <span class="amount-highlight">{{ formatCurrency(confirmation.finalConfirmedAmount) }}</span>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="最终确认日期">{{ formatDateTime(confirmation.finalConfirmationDate) }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="最终确认依据" :span="2">{{ confirmation.finalConfirmationBasis || '-' }}</ElDescriptionsItem>
                  <ElDescriptionsItem v-if="confirmation.remarks" label="备注" :span="2">{{ confirmation.remarks }}</ElDescriptionsItem>
                </ElDescriptions>
              </div>
            </div>
            <ElEmpty v-else description="暂无债权复查记录" />
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="closeDetailDialog">关闭</ElButton>
      </span>
    </template>
  </ElDialog>

  <!-- 密码验证对话框 -->
  <ElDialog
    v-model="showPasswordDialog"
    title="身份验证"
    width="420px"
    destroy-on-close
    @close="closePasswordDialog"
  >
    <div class="password-verify-content">
      <div class="mb-4 text-sm text-gray-500">
        <Icon icon="lucide:shield-alert" class="mr-1 inline-block text-warning" />
        此操作需要验证您的身份，请输入当前登录密码
      </div>
      <ElForm label-width="0" :model="passwordForm">
        <ElFormItem>
          <ElInput
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入您的登录密码"
            show-password
            @keyup.enter="handlePasswordConfirm"
          />
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="closePasswordDialog">取消</ElButton>
        <ElButton
          type="primary"
          :loading="passwordLoading"
          @click="handlePasswordConfirm"
        >
          确认
        </ElButton>
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

.creditor-detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.creditor-header {
  padding: 20px 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.creditor-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.creditor-name-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.amount-highlight {
  font-weight: 700;
  color: #0369a1;
}

.claim-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.claim-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.claim-index {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #4b5563;
  background-color: #f9fafb;
  white-space: nowrap;
}

:deep(.el-descriptions__content) {
  color: #111827;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-tag) {
  border-radius: 12px;
  padding: 0 10px;
  height: 24px;
  line-height: 22px;
}

@media (max-width: 768px) {
  
  :deep(.el-descriptions :is(.el-descriptions__label, .el-descriptions__content)) {
    font-size: 14px;
  }
}

.sensitive-field-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.password-verify-content {
  padding: 8px 0;
}
</style>
