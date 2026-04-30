<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElSelect,
  ElOption,
  ElInput,
  ElTag,
  ElMessage,
  ElMessageBox,
  ElCard,
  ElRow,
  ElCol,
  ElStatistic,
  ElDivider,
  ElRadioGroup,
  ElRadioButton,
  ElCheckbox,
  ElCheckboxGroup,
} from 'element-plus';

import { queryCreditorClaimsApi } from '#/api/core/creditor-claim-query';
import { documentTemplatesApi } from '#/api/core/document-templates';

interface Creditor {
  id: number;
  creditorName: string;
  creditorType: string;
  claimType: string;
  declaredAmount: number;
  confirmedAmount: number;
  unconfirmedAmount: number;
  registrationStatus: string;
}

interface ReportTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
}

interface ReportData {
  creditorName: string;
  creditorType: string;
  claimType: string;
  declaredPrincipal: number;
  declaredInterest: number;
  declaredPenalty: number;
  declaredOtherLosses: number;
  declaredTotalAmount: number;
  confirmedPrincipal: number;
  confirmedInterest: number;
  confirmedPenalty: number;
  confirmedOtherLosses: number;
  confirmedTotalAmount: number;
  unconfirmedAmount: number;
  confirmationRate: number;
}

const props = defineProps<{
  modelValue: boolean;
  caseId?: string;
  caseName?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 债权人列表
const creditors = ref<Creditor[]>([]);
const selectedCreditors = ref<number[]>([]);
const searchKeyword = ref('');
const creditorTypeFilter = ref('');
const claimTypeFilter = ref('');

// 模板选择
const selectedTemplate = ref('');
const reportTemplates = ref<any[]>([]);

// 报表数据
const reportData = ref<ReportData[]>([]);
const generated = ref(false);

// 初始化默认数据
const initDefaultData = () => {
  creditors.value = [...mockCreditors];
  reportTemplates.value = [...defaultTemplates];
};

// 模板配置映射（根据模板类型确定表头位置）
const templateConfigMap: Record<string, { headerRow: number; startRow: number }> = {
  '债权申报情况汇总表': { headerRow: 1, startRow: 2 },
  '债权确认明细表': { headerRow: 1, startRow: 2 },
  '债权分类统计表': { headerRow: 1, startRow: 2 },
  '债权审核进度表': { headerRow: 1, startRow: 2 },
  // 可以根据实际模板调整
  '债权人会议签到表': { headerRow: 5, startRow: 6 },
  '表决票': { headerRow: 3, startRow: 4 },
};

// 获取模板配置
const getTemplateConfig = (templateName: string) => {
  // 模糊匹配模板名称
  for (const [key, config] of Object.entries(templateConfigMap)) {
    if (templateName.includes(key)) {
      return config;
    }
  }
  // 默认配置
  return { headerRow: 1, startRow: 2 };
};

// 统计数据
const totalDeclaredAmount = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.declaredTotalAmount, 0);
});

const totalConfirmedAmount = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.confirmedTotalAmount, 0);
});

const totalUnconfirmedAmount = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.unconfirmedAmount, 0);
});

const averageConfirmationRate = computed(() => {
  if (reportData.value.length === 0) return 0;
  const totalRate = reportData.value.reduce((sum, item) => sum + item.confirmationRate, 0);
  return totalRate / reportData.value.length;
});

// 虚拟债权人数据（仅用于 API 调用失败时的备用数据）
const mockCreditors: Creditor[] = [
  {
    id: 1,
    creditorName: '某某银行',
    creditorType: '金融机构',
    claimType: '有担保债权',
    declaredAmount: 5000000,
    confirmedAmount: 4800000,
    unconfirmedAmount: 200000,
    registrationStatus: 'CONFIRMED',
  },
  {
    id: 2,
    creditorName: '张三',
    creditorType: '个人',
    claimType: '普通债权',
    declaredAmount: 100000,
    confirmedAmount: 100000,
    unconfirmedAmount: 0,
    registrationStatus: 'CONFIRMED',
  },
  {
    id: 3,
    creditorName: '李四',
    creditorType: '个人',
    claimType: '普通债权',
    declaredAmount: 150000,
    confirmedAmount: 120000,
    unconfirmedAmount: 30000,
    registrationStatus: 'CONFIRMING',
  },
  {
    id: 4,
    creditorName: '某某供应商',
    creditorType: '企业',
    claimType: '普通债权',
    declaredAmount: 300000,
    confirmedAmount: 0,
    unconfirmedAmount: 300000,
    registrationStatus: 'REVIEWING',
  },
  {
    id: 5,
    creditorName: '王五',
    creditorType: '个人',
    claimType: '职工债权',
    declaredAmount: 50000,
    confirmedAmount: 50000,
    unconfirmedAmount: 0,
    registrationStatus: 'CONFIRMED',
  },
];

// 获取债权人列表（调用真实 API）
const fetchCreditors = async (searchParams?: {
  creditorName?: string;
  creditorType?: string;
  claimType?: string;
}) => {
  try {
    if (!props.caseId) {
      ElMessage.warning('未找到案件 ID，使用模拟数据');
      creditors.value = [...mockCreditors];
      return;
    }

    const params: any = {
      caseId: props.caseId,
    };

    if (searchParams?.creditorName) {
      params.creditorName = searchParams.creditorName;
    }
    if (searchParams?.creditorType) {
      params.creditorType = searchParams.creditorType;
    }
    if (searchParams?.claimType) {
      params.claimType = searchParams.claimType;
    }

    const response = await queryCreditorClaimsApi(params);
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      creditors.value = response.data.map((item, index) => ({
        id: index + 1, // 生成临时 ID
        creditorName: item.creditorName,
        creditorType: item.creditorType,
        claimType: item.claimType,
        declaredAmount: item.declaredAmount,
        confirmedAmount: item.confirmedAmount,
        unconfirmedAmount: item.unconfirmedAmount,
        registrationStatus: item.registrationStatus,
      }));
    } else {
      ElMessage.warning('未获取到债权人数据，使用模拟数据');
      creditors.value = [...mockCreditors];
    }
  } catch (error) {
    console.error('获取债权人列表失败:', error);
    ElMessage.error('获取债权人数据失败，使用模拟数据');
    creditors.value = [...mockCreditors];
  }
};

// 防抖函数
let searchDebounceTimer: NodeJS.Timeout | null = null;
const handleSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    fetchCreditors({
      creditorName: searchKeyword.value,
      creditorType: creditorTypeFilter.value,
      claimType: claimTypeFilter.value,
    });
  }, 300);
};

// 默认模板数据
const defaultTemplates = [
  {
    id: 1,
    name: '债权申报情况汇总表',
    category: '汇总报表',
    description: '汇总展示所有选中债权人的申报和确认情况',
  },
  {
    id: 2,
    name: '债权确认明细表',
    category: '明细报表',
    description: '详细展示每个债权人的债权确认明细',
  },
  {
    id: 3,
    name: '债权分类统计表',
    category: '统计报表',
    description: '按债权类型分类统计申报和确认金额',
  },
  {
    id: 4,
    name: '债权审核进度表',
    category: '进度报表',
    description: '展示债权审核的进度和状态',
  },
];

// 获取债权模板列表（调用真实 API）
const fetchTemplates = async () => {
  try {
    const response = await documentTemplatesApi.getTemplatesByDescription('债权');
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      const mappedData = response.data.map(template => ({
        id: template.id,
        name: template.templateName,
        category: template.templateType,
        description: template.description || '',
        filePath: template.filePath,
        templateCode: template.templateCode,
      }));
      
      reportTemplates.value = mappedData.length > 0 ? mappedData : [...defaultTemplates];
    } else {
      reportTemplates.value = [...defaultTemplates];
    }
  } catch (error) {
    console.error('获取模板列表失败:', error);
    reportTemplates.value = [...defaultTemplates];
  }
};

// 筛选债权人（现在通过 API 进行筛选，这里只做安全检查）
const filteredCreditors = computed(() => {
  const data = creditors.value;
  if (!data || !Array.isArray(data)) {
    console.warn('creditors is not an array:', data);
    return [];
  }
  return data;
});

// 获取债权类型选项
const creditorTypeOptions = computed(() => {
  const types = new Set(creditors.value.map(c => c.creditorType));
  return Array.from(types);
});

const claimTypeOptions = computed(() => {
  const types = new Set(creditors.value.map(c => c.claimType));
  return Array.from(types);
});

// 生成报表数据
const generateReportData = () => {
  if (selectedCreditors.value.length === 0) {
    ElMessage.warning('请至少选择一个债权人');
    return;
  }
  
  if (!selectedTemplate.value) {
    ElMessage.warning('请选择报表模板');
    return;
  }

  // 根据选中的债权人生成报表数据
  const selectedCreditorList = creditors.value.filter(c =>
    selectedCreditors.value.includes(c.id)
  );

  reportData.value = selectedCreditorList.map((creditor) => {
    // 模拟详细的债权数据（实际应从 API 获取）
    const declaredPrincipal = creditor.declaredAmount * 0.8;
    const declaredInterest = creditor.declaredAmount * 0.1;
    const declaredPenalty = creditor.declaredAmount * 0.05;
    const declaredOtherLosses = creditor.declaredAmount * 0.05;
    
    const confirmedPrincipal = creditor.confirmedAmount * 0.8;
    const confirmedInterest = creditor.confirmedAmount * 0.1;
    const confirmedPenalty = creditor.confirmedAmount * 0.05;
    const confirmedOtherLosses = creditor.confirmedAmount * 0.05;
    
    const confirmationRate = creditor.declaredAmount > 0
      ? (creditor.confirmedAmount / creditor.declaredAmount) * 100
      : 0;

    return {
      creditorName: creditor.creditorName,
      creditorType: creditor.creditorType,
      claimType: creditor.claimType,
      declaredPrincipal,
      declaredInterest,
      declaredPenalty,
      declaredOtherLosses,
      declaredTotalAmount: creditor.declaredAmount,
      confirmedPrincipal,
      confirmedInterest,
      confirmedPenalty,
      confirmedOtherLosses,
      confirmedTotalAmount: creditor.confirmedAmount,
      unconfirmedAmount: creditor.unconfirmedAmount,
      confirmationRate,
    };
  });

  generated.value = true;
  ElMessage.success('报表生成成功');
};

// 导出报表
const exportReport = async () => {
  if (!generated.value) {
    ElMessage.warning('请先生成报表');
    return;
  }

  if (!selectedTemplate.value) {
    ElMessage.warning('请选择报表模板');
    return;
  }

  try {
    // 查找选中的模板
    const template = reportTemplates.value.find(t => t.name === selectedTemplate.value);
    if (!template) {
      ElMessage.error('未找到对应的模板');
      return;
    }

    ElMessage.success('正在生成 Excel 文件...');
    
    // 获取模板配置（表头位置等）
    const templateConfig = getTemplateConfig(template.name);
    
    console.log('导出参数:', {
      templateId: template.id,
      fileName: `${template.name}_${new Date().getTime()}`,
      dataList: reportData.value,
      options: {
        mergeCells: false,
        addIndex: true,
        sheetName: '债权报表',
        startRow: templateConfig.startRow,
        headerRow: templateConfig.headerRow,
      },
    });
    
    // 使用 fetch API 直接调用后端接口
    const token = localStorage.getItem('token');
    const formattedToken = token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
    
    const fetchUrl = `${import.meta.env.VITE_API_URL_8080 || '/api/v1'}/document-templates/batch-export/excel`;
    
    const fetchResponse = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': formattedToken || '',
      },
      body: JSON.stringify({
        templateId: template.id,
        fileName: `${template.name}_${new Date().getTime()}`,
        dataList: reportData.value.map(item => ({
          creditorName: item.creditorName,
          creditorType: item.creditorType,
          claimType: item.claimType,
          declaredPrincipal: item.declaredPrincipal,
          declaredInterest: item.declaredInterest,
          declaredPenalty: item.declaredPenalty,
          declaredOtherLosses: item.declaredOtherLosses,
          declaredTotalAmount: item.declaredTotalAmount,
          confirmedPrincipal: item.confirmedPrincipal,
          confirmedInterest: item.confirmedInterest,
          confirmedPenalty: item.confirmedPenalty,
          confirmedOtherLosses: item.confirmedOtherLosses,
          confirmedTotalAmount: item.confirmedTotalAmount,
          unconfirmedAmount: item.unconfirmedAmount,
          confirmationRate: item.confirmationRate,
        })),
        options: {
          mergeCells: false,
          addIndex: true,
          sheetName: '债权报表',
          startRow: templateConfig.startRow,
          headerRow: templateConfig.headerRow,
        },
      }),
    });

    console.log('Fetch 响应状态:', fetchResponse.status);
    console.log('Fetch 响应头:', fetchResponse.headers);

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('服务器错误响应:', errorText);
      throw new Error(`导出失败：HTTP ${fetchResponse.status} - ${errorText}`);
    }

    const blob = await fetchResponse.blob();
    console.log('获取到 Blob:', blob);
    console.log('Blob 类型:', blob.type);
    console.log('Blob 大小:', blob.size, 'bytes');

    if (!blob || blob.size === 0) {
      throw new Error('导出的文件为空');
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}_${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error: any) {
    console.error('导出失败:', error);
    let errorMessage = '导出失败，请重试';
    if (error.message) {
      errorMessage = `导出失败：${error.message}`;
    }
    ElMessage.error(errorMessage);
  }
};

// 打印报表
const printReport = () => {
  if (!generated.value) {
    ElMessage.warning('请先生成报表');
    return;
  }

  ElMessage.info('打印功能开发中');
  // TODO: 实现打印功能
};

// 重置
const resetReport = () => {
  selectedCreditors.value = [];
  selectedTemplate.value = '';
  reportData.value = [];
  generated.value = false;
  ElMessage.success('已重置');
};

// 全选/取消全选
const handleToggleSelectAll = (selection: any[]) => {
  selectedCreditors.value = selection.map(item => item.id);
};

// 切换单个选择
const handleToggleSelection = (selection: any[], row: Creditor) => {
  const index = selectedCreditors.value.indexOf(row.id);
  if (index > -1) {
    selectedCreditors.value.splice(index, 1);
  } else {
    selectedCreditors.value.push(row.id);
  }
};

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    'CONFIRMED': 'success',
    'CONFIRMING': 'primary',
    'REVIEWING': 'warning',
    'PENDING': 'info',
    'REJECTED': 'danger',
  };
  return typeMap[status] || 'info';
};

// 状态文本映射
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'CONFIRMED': '已确认',
    'CONFIRMING': '确认中',
    'REVIEWING': '审查中',
    'PENDING': '待处理',
    'REJECTED': '已驳回',
  };
  return textMap[status] || status;
};

// 格式化金额
const formatAmount = (amount: number) => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 格式化百分比
const formatPercent = (percent: number) => {
  return `${percent.toFixed(2)}%`;
};

// 监听对话框打开状态，每次打开时重新加载数据
watch(
  () => dialogVisible.value,
  (newVal) => {
    if (newVal) {
      // 对话框打开时加载数据
      initDefaultData();
      fetchCreditors();
      fetchTemplates();
    }
  },
  { immediate: true }
);
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    title="报表生成中心"
    width="1400px"
    :close-on-click-modal="false"
    top="5vh"
  >
    <div class="report-generator-container">
      <!-- 步骤指示 -->
      <div class="steps mb-6">
        <ElRow :gutter="20">
          <ElCol :span="8">
            <div class="step-item" :class="{ active: !generated }">
              <div class="step-number">1</div>
              <div class="step-title">选择债权人</div>
              <div class="step-desc">选择一个或多个债权人</div>
            </div>
          </ElCol>
          <ElCol :span="8">
            <div class="step-item" :class="{ active: !generated }">
              <div class="step-number">2</div>
              <div class="step-title">选择模板</div>
              <div class="step-desc">选择报表模板类型</div>
            </div>
          </ElCol>
          <ElCol :span="8">
            <div class="step-item" :class="{ active: generated }">
              <div class="step-number">3</div>
              <div class="step-title">生成报表</div>
              <div class="step-desc">预览和导出报表</div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <ElDivider />

      <!-- 步骤 1: 选择债权人 -->
      <div v-if="!generated" class="step-content">
        <ElCard shadow="hover" class="mb-4">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:users" class="mr-2 text-primary" />
                <span class="text-lg font-semibold">选择债权人</span>
              </div>
              <div class="text-sm text-gray-500">
                已选择 <span class="text-primary font-semibold">{{ selectedCreditors.length }}</span> 个债权人
              </div>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="flex gap-2 mb-4">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索债权人名称"
              clearable
              class="w-64"
              @input="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <Icon icon="lucide:search" />
              </template>
            </ElInput>
            <ElSelect
              v-model="creditorTypeFilter"
              placeholder="债权人类型"
              clearable
              class="w-40"
              @change="handleSearch"
              @clear="handleSearch"
            >
              <ElOption
                v-for="type in creditorTypeOptions"
                :key="type"
                :label="type"
                :value="type"
              />
            </ElSelect>
            <ElSelect
              v-model="claimTypeFilter"
              placeholder="债权类型"
              clearable
              class="w-40"
              @change="handleSearch"
              @clear="handleSearch"
            >
              <ElOption
                v-for="type in claimTypeOptions"
                :key="type"
                :label="type"
                :value="type"
              />
            </ElSelect>
          </div>

          <!-- 债权人列表表格 -->
          <ElTable
            :data="filteredCreditors"
            style="width: 100%"
            @selection-change="handleToggleSelectAll"
            border
          >
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn type="index" label="序号" width="60" />
            <ElTableColumn prop="creditorName" label="债权人名称" min-width="150" />
            <ElTableColumn prop="creditorType" label="债权人类型" width="120">
              <template #default="{ row }">
                <ElTag size="small">{{ row.creditorType }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="claimType" label="债权类型" width="120">
              <template #default="{ row }">
                <ElTag size="small" type="info">{{ row.claimType }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="declaredAmount" label="申报金额" width="140" align="right">
              <template #default="{ row }">
                <span class="text-orange-600 font-semibold">
                  {{ formatAmount(row.declaredAmount) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="confirmedAmount" label="确认金额" width="140" align="right">
              <template #default="{ row }">
                <span class="text-green-600 font-semibold">
                  {{ formatAmount(row.confirmedAmount) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="unconfirmedAmount" label="未确认金额" width="140" align="right">
              <template #default="{ row }">
                <span class="text-red-600 font-semibold">
                  {{ formatAmount(row.unconfirmedAmount) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="100">
              <template #default="{ row }">
                <ElTag :type="getStatusTagType(row.registrationStatus)" size="small">
                  {{ getStatusText(row.registrationStatus) }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>

        <!-- 步骤 2: 选择模板 -->
        <ElCard shadow="hover">
          <template #header>
            <div class="flex items-center">
              <Icon icon="lucide:file-template" class="mr-2 text-primary" />
              <span class="text-lg font-semibold">选择报表模板</span>
            </div>
          </template>

          <ElRadioGroup v-model="selectedTemplate" class="w-full">
            <ElRow :gutter="20">
              <ElCol
                v-for="template in reportTemplates"
                :key="template.id"
                :xs="24"
                :sm="12"
                :md="8"
                class="mb-4"
              >
                <ElRadioButton
                  :value="template.name"
                  class="template-radio-card w-full"
                >
                  <div class="template-card-content">
                    <div class="template-card-title">{{ template.name }}</div>
                    <div class="template-card-category">
                      <ElTag size="small">{{ template.category }}</ElTag>
                    </div>
                    <div class="template-card-desc">{{ template.description }}</div>
                  </div>
                </ElRadioButton>
              </ElCol>
            </ElRow>
          </ElRadioGroup>
        </ElCard>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2 mt-4">
          <ElButton @click="resetReport">重置</ElButton>
          <ElButton type="primary" @click="generateReportData" :disabled="selectedCreditors.length === 0 || !selectedTemplate">
            <Icon icon="lucide:circle-play" class="mr-1" />
            生成报表
          </ElButton>
        </div>
      </div>

      <!-- 步骤 3: 报表预览 -->
      <div v-else class="step-content">
        <!-- 统计卡片 -->
        <ElRow :gutter="20" class="mb-4">
          <ElCol :xs="24" :sm="12" :md="6">
            <ElCard shadow="hover" class="stat-card">
              <ElStatistic title="申报总金额" :value="totalDeclaredAmount" prefix="¥">
                <template #suffix>
                  <div class="text-xs text-gray-500">元</div>
                </template>
              </ElStatistic>
            </ElCard>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6">
            <ElCard shadow="hover" class="stat-card">
              <ElStatistic title="确认总金额" :value="totalConfirmedAmount" prefix="¥">
                <template #suffix>
                  <div class="text-xs text-gray-500">元</div>
                </template>
              </ElStatistic>
            </ElCard>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6">
            <ElCard shadow="hover" class="stat-card">
              <ElStatistic title="未确认金额" :value="totalUnconfirmedAmount" prefix="¥">
                <template #suffix>
                  <div class="text-xs text-gray-500">元</div>
                </template>
              </ElStatistic>
            </ElCard>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6">
            <ElCard shadow="hover" class="stat-card">
              <ElStatistic title="平均确认率" :value="averageConfirmationRate" suffix="%">
                <template #prefix>
                  <div class="text-xs text-gray-500">%</div>
                </template>
              </ElStatistic>
            </ElCard>
          </ElCol>
        </ElRow>

        <!-- 报表数据表格 -->
        <ElCard shadow="hover" class="mb-4">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:table" class="mr-2 text-primary" />
                <span class="text-lg font-semibold">报表数据预览</span>
              </div>
              <ElTag type="info">{{ selectedTemplate }}</ElTag>
            </div>
          </template>

          <ElTable
            :data="reportData"
            style="width: 100%"
            border
            :default-sort="{ prop: 'declaredTotalAmount', order: 'descending' }"
          >
            <ElTableColumn type="index" label="序号" width="60" fixed />
            <ElTableColumn prop="creditorName" label="债权人名称" min-width="150" fixed />
            <ElTableColumn prop="creditorType" label="债权人类型" width="120" />
            <ElTableColumn prop="claimType" label="债权类型" width="120" />
            
            <ElTableColumn label="申报金额明细" align="center">
              <ElTableColumn prop="declaredPrincipal" label="本金" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.declaredPrincipal) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="declaredInterest" label="利息" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.declaredInterest) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="declaredPenalty" label="违约金" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.declaredPenalty) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="declaredOtherLosses" label="其他损失" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.declaredOtherLosses) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="declaredTotalAmount" label="合计" width="120" align="right" sortable>
                <template #default="{ row }">
                  <span class="text-orange-600 font-bold">
                    {{ formatAmount(row.declaredTotalAmount) }}
                  </span>
                </template>
              </ElTableColumn>
            </ElTableColumn>

            <ElTableColumn label="确认金额明细" align="center">
              <ElTableColumn prop="confirmedPrincipal" label="本金" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.confirmedPrincipal) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="confirmedInterest" label="利息" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.confirmedInterest) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="confirmedPenalty" label="违约金" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.confirmedPenalty) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="confirmedOtherLosses" label="其他损失" width="100" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.confirmedOtherLosses) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="confirmedTotalAmount" label="合计" width="120" align="right" sortable>
                <template #default="{ row }">
                  <span class="text-green-600 font-bold">
                    {{ formatAmount(row.confirmedTotalAmount) }}
                  </span>
                </template>
              </ElTableColumn>
            </ElTableColumn>

            <ElTableColumn prop="unconfirmedAmount" label="未确认金额" width="120" align="right" sortable>
              <template #default="{ row }">
                <span class="text-red-600 font-semibold">
                  {{ formatAmount(row.unconfirmedAmount) }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="confirmationRate" label="确认率" width="100" align="right" sortable>
              <template #default="{ row }">
                <ElTag
                  :type="row.confirmationRate >= 80 ? 'success' : row.confirmationRate >= 50 ? 'warning' : 'danger'"
                  size="small"
                >
                  {{ formatPercent(row.confirmationRate) }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2">
          <ElButton @click="generated = false">
            <Icon icon="lucide:arrow-left" class="mr-1" />
            返回修改
          </ElButton>
          <ElButton @click="resetReport">重新生成</ElButton>
          <ElButton type="success" @click="exportReport">
            <Icon icon="lucide:download" class="mr-1" />
            导出 Excel
          </ElButton>
          <ElButton type="primary" @click="printReport">
            <Icon icon="lucide:printer" class="mr-1" />
            打印报表
          </ElButton>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.report-generator-container {
  padding: 10px;
}

/* 步骤样式 */
.steps {
  display: flex;
  justify-content: space-between;
}

.step-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s;
}

.step-item.active {
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

.step-number {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  background: #d9d9d9;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto 10px;
}

.step-item.active .step-number {
  background: #1890ff;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.step-desc {
  font-size: 12px;
  color: #999;
}

/* 模板卡片样式 */
.template-radio-card {
  width: 100%;
}

.template-radio-card :deep(.el-radio-button__inner) {
  width: 100%;
  text-align: left;
  padding: 15px;
  height: auto;
  white-space: normal;
}

.template-card-content {
  padding: 5px;
}

.template-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.template-card-category {
  margin-bottom: 8px;
}

.template-card-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* 统计卡片样式 */
.stat-card {
  margin-bottom: 20px;
}

.stat-card :deep(.el-statistic__title) {
  font-size: 14px;
}

.stat-card :deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: bold;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
