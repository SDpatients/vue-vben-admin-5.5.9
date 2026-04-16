<script setup lang="ts">
import type { Component } from 'vue';

import type { ThemeModeType } from '@vben/types';

import { Sun } from '@vben/icons';
import { $t } from '@vben/locales';

defineOptions({
  name: 'PreferenceTheme',
});

const modelValue = defineModel<string>({ default: 'light' });

const THEME_PRESET: Array<{ icon: Component; name: ThemeModeType }> = [
  {
    icon: Sun,
    name: 'light',
  },
];

function activeClass(theme: string): string[] {
  return theme === modelValue.value ? ['outline-box-active'] : [];
}

function nameView(name: string) {
  switch (name) {
    case 'light': {
      return $t('preferences.theme.light');
    }
  }
}
</script>

<template>
  <div class="flex w-full flex-wrap justify-between">
    <template v-for="theme in THEME_PRESET" :key="theme.name">
      <div
        class="flex cursor-pointer flex-col"
        @click="modelValue = theme.name"
      >
        <div
          :class="activeClass(theme.name)"
          class="outline-box flex-center py-4"
        >
          <component :is="theme.icon" class="mx-9 size-5" />
        </div>
        <div class="text-muted-foreground mt-2 text-center text-xs">
          {{ nameView(theme.name) }}
        </div>
      </div>
    </template>
  </div>
</template>
