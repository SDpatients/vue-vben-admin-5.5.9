<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { Card, Page } from '@vben/common-ui';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'PrivacyPage' });

const router = useRouter();
const activeSection = ref('section-1');
const showToc = ref(true);

const tocItems = [
  { id: 'section-1', title: '一、引言' },
  { id: 'section-2', title: '二、信息收集' },
  { id: 'section-3', title: '三、信息使用' },
  { id: 'section-4', title: '四、信息存储和保护' },
  { id: 'section-5', title: '五、信息共享' },
  { id: 'section-6', title: '六、用户权利' },
  { id: 'section-7', title: '七、Cookie 和类似技术' },
  { id: 'section-8', title: '八、政策更新' },
  { id: 'section-9', title: '九、联系我们' },
];

const goBack = () => {
  router.back();
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleScroll = () => {
  const scrollPosition = window.scrollY;
  let currentSection = 'section-1';

  tocItems.forEach(item => {
    const element = document.getElementById(item.id);
    if (element) {
      const elementTop = element.offsetTop - 100;
      if (scrollPosition >= elementTop) {
        currentSection = item.id;
      }
    }
  });

  activeSection.value = currentSection;
};

const printDocument = () => {
  console.log('[打印调试] 开始打印文档');
  
  // 添加打印时的临时样式
  const styleId = 'print-style-temp';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  // 简洁有效的打印样式
  styleEl.textContent = `
    @media print {
      /* 隐藏不需要的UI元素 */
      .no-print,
      nav,
      aside,
      header,
      footer,
      .monica-widget {
        display: none !important;
      }
      
      /* 设置打印页面的边距 */
      @page {
        margin: 1.5cm;
      }
      
      /* 确保内容区域正常显示 */
      .prose {
        font-size: 12pt !important;
        line-height: 1.6 !important;
        color: #000 !important;
        max-width: 100% !important;
      }
      
      .prose h1 {
        font-size: 18pt !important;
        font-weight: bold !important;
        color: #000 !important;
      }
      
      .prose h2 {
        font-size: 14pt !important;
        font-weight: bold !important;
        color: #000 !important;
      }
      
      /* 链接样式 */
      a {
        color: #000 !important;
        text-decoration: underline !important;
      }
      
      /* 列表样式 */
      ul {
        list-style: disc !important;
        margin-left: 20px !important;
      }
      
      /* 保持背景色可见 */
      .bg-blue-50,
      .bg-amber-50,
      .bg-gray-50 {
        background-color: #f5f5f5 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* 防止章节被截断 */
      section {
        page-break-inside: avoid !important;
      }
      
      h1, h2 {
        page-break-after: avoid !important;
      }
    }
  `;
  
  console.log('[打印调试] 临时样式已添加，准备打印');
  
  // 延迟打印确保样式生效
  setTimeout(() => {
    window.print();
    console.log('[打印调试] 打印完成');
  }, 200);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <Page description="隐私政策说明" title="隐私政策">
    <div class="flex flex-col lg:flex-row gap-6 mx-auto max-w-7xl">
      <!-- 侧边目录导航 -->
      <aside 
        v-if="showToc" 
        class="hidden lg:block lg:w-72 shrink-0 no-print"
      >
        <div class="sticky top-6">
          <Card class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">目录导航</h3>
              <button
                @click="showToc = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav class="space-y-1">
              <button
                v-for="item in tocItems"
                :key="item.id"
                @click="scrollToSection(item.id)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200',
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                {{ item.title }}
              </button>
            </nav>
            <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                @click="printDocument"
                class="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                打印文档
              </button>
            </div>
          </Card>
        </div>
      </aside>

      <!-- 显示目录按钮（移动端） -->
      <button
        v-show="!showToc"
        @click="showToc = true"
        class="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 no-print"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- 主要内容 -->
      <div class="flex-1 min-w-0">
        <Card class="p-6 lg:p-10">
          <div class="flex items-center justify-between mb-8 no-print">
            <button
              @click="goBack"
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="text-sm font-medium">返回</span>
            </button>
            <button
              @click="printDocument"
              class="hidden lg:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="text-sm font-medium">打印</span>
            </button>
          </div>

          <div class="prose prose-lg max-w-none">
            <h1 class="text-3xl font-bold text-center text-gray-900 mb-2">隐私政策</h1>
            <p class="text-right text-sm text-gray-500 mb-10 pb-6 border-b border-gray-200">
              版本日期：{{ customerConfig.copyright.year }}年1月1日
            </p>

            <section id="section-1" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                一、引言
              </h2>
              <p class="leading-loose text-gray-700 text-base">
                {{ customerConfig.company.name }}（以下简称"本公司"）非常重视用户的隐私保护。
                本隐私政策旨在向您说明我们在您使用{{ customerConfig.app.fullName }}（以下简称"本系统"）时如何收集、使用、存储和保护您的个人信息。
                请您仔细阅读并理解本政策的内容。
              </p>
            </section>

            <section id="section-2" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                二、信息收集
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-4">
                我们可能会收集以下类型的信息：
              </p>
              <div class="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg space-y-3 text-gray-700 text-base">
                <p class="leading-loose"><strong>2.1 账号信息：</strong>用户名、真实姓名、电子邮箱、手机号码等。</p>
                <p class="leading-loose"><strong>2.2 企业信息：</strong>公司名称、统一社会信用代码、营业执照等。</p>
                <p class="leading-loose"><strong>2.3 业务数据：</strong>案件信息、债权人信息、债务人信息、文档资料等。</p>
                <p class="leading-loose"><strong>2.4 使用数据：</strong>登录日志、操作记录、IP地址、设备信息等。</p>
                <p class="leading-loose"><strong>2.5 技术数据：</strong>浏览器类型、操作系统、访问时间等。</p>
              </div>
            </section>

            <section id="section-3" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                三、信息使用
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-4">
                我们收集的信息将用于以下目的：
              </p>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4">
                <li class="leading-loose">提供、维护和改进本系统的服务</li>
                <li class="leading-loose">验证用户身份和授权访问</li>
                <li class="leading-loose">处理用户的业务请求和操作</li>
                <li class="leading-loose">发送系统通知和重要更新</li>
                <li class="leading-loose">保障系统安全和防止欺诈行为</li>
                <li class="leading-loose">遵守法律法规和监管要求</li>
              </ul>
            </section>

            <section id="section-4" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                四、信息存储和保护
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">4.1 我们采用业界标准的安全措施保护您的信息，包括数据加密、访问控制、防火墙等。</p>
                <p class="leading-loose">4.2 您的数据存储在中华人民共和国境内的服务器上。</p>
                <p class="leading-loose">4.3 我们会定期备份数据以防止数据丢失。</p>
                <p class="leading-loose">4.4 我们限制员工访问用户数据的权限，并对相关人员进行保密培训。</p>
              </div>
            </section>

            <section id="section-5" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                五、信息共享
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">5.1 我们不会向第三方出售、出租或交易您的个人信息。</p>
                <p class="leading-loose">5.2 在以下情况下，我们可能会共享您的信息：</p>
                <ul class="list-inside list-disc space-y-2 pl-4 text-gray-700 text-base">
                  <li class="leading-loose">获得您的明确同意</li>
                  <li class="leading-loose">应法律法规、司法机关或行政机关的要求</li>
                  <li class="leading-loose">为保护本公司或用户的合法权益</li>
                  <li class="leading-loose">与关联公司共享以提供更好的服务</li>
                </ul>
              </div>
            </section>

            <section id="section-6" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                六、用户权利
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-4">
                您对自己的个人信息享有以下权利：
              </p>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4">
                <li class="leading-loose">访问和查询您的个人信息</li>
                <li class="leading-loose">更正或更新不准确的信息</li>
                <li class="leading-loose">删除您的个人信息（法律法规另有规定的除外）</li>
                <li class="leading-loose">撤回之前授予的同意</li>
                <li class="leading-loose">注销您的账号</li>
              </ul>
            </section>

            <section id="section-7" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                七、Cookie 和类似技术
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">7.1 我们可能使用 Cookie 和类似技术来改善用户体验和分析使用情况。</p>
                <p class="leading-loose">7.2 您可以通过浏览器设置管理 Cookie 的使用。</p>
              </div>
            </section>

            <section id="section-8" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                八、政策更新
              </h2>
              <p class="leading-loose text-gray-700 text-base">
                我们可能会不时更新本隐私政策。更新后的政策将在本系统中公布，并注明更新日期。
                如您不同意更新后的政策，应停止使用本系统。
              </p>
            </section>

            <section id="section-9" class="mb-10 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                九、联系我们
              </h2>
              <div class="text-gray-700 text-base bg-gray-50 p-5 rounded-lg">
                <p class="leading-loose mb-3">如您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</p>
                <p class="leading-loose"><strong>公司名称：</strong>{{ customerConfig.company.name }}</p>
                <p class="leading-loose"><strong>联系邮箱：</strong>{{ customerConfig.company.email }}</p>
              </div>
            </section>
          </div>

          <div class="mt-10 pt-6 border-t border-gray-200 flex justify-center gap-4 lg:hidden no-print">
            <button
              @click="goBack"
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回
            </button>
            <button
              @click="printDocument"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              打印文档
            </button>
          </div>
        </Card>
      </div>
    </div>
  </Page>
</template>

<style scoped>
@media print {
  /* 隐藏所有不应打印的元素 */
  .no-print {
    display: none !important;
  }
  
  /* 隐藏页面的导航栏、侧边栏等公共组件 */
  body > :not(.printable-content),
  header,
  aside,
  nav,
  footer {
    display: none !important;
  }
  
  /* 设置打印页面的边距 */
  @page {
    margin: 1.5cm;
  }
  
  /* 确保内容区域宽度合适 */
  .max-w-7xl {
    max-width: 100% !important;
  }
  
  .prose {
    font-size: 12pt !important;
    line-height: 1.6 !important;
    color: #000 !important;
    max-width: 100% !important;
  }
  
  .prose h1 {
    font-size: 18pt !important;
    font-weight: bold !important;
    color: #000 !important;
    page-break-after: avoid !important;
  }
  
  .prose h2 {
    font-size: 14pt !important;
    font-weight: bold !important;
    color: #000 !important;
    page-break-after: avoid !important;
  }
  
  /* 移除卡片的边框和阴影，让打印更干净 */
  .p-6, .p-8, .p-10 {
    padding: 0 !important;
  }
  
  /* 优化链接样式 */
  a {
    color: #000 !important;
    text-decoration: underline !important;
  }
  
  /* 优化背景高亮内容，打印时保持可见性 */
  .bg-blue-50,
  .bg-amber-50,
  .bg-gray-50 {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* 防止章节在打印时被分割 */
  section {
    page-break-inside: avoid !important;
  }
  
  /* 章节标题不会单独出现在页面底部 */
  h1, h2 {
    page-break-after: avoid !important;
  }
  
  /* 列表不会被分割 */
  ul {
    page-break-inside: avoid !important;
  }
}
</style>
