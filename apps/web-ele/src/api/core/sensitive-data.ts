import { requestClient8080 } from '#/api/request';

export namespace SensitiveDataApi {
  export const DataTypeLabels: Record<string, string> = {
    USER_MOBILE: '用户手机号',
    USER_PHONE: '用户联系电话',
    CREDITOR_ID_NUMBER: '债权人身份证号',
    CREDITOR_CONTACT_PHONE: '债权人联系电话',
    BANK_ACCOUNT_NUMBER: '银行账号',
    AGENT_PHONE: '代理人联系电话',
    AGENT_ID_CARD: '代理人身份证',
    CREDITOR_BANK_ACCOUNT: '债权人银行账号',
  };

  export interface SensitiveDataViewRequest {
    dataType: string;
    id: number;
    password: string;
  }

  export interface SensitiveDataViewResponse {
    plainTextValue: string;
  }
}

export async function getSensitiveDataViewApi(
  params: SensitiveDataApi.SensitiveDataViewRequest,
): Promise<{ code: number; data?: SensitiveDataApi.SensitiveDataViewResponse; message?: string }> {
  return requestClient8080.post('/system/sensitive-data/view', params);
}