import { defineStore } from 'pinia';
import type { Customer } from '@/types/models';
import type { CustomerFilters, PaginationParams } from '@/types/api';
import { customerAPI } from '@/services/api';

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useCustomerStore = defineStore('customer', {
  state: (): CustomerState => ({
    customers: [],
    currentCustomer: null,
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
    customerById: (state) => (id: string) => state.customers.find(c => c.id === id),
    customersByCity: (state) => (city: string) => 
      state.customers.filter(c => c.location.city === city),
  },

  actions: {
    async fetchCustomers(
      pagination: Partial<PaginationParams> = {},
      filters: Partial<CustomerFilters> = {}
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await customerAPI.getAll(pagination, filters);
        this.customers = response.data;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch customers';
      } finally {
        this.loading = false;
      }
    },

    async fetchCustomerById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const customer = await customerAPI.getById(id);
        if (customer) {
          this.currentCustomer = customer;
          // Update in list if exists
          const index = this.customers.findIndex(c => c.id === id);
          if (index !== -1) {
            this.customers[index] = customer;
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch customer';
      } finally {
        this.loading = false;
      }
    },

    async createCustomer(customer: Omit<Customer, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newCustomer = await customerAPI.create(customer);
        // Refresh the current page after creating
        await this.fetchCustomers({
          page: this.pagination.page,
          limit: this.pagination.limit
        });
        return newCustomer;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create customer';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCustomer(id: string, data: Partial<Customer>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedCustomer = await customerAPI.update(id, data);
        if (updatedCustomer) {
          // Refresh the current page after updating
          await this.fetchCustomers({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return updatedCustomer;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update customer';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCustomer(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const success = await customerAPI.delete(id);
        if (success) {
          // Refresh the current page after deleting
          await this.fetchCustomers({
            page: this.pagination.page,
            limit: this.pagination.limit
          });
        }
        return success;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete customer';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 