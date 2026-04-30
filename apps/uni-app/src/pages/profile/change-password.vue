<template>
  <view class="change-password-container">
    <view class="form-card">
      <view class="form-item">
        <text class="label">旧密码</text>
        <input 
          v-model="formData.oldPassword" 
          type="password" 
          placeholder="请输入旧密码"
          :password="true"
          class="input"
        />
      </view>
      <view class="form-item">
        <text class="label">新密码</text>
        <input 
          v-model="formData.newPassword" 
          type="password" 
          placeholder="请输入新密码（6-20位）"
          :password="true"
          class="input"
        />
      </view>
      <view class="form-item">
        <text class="label">确认新密码</text>
        <input 
          v-model="formData.confirmPassword" 
          type="password" 
          placeholder="请再次输入新密码"
          :password="true"
          class="input"
        />
      </view>
    </view>

    <view class="tips-card">
      <text class="tips-title">密码要求：</text>
      <text class="tips-text">1. 密码长度6-20位</text>
      <text class="tips-text">2. 修改密码成功后需要重新登录</text>
    </view>

    <view class="submit-section">
      <u-button 
        type="primary" 
        text="确认修改"
        :loading="submitting"
        @click="handleSubmit"
      ></u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { profileApi } from '@/api/profile'

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const submitting = ref(false)

const validateForm = () => {
  if (!formData.oldPassword) {
    uni.showToast({ title: '请输入旧密码', icon: 'none' })
    return false
  }
  if (!formData.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return false
  }
  if (formData.newPassword.length < 6 || formData.newPassword.length > 20) {
    uni.showToast({ title: '新密码长度必须为6-20位', icon: 'none' })
    return false
  }
  if (formData.newPassword !== formData.confirmPassword) {
    uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    await profileApi.changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    })
    uni.showToast({ title: '密码修改成功，请重新登录', icon: 'success' })
    setTimeout(() => {
      uni.removeStorageSync('token')
      uni.reLaunch({ url: '/pages/login/index' })
    }, 1500)
  } catch (error: any) {
} finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.change-password-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.form-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .input {
    font-size: 32rpx;
    padding: 16rpx 0;
  }
}

.tips-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
}

.tips-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
}

.submit-section {
  padding: 0 20rpx;
}
</style>
