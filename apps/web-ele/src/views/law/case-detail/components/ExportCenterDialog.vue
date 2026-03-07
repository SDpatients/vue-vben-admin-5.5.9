<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTabPane,
  ElInput,
  ElTag,
  ElMessage,
  ElMessageBox,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from 'element-plus';

import ReportGenerator from './ReportGenerator.vue';
import { documentTemplatesApi } from '#/api/core/document-templates';

interface Template {
  id: number;
  name: string;
  category: string;
  description: string;
  createTime: string;
  updateTime: string;
  downloadCount: number;
  status: 'active' | 'inactive';
}

interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
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

// 模板分类
const categories: TemplateCategory[] = [
  { id: 'all', name: '全部模板', icon: 'lucide:grid' },
  { id: 'claim-report', name: '债权报表', icon: 'lucide:file-spreadsheet' },
  { id: 'creditor-meeting', name: '债权人会议', icon: 'lucide:users' },
  { id: 'staff-attendance', name: '工作人员签到表', icon: 'lucide:clipboard-list' },
  { id: 'voting-ballot', name: '表决票', icon: 'lucide:check-square' },
  { id: 'notice', name: '通知书', icon: 'lucide:mail' },
  { id: 'other', name: '其他文档', icon: 'lucide:file-text' },
];

// 创建虚拟模板数据的函数（避免在顶层直接使用 props）
const createMockTemplatesData = (caseName?: string): Template[] => [
  {
    id: 1,
    name: `${caseName || '某某有限公司破产清算案'}已知债权人通知申报情况表`,
    category: 'claim-report',
    description: '用于记录和统计已知债权人的通知申报情况',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    downloadCount: 156,
    status: 'active',
  },
  {
    id: 2,
    name: `${caseName || '某某有限公司破产清算案'}已申报债权登记簿`,
    category: 'claim-report',
    description: '记录所有已申报债权的详细信息登记簿',
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-25 16:45:00',
    downloadCount: 289,
    status: 'active',
  },
  {
    id: 3,
    name: `${caseName || '某某有限公司破产清算案'}破产清算案债权表`,
    category: 'claim-report',
    description: '破产清算案件债权明细表格',
    createTime: '2024-01-12 11:20:00',
    updateTime: '2024-01-22 10:15:00',
    downloadCount: 234,
    status: 'active',
  },
  {
    id: 4,
    name: '第一次债权人会议签到表',
    category: 'creditor-meeting',
    description: '第一次债权人会议参会人员签到表格',
    createTime: '2024-01-18 14:00:00',
    updateTime: '2024-01-18 14:00:00',
    downloadCount: 98,
    status: 'active',
  },
  {
    id: 5,
    name: '第二次债权人会议签到表',
    category: 'creditor-meeting',
    description: '第二次债权人会议参会人员签到表格',
    createTime: '2024-01-20 09:30:00',
    updateTime: '2024-01-20 09:30:00',
    downloadCount: 87,
    status: 'active',
  },
  {
    id: 6,
    name: '债权人会议表决票',
    category: 'voting-ballot',
    description: '债权人会议表决用标准票样',
    createTime: '2024-01-16 10:00:00',
    updateTime: '2024-01-16 10:00:00',
    downloadCount: 176,
    status: 'active',
  },
  {
    id: 7,
    name: '重整计划草案表决票',
    category: 'voting-ballot',
    description: '重整计划草案表决专用票样',
    createTime: '2024-01-19 15:30:00',
    updateTime: '2024-01-19 15:30:00',
    downloadCount: 145,
    status: 'active',
  },
  {
    id: 8,
    name: '工作人员签到表',
    category: 'staff-attendance',
    description: '破产案件工作人员日常工作签到表',
    createTime: '2024-01-08 08:00:00',
    updateTime: '2024-01-08 08:00:00',
    downloadCount: 312,
    status: 'active',
  },
  {
    id: 9,
    name: '债权申报通知书',
    category: 'notice',
    description: '通知债权人申报债权的标准文书',
    createTime: '2024-01-05 10:00:00',
    updateTime: '2024-01-05 10:00:00',
    downloadCount: 267,
    status: 'active',
  },
  {
    id: 10,
    name: '债权人会议通知书',
    category: 'notice',
    description: '通知债权人参加会议的标准文书',
    createTime: '2024-01-14 11:00:00',
    updateTime: '2024-01-14 11:00:00',
    downloadCount: 198,
    status: 'active',
  },
  {
    id: 11,
    name: '管理人工作报告模板',
    category: 'other',
    description: '管理人阶段性工作报告标准模板',
    createTime: '2024-01-11 13:00:00',
    updateTime: '2024-01-11 13:00:00',
    downloadCount: 223,
    status: 'active',
  },
  {
    id: 12,
    name: '财产状况调查报告模板',
    category: 'other',
    description: '债务人财产状况调查报告标准模板',
    createTime: '2024-01-13 16:00:00',
    updateTime: '2024-01-13 16:00:00',
    downloadCount: 189,
    status: 'active',
  },
];

const activeCategory = ref('all');
const searchKeyword = ref('');
const selectedTemplates = ref<number[]>([]);
const showReportGenerator = ref(false);
const templatesData = ref<Template[]>([]);

// 初始化默认模板数据
const initDefaultTemplates = () => {
  templatesData.value = createMockTemplatesData(props.caseName);
};

// 获取模板列表（调用真实 API）
const fetchTemplates = async () => {
  try {
    const response = await documentTemplatesApi.getTemplatesByDescription('债权');
    if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
      const mappedData = response.data.map((template, index) => ({
        id: template.id,
        name: template.templateName,
        category: getCategoryFromTemplate(template),
        description: template.description || '',
        createTime: template.createTime,
        updateTime: template.updateTime,
        downloadCount: Math.floor(Math.random() * 300),
        status: template.status === 'ACTIVE' ? 'active' : 'inactive',
        filePath: template.filePath,
      }));
      
      templatesData.value = mappedData.length > 0 ? mappedData : createMockTemplatesData(props.caseName);
    } else {
      templatesData.value = createMockTemplatesData(props.caseName);
    }
  } catch (error) {
    console.error('获取模板列表失败:', error);
    templatesData.value = createMockTemplatesData(props.caseName);
  }
};

// 根据模板信息分类
const getCategoryFromTemplate = (template: any): string => {
  const name = template.templateName?.toLowerCase() || '';
  if (name.includes('债权') && name.includes('报表')) return 'claim-report';
  if (name.includes('债权人会议')) return 'creditor-meeting';
  if (name.includes('签到')) return 'staff-attendance';
  if (name.includes('表决')) return 'voting-ballot';
  if (name.includes('通知')) return 'notice';
  return 'other';
};

// 计算属性：根据分类和搜索关键词过滤模板
const filteredTemplates = computed(() => {
  const data = templatesData.value;
  if (!data || !Array.isArray(data)) {
    console.warn('templatesData is not an array:', data);
    return [];
  }
  return data.filter((template) => {
    if (!template || typeof template !== 'object') return false;
    const matchCategory = activeCategory.value === 'all' || template.category === activeCategory.value;
    const matchSearch = !searchKeyword.value || 
      (template.name && template.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (template.description && template.description.toLowerCase().includes(searchKeyword.value.toLowerCase()));
    return matchCategory && matchSearch;
  });
});

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
};

// 获取状态标签类型
const getStatusTagType = (status: 'active' | 'inactive') => {
  return status === 'active' ? 'success' : 'info';
};

// 导出模板
const handleExport = (template: Template) => {
  ElMessage.success(`正在导出：${template.name}`);
};

// 批量导出
const handleBatchExport = () => {
  if (selectedTemplates.value.length === 0) {
    ElMessage.warning('请选择要导出的模板');
    return;
  }
  ElMessage.success(`正在导出 ${selectedTemplates.value.length} 个模板`);
};

// 预览模板
const handlePreview = (template: Template) => {
  ElMessage.info(`预览模板：${template.name}`);
};

// 编辑模板
const handleEdit = (template: Template) => {
  ElMessage.info(`编辑模板：${template.name}`);
};

// 删除模板
const handleDelete = (template: Template) => {
  ElMessageBox.confirm(
    `确定要删除模板"${template.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功');
  }).catch(() => {
  });
};

// 下载模板
const handleDownload = (template: Template) => {
  ElMessage.success(`开始下载：${template.name}`);
};

// 新建模板
const handleCreateTemplate = () => {
  ElMessage.info('新建模板功能开发中');
};

// 打开报表生成器
const openReportGenerator = () => {
  showReportGenerator.value = true;
};

// 全选/取消全选
const handleToggleSelectAll = (selection: any[]) => {
  selectedTemplates.value = selection.map(item => item.id);
};

// 监听对话框打开状态，每次打开时重新加载数据
watch(
  () => dialogVisible.value,
  (newVal) => {
    if (newVal) {
      // 对话框打开时加载数据
      initDefaultTemplates();
      fetchTemplates();
    }
  },
  { immediate: true }
);
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    title="导出中心 - 文档模板管理中心"
    width="1200px"
    :close-on-click-modal="false"
  >
    <div class="export-center-container">
      <!-- 顶部操作栏 -->
      <div class="toolbar mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索模板名称或描述"
            clearable
            class="w-64"
          >
            <template #prefix>
              <Icon icon="lucide:search" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleCreateTemplate">
            <Icon icon="lucide:plus" class="mr-1" />
            新建模板
          </ElButton>
          <ElButton
            type="success"
            :disabled="selectedTemplates.length === 0"
            @click="handleBatchExport"
          >
            <Icon icon="lucide:download" class="mr-1" />
            批量导出 ({{ selectedTemplates.length }})
          </ElButton>
        </div>
      </div>

      <!-- 分类标签页 -->
      <ElTabs v-model="activeCategory" type="border-card" class="mb-4">
        <ElTabPane
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :name="category.id"
        >
          <template #label>
            <div class="flex items-center">
              <Icon :icon="category.icon" class="mr-1" />
              <span>{{ category.name }}</span>
            </div>
          </template>
        </ElTabPane>
      </ElTabs>

      <!-- 模板列表表格 -->
      <ElTable
        :data="filteredTemplates"
        style="width: 100%"
        @selection-change="handleToggleSelectAll"
      >
        <ElTableColumn
          type="selection"
          width="55"
          :selectable="(row: Template) => row.status === 'active'"
        />
        <ElTableColumn type="index" label="序号" width="60" />
        <ElTableColumn prop="name" label="模板名称" min-width="300" show-overflow-tooltip />
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="分类" width="120">
          <template #default="{ row }">
            <ElTag size="small">{{ getCategoryName(row.category) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="80">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="downloadCount" label="下载次数" width="100" sortable />
        <ElTableColumn prop="updateTime" label="更新时间" width="160" sortable />
        <ElTableColumn label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="handleDownload(row)">
              <Icon icon="lucide:download" class="mr-1" />
              下载
            </ElButton>
            <ElButton link type="success" @click="handleExport(row)">
              <Icon icon="lucide:file-output" class="mr-1" />
              导出
            </ElButton>
            <ElDropdown trigger="click">
              <ElButton link type="primary">
                更多<Icon icon="lucide:chevron-down" class="ml-1" />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="handlePreview(row)">
                    <Icon icon="lucide:eye" class="mr-1" />
                    预览
                  </ElDropdownItem>
                  <ElDropdownItem @click="handleEdit(row)">
                    <Icon icon="lucide:edit" class="mr-1" />
                    编辑
                  </ElDropdownItem>
                  <ElDropdownItem divided @click="handleDelete(row)">
                    <Icon icon="lucide:trash-2" class="mr-1" />
                    删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 统计信息 -->
      <div class="statistics mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          共 {{ filteredTemplates.length }} 个模板
          <span v-if="selectedTemplates.length > 0">
            ，已选择 {{ selectedTemplates.length }} 个
          </span>
        </div>
        <div>
          当前案件：{{ props.caseName || '未选择案件' }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="openReportGenerator">
          <Icon icon="lucide:circle-play" class="mr-1" />
          生成报表
        </ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 报表生成器 -->
  <ReportGenerator
    v-model="showReportGenerator"
    :case-id="props.caseId"
    :case-name="props.caseName"
  />
</template>

<style scoped>
.export-center-container {
  padding: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics {
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tabs__item) {
  height: auto;
  padding: 8px 16px;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}
</style>
