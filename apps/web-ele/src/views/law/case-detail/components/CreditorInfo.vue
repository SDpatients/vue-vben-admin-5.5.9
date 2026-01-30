<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  createCreditorApi,
  deleteCreditorApi,
  getCreditorListApi,
  updateCreditorApi,
  batchAddCreditorsApi,
} from '#/api/core/creditor';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const creditors = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 批量新增对话框
const showBatchAddDialog = ref(false);
const addLoading = ref(false);
const addTemplate = ref('');

// 单个新增对话框
const showSingleAddDialog = ref(false);
const singleAddLoading = ref(false);
const singleForm = reactive({
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: '',
  status: '',
});

// 编辑对话框
const showEditDialog = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  creditorId: 0,
  creditorName: '',
  creditorType: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  idNumber: '',
  legalRepresentative: '',
  registeredCapital: '',
  status: '',
});

// 搜索相关数据
const searchName = ref('');
const searchStatus = ref('');

// 状态选项
const statusOptions = [
  { label: '已知债权人', value: 'KNOWN' },
  { label: '确认债权人', value: 'CONFIRMED' },
];

// 状态映射
const statusMap: Record<string, string> = {
  KNOWN: '已知债权人',
  CONFIRMED: '确认债权人',
};

// 债权人类型映射 (英文转中文)
const creditorTypeMap: Record<string, string> = {
  ENTERPRISE: '企业',
  INDIVIDUAL: '个人',
  FINANCIAL_INSTITUTION: '金融机构',
  GOVERNMENT: '政府机构',
  OTHER: '其他',
  // 保留中文值作为键，处理已有中文数据
  金融机构: '金融机构',
  企业: '企业',
  个人: '个人',
  政府机构: '政府机构',
  其他: '其他',
};

// 债权人类型选项
const creditorTypeOptions = [
  { label: '金融机构', value: '金融机构' },
  { label: '企业', value: '企业' },
  { label: '个人', value: '个人' },
  { label: '其他', value: '其他' },
];

// 转换债权人类型为中文
const convertCreditorType = (type: string): string => {
  return creditorTypeMap[type] || type;
};

// 下划线转驼峰函数
const toCamelCase = (obj: any) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }
  const camelCaseObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replaceAll(/_([a-z])/g, (g) => g[1].toUpperCase());
      camelCaseObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelCaseObj;
};

const fetchCreditors = async () => {
  loading.value = true;
  try {
    const response = await getCreditorListApi({
      caseId: Number(props.caseId),
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      creditorName: searchName.value,
      status: searchStatus.value,
    });
    if (response.code === 200 && response.data) {
      // 转换债权人类型为中文
      creditors.value = (response.data.list || []).map((creditor: any) => ({
        ...creditor,
        creditorType: convertCreditorType(creditor.creditorType),
      }));
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

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1;
  fetchCreditors();
};

// 重置搜索
const handleResetSearch = () => {
  searchName.value = '';
  searchStatus.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

// 显示全部债权人
const showAllCreditors = () => {
  searchStatus.value = '';
  currentPage.value = 1;
  fetchCreditors();
};

// 显示确认债权人
const showConfirmedCreditors = () => {
  searchStatus.value = 'CONFIRMED';
  currentPage.value = 1;
  fetchCreditors();
};

// 打开编辑对话框
const openEditDialog = (row: any) => {
  editForm.creditorId = row.id;
  editForm.creditorName = row.creditorName;
  editForm.creditorType = row.creditorType;
  editForm.contactPhone = row.contactPhone || '';
  editForm.contactEmail = row.contactEmail || '';
  editForm.address = row.address || '';
  editForm.idNumber = row.idNumber || '';
  editForm.legalRepresentative = row.legalRepresentative || '';
  editForm.registeredCapital = row.registeredCapital || '';
  editForm.status = row.creditorStatus || '';
  showEditDialog.value = true;
};

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false;
};

// 提交编辑表单
const handleEditSubmit = async () => {
  if (!editForm.creditorName) {
    ElMessage.warning('请输入债权人名称');
    return;
  }
  if (!editForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }

  editLoading.value = true;
  try {
    const response = await updateCreditorApi(editForm.creditorId, {
      creditorId: editForm.creditorId,
      creditorName: editForm.creditorName,
      creditorType: editForm.creditorType,
      contactPhone: editForm.contactPhone,
      contactEmail: editForm.contactEmail,
      address: editForm.address,
      idNumber: editForm.idNumber,
      legalRepresentative: editForm.legalRepresentative,
      registeredCapital: editForm.registeredCapital
        ? Number(editForm.registeredCapital)
        : undefined,
      creditorStatus: editForm.status,
    });
    if (response.code === 200) {
      ElMessage.success('成功更新债权人信息');
      await fetchCreditors();
      closeEditDialog();
    } else {
      ElMessage.error(`更新失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('更新债权人失败:', error);
    ElMessage.error('更新债权人失败');
  } finally {
    editLoading.value = false;
  }
};

// 删除债权人
const handleDeleteCreditor = async (row: any) => {
  try {
    const response = await deleteCreditorApi(row.id);
    if (response.code === 200) {
      ElMessage.success('成功删除债权人');
      await fetchCreditors();
    } else {
      ElMessage.error(`删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除债权人失败:', error);
    ElMessage.error('删除债权人失败');
  }
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

// 批量新增相关函数
const openBatchAddDialog = () => {
  showBatchAddDialog.value = true;
};

const closeBatchAddDialog = () => {
  showBatchAddDialog.value = false;
  resetBatchForm();
};

const resetBatchForm = () => {
  addTemplate.value = '';
};

// 单个新增相关函数
const openSingleAddDialog = () => {
  showSingleAddDialog.value = true;
};

const closeSingleAddDialog = () => {
  showSingleAddDialog.value = false;
  resetSingleForm();
};

const resetSingleForm = () => {
  singleForm.creditorName = '';
  singleForm.creditorType = '';
  singleForm.contactPhone = '';
  singleForm.contactEmail = '';
  singleForm.address = '';
  singleForm.idNumber = '';
  singleForm.legalRepresentative = '';
  singleForm.registeredCapital = '';
  singleForm.status = '';
};

const handleBatchAdd = async () => {
  if (!addTemplate.value) {
    ElMessage.warning('请输入批量新增模板');
    return;
  }

  const lines = addTemplate.value.split('\n').filter((line) => line.trim());
  if (lines.length === 0) {
    ElMessage.warning('请至少输入一条债权人信息');
    return;
  }

  const creditorsList = lines.map((line) => {
    const parts = line.split(/,|，/).map((p) => p.trim());
    return {
      creditor_name: parts[0] || '',
      creditor_type: parts[1] || '',
      contact_phone: parts[2] || '',
      contact_email: parts[3] || '',
      address: parts[4] || '',
      id_number: parts[5] || '',
      legal_representative: parts[6] || '',
      registered_capital: parts[7] || '',
      status: '1',
      created_by: '',
    };
  });

  addLoading.value = true;
  try {
    const response = await batchAddCreditorsApi({
      caseId: props.caseId,
      creditorsList,
    });
    if (response.code === 0 || response.status === '1') {
      ElMessage.success(
        `成功添加${response.data?.successCount || creditorsList.length}个债权人`,
      );
      await fetchCreditors();
      closeBatchAddDialog();
    } else {
      ElMessage.error(
        `批量添加失败：${response.message || response.error || '未知错误'}`,
      );
    }
  } catch (error) {
    console.error('批量添加债权人失败:', error);
    ElMessage.error('批量添加债权人失败');
  } finally {
    addLoading.value = false;
  }
};

// 单个新增债权人处理函数
const handleSingleAdd = async () => {
  // 表单验证
  if (!singleForm.creditorName) {
    ElMessage.warning('请输入债权人名称');
    return;
  }
  if (!singleForm.creditorType) {
    ElMessage.warning('请选择债权人类型');
    return;
  }

  singleAddLoading.value = true;
  try {
    const requestData = {
      caseId: Number(props.caseId),
      creditorName: singleForm.creditorName,
      creditorType: singleForm.creditorType,
      contactPhone: singleForm.contactPhone,
      contactEmail: singleForm.contactEmail,
      address: singleForm.address,
      idNumber: singleForm.idNumber,
      legalRepresentative: singleForm.legalRepresentative,
      registeredCapital: singleForm.registeredCapital
        ? Number(singleForm.registeredCapital)
        : undefined,
      creditorStatus: singleForm.status,
    };

    const response = await createCreditorApi(requestData);
    if (response.code === 200) {
      ElMessage.success('成功添加债权人');
      await fetchCreditors();
      closeSingleAddDialog();
    } else {
      ElMessage.error(`添加失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('添加债权人失败:', error);
    ElMessage.error('添加债权人失败');
  } finally {
    singleAddLoading.value = false;
  }
};



// 导出债权人信息
const handleExport = () => {
  // 创建CSV内容
  let csvContent =
    '债权人名称,债权人类型,联系电话,联系邮箱,证件号码,法定代表人,地址,注册资本\n';

  creditors.value.forEach((creditor) => {
    const row = [
      creditor.creditorName,
      creditor.creditorType,
      creditor.contactPhone,
      creditor.contactEmail,
      creditor.idNumber,
      creditor.legalRepresentative,
      creditor.address,
      creditor.registeredCapital,
    ]
      .map((field) => `"${field || ''}"`)
      .join(',');
    csvContent += `${row}\n`;
  });

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `债权人信息_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.append(link);
    link.click();
    link.remove();
    ElMessage.success('导出成功');
  }
};

const getCreditorTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    金融机构: { type: 'success' },
    企业: { type: 'primary' },
    个人: { type: 'primary' },
    其他: { type: 'info' },
  };
  return typeMap[type] || { type: 'info' };
};

onMounted(() => {
  fetchCreditors();
});
</script>

<template>
  <div class="creditor-info-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:users" class="text-primary mr-2" />
            <span class="text-lg font-semibold">债权人信息</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="primary" @click="openSingleAddDialog">
              <Icon icon="lucide:plus" class="mr-1" />
              单个新增
            </ElButton>
            <ElButton type="success" @click="openBatchAddDialog">
              <Icon icon="lucide:file-plus-2" class="mr-1" />
              批量新增
            </ElButton>
            <ElButton type="warning" @click="handleExport">
              <Icon icon="lucide:download" class="mr-1" />
              导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="mb-4 rounded-lg bg-gray-50 p-4">
        <div class="flex flex-wrap gap-4">
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
          <ElButton type="info" @click="showAllCreditors">
            <Icon icon="lucide:users" class="mr-1" />
            已知债权人（全部）
          </ElButton>
          <ElButton type="success" @click="showConfirmedCreditors">
            <Icon icon="lucide:check-circle" class="mr-1" />
            确认债权人
          </ElButton>
        </div>
      </div>

      <div v-loading="loading" class="creditor-list-container">
        <ElTable
          :data="creditors"
          border
          stripe
          style="width: 100%"
          class="mb-4"
        >
          <ElTableColumn
            prop="creditorName"
            label="债权人名称"
            min-width="180"
          />
          <ElTableColumn prop="creditorType" label="债权人类型" width="120">
            <template #default="scope">
              <ElTag
                :type="getCreditorTypeTag(scope.row.creditorType).type"
                size="small"
              >
                {{ scope.row.creditorType }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="contactPhone" label="联系电话" width="140" />
          <ElTableColumn prop="contactEmail" label="联系邮箱" width="180" />
          <ElTableColumn prop="idNumber" label="证件号码" width="180" />
          <ElTableColumn
            prop="legalRepresentative"
            label="法定代表人"
            width="140"
          />
          <ElTableColumn prop="address" label="地址" min-width="200" />
          <ElTableColumn
            prop="registeredCapital"
            label="注册资本"
            width="120"
          />
          <ElTableColumn prop="creditorStatus" label="债权人状态" width="120" align="center">
            <template #default="scope">
              <ElTag
                :type="scope.row.creditorStatus === 'CONFIRMED' ? 'success' : 'primary'"
                size="small"
              >
                {{ statusMap[scope.row.creditorStatus] || scope.row.creditorStatus }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="150" align="center" fixed="right">
            <template #default="scope">
              <div class="flex items-center justify-center gap-2">
                <ElButton
                  size="small"
                  text
                  @click="openEditDialog(scope.row)"
                  class="text-primary"
                >
                  <Icon icon="lucide:edit" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton
                  size="small"
                  text
                  type="danger"
                  @click="handleDeleteCreditor(scope.row)"
                >
                  <Icon icon="lucide:trash-2" class="mr-1" />
                  删除
                </ElButton>
              </div>
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

    <!-- 批量新增对话框 -->
    <ElDialog
      v-model="showBatchAddDialog"
      title="批量新增债权人"
      width="800px"
      destroy-on-close
    >
      <div class="add-dialog-container">
        <div class="template-description mb-4">
          <p class="mb-2 text-sm text-gray-600">
            请按以下格式输入债权人信息，每行一条：
          </p>
          <div class="template-example rounded bg-gray-50 p-3 text-sm">
            <p class="mb-1 font-semibold">格式说明（逗号分隔）：</p>
            <p class="text-gray-700">
              债权人名称,债权人类型,联系电话,联系邮箱,地址,证件号码,法定代表人,注册资本
            </p>
            <p class="mt-2 font-semibold">示例：</p>
            <p class="text-gray-700">
              某某银行股份有限公司,金融机构,13800138000,bank@example.com,北京市朝阳区,91110000123456789X,张三,1000万
            </p>
            <p class="text-gray-700">
              某某科技有限公司,企业,13900139000,tech@example.com,上海市浦东新区,91310000987654321Y,李四,500万
            </p>
          </div>
        </div>

        <ElForm label-width="80px">
          <ElFormItem label="批量模板">
            <ElInput
              v-model="addTemplate"
              type="textarea"
              :rows="10"
              placeholder="请输入债权人信息，每行一条，用逗号分隔"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeBatchAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleBatchAdd"
            :loading="addLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 单个新增对话框 -->
    <ElDialog
      v-model="showSingleAddDialog"
      title="单个新增债权人"
      width="600px"
      destroy-on-close
    >
      <div class="single-add-dialog-container">
        <ElForm label-width="120px" :model="singleForm">
          <ElFormItem label="债权人名称" required>
            <ElInput
              v-model="singleForm.creditorName"
              placeholder="请输入债权人名称"
            />
          </ElFormItem>
          <ElFormItem label="债权人类型" required>
            <ElSelect
              v-model="singleForm.creditorType"
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
              v-model="singleForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系邮箱">
            <ElInput
              v-model="singleForm.contactEmail"
              placeholder="请输入联系邮箱"
            />
          </ElFormItem>
          <ElFormItem label="证件号码">
            <ElInput
              v-model="singleForm.idNumber"
              placeholder="请输入证件号码"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人">
            <ElInput
              v-model="singleForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="singleForm.address" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="注册资本">
            <ElInput
              v-model="singleForm.registeredCapital"
              placeholder="请输入注册资本"
            />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect
              v-model="singleForm.status"
              placeholder="请选择状态"
            >
              <ElOption
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeSingleAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleSingleAdd"
            :loading="singleAddLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 编辑对话框 -->
    <ElDialog
      v-model="showEditDialog"
      title="编辑债权人"
      width="600px"
      destroy-on-close
    >
      <div class="edit-dialog-container">
        <ElForm label-width="120px" :model="editForm">
          <ElFormItem label="债权人名称" required>
            <ElInput
              v-model="editForm.creditorName"
              placeholder="请输入债权人名称"
            />
          </ElFormItem>
          <ElFormItem label="债权人类型" required>
            <ElSelect
              v-model="editForm.creditorType"
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
              v-model="editForm.contactPhone"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="联系邮箱">
            <ElInput
              v-model="editForm.contactEmail"
              placeholder="请输入联系邮箱"
            />
          </ElFormItem>
          <ElFormItem label="证件号码">
            <ElInput
              v-model="editForm.idNumber"
              placeholder="请输入证件号码"
            />
          </ElFormItem>
          <ElFormItem label="法定代表人">
            <ElInput
              v-model="editForm.legalRepresentative"
              placeholder="请输入法定代表人"
            />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="editForm.address" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="注册资本">
            <ElInput
              v-model="editForm.registeredCapital"
              placeholder="请输入注册资本"
            />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect
              v-model="editForm.status"
              placeholder="请选择状态"
            >
              <ElOption
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeEditDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleEditSubmit"
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
.creditor-info-container {
  padding: 5px;
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

.creditor-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

.add-dialog-container {
  padding: 10px 0;
}

.template-description {
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.template-example {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.template-example p {
  margin: 4px 0;
}
</style>
