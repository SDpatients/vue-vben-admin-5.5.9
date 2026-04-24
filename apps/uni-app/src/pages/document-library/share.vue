<template>
  <view class="share-container">
    <view class="share-card">
      <view class="doc-info">
        <text class="doc-icon">📄</text>
        <text class="doc-name">{{ documentName }}</text>
      </view>

      <view class="share-form">
        <view class="form-item">
          <text class="form-label">分享密码（可选）</text>
          <input
            v-model="shareForm.sharePassword"
            class="form-input"
            placeholder="不设置则无需密码"
            maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="form-label">权限类型</text>
          <picker mode="selector" :range="permissionOptions" :value="permissionIndex" @change="onPermissionChange">
            <view class="form-picker">
              <text class="picker-text">{{ permissionOptions[permissionIndex] }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">过期时间（可选）</text>
          <picker mode="date" :value="shareForm.expireTime" @change="onExpireChange">
            <view class="form-picker">
              <text :class="['picker-text', { placeholder: !shareForm.expireTime }]">
                {{ shareForm.expireTime || '请选择过期时间' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">最大访问次数</text>
          <input
            v-model="shareForm.maxAccessCount"
            class="form-input"
            placeholder="0表示无限制"
            type="number"
          />
        </view>
      </view>

      <button class="create-btn" @click="handleCreateShare">创建分享链接</button>
    </view>

    <!-- 分享结果 -->
    <view v-if="shareResult" class="result-card">
      <view class="result-title">分享链接已创建</view>
      <view class="share-url">
        <text class="url-text">{{ shareResult.shareUrl }}</text>
        <text class="copy-btn" @click="copyUrl">复制</text>
      </view>
      <view class="share-code">
        <text class="code-label">分享码：</text>
        <text class="code-text">{{ shareResult.shareCode }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createShare, type ShareItem } from '@/api/document-library'

const permissionOptions = ['查看', '编辑']
const permissionValues = ['READ', 'WRITE']

const documentId = ref<number>()
const documentName = ref('')
const permissionIndex = ref(0)
const shareResult = ref<ShareItem>()

const shareForm = ref({
  sharePassword: '',
  permissionType: 'READ',
  expireTime: '',
  maxAccessCount: 0,
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || currentPage.$route?.query || {}

  if (options.documentId) {
    documentId.value = Number(options.documentId)
    documentName.value = decodeURIComponent(options.documentName || '')
  }
})

const onPermissionChange = (e: any) => {
  permissionIndex.value = e.detail.value
  shareForm.value.permissionType = permissionValues[e.detail.value]
}

const onExpireChange = (e: any) => {
  shareForm.value.expireTime = e.detail.value + 'T23:59:59'
}

const handleCreateShare = async () => {
  if (!documentId.value) return

  uni.showLoading({ title: '创建中...' })
  try {
    const res = await createShare({
      documentId: documentId.value,
      sharePassword: shareForm.value.sharePassword || undefined,
      permissionType: shareForm.value.permissionType,
      expireTime: shareForm.value.expireTime || undefined,
      maxAccessCount: Number(shareForm.value.maxAccessCount) || 0,
    })

    if (res.code === 200) {
      shareResult.value = res.data
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '创建失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const copyUrl = () => {
  if (!shareResult.value?.shareUrl) return
  uni.setClipboardData({
    data: shareResult.value.shareUrl,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    },
  })
}
</script>

<style lang="scss" scoped>
.share-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24rpx;
}

.share-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .doc-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .doc-icon {
      font-size: 48rpx;
    }

    .doc-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .share-form {
    .form-item {
      margin-bottom: 24rpx;

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
      }

      .form-input {
        width: 100%;
        height: 72rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .form-picker {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 72rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        box-sizing: border-box;

        .picker-text {
          font-size: 28rpx;
          color: #333;

          &.placeholder {
            color: #999;
          }
        }

        .picker-arrow {
          font-size: 32rpx;
          color: #999;
        }
      }
    }
  }

  .create-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #1890ff;
    color: #fff;
    font-size: 32rpx;
    border-radius: 12rpx;
    margin-top: 16rpx;

    &:active {
      background: #40a9ff;
    }
  }
}

.result-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;

  .result-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .share-url {
    display: flex;
    align-items: center;
    gap: 16rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    padding: 16rpx 20rpx;
    margin-bottom: 16rpx;

    .url-text {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      font-size: 26rpx;
      color: #1890ff;
      flex-shrink: 0;
    }
  }

  .share-code {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .code-label {
      font-size: 28rpx;
      color: #666;
    }

    .code-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #1890ff;
      font-family: monospace;
    }
  }
}
</style>
