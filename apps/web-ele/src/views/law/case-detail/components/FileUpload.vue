<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';

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
import QrcodeVue from 'qrcode.vue';

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

interface LocalFileItem {
  file: File;
  id: string;
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
  localMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void;
  (e: 'upload-success', file: FileApi.FileRecord): void;
  (e: 'upload-error', error: any): void;
  (e: 'delete', fileId: number): void;
  (e: 'local-files-change', files: LocalFileItem[]): void;
}>();

const uploading = ref(false);
const uploadProgress = ref(0);
const fileList = ref<FileItem[]>([]);
const uploadLoading = ref(false);

const localFiles = ref<LocalFileItem[]>([]);

const previewFile = ref<FileItem | LocalFileItem | null>(null);
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewLoading = ref(false);

// 手机上传相关
const showQrCodeDialog = ref(false);
const qrCodeUrl = ref('');
const qrCodeExpireTime = ref(0);
const qrCodePolling = ref<NodeJS.Timeout | null>(null);

// 移动端上传配置
const mobileUploadConfig = ref({
  ip: '',
  port: 5779,
  autoDetect: true,
});

// 检测移动端和微信浏览器
const isWeChatBrowser = ref(false);

const isLocalMode = computed(() => props.localMode);

const maxSize = computed(() => props.maxSize || 50 * 1024 * 1024);

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (file: FileItem | LocalFileItem): string => {
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

const canPreview = (file: FileItem | LocalFileItem): boolean => {
  const mimeType = file.mimeType;
  return (
    mimeType?.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType?.startsWith('text/')
  );
};

const loadFiles = async () => {
  if (isLocalMode.value) return;
  if (!props.bizId || !props.bizType) return;

  try {
    const response = await getAllFilesByBizApi(props.bizType, props.bizId);
    if (response.code === 200 && response.data) {
      fileList.value = response.data;
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
  }
};

// 从环境变量获取配置的IP地址
const getConfiguredIP = (): string | null => {
  // 尝试从环境变量获取IP配置
  // Vite环境变量需要以VITE_开头
  const envIP = import.meta.env.VITE_MOBILE_UPLOAD_IP;
  if (envIP && envIP !== 'localhost' && envIP !== '127.0.0.1') {
    console.log('[IP检测] 使用环境变量配置的IP:', envIP);
    return envIP;
  }
  return null;
};

// 检测本机局域网IP地址
const detectLocalIP = async (): Promise<string> => {
  try {
    console.log('[IP检测] 开始检测本机IP地址...');
    console.log('[IP检测] 当前主机名:', window.location.hostname);
    console.log('[IP检测] 当前页面URL:', window.location.href);

    // 方法0: 优先使用环境变量配置的IP
    const configuredIP = getConfiguredIP();
    if (configuredIP) {
      console.log('[IP检测] ✓ 使用环境变量配置的IP:', configuredIP);
      mobileUploadConfig.value.ip = configuredIP;
      return configuredIP;
    }

    // 方法1: 检查当前主机名是否已经是有效IP
    const hostname = window.location.hostname;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname) && !hostname.startsWith('127.')) {
      console.log('[IP检测] ✓ 当前主机名是有效IP地址:', hostname);
      mobileUploadConfig.value.ip = hostname;
      return hostname;
    }

    // 方法2: 通过WebRTC获取本地IP
    console.log('[IP检测] 尝试通过WebRTC获取IP...');
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    const offer = await rtc.createOffer();
    await rtc.setLocalDescription(offer);

    let foundIP = false;

    return new Promise<string>((resolve) => {
      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          console.log('[IP检测] 收到ICE候选:', candidate);

          // 尝试匹配IPv4地址（排除mDNS地址如xxx.local）
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);

          if (ipMatch && ipMatch[1]) {
            const ip = ipMatch[1];
            console.log('[IP检测] 提取到IP:', ip);

            // 排除回环地址和私有地址范围检查
            if (!ip.startsWith('127.') && !ip.startsWith('0.')) {
              console.log('[IP检测] ✓ 通过WebRTC获取到有效IP地址:', ip);
              mobileUploadConfig.value.ip = ip;
              foundIP = true;
              resolve(ip);
              rtc.close();
              return;
            }
          }
        } else {
          console.log('[IP检测] ICE候选收集完成');
          
          // 如果收集完成但未找到IP，使用后备方法
          if (!foundIP) {
            resolve(useFallbackIP());
            rtc.close();
          }
        }
      };

      // 超时处理
      setTimeout(() => {
        if (!foundIP) {
          console.log('[IP检测] WebRTC超时，使用后备方法');
          rtc.close();
          resolve(useFallbackIP());
        }
      }, 2000);
    });
  } catch (error) {
    console.error('[IP检测] 检测IP过程出错:', error);
    return useFallbackIP();
  }
};

// 后备IP获取方法
const useFallbackIP = (): string => {
  // 优先使用当前主机名（如果不是localhost）
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('[IP检测] ✓ 使用当前主机名作为IP:', hostname);
    mobileUploadConfig.value.ip = hostname;
    return hostname;
  }

  // 最后使用默认IP地址
  const defaultIP = '192.168.0.120';
  console.log('[IP检测] ✗ 无法检测IP，使用默认IP:', defaultIP);
  console.log('[IP检测] 提示: 可以通过设置环境变量 VITE_MOBILE_UPLOAD_IP 来指定IP地址');
  mobileUploadConfig.value.ip = defaultIP;
  return defaultIP;
};

// 打开手机上传二维码弹窗
const openMobileUploadDialog = async () => {
  // 自动检测本地IP地址
  if (mobileUploadConfig.value.autoDetect && !mobileUploadConfig.value.ip) {
    await detectLocalIP();
  }

  // 生成随机的上传会话ID
  const uploadSessionId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // 生成二维码URL，包含当前页面的信息、上传会话ID和业务信息
  // 使用网络可访问的地址，确保手机能够访问
  let baseUrl = window.location.origin;

  // 强制使用配置的端口
  const currentUrl = new URL(window.location.href);
  if (mobileUploadConfig.value.ip) {
    // 使用配置的IP和端口
    baseUrl = `http://${mobileUploadConfig.value.ip}:${mobileUploadConfig.value.port}`;
    console.log(`使用配置的IP和端口: ${baseUrl}`);
  } else {
    // 使用当前主机名和配置的端口
    baseUrl = `http://${currentUrl.hostname}:${mobileUploadConfig.value.port}`;
    console.log(`使用当前主机名和配置的端口: ${baseUrl}`);
  }

  // 获取localStorage中的token
  const token = localStorage.getItem('token');
  let tokenParam = '';
  if (token) {
    // 提取token值（去掉Bearer前缀）
    const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
    tokenParam = `&token=${encodeURIComponent(tokenValue)}`;
  }

  const mobileUploadUrl = `${baseUrl}/websocket-test?mode=upload&bizType=${props.bizType}&bizId=${props.bizId}&sessionId=${uploadSessionId}${tokenParam}`;
  console.log(`生成的二维码URL: ${mobileUploadUrl}`);

  qrCodeUrl.value = mobileUploadUrl;
  qrCodeExpireTime.value = 300; // 5分钟过期
  showQrCodeDialog.value = true;

  // 开始轮询检查上传状态
  startQrCodePolling(uploadSessionId);
};

// 开始轮询检查手机上传状态
const startQrCodePolling = (_sessionId: string) => {
  // 清除之前的轮询
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }

  qrCodePolling.value = setInterval(async () => {
    try {
      // 检查二维码是否过期
      if (qrCodeExpireTime.value <= 0) {
        clearInterval(qrCodePolling.value!);
        qrCodePolling.value = null;
        ElMessage.warning('二维码已过期，请重新生成');
        showQrCodeDialog.value = false;
        return;
      }

      qrCodeExpireTime.value--;
    } catch (error) {
      console.error('轮询检查失败:', error);
    }
  }, 1000);
};

// 关闭二维码弹窗
const closeQrCodeDialog = () => {
  showQrCodeDialog.value = false;
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
};

// 刷新文件列表
const handleRefresh = async () => {
  await loadFiles();
  ElMessage.success('刷新成功');
};

const autoPreviewFirstFile = () => {
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

  if (isLocalMode.value) {
    handleLocalFileAdd(rawFile);
  } else {
    await handleServerFileUpload(rawFile);
  }
};

const handleLocalFileAdd = (rawFile: File) => {
  const fileExt = rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1).toLowerCase();
  const localFile: LocalFileItem = {
    file: rawFile,
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    originalFileName: rawFile.name,
    fileSize: rawFile.size,
    fileExtension: fileExt,
    mimeType: rawFile.type,
    uploadTime: new Date().toISOString(),
  };
  
  localFiles.value.push(localFile);
  emit('local-files-change', localFiles.value);
  ElMessage.success('文件添加成功');
};

const handleServerFileUpload = async (rawFile: File) => {
  uploadLoading.value = true;
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const response = await uploadFileApi(rawFile, props.bizType, props.bizId);
    if (response.code === 200 && response.data) {
      ElMessage.success('文件上传成功');
      await loadFiles();
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

const handlePreview = async (file: FileItem | LocalFileItem) => {
  previewFile.value = file;
  previewLoading.value = true;
  
  try {
    let blob: Blob;
    
    if ('file' in file) {
      blob = file.file;
    } else {
      blob = await fileUploadRequestClient.get<Blob>(
        `/api/v1/file/preview/${file.id}`,
        {
          responseType: 'blob',
        },
      );
    }
    
    previewUrl.value = window.URL.createObjectURL(blob);
    showPreviewDialog.value = true;
  } catch (error) {
    console.error('文件预览失败:', error);
    ElMessage.error('文件预览失败');
  } finally {
    previewLoading.value = false;
  }
};

const handleDownload = async (file: FileItem | LocalFileItem) => {
  try {
    let blob: Blob;
    
    if ('file' in file) {
      blob = file.file;
    } else {
      blob = await downloadFileApi(file.id);
    }
    
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

const handleDelete = async (file: FileItem | LocalFileItem) => {
  if ('file' in file) {
    handleLocalFileDelete(file.id);
  } else {
    await handleServerFileDelete(file);
  }
};

const handleLocalFileDelete = (fileId: string) => {
  const index = localFiles.value.findIndex(f => f.id === fileId);
  if (index > -1) {
    localFiles.value.splice(index, 1);
    emit('local-files-change', localFiles.value);
    ElMessage.success('文件删除成功');
  }
};

const handleServerFileDelete = async (file: FileItem) => {
  try {
    const response = await deleteFileApi(file.id);
    if (response.code === 200) {
      ElMessage.success('文件删除成功');
      await loadFiles();
      if (props.modelValue && Array.isArray(props.modelValue)) {
        const newFileIds = props.modelValue.filter(id => id !== file.id);
        emit('update:modelValue', newFileIds);
      }
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
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  previewFile.value = null;
  previewLoading.value = false;
};

const getLocalFiles = (): LocalFileItem[] => {
  return localFiles.value;
};

const clearLocalFiles = () => {
  localFiles.value = [];
  emit('local-files-change', localFiles.value);
};

const uploadLocalFiles = async (bizId: number): Promise<number[]> => {
  if (localFiles.value.length === 0) return [];
  
  uploading.value = true;
  const uploadedFileIds: number[] = [];
  
  try {
    for (const localFile of localFiles.value) {
      try {
        const response = await uploadFileApi(localFile.file, props.bizType, bizId);
        if (response.code === 200 && response.data) {
          uploadedFileIds.push(response.data.id);
        }
      } catch (error) {
        console.error(`文件 ${localFile.originalFileName} 上传失败:`, error);
      }
    }
    
    if (uploadedFileIds.length === localFiles.value.length) {
      ElMessage.success(`成功上传 ${uploadedFileIds.length} 个文件`);
    } else {
      ElMessage.warning(`成功上传 ${uploadedFileIds.length}/${localFiles.value.length} 个文件`);
    }
    
    return uploadedFileIds;
  } finally {
    uploading.value = false;
  }
};

const displayFiles = computed(() => {
  return isLocalMode.value ? localFiles.value : fileList.value;
});

watch(() => [props.bizId, props.bizType], () => {
  loadFiles();
}, { immediate: true });

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    loadFiles();
  }
}, { immediate: true });

// 组件卸载时清理
onUnmounted(() => {
  // 清理轮询
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
  // 清理预览URL
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
});

defineExpose({
  getLocalFiles,
  clearLocalFiles,
  uploadLocalFiles,
  handleRefresh,
  openMobileUploadDialog,
});
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
          <ElTag v-if="displayFiles.length > 0" type="info" size="small">
            {{ isLocalMode ? '已添加' : '已上传' }} {{ displayFiles.length }} 个文件
          </ElTag>
          <ElButton 
            v-if="!disabled" 
            type="success" 
            size="small" 
            @click="openMobileUploadDialog"
          >
            <Icon icon="lucide:smartphone" class="mr-1" />
            手机上传
          </ElButton>
          <ElButton 
            v-if="!disabled" 
            type="primary" 
            size="small" 
            @click="handleRefresh"
          >
            <Icon icon="lucide:refresh-cw" class="mr-1" />
            刷新
          </ElButton>
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
            <p class="text-primary font-medium">{{ isLocalMode ? '点击或拖拽文件到此处添加' : '点击或拖拽文件到此处上传' }}</p>
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
        <p class="text-sm text-gray-500 mt-2 text-center">{{ isLocalMode ? '正在处理...' : '正在上传...' }}</p>
      </div>
    </div>

    <div v-if="displayFiles.length > 0" class="file-list-section">
      <ElTable :data="displayFiles" border stripe style="width: 100%">
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
        <img
          v-if="previewFile?.mimeType?.startsWith('image/')"
          :src="previewUrl"
          class="preview-image"
          alt="预览图片"
        />
        <iframe
          v-else-if="previewFile?.mimeType === 'application/pdf'"
          :src="previewUrl"
          class="preview-pdf"
          frameborder="0"
        ></iframe>
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

    <!-- 手机上传二维码弹窗 -->
    <ElDialog
      v-model="showQrCodeDialog"
      title="手机上传文件"
      width="500px"
      destroy-on-close
      @close="closeQrCodeDialog"
    >
      <div class="mobile-upload-dialog">
        <div class="qr-code-container">
          <div class="qr-code-title">请使用手机扫描二维码上传文件</div>
          <div class="qr-code-content">
            <QrcodeVue :value="qrCodeUrl" :size="200" level="H" />
          </div>
          <div class="qr-code-tip">
            <p>1. 使用手机浏览器扫描二维码</p>
            <p>2. 在手机端选择要上传的文件</p>
            <p>3. 等待上传完成后，文件将自动显示在文件列表中</p>
          </div>

          <!-- 微信浏览器提示 -->
          <div v-if="isWeChatBrowser" class="wechat-tip">
            <div class="wechat-tip-header">
              <Icon icon="lucide:alert-triangle" class="wechat-tip-icon" />
              <span>微信浏览器提示</span>
            </div>
            <div class="wechat-tip-content">
              <p>检测到您正在使用微信浏览器，请按以下步骤操作：</p>
              <ol>
                <li>点击右上角的 <Icon icon="lucide:more-horizontal" class="inline-icon" /> 按钮</li>
                <li>选择 "在浏览器中打开" 选项</li>
                <li>在新打开的浏览器中选择文件上传</li>
              </ol>
            </div>
          </div>

          <div class="qr-code-expire">
            二维码将在 {{ Math.floor(qrCodeExpireTime / 60) }}:{{
              (qrCodeExpireTime % 60).toString().padStart(2, '0')
            }}
            后过期
          </div>
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

/* 手机上传弹窗样式 */
.mobile-upload-dialog {
  padding: 20px;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-code-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
}

.qr-code-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.qr-code-tip {
  text-align: left;
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.qr-code-tip p {
  margin: 4px 0;
}

.qr-code-expire {
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
}

.wechat-tip {
  width: 100%;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.wechat-tip-header {
  display: flex;
  align-items: center;
  color: #e6a23c;
  font-weight: 500;
  margin-bottom: 8px;
}

.wechat-tip-icon {
  margin-right: 8px;
}

.wechat-tip-content {
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

.wechat-tip-content ol {
  margin: 8px 0 0 16px;
  padding: 0;
}

.wechat-tip-content li {
  margin: 4px 0;
}

.inline-icon {
  display: inline-block;
  vertical-align: middle;
  margin: 0 4px;
}
</style>
