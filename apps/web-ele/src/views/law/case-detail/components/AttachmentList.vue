<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElImage,
  ElMessage,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  deleteFileApi,
  downloadFileApi,
  getAllFilesByBizApi,
  uploadFileApi,
} from '#/api/core/file';
import type { FileApi } from '#/api/core/file';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const uploadLoading = ref(false);
const attachments = ref<FileApi.FileRecord[]>([]);

// 图片URL缓存
const imageUrls = ref<Map<number, string>>(new Map());

const fetchAttachments = async () => {
  loading.value = true;
  try {
    const response = await getAllFilesByBizApi('case', Number(props.caseId));
    if (response.code === 200 && response.data) {
      attachments.value = response.data;
      // 为图片文件加载URL
      await loadImageUrls(response.data);
    } else {
      ElMessage.error(`获取附件列表失败：${response.message || '未知错误'}`);
      attachments.value = [];
    }
  } catch (error) {
    console.error('获取附件列表失败:', error);
    ElMessage.error('获取附件列表失败');
    attachments.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载图片URL
const loadImageUrls = async (files: FileApi.FileRecord[]) => {
  const imageFiles = files.filter(file => isImageFile(file.fileExtension));
  for (const file of imageFiles) {
    try {
      const blob = await downloadFileApi(file.id);
      const url = window.URL.createObjectURL(blob);
      imageUrls.value.set(file.id, url);
    } catch (error) {
      console.error(`加载图片 ${file.originalFileName} 失败:`, error);
    }
  }
};

const handleUpload = async (file: File) => {
  uploadLoading.value = true;
  try {
    const response = await uploadFileApi(file, 'case', Number(props.caseId));
    if (response.code === 200) {
      ElMessage.success('上传成功');
      await fetchAttachments();
    } else {
      ElMessage.error(`上传失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploadLoading.value = false;
  }
  return false;
};

const handleDownload = async (fileId: number, fileName: string) => {
  try {
    const blob = await downloadFileApi(fileId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败');
  }
};

const handleDelete = async (fileId: number) => {
  try {
    const response = await deleteFileApi(fileId);
    if (response.code === 200) {
      // 清理图片URL缓存
      if (imageUrls.value.has(fileId)) {
        window.URL.revokeObjectURL(imageUrls.value.get(fileId)!);
        imageUrls.value.delete(fileId);
      }
      ElMessage.success('删除成功');
      await fetchAttachments();
    } else {
      ElMessage.error(`删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getFileIcon = (extension: string): string => {
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text',
    docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    ppt: 'lucide:presentation',
    pptx: 'lucide:presentation',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
    zip: 'lucide:archive',
    rar: 'lucide:archive',
  };
  return iconMap[extension.toLowerCase()] || 'lucide:file';
};

// 判断文件是否为图片类型
const isImageFile = (extension: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  return imageExtensions.includes(extension.toLowerCase());
};

// 获取图片URL
const getImageUrl = (fileId: number): string | undefined => {
  return imageUrls.value.get(fileId);
};

onMounted(() => {
  fetchAttachments();
});

// 组件卸载时清理所有图片URL
onUnmounted(() => {
  imageUrls.value.forEach((url) => {
    window.URL.revokeObjectURL(url);
  });
  imageUrls.value.clear();
});
</script>

<template>
  <ElCard shadow="hover">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <div class="flex items-center">
          <Icon icon="lucide:paperclip" class="text-primary mr-2" />
          <span class="text-lg font-semibold">附件列表</span>
          <ElTag v-if="attachments.length > 0" type="info" class="ml-3" size="small">
            共 {{ attachments.length }} 个文件
          </ElTag>
        </div>
        <div class="flex space-x-2">
          <ElUpload
            :show-file-list="false"
            :before-upload="handleUpload"
            :disabled="uploadLoading"
          >
            <ElButton type="primary" :loading="uploadLoading">
              <Icon icon="lucide:upload" class="mr-1" />
              上传附件
            </ElButton>
          </ElUpload>
        </div>
      </div>
    </template>

    <div v-if="loading" class="loading-container">
      <ElEmpty description="加载中..." />
    </div>
    <ElEmpty v-else-if="attachments.length === 0" description="暂无附件" />
    <ElTable v-else :data="attachments" border style="width: 100%" :row-key="(row) => row.id">
      <ElTableColumn label="文件名" min-width="300">
        <template #default="scope">
          <div class="file-name-container">
            <div v-if="isImageFile(scope.row.fileExtension)" class="image-preview-container">
              <ElImage
                :src="getImageUrl(scope.row.id)"
                :preview-src-list="[getImageUrl(scope.row.id)!]"
                fit="cover"
                class="image-thumbnail"
                :initial-index="0"
                preview-teleported
              >
                <template #error>
                  <div class="image-error">
                    <Icon icon="lucide:image-off" class="text-gray-400" />
                  </div>
                </template>
              </ElImage>
              <div class="file-info">
                <span class="file-name">{{ scope.row.originalFileName }}</span>
              </div>
            </div>
            <div v-else class="file-icon-container">
              <Icon :icon="getFileIcon(scope.row.fileExtension)" class="file-icon text-gray-500" />
              <span class="file-name">{{ scope.row.originalFileName }}</span>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="fileSize" label="文件大小" width="120">
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="uploadTime" label="上传时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.uploadTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
            {{ scope.row.status === 'ACTIVE' ? '有效' : '无效' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="200" fixed="right">
        <template #default="scope">
          <span
            style="color: #409EFF; cursor: pointer; display: inline-flex; align-items: center; margin-right: 12px;"
            @click="handleDownload(scope.row.id, scope.row.originalFileName)"
          >
            <Icon icon="lucide:download" class="mr-1" />
            下载
          </span>
          <ElPopconfirm
            title="确定要删除该附件吗？"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <ElButton type="danger" link size="small">
                <Icon icon="lucide:trash-2" class="mr-1" />
                删除
              </ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<style scoped>
.loading-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-name-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.image-preview-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.image-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s;
}

.image-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-error {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-icon-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
