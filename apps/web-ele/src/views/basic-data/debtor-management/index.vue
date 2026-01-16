<script lang="ts" setup>
import type { DebtorApi } from '#/api/core/debtor';

import { onMounted, ref } from 'vue';

import { requestClient8085 } from '#/api/request';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopover,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  createDebtorApi,
  deleteDebtorApi,
  updateDebtorApi,
  getDebtorListApi,
} from '#/api/core/debtor';

import { getCaseSimpleListApi } from '#/api/core/case';

// 响应式数据
const debtorList = ref<DebtorApi.DebtorInfo[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 搜索相关数据
const searchQymc = ref(''); // 企业名称
const searchTyshxydm = ref(''); // 统一社会信用代码
const searchFddbr = ref(''); // 法定代表人

// 搜索功能
const handleSearch = () => {
  pagination.value.page = 1;
  fetchDebtorList();
};

// 重置搜索
const resetSearch = () => {
  searchQymc.value = '';
  searchTyshxydm.value = '';
  searchFddbr.value = '';
  pagination.value.page = 1;
  fetchDebtorList();
};

// 列显示控制
const columnVisible = ref<string[]>([]);

// 所有可用的列
const availableColumns = [
  '行号',
  '企业名称',
  '统一社会信用代码',
  '法定代表人',
  '登记机关',
  '成立日期',
  '注册资本',
  '经营范围',
  '企业类型',
  '所属行业',
  '注册地址',
  '联系电话',
  '联系人',
  '状态',
];

// 默认显示的列（核心信息）
const defaultColumns = new Set([
  '企业名称',
  '法定代表人',
  '状态',
  '统一社会信用代码',
  '行号',
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

// 获取债务人列表
const fetchDebtorList = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
      enterpriseName: searchQymc.value,
      unifiedSocialCreditCode: searchTyshxydm.value,
      legalRepresentative: searchFddbr.value,
    };

    const response = await getDebtorListApi(params);
    console.log('API响应:', response);

    if (response.code === 200) {
      // 处理API响应，直接使用新的字段名
      const data = response.data || {};
      const list = data.list || [];
      
      debtorList.value = list;
      pagination.value.itemCount = data.total || 0;
      pagination.value.pages = Math.ceil((data.total || 0) / pagination.value.pageSize) || 1;
      ElMessage.success(`成功加载 ${list.length} 条债务人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.message}`);
      debtorList.value = [];
      pagination.value.itemCount = 0;
      pagination.value.pages = 0;
    }
  } catch (error) {
    console.error('获取债务人列表失败:', error);
    ElMessage.error('获取债务人列表失败，请检查网络连接或API服务');
    debtorList.value = [];
    pagination.value.itemCount = 0;
    pagination.value.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchDebtorList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  fetchDebtorList();
};

// 刷新债务人列表
const handleRefresh = () => {
  pagination.value.page = 1;
  fetchDebtorList();
};

// 页面加载时获取数据
onMounted(() => {
  initColumnVisibility();
  fetchDebtorList();
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

// 获取案件列表
const getCaseList = async (query = '') => {
  caseLoading.value = true;
  try {
    const response = await getCaseSimpleListApi({
      page: 1,
      size: 10,
      caseNumber: query,
    });
    
    if (response.code === 200 && response.data?.list) {
      caseList.value = response.data.list;
    } else {
      caseList.value = [];
    }
  } catch (error) {
    console.error('获取案件列表失败:', error);
    caseList.value = [];
  } finally {
    caseLoading.value = false;
  }
};

// 处理案号选择
const handleCaseSelect = (value: string) => {
  formData.value.AH = value;
  // 根据选中的caseNumber值在caseList中找到对应的项，获取其id
  const selectedCase = caseList.value.find((item) => item.caseNumber === value);
  if (selectedCase) {
    formData.value.SEP_ID = selectedCase.id.toString(); // 将id转换为字符串存储
    formData.value.caseId = selectedCase.id; // 存储caseId
  }
};

// 格式化日期显示
const formatDate = (dateValue: any) => {
  if (!dateValue) return '-';
  
  let date;
  if (typeof dateValue === 'number') {
    // 处理时间戳（毫秒或秒）
    if (dateValue.toString().length === 10) {
      // 秒级时间戳转换为毫秒
      date = new Date(dateValue * 1000);
    } else {
      // 毫秒级时间戳
      date = new Date(dateValue);
    }
  } else if (typeof dateValue === 'string') {
    // 处理字符串日期
    date = new Date(dateValue);
  } else {
    // 其他类型
    date = new Date(dateValue);
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '-';
  }
  
  return date.toLocaleDateString('zh-CN');
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '停业': {
      return 'warning';
    }
    case '在营': {
      return 'success';
    }
    case '注销': {
      return 'danger';
    }
    default: {
      return 'info';
    }
  }
};

// 查看债务人详情
const viewDebtorDetail = (row: DebtorApi.DebtorInfo) => {
  ElMessage.info(`查看债务人详情: ${row.enterpriseName}`);
  // 后续可添加路由跳转逻辑
  // const router = useRouter();
  // router.push(`/debtor-detail`);
};

// 案件列表数据
const caseList = ref<any[]>([]);
const caseLoading = ref(false);
const caseSearchQuery = ref('');

// 新增债务人弹窗相关
const dialogVisible = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const formData = ref({
  SEP_ID: '', // 案号ID
  caseId: 0, // 案件ID
  AH: '', // 案号
  QYMC: '', // 企业名称
  TYSHXYDM: '', // 统一社会信用代码
  FDDBR: '', // 法定代表人
  DJJG: '', // 登记机关
  CLRQ: '', // 成立日期
  ZCZB: '', // 注册资本
  JYFW: '', // 经营范围
  QYLX: '', // 企业类型
  SSHY: '', // 所属行业
  ZCDZ: '', // 注册地址
  LXDH: '', // 联系电话
  LXR: '', // 联系人
  ZT: '', // 状态
});

// 状态选项
const statusOptions = [
  { label: '在营', value: '在营' },
  { label: '注销', value: '注销' },
  { label: '吊销', value: '吊销' },
  { label: '停业', value: '停业' },
  { label: '清算', value: '清算' },
  { label: '其他', value: '其他' },
];

// 经营范围选项
const businessScopeOptions = [
  { label: '软件开发', value: '软件开发' },
  { label: '硬件制造', value: '硬件制造' },
  { label: '互联网服务', value: '互联网服务' },
  { label: '金融服务', value: '金融服务' },
  { label: '教育培训', value: '教育培训' },
  { label: '医疗健康', value: '医疗健康' },
  { label: '零售批发', value: '零售批发' },
  { label: '其他', value: '其他' },
];

// 企业类型选项
const enterpriseTypeOptions = [
  { label: '有限责任公司', value: '有限责任公司' },
  { label: '股份有限公司', value: '股份有限公司' },
  { label: '个人独资企业', value: '个人独资企业' },
  { label: '合伙企业', value: '合伙企业' },
  { label: '国有企业', value: '国有企业' },
  { label: '集体企业', value: '集体企业' },
  { label: '外资企业', value: '外资企业' },
  { label: '其他', value: '其他' },
];

// 所属行业选项
const industryOptions = [
  { label: '信息技术', value: '信息技术' },
  { label: '金融', value: '金融' },
  { label: '制造业', value: '制造业' },
  { label: '教育', value: '教育' },
  { label: '医疗', value: '医疗' },
  { label: '零售', value: '零售' },
  { label: '房地产', value: '房地产' },
  { label: '其他', value: '其他' },
];

// 表单验证规则
const rules = ref({
  QYMC: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  // 统一社会信用代码、手机号不需要校验，可以为空
});

// 打开新增债务人弹窗
const handleAddDebtor = () => {
  dialogVisible.value = true;
  // 打开弹窗时加载案号列表
  getCaseList();
};

// 关闭弹窗
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 重置隐藏字段
  formData.value.SEP_ID = '';
  formData.value.caseId = 0;
  formData.value.AH = '';
};

// 提交新增债务人表单
const handleSubmit = () => {
  if (!formRef.value) return;

  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('表单验证失败，请检查必填项');
      return;
    }

    // 表单验证通过，提交数据
    submitFormData();
  });
};

// 实际提交表单数据
const submitFormData = async () => {
  try {
    // 转换数据格式，使用新的字段名
    const requestData = {
      caseId: formData.value.caseId,
      enterpriseName: formData.value.QYMC,
      unifiedSocialCreditCode: formData.value.TYSHXYDM,
      legalRepresentative: formData.value.FDDBR,
      registrationAuthority: formData.value.DJJG,
      establishmentDate: formData.value.CLRQ,
      registeredCapital: formData.value.ZCZB ? Number(formData.value.ZCZB) : undefined,
      businessScope: formData.value.JYFW,
      enterpriseType: formData.value.QYLX,
      industry: formData.value.SSHY,
      registeredAddress: formData.value.ZCDZ,
      contactPhone: formData.value.LXDH,
      contactPerson: formData.value.LXR,
    };

    const response = await createDebtorApi(requestData);

    if (response.code === 200) {
      ElMessage.success('债务人添加成功');
      dialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
      // 重置表单
      if (formRef.value) {
        formRef.value.resetFields();
      }
      // 重置所有案号相关数据
      formData.value.SEP_ID = '';
      formData.value.caseId = 0;
      formData.value.AH = '';
    } else {
      ElMessage.error(`债务人添加失败: ${response.message}`);
    }
  } catch (error) {
    console.error('添加债务人失败:', error);
    ElMessage.error('添加债务人失败，请检查网络连接或API服务');
  }
};

// 删除债务人相关
const deleteDialogVisible = ref(false);
const currentDeleteItem = ref<DebtorApi.DebtorInfo | null>(null);

// 编辑债务人相关
const editDialogVisible = ref(false);
const editFormRef = ref<InstanceType<typeof ElForm>>();
const editFormData = ref({
  row: 0,
  id: 0,
  AJID: '',
  SEP_ID: '',
  QYMC: '',
  TYSHXYDM: '',
  FDDBR: '',
  DJJG: '',
  CLRQ: '',
  ZCZB: '',
  JYFW: '',
  QYLX: '',
  SSHY: '',
  ZCDZ: '',
  LXDH: '',
  LXR: '',
  ZT: '',
} as {
  id: number;
  AJID: string;
  CLRQ: string;
  DJJG: string;
  FDDBR: string;
  JYFW: string;
  LXDH: string;
  LXR: string;
  QYLX: string;
  QYMC: string;
  row: number;
  SEP_ID?: string;
  SSHY: string;
  TYSHXYDM: string;
  ZCDZ: string;
  ZCZB: string;
  ZT: string;
});

// 打开编辑债务人弹窗
const handleEditDebtor = (row: any) => {
  // 直接从row中获取id字段作为债务人ID
  const debtorId = row.id;
  
  // 调试信息，查看id是否获取到
  console.log('编辑债务人时获取的ID:', debtorId);
  console.log('原始行数据:', row);
  
  // 复制行数据到编辑表单，使用新的字段名
  editFormData.value = {
    id: debtorId, // 存储债务人ID
    AJID: '',
    SEP_ID: debtorId?.toString() || '', // 兼容旧代码
    QYMC: row.enterpriseName || row.QYMC || row.qymc || '',
    TYSHXYDM: row.unifiedSocialCreditCode || row.TYSHXYDM || row.tyshxydm || '',
    FDDBR: row.legalRepresentative || row.FDDBR || row.fddbr || '',
    DJJG: row.registrationAuthority || row.DJJG || row.djjg || '',
    CLRQ: row.establishmentDate || row.CLRQ || row.clrq ? new Date(row.establishmentDate || row.CLRQ || row.clrq).toISOString().slice(0, 10) : '',
    ZCZB: row.registeredCapital?.toString() || row.ZCZB || row.zczb || '',
    JYFW: row.businessScope || row.JYFW || row.jyfw || '',
    QYLX: row.enterpriseType || row.QYLX || row.qylx || '',
    SSHY: row.industry || row.SSHY || row.shhy || '',
    ZCDZ: row.registeredAddress || row.ZCDZ || row.zcdz || '',
    LXDH: row.contactPhone || row.LXDH || row.lxdh || '',
    LXR: row.contactPerson || row.LXR || row.lxr || '',
    ZT: row.status || row.ZT || row.zt || '',
    row: 0,
  };
  
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

// 提交编辑债务人表单
const handleEditSubmit = () => {
  if (!editFormRef.value) return;

  editFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('表单验证失败，请检查必填项');
      return;
    }

    // 表单验证通过，提交数据
    submitEditFormData();
  });
};

// 实际提交编辑表单数据
const submitEditFormData = async () => {
  try {
    // 获取债务人ID
    const debtorId = editFormData.value.id;
    if (!debtorId) {
      ElMessage.error('债务人ID获取失败');
      return;
    }

    // 构建请求数据，使用新的字段名
    const requestData = {
      enterpriseName: editFormData.value.QYMC,
      legalRepresentative: editFormData.value.FDDBR,
      contactPhone: editFormData.value.LXDH,
      contactPerson: editFormData.value.LXR,
      businessScope: editFormData.value.JYFW,
      industry: editFormData.value.SSHY,
      registeredAddress: editFormData.value.ZCDZ,
    };

    // 调用编辑接口
    const response = await updateDebtorApi(debtorId, requestData);

    if (response.code === 200) {
      ElMessage.success('债务人修改成功');
      editDialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
      // 重置表单
      if (editFormRef.value) {
        editFormRef.value.resetFields();
      }
    } else {
      ElMessage.error(`债务人修改失败: ${response.message}`);
    }
  } catch (error) {
    console.error('修改债务人失败:', error);
    ElMessage.error('修改债务人失败，请检查网络连接或API服务');
  }
};

// 打开删除确认弹窗
const handleDeleteDebtor = (row: any) => {
  currentDeleteItem.value = row;
  deleteDialogVisible.value = true;
};

// 提交删除请求
const handleDeleteSubmit = async () => {
  if (!currentDeleteItem.value) return;

  try {
    const row = currentDeleteItem.value;
    
    // 直接从row中获取id字段作为债务人ID
    const debtorId = row.id;
    if (!debtorId) {
      ElMessage.error('债务人ID获取失败');
      return;
    }
    
    console.log('删除债务人时使用的ID:', debtorId);
    console.log('原始删除数据:', row);

    const response = await deleteDebtorApi(debtorId);

    if (response.code === 200) {
      ElMessage.success('债务人删除成功');
      deleteDialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
    } else {
      ElMessage.error(`债务人删除失败: ${response.message}`);
    }
  } catch (error) {
    console.error('删除债务人失败:', error);
    ElMessage.error('删除债务人失败，请检查网络连接或API服务');
  }
};
</script>

<template>
  <div class="p-6">
    <ElCard header="债务人管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">债务人管理</span>
          <div class="flex items-center space-x-2">
            <ElDropdown trigger="click">
              <ElButton type="info" size="small">
                <i class="i-lucide-settings mr-1"></i>
                列设置
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="showAllColumns">
                    显示所有列
                  </ElDropdownItem>
                  <ElDropdownItem @click="hideNonCoreColumns">
                    仅显示核心列
                  </ElDropdownItem>
                  <ElDropdownItem @click="resetColumns">
                    重置为默认
                  </ElDropdownItem>
                  <ElDropdownItem divided>
                    <ElPopover
                      placement="right"
                      width="300"
                      trigger="click"
                      title="自定义列显示"
                    >
                      <template #reference>
                        <span>自定义列显示</span>
                      </template>
                      <div class="space-y-2">
                        <div class="mb-2 text-sm text-gray-500">
                          选择要显示的列：
                        </div>
                        <ElCheckboxGroup v-model="columnVisible">
                          <div class="grid grid-cols-2 gap-2">
                            <ElCheckbox value="行号" name="行号">
                              行号
                            </ElCheckbox>

                            <ElCheckbox value="企业名称" name="企业名称">
                              企业名称
                            </ElCheckbox>
                            <ElCheckbox
                              value="统一社会信用代码"
                              name="统一社会信用代码"
                            >
                              统一社会信用代码
                            </ElCheckbox>
                            <ElCheckbox value="法定代表人" name="法定代表人">
                              法定代表人
                            </ElCheckbox>
                            <ElCheckbox value="登记机关" name="登记机关">
                              登记机关
                            </ElCheckbox>
                            <ElCheckbox value="成立日期" name="成立日期">
                              成立日期
                            </ElCheckbox>
                            <ElCheckbox value="注册资本" name="注册资本">
                              注册资本
                            </ElCheckbox>
                            <ElCheckbox value="经营范围" name="经营范围">
                              经营范围
                            </ElCheckbox>
                            <ElCheckbox value="企业类型" name="企业类型">
                              企业类型
                            </ElCheckbox>
                            <ElCheckbox value="所属行业" name="所属行业">
                              所属行业
                            </ElCheckbox>
                            <ElCheckbox value="注册地址" name="注册地址">
                              注册地址
                            </ElCheckbox>
                            <ElCheckbox value="联系电话" name="联系电话">
                              联系电话
                            </ElCheckbox>
                            <ElCheckbox value="联系人" name="联系人">
                              联系人
                            </ElCheckbox>
                            <ElCheckbox value="状态" name="状态">
                              状态
                            </ElCheckbox>
                          </div>
                        </ElCheckboxGroup>
                      </div>
                    </ElPopover>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton type="primary" @click="handleAddDebtor">
              <i class="i-lucide-plus mr-1"></i>
              新增债务人
            </ElButton>
            <ElButton type="primary" @click="handleRefresh" :loading="loading">
              <i class="i-lucide-refresh-cw mr-1"></i>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="mb-4 rounded-lg bg-gray-50 p-4">
        <div class="flex flex-wrap gap-4">
          <ElInput
            v-model="searchQymc"
            placeholder="企业名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElInput
            v-model="searchTyshxydm"
            placeholder="统一社会信用代码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElInput
            v-model="searchFddbr"
            placeholder="法定代表人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">
            <i class="i-lucide-search mr-1"></i>
            搜索
          </ElButton>
          <ElButton @click="resetSearch">
            <i class="i-lucide-refresh-cw mr-1"></i>
            重置
          </ElButton>
        </div>
      </div>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="debtorList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="caseNumber"
          label="案号"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="caseName"
          label="案件名称"
          min-width="250"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="enterpriseName"
          label="企业名称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="unifiedSocialCreditCode"
          label="统一社会信用代码"
          width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="legalRepresentative"
          label="法定代表人"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="contactPhone"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn
          prop="contactPerson"
          label="联系人"
          width="120"
          align="center"
        />
        <ElTableColumn
          prop="businessScope"
          label="经营范围"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="industry"
          label="行业"
          width="120"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="registeredAddress"
          label="注册地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updateTime" label="更新时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              @click="handleEditDebtor(row)"
              class="mr-2"
            >
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="handleDeleteDebtor(row)"
            >
              <i class="i-lucide-trash-2 mr-1"></i>
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
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

      <!-- 新增债务人弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        title="新增债务人"
        width="1200px"
        :before-close="handleCloseDialog"
        custom-class="debtor-dialog"
      >
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="w-full"
        >
          <ElRow :gutter="30">
            <!-- 第一行 -->
            <ElCol :span="8">
              <ElFormItem label="案号">
                <ElSelect
                  v-model="formData.AH"
                  placeholder="请选择或搜索案号"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="getCaseList"
                  :loading="caseLoading"
                  @change="handleCaseSelect"
                >
                  <ElOption
                    v-for="item in caseList"
                    :key="item.id"
                    :label="item.caseNumber"
                    :value="item.caseNumber"
                    :data="item"
                  />
                </ElSelect>
              </ElFormItem>
              <!-- 隐藏的sep_id字段，用于存储案号的SEP_ID -->
              <ElFormItem prop="SEP_ID" class="hidden-field">
                <ElInput v-model="formData.SEP_ID" type="hidden" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="企业名称" prop="QYMC">
                <ElInput v-model="formData.QYMC" placeholder="请输入企业名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="统一社会信用代码" prop="TYSHXYDM">
                <ElInput
                  v-model="formData.TYSHXYDM"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="法定代表人" prop="FDDBR">
                <ElInput
                  v-model="formData.FDDBR"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>

            <!-- 第二行 -->
            <ElCol :span="8">
              <ElFormItem label="登记机关">
                <ElInput v-model="formData.DJJG" placeholder="请输入登记机关" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="成立日期">
                <ElDatePicker
                  v-model="formData.CLRQ"
                  type="date"
                  placeholder="选择成立日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="注册资本">
                <ElInput v-model="formData.ZCZB" placeholder="请输入注册资本" />
              </ElFormItem>
            </ElCol>

            <!-- 第三行 -->
            <ElCol :span="8">
              <ElFormItem label="经营范围">
                <ElSelect v-model="formData.JYFW" placeholder="请选择经营范围">
                  <ElOption
                    v-for="option in businessScopeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="企业类型">
                <ElSelect v-model="formData.QYLX" placeholder="请选择企业类型">
                  <ElOption
                    v-for="option in enterpriseTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="所属行业">
                <ElSelect v-model="formData.SSHY" placeholder="请选择所属行业">
                  <ElOption
                    v-for="option in industryOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>

            <!-- 第四行 -->
            <ElCol :span="8">
              <ElFormItem label="注册地址">
                <ElInput v-model="formData.ZCDZ" placeholder="请输入注册地址" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="联系电话">
                <ElInput v-model="formData.LXDH" placeholder="请输入联系电话" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="联系人">
                <ElInput v-model="formData.LXR" placeholder="请输入联系人" />
              </ElFormItem>
            </ElCol>

            <!-- 第五行 -->
            <ElCol :span="8">
              <ElFormItem label="状态">
                <ElSelect v-model="formData.ZT" placeholder="请选择状态">
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
        </ElForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <ElButton @click="handleCloseDialog">取消</ElButton>
            <ElButton type="primary" @click="handleSubmit">确定</ElButton>
          </div>
        </template>
      </ElDialog>

      <!-- 编辑债务人弹窗 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑债务人"
        width="1000px"
        height="1000px"
        :before-close="handleCloseEditDialog"
        custom-class="debtor-dialog"
      >
        <ElForm
          ref="editFormRef"
          :model="editFormData"
          :rules="rules"
          label-width="120px"
          class="w-full"
        >
          <ElRow :gutter="30">
            <!-- 第一行 -->
            <ElCol :span="8">
              <ElFormItem label="企业名称" prop="QYMC">
                <ElInput
                  v-model="editFormData.QYMC"
                  placeholder="请输入企业名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="统一社会信用代码" prop="TYSHXYDM">
                <ElInput
                  v-model="editFormData.TYSHXYDM"
                  placeholder="请输入统一社会信用代码"
                  style="white-space: nowrap;"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="法定代表人" prop="FDDBR">
                <ElInput
                  v-model="editFormData.FDDBR"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>

            <!-- 第二行 -->
            <ElCol :span="8">
              <ElFormItem label="登记机关">
                <ElInput
                  v-model="editFormData.DJJG"
                  placeholder="请输入登记机关"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="成立日期">
                <ElDatePicker
                  v-model="editFormData.CLRQ"
                  type="date"
                  placeholder="选择成立日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="注册资本">
                <ElInput
                  v-model="editFormData.ZCZB"
                  placeholder="请输入注册资本"
                />
              </ElFormItem>
            </ElCol>

            <!-- 第三行 -->
            <ElCol :span="8">
              <ElFormItem label="经营范围">
                <ElSelect v-model="editFormData.JYFW" placeholder="请选择经营范围">
                  <ElOption
                    v-for="option in businessScopeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="企业类型">
                <ElSelect v-model="editFormData.QYLX" placeholder="请选择企业类型">
                  <ElOption
                    v-for="option in enterpriseTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="所属行业">
                <ElSelect v-model="editFormData.SSHY" placeholder="请选择所属行业">
                  <ElOption
                    v-for="option in industryOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>

            <!-- 第四行 -->
            <ElCol :span="8">
              <ElFormItem label="注册地址">
                <ElInput
                  v-model="editFormData.ZCDZ"
                  placeholder="请输入注册地址"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="联系电话">
                <ElInput
                  v-model="editFormData.LXDH"
                  placeholder="请输入联系电话"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="联系人">
                <ElInput
                  v-model="editFormData.LXR"
                  placeholder="请输入联系人"
                />
              </ElFormItem>
            </ElCol>

            <!-- 第五行 -->
            <ElCol :span="8">
              <ElFormItem label="状态">
                <ElSelect v-model="editFormData.ZT" placeholder="请选择状态">
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
        </ElForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <ElButton @click="handleCloseEditDialog">取消</ElButton>
            <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
          </div>
        </template>
      </ElDialog>

      <!-- 删除确认弹窗 -->
      <ElDialog
        v-model="deleteDialogVisible"
        title="删除确认"
        width="400px"
        custom-class="delete-dialog"
      >
        <div class="py-4 text-center">
          <div class="mb-2 text-lg font-medium">
            确定要删除债务人 "{{ currentDeleteItem?.QYMC }}" 吗？
          </div>
          <div class="text-sm text-gray-500">
            删除后将无法恢复，请谨慎操作。
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <ElButton @click="deleteDialogVisible = false">取消</ElButton>
            <ElButton type="danger" @click="handleDeleteSubmit">
              确定删除
            </ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style scoped>
/* 响应式表格样式 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 11px;
  }

  :deep(.el-table .cell) {
    padding: 2px 4px;
  }
}

:deep(.vben-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  font-size: 12px;
  border-radius: 8px;
}

:deep(.el-table .cell) {
  padding: 4px 8px;
  line-height: 1.4;
}

:deep(.el-table__header-wrapper) {
  font-weight: 600;
}

:deep(.el-table--scrollable-x .el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table--scrollable-y .el-table__body-wrapper) {
  max-height: 500px;
  overflow-y: auto;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.number-value {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 隐藏字段样式 */
.hidden-field {
  display: none;
}

/* 新增债务人弹窗样式 */
:deep(.debtor-dialog) {
  .el-dialog__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .el-dialog {
    display: flex;
    flex-direction: column;
    height: 1000px;
    margin: 0;
  }

  .el-dialog__body {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
  }

  .el-dialog__header {
    padding: 30px;
    border-bottom: 1px solid #eee;
  }

  .el-dialog__title {
    font-size: 20px;
    font-weight: bold;
  }

  .el-dialog__footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 30px;
    border-top: 1px solid #eee;
  }

  /* 表单样式优化 */
  .el-form {
    max-width: 100%;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-form-item__label {
    font-weight: bold;
  }

  .el-input__wrapper,
  .el-select__wrapper {
    border-radius: 4px;
  }

  /* 按钮样式优化 */
  .el-button {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 4px;
  }

  .el-button--primary {
    background-color: #409eff;
    border-color: #409eff;
  }

  .el-button--primary:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}
</style>
