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
  renameFileApi,
} from '#/api/core/file';
import {
  createTempUploadToken,
  getTempUploadFiles,
  cancelTempUploadToken,
  transferTempFiles,
  type TempUploadFile,
} from '#/api/core/temp-upload';

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

interface ExistingFileItem {
  id: number | string;
  originalFileName: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  uploadTime?: string;
  filePath?: string;
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
  existingFiles?: ExistingFileItem[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void;
  (e: 'upload-success', file: FileApi.FileRecord): void;
  (e: 'upload-error', error: any): void;
  (e: 'delete', fileId: number): void;
  (e: 'local-files-change', files: LocalFileItem[]): void;
  (e: 'mobile-files-uploaded', files: TempUploadFile[]): void;
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

// 重命名相关
const showRenameDialog = ref(false);
const currentRenameFile = ref<FileItem | null>(null);
const newFileName = ref('');
const renameLoading = ref(false);

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

const getFileIcon = (file: FileItem | LocalFileItem | TempUploadFile): string => {
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

const canPreview = (file: FileItem | LocalFileItem | TempUploadFile): boolean => {
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

// 检测本机局域网 IP 地址
const detectLocalIP = async (): Promise<string> => {
  try {
    console.log('[IP 检测] 开始检测本机 IP 地址...');
    console.log('[IP 检测] 当前主机名:', window.location.hostname);
    console.log('[IP 检测] 当前页面 URL:', window.location.href);

    // 方法 0: 优先使用环境变量配置的 IP
    const configuredIP = getConfiguredIP();
    if (configuredIP) {
      console.log('[IP 检测] ✓ 使用环境变量配置的 IP:', configuredIP);
      mobileUploadConfig.value.ip = configuredIP;
      return configuredIP;
    }

    // 方法 1: 检查当前主机名是否已经是有效 IP
    const hostname = window.location.hostname;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname) && !hostname.startsWith('127.')) {
      console.log('[IP 检测] ✓ 当前主机名是有效 IP 地址:', hostname);
      mobileUploadConfig.value.ip = hostname;
      return hostname;
    }

    // 方法 2: 通过 WebRTC 获取本地 IP（带超时）
    console.log('[IP 检测] 尝试通过 WebRTC 获取 IP...');
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    const offer = await rtc.createOffer();
    await rtc.setLocalDescription(offer);

    let foundIP = false;

    return new Promise<string>((resolve, reject) => {
      // 设置超时：2 秒
      const timeoutId = setTimeout(() => {
        if (!foundIP) {
          console.log('[IP 检测] ⏰ WebRTC 检测超时（2 秒）');
          rtc.close();
          // 不 reject，使用后备方法
          resolve(useFallbackIP());
        }
      }, 2000);

      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          console.log('[IP 检测] 收到 ICE 候选:', candidate);

          // 尝试匹配 IPv4 地址（排除 mDNS 地址如 xxx.local）
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);

          if (ipMatch && ipMatch[1]) {
            const ip = ipMatch[1];
            console.log('[IP 检测] 提取到 IP:', ip);

            // 排除回环地址和私有地址范围检查
            if (!ip.startsWith('127.') && !ip.startsWith('0.')) {
              console.log('[IP 检测] ✓ 通过 WebRTC 获取到有效 IP 地址:', ip);
              mobileUploadConfig.value.ip = ip;
              foundIP = true;
              clearTimeout(timeoutId);
              rtc.close();
              resolve(ip);
              return;
            }
          }
        } else {
          console.log('[IP 检测] ICE 候选收集完成');
          
          // 如果收集完成但未找到 IP，使用后备方法
          if (!foundIP) {
            clearTimeout(timeoutId);
            console.log('[IP 检测] ⚠️ 未找到有效 IP，使用后备方法');
            resolve(useFallbackIP());
          }
        }
      };

      rtc.onicecandidateerror = (error) => {
        console.error('[IP 检测] ❌ WebRTC 错误:', error);
        clearTimeout(timeoutId);
        // 不 reject，使用后备方法
        resolve(useFallbackIP());
      };
    });
  } catch (error) {
    console.error('[IP 检测] ❌ 检测 IP 过程出错:', error);
    ElMessage.warning('IP 检测失败，将使用默认配置，手机上传可能无法使用');
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
  const defaultIP = '192.168.0.151';
  console.log('[IP检测] ✗ 无法检测IP，使用默认IP:', defaultIP);
  console.log('[IP检测] 提示: 可以通过设置环境变量 VITE_MOBILE_UPLOAD_IP 来指定IP地址');
  mobileUploadConfig.value.ip = defaultIP;
  return defaultIP;
};

// 打开手机上传二维码弹窗
const openMobileUploadDialog = async () => {
  try {
    // 创建临时上传Token
    const tokenResponse = await createTempUploadToken({
      bizType: props.bizType,
      description: `${props.title || '文件'}上传`,
      expireMinutes: 30,
    });

    if (tokenResponse.code !== 200 || !tokenResponse.data) {
      ElMessage.error('创建上传Token失败');
      return;
    }

    currentTempToken.value = tokenResponse.data.token;
    console.log('创建临时Token成功:', currentTempToken.value);

    // 自动检测本地IP地址
    if (mobileUploadConfig.value.autoDetect && !mobileUploadConfig.value.ip) {
      await detectLocalIP();
    }

    // 生成二维码URL，使用后端返回的qrCodeContent
    // qrCodeContent格式: http://localhost:8080/api/v1/temp-upload/mobile?token=xxx
    // 需要将其转换为前端页面URL
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

    // 生成手机上传页面URL，包含token
    const mobileUploadUrl = `${baseUrl}/mobile-upload?token=${encodeURIComponent(currentTempToken.value)}`;
    console.log(`生成的二维码URL: ${mobileUploadUrl}`);

    qrCodeUrl.value = mobileUploadUrl;
    qrCodeExpireTime.value = 1800; // 30分钟过期
    showQrCodeDialog.value = true;

    // 开始轮询获取手机上传的文件列表
    startTempFilePolling();
  } catch (error) {
    console.error('打开手机上传弹窗失败:', error);
    ElMessage.error('打开手机上传功能失败');
  }
};

// 开始轮询获取手机上传的文件列表
const startTempFilePolling = () => {
  // 清除之前的轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }

  // 立即执行一次
  pollTempFiles();

  // 每3秒轮询一次
  tempFilePolling.value = setInterval(async () => {
    await pollTempFiles();
  }, 3000);
};

// 轮询获取临时文件列表
const pollTempFiles = async () => {
  if (!currentTempToken.value) return;

  try {
    const response = await getTempUploadFiles(currentTempToken.value);
    console.log('轮询获取临时文件列表:', response);
    
    if (response.code === 200 && response.data) {
      const newFiles = response.data;
      console.log('当前已上传文件数:', mobileUploadedFiles.value.length);
      console.log('新获取的文件数:', newFiles.length);
      
      // 检查是否有新文件上传
      if (newFiles.length > mobileUploadedFiles.value.length) {
        const diffCount = newFiles.length - mobileUploadedFiles.value.length;
        console.log('📱 [FileUpload 调试] 手机上传了新文件:', {
          diffCount,
          newFiles: newFiles.map(f => ({
            id: f.id,
            name: f.originalFileName,
            size: f.fileSize,
          })),
        });
        ElMessage.success(`手机上传了 ${diffCount} 个新文件`);
        
        // 如果是本地模式，添加到本地文件列表
        if (isLocalMode.value) {
          // 将 TempUploadFile 转换为 LocalFileItem
          const newLocalFiles = newFiles.slice(mobileUploadedFiles.value.length).map((tempFile) => ({
            file: new File([], tempFile.originalFileName, { type: tempFile.mimeType }),
            id: `mobile-${tempFile.id}`,
            originalFileName: tempFile.originalFileName,
            fileSize: tempFile.fileSize,
            fileExtension: tempFile.fileExtension,
            mimeType: tempFile.mimeType,
            uploadTime: tempFile.uploadTime,
          }));
          
          console.log('📂 [FileUpload 调试] 添加手机文件到本地列表:', {
            filesCount: newLocalFiles.length,
            files: newLocalFiles.map(f => ({
              id: f.id,
              name: f.originalFileName,
              hasFileObject: !!f.file,
              fileSize: f.fileSize,
            })),
          });
          
          localFiles.value.push(...newLocalFiles);
          console.log('📤 [FileUpload 调试] 触发 local-files-change 事件');
          emit('local-files-change', localFiles.value);
          console.log('✅ [FileUpload 调试] local-files-change 事件已触发');
        }
        
        // 触发事件通知父组件
        console.log('📤 [FileUpload 调试] 触发 mobile-files-uploaded 事件');
        emit('mobile-files-uploaded', newFiles);
        console.log('✅ [FileUpload 调试] mobile-files-uploaded 事件已触发');
      }
      
      mobileUploadedFiles.value = newFiles;
      console.log('更新后的文件列表:', mobileUploadedFiles.value);
    }
  } catch (error) {
    console.error('获取临时文件列表失败:', error);
  }
};

// 转移临时文件到业务
const transferMobileFiles = async (bizId: number): Promise<TempUploadFile[]> => {
  if (!currentTempToken.value || mobileUploadedFiles.value.length === 0 || !bizId) {
    console.error('转移临时文件失败：缺少必要参数', { currentTempToken: currentTempToken.value, mobileUploadedFiles: mobileUploadedFiles.value, bizId });
    return [];
  }

  try {
    const response = await transferTempFiles({
      token: currentTempToken.value,
      bizType: props.bizType,
      bizId: bizId.toString(),
    });

    if (response.code === 200 && response.data) {
      const transferredFiles = response.data;
      ElMessage.success(`成功转移 ${transferredFiles.length} 个文件到业务`);
      
      // 刷新文件列表
      await loadFiles();
      
      // 返回转移后的完整文件信息
      return transferredFiles;
    }
  } catch (error) {
    console.error('转移临时文件失败:', error);
    ElMessage.error('转移临时文件失败');
  }
  
  return [];
};

// 关闭二维码弹窗
const closeQrCodeDialog = async () => {
  showQrCodeDialog.value = false;
  
  // 停止轮询
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  
  console.log('关闭二维码弹窗，当前状态:', {
    hasFiles: mobileUploadedFiles.value.length > 0,
    filesCount: mobileUploadedFiles.value.length,
    files: mobileUploadedFiles.value,
    bizId: props.bizId,
    token: currentTempToken.value,
  });
  
  let shouldCancelToken = true;
  
  // 如果有上传的文件，询问是否保留
  if (mobileUploadedFiles.value.length > 0) {
    // 自动转移到业务（如果有有效的bizId）
    if (props.bizId && props.bizId > 0) {
      console.log('有有效的bizId，自动转移文件到业务:', props.bizId);
      await transferMobileFiles(props.bizId);
    } else {
      // 如果没有有效的bizId，不取消Token，以便稍后可以转移文件
      shouldCancelToken = false;
      ElMessage.info('文件已保存到临时存储，创建业务实体后可转移文件');
      console.log('文件已保存到临时存储，Token:', currentTempToken.value);
      console.log('保留的文件列表:', mobileUploadedFiles.value);
    }
  }
  
  // 取消Token（只有当没有上传文件或已转移文件时）
  if (shouldCancelToken && currentTempToken.value) {
    console.log('取消Token并清空文件列表');
    try {
      await cancelTempUploadToken(currentTempToken.value);
      console.log('Token已取消:', currentTempToken.value);
    } catch (error) {
      console.error('取消Token失败:', error);
    }
    currentTempToken.value = '';
    mobileUploadedFiles.value = [];
  } else {
    console.log('保留Token和文件列表，等待后续转移');
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
  console.log('📥 [FileUpload 调试] handleFileChange 被调用', {
    fileName: file.name,
    rawFile: file.raw?.name,
    fileSize: file.raw?.size,
    fileType: file.raw?.type,
  });
  
  const rawFile = file.raw;
  
  if (!rawFile) {
    console.log('⚠️ [FileUpload 调试] rawFile 不存在');
    return;
  }
  
  console.log('✅ [FileUpload 调试] rawFile 存在，开始验证');

  if (rawFile.size > maxSize.value) {
    console.log('❌ [FileUpload 调试] 文件超出大小限制:', rawFile.size, maxSize.value);
    ElMessage.error(`文件大小不能超过 ${formatFileSize(maxSize.value)}`);
    return;
  }
  
  console.log('✅ [FileUpload 调试] 文件大小验证通过');

  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim());
    const fileExt = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase();
    const isValid = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase();
      }
      return rawFile.type.includes(type);
    });
    
    console.log('🔍 [FileUpload 调试] 文件类型验证:', {
      fileExt,
      acceptTypes,
      isValid,
      mimeType: rawFile.type,
    });
    
    if (!isValid) {
      console.log('❌ [FileUpload 调试] 文件类型不被支持');
      ElMessage.error('不支持的文件类型');
      return;
    }
  }
  
  console.log('✅ [FileUpload 调试] 文件类型验证通过');
  console.log('📋 [FileUpload 调试] 当前模式:', { isLocalMode: isLocalMode.value });

  if (isLocalMode.value) {
    console.log('💻 [FileUpload 调试] 进入本地模式，调用 handleLocalFileAdd');
    handleLocalFileAdd(rawFile);
  } else {
    console.log('☁️ [FileUpload 调试] 进入服务器模式，调用 handleServerFileUpload');
    await handleServerFileUpload(rawFile);
  }
};

const handleLocalFileAdd = (rawFile: File) => {
  console.log('📝 [FileUpload 调试] handleLocalFileAdd 被调用', {
    fileName: rawFile.name,
    fileSize: rawFile.size,
    fileType: rawFile.type,
  });
  
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
  
  console.log('📂 [FileUpload 调试] 创建的本地文件对象:', {
    id: localFile.id,
    name: localFile.originalFileName,
    size: localFile.fileSize,
    hasFileObject: !!localFile.file,
  });
  
  localFiles.value.push(localFile);
  console.log('📂 [FileUpload 调试] localFiles 数组当前内容:', 
    localFiles.value.map(f => ({
      id: f.id,
      name: f.originalFileName,
      hasFileObject: !!f.file,
    }))
  );
  
  console.log('📤 [FileUpload 调试] 准备触发 local-files-change 事件');
  emit('local-files-change', localFiles.value);
  console.log('✅ [FileUpload 调试] local-files-change 事件已触发');
  
  ElMessage.success('文件添加成功');
  console.log('🏁 [FileUpload 调试] handleLocalFileAdd 执行完毕');
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

const handlePreview = async (file: FileItem | LocalFileItem | TempUploadFile) => {
  previewFile.value = file as FileItem | LocalFileItem;
  previewLoading.value = true;
  
  try {
    let blob: Blob;
    
    // 检查是否为从手机上传转换而来的文件
    const isMobileFile = typeof file.id === 'string' && file.id.startsWith('mobile-');
    
    // 对于从手机上传转换而来的文件，或者本地文件大小为0的文件，应该从服务器获取文件数据
    if ('file' in file && !isMobileFile && file.file.size > 0) {
      blob = file.file;
    } else {
      // 从服务器获取文件数据
      const fileId = typeof file.id === 'string' ? file.id.replace('mobile-', '') : file.id;
      blob = await fileUploadRequestClient.get<Blob>(
        `/api/v1/file/preview/${fileId}`,
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
    
    // 检查是否为从手机上传转换而来的文件
    const isMobileFile = typeof file.id === 'string' && file.id.startsWith('mobile-');
    
    // 对于从手机上传转换而来的文件，或者本地文件大小为0的文件，应该从服务器获取文件数据
    if ('file' in file && !isMobileFile && file.file.size > 0) {
      blob = file.file;
    } else {
      // 从服务器获取文件数据
      const fileId = typeof file.id === 'string' ? file.id.replace('mobile-', '') : file.id;
      blob = await downloadFileApi(fileId);
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

// 打开重命名对话框
const handleRenameFile = (file: FileItem | LocalFileItem) => {
  // 检查是否为本地文件（临时ID）
  if (typeof file.id === 'string') {
    ElMessage.warning('请先上传文件到服务器，然后再进行重命名操作');
    return;
  }
  
  currentRenameFile.value = file as FileItem;
  newFileName.value = file.originalFileName;
  showRenameDialog.value = true;
};

// 执行重命名操作
const confirmRenameFile = async () => {
  if (!currentRenameFile.value || !newFileName.value.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  try {
    renameLoading.value = true;
    // 确保使用数字类型的fileId
    const fileId = currentRenameFile.value.id;
    if (typeof fileId !== 'number') {
      ElMessage.error('文件ID格式错误');
      return;
    }
    
    const response = await renameFileApi(fileId, newFileName.value.trim());
    if (response.code === 200 && response.data) {
      ElMessage.success('文件重命名成功');
      // 刷新文件列表
      await loadFiles();
      showRenameDialog.value = false;
      currentRenameFile.value = null;
      newFileName.value = '';
    } else {
      ElMessage.error(response.message || '文件重命名失败');
    }
  } catch (error) {
    console.error('文件重命名失败:', error);
    ElMessage.error('文件重命名失败');
  } finally {
    renameLoading.value = false;
  }
};

// 取消重命名
const cancelRenameFile = () => {
  showRenameDialog.value = false;
  currentRenameFile.value = null;
  newFileName.value = '';
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
  console.log('📤 [FileUpload 调试] uploadLocalFiles 被调用:', { bizId, localFilesCount: localFiles.value.length });
  
  if (localFiles.value.length === 0) {
    console.log('⚠️ [FileUpload 调试] 没有本地文件需要上传');
    return [];
  }
  
  uploading.value = true;
  const uploadedFileIds: number[] = [];
  
  try {
    console.log('📂 [FileUpload 调试] 准备上传的文件列表:', 
      localFiles.value.map(f => ({
        id: f.id,
        name: f.originalFileName,
        size: f.fileSize,
        isMobileFile: f.id.startsWith('mobile-'),
        hasFileObject: !!f.file,
      }))
    );
    
    for (const localFile of localFiles.value) {
      try {
        // 跳过从手机上传转换而来的本地文件，因为它们是空的
        if (localFile.id.startsWith('mobile-')) {
          console.log(`⏭️ [FileUpload 调试] 跳过手机上传的文件 ${localFile.originalFileName}，请使用 transferMobileFiles 方法转移`);
          continue;
        }
        
        console.log(`⏳ [FileUpload 调试] 开始上传文件: ${localFile.originalFileName}`, {
          fileSize: localFile.fileSize,
          fileType: localFile.mimeType,
          hasFileObject: !!localFile.file,
        });
        
        const response = await uploadFileApi(localFile.file, props.bizType, bizId);
        console.log(`📥 [FileUpload 调试] 文件上传响应: ${localFile.originalFileName}`, response);
        
        if (response.code === 200 && response.data) {
          uploadedFileIds.push(response.data.id);
          console.log(`✅ [FileUpload 调试] 文件上传成功: ${localFile.originalFileName}, fileId: ${response.data.id}`);
        } else {
          console.error(`❌ [FileUpload 调试] 文件上传失败: ${localFile.originalFileName}`, response);
        }
      } catch (error) {
        console.error(`❌ [FileUpload 调试] 文件 ${localFile.originalFileName} 上传异常:`, error);
      }
    }
    
    console.log('📊 [FileUpload 调试] 上传结果统计:', {
      total: localFiles.value.length,
      success: uploadedFileIds.length,
      failed: localFiles.value.length - uploadedFileIds.length,
    });
    
    if (uploadedFileIds.length === localFiles.value.length) {
      ElMessage.success(`成功上传 ${uploadedFileIds.length} 个文件`);
    } else if (uploadedFileIds.length > 0) {
      ElMessage.warning(`成功上传 ${uploadedFileIds.length}/${localFiles.value.length} 个文件`);
    } else {
      ElMessage.info('没有需要上传的文件');
    }
    
    return uploadedFileIds;
  } finally {
    uploading.value = false;
    console.log('🏁 [FileUpload 调试] uploadLocalFiles 执行完毕');
  }
};

// 检查是否有未转移的临时文件
const hasUntransferredFiles = computed(() => {
  console.log('计算 hasUntransferredFiles:', {
    hasToken: !!currentTempToken.value,
    token: currentTempToken.value,
    filesCount: mobileUploadedFiles.value.length,
    files: mobileUploadedFiles.value,
  });
  return !!currentTempToken.value && mobileUploadedFiles.value.length > 0;
});

// 暴露方法给父组件
defineExpose({
  getLocalFiles,
  clearLocalFiles,
  uploadLocalFiles,
  handleRefresh,
  openMobileUploadDialog,
  transferMobileFiles,
  getMobileUploadedFiles: () => mobileUploadedFiles.value,
  getHasUntransferredFiles: () => hasUntransferredFiles.value,
  getCurrentTempToken: () => currentTempToken.value,
});

const displayFiles = computed(() => {
  if (isLocalMode.value) {
    // 在本地模式下，合并已有文件和本地文件
    const existing = props.existingFiles || [];
    const local = localFiles.value;
    
    // 创建一个Map来去重，以id为key
    const fileMap = new Map<string | number, any>();
    
    // 先添加已有文件
    existing.forEach(file => {
      fileMap.set(file.id, {
        ...file,
        file: new File([], file.originalFileName, { type: file.mimeType }),
        isExisting: true,
      });
    });
    
    // 再添加本地文件（会覆盖同id的已有文件）
    local.forEach(file => {
      fileMap.set(file.id, file);
    });
    
    return Array.from(fileMap.values());
  }
  return fileList.value;
});

// 监听existingFiles变化，初始化本地文件列表
watch(() => props.existingFiles, (newFiles) => {
  if (isLocalMode.value && newFiles && newFiles.length > 0) {
    // 将已有文件转换为LocalFileItem格式
    const existingLocalFiles = newFiles.map(file => ({
      file: new File([], file.originalFileName, { type: file.mimeType }),
      id: typeof file.id === 'number' ? `existing-${file.id}` : file.id,
      originalFileName: file.originalFileName,
      fileSize: file.fileSize,
      fileExtension: file.fileExtension,
      mimeType: file.mimeType,
      uploadTime: file.uploadTime || new Date().toISOString(),
      isExisting: true,
      filePath: file.filePath,
    })) as any[];
    
    // 合并到localFiles中（去重）
    const existingIds = new Set(existingLocalFiles.map(f => f.id));
    const newLocalFiles = localFiles.value.filter(f => !existingIds.has(f.id));
    localFiles.value = [...existingLocalFiles, ...newLocalFiles];
    
    // 通知父组件
    emit('local-files-change', localFiles.value);
  }
}, { immediate: true });

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
  if (tempFilePolling.value) {
    clearInterval(tempFilePolling.value);
    tempFilePolling.value = null;
  }
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }
  // 清理预览URL
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  // 取消Token
  if (currentTempToken.value) {
    cancelTempUploadToken(currentTempToken.value).catch(() => {});
  }
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
              type="primary"
              size="small"
              @click="handleRenameFile(scope.row)"
            >
              重命名
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

          <!-- 手机上传状态 -->
          <div v-if="mobileUploadedFiles.length > 0" class="mobile-upload-status">
            <div class="status-header">
              <Icon icon="lucide:check-circle" class="status-icon success" />
              <span>已上传 {{ mobileUploadedFiles.length }} 个文件</span>
            </div>
            <div class="file-list-preview">
              <div v-for="file in mobileUploadedFiles" :key="file.id" class="file-item">
                <Icon :icon="getFileIcon(file)" class="file-icon-small" />
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

    <!-- 重命名对话框 -->
    <ElDialog
      v-model="showRenameDialog"
      title="重命名文件"
      width="400px"
    >
      <div class="rename-dialog-content">
        <div class="form-item mb-4">
          <label class="form-label block mb-2">当前文件名：</label>
          <div class="current-file-name text-gray-600">{{ currentRenameFile?.originalFileName }}</div>
        </div>
        <div class="form-item">
          <label class="form-label block mb-2">新文件名：</label>
          <ElInput
            v-model="newFileName"
            placeholder="请输入新文件名（包含扩展名）"
            :disabled="renameLoading"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="cancelRenameFile" :loading="renameLoading">
            取消
          </ElButton>
          <ElButton type="primary" @click="confirmRenameFile" :loading="renameLoading">
            确认重命名
          </ElButton>
        </span>
      </template>
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

.file-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>
