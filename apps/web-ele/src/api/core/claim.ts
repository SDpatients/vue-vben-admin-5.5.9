import { requestClient8085 } from '../request';

declare namespace ClaimApi {
  interface ClaimQueryParams {
    caseId: string;
    page: number;
    size: number;
    creditorName?: string;
    registrationStatus?: string;
  }

  interface ClaimInfo {
    id: number;
    case_id: string;
    case_name: string;
    debtor: string;
    polizi_account: string;
    creditor_name: string;
    creditor_type: string;
    credit_code: string;
    legal_representative: string;
    service_address: string;
    agent_name: string;
    agent_phone: string;
    agent_id_card: string;
    agent_address: string;
    account_name: string;
    bank_account: string;
    bank_name: string;
    principal: number;
    interest: number;
    penalty: number;
    other_losses: number;
    total_amount: number;
    has_court_judgment: boolean;
    has_execution: boolean;
    has_collateral: boolean;
    claim_nature: string;
    claim_type: string;
    claim_facts: string;
    creditor_category: string;
    claim_nature_manager: string;
    claim_identifier: string;
    evidence_list: string;
    evidence_materials: string;
    evidence_attachments: string;
    remarks: string;
    registration_status: string;
    created_by: string;
    created_time: string;
    updated_by: string;
    updated_time: string;
  }

  interface ClaimListResponse {
    code: number;
    message: string;
    data: {
      count: number;
      pages: number;
      records: ClaimInfo[];
    };
  }

  interface AddClaimRequest {
    case_id: string;
    case_name: string;
    debtor: string;
    polizi_account: string;
    creditor_name: string;
    creditor_type: string;
    credit_code: string;
    legal_representative: string;
    service_address: string;
    agent_name: string;
    agent_phone: string;
    agent_id_card: string;
    agent_address: string;
    account_name: string;
    bank_account: string;
    bank_name: string;
    principal: number;
    interest: number;
    penalty: number;
    other_losses: number;
    total_amount: number;
    has_court_judgment: boolean;
    has_execution: boolean;
    has_collateral: boolean;
    claim_nature: string;
    claim_type: string;
    claim_facts: string;
    creditor_category: string;
    claim_nature_manager: string;
    claim_identifier: string;
    evidence_list: string;
    evidence_materials: string;
    evidence_attachments: string;
    remarks: string;
    registration_status: string;
    created_by: string;
  }

  interface AddClaimResponse {
    code: number;
    message: string;
    data?: {
      id: string;
    };
  }

  interface BatchImportResponse {
    code: number;
    message: string;
    data?: {
      count: number;
      failedCount: number;
      successCount: number;
    };
  }

  interface UpdateClaimRequest {
    case_name?: string;
    debtor?: string;
    creditor_name?: string;
    principal?: number;
    interest?: number;
    total_amount?: number;
    registration_status?: string;
    updated_by: string;
  }

  interface CommonResponse {
    code: number;
    message: string;
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

export async function getClaimDetailApi(claimId: number) {
  return requestClient8085.get<
    ClaimApi.CommonResponse & {
      data: ClaimApi.ClaimInfo;
    }
  >(`/api/web/getClaimDetail/${claimId}`);
}

export async function updateClaimApi(
  claimId: number,
  data: ClaimApi.UpdateClaimRequest,
) {
  return requestClient8085.post<ClaimApi.CommonResponse>(
    `/api/web/updateClaim/${claimId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function deleteClaimApi(claimId: number) {
  return requestClient8085.post<ClaimApi.CommonResponse>(
    `/api/web/deleteClaim/${claimId}`,
    {},
  );
}

export type { ClaimApi };
