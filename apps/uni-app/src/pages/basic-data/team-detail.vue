<template>
  <view class="detail-container" v-if="detail">
    <view class="header-card">
      <view class="avatar">
        <text>👥</text>
      </view>
      <view class="header-info">
        <text class="name">{{ detail.teamName }}</text>
        <text :class="['status', getStatusClass(detail.status)]">{{ getStatusText(detail.status) }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">团队信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">团队名称</text>
          <text class="value">{{ detail.teamName || '-' }}</text>
        </view>
        <view class="info-item" v-if="detail.teamDescription">
          <text class="label">团队描述</text>
          <text class="value">{{ detail.teamDescription }}</text>
        </view>
        <view class="info-item" v-if="detail.teamLeaderId">
          <text class="label">团队负责人ID</text>
          <text class="value">{{ detail.teamLeaderId }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">案件信息</view>
      <view class="info-list">
        <view class="info-item" v-if="caseNo">
          <text class="label">案号</text>
          <text class="value case-no">{{ caseNo }}</text>
        </view>
        <view class="info-item" v-if="caseName">
          <text class="label">案件名称</text>
          <text class="value">{{ caseName }}</text>
        </view>
        <view class="info-item" v-if="detail.caseId">
          <text class="label">案件ID</text>
          <text class="value">{{ detail.caseId }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">团队成员（{{ members.length }}）</view>
      <view class="member-list" v-if="members.length > 0">
        <view class="member-item" v-for="member in members" :key="member.id">
          <view class="member-avatar">
            <text>{{ member.userRealName?.substring(0, 1) || member.userName?.substring(0, 1) || '?' }}</text>
          </view>
          <view class="member-info">
            <text class="name">{{ member.userRealName || member.userName }}</text>
            <view class="member-meta">
              <text class="role-badge">{{ getRoleText(member.teamRole) }}</text>
              <text class="perm-badge" :class="getPermissionClass(member.permissionLevel)">{{ getPermissionText(member.permissionLevel) }}</text>
            </view>
          </view>
          <text :class="['member-status', getMemberStatusClass(member.isActive)]">
            {{ member.isActive === 1 ? '活跃' : '非活跃' }}
          </text>
        </view>
      </view>
      <view class="empty-members" v-else>
        <text>暂无成员数据</text>
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
import { getWorkTeamDetail, getTeamMembers, type WorkTeamItem, type TeamMemberItem } from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'
import dayjs from 'dayjs'

const detail = ref<WorkTeamItem | null>(null)
const members = ref<TeamMemberItem[]>([])
const caseNo = ref('')
const caseName = ref('')

onMounted(() => {
  const id = getPageParam('id')

  if (id) {
    loadDetail(id)
    loadMembers(id)
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getWorkTeamDetail(id)
    detail.value = res.data
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadMembers = async (teamId: number) => {
  try {
    const res = await getTeamMembers(teamId)
    members.value = res.data || []
    if (members.value.length > 0) {
      const firstMember = members.value[0]
      caseName.value = firstMember.caseName || ''
    }
  } catch (error) {
}
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: '活跃',
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

const getRoleText = (role?: string) => {
  const map: Record<string, string> = {
    LEADER: '负责人',
    MEMBER: '成员',
  }
  return map[role || ''] || role || '成员'
}

const getPermissionText = (level?: string) => {
  const map: Record<string, string> = {
    ADMIN: '管理员',
    EDITOR: '编辑',
    VIEWER: '只读',
  }
  return map[level || ''] || level || ''
}

const getPermissionClass = (level?: string) => {
  const map: Record<string, string> = {
    ADMIN: 'perm-admin',
    EDITOR: 'perm-editor',
    VIEWER: 'perm-viewer',
  }
  return map[level || ''] || ''
}

const getMemberStatusClass = (isActive?: number) => {
  return isActive === 1 ? 'member-active' : 'member-inactive'
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
    background: #f0f5ff;
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

  .member-list {
    .member-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .member-avatar {
        width: 80rpx;
        height: 80rpx;
        background: #f5f5f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        text {
          font-size: 32rpx;
          color: #666;
          font-weight: bold;
        }
      }

      .member-info {
        flex: 1;

        .name {
          display: block;
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .member-meta {
          display: flex;
          gap: 12rpx;

          .role-badge {
            font-size: 22rpx;
            padding: 4rpx 16rpx;
            background: #e6f7ff;
            color: #1890ff;
            border-radius: 6rpx;
          }

          .perm-badge {
            font-size: 22rpx;
            padding: 4rpx 16rpx;
            border-radius: 6rpx;

            &.perm-admin {
              background: #f9f0ff;
              color: #722ed1;
            }

            &.perm-editor {
              background: #fff7e6;
              color: #fa8c16;
            }

            &.perm-viewer {
              background: #f5f5f5;
              color: #999;
            }
          }
        }
      }

      .member-status {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;

        &.member-active {
          background: #e6f7ed;
          color: #52c41a;
        }

        &.member-inactive {
          background: #f5f5f5;
          color: #999;
        }
      }
    }
  }

  .empty-members {
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
