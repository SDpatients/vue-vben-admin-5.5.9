/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

/**
 * ============================================
 * 客户配置文件
 * ============================================
 * 
 * 此文件包含所有可客户化的配置参数。
 * 卖给不同客户时，只需修改此文件中的配置即可。
 * 
 * 修改配置后：
 * 1. Web端：清空浏览器缓存后刷新
 * 2. App端：重新构建应用
 */

export const customerConfig = {
  /**
   * ============================================
   * 公司信息配置
   * ============================================
   */
  company: {
    name: '湖州永惠软件有限公司',
    shortName: '永惠软件',
    email: '2263547451@qq.com',
    phone: '',
    website: '',
    address: '',
  },

  /**
   * ============================================
   * 应用信息配置
   * ============================================
   */
  app: {
    name: '破管通',
    fullName: '破产管理系统',
    version: '1.0.0',
    description: '破产执业业务·管理人主办·全生命周期打通完成',
    slogan: '专业·高效·智能',
  },

  /**
   * ============================================
   * Logo 配置
   * ============================================
   */
  logo: {
    path: '/original-logo.jpg',
    iconPath: '/logo.ico',
    fit: 'contain' as const,
  },

  /**
   * ============================================
   * 版权信息配置
   * ============================================
   */
  copyright: {
    year: '2026',
    company: '湖州永惠软件有限公司',
    icp: '',
    icpLink: '',
    policeRecord: '',
    policeRecordLink: '',
  },

  /**
   * ============================================
   * 主题配置
   * ============================================
   */
  theme: {
    primaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#f5222d',
    mode: 'light' as 'light' | 'dark',
  },

  /**
   * ============================================
   * API 配置
   * ============================================
   */
  api: {
    prefix: '/api/v1',
    timeout: 30000,
    retryTimes: 3,
  },

  /**
   * ============================================
   * 功能开关配置
   * ============================================
   */
  features: {
    enableRegister: false,
    enableForgetPassword: false,
    enableThirdPartyLogin: false,
    enableQRCodeLogin: false,
    enableCodeLogin: false,
    enableCheckUpdates: false,
    enableWatermark: false,
    enableLockScreen: true,
    enableNotification: true,
    enableGlobalSearch: true,
    enableLanguageToggle: true,
    enableThemeToggle: false,
  },

  /**
   * ============================================
   * 外部链接配置
   * ============================================
   */
  externalLinks: {
    zjpcgl: 'https://pcgl.zjsfgkw.gov.cn:10020/#/login',
    document: '',
    github: '',
    support: '',
  },

  /**
   * ============================================
   * 登录配置
   * ============================================
   */
  login: {
    title: '破产核心业务-管理人主办—全生命周期打通完成',
    subtitle: '',
    showLogo: true,
    showRememberMe: false,
    sessionTimeout: 7 * 24 * 60 * 60 * 1000,
    tokenRefreshThreshold: 5 * 60 * 1000,
  },

  /**
   * ============================================
   * 文件上传配置
   * ============================================
   */
  upload: {
    maxSize: 50,
    allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
    imageMaxSize: 10,
    videoMaxSize: 100,
  },

  /**
   * ============================================
   * 分页配置
   * ============================================
   */
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  /**
   * ============================================
   * 缓存配置
   * ============================================
   */
  storage: {
    prefix: 'vben_',
    timeout: 7 * 24 * 60 * 60 * 1000,
  },

  /**
   * ============================================
   * 默认首页配置
   * ============================================
   */
  router: {
    defaultHomePath: '/workspace',
    loginPath: '/auth/login',
  },
} as const;

export type CustomerConfig = typeof customerConfig;

export default customerConfig;
