import { requestClient8080 } from '#/api/request';

export namespace StaffApi {
  export interface StaffInfo {
    id: number;
    administratorId: number;
    name: string;
    contactPhone: string;
    userId: number;
    status: string;
    createTime: string;
  }

  export interface StaffListResponse {
    code: number;
    message: string;
    data: StaffInfo[];
  }

  export interface CreateStaffRequest {
    userId: number;
  }

  export interface StaffOperationResponse {
    code: number;
    message: string;
    data?: {
      staffId?: number;
    };
  }

  export interface AvailableUser {
    id: number;
    username: string;
    realName: string;
    mobile: string;
    email: string;
  }

  export interface AvailableUsersResponse {
    code: number;
    message: string;
    data: AvailableUser[];
  }
}

export async function getStaffListApi(administratorId: number) {
  return requestClient8080.get<StaffApi.StaffListResponse>(
    `/administrator/${administratorId}/staff/list`,
  );
}

export async function getAvailableUsersApi(administratorId: number) {
  return requestClient8080.get<StaffApi.AvailableUsersResponse>(
    `/administrator/${administratorId}/staff/available-users`,
  );
}

export async function createStaffApi(
  administratorId: number,
  data: StaffApi.CreateStaffRequest,
) {
  return requestClient8080.post<StaffApi.StaffOperationResponse>(
    `/administrator/${administratorId}/staff`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function deleteStaffApi(administratorId: number, staffId: number) {
  return requestClient8080.delete<StaffApi.StaffOperationResponse>(
    `/administrator/${administratorId}/staff/${staffId}`,
  );
}
