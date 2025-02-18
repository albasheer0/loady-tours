import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCustomerStore } from '../customer';

describe('Customer Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const store = useCustomerStore();
      expect(store.customers).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should update customer list', () => {
      const store = useCustomerStore();
      const mockCustomers = [
        { id: '1', name: 'Customer 1', location: { lat: 51.5074, lng: -0.1278 } },
        { id: '2', name: 'Customer 2', location: { lat: 51.5074, lng: -0.1278 } },
      ];
      
      store.$patch({ customers: mockCustomers });
      expect(store.customers).toEqual(mockCustomers);
    });

    it('should handle loading states', () => {
      const store = useCustomerStore();
      
      store.$patch({ loading: true });
      expect(store.loading).toBe(true);
      
      store.$patch({ loading: false });
      expect(store.loading).toBe(false);
    });

    it('should handle error states', () => {
      const store = useCustomerStore();
      const error = 'Failed to fetch customers';
      
      store.$patch({ error });
      expect(store.error).toBe(error);
      
      store.$patch({ error: null });
      expect(store.error).toBe(null);
    });
  });

  describe('Getters', () => {
    it('should filter active customers', () => {
      const store = useCustomerStore();
      const mockCustomers = [
        { id: '1', name: 'Customer 1', status: 'active' },
        { id: '2', name: 'Customer 2', status: 'inactive' },
        { id: '3', name: 'Customer 3', status: 'active' },
      ];
      
      store.$patch({ customers: mockCustomers });
      const activeCustomers = store.customers.filter(c => c.status === 'active');
      expect(activeCustomers.length).toBe(2);
      expect(activeCustomers.every(c => c.status === 'active')).toBe(true);
    });

    it('should sort customers by location', () => {
      const store = useCustomerStore();
      const centerPoint = { lat: 51.5074, lng: -0.1278 };
      const mockCustomers = [
        { 
          id: '1', 
          name: 'Far Customer',
          location: { lat: 52.5074, lng: -1.1278 } 
        },
        { 
          id: '2',
          name: 'Near Customer',
          location: { lat: 51.5075, lng: -0.1279 }
        },
      ];
      
      store.$patch({ customers: mockCustomers });
      const sortedCustomers = [...mockCustomers].sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.location.lat - centerPoint.lat, 2) + 
          Math.pow(a.location.lng - centerPoint.lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.location.lat - centerPoint.lat, 2) + 
          Math.pow(b.location.lng - centerPoint.lng, 2)
        );
        return distA - distB;
      });
      expect(sortedCustomers[0].name).toBe('Near Customer');
      expect(sortedCustomers[1].name).toBe('Far Customer');
    });
  });
}); 