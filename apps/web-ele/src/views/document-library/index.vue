<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { computed, onMounted, ref, watch } from 'vue';

import DocumentPreview from './components/DocumentPreview.vue';
import BatchOperations from './components/BatchOperations.vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTree,
  ElUpload,
  ElSwitch,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElDatePicker,
  ElMessageBox,
  ElProgress,
  ElTooltip,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  getFolderTreeApi,
  getFolderDetailApi,
  getFolderChildrenApi,
  getFolderDocumentsApi,
  getFolderPathApi,
  getMyDocumentsApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  uploadDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
  downloadDocumentApi,
  lockDocumentApi,
  unlockDocumentApi,
  addFavoriteApi,
  removeFavoriteApi,
  formatFileSize,
  getDocumentTypeIcon,
  getDocumentTypeColor,
} from '#/api/core/document-library';

const loading = ref(false);
const folderTree = ref<DocumentLibraryApi.FolderTreeNode | null>(null);
const documentList = ref<DocumentLibraryApi.Document[]>([]);
const currentFolderId = ref<number | null>(null);
const currentFolder = ref<DocumentLibraryApi.Folder | null>(null);
const subFolders = ref<DocumentLibraryApi.Folder[]>([]);
const breadcrumb = ref<DocumentLibraryApi.FolderBreadcrumb[]>([]);
const searchKeyword = ref('');
const showMyOnly = ref(false);

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

const documentTypeFilter = ref<string>('');
const statusFilter = ref<string>('');

const folderDialogVisible = ref(false);
const folderForm = ref({
  id: null as number | null,
  folderName: '',
  parentId: null as number | null,
  description: '',
  icon: 'folder',
  color: '#1890ff',
  isPublic: false,
  sortOrder: 0,
});
const isEditFolder = ref(false);

const uploadDialogVisible = ref(false);
const uploadForm = ref({
  file: null as File | null,
  folderId: null as number | null,
  documentName: '',
  description: '',
  tags: '',
  isPublic: false,
});
const uploadLoading = ref(false);

const editDialogVisible = ref(false);
const editForm = ref({
  id: null as number | null,
  documentName: '',
  description: '',
  tags: '',
  isPublic: false,
});
const currentEditDocument = ref<DocumentLibraryApi.Document | null>(null);



const moveDialogVisible = ref(false);
const moveTargetFolderId = ref<number | null>(null);
const currentMoveDocument = ref<DocumentLibraryApi.Document | null>(null);

const selectedDocuments = ref<DocumentLibraryApi.Document[]>([]);
const previewVisible = ref(false);
const previewDocumentId = ref<number | null>(null);

const treeProps = {
  children: 'children',
  label: 'name',
};

const safeDocumentList = computed(() => {
  return Array.isArray(documentList.value) ? documentList.value : [];
});

const folderTreeData = computed(() => {
  if (!folderTree.value) return [];
  return [folderTree.value];
});

const fetchFolderTree = async () => {
  try {
    const response = await getFolderTreeApi();
    console.log('📁 文件夹树 API 响应:', response);
    if (response) {
      folderTree.value = response;
      console.log('📁 folderTree.value:', folderTree.value);
    }
  } catch (error) {
    console.error('获取文件夹树失败:', error);
  }
};

const fetchDocumentList = async () => {
  if (!currentFolderId.value && !showMyOnly.value) {
    documentList.value = [];
    subFolders.value = [];
    breadcrumb.value = [];
    return;
  }

  loading.value = true;
  try {
    if (showMyOnly.value) {
      const myDocsRes = await getMyDocumentsApi(pagination.value.page, pagination.value.size);
      if (myDocsRes) {
        documentList.value = myDocsRes.documents || [];
        pagination.value.total = myDocsRes.total || 0;
        pagination.value.page = myDocsRes.page || 1;
        pagination.value.size = myDocsRes.size || 10;
      } else {
        documentList.value = [];
        pagination.value.total = 0;
      }
      subFolders.value = [];
      breadcrumb.value = [];
      return;
    }

    const [folderRes, childrenRes, documentsRes, pathRes] = await Promise.all([
      getFolderDetailApi(currentFolderId.value!),
      getFolderChildrenApi(currentFolderId.value!),
      getFolderDocumentsApi(currentFolderId.value!, pagination.value.page, pagination.value.size),
      getFolderPathApi(currentFolderId.value!),
    ]);

    if (folderRes) {
      currentFolder.value = folderRes;
    }

    if (childrenRes) {
      subFolders.value = Array.isArray(childrenRes) ? childrenRes : [];
    } else {
      subFolders.value = [];
    }

    if (documentsRes) {
      documentList.value = documentsRes.documents || [];
      pagination.value.total = documentsRes.total || 0;
      pagination.value.page = documentsRes.page || 1;
      pagination.value.size = documentsRes.size || 10;
    } else {
      documentList.value = [];
      pagination.value.total = 0;
    }

    if (pathRes) {
      breadcrumb.value = Array.isArray(pathRes) ? pathRes : [];
    } else {
      breadcrumb.value = [];
    }
  } catch (error) {
    console.error('获取文件夹内容失败:', error);
    ElMessage.error('获取文件夹内容失败');
    documentList.value = [];
    subFolders.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleNodeClick = (data: DocumentLibraryApi.FolderTreeNode) => {
  if (data.type === 'folder') {
    currentFolderId.value = data.id;
    pagination.value.page = 1;
    fetchDocumentList();
  }
};

const handleSearch = () => {
  pagination.value.page = 1;
  fetchDocumentList();
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchDocumentList();
};

const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.page = 1;
  fetchDocumentList();
};

const openCreateFolderDialog = (parentId: number | null = null) => {
  isEditFolder.value = false;
  folderForm.value = {
    id: null,
    folderName: '',
    parentId: parentId,
    description: '',
    icon: 'folder',
    color: '#1890ff',
    isPublic: true,
    sortOrder: 0,
  };
  folderDialogVisible.value = true;
};

const openEditFolderDialog = () => {
  if (!currentFolder.value) return;
  isEditFolder.value = true;
  folderForm.value = {
    id: currentFolder.value.id,
    folderName: currentFolder.value.folderName,
    parentId: currentFolder.value.parentId,
    description: currentFolder.value.description || '',
    icon: currentFolder.value.icon || 'folder',
    color: currentFolder.value.color || '#1890ff',
    isPublic: currentFolder.value.isPublic,
    sortOrder: currentFolder.value.sortOrder || 0,
  };
  folderDialogVisible.value = true;
};

const saveFolder = async () => {
  if (!folderForm.value.folderName.trim()) {
    ElMessage.warning('请输入文件夹名称');
    return;
  }

  try {
    if (isEditFolder.value && folderForm.value.id) {
      const response = await updateFolderApi(folderForm.value.id, {
        folderName: folderForm.value.folderName,
        description: folderForm.value.description,
        icon: folderForm.value.icon,
        color: folderForm.value.color,
        isPublic: folderForm.value.isPublic,
        sortOrder: folderForm.value.sortOrder,
      });
      if (response) {
        ElMessage.success('更新成功');
        folderDialogVisible.value = false;
        await fetchFolderTree();
      } else {
        ElMessage.error('更新失败');
      }
    } else {
      const response = await createFolderApi({
        folderName: folderForm.value.folderName,
        parentId: folderForm.value.parentId,
        description: folderForm.value.description,
        icon: folderForm.value.icon,
        color: folderForm.value.color,
        isPublic: folderForm.value.isPublic,
        sortOrder: folderForm.value.sortOrder,
      });
      if (response) {
        ElMessage.success('创建成功');
        folderDialogVisible.value = false;
        await fetchFolderTree();
      } else {
        ElMessage.error('创建失败');
      }
    }
  } catch (error) {
    console.error('保存文件夹失败:', error);
    ElMessage.error('操作失败');
  }
};

const deleteFolder = async () => {
  if (!currentFolderId.value) return;

  try {
    await ElMessageBox.confirm('确定要删除此文件夹吗？文件夹下存在文档或子文件夹时无法删除。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteFolderApi(currentFolderId.value!);
    ElMessage.success('删除成功');
    currentFolderId.value = null;
    await fetchFolderTree();
    await fetchDocumentList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除文件夹失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const openUploadDialog = () => {
  uploadForm.value = {
    file: null,
    folderId: currentFolderId.value,
    documentName: '',
    description: '',
    tags: '',
    isPublic: true,
  };
  uploadDialogVisible.value = true;
};

const handleFileChange = (file: any) => {
  uploadForm.value.file = file.raw;
  if (!uploadForm.value.documentName) {
    uploadForm.value.documentName = file.name.replace(/\.[^/.]+$/, '');
  }
};

const uploadDocument = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  if (!uploadForm.value.folderId) {
    ElMessage.warning('请选择要上传到的文件夹');
    return;
  }

  uploadLoading.value = true;
  try {
    const response = await uploadDocumentApi({
      file: uploadForm.value.file,
      folderId: uploadForm.value.folderId,
      documentName: uploadForm.value.documentName || undefined,
      description: uploadForm.value.description || undefined,
      tags: uploadForm.value.tags || undefined,
      isPublic: uploadForm.value.isPublic,
    });

    if (response && response.code === 200) {
      ElMessage.success('上传成功');
      uploadDialogVisible.value = false;
      await fetchDocumentList();
    } else {
      ElMessage.error(response?.message || '上传失败');
    }
  } catch (error: any) {
    console.error('上传文档失败:', error);
    ElMessage.error(error?.response?.data?.message || error?.message || '上传失败');
  } finally {
    uploadLoading.value = false;
  }
};

const openEditDialog = (doc: DocumentLibraryApi.Document) => {
  currentEditDocument.value = doc;
  editForm.value = {
    id: doc.id,
    documentName: doc.documentName,
    description: doc.description || '',
    tags: doc.tags || '',
    isPublic: doc.isPublic,
  };
  editDialogVisible.value = true;
};

const saveDocument = async () => {
  if (!editForm.value.documentName.trim()) {
    ElMessage.warning('请输入文档名称');
    return;
  }

  try {
    const response = await updateDocumentApi(editForm.value.id!, {
      documentName: editForm.value.documentName,
      description: editForm.value.description,
      tags: editForm.value.tags,
      isPublic: editForm.value.isPublic,
    });

    if (response) {
      ElMessage.success('更新成功');
      editDialogVisible.value = false;
      await fetchDocumentList();
    } else {
      ElMessage.error('更新失败');
    }
  } catch (error) {
    console.error('更新文档失败:', error);
    ElMessage.error('更新失败');
  }
};

const deleteDocument = async (doc: DocumentLibraryApi.Document) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档"${doc.documentName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteDocumentApi(doc.id);
    ElMessage.success('删除成功');
    await fetchDocumentList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const downloadDocument = async (doc: DocumentLibraryApi.Document) => {
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
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载文档失败:', error);
    ElMessage.error('下载失败');
  }
};

const toggleLock = async (doc: DocumentLibraryApi.Document) => {
  try {
    if (doc.isLocked) {
      await unlockDocumentApi(doc.id);
    } else {
      await lockDocumentApi(doc.id);
    }
    ElMessage.success(doc.isLocked ? '解锁成功' : '锁定成功');
    await fetchDocumentList();
  } catch (error) {
    console.error('锁定/解锁失败:', error);
    ElMessage.error('操作失败');
  }
};

const toggleFavorite = async (doc: DocumentLibraryApi.Document) => {
  try {
    if (doc.isFavorited) {
      await removeFavoriteApi(doc.id);
    } else {
      await addFavoriteApi(doc.id);
    }
    ElMessage.success(doc.isFavorited ? '已取消收藏' : '已添加收藏');
    await fetchDocumentList();
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败');
  }
};



const openPreview = (doc: DocumentLibraryApi.Document) => {
  previewDocumentId.value = doc.id;
  previewVisible.value = true;
};

const handleSelectionChange = (selection: DocumentLibraryApi.Document[]) => {
  selectedDocuments.value = selection;
};

const clearSelection = () => {
  selectedDocuments.value = [];
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

watch(showMyOnly, () => {
  pagination.value.page = 1;
  fetchDocumentList();
});

onMounted(() => {
  fetchFolderTree();
  fetchDocumentList();
});
</script>

<template>
  <div class="document-library p-4">
    <ElCard class="h-full">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon icon="lucide:folder-archive" class="text-2xl text-primary" />
            <span class="text-xl font-semibold">文档库</span>
            <ElSwitch
              v-model="showMyOnly"
              active-text="仅看我的"
              inactive-text=""
              class="ml-4"
            />
          </div>
          <div class="flex items-center gap-2">
            <BatchOperations
              :selected-documents="selectedDocuments"
              :current-folder-id="currentFolderId"
              @refresh="fetchDocumentList"
              @clear-selection="clearSelection"
            />
            <ElButton type="primary" @click="openUploadDialog">
              <Icon icon="lucide:upload" class="mr-1" />
              上传文档
            </ElButton>
            <ElButton @click="openCreateFolderDialog(currentFolderId)">
              <Icon icon="lucide:folder-plus" class="mr-1" />
              新建文件夹
            </ElButton>
            <ElButton @click="fetchDocumentList" :loading="loading">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <div class="flex gap-4 h-[calc(100vh-220px)]">
        <div class="w-64 flex-shrink-0 border-r pr-4">
          <div class="mb-4">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索文档..."
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #append>
                <ElButton @click="handleSearch">
                  <Icon icon="lucide:search" />
                </ElButton>
              </template>
            </ElInput>
          </div>

          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600">文件夹</span>
            <ElButton
              v-if="currentFolderId"
              type="primary"
              link
              size="small"
              @click="openEditFolderDialog"
            >
              编辑
            </ElButton>
          </div>

          <ElTree
            :data="folderTreeData"
            :props="treeProps"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
            class="folder-tree"
          >
            <template #default="{ node, data }">
              <ElTooltip 
                placement="right" 
                :disabled="!data.createUserName && !data.createTime"
              >
                <template #content>
                  <div v-if="data.createUserName">创建者: {{ data.createUserName }}</div>
                  <div v-if="data.createTime">创建时间: {{ formatDate(data.createTime) }}</div>
                  <div v-if="data.documentCount">文档数: {{ data.documentCount }}</div>
                </template>
                <div class="folder-node" :style="{ borderLeftColor: data.color || '#d9d9d9' }">
                  <div class="flex items-center gap-2">
                    <Icon
                      :icon="data.icon || (data.type === 'root' ? 'lucide:database' : 'lucide:folder')"
                      class="text-lg folder-icon"
                      :style="{ color: data.color || (data.type === 'root' ? '#1890ff' : '#f5c542') }"
                    />
                    <span>{{ data.name }}</span>
                    <span v-if="data.documentCount" class="text-xs text-gray-400">
                      ({{ data.documentCount }})
                    </span>
                    <ElTag v-if="data.isPublic === false" type="info" size="small" class="ml-1">
                      <Icon icon="lucide:lock" class="mr-1" />
                      私有
                    </ElTag>
                  </div>
                </div>
              </ElTooltip>
            </template>
          </ElTree>

          <div v-if="currentFolderId" class="mt-4 pt-4 border-t">
            <ElButton type="danger" link size="small" @click="deleteFolder">
              <Icon icon="lucide:trash-2" class="mr-1" />
              删除当前文件夹
            </ElButton>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-w-0">
          <div class="mb-4 flex items-center gap-4">
            <ElSelect
              v-model="documentTypeFilter"
              placeholder="文档类型"
              clearable
              style="width: 120px"
              @change="handleSearch"
            >
              <ElOption label="Word" value="WORD" />
              <ElOption label="Excel" value="EXCEL" />
              <ElOption label="PDF" value="PDF" />
              <ElOption label="其他" value="OTHER" />
            </ElSelect>

            <ElSelect
              v-model="statusFilter"
              placeholder="状态"
              clearable
              style="width: 120px"
              @change="handleSearch"
            >
              <ElOption label="正常" value="ACTIVE" />
              <ElOption label="已归档" value="ARCHIVED" />
            </ElSelect>
          </div>

          <ElTable
            ref="tableRef"
            :data="safeDocumentList"
            v-loading="loading"
            stripe
            border
            size="small"
            class="flex-1"
            @selection-change="handleSelectionChange"
          >
            <template #empty>
              <ElEmpty description="暂无文档" />
            </template>

            <ElTableColumn type="selection" width="55" />

            <ElTableColumn prop="documentName" label="文档名称" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <Icon
                    :icon="getDocumentTypeIcon(row.documentType)"
                    class="text-xl"
                    :style="{ color: getDocumentTypeColor(row.documentType) }"
                  />
                  <span>{{ row.documentName }}</span>
                  <ElTag v-if="row.isLocked" type="warning" size="small">
                    <Icon icon="lucide:lock" class="mr-1" />
                    已锁定
                  </ElTag>
                  <ElTag v-if="row.isPublic === false" type="info" size="small">
                    <Icon icon="lucide:lock" class="mr-1" />
                    私有
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="documentType" label="类型" width="100" align="center">
              <template #default="{ row }">
                <ElTag :type="getDocumentTypeTag(row.documentType).type" size="small">
                  {{ getDocumentTypeTag(row.documentType).label }}
                </ElTag>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="fileSize" label="大小" width="100" align="center">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </ElTableColumn>

            <ElTableColumn prop="folderName" label="所属文件夹" width="150" show-overflow-tooltip />

            <ElTableColumn prop="createTime" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </ElTableColumn>

            <ElTableColumn prop="downloadCount" label="下载次数" width="100" align="center" />

            <ElTableColumn prop="viewCount" label="查看次数" width="100" align="center" />

            <ElTableColumn label="操作" width="320" fixed="right">
              <template #default="{ row }">
                <div class="flex flex-wrap gap-1">
                  <ElButton type="primary" size="small" @click="openPreview(row)">
                    <Icon icon="lucide:eye" class="mr-1" />
                    预览
                  </ElButton>
                  <ElButton size="small" @click="downloadDocument(row)">
                    <Icon icon="lucide:download" class="mr-1" />
                    下载
                  </ElButton>
                  <ElDropdown trigger="click">
                    <ElButton size="small">
                      更多
                      <Icon icon="lucide:chevron-down" class="ml-1" />
                    </ElButton>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem @click="openEditDialog(row)">
                          <Icon icon="lucide:edit" class="mr-2" />
                          编辑
                        </ElDropdownItem>
                        <ElDropdownItem @click="toggleLock(row)">
                          <Icon :icon="row.isLocked ? 'lucide:unlock' : 'lucide:lock'" class="mr-2" />
                          {{ row.isLocked ? '解锁' : '锁定' }}
                        </ElDropdownItem>
                        <ElDropdownItem @click="toggleFavorite(row)">
                          <Icon
                            :icon="row.isFavorited ? 'lucide:star-off' : 'lucide:star'"
                            class="mr-2"
                          />
                          {{ row.isFavorited ? '取消收藏' : '收藏' }}
                        </ElDropdownItem>
                        <ElDropdownItem divided @click="deleteDocument(row)">
                          <Icon icon="lucide:trash-2" class="mr-2 text-red-500" />
                          <span class="text-red-500">删除</span>
                        </ElDropdownItem>
                      </ElDropdownMenu>
                    </template>
                  </ElDropdown>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="mt-4 flex justify-end">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="folderDialogVisible"
      :title="isEditFolder ? '编辑文件夹' : '新建文件夹'"
      width="500px"
    >
      <ElForm :model="folderForm" label-width="100px">
        <ElFormItem label="文件夹名称" required>
          <ElInput v-model="folderForm.folderName" placeholder="请输入文件夹名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="folderForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </ElFormItem>
        <ElFormItem label="颜色">
          <ElInput v-model="folderForm.color" type="color" style="width: 100px" />
        </ElFormItem>
        <ElFormItem label="是否公开">
          <ElSwitch v-model="folderForm.isPublic" />
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInput v-model.number="folderForm.sortOrder" type="number" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="folderDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveFolder">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="uploadDialogVisible" title="上传文档" width="500px">
      <ElForm :model="uploadForm" label-width="100px">
        <ElFormItem label="选择文件" required>
          <ElUpload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".doc,.docx,.xls,.xlsx,.pdf"
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
        <ElFormItem label="文档名称">
          <ElInput v-model="uploadForm.documentName" placeholder="默认使用文件名" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </ElFormItem>
        <ElFormItem label="标签">
          <ElInput v-model="uploadForm.tags" placeholder="多个标签用逗号分隔" />
        </ElFormItem>
        <ElFormItem label="是否公开">
          <ElSwitch v-model="uploadForm.isPublic" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="uploadDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploadLoading" @click="uploadDocument">
          上传
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="editDialogVisible" title="编辑文档" width="500px">
      <ElForm :model="editForm" label-width="100px">
        <ElFormItem label="文档名称" required>
          <ElInput v-model="editForm.documentName" placeholder="请输入文档名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </ElFormItem>
        <ElFormItem label="标签">
          <ElInput v-model="editForm.tags" placeholder="多个标签用逗号分隔" />
        </ElFormItem>
        <ElFormItem label="是否公开">
          <ElSwitch v-model="editForm.isPublic" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveDocument">保存</ElButton>
      </template>
    </ElDialog>

    <DocumentPreview
      v-if="previewDocumentId"
      :document-id="previewDocumentId"
      v-model:visible="previewVisible"
      @close="previewVisible = false"
    />
  </div>
</template>

<style scoped>
.document-library {
  height: calc(100vh - 100px);
}

.document-library :deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.document-library :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
}

.folder-tree {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.folder-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
  margin: 2px 0;
  padding-left: 8px;
}

.folder-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.folder-tree :deep(.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}

.folder-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 8px;
  border-left: 3px solid;
  transition: all 0.2s;
}

.folder-node:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.folder-node:deep(.el-tag--info) {
  opacity: 0.8;
  font-size: 11px;
}

@media (max-width: 768px) {
  .document-library {
    padding: 0.5rem;
  }

  .document-library :deep(.el-card__header) {
    padding: 0.75rem;
  }

  .document-library :deep(.el-card__header) .flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .document-library :deep(.el-card__header) .flex:last-child {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
