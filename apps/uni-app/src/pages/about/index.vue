<template>
  <view class="about-container">
    <!-- Logo区域 -->
    <view class="logo-section">
      <image :src="customerConfig.logo.path" mode="aspectFit" class="logo-img" />
      <text class="app-name">{{ customerConfig.app.name }}</text>
      <text class="app-version">V {{ customerConfig.app.version }}</text>
    </view>

    <!-- 产品信息 -->
    <view class="info-card">
      <view class="card-title">产品信息</view>
      <view class="info-item">
        <text class="info-label">产品名称</text>
        <text class="info-value">{{ customerConfig.app.fullName }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">开发公司</text>
        <text class="info-value">{{ customerConfig.company.name }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">联系邮箱</text>
        <text class="info-value">{{ customerConfig.company.email }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">版权声明</text>
        <text class="info-value">© {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }}</text>
      </view>
    </view>

    <!-- 开源致谢 -->
    <view class="info-card">
      <view class="card-title">开源组件致谢</view>
      <view class="info-item" v-for="dep in dependencies" :key="dep.name">
        <text class="info-label">{{ dep.name }}</text>
        <text class="info-value">{{ dep.version }}</text>
      </view>
    </view>

    <!-- 许可证说明 -->
    <view class="info-card">
      <view class="card-title">许可证说明</view>
      <view class="license-text">
        <text>本系统基于 Vue Vben Admin (MIT License) 开发构建。</text>
        <text>原始框架版权归 Vben 所有 (Copyright (c) 2024-present, Vben)。</text>
        <text>本系统的修改和扩展部分版权归 {{ customerConfig.copyright.company }} 所有。</text>
      </view>
    </view>

    <!-- 底部链接 -->
    <view class="footer-links">
      <view class="link-item" @click="goToTerms">
        <text>用户协议</text>
      </view>
      <view class="link-divider"></view>
      <view class="link-item" @click="goToPrivacy">
        <text>隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { customerConfig } from '@/customer.config';

const dependencies = [
  { name: 'Vue', version: '3.5.x' },
  { name: 'Vue Vben Admin', version: '5.5.9' },
  { name: 'UniApp', version: '3.0.x' },
  { name: 'uview-plus', version: '3.7.x' },
  { name: 'Pinia', version: '3.0.x' },
]

const goToTerms = () => {
  uni.navigateTo({ url: '/pages/about/terms' })
}

const goToPrivacy = () => {
  uni.navigateTo({ url: '/pages/about/privacy' })
}
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 120rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;

  .logo-img {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }

  .app-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .app-version {
    font-size: 26rpx;
    color: #999;
  }
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 28rpx;
      color: #666;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
    }
  }

  .license-text {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    text {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.footer-links {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;

  .link-item {
    padding: 0 40rpx;

    text {
      font-size: 28rpx;
      color: #1890ff;
    }
  }

  .link-divider {
    width: 1rpx;
    height: 30rpx;
    background: #eee;
  }
}
</style>
