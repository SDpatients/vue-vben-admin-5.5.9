<script setup lang="ts">
import { ref, computed, defineProps, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElProgress,
  ElRow,
  ElSelect,
  ElTag,
  ElTabs,
  ElTabPane,
  ElUpload,
  ElImageViewer,
  type UploadFile,
  type UploadUserFile,
} from 'element-plus';

import { CaseTaskApi, type CaseTask } from '../../../api/core/case-tasks';
import { CaseTaskSubmissionApi, type CaseTaskSubmission } from '../../../api/core/case-task-submissions';

// 直接导入sortablejs库
import Sortable from 'sortablejs';


const props = defineProps<{
  caseId: string;
  initialStage?: number;
}>();

const router = useRouter();
const loading = ref(false);

const activeStage = ref(props.initialStage || 0);
// 初始阶段，用于保持视觉样式
const initialStage = ref(props.initialStage || 0);
const showAddDialog = ref(false);
const currentModule = ref<any>(null);
const currentStageIndex = ref(0);
const isEditMode = ref(false);
const currentItem = ref<any>(null);
// 控制撤回按钮显示
const showWithdrawButton = ref<string | null>(null);

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
}

// 处理文件移除
const handleFileRemove = (file: UploadFile) => {
  const index = uploadFiles.value.findIndex(item => item.uid === file.uid);
  if (index !== -1) {
    uploadFiles.value.splice(index, 1);
  }
  return true;
};

// 处理文件变化
const handleFileChange = (file: UploadFile, fileList: UploadFile[]) => {
  uploadFiles.value = fileList;
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
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('下载失败，服务器返回错误');
    }
    
    // 获取文件名 - 优先使用originalFileName字段
    let fileName = file.originalFileName || file.fileName || file.name || '文件下载';
    
    // 尝试从响应头获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      // 尝试多种Content-Disposition格式匹配
      const filenamePatterns = [
        /filename="([^"]+)"/, // filename="xxx" 格式
        /filename=([^;\s]+)/,    // filename=xxx 格式（无引号）
        /filename\*=UTF-8''([^;]+)/ // filename*=UTF-8''xxx 格式
      ];
      
      for (const pattern of filenamePatterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          // 解码URL编码的文件名
          let headerFileName = decodeURIComponent(match[1]);
          // 移除可能的引号
          headerFileName = headerFileName.replace(/^['"]|['"]$/g, '');
          // 只有当响应头中的文件名有效时才使用
          if (headerFileName && headerFileName !== 'null' && headerFileName !== 'undefined') {
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
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    ElMessage.success('文件下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    'pdf': 'lucide:file-text',
    'doc': 'lucide:file-text',
    'docx': 'lucide:file-text',
    'xls': 'lucide:file-spreadsheet',
    'xlsx': 'lucide:file-spreadsheet',
    'ppt': 'lucide:presentation',
    'pptx': 'lucide:presentation',
    'txt': 'lucide:file',
    'zip': 'lucide:archive',
    'rar': 'lucide:archive',
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
    const allImageFiles = uploadFiles.value.filter(f => isImageFile(f.name));
    const index = allImageFiles.findIndex(f => f.uid === file.uid);
    
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
              'Authorization': 'Bearer ' + token
            }
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
      })
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
    const baseUrl = import.meta.env.VITE_API_URL_8085 || '/api/v1';
    const previewUrl = `${baseUrl}/file/preview/${fileId}`;
    
    // 使用fetch获取文件内容，添加Authorization头
    const response = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
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
      if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
        const movedItem = uploadFiles.value.splice(oldIndex, 1)[0];
        uploadFiles.value.splice(newIndex, 0, movedItem);
      }
    },
  });
};

watch(() => uploadFiles.value.length, () => {
  nextTick(() => {
    initializeSortable();
  });
});



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
  const module = currentStage.value.modules.find(m => m.id === moduleId);
  if (!module?.task) {
    ElMessage.warning('任务不存在，无法标记完成状态');
    return;
  }
  
  const newStatus = completedModules.value[moduleId] ? 'IN_PROGRESS' : 'COMPLETED';
  
  try {
    const response = await CaseTaskApi.updateCaseTask(module.task.id, {
      status: newStatus,
    });
    
    if (response.code === 200) {
      completedModules.value[moduleId] = !completedModules.value[moduleId];
      // 更新模块的任务状态，确保界面立即反映变化
      module.task.status = newStatus;
      updateAllAnimatedProgress();
      ElMessage.success(completedModules.value[moduleId] ? '已标记为完成' : '已取消完成标记');
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
    
    if ((increment > 0 && current >= targetProgress) || (increment < 0 && current <= targetProgress)) {
      // 动画完成，设置为目标值并清除定时器
      animatedProgress.value[stageIndex] = targetProgress;
      clearInterval(timer);
      return;
    }
    
    // 每次增加或减少1%
    animatedProgress.value[stageIndex] = current + increment;
  }, 50); // 每50毫秒更新一次，控制动画速度
};

// 监听completedModules变化，更新动画进度
watch(completedModules, () => {
  updateAllAnimatedProgress();
}, { deep: true });

// 组件挂载时加载所有阶段的数据并初始化动画进度
onMounted(async () => {
  // 加载所有阶段的数据
  await loadAllStageData();
  // 初始化并动画显示所有阶段的进度条
  updateAllAnimatedProgress();
});

// 加载所有阶段的数据
const loadAllStageData = async () => {
  loading.value = true;
  try {
    // 获取所有任务数据
    const response = await CaseTaskApi.getCaseTasks({
      caseId: Number(props.caseId),
      page: 1,
      size: 100,
    });
    
    if (response.code === 200 && response.data) {
      // 清空所有阶段的模块数据
      stages.forEach(stage => {
        stage.modules.forEach(module => {
          module.data = [];
          module.task = null;
        });
      });
      
      // 将返回的所有任务数据分配到对应的模块
      for (const task of response.data.content) {
        // 遍历所有阶段，找到匹配的模块
        for (const stage of stages) {
          const module = stage.modules.find(m => 
            m.title.includes(task.taskName) || task.taskName.includes(m.title)
          );
          
          if (module) {
            module.task = task;
            // 根据任务状态设置完成状态
            completedModules.value[module.id] = task.status === 'COMPLETED';
            
            // 获取该任务的最新提交记录
            try {
              const submissionsResponse = await CaseTaskSubmissionApi.getLatestSubmissions({
                caseTaskId: task.id,
              });
              
              if (submissionsResponse.code === 200 && submissionsResponse.data && submissionsResponse.data.length > 0) {
                for (const submission of submissionsResponse.data) {
                  // 获取提交的文件列表
                  const filesResponse = await CaseTaskSubmissionApi.getSubmissionFiles(submission.id);
                  const files = filesResponse.code === 200 ? filesResponse.data : [];
                  
                  module.data.push({
                    id: submission.id,
                    title: submission.submissionTitle,
                    content: submission.submissionContent,
                    creator: submission.creatorName,
                    date: submission.createTime ? new Date(submission.createTime).toISOString().split('T')[0] : '',
                    files: files.map(f => ({
                      id: f.id,
                      fileName: f.originalFileName,
                      originalFileName: f.originalFileName,
                      filePath: f.filePath,
                      fileSize: f.fileSize,
                      uploadTime: f.uploadTime,
                      uploadUserName: f.uploadUserName,
                    })),
                    status: submission.status,
                    submissionNumber: submission.submissionNumber,
                    createTime: submission.createTime,
                    updateTime: submission.updateTime,
                    taskId: task.id,
                  });
                }
              }
            } catch (error) {
              console.error('获取任务提交记录失败:', error);
            }
            break; // 找到匹配的模块后退出循环
          }
        }
      }
    }
  } catch (error) {
    console.error('加载所有阶段数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 处理数据项点击事件
const handleDataItemClick = async (item: any, module: any) => {
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
  uploadFiles.value = item.files ? await Promise.all(item.files.map(async (file: any) => {
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
      // 动态构建API URL，使用附件的id字段
      const baseUrl = import.meta.env.VITE_API_URL_8085 || '/api/v1';
      const previewUrl = `${baseUrl}/file/preview/${file.id}`;
      
      // 使用fetch获取文件内容，添加Authorization头
      const response = await fetch(previewUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (response.ok) {
        // 获取文件Blob
        const blob = await response.blob();
        
        // 创建本地URL用于预览
        const localUrl = window.URL.createObjectURL(blob);
        
        // 创建File对象
        const newFile = new File([blob], file.fileName || file.originalFileName, { type: blob.type });
        
        // 返回带有预览URL的文件对象
        return {
          ...baseFile,
          url: localUrl,
          raw: newFile,
          response: {
            ...file,
            filePath: localUrl
          }
        };
      }
      
      console.error(`获取文件ID ${file.id} 的预览失败:`, response.statusText);
      return baseFile;
    } catch (error) {
      console.error(`获取文件ID ${file.id} 的预览失败:`, error);
      return baseFile;
    }
  })) : [];
  
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
  stage.modules.forEach(module => {
    if (completedModules.value[module.id]) {
      completedCount++;
    }
  });
  
  // 计算进度百分比
  return Math.round((completedCount / stage.modules.length) * 100);
}

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
  { title: '六、财产变价与分配',
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
  'IN_PROGRESS': '进行中',
  'COMPLETED': '已完成',
  'REVIEWING': '审核中',
  'SKIPPED': '已跳过',
  'REJECTED': '已驳回',
};

const submissionStatusMap: Record<string, string> = {
  'PENDING': '待审核',
  'APPROVED': '已通过',
  'REJECTED': '已驳回',
};

// 加载指定阶段的数据
const loadStageData = async (stageIndex: number) => {
  loading.value = true;
  try {
    const stageNum = stageIndex + 1;
    
    // 获取该阶段所有任务
    const taskCodes = stages[stageIndex].modules.map(m => `TASK_${String(stageNum).padStart(3, '0')}_${m.id.split('-')[1]}`);
    
    const response = await CaseTaskApi.getCaseTasks({
      caseId: Number(props.caseId),
      page: 1,
      size: 100,
    });
    
    if (response.code === 200 && response.data) {
      // 清空当前阶段所有模块的数据
      stages[stageIndex].modules.forEach(module => {
        module.data = [];
        module.task = null;
      });
      
      // 将返回的任务数据分配到对应的模块
      for (const task of response.data.content) {
        const module = stages[stageIndex].modules.find(m => 
          m.title.includes(task.taskName) || task.taskName.includes(m.title)
        );
        
        if (module) {
          module.task = task;
          // 根据任务状态设置完成状态
          completedModules.value[module.id] = task.status === 'COMPLETED';
          
          // 获取该任务的最新提交记录
          try {
            const submissionsResponse = await CaseTaskSubmissionApi.getLatestSubmissions({
              caseTaskId: task.id,
            });
            
            if (submissionsResponse.code === 200 && submissionsResponse.data && submissionsResponse.data.length > 0) {
              for (const submission of submissionsResponse.data) {
                // 获取提交的文件列表
                const filesResponse = await CaseTaskSubmissionApi.getSubmissionFiles(submission.id);
                const files = filesResponse.code === 200 ? filesResponse.data : [];
                
                module.data.push({
                  id: submission.id,
                  title: submission.submissionTitle,
                  content: submission.submissionContent,
                  creator: submission.creatorName,
                  date: submission.createTime ? new Date(submission.createTime).toISOString().split('T')[0] : '',
                  files: files.map(f => ({
                    id: f.id,
                    fileName: f.originalFileName,
                    originalFileName: f.originalFileName,
                    filePath: f.filePath,
                    fileSize: f.fileSize,
                    uploadTime: f.uploadTime,
                    uploadUserName: f.uploadUserName,
                  })),
                  status: submission.status,
                  submissionNumber: submission.submissionNumber,
                  createTime: submission.createTime,
                  updateTime: submission.updateTime,
                  taskId: task.id,
                });
              }
            }
          } catch (error) {
            console.error('获取任务提交记录失败:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('加载阶段数据失败:', error);
    ElMessage.error('加载阶段数据失败');
  } finally {
    loading.value = false;
  }
};

const handleStageChange = (index: number) => {
  activeStage.value = index;
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
    
    const taskId = currentModule.value.task.id;
    
    // 创建任务提交记录
    const createResponse = await CaseTaskSubmissionApi.createSubmission({
      caseTaskId: taskId,
      submissionTitle: formData.value.title,
      submissionContent: formData.value.content,
      submissionType: 'NORMAL',
    });
    
    if (createResponse.code !== 200) {
      ElMessage.error(createResponse.message || '创建提交记录失败');
      return;
    }
    
    const submissionId = createResponse.data.submissionId;
    
    // 上传文件
    if (uploadFiles.value.length > 0) {
      for (const file of uploadFiles.value) {
        if (file.raw) {
          await CaseTaskSubmissionApi.uploadSubmissionFile(submissionId, file.raw);
        }
      }
    }
    
    ElMessage.success('提交成功');
    showAddDialog.value = false;
    
    // 重新加载当前阶段数据
    await loadStageData(currentStageIndex.value);
  } catch (error: any) {
    if (error && typeof error === 'object' && ('title' in error || 'content' in error)) {
      console.warn('表单验证失败:', error);
    } else {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  }
};



const handleDelete = async (module: any, item: any) => {
  try {
    const response = await CaseTaskSubmissionApi.deleteSubmission(item.id);
    
    if (response.code === 200) {
      const index = module.data.findIndex((d: any) => d.id === item.id);
      if (index > -1) {
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
};

const goBack = () => {
  router.back();
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
          :class="{ active: activeStage === index, 'initial-stage': index === initialStage }"
          @click="handleStageChange(index)"
        >
          <!-- 当前进度文字 - 仅初始阶段显示 -->
          <div v-if="index === initialStage" class="current-progress-text">当前进度</div>
          
          <div class="stage-progress-container">
            <div class="stage-progress-ring">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <!-- 背景圆环 - 修改为白色 -->
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="8"
                  stroke-linejoin="round"
                />
                <!-- 进度圆环 - 使用阶段特定颜色 -->
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  :stroke="stage.color"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 35"
                  :stroke-dashoffset="2 * Math.PI * 35 - (2 * Math.PI * 35 * (animatedProgress[index] || 0)) / 100"
                  transform="rotate(-90 40 40)"
                  class="progress-ring-circle"
                />
              </svg>
              <div class="stage-tab-icon" :style="{ backgroundColor: stage.color }">
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
                  width: (animatedProgress[index] || 0) + '%',
                  backgroundColor: stage.color
                }"
              ></div>
            </div>
            <div class="stage-progress-text">{{ animatedProgress[index] || 0 }}%</div>
          </div>
          
          <div class="stage-tab-title">{{ stage.title }}</div>
        </div>
      </div>

      <div class="stage-modules">
        <div v-loading="loading" class="modules-grid">
          <ElCard
          v-for="module in currentStage.modules"
          :key="module.id"
          class="module-card"
          shadow="hover"
        >
          <template #header>
            <div 
              class="module-header" 
              @click="toggleModule(module.id)"
            >
              <div class="module-title-section">
                <div class="module-title">{{ module.title }}</div>
                <ElTag v-if="module.task" :type="module.task.status === 'COMPLETED' ? 'success' : module.task.status === 'IN_PROGRESS' ? 'primary' : 'info'" size="small" style="margin-left: 8px;">
                  {{ taskStatusMap[module.task.status] || module.task.status }}
                </ElTag>
                <Icon 
                  :icon="expandedModules[module.id] ? 'lucide:chevron-down' : 'lucide:chevron-right'" 
                  class="expand-icon"
                />
              </div>
              <div class="module-status-actions">
                <!-- 完成状态显示 -->
                <div 
                  v-if="completedModules[module.id]" 
                  class="module-completed"
                  @mouseenter="showWithdrawButton = module.id"
                  @mouseleave="showWithdrawButton = null"
                >
                  <Icon icon="lucide:check" class="completed-icon" />
                  <span class="completed-text">已完成</span>
                  <ElButton
                    v-if="showWithdrawButton === module.id"
                    type="danger"
                    size="small"
                    text
                    @click.stop="toggleModuleComplete(module.id)"
                  >
                    撤回
                  </ElButton>
                </div>
                <!-- 新增和完成按钮 -->
                <div v-else class="module-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    @click.stop="toggleModuleComplete(module.id)"
                  >
                    <Icon icon="lucide:check" class="mr-1" />
                    标记完成
                  </ElButton>
                  <ElButton
                    type="success"
                    size="small"
                    @click.stop="openAddDialog(module, activeStage)"
                  >
                    <Icon icon="lucide:plus" class="mr-1" />
                    新增
                  </ElButton>
                </div>
              </div>
            </div>
          </template>

          <div class="module-description">{{ module.description }}</div>

          <transition name="slide-down">
            <div v-show="expandedModules[module.id]" class="module-content">
              <div v-if="module.data.length > 0" class="module-data">
                <div
                  v-for="item in module.data"
                  :key="item.id"
                  class="data-item"
                  @click="handleDataItemClick(item, module)"
                  style="cursor: pointer;"
                >
                  <div class="data-header">
                    <div class="data-title">
                      {{ item.title }}
                      <ElTag v-if="item.status" :type="item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'" size="small" style="margin-left: 8px;">
                        {{ submissionStatusMap[item.status] || item.status }}
                      </ElTag>
                    </div>
                    <div class="data-actions">
                      <ElPopconfirm
                      title="确定要删除这条记录吗？"
                      @confirm="handleDelete(module, item)"
                      @click.stop
                    >
                      <template #reference>
                        <ElButton type="danger" size="small" text @click.stop>
                          <Icon icon="lucide:trash-2" />
                        </ElButton>
                      </template>
                    </ElPopconfirm>
                    </div>
                  </div>
                  <div class="data-content">
                    <div class="data-row">
                      <span class="data-label">日期:</span>
                      <span class="data-value">{{ item.date }}</span>
                    </div>
                    <!-- 附件展示区域 -->
                    <div v-if="item.files && item.files.length > 0" class="data-row attachments-row">
                      <span class="data-label">附件:</span>
                      <div class="attachments-list">
                        <div
                          v-for="(file, index) in item.files"
                          :key="index"
                          class="attachment-item"
                          style="display: flex; align-items: center; justify-content: space-between;"
                        >
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <Icon icon="lucide:paperclip" class="attachment-icon" />
                            <span class="attachment-name">{{ file.fileName || file.name }}</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span 
                              style="color: #409EFF; cursor: pointer; display: inline-flex; align-items: center;"
                              @click.stop="handleFilePreview(file)"
                            >
                              <Icon icon="lucide:eye" class="mr-1" />
                              预览
                            </span>
                            <span 
                              style="color: #409EFF; cursor: pointer; display: inline-flex; align-items: center;"
                              @click.stop="handleFileDownload(file)"
                            >
                              <Icon icon="lucide:download" class="mr-1" />
                              下载
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="module-empty">
                <ElEmpty description="暂无数据" :image-size="80" />
              </div>
            </div>
          </transition>
        </ElCard>
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
              <ElInput v-model="formData.title" placeholder="请输入标题" :autosize="false" />
            </ElFormItem>
            <ElFormItem label="内容" prop="content">
              <ElInput
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="请输入内容"
                :autosize="false"
              />
            </ElFormItem>
            <ElFormItem label="日期" prop="date">
              <ElDatePicker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </ElFormItem>
          </ElForm>
        </ElTabPane>
        <ElTabPane label="附件" name="attachments">
          <div class="attachments-container">
            <div class="upload-actions">
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
                <div style="display: flex; gap: 12px;">
                  <ElButton type="primary">
                    <Icon icon="lucide:upload" class="mr-1" />
                    本地附件
                  </ElButton>
                  <ElButton type="success">
                    <Icon icon="lucide:smartphone" class="mr-1" />
                    手机上传
                  </ElButton>
                </div>
              </ElUpload>
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
                <div class="file-preview" @click="isImageFile(file.name) ? handleImagePreview(file) : handleFilePreview(file)">
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
                  <div class="file-name" :title="file.name">{{ file.name }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ (file.size / 1024).toFixed(2) }} KB</span>
                    <span v-if="file.status === 'success'" class="file-status success">
                      <Icon icon="lucide:check-circle" />
                    </span>
                    <span v-else-if="file.status === 'uploading'" class="file-status uploading">
                      <Icon icon="lucide:loader-2" class="spin" />
                    </span>
                  </div>
                </div>
                <div class="file-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    text
                    @click.stop="isImageFile(file.name) ? handleImagePreview(file) : handleFilePreview(file)"
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
        <iframe v-if="previewFileUrl" :src="previewFileUrl" class="preview-iframe" frameborder="0"></iframe>
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
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px;
  border-radius: 12px;
  min-width: 120px;
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
  width: 80px;
  height: 80px;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
  transition: all 0.3s ease;
}

.stage-tab-item.initial-stage .stage-tab-icon {
  transform: translate(-50%, -50%) scale(1.2);
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 4px currentColor, 0 0 20px rgba(64, 158, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;
  z-index: 3;
}

/* 为当前阶段添加脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 0 4px currentColor, 0 0 20px rgba(64, 158, 255, 0.5);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    box-shadow: 0 0 0 4px currentColor, 0 0 30px rgba(64, 158, 255, 0.8);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
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
  --current-stage-color: #409EFF;
}

.stage-tab-item:nth-child(2).active {
  --current-stage-color: #67C23A;
}

.stage-tab-item:nth-child(3).active {
  --current-stage-color: #E6A23C;
}

.stage-tab-item:nth-child(4).active {
  --current-stage-color: #F56C6C;
}

.stage-tab-item:nth-child(5).active {
  --current-stage-color: #909399;
}

.stage-tab-item:nth-child(6).active {
  --current-stage-color: #FF6B6B;
}

.stage-tab-item:nth-child(7).active {
  --current-stage-color: #4CAF50;
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

.stage-modules {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.modules-header {
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.modules-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.modules-grid {
  overflow-y: auto;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 24px;
}

.module-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  min-height: auto;
  height: auto;
  max-height: none;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.module-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}

.module-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.expand-icon {
  font-size: 14px;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.module-header:hover .expand-icon {
  color: #667eea;
}

/* 折叠动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.module-content {
  overflow: hidden;
}

/* 确保模块卡片内容区域有适当的内边距 */
.module-content {
  padding-top: 16px;
}

.module-status-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  max-height: 220px;
  overflow-y: auto;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* Chrome, Safari 和 Opera */
.module-data::-webkit-scrollbar {
  display: none;
}

/* 当没有数据时，移除滚动条 */
.module-empty + .module-data {
  max-height: none;
  overflow-y: visible;
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
  0%, 100% {
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
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }
  
  .file-list-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 1200px) {
  .stage-timeline {
    width: 260px;
  }
  
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
  
  .file-list-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 1024px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .stage-timeline {
    width: 240px;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    padding: 16px 20px;
  }
  
  .file-list-container {
    grid-template-columns: 1fr;
  }
  
  .modules-header {
    padding: 16px 20px;
  }
}
</style>
