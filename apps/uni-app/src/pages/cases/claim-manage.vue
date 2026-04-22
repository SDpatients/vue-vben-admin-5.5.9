<template>
  <view class="claim-manage-container">
    <view class="header">
      <view class="header-content">
        <text class="title">债权管理</text>
        <text class="subtitle">案件编号：{{ caseNo }}</text>
      </view>

      <view class="tabs-wrapper">
        <view
          v-for="(tab, index) in tabs"
          :key="tab.key"
          :class="['tab-item', { 'tab-active': activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="tab.key === 'registration' && registrationCount > 0" class="tab-badge">
            <text class="badge-text">{{ registrationCount }}</text>
          </view>
          <view v-if="tab.key === 'review' && reviewCount > 0" class="tab-badge">
            <text class="badge-text">{{ reviewCount }}</text>
          </view>
          <view v-if="tab.key === 'confirmation' && confirmationCount > 0" class="tab-badge">
            <text class="badge-text">{{ confirmationCount }}</text>
          </view>
          <view v-if="tab.key === 'creditor' && creditorCount > 0" class="tab-badge">
            <text class="badge-text">{{ creditorCount }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <!-- 债权申报登记 -->
      <view v-show="activeTab === 'registration'" class="tab-panel">
        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-number">{{ stats.total }}</text>
            <text class="stats-label">债权总数</text>
          </view>
          <view class="stats-item">
            <text class="stats-number">{{ stats.confirmed }}</text>
            <text class="stats-label">已确认</text>
          </view>
          <view class="stats-item">
            <text class="stats-number">{{ stats.pending }}</text>
            <text class="stats-label">待审核</text>
          </view>
        </view>

        <view v-if="registrationLoading" class="loading-container">
          <text>加载中...</text>
        </view>

        <view v-else-if="claimList.length === 0" class="empty-state">
          <text class="empty-text">暂无债权数据</text>
        </view>

        <scroll-view
          v-else
          class="claim-scroll"
          scroll-y
          :lower-threshold="50"
          @scrolltolower="onRegistrationScrollToLower"
        >
          <view class="claim-list">
            <view
              class="claim-item"
              v-for="(claim, index) in claimList"
              :key="claim.id"
            >
              <view class="claim-header">
                <view class="claim-left">
                  <text class="claim-no">{{ claim.claimNo || '未编号' }}</text>
                  <text class="claim-creditor">{{ claim.creditorName }}</text>
                </view>
                <text :class="['claim-status', getRegistrationStatusClass(claim.registrationStatus)]">
                  {{ getRegistrationStatusText(claim.registrationStatus) }}
                </text>
              </view>
              <view class="claim-body">
                <view class="claim-row">
                  <text class="row-label">债权人类型</text>
                  <text class="row-value">{{ claim.creditorType || '-' }}</text>
                </view>
                <view class="claim-row">
                  <text class="row-label">债权种类</text>
                  <text class="row-value">{{ claim.claimType || '-' }}</text>
                </view>
                <view class="claim-row">
                  <text class="row-label">申报总金额</text>
                  <text class="row-value amount">{{ formatAmount(claim.totalAmount) }}</text>
                </view>
                <view class="claim-row">
                  <text class="row-label">材料完整性</text>
                  <text class="row-value">{{ getMaterialCompletenessText(claim.materialCompleteness) }}</text>
                </view>
              </view>
              <view v-if="claim.registrationStatus === 'PENDING'" class="claim-actions">
                <view class="action-btn receive" @click="handleReceiveMaterial(claim)">
                  <text>接收材料</text>
                </view>
              </view>
              <view class="claim-actions claim-actions-bottom">
                <view class="action-btn-sm edit" @click="handleEditClaim(claim)">
                  <text>编辑</text>
                </view>
                <view class="action-btn-sm delete" @click="handleDeleteClaim(claim)">
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="registrationHasMore" class="load-more">
            <text>上拉加载更多</text>
          </view>
          <view v-else-if="claimList.length > 0" class="load-more-end">
            <text>已加载全部</text>
          </view>
        </scroll-view>

        <view class="fab-btn" @click="handleAddClaim">
          <text class="fab-icon">+</text>
        </view>
      </view>

      <!-- 债权审查 -->
      <view v-show="activeTab === 'review'" class="tab-panel">
        <view class="review-stats">
          <view class="review-stat-item">
            <text class="review-stat-num">{{ reviewStats.pending }}</text>
            <text class="review-stat-label">待审查</text>
          </view>
          <view class="review-stat-item">
            <text class="review-stat-num">{{ reviewStats.inProgress }}</text>
            <text class="review-stat-label">审查中</text>
          </view>
          <view class="review-stat-item">
            <text class="review-stat-num">{{ reviewStats.completed }}</text>
            <text class="review-stat-label">已完成</text>
          </view>
        </view>

        <view v-if="reviewLoading" class="loading-container">
          <text>加载中...</text>
        </view>

        <view v-else-if="reviewList.length === 0" class="empty-state">
          <text class="empty-text">暂无审查数据</text>
        </view>

        <scroll-view
          v-else
          class="claim-scroll"
          scroll-y
          :lower-threshold="50"
          @scrolltolower="onReviewScrollToLower"
        >
          <view class="review-list">
            <view
              class="review-item"
              v-for="(item, index) in reviewList"
              :key="item.id"
            >
              <view class="review-header">
                <text class="review-creditor">{{ item.creditorName }}</text>
                <text :class="['review-status-tag', getReviewStatusClass(item.reviewStatus)]">
                  {{ getReviewStatusText(item.reviewStatus) }}
                </text>
              </view>
              <view class="review-body">
                <view class="review-section">
                  <text class="section-label">申报金额</text>
                  <text class="section-value amount">{{ formatAmount(item.declaredTotalAmount) }}</text>
                </view>
                <view class="review-section">
                  <text class="section-label">确认金额</text>
                  <text class="section-value confirmed-amount">{{ formatAmount(item.confirmedTotalAmount) }}</text>
                </view>
                <view class="review-section">
                  <text class="section-label">未确认金额</text>
                  <text class="section-value unconfirmed-amount">{{ formatAmount(item.unconfirmedTotalAmount) }}</text>
                </view>
                <view class="review-section">
                  <text class="section-label">审查轮次</text>
                  <text class="section-value">第 {{ item.reviewRound || 1 }} 轮</text>
                </view>
              </view>
              <view v-if="item.reviewStatus === 'PENDING' || item.reviewStatus === 'IN_PROGRESS'" class="review-actions">
                <view class="review-action-btn" @click="handleCompleteReview(item)">
                  <text>完成审查</text>
                </view>
                <view class="review-action-btn reject" @click="handleRejectReview(item)">
                  <text>驳回</text>
                </view>
              </view>
              <view class="review-actions review-actions-bottom">
                <view class="action-btn-sm edit" @click="handleEditReview(item)">
                  <text>编辑</text>
                </view>
                <view class="action-btn-sm delete" @click="handleDeleteReview(item)">
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="reviewHasMore" class="load-more">
            <text>上拉加载更多</text>
          </view>
          <view v-else-if="reviewList.length > 0" class="load-more-end">
            <text>已加载全部</text>
          </view>
        </scroll-view>

        <view class="fab-btn fab-btn-review" @click="handleAddReview">
          <text class="fab-icon">+</text>
        </view>
      </view>

      <!-- 债权确认 -->
      <view v-show="activeTab === 'confirmation'" class="tab-panel">
        <view v-if="confirmationLoading" class="loading-container">
          <text>加载中...</text>
        </view>

        <view v-else-if="confirmationList.length === 0" class="empty-state">
          <text class="empty-text">暂无确认数据</text>
        </view>

        <scroll-view
          v-else
          class="claim-scroll"
          scroll-y
          :lower-threshold="50"
          @scrolltolower="onConfirmationScrollToLower"
        >
          <view class="confirmation-list">
            <view
              class="confirmation-item"
              v-for="(item, index) in confirmationList"
              :key="item.id"
            >
              <view class="confirmation-header">
                <text class="confirmation-creditor">{{ item.creditorName }}</text>
                <text :class="['confirmation-status-tag', getConfirmationStatusClass(item.confirmationStatus)]">
                  {{ getConfirmationStatusText(item.confirmationStatus) }}
                </text>
              </view>
              <view class="confirmation-body">
                <view class="confirmation-row">
                  <text class="conf-label">债权人会议</text>
                  <text class="conf-value">{{ getMeetingTypeText(item.meetingType) }}</text>
                </view>
                <view class="confirmation-row">
                  <text class="conf-label">表决结果</text>
                  <text class="conf-value">{{ item.voteResult || '-' }}</text>
                </view>
                <view class="confirmation-row">
                  <text class="conf-label">是否有异议</text>
                  <text class="conf-value">{{ item.hasObjection ? '是' : '否' }}</text>
                </view>
                <view v-if="item.hasObjection" class="confirmation-row">
                  <text class="conf-label">异议理由</text>
                  <text class="conf-value">{{ item.objectionReason || '-' }}</text>
                </view>
                <view class="confirmation-row highlight">
                  <text class="conf-label">最终确认金额</text>
                  <text class="conf-value amount">{{ formatAmount(item.finalConfirmedAmount) }}</text>
                </view>
                <view class="confirmation-row">
                  <text class="conf-label">确认日期</text>
                  <text class="conf-value">{{ formatDate(item.finalConfirmationDate) }}</text>
                </view>
              </view>
              <view class="confirmation-actions">
                <view class="action-btn-sm edit" @click="handleEditConfirmation(item)">
                  <text>编辑</text>
                </view>
                <view class="action-btn-sm delete" @click="handleDeleteConfirmation(item)">
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="confirmationHasMore" class="load-more">
            <text>上拉加载更多</text>
          </view>
          <view v-else-if="confirmationList.length > 0" class="load-more-end">
            <text>已加载全部</text>
          </view>
        </scroll-view>

        <view class="fab-btn fab-btn-confirmation" @click="handleAddConfirmation">
          <text class="fab-icon">+</text>
        </view>
      </view>

      <!-- 债权统计 -->
      <view v-show="activeTab === 'stats'" class="tab-panel">
        <view v-if="statsLoading" class="loading-container">
          <text>加载中...</text>
        </view>

        <view v-else class="stats-dashboard">
          <view class="dashboard-section">
            <view class="section-header">
              <text class="section-title">债权状态统计</text>
            </view>
            <view class="status-grid">
              <view class="status-card">
                <text class="status-num">{{ claimStats.totalClaims }}</text>
                <text class="status-label">债权总数</text>
              </view>
              <view class="status-card pending">
                <text class="status-num">{{ claimStats.pendingClaims }}</text>
                <text class="status-label">待处理</text>
              </view>
              <view class="status-card registered">
                <text class="status-num">{{ claimStats.registeredClaims }}</text>
                <text class="status-label">已登记</text>
              </view>
              <view class="status-card reviewing">
                <text class="status-num">{{ claimStats.reviewingClaims }}</text>
                <text class="status-label">审查中</text>
              </view>
              <view class="status-card confirmed">
                <text class="status-num">{{ claimStats.confirmedClaims }}</text>
                <text class="status-label">已确认</text>
              </view>
              <view class="status-card rejected">
                <text class="status-num">{{ claimStats.rejectedClaims }}</text>
                <text class="status-label">已驳回</text>
              </view>
            </view>
          </view>

          <view class="dashboard-section">
            <view class="section-header">
              <text class="section-title">金额统计</text>
            </view>
            <view class="amount-cards">
              <view class="amount-card declared">
                <text class="amount-label">申报总金额</text>
                <text class="amount-value">{{ formatAmount(claimStats.totalDeclaredAmount) }}</text>
              </view>
              <view class="amount-card confirmed-amount-card">
                <text class="amount-label">确认总金额</text>
                <text class="amount-value">{{ formatAmount(claimStats.totalConfirmedAmount) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 债权人信息 -->
      <view v-show="activeTab === 'creditor'" class="tab-panel">
        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-number">{{ creditorList.length }}</text>
            <text class="stats-label">债权人总数</text>
          </view>
          <view class="stats-item">
            <text class="stats-number">{{ creditorTypes.person }}</text>
            <text class="stats-label">个人</text>
          </view>
          <view class="stats-item">
            <text class="stats-number">{{ creditorTypes.company }}</text>
            <text class="stats-label">企业/机构</text>
          </view>
        </view>

        <view v-if="creditorLoading" class="loading-container">
          <text>加载中...</text>
        </view>

        <view v-else-if="creditorList.length === 0" class="empty-state">
          <text class="empty-text">暂无债权人数据</text>
        </view>

        <scroll-view
          v-else
          class="claim-scroll"
          scroll-y
          :lower-threshold="50"
          @scrolltolower="onCreditorScrollToLower"
        >
          <view class="creditor-list">
            <view
              class="creditor-item"
              v-for="(creditor, index) in creditorList"
              :key="creditor.id"
            >
              <view class="creditor-header">
                <view class="creditor-left">
                  <view class="creditor-type-tag" :class="getcreditorTypeClass(creditor.creditorType)">
                    {{ creditor.creditorType === 'NATURAL_PERSON' ? '个人' : creditor.creditorType === 'LEGAL_ENTITY' ? '企业' : creditor.creditorType === 'OTHER_ORGANIZATION' ? '机构' : creditor.creditorType }}
                  </view>
                  <text class="creditor-name">{{ creditor.creditorName }}</text>
                </view>
                <text :class="['creditor-status-tag', creditor.status === 'ENABLED' ? 'creditor-status-enabled' : 'creditor-status-disabled']">
                  {{ creditor.status === 'ENABLED' ? '正常' : '停用' }}
                </text>
              </view>
              <view class="creditor-body">
                <view v-if="creditor.creditorType !== 'NATURAL_PERSON'" class="creditor-row">
                  <text class="creditor-row-label">法定代表人</text>
                  <text class="creditor-row-value">{{ creditor.legalRepresentative || '-' }}</text>
                </view>
                <view class="creditor-row">
                  <text class="creditor-row-label">联系电话</text>
                  <text class="creditor-row-value">{{ creditor.contactPhone || '-' }}</text>
                </view>
                <view class="creditor-row">
                  <text class="creditor-row-label">电子邮箱</text>
                  <text class="creditor-row-value">{{ creditor.contactEmail || '-' }}</text>
                </view>
                <view class="creditor-row">
                  <text class="creditor-row-label">证件号码</text>
                  <text class="creditor-row-value">{{ creditor.idNumber || '-' }}</text>
                </view>
                <view v-if="creditor.creditorType !== 'NATURAL_PERSON'" class="creditor-row">
                  <text class="creditor-row-label">注册资本</text>
                  <text class="creditor-row-value amount">{{ formatAmount(creditor.registeredCapital) }}</text>
                </view>
                <view class="creditor-row">
                  <text class="creditor-row-label">地址</text>
                  <text class="creditor-row-value address">{{ creditor.address || '-' }}</text>
                </view>
              </view>
              <view class="creditor-actions">
                <view class="creditor-action-btn edit" @click="handleEditCreditor(creditor)">
                  <text>编辑</text>
                </view>
                <view class="creditor-action-btn delete" @click="handleDeleteCreditor(creditor)">
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
          <view v-if="creditorHasMore" class="load-more">
            <text>上拉加载更多</text>
          </view>
          <view v-else-if="creditorList.length > 0" class="load-more-end">
            <text>已加载全部</text>
          </view>
        </scroll-view>

        <view class="fab-btn" @click="handleAddCreditor">
          <text class="fab-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 债权人表单弹窗 -->
    <view v-if="creditorFormVisible" class="form-overlay" @click="closeCreditorForm">
      <view class="form-modal" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ creditorFormData.id ? '编辑债权人' : '新增债权人' }}</text>
          <view class="form-close" @click="closeCreditorForm">
            <text class="form-close-icon">×</text>
          </view>
        </view>
        <scroll-view class="form-body" scroll-y>
          <view class="form-group">
            <text class="form-label required">债权人类型</text>
            <view class="form-type-select">
              <view
                v-for="t in creditorTypeOptions"
                :key="t.value"
                :class="['type-option', { 'type-active': creditorFormData.creditorType === t.value }]"
                @click="creditorFormData.creditorType = t.value"
              >
                <text>{{ t.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label required">{{ creditorFormData.creditorType === 'NATURAL_PERSON' ? '姓名' : '名称' }}</text>
            <input
              v-model="creditorFormData.creditorName"
              class="form-input"
              :placeholder="creditorFormData.creditorType === 'NATURAL_PERSON' ? '请输入姓名' : '请输入名称'"
            />
          </view>
          <view class="form-group">
            <text class="form-label">{{ creditorFormData.creditorType === 'NATURAL_PERSON' ? '身份证号' : '统一社会信用代码' }}</text>
            <input
              v-model="creditorFormData.idNumber"
              class="form-input"
              :placeholder="creditorFormData.creditorType === 'NATURAL_PERSON' ? '请输入身份证号' : '请输入统一社会信用代码'"
            />
          </view>
          <view class="form-group">
            <text class="form-label">联系电话</text>
            <input
              v-model="creditorFormData.contactPhone"
              class="form-input"
              placeholder="请输入联系电话"
              type="number"
            />
          </view>
          <view class="form-group">
            <text class="form-label">电子邮箱</text>
            <input
              v-model="creditorFormData.contactEmail"
              class="form-input"
              placeholder="请输入电子邮箱"
            />
          </view>
          <view v-if="creditorFormData.creditorType !== 'NATURAL_PERSON'" class="form-group">
            <text class="form-label">法定代表人</text>
            <input
              v-model="creditorFormData.legalRepresentative"
              class="form-input"
              placeholder="请输入法定代表人"
            />
          </view>
          <view v-if="creditorFormData.creditorType !== 'NATURAL_PERSON'" class="form-group">
            <text class="form-label">注册资本</text>
            <input
              v-model="creditorFormData.registeredCapital"
              class="form-input"
              placeholder="请输入注册资本"
              type="digit"
            />
          </view>
          <view class="form-group">
            <text class="form-label">地址</text>
            <input
              v-model="creditorFormData.address"
              class="form-input"
              placeholder="请输入地址"
            />
          </view>
          <view class="form-group">
            <text class="form-label">状态</text>
            <view class="form-type-select">
              <view
                v-for="s in statusOptions"
                :key="s.value"
                :class="['type-option', { 'type-active': creditorFormData.status === s.value }]"
                @click="creditorFormData.status = s.value"
              >
                <text>{{ s.label }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="form-footer">
          <view class="form-btn cancel" @click="closeCreditorForm">
            <text>取消</text>
          </view>
          <view class="form-btn confirm" @click="submitCreditorForm">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 债权申报表单弹窗 -->
    <view v-if="claimFormVisible" class="form-overlay" @click="claimFormVisible = false">
      <view class="form-modal" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ claimFormData.id ? '编辑债权申报' : '新增债权申报' }}</text>
          <view class="form-close" @click="claimFormVisible = false"><text class="form-close-icon">×</text></view>
        </view>
        <scroll-view class="form-body" scroll-y>
          <view class="form-group">
            <text class="form-label required">债权人名称</text>
            <input v-model="claimFormData.creditorName" class="form-input" placeholder="请输入债权人名称" />
          </view>
          <view class="form-group">
            <text class="form-label required">债权人类型</text>
            <view class="form-type-select">
              <view
                v-for="t in creditorTypeOptions"
                :key="t.value"
                :class="['type-option', { 'type-active': claimFormData.creditorType === t.value }]"
                @click="claimFormData.creditorType = t.value"
              >
                <text>{{ t.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label required">债权种类</text>
            <input v-model="claimFormData.claimType" class="form-input" placeholder="请输入债权种类" />
          </view>
          <view class="form-group">
            <text class="form-label">债权性质</text>
            <input v-model="claimFormData.claimNature" class="form-input" placeholder="请输入债权性质" />
          </view>
          <view class="form-group">
            <text class="form-label">本金</text>
            <input v-model="claimFormData.principal" class="form-input" placeholder="请输入本金" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">利息</text>
            <input v-model="claimFormData.interest" class="form-input" placeholder="请输入利息" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">违约金</text>
            <input v-model="claimFormData.penalty" class="form-input" placeholder="请输入违约金" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">其他损失</text>
            <input v-model="claimFormData.otherLosses" class="form-input" placeholder="请输入其他损失" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">材料完整性</text>
            <view class="form-type-select">
              <view v-for="m in materialOptions" :key="m" :class="['type-option', { 'type-active': claimFormData.materialCompleteness === m }]" @click="claimFormData.materialCompleteness = m">
                <text>{{ m }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="form-footer">
          <view class="form-btn cancel" @click="claimFormVisible = false"><text>取消</text></view>
          <view class="form-btn confirm" @click="submitClaimForm"><text>确定</text></view>
        </view>
      </view>
    </view>

    <!-- 债权审查表单弹窗 -->
    <view v-if="reviewFormVisible" class="form-overlay" @click="reviewFormVisible = false">
      <view class="form-modal" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ reviewFormData.id ? '编辑债权审查' : '新增债权审查' }}</text>
          <view class="form-close" @click="reviewFormVisible = false"><text class="form-close-icon">×</text></view>
        </view>
        <scroll-view class="form-body" scroll-y>
          <view class="form-group">
            <text class="form-label required">债权人名称</text>
            <input v-model="reviewFormData.creditorName" class="form-input" placeholder="请输入债权人名称" />
          </view>
          <view class="form-group">
            <text class="form-label">审查人</text>
            <input v-model="reviewFormData.reviewer" class="form-input" placeholder="请输入审查人" />
          </view>
          <view class="form-group">
            <text class="form-label">审查轮次</text>
            <input v-model="reviewFormData.reviewRound" class="form-input" placeholder="请输入轮次" type="number" />
          </view>
          <view class="form-group">
            <text class="form-label">申报本金</text>
            <input v-model="reviewFormData.declaredPrincipal" class="form-input" placeholder="请输入申报本金" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">申报利息</text>
            <input v-model="reviewFormData.declaredInterest" class="form-input" placeholder="请输入申报利息" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">确认本金</text>
            <input v-model="reviewFormData.confirmedPrincipal" class="form-input" placeholder="请输入确认本金" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">确认利息</text>
            <input v-model="reviewFormData.confirmedInterest" class="form-input" placeholder="请输入确认利息" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">未确认本金</text>
            <input v-model="reviewFormData.unconfirmedPrincipal" class="form-input" placeholder="请输入未确认本金" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">未确认利息</text>
            <input v-model="reviewFormData.unconfirmedInterest" class="form-input" placeholder="请输入未确认利息" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">审查结论</text>
            <input v-model="reviewFormData.reviewConclusion" class="form-input" placeholder="请输入审查结论" />
          </view>
          <view class="form-group">
            <text class="form-label">审查状态</text>
            <view class="form-type-select">
              <view v-for="s in reviewStatusOptions" :key="s.value" :class="['type-option', { 'type-active': reviewFormData.reviewStatus === s.value }]" @click="reviewFormData.reviewStatus = s.value">
                <text>{{ s.label }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="form-footer">
          <view class="form-btn cancel" @click="reviewFormVisible = false"><text>取消</text></view>
          <view class="form-btn confirm" @click="submitReviewForm"><text>确定</text></view>
        </view>
      </view>
    </view>

    <!-- 债权确认表单弹窗 -->
    <view v-if="confirmationFormVisible" class="form-overlay" @click="confirmationFormVisible = false">
      <view class="form-modal" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ confirmationFormData.id ? '编辑债权确认' : '新增债权确认' }}</text>
          <view class="form-close" @click="confirmationFormVisible = false"><text class="form-close-icon">×</text></view>
        </view>
        <scroll-view class="form-body" scroll-y>
          <view class="form-group">
            <text class="form-label required">债权人名称</text>
            <input v-model="confirmationFormData.creditorName" class="form-input" placeholder="请输入债权人名称" />
          </view>
          <view class="form-group">
            <text class="form-label">会议类型</text>
            <view class="form-type-select">
              <view v-for="m in meetingTypeOptions" :key="m.value" :class="['type-option', { 'type-active': confirmationFormData.meetingType === m.value }]" @click="confirmationFormData.meetingType = m.value">
                <text>{{ m.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">表决结果</text>
            <input v-model="confirmationFormData.voteResult" class="form-input" placeholder="请输入表决结果" />
          </view>
          <view class="form-group">
            <text class="form-label">是否有异议</text>
            <view class="form-type-select">
              <view :class="['type-option', { 'type-active': !confirmationFormData.hasObjection }]" @click="confirmationFormData.hasObjection = false"><text>否</text></view>
              <view :class="['type-option', { 'type-active': confirmationFormData.hasObjection }]" @click="confirmationFormData.hasObjection = true"><text>是</text></view>
            </view>
          </view>
          <view v-if="confirmationFormData.hasObjection" class="form-group">
            <text class="form-label">异议理由</text>
            <input v-model="confirmationFormData.objectionReason" class="form-input" placeholder="请输入异议理由" />
          </view>
          <view v-if="confirmationFormData.hasObjection" class="form-group">
            <text class="form-label">异议金额</text>
            <input v-model="confirmationFormData.objectionAmount" class="form-input" placeholder="请输入异议金额" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">最终确认金额</text>
            <input v-model="confirmationFormData.finalConfirmedAmount" class="form-input" placeholder="请输入最终确认金额" type="digit" />
          </view>
          <view class="form-group">
            <text class="form-label">确认状态</text>
            <view class="form-type-select">
              <view v-for="s in confirmationStatusOptions" :key="s.value" :class="['type-option', { 'type-active': confirmationFormData.confirmationStatus === s.value }]" @click="confirmationFormData.confirmationStatus = s.value">
                <text>{{ s.label }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="form-footer">
          <view class="form-btn cancel" @click="confirmationFormVisible = false"><text>取消</text></view>
          <view class="form-btn confirm" @click="submitConfirmationForm"><text>确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getClaimRegistrationList,
  getClaimReviewList,
  getClaimConfirmationList,
  getClaimStats,
  getCreditorList,
  createCreditor,
  createClaimRegistration,
  updateClaimRegistration,
  deleteClaimRegistration,
  createClaimReview,
  updateClaimReview,
  deleteClaimReview,
  createClaimConfirmation,
  updateClaimConfirmation,
  deleteClaimConfirmation,
  updateCreditor as apiUpdateCreditor,
  deleteCreditor as apiDeleteCreditor,
  receiveClaimMaterial as apiReceiveClaimMaterial,
  updateClaimStatus as apiUpdateClaimStatus,
  type ClaimRegistrationItem,
  type ClaimReviewItem,
  type ClaimConfirmationItem,
  type CreditorItem,
} from '@/api/case'
import dayjs from 'dayjs'

const tabs = ref([
  { key: 'registration', label: '债权申报', icon: '📋' },
  { key: 'review', label: '债权审查', icon: '🔍' },
  { key: 'confirmation', label: '债权确认', icon: '✅' },
  { key: 'creditor', label: '债权人', icon: '👤' },
  { key: 'stats', label: '数据统计', icon: '📊' },
])

const activeTab = ref('registration')
const caseId = ref('')
const caseNo = ref('')

const registrationCount = ref(0)
const reviewCount = ref(0)
const confirmationCount = ref(0)
const creditorCount = ref(0)

// 债权申报数据
const claimList = ref<ClaimRegistrationItem[]>([])
const registrationLoading = ref(false)
const registrationPage = ref(1)
const registrationHasMore = ref(false)
const registrationTotal = ref(0)
const stats = ref({ total: 0, confirmed: 0, pending: 0 })

// 债权审查数据
const reviewList = ref<ClaimReviewItem[]>([])
const reviewLoading = ref(false)
const reviewPage = ref(1)
const reviewHasMore = ref(false)
const reviewTotal = ref(0)
const reviewStats = ref({ pending: 0, inProgress: 0, completed: 0 })

// 债权确认数据
const confirmationList = ref<ClaimConfirmationItem[]>([])
const confirmationLoading = ref(false)
const confirmationPage = ref(1)
const confirmationHasMore = ref(false)
const confirmationTotal = ref(0)

// 债权人数据
const creditorList = ref<CreditorItem[]>([])
const creditorLoading = ref(false)
const creditorPage = ref(1)
const creditorHasMore = ref(false)
const creditorTotal = ref(0)
const creditorTypes = ref({ person: 0, company: 0 })

// 债权申报表单
const claimFormVisible = ref(false)
const claimFormData = ref({
  id: 0,
  claimNo: '',
  creditorName: '',
  creditorType: 'NATURAL_PERSON',
  claimType: '',
  principal: '',
  interest: '',
  penalty: '',
  otherLosses: '',
  claimNature: '',
  materialCompleteness: 'PENDING',
})

// 债权审查表单
const reviewFormVisible = ref(false)
const reviewFormData = ref({
  id: 0,
  claimRegistrationId: 0,
  creditorName: '',
  reviewRound: 1,
  reviewDate: '',
  reviewer: '',
  declaredPrincipal: '',
  declaredInterest: '',
  declaredPenalty: '',
  declaredOtherLosses: '',
  declaredTotalAmount: '',
  confirmedPrincipal: '',
  confirmedInterest: '',
  confirmedPenalty: '',
  confirmedOtherLosses: '',
  confirmedTotalAmount: '',
  unconfirmedPrincipal: '',
  unconfirmedInterest: '',
  unconfirmedPenalty: '',
  unconfirmedOtherLosses: '',
  unconfirmedTotalAmount: '',
  reviewConclusion: '',
  reviewSummary: '',
  reviewStatus: 'PENDING',
})

// 债权确认表单
const confirmationFormVisible = ref(false)
const confirmationFormData = ref({
  id: 0,
  claimRegistrationId: 0,
  creditorName: '',
  meetingType: 'FIRST',
  meetingDate: '',
  voteResult: '',
  hasObjection: false,
  objectionReason: '',
  objectionAmount: '',
  finalConfirmedAmount: '',
  finalConfirmationDate: '',
  confirmationStatus: 'PENDING',
})

// 债权人表单
const creditorFormVisible = ref(false)
const creditorFormData = ref({
  id: 0,
  creditorName: '',
  creditorType: 'NATURAL_PERSON',
  idNumber: '',
  contactPhone: '',
  contactEmail: '',
  legalRepresentative: '',
  registeredCapital: '',
  address: '',
  status: 'ENABLED',
})

const creditorTypeOptions = [
  { label: '个人', value: 'NATURAL_PERSON' },
  { label: '企业', value: 'LEGAL_ENTITY' },
  { label: '机构', value: 'OTHER_ORGANIZATION' },
]

const statusOptions = [
  { label: '正常', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' },
]

const materialOptions = ['COMPLETE', 'INCOMPLETE', 'PENDING']

const reviewStatusOptions = [
  { label: '待审查', value: 'PENDING' },
  { label: '审查中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
]

const meetingTypeOptions = [
  { label: '第一次债权人会议', value: 'FIRST' },
  { label: '第二次债权人会议', value: 'SECOND' },
  { label: '特别债权人会议', value: 'SPECIAL' },
]

const confirmationStatusOptions = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已驳回', value: 'REJECTED' },
]

// 债权统计数据
const claimStats = ref({
  totalClaims: 0,
  pendingClaims: 0,
  registeredClaims: 0,
  reviewingClaims: 0,
  confirmedClaims: 0,
  rejectedClaims: 0,
  totalDeclaredAmount: 0,
  totalConfirmedAmount: 0,
})
const statsLoading = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.id || ''

  if (caseId.value) {
    loadCaseNo()
    loadAllCounts()
    loadCurrentTab()
  }
})

onShow(() => {
  if (caseId.value) {
    loadCurrentTab()
  }
})

const loadCaseNo = async () => {
  try {
    const { getCaseDetail } = await import('@/api/case')
    const res = await getCaseDetail(caseId.value)
    caseNo.value = res.data.caseNumber || ''
  } catch (error) {
    // ignore
  }
}

const loadAllCounts = async () => {
  try {
    const [regRes, reviewRes, confirmRes, creditorRes] = await Promise.all([
      getClaimRegistrationList({ caseId: Number(caseId.value), pageNum: 1, pageSize: 1 }),
      getClaimReviewList(Number(caseId.value), { pageNum: 1, pageSize: 1 }),
      getClaimConfirmationList(Number(caseId.value), { pageNum: 1, pageSize: 1 }),
      getCreditorList({ caseId: Number(caseId.value), pageNum: 1, pageSize: 1 }),
    ])
    registrationCount.value = regRes.data?.total || 0
    reviewCount.value = reviewRes.data?.total || 0
    confirmationCount.value = confirmRes.data?.total || 0
    creditorCount.value = creditorRes.data?.total || 0
  } catch (error) {
    console.error('[loadAllCounts] Error:', error)
  }
}

const loadCurrentTab = () => {
  switch (activeTab.value) {
    case 'registration':
      loadRegistrationList(true)
      break
    case 'review':
      loadReviewList(true)
      break
    case 'confirmation':
      loadConfirmationList(true)
      break
    case 'creditor':
      loadCreditorList(true)
      break
    case 'stats':
      loadClaimStats()
      break
  }
}

const switchTab = (key: string) => {
  if (activeTab.value === key) return
  activeTab.value = key
  loadCurrentTab()
}

// 债权申报列表
const loadRegistrationList = async (reset = false) => {
  if (registrationLoading.value) return
  registrationLoading.value = true

  if (reset) {
    registrationPage.value = 1
    claimList.value = []
  }

  try {
    const res = await getClaimRegistrationList({
      caseId: Number(caseId.value),
      pageNum: registrationPage.value,
      pageSize: 20,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0

    if (reset) {
      claimList.value = list
    } else {
      claimList.value = [...claimList.value, ...list]
    }

    registrationTotal.value = total
    registrationHasMore.value = claimList.value.length < total

    registrationCount.value = total

    stats.value.total = total
    stats.value.confirmed = list.filter(c => c.registrationStatus === 'REGISTERED' || c.registrationStatus === 'CONFIRMED').length
    stats.value.pending = list.filter(c => c.registrationStatus === 'PENDING').length
  } catch (error) {
    console.error('[loadRegistrationList] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    registrationLoading.value = false
  }
}

const onRegistrationScrollToLower = () => {
  if (registrationHasMore.value && !registrationLoading.value) {
    registrationPage.value++
    loadRegistrationList()
  }
}

const handleReceiveMaterial = async (claim: ClaimRegistrationItem) => {
  uni.showModal({
    title: '确认接收',
    content: `确定接收 "${claim.creditorName}" 的债权申报材料？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiReceiveClaimMaterial(claim.id, {
            receiver: '当前用户',
            completeness: 'COMPLETE',
          })
          await apiUpdateClaimStatus(claim.id, 'REVIEWING')
          uni.showToast({ title: '接收成功', icon: 'success' })
          loadRegistrationList(true)
        } catch (error) {
          console.error('[handleReceiveMaterial] Error:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

// 债权审查列表
const loadReviewList = async (reset = false) => {
  if (reviewLoading.value) return
  reviewLoading.value = true

  if (reset) {
    reviewPage.value = 1
    reviewList.value = []
  }

  try {
    const res = await getClaimReviewList(Number(caseId.value), {
      pageNum: reviewPage.value,
      pageSize: 20,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0

    if (reset) {
      reviewList.value = list
    } else {
      reviewList.value = [...reviewList.value, ...list]
    }

    reviewTotal.value = total
    reviewHasMore.value = reviewList.value.length < total
    reviewCount.value = total

    reviewStats.value.pending = list.filter(r => r.reviewStatus === 'PENDING').length
    reviewStats.value.inProgress = list.filter(r => r.reviewStatus === 'IN_PROGRESS').length
    reviewStats.value.completed = list.filter(r => r.reviewStatus === 'COMPLETED').length
  } catch (error) {
    console.error('[loadReviewList] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    reviewLoading.value = false
  }
}

const onReviewScrollToLower = () => {
  if (reviewHasMore.value && !reviewLoading.value) {
    reviewPage.value++
    loadReviewList()
  }
}

const handleCompleteReview = async (item: ClaimReviewItem) => {
  uni.showModal({
    title: '完成审查',
    content: `确定完成对 "${item.creditorName}" 的债权审查？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiUpdateClaimStatus(item.claimRegistrationId, 'REVIEW_COMPLETED')
          uni.showToast({ title: '审查完成', icon: 'success' })
          loadReviewList(true)
        } catch (error) {
          console.error('[handleCompleteReview] Error:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

const handleRejectReview = async (item: ClaimReviewItem) => {
  uni.showModal({
    title: '驳回审查',
    content: '请输入驳回理由',
    editable: true,
    placeholderText: '驳回理由',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          const { rejectClaim } = await import('@/api/case')
          await rejectClaim(item.claimRegistrationId, res.content)
          uni.showToast({ title: '已驳回', icon: 'success' })
          loadReviewList(true)
        } catch (error) {
          console.error('[handleRejectReview] Error:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

// 债权确认列表
const loadConfirmationList = async (reset = false) => {
  if (confirmationLoading.value) return
  confirmationLoading.value = true

  if (reset) {
    confirmationPage.value = 1
    confirmationList.value = []
  }

  try {
    const res = await getClaimConfirmationList(Number(caseId.value), {
      pageNum: confirmationPage.value,
      pageSize: 20,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0

    if (reset) {
      confirmationList.value = list
    } else {
      confirmationList.value = [...confirmationList.value, ...list]
    }

    confirmationTotal.value = total
    confirmationHasMore.value = confirmationList.value.length < total
    confirmationCount.value = total
  } catch (error) {
    console.error('[loadConfirmationList] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    confirmationLoading.value = false
  }
}

const onConfirmationScrollToLower = () => {
  if (confirmationHasMore.value && !confirmationLoading.value) {
    confirmationPage.value++
    loadConfirmationList()
  }
}

// 债权人列表
const loadCreditorList = async (reset = false) => {
  if (creditorLoading.value) return
  creditorLoading.value = true

  if (reset) {
    creditorPage.value = 1
    creditorList.value = []
  }

  try {
    const res = await getCreditorList({
      caseId: Number(caseId.value),
      pageNum: creditorPage.value,
      pageSize: 20,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0

    if (reset) {
      creditorList.value = list
    } else {
      creditorList.value = [...creditorList.value, ...list]
    }

    creditorTotal.value = total
    creditorHasMore.value = creditorList.value.length < total
    creditorCount.value = total

    creditorTypes.value.person = list.filter(c => c.creditorType === 'NATURAL_PERSON').length
    creditorTypes.value.company = list.filter(c => c.creditorType === 'LEGAL_ENTITY' || c.creditorType === 'OTHER_ORGANIZATION').length
  } catch (error) {
    console.error('[loadCreditorList] Error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    creditorLoading.value = false
  }
}

const onCreditorScrollToLower = () => {
  if (creditorHasMore.value && !creditorLoading.value) {
    creditorPage.value++
    loadCreditorList()
  }
}

const handleCreditorDetail = (creditor: CreditorItem) => {
  uni.showModal({
    title: creditor.creditorName,
    content: `类型：${creditor.creditorType === 'NATURAL_PERSON' ? '个人' : creditor.creditorType === 'LEGAL_ENTITY' ? '企业' : '机构'}
电话：${creditor.contactPhone || '-'}
邮箱：${creditor.contactEmail || '-'}
证件：${creditor.idNumber || '-'}
地址：${creditor.address || '-'}`,
    showCancel: false,
  })
}

const getcreditorTypeClass = (creditorType: string) => {
  const map: Record<string, string> = {
    NATURAL_PERSON: 'creditor-type-person',
    LEGAL_ENTITY: 'creditor-type-company',
    OTHER_ORGANIZATION: 'creditor-type-other',
  }
  return map[creditorType] || ''
}

// 债权人 CRUD
const handleAddCreditor = () => {
  creditorFormData.value = {
    id: 0,
    creditorName: '',
    creditorType: 'NATURAL_PERSON',
    idNumber: '',
    contactPhone: '',
    contactEmail: '',
    legalRepresentative: '',
    registeredCapital: '',
    address: '',
    status: 'ENABLED',
  }
  creditorFormVisible.value = true
}

const handleEditCreditor = (creditor: CreditorItem) => {
  creditorFormData.value = {
    id: creditor.id,
    creditorName: creditor.creditorName || '',
    creditorType: creditor.creditorType || 'NATURAL_PERSON',
    idNumber: creditor.idNumber || '',
    contactPhone: creditor.contactPhone || '',
    contactEmail: creditor.contactEmail || '',
    legalRepresentative: creditor.legalRepresentative || '',
    registeredCapital: creditor.registeredCapital ? String(creditor.registeredCapital) : '',
    address: creditor.address || '',
    status: creditor.status || 'ENABLED',
  }
  creditorFormVisible.value = true
}

const closeCreditorForm = () => {
  creditorFormVisible.value = false
}

const submitCreditorForm = async () => {
  const data = creditorFormData.value
  const isPerson = data.creditorType === 'NATURAL_PERSON'

  if (!data.creditorName.trim()) {
    uni.showToast({ title: `${isPerson ? '姓名' : '名称'}不能为空`, icon: 'none' })
    return
  }

  try {
    if (data.id) {
      await apiUpdateCreditor(data.id, {
        creditorName: data.creditorName,
        creditorType: data.creditorType,
        idNumber: data.idNumber || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        address: data.address || undefined,
        legalRepresentative: isPerson ? undefined : data.legalRepresentative || undefined,
        registeredCapital: isPerson ? undefined : Number(data.registeredCapital) || undefined,
        status: data.status,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createCreditor({
        caseId: Number(caseId.value),
        creditorName: data.creditorName,
        creditorType: data.creditorType,
        idNumber: data.idNumber || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        address: data.address || undefined,
        legalRepresentative: isPerson ? undefined : data.legalRepresentative || undefined,
        registeredCapital: isPerson ? undefined : Number(data.registeredCapital) || undefined,
        status: data.status,
      })
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    creditorFormVisible.value = false
    loadCreditorList(true)
  } catch (error) {
    console.error('[submitCreditorForm] Error:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const handleDeleteCreditor = (creditor: CreditorItem) => {
  uni.showModal({
    title: '确认删除',
    content: `确定删除债权人 "${creditor.creditorName}"？此操作不可恢复。`,
    confirmColor: '#f5222d',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiDeleteCreditor(creditor.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadCreditorList(true)
          loadAllCounts()
        } catch (error) {
          console.error('[handleDeleteCreditor] Error:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

// ===== 债权申报 CRUD =====

const handleAddClaim = () => {
  claimFormData.value = {
    id: 0, claimNo: '', creditorName: '', creditorType: 'NATURAL_PERSON',
    claimType: '', principal: '', interest: '', penalty: '', otherLosses: '',
    claimNature: '', materialCompleteness: 'PENDING',
  }
  claimFormVisible.value = true
}

const handleEditClaim = (claim: ClaimRegistrationItem) => {
  claimFormData.value = {
    id: claim.id,
    claimNo: claim.claimNo || '',
    creditorName: claim.creditorName || '',
    creditorType: claim.creditorType || 'NATURAL_PERSON',
    claimType: claim.claimType || '',
    principal: String(claim.principal || ''),
    interest: String(claim.interest || ''),
    penalty: String(claim.penalty || ''),
    otherLosses: String(claim.otherLosses || ''),
    claimNature: claim.claimNature || '',
    materialCompleteness: claim.materialCompleteness || 'PENDING',
  }
  claimFormVisible.value = true
}

const handleDeleteClaim = (claim: ClaimRegistrationItem) => {
  uni.showModal({
    title: '确认删除', content: `确定删除 "${claim.creditorName}" 的债权申报？`, confirmColor: '#f5222d',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteClaimRegistration(claim.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadRegistrationList(true)
          loadAllCounts()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const submitClaimForm = async () => {
  const d = claimFormData.value
  if (!d.creditorName.trim()) { uni.showToast({ title: '债权人名称不能为空', icon: 'none' }); return }
  if (!d.claimType.trim()) { uni.showToast({ title: '债权种类不能为空', icon: 'none' }); return }
  try {
    if (d.id) {
      await updateClaimRegistration(d.id, {
        principal: Number(d.principal) || 0, interest: Number(d.interest) || 0,
        penalty: Number(d.penalty) || 0, otherLosses: Number(d.otherLosses) || 0,
        claimNature: d.claimNature, claimType: d.claimType,
        materialCompleteness: d.materialCompleteness,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createClaimRegistration({
        caseId: Number(caseId.value), creditorName: d.creditorName,
        creditorType: d.creditorType, claimType: d.claimType,
        principal: Number(d.principal) || 0, interest: Number(d.interest) || 0,
        penalty: Number(d.penalty) || 0, otherLosses: Number(d.otherLosses) || 0,
        claimNature: d.claimNature, registrationStatus: 'PENDING',
        materialCompleteness: d.materialCompleteness,
        registrationDate: dayjs().format('YYYY-MM-DD'),
      })
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    claimFormVisible.value = false
    loadRegistrationList(true)
    loadAllCounts()
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// ===== 债权审查 CRUD =====

const handleAddReview = () => {
  reviewFormData.value = {
    id: 0, claimRegistrationId: 0, creditorName: '', reviewRound: 1, reviewDate: '', reviewer: '',
    declaredPrincipal: '', declaredInterest: '', declaredPenalty: '', declaredOtherLosses: '', declaredTotalAmount: '',
    confirmedPrincipal: '', confirmedInterest: '', confirmedPenalty: '', confirmedOtherLosses: '', confirmedTotalAmount: '',
    unconfirmedPrincipal: '', unconfirmedInterest: '', unconfirmedPenalty: '', unconfirmedOtherLosses: '', unconfirmedTotalAmount: '',
    reviewConclusion: '', reviewSummary: '', reviewStatus: 'PENDING',
  }
  reviewFormVisible.value = true
}

const handleEditReview = (item: ClaimReviewItem) => {
  reviewFormData.value = {
    id: item.id, claimRegistrationId: item.claimRegistrationId,
    creditorName: item.creditorName || '', reviewRound: item.reviewRound || 1,
    reviewDate: item.reviewDate || '', reviewer: item.reviewer || '',
    declaredPrincipal: String(item.declaredPrincipal || ''), declaredInterest: String(item.declaredInterest || ''),
    declaredPenalty: String(item.declaredPenalty || ''), declaredOtherLosses: String(item.declaredOtherLosses || ''),
    declaredTotalAmount: String(item.declaredTotalAmount || ''),
    confirmedPrincipal: String(item.confirmedPrincipal || ''), confirmedInterest: String(item.confirmedInterest || ''),
    confirmedPenalty: String(item.confirmedPenalty || ''), confirmedOtherLosses: String(item.confirmedOtherLosses || ''),
    confirmedTotalAmount: String(item.confirmedTotalAmount || ''),
    unconfirmedPrincipal: String(item.unconfirmedPrincipal || ''), unconfirmedInterest: String(item.unconfirmedInterest || ''),
    unconfirmedPenalty: String(item.unconfirmedPenalty || ''), unconfirmedOtherLosses: String(item.unconfirmedOtherLosses || ''),
    unconfirmedTotalAmount: String(item.unconfirmedTotalAmount || ''),
    reviewConclusion: item.reviewConclusion || '', reviewSummary: item.reviewSummary || '', reviewStatus: item.reviewStatus || 'PENDING',
  }
  reviewFormVisible.value = true
}

const handleDeleteReview = (item: ClaimReviewItem) => {
  uni.showModal({
    title: '确认删除', content: `确定删除 "${item.creditorName}" 的债权审查？`, confirmColor: '#f5222d',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteClaimReview(item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadReviewList(true)
          loadAllCounts()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const submitReviewForm = async () => {
  const d = reviewFormData.value
  if (!d.creditorName.trim()) { uni.showToast({ title: '债权人名称不能为空', icon: 'none' }); return }
  try {
    if (d.id) {
      await updateClaimReview(d.id, {
        reviewDate: d.reviewDate || undefined, reviewRound: d.reviewRound || undefined, reviewer: d.reviewer || undefined,
        declaredPrincipal: Number(d.declaredPrincipal) || undefined, declaredInterest: Number(d.declaredInterest) || undefined,
        declaredPenalty: Number(d.declaredPenalty) || undefined, declaredOtherLosses: Number(d.declaredOtherLosses) || undefined,
        declaredTotalAmount: Number(d.declaredTotalAmount) || undefined,
        confirmedPrincipal: Number(d.confirmedPrincipal) || undefined, confirmedInterest: Number(d.confirmedInterest) || undefined,
        confirmedPenalty: Number(d.confirmedPenalty) || undefined, confirmedOtherLosses: Number(d.confirmedOtherLosses) || undefined,
        confirmedTotalAmount: Number(d.confirmedTotalAmount) || undefined,
        unconfirmedPrincipal: Number(d.unconfirmedPrincipal) || undefined, unconfirmedInterest: Number(d.unconfirmedInterest) || undefined,
        unconfirmedPenalty: Number(d.unconfirmedPenalty) || undefined, unconfirmedOtherLosses: Number(d.unconfirmedOtherLosses) || undefined,
        unconfirmedTotalAmount: Number(d.unconfirmedTotalAmount) || undefined,
        reviewConclusion: d.reviewConclusion || undefined, reviewSummary: d.reviewSummary || undefined,
        reviewStatus: d.reviewStatus || undefined,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createClaimReview({
        claimRegistrationId: d.claimRegistrationId || 1, caseId: Number(caseId.value),
        creditorName: d.creditorName, reviewRound: d.reviewRound || 1,
        reviewDate: d.reviewDate || dayjs().format('YYYY-MM-DD'), reviewer: d.reviewer || '',
        declaredPrincipal: Number(d.declaredPrincipal) || 0, declaredInterest: Number(d.declaredInterest) || 0,
        declaredPenalty: Number(d.declaredPenalty) || 0, declaredOtherLosses: Number(d.declaredOtherLosses) || 0,
        declaredTotalAmount: Number(d.declaredTotalAmount) || 0,
        confirmedPrincipal: Number(d.confirmedPrincipal) || 0, confirmedInterest: Number(d.confirmedInterest) || 0,
        confirmedPenalty: Number(d.confirmedPenalty) || 0, confirmedOtherLosses: Number(d.confirmedOtherLosses) || 0,
        confirmedTotalAmount: Number(d.confirmedTotalAmount) || 0,
        unconfirmedPrincipal: Number(d.unconfirmedPrincipal) || 0, unconfirmedInterest: Number(d.unconfirmedInterest) || 0,
        unconfirmedPenalty: Number(d.unconfirmedPenalty) || 0, unconfirmedOtherLosses: Number(d.unconfirmedOtherLosses) || 0,
        unconfirmedTotalAmount: Number(d.unconfirmedTotalAmount) || 0,
        reviewConclusion: d.reviewConclusion || '', reviewSummary: d.reviewSummary || '',
        reviewStatus: d.reviewStatus || 'PENDING',
      })
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    reviewFormVisible.value = false
    loadReviewList(true)
    loadAllCounts()
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// ===== 债权确认 CRUD =====

const handleAddConfirmation = () => {
  confirmationFormData.value = {
    id: 0, claimRegistrationId: 0, creditorName: '', meetingType: 'FIRST',
    meetingDate: '', voteResult: '', hasObjection: false, objectionReason: '',
    objectionAmount: '', finalConfirmedAmount: '', finalConfirmationDate: '',
    confirmationStatus: 'PENDING',
  }
  confirmationFormVisible.value = true
}

const handleEditConfirmation = (item: ClaimConfirmationItem) => {
  confirmationFormData.value = {
    id: item.id, claimRegistrationId: item.claimRegistrationId,
    creditorName: item.creditorName || '', meetingType: item.meetingType || 'FIRST',
    meetingDate: item.meetingDate || '', voteResult: item.voteResult || '',
    hasObjection: item.hasObjection || false, objectionReason: item.objectionReason || '',
    objectionAmount: String(item.objectionAmount || ''),
    finalConfirmedAmount: String(item.finalConfirmedAmount || ''),
    finalConfirmationDate: item.finalConfirmationDate || '',
    confirmationStatus: item.confirmationStatus || 'PENDING',
  }
  confirmationFormVisible.value = true
}

const handleDeleteConfirmation = (item: ClaimConfirmationItem) => {
  uni.showModal({
    title: '确认删除', content: `确定删除 "${item.creditorName}" 的债权确认？`, confirmColor: '#f5222d',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteClaimConfirmation(item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadConfirmationList(true)
          loadAllCounts()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const submitConfirmationForm = async () => {
  const d = confirmationFormData.value
  if (!d.creditorName.trim()) { uni.showToast({ title: '债权人名称不能为空', icon: 'none' }); return }
  try {
    if (d.id) {
      await updateClaimConfirmation(d.id, {
        meetingType: d.meetingType || undefined, meetingDate: d.meetingDate || undefined,
        voteResult: d.voteResult || undefined, hasObjection: d.hasObjection || undefined,
        objectionReason: d.objectionReason || undefined, objectionAmount: Number(d.objectionAmount) || undefined,
        finalConfirmedAmount: Number(d.finalConfirmedAmount) || undefined,
        finalConfirmationDate: d.finalConfirmationDate || undefined,
        confirmationStatus: d.confirmationStatus || undefined,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await createClaimConfirmation({
        claimRegistrationId: d.claimRegistrationId || 1, caseId: Number(caseId.value),
        creditorName: d.creditorName, meetingType: d.meetingType,
        meetingDate: d.meetingDate || dayjs().format('YYYY-MM-DD'), voteResult: d.voteResult || '',
        hasObjection: d.hasObjection, objectionReason: d.hasObjection ? d.objectionReason : undefined,
        objectionAmount: d.hasObjection ? Number(d.objectionAmount) || undefined : undefined,
        finalConfirmedAmount: Number(d.finalConfirmedAmount) || 0,
        finalConfirmationDate: d.finalConfirmationDate || dayjs().format('YYYY-MM-DD'),
        confirmationStatus: d.confirmationStatus || 'PENDING',
      })
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    confirmationFormVisible.value = false
    loadConfirmationList(true)
    loadAllCounts()
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 债权统计
const loadClaimStats = async () => {
  if (statsLoading.value) return
  statsLoading.value = true

  try {
    const res = await getClaimStats(Number(caseId.value))
    const data = res.data
    if (data) {
      claimStats.value = {
        totalClaims: data.totalClaims || 0,
        pendingClaims: data.pendingClaims || 0,
        registeredClaims: data.registeredClaims || 0,
        reviewingClaims: data.reviewingClaims || 0,
        confirmedClaims: data.confirmedClaims || 0,
        rejectedClaims: data.rejectedClaims || 0,
        totalDeclaredAmount: data.totalDeclaredAmount || 0,
        totalConfirmedAmount: data.totalConfirmedAmount || 0,
      }
    }
  } catch (error) {
    console.error('[loadClaimStats] Error:', error)
  } finally {
    statsLoading.value = false
  }
}

// 工具函数
const getRegistrationStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待处理',
    REVIEWING: '审查中',
    REVIEW_COMPLETED: '审查完成',
    CONFIRMING: '确认中',
    CONFIRMED: '已确认',
    REGISTERED: '已登记',
    REJECTED: '已驳回',
  }
  return map[status] || '未知'
}

const getRegistrationStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    REVIEWING: 'status-reviewing',
    REVIEW_COMPLETED: 'status-completed',
    CONFIRMED: 'status-completed',
    REGISTERED: 'status-registered',
    REJECTED: 'status-rejected',
  }
  return map[status] || ''
}

const getMaterialCompletenessText = (completeness: string) => {
  const map: Record<string, string> = {
    COMPLETE: '完整',
    INCOMPLETE: '不完整',
    PENDING: '待补充',
  }
  return map[completeness] || '未知'
}

const getReviewStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待审查',
    IN_PROGRESS: '审查中',
    COMPLETED: '已完成',
    SUPPLEMENT: '待补充',
  }
  return map[status] || status
}

const getReviewStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    IN_PROGRESS: 'status-reviewing',
    COMPLETED: 'status-completed',
    SUPPLEMENT: 'status-supplement',
  }
  return map[status] || ''
}

const getConfirmationStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    REJECTED: '已驳回',
  }
  return map[status] || status
}

const getConfirmationStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    CONFIRMED: 'status-completed',
    REJECTED: 'status-rejected',
  }
  return map[status] || ''
}

const getMeetingTypeText = (type: string) => {
  const map: Record<string, string> = {
    FIRST: '第一次债权人会议',
    SECOND: '第二次债权人会议',
    SPECIAL: '特别债权人会议',
  }
  return map[type] || type || '-'
}

const formatAmount = (amount?: number) => {
  if (!amount) return '¥ 0.00'
  return `¥ ${amount.toFixed(2)}`
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.claim-manage-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 40rpx;
  padding-bottom: 30rpx;

  .header-content {
    .title {
      font-size: 40rpx;
      font-weight: bold;
      color: #fff;
      display: block;
      margin-bottom: 12rpx;
    }

    .subtitle {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .tabs-wrapper {
    display: flex;
    margin-top: 30rpx;
    gap: 16rpx;

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 16rpx 12rpx;
      border-radius: 12rpx;
      background: rgba(255, 255, 255, 0.15);
      transition: all 0.3s ease;
      position: relative;

      .tab-icon {
        font-size: 28rpx;
      }

      .tab-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }

      .tab-badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        background: #ff4757;
        border-radius: 20rpx;
        padding: 2rpx 10rpx;
        min-width: 32rpx;
        text-align: center;

        .badge-text {
          font-size: 20rpx;
          color: #fff;
          font-weight: bold;
        }
      }

      &.tab-active {
        background: rgba(255, 255, 255, 0.95);

        .tab-text {
          color: #ee5a24;
          font-weight: bold;
        }
      }
    }
  }
}

.content {
  padding: 20rpx;
}

.tab-panel {
  min-height: calc(100vh - 300rpx);
}

.stats-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-around;

  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stats-number {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .stats-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.claim-scroll {
  height: calc(100vh - 480rpx);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.claim-list {
  padding-bottom: 20rpx;
}

.claim-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .claim-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .claim-left {
      flex: 1;

      .claim-no {
        font-size: 26rpx;
        color: #666;
        display: block;
        margin-bottom: 8rpx;
      }

      .claim-creditor {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .claim-status {
      font-size: 22rpx;
      padding: 6rpx 20rpx;
      border-radius: 8rpx;
      flex-shrink: 0;
      margin-left: 16rpx;

      &.status-pending {
        color: #faad14;
        background: rgba(250, 173, 20, 0.1);
      }

      &.status-reviewing {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
      }

      &.status-completed,
      &.status-registered {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }

      &.status-rejected {
        color: #f5222d;
        background: rgba(245, 34, 45, 0.1);
      }
    }
  }

  .claim-body {
    .claim-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;

      .row-label {
        font-size: 26rpx;
        color: #999;
        min-width: 160rpx;
      }

      .row-value {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        text-align: right;

        &.amount {
          color: #ff4d4f;
          font-weight: 500;
        }
      }
    }
  }

  .claim-actions {
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;

    .action-btn {
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: 500;

      &.receive {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
        color: #fff;
      }
    }
  }

  .action-btn-sm {
    flex: 1;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 500;

    &.edit {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: #fff;
    }

    &.delete {
      background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
      color: #fff;
    }
  }
}

.confirmation-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.load-more,
.load-more-end {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

// 债权审查
.review-stats {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-around;

  .review-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .review-stat-num {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .review-stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.review-list {
  padding-bottom: 20rpx;
}

.review-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .review-creditor {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .review-status-tag {
      font-size: 22rpx;
      padding: 6rpx 20rpx;
      border-radius: 8rpx;

      &.status-pending {
        color: #faad14;
        background: rgba(250, 173, 20, 0.1);
      }

      &.status-reviewing {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
      }

      &.status-completed {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }

      &.status-supplement {
        color: #fa541c;
        background: rgba(250, 84, 28, 0.1);
      }
    }
  }

  .review-body {
    .review-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;

      .section-label {
        font-size: 26rpx;
        color: #999;
        min-width: 160rpx;
      }

      .section-value {
        font-size: 26rpx;
        color: #333;
        text-align: right;
        flex: 1;

        &.amount {
          color: #ff4d4f;
          font-weight: 500;
        }

        &.confirmed-amount {
          color: #52c41a;
          font-weight: 500;
        }

        &.unconfirmed-amount {
          color: #999;
        }
      }
    }
  }

  .review-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;

    .review-action-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: 500;
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      color: #fff;

      &.reject {
        background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
      }
    }
  }
}

// 债权确认
.confirmation-list {
  padding-bottom: 20rpx;
}

.confirmation-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .confirmation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .confirmation-creditor {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .confirmation-status-tag {
      font-size: 22rpx;
      padding: 6rpx 20rpx;
      border-radius: 8rpx;

      &.status-pending {
        color: #faad14;
        background: rgba(250, 173, 20, 0.1);
      }

      &.status-completed {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }

      &.status-rejected {
        color: #f5222d;
        background: rgba(245, 34, 45, 0.1);
      }
    }
  }

  .confirmation-body {
    .confirmation-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14rpx 0;
      border-bottom: 1rpx dashed #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &.highlight {
        background: #f6ffed;
        margin: 12rpx -16rpx;
        padding: 14rpx 16rpx;
        border-radius: 8rpx;
        border-bottom: none;
      }

      .conf-label {
        font-size: 26rpx;
        color: #999;
        min-width: 160rpx;
      }

      .conf-value {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        text-align: right;

        &.amount {
          color: #52c41a;
          font-weight: bold;
          font-size: 28rpx;
        }
      }
    }
  }
}

// 数据统计
.stats-dashboard {
  .dashboard-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .section-header {
      margin-bottom: 24rpx;

      .section-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        padding-left: 16rpx;
        border-left: 6rpx solid #ee5a24;
      }
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;

      .status-card {
        background: #f5f7fa;
        border-radius: 12rpx;
        padding: 24rpx;
        text-align: center;

        .status-num {
          display: block;
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }

        .status-label {
          font-size: 22rpx;
          color: #999;
        }

        &.pending .status-num {
          color: #faad14;
        }

        &.registered .status-num {
          color: #1890ff;
        }

        &.reviewing .status-num {
          color: #722ed1;
        }

        &.confirmed .status-num {
          color: #52c41a;
        }

        &.rejected .status-num {
          color: #f5222d;
        }
      }
    }

    .amount-cards {
      display: flex;
      gap: 20rpx;

      .amount-card {
        flex: 1;
        border-radius: 12rpx;
        padding: 30rpx;
        text-align: center;

        .amount-label {
          display: block;
          font-size: 24rpx;
          margin-bottom: 12rpx;
        }

        .amount-value {
          display: block;
          font-size: 32rpx;
          font-weight: bold;
        }

        &.declared {
          background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);

          .amount-label {
            color: #fa8c16;
          }

          .amount-value {
            color: #fa8c16;
          }
        }

        &.confirmed-amount-card {
          background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);

          .amount-label {
            color: #52c41a;
          }

          .amount-value {
            color: #52c41a;
          }
        }
      }
    }
  }
}

// 债权人
.creditor-list {
  padding-bottom: 20rpx;
}

.creditor-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .creditor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .creditor-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
      flex: 1;

      .creditor-type-tag {
        font-size: 20rpx;
        padding: 4rpx 14rpx;
        border-radius: 6rpx;
        color: #fff;
        flex-shrink: 0;

        &.creditor-type-person {
          background: #1890ff;
        }

        &.creditor-type-company {
          background: #722ed1;
        }

        &.creditor-type-other {
          background: #fa541c;
        }
      }

      .creditor-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .creditor-status-tag {
      font-size: 22rpx;
      padding: 6rpx 20rpx;
      border-radius: 8rpx;
      flex-shrink: 0;

      &.creditor-status-enabled {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }

      &.creditor-status-disabled {
        color: #999;
        background: rgba(153, 153, 153, 0.1);
      }
    }
  }

  .creditor-body {
    .creditor-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1rpx dashed #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .creditor-row-label {
        font-size: 26rpx;
        color: #999;
        min-width: 160rpx;
      }

      .creditor-row-value {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        text-align: right;

        &.amount {
          color: #ff4d4f;
          font-weight: 500;
        }

        &.address {
          max-width: 50%;
          text-align: right;
          word-break: break-all;
        }
      }
    }
  }

  .creditor-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;

    .creditor-action-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: 500;
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: #fff;

      &.edit {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      }

      &.delete {
        background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
      }
    }
  }
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ee5a24 0%, #d4380d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(238, 90, 36, 0.4);
  z-index: 100;

  .fab-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }

  &.fab-btn-review {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.4);
  }

  &.fab-btn-confirmation {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.4);
  }
}

// 表单弹窗
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  .form-modal {
    position: relative;
    width: 100%;
    max-height: 85vh;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx 40rpx;
      border-bottom: 1rpx solid #f0f0f0;
      flex-shrink: 0;

      .form-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }

      .form-close {
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f5f5f5;
        flex-shrink: 0;

        .form-close-icon {
          font-size: 36rpx;
          color: #999;
          line-height: 1;
        }
      }
    }

    .form-body {
      flex: 1;
      padding: 20rpx 40rpx;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;

      .form-group {
        margin-bottom: 28rpx;

        .form-label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 12rpx;
          font-weight: 500;

          &.required::after {
            content: '*';
            color: #f5222d;
            margin-left: 4rpx;
          }
        }

        .form-input {
          width: 100%;
          height: 80rpx;
          padding: 0 24rpx;
          border: 2rpx solid #e8e8e8;
          border-radius: 12rpx;
          font-size: 28rpx;
          color: #333;
          background: #fafafa;
          box-sizing: border-box;

          &:focus {
            border-color: #ee5a24;
            background: #fff;
          }
        }

        .form-type-select {
          display: flex;
          gap: 20rpx;

          .type-option {
            flex: 1;
            height: 72rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12rpx;
            background: #f5f5f5;
            font-size: 26rpx;
            color: #666;
            border: 2rpx solid transparent;
            box-sizing: border-box;

            &.type-active {
              background: rgba(238, 90, 36, 0.1);
              color: #ee5a24;
              border-color: #ee5a24;
              font-weight: 500;
            }
          }
        }
      }
    }

    .form-footer {
      display: flex;
      gap: 24rpx;
      padding: 24rpx 40rpx;
      padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
      border-top: 1rpx solid #f0f0f0;
      flex-shrink: 0;

      .form-btn {
        flex: 1;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16rpx;
        font-size: 30rpx;
        font-weight: 500;

        &.cancel {
          background: #f5f5f5;
          color: #666;
        }

        &.confirm {
          background: linear-gradient(135deg, #ee5a24 0%, #d4380d 100%);
          color: #fff;
        }
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
