import { requestClient8080 } from '#/api/request';

export namespace DictionaryApi {
  export interface DictionaryCategory {
    id: number;
    categoryCode: string;
    categoryName: string;
    description: string;
    sortOrder: number;
    status: string;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
  }

  export interface DictionaryItem {
    id: number;
    categoryId: number;
    categoryCode: string;
    itemCode: string;
    itemName: string;
    itemValue: string;
    description: string;
    sortOrder: number;
    status: string;
    isDeleted: boolean;
    createTime: string;
    updateTime: string;
    createUserId: number;
    updateUserId: number;
  }

  export interface DictionaryQueryParams {
    pageNum?: number;
    pageSize?: number;
    keyword?: string;
    categoryCode?: string;
    categoryName?: string;
    status?: string;
  }

  export interface DictionaryItemQueryParams {
    pageNum?: number;
    pageSize?: number;
    categoryId?: number;
    categoryCode?: string;
    itemName?: string;
    status?: string;
  }

  export interface DictionaryListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: DictionaryCategory[];
      pageNum: number;
      pageSize: number;
    };
  }

  export interface DictionaryItemListResponse {
    code: number;
    message: string;
    data: {
      total: number;
      list: DictionaryItem[];
      pageNum: number;
      pageSize: number;
    };
  }

  export interface DictionaryCategoryDetailResponse {
    code: number;
    message: string;
    data: DictionaryCategory;
  }

  export interface DictionaryOperationResponse {
    code: number;
    message: string;
    data: any;
  }

  export interface CreateCategoryRequest {
    categoryCode: string;
    categoryName: string;
    description?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateCategoryRequest {
    categoryCode?: string;
    categoryName?: string;
    description?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateCategoryStatusRequest {
    status: string;
  }

  export interface CreateItemRequest {
    itemCode: string;
    itemName: string;
    itemValue: string;
    description?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateItemRequest {
    itemCode?: string;
    itemName?: string;
    itemValue?: string;
    description?: string;
    sortOrder?: number;
    status?: string;
  }

  export interface UpdateItemStatusRequest {
    status: string;
  }
}

export async function getDictionaryCategoryListApi(
  params: DictionaryApi.DictionaryQueryParams,
) {
  return requestClient8080.get<DictionaryApi.DictionaryListResponse>(
    '/dictionary/category/list',
    { params },
  );
}

export async function getDictionaryCategoryDetailApi(id: number | string) {
  return requestClient8080.get<DictionaryApi.DictionaryCategoryDetailResponse>(
    `/dictionary/category/${id}`,
  );
}

export async function getDictionaryCategoryByCodeApi(categoryCode: string) {
  return requestClient8080.get<DictionaryApi.DictionaryCategoryDetailResponse>(
    `/dictionary/category/code/${categoryCode}`,
  );
}

export async function addDictionaryCategoryApi(
  data: DictionaryApi.CreateCategoryRequest,
) {
  return requestClient8080.post<DictionaryApi.DictionaryOperationResponse>(
    '/dictionary/category',
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateDictionaryCategoryApi(
  id: number | string,
  data: DictionaryApi.UpdateCategoryRequest,
) {
  return requestClient8080.put<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/${id}`,
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateDictionaryCategoryStatusApi(
  id: number | string,
  data: DictionaryApi.UpdateCategoryStatusRequest,
) {
  return requestClient8080.put<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/${id}/status`,
    data,
  );
}

export async function deleteDictionaryCategoryApi(id: number | string) {
  return requestClient8080.delete<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/${id}`,
  );
}

export async function getDictionaryItemListApi(
  params: DictionaryApi.DictionaryItemQueryParams,
) {
  if (params.categoryId) {
    return requestClient8080.get<DictionaryApi.DictionaryItemListResponse>(
      `/dictionary/category/${params.categoryId}/items/list`,
      { params: { pageNum: params.pageNum, pageSize: params.pageSize, itemName: params.itemName, status: params.status } },
    );
  }
  return requestClient8080.get<DictionaryApi.DictionaryItemListResponse>(
    '/dictionary/category/0/items/list',
    { params },
  );
}

export async function getDictionaryAllItemsApi(categoryId: number | string) {
  return requestClient8080.get<DictionaryApi.DictionaryItemListResponse>(
    `/dictionary/category/${categoryId}/items`,
  );
}

export async function addDictionaryItemApi(
  categoryId: number | string,
  data: DictionaryApi.CreateItemRequest,
) {
  return requestClient8080.post<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/${categoryId}/items`,
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateDictionaryItemApi(
  id: number | string,
  data: DictionaryApi.UpdateItemRequest,
) {
  return requestClient8080.put<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/items/${id}`,
    data,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function updateDictionaryItemStatusApi(
  id: number | string,
  data: DictionaryApi.UpdateItemStatusRequest,
) {
  return requestClient8080.put<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/items/${id}/status`,
    data,
  );
}

export async function deleteDictionaryItemApi(id: number | string) {
  return requestClient8080.delete<DictionaryApi.DictionaryOperationResponse>(
    `/dictionary/category/items/${id}`,
  );
}
