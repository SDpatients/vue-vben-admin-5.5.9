<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';

// 文件上传相关
const uploadedFiles = ref<any[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const fileInputRef = ref<HTMLInputElement | null>(null);
const bizType = ref('common');
const bizId = ref('1');
const filePageNum = ref(1);
const filePageSize = ref(10);
const fileTotal = ref(0);
const showRenameDialog = ref(false);
const currentRenameFile = ref<any>(null);
const newFileName = ref('');

// 检测是否为移动端
const isMobile = ref(false);
const showMobileHint = ref(false);
const isWeChatBrowser = ref(false);
const showWeChatHint = ref(false);

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    await uploadFile(files[0]);
  }
  if (target) {
    target.value = '';
  }
};

const uploadFile = async (file: File) => {
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bizType', bizType.value);
    formData.append('bizId', bizId.value);

    const response = await fetch('/api/v1/file/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件上传成功');
      await loadFileList();
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const loadFileList = async () => {
  try {
    const params = new URLSearchParams({
      pageNum: filePageNum.value.toString(),
      pageSize: filePageSize.value.toString(),
      bizType: bizType.value,
      bizId: bizId.value,
    });

    const response = await fetch(`/api/v1/file/list?${params}`, {
      method: 'GET',
    });

    const result = await response.json();

    if (result.code === 200) {
      uploadedFiles.value = result.data.list;
      fileTotal.value = result.data.total;
    }
  } catch (error: any) {
    console.error('加载文件列表失败:', error);
  }
};

const downloadFile = (fileId: number, fileName: string) => {
  const downloadUrl = `/api/v1/file/download/${fileId}`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.setAttribute('target', '_blank');
  
  // 创建一个XMLHttpRequest来处理下载
  const xhr = new XMLHttpRequest();
  xhr.open('GET', downloadUrl, true);
  xhr.responseType = 'blob';
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };
  
  xhr.send();
};

const deleteFile = async (fileId: number, fileName: string) => {
  if (!confirm(`确定要删除文件 "${fileName}" 吗？`)) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/file/${fileId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件删除成功');
      await loadFileList();
    } else {
      throw new Error(result.message || '删除失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件删除失败');
  }
};

const showRenameFileDialog = (file: any) => {
  currentRenameFile.value = file;
  newFileName.value = file.originalFileName;
  showRenameDialog.value = true;
};

const renameFile = async () => {
  if (!newFileName.value.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('newFileName', newFileName.value);

    const response = await fetch(
      `/api/v1/file/${currentRenameFile.value.id}/rename`,
      {
        method: 'PUT',
        body: formData,
      }
    );

    const result = await response.json();

    if (result.code === 200) {
      ElMessage.success('文件重命名成功');
      showRenameDialog.value = false;
      await loadFileList();
    } else {
      throw new Error(result.message || '重命名失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件重命名失败');
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getFileIcon = (extension: string) => {
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file-text',
    docx: 'lucide:file-text',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
    mp4: 'lucide:video',
    mp3: 'lucide:music',
    zip: 'lucide:archive',
    rar: 'lucide:archive',
  };
  return iconMap[extension.toLowerCase()] || 'lucide:file';
};

onMounted(async () => {
  // 检测移动端和微信浏览器
  const userAgent = navigator.userAgent;
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  isWeChatBrowser.value = /MicroMessenger/i.test(userAgent);
  
  // 检查URL参数，获取业务类型和业务ID
  const urlParams = new URLSearchParams(window.location.search);
  const urlBizType = urlParams.get('bizType');
  const urlBizId = urlParams.get('bizId');
  if (urlBizType) bizType.value = urlBizType;
  if (urlBizId) bizId.value = urlBizId;
  
  if (isWeChatBrowser.value) {
    // 微信浏览器中，显示特殊提示
    showWeChatHint.value = true;
  }
  
  // 加载文件列表
  await loadFileList();
});
</script>

<template>
  <div class="mobile-upload-container">
    <div class="p-4">
      <!-- 业务信息区域 -->
      <div class="mb-6 rounded-lg bg-gray-50 p-4">
        <h4 class="mb-3 font-medium text-gray-700">业务信息</h4>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">业务类型</label>
            <input
              v-model="bizType"
              type="text"
              readonly
              class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">业务ID</label>
            <input
              v-model="bizId"
              type="text"
              readonly
              class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="mb-6">
        <h4 class="mb-3 font-medium text-gray-700">上传文件</h4>
        
        <input
          ref="fileInputRef"
          type="file"
          @change="handleFileChange"
          style="display: none"
        />
        
        <button
          @click="triggerFileUpload"
          :disabled="uploading"
          class="w-full rounded-md bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Icon
            v-if="uploading"
            icon="lucide:loader-2"
            class="mr-2 inline animate-spin"
          />
          {{ uploading ? '上传中...' : '选择文件上传' }}
        </button>
        
        <div v-if="uploading" class="mt-3">
          <div class="mb-1 flex justify-between text-sm">
            <span>上传进度</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="h-2 rounded-full bg-gray-200">
            <div
              class="h-2 rounded-full bg-blue-500 transition-all"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 文件列表区域 -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h4 class="font-medium text-gray-700">已上传文件 ({{ fileTotal }})</h4>
          <button
            @click="loadFileList"
            class="text-sm text-blue-500 hover:text-blue-600"
          >
            刷新
          </button>
        </div>
        
        <div v-if="uploadedFiles.length === 0" class="py-10 text-center text-gray-400">
          暂无文件
        </div>
        
        <div v-else class="space-y-2">
          <div
            v-for="file in uploadedFiles"
            :key="file.id"
            class="rounded border bg-white p-4 shadow-sm"
          >
            <div class="flex flex-col gap-2">
              <div class="flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <Icon
                    :icon="getFileIcon(file.fileExtension)"
                    class="text-2xl text-blue-500"
                  />
                  <span class="font-medium text-gray-900">{{ file.originalFileName }}</span>
                </div>
                <div class="text-sm text-gray-600">
                  <span class="mr-3">{{ formatFileSize(file.fileSize) }}</span>
                  <span>{{ formatDate(file.uploadTime) }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="downloadFile(file.id, file.originalFileName)"
                  class="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
                >
                  下载
                </button>
                <button
                  @click="showRenameFileDialog(file)"
                  class="rounded-md bg-yellow-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-yellow-600"
                >
                  重命名
                </button>
                <button
                  @click="deleteFile(file.id, file.originalFileName)"
                  class="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="fileTotal > filePageSize" class="mt-4 flex justify-center gap-2">
          <button
            @click="filePageNum--"
            :disabled="filePageNum <= 1"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            上一页
          </button>
          <span class="flex items-center px-4 text-sm text-gray-600">
            第 {{ filePageNum }} 页，共 {{ Math.ceil(fileTotal / filePageSize) }} 页
          </span>
          <button
            @click="filePageNum++"
            :disabled="filePageNum >= Math.ceil(fileTotal / filePageSize)"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 文件重命名对话框 -->
    <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">重命名文件</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">新文件名</label>
            <input
              v-model="newFileName"
              type="text"
              placeholder="请输入新文件名"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showRenameDialog = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="renameFile"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 微信浏览器提示对话框 -->
    <div v-if="showWeChatHint" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">微信上传提示</h3>
        <div class="space-y-4">
          <div class="text-center">
            <Icon icon="lucide:message-circle" class="mx-auto mb-3 text-4xl text-green-500" />
            <h4 class="mb-2 font-medium text-gray-900">微信文件上传</h4>
            <p class="text-gray-600">
              检测到您正在使用微信浏览器
            </p>
          </div>
          
          <div class="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <h4 class="mb-2 font-medium text-orange-800 flex items-center gap-2">
              <Icon icon="lucide:alert-triangle" class="text-orange-600" />
              重要提示
            </h4>
            <p class="text-sm text-orange-700 mb-2">
              微信浏览器可能存在安全限制，建议使用系统浏览器进行文件上传，以获得更好的体验。
            </p>
          </div>
          
          <div class="p-4 rounded-lg bg-green-50">
            <h4 class="mb-2 font-medium text-green-800">推荐上传方式：</h4>
            <ol class="list-decimal list-inside space-y-2 text-green-700">
              <li>点击右上角的 <Icon icon="lucide:more-horizontal" class="inline" /> 按钮</li>
              <li>选择 "在浏览器中打开" 选项</li>
              <li>在新打开的浏览器中选择文件上传</li>
              <li>上传完成后可返回微信</li>
            </ol>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showWeChatHint = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-upload-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-upload-container {
    padding-bottom: 20px;
  }
}
</style>