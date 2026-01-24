<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { reactive, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElResult,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  batchUploadFilesApi,
  deleteFileApi,
  downloadFileApi,
  getFileListApi,
  getFilePreviewUrl,
  getFileStatisticsApi,
  renameFileApi,
  updateFileStatusApi,
  uploadFileApi,
} from '#/api/core/file';
import { requestClient } from '#/api/request';

const uploadForm = reactive({
  bizType: 'case',
  bizId: 1,
});

const queryForm = reactive({
  bizType: 'case',
  bizId: 1,
  pageNum: 1,
  pageSize: 10,
  status: '',
});

const statisticsForm = reactive({
  bizType: '',
  bizId: undefined,
});

const cacheForm = reactive({
  cacheName: '',
});

const singleFileList = ref<UploadFile[]>([]);
const multipleFileList = ref<UploadFile[]>([]);
const fileList = ref<any[]>([]);
const total = ref(0);

const singleUploading = ref(false);
const multipleUploading = ref(false);
const queryLoading = ref(false);
const statisticsLoading = ref(false);
const cacheLoading = ref(false);

const renameDialogVisible = ref(false);
const statusDialogVisible = ref(false);
const previewDialogVisible = ref(false);

const currentFile = ref<any>(null);
const renameForm = reactive({ newFileName: '' });
const statusForm = reactive({ status: 'ACTIVE' });

const renameLoading = ref(false);
const statusLoading = ref(false);

const previewUrl = ref('');
const previewType = ref('');
const statisticsData = ref<any>(null);

const handleSingleFileChange = (file: UploadFile) => {
  singleFileList.value = [file];
};

const handleMultipleFileChange = (files: UploadFile[]) => {
  multipleFileList.value = files;
};

const handleSingleUpload = async () => {
  if (singleFileList.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  singleUploading.value = true;
  try {
    const file = singleFileList.value[0].raw;
    if (!file) {
      throw new Error('文件对象不存在');
    }

    const response = await uploadFileApi(
      file,
      uploadForm.bizType,
      uploadForm.bizId,
    );

    if (response.code === 200) {
      ElMessage.success('单文件上传成功');
      singleFileList.value = [];
      await handleQuery();
    } else {
      ElMessage.error(`上传失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`上传失败：${error.message || '未知错误'}`);
  } finally {
    singleUploading.value = false;
  }
};

const handleMultipleUpload = async () => {
  if (multipleFileList.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  multipleUploading.value = true;
  try {
    const files = multipleFileList.value
      .map((f) => f.raw)
      .filter((f): f is File => f !== undefined);

    const response = await batchUploadFilesApi(
      files,
      uploadForm.bizType,
      uploadForm.bizId,
    );

    if (response.code === 200) {
      ElMessage.success(`批量上传成功，共 ${files.length} 个文件`);
      multipleFileList.value = [];
      await handleQuery();
    } else {
      ElMessage.error(`上传失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`上传失败：${error.message || '未知错误'}`);
  } finally {
    multipleUploading.value = false;
  }
};

const handleQuery = async () => {
  queryLoading.value = true;
  try {
    const response = await getFileListApi(
      queryForm.bizType,
      queryForm.bizId,
      queryForm.pageNum,
      queryForm.pageSize,
      queryForm.status || undefined,
    );

    if (response.code === 200) {
      fileList.value = response.data.list;
      total.value = response.data.total;
      ElMessage.success('查询成功');
    } else {
      ElMessage.error(`查询失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`查询失败：${error.message || '未知错误'}`);
  } finally {
    queryLoading.value = false;
  }
};

const handleReset = () => {
  queryForm.bizType = 'case';
  queryForm.bizId = 1;
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  queryForm.status = '';
  fileList.value = [];
  total.value = 0;
};

const handleDownload = async (file: any) => {
  try {
    const blob = await downloadFileApi(file.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalFileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载开始');
  } catch (error: any) {
    ElMessage.error(`下载失败：${error.message || '未知错误'}`);
  }
};

const canPreview = (file: any) => {
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  return previewableExtensions.includes(file.fileExtension?.toLowerCase());
};

const handlePreview = async (file: any) => {
  if (!canPreview(file)) {
    ElMessage.info('该文件类型不支持在线预览');
    return;
  }

  try {
    const url = getFilePreviewUrl(file.id);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('文件加载失败');
    }

    const blob = await response.blob();
    previewUrl.value = window.URL.createObjectURL(blob);

    previewType.value =
      file.fileExtension?.toLowerCase() === 'pdf' ? 'pdf' : 'image';

    previewDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(`预览失败：${error.message || '未知错误'}`);
  }
};

const handleDelete = async (file: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteFileApi(file.id);

    if (response.code === 200) {
      ElMessage.success('删除成功');
      await handleQuery();
    } else {
      ElMessage.error(`删除失败：${response.message}`);
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败：${error.message || '未知错误'}`);
    }
  }
};

const handleRename = (file: any) => {
  currentFile.value = file;
  renameForm.newFileName = file.originalFileName;
  renameDialogVisible.value = true;
};

const confirmRename = async () => {
  if (!renameForm.newFileName.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  renameLoading.value = true;
  try {
    const response = await renameFileApi(
      currentFile.value.id,
      renameForm.newFileName,
    );

    if (response.code === 200) {
      ElMessage.success('重命名成功');
      renameDialogVisible.value = false;
      await handleQuery();
    } else {
      ElMessage.error(`重命名失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`重命名失败：${error.message || '未知错误'}`);
  } finally {
    renameLoading.value = false;
  }
};

const handleUpdateStatus = (file: any) => {
  currentFile.value = file;
  statusForm.status = file.status;
  statusDialogVisible.value = true;
};

const confirmUpdateStatus = async () => {
  statusLoading.value = true;
  try {
    const response = await updateFileStatusApi(
      currentFile.value.id,
      statusForm.status,
    );

    if (response.code === 200) {
      ElMessage.success('状态更新成功');
      statusDialogVisible.value = false;
      await handleQuery();
    } else {
      ElMessage.error(`状态更新失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`状态更新失败：${error.message || '未知错误'}`);
  } finally {
    statusLoading.value = false;
  }
};

const handleGetStatistics = async () => {
  statisticsLoading.value = true;
  try {
    const response = await getFileStatisticsApi(
      statisticsForm.bizType || undefined,
      statisticsForm.bizId,
    );

    if (response.code === 200) {
      statisticsData.value = response.data;
      ElMessage.success('获取统计信息成功');
    } else {
      ElMessage.error(`获取统计信息失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`获取统计信息失败：${error.message || '未知错误'}`);
  } finally {
    statisticsLoading.value = false;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

/**
 * 清除缓存
 */
const handleClearCache = async () => {
  cacheLoading.value = true;
  try {
    let url = '';
    url = cacheForm.cacheName
      ? `/api/v1/admin/cache/clear/${cacheForm.cacheName}`
      : '/api/v1/admin/cache/clear';

    const response = await requestClient.delete(url);

    if (response.code === 200) {
      ElMessage.success('缓存清除成功');
      cacheForm.cacheName = '';
    } else {
      ElMessage.error(`缓存清除失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`缓存清除失败：${error.message || '未知错误'}`);
  } finally {
    cacheLoading.value = false;
  }
};

/**
 * 清除所有缓存
 */
const handleClearAllCache = async () => {
  cacheLoading.value = true;
  try {
    const response = await requestClient.delete('/api/v1/admin/cache/clear');

    if (response.code === 200) {
      ElMessage.success('所有缓存清除成功');
      cacheForm.cacheName = '';
    } else {
      ElMessage.error(`所有缓存清除失败：${response.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`所有缓存清除失败：${error.message || '未知错误'}`);
  } finally {
    cacheLoading.value = false;
  }
};
</script>

<template>
  <div class="file-test-container">
    <ElCard class="header-card">
      <h2>文件上传API测试页面</h2>
      <p class="description">测试所有文件相关接口功能</p>
    </ElCard>

    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span>1. 文件上传（单文件和多文件）</span>
            </div>
          </template>

          <ElForm :model="uploadForm" label-width="120px">
            <ElFormItem label="业务类型">
              <ElSelect
                v-model="uploadForm.bizType"
                placeholder="请选择业务类型"
              >
                <ElOption label="案件文件" value="case" />
                <ElOption label="债权人文件" value="creditor" />
                <ElOption label="债务人文件" value="debtor" />
                <ElOption label="债权申报文件" value="claim" />
                <ElOption label="公告文件" value="announcement" />
                <ElOption label="资金文件" value="fund" />
                <ElOption label="通用文件" value="common" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="业务ID">
              <ElInputNumber
                v-model="uploadForm.bizId"
                :min="1"
                placeholder="请输入业务ID"
              />
            </ElFormItem>

            <ElFormItem label="单文件上传">
              <ElUpload
                ref="singleUploadRef"
                :auto-upload="false"
                :on-change="handleSingleFileChange"
                :limit="1"
                :file-list="singleFileList"
              >
                <ElButton type="primary">选择文件</ElButton>
              </ElUpload>
              <ElButton
                type="success"
                @click="handleSingleUpload"
                :loading="singleUploading"
              >
                上传单文件
              </ElButton>
            </ElFormItem>

            <ElFormItem label="多文件上传">
              <ElUpload
                ref="multipleUploadRef"
                :auto-upload="false"
                :on-change="handleMultipleFileChange"
                :multiple="true"
                :file-list="multipleFileList"
              >
                <ElButton type="primary">选择多个文件</ElButton>
              </ElUpload>
              <ElButton
                type="success"
                @click="handleMultipleUpload"
                :loading="multipleUploading"
              >
                批量上传
              </ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span>2. 文件列表查询（带分页）</span>
            </div>
          </template>

          <ElForm :model="queryForm" label-width="120px" inline>
            <ElFormItem label="业务类型">
              <ElSelect
                v-model="queryForm.bizType"
                placeholder="请选择业务类型"
                clearable
              >
                <ElOption label="案件文件" value="case" />
                <ElOption label="债权人文件" value="creditor" />
                <ElOption label="债务人文件" value="debtor" />
                <ElOption label="债权申报文件" value="claim" />
                <ElOption label="公告文件" value="announcement" />
                <ElOption label="资金文件" value="fund" />
                <ElOption label="通用文件" value="common" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="业务ID">
              <ElInputNumber
                v-model="queryForm.bizId"
                :min="1"
                placeholder="请输入业务ID"
              />
            </ElFormItem>

            <ElFormItem label="状态">
              <ElSelect
                v-model="queryForm.status"
                placeholder="请选择状态"
                clearable
              >
                <ElOption label="激活" value="ACTIVE" />
                <ElOption label="停用" value="INACTIVE" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="页码">
              <ElInputNumber v-model="queryForm.pageNum" :min="1" />
            </ElFormItem>

            <ElFormItem label="每页大小">
              <ElInputNumber v-model="queryForm.pageSize" :min="1" :max="100" />
            </ElFormItem>

            <ElFormItem>
              <ElButton
                type="primary"
                @click="handleQuery"
                :loading="queryLoading"
              >
                查询
              </ElButton>
              <ElButton @click="handleReset">重置</ElButton>
            </ElFormItem>
          </ElForm>

          <ElTable
            :data="fileList"
            border
            style="width: 100%; margin-top: 20px"
          >
            <ElTableColumn prop="id" label="ID" width="80" />
            <ElTableColumn
              prop="originalFileName"
              label="文件名"
              min-width="200"
            />
            <ElTableColumn prop="fileSize" label="文件大小" width="120">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="fileExtension" label="扩展名" width="100" />
            <ElTableColumn prop="bizType" label="业务类型" width="120" />
            <ElTableColumn prop="bizId" label="业务ID" width="100" />
            <ElTableColumn prop="status" label="状态" width="100">
              <template #default="{ row }">
                <ElTag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                  {{ row.status }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="uploadTime" label="上传时间" width="180" />
            <ElTableColumn label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <ElButton size="small" @click="handleDownload(row)">
                  下载
                </ElButton>
                <ElButton
                  size="small"
                  @click="handlePreview(row)"
                  :disabled="!canPreview(row)"
                >
                  预览
                </ElButton>
                <ElButton
                  size="small"
                  type="warning"
                  @click="handleRename(row)"
                >
                  重命名
                </ElButton>
                <ElButton size="small" type="danger" @click="handleDelete(row)">
                  删除
                </ElButton>
                <ElButton
                  size="small"
                  type="info"
                  @click="handleUpdateStatus(row)"
                >
                  更新状态
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <ElPagination
            v-model:current-page="queryForm.pageNum"
            v-model:page-size="queryForm.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleQuery"
            @current-change="handleQuery"
            style="margin-top: 20px; justify-content: center"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span>3. 文件统计信息</span>
            </div>
          </template>

          <ElForm :model="statisticsForm" label-width="120px" inline>
            <ElFormItem label="业务类型">
              <ElSelect
                v-model="statisticsForm.bizType"
                placeholder="请选择业务类型"
                clearable
              >
                <ElOption label="案件文件" value="case" />
                <ElOption label="债权人文件" value="creditor" />
                <ElOption label="债务人文件" value="debtor" />
                <ElOption label="债权申报文件" value="claim" />
                <ElOption label="公告文件" value="announcement" />
                <ElOption label="资金文件" value="fund" />
                <ElOption label="通用文件" value="common" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="业务ID">
              <ElInputNumber
                v-model="statisticsForm.bizId"
                :min="1"
                placeholder="请输入业务ID"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton
                type="primary"
                @click="handleGetStatistics"
                :loading="statisticsLoading"
              >
                获取统计
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div v-if="statisticsData" class="statistics-content">
            <ElDescriptions :column="3" border>
              <ElDescriptionsItem label="总文件数">
                {{ statisticsData.totalFiles }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="总大小">
                {{ statisticsData.totalSizeMB }} MB
              </ElDescriptionsItem>
              <ElDescriptionsItem label="总字节数">
                {{ statisticsData.totalSize }}
              </ElDescriptionsItem>
            </ElDescriptions>

            <ElDivider>状态统计</ElDivider>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElCard>
                  <h4>按状态</h4>
                  <div
                    v-for="(count, status) in statisticsData.statusCount"
                    :key="status"
                  >
                    <ElTag
                      :type="status === 'ACTIVE' ? 'success' : 'info'"
                      style="margin: 5px"
                    >
                      {{ status }}: {{ count }}
                    </ElTag>
                  </div>
                </ElCard>
              </ElCol>
              <ElCol :span="12">
                <ElCard>
                  <h4>按扩展名</h4>
                  <div
                    v-for="(count, ext) in statisticsData.extensionCount"
                    :key="ext"
                  >
                    <ElTag style="margin: 5px"> {{ ext }}: {{ count }} </ElTag>
                  </div>
                </ElCard>
              </ElCol>
            </ElRow>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span>4. 缓存管理</span>
            </div>
          </template>

          <ElForm :model="cacheForm" label-width="120px" inline>
            <ElFormItem label="缓存名称">
              <ElInput
                v-model="cacheForm.cacheName"
                placeholder="请输入缓存名称，为空则清除所有缓存"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton
                type="danger"
                @click="handleClearCache"
                :loading="cacheLoading"
              >
                清除缓存
              </ElButton>
              <ElButton
                type="warning"
                @click="handleClearAllCache"
                :loading="cacheLoading"
              >
                清除所有缓存
              </ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElDialog v-model="renameDialogVisible" title="文件重命名" width="500px">
      <ElForm :model="renameForm" label-width="100px">
        <ElFormItem label="新文件名">
          <ElInput
            v-model="renameForm.newFileName"
            placeholder="请输入新文件名"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="renameDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          @click="confirmRename"
          :loading="renameLoading"
        >
          确定
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="statusDialogVisible" title="更新文件状态" width="500px">
      <ElForm :model="statusForm" label-width="100px">
        <ElFormItem label="状态">
          <ElSelect v-model="statusForm.status" placeholder="请选择状态">
            <ElOption label="激活" value="ACTIVE" />
            <ElOption label="停用" value="INACTIVE" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="statusDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          @click="confirmUpdateStatus"
          :loading="statusLoading"
        >
          确定
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="80%"
      top="5vh"
    >
      <div v-if="previewUrl" class="preview-container">
        <iframe
          v-if="previewType === 'pdf'"
          :src="previewUrl"
          width="100%"
          height="90vh"
        ></iframe>
        <img
          v-else-if="previewType === 'image'"
          :src="previewUrl"
          style="max-width: 100%; max-height: 80vh"
        />
        <div v-else class="preview-error">
          <ElResult
            icon="error"
            title="不支持预览"
            sub-title="该文件类型不支持在线预览，请下载后查看"
          />
        </div>
      </div>
      <template #footer>
        <ElButton @click="previewDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.file-test-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-card h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.statistics-content {
  margin-top: 20px;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.preview-error {
  width: 100%;
  text-align: center;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

:deep(.el-upload-list__item) {
  margin-bottom: 5px;
}
</style>
