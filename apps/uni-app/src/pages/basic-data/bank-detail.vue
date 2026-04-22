<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="avatar">
        <text>🏦</text>
      </view>
      <view class="header-info">
        <text class="name">{{ detail.accountName }}</text>
        <text :class="['status', getStatusClass(detail.status)]">{{ getStatusText(detail.status) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">账户信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">账号</text>
          <text class="value">{{ detail.accountNumber || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">账户类型</text>
          <text class="value">{{ detail.accountType || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">开户行</text>
          <text class="value">{{ detail.openingBank || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">银行名称</text>
          <text class="value">{{ detail.bankName || '-' }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">余额信息</view>
      <view class="balance-section">
        <text class="balance-label">当前余额</text>
        <text class="balance-amount">¥{{ formatMoney(detail.currentBalance) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">案件信息</view>
      <view class="info-list">
        <view class="info-item" v-if="detail.caseNo">
          <text class="label">案号</text>
          <text class="value case-no">{{ detail.caseNo }}</text>
        </view>
        <view class="info-item" v-if="detail.caseName">
          <text class="label">案件名称</text>
          <text class="value">{{ detail.caseName }}</text>
        </view>
        <view class="info-item" v-if="detail.caseId">
          <text class="label">案件ID</text>
          <text class="value">{{ detail.caseId }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">其他信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDate(detail.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDate(detail.updateTime) }}</text>
        </view>
      </view>
    </view>
  </view>

  <view class="loading" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBankAccountDetail, type BankAccountItem } from '@/api/basic-data'
import dayjs from 'dayjs'

const detail = ref<BankAccountItem | null>(null)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage.options?.id

  if (id) {
    loadDetail(id)
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getBankAccountDetail(id)
    detail.value = res.data
  } catch (error) {
    console.error('[loadDetail] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: '正常',
    INACTIVE: '停用',
  }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'status-active',
    INACTIVE: 'status-inactive',
  }
  return map[status || ''] || ''
}

const formatMoney = (money?: number) => {
  if (!money) return '0.00'
  return money.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    background: #f9f0ff;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;

    text {
      font-size: 60rpx;
    }
  }

  .header-info {
    flex: 1;

    .name {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
    }

    .status {
      font-size: 24rpx;
      padding: 8rpx 24rpx;
      border-radius: 8rpx;

      &.status-active {
        background: #e6f7ff;
        color: #1890ff;
      }

      &.status-inactive {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }

  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16rpx 0;

      .label {
        font-size: 28rpx;
        color: #999;
        flex-shrink: 0;
        width: 180rpx;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        flex: 1;
        word-break: break-all;

        &.case-no {
          color: #1890ff;
          font-weight: 500;
        }
      }
    }
  }

  .balance-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;

    .label {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 16rpx;
    }

    .balance {
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
    }
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #999;
  font-size: 28rpx;
}
</style>
