/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import http from './request'

export const AGREEMENT_TYPES = {
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  USER_AGREEMENT: 'USER_AGREEMENT',
} as const

export interface AgreeRecordParams {
  agreementType: string
  agreementVersion: string
  agreed: boolean
  agreementContent?: string
}

export interface AgreementRecord {
  id: number
  userId: number
  userAccount: string
  agreementType: string
  agreementVersion: string
  agreed: boolean
  agreementContent: string
  ipAddress: string
  agreeTime: string
}

export interface AgreementCheckResult {
  agreements: Record<string, boolean>
  allAgreed: boolean
  checkTime: string
}

// 记录用户同意协议
export const agreeAgreement = (params: AgreeRecordParams) => {
  return http.post<AgreementRecord>('/agreement/agree', params)
}

// 查询协议同意历史
export const getAgreementHistory = () => {
  return http.get<AgreementRecord[]>('/agreement/history')
}

// 查询最新同意记录
export const getLatestAgreement = (agreementType: string) => {
  return http.get<AgreementRecord | null>('/agreement/latest', { agreementType })
}

// 检查全部协议同意状态
export const checkAllAgreements = () => {
  return http.get<AgreementCheckResult>('/agreement/check')
}

// 检查指定协议状态
export const checkAgreement = (agreementType: string) => {
  return http.get<boolean>(`/agreement/check/${agreementType}`)
}

// 版本级别检查
export const checkAgreementVersion = (agreementType: string, agreementVersion: string) => {
  return http.get<AgreementRecord | null>('/agreement/version-check', {
    agreementType,
    agreementVersion,
  })
}