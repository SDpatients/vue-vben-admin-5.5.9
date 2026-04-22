<template>
  <view class="basic-data-container">
    <view class="header">
      <text class="title">基础资料</text>
      <text class="subtitle">管理各类基础数据信息</text>
    </view>

    <view class="module-grid">
      <view
        v-for="(item, index) in moduleList"
        :key="item.id"
        class="module-card animate-fade-in-up"
        :style="{ animationDelay: `${index * 0.08}s` }"
        @click="handleModuleClick(item)"
      >
        <view :class="['icon-wrapper', item.iconClass]">
          <text class="icon">{{ item.icon }}</text>
        </view>
        <view class="module-info">
          <text class="module-name">{{ item.name }}</text>
          <text class="module-desc">{{ item.description }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const moduleList = [
  { id: 'creditor', icon: '👤', name: '债权人管理', description: '管理债权人信息', iconClass: 'creditor', path: '/pages/basic-data/creditor' },
  { id: 'debtor', icon: '🏢', name: '债务人管理', description: '管理债务人信息', iconClass: 'debtor', path: '/pages/basic-data/debtor' },
  { id: 'court', icon: '⚖️', name: '法院管理', description: '管理法院信息', iconClass: 'court', path: '/pages/basic-data/court' },
  { id: 'bank', icon: '🏦', name: '管理人律师银行账户', description: '管理人律师银行账户', iconClass: 'bank', path: '/pages/basic-data/bank' },
  { id: 'plan', icon: '📅', name: '工作计划', description: '管理工作计划', iconClass: 'plan', path: '/pages/basic-data/plan' },
  { id: 'team', icon: '👥', name: '工作团队', description: '管理工作团队', iconClass: 'team', path: '/pages/basic-data/team' },
  { id: 'admin', icon: '📋', name: '管理人管理', description: '管理破产管理人', iconClass: 'admin', path: '/pages/basic-data/admin' },
]

const handleModuleClick = (item: typeof moduleList[0]) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style lang="scss" scoped>
.basic-data-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header {
  padding: 30rpx 20rpx;
  margin-bottom: 20rpx;

  .title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }

  .subtitle {
    font-size: 26rpx;
    color: #999;
  }
}

.module-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .module-card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    opacity: 0;
    animation-fill-mode: forwards;

    &:active {
      transform: scale(0.98);
      transition: transform 0.15s ease;
    }

    .icon-wrapper {
      width: 100rpx;
      height: 100rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;

      &.creditor {
        background: #e6f7ff;
      }

      &.debtor {
        background: #fff7e6;
      }

      &.court {
        background: #f6ffed;
      }

      &.bank {
        background: #f9f0ff;
      }

      &.plan {
        background: #fff1f0;
      }

      &.team {
        background: #f0f5ff;
      }

      &.admin {
        background: #f9f0ff;
      }

      .icon {
        font-size: 48rpx;
      }
    }

    .module-info {
      flex: 1;

      .module-name {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }

      .module-desc {
        font-size: 24rpx;
        color: #999;
      }
    }

    .arrow {
      font-size: 40rpx;
      color: #ccc;
    }
  }
}
</style>
