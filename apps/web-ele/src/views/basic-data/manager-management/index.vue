<script lang="ts" setup>
import type { ManagerApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElSelect,
  ElOption,
} from 'element-plus';

import {
  addManagerApi,
  deleteManagerApi,
  getManagerListApi,
  updateManagerApi,
} from '#/api/core/manager';

const userStore = useUserStore();

// 管理人列表数据
const managerList = ref<ManagerApi.ManagerInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
  LSSWSID: '',
  GLRLX: '',
  FZRID: '',
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 获取管理人列表
const fetchManagerList = async () => {
  loading.value = true;
  try {
    const params: ManagerApi.ManagerQueryParams = {
      page: pagination.page,
      size: pagination.pageSize,
      LSSWSID: searchForm.LSSWSID,
      GLRLX: searchForm.GLRLX,
      FZRID: searchForm.FZRID,
    };

    const response = await getManagerListApi(params);

    if (response.status === '1' && response.data) {
      managerList.value = response.data.records || [];
      pagination.itemCount = response.data.count || 0;
      pagination.pages = response.data.pages || 0;
      ElMessage.success('管理人列表加载成功');
    } else {
      ElMessage.error(response.error || '获取管理人列表失败');
      // 清空列表数据
      managerList.value = [];
      pagination.itemCount = 0;
      pagination.pages = 0;
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 清空列表数据
    managerList.value = [];
    pagination.itemCount = 0;
    pagination.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchManagerList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchManagerList();
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchManagerList();
};

// 重置搜索
const handleReset = () => {
  searchForm.LSSWSID = '';
  searchForm.GLRLX = '';
  searchForm.FZRID = '';
  pagination.page = 1;
  fetchManagerList();
};

// 刷新
const handleRefresh = () => {
  pagination.page = 1;
  fetchManagerList();
};

// 新增管理人弹窗状态
const dialogVisible = ref(false);

// 管理人类型选项
const managerTypeOptions = [
  { label: '律师事务所', value: '律师事务所' },
  { label: '法人', value: '法人' },
  { label: '自然人', value: '自然人' },
];

// 新增管理人表单数据
const addManagerForm = reactive({
  lsswsid: '',
  glrlx: '律师事务所',
  fzrid: '',
  lxdh: '',
  lxyx: '',
  bgdz: '',
  zt: '1',
});

// 编辑管理人弹窗状态
const editDialogVisible = ref(false);

// 编辑管理人表单数据
const editManagerForm = reactive({
  SEP_ID: '',
  LSSWSID: '',
  GLRLX: '',
  FZRID: '',
  LXDH: '',
  LXYX: '',
  BGDZ: '',
  ZT: '',
});

// 表单验证规则
const rules = reactive({
  lsswsid: [
    {
      required: true,
      message: '请输入管理人',
      trigger: 'blur',
    },
  ],
  glrlx: [
    {
      required: true,
      message: '请选择管理人类型',
      trigger: 'change',
    },
  ],
});

// 打开新增弹窗
const handleAdd = () => {
  dialogVisible.value = true;
};

// 关闭新增弹窗
const handleCloseDialog = () => {
  // 重置表单
  Object.assign(addManagerForm, {
    lsswsid: '',
    glrlx: '',
    fzrid: '',
    lxdh: '',
    lxyx: '',
    bgdz: '',
    zt: '1',
  });
};

// 提交新增表单
const handleAddSubmit = async () => {
  loading.value = true;
  try {
    const data = {
    sep_auser: userStore.userInfo?.username || 'admin',
    sep_adate: new Date().toISOString(),
    ...addManagerForm,
  };

  const response = await addManagerApi([data]);
    if (response.status === '1') {
      ElMessage.success('添加管理人成功');
      dialogVisible.value = false;
      fetchManagerList();
    } else {
      ElMessage.error(response.error || '添加管理人失败');
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 打开编辑弹窗
const handleEdit = (row: ManagerApi.ManagerInfo) => {
  Object.assign(editManagerForm, row);
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  // 重置表单
  Object.assign(editManagerForm, {
    SEP_ID: '',
    LSSWSID: '',
    GLRLX: '',
    FZRID: '',
    LXDH: '',
    LXYX: '',
    BGDZ: '',
    ZT: '',
  });
};

// 提交编辑表单
const handleEditSubmit = async () => {
  loading.value = true;
  try {
    const data = {
      SEP_EUSER: userStore.userInfo?.username || 'admin',
      SEP_EDATE: new Date().toISOString(),
      ...editManagerForm,
    };

    const response = await updateManagerApi(data);
    if (response.status === '1') {
      ElMessage.success('更新管理人成功');
      editDialogVisible.value = false;
      fetchManagerList();
    } else {
      ElMessage.error(response.error || '更新管理人失败');
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 删除管理人
const handleDelete = async (row: ManagerApi.ManagerInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理人吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    const response = await deleteManagerApi({ SEP_ID: row.SEP_ID });
    if (response.status === '1') {
      ElMessage.success('删除管理人成功');
      fetchManagerList();
    } else {
      ElMessage.error(response.error || '删除管理人失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('后端API暂时不可用，请稍后再试');
    }
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 状态选项
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' },
];

// 页面加载时获取数据
onMounted(() => {
  fetchManagerList();
});
</script>

<template>
  <div class="manager-management-container">
    <ElCard>
      <template #header>
        <div class="card-header">
          <h2 class="card-title">管理人信息管理</h2>
          <div class="card-actions">
            <ElButton type="primary" @click="handleAdd">
              <i class="i-lucide-plus mr-1"></i>
              新增
            </ElButton>
            <ElButton @click="handleRefresh">
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
            v-model="searchForm.LSSWSID"
            placeholder="管理人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElSelect
            v-model="searchForm.GLRLX"
            placeholder="管理人类型"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <ElOption
              v-for="option in managerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
          <ElInput
            v-model="searchForm.FZRID"
            placeholder="负责人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">
            <i class="i-lucide-search mr-1"></i>
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            <i class="i-lucide-refresh-cw mr-1"></i>
            重置
          </ElButton>
        </div>
      </div>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="managerList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="GLRLX"
          label="管理人类型"
          width="140"
          align="center"
        />
        <ElTableColumn
          prop="LSSWSID"
          label="管理人"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="FZRID"
          label="负责人"
          width="100"
          align="center"
        />
        <ElTableColumn
          prop="LXDH"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn
          prop="LXYX"
          label="联系邮箱"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="BGDZ"
          label="办公地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="ZT"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span :class="row.ZT === '正常' ? 'text-green-600' : 'text-red-600'">
              {{ row.ZT }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="SEP_AUSER"
          label="创建者"
          width="120"
          align="center"
        />
        <ElTableColumn
          prop="SEP_ADATE"
          label="创建时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.SEP_ADATE) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="danger" size="small" @click="handleDelete(row)">
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
    </ElCard>

    <!-- 新增管理人弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="新增管理人"
      width="500px"
      @close="handleCloseDialog"
    >
      <ElForm :model="addManagerForm" label-width="100px" :rules="rules">
        <ElFormItem label="管理人类型" prop="glrlx">
          <ElSelect v-model="addManagerForm.glrlx" placeholder="请选择管理人类型">
            <ElOption
              v-for="option in managerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="管理人" prop="lsswsid">
          <ElInput v-model="addManagerForm.lsswsid" placeholder="请输入管理人" />
        </ElFormItem>
        <ElFormItem label="负责人">
          <ElInput v-model="addManagerForm.fzrid" placeholder="请输入负责人" />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="addManagerForm.lxdh" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="联系邮箱">
          <ElInput v-model="addManagerForm.lxyx" placeholder="请输入联系邮箱" />
        </ElFormItem>
        <ElFormItem label="办公地址">
          <ElInput v-model="addManagerForm.bgdz" placeholder="请输入办公地址" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="addManagerForm.zt" placeholder="请选择状态">
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
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleAddSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 编辑管理人弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑管理人"
      width="500px"
      @close="handleCloseEditDialog"
    >
      <ElForm :model="editManagerForm" label-width="100px" :rules="rules">
        <ElFormItem label="管理人" prop="lsws">
          <ElInput v-model="editManagerForm.LSSWSID" placeholder="请输入管理人" />
        </ElFormItem>
        <ElFormItem label="管理人类型" prop="glrtype">
          <ElInput v-model="editManagerForm.GLRLX" placeholder="请输入管理人类型" />
        </ElFormItem>
        <ElFormItem label="负责人" prop="fzr">
          <ElInput v-model="editManagerForm.FZRID" placeholder="请输入负责人" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="lxdh">
          <ElInput v-model="editManagerForm.LXDH" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="联系邮箱" prop="lxemail">
          <ElInput v-model="editManagerForm.LXYX" placeholder="请输入联系邮箱" />
        </ElFormItem>
        <ElFormItem label="办公地址" prop="bgaddress">
          <ElInput v-model="editManagerForm.BGDZ" placeholder="请输入办公地址" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="editManagerForm.ZT" placeholder="请选择状态">
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
          <ElButton @click="editDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.manager-management-container {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
