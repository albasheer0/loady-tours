import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import DataMap from '../DataMap.vue';
import type { Location } from '../types/models';

// Mock maplibregl
const mockMap = {
  on: vi.fn(),
  remove: vi.fn(),
  addControl: vi.fn(),
  getSource: vi.fn(),
  removeLayer: vi.fn(),
  removeSource: vi.fn(),
  addSource: vi.fn(),
  addLayer: vi.fn(),
};

const mockMarker = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn(() => mockMap),
    Marker: vi.fn(() => mockMarker),
    NavigationControl: vi.fn(),
  },
}));

describe('DataMap.vue', () => {
  const vuetify = createVuetify({ components });
  const mockLocation: Location = { 
    city: 'London',
    lat: 51.5074, 
    lng: -0.1278 
  };
  const mockItems = [
    {
      id: '1',
      type: 'driver' as const,
      location: mockLocation,
      status: 'available' as const,
    },
    {
      id: '2',
      type: 'tour' as const,
      locationFrom: mockLocation,
      locationTo: { 
        city: 'London',
        lat: 51.5075, 
        lng: -0.1279 
      },
      status: 'active' as const,
      customerId: 'c1',
      assignedDriverId: 'd1',
      shipmentDate: '2024-03-15',
    },
  ];

  const createWrapper = (props = {}) => {
    return mount(DataMap, {
      global: {
        plugins: [vuetify],
      },
      props: {
        items: mockItems,
        type: 'driver' as const,
        loading: false,
        ...props,
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize map with correct configuration', () => {
      const wrapper = createWrapper();
      expect(mockMap.on).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('should add navigation controls after map is loaded', async () => {
      const wrapper = createWrapper();
      
      // Simulate map load event
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      expect(mockMap.addControl).toHaveBeenCalled();
    });
  });

  describe('Markers', () => {
    it('should create markers for valid locations', async () => {
      const wrapper = createWrapper();
      
      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      expect(mockMarker.setLngLat).toHaveBeenCalled();
      expect(mockMarker.addTo).toHaveBeenCalled();
    });

    it('should update markers when items change', async () => {
      const wrapper = createWrapper();
      
      // Simulate map load first
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      const newItems = [
        {
          id: '3',
          type: 'driver' as const,
          location: mockLocation,
          status: 'available' as const,
        },
      ];

      await wrapper.setProps({ items: newItems });
      expect(mockMarker.remove).toHaveBeenCalled();
    });

    it('should remove markers when component is destroyed', () => {
      const wrapper = createWrapper();
      
      // Simulate map load first
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      wrapper.unmount();
      expect(mockMarker.remove).toHaveBeenCalled();
    });
  });

  describe('Route Lines', () => {
    it('should draw route lines for tour items', async () => {
      const wrapper = createWrapper({ type: 'tour' as const });
      
      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      expect(mockMap.addSource).toHaveBeenCalled();
      expect(mockMap.addLayer).toHaveBeenCalled();
    });

    it('should style routes based on tour status', async () => {
      const wrapper = createWrapper({ type: 'tour' as const });
      
      // Simulate map load
      const loadCallback = mockMap.on.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadCallback();

      expect(mockMap.addLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          paint: expect.objectContaining({
            'line-color': expect.any(String),
            'line-dasharray': expect.any(Array),
          }),
        })
      );
    });
  });

  describe('Loading State', () => {
    it('should show loading overlay when loading is true', () => {
      const wrapper = createWrapper({ loading: true });
      const loadingOverlay = wrapper.find('.map-overlay');
      expect(loadingOverlay.exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'v-progress-circular' }).exists()).toBe(true);
    });

    it('should hide loading overlay when loading is false', () => {
      const wrapper = createWrapper({ loading: false });
      const loadingOverlay = wrapper.find('.map-overlay');
      expect(loadingOverlay.exists()).toBe(false);
    });
  });
}); 