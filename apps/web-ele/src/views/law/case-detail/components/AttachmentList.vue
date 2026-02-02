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
});

// 检测本机局域网IP地址
const detectLocalIP = async () => {
  try {
    console.log('[IP检测] 开始检测本机IP地址...');
    console.log('[IP检测] 当前主机名:', window.location.hostname);
    console.log('[IP检测] 当前页面URL:', window.location.href);

    // 方法1: 通过WebRTC获取本地IP
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

            // 排除回环地址
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

      // 超时处理 - 1秒超时
      setTimeout(() => {
        console.log('[IP检测] 超时，关闭WebRTC连接');
        rtc.close();

        // 如果WebRTC失败，使用当前主机名
        const hostname = window.location.hostname;
        console.log('[IP检测] 检查主机名:', hostname);

        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          console.log('[IP检测] ✓ 使用当前主机名作为IP:', hostname);
          mobileUploadConfig.value.ip = hostname;
          resolve(hostname);
        } else {
          // 默认使用固定IP地址
          const defaultIP = '192.168.0.120';
          console.log('[IP检测] ✗ 无法检测IP，使用默认IP:', defaultIP);
          mobileUploadConfig.value.ip = defaultIP;
          resolve(defaultIP);
        }
      }, 1000); // 1秒超时
    });
  } catch (error) {
    console.error('[IP检测] 检测IP过程出错:', error);

    // 使用当前主机名作为后备
    const hostname = window.location.hostname;
    console.log('[IP检测] 异常处理 - 检查主机名:', hostname);

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      console.log('[IP检测] 异常处理 - 使用主机名:', hostname);
      mobileUploadConfig.value.ip = hostname;
      return hostname;
    }

    // 默认使用固定IP地址
    const defaultIP = '192.168.0.120';
    console.log('[IP检测] 异常处理 - 使用默认IP:', defaultIP);
    mobileUploadConfig.value.ip = defaultIP;
    return defaultIP;
  }
};

// 打开手机上传二维码弹窗
const openMobileUploadDialog = async () => {
  // 自动检测本地IP地址
  if (mobileUploadConfig.value.autoDetect && !mobileUploadConfig.value.ip) {
    await detectLocalIP();
  }

  // 生成随机的上传会话ID
  const uploadSessionId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // 生成二维码URL，包含当前页面的信息、上传会话ID和案件ID
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

  const mobileUploadUrl = `${baseUrl}/websocket-test?mode=upload&bizType=case&bizId=${props.caseId}&caseId=${props.caseId}&sessionId=${uploadSessionId}`;
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

// 刷新附件列表
const handleRefresh = async () => {
  await fetchAttachments();
  ElMessage.success('刷新成功');
};
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
            <p>3. 等待上传完成后，文件将自动显示在附件列表中</p>
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
</style>
