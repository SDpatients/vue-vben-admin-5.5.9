<template>
  <view class="privacy-container">
    <view class="privacy-content">
      <view class="privacy-title">隐私政策</view>
      <view class="privacy-date">版本日期：{{ customerConfig.copyright.year }}年1月1日</view>

      <view class="section">
        <view class="section-title">一、引言</view>
        <view class="section-content">
          <text>{{ customerConfig.company.name }}（以下简称"本公司"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们在您使用{{ customerConfig.app.fullName }}（以下简称"本系统"）时如何收集、使用、存储和保护您的个人信息。请您仔细阅读并理解本政策的内容。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">二、信息收集</view>
        <view class="section-content">
          <text>我们可能会收集以下类型的信息：</text>
          <text>• 账号信息：用户名、真实姓名、电子邮箱、手机号码等</text>
          <text>• 企业信息：公司名称、统一社会信用代码、营业执照等</text>
          <text>• 业务数据：案件信息、债权人信息、债务人信息、文档资料等</text>
          <text>• 使用数据：登录日志、操作记录、IP地址、设备信息等</text>
          <text>• 技术数据：浏览器类型、操作系统、访问时间等</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">三、信息使用</view>
        <view class="section-content">
          <text>我们收集的信息将用于以下目的：</text>
          <text>• 提供、维护和改进本系统的服务</text>
          <text>• 验证用户身份和授权访问</text>
          <text>• 处理用户的业务请求和操作</text>
          <text>• 发送系统通知和重要更新</text>
          <text>• 保障系统安全和防止欺诈行为</text>
          <text>• 遵守法律法规和监管要求</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">四、信息存储和保护</view>
        <view class="section-content">
          <text>4.1 我们采用业界标准的安全措施保护您的信息，包括数据加密、访问控制、防火墙等。</text>
          <text>4.2 您的数据存储在中华人民共和国境内的服务器上。</text>
          <text>4.3 我们会定期备份数据以防止数据丢失。</text>
          <text>4.4 我们限制员工访问用户数据的权限，并对相关人员进行保密培训。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">五、信息共享</view>
        <view class="section-content">
          <text>5.1 我们不会向第三方出售、出租或交易您的个人信息。</text>
          <text>5.2 在以下情况下，我们可能会共享您的信息：</text>
          <text>   • 获得您的明确同意</text>
          <text>   • 应法律法规、司法机关或行政机关的要求</text>
          <text>   • 为保护本公司或用户的合法权益</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">六、用户权利</view>
        <view class="section-content">
          <text>您对自己的个人信息享有以下权利：</text>
          <text>• 访问和查询您的个人信息</text>
          <text>• 更正或更新不准确的信息</text>
          <text>• 删除您的个人信息（法律法规另有规定的除外）</text>
          <text>• 撤回之前授予的同意</text>
          <text>• 注销您的账号</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">七、联系我们</view>
        <view class="section-content">
          <text>如您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</text>
          <text>公司名称：{{ customerConfig.company.name }}</text>
          <text>联系邮箱：{{ customerConfig.company.email }}</text>
        </view>
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
</script>

<style lang="scss" scoped>
.privacy-container {
  min-height: 100vh;
  background: #fff;
  padding: 30rpx;
}

.privacy-content {
  .privacy-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 20rpx;
  }

  .privacy-date {
    font-size: 24rpx;
    color: #999;
    text-align: right;
    margin-bottom: 40rpx;
  }

  .section {
    margin-bottom: 40rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }

    .section-content {
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
}
</style>
