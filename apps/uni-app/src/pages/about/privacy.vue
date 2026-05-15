<template>
  <view class="privacy-container">
    <view class="privacy-content">
      <view class="privacy-title">隐私政策与数据授权协议</view>
      <view class="privacy-version">版本号：v1.0</view>
      <view class="privacy-date">生效日期：{{ customerConfig.copyright.year }}年5月14日</view>

      <view class="section">
        <view class="section-title">前言</view>
        <view class="section-content">
          <text>欢迎使用「{{ customerConfig.app.fullName }}」（以下简称"本系统"）。本《隐私政策与数据授权协议》（以下简称"本协议"）由本系统运营方（以下简称"我们"）与使用本系统的律师事务所（以下简称"律所"或"您"）共同订立。在您开始使用本系统之前，请务必仔细阅读并充分理解本协议的全部内容，特别是以加粗或下划线标注的条款。</text>
          <text class="highlight">您通过注册、登录、使用本系统或以其他任何方式使用本系统服务的行为，即表示您已充分阅读、理解并同意接受本协议的全部约束。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第一条 定义</view>
        <view class="section-content">
          <text><text class="bold">1. 个人数据：</text>指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，包括但不限于姓名、身份证号、电话号码、电子邮箱、住址等。</text>
          <text><text class="bold">2. 案件数据：</text>指与破产案件相关的所有业务数据，包括但不限于案件基本信息、债权人信息、债权申报数据、审批记录、档案文件等。</text>
          <text><text class="bold">3. 系统数据：</text>指用户在使用本系统过程中产生的操作日志、登录记录、设备信息等技术性数据。</text>
          <text><text class="bold">4. 敏感个人信息：</text>指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括但不限于身份证件号码、手机号码、银行账户信息等。</text>
          <text><text class="bold">5. 数据主体：</text>指个人数据所关联的自然人，在本协议语境下主要包括律所用户、债权人、债务人及其他案件相关自然人。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第二条 我们收集的数据</view>
        <view class="sub-section">
          <view class="sub-title">2.1 用户（律所工作人员）数据</view>
          <view class="section-content">
            <text>在律所管理员为用户创建账号及用户使用本系统过程中，系统会收集以下信息：</text>
          </view>
          <view class="data-card" v-for="item in userDataFields" :key="item.category">
            <view class="data-card-header">
              <text class="data-category">{{ item.category }}</text>
            </view>
            <view class="data-card-body">
              <view class="data-row">
                <text class="data-label">具体字段：</text>
                <text class="data-value">{{ item.fields }}</text>
              </view>
              <view class="data-row">
                <text class="data-label">收集目的：</text>
                <text class="data-value">{{ item.purpose }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="sub-section">
          <view class="sub-title">2.2 案件相关数据</view>
          <view class="section-content">
            <text>律所在处理破产案件过程中录入的数据，包括但不限于：</text>
          </view>
          <view class="data-card" v-for="item in caseDataFields" :key="item.category">
            <view class="data-card-header">
              <text class="data-category">{{ item.category }}</text>
            </view>
            <view class="data-card-body">
              <view class="data-row">
                <text class="data-label">具体字段：</text>
                <text class="data-value">{{ item.fields }}</text>
              </view>
              <view class="data-row">
                <text class="data-label">收集目的：</text>
                <text class="data-value">{{ item.purpose }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="sub-section">
          <view class="sub-title">2.3 系统自动收集的数据</view>
          <view class="data-card" v-for="item in sysDataFields" :key="item.category">
            <view class="data-card-header">
              <text class="data-category">{{ item.category }}</text>
            </view>
            <view class="data-card-body">
              <view class="data-row">
                <text class="data-label">具体字段：</text>
                <text class="data-value">{{ item.fields }}</text>
              </view>
              <view class="data-row">
                <text class="data-label">收集目的：</text>
                <text class="data-value">{{ item.purpose }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第三条 敏感个人信息的处理</view>
        <view class="section-content">
          <text class="highlight">本系统对以下敏感个人信息采用SM4国密算法进行加密存储，确保即使数据库发生泄露，敏感数据也无法被直接读取：</text>
          <text>1. 手机号码</text>
          <text>2. 电话号码</text>
          <text>3. 身份证件号码</text>
          <text>上述数据在数据库中以密文形式存储，仅在业务需要时通过系统内部解密后使用。我们不会以明文形式将上述敏感信息传输至系统外部。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第四条 数据存储位置与安全</view>
        <view class="sub-section">
          <view class="sub-title">4.1 数据存储位置</view>
          <view class="section-content">
            <text><text class="bold">本地部署版：</text>所有数据存储在律所自身的服务器或律所指定的私有机房中，由律所自行管理和维护数据安全。</text>
            <text><text class="bold">SaaS云服务版：</text>所有数据存储在阿里云（Alibaba Cloud）位于中国境内的合规机房，阿里云已通过以下权威认证：</text>
            <text>  • ISO 27001 信息安全管理体系认证</text>
            <text>  • ISO 27701 隐私信息管理体系认证</text>
            <text>  • 公安部信息系统安全等级保护三级认证（等保三级）</text>
            <text>  • CSA STAR 云安全认证</text>
          </view>
        </view>

        <view class="sub-section">
          <view class="sub-title">4.2 数据安全保障措施</view>
          <view class="section-content">
            <text>我们采取以下多层次的安全保障措施保护您的数据：</text>
          </view>
          <view class="data-card" v-for="item in securityMeasures" :key="item.layer">
            <view class="data-card-header">
              <text class="data-category">{{ item.layer }}</text>
            </view>
            <view class="data-card-body">
              <text class="data-value">{{ item.measures }}</text>
            </view>
          </view>
        </view>

        <view class="sub-section">
          <view class="sub-title">4.3 数据跨境传输</view>
          <view class="section-content">
            <text class="highlight">本系统的所有数据均存储于中华人民共和国境内。我们不会将数据跨境传输至境外，除非法律法规另有要求并经过您的明确同意。</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第五条 数据使用与共享</view>
        <view class="sub-section">
          <view class="sub-title">5.1 数据使用范围</view>
          <view class="section-content">
            <text>我们收集的全部数据仅用于以下目的：</text>
            <text>1. 提供破产案件管理的核心业务功能；</text>
            <text>2. 保障系统安全稳定运行；</text>
            <text>3. 履行法律法规规定的义务；</text>
            <text>4. 根据律所的要求提供技术支持和客户服务。</text>
          </view>
        </view>
        <view class="sub-section">
          <view class="sub-title">5.2 数据共享原则</view>
          <view class="section-content">
            <text class="highlight">我们不会将您的数据出售、出租或交易给任何第三方。</text>
            <text>仅在以下情形下，我们可能共享您的数据：</text>
            <text>1. 在获得您明确同意或授权的情况下；</text>
            <text>2. 根据法律法规规定、行政或司法机关的合法要求；</text>
            <text>3. 为保护我们或公众的合法权益所必需。</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第六条 律所的责任与义务（重要）</view>
        <view class="sub-section">
          <view class="sub-title">6.1 确保数据来源合法性</view>
          <view class="section-content">
            <text class="highlight">律所作为本系统的使用主体和数据控制者，承担以下法定责任：律所有责任确保其录入本系统的所有数据（包括但不限于债权人个人信息、债权申报数据、案件相关文件等）均已获得相关数据主体（债权人、债务人等）的合法授权或符合法律法规规定的其他合法性基础。</text>
            <text>具体而言，律所应当确保：</text>
            <text>1. 在收集债权人个人信息时，已向其明确告知信息收集的目的、方式和范围，并取得其明确同意；</text>
            <text>2. 在录入债权人的敏感个人信息（身份证号、手机号等）时，已获取其单独同意；</text>
            <text>3. 所有录入数据的收集、使用和处理均符合《中华人民共和国个人信息保护法》《中华人民共和国数据安全法》《中华人民共和国网络安全法》等相关法律法规的要求。</text>
          </view>
        </view>
        <view class="sub-section">
          <view class="sub-title">6.2 律所的数据管理义务</view>
          <view class="section-content">
            <text>律所在使用本系统期间应当：</text>
            <text>1. 妥善管理本所用户的账号和权限，确保仅授权人员可以访问系统；</text>
            <text>2. 定期审查用户权限，及时注销已离职或不再需要访问权限的用户账号；</text>
            <text>3. 不得利用本系统从事任何违法违规的数据处理活动；</text>
            <text>4. 对因律所自身原因导致的数据泄露、滥用等问题承担相应法律责任。</text>
          </view>
        </view>
        <view class="sub-section">
          <view class="sub-title">6.3 数据主体权利响应</view>
          <view class="section-content">
            <text>当数据主体（债权人等）向律所行使个人信息权利（查阅、更正、删除、撤回同意等）时，律所有义务及时响应和处理。如需技术协助，我们将在合理范围内提供支持。</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第七条 数据保留与删除</view>
        <view class="sub-section">
          <view class="sub-title">7.1 数据保留期限</view>
          <view class="section-content">
            <text><text class="bold">用户账号数据：</text>在账号存续期间保留，账号注销后按律所要求进行删除或匿名化处理；</text>
            <text><text class="bold">案件数据：</text>按照法律法规对于破产案件档案保存的要求，在案件结案后继续保留法定期限；</text>
            <text><text class="bold">审计日志：</text>按照相关法律法规及合规要求保留，一般不少于6个月；</text>
            <text><text class="bold">系统备份：</text>按照系统设定的备份保留策略，默认保留30天。</text>
          </view>
        </view>
        <view class="sub-section">
          <view class="sub-title">7.2 数据删除</view>
          <view class="section-content">
            <text>在以下情形下，律所可向我们提出数据删除请求：</text>
            <text>1. 数据收集和处理的目的已实现或不再必要；</text>
            <text>2. 律所停止使用本系统；</text>
            <text>3. 法律法规规定的其他情形。</text>
            <text>我们将在收到合法有效的删除请求后，在法律允许的期限内完成数据删除或匿名化处理。</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第八条 用户（律所工作人员）的权利</view>
        <view class="section-content">
          <text>作为本系统的用户，您享有以下权利：</text>
          <text><text class="bold">1. 知情权：</text>有权知晓本系统如何处理您的个人信息；</text>
          <text><text class="bold">2. 查阅权：</text>有权查阅本系统中存储的您的个人信息；</text>
          <text><text class="bold">3. 更正权：</text>发现个人信息有误时，有权要求更正；</text>
          <text><text class="bold">4. 删除权：</text>在符合法律规定的情形下，有权要求删除您的个人信息；</text>
          <text><text class="bold">5. 撤回同意权：</text>您可以随时撤回对个人信息处理的同意，但不影响撤回前已进行的处理活动的合法性。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第九条 未成年人保护</view>
        <view class="section-content">
          <text>本系统为专业法律服务工具，面向律师事务所使用，不以未成年人为服务对象。如律所在案件处理中不可避免地涉及未成年人信息，律所应当确保已取得其监护人的明示同意，并采取更加严格的保护措施。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第十条 免责声明</view>
        <view class="section-content">
          <text>在以下情形下，我们不承担法律责任：</text>
          <text>1. 因律所未按本协议第六条要求取得债权人等数据主体的合法授权而导致的数据纠纷；</text>
          <text>2. 因律所自身安全管理不善（如账号密码泄露、权限管理不当）导致的数据泄露；</text>
          <text>3. 因不可抗力（如自然灾害、网络攻击等）导致的数据损失，但我们已采取合理的防护措施除外；</text>
          <text>4. 律所录入数据的准确性、真实性和完整性由律所自行负责。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第十一条 协议更新</view>
        <view class="section-content">
          <text>我们可能根据法律法规的变化或业务需要适时更新本协议。协议更新后，我们将在系统内发布更新版本并通过系统通知、弹窗等方式提醒您。如您在协议更新后继续使用本系统，即表示您接受更新后的协议。</text>
          <text class="highlight">重大变更的情形包括但不限于：</text>
          <text>1. 收集的数据范围发生显著变化；</text>
          <text>2. 数据使用目的发生变更；</text>
          <text>3. 数据存储位置发生迁移；</text>
          <text>4. 数据共享方式发生改变。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">第十二条 联系方式</view>
        <view class="section-content">
          <text>如您对本隐私政策或数据处理有任何疑问、意见或建议，请通过以下方式联系我们：</text>
          <text>公司名称：{{ customerConfig.company.name }}</text>
          <text>电子邮箱：{{ customerConfig.company.email }}</text>
          <text>我们将在收到您的反馈后15个工作日内予以回复。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">附件：数据收集清单</view>
        <view class="table-wrapper">
          <view class="table-header">
            <text class="th th-num">序号</text>
            <text class="th th-field">数据字段</text>
            <text class="th th-cat">类别</text>
            <text class="th th-sensitive">敏感</text>
            <text class="th th-encrypt">加密</text>
          </view>
          <view class="table-row" v-for="item in dataInventory" :key="item.num">
            <text class="td td-num">{{ item.num }}</text>
            <text class="td td-field">{{ item.field }}</text>
            <text class="td td-cat">{{ item.category }}</text>
            <text class="td td-sensitive" :class="{ sensitive: item.sensitive === '是' }">{{ item.sensitive }}</text>
            <text class="td td-encrypt">{{ item.encrypt }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="agree-footer">
      <view v-if="alreadyAgreed" class="agreed-info">
        <u-icon name="checkmark-circle" color="#52c41a" size="20" />
        <text>您已同意本隐私政策与数据授权协议</text>
      </view>
      <button
        v-if="!alreadyAgreed"
        class="agree-btn"
        :class="{ loading: agreeing }"
        :disabled="agreeing"
        @click="handleAgree"
      >
        <text v-if="agreeing">提交中...</text>
        <text v-else>我已阅读并同意隐私政策与数据授权协议</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { customerConfig } from '@/customer.config'
import {
  checkAgreement,
  agreeAgreement,
  AGREEMENT_TYPES,
} from '@/api/agreement'

const alreadyAgreed = ref(false)
const agreeing = ref(false)

const userDataFields = [
  {
    category: '身份信息',
    fields: '用户名、真实姓名',
    purpose: '用户身份识别与账号管理',
  },
  {
    category: '联系方式',
    fields: '手机号码、电话号码、电子邮箱',
    purpose: '账号安全验证、系统通知',
  },
  {
    category: '账号安全',
    fields: '登录密码（加密存储）、登录IP地址、登录时间',
    purpose: '安全审计与异常检测',
  },
  {
    category: '操作审计',
    fields: '操作日志、登录次数、密码错误次数',
    purpose: '安全审计与合规管理',
  },
]

const caseDataFields = [
  {
    category: '案件信息',
    fields: '案件编号、案件名称、案件类型、案件状态、法院信息',
    purpose: '破产案件管理核心业务',
  },
  {
    category: '债权人信息',
    fields: '债权人姓名/名称、联系电话、联系邮箱、联系地址、身份证件号码、法定代表人',
    purpose: '债权申报与债权人管理',
  },
  {
    category: '债权申报',
    fields: '债权金额、债权类型、申报材料、审查结果',
    purpose: '债权申报处理',
  },
  {
    category: '审批数据',
    fields: '审批流程、审批意见、审批人、审批时间',
    purpose: '案件审批流程管理',
  },
  {
    category: '档案文件',
    fields: '案件相关文件、证据材料、法律文书',
    purpose: '案件档案管理',
  },
]

const sysDataFields = [
  {
    category: '设备信息',
    fields: 'IP地址、浏览器类型、操作系统',
    purpose: '安全防护与兼容性保障',
  },
  {
    category: '操作日志',
    fields: '功能模块访问记录、数据操作记录（增/删/改/查）',
    purpose: '审计追溯与安全监控',
  },
  {
    category: '系统备份',
    fields: '数据库自动备份文件',
    purpose: '数据容灾与恢复',
  },
]

const securityMeasures = [
  {
    layer: '数据加密',
    measures: '敏感字段采用SM4国密算法加密存储；数据传输全程使用HTTPS/TLS加密',
  },
  {
    layer: '访问控制',
    measures: '基于角色（RBAC）的细粒度权限控制，用户仅能访问其授权范围内的数据',
  },
  {
    layer: '审计追溯',
    measures: '全量操作审计日志记录，支持不可篡改的哈希链审计技术',
  },
  {
    layer: '数据备份',
    measures: '定时自动数据库备份，支持数据恢复',
  },
  {
    layer: '数据库防护',
    measures: '数据库连接池管理、SQL注入防护、最小权限原则',
  },
  {
    layer: '网络安全',
    measures: '防火墙、入侵检测、DDoS防护（SaaS版由阿里云提供）',
  },
]

const dataInventory = [
  { num: 1, field: '用户名', category: '用户数据', sensitive: '否', encrypt: '否' },
  { num: 2, field: '真实姓名', category: '用户数据', sensitive: '否', encrypt: '否' },
  { num: 3, field: '手机号码', category: '用户数据', sensitive: '是', encrypt: 'SM4加密' },
  { num: 4, field: '电话号码', category: '用户数据', sensitive: '是', encrypt: 'SM4加密' },
  { num: 5, field: '电子邮箱', category: '用户数据', sensitive: '否', encrypt: '否' },
  { num: 6, field: '登录密码', category: '用户数据', sensitive: '是', encrypt: '哈希加密' },
  { num: 7, field: '登录IP地址', category: '系统数据', sensitive: '否', encrypt: '否' },
  { num: 8, field: '登录时间', category: '系统数据', sensitive: '否', encrypt: '否' },
  { num: 9, field: '操作日志', category: '系统数据', sensitive: '否', encrypt: '否' },
  { num: 10, field: '债权人姓名/名称', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 11, field: '债权人联系电话', category: '案件数据', sensitive: '是', encrypt: 'SM4加密' },
  { num: 12, field: '债权人邮箱', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 13, field: '债权人地址', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 14, field: '债权人身份证号', category: '案件数据', sensitive: '是', encrypt: 'SM4加密' },
  { num: 15, field: '法定代表人', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 16, field: '案件信息', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 17, field: '债权申报数据', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 18, field: '审批记录', category: '案件数据', sensitive: '否', encrypt: '否' },
  { num: 19, field: '档案文件', category: '案件数据', sensitive: '视内容而定', encrypt: '否' },
]

const checkAgreementStatus = async () => {
  try {
    const result = await checkAgreement(AGREEMENT_TYPES.PRIVACY_POLICY)
    alreadyAgreed.value = !!result
  } catch (_error) {
    alreadyAgreed.value = false
  }
}

const handleAgree = async () => {
  agreeing.value = true
  try {
    await agreeAgreement({
      agreementType: AGREEMENT_TYPES.PRIVACY_POLICY,
      agreementVersion: '1.0.0',
      agreed: true,
    })
    alreadyAgreed.value = true
    uni.showToast({ title: '同意隐私政策成功', icon: 'success' })
  } catch (_error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    agreeing.value = false
  }
}

onMounted(() => {
  checkAgreementStatus()
})
</script>

<style lang="scss" scoped>
.privacy-container {
  min-height: 100vh;
  background: #fff;
  padding: 30rpx;
  padding-bottom: 140rpx;
}

.privacy-content {
  .privacy-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 10rpx;
  }

  .privacy-version {
    font-size: 22rpx;
    color: #999;
    text-align: center;
    margin-bottom: 8rpx;
  }

  .privacy-date {
    font-size: 24rpx;
    color: #999;
    text-align: right;
    margin-bottom: 40rpx;
  }

  .section {
    margin-bottom: 40rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
      padding-left: 16rpx;
      border-left: 6rpx solid #1890ff;
    }

    .sub-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #555;
      margin-bottom: 16rpx;
      margin-top: 24rpx;
    }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 16rpx;

      text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.7;
      }

      .highlight, text.highlight {
        color: #d4380d;
        font-weight: 500;
      }

      .bold, text.bold {
        font-weight: bold;
        color: #333;
      }
    }
  }

  .sub-section {
    margin-bottom: 28rpx;
  }

  .data-card {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 16rpx;

    .data-card-header {
      margin-bottom: 12rpx;

      .data-category {
        font-size: 26rpx;
        font-weight: bold;
        color: #1890ff;
      }
    }

    .data-card-body {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .data-row {
        display: flex;
        flex-direction: column;
        gap: 4rpx;
      }

      .data-label {
        font-size: 22rpx;
        color: #999;
      }

      .data-value {
        font-size: 24rpx;
        color: #555;
        line-height: 1.5;
      }
    }
  }

  // 数据收集清单表格
  .table-wrapper {
    border: 1rpx solid #e8e8e8;
    border-radius: 12rpx;
    overflow: hidden;

    .table-header {
      display: flex;
      background: #f0f5ff;
      padding: 16rpx 12rpx;
      border-bottom: 1rpx solid #e8e8e8;

      .th {
        font-size: 22rpx;
        font-weight: bold;
        color: #333;
        text-align: center;
      }

      .th-num { width: 60rpx; flex-shrink: 0; }
      .th-field { flex: 1; text-align: left; padding-left: 8rpx; }
      .th-cat { width: 100rpx; flex-shrink: 0; }
      .th-sensitive { width: 70rpx; flex-shrink: 0; }
      .th-encrypt { width: 110rpx; flex-shrink: 0; }
    }

    .table-row {
      display: flex;
      padding: 14rpx 12rpx;
      border-bottom: 1rpx solid #f0f0f0;
      align-items: center;

      &:last-child {
        border-bottom: none;
      }

      &:nth-child(odd) {
        background: #fafafa;
      }

      .td {
        font-size: 22rpx;
        color: #666;
        text-align: center;
        word-break: break-all;
      }

      .td-num { width: 60rpx; flex-shrink: 0; color: #999; }
      .td-field { flex: 1; text-align: left; padding-left: 8rpx; color: #333; }
      .td-cat { width: 100rpx; flex-shrink: 0; font-size: 20rpx; }
      .td-sensitive { width: 70rpx; flex-shrink: 0; }

      .td-sensitive.sensitive {
        color: #d4380d;
        font-weight: bold;
      }

      .td-encrypt { width: 110rpx; flex-shrink: 0; font-size: 20rpx; }
    }
  }
}

.agree-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

  .agree-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);

    &.loading {
      opacity: 0.7;
    }
  }

  .agreed-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 16rpx 0;

    text {
      font-size: 26rpx;
      color: #52c41a;
    }
  }
}
</style>