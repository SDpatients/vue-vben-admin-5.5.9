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
          @input="onPasswordInput"
        />
        <view class="password-strength" v-if="formData.newPassword">
          <view class="strength-bars">
            <view :class="['bar', { active: strengthLevel >= 1, strong: strengthLevel >= 2, veryStrong: strengthLevel >= 3 }]"></view>
            <view :class="['bar', { active: strengthLevel >= 2, strong: strengthLevel >= 2, veryStrong: strengthLevel >= 3 }]"></view>
            <view :class="['bar', { active: strengthLevel >= 3, veryStrong: strengthLevel >= 3 }]"></view>
          </view>
          <text :class="['strength-text', strengthTextClass]">{{ strengthText }}</text>
        </view>
        <view class="password-rules" v-if="formData.newPassword">
          <text :class="['rule', { met: hasMinLength }]">✓ 至少6位字符</text>
          <text :class="['rule', { met: hasUpperCase }]">✓ 包含大写字母</text>
          <text :class="['rule', { met: hasLowerCase }]">✓ 包含小写字母</text>
          <text :class="['rule', { met: hasDigit }]">✓ 包含数字</text>
          <text :class="['rule', { met: hasSpecialChar }]">✓ 包含特殊符号</text>
          <text class="rule-tip">以上规则至少满足 3 项</text>
        </view>
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
      <text class="tips-text">2. 必须包含大写字母、小写字母、数字、特殊符号中的至少3种</text>
      <text class="tips-text">3. 修改密码成功后需要重新登录</text>
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
import { ref, reactive, computed } from 'vue'
import { profileApi } from '@/api/profile'

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const submitting = ref(false)

const hasMinLength = computed(() => formData.newPassword.length >= 6)
const hasUpperCase = computed(() => /[A-Z]/.test(formData.newPassword))
const hasLowerCase = computed(() => /[a-z]/.test(formData.newPassword))
const hasDigit = computed(() => /\d/.test(formData.newPassword))
const hasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.newPassword))

const metCount = computed(() => {
  let count = 0
  if (hasUpperCase.value) count++
  if (hasLowerCase.value) count++
  if (hasDigit.value) count++
  if (hasSpecialChar.value) count++
  return count
})

const strengthLevel = computed(() => {
  if (!formData.newPassword) return 0
  if (formData.newPassword.length < 6) return 0
  return Math.min(metCount.value, 3)
})

const strengthText = computed(() => {
  if (formData.newPassword.length < 6) return '密码长度不足'
  if (metCount.value < 3) return '强度不足'
  if (metCount.value === 3) return '中等强度'
  return '高强度'
})

const strengthTextClass = computed(() => {
  if (formData.newPassword.length < 6) return 'weak'
  if (metCount.value < 3) return 'weak'
  if (metCount.value === 3) return 'medium'
  return 'strong'
})

const onPasswordInput = () => {
  // 实时校验由computed自动完成
}

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
  if (metCount.value < 3) {
    uni.showToast({ title: '密码必须包含大写字母、小写字母、数字、特殊符号中的至少3种', icon: 'none', duration: 3000 })
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

.password-strength {
  margin-top: 16rpx;

  .strength-bars {
    display: flex;
    gap: 8rpx;
    margin-bottom: 8rpx;

    .bar {
      flex: 1;
      height: 8rpx;
      background: #e8e8e8;
      border-radius: 4rpx;
      transition: all 0.3s ease;

      &.active {
        background: #ff4d4f;
      }

      &.strong {
        background: #faad14;
      }

      &.veryStrong {
        background: #52c41a;
      }
    }
  }

  .strength-text {
    font-size: 24rpx;

    &.weak {
      color: #ff4d4f;
    }

    &.medium {
      color: #faad14;
    }

    &.strong {
      color: #52c41a;
    }
  }
}

.password-rules {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #fafafa;
  border-radius: 8rpx;

  .rule {
    display: block;
    font-size: 24rpx;
    color: #ccc;
    line-height: 1.8;

    &.met {
      color: #52c41a;
    }
  }

  .rule-tip {
    display: block;
    font-size: 22rpx;
    color: #999;
    margin-top: 8rpx;
    padding-top: 8rpx;
    border-top: 1rpx solid #eee;
  }
}

.submit-section {
  padding: 0 20rpx;
}
</style>
