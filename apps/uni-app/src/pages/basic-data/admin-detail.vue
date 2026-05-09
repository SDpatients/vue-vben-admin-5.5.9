<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="avatar">
        <text>📋</text>
      </view>
      <view class="header-info">
        <text class="name">{{ detail.administratorName }}</text>
        <text class="position">负责人ID: {{ detail.responsiblePersonId || '-' }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">联系方式</view>
      <view class="info-list">
        <view class="info-item" v-if="detail.contactPhone">
          <text class="label">联系电话</text>
          <text class="value">{{ detail.contactPhone }}</text>
        </view>
        <view class="info-item" v-if="detail.contactEmail">
          <text class="label">联系邮箱</text>
          <text class="value">{{ detail.contactEmail }}</text>
        </view>
        <view class="info-item" v-if="detail.officeAddress">
          <text class="label">办公地址</text>
          <text class="value">{{ detail.officeAddress }}</text>
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
      <view class="section-title">员工信息</view>
      <view class="staff-list" v-if="staffList.length > 0">
        <view class="staff-item" v-for="staff in staffList" :key="staff.id">
          <view class="staff-avatar">
            <text>{{ staff.name?.substring(0, 1) || '?' }}</text>
          </view>
          <view class="staff-info">
            <text class="name">{{ staff.name }}</text>
            <text class="position">{{ staff.staffType || '工作人员' }}</text>
          </view>
          <view class="staff-contact">
            <text class="phone" v-if="staff.contactPhone">{{ staff.contactPhone }}</text>
            <text :class="['status', getStaffStatusClass(staff.status)]">{{ getStaffStatusText(staff.status) }}</text>
          </view>
        </view>
      </view>
      <view class="empty-staff" v-else>
        <text>暂无员工数据</text>
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
import { getAdministratorDetail, getAdministratorStaffList, type AdministratorItem, type StaffItem } from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const detail = ref<AdministratorItem | null>(null)
const staffList = ref<StaffItem[]>([])

onMounted(() => {
  const id = getPageParam('id')

  if (id) {
    loadDetail(id)
    loadStaff(id)
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getAdministratorDetail(id)
    detail.value = res.data
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadStaff = async (adminId: number) => {
  try {
    const res = await getAdministratorStaffList(adminId)
    staffList.value = res.data || []
  } catch (error) {
}
}

const getStaffStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: '活跃',
    INACTIVE: '停用',
  }
  return map[status || ''] || status || '未知'
}

const getStaffStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'status-active',
    INACTIVE: 'status-inactive',
  }
  return map[status || ''] || ''
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

    .position {
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

  .staff-list {
    .staff-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .staff-avatar {
        width: 80rpx;
        height: 80rpx;
        background: #e6f7ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        text {
          font-size: 32rpx;
          color: #1890ff;
          font-weight: bold;
        }
      }

      .staff-info {
        flex: 1;

        .name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 4rpx;
        }

        .position {
          font-size: 24rpx;
          color: #999;
        }
      }

      .staff-contact {
        text-align: right;

        .phone {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 4rpx;
        }

        .status {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;

          &.status-active {
            background: #e6f7ed;
            color: #52c41a;
          }

          &.status-inactive {
            background: #f5f5f5;
            color: #999;
          }
        }
      }
    }
  }

  .empty-staff {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 26rpx;
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
