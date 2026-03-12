<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { onMounted, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElInput,
  ElMessage,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
  ElSwitch,
  ElMessageBox,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getVersionListApi,
  uploadVersionApi,
  restoreVersionApi,
  downloadDocumentApi,
  formatFileSize,
} from '#/api/core/document-library';

const props = defineProps<{
  documentId: number;
  documentName: string;
}>();

const versions = ref<DocumentLibraryApi.DocumentVersion[]>([]);
const loading = ref(false);
const uploadDialogVisible = ref(false);
const uploadForm = ref({
  file: null as File | null,
  changeSummary: '',
  isMajor: false,
});
const uploadLoading = ref(false);

const fetchVersions = async () => {
  loading.value = true;
  try {
    const response = await getVersionListApi(props.documentId);
    if (response) {
      versions.value = response.versions || [];
    } else {
      versions.value = [];
    }
  } catch (error) {
    console.error('获取版本列表失败:', error);
    ElMessage.error('获取版本列表失败');
    versions.value = [];
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (file: any) => {
  uploadForm.value.file = file.raw;
};

const uploadVersion = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  uploadLoading.value = true;
  try {
    await uploadVersionApi(props.documentId, {
      file: uploadForm.value.file,
      changeSummary: uploadForm.value.changeSummary || undefined,
      isMajor: uploadForm.value.isMajor,
    });

    ElMessage.success('上传新版本成功');
    uploadDialogVisible.value = false;
    uploadForm.value = {
      file: null,
      changeSummary: '',
      isMajor: false,
    };
    await fetchVersions();
  } catch (error) {
    console.error('上传版本失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploadLoading.value = false;
  }
};

const restoreVersion = async (versionNumber: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复到版本 v${versionNumber} 吗？`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await restoreVersionApi(props.documentId, versionNumber);
    ElMessage.success('恢复成功');
    await fetchVersions();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('恢复版本失败:', error);
      ElMessage.error('恢复失败');
    }
  }
};

const downloadVersion = async (version: DocumentLibraryApi.DocumentVersion) => {
  try {
    const { blob, filename } = await downloadDocumentApi(props.documentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载版本失败:', error);
    ElMessage.error('下载失败');
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

watch(
  () => props.documentId,
  () => {
    if (props.documentId) {
      fetchVersions();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.documentId) {
    fetchVersions();
  }
});
</script>

<template>
  <div class="version-manager">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-gray-600">文档: {{ documentName }}</span>
      <ElButton type="primary" @click="uploadDialogVisible = true">
        <Icon icon="lucide:upload" class="mr-1" />
        上传新版本
      </ElButton>
    </div>

    <ElTable :data="versions" v-loading="loading" stripe border size="small">
      <template #empty>
        <ElEmpty description="暂无版本记录" />
      </template>

      <ElTableColumn prop="versionNumber" label="版本" width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="row.isMajor ? 'danger' : 'info'">
            v{{ row.versionNumber }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />

      <ElTableColumn prop="fileSize" label="大小" width="100" align="center">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </ElTableColumn>

      <ElTableColumn prop="changeSummary" label="变更说明" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.changeSummary || '-' }}
        </template>
      </ElTableColumn>

      <ElTableColumn prop="isMajor" label="主版本" width="80" align="center">
        <template #default="{ row }">
          <ElTag v-if="row.isMajor" type="danger" size="small">是</ElTag>
          <span v-else class="text-gray-400">否</span>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="createTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="160" fixed="right">
        <template #default="{ row, $index }">
          <div class="flex gap-1">
            <ElButton size="small" @click="downloadVersion(row)">
              <Icon icon="lucide:download" class="mr-1" />
              下载
            </ElButton>
            <ElButton
              v-if="$index > 0"
              type="warning"
              size="small"
              @click="restoreVersion(row.versionNumber)"
            >
              恢复
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog v-model="uploadDialogVisible" title="上传新版本" width="500px">
      <ElForm :model="uploadForm" label-width="100px">
        <ElFormItem label="选择文件" required>
          <ElUpload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <ElButton type="primary">
              <Icon icon="lucide:upload" class="mr-1" />
              选择文件
            </ElButton>
          </ElUpload>
          <div v-if="uploadForm.file" class="mt-2 text-sm text-gray-500">
            已选择: {{ uploadForm.file.name }}
          </div>
        </ElFormItem>
        <ElFormItem label="变更说明">
          <ElInput
            v-model="uploadForm.changeSummary"
            type="textarea"
            :rows="3"
            placeholder="请输入变更说明"
          />
        </ElFormItem>
        <ElFormItem label="主版本">
          <ElSwitch v-model="uploadForm.isMajor" />
          <span class="ml-2 text-sm text-gray-500">主版本号会增加</span>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="uploadDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploadLoading" @click="uploadVersion">
          上传
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.version-manager {
  min-height: 300px;
}
</style>
