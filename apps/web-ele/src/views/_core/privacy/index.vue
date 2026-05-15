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
const activeSection = ref('section-0');
const showToc = ref(true);

const tocItems = [
  { id: 'section-0', title: '前言' },
  { id: 'section-1', title: '第一条 定义' },
  { id: 'section-2', title: '第二条 我们收集的数据' },
  { id: 'section-3', title: '第三条 敏感个人信息的处理' },
  { id: 'section-4', title: '第四条 数据存储位置与安全' },
  { id: 'section-5', title: '第五条 数据使用与共享' },
  { id: 'section-6', title: '第六条 律所的责任与义务' },
  { id: 'section-7', title: '第七条 数据保留与删除' },
  { id: 'section-8', title: '第八条 用户（律所工作人员）的权利' },
  { id: 'section-9', title: '第九条 未成年人保护' },
  { id: 'section-10', title: '第十条 免责声明' },
  { id: 'section-11', title: '第十一条 协议更新' },
  { id: 'section-12', title: '第十二条 联系方式' },
  { id: 'section-13', title: '附件：数据收集清单' },
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
  let currentSection = 'section-0';

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
  const styleId = 'print-style-temp';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @media print {
      .no-print,
      nav,
      aside,
      header,
      footer,
      .monica-widget {
        display: none !important;
      }

      @page {
        margin: 1.5cm;
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
      }

      .prose h2 {
        font-size: 14pt !important;
        font-weight: bold !important;
        color: #000 !important;
      }

      a {
        color: #000 !important;
        text-decoration: underline !important;
      }

      ul {
        list-style: disc !important;
        margin-left: 20px !important;
      }

      .bg-blue-50,
      .bg-amber-50,
      .bg-gray-50 {
        background-color: #f5f5f5 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      section {
        page-break-inside: avoid !important;
      }

      h1, h2 {
        page-break-after: avoid !important;
      }

      table {
        page-break-inside: avoid !important;
      }
    }
  `;

  setTimeout(() => {
    window.print();
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
  <Page description="隐私政策与数据授权协议" title="隐私政策">
    <div class="flex flex-col lg:flex-row gap-6 mx-auto max-w-7xl">
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

      <button
        v-show="!showToc"
        @click="showToc = true"
        class="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 no-print"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="text-sm font-medium">打印</span>
            </button>
          </div>

          <div class="prose prose-lg max-w-none">
            <h1 class="text-3xl font-bold text-center text-gray-900 mb-2">
              {{ customerConfig.app.fullName }} - 隐私政策与数据授权协议
            </h1>
            <div class="text-right text-sm text-gray-500 mb-10 pb-6 border-b border-gray-200">
              <p>版本号：v1.0</p>
              <p>生效日期：{{ customerConfig.copyright.year }}年5月14日</p>
            </div>

            <!-- 前言 -->
            <section id="section-0" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                前言
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-3">
                欢迎使用「{{ customerConfig.app.fullName }}」（以下简称"本系统"）。本《隐私政策与数据授权协议》（以下简称"本协议"）由<strong>{{ customerConfig.company.name }}</strong>（以下简称"我们"）与<strong>使用本系统的律师事务所</strong>（以下简称"律所"或"您"）共同订立。在您开始使用本系统之前，请务必仔细阅读并充分理解本协议的全部内容，特别是以加粗或下划线标注的条款。
              </p>
              <p class="leading-loose text-gray-700 text-base">
                您通过注册、登录、使用本系统或以其他任何方式使用本系统服务的行为，即表示您已充分阅读、理解并同意接受本协议的全部约束。
              </p>
            </section>

            <!-- 第一条 定义 -->
            <section id="section-1" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第一条 定义
              </h2>
              <div class="space-y-3 text-gray-700 text-base">
                <p class="leading-loose"><strong>1. 个人数据：</strong>指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，包括但不限于姓名、身份证号、电话号码、电子邮箱、住址等。</p>
                <p class="leading-loose"><strong>2. 案件数据：</strong>指与破产案件相关的所有业务数据，包括但不限于案件基本信息、债权人信息、债权申报数据、审批记录、档案文件等。</p>
                <p class="leading-loose"><strong>3. 系统数据：</strong>指用户在使用本系统过程中产生的操作日志、登录记录、设备信息等技术性数据。</p>
                <p class="leading-loose"><strong>4. 敏感个人信息：</strong>指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括但不限于身份证件号码、手机号码、银行账户信息等。</p>
                <p class="leading-loose"><strong>5. 数据主体：</strong>指个人数据所关联的自然人，在本协议语境下主要包括律所用户、债权人、债务人及其他案件相关自然人。</p>
              </div>
            </section>

            <!-- 第二条 我们收集的数据 -->
            <section id="section-2" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第二条 我们收集的数据
              </h2>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 用户（律所工作人员）数据</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                在律所管理员为用户创建账号及用户使用本系统过程中，系统会收集以下信息：
              </p>
              <div class="overflow-x-auto mb-4">
                <table class="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">数据类别</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">具体字段</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">收集目的</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">身份信息</td>
                      <td class="border border-gray-300 px-4 py-2">用户名、真实姓名</td>
                      <td class="border border-gray-300 px-4 py-2">用户身份识别与账号管理</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">联系方式</td>
                      <td class="border border-gray-300 px-4 py-2">手机号码、电话号码、电子邮箱</td>
                      <td class="border border-gray-300 px-4 py-2">账号安全验证、系统通知</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">账号安全</td>
                      <td class="border border-gray-300 px-4 py-2">登录密码（加密存储）、登录IP地址、登录时间</td>
                      <td class="border border-gray-300 px-4 py-2">安全审计与异常检测</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">操作审计</td>
                      <td class="border border-gray-300 px-4 py-2">操作日志、登录次数、密码错误次数</td>
                      <td class="border border-gray-300 px-4 py-2">安全审计与合规管理</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 案件相关数据</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                律所在处理破产案件过程中录入的数据，包括但不限于：
              </p>
              <div class="overflow-x-auto mb-4">
                <table class="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">数据类别</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">具体字段</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">收集目的</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">案件信息</td>
                      <td class="border border-gray-300 px-4 py-2">案件编号、案件名称、案件类型、案件状态、法院信息</td>
                      <td class="border border-gray-300 px-4 py-2">破产案件管理核心业务</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">债权人信息</td>
                      <td class="border border-gray-300 px-4 py-2">债权人姓名/名称、联系电话、联系邮箱、联系地址、身份证件号码、法定代表人</td>
                      <td class="border border-gray-300 px-4 py-2">债权申报与债权人管理</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">债权申报</td>
                      <td class="border border-gray-300 px-4 py-2">债权金额、债权类型、申报材料、审查结果</td>
                      <td class="border border-gray-300 px-4 py-2">债权申报处理</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">审批数据</td>
                      <td class="border border-gray-300 px-4 py-2">审批流程、审批意见、审批人、审批时间</td>
                      <td class="border border-gray-300 px-4 py-2">案件审批流程管理</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">档案文件</td>
                      <td class="border border-gray-300 px-4 py-2">案件相关文件、证据材料、法律文书</td>
                      <td class="border border-gray-300 px-4 py-2">案件档案管理</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 系统自动收集的数据</h3>
              <div class="overflow-x-auto mb-4">
                <table class="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">数据类别</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">具体字段</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">收集目的</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">设备信息</td>
                      <td class="border border-gray-300 px-4 py-2">IP地址、浏览器类型、操作系统</td>
                      <td class="border border-gray-300 px-4 py-2">安全防护与兼容性保障</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">操作日志</td>
                      <td class="border border-gray-300 px-4 py-2">功能模块访问记录、数据操作记录（增/删/改/查）</td>
                      <td class="border border-gray-300 px-4 py-2">审计追溯与安全监控</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">系统备份</td>
                      <td class="border border-gray-300 px-4 py-2">数据库自动备份文件</td>
                      <td class="border border-gray-300 px-4 py-2">数据容灾与恢复</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 第三条 敏感个人信息的处理 -->
            <section id="section-3" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第三条 敏感个人信息的处理
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-3">
                本系统对以下敏感个人信息采用<strong class="text-red-600">SM4国密算法</strong>进行加密存储，确保即使数据库发生泄露，敏感数据也无法被直接读取：
              </p>
              <div class="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg space-y-2 text-gray-700 text-base mb-3">
                <p class="leading-loose">1. 手机号码</p>
                <p class="leading-loose">2. 电话号码</p>
                <p class="leading-loose">3. 身份证件号码</p>
              </div>
              <p class="leading-loose text-gray-700 text-base">
                上述数据在数据库中以密文形式存储，仅在业务需要时通过系统内部解密后使用。我们不会以明文形式将上述敏感信息传输至系统外部。
              </p>
            </section>

            <!-- 第四条 数据存储位置与安全 -->
            <section id="section-4" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第四条 数据存储位置与安全
              </h2>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 数据存储位置</h3>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4 mb-4">
                <li class="leading-loose"><strong>本地部署版：</strong>所有数据存储在律所自身的服务器或律所指定的私有机房中，由律所自行管理和维护数据安全。</li>
                <li class="leading-loose">
                  <strong>SaaS云服务版：</strong>所有数据存储在<strong>阿里云（Alibaba Cloud）</strong>位于中国境内的合规机房，阿里云已通过以下权威认证：
                  <ul class="list-inside list-disc space-y-1 ml-6 mt-2 text-gray-600">
                    <li>ISO 27001 信息安全管理体系认证</li>
                    <li>ISO 27701 隐私信息管理体系认证</li>
                    <li>公安部信息系统安全等级保护三级认证（等保三级）</li>
                    <li>CSA STAR 云安全认证</li>
                  </ul>
                </li>
              </ul>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 数据安全保障措施</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                我们采取以下多层次的安全保障措施保护您的数据：
              </p>
              <div class="overflow-x-auto mb-4">
                <table class="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">安全层面</th>
                      <th class="border border-gray-300 px-4 py-2 text-left font-semibold">具体措施</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">数据加密</td>
                      <td class="border border-gray-300 px-4 py-2">敏感字段采用SM4国密算法加密存储；数据传输全程使用HTTPS/TLS加密</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">访问控制</td>
                      <td class="border border-gray-300 px-4 py-2">基于角色（RBAC）的细粒度权限控制，用户仅能访问其授权范围内的数据</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">审计追溯</td>
                      <td class="border border-gray-300 px-4 py-2">全量操作审计日志记录，支持不可篡改的哈希链审计技术</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">数据备份</td>
                      <td class="border border-gray-300 px-4 py-2">定时自动数据库备份，支持数据恢复</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">数据库防护</td>
                      <td class="border border-gray-300 px-4 py-2">数据库连接池管理、SQL注入防护、最小权限原则</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-4 py-2 font-medium">网络安全</td>
                      <td class="border border-gray-300 px-4 py-2">防火墙、入侵检测、DDoS防护（SaaS版由阿里云提供）</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 数据跨境传输</h3>
              <p class="leading-loose text-gray-700 text-base">
                本系统的所有数据均存储于<strong>中华人民共和国境内</strong>。我们不会将数据跨境传输至境外，除非法律法规另有要求并经过您的明确同意。
              </p>
            </section>

            <!-- 第五条 数据使用与共享 -->
            <section id="section-5" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第五条 数据使用与共享
              </h2>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 数据使用范围</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                我们收集的全部数据仅用于以下目的：
              </p>
              <div class="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg space-y-2 text-gray-700 text-base mb-4">
                <p class="leading-loose">1. 提供破产案件管理的核心业务功能；</p>
                <p class="leading-loose">2. 保障系统安全稳定运行；</p>
                <p class="leading-loose">3. 履行法律法规规定的义务；</p>
                <p class="leading-loose">4. 根据律所的要求提供技术支持和客户服务。</p>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 数据共享原则</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                我们<strong class="text-red-600">不会</strong>将您的数据出售、出租或交易给任何第三方。仅在以下情形下，我们可能共享您的数据：
              </p>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4">
                <li class="leading-loose">在获得您明确同意或授权的情况下；</li>
                <li class="leading-loose">根据法律法规规定、行政或司法机关的合法要求；</li>
                <li class="leading-loose">为保护我们或公众的合法权益所必需。</li>
              </ul>
            </section>

            <!-- 第六条 律所的责任与义务 -->
            <section id="section-6" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第六条 律所的责任与义务
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-1">
                <span class="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm font-medium mr-1">重要</span>
              </p>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 确保数据来源合法性</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">
                律所作为本系统的使用主体和数据控制者，承担以下法定责任：
              </p>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-4">
                <p class="leading-loose text-gray-800 text-base font-semibold mb-3">
                  律所有责任确保其录入本系统的所有数据（包括但不限于债权人个人信息、债权申报数据、案件相关文件等）均已获得相关数据主体（债权人、债务人等）的合法授权或符合法律法规规定的其他合法性基础。
                </p>
                <p class="leading-loose text-gray-700 text-base mb-2">具体而言，律所应当确保：</p>
                <ol class="list-decimal list-inside space-y-1 text-gray-700 text-base ml-2">
                  <li class="leading-loose">在收集债权人个人信息时，已向其明确告知信息收集的目的、方式和范围，并取得其明确同意；</li>
                  <li class="leading-loose">在录入债权人的敏感个人信息（身份证号、手机号等）时，已获取其单独同意；</li>
                  <li class="leading-loose">所有录入数据的收集、使用和处理均符合《中华人民共和国个人信息保护法》《中华人民共和国数据安全法》《中华人民共和国网络安全法》等相关法律法规的要求。</li>
                </ol>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 律所的数据管理义务</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">律所在使用本系统期间应当：</p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700 text-base ml-2">
                <li class="leading-loose">妥善管理本所用户的账号和权限，确保仅授权人员可以访问系统；</li>
                <li class="leading-loose">定期审查用户权限，及时注销已离职或不再需要访问权限的用户账号；</li>
                <li class="leading-loose">不得利用本系统从事任何违法违规的数据处理活动；</li>
                <li class="leading-loose">对因律所自身原因导致的数据泄露、滥用等问题承担相应法律责任。</li>
              </ol>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">6.3 数据主体权利响应</h3>
              <p class="leading-loose text-gray-700 text-base">
                当数据主体（债权人等）向律所行使个人信息权利（查阅、更正、删除、撤回同意等）时，律所有义务及时响应和处理。如需技术协助，我们将在合理范围内提供支持。
              </p>
            </section>

            <!-- 第七条 数据保留与删除 -->
            <section id="section-7" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第七条 数据保留与删除
              </h2>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 数据保留期限</h3>
              <ul class="list-inside list-disc space-y-2 text-gray-700 text-base ml-4 mb-4">
                <li class="leading-loose"><strong>用户账号数据：</strong>在账号存续期间保留，账号注销后按律所要求进行删除或匿名化处理；</li>
                <li class="leading-loose"><strong>案件数据：</strong>按照法律法规对于破产案件档案保存的要求，在案件结案后继续保留法定期限；</li>
                <li class="leading-loose"><strong>审计日志：</strong>按照相关法律法规及合规要求保留，一般不少于6个月；</li>
                <li class="leading-loose"><strong>系统备份：</strong>按照系统设定的备份保留策略，默认保留30天。</li>
              </ul>

              <h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 数据删除</h3>
              <p class="leading-loose text-gray-700 text-base mb-3">在以下情形下，律所可向我们提出数据删除请求：</p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700 text-base ml-2 mb-3">
                <li class="leading-loose">数据收集和处理的目的已实现或不再必要；</li>
                <li class="leading-loose">律所停止使用本系统；</li>
                <li class="leading-loose">法律法规规定的其他情形。</li>
              </ol>
              <p class="leading-loose text-gray-700 text-base">
                我们将在收到合法有效的删除请求后，在法律允许的期限内完成数据删除或匿名化处理。
              </p>
            </section>

            <!-- 第八条 用户（律所工作人员）的权利 -->
            <section id="section-8" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第八条 用户（律所工作人员）的权利
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-3">作为本系统的用户，您享有以下权利：</p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700 text-base ml-2">
                <li class="leading-loose"><strong>知情权：</strong>有权知晓本系统如何处理您的个人信息；</li>
                <li class="leading-loose"><strong>查阅权：</strong>有权查阅本系统中存储的您的个人信息；</li>
                <li class="leading-loose"><strong>更正权：</strong>发现个人信息有误时，有权要求更正；</li>
                <li class="leading-loose"><strong>删除权：</strong>在符合法律规定的情形下，有权要求删除您的个人信息；</li>
                <li class="leading-loose"><strong>撤回同意权：</strong>您可以随时撤回对个人信息处理的同意，但不影响撤回前已进行的处理活动的合法性。</li>
              </ol>
            </section>

            <!-- 第九条 未成年人保护 -->
            <section id="section-9" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第九条 未成年人保护
              </h2>
              <p class="leading-loose text-gray-700 text-base">
                本系统为专业法律服务工具，面向律师事务所使用，不以未成年人为服务对象。如律所在案件处理中不可避免地涉及未成年人信息，律所应当确保已取得其监护人的明示同意，并采取更加严格的保护措施。
              </p>
            </section>

            <!-- 第十条 免责声明 -->
            <section id="section-10" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第十条 免责声明
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-3">在以下情形下，我们不承担法律责任：</p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700 text-base ml-2">
                <li class="leading-loose">因律所未按本协议第六条要求取得债权人等数据主体的合法授权而导致的数据纠纷；</li>
                <li class="leading-loose">因律所自身安全管理不善（如账号密码泄露、权限管理不当）导致的数据泄露；</li>
                <li class="leading-loose">因不可抗力（如自然灾害、网络攻击等）导致的数据损失，但我们已采取合理的防护措施除外；</li>
                <li class="leading-loose">律所录入数据的准确性、真实性和完整性由律所自行负责。</li>
              </ol>
            </section>

            <!-- 第十一条 协议更新 -->
            <section id="section-11" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第十一条 协议更新
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-4">
                我们可能根据法律法规的变化或业务需要适时更新本协议。协议更新后，我们将在系统内发布更新版本并通过系统通知、弹窗等方式提醒您。如您在协议更新后继续使用本系统，即表示您接受更新后的协议。
              </p>
              <p class="leading-loose text-gray-700 text-base mb-3">重大变更的情形包括但不限于：</p>
              <ol class="list-decimal list-inside space-y-1 text-gray-700 text-base ml-2">
                <li class="leading-loose">收集的数据范围发生显著变化；</li>
                <li class="leading-loose">数据使用目的发生变更；</li>
                <li class="leading-loose">数据存储位置发生迁移；</li>
                <li class="leading-loose">数据共享方式发生改变。</li>
              </ol>
            </section>

            <!-- 第十二条 联系方式 -->
            <section id="section-12" class="mb-10 pb-6 border-b border-gray-100 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                第十二条 联系方式
              </h2>
              <p class="leading-loose text-gray-700 text-base mb-3">
                如您对本隐私政策或数据处理有任何疑问、意见或建议，请通过以下方式联系我们：
              </p>
              <div class="text-gray-700 text-base bg-gray-50 p-5 rounded-lg">
                <p class="leading-loose mb-2"><strong>公司名称：</strong>{{ customerConfig.company.name }}</p>
                <p class="leading-loose mb-2"><strong>联系邮箱：</strong>{{ customerConfig.company.email }}</p>
                <p class="leading-loose text-gray-500 text-sm mt-3">我们将在收到您的反馈后15个工作日内予以回复。</p>
              </div>
            </section>

            <!-- 附件：数据收集清单 -->
            <section id="section-13" class="mb-10 scroll-mt-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-1 h-6 bg-green-500 rounded-full"></span>
                附件：数据收集清单
              </h2>
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">序号</th>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">数据字段</th>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">数据类别</th>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">是否敏感</th>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">加密存储</th>
                      <th class="border border-gray-300 px-3 py-2 text-left font-semibold">收集方式</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">1</td>
                      <td class="border border-gray-300 px-3 py-2">用户名</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">用户注册/管理员创建</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">2</td>
                      <td class="border border-gray-300 px-3 py-2">真实姓名</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">管理员录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">3</td>
                      <td class="border border-gray-300 px-3 py-2">手机号码</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">是</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">SM4加密</td>
                      <td class="border border-gray-300 px-3 py-2">管理员录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">4</td>
                      <td class="border border-gray-300 px-3 py-2">电话号码</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">是</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">SM4加密</td>
                      <td class="border border-gray-300 px-3 py-2">管理员录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">5</td>
                      <td class="border border-gray-300 px-3 py-2">电子邮箱</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">管理员录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">6</td>
                      <td class="border border-gray-300 px-3 py-2">登录密码</td>
                      <td class="border border-gray-300 px-3 py-2">用户数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">是</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">哈希加密</td>
                      <td class="border border-gray-300 px-3 py-2">用户设置</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">7</td>
                      <td class="border border-gray-300 px-3 py-2">登录IP地址</td>
                      <td class="border border-gray-300 px-3 py-2">系统数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">系统自动记录</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">8</td>
                      <td class="border border-gray-300 px-3 py-2">登录时间</td>
                      <td class="border border-gray-300 px-3 py-2">系统数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">系统自动记录</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">9</td>
                      <td class="border border-gray-300 px-3 py-2">操作日志</td>
                      <td class="border border-gray-300 px-3 py-2">系统数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">系统自动记录</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">10</td>
                      <td class="border border-gray-300 px-3 py-2">债权人姓名/名称</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">11</td>
                      <td class="border border-gray-300 px-3 py-2">债权人联系电话</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">是</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">SM4加密</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">12</td>
                      <td class="border border-gray-300 px-3 py-2">债权人邮箱</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">13</td>
                      <td class="border border-gray-300 px-3 py-2">债权人地址</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">14</td>
                      <td class="border border-gray-300 px-3 py-2">债权人身份证号</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-red-600 font-medium">是</td>
                      <td class="border border-gray-300 px-3 py-2 text-center text-green-600 font-medium">SM4加密</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">15</td>
                      <td class="border border-gray-300 px-3 py-2">法定代表人</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">16</td>
                      <td class="border border-gray-300 px-3 py-2">案件信息</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">17</td>
                      <td class="border border-gray-300 px-3 py-2">债权申报数据</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所录入</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">18</td>
                      <td class="border border-gray-300 px-3 py-2">审批记录</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">系统自动记录</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-300 px-3 py-2 text-center">19</td>
                      <td class="border border-gray-300 px-3 py-2">档案文件</td>
                      <td class="border border-gray-300 px-3 py-2">案件数据</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">视内容而定</td>
                      <td class="border border-gray-300 px-3 py-2 text-center">否</td>
                      <td class="border border-gray-300 px-3 py-2">律所上传</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-right text-gray-500 text-sm mt-6 pt-4 border-t border-gray-200">
                本协议由{{ customerConfig.company.name }}制定并负责解释。
              </p>
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
  .no-print {
    display: none !important;
  }

  body > :not(.printable-content),
  header,
  aside,
  nav,
  footer {
    display: none !important;
  }

  @page {
    margin: 1.5cm;
  }

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

  .p-6, .p-8, .p-10 {
    padding: 0 !important;
  }

  a {
    color: #000 !important;
    text-decoration: underline !important;
  }

  .bg-blue-50,
  .bg-amber-50,
  .bg-gray-50 {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  section {
    page-break-inside: avoid !important;
  }

  h1, h2 {
    page-break-after: avoid !important;
  }

  ul {
    page-break-inside: avoid !important;
  }

  table {
    page-break-inside: avoid !important;
    font-size: 10pt !important;
  }

  table thead {
    display: table-header-group !important;
  }
}
</style>
