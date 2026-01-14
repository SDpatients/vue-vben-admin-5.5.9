<script setup lang="ts">
import type { CaseApi } from '#/api/core/case';

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore } from '@vben/stores';

import { ElLoading, ElMessage, ElResult } from 'element-plus';

import { addOneCaseApi, batchUploadCaseFilesApi } from '#/api/core/case';
import { getCourtListApi } from '#/api/core/court';
import { getManagerListApi } from '#/api/core/manager';


const accessStore = useAccessStore();

const router = useRouter();

const formRef = ref();
const fileInput = ref();
const loading = ref(false);
const courtListLoading = ref(false);
const managerListLoading = ref(false);

const form = reactive<CaseApi.CreateCaseRequest>({
  caseNumber: '',
  caseName: '',
  acceptanceDate: '',
  caseSource: '',
  acceptanceCourt: '',
  designatedInstitution: '浙江浦源律师事务所',
  mainResponsiblePerson: '',
  isSimplifiedTrial: 0,
  caseReason: '',
  caseProgress: 'FIRST',
  debtClaimDeadline: '',
  filingDate: '',
  remarks: '',
});

const courtList = ref<{ label: string; value: string }[]>([]);
const managerList = ref<{ label: string; sepId: string; value: string }[]>([]);
const userList = ref<{ label: string; value: number }[]>([]);

const uploadedFiles = ref<{ file: File; name: string; url: string }[]>([]);
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set([
  '.doc',
  '.docx',
  '.jpg',
  '.pdf',
  '.png',
  '.txt',
  '.xls',
  '.xlsx',
]);



const fetchCourtList = async () => {
  try {
    courtListLoading.value = true;
    const response = await getCourtListApi({ page: 1, size: 100 });
    if (response.status === '1' && response.data?.records) {
      courtList.value = response.data.records.map((court: any) => ({
        label: court.FYQC,
        value: court.FYQC,
      }));
    }
  } catch (error) {
    console.error('获取法院列表失败:', error);
    ElMessage.error('获取法院列表失败');
  } finally {
    courtListLoading.value = false;
  }
};

const fetchManagerList = async () => {
  try {
    managerListLoading.value = true;
    const response = await getManagerListApi({ pageNum: 1, pageSize: 100 });
    if (response.code === 200 && response.data && response.data.list) {
      managerList.value = response.data.list
        .filter((manager: any) => manager.id)
        .map((manager: any) => ({
          label: manager.administratorName,
          value: manager.id.toString(),
          sepId: manager.id.toString(),
        }));
      console.log('加载到的管理人列表:', managerList.value);
    }
  } catch (error) {
    console.error('获取管理人列表失败:', error);
    ElMessage.error('获取管理人列表失败');
  } finally {
    managerListLoading.value = false;
  }
};

fetchCourtList();
fetchManagerList();

const validateFile = (file: File) => {
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!allowedTypes.has(fileExtension)) {
    ElMessage.error(
      `不支持的文件类型：${fileExtension}，请上传PDF、DOC、DOCX、XLS、XLSX、JPG、PNG格式文件`,
    );
    return false;
  }
  if (file.size > maxFileSize) {
    ElMessage.error(
      `文件大小超过限制：${(file.size > 0 ? file.size / 1024 / 1024 : 0).toFixed(2)}MB，单个文件大小不超过10MB`,
    );
    return false;
  }
  return true;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (validateFile(file)) {
      uploadedFiles.value.push({
        name: file.name,
        url: '',
        file,
        fileId: 0,
      });
      ElMessage.success('文件已添加到待上传列表');
    }
  }
  input.value = '';
};

const removeFile = (index: number) => {
  const file = uploadedFiles.value[index];
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url);
  }
  uploadedFiles.value.splice(index, 1);
  ElMessage.success('文件已删除');
};

const rules = reactive({
  caseNumber: [
    { required: true, message: '请输入案号', trigger: 'blur' },
    { min: 1, max: 50, message: '案号长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5（）()（）\[\]【】\-_]+$/, message: '案号格式不正确', trigger: 'blur' },
  ],
  caseName: [
    { required: true, message: '请输入案件名称', trigger: 'blur' },
    {
      min: 1,
      max: 100,
      message: '案件名称长度在 1 到 100 个字符',
      trigger: 'blur',
    },
  ],
  acceptanceDate: [
    { required: true, message: '请选择受理日期', trigger: 'change' },
  ],
  caseSource: [
    { max: 50, message: '案件来源长度不能超过 50 个字符', trigger: 'blur' },
  ],
  mainResponsiblePerson: [
    { max: 50, message: '主要负责人长度不能超过 50 个字符', trigger: 'blur' },
  ],
  caseReason: [
    { max: 200, message: '案件原因长度不能超过 200 个字符', trigger: 'blur' },
  ],
  remarks: [
    { max: 500, message: '备注长度不能超过 500 个字符', trigger: 'blur' },
  ],
});

const resetForm = () => {
  formRef.value?.resetFields();
  ElMessage.info('表单已重置');
};

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const submitData: CaseApi.CreateCaseRequest = {
      caseNumber: form.caseNumber.trim(),
      caseName: form.caseName.trim(),
      acceptanceDate: form.acceptanceDate,
      caseSource: form.caseSource?.trim(),
      acceptanceCourt: form.acceptanceCourt,
      designatedInstitution: form.designatedInstitution?.trim(),
      mainResponsiblePerson: form.mainResponsiblePerson?.trim(),
      isSimplifiedTrial: form.isSimplifiedTrial,
      caseReason: form.caseReason?.trim(),
      caseProgress: form.caseProgress,
      debtClaimDeadline: form.debtClaimDeadline,
      filingDate: form.filingDate,
      remarks: form.remarks?.trim(),
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('后端请求超时'));
      }, 3000);
    });

    const caseResult = await Promise.race([
      addOneCaseApi(submitData),
      timeoutPromise,
    ]);

    if (caseResult.code === 200 && caseResult.data) {
      const caseId = caseResult.data.caseId;

      if (uploadedFiles.value.length > 0) {
        const fileLoading = ElLoading.service({
          message: '文件上传中...',
          lock: true,
        });

        try {
          const files = uploadedFiles.value.map((fileInfo) => fileInfo.file);
          await batchUploadCaseFilesApi(files, caseId, 'case');
          fileLoading.close();
          ElMessage.success('案件添加成功，文件上传完成');
        } catch (fileError: any) {
          fileLoading.close();
          ElMessage.warning(
            `案件创建成功，但文件上传失败：${fileError.message || '网络错误'}`,
          );
        }
      } else {
        ElMessage.success('案件添加成功');
      }

      router.push(`/case-detail/${caseId}`);
    } else {
      ElMessage.error(caseResult.message || '案件添加失败');
    }
  } catch (error: any) {
    if (error.message === '后端请求超时') {
      ElMessage.error('后端请求超时，请稍后重试');
    } else if (error?.fields) {
      ElMessage.error('请检查表单填写是否正确');
    } else {
      ElMessage.error(error.message || '案件添加失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">新增破产案件</h1>
        <button
          class="text-gray-500 transition-colors hover:text-gray-700"
          @click="router.back()"
        >
          <i class="i-lucide-x text-xl"></i>
        </button>
      </div>

      <el-card shadow="hover" class="case-add-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
          class="case-form"
        >
          <div class="form-section mb-6">
            <h3 class="section-title mb-4">案件基本信息</h3>
            <div class="section-content rounded-lg bg-gray-50 p-4">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="案号" prop="caseNumber">
                    <el-input
                      v-model="form.caseNumber"
                      placeholder="请输入案号"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="案件名称" prop="caseName">
                    <el-input
                      v-model="form.caseName"
                      placeholder="请输入案件名称"
                      maxlength="100"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="受理日期" prop="acceptanceDate">
                    <el-date-picker
                      v-model="form.acceptanceDate"
                      type="date"
                      placeholder="请选择受理日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="案件来源" prop="caseSource">
                    <el-input
                      v-model="form.caseSource"
                      placeholder="请输入案件来源"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="受理法院" prop="acceptanceCourt">
                    <el-select
                      v-model="form.acceptanceCourt"
                      placeholder="请选择受理法院"
                      filterable
                      :loading="courtListLoading"
                      style="width: 100%;"
                    >
                      <el-option
                        v-for="court in courtList"
                        :key="court.value"
                        :label="court.label"
                        :value="court.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="指定机构" prop="designatedInstitution">
                    <el-input
                      v-model="form.designatedInstitution"
                      placeholder="请输入指定机构"
                      maxlength="100"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="主要负责人" prop="mainResponsiblePerson">
                    <el-input
                      v-model="form.mainResponsiblePerson"
                      placeholder="请输入主要负责人"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="是否简化审" prop="isSimplifiedTrial">
                    <el-select
                      v-model="form.isSimplifiedTrial"
                      placeholder="请选择"
                      style="width: 100%;"
                    >
                      <el-option :value="0" label="否" />
                      <el-option :value="1" label="是" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="案件进度" prop="caseProgress">
                    <el-select
                      v-model="form.caseProgress"
                      placeholder="请选择案件进度"
                      style="width: 100%;"
                    >
                      <el-option value="FIRST" label="第一阶段" />
                      <el-option value="SECOND" label="第二阶段" />
                      <el-option value="THIRD" label="第三阶段" />
                      <el-option value="FOURTH" label="第四阶段" />
                      <el-option value="FIFTH" label="第五阶段" />
                      <el-option value="SIXTH" label="第六阶段" />
                      <el-option value="SEVENTH" label="第七阶段" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="案件原因" prop="caseReason">
                    <el-input
                      v-model="form.caseReason"
                      placeholder="请输入案件原因"
                      maxlength="200"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="债权申报截止时间" prop="debtClaimDeadline">
                    <el-date-picker
                      v-model="form.debtClaimDeadline"
                      type="datetime"
                      placeholder="请选择债权申报截止时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="立案日期" prop="filingDate">
                    <el-date-picker
                      v-model="form.filingDate"
                      type="date"
                      placeholder="请选择立案日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注" prop="remarks">
                    <el-input
                      v-model="form.remarks"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入备注信息"
                      maxlength="500"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="form-section mb-6">
            <h3 class="section-title mb-4">文件上传</h3>
            <div class="section-content rounded-lg bg-gray-50 p-4">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="案件文件">
                    <div class="file-upload-container">
                      <input
                        ref="fileInput"
                        type="file"
                        accept=".doc,.docx,.pdf,.jpg,.png,.txt,.xls,.xlsx"
                        style="display: none"
                        @change="handleFileChange"
                      />
                      <el-button
                        type="primary"
                        @click="fileInput?.click()"
                      >
                        <i class="i-lucide-upload mr-1"></i>
                        选择文件
                      </el-button>
                      <span class="ml-2 text-sm text-gray-500">
                        支持PDF、DOC、DOCX、XLS、XLSX、JPG、PNG格式，单个文件不超过10MB
                      </span>
                    </div>

                    <div
                      v-if="uploadedFiles.length > 0"
                      class="file-list mt-4"
                    >
                      <div
                        v-for="(file, index) in uploadedFiles"
                        :key="index"
                        class="file-item"
                      >
                        <i class="i-lucide-file-text mr-2"></i>
                        <span class="file-name">{{ file.name }}</span>
                        <el-button
                          type="danger"
                          size="small"
                          link
                          @click="removeFile(index)"
                        >
                          <i class="i-lucide-trash-2"></i>
                        </el-button>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="form-actions mt-6">
            <el-button @click="resetForm">
              <i class="i-lucide-rotate-ccw mr-1"></i>
              重置
            </el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="submitForm"
            >
              <i class="i-lucide-save mr-1"></i>
              提交
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  margin-bottom: 2rem;
}

.section-title {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.section-content {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.file-upload-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.case-add-card {
  max-width: 1200px;
  margin: 0 auto;
}

.case-form {
  padding: 1rem;
}
</style>
