<script lang="ts" setup>
import { ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus';

import type { SensitiveDataApi as SensitiveDataApiNs } from '#/api/core/sensitive-data';
import { getSensitiveDataViewApi } from '#/api/core/sensitive-data';

interface Props {
  visible: boolean;
  dataType: string;
  id: number;
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success', value: string): void;
}>();

const password = ref('');
const plainTextValue = ref('');
const loading = ref(false);
const errorMsg = ref('');

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      password.value = '';
      plainTextValue.value = '';
      errorMsg.value = '';
    }
  },
);

const handleSubmit = async () => {
  if (!password.value) {
    ElMessage.warning('请输入登录密码');
    return;
  }

  loading.value = true;
  errorMsg.value = '';
  plainTextValue.value = '';

  try {
    const res = await getSensitiveDataViewApi({
      dataType: props.dataType,
      id: props.id,
      password: password.value,
    });

    if (res.code === 200 && res.data) {
      plainTextValue.value = res.data.plainTextValue;
      emit('success', res.data.plainTextValue);
    } else {
      errorMsg.value = res.message || '验证失败，请检查密码是否正确';
    }
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || '验证失败，请检查密码是否正确';
  } finally {
    loading.value = false;
  }
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(plainTextValue.value);
    ElMessage.success('已复制到剪贴板');
  } catch {
    ElMessage.error('复制失败');
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="`查看${label || '敏感信息'}`"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div v-if="!plainTextValue" class="space-y-4">
        <p class="text-sm text-gray-500">
          请输入您的登录密码以查看完整{{ label || '敏感信息' }}
        </p>
        <ElForm @submit.prevent="handleSubmit">
          <ElFormItem>
            <ElInput
              v-model="password"
              type="password"
              placeholder="请输入登录密码"
              show-password
              @keyup.enter="handleSubmit"
            >
              <template #prefix>
                <i class="i-lucide-lock"></i>
              </template>
            </ElInput>
          </ElFormItem>
        </ElForm>
        <div v-if="errorMsg" class="text-sm text-red-500">
          {{ errorMsg }}
        </div>
      </div>

      <div v-else class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <span class="text-sm text-gray-600">{{ label || '完整内容' }}：</span>
          <span class="font-mono font-bold text-base break-all">
            {{ plainTextValue }}
          </span>
        </div>
        <ElButton type="primary" plain size="small" @click="handleCopy">
          <i class="i-lucide-copy mr-1"></i>
          复制
        </ElButton>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{ plainTextValue ? '关闭' : '取消' }}</ElButton>
        <ElButton
          v-if="!plainTextValue"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确认查看
        </ElButton>
      </span>
    </template>
  </ElDialog>
</template>