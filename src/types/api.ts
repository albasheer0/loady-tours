export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DriverFilters {
  status?: 'available' | 'assigned';
  city?: string;
}

export interface CustomerFilters {
  city?: string;
  search?: string; // Will search in name and email
}

export interface TourFilters {
  status?: 'active' | 'completed' | 'cancelled';
  customerId?: string;
  assignedDriverId?: string;
  fromCity?: string;
  toCity?: string;
  dateFrom?: string;
  dateTo?: string;
} 