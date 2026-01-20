<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  createDebtorApi,
  getDebtorListApi,
  updateDebtorApi,
  deleteDebtorApi,
} from '#/api/core/debtor';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const debtors = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);
const currentEditId = ref<number | null>(null);

const addForm = reactive({
  enterpriseName: '',
  unifiedSocialCreditCode: '',
  legalRepresentative: '',
  registrationAuthority: '',
  establishmentDate: '',
  registeredCapital: undefined as number | undefined,
  businessScope: '',
  enterpriseType: '',
  industry: '',
  registeredAddress: '',
  contactPhone: '',
  contactPerson: '',
});

const editForm = reactive({
  enterpriseName: '',
  legalRepresentative: '',
  contactPhone: '',
  contactPerson: '',
  businessScope: '',
  industry: '',
  registeredAddress: '',
});

const enterpriseTypeOptions = [
  { label: '有限责任公司', value: '有限责任公司' },
  { label: '股份有限公司', value: '股份有限公司' },
  { label: '国有企业', value: '国有企业' },
  { label: '集体企业', value: '集体企业' },
  { label: '私营企业', value: '私营企业' },
  { label: '外商投资企业', value: '外商投资企业' },
  { label: '其他', value: '其他' },
];

const industryOptions = [
  { label: '制造业', value: '制造业' },
  { label: '建筑业', value: '建筑业' },
  { label: '金融业', value: '金融业' },
  { label: '房地产业', value: '房地产业' },
  { label: '批发和零售业', value: '批发和零售业' },
  { label: '交通运输、仓储和邮政业', value: '交通运输、仓储和邮政业' },
  { label: '住宿和餐饮业', value: '住宿和餐饮业' },
  { label: '信息传输、软件和信息技术服务业', value: '信息传输、软件和信息技术服务业' },
  { label: '其他', value: '其他' },
];

const fetchDebtors = async () => {
  loading.value = true;
  try {
    const response = await getDebtorListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });
    if (response.code === 200 && response.data) {
      debtors.value = response.data.list || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取债务人列表失败：${response.message || '未知错误'}`);
      debtors.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债务人列表失败:', error);
    ElMessage.error('获取债务人列表失败');
    debtors.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchDebtors();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchDebtors();
};

const openAddDialog = () => {
  showAddDialog.value = true;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  resetAddForm();
};

const resetAddForm = () => {
  addForm.enterpriseName = '';
  addForm.unifiedSocialCreditCode = '';
  addForm.legalRepresentative = '';
  addForm.registrationAuthority = '';
  addForm.establishmentDate = '';
  addForm.registeredCapital = undefined;
  addForm.businessScope = '';
  addForm.enterpriseType = '';
  addForm.industry = '';
  addForm.registeredAddress = '';
  addForm.contactPhone = '';
  addForm.contactPerson = '';
};

const handleAdd = async () => {
  if (!addForm.enterpriseName) {
    ElMessage.warning('请输入企业名称');
    return;
  }
  if (!addForm.unifiedSocialCreditCode) {
    ElMessage.warning('请输入统一社会信用代码');
    return;
  }
  if (!addForm.legalRepresentative) {
    ElMessage.warning('请输入法定代表人');
    return;
  }

  addLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      enterpriseName: addForm.enterpriseName,
      unifiedSocialCreditCode: addForm.unifiedSocialCreditCode,
      legalRepresentative: addForm.legalRepresentative,
      registrationAuthority: addForm.registrationAuthority || undefined,
      establishmentDate: addForm.establishmentDate || undefined,
      registeredCapital: addForm.registeredCapital,
      businessScope: addForm.businessScope || undefined,
      enterpriseType: addForm.enterpriseType || undefined,
      industry: addForm.industry || undefined,
      registeredAddress: addForm.registeredAddress || undefined,
      contactPhone: addForm.contactPhone || undefined,
      contactPerson: addForm.contactPerson || undefined,
    };

    const response = await createDebtorApi(requestData);
    if (response.code === 200) {
      ElMessage.success('成功添加债务人');
      await fetchDebtors();
      closeAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('添加债务人失败:', error);
    ElMessage.error('添加债务人失败');
  } finally {
    addLoading.value = false;
  }
};

const openEditDialog = (row: any) => {
  currentEditId.value = row.id;
  editForm.enterpriseName = row.enterpriseName;
  editForm.legalRepresentative = row.legalRepresentative;
  editForm.contactPhone = row.contactPhone;
  editForm.contactPerson = row.contactPerson;
  editForm.businessScope = row.businessScope;
  editForm.industry = row.industry;
  editForm.registeredAddress = row.registeredAddress;
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  resetEditForm();
};

const resetEditForm = () => {
  editForm.enterpriseName = '';
  editForm.legalRepresentative = '';
  editForm.contactPhone = '';
  editForm.contactPerson = '';
  editForm.businessScope = '';
  editForm.industry = '';
  editForm.registeredAddress = '';
  currentEditId.value = null;
};

const handleEdit = async () => {
  if (!currentEditId.value) {
    ElMessage.warning('无效的债务人ID');
    return;
  }
  if (!editForm.enterpriseName) {
    ElMessage.warning('请输入企业名称');
    return;
  }

  editLoading.value = true;
  try {
    const response = await updateDebtorApi(currentEditId.value, {
      enterpriseName: editForm.enterpriseName,
      legalRepresentative: editForm.legalRepresentative,
      contactPhone: editForm.contactPhone,
      contactPerson: editForm.contactPerson,
      businessScope: editForm.businessScope,
      industry: editForm.industry,
      registeredAddress: editForm.registeredAddress,
    });
    if (response.code === 200) {
      ElMessage.success('更新成功');
      await fetchDebtors();
      closeEditDialog();
    } else {
      ElMessage.error(`更新失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('更新债务人失败:', error);
    ElMessage.error('更新债务人失败');
  } finally {
    editLoading.value = false;
  }
};

const handleDelete = async (row: any) => {
  try {
    const response = await deleteDebtorApi(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      await fetchDebtors();
    } else {
      ElMessage.error(`删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除债务人失败:', error);
    ElMessage.error('删除债务人失败');
  }
};

const getEnterpriseTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    有限责任公司: { type: 'primary' },
    股份有限公司: { type: 'success' },
    国有企业: { type: 'danger' },
    集体企业: { type: 'warning' },
    私营企业: { type: 'info' },
    外商投资企业: { type: 'primary' },
    其他: { type: 'info' },
  };
  return typeMap[type] || { type: 'info' };
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

onMounted(() => {
  fetchDebtors();
});
</script>

<template>
  <div class="debtor-info-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:building-2" class="mr-2 text-primary" />
            <span class="text-lg font-semibold">债务人信息</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="primary" @click="openAddDialog">
              <Icon icon="lucide:plus" class="mr-1" />
              新增债务人
            </ElButton>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="debtor-list-container">
        <ElTable
          :data="debtors"
          border
          stripe
          style="width: 100%"
          class="mb-4"
        >
          <ElTableColumn
            prop="enterpriseName"
            label="企业名称"
            min-width="200"
          />
          <ElTableColumn
            prop="unifiedSocialCreditCode"
            label="统一社会信用代码"
            width="200"
          />
          <ElTableColumn
            prop="legalRepresentative"
            label="法定代表人"
            width="120"
          />
          <ElTableColumn
            prop="registrationAuthority"
            label="登记机关"
            width="150"
          />
          <ElTableColumn
            prop="establishmentDate"
            label="成立日期"
            width="120"
            :formatter="(row) => formatDate(row.establishmentDate)"
          />
          <ElTableColumn
            prop="registeredCapital"
            label="注册资本"
            width="120"
          />
          <ElTableColumn prop="enterpriseType" label="企业类型" width="140">
            <template #default="scope">
              <ElTag
                v-if="scope.row.enterpriseType"
                :type="getEnterpriseTypeTag(scope.row.enterpriseType).type"
                size="small"
              >
                {{ scope.row.enterpriseType }}
              </ElTag>
              <span v-else>-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="industry" label="行业" width="140" />
          <ElTableColumn
            prop="registeredAddress"
            label="注册地址"
            min-width="200"
          />
          <ElTableColumn prop="contactPhone" label="联系电话" width="130" />
          <ElTableColumn prop="contactPerson" label="联系人" width="120" />
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="scope">
              <ElButton
                size="small"
                type="primary"
                @click="openEditDialog(scope.row)"
                style="margin-right: 8px"
              >
                <Icon icon="lucide:pencil" class="mr-1" />
                编辑
              </ElButton>
              <ElPopconfirm
                title="确定要删除该债务人吗？"
                @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <ElButton size="small" type="danger">
                    <Icon icon="lucide:trash-2" class="mr-1" />
                    删除
                  </ElButton>
                </template>
              </ElPopconfirm>
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

        <div v-if="debtors.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债务人信息" />
        </div>
      </div>
    </ElCard>

    <!-- 新增对话框 -->
    <ElDialog
      v-model="showAddDialog"
      title="新增债务人"
      width="800px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="add-dialog-container">
        <ElForm label-width="140px">
          <ElFormItem label="企业名称" required>
            <ElInput
              v-model="addForm.enterpriseName"
              placeholder="请输入企业名称"
            />
          </ElFormItem>
          <ElFormItem label="统一社会信用代码" required>
            <ElInput
              v-model="addForm.unifiedSocialCreditCode"
              placeholder="请输入统一社会信用代码"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人" required>
            <ElInput
              v-model="addForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="登记机关">
            <ElInput
              v-model="addForm.registrationAuthority"
              placeholder="请输入登记机关"
            />
          </ElFormItem>
          <ElFormItem label="成立日期">
            <ElDatePicker
              v-model="addForm.establishmentDate"
              type="date"
              placeholder="请选择成立日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="注册资本">
            <ElInputNumber
              v-model="addForm.registeredCapital"
              placeholder="请输入注册资本"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="企业类型">
            <ElSelect
              v-model="addForm.enterpriseType"
              placeholder="请选择企业类型"
              style="width: 100%"
              clearable
            >
              <ElOption
                v-for="option in enterpriseTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="行业">
            <ElSelect
              v-model="addForm.industry"
              placeholder="请选择行业"
              style="width: 100%"
              clearable
            >
              <ElOption
                v-for="option in industryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="注册地址">
            <ElInput
              v-model="addForm.registeredAddress"
              type="textarea"
              :rows="2"
              placeholder="请输入注册地址"
            />
          </ElFormItem>
          <ElFormItem label="经营范围">
            <ElInput
              v-model="addForm.businessScope"
              type="textarea"
              :rows="3"
              placeholder="请输入经营范围"
            />
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput
              v-model="addForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系人">
            <ElInput
              v-model="addForm.contactPerson"
              placeholder="请输入联系人"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleAdd"
            :loading="addLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 编辑对话框 -->
    <ElDialog
      v-model="showEditDialog"
      title="编辑债务人"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="edit-dialog-container">
        <ElForm label-width="120px">
          <ElFormItem label="企业名称" required>
            <ElInput
              v-model="editForm.enterpriseName"
              placeholder="请输入企业名称"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人" required>
            <ElInput
              v-model="editForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput
              v-model="editForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系人">
            <ElInput
              v-model="editForm.contactPerson"
              placeholder="请输入联系人"
            />
          </ElFormItem>
          <ElFormItem label="行业">
            <ElSelect
              v-model="editForm.industry"
              placeholder="请选择行业"
              style="width: 100%"
              clearable
            >
              <ElOption
                v-for="option in industryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="注册地址">
            <ElInput
              v-model="editForm.registeredAddress"
              type="textarea"
              :rows="2"
              placeholder="请输入注册地址"
            />
          </ElFormItem>
          <ElFormItem label="经营范围">
            <ElInput
              v-model="editForm.businessScope"
              type="textarea"
              :rows="3"
              placeholder="请输入经营范围"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeEditDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleEdit"
            :loading="editLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.debtor-info-container {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.debtor-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

.add-dialog-container,
.edit-dialog-container {
  padding: 10px 0;
  max-height: 600px;
  overflow-y: auto;
}
</style>
