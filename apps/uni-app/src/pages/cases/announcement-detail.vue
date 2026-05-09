<template>
  <view class="announcement-detail-container" v-if="announcement">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">公告详情</text>
        <view class="nav-right" @click="showActionSheet = true">
          <text class="more-icon">⋯</text>
        </view>
      </view>
    </view>

    <!-- 公告头部信息 -->
    <view class="announcement-header">
      <view class="header-tags">
        <view
          class="type-tag"
          :style="{
            background: getAnnouncementTypeColor(announcement.announcementType) + '20',
            color: getAnnouncementTypeColor(announcement.announcementType),
          }"
        >
          <text>{{ getAnnouncementTypeText(announcement.announcementType) }}</text>
        </view>
        <view
          class="status-tag"
          :style="{
            background: getAnnouncementStatusColor(announcement.status) + '20',
            color: getAnnouncementStatusColor(announcement.status),
          }"
        >
          <text>{{ getAnnouncementStatusText(announcement.status) }}</text>
        </view>
        <view v-if="announcement.isTop" class="top-tag">
          <text>置顶</text>
        </view>
      </view>

      <view class="announcement-title">
        <text>{{ announcement.title }}</text>
      </view>

      <view class="announcement-meta">
        <view class="meta-item">
          <text class="meta-label">发布人：</text>
          <text class="meta-value">{{ announcement.publisherName || '-' }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">发布时间：</text>
          <text class="meta-value">{{ formatDateTime(announcement.publishTime) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">查看次数：</text>
          <text class="meta-value">{{ announcement.viewCount || 0 }} 次</text>
        </view>
      </view>
    </view>

    <!-- 公告内容 -->
    <view class="content-section">
      <view class="section-title">
        <text>公告内容</text>
      </view>
      <view class="content-body">
        <rich-text class="content-rich" :nodes="announcement.content"></rich-text>
      </view>
    </view>

    <!-- 案件信息 -->
    <view class="case-section" v-if="announcement.caseNumber">
      <view class="section-title">
        <text>关联案件</text>
      </view>
      <view class="case-info">
        <view class="info-row">
          <text class="info-label">案件编号</text>
          <text class="info-value">{{ announcement.caseNumber }}</text>
        </view>
        <view class="info-row" v-if="announcement.principalOfficer">
          <text class="info-label">负责人</text>
          <text class="info-value">{{ announcement.principalOfficer }}</text>
        </view>
      </view>
    </view>

    <!-- 附件列表 -->
    <view class="attachment-section" v-if="attachments.length > 0">
      <view class="section-title">
        <text>附件 ({{ attachments.length }})</text>
      </view>
      
      <!-- 图片附件网格显示 -->
      <view class="image-grid" v-if="imageAttachments.length > 0">
        <view
          v-for="(file, index) in imageAttachments"
          :key="`img_${file.id || index}`"
          class="image-item"
          @click="handlePreviewFile(file)"
        >
          <image
            :src="getImagePreviewUrl(file) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS4je+8jOWkh+ato+aXtu+8jTwvdGV4dD48L3N2Zz4='"
            mode="aspectFill"
            class="image-preview"
            :lazy-load="true"
            @error="handleImageError(file.id, $event)"
            @load="handleImageLoad(file.id)"
          />
        </view>
      </view>
      
      <!-- 非图片附件列表显示 -->
      <view class="attachment-list" v-if="nonImageAttachments.length > 0">
        <view
          v-for="(file, index) in nonImageAttachments"
          :key="`file_${file.id || index}`"
          class="attachment-item"
        >
          <view class="file-icon">
            <text class="file-ext">{{ file.fileExtension?.toUpperCase() || 'FILE' }}</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{ file.originalFileName || '未知文件' }}</text>
            <text class="file-size">{{ formatFileSize(file.fileSize) }}</text>
          </view>
          <view class="file-actions">
            <view class="action-btn view" @click="handlePreviewFile(file)">
              <text class="action-text">查看</text>
            </view>
            <view class="action-btn download" @click="handleDownloadFile(file)">
              <text class="action-text">下载</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="back-btn" @click="handleBack">
        <text>返回</text>
      </view>
    </view>

    <!-- 操作菜单 -->
    <u-action-sheet
      :show="showActionSheet"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      @close="showActionSheet = false"
    ></u-action-sheet>
  </view>

  <!-- 加载状态 -->
  <view class="loading-container" v-else-if="loading">
    <u-loading-page loading loading-text="加载中..."></u-loading-page>
  </view>

  <!-- 错误状态 -->
  <view class="error-container" v-else>
    <u-empty mode="message" text="加载失败">
      <template #desc>
        <text class="error-desc">公告加载失败，请检查网络后重试</text>
      </template>
    </u-empty>
    <view class="retry-btn" @click="loadDetail">
      <text>重新加载</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getAnnouncementDetail,
  getAnnouncementAttachments,
  createViewRecord,
  deleteAnnouncement,
  publishAnnouncement,
  topAnnouncement,
  cancelTopAnnouncement,
  type Announcement,
  type AnnouncementAttachment,
  getAnnouncementTypeText,
  getAnnouncementTypeColor,
  getAnnouncementStatusText,
  getAnnouncementStatusColor,
  formatFileSize,
} from '@/api/announcement'
import { getPageParam } from '@/utils/pageParam'
import { getBaseUrl } from '@/config'

import dayjs from 'dayjs'

const announcement = ref<Announcement | null>(null)
const attachments = ref<AnnouncementAttachment[]>([])
const loading = ref(false)
const announcementId = ref('')
const caseId = ref('')
const showActionSheet = ref(false)
const imageUrls = ref<Record<number, string>>({})

const getCacheKey = (id: string) => `announcement_detail_${id}`

// 图片附件
const imageAttachments = computed(() => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const result = attachments.value.filter(f => {
    const ext = f.fileExtension?.toLowerCase()
    return ext && imageExts.includes(ext)
  })
  return result
})

// 非图片附件
const nonImageAttachments = computed(() => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const result = attachments.value.filter(f => {
    const ext = f.fileExtension?.toLowerCase()
    return !ext || !imageExts.includes(ext)
  })
  return result
})

const actionSheetActions = computed(() => {
  const actions: any[] = []
  if (announcement.value?.status === 'DRAFT') {
    actions.push({ name: '发布公告', color: '#0068E2' })
  }
  if (announcement.value?.isTop) {
    actions.push({ name: '取消置顶' })
  } else {
    actions.push({ name: '置顶公告', color: '#ff4d4f' })
  }
  actions.push({ name: '删除公告', color: '#ff4d4f' })
  actions.push({ name: '取消' })
  return actions
})

onMounted(() => {
  announcementId.value = getPageParam('announcementId')
  caseId.value = getPageParam('caseId') || ''

  if (announcementId.value) {
    loadDetail()
  } else {
    uni.showToast({ title: '公告ID不能为空', icon: 'none' })
  }
})

const loadDetail = async () => {
  loading.value = true
  try {
    const [detailRes, attachmentRes] = await Promise.all([
      getAnnouncementDetail(Number(announcementId.value)),
      getAnnouncementAttachments(Number(announcementId.value)).catch(() => null),
    ])

    if (detailRes.code === 200 && detailRes.data) {
      announcement.value = detailRes.data
      uni.setStorageSync(getCacheKey(announcementId.value), {
        data: detailRes.data,
        timestamp: Date.now(),
      })
      recordView()
    } else {
      loadFromCache()
    }

    let attachmentList: AnnouncementAttachment[] = []
    
    if (attachmentRes && attachmentRes.code === 200 && Array.isArray(attachmentRes.data) && attachmentRes.data.length > 0) {
      attachmentList = attachmentRes.data
    }
    
    if (attachmentList.length === 0 && announcement.value?.attachments) {
      try {
        const parsed = typeof announcement.value.attachments === 'string' 
          ? JSON.parse(announcement.value.attachments)
          : announcement.value.attachments
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          const fileDetails: AnnouncementAttachment[] = []
          for (const fileId of parsed) {
            try {
              const baseUrl = getBaseUrl()
              const token = uni.getStorageSync('token')
              const fileInfo = await new Promise<any>((resolve, reject) => {
                uni.request({
                  url: `${baseUrl}/api/v1/file/${fileId}`,
                  header: {
                    Authorization: `Bearer ${token}`,
                  },
                  success: (res) => {
                    resolve(res.data)
                  },
                  fail: (err) => {
                    reject(err)
                  },
                })
              })
              if (fileInfo.code === 200 && fileInfo.data) {
                fileDetails.push(fileInfo.data)
              }
            } catch (_e) {
            }
          }
          attachmentList = fileDetails
        }
      } catch (_e) {
      }
    }
    
    attachments.value = attachmentList
    
    if (attachmentList.length > 0) {
      await loadImageUrls(attachmentList)
    }
  } catch (_error) {
    loadFromCache()
  } finally {
    loading.value = false
  }
}

// 下载图片附件（使用 uni.downloadFile 携带 Authorization 请求头）
const loadImageUrls = async (files: AnnouncementAttachment[]) => {
  const token = uni.getStorageSync('token')
  const baseUrl = getBaseUrl()
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const imageFiles = files.filter(f => {
    const ext = f.fileExtension?.toLowerCase()
    return ext && imageExts.includes(ext)
  })
  
  for (const file of imageFiles) {
    if (!file.id) continue
    
    try {
      const previewUrl = `${baseUrl}/api/v1/file/preview/${file.id}`
      
      const downloadRes = await new Promise<UniApp.DownloadSuccessCallbackResult>((resolve, reject) => {
        uni.downloadFile({
          url: previewUrl,
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            resolve(res)
          },
          fail: (err) => {
            reject(err)
          },
        })
      })
      
      if (downloadRes.statusCode === 200) {
        imageUrls.value[file.id] = downloadRes.tempFilePath
      }
    } catch (_error) {
    }
  }
}

const loadFromCache = () => {
  try {
    const cache = uni.getStorageSync(getCacheKey(announcementId.value))
    if (cache && cache.data && Date.now() - cache.timestamp < 10 * 60 * 1000) {
      announcement.value = cache.data
      uni.showToast({ title: '已加载缓存数据', icon: 'none' })
    }
  } catch (e) {
}
}

const recordView = async () => {
  try {
    const userInfo = uni.getStorageSync('userInfo')
    await createViewRecord({
      announcementId: Number(announcementId.value),
      announcementTitle: announcement.value?.title,
      caseId: caseId.value ? Number(caseId.value) : undefined,
      viewerId: userInfo?.id,
      viewerName: userInfo?.realName,
      viewerType: userInfo?.userType,
      deviceType: 'MOBILE',
    })
  } catch (error) {
}
}

const handleActionSelect = (e: any) => {
  const action = e.name
  switch (action) {
    case '发布公告':
      handlePublish()
      break
    case '置顶公告':
      handleTop()
      break
    case '取消置顶':
      handleCancelTop()
      break
    case '删除公告':
      handleDelete()
      break
  }
  showActionSheet.value = false
}

const handlePublish = () => {
  uni.showModal({
    title: '确认发布',
    content: '发布后将无法修改，是否继续？',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await publishAnnouncement(Number(announcementId.value))
          if (result.code === 200) {
            uni.showToast({ title: '发布成功', icon: 'success' })
            loadDetail()
          }
        } catch (error) {
          uni.showToast({ title: '发布失败', icon: 'none' })
        }
      }
    },
  })
}

const handleTop = async () => {
  try {
    const result = await topAnnouncement(Number(announcementId.value))
    if (result.code === 200) {
      uni.showToast({ title: '置顶成功', icon: 'success' })
      loadDetail()
    }
  } catch (error) {
    uni.showToast({ title: '置顶失败', icon: 'none' })
  }
}

const handleCancelTop = async () => {
  try {
    const result = await cancelTopAnnouncement(Number(announcementId.value))
    if (result.code === 200) {
      uni.showToast({ title: '已取消置顶', icon: 'success' })
      loadDetail()
    }
  } catch (error) {
    uni.showToast({ title: '取消置顶失败', icon: 'none' })
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否继续？',
    confirmColor: '#ff4d4f',
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        try {
          const result = await deleteAnnouncement(Number(announcementId.value))
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            uni.$emit('refresh-announcement-list', caseId.value)
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const handleBack = () => {
  uni.navigateBack()
}

// 获取图片预览URL（使用下载后的本地临时路径）
const getImagePreviewUrl = (file: AnnouncementAttachment): string => {
  if (!file.id) {
    return ''
  }
  
  const localUrl = imageUrls.value[file.id]
  if (localUrl) {
    return localUrl
  }
  
  return ''
}

const handleImageLoad = (_fileId: number) => {
}

const handleImageError = (_fileId: number, _e: any) => {
}

// 下载文件
const handleDownloadFile = async (file: AnnouncementAttachment) => {
  if (!file.id && !file.filePath) {
    uni.showToast({ title: '文件信息不存在', icon: 'none' })
    return
  }

  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')

  // 构建下载URL：优先使用fileId，其次使用filePath
  let downloadUrl = ''
  if (file.id) {
    downloadUrl = `${baseUrl}/api/v1/file/download/${file.id}`
  } else if (file.filePath) {
    const encodedFilePath = encodeURIComponent(file.filePath)
    downloadUrl = `${baseUrl}/api/v1/file/download-by-path?filePath=${encodedFilePath}`
  }

  if (!downloadUrl) {
    uni.showToast({ title: '下载链接无效', icon: 'none' })
    return
  }

  uni.showLoading({ title: '下载中...', mask: true })

  try {
    const downloadRes = await new Promise<UniApp.DownloadSuccessCallbackResult>((resolve, reject) => {
      uni.downloadFile({
        url: downloadUrl,
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        },
      })
    })

    if (downloadRes.statusCode === 200) {
      const tempFilePath = downloadRes.tempFilePath
      const fileName = file.originalFileName || `文件_${Date.now()}`

      // #ifdef H5
      // H5端：创建a标签触发下载
      const link = document.createElement('a')
      link.href = tempFilePath
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      uni.showToast({ title: '下载成功', icon: 'success' })
      // #endif

      // #ifndef H5
      // 非H5端（小程序、APP）：保存到本地
      const fileExt = file.fileExtension?.toLowerCase() || ''
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

      if (imageExts.includes(fileExt)) {
        // 图片文件保存到相册
        uni.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            uni.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: (err: any) => {
            if (err.errMsg?.includes('auth deny')) {
              uni.showModal({
                title: '提示',
                content: '需要您授权保存图片到相册',
                confirmText: '去授权',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    uni.openSetting({
                      success: (settingRes: any) => {
                        if (settingRes.authSetting['scope.writePhotosAlbum']) {
                          uni.saveImageToPhotosAlbum({
                            filePath: tempFilePath,
                            success: () => {
                              uni.showToast({ title: '已保存到相册', icon: 'success' })
                            },
                            fail: () => {
                              uni.showToast({ title: '保存失败', icon: 'none' })
                            },
                          })
                        }
                      },
                    })
                  }
                },
              })
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          },
        })
      } else {
        // 非图片文件：使用 uni.openDocument 打开，用户可自行保存
        uni.openDocument({
          filePath: tempFilePath,
          showMenu: true,
          fileType: fileExt as any,
          success: () => {
            uni.showToast({ title: '文件已打开，可点击右上角保存', icon: 'none' })
          },
          fail: (err: any) => {
            uni.showToast({ title: '文件打开失败', icon: 'none' })
          },
        })
      }
      // #endif
    } else {
      uni.showToast({ title: '文件下载失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '下载失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const handlePreviewFile = (file: AnnouncementAttachment) => {
  if (!file.filePath) {
    uni.showToast({ title: '文件路径不存在', icon: 'none' })
    return
  }
  
  const baseUrl = getBaseUrl()
  const encodedFilePath = encodeURIComponent(file.filePath)
  
  const token = uni.getStorageSync('token')
  const ext = file.fileExtension?.toLowerCase() || ''
  
  const fileUrl = `${baseUrl}/api/v1/file/preview-by-path?filePath=${encodedFilePath}`
  
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    uni.downloadFile({
      url: fileUrl,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: UniApp.DownloadSuccessData) => {
        if (res.statusCode === 200) {
          uni.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
},
            fail: (err: any) => {
uni.showToast({ title: '无法打开文件', icon: 'none' })
            },
          })
        } else {
          uni.showToast({ title: '文件下载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '文件下载失败', icon: 'none' })
      },
    })
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    uni.downloadFile({
      url: fileUrl,
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (downloadRes: UniApp.DownloadSuccessData) => {
        if (downloadRes.statusCode === 200) {
          const tempFilePath = downloadRes.tempFilePath
          uni.previewImage({
            urls: [tempFilePath],
            current: tempFilePath,
            longPressActions: {
              itemList: ['保存图片到相册'],
              success: (data: any) => {
                if (data.tapIndex === 0) {
                  uni.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: () => {
                      uni.showToast({ title: '保存成功', icon: 'success' })
                    },
                    fail: (err: any) => {
if (err.errMsg?.includes('auth deny')) {
                        uni.showModal({
                          title: '提示',
                          content: '需要您授权保存图片到相册',
                          confirmText: '去授权',
                          success: (modalRes) => {
                            if (modalRes.confirm) {
                              uni.openSetting({
                                success: (settingRes: any) => {
                                  if (settingRes.authSetting['scope.writePhotosAlbum']) {
                                    uni.saveImageToPhotosAlbum({
                                      filePath: tempFilePath,
                                      success: () => {
                                        uni.showToast({ title: '保存成功', icon: 'success' })
                                      },
                                      fail: () => {
                                        uni.showToast({ title: '保存失败', icon: 'none' })
                                      },
                                    })
                                  }
                                },
                              })
                            }
                          },
                        })
                      } else {
                        uni.showToast({ title: '保存失败', icon: 'none' })
                      }
                    },
                  })
                }
              },
              fail: (err: any) => {
},
            },
          })
        } else {
          uni.showToast({ title: '图片加载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '图片下载失败', icon: 'none' })
      },
    })
  } else {
    uni.showToast({ title: '不支持的文件类型', icon: 'none' })
  }
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.announcement-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.custom-nav {
  background: #0068E2;
  padding-top: var(--status-bar-height, 44rpx);

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;

    .nav-back {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .back-icon {
        font-size: 48rpx;
        color: #fff;
        font-weight: bold;
      }
    }

    .nav-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      flex: 1;
      text-align: center;
    }

    .nav-right {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .more-icon {
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.announcement-header {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .header-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;
    flex-wrap: wrap;

    .type-tag,
    .status-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-weight: 500;
    }

    .top-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      background: #ff4d4f;
      color: #fff;
      font-weight: 500;
    }
  }

  .announcement-title {
    margin-bottom: 24rpx;

    text {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
    }
  }

  .announcement-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .meta-item {
      display: flex;
      align-items: center;

      .meta-label {
        font-size: 24rpx;
        color: #999;
      }

      .meta-value {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.content-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .content-body {
    .content-text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .content-rich {
      font-size: 30rpx;
      color: #333;
      line-height: 1.8;
      word-break: break-all;
    }
  }
}

.case-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .case-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 28rpx;
        color: #999;
      }

      .info-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.attachment-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #0068E2;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-bottom: 20rpx;

    .image-item {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12rpx;
      overflow: hidden;
      background: #f5f5f5;

      .image-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }

  .attachment-list {
    .attachment-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      &:active {
        background: #e6f2ff;
      }

      .file-icon {
        width: 80rpx;
        height: 80rpx;
        background: #0068E2;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .file-ext {
          font-size: 20rpx;
          color: #fff;
          font-weight: bold;
        }
      }

      .file-info {
        flex: 1;
        margin-left: 20rpx;
        min-width: 0;

        .file-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-top: 4rpx;
        }
      }

      .file-actions {
        display: flex;
        flex-shrink: 0;
        margin-left: 16rpx;
        gap: 12rpx;

        .action-btn {
          padding: 8rpx 20rpx;
          border-radius: 8rpx;

          &.view {
            border: 1rpx solid #0068E2;

            .action-text {
              color: #0068E2;
            }
          }

          &.download {
            background: #0068E2;
            border: 1rpx solid #0068E2;

            .action-text {
              color: #fff;
            }
          }

          &:active {
            opacity: 0.7;
          }

          .action-text {
            font-size: 26rpx;
          }
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;

  .back-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 30rpx;
    font-weight: 500;
    background: #f5f7fa;
    color: #333;
    border: 1rpx solid #e8e8e8;

    &:active {
      background: #e8e8e8;
    }
  }

  .edit-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 30rpx;
    font-weight: 500;
    background: #0068E2;
    color: #fff;

    &:active {
      opacity: 0.8;
    }
  }
}

.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .error-desc {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }

  .retry-btn {
    margin-top: 40rpx;
    padding: 16rpx 48rpx;
    background: #0068E2;
    border-radius: 8rpx;

    text {
      font-size: 28rpx;
      color: #fff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
