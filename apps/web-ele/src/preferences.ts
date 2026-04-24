/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { defineOverridesPreferences } from '@vben/preferences';

import { customerConfig } from './customer.config';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 * 
 * 注意：大部分配置已移至 customer.config.ts，便于客户化管理
 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: customerConfig.app.name,
    defaultHomePath: customerConfig.router.defaultHomePath,
    enableCheckUpdates: customerConfig.features.enableCheckUpdates,
    watermark: customerConfig.features.enableWatermark,
  },
  logo: {
    enable: true,
    fit: customerConfig.logo.fit,
    source: customerConfig.logo.path,
  },
  copyright: {
    companyName: customerConfig.copyright.company,
    companySiteLink: customerConfig.company.website,
    date: customerConfig.copyright.year,
    enable: true,
    icp: customerConfig.copyright.icp,
    icpLink: customerConfig.copyright.icpLink,
    settingShow: true,
  },
  footer: {
    enable: true,
    fixed: false,
    height: 32,
  },
  theme: {
    colorPrimary: customerConfig.theme.primaryColor,
    colorSuccess: customerConfig.theme.successColor,
    colorWarning: customerConfig.theme.warningColor,
    colorDestructive: customerConfig.theme.errorColor,
  },
  widget: {
    fullscreen: true,
    globalSearch: customerConfig.features.enableGlobalSearch,
    languageToggle: customerConfig.features.enableLanguageToggle,
    lockScreen: customerConfig.features.enableLockScreen,
    notification: customerConfig.features.enableNotification,
    refresh: true,
    sidebarToggle: true,
    themeToggle: customerConfig.features.enableThemeToggle,
  },
});
