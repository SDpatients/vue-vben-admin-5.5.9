<template>
  <view class="debtor-container">
    <view class="header">
      <text class="title">债务人管理</text>
      <text class="subtitle">案件编号：{{ caseNo }}</text>
    </view>

    <view class="content">
      <view class="loading-container" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty-state" v-else-if="!loading && debtorList.length === 0">
        <text class="empty-icon">🏢</text>
        <text class="empty-text">暂无债务人信息</text>
      </view>

      <view class="debtor-list" v-else>
        <view class="debtor-item" v-for="(item, index) in debtorList" :key="item.id" @click="viewDebtorDetail(item)">
          <view class="debtor-avatar">
            <text class="avatar-text">企</text>
          </view>
          <view class="debtor-info">
            <view class="debtor-name-row">
              <text class="debtor-name">{{ item.enterpriseName }}</text>
              <text class="debtor-type" v-if="item.industry">{{ item.industry }}</text>
            </view>
            <text class="debtor-code">{{ item.unifiedSocialCreditCode || '-' }}</text>
            <view class="debtor-meta">
              <text class="meta-item" v-if="item.legalRepresentative">法人：{{ item.legalRepresentative }}</text>
              <text class="meta-item" v-if="item.contactPhone">电话：{{ item.contactPhone }}</text>
            </view>
          </view>
          <view class="debtor-actions" @click.stop>
            <text class="action-btn edit-btn" @click="openEditDialog(item)">编辑</text>
            <text class="action-btn delete-btn" @click="confirmDelete(item)">删除</text>
          </view>
        </view>

        <view class="load-more" v-if="hasMore" @click="loadMore">
          <text>加载更多</text>
        </view>
      </view>
    </view>

    <view class="fab-btn" @click="openAddDialog">
      <text class="fab-icon">+</text>
    </view>

    <uni-popup ref="detailPopup" type="center">
      <view class="dialog-container detail-dialog">
        <view class="dialog-header">
          <text class="dialog-title">债务人详情</text>
          <text class="dialog-close" @click="closeDetailPopup">×</text>
        </view>
        <view class="dialog-content" v-if="currentDebtor">
          <view class="detail-section">
            <text class="detail-section-title">基本信息</text>
            <view class="detail-item">
              <text class="detail-label">企业名称</text>
              <text class="detail-value">{{ currentDebtor.enterpriseName || '-' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">统一社会信用代码</text>
              <text class="detail-value code">{{ currentDebtor.unifiedSocialCreditCode || '-' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">法定代表人</text>
              <text class="detail-value">{{ currentDebtor.legalRepresentative || '-' }}</text>
            </view>
            <view class="detail-item" v-if="currentDebtor.industry">
              <text class="detail-label">所属行业</text>
              <text class="detail-value">{{ currentDebtor.industry }}</text>
            </view>
            <view class="detail-item" v-if="currentDebtor.businessScope">
              <text class="detail-label">经营范围</text>
              <text class="detail-value">{{ currentDebtor.businessScope }}</text>
            </view>
            <view class="detail-item" v-if="currentDebtor.registeredAddress">
              <text class="detail-label">注册地址</text>
              <text class="detail-value">{{ currentDebtor.registeredAddress }}</text>
            </view>
          </view>
          <view class="detail-section">
            <text class="detail-section-title">联系方式</text>
            <view class="detail-item" v-if="currentDebtor.contactPerson">
              <text class="detail-label">联系人</text>
              <text class="detail-value">{{ currentDebtor.contactPerson }}</text>
            </view>
            <view class="detail-item" v-if="currentDebtor.contactPhone">
              <text class="detail-label">联系电话</text>
              <text class="detail-value phone" @click="callPhone(currentDebtor.contactPhone)">{{ currentDebtor.contactPhone }}</text>
            </view>
          </view>
        </view>
        <view class="dialog-footer detail-footer">
          <button class="dialog-btn" @click="openEditDialog(currentDebtor)">编辑</button>
          <button class="dialog-btn confirm" @click="closeDetailPopup">关闭</button>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="formPopup" type="center">
      <view class="dialog-container form-dialog">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑债务人' : '新增债务人' }}</text>
          <text class="dialog-close" @click="closeFormPopup">×</text>
        </view>
        <scroll-view class="dialog-scroll" scroll-y>
          <view class="dialog-content">
            <view class="form-item">
              <text class="label">企业名称 <text class="required">*</text></text>
              <input
                v-model="formData.enterpriseName"
                type="text"
                placeholder="请输入企业名称"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="label">统一社会信用代码 <text class="required">*</text></text>
              <input
                v-model="formData.unifiedSocialCreditCode"
                type="text"
                placeholder="请输入统一社会信用代码"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="label">法定代表人 <text class="required">*</text></text>
              <input
                v-model="formData.legalRepresentative"
                type="text"
                placeholder="请输入法定代表人"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="label">企业类型</text>
              <picker mode="selector" :range="enterpriseTypeOptions" range-key="label" @change="onEnterpriseTypeChange">
                <view class="picker-value">
                  <text>{{ formData.enterpriseType || '请选择企业类型' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            <view class="form-item">
              <text class="label">所属行业</text>
              <picker mode="selector" :range="industryOptions" range-key="label" @change="onIndustryChange">
                <view class="picker-value">
                  <text>{{ formData.industry || '请选择行业' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            <view class="form-item">
              <text class="label">联系电话</text>
              <input
                v-model="formData.contactPhone"
                type="text"
                placeholder="请输入联系电话"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="label">联系人</text>
              <input
                v-model="formData.contactPerson"
                type="text"
                placeholder="请输入联系人"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="label">注册地址</text>
              <textarea
                v-model="formData.registeredAddress"
                placeholder="请输入注册地址"
                class="form-textarea"
                :maxlength="200"
              />
            </view>
            <view class="form-item">
              <text class="label">经营范围</text>
              <textarea
                v-model="formData.businessScope"
                placeholder="请输入经营范围"
                class="form-textarea"
                :maxlength="500"
              />
            </view>
          </view>
        </scroll-view>
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="closeFormPopup">取消</button>
          <button class="dialog-btn confirm" type="primary" @click="handleSave" :loading="saving">
            保存
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getDebtorList,
  createDebtor,
  updateDebtor,
  deleteDebtor,
  type DebtorItem,
} from '@/api/basic-data'

const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const caseId = ref('')
const caseNo = ref('')
const debtorList = ref<DebtorItem[]>([])
const currentDebtor = ref<DebtorItem | null>(null)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(false)

const detailPopup = ref()
const formPopup = ref()

const formData = ref({
  enterpriseName: '',
  unifiedSocialCreditCode: '',
  legalRepresentative: '',
  enterpriseType: '',
  industry: '',
  contactPhone: '',
  contactPerson: '',
  registeredAddress: '',
  businessScope: '',
})

const enterpriseTypeOptions = [
  { label: '有限责任公司', value: '有限责任公司' },
  { label: '股份有限公司', value: '股份有限公司' },
  { label: '国有企业', value: '国有企业' },
  { label: '集体企业', value: '集体企业' },
  { label: '私营企业', value: '私营企业' },
  { label: '外商投资企业', value: '外商投资企业' },
  { label: '其他', value: '其他' },
]

const industryOptions = [
  { label: '制造业', value: '制造业' },
  { label: '建筑业', value: '建筑业' },
  { label: '金融业', value: '金融业' },
  { label: '房地产业', value: '房地产业' },
  { label: '批发和零售业', value: '批发和零售业' },
  { label: '交通运输、仓储和邮政业', value: '交通运输、仓储和邮政业' },
  { label: '住宿和餐饮业', value: '住宿和餐饮业' },
  { label: '信息传输、软件和信息技术服务业', value: '信息传输、软件和信息技术服务业' },
  { label: '其他', value: '其他' },
]

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.id || ''
  if (caseId.value) {
    loadData()
  }
  uni.$on('refresh-case-debtor-list', () => loadData())
})

onUnmounted(() => {
  uni.$off('refresh-case-debtor-list')
})

onShow(() => {
  if (caseId.value) {
    loadData()
  }
})

const loadData = async (reset = true) => {
  if (reset) {
    pageNum.value = 1
    debtorList.value = []
  }
  loading.value = true
  try {
    const res = await getDebtorList({
      caseId: Number(caseId.value),
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    const newList = res.data?.list || []
    if (reset) {
      debtorList.value = newList
    } else {
      debtorList.value = [...debtorList.value, ...newList]
    }
    total.value = res.data?.total || 0
    hasMore.value = debtorList.value.length < total.value
    if (reset && newList.length > 0) {
      caseNo.value = String(newList[0].caseNo || caseId.value)
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    pageNum.value++
    loadData(false)
  }
}

const viewDebtorDetail = (item: DebtorItem) => {
  currentDebtor.value = item
  detailPopup.value?.open()
}

const closeDetailPopup = () => {
  detailPopup.value?.close()
}

const callPhone = (phone: string) => {
  uni.makePhoneCall({ phoneNumber: phone })
}

const openAddDialog = () => {
  isEditing.value = false
  currentDebtor.value = null
  formData.value = {
    enterpriseName: '',
    unifiedSocialCreditCode: '',
    legalRepresentative: '',
    enterpriseType: '',
    industry: '',
    contactPhone: '',
    contactPerson: '',
    registeredAddress: '',
    businessScope: '',
  }
  formPopup.value?.open()
}

const openEditDialog = (item: DebtorItem) => {
  isEditing.value = true
  currentDebtor.value = item
  formData.value = {
    enterpriseName: item.enterpriseName || '',
    unifiedSocialCreditCode: item.unifiedSocialCreditCode || '',
    legalRepresentative: item.legalRepresentative || '',
    enterpriseType: '',
    industry: item.industry || '',
    contactPhone: item.contactPhone || '',
    contactPerson: item.contactPerson || '',
    registeredAddress: item.registeredAddress || '',
    businessScope: item.businessScope || '',
  }
  detailPopup.value?.close()
  formPopup.value?.open()
}

const closeFormPopup = () => {
  formPopup.value?.close()
}

const onEnterpriseTypeChange = (e: any) => {
  const index = Number(e.detail.value)
  const option = enterpriseTypeOptions[index]
  if (option) {
    formData.value.enterpriseType = option.value
  }
}

const onIndustryChange = (e: any) => {
  const index = Number(e.detail.value)
  const option = industryOptions[index]
  if (option) {
    formData.value.industry = option.value
  }
}

const handleSave = async () => {
  if (!formData.value.enterpriseName.trim()) {
    uni.showToast({ title: '请输入企业名称', icon: 'none' })
    return
  }
  if (!formData.value.unifiedSocialCreditCode.trim()) {
    uni.showToast({ title: '请输入统一社会信用代码', icon: 'none' })
    return
  }
  if (!formData.value.legalRepresentative.trim()) {
    uni.showToast({ title: '请输入法定代表人', icon: 'none' })
    return
  }

  saving.value = true
  try {
    const submitData: any = {
      ...formData.value,
    }

    if (isEditing.value && currentDebtor.value) {
      await updateDebtor(currentDebtor.value.id, submitData)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      submitData.caseId = Number(caseId.value)
      await createDebtor(submitData)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    closeFormPopup()
    await loadData()
  } catch (error) {
    uni.showToast({ title: isEditing.value ? '更新失败' : '添加失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: DebtorItem) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除债务人"${item.enterpriseName}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        await handleDelete(item)
      }
    },
  })
}

const handleDelete = async (item: DebtorItem) => {
  try {
    await deleteDebtor(item.id)
    uni.showToast({ title: '删除成功', icon: 'success' })
    await loadData()
  } catch (error) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.debtor-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.header {
  background: #0068E2;
  padding: 40rpx;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 12rpx;
  }

  .subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.content {
  padding: 20rpx;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.debtor-list {
  .debtor-item {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    &:active {
      background: #fafafa;
    }

    .debtor-avatar {
      width: 80rpx;
      height: 80rpx;
      background: #fff7e6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;

      .avatar-text {
        font-size: 28rpx;
        color: #fa8c16;
        font-weight: bold;
      }
    }

    .debtor-info {
      flex: 1;
      min-width: 0;

      .debtor-name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        .debtor-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-right: 12rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 320rpx;
        }

        .debtor-type {
          font-size: 20rpx;
          color: #0068E2;
          background: rgba(0, 104, 226, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          flex-shrink: 0;
        }
      }

      .debtor-code {
        font-size: 22rpx;
        color: #999;
        font-family: monospace;
        display: block;
        margin-bottom: 8rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .debtor-meta {
        display: flex;
        gap: 24rpx;

        .meta-item {
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    .debtor-actions {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      margin-left: 16rpx;
      flex-shrink: 0;

      .action-btn {
        padding: 8rpx 20rpx;
        border-radius: 8rpx;
        font-size: 22rpx;
        text-align: center;

        &.edit-btn {
          background: #f0f4ff;
          color: #0068E2;

          &:active {
            opacity: 0.7;
          }
        }

        &.delete-btn {
          background: #fff1f0;
          color: #ff4d4f;

          &:active {
            opacity: 0.7;
          }
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 30rpx 0;
    color: #0068E2;
    font-size: 28rpx;
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #0068E2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 104, 226, 0.3);

  &:active {
    transform: scale(0.95);
  }

  .fab-icon {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
  }
}

.dialog-container {
  width: 620rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  &.detail-dialog {
    width: 650rpx;
  }

  &.form-dialog {
    width: 650rpx;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

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

  .dialog-scroll {
    flex: 1;
    max-height: 60vh;
  }

  .dialog-content {
    padding: 30rpx;

    .detail-section {
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-section-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 16rpx;
        padding-left: 16rpx;
        border-left: 4rpx solid #0068E2;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f8f8f8;

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-size: 26rpx;
        color: #999;
        flex-shrink: 0;
        margin-right: 20rpx;
      }

      .detail-value {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        flex: 1;
        word-break: break-all;

        &.code {
          font-family: monospace;
          font-size: 24rpx;
        }

        &.phone {
          color: #0068E2;
        }
      }
    }

    .form-item {
      margin-bottom: 24rpx;

      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
        display: block;

        .required {
          color: #ff4d4f;
        }
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333;
      }

      .form-textarea {
        width: 100%;
        min-height: 120rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        padding: 20rpx 24rpx;
        font-size: 28rpx;
        color: #333;
      }

      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 24rpx;
        background: #f5f5f5;
        border-radius: 8rpx;

        text {
          font-size: 28rpx;
          color: #333;
        }

        .picker-arrow {
          color: #999;
          font-size: 20rpx;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx 30rpx;

    .dialog-btn {
      flex: 1;
      margin: 0;
      font-size: 28rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 8rpx;
      background: #f5f5f5;
      color: #666;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #0068E2;
        color: #fff;
      }
    }

    &.detail-footer {
      .dialog-btn:first-child {
        background: #f0f4ff;
        color: #0068E2;
      }
    }
  }
}
</style>
