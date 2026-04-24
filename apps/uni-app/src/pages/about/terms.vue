<template>
  <view class="terms-container">
    <view class="terms-content">
      <view class="terms-title">用户服务协议</view>
      <view class="terms-date">版本日期：{{ customerConfig.copyright.year }}年1月1日</view>

      <view class="section">
        <view class="section-title">一、协议的范围</view>
        <view class="section-content">
          <text>本协议是您（以下简称"用户"）与{{ customerConfig.company.name }}（以下简称"本公司"）之间关于使用本公司提供的{{ customerConfig.app.fullName }}（以下简称"本系统"）所订立的协议。请您仔细阅读本协议，一旦您开始使用本系统，即表示您已同意并接受本协议的所有条款。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">二、服务内容</view>
        <view class="section-content">
          <text>本系统为用户提供以下服务：</text>
          <text>• 破产案件全流程管理</text>
          <text>• 债权人信息管理</text>
          <text>• 债务人资产管理</text>
          <text>• 工作计划和任务跟踪</text>
          <text>• 文档管理和模板生成</text>
          <text>• 审批流程管理</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">三、账号管理</view>
        <view class="section-content">
          <text>3.1 用户在使用本系统前需要注册账号，并提供真实、准确、完整的个人或企业信息。</text>
          <text>3.2 用户应妥善保管账号和密码，对账号下的所有行为承担法律责任。</text>
          <text>3.3 如发现账号被盗用或存在安全问题，应立即通知本公司。</text>
          <text>3.4 本公司有权对违反法律法规或本协议的用户账号采取限制、暂停或终止服务等措施。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">四、使用规范</view>
        <view class="section-content">
          <text>4.1 用户应遵守中华人民共和国相关法律法规。</text>
          <text>4.2 用户不得利用本系统从事任何违法违规活动。</text>
          <text>4.3 用户不得对本系统进行反向工程、反编译或试图发现源代码。</text>
          <text>4.4 用户不得干扰或破坏本系统的正常运行。</text>
          <text>4.5 用户应妥善保管在系统中存储的数据，定期备份重要信息。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">五、知识产权</view>
        <view class="section-content">
          <text>5.1 本系统的所有知识产权归本公司所有。</text>
          <text>5.2 本系统基于 Vue Vben Admin (MIT License) 开发构建，遵循 MIT 许可证的相关规定。</text>
          <text>5.3 用户在使用本系统过程中产生的数据归用户所有，但用户授予本公司为提供服务所必需的使用权。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">六、免责声明</view>
        <view class="section-content">
          <text>6.1 本系统按"现状"提供，本公司不对服务的及时性、安全性、准确性作绝对保证。</text>
          <text>6.2 因不可抗力或第三方原因导致的服务中断，本公司不承担责任。</text>
          <text>6.3 用户应自行判断本系统内容的适用性，并承担使用风险。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">七、联系方式</view>
        <view class="section-content">
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
.terms-container {
  min-height: 100vh;
  background: #fff;
  padding: 30rpx;
}

.terms-content {
  .terms-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 20rpx;
  }

  .terms-date {
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
