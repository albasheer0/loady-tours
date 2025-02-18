import { defineStore } from 'pinia';
import type { Driver } from '@/types/models';
import type { DriverFilters, PaginationParams } from '@/types/api';
import { driverAPI } from '@/services/api';

interface DriverState {
  drivers: Driver[];
  currentDriver: Driver | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useDriverStore = defineStore('driver', {
  state: (): DriverState => ({
    drivers: [],
    currentDriver: null,
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
    availableDrivers: (state) => state.drivers.filter(d => d.status === 'available'),
    assignedDrivers: (state) => state.drivers.filter(d => d.status === 'assigned'),
    driverById: (state) => (id: string) => state.drivers.find(d => d.id === id),
  },

  actions: {
    async fetchActiveDrivers(city?: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await driverAPI.getAll(
          { limit: 100 }, // Get all available drivers
          { 
            status: 'available',
            ...(city && { city })
          }
        );
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch active drivers';
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchDrivers(
      pagination: Partial<PaginationParams> = {},
      filters: Partial<DriverFilters> = {}
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await driverAPI.getAll(pagination, filters);
        this.drivers = response.data;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch drivers';
      } finally {
        this.loading = false;
      }
    },

    async fetchDriverById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const driver = await driverAPI.getById(id);
        if (driver) {
          this.currentDriver = driver;
          // Update in list if exists
          const index = this.drivers.findIndex(d => d.id === id);
          if (index !== -1) {
            this.drivers[index] = driver;
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch driver';
      } finally {
        this.loading = false;
      }
    },

    async createDriver(driver: Omit<Driver, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newDriver = await driverAPI.create(driver);
        // Refresh the current page after creating
        await this.fetchDrivers({
          page: this.pagination.page,
          limit: this.pagination.limit
        });
        return newDriver;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create driver';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateDriver(id: string, data: Partial<Driver>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedDriver = await driverAPI.update(id, data);
        if (updatedDriver) {
          // Refresh the current page after updating
          await this.fetchDrivers({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return updatedDriver;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update driver';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDriver(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const success = await driverAPI.delete(id);
        if (success) {
          // Refresh the current page after deleting
          await this.fetchDrivers({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return success;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete driver';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 