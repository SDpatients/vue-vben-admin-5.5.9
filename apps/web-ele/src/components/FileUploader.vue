<script setup lang="ts">
import type {
  UploadFile,
  UploadRawFile,
} from 'element-plus/es/components/upload';

import { computed, onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import { ElMessage, ElUpload } from 'element-plus';

import {
  deleteFileApi,
  downloadFileApi,
  getFileListApi,
  getFilePreviewUrl,
  uploadFileApi,
} from '#/api/core/file';

interface Props {
  bizId: number;
  bizType: string;
  allowedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  buttonText?: string;
  initialFiles?: Array<{
    fileSize: number;
    id: number;
    mimeType: string;
    originalFileName: string;
    uploadTime: string;
  }>;
}

interface Emits {
  (e: 'upload-success', file: any): void;
  (e: 'upload-error', error: any): void;
  (e: 'file-list-change', files: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  allowedTypes: () => [
    '.doc',
    '.docx',
    '.jpg',
    '.pdf',
    '.png',
    '.xls',
    '.xlsx',
  ],
  maxSize: 10 * 1024 * 1024,
  multiple: false,
  buttonText: '上传文件',
  initialFiles: () => [],
  bizType: 'case',
  bizId: 0,
});

const emit = defineEmits<Emits>();

const fileList = ref<UploadFile[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);

const previewVisible = ref(false);
const previewFileName = ref('');
const previewError = ref('');
const previewBlobUrl = ref('');

const fileType = computed(() => {
  return previewFileName.value.split('.').pop()?.toLowerCase() || '';
});

const isImage = computed(() => {
  return ['gif', 'jpeg', 'jpg', 'png'].includes(fileType.value);
});

const formatFileSize = (size: number | undefined): string => {
  const safeSize = size || 0;
  if (safeSize < 1024) {
    return `${safeSize} B`;
  } else if (safeSize < 1024 * 1024) {
    return `${(safeSize / 1024).toFixed(1)} KB`;
  } else {
    return `${(safeSize / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const allowedTypesDesc = computed(() => {
  return props.allowedTypes?.join(', ') || '所有文件类型';
});

if (props.initialFiles && props.initialFiles.length > 0) {
  fileList.value = props.initialFiles.map((file) => ({
    uid: file.id || Date.now() + Math.random(),
    name: file.originalFileName,
    size: file.fileSize,
    status: 'success' as const,
    response: file,
  }));
}

const fetchFileList = async () => {
  uploading.value = true;
  try {
    const response = await getFileListApi(props.bizType, props.bizId);
    if (response.status === '1') {
      const files = response.data || [];
      fileList.value = files.map((file: any) => ({
        uid: file.id || Date.now() + Math.random(),
        name: file.originalFileName,
        size: file.fileSize,
        status: 'success' as const,
        response: file,
      }));
      emit('file-list-change', fileList.value);
    } else {
      ElMessage.error(`获取文件列表失败：${response.msg || '未知错误'}`);
    }
  } catch (error: any) {
    ElMessage.error(`获取文件列表失败：${error.message || '未知错误'}`);
  } finally {
    uploading.value = false;
  }
};

const beforeUpload = (rawFile: UploadRawFile) => {
  const fileExtension = rawFile.name.slice(
    Math.max(0, rawFile.name.lastIndexOf('.')),
  );
  if (
    props.allowedTypes &&
    !props.allowedTypes.includes(fileExtension.toLowerCase())
  ) {
    ElMessage.error(`只允许上传以下文件类型：${allowedTypesDesc.value}`);
    return false;
  }

  if (rawFile.size > props.maxSize) {
    ElMessage.error(`单个文件大小不能超过${formatFileSize(props.maxSize)}`);
    return false;
  }

  return true;
};

const handleUpload = async (options: any) => {
  uploading.value = true;
  uploadProgress.value = 0;
  const rawFile = options.file;

  try {
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
        options.onProgress?.({ percent: uploadProgress.value });
      }
    }, 200);

    const response = await uploadFileApi(rawFile, props.bizType, props.bizId);

    clearInterval(progressInterval);
    uploadProgress.value = 100;
    options.onProgress?.({ percent: 100 });

    if (response.status === '1') {
      const uploadedFile = {
        uid: Date.now(),
        name: rawFile.name,
        size: rawFile.size,
        status: 'success' as const,
        response: response.data || {},
      };

      fileList.value.push(uploadedFile);
      emit('upload-success', uploadedFile);
      emit('file-list-change', fileList.value);
      options.onSuccess?.(uploadedFile);
      ElMessage.success('文件上传成功');
    } else {
      const error = new Error(response.msg || '文件上传失败');
      options.onError?.(error);
      throw error;
    }
  } catch (error: any) {
    ElMessage.error(`文件上传失败：${error.message || '未知错误'}`);
    emit('upload-error', error);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleUploadChange = (file: UploadFile) => {
  if (file.status === 'ready' && file.raw && props.multiple) {
    handleUpload({ file: file.raw });
  }
};

const handleRemove = async (file: UploadFile) => {
  try {
    const fileId = file.response?.id;

    if (!fileId) {
      ElMessage.error('文件ID不存在');
      return;
    }

    const response = await deleteFileApi(fileId);

    if (response.status === '1') {
      const index = fileList.value.findIndex((item) => item.uid === file.uid);
      if (index !== -1) {
        fileList.value.splice(index, 1);
        emit('file-list-change', fileList.value);
        ElMessage.success('文件已删除');
      }
    } else {
      ElMessage.error(`文件删除失败：${response.msg || '未知错误'}`);
    }
  } catch (error: any) {
    ElMessage.error(`文件删除失败：${error.message || '未知错误'}`);
  }
};

onMounted(() => {
  fetchFileList();
});

const handlePreview = async (file: UploadFile) => {
  const fileId = file.response?.id;
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  if (fileExt === 'pdf' || ['gif', 'jpeg', 'jpg', 'png'].includes(fileExt)) {
    try {
      if (!fileId) {
        ElMessage.error('文件ID不存在');
        return;
      }

      const url = getFilePreviewUrl(fileId);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('文件加载失败');
      }

      const blob = await response.blob();
      previewBlobUrl.value = URL.createObjectURL(blob);
      previewFileName.value = fileName;
      previewError.value = '';
      previewVisible.value = true;
    } catch (error: any) {
      ElMessage.error(`文件预览失败：${error.message || '未知错误'}`);
    }
  } else {
    ElMessage.info('此文件类型不支持在线预览，请下载后查看');
  }
};

const handlePreviewError = () => {
  previewError.value = '文件加载失败，请检查文件是否存在';
};

const handlePreviewClose = () => {
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value);
    previewBlobUrl.value = '';
  }
  previewVisible.value = false;
};

const handleDownload = async (file: UploadFile) => {
  try {
    const fileId = file.response?.id;
    const fileName = file.name;

    if (!fileId) {
      ElMessage.error('文件ID不存在');
      return;
    }

    const blob = await downloadFileApi(fileId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载开始');
  } catch (error: any) {
    ElMessage.error(`文件下载失败：${error.message || '未知错误'}`);
  }
};
</script>

<template>
  <div class="file-uploader-component">
    <ElCard shadow="hover" class="file-uploader-card">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:upload" class="mr-2 text-blue-500" />
            <span class="text-lg font-semibold">文件上传</span>
          </div>
          <div class="text-sm text-gray-500">
            支持类型：{{ allowedTypesDesc }}，单个文件最大{{
              formatFileSize(maxSize)
            }}
          </div>
        </div>
      </template>

      <div class="upload-section">
        <ElUpload
          :file-list="fileList"
          :before-upload="beforeUpload"
          :auto-upload="false"
          :multiple="multiple"
          :on-change="handleUploadChange"
          :on-remove="handleRemove"
          :on-preview="handlePreview"
          :http-request="handleUpload"
          class="upload-demo"
        >
          <ElButton type="primary" :disabled="uploading">
            <Icon icon="lucide:plus" class="mr-1" />
            {{ buttonText }}
          </ElButton>
        </ElUpload>

        <div v-if="uploading" class="upload-progress mt-4">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm text-gray-600">上传进度</span>
            <span class="text-sm font-medium">{{ uploadProgress }}%</span>
          </div>
          <el-progress :percentage="uploadProgress" :stroke-width="2" />
        </div>
      </div>

      <div v-if="fileList.length > 0" class="file-list-section mt-6">
        <h3 class="file-list-title text-md mb-3 font-semibold">
          <Icon icon="lucide:file-check" class="mr-2 text-green-500" />
          已上传文件
        </h3>
        <div class="file-list">
          <div
            v-for="file in fileList"
            :key="file.uid"
            class="file-item mb-2 flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div class="file-info flex items-center">
              <Icon
                :icon="
                  file.name.endsWith('.pdf')
                    ? 'lucide:file-pdf'
                    : file.name.endsWith('.doc') || file.name.endsWith('.docx')
                      ? 'lucide:file-word'
                      : file.name.endsWith('.xls') ||
                          file.name.endsWith('.xlsx')
                        ? 'lucide:file-excel'
                        : file.name.endsWith('.jpg') ||
                            file.name.endsWith('.jpeg') ||
                            file.name.endsWith('.png')
                          ? 'lucide:file-image'
                          : 'lucide:file'
                "
                :class="
                  file.name.endsWith('.pdf')
                    ? 'text-red-500'
                    : file.name.endsWith('.doc') || file.name.endsWith('.docx')
                      ? 'text-blue-500'
                      : file.name.endsWith('.xls') ||
                          file.name.endsWith('.xlsx')
                        ? 'text-green-500'
                        : file.name.endsWith('.jpg') ||
                            file.name.endsWith('.jpeg') ||
                            file.name.endsWith('.png')
                          ? 'text-purple-500'
                          : 'text-gray-500'
                "
                class="mr-3 text-xl"
              />
              <div class="file-details">
                <div class="file-name text-sm font-medium">{{ file.name }}</div>
                <div class="file-meta text-xs text-gray-500">
                  {{ formatFileSize(file.size) }} •
                  {{ new Date().toLocaleString() }}
                </div>
              </div>
            </div>
            <div class="file-actions flex space-x-2">
              <ElButton link size="small" @click="handlePreview(file)">
                <Icon icon="lucide:eye" class="mr-1" />
                查看
              </ElButton>
              <ElButton link size="small" @click="handleDownload(file)">
                <Icon icon="lucide:download" class="mr-1" />
                下载
              </ElButton>
              <ElButton link size="small" @click="handleRemove(file)">
                <Icon icon="lucide:trash-2" class="mr-1 text-red-500" />
                删除
              </ElButton>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!uploading"
        class="no-files mt-8 text-center text-gray-500"
      >
        <Icon icon="lucide:file-x" class="mb-2 text-4xl opacity-50" />
        <p>暂无上传文件</p>
      </div>
    </ElCard>

    <ElDialog
      v-model="previewVisible"
      :title="`预览: ${previewFileName}`"
      width="80%"
      :close-on-click-modal="false"
      @close="handlePreviewClose"
      class="file-preview-dialog"
    >
      <div class="file-viewer">
        <iframe
          v-if="fileType === 'pdf' && previewBlobUrl"
          :src="previewBlobUrl"
          class="preview-iframe"
          @error="handlePreviewError"
        ></iframe>
        <img
          v-else-if="isImage && previewBlobUrl"
          :src="previewBlobUrl"
          :alt="previewFileName"
          class="preview-image"
          @error="handlePreviewError"
        />
        <p v-else class="preview-unsupported">
          该文件类型不支持在线预览，请下载后查看
        </p>
        <p v-if="previewError" class="preview-error">{{ previewError }}</p>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.file-uploader-component {
  width: 100%;
}

.card-header {
  padding: 0;
}

.upload-section {
  padding: 1rem 0;
}

.upload-progress {
  margin-top: 1rem;
}

.file-list-section {
  margin-top: 2rem;
}

.file-list-title {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  transition: all 0.3s ease;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-files {
  padding: 2rem 0;
}

.file-preview-dialog {
  .file-viewer {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-iframe {
    width: 100%;
    height: 70vh;
    border: none;
  }

  .preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }

  .preview-unsupported {
    color: #909399;
    font-size: 14px;
    text-align: center;
  }

  .preview-error {
    color: #f56c6c;
    font-size: 14px;
    text-align: center;
    margin-top: 10px;
  }
}
</style>
