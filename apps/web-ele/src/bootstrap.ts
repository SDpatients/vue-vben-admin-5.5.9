/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/ele';

import { useTitle } from '@vueuse/core';
import {
  ElAlert,
  ElAutocomplete,
  ElAvatar,
  ElBadge,
  ElButton,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCheckbox,
  ElCheckboxGroup,
  ElCollapse,
  ElCollapseItem,
  ElCol,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElLink,
  ElLoading,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElPopover,
  ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElResult,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElSkeleton,
  ElSkeletonItem,
  ElSpace,
  ElStatistic,
  ElStep,
  ElSteps,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimePicker,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  ElTreeSelect,
  ElUpload,
} from 'element-plus';

import { $t, setupI18n } from '#/locales';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

import 'element-plus/dist/index.css';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();

  const app = createApp(App);

  // 注册 ElLoading 指令（v-loading）
  app.use(ElLoading);

  // 全局注册常用的 Element Plus 组件
  app.component('ElDivider', ElDivider);
  app.component('ElAlert', ElAlert);
  app.component('ElTooltip', ElTooltip);
  app.component('ElProgress', ElProgress);
  app.component('ElSkeleton', ElSkeleton);
  app.component('ElSkeletonItem', ElSkeletonItem);
  app.component('ElStatistic', ElStatistic);
  app.component('ElSteps', ElSteps);
  app.component('ElStep', ElStep);
  app.component('ElTimeline', ElTimeline);
  app.component('ElTimelineItem', ElTimelineItem);
  app.component('ElCollapse', ElCollapse);
  app.component('ElCollapseItem', ElCollapseItem);
  app.component('ElDescriptions', ElDescriptions);
  app.component('ElDescriptionsItem', ElDescriptionsItem);
  app.component('ElCarousel', ElCarousel);
  app.component('ElCarouselItem', ElCarouselItem);
  app.component('ElAutocomplete', ElAutocomplete);
  app.component('ElEmpty', ElEmpty);
  app.component('ElResult', ElResult);
  app.component('ElCard', ElCard);
  app.component('ElTabs', ElTabs);
  app.component('ElTabPane', ElTabPane);
  app.component('ElPopconfirm', ElPopconfirm);
  app.component('ElPopover', ElPopover);
  app.component('ElImage', ElImage);
  app.component('ElDialog', ElDialog);
  app.component('ElDrawer', ElDrawer);
  app.component('ElPagination', ElPagination);
  app.component('ElTable', ElTable);
  app.component('ElTableColumn', ElTableColumn);
  app.component('ElButton', ElButton);
  app.component('ElInput', ElInput);
  app.component('ElInputNumber', ElInputNumber);
  app.component('ElSelect', ElSelect);
  app.component('ElForm', ElForm);
  app.component('ElFormItem', ElFormItem);
  app.component('ElTag', ElTag);
  app.component('ElBadge', ElBadge);
  app.component('ElAvatar', ElAvatar);
  app.component('ElRadioGroup', ElRadioGroup);
  app.component('ElRadio', ElRadio);
  app.component('ElRadioButton', ElRadioButton);
  app.component('ElCheckboxGroup', ElCheckboxGroup);
  app.component('ElCheckbox', ElCheckbox);
  app.component('ElOption', ElOption);
  app.component('ElSwitch', ElSwitch);
  app.component('ElDatePicker', ElDatePicker);
  app.component('ElTimePicker', ElTimePicker);
  app.component('ElTreeSelect', ElTreeSelect);
  app.component('ElUpload', ElUpload);
  app.component('ElRow', ElRow);
  app.component('ElCol', ElCol);
  app.component('ElScrollbar', ElScrollbar);
  app.component('ElSpace', ElSpace);
  app.component('ElLink', ElLink);

  // 注册Vben提供的v-loading和v-spinning指令
  registerLoadingDirective(app, {
    loading: false,
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 配置路由及路由守卫
  app.use(router);

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
