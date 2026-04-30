<template>
  <view class="statistics-container">
    <z-paging
      ref="pagingRef"
      :refresher-enabled="true"
      :loading-more-enabled="false"
      @onRefresh="onRefresh"
    >
      <view class="content-wrapper">
        <view class="stats-overview">
          <view class="stat-card blue">
            <view class="stat-icon">
              <text class="iconfont">📄</text>
            </view>
            <view class="stat-info">
              <text class="stat-num">{{ stats.totalDocuments }}</text>
              <text class="stat-label">文档总数</text>
            </view>
          </view>
          <view class="stat-card green">
            <view class="stat-icon">
              <text class="iconfont">💾</text>
            </view>
            <view class="stat-info">
              <text class="stat-num">{{ formatFileSize(stats.totalSize) }}</text>
              <text class="stat-label">总大小</text>
            </view>
          </view>
          <view class="stat-card orange">
            <view class="stat-icon">
              <text class="iconfont">📤</text>
            </view>
            <view class="stat-info">
              <text class="stat-num">{{ stats.weeklyUploads }}</text>
              <text class="stat-label">本周上传</text>
            </view>
          </view>
          <view class="stat-card purple">
            <view class="stat-icon">
              <text class="iconfont">👁️</text>
            </view>
            <view class="stat-info">
              <text class="stat-num">{{ stats.totalViews }}</text>
              <text class="stat-label">总浏览</text>
            </view>
          </view>
        </view>

        <view class="chart-section">
          <view class="section-header">
            <view class="section-title">
              <text class="title-icon">📊</text>
              <text>文档类型分布</text>
            </view>
          </view>
          <view v-if="hasTypeDistribution" class="type-list">
            <view
              v-for="(count, type) in stats.typeDistribution"
              :key="type"
              class="type-item"
            >
              <view class="type-header">
                <view class="type-left">
                  <text class="type-icon">{{ getDocumentTypeIcon(type) }}</text>
                  <text class="type-name">{{ getDocumentTypeName(type) }}</text>
                </view>
                <view class="type-right">
                  <text class="type-count">{{ count }}</text>
                  <text class="type-unit">个</text>
                  <text class="type-percent">{{ getTypePercentage(count) }}%</text>
                </view>
              </view>
              <view class="type-bar">
                <view
                  class="type-bar-fill"
                  :style="{ width: getTypePercentage(count) + '%', backgroundColor: getDocumentTypeColor(type) }"
                ></view>
              </view>
            </view>
          </view>
          <view v-else class="empty-state">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无文档类型数据</text>
          </view>
        </view>

        <view class="chart-section">
          <view class="section-header">
            <view class="section-title">
              <text class="title-icon">📁</text>
              <text>文档大小分布</text>
            </view>
          </view>
          <view v-if="hasSizeDistribution" class="size-list">
            <view
              v-for="(size, type) in stats.sizeDistribution"
              :key="type"
              class="size-item"
            >
              <view class="size-left">
                <text class="size-icon">{{ getDocumentTypeIcon(type) }}</text>
                <text class="size-name">{{ getDocumentTypeName(type) }}</text>
              </view>
              <view class="size-right">
                <text class="size-value">{{ formatFileSize(size) }}</text>
                <view class="size-bar">
                  <view
                    class="size-bar-fill"
                    :style="{ width: getSizePercentage(size) + '%', backgroundColor: getDocumentTypeColor(type) }"
                  ></view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="empty-state">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无大小分布数据</text>
          </view>
        </view>

        <view class="chart-section">
          <view class="section-header">
            <view class="section-title">
              <text class="title-icon">📈</text>
              <text>月度趋势</text>
            </view>
          </view>
          <view v-if="hasMonthlyTrend" class="trend-list">
            <view
              v-for="item in stats.monthlyTrend"
              :key="item.month"
              class="trend-item"
            >
              <view class="trend-header">
                <text class="trend-month">{{ formatMonth(item.month) }}</text>
              </view>
              <view class="trend-content">
                <view class="trend-row">
                  <view class="trend-label upload">
                    <text class="label-icon">📤</text>
                    <text>上传</text>
                  </view>
                  <view class="trend-bar-wrapper">
                    <view class="trend-bar">
                      <view
                        class="trend-bar-fill upload"
                        :style="{ width: getTrendPercentage(item.uploads, 'uploads') + '%' }"
                      ></view>
                    </view>
                  </view>
                  <text class="trend-value">{{ item.uploads }}</text>
                </view>
                <view class="trend-row">
                  <view class="trend-label view">
                    <text class="label-icon">👁️</text>
                    <text>浏览</text>
                  </view>
                  <view class="trend-bar-wrapper">
                    <view class="trend-bar">
                      <view
                        class="trend-bar-fill view"
                        :style="{ width: getTrendPercentage(item.views, 'views') + '%' }"
                      ></view>
                    </view>
                  </view>
                  <text class="trend-value">{{ item.views }}</text>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="empty-state">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无趋势数据</text>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getDashboardStats, type DashboardStats } from '@/api/document-library'

const pagingRef = ref()

const documentTypeMap: Record<string, string> = {
  WORD: 'Word文档',
  EXCEL: 'Excel表格',
  PDF: 'PDF文档',
  PPT: 'PPT演示',
  IMAGE: '图片文件',
  VIDEO: '视频文件',
  AUDIO: '音频文件',
  OTHER: '其他文件',
  CONTRACT: '合同文件',
  REPORT: '报告文件',
  LEGAL: '法律文件',
  FINANCIAL: '财务文件',
}

const stats = ref<DashboardStats>({
  totalDocuments: 0,
  totalSize: 0,
  weeklyUploads: 0,
  totalViews: 0,
  typeDistribution: {},
  sizeDistribution: {},
  monthlyTrend: [],
})

const maxUploads = ref(0)
const maxViews = ref(0)

const hasTypeDistribution = computed(() => {
  return Object.keys(stats.value.typeDistribution).length > 0
})

const hasSizeDistribution = computed(() => {
  return Object.keys(stats.value.sizeDistribution).length > 0
})

const hasMonthlyTrend = computed(() => {
  return stats.value.monthlyTrend && stats.value.monthlyTrend.length > 0
})

onMounted(() => {
  loadStats()
})

const loadStats = async () => {
  try {
    const res = await getDashboardStats()
    if (res.code === 200) {
      stats.value = res.data

      if (res.data.monthlyTrend && res.data.monthlyTrend.length > 0) {
        maxUploads.value = Math.max(...res.data.monthlyTrend.map((item) => item.uploads))
        maxViews.value = Math.max(...res.data.monthlyTrend.map((item) => item.views))
      }
    }
  } catch (error) {
}
}

const onRefresh = async () => {
  try {
    await loadStats()
  } finally {
    pagingRef.value?.completeRefresh()
  }
}

const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(1)} ${units[index]}`
}

const formatMonth = (month: string) => {
  if (!month) return ''
  const parts = month.split('-')
  if (parts.length >= 2) {
    return `${parts[0]}年${parts[1]}月`
  }
  return month
}

const getDocumentTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    WORD: '📘',
    EXCEL: '📗',
    PDF: '📕',
    PPT: '📙',
    IMAGE: '🖼️',
    VIDEO: '🎬',
    AUDIO: '🎵',
    OTHER: '📄',
  }
  return iconMap[type] || '📄'
}

const getDocumentTypeName = (type: string) => {
  return documentTypeMap[type] || type
}

const getDocumentTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    WORD: '#2b579a',
    EXCEL: '#217346',
    PDF: '#f40f02',
    PPT: '#d24726',
    IMAGE: '#ff9800',
    VIDEO: '#9c27b0',
    AUDIO: '#00bcd4',
    OTHER: '#666666',
  }
  return colorMap[type] || '#999'
}

const getTypePercentage = (count: number) => {
  const total = Object.values(stats.value.typeDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

const getSizePercentage = (size: number) => {
  const total = Object.values(stats.value.sizeDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return 0
  return Math.round((size / total) * 100)
}

const getTrendPercentage = (value: number, type: 'uploads' | 'views') => {
  const max = type === 'uploads' ? maxUploads.value : maxViews.value
  if (max === 0) return 0
  return Math.round((value / max) * 100)
}
</script>

<style lang="scss" scoped>
.statistics-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f5ff 0%, #f5f7fa 100%);
}

.content-wrapper {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;

  .stat-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx 24rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 6rpx;
      height: 100%;
    }

    &.blue::before {
      background: linear-gradient(180deg, #1890ff 0%, #69c0ff 100%);
    }

    &.green::before {
      background: linear-gradient(180deg, #52c41a 0%, #95de64 100%);
    }

    &.orange::before {
      background: linear-gradient(180deg, #fa8c16 0%, #ffc069 100%);
    }

    &.purple::before {
      background: linear-gradient(180deg, #722ed1 0%, #b37feb 100%);
    }

    .stat-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;
      min-width: 0;

      .stat-num {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 4rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.chart-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .section-header {
    margin-bottom: 20rpx;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;

    .title-icon {
      font-size: 32rpx;
    }
  }

  .type-list {
    .type-item {
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .type-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .type-left {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .type-icon {
            font-size: 28rpx;
          }

          .type-name {
            font-size: 28rpx;
            color: #333;
          }
        }

        .type-right {
          display: flex;
          align-items: baseline;
          gap: 4rpx;

          .type-count {
            font-size: 28rpx;
            font-weight: bold;
            color: #1890ff;
          }

          .type-unit {
            font-size: 22rpx;
            color: #999;
          }

          .type-percent {
            font-size: 24rpx;
            color: #666;
            margin-left: 8rpx;
            padding: 2rpx 8rpx;
            background: #f0f5ff;
            border-radius: 8rpx;
          }
        }
      }

      .type-bar {
        height: 16rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        overflow: hidden;

        .type-bar-fill {
          height: 100%;
          border-radius: 8rpx;
          transition: width 0.5s ease;
        }
      }
    }
  }

  .size-list {
    .size-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .size-left {
        display: flex;
        align-items: center;
        gap: 8rpx;
        min-width: 0;

        .size-icon {
          font-size: 28rpx;
        }

        .size-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .size-right {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .size-value {
          font-size: 28rpx;
          font-weight: bold;
          color: #1890ff;
          min-width: 100rpx;
          text-align: right;
        }

        .size-bar {
          width: 120rpx;
          height: 12rpx;
          background: #f5f5f5;
          border-radius: 6rpx;
          overflow: hidden;

          .size-bar-fill {
            height: 100%;
            border-radius: 6rpx;
            transition: width 0.5s ease;
          }
        }
      }
    }
  }

  .trend-list {
    .trend-item {
      padding: 20rpx;
      background: #fafafa;
      border-radius: 16rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .trend-header {
        margin-bottom: 16rpx;

        .trend-month {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .trend-content {
        display: flex;
        flex-direction: column;
        gap: 16rpx;

        .trend-row {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .trend-label {
            width: 100rpx;
            display: flex;
            align-items: center;
            gap: 4rpx;
            font-size: 24rpx;
            color: #666;
            flex-shrink: 0;

            .label-icon {
              font-size: 20rpx;
            }

            &.upload {
              color: #1890ff;
            }

            &.view {
              color: #52c41a;
            }
          }

          .trend-bar-wrapper {
            flex: 1;

            .trend-bar {
              height: 20rpx;
              background: #f0f0f0;
              border-radius: 10rpx;
              overflow: hidden;

              .trend-bar-fill {
                height: 100%;
                border-radius: 10rpx;
                transition: width 0.5s ease;

                &.upload {
                  background: linear-gradient(90deg, #1890ff 0%, #69c0ff 100%);
                }

                &.view {
                  background: linear-gradient(90deg, #52c41a 0%, #95de64 100%);
                }
              }
            }
          }

          .trend-value {
            width: 60rpx;
            font-size: 26rpx;
            color: #666;
            text-align: right;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;

    .empty-icon {
      font-size: 64rpx;
      margin-bottom: 16rpx;
    }

    .empty-text {
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style>
