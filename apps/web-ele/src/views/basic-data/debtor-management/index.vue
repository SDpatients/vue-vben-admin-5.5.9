<script lang="ts" setup>
import type { DebtorApi } from '#/api/core/debtor';

import { onMounted, ref } from 'vue';

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
  addDebtorApi,
  deleteDebtorApi,
  editDebtorApi,
  getDebtorListApi,
} from '#/api/core/debtor';

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
    const token = '6ee6373b2fa95f552a4710a001aff052'; // 使用固定token
    const params = {
      page: pagination.value.page,
      size: pagination.value.pageSize,
      token,
      QYMC: searchQymc.value,
      TYSHXYDM: searchTyshxydm.value,
      FDDBR: searchFddbr.value,
    };

    const response = await getDebtorListApi(params);

    if (response.status === '1') {
      debtorList.value = response.data;
      pagination.value.itemCount = response.data.length;
      pagination.value.pages = 1;
      ElMessage.success(`成功加载 ${debtorList.value.length} 条债务人记录`);
    } else {
      ElMessage.error(`API返回错误: ${response.error}`);
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

// 格式化日期显示
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
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
  ElMessage.info(`查看债务人详情: ${row.QYMC}`);
  // 后续可添加路由跳转逻辑
  // const router = useRouter();
  // router.push(`/debtor-detail`);
};

// 新增债务人弹窗相关
const dialogVisible = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const formData = ref({
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

// 表单验证规则
const rules = ref({
  QYMC: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  TYSHXYDM: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
  ],
  FDDBR: [{ required: true, message: '请输入法定代表人', trigger: 'blur' }],
});

// 打开新增债务人弹窗
const handleAddDebtor = () => {
  dialogVisible.value = true;
};

// 关闭弹窗
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
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
    // 获取当前登录用户信息
    const userInfo = JSON.parse(localStorage.getItem('chat_user_info') || '{}');
    const username = userInfo.user?.uName || 'admin';

    // 获取当前北京时间
    const now = new Date();
    const sep_adate = now.toISOString().slice(0, 19).replace('T', ' ');

    // 转换数据格式，将大写属性名转换为小写，并添加必要的字段
    const requestData = {
      qymc: formData.value.QYMC,
      tyshxydm: formData.value.TYSHXYDM,
      fddbr: formData.value.FDDBR,
      djjg: formData.value.DJJG,
      clrq: formData.value.CLRQ
        ? new Date(formData.value.CLRQ)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : null,
      zczb: formData.value.ZCZB,
      jyfw: formData.value.JYFW,
      qylx: formData.value.QYLX,
      sshy: formData.value.SSHY,
      zcdz: formData.value.ZCDZ,
      lxdh: formData.value.LXDH,
      lxr: formData.value.LXR,
      zt: formData.value.ZT,
      sep_auser: username,
      sep_adate,
    };

    const response = await addDebtorApi(requestData);

    if (response.status === '1') {
      ElMessage.success('债务人添加成功');
      dialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
      // 重置表单
      if (formRef.value) {
        formRef.value.resetFields();
      }
    } else {
      ElMessage.error(`债务人添加失败: ${response.error}`);
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
const handleEditDebtor = (row: DebtorApi.DebtorInfo) => {
  // 复制行数据到编辑表单，处理日期字段
  editFormData.value = {
    ...row,
    CLRQ: row.CLRQ ? new Date(row.CLRQ).toISOString().slice(0, 10) : '',
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
    const token = '6ee6373b2fa95f552a4710a001aff052'; // 使用固定token

    // 获取当前登录用户信息
    const userInfo = JSON.parse(localStorage.getItem('chat_user_info') || '{}');
    const username = userInfo.user?.uName || 'admin';

    // 获取当前北京时间
    const now = new Date();
    const sep_edate = now.toISOString().slice(0, 19).replace('T', ' ');

    // 构建请求数据
    const requestData = {
      SEP_EUSER: username,
      SEP_EDATE: sep_edate,
      SEP_ID: editFormData.value.SEP_ID ?? editFormData.value.AJID ?? '', // 优先使用SEP_ID，否则使用AJID，否则使用空字符串
      QYMC: editFormData.value.QYMC,
      TYSHXYDM: editFormData.value.TYSHXYDM,
      FDDBR: editFormData.value.FDDBR,
      DJJG: editFormData.value.DJJG,
      CLRQ: editFormData.value.CLRQ
        ? new Date(editFormData.value.CLRQ)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : null,
      ZCZB: editFormData.value.ZCZB,
      JYFW: editFormData.value.JYFW,
      QYLX: editFormData.value.QYLX,
      SSHY: editFormData.value.SSHY,
      ZCDZ: editFormData.value.ZCDZ,
      LXDH: editFormData.value.LXDH,
      LXR: editFormData.value.LXR,
      ZT: editFormData.value.ZT,
    };

    // 调用编辑接口
    const response = await editDebtorApi(requestData, token);

    if (response.status === '1') {
      ElMessage.success('债务人修改成功');
      editDialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
      // 重置表单
      if (editFormRef.value) {
        editFormRef.value.resetFields();
      }
    } else {
      ElMessage.error(`债务人修改失败: ${response.error}`);
    }
  } catch (error) {
    console.error('修改债务人失败:', error);
    ElMessage.error('修改债务人失败，请检查网络连接或API服务');
  }
};

// 打开删除确认弹窗
const handleDeleteDebtor = (row: DebtorApi.DebtorInfo) => {
  currentDeleteItem.value = row;
  deleteDialogVisible.value = true;
};

// 提交删除请求
const handleDeleteSubmit = async () => {
  if (!currentDeleteItem.value) return;

  try {
    const token = '7b45265f3ca3eefeaad42615d995e8c5'; // 使用删除接口指定的token
    const sepId =
      currentDeleteItem.value.SEP_ID ?? currentDeleteItem.value.AJID ?? '';

    const response = await deleteDebtorApi({ SEP_ID: sepId }, token);

    if (response.status === '1') {
      ElMessage.success('债务人删除成功');
      deleteDialogVisible.value = false;
      // 刷新列表
      fetchDebtorList();
    } else {
      ElMessage.error(`债务人删除失败: ${response.error}`);
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
          prop="qymc"
          label="企业名称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="tyshxydm"
          label="统一社会信用代码"
          width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="fddbr"
          label="法定代表人"
          width="150"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="djjg"
          label="登记机关"
          width="120"
          show-overflow-tooltip
        />
        <ElTableColumn prop="clrq" label="成立日期" width="120" align="center">
          <template #default="{ row }">
            {{ new Date(row.clrq).toLocaleDateString('zh-CN') }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="zczb"
          label="注册资本"
          width="120"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="qylx"
          label="企业类型"
          width="120"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="shhy"
          label="所属行业"
          width="120"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="zcdz"
          label="注册地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="lxdh"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn prop="lxr" label="联系人" width="120" align="center" />
        <ElTableColumn prop="zt" label="状态" width="100" align="center">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.zt)" size="small">
              {{ scope.row.zt }}
            </ElTag>
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
          <ElRow :gutter="20">
            <!-- 第一行 -->
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
                <ElInput v-model="formData.JYFW" placeholder="请输入经营范围" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="企业类型">
                <ElInput v-model="formData.QYLX" placeholder="请输入企业类型" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="所属行业">
                <ElInput v-model="formData.SSHY" placeholder="请输入所属行业" />
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
          <ElRow :gutter="20">
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
                <ElInput
                  v-model="editFormData.JYFW"
                  placeholder="请输入经营范围"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="企业类型">
                <ElInput
                  v-model="editFormData.QYLX"
                  placeholder="请输入企业类型"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="所属行业">
                <ElInput
                  v-model="editFormData.SSHY"
                  placeholder="请输入所属行业"
                />
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
