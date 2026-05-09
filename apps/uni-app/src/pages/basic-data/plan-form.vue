<template>
  <view class="form-container">
    <view class="form-header">
      <text class="title">{{ isEdit ? '编辑工作计划' : '新增工作计划' }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <view class="form-group" v-if="!isEdit">
          <text class="label required">所属案件</text>
          <view class="case-selector" @click="openCaseSelector">
            <text class="value" :class="{ placeholder: !selectedCase }">
              {{ selectedCase ? `${selectedCase.caseNumber} - ${selectedCase.caseName}` : '请选择案件' }}
            </text>
            <text class="arrow">▼</text>
          </view>
        </view>

        <view class="form-group">
          <text class="label required">计划类型</text>
          <input
            v-model="formData.planType"
            type="text"
            placeholder="请输入计划类型"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">计划内容</text>
          <textarea
            v-model="formData.planContent"
            placeholder="请输入计划内容"
            class="form-textarea"
            :maxlength="1000"
          />
        </view>

        <view class="form-group">
          <text class="label">开始日期</text>
          <picker mode="date" :value="formData.startDate" @change="onStartDateChange">
            <view class="picker-value" :class="{ placeholder: !formData.startDate }">
              {{ formData.startDate || '请选择开始日期' }}
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="label">结束日期</text>
          <picker mode="date" :value="formData.endDate" @change="onEndDateChange">
            <view class="picker-value" :class="{ placeholder: !formData.endDate }">
              {{ formData.endDate || '请选择结束日期' }}
            </view>
          </picker>
        </view>
      </view>
    </scroll-view>

    <!-- 案件选择弹窗 -->
    <view class="case-modal" v-if="showCaseSelector">
      <view class="modal-mask" @click="showCaseSelector = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">选择案件</text>
          <text class="close-btn" @click="showCaseSelector = false">✕</text>
        </view>
        <scroll-view class="case-list" scroll-y>
          <view
            v-for="item in caseList"
            :key="item.id"
            class="case-item"
            @click="selectCase(item)"
          >
            <text class="case-no">{{ item.caseNumber }}</text>
            <text class="case-name">{{ item.caseName }}</text>
          </view>
          <view class="empty-case" v-if="caseList.length === 0">
            <text>暂无案件数据</text>
          </view>
        </scroll-view>
      </view>
    </view>

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
  getWorkPlanDetail,
  createWorkPlan,
  updateWorkPlan,
  type WorkPlanItem
} from '@/api/basic-data'
import { getPageParam } from '@/utils/pageParam'
import { getCaseList, type CaseItem } from '@/api/case'

const planId = ref<number | null>(null)
const isEdit = computed(() => planId.value !== null)
const submitting = ref(false)
const showCaseSelector = ref(false)
const selectedCase = ref<CaseItem | null>(null)
const caseList = ref<CaseItem[]>([])

const formData = ref({
  caseId: undefined as number | undefined,
  planType: '',
  planContent: '',
  startDate: '',
  endDate: '',
  responsibleUserId: undefined as number | undefined,
})

onMounted(() => {
  const id = getPageParam('id')

  loadCaseList()

  if (id) {
    planId.value = parseInt(id)
    loadDetail(parseInt(id))
  }
})

const loadCaseList = async () => {
  try {
    const res = await getCaseList({ pageNum: 1, pageSize: 100 })
    caseList.value = res.data?.list || []
  } catch (error) {
}
}

const openCaseSelector = () => {
  showCaseSelector.value = true
}

const selectCase = (item: CaseItem) => {
  selectedCase.value = item
  formData.value.caseId = item.id
  showCaseSelector.value = false
  }

const onStartDateChange = (e: any) => {
  formData.value.startDate = e.detail.value
}

const onEndDateChange = (e: any) => {
  formData.value.endDate = e.detail.value
}

const loadDetail = async (id: number) => {
  try {
    const res = await getWorkPlanDetail(id)
    const data = res.data
    formData.value = {
      caseId: data.caseId,
      planType: data.planType || '',
      planContent: data.planContent || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      responsibleUserId: data.responsibleUserId,
    }
  } catch (error) {
uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const validateForm = (): boolean => {
  if (!isEdit.value && !formData.value.caseId) {
    uni.showToast({ title: '请选择所属案件', icon: 'none' })
    return false
  }
  if (!formData.value.planType.trim()) {
    uni.showToast({ title: '请输入计划类型', icon: 'none' })
    return false
  }
  if (!formData.value.planContent.trim()) {
    uni.showToast({ title: '请输入计划内容', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || submitting.value) return
  submitting.value = true

  try {
    const submitData = { ...formData.value }
    if (isEdit.value) {
      delete submitData.caseId
    }

    if (isEdit.value && planId.value) {
      await updateWorkPlan(planId.value, { id: planId.value, ...submitData })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createWorkPlan(submitData)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    uni.$emit('refresh-plan-list')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
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

  .form-textarea {
    width: 100%;
    min-height: 200rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: #333;
  }

  .case-selector, .picker-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;

    &.placeholder {
      color: #999;
    }
  }

  .case-selector .value {
    flex: 1;
    font-size: 28rpx;
    color: #333;

    &.placeholder {
      color: #999;
    }
  }

  .case-selector .arrow {
    font-size: 24rpx;
    color: #999;
    margin-left: 16rpx;
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

.case-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .close-btn {
      font-size: 32rpx;
      color: #999;
      padding: 10rpx;
    }
  }

  .case-list {
    flex: 1;
    max-height: 50vh;

    .case-item {
      display: flex;
      flex-direction: column;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:active {
        background: #f5f5f5;
      }

      .case-no {
        font-size: 28rpx;
        color: #1890ff;
        font-weight: 500;
        margin-bottom: 8rpx;
      }

      .case-name {
        font-size: 26rpx;
        color: #666;
      }
    }

    .empty-case {
      display: flex;
      justify-content: center;
      padding: 60rpx 0;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
