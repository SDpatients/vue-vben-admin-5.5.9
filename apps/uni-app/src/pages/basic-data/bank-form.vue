<template>
  <view class="form-container">
    <view class="form-header">
      <text class="title">{{ isEdit ? '编辑银行账户' : '新增银行账户' }}</text>
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
          <text class="label required">账户名称</text>
          <input
            v-model="formData.accountName"
            type="text"
            placeholder="请输入账户名称"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">账号</text>
          <input
            v-model="formData.accountNumber"
            type="text"
            placeholder="请输入账号"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">账户类型</text>
          <view class="radio-group">
            <view
              v-for="item in accountTypeOptions"
              :key="item.value"
              :class="['radio-item', { active: formData.accountType === item.value }]"
              @click="formData.accountType = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="label required">银行名称</text>
          <input
            v-model="formData.bankName"
            type="text"
            placeholder="请输入银行名称"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">开户行</text>
          <input
            v-model="formData.openingBank"
            type="text"
            placeholder="请输入开户行"
            class="form-input"
          />
        </view>

        <view class="form-group" v-if="!isEdit">
          <text class="label required">账户密码</text>
          <input
            v-model="formData.password"
            type="text"
            password
            placeholder="请输入账户密码"
            class="form-input"
          />
        </view>

        <view class="form-group">
          <text class="label required">当前余额</text>
          <input
            v-model.number="formData.currentBalance"
            type="digit"
            placeholder="请输入当前余额"
            class="form-input"
          />
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
  getBankAccountDetail,
  createBankAccount,
  updateBankAccount,
  type BankAccountItem
} from '@/api/basic-data'
import { getCaseList, type CaseItem } from '@/api/case'

const accountId = ref<number | null>(null)
const isEdit = computed(() => accountId.value !== null)
const submitting = ref(false)
const showCaseSelector = ref(false)
const selectedCase = ref<CaseItem | null>(null)
const caseList = ref<CaseItem[]>([])

const formData = ref({
  caseId: undefined as number | undefined,
  accountName: '',
  accountNumber: '',
  accountType: '',
  bankName: '',
  openingBank: '',
  password: '',
  currentBalance: undefined as number | undefined,
})

const accountTypeOptions = [
  { label: '基本存款账户', value: '基本存款账户' },
  { label: '一般存款账户', value: '一般存款账户' },
  { label: '专用存款账户', value: '专用存款账户' },
  { label: '临时存款账户', value: '临时存款账户' },
]

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage.options?.id

  loadCaseList()

  if (id) {
    accountId.value = parseInt(id)
    loadDetail(parseInt(id))
  }
})

const loadCaseList = async () => {
  try {
    const res = await getCaseList({ pageNum: 1, pageSize: 100 })
    caseList.value = res.data?.list || []
  } catch (error) {
    console.error('[loadCaseList] Error:', error)
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

const loadDetail = async (id: number) => {
  try {
    const res = await getBankAccountDetail(id)
    const data = res.data
    formData.value = {
      caseId: data.caseId,
      accountName: data.accountName || '',
      accountNumber: data.accountNumber || '',
      accountType: data.accountType || '',
      bankName: data.bankName || '',
      openingBank: data.openingBank || '',
      password: '',
      currentBalance: data.currentBalance,
    }
  } catch (error) {
    console.error('[loadDetail] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const validateForm = (): boolean => {
  if (!isEdit.value && !formData.value.caseId) {
    uni.showToast({ title: '请选择所属案件', icon: 'none' })
    return false
  }
  if (!formData.value.accountName.trim()) {
    uni.showToast({ title: '请输入账户名称', icon: 'none' })
    return false
  }
  if (!formData.value.accountNumber.trim()) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return false
  }
  if (!formData.value.accountType) {
    uni.showToast({ title: '请选择账户类型', icon: 'none' })
    return false
  }
  if (!formData.value.bankName.trim()) {
    uni.showToast({ title: '请输入银行名称', icon: 'none' })
    return false
  }
  if (!formData.value.openingBank.trim()) {
    uni.showToast({ title: '请输入开户行', icon: 'none' })
    return false
  }
  if (!isEdit.value && !formData.value.password) {
    uni.showToast({ title: '请输入账户密码', icon: 'none' })
    return false
  }
  if (formData.value.currentBalance === undefined || formData.value.currentBalance === null) {
    uni.showToast({ title: '请输入当前余额', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || submitting.value) return
  submitting.value = true

  try {
    const submitData: any = { ...formData.value }
    if (isEdit.value) {
      delete submitData.caseId
      delete submitData.password
    }
    
    if (isEdit.value && accountId.value) {
      await updateBankAccount(accountId.value, submitData)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createBankAccount(submitData)
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

  .case-selector {
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
