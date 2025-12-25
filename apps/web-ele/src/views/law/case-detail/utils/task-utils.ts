import type { CaseProcessApi } from '#/api/core/case-process';

export type TaskStatus = '未确认' | '完成' | '跳过';

export const getStatusType = (status: TaskStatus): 'success' | 'warning' | 'info' => {
  switch (status) {
    case '完成': {
      return 'success';
    }
    case '跳过': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

export const getStatusClass = (status: TaskStatus): string => {
  switch (status) {
    case '完成': {
      return 'status-completed';
    }
    case '跳过': {
      return 'status-skipped';
    }
    default: {
      return 'status-pending';
    }
  }
};

export const calculateTaskStatus = (
  apiResponse: any,
): TaskStatus => {
  if (
    apiResponse &&
    apiResponse.status === '1' &&
    apiResponse.data &&
    apiResponse.data.paras
  ) {
    const zt0Count = parseInt(apiResponse.data.paras.zt0_count || '0', 10);
    const zt1Count = parseInt(apiResponse.data.paras.zt1_count || '0', 10);
    const zt2Count = parseInt(apiResponse.data.paras.zt2_count || '0', 10);

    if (zt0Count === 0 && zt1Count > 0 && zt2Count === 0) {
      return '完成';
    }
    if (zt0Count === 0 && zt2Count > 0) {
      return '跳过';
    }
  }
  return '未确认';
};

export const formatDate = (date: any): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return undefined;
};

export const formatDateTime = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return new Date().toISOString();
};

export const getUserInfo = () => {
  const chatUserInfo = localStorage.getItem('chat_user_info');
  const userInfo = chatUserInfo ? JSON.parse(chatUserInfo) : {};
  return {
    uName: userInfo.uName || userInfo.U_USER || 'admin',
    userId: userInfo.userId || userInfo.U_ID || '',
  };
};

export const extractDataList = (apiResponse: any): Array<Record<string, any>> => {
  if (!apiResponse || apiResponse.status !== '1') {
    return [{}];
  }

  if (apiResponse.data && Array.isArray(apiResponse.data.records)) {
    return apiResponse.data.records;
  }
  if (Array.isArray(apiResponse.data)) {
    return apiResponse.data;
  }
  if (apiResponse.data) {
    return [apiResponse.data];
  }

  return [{}];
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
};

export const buildUpdateParams = (
  taskId: string,
  caseId: string,
  formData: Record<string, any>,
  operateType: string,
  status: '0' | '1' | '2',
) => {
  const userInfo = getUserInfo();
  const SEP_EDATE = formatDateTime(new Date());

  const params: Record<string, any> = {
    SEP_EUSER: userInfo.uName,
    SEP_EDATE,
    OperateType: operateType,
    SEP_LD: caseId,
    SEP_ID:
      formData?.SEP_ID ||
      formData?.sep_id ||
      caseId,
    ZT: status,
  };

  const fieldMappings: Record<string, string> = {
    TDFZR: 'TDFZR',
    ZHZCY: 'ZHZCY',
    CXZCY: 'CXZCY',
    CCGLZCY: 'CCGLZCY',
    ZQSHZCY: 'ZQSHZCY',
    LDRSZCY: 'LDRSZCY',
    ZZQLZCY: 'ZZQLZCY',
    JHLX: 'JHLX',
    JHNR: 'JHNR',
    KSRQ: 'KSRQ',
    JSRQ: 'JSRQ',
    FZR: 'FZR',
    ZHZT: 'ZHZT',
    GLMC: 'ZDMC',
    GLNR: 'ZDNR',
    FBRQ: 'SXRQ',
    YZLX: 'YZLX',
    YZBH: 'YZBH',
    YZYBLJ: 'YZYBLJ',
    BARQ: 'BARQ',
    YZMC: 'YZMC',
    CXLX: 'CXLX',
    CXNR: 'CXNR',
    ZHRQ: 'ZHRQ',
    GLRQ: 'GLRQ',
    CLRQ: 'CLRQ',
    CCJGRQ: 'CCJGRQ',
    TCRQ: 'TCRQ',
    HYRQ: 'HYRQ',
    SCRQ: 'SCRQ',
    Q RQ: 'QRQ',
    FSRQ: 'FSRQ',
    SHRQ: 'SHRQ',
    CJRQ: 'CJRQ',
    PGRQ: 'PGRQ',
    ZDRQ: 'ZDRQ',
    XGRQ: 'XGRQ',
  };

  Object.entries(formData || {}).forEach(([key, value]) => {
    if (value && fieldMappings[key]) {
      const mappedKey = fieldMappings[key];
      if (
        ['KSRQ', 'JSRQ', 'SXRQ', 'BARQ', 'ZHRQ', 'GLRQ', 'CLRQ', 'CCJGRQ', 'TCRQ', 'HYRQ', 'SCRQ', 'QRQ', 'FSRQ', 'SHRQ', 'CJRQ', 'PGRQ', 'ZDRQ', 'XGRQ'].includes(key)
      ) {
        params[mappedKey] = formatDate(value);
      } else {
        params[mappedKey] = value;
      }
    }
  });

  return params;
};

export const callUpdateApi = async (
  stage: number,
  params: Record<string, any>,
  updateApiUrls: Record<number, string>,
): Promise<any> => {
  const updateUrl = updateApiUrls[stage];
  if (!updateUrl) {
    throw new Error('未找到对应的更新接口');
  }

  const result = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return await result.json();
};
