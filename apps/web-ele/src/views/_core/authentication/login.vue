<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

const authStore = useAuthStore();

const formSchema = computed((): VbenFormSchema[] => {
  const baseSchema: VbenFormSchema[] = [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];

  baseSchema.push({
    component: markRaw(SliderCaptcha),
    fieldName: 'captcha',
    rules: z.boolean().refine((value) => value, {
      message: $t('authentication.verifyRequiredTip'),
    }),
  });

  return baseSchema;
});

const handleForgetPassword = () => {
  ElMessage.warning('当前版本请联系系统管理员进行密码更改。');
};
</script>

<template>
  <div class="login-container">
    <AuthenticationLogin
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      :show-code-login="false"
      :show-qrcode-login="false"
      :show-register="false"
      :show-third-party-login="false"
      @submit="authStore.authLogin"
      @forget-password-click="handleForgetPassword"
    >
      <template #title>
        <h2 class="text-2xl font-bold">永惠破管云・破产案件智能管理系统</h2>
      </template>
    </AuthenticationLogin>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
</style>
