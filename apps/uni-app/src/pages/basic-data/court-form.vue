<template>
  <view class="form-container">
    <view class="form-header">
      <text class="title">{{ isEdit ? '编辑法院' : '新增法院' }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <view class="form-group">
          <text class="label required">法院全称</text>
          <input
            v-model="formData.fullName"
            type="text"
            placeholder="请输入法院全称"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">法院简称</text>
          <input
            v-model="formData.shortName"
            type="text"
            placeholder="请输入法院简称"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">法院级别</text>
          <view class="radio-group">
            <view
              v-for="item in courtLevelOptions"
              :key="item.value"
              :class="['radio-item', { active: formData.courtLevel === item.value }]"
              @click="formData.courtLevel = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="label">联系电话</text>
          <input
            v-model="formData.contactPhone"
            type="text"
            placeholder="请输入联系电话"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label">承办法官</text>
          <input
            v-model="formData.undertakingJudge"
            type="text"
            placeholder="请输入承办法官"
            class="form-input"
          />
        </view>
      </view>
    </scroll-view>

    <view class="form-footer">
      <view class="btn cancel-btn" @click="handleCancel">取消</view>
      <view class="btn submit-btn" @click="handleSubmit" :class="{ loading: submitting }">
        <text>{{ submitting ? '保存中...' : '保存' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getCourtDetail,
  createCourt,
  updateCourt,
  type CourtItem
} from '@/api/basic-data'

const courtId = ref<number | null>(null)
const isEdit = computed(() => courtId.value !== null)
const submitting = ref(false)

const formData = ref({
  fullName: '',
  shortName: '',
  courtLevel: '',
  contactPhone: '',
  undertakingJudge: '',
  responsibleUserId: undefined as number | undefined,
})

const courtLevelOptions = [
  { label: '基层法院', value: '基层法院' },
  { label: '中级法院', value: '中级法院' },
  { label: '高级法院', value: '高级法院' },
  { label: '最高法院', value: '最高法院' },
]

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage.options?.id

  if (id) {
    courtId.value = parseInt(id)
    loadDetail(parseInt(id))
  }
})

const loadDetail = async (id: number) => {
  try {
    const res = await getCourtDetail(id)
    const data = res.data
    formData.value = {
      fullName: data.fullName || '',
      shortName: data.shortName || '',
      courtLevel: data.courtLevel || '',
      contactPhone: data.contactPhone || '',
      undertakingJudge: data.undertakingJudge || '',
      responsibleUserId: data.responsibleUserId,
    }
  } catch (error) {
    console.error('[loadDetail] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const validateForm = (): boolean => {
  if (!formData.value.fullName.trim()) {
    uni.showToast({ title: '请输入法院全称', icon: 'none' })
    return false
  }
  if (!formData.value.shortName.trim()) {
    uni.showToast({ title: '请输入法院简称', icon: 'none' })
    return false
  }
  if (!formData.value.courtLevel) {
    uni.showToast({ title: '请选择法院级别', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || submitting.value) return
  submitting.value = true

  try {
    if (isEdit.value && courtId.value) {
      await updateCourt(courtId.value, formData.value)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createCourt(formData.value)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('[submit] Error:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.form-header {
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.form-body {
  flex: 1;
  overflow-y: auto;
}

.form-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.form-group {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;

    &.required::before {
      content: '* ';
      color: #ff4d4f;
    }
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .radio-item {
      padding: 0 32rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #666;

      &.active {
        background: #e6f7ff;
        color: #1890ff;
        border: 2rpx solid #1890ff;
      }
    }
  }
}

.form-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #eee;

  .btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 32rpx;

    &.cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    &.submit-btn {
      background: #1890ff;
      color: #fff;

      &.loading {
        opacity: 0.6;
      }
    }
  }
}
</style>
