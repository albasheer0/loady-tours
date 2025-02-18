<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        v-bind="props"
        class="ml-2"
      >
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in themeOptions"
        :key="i"
        :value="item.value"
        @click="appStore.updateTheme(item.value)"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon" class="mr-2"></v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const themeOptions = [
  { title: 'Light', value: 'light', icon: 'mdi-weather-sunny' },
  { title: 'Dark', value: 'dark', icon: 'mdi-weather-night' },
  { title: 'System', value: 'system', icon: 'mdi-desktop-tower-monitor' },
] as const;

const themeIcon = computed(() => {
  switch (appStore.themeMode) {
    case 'light':
      return 'mdi-weather-sunny';
    case 'dark':
      return 'mdi-weather-night';
    default:
      return 'mdi-desktop-tower-monitor';
  }
});
</script> 