<script lang="ts" setup>
import type { DocumentTemplate } from '#/api/core/document-templates';

import { ref, watch } from 'vue';

import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { documentTemplatesApi } from '#/api/core/document-templates';

interface FieldMapping {
  sourceField: string;
  targetField: string;
}

interface ExportOptions {
  sheetName: string;
  startRow: number;
  mergeCells: boolean;
  addIndex: boolean;
  fileName: string;
}

interface Props {
  visible: boolean;
  selectedData: any[];
  fieldMapping: Record<string, string>;
  defaultFileName?: string;
  defaultSheetName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultFileName: '批量导出数据',
  defaultSheetName: '数据列表',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'export-success': [count: number];
  'export-error': [error: any];
}>();

const dialogVisible = ref(props.visible);
const loading = ref(false);
const availableTemplates = ref<DocumentTemplate[]>([]);
const selectedTemplate = ref<DocumentTemplate | null>(null);
const templateFields = ref<Array<{ key: string; label: string; value: string }>>([]);

const exportOptions = ref<ExportOptions>({
  sheetName: props.defaultSheetName,
  startRow: 2,
  mergeCells: false,
  addIndex: true,
  fileName: props.defaultFileName,
});

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      loadAvailableTemplates();
    }
  },
);

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

watch(
  () => props.defaultFileName,
  (val) => {
    exportOptions.value.fileName = val;
  },
);

const loadAvailableTemplates = async () => {
  try {
    const [wordResponse, excelResponse] = await Promise.all([
      documentTemplatesApi.getTemplatesByType('WORD'),
      documentTemplatesApi.getTemplatesByType('EXCEL'),
    ]);

    const templates: DocumentTemplate[] = [];
    if (wordResponse.code === 200) {
      templates.push(...wordResponse.data);
    }
    if (excelResponse.code === 200) {
      templates.push(...excelResponse.data);
    }

    availableTemplates.value = templates;
  } catch (error) {
    console.error('加载模板失败:', error);
    ElMessage.error('加载模板失败');
  }
};

const handleTemplateSelect = async (template: DocumentTemplate) => {
  selectedTemplate.value = template;

  try {
    const response = await documentTemplatesApi.getTemplateDetail(template.id);
    if (response.code === 200 && response.data.fields) {
      const fields = response.data.fields || [];
      templateFields.value = fields.map((field: any) => ({
        key: field.fieldName,
        label: field.fieldLabel,
        value: getMappedValue(field.fieldName),
      }));
    }
  } catch (error) {
    console.error('加载模板字段失败:', error);
  }
};

const getMappedValue = (fieldName: string) => {
  const sourceField = Object.entries(props.fieldMapping).find(
    ([_, targetName]) => targetName === fieldName,
  );

  if (sourceField && sourceField[0]) {
    const sampleData = props.selectedData[0];
    if (sampleData) {
      return sampleData[sourceField[0]] || '';
    }
  }
  return '';
};

const buildDataList = () => {
  return props.selectedData.map((item, index) => {
    const rowData: Record<string, any> = {};

    if (exportOptions.value.addIndex) {
      rowData['序号'] = index + 1;
    }

    Object.entries(props.fieldMapping).forEach(([sourceField, targetField]) => {
      rowData[targetField] = item[sourceField] || '';
    });

    return rowData;
  });
};

const batchExportToExcel = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板');
    return;
  }

  loading.value = true;

  try {
    const dataList = buildDataList();

    const response = await documentTemplatesApi.batchExportExcel({
      templateId: selectedTemplate.value.id,
      fileName: exportOptions.value.fileName,
      dataList: dataList,
      options: {
        sheetName: exportOptions.value.sheetName,
        startRow: exportOptions.value.startRow,
        mergeCells: exportOptions.value.mergeCells,
        addIndex: exportOptions.value.addIndex,
      },
    });

    const blob = response.data;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportOptions.value.fileName}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);

    ElMessage.success(`成功导出 ${dataList.length} 条数据`);
    emit('export-success', dataList.length);
    dialogVisible.value = false;
  } catch (error) {
    console.error('批量导出失败:', error);
    ElMessage.error('批量导出失败');
    emit('export-error', error);
  } finally {
    loading.value = false;
  }
};

const exportWordDocuments = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请选择模板');
    return;
  }

  loading.value = true;

  try {
    let successCount = 0;
    const nameField = Object.keys(props.fieldMapping)[0];

    for (const item of props.selectedData) {
      const templateData: Record<string, any> = {};

      Object.entries(props.fieldMapping).forEach(([sourceField, targetField]) => {
        templateData[targetField] = item[sourceField] || '';
      });

      const itemName = item[nameField] || '未命名';

      await documentTemplatesApi.exportWord(selectedTemplate.value.id, {
        fileName: `${itemName}_${selectedTemplate.value.templateName}`,
        data: templateData,
      });

      successCount++;
    }

    ElMessage.success(`成功导出 ${successCount} 个文档`);
    emit('export-success', successCount);
    dialogVisible.value = false;
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
    emit('export-error', error);
  } finally {
    loading.value = false;
  }
};

const handleExport = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请选择模板');
    return;
  }

  if (props.selectedData.length === 0) {
    ElMessage.warning('请选择要导出的数据');
    return;
  }

  if (selectedTemplate.value.templateType === 'EXCEL') {
    await batchExportToExcel();
  } else {
    await exportWordDocuments();
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  selectedTemplate.value = null;
  templateFields.value = [];
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    title="模板导出"
    width="800px"
    :before-close="handleClose"
  >
    <div class="template-export-container">
      <ElForm label-width="120px">
        <ElFormItem label="选择模板">
          <ElSelect
            :model-value="selectedTemplate"
            placeholder="请选择导出模板"
            style="width: 100%"
            @change="handleTemplateSelect"
          >
            <ElOption
              v-for="template in availableTemplates"
              :key="template.id"
              :label="`${template.templateName} (${template.templateType})`"
              :value="template"
            >
              <span>{{ template.templateName }}</span>
              <ElTag
                size="small"
                :type="template.templateType === 'WORD' ? 'primary' : 'success'"
                style="margin-left: 8px"
              >
                {{ template.templateType }}
              </ElTag>
            </ElOption>
          </ElSelect>
        </ElFormItem>

        <ElFormItem
          label="导出配置"
          v-if="selectedTemplate && selectedTemplate.templateType === 'EXCEL'"
        >
          <ElCheckbox v-model="exportOptions.addIndex">添加序号</ElCheckbox>
          <ElInput
            v-model="exportOptions.fileName"
            placeholder="文件名"
            style="margin-top: 8px"
          >
            <template #prepend>文件名</template>
          </ElInput>
          <ElInput
            v-model="exportOptions.sheetName"
            placeholder="Sheet 名称"
            style="margin-top: 8px"
          >
            <template #prepend>Sheet 名称</template>
          </ElInput>
        </ElFormItem>

        <ElFormItem label="已选数据" v-if="selectedData.length > 0">
          <ElTag type="info">已选择 {{ selectedData.length }} 条数据</ElTag>
        </ElFormItem>

        <ElFormItem label="字段预览" v-if="templateFields.length > 0">
          <ElTable :data="templateFields" border size="small">
            <ElTableColumn prop="label" label="字段名" width="150" />
            <ElTableColumn prop="key" label="字段标识" />
            <ElTableColumn prop="value" label="示例值" />
          </ElTable>
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton
        type="primary"
        @click="handleExport"
        :loading="loading"
        :disabled="!selectedTemplate || selectedData.length === 0"
      >
        开始导出
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.template-export-container {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
