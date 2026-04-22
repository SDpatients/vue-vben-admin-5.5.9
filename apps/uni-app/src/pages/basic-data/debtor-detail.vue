<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="avatar">
        <text>🏢</text>
      </view>
      <view class="header-info">
        <text class="name">{{ detail.enterpriseName }}</text>
        <text class="code">{{ detail.unifiedSocialCreditCode }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item" v-if="detail.legalRepresentative">
          <text class="label">法定代表人</text>
          <text class="value">{{ detail.legalRepresentative }}</text>
        </view>
        <view class="info-item" v-if="detail.industry">
          <text class="label">所属行业</text>
          <text class="value">{{ detail.industry }}</text>
        </view>
        <view class="info-item" v-if="detail.businessScope">
          <text class="label">经营范围</text>
          <text class="value">{{ detail.businessScope }}</text>
        </view>
        <view class="info-item" v-if="detail.registeredAddress">
          <text class="label">注册地址</text>
          <text class="value">{{ detail.registeredAddress }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">联系方式</view>
      <view class="info-list">
        <view class="info-item" v-if="detail.contactPhone">
          <text class="label">联系电话</text>
          <text class="value">{{ detail.contactPhone }}</text>
        </view>
        <view class="info-item" v-if="detail.contactPerson">
          <text class="label">联系人</text>
          <text class="value">{{ detail.contactPerson }}</text>
        </view>
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
import { getDebtorDetail, type DebtorItem } from '@/api/basic-data'
import dayjs from 'dayjs'

const detail = ref<DebtorItem | null>(null)

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
    const res = await getDebtorDetail(id)
    detail.value = res.data
  } catch (error) {
    console.error('[loadDetail] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
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
    background: #fff7e6;
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

    .code {
      font-size: 24rpx;
      color: #999;
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
        width: 220rpx;
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
