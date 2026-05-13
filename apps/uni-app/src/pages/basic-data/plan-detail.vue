<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="icon-wrapper">
        <text>📅</text>
      </view>
      <view class="header-info">
        <text class="type">{{ detail.planType }}</text>
        <text :class="['status', getStatusClass(detail.executionStatus)]">{{ getStatusText(detail.executionStatus) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">计划信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">计划内容</text>
          <text class="value">{{ detail.planContent || '-' }}</text>
        </view>
        <view class="info-item" v-if="detail.startDate">
          <text class="label">开始日期</text>
          <text class="value">{{ formatDate(detail.startDate) }}</text>
        </view>
        <view class="info-item" v-if="detail.endDate">
          <text class="label">结束日期</text>
          <text class="value">{{ formatDate(detail.endDate) }}</text>
        </view>
        <view class="info-item" v-if="detail.responsibleUserId">
          <text class="label">负责人用户ID</text>
          <text class="value">{{ detail.responsibleUserId }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">状态信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">执行状态</text>
          <text class="value">{{ getStatusText(detail.executionStatus) }}</text>
        </view>
        <view class="info-item">
          <text class="label">状态</text>
          <text class="value">{{ getPlanStatusText(detail.status) }}</text>
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
          <text class="value">{{ formatDateTime(detail.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">更新时间</text>
          <text class="value">{{ formatDateTime(detail.updateTime) }}</text>
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
import { getWorkPlanDetail, type WorkPlanItem } from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const detail = ref<WorkPlanItem | null>(null)

onMounted(() => {
  const id = getPageParam('id')

  if (id) {
    loadDetail(id)
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getWorkPlanDetail(id)
    detail.value = res.data
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: '未开始',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
  }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'status-pending',
    IN_PROGRESS: 'status-progress',
    COMPLETED: 'status-completed',
  }
  return map[status || ''] || ''
}

const getPlanStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: '激活',
    INACTIVE: '停用',
  }
  return map[status || ''] || status || ''
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
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

  .icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    background: #fff1f0;
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

    .type {
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

      &.status-pending {
        background: #fff7e6;
        color: #fa8c16;
      }

      &.status-progress {
        background: #e6f7ff;
        color: #1890ff;
      }

      &.status-completed {
        background: #e6f7ed;
        color: #52c41a;
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
        width: 200rpx;
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
