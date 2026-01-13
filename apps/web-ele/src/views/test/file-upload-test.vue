<template>
  <div class="file-test-container">
    <el-card class="header-card">
      <h2>文件上传API测试页面</h2>
      <p class="description">测试所有文件相关接口功能</p>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>1. 文件上传（单文件和多文件）</span>
            </div>
          </template>

          <el-form :model="uploadForm" label-width="120px">
            <el-form-item label="业务类型">
              <el-select v-model="uploadForm.bizType" placeholder="请选择业务类型">
                <el-option label="案件文件" value="case" />
                <el-option label="债权人文件" value="creditor" />
                <el-option label="债务人文件" value="debtor" />
                <el-option label="债权申报文件" value="claim" />
                <el-option label="公告文件" value="announcement" />
                <el-option label="资金文件" value="fund" />
                <el-option label="通用文件" value="common" />
              </el-select>
            </el-form-item>

            <el-form-item label="业务ID">
              <el-input-number v-model="uploadForm.bizId" :min="1" placeholder="请输入业务ID" />
            </el-form-item>

            <el-form-item label="单文件上传">
              <el-upload
                ref="singleUploadRef"
                :auto-upload="false"
                :on-change="handleSingleFileChange"
                :limit="1"
                :file-list="singleFileList"
              >
                <el-button type="primary">选择文件</el-button>
              </el-upload>
              <el-button type="success" @click="handleSingleUpload" :loading="singleUploading">
                上传单文件
              </el-button>
            </el-form-item>

            <el-form-item label="多文件上传">
              <el-upload
                ref="multipleUploadRef"
                :auto-upload="false"
                :on-change="handleMultipleFileChange"
                :multiple="true"
                :file-list="multipleFileList"
              >
                <el-button type="primary">选择多个文件</el-button>
              </el-upload>
              <el-button type="success" @click="handleMultipleUpload" :loading="multipleUploading">
                批量上传
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>2. 文件列表查询（带分页）</span>
            </div>
          </template>

          <el-form :model="queryForm" label-width="120px" inline>
            <el-form-item label="业务类型">
              <el-select v-model="queryForm.bizType" placeholder="请选择业务类型" clearable>
                <el-option label="案件文件" value="case" />
                <el-option label="债权人文件" value="creditor" />
                <el-option label="债务人文件" value="debtor" />
                <el-option label="债权申报文件" value="claim" />
                <el-option label="公告文件" value="announcement" />
                <el-option label="资金文件" value="fund" />
                <el-option label="通用文件" value="common" />
              </el-select>
            </el-form-item>

            <el-form-item label="业务ID">
              <el-input-number v-model="queryForm.bizId" :min="1" placeholder="请输入业务ID" />
            </el-form-item>

            <el-form-item label="状态">
              <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
                <el-option label="激活" value="ACTIVE" />
                <el-option label="停用" value="INACTIVE" />
              </el-select>
            </el-form-item>

            <el-form-item label="页码">
              <el-input-number v-model="queryForm.pageNum" :min="1" />
            </el-form-item>

            <el-form-item label="每页大小">
              <el-input-number v-model="queryForm.pageSize" :min="1" :max="100" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery" :loading="queryLoading">
                查询
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="fileList" border style="width: 100%; margin-top: 20px">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="originalFileName" label="文件名" min-width="200" />
            <el-table-column prop="fileSize" label="文件大小" width="120">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column prop="fileExtension" label="扩展名" width="100" />
            <el-table-column prop="bizType" label="业务类型" width="120" />
            <el-table-column prop="bizId" label="业务ID" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleDownload(row)">下载</el-button>
                <el-button size="small" @click="handlePreview(row)" :disabled="!canPreview(row)">
                  预览
                </el-button>
                <el-button size="small" type="warning" @click="handleRename(row)">
                  重命名
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
                <el-button size="small" type="info" @click="handleUpdateStatus(row)">
                  更新状态
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="queryForm.pageNum"
            v-model:page-size="queryForm.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleQuery"
            @current-change="handleQuery"
            style="margin-top: 20px; justify-content: center"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>3. 文件统计信息</span>
            </div>
          </template>

          <el-form :model="statisticsForm" label-width="120px" inline>
            <el-form-item label="业务类型">
              <el-select v-model="statisticsForm.bizType" placeholder="请选择业务类型" clearable>
                <el-option label="案件文件" value="case" />
                <el-option label="债权人文件" value="creditor" />
                <el-option label="债务人文件" value="debtor" />
                <el-option label="债权申报文件" value="claim" />
                <el-option label="公告文件" value="announcement" />
                <el-option label="资金文件" value="fund" />
                <el-option label="通用文件" value="common" />
              </el-select>
            </el-form-item>

            <el-form-item label="业务ID">
              <el-input-number v-model="statisticsForm.bizId" :min="1" placeholder="请输入业务ID" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleGetStatistics" :loading="statisticsLoading">
                获取统计
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="statisticsData" class="statistics-content">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="总文件数">
                {{ statisticsData.totalFiles }}
              </el-descriptions-item>
              <el-descriptions-item label="总大小">
                {{ statisticsData.totalSizeMB }} MB
              </el-descriptions-item>
              <el-descriptions-item label="总字节数">
                {{ statisticsData.totalSize }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider>状态统计</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card>
                  <h4>按状态</h4>
                  <div v-for="(count, status) in statisticsData.statusCount" :key="status">
                    <el-tag :type="status === 'ACTIVE' ? 'success' : 'info'" style="margin: 5px">
                      {{ status }}: {{ count }}
                    </el-tag>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <h4>按扩展名</h4>
                  <div v-for="(count, ext) in statisticsData.extensionCount" :key="ext">
                    <el-tag style="margin: 5px">
                      {{ ext }}: {{ count }}
                    </el-tag>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="renameDialogVisible" title="文件重命名" width="500px">
      <el-form :model="renameForm" label-width="100px">
        <el-form-item label="新文件名">
          <el-input v-model="renameForm.newFileName" placeholder="请输入新文件名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename" :loading="renameLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" title="更新文件状态" width="500px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option label="激活" value="ACTIVE" />
            <el-option label="停用" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus" :loading="statusLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewDialogVisible" title="文件预览" width="80%" top="5vh">
      <div v-if="previewUrl" class="preview-container">
        <iframe v-if="previewType === 'pdf'" :src="previewUrl" width="100%" height="600px" />
        <img v-else-if="previewType === 'image'" :src="previewUrl" style="max-width: 100%; max-height: 600px" />
        <div v-else class="preview-error">
          <el-result icon="error" title="不支持预览" sub-title="该文件类型不支持在线预览，请下载后查看" />
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
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
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
  ElResult,
} from 'element-plus';
import type { UploadFile, UploadUserFile } from 'element-plus';

import {
  uploadFileApi,
  batchUploadFilesApi,
  getFileListApi,
  downloadFileApi,
  deleteFileApi,
  renameFileApi,
  updateFileStatusApi,
  getFilePreviewUrl,
  getFileStatisticsApi,
} from '#/api/core/file';

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

const singleFileList = ref<UploadFile[]>([]);
const multipleFileList = ref<UploadFile[]>([]);
const fileList = ref<any[]>([]);
const total = ref(0);

const singleUploading = ref(false);
const multipleUploading = ref(false);
const queryLoading = ref(false);
const statisticsLoading = ref(false);

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

    const response = await uploadFileApi(file, uploadForm.bizType, uploadForm.bizId);

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
    const files = multipleFileList.value.map(f => f.raw).filter((f): f is File => f !== undefined);

    const response = await batchUploadFilesApi(files, uploadForm.bizType, uploadForm.bizId);

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

    if (file.fileExtension?.toLowerCase() === 'pdf') {
      previewType.value = 'pdf';
    } else {
      previewType.value = 'image';
    }

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
    const response = await renameFileApi(currentFile.value.id, renameForm.newFileName);

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
    const response = await updateFileStatusApi(currentFile.value.id, statusForm.status);

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
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

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
