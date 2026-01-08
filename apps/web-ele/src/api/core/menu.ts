import { requestClient } from '#/api/request';

export namespace MenuApi {
  /** 菜单信息 */
  export interface MenuInfo {
    menuId: number;
    parentId: number;
    menuName: string;
    path: string;
    component?: string;
    redirect?: string;
    name: string;
    icon?: string;
    sort: number;
    status: string;
    isHidden: boolean;
    isFrame: boolean;
    isCache: boolean;
    createTime: string;
    updateTime: string;
    children?: MenuInfo[];
  }

  /** 菜单列表响应 */
  export interface MenuListResponse {
    data: MenuInfo[];
    code: number;
    message: string;
  }

  /** 菜单响应 */
  export interface MenuResponse {
    code: number;
    message: string;
  }
}

/**
 * 获取菜单列表
 */
export async function getMenuListApi() {
  return requestClient.get<MenuApi.MenuListResponse>('/menus');
}

/**
 * 获取菜单树
 */
export async function getMenuTreeApi() {
  return requestClient.get<MenuApi.MenuListResponse>('/menus/tree');
}

/**
 * 获取路由菜单
 */
export async function getRouteMenuApi() {
  return requestClient.get<MenuApi.MenuListResponse>('/menus/routes');
}

/**
 * 新增菜单
 */
export async function addMenuApi() {
  return requestClient.post<MenuApi.MenuResponse>('/menus');
}

/**
 * 更新菜单
 */
export async function updateMenuApi() {
  return requestClient.put<MenuApi.MenuResponse>('/menus');
}

/**
 * 删除菜单
 */
export async function deleteMenuApi() {
  return requestClient.delete<MenuApi.MenuResponse>('/menus');
}
