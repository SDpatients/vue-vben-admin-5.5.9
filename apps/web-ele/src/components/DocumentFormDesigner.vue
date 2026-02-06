<template>
  <div class="document-form-designer">
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <ElRadioGroup v-model="templateType" size="small">
          <ElRadioButton value="WORD">Word模板</ElRadioButton>
          <ElRadioButton value="EXCEL">Excel模板</ElRadioButton>
        </ElRadioGroup>
      </div>
      <div class="toolbar-right">
        <ElButton size="small" @click="clearAll">
          <ElIcon><Delete /></ElIcon>清空
        </ElButton>
        <ElButton size="small" type="success" @click="importFromExisting">
          <ElIcon><Upload /></ElIcon>导入现有配置
        </ElButton>
        <ElButton size="small" type="primary" @click="previewForm">
          <ElIcon><View /></ElIcon>预览
        </ElButton>
      </div>
    </div>

    <div class="designer-container">
      <!-- 左侧组件面板 -->
      <div class="component-panel">
        <div class="panel-header">
          <span class="panel-title">组件库</span>
        </div>
        <div class="component-list" ref="componentListRef">
          <div class="component-group" v-for="group in componentGroups" :key="group.name">
            <div class="group-title">{{ group.name }}</div>
            <div
              v-for="component in group.components"
              :key="component.type"
              class="component-item"
              :data-type="component.type"
              draggable="true"
              @dragstart="onDragStart($event, component.type)"
            >
              <ElIcon class="component-icon">
                <component :is="component.icon" />
              </ElIcon>
              <span class="component-label">{{ component.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间设计区域 -->
      <div class="design-area">
        <div class="design-header">
          <span class="design-title">
            表单设计区
            <ElTag size="small" :type="templateType === 'WORD' ? 'primary' : 'success'">
              {{ templateType === 'WORD' ? 'Word' : 'Excel' }}
            </ElTag>
          </span>
          <div class="design-info">
            共 {{ formItems.length }} 个字段
          </div>
        </div>
        <div class="design-canvas" ref="designCanvasRef" @dragover.prevent @drop="onDrop">
          <div v-if="formItems.length === 0" class="empty-tip">
            <ElIcon :size="48" class="empty-icon"><Plus /></ElIcon>
            <p>从左侧拖拽组件到此处</p>
            <p class="sub-tip">支持Word占位符 {{fieldName.value}} 和 Excel占位符 {fieldName.value}</p>
          </div>
          <div
            v-for="(item, index) in formItems"
            :key="item.id"
            class="form-item-wrapper"
            :class="{ active: selectedItem?.id === item.id }"
            @click="selectItem(item)"
          >
            <div class="form-item-drag-handle">
              <ElIcon><Rank /></ElIcon>
            </div>
            <div class="form-item-content">
              <div class="form-item-header">
                <span class="form-item-label">
                  {{ item.fieldLabel }}
                  <span v-if="item.isRequired" class="required-mark">*</span>
                </span>
                <ElTag size="small" :type="getFieldTypeTag(item.fieldType)">
                  {{ getFieldTypeLabel(item.fieldType) }}
                </ElTag>
              </div>
              <div class="form-item-placeholder">
                占位符: {{ getPlaceholderExample(item) }}
              </div>
              <div class="form-item-source">
                数据源: {{ item.sourceField || '未配置' }}
              </div>
            </div>
            <div class="form-item-actions">
              <ElIcon class="action-btn" @click.stop="copyItem(item)" title="复制">
                <CopyDocument />
              </ElIcon>
              <ElIcon class="action-btn delete" @click.stop="deleteItem(index)" title="删除">
                <Delete />
              </ElIcon>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <div class="panel-header">
          <span class="panel-title">属性配置</span>
        </div>
        <div v-if="selectedItem" class="property-form">
          <ElForm label-position="top" size="small">
            <ElDivider content-position="left">基本信息</ElDivider>

            <ElFormItem label="字段名称" required>
              <ElInput v-model="selectedItem.fieldLabel" placeholder="请输入字段显示名称" />
            </ElFormItem>

            <ElFormItem label="字段标识" required>
              <ElInput
                v-model="selectedItem.fieldName"
                placeholder="请输入字段标识（如：caseName）"
                @blur="validateFieldName"
              />
              <div class="form-tip">用于模板占位符，如：{{selectedItem.fieldName || 'fieldName'}}</div>
            </ElFormItem>

            <ElFormItem label="字段类型" required>
              <ElSelect v-model="selectedItem.fieldType" style="width: 100%">
                <ElOption label="文本 (TEXT)" value="TEXT" />
                <ElOption label="数字 (NUMBER)" value="NUMBER" />
                <ElOption label="日期 (DATE)" value="DATE" />
                <ElOption label="列表 (LIST)" value="LIST" />
                <ElOption label="图片 (IMAGE)" value="IMAGE" />
                <ElOption label="表格 (TABLE)" value="TABLE" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="数据源字段" required>
              <ElInput
                v-model="selectedItem.sourceField"
                placeholder="如：bankruptCase.caseName"
              />
              <div class="form-tip">对应后端数据模型的字段路径</div>
            </ElFormItem>

            <ElDivider content-position="left">验证与格式</ElDivider>

            <ElFormItem label="是否必填">
              <ElSwitch v-model="selectedItem.isRequired" />
            </ElFormItem>

            <ElFormItem label="默认值">
              <ElInput v-model="selectedItem.defaultValue" placeholder="请输入默认值" />
            </ElFormItem>

            <ElFormItem
              v-if="selectedItem.fieldType === 'DATE'"
              label="日期格式"
            >
              <ElSelect v-model="selectedItem.formatPattern" placeholder="选择日期格式" clearable>
                <ElOption label="yyyy-MM-dd (2026-02-04)" value="yyyy-MM-dd" />
                <ElOption label="yyyy年MM月dd日 (2026年02月04日)" value="yyyy年MM月dd日" />
                <ElOption label="yyyy-MM-dd HH:mm:ss" value="yyyy-MM-dd HH:mm:ss" />
                <ElOption label="HH:mm:ss" value="HH:mm:ss" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem
              v-if="selectedItem.fieldType === 'NUMBER'"
              label="数字格式"
            >
              <ElSelect v-model="selectedItem.formatPattern" placeholder="选择数字格式" clearable>
                <ElOption label="#,##0.00 (1,500,000.00)" value="#,##0.00" />
                <ElOption label="0.00% (85.50%)" value="0.00%" />
                <ElOption label="¥#,##0.00 (¥1,500,000.00)" value="¥#,##0.00" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem
              v-if="selectedItem.fieldType === 'LIST'"
              label="列表项配置"
            >
              <div class="options-editor">
                <div
                  v-for="(option, idx) in listOptions"
                  :key="idx"
                  class="option-row"
                >
                  <ElInput v-model="option.label" placeholder="显示文本" size="small" />
                  <ElInput v-model="option.value" placeholder="值" size="small" />
                  <ElIcon class="delete-option" @click="removeListOption(idx)">
                    <Close />
                  </ElIcon>
                </div>
                <ElButton type="primary" link size="small" @click="addListOption">
                  <ElIcon><Plus /></ElIcon>添加选项
                </ElButton>
              </div>
            </ElFormItem>

            <ElDivider content-position="left">排序</ElDivider>

            <ElFormItem label="排序序号">
              <ElInputNumber v-model="selectedItem.sortOrder" :min="1" style="width: 100%" />
            </ElFormItem>
          </ElForm>
        </div>
        <div v-else class="empty-property">
          <ElIcon :size="32"><Edit /></ElIcon>
          <p>请选择字段进行配置</p>
          <p class="sub-tip">点击左侧设计区的字段进行编辑</p>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <ElDialog v-model="previewVisible" title="表单预览" width="700px">
      <div class="preview-info">
        <ElAlert type="info" :closable="false">
          <template #title>
            模板类型: {{ templateType === 'WORD' ? 'Word文档' : 'Excel表格' }}
          </template>
          <div v-if="templateType === 'WORD'">
            Word模板占位符格式: <code>{{fieldName.value}}</code>
          </div>
          <div v-else>
            Excel模板占位符格式: <code>{fieldName}</code> 或 <code>{.fieldName}</code>（列表）
          </div>
        </ElAlert>
      </div>
      <ElForm label-position="right" label-width="120px" class="preview-form">
        <ElFormItem
          v-for="item in sortedFormItems"
          :key="item.id"
          :label="item.fieldLabel"
          :required="item.isRequired"
        >
          <div class="preview-field">
            <component
              :is="getPreviewComponent(item)"
              v-model="previewData[item.fieldName]"
              :item="item"
            />
            <div class="field-placeholder">
              占位符: {{ getPlaceholderExample(item) }}
            </div>
          </div>
        </ElFormItem>
      </ElForm>
    </ElDialog>

    <!-- 导入现有配置对话框 -->
    <ElDialog v-model="importVisible" title="导入现有配置" width="500px">
      <ElForm label-position="top">
        <ElFormItem label="选择要导入的模板">
          <ElSelect v-model="selectedImportTemplate" style="width: 100%" filterable>
            <ElOption
              v-for="template in existingTemplates"
              :key="template.id"
              :label="template.templateName"
              :value="template.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="importVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmImport" :disabled="!selectedImportTemplate">
          导入
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, h, computed } from 'vue';
// @ts-expect-error - SortableJS dynamic import
import Sortable from 'sortablejs/modular/sortable.complete.esm.js';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElSwitch,
  ElIcon,
  ElDialog,
  ElMessage,
  ElRadioGroup,
  ElRadioButton,
  ElTag,
  ElDivider,
  ElAlert,
} from 'element-plus';
import {
  Plus,
  Delete,
  View,
  Rank,
  CopyDocument,
  Edit,
  Close,
  Document,
  List,
  Check,
  Calendar,
  Picture,
  Grid,
  Upload,
} from '@element-plus/icons-vue';
import type {
  TemplateField,
  FieldType,
  TemplateType,
  DocumentTemplate,
} from '#/api/core/document-templates';
import { documentTemplatesApi } from '#/api/core/document-templates';

// 表单设计器中的字段（扩展TemplateField）
export interface FormDesignerField extends TemplateField {
  id: string;
}

const props = defineProps<{
  modelValue?: FormDesignerField[];
  initialTemplateType?: TemplateType;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormDesignerField[]];
  change: [value: FormDesignerField[]];
  'update:templateType': [value: TemplateType];
}>();

// 模板类型
const templateType = ref<TemplateType>(props.initialTemplateType || 'WORD');

// 组件分组
const componentGroups = [
  {
    name: '基础字段',
    components: [
      { type: 'TEXT', label: '文本', icon: Document },
      { type: 'NUMBER', label: '数字', icon: List },
      { type: 'DATE', label: '日期', icon: Calendar },
    ],
  },
  {
    name: '高级字段',
    components: [
      { type: 'LIST', label: '列表', icon: Check },
      { type: 'IMAGE', label: '图片', icon: Picture },
      { type: 'TABLE', label: '表格', icon: Grid },
    ],
  },
];

const formItems = ref<FormDesignerField[]>(props.modelValue || []);
const selectedItem = ref<FormDesignerField | null>(null);
const previewVisible = ref(false);
const previewData = ref<Record<string, any>>({});
const importVisible = ref(false);
const selectedImportTemplate = ref<number | null>(null);
const existingTemplates = ref<DocumentTemplate[]>([]);
const listOptions = ref<Array<{ label: string; value: string }>>([]);

// 占位符示例
const fieldName = ref('fieldName');

const componentListRef = ref<HTMLElement | null>(null);
const designCanvasRef = ref<HTMLElement | null>(null);

// 排序后的字段列表
const sortedFormItems = computed(() => {
  return [...formItems.value].sort((a, b) => a.sortOrder - b.sortOrder);
});

// 生成唯一ID
const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 拖拽开始事件
const onDragStart = (event: DragEvent, componentType: FieldType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', componentType);
  }
};

// 拖拽结束事件
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    const type = event.dataTransfer.getData('text/plain') as FieldType;
    if (type) {
      const newItem = createDefaultItem(type);
      formItems.value.push(newItem);
      selectedItem.value = newItem;
      emitChange();
    }
  }
};

// 创建默认字段配置
const createDefaultItem = (fieldType: FieldType): FormDesignerField => {
  const timestamp = Date.now();
  return {
    id: generateId(),
    fieldName: `field_${timestamp}`,
    fieldLabel: getDefaultLabel(fieldType),
    fieldType,
    sourceField: '',
    defaultValue: '',
    sortOrder: formItems.value.length + 1,
    isRequired: false,
    formatPattern: getDefaultFormatPattern(fieldType),
  };
};

const getDefaultLabel = (fieldType: FieldType): string => {
  const labels: Record<FieldType, string> = {
    TEXT: '文本字段',
    NUMBER: '数字字段',
    DATE: '日期字段',
    LIST: '列表字段',
    IMAGE: '图片字段',
    TABLE: '表格字段',
  };
  return labels[fieldType] || '字段';
};

const getDefaultFormatPattern = (fieldType: FieldType): string | undefined => {
  switch (fieldType) {
    case 'DATE':
      return 'yyyy-MM-dd';
    case 'NUMBER':
      return '#,##0.00';
    default:
      return undefined;
  }
};

const getFieldTypeLabel = (fieldType: FieldType): string => {
  const labels: Record<FieldType, string> = {
    TEXT: '文本',
    NUMBER: '数字',
    DATE: '日期',
    LIST: '列表',
    IMAGE: '图片',
    TABLE: '表格',
  };
  return labels[fieldType] || fieldType;
};

const getFieldTypeTag = (fieldType: FieldType): string => {
  const tags: Record<FieldType, string> = {
    TEXT: 'info',
    NUMBER: 'success',
    DATE: 'warning',
    LIST: 'info',
    IMAGE: 'danger',
    TABLE: 'primary',
  };
  return tags[fieldType] || 'info';
};

// 获取占位符示例
const getPlaceholderExample = (item: FormDesignerField): string => {
  if (templateType.value === 'WORD') {
    return `{{${item.fieldName}}}`;
  } else {
    // Excel
    if (item.fieldType === 'TABLE' || item.fieldType === 'LIST') {
      return `{.${item.fieldName}}`;
    }
    return `{${item.fieldName}}`;
  }
};

// 验证字段名
const validateFieldName = () => {
  if (selectedItem.value && !selectedItem.value.fieldName) {
    ElMessage.warning('字段标识不能为空');
    return;
  }
  // 检查唯一性
  if (selectedItem.value) {
    const duplicates = formItems.value.filter(
      (item) =>
        item.id !== selectedItem.value?.id &&
        item.fieldName === selectedItem.value?.fieldName,
    );
    if (duplicates.length > 0) {
      ElMessage.warning('字段标识必须唯一');
    }
  }
};

// 获取预览组件
const getPreviewComponent = (item: FormDesignerField) => {
  return {
    props: ['modelValue', 'item'],
    emits: ['update:modelValue'],
    setup(props: { modelValue: any; item: FormDesignerField }, { emit }: any) {
      const updateValue = (val: any) => {
        emit('update:modelValue', val);
      };

      switch (item.fieldType) {
        case 'TEXT':
          return () => h(ElInput, {
            placeholder: `请输入${item.fieldLabel}`,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          });
        case 'NUMBER':
          return () => h(ElInputNumber, {
            placeholder: `请输入${item.fieldLabel}`,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            style: { width: '100%' },
            precision: 2,
          });
        case 'DATE':
          return () => h(ElInput, {
            placeholder: item.formatPattern || 'yyyy-MM-dd',
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          });
        case 'LIST':
          return () => h(ElSelect, {
            placeholder: `请选择${item.fieldLabel}`,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          }, () => listOptions.value.map(opt => h(ElOption, {
            label: opt.label,
            value: opt.value,
          })));
        case 'IMAGE':
          return () => h('div', { class: 'image-placeholder' }, [
            h(ElIcon, { size: 24 }, () => h(Picture)),
            ' 图片上传区域',
          ]);
        case 'TABLE':
          return () => h('div', { class: 'table-placeholder' }, [
            h(ElIcon, { size: 24 }, () => h(Grid)),
            ` ${item.fieldLabel} (表格数据)`,
          ]);
        default:
          return () => h(ElInput, {
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          });
      }
    },
  };
};

// 初始化拖拽（保留用于设计区域内的排序）
const initSortable = () => {
  if (!designCanvasRef.value) return;

  // 设计区域拖拽目标（用于字段排序）
  new Sortable(designCanvasRef.value, {
    group: 'form-designer',
    animation: 150,
    handle: '.form-item-drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onUpdate: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex !== undefined && newIndex !== undefined) {
        const item = formItems.value.splice(oldIndex, 1)[0];
        formItems.value.splice(newIndex, 0, item);
        // 重新计算排序
        formItems.value.forEach((item, idx) => {
          item.sortOrder = idx + 1;
        });
        emitChange();
      }
    },
  });
};

// 选择字段
const selectItem = (item: FormDesignerField) => {
  selectedItem.value = item;
  // 加载列表选项
  if (item.fieldType === 'LIST') {
    listOptions.value = [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }];
  }
};

// 删除字段
const deleteItem = (index: number) => {
  formItems.value.splice(index, 1);
  if (selectedItem.value && !formItems.value.find(i => i.id === selectedItem.value?.id)) {
    selectedItem.value = null;
  }
  // 重新计算排序
  formItems.value.forEach((item, idx) => {
    item.sortOrder = idx + 1;
  });
  emitChange();
};

// 复制字段
const copyItem = (item: FormDesignerField) => {
  const index = formItems.value.findIndex(i => i.id === item.id);
  const newItem: FormDesignerField = {
    ...item,
    id: generateId(),
    fieldName: `${item.fieldName}_copy`,
    fieldLabel: `${item.fieldLabel}_副本`,
    sortOrder: item.sortOrder + 1,
  };
  formItems.value.splice(index + 1, 0, newItem);
  // 重新计算后续字段的排序
  for (let i = index + 2; i < formItems.value.length; i++) {
    formItems.value[i].sortOrder = formItems.value[i - 1].sortOrder + 1;
  }
  selectedItem.value = newItem;
  emitChange();
};

// 清空所有
const clearAll = () => {
  if (formItems.value.length === 0) return;
  formItems.value = [];
  selectedItem.value = null;
  emitChange();
  ElMessage.success('已清空所有字段');
};

// 预览表单
const previewForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请至少添加一个字段');
    return;
  }
  previewData.value = {};
  previewVisible.value = true;
};

// 添加列表选项
const addListOption = () => {
  listOptions.value.push({
    label: `选项${listOptions.value.length + 1}`,
    value: String(listOptions.value.length + 1),
  });
};

// 删除列表选项
const removeListOption = (index: number) => {
  listOptions.value.splice(index, 1);
};

// 导入现有配置
const importFromExisting = async () => {
  try {
    const response = await documentTemplatesApi.getTemplates();
    if (response.data.code === 200) {
      existingTemplates.value = response.data.data;
      importVisible.value = true;
    }
  } catch (error) {
    ElMessage.error('获取模板列表失败');
  }
};

// 确认导入
const confirmImport = async () => {
  if (!selectedImportTemplate.value) return;
  try {
    const response = await documentTemplatesApi.getTemplateById(selectedImportTemplate.value);
    if (response.data.code === 200 && response.data.data.fields) {
      const importedFields = response.data.data.fields.map((field, index) => ({
        ...field,
        id: generateId(),
        sortOrder: index + 1,
      }));
      formItems.value = importedFields;
      templateType.value = response.data.data.templateType;
      emitChange();
      importVisible.value = false;
      ElMessage.success('导入成功');
    }
  } catch (error) {
    ElMessage.error('导入失败');
  }
};

// 触发更新事件
const emitChange = () => {
  emit('update:modelValue', formItems.value);
  emit('change', formItems.value);
};

// 获取表单配置（转换为TemplateField格式）
const getTemplateFields = (): TemplateField[] => {
  return sortedFormItems.value.map(({ id, ...field }) => field);
};

// 设置表单配置
const setTemplateFields = (fields: TemplateField[], type: TemplateType = 'WORD') => {
  formItems.value = fields.map((field, index) => ({
    ...field,
    id: generateId(),
    sortOrder: field.sortOrder || index + 1,
  }));
  templateType.value = type;
  selectedItem.value = null;
  emitChange();
};

// 获取完整配置
const getConfig = () => ({
  templateType: templateType.value,
  fields: getTemplateFields(),
});

// 设置完整配置
const setConfig = (config: { templateType: TemplateType; fields: TemplateField[] }) => {
  templateType.value = config.templateType;
  setTemplateFields(config.fields, config.templateType);
};

onMounted(() => {
  nextTick(() => {
    initSortable();
  });
});

defineExpose({
  getTemplateFields,
  setTemplateFields,
  getConfig,
  setConfig,
  templateType,
});
</script>

<style scoped>
.document-form-designer {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.designer-container {
  display: flex;
  flex: 1;
  height: calc(100% - 60px);
  overflow: hidden;
}

/* 左侧面板 */
.component-panel {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.component-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.component-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  padding-left: 4px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s;
}

.component-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.component-icon {
  margin-right: 8px;
  font-size: 16px;
}

.component-label {
  font-size: 13px;
}

/* 中间设计区 */
.design-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.design-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.design-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.design-info {
  font-size: 13px;
  color: #909399;
}

.design-canvas {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  margin-bottom: 12px;
  color: #c0c4cc;
}

.sub-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

.form-item-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item-wrapper:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-item-wrapper.active {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-item-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #909399;
  cursor: move;
}

.form-item-content {
  flex: 1;
}

.form-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.form-item-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.form-item-placeholder {
  font-size: 12px;
  color: #409eff;
  font-family: monospace;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 3px;
  margin-bottom: 4px;
}

.form-item-source {
  font-size: 12px;
  color: #909399;
}

.form-item-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.form-item-wrapper:hover .form-item-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.action-btn.delete:hover {
  color: #f56c6c;
}

/* 右侧属性面板 */
.property-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.property-form {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-property {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 40px 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.options-editor {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.delete-option {
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.delete-option:hover {
  color: #f56c6c;
}

/* 预览区域 */
.preview-info {
  margin-bottom: 20px;
}

.preview-form {
  max-height: 500px;
  overflow-y: auto;
}

.preview-field {
  width: 100%;
}

.field-placeholder {
  font-size: 12px;
  color: #409eff;
  font-family: monospace;
  margin-top: 4px;
}

.image-placeholder,
.table-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  color: #909399;
}

/* Sortable 样式 */
.sortable-ghost {
  opacity: 0.4;
  background: #ecf5ff;
  border: 1px dashed #409eff;
}

.sortable-chosen {
  background: #ecf5ff;
}

.sortable-drag {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 代码样式 */
code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  color: #409eff;
}
</style>
