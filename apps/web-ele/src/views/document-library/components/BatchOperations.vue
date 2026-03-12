<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';
import type { UploadFile } from 'element-plus';

import { computed, ref } from 'vue';

import {
  ElButton,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElUpload,
  ElProgress,
  ElTree,
  ElMessageBox,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  uploadDocumentApi,
  deleteDocumentApi,
  moveDocumentApi,
  copyDocumentApi,
  downloadDocumentApi,
  getFolderTreeApi,
} from '#/api/core/document-library';

const props = defineProps<{
  selectedDocuments: DocumentLibraryApi.Document[];
  currentFolderId: number | null;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'clear-selection'): void;
}>();

const batchUploadVisible = ref(false);
const batchMoveVisible = ref(false);
const batchCopyVisible = ref(false);
const batchDeleteVisible = ref(false);

const uploadFiles = ref<UploadFile[]>([]);
const uploadProgress = ref(0);
const uploading = ref(false);
const uploadResults = ref<{ success: number; failed: number }>({ success: 0, failed: 0 });

const folderTree = ref<DocumentLibraryApi.FolderTreeNode | null>(null);
const targetFolderId = ref<number | null>(null);
const moveLoading = ref(false);
const moveProgress = ref(0);
const moveResults = ref<{ success: number; failed: number }>({ success: 0, failed: 0 });

const deleteLoading = ref(false);
const deleteProgress = ref(0);
const deleteResults = ref<{ success: number; failed: number }>({ success: 0, failed: 0 });

const hasSelection = computed(() => props.selectedDocuments.length > 0);

const treeProps = {
  children: 'children',
  label: 'name',
};

const folderTreeData = computed(() => {
  if (!folderTree.value) return [];
  return [folderTree.value];
});

const fetchFolderTree = async () => {
  try {
    const response = await getFolderTreeApi();
    if (response) {
      folderTree.value = response;
    }
  } catch (error) {
    console.error('获取文件夹树失败:', error);
  }
};

const handleUploadChange = (file: UploadFile, fileList: UploadFile[]) => {
  uploadFiles.value = fileList;
};

const handleUploadRemove = (file: UploadFile, fileList: UploadFile[]) => {
  uploadFiles.value = fileList;
};

const executeBatchUpload = async () => {
  if (uploadFiles.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  uploadResults.value = { success: 0, failed: 0 };

  const total = uploadFiles.value.length;
  let completed = 0;

  for (const uploadFile of uploadFiles.value) {
    if (!uploadFile.raw) {
      completed++;
      uploadProgress.value = Math.round((completed / total) * 100);
      uploadResults.value.failed++;
      continue;
    }

    try {
      await uploadDocumentApi({
        file: uploadFile.raw,
        folderId: props.currentFolderId,
        isPublic: true, // 默认公开
      });
      uploadResults.value.success++;
    } catch (error) {
      console.error('上传失败:', error);
      uploadResults.value.failed++;
    }

    completed++;
    uploadProgress.value = Math.round((completed / total) * 100);
  }

  uploading.value = false;
  ElMessage.success(
    `批量上传完成：成功 ${uploadResults.value.success} 个，失败 ${uploadResults.value.failed} 个`
  );

  if (uploadResults.value.success > 0) {
    emit('refresh');
  }

  batchUploadVisible.value = false;
  uploadFiles.value = [];
};

const handleNodeClick = (data: DocumentLibraryApi.FolderTreeNode) => {
  if (data.type === 'folder') {
    targetFolderId.value = data.id;
  }
};

const executeBatchMove = async () => {
  if (!targetFolderId.value) {
    ElMessage.warning('请选择目标文件夹');
    return;
  }

  moveLoading.value = true;
  moveProgress.value = 0;
  moveResults.value = { success: 0, failed: 0 };

  const total = props.selectedDocuments.length;
  let completed = 0;

  for (const doc of props.selectedDocuments) {
    try {
      await moveDocumentApi(doc.id, targetFolderId.value!);
      moveResults.value.success++;
    } catch (error) {
      console.error('移动失败:', error);
      moveResults.value.failed++;
    }

    completed++;
    moveProgress.value = Math.round((completed / total) * 100);
  }

  moveLoading.value = false;
  ElMessage.success(
    `批量移动完成：成功 ${moveResults.value.success} 个，失败 ${moveResults.value.failed} 个`
  );

  if (moveResults.value.success > 0) {
    emit('refresh');
    emit('clear-selection');
  }

  batchMoveVisible.value = false;
};

const executeBatchCopy = async () => {
  if (!targetFolderId.value) {
    ElMessage.warning('请选择目标文件夹');
    return;
  }

  moveLoading.value = true;
  moveProgress.value = 0;
  moveResults.value = { success: 0, failed: 0 };

  const total = props.selectedDocuments.length;
  let completed = 0;

  for (const doc of props.selectedDocuments) {
    try {
      await copyDocumentApi(doc.id, targetFolderId.value!);
      moveResults.value.success++;
    } catch (error) {
      console.error('复制失败:', error);
      moveResults.value.failed++;
    }

    completed++;
    moveProgress.value = Math.round((completed / total) * 100);
  }

  moveLoading.value = false;
  ElMessage.success(
    `批量复制完成：成功 ${moveResults.value.success} 个，失败 ${moveResults.value.failed} 个`
  );

  if (moveResults.value.success > 0) {
    emit('refresh');
  }

  batchCopyVisible.value = false;
};

const executeBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${props.selectedDocuments.length} 个文档吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    deleteLoading.value = true;
    deleteProgress.value = 0;
    deleteResults.value = { success: 0, failed: 0 };

    const total = props.selectedDocuments.length;
    let completed = 0;

    for (const doc of props.selectedDocuments) {
      try {
        await deleteDocumentApi(doc.id);
        deleteResults.value.success++;
      } catch (error) {
        console.error('删除失败:', error);
        deleteResults.value.failed++;
      }

      completed++;
      deleteProgress.value = Math.round((completed / total) * 100);
    }

    deleteLoading.value = false;
    ElMessage.success(
      `批量删除完成：成功 ${deleteResults.value.success} 个，失败 ${deleteResults.value.failed} 个`
    );

    if (deleteResults.value.success > 0) {
      emit('refresh');
      emit('clear-selection');
    }

    batchDeleteVisible.value = false;
  } catch {
    // 用户取消
  }
};

const executeBatchDownload = async () => {
  if (props.selectedDocuments.length === 0) {
    ElMessage.warning('请选择要下载的文档');
    return;
  }

  ElMessage.info(`开始下载 ${props.selectedDocuments.length} 个文档...`);

  let successCount = 0;
  let failCount = 0;

  for (const doc of props.selectedDocuments) {
    try {
      const { blob, filename } = await downloadDocumentApi(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successCount++;

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error('下载失败:', error);
      failCount++;
    }
  }

  if (failCount === 0) {
    ElMessage.success(`成功下载 ${successCount} 个文档`);
  } else {
    ElMessage.warning(`下载完成：成功 ${successCount} 个，失败 ${failCount} 个`);
  }
};

const openBatchUpload = () => {
  uploadFiles.value = [];
  uploadProgress.value = 0;
  batchUploadVisible.value = true;
};

const openBatchMove = () => {
  targetFolderId.value = null;
  moveProgress.value = 0;
  fetchFolderTree();
  batchMoveVisible.value = true;
};

const openBatchCopy = () => {
  targetFolderId.value = null;
  moveProgress.value = 0;
  fetchFolderTree();
  batchCopyVisible.value = true;
};

const openBatchDelete = () => {
  batchDeleteVisible.value = true;
};
</script>

<template>
  <div class="batch-operations">
    <div class="flex items-center gap-2">
      <ElButton type="primary" @click="openBatchUpload">
        <Icon icon="lucide:upload" class="mr-1" />
        批量上传
      </ElButton>

      <ElDropdown v-if="hasSelection" trigger="click">
        <ElButton>
          批量操作 ({{ selectedDocuments.length }})
          <Icon icon="lucide:chevron-down" class="ml-1" />
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="executeBatchDownload">
              <Icon icon="lucide:download" class="mr-2" />
              批量下载
            </ElDropdownItem>
            <ElDropdownItem @click="openBatchMove">
              <Icon icon="lucide:folder-input" class="mr-2" />
              批量移动
            </ElDropdownItem>
            <ElDropdownItem @click="openBatchCopy">
              <Icon icon="lucide:copy" class="mr-2" />
              批量复制
            </ElDropdownItem>
            <ElDropdownItem divided @click="openBatchDelete">
              <Icon icon="lucide:trash-2" class="mr-2 text-red-500" />
              <span class="text-red-500">批量删除</span>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <ElButton v-if="hasSelection" @click="emit('clear-selection')">
        取消选择
      </ElButton>
    </div>

    <ElDialog v-model="batchUploadVisible" title="批量上传" width="600px">
      <ElUpload
        v-model:file-list="uploadFiles"
        multiple
        :auto-upload="false"
        accept=".doc,.docx,.xls,.xlsx,.pdf"
        drag
        @change="handleUploadChange"
        @remove="handleUploadRemove"
      >
        <div class="flex flex-col items-center py-8">
          <Icon icon="lucide:upload-cloud" class="text-5xl text-gray-400 mb-4" />
          <p class="text-gray-600">将文件拖到此处，或点击上传</p>
          <p class="text-sm text-gray-400 mt-2">支持 Word、Excel、PDF 格式</p>
        </div>
      </ElUpload>

      <div v-if="uploading" class="mt-4">
        <ElProgress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : ''" />
        <p class="text-center text-sm text-gray-500 mt-2">
          正在上传... {{ uploadProgress }}%
        </p>
      </div>

      <template #footer>
        <ElButton @click="batchUploadVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploading" @click="executeBatchUpload">
          开始上传 ({{ uploadFiles.length }} 个文件)
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="batchMoveVisible" title="批量移动" width="500px">
      <p class="mb-4 text-gray-600">
        将选中的 <strong>{{ selectedDocuments.length }}</strong> 个文档移动到：
      </p>

      <ElTree
        :data="folderTreeData"
        :props="treeProps"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="handleNodeClick"
        class="folder-tree"
      >
        <template #default="{ data }">
          <div class="flex items-center gap-2">
            <Icon
              :icon="data.type === 'root' ? 'lucide:database' : 'lucide:folder'"
              :class="data.type === 'root' ? 'text-primary' : 'text-yellow-500'"
            />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </ElTree>

      <div v-if="moveLoading" class="mt-4">
        <ElProgress :percentage="moveProgress" :status="moveProgress === 100 ? 'success' : ''" />
      </div>

      <template #footer>
        <ElButton @click="batchMoveVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="moveLoading" @click="executeBatchMove">
          确认移动
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="batchCopyVisible" title="批量复制" width="500px">
      <p class="mb-4 text-gray-600">
        将选中的 <strong>{{ selectedDocuments.length }}</strong> 个文档复制到：
      </p>

      <ElTree
        :data="folderTreeData"
        :props="treeProps"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="handleNodeClick"
        class="folder-tree"
      >
        <template #default="{ data }">
          <div class="flex items-center gap-2">
            <Icon
              :icon="data.type === 'root' ? 'lucide:database' : 'lucide:folder'"
              :class="data.type === 'root' ? 'text-primary' : 'text-yellow-500'"
            />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </ElTree>

      <div v-if="moveLoading" class="mt-4">
        <ElProgress :percentage="moveProgress" :status="moveProgress === 100 ? 'success' : ''" />
      </div>

      <template #footer>
        <ElButton @click="batchCopyVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="moveLoading" @click="executeBatchCopy">
          确认复制
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="batchDeleteVisible" title="批量删除" width="500px">
      <div class="text-center py-4">
        <Icon icon="lucide:alert-triangle" class="text-5xl text-red-500 mb-4" />
        <p class="text-lg text-gray-700 mb-2">确认删除选中的文档？</p>
        <p class="text-sm text-gray-500">
          将删除 <strong class="text-red-500">{{ selectedDocuments.length }}</strong> 个文档，此操作不可恢复！
        </p>
      </div>

      <div v-if="deleteLoading" class="mt-4">
        <ElProgress :percentage="deleteProgress" :status="deleteProgress === 100 ? 'success' : ''" />
      </div>

      <template #footer>
        <ElButton @click="batchDeleteVisible = false">取消</ElButton>
        <ElButton type="danger" :loading="deleteLoading" @click="executeBatchDelete">
          确认删除
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.folder-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.folder-tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 4px;
}

.folder-tree :deep(.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}
</style>
