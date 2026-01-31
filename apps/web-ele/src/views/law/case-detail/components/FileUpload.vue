<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElIcon,
  ElMessage,
  ElProgress,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';

import { Loading } from '@element-plus/icons-vue';

import { fileUploadRequestClient } from '#/api/request';
import type { FileApi } from '#/api/core/file';
import {
  deleteFileApi,
  downloadFileApi,
  getAllFilesByBizApi,
  uploadFileApi,
  previewFileApi,
} from '#/api/core/file';

interface FileItem {
  id: number;
  originalFileName: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  uploadTime: string;
}

const props = defineProps<{
  bizType: string;
  bizId: number;
  modelValue: number[];
  disabled?: boolean;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void;
  (e: 'upload-success', file: FileApi.FileRecord): void;
  (e: 'upload-error', error: any): void;
  (e: 'delete', fileId: number): void;
}>();

const uploading = ref(false);
const uploadProgress = ref(0);
const fileList = ref<FileItem[]>([]);
const uploadLoading = ref(false);

// 预览相关状态
const showPreviewDialog = ref(false);
const previewFile = ref<FileItem | null>(null);
const previewUrl = ref('');
const previewLoading = ref(false);

const maxSize = computed(() => props.maxSize || 50 * 1024 * 1024);

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (file: FileItem): string => {
  const ext = file.fileExtension.toLowerCase();
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text',
    docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
    txt: 'lucide:file',
    zip: 'lucide:archive',
    rar: 'lucide:archive',
  };
  return iconMap[ext] || 'lucide:file';
};

const canPreview = (file: FileItem): boolean => {
  const mimeType = file.mimeType;
  return (
    mimeType?.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType?.startsWith('text/')
  );
};

const loadFiles = async () => {
  if (!props.bizId || !props.bizType) return;

  try {
    const response = await getAllFilesByBizApi(props.bizType, props.bizId);
    if (response.code === 200 && response.data) {
      fileList.value = response.data;
      // 自动预览第一个支持预览的文件
      autoPreviewFirstFile();
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
  }
};

const autoPreviewFirstFile = () => {
  // 找到第一个支持预览的文件
  const previewableFile = fileList.value.find(file => canPreview(file));
  if (previewableFile) {
    handlePreview(previewableFile);
  }
};

const handleFileChange = async (file: any) => {
  const rawFile = file.raw;
  
  if (!rawFile) return;

  if (rawFile.size > maxSize.value) {
    ElMessage.error(`文件大小不能超过 ${formatFileSize(maxSize.value)}`);
    return;
  }

  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim());
    const fileExt = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase();
    const isValid = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase();
      }
      return rawFile.type.includes(type);
    });
    
    if (!isValid) {
      ElMessage.error('不支持的文件类型');
      return;
    }
  }

  uploadLoading.value = true;
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const response = await uploadFileApi(rawFile, props.bizType, props.bizId);
    if (response.code === 200 && response.data) {
      ElMessage.success('文件上传成功');
      await loadFiles();
      // 检查 modelValue 是否存在且是数组
      if (props.modelValue && Array.isArray(props.modelValue)) {
        const newFileIds = [...props.modelValue, response.data.id];
        emit('update:modelValue', newFileIds);
      }
      emit('upload-success', response.data);
    } else {
      ElMessage.error(response.message || '文件上传失败');
      emit('upload-error', response.message);
    }
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ElMessage.error(error.message || '文件上传失败');
    emit('upload-error', error);
  } finally {
    uploading.value = false;
    uploadLoading.value = false;
    uploadProgress.value = 0;
  }
};

const handlePreview = async (file: FileItem) => {
  previewFile.value = file;
  previewLoading.value = true;
  
  try {
    // 获取文件的 blob 数据
    const blob = await fileUploadRequestClient.get<Blob>(
      `/api/v1/file/preview/${file.id}`,
      {
        responseType: 'blob',
      },
    );
    
    // 创建预览 URL
    previewUrl.value = window.URL.createObjectURL(blob);
    showPreviewDialog.value = true;
  } catch (error) {
    console.error('文件预览失败:', error);
    ElMessage.error('文件预览失败');
  } finally {
    previewLoading.value = false;
  }
};

const handleDownload = async (file: FileItem) => {
  try {
    const blob = await downloadFileApi(file.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const handleDelete = async (file: FileItem) => {
  try {
    const response = await deleteFileApi(file.id);
    if (response.code === 200) {
      ElMessage.success('文件删除成功');
      await loadFiles();
      const newFileIds = props.modelValue.filter(id => id !== file.id);
      emit('update:modelValue', newFileIds);
      emit('delete', file.id);
    } else {
      ElMessage.error(response.message || '文件删除失败');
    }
  } catch (error) {
    console.error('文件删除失败:', error);
    ElMessage.error('文件删除失败');
  }
};

const handlePreviewClose = () => {
  // 清理预览状态
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  previewFile.value = null;
  previewLoading.value = false;
};

watch(() => [props.bizId, props.bizType], () => {
  loadFiles();
}, { immediate: true });

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    loadFiles();
  }
}, { immediate: true });
</script>

<template>
  <ElCard shadow="hover" class="file-upload-card">
    <template #header>
      <div class="card-header">
        <div class="flex items-center">
          <Icon icon="lucide:paperclip" class="text-primary mr-2" />
          <span class="font-semibold">{{ title || '文件附件' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <ElTag v-if="fileList.length > 0" type="info" size="small">
            已上传 {{ fileList.length }} 个文件
          </ElTag>
        </div>
      </div>
    </template>

    <div class="upload-section mb-4">
      <ElUpload
        :disabled="disabled || uploading"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        :accept="accept"
        :multiple="multiple"
        drag
      >
        <div class="upload-area">
          <Icon icon="lucide:upload-cloud" class="upload-icon" />
          <div class="upload-text">
            <p class="text-primary font-medium">点击或拖拽文件到此处上传</p>
            <p class="text-sm text-gray-500 mt-1">
              支持格式：{{ accept || '所有文件' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              单个文件大小不超过 {{ formatFileSize(maxSize) }}
            </p>
          </div>
        </div>
      </ElUpload>

      <div v-if="uploading" class="upload-progress mt-4">
        <ElProgress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
        <p class="text-sm text-gray-500 mt-2 text-center">正在上传...</p>
      </div>
    </div>

    <div v-if="fileList.length > 0" class="file-list-section">
      <ElTable :data="fileList" border stripe style="width: 100%">
        <ElTableColumn width="60" align="center">
          <template #default="scope">
            <Icon :icon="getFileIcon(scope.row)" class="file-icon" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="originalFileName" label="文件名" min-width="200" />
        <ElTableColumn prop="fileSize" label="大小" width="100">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="fileExtension" label="类型" width="80" />
        <ElTableColumn prop="uploadTime" label="上传时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.uploadTime).toLocaleString('zh-CN') }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="scope">
            <ElButton
              v-if="canPreview(scope.row)"
              link
              type="primary"
              size="small"
              @click="handlePreview(scope.row)"
            >
              预览
            </ElButton>
            <ElButton
              link
              type="primary"
              size="small"
              @click="handleDownload(scope.row)"
            >
              下载
            </ElButton>
            <ElButton
              v-if="!disabled"
              link
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div v-else-if="!uploading" class="empty-state">
      <ElEmpty description="暂无文件" />
    </div>
  </ElCard>

  <!-- 预览对话框 -->
  <ElDialog
    v-model="showPreviewDialog"
    :title="previewFile?.originalFileName || '文件预览'"
    width="90%"
    height="90vh"
    destroy-on-close
    @close="handlePreviewClose"
  >
    <div class="preview-container">
      <div v-if="previewLoading" class="loading-state">
        <ElIcon class="is-loading"><Loading /></ElIcon>
        <span class="loading-text">加载中...</span>
      </div>
      <div v-else-if="previewUrl" class="preview-content">
        <!-- 图片预览 -->
        <img
          v-if="previewFile?.mimeType?.startsWith('image/')"
          :src="previewUrl"
          class="preview-image"
          alt="预览图片"
        />
        <!-- PDF预览 -->
        <iframe
          v-else-if="previewFile?.mimeType === 'application/pdf'"
          :src="previewUrl"
          class="preview-pdf"
          frameborder="0"
        ></iframe>
        <!-- 其他文件类型 -->
        <div v-else class="preview-other">
          <Icon icon="lucide:file" class="file-icon-large" />
          <p class="text-gray-500">该文件类型不支持在线预览</p>
          <ElButton type="primary" @click="handleDownload(previewFile!)" class="mt-4">
            <Icon icon="lucide:download" class="mr-1" />
            下载文件
          </ElButton>
        </div>
      </div>
      <div v-else class="preview-error">
        <Icon icon="lucide:alert-circle" class="error-icon" />
        <p class="text-danger">文件预览失败</p>
      </div>
    </div>
  </ElDialog>
</template>

<style scoped>
.file-upload-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  background-color: #fafbfc;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.file-list-section {
  margin-top: 20px;
}

/* 预览相关样式 */
.preview-container {
  width: 100%;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #606266;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-pdf {
  width: 100%;
  height: 100%;
}

.preview-other {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.file-icon-large {
  font-size: 64px;
  color: #409eff;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
}

.file-icon {
  font-size: 24px;
  color: #909399;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.upload-progress {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 20px;
  border: none;
  background: transparent;
}

:deep(.el-upload-dragger:hover) {
  border-color: transparent;
}
</style>
