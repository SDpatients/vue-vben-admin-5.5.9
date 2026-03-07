# 工作日志和公告管理手机上传功能实现

## 已完成的修改

### 1. 工作日志模块（case-detail/index.vue）

#### 修改内容
在 `saveWorkLog` 函数中添加了转移手机上传临时文件的逻辑，支持新增和修改两种场景。

#### 新增逻辑（第 477-492 行）
```typescript
if (response.code === 200 && response.data) {
  const workLogId = response.data.id;
  
  // 1. 首先转移手机上传的临时文件（如果有）
  if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
    console.log('发现手机上传的临时文件，开始转移...');
    const transferredFiles = await fileUploadRef.value.transferMobileFiles(workLogId);
    console.log('转移成功的文件:', transferredFiles);
  }
  
  // 2. 上传本地文件（电脑选择的文件）
  if (fileUploadRef.value && workLogForm.files.length > 0) {
    await fileUploadRef.value.uploadLocalFiles(workLogId);
  }
  ElMessage.success('工作日志创建成功');
  await fetchWorkLogs();
}
```

#### 修改逻辑（第 457-464 行）
```typescript
if (response.code === 200) {
  // 1. 首先转移手机上传的临时文件（如果有）
  if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
    console.log('发现手机上传的临时文件，开始转移...');
    const transferredFiles = await fileUploadRef.value.transferMobileFiles(currentWorkLogId.value);
    console.log('转移成功的文件:', transferredFiles);
  }
  
  // 2. 上传本地文件（电脑选择的文件）
  if (fileUploadRef.value && workLogForm.files.length > 0) {
    await fileUploadRef.value.uploadLocalFiles(currentWorkLogId.value);
  }
  ElMessage.success('工作日志更新成功');
  await fetchWorkLogs();
}
```

### 2. 公告管理模块（announcement-list/index.vue）

#### 现有实现
公告管理模块已经实现了完整的手机上传功能（第 420-650 行）。

#### 工作流程
```typescript
// 检测手机上传的文件
const mobileFiles = publishForm.value.attachments.filter((f: LocalFileItem) => {
  return f.id.startsWith('mobile-');
});

// 如果有手机上传的文件
if (mobileFiles.length > 0) {
  // 第一步：先创建公告（不含文件）
  const announcementResponse = await createAnnouncementApi({...});
  const announcementId = announcementResponse.data.announcementId || announcementResponse.data.id;
  
  // 第二步：转移手机上传的文件
  if (fileUploadRef.value) {
    const transferResult = await fileUploadRef.value.transferMobileFiles(announcementId);
  }
  
  ElMessage.success('公告发布成功');
}
```

## 功能说明

### 工作日志模块

#### 新增工作日志
1. 用户点击"新增工作日志"按钮
2. 填写工作日志基本信息
3. 可以点击"手机上传"按钮生成二维码
4. 使用手机扫描二维码上传文件
5. 文件显示在附件列表中
6. 点击"保存"按钮
7. 系统先创建工作日志记录
8. 自动检测并转移手机上传的临时文件
9. 上传电脑选择的文件
10. 所有文件关联到工作日志

#### 修改工作日志
1. 用户点击"编辑"按钮
2. 修改工作日志基本信息
3. 可以添加新的手机上传文件
4. 点击"保存"按钮
5. 系统先更新工作日志基本信息
6. 自动检测并转移手机上传的临时文件
7. 上传电脑选择的新文件
8. 所有文件关联到工作日志

### 公告管理模块

#### 新增公告
1. 用户点击"发布公告"按钮
2. 填写公告基本信息
3. 可以点击"手机上传"按钮生成二维码
4. 使用手机扫描二维码上传文件
5. 文件显示在附件列表中
6. 点击"发布"按钮
7. 系统检测是否有手机上传的文件
8. 如果有，先创建公告记录
9. 然后转移手机上传的临时文件
10. 如果只有电脑文件，直接使用 with-files 接口创建并上传

## 核心代码模式

两个模块都使用了相同的代码模式：

```typescript
// 1. 检查是否有未转移的临时文件
if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
  // 2. 转移手机上传的临时文件
  const transferredFiles = await fileUploadRef.value.transferMobileFiles(bizId);
}

// 3. 上传本地文件（电脑选择的文件）
if (fileUploadRef.value && files.length > 0) {
  await fileUploadRef.value.uploadLocalFiles(bizId);
}
```

## FileUpload 组件配置

两个模块都使用了相同的 FileUpload 组件配置：

```vue
<FileUpload
  ref="fileUploadRef"
  v-model="form.files"
  :biz-type="'work_log'"  <!-- 或 'announcement' -->
  :biz-id="0"
  accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.xls,.xlsx"
  :max-size="50 * 1024 * 1024"
  :multiple="true"
  title="附件"
  :disabled="false"
  :local-mode="true"
/>
```

## 注意事项

1. **bizType 的设置**：
   - 工作日志：`'work_log'`
   - 公告管理：`'announcement'`

2. **bizId 的处理**：
   - 新增时设置为 `0`
   - 创建业务记录后，使用返回的 ID 转移文件

3. **文件上传顺序**：
   - 先转移手机上传的临时文件
   - 再上传电脑选择的文件
   - 这样可以确保所有文件都正确关联到业务记录

4. **错误处理**：
   - 转移失败不影响本地文件上传
   - 每个步骤都有独立的错误处理

## 参考文档
- `docs/file-upload-guide.md` - 完整的文件上传实现指南
- `docs/claim-registration-mobile-upload.md` - 债权申报表的实现示例
- `docs/bankruptcy-process-mobile-upload-changes.md` - 流程处理模块的实现示例
