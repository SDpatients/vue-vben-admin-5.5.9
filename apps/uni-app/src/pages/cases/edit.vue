<template>
  <view class="edit-container">
    <view class="form-section">
      <view class="section-title">基本信息</view>
      
      <view class="form-item">
        <text class="label required">案件名称</text>
        <input
          v-model="formData.caseName"
          class="input"
          type="text"
          placeholder="请输入案件名称"
        />
      </view>

      <view class="form-item">
        <text class="label">案由</text>
        <input
          v-model="formData.caseReason"
          class="input"
          type="text"
          placeholder="请输入案由"
        />
      </view>

      <view class="form-item">
        <text class="label">受理法院</text>
        <input
          v-model="formData.acceptanceCourt"
          class="input"
          type="text"
          placeholder="请输入受理法院"
        />
      </view>

      <view class="form-item">
        <text class="label">指定机构</text>
        <input
          v-model="formData.designatedInstitution"
          class="input"
          type="text"
          placeholder="请输入指定机构"
        />
      </view>

      <view class="form-item">
        <text class="label">主要负责人</text>
        <input
          v-model="formData.mainResponsiblePerson"
          class="input"
          type="text"
          placeholder="请输入主要负责人"
        />
      </view>

      <view class="form-item">
        <text class="label">指定法官</text>
        <input
          v-model="formData.designatedJudge"
          class="input"
          type="text"
          placeholder="请输入指定法官"
        />
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">时间信息</view>
      
      <view class="form-item">
        <text class="label">受理日期</text>
        <picker
          mode="date"
          :value="formData.acceptanceDate"
          @change="onAcceptanceDateChange"
        >
          <view class="picker">
            {{ formData.acceptanceDate || '请选择受理日期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">债权申报截止日期</text>
        <picker
          mode="date"
          :value="formData.debtClaimDeadline"
          @change="onDebtClaimDeadlineChange"
        >
          <view class="picker">
            {{ formData.debtClaimDeadline || '请选择债权申报截止日期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">立案日期</text>
        <picker
          mode="date"
          :value="formData.filingDate"
          @change="onFilingDateChange"
        >
          <view class="picker">
            {{ formData.filingDate || '请选择立案日期' }}
          </view>
        </picker>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">案件进度</view>
      
      <view class="form-item">
        <text class="label">案件进度</text>
        <picker
          mode="selector"
          :range="progressOptions"
          range-key="label"
          :value="progressIndex"
          @change="onProgressChange"
        >
          <view class="picker">
            {{ getProgressLabel(formData.caseProgress) || '请选择案件进度' }}
          </view>
        </picker>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">备注信息</view>
      
      <view class="form-item">
        <textarea
          v-model="formData.remarks"
          class="textarea"
          placeholder="请输入备注信息"
          :maxlength="500"
        />
      </view>
    </view>

    <view class="action-bar">
      <button class="cancel-btn" @click="handleCancel">取消</button>
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        保存
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getCaseDetail, updateCase, type UpdateCaseParams } from '@/api/case'

const caseId = ref('')
const submitting = ref(false)

const formData = reactive<UpdateCaseParams>({
  caseName: '',
  caseReason: '',
  acceptanceCourt: '',
  designatedInstitution: '',
  mainResponsiblePerson: '',
  designatedJudge: '',
  acceptanceDate: '',
  debtClaimDeadline: '',
  filingDate: '',
  caseProgress: '',
  remarks: '',
})

const progressOptions = [
  { label: '第一阶段', value: 'FIRST' },
  { label: '第二阶段', value: 'SECOND' },
  { label: '第三阶段', value: 'THIRD' },
  { label: '第四阶段', value: 'FOURTH' },
  { label: '第五阶段', value: 'FIFTH' },
  { label: '第六阶段', value: 'SIXTH' },
  { label: '第七阶段', value: 'SEVENTH' },
]

const progressIndex = computed(() => {
  if (!formData.caseProgress) return 0
  const index = progressOptions.findIndex(opt => opt.value === formData.caseProgress)
  return index >= 0 ? index : 0
})

const getProgressLabel = (value?: string) => {
  const option = progressOptions.find(opt => opt.value === value)
  return option ? option.label : ''
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.id || ''

  if (caseId.value) {
    loadCaseDetail()
  }
})

const loadCaseDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCaseDetail(caseId.value)
    if (res.data) {
      const data = res.data
      formData.caseName = data.caseName || ''
      formData.caseReason = data.caseReason || ''
      formData.acceptanceCourt = data.acceptanceCourt || ''
      formData.designatedInstitution = data.designatedInstitution || ''
      formData.mainResponsiblePerson = data.mainResponsiblePerson || ''
      formData.designatedJudge = data.designatedJudge || ''
      formData.acceptanceDate = data.acceptanceDate ? data.acceptanceDate.split('T')[0] : ''
      formData.debtClaimDeadline = data.debtClaimDeadline ? data.debtClaimDeadline.split('T')[0] : ''
      formData.filingDate = data.filingDate ? data.filingDate.split('T')[0] : ''
      formData.caseProgress = data.caseProgress || ''
      formData.remarks = data.remarks || ''
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const onAcceptanceDateChange = (e: any) => {
  formData.acceptanceDate = e.detail.value
}

const onDebtClaimDeadlineChange = (e: any) => {
  formData.debtClaimDeadline = e.detail.value
}

const onFilingDateChange = (e: any) => {
  formData.filingDate = e.detail.value
}

const onProgressChange = (e: any) => {
  const index = e.detail.value
  formData.caseProgress = progressOptions[index].value
}

const handleCancel = () => {
  uni.navigateBack()
}

const handleSubmit = async () => {
  if (!formData.caseName?.trim()) {
    uni.showToast({ title: '请输入案件名称', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await updateCase(caseId.value, formData)
    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
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
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .form-item {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
      font-weight: 500;

      &.required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 8rpx;
      }
    }

    .input {
      width: 100%;
      height: 80rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
    }

    .textarea {
      width: 100%;
      min-height: 200rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 24rpx;
      font-size: 28rpx;
      color: #333;
    }

    .picker {
      width: 100%;
      height: 80rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
      display: flex;
      align-items: center;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  .cancel-btn,
  .submit-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
  }

  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }

  .submit-btn {
    background: #0068E2;
    color: #fff;
  }
}
</style>
