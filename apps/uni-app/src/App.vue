<script setup lang="ts">
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

onLaunch(async () => {
  // Check current storage state
  const currentToken = uni.getStorageSync('token')
  
  const authStore = useAuthStore()
  const restored = await authStore.restoreLoginState()
})

onShow(() => {
})

onHide(() => {
})
</script>

<template>
</template>

<style lang="scss">
/* 引入全局动画 */
@import '@/styles/animations.scss';

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  background-color: #f5f7fa;
}
</style>
