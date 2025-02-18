import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDriverStore } from '../driver';

describe('Driver Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const store = useDriverStore();
      expect(store.drivers).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should update driver list', () => {
      const store = useDriverStore();
      const mockDrivers = [
        { id: '1', name: 'John Doe', status: 'available' },
        { id: '2', name: 'Jane Smith', status: 'busy' },
      ];
      
      store.$patch({ drivers: mockDrivers });
      expect(store.drivers).toEqual(mockDrivers);
    });

    it('should handle loading states', () => {
      const store = useDriverStore();
      
      store.$patch({ loading: true });
      expect(store.loading).toBe(true);
      
      store.$patch({ loading: false });
      expect(store.loading).toBe(false);
    });

    it('should handle error states', () => {
      const store = useDriverStore();
      const error = 'Failed to fetch drivers';
      
      store.$patch({ error });
      expect(store.error).toBe(error);
      
      store.$patch({ error: null });
      expect(store.error).toBe(null);
    });
  });

  describe('Getters', () => {
    it('should filter available drivers', () => {
      const store = useDriverStore();
      const mockDrivers = [
        { id: '1', name: 'John', status: 'available' },
        { id: '2', name: 'Jane', status: 'busy' },
        { id: '3', name: 'Bob', status: 'available' },
      ];
      
      store.$patch({ drivers: mockDrivers });
      const availableDrivers = store.drivers.filter(d => d.status === 'available');
      expect(availableDrivers.length).toBe(2);
      expect(availableDrivers.every(d => d.status === 'available')).toBe(true);
    });

    it('should calculate driver statistics', () => {
      const store = useDriverStore();
      const mockDrivers = [
        { id: '1', status: 'available' },
        { id: '2', status: 'busy' },
        { id: '3', status: 'available' },
        { id: '4', status: 'offline' },
      ];
      
      store.$patch({ drivers: mockDrivers });
      const stats = {
        total: mockDrivers.length,
        available: mockDrivers.filter(d => d.status === 'available').length,
        busy: mockDrivers.filter(d => d.status === 'busy').length,
        offline: mockDrivers.filter(d => d.status === 'offline').length,
      };
      expect(stats).toEqual({
        total: 4,
        available: 2,
        busy: 1,
        offline: 1,
      });
    });
  });
}); 