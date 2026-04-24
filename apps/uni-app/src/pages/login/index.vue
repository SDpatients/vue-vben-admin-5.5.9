<template>
  <view class="login-container">
    <!-- 动态背景 -->
    <view class="animated-bg">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>

    <!-- 登录框 -->
    <view class="login-box" :class="{ 'show': pageLoaded }">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo-icon" :class="{ 'float': pageLoaded }">
          <image :src="customerConfig.logo.path" mode="aspectFit" class="logo-img" />
        </view>
        <view class="logo-text">
          <text class="title" :class="{ 'slide-in': pageLoaded }">{{ customerConfig.app.name }}</text>
          <text class="subtitle" :class="{ 'fade-in': pageLoaded }">{{ customerConfig.app.description }}</text>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <view 
          class="form-item" 
          :class="{ 'focus': usernameFocus, 'show': pageLoaded }"
          :style="{ animationDelay: '0.2s' }"
        >
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input
              v-model="form.username"
              class="input"
              type="text"
              placeholder="请输入用户名"
              @focus="usernameFocus = true"
              @blur="usernameFocus = false"
            />
            <view class="input-line" :class="{ 'active': usernameFocus || form.username }"></view>
          </view>
        </view>

        <view 
          class="form-item" 
          :class="{ 'focus': passwordFocus, 'show': pageLoaded }"
          :style="{ animationDelay: '0.3s' }"
        >
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input
              v-model="form.password"
              class="input"
              type="password"
              placeholder="请输入密码"
              @focus="passwordFocus = true"
              @blur="passwordFocus = false"
            />
            <view class="input-line" :class="{ 'active': passwordFocus || form.password }"></view>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="btn-wrapper" :class="{ 'show': pageLoaded }" :style="{ animationDelay: '0.4s' }">
          <button 
            class="login-btn" 
            :class="{ 'loading': loading, 'ready': form.username && form.password }"
            @click="handleLogin" 
            :disabled="loading"
          >
            <text v-if="!loading" class="btn-text">登 录</text>
            <view v-else class="loading-spinner">
              <view class="spinner-dot"></view>
              <view class="spinner-dot"></view>
              <view class="spinner-dot"></view>
            </view>
          </button>
        </view>

        <!-- 底部链接 -->
        <view class="footer-links" :class="{ 'show': pageLoaded }" :style="{ animationDelay: '0.5s' }">
          <text class="link">忘记密码?</text>
          <text class="divider">|</text>
          <text class="link">联系管理员</text>
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version" :class="{ 'show': pageLoaded }" :style="{ animationDelay: '0.6s' }">
      <text class="version-text">V {{ customerConfig.app.version }}</text>
      <text class="copyright-text">© {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }}</text>
      <text class="copyright-sub">基于 Vue Vben Admin (MIT License)</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { reactive, ref, onMounted } from 'vue'
import { login } from '@/api/auth'
import { customerConfig } from '@/customer.config'

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const pageLoaded = ref(false)
const usernameFocus = ref(false)
const passwordFocus = ref(false)

// 页面加载动画
onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

const handleLogin = async () => {
  if (!form.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  
  console.log('============ LOGIN START ============')
  console.log('[Login] Username:', form.username)
  console.log('[Login] Password length:', form.password.length)
  console.log('[Login] Login params:', { username: form.username, password: '***' })
  
  try {
    const res = await login(form)
    
    console.log('[Login] API response received')
    console.log('[Login] Full response:', JSON.stringify(res, null, 2))
    console.log('[Login] Response code:', res.code)
    console.log('[Login] Response message:', res.message)
    console.log('[Login] Response data:', res.data)
    
    if (res.code === 200 && res.data) {
      console.log('[Login] Login successful!')
      console.log('[Login] accessToken:', res.data.accessToken)
      console.log('[Login] accessToken type:', typeof res.data.accessToken)
      console.log('[Login] accessToken length:', res.data.accessToken?.length)
      console.log('[Login] refreshToken:', res.data.refreshToken?.substring(0, 20) + '...')
      console.log('[Login] userId:', res.data.userId)
      console.log('[Login] username:', res.data.username)
      console.log('[Login] realName:', res.data.realName)
      
      // 保存 token
      uni.setStorageSync('token', res.data.accessToken)
      console.log('[Login] Token saved to storage')
      
      // 立即验证存储
      const savedToken = uni.getStorageSync('token')
      console.log('[Login] Token verification after save:')
      console.log('[Login]   Saved token type:', typeof savedToken)
      console.log('[Login]   Saved token length:', savedToken?.length)
      console.log('[Login]   Saved token matches:', savedToken === res.data.accessToken)
      console.log('[Login]   Saved token value:', savedToken?.substring(0, 30) + '...')
      
      // 保存用户信息
      const userInfo = {
        userId: res.data.userId,
        username: res.data.username,
        realName: res.data.realName,
      }
      uni.setStorageSync('userInfo', userInfo)
      console.log('[Login] User info saved:', userInfo)
      
      // 验证用户信息存储
      const savedUserInfo = uni.getStorageSync('userInfo')
      console.log('[Login] User info verification:', savedUserInfo)
      
      console.log('============ LOGIN SUCCESS ============')
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        console.log('[Login] Navigating to workspace...')
        uni.switchTab({ url: '/pages/workspace/index' })
      }, 1500)
    } else {
      console.log('[Login] Login failed - code:', res.code)
      console.log('[Login] Login failed - message:', res.message)
      console.log('============ LOGIN FAILED ============')
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    console.log('[Login] Login error caught')
    console.log('[Login] Error type:', typeof error)
    console.log('[Login] Error:', error)
    console.log('[Login] Error message:', (error as Error)?.message)
    console.log('============ LOGIN ERROR ============')
    uni.showToast({ title: '登录失败', icon: 'none' })
  } finally {
    loading.value = false
    console.log('============ LOGIN END ============')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
}

// 动态背景
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    animation: float 20s infinite ease-in-out;

    &.circle-1 {
      width: 600rpx;
      height: 600rpx;
      top: -200rpx;
      right: -200rpx;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 400rpx;
      height: 400rpx;
      bottom: -100rpx;
      left: -100rpx;
      animation-delay: -7s;
    }

    &.circle-3 {
      width: 300rpx;
      height: 300rpx;
      top: 50%;
      left: 50%;
      margin-left: -150rpx;
      margin-top: -150rpx;
      animation-delay: -14s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.03;
  }
  25% {
    transform: translate(30rpx, -30rpx) scale(1.1);
    opacity: 0.05;
  }
  50% {
    transform: translate(-20rpx, 20rpx) scale(0.95);
    opacity: 0.03;
  }
  75% {
    transform: translate(-30rpx, -20rpx) scale(1.05);
    opacity: 0.04;
  }
}

// 登录框
.login-box {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 50rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(60rpx) scale(0.95);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.show {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 60rpx;

  .logo-icon {
    width: 120rpx;
    height: 120rpx;
    margin: 0 auto 30rpx;
    opacity: 0;
    transform: scale(0) rotate(-180deg);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.show {
      opacity: 1;
      transform: scale(1) rotate(0);
    }

    &.float {
      animation: iconFloat 3s ease-in-out infinite;
    }

    .logo-img {
      width: 100%;
      height: 100%;
    }
  }

  .logo-text {
    .title {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
      opacity: 0;
      transform: translateX(-30rpx);
      transition: all 0.5s ease;

      &.slide-in {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .subtitle {
      font-size: 26rpx;
      color: #999;
      letter-spacing: 4rpx;
      opacity: 0;
      transition: all 0.5s ease 0.1s;

      &.fade-in {
        opacity: 1;
      }
    }
  }
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

// 表单区域
.form-section {
  .form-item {
    margin-bottom: 40rpx;
    opacity: 0;
    transform: translateX(-40rpx);
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.show {
      opacity: 1;
      transform: translateX(0);
    }

    &.focus {
      .input-wrapper {
        transform: scale(1.02);
      }

      .input-icon {
        transform: scale(1.1);
      }
    }
  }

  .input-wrapper {
    position: relative;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    .input-icon {
      font-size: 32rpx;
      margin-right: 20rpx;
      transition: all 0.3s ease;
    }

    .input {
      flex: 1;
      height: 96rpx;
      font-size: 30rpx;
      background: transparent;
      border: none;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 3rpx;
      background: linear-gradient(90deg, #1890ff, #096dd9);
      transition: all 0.3s ease;
      transform: translateX(-50%);

      &.active {
        width: 100%;
      }
    }
  }
}

// 按钮区域
.btn-wrapper {
  margin-top: 50rpx;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.show {
    opacity: 1;
    transform: translateY(0);
  }

  .login-btn {
    width: 100%;
    height: 96rpx;
    background: #e0e0e0;
    color: #999;
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;

    &.ready {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: #fff;
      box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);

      &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);
      }
    }

    &.loading {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    }

    .btn-text {
      letter-spacing: 8rpx;
    }

    // 点击波纹效果
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s ease, height 0.6s ease;
    }

    &:active::after {
      width: 300rpx;
      height: 300rpx;
    }
  }
}

// 加载动画
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  .spinner-dot {
    width: 16rpx;
    height: 16rpx;
    background: #fff;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// 底部链接
.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;
  opacity: 0;
  transition: all 0.5s ease;

  &.show {
    opacity: 1;
  }

  .link {
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s ease;

    &:active {
      color: #1890ff;
    }
  }

  .divider {
    margin: 0 20rpx;
    color: #ddd;
  }
}

// 版本信息
.version {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
  opacity: 0;
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  &.show {
    opacity: 1;
  }

  .version-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }

  .copyright-text {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
  }

  .copyright-sub {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>