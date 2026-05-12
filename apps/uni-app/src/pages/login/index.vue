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
            <u-icon name="account" size="18" color="#999" custom-style="margin-right: 20rpx"></u-icon>
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
            <u-icon name="lock" size="18" color="#999" custom-style="margin-right: 20rpx"></u-icon>
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
      </view>
    </view>

    <!-- 协议同意弹窗 -->
    <view class="agreement-overlay" v-if="showAgreementModal" @click.stop>
      <view class="agreement-modal">
        <view class="agreement-header">
          <text class="agreement-title">用户协议与隐私政策</text>
          <text class="agreement-desc">请阅读并同意以下协议后继续使用</text>
        </view>

        <view class="agreement-list">
          <view
            v-for="type in ['PRIVACY_POLICY', 'USER_AGREEMENT']"
            :key="type"
            class="agreement-item"
          >
            <view class="agreement-item-header">
              <view class="agreement-item-icon">
                <u-icon :name="agreementAgreedTypes.has(type) ? 'checkmark-circle' : 'file-text'" :color="agreementAgreedTypes.has(type) ? '#52c41a' : '#1890ff'" size="22" />
              </view>
              <text class="agreement-item-title">{{ agreementTypeLabels[type] }}</text>
              <view
                v-if="agreementAgreedTypes.has(type)"
                class="agreed-badge"
              >
                <text>已同意</text>
              </view>
            </view>
            <view class="agreement-item-content">
              <text>{{ agreementTypeContents[type] }}</text>
            </view>
            <view class="agreement-item-actions">
              <view class="view-detail-link" @click="viewAgreementDetail(type)">
                <text>查看全文</text>
                <u-icon name="arrow-right" size="12" color="#1890ff" />
              </view>
              <button
                v-if="!agreementAgreedTypes.has(type)"
                class="agree-single-btn"
                :class="{ loading: agreementLoading }"
                :disabled="agreementLoading"
                @click="handleAgreeSingle(type)"
              >
                <text>同意{{ agreementTypeLabels[type] }}</text>
              </button>
            </view>
          </view>
        </view>

        <view class="agreement-footer">
          <button
            class="agree-all-btn"
            :class="{ loading: agreementLoading, disabled: !allLocalAgreed || agreementProcessing }"
            :disabled="agreementLoading || agreementProcessing || !allLocalAgreed"
            @click="handleAgreeAll"
          >
            <text v-if="agreementLoading || agreementProcessing">提交中...</text>
            <text v-else-if="allLocalAgreed">同意并进入系统</text>
            <text v-else>请先分别同意以上协议</text>
          </button>
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

import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { customerConfig } from '@/customer.config'
import {
  checkAllAgreements,
  agreeAgreement,
  AGREEMENT_TYPES,
  type AgreementCheckResult,
} from '@/api/agreement'

const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const pageLoaded = ref(false)
const usernameFocus = ref(false)
const passwordFocus = ref(false)
const redirectTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 协议弹窗相关状态
const showAgreementModal = ref(false)
const agreementCheckResult = ref<AgreementCheckResult | null>(null)
const agreementLoading = ref(false)
const agreementProcessing = ref(false)
const agreementAgreedTypes = ref<Set<string>>(new Set())

const unAgreedTypes = computed(() => {
  if (!agreementCheckResult.value) return []
  return Object.entries(agreementCheckResult.value.agreements)
    .filter(([, agreed]) => !agreed)
    .map(([type]) => type)
})

const allLocalAgreed = computed(() => {
  const allTypes = ['PRIVACY_POLICY', 'USER_AGREEMENT']
  return allTypes.every((type) => agreementAgreedTypes.value.has(type))
})

const agreementTypeLabels: Record<string, string> = {
  PRIVACY_POLICY: '隐私政策',
  USER_AGREEMENT: '用户协议',
}

const agreementTypeContents: Record<string, string> = {
  PRIVACY_POLICY: `${customerConfig.company.name}（以下简称"本公司"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们在您使用${customerConfig.app.fullName}时如何收集、使用、存储和保护您的个人信息。`,
  USER_AGREEMENT: `本协议是您（以下简称"用户"）与${customerConfig.company.name}（以下简称"本公司"）之间关于使用本公司提供的${customerConfig.app.fullName}所订立的协议。`,
}

onUnmounted(() => {
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value)
    redirectTimer.value = null
  }
})

onMounted(async () => {
  const restored = await authStore.restoreLoginState()
  if (restored && authStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/workspace/index' })
    return
  }
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

const redirectToWorkspace = () => {
  redirectTimer.value = setTimeout(() => {
    uni.switchTab({ url: '/pages/workspace/index' })
  }, 800)
}

const checkAgreementsAfterLogin = async () => {
  try {
    const result = await checkAllAgreements()
    agreementCheckResult.value = result
    if (result.allAgreed) {
      redirectToWorkspace()
    } else {
      showAgreementModal.value = true
    }
  } catch (_error) {
    redirectToWorkspace()
  }
}

const handleAgreeSingle = async (agreementType: string) => {
  agreementLoading.value = true
  try {
    await agreeAgreement({
      agreementType,
      agreementVersion: '1.0.0',
      agreed: true,
      agreementContent: agreementTypeContents[agreementType] || '',
    })
    agreementAgreedTypes.value = new Set([...agreementAgreedTypes.value, agreementType])
    uni.showToast({ title: `${agreementTypeLabels[agreementType]}已同意`, icon: 'success' })
  } catch (_error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    agreementLoading.value = false
  }
}

const handleAgreeAll = async () => {
  if (agreementProcessing.value || agreementLoading.value) {
    return
  }
  
  agreementProcessing.value = true
  agreementLoading.value = true
  
  try {
    // 先计算出所有需要同意的协议类型
    const allTypes = ['PRIVACY_POLICY', 'USER_AGREEMENT']
    const typesToAgree = allTypes.filter(type => !agreementAgreedTypes.value.has(type))
    
    for (const type of typesToAgree) {
      await agreeAgreement({
        agreementType: type,
        agreementVersion: '1.0.0',
        agreed: true,
        agreementContent: agreementTypeContents[type] || '',
      })
      agreementAgreedTypes.value = new Set([...agreementAgreedTypes.value, type])
    }
    uni.showToast({ title: '同意成功', icon: 'success' })
    showAgreementModal.value = false
    redirectToWorkspace()
  } catch (_error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    agreementLoading.value = false
    agreementProcessing.value = false
  }
}

const viewAgreementDetail = (type: string) => {
  if (type === AGREEMENT_TYPES.PRIVACY_POLICY) {
    uni.navigateTo({ url: '/pages/about/privacy' })
  } else if (type === AGREEMENT_TYPES.USER_AGREEMENT) {
    uni.navigateTo({ url: '/pages/about/terms' })
  }
}

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
  try {
    const res = await authStore.login(form)
    if (res && res.code === 200 && res.data) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      checkAgreementsAfterLogin()
    } else {
      uni.showToast({ title: res?.message || '登录失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.showToast({ title: error?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
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

// 协议弹窗样式
.agreement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.agreement-modal {
  width: 100%;
  max-width: 640rpx;
  max-height: 85vh;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx 30rpx;
  overflow-y: auto;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.agreement-header {
  text-align: center;
  margin-bottom: 30rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .agreement-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }

  .agreement-desc {
    font-size: 26rpx;
    color: #999;
  }
}

.agreement-list {
  .agreement-item {
    background: #fafafa;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .agreement-item-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .agreement-item-icon {
      margin-right: 12rpx;
    }

    .agreement-item-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .agreed-badge {
      background: #f6ffed;
      border: 1rpx solid #b7eb8f;
      border-radius: 8rpx;
      padding: 4rpx 16rpx;

      text {
        font-size: 22rpx;
        color: #52c41a;
      }
    }
  }

  .agreement-item-content {
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;

    text {
      font-size: 24rpx;
      color: #666;
      line-height: 1.6;
    }
  }

  .agreement-item-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .view-detail-link {
      display: flex;
      align-items: center;
      gap: 8rpx;

      text {
        font-size: 24rpx;
        color: #1890ff;
      }
    }

    .agree-single-btn {
      background: #1890ff;
      color: #fff;
      border-radius: 32rpx;
      font-size: 24rpx;
      padding: 12rpx 32rpx;
      border: none;

      &.loading {
        opacity: 0.6;
      }
    }
  }
}

.agreement-footer {
  margin-top: 30rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;

  .agree-all-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    border: none;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);

    &.disabled {
      background: #e0e0e0;
      color: #999;
      box-shadow: none;
    }

    &.loading {
      opacity: 0.7;
    }
  }
}
</style>