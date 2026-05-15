<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'ProductIntroPage' });

const router = useRouter();

function goToLogin() {
  router.push('/auth/login');
}

const painPoints = [
  {
    icon: '📑',
    title: '材料繁杂，手工管理易出错',
    desc: '破产案件涉及大量法律文书、债权申报材料、资金凭证，纸质管理不仅效率低下，还容易出现遗漏和错误。',
  },
  {
    icon: '⏰',
    title: '关键节点易遗漏',
    desc: '破产程序法定时限严格，债权申报截止日、债权人会议日期、财产分配期限等关键节点稍有不慎就会错过。',
  },
  {
    icon: '💰',
    title: '资金流水难追踪',
    desc: '破产费用、共益债务、财产分配等资金往来频繁，手工记账容易混乱，审计追溯困难。',
  },
  {
    icon: '📋',
    title: '债权审核工作量大',
    desc: '面对数十甚至数百笔债权申报，逐一核对金额、审查证据材料、分类登记，耗时耗力且易出错。',
  },
  {
    icon: '🤝',
    title: '团队协作效率低',
    desc: '主办律师、协办律师、财务人员之间信息不对称，案件进度难以同步，审批流程冗长。',
  },
  {
    icon: '📄',
    title: '文书撰写重复劳动',
    desc: '同类型法律文书反复起草，格式不统一、内容易遗漏，缺乏标准化的模板支持。',
  },
];

const features = [
  {
    icon: '⚖️',
    title: '破产案件全生命周期管理',
    desc: '从立案受理、债权申报审核、资产清查、债权人会议到结案归档，系统按破产法七大阶段标准流程，逐项引导案件推进，确保每一步都合规有序。',
    highlights: ['七阶段标准化流程', '案件状态自动流转', '进度实时可查'],
  },
  {
    icon: '📝',
    title: '债权申报与智能审核',
    desc: '完整记录每笔债权的债权人信息、金额构成、担保情况和证据材料。系统自动计算本息合计，支持多维度筛选查阅，让债权审核工作更加高效准确。',
    highlights: ['债权信息完整登记', '自动计算金额合计', '多级审核流程'],
  },
  {
    icon: '💳',
    title: '资金全流程监管',
    desc: '建立案件专属资金账户，每一笔收支均有据可查。支持冲正纠错、银行对账、费用报销和资金预算管理，资金流向全程可追溯。',
    highlights: ['收支流水清晰可查', '冲正对账机制', '多账户独立核算'],
  },
  {
    icon: '📋',
    title: '审批流程规范管理',
    desc: '案件审核、债权审核、费用报销、资金动用等关键环节均需在线审批，审批意见和结果完整留存，确保每一个决策都有据可查。',
    highlights: ['多级审批机制', '审批历史追溯', '批量审批支持'],
  },
  {
    icon: '📂',
    title: '法律文书在线协作',
    desc: '支持 Word、Excel、PPT 在线编辑，多人可同时协作。内置常用法律文书模板，一键生成标准文书，大幅减少重复劳动。',
    highlights: ['在线协作编辑', '文书模板一键生成', '版本管理可回溯'],
  },
  {
    icon: '🤖',
    title: 'AI 智能法律助手',
    desc: '办案过程中随时向 AI 助手咨询法律问题，查询法规条文，辅助文书撰写。让专业法律知识触手可及，提升办案质量。',
    highlights: ['法律知识即问即答', '法规条文精准检索', '多轮对话深度交流'],
  },
  {
    icon: '📊',
    title: '数据统计与报表',
    desc: '案件数量、债权金额、工作进度等关键指标一目了然。支持可视化图表展示和 Excel 报表导出，为团队管理和决策提供数据支撑。',
    highlights: ['可视化统计图表', '多维度数据分析', '一键导出报表'],
  },
  {
    icon: '🔒',
    title: '安全合规保障',
    desc: '敏感数据采用国家密码算法加密存储，操作日志不可篡改，权限分级管控。系统定期自动备份数据库，确保数据安全万无一失。',
    highlights: ['国密算法加密', '审计日志防篡改', '数据定期备份'],
  },
];

const stages = [
  {
    name: '破产申请与受理',
    tasks: ['提交破产申请材料', '法院裁定受理并公告'],
  },
  {
    name: '接管与调查',
    tasks: ['全面接管债务人财产', '刻制管理人印章', '调查财产及经营状况', '追收债务人财产', '决定合同继续履行或解除'],
  },
  {
    name: '债权申报与核查',
    tasks: ['通知已知债权人并公告', '接收登记债权申报', '审查申报债权并编制债权表', '债权审查结果通知'],
  },
  {
    name: '债权人会议',
    tasks: ['会议资料准备', '组织表决并记录结果'],
  },
  {
    name: '重整和解及破产宣告',
    tasks: ['审查宣告破产条件', '裁定宣告债务人破产', '裁定重整与和解程序'],
  },
  {
    name: '财产变价与分配',
    tasks: ['拟定并执行财产变价方案', '审核破产费用与共益债务', '执行破产财产分配'],
  },
  {
    name: '程序终结与注销',
    tasks: ['提请终结破产程序', '法院裁定并公告', '办理企业注销登记', '管理人终止执行职务并归档'],
  },
];

const advantages = [
  {
    icon: '🏆',
    title: '专注破产领域',
    desc: '为破产管理人团队量身打造，深入理解破产案件处理的每一个细节和痛点，功能设计贴合实际执业需求。',
  },
  {
    icon: '🚀',
    title: '提升办案效率',
    desc: '自动化计算、标准化流程、模板化文书，将律师从繁琐的事务性工作中解放出来，专注核心法律判断。',
  },
  {
    icon: '🛡️',
    title: '降低执业风险',
    desc: '关键节点自动预警、审批流程全程留痕、操作记录不可篡改，有效防范程序违规和执业过失。',
  },
  {
    icon: '📱',
    title: '随时随地办公',
    desc: '支持电脑端和手机端访问，数据实时同步。外出办案也能随时查阅案件信息、处理审批事项。',
  },
  {
    icon: '🔗',
    title: '一案一档数字化',
    desc: '每个案件拥有独立的数字化档案，关联全部债权人、资金流水、任务进度和法律文书，信息不再碎片化。',
  },
  {
    icon: '💡',
    title: '持续更新迭代',
    desc: '紧跟法律法规变化，持续优化系统功能。专业的技术支持团队，为您的使用体验保驾护航。',
  },
];
</script>

<template>
  <div class="product-intro-page">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <img
            :src="customerConfig.logo.path"
            alt="Logo"
            class="h-9 w-9 object-contain"
          />
          <span class="text-xl font-bold text-gray-800">
            {{ customerConfig.app.name }}
          </span>
        </div>
        <button
          class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="goToLogin"
        >
          立即登录使用
        </button>
      </div>
    </header>

    <!-- Hero 区域 -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div class="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div class="mx-auto max-w-3xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <span class="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            破产管理人一站式数字化解决方案
          </div>
          <h1 class="mb-6 text-4xl font-extrabold leading-tight text-gray-900 lg:text-5xl">
            {{ customerConfig.app.name }}
            <span class="block text-blue-600">让每一个破产案件都井井有条</span>
          </h1>
          <p class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
            {{ customerConfig.app.description }}。覆盖破产清算、破产重整、破产和解三类案件，为管理人团队提供从立案到归档的全流程数字化支持。
          </p>
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              class="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
              @click="goToLogin"
            >
              立即体验
            </button>
            <span class="text-sm text-gray-400">专业 · 高效 · 智能</span>
          </div>
        </div>
      </div>
      <div class="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>

    <!-- 痛点场景 -->
    <section class="bg-white py-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">传统办案方式，您是否也遇到过这些烦恼？</h2>
          <p class="text-lg text-gray-500">破产案件办理周期长、涉及方多、材料庞杂，传统手工管理方式已难以满足高效办案需求</p>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in painPoints"
            :key="item.title"
            class="group rounded-xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:border-red-200 hover:bg-red-50/50 hover:shadow-md"
          >
            <div class="mb-4 text-3xl">{{ item.icon }}</div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800 group-hover:text-red-600">{{ item.title }}</h3>
            <p class="text-sm leading-relaxed text-gray-500">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="bg-gray-50 py-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">八大核心能力，全方位支撑破产办案</h2>
          <p class="text-lg text-gray-500">每一个功能都源于对破产管理人工作场景的深入理解</p>
        </div>
        <div class="grid gap-6 sm:grid-cols-2">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
          >
            <div class="mb-4 flex items-center gap-3">
              <span class="text-3xl">{{ feature.icon }}</span>
              <h3 class="text-lg font-semibold text-gray-800">{{ feature.title }}</h3>
            </div>
            <p class="mb-4 text-sm leading-relaxed text-gray-600">{{ feature.desc }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in feature.highlights"
                :key="tag"
                class="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 破产案件七大阶段 -->
    <section class="bg-white py-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">标准化破产案件处理流程</h2>
          <p class="text-lg text-gray-500">严格遵循破产法规定，将案件处理划分为七大阶段、23个标准任务节点</p>
        </div>
        <div class="space-y-4">
          <div
            v-for="(stage, index) in stages"
            :key="stage.name"
            class="group flex items-start gap-5 rounded-xl border border-gray-100 p-5 transition-all hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-600/20">
              {{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="mb-2 text-lg font-semibold text-gray-800">
                第{{ ['一', '二', '三', '四', '五', '六', '七'][index] }}阶段：{{ stage.name }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="task in stage.tasks"
                  :key="task"
                  class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition-colors group-hover:border-blue-200 group-hover:text-blue-700"
                >
                  {{ task }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 为什么选择我们 -->
    <section class="bg-gray-50 py-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">为什么选择 {{ customerConfig.app.name }}？</h2>
          <p class="text-lg text-gray-500">专为破产管理人团队打造，源于实践、服务于实践</p>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="adv in advantages"
            :key="adv.title"
            class="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
          >
            <div class="mb-4 text-3xl">{{ adv.icon }}</div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800">{{ adv.title }}</h3>
            <p class="text-sm leading-relaxed text-gray-500">{{ adv.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 适用场景 -->
    <section class="bg-white py-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">适用场景</h2>
          <p class="text-lg text-gray-500">无论您的团队规模大小，{{ customerConfig.app.name }}都能为您提供合适的管理方案</p>
        </div>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              🏢
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800">律师事务所</h3>
            <p class="text-sm text-gray-500">从事破产管理业务的律所，统一管理多个破产案件</p>
          </div>
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              📊
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800">会计师事务所</h3>
            <p class="text-sm text-gray-500">担任破产管理人的会所，精细管理财务与债权</p>
          </div>
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
              🔧
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800">清算公司</h3>
            <p class="text-sm text-gray-500">专业清算机构，高效处理企业破产清算全流程</p>
          </div>
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
              👥
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800">管理人团队</h3>
            <p class="text-sm text-gray-500">多人协作的管理人团队，实现信息实时同步</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <h2 class="mb-4 text-3xl font-bold text-white">准备好提升您的破产办案效率了吗？</h2>
        <p class="mb-8 text-lg text-blue-100">
          已有众多律师事务所和管理人团队在使用 {{ customerConfig.app.name }} 管理破产案件
        </p>
        <button
          class="rounded-lg bg-white px-10 py-4 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl"
          @click="goToLogin"
        >
          立即开始使用
        </button>
        <p class="mt-4 text-sm text-blue-200">无需安装，浏览器打开即可使用</p>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="border-t border-gray-200 bg-white py-10">
      <div class="mx-auto max-w-7xl px-6 text-center">
        <div class="mb-4 flex items-center justify-center gap-3">
          <img
            :src="customerConfig.logo.path"
            alt="Logo"
            class="h-6 w-6 object-contain"
          />
          <span class="text-base font-semibold text-gray-700">{{ customerConfig.app.name }}</span>
        </div>
        <p class="text-sm text-gray-400">
          © {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }} 版权所有
        </p>
        <p class="mt-1 text-xs text-gray-300">{{ customerConfig.app.description }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.product-intro-page {
  min-height: 100vh;
  background: #fff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>