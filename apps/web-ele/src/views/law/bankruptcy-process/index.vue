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
  type UploadFile,
  type UploadUserFile,
} from 'element-plus';

import { CaseProcessApi } from '../../../api/core/case-process';


const props = defineProps<{
  caseId: string;
  initialStage?: number;
}>();

const router = useRouter();
const loading = ref(false);

const activeStage = ref(props.initialStage || 0);
const showAddDialog = ref(false);
const currentModule = ref<any>(null);
const currentStageIndex = ref(0);
const activeTab = ref('basic');
const isEditMode = ref(false);
const currentItem = ref<any>(null);
// 控制撤回按钮显示
const showWithdrawButton = ref<string | null>(null);

const formRef = ref();
const upload = ref<InstanceType<typeof ElUpload>>();
const tabs = ref<InstanceType<typeof ElTabs>>();
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



// 为每个模块添加展开状态
const expandedModules = ref<Record<string, boolean>>({});
// 为每个模块添加完成状态
const completedModules = ref<Record<string, boolean>>({
  '1-1': true,
  '1-2': true,
  '2-1': true,
  '3-1': true
});

// 存储每个阶段的动画进度值
const animatedProgress = ref<Record<number, number>>({});

// 初始化动画进度值
const initAnimatedProgress = () => {
  stages.forEach((_, index) => {
    animatedProgress.value[index] = getStageProgress(index);
  });
};

// 切换模块完成状态
const toggleModuleComplete = (moduleId: string) => {
  completedModules.value[moduleId] = !completedModules.value[moduleId];
  // 触发所有阶段的进度动画
  updateAllAnimatedProgress();
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

// 组件挂载时初始化动画进度
onMounted(() => {
  loadStageData(activeStage.value);
  initAnimatedProgress();
});

// 处理数据项点击事件
const handleDataItemClick = async (item: any, module: any) => {
  // 设置为编辑模式
  isEditMode.value = true;
  currentItem.value = item;
  currentModule.value = module;
  currentStageIndex.value = activeStage.value;
  
  // 填充表单数据
  formData.value = {
    title: item.title,
    content: item.content,
    date: item.date,
  };
  
  // 处理附件数据
  uploadFiles.value = item.files ? item.files.map((file: any) => ({
    uid: Date.now() + Math.random(),
    name: file.fileName || file.name,
    status: 'success',
    url: file.filePath || file.url,
    response: file,
  })) : [];
  
  showAddDialog.value = true;
  
  // 延迟确保对话框完全渲染后再设置标签页
  setTimeout(() => {
    if (tabs.value) {
      tabs.value.setActiveName('basic');
    }
  }, 50);
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

// 加载指定阶段的数据
const loadStageData = async (stageIndex: number) => {
  loading.value = true;
  try {
    const stageNum = stageIndex + 1; // 阶段从1开始
    // 根据需求，调用新的接口获取数据
    const response = await CaseProcessApi.getCaseStageDataApi(props.caseId, stageNum);
    
    if (response.code === 200 && response.data) {
      // 清空当前阶段所有模块的数据
      stages[stageIndex].modules.forEach(module => {
        module.data = [];
      });
      
      // 将返回的数据分配到对应的模块
      response.data.forEach(item => {
        // 根据moduleCode或moduleName匹配对应的模块
        const module = stages[stageIndex].modules.find(m => 
          m.title.includes(item.moduleName) || item.moduleName.includes(m.title)
        );
        
        if (module) {
          // 解析attachments字段
          let files = [];
          if (item.attachments) {
            try {
              files = JSON.parse(item.attachments);
            } catch (error) {
              console.error('解析attachments失败:', error);
              files = [];
            }
          }
          
          module.data.push({
            id: item.id,
            title: item.title,
            content: item.content,
            creator: item.createUserId?.toString() || '',
            date: item.processDate ? new Date(item.processDate).toISOString().split('T')[0] : '',
            files: files,
            fieldData: item.fieldData ? JSON.parse(item.fieldData) : {},
            createTime: item.createTime,
            updateTime: item.updateTime
          });
        }
      });
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
  loadStageData(index);
};

// 监听阶段变化
watch(activeStage, (newIndex) => {
  loadStageData(newIndex);
});

// 监听对话框显示状态，确保默认选中基础数据标签页
watch(showAddDialog, async (newVal) => {
  if (newVal) {
    // 使用setTimeout确保组件完全挂载后再设置标签页
    setTimeout(() => {
      // 只使用tabs ref直接控制标签页，避免双向绑定冲突
      if (tabs.value) {
        tabs.value.setActiveName('basic');
      }
    }, 100);
  }
});

// 组件挂载时加载初始阶段数据
onMounted(() => {
  loadStageData(activeStage.value);
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
  showAddDialog.value = true;
  
  // 延迟确保对话框完全渲染后再设置标签页
  setTimeout(() => {
    if (tabs.value) {
      tabs.value.setActiveName('basic');
    }
  }, 50);
};

const handleAddSubmit = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();
    
    const stageNum = currentStageIndex.value + 1;
    const stageName = stages[currentStageIndex.value].title;
    
    // 处理附件数据
    const attachments = uploadFiles.value.map(file => ({
      fileName: file.name,
      filePath: file.url,
      fileType: file.type,
      fileSize: file.size,
    }));
    
    let response;
    
    // 准备表单数据
    const formDataObj = new FormData();
    
    formDataObj.append('caseId', Number(props.caseId).toString());
    formDataObj.append('stageNum', stageNum.toString());
    formDataObj.append('stageName', stageName.split('、')[1] || stageName);
    formDataObj.append('moduleCode', `STAGE${stageNum}_${currentModule.value.title.replace(/\s+/g, '_').toUpperCase()}`);
    formDataObj.append('moduleName', currentModule.value.title);
    formDataObj.append('title', formData.value.title);
    formDataObj.append('content', formData.value.content);
    formDataObj.append('processDate', formData.value.date ? new Date(formData.value.date).toISOString() : '');
    formDataObj.append('fieldData', JSON.stringify({}));
    formDataObj.append('status', 'SKIP'); // 默认状态为SKIP
    
    // 添加文件到表单
    uploadFiles.value.forEach(file => {
      if (file.raw) {
        formDataObj.append('files', file.raw);
      }
    });
    
    if (isEditMode.value && currentItem.value) {
      // 编辑模式，调用新的带文件上传的PUT API
      response = await fetch(`/api/v1/api/case-process-stage/${currentItem.value.id}/with-files`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: formDataObj,
      }).then(res => res.json());
    } else {
      // 新增模式，调用新的带文件上传的POST API
      response = await fetch('/api/v1/api/case-process-stage/with-files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: formDataObj,
      }).then(res => res.json());
    }
    
    if (response.code === 200 && response.data) {
      ElMessage.success(isEditMode.value ? '更新成功' : '添加成功');
      showAddDialog.value = false;
      // 重新加载当前阶段数据
      loadStageData(currentStageIndex.value);
    } else {
      ElMessage.error(response.message || (isEditMode.value ? '更新失败' : '添加失败'));
    }
  } catch (error: any) {
    // 检查是否是表单验证错误
    if (error && typeof error === 'object' && ('title' in error || 'content' in error)) {
      // 表单验证失败，Element Plus会自动显示错误信息，不需要额外处理
      console.warn('表单验证失败:', error);
    } else {
      // 其他错误
      console.error(isEditMode.value ? '更新失败:' : '添加失败:', error);
      ElMessage.error(isEditMode.value ? '更新失败' : '添加失败');
    }
  }
};



const handleDelete = async (module: any, item: any) => {
  try {
    const response = await CaseProcessApi.deleteCaseStageDataApi(item.id);
    
    if (response.code === 200 && response.data) {
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
          :class="{ active: activeStage === index }"
          @click="handleStageChange(index)"
        >
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
                <!-- 进度圆环 - 修改为蓝色渐变 -->
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#409EFF"
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
                    <div class="data-title">{{ item.title }}</div>
                    <div class="data-actions">
                      <ElPopconfirm
                        title="确定要删除这条记录吗？"
                        @confirm="handleDelete(module, item)"
                      >
                        <template #reference>
                          <ElButton type="danger" size="small" text>
                            <Icon icon="lucide:trash-2" />
                          </ElButton>
                        </template>
                      </ElPopconfirm>
                    </div>
                  </div>
                  <div class="data-content">
                    <div class="data-row">
                      <span class="data-label">内容:</span>
                      <span class="data-value">{{ item.content }}</span>
                    </div>
                    <div class="data-row">
                      <span class="data-label">创建人:</span>
                      <span class="data-value">{{ item.creator }}</span>
                    </div>
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
                        >
                          <Icon icon="lucide:paperclip" class="attachment-icon" />
                          <span class="attachment-name">{{ file.fileName || file.name }}</span>
                          <span class="attachment-size">{{ (file.fileSize || file.size) ? (file.fileSize || file.size) / 1024 / 1024 < 1 ? `${((file.fileSize || file.size) / 1024).toFixed(2)} KB` : `${((file.fileSize || file.size) / 1024 / 1024).toFixed(2)} MB` : '' }}</span>
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
      width="800px"
      destroy-on-close
      @opened="() => { if (tabs.value) tabs.value.setActiveName('basic'); }"
    >
      <ElTabs ref="tabs">
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
          <div style="min-height: 200px;">
            <ElForm
              :model="formData"
              label-width="100px"
            >
              <ElFormItem label="附件">
                <ElUpload
                  ref="upload"
                  v-model:file-list="uploadFiles"
                  :before-upload="handleFileBeforeUpload"
                  :on-remove="handleFileRemove"
                  :on-change="handleFileChange"
                  multiple
                  :limit="5"
                  list-type="text"
                  :auto-upload="false"
                >
                  <ElButton type="primary">
                    <Icon icon="lucide:upload" class="mr-1" />
                    选择附件
                  </ElButton>
                  <template #tip>
                    <div class="upload-tip">
                      支持上传多个文件，单个文件大小不超过50MB
                    </div>
                  </template>
                </ElUpload>
              </ElFormItem>
            </ElForm>
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

.stage-tab-item.active .stage-tab-icon {
  transform: translate(-50%, -50%);
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 4px currentColor;
}

/* 移除图标悬停放大效果 */
.stage-tab-item:hover .stage-tab-icon {
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  padding: 10px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: linear-gradient(135deg, #eef2ff 0%, #f8f9ff 100%);
  border-color: #667eea;
  transform: translateX(4px);
}

.data-item:last-child {
  margin-bottom: 0;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.data-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}

.data-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 4px 0;
}

.data-label {
  color: #6b7280;
  min-width: 70px;
  margin-right: 12px;
  font-weight: 500;
}

.data-value {
  color: #374151;
  flex: 1;
  font-weight: 400;
  line-height: 1.5;
}

.module-empty {
  padding: 40px 20px;
  text-align: center;
  min-height: 150px;
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
  gap: 8px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
  width: 100%;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9ff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
}

.attachment-item:hover {
  background: #eef2ff;
  border-color: #667eea;
}

.attachment-icon {
  font-size: 16px;
  color: #667eea;
  flex-shrink: 0;
}

.attachment-name {
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

@media (max-width: 1400px) {
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }
}

@media (max-width: 1200px) {
  .stage-timeline {
    width: 260px;
  }
  
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

@media (max-width: 1024px) {
  .modules-grid {
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
  
  .modules-header {
    padding: 16px 20px;
  }
}
</style>
