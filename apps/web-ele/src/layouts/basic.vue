<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, MdiGithub, UserRoundPen } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { approvalApi } from '#/api/core/approval';
import LoginForm from '#/views/_core/authentication/login.vue';
import NotificationBadge from '#/components/NotificationBadge.vue';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();

const menus = computed(() => [
  {
    handler: () => {
      router.push('/dashboard/profile');
    },
    icon: UserRoundPen,
    text: $t('page.user.profile'),
  },
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}
watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);

// 检查用户是否有管理员权限
const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
});

// 获取待审批总数量并更新菜单徽章
const loadPendingTotalCount = async () => {
  if (!isAdmin.value) return;
  
  try {
    const res = await approvalApi.getPendingTotalCount();
    const count = res?.count || 0;
    if (count > 0) {
      accessStore.updateMenuBadge('/approval/case', count > 99 ? '99+' : String(count), 'destructive');
    } else {
      accessStore.updateMenuBadge('/approval/case', '', '');
    }
  } catch (error) {
    console.error('获取待审批总数量失败:', error);
  }
};

// 定时刷新
let refreshInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  loadPendingTotalCount();
  // 每5分钟刷新一次
  refreshInterval = setInterval(loadPendingTotalCount, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="ann.vben@gmail.com"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <NotificationBadge />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
