<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

const route = useRoute();
const authStore = useAuthStore();

const hasRedirect = computed(() => {
  return !!route.query.redirect;
});

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
    <div v-if="hasRedirect" class="mobile-login-tip">
      手机在一周内需要重新登陆一次，记录上传信息。
    </div>
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

.mobile-login-tip {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #e6a23c;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}
</style>
