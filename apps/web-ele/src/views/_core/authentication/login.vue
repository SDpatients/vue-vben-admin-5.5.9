<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import { sendSmsCodeApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

// 路由实例
const router = useRouter();

// 调试信息
const debugInfo = ref({
  url: '',
  query: '',
  redirect: '',
  localToken: '',
});

// 初始化调试信息
const initDebugInfo = () => {
  const currentRoute = router.currentRoute.value;
  debugInfo.value.url = currentRoute.fullPath;
  debugInfo.value.query = JSON.stringify(currentRoute.query);
  debugInfo.value.redirect = currentRoute.query.redirect as string || 'No redirect';
  debugInfo.value.localToken = localStorage.getItem('token') || 'No token in localStorage';
  
  console.log('Login page debug info:', debugInfo.value);
};

// 初始化调试信息
initDebugInfo();

// 登录方式类型
type LoginType = 'mobile' | 'username';

// 登录方式选项
const loginTypeOptions: BasicOption[] = [
  { label: $t('authentication.usernameLogin'), value: 'username' },
  { label: $t('authentication.mobileLogin'), value: 'mobile' },
];

// 当前登录方式
const currentLoginType = ref<LoginType>('username');

// 验证码倒计时
const codeCountdown = ref(0);
const isCounting = ref(false);

// 倒计时定时器
let countdownTimer: null | number = null;

// 开始倒计时
const startCountdown = () => {
  codeCountdown.value = 60;
  isCounting.value = true;

  countdownTimer = window.setInterval(() => {
    codeCountdown.value--;
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer!);
      isCounting.value = false;
    }
  }, 1000);
};

// 发送短信验证码
const sendSmsCode = async (formData: any) => {
  if (!formData.mobile) {
    ElMessage.warning($t('authentication.mobileRequired'));
    return;
  }

  try {
    const result = await sendSmsCodeApi({
      mobile: formData.mobile,
      smsType: 'login',
    });

    if (result && result.status === '1') {
      ElMessage.success($t('authentication.smsCodeSent'));
      startCountdown();
    } else {
      ElMessage.error(result?.error || $t('authentication.smsCodeSendFailed'));
    }
  } catch (error: any) {
    ElMessage.error(error?.message || $t('authentication.smsCodeSendFailed'));
  }
};

// 认证store
const authStore = useAuthStore();

// 模拟用户选项
const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Super',
    value: 'vben',
  },
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'User',
    value: 'jack',
  },
];

// 表单schema
const formSchema = computed((): VbenFormSchema[] => {
  // 基础schema
  const baseSchema: VbenFormSchema[] = [
    {
      component: 'VbenSelect',
      componentProps: {
        options: loginTypeOptions,
        placeholder: $t('authentication.selectLoginType'),
      },
      fieldName: 'loginType',
      label: $t('authentication.loginType'),
      rules: z.string().optional().default('username'),
      dependencies: {
        trigger(values) {
          currentLoginType.value = values.loginType as LoginType;
        },
        triggerFields: ['loginType'],
      },
    },
  ];

  // 根据登录类型添加不同的表单字段
  if (currentLoginType.value === 'username') {
    // 用户名密码登录表单
    baseSchema.push(
      {
        component: 'VbenSelect',
        componentProps: {
          options: MOCK_USER_OPTIONS,
          placeholder: $t('authentication.selectAccount'),
        },
        fieldName: 'selectAccount',
        label: $t('authentication.selectAccount'),
        rules: z
          .string()
          .min(1, { message: $t('authentication.selectAccount') })
          .optional()
          .default('vben'),
      },
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: $t('authentication.usernameTip'),
        },
        dependencies: {
          trigger(values, form) {
            if (values.selectAccount) {
              const findUser = MOCK_USER_OPTIONS.find(
                (item) => item.value === values.selectAccount,
              );
              if (findUser) {
                form.setValues({
                  password: '123456',
                  username: findUser.value,
                });
              }
            }
          },
          triggerFields: ['selectAccount'],
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
    );
  } else {
    // 手机验证码登录表单
    baseSchema.push(
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: $t('authentication.mobileTip'),
          type: 'tel',
        },
        fieldName: 'mobile',
        label: $t('authentication.mobile'),
        rules: z.string().min(11, { message: $t('authentication.mobileTip') }),
      },
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: $t('authentication.smsCodeTip'),
          append: {
            content: isCounting.value
              ? `${codeCountdown.value}s`
              : $t('authentication.getSmsCode'),
            disabled: isCounting.value,
            onClick: (form) => sendSmsCode(form.getValues()),
          },
        },
        fieldName: 'code',
        label: $t('authentication.smsCode'),
        rules: z.string().min(6, { message: $t('authentication.smsCodeTip') }),
      },
    );
  }

  // 添加滑块验证码
  baseSchema.push({
    component: markRaw(SliderCaptcha),
    fieldName: 'captcha',
    rules: z.boolean().refine((value) => value, {
      message: $t('authentication.verifyRequiredTip'),
    }),
  });

  return baseSchema;
});
</script>

<template>
  <div class="login-container">
    <!-- 调试信息区域 -->
    <div class="debug-info mb-4 p-4 bg-blue-50 rounded-lg">
      <h4 class="text-blue-700 font-medium mb-2">调试信息</h4>
      <div class="space-y-2 text-xs">
        <div>
          <strong class="text-blue-900">当前URL:</strong>
          <pre class="mt-1 p-2 bg-blue-100 rounded whitespace-pre-wrap">{{ debugInfo.url }}</pre>
        </div>
        <div>
          <strong class="text-blue-900">URL参数:</strong>
          <pre class="mt-1 p-2 bg-blue-100 rounded whitespace-pre-wrap">{{ debugInfo.query }}</pre>
        </div>
        <div>
          <strong class="text-blue-900">重定向路径:</strong>
          <pre class="mt-1 p-2 bg-blue-100 rounded whitespace-pre-wrap">{{ debugInfo.redirect }}</pre>
        </div>
        <div>
          <strong class="text-blue-900">本地Token:</strong>
          <pre class="mt-1 p-2 bg-blue-100 rounded whitespace-pre-wrap">{{ debugInfo.localToken.substring(0, 30) }}...</pre>
        </div>
      </div>
    </div>
    
    <!-- 登录组件 -->
    <AuthenticationLogin
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="authStore.authLogin"
    />
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.debug-info {
  font-size: 12px;
}
</style>
