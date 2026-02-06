<template>
  <div class="form-designer">
    <div class="designer-container">
      <!-- 左侧组件面板 -->
      <div class="component-panel">
        <div class="panel-header">
          <span class="panel-title">组件库</span>
        </div>
        <div class="component-list" ref="componentListRef">
          <div
            v-for="component in componentList"
            :key="component.type"
            class="component-item"
            :data-type="component.type"
          >
            <ElIcon class="component-icon">
              <component :is="component.icon" />
            </ElIcon>
            <span class="component-label">{{ component.label }}</span>
          </div>
        </div>
      </div>

      <!-- 中间设计区域 -->
      <div class="design-area">
        <div class="design-header">
          <span class="design-title">表单设计区</span>
          <div class="design-actions">
            <ElButton size="small" @click="clearAll">
              <ElIcon><Delete /></ElIcon>清空
            </ElButton>
            <ElButton size="small" type="primary" @click="previewForm">
              <ElIcon><View /></ElIcon>预览
            </ElButton>
          </div>
        </div>
        <div class="design-canvas" ref="designCanvasRef">
          <div v-if="formItems.length === 0" class="empty-tip">
            <ElIcon :size="48" class="empty-icon"><Plus /></ElIcon>
            <p>从左侧拖拽组件到此处</p>
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
              <div class="form-item-label">
                {{ item.label }}
                <span v-if="item.required" class="required-mark">*</span>
              </div>
              <div class="form-item-component">
                <component
                  :is="getComponentRender(item)"
                  :item="item"
                  :disabled="true"
                />
              </div>
            </div>
            <div class="form-item-actions">
              <ElIcon class="action-btn" @click.stop="copyItem(item)">
                <CopyDocument />
              </ElIcon>
              <ElIcon class="action-btn delete" @click.stop="deleteItem(index)">
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
            <ElFormItem label="字段标题">
              <ElInput v-model="selectedItem.label" placeholder="请输入字段标题" />
            </ElFormItem>
            <ElFormItem label="字段标识">
              <ElInput v-model="selectedItem.field" placeholder="请输入字段标识" />
            </ElFormItem>
            <ElFormItem label="占位提示">
              <ElInput v-model="selectedItem.placeholder" placeholder="请输入占位提示" />
            </ElFormItem>
            <ElFormItem label="是否必填">
              <ElSwitch v-model="selectedItem.required" />
            </ElFormItem>
            <ElFormItem v-if="hasOptions(selectedItem.type)" label="选项配置">
              <div class="options-editor">
                <div
                  v-for="(option, idx) in selectedItem.options"
                  :key="idx"
                  class="option-row"
                >
                  <ElInput v-model="option.label" placeholder="显示文本" size="small" />
                  <ElInput v-model="option.value" placeholder="值" size="small" />
                  <ElIcon class="delete-option" @click="removeOption(idx)">
                    <Close />
                  </ElIcon>
                </div>
                <ElButton type="primary" link size="small" @click="addOption">
                  <ElIcon><Plus /></ElIcon>添加选项
                </ElButton>
              </div>
            </ElFormItem>
            <ElFormItem v-if="selectedItem.type === 'number'" label="最小值">
              <ElInputNumber v-model="selectedItem.min" style="width: 100%" />
            </ElFormItem>
            <ElFormItem v-if="selectedItem.type === 'number'" label="最大值">
              <ElInputNumber v-model="selectedItem.max" style="width: 100%" />
            </ElFormItem>
            <ElFormItem v-if="selectedItem.type === 'input' || selectedItem.type === 'textarea'" label="最大长度">
              <ElInputNumber v-model="selectedItem.maxLength" :min="1" style="width: 100%" />
            </ElFormItem>
          </ElForm>
        </div>
        <div v-else class="empty-property">
          <ElIcon :size="32"><Edit /></ElIcon>
          <p>请选择组件进行配置</p>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <ElDialog v-model="previewVisible" title="表单预览" width="600px">
      <ElForm label-position="right" label-width="100px">
        <ElFormItem
          v-for="item in formItems"
          :key="item.id"
          :label="item.label"
          :required="item.required"
        >
          <component
            :is="getPreviewComponent(item)"
            v-model="previewData[item.field]"
            :item="item"
          />
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, h } from 'vue';
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
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElDatePicker,
  ElTimePicker,
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
  Clock,
  Sort,
  Picture,
} from '@element-plus/icons-vue';

export interface FormItem {
  id: string;
  type: string;
  label: string;
  field: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  maxLength?: number;
}

const props = defineProps<{
  modelValue?: FormItem[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormItem[]];
  change: [value: FormItem[]];
}>();

// 组件列表
const componentList = [
  { type: 'input', label: '单行文本', icon: Document },
  { type: 'textarea', label: '多行文本', icon: Document },
  { type: 'number', label: '数字', icon: Sort },
  { type: 'select', label: '下拉选择', icon: List },
  { type: 'radio', label: '单选框', icon: Check },
  { type: 'checkbox', label: '多选框', icon: Check },
  { type: 'date', label: '日期选择', icon: Calendar },
  { type: 'datetime', label: '日期时间', icon: Calendar },
  { type: 'time', label: '时间选择', icon: Clock },
];

const formItems = ref<FormItem[]>(props.modelValue || []);
const selectedItem = ref<FormItem | null>(null);
const previewVisible = ref(false);
const previewData = ref<Record<string, any>>({});

const componentListRef = ref<HTMLElement | null>(null);
const designCanvasRef = ref<HTMLElement | null>(null);

// 生成唯一ID
const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 创建默认字段配置
const createDefaultItem = (type: string): FormItem => {
  const baseItem: FormItem = {
    id: generateId(),
    type,
    label: getDefaultLabel(type),
    field: `field_${Date.now()}`,
    placeholder: '',
    required: false,
  };

  switch (type) {
    case 'select':
    case 'radio':
    case 'checkbox':
      return {
        ...baseItem,
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
      };
    case 'number':
      return {
        ...baseItem,
        min: undefined,
        max: undefined,
      };
    case 'input':
      return {
        ...baseItem,
        maxLength: undefined,
      };
    default:
      return baseItem;
  }
};

const getDefaultLabel = (type: string): string => {
  const labels: Record<string, string> = {
    input: '单行文本',
    textarea: '多行文本',
    number: '数字',
    select: '下拉选择',
    radio: '单选框',
    checkbox: '多选框',
    date: '日期',
    datetime: '日期时间',
    time: '时间',
  };
  return labels[type] || '字段';
};

const hasOptions = (type: string): boolean => {
  return ['select', 'radio', 'checkbox'].includes(type);
};

// 获取组件渲染
const getComponentRender = (item: FormItem) => {
  return {
    props: ['item', 'disabled'],
    setup(props: { item: FormItem; disabled?: boolean }) {
      const { item, disabled } = props;
      switch (item.type) {
        case 'input':
          return () => h(ElInput, {
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          });
        case 'textarea':
          return () => h(ElInput, {
            type: 'textarea',
            rows: 3,
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          });
        case 'number':
          return () => h(ElInputNumber, {
            placeholder: item.placeholder,
            disabled: true,
            min: item.min,
            max: item.max,
            modelValue: undefined,
          });
        case 'select':
          return () => h(ElSelect, {
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          }, () => item.options?.map(opt => h(ElOption, {
            label: opt.label,
            value: opt.value,
          })));
        case 'radio':
          return () => h(ElRadioGroup, {
            disabled: true,
            modelValue: '',
          }, () => item.options?.map(opt => h(ElRadio, {
            label: opt.value,
          }, () => opt.label)));
        case 'checkbox':
          return () => h(ElCheckboxGroup, {
            disabled: true,
            modelValue: [],
          }, () => item.options?.map(opt => h(ElCheckbox, {
            label: opt.value,
          }, () => opt.label)));
        case 'date':
          return () => h(ElDatePicker, {
            type: 'date',
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          });
        case 'datetime':
          return () => h(ElDatePicker, {
            type: 'datetime',
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          });
        case 'time':
          return () => h(ElTimePicker, {
            placeholder: item.placeholder,
            disabled: true,
            modelValue: '',
          });
        default:
          return () => h(ElInput, { disabled: true, modelValue: '' });
      }
    },
  };
};

// 获取预览组件
const getPreviewComponent = (item: FormItem) => {
  return {
    props: ['modelValue', 'item'],
    emits: ['update:modelValue'],
    setup(props: { modelValue: any; item: FormItem }, { emit }: any) {
      const { item } = props;
      const updateValue = (val: any) => {
        emit('update:modelValue', val);
      };

      switch (item.type) {
        case 'input':
          return () => h(ElInput, {
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            maxlength: item.maxLength,
            'onUpdate:modelValue': updateValue,
          });
        case 'textarea':
          return () => h(ElInput, {
            type: 'textarea',
            rows: 3,
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            maxlength: item.maxLength,
            'onUpdate:modelValue': updateValue,
          });
        case 'number':
          return () => h(ElInputNumber, {
            placeholder: item.placeholder,
            min: item.min,
            max: item.max,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            style: { width: '100%' },
          });
        case 'select':
          return () => h(ElSelect, {
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          }, () => item.options?.map(opt => h(ElOption, {
            label: opt.label,
            value: opt.value,
          })));
        case 'radio':
          return () => h(ElRadioGroup, {
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          }, () => item.options?.map(opt => h(ElRadio, {
            label: opt.value,
          }, () => opt.label)));
        case 'checkbox':
          return () => h(ElCheckboxGroup, {
            modelValue: props.modelValue || [],
            'onUpdate:modelValue': updateValue,
          }, () => item.options?.map(opt => h(ElCheckbox, {
            label: opt.value,
          }, () => opt.label)));
        case 'date':
          return () => h(ElDatePicker, {
            type: 'date',
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            style: { width: '100%' },
          });
        case 'datetime':
          return () => h(ElDatePicker, {
            type: 'datetime',
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            style: { width: '100%' },
          });
        case 'time':
          return () => h(ElTimePicker, {
            placeholder: item.placeholder,
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            style: { width: '100%' },
          });
        default:
          return () => h(ElInput, {
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
          });
      }
    },
  };
};

// 初始化拖拽
const initSortable = () => {
  if (!componentListRef.value || !designCanvasRef.value) return;

  // 左侧组件库拖拽源
  new Sortable(componentListRef.value, {
    group: {
      name: 'form-designer',
      pull: 'clone',
      put: false,
    },
    sort: false,
    animation: 150,
    onClone: (evt) => {
      const el = evt.item as HTMLElement;
      el.classList.add('dragging-clone');
    },
  });

  // 设计区域拖拽目标
  new Sortable(designCanvasRef.value, {
    group: 'form-designer',
    animation: 150,
    handle: '.form-item-drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onAdd: (evt) => {
      const type = (evt.item as HTMLElement).dataset.type;
      if (type) {
        const newItem = createDefaultItem(type);
        const index = evt.newIndex ?? formItems.value.length;
        formItems.value.splice(index, 0, newItem);
        selectedItem.value = newItem;
        emitChange();
      }
      // 移除拖拽过来的元素（我们使用数据驱动）
      evt.item.remove();
    },
    onUpdate: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex !== undefined && newIndex !== undefined) {
        const item = formItems.value.splice(oldIndex, 1)[0];
        formItems.value.splice(newIndex, 0, item);
        emitChange();
      }
    },
  });
};

// 选择组件
const selectItem = (item: FormItem) => {
  selectedItem.value = item;
};

// 删除组件
const deleteItem = (index: number) => {
  formItems.value.splice(index, 1);
  if (selectedItem.value && !formItems.value.find(i => i.id === selectedItem.value?.id)) {
    selectedItem.value = null;
  }
  emitChange();
};

// 复制组件
const copyItem = (item: FormItem) => {
  const index = formItems.value.findIndex(i => i.id === item.id);
  const newItem: FormItem = {
    ...item,
    id: generateId(),
    field: `${item.field}_copy`,
    label: `${item.label}_副本`,
  };
  formItems.value.splice(index + 1, 0, newItem);
  selectedItem.value = newItem;
  emitChange();
};

// 清空所有
const clearAll = () => {
  if (formItems.value.length === 0) return;
  formItems.value = [];
  selectedItem.value = null;
  emitChange();
  ElMessage.success('已清空所有组件');
};

// 预览表单
const previewForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加组件');
    return;
  }
  previewData.value = {};
  previewVisible.value = true;
};

// 添加选项
const addOption = () => {
  if (selectedItem.value && selectedItem.value.options) {
    selectedItem.value.options.push({
      label: `选项${selectedItem.value.options.length + 1}`,
      value: String(selectedItem.value.options.length + 1),
    });
    emitChange();
  }
};

// 删除选项
const removeOption = (index: number) => {
  if (selectedItem.value && selectedItem.value.options) {
    selectedItem.value.options.splice(index, 1);
    emitChange();
  }
};

// 触发更新事件
const emitChange = () => {
  emit('update:modelValue', formItems.value);
  emit('change', formItems.value);
};

// 获取表单配置
const getFormConfig = (): FormItem[] => {
  return formItems.value;
};

// 设置表单配置
const setFormConfig = (config: FormItem[]) => {
  formItems.value = config || [];
  selectedItem.value = null;
};

onMounted(() => {
  nextTick(() => {
    initSortable();
  });
});

defineExpose({
  getFormConfig,
  setFormConfig,
});
</script>

<style scoped>
.form-designer {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
}

.designer-container {
  display: flex;
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

/* 左侧面板 */
.component-panel {
  width: 200px;
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

.component-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
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
}

.design-actions {
  display: flex;
  gap: 8px;
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

.form-item-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.form-item-component {
  pointer-events: none;
}

.form-item-component :deep(.el-input),
.form-item-component :deep(.el-select),
.form-item-component :deep(.el-date-editor) {
  width: 100%;
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
  width: 280px;
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

.dragging-clone {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
