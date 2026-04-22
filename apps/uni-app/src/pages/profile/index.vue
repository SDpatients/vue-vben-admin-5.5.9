<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="card-bg"></view>
      <view class="user-content">
        <view class="user-info">
          <view class="avatar-wrapper">
            <u-avatar 
              :src="userInfo?.avatar || ''" 
              :size="80"
              :text="userInfo?.realName?.substring(0, 1) || 'U'"
              bg-color="#0068E2"
            ></u-avatar>
          </view>
          <view class="info">
            <text class="name">{{ userInfo?.realName || '未登录' }}</text>
            <text class="username">{{ userInfo?.username || '-' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <u-cell-group>
        <u-cell 
          title="我的案件" 
          icon="file-text"
          isLink
          @click="handleMyCases"
        ></u-cell>
        <u-cell 
          title="我的待办" 
          icon="list"
          isLink
          @click="handleMyTasks"
        ></u-cell>
        <u-cell 
          title="消息通知" 
          icon="bell"
          isLink
          @click="handleMyMessages"
        ></u-cell>
        <u-cell 
          title="系统设置" 
          icon="setting"
          isLink
          @click="handleSettings"
        ></u-cell>
        <u-cell 
          title="关于我们" 
          icon="info-circle"
          isLink
          @click="handleAbout"
        ></u-cell>
      </u-cell-group>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <u-button 
        type="error" 
        plain
        text="退出登录"
        @click="handleLogout"
      ></u-button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>版本 1.0.0</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

onMounted(async () => {
  await authStore.restoreLoginState()
})

const handleMyCases = () => {
  uni.switchTab({ url: '/pages/cases/index' })
}

const handleMyTasks = () => {
  uni.switchTab({ url: '/pages/todo/index' })
}

const handleMyMessages = () => {
  uni.navigateTo({ url: '/pages/notification/index' })
}

const handleSettings = () => {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

const handleAbout = () => {
  uni.navigateTo({ url: '/pages/profile/about' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        authStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}


</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.user-card {
  position: relative;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  overflow: hidden;

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0068E2;
  }

  .user-content {
    position: relative;
    z-index: 1;
    padding: 48rpx 32rpx;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .avatar-wrapper {
    margin-right: 24rpx;
  }

  .info {
    color: #fff;

    .name {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .username {
      font-size: 26rpx;
      opacity: 0.8;
    }
  }
}

.menu-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.logout-section {
  padding: 0 24rpx;
  margin-bottom: 40rpx;
}

.version-info {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  margin-bottom: 120rpx;
}


</style>
