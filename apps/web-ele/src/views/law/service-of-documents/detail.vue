<script setup lang="ts">
import type { DocumentServiceApi } from '#/api/core';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { formatDate } from '@vben/utils';

import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import markdownit from 'markdown-it';

import { getDocumentDetailApi } from '#/api/core';

// 创建markdown实例
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
});

// 处理Markdown内容，自动转换结尾的时间格式
const processMarkdown = (content: string): string => {
  if (!content) return '';

  // 转换Markdown为HTML
  let html = md.render(content);

  // 匹配ISO时间格式并转换
  const isoTimeRegex =
    /(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}/g;
  html = html.replaceAll(isoTimeRegex, (_match: string, datePart: string) => {
    return datePart;
  });

  return html;
};

const route = useRoute();
const id = route.params.id as string;

// 文书详情数据
const documentDetail = ref<{
  attachment: string;
  attachments: DocumentServiceApi.DocumentAttachment[];
  caseId: string;
  caseName: string;
  createTime: string;
  deliverer: string;
  delivererPhone: string;
  documentName: string;
  documentType: string;
  recipient: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientType: string;
  SEP_ID: string;
  serviceContent: string;
  serviceDate: null | string;
  serviceMethod: string;
  status: string;
  updateTime: string;
}>({
  SEP_ID: '',
  caseId: '',
  caseName: '',
  documentName: '',
  documentType: '',
  recipient: '',
  recipientType: '',
  recipientAddress: '',
  recipientPhone: '',
  serviceMethod: '',
  serviceDate: null,
  deliverer: '',
  delivererPhone: '',
  status: '',
  serviceContent: '',
  attachment: '',
  createTime: '',
  updateTime: '',
  attachments: [],
});

// 文书内容
const documentContent = ref('');

// 加载状态
const loading = ref(false);

// 页面加载时获取数据
onMounted(() => {
  fetchDocumentDetail();
});

// 获取文书详情
const fetchDocumentDetail = async () => {
  loading.value = true;
  try {
    const response = await getDocumentDetailApi(id);
    const documentData = response.data;

    // 确保兼容性，同时支持SEP_ID和id
    documentDetail.value = {
      ...documentData,
      attachment: '',
      attachments: documentData.attachments || [],
    };

    // 这里可以根据实际情况从服务器获取文书内容，或者从附件中解析
    // 假设服务器返回的是完整的Markdown格式文书内容
    documentContent.value = documentData.serviceContent || '';
  } catch (error) {
    ElMessage.error('获取文书详情失败');
    console.error('获取文书详情失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="service-of-documents-detail p-5">
    <h1 class="mb-5 text-2xl font-bold">
      {{ $t('page.law.serviceOfDocumentsDetail') }}
    </h1>

    <!-- 返回按钮 -->
    <el-button type="primary" @click="$router.back()" class="mb-4">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <!-- 基本信息卡片 -->
    <el-card class="mb-5" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">基本信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="案号">
          {{ documentDetail.caseId }}
        </el-descriptions-item>
        <el-descriptions-item label="案件名称">
          {{ documentDetail.caseName }}
        </el-descriptions-item>
        <el-descriptions-item label="文书名称">
          {{ documentDetail.documentName }}
        </el-descriptions-item>
        <el-descriptions-item label="送达状态">
          {{ documentDetail.status }}
        </el-descriptions-item>
        <el-descriptions-item label="受送达人">
          {{ documentDetail.recipient }}
        </el-descriptions-item>
        <el-descriptions-item label="受送达人类型">
          {{ documentDetail.recipientType }}
        </el-descriptions-item>
        <el-descriptions-item label="送达方式">
          {{ documentDetail.serviceMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="送达日期">
          {{ documentDetail.serviceDate }}
        </el-descriptions-item>
        <el-descriptions-item label="送达人">
          {{ documentDetail.deliverer }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{
            documentDetail.createTime
              ? formatDate(documentDetail.createTime)
              : ''
          }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 受送达人信息卡片 -->
    <el-card class="mb-5" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">受送达人信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="受送达人">
          {{ documentDetail.recipient }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ documentDetail.recipientPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="送达地址" :span="2">
          {{ documentDetail.recipientAddress }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 送达内容卡片 -->
    <el-card class="mb-5" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">送达内容</span>
        </div>
      </template>
      <div
        class="rounded bg-gray-50 p-4"
        v-html="processMarkdown(documentDetail.serviceContent)"
      ></div>
    </el-card>

    <!-- 文书内容卡片 -->
    <el-card class="mb-5" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">文书内容</span>
        </div>
      </template>
      <div
        class="rounded bg-gray-50 p-4"
        v-html="processMarkdown(documentContent)"
      ></div>
    </el-card>

    <!-- 附件信息卡片 -->
    <el-card class="mb-5" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">附件信息</span>
        </div>
      </template>
      <el-table
        v-if="
          documentDetail.attachments && documentDetail.attachments.length > 0
        "
        :data="documentDetail.attachments"
        style="width: 100%"
      >
        <el-table-column label="文件名称" width="300">
          <template #default="scope">
            <a href="#" class="text-blue-600 hover:text-blue-800">{{
              scope.row.fileName
            }}</a>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="100">
          <template #default="scope">
            {{ ((scope.row.fileSize || 0) / 1024 / 1024).toFixed(2) }} MB
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" size="small">下载</el-button>
            <el-button type="success" size="small">预览</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="p-4 text-center text-gray-500">暂无附件</div>
    </el-card>
  </div>
</template>

<style scoped>
.service-of-documents-detail {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
