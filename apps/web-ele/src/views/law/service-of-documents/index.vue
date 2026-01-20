<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import { getDocumentListApi } from '#/api/core';
import { $t } from '#/locales';

const router = useRouter();

// 搜索条件
const searchForm = ref({
  caseId: '',
  documentName: '',
  status: '',
  senderType: '', // 我发起的、收到的送达
  sendStatus: '', // 已发送、暂存送达
});

// 文书列表
const documentList = ref<any[]>([]);
// 加载状态
const loading = ref(false);
// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

// 发送状态选项
const sendStatusOptions = [
  { label: '已发送', value: '已发送' },
  { label: '暂存送达', value: '暂存送达' },
];

// 服务状态选项
const statusOptions = [
  { label: '已送达', value: '已送达' },
  { label: '待签收', value: '待签收' },
  { label: '已签收', value: '已签收' },
  { label: '送达失败', value: '送达失败' },
];

// 获取文书列表
const fetchDocumentList = async () => {
  loading.value = true;
  try {
    const response = await getDocumentListApi({
      ...searchForm.value,
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
    });
    if (response.data?.list && Array.isArray(response.data.list)) {
      documentList.value = response.data.list.map((doc: any) => ({
        ...doc,
        id: doc.SEP_ID || doc.id,
      }));
      pagination.value.total = response.data.total || 0;
    } else {
      documentList.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    ElMessage.error('获取文书列表失败');
    console.error('获取文书列表失败:', error);
    documentList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索函数
const handleSearch = () => {
  pagination.value.page = 1;
  fetchDocumentList();
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    caseId: '',
    documentName: '',
    status: '',
    senderType: '',
    sendStatus: '',
  };
  pagination.value.page = 1;
  fetchDocumentList();
};

// 设置发送者类型
const setSenderType = (type: string) => {
  searchForm.value.senderType = type;
  handleSearch();
};

// 清除发送者类型
const clearSenderType = () => {
  searchForm.value.senderType = '';
  handleSearch();
};

// 分页变化处理
const handlePageChange = (page: number, size: number) => {
  pagination.value.page = page;
  pagination.value.size = size;
  fetchDocumentList();
};

// 页面加载时获取数据
onMounted(() => {
  fetchDocumentList();
});
</script>

<template>
  <div class="service-of-documents p-5">
    <h1 class="mb-5 text-2xl font-bold">
      {{ $t('page.law.serviceOfDocuments') }}
    </h1>

    <!-- 搜索区域 -->
    <div class="mb-5 rounded-lg bg-white p-4 shadow-md">
      <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
        <el-input
          v-model="searchForm.caseId"
          placeholder="案号"
          clearable
        />
        <el-input
          v-model="searchForm.documentName"
          placeholder="文书名称"
          clearable
        />
        <el-select v-model="searchForm.status" placeholder="送达状态" clearable>
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div class="flex gap-2">
          <el-button
            type="primary"
            :plain="searchForm.senderType !== '我发起的'"
            @click="setSenderType('我发起的')"
          >
            我发起的
          </el-button>
          <el-button
            type="primary"
            :plain="searchForm.senderType !== '收到的送达'"
            @click="setSenderType('收到的送达')"
          >
            收到的送达
          </el-button>
          <el-button
            v-if="searchForm.senderType"
            type="default"
            size="small"
            @click="clearSenderType"
          >
            清除
          </el-button>
        </div>
        <el-select
          v-model="searchForm.sendStatus"
          placeholder="发送状态"
          clearable
        >
          <el-option
            v-for="option in sendStatusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="handleReset" type="default">重置</el-button>
        <el-button @click="handleSearch" type="primary">搜索</el-button>
        <el-button
          type="success"
          @click="$router.push('/service-of-documents/add')"
        >
          新增送达
        </el-button>
      </div>
    </div>

    <!-- 文书列表 -->
    <div class="rounded-lg bg-white shadow-md">
      <el-table
        :data="documentList"
        stripe
        style="width: 100%"
        :loading="loading"
      >
        <el-table-column prop="caseId" label="案号" />
        <el-table-column prop="caseName" label="案件名称" />
        <el-table-column prop="documentName" label="文书名称" />
        <el-table-column prop="recipient" label="受送达人" />
        <el-table-column prop="recipientType" label="受送达人类型" />
        <el-table-column prop="serviceMethod" label="送达方式" />
        <el-table-column prop="status" label="送达状态">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === '已送达'
                  ? 'success'
                  : scope.row.status === '待签收'
                    ? 'warning'
                    : scope.row.status === '已签收'
                      ? 'primary'
                      : 'danger'
              "
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceDate" label="送达日期" />
        <el-table-column prop="deliverer" label="送达人" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="$router.push(`/service-of-documents/${scope.row.id}`)"
              class="mr-2"
            >
              查看详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="
                $router.push(`/service-of-documents/${scope.row.id}/records`)
              "
            >
              送达记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handlePageChange"
          @current-change="(page) => handlePageChange(page, pagination.size)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-of-documents {
  min-height: calc(100vh - 100px);
}
</style>
