<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="avatar">
        <text>{{ detail.creditorName?.substring(0, 1) || '?' }}</text>
      </view>
      <view class="header-info">
        <text class="name">{{ detail.creditorName }}</text>
        <text :class="['status', getStatusClass(detail.status)]">{{ getStatusText(detail.status) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">债权人类型</text>
          <text class="value">{{ detail.creditorType || '-' }}</text>
        </view>
        <view class="info-item" v-if="detail.idNumber">
          <text class="label">身份证号/统一社会信用代码</text>
          <view class="value-wrapper" @click="onViewSensitive('CREDITOR_ID_NUMBER', detail.id, '身份证号', detail.idNumber)">
            <text :class="['value', { masked: isMaskedData(detail.idNumber) }]">{{ detail.idNumber }}</text>
            <text class="view-icon" v-if="isMaskedData(detail.idNumber)">👁</text>
          </view>
        </view>
        <view class="info-item" v-if="detail.legalRepresentative">
          <text class="label">法定代表人</text>
          <text class="value">{{ detail.legalRepresentative }}</text>
        </view>
        <view class="info-item" v-if="detail.registeredCapital">
          <text class="label">注册资本</text>
          <text class="value">¥{{ formatMoney(detail.registeredCapital) }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">联系方式</view>
      <view class="info-list">
        <view class="info-item" v-if="detail.contactPhone">
          <text class="label">联系电话</text>
          <view class="value-wrapper" @click="onViewSensitive('CREDITOR_CONTACT_PHONE', detail.id, '联系电话', detail.contactPhone)">
            <text :class="['value', { masked: isMaskedData(detail.contactPhone) }]">{{ detail.contactPhone }}</text>
            <text class="view-icon" v-if="isMaskedData(detail.contactPhone)">👁</text>
          </view>
        </view>
        <view class="info-item" v-if="detail.contactEmail">
          <text class="label">联系邮箱</text>
          <text class="value">{{ detail.contactEmail }}</text>
        </view>
        <view class="info-item" v-if="detail.address">
          <text class="label">地址</text>
          <text class="value">{{ detail.address }}</text>
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
import { getCreditorDetail, type CreditorItem } from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'
import { checkLicenseExpiry, isMasked, SensitiveDataType } from '@/utils/sensitiveData'
import { useSensitiveDataView } from '@/composables/useSensitiveDataView'
import dayjs from 'dayjs'

const { viewMaskedData } = useSensitiveDataView()

const detail = ref<CreditorItem | null>(null)

onMounted(() => {
  const id = getPageParam('id')

  if (id) {
    loadDetail(id)
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getCreditorDetail(id)
    detail.value = res.data
    checkLicenseExpiry(res.data)
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const isMaskedData = (value?: string | null) => isMasked(value)

const onViewSensitive = (dataType: string, id: number, label: string, currentValue?: string | null) => {
  if (!isMasked(currentValue)) return
  viewMaskedData(dataType as SensitiveDataType, id, label)
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    KNOWN: '已知',
    CONFIRMED: '已确认',
  }
  return map[status || ''] || status || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    KNOWN: 'status-known',
    CONFIRMED: 'status-confirmed',
  }
  return map[status || ''] || ''
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatMoney = (money?: number) => {
  if (!money) return '0'
  return money.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
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
    background: #e6f7ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;

    text {
      font-size: 48rpx;
      color: #1890ff;
      font-weight: bold;
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

      &.status-known {
        background: #fff7e6;
        color: #fa8c16;
      }

      &.status-confirmed {
        background: #e6f7ff;
        color: #1890ff;
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
        width: 280rpx;
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

        &.masked {
          color: #1890ff;
          text-decoration: underline;
          text-underline-offset: 4rpx;
        }
      }

      .value-wrapper {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1;
        gap: 8rpx;
      }

      .view-icon {
        font-size: 32rpx;
        flex-shrink: 0;
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
