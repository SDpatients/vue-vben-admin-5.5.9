<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { computed, ref } from 'vue';

import { Card, Page } from '@vben/common-ui';

import { ElButton, ElTag, ElTimeline, ElTimelineItem } from 'element-plus';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'ChangelogPage' });

type Platform = 'web' | 'uni-app' | 'all';

interface ChangelogItem {
  text: string;
  platform: Platform;
}

interface ChangelogEntry {
  date: string;
  features: ChangelogItem[];
  fixes: ChangelogItem[];
  improvements: ChangelogItem[];
  version: string;
}

const activePlatform = ref<'web' | 'uni-app'>('web');

const platformOptions = [
  { key: 'web' as const, label: '网页端', icon: '🖥️' },
  { key: 'uni-app' as const, label: '移动端', icon: '📱' },
];

const changelogs: ChangelogEntry[] = [
  {
    date: '2026-05-12',
    features: [
      { text: '可以在后台统一管理所有使用人员的账号、角色和启用状态了', platform: 'web' },
      { text: '系统数据现在支持定期自动备份，发生意外时能快速恢复', platform: 'web' },
      { text: '查看敏感信息（身份证号、联系方式等）需要额外授权确认，信息更安全', platform: 'web' },
      { text: '用户协议和隐私政策可以在后台随时更新，无需等待技术人员处理', platform: 'web' },
      { text: '设置密码时系统会提示安全强度，帮助您使用更可靠的密码', platform: 'all' },
      { text: '系统授权到期前会自动提醒续期，不影响正常办公', platform: 'web' },
      { text: '手机上也能随时查看和处理审批事项了，出差在外也不耽误', platform: 'uni-app' },
      { text: '首次使用手机端会展示用户协议与隐私政策，保障您的知情权', platform: 'uni-app' },
      { text: '手机上查看敏感信息也需要权限验证，外出办公数据也安全', platform: 'uni-app' },
      { text: '系统安装部署更简单了，无需专业技术人员即可完成环境搭建', platform: 'web' },
    ],
    fixes: [
      { text: '手机端登录更加流畅稳定，不会再出现页面卡顿或闪退', platform: 'uni-app' },
      { text: '管理人、法院、银行等基础信息页面数据展示更加准确完整', platform: 'all' },
      { text: '文件上传更稳定了，按分类查找文档也更加准确', platform: 'all' },
    ],
    improvements: [
      { text: '手机端登录页面全新改版，操作更顺手，视觉更清爽', platform: 'uni-app' },
      { text: '案件各阶段的切换更流畅，案件进度和关键信息一眼就能看清', platform: 'uni-app' },
      { text: '手机上查找和管理文档更加方便快捷', platform: 'uni-app' },
      { text: '费用报销的审批规则设置更灵活，报销流程更加清晰顺畅', platform: 'web' },
      { text: '工作台的图表和数据展示更加直观，关键指标一目了然', platform: 'web' },
      { text: '填写债权申报信息时，系统会智能提醒漏填或填写有误的地方', platform: 'all' },
      { text: '文档统计信息更加直观，文档数量和分类占比一眼看清', platform: 'web' },
      { text: '左侧功能菜单布局更合理，常用功能更容易找到', platform: 'web' },
      { text: '遇到操作问题时系统提示更清晰明了，方便快速定位和解决', platform: 'all' },
      { text: '登录和注册页面更好看了，操作流程更自然顺畅', platform: 'all' },
    ],
    version: 'V5.6.1',
  },
  {
    date: '2026-05-09',
    features: [
      { text: '新增产品介绍页面，可以全面了解系统的功能布局和使用场景', platform: 'web' },
      { text: '系统中常用的下拉选项（案件类型、费用类别等）可以在后台自行配置了', platform: 'all' },
      { text: '手机上现在可以查看和维护管理人、法院等基础信息了', platform: 'uni-app' },
      { text: '手机上可以查看案件对应的债务人信息，信息查询更全面', platform: 'uni-app' },
      { text: '手机端不同页面之间传递数据更加稳定，不会出现信息丢失', platform: 'uni-app' },
    ],
    fixes: [
      { text: '债权申报第二阶段和第三阶段填写校验更准确，数据保存更可靠', platform: 'all' },
      { text: '在线预览文件更加稳定，不会再出现部分文件打不开的情况', platform: 'all' },
      { text: '案件详情页面操作更稳定，不会出现页面显示与实际数据不符', platform: 'all' },
      { text: '即时通讯的消息接收更及时了，不会再漏掉重要消息', platform: 'all' },
    ],
    improvements: [
      { text: '手机端案件管理、文档查阅、费用报销等核心功能全面优化，用起来更顺手', platform: 'uni-app' },
      { text: '手机上浏览文件夹层次更清晰，上传和预览文件更流畅', platform: 'uni-app' },
      { text: '案件详情页面重新设计，信息展示更有条理，各功能切换更自然', platform: 'all' },
      { text: '债权申报三个阶段的流程衔接更紧密，数据协同更顺畅', platform: 'all' },
      { text: '文书生成器支持更多模板样式，在线预览和编辑更方便', platform: 'all' },
      { text: '文档库新增多种浏览方式，查找和管理文件更高效', platform: 'all' },
      { text: '案件审批和费用报销审批流程更简洁高效', platform: 'all' },
      { text: '对系统进行了全面清理和瘦身，整体运行更加流畅', platform: 'all' },
      { text: '品牌标识全新升级，系统界面视觉更加统一专业', platform: 'all' },
    ],
    version: 'V5.6.0',
  },
  {
    date: '2026-04-30',
    features: [
      { text: '系统中上传文件的操作方式统一了，无论在哪里上传都简单一致', platform: 'web' },
      { text: '系统运行问题更容易被追踪和定位，故障处理更高效', platform: 'all' },
      { text: '网页内容安全防护升级，有效防止恶意内容注入', platform: 'all' },
      { text: '费用相关的管理规则可以在后台更灵活地配置了', platform: 'web' },
      { text: '新增案件节点预警看板，可以实时看到哪些案件的哪个阶段即将到期', platform: 'web' },
      { text: '工作日志中的现场照片可以点击放大查看细节了', platform: 'web' },
    ],
    fixes: [
      { text: '待办事项的显示数量更加准确，和实际情况完全一致', platform: 'all' },
      { text: '各业务模块之间的数据交互更加稳定，不会再出现数据对不上的情况', platform: 'all' },
      { text: '案件列表在特定筛选条件下数据可以正常加载了', platform: 'all' },
    ],
    improvements: [
      { text: '工作台的待办看板全新升级，信息展示更清晰，操作更顺手', platform: 'web' },
      { text: '案件详情页面结构优化，加载更快，操作更流畅', platform: 'all' },
      { text: '案件列表在数据量很多时打开速度明显提升', platform: 'all' },
      { text: '即时通讯的消息交流和在线状态显示更加稳定可靠', platform: 'all' },
      { text: '登录页面的信息填写和验证更加顺畅友好', platform: 'all' },
      { text: '网络不稳定时系统会自动重试，减少因网络波动导致的操作中断', platform: 'all' },
      { text: '统计图表效果升级，数据展示更加直观美观', platform: 'web' },
    ],
    version: 'V5.5.10',
  },
  {
    date: '2026-04-28',
    features: [
      { text: '手机上可以直接拍照上传案卷材料了，现场采集证据更加方便快捷', platform: 'uni-app' },
      { text: '案件的所有关键操作都有记录可查，谁在什么时候做了什么一目了然', platform: 'all' },
    ],
    fixes: [
      { text: '债权审查中涉及金额的计算更加精确，不会出现小数点偏差', platform: 'all' },
      { text: '使用 Safari 浏览器预览文件时不会再出现显示异常', platform: 'all' },
      { text: '资金流水导出到 Excel 时日期格式显示正常了', platform: 'all' },
    ],
    improvements: [
      { text: '案件数量很多时列表浏览依然流畅，不会卡顿', platform: 'all' },
      { text: '即时通讯掉线后会自动重连，同事之间交流不掉线', platform: 'all' },
      { text: '系统运行状态监控更加全面，可以及时发现和处理潜在问题', platform: 'all' },
    ],
    version: 'V5.5.9',
  },
  {
    date: '2026-04-15',
    features: [
      { text: '费用报销可以设置多级审批了，报销流程更加规范严谨', platform: 'all' },
      { text: '编辑文书模板时可以直观地插入变量占位符，模板制作效率更高', platform: 'all' },
    ],
    fixes: [
      { text: '工作日志中的图片预览在绝大多数情况下都能正常显示了', platform: 'all' },
      { text: '案件任务到期的提醒通知按时送达，不再延迟', platform: 'all' },
    ],
    improvements: [
      { text: '填写债权申报表单时会自动保存草稿，不怕中途退出丢失数据', platform: 'all' },
      { text: '系统底层组件升级，整体界面交互更加流畅稳定', platform: 'web' },
      { text: '通知消息可以一键全部标记为已读，处理效率大幅提升', platform: 'all' },
    ],
    version: 'V5.5.8',
  },
  {
    date: '2026-03-28',
    features: [
      { text: '破产案件的财产变价方案可以在线编辑并提交审批了', platform: 'all' },
      { text: '管理人名下银行账户余额可以实时查看，余额不足时自动预警', platform: 'all' },
    ],
    fixes: [
      { text: '资金流水报表按月份筛选时数据完全准确了', platform: 'all' },
      { text: '批量导入债权人信息时，手机号校验不再过于严格导致无法导入', platform: 'all' },
      { text: '待办事项的计数显示和实际数量完全一致', platform: 'all' },
    ],
    improvements: [
      { text: '案件各阶段的切换动画更加流畅自然，操作体验更好', platform: 'all' },
      { text: '文档库的权限设置更灵活，可以按文件夹分别设置不同人的访问权限', platform: 'all' },
      { text: '系统参数配置页面增加了搜索功能，快速找到需要修改的配置项', platform: 'all' },
    ],
    version: 'V5.5.7',
  },
  {
    date: '2026-03-12',
    features: [
      { text: '支持按工作团队分组协作，任务分配更加清晰高效', platform: 'all' },
      { text: '可以在线预览和编辑 Office 文档模板了', platform: 'all' },
    ],
    fixes: [
      { text: '案件详情中切换债权列表分页后，之前设置的筛选条件不会丢失', platform: 'all' },
      { text: 'Firefox 浏览器下日期选择器的显示完全正常了', platform: 'all' },
    ],
    improvements: [
      { text: '案件搜索功能更强大，可以按案号、当事人名、法院名等多条件组合搜索', platform: 'all' },
      { text: '上传大文件时如果网络中断，恢复后可以从断点继续上传，不用重新来', platform: 'all' },
      { text: '打开系统后首页图表加载更快，等待时间明显缩短', platform: 'all' },
    ],
    version: 'V5.5.6',
  },
  {
    date: '2026-02-20',
    features: [
      { text: '破产费用和共益债务可以单独列项管理了，账目更加清晰', platform: 'all' },
      { text: '常用公告可以一键生成模板，不用每次手动从头编写', platform: 'all' },
    ],
    fixes: [
      { text: '债权确认环节的金额汇总统计完全准确了', platform: 'all' },
      { text: '在 iOS 15 以下版本的手机上使用不会再出现兼容性问题', platform: 'uni-app' },
    ],
    improvements: [
      { text: '登录状态保持更稳定，长时间不操作后回来还能继续工作', platform: 'all' },
      { text: '即时通讯运行更省资源，长时间在线不影响电脑或手机流畅度', platform: 'all' },
      { text: '页面之间的切换动画更加流畅，整体操作手感更顺滑', platform: 'all' },
    ],
    version: 'V5.5.5',
  },
  {
    date: '2026-02-05',
    features: [
      { text: '文档可以生成分享链接并设置密码，安全地分享给团队外部人员', platform: 'all' },
      { text: '银行资金流水可以自动对账了，大幅减少人工逐笔核对的工作量', platform: 'all' },
    ],
    fixes: [
      { text: '案件归档时附件不会再丢失关联，归档记录完整可靠', platform: 'all' },
      { text: '分配角色后立即生效，不需要退出重新登录', platform: 'web' },
    ],
    improvements: [
      { text: 'Excel 导入导出支持大批量数据，不会因为数据太多而卡住或超时', platform: 'all' },
      { text: 'PDF 预览时可以跳转到指定页码，还可以放大缩小查看', platform: 'all' },
      { text: '系统出问题时的提示信息更清晰了，一看就明白发生了什么', platform: 'all' },
    ],
    version: 'V5.5.4',
  },
  {
    date: '2026-01-18',
    features: [
      { text: '债权人会议的表决结果可以在线记录并自动汇总统计了', platform: 'all' },
      { text: '案件关键节点如需延期，可以直接在线提交延期审批', platform: 'all' },
    ],
    fixes: [
      { text: '新增资金流水后，账户余额会立即更新显示，不用手动刷新', platform: 'all' },
      { text: '新任务到账即时通知，待办事项不再延迟推送', platform: 'all' },
    ],
    improvements: [
      { text: '案件各阶段的任务卡片上会显示完成进度的百分比，进度一目了然', platform: 'all' },
      { text: '审批流程配置更灵活，可以适应各种实际业务场景', platform: 'all' },
      { text: '全局搜索支持拼音模糊搜索，输入拼音首字母就能找到', platform: 'all' },
    ],
    version: 'V5.5.3',
  },
  {
    date: '2026-01-06',
    features: [
      { text: '破产案件的财产调查报告可以在线生成并一键导出', platform: 'all' },
      { text: '管理人印章的使用可以登记记录了，用印情况有据可查', platform: 'all' },
    ],
    fixes: [
      { text: '债权审查意见书生成时不会再出现部分字段内容为空的情况', platform: 'all' },
      { text: '数据看板的图表在不同屏幕尺寸下都能正常显示', platform: 'all' },
    ],
    improvements: [
      { text: '文档库的文件夹导航支持点击路径跳转，就像电脑上操作文件夹一样', platform: 'all' },
      { text: '表单填写时的提示信息更加清晰友好，一眼就明白哪里需要修改', platform: 'all' },
      { text: '后端服务升级，系统整体运行更加稳定高效', platform: 'all' },
    ],
    version: 'V5.5.2',
  },
  {
    date: '2025-12-24',
    features: [
      { text: '新增系统内置即时通讯，同事之间可以直接在线聊天和建群讨论', platform: 'all' },
      { text: '所有业务通知统一管理，审批提醒、任务到期等通知不再遗漏', platform: 'all' },
    ],
    fixes: [
      { text: '新建案件时法定代表人信息校验不再过于严苛导致无法提交', platform: 'all' },
      { text: '小屏幕设备上侧边栏菜单不会再重叠错位', platform: 'all' },
    ],
    improvements: [
      { text: '系统首次打开速度明显提升，不需要等太久就能开始工作', platform: 'all' },
      { text: '权限管理更加精细，不同岗位的人员可以有不同的操作权限', platform: 'all' },
      { text: '网络请求失败时会自动重试，减少因网络波动导致的操作失败', platform: 'all' },
    ],
    version: 'V5.5.1',
  },
  {
    date: '2025-12-10',
    features: [
      { text: '系统底层架构全面升级，运行更稳定，后续功能更新更快', platform: 'all' },
      { text: '破产案件管理全面改版，支持从立案到结案全流程的节点跟踪和管控', platform: 'all' },
      { text: '债权管理覆盖申报、审查、确认三大阶段，全流程线上处理', platform: 'all' },
      { text: '资金管理功能上线，支持账户管理、资金流水记录和统计报表', platform: 'all' },
      { text: '费用报销功能上线，支持多种费用类型的报销登记和审批', platform: 'all' },
      { text: '文档库功能上线，所有案件文档集中存储，支持历史版本管理', platform: 'all' },
      { text: '基础信息管理上线，债权人、债务人、法院、管理人信息统一维护', platform: 'all' },
    ],
    fixes: [],
    improvements: [
      { text: '系统界面全面换新，页面更加美观，操作更加流畅', platform: 'all' },
      { text: '系统响应速度明显提升，数据更新更加及时', platform: 'all' },
      { text: '代码质量全面提升，系统运行更加稳定可靠', platform: 'all' },
      { text: '界面风格更加统一，视觉体验更加舒适专业', platform: 'all' },
      { text: '建立了完善的质量检测机制，系统稳定性更有保障', platform: 'all' },
    ],
    version: 'V5.5.0',
  },
];

function filterByPlatform(items: ChangelogItem[]): ChangelogItem[] {
  return items.filter(
    (item) => item.platform === 'all' || item.platform === activePlatform.value,
  );
}

const filteredChangelogs = computed(() => {
  return changelogs
    .map((entry) => ({
      ...entry,
      features: filterByPlatform(entry.features),
      fixes: filterByPlatform(entry.fixes),
      improvements: filterByPlatform(entry.improvements),
    }))
    .filter(
      (entry) =>
        entry.features.length > 0 ||
        entry.fixes.length > 0 ||
        entry.improvements.length > 0,
    );
});

const tagTypes: Record<string, 'success' | 'warning' | 'danger' | ''> = {
  新增: 'success',
  修复: 'warning',
  优化: '',
};

const platformTagColors: Record<string, 'success' | 'primary' | ''> = {
  web: 'primary',
  'uni-app': 'success',
};
</script>

<template>
  <Page description="了解系统各版本的更新内容与功能迭代" title="更新日志">
    <div class="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <Card class="p-4">
        <div class="flex items-center justify-center gap-4">
          <ElButton
            v-for="opt in platformOptions"
            :key="opt.key"
            :type="activePlatform === opt.key ? 'primary' : 'default'"
            :class="[
              'min-w-[140px]',
              activePlatform === opt.key ? 'shadow-sm' : '',
            ]"
            size="large"
            @click="activePlatform = opt.key"
          >
            <span class="mr-1">{{ opt.icon }}</span>
            {{ opt.label }}
          </ElButton>
        </div>
      </Card>

      <Card class="p-6">
        <p class="mb-6 text-base leading-relaxed text-gray-600">
          欢迎查阅
          <span class="text-primary font-semibold">{{
            customerConfig.app.name
          }}</span>
          版本更新日志。我们持续对系统进行功能迭代与体验优化，以下是各版本的详细更新内容。
        </p>

        <ElTimeline>
          <ElTimelineItem
            v-for="log in filteredChangelogs"
            :key="log.version"
            :timestamp="log.date"
            color="#1677ff"
            size="large"
          >
            <template #dot>
              <div
                class="bg-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
              >
                {{ log.version.replace('V', '') }}
              </div>
            </template>

            <div class="ml-2">
              <div class="mb-4 flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-800">
                  {{ log.version }}
                </h3>
                <ElTag type="primary" effect="plain" size="small">{{
                  log.date
                }}</ElTag>
                <ElTag
                  v-if="log.version === filteredChangelogs[0]?.version"
                  type="success"
                  effect="dark"
                  size="small"
                >
                  最新版本
                </ElTag>
              </div>

              <div class="space-y-4">
                <div v-if="log.features.length > 0">
                  <h4 class="mb-2 text-base font-semibold text-green-600">
                    ✨ 新增功能
                  </h4>
                  <ul class="ml-4 space-y-1.5">
                    <li
                      v-for="(item, idx) in log.features"
                      :key="`f-${idx}`"
                      class="flex items-start gap-2 text-base text-gray-700"
                    >
                      <ElTag
                        :type="tagTypes['新增']"
                        size="small"
                        class="mt-0.5 shrink-0"
                      >
                        新增
                      </ElTag>
                      <span class="flex-1">{{ item.text }}</span>
                      <ElTag
                        v-if="item.platform === 'web'"
                        :type="platformTagColors['web']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        Web
                      </ElTag>
                      <ElTag
                        v-else-if="item.platform === 'uni-app'"
                        :type="platformTagColors['uni-app']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        移动端
                      </ElTag>
                    </li>
                  </ul>
                </div>

                <div v-if="log.improvements.length > 0">
                  <h4 class="mb-2 text-base font-semibold text-blue-600">
                    🔧 功能优化
                  </h4>
                  <ul class="ml-4 space-y-1.5">
                    <li
                      v-for="(item, idx) in log.improvements"
                      :key="`i-${idx}`"
                      class="flex items-start gap-2 text-base text-gray-700"
                    >
                      <ElTag
                        :type="tagTypes['优化']"
                        size="small"
                        class="mt-0.5 shrink-0"
                      >
                        优化
                      </ElTag>
                      <span class="flex-1">{{ item.text }}</span>
                      <ElTag
                        v-if="item.platform === 'web'"
                        :type="platformTagColors['web']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        Web
                      </ElTag>
                      <ElTag
                        v-else-if="item.platform === 'uni-app'"
                        :type="platformTagColors['uni-app']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        移动端
                      </ElTag>
                    </li>
                  </ul>
                </div>

                <div v-if="log.fixes.length > 0">
                  <h4 class="mb-2 text-base font-semibold text-orange-600">
                    🐛 问题修复
                  </h4>
                  <ul class="ml-4 space-y-1.5">
                    <li
                      v-for="(item, idx) in log.fixes"
                      :key="`x-${idx}`"
                      class="flex items-start gap-2 text-base text-gray-700"
                    >
                      <ElTag
                        :type="tagTypes['修复']"
                        size="small"
                        class="mt-0.5 shrink-0"
                      >
                        修复
                      </ElTag>
                      <span class="flex-1">{{ item.text }}</span>
                      <ElTag
                        v-if="item.platform === 'web'"
                        :type="platformTagColors['web']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        Web
                      </ElTag>
                      <ElTag
                        v-else-if="item.platform === 'uni-app'"
                        :type="platformTagColors['uni-app']"
                        size="small"
                        effect="plain"
                        class="shrink-0"
                      >
                        移动端
                      </ElTag>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ElTimelineItem>
        </ElTimeline>

        <div
          v-if="filteredChangelogs.length === 0"
          class="py-12 text-center text-gray-400"
        >
          <p class="text-lg">暂无该端口的更新记录</p>
        </div>
      </Card>

      <div class="py-8 text-center text-sm text-gray-400">
        <p>
          © {{ customerConfig.copyright.year }}
          {{ customerConfig.copyright.company }} 版权所有
        </p>
        <p class="mt-2">我们将持续改进产品，感谢您的支持与反馈</p>
      </div>
    </div>
  </Page>
</template>
