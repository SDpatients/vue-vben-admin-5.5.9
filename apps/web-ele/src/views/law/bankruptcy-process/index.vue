<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
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

const props = defineProps<{
  caseId: string;
}>();

const router = useRouter();
const loading = ref(false);

const activeStage = ref(0);
const showAddDialog = ref(false);
const currentModule = ref<any>(null);
const currentStageIndex = ref(0);
const activeTab = ref('basic');

const formRef = ref();
const formData = ref({
  title: '',
  content: '',
  date: '',
});

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

const fileList = ref<UploadUserFile[]>([]);
const uploadProgress = ref(0);
const uploading = ref(false);

const stages = [
  {
    title: '一、申请与受理阶段',
    icon: 'lucide:file-plus',
    color: '#409EFF',
    modules: [
      {
        id: '1-1',
        title: '申请提交',
        description: '债务人/债权人/清算责任人向法院提交破产申请书、证据材料',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-2',
        title: '案件办理',
        description: '律师协助申请人梳理证据链，起草规范破产申请书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-3',
        title: '法院审查',
        description: '法院5日内通知债务人，债务人异议期7日',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-4',
        title: '请示批复',
        description: '案件涉及跨区域财产处置等疑难问题的请示',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-5',
        title: '文书送达',
        description: '法院向申请人、债务人送达破产申请受理通知书等',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-6',
        title: '裁定受理',
        description: '法院裁定受理时同时指定管理人',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '1-7',
        title: '驳回/撤回',
        description: '材料不全限期补正，逾期视为撤回',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '二、管理人履职阶段',
    icon: 'lucide:briefcase',
    color: '#67C23A',
    modules: [
      {
        id: '2-1',
        title: '接管义务',
        description: '管理人接管债务人财产、印章、账簿、文书等资料',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-2',
        title: '工作日志',
        description: '管理人建立工作日志，每日记录接管进度',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-3',
        title: '文书送达',
        description: '管理人向债务人高管送达接管通知书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-4',
        title: '资产评估',
        description: '管理人委托评估机构对接管的资产进行全面评估',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-5',
        title: '调查管理',
        description: '调查债务人财产状况，追回可撤销/无效行为转移的财产',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-6',
        title: '请示批复',
        description: '管理人向法院提交关于行使破产撤销权的请示',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-7',
        title: '工作日志',
        description: '详细记录财产调查线索、司法协助对接情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-8',
        title: '重整价值识别',
        description: '分析债务人核心资产、技术优势、市场潜力',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-9',
        title: '权限限制',
        description: '通知债务人有关人员配合工作',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-10',
        title: '文书送达',
        description: '送达限制债务人有关人员权利通知书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-11',
        title: '案件办理',
        description: '将债务人高管配合义务纳入重点管控事项',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-12',
        title: '破产费用',
        description: '单独建立破产费用台账，分类登记各项费用',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '2-13',
        title: '请示批复',
        description: '破产费用超出初步预算的请示',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '三、债权申报与核查阶段',
    icon: 'lucide:clipboard-list',
    color: '#E6A23C',
    modules: [
      {
        id: '3-1',
        title: '申报通知',
        description: '管理人通知已知债权人，公告申报期限、地点、材料要求',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-2',
        title: '文书送达',
        description: '通过邮寄、全国企业破产重整案件信息网公告等方式送达',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-3',
        title: '案件办理',
        description: '设立债权申报登记点，专人负责接待与材料审核',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-4',
        title: '债权申报',
        description: '债权人提交债权证明材料，管理人登记造册',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-5',
        title: '工作日志',
        description: '记录每日债权申报数量、债权类型、材料完整性情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-6',
        title: '核查异议',
        description: '债权表提交债权人会议核查，对有异议的债权提起确认之诉',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-7',
        title: '案件办理',
        description: '管理人组建债权核查小组，逐笔审核债权真实性',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-8',
        title: '债权确认',
        description: '法院裁定确认无异议债权，作为财产分配依据',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '3-9',
        title: '文书送达',
        description: '法院送达债权确认裁定书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '四、债权人会议阶段',
    icon: 'lucide:users',
    color: '#F56C6C',
    modules: [
      {
        id: '4-1',
        title: '首次会议',
        description: '法院自债权申报期限届满之日起15日内召集',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-2',
        title: '债权人会议',
        description: '会前整理会议资料，送达全体参会债权人',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-3',
        title: '文书送达',
        description: '送达债权人会议通知书、会议决议裁定书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-4',
        title: '工作日志',
        description: '记录会议争议焦点、债权人意见、表决票数统计情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-5',
        title: '破产费用',
        description: '向债权人会议公示破产费用支出明细及台账',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-6',
        title: '后续会议',
        description: '管理人/债权人委员会/占债权总额1/4以上债权人可提议召开',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-7',
        title: '债权人会议',
        description: '就变价方案、分配方案的核心内容向债权人逐项说明',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-8',
        title: '请示批复',
        description: '重整计划等重大事项表决存在争议的请示',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '4-9',
        title: '决议生效',
        description: '决议经出席会议有表决权债权人过半数通过',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '五、破产宣告阶段',
    icon: 'lucide:gavel',
    color: '#909399',
    modules: [
      {
        id: '5-1',
        title: '宣告条件',
        description: '债务人符合破产条件，法院裁定宣告破产',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-2',
        title: '文书送达',
        description: '法院送达破产宣告裁定书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-3',
        title: '工作日志',
        description: '记录破产宣告裁定送达时间、债务人反馈情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-4',
        title: '效力产生',
        description: '债务人成为破产人，财产成为破产财产',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-5',
        title: '案件办理',
        description: '将破产宣告后的财产管理、变价工作纳入核心议程',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-6',
        title: '程序衔接',
        description: '宣告前可转入重整/和解，宣告后原则上不可逆转',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '5-7',
        title: '重整价值识别',
        description: '管理人补充出具债务人重整价值最终评估报告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '六、财产变价与分配阶段',
    icon: 'lucide:banknote',
    color: '#FF6B6B',
    modules: [
      {
        id: '6-1',
        title: '变价方案',
        description: '管理人拟订破产财产变价方案，提交债权人会议表决',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-2',
        title: '资产评估',
        description: '结合前期资产评估报告，根据市场行情调整变价策略',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-3',
        title: '债权人会议',
        description: '管理人就变价方案向债权人会议进行详细说明',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-4',
        title: '财产变价',
        description: '通过拍卖等合法方式变价，提高财产价值',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-5',
        title: '案件办理',
        description: '委托拍卖机构开展拍卖工作，全程监督拍卖流程',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-6',
        title: '工作日志',
        description: '记录财产拍卖时间、竞拍方信息、成交价格及款项到账情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-7',
        title: '分配方案',
        description: '管理人拟订分配方案，经债权人会议表决通过',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-8',
        title: '破产费用',
        description: '在分配方案中明确破产费用、共益债务的清偿金额及顺序',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-9',
        title: '请示批复',
        description: '分配方案表决通过后，管理人向法院提交请示',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-10',
        title: '财产分配',
        description: '按法定顺序分配，提存未决债权分配额',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-11',
        title: '文书送达',
        description: '管理人向各债权人送达破产财产分配通知书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '6-12',
        title: '工作日志',
        description: '记录分配款项支付时间、金额、收款人信息',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
  {
    title: '七、破产程序终结阶段',
    icon: 'lucide:check-circle',
    color: '#4CAF50',
    modules: [
      {
        id: '7-1',
        title: '终结申请',
        description: '管理人完成分配后，提交破产财产分配报告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-2',
        title: '报结记录',
        description: '管理人编制破产案件报结申请表',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-3',
        title: '工作日志',
        description: '记录终结申请提交时间、法院接收情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-4',
        title: '法院裁定',
        description: '法院15日内裁定终结，予以公告',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-5',
        title: '文书送达',
        description: '法院送达终结破产程序裁定书',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-6',
        title: '注销登记',
        description: '管理人自终结裁定之日起10日内办理注销登记',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-7',
        title: '案件办理',
        description: '整理债务人注销所需材料，全程办理注销手续',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-8',
        title: '文书送达',
        description: '将企业注销证明复印件送达法院及债权人委员会备案',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-9',
        title: '管理人终止',
        description: '注销登记完毕，管理人职责终止',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-10',
        title: '报结记录',
        description: '管理人完善破产案件报结记录',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
      {
        id: '7-11',
        title: '工作日志',
        description: '记录管理人职责终止时间、履职报告提交情况',
        fields: ['标题', '类型', '内容', '创建人', '日期'],
        data: [],
      },
    ],
  },
];

const currentStage = computed(() => stages[activeStage.value]);

const handleStageChange = (index: number) => {
  activeStage.value = index;
};

const openAddDialog = (module: any, stageIndex: number) => {
  currentModule.value = module;
  currentStageIndex.value = stageIndex;
  formData.value = {
    title: '',
    content: '',
    date: '',
  };
  fileList.value = [];
  uploadProgress.value = 0;
  uploading.value = false;
  activeTab.value = 'basic';
  showAddDialog.value = true;
};

const handleAddSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    const newItem = {
      id: Date.now(),
      ...formData.value,
      createTime: new Date().toISOString(),
      files: fileList.value.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
      })),
    };
    
    currentModule.value.data.push(newItem);
    
    ElMessage.success('添加成功');
    showAddDialog.value = false;
  } catch (error) {
    console.error('验证失败:', error);
  }
};

const handleFileUpload = (file: UploadFile, fileList: UploadFile[]) => {
  console.log('上传文件:', file, fileList);
  
  const maxSize = 50 * 1024 * 1024;
  if (file.size && file.size > maxSize) {
    ElMessage.error(`文件大小不能超过50MB`);
    return false;
  }
  
  return true;
};

const handleFileProgress = (event: any) => {
  uploadProgress.value = Math.round((event.loaded / event.total) * 100);
};

const handleFileSuccess = (response: any, file: UploadFile) => {
  ElMessage.success(`${file.name} 上传成功`);
  uploadProgress.value = 100;
};

const handleFileError = (error: any, file: UploadFile) => {
  ElMessage.error(`${file.name} 上传失败`);
  console.error('文件上传失败:', error);
  uploading.value = false;
  uploadProgress.value = 0;
};

const handleDelete = (module: any, item: any) => {
  const index = module.data.findIndex((d: any) => d.id === item.id);
  if (index > -1) {
    module.data.splice(index, 1);
    ElMessage.success('删除成功');
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
          <div class="stage-tab-icon" :style="{ backgroundColor: stage.color }">
            <Icon :icon="stage.icon" />
          </div>
          <div class="stage-tab-title">{{ stage.title }}</div>
        </div>
      </div>

      <div class="stage-modules">
        <div class="modules-header">
          <h3>{{ currentStage.title }}</h3>
        </div>
        
        <div v-loading="loading" class="modules-grid">
          <ElCard
            v-for="module in currentStage.modules"
            :key="module.id"
            class="module-card"
            shadow="hover"
          >
            <template #header>
              <div class="module-header">
                <div class="module-title">{{ module.title }}</div>
                <div class="module-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="openAddDialog(module, activeStage)"
                  >
                    <Icon icon="lucide:plus" class="mr-1" />
                    新增
                  </ElButton>
                </div>
              </div>
            </template>

            <div class="module-description">{{ module.description }}</div>

            <div v-if="module.data.length > 0" class="module-data">
              <div
                v-for="item in module.data"
                :key="item.id"
                class="data-item"
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
                </div>
              </div>
            </div>

            <div v-else class="module-empty">
              <ElEmpty description="暂无数据" :image-size="80" />
            </div>
          </ElCard>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="showAddDialog"
      :title="`新增 - ${currentModule?.title}`"
      width="800px"
      destroy-on-close
    >
      <ElTabs v-model="activeTab" class="dialog-tabs">
        <!-- 基础数据标签页 -->
        <ElTabPane label="基础数据" name="basic">
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
          >
            <ElFormItem label="标题" prop="title">
              <ElInput v-model="formData.title" placeholder="请输入标题" />
            </ElFormItem>
            <ElFormItem label="内容" prop="content">
              <ElInput
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="请输入内容"
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

        <!-- 附件标签页 -->
        <ElTabPane label="附件" name="attachments">
          <div class="file-upload-content">
            <ElUpload
              v-model:file-list="fileList"
              :auto-upload="false"
              :on-change="handleFileUpload"
              :on-progress="handleFileProgress"
              :on-success="handleFileSuccess"
              :on-error="handleFileError"
              :disabled="uploading"
              drag
              multiple
            >
              <Icon icon="lucide:upload-cloud" class="upload-icon" />
              <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="upload-tip">
                  支持上传 doc、docx、pdf、xls、xlsx、jpg、png 等格式文件，单个文件不超过50MB
                </div>
              </template>
            </ElUpload>

            <div v-if="uploading" class="upload-progress">
              <ElProgress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
              <div class="progress-text">
                {{ uploadProgress === 100 ? '上传完成' : `正在上传... ${uploadProgress}%` }}
              </div>
            </div>

            <div v-if="fileList.length > 0" class="file-list-preview">
              <div class="file-list-title">已选择 {{ fileList.length }} 个文件</div>
              <div class="file-list-items">
                <div v-for="(file, index) in fileList" :key="file.uid || index" class="file-list-item">
                  <Icon icon="lucide:file-text" class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
      
      <template #footer>
        <ElButton @click="showAddDialog = false" :disabled="uploading">取消</ElButton>
        <ElButton type="primary" @click="handleAddSubmit" :loading="uploading">
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
}

.stage-tab-item:hover {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  transform: translateY(-4px);
}

.stage-tab-item.active {
  background: linear-gradient(180deg, #eef2ff 0%, #ffffff 100%);
}

.stage-tab-icon {
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
  transition: all 0.3s ease;
}

.stage-tab-item:hover .stage-tab-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.stage-tab-item.active .stage-tab-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
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
  min-height: 400px;
  height: 400px;
  max-height: 400px;
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
}

.data-item {
  padding: 16px;
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
}

.file-upload-content {
  padding: 24px 0;
}

.upload-icon {
  font-size: 56px;
  color: #667eea;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
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
