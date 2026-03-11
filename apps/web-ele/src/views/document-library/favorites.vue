<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { onMounted, ref, computed } from 'vue';

import {
  ElButton,
  ElCard,
  ElEmpty,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getFavoritesApi,
  removeFavoriteApi,
  downloadDocumentApi,
  getDocumentTypeIcon,
  getDocumentTypeColor,
  formatFileSize,
} from '#/api/core/document-library';

const loading = ref(false);
const favorites = ref<DocumentLibraryApi.FavoriteItem[]>([]);
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

const safeFavorites = computed(() =>
  Array.isArray(favorites.value) ? favorites.value : [],
);

const fetchFavorites = async () => {
  loading.value = true;
  try {
    const response = await getFavoritesApi(pagination.value.page, pagination.value.size);
    if (response) {
      favorites.value = response.favorites || [];
      pagination.value.total = response.total || 0;
    } else {
      favorites.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    ElMessage.error('获取收藏列表失败');
    favorites.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchFavorites();
};

const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.page = 1;
  fetchFavorites();
};

const removeFavorite = async (item: DocumentLibraryApi.FavoriteItem) => {
  try {
    await removeFavoriteApi(item.documentId);
    ElMessage.success('已取消收藏');
    await fetchFavorites();
  } catch (error) {
    console.error('取消收藏失败:', error);
    ElMessage.error('操作失败');
  }
};

const downloadDocument = async (item: DocumentLibraryApi.FavoriteItem) => {
  try {
    const blob = await downloadDocumentApi(item.documentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败');
  }
};

const getDocumentTypeTag = (type: string) => {
  const typeMap: Record<string, { label: string; type: string }> = {
    WORD: { label: 'Word', type: 'primary' },
    EXCEL: { label: 'Excel', type: 'success' },
    PDF: { label: 'PDF', type: 'danger' },
    OTHER: { label: '其他', type: 'info' },
  };
  return typeMap[type] || typeMap.OTHER;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchFavorites();
});
</script>

<template>
  <div class="favorites-page p-4">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon icon="lucide:star" class="text-2xl text-yellow-500" />
            <span class="text-xl font-semibold">我的收藏</span>
          </div>
          <ElButton @click="fetchFavorites" :loading="loading">
            <Icon icon="lucide:refresh-cw" class="mr-1" />
            刷新
          </ElButton>
        </div>
      </template>

      <ElTable :data="safeFavorites" v-loading="loading" stripe border size="small">
        <template #empty>
          <ElEmpty description="暂无收藏文档" />
        </template>

        <ElTableColumn prop="documentName" label="文档名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <Icon
                :icon="getDocumentTypeIcon(row.documentType)"
                class="text-xl"
                :style="{ color: getDocumentTypeColor(row.documentType) }"
              />
              <span>{{ row.documentName }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="documentType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getDocumentTypeTag(row.documentType).type" size="small">
              {{ getDocumentTypeTag(row.documentType).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="folderName" label="所属文件夹" width="150" show-overflow-tooltip />

        <ElTableColumn prop="createTime" label="收藏时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <ElButton type="primary" size="small" @click="downloadDocument(row)">
                <Icon icon="lucide:download" class="mr-1" />
                下载
              </ElButton>
              <ElButton type="danger" size="small" @click="removeFavorite(row)">
                <Icon icon="lucide:star-off" class="mr-1" />
                取消收藏
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: calc(100vh - 100px);
}
</style>
