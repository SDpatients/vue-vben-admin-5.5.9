<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElImage,
  ElMessage,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';
import QrcodeVue from 'qrcode.vue';

import {
  deleteFileApi,
  downloadFileApi,
  getAllFilesByBizApi,
  uploadFileApi,
  renameFileApi,
} from '#/api/core/file';
import type { FileApi } from '#/api/core/file';
import {
  createTempUploadToken,
  getTempUploadFiles,
  cancelTempUploadToken,
  transferTempFiles,
  type TempUploadFile,
} from '#/api/core/temp-upload';
import {
  MOBILE_UPLOAD_CONFIG,
  getMobileUploadUrl,
  getBaseUrl,
  getConfiguredIP,
  isValidIP,
  getDefaultIP,
  formatFileSize as formatFileSizeUtil,
} from '#/config/mobile-upload';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const uploadLoading = ref(false);
const attachments = ref<FileApi.FileRecord[]>([]);

// 图片URL缓存
const imageUrls = ref<Map<number, string>>(new Map());

// 手机上传相关
const showQrCodeDialog = ref(false);
const qrCodeUrl = ref('');
const qrCodeExpireTime = ref(0);
const qrCodePolling = ref<NodeJS.Timeout | null>(null);

// 临时上传Token相关
const currentTempToken = ref('');
const tempFilePolling = ref<NodeJS.Timeout | null>(null);
const mobileUploadedFiles = ref<TempUploadFile[]>([]);

// 移动端上传配置
const mobileUploadConfig = ref({
  ip: '',
  port: MOBILE_UPLOAD_CONFIG.port,
  autoDetect: true,
});

// 检测移动端和微信浏览器
const isWeChatBrowser = ref(false);

// 重命名相关
const showRenameDialog = ref(false);
const currentRenameFile = ref<FileApi.FileRecord | null>(null);
const newFileName = ref('');
const renameLoading = ref(false);

// 预览相关
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');
const previewLoading = ref(false);

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

const formatFileSize = formatFileSizeUtil;

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
  // 检测是否在微信浏览器中
  isWeChatBrowser.value = /MicroMessenger/i.test(navigator.userAgent);
});

// 组件卸载时清理所有图片URL
onUnmounted(() => {
  imageUrls.value.forEach((url) => {
    window.URL.revokeObjectURL(url);
  });
  imageUrls.value.clear();
  // 清理轮询
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
  // 清理临时文件轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  // 取消临时Token
  if (currentTempToken.value) {
    cancelTempUploadToken(currentTempToken.value).catch(() => {});
  }
});

const detectLocalIP = async () => {
  try {
    console.log('[IP检测] 开始检测本机IP地址...');
    console.log('[IP检测] 当前主机名:', window.location.hostname);
    console.log('[IP检测] 当前页面URL:', window.location.href);

    const configuredIP = getConfiguredIP();
    if (configuredIP) {
      console.log('[IP检测] ✓ 使用环境变量配置的IP:', configuredIP);
      mobileUploadConfig.value.ip = configuredIP;
      return configuredIP;
    }

    const hostname = window.location.hostname;
    if (isValidIP(hostname)) {
      console.log('[IP检测] ✓ 当前主机名是有效IP地址:', hostname);
      mobileUploadConfig.value.ip = hostname;
      return hostname;
    }

    console.log('[IP检测] 尝试通过WebRTC获取IP...');
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    const offer = await rtc.createOffer();
    await rtc.setLocalDescription(offer);

    let candidateCount = 0;

    return new Promise<string>((resolve) => {
      rtc.onicecandidate = (event) => {
        candidateCount++;
        console.log(`[IP检测] 收到ICE候选 #${candidateCount}:`, event.candidate);

        if (event.candidate) {
          const candidate = event.candidate.candidate;
          console.log('[IP检测] 候选详情:', candidate);

          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          console.log('[IP检测] IP匹配结果:', ipMatch);

          if (ipMatch && ipMatch[1]) {
            const ip = ipMatch[1];
            console.log('[IP检测] 提取到IP:', ip);

            if (!ip.startsWith('127.')) {
              console.log('[IP检测] ✓ 通过WebRTC获取到有效IP地址:', ip);
              mobileUploadConfig.value.ip = ip;
              resolve(ip);
              rtc.close();
            } else {
              console.log('[IP检测] ✗ 排除回环地址:', ip);
            }
          }
        } else {
          console.log('[IP检测] ICE候选收集完成，未获取更多候选');
        }
      };

      setTimeout(() => {
        console.log('[IP检测] 超时，关闭WebRTC连接');
        rtc.close();

        const hostname = window.location.hostname;
        console.log('[IP检测] 检查主机名:', hostname);

        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          console.log('[IP检测] ✓ 使用当前主机名作为IP:', hostname);
          mobileUploadConfig.value.ip = hostname;
          resolve(hostname);
        } else {
          const defaultIP = getDefaultIP();
          mobileUploadConfig.value.ip = defaultIP;
          resolve(defaultIP);
        }
      }, MOBILE_UPLOAD_CONFIG.webrtcTimeout);
    });
  } catch (error) {
    console.error('[IP检测] 检测IP过程出错:', error);

    const hostname = window.location.hostname;
    console.log('[IP检测] 异常处理 - 检查主机名:', hostname);

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      console.log('[IP检测] 异常处理 - 使用主机名:', hostname);
      mobileUploadConfig.value.ip = hostname;
      return hostname;
    }

    const defaultIP = getDefaultIP();
    mobileUploadConfig.value.ip = defaultIP;
    return defaultIP;
  }
};

const openMobileUploadDialog = async () => {
  try {
    const tokenResponse = await createTempUploadToken({
      bizType: 'case',
      description: '案件附件上传',
      expireMinutes: MOBILE_UPLOAD_CONFIG.tokenExpireMinutes,
    });

    if (tokenResponse.code !== 200 || !tokenResponse.data) {
      ElMessage.error('创建上传Token失败');
      return;
    }

    currentTempToken.value = tokenResponse.data.token;
    console.log('创建临时Token成功:', currentTempToken.value);

    if (mobileUploadConfig.value.autoDetect && !mobileUploadConfig.value.ip) {
      await detectLocalIP();
    }

    let baseUrl = window.location.origin;

    const configuredIP = getConfiguredIP();
    if (configuredIP) {
      baseUrl = getBaseUrl(configuredIP);
    } else if (mobileUploadConfig.value.ip) {
      baseUrl = getBaseUrl(mobileUploadConfig.value.ip);
    } else {
      const currentUrl = new URL(window.location.href);
      baseUrl = getBaseUrl(currentUrl.hostname);
    }

    const mobileUploadUrl = getMobileUploadUrl(baseUrl, currentTempToken.value);
    console.log(`生成的二维码URL: ${mobileUploadUrl}`);

    qrCodeUrl.value = mobileUploadUrl;
    qrCodeExpireTime.value = MOBILE_UPLOAD_CONFIG.tokenExpireSeconds;
    showQrCodeDialog.value = true;

    startTempFilePolling();
  } catch (error) {
    console.error('打开手机上传弹窗失败:', error);
    ElMessage.error('打开手机上传功能失败');
  }
};

const startTempFilePolling = () => {
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }

  pollTempFiles();

  tempFilePolling.value = setInterval(async () => {
    await pollTempFiles();
  }, MOBILE_UPLOAD_CONFIG.pollingInterval);
};

// 轮询获取临时文件列表
const pollTempFiles = async () => {
  if (!currentTempToken.value) return;

  try {
    const response = await getTempUploadFiles(currentTempToken.value);
    
    if (response.code === 200 && response.data) {
      const newFiles = response.data;
      
      // 检查是否有新文件上传
      if (newFiles.length > mobileUploadedFiles.value.length) {
        const diffCount = newFiles.length - mobileUploadedFiles.value.length;
        ElMessage.success(`手机上传了 ${diffCount} 个新文件`);
      }
      
      mobileUploadedFiles.value = newFiles;
    }
  } catch (error) {
    console.error('获取临时文件列表失败:', error);
  }
};

// 转移临时文件到业务
const transferMobileFiles = async () => {
  if (!currentTempToken.value || mobileUploadedFiles.value.length === 0) {
    return;
  }

  try {
    const response = await transferTempFiles({
      token: currentTempToken.value,
      bizType: 'case',
      bizId: props.caseId,
    });

    if (response.code === 200 && response.data) {
      const transferredFiles = response.data;
      ElMessage.success(`成功转移 ${transferredFiles.length} 个文件到案件`);
      
      // 刷新文件列表
      await fetchAttachments();
      
      // 清理状态
      currentTempToken.value = '';
      mobileUploadedFiles.value = [];
    }
  } catch (error) {
    console.error('转移临时文件失败:', error);
    ElMessage.error('转移临时文件失败');
  }
};

// 关闭二维码弹窗
const closeQrCodeDialog = async () => {
  showQrCodeDialog.value = false;
  
  // 停止轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  
  // 如果有上传的文件，自动转移
  if (mobileUploadedFiles.value.length > 0) {
    await transferMobileFiles();
  } else if (currentTempToken.value) {
    // 如果没有上传文件，取消Token
    try {
      await cancelTempUploadToken(currentTempToken.value);
      console.log('Token已取消:', currentTempToken.value);
    } catch (error) {
      console.error('取消Token失败:', error);
    }
    currentTempToken.value = '';
  }
};

// 刷新附件列表
const handleRefresh = async () => {
  await fetchAttachments();
  ElMessage.success('刷新成功');
};

// 判断文件是否可预览
const canPreview = (extension: string): boolean => {
  const previewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'pdf'];
  return previewableExtensions.includes(extension.toLowerCase());
};

// 预览文件
const handlePreview = async (file: FileApi.FileRecord) => {
  previewLoading.value = true;
  previewFileName.value = file.originalFileName;
  try {
    const blob = await downloadFileApi(file.id);
    previewUrl.value = window.URL.createObjectURL(blob);
    showPreviewDialog.value = true;
  } catch (error) {
    console.error('预览失败:', error);
    ElMessage.error('文件预览失败');
  } finally {
    previewLoading.value = false;
  }
};

// 关闭预览
const handlePreviewClose = () => {
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  showPreviewDialog.value = false;
  previewFileName.value = '';
};

// 打开重命名对话框
const handleRename = (file: FileApi.FileRecord) => {
  currentRenameFile.value = file;
  // 隐藏后缀名
  const lastDotIndex = file.originalFileName.lastIndexOf('.');
  if (lastDotIndex > 0) {
    newFileName.value = file.originalFileName.substring(0, lastDotIndex);
  } else {
    newFileName.value = file.originalFileName;
  }
  showRenameDialog.value = true;
};

// 取消重命名
const cancelRename = () => {
  showRenameDialog.value = false;
  currentRenameFile.value = null;
  newFileName.value = '';
};

// 确认重命名
const confirmRename = async () => {
  if (!currentRenameFile.value || !newFileName.value.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  try {
    renameLoading.value = true;
    // 保留原后缀
    const originalName = currentRenameFile.value.originalFileName;
    const lastDotIndex = originalName.lastIndexOf('.');
    let finalName = newFileName.value.trim();
    if (lastDotIndex > 0) {
      const extension = originalName.substring(lastDotIndex);
      finalName = finalName + extension;
    }

    const response = await renameFileApi(currentRenameFile.value.id, finalName);
    if (response.code === 200) {
      ElMessage.success('重命名成功');
      await fetchAttachments();
      showRenameDialog.value = false;
      currentRenameFile.value = null;
      newFileName.value = '';
    } else {
      ElMessage.error(response.message || '重命名失败');
    }
  } catch (error) {
    console.error('重命名失败:', error);
    ElMessage.error('重命名失败');
  } finally {
    renameLoading.value = false;
  }
};

// 组件卸载时清理轮询定时器（防止内存泄漏）
onUnmounted(() => {
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
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
          <ElButton type="success" @click="openMobileUploadDialog">
            <Icon icon="lucide:smartphone" class="mr-1" />
            手机上传
          </ElButton>
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
          <ElButton @click="handleRefresh">
            <Icon icon="lucide:refresh-cw" class="mr-1" />
            刷新
          </ElButton>
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
      <ElTableColumn prop="uploadUserName" label="上传人" width="120" />

      <ElTableColumn label="操作" width="260" fixed="right">
        <template #default="scope">
          <ElButton
            v-if="canPreview(scope.row.fileExtension)"
            link
            type="primary"
            size="small"
            @click="handlePreview(scope.row)"
          >
            <Icon icon="lucide:eye" class="mr-1" />
            预览
          </ElButton>
          <ElButton
            link
            type="primary"
            size="small"
            @click="handleDownload(scope.row.id, scope.row.originalFileName)"
          >
            <Icon icon="lucide:download" class="mr-1" />
            下载
          </ElButton>
          <ElButton
            link
            type="primary"
            size="small"
            @click="handleRename(scope.row)"
          >
            <Icon icon="lucide:edit-3" class="mr-1" />
            重命名
          </ElButton>
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

    <!-- 文件预览弹窗 -->
    <ElDialog
      v-model="showPreviewDialog"
      :title="previewFileName || '文件预览'"
      width="90%"
      destroy-on-close
      @close="handlePreviewClose"
    >
      <div class="preview-container">
        <div v-if="previewLoading" class="loading-container">
          <ElEmpty description="加载中..." />
        </div>
        <div v-else-if="previewUrl" class="preview-content">
          <img
            v-if="previewFileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)
"
            :src="previewUrl"
            class="preview-image"
            alt="预览图片"
          />
          <iframe
            v-else-if="previewFileName.toLowerCase().endsWith('.pdf')"
            :src="previewUrl"
            class="preview-pdf"
            frameborder="0"
          ></iframe>
          <div v-else class="unsupported-preview">
            <Icon icon="lucide:file-question" class="unsupported-icon" />
            <p>该文件类型不支持在线预览</p>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- 重命名对话框 -->
    <ElDialog
      v-model="showRenameDialog"
      title="重命名文件"
      width="400px"
      destroy-on-close
    >
      <div class="rename-dialog-content">
        <div class="form-item mb-4">
          <label class="form-label block mb-2">当前文件名：</label>
          <div class="current-file-name text-gray-600">{{ currentRenameFile?.originalFileName }}</div>
        </div>
        <div class="form-item">
          <label class="form-label block mb-2">新文件名（不包含后缀）：</label>
          <ElInput
            v-model="newFileName"
            placeholder="请输入新文件名"
            :disabled="renameLoading"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="cancelRename" :loading="renameLoading">
            取消
          </ElButton>
          <ElButton type="primary" @click="confirmRename" :loading="renameLoading">
            确认重命名
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 手机上传二维码弹窗 -->
    <ElDialog
      v-model="showQrCodeDialog"
      title="手机上传附件"
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
            <p>3. 等待上传完成后，关闭弹窗即可自动转移文件到案件</p>
          </div>

          <!-- 手机上传状态 -->
          <div v-if="mobileUploadedFiles.length > 0" class="mobile-upload-status">
            <div class="status-header">
              <Icon icon="lucide:check-circle" class="status-icon success" />
              <span>已上传 {{ mobileUploadedFiles.length }} 个文件</span>
            </div>
            <div class="file-list-preview">
              <div v-for="file in mobileUploadedFiles" :key="file.id" class="file-item">
                <Icon :icon="getFileIcon(file.fileExtension)" class="file-icon-small" />
                <span class="file-name">{{ file.originalFileName }}</span>
                <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
              </div>
            </div>
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

/* 手机上传状态样式 */
.mobile-upload-status {
  width: 100%;
  background: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.status-header {
  display: flex;
  align-items: center;
  color: #52c41a;
  font-weight: 500;
  margin-bottom: 12px;
}

.status-icon {
  margin-right: 8px;
  font-size: 18px;
}

.status-icon.success {
  color: #52c41a;
}

.file-list-preview {
  max-height: 150px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-icon-small {
  font-size: 16px;
  color: #409eff;
  margin-right: 8px;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 预览容器样式 */
.preview-container {
  width: 100%;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border: none;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.unsupported-icon {
  font-size: 64px;
  color: #909399;
}

/* 重命名对话框样式 */
.rename-dialog-content {
  padding: 10px 0;
}

.form-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.current-file-name {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  word-break: break-all;
}
</style>
