<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';

import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';

import '@wangeditor/editor/dist/css/style.css';

interface Props {
  modelValue: string;
  placeholder?: string;
  height?: string;
  readonly?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容...',
  height: '500px',
  readonly: false,
});

const emit = defineEmits<Emits>();

const editorRef = shallowRef<IDomEditor>();

const valueHtml = ref(props.modelValue);

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'group-video',
  ],
};

const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      fieldName: 'file',
      server: '/api/upload',
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      onSuccess(_file: any, res: any) {
        console.log('图片上传成功', res);
      },
      onFailed(_file: any, res: any) {
        console.error('图片上传失败', res);
      },
      onError(_file: any, err: any, _res: any) {
        console.error('图片上传错误', err);
      },
    },
  },
};

const editorStyle = computed(() => ({
  height: props.height,
  overflowY: 'hidden',
}));

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

const handleChange = (editor: IDomEditor) => {
  emit('update:modelValue', editor.getHtml());
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal;
    }
  },
);

watch(
  () => props.readonly,
  (newVal) => {
    if (editorRef.value) {
      if (newVal) {
        editorRef.value.disable();
      } else {
        editorRef.value.enable();
      }
    }
  },
);

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<template>
  <div class="rich-text-editor-wrapper">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :defaultHtml="valueHtml"
      :style="editorStyle"
      mode="default"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<style scoped>
.rich-text-editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 4px;
}

:deep(.w-e-text-container) {
  background-color: #fff !important;
}

:deep(.w-e-text-placeholder) {
  color: #999;
}

:deep(.w-e-toolbar) {
  background-color: #f8f9fa;
}
</style>
