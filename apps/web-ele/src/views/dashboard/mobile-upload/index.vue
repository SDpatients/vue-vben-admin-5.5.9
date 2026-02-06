<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElIcon,
  ElMessage,
  ElTag,
  ElUpload,
} from 'element-plus';
import { UploadFilled, Delete, Refresh } from '@element-plus/icons-vue';

import {
  validateTempUploadToken,
  getTempUploadFiles,
  mobileUploadFile,
  mobileUploadBatch,
  type TempUploadFile,
} from '#/api/core/temp-upload';

const route = useRoute();
const router = useRouter();

// Token相关
const token = ref('');
const tokenValid = ref(false);
const tokenLoading = ref(true);
const tokenError = ref('');

// 文件列表
const fileList = ref<TempUploadFile[]>([]);
const fileLoading = ref(false);

// 上传相关
const uploading = ref(false);
const uploadProgress = ref(0);

// 调试信息
const debugInfo = ref({
  url: '',
  query: '',
  token: '',
  localToken: '',
  apiStatus: '',
});

// 业务信息
const bizInfo = computed(() => {
  if (fileList.value.length > 0) {
    return {
      bizType: fileList.value[0].token,
      fileCount: fileList.value.length,
    };
  }
  return null;
});

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 获取文件图标
const getFileIcon = (file: TempUploadFile): string => {
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

// 验证Token
const validateToken = async () => {
  if (!token.value) {
    tokenError.value = '未提供Token';
    tokenLoading.value = false;
    return;
  }

  try {
    tokenLoading.value = true;
    const response = await validateTempUploadToken(token.value);
    
    if (response.code === 200 && response.data) {
      tokenValid.value = true;
      tokenError.value = '';
      ElMessage.success('Token验证成功');
      await loadFileList();
    } else {
      tokenValid.value = false;
      tokenError.value = 'Token无效或已过期';
      ElMessage.error('Token无效或已过期');
    }
  } catch (error: any) {
    console.error('Token验证失败:', error);
    tokenValid.value = false;
    tokenError.value = error.message || 'Token验证失败';
    ElMessage.error('Token验证失败');
  } finally {
    tokenLoading.value = false;
  }
};

// 加载文件列表
const loadFileList = async () => {
  if (!token.value || !tokenValid.value) return;

  try {
    fileLoading.value = true;
    const response = await getTempUploadFiles(token.value);
    
    if (response.code === 200 && response.data) {
      fileList.value = response.data;
      debugInfo.value.apiStatus = `已加载 ${response.data.length} 个文件`;
    } else {
      ElMessage.error('获取文件列表失败');
    }
  } catch (error: any) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败');
  } finally {
    fileLoading.value = false;
  }
};

// 处理文件选择
const handleFileChange = async (uploadFile: any) => {
  const rawFile = uploadFile.raw;
  if (!rawFile) return;

  if (!tokenValid.value) {
    ElMessage.error('Token无效，无法上传');
    return;
  }

  // 检查文件大小（50MB限制）
  const maxSize = 50 * 1024 * 1024;
  if (rawFile.size > maxSize) {
    ElMessage.error(`文件大小不能超过 ${formatFileSize(maxSize)}`);
    return;
  }

  await uploadFileToServer(rawFile);
};

// 上传文件到服务器
const uploadFileToServer = async (file: File) => {
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const response = await mobileUploadFile(token.value, file);
    
    if (response.code === 200 && response.data) {
      ElMessage.success(`文件 "${file.name}" 上传成功`);
      await loadFileList(); // 刷新文件列表
    } else {
      ElMessage.error(response.message || '文件上传失败');
    }
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ElMessage.error(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// 批量上传文件
const handleFilesChange = async (uploadFiles: any[]) => {
  if (!tokenValid.value) {
    ElMessage.error('Token无效，无法上传');
    return;
  }

  const files = uploadFiles.map(f => f.raw).filter(Boolean);
  if (files.length === 0) return;

  // 检查文件大小
  const maxSize = 50 * 1024 * 1024;
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      ElMessage.warning(`文件 "${file.name}" 超过大小限制，已跳过`);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) return;

  uploading.value = true;
  
  try {
    const response = await mobileUploadBatch(token.value, validFiles);
    
    if (response.code === 200 && response.data) {
      ElMessage.success(`成功上传 ${response.data.length} 个文件`);
      await loadFileList(); // 刷新文件列表
    } else {
      ElMessage.error(response.message || '文件上传失败');
    }
  } catch (error: any) {
    console.error('批量上传失败:', error);
    ElMessage.error(error.message || '批量上传失败');
  } finally {
    uploading.value = false;
  }
};

// 删除文件
const handleDelete = async (file: TempUploadFile) => {
  // 临时上传的文件暂不支持删除，或者可以调用取消Token接口
  ElMessage.info('暂不支持删除已上传的文件');
};

// 刷新文件列表
const handleRefresh = async () => {
  await loadFileList();
  ElMessage.success('刷新成功');
};

// 页面初始化
onMounted(async () => {
  // 收集调试信息
  debugInfo.value.url = window.location.href;
  debugInfo.value.query = JSON.stringify(route.query);
  
  // 从URL参数获取token
  const urlToken = route.query.token as string;
  if (urlToken) {
    token.value = urlToken;
    debugInfo.value.token = urlToken.substring(0, 20) + '...';
  }
  
  // 验证token
  await validateToken();
});
</script>

<template>
  <div class="mobile-upload-page">
    <div class="page-header">
      <h1 class="page-title">手机文件上传</h1>
      <p class="page-subtitle">请上传您需要提交的文件</p>
    </div>

    <!-- Token验证中 -->
    <div v-if="tokenLoading" class="loading-container">
      <ElIcon class="is-loading loading-icon"><Refresh /></ElIcon>
      <p>正在验证上传凭证...</p>
    </div>

    <!-- Token验证失败 -->
    <div v-else-if="!tokenValid" class="error-container">
      <Icon icon="lucide:alert-circle" class="error-icon" />
      <h3>上传凭证无效</h3>
      <p>{{ tokenError || 'Token无效或已过期，请重新扫描二维码' }}</p>
      <ElButton type="primary" @click="validateToken">
        <Icon icon="lucide:refresh-cw" class="mr-1" />
        重新验证
      </ElButton>
    </div>

    <!-- 上传界面 -->
    <template v-else>
      <!-- 业务信息卡片 -->
      <ElCard class="biz-info-card" shadow="never">
        <div class="biz-info">
          <div class="biz-info-item">
            <span class="label">上传凭证：</span>
            <ElTag type="success" size="small">有效</ElTag>
          </div>
          <div class="biz-info-item">
            <span class="label">已上传文件：</span>
            <span class="value">{{ fileList.length }} 个</span>
          </div>
        </div>
      </ElCard>

      <!-- 文件上传区域 -->
      <ElCard class="upload-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>选择文件上传</span>
            <ElButton 
              type="primary" 
              link 
              size="small"
              @click="handleRefresh"
              :loading="fileLoading"
            >
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新列表
            </ElButton>
          </div>
        </template>

        <ElUpload
          drag
          multiple
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :disabled="uploading"
          accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt,.zip,.rar"
        >
          <ElIcon class="upload-icon"><UploadFilled /></ElIcon>
          <div class="upload-text">
            <p class="main-text">点击或拖拽文件到此处上传</p>
            <p class="sub-text">
              支持 doc、docx、pdf、jpg、png、xls、xlsx 等格式<br>
              单个文件不超过 50MB
            </p>
          </div>
        </ElUpload>

        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <ElIcon class="is-loading"><Refresh /></ElIcon>
          <span>正在上传...</span>
        </div>
      </ElCard>

      <!-- 已上传文件列表 -->
      <ElCard class="file-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>已上传文件列表</span>
            <ElTag v-if="fileList.length > 0" type="info" size="small">
              {{ fileList.length }} 个文件
            </ElTag>
          </div>
        </template>

        <div v-if="fileLoading" class="loading-state">
          <ElIcon class="is-loading"><Refresh /></ElIcon>
          <span>加载中...</span>
        </div>

        <div v-else-if="fileList.length === 0" class="empty-state">
          <ElEmpty description="暂无上传的文件" />
        </div>

        <div v-else class="file-list">
          <div 
            v-for="file in fileList" 
            :key="file.id" 
            class="file-item"
          >
            <div class="file-info">
              <Icon :icon="getFileIcon(file)" class="file-icon" />
              <div class="file-details">
                <span class="file-name">{{ file.originalFileName }}</span>
                <span class="file-meta">
                  {{ formatFileSize(file.fileSize) }} · 
                  {{ new Date(file.uploadTime).toLocaleString('zh-CN') }}
                </span>
              </div>
            </div>
            <div class="file-actions">
              <ElTag v-if="file.description" type="info" size="small">
                {{ file.description }}
              </ElTag>
            </div>
          </div>
        </div>
      </ElCard>

      <!-- 操作提示 -->
      <div class="tips-section">
        <h4>上传说明</h4>
        <ul>
          <li>请确保上传的文件内容真实有效</li>
          <li>文件上传后将自动同步到电脑端</li>
          <li>上传完成后可以在电脑端查看和管理文件</li>
        </ul>
      </div>
    </template>

    <!-- 调试信息（仅开发环境显示） -->
    <div v-if="false" class="debug-section">
      <h4>调试信息</h4>
      <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.mobile-upload-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-container h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 8px;
}

.error-container p {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
}

/* 业务信息卡片 */
.biz-info-card {
  margin-bottom: 16px;
}

.biz-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.biz-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.biz-info-item .label {
  font-size: 14px;
  color: #606266;
}

.biz-info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 上传卡片 */
.upload-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

:deep(.el-upload-dragger) {
  width: 100%;
  padding: 40px 20px;
  background: #fafbfc;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-text .main-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px;
}

.upload-text .sub-text {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.6;
}

.upload-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
}

/* 文件列表卡片 */
.file-list-card {
  margin-bottom: 16px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #909399;
}

.empty-state {
  padding: 40px 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 提示区域 */
.tips-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.tips-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

/* 调试区域 */
.debug-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 20px;
}

.debug-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.debug-section pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  overflow-x: auto;
  margin: 0;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .mobile-upload-page {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .biz-info {
    flex-direction: column;
    gap: 12px;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
