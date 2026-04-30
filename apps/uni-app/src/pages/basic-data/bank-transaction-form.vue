<template>
  <view class="form-container">
    <view class="form-header">
      <text class="title">{{ isEdit ? '编辑流水记录' : '新增流水记录' }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="form-section">
        <view class="section-title">交易信息</view>

        <view class="form-group">
          <text class="label required">交易类型</text>
          <view class="radio-group">
            <view
              v-for="item in transactionTypeOptions"
              :key="item.value"
              :class="['radio-item', { active: formData.transactionType === item.value }]"
              @click="formData.transactionType = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="label required">交易金额</text>
          <input
            v-model.number="formData.amount"
            type="digit"
            placeholder="请输入交易金额"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">交易日期</text>
          <picker
            mode="date"
            :value="formData.transactionDate || today"
            @change="onDateChange"
          >
            <view class="date-picker">
              <text class="value" :class="{ placeholder: !formData.transactionDate }">
                {{ formData.transactionDate || '请选择交易日期' }}
              </text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="label">业务类型</text>
          <view class="radio-group">
            <view
              v-for="item in businessTypeOptions"
              :key="item.value"
              :class="['radio-item', { active: formData.businessType === item.value }]"
              @click="formData.businessType = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">交易详情</view>

        <view class="form-group">
          <text class="label">交易摘要</text>
          <textarea
            v-model="formData.summary"
            placeholder="请输入交易摘要"
            class="form-textarea"
            maxlength="500"
          />
        </view>

        <view class="form-group">
          <text class="label">对方名称</text>
          <input
            v-model="formData.counterpartyName"
            type="text"
            placeholder="请输入对方名称"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label">对方账户</text>
          <input
            v-model="formData.counterpartyAccount"
            type="text"
            placeholder="请输入对方账户"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label">备注</text>
          <textarea
            v-model="formData.remark"
            placeholder="请输入备注"
            class="form-textarea"
            maxlength="500"
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
import dayjs from 'dayjs'
import {
  getBankTransactionDetail,
  createBankTransaction,
  updateBankTransaction,
  type BankTransactionItem
} from '@/api/basic-data'

const accountId = ref<number>(0)
const transactionId = ref<number | null>(null)
const isEdit = computed(() => transactionId.value !== null)
const submitting = ref(false)

const today = dayjs().format('YYYY-MM-DD')

const formData = ref({
  accountId: 0,
  transactionType: '',
  amount: undefined as number | undefined,
  transactionDate: '',
  summary: '',
  businessType: '',
  counterpartyAccount: '',
  counterpartyName: '',
  remark: '',
})

const transactionTypeOptions = [
  { label: '流入', value: 'IN' },
  { label: '流出', value: 'OUT' },
]

const businessTypeOptions = [
  { label: '收款', value: '收款' },
  { label: '付款', value: '付款' },
  { label: '转账', value: '转账' },
  { label: '利息收入', value: '利息收入' },
  { label: '手续费', value: '手续费' },
  { label: '其他', value: '其他' },
]

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const aId = currentPage.options?.accountId
  const tId = currentPage.options?.transactionId

  if (aId) {
    accountId.value = parseInt(aId)
    formData.value.accountId = parseInt(aId)
  }

  if (tId) {
    transactionId.value = parseInt(tId)
    loadTransaction(parseInt(tId))
  }
})

const loadTransaction = async (id: number) => {
  try {
    const res = await getBankTransactionDetail(id)
    const data = res.data
    formData.value = {
      accountId: data.accountId,
      transactionType: data.transactionType,
      amount: data.amount,
      transactionDate: data.transactionDate,
      summary: data.summary || '',
      businessType: data.businessType || '',
      counterpartyAccount: data.counterpartyAccount || '',
      counterpartyName: data.counterpartyName || '',
      remark: data.remark || '',
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const onDateChange = (e: any) => {
  formData.value.transactionDate = e.detail.value
}

const validateForm = (): boolean => {
  if (!formData.value.transactionType) {
    uni.showToast({ title: '请选择交易类型', icon: 'none' })
    return false
  }
  if (!formData.value.amount || formData.value.amount <= 0) {
    uni.showToast({ title: '请输入正确的交易金额', icon: 'none' })
    return false
  }
  if (!formData.value.transactionDate) {
    uni.showToast({ title: '请选择交易日期', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || submitting.value) return
  submitting.value = true

  try {
    const submitData = { ...formData.value }

    if (isEdit.value && transactionId.value) {
      await updateBankTransaction(transactionId.value, submitData)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createBankTransaction(submitData)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    uni.$emit('refresh-transaction-list')
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

  .date-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;

      &.placeholder {
        color: #999;
      }
    }

    .arrow {
      font-size: 24rpx;
      color: #999;
      margin-left: 16rpx;
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
    min-height: 120rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: #333;
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .radio-item {
      padding: 0 24rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 12rpx;
      font-size: 26rpx;
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