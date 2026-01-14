<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ElButton,
  ElCard,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElRow,
} from 'element-plus';



const route = useRoute();
const router = useRouter();

// 获取当前编辑的SEP_ID
const sepId = ref<string>(route.params.sepId as string);

// 表单数据
const formData = ref({
  tdfzr: '',
  zhzcy: '',
  cxzcy: '',
  ccglzcy: '',
  zqshzcy: '',
  ldrszcy: '',
  zzqlzcy: '',
});

// 加载状态
const loading = ref(false);
const saving = ref(false);

// 保存数据
const saveData = async () => {
  saving.value = true;
  try {
    // 从本地存储获取操作人信息
    const chatUserInfo = localStorage.getItem('chat_user_info');
    const sepeuser = chatUserInfo ? JSON.parse(chatUserInfo).user?.uUser : 'admin';

    // 准备API参数
    const updateParams = {
      // 必须的参数
      SEP_EUSER: sepeuser,
      SEP_EDATE: new Date().toISOString(),
      OperateType: '0',

      // 其他参数
      SEP_ID: sepId.value,
      SEP_LD: sepId.value,
      TDFZR: formData.value.tdfzr,
      ZHZCY: formData.value.zhzcy,
      CXZCY: formData.value.cxzcy,
      CCGLZCY: formData.value.ccglzcy,
      ZQSHZCY: formData.value.zqshzcy,
      LDRSZCY: formData.value.ldrszcy,
      ZZQLZCY: formData.value.zzqlzcy,
      ZT: '0',
    };

    ElMessage.success('数据已保存');
    router.push('/basic-data/work-team-management');
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存数据失败');
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  router.push('/basic-data/work-team-management');
};

// 页面加载时初始化数据
onMounted(() => {
  // 这里可以添加加载现有数据的逻辑
  // 例如：根据sepId获取当前工作团队的详细信息
  ElMessage.info('加载工作团队数据...');
});
</script>

<template>
  <div class="p-6">
    <ElCard title="编辑工作团队" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">编辑工作团队</span>
          <ElButton type="primary" link @click="cancelEdit">
            <i class="i-lucide-arrow-left mr-1"></i>
            返回列表
          </ElButton>
        </div>
      </template>

      <ElForm :model="formData" label-width="120px" class="mt-4">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="团队负责人">
              <ElInput
                v-model="formData.tdfzr"
                placeholder="请输入团队负责人"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="综合组成员">
              <ElInput
                v-model="formData.zhzcy"
                placeholder="请输入综合组成员"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="程序组成员">
              <ElInput
                v-model="formData.cxzcy"
                placeholder="请输入程序组成员"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="财产管理组成员">
              <ElInput
                v-model="formData.ccglzcy"
                placeholder="请输入财产管理组成员"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="债权审核组成员">
              <ElInput
                v-model="formData.zqshzcy"
                placeholder="请输入债权审核组成员"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="劳动人事组成员">
              <ElInput
                v-model="formData.ldrszcy"
                placeholder="请输入劳动人事组成员"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="8">
            <ElFormItem label="资产清理组成员">
              <ElInput
                v-model="formData.zzqlzcy"
                placeholder="请输入资产清理组成员"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <!-- 操作按钮 -->
        <div class="mt-6 flex justify-end gap-2">
          <ElButton @click="cancelEdit" :disabled="saving"> 取消 </ElButton>
          <ElButton type="primary" @click="saveData" :loading="saving">
            保存
          </ElButton>
        </div>
      </ElForm>
    </ElCard>
  </div>
</template>

<style scoped>
/* 可以添加自定义样式 */
</style>
