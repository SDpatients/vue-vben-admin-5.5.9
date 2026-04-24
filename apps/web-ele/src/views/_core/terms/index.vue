<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { Card, Page } from '@vben/common-ui';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'TermsPage' });

const router = useRouter();
const activeSection = ref('section-1');
const showToc = ref(true);

const tocItems = [
  { id: 'section-1', title: '一、协议的范围' },
  { id: 'section-2', title: '二、服务内容' },
  { id: 'section-3', title: '三、账号管理' },
  { id: 'section-4', title: '四、使用规范' },
  { id: 'section-5', title: '五、知识产权' },
  { id: 'section-6', title: '六、免责声明' },
  { id: 'section-7', title: '七、协议的变更和终止' },
  { id: 'section-8', title: '八、争议解决' },
  { id: 'section-9', title: '九、联系方式' },
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
  <Page description="用户服务协议" title="用户协议">
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="text-sm font-medium">打印</span>
            </button>
          </div>

          <div class="prose prose-lg max-w-none">
            <h1 class="text-3xl font-bold text-center text-gray-900 mb-2">用户服务协议</h1>
            <p class="text-right text-sm text-gray-500 mb-10 pb-6 border-b border-gray-200">
              版本日期：{{ customerConfig.copyright.year }}年1月1日
            </p>

            <section id="section-1" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                一、协议的范围
              </h2>
              <p class="leading-loose text-gray-700 text-base">
                本协议是您（以下简称"用户"）与{{ customerConfig.company.name }}（以下简称"本公司"）之间关于使用本公司提供的{{ customerConfig.app.fullName }}（以下简称"本系统"）所订立的协议。
                请您仔细阅读本协议，一旦您开始使用本系统，即表示您已同意并接受本协议的所有条款。
              </p>
            </section>

            <section id="section-2" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                二、服务内容
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-4">
                本系统为用户提供以下服务：
              </p>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4">
                <li class="leading-loose">破产案件全流程管理</li>
                <li class="leading-loose">债权人信息管理</li>
                <li class="leading-loose">债务人资产管理</li>
                <li class="leading-loose">工作计划和任务跟踪</li>
                <li class="leading-loose">文档管理和模板生成</li>
                <li class="leading-loose">审批流程管理</li>
                <li class="leading-loose">数据统计和报表分析</li>
              </ul>
            </section>

            <section id="section-3" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
                三、账号管理
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">3.1 用户在使用本系统前需要注册账号，并提供真实、准确、完整的个人或企业信息。</p>
                <p class="leading-loose">3.2 用户应妥善保管账号和密码，对账号下的所有行为承担法律责任。</p>
                <p class="leading-loose">3.3 如发现账号被盗用或存在安全问题，应立即通知本公司。</p>
                <p class="leading-loose">3.4 本公司有权对违反法律法规或本协议的用户账号采取限制、暂停或终止服务等措施。</p>
              </div>
            </section>

            <section id="section-4" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>四、使用规范
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">4.1 用户应遵守中华人民共和国相关法律法规。</p>
                <p class="leading-loose">4.2 用户不得利用本系统从事任何违法违规活动。</p>
                <p class="leading-loose">4.3 用户不得对本系统进行反向工程、反编译或试图发现源代码。</p>
                <p class="leading-loose">4.4 用户不得干扰或破坏本系统的正常运行。</p>
                <p class="leading-loose">4.5 用户应妥善保管在系统中存储的数据，定期备份重要信息。</p>
              </div>
            </section>

            <section id="section-5" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>五、知识产权
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">5.1 本系统的所有知识产权归本公司所有。</p>
                <p class="leading-loose">5.2 本系统基于 Vue Vben Admin (MIT License) 开发构建，遵循 MIT 许可证的相关规定。</p>
                <p class="leading-loose">5.3 用户在使用本系统过程中产生的数据归用户所有，但用户授予本公司为提供服务所必需的使用权。</p>
              </div>
            </section>

            <section id="section-6" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>六、免责声明
              </h2>
              <div class="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                <div class="space-y-3 text-gray-700 text-base">
                  <p class="leading-loose">6.1 本系统按"现状"提供，本公司不对服务的及时性、安全性、准确性作绝对保证。</p>
                  <p class="leading-loose">6.2 因不可抗力或第三方原因导致的服务中断，本公司不承担责任。</p>
                  <p class="leading-loose">6.3 用户应自行判断本系统内容的适用性，并承担使用风险。</p>
                </div>
              </div>
            </section>

            <section id="section-7" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>七、协议的变更和终止
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose">7.1 本公司有权根据需要修改本协议，修改后的协议将在系统中公布。</p>
                <p class="leading-loose">7.2 如用户不同意修改后的协议，应停止使用本系统。</p>
                <p class="leading-loose">7.3 本公司保留随时终止服务的权利。</p>
              </div>
            </section>

            <section id="section-8" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>八、争议解决
              </h2>
              <p class="leading-loose text-gray-700 text-base">
                本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。
                如发生争议，双方应友好协商解决；协商不成的，任何一方均可向本公司所在地有管辖权的人民法院提起诉讼。
              </p>
            </section>

            <section id="section-9" class="mb-10 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-blue-500 rounded-full"></span>九、联系方式
              </h2>
              <div class="text-gray-700 text-base space-y-2 bg-gray-50 p-5 rounded-lg">
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
