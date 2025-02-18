import { defineStore } from 'pinia';
import type { Tour } from '@/types/models';
import type { TourFilters, PaginationParams } from '@/types/api';
import { tourAPI } from '@/services/api';

interface TourState {
  tours: Tour[];
  currentTour: Tour | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useTourStore = defineStore('tour', {
  state: (): TourState => ({
    tours: [],
    currentTour: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  }),

  getters: {
    tourById: (state) => (id: string) => state.tours.find(t => t.id === id),
    toursByStatus: (state) => (status: Tour['status']) => 
      state.tours.filter(t => t.status === status),
    toursByCustomer: (state) => (customerId: string) => 
      state.tours.filter(t => t.customerId === customerId),
    toursByDriver: (state) => (driverId: string) => 
      state.tours.filter(t => t.assignedDriverId === driverId),
    activeTours: (state) => state.tours.filter(t => t.status === 'active'),
    completedTours: (state) => state.tours.filter(t => t.status === 'completed'),
    cancelledTours: (state) => state.tours.filter(t => t.status === 'cancelled'),
  },

  actions: {
    async fetchTours(
      pagination: Partial<PaginationParams> = {},
      filters: Partial<TourFilters> = {}
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await tourAPI.getAll(pagination, filters);
        this.tours = response.data;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tours';
      } finally {
        this.loading = false;
      }
    },

    async fetchTourById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const tour = await tourAPI.getById(id);
        if (tour) {
          this.currentTour = tour;
          // Update in list if exists
          const index = this.tours.findIndex(t => t.id === id);
          if (index !== -1) {
            this.tours[index] = tour;
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tour';
      } finally {
        this.loading = false;
      }
    },

    async createTour(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true;
      this.error = null;
      try {
        const newTour = await tourAPI.create(tour);
        // Refresh the current page after creating
        await this.fetchTours({
          page: this.pagination.page,
          limit: this.pagination.limit
        });
        return newTour;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create tour';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTour(id: string, data: Partial<Tour>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedTour = await tourAPI.update(id, data);
        if (updatedTour) {
          // Refresh the current page after updating
          await this.fetchTours({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return updatedTour;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update tour';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTour(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const success = await tourAPI.delete(id);
        if (success) {
          // Refresh the current page after deleting
          await this.fetchTours({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return success;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete tour';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
}); 