<script lang="ts" setup>
import type { CourtApi } from '#/api/core';
import type { ExportColumnConfig } from '#/utils/export-excel';

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

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
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import {
  addCourtApi,
  deleteCourtApi,
  getCourtListApi,
  updateCourtApi,
} from '#/api/core';
import { exportToExcel } from '#/utils/export-excel';

const userStore = useUserStore();

// 组件挂载状态标志，用于防止组件卸载后更新状态
let isMounted = false;

// 法院列表数据
const courtList = ref<CourtApi.CourtInfo[]>([]);

// 确保表格数据始终为数组
const safeCourtList = computed(() =>
  Array.isArray(courtList.value) ? courtList.value : [],
);

// 加载状态
const loading = ref(false);

// 法院级别选项
const courtLevelOptions = [
  { label: '中级人民法院', value: '中级人民法院' },
  { label: '高级人民法院', value: '高级人民法院' },
  { label: 'deserunt adipisicing', value: 'deserunt adipisicing' },
  { label: '省级人民法院', value: '省级人民法院' },
  { label: '县级人民法院', value: '县级人民法院' },
  { label: '市级人民法院', value: '市级人民法院' },
];

// 搜索表单
const searchForm = reactive({
  shortName: '',
  courtLevel: '',
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
    // 构建查询参数，只包含有值的字段
    const params: CourtApi.CourtQueryParams = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
    };

    // 只在有值时添加shortName参数
    if (searchForm.shortName) {
      params.shortName = searchForm.shortName;
    }

    // 只在有值时添加courtLevel参数
    if (searchForm.courtLevel) {
      params.courtLevel = searchForm.courtLevel;
    }

    const response = await getCourtListApi(params);

    // 检查组件是否仍挂载，避免卸载后更新状态
    if (!isMounted) return;

    if (response.code === 200 && response.data) {
      // 从response.data.list中获取数据
      const records = response.data.list || [];
      // 处理数据，映射新字段名到组件使用的字段名
      const processedData = records.map((item: any) => {
        return {
          sep_id: String(item.id), // 兼容旧的sep_id字段
          fyqc: item.fullName, // 法院全称
          fyjc: item.shortName, // 法院简称
          fyjb: item.courtLevel, // 法院级别
          dz: item.address || '', // 获取新接口的address字段作为地址
          lxdh: item.contactPhone, // 联系电话
          fzr: '', // 新接口未提供负责人字段，使用responsibleUserId替代
          cbfg: item.undertakingJudge, // 承办法官
          // 新字段
          id: item.id,
          fullName: item.fullName,
          shortName: item.shortName,
          courtLevel: item.courtLevel,
          contactPhone: item.contactPhone,
          address: item.address, // 保存新接口的address字段
          undertakingJudge: item.undertakingJudge,
          responsibleUserId: item.responsibleUserId,
          createTime: item.createTime,
          updateTime: item.updateTime,
        };
      });
      courtList.value = processedData;
      // 使用API返回的分页信息
      pagination.itemCount = response.data.total || 0;
      pagination.pages =
        Math.ceil(response.data.total / pagination.pageSize) || 1;
      ElMessage.success('法院列表加载成功');
    } else {
      ElMessage.error(response.message || '获取法院列表失败');
      // 清空列表数据
      courtList.value = [];
      pagination.itemCount = 0;
      pagination.pages = 0;
    }
  } catch (error) {
    // 检查组件是否仍挂载，避免卸载后更新状态
    if (!isMounted) return;

    console.error('获取法院列表失败:', error);
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 清空列表数据
    courtList.value = [];
    pagination.itemCount = 0;
    pagination.pages = 0;
  } finally {
    // 检查组件是否仍挂载，避免卸载后更新状态
    if (isMounted) {
      loading.value = false;
    }
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
  searchForm.shortName = '';
  searchForm.courtLevel = '';
  pagination.page = 1;
  fetchCourtList();
};

// 刷新
const handleRefresh = () => {
  pagination.page = 1;
  fetchCourtList();
};

// 导出法院数据为Excel
const exportCourtData = () => {
  if (safeCourtList.value.length === 0) {
    ElMessage.warning('当前没有数据可导出');
    return;
  }

  const exportColumns: ExportColumnConfig[] = [
    { field: 'fyqc', title: '法院全称', width: 18 },
    { field: 'fyjc', title: '法院简称', width: 12 },
    { field: 'fyjb', title: '法院级别', width: 14 },
    { field: 'dz', title: '地址', width: 20 },
    { field: 'lxdh', title: '联系电话', width: 12 },
    { field: 'cbfg', title: '承办法官', width: 12 },
  ];

  try {
    exportToExcel({
      data: safeCourtList.value,
      fileName: '法院管理数据',
      sheetName: '法院',
      columns: exportColumns,
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('数据导出失败，请重试');
  }
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
  CBFG: '',
});

// 表单验证规则 - 用于新增表单
const addRules = reactive({
  fyqc: [{ required: true, message: '请输入法院全称', trigger: 'blur' }],
  fyjc: [{ required: true, message: '请输入法院简称', trigger: 'blur' }],
  fyjb: [
    { required: true, message: '请选择法院级别', trigger: ['blur', 'change'] },
  ],
});

// 表单验证规则 - 用于编辑表单
const editRules = reactive({
  FYQC: [{ required: true, message: '请输入法院全称', trigger: 'blur' }],
  FYJC: [{ required: true, message: '请输入法院简称', trigger: 'blur' }],
  FYJB: [
    { required: true, message: '请选择法院级别', trigger: ['blur', 'change'] },
  ],
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
    cbfg: '',
  });
};

// 提交新增法院
const submitAddCourt = async () => {
  try {
    // 构建请求数据，只包含新API需要的字段
    const requestData = {
      fullName: addCourtForm.fyqc, // 法院全称
      shortName: addCourtForm.fyjc, // 法院简称
      courtLevel: addCourtForm.fyjb, // 法院级别
      address: addCourtForm.dz, // 地址
      contactPhone: addCourtForm.lxdh, // 联系电话
      undertakingJudge: addCourtForm.cbfg, // 承办法官
      // responsibleUserId 暂不提供，因为当前组件中没有该字段
    };

    const response = await addCourtApi(requestData);

    // 检查组件是否仍挂载
    if (!isMounted) return;

    if (response.code === 200) {
      ElMessage.success('法院添加成功');
      dialogVisible.value = false;
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.message || '法院添加失败');
    }
  } catch (error: any) {
    // 检查组件是否仍挂载
    if (!isMounted) return;

    console.error('添加法院失败:', error);
    // 处理错误响应
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('网络错误，请稍后重试');
    }
  }
};

// 编辑法院
const handleEdit = (row: CourtApi.CourtInfo) => {
  // 填充编辑表单数据
  editCourtForm.SEP_ID = row.sep_id; // 使用小写字段名
  editCourtForm.FYQC = row.fyqc; // 使用小写字段名
  editCourtForm.FYJC = row.fyjc; // 使用小写字段名
  editCourtForm.FYJB = row.fyjb; // 使用小写字段名
  editCourtForm.DZ = row.dz; // 使用小写字段名
  editCourtForm.LXDH = row.lxdh; // 使用小写字段名
  editCourtForm.CBFG = row.cbfg; // 使用小写字段名

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
    // 构建请求数据，包含所有需要的字段
    const requestData = {
      fullName: editCourtForm.FYQC, // 法院全称
      shortName: editCourtForm.FYJC, // 法院简称
      courtLevel: editCourtForm.FYJB, // 法院级别
      address: editCourtForm.DZ, // 地址
      contactPhone: editCourtForm.LXDH, // 联系电话
      undertakingJudge: editCourtForm.CBFG, // 承办法官
    };

    // 获取法院ID，从编辑表单中获取
    const courtId = editCourtForm.SEP_ID;

    const response = await updateCourtApi(courtId, requestData);

    // 检查组件是否仍挂载
    if (!isMounted) return;

    if (response.code === 200) {
      ElMessage.success('法院修改成功');
      editDialogVisible.value = false;
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.message || '法院修改失败');
    }
  } catch (error: any) {
    // 检查组件是否仍挂载
    if (!isMounted) return;

    console.error('修改法院失败:', error);
    // 处理错误响应
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('网络错误，请稍后重试');
    }
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

    // 获取法院ID，优先使用row.id，兼容旧的sep_id
    const courtId = row.id || row.sep_id;

    const response = await deleteCourtApi(courtId);

    // 检查组件是否仍挂载
    if (!isMounted) return;

    if (response.code === 200) {
      ElMessage.success('法院删除成功');
      // 刷新列表
      fetchCourtList();
    } else {
      ElMessage.error(response.message || '法院删除失败');
    }
  } catch (error: any) {
    // 如果用户取消删除，不显示错误信息
    if (error !== 'cancel') {
      // 检查组件是否仍挂载
      if (!isMounted) return;

      console.error('删除法院失败:', error);
      // 处理错误响应
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message);
      } else {
        ElMessage.error('网络错误，请稍后重试');
      }
    }
  }
};

// 页面加载时获取数据
onMounted(() => {
  isMounted = true;
  fetchCourtList();
});

// 页面卸载时清理
onUnmounted(() => {
  isMounted = false;
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
            <ElButton type="success" @click="exportCourtData">
              <i class="i-lucide-download mr-1"></i>
              导出数据
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
            v-model="searchForm.shortName"
            placeholder="法院简称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <ElSelect
            v-model="searchForm.courtLevel"
            placeholder="法院级别"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <ElOption
              v-for="option in courtLevelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
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
        :data="safeCourtList"
        :border="true"
        :stripe="true"
        :style="{ width: '100%' }"
      >
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        <ElTableColumn
          prop="fyqc"
          label="法院全称"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="fyjc"
          label="法院简称"
          width="120"
          align="center"
        />
        <ElTableColumn
          prop="fyjb"
          label="法院级别"
          width="140"
          align="center"
        />
        <ElTableColumn
          prop="dz"
          label="地址"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="lxdh"
          label="联系电话"
          width="130"
          align="center"
        />
        <ElTableColumn
          prop="cbfg"
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
        <ElForm :model="addCourtForm" label-width="100px" :rules="addRules">
          <ElFormItem label="法院全称" prop="fyqc">
            <ElInput v-model="addCourtForm.fyqc" placeholder="请输入法院全称" />
          </ElFormItem>
          <ElFormItem label="法院简称" prop="fyjc">
            <ElInput v-model="addCourtForm.fyjc" placeholder="请输入法院简称" />
          </ElFormItem>
          <ElFormItem label="法院级别" prop="fyjb">
            <ElSelect
              v-model="addCourtForm.fyjb"
              placeholder="请选择法院级别"
              clearable
            >
              <ElOption
                v-for="option in courtLevelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="地址">
            <ElInput v-model="addCourtForm.dz" placeholder="请输入地址" />
          </ElFormItem>
          <ElFormItem label="联系电话">
            <ElInput v-model="addCourtForm.lxdh" placeholder="请输入联系电话" />
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
        <ElForm :model="editCourtForm" label-width="100px" :rules="editRules">
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
            <ElSelect
              v-model="editCourtForm.FYJB"
              placeholder="请选择法院级别"
              clearable
            >
              <ElOption
                v-for="option in courtLevelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
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
