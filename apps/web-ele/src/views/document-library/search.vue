<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { ref, computed } from 'vue';

import {
  ElButton,
  ElCard,
  ElEmpty,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSelect,
  ElOption,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  searchDocumentsApi,
  downloadDocumentApi,
  addFavoriteApi,
  removeFavoriteApi,
  getDocumentTypeIcon,
  getDocumentTypeColor,
  formatFileSize,
  normalizeDocumentType,
} from '#/api/core/document-library';

const loading = ref(false);
const searchKeyword = ref('');
const documentList = ref<DocumentLibraryApi.Document[]>([]);
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});
const hasSearched = ref(false);

const safeDocumentList = computed(() =>
  Array.isArray(documentList.value) ? documentList.value : [],
);

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  try {
    const response = await searchDocumentsApi(
      searchKeyword.value,
      pagination.value.page,
      pagination.value.size
    );
    if (response) {
      documentList.value = response.documents || [];
      pagination.value.total = response.total || 0;
    } else {
      documentList.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败');
    documentList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  handleSearch();
};

const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.page = 1;
  handleSearch();
};

const downloadDocument = async (doc: DocumentLibraryApi.Document) => {
  try {
    const { blob, filename } = await downloadDocumentApi(doc.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
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

const toggleFavorite = async (doc: DocumentLibraryApi.Document) => {
  try {
    if (doc.isFavorited) {
      await removeFavoriteApi(doc.id);
    } else {
      await addFavoriteApi(doc.id);
    }
    ElMessage.success(doc.isFavorited ? '已取消收藏' : '已添加收藏');
    await handleSearch();
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败');
  }
};

const getDocumentTypeTag = (type: string) => {
  const normalized = normalizeDocumentType(type);
  const typeMap: Record<string, { label: string; type: string }> = {
    WORD: { label: 'Word', type: 'primary' },
    EXCEL: { label: 'Excel', type: 'success' },
    PDF: { label: 'PDF', type: 'danger' },
    OTHER: { label: '其他', type: 'info' },
  };
  return typeMap[normalized] || typeMap.OTHER;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="search-page p-4">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon icon="lucide:search" class="text-2xl text-primary" />
            <span class="text-xl font-semibold">文档搜索</span>
          </div>
        </div>
      </template>

      <div class="mb-4 flex items-center gap-4">
        <ElInput
          v-model="searchKeyword"
          placeholder="输入关键词搜索文档..."
          clearable
          style="max-width: 400px"
          @keyup.enter="handleSearch"
          @clear="hasSearched = false"
        >
          <template #append>
            <ElButton type="primary" @click="handleSearch" :loading="loading">
              <Icon icon="lucide:search" class="mr-1" />
              搜索
            </ElButton>
          </template>
        </ElInput>
      </div>

      <ElTable
        :data="safeDocumentList"
        v-loading="loading"
        stripe
        border
        size="small"
      >
        <template #empty>
          <ElEmpty :description="hasSearched ? '未找到匹配的文档' : '请输入关键词进行搜索'" />
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

        <ElTableColumn prop="fileSize" label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </ElTableColumn>

        <ElTableColumn prop="folderName" label="所属文件夹" width="150" show-overflow-tooltip />

        <ElTableColumn prop="createTime" label="创建时间" width="160">
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
              <ElButton
                :type="row.isFavorited ? 'warning' : 'default'"
                size="small"
                @click="toggleFavorite(row)"
              >
                <Icon :icon="row.isFavorited ? 'lucide:star-off' : 'lucide:star'" class="mr-1" />
                {{ row.isFavorited ? '取消' : '收藏' }}
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <div v-if="hasSearched" class="mt-4 flex justify-end">
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
.search-page {
  min-height: calc(100vh - 100px);
}
</style>
