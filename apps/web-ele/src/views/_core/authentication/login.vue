<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import type { VbenFormSchema } from '@vben/common-ui';

import { computed, h, markRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { ElMessage } from 'element-plus';

import { useRouter } from 'vue-router';
import { AGREEMENT_CURRENT_VERSION } from '#/api';
import { customerConfig } from '#/customer.config';
import { useAuthStore } from '#/store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const navigateToTerms = () => {
  router.push('/terms');
};

const navigateToPrivacy = () => {
  router.push('/privacy');
};

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

  baseSchema.push({
    component: 'VbenCheckbox',
    fieldName: 'agreeTerms',
    renderComponentContent: () => ({
      default: () =>
        h('span', [
          '我已同意',
          h(
            'a',
            {
              class: 'vben-link ml-1',
              href: 'javascript:void(0)',
              onClick: (e: Event) => {
                e.preventDefault();
                navigateToTerms();
              },
            },
            '用户协议',
          ),
          ' 和 ',
          h(
            'a',
            {
              class: 'vben-link',
              href: 'javascript:void(0)',
              onClick: (e: Event) => {
                e.preventDefault();
                navigateToPrivacy();
              },
            },
            '隐私政策',
          ),
          ' 等条款',
        ]),
    }),
    rules: z.boolean().refine((value) => !!value, {
      message: '请同意用户协议和隐私政策等条款',
    }),
  });

  return baseSchema;
});

const handleForgetPassword = () => {
  ElMessage.warning('当前版本请联系系统管理员进行密码更改。');
};

const navigateToProductIntro = () => {
  router.push('/product-intro');
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
      :show-code-login="customerConfig.features.enableCodeLogin"
      :show-qrcode-login="customerConfig.features.enableQRCodeLogin"
      :show-register="customerConfig.features.enableRegister"
      :show-third-party-login="customerConfig.features.enableThirdPartyLogin"
      @submit="authStore.authLogin"
      @forget-password-click="handleForgetPassword"
    >
      <template #title>
        <h2 class="text-2xl font-bold">{{ customerConfig.login.title }}</h2>
      </template>
    </AuthenticationLogin>
    <div class="product-intro-link">
      <a
        href="javascript:void(0)"
        class="product-intro-btn"
        @click="navigateToProductIntro"
      >
        📖 产品介绍
      </a>
    </div>
    <div class="login-footer">
      <p class="copyright-text">
        © {{ customerConfig.copyright.year }}
        {{ customerConfig.copyright.company }} 版权所有
      </p>
      <p class="copyright-sub">基于 Vue Vben Admin (MIT License) 构建</p>
      <div class="footer-links">
        <a
          href="javascript:void(0)"
          @click="navigateToTerms"
          class="footer-link"
        >
          用户协议
        </a>
        <span class="footer-divider">|</span>
        <a
          href="javascript:void(0)"
          @click="navigateToPrivacy"
          class="footer-link"
        >
          隐私政策
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
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

.login-footer {
  margin-top: 12px;
  text-align: center;
  padding: 16px 0;
}

.copyright-text {
  color: #606266;
  font-size: 13px;
  margin-bottom: 4px;
}

.copyright-sub {
  color: #909399;
  font-size: 12px;
}

.footer-links {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-link {
  color: #1890ff;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #40a9ff;
  }
}

.footer-divider {
  color: #d9d9d9;
  font-size: 12px;
}

.product-intro-link {
  text-align: center;
  margin-top: 16px;
}

.product-intro-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: 1px solid #1890ff;
  border-radius: 6px;
  color: #1890ff;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1890ff;
    color: #fff;
  }
}
</style>
