<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { Card, Page } from '@vben/common-ui';

import {
  ElCollapse,
  ElCollapseItem,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'ProductIntroPage' });

const architectureLayers = [
  { layer: 'Web前端', tech: 'Vue 3 + TypeScript + Element Plus', desc: '基于Vue Vben Admin框架，Monorepo架构' },
  { layer: '移动端', tech: 'uni-app + Vue 3 + TypeScript', desc: '支持H5、微信小程序、APP多端运行' },
  { layer: '状态管理', tech: 'Pinia', desc: '前端统一状态管理' },
  { layer: '路由管理', tech: 'Vue Router', desc: '支持动态路由与权限守卫' },
  { layer: 'UI框架', tech: 'Element Plus / uview-plus', desc: '企业级组件库' },
  { layer: '构建工具', tech: 'Vite', desc: '高性能前端构建' },
  { layer: '后端服务', tech: 'Spring Boot', desc: 'RESTful API，统一前缀' },
  { layer: '认证机制', tech: 'JWT (AccessToken + RefreshToken)', desc: '双Token机制，支持自动刷新' },
];

const coreValues = [
  { icon: '🔄', title: '全流程贯通', desc: '覆盖破产案件7大阶段、23个标准任务节点，实现从立案到归档的闭环管理' },
  { icon: '📋', title: '债权全周期管理', desc: '支持债权申报、审查、确认三阶段完整流程，确保债权处理合规透明' },
  { icon: '📱', title: '多端协同办公', desc: 'Web端与移动端数据实时同步，支持手机扫码上传文件等移动办公场景' },
  { icon: '⚠️', title: '智能预警监控', desc: '关键时间节点自动预警，避免逾期风险' },
  { icon: '✅', title: '审批流程管控', desc: '案件、文书、费用多维度审批管理，保障业务合规' },
];

const modules = [
  {
    children: [
      { name: '工作台', desc: '综合工作中心视图，提供案件概览、快捷入口、待办统计' },
      { name: '案件总览', desc: '案件数据可视化统计分析，多种图表展示' },
      { name: '数据看板', desc: '系统核心数据综合展示' },
      { name: '待办事项', desc: '完整的待办管理功能，支持创建、分配、完成跟踪' },
      { name: '节点预警', desc: '关键时间节点预警监控看板，支持延期审批' },
    ],
    name: '仪表盘模块',
  },
  {
    children: [
      { name: '案件列表', desc: '案件全生命周期管理，支持多维度筛选与操作' },
      { name: '流程处理', desc: '按破产法七阶段组织案件流程管理，包含债权处理' },
      { name: '卷宗归档', desc: '案件文件归档管理' },
      { name: '公告列表', desc: '多类型公告的创建、发布与管理' },
    ],
    name: '法律案件管理',
  },
  {
    children: [
      { name: '债权人管理', desc: '债权人信息增删改查，支持批量添加' },
      { name: '债务人管理', desc: '债务人信息管理，关联案件管理' },
      { name: '法院管理', desc: '法院信息及联系方式管理' },
      { name: '管理人信息', desc: '管理人基本信息及工作人员管理' },
      { name: '工作计划', desc: '工作计划增删改查及执行状态管理' },
      { name: '文书库', desc: '文档集中管理与协作，支持分享、权限控制' },
    ],
    name: '基础数据管理',
  },
  {
    children: [
      { name: '费用报销', desc: '案件相关费用报销管理，支持多类型费用记录' },
      { name: '审批管理', desc: '文书、案件、报销多维度审批管理' },
      { name: '模板管理', desc: '文书、Excel、OnlyOffice模板管理' },
    ],
    name: '费用系统',
  },
  {
    children: [
      { name: '资金账户', desc: '资金账户信息管理及余额查看' },
      { name: '资金流水', desc: '资金收支记录管理' },
      { name: '资金报表', desc: '多维度资金汇总统计报表' },
    ],
    name: '资金管理',
  },
];

const bankruptcyStages = [
  { stage: '第一阶段', name: '破产申请与受理', tasks: 2, tasksList: ['提交破产申请材料', '裁定受理并公告'] },
  { stage: '第二阶段', name: '接管与调查', tasks: 5, tasksList: ['全面接管债务人', '管理人印章', '调查财产及经营状况', '追收债务人财产', '决定合同继续履行或解除'] },
  { stage: '第三阶段', name: '债权申报与核查', tasks: 4, tasksList: ['通知已知债权人并公告', '接收登记债权申报', '审查申报债权并编制债权表', '债权审查结果通知'] },
  { stage: '第四阶段', name: '债权人会议', tasks: 2, tasksList: ['会议资料准备', '组织表决并记录结果'] },
  { stage: '第五阶段', name: '重整和解及破产宣告', tasks: 3, tasksList: ['审查宣告破产条件', '裁定宣告债务人破产', '裁定重整与和解程序'] },
  { stage: '第六阶段', name: '财产变价与分配', tasks: 3, tasksList: ['拟定并执行财产变价方案', '审核破产费用与共益债务', '执行破产财产分配'] },
  { stage: '第七阶段', name: '程序终结与注销', tasks: 4, tasksList: ['提请终结破产程序', '法院裁定并公告', '办理企业注销登记', '管理人终止执行职务并归档'] },
];

const envRequirements = [
  { item: '操作系统（Web）', min: 'Windows 10 / macOS 10.15+', recommended: 'Windows 11 / macOS 13+' },
  { item: '浏览器', min: 'Chrome 90+ / Edge 90+ / Firefox 90+', recommended: 'Chrome 最新版' },
  { item: '屏幕分辨率', min: '1280×720', recommended: '1920×1080 及以上' },
  { item: 'Node.js', min: '≥ 20.10.0', recommended: '最新 LTS 版本' },
  { item: 'pnpm', min: '≥ 9.12.0', recommended: '最新版本' },
  { item: 'iOS', min: 'iOS 12.0 及以上', recommended: '最新版本' },
  { item: 'Android', min: 'Android 7.0 及以上', recommended: '最新版本' },
];
</script>

<template>
  <Page description="全面了解破管通破产管理系统的功能特性与核心价值" title="产品介绍">
    <div class="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <!-- 产品概述 -->
      <Card title="产品概述" class="p-6">
        <div class="space-y-4">
          <p class="text-lg leading-relaxed text-gray-700">
            <span class="text-primary text-2xl font-bold">{{ customerConfig.app.name }}</span>
            （{{ customerConfig.app.fullName }}）是一款面向破产管理人执业业务的专业化管理平台，实现了破产案件从申请受理到程序终结的全生命周期管理。
          </p>
          <p class="text-base leading-relaxed text-gray-600">
            系统以
            <span class="text-primary font-semibold">"{{ customerConfig.app.slogan }}"</span>
            为设计理念，覆盖案件管理、债权管理、流程管控、费用报销、资金管理、文档协作等核心业务场景，帮助破产管理人规范执业流程、提升工作效率、降低执业风险。
          </p>
        </div>

        <ElDescriptions :column="2" border class="mt-6">
          <ElDescriptionsItem label="软件名称">
            {{ customerConfig.app.name }}（{{ customerConfig.app.fullName }}）
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版本号">
            <ElTag size="large" type="primary">V5.5.9</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="开发单位">
            {{ customerConfig.company.name }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="系统定位">
            破产执业业务·管理人主办·全生命周期打通完成
          </ElDescriptionsItem>
        </ElDescriptions>
      </Card>

      <!-- 核心价值 -->
      <Card title="核心价值" class="p-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="value in coreValues"
            :key="value.title"
            class="hover:border-primary rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
          >
            <div class="mb-4 flex items-center gap-4">
              <span class="text-4xl">{{ value.icon }}</span>
              <h3 class="text-primary text-xl font-semibold">{{ value.title }}</h3>
            </div>
            <p class="text-base leading-relaxed text-gray-600">{{ value.desc }}</p>
          </div>
        </div>
      </Card>

      <!-- 功能模块 -->
      <Card title="功能模块" class="p-6">
        <ElCollapse accordion>
          <ElCollapseItem
            v-for="mod in modules"
            :key="mod.name"
            :name="mod.name"
          >
            <template #title>
              <span class="text-lg font-semibold">{{ mod.name }}</span>
            </template>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                v-for="child in mod.children"
                :key="child.name"
                class="bg-gray-50 hover:bg-primary/5 rounded-lg p-5 transition-colors"
              >
                <h4 class="text-primary mb-2 text-lg font-medium">{{ child.name }}</h4>
                <p class="text-base text-gray-600">{{ child.desc }}</p>
              </div>
            </div>
          </ElCollapseItem>
        </ElCollapse>
      </Card>

      <!-- 系统架构 -->
      <Card title="系统架构" class="p-6">
        <p class="mb-6 text-base text-gray-600">本系统采用前后端分离架构，各层级技术方案如下：</p>
        <ElTable :data="architectureLayers" border stripe>
          <ElTableColumn label="层级" prop="layer" width="140" />
          <ElTableColumn label="技术方案" prop="tech" min-width="200" />
          <ElTableColumn label="说明" prop="desc" min-width="250" />
        </ElTable>
      </Card>

      <!-- 破产流程七大阶段 -->
      <Card title="破产案件七大流程阶段" class="p-6">
        <p class="mb-6 text-base text-gray-600">
          系统将破产案件流程划分为七个阶段，共23个标准任务节点：
        </p>
        <div class="space-y-4">
          <div
            v-for="(stage, index) in bankruptcyStages"
            :key="stage.stage"
            class="hover:border-primary rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm"
          >
            <div class="mb-4 flex items-center gap-4">
              <span
                class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
              >
                {{ index + 1 }}
              </span>
              <div>
                <h3 class="text-lg font-semibold">{{ stage.stage }}：{{ stage.name }}</h3>
                <span class="text-sm text-gray-400">{{ stage.tasks }} 个任务节点</span>
              </div>
            </div>
            <div class="ml-14 flex flex-wrap gap-2">
              <ElTag
                v-for="task in stage.tasksList"
                :key="task"
                size="large"
                type="info"
              >
                {{ task }}
              </ElTag>
            </div>
          </div>
        </div>
      </Card>

      <!-- 运行环境 -->
      <Card title="运行环境要求" class="p-6">
        <ElTable :data="envRequirements" border stripe>
          <ElTableColumn label="项目" prop="item" width="180" />
          <ElTableColumn label="最低要求" prop="min" min-width="200" />
          <ElTableColumn label="推荐配置" prop="recommended" min-width="200" />
        </ElTable>
      </Card>

      <!-- 更多特性 -->
      <Card title="更多特性" class="p-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="rounded-lg border border-gray-200 p-6">
            <h3 class="text-primary mb-3 text-xl font-semibold">💬 即时通讯</h3>
            <p class="text-base text-gray-600">
              系统内置即时通讯功能，基于WebSocket实现消息实时推送，支持用户间在线沟通。
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 p-6">
            <h3 class="text-primary mb-3 text-xl font-semibold">🔔 通知中心</h3>
            <p class="text-base text-gray-600">
              管理系统中的各类消息通知，支持按类型筛选、标记已读、批量删除等操作。
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 p-6">
            <h3 class="text-primary mb-3 text-xl font-semibold">👤 用户与权限管理</h3>
            <p class="text-base text-gray-600">
              完善的用户账号管理和角色权限分配体系，确保系统数据安全。
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 p-6">
            <h3 class="text-primary mb-3 text-xl font-semibold">📱 移动端支持</h3>
            <p class="text-base text-gray-600">
              基于uni-app开发的移动端，支持H5、微信小程序、APP多端运行，数据实时同步。
            </p>
          </div>
        </div>
      </Card>

      <!-- 页脚信息 -->
      <div class="py-8 text-center text-sm text-gray-400">
        <p>© {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }} 版权所有</p>
        <p class="mt-2">本文档版权归{{ customerConfig.company.name }}所有</p>
      </div>
    </div>
  </Page>
</template>
