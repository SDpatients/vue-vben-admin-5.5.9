<script setup lang="ts">
import type { UploadFile } from 'element-plus';

import { computed, defineProps, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElImageViewer,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElTabPane,
  ElTabs,
  ElTag,
  ElUpload,
} from 'element-plus';
import QrcodeVue from 'qrcode.vue';
// 直接导入sortablejs库
import Sortable from 'sortablejs';

import { CaseTaskSubmissionApi } from '../../../api/core/case-task-submissions';
import { CaseTaskApi } from '../../../api/core/case-tasks';
// 导入API请求客户端
import { requestClient8085 } from '../../../api/request';

import ClaimProcessingModules from '../case-detail/components/ClaimProcessingModules.vue';

const props = defineProps<{
  caseId: string;
  initialStage?: number;
}>();

const router = useRouter();
const loading = ref(false);
const isLoadingStage = ref(false);
let lastStageChangeTime = 0;
const STAGE_CHANGE_TIMEOUT = 1; // 1秒超时

const activeStage = ref(props.initialStage || 0);
// 初始阶段，用于保持视觉样式
const initialStage = ref(props.initialStage || 0);
const showAddDialog = ref(false);
const currentModule = ref<any>(null);
const currentStageIndex = ref(0);
const isEditMode = ref(false);
const currentItem = ref<any>(null);
// 控制撤回按钮显示
const showWithdrawButton = ref<null | string>(null);

const formRef = ref();
const upload = ref<InstanceType<typeof ElUpload>>();
const tabs = ref<InstanceType<typeof ElTabs>>();
const fileListContainer = ref<HTMLElement>();
const imagePreviewList = ref<string[]>([]);
const showImageViewer = ref(false);
const currentPreviewIndex = ref(0);
const previewDialogVisible = ref(false);
const previewFileUrl = ref('');
const previewFileName = ref('');
const selectedModule = ref<any>(null);
const selectedDataItem = ref<any>(null);

// 附件网格引用，用于拖动排序
const attachmentsGridRef = ref<HTMLElement | null>(null);

// Sortable 实例引用
let sortableInstance: null | Sortable = null;

// 手机上传相关
const showQrCodeDialog = ref(false);
const qrCodeUrl = ref('');
const qrCodeExpireTime = ref(0);
const qrCodePolling = ref<NodeJS.Timeout | null>(null);

// 移动端上传配置
const mobileUploadConfig = ref({
  ip: '',
  port: 5779,
  autoDetect: true
});

// 检测移动端和微信浏览器
const isWeChatBrowser = ref(false);
const showWeChatHint = ref(false);

// 控制当前激活的标签页
const activeTab = ref('basic');
const formData = ref({
  title: '',
  content: '',
  date: '',
});

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

// 上传文件列表
const uploadFiles = ref<UploadFile[]>([]);

// 处理文件上传前的验证
const handleFileBeforeUpload = (file: UploadFile) => {
  // 验证文件大小，限制为50MB
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    ElMessage.error(`单个文件大小不能超过50MB`);
    return false;
  }
  return false; // 返回false，阻止自动上传
};

// 处理文件移除
const handleFileRemove = (file: UploadFile) => {
  // 显示确认框
  ElMessageBox.confirm('确定要删除这个文件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 检查是否有文件ID，有则调用删除接口
      const fileId = file.id || file.response?.id;
      if (fileId) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            ElMessage.warning('未登录，无法删除文件');
            return;
          }

          // 调用删除接口
          await requestClient8085.delete(`/file/${fileId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          ElMessage.success('文件删除成功');
        } catch (error) {
          console.error('删除文件失败:', error);
          ElMessage.error('删除文件失败');
          return;
        }
      }

      // 从文件列表中删除
      const index = uploadFiles.value.findIndex(
        (item) => item.uid === file.uid,
      );
      if (index !== -1) {
        uploadFiles.value.splice(index, 1);
      }
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info('已取消删除');
    });

  return false; // 阻止默认删除行为，由我们自己处理
};

// 处理文件变化
const handleFileChange = (file: UploadFile, fileList: UploadFile[]) => {
  // 处理本地文件预览
  const updatedFileList = fileList.map((fileItem) => {
    // 如果是本地文件且是图片类型，创建预览URL
    if (fileItem.raw && isImageFile(fileItem.name) && !fileItem.url) {
      return {
        ...fileItem,
        url: window.URL.createObjectURL(fileItem.raw), // 创建本地预览URL
      };
    }
    return fileItem;
  });

  uploadFiles.value = updatedFileList;
};

// 处理文件下载
const handleFileDownload = async (file: any) => {
  try {
    const fileId = file.id || file.response?.id;
    if (!fileId) {
      ElMessage.warning('文件ID不存在，无法下载');
      return;
    }

    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('未登录，无法下载文件');
      return;
    }

    // 使用fetch下载，将token放在请求头中
    const baseUrl = import.meta.env.VITE_API_URL_8085 || '/api/v1';
    const response = await fetch(`${baseUrl}/file/download/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('下载失败，服务器返回错误');
    }

    // 获取文件名 - 优先使用originalFileName字段
    let fileName =
      file.originalFileName || file.fileName || file.name || '文件下载';

    // 尝试从响应头获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      // 尝试多种Content-Disposition格式匹配
      const filenamePatterns = [
        /filename="([^"]+)"/, // filename="xxx" 格式
        /filename=([^;\s]+)/, // filename=xxx 格式（无引号）
        /filename\*=UTF-8''([^;]+)/, // filename*=UTF-8''xxx 格式
      ];

      for (const pattern of filenamePatterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          // 解码URL编码的文件名
          let headerFileName = decodeURIComponent(match[1]);
          // 移除可能的引号
          headerFileName = headerFileName.replaceAll(/^['"]|['"]$/g, '');
          // 只有当响应头中的文件名有效时才使用
          if (
            headerFileName &&
            headerFileName !== 'null' &&
            headerFileName !== 'undefined'
          ) {
            fileName = headerFileName;
          }
          break;
        }
      }
    }

    // 处理文件内容
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.append(a);
    a.click();

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 100);

    ElMessage.success('文件下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
  ];
  return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
};

// 检测本机局域网IP地址
const detectLocalIP = async () => {
  try {
    console.log('开始检测本机IP地址...');
    
    // 方法1: 通过WebRTC获取本地IP
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    const offer = await rtc.createOffer();
    await rtc.setLocalDescription(offer);
    
    return new Promise<string>((resolve) => {
      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match && !match[1].startsWith('127.')) {
            rtc.close();
            const ip = match[1];
            console.log(`检测到本机IP: ${ip}`);
            mobileUploadConfig.value.ip = ip;
            resolve(ip);
          }
        }
      };
      
      // 超时处理
      setTimeout(() => {
        rtc.close();
        console.log('IP检测超时，请手动设置IP地址');
        resolve('');
      }, 3000);
    });
  } catch (error: any) {
    console.error(`IP检测失败: ${error.message}`);
    return '';
  }
};

// 生成文件预览URL的函数
const generateFilePreviewUrl = async (fileId: number, fileData: any) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('未登录，无法生成文件预览URL');
      return;
    }

    const previewUrl = `/api/v1/file/preview/${fileId}`;
    const response = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`生成预览URL失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    const localUrl = window.URL.createObjectURL(blob);
    
    // 将生成的预览URL赋值给文件数据对象
    fileData.localPreviewUrl = localUrl;
  } catch (error) {
    console.error('生成文件预览URL失败:', error);
  }
};

const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text',
    docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    ppt: 'lucide:presentation',
    pptx: 'lucide:presentation',
    txt: 'lucide:file',
    zip: 'lucide:archive',
    rar: 'lucide:archive',
    '7z': 'lucide:archive',
  };
  return iconMap[ext] || 'lucide:file';
};

const handleImagePreview = async (file: any) => {
  try {
    const fileId = file.id || file.response?.id;
    if (!fileId) {
      ElMessage.warning('文件ID不存在，无法预览');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('未登录，无法预览文件');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL_8085 || '/api/v1';

    // 获取当前图片在图片列表中的索引
    const allImageFiles = uploadFiles.value.filter((f) => isImageFile(f.name));
    const index = allImageFiles.findIndex((f) => f.uid === file.uid);

    // 构建包含所有图片预览URL的列表（使用fetch获取并添加Authorization头）
    currentPreviewIndex.value = index;
    imagePreviewList.value = await Promise.all(
      allImageFiles.map(async (f) => {
        const fId = f.id || f.response?.id;
        if (!fId) return '';

        const previewUrl = `${baseUrl}/file/preview/${fId}`;
        try {
          // 使用fetch获取文件内容，添加Authorization头
          const response = await fetch(previewUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`预览失败: ${response.statusText}`);
          }

          // 获取文件Blob并创建本地URL
          const blob = await response.blob();
          return window.URL.createObjectURL(blob);
        } catch (error) {
          console.error('获取图片失败:', error);
          return '';
        }
      }),
    );

    showImageViewer.value = true;
  } catch (error: any) {
    console.error('预览失败:', error);
    ElMessage.error(error.message || '文件预览失败');
  }
};

const handleFilePreview = async (file: any) => {
  try {
    // 处理不同结构的文件对象
    const fileId = file.id || file.response?.id;
    if (!fileId) {
      ElMessage.warning('文件ID不存在，无法预览');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('未登录，无法预览文件');
      return;
    }

    // 检查是否为图片文件
    const fileName = file.name || file.fileName || file.originalFileName;
    const previewUrl = `/api/v1/file/preview/${fileId}`;

    // 使用fetch获取文件内容，添加Authorization头
    const response = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`预览失败: ${response.statusText}`);
    }

    // 获取文件Blob
    const blob = await response.blob();
    // 创建本地URL
    const localUrl = window.URL.createObjectURL(blob);

    if (isImageFile(fileName)) {
      // 图片文件使用图片预览器
      imagePreviewList.value = [localUrl];
      currentPreviewIndex.value = 0;
      showImageViewer.value = true;
    } else {
      // 非图片文件使用iframe预览
      previewFileUrl.value = localUrl;
      previewFileName.value = fileName;
      previewDialogVisible.value = true;
    }
  } catch (error: any) {
    console.error('预览失败:', error);
    ElMessage.error(error.message || '文件预览失败');
  }
};

const handlePreviewClose = () => {
  // 清理创建的URL对象，避免内存泄漏
  if (previewFileUrl.value) {
    window.URL.revokeObjectURL(previewFileUrl.value);
  }
  previewDialogVisible.value = false;
  previewFileUrl.value = '';
  previewFileName.value = '';
};

const initializeSortable = () => {
  if (!fileListContainer.value) return;

  // 使用sortablejs直接初始化
  Sortable.create(fileListContainer.value, {
    animation: 300,
    delay: 400,
    delayOnTouchOnly: true,
    handle: '.file-drag-handle',
    onEnd: (evt: any) => {
      const { oldIndex, newIndex } = evt;
      if (
        oldIndex !== undefined &&
        newIndex !== undefined &&
        oldIndex !== newIndex
      ) {
        const movedItem = uploadFiles.value.splice(oldIndex, 1)[0];
        uploadFiles.value.splice(newIndex, 0, movedItem);
      }
    },
  });
};

watch(
  () => uploadFiles.value.length,
  () => {
    nextTick(() => {
      initializeSortable();
    });
  },
);

// 为每个模块添加展开状态
const expandedModules = ref<Record<string, boolean>>({});
// 为每个模块添加完成状态
const completedModules = ref<Record<string, boolean>>({});

// 存储每个阶段的动画进度值
const animatedProgress = ref<Record<number, number>>({});

// 初始化动画进度值
const initAnimatedProgress = () => {
  stages.forEach((_, index) => {
    animatedProgress.value[index] = getStageProgress(index);
  });
};

// 切换模块完成状态
const toggleModuleComplete = async (moduleId: string) => {
  const module = currentStage.value.modules.find((m) => m.id === moduleId);
  if (!module?.task) {
    ElMessage.warning('任务不存在，无法标记完成状态');
    return;
  }

  const newStatus = completedModules.value[moduleId]
    ? 'IN_PROGRESS'
    : 'COMPLETED';

  try {
    const response = await CaseTaskApi.updateCaseTask(module.task.id, {
      status: newStatus,
    });

    if (response.code === 200) {
      completedModules.value[moduleId] = !completedModules.value[moduleId];
      // 更新模块的任务状态，确保界面立即反映变化
      module.task.status = newStatus;
      updateAllAnimatedProgress();
      ElMessage.success(
        completedModules.value[moduleId] ? '已标记为完成' : '已取消完成标记',
      );
    } else {
      ElMessage.error(response.message || '更新任务状态失败');
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
    ElMessage.error('更新任务状态失败');
  }
};

// 更新所有阶段的动画进度
const updateAllAnimatedProgress = () => {
  stages.forEach((_, index) => {
    animateProgress(index);
  });
};

// 单个阶段的进度动画
const animateProgress = (stageIndex: number) => {
  const targetProgress = getStageProgress(stageIndex);
  const currentProgress = animatedProgress.value[stageIndex] || 0;

  // 如果当前值已经等于目标值，无需动画
  if (currentProgress === targetProgress) {
    return;
  }

  // 计算每次动画的增量
  const increment = currentProgress < targetProgress ? 1 : -1;

  // 使用setInterval实现1%、1%的缓慢变化
  const timer = setInterval(() => {
    const current = animatedProgress.value[stageIndex] || 0;

    if (
      (increment > 0 && current >= targetProgress) ||
      (increment < 0 && current <= targetProgress)
    ) {
      // 动画完成，设置为目标值并清除定时器
      animatedProgress.value[stageIndex] = targetProgress;
      clearInterval(timer);
      return;
    }

    // 每次增加或减少1%
    animatedProgress.value[stageIndex] = current + increment;
  }, 50); // 每50毫秒更新一次，控制动画速度
};

// 初始化附件拖动排序
const initAttachmentSortable = () => {
  // 销毁之前的实例
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  // 如果没有选中的数据项或没有附件元素，直接返回
  if (!selectedDataItem.value || !selectedDataItem.value.files) {
    return;
  }

  // 获取附件网格元素
  const gridElement = attachmentsGridRef.value;
  if (!gridElement) {
    return;
  }

  // 初始化Sortable实例
  sortableInstance = Sortable.create(gridElement, {
    // 长按1000ms触发拖动
    delay: 1000,
    // 拖动时的动画时间
    animation: 150,
    // 拖动结束后的回调
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      ) {
        return;
      }

      // 更新文件顺序
      const files = [...selectedDataItem.value.files];
      const [movedFile] = files.splice(oldIndex, 1);
      files.splice(newIndex, 0, movedFile);
      selectedDataItem.value.files = files;

      ElMessage.success('图片顺序已更新');
    },
    // 拖动时的类名
    ghostClass: 'sortable-ghost',
    // 拖动时被选中元素的类名
    chosenClass: 'sortable-chosen',
    // 拖动时拖拽项的类名
    dragClass: 'sortable-drag',
  });
};

// 监听selectedDataItem变化，初始化拖动排序
watch(
  selectedDataItem,
  () => {
    // 延迟初始化，确保DOM已更新
    setTimeout(initAttachmentSortable, 100);
  },
  { deep: true },
);

// 监听completedModules变化，更新动画进度
watch(
  completedModules,
  () => {
    updateAllAnimatedProgress();
  },
  { deep: true },
);

// 组件挂载时加载所有阶段的数据并初始化动画进度
onMounted(async () => {
  // 检测移动端和微信浏览器
  const userAgent = navigator.userAgent;
  isWeChatBrowser.value = /MicroMessenger/i.test(userAgent);
  
  // 自动检测本机IP地址
  if (mobileUploadConfig.value.autoDetect) {
    await detectLocalIP();
  }
  
  // 加载所有阶段的数据
  await loadAllStageData();
  // 初始化并动画显示所有阶段的进度条
  updateAllAnimatedProgress();
  // 初始化选中第一个模块
  if (currentStage.value.modules.length > 0) {
    selectedModule.value = currentStage.value.modules[0];
    selectedDataItem.value = 
      currentStage.value.modules[0].data.length > 0
        ? currentStage.value.modules[0].data[0]
        : null;
  }
  
  // 初始化WebSocket连接
  connectWebSocket();
});

// 加载所有阶段的数据（优化版本：批量接口 + 懒加载图片预览）
const loadAllStageData = async () => {
  loading.value = true;
  isLoadingStage.value = true;
  try {
    const startTime = Date.now();
    console.log('[性能优化] 开始加载所有阶段数据');

    // 1. 获取所有任务数据
    const response = await CaseTaskApi.getCaseTasks({
      caseId: Number(props.caseId),
      page: 1,
      size: 100,
    });

    if (response.code === 200 && response.data) {
      console.log(
        `[性能优化] 获取任务列表完成，耗时: ${Date.now() - startTime}ms，任务数: ${response.data.content.length}`,
      );

      // 清空所有阶段的模块数据
      stages.forEach((stage) => {
        stage.modules.forEach((module) => {
          module.data = [];
          module.task = null;
        });
      });

      // 2. 批量获取所有任务的提交记录
      const caseTaskIds = response.data.content.map((task) => task.id);
      const submissionsBatchResponse =
        await CaseTaskSubmissionApi.getLatestSubmissionsBatch({ caseTaskIds });

      if (
        submissionsBatchResponse.code === 200 &&
        submissionsBatchResponse.data
      ) {
        console.log(
          `[性能优化] 批量获取提交记录完成，耗时: ${Date.now() - startTime}ms`,
        );

        // 3. 批量获取所有提交的文件
        const allSubmissions = Object.values(
          submissionsBatchResponse.data,
        ).flat();
        const submissionIds = allSubmissions.map((submission) => submission.id);

        let filesBatchResponse;
        if (submissionIds.length > 0) {
          filesBatchResponse =
            await CaseTaskSubmissionApi.getSubmissionFilesBatch({
              submissionIds,
            });
          console.log(
            `[性能优化] 批量获取文件列表完成，耗时: ${Date.now() - startTime}ms`,
          );
        }

        // 4. 分配数据到对应的模块
        response.data.content.forEach((task) => {
          for (const stage of stages) {
            const module = stage.modules.find(
              (m) =>
                m.title.includes(task.taskName) ||
                task.taskName.includes(m.title),
            );

            if (module) {
              module.task = task;
              completedModules.value[module.id] = task.status === 'COMPLETED';

              // 获取该任务的提交记录
              const taskSubmissions =
                submissionsBatchResponse.data[task.id] || [];

              // 处理每个提交记录
              module.data = taskSubmissions.map((submission) => {
                // 获取该提交的文件列表
                const submissionFiles =
                  filesBatchResponse?.data?.[submission.id] || [];

                // 构建文件基础信息，并为图片文件自动生成预览URL
                const files = submissionFiles.map((f) => {
                  const fileData = {
                    id: f.id,
                    fileName: f.originalFileName,
                    originalFileName: f.originalFileName,
                    filePath: f.filePath,
                    fileSize: f.fileSize,
                    uploadTime: f.uploadTime,
                    uploadUserName: f.uploadUserName,
                    sortOrder: f.sortOrder,
                  };
                  
                  // 为图片文件自动生成预览URL
                  if (isImageFile(f.originalFileName)) {
                    // 异步生成预览URL，但不阻塞渲染
                    generateFilePreviewUrl(f.id, fileData);
                  }
                  
                  return fileData;
                });

                return {
                  id: submission.id,
                  title: submission.submissionTitle,
                  content: submission.submissionContent,
                  creator: submission.creatorName,
                  date: submission.createTime
                    ? new Date(submission.createTime)
                        .toISOString()
                        .split('T')[0]
                    : '',
                  files,
                  status: submission.status,
                  submissionNumber: submission.submissionNumber,
                  createTime: submission.createTime,
                  updateTime: submission.updateTime,
                  taskId: task.id,
                };
              });

              break;
            }
          }
        });
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[性能优化] 所有阶段数据加载完成，总耗时: ${totalTime}ms`);
  } catch (error) {
    console.error('[性能优化] 加载所有阶段数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
    isLoadingStage.value = false;
  }
};

// 处理数据项点击事件
const handleDataItemClick = async (
  item: any,
  module: any,
  isSave: boolean = false,
) => {
  isEditMode.value = true;
  currentItem.value = item;
  currentModule.value = module;
  currentStageIndex.value = activeStage.value;

  formData.value = {
    title: item.title,
    content: item.content,
    date: item.date,
  };

  // 获取token
  const token = localStorage.getItem('token');

  // 处理每个附件，调用API获取预览
  uploadFiles.value = item.files
    ? await Promise.all(
        item.files.map(async (file: any) => {
          // 基础文件信息
          const baseFile = {
            uid: Date.now() + Math.random(),
            name: file.fileName || file.originalFileName,
            status: 'success',
            id: file.id, // 保存文件ID用于预览
            response: file,
          };

          // 如果没有token或fileId，直接返回基础文件
          if (!token || !file.id) {
            return baseFile;
          }

          try {
            // 使用指定的API接口获取文件预览
            const previewUrl = `/api/v1/file/preview/${file.id}`;

            // 使用fetch获取文件内容，添加Authorization头
            const response = await fetch(previewUrl, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              // 获取文件Blob
              const blob = await response.blob();

              // 创建本地URL用于预览
              const localUrl = window.URL.createObjectURL(blob);

              // 创建File对象
              const newFile = new File(
                [blob],
                file.fileName || file.originalFileName,
                { type: blob.type },
              );

              // 返回带有预览URL的文件对象
              return {
                ...baseFile,
                url: localUrl,
                raw: newFile,
                response: {
                  ...file,
                  filePath: localUrl,
                },
              };
            }

            console.error(
              `获取文件ID ${file.id} 的预览失败:`,
              response.statusText,
            );
            return baseFile;
          } catch (error) {
            console.error(`获取文件ID ${file.id} 的预览失败:`, error);
            return baseFile;
          }
        }),
      )
    : [];

  // 直接设置activeTab，避免ElTabs初始渲染时modelValue为undefined
  activeTab.value = 'basic';
  showAddDialog.value = true;
};

const toggleModule = (moduleId: string) => {
  expandedModules.value[moduleId] = !expandedModules.value[moduleId];
};

// 计算每个阶段的进度百分比
const getStageProgress = (stageIndex: number) => {
  const stage = stages[stageIndex];
  if (!stage || !stage.modules || stage.modules.length === 0) {
    return 0;
  }

  // 计算已完成的模块数量
  let completedCount = 0;
  stage.modules.forEach((module) => {
    if (completedModules.value[module.id]) {
      completedCount++;
    }
  });

  // 计算进度百分比
  return Math.round((completedCount / stage.modules.length) * 100);
};

const stages = [
  {
    title: '一、破产申请与受理',
    icon: 'lucide:file-plus',
    color: '#409EFF',
    modules: [
      {
        id: '1-1',
        title: '提交破产申请材料',
        description: '申请人向法院提交破产申请书及相关证据材料',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-2',
        title: '法院立案形式审查',
        description: '法院立案庭对破产申请进行形式审查',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-3',
        title: '破产原因实质审查',
        description: '法院破产审判庭对破产原因进行实质审查',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-4',
        title: '同步选任管理人',
        description: '法院在受理破产申请的同时指定管理人',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-5',
        title: '裁定受理并公告',
        description: '法院裁定受理破产申请并发布公告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '二、接管与调查',
    icon: 'lucide:briefcase',
    color: '#67C23A',
    modules: [
      {
        id: '2-1',
        title: '全面接管债务人',
        description: '管理人全面接管债务人的财产、印章和账簿、文书等资料',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-2',
        title: '调查财产及经营状况',
        description: '管理人调查债务人的财产状况和经营状况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-3',
        title: '决定合同继续履行或解除',
        description: '管理人决定继续履行或者解除债务人未履行完毕的合同',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-4',
        title: '追收债务人财产',
        description: '管理人追收债务人的财产',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '三、债权申报与核查',
    icon: 'lucide:clipboard-list',
    color: '#E6A23C',
    modules: [
      {
        id: '3-1',
        title: '通知已知债权人并公告',
        description: '管理人通知已知债权人并发布债权申报公告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-2',
        title: '接收、登记债权申报',
        description: '管理人接收并登记债权人的债权申报',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-3',
        title: '审查申报债权并编制债权表',
        description: '管理人审查申报的债权并编制债权表',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '四、债权人会议',
    icon: 'lucide:users',
    color: '#F56C6C',
    modules: [
      {
        id: '4-1',
        title: '筹备第一次债权人会议',
        description: '管理人筹备第一次债权人会议',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-2',
        title: '召开会议核查债权与议决事项',
        description: '召开债权人会议核查债权与议决事项',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-3',
        title: '表决通过财产变价/分配方案',
        description: '债权人会议表决通过财产变价方案和分配方案',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '五、破产宣告',
    icon: 'lucide:gavel',
    color: '#909399',
    modules: [
      {
        id: '5-1',
        title: '审查宣告破产条件',
        description: '法院审查宣告债务人破产的条件',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-2',
        title: '裁定宣告债务人破产',
        description: '法院裁定宣告债务人破产',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '六、财产变价与分配',
    icon: 'lucide:banknote',
    color: '#FF6B6B',
    modules: [
      {
        id: '6-1',
        title: '拟定并执行财产变价方案',
        description: '管理人拟定并执行财产变价方案',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-2',
        title: '破产费用与共同利益债务',
        description: '管理人管理破产费用与共同利益债务',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-3',
        title: '执行破产财产分配',
        description: '管理人执行破产财产分配',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '七、程序终结与注销',
    icon: 'lucide:check-circle',
    color: '#4CAF50',
    modules: [
      {
        id: '7-1',
        title: '提请终结破产程序',
        description: '管理人提请法院终结破产程序',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-2',
        title: '法院裁定并公告',
        description: '法院裁定终结破产程序并公告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-3',
        title: '办理企业注销登记',
        description: '管理人办理债务人企业注销登记',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-4',
        title: '管理人终止执行职务并归档',
        description: '管理人终止执行职务并将相关材料归档',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
];

const currentStage = computed(() => stages[activeStage.value]);

const taskStatusMap: Record<string, string> = {
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  REVIEWING: '审核中',
  SKIPPED: '已跳过',
  REJECTED: '已驳回',
};

const submissionStatusMap: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

// 加载指定阶段的数据（优化版本：批量接口 + 懒加载图片预览）
const loadStageData = async (stageIndex: number) => {
  loading.value = true;
  isLoadingStage.value = true;
  try {
    const startTime = Date.now();
    console.log(`[性能优化] 开始加载阶段 ${stageIndex + 1} 数据`);

    const response = await CaseTaskApi.getCaseTasks({
      caseId: Number(props.caseId),
      page: 1,
      size: 100,
    });

    if (response.code === 200 && response.data) {
      console.log(
        `[性能优化] 阶段 ${stageIndex + 1} 获取任务列表完成，耗时: ${Date.now() - startTime}ms`,
      );

      // 清空当前阶段所有模块的数据
      stages[stageIndex].modules.forEach((module) => {
        module.data = [];
        module.task = null;
      });

      // 过滤出当前阶段的任务
      const stageTasks = response.data.content.filter((task) => {
        return stages[stageIndex].modules.some(
          (m) =>
            m.title.includes(task.taskName) || task.taskName.includes(m.title),
        );
      });

      console.log(
        `[性能优化] 阶段 ${stageIndex + 1} 任务数: ${stageTasks.length}`,
      );

      // 批量获取当前阶段所有任务的提交记录
      const caseTaskIds = stageTasks.map(task => task.id);
      const submissionsBatchResponse = await CaseTaskSubmissionApi.getLatestSubmissionsBatch({ caseTaskIds });
      
      if (submissionsBatchResponse.code === 200 && submissionsBatchResponse.data) {
        console.log(`[性能优化] 阶段 ${stageIndex + 1} 批量获取提交记录完成，耗时: ${Date.now() - startTime}ms`);

        // 批量获取当前阶段所有提交的文件
        const allSubmissions = Object.values(submissionsBatchResponse.data).flat();
        const submissionIds = allSubmissions.map(submission => submission.id);
        
        let filesBatchResponse;
        if (submissionIds.length > 0) {
          filesBatchResponse = await CaseTaskSubmissionApi.getSubmissionFilesBatch({ submissionIds });
          console.log(`[性能优化] 阶段 ${stageIndex + 1} 批量获取文件列表完成，耗时: ${Date.now() - startTime}ms`);
        }

        // 分配数据到对应的模块
        stageTasks.forEach((task) => {
          const module = stages[stageIndex].modules.find(
            (m) =>
              m.title.includes(task.taskName) || task.taskName.includes(m.title),
          );

          if (module) {
            module.task = task;
            completedModules.value[module.id] = task.status === 'COMPLETED';

            // 获取该任务的提交记录
            const taskSubmissions = submissionsBatchResponse.data[task.id] || [];
            
            // 处理每个提交记录
            module.data = taskSubmissions.map((submission) => {
              // 获取该提交的文件列表
              const submissionFiles = filesBatchResponse?.data?.[submission.id] || [];

              // 构建文件基础信息，并为图片文件自动生成预览URL
              const files = submissionFiles.map((f) => {
                const fileData = {
                  id: f.id,
                  fileName: f.originalFileName,
                  originalFileName: f.originalFileName,
                  filePath: f.filePath,
                  fileSize: f.fileSize,
                  uploadTime: f.uploadTime,
                  uploadUserName: f.uploadUserName,
                  sortOrder: f.sortOrder,
                };
                
                // 为图片文件自动生成预览URL
                if (isImageFile(f.originalFileName)) {
                  // 异步生成预览URL，但不阻塞渲染
                  generateFilePreviewUrl(f.id, fileData);
                }
                
                return fileData;
              });

              return {
                id: submission.id,
                title: submission.submissionTitle,
                content: submission.submissionContent,
                creator: submission.creatorName,
                date: submission.createTime
                  ? new Date(submission.createTime)
                      .toISOString()
                      .split('T')[0]
                  : '',
                files,
                status: submission.status,
                submissionNumber: submission.submissionNumber,
                createTime: submission.createTime,
                updateTime: submission.updateTime,
                taskId: task.id,
              };
            });
          }
        });
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `[性能优化] 阶段 ${stageIndex + 1} 数据加载完成，总耗时: ${totalTime}ms`,
    );
  } catch (error) {
    console.error(`[性能优化] 加载阶段 ${stageIndex + 1} 数据失败:`, error);
    ElMessage.error('加载阶段数据失败');
  } finally {
    loading.value = false;
    isLoadingStage.value = false;
  }
};

const handleStageChange = (index: number) => {
  const now = Date.now();
  
  // 检查是否正在加载阶段数据
  if (isLoadingStage.value) {
    ElMessage.warning('数据正在加载中，请稍后再切换阶段');
    return;
  }
  
  // 检查是否在1秒内重复点击
  if (now - lastStageChangeTime < STAGE_CHANGE_TIMEOUT) {
    ElMessage.warning('切换过于频繁，请稍后再试');
    return;
  }
  
  lastStageChangeTime = now;
  activeStage.value = index;
  selectedModule.value = currentStage.value.modules[0] || null;
};

const selectModule = (module: any) => {
  selectedModule.value = module;
  selectedDataItem.value = module.data.length > 0 ? module.data[0] : null;
};

const selectDataItem = (item: any) => {
  selectedDataItem.value = item;
};

// 监听阶段变化
watch(activeStage, (newIndex) => {
  loadStageData(newIndex);
});

const openAddDialog = (module: any, stageIndex: number) => {
  // 设置为新增模式
  isEditMode.value = false;
  currentModule.value = module;
  currentStageIndex.value = stageIndex;
  currentItem.value = null;
  formData.value = {
    title: '',
    content: '',
    date: '',
  };
  // 清空上传文件列表
  uploadFiles.value = [];
  // 直接设置activeTab，避免ElTabs初始渲染时modelValue为undefined
  activeTab.value = 'basic';
  showAddDialog.value = true;
};

const handleAddSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (!currentModule.value?.task) {
      ElMessage.error('任务不存在，请先创建任务');
      return;
    }

    let submissionId;

    if (isEditMode.value && currentItem.value) {
      // 编辑模式：使用现有提交ID
      submissionId = currentItem.value.id;
      // 注意：API文档中没有更新提交记录的接口，跳过标题和内容更新
    } else {
      // 新增模式：创建新提交记录
      const createResponse = await CaseTaskSubmissionApi.createSubmission({
        caseTaskId: currentModule.value.task.id,
        submissionTitle: formData.value.title,
        submissionContent: formData.value.content,
        submissionType: 'NORMAL',
      });

      if (createResponse.code !== 200) {
        ElMessage.error(createResponse.message || '创建提交记录失败');
        return;
      }

      submissionId = createResponse.data.submissionId;
    }

    // 上传文件：只上传没有id的本地文件
    if (uploadFiles.value.length > 0) {
      const uploadedFiles = [];

      // 上传本地文件（没有id的文件）
      for (let index = 0; index < uploadFiles.value.length; index++) {
        const file = uploadFiles.value[index];
        if (file.raw && !file.id) {
          // 上传本地文件，传递排序序号
          const uploadResponse =
            await CaseTaskSubmissionApi.uploadSubmissionFile(
              submissionId,
              file.raw,
              undefined,
              index + 1,
            );
          uploadedFiles.push(uploadResponse.data);
        }
      }

      // 上传完成后，调用批量更新排序接口，确保所有文件排序正确
      try {
        // 构建排序请求数据：包含所有文件（已上传的和新上传的）
        const sortRequest = uploadFiles.value
          .map((file, index) => {
            // 查找新上传的文件，使用返回的fileId
            const uploadedFile = uploadedFiles.find(
              (uf) => uf.originalFileName === file.name,
            );
            return {
              fileId: file.id || uploadedFile?.id,
              sortOrder: index + 1,
            };
          })
          .filter((item) => item.fileId !== undefined); // 只包含有fileId的文件

        if (sortRequest.length > 0) {
          await CaseTaskSubmissionApi.updateFileSortOrder(
            submissionId,
            sortRequest,
          );
          // 排序更新成功，后续会在保存成功后统一刷新文件数据
        }
      } catch (error) {
        console.error('更新文件排序失败:', error);
        ElMessage.warning('文件排序更新失败，但文件已成功上传');
      }
    }

    ElMessage.success('提交成功');
    showAddDialog.value = false;

    // 只刷新当前数据项的文件数据，不需要重新加载整个阶段
    if (currentItem.value && currentModule.value) {
      try {
        // 重新获取当前数据项的文件列表，确保显示最新的排序
        const filesResponse = await CaseTaskSubmissionApi.getSubmissionFiles(
          currentItem.value.id,
        );
        if (filesResponse.code === 200 && filesResponse.data) {
          let updatedFiles = filesResponse.data;

          // 获取token用于后续请求
          const token = localStorage.getItem('token');

          // 处理文件，为图片类型添加本地预览URL
          if (token) {
            updatedFiles = await Promise.all(
              updatedFiles.map(async (f: any) => {
                const fileData = {
                  id: f.id,
                  fileName: f.originalFileName,
                  originalFileName: f.originalFileName,
                  filePath: f.filePath,
                  fileSize: f.fileSize,
                  uploadTime: f.uploadTime,
                  uploadUserName: f.uploadUserName,
                  // 移除previewUrl字段，防止直接访问导致401错误
                };

                // 检查是否为图片文件
                if (
                  f.originalFileName &&
                  (f.originalFileName.toLowerCase().endsWith('.jpg') ||
                    f.originalFileName.toLowerCase().endsWith('.jpeg') ||
                    f.originalFileName.toLowerCase().endsWith('.png') ||
                    f.originalFileName.toLowerCase().endsWith('.gif') ||
                    f.originalFileName.toLowerCase().endsWith('.webp'))
                ) {
                  try {
                    // 调用API获取图片，添加JWT令牌
                    const previewUrl = `/api/v1/file/preview/${f.id}`;
                    const response = await fetch(previewUrl, {
                      method: 'GET',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });

                    if (response.ok) {
                      // 转换为Blob URL用于本地预览
                      const blob = await response.blob();
                      fileData.localPreviewUrl =
                        window.URL.createObjectURL(blob);
                    }
                  } catch (error) {
                    console.error(`获取图片ID ${f.id} 的预览失败:`, error);
                  }
                }

                return fileData;
              }),
            );
          }

          // 更新当前数据项的文件列表
          currentItem.value.files = updatedFiles;

          // 同时更新选中的数据项，确保界面立即显示最新的排序
          if (
            selectedDataItem.value &&
            selectedDataItem.value.id === currentItem.value.id
          ) {
            selectedDataItem.value.files = updatedFiles;
          }

          // 也更新模块数据中的对应项
          const moduleIndex = stages[currentStageIndex.value].modules.findIndex(
            (m) => m.id === currentModule.value.id,
          );
          if (moduleIndex !== -1) {
            const itemIndex = stages[currentStageIndex.value].modules[
              moduleIndex
            ].data.findIndex((item) => item.id === currentItem.value.id);
            if (itemIndex !== -1) {
              stages[currentStageIndex.value].modules[moduleIndex].data[
                itemIndex
              ].files = updatedFiles;
            }
          }
        }
      } catch (error) {
        console.error('刷新文件数据失败:', error);
      }
    } else if (currentModule.value && !currentItem.value) {
      // 新增模式：找到新创建的数据项并更新
      await loadStageData(currentStageIndex.value);

      // 重新选择当前模块和数据项
      const refreshedModule = stages[currentStageIndex.value].modules.find(
        (m) => m.id === currentModule.value.id,
      );
      if (refreshedModule && refreshedModule.data.length > 0) {
        selectedModule.value = refreshedModule;
        // 选择最新的一个数据项（刚刚创建的）
        selectedDataItem.value =
          refreshedModule.data[refreshedModule.data.length - 1];
      }
    }
  } catch (error: any) {
    if (
      error &&
      typeof error === 'object' &&
      ('title' in error || 'content' in error)
    ) {
      console.warn('表单验证失败:', error);
    } else {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  }
};

const handleDelete = async (module: any, item: any) => {
  // 显示确认框
  ElMessageBox.confirm('确定要删除这条记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await CaseTaskSubmissionApi.deleteSubmission(item.id);

        if (response.code === 200) {
          const index = module.data.findIndex((d: any) => d.id === item.id);
          if (index !== -1) {
            module.data.splice(index, 1);
          }
          ElMessage.success('删除成功');
        } else {
          ElMessage.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      // 用户取消删除
      ElMessage.info('已取消删除');
    });
};

const goBack = () => {
  router.back();
};

// 打开手机上传二维码弹窗
const openMobileUploadDialog = async () => {
  if (!currentItem.value) {
    ElMessage.warning('请先选择或创建一个任务提交记录');
    return;
  }
  
  // 自动检测本地IP地址
  if (mobileUploadConfig.value.autoDetect && !mobileUploadConfig.value.ip) {
    await detectLocalIP();
  }
  
  // 生成随机的上传会话ID
  const uploadSessionId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // 生成二维码URL，包含当前页面的信息、上传会话ID和任务提交ID
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
  
  const mobileUploadUrl = `${baseUrl}/websocket-test?mode=upload&bizType=CASE_TASK_SUBMISSION&bizId=${currentItem.value.id}&caseId=${props.caseId}&sessionId=${uploadSessionId}`;
  console.log(`生成的二维码URL: ${mobileUploadUrl}`);

  qrCodeUrl.value = mobileUploadUrl;
  qrCodeExpireTime.value = 300; // 5分钟过期
  showQrCodeDialog.value = true;

  // 开始轮询检查上传状态
  startQrCodePolling(uploadSessionId);
};

// 保存文件排序
const saveFileSortOrder = async () => {
  if (!currentItem.value || uploadFiles.value.length <= 1) {
    return;
  }

  try {
    const submissionId = currentItem.value.id;

    // 构建排序请求数据
    const sortRequest = {
      files: uploadFiles.value.map((file, index) => ({
        fileId: file.id,
        sortOrder: index + 1,
      })),
    };

    // 调用批量更新排序的API
    await CaseTaskSubmissionApi.updateFileSortOrder(
      submissionId,
      sortRequest.files,
    );

    ElMessage.success('文件排序已保存');
  } catch (error) {
    console.error('保存文件排序失败:', error);
    ElMessage.error('保存文件排序失败');
  }
};

// WebSocket连接和消息处理
import { useWebSocket } from '../../../hooks/useWebSocket';

// 初始化WebSocket连接
const { connectWebSocket, disconnectWebSocket, sendMessage, isConnected } = useWebSocket();

// 监听WebSocket消息
const handleWebSocketMessage = (message: any) => {
  if (message.type === 'FILE_UPLOAD_SUCCESS' && message.data) {
    ElMessage.success(`文件上传成功: ${message.data.fileName}`);
    // 刷新当前任务提交的文件列表
    if (currentItem.value) {
      refreshSubmissionFiles(currentItem.value.id);
    }
  } else if (message.type === 'FILE_DELETE_SUCCESS') {
    ElMessage.success('文件删除成功');
    // 刷新当前任务提交的文件列表
    if (currentItem.value) {
      refreshSubmissionFiles(currentItem.value.id);
    }
  }
};

// 刷新任务提交的文件列表
const refreshSubmissionFiles = async (submissionId: number) => {
  try {
    const filesResponse = await CaseTaskSubmissionApi.getSubmissionFiles(submissionId);
    if (filesResponse.code === 200 && filesResponse.data) {
      let updatedFiles = filesResponse.data;

      // 获取token用于后续请求
      const token = localStorage.getItem('token');

      // 处理文件，为图片类型添加本地预览URL
      if (token) {
        updatedFiles = await Promise.all(
          updatedFiles.map(async (f: any) => {
            const fileData = {
              id: f.id,
              fileName: f.originalFileName,
              originalFileName: f.originalFileName,
              filePath: f.filePath,
              fileSize: f.fileSize,
              uploadTime: f.uploadTime,
              uploadUserName: f.uploadUserName,
              // 移除previewUrl字段，防止直接访问导致401错误
            };

            // 检查是否为图片文件
            if (
              f.originalFileName &&
              (f.originalFileName.toLowerCase().endsWith('.jpg') ||
                f.originalFileName.toLowerCase().endsWith('.jpeg') ||
                f.originalFileName.toLowerCase().endsWith('.png') ||
                f.originalFileName.toLowerCase().endsWith('.gif') ||
                f.originalFileName.toLowerCase().endsWith('.webp'))
            ) {
              try {
                // 调用API获取图片，添加JWT令牌
                const previewUrl = `/api/v1/file/preview/${f.id}`;
                const response = await fetch(previewUrl, {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  // 转换为Blob URL用于本地预览
                  const blob = await response.blob();
                  fileData.localPreviewUrl = window.URL.createObjectURL(blob);
                }
              } catch (error) {
                console.error(`获取图片ID ${f.id} 的预览失败:`, error);
              }
            }

            return fileData;
          }),
        );
      }

      // 更新当前数据项的文件列表
      if (currentItem.value && currentItem.value.id === submissionId) {
        currentItem.value.files = updatedFiles;
        
        // 同时更新上传文件列表
        uploadFiles.value = updatedFiles.map((file: any) => ({
          uid: Date.now() + Math.random(),
          name: file.fileName || file.originalFileName,
          status: 'success',
          id: file.id,
          url: file.localPreviewUrl,
          response: file,
        }));

        // 更新选中的数据项
        if (selectedDataItem.value && selectedDataItem.value.id === submissionId) {
          selectedDataItem.value.files = updatedFiles;
        }

        // 更新模块数据中的对应项
        stages.forEach((stage) => {
          stage.modules.forEach((module) => {
            const itemIndex = module.data.findIndex((item: any) => item.id === submissionId);
            if (itemIndex !== -1) {
              module.data[itemIndex].files = updatedFiles;
            }
          });
        });
      }
    }
  } catch (error) {
    console.error('刷新文件数据失败:', error);
  }
};

// 开始轮询检查手机上传状态
const startQrCodePolling = (sessionId: string) => {
  // 清除之前的轮询
  if (qrCodePolling.value) {
    clearInterval(qrCodePolling.value);
    qrCodePolling.value = null;
  }

  // 每1秒轮询一次
  qrCodePolling.value = setInterval(async () => {
    try {
      // 这里应该调用后端API检查上传状态
      // 暂时使用模拟数据
      console.log('检查上传状态:', sessionId);

      // 模拟5分钟后二维码过期
      if (qrCodeExpireTime.value <= 0) {
        clearInterval(qrCodePolling.value!);
        qrCodePolling.value = null;
        ElMessage.warning('二维码已过期，请重新生成');
        showQrCodeDialog.value = false;
        return;
      }

      qrCodeExpireTime.value--;
    } catch (error) {
      console.error('轮询上传状态失败:', error);
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
</script>

<template>
  <div>
    <div class="process-content">
      <div class="stage-tabs">
        <div
          v-for="(stage, index) in stages"
          :key="index"
          class="stage-tab-item"
          :class="{
            active: activeStage === index,
            'initial-stage': index === initialStage,
          }"
          @click="handleStageChange(index)"
        >
          <!-- 当前进度文字 - 仅初始阶段显示 -->
          <div v-if="index === initialStage" class="current-progress-text">
            当前进度
          </div>

          <div class="stage-progress-container">
            <div class="stage-progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <!-- 背景圆环 - 修改为白色 -->
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="6"
                  stroke-linejoin="round"
                />
                <!-- 进度圆环 - 使用阶段特定颜色 -->
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  :stroke="stage.color"
                  stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 25"
                  :stroke-dashoffset="
                    2 * Math.PI * 25 -
                    (2 * Math.PI * 25 * (animatedProgress[index] || 0)) / 100
                  "
                  transform="rotate(-90 30 30)"
                  class="progress-ring-circle"
                />
              </svg>
              <div
                class="stage-tab-icon"
                :style="{ backgroundColor: stage.color }"
              >
                <Icon :icon="stage.icon" />
              </div>
            </div>
          </div>

          <!-- 阶段进度条 -->
          <div class="stage-progress-bar-container">
            <div class="stage-progress-bar">
              <div
                class="stage-progress-bar-fill"
                :style="{
                  width: `${animatedProgress[index] || 0}%`,
                  backgroundColor: stage.color,
                }"
              ></div>
            </div>
            <div class="stage-progress-text">
              {{ animatedProgress[index] || 0 }}%
            </div>
          </div>

          <div class="stage-tab-title">{{ stage.title }}</div>
        </div>
      </div>

      <div class="stage-modules-container">
        <div class="stage-modules-sidebar">
          <div class="sidebar-header">
            <h3>{{ currentStage.title }} - 模块列表</h3>
          </div>
          <div v-loading="loading" class="sidebar-modules">
            <div
              v-for="module in currentStage.modules"
              :key="module.id"
              class="sidebar-module-item"
              :class="{ active: selectedModule?.id === module.id }"
              @click="selectModule(module)"
            >
              <div class="sidebar-module-content">
                <div class="sidebar-module-title">{{ module.title }}</div>
                <ElTag
                  v-if="module.task"
                  :type="
                    module.task.status === 'COMPLETED'
                      ? 'success'
                      : module.task.status === 'IN_PROGRESS'
                        ? 'primary'
                        : 'info'
                  "
                  size="small"
                >
                  {{ taskStatusMap[module.task.status] || module.task.status }}
                </ElTag>
              </div>
              <div class="sidebar-module-status">
                <div
                  v-if="completedModules[module.id]"
                  class="status-completed"
                >
                  <Icon icon="lucide:check" />
                </div>
                <div v-else class="status-pending">
                  <Icon icon="lucide:circle" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stage-modules-content">
          <div v-if="selectedModule" class="module-detail">
            <!-- 第三阶段的债权申报与核查模块 -->
            <div v-if="activeStage === 2 && (selectedModule.id === '3-2' || selectedModule.id === '3-3')">
              <ClaimProcessingModules 
                :caseId="caseId" 
                :moduleType="selectedModule.id === '3-2' ? 'registration' : 'review'" 
              />
            </div>
            <!-- 其他模块 -->
            <ElCard v-else class="module-detail-card" shadow="hover">
              <template #header>
                <div class="module-detail-header">
                  <div class="module-info-section">
                    <div class="module-title-row">
                      <div class="module-title">{{ selectedModule.title }}</div>
                      <ElTag
                        v-if="selectedModule.task"
                        :type="
                          selectedModule.task.status === 'COMPLETED'
                            ? 'success'
                            : selectedModule.task.status === 'IN_PROGRESS'
                              ? 'primary'
                              : 'info'
                        "
                        size="small"
                        style="margin-left: 8px"
                      >
                        {{
                          taskStatusMap[selectedModule.task.status] ||
                          selectedModule.task.status
                        }}
                      </ElTag>
                    </div>
                    <div class="module-description-inline">
                      {{ selectedModule.description }}
                    </div>
                  </div>
                  <div class="module-status-actions">
                    <div
                      v-if="completedModules[selectedModule.id]"
                      class="module-completed"
                    >
                      <Icon icon="lucide:check" class="completed-icon" />
                      <span class="completed-text">已完成</span>
                      <ElButton
                        type="danger"
                        size="small"
                        text
                        @click="toggleModuleComplete(selectedModule.id)"
                      >
                        撤回
                      </ElButton>
                    </div>
                    <div v-else class="module-actions">
                      <ElButton
                        type="primary"
                        size="small"
                        @click="toggleModuleComplete(selectedModule.id)"
                      >
                        <Icon icon="lucide:check" class="mr-1" />
                        标记完成
                      </ElButton>
                      <ElButton
                        type="success"
                        size="small"
                        @click="openAddDialog(selectedModule, activeStage)"
                      >
                        <Icon icon="lucide:plus" class="mr-1" />
                        新增
                      </ElButton>
                    </div>
                  </div>
                </div>
              </template>

              <div class="module-data-container">
                <div
                  v-if="selectedModule.data.length > 0"
                  class="data-tabs-container"
                >
                  <div class="data-tabs">
                    <div
                      v-for="(item, index) in selectedModule.data"
                      :key="item.id"
                      class="data-tab-item"
                      :class="{ active: selectedDataItem?.id === item.id }"
                      @click="selectDataItem(item)"
                    >
                      <div class="data-tab-title">{{ item.title }}</div>
                    </div>
                    <!-- 删除按钮和保存按钮放在标签栏最右边 -->
                    <div class="data-tabs-actions">
                      <ElButton
                        v-if="selectedDataItem"
                        type="danger"
                        size="small"
                        @click="handleDelete(selectedModule, selectedDataItem)"
                      >
                        <Icon icon="lucide:trash-2" class="mr-1" />
                        删除
                      </ElButton>
                      <ElButton
                        v-if="selectedDataItem"
                        type="primary"
                        size="small"
                        @click="
                          handleDataItemClick(
                            selectedDataItem,
                            selectedModule,
                            true,
                          )
                        "
                      >
                        <Icon icon="lucide:save" class="mr-1" />
                        编辑
                      </ElButton>
                    </div>
                  </div>

                  <transition name="fade" mode="out-in">
                    <div
                      v-if="selectedDataItem"
                      class="data-tab-content"
                      :key="selectedDataItem.id"
                    >
                      <div class="data-content-detail">
                        <div class="data-row">
                          <span class="data-label">日期:</span>
                          <span class="data-value">{{
                            selectedDataItem.date
                          }}</span>
                        </div>
                        <div
                          v-if="
                            selectedDataItem.files &&
                            selectedDataItem.files.length > 0
                          "
                          class="attachments-preview-section"
                        >
                          <div
                            class="attachments-preview-grid"
                            ref="attachmentsGridRef"
                          >
                            <div
                              v-for="(file, index) in selectedDataItem.files"
                              :key="file.id"
                              class="attachment-preview-item"
                              @click.stop="handleFilePreview(file)"
                            >
                              <!-- 图片类型直接预览 -->
                              <div
                                v-if="
                                  file.fileName &&
                                  (file.fileName
                                    .toLowerCase()
                                    .endsWith('.jpg') ||
                                    file.fileName
                                      .toLowerCase()
                                      .endsWith('.jpeg') ||
                                    file.fileName
                                      .toLowerCase()
                                      .endsWith('.png') ||
                                    file.fileName
                                      .toLowerCase()
                                      .endsWith('.gif') ||
                                    file.fileName
                                      .toLowerCase()
                                      .endsWith('.webp'))
                                "
                                class="image-preview"
                              >
                                <img
                                  v-if="file.localPreviewUrl"
                                  :src="file.localPreviewUrl"
                                  :alt="file.fileName || file.name"
                                  class="preview-image"
                                />
                                <div v-else class="no-preview">
                                  <Icon icon="lucide:image" />
                                </div>
                              </div>
                              <!-- 其他文件类型显示图标 -->
                              <div v-else class="file-icon-preview">
                                <Icon icon="lucide:file" class="file-icon" />
                                <span class="file-name">{{
                                  file.fileName || file.name
                                }}</span>
                              </div>
                              <div class="attachment-actions-overlay">
                                <span
                                  style="
                                    color: white;
                                    cursor: pointer;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 4px;
                                  "
                                  @click.stop="handleFilePreview(file)"
                                >
                                  <Icon icon="lucide:eye" />
                                  预览
                                </span>
                                <span
                                  style="
                                    color: white;
                                    cursor: pointer;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 4px;
                                  "
                                  @click.stop="handleFileDownload(file)"
                                >
                                  <Icon icon="lucide:download" />
                                  下载
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <div v-else class="module-empty">
                  <ElEmpty description="暂无数据" :image-size="80" />
                </div>
              </div>
            </ElCard>
          </div>
          <div v-else class="no-module-selected">
            <ElEmpty
              description="请从左侧选择一个模块查看详情"
              :image-size="120"
            />
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="showAddDialog"
      :title="`${isEditMode ? '编辑' : '新增'} - ${currentModule?.title}`"
      width="1200px"
      destroy-on-close
    >
      <ElTabs ref="tabs" v-model="activeTab">
        <ElTabPane label="基础数据" name="basic" :lazy="false">
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
          >
            <ElFormItem label="标题" prop="title">
              <ElInput
                v-model="formData.title"
                placeholder="请输入标题"
                :autosize="false"
                :disabled="isEditMode"
              />
            </ElFormItem>
            <ElFormItem label="内容" prop="content">
              <ElInput
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="请输入内容"
                :autosize="false"
                :disabled="isEditMode"
              />
            </ElFormItem>
            <ElFormItem label="日期" prop="date">
              <ElDatePicker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                :format="'YYYY-MM-DD'"
                :value-format="'YYYY-MM-DD'"
                :disabled="isEditMode"
              />
            </ElFormItem>
          </ElForm>
        </ElTabPane>
        <ElTabPane label="附件" name="attachments">
          <div class="attachments-container">
            <div class="upload-actions" style="display: flex; gap: 12px">
              <ElUpload
                ref="upload"
                v-model:file-list="uploadFiles"
                :before-upload="handleFileBeforeUpload"
                :on-remove="handleFileRemove"
                :on-change="handleFileChange"
                multiple
                :limit="10"
                :auto-upload="false"
                :show-file-list="false"
              >
                <ElButton type="primary">
                  <Icon icon="lucide:upload" class="mr-1" />
                  本地附件
                </ElButton>
              </ElUpload>
              <ElButton type="success" @click="openMobileUploadDialog">
                <Icon icon="lucide:smartphone" class="mr-1" />
                手机上传
              </ElButton>
            </div>

            <div v-if="uploadFiles.length > 0" class="upload-tip">
              <Icon icon="lucide:info" class="mr-1" />
              支持拖拽调整文件顺序，点击图片可预览，点击文件可在线预览
            </div>

            <div ref="fileListContainer" class="file-list-container">
              <div
                v-for="(file, index) in uploadFiles"
                :key="file.uid"
                class="file-item"
                :class="{ 'is-image': isImageFile(file.name) }"
              >
                <div class="file-drag-handle">
                  <Icon icon="lucide:grip-vertical" />
                </div>
                <div
                  class="file-preview"
                  @click="
                    isImageFile(file.name)
                      ? handleImagePreview(file)
                      : handleFilePreview(file)
                  "
                >
                  <div v-if="isImageFile(file.name)" class="image-preview">
                    <img v-if="file.url" :src="file.url" :alt="file.name" />
                    <div v-else class="no-preview">
                      <Icon icon="lucide:image" />
                    </div>
                  </div>
                  <div v-else class="file-icon-preview">
                    <Icon :icon="getFileIcon(file.name)" />
                  </div>
                </div>
                <div class="file-info">
                  <div class="file-name" :title="file.name">
                    {{ file.name }}
                  </div>
                  <div class="file-meta">
                    <span class="file-size"
                      >{{ (file.size / 1024).toFixed(2) }} KB</span
                    >
                    <span
                      v-if="file.status === 'success'"
                      class="file-status success"
                    >
                      <Icon icon="lucide:check-circle" />
                    </span>
                    <span
                      v-else-if="file.status === 'uploading'"
                      class="file-status uploading"
                    >
                      <Icon icon="lucide:loader-2" class="spin" />
                    </span>
                  </div>
                </div>
                <div class="file-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    text
                    @click.stop="
                      isImageFile(file.name)
                        ? handleImagePreview(file)
                        : handleFilePreview(file)
                    "
                  >
                    <Icon icon="lucide:eye" />
                  </ElButton>
                  <ElButton
                    type="danger"
                    size="small"
                    text
                    @click.stop="handleFileRemove(file)"
                  >
                    <Icon icon="lucide:trash-2" />
                  </ElButton>
                </div>
              </div>
            </div>

            <div v-if="uploadFiles.length === 0" class="empty-state">
              <Icon icon="lucide:inbox" class="empty-icon" />
              <p>暂无附件，请点击上方按钮上传文件</p>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>

      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddSubmit">
          <Icon icon="lucide:check" class="mr-1" />
          保存
        </ElButton>
      </template>
    </ElDialog>

    <ElImageViewer
      v-if="showImageViewer"
      :url-list="imagePreviewList"
      :initial-index="currentPreviewIndex"
      @close="showImageViewer = false"
    />

    <ElDialog
      v-model="previewDialogVisible"
      :title="`文件预览 - ${previewFileName}`"
      width="90%"
      destroy-on-close
      class="file-preview-dialog"
    >
      <div class="file-preview-content">
        <iframe
          v-if="previewFileUrl"
          :src="previewFileUrl"
          class="preview-iframe"
          frameborder="0"
        ></iframe>
      </div>
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
  </div>
</template>

<style scoped>
.process-content {
  display: flex;
  flex-direction: column;
}

.stage-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  background: white;
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  margin-bottom: 24px;
}

.stage-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 5px 12px;
  border-radius: 12px;
  min-width: 100px;
  position: relative;
}

.stage-tab-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-tab-item:hover {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

.stage-tab-item.active {
  background: linear-gradient(180deg, #eef2ff 0%, #ffffff 100%);
}

.stage-progress-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stage-progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease;
  transform-origin: center;
}

.stage-tab-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
  transition: all 0.3s ease;
}

.stage-tab-item.initial-stage .stage-tab-icon {
  transform: translate(-50%, -50%) scale(1.2);
  border: 2px solid #ffffff;
  box-shadow:
    0 0 0 3px currentColor,
    0 0 15px rgba(64, 158, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;
  z-index: 3;
}

/* 为当前阶段添加脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow:
      0 0 0 3px currentColor,
      0 0 15px rgba(64, 158, 255, 0.5);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    box-shadow:
      0 0 0 3px currentColor,
      0 0 20px rgba(64, 158, 255, 0.8);
  }
}

/* 增强当前阶段的标题样式 */
.stage-tab-item.initial-stage .stage-tab-title {
  color: #667eea;
  font-weight: 700;
  font-size: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 增强当前阶段的进度条样式 */
.stage-tab-item.initial-stage .stage-progress-bar-fill {
  box-shadow: 0 0 10px currentColor;
  position: relative;
}

.stage-tab-item.initial-stage .stage-progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shimmer 2s ease-in-out infinite;
}

/* 添加光泽动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 确保其他阶段的样式不受影响 */
.stage-tab-item:not(.active) .stage-tab-icon {
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.stage-tab-item:not(.active):hover .stage-tab-icon {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 当前进度文字样式 */
.current-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stage-tab-item.active {
  --active-stage-color: var(--current-stage-color);
}

/* 阶段进度条样式 */
.stage-progress-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.stage-progress-bar {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.stage-progress-bar-fill {
  height: 100%;
  border-radius: 2px;
  position: absolute;
  left: 0;
  top: 0;
}

.stage-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.stage-tab-item:nth-child(1).active {
  --current-stage-color: #409eff;
}

.stage-tab-item:nth-child(2).active {
  --current-stage-color: #67c23a;
}

.stage-tab-item:nth-child(3).active {
  --current-stage-color: #e6a23c;
}

.stage-tab-item:nth-child(4).active {
  --current-stage-color: #f56c6c;
}

.stage-tab-item:nth-child(5).active {
  --current-stage-color: #909399;
}

.stage-tab-item:nth-child(6).active {
  --current-stage-color: #ff6b6b;
}

.stage-tab-item:nth-child(7).active {
  --current-stage-color: #4caf50;
}

.stage-tab-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  line-height: 1.4;
  letter-spacing: 0.3px;
  white-space: normal;
  word-break: break-word;
  padding: 0 8px;
}

.stage-modules-container {
  flex: 1;
  display: flex;
  gap: 24px;
  background: transparent;
  min-height: 600px;
}

.stage-modules-sidebar {
  width: 320px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}

.sidebar-modules {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-module-item {
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-module-item:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  transform: translateX(4px);
}

.sidebar-module-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #eef2ff 0%, #f8f9ff 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.sidebar-module-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.sidebar-module-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-module-status {
  flex-shrink: 0;
  margin-left: 12px;
}

.status-completed {
  color: #16a34a;
  font-size: 18px;
}

.status-pending {
  color: #d1d5db;
  font-size: 18px;
}

.stage-modules-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.module-detail {
  height: 100%;
}

.module-detail-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.module-detail-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.module-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
}

.module-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.module-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}

.module-description-inline {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.module-status-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.module-data-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 0px;
}

.data-tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.data-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-x: auto;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  position: sticky;
  top: 0;
  z-index: 10;
  align-items: center;
}

.data-tabs-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.data-tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  white-space: nowrap;
  margin: 0;
  border-radius: 6px;
  color: white;
}

.data-tab-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.data-tab-item.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border-color: transparent;
}

.data-tab-title {
  font-size: 14px;
  font-weight: 600;
  transition: color 0.3s ease;
  padding: 0;
  border-radius: 0;
  display: inline-block;
}

.data-tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-top: 16px;
  position: relative;
}

/* 附件预览区域样式 */
.attachments-preview-section {
  margin: 16px 0;
}

.attachments-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.attachment-preview-item {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-preview-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.image-preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.attachment-preview-item:hover .preview-image {
  transform: scale(1.05);
}

.file-icon-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.file-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 12px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.attachment-actions-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 12px;
  display: flex;
  gap: 16px;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.attachment-preview-item:hover .attachment-actions-overlay {
  opacity: 1;
}

/* 保存按钮样式 */
.save-button-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}

/* 拖动排序样式 */
.sortable-ghost {
  opacity: 0.5;
  background: rgba(102, 126, 234, 0.3);
}

.sortable-chosen {
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(5deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attachments-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .attachment-preview-item {
    height: 140px;
  }

  .save-button-container {
    position: static;
    margin-top: 20px;
    text-align: right;
  }
}

.data-content-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f1f1;
}

.data-content-detail::-webkit-scrollbar {
  width: 6px;
}

.data-content-detail::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.data-content-detail::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.data-content-detail::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5568d3 0%, #6b4a8f 100%);
}

.data-tab-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
  justify-content: flex-end;
}

.no-module-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.module-completed {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: #f0f9eb;
  border: 1px solid #c2e7b0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-completed:hover {
  background-color: #ecfdf5;
  border-color: #86efac;
}

.completed-icon {
  color: #16a34a;
  font-size: 16px;
  font-weight: bold;
}

.module-actions {
  display: flex;
  gap: 10px;
}

.completed-text {
  color: #16a34a;
  font-weight: 600;
  font-size: 13px;
}

.module-actions {
  display: flex;
  gap: 10px;
}

.module-description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px dashed #e5e7eb;
  font-weight: 400;
}

.module-data {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f1f1;
}

.module-data::-webkit-scrollbar {
  width: 6px;
}

.module-data::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.module-data::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.module-data::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5568d3 0%, #6b4a8f 100%);
}

.data-item {
  padding: 6px 10px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: linear-gradient(135deg, #eef2ff 0%, #f8f9ff 100%);
  border-color: #667eea;
  transform: translateX(2px);
}

.data-item:last-child {
  margin-bottom: 0;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.data-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: 0.2px;
}

.data-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-row {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 0;
}

.data-label {
  color: #6b7280;
  min-width: 50px;
  margin-right: 8px;
  font-weight: 500;
}

.data-value {
  color: #374151;
  flex: 1;
  font-weight: 400;
  line-height: 1.4;
}

.module-empty {
  padding: 20px 10px;
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 标签切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 当模块卡片只有空状态时，确保不出现滚动条 */
.module-card:has(.module-empty) {
  overflow: visible;
}

.file-upload-content {
  padding: 24px 0;
}

.upload-icon {
  font-size: 56px;
  color: #667eea;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-text {
  font-size: 15px;
  color: #4b5563;
  font-weight: 500;
  text-align: center;
}

:deep(.el-upload-dragger) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.upload-text em {
  color: #667eea;
  font-style: normal;
  font-weight: 700;
}

.upload-tip {
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
  text-align: center;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  display: inline-block;
}

.upload-progress {
  margin-top: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.file-list-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.file-list-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.file-list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.file-list-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.file-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5568d3 0%, #6b4a8f 100%);
}

/* 附件样式 */
.attachments-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
  width: 100%;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f8f9ff;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
  font-size: 11px;
}

.attachment-item:hover {
  background: #eef2ff;
  border-color: #667eea;
}

.attachment-icon {
  font-size: 12px;
  color: #667eea;
}

.attachment-name {
  font-size: 11px;
  flex-shrink: 0;
}

/* 自定义文件列表项样式 */
.file-item-with-download {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-actions .el-button {
  padding: 0 8px;
  font-size: 12px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.attachments-container {
  padding: 20px;
  min-height: 500px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
}

:deep(.el-upload) {
  display: block;
}

:deep(.el-upload--text) {
  border: none;
  background: none;
  box-shadow: none;
  padding: 0;
  display: inline-flex;
}

:deep(.el-upload__tip) {
  margin-top: 12px;
}

.upload-tip {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
  margin-bottom: 20px;
}

.file-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  min-height: 300px;
}

.file-item {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  position: relative;
}

.file-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.file-item:active {
  cursor: grabbing;
}

.file-item.is-image {
  cursor: pointer;
}

.file-drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  padding: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: grab;
}

.file-item:hover .file-drag-handle {
  opacity: 1;
}

.file-preview {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.file-item:hover .image-preview img {
  transform: scale(1.05);
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #9ca3af;
}

.file-icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #667eea;
}

.file-info {
  padding: 12px;
  background: white;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.file-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.file-size {
  color: #6b7280;
}

.file-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.file-status.success {
  color: #16a34a;
}

.file-status.uploading {
  color: #667eea;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.file-actions {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.file-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  height: 70vh;
}

.file-preview-content {
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 1400px) {
  .stage-modules-sidebar {
    width: 280px;
  }

  .file-list-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 1200px) {
  .stage-modules-container {
    flex-direction: column;
  }

  .stage-modules-sidebar {
    width: 100%;
    max-height: 300px;
  }

  .stage-modules-content {
    min-height: 500px;
  }

  .file-list-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 1024px) {
  .stage-modules-container {
    flex-direction: column;
  }

  .stage-modules-sidebar {
    width: 100%;
    max-height: 250px;
  }

  .module-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .module-info-section {
    width: 100%;
  }

  .module-status-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .data-tabs {
    flex-wrap: wrap;
    padding: 8px;
    gap: 6px;
  }

  .data-tab-item {
    padding: 8px 12px;
  }

  .file-list-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .process-header {
    padding: 16px 20px;
  }

  .page-title {
    font-size: 18px;
  }

  .stage-modules-container {
    flex-direction: column;
    gap: 16px;
  }

  .stage-modules-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .stage-modules-content {
    min-height: 400px;
  }

  .file-list-container {
    grid-template-columns: 1fr;
  }

  .sidebar-module-item {
    padding: 12px;
  }

  .sidebar-module-title {
    font-size: 13px;
  }

  .module-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .module-info-section {
    width: 100%;
  }

  .module-description-inline {
    font-size: 12px;
    padding: 6px 10px;
  }

  .module-status-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .data-tabs {
    flex-wrap: wrap;
    padding: 8px;
    gap: 6px;
  }

  .data-tab-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .data-tab-title {
    font-size: 13px;
  }

  .data-tab-content {
    padding: 16px;
  }

  .data-tab-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .data-tab-actions .el-button {
    width: 100%;
  }
}

/* 手机上传二维码弹窗样式 */
.mobile-upload-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.qr-code-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.qr-code-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-code-tip {
  font-size: 14px;
  color: #666;
  text-align: left;
  width: 100%;
  max-width: 300px;
}

.qr-code-tip p {
  margin: 8px 0;
  line-height: 1.5;
}

.qr-code-expire {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 10px;
  font-weight: 500;
}

.wechat-tip {
  width: 100%;
  max-width: 350px;
  padding: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  margin-top: 10px;
}

.wechat-tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #c2410c;
  margin-bottom: 8px;
}

.wechat-tip-icon {
  font-size: 18px;
}

.wechat-tip-content {
  font-size: 13px;
  color: #9a3412;
  line-height: 1.6;
}

.wechat-tip-content p {
  margin: 0 0 8px 0;
}

.wechat-tip-content ol {
  margin: 0;
  padding-left: 20px;
}

.wechat-tip-content li {
  margin: 4px 0;
}

.inline-icon {
  display: inline-block;
  vertical-align: middle;
  font-size: 16px;
}
</style>
