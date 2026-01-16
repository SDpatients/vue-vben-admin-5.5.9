# 案件卷宗归档API迁移说明

## 📋 概述

本文档说明案件详情页面的 `ArchiveDrawer.vue` 组件如何从旧的 `file` API 迁移到新的 `archive` API，确保正确调用API和处理返回值。

## 🔄 API迁移对照表

### 1. 获取归档分类树

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | 无（硬编码） | `getCategoryTreeApi()` |
| 数据来源 | 硬编码的树形结构 | 后端API返回 |
| 返回值 | 静态数据 | `ArchiveApi.Category[]` |

**新API调用**：
```typescript
async function loadCategoryTree() {
  try {
    const response = await getCategoryTreeApi();
    if (response.code === 200) {
      categoryTree.value = response.data;
    }
  } catch (error) {
    ElMessage.error('加载归档分类失败');
  }
}
```

**返回值结构**：
```typescript
interface Category {
  id: number;
  categoryCode: string;      // 分类代码，如 "0-1-1"
  categoryName: string;      // 分类名称
  parentId: number | null;   // 父级分类ID
  level: number;            // 分类层级（1-3）
  sortOrder: number;        // 排序号
  isRequired: boolean;      // 是否必填
  status: string;           // 状态
  description: string;      // 分类描述
  children?: Category[];    // 子分类
}
```

### 2. 获取归档文件列表

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | `getFileListApi()` | `getArchiveFilesApi()` |
| 参数 | `(bizType, bizId, pageNum, pageSize, status)` | `(caseId, params)` |
| 返回值 | `FileRecord[]` | `ArchiveRecord[]` |
| 数据筛选 | 前端按filePath筛选 | 后端按categoryCode筛选 |

**新API调用**：
```typescript
const loadFileList = async (categoryCode: string) => {
  fileListLoading.value = true;
  try {
    const params: ArchiveListQueryParams = {
      categoryCode,
      pageNum: 1,
      pageSize: 100,
      status: 'ACTIVE',
    };
    const response = await getArchiveFilesApi(Number(props.caseId), params);
    if (response.code === 200) {
      fileList.value = response.data.list || [];
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败');
    fileList.value = [];
  } finally {
    fileListLoading.value = false;
  }
};
```

**返回值结构**：
```typescript
interface ArchiveRecord {
  id: number;
  caseId: number;
  categoryCode: string;
  categoryName: string;
  fileId: number;
  archiveNo: string;              // 归档编号
  fileTitle: string;              // 文件标题
  fileDescription: string;        // 文件描述
  uploadUserId: number;
  uploadUserName: string;
  uploadTime: string;
  status: string;
  isConfidential: boolean;         // 是否机密
  accessLevel: string;            // 访问级别
  version: number;                // 版本号
  parentVersionId: number | null; // 父版本ID
  file: FileInfo;                 // 文件信息
}

interface FileInfo {
  id: number;
  originalFileName: string;  // 原始文件名
  fileSize: number;          // 文件大小（字节）
  fileExtension: string;     // 文件扩展名
  mimeType: string;          // MIME类型
}
```

### 3. 上传归档文件

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | `uploadFileApi()` | `uploadArchiveFileApi()` |
| 参数 | `(file, bizType, bizId)` | `(caseId, data)` |
| 请求体 | FormData (file, bizType, bizId) | FormData (file, categoryCode, fileTitle, fileDescription, isConfidential, accessLevel) |
| 返回值 | `FileRecord` | `ArchiveRecord` |

**新API调用**：
```typescript
const uploadFiles = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  if (!uploadFormRef.value) return;

  try {
    await uploadFormRef.value.validate();
  } catch {
    return;
  }

  if (!uploadForm.value.file) {
    ElMessage.error('请选择文件');
    return;
  }

  uploadLoading.value = true;
  try {
    const response = await uploadArchiveFileApi(Number(props.caseId), uploadForm.value);
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      uploadDialogVisible.value = false;
      uploadFileList.value = [];
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    ElMessage.error('上传文件失败');
  } finally {
    uploadLoading.value = false;
  }
};
```

**请求参数**：
```typescript
interface UploadArchiveRequest {
  file: File;                    // 文件对象
  categoryCode: string;            // 归档分类代码
  fileTitle?: string;              // 文件标题
  fileDescription?: string;        // 文件描述
  isConfidential?: boolean;        // 是否机密
  accessLevel?: string;           // 访问级别（PUBLIC/INTERNAL/CONFIDENTIAL/TOP_SECRET）
}
```

### 4. 下载归档文件

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | `downloadFileApi()` | `downloadArchiveFileApi()` |
| 参数 | `(fileId)` | `(fileId)` |
| 返回值 | Blob | Blob |
| 文件名 | `file.originalFileName` | `file.file.originalFileName` |

**新API调用**：
```typescript
const downloadFile = async (file: ArchiveApi.ArchiveRecord) => {
  try {
    const blob = await downloadArchiveFileApi(file.fileId);
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = file.file.originalFileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载开始');
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};
```

### 5. 预览归档文件

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | 直接打开URL | `previewArchiveFileApi()` |
| 参数 | `file.id` | `file.fileId` |
| 返回值 | 无 | Blob |
| 预览方式 | 新窗口打开URL | Blob转URL后打开 |

**新API调用**：
```typescript
const previewFile = async (file: ArchiveApi.ArchiveRecord) => {
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  if (previewableExtensions.includes(file.file.fileExtension.toLowerCase())) {
    try {
      const blob = await previewArchiveFileApi(file.fileId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('预览文件失败:', error);
      ElMessage.error('预览文件失败');
    }
  } else {
    ElMessage.info('该文件类型不支持在线预览，建议下载后查看');
  }
};
```

### 6. 删除归档文件

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | `deleteFileApi()` | `deleteArchiveRecordApi()` |
| 参数 | `(fileId)` | `(recordId)` |
| 返回值 | `{ code, message, data }` | `{ code, message, data }` |

**新API调用**：
```typescript
const deleteFile = async (file: ArchiveApi.ArchiveRecord) => {
  try {
    const response = await deleteArchiveRecordApi(file.id);
    if (response.code === 200) {
      ElMessage.success('文件删除成功');
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    } else {
      ElMessage.error(`文件删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除文件失败:', error);
    ElMessage.error('删除文件失败');
  }
};
```

### 7. 更新归档记录

| 项目 | 旧API | 新API |
|------|--------|--------|
| 函数名 | 无 | `updateArchiveRecordApi()` |
| 参数 | 无 | `(recordId, data)` |
| 请求体 | 无 | `{ fileTitle?, fileDescription?, isConfidential?, accessLevel? }` |
| 返回值 | 无 | `ArchiveRecord` |

**新API调用**：
```typescript
const handleEditSubmit = async () => {
  if (!editFormRef.value || !currentRecord.value) return;

  try {
    await editFormRef.value.validate();
  } catch {
    return;
  }

  try {
    const response = await updateArchiveRecordApi(currentRecord.value.id, editForm.value);
    if (response.code === 200) {
      ElMessage.success('更新成功');
      editDialogVisible.value = false;
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败');
  }
};
```

**请求参数**：
```typescript
interface UpdateArchiveRequest {
  fileTitle?: string;
  fileDescription?: string;
  isConfidential?: boolean;
  accessLevel?: string;
}
```

## 📊 数据结构变化

### TreeNode接口变化

**旧接口**：
```typescript
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  bizType?: string;
  bizId?: number;
  category?: string;
}
```

**新接口**：
```typescript
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  categoryCode?: string;  // 从 category 改为 categoryCode
}
```

### FileRecord → ArchiveRecord

**旧接口**：
```typescript
interface FileRecord {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  fileExtension: string;
  mimeType: string;
  fileHash: string;
  bizType: string;
  bizId: number;
  uploadTime: string;
  uploadUser: string;
  fileStatus: number;
  isDeleted: boolean;
}
```

**新接口**：
```typescript
interface ArchiveRecord {
  id: number;
  caseId: number;
  categoryCode: string;
  categoryName: string;
  fileId: number;
  archiveNo: string;
  fileTitle: string;
  fileDescription: string;
  uploadUserId: number;
  uploadUserName: string;
  uploadTime: string;
  status: string;
  isConfidential: boolean;
  accessLevel: string;
  version: number;
  parentVersionId: number | null;
  file: FileInfo;
}
```

## 🎯 新增功能

### 1. 文件编辑功能
- 新增编辑归档记录功能
- 可以修改文件标题、描述、访问级别、机密标记

### 2. 访问级别控制
- 支持四级访问级别：PUBLIC、INTERNAL、CONFIDENTIAL、TOP_SECRET
- 在列表中显示访问级别标签

### 3. 机密标记
- 支持标记文件为机密
- 在列表中显示机密标记

### 4. 归档编号
- 新增归档编号字段
- 在列表中显示归档编号

### 5. 归档分类显示
- 显示归档分类名称
- 从后端API获取分类树

## 🔧 工具函数

### 文件格式验证
```typescript
validateFileFormat(fileName: string): boolean
```
验证文件格式是否在支持的格式列表中。

### 文件大小验证
```typescript
validateFileSize(fileSize: number): boolean
```
验证文件大小是否超过50MB限制。

### 文件大小格式化
```typescript
formatFileSize(bytes: number): string
```
将字节数格式化为可读的文件大小（B、KB、MB）。

## 📝 注意事项

1. **API基础URL**
   - 旧API：使用 `fileUploadRequestClient`
   - 新API：使用 `requestClient8085`
   - 基础URL：`/api/v1`

2. **响应格式**
   - 所有新API统一返回格式：`{ code, message, data }`
   - 成功响应：`code === 200`

3. **文件上传**
   - 使用 `FormData` 进行 `multipart/form-data` 上传
   - 单个文件大小限制：50MB
   - 支持的文件格式：pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, bmp, txt

4. **分类代码**
   - 使用 `categoryCode` 而不是 `category`
   - 分类代码格式：`0-1-1`（一级-二级-三级）

5. **文件信息访问**
   - 文件信息嵌套在 `file` 对象中
   - 原始文件名：`file.file.originalFileName`
   - 文件大小：`file.file.fileSize`
   - 文件扩展名：`file.file.fileExtension`

## ✅ 迁移检查清单

- [x] 更新API导入
- [x] 修改数据类型定义
- [x] 更新获取分类树函数
- [x] 更新获取文件列表函数
- [x] 更新上传文件函数
- [x] 更新下载文件函数
- [x] 更新预览文件函数
- [x] 更新删除文件函数
- [x] 新增编辑归档记录功能
- [x] 更新表格列显示
- [x] 更新上传对话框
- [x] 新增编辑对话框
- [x] 移除未使用的代码
- [x] 更新样式

## 🚀 使用示例

### 在案件详情页面打开归档抽屉

```vue
<template>
  <ElButton @click="openArchiveDrawer">
    案件卷宗归档
  </ElButton>
  <ArchiveDrawer ref="archiveDrawerRef" :case-id="caseId" />
</template>

<script setup>
import { ref } from 'vue';
import ArchiveDrawer from './components/ArchiveDrawer.vue';

const archiveDrawerRef = ref(null);
const caseId = ref('123');

function openArchiveDrawer() {
  archiveDrawerRef.value?.openDrawer();
}
</script>
```

## 📚 相关文档

- [案件卷宗归档API汇总.md](./1月16日案件卷宗API汇总.md) - 完整的API文档
- [案件卷宗归档系统集成说明.md](./案件卷宗归档系统集成说明.md) - 系统集成说明
- [archive.ts](./apps/web-ele/src/api/core/archive.ts) - API接口定义

## 🆘 常见问题

### Q1: 上传文件时提示"不支持的文件格式"
A: 请检查文件格式是否在支持的格式列表中，支持的格式包括：pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, bmp, txt

### Q2: 上传文件时提示"文件大小不能超过50MB"
A: 请压缩文件或分批上传，单个文件大小不能超过50MB

### Q3: 预览文件时显示空白
A: 某些文件格式可能无法在浏览器中直接预览，请尝试下载后使用本地软件打开

### Q4: 归档分类树为空
A: 请检查后端API是否正常返回分类数据，确认网络连接正常

### Q5: 文件列表为空
A: 请确认：
1. 是否选择了具体的归档分类
2. 该分类下是否有文件
3. 检查浏览器控制台是否有错误信息

## 📞 技术支持

如有问题，请联系开发团队或查看项目文档。
