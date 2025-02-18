import type { Driver, Customer, Tour } from '../types/models';
import type { PaginationParams, PaginatedResponse, DriverFilters, CustomerFilters, TourFilters } from '../types/api';
import { mockDrivers, mockCustomers, mockTours } from '../mocks/mockData';
import { paginateData, filterDrivers, filterCustomers, filterTours } from '../utils/apiHelpers';

// Simulated delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage
let drivers = [...mockDrivers];
let customers = [...mockCustomers];
let tours = [...mockTours];

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;

// Driver API
export const driverAPI = {
  async getAll(
    pagination: Partial<PaginationParams> = {},
    filters: Partial<DriverFilters> = {}
  ): Promise<PaginatedResponse<Driver>> {
    await delay(500);
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = pagination;
    let filteredData = filterDrivers(drivers, filters);
    
    const response = paginateData(filteredData, { page, limit });
    return response;
  },

  async getById(id: string): Promise<Driver | undefined> {
    await delay(300);
    return drivers.find(driver => driver.id === id);
  },

  async create(driver: Omit<Driver, 'id'>): Promise<Driver> {
    await delay(500);
    const newDriver = {
      ...driver,
      id: `d${drivers.length + 1}`
    };
    drivers.unshift(newDriver);
    return newDriver;
  },

  async update(id: string, driver: Partial<Driver>): Promise<Driver | undefined> {
    await delay(500);
    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    drivers[index] = { ...drivers[index], ...driver };
    return drivers[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    const initialLength = drivers.length;
    drivers = drivers.filter(driver => driver.id !== id);
    return drivers.length !== initialLength;
  }
};

// Customer API
export const customerAPI = {
  async getAll(
    pagination: Partial<PaginationParams> = {},
    filters: Partial<CustomerFilters> = {}
  ): Promise<PaginatedResponse<Customer>> {
    await delay(500);
    
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = pagination;
    let filteredData = filterCustomers(customers, filters);
    
    const response = paginateData(filteredData, { page, limit });
    return response;
  },

  async getById(id: string): Promise<Customer | undefined> {
    await delay(300);
    return customers.find(customer => customer.id === id);
  },

  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    await delay(500);
    const newCustomer = {
      ...customer,
      id: `c${customers.length + 1}`
    };
    customers.unshift(newCustomer);
    return newCustomer;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    await delay(500);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    customers[index] = { ...customers[index], ...customer };
    return customers[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    const initialLength = customers.length;
    customers = customers.filter(customer => customer.id !== id);
    return customers.length !== initialLength;
  }
};

// Tour API
export const tourAPI = {
  async getAll(
    pagination: Partial<PaginationParams> = {},
    filters: Partial<TourFilters> = {}
  ): Promise<PaginatedResponse<Tour>> {
    await delay(500);
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = pagination;
    let filteredData = filterTours(tours, filters);
    
    const response = paginateData(filteredData, { page, limit });
    return response;
  },

  async getById(id: string): Promise<Tour | undefined> {
    await delay(300);
    return tours.find(tour => tour.id === id);
  },

  async create(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tour> {
    await delay(500);
    const now = new Date().toISOString();
    const newTour = {
      ...tour,
      id: `t${tours.length + 1}`,
      createdAt: now,
      updatedAt: now
    };
    tours.unshift(newTour);
    return newTour;
  },

  async update(id: string, tour: Partial<Tour>): Promise<Tour | undefined> {
    await delay(500);
    const index = tours.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    tours[index] = {
      ...tours[index],
      ...tour,
      updatedAt: new Date().toISOString()
    };
    return tours[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    const initialLength = tours.length;
    tours = tours.filter(tour => tour.id !== id);
    return tours.length !== initialLength;
  }
}; 