<script setup lang="ts">
import type { CaseApi } from '#/api/core/case';

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage, ElLoading } from 'element-plus';

import { addOneCaseApi, uploadCaseFileApi } from '#/api/core/case';

const router = useRouter();

// 表单引用
const formRef = ref();

// 加载状态
const loading = ref(false);

// 表单数据
const form = reactive<CaseApi.AddCaseRequest>({
  ah: '',
  ajmc: '',
  slrq: undefined,
  ajly: undefined,
  slfy: undefined,
  zdjg: undefined,
  glrfzr: undefined,
  sfjhs: undefined,
  ay: undefined,
  ajjd: undefined,
  zqsbjzsj: undefined,
  larq: undefined,
  jarq: undefined,
  pcsj: undefined,
  cbry: undefined,
  beizhu: undefined,
  wjsc: undefined,
  sepLd: undefined,
  sepMd: undefined,
  sepNd: undefined,
});

// 文件上传相关状态
const uploadedFiles = ref<{ file: File; name: string; url: string }[]>([]);
const maxFileSize = 10 * 1024 * 1024; // 10MB
const allowedTypes = new Set([
  '.doc',
  '.docx',
  '.jpg',
  '.pdf',
  '.png',
  '.xls',
  '.xlsx',
]);

// 格式化当前年月（YYYYMM）
const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
};

// 检查文件类型和大小
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
      `文件大小超过限制：${(file.size / 1024 / 1024).toFixed(2)}MB，单个文件大小不超过10MB`,
    );
    return false;
  }
  return true;
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (validateFile(file)) {
      // 将文件添加到本地列表，暂不上传
      uploadedFiles.value.push({
        name: file.name,
        url: '',
        file,
        fileId: 0,
      });
      // 更新表单的文件上传字段
      form.wjsc = uploadedFiles.value.map((f) => f.name).join(';');

      ElMessage.success('文件已添加到待上传列表');
    }
  }
  // 清空input值，允许选择相同文件
  input.value = '';
};

// 删除已上传文件
const removeFile = (index: number) => {
  const file = uploadedFiles.value[index];
  // 如果是本地文件URL，释放资源
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url);
  }
  // 这里可以添加服务器端文件删除逻辑
  // const token = '6d014638f3a8e59d656b9c3e83b5501a';
  // await deleteCaseFileApi(token, file.fileId);

  uploadedFiles.value.splice(index, 1);
  // 更新表单的文件上传字段
  form.wjsc = uploadedFiles.value.map((f) => f.name).join(';');

  ElMessage.success('文件已删除');
};

// 下载文件（从服务器下载或本地下载）
const downloadFile = (file: any) => {
  if (file.url && !file.url.startsWith('blob:')) {
    // 如果有服务器URL，直接打开下载
    window.open(file.url, '_blank');
  } else {
    // 否则使用本地文件下载
    const fileURL = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = file.name;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(fileURL);
  }
};

// 表单验证规则
const rules = reactive({
  ah: [
    { required: true, message: '请输入案号', trigger: 'blur' },
    { min: 1, max: 50, message: '案号长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  ajmc: [
    { required: true, message: '请输入案件名称', trigger: 'blur' },
    {
      min: 1,
      max: 100,
      message: '案件名称长度在 1 到 100 个字符',
      trigger: 'blur',
    },
  ],
});

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  ElMessage.info('表单已重置');
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // 从localStorage获取chat_user_info
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    let sepAuser = '';
    if (chatUserInfoStr) {
      try {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        sepAuser = chatUserInfo.user?.uName || '';
      } catch (e) {
        console.error('解析chat_user_info失败:', e);
      }
    }

    // 获取当前北京时间
    const now = new Date();
    const sepAdate = now.toISOString().slice(0, 19).replace('T', ' ');

    // 准备提交数据，添加默认参数
    const submitData = {
      ...form,
      sep_auser: sepAuser,
      sep_adate: sepAdate,
    };

    // 处理空值：日期类型传递null，其他类型传递空字符串
    const dateFields = ['slrq', 'zqsbjzsj', 'larq', 'jarq', 'pcsj', 'sep_adate'];
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        if (dateFields.includes(key)) {
          submitData[key] = null;
        } else {
          submitData[key] = '';
        }
      }
    });

    // 设置3秒超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('后端请求超时'));
      }, 3000);
    });

<<<<<<< Updated upstream
    // 调用API，使用Promise.race实现超时控制
    const result = await Promise.race([addOneCaseApi(form), timeoutPromise]);
=======
    // 1. 先提交案件基本信息
    const caseResult = await Promise.race([
      addOneCaseApi(submitData),
      timeoutPromise,
    ]);
>>>>>>> Stashed changes

    // 处理案件创建响应
    if (caseResult.status === '1') {
      const caseId = caseResult.data || '';
      
      // 2. 如果有文件需要上传，使用获取到的caseId上传文件
      if (uploadedFiles.value.length > 0) {
        const fileLoading = ElLoading.service({
          message: '文件上传中...',
          lock: true,
        });
        
        try {
          // 逐个上传文件
          for (const fileInfo of uploadedFiles.value) {
            await uploadCaseFileApi(fileInfo.file, caseId, 'key');
          }
          
          fileLoading.close();
        } catch (fileError: any) {
          fileLoading.close();
          ElMessage.warning(`案件创建成功，但文件上传失败：${fileError.message || '网络错误'}`);
        }
      }
      
      ElMessage.success('案件添加成功');
      router.push('/case-management');
    } else {
      ElMessage.error(caseResult.error || '案件添加失败');
    }
  } catch (error: any) {
    if (error.message === '后端请求超时') {
      ElMessage.error('后端请求超时');
    } else {
      ElMessage.error(error.message || '案件添加失败');
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
        label-width="120px"
        class="case-form"
      >
        <el-row :gutter="20">
          <!-- 案号 -->
          <el-col :span="12">
            <el-form-item label="案号" prop="ah">
              <el-input
                v-model="form.ah"
                placeholder="请输入案号"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 案件名称 -->
          <el-col :span="12">
            <el-form-item label="案件名称" prop="ajmc">
              <el-input
                v-model="form.ajmc"
                placeholder="请输入案件名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 受理日期 -->
          <el-col :span="12">
            <el-form-item label="受理日期">
              <el-date-picker
                v-model="form.slrq"
                type="datetime"
                placeholder="请选择受理日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 案件来源 -->
          <el-col :span="12">
            <el-form-item label="案件来源">
              <el-input
                v-model="form.ajly"
                placeholder="请输入案件来源"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 受理法院 -->
          <el-col :span="12">
            <el-form-item label="受理法院">
              <el-input
                v-model="form.slfy"
                placeholder="请输入受理法院"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 管理人 -->
          <el-col :span="12">
            <el-form-item label="管理人">
              <el-input
                v-model="form.zdjg"
                placeholder="请输入管理人"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 主要负责人 -->
          <el-col :span="12">
            <el-form-item label="主要负责人">
              <el-input
                v-model="form.glrfzr"
                placeholder="请输入主要负责人"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 是否简化审 -->
          <el-col :span="12">
            <el-form-item label="是否简化审">
              <el-select v-model="form.sfjhs" placeholder="请选择是否简化审">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 案由 -->
          <el-col :span="12">
            <el-form-item label="案由">
              <el-input
                v-model="form.ay"
                placeholder="请输入案由"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 案件进度 -->
          <el-col :span="12">
            <el-form-item label="案件进度">
              <el-input
                v-model="form.ajjd"
                placeholder="请输入案件进度"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 债权申报截止时间 -->
          <el-col :span="12">
            <el-form-item label="债权申报截止时间">
              <el-date-picker
                v-model="form.zqsbjzsj"
                type="datetime"
                placeholder="请选择债权申报截止时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 立案日期 -->
          <el-col :span="12">
            <el-form-item label="立案日期">
              <el-date-picker
                v-model="form.larq"
                type="datetime"
                placeholder="请选择立案日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 结案日期 -->
          <el-col :span="12">
            <el-form-item label="结案日期">
              <el-date-picker
                v-model="form.jarq"
                type="datetime"
                placeholder="请选择结案日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 破产时间 -->
          <el-col :span="12">
            <el-form-item label="破产时间">
              <el-date-picker
                v-model="form.pcsj"
                type="datetime"
                placeholder="请选择破产时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 承办人员 -->
          <el-col :span="12">
            <el-form-item label="承办人员">
              <el-input
                v-model="form.cbry"
                placeholder="请输入承办人员"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 备注 -->
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.beizhu"
                type="textarea"
                :rows="4"
                placeholder="请输入备注信息"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <!-- 文件上传 -->
          <el-col :span="24">
            <el-form-item label="文件上传">
              <div class="file-upload-container">
                <!-- 选择文件按钮 -->
                <div class="mb-4 flex items-center gap-3">
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    @change="handleFileChange"
                  />
                  <el-button type="primary" @click="$refs.fileInput.click()">
                    <i class="i-lucide-upload mr-1"></i>
                    选择并上传文件
                  </el-button>
                  <el-button
                    type="success"
                    @click="uploadedFiles.forEach((f, i) => downloadFile(f))"
                    :disabled="uploadedFiles.length === 0"
                  >
                    <i class="i-lucide-download mr-1"></i>
                    下载所有文件
                  </el-button>
                </div>

                <!-- 文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="uploaded-file-list">
                  <el-card
                    v-for="(file, index) in uploadedFiles"
                    :key="index"
                    class="uploaded-file-item mb-3"
                    shadow="hover"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <i class="i-lucide-file text-xl text-blue-500"></i>
                        <div class="file-info">
                          <div class="file-name">{{ file.name }}</div>
                          <div class="file-size">
                            {{ (file.file.size / 1024 / 1024).toFixed(2) }} MB
                          </div>
                        </div>
                      </div>
                      <div class="file-actions flex gap-2">
                        <el-button
                          type="primary"
                          size="small"
                          @click="downloadFile(file.file)"
                        >
                          <i class="i-lucide-download mr-1"></i>
                          下载
                        </el-button>
                        <el-button
                          type="danger"
                          size="small"
                          @click="removeFile(index)"
                        >
                          <i class="i-lucide-trash-2 mr-1"></i>
                          删除
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </div>

                <!-- 提示信息 -->
                <div v-else class="mt-2 text-sm text-gray-500">
                  暂无上传文件
                </div>

                <!-- 上传说明 -->
                <div class="upload-tip mt-3 text-sm text-gray-500">
                  <p>
                    支持上传 PDF、DOC、DOCX、XLS、XLSX、JPG、PNG
                    格式文件，单个文件大小不超过 10MB
                  </p>
                  <p class="mt-1">
                    文件将根据当前年月自动组织到服务器对应文件夹，例如：202512
                  </p>
                  <p class="mt-1 text-blue-500">
                    服务器存储路径：C:\Users\Lenovo\Desktop\yzz\Release\律师\Service\ServiceWin\wwwroot\Upload\File
                  </p>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单操作按钮 -->
        <div class="form-actions mt-6 flex justify-end gap-3">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            提交案件
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.case-add-card {
  max-width: 1200px;
  margin: 0 auto;
}

.case-form {
  padding: 20px 0;
}

.form-actions {
  padding: 20px 0 0;
  border-top: 1px solid #e5e7eb;
}

.file-uploader {
  width: 100%;
}

/* 自定义文件上传样式 */
.file-upload-container {
  width: 100%;
}

.uploaded-file-list {
  width: 100%;
}

.uploaded-file-item {
  transition: all 0.3s ease;
}

.uploaded-file-item:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: translateY(-2px);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.upload-tip {
  padding: 12px;
  margin-top: 12px;
  background-color: #f5f7fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.upload-tip p {
  margin: 0;
  line-height: 1.5;
}
</style>
