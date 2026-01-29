<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  createAnnouncementApi,
  createViewRecordApi,
  getAnnouncementAttachmentsApi,
  getAnnouncementDetailApi,
  getAnnouncementListApi,
} from '#/api/core/case-announcement';
import { downloadFileApi } from '#/api/core/file';
import { fileUploadRequestClient, workTeamRequestClient } from '#/api/request';

interface Announcement {
  id: number;
  caseId: number;
  title: string;
  content: string;
  announcementType: string;
  status: string;
  publisherId: number;
  publisherName: string;
  publishTime: string;
  viewCount: number;
  isTop: boolean;
  topExpireTime: string;
  attachments: any[];
  createTime: string;
  updateTime: string;
}

const announcements = ref<Announcement[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 案号选择相关
const caseOptions = ref<any[]>([]);
const selectedCaseId = ref<number | null>(null);

// 展开状态管理
const expandedAnnouncements = ref<Record<number, boolean>>({});

// 切换展开/收起状态
const toggleExpand = (announcementId: number) => {
  expandedAnnouncements.value[announcementId] = !expandedAnnouncements.value[announcementId];
};

// 获取案号列表
const fetchCaseList = async () => {
  try {
    // 使用项目配置的API客户端，确保路径正确且带有认证信息
    const response = await workTeamRequestClient.get('/case/simple-list', {
      params: {
        page: 1,
        size: 10000
      }
    });
    if (response.code === 200) {
      caseOptions.value = response.data.list || [];
    }
  } catch (error) {
    console.error('获取案号列表失败:', error);
  }
};

// 处理案号选择变化
const handleCaseChange = (caseId: number | null) => {
  selectedCaseId.value = caseId;
  currentPage.value = 1; // 重置页码
  fetchAnnouncements(); // 重新获取公告列表
};

const showDetailDialog = ref(false);
const currentAnnouncement = ref<Announcement | null>(null);
const detailLoading = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');

// 发布公告相关
const showPublishDialog = ref(false);
const publishLoading = ref(false);
const publishForm = ref({
  caseId: 0,
  title: '',
  content: '',
  announcementType: 'ANNOUNCEMENT',
  attachments: [] as any[],
});
const publishFormRef = ref<InstanceType<typeof ElForm>>();

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
    // 构建请求参数
    const requestParams: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };
    
    // 如果选择了案号，添加caseId参数
    if (selectedCaseId.value !== null && selectedCaseId.value > 0) {
      requestParams.caseId = selectedCaseId.value;
    }
    
    const response = await getAnnouncementListApi(requestParams);
    if (response.code === 200) {
      const list = response.data.list || [];
      announcements.value = list.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return 0;
      });
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(`获取公告列表失败：${response.message || '未知错误'}`);
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
    // 调用添加查看记录接口
    await createViewRecordApi({
      announcementId: announcement.id,
      announcementTitle: announcement.title,
      caseId: announcement.caseId,
    });

    const [detailResponse, attachmentsResponse] = await Promise.all([
      getAnnouncementDetailApi(announcement.id),
      getAnnouncementAttachmentsApi(announcement.id),
    ]);

    if (detailResponse.code === 200) {
      const data = detailResponse.data;
      data.attachments = [];

      if (attachmentsResponse.code === 200 && attachmentsResponse.data) {
        data.attachments = attachmentsResponse.data.map((attach: any) => ({
          file_name: attach.originalFileName || '未知文件',
          file_id: attach.id,
          type: attach.mimeType || 'application/octet-stream',
        }));
      }

      currentAnnouncement.value = data;
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
const downloadFile = async (attachment: {
  file_id: string;
  file_name: string;
  file_url: string;
}) => {
  try {
    // 使用后端提供的下载接口
    const downloadResponse = await downloadFileApi(Number(attachment.file_id));

    // 创建下载链接
    const blob = new Blob([downloadResponse], {
      type: 'application/octet-stream',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = attachment.file_name;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success('文件下载开始');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

/**
 * 打开文件预览
 */
const previewFile = async (attachment: {
  file_id: string;
  file_name: string;
}) => {
  if (!attachment.file_id) {
    ElMessage.error('无效的文件ID');
    return;
  }

  const fileId = Number(attachment.file_id);
  if (isNaN(fileId)) {
    ElMessage.error('文件ID必须是数字');
    return;
  }

  try {
    ElMessage.info('正在加载文件...');

    const response = await fileUploadRequestClient.get(
      `/api/v1/file/preview/${fileId}`,
      {
        responseType: 'blob',
      },
    );

    const blob = new Blob([response], {
      type: response.type || 'application/octet-stream',
    });

    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl.value);
    }

    previewUrl.value = window.URL.createObjectURL(blob);
    showPreviewDialog.value = true;
    ElMessage.success('文件加载成功');
  } catch (error) {
    console.error('文件预览失败:', error);
    ElMessage.error('文件预览失败，请检查文件是否存在或权限是否足够');
  }
};

/**
 * 关闭文件预览对话框
 */
const closePreviewDialog = () => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    window.URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  showPreviewDialog.value = false;
};

/**
 * 复制附件数据
 */
const copyAttachmentData = () => {
  if (currentAnnouncement.value?.attachments) {
    navigator.clipboard
      .writeText(currentAnnouncement.value.attachments)
      .then(() => {
        ElMessage.success('附件数据已复制到剪贴板');
      })
      .catch((error) => {
        console.error('复制失败:', error);
        ElMessage.error('复制失败，请手动复制');
      });
  }
};

// 打开发布公告对话框
const openPublishDialog = () => {
  showPublishDialog.value = true;
  // 重置表单
  publishForm.value = {
    caseId: 0,
    title: '',
    content: '',
    announcementType: 'ANNOUNCEMENT',
    attachments: [],
  };
};

// 关闭发布公告对话框
const closePublishDialog = () => {
  showPublishDialog.value = false;
};

// 提交发布公告表单
const submitPublishForm = async () => {
  if (!publishFormRef.value) return;

  await publishFormRef.value.validate();

  publishLoading.value = true;
  try {
    // 构建请求数据
    const requestData = {
      caseId: publishForm.value.caseId,
      title: publishForm.value.title,
      content: publishForm.value.content,
      announcementType: publishForm.value.announcementType,
      attachments:
        publishForm.value.attachments.length > 0
          ? JSON.stringify(publishForm.value.attachments)
          : undefined,
    };

    // 调用发布公告API
    const response = await createAnnouncementApi(requestData);

    if (response.code === 200) {
      ElMessage.success('公告发布成功');
      showPublishDialog.value = false;
      fetchAnnouncements(); // 刷新公告列表
    } else {
      ElMessage.error(`公告发布失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('发布公告失败:', error);
    ElMessage.error('发布公告失败，请稍后重试');
  } finally {
    publishLoading.value = false;
  }
};

onMounted(() => {
  fetchCaseList(); // 先获取案号列表
  fetchAnnouncements(); // 再获取公告列表
});
</script>

<template>
  <div class="announcement-list-wrapper">
    <div class="announcement-container">
      <ElCard shadow="hover">
        <template #header>
          <div class="card-header flex flex-col items-start justify-between w-full">
            <div class="flex items-center w-full justify-between mb-4">
              <div class="flex items-center">
                <Icon icon="lucide:bell" class="mr-2" />
                <span class="text-lg font-semibold">公告列表</span>
              </div>
              <ElButton type="primary" @click="openPublishDialog">
                <Icon icon="lucide:plus" class="mr-1" />
                发布公告
              </ElButton>
            </div>
            <div class="w-full">
              <ElSelect
                v-model="selectedCaseId"
                placeholder="请选择案号"
                filterable
                clearable
                style="width: 250px"
                @change="handleCaseChange"
                @clear="handleCaseChange(null)"
              >
                <ElOption
                  v-for="caseItem in caseOptions"
                  :key="caseItem.id"
                  :label="caseItem.caseName"
                  :value="caseItem.id"
                >
                  <div class="flex flex-col">
                    <span>{{ caseItem.caseName }}</span>
                    <span class="text-xs text-gray-500">{{ caseItem.caseNumber }}</span>
                  </div>
                </ElOption>
              </ElSelect>
            </div>
          </div>
        </template>

        <div v-loading="loading" class="announcement-list">
          <!-- 加载中状态：显示骨架屏占位 -->
          <template v-if="loading">
            <div
              v-for="i in 3"
              :key="i"
              class="announcement-item skeleton-item"
            >
              <div class="announcement-header">
                <div class="title-section">
                  <div class="skeleton skeleton-title"></div>
                  <div class="skeleton skeleton-tag ml-2"></div>
                  <div class="skeleton skeleton-tag ml-2"></div>
                </div>
                <div class="skeleton skeleton-button"></div>
              </div>
              <div class="announcement-meta">
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-meta"></div>
              </div>
            </div>
          </template>

          <!-- 空数据状态 -->
          <div v-else-if="announcements.length === 0" class="empty-state">
            <ElEmpty description="暂无公告" />
          </div>

          <!-- 有数据状态 -->
          <template v-else>
            <div
              v-for="item in announcements"
              :key="item.id"
              class="announcement-item"
            >
              <div class="announcement-header">
                <div class="title-section">
                  <Icon v-if="item.isTop" icon="lucide:pin" class="top-icon" />
                  <h3 class="announcement-title">{{ item.title }}</h3>
                  <ElTag
                    :type="
                      item.announcementType === 'ANNOUNCEMENT'
                        ? 'info'
                        : item.announcementType === 'NOTICE'
                          ? 'warning'
                          : item.announcementType === 'WARNING'
                            ? 'danger'
                            : 'info'
                    "
                    size="small"
                    class="ml-2"
                  >
                    {{ item.announcementType === 'ANNOUNCEMENT' ? '公告' : item.announcementType === 'NOTICE' ? '通知' : item.announcementType === 'WARNING' ? '警告' : '普通' }}
                  </ElTag>
                  <ElTag
                    :type="
                      item.status === 'PUBLISHED'
                        ? 'success'
                        : item.status === 'DRAFT'
                          ? 'info'
                          : 'warning'
                    "
                    size="small"
                    class="status-tag ml-2"
                  >
                    {{ item.status === 'PUBLISHED' ? '已发布' : item.status === 'DRAFT' ? '草稿' : '已撤回' }}
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

              <!-- 公告内容 -->
              <div class="announcement-content">
                <div 
                  class="content-preview"
                  :class="{ full: expandedAnnouncements[item.id] }"
                  v-html="item.content"
                ></div>
                <button 
                  v-if="item.content && item.content.length > 100"
                  class="expand-btn"
                  @click="toggleExpand(item.id)"
                >
                  {{ expandedAnnouncements[item.id] ? '收起' : '展开' }}
                </button>
              </div>

              <div class="announcement-meta">
                <div class="meta-item">
                  <Icon icon="lucide:user" class="icon" />
                  <span>发布人：{{ item.publisherName }}</span>
                </div>
                <div class="meta-item">
                  <Icon icon="lucide:calendar" class="icon" />
                  <span>发布时间：{{ formatDate(item.publishTime) }}</span>
                </div>
                <div class="meta-item">
                  <Icon icon="lucide:eye" class="icon" />
                  <span>浏览次数：{{ item.viewCount }}</span>
                </div>
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
          </template>
        </div>
      </ElCard>

      <!-- 公告详情对话框 -->
      <ElDialog
        v-model="showDetailDialog"
        :title="currentAnnouncement?.title || '公告详情'"
        width="70%"
        destroy-on-close
      >
        <div v-loading="detailLoading" class="announcement-detail-container">
          <div v-if="currentAnnouncement" class="detail-content">
            <!-- 元信息区域 -->
            <div class="detail-meta">
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">公告ID</span>
                  <span class="meta-value">{{ currentAnnouncement.id }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">案件ID</span>
                  <span class="meta-value">{{
                    currentAnnouncement.caseId
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">公告类型</span>
                  <span class="meta-value">{{
                    currentAnnouncement.announcementType || '普通'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">状态</span>
                  <ElTag
                    :type="
                      currentAnnouncement.status === 'PUBLISHED'
                        ? 'success'
                        : currentAnnouncement.status === 'DRAFT'
                          ? 'info'
                          : 'warning'
                    "
                    size="small"
                  >
                    {{
                      currentAnnouncement.status === 'PUBLISHED'
                        ? '已发布'
                        : currentAnnouncement.status === 'DRAFT'
                          ? '草稿'
                          : '已撤回'
                    }}
                  </ElTag>
                </div>
                <div class="meta-item">
                  <span class="meta-label">发布人</span>
                  <span class="meta-value">{{
                    currentAnnouncement.publisherName || '未设置'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">发布时间</span>
                  <span class="meta-value">{{
                    currentAnnouncement.publishTime
                      ? formatDate(currentAnnouncement.publishTime)
                      : '未发布'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">浏览次数</span>
                  <span class="meta-value">{{
                    currentAnnouncement.viewCount || 0
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">是否置顶</span>
                  <ElTag
                    :type="currentAnnouncement.isTop ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ currentAnnouncement.isTop ? '已置顶' : '未置顶' }}
                  </ElTag>
                </div>
                <div
                  v-if="
                    currentAnnouncement.isTop &&
                    currentAnnouncement.topExpireTime
                  "
                  class="meta-item"
                >
                  <span class="meta-label">置顶过期时间</span>
                  <span class="meta-value">{{
                    formatDate(currentAnnouncement.topExpireTime)
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">创建时间</span>
                  <span class="meta-value">{{
                    formatDate(currentAnnouncement.createTime)
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">更新时间</span>
                  <span class="meta-value">{{
                    formatDate(currentAnnouncement.updateTime)
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">是否删除</span>
                  <ElTag
                    :type="currentAnnouncement.isDeleted ? 'danger' : 'success'"
                    size="small"
                  >
                    {{ currentAnnouncement.isDeleted ? '已删除' : '正常' }}
                  </ElTag>
                </div>
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="detail-body">
              <h4 class="section-title">公告内容</h4>
              <div
                class="content-html"
                v-html="currentAnnouncement.content"
              ></div>
            </div>

            <!-- 附件区域 -->
            <div
              v-if="
                currentAnnouncement.attachments &&
                currentAnnouncement.attachments !== 'string'
              "
              class="detail-attachments"
            >
              <h4 class="section-title">附件</h4>
              <div class="attachment-list">
                <div
                  v-for="(attachment, index) in currentAnnouncement.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <div class="attachment-info">
                    <Icon icon="lucide:paperclip" class="attachment-icon" />
                    <span class="attachment-name">{{
                      attachment.file_name || attachment.name || '附件'
                    }}</span>
                  </div>
                  <div class="attachment-actions">
                    <ElButton
                      type="primary"
                      size="small"
                      @click="previewFile(attachment)"
                    >
                      预览
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

            <!-- 附件为字符串时的特殊处理 -->
            <div
              v-else-if="currentAnnouncement.attachments === 'string'"
              class="detail-attachments"
            >
              <h4 class="section-title">附件</h4>
              <div class="attachment-list">
                <div class="attachment-item">
                  <div class="attachment-info">
                    <Icon icon="lucide:paperclip" class="attachment-icon" />
                    <span class="attachment-name">附件数据</span>
                  </div>
                  <div class="attachment-actions">
                    <ElButton
                      type="primary"
                      size="small"
                      @click="copyAttachmentData"
                    >
                      复制附件数据
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElDialog>

      <!-- 文件预览对话框 -->
      <ElDialog
        v-model="showPreviewDialog"
        title="文件预览"
        width="80%"
        height="80%"
        destroy-on-close
        @close="closePreviewDialog"
      >
        <div class="preview-container">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
          ></iframe>
        </div>
      </ElDialog>

      <!-- 发布公告对话框 -->
      <ElDialog
        v-model="showPublishDialog"
        title="发布新公告"
        width="800px"
        destroy-on-close
      >
        <ElForm
          ref="publishFormRef"
          :model="publishForm"
          label-width="120px"
          class="publish-form"
        >
          <ElFormItem
            label="案件ID"
            prop="caseId"
            :rules="[
              { required: true, message: '请输入案件ID', trigger: 'blur' },
              { type: 'number', message: '案件ID必须是数字', trigger: 'blur' },
            ]"
          >
            <ElInput
              v-model.number="publishForm.caseId"
              placeholder="请输入案件ID"
            />
          </ElFormItem>

          <ElFormItem
            label="公告标题"
            prop="title"
            :rules="[
              { required: true, message: '请输入公告标题', trigger: 'blur' },
              {
                max: 200,
                message: '标题长度不能超过200个字符',
                trigger: 'blur',
              },
            ]"
          >
            <ElInput
              v-model="publishForm.title"
              placeholder="请输入公告标题"
              maxlength="200"
              show-word-limit
            />
          </ElFormItem>

          <ElFormItem
            label="公告类型"
            prop="announcementType"
            :rules="[
              { required: true, message: '请选择公告类型', trigger: 'change' },
            ]"
          >
            <ElSelect
              v-model="publishForm.announcementType"
              placeholder="请选择公告类型"
            >
              <ElOption label="公告" value="ANNOUNCEMENT" />
              <ElOption label="通知" value="NOTICE" />
              <ElOption label="警告" value="WARNING" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            label="公告内容"
            prop="content"
            :rules="[
              { required: true, message: '请输入公告内容', trigger: 'blur' },
            ]"
          >
            <ElInput
              v-model="publishForm.content"
              type="textarea"
              :rows="8"
              placeholder="请输入公告内容，支持HTML格式"
            />
          </ElFormItem>

          <ElFormItem label="附件">
            <ElUpload
              :file-list="publishForm.attachments"
              :on-change="
                (file) => {
                  // 处理附件上传，这里仅做模拟
                  const newFile = {
                    fileName: file.name,
                    fileUrl: `http://example.com/files/${file.name}`,
                    fileType: file.type,
                  };
                  publishForm.value.attachments.push(newFile);
                }
              "
              :on-remove="
                (file, fileList) => {
                  publishForm.value.attachments = fileList;
                }
              "
              accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png,.gif"
              multiple
            >
              <ElButton type="primary" size="small">
                <Icon icon="lucide:upload" class="mr-1" />
                上传附件
              </ElButton>
              <div class="upload-hint">
                支持上传doc、docx、pdf、txt、jpg、jpeg、png、gif格式文件
              </div>
            </ElUpload>
          </ElFormItem>
        </ElForm>

        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="showPublishDialog = false">取消</ElButton>
            <ElButton
              type="primary"
              @click="submitPublishForm"
              :loading="publishLoading"
            >
              发布
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </div>
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
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.announcement-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

/* 公告详情弹窗样式 */
.announcement-detail-container {
  padding: 20px;
}

.detail-content {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-meta {
  padding: 20px;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.section-title {
  display: inline-block;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #3b82f6;
}

.detail-body {
  padding: 20px;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.content-html {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

.content-html :deep(p) {
  margin-bottom: 12px;
}

.detail-attachments {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #f3f4f6;
  transform: translateX(2px);
}

.attachment-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attachment-icon {
  font-size: 16px;
  color: #3b82f6;
}

.attachment-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

/* 预览容器样式 */
.preview-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

/* 发布公告表单样式 */
.publish-form {
  padding: 10px 0;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.announcement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-section {
  display: flex;
  flex: 1;
  align-items: center;
}

.top-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #ef4444;
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
  font-size: 14px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item .icon {
  margin-right: 0;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.meta-item span {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

/* 公告内容样式 */
.announcement-content {
  margin: 12px 0;
  position: relative;
}

.content-preview {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  max-height: 4.8em; /* 4行 * 1.2行高 */
  overflow: hidden;
  position: relative;
}

.content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 1.6em;
  background: linear-gradient(to top, #fff, transparent);
  pointer-events: none;
}

.content-preview.full {
  max-height: none;
}

.content-preview.full::after {
  display: none;
}

/* 展开按钮 */
.expand-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  border: none;
  outline: none;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
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
  min-width: 80px;
  font-weight: 600;
  color: #374151;
}

.detail-body {
  padding: 20px;
}

.section-title {
  padding-bottom: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
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
  color: #000 !important;
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
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.attachment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.attachment-info {
  display: flex;
  flex: 1;
  align-items: center;
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

/* 骨架屏样式 */
.skeleton-item {
  pointer-events: none;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 200px;
}

.skeleton-tag {
  height: 22px;
  width: 60px;
}

.skeleton-button {
  height: 32px;
  width: 100px;
  border-radius: 4px;
}

.skeleton-meta {
  height: 18px;
  width: 120px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
