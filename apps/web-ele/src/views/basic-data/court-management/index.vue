<script lang="ts" setup>
import type { CourtApi } from '#/api/core';

import { onMounted, reactive, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { getCourtListApi } from '#/api/core';

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
      // 使用模拟数据作为后备
      generateMockData();
    }
  } catch {
    ElMessage.error('后端API暂时不可用，请稍后再试');
    // 使用模拟数据作为后备
    generateMockData();
  } finally {
    loading.value = false;
  }
};

// 生成模拟数据
const generateMockData = () => {
  courtList.value = [
    {
      row: 1,
      FYQC: '测试法院1',
      FYJC: '测法1',
      FYJB: '高级人民法院',
      DZ: '浙江省湖州市',
      LXDH: '15177777777',
      FZR: '小刘',
      CBFG: '江法官',
    },
    {
      row: 2,
      FYQC: '测试法院2',
      FYJC: '测法2',
      FYJB: '中级人民法院',
      DZ: '浙江省杭州市',
      LXDH: '15288888888',
      FZR: '小王',
      CBFG: '李法官',
    },
    {
      row: 3,
      FYQC: '测试法院3',
      FYJC: '测法3',
      FYJB: '基层人民法院',
      DZ: '浙江省宁波市',
      LXDH: '15399999999',
      FZR: '小张',
      CBFG: '王法官',
    },
  ];
  pagination.itemCount = 3;
  pagination.pages = 1;
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

// 新增法院
const handleAddCourt = () => {
  ElMessage.info('新增法院功能开发中...');
};

// 编辑法院
const handleEdit = (row: CourtApi.CourtInfo) => {
  ElMessage.info(`编辑法院: ${row.FYQC}`);
};

// 删除法院
const handleDelete = (row: CourtApi.CourtInfo) => {
  ElMessage.warning(`删除法院: ${row.FYQC} (功能开发中...)`);
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
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
