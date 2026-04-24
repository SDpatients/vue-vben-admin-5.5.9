/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupErrorHandler } from './utils/errorHandler'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(uviewPlus)
  
  // 配置 uview-plus，禁用默认图片
  app.config.globalProperties.$u = {
    ...app.config.globalProperties.$u,
    config: {
      // 禁用空状态组件的默认图片
      empty: {
        icon: '',
        text: '暂无数据'
      }
    }
  }
  
  setupErrorHandler(app)

  return {
    app,
  }
}
