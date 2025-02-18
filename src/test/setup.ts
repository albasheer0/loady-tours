import { config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { beforeAll, vi, afterEach } from 'vitest';
import { createPinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import type { Component } from 'vue';

// Setup Vuetify
const vuetify = createVuetify({
  components,
  directives,
});

// Global components setup
config.global.plugins = [vuetify, createPinia()];

// Mock maplibregl
vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      addControl: vi.fn(),
      getSource: vi.fn(),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
    })),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    NavigationControl: vi.fn(),
  },
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Export test utilities
export const createTestingPinia = () => createPinia();

export const createWrapper = (component: Component, options = {}) => {
  return mount(component, {
    global: {
      plugins: [vuetify, createTestingPinia()],
      ...options.global,
    },
    ...options,
  }) as VueWrapper<any>;
}; 