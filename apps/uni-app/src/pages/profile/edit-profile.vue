<template>
  <view class="edit-profile-container">
    <view class="form-card">
      <view class="form-item" @click="showRealNameDialog = true">
        <text class="label">真实姓名</text>
        <view class="value-row">
          <text class="value">{{ userInfo?.realName || '未设置' }}</text>
          <u-icon name="arrow-right" size="20"></u-icon>
        </view>
      </view>
      <view class="form-item" @click="showMobileDialog = true">
        <text class="label">手机号</text>
        <view class="value-row">
          <text class="value">{{ userInfo?.mobile || '未设置' }}</text>
          <u-icon name="arrow-right" size="20"></u-icon>
        </view>
      </view>
      <view class="form-item" @click="showEmailDialog = true">
        <text class="label">邮箱</text>
        <view class="value-row">
          <text class="value">{{ userInfo?.email || '未设置' }}</text>
          <u-icon name="arrow-right" size="20"></u-icon>
        </view>
      </view>
    </view>

    <u-overlay :show="showRealNameDialog" @click="showRealNameDialog = false">
      <view class="dialog-card" @click.stop>
        <text class="dialog-title">修改真实姓名</text>
        <input 
          v-model="realNameForm.realName" 
          placeholder="请输入真实姓名（最长50位）"
          class="dialog-input"
          maxlength="50"
        />
        <view class="dialog-buttons">
          <u-button plain size="small" text="取消" @click="showRealNameDialog = false"></u-button>
          <u-button type="primary" size="small" text="确定" :loading="submittingRealName" @click="handleUpdateRealName"></u-button>
        </view>
      </view>
    </u-overlay>

    <u-overlay :show="showMobileDialog" @click="showMobileDialog = false">
      <view class="dialog-card" @click.stop>
        <text class="dialog-title">修改手机号</text>
        <input 
          v-model="mobileForm.mobile" 
          placeholder="请输入新手机号"
          class="dialog-input"
          maxlength="11"
          type="number"
        />
        <input 
          v-model="mobileForm.smsCode" 
          placeholder="请输入短信验证码（可选）"
          class="dialog-input"
          maxlength="6"
        />
        <view class="dialog-buttons">
          <u-button plain size="small" text="取消" @click="showMobileDialog = false"></u-button>
          <u-button type="primary" size="small" text="确定" :loading="submittingMobile" @click="handleUpdateMobile"></u-button>
        </view>
      </view>
    </u-overlay>

    <u-overlay :show="showEmailDialog" @click="showEmailDialog = false">
      <view class="dialog-card" @click.stop>
        <text class="dialog-title">修改邮箱</text>
        <input 
          v-model="emailForm.email" 
          placeholder="请输入新邮箱"
          class="dialog-input"
        />
        <view class="dialog-buttons">
          <u-button plain size="small" text="取消" @click="showEmailDialog = false"></u-button>
          <u-button type="primary" size="small" text="确定" :loading="submittingEmail" @click="handleUpdateEmail"></u-button>
        </view>
      </view>
    </u-overlay>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { profileApi } from '@/api/profile'

const authStore = useAuthStore()
const userInfo = ref<any>(null)

const showRealNameDialog = ref(false)
const showMobileDialog = ref(false)
const showEmailDialog = ref(false)

const realNameForm = reactive({ realName: '' })
const mobileForm = reactive({ mobile: '', smsCode: '' })
const emailForm = reactive({ email: '' })

const submittingRealName = ref(false)
const submittingMobile = ref(false)
const submittingEmail = ref(false)

onMounted(async () => {
  userInfo.value = authStore.userInfo
  if (!userInfo.value) {
    try {
      await authStore.fetchUserInfo()
      userInfo.value = authStore.userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})

const handleUpdateRealName = async () => {
  if (!realNameForm.realName) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  if (realNameForm.realName.length > 50) {
    uni.showToast({ title: '姓名不能超过50位', icon: 'none' })
    return
  }

  submittingRealName.value = true
  try {
    const res = await profileApi.updateRealName({ realName: realNameForm.realName })
    uni.showToast({ title: '修改成功', icon: 'success' })
    userInfo.value = res.data
    showRealNameDialog.value = false
    realNameForm.realName = ''
    authStore.userInfo = res.data
  } catch (error: any) {
    console.error('修改姓名失败:', error)
  } finally {
    submittingRealName.value = false
  }
}

const handleUpdateMobile = async () => {
  if (!mobileForm.mobile) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(mobileForm.mobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  submittingMobile.value = true
  try {
    const res = await profileApi.updateMobile({
      mobile: mobileForm.mobile,
      smsCode: mobileForm.smsCode,
    })
    uni.showToast({ title: '修改成功', icon: 'success' })
    userInfo.value = res.data
    showMobileDialog.value = false
    mobileForm.mobile = ''
    mobileForm.smsCode = ''
    authStore.userInfo = res.data
  } catch (error: any) {
    console.error('修改手机号失败:', error)
  } finally {
    submittingMobile.value = false
  }
}

const handleUpdateEmail = async () => {
  if (!emailForm.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    uni.showToast({ title: '请输入正确的邮箱地址', icon: 'none' })
    return
  }

  submittingEmail.value = true
  try {
    const res = await profileApi.updateEmail({ email: emailForm.email })
    uni.showToast({ title: '修改成功', icon: 'success' })
    userInfo.value = res.data
    showEmailDialog.value = false
    emailForm.email = ''
    authStore.userInfo = res.data
  } catch (error: any) {
    console.error('修改邮箱失败:', error)
  } finally {
    submittingEmail.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.form-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 0 32rpx;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 30rpx;
    color: #333;
  }

  .value-row {
    display: flex;
    align-items: center;

    .value {
      font-size: 28rpx;
      color: #999;
      margin-right: 12rpx;
    }
  }
}

.dialog-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 0 40rpx;
  width: 80vw;
}

.dialog-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 32rpx;
  text-align: center;
}

.dialog-input {
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 32rpx;
}
</style>
