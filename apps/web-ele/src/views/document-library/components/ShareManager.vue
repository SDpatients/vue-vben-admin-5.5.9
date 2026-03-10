<script lang="ts" setup>
import type { DocumentLibraryApi } from '#/api/core/document-library';

import { onMounted, ref, watch } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElInput,
  ElMessage,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElSwitch,
} from 'element-plus';
import { Icon } from '@iconify/vue';

import {
  createShareApi,
  disableShareApi,
  enableShareApi,
} from '#/api/core/document-library';

const props = defineProps<{
  documentId: number;
  documentName: string;
}>();

const shares = ref<DocumentLibraryApi.ShareInfo[]>([]);
const loading = ref(false);
const createDialogVisible = ref(false);
const createForm = ref({
  sharePassword: '',
  permissionType: 'READ' as 'READ' | 'DOWNLOAD' | 'EDIT',
  expireTime: null as Date | null,
  maxAccessCount: 0,
});
const createLoading = ref(false);
const currentShareLink = ref('');

const fetchShares = async () => {
  loading.value = true;
  try {
    // 这里假设有获取分享列表的API，如果没有可以省略
    shares.value = [];
  } catch (error) {
    console.error('获取分享列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const createShare = async () => {
  createLoading.value = true;
  try {
    const response = await createShareApi({
      documentId: props.documentId,
      sharePassword: createForm.value.sharePassword || undefined,
      permissionType: createForm.value.permissionType,
      expireTime: createForm.value.expireTime?.toISOString() || undefined,
      maxAccessCount: createForm.value.maxAccessCount || undefined,
    });

    if (response.code === 200 && response.data) {
      currentShareLink.value = `${window.location.origin}${response.data.shareUrl}`;
      ElMessage.success('创建分享成功');
      await fetchShares();
    } else {
      ElMessage.error(response.message || '创建分享失败');
    }
  } catch (error) {
    console.error('创建分享失败:', error);
    ElMessage.error('创建分享失败');
  } finally {
    createLoading.value = false;
  }
};

const toggleShare = async (share: DocumentLibraryApi.ShareInfo) => {
  try {
    let response;
    if (share.isEnabled) {
      response = await disableShareApi(share.id);
    } else {
      response = await enableShareApi(share.id);
    }

    if (response.code === 200) {
      ElMessage.success(share.isEnabled ? '已禁用分享' : '已启用分享');
      await fetchShares();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

const copyShareLink = (share: DocumentLibraryApi.ShareInfo) => {
  const link = `${window.location.origin}${share.shareUrl}`;
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const getPermissionLabel = (type: string) => {
  const map: Record<string, string> = {
    READ: '仅查看',
    DOWNLOAD: '可下载',
    EDIT: '可编辑',
  };
  return map[type] || type;
};

watch(
  () => props.documentId,
  () => {
    if (props.documentId) {
      fetchShares();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.documentId) {
    fetchShares();
  }
});
</script>

<template>
  <div class="share-manager">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-gray-600">文档: {{ documentName }}</span>
      <ElButton type="primary" @click="createDialogVisible = true">
        <Icon icon="lucide:share-2" class="mr-1" />
        创建分享
      </ElButton>
    </div>

    <ElTable :data="shares" v-loading="loading" stripe border size="small">
      <template #empty>
        <ElEmpty description="暂无分享记录" />
      </template>

      <ElTableColumn prop="shareCode" label="分享码" min-width="150" show-overflow-tooltip />

      <ElTableColumn prop="permissionType" label="权限" width="100" align="center">
        <template #default="{ row }">
          <ElTag :type="row.permissionType === 'READ' ? 'info' : row.permissionType === 'DOWNLOAD' ? 'success' : 'warning'">
            {{ getPermissionLabel(row.permissionType) }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="expireTime" label="过期时间" width="160">
        <template #default="{ row }">
          {{ row.expireTime ? formatDate(row.expireTime) : '永久有效' }}
        </template>
      </ElTableColumn>

      <ElTableColumn prop="accessCount" label="访问次数" width="100" align="center">
        <template #default="{ row }">
          {{ row.accessCount }} / {{ row.maxAccessCount || '不限' }}
        </template>
      </ElTableColumn>

      <ElTableColumn prop="isEnabled" label="状态" width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="row.isEnabled && !row.isExpired ? 'success' : 'danger'">
            {{ row.isEnabled && !row.isExpired ? '有效' : '无效' }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="createTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <ElButton size="small" @click="copyShareLink(row)">
              <Icon icon="lucide:copy" class="mr-1" />
              复制
            </ElButton>
            <ElButton
              :type="row.isEnabled ? 'danger' : 'success'"
              size="small"
              @click="toggleShare(row)"
            >
              {{ row.isEnabled ? '禁用' : '启用' }}
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog v-model="createDialogVisible" title="创建分享" width="500px">
      <ElForm :model="createForm" label-width="100px">
        <ElFormItem label="权限类型">
          <ElSelect v-model="createForm.permissionType" style="width: 100%">
            <ElOption label="仅查看" value="READ" />
            <ElOption label="可下载" value="DOWNLOAD" />
            <ElOption label="可编辑" value="EDIT" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="分享密码">
          <ElInput
            v-model="createForm.sharePassword"
            placeholder="可选，留空则无需密码"
          />
        </ElFormItem>
        <ElFormItem label="过期时间">
          <ElDatePicker
            v-model="createForm.expireTime"
            type="datetime"
            placeholder="可选，留空则永久有效"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="最大访问次数">
          <ElInput
            v-model.number="createForm.maxAccessCount"
            type="number"
            placeholder="0表示不限制"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="createLoading" @click="createShare">
          创建分享
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.share-manager {
  min-height: 300px;
}
</style>
