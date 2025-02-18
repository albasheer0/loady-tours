<template>
  <v-app>
    <v-app-bar>
      <v-container class="d-flex align-center">
        <v-app-bar-title>Tour Management</v-app-bar-title>

        <v-tabs
          v-model="activeTab"
          align-tabs="center"
        >
          <v-tab
            v-for="item in menuItems"
            :key="item.path"
            :value="item.path"
            :to="item.path"
          >
            {{ item.title }}
          </v-tab>
        </v-tabs>

        <ThemeSwitcher />
      </v-container>
    </v-app-bar>

    <v-main class="mt-3">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

const route = useRoute();

const menuItems = [
  { title: 'Drivers', path: '/drivers' },
  { title: 'Customers', path: '/customers' },
  { title: 'Tours', path: '/tours' },
];

const activeTab = computed(() => route.path);
</script>
