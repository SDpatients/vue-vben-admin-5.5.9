<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { Card, Page } from '@vben/common-ui';

import { ElTag, ElTimeline, ElTimelineItem } from 'element-plus';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'ChangelogPage' });

interface ChangelogEntry {
  date: string;
  features: string[];
  fixes: string[];
  improvements: string[];
  version: string;
}

const changelogs: ChangelogEntry[] = [
  {
    date: '2026-05-09',
    features: [
      '新增产品介绍页面，涵盖系统架构与功能模块全景展示',
      '新增数据字典管理 API，支持动态数据字典与系统参数查询',
      'uni-app 端新增基础数据信息维护功能，支持管理人、法院等多类信息管理',
      'uni-app 端新增案件债务人信息页面，完善案件全链条信息覆盖',
      '新增 uni-app 页面参数传递工具(pageParam)，统一跨页面数据交互',
    ],
    fixes: [
      '修复债权申报阶段二、阶段三多项数据校验与字段回填问题',
      '修复文档预览组件在特定场景下的渲染兼容性问题',
      '修复案件详情页多处交互 Bug 与状态不一致问题',
      '修复即时通讯窗口消息推送偶发丢失的缺陷',
    ],
    improvements: [
      'uni-app 移动端全面适配优化，涵盖案件管理、文档库、费用报销等核心模块',
      '重构 uni-app 文档库模块，优化文件夹浏览、文件上传与预览体验',
      '重构案件详情页面，优化操作流程、信息展示与多 Tab 联动',
      '增强债权申报全流程功能完整性，完善三阶段数据协同',
      '扩展文书生成器功能，支持更丰富的模板预览与在线编辑',
      '完善文档库 Dashboard、收藏夹、全局搜索等多视图功能',
      '优化案件审批与费用报销审批流程交互',
      '全面清理项目冗余文档与旧版 API 文档，精简项目结构',
      '更新应用 Logo 与品牌视觉标识',
    ],
    version: 'V5.6.0',
  },
  {
    date: '2026-04-30',
    features: [
      '新增 FileUploader 通用文件上传组件，统一 Web 端文件上传交互',
      '新增前端日志工具(logger)，支持分级日志输出与问题追踪',
      '新增 HTML 内容安全过滤工具(htmlSanitizer)，增强 XSS 防护能力',
      '新增费用制度管理路由模块，完善费用管控体系',
      '新增 Dashboard 节点预警看板，实时监控各案件阶段节点状态',
      '新增案件详情工作日志图片查看组件，支持图片预览与检索',
    ],
    fixes: [
      '修复待办事项模块多项 API 接口规范与类型定义问题',
      '修复多个业务 API 模块的请求参数与响应类型不匹配问题',
      '修复案件管理列表部分筛选条件下数据加载异常',
    ],
    improvements: [
      '大幅重构 Dashboard 活动待办看板，优化数据展示与交互逻辑',
      '重构案件详情页面结构，优化模块化组织与代码可维护性',
      '优化案件管理列表页面性能，提升大数据量场景下的加载速度',
      '完善即时通讯窗口消息推送机制与在线状态管理',
      '优化用户登录页面交互体验与表单验证逻辑',
      '统一 API 请求拦截器处理逻辑，增强超时重试与异常处理',
      '更新 ECharts 图表组件版本与渲染配置',
    ],
    version: 'V5.5.10',
  },
  {
    date: '2026-04-28',
    features: [
      '新增移动端文件拍照上传功能，支持案卷材料现场采集',
      '新增案件操作记录审计日志，完整追溯所有关键操作',
    ],
    fixes: [
      '修复债权审查阶段金额计算精度丢失问题',
      '修复 Safari 浏览器下文件预览兼容性问题',
      '修复资金流水导出 Excel 时日期格式异常',
    ],
    improvements: [
      '优化案件列表大数据量下的加载性能，支持虚拟滚动',
      '优化即时通讯消息推送稳定性，增加断线重连机制',
      '完善系统监控看板，新增 JVM 内存与数据库连接池监控',
    ],
    version: 'V5.5.9',
  },
  {
    date: '2026-04-15',
    features: [
      '新增费用报销多级审批流程配置功能',
      '新增文书模板在线编辑器，支持变量占位符可视化插入',
    ],
    fixes: [
      '修复工作日志图片预览在某些场景下无法加载的问题',
      '修复案件任务截止日期提醒通知延迟发送的缺陷',
    ],
    improvements: [
      '优化债权申报表单交互体验，支持草稿自动保存',
      '升级 Element Plus 至 2.7.x，享受最新组件特性',
      '重构通知中心标记已读逻辑，支持批量操作',
    ],
    version: 'V5.5.8',
  },
  {
    date: '2026-03-28',
    features: [
      '新增破产案件财产变价方案在线编辑与审批功能',
      '新增管理人银行账户余额实时查询与预警',
    ],
    fixes: [
      '修复资金流水报表按月份筛选时数据不准确的问题',
      '修复债权人信息批量导入时手机号校验规则过严的缺陷',
      '修复部分情况下待办事项计数与实际不符的 Bug',
    ],
    improvements: [
      '优化案件流程阶段切换动画，提升视觉体验',
      '重构文档库权限管理模块，支持文件夹级权限继承',
      '改进系统参数配置界面，增加配置项搜索功能',
    ],
    version: 'V5.5.7',
  },
  {
    date: '2026-03-12',
    features: [
      '新增工作团队管理功能，支持多团队协作与任务分配',
      '新增 OnlyOffice 模板在线预览与编辑集成',
    ],
    fixes: [
      '修复案件详情页债权列表分页切换后筛选条件丢失问题',
      '修复 Firefox 浏览器下部分日期选择器样式错乱',
    ],
    improvements: [
      '优化案件搜索功能，支持按案号、当事人、法院等多维度检索',
      '重构文件上传组件，支持断点续传与秒传',
      '改进 Dashboard 图表数据加载方式，减少首屏等待时间',
    ],
    version: 'V5.5.6',
  },
  {
    date: '2026-02-20',
    features: [
      '新增破产费用与共益债务专项管理模块',
      '新增公告模板管理功能，支持常用公告一键生成',
    ],
    fixes: [
      '修复债权确认阶段金额汇总统计偏差问题',
      '修复移动端 H5 页面在 iOS 15 以下版本的兼容性问题',
    ],
    improvements: [
      '优化 JWT Token 刷新机制，提升用户体验连续性',
      '重构即时通讯模块 WebSocket 连接管理，降低资源占用',
      '改进页面路由切换动画流畅度',
    ],
    version: 'V5.5.5',
  },
  {
    date: '2026-02-05',
    features: [
      '新增文档分享功能，支持链接分享与密码保护',
      '新增资金账户交易流水自动对账功能',
    ],
    fixes: [
      '修复案件归档时附件关联丢失的问题',
      '修复用户管理中角色分配保存后未即时生效的缺陷',
    ],
    improvements: [
      '优化 Excel 导入导出功能，支持大数据量分批处理',
      '改进文档预览组件，新增 PDF 页码导航与缩放控制',
      '完善系统全局异常处理机制，提升错误信息可读性',
    ],
    version: 'V5.5.4',
  },
  {
    date: '2026-01-18',
    features: [
      '新增债权人会议表决在线记录与统计功能',
      '新增案件节点延期审批流程',
    ],
    fixes: [
      '修复资金流水新增时账户余额未实时更新的问题',
      '修复部分场景下待办事项推送延迟的缺陷',
    ],
    improvements: [
      '优化案件阶段任务卡片展示，增加进度百分比指示',
      '重构审批流程状态机，支持更灵活的流程配置',
      '改进系统全局搜索功能，支持拼音模糊匹配',
    ],
    version: 'V5.5.3',
  },
  {
    date: '2026-01-06',
    features: [
      '新增破产案件财产调查报告在线生成功能',
      '新增管理人印章使用登记管理',
    ],
    fixes: [
      '修复债权审查意见书生成时部分字段为空的问题',
      '修复 Dashboard 数据看板部分图表自适应异常',
    ],
    improvements: [
      '优化文档库文件夹导航交互，支持面包屑路径跳转',
      '改进表单验证规则提示信息，更加友好明确',
      '升级 Spring Boot 后端依赖至最新稳定版',
    ],
    version: 'V5.5.2',
  },
  {
    date: '2025-12-24',
    features: [
      '新增即时通讯模块，支持点对点消息与群组聊天',
      '新增系统通知中心，统一管理各类业务通知',
    ],
    fixes: [
      '修复案件创建时法定代表人工商信息校验异常',
      '修复部分低分辨率屏幕下侧边栏菜单展开重叠问题',
    ],
    improvements: [
      '优化系统首次加载性能，代码分割减少初始包体积',
      '重构用户权限体系，支持更细粒度的操作权限控制',
      '完善 API 请求拦截器，增加请求重试与超时处理',
    ],
    version: 'V5.5.1',
  },
  {
    date: '2025-12-10',
    features: [
      '全新升级至 Vue Vben Admin 5.x 架构，采用 Monorepo 工程化方案',
      '全面重构破产案件管理模块，支持七阶段二十三节点流程管控',
      '新增债权申报、审查、确认三阶段全流程管理',
      '新增资金管理模块，涵盖账户管理、资金流水、统计报表',
      '新增费用报销管理，支持多类型费用记录与审批',
      '新增文档库模块，实现文档集中管理与版本控制',
      '新增基础数据管理，涵盖债权人、债务人、法院、管理人信息维护',
    ],
    fixes: [],
    improvements: [
      '全面升级 UI 框架至 Element Plus，替换原有 Ant Design Vue',
      '采用 Pinia 替代 Vuex 进行状态管理',
      '全面支持 TypeScript 严格模式，提升代码质量',
      '引入 Tailwind CSS 工具类，统一样式规范',
      '建立完善的自动化测试体系，覆盖单元测试与 E2E 测试',
    ],
    version: 'V5.5.0',
  },
];

const tagTypes: Record<string, 'success' | 'warning' | 'danger' | ''> = {
  新增: 'success',
  修复: 'warning',
  优化: '',
};
</script>

<template>
  <Page description="了解系统各版本的更新内容与功能迭代" title="更新日志">
    <div class="mx-auto max-w-4xl space-y-6 px-4 py-6">
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
            v-for="log in changelogs"
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
                  v-if="log.version === changelogs[0]?.version"
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
                      <span>{{ item }}</span>
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
                      <span>{{ item }}</span>
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
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ElTimelineItem>
        </ElTimeline>
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
