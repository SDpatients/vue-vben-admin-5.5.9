<script lang="ts" setup>
import type { CourtApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { addCourtApi, getCourtListApi, updateCourtApi, deleteCourtApi } from '#/api/core';

// 法院列表数据
const courtList = ref<CourtApi.CourtInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
  FYQC: '',
  FYJC: '',
  FYJB: '',
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pages: 0,
});

// 获取法院列表
const fetchCourtList = async () => {
  loading.value = true;
  try {
    const params: CourtApi.CourtQueryParams = {
      page: pagination.page,
      size: pagination.pageSize,
    };

    const response = await getCourtListApi(params);

    if (response.status === '1' && response.data) {
      courtList.value = response.data.records || [];
      pagination.itemCount = response.data.count || 0;
      pagination.pages = response.data.pages || 0;
      ElMessage.success('法院列表加载成功');
    } else {
      ElMessage.error(response.error || '获取法院列表失败');
      // 清空列表数据
      courtList.value = [];
      pagination.itemCount = 0;
      pagination.pages = 0;
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 清空列表数据
    courtList.value = [];
    pagination.itemCount = 0;
    pagination.pages = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchCourtList();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchCourtList();
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchCourtList();
};

// 重置搜索
const handleReset = () => {
  searchForm.FYQC = '';
  searchForm.FYJC = '';
  searchForm.FYJB = '';
  pagination.page = 1;
  fetchCourtList();
};

// 刷新
const handleRefresh = () => {
  pagination.page = 1;
  fetchCourtList();
};

// 新增法院弹窗状态
const dialogVisible = ref(false);

// 新增法院表单数据
const addCourtForm = reactive({
  fyqc: '',
  fyjc: '',
  fyjb: '',
  dz: '',
  lxdh: '',
  fzr: '',
  cbfg: '',
});

// 编辑法院弹窗状态
const editDialogVisible = ref(false);

// 编辑法院表单数据
const editCourtForm = reactive({
  SEP_ID: '',
  FYQC: '',
  FYJC: '',
  FYJB: '',
  DZ: '',
  LXDH: '',
  FZR: '',
  CBFG: '',
});

// 表单验证规则
const rules = reactive({
  fyqc: [{ required: true, message: '请输入法院全称', trigger: 'blur' }],
  fyjc: [{ required: true, message: '请输入法院简称', trigger: 'blur' }],
  fyjb: [{ required: true, message: '请输入法院级别', trigger: 'blur' }],
});

// 新增法院
const handleAddCourt = () => {
  dialogVisible.value = true;
};

// 关闭弹窗
const handleCloseDialog = () => {
  dialogVisible.value = false;
  // 重置表单
  Object.assign(addCourtForm, {
    fyqc: '',
    fyjc: '',
    fyjb: '',
    dz: '',
    lxdh: '',
    fzr: '',
    cbfg: '',
  });
};

// 提交新增法院
const submitAddCourt = async () => {
  try {
    const userStore = useUserStore();
    const currentUser = userStore.userInfo;

    // 构建完整的请求数据，自动添加不需要前端展示的参数
    const now = new Date();
    // 调整为北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const requestData = {
      ...addCourtForm,
      sep_auser: currentUser?.username || 'admin', // 当前登录用户
      sep_adate: beijingTime.toISOString(), // 当前创建时间（北京时间）
      scbj: '0', // 默认值为0
    };

    const response = await addCourtApi(requestData);
    if (response.status === '1') {
      ElMessage.success('法院添加成功');
      dialogVisible.value = false;
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.error || '法院添加失败');
    }
  } catch (error) {
    console.error('添加法院失败:', error);
    ElMessage.error('网络错误，请稍后重试');
  }
};

// 编辑法院
const handleEdit = (row: CourtApi.CourtInfo) => {
  // 填充编辑表单数据
  editCourtForm.SEP_ID = row.SEP_ID;
  editCourtForm.FYQC = row.FYQC;
  editCourtForm.FYJC = row.FYJC;
  editCourtForm.FYJB = row.FYJB;
  editCourtForm.DZ = row.DZ;
  editCourtForm.LXDH = row.LXDH;
  editCourtForm.FZR = row.FZR;
  editCourtForm.CBFG = row.CBFG;

  // 打开编辑弹窗
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  editDialogVisible.value = false;
};

// 提交编辑法院
const submitEditCourt = async () => {
  try {
    const userStore = useUserStore();
    const currentUser = userStore.userInfo;

    // 构建完整的请求数据，自动添加不需要前端展示的参数
    const now = new Date();
    // 调整为北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const requestData = {
      ...editCourtForm,
      SEP_EUSER: currentUser?.username || 'admin', // 当前登录用户
      SEP_EDATE: beijingTime.toISOString(), // 当前修改时间（北京时间）
    };

    const response = await updateCourtApi(requestData);
    if (response.status === '1') {
      ElMessage.success('法院修改成功');
      editDialogVisible.value = false;
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.error || '法院修改失败');
    }
  } catch (error) {
    console.error('修改法院失败:', error);
    ElMessage.error('网络错误，请稍后重试');
  }
};

// 删除法院
const handleDelete = async (row: CourtApi.CourtInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该法院吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const response = await deleteCourtApi({ SEP_ID: row.SEP_ID });
    if (response.status === '1') {
      ElMessage.success('法院删除成功');
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.error || '法院删除失败');
    }
  } catch (error) {
    // 如果用户取消删除，不显示错误信息
    if (error !== 'cancel') {
      console.error('删除法院失败:', error);
      ElMessage.error('网络错误，请稍后重试');
    }
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchCourtList();
});
</script>

<template>
  <div class="p-6">
    <ElCard header="法院管理" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">法院管理</span>
          <div class="flex items-center space-x-2">
            <ElButton type="primary" @click="handleAddCourt">
              <i class="i-lucide-plus mr-1"></i>
              新增法院
            </ElButton>
            <ElButton type="primary" @click="handleRefresh">
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
            v-model="searchForm.FYQC"
            placeholder="法院全称"
            clearable
            style="width: 200px"
          />
          <ElInput
            v-model="searchForm.FYJC"
            placeholder="法院简称"
            clearable
            style="width: 200px"
          />
          <ElInput
            v-model="searchForm.FYJB"
            placeholder="法院级别"
            clearable
            style="width: 200px"
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
        :data="courtList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="FYQC"
          label="法院全称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="FYJC"
          label="法院简称"
          width="120"
          align="center"
        />
        <ElTableColumn
          prop="FYJB"
          label="法院级别"
          width="140"
          align="center"
        />
        <ElTableColumn
          prop="DZ"
          label="地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="LXDH"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn prop="FZR" label="负责人" width="100" align="center" />
        <ElTableColumn
          prop="CBFG"
          label="承办法官"
          width="120"
          align="center"
        />
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="handleEdit(row)">
              <i class="i-lucide-edit mr-1"></i>
              编辑
            </ElButton>
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

      <!-- 新增法院弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        title="新增法院"
        width="500px"
        @close="handleCloseDialog"
      >
        <ElForm :model="addCourtForm" label-width="100px" :rules="rules">
          <ElFormItem label="法院全称" prop="fyqc">
            <ElInput v-model="addCourtForm.fyqc" placeholder="请输入法院全称" />
          </ElFormItem>
          <ElFormItem label="法院简称" prop="fyjc">
            <ElInput v-model="addCourtForm.fyjc" placeholder="请输入法院简称" />
          </ElFormItem>
          <ElFormItem label="法院级别" prop="fyjb">
            <ElInput v-model="addCourtForm.fyjb" placeholder="请输入法院级别" />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="addCourtForm.dz" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput v-model="addCourtForm.lxdh" placeholder="请输入联系电话" />
          </ElFormItem>
          <ElFormItem label="负责人">
            <ElInput v-model="addCourtForm.fzr" placeholder="请输入负责人" />
          </ElFormItem>
          <ElFormItem label="承办法官">
            <ElInput v-model="addCourtForm.cbfg" placeholder="请输入承办法官" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="handleCloseDialog">取消</ElButton>
            <ElButton type="primary" @click="submitAddCourt">确定</ElButton>
          </div>
        </template>
      </ElDialog>

      <!-- 编辑法院弹窗 -->
      <ElDialog
        v-model="editDialogVisible"
        title="编辑法院"
        width="500px"
        @close="handleCloseEditDialog"
      >
        <ElForm :model="editCourtForm" label-width="100px" :rules="rules">
          <ElFormItem label="法院全称" prop="FYQC">
            <ElInput
              v-model="editCourtForm.FYQC"
              placeholder="请输入法院全称"
            />
          </ElFormItem>
          <ElFormItem label="法院简称" prop="FYJC">
            <ElInput
              v-model="editCourtForm.FYJC"
              placeholder="请输入法院简称"
            />
          </ElFormItem>
          <ElFormItem label="法院级别" prop="FYJB">
            <ElInput
              v-model="editCourtForm.FYJB"
              placeholder="请输入法院级别"
            />
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="editCourtForm.DZ" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput
              v-model="editCourtForm.LXDH"
              placeholder="请输入联系电话"
            />
          </ElFormItem>
          <ElFormItem label="负责人">
            <ElInput v-model="editCourtForm.FZR" placeholder="请输入负责人" />
          </ElFormItem>
          <ElFormItem label="承办法官">
            <ElInput
              v-model="editCourtForm.CBFG"
              placeholder="请输入承办法官"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="handleCloseEditDialog">取消</ElButton>
            <ElButton type="primary" @click="submitEditCourt">确定</ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
