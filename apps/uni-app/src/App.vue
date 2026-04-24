<script setup lang="ts">
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

onLaunch(async () => {
  console.log('============ APP LAUNCH ============')
  console.log('[App] App launched')
  console.log('[App] Platform:', uni.getSystemInfoSync().platform)
  console.log('[App] OS:', uni.getSystemInfoSync().osName)
  console.log('[App] uni-app SDK version:', uni.getSystemInfoSync().SDKVersion)
  
  // Check current storage state
  const currentToken = uni.getStorageSync('token')
  console.log('[App] Token in storage before restore:', currentToken ? `${currentToken.substring(0, 30)}...` : 'NULL/EMPTY')
  console.log('[App] UserInfo in storage:', uni.getStorageSync('userInfo'))
  
  const authStore = useAuthStore()
  const restored = await authStore.restoreLoginState()
  console.log('[App] Login state restored:', restored)
  console.log('[App] Auth store token:', authStore.token ? `${authStore.token.substring(0, 30)}...` : 'NULL')
  console.log('[App] Is logged in:', authStore.isLoggedIn)
  console.log('============ APP LAUNCH END ============')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

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
