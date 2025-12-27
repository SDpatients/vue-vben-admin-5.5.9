<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElPagination,
  ElTag,
} from 'element-plus';

import {
  getAnnouncementDetailApi,
  getAnnouncementListApi,
  recordAnnouncementViewApi,
} from '#/api/core/case-announcement';

interface Announcement {
  id: string;
  sepId: string;
  title: string;
  content: string;
  announcementType: string;
  status: string;
  publisherId: string;
  publisherName: string;
  publishTime: string;
  viewCount: number;
  isTop: number;
  topExpireTime: string;
  createTime: string;
  updateTime: string;
  ah: string; // 案号
  glyfrz: string; // 主要负责人
  attachments?: Array<{
    file_id: string;
    file_name: string;
    file_url: string;
  }>; // 公告附件
}

const announcements = ref<Announcement[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const showDetailDialog = ref(false);
const currentAnnouncement = ref<Announcement | null>(null);
const detailLoading = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');

const announcementTypeMap: Record<string, { label: string; type: string }> = {
  NORMAL: { label: '普通', type: 'info' },
  URGENT: { label: '紧急', type: 'danger' },
  IMPORTANT: { label: '重要', type: 'warning' },
};

const statusMap: Record<string, { label: string; type: string }> = {
  DRAFT: { label: '草稿', type: 'info' },
  PUBLISHED: { label: '已发布', type: 'success' },
  REVOKED: { label: '已撤回', type: 'warning' },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const response = await getAnnouncementListApi(
      '0',
      currentPage.value,
      pageSize.value,
    );
    if (response.status === '1') {
      announcements.value = response.data.records || [];
      total.value = response.data.count || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.error || '未知错误'}`);
      announcements.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
    announcements.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const viewAnnouncementDetail = async (announcement: Announcement) => {
  detailLoading.value = true;
  showDetailDialog.value = true;
  currentAnnouncement.value = announcement;

  try {
    // 从localStorage获取用户信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    let viewerId = '';
    let viewerName = '';

    try {
      if (chatUserInfo) {
        const userInfo = JSON.parse(chatUserInfo);
        viewerId = userInfo.user?.uPid || '';
        viewerName = userInfo.user?.uName || '';
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }

    // 调用浏览记录接口，传入ajid、viewer_id、viewer_name
    await recordAnnouncementViewApi(
      announcement.id,
      announcement.sepId,
      viewerId,
      viewerName,
    );

    const response = await getAnnouncementDetailApi(announcement.id);
    if (response.status === '1') {
      const detail = response.data;

      // 解析attachments字段，将JSON字符串转换为数组
      if (detail.attachments && typeof detail.attachments === 'string') {
        try {
          detail.attachments = JSON.parse(detail.attachments);
        } catch (error) {
          console.error('解析attachments失败:', error);
          detail.attachments = [];
        }
      }

      currentAnnouncement.value = detail;
    }
  } catch (error) {
    console.error('获取公告详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAnnouncements();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchAnnouncements();
};

/**
 * 下载文件
 */
const downloadFile = (attachment: {
  file_id: string;
  file_name: string;
  file_url: string;
}) => {
  try {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    link.target = '_blank';
    link.style.display = 'none';

    document.body.append(link);
    link.click();

    link.remove();
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

/**
 * 打开文件预览
 */
const previewFile = (attachment: { file_id: string; file_name: string }) => {
  const baseUrl = 'http://192.168.0.120:8080';
  previewUrl.value = `${baseUrl}/api/file/view/${attachment.file_id}`;
  showPreviewDialog.value = true;
};

onMounted(() => {
  fetchAnnouncements();
});
</script>

<template>
  <div class="announcement-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:bell" class="mr-2" />
          <span class="text-lg font-semibold">公告列表</span>
        </div>
      </template>

      <div v-loading="loading" class="announcement-list">
        <div v-if="announcements.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无公告" />
        </div>

        <div
          v-for="item in announcements"
          :key="item.id"
          class="announcement-item"
        >
          <div class="announcement-header">
            <div class="title-section">
              <Icon
                v-if="item.isTop === 1"
                icon="lucide:pin"
                class="top-icon"
              />
              <h3 class="announcement-title">{{ item.title }}</h3>
              <ElTag
                :type="
                  announcementTypeMap[item.announcementType]?.type || 'info'
                "
                size="small"
                class="ml-2"
              >
                {{
                  announcementTypeMap[item.announcementType]?.label || '普通'
                }}
              </ElTag>
              <ElTag
                :type="statusMap[item.status]?.type || 'info'"
                size="small"
                class="status-tag ml-2"
              >
                {{ statusMap[item.status]?.label || '未知' }}
              </ElTag>
            </div>
            <ElButton
              type="primary"
              size="small"
              @click="viewAnnouncementDetail(item)"
            >
              查看详情
            </ElButton>
          </div>

          <div class="announcement-meta">
            <span class="meta-item">
              <Icon icon="lucide:user" class="icon" />
              发布人：{{ item.publisherName }}
            </span>
            <span class="meta-item">
              <Icon icon="lucide:calendar" class="icon" />
              发布时间：{{ formatDate(item.publishTime) }}
            </span>
            <span class="meta-item">
              <Icon icon="lucide:file-text" class="icon" />
              案号：{{ item.ah }}
            </span>
            <span class="meta-item">
              <Icon icon="lucide:users" class="icon" />
              主要负责人：{{ item.glyfrz }}
            </span>
            <span class="meta-item">
              <Icon icon="lucide:eye" class="icon" />
              浏览次数：{{ item.viewCount }}
            </span>
          </div>
        </div>

        <div v-if="total > 0" class="pagination-container">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showDetailDialog"
      :title="currentAnnouncement?.title"
      width="70%"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="announcement-detail">
        <div v-if="currentAnnouncement" class="detail-content">
          <div class="detail-meta">
            <div class="meta-row">
              <span class="label">公告类型：</span>
              <ElTag
                :type="
                  announcementTypeMap[currentAnnouncement.announcementType]
                    ?.type || 'info'
                "
                size="small"
              >
                {{
                  announcementTypeMap[currentAnnouncement.announcementType]
                    ?.label || '普通'
                }}
              </ElTag>
            </div>
            <div class="meta-row">
              <span class="label">状态：</span>
              <ElTag
                :type="statusMap[currentAnnouncement.status]?.type || 'info'"
                size="small"
                class="status-tag"
              >
                {{ statusMap[currentAnnouncement.status]?.label || '未知' }}
              </ElTag>
            </div>
            <div class="meta-row">
              <span class="label">发布人：</span>
              <span>{{ currentAnnouncement.publisherName }}</span>
            </div>
            <div class="meta-row">
              <span class="label">发布时间：</span>
              <span>{{ formatDate(currentAnnouncement.publishTime) }}</span>
            </div>
            <div class="meta-row">
              <span class="label">案号：</span>
              <span>{{ currentAnnouncement.ah }}</span>
            </div>
            <div class="meta-row">
              <span class="label">主要负责人：</span>
              <span>{{ currentAnnouncement.glyfrz }}</span>
            </div>
            <div class="meta-row">
              <span class="label">浏览次数：</span>
              <span>{{ currentAnnouncement.viewCount }}</span>
            </div>
          </div>

          <div class="detail-body">
            <h4 class="section-title">公告内容</h4>
            <div
              class="content-html"
              v-html="currentAnnouncement.content"
            ></div>
          </div>

          <!-- 附件列表 -->
          <div
            v-if="
              currentAnnouncement.attachments &&
              currentAnnouncement.attachments.length > 0
            "
            class="detail-body"
          >
            <h4 class="section-title">附件列表</h4>
            <div class="attachments-list">
              <div
                v-for="(attachment, index) in currentAnnouncement.attachments"
                :key="index"
                class="attachment-item"
              >
                <div class="attachment-info">
                  <Icon icon="lucide:file" class="file-icon" />
                  <span class="file-name">{{ attachment.file_name }}</span>
                </div>
                <div class="attachment-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="previewFile(attachment)"
                  >
                    查看
                  </ElButton>
                  <ElButton
                    size="small"
                    class="ml-2"
                    @click="downloadFile(attachment)"
                  >
                    下载
                  </ElButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>
    <ElDialog
      v-model="showPreviewDialog"
      title="文件预览"
      width="80%"
      height="80%"
      destroy-on-close
    >
      <div class="preview-container">
        <iframe
          :src="previewUrl"
          class="preview-iframe"
          frameborder="0"
        ></iframe>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.announcement-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.announcement-list {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

.announcement-item {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
  background-color: #fff;
}

.announcement-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.announcement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.top-icon {
  margin-right: 8px;
  color: #ef4444;
  font-size: 18px;
}

.announcement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.announcement-meta {
  display: flex;
  gap: 24px;
  color: #6b7280;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item .icon {
  margin-right: 4px;
  font-size: 16px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.announcement-detail {
  padding: 10px 0;
}

.detail-meta {
  padding: 16px;
  margin-bottom: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-row .label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.detail-body {
  padding: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.content-html {
  line-height: 1.8;
  color: #374151;
}

.content-html :deep(p) {
  margin-bottom: 12px;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.status-tag {
  color: #000000 !important;
}

/* 附件列表样式 */
.attachments-list {
  margin-top: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.3s;
}

.attachment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.attachment-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #3b82f6;
}

.file-name {
  font-size: 14px;
  color: #374151;
  word-break: break-all;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.attachment-actions .ml-2 {
  margin-left: 8px;
}

.preview-container {
  width: 100%;
  height: 70vh;
}

.preview-iframe {
  width: 100%;
  height: 100%;
}
</style>
