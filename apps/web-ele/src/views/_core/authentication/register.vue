<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, h, ref } from 'vue';

import { AuthenticationRegister, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useRouter } from 'vue-router';

defineOptions({ name: 'Register' });

const router = useRouter();
const loading = ref(false);

const navigateToTerms = () => {
  router.push('/terms');
};

const navigateToPrivacy = () => {
  router.push('/privacy');
};

const passwordComplexityMessage = '密码必须包含大写字母、小写字母、数字、特殊符号中的至少3种';

const formSchema = computed((): VbenFormSchema[] => {
  return [
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
        passwordStrength: true,
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      renderComponentContent() {
        return {
          strengthText: () => $t('authentication.passwordStrength'),
        };
      },
      rules: z
        .string()
        .min(6, { message: '密码长度至少6位' })
        .refine(
          (value) => {
            const checks = [
              /[A-Z]/.test(value),
              /[a-z]/.test(value),
              /[0-9]/.test(value),
              /[^A-Za-z0-9]/.test(value),
            ];
            return checks.filter(Boolean).length >= 3;
          },
          { message: passwordComplexityMessage },
        ),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: $t('authentication.passwordTip') })
            .min(1, { message: $t('authentication.passwordTip') })
            .refine((value) => value === password, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
    },
    {
      component: 'VbenCheckbox',
      fieldName: 'agreePolicy',
      renderComponentContent: () => ({
        default: () =>
          h('span', [
            $t('authentication.agree'),
            h(
              'a',
              {
                class: 'vben-link ml-1',
                href: 'javascript:void(0)',
                onClick: (e: Event) => {
                  e.preventDefault();
                  navigateToPrivacy();
                },
              },
              $t('authentication.privacyPolicy'),
            ),
            ' & ',
            h(
              'a',
              {
                class: 'vben-link',
                href: 'javascript:void(0)',
                onClick: (e: Event) => {
                  e.preventDefault();
                  navigateToTerms();
                },
              },
              $t('authentication.terms'),
            ),
          ]),
      }),
      rules: z.boolean().refine((value) => !!value, {
        message: $t('authentication.agreeTip'),
      }),
    },
  ];
});

function handleSubmit(value: Recordable<any>) {
  // eslint-disable-next-line no-console
  console.log('register submit:', value);
}
</script>

<template>
  <AuthenticationRegister
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
