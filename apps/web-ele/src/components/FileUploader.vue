<script setup lang="ts">
import type {
  UploadFile,
  UploadRawFile,
} from 'element-plus/es/components/upload';

import { computed, onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import { ElMessage, ElUpload } from 'element-plus';

import {
  deleteCaseFileApi,
  getCaseFilesApi,
  uploadCaseFileApi,
} from '#/api/core/case';

// 定义组件的Props
interface Props {
  // 案件ID，用于关联上传的文件
  caseId: string;
  // 允许的文件类型，默认支持常见文档格式
  allowedTypes?: string[];
  // 单个文件大小限制，默认10MB
  maxSize?: number;
  // 是否允许多文件上传
  multiple?: boolean;
  // 上传按钮文本
  buttonText?: string;
  // 已上传文件列表
  initialFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    uploadTime: string;
    url: string;
  }>;
}

// 定义组件的Events
interface Emits {
  // 上传成功事件
  (e: 'upload-success', file: any): void;
  // 上传失败事件
  (e: 'upload-error', error: any): void;
  // 文件列表变化事件
  (e: 'file-list-change', files: any[]): void;
}

// 组件属性
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
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: false,
  buttonText: '上传文件',
  initialFiles: () => [],
});

// 组件事件
const emit = defineEmits<Emits>();

// 响应式数据
const fileList = ref<UploadFile[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);

const previewVisible = ref(false);
const previewFileName = ref('');
const previewError = ref('');
const previewBlobUrl = ref('');

const previewUrl = computed(() => {
  const token =
    localStorage.getItem('token') || '17fce65ebabe3088ab45b97f77f91b5a';
  const encodedFileName = encodeURIComponent(previewFileName.value);
  return `http://192.168.0.120:8080/api/web/viewCaseFile/${encodedFileName}?token=${token}`;
});

const fileType = computed(() => {
  return previewFileName.value.split('.').pop()?.toLowerCase() || '';
});

const isImage = computed(() => {
  return ['gif', 'jpeg', 'jpg', 'png'].includes(fileType.value);
});

// 计算属性：转换文件大小为可读格式
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

// 计算属性：获取允许的文件类型描述
const allowedTypesDesc = computed(() => {
  return props.allowedTypes?.join(', ') || '所有文件类型';
});

// 认证令牌，实际项目中应该从登录状态或配置中获取
const token = '17fce65ebabe3088ab45b97f77f91b5a';

// 初始化文件列表
if (props.initialFiles && props.initialFiles.length > 0) {
  fileList.value = props.initialFiles.map((file) => ({
    uid: Number(file.id) || Date.now() + Math.random(),
    name: file.name,
    url: file.url,
    size: file.size,
    status: 'success' as const,
    response: file,
  }));
}

// 获取案件文件列表
const fetchFileList = async () => {
  uploading.value = true;
  try {
    const response = await getCaseFilesApi(props.caseId);
    if (response.status === '1') {
      const files = response.data?.records || [];
      fileList.value = files.map((file: any) => ({
        uid: Number(file.id) || Date.now() + Math.random(),
        name: file.name,
        url: file.url,
        size: file.size,
        status: 'success' as const,
        response: file,
      }));
      emit('file-list-change', fileList.value);
    } else {
      ElMessage.error(`获取文件列表失败：${response.error || '未知错误'}`);
    }
  } catch (error: any) {
    ElMessage.error(`获取文件列表失败：${error.message || '未知错误'}`);
  } finally {
    uploading.value = false;
  }
};

// 文件上传前的验证
const beforeUpload = (rawFile: UploadRawFile) => {
  // 验证文件类型
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

  // 验证文件大小
  if (rawFile.size > props.maxSize) {
    ElMessage.error(`单个文件大小不能超过${formatFileSize(props.maxSize)}`);
    return false;
  }

  return true;
};

// 处理文件上传（针对ElUpload组件的http-request）
const handleUpload = async (options: any) => {
  uploading.value = true;
  uploadProgress.value = 0;
  const rawFile = options.file;

  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
        options.onProgress?.({ percent: uploadProgress.value });
      }
    }, 200);

    // 调用上传API
    const response = await uploadCaseFileApi(rawFile, props.caseId);

    // 清除进度模拟
    clearInterval(progressInterval);
    uploadProgress.value = 100;
    options.onProgress?.({ percent: 100 });

    if (response.status === '1') {
      // 上传成功
      const uploadedFile = {
        uid: Date.now(),
        name: rawFile.name,
        url: response.data?.url || response.data?.fileUrl || '',
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
      // 上传失败
      const error = new Error(response.error || '文件上传失败');
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

// 处理文件上传变化
const handleUploadChange = (file: UploadFile) => {
  if (
    file.status === 'ready' &&
    file.raw && // 如果是多文件上传，直接上传
    props.multiple
  ) {
    handleUpload({ file: file.raw });
  }
};

// 删除文件
const handleRemove = async (file: UploadFile) => {
  try {
    const fileName = file.name;

    const response = await deleteCaseFileApi(fileName);

    if (response.status === '1') {
      const index = fileList.value.findIndex((item) => item.uid === file.uid);
      if (index !== -1) {
        fileList.value.splice(index, 1);
        emit('file-list-change', fileList.value);
        ElMessage.success('文件已删除');
      }
    } else {
      ElMessage.error(`文件删除失败：${response.error || '未知错误'}`);
    }
  } catch (error: any) {
    ElMessage.error(`文件删除失败：${error.message || '未知错误'}`);
  }
};

// 组件挂载时获取文件列表
onMounted(() => {
  fetchFileList();
});

// 查看文件
const handlePreview = async (file: UploadFile) => {
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  if (fileExt === 'pdf' || ['gif', 'jpeg', 'jpg', 'png'].includes(fileExt)) {
    try {
      const token =
        localStorage.getItem('token') || '17fce65ebabe3088ab45b97f77f91b5a';
      const encodedFileName = encodeURIComponent(fileName);
      const url = `http://192.168.0.120:8080/api/web/viewCaseFile/${encodedFileName}?token=${token}`;

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

// 下载文件
const handleDownload = (file: UploadFile) => {
  try {
    const fileName = file.name;
    const token =
      localStorage.getItem('token') || '17fce65ebabe3088ab45b97f77f91b5a';
    const encodedFileName = encodeURIComponent(fileName);
    const downloadUrl = `http://192.168.0.120:8080/api/web/downloadCaseFile/${encodedFileName}?token=${token}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
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

        <!-- 上传进度条 -->
        <div v-if="uploading" class="upload-progress mt-4">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm text-gray-600">上传进度</span>
            <span class="text-sm font-medium">{{ uploadProgress }}%</span>
          </div>
          <el-progress :percentage="uploadProgress" :stroke-width="2" />
        </div>
      </div>

      <!-- 已上传文件列表 -->
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

      <!-- 无文件提示 -->
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
