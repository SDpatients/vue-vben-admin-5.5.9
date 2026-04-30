<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { fileUploadRequestClient } from '#/api/request';

const props = defineProps<{
  fileId: number | string;
  fileName: string;
}>();

const imageUrl = ref('');
const loading = ref(true);
const error = ref(false);
const errorDetail = ref('');

const loadImage = async () => {
  const id = typeof props.fileId === 'string' ? Number(props.fileId.replace('mobile-', '')) : props.fileId;
  
  if (!id || isNaN(id)) {
    console.error('[WorkLogImage] 无效的文件ID:', props.fileId);
    error.value = true;
    errorDetail.value = '无效的文件ID';
    loading.value = false;
    return;
  }
  
  try {
    console.log('[WorkLogImage] 开始加载图片, fileId:', id);
    loading.value = true;
    error.value = false;
    errorDetail.value = '';
    
    // 使用 preview 端点（带认证头）
    const url = `/api/v1/file/preview/${id}`;
    console.log('[WorkLogImage] 请求URL:', url);
    
    const blob = await fileUploadRequestClient.get<Blob>(url, {
      responseType: 'blob',
    });
    
    console.log('[WorkLogImage] 获取到blob, type:', blob.type, ', size:', blob.size);
    
    const localUrl = URL.createObjectURL(blob);
    imageUrl.value = localUrl;
    console.log('[WorkLogImage] 图片加载成功, localUrl:', localUrl);
  } catch (err: any) {
    console.error('[WorkLogImage] 加载图片失败:', err);
    error.value = true;
    errorDetail.value = err?.message || err?.response?.data?.message || '加载失败';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadImage();
});

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<template>
  <div class="work-log-image-container">
    <div v-if="loading" class="loading-state">
      <span class="loading-text">图片加载中...</span>
    </div>
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <span class="error-text">图片加载失败</span>
      <span v-if="errorDetail" class="error-detail">{{ errorDetail }}</span>
    </div>
    <img
      v-else
      :src="imageUrl"
      class="work-log-image"
      :alt="fileName"
      @error="console.error('[WorkLogImage] img标签加载blob失败:', imageUrl)"
    />
  </div>
</template>

<style scoped>
.work-log-image-container {
  width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.work-log-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}

.loading-state {
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.error-state {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 24px;
}

.error-text {
  color: #f56c6c;
  font-size: 14px;
}

.error-detail {
  color: #909399;
  font-size: 12px;
  max-width: 100%;
  word-break: break-all;
}
</style>
