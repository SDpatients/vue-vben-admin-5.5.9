<template>
  <view class="settings-container">
    <view class="section-card">
      <text class="section-title">账号设置</text>
      <u-cell-group>
        <u-cell 
          title="修改密码" 
          icon="lock"
          isLink
          @click="() => uni.navigateTo({ url: '/pages/profile/change-password' })"
        ></u-cell>
        <u-cell 
          title="修改个人资料" 
          icon="account"
          isLink
          @click="() => uni.navigateTo({ url: '/pages/profile/edit-profile' })"
        ></u-cell>
      </u-cell-group>
    </view>

    <view class="section-card">
      <text class="section-title">隐私与安全</text>
      <u-cell-group>
        <u-cell 
          title="清除缓存" 
          icon="trash"
          isLink
          :value="cacheSize"
          @click="handleClearCache"
        ></u-cell>
      </u-cell-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const cacheSize = ref('0KB')

onMounted(() => {
  calculateCacheSize()
})

const calculateCacheSize = () => {
  cacheSize.value = '12.5MB'
}

const handleClearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        uni.clearStorageSync()
        cacheSize.value = '0KB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.section-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  padding: 24rpx 0;
}

.section-title {
  display: block;
  padding: 0 32rpx 20rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
</style>
