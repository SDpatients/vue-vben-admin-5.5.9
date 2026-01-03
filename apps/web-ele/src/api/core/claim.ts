import { requestClient8085 } from '../request';

declare namespace ClaimApi {
  interface ClaimQueryParams {
    caseId: string;
    page: number;
    size: number;
    token?: string;
    creditorName?: string;
    registrationStatus?: string;
  }

  interface ClaimInfo {
    id: string;
    caseId: string;
    caseName: string;
    debtor: string;
    account: string;
    creditorName: string;
    creditorType: string;
    creditCode: string;
    legalRepresentative: string;
    serviceAddress: string;
    agentName: string;
    agentPhone: string;
    agentIdCard: string;
    agentAddress: string;
    accountName: string;
    bankAccount: string;
    bankName: string;
    principal: string;
    interest: string;
    penalty: string;
    otherLosses: string;
    totalAmount: string;
    hasCourtJudgment: boolean;
    hasExecution: boolean;
    hasCollateral: boolean;
    claimNature: string;
    claimType: string;
    claimFacts: string;
    creditorCategory: string;
    claimNatureManager: string;
    claimIdentifier: string;
    evidenceList: string;
    evidenceMaterials: string;
    evidenceAttachments: any[];
    remarks: string;
    registrationStatus: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ClaimListResponse {
    data: {
      count: number;
      pages: number;
      records: ClaimInfo[];
    };
    status: string;
    error: string;
  }

  interface AddClaimRequest {
    caseId: string;
    caseName: string;
    debtor: string;
    account: string;
    creditorName: string;
    creditorType: string;
    creditCode: string;
    legalRepresentative: string;
    serviceAddress: string;
    agentName: string;
    agentPhone: string;
    agentIdCard: string;
    agentAddress: string;
    accountName: string;
    bankAccount: string;
    bankName: string;
    principal: string;
    interest: string;
    penalty: string;
    otherLosses: string;
    totalAmount: string;
    hasCourtJudgment: boolean;
    hasExecution: boolean;
    hasCollateral: boolean;
    claimNature: string;
    claimType: string;
    claimFacts: string;
    creditorCategory: string;
    claimNatureManager: string;
    claimIdentifier: string;
    evidenceList: string;
    evidenceMaterials: string;
    evidenceAttachments: any[];
    remarks: string;
    registrationStatus: string;
  }

  interface AddClaimResponse {
    status: string;
    error: string;
    data?: any;
  }

  interface BatchImportResponse {
    status: string;
    error: string;
    data?: {
      count: number;
      failedCount: number;
      successCount: number;
    };
  }
}

export async function getClaimsApi(
  caseId: string,
  page: number,
  size: number,
  creditorName?: string,
  registrationStatus?: string,
) {
  const params: any = {
    caseId,
    page,
    size,
  };
  if (creditorName) params.creditorName = creditorName;
  if (registrationStatus) params.registrationStatus = registrationStatus;

  return requestClient8085.get<ClaimApi.ClaimListResponse>(
    '/api/web/getClaims',
    { params },
  );
}

export async function addClaimApi(data: ClaimApi.AddClaimRequest) {
  return requestClient8085.post<ClaimApi.AddClaimResponse>(
    '/api/web/addClaim',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function batchImportClaimsApi(formData: FormData) {
  return requestClient8085.post<ClaimApi.BatchImportResponse>(
    '/api/web/batchImportClaims',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

export async function exportClaimsApi(caseId: string) {
  return requestClient8085.get(`/api/web/exportClaims/${caseId}`, {
    responseType: 'blob',
  });
}

export async function getClaimDetailApi(claimId: string) {
  return requestClient8085.get<{
    data: ClaimApi.ClaimInfo;
    error: string;
    status: string;
  }>(`/api/web/getClaimDetail/${claimId}`);
}

export async function updateClaimApi(
  claimId: string,
  data: Partial<ClaimApi.AddClaimRequest>,
) {
  return requestClient8085.post<ClaimApi.AddClaimResponse>(
    `/api/web/updateClaim/${claimId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function deleteClaimApi(claimId: string) {
  return requestClient8085.post<{ error: string; status: string }>(
    `/api/web/deleteClaim/${claimId}`,
    {},
  );
}

export type { ClaimApi };
