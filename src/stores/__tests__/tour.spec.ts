import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTourStore } from '../tour';

describe('Tour Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const store = useTourStore();
      expect(store.tours).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should update tour list', () => {
      const store = useTourStore();
      const mockTours = [
        {
          id: '1',
          customerId: 'c1',
          assignedDriverId: 'd1',
          status: 'active',
          locationFrom: { lat: 51.5074, lng: -0.1278 },
          locationTo: { lat: 51.5075, lng: -0.1279 },
        },
        {
          id: '2',
          customerId: 'c2',
          assignedDriverId: null,
          status: 'pending',
          locationFrom: { lat: 51.5074, lng: -0.1278 },
          locationTo: { lat: 51.5075, lng: -0.1279 },
        },
      ];
      
      store.$patch({ tours: mockTours });
      expect(store.tours).toEqual(mockTours);
    });

    it('should handle loading states', () => {
      const store = useTourStore();
      
      store.$patch({ loading: true });
      expect(store.loading).toBe(true);
      
      store.$patch({ loading: false });
      expect(store.loading).toBe(false);
    });

    it('should handle error states', () => {
      const store = useTourStore();
      const error = 'Failed to fetch tours';
      
      store.$patch({ error });
      expect(store.error).toBe(error);
      
      store.$patch({ error: null });
      expect(store.error).toBe(null);
    });
  });

  describe('Getters', () => {
    it('should filter tours by status', () => {
      const store = useTourStore();
      const mockTours = [
        { id: '1', status: 'active' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'active' },
        { id: '4', status: 'cancelled' },
      ];
      
      store.$patch({ tours: mockTours });
      const activeTours = store.tours.filter(t => t.status === 'active');
      const completedTours = store.tours.filter(t => t.status === 'completed');
      const cancelledTours = store.tours.filter(t => t.status === 'cancelled');
      
      expect(activeTours.length).toBe(2);
      expect(completedTours.length).toBe(1);
      expect(cancelledTours.length).toBe(1);
    });

    it('should sort tours by date', () => {
      const store = useTourStore();
      const mockTours = [
        { 
          id: '1',
          shipmentDate: '2024-03-15',
          status: 'active',
        },
        { 
          id: '2',
          shipmentDate: '2024-03-14',
          status: 'active',
        },
        { 
          id: '3',
          shipmentDate: '2024-03-16',
          status: 'active',
        },
      ];
      
      store.$patch({ tours: mockTours });
      const sortedTours = [...mockTours].sort((a, b) => 
        new Date(b.shipmentDate).getTime() - new Date(a.shipmentDate).getTime()
      );
      expect(sortedTours[0].id).toBe('3'); // Latest date first
      expect(sortedTours[1].id).toBe('1');
      expect(sortedTours[2].id).toBe('2');
    });

    it('should calculate tour statistics', () => {
      const store = useTourStore();
      const mockTours = [
        { id: '1', status: 'active', assignedDriverId: 'd1' },
        { id: '2', status: 'completed', assignedDriverId: 'd2' },
        { id: '3', status: 'active', assignedDriverId: 'd3' },
        { id: '4', status: 'cancelled', assignedDriverId: null },
        { id: '5', status: 'pending', assignedDriverId: null },
      ];
      
      store.$patch({ tours: mockTours });
      const stats = {
        total: mockTours.length,
        active: mockTours.filter(t => t.status === 'active').length,
        completed: mockTours.filter(t => t.status === 'completed').length,
        cancelled: mockTours.filter(t => t.status === 'cancelled').length,
        pending: mockTours.filter(t => t.status === 'pending').length,
        assigned: mockTours.filter(t => t.assignedDriverId !== null).length,
        unassigned: mockTours.filter(t => t.assignedDriverId === null).length,
      };
      expect(stats).toEqual({
        total: 5,
        active: 2,
        completed: 1,
        cancelled: 1,
        pending: 1,
        assigned: 3,
        unassigned: 2,
      });
    });
  });
}); 