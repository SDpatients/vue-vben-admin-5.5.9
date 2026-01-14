import { requestClient } from '#/api/request';

export namespace AssetApi {
  export interface PropertyQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyType?: string;
    propertyStatus?: string;
    managementStatus?: string;
  }

  export interface PropertyInfo {
    id: number;
    propertyNo: string;
    caseId: number;
    caseName: string;
    propertyType: string;
    propertyName: string;
    propertyDescription?: string;
    propertyLocation?: string;
    propertyAddress?: string;
    ownerName: string;
    ownerType?: string;
    ownershipCertificate?: string;
    certificateNo?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionMethod?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    encumbranceType?: string;
    encumbranceAmount?: number;
    encumbranceDate?: string;
    propertyStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface PropertyListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: PropertyInfo[];
    };
  }

  export interface CreatePropertyParams {
    caseId: number;
    caseName: string;
    propertyType: string;
    propertyName: string;
    propertyDescription?: string;
    propertyLocation?: string;
    propertyAddress?: string;
    ownerName: string;
    ownerType?: string;
    ownershipCertificate?: string;
    certificateNo?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionMethod?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    encumbranceType?: string;
    encumbranceAmount?: number;
    encumbranceDate?: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreatePropertyResponse {
    code: number;
    message: string;
    data: {
      propertyId: number;
      propertyNo: string;
    };
  }

  export interface UpdatePropertyParams {
    propertyId: number;
    [key: string]: any;
  }

  export interface UpdatePropertyResponse {
    code: number;
    message: string;
    data: null;
  }

  export interface DeletePropertyResponse {
    code: number;
    message: string;
    data: null;
  }

  export interface EstateQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyId?: number;
    estateType?: string;
    estateStatus?: string;
    managementStatus?: string;
  }

  export interface EstateInfo {
    id: number;
    estateNo: string;
    propertyId?: number;
    caseId: number;
    caseName: string;
    estateType: string;
    estateName: string;
    estateAddress: string;
    province?: string;
    city?: string;
    district?: string;
    street?: string;
    buildingNo?: string;
    unitNo?: string;
    floor?: string;
    roomNo?: string;
    landUseType?: string;
    landArea?: number;
    buildingArea?: number;
    usableArea?: number;
    constructionArea?: number;
    buildingStructure?: string;
    buildingYear?: number;
    floorsAboveGround?: number;
    floorsBelowGround?: number;
    ownershipType?: string;
    landCertificateNo?: string;
    propertyCertificateNo?: string;
    certificateDate?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    estateStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface EstateListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: EstateInfo[];
    };
  }

  export interface CreateEstateParams {
    caseId: number;
    caseName: string;
    estateType: string;
    estateName: string;
    estateAddress: string;
    province?: string;
    city?: string;
    district?: string;
    street?: string;
    buildingNo?: string;
    unitNo?: string;
    floor?: string;
    roomNo?: string;
    landUseType?: string;
    landArea?: number;
    buildingArea?: number;
    usableArea?: number;
    constructionArea?: number;
    buildingStructure?: string;
    buildingYear?: number;
    floorsAboveGround?: number;
    floorsBelowGround?: number;
    ownershipType?: string;
    landCertificateNo?: string;
    propertyCertificateNo?: string;
    certificateDate?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreateEstateResponse {
    code: number;
    message: string;
    data: {
      estateId: number;
      estateNo: string;
    };
  }

  export interface VehicleQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyId?: number;
    vehicleType?: string;
    vehicleStatus?: string;
    managementStatus?: string;
  }

  export interface VehicleInfo {
    id: number;
    vehicleNo: string;
    propertyId?: number;
    caseId: number;
    caseName: string;
    vehicleType: string;
    vehicleName: string;
    vehicleDescription?: string;
    licensePlate: string;
    vin?: string;
    engineNo?: string;
    brand?: string;
    model?: string;
    color?: string;
    manufactureDate?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    mileage?: number;
    fuelType?: string;
    displacement?: number;
    seatingCapacity?: number;
    loadCapacity?: number;
    isEncumbered?: boolean;
    vehicleStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface VehicleListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: VehicleInfo[];
    };
  }

  export interface CreateVehicleParams {
    caseId: number;
    caseName: string;
    vehicleType: string;
    vehicleName: string;
    vehicleDescription?: string;
    licensePlate: string;
    vin?: string;
    engineNo?: string;
    brand?: string;
    model?: string;
    color?: string;
    manufactureDate?: string;
    registrationDate?: string;
    acquisitionDate?: string;
    acquisitionCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    mileage?: number;
    fuelType?: string;
    displacement?: number;
    seatingCapacity?: number;
    loadCapacity?: number;
    isEncumbered?: boolean;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreateVehicleResponse {
    code: number;
    message: string;
    data: {
      vehicleId: number;
      vehicleNo: string;
    };
  }

  export interface EquipmentQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyId?: number;
    equipmentType?: string;
    equipmentStatus?: string;
    managementStatus?: string;
  }

  export interface EquipmentInfo {
    id: number;
    equipmentNo: string;
    propertyId?: number;
    caseId: number;
    caseName: string;
    equipmentType: string;
    equipmentName: string;
    equipmentDescription?: string;
    equipmentModel?: string;
    equipmentSpec?: string;
    brand?: string;
    manufacturer?: string;
    manufactureDate?: string;
    purchaseDate?: string;
    purchaseCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    quantity: number;
    unit: string;
    condition: string;
    location?: string;
    isEncumbered?: boolean;
    equipmentStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface EquipmentListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: EquipmentInfo[];
    };
  }

  export interface CreateEquipmentParams {
    caseId: number;
    caseName: string;
    equipmentType: string;
    equipmentName: string;
    equipmentDescription?: string;
    equipmentModel?: string;
    equipmentSpec?: string;
    brand?: string;
    manufacturer?: string;
    manufactureDate?: string;
    purchaseDate?: string;
    purchaseCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    quantity?: number;
    unit?: string;
    condition?: string;
    location?: string;
    isEncumbered?: boolean;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreateEquipmentResponse {
    code: number;
    message: string;
    data: {
      equipmentId: number;
      equipmentNo: string;
    };
  }

  export interface InventoryQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyId?: number;
    inventoryType?: string;
    inventoryStatus?: string;
    managementStatus?: string;
  }

  export interface InventoryInfo {
    id: number;
    inventoryNo: string;
    propertyId?: number;
    caseId: number;
    caseName: string;
    inventoryType: string;
    inventoryName: string;
    inventoryDescription?: string;
    category?: string;
    specification?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    currentQuantity?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    storageLocation?: string;
    condition: string;
    isEncumbered?: boolean;
    inventoryStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface InventoryListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: InventoryInfo[];
    };
  }

  export interface CreateInventoryParams {
    caseId: number;
    caseName: string;
    inventoryType: string;
    inventoryName: string;
    inventoryDescription?: string;
    category?: string;
    specification?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    currentQuantity?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    storageLocation?: string;
    condition?: string;
    isEncumbered?: boolean;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreateInventoryResponse {
    code: number;
    message: string;
    data: {
      inventoryId: number;
      inventoryNo: string;
    };
  }

  export interface IntellectualPropertyQueryParams {
    pageNum?: number;
    pageSize?: number;
    caseId?: number;
    propertyId?: number;
    ipType?: string;
    ipStatus?: string;
    managementStatus?: string;
  }

  export interface IntellectualPropertyInfo {
    id: number;
    ipNo: string;
    propertyId?: number;
    caseId: number;
    caseName: string;
    ipType: string;
    ipName: string;
    ipDescription?: string;
    registrationNo?: string;
    registrationDate?: string;
    registrationAuthority?: string;
    expiryDate?: string;
    registrationCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    ipStatus: string;
    managementStatus: string;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
    createTime: string;
    updateTime?: string;
  }

  export interface IntellectualPropertyListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: IntellectualPropertyInfo[];
    };
  }

  export interface CreateIntellectualPropertyParams {
    caseId: number;
    caseName: string;
    ipType: string;
    ipName: string;
    ipDescription?: string;
    registrationNo?: string;
    registrationDate?: string;
    registrationAuthority?: string;
    expiryDate?: string;
    registrationCost?: number;
    currentValue?: number;
    valuationDate?: string;
    valuationMethod?: string;
    valuationInstitution?: string;
    valuationReport?: string;
    isEncumbered?: boolean;
    custodian?: string;
    custodianContact?: string;
    insuranceStatus?: string;
    insuranceCompany?: string;
    insurancePolicyNo?: string;
    insuranceAmount?: number;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    attachments?: string;
    remarks?: string;
  }

  export interface CreateIntellectualPropertyResponse {
    code: number;
    message: string;
    data: {
      ipId: number;
      ipNo: string;
    };
  }
}

export async function getPropertyListApi(
  params: AssetApi.PropertyQueryParams,
) {
  return requestClient.get<AssetApi.PropertyListResponse>('/api/v1/property/list', {
    params,
  });
}

export async function getPropertyDetailApi(propertyId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.PropertyInfo }>(
    `/api/v1/property/${propertyId}`,
  );
}

export async function createPropertyApi(
  data: AssetApi.CreatePropertyParams,
) {
  return requestClient.post<AssetApi.CreatePropertyResponse>(
    '/api/v1/property',
    data,
  );
}

export async function updatePropertyApi(
  propertyId: number,
  data: Partial<AssetApi.CreatePropertyParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/property/${propertyId}`,
    data,
  );
}

export async function deletePropertyApi(propertyId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/property/${propertyId}`,
  );
}

export async function getEstateListApi(
  params: AssetApi.EstateQueryParams,
) {
  return requestClient.get<AssetApi.EstateListResponse>('/api/v1/real-estate/list', {
    params,
  });
}

export async function getEstateDetailApi(estateId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.EstateInfo }>(
    `/api/v1/real-estate/${estateId}`,
  );
}

export async function createEstateApi(
  data: AssetApi.CreateEstateParams,
) {
  return requestClient.post<AssetApi.CreateEstateResponse>(
    '/api/v1/real-estate',
    data,
  );
}

export async function updateEstateApi(
  estateId: number,
  data: Partial<AssetApi.CreateEstateParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/real-estate/${estateId}`,
    data,
  );
}

export async function deleteEstateApi(estateId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/real-estate/${estateId}`,
  );
}

export async function getVehicleListApi(
  params: AssetApi.VehicleQueryParams,
) {
  return requestClient.get<AssetApi.VehicleListResponse>('/api/v1/vehicle/list', {
    params,
  });
}

export async function getVehicleDetailApi(vehicleId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.VehicleInfo }>(
    `/api/v1/vehicle/${vehicleId}`,
  );
}

export async function createVehicleApi(
  data: AssetApi.CreateVehicleParams,
) {
  return requestClient.post<AssetApi.CreateVehicleResponse>(
    '/api/v1/vehicle',
    data,
  );
}

export async function updateVehicleApi(
  vehicleId: number,
  data: Partial<AssetApi.CreateVehicleParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/vehicle/${vehicleId}`,
    data,
  );
}

export async function deleteVehicleApi(vehicleId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/vehicle/${vehicleId}`,
  );
}

export async function getEquipmentListApi(
  params: AssetApi.EquipmentQueryParams,
) {
  return requestClient.get<AssetApi.EquipmentListResponse>('/api/v1/equipment/list', {
    params,
  });
}

export async function getEquipmentDetailApi(equipmentId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.EquipmentInfo }>(
    `/api/v1/equipment/${equipmentId}`,
  );
}

export async function createEquipmentApi(
  data: AssetApi.CreateEquipmentParams,
) {
  return requestClient.post<AssetApi.CreateEquipmentResponse>(
    '/api/v1/equipment',
    data,
  );
}

export async function updateEquipmentApi(
  equipmentId: number,
  data: Partial<AssetApi.CreateEquipmentParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/equipment/${equipmentId}`,
    data,
  );
}

export async function deleteEquipmentApi(equipmentId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/equipment/${equipmentId}`,
  );
}

export async function getInventoryListApi(
  params: AssetApi.InventoryQueryParams,
) {
  return requestClient.get<AssetApi.InventoryListResponse>('/api/v1/inventory/list', {
    params,
  });
}

export async function getInventoryDetailApi(inventoryId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.InventoryInfo }>(
    `/api/v1/inventory/${inventoryId}`,
  );
}

export async function createInventoryApi(
  data: AssetApi.CreateInventoryParams,
) {
  return requestClient.post<AssetApi.CreateInventoryResponse>(
    '/api/v1/inventory',
    data,
  );
}

export async function updateInventoryApi(
  inventoryId: number,
  data: Partial<AssetApi.CreateInventoryParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/inventory/${inventoryId}`,
    data,
  );
}

export async function deleteInventoryApi(inventoryId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/inventory/${inventoryId}`,
  );
}

export async function getIntellectualPropertyListApi(
  params: AssetApi.IntellectualPropertyQueryParams,
) {
  return requestClient.get<AssetApi.IntellectualPropertyListResponse>(
    '/api/v1/intellectual-property/list',
    { params },
  );
}

export async function getIntellectualPropertyDetailApi(ipId: number) {
  return requestClient.get<{ code: number; message: string; data: AssetApi.IntellectualPropertyInfo }>(
    `/api/v1/intellectual-property/${ipId}`,
  );
}

export async function createIntellectualPropertyApi(
  data: AssetApi.CreateIntellectualPropertyParams,
) {
  return requestClient.post<AssetApi.CreateIntellectualPropertyResponse>(
    '/api/v1/intellectual-property',
    data,
  );
}

export async function updateIntellectualPropertyApi(
  ipId: number,
  data: Partial<AssetApi.CreateIntellectualPropertyParams>,
) {
  return requestClient.put<AssetApi.UpdatePropertyResponse>(
    `/api/v1/intellectual-property/${ipId}`,
    data,
  );
}

export async function deleteIntellectualPropertyApi(ipId: number) {
  return requestClient.delete<AssetApi.DeletePropertyResponse>(
    `/api/v1/intellectual-property/${ipId}`,
  );
}
