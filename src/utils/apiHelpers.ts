import type { PaginationParams, PaginatedResponse } from '../types/api';

export function paginateData<T>(
  data: T[],
  { page, limit }: PaginationParams
): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);
  const startIndex = (validPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedData = data.slice(startIndex, endIndex);


  return {
    data: paginatedData,
    total,
    page: validPage,
    limit,
    totalPages,
  };
}

export function filterDrivers(drivers: any[], filters: any) {
  return drivers.filter((driver) => {
    if (filters.status && driver.status !== filters.status) {
      return false;
    }
    if (filters.city && driver.location.city !== filters.city) {
      return false;
    }
    return true;
  });
}

export function filterCustomers(customers: any[], filters: any) {
  return customers.filter((customer) => {
    if (filters.city && customer.location.city !== filters.city) {
      return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });
}

export function filterTours(tours: any[], filters: any) {
  return tours.filter((tour) => {
    if (filters.status && tour.status !== filters.status) {
      return false;
    }
    if (filters.customerId && tour.customerId !== filters.customerId) {
      return false;
    }
    if (filters.assignedDriverId && tour.assignedDriverId !== filters.assignedDriverId) {
      return false;
    }
    if (filters.fromCity && tour.locationFrom.city !== filters.fromCity) {
      return false;
    }
    if (filters.toCity && tour.locationTo.city !== filters.toCity) {
      return false;
    }
    if (filters.dateFrom || filters.dateTo) {
      const tourDate = new Date(tour.shipmentDate);
      if (filters.dateFrom && tourDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && tourDate > new Date(filters.dateTo)) {
        return false;
      }
    }
    return true;
  });
} 