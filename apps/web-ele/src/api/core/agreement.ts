/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { fileUploadRequestClient } from '#/api/request';

export const AGREEMENT_CURRENT_VERSION = 'v1.0';

export namespace AgreementApi {
  export interface AgreementRecord {
    id: number;
    userId: number;
    userAccount: string;
    agreementType: 'PRIVACY_POLICY' | 'USER_AGREEMENT';
    agreementVersion: string;
    agreed: boolean;
    agreementContent: string;
    ipAddress: string;
    agreeTime: string;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
  }

  export interface AgreeParams {
    agreementType: 'PRIVACY_POLICY' | 'USER_AGREEMENT';
    agreementVersion: string;
    agreed: boolean;
    agreementContent?: string;
  }

  export interface AgreeResult {
    code: number;
    message: string;
    data: AgreementRecord;
  }

  export interface HistoryResult {
    code: number;
    message: string;
    data: AgreementRecord[];
  }

  export interface LatestResult {
    code: number;
    message: string;
    data: AgreementRecord | null;
  }

  export interface CheckAllResult {
    code: number;
    message: string;
    data: {
      agreements: Record<string, boolean>;
      allAgreed: boolean;
      checkTime: string;
    };
  }

  export interface CheckResult {
    code: number;
    message: string;
    data: boolean;
  }
}

/**
 * 记录用户同意协议
 */
export async function agreeAgreementApi(data: AgreementApi.AgreeParams) {
  return fileUploadRequestClient.post<AgreementApi.AgreeResult>(
    '/api/v1/agreement/agree',
    data,
  );
}

/**
 * 查询协议同意历史
 */
export async function getAgreementHistoryApi() {
  return fileUploadRequestClient.get<AgreementApi.HistoryResult>(
    '/api/v1/agreement/history',
  );
}

/**
 * 查询最新同意记录
 */
export async function getLatestAgreementApi(agreementType: string) {
  return fileUploadRequestClient.get<AgreementApi.LatestResult>(
    '/api/v1/agreement/latest',
    { params: { agreementType } },
  );
}

/**
 * 检查全部协议同意状态
 */
export async function checkAllAgreementsApi() {
  return fileUploadRequestClient.get<AgreementApi.CheckAllResult>(
    '/api/v1/agreement/check',
  );
}

/**
 * 检查指定协议状态
 */
export async function checkAgreementApi(agreementType: string) {
  return fileUploadRequestClient.get<AgreementApi.CheckResult>(
    `/api/v1/agreement/check/${agreementType}`,
  );
}

/**
 * 版本级别检查
 */
export async function checkAgreementVersionApi(
  agreementType: string,
  agreementVersion: string,
) {
  return fileUploadRequestClient.get<AgreementApi.LatestResult>(
    '/api/v1/agreement/version-check',
    {
      params: { agreementType, agreementVersion },
    },
  );
}