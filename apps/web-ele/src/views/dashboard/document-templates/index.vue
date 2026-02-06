<template>
  <div class="document-templates-page">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-title">
        <h2>文档模板管理</h2>
        <p class="subtitle">管理Word和Excel文档模板，支持表单设计、文件上传和导出功能</p>
      </div>
      <div class="header-actions">
        <ElButton type="primary" :icon="Plus" @click="showCreateDialog">
          新建模板
        </ElButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <ElCard class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">模板总数</div>
      </ElCard>
      <ElCard class="stat-card">
        <div class="stat-value">{{ stats.word }}</div>
        <div class="stat-label">Word模板</div>
      </ElCard>
      <ElCard class="stat-card">
        <div class="stat-value">{{ stats.excel }}</div>
        <div class="stat-label">Excel模板</div>
      </ElCard>
      <ElCard class="stat-card">
        <div class="stat-value">{{ stats.default }}</div>
        <div class="stat-label">默认模板</div>
      </ElCard>
    </div>

    <!-- 模板列表 -->
    <ElCard class="template-list-card">
      <template #header>
        <div class="card-header">
          <span>模板列表</span>
          <div class="header-filters">
            <ElRadioGroup v-model="filterType" size="small" @change="handleFilterChange">
              <ElRadioButton value="">全部</ElRadioButton>
              <ElRadioButton value="WORD">Word</ElRadioButton>
              <ElRadioButton value="EXCEL">Excel</ElRadioButton>
            </ElRadioGroup>
          </div>
        </div>
      </template>

      <ElTable :data="filteredTemplates" v-loading="loading" style="width: 100%">
        <ElTableColumn type="index" width="50" />
        <ElTableColumn prop="templateName" label="模板名称" min-width="180">
          <template #default="scope">
            <div class="template-name-cell">
              <ElIcon :size="20" class="template-icon">
                <Document v-if="scope.row.templateType === 'WORD'" />
                <Grid v-else />
              </ElIcon>
              <div class="template-info">
                <div class="template-name">{{ scope.row.templateName }}</div>
                <div class="template-code">{{ scope.row.templateCode }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="templateType" label="类型" width="100">
          <template #default="scope">
            <ElTag :type="scope.row.templateType === 'WORD' ? 'primary' : 'success'">
              {{ scope.row.templateType === 'WORD' ? 'Word' : 'Excel' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="isDefault" label="默认" width="80">
          <template #default="scope">
            <ElTag v-if="scope.row.isDefault" type="success">默认</ElTag>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100">
          <template #default="scope">
            <ElSwitch
              v-model="scope.row.status"
              active-value="ACTIVE"
              inactive-value="INACTIVE"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updateTime" label="更新时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="280" fixed="right">
          <template #default="scope">
            <ElButton size="small" @click="showEditDialog(scope.row)">编辑</ElButton>
            <ElButton size="small" type="primary" @click="showDesignDialog(scope.row)">设计</ElButton>
            <ElButton
              size="small"
              type="success"
              @click="showExportDialog(scope.row)"
            >导出</ElButton>
            <ElDropdown trigger="click" @command="(cmd) => handleCommand(cmd, scope.row)">
              <ElButton size="small">
                更多<ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="upload">上传文件</ElDropdownItem>
                  <ElDropdownItem command="setDefault" :disabled="scope.row.isDefault">
                    设为默认
                  </ElDropdownItem>
                  <ElDropdownItem command="history">导出历史</ElDropdownItem>
                  <ElDropdownItem command="delete" divided type="danger">删除</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 创建/编辑模板对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="formRef"
        :model="templateForm"
        :rules="formRules"
        label-width="100px"
      >
        <ElFormItem label="模板名称" prop="templateName">
          <ElInput v-model="templateForm.templateName" placeholder="请输入模板名称" />
        </ElFormItem>
        <ElFormItem label="模板编码" prop="templateCode">
          <ElInput
            v-model="templateForm.templateCode"
            placeholder="请输入模板编码，如：CLAIM_CONTRACT_001"
            :disabled="!!templateForm.id"
          />
          <div class="form-tip">模板编码必须唯一，创建后不可修改</div>
        </ElFormItem>
        <ElFormItem label="模板类型" prop="templateType">
          <ElRadioGroup v-model="templateForm.templateType" :disabled="!!templateForm.id">
            <ElRadioButton value="WORD">Word文档</ElRadioButton>
            <ElRadioButton value="EXCEL">Excel表格</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="模板描述">
          <ElInput
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </ElFormItem>
        <ElFormItem label="页面配置">
          <div class="config-input-wrapper">
            <ElInput
              v-model="templateForm.configJson"
              type="textarea"
              :rows="2"
              placeholder='{"layout": "A4", "orientation": "portrait"}'
            />
            <ElButton type="primary" link size="small" @click="showConfigTemplateDialog">
              选择模板
            </ElButton>
          </div>
          <div class="form-tip">JSON格式，用于配置页面布局等参数</div>
        </ElFormItem>
        <ElFormItem label="设为默认">
          <ElSwitch v-model="templateForm.isDefault" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveTemplate" :loading="saving">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 表单设计器对话框 -->
    <ElDialog
      v-model="designerVisible"
      title="模板表单设计器"
      width="1300px"
      :close-on-click-modal="false"
      class="designer-dialog"
      destroy-on-close
    >
      <div class="designer-info" v-if="currentTemplate">
        <ElAlert type="info" :closable="false">
          <template #title>
            当前模板: {{ currentTemplate.templateName }} ({{ currentTemplate.templateCode }})
          </template>
          <div>类型: {{ currentTemplate.templateType === 'WORD' ? 'Word文档' : 'Excel表格' }}</div>
        </ElAlert>
      </div>
      <DocumentFormDesigner
        ref="designerRef"
        :initial-template-type="currentTemplate?.templateType"
        style="height: 600px"
      />
      <template #footer>
        <ElButton @click="designerVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveDesignerConfig" :loading="saving">
          保存字段配置
        </ElButton>
      </template>
    </ElDialog>

    <!-- 导出对话框 -->
    <ElDialog
      v-model="exportVisible"
      title="导出文档"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="export-info" v-if="currentTemplate">
        <ElAlert type="info" :closable="false">
          <template #title>
            导出模板: {{ currentTemplate.templateName }}
          </template>
          <div>类型: {{ currentTemplate.templateType === 'WORD' ? 'Word文档' : 'Excel表格' }}</div>
        </ElAlert>
      </div>
      <ElForm label-width="100px">
        <ElFormItem label="文件名称">
          <ElInput v-model="exportForm.fileName" placeholder="请输入导出文件名" />
        </ElFormItem>
        <ElFormItem label="导出数据">
          <ElInput
            v-model="exportForm.dataJson"
            type="textarea"
            :rows="8"
            placeholder='{"caseName": "某某公司破产清算案", "creditorName": "张三"}'
          />
          <div class="form-tip">JSON格式，对应模板字段的数据</div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="exportVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleExport" :loading="exporting">
          导出
        </ElButton>
      </template>
    </ElDialog>

    <!-- 上传文件对话框 -->
    <ElDialog
      v-model="uploadVisible"
      title="上传模板文件"
      width="500px"
    >
      <ElUpload
        ref="uploadRef"
        drag
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        accept=".docx,.xlsx"
      >
        <ElIcon class="el-icon--upload"><Upload /></ElIcon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .docx 和 .xlsx 格式文件，文件大小不超过 10MB
          </div>
        </template>
      </ElUpload>
      <template #footer>
        <ElButton @click="uploadVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpload" :loading="uploading" :disabled="!selectedFile">
          上传
        </ElButton>
      </template>
    </ElDialog>

    <!-- 配置模板对话框 -->
    <ElDialog
      v-model="configTemplateDialogVisible"
      title="选择页面配置模板"
      width="600px"
    >
      <div class="config-template-list">
        <ElCard
          v-for="(template, index) in configTemplates"
          :key="index"
          class="config-template-card"
          @click="selectConfigTemplate(template)"
        >
          <template #header>
            <div class="template-header">
              <span class="template-name">{{ template.name }}</span>
              <ElButton type="primary" size="small" @click.stop="selectConfigTemplate(template)">
                选择
              </ElButton>
            </div>
          </template>
          <div class="template-config">
            <pre>{{ JSON.stringify(template.config, null, 2) }}</pre>
          </div>
        </ElCard>
      </div>
      <template #footer>
        <ElButton @click="configTemplateDialogVisible = false">取消</ElButton>
      </template>
    </ElDialog>

    <!-- 导出历史对话框 -->
    <ElDialog
      v-model="historyVisible"
      title="导出历史"
      width="900px"
    >
      <ElTable :data="exportHistory" v-loading="historyLoading" style="width: 100%">
        <ElTableColumn prop="fileName" label="文件名" min-width="200" />
        <ElTableColumn prop="exportType" label="类型" width="80">
          <template #default="scope">
            <ElTag :type="scope.row.exportType === 'WORD' ? 'primary' : 'success'">
              {{ scope.row.exportType === 'WORD' ? 'Word' : 'Excel' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="fileSize" label="大小" width="100">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="exportStatus" label="状态" width="100">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.exportStatus)">
              {{ getStatusLabel(scope.row.exportStatus) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="exportedByName" label="导出用户" width="120" />
        <ElTableColumn prop="exportedTime" label="导出时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.exportedTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="processingTime" label="耗时" width="100">
          <template #default="scope">
            {{ scope.row.processingTime ? `${scope.row.processingTime}ms` : '-' }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSwitch,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadioButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElAlert,
  ElUpload,
} from 'element-plus';
import {
  Plus,
  Document,
  Grid,
  ArrowDown,
  Upload,
} from '@element-plus/icons-vue';
import type { FormInstance, UploadFile, UploadInstance } from 'element-plus';
import DocumentFormDesigner from '#/components/DocumentFormDesigner.vue';
import {
  documentTemplatesApi,
  type DocumentTemplate,
  type TemplateType,
  type ExportHistory,
} from '#/api/core/document-templates';

// 加载状态
const loading = ref(false);
const saving = ref(false);
const exporting = ref(false);
const uploading = ref(false);
const historyLoading = ref(false);

// 数据列表
const templates = ref<DocumentTemplate[]>([]);
const exportHistory = ref<ExportHistory[]>([]);

// 筛选条件
const filterType = ref<TemplateType | ''>('');

// 统计
const stats = computed(() => ({
  total: templates.value.length,
  word: templates.value.filter(t => t.templateType === 'WORD').length,
  excel: templates.value.filter(t => t.templateType === 'EXCEL').length,
  default: templates.value.filter(t => t.isDefault).length,
}));

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  if (!filterType.value) return templates.value;
  return templates.value.filter(t => t.templateType === filterType.value);
});

// 当前操作的模板
const currentTemplate = ref<DocumentTemplate | null>(null);

// 对话框显示状态
const dialogVisible = ref(false);
const designerVisible = ref(false);
const exportVisible = ref(false);
const uploadVisible = ref(false);
const historyVisible = ref(false);

// 对话框标题
const dialogTitle = ref('新建模板');

// 表单引用
const formRef = ref<FormInstance>();
const designerRef = ref<InstanceType<typeof DocumentFormDesigner> | null>(null);
const uploadRef = ref<UploadInstance>();

// 表单数据
const templateForm = ref({
  id: undefined as number | undefined,
  templateName: '',
  templateCode: '',
  templateType: 'WORD' as TemplateType,
  description: '',
  configJson: '',
  isDefault: false,
});

// 导出表单
const exportForm = ref({
  fileName: '',
  dataJson: '',
});

// 上传文件
const selectedFile = ref<File | null>(null);

// 配置模板对话框
const configTemplateDialogVisible = ref(false);
const configTemplates = ref([
  {
    name: '标准A4文档',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '窄边距A4文档',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 1.91,
        bottom: 1.91,
        left: 1.91,
        right: 1.91
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '横向A4文档',
    config: {
      layout: 'A4',
      orientation: 'landscape',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: 'A3文档',
    config: {
      layout: 'A3',
      orientation: 'portrait',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '法律文书模板',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 3.81,
        bottom: 2.54,
        left: 3.81,
        right: 2.54
      },
      font: {
        name: 'SimSun',
        size: 14
      }
    }
  }
]);

// 表单验证规则
const formRules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { max: 100, message: '模板名称最多100个字符', trigger: 'blur' },
  ],
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    { max: 50, message: '模板编码最多50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '模板编码只能包含字母、数字、下划线', trigger: 'blur' },
  ],
  templateType: [
    { required: true, message: '请选择模板类型', trigger: 'change' },
  ],
};

// 加载模板列表
const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await documentTemplatesApi.getTemplates();
    if (response.code === 200) {
      templates.value = response.data;
    }
  } catch (error) {
    ElMessage.error('加载模板列表失败');
  } finally {
    loading.value = false;
  }
};

// 筛选变化
const handleFilterChange = () => {
  // 筛选已在计算属性中处理
};

// 显示创建对话框
const showCreateDialog = () => {
  dialogTitle.value = '新建模板';
  templateForm.value = {
    id: undefined,
    templateName: '',
    templateCode: '',
    templateType: 'WORD',
    description: '',
    configJson: '',
    isDefault: false,
  };
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (template: DocumentTemplate) => {
  dialogTitle.value = '编辑模板';
  templateForm.value = {
    id: template.id,
    templateName: template.templateName,
    templateCode: template.templateCode,
    templateType: template.templateType,
    description: template.description || '',
    configJson: template.configJson || '',
    isDefault: template.isDefault,
  };
  dialogVisible.value = true;
};

// 显示配置模板对话框
const showConfigTemplateDialog = () => {
  configTemplateDialogVisible.value = true;
};

// 选择配置模板
const selectConfigTemplate = (template: any) => {
  templateForm.value.configJson = JSON.stringify(template.config, null, 2);
  configTemplateDialogVisible.value = false;
  ElMessage.success(`已选择模板: ${template.name}`);
};

// 保存模板
const saveTemplate = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    saving.value = true;
    try {
      let response;
      const data = {
        templateName: templateForm.value.templateName,
        templateCode: templateForm.value.templateCode,
        templateType: templateForm.value.templateType,
        description: templateForm.value.description,
        configJson: templateForm.value.configJson,
        isDefault: templateForm.value.isDefault,
      };

      if (templateForm.value.id) {
        response = await documentTemplatesApi.updateTemplate(templateForm.value.id, {
          ...data,
          id: templateForm.value.id,
        });
      } else {
        response = await documentTemplatesApi.createTemplate(data);
      }

      if (response.code === 200) {
        ElMessage.success(templateForm.value.id ? '更新成功' : '创建成功');
        dialogVisible.value = false;
        loadTemplates();
      } else {
        ElMessage.error(response.message || '操作失败');
      }
    } catch (error) {
      ElMessage.error('操作失败');
    } finally {
      saving.value = false;
    }
  });
};

// 显示设计器对话框
const showDesignDialog = async (template: DocumentTemplate) => {
  currentTemplate.value = template;
  designerVisible.value = true;

  // 加载模板详情获取字段配置
  try {
    const response = await documentTemplatesApi.getTemplateFields(template.id);
    if (response.code === 200 && designerRef.value) {
      const fields = response.data;
      if (fields) {
        designerRef.value.setTemplateFields(fields, template.templateType);
      }
    }
  } catch (error) {
    console.error('加载模板字段失败:', error);
  }
};

// 保存设计器配置
const saveDesignerConfig = async () => {
  if (!designerRef.value || !currentTemplate.value) return;

  saving.value = true;
  try {
    const fields = designerRef.value.getTemplateFields();
    const response = await documentTemplatesApi.updateTemplate(currentTemplate.value.id, {
      id: currentTemplate.value.id,
      fields,
    });

    if (response.code === 200) {
      ElMessage.success('字段配置保存成功');
      designerVisible.value = false;
      loadTemplates();
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 显示导出对话框
const showExportDialog = (template: DocumentTemplate) => {
  currentTemplate.value = template;
  exportForm.value = {
    fileName: template.templateName,
    dataJson: '',
  };
  exportVisible.value = true;
};

// 处理导出
const handleExport = async () => {
  if (!currentTemplate.value) return;

  exporting.value = true;
  try {
    let data;
    try {
      data = JSON.parse(exportForm.value.dataJson || '{}');
    } catch {
      ElMessage.error('导出数据JSON格式错误');
      return;
    }

    const requestData = {
      templateId: currentTemplate.value.id,
      fileName: exportForm.value.fileName,
      data,
    };

    let response;
    if (currentTemplate.value.templateType === 'WORD') {
      response = await documentTemplatesApi.exportWord(currentTemplate.value.id, requestData);
    } else {
      response = await documentTemplatesApi.exportExcel(currentTemplate.value.id, requestData);
    }

    // 下载文件
    const blob = new Blob([response.data], {
      type: currentTemplate.value.templateType === 'WORD'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportForm.value.fileName}.${currentTemplate.value.templateType === 'WORD' ? 'docx' : 'xlsx'}`;
    link.click();
    URL.revokeObjectURL(link.href);

    ElMessage.success('导出成功');
    exportVisible.value = false;
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 处理更多命令
const handleCommand = async (command: string, template: DocumentTemplate) => {
  currentTemplate.value = template;

  switch (command) {
    case 'upload':
      selectedFile.value = null;
      uploadVisible.value = true;
      break;
    case 'setDefault':
      await handleSetDefault(template);
      break;
    case 'history':
      await loadExportHistory(template.id);
      historyVisible.value = true;
      break;
    case 'delete':
      await handleDelete(template);
      break;
  }
};

// 设置默认模板
const handleSetDefault = async (template: DocumentTemplate) => {
  try {
    const response = await documentTemplatesApi.setDefaultTemplate(
      template.id,
      template.templateType,
    );
    if (response.code === 200) {
      ElMessage.success('设置默认模板成功');
      loadTemplates();
    } else {
      ElMessage.error(response.message || '设置失败');
    }
  } catch (error) {
    ElMessage.error('设置失败');
  }
};

// 删除模板
const handleDelete = async (template: DocumentTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.templateName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    const response = await documentTemplatesApi.deleteTemplate(template.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadTemplates();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 状态变化
const handleStatusChange = async (template: DocumentTemplate, status: string) => {
  try {
    const response = await documentTemplatesApi.updateTemplate(template.id, {
      id: template.id,
      status: status as 'ACTIVE' | 'INACTIVE',
    });
    if (response.code === 200) {
      ElMessage.success('状态更新成功');
    } else {
      ElMessage.error(response.message || '更新失败');
      template.status = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }
  } catch (error) {
    ElMessage.error('更新失败');
    template.status = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }
};

// 文件上传相关
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
  }
};

const handleFileRemove = () => {
  selectedFile.value = null;
};

const handleUpload = async () => {
  if (!selectedFile.value || !currentTemplate.value) return;

  uploading.value = true;
  try {
    const response = await documentTemplatesApi.uploadTemplateFile(
      currentTemplate.value.id,
      selectedFile.value,
    );
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      uploadVisible.value = false;
      loadTemplates();
    } else {
      ElMessage.error(response.message || '上传失败');
    }
  } catch (error) {
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

// 加载导出历史
const loadExportHistory = async (templateId: number) => {
  historyLoading.value = true;
  try {
    const response = await documentTemplatesApi.getTemplateExportHistory(templateId);
    if (response.code === 200) {
      exportHistory.value = response.data;
    }
  } catch (error) {
    ElMessage.error('加载导出历史失败');
  } finally {
    historyLoading.value = false;
  }
};

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
  return `${(size / (1024 * 1024)).toFixed(2)}MB`;
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    SUCCESS: 'success',
    FAILED: 'danger',
    PROCESSING: 'warning',
  };
  return types[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SUCCESS: '成功',
    FAILED: '失败',
    PROCESSING: '处理中',
  };
  return labels[status] || status;
};

onMounted(() => {
  loadTemplates();
});
</script>

<style scoped>
.document-templates-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 模板列表 */
.template-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-icon {
  color: #409eff;
}

.template-info {
  display: flex;
  flex-direction: column;
}

.template-name {
  font-weight: 500;
  color: #303133;
}

.template-code {
  font-size: 12px;
  color: #909399;
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 配置输入包装器 */
.config-input-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.config-input-wrapper .el-button {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}

/* 配置模板列表 */
.config-template-list {
  max-height: 400px;
  overflow-y: auto;
}

.config-template-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.config-template-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-name {
  font-weight: 500;
  font-size: 14px;
}

.template-config {
  margin-top: 8px;
}

.template-config pre {
  margin: 0;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 150px;
  overflow-y: auto;
}

/* 设计器对话框 */
.designer-dialog :deep(.el-dialog__body) {
  padding: 10px 20px;
}

.designer-info {
  margin-bottom: 16px;
}

.export-info {
  margin-bottom: 16px;
}

/* 响应式 */
@media screen and (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
