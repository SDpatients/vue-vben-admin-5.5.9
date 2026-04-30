<template>
  <view class="form-container">
    <!-- 基本信息 -->
    <view class="form-section">
      <view class="section-title">基本信息</view>
      <view class="form-list">
        <view class="form-item">
          <text class="label">案件 <text class="required">*</text></text>
          <view class="value" @click="showCasePicker = true">
            <text :class="{ placeholder: !selectedCase }">{{ selectedCase ? selectedCase.caseName : '请选择案件' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">银行账户 <text class="required">*</text></text>
          <view class="value" @click="showBankPicker = true">
            <text :class="{ placeholder: !selectedBank }">{{ selectedBank ? selectedBank.fundAccountName : '请选择银行账户' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">报销日期 <text class="required">*</text></text>
          <picker mode="date" :value="form.reimbursementDate" @change="onDateChange">
            <view class="value">
              <text :class="{ placeholder: !form.reimbursementDate }">{{ form.reimbursementDate || '请选择日期' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">报销说明</text>
          <textarea class="textarea" v-model="form.description" placeholder="请输入报销说明（选填，最长500字符）" :maxlength="500" />
        </view>
      </view>
    </view>

    <!-- 报销明细 -->
    <view class="form-section">
      <view class="section-header">
        <text class="section-title">报销明细</text>
        <text class="section-action" @click="openAddItemDialog">+ 添加</text>
      </view>
      <view class="item-list">
        <view class="item-card" v-for="(item, index) in form.items" :key="index">
          <view class="item-header">
            <text class="item-name">{{ item.itemName }}</text>
            <text class="item-amount">¥{{ formatAmount(item.itemAmount) }}</text>
          </view>
          <view class="item-desc" v-if="item.itemDescription">{{ item.itemDescription }}</view>
          <view class="item-footer">
            <text class="item-index">明细 {{ index + 1 }}</text>
            <text class="item-delete" @click="handleRemoveItem(index)">删除</text>
          </view>
        </view>
        <view class="empty-items" v-if="form.items.length === 0">
          <text>请添加至少一条报销明细</text>
        </view>
      </view>
      <!-- 总金额显示 -->
      <view class="total-bar">
        <text class="total-label">总金额：</text>
        <text class="total-amount">¥{{ formatAmount(totalAmount) }}</text>
      </view>
    </view>

    <!-- 附件上传 -->
    <view class="form-section">
      <view class="section-header">
        <text class="section-title">附件</text>
        <text class="section-action" @click="handleChooseFile">+ 上传</text>
      </view>
      <view class="attachment-list">
        <view class="attachment-card" v-for="(file, index) in form.attachments" :key="index">
          <view class="file-icon">{{ getFileIcon(file.fileType) }}</view>
          <view class="file-info">
            <text class="file-name">{{ file.fileName }}</text>
            <text class="file-size">{{ formatFileSize(file.fileSize) }}</text>
          </view>
          <text class="file-delete" @click="handleRemoveAttachment(index)">×</text>
        </view>
        <view class="empty-attachments" v-if="form.attachments.length === 0">
          <text>暂无附件，点击上方"上传"按钮添加</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '保存修改' : '提交报销单' }}
      </button>
    </view>

    <!-- 添加明细弹窗 -->
    <view class="dialog-mask" v-if="showAddItem" @click.stop="closeAddItemDialog"></view>
    <view class="dialog-container" v-if="showAddItem" @click.stop>
      <view class="dialog-header">
        <text class="dialog-title">添加报销明细</text>
        <text class="dialog-close" @click="closeAddItemDialog">×</text>
      </view>
      <view class="dialog-content">
        <view class="form-item-dialog">
          <text class="label">费用名称 <text class="required">*</text></text>
          <picker mode="selector" :range="expenseTypeOptions" range-key="label" @change="onItemTypeChange">
            <view class="picker-value">
              <text>{{ itemForm.itemName || '请选择费用类型' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="form-item-dialog">
          <text class="label">费用金额 <text class="required">*</text></text>
          <view class="amount-input-wrapper">
            <text class="currency">¥</text>
            <input 
              class="amount-input" 
              v-model="itemForm.itemAmount" 
              type="digit" 
              placeholder="请输入金额" 
              @click.stop
              @focus="onAmountFocus"
              confirm-type="done"
            />
          </view>
        </view>
        <view class="form-item-dialog">
          <text class="label">费用说明</text>
          <textarea 
            class="textarea" 
            v-model="itemForm.itemDescription" 
            placeholder="请输入费用说明（选填）" 
            :maxlength="500"
            @click.stop
          />
        </view>
      </view>
      <view class="dialog-footer">
        <button class="dialog-btn cancel" @click="closeAddItemDialog">取消</button>
        <button class="dialog-btn confirm" @click="handleSaveItem">保存</button>
      </view>
    </view>

    <!-- 案件选择弹窗 -->
    <view class="dialog-mask" v-if="showCasePicker" @click="showCasePicker = false"></view>
    <view class="dialog-container list-dialog" v-if="showCasePicker">
      <view class="dialog-header">
        <text class="dialog-title">选择案件</text>
        <text class="dialog-close" @click="showCasePicker = false">×</text>
      </view>
      <view class="dialog-content">
        <view class="search-input">
          <text class="icon">🔍</text>
          <input v-model="caseSearchKeyword" type="text" placeholder="搜索案件" @input="searchCases" />
        </view>
        <scroll-view scroll-y class="list-content">
          <view class="list-item" v-for="item in caseList" :key="item.id" @click="selectCase(item)">
            <view class="item-info">
              <text class="item-title">{{ item.caseName }}</text>
              <text class="item-subtitle">{{ item.caseNumber }}</text>
            </view>
            <text class="item-check" v-if="selectedCase?.id === item.id">✓</text>
          </view>
          <view class="empty-list" v-if="caseList.length === 0">
            <text>暂无案件数据</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 银行账户选择弹窗 -->
    <view class="dialog-mask" v-if="showBankPicker" @click="showBankPicker = false"></view>
    <view class="dialog-container list-dialog" v-if="showBankPicker">
      <view class="dialog-header">
        <text class="dialog-title">选择银行账户</text>
        <text class="dialog-close" @click="showBankPicker = false">×</text>
      </view>
      <view class="dialog-content">
        <scroll-view scroll-y class="list-content">
          <view class="list-item" v-for="item in bankList" :key="item.id" @click="selectBank(item)">
            <view class="item-info">
              <text class="item-title">{{ item.fundAccountName }}</text>
              <text class="item-subtitle">{{ item.bankName }} - {{ item.bankAccount }}</text>
            </view>
            <text class="item-check" v-if="selectedBank?.id === item.id">✓</text>
          </view>
          <view class="empty-list" v-if="bankList.length === 0">
            <text>暂无银行账户数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  createExpenseReimbursement,
  updateExpenseReimbursement,
  getExpenseReimbursementDetail,
  uploadExpenseAttachment,
  expenseTypeOptions,
} from '@/api/expense-reimbursement'
import { getCaseList } from '@/api/case'
import { getBankAccountList } from '@/api/basic-data'
import dayjs from 'dayjs'

const isEdit = ref(false)
const expenseId = ref('')
const submitting = ref(false)

interface AttachmentItem {
  id?: number
  fileName: string
  fileSize: number
  fileType: string
  filePath?: string
  file?: File
}

const form = ref({
  caseId: 0,
  fundAccountId: 0,
  reimbursementDate: dayjs().format('YYYY-MM-DD'),
  description: '',
  items: [] as { itemName: string; itemAmount: number; itemDescription?: string }[],
  attachments: [] as AttachmentItem[],
})

const showAddItem = ref(false)
const showCasePicker = ref(false)
const showBankPicker = ref(false)

const itemForm = ref({
  itemName: '',
  itemAmount: '',
  itemDescription: '',
})

const selectedCase = ref<any>(null)
const selectedBank = ref<any>(null)

const caseList = ref<any[]>([])
const bankList = ref<any[]>([])

const caseSearchKeyword = ref('')

const totalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.itemAmount || 0), 0)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  expenseId.value = currentPage.options?.id || ''

  if (expenseId.value) {
    isEdit.value = true
    loadDetail()
  }

  loadCases()
  loadBankAccounts()
})

const loadDetail = async () => {
  try {
    const res = await getExpenseReimbursementDetail(expenseId.value)
    const data = res.data
    if (data) {
      form.value = {
        caseId: data.caseId,
        fundAccountId: data.fundAccountId,
        reimbursementDate: data.reimbursementDate,
        description: data.description || '',
        items: data.items.map(item => ({
          itemName: item.itemName,
          itemAmount: item.itemAmount,
          itemDescription: item.itemDescription,
        })),
        attachments: data.attachments?.map((a: any) => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: a.fileSize,
          fileType: a.fileType,
          filePath: a.filePath,
        })) || [],
      }
      selectedCase.value = { id: data.caseId, caseName: data.caseName }
      selectedBank.value = { id: data.fundAccountId, fundAccountName: data.fundAccountName }
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadCases = async () => {
  try {
    const res = await getCaseList({ pageNum: 1, pageSize: 50 })
    caseList.value = res.data?.list || []
  } catch (error) {
}
}

const loadBankAccounts = async () => {
  try {
    const res = await getBankAccountList({ pageNum: 1, pageSize: 100 })
    const list = res.data?.list || []
    bankList.value = list.map((item: any) => ({
      id: item.id,
      fundAccountName: item.accountName || item.fundAccountName,
      bankName: item.bankName,
      bankAccount: item.accountNumber || item.bankAccount,
    }))
  } catch (error) {
bankList.value = []
  }
}

const searchCases = () => {
  if (!caseSearchKeyword.value) {
    loadCases()
    return
  }
  const keyword = caseSearchKeyword.value.toLowerCase()
  caseList.value = caseList.value.filter(
    item =>
      item.caseName?.toLowerCase().includes(keyword) ||
      item.caseNumber?.toLowerCase().includes(keyword)
  )
}

const onDateChange = (e: any) => {
  form.value.reimbursementDate = e.detail.value
}

const openAddItemDialog = () => {
  itemForm.value = { itemName: '', itemAmount: '', itemDescription: '' }
  showAddItem.value = true
}

const closeAddItemDialog = () => {
  showAddItem.value = false
}

const onAmountFocus = () => {
  // 确保输入框获得焦点
}

const onItemTypeChange = (e: any) => {
  const index = Number(e.detail.value)
  const option = expenseTypeOptions[index]
  if (option) {
    itemForm.value.itemName = option.value
  }
}

const handleSaveItem = () => {
  if (!itemForm.value.itemName) {
    uni.showToast({ title: '请选择费用名称', icon: 'none' })
    return
  }
  if (!itemForm.value.itemAmount || Number(itemForm.value.itemAmount) <= 0) {
    uni.showToast({ title: '请输入有效的金额', icon: 'none' })
    return
  }

  form.value.items.push({
    itemName: itemForm.value.itemName,
    itemAmount: Number(itemForm.value.itemAmount),
    itemDescription: itemForm.value.itemDescription,
  })

  closeAddItemDialog()
}

const handleRemoveItem = (index: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条明细吗？',
    confirmColor: '#ff4d4f',
    success: (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        form.value.items.splice(index, 1)
      }
    },
  })
}

const handleChooseFile = () => {
  uni.chooseFile({
    count: 5,
    extension: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    success: (res: UniApp.ChooseFileSuccessCallbackResult) => {
      const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
      const files = Array.isArray(res.tempFiles) ? res.tempFiles : res.tempFiles ? [res.tempFiles] : []
      
      paths.forEach((path: string, index: number) => {
        const file = files[index] as any
        form.value.attachments.push({
          fileName: file?.name || path.split('/').pop() || '未知文件',
          fileSize: file?.size || 0,
          fileType: file?.type || getFileTypeFromPath(path),
          filePath: path,
        })
      })
    },
    fail: (err: any) => {
},
  })
}

const getFileTypeFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  return typeMap[ext] || 'application/octet-stream'
}

const handleRemoveAttachment = (index: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个附件吗？',
    confirmColor: '#ff4d4f',
    success: (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        form.value.attachments.splice(index, 1)
      }
    },
  })
}

const selectCase = (item: any) => {
  selectedCase.value = item
  form.value.caseId = item.id
  showCasePicker.value = false
}

const selectBank = (item: any) => {
  selectedBank.value = item
  form.value.fundAccountId = item.id
  showBankPicker.value = false
}

const handleSubmit = async () => {
  if (!form.value.caseId) {
    uni.showToast({ title: '请选择案件', icon: 'none' })
    return
  }
  if (!form.value.fundAccountId) {
    uni.showToast({ title: '请选择银行账户', icon: 'none' })
    return
  }
  if (!form.value.reimbursementDate) {
    uni.showToast({ title: '请选择报销日期', icon: 'none' })
    return
  }
  if (form.value.items.length === 0) {
    uni.showToast({ title: '请至少添加一条报销明细', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateExpenseReimbursement(expenseId.value, {
        caseId: form.value.caseId,
        fundAccountId: form.value.fundAccountId,
        reimbursementDate: form.value.reimbursementDate,
        description: form.value.description,
      })

      // 上传新附件
      for (const attachment of form.value.attachments) {
        if (attachment.filePath && !attachment.id) {
          try {
            await uploadExpenseAttachment(expenseId.value, attachment.filePath)
          } catch (e) {
}
        }
      }

      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      const response = await createExpenseReimbursement({
        caseId: form.value.caseId,
        fundAccountId: form.value.fundAccountId,
        reimbursementDate: form.value.reimbursementDate,
        description: form.value.description,
        items: form.value.items,
      })

      const reimbursementId = response.data?.reimbursementId

      // 上传附件
      if (reimbursementId && form.value.attachments.length > 0) {
        for (const attachment of form.value.attachments) {
          if (attachment.filePath) {
            try {
              await uploadExpenseAttachment(reimbursementId, attachment.filePath)
            } catch (e) {
}
          }
        }
      }

      uni.showToast({ title: '创建成功', icon: 'success' })
    }

    uni.$emit('refresh-expense-list')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: isEdit.value ? '修改失败' : '创建失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2)
}

const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return '📄'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('pdf')) return '📕'
  if (fileType.includes('word') || fileType.includes('document')) return '📘'
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📗'
  return '📄'
}
</script>

<style lang="scss" scoped>
.form-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 160rpx;
}

.form-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      padding-left: 16rpx;
      border-left: 6rpx solid #0068E2;
    }

    .section-action {
      font-size: 26rpx;
      color: #0068E2;
      padding: 8rpx 16rpx;
      background: #f0f4ff;
      border-radius: 8rpx;
    }
  }

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .form-list {
    .form-item {
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;

        .required {
          color: #ff4d4f;
        }
      }

      .value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        background: #fafafa;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333;

        .placeholder {
          color: #999;
        }

        .arrow {
          color: #999;
          font-size: 32rpx;
        }
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 160rpx;
        box-sizing: border-box;
      }
    }
  }

  .item-list {
    .item-card {
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .item-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }

        .item-amount {
          font-size: 32rpx;
          color: #f44336;
          font-weight: bold;
        }
      }

      .item-desc {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 16rpx;
        line-height: 1.5;
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16rpx;
        border-top: 1rpx solid #e8e8e8;

        .item-index {
          font-size: 24rpx;
          color: #999;
        }

        .item-delete {
          font-size: 26rpx;
          color: #ff4d4f;
          padding: 4rpx 12rpx;
        }
      }
    }

    .empty-items {
      text-align: center;
      padding: 60rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }

  .total-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 24rpx;
    margin-top: 16rpx;
    border-top: 2rpx solid #e8e8e8;

    .total-label {
      font-size: 28rpx;
      color: #666;
      margin-right: 16rpx;
    }

    .total-amount {
      font-size: 40rpx;
      color: #f44336;
      font-weight: bold;
    }
  }

  .attachment-list {
    .attachment-card {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      margin-bottom: 16rpx;

      .file-icon {
        font-size: 40rpx;
        margin-right: 16rpx;
      }

      .file-info {
        flex: 1;
        min-width: 0;

        .file-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          font-size: 24rpx;
          color: #999;
        }
      }

      .file-delete {
        font-size: 36rpx;
        color: #ff4d4f;
        padding: 0 16rpx;
        margin-left: 16rpx;
      }
    }

    .empty-attachments {
      text-align: center;
      padding: 40rpx 0;
      color: #999;
      font-size: 26rpx;
    }
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #0068E2;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 12rpx;
    border: none;

    &:active {
      background: #0052b3;
    }

    &[disabled] {
      background: #ccc;
    }
  }
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.dialog-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  z-index: 999;

  &.list-dialog {
    width: 650rpx;
    max-height: 70vh;
    display: flex;
    flex-direction: column;

    .dialog-content {
      max-height: 50vh;
      display: flex;
      flex-direction: column;
    }
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .dialog-close {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
      padding: 0 10rpx;
    }
  }

  .dialog-content {
    padding: 30rpx;
    overflow-y: auto;
    flex: 1;

    .form-item-dialog {
      margin-bottom: 30rpx;

      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;

        .required {
          color: #ff4d4f;
        }
      }

      .input {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        box-sizing: border-box;
      }

      .amount-input-wrapper {
        display: flex;
        align-items: center;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        background: #fafafa;
        overflow: hidden;

        .currency {
          padding: 20rpx;
          font-size: 28rpx;
          color: #666;
          background: #f0f0f0;
        }

        .amount-input {
          flex: 1;
          padding: 20rpx;
          font-size: 28rpx;
          background: #fafafa;
          border: none;
        }
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 120rpx;
        box-sizing: border-box;
      }

      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        background: #fafafa;

        text {
          font-size: 28rpx;
          color: #333;
        }

        .picker-arrow {
          color: #999;
        }
      }
    }

    .search-input {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 36rpx;
      padding: 0 24rpx;
      height: 72rpx;
      margin-bottom: 20rpx;

      .icon {
        font-size: 28rpx;
        margin-right: 12rpx;
        color: #999;
      }

      input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
    }

    .list-content {
      flex: 1;
      max-height: 400rpx;

      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx 0;
        border-bottom: 1rpx solid #f5f5f5;

        &:active {
          background: #f8f9fa;
        }

        .item-info {
          flex: 1;
          min-width: 0;

          .item-title {
            display: block;
            font-size: 30rpx;
            color: #333;
            margin-bottom: 8rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-subtitle {
            font-size: 26rpx;
            color: #999;
          }
        }

        .item-check {
          font-size: 32rpx;
          color: #0068E2;
          font-weight: bold;
          margin-left: 16rpx;
        }
      }

      .empty-list {
        text-align: center;
        padding: 60rpx 0;
        color: #999;
        font-size: 28rpx;
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx 30rpx;
    flex-shrink: 0;

    .dialog-btn {
      flex: 1;
      margin: 0;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 12rpx;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #0068E2;
        color: #fff;
      }
    }
  }
}
</style>
