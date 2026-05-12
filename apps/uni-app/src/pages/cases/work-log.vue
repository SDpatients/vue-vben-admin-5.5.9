<template>
  <view class="work-log-container">
    <view class="header">
      <text class="title">工作日志</text>
      <text class="subtitle">案件编号：{{ caseNo }}</text>
    </view>

    <view class="content">
      <view class="filter-bar">
        <picker mode="selector" :range="workTypeOptions" range-key="label" @change="onWorkTypeChange">
          <view class="filter-picker">
            <text>{{ selectedWorkTypeName || '全部类型' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="loading-container" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty-state" v-else-if="!loading && logList.length === 0">
        <text class="empty-text">暂无工作日志</text>
      </view>

      <view class="log-list" v-else>
        <view class="log-item" v-for="(log, index) in logList" :key="log.id">
          <view class="log-timeline">
            <view class="timeline-dot"></view>
            <view class="timeline-line" v-if="index < logList.length - 1"></view>
          </view>
          <view class="log-content" @click="viewLogDetail(log)">
            <view class="log-header">
              <view class="log-title-row">
                <text class="log-title">{{ getWorkTypeText(log.workType) }} - {{ log.workContent ? log.workContent.substring(0, 20) + (log.workContent.length > 20 ? '...' : '') : '工作记录' }}</text>
                <text class="log-type">{{ formatWorkDate(log.workDate) }}</text>
              </view>
              <text class="log-date">{{ formatDate(log.createTime) }}</text>
            </view>
            <view class="log-body">
              <text class="log-text">{{ log.workContent || '-' }}</text>
            </view>
            <view class="log-footer">
              <text class="log-author">记录人：{{ log.creatorName || log.createUserName || '-' }}</text>
              <text class="log-result" v-if="log.workResult">结果：{{ log.workResult }}</text>
            </view>
          </view>
        </view>

        <view class="load-more" v-if="hasMore" @click="loadMore">
          <text>加载更多</text>
        </view>
      </view>
    </view>

    <view class="fab-btn" @click="showAddLogDialog">
      <text class="fab-icon">+</text>
    </view>

    <uni-popup ref="logDetailPopup" type="center">
      <view class="dialog-container detail-dialog">
        <view class="dialog-header">
          <text class="dialog-title">工作日志详情</text>
          <text class="dialog-close" @click="closeLogDetail">×</text>
        </view>
        <view class="dialog-content" v-if="currentLog">
          <view class="detail-item">
            <text class="detail-label">工作类型</text>
            <text class="detail-value">{{ getWorkTypeText(currentLog.workType) }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">工作日期</text>
            <text class="detail-value">{{ currentLog.workDate || '-' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">工作内容</text>
            <text class="detail-value">{{ currentLog.workContent || '-' }}</text>
          </view>
          <view class="detail-item" v-if="currentLog.workResult">
            <text class="detail-label">工作结果</text>
            <text class="detail-value">{{ currentLog.workResult }}</text>
          </view>
          <view class="detail-item" v-if="currentLog.remark">
            <text class="detail-label">备注</text>
            <text class="detail-value">{{ currentLog.remark }}</text>
          </view>
          <view class="detail-item" v-if="currentLog.attachmentIds">
            <text class="detail-label">附件</text>
            <view class="attachment-list">
              <view class="attachment-item" v-for="(file, index) in currentLogAttachments" :key="index">
                <text class="attachment-name">{{ file.fileName || file.originalFileName }}</text>
                <view class="attachment-actions">
                  <text class="attachment-btn" @click="viewAttachment(file)">查看</text>
                  <text class="attachment-btn" @click="downloadAttachment(file)">下载</text>
                </view>
              </view>
            </view>
          </view>
          <view class="detail-item">
            <text class="detail-label">记录人</text>
            <text class="detail-value">{{ currentLog.creatorName || currentLog.createUserName || '-' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">创建时间</text>
            <text class="detail-value">{{ formatDateTime(currentLog.createTime) }}</text>
          </view>
        </view>
        <view class="dialog-footer detail-footer">
          <button class="dialog-btn danger" @click="confirmDeleteLog">删除</button>
          <button class="dialog-btn confirm" @click="closeLogDetail">关闭</button>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="addLogPopup" type="center">
      <view class="dialog-container">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditingLog ? '编辑日志' : '添加日志' }}</text>
          <text class="dialog-close" @click="closeAddLogDialog">×</text>
        </view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="label">工作日期 <text class="required">*</text></text>
            <picker mode="date" :value="addLogForm.workDate" @change="onDateChange">
              <view class="picker-value">
                <text>{{ addLogForm.workDate || '请选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">工作类型 <text class="required">*</text></text>
            <picker mode="selector" :range="addWorkTypeOptions" range-key="label" @change="onAddWorkTypeChange">
              <view class="picker-value">
                <text>{{ selectedAddWorkTypeName }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">工作内容 <text class="required">*</text></text>
            <textarea class="textarea" v-model="addLogForm.workContent" placeholder="请输入工作内容" :maxlength="1000" />
          </view>
          <view class="form-item">
            <text class="label">工作结果</text>
            <textarea class="textarea" v-model="addLogForm.workResult" placeholder="请输入工作结果（选填）" :maxlength="500" />
          </view>
          <view class="form-item">
            <text class="label">备注</text>
            <textarea class="textarea" v-model="addLogForm.remark" placeholder="请输入备注（选填）" :maxlength="200" />
          </view>
          <view class="form-item">
            <text class="label">附件</text>
            <view class="file-upload-area">
              <view class="uploaded-files" v-if="uploadedFiles.length > 0">
                <view class="uploaded-file" v-for="(file, index) in uploadedFiles" :key="index">
                  <text class="file-name">{{ file.fileName || file.originalFileName }}</text>
                  <text class="file-remove" @click="removeUploadedFile(index)">×</text>
                </view>
              </view>
              <view class="upload-btn-small" @click="chooseFileForWorkLog">
                <text class="upload-icon">+</text>
                <text>添加附件</text>
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="closeAddLogDialog">取消</button>
          <button class="dialog-btn confirm" type="primary" @click="handleSaveLog" :loading="savingLog">
            保存
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import {
  getWorkLogListApi,
  getWorkLogDetailApi,
  createWorkLogApi,
  updateWorkLogApi,
  deleteWorkLogApi,
  workTypeMap,
} from '@/api/work-log'
import { getPageParam } from '@/utils/pageParam'
import { getCaseFileInfo, type FileItem } from '@/api/case'

import { getBaseUrl, API_PREFIX } from '@/config'

import { chooseFilePlatform } from '@/utils/chooseFile'

import type { WorkLogApi } from '@/api/work-log'

const loading = ref(false)
const caseId = ref('')
const caseNo = ref('')
const logList = ref<WorkLogApi.WorkLogInfo[]>([])
const selectedWorkType = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(false)
const savingLog = ref(false)
const uploadingFile = ref(false)
const isEditingLog = ref(false)
const currentLog = ref<WorkLogApi.WorkLogInfo | null>(null)
const currentLogAttachments = ref<any[]>([])
const uploadedFiles = ref<any[]>([])

const logDetailPopup = ref()
const addLogPopup = ref()

const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'

const workTypeOptions = computed(() => {
  return [
    { label: '全部类型', value: '' },
    ...Object.entries(workTypeMap).map(([value, label]) => ({ label, value })),
  ]
})

const addWorkTypeOptions = computed(() => {
  return Object.entries(workTypeMap).map(([value, label]) => ({ label, value }))
})

const selectedWorkTypeName = computed(() => {
  if (!selectedWorkType.value) return ''
  return workTypeMap[selectedWorkType.value as WorkLogApi.WorkType] || ''
})

const selectedAddWorkTypeName = computed(() => {
  if (!addLogForm.value.workType) return '请选择类型'
  return workTypeMap[addLogForm.value.workType] || '请选择类型'
})

const addLogForm = ref({
  workDate: dayjs().format('YYYY-MM-DD'),
  workType: 'CASE_INVESTIGATION' as WorkLogApi.WorkType,
  workContent: '',
  workResult: '',
  remark: '',
})

onMounted(() => {
  caseId.value = getPageParam('id')
  if (caseId.value) {
    loadData()
  }

  uni.$on('refresh-work-log-list', () => loadData())
})

onUnmounted(() => {
  uni.$off('refresh-work-log-list')
})

onShow(() => {
  if (caseId.value) {
    loadData()
  }
})

const loadData = async (reset = true) => {
  if (reset) {
    pageNum.value = 1
    logList.value = []
  }
  loading.value = true
  try {
    const res = await getWorkLogListApi({
      caseId: Number(caseId.value),
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      workType: selectedWorkType.value as any || undefined,
    })
    const newList = res.data.list || []
    if (reset) {
      logList.value = newList
    } else {
      logList.value = [...logList.value, ...newList]
    }
    total.value = res.data.total || 0
    hasMore.value = logList.value.length < total.value
    if (reset && newList.length > 0) {
      caseNo.value = String(newList[0].caseId || caseId.value)
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

const onWorkTypeChange = (e: any) => {
  const index = Number(e.detail.value)
  const option = workTypeOptions.value[index]
  if (option) {
    selectedWorkType.value = option.value
    loadData()
  }
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD HH:mm')
}

const formatWorkDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getWorkTypeText = (type?: string) => {
  if (!type) return '-'
  return workTypeMap[type as WorkLogApi.WorkType] || type
}

const viewLogDetail = async (log: WorkLogApi.WorkLogInfo) => {
  currentLog.value = log
  currentLogAttachments.value = []
  if (log.attachmentIds) {
    currentLogAttachments.value = await getAttachmentFiles(log.attachmentIds)
  }
  logDetailPopup.value?.open()
}

const closeLogDetail = () => {
  logDetailPopup.value?.close()
}

const showAddLogDialog = () => {
  isEditingLog.value = false
  currentLog.value = null
  addLogForm.value = {
    workDate: dayjs().format('YYYY-MM-DD'),
    workType: 'CASE_INVESTIGATION',
    workContent: '',
    workResult: '',
    remark: '',
  }
  addLogPopup.value?.open()
}

const closeAddLogDialog = () => {
  addLogPopup.value?.close()
}

const onDateChange = (e: any) => {
  addLogForm.value.workDate = e.detail.value
}

const onAddWorkTypeChange = (e: any) => {
  const index = Number(e.detail.value)
  const option = addWorkTypeOptions.value[index]
  if (option && option.value) {
    addLogForm.value.workType = option.value as WorkLogApi.WorkType
  }
}

const handleSaveLog = async () => {
  if (!addLogForm.value.workDate) {
    uni.showToast({ title: '请选择工作日期', icon: 'none' })
    return
  }
  if (!addLogForm.value.workType) {
    uni.showToast({ title: '请选择工作类型', icon: 'none' })
    return
  }
  if (!addLogForm.value.workContent) {
    uni.showToast({ title: '请输入工作内容', icon: 'none' })
    return
  }

  savingLog.value = true
  try {
    const attachmentIds = uploadedFiles.value.map(f => f.id).join(',')

    if (isEditingLog.value && currentLog.value) {
      await updateWorkLogApi(currentLog.value.id, {
        workDate: addLogForm.value.workDate,
        workType: addLogForm.value.workType,
        workContent: addLogForm.value.workContent,
        workResult: addLogForm.value.workResult || undefined,
        attachmentIds: attachmentIds || undefined,
        remark: addLogForm.value.remark || undefined,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createWorkLogApi({
        caseId: Number(caseId.value),
        workDate: addLogForm.value.workDate,
        workType: addLogForm.value.workType,
        workContent: addLogForm.value.workContent,
        workResult: addLogForm.value.workResult || undefined,
        attachmentIds: attachmentIds || undefined,
        remark: addLogForm.value.remark || undefined,
      })
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    uploadedFiles.value = []
    closeAddLogDialog()
    await loadData()
  } catch (error) {
    uni.showToast({ title: isEditingLog.value ? '更新失败' : '添加失败', icon: 'none' })
  } finally {
    savingLog.value = false
  }
}

const chooseFileForWorkLog = async () => {
  try {
    console.log('[work-log] 开始选择文件...')
    const files = await chooseFilePlatform({
      count: 10,
      extension: ['.doc', '.docx', '.pdf', '.jpg', '.png', '.txt', '.xls', '.xlsx'],
    })
    const filePaths = files.map((f) => f.path).filter(Boolean)
    console.log('[work-log] 文件选择成功, 文件数量:', filePaths.length, JSON.stringify(filePaths))
    if (filePaths.length > 0) {
      uploadFilesWorkLog(filePaths)
    }
  } catch (e) {
    console.error('[work-log] 选择文件失败:', e)
    uni.showToast({ title: '选择文件取消', icon: 'none' })
  }
}

const uploadFilesWorkLog = async (filePaths: string[]) => {
  uploadingFile.value = true
  uni.showLoading({ title: '上传中...' })

  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  const uploadUrl = `${baseUrl}${API_PREFIX}/file/upload`
  console.log('[work-log][upload] 开始上传, uploadUrl:', uploadUrl, '文件数量:', filePaths.length, 'token存在:', !!token)

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]
    console.log(`[work-log][upload] 正在上传第${i + 1}个文件:`, filePath)
    try {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        uni.uploadFile({
          url: uploadUrl,
          filePath: filePath,
          name: 'file',
          formData: {
            bizType: 'workLog',
            bizId: caseId.value,
          },
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            console.log(`[work-log][upload] 文件${i + 1}上传响应 statusCode:`, res.statusCode, 'data:', res.data?.substring(0, 200))
            resolve(res)
          },
          fail: (err) => {
            console.error(`[work-log][upload] 文件${i + 1}上传失败:`, JSON.stringify(err))
            reject(err)
          },
        })
      })

      const result = JSON.parse(uploadRes.data)
      console.log(`[work-log][upload] 文件${i + 1}解析结果:`, JSON.stringify(result))
      if (result.code === 200 || result.code === 0) {
        uploadedFiles.value.push(result.data)
        console.log(`[work-log][upload] 文件${i + 1}上传成功`)
      }
    } catch (error) {
      console.error(`[work-log][upload] 文件${i + 1}上传异常:`, error)
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  uni.hideLoading()
  uploadingFile.value = false
  uni.showToast({ title: '上传成功', icon: 'success' })
}

const removeUploadedFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const getAttachmentFiles = async (attachmentIds: string) => {
  if (!attachmentIds) return []
  const ids = attachmentIds.split(',').filter(Boolean)
  const files: any[] = []
  for (const id of ids) {
    try {
      const res = await getCaseFileInfo(Number(id))
      if (res.data) {
        files.push(res.data)
      }
    } catch (error) {
}
  }
  return files
}

const viewAttachment = (file: FileItem) => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  const ext = file.fileExtension?.toLowerCase() || ''
  const fileUrl = `${baseUrl}${API_PREFIX}/file/preview/${file.id}`

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    uni.showLoading({ title: '加载中...' })
    uni.downloadFile({
      url: fileUrl,
      header: { Authorization: `Bearer ${token}` },
      success: (downloadRes: UniApp.DownloadSuccessData) => {
        uni.hideLoading()
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
              fail: () => {},
            },
          })
        } else {
          uni.showToast({ title: '图片加载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({ title: '图片加载失败', icon: 'none' })
      },
    })
  } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    uni.showLoading({ title: '加载中...' })
    uni.downloadFile({
      url: fileUrl,
      header: { Authorization: `Bearer ${token}` },
      success: (downloadRes: UniApp.DownloadSuccessData) => {
        uni.hideLoading()
        if (downloadRes.statusCode === 200) {
          uni.openDocument({
            filePath: downloadRes.tempFilePath,
            showMenu: true,
            success: () => {},
            fail: () => {
              uni.showToast({ title: '无法打开文件，请下载后查看', icon: 'none' })
            },
          })
        } else {
          uni.showToast({ title: '文件加载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({ title: '文件加载失败', icon: 'none' })
      },
    })
  } else {
    uni.showToast({ title: '暂不支持预览此类型文件', icon: 'none' })
  }
}

const downloadAttachment = (file: FileItem) => {
  const baseUrl = getBaseUrl()
  const token = uni.getStorageSync('token')
  const fileUrl = `${baseUrl}${API_PREFIX}/file/download/${file.id}`

  uni.showModal({
    title: '确认下载',
    content: `确定要下载 ${file.originalFileName || file.fileName} 吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        uni.showLoading({ title: '下载中...' })
        uni.downloadFile({
          url: fileUrl,
          header: { Authorization: `Bearer ${token}` },
          success: (downloadRes: UniApp.DownloadSuccessData) => {
            uni.hideLoading()
            if (downloadRes.statusCode === 200) {
              if (isH5 && typeof document !== 'undefined') {
                const link = document.createElement('a')
                link.href = downloadRes.tempFilePath
                link.download = file.originalFileName || file.fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                uni.showToast({ title: '下载成功', icon: 'success' })
              } else {
                uni.showModal({
                  title: '下载完成',
                  content: '文件已准备就绪，是否立即打开？',
                  success: (openRes) => {
                    if (openRes.confirm) {
                      uni.openDocument({
                        filePath: downloadRes.tempFilePath,
                        showMenu: true,
                        success: () => {},
                        fail: () => {
                          uni.showToast({ title: '无法打开文件', icon: 'none' })
                        },
                      })
                    } else {
                      uni.showToast({ title: '文件已保存', icon: 'success' })
                    }
                  },
                })
              }
            } else {
              uni.showToast({ title: '下载失败', icon: 'none' })
            }
          },
          fail: () => {
            uni.hideLoading()
            uni.showToast({ title: '下载失败', icon: 'none' })
          },
        })
      }
    },
  })
}

const confirmDeleteLog = () => {
  if (!currentLog.value) return
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条工作日志吗？',
    success: async (res) => {
      if (res.confirm) {
        await handleDeleteLog(currentLog.value!)
      }
    }
  })
}

const handleDeleteLog = async (log: WorkLogApi.WorkLogInfo) => {
  try {
    await deleteWorkLogApi(log.id)
    uni.showToast({ title: '删除成功', icon: 'success' })
    closeLogDetail()
    await loadData()
  } catch (error) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.work-log-container {
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

.filter-bar {
  margin-bottom: 20rpx;

  .filter-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #fff;
    border-radius: 12rpx;

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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.log-list {
  .log-item {
    display: flex;
    margin-bottom: 20rpx;

    .log-timeline {
      width: 60rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 20rpx;

      .timeline-dot {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        background: #0068E2;
        border: 4rpx solid #fff;
        box-shadow: 0 2rpx 8rpx rgba(0, 104, 226, 0.4);
      }

      .timeline-line {
        width: 2rpx;
        flex: 1;
        background: #e0e0e0;
        margin: 8rpx 0;
      }
    }

    .log-content {
      flex: 1;
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-left: 10rpx;

      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;

        .log-title-row {
          flex: 1;
          display: flex;
          align-items: center;

          .log-title {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
            margin-right: 16rpx;
          }

          .log-type {
            font-size: 22rpx;
            color: #0068E2;
            background: rgba(0, 104, 226, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
          }
        }

        .log-date {
          font-size: 24rpx;
          color: #999;
          white-space: nowrap;
        }
      }

      .log-body {
        margin-bottom: 16rpx;

        .log-text {
          font-size: 28rpx;
          color: #666;
          line-height: 1.6;
        }
      }

      .log-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .log-author {
          font-size: 24rpx;
          color: #0068E2;
        }

        .log-result {
          font-size: 24rpx;
          color: #52c41a;
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

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
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
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  &.detail-dialog {
    width: 650rpx;
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

  .dialog-content {
    padding: 30rpx;
    max-height: 60vh;
    overflow-y: auto;

    .form-item {
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
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 120rpx;
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

      .file-upload-area {
        .uploaded-files {
          margin-bottom: 16rpx;

          .uploaded-file {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16rpx;
            background: #f5f7fa;
            border-radius: 8rpx;
            margin-bottom: 8rpx;

            .file-name {
              font-size: 26rpx;
              color: #333;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 16rpx;
            }

            .file-remove {
              font-size: 36rpx;
              color: #ff4d4f;
              padding: 0 8rpx;

              &:active {
                opacity: 0.7;
              }
            }
          }
        }

        .upload-btn-small {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8rpx;
          padding: 20rpx;
          border: 2rpx dashed #d9d9d9;
          border-radius: 8rpx;
          background: #fafafa;
          color: #666;
          font-size: 26rpx;

          &:active {
            border-color: #0068E2;
            color: #0068E2;
          }

          .upload-icon {
            font-size: 32rpx;
            font-weight: bold;
          }
        }
      }
    }

    .detail-item {
      margin-bottom: 24rpx;

      .detail-label {
        font-size: 26rpx;
        color: #999;
        display: block;
        margin-bottom: 8rpx;
      }

      .detail-value {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }

      .attachment-list {
        .attachment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16rpx 0;
          border-bottom: 1rpx solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .attachment-name {
            font-size: 26rpx;
            color: #333;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 16rpx;
          }

          .attachment-actions {
            display: flex;
            gap: 16rpx;

            .attachment-btn {
              font-size: 24rpx;
              color: #0068E2;
              padding: 4rpx 12rpx;
              background: #f0f4ff;
              border-radius: 8rpx;

              &:active {
                opacity: 0.7;
              }
            }
          }
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

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #0068E2;
        color: #fff;
      }

      &.danger {
        background: #ff4d4f;
        color: #fff;
      }
    }

    &.detail-footer {
      .dialog-btn:first-child {
        flex: 1;
      }

      .dialog-btn:last-child {
        flex: 2;
      }
    }
  }
}
</style>
