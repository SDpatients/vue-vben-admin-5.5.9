<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { computed, nextTick, onUnmounted, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElEmpty,
  ElMessage,
  ElTabs,
  ElTabPane,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElImage,
  ElRadio,
  ElRadioGroup,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getDocumentDetailApi,
  getOfficePreviewConfigApi,
  downloadDocumentApi,
  formatFileSize,
  getDocumentTypeIcon,
  getDocumentTypeColor,
} from '#/api/core/document-library';

const props = defineProps<{
  documentId: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const officeLoading = ref(false);
const document = ref<DocumentLibraryApi.Document | null>(null);
const previewUrl = ref('');
const previewType = ref<'iframe' | 'image' | 'office' | 'unsupported'>('unsupported');
const activeTab = ref('preview');
const officePreviewMode = ref<'office' | 'download'>('office');
const officeConfig = ref<DocumentLibraryApi.OfficePreviewConfig | null>(null);
const officeEditorRef = ref<HTMLElement | null>(null);
let officeEditor: any = null;

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const canPreview = computed(() => {
  if (!document.value) return false;
  const ext = document.value.fileExtension?.toLowerCase();
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext || '');
});

const canOfficePreview = computed(() => {
  if (!document.value) return false;
  const ext = document.value.fileExtension?.toLowerCase();
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
});

const fetchDocumentDetail = async () => {
  if (!props.documentId) return;

  loading.value = true;
  try {
    const response = await getDocumentDetailApi(props.documentId);
    if (response) {
      document.value = response;
      determinePreviewType();
    } else {
      ElMessage.error('获取文档详情失败');
    }
  } catch (error) {
    console.error('获取文档详情失败:', error);
    ElMessage.error('获取文档详情失败');
  } finally {
    loading.value = false;
  }
};

const fetchOfficeConfig = async () => {
  if (!props.documentId) return;

  officeLoading.value = true;
  try {
    console.log('[DocumentPreview] 开始获取Office配置, documentId:', props.documentId);
    const response = await getOfficePreviewConfigApi(props.documentId);
    console.log('[DocumentPreview] Office配置响应:', response);
    
    if (response) {
      officeConfig.value = response;
      console.log('[DocumentPreview] Office配置已设置:', officeConfig.value);
      await nextTick();
      initOfficeEditor();
    } else {
      console.warn('[DocumentPreview] Office配置响应为空');
      ElMessage.warning('Office预览服务暂不可用，请下载查看');
      officePreviewMode.value = 'download';
    }
  } catch (error) {
    console.error('[DocumentPreview] 获取Office配置失败:', error);
    ElMessage.warning('Office预览服务暂不可用，请下载查看');
    officePreviewMode.value = 'download';
  } finally {
    officeLoading.value = false;
  }
};

const initOfficeEditor = () => {
  if (!officeConfig.value || !officeEditorRef.value) return;

  const config = {
    document: {
      fileType: officeConfig.value.document.fileType,
      key: officeConfig.value.document.key,
      title: officeConfig.value.document.title,
      url: officeConfig.value.document.url,
    },
    documentType: officeConfig.value.documentType,
    editorConfig: {
      lang: officeConfig.value.editorConfig.lang || 'zh-CN',
      mode: officeConfig.value.editorConfig.mode || 'view',
      user: officeConfig.value.editorConfig.user || { id: 'guest', name: '访客' },
    },
    width: '100%',
    height: '100%',
    type: 'desktop',
  };

  try {
    if ((window as any).DocsAPI) {
      officeEditor = new (window as any).DocsAPI.DocEditor(officeEditorRef.value, config);
    } else {
      console.warn('OnlyOffice DocsAPI 未加载');
      officePreviewMode.value = 'download';
    }
  } catch (error) {
    console.error('初始化Office编辑器失败:', error);
    officePreviewMode.value = 'download';
  }
};

const destroyOfficeEditor = () => {
  if (officeEditor) {
    try {
      officeEditor.destroyEditor();
    } catch (error) {
      console.error('销毁Office编辑器失败:', error);
    }
    officeEditor = null;
  }
};

const determinePreviewType = () => {
  if (!document.value) {
    previewType.value = 'unsupported';
    return;
  }

  const ext = document.value.fileExtension?.toLowerCase();

  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext || '')) {
    previewType.value = 'image';
    previewUrl.value = `/api/lib/documents/${document.value.id}/download`;
  } else if (ext === 'pdf') {
    previewType.value = 'iframe';
    previewUrl.value = `/api/lib/documents/${document.value.id}/download`;
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
    previewType.value = 'iframe';
    const fileUrl = encodeURIComponent(`${window.location.origin}/api/lib/documents/${document.value.id}/download`);
    previewUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`;
  } else {
    previewType.value = 'unsupported';
  }
};

const handleDownload = async () => {
  if (!document.value) return;

  try {
    const blob = await downloadDocumentApi(document.value.id);
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.value.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败');
  }
};

const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank');
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const getDocumentTypeTag = (type: string) => {
  const typeMap: Record<string, { label: string; type: string }> = {
    WORD: { label: 'Word', type: 'primary' },
    EXCEL: { label: 'Excel', type: 'success' },
    PDF: { label: 'PDF', type: 'danger' },
    OTHER: { label: '其他', type: 'info' },
  };
  return typeMap[type] || typeMap.OTHER;
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.documentId) {
      fetchDocumentDetail();
    } else if (!newVal) {
      destroyOfficeEditor();
      officeConfig.value = null;
      officePreviewMode.value = 'office';
    }
  },
  { immediate: true }
);

watch(previewType, async (newVal) => {
  if (newVal === 'office' && officePreviewMode.value === 'office' && !officeConfig.value) {
    await fetchOfficeConfig();
  }
});

watch(officePreviewMode, async (newVal) => {
  if (newVal === 'office' && previewType.value === 'office' && !officeConfig.value) {
    await fetchOfficeConfig();
  } else if (newVal === 'download') {
    destroyOfficeEditor();
  }
});

watch(activeTab, (newVal) => {
  if (newVal !== 'preview') {
    destroyOfficeEditor();
  } else if (previewType.value === 'office' && officePreviewMode.value === 'office') {
    nextTick(() => {
      if (!officeEditor && officeConfig.value) {
        initOfficeEditor();
      } else if (!officeConfig.value) {
        fetchOfficeConfig();
      }
    });
  }
});

onUnmounted(() => {
  destroyOfficeEditor();
  previewUrl.value = '';
});
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="document?.documentName || '文档预览'"
    width="90%"
    top="5vh"
    destroy-on-close
    @close="emit('close')"
  >
    <div v-loading="loading" class="document-preview">
      <template v-if="document">
        <ElTabs v-model="activeTab" class="preview-tabs">
          <ElTabPane label="预览" name="preview">
            <div class="preview-container">
              <template v-if="previewType === 'image'">
                <div class="image-preview">
                  <ElImage
                    :src="previewUrl"
                    :alt="document.documentName"
                    fit="contain"
                    style="max-height: 70vh; max-width: 100%"
                  >
                    <template #error>
                      <ElEmpty description="图片加载失败" />
                    </template>
                  </ElImage>
                </div>
              </template>

              <template v-else-if="previewType === 'iframe'">
                <div class="iframe-preview-container">
                  <iframe
                    v-if="previewUrl"
                    :src="previewUrl"
                    class="office-iframe"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                  <div v-else class="preview-placeholder">
                    <Icon icon="lucide:file-text" class="text-6xl text-gray-400 mb-4" />
                    <p class="text-gray-500">预览地址生成中...</p>
                  </div>
                </div>
              </template>

              <template v-else-if="previewType === 'office'">
                <div class="download-preview">
                  <div class="preview-notice">
                    <Icon icon="lucide:file-text" class="text-6xl text-gray-400 mb-4" />
                    <p class="text-lg text-gray-600 mb-2">Office 文档</p>
                    <p class="text-sm text-gray-400 mb-4">
                      文件类型: {{ document.fileExtension?.toUpperCase() }}
                    </p>
                    <div class="flex gap-2">
                      <ElButton type="primary" @click="handleDownload">
                        <Icon icon="lucide:download" class="mr-1" />
                        下载文件
                      </ElButton>
                      <ElButton @click="openInNewTab">
                        <Icon icon="lucide:external-link" class="mr-1" />
                        新标签页打开
                      </ElButton>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="unsupported-preview">
                  <Icon icon="lucide:file-x" class="text-6xl text-gray-400 mb-4" />
                  <p class="text-lg text-gray-600 mb-2">暂不支持预览此类型文档</p>
                  <p class="text-sm text-gray-400 mb-4">
                    文件类型: {{ document.fileExtension?.toUpperCase() || '未知' }}
                  </p>
                  <ElButton type="primary" @click="handleDownload">
                    <Icon icon="lucide:download" class="mr-1" />
                    下载文件
                  </ElButton>
                </div>
              </template>
            </div>
          </ElTabPane>

          <ElTabPane label="文档信息" name="info">
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem label="文档名称">
                <div class="flex items-center gap-2">
                  <Icon
                    :icon="getDocumentTypeIcon(document.documentType)"
                    class="text-xl"
                    :style="{ color: getDocumentTypeColor(document.documentType) }"
                  />
                  {{ document.documentName }}
                </div>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="文档编号">
                {{ document.documentCode }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="文档类型">
                <ElTag :type="getDocumentTypeTag(document.documentType).type">
                  {{ getDocumentTypeTag(document.documentType).label }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="文件大小">
                {{ formatFileSize(document.fileSize) }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="当前版本">
                v{{ document.currentVersion }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="所属文件夹">
                {{ document.folderName }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="文件名">
                {{ document.fileName }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="文件扩展名">
                {{ document.fileExtension }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="下载次数">
                {{ document.downloadCount }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="查看次数">
                {{ document.viewCount }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="是否公开">
                <ElTag :type="document.isPublic ? 'success' : 'info'">
                  {{ document.isPublic ? '公开' : '私有' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="锁定状态">
                <ElTag :type="document.isLocked ? 'warning' : 'success'">
                  {{ document.isLocked ? '已锁定' : '未锁定' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="创建时间">
                {{ formatDate(document.createTime) }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="更新时间">
                {{ formatDate(document.updateTime) }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="标签" :span="2">
                <template v-if="document.tags">
                  <ElTag
                    v-for="tag in document.tags.split(',')"
                    :key="tag"
                    class="mr-1"
                    size="small"
                  >
                    {{ tag.trim() }}
                  </ElTag>
                </template>
                <span v-else class="text-gray-400">无标签</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="描述" :span="2">
                {{ document.description || '无描述' }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElTabPane>
        </ElTabs>
      </template>

      <ElEmpty v-else-if="!loading" description="文档信息不存在" />
    </div>

    <template #footer>
      <div class="flex justify-between">
        <div class="flex gap-2">
          <ElButton @click="handleDownload">
            <Icon icon="lucide:download" class="mr-1" />
            下载
          </ElButton>
          <ElButton v-if="canPreview" @click="openInNewTab">
            <Icon icon="lucide:external-link" class="mr-1" />
            新窗口打开
          </ElButton>
        </div>
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.document-preview {
  min-height: 400px;
}

.preview-tabs {
  height: 100%;
}

.preview-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  min-height: 70vh;
}

.iframe-preview-container {
  width: 100%;
  height: 100%;
  min-height: 70vh;
  background: #f5f5f5;
}

.office-iframe {
  width: 100%;
  height: 100%;
  min-height: 75vh;
  border: none;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 50vh;
}

.download-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 50vh;
}

.preview-notice {
  text-align: center;
}

.office-editor-container {
  flex: 1;
  min-height: 60vh;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.office-editor {
  width: 100%;
  height: 60vh;
}

.office-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.download-preview,
.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.preview-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
