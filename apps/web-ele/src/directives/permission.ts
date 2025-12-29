/**
 * 权限指令
 * 用于控制页面元素的显示/隐藏
 */

import type { Directive, DirectiveBinding } from 'vue';

import { useAccessStore } from '@vben/stores';

/**
 * 检查用户是否有指定权限
 * @param permission 权限码或权限码数组
 * @returns 是否有权限
 */
function checkPermission(permission: string | string[]): boolean {
  const accessStore = useAccessStore();
  const permissions = accessStore.accessCodes || [];

  if (Array.isArray(permission)) {
    return permission.some((perm) => permissions.includes(perm));
  }
  return permissions.includes(permission);
}

/**
 * 权限指令
 * 用法：
 * v-permission="'user:add'" - 单个权限
 * v-permission="['user:add', 'user:edit']" - 多个权限（满足其一即可）
 */
const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;

    if (!value) {
      return;
    }

    if (!checkPermission(value)) {
      // 移除元素
      el.parentNode?.removeChild(el);
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value, oldValue } = binding;

    if (value === oldValue) {
      return;
    }

    if (!value) {
      return;
    }

    if (!checkPermission(value)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export default permissionDirective;

/**
 * 注册权限指令
 */
export function registerPermissionDirective(app: any) {
  app.directive('permission', permissionDirective);
}
