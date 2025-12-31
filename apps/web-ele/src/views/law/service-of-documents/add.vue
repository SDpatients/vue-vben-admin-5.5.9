<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';

import { createDocumentApi, uploadDocumentAttachmentApi } from '#/api/core';

import RichTextEditor from '../../../components/RichTextEditor.vue';

const router = useRouter();

const formRef = ref();
const fileInput = ref<HTMLInputElement | null>(null);

const loading = ref(false);

const form = reactive({
  caseId: '',
  caseName: '',
  documentName: '',
  documentType: '',
  recipient: '',
  recipientType: '',
  recipientPhone: '',
  recipientAddress: '',
  serviceMethod: '',
  serviceContent: '',
  attachment: '',
  sendStatus: '已发送',
});

const documentTypeOptions = [
  { label: '起诉状', value: '起诉状' },
  { label: '答辩状', value: '答辩状' },
  { label: '上诉状', value: '上诉状' },
  { label: '申请书', value: '申请书' },
  { label: '通知书', value: '通知书' },
  { label: '判决书', value: '判决书' },
  { label: '裁定书', value: '裁定书' },
  { label: '调解书', value: '调解书' },
  { label: '决定书', value: '决定书' },
  { label: '其他', value: '其他' },
];

const recipientTypeOptions = [
  { label: '原告', value: '原告' },
  { label: '被告', value: '被告' },
  { label: '第三人', value: '第三人' },
  { label: '代理人', value: '代理人' },
  { label: '证人', value: '证人' },
  { label: '鉴定人', value: '鉴定人' },
  { label: '其他', value: '其他' },
];

const serviceMethodOptions = [
  { label: '电子送达', value: '电子送达' },
  { label: '邮寄送达', value: '邮寄送达' },
  { label: '直接送达', value: '直接送达' },
  { label: '公告送达', value: '公告送达' },
  { label: '委托送达', value: '委托送达' },
];

const caseOptions = [
  { label: 'CASE-2024-001 - 张三破产清算案', value: 'CASE-2024-001' },
  { label: 'CASE-2024-002 - 李四与王五合同纠纷案', value: 'CASE-2024-002' },
  { label: 'CASE-2024-003 - 赵六债务重组案', value: 'CASE-2024-003' },
];

const uploadedFiles = ref<
  { file: File; fileId: string; name: string; url: string }[]
>([]);
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set([
  '.doc',
  '.docx',
  '.jpg',
  '.pdf',
  '.png',
  '.xls',
  '.xlsx',
]);
const fileUploadLoading = ref(false);

const validateFile = (file: File) => {
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!allowedTypes.has(fileExtension)) {
    ElMessage.error(
      '不支持的文件类型，请上传PDF、DOC、DOCX、XLS、XLSX、JPG、PNG格式文件',
    );
    return false;
  }
  if (file.size > maxFileSize) {
    ElMessage.error(
      `文件大小超过限制：${(file.size / 1024 / 1024).toFixed(2)}MB，单个文件大小不超过10MB`,
    );
    return false;
  }
  return true;
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file && validateFile(file)) {
      try {
        fileUploadLoading.value = true;

        // 这里只是暂存文件，实际上传会在提交表单时进行
        uploadedFiles.value.push({
          name: file.name,
          url: URL.createObjectURL(file),
          file,
          fileId: Date.now().toString(),
        });

        form.attachment = file.name;

        fileUploadLoading.value = false;
        ElMessage.success('文件已暂存，将在提交表单时上传');
      } catch (error: any) {
        fileUploadLoading.value = false;
        ElMessage.error(`文件处理失败：${error.message || '网络错误'}`);
      }
    }
  }
  input.value = '';
};

const removeFile = (index: number) => {
  const file = uploadedFiles.value[index];
  if (file && file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url);
  }

  uploadedFiles.value.splice(index, 1);
  form.attachment = '';

  ElMessage.success('文件已删除');
};

const downloadFile = (file: any) => {
  if (file.url) {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.append(a);
    a.click();
    a.remove();
  }
};

const handleCaseChange = (value: string) => {
  const selectedCase = caseOptions.find((c) => c.value === value);
  if (selectedCase) {
    const parts = selectedCase.label.split(' - ');
    form.caseName = parts[1] || '';
  }
};

const rules = {
  caseId: [{ required: true, message: '请选择案件', trigger: 'change' }],
  documentName: [
    { required: true, message: '请输入文书名称', trigger: 'blur' },
  ],
  documentType: [
    { required: true, message: '请选择文书类型', trigger: 'change' },
  ],
  recipient: [{ required: true, message: '请输入受送达人', trigger: 'blur' }],
  recipientType: [
    { required: true, message: '请选择受送达人类型', trigger: 'change' },
  ],
  recipientPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  recipientAddress: [
    { required: true, message: '请输入送达地址', trigger: 'blur' },
  ],
  serviceMethod: [
    { required: true, message: '请选择送达方式', trigger: 'change' },
  ],
  serviceContent: [
    { required: true, message: '请输入送达内容', trigger: 'blur' },
  ],
};

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // 获取用户信息
        const chatUserInfoStr = localStorage.getItem('chat_user_info');
        const chatUserInfo = chatUserInfoStr ? JSON.parse(chatUserInfoStr) : {};

        // 调试信息
        console.log('chatUserInfo:', chatUserInfo);

        // 从chatUserInfo中提取用户信息，考虑嵌套结构
        const userName = chatUserInfo.uName || chatUserInfo.user?.uName || '';
        const userTel = chatUserInfo.uTel || chatUserInfo.user?.uTel || '';

        console.log('提取的用户信息:', { userName, userTel });

        // 1. 创建文书
        const documentResponse = await createDocumentApi({
          caseId: form.caseId,
          caseName: form.caseName,
          documentName: form.documentName,
          documentType: form.documentType,
          recipient: form.recipient,
          recipientType: form.recipientType,
          recipientPhone: form.recipientPhone,
          recipientAddress: form.recipientAddress,
          serviceMethod: form.serviceMethod,
          serviceContent: form.serviceContent,
          sendStatus: form.sendStatus,
          status: form.sendStatus, // status与send_status相同
          createBy: userName,
          updateBy: userName,
          deliverer: userName,
          delivererPhone: userTel,
        });

        // 处理响应，根据后端返回的status判断成功或失败
        if (documentResponse.status === '1') {
          const documentId = documentResponse.data.SEP_ID;

          // 2. 上传附件（如果有）
          if (uploadedFiles.value.length > 0) {
            for (const uploadedFile of uploadedFiles.value) {
              await uploadDocumentAttachmentApi(documentId, uploadedFile.file);
            }
          }

          ElMessage.success(documentResponse.error || '文书送达创建成功');
          router.push('/service-of-documents');
        } else {
          ElMessage.error(documentResponse.error || '文书送达创建失败');
        }
      } catch (error: any) {
        ElMessage.error(error.message || '文书送达创建失败');
        console.error('创建文书失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 清理文件URL
  uploadedFiles.value.forEach((file) => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  });
  uploadedFiles.value = [];
  form.attachment = '';
};

const cancel = () => {
  // 清理文件URL
  uploadedFiles.value.forEach((file) => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  });
  router.back();
};
</script>

<template>
  <div class="document-add p-5">
    <h1 class="mb-5 text-2xl font-bold">新增文书送达</h1>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="document-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件编号" prop="caseId">
              <el-select
                v-model="form.caseId"
                placeholder="请选择案件"
                filterable
                clearable
                @change="handleCaseChange"
                style="width: 100%"
              >
                <el-option
                  v-for="item in caseOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件名称">
              <el-input
                v-model="form.caseName"
                placeholder="自动填充"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文书名称" prop="documentName">
              <el-input
                v-model="form.documentName"
                placeholder="请输入文书名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文书类型" prop="documentType">
              <el-select
                v-model="form.documentType"
                placeholder="请选择文书类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in documentTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">受送达人信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="受送达人" prop="recipient">
              <el-input
                v-model="form.recipient"
                placeholder="请输入受送达人姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="受送达人类型" prop="recipientType">
              <el-select
                v-model="form.recipientType"
                placeholder="请选择受送达人类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in recipientTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="recipientPhone">
              <el-input
                v-model="form.recipientPhone"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送达地址" prop="recipientAddress">
              <el-input
                v-model="form.recipientAddress"
                placeholder="请输入送达地址"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">送达信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="送达方式" prop="serviceMethod">
              <el-select
                v-model="form.serviceMethod"
                placeholder="请选择送达方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in serviceMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发送状态">
              <el-select
                v-model="form.sendStatus"
                placeholder="请选择发送状态"
                style="width: 100%"
              >
                <el-option label="已发送" value="已发送" />
                <el-option label="暂存送达" value="暂存送达" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="送达内容" prop="serviceContent">
          <RichTextEditor
            v-model="form.serviceContent"
            placeholder="请输入送达内容"
          />
        </el-form-item>

        <el-divider content-position="left">文书附件</el-divider>

        <el-form-item label="上传文书">
          <div class="file-upload-container">
            <input
              ref="fileInput"
              type="file"
              accept=".doc,.docx,.pdf,.jpg,.png,.xls,.xlsx"
              class="file-input"
              @change="handleFileChange"
            />
            <el-button
              type="primary"
              @click="fileInput?.click()"
              :loading="fileUploadLoading"
            >
              <Icon icon="lucide:upload" class="mr-1" />
              选择文件
            </el-button>
            <span class="ml-2 text-sm text-gray-500">
              支持上传文档、图片等文件，单个文件不超过10MB
            </span>
          </div>

          <div v-if="uploadedFiles.length > 0" class="mt-3">
            <el-table :data="uploadedFiles" style="width: 100%">
              <el-table-column prop="name" label="文件名称" />
              <el-table-column prop="size" label="文件大小" width="120">
                <template #default="scope">
                  {{ (scope.row.file.size / 1024 / 1024).toFixed(2) }} MB
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="downloadFile(scope.row)"
                  >
                    下载
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeFile(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions flex justify-end gap-3">
            <el-button @click="cancel">取消</el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitForm" :loading="loading">
              提交
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.document-add {
  min-height: calc(100vh - 100px);
}

.document-form {
  padding: 20px 0;
}

.form-actions {
  padding: 20px 0 0;
  border-top: 1px solid #e5e7eb;
}

.file-upload-container {
  display: flex;
  align-items: center;
}

.file-input {
  display: none;
}
</style>

